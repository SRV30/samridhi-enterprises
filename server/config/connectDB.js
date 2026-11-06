import mongoose from "mongoose";
import { MongoMemoryReplSet } from "mongodb-memory-server";
import config from "./index.js";

let mongoServer;

async function connectDB() {
  // Never silently replace a failed production database with an ephemeral DB.
  if (config.mongodbUrl) {
    await mongoose.connect(config.mongodbUrl);
    console.log("Connected to configured MongoDB");
    return;
  }

  if (config.isProduction) {
    throw new Error("MONGODB_URL is required in production.");
  }

  if (!mongoServer) {
    mongoServer = await MongoMemoryReplSet.create({
      replSet: { count: 1, storageEngine: "wiredTiger" },
    });
  }

  await mongoose.connect(mongoServer.getUri());
  console.log("Connected to local in-memory MongoDB replica set");
}

export default connectDB;
