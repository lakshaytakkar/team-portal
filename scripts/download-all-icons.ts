// Script to download ALL icons from Figma
// This will fetch icon URLs from Figma MCP and download them

import { writeFileSync, mkdirSync } from "fs"
import { join } from "path"

// All icon node IDs from the metadata - we'll fetch URLs for each
const iconNodes = [
  { id: "217:1486", name: "home-13" },
  { id: "217:1489", name: "home-12" },
  { id: "217:1492", name: "home-11" },
  { id: "217:1495", name: "home-10" },
  { id: "217:1500", name: "home-09" },
  { id: "217:1503", name: "home-08" },
  { id: "217:1506", name: "home-07" },
  { id: "217:1509", name: "home-06" },
  { id: "217:1512", name: "home-05" },
  { id: "217:1515", name: "home-04" },
  { id: "217:1518", name: "home-03" },
  { id: "217:1523", name: "home-02" },
  { id: "217:1526", name: "home-01" },
  { id: "217:1483", name: "resources" },
  { id: "217:1480", name: "search-01" },
  { id: "217:1477", name: "search-02" },
  { id: "217:1474", name: "search-03" },
  { id: "217:1471", name: "search-04" },
  { id: "217:1468", name: "search-05" },
  { id: "217:1465", name: "search-06" },
  { id: "217:1462", name: "search-07" },
  { id: "217:1459", name: "search-08" },
  { id: "217:1456", name: "bookmark" },
  { id: "217:1453", name: "bookmark-check" },
  { id: "217:1450", name: "bookmark-remove" },
  { id: "217:1447", name: "bookmark-plus" },
  { id: "217:1444", name: "bookmark-minus" },
  { id: "217:1441", name: "filter-01" },
  { id: "217:1438", name: "filter-02" },
  { id: "217:1435", name: "filter-03" },
  { id: "217:1432", name: "link-01" },
  { id: "217:1429", name: "link-02" },
  { id: "217:1426", name: "link-03" },
  { id: "217:1423", name: "link-04" },
  { id: "217:1420", name: "link-broken-01" },
  { id: "217:1417", name: "link-broken-02" },
  { id: "217:1414", name: "menu-bar-01" },
  { id: "217:1411", name: "menu-bar-02" },
  { id: "217:1408", name: "menu-bar-03" },
  { id: "217:1635", name: "check" },
  { id: "217:1638", name: "share-square" },
  { id: "217:1641", name: "share-circle" },
  { id: "217:1615", name: "heart" },
  { id: "217:1612", name: "star" },
  { id: "217:1607", name: "eye" },
  { id: "217:1629", name: "plus" },
  { id: "217:1626", name: "minus" },
  { id: "217:1623", name: "dots" },
  { id: "217:1618", name: "question-mark" },
  { id: "217:1632", name: "block" },
  { id: "217:1719", name: "check-circle" },
  { id: "217:1713", name: "plus-circle" },
  { id: "217:1710", name: "minus-circle" },
  { id: "217:1705", name: "dots-circle" },
  { id: "217:1722", name: "log-out-05" },
  { id: "217:1737", name: "log-in-05" },
  { id: "219:2837", name: "chevron-left" },
  { id: "219:2839", name: "chevron-right" },
  { id: "219:2841", name: "chevron-down" },
  { id: "219:2843", name: "chevron-up" },
  { id: "217:1947", name: "mail-01" },
  { id: "217:1945", name: "mail-05" },
  { id: "217:1955", name: "bell-01" },
  { id: "217:1953", name: "bell-05" },
  { id: "219:2046", name: "user-circle" },
  { id: "219:2058", name: "user-01" },
  { id: "219:2048", name: "users-03" },
  { id: "219:2053", name: "users-01" },
  { id: "11775:2596", name: "gear" },
  { id: "18776:4677", name: "user-plus-01" },
  { id: "18776:4675", name: "user-minus-01" },
  { id: "18785:8526", name: "calendar" },
  { id: "18776:4693", name: "calendar-check-01" },
  { id: "18776:4983", name: "briefcase-01" },
]

