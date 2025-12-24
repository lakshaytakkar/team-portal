// Script to copy all icons from C:\Development\lumin-icons to public/icons/lumin
import { copyFileSync, existsSync, mkdirSync, readdirSync } from "fs"
import { join } from "path"

const sourceDir = "C:\\Development\\lumin-icons"
const targetDir = join(process.cwd(), "public", "icons", "lumin")

// Ensure target directory exists
if (!existsSync(targetDir)) {
  mkdirSync(targetDir, { recursive: true })
}

console.log(`Copying icons from ${sourceDir} to ${targetDir}`)

// Get all SVG files from source, excluding duplicates (files ending with -1.svg)
const sourceFiles = readdirSync(sourceDir)
  .filter((file) => file.endsWith(".svg") && !file.endsWith("-1.svg"))
  .sort()

console.log(`Found ${sourceFiles.length} icon files`)

let copied = 0
let skipped = 0
const missing: string[] = []

// Copy each file
for (const file of sourceFiles) {
  const sourcePath = join(sourceDir, file)
  const targetPath = join(targetDir, file)
  
  try {
    copyFileSync(sourcePath, targetPath)
    copied++
    if (copied % 20 === 0) {
      console.log(`Copied ${copied} icons...`)
    }
  } catch (error) {
    console.error(`Error copying ${file}:`, error)
    missing.push(file)
  }
}

console.log(`\nCopy complete!`)
console.log(`Copied: ${copied}`)
console.log(`Skipped: ${skipped}`)
if (missing.length > 0) {
  console.log(`Failed: ${missing.length}`)
  console.log("Missing files:", missing)
}

// Verify icons in registry exist
console.log("\nVerifying registry icons...")
import { luminIconSrc } from "../components/icons/lumin-icons"

const registryIcons = Object.keys(luminIconSrc)
const missingRegistry: string[] = []

for (const iconName of registryIcons) {
  const iconFile = `${iconName}.svg`
  const iconPath = join(targetDir, iconFile)
  if (!existsSync(iconPath)) {
    missingRegistry.push(iconName)
  }
}

if (missingRegistry.length > 0) {
  console.log(`\n⚠ Missing ${missingRegistry.length} icons from registry:`)
  missingRegistry.slice(0, 20).forEach((name) => console.log(`  - ${name}`))
  if (missingRegistry.length > 20) {
    console.log(`  ... and ${missingRegistry.length - 20} more`)
  }
} else {
  console.log("✅ All registry icons are present!")
}


