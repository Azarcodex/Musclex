import express from "express";
import {
  loginVendor,
  registerVendor,
} from "../controllers/vendor/authController.js";
import {
  addCategory,
  DeleteCategory,
  getCategories,
} from "../controllers/vendor/categoryController.js";
import {
  addBrand,
  deleteBrand,
  getBrands,
} from "../controllers/vendor/BrandController.js";
import { addProduct } from "../controllers/vendor/addProducts.js";
import { VendorProtection } from "../middlewares/vendors/authVendor.js";
import { addVariant } from "../controllers/vendor/addVariant.js";
const router = express.Router();

router.post("/register", registerVendor);
router.post("/login", loginVendor);
//product
router.post("/addProduct",VendorProtection,addProduct)
//Category
router.post("/category/add", addCategory);
router.get("/category", getCategories);
router.delete("/category/:id", DeleteCategory);
//Brand
router.post("/brand/add", addBrand);
router.get("/brand", getBrands);
router.delete("/brand/:id", deleteBrand);
//Variants
router.post("/variant/add",addVariant)

export default router;
