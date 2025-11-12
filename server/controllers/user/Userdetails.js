import User from "../../models/users/user.js";

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
