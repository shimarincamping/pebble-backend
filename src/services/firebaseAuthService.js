// THIS FILE HAS NOT YET BEEN REFACTORED.

/*
// Create a new user in Firebase Authentication
const createUser = tryCatch(async (email, password) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  });
  
  // Login a user in Firebase Authentication
  const loginUser = tryCatch(async (email, password) => {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  });
  
  // Logout a user from Firebase Authentication
  const logoutUser = tryCatch(async () => {
    await signOut(auth);
    return { success: true, message: "User signed out successfully" };
  });
  
  // Delete a user from Firebase Authentication
  const deleteUserAccount = tryCatch(async (user) => {
    await deleteUser(user);
    return { success: true, message: "User account deleted successfully" };
  });

  */