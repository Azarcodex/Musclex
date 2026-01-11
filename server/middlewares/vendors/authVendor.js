import jwt from "jsonwebtoken";
import Vendor from "../../models/vendors/Vendor.js";
import MESSAGES from "../../constants/messages.js";

export const VendorProtection = async (req, res, next) => {
  try {
    const headers = req.headers.authorization;
    // console.log(headers)
    if (!headers || !headers.startsWith("Bearer")) {
      return res.status(401).json({ message: MESSAGES.NO_TOKEN });
    }
    const split = headers.split(" ")[1];

    console.log("JWT_SECRET in container:", process.env.JWT_SECRET);
    console.log("TOKEN RECEIVED:", split);

    let verify;
    try {
      verify = jwt.verify(split, process.env.JWT_SECRET);
    } catch (error) {
      return res
        .status(401)
        .json({ success: false, message: MESSAGES.INVALID_TOKEN });
    }
    const vendor = await Vendor.findById(verify.id).select("-password");
    if (!vendor) {
      return res.status(401).json({ message: MESSAGES.VENDOR_NOT_FOUND });
    }
    req.vendor = vendor;
    next();
  } catch (error) {
    res.status(500).json({ success: false, message: error.error });
  }
};
