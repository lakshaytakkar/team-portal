/**
 * Seed data for roles (skill templates)
 * These are reusable role definitions that can be used across departments
 */

export interface SeedRole {
  name: string
  description?: string
}

export const seedRoles: SeedRole[] = [
  {
    name: 'Sales Executive',
    description: 'Entry-level sales role',
  },
  {
    name: 'Senior Sales Executive',
    description: 'Experienced sales role with leadership responsibilities',
  },
  {
    name: 'Operations Executive',
    description: 'Operations management role',
  },
  {
    name: 'Vendor Coordinator',
    description: 'Coordinates with vendors and suppliers',
  },
  {
    name: 'Customer Support Executive',
    description: 'Handles customer support and inquiries',
  },
  {
    name: 'Video Editor',
    description: 'Creates and edits video content',
  },
  {
    name: 'Automation Engineer',
    description: 'Builds and maintains automation systems',
  },
  {
    name: 'HR Coordinator',
    description: 'Human resources coordination and administration',
  },
]



