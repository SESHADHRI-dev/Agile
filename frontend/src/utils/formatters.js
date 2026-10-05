/**
 * Centralized Indian Localization Utilities for IntelliStock
 * Supports:
 * - Indian Rupee (INR / ₹) formatting: formatINR(125000) -> "₹1,25,000.00"
 * - Indian Number system formatting: formatIndianNumber(125000) -> "1,25,000"
 * - Indian Standard Date format: formatIndianDate("2026-10-06T14:30:00Z") -> "06 Oct 2026"
 * - Indian Standard DateTime format: formatIndianDateTime("2026-10-06T14:30:00Z") -> "06 Oct 2026, 08:00 PM IST"
 * - Indian Mobile Number validation & formatting: +91 XXXXX XXXXX
 */

/**
 * Formats a monetary value into Indian Rupees (INR / ₹) with standard Indian numbering (Lakhs/Crores).
 * @param {number|string} amount 
 * @param {boolean} showFraction - whether to include decimal paise (.00)
 * @returns {string} e.g. "₹1,25,000.00" or "₹1,25,000"
 */
export function formatINR(amount, showFraction = true) {
  const num = Number(amount);
  if (isNaN(num)) return '₹0.00';

  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: showFraction ? 2 : 0,
    maximumFractionDigits: 2
  }).format(num);
}

/**
 * Formats a raw number in the Indian numbering system (e.g., 1,00,000 instead of 100,000).
 * @param {number|string} value 
 * @returns {string} e.g. "1,25,000"
 */
export function formatIndianNumber(value) {
  const num = Number(value);
  if (isNaN(num)) return '0';
  return new Intl.NumberFormat('en-IN').format(num);
}

/**
 * Formats an ISO UTC timestamp into standard Indian Date format: DD MMM YYYY (e.g. 06 Oct 2026) in IST timezone.
 * @param {string|Date} dateInput 
 * @returns {string} e.g. "06 Oct 2026"
 */
export function formatIndianDate(dateInput) {
  if (!dateInput) return '—';
  try {
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return '—';

    return d.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      timeZone: 'Asia/Kolkata'
    });
  } catch (err) {
    return String(dateInput).slice(0, 10);
  }
}

/**
 * Formats an ISO UTC timestamp into Indian Standard Date & Time: DD MMM YYYY, hh:mm A IST.
 * @param {string|Date} dateInput 
 * @returns {string} e.g. "06 Oct 2026, 02:30 PM"
 */
export function formatIndianDateTime(dateInput) {
  if (!dateInput) return '—';
  try {
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return '—';

    const dateStr = d.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      timeZone: 'Asia/Kolkata'
    });

    const timeStr = d.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
      timeZone: 'Asia/Kolkata'
    });

    return `${dateStr}, ${timeStr}`;
  } catch (err) {
    return String(dateInput).slice(0, 19).replace('T', ' ');
  }
}

/**
 * Validates a 10-digit Indian Mobile number or +91 format.
 * @param {string} phone 
 * @returns {boolean}
 */
export function isValidIndianPhone(phone) {
  if (!phone) return false;
  const cleaned = phone.replace(/[\s\-\(\)]/g, '');
  // Matches 10 digits starting with 6, 7, 8, 9, or prefixed with +91 / 91 / 0
  const indianPhoneRegex = /^(?:\+91|91|0)?[6-9]\d{9}$/;
  return indianPhoneRegex.test(cleaned);
}

/**
 * Normalizes Indian phone number to "+91 XXXXX XXXXX"
 * @param {string} phone 
 * @returns {string}
 */
export function formatIndianPhone(phone) {
  if (!phone) return '';
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 10) {
    return `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`;
  } else if (digits.length === 12 && digits.startsWith('91')) {
    return `+91 ${digits.slice(2, 7)} ${digits.slice(7)}`;
  }
  return phone;
}

/**
 * Validates 6-digit Indian Postal PIN code.
 * @param {string} pincode 
 * @returns {boolean}
 */
export function isValidIndianPinCode(pincode) {
  if (!pincode) return false;
  return /^[1-9][0-9]{5}$/.test(pincode.trim());
}

/**
 * Validates 15-character Indian GSTIN (Goods and Services Tax Identification Number).
 * Format: 2 digits (State code) + 5 chars (PAN) + 4 digits (PAN) + 1 char (PAN) + 1 digit (entity) + 'Z' + 1 checksum
 * Example: 33AAAAA0000A1Z5
 * @param {string} gstin 
 * @returns {boolean}
 */
export function isValidGSTIN(gstin) {
  if (!gstin) return false;
  const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
  return gstinRegex.test(gstin.trim().toUpperCase());
}

/**
 * Standard list of Indian States and Union Territories.
 */
export const INDIAN_STATES = [
  'Tamil Nadu',
  'Karnataka',
  'Kerala',
  'Andhra Pradesh',
  'Telangana',
  'Maharashtra',
  'Gujarat',
  'Rajasthan',
  'Delhi (NCT)',
  'Uttar Pradesh',
  'West Bengal',
  'Odisha',
  'Madhya Pradesh',
  'Punjab',
  'Haryana',
  'Bihar',
  'Jharkhand',
  'Assam',
  'Goa',
  'Himachal Pradesh',
  'Uttarakhand',
  'Chhattisgarh',
  'Jammu and Kashmir',
  'Puducherry',
  'Chandigarh'
];

/**
 * Standard Indian Industrial / Business Product Categories.
 */
export const INDIAN_PRODUCT_CATEGORIES = [
  'Electrical Components',
  'Hardware',
  'Packaging Materials',
  'Industrial Tools',
  'Computer Accessories',
  'Safety Equipment',
  'Plumbing Materials',
  'Cleaning Supplies',
  'Office Supplies',
  'Stationery'
];
