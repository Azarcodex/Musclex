import jwt from "jsonwebtoken";
import Admin from "../../models/Admin/admin.js";

export const Protected = async (req, res, next) => {
  try {
    const headers = req.headers.authorization;
    if (!headers || !headers.startsWith("Bearer")) {
      return res.status(401).json({ message: "No token Provided" });
    }
    const extract = headers.split(" ")[1];
    let verify;
    try {
      verify = jwt.verify(extract, process.env.JWT_SECRET);
    } catch (error) {
      res
        .status(400)
        .json({ success: false, message: "Invalid token detected" });
    }
    const admin = await Admin.findById(verify.id).select("-password");
    if (!admin) {
      return res.status(401).json({ message: "Admin not found" });
    }
    req.admin = admin;
    next();
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.error });
  }
};
