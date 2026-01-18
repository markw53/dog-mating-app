import { formatDistanceToNow, format } from 'date-fns';

export const formatDate = (date: string | Date) => {
  return format(new Date(date), 'MMM dd, yyyy');
};

export const formatRelativeTime = (date: string | Date) => {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
};

export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

export const formatAge = (dateOfBirth: string) => {
  const birthDate = new Date(dateOfBirth);
  const today = new Date();
  const years = today.getFullYear() - birthDate.getFullYear();
  const months = today.getMonth() - birthDate.getMonth();

  if (years === 0) {
    return `${months} month${months !== 1 ? 's' : ''}`;
  }
  if (months < 0) {
    return `${years - 1} year${years - 1 !== 1 ? 's' : ''}`;
  }
  return `${years} year${years !== 1 ? 's' : ''}`;
};