const { storage } = require("../config/firebaseConfig");
const { ref, uploadBytes, getDownloadURL } = require("firebase/storage");
const { throwError } = require('../middlewares/errorMiddleware');

// Upload a file to Firebase Storage
  // Multer middleware is required in endpoint utilising this function:
    // upload.single("file")  is used to process raw data into buffer
exports.uploadFile = async (firebasePath, buffer, fileType="image/jpeg") => {
  try {
    const storageRef = ref(storage, firebasePath);
    await uploadBytes(storageRef, buffer, { contentType : fileType});
    return await getDownloadURL(storageRef);
  } catch (err) {
    return throwError(500, err, next);
  }
}

// Returns download URL from a specific file
exports.getFileDownloadURL = async (firebasePath) => {
  try {
    return await getDownloadURL(ref(storage, firebasePath)); 
  } catch (err) {
    return throwError(500, err, next);
  }
}