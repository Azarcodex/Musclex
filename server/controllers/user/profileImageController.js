import User from "../../models/users/user.js";
import MESSAGES from "../../constants/messages.js";

export const ImageController = async (req, res) => {
  try {
    const userId = req.user._id;
    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, message: MESSAGES.NO_IMAGE_FOUND });
    }
    const updated = await User.findByIdAndUpdate(userId, {
      profileImage: `/uploads/profile/${req.file.filename}`,
    });
    console.log(updated);
    res.status(200).json({ success: true, message: MESSAGES.IMAGE_UPLOADED, updated });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: MESSAGES.INTERNAL_SERVER_ERROR });
  }
};

export const removeImage = async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId);
    if (!user || !user.profileImage) {
      return res
        .status(400)
        .json({ success: false, message: MESSAGES.NO_PROFILE_IMAGE_FOUND });
    }

    

    // Update user document
    await User.findByIdAndUpdate(userId, { profileImage: null });

    res.status(200).json({ success: true, message: MESSAGES.IMAGE_REMOVED });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: MESSAGES.INTERNAL_SERVER_ERROR });
  }
};
