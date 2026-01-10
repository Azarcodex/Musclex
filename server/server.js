import dotenv from "dotenv";
dotenv.config();
import dataBaseImplementation from "./config/connect.js";
import app from "./app.js";
//CRON
import "./config/CRONE.js";

const PORT = process.env.PORT_NUMBER;
//DATABASE
dataBaseImplementation();
app.listen(PORT, () => {
  console.log(`connected to the port ${PORT}`);
});
