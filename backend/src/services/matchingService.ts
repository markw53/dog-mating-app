interface MatchCriteria {
  breed: string;
  gender: 'MALE' | 'FEMALE';
  age: number;
  location?: {
    latitude: number;
    longitude: number;
  };
  temperament?: string[];
  healthStatus: {
    vaccinated: boolean;
    neutered: boolean;
  };
}

interface MatchScore {
  dogId: string;
  score: number;
  reasons: string[];
  distance?: number;
}

// Helper function to calculate distance
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(degrees: number): number {
  return degrees * (Math.PI / 180);
}

// Calculate match score
export function calculateMatchScore(
  sourceDog: MatchCriteria,
  targetDog: MatchCriteria
): MatchScore {
  let score = 0;
  const reasons: string[] = [];
  let distance: number | undefined;

  // Must be opposite gender (required for breeding)
  if (sourceDog.gender === targetDog.gender) {
    return { dogId: '', score: 0, reasons: ['Same gender - not compatible'], distance };
  }

  // Breed match (50 points)
  if (sourceDog.breed.toLowerCase() === targetDog.breed.toLowerCase()) {
    score += 50;
    reasons.push('Same breed');
  } else {
    score += 10;
    reasons.push('Different breed (mixed breeding)');
  }

  // Age compatibility (20 points)
  const ageDifference = Math.abs(sourceDog.age - targetDog.age);
  if (ageDifference <= 2) {
    score += 20;
    reasons.push('Similar age');
  } else if (ageDifference <= 4) {
    score += 10;
    reasons.push('Close in age');
  }

  // Health status (20 points)
  if (sourceDog.healthStatus.vaccinated && targetDog.healthStatus.vaccinated) {
    score += 10;
    reasons.push('Both vaccinated');
  }
  
  // Not neutered (required for breeding)
  if (!sourceDog.healthStatus.neutered && !targetDog.healthStatus.neutered) {
    score += 10;
    reasons.push('Both not neutered');
  } else {
    score -= 50; // Major penalty if either is neutered
    reasons.push('One or both neutered - not suitable for breeding');
  }

  // Location proximity (30 points max)
  if (
    sourceDog.location?.latitude &&
    sourceDog.location?.longitude &&
    targetDog.location?.latitude &&
    targetDog.location?.longitude
  ) {
    distance = calculateDistance(
      sourceDog.location.latitude,
      sourceDog.location.longitude,
      targetDog.location.latitude,
      targetDog.location.longitude
    );

    if (distance <= 25) {
      score += 30;
      reasons.push(`Very close (${Math.round(distance)}km away)`);
    } else if (distance <= 50) {
      score += 20;
      reasons.push(`Close by (${Math.round(distance)}km away)`);
    } else if (distance <= 100) {
      score += 10;
      reasons.push(`Within reach (${Math.round(distance)}km away)`);
    } else {
      reasons.push(`Far away (${Math.round(distance)}km away)`);
    }
  }

  // Temperament compatibility (10 points)
  if (sourceDog.temperament && targetDog.temperament) {
    const commonTraits = sourceDog.temperament.filter(trait =>
      targetDog.temperament?.includes(trait)
    );
    if (commonTraits.length > 0) {
      score += 10;
      reasons.push(`Compatible temperament (${commonTraits.length} common traits)`);
    }
  }

  return { dogId: '', score, reasons, distance };
}