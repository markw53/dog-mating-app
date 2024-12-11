import { addDog } from './firestoreHelpers.mjs';

const seedDogs = [
  {
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
    photo_url: '', // Placeholder
    location: 'Manchester',
    owner_id: 'user456',
  },
  {
    name: 'Bella',
    breed: 'Labrador Retriever',
    colour: 'Yellow',
    date_of_birth: '2019-05-17',
    dna_results: 'clear',
    eye_test: 'unaffected',
    hip_score: { left: 3, right: 3, total: 6 },
    elbow_score: { left: 1, right: 1, total: 2 },
    inbreeding_coefficient: 0.01,
    estimated_breeding_value: 0.9,
    photo_url: '', // Placeholder
    location: 'Bristol',
    owner_id: 'user123',
  },
];

const seedDatabase = async () => {
  for (let dog of seedDogs) {
    try {
      await addDog(dog); // Adding each dog to Firestore
      console.log(`Dog ${dog.name} added successfully`);
    } catch (error) {
      console.error('Error adding dog:', error);
    }
  }
};

// Run the seeding process
seedDatabase();
