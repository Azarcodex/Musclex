import express from "express";
import { loginUser, registerUser } from "../controllers/user/authController.js";
import { otpController } from "../controllers/user/otpController.js";
import { resendOTP } from "../controllers/user/resendOTP.js";
import { forgetPassword } from "../controllers/user/forgetPassword.js";
import { forgetOtpController } from "../controllers/user/forgetOtpController.js";
import { getProducts } from "../controllers/user/products/getProducts.js";
import { getCategories } from "../controllers/vendor/categoryController.js";
import { getBrands } from "../controllers/vendor/BrandController.js";
const router = express.Router();

router.post("/register", registerUser);
router.post("/verify", otpController); //otp
router.post("/resend", resendOTP); //resend otp
router.post("/forget", forgetPassword); //forget password
router.post("/forgetCheck", forgetOtpController);
//login
router.post("/login", loginUser);
//products
router.get("/products", getProducts);
//categories
router.get("/categories", getCategories);
//brands
router.get("/brand", getBrands);
export default router;
