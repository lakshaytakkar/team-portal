// Script to copy logos from C:\Development\logos to public/logos
import { copyFileSync, readdirSync, existsSync, mkdirSync } from "fs"
import { join } from "path"

const SOURCE_DIR = "C:\\Development\\logos"
const TARGET_DIR = join(process.cwd(), "public", "logos")

// Ensure target directory exists
if (!existsSync(TARGET_DIR)) {
  mkdirSync(TARGET_DIR, { recursive: true })
}

function cleanFileName(fileName: string): string {
  // Remove "🔰 Type=" prefix if present
  return fileName.replace(/^🔰 Type=/, "").replace(/^Type=/, "")
}

async function copyLogos() {
  console.log(`Copying logos from ${SOURCE_DIR} to ${TARGET_DIR}\n`)

  const sourceFiles = readdirSync(SOURCE_DIR)
  const svgFiles = sourceFiles.filter((file) => file.endsWith(".svg"))

  console.log(`Found ${svgFiles.length} SVG files\n`)

  let copied = 0
  let skipped = 0

  for (const file of svgFiles) {
    const sourcePath = join(SOURCE_DIR, file)
    const cleanedName = cleanFileName(file)
    const targetPath = join(TARGET_DIR, cleanedName)

    try {
      copyFileSync(sourcePath, targetPath)
      copied++
      if (copied % 10 === 0) {
        console.log(`Copied ${copied} logos...`)
      }
    } catch (error) {
      console.error(`Error copying ${file}:`, error)
      skipped++
    }
  }

  console.log(`\nCopy complete!`)
  console.log(`Copied: ${copied}`)
  console.log(`Skipped: ${skipped}`)

  // List all files in target directory
  const targetFiles = readdirSync(TARGET_DIR)
  console.log(`\nTotal logos in target directory: ${targetFiles.length}`)
}

copyLogos().catch(console.error)


