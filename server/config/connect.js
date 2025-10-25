import mongoose from "mongoose";

const dataBaseImplementation = async () => {
  try {
    const DB = await mongoose.connect(process.env.MONGO_URI);
    console.log(`connected to the ${DB.connection.name}`);
  } catch (error) {
    console.log(error);
  }
};

export default dataBaseImplementation
