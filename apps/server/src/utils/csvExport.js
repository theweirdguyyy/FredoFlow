import { createObjectCsvStringifier } from 'csv-writer';

/**
 * Convert an array of objects to a CSV string.
 * @param {Array} data - Array of objects
 * @param {Array} headers - Array of header keys
 * @returns {String} CSV string
 */
export function jsonToCsv(data, headers) {
  if (!data || data.length === 0) return '';
  
  // If headers not provided, use keys from first object
  const headerKeys = headers || Object.keys(data[0]);

  const csvStringifier = createObjectCsvStringifier({
    header: headerKeys.map(key => ({ id: key, title: key.toUpperCase() }))
  });

  return csvStringifier.getHeaderString() + csvStringifier.stringifyRecords(data);
}
