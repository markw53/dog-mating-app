// Age is always derived from dateOfBirth — a stored age column goes stale
// because nothing updates it as dogs get older
export function ageInYears(dateOfBirth: Date): number {
  const now = new Date();
  let age = now.getFullYear() - dateOfBirth.getFullYear();
  const monthDiff = now.getMonth() - dateOfBirth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < dateOfBirth.getDate())) {
    age--;
  }
  return Math.max(0, age);
}

// Upper bound on dateOfBirth for a dog to be at least `minAge` years old
export function maxDobForMinAge(minAge: number): Date {
  const d = new Date();
  d.setFullYear(d.getFullYear() - minAge);
  return d;
}

// Lower bound on dateOfBirth for a dog to be at most `maxAge` years old
// (a dog stays `maxAge` until its (maxAge + 1)th birthday)
export function minDobForMaxAge(maxAge: number): Date {
  const d = new Date();
  d.setFullYear(d.getFullYear() - (maxAge + 1));
  return d;
}
