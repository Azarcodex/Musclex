import express from "express";
import adminRoute from "./routes/adminRoutes.js";
import userRoute from "./routes/userRoutes.js";
import googleAuth from "./routes/authRoutes.js";
import vendorRoute from "./routes/vendorRoutes.js";
import cors from "cors";
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
//setting Up admin Prefix route
app.use("/api/admin", adminRoute);
//setting Up user Prefix route
app.use("/api/user", userRoute);
//setting Up Vendor Prefix Route
app.use("/api/vendor", vendorRoute);
//google auth
app.use("/api/auth", googleAuth);

export default app;
