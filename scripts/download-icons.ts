// Script to download icons from Figma
import { writeFileSync } from "fs"
import { join } from "path"

// Icon node IDs mapped to their names
const iconNodes: Array<{ id: string; name: string; url?: string }> = [
  { id: "217:1486", name: "home-13", url: "https://www.figma.com/api/mcp/asset/707c6a9b-fa20-4e53-b5bc-bcac286023bf" },
  { id: "217:1635", name: "check", url: "https://www.figma.com/api/mcp/asset/00b88a3e-4ca8-4452-ae67-65f62e717c57" },
  { id: "219:2837", name: "chevron-left", url: "https://www.figma.com/api/mcp/asset/46eb1f36-0839-4054-a984-21e7558ad94f" },
  { id: "217:1480", name: "search-01", url: "https://www.figma.com/api/mcp/asset/f91803b4-a018-4fc0-9daa-098b8e6b1aa5" },
  { id: "217:1722", name: "log-out-05", url: "https://www.figma.com/api/mcp/asset/cf9bccbe-f0e8-42eb-b45e-c9ec4eba27e1" },
]

async function downloadIcon(url: string, filePath: string) {
  try {
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`Failed to fetch ${url}: ${response.statusText}`)
    }
    const svgContent = await response.text()
    writeFileSync(filePath, svgContent, "utf-8")
    console.log(`Downloaded: ${filePath}`)
  } catch (error) {
    console.error(`Error downloading ${url}:`, error)
  }
}

async function main() {
  const iconsDir = join(process.cwd(), "public", "icons", "lumin")
  
  for (const icon of iconNodes) {
    if (icon.url) {
      const filePath = join(iconsDir, `${icon.name}.svg`)
      await downloadIcon(icon.url, filePath)
    }
  }
  
  console.log("Icon download complete!")
}

main().catch(console.error)


