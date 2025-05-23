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

export const formatDateToRequiredString = (date: Date): string => {
  const pad = (n: number) => n.toString().padStart(2, '0');

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ` +
         `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

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

export const formatDateForApi = (date: Date | string): string => {
  if (typeof date === "string") {
    return date;
  }
  return format(date, "yyyy-MM-dd HH:mm:ss");
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