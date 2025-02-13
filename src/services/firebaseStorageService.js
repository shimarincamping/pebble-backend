// THIS FILE HAS NOT YET BEEN REFACTORED.

/*

 *    Firebase Storage Functions


// Upload a file to Firebase Storage
const uploadFile = tryCatch(async (filePath, fileBuffer, mimeType) => {
    const storageRef = ref(storage, filePath);
    await uploadBytes(storageRef, fileBuffer, { contentType: mimeType });
    const downloadURL = await getDownloadURL(storageRef);
    return downloadURL;
  });
  
  // Get a file's download URL from Firebase Storage
  const getFileURL = tryCatch(async (filePath) => {
    const storageRef = ref(storage, filePath);
    return await getDownloadURL(storageRef);
  });
  
  // Delete a file from Firebase Storage
  const deleteFile = tryCatch(async (filePath) => {
    const storageRef = ref(storage, filePath);
    await deleteObject(storageRef);
    return { success: true, path: filePath };
  });

  */