// Script to properly export logos from Figma as SVG files
import { writeFileSync, mkdirSync, existsSync } from "fs"
import { join } from "path"

const logosDir = join(process.cwd(), "public", "logos")

// Ensure directory exists
if (!existsSync(logosDir)) {
  mkdirSync(logosDir, { recursive: true })
}

// Logo node IDs from Figma metadata - these are the actual symbol instances
const logoNodes: Array<{ id: string; name: string }> = [
  { id: "263:2899", name: "google" },
  { id: "263:3057", name: "facebook" },
  { id: "263:3060", name: "instagram" },
  { id: "263:3070", name: "twitter" },
  { id: "263:3072", name: "linkedin" },
  { id: "263:3082", name: "youtube" },
  { id: "263:3063", name: "whatsapp" },
  { id: "263:3089", name: "discord" },
  { id: "263:3084", name: "slack" },
  { id: "263:2974", name: "telegram" },
  { id: "263:3032", name: "tiktok" },
  { id: "263:3121", name: "snapchat" },
  { id: "263:3067", name: "pinterest" },
  { id: "263:3044", name: "reddit" },
  { id: "263:2904", name: "notion" },
  { id: "263:3007", name: "figma" },
  { id: "263:2985", name: "trello" },
  { id: "263:2968", name: "monday" },
  { id: "263:3138", name: "zoom" },
  { id: "263:3131", name: "google-meet" },
  { id: "263:3141", name: "google-teams" },
  { id: "263:3124", name: "shopify" },
  { id: "263:3128", name: "stripe" },
  { id: "263:3019", name: "paypal" },
  { id: "263:3027", name: "amazon" },
  { id: "263:3000", name: "klarna" },
  { id: "263:2937", name: "google-drive" },
  { id: "263:2944", name: "google-photos" },
  { id: "263:2953", name: "google-maps" },
  { id: "263:2959", name: "google-cloud" },
  { id: "263:3077", name: "google-play" },
  { id: "263:2908", name: "google-analytics" },
  { id: "263:2916", name: "google-ads" },
  { id: "263:3051", name: "netflix" },
  { id: "263:3091", name: "spotify" },
  { id: "263:3055", name: "soundcloud" },
  { id: "263:3038", name: "twitch" },
  { id: "263:3163", name: "vimeo" },
  { id: "263:2982", name: "webflow" },
  { id: "263:3093", name: "wordpress" },
  { id: "263:3099", name: "mailchimp" },
  { id: "263:3112", name: "zendesk" },
  { id: "263:3117", name: "zapier" },
  { id: "263:3119", name: "office365" },
  { id: "263:3152", name: "meta" },
  { id: "263:3156", name: "tumblr" },
  { id: "263:3160", name: "patreon" },
  { id: "263:3165", name: "xing" },
  { id: "263:3168", name: "yelp" },
  { id: "263:3174", name: "quora" },
  { id: "263:2989", name: "behance" },
  { id: "263:2979", name: "dribbble" },
  { id: "263:2972", name: "medium" },
  { id: "263:3004", name: "opera" },
  { id: "263:3049", name: "android" },
  { id: "263:3075", name: "apple" },
  { id: "263:3041", name: "app-store" },
  { id: "263:3047", name: "tinder" },
  { id: "263:3149", name: "vk" },
  { id: "263:3158", name: "watppad" },
  { id: "263:3170", name: "truth" },
  { id: "263:2991", name: "evergreen" },
  { id: "263:3002", name: "font-awesome" },
  { id: "263:2994", name: "apple-podcast" },
  { id: "263:2911", name: "google-fit" },
  { id: "263:2927", name: "google-home" },
  { id: "263:2932", name: "google-pay" },
  { id: "263:2920", name: "google-shopping" },
  { id: "263:2964", name: "google-adsense" },
  { id: "263:3024", name: "skype" },
  { id: "263:3107", name: "messenger" },
  { id: "263:3013", name: "dropbox" },
]

console.log(`Exporting ${logoNodes.length} logos from Figma...`)
console.log("Note: This requires Figma MCP to export each logo individually")
console.log("For now, we'll use the Figma API to get SVG exports\n")

// This script will need to be run with Figma MCP access
// For now, let's create a helper that can be called with MCP
export async function exportLogoFromFigma(nodeId: string, name: string) {
  try {
    // This would use Figma MCP export_node_to_svg
    // For now, we'll need to manually export or use a different approach
    console.log(`Would export ${name} from node ${nodeId}`)
  } catch (error) {
    console.error(`Error exporting ${name}:`, error)
  }
}

// Export all logos
async function main() {
  console.log("To properly export logos, use Figma MCP export_node_to_svg for each logo")
  console.log("Or use Figma's export API with format=svg")
  console.log("\nLogo nodes to export:")
  logoNodes.forEach((logo) => {
    console.log(`  ${logo.name}: ${logo.id}`)
  })
}

main().catch(console.error)


