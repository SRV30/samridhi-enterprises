import dotenv from "dotenv";
import mongoose from "mongoose";
import Part from "../models/partModel.js";
import Brand from "../models/brandModel.js";
import BikeModel from "../models/bikeModel.js";

dotenv.config();

const IMAGE = (name) => ({
  public_id: `dummy-${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
  url: "https://placehold.co/800x800/png?text=Samridhi+Dummy+Product",
});

const products = [
  ["Front Disc Brake Pad", "Brake Switch", 349, 25, "Front brake pad set for compatible commuter motorcycles."],
  ["Rear Brake Shoe Set", "Drum / Drum Plate / Coupling Hub / Wheel Rim", 299, 30, "Replacement rear drum brake shoe set."],
  ["Air Filter", "Consumable Filters", 249, 40, "Replacement air filter for routine motorcycle servicing."],
  ["Oil Filter", "Consumable Filters", 179, 50, "Engine oil filter suitable for periodic maintenance."],
  ["Ignition Coil", "Ignition Coil", 599, 15, "Replacement ignition coil for compatible motorcycles."],
  ["Regulator Rectifier", "Regulator Rectifier (R.R.)", 899, 12, "Replacement regulator rectifier assembly."],
  ["LED Headlight Bulb", "Lighting Products", 449, 35, "Energy-efficient replacement motorcycle headlight bulb."],
  ["Universal Horn", "Filters & Horn", 199, 45, "12V replacement horn for compatible motorcycles."],
  ["Rear View Mirror Pair", "Rear View Mirror", 499, 20, "Pair of replacement motorcycle rear-view mirrors."],
  ["Clutch Lever", "Lever & Yoke", 229, 35, "Replacement clutch lever for compatible models."],
  ["Brake Lever", "Lever & Yoke", 229, 35, "Replacement front brake lever for compatible models."],
  ["Spark Plug Cap", "Other (Oil Pump Gear / Clutch Roller / Plug Cap)", 149, 60, "Replacement spark plug cap for compatible motorcycles."],
  ["Fuel Cock Assembly", "Fuel Items", 399, 18, "Replacement fuel tap assembly."],
  ["Starter Relay", "Electronic Relay", 349, 22, "Replacement starter relay for compatible motorcycles."],
  ["Indicator Flasher Relay", "Flasher / Buzzer", 199, 30, "12V electronic flasher relay."],
  ["Fork Oil Seal Kit", "Oil Seal Kit", 299, 25, "Front fork oil seal and dust seal replacement kit."],
  ["Handlebar Switch", "Handle Bar Switch / Handle Bar Weigth", 449, 16, "Replacement handlebar control switch assembly."],
  ["Cylinder Head Gasket", "Gaskets", 279, 28, "Replacement cylinder head gasket for compatible engines."],
  ["Chain Adjuster Pair", "Other Products (Cylinder Kit / Fuse Blade)", 179, 40, "Pair of rear-wheel chain adjusters."],
  ["Universal Fuse Blade Kit", "Other Products (Cylinder Kit / Fuse Blade)", 129, 75, "Assorted automotive fuse blade replacement kit."],
];

async function seed() {
  if (!process.env.MONGODB_URL) {
    throw new Error("MONGODB_URL is required");
  }

  await mongoose.connect(process.env.MONGODB_URL);

  const brands = {};
  for (const name of ["Hero", "Honda", "Bajaj", "TVS", "Yamaha"]) {
    brands[name] = await Brand.findOneAndUpdate(
      { name },
      { $setOnInsert: { name, images: [IMAGE(`brand-${name}`)] } },
      { upsert: true, new: true }
    );
  }

  const bikeModels = {};
  const models = [
    ["Hero", "Splendor Plus"],
    ["Honda", "Shine"],
    ["Bajaj", "Pulsar 150"],
    ["TVS", "Apache RTR 160"],
    ["Yamaha", "FZ-S"],
  ];

  for (const [brandName, name] of models) {
    bikeModels[name] = await BikeModel.findOneAndUpdate(
      { brand: brands[brandName]._id, name },
      {
        $setOnInsert: {
          name,
          brand: brands[brandName]._id,
          yearStart: 2018,
          yearEnd: 2026,
          engineType: "Petrol",
          images: [IMAGE(`bike-${name}`)],
        },
      },
      { upsert: true, new: true }
    );
  }

  const compatibility = Object.values(bikeModels).map((bike) => bike._id);
  const created = [];

  for (let i = 0; i < products.length; i += 1) {
    const [name, category, price, stock, description] = products[i];
    const product_id = `DUMMY-${String(i + 1).padStart(3, "0")}`;

    const product = await Part.findOneAndUpdate(
      { product_id },
      {
        $set: {
          name,
          description,
          price,
          stock,
          lowStockThreshold: 5,
          category,
          vehicleCompatibility: compatibility,
          images: [IMAGE(product_id)],
          bestseller: i < 5,
          isDeleted: false,
          deletedAt: null,
        },
        $setOnInsert: {
          ratings: 0,
          numOfReviews: 0,
          reviews: [],
          viewCount: 0,
          recommendationImpressions: 0,
          recommendationClicks: 0,
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    created.push(product.product_id);
  }

  console.log(`Seeded ${created.length} dummy products.`);
  console.log(created.join(", "));
}

seed()
  .catch((error) => {
    console.error("Dummy product seed failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
