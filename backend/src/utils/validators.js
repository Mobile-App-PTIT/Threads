// utils/validators.js
const User = require('../models/user.model');

// Check if a value is a non-empty string
const isNonEmptyString = (value) => {
  return typeof value === 'string' && value.trim().length > 0;
};

// Check if a value is a valid email
const isEmail = (value) => {
  // Updated regex to disallow consecutive dots and dots at the start or end
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const consecutiveDotsRegex = /\.{2,}/;
  const startsOrEndsWithDotRegex = /^\.|\.$/;
  const dotBeforeAtRegex = /\.@/;

  return (
    emailRegex.test(value) &&
    !consecutiveDotsRegex.test(value) &&
    !startsOrEndsWithDotRegex.test(value) &&
    !dotBeforeAtRegex.test(value)
  );
};

// Check if an email is already in use
const isEmailInUse = async (email) => {
  const existingUser = await User.findOne({ email });
  return !!existingUser;
};

// Check if a value is a number
const isNumber = (value) => {
  return typeof value === 'number' && !isNaN(value);
};

// Check if a string's length is within a specified range
const isLength = (value, { min = 0, max = Infinity }) => {
  return (
    typeof value === 'string' && value.length >= min && value.length <= max
  );
};


// Format a date string to 'YYYY-MM-DD HH:MM:SS'
const formatDate = (date) => {
  const isoString = new Date(date).toISOString();
  return isoString.replace('T', ' ').substring(0, 19);
};

// Add more validation functions as needed

module.exports = {
  isNonEmptyString,
  isEmail,
  isEmailInUse,
  isNumber,
  isLength,
  formatDate
};
