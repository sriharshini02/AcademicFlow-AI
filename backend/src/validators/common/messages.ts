export const MESSAGES = {
  NAME: {
    'string.min': 'Name must be at least 3 characters long',
    'string.max': 'Name must be less than 30 characters long',
    'string.pattern.base': 'Name can contain letters, numbers, and single spaces only',
    'any.required': 'Name is required',
  },

  EMAIL: {
    'string.email': 'Invalid email address',
    'any.required': 'Email is required',
    'string.email.minDomainSegments': 'Email must contain at least 2 segments',
    'string.email.tlds': 'Email must contain a valid TLD',
    'string.empty': 'Email is required',
  },

  PASSWORD: {
    'string.pattern.base': 'Password must contain at least 1 letter, 1 number, 1 special character, and be at least 8 characters long',
    'string.min': 'Password must be at least 8 characters long',
    'string.max': 'Password must be less than 30 characters long',
    'string.empty': 'Password is required',
    'any.required': 'Password is required'
  },

  ROLE: {
    'any.only': `Role didn't match our records. Please try again.`,// HOD or Proctor
    'any.required': 'Role is required',
    'string.valid': 'Role must be either HOD or Proctor',
    'string.empty': 'Role is required',
  },
};
