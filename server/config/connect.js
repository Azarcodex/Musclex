import mongoose from "mongoose";

const dataBaseImplementation = async () => {
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is missing");
  }

  const DB = await mongoose.connect(process.env.MONGO_URI);
  console.log(`Connected to database: ${DB.connection.name}`);
};

export default dataBaseImplementation;
