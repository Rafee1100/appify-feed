import mongoose from "mongoose";
import { env } from "./env";

mongoose.set("strictQuery", true);
export async function connectDB() {
  try {
    await mongoose.connect(env.MONGO_URI, {
      serverSelectionTimeoutMS: 5_000,
    });
    console.log("MongoDB connected");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
}

export async function disconnectDb() {
  await mongoose.disconnect();
}
