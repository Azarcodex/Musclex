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

export const removeImage = async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId);
    if (!user || !user.profileImage) {
      return res
        .status(400)
        .json({ success: false, message: "No profile image found" });
    }

    // Construct file path from stored relative path
    // const imagePath = path.join(
    //   process.cwd(),
    //   user.profileImage.replace(/^\//, "")
    // );

    // // Delete file from disk
    // if (fs.existsSync(imagePath)) {
    //   fs.unlinkSync(imagePath);
    //   console.log("File deleted:", imagePath);
    // }

    // Update user document
    await User.findByIdAndUpdate(userId, { profileImage: null });

    res
      .status(200)
      .json({ success: true, message: "Image removed successfully" });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ success: false, message: "Internal server error occurred" });
  }
};
