import mongoose from "mongoose";

const garageSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User is required"],
      index: true,
    },
    bikeModel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BikeModel",
      required: [true, "Bike model is required"],
    },
    year: {
      type: Number,
      required: [true, "Year is required"],
      min: [1980, "Year must be 1980 or later"],
      max: [2030, "Year must be 2030 or earlier"],
    },
    variant: {
      type: String,
      trim: true,
      maxlength: [100, "Variant cannot exceed 100 characters"],
    },
    features: {
      type: String,
      trim: true,
      maxlength: [500, "Features description cannot exceed 500 characters"],
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

garageSchema.index({ user: 1, isDefault: 1 });
garageSchema.index({ user: 1, bikeModel: 1 });

export default mongoose.model("Garage", garageSchema);

// Ensured compound index on user and isDefault to avoid concurrent multi-default entries
