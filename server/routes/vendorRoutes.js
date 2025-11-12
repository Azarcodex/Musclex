import express from "express";
import {
  loginVendor,
  registerVendor,
} from "../controllers/vendor/authController.js";
import {
  addCategory,
  DeleteCategory,
  editCategory,
  getCategories,
} from "../controllers/vendor/categoryController.js";
import {
  addBrand,
  deleteBrand,
  getBrands,
  updateBrand,
} from "../controllers/vendor/BrandController.js";
import {
  addProduct,
  deleteProduct,
  EditProducts,
  getProducts,
  productVisibility,
} from "../controllers/vendor/addProducts.js";
import { VendorProtection } from "../middlewares/vendors/authVendor.js";
import { upload } from "../utils/multerConfig.js";
import {
  addVariant,
  EditVariant,
  editVariantImage,
  getVariantsByProduct,
  relatedProduct,
} from "../controllers/vendor/variantsController.js";
const router = express.Router();

router.post("/register", registerVendor);
router.post("/login", loginVendor);
//product
router.get("/product", VendorProtection, getProducts);
router.post("/addProduct", VendorProtection, addProduct);
router.patch("/editProduct/:id", EditProducts);
router.delete("/delete/:productId", deleteProduct);
//visibility
router.patch("/visible/:productId", productVisibility);
//Category
router.post("/category/add", addCategory);
router.get("/category", getCategories);
router.delete("/category/:id", DeleteCategory);
router.patch("/category/update/:id", editCategory);
//Brand
router.post("/brand/add", addBrand);
router.get("/brand", getBrands);
// router.get("/brand", getBrands);
router.delete("/brand/:id", deleteBrand);
router.patch("/brand/update/:id", updateBrand);
//Variants
router.post("/variant/add", upload.array("images", 5), addVariant);
router.get("/variant/product/:productId", relatedProduct);
//get variants
router.get("/variant/:productId", getVariantsByProduct);
//editing variants
router.patch(
  "/variant/edit/:variantId",
  upload.array("images", 10),
  EditVariant
);
router.delete("/variant/image", editVariantImage);
export default router;
