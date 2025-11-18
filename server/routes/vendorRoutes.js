import express from "express";
import {
  loginVendor,
  registerVendor,
} from "../controllers/vendor/authController.js";
// import {
//   addCategory,
//   DeleteCategory,
//   editCategory,
//   getCategories,
// } from "../controllers/vendor/categoryController.js";
import {
  addBrand,
  deleteBrand,
  getBrands,
  updateBrand,
  visibilityBrand,
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
  DeleteVariant,
  EditVariant,
  editVariantImage,
  getVariantsByProduct,
  relatedProduct,
} from "../controllers/vendor/variantsController.js";
import {
  getOrdersData,
  updateOrderStatus,
} from "../controllers/vendor/OrderController.js";
import { salesReport } from "../controllers/vendor/salesReport.js";
import { salesReportExcel } from "../controllers/vendor/excel.js";
import { getCategoryVendor } from "../controllers/vendor/categoryController.js";
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
//Brand
router.post("/brand/add", VendorProtection, addBrand);
router.get("/brand", VendorProtection, getBrands);
// router.get("/brand", getBrands);
router.delete("/brand/:id", VendorProtection, deleteBrand);
router.patch("/brand/update/:id", VendorProtection, updateBrand);
router.patch("/brand/visible/:id", VendorProtection, visibilityBrand);
//Variants
router.post("/variant/add", upload.array("images", 5), addVariant);
router.get("/variant/product/:productId", relatedProduct);
router.delete("/variant/delete/:id", DeleteVariant);
//get variants
router.get("/variant/:productId", getVariantsByProduct);
//editing variants
router.patch(
  "/variant/edit/:variantId",
  upload.array("images", 10),
  EditVariant
);
router.delete("/variant/image", editVariantImage);
//orderData
router.get("/orderList", getOrdersData);
router.patch("/updatestatus/:id", updateOrderStatus);
//sales report
router.get("/sales/report", salesReport);
router.get("/sales-report/excel", salesReportExcel);
//category
router.get("/category",getCategoryVendor)
export default router;