// Known URLs from Figma MCP fetches
const knownUrls: Record<string, string> = {
  "home-13": "https://www.figma.com/api/mcp/asset/707c6a9b-fa20-4e53-b5bc-bcac286023bf",
  "home-12": "https://www.figma.com/api/mcp/asset/492d9a7b-e68a-43e3-a7f5-7965724e7931",
  "home-11": "https://www.figma.com/api/mcp/asset/72e69a68-956c-4378-b3a3-c7117304a15d",
  "home-10": "https://www.figma.com/api/mcp/asset/2f9bfbba-3ee5-4ba3-a735-29678abc0495",
  "home-09": "https://www.figma.com/api/mcp/asset/d5f221d0-b192-412c-88f6-021392e9c983",
  "home-08": "https://www.figma.com/api/mcp/asset/f3a1f60b-8f40-454e-a199-a6b11ac23ef8",
  "home-07": "https://www.figma.com/api/mcp/asset/a8c24ad6-3171-4cc9-bd27-805c07e8de95",
  "home-06": "https://www.figma.com/api/mcp/asset/94a15f45-0a91-4168-8869-d49ba8053743",
  "home-05": "https://www.figma.com/api/mcp/asset/c5a6dce4-ea82-4873-9efb-738f9ba495e2",
  "home-04": "https://www.figma.com/api/mcp/asset/9dc13de1-bdf4-4e09-a7bf-b06054a03bb2",
  "home-03": "https://www.figma.com/api/mcp/asset/6fa11909-261a-4174-9964-c92cf6d9357d",
  "home-02": "https://www.figma.com/api/mcp/asset/b271979e-26d5-4273-ba2b-ae61755810f4",
  "home-01": "https://www.figma.com/api/mcp/asset/9d186b20-d736-4bbf-8ae5-05a2b48b36f8",
  "check": "https://www.figma.com/api/mcp/asset/00b88a3e-4ca8-4452-ae67-65f62e717c57",
  "chevron-left": "https://www.figma.com/api/mcp/asset/46eb1f36-0839-4054-a984-21e7558ad94f",
  "search-01": "https://www.figma.com/api/mcp/asset/f91803b4-a018-4fc0-9daa-098b8e6b1aa5",
  "log-out-05": "https://www.figma.com/api/mcp/asset/cf9bccbe-f0e8-42eb-b45e-c9ec4eba27e1",
}

async function downloadIcon(url: string, filePath: string) {
  try {
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`Failed to fetch ${url}: ${response.statusText}`)
    }
    const svgContent = await response.text()
    writeFileSync(filePath, svgContent, "utf-8")
    return true
  } catch (error) {
    console.error(`Error downloading ${url}:`, error)
    return false
  }
}

async function main() {
  const iconsDir = join(process.cwd(), "public", "icons", "lumin")
  
  // Ensure directory exists
  mkdirSync(iconsDir, { recursive: true })
  
  let downloaded = 0
  let skipped = 0
  
  for (const icon of iconNodes) {
    const filePath = join(iconsDir, `${icon.name}.svg`)
    
    // Skip if already exists
    if (require("fs").existsSync(filePath)) {
      skipped++
      continue
    }
    
    // Use known URL if available
    const url = knownUrls[icon.name]
    if (url) {
      const success = await downloadIcon(url, filePath)
      if (success) {
        downloaded++
        console.log(`✓ Downloaded: ${icon.name}`)
      }
    } else {
      console.log(`⚠ No URL for: ${icon.name} (need to fetch from Figma)`)
    }
  }
  
  console.log(`\nDownload complete!`)
  console.log(`Downloaded: ${downloaded}`)
  console.log(`Skipped (already exists): ${skipped}`)
  console.log(`Missing URLs: ${iconNodes.length - downloaded - skipped}`)
}

main().catch(console.error)

