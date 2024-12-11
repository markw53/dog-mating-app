// firestoreHelpers.js
const { db } = require('./firebaseConfig');
const { collection, addDoc, getDocs, query, where } = require('firebase/firestore');

const addDog = async (dogData) => {
    const dogsRef = collection(db, 'dogs');
    await addDoc(dogsRef, dogData);
};

const getDogs = async () => {
    const dogsRef = collection(db, 'dogs');
    const snapshot = await getDocs(dogsRef);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

module.exports = { addDog, getDogs };
