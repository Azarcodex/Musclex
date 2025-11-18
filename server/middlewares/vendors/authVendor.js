import jwt from "jsonwebtoken";
import Vendor from "../../models/vendors/Vendor.js";

export const VendorProtection = async (req, res, next) => {
  try {
    const headers = req.headers.authorization;
    // console.log(headers)
    if (!headers || !headers.startsWith("Bearer")) {
      return res.status(401).json({ message: "No token Provided" });
    }
    const split = headers.split(" ")[1];
    let verify;
    try {
      verify = jwt.verify(split, process.env.JWT_SECRET);
    } catch (error) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid token detected" });
    }
    const vendor = await Vendor.findById(verify.id).select("-password");
    if (!vendor) {
      return res.status(401).json({ message: "Vendor not found" });
    }
    req.vendor = vendor;
    next();
  } catch (error) {
    res.status(500).json({ success: false, message: error.error });
  }
};
