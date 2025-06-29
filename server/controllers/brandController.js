import Brand from "../models/brandModel.js";
import catchAsyncErrors from "../middleware/catchAsyncErrors.js";
import ErrorHandler from "../utils/errorHandler.js";
import { uploadImage, deleteImage } from "../utils/cloudinary.js";

export const addBrand = catchAsyncErrors(async (req, res, next) => {
  const { name } = req.body;

  const existing = await Brand.findOne({ name });
  if (existing) {
    return next(new ErrorHandler("Brand already exists", 400));
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

  const newBrand = await Brand.create({
    name,
    images: [
      {
        public_id: upload.public_id,
        url: upload.secure_url,
      },
    ],
  });

  res.status(201).json({
    success: true,
    message: "Brand created successfully",
    brand: newBrand,
  });
});

export const getAllBrands = catchAsyncErrors(async (req, res, next) => {
  const brands = await Brand.find();
  res.status(200).json({
    success: true,
    count: brands.length,
    brands,
  });
});

export const updateBrand = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  const brand = await Brand.findById(id);

  if (!brand) {
    return next(new ErrorHandler("Brand not found", 404));
  }

  if (req.body.name) {
    brand.name = req.body.name;
  }

  if (req.file) {
    if (brand.images.length > 0) {
      for (const img of brand.images) {
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

    brand.images = [
      {
        public_id: upload.public_id,
        url: upload.secure_url,
      },
    ];
  }

  await brand.save();

  res.status(200).json({
    success: true,
    message: "Brand updated successfully",
    brand,
  });
});

export const deleteBrand = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;

  const brand = await Brand.findById(id);
  if (!brand) {
    return next(new ErrorHandler("Brand not found", 404));
  }

  if (brand.images.length > 0) {
    for (const img of brand.images) {
      await deleteImage(img.public_id);
    }
  }

  await brand.deleteOne();

  res.status(200).json({
    success: true,
    message: "Brand deleted successfully",
  });
});
