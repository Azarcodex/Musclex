import Vendor from "../../models/vendors/Vendor.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
export const registerVendor = async (req, res) => {
  try {
    const { shopName, email, password, phone, place } = req.body;
    const existingVendor = await Vendor.findOne({ email });
    if (existingVendor) {
      return res
        .status(400)
        .json({ success: true, message: "Vendor Already Exist" });
    }
    const hashPassword = await bcrypt.hash(password, 10);
    const newVendor = new Vendor({
      shopName,
      email,
      password: hashPassword,
      phone,
      place,
      canAddProduct: false,
      status: "pending",
    });
    await newVendor.save();
    res.status(201).json({
      success: true,
      message: "Vendor registered successfully",
      approval: "Please wait for Admin Approval",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error occurred" });
  }
};
//login controller
export const loginVendor = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log(email,password)
    const vendor = await Vendor.findOne({ email });
    if (!vendor) {
      return res.json({ success: false, message: "Vendor not exist" });
    }
    const isMatch = await bcrypt.compare(password, vendor.password);
    if (!isMatch) {
      return res.json({ success: false, message: "Invalid Credentials" });
    }
    if (vendor.status !== "approved") {
      return res
        .status(403)
        .json({
          success: false,
          message: "Vendor is not approved by the Admin",
        });
    }
    const token = jwt.sign({ id: vendor._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
    res.status(200).json({
      success: true,
      message: "LoggedIn successfully",
      token,
      vendor: vendor,
    });
  } catch (error) {
    console.log(error)
    res.status(500).json({ error: error.error });
  }
};
