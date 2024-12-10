import { setDog, getDogs } from '../firebase/firestoreHelpers.mjs';
import { uploadDogPhoto } from '../firebase/storageHelpers.js';
import fs from 'fs';
import path from 'path';

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
    photo_url: '', // Will be set after uploading the photo
    location: 'Manchester',
    owner_id: 'user456',
};

// Add a dog
const addTestDog = async () => {
    try {
        // Read the photo file from the filesystem
        const photoPath = path.join(__dirname, 'test-photo.jpg'); // Replace with your image path
        const fileBuffer = fs.readFileSync(photoPath);

        // Mock a file object
        const mockFile = new File([fileBuffer], 'test-photo.jpg', { type: 'image/jpeg' });

        // Upload photo
        const photoURL = await uploadDogPhoto(mockFile);
        dogData.photo_url = photoURL;

        // Add dog to Firestore
        await setDog(dogData);
        console.log('Dog added successfully with photo URL:', photoURL);
    } catch (err) {
        console.error('Error:', err);
    }
};

// Run the test
addTestDog();
