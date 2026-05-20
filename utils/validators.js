/**
 * Validate URL format
 * @param {string} url - URL to validate
 * @returns {boolean}
 */
function isValidUrl(url) {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean}
 */
function isValidEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

/**
 * Validate MongoDB ObjectId
 * @param {string} id - ID to validate
 * @returns {boolean}
 */
function isValidObjectId(id) {
  return /^[0-9a-fA-F]{24}$/.test(id);
}

/**
 * Validate Facebook User ID
 * @param {string|number} uid - Facebook UID
 * @returns {boolean}
 */
function isValidFacebookUID(uid) {
  return /^\d{5,}$/.test(String(uid));
}

/**
 * Sanitize user input to prevent injection
 * @param {string} input - User input
 * @returns {string}
 */
function sanitizeInput(input) {
  if (typeof input !== 'string') return '';
  return input
    .trim()
    .replace(/[<>"'`]/g, '')
    .substring(0, 1000);
}

/**
 * Validate file size
 * @param {number} size - File size in bytes
 * @param {number} maxSize - Max size in bytes (default 50MB)
 * @returns {boolean}
 */
function isValidFileSize(size, maxSize = 50 * 1024 * 1024) {
  return size > 0 && size <= maxSize;
}

module.exports = {
  isValidUrl,
  isValidEmail,
  isValidObjectId,
  isValidFacebookUID,
  sanitizeInput,
  isValidFileSize
};
