import { SPECIAL_CHARS, MIN_SIZE, MAX_SIZE } from '../constants/auth';

export const validateEmail = (email: string): string | null => {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  
  if (!email.trim()) {
    return 'Email is required';
  }
  
  if (email.length > 40) {
    return 'Email is too long (max 40 characters)';
  }
  
  if (!emailRegex.test(email)) {
    return 'Please enter a valid email address';
  }
  
  return null;
};

export const validatePassword = (password: string): string | null => {
  if (!password) {
    return 'Password is required';
  }
  
  if (password.length < MIN_SIZE) {
    return `Password must be at least ${MIN_SIZE} characters long`;
  }
  
  if (password.length > MAX_SIZE) {
    return `Password must be less than ${MAX_SIZE} characters long`;
  }
  
  if (!/[a-z]/.test(password)) {
    return 'Password must contain at least one lowercase letter';
  }
  
  if (!/[A-Z]/.test(password)) {
    return 'Password must contain at least one uppercase letter';
  }
  
  if (!/[0-9]/.test(password)) {
    return 'Password must contain at least one number';
  }
  
  const specialCharsRegex = new RegExp(`[${SPECIAL_CHARS}]`);
  if (!specialCharsRegex.test(password)) {
    return `Password must contain at least one special character (${SPECIAL_CHARS})`;
  }
  
  const allowedCharsRegex = /^[a-zA-Z0-9@$!%*?&_-]+$/;
  if (!allowedCharsRegex.test(password)) {
    return 'Password contains invalid characters';
  }
  
  for (let i = 0; i < password.length - 2; i++) {
    if (password[i] === password[i + 1] && password[i] === password[i + 2]) {
      return 'Password should not contain repeated characters';
    }
  }
  
  return null;
};