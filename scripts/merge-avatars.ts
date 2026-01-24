import { readFileSync, writeFileSync, mkdirSync } from "fs"
import { join } from "path"

// Mapping: Ellipse number to Intersect index
// Ellipse 2 -> Intersect.svg (index 0)
// Ellipse 3 -> Intersect-1.svg (index 1)
// Ellipse 5 -> Intersect-2.svg (index 2)
// etc.
const ellipseNumbers = [2, 3, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28]

function getIntersectFileName(index: number): string {
  if (index === 0) return "Intersect.svg"
  return `Intersect-${index}.svg`
}

function extractSVGContent(svgContent: string): string {
  // Extract everything between <svg> and </svg> tags, excluding the outer svg tag
  const match = svgContent.match(/<svg[^>]*>([\s\S]*)<\/svg>/i)
  if (match && match[1]) {
    return match[1].trim()
  }
  return ""
}

function mergeSVGs(ellipseContent: string, intersectContent: string): string {
  // Extract the content from both SVGs
  const ellipseInner = extractSVGContent(ellipseContent)
  const intersectInner = extractSVGContent(intersectContent)
  
  // Get viewBox from ellipse (should be same for both)
  const viewBoxMatch = ellipseContent.match(/viewBox="([^"]*)"/i)
  const viewBox = viewBoxMatch ? viewBoxMatch[1] : "0 0 64 64"
  
  // Get width and height
  const widthMatch = ellipseContent.match(/width="([^"]*)"/i)
  const heightMatch = ellipseContent.match(/height="([^"]*)"/i)
  const width = widthMatch ? widthMatch[1] : "64"
  const height = heightMatch ? heightMatch[1] : "64"
  
  // Combine: ellipse (background) first, then intersect (avatar) on top
  const mergedContent = `<svg width="${width}" height="${height}" viewBox="${viewBox}" fill="none" xmlns="http://www.w3.org/2000/svg">
${ellipseInner}
${intersectInner}
</svg>`
  
  return mergedContent
}

function mergeAvatars() {
  const avatarsDir = join(process.cwd(), "public", "avatars")
  const mergedDir = join(process.cwd(), "public", "avatars", "merged")
  
  // Create merged directory if it doesn't exist
  mkdirSync(mergedDir, { recursive: true })
  
  console.log("Merging avatars...")
  
  ellipseNumbers.forEach((ellipseNum, index) => {
    const ellipseFileName = `Ellipse ${ellipseNum}.svg`
    const intersectFileName = getIntersectFileName(index)
    
    const ellipsePath = join(avatarsDir, ellipseFileName)
    const intersectPath = join(avatarsDir, intersectFileName)
    
    try {
      const ellipseContent = readFileSync(ellipsePath, "utf-8")
      const intersectContent = readFileSync(intersectPath, "utf-8")
      
      const merged = mergeSVGs(ellipseContent, intersectContent)
      
      // Save merged avatar with a clean name: avatar-1.svg, avatar-2.svg, etc.
      const outputFileName = `avatar-${index + 1}.svg`
      const outputPath = join(mergedDir, outputFileName)
      
      writeFileSync(outputPath, merged, "utf-8")
      console.log(`✓ Merged ${ellipseFileName} + ${intersectFileName} -> ${outputFileName}`)
    } catch (error) {
      console.error(`✗ Error merging ${ellipseFileName} + ${intersectFileName}:`, error)
    }
  })
  
  console.log(`\nCompleted! Merged avatars saved to: ${mergedDir}`)
  console.log(`Total avatars created: ${ellipseNumbers.length}`)
}

mergeAvatars()

