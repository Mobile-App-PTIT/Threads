const admin = require('firebase-admin');
const serviceAccount = require('./utils/react-native-course-d18cd-firebase-adminsdk-p380e-fe0695dd09.json');


const notification = () => {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });

  return admin;
};

module.exports = notification;
