import config from "../config/index.js";

const sendToken = (user, statusCode, res) => {
  const token = user.getJWTToken();

  const options = {
    expires: new Date(
      Date.now() + (config.jwt.cookieExpire || Number(process.env.COOKIE_EXPIRE) || 7) * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: config.isProduction || process.env.NODE_ENV === "production",
    sameSite: (config.isProduction || process.env.NODE_ENV === "production") ? "None" : "Lax",
    path: "/",
  };

  res.cookie("token", token, options);
  if (typeof res.sendSuccess === "function") {
    return res.sendSuccess(
      {
        user,
        verifyEmail: user.verifyEmail,
      },
      statusCode
    );
  }

  res.status(statusCode).json({
    success: true,
    user,
    verifyEmail: user.verifyEmail,
  });
};

export default sendToken;
