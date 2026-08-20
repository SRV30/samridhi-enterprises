import jwt from "jsonwebtoken";
import User from "../models/userModel.js";
import config from "../config/index.js";
import { isStaff } from "../../shared/constants/permissions.js";

const admin = async (req, res, next) => {
  try {
    let token;

    if (req.cookies?.token) token = req.cookies.token;
    else if (req.headers.authorization?.startsWith("Bearer ")) token = req.headers.authorization.split(" ")[1];
    else if (req.headers.authorization) token = req.headers.authorization;

    if (!token || token === "null") {
      return res.status(401).json({ success: false, message: "Not Authorized Login Again" });
    }

    const decodedData = jwt.verify(token, config.jwt.secret || process.env.JWT_SECRET);
    const user = await User.findById(decodedData.id);

    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    if (user.status === "Suspended") {
      return res.status(403).json({ success: false, message: "Your account is suspended" });
    }
    if (!isStaff(user)) {
      return res.status(403).json({ success: false, message: "Forbidden: admin access revoked" });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Admin authentication failed:", error.message);
    return res.status(401).json({ success: false, message: "Invalid or expired authentication token" });
  }
};

export default admin;
