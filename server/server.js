import dotenv from "dotenv";
dotenv.config();

import app from "./app.js";
import dataBaseImplementation from "./config/connect.js";

// CRON
import "./config/CRONE.js";

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    await dataBaseImplementation();

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
