import User from "../../models/users/user.js";
import bcrypt from "bcrypt";
import MESSAGES from "../../constants/messages.js";
export const getUserDetails = async (req, res) => {
  try {
    const userdata = req.user;
    const user = await User.findOne({ _id: userdata._id });
    res.status(200).json({ success: true, user: user });
  } catch (err) {
    res.status(500).json({ message: MESSAGES.INTERNAL_SERVER_ERROR });
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
    res.status(200).json({ success: true, message: MESSAGES.UPDATED_SUCCESSFULLY });
  } catch (e) {
    res.status(500).json({ success: false, message: MESSAGES.INVALID_ERROR });
  }
};

export const changePassword = async (req, res) => {
  try {
    const userId = req.user._id;
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res
        .status(400)
        .json({ success: false, message: MESSAGES.ALL_FIELDS_REQUIRED });
    }

    const user = await User.findById(userId).select("+password");
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: MESSAGES.USER_NOT_FOUND });
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res
        .status(400)
        .json({ success: false, message: MESSAGES.OLD_PASSWORD_INCORRECT });
    }

    if (oldPassword === newPassword) {
      return res.status(400).json({
        success: false,
        message: MESSAGES.NEW_PASSWORD_SAME_AS_OLD,
      });
    }
    const hashed = await bcrypt.hash(newPassword, 10);

    user.password = hashed;
    await user.save();

    res.status(200).json({ success: true, message: MESSAGES.PASSWORD_CHANGED_SUCCESS });
  } catch (error) {
    res.status(500).json({ success: false, message: MESSAGES.SERVER_ERROR });
  }
};

