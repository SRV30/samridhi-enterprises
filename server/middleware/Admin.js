import jwt from "jsonwebtoken";

const admin = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.json({
        success: false,
        message: "Not Authorized Login Again",
      });
    }

    const decodedData = jwt.verify(token, process.env.JWT_SECRET);

    if (decodedData.role !== "ADMIN" && decodedData.role !== "MANAGER") {
      return res.status(401).json({
        success: false,
        message: "Not Authorized Login Again",
      });
    }

    req.user = decodedData;
    next();
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

export default admin;
