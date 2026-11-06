import multer from "multer";

const ALLOWED_IMAGE_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

const storage = multer.memoryStorage();

// MIME types are client-controlled; the route also validates file signatures
// after parsing, so this filter is an early rejection only.
const fileFilter = (req, file, cb) => {
  if (ALLOWED_IMAGE_MIME_TYPES.has(file.mimetype)) {
    return cb(null, true);
  }
  return cb(new Error("Unsupported image type. Upload JPEG, PNG, WEBP, or GIF."), false);
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 5,
    fields: 40,
    parts: 50,
  },
});

export default upload;