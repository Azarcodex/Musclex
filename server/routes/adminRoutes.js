import express from "express";
import {
  LoginAdmin,
  registerAdmin,
} from "../controllers/admin/authController.js";
import { Protected } from "../middlewares/admin/authMiddleware.js";
// import { getDashboard } from "../controllers/admin/sample.js";
import { getUsers, verifyUsers } from "../controllers/admin/getUsers.js";
import {
  canAddProduct,
  getVendors,
  updateVendorStatus,
} from "../controllers/admin/getVendors.js";
import {
  fetchVendorProducts,
  getVendorProducts,
} from "../controllers/admin/getVendorProducts.js";
import {
  categoryViewController,
  getAllCategoryAdmin,
} from "../controllers/admin/categoryViewController.js";
import {
  addCategory,
  DeleteCategory,
  editCategory,
  getCategories,
} from "../controllers/admin/categoryController.js";
import {
  createAdminCategoryOffer,
  getAllOffers,
  toggleOfferVisibility,
  updateCategoryOffer,
} from "../controllers/admin/offers.js";
import {
  createCoupon,
  getAllCoupons,
  getAllCouponUsage,
  toggleCouponStatus,
  updateCoupon,
} from "../controllers/admin/couponcontroller.js";
import {
  ControlProductFeature,
  toggleProductStatus,
} from "../controllers/admin/productControll.js";
import { getDashboard } from "../controllers/admin/adminAnalyticsController.js";
import {
  createBanner,
  deleteBanner,
  getBanners,
  updateBanner,
} from "../controllers/banners/banner.controller.js";
import { upload } from "../utils/multerConfig.js";
const router = express.Router();

// register
router.post("/register", registerAdmin);
//login
router.post("/login", LoginAdmin);
//allUsers
router.get("/getUsers", getUsers);

//deactivate a product
router.patch("/product/:id", toggleProductStatus);
//verify
router.put("/:id/verify", verifyUsers);
//allVendors
router.get("/getVendors", getVendors);
//vendor status after registration
router.patch("/:id/status", updateVendorStatus);
//product permission
router.patch("/:id/allow", canAddProduct);
//vendor products
router.get("/vendor/products", getVendorProducts);
//vendor indiv. products
router.get("/vendor/products/:vendorId", fetchVendorProducts);
//testing dashboard
// router.get("/dashboard", Protected, getDashboard);
//category view controller
//Category
router.post("/category/add", Protected, addCategory);
router.get("/category", Protected, getCategories);
router.delete("/category/:id", Protected, DeleteCategory);
router.patch("/category/update/:id", Protected, editCategory);
router.post("/category/view/:id", Protected, categoryViewController);
//all category
router.get("/category/all", Protected, getAllCategoryAdmin);

//offers

//  Create category offer
router.post("/offer/category", Protected, createAdminCategoryOffer);

// //  Get all offers
router.get("/offers", Protected, getAllOffers);

// //  Enable / Disable an offer
// router.patch("/offer/:offerId/toggle", toggleOfferStatus);

// //update an offer
router.patch("/offer/:offerId", Protected, updateCategoryOffer);
router.patch("/offer/visibility/:offerId", Protected, toggleOfferVisibility);
//coupon
router.post("/create/coupon", Protected, createCoupon);
router.get("/coupon", Protected, getAllCoupons);
router.patch("/coupon/:id", updateCoupon);

router.patch("/coupon/:id/status", toggleCouponStatus);

router.get("/coupon-usage", Protected, getAllCouponUsage);

//DASHBOARD
router.get("/dashboard/analytics", Protected, getDashboard);

//Banners

router.post("/banners", Protected, upload.single("image"), createBanner);

router.get("/banners", Protected, getBanners);

router.patch("/banners/:id", Protected, upload.single("image"), updateBanner);

router.delete("/banners/:id", Protected, deleteBanner);

//control product feature
router.patch("/product/feature/:id", Protected, ControlProductFeature);
export default router;
