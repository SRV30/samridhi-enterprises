import assert from "node:assert/strict";
import validateUploadedImages from "../middleware/validateUploadedImages.js";
import ErrorHandler from "../utils/errorHandler.js";

const validate = (file) => {
  let nextError;
  validateUploadedImages({ file }, {}, (error) => { nextError = error; });
  return nextError;
};

const validImages = [
  { mimetype: "image/jpeg", buffer: Buffer.from([0xff, 0xd8, 0xff, 0xdb]) },
  { mimetype: "image/png", buffer: Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]) },
  { mimetype: "image/gif", buffer: Buffer.from("GIF89a") },
  { mimetype: "image/webp", buffer: Buffer.from("RIFF0000WEBP") },
];

for (const file of validImages) {
  assert.equal(validate(file), undefined, file.mimetype + " signature should pass");
}

const spoofed = validate({
  mimetype: "image/png",
  buffer: Buffer.from("<html>not an image</html>"),
});
assert.ok(spoofed instanceof ErrorHandler);
assert.equal(spoofed.statusCode, 400);

const mismatched = validate({
  mimetype: "image/jpeg",
  buffer: Buffer.from("GIF89a"),
});
assert.ok(mismatched instanceof ErrorHandler);
assert.equal(mismatched.statusCode, 400);

assert.equal(validate(undefined), undefined, "Requests without an optional image should pass");
console.log("Uploaded image signature tests passed.");
