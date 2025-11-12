import express from "express";
import { loginUser, registerUser } from "../controllers/user/authController.js";
import { otpController } from "../controllers/user/otpController.js";
import { resendOTP } from "../controllers/user/resendOTP.js";
import { forgetPassword } from "../controllers/user/forgetPassword.js";
import { forgetOtpController } from "../controllers/user/forgetOtpController.js";
import { getProducts } from "../controllers/user/products/getProducts.js";
import { getCategories } from "../controllers/vendor/categoryController.js";
import { getBrands } from "../controllers/vendor/BrandController.js";
import { productListings } from "../controllers/user/products/productListings.js.js";
import {
  AddWishList,
  getWishList,
  removeWishList,
} from "../controllers/user/products/Wishlist.js";
import { protectedUser } from "../middlewares/users/authUser.js";
import { getUserDetails, UpdateName } from "../controllers/user/Userdetails.js";
import { upload } from "../utils/multerConfig.js";
import {
  addAddress,
  DefaultAddress,
  deleteAddress,
  getAddresses,
  updateAddress,
} from "../controllers/user/addressController.js";
import {
  AddCart,
  getCart,
  QuantityChange,
  removeFromCart,
} from "../controllers/user/CartController.js";
import { getCheckoutData } from "../controllers/user/checkout.js";
import { OrderController } from "../controllers/user/OrderController.js";
import { SearchData } from "../controllers/user/searchController.js";
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
//wishlist
router.get("/wishList", protectedUser, getWishList);
router.post("/wishList", protectedUser, AddWishList);
router.delete("/wishList/:id", protectedUser, removeWishList);
//product listings
router.get("/product/:productId", productListings);
//UserPage
router.get("/userdetail", protectedUser, getUserDetails);
router.patch("/userEdit", UpdateName);
//address
router.post("/address", protectedUser, addAddress); // POST /api/addresses
router.get("/address", protectedUser, getAddresses);
router.patch("/address/:id", protectedUser, updateAddress);
router.delete("/address/:id", protectedUser, deleteAddress);
router.patch("/address/default/:id", protectedUser, DefaultAddress);
//cartHandling
router.post("/addtocart", protectedUser, AddCart);
router.get("/getcart", protectedUser, getCart);
router.delete("/cart/:id", protectedUser, removeFromCart);
router.patch("/quantity/:id", protectedUser, QuantityChange);
//checkout
router.get("/checkout", protectedUser, getCheckoutData);
//order controller
router.post("/order", protectedUser, OrderController);
//home search
router.get("/search", SearchData);
export default router;
