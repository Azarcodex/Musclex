import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import Admin from "../../models/Admin/admin.js";
export const registerAdmin = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const admin = await Admin.create({ name, email, password: hashedPassword });
    res.status(201).json({ success: true, admin: admin });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, error: error.error });
  }
};

export const LoginAdmin = async (req, res) => {
  try {
   const {email,password}=req.body||{}
    console.log("Incoming", email, password);
    if (!email || !password) {
      console.log("No data");
      return res
        .status(400)
        .json({ success: false, message: "Enter Credentials" });
    }
    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res
        .status(400)
        .json({ success: false, message: "Admin not exist" });
    }
    const passwordCheck = await bcrypt.compare(password, admin.password);
    if (!passwordCheck) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid Credentials" });
    }
    //generate token
    const token = jwt.sign(
      { id: admin._id, role: admin.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );
    res.status(200).json({
      success: true,
      message: "loggedIn successfully",
      token,
      admin: admin,
    });
    // console.log("logged💚")
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, error: error.error });
  }
};
