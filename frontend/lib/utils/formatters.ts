import { formatDistanceToNow, format, isValid, parseISO } from 'date-fns';
import { enGB } from 'date-fns/locale';

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

export const formatWeight = (weightLbs: number): string => {
  if (typeof weightLbs !== 'number' || isNaN(weightLbs)) return 'Unknown';
  
  // Convert pounds to stone and pounds (UK format)
  const stone = Math.floor(weightLbs / 14);
  const pounds = Math.round(weightLbs % 14);
  
  if (stone === 0) {
    return `${pounds} lbs`;
  }
  
  if (pounds === 0) {
    return `${stone} stone`;
  }
  
  return `${stone} stone ${pounds} lbs`;
};