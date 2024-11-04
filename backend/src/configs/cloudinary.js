const cloudinary = require('cloudinary').v2
const multer = require('multer')
const dotenv = require('dotenv')
dotenv.config()

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
})

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
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload(fileData, { folder: 'threads', resource_type: resourceType }, (error, result) => {
      if (error) reject(error);
      resolve(result.secure_url);
    });
  });
}

exports.deleteMedia = async (mediaPath, resourceType = 'image') => {
  try {
    // Extract the public_id from the URL
    const publicId = mediaPath.split('/').slice(-2).join('/');
    
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
      invalidate: true,
      timeout: 100000,
    });
    console.log("Delete successful: ", result);
    return result;
  } catch (error) {
    console.error("Error deleting from Cloudinary: ", error);
    throw error;
  }
}
