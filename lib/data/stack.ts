export interface StackItem {
  name: string
  logo: string
  version?: string
  docsUrl: string
  description?: string
}

export const stackItems: StackItem[] = [
  {
    name: "Bun",
    logo: "/logos/Vector.svg", // Using placeholder, update with actual Bun logo if available
    version: "1.x",
    docsUrl: "https://bun.sh/docs",
    description: "Fast all-in-one JavaScript runtime",
  },
  {
    name: "Next.js",
    logo: "/logos/Vector.svg", // Update with Next.js logo if available
    version: "16.1.1",
    docsUrl: "https://nextjs.org/docs",
    description: "React framework for production",
  },
  {
    name: "TypeScript",
    logo: "/logos/Vector.svg", // Update with TypeScript logo if available
    version: "5.x",
    docsUrl: "https://www.typescriptlang.org/docs",
    description: "Typed JavaScript at any scale",
  },
  {
    name: "Tailwind CSS",
    logo: "/logos/Vector.svg", // Update with Tailwind logo if available
    version: "4.x",
    docsUrl: "https://tailwindcss.com/docs",
    description: "Utility-first CSS framework",
  },
  {
    name: "Supabase",
    logo: "/logos/Vector.svg", // Update with Supabase logo if available
    docsUrl: "https://supabase.com/docs",
    description: "Open source Firebase alternative",
  },
  {
    name: "React Query",
    logo: "/logos/Vector.svg", // Update with React Query logo if available
    version: "5.90.12",
    docsUrl: "https://tanstack.com/query/latest",
    description: "Powerful data synchronization for React",
  },
  {
    name: "Lucide React",
    logo: "/logos/Vector.svg", // Update with Lucide logo if available
    version: "0.562.0",
    docsUrl: "https://lucide.dev",
    description: "Beautiful & consistent icon toolkit",
  },
]

