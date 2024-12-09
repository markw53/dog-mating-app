const { setDog } = require('./firestoreHelpers');

const sampleDogs = [
    {
        name: 'Buddy',
        breed: 'Labrador',
        colour: 'Black',
        date_of_birth: '2020-05-15',
        dna_results: 'clear',
        eye_test: 'unaffected',
        hip_score: { left: 5, right: 6, total: 11 },
        elbow_score: { left: 1, right: 2, total: 3 },
        inbreeding_coefficient: 0.05,
        estimated_breeding_value: 0.7,
        photo_url: 'https://example.com/photo.jpg',
        location: 'London',
        owner_id: 'user123',
    },
];

const seedDogs = async () => {
    for (const dog of sampleDogs) {
        await setDog(dog);
    }
    console.log('Seed data added successfully!');
};

seedDogs();
