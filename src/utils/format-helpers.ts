/**
 * Helper functions for formatting display values
 */

/**
 * Capitalizes first letter and replaces underscores with spaces
 * Examples:
 * - "villa_mercedes" -> "Villa Mercedes"
 * - "femenino" -> "Femenino"
 * - "buenos_aires" -> "Buenos Aires"
 */
export function formatEnumValue(value: string | undefined | null): string {
  if (!value) return '';
  
  return value
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

/**
 * Formats gender values
 */
export function formatGender(gender: string | undefined | null): string {
  if (!gender) return '';
  return formatEnumValue(gender);
}

/**
 * Formats city names
 */
export function formatCity(city: string | undefined | null): string {
  if (!city) return '';
  return formatEnumValue(city);
}
