#!/usr/bin/env node

/**
 * i18n Library for VCSCI Scripts
 *
 * Provides internationalization support for Node.js scripts with:
 * - Language detection from environment
 * - Message loading from locale files
 * - Translation functions with variable replacement
 * - Helper functions for bilingual JSON field access
 *
 * Usage:
 *   const { detectLanguage, loadMessages, t } = require('./lib/i18n');
 *   const lang = detectLanguage();
 *   const msg = loadMessages(lang, 'scripts');
 *   console.log(msg.loading_scores);
 */

const fs = require('fs');
const path = require('path');

// Cache for loaded messages
const messageCache = {};

/**
 * Detect language from environment variables or system locale
 *
 * Priority:
 * 1. VCSCI_LANG environment variable
 * 2. LANG environment variable
 * 3. LANGUAGE environment variable
 * 4. Default to 'en'
 *
 * @returns {string} Language code ('es' or 'en')
 */
function detectLanguage() {
  // Check VCSCI-specific environment variable first
  if (process.env.VCSCI_LANG) {
    const lang = process.env.VCSCI_LANG.toLowerCase();
    if (lang === 'es' || lang === 'en') {
      return lang;
    }
  }

  // Check system LANG environment variable
  const systemLang = process.env.LANG || process.env.LANGUAGE || '';
  const langPrefix = systemLang.split('_')[0].split('.')[0].toLowerCase();

  if (langPrefix === 'es' || langPrefix.startsWith('es')) {
    return 'es';
  }

  // Default to English
  return 'en';
}

/**
 * Load messages from locale files
 *
 * @param {string} lang - Language code ('es' or 'en')
 * @param {string} scope - Optional scope to load (e.g., 'scripts', 'ui', 'reports')
 *                         If not provided, loads all messages
 * @returns {Object} Messages object
 * @throws {Error} If locale file not found or invalid JSON
 */
function loadMessages(lang, scope = null) {
  // Validate language
  if (lang !== 'es' && lang !== 'en') {
    throw new Error(`Invalid language: ${lang}. Must be 'es' or 'en'.`);
  }

  // Check cache first
  const cacheKey = `${lang}:${scope || 'all'}`;
  if (messageCache[cacheKey]) {
    return messageCache[cacheKey];
  }

  // Construct path to locale file (relative to this script)
  const localesDir = path.resolve(__dirname, '../../locales');
  const localeFile = path.join(localesDir, `${lang}.json`);

  // Check if file exists
  if (!fs.existsSync(localeFile)) {
    throw new Error(`Locale file not found: ${localeFile}`);
  }

  // Load and parse JSON
  let messages;
  try {
    const content = fs.readFileSync(localeFile, 'utf8');
    messages = JSON.parse(content);
  } catch (error) {
    throw new Error(`Error loading locale file ${localeFile}: ${error.message}`);
  }

  // Return scoped messages if scope provided
  if (scope) {
    if (!messages[scope]) {
      throw new Error(`Scope '${scope}' not found in locale file ${localeFile}`);
    }
    messageCache[cacheKey] = messages[scope];
    return messages[scope];
  }

  // Return all messages
  messageCache[cacheKey] = messages;
  return messages;
}

/**
 * Translate a key with optional variable replacements
 *
 * @param {string} key - Message key (can use dot notation like 'scripts.loading_scores')
 * @param {string} lang - Language code ('es' or 'en')
 * @param {Object} replacements - Optional object with variable replacements
 * @returns {string} Translated message
 *
 * Example:
 *   t('scripts.loading_file', 'es', { file: 'data.json' })
 *   // Returns: "Cargando archivo data.json..."
 */
function t(key, lang, replacements = {}) {
  // Load all messages for the language
  const messages = loadMessages(lang);

  // Navigate to the key using dot notation
  const keys = key.split('.');
  let value = messages;

  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = value[k];
    } else {
      // Key not found, return the key itself
      return key;
    }
  }

  // If value is not a string, return the key
  if (typeof value !== 'string') {
    return key;
  }

  // Apply replacements
  let result = value;
  for (const [placeholder, replacement] of Object.entries(replacements)) {
    const regex = new RegExp(`{{\\s*${placeholder}\\s*}}`, 'g');
    result = result.replace(regex, replacement);
  }

  return result;
}

