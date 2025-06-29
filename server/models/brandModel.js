import mongoose from "mongoose";

const brandSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
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

export default mongoose.model("Brand", brandSchema);
