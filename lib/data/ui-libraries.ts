export interface UILibrary {
  name: string
  description: string
  url: string
  type: "component-library" | "design-system" | "icon-library" | "utility"
  logo?: string
}

export const uiLibraries: UILibrary[] = [
  {
    name: "Radix UI",
    description: "Unstyled, accessible components for building design systems",
    url: "https://www.radix-ui.com",
    type: "component-library",
  },
  {
    name: "shadcn/ui",
    description: "Re-usable components built with Radix UI and Tailwind CSS",
    url: "https://ui.shadcn.com",
    type: "component-library",
  },
  {
    name: "Lucide Icons",
    description: "Beautiful & consistent icon toolkit",
    url: "https://lucide.dev",
    type: "icon-library",
  },
  {
    name: "Tailwind CSS",
    description: "Utility-first CSS framework",
    url: "https://tailwindcss.com/docs",
    type: "utility",
  },
  {
    name: "Figma Design System",
    description: "Our design system in Figma",
    url: "https://figma.com", // Update with actual Figma link
    type: "design-system",
  },
]

