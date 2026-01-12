import express from "express";
import adminRoute from "./routes/adminRoutes.js";
import userRoute from "./routes/userRoutes.js";
import googleAuth from "./routes/authRoutes.js";
import vendorRoute from "./routes/vendorRoutes.js";
import paymentRoute from "./routes/paymentRoutes.js";
import vendorWalletRoutes from "./routes/vendorWalletRoutes.js";
import path from "path";
import cors from "cors";
import { errorHandler } from "./middlewares/globalError/errorHandle.js";
const app = express();
app.use(
  cors({
    origin: ["http://localhost:5173"],
    credentials: true,
  })
);
app.use(express.json());
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));
app.use(express.urlencoded({ extended: true }));
//setting Up admin Prefix route

app.get("/", (req, res) => {
  res.status(200).json({ message: "API running" });
});
app.use("/api/admin", adminRoute);
//setting Up user Prefix route
app.use("/api/user", userRoute);
//setting Up Vendor Prefix Route
app.use("/api/vendor", vendorRoute);
//google auth
app.use("/api/auth", googleAuth);
//payment
app.use("/api/payments", paymentRoute);
//vendor wallet
app.use("/api/vendor/wallet", vendorWalletRoutes);

//global error
app.use(errorHandler);
export default app;
