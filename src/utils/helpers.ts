import { format, parseISO } from 'date-fns';

export function formatDate(dateString: string): string {
  try {
    return format(parseISO(dateString), 'MMMM dd, yyyy');
  } catch {
    return dateString;
  }
}

export function formatDateTime(dateString: string): string {
  try {
    return format(parseISO(dateString), 'MMMM dd, yyyy • hh:mm a');
  } catch {
    return dateString;
  }
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

export function getImagePlaceholder(title: string): string {
  const colors = [
    'from-blue-400 to-blue-600',
    'from-purple-400 to-purple-600',
    'from-pink-400 to-pink-600',
    'from-green-400 to-green-600',
    'from-yellow-400 to-yellow-600',
    'from-red-400 to-red-600',
  ];
  
  const index = title.charCodeAt(0) % colors.length;
  return colors[index];
}