/**
 * Get field name from bilingual object based on language
 *
 * Helper function to access fields with _es/_en suffixes
 *
 * @param {Object} obj - Object with bilingual fields
 * @param {string} field - Base field name (without _es/_en suffix)
 * @param {string} lang - Language code ('es' or 'en')
 * @returns {*} Field value in the specified language
 *
 * Example:
 *   const phrase = { text_es: "Hola", text_en: "Hello" };
 *   getFieldName(phrase, 'text', 'es');  // Returns: "Hola"
 *   getFieldName(phrase, 'text', 'en');  // Returns: "Hello"
 */
function getFieldName(obj, field, lang) {
  if (!obj || typeof obj !== 'object') {
    return undefined;
  }

  const suffix = lang === 'en' ? '_en' : '_es';
  const fieldName = `${field}${suffix}`;

  return obj[fieldName];
}

/**
 * Get all field names from bilingual object
 *
 * Returns an object with both language versions
 *
 * @param {Object} obj - Object with bilingual fields
 * @param {string} field - Base field name (without _es/_en suffix)
 * @returns {Object} Object with 'es' and 'en' properties
 *
 * Example:
 *   const phrase = { text_es: "Hola", text_en: "Hello" };
 *   getBilingualField(phrase, 'text');
 *   // Returns: { es: "Hola", en: "Hello" }
 */
function getBilingualField(obj, field) {
  if (!obj || typeof obj !== 'object') {
    return { es: undefined, en: undefined };
  }

  return {
    es: obj[`${field}_es`],
    en: obj[`${field}_en`]
  };
}

/**
 * Validate that an object has complete bilingual fields
 *
 * Checks that for every _es field, there's a corresponding _en field
 *
 * @param {Object} obj - Object to validate
 * @param {Array<string>} requiredFields - Array of base field names to check
 * @returns {Object} Validation result with { valid: boolean, missing: Array<string> }
 *
 * Example:
 *   const phrase = { text_es: "Hola", text_en: "Hello", domain_es: "Salud" };
 *   validateBilingualFields(phrase, ['text', 'domain']);
 *   // Returns: { valid: false, missing: ['domain_en'] }
 */
function validateBilingualFields(obj, requiredFields) {
  const missing = [];

  for (const field of requiredFields) {
    const esField = `${field}_es`;
    const enField = `${field}_en`;

    if (obj[esField] && !obj[enField]) {
      missing.push(enField);
    }
    if (obj[enField] && !obj[esField]) {
      missing.push(esField);
    }
  }

  return {
    valid: missing.length === 0,
    missing
  };
}

/**
 * Clear message cache
 *
 * Useful for testing or when locale files are updated during runtime
 */
function clearCache() {
  Object.keys(messageCache).forEach(key => delete messageCache[key]);
}

// Export functions
module.exports = {
  detectLanguage,
  loadMessages,
  t,
  getFieldName,
  getBilingualField,
  validateBilingualFields,
  clearCache
};

// CLI mode: if run directly, display language info
if (require.main === module) {
  const lang = detectLanguage();
  console.log(`Detected language: ${lang}`);
  console.log(`VCSCI_LANG: ${process.env.VCSCI_LANG || '(not set)'}`);
  console.log(`LANG: ${process.env.LANG || '(not set)'}`);
  console.log(`LANGUAGE: ${process.env.LANGUAGE || '(not set)'}`);

  try {
    const messages = loadMessages(lang, 'scripts');
    console.log(`\nLoaded ${Object.keys(messages).length} message keys for scope 'scripts'`);
    console.log(`Example message: ${messages.loading_scores || '(not found)'}`);
  } catch (error) {
    console.error(`\nError loading messages: ${error.message}`);
  }
}
