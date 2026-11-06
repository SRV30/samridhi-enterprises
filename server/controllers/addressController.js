import Address from "../models/addressModel.js";
import User from "../models/userModel.js";
import catchAsyncErrors from "../middleware/catchAsyncErrors.js";
import ErrorHandler from "../utils/errorHandler.js";
import { runInTransaction } from "../utils/transactionSessionManager.js";

const REQUIRED_FIELDS = ["fullName", "phone", "addressLine", "city", "pincode"];
const missingFields = (body) =>
  REQUIRED_FIELDS.filter((field) => !body[field] || !String(body[field]).trim());

// A write to the owning user document serializes address mutations for the same
// account. MongoDB transaction retries then resolve concurrent default changes.
const lockUserAddressWrites = async (userId, session) => {
  const result = await User.updateOne(
    { _id: userId },
    { $inc: { addressMutationVersion: 1 } },
    { session }
  );
  if (!result.matchedCount) throw new ErrorHandler("User not found", 404);
};

export const getMyAddresses = catchAsyncErrors(async (req, res) => {
  const addresses = await Address.find({ user: req.user._id }).sort({
    isDefault: -1,
    createdAt: -1,
  });
  res.sendSuccess({ addresses });
});

export const addAddress = catchAsyncErrors(async (req, res, next) => {
  const { label, fullName, phone, addressLine, city, state, pincode, isDefault } = req.body;
  const missing = missingFields(req.body);
  if (missing.length) {
    return next(new ErrorHandler("Missing required fields: " + missing.join(", "), 400));
  }

  const address = await runInTransaction(async (session) => {
    await lockUserAddressWrites(req.user._id, session);
    const count = await Address.countDocuments({ user: req.user._id }).session(session);
    const makeDefault = isDefault === true || count === 0;

    if (makeDefault) {
      await Address.updateMany(
        { user: req.user._id, isDefault: true },
        { $set: { isDefault: false } },
        { session }
      );
    }

    const created = new Address({
      user: req.user._id,
      label: label || "",
      fullName,
      phone,
      addressLine,
      city,
      state: state || "",
      pincode,
      isDefault: makeDefault,
    });
    await created.save({ session });
    await User.findByIdAndUpdate(
      req.user._id,
      { $push: { addressDetails: created._id } },
      { session }
    );
    return created;
  });

  res.sendSuccess({ address }, 201);
});

export const updateAddress = catchAsyncErrors(async (req, res) => {
  const address = await runInTransaction(async (session) => {
    await lockUserAddressWrites(req.user._id, session);
    const current = await Address.findById(req.params.id).session(session);
    if (!current) throw new ErrorHandler("Address not found", 404);
    if (current.user.toString() !== req.user._id.toString()) {
      throw new ErrorHandler("Not authorized to edit this address", 403);
    }

    for (const field of REQUIRED_FIELDS) {
      if (req.body[field] !== undefined && !String(req.body[field]).trim()) {
        throw new ErrorHandler(field + " cannot be empty", 400);
      }
    }

    const { label, fullName, phone, addressLine, city, state, pincode, isDefault } = req.body;
    if (label !== undefined) current.label = label;
    if (fullName !== undefined) current.fullName = fullName;
    if (phone !== undefined) current.phone = phone;
    if (addressLine !== undefined) current.addressLine = addressLine;
    if (city !== undefined) current.city = city;
    if (state !== undefined) current.state = state;
    if (pincode !== undefined) current.pincode = pincode;

    if (isDefault === true && !current.isDefault) {
      await Address.updateMany(
        { user: req.user._id, isDefault: true },
        { $set: { isDefault: false } },
        { session }
      );
      current.isDefault = true;
    }

    await current.save({ session });
    return current;
  });
  res.sendSuccess({ address });
});

export const deleteAddress = catchAsyncErrors(async (req, res) => {
  await runInTransaction(async (session) => {
    await lockUserAddressWrites(req.user._id, session);
    const address = await Address.findById(req.params.id).session(session);
    if (!address) throw new ErrorHandler("Address not found", 404);
    if (address.user.toString() !== req.user._id.toString()) {
      throw new ErrorHandler("Not authorized to delete this address", 403);
    }

    const wasDefault = address.isDefault;
    await address.deleteOne({ session });
    await User.findByIdAndUpdate(
      req.user._id,
      { $pull: { addressDetails: address._id } },
      { session }
    );

    if (wasDefault) {
      const nextAddress = await Address.findOne({ user: req.user._id })
        .sort({ createdAt: -1 })
        .session(session);
      if (nextAddress) {
        nextAddress.isDefault = true;
        await nextAddress.save({ session });
      }
    }
  });
  res.sendSuccess({ message: "Address deleted" });
});

export const setDefaultAddress = catchAsyncErrors(async (req, res) => {
  const address = await runInTransaction(async (session) => {
    await lockUserAddressWrites(req.user._id, session);
    const current = await Address.findById(req.params.id).session(session);
    if (!current) throw new ErrorHandler("Address not found", 404);
    if (current.user.toString() !== req.user._id.toString()) {
      throw new ErrorHandler("Not authorized to modify this address", 403);
    }

    await Address.updateMany(
      { user: req.user._id, isDefault: true },
      { $set: { isDefault: false } },
      { session }
    );
    current.isDefault = true;
    await current.save({ session });
    return current;
  });
  res.sendSuccess({ address });
});
