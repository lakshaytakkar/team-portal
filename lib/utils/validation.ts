/**
 * Validation utilities for form fields
 */

export interface ValidationResult {
  isValid: boolean
  error?: string
}

/**
 * Validates if a field is required and not empty
 */
export function validateRequired(value: string | undefined | null): ValidationResult {
  if (!value || value.trim().length === 0) {
    return {
      isValid: false,
      error: "This field is required",
    }
  }
  return { isValid: true }
}

/**
 * Validates email format
 */
export function validateEmail(email: string | undefined | null): ValidationResult {
  if (!email || email.trim().length === 0) {
    return {
      isValid: false,
      error: "Email is required",
    }
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return {
      isValid: false,
      error: "Please enter a valid email address",
    }
  }

  return { isValid: true }
}

/**
 * Validates minimum length
 */
export function validateMinLength(
  value: string | undefined | null,
  minLength: number
): ValidationResult {
  if (!value) {
    return {
      isValid: false,
      error: "This field is required",
    }
  }

  if (value.length < minLength) {
    return {
      isValid: false,
      error: `Must be at least ${minLength} characters`,
    }
  }

  return { isValid: true }
}

/**
 * Validates maximum length
 */
export function validateMaxLength(
  value: string | undefined | null,
  maxLength: number
): ValidationResult {
  if (!value) return { isValid: true }

  if (value.length > maxLength) {
    return {
      isValid: false,
      error: `Must be no more than ${maxLength} characters`,
    }
  }

  return { isValid: true }
}

/**
 * Validates URL format
 */
export function validateUrl(url: string | undefined | null): ValidationResult {
  if (!url || url.trim().length === 0) {
    return { isValid: true } // URL is optional in most cases
  }

  try {
    new URL(url)
    return { isValid: true }
  } catch {
    return {
      isValid: false,
      error: "Please enter a valid URL",
    }
  }
}

/**
 * Validates date is not in the past
 */
export function validateDateNotPast(date: string | undefined | null): ValidationResult {
  if (!date) {
    return { isValid: true } // Date might be optional
  }

  const selectedDate = new Date(date)
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  if (selectedDate < today) {
    return {
      isValid: false,
      error: "Date cannot be in the past",
    }
  }

  return { isValid: true }
}

/**
 * Validates that end date is after start date
 */
export function validateDateRange(
  startDate: string | undefined | null,
  endDate: string | undefined | null
): ValidationResult {
  if (!startDate || !endDate) {
    return { isValid: true } // Both dates might be optional
  }

  const start = new Date(startDate)
  const end = new Date(endDate)

  if (end < start) {
    return {
      isValid: false,
      error: "End date must be after start date",
    }
  }

  return { isValid: true }
}

/**
 * Validates number is within range
 */
export function validateNumberRange(
  value: number | undefined | null,
  min: number,
  max: number
): ValidationResult {
  if (value === undefined || value === null) {
    return {
      isValid: false,
      error: "This field is required",
    }
  }

  if (value < min || value > max) {
    return {
      isValid: false,
      error: `Must be between ${min} and ${max}`,
    }
  }

  return { isValid: true }
}

