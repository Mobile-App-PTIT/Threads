// configs/cloudinary.js
const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const dotenv = require('dotenv');
dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype.startsWith("image/") ||
    file.mimetype.startsWith("video/") ||
    file.mimetype.startsWith("audio/")
  ) {
    cb(null, true);
  } else {
    cb(new Error("File type not supported"), false);
  }
};

exports.upload = multer({
  storage: storage,
  fileFilter: fileFilter,
});

exports.uploadMedia = async (fileData, resourceType = 'image') => {
  try {
    const result = await cloudinary.uploader.upload(fileData, {
      folder: 'threads',
      resource_type: resourceType,
    });
    console.log("Uploaded Media URL:", result.secure_url);
    return result.secure_url;
  } catch (error) {
    console.error("Error uploading to Cloudinary:", error);
    throw error;
  }
};

exports.deleteMedia = async (mediaPath, resourceType = 'image') => {
  try {
    const publicId = mediaPath.split('/').slice(-2).join('/');
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
      invalidate: true,
    });
    return result;
  } catch (error) {
    console.error("Error deleting from Cloudinary:", error);
    throw error;
  }
};
