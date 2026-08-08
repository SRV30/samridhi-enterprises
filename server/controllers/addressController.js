import { resolveDefaultStatus } from '../utils/defaultStatusResolver.js';
import Address from "../models/addressModel.js";
import User from "../models/userModel.js";
import catchAsyncErrors from "../middleware/catchAsyncErrors.js";
import ErrorHandler from "../utils/errorHandler.js";

const REQUIRED_FIELDS = ["fullName", "phone", "addressLine", "city", "pincode"];

const missingFields = (body) =>
  REQUIRED_FIELDS.filter((f) => !body[f] || !String(body[f]).trim());

// ── Get all addresses for the logged-in user (default first) ──────────────
export const getMyAddresses = catchAsyncErrors(async (req, res) => {
  const addresses = await Address.find({ user: req.user._id }).sort({
    isDefault: -1,
    createdAt: -1,
  });
  res.sendSuccess({ addresses });
});

// ── Add a new address ─────────────────────────────────────────────────────
export const addAddress = catchAsyncErrors(async (req, res, next) => {
  const { label, fullName, phone, addressLine, city, state, pincode, isDefault } =
    req.body;

  const missing = missingFields(req.body);
  if (missing.length > 0) {
    return next(
      new ErrorHandler(`Missing required fields: ${missing.join(", ")}`, 400)
    );
  }

  // The first address a user adds becomes their default automatically.
  const existingCount = await Address.countDocuments({ user: req.user._id });
  const makeDefault = isDefault === true || existingCount === 0;

  // If this one is to be the default, clear the flag on the others first.
  if (makeDefault) {
    await resolveDefaultStatus(Address, req.user._id, null);
  }

  const address = await Address.create({
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

  // Keep the user's addressDetails list in sync with the address collection.
  await User.findByIdAndUpdate(req.user._id, {
    $push: { addressDetails: address._id },
  });

  res.sendSuccess({ address }, 201);
});

// ── Update an existing address ────────────────────────────────────────────
export const updateAddress = catchAsyncErrors(async (req, res, next) => {
  const address = await Address.findById(req.params.id);
  if (!address) return next(new ErrorHandler("Address not found", 404));

  // Ownership guard: a user may only edit their own addresses.
  if (address.user.toString() !== req.user._id.toString()) {
    return next(new ErrorHandler("Not authorized to edit this address", 403));
  }

  const { label, fullName, phone, addressLine, city, state, pincode, isDefault } =
    req.body;

  // Validate only the fields that are being changed.
  for (const f of REQUIRED_FIELDS) {
    if (req.body[f] !== undefined && !String(req.body[f]).trim()) {
      return next(new ErrorHandler(`${f} cannot be empty`, 400));
    }
  }

  if (label !== undefined) address.label = label;
  if (fullName !== undefined) address.fullName = fullName;
  if (phone !== undefined) address.phone = phone;
  if (addressLine !== undefined) address.addressLine = addressLine;
  if (city !== undefined) address.city = city;
  if (state !== undefined) address.state = state;
  if (pincode !== undefined) address.pincode = pincode;

  // Promoting this address to default clears the flag on the user's others.
  if (isDefault === true && !address.isDefault) {
    await Address.updateMany(
      { user: req.user._id, isDefault: true },
      { isDefault: false }
    );
    address.isDefault = true;
  }

  await address.save();
  res.sendSuccess({ address });
});

// ── Delete an address ─────────────────────────────────────────────────────
export const deleteAddress = catchAsyncErrors(async (req, res, next) => {
  const address = await Address.findById(req.params.id);
  if (!address) return next(new ErrorHandler("Address not found", 404));

  if (address.user.toString() !== req.user._id.toString()) {
    return next(new ErrorHandler("Not authorized to delete this address", 403));
  }

  const wasDefault = address.isDefault;
  await address.deleteOne();

  // Remove the reference from the user's addressDetails list.
  await User.findByIdAndUpdate(req.user._id, {
    $pull: { addressDetails: address._id },
  });

  // If the deleted address was the default, promote the most recent remaining
  // address so the user always has a default when they have any addresses.
  if (wasDefault) {
    const next = await Address.findOne({ user: req.user._id }).sort({
      createdAt: -1,
    });
    if (next) {
      next.isDefault = true;
      await next.save();
    }
  }

  res.sendSuccess({ message: "Address deleted" });
});

// ── Set an address as the default ─────────────────────────────────────────
export const setDefaultAddress = catchAsyncErrors(async (req, res, next) => {
  const address = await Address.findById(req.params.id);
  if (!address) return next(new ErrorHandler("Address not found", 404));

  if (address.user.toString() !== req.user._id.toString()) {
    return next(new ErrorHandler("Not authorized to modify this address", 403));
  }

  await Address.updateMany(
    { user: req.user._id, isDefault: true },
    { isDefault: false }
  );
  address.isDefault = true;
  await address.save();

  res.sendSuccess({ address });
});
