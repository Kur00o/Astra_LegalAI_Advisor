import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Mask sensitive info, such as person names and company-like phrases, with generic placeholders
 * Very basic regex masking - can be replaced with more sophisticated PII detection
 */
export function maskSensitiveData(text: string): string {
  // Example: Replace names that look like 'John Doe' (two capitalized words)
  text = text.replace(/\b([A-Z][a-z]+\s[A-Z][a-z]+)\b/g, '[REDACTED_NAME]');

  // Example: Replace company-like names (e.g. Acme Inc., Some Corp.)
  text = text.replace(/\b([A-Z][a-zA-Z]+\s(?:Inc|Corp|LLC|Ltd|Limited|Corporation|Co)\.?)/g, '[REDACTED_COMPANY]');

  // Add more patterns as needed (emails, phone numbers, etc).
  return text;
}