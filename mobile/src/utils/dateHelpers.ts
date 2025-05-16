import { format, parseISO, isAfter } from 'date-fns';

export const formatDateTime = (dateTimeStr: string | null | undefined): string => {
  if (!dateTimeStr) return 'No deadline';
  
  try {
    const date = parseISO(dateTimeStr);
    return format(date, 'MMM d, yyyy HH:mm');
  } catch (error) {
    console.error('Date formatting error:', error);
    return 'Invalid date';
  }
};

export const formatDateTimeForForm = (dateTimeStr: string | null | undefined): string => {
  if (!dateTimeStr) return '';
  
  try {
    const date = parseISO(dateTimeStr);
    return format(date, 'yyyy-MM-dd\'T\'HH:mm');
  } catch (error) {
    console.error('Date formatting error:', error);
    return '';
  }
};

export const isTaskExpired = (deadLine: string | null | undefined): boolean => {
  if (!deadLine) return false;
  
  try {
    const deadLineDate = parseISO(deadLine);
    return isAfter(new Date(), deadLineDate);
  } catch (error) {
    console.error('Date comparison error:', error);
    return false;
  }
};