import jwt from "jsonwebtoken";
import User from "../../models/users/user.js";
export const protectedUser = async (req, res, next) => {
  try {
    const headers = req.headers.authorization;
    if (!headers || !headers.startsWith("Bearer")) {
      return res.status(401).json({ message: "No token provided" });
    }
    const extract = headers.split(" ")[1];
    let verify;
    try {
      verify = jwt.verify(extract, process.env.JWT_SECRET);
    } catch (error) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid token detected" });
    }
    const user = await User.findById(verify.id).select("-password");
    if (!user) {
      return res.status(401).json({ message: "User not exist" });
    }
    req.user = user;
    next();
  } catch (error) {
    res.status(500).json({ success: false, message: error.error });
  }
};
