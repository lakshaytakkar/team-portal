// Check which icons exist in source but not in registry
import { readdirSync } from "fs"
import { join } from "path"
import { luminIconSrc } from "../components/icons/lumin-icons"

const sourceDir = "C:\\Development\\lumin-icons"
const targetDir = join(process.cwd(), "public", "icons", "lumin")

// Get all SVG files from source (excluding duplicates)
const sourceFiles = readdirSync(sourceDir)
  .filter((file) => file.endsWith(".svg") && !file.endsWith("-1.svg"))
  .map((file) => file.replace(".svg", ""))

// Get registry icon names
const registryIcons = Object.keys(luminIconSrc)

console.log(`Source icons: ${sourceFiles.length}`)
console.log(`Registry icons: ${registryIcons.length}`)

// Find icons in source but not in registry
const missingFromRegistry = sourceFiles.filter((icon) => !registryIcons.includes(icon))
const missingFromSource = registryIcons.filter((icon) => !sourceFiles.includes(icon))

if (missingFromRegistry.length > 0) {
  console.log(`\n⚠ ${missingFromRegistry.length} icons in source but NOT in registry:`)
  missingFromRegistry.slice(0, 30).forEach((name) => console.log(`  - ${name}`))
  if (missingFromRegistry.length > 30) {
    console.log(`  ... and ${missingFromRegistry.length - 30} more`)
  }
}

if (missingFromSource.length > 0) {
  console.log(`\n⚠ ${missingFromSource.length} icons in registry but NOT in source:`)
  missingFromSource.slice(0, 30).forEach((name) => console.log(`  - ${name}`))
  if (missingFromSource.length > 30) {
    console.log(`  ... and ${missingFromSource.length - 30} more`)
  }
}

// Check target directory
import { existsSync, readdirSync as readTarget } from "fs"
const targetFiles = existsSync(targetDir)
  ? readTarget(targetDir)
      .filter((file) => file.endsWith(".svg"))
      .map((file) => file.replace(".svg", ""))
  : []

console.log(`\nTarget icons: ${targetFiles.length}`)

const missingInTarget = registryIcons.filter((icon) => !targetFiles.includes(icon))
if (missingInTarget.length > 0) {
  console.log(`\n❌ ${missingInTarget.length} registry icons missing in target:`)
  missingInTarget.slice(0, 20).forEach((name) => console.log(`  - ${name}`))
} else {
  console.log(`\n✅ All registry icons are in target directory!`)
}


