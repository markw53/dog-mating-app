const { ref, uploadBytes, getDownloadURL } = require('firebase/storage');
const { storage } = require('./firebaseConfig');

// Upload a dog photo to Firebase Storage and return the URL
const uploadDogPhoto = async (file) => {
    const storageRef = ref(storage, `dogs/${file.name}`);
    try {
        const snapshot = await uploadBytes(storageRef, file);
        const photoURL = await getDownloadURL(snapshot.ref);
        console.log('Uploaded photo URL:', photoURL);
        return photoURL;
    } catch (error) {
        console.error('Error uploading photo:', error);
        throw error;
    }
};

module.exports = { uploadDogPhoto };
