// seedData.js
const { addDog } = require('./firestoreHelpers');

const sampleDogs = [
    {
        name: 'Buddy',
        breed: 'Golden Retriever',
        colour: 'Golden',
        dateOfBirth: '2020-06-15',
        dnaResults: 'Clear',
        eyeTests: 'Unaffected',
        hipScores: { left: 3, right: 4, total: 7 },
        elbowScores: { left: 1, right: 1, total: 2 },
        inbreedingCoefficient: 5.6,
        estimatedBreedingValues: { hip: -3, elbow: 1 },
        ownerId: 'userId123'
    }
];

sampleDogs.forEach(async (dog) => await addDog(dog));
