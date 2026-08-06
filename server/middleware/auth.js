import jwt from "jsonwebtoken";
import User from "../models/userModel.js";
import config from "../config/index.js";

const auth = async (req, res, next) => {
  let token;

  if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  } 

  else if (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
    token = req.headers.authorization.split(" ")[1];
  } 
 
  else if (req.headers.authorization) {
    token = req.headers.authorization;
  }

  if (!token || token === "null") {
    return res
      .status(401)
      .json({ success: false, message: "Please login again" });
  }

  try {
    const decoded = jwt.verify(token, config.jwt.secret || process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id);

    if (!req.user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (req.user.status === "Suspended") {
      return res.status(403).json({ success: false, message: "Your account is suspended" });
    }

    next();
  } catch (error) {
    console.error(error);
    
    if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
      return res
        .status(401)
        .json({ success: false, message: "Token expired, please login again" });
    }

    res.status(500).json({ success: false, message: error.message });
  }
};

export default auth;