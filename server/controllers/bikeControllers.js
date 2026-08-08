import { resolveDefaultStatus } from '../utils/defaultStatusResolver.js';
import BikeModel from "../models/bikeModel.js";
import Brand from "../models/brandModel.js";
import catchAsyncErrors from "../middleware/catchAsyncErrors.js";
import ErrorHandler from "../utils/errorHandler.js";
import { uploadImage, deleteImage } from "../utils/cloudinary.js";

// Coerce an incoming year value (which arrives as a string via multipart form
// data) into a number. Empty or invalid input becomes null, meaning "no year
// constraint" rather than 0.
const parseYear = (value) => {
  if (value === undefined || value === null || value === "") return null;
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
};

export const addBikeModel = catchAsyncErrors(async (req, res, next) => {
  const { name, brand, engineType } = req.body;
  const yearStart = parseYear(req.body.yearStart);
  const yearEnd = parseYear(req.body.yearEnd);

  if (yearStart !== null && yearEnd !== null && yearStart > yearEnd) {
    return next(
      new ErrorHandler("Start year cannot be later than end year", 400)
    );
  }

  const existing = await BikeModel.findOne({ name, brand });
  if (existing) {
    return next(new ErrorHandler("Bike model already exists", 400));
  }

  if (!req.file) {
    return next(new ErrorHandler("No image file provided", 400));
  }

  const upload = await uploadImage(req.file);
  if (!upload || !upload.url) {
    return next(new ErrorHandler("Image upload failed", 500));
  }

  const newBikeModel = await BikeModel.create({
    name,
    brand,
    yearStart,
    yearEnd,
    engineType: (engineType || "").trim(),
    images: [
      {
        public_id: upload.public_id,
        url: upload.secure_url,
      },
    ],
  });

  res.sendSuccess({
    message: "Bike model created successfully",
    bikeModel: newBikeModel,
  }, 201);
});

export const getAllBikeModels = catchAsyncErrors(async (req, res, next) => {
  const models = await BikeModel.find().populate("brand", "name");
  res.sendSuccess({
    count: models.length,
    bikeModels: models,
  });
});

export const updateBikeModel = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  const bikeModel = await BikeModel.findById(id);

  if (!bikeModel) {
    return next(new ErrorHandler("Bike model not found", 404));
  }

  if (req.body.name) {
    bikeModel.name = req.body.name;
  }

  if (req.body.brand) {
    bikeModel.brand = req.body.brand;
  }

  if (req.body.yearStart !== undefined) {
    bikeModel.yearStart = parseYear(req.body.yearStart);
  }

  if (req.body.yearEnd !== undefined) {
    bikeModel.yearEnd = parseYear(req.body.yearEnd);
  }

  if (
    bikeModel.yearStart !== null &&
    bikeModel.yearStart !== undefined &&
    bikeModel.yearEnd !== null &&
    bikeModel.yearEnd !== undefined &&
    bikeModel.yearStart > bikeModel.yearEnd
  ) {
    return next(
      new ErrorHandler("Start year cannot be later than end year", 400)
    );
  }

  if (req.body.engineType !== undefined) {
    bikeModel.engineType = (req.body.engineType || "").trim();
  }

  if (req.file) {
    if (bikeModel.images.length > 0) {
      for (const img of bikeModel.images) {
        await deleteImage(img.public_id);
      }
    }

    const upload = await uploadImage(req.file);
    if (!upload || !upload.url) {
      return next(new ErrorHandler("Image upload failed", 500));
    }

    bikeModel.images = [
      {
        public_id: upload.public_id,
        url: upload.secure_url,
      },
    ];
  }

  await bikeModel.save();

  res.sendSuccess({
    message: "Bike model updated successfully",
    bikeModel,
  });
});

export const deleteBikeModel = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  const bikeModel = await BikeModel.findById(id);

  if (!bikeModel) {
    return next(new ErrorHandler("Bike model not found", 404));
  }

  if (bikeModel.images.length > 0) {
    for (const img of bikeModel.images) {
      await deleteImage(img.public_id);
    }
  }

  await bikeModel.deleteOne();

  res.sendSuccess({
    message: "Bike model deleted successfully",
  });
});
