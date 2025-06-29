import mongoose from "mongoose";

const bikeModelSchema = new mongoose.Schema({
  name: { type: String, required: true },
  brand: { type: mongoose.Schema.Types.ObjectId, ref: "Brand", required: true },
  images: [
    {
      public_id: {
        type: String,
        required: true,
      },
      url: {
        type: String,
        required: true,
      },
    },
  ],
});

export default mongoose.model("BikeModel", bikeModelSchema);
