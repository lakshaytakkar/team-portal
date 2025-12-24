// Avatar utility using DiceBear Micah
// Generates deterministic avatars based on user identifiers

import { createAvatar } from "@dicebear/core"
import { micah } from "@dicebear/collection"

/**
 * Pure function to get avatar URL for a user ID or name.
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

