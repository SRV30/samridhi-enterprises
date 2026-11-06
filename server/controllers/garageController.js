import Garage from "../models/garageModel.js";
import User from "../models/userModel.js";
import catchAsyncErrors from "../middleware/catchAsyncErrors.js";
import ErrorHandler from "../utils/errorHandler.js";
import { runInTransaction } from "../utils/transactionSessionManager.js";

const lockGarageWrites = async (userId, session) => {
  const result = await User.updateOne(
    { _id: userId },
    { $inc: { garageMutationVersion: 1 } },
    { session }
  );
  if (!result.matchedCount) throw new ErrorHandler("User not found", 404);
};

export const addVehicle = catchAsyncErrors(async (req, res, next) => {
  const { bikeModel, year, variant, features, isDefault } = req.body;
  if (!bikeModel || !year) {
    return next(new ErrorHandler("Bike model and year are required", 400));
  }

  const vehicle = await runInTransaction(async (session) => {
    await lockGarageWrites(req.user._id, session);
    const existingCount = await Garage.countDocuments({ user: req.user._id }).session(session);
    if (existingCount >= 10) {
      throw new ErrorHandler("Maximum 10 vehicles allowed in your garage", 400);
    }

    const makeDefault = isDefault === true || isDefault === "true" || existingCount === 0;
    if (makeDefault) {
      await Garage.updateMany(
        { user: req.user._id, isDefault: true },
        { $set: { isDefault: false } },
        { session }
      );
    }

    const created = new Garage({
      user: req.user._id,
      bikeModel,
      year,
      variant,
      features,
      isDefault: makeDefault,
    });
    await created.save({ session });
    return created;
  });

  res.sendSuccess({ vehicle }, 201);
});

export const getVehicles = catchAsyncErrors(async (req, res) => {
  const vehicles = await Garage.find({ user: req.user._id })
    .populate("bikeModel", "name yearStart yearEnd engineType images")
    .sort({ isDefault: -1, createdAt: -1 });
  res.sendSuccess({ vehicles });
});

export const updateVehicle = catchAsyncErrors(async (req, res) => {
  const { id } = req.params;
  const { bikeModel, year, variant, features, isDefault } = req.body;

  const vehicle = await runInTransaction(async (session) => {
    await lockGarageWrites(req.user._id, session);
    const current = await Garage.findOne({ _id: id, user: req.user._id }).session(session);
    if (!current) throw new ErrorHandler("Vehicle not found in your garage", 404);

    const shouldBeDefault = isDefault === true || isDefault === "true";
    if (shouldBeDefault && !current.isDefault) {
      await Garage.updateMany(
        { _id: { $ne: id }, user: req.user._id, isDefault: true },
        { $set: { isDefault: false } },
        { session }
      );
    }

    if (bikeModel !== undefined) current.bikeModel = bikeModel;
    if (year !== undefined) current.year = year;
    if (variant !== undefined) current.variant = variant;
    if (features !== undefined) current.features = features;
    if (isDefault !== undefined) current.isDefault = shouldBeDefault;
    await current.save({ session });
    return current;
  });

  res.sendSuccess({ vehicle });
});

export const deleteVehicle = catchAsyncErrors(async (req, res) => {
  await runInTransaction(async (session) => {
    await lockGarageWrites(req.user._id, session);
    const vehicle = await Garage.findOne({ _id: req.params.id, user: req.user._id }).session(session);
    if (!vehicle) throw new ErrorHandler("Vehicle not found in your garage", 404);

    const wasDefault = vehicle.isDefault;
    await vehicle.deleteOne({ session });

    if (wasDefault) {
      const nextVehicle = await Garage.findOne({ user: req.user._id })
        .sort({ createdAt: 1 })
        .session(session);
      if (nextVehicle) {
        nextVehicle.isDefault = true;
        await nextVehicle.save({ session });
      }
    }
  });

  res.sendSuccess({ message: "Vehicle removed from garage" });
});

export const setDefaultVehicle = catchAsyncErrors(async (req, res) => {
  const vehicle = await runInTransaction(async (session) => {
    await lockGarageWrites(req.user._id, session);
    const current = await Garage.findOne({ _id: req.params.id, user: req.user._id }).session(session);
    if (!current) throw new ErrorHandler("Vehicle not found in your garage", 404);

    await Garage.updateMany(
      { user: req.user._id, isDefault: true },
      { $set: { isDefault: false } },
      { session }
    );
    current.isDefault = true;
    await current.save({ session });
    return current;
  });

  res.sendSuccess({ vehicle });
});
