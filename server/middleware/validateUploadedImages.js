import ErrorHandler from "../utils/errorHandler.js";

const hasValidSignature = (buffer, mimeType) => {
  if (!Buffer.isBuffer(buffer)) return false;
  switch (mimeType) {
    case "image/jpeg":
      return buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
    case "image/png":
      return buffer.length >= 8 && buffer.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
    case "image/gif":
      return buffer.length >= 6 && ["GIF87a", "GIF89a"].includes(buffer.toString("ascii", 0, 6));
    case "image/webp":
      return buffer.length >= 12 && buffer.toString("ascii", 0, 4) === "RIFF" && buffer.toString("ascii", 8, 12) === "WEBP";
    default:
      return false;
  }
};

const validateUploadedImages = (req, res, next) => {
  const files = req.files || (req.file ? [req.file] : []);
  const invalid = files.find((file) => !hasValidSignature(file.buffer, file.mimetype));
  if (invalid) return next(new ErrorHandler("Uploaded file content does not match a supported image format", 400));
  return next();
};

export default validateUploadedImages;