import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config();

const database =
  process.env.NODE_ENV === "production"
    ? process.env.PROD_DB
    : process.env.DEV_DB;

const connectDB = async () => {
  try {
    const connection = await mongoose.connect(database);
    console.log(`MongoDB connect: ${connection.connection.host}`);
  } catch (error) {
    console.log(error.message);
    process.exit(1);
  }
};

export default connectDB;
