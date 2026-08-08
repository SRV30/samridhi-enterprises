import mongoose from "mongoose";

const partSchema = new mongoose.Schema(
  {
    product_id: {
      type: String,
      required: [true, "Please Enter Product Id"],
    },
    name: { type: String, required: true },
    description: String,

    warehouseStocks: [{
      warehouse: { type: mongoose.Schema.Types.ObjectId, ref: "Warehouse" },
      stockQuantity: { type: Number, default: 0 }
    }],
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    stock: {
      type: Number,
      required: true,
      default: 1,
      min: 0,
    },
    lowStockThreshold: {
      type: Number,
      default: 5,
    },

    vehicleCompatibility: [
      { type: mongoose.Schema.Types.ObjectId, ref: "BikeModel" },
    ],

    ratings: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    category: {
      type: String,
      required: true,
      enum: [
        "Abs",
        "Belt Drive",
        "Bearing Kit",
        "BSVI Products",
        "Brake Switch",
        "CDEI",
        "C.D.I",
        "Consumable Filters",
        "Drum / Drum Plate / Coupling Hub / Wheel Rim",
        "Electronic Relay",
        "Filters & Horn",
        "Footrest Bracket",
        "Other Products (Cylinder Kit / Fuse Blade)",
        "Flasher / Buzzer",
        "Floor Set / Speedo Gear",
        "Fuel Items",
        "Lever & Yoke",
        "Varroc Oil / Grease",
        "Handle Bar Switch / Handle Bar Weigth",
        "Ignition Coil",
        "Insulator For Carburetor",
        "Lighting Products",
        "Magneto Assembly & Spares",
        "Modular Switch",
        "Oring",
        "Other (Oil Pump Gear / Clutch Roller / Plug Cap)",
        "Oil Seal Kit",
        "Gaskets",
        "Rear View Mirror",
        "Regulator Rectifier (R.R.)",
        "Rubber Items",
        "Relay",
        "Switches / Locks",
        "Starter Moter & Spares",
        "Speedo Gear",
        "TPSR / Swing Arm Assly",
      ],
    },
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
    numOfReviews: {
      type: Number,
      default: 0,
    },
    reviews: {
      type: [
        {
          user: { type: mongoose.Schema.ObjectId, ref: "User", required: true },
          name: { type: String, required: true },
          rating: { type: Number, required: true, min: 1, max: 5 },
          comment: { type: String, required: true },
          verifiedPurchase: { type: Boolean, default: false },
          createdAt: { type: Date, default: Date.now },
        },
      ],
      default: [],
    },
    bestseller: {
      type: Boolean,
      default: false,
    },
    // --- Recommendation / engagement analytics counters ---
    // Number of times this product's detail page has been viewed.
    viewCount: {
      type: Number,
      default: 0,
    },
    // Number of times this product has been shown inside a recommendation row
    // (Similar Products, Frequently Bought Together, Recommended For You).
    recommendationImpressions: {
      type: Number,
      default: 0,
    },
    // Number of times a user clicked through to this product from a
    // recommendation row. Clicks / impressions gives the recommendation CTR.
    recommendationClicks: {
      type: Number,
      default: 0,
    },

    // Soft delete / audit trail support
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Part", partSchema);


// Add Text Index on name and description for full text search
partSchema.index({ name: 'text', description: 'text' });
