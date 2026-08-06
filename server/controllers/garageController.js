import Garage from "../models/garageModel.js";
import catchAsyncErrors from "../middleware/catchAsyncErrors.js";
import ErrorHandler from "../utils/errorHandler.js";

export const addVehicle = catchAsyncErrors(async (req, res, next) => {
  const { bikeModel, year, variant, features, isDefault } = req.body;

  if (!bikeModel || !year) {
    return next(new ErrorHandler("Bike model and year are required", 400));
  }

  if (isDefault) {
    await Garage.updateMany({ user: req.user._id }, { isDefault: false });
  }

  const existingCount = await Garage.countDocuments({ user: req.user._id });
  if (existingCount >= 10) {
    return next(
      new ErrorHandler("Maximum 10 vehicles allowed in your garage", 400)
    );
  }

  const vehicle = await Garage.create({
    user: req.user._id,
    bikeModel,
    year,
    variant,
    features,
    isDefault: existingCount === 0 ? true : !!isDefault,
  });

  res.sendSuccess({ vehicle }, 201);
});

export const getVehicles = catchAsyncErrors(async (req, res, next) => {
  const vehicles = await Garage.find({ user: req.user._id })
    .populate("bikeModel", "name yearStart yearEnd engineType images")
    .sort({ isDefault: -1, createdAt: -1 });

  res.sendSuccess({ vehicles });
});

export const updateVehicle = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  const { bikeModel, year, variant, features, isDefault } = req.body;

  const vehicle = await Garage.findOne({ _id: id, user: req.user._id });
  if (!vehicle) {
    return next(new ErrorHandler("Vehicle not found in your garage", 404));
  }

  if (isDefault) {
    await Garage.updateMany(
      { _id: { $ne: id }, user: req.user._id },
      { isDefault: false }
    );
  }

  const updated = await Garage.findByIdAndUpdate(
    id,
    { bikeModel, year, variant, features, isDefault },
    { new: true, runValidators: true }
  );

  res.sendSuccess({ vehicle: updated });
});

export const deleteVehicle = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;

  const vehicle = await Garage.findOneAndDelete({
    _id: id,
    user: req.user._id,
  });
  if (!vehicle) {
    return next(new ErrorHandler("Vehicle not found in your garage", 404));
  }

  const remaining = await Garage.countDocuments({ user: req.user._id });
  if (remaining > 0) {
    const hasDefault = await Garage.findOne({
      user: req.user._id,
      isDefault: true,
    });
    if (!hasDefault) {
      await Garage.findOneAndUpdate(
        { user: req.user._id },
        { isDefault: true },
        { sort: { createdAt: 1 } }
      );
    }
  }

  res.sendSuccess({ message: "Vehicle removed from garage" });
});

export const setDefaultVehicle = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;

  const vehicle = await Garage.findOne({ _id: id, user: req.user._id });
  if (!vehicle) {
    return next(new ErrorHandler("Vehicle not found in your garage", 404));
  }

  await Garage.updateMany({ user: req.user._id }, { isDefault: false });
  vehicle.isDefault = true;
  await vehicle.save();

  res.sendSuccess({ vehicle });
});
