const { db } = require('./firebaseConfig');
const { collection, addDoc, getDocs, doc, setDoc } = require('firebase/firestore');

const addDog = async (dogData) => {
    const dogsRef = collection(db, 'dogs');
    await addDoc(dogsRef, dogData);
};

const setDog = async (dogData) => {
    try {
        const docRef = doc(db, 'dogs', dogData.name); 
        await setDoc(docRef, dogData);
        console.log('Dog added successfully');
    } catch (error) {
        console.error('Error adding dog:', error);
    }
};

const getDogs = async () => {
    const dogsRef = collection(db, 'dogs');
    const snapshot = await getDocs(dogsRef);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

module.exports = { addDog, setDog, getDogs };
