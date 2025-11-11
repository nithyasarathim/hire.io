import mongoose from 'mongoose';
import 'dotenv/config';

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI;
    await mongoose.connect(mongoUri);
    console.log(`MongoDB Connection Successful`);
  } catch (error) {
    console.log(`MongoDB Connection Error`);
    console.error(error.message);
    process.exit(1);
  }
};

export default connectDB;