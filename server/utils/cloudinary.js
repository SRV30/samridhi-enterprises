import { v2 as cloudinary } from "cloudinary";

const uploadImage = async (image) => {
  try {
    if (!image || !image.buffer) {
      throw new Error("No image buffer provided for upload.");
    }

    const buffer = Buffer.isBuffer(image.buffer)
      ? image.buffer
      : Buffer.from(image.buffer);

    const uploadResult = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: "nj",
          resource_type: "auto",
        },
        (error, result) => {
          if (error) {
            console.error("Cloudinary Upload Error:", error);
            return reject(new Error("Image upload failed."));
          }
          resolve(result);
        }
      );

      uploadStream.end(buffer);
    });

    return uploadResult;
  } catch (error) {
    throw new Error(`Image upload failed: ${error.message}`);
  }
};

const deleteImage = async (public_id) => {
  try {
    if (!public_id) {
      throw new Error("Public ID is required for image deletion.");
    }

    const result = await cloudinary.uploader.destroy(public_id);

    if (result.result !== "ok" && result.result !== "not found") {
      throw new Error(
        `Failed to delete image from Cloudinary. Cloudinary result: ${result.result}`
      );
    }

    return result;
  } catch (error) {
    throw new Error(`Image delete failed: ${error.message}`);
  }
};

export { uploadImage, deleteImage };
