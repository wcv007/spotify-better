import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`Connected to mongodb ${conn.connection.host}`);
  } catch (err) {
    console.log(`Failed to connect to DB`, err);
    process.exit(1);
  }
};
