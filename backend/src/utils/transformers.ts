export const transformDogForFrontend = (dog: any) => {
  return {
    ...dog,
    _id: dog.id, // For backwards compatibility
    healthInfo: {
      vaccinated: dog.vaccinated,
      neutered: dog.neutered,
      veterinarian: dog.vetName ? {
        name: dog.vetName,
        contact: dog.vetContact,
      } : undefined,
      medicalHistory: dog.medicalHistory,
    },
    pedigree: {
      registered: dog.registered,
      registrationNumber: dog.registrationNumber,
      registry: dog.registry,
      sire: dog.sire,
      dam: dog.dam,
    },
    breeding: {
      available: dog.available,
      studFee: dog.studFee,
      studFeeNegotiable: dog.studFeeNegotiable,
      previousLitters: dog.previousLitters,
      temperament: dog.temperament,
    },
    location: {
      address: dog.address,
      city: dog.city,
      state: dog.county,
      zipCode: dog.postcode,
      country: dog.country,
    },
    gender: dog.gender.toLowerCase(),
    status: dog.status.toLowerCase(),
  };
};

export const transformUserForFrontend = (user: any) => {
  return {
    ...user,
    _id: user.id,
    role: user.role.toLowerCase(),
    location: {
      address: user.address,
      city: user.city,
      state: user.county,
      zipCode: user.postcode,
      country: user.country,
    },
  };
};