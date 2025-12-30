/**
 * Simple formatting utilities for template content
 */

/**
 * Format content for WhatsApp display
 * Removes excessive line breaks and normalizes spacing
 */
export function formatWhatsAppTemplate(content: string): string {
  // Preserve line breaks but normalize multiple consecutive line breaks
  return content
    .replace(/\n{3,}/g, '\n\n') // Replace 3+ line breaks with 2
    .trim()
}

/**
 * Format content for Email display
 * Preserves structure and formatting
 */
export function formatEmailTemplate(content: string): string {
  // Preserve all formatting as-is
  return content.trim()
}

/**
 * Format content for general display
 * Preserves line breaks and basic formatting
 */
export function formatTemplateContent(content: string): string {
  return content.trim()
}

