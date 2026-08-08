/**
 * Optional demo seed for the vehicle-compatibility feature (issue #6).
 *
 * Bike models gained `yearStart`, `yearEnd`, and `engineType` fields. Models
 * created before this change simply have those fields empty, which the app
 * treats as "compatible with any year / any engine" — so nothing breaks and no
 * backfill is strictly required.
 *
 * This script exists only to make the new Year and Engine filters easy to test:
 * it assigns SAMPLE year ranges and engine types to bike models that don't have
 * any yet, so reviewers can see the filters narrow the catalogue. The values are
 * illustrative test data, not real manufacturer specifications — set the real
 * values from the admin "Bike Model" page.
 *
 * Safety:
 *   - It NEVER overwrites a model that already has a year range or engine type,
 *     so it won't clobber data entered through the admin panel.
 *   - It is idempotent: running it again changes nothing once models are filled.
 *
 * Usage (from the `server` directory):
 *   node scripts/seedCompatibilityData.js
 *
 * To clear the demo values again, edit the affected models in the admin panel,
 * or run a one-off update setting yearStart/yearEnd to null and engineType to "".
 */

import mongoose from "mongoose";
import BikeModel from "../models/bikeModel.js";
import config from "../config/index.js";

// Illustrative sample compatibility values, cycled across models so that the
// Year and Engine filters visibly split the catalogue during testing.
const SAMPLES = [
  { yearStart: 2015, yearEnd: 2020, engineType: "150cc" },
  { yearStart: 2018, yearEnd: 2024, engineType: "110cc" },
  { yearStart: 2010, yearEnd: 2016, engineType: "100cc" },
  { yearStart: 2020, yearEnd: 2025, engineType: "125cc" },
];

async function run() {
  const mongoUrl = config.mongodbUrl || process.env.MONGODB_URL;
  if (!mongoUrl) {
    console.error("MONGODB_URL is not set. Aborting.");
    process.exit(1);
  }

  await mongoose.connect(mongoUrl);
  console.log("Connected to database.");

  const models = await BikeModel.find();
  if (models.length === 0) {
    console.log("No bike models found. Nothing to seed.");
    await mongoose.disconnect();
    return;
  }

  let updated = 0;
  let skipped = 0;
  let sampleIndex = 0;

  for (const model of models) {
    const hasYear = model.yearStart != null || model.yearEnd != null;
    const hasEngine = !!(model.engineType && model.engineType.trim());

    // Only fill models that have no compatibility data yet.
    if (hasYear || hasEngine) {
      skipped += 1;
      continue;
    }

    const sample = SAMPLES[sampleIndex % SAMPLES.length];
    sampleIndex += 1;

    model.yearStart = sample.yearStart;
    model.yearEnd = sample.yearEnd;
    model.engineType = sample.engineType;
    await model.save();
    updated += 1;

    console.log(
      `Updated "${model.name}": ${sample.yearStart}-${sample.yearEnd}, ${sample.engineType}`
    );
  }

  console.log(
    `\nDone. Updated ${updated} model(s), skipped ${skipped} that already had data.`
  );

  await mongoose.disconnect();
  console.log("Disconnected.");
}

run().catch(async (err) => {
  console.error("Seed failed:", err);
  await mongoose.disconnect();
  process.exit(1);
});
