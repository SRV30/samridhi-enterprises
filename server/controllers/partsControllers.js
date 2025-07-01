import Part from "../models/partModel.js";
import BikeModel from "../models/bikeModel.js";
import catchAsyncErrors from "../middleware/catchAsyncErrors.js";
import ErrorHandler from "../utils/errorHandler.js";
import { uploadImage, deleteImage } from "../utils/cloudinary.js";

// Create a new part
export const addPart = catchAsyncErrors(async (req, res, next) => {
  const { product_id, name, description, price, stock, vehicleCompatibility, category, bestseller } = req.body;

  if (!req.files || req.files.length === 0) {
    return next(new ErrorHandler("At least one image is required", 400));
  }

  const images = [];
  for (const file of req.files) {
    const upload = await uploadImage(file);
    if (!upload?.secure_url) {
      return next(new ErrorHandler("Image upload failed", 500));
    }
    images.push({ public_id: upload.public_id, url: upload.secure_url });
  }

  const part = await Part.create({
    product_id,
    name,
    description,
    price,
    stock,
    category,
    vehicleCompatibility: vehicleCompatibility || [],
    images,
    bestseller: bestseller === "true" || bestseller === true,
  });

  res.status(201).json({ success: true, part });
});

// Get all parts
export const getAllParts = catchAsyncErrors(async (req, res) => {
  const parts = await Part.find().populate("vehicleCompatibility", "name");
  res.status(200).json({ success: true, count: parts.length, parts });
});

// Get single part
export const getPartById = catchAsyncErrors(async (req, res, next) => {
  const part = await Part.findById(req.params.id).populate("vehicleCompatibility", "name");
  if (!part) return next(new ErrorHandler("Part not found", 404));
  res.status(200).json({ success: true, part });
});

// Update part
export const updatePart = catchAsyncErrors(async (req, res, next) => {
  const part = await Part.findById(req.params.id);
  if (!part) return next(new ErrorHandler("Part not found", 404));

  const fieldsToUpdate = ["product_id", "name", "description", "price", "stock", "category", "vehicleCompatibility", "bestseller"];
  fieldsToUpdate.forEach((field) => {
    if (req.body[field] !== undefined) {
      part[field] = field === "bestseller" ? req.body[field] === "true" || req.body[field] === true : req.body[field];
    }
  });

  if (req.files && req.files.length > 0) {
    // Delete existing images
    for (const img of part.images) {
      await deleteImage(img.public_id);
    }

    // Upload new images
    const images = [];
    for (const file of req.files) {
      const upload = await uploadImage(file);
      if (!upload?.secure_url) {
        return next(new ErrorHandler("Image upload failed", 500));
      }
      images.push({ public_id: upload.public_id, url: upload.secure_url });
    }
    part.images = images;
  }

  await part.save();
  res.status(200).json({ success: true, message: "Part updated", part });
});

// Delete part
export const deletePart = catchAsyncErrors(async (req, res, next) => {
  const part = await Part.findById(req.params.id);
  if (!part) return next(new ErrorHandler("Part not found", 404));

  for (const img of part.images) {
    await deleteImage(img.public_id);
  }

  await part.deleteOne();
  res.status(200).json({ success: true, message: "Part deleted" });
});

// Add or update review
export const createOrUpdateReview = catchAsyncErrors(async (req, res, next) => {
  const { rating, comment } = req.body;
  const part = await Part.findById(req.params.id);
  if (!part) return next(new ErrorHandler("Part not found", 404));

  const existingReviewIndex = part.reviews.findIndex(
    (r) => r.user.toString() === req.user._id.toString()
  );

  if (existingReviewIndex !== -1) {
    part.reviews[existingReviewIndex].comment = comment;
    part.reviews[existingReviewIndex].rating = Number(rating);
  } else {
    part.reviews.push({ user: req.user._id, name: req.user.name, rating: Number(rating), comment });
  }

  part.numOfReviews = part.reviews.length;
  part.ratings = part.reviews.length
    ? part.reviews.reduce((sum, r) => sum + r.rating, 0) / part.reviews.length
    : 0;

  await part.save();
  res.status(200).json({ success: true, message: "Review submitted" });
});

// Delete review
export const deleteReview = catchAsyncErrors(async (req, res, next) => {
  const part = await Part.findById(req.params.id);
  if (!part) return next(new ErrorHandler("Part not found", 404));

  part.reviews = part.reviews.filter((r) => r.user.toString() !== req.user._id.toString());
  part.numOfReviews = part.reviews.length;
  part.ratings = part.reviews.length
    ? part.reviews.reduce((sum, r) => sum + r.rating, 0) / part.reviews.length
    : 0;

  await part.save();
  res.status(200).json({ success: true, message: "Review removed" });
});