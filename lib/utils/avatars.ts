// Avatar utility using DiceBear Micah for people and DiceBear Glass for other entities
// Generates deterministic avatars based on identifiers

import { createAvatar } from "@dicebear/core"
import { micah, glass } from "@dicebear/collection"

/**
 * Pure function to get avatar URL for a user ID or name (people).
 * Uses DiceBear Micah style for people.
 * This function is deterministic and will always return the same avatar for the same seed.
 * This ensures consistency between server-side and client-side rendering.
 * 
 * @param seed - User ID, email, or name to use as seed for avatar generation
 * @returns Data URL of the generated avatar SVG
 */
export function getAvatarForUser(seed: string): string {
  const avatar = createAvatar(micah, {
    seed: seed,
    size: 128,
  })
  
  return avatar.toDataUri()
}

/**
 * Get avatar URL for a user by name (uses name as seed)
 * @param name - User's name to use as seed
 * @returns Data URL of the generated avatar SVG
 */
export function getAvatarByName(name: string): string {
  return getAvatarForUser(name)
}

/**
 * Get avatar URL for a user by ID (uses ID as seed)
 * @param userId - User's ID to use as seed
 * @returns Data URL of the generated avatar SVG
 */
export function getAvatarById(userId: string): string {
  return getAvatarForUser(userId)
}

/**
 * Pure function to get avatar URL for non-person entities (projects, companies, departments, etc.).
 * Uses DiceBear Glass style for non-person entities.
 * This function is deterministic and will always return the same avatar for the same seed.
 * 
 * @param seed - Entity ID or name to use as seed for avatar generation
 * @returns Data URL of the generated avatar SVG
 */
export function getAvatarForEntity(seed: string): string {
  const avatar = createAvatar(glass, {
    seed: seed,
    size: 128,
  })
  
  return avatar.toDataUri()
}

