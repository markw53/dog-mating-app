import { formatDistanceToNow, format, isValid, parseISO } from 'date-fns';
import { enGB } from 'date-fns/locale';
import { Dog } from '@/types';

const parseDate = (date: string | Date): Date | null => {
  if (!date) return null;
  
  try {
    if (date instanceof Date) {
      return isValid(date) ? date : null;
    }
    
    const parsed = typeof date === 'string' ? parseISO(date) : new Date(date);
    return isValid(parsed) ? parsed : null;
  } catch (error) {
    console.error('Error parsing date:', error);
    return null;
  }
};

export const formatDate = (date: string | Date) => {
  const parsed = parseDate(date);
  if (!parsed) return 'Invalid date';
  
  return format(parsed, 'dd MMM yyyy', { locale: enGB });
};

export const formatRelativeTime = (date: string | Date) => {
  const parsed = parseDate(date);
  if (!parsed) return 'Invalid date';
  
  return formatDistanceToNow(parsed, { addSuffix: true, locale: enGB });
};

export const formatCurrency = (amount: number) => {
  if (typeof amount !== 'number' || isNaN(amount)) return '£0.00';
  
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
  }).format(amount);
};

export const formatAge = (dateOfBirth: string | Date) => {
  const birthDate = parseDate(dateOfBirth);
  if (!birthDate) return 'Unknown';
  
  const today = new Date();
  const years = today.getFullYear() - birthDate.getFullYear();
  const months = today.getMonth() - birthDate.getMonth();
  
  // Check if birthday hasn't occurred this year yet
  const adjustedYears = months < 0 || (months === 0 && today.getDate() < birthDate.getDate()) 
    ? years - 1 
    : years;
  
  const adjustedMonths = months < 0 ? 12 + months : months;

  if (adjustedYears === 0) {
    if (adjustedMonths === 0) {
      const days = Math.floor((today.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24));
      return `${days} day${days !== 1 ? 's' : ''}`;
    }
    return `${adjustedMonths} month${adjustedMonths !== 1 ? 's' : ''}`;
  }
  
  if (adjustedMonths === 0) {
    return `${adjustedYears} year${adjustedYears !== 1 ? 's' : ''}`;
  }
  
  return `${adjustedYears} year${adjustedYears !== 1 ? 's' : ''}, ${adjustedMonths} month${adjustedMonths !== 1 ? 's' : ''}`;
};

/**
 * Format dog age for display
 * Uses `years` field first, falls back to `age` field, then tries `dateOfBirth`
 */
export const formatDogAge = (dog: Pick<Dog, 'age' | 'years' | 'dateOfBirth'>): string => {
  // Try years field first
  if (dog.years) {
    return `${dog.years} year${dog.years > 1 ? 's' : ''} old`;
  }
  
  // Try age field
  if (dog.age) {
    return `${dog.age} year${dog.age > 1 ? 's' : ''} old`;
  }
  
  // Try calculating from dateOfBirth
  if (dog.dateOfBirth) {
    return formatAge(dog.dateOfBirth);
  }
  
  return 'Age unknown';
};

/**
 * Format dog age - short version (e.g., "3y" or "6m")
 */
export const formatDogAgeShort = (dog: Pick<Dog, 'age' | 'years' | 'dateOfBirth'>): string => {
  if (dog.years) return `${dog.years}y`;
  if (dog.age) return `${dog.age}y`;
  
  if (dog.dateOfBirth) {
    const birthDate = parseDate(dog.dateOfBirth);
    if (birthDate) {
      const today = new Date();
      const years = today.getFullYear() - birthDate.getFullYear();
      const months = today.getMonth() - birthDate.getMonth();
      const adjustedYears = months < 0 ? years - 1 : years;
      
      if (adjustedYears === 0) {
        const adjustedMonths = months < 0 ? 12 + months : months;
        return `${adjustedMonths}m`;
      }
      return `${adjustedYears}y`;
    }
  }
  
  return '?';
};

// Additional UK-specific formatters
export const formatPostcode = (postcode: string): string => {
  if (!postcode) return '';
  
  // Remove spaces and convert to uppercase
  const cleaned = postcode.replace(/\s/g, '').toUpperCase();
  
  // Add space before last 3 characters (standard UK format)
  if (cleaned.length > 3) {
    return `${cleaned.slice(0, -3)} ${cleaned.slice(-3)}`;
  }
  
  return cleaned;
};

export const formatPhoneNumber = (phone: string): string => {
  if (!phone) return '';
  
  // Remove all non-numeric characters
  const cleaned = phone.replace(/\D/g, '');
  
  // Format UK mobile numbers (07xxx xxxxxx)
  if (cleaned.startsWith('07') && cleaned.length === 11) {
    return `${cleaned.slice(0, 5)} ${cleaned.slice(5)}`;
  }
  
  // Format UK landline (01xx xxxx xxxx or 02x xxxx xxxx)
  if ((cleaned.startsWith('01') || cleaned.startsWith('02')) && cleaned.length === 11) {
    return `${cleaned.slice(0, 4)} ${cleaned.slice(4, 8)} ${cleaned.slice(8)}`;
  }
  
  return phone;
};

/**
 * Format weight in kilograms
 * @param weightKg - Weight in kilograms
 * @returns Formatted weight string (e.g., "25 kg" or "12.5 kg")
 */
export const formatWeight = (weightKg: number | null | undefined): string => {
  if (weightKg === null || weightKg === undefined || isNaN(weightKg)) {
    return 'Unknown';
  }
  
  // Round to 1 decimal place if needed
  const rounded = Math.round(weightKg * 10) / 10;
  
  // Remove unnecessary decimal (e.g., 25.0 -> 25)
  const formatted = rounded % 1 === 0 ? rounded.toFixed(0) : rounded.toFixed(1);
  
  return `${formatted} kg`;
};

/**
 * Format weight with range (useful for breed standards)
 * @param minKg - Minimum weight in kg
 * @param maxKg - Maximum weight in kg
 * @returns Formatted weight range (e.g., "25-30 kg")
 */
export const formatWeightRange = (minKg: number, maxKg: number): string => {
  if (isNaN(minKg) || isNaN(maxKg)) return 'Unknown';
  
  return `${Math.round(minKg)}-${Math.round(maxKg)} kg`;
};

/**
 * Convert pounds to kilograms
 * @param lbs - Weight in pounds
 * @returns Weight in kilograms
 */
export const lbsToKg = (lbs: number): number => {
  return lbs * 0.453592;
};

/**
 * Convert kilograms to pounds
 * @param kg - Weight in kilograms
 * @returns Weight in pounds
 */
export const kgToLbs = (kg: number): number => {
  return kg * 2.20462;
};

/**
 * Format weight with both kg and lbs (for international users)
 * @param weightKg - Weight in kilograms
 * @returns Formatted string with both units (e.g., "25 kg (55 lbs)")
 */
export const formatWeightDual = (weightKg: number | null | undefined): string => {
  if (weightKg === null || weightKg === undefined || isNaN(weightKg)) {
    return 'Unknown';
  }
  
  const kg = Math.round(weightKg * 10) / 10;
  const lbs = Math.round(kgToLbs(weightKg));
  
  const kgFormatted = kg % 1 === 0 ? kg.toFixed(0) : kg.toFixed(1);
  
  return `${kgFormatted} kg (${lbs} lbs)`;
};