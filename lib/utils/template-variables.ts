/**
 * Utility functions for extracting and handling template variables
 */

/**
 * Extract variable names from template content
 * Variables are in the format {{variable_name}}
 */
export function extractVariables(content: string): string[] {
  const regex = /\{\{(\w+)\}\}/g
  const matches = content.matchAll(regex)
  const variables = new Set<string>()
  
  for (const match of matches) {
    if (match[1]) {
      variables.add(match[1])
    }
  }
  
  return Array.from(variables).sort()
}

/**
 * Replace variables in template content with provided values
 */
export function replaceVariables(
  content: string,
  values: Record<string, string>
): string {
  let result = content
  
  for (const [key, value] of Object.entries(values)) {
    const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g')
    result = result.replace(regex, value)
  }
  
  return result
}

/**
 * Get sample values for variables based on variable names
 */
export function getSampleValues(variables: string[]): Record<string, string> {
  const samples: Record<string, string> = {}
  
  for (const variable of variables) {
    const lower = variable.toLowerCase()
    
    if (lower.includes('name') || lower.includes('employee')) {
      samples[variable] = 'John Doe'
    } else if (lower.includes('email')) {
      samples[variable] = 'john.doe@example.com'
    } else if (lower.includes('phone')) {
      samples[variable] = '+1 (555) 123-4567'
    } else if (lower.includes('date') || lower.includes('day')) {
      samples[variable] = new Date().toLocaleDateString()
    } else if (lower.includes('time')) {
      samples[variable] = new Date().toLocaleTimeString()
    } else if (lower.includes('company')) {
      samples[variable] = 'Acme Corporation'
    } else if (lower.includes('department')) {
      samples[variable] = 'Engineering'
    } else if (lower.includes('position') || lower.includes('role')) {
      samples[variable] = 'Software Engineer'
    } else if (lower.includes('address')) {
      samples[variable] = '123 Main St, City, State 12345'
    } else if (lower.includes('salary') || lower.includes('amount')) {
      samples[variable] = '$75,000'
    } else {
      samples[variable] = `[${variable}]`
    }
  }
  
  return samples
}


