import dotenv from "dotenv";
import dataBaseImplementation from "./config/connect.js";
import app from "./app.js";
dotenv.config();
const PORT = process.env.PORT_NUMBER;
//DATABASE
dataBaseImplementation();
app.listen(PORT, () => {
  console.log(`connected to the port ${PORT}`);
});
