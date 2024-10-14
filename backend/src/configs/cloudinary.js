const cloudinary = require('cloudinary').v2
const multer = require('multer')
const fs = require('fs')

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
})

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
      const dir = './uploads';
      if (!fs.existsSync(dir)){
          fs.mkdirSync(dir);
      }
      cb(null, dir);
  },
  filename: (req, file, cb) => {
      cb(null, `${Date.now()}-${file.originalname}`);
  }
});
exports.upload = multer({ storage: storage });

exports.uploadImage = async (imagePath, folder) => {
  try {
    const result = await cloudinary.uploader.upload(imagePath, {
      folder: folder,
      upload_preset: process.env.CLOUDINARY_UPLOAD_PRESET,
      timeout: 100000,
    });
    console.log("Upload successful: ", result);
    return result.url; // This is the URL of the uploaded image
  } catch (error) {
    console.error("Error uploading to Cloudinary: ", error);
    throw error;
  }
}

exports.deleteImage = async (imagePath) => {
  try {
    // Extract the public_id from the URL
    const publicId = imagePath.split('/').slice(-2).join('/');
    
    const result = await cloudinary.uploader.destroy(publicId, {
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