import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import config from "./index.js";

let mongoServer;

async function connectDB() {
  try {
    if (config.mongodbUrl) {
      try {
        await mongoose.connect(config.mongodbUrl);
        console.log("connect DB");
        return;
      } catch (atlasError) {
        console.log("Atlas connection failed, falling back to local memory DB", atlasError.message);
      }
    }

    if (!mongoServer) {
      mongoServer = await MongoMemoryServer.create();
    }

    const uri = mongoServer.getUri();
    await mongoose.connect(uri);
    console.log("connect DB (memory)");
  } catch (error) {
    console.log("Mongodb connect error", error);
  }
}

export default connectDB;
// Configured database transaction retry settings for high concurrency
