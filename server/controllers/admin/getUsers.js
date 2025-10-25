import User from "../../models/users/user.js";

export const getUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page || 1);
    const limit = parseInt(req.query.limit || 10);
    const {search} = req.query;
    const query = search
      ? {
          $or: [
            { name: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } },
          ],
        }
      : {};
    // console.log(page);
    const totalUsers = await User.countDocuments();
    const skip = (page - 1) * limit;

    const users = await User.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    const totalPages = Math.ceil(totalUsers / limit);
    res.status(200).json({
      success: true,
      users,
      pagination: {
        totalUsers,
        totalPages,
        currentPage: page,
        limit,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Error fetching users",
      error: error.message,
    });
  }
};

//verifyUsers
export const verifyUsers = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) {
      console.log("error");
      return res.json({ success: false, message: "User not found" });
    }
    user.isVerified = !user.isVerified;
    await user.save();
    res.status(200).json({
      success: true,
      message: `User ${
        user.isVerified ? "verified" : "unverified"
      } successfully`,
      user,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
