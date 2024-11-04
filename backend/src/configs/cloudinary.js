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

exports.uploadImage = async (image) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload(image, { folder: 'threads' }, (error, result) => {
      if (error) reject(error);
      resolve(result.secure_url);
    });
  });
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

exports.uploadVideo = async (video) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload(video, { resource_type: 'video', folder: 'threads' }, (error, result) => {
      if (error) reject(error);
      resolve(result.secure_url);
    });
  });
}

exports.deleteVideo = async (videoPath) => {
  try {
    // Extract the public_id from the URL
    const publicId = videoPath.split('/').slice(-2).join('/');
    
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

exports.uploadAudio = async (audio) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload(audio, { resource_type: 'video', folder: 'threads' }, (error, result) => {
      if (error) reject(error);
      resolve(result.secure_url);
    });
  });
}

exports.deleteAudio = async (audioPath) => {
  try {
    // Extract the public_id from the URL
    const publicId = audioPath.split('/').slice(-2).join('/');
    
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