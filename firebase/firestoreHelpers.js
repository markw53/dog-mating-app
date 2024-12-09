const { db } = require('./firebaseConfig');
const { collection, addDoc, getDocs, doc, setDoc } = require('firebase/firestore');

// Add a new dog document with a random ID
const addDog = async (dogData) => {
    const dogsRef = collection(db, 'dogs');
    await addDoc(dogsRef, dogData);
};

// Add or update a dog document with a specific ID (e.g., name as ID)
const setDog = async (dogData) => {
    try {
        const docRef = doc(db, 'dogs', dogData.name); // Use name as the document ID
        await setDoc(docRef, dogData);
        console.log('Dog added successfully');
    } catch (error) {
        console.error('Error adding dog:', error);
    }
};

// Fetch all dogs from Firestore
const getDogs = async () => {
    const dogsRef = collection(db, 'dogs');
    const snapshot = await getDocs(dogsRef);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

module.exports = { addDog, setDog, getDogs };
