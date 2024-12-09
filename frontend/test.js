const { setDog, getDogs } = require('./firestoreHelpers');
const { uploadDogPhoto } = require('./storageHelpers');

// Example dog data
const dogData = {
    name: 'Rex',
    breed: 'German Shepherd',
    colour: 'Brown',
    date_of_birth: '2018-03-22',
    dna_results: 'clear',
    eye_test: 'unaffected',
    hip_score: { left: 4, right: 5, total: 9 },
    elbow_score: { left: 2, right: 2, total: 4 },
    inbreeding_coefficient: 0.02,
    estimated_breeding_value: 1.0,
    photo_url: '', // Set after uploading a photo
    location: 'Manchester',
    owner_id: 'user456',
};

// Add a dog
const addTestDog = async () => {
    try {
        // Upload photo first
        const photoURL = await uploadDogPhoto(file);
        dogData.photo_url = photoURL;

        // Add dog to Firestore
        await setDog(dogData);
        console.log('Dog added with photo:', photoURL);
    } catch (err) {
        console.error(err);
    }
};

addTestDog();
