import mongoose from "mongoose";

let isConnected = false;

export async function connectMongo() {
  if (isConnected) {
    return mongoose.connection;
  }

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI is not configured");
  }

  await mongoose.connect(uri, {
    autoIndex: true,
  });

  isConnected = true;
  return mongoose.connection;
}