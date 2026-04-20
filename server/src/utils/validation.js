const { createHttpError } = require('./http-error');

function fail(message) {
  throw createHttpError(400, message, 'VALIDATION_ERROR');
}

function ensureObject(value, fieldName = 'payload') {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    fail(`${fieldName} must be an object`);
  }

  return value;
}

function readString(value, field, options = {}) {
  const {
    required = true,
    min = 0,
    max = 5000,
    allowEmpty = false,
  } = options;

  if (value == null) {
    if (required) fail(`${field} is required`);
    return undefined;
  }

  if (typeof value !== 'string') {
    fail(`${field} must be a string`);
  }

  const trimmed = value.trim();

  if (!allowEmpty && trimmed.length === 0) {
    if (required) fail(`${field} is required`);
    return undefined;
  }

  if (trimmed.length < min) {
    fail(`${field} must be at least ${min} characters`);
  }

  if (trimmed.length > max) {
    fail(`${field} must be at most ${max} characters`);
  }

  return trimmed;
}

function readEmail(value, field = 'email', options = {}) {
  const email = readString(value, field, { ...options, min: 5, max: 160 });
  if (email === undefined) return undefined;

  const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  if (!isValid) {
    fail(`${field} must be a valid email`);
  }

  return email.toLowerCase();
}

function readEnum(value, field, allowedValues, options = {}) {
  const raw = readString(value, field, { ...options, max: 80 });
  if (raw === undefined) return undefined;

  const normalized = raw.toLowerCase();
  if (!allowedValues.includes(normalized)) {
    fail(`${field} must be one of: ${allowedValues.join(', ')}`);
  }

  return normalized;
}

function readBoolean(value, field, options = {}) {
  if (value == null) {
    if (options.required) fail(`${field} is required`);
    return undefined;
  }

  if (typeof value !== 'boolean') {
    fail(`${field} must be a boolean`);
  }

  return value;
}

function readNumber(value, field, options = {}) {
  const { required = true, min, max } = options;

  if (value == null || value === '') {
    if (required) fail(`${field} is required`);
    return undefined;
  }

  const number = Number(value);
  if (!Number.isFinite(number)) {
    fail(`${field} must be a valid number`);
  }

  if (typeof min === 'number' && number < min) {
    fail(`${field} must be greater than or equal to ${min}`);
  }

  if (typeof max === 'number' && number > max) {
    fail(`${field} must be less than or equal to ${max}`);
  }

  return number;
}

function readDate(value, field, options = {}) {
  const raw = readString(value, field, { ...options, max: 40 });
  if (raw === undefined) return undefined;

  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) {
    fail(`${field} must be a valid date`);
  }

  return raw;
}

function readArray(value, field, options = {}) {
  if (value == null) {
    if (options.required) fail(`${field} is required`);
    return undefined;
  }

  if (!Array.isArray(value)) {
    fail(`${field} must be an array`);
  }

  if (typeof options.min === 'number' && value.length < options.min) {
    fail(`${field} must contain at least ${options.min} item(s)`);
  }

  return value;
}

module.exports = {
  ensureObject,
  readString,
  readEmail,
  readEnum,
  readBoolean,
  readNumber,
  readDate,
  readArray,
};
