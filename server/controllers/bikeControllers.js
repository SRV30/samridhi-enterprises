import BikeModel from "../models/bikeModel.js";
import Brand from "../models/brandModel.js";
import catchAsyncErrors from "../middleware/catchAsyncErrors.js";
import ErrorHandler from "../utils/errorHandler.js";
import { uploadImage, deleteImage } from "../utils/cloudinary.js";

export const addBikeModel = catchAsyncErrors(async (req, res, next) => {
  const { name, brand } = req.body;

  const existing = await BikeModel.findOne({ name, brand });
  if (existing) {
    return next(new ErrorHandler("Bike model already exists", 400));
  }

  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: "No image file provided",
    });
  }

  const upload = await uploadImage(req.file);
  if (!upload || !upload.url) {
    return res.status(500).json({
      success: false,
      message: "Image upload failed",
    });
  }

  const newBikeModel = await BikeModel.create({
    name,
    brand,
    images: [
      {
        public_id: upload.public_id,
        url: upload.secure_url,
      },
    ],
  });

  res.status(201).json({
    success: true,
    message: "Bike model created successfully",
    bikeModel: newBikeModel,
  });
});

export const getAllBikeModels = catchAsyncErrors(async (req, res, next) => {
  const models = await BikeModel.find().populate("brand", "name");
  res.status(200).json({
    success: true,
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

  if (req.file) {
    if (bikeModel.images.length > 0) {
      for (const img of bikeModel.images) {
        await deleteImage(img.public_id);
      }
    }

    const upload = await uploadImage(req.file);
    if (!upload || !upload.url) {
      return res.status(500).json({
        success: false,
        message: "Image upload failed",
      });
    }

    bikeModel.images = [
      {
        public_id: upload.public_id,
        url: upload.secure_url,
      },
    ];
  }

  await bikeModel.save();

  res.status(200).json({
    success: true,
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

  res.status(200).json({
    success: true,
    message: "Bike model deleted successfully",
  });
});
