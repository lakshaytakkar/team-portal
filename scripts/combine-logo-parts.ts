// Script to combine multiple logo parts into complete SVGs
import { readFileSync, writeFileSync, existsSync } from "fs"
import { join } from "path"

const logosDir = join(process.cwd(), "public", "logos")

// Logos that have multiple parts that need to be combined
const multiPartLogos: Record<string, string[]> = {
  google: [
    "https://www.figma.com/api/mcp/asset/a57c4ea7-d275-4dbe-93d7-680a95d08cc3",
    "https://www.figma.com/api/mcp/asset/24581141-87e6-4bd9-bc70-6f4343278eb9",
    "https://www.figma.com/api/mcp/asset/8346842e-69d7-4bdb-9983-6832b85958c2",
    "https://www.figma.com/api/mcp/asset/67090536-d54c-4d31-bccc-6360c95f9444",
  ],
  facebook: [
    "https://www.figma.com/api/mcp/asset/3a5b6b7c-5db3-4a89-99ac-e3aa3eaa5dfb",
    "https://www.figma.com/api/mcp/asset/6b8cd2c7-12b7-4e82-8d62-014733100ff6",
  ],
  instagram: [
    "https://www.figma.com/api/mcp/asset/1df29eea-a7ca-4b99-9a3a-78a7e3142991",
    "https://www.figma.com/api/mcp/asset/4fd9b638-4e9a-4dc9-b601-3cd65b727a72",
  ],
  linkedin: [
    "https://www.figma.com/api/mcp/asset/8a066c18-65ec-47b4-b5d2-e9b6ef364db5",
    "https://www.figma.com/api/mcp/asset/ec67263c-470d-4222-9c2d-62cfb4f63e23",
  ],
  whatsapp: [
    "https://www.figma.com/api/mcp/asset/c68b7714-81f0-4561-9521-c346aedba4bf",
    "https://www.figma.com/api/mcp/asset/ec89eeda-67e7-4379-89a5-58031223eea2",
    "https://www.figma.com/api/mcp/asset/d9f1c116-0de2-411e-953c-732d21000cca",
  ],
  slack: [
    "https://www.figma.com/api/mcp/asset/1837ff89-ba7a-4bf2-b410-32d02bd48f8c",
    "https://www.figma.com/api/mcp/asset/dc3dbc26-7179-4923-8d1b-eed786f38195",
    "https://www.figma.com/api/mcp/asset/141443e9-48df-4ecb-8540-87fe6d08c8a1",
    "https://www.figma.com/api/mcp/asset/92f715ec-986b-4653-b8b8-06e139b11312",
  ],
  figma: [
    "https://www.figma.com/api/mcp/asset/62e32e0c-45ec-4179-b8d4-7f26eda39a7c",
    "https://www.figma.com/api/mcp/asset/29493219-afde-42a3-9bc8-003a8c4ad68e",
    "https://www.figma.com/api/mcp/asset/4ebd5066-bc51-4cb4-a81c-122f74cccc7f",
    "https://www.figma.com/api/mcp/asset/c20929c4-6fce-45e5-a635-4026390edbe3",
    "https://www.figma.com/api/mcp/asset/8198f986-c4fb-4083-9792-365942925182",
  ],
  notion: [
    "https://www.figma.com/api/mcp/asset/6b19cde8-309f-42e7-9660-1493c0530c71",
    "https://www.figma.com/api/mcp/asset/4a1e2ee8-6ab3-4a82-a9ca-bfe79bce8256",
    "https://www.figma.com/api/mcp/asset/9b726de4-6fa5-4025-969e-5fa11cb272e4",
  ],
  shopify: [
    "https://www.figma.com/api/mcp/asset/4e37158c-e4fb-4855-8e63-cdde0df1b317",
    "https://www.figma.com/api/mcp/asset/a4c78ea2-8816-4c61-9da5-35b2eadce464",
    "https://www.figma.com/api/mcp/asset/ff06ce61-f44d-4061-9609-d91da4e6cae4",
  ],
  stripe: [
    "https://www.figma.com/api/mcp/asset/826d13d2-bcd8-4d1b-86e7-d7633f3de5c1",
    "https://www.figma.com/api/mcp/asset/3c1b7444-147d-4657-99e9-099fa893341b",
  ],
  paypal: [
    "https://www.figma.com/api/mcp/asset/baef5e39-6b49-44ef-8bc1-bef503c0b8ab",
    "https://www.figma.com/api/mcp/asset/d317787a-2180-451b-b2a4-4d593de4f529",
    "https://www.figma.com/api/mcp/asset/c6489409-51ac-427d-bc1c-d8fe3de0ab17",
    "https://www.figma.com/api/mcp/asset/1dbd5e63-7543-4c27-809b-0bd749a367d2",
  ],
  zoom: [
    "https://www.figma.com/api/mcp/asset/639b73f5-1a2f-4466-bdab-402297645648",
    "https://www.figma.com/api/mcp/asset/bd2c6b94-628c-410f-838d-b9952418114c",
  ],
}

async function downloadSVGPart(url: string): Promise<string> {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Failed to fetch: ${response.statusText}`)
  }
  return await response.text()
}

function combineSVGParts(parts: string[]): string {
  // Extract viewBox from first part (use the largest viewBox to ensure all parts fit)
  let maxWidth = 0
  let maxHeight = 0
  
  parts.forEach((part) => {
    const viewBoxMatch = part.match(/viewBox="([^"]+)"/)
    if (viewBoxMatch) {
      const [, x, y, w, h] = viewBoxMatch[1].split(/\s+/).map(parseFloat)
      maxWidth = Math.max(maxWidth, (x || 0) + (w || 0))
      maxHeight = Math.max(maxHeight, (y || 0) + (h || 0))
    }
  })
  
  const viewBox = maxWidth > 0 && maxHeight > 0 
    ? `0 0 ${maxWidth} ${maxHeight}` 
    : "0 0 24 24"
  
  // Extract all paths from all parts
  const paths: string[] = []
  parts.forEach((part) => {
    const pathMatches = part.match(/<path[^>]*>/g)
    if (pathMatches) {
      paths.push(...pathMatches)
    }
  })
  
  // Create combined SVG
  return `<svg width="24" height="24" viewBox="${viewBox}" fill="none" xmlns="http://www.w3.org/2000/svg">
${paths.join("\n")}
</svg>`
}

async function combineLogo(name: string, urls: string[]) {
  try {
    console.log(`Combining ${name} from ${urls.length} parts...`)
    
    // Download all parts
    const parts = await Promise.all(urls.map((url) => downloadSVGPart(url)))
    
    // Combine into single SVG
    const combinedSVG = combineSVGParts(parts)
    
    // Save
    const filePath = join(logosDir, `${name}.svg`)
    writeFileSync(filePath, combinedSVG, "utf-8")
    console.log(`✓ Combined: ${name}.svg`)
    return true
  } catch (error) {
    console.error(`✗ Error combining ${name}:`, error)
    return false
  }
}

async function main() {
  console.log(`Combining ${Object.keys(multiPartLogos).length} multi-part logos...\n`)
  
  let combined = 0
  let failed = 0
  
  for (const [name, urls] of Object.entries(multiPartLogos)) {
    const success = await combineLogo(name, urls)
    if (success) {
      combined++
    } else {
      failed++
    }
    
    await new Promise((resolve) => setTimeout(resolve, 200))
  }
  
  console.log(`\nCombine complete!`)
  console.log(`Combined: ${combined}`)
  console.log(`Failed: ${failed}`)
}

main().catch(console.error)

