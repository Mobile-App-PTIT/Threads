// utils/validators.js
const User = require("../models/user.model");

// Check if a value is a non-empty string
function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

// Check if a value is a valid email
function isEmail(value) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(value);
}

// Check if an email is already in use
async function isEmailInUse(email) {
  const existingUser = await User.findOne({ email });
  return !!existingUser;
}

// Check if a value is a number
function isNumber(value) {
  return typeof value === "number" && !isNaN(value);
}

// Check if a string's length is within a specified range
function isLength(value, { min = 0, max = Infinity }) {
  return (
    typeof value === "string" && value.length >= min && value.length <= max
  );
}

// Add more validation functions as needed

module.exports = {
  isNonEmptyString,
  isEmail,
  isEmailInUse,
  isNumber,
  isLength,
};
