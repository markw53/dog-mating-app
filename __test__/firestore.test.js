import { getDogs } from '../dog-mating-backend/firestoreHelpers.mjs';

describe('Firestore Database Tests', () => {
  it('should return seeded dogs', async () => {
    const dogs = await getDogs();
    expect(dogs.length).toBeGreaterThan(0);
    expect(dogs[0]).toHaveProperty('name');
    expect(dogs[0]).toHaveProperty('breed');
  });
});
