// Script to download logos from Figma asset URLs as SVG
import { writeFileSync, mkdirSync, existsSync } from "fs"
import { join } from "path"

const logosDir = join(process.cwd(), "public", "logos")

// Ensure directory exists
if (!existsSync(logosDir)) {
  mkdirSync(logosDir, { recursive: true })
}

// Logo asset URLs from Figma MCP - these are the actual logo assets
const logoAssets: Record<string, string[]> = {
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
  twitter: [
    "https://www.figma.com/api/mcp/asset/952171b9-cdfa-4a31-990b-1356e163d114",
  ],
  apple: [
    "https://www.figma.com/api/mcp/asset/2e2a9e35-9e39-4b4f-a34a-f474b721f39a",
  ],
}

async function downloadLogo(name: string, urls: string[]) {
  try {
    // For logos with multiple parts, we need to combine them or use the first/main one
    // Let's try to get SVG format by appending format parameter
    const mainUrl = urls[0]
    
    // Try to get as SVG - Figma API might support format parameter
    const svgUrl = `${mainUrl}?format=svg`
    
    const response = await fetch(svgUrl, {
      headers: {
        'Accept': 'image/svg+xml',
      },
    })
    
    if (!response.ok) {
      // Try without format parameter
      const response2 = await fetch(mainUrl)
      if (!response2.ok) {
        throw new Error(`Failed to fetch: ${response2.statusText}`)
      }
      
      const contentType = response2.headers.get("content-type") || ""
      const content = await response2.text()
      
      // Check if it's already SVG
      if (content.trim().startsWith("<svg") || contentType.includes("svg")) {
        const filePath = join(logosDir, `${name}.svg`)
        writeFileSync(filePath, content, "utf-8")
        console.log(`✓ Downloaded SVG: ${name}.svg`)
        return true
      } else {
        // It's PNG or other format
        const buffer = await response2.arrayBuffer()
        const extension = contentType.includes("png") ? "png" : "svg"
        const filePath = join(logosDir, `${name}.${extension}`)
        writeFileSync(filePath, Buffer.from(buffer))
        console.log(`✓ Downloaded ${extension.toUpperCase()}: ${name}.${extension}`)
        return true
      }
    } else {
      const content = await response.text()
      const filePath = join(logosDir, `${name}.svg`)
      writeFileSync(filePath, content, "utf-8")
      console.log(`✓ Downloaded SVG: ${name}.svg`)
      return true
    }
  } catch (error) {
    console.error(`✗ Error downloading ${name}:`, error)
    return false
  }
}

async function main() {
  console.log(`Downloading ${Object.keys(logoAssets).length} logos to ${logosDir}\n`)
  
  let downloaded = 0
  let failed = 0
  
  for (const [name, urls] of Object.entries(logoAssets)) {
    const success = await downloadLogo(name, urls)
    if (success) {
      downloaded++
    } else {
      failed++
    }
    
    // Small delay to avoid rate limiting
    await new Promise((resolve) => setTimeout(resolve, 200))
  }
  
  console.log(`\nDownload complete!`)
  console.log(`Downloaded: ${downloaded}`)
  console.log(`Failed: ${failed}`)
}

main().catch(console.error)


