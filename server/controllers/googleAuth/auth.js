import { OAuth2Client } from "google-auth-library";
import jwt from "jsonwebtoken";
import User from "../../models/users/user.js";
const client = new OAuth2Client(process.env.CLIENT_ID);
export const googleAuth = async (req, res) => {
  try {
    const { token } = req.body;
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.CLIENT_ID,
    });
    const { email, name } = ticket.getPayload;
    const user = await User.findOne({ email });
    if (!user) {
      user = await User.create({ name, email, password: "google-auth" });
    }
    const Jwttoken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
    res.json({ success: true, token: Jwttoken, user });
  } catch (error) {
    res.status(400).json({ message: "Google Login Failed" });
  }
};
