import { PublicKey } from "@solana/web3.js";
import { ValidationError } from "./errors";

/**
 * Validates that a string is a valid Solana public key
 */
export function validatePublicKey(key: string): PublicKey {
  try {
    return new PublicKey(key);
  } catch (error) {
    throw new ValidationError(`Invalid public key format: ${key}`);
  }
}

/**
 * Validates that a string is a valid URL
 */
export function validateUrl(url: string): void {
  try {
    new URL(url);
  } catch (error) {
    throw new ValidationError(`Invalid URL format: ${url}`);
  }
}

/**
 * Validates that a value is a valid percentage (0-100)
 */
export function validatePercentage(value: number): void {
  if (typeof value !== "number" || isNaN(value)) {
    throw new ValidationError("Percentage must be a number");
  }
  if (value < 0 || value > 100) {
    throw new ValidationError("Percentage must be between 0 and 100");
  }
}

/**
 * Validates that a value is a positive number
 */
export function validatePositiveNumber(value: number, fieldName: string): void {
  if (typeof value !== "number" || isNaN(value)) {
    throw new ValidationError(`${fieldName} must be a number`);
  }
  if (value <= 0) {
    throw new ValidationError(`${fieldName} must be positive`);
  }
}

/**
 * Validates that an array is not empty
 */
export function validateNonEmptyArray<T>(
  array: T[],
  fieldName: string
): void {
  if (!Array.isArray(array) || array.length === 0) {
    throw new ValidationError(`${fieldName} must be a non-empty array`);
  }
}
