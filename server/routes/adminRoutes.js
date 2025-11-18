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
const router = express.Router();

// register
router.post("/register", registerAdmin);
//login
router.post("/login", LoginAdmin);
//allUsers
router.get("/getUsers", getUsers);
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
export default router;
