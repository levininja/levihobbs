/**
 * Converts a PascalCase string to camelCase
 */
function toCamelCase(str: string): string {
  return str.charAt(0).toLowerCase() + str.slice(1);
}

/**
 * Recursively converts all object keys from PascalCase to camelCase
 */
export function convertToCamelCase<T>(obj: unknown): T {
  if (obj === null || obj === undefined) {
    return obj as T;
  }

  if (Array.isArray(obj)) {
    if (!obj || obj.length === 0) {
      return obj as T;
    }
    try {
      return obj.map(item => {
        if (item === null || item === undefined) {
          return item;
        }
        try {
          return convertToCamelCase(item);
        } catch (error) {
          return item;
        }
      }) as T;
    } catch (error) {
      return obj as T;
    }
  }

  if (typeof obj === 'object') {
    const camelCaseObj: Record<string, unknown> = {};
    
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        const camelKey = toCamelCase(key);
        camelCaseObj[camelKey] = convertToCamelCase((obj as Record<string, unknown>)[key]);
      }
    }
    
    return camelCaseObj as T;
  }

  return obj as T;
}

/**
 * Converts a BookReviewsViewModel from PascalCase to camelCase
 */
export function convertBookReviewsViewModel(data: unknown): unknown {
  return convertToCamelCase(data);
}

/**
 * Converts an array of BookReview objects from PascalCase to camelCase
 */
export function convertBookReviews(data: unknown[]): unknown[] {
  return convertToCamelCase(data);
}

/**
 * Converts names like "2025-reading-list" to "2025 Reading List".
 */
export function convertKebabCaseToDisplayCase(name: string | null | undefined): string {
  if (!name || typeof name !== 'string') {
    return '';
  }
  return name
    .replace(/-/g, ' ')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

/**
 * Converts lowercase kebab-case to uppercase kebab-case,
 * like "heart-warming" to "Heart-Warming".
 */
export function convertLowerCaseKebabToUpperCaseKebab(name: string): string {
  return name
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join('-');
}