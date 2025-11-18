import User from "../../models/users/user.js";
import bcrypt from "bcrypt";
export const getUserDetails = async (req, res) => {
  try {
    const userdata = req.user;
    const user = await User.findOne({ _id: userdata._id });
    res.status(200).json({ success: true, user: user });
  } catch (err) {
    res.status(500).json({ message: "Internal error occurred" });
  }
};

export const UpdateName = async (req, res) => {
  try {
    const { id, name } = req.body;
    console.log("✅✅✅✅✅" + id, name);
    const user = await User.findByIdAndUpdate(
      id,
      {
        name: name,
      },
      { new: true }
    );
    await user.save();
    res.status(200).json({ success: true, message: "Updated Successfully" });
  } catch (e) {
    res.status(500).json({ success: false, message: "Invalid Error" });
  }
};

export const changePassword = async (req, res) => {
  try {
    const userId = req.user._id;
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res
        .status(400)
        .json({ success: false, message: "All fields required" });
    }

    const user = await User.findById(userId).select("+password");
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res
        .status(400)
        .json({ success: false, message: "Old password is incorrect" });
    }

    if (oldPassword === newPassword) {
      return res.status(400).json({
        success: false,
        message: "New password cannot be the same as old password",
      });
    }
    const hashed = await bcrypt.hash(newPassword, 10);

    user.password = hashed;
    await user.save();

    res
      .status(200)
      .json({ success: true, message: "Password changed successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Something went wrong" });
  }
};
