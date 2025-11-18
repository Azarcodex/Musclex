import User from "../../models/users/user.js";

export const ImageController = async (req, res) => {
  try {
    const userId = req.user._id;
    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, message: "No Image found" });
    }
    const updated = await User.findByIdAndUpdate(userId, {
      profileImage: `/uploads/profile/${req.file.filename}`,
    });
    console.log(updated);
    res
      .status(200)
      .json({ success: true, message: "Image uploaded successfully", updated });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ success: false, message: "Internal server error occurred" });
  }
};
