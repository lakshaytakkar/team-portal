/**
 * Seed data for verticals (business lines)
 * These are the top-level business units in the organization
 */

export interface SeedVertical {
  name: string
  code: string
  description?: string
}

export const seedVerticals: SeedVertical[] = [
  {
    name: 'Legal Nations',
    code: 'legalnations',
    description: 'LLC formation and legal services',
  },
  {
    name: 'Goyo Tours',
    code: 'goyo-tours',
    description: 'China tour delegation services',
  },
  {
    name: 'USDrop AI',
    code: 'usdrop-ai',
    description: 'US Dropshipping operations',
  },
  {
    name: 'Faire USA',
    code: 'faire-usa',
    description: 'USA wholesale marketplace',
  },
  {
    name: 'Brand Development',
    code: 'brand-development',
    description: 'Brand development and marketing',
  },
]


