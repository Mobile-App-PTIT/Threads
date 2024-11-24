// configs/cloudinary.js
const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const dotenv = require('dotenv');
dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  timeout: 120000
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

async function uploadMedia(fileData, resourceType = 'image', retries = 3, delay = 1000) {
  try {
    const result = await cloudinary.uploader.upload(fileData, {
      folder: 'threads',
      resource_type: resourceType,
    });
    console.log("Uploaded Media URL:", result.secure_url);
    return {
      url: result.secure_url,
      public_id: result.public_id,
      resource_type: resourceType,
    };
  } catch (error) {
    if (retries > 0) {
      console.log(`Retrying upload... (${retries} retries left)`);
      await new Promise(res => setTimeout(res, delay));
      return uploadMedia(fileData, resourceType, retries - 1, delay * 2);
    } else {
      console.error('Error uploading image:', error);
      throw error;
    }
  }
};

exports.uploadMedia = uploadMedia;

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
