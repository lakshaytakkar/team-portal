/**
 * Error Handling Utilities
 *
 * Provides functions to parse database errors and generate user-friendly error messages.
 */

/**
 * Database error types
 */
export type DatabaseErrorType =
  | 'foreign_key_violation'
  | 'unique_violation'
  | 'not_null_violation'
  | 'check_violation'
  | 'unknown'

/**
 * Parsed database error information
 */
export interface ParsedDatabaseError {
  type: DatabaseErrorType
  message: string
  field?: string
  constraint?: string
}

/**
 * Checks if an error is a Postgres error
 */
function isPostgresError(error: unknown): error is { code?: string; message?: string; detail?: string; constraint?: string } {
  return (
    typeof error === 'object' &&
    error !== null &&
    ('code' in error || 'message' in error || 'detail' in error)
  )
}

/**
 * Parses a database error and returns structured information
 */
export function parseDatabaseError(error: unknown): ParsedDatabaseError {
  if (!isPostgresError(error)) {
    // Not a database error, return as-is
    return {
      type: 'unknown',
      message: error instanceof Error ? error.message : String(error),
    }
  }

  const code = error.code
  const message = error.message || 'Database error occurred'
  const detail = error.detail || ''
  const constraint = error.constraint || ''

  // Foreign key violation
  if (code === '23503') {
    // Extract field name from constraint or detail
    let field = 'related record'
    if (constraint) {
      // Constraint names often follow pattern: table_field_fkey
      const match = constraint.match(/(\w+)_fkey$/)
      if (match) {
        field = match[1].replace(/_/g, ' ')
      }
    } else if (detail) {
      // Detail format: "Key (field)=(value) is not present in table"
      const match = detail.match(/Key \((\w+)\)=/)
      if (match) {
        field = match[1].replace(/_/g, ' ')
      }
    }

    return {
      type: 'foreign_key_violation',
      message: `The selected ${field} does not exist or is invalid`,
      field,
      constraint,
    }
  }

  // Unique violation
  if (code === '23505') {
    let field = 'field'
    if (constraint) {
      // Constraint names often follow pattern: table_field_key or table_field_unique
      const match = constraint.match(/(\w+)_(key|unique)$/)
      if (match) {
        field = match[1].replace(/_/g, ' ')
      }
    } else if (detail) {
      // Detail format: "Key (field)=(value) already exists"
      const match = detail.match(/Key \((\w+)\)=/)
      if (match) {
        field = match[1].replace(/_/g, ' ')
      }
    }

    return {
      type: 'unique_violation',
      message: `This ${field} is already in use. Please choose a different value.`,
      field,
      constraint,
    }
  }

  // Not null violation
  if (code === '23502') {
    let field = 'field'
    if (detail) {
      // Detail format: "null value in column "field" violates not-null constraint"
      const match = detail.match(/column "(\w+)"/)
      if (match) {
        field = match[1].replace(/_/g, ' ')
      }
    }

    return {
      type: 'not_null_violation',
      message: `${field.charAt(0).toUpperCase() + field.slice(1)} is required`,
      field,
    }
  }

  // Check violation
  if (code === '23514') {
    return {
      type: 'check_violation',
      message: 'The provided data does not meet the required constraints',
      constraint,
    }
  }

  // Unknown error
  return {
    type: 'unknown',
    message: message || 'An unexpected database error occurred',
  }
}

/**
 * Generates a user-friendly error message from a database error
 */
export function getUserFriendlyErrorMessage(error: unknown): string {
  const parsed = parseDatabaseError(error)
  return parsed.message
}

/**
 * Logs a database error with full details for debugging
 */
export function logDatabaseError(error: unknown, context?: string): void {
  const parsed = parseDatabaseError(error)
  const contextMsg = context ? `[${context}] ` : ''

  console.error(`${contextMsg}Database Error:`, {
    type: parsed.type,
    message: parsed.message,
    field: parsed.field,
    constraint: parsed.constraint,
    originalError: error,
  })
}

/**
 * Creates a standardized error response for API/server actions
 */
export function createErrorResponse(error: unknown, context?: string): {
  success: false
  error: string
  details?: unknown
} {
  const parsed = parseDatabaseError(error)
  logDatabaseError(error, context)

  return {
    success: false,
    error: parsed.message,
    details: process.env.NODE_ENV === 'development' ? error : undefined,
  }
}


