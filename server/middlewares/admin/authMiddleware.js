import jwt from "jsonwebtoken";
import Admin from "../../models/Admin/admin.js";
import MESSAGES from "../../constants/messages.js";

export const Protected = async (req, res, next) => {
  try {
    const headers = req.headers.authorization;
    if (!headers || !headers.startsWith("Bearer")) {
      return res.status(401).json({ message: MESSAGES.NO_TOKEN });
    }
    const extract = headers.split(" ")[1];
    let verify;
    try {
      verify = jwt.verify(extract, process.env.JWT_SECRET);
    } catch (error) {
      res
        .status(400)
        .json({ success: false, message: MESSAGES.INVALID_TOKEN });
    }
    const admin = await Admin.findById(verify.id).select("-password");
    if (!admin) {
      return res.status(401).json({ message: MESSAGES.ADMIN_NOT_FOUND });
    }
    req.admin = admin;
    next();
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.error });
  }
};
