/**
 * Standard API Response Wrapper Middleware
 * Injects res.sendSuccess and res.sendError helpers into Express response object.
 */

const responseWrapper = (req, res, next) => {
  /**
   * Helper to send standardized success JSON responses.
   *
   * Signatures:
   *   res.sendSuccess(data, statusCode)
   *   res.sendSuccess(data, message, statusCode)
   *   res.sendSuccess(message, statusCode)
   */
  res.sendSuccess = (data = {}, messageOrStatus = 200, statusCode = 200) => {
    let message = null;
    let status = 200;

    if (typeof messageOrStatus === "number") {
      status = messageOrStatus;
    } else if (typeof messageOrStatus === "string") {
      message = messageOrStatus;
      if (typeof statusCode === "number") {
        status = statusCode;
      }
    }

    let payload = { success: true };

    if (message) {
      payload.message = message;
    }

    if (typeof data === "string") {
      payload.message = data;
    } else if (data && typeof data === "object" && !Array.isArray(data)) {
      payload = { ...payload, ...data };
    } else if (data !== undefined && data !== null) {
      payload.data = data;
    }

    return res.status(status).json(payload);
  };

  /**
   * Helper to send standardized error JSON responses.
   *
   * Signatures:
   *   res.sendError(message, statusCode, errorDetails)
   */
  res.sendError = (message = "Internal Server Error", statusCode = 500, error = null) => {
    let status = statusCode;
    let msg = message;

    if (typeof message === "number") {
      status = message;
      msg = "Internal Server Error";
    }

    const payload = {
      success: false,
      message: msg,
    };

    if (error !== null && error !== undefined) {
      if (typeof error === "object") {
        payload.error = error;
      } else {
        payload.error = String(error);
      }
    }

    return res.status(status).json(payload);
  };

  next();
};

export default responseWrapper;
