// Script to download ALL logos from Figma as proper SVG files
import { writeFileSync, mkdirSync, existsSync } from "fs"
import { join } from "path"

const logosDir = join(process.cwd(), "public", "logos")

// Ensure directory exists
if (!existsSync(logosDir)) {
  mkdirSync(logosDir, { recursive: true })
}

// All logo asset URLs from Figma MCP - using first/main asset for each logo
const logoAssets: Record<string, string> = {
  google: "https://www.figma.com/api/mcp/asset/a57c4ea7-d275-4dbe-93d7-680a95d08cc3",
  facebook: "https://www.figma.com/api/mcp/asset/3a5b6b7c-5db3-4a89-99ac-e3aa3eaa5dfb",
  instagram: "https://www.figma.com/api/mcp/asset/1df29eea-a7ca-4b99-9a3a-78a7e3142991",
  twitter: "https://www.figma.com/api/mcp/asset/952171b9-cdfa-4a31-990b-1356e163d114",
  linkedin: "https://www.figma.com/api/mcp/asset/8a066c18-65ec-47b4-b5d2-e9b6ef364db5",
  youtube: "https://www.figma.com/api/mcp/asset/d2bc3f97-4553-456d-909a-d8de6a456e93",
  whatsapp: "https://www.figma.com/api/mcp/asset/c68b7714-81f0-4561-9521-c346aedba4bf",
  discord: "https://www.figma.com/api/mcp/asset/dee4b5fa-4d4f-475f-80f1-3b8d967c6db0",
  slack: "https://www.figma.com/api/mcp/asset/1837ff89-ba7a-4bf2-b410-32d02bd48f8c",
  telegram: "https://www.figma.com/api/mcp/asset/7a5dee68-e1fc-4df2-a4bb-c06c5a707160",
  tiktok: "https://www.figma.com/api/mcp/asset/018df58e-79f3-4c4e-8df4-d098e3c316d5",
  snapchat: "https://www.figma.com/api/mcp/asset/1d43d6af-29de-4376-a66d-01788038220c",
  pinterest: "https://www.figma.com/api/mcp/asset/ee593ff9-8f06-4955-87a0-ba6a4a09ac9c",
  reddit: "https://www.figma.com/api/mcp/asset/d7231c85-47d5-44cb-9379-1f251cf44512",
  notion: "https://www.figma.com/api/mcp/asset/6b19cde8-309f-42e7-9660-1493c0530c71",
  figma: "https://www.figma.com/api/mcp/asset/62e32e0c-45ec-4179-b8d4-7f26eda39a7c",
  trello: "https://www.figma.com/api/mcp/asset/93436150-d3e1-42d8-a580-3528f5719417",
  monday: "https://www.figma.com/api/mcp/asset/14642862-67bc-4b73-afa8-9fa78ee749fa",
  zoom: "https://www.figma.com/api/mcp/asset/639b73f5-1a2f-4466-bdab-402297645648",
  "google-meet": "https://www.figma.com/api/mcp/asset/4a44c705-bd58-4299-8afb-1e1b77edf4ec",
  "google-teams": "https://www.figma.com/api/mcp/asset/c48e5c12-e4bc-4c2c-ac3c-b36921259349",
  shopify: "https://www.figma.com/api/mcp/asset/4e37158c-e4fb-4855-8e63-cdde0df1b317",
  stripe: "https://www.figma.com/api/mcp/asset/826d13d2-bcd8-4d1b-86e7-d7633f3de5c1",
  paypal: "https://www.figma.com/api/mcp/asset/baef5e39-6b49-44ef-8bc1-bef503c0b8ab",
  amazon: "https://www.figma.com/api/mcp/asset/e9675439-52c6-4bb7-ba37-f9dd43908afe",
  klarna: "https://www.figma.com/api/mcp/asset/6a5d00a5-252b-455a-a751-337088a5a723",
  "google-drive": "https://www.figma.com/api/mcp/asset/3069bb59-2dc1-4273-9df4-4559e953d3df",
  "google-photos": "https://www.figma.com/api/mcp/asset/34874f11-c2c4-4ecd-bec7-0a6618b7b8d7",
  "google-maps": "https://www.figma.com/api/mcp/asset/1232ebbd-f55e-4ba6-89aa-a50a3b8a0924",
  "google-cloud": "https://www.figma.com/api/mcp/asset/1dc64ab6-6993-4c2a-9a29-b05f59dff5cc",
  "google-play": "https://www.figma.com/api/mcp/asset/b218ac71-5060-48a4-9148-d2aa46fe3f3c",
  "google-analytics": "https://www.figma.com/api/mcp/asset/310081b2-47de-46d1-9465-c747f6a7dab6",
  "google-ads": "https://www.figma.com/api/mcp/asset/a4b6aca1-dce4-437e-a727-8a7a8f568670",
  netflix: "https://www.figma.com/api/mcp/asset/a97f4a88-aa0f-4ea1-8916-299e51d25bb4",
  spotify: "https://www.figma.com/api/mcp/asset/21cf4aa6-a81f-49ed-a8fd-23e9b42cd7a9",
  soundcloud: "https://www.figma.com/api/mcp/asset/dd04e144-d0ae-4346-b09b-c7ceca7a7b57",
  twitch: "https://www.figma.com/api/mcp/asset/82ff8c85-1d52-4e05-970a-0eade069eb6f",
  vimeo: "https://www.figma.com/api/mcp/asset/8f14db6a-db6a-477d-b7de-f8fc5c4d7a9e",
  webflow: "https://www.figma.com/api/mcp/asset/b74916d5-aae8-4ca1-bebb-9708687b658d",
  wordpress: "https://www.figma.com/api/mcp/asset/eb4a6872-41d9-482e-8350-8aeb72ca1f63",
  mailchimp: "https://www.figma.com/api/mcp/asset/010fe04b-78c7-48be-a6a7-ae7ae852a061",
  zendesk: "https://www.figma.com/api/mcp/asset/5654a3ec-3859-44c3-8c78-d7f26c43c680",
  zapier: "https://www.figma.com/api/mcp/asset/03f269ff-255a-4c14-aa3e-3393ad3d7b37",
  office365: "https://www.figma.com/api/mcp/asset/b009fe5d-90e8-4aef-afae-60ae71a25df9",
  meta: "https://www.figma.com/api/mcp/asset/90872cae-be98-46d0-8efd-b2dd168314c7",
  tumblr: "https://www.figma.com/api/mcp/asset/305afb28-80c5-4a40-8200-fc643208c16d",
  patreon: "https://www.figma.com/api/mcp/asset/f6ba1ef1-f6ba-43b3-b2a8-c5b7aaf97cd5",
  xing: "https://www.figma.com/api/mcp/asset/5bb9b131-dca2-4cce-80d9-70f79ed8ebd1",
  yelp: "https://www.figma.com/api/mcp/asset/6b503746-eb44-439e-a14e-c3e945b2ec47",
  quora: "https://www.figma.com/api/mcp/asset/452fc3ef-054c-4d17-9a45-6ebc67a85277",
  behance: "https://www.figma.com/api/mcp/asset/d2a09f87-982a-4791-b618-e8097f1f3821",
  dribbble: "https://www.figma.com/api/mcp/asset/bcd7ae8a-13bf-49e6-9f17-a700e1724fd3",
  medium: "https://www.figma.com/api/mcp/asset/9a6de1e2-5686-4a2d-aa33-5a9631d27718",
  opera: "https://www.figma.com/api/mcp/asset/296a0840-ce8f-4b63-8c05-3a41fe266daa",
  android: "https://www.figma.com/api/mcp/asset/f59cc227-ffc5-4d1f-829f-f138a451d075",
  apple: "https://www.figma.com/api/mcp/asset/2e2a9e35-9e39-4b4f-a34a-f474b721f39a",
  "app-store": "https://www.figma.com/api/mcp/asset/4391ecb2-5fdb-44a8-ab2f-6dc4fe00d84f",
  tinder: "https://www.figma.com/api/mcp/asset/aa6d1912-d2fc-4b2d-9425-f93347af4be5",
  vk: "https://www.figma.com/api/mcp/asset/6e26e811-351d-47e9-8cb5-7ea2454a3d86",
  watppad: "https://www.figma.com/api/mcp/asset/5d2ff5f2-ab78-4152-941b-eacdbd53e62c",
  truth: "https://www.figma.com/api/mcp/asset/f1c5e0d5-e39b-43a8-94ed-6ec9fdefc7a3",
  evergreen: "https://www.figma.com/api/mcp/asset/40006d0b-3822-4b19-873d-7bcca0d7232b",
  "font-awesome": "https://www.figma.com/api/mcp/asset/4f82ffad-5e1d-4adf-aac3-859727593c0a",
  "apple-podcast": "https://www.figma.com/api/mcp/asset/ae75e359-d6ea-4ab6-9c8f-677a05cbab58",
  "google-fit": "https://www.figma.com/api/mcp/asset/802b68c0-8bd1-4294-95af-46e3164a01fb",
  "google-home": "https://www.figma.com/api/mcp/asset/9a993dd5-7f7e-4481-8aa1-2c20890c4585",
  "google-pay": "https://www.figma.com/api/mcp/asset/18dbc3f0-7e96-40a6-bec1-dc48f57d0e56",
  "google-shopping": "https://www.figma.com/api/mcp/asset/bd4a2770-10b5-4e29-a06b-f9f09667bb30",
  "google-adsense": "https://www.figma.com/api/mcp/asset/707aec12-a080-4033-b29c-2aa3a036fd73",
  skype: "https://www.figma.com/api/mcp/asset/14874469-7e8f-4509-8d59-b9147b262f12",
  messenger: "https://www.figma.com/api/mcp/asset/dcc63322-c298-465c-b4e0-5a7f53d9e437",
  dropbox: "https://www.figma.com/api/mcp/asset/13ab7811-e34d-46dd-9b86-d540be4193c9",
}

async function downloadLogo(name: string, url: string) {
  try {
    // Try to get as SVG first
    const response = await fetch(url, {
      headers: {
        'Accept': 'image/svg+xml, image/*',
      },
    })
    
    if (!response.ok) {
      throw new Error(`Failed to fetch: ${response.statusText}`)
    }
    
    const contentType = response.headers.get("content-type") || ""
    
    // Check content type first, then read accordingly
    if (contentType.includes("svg")) {
      const content = await response.text()
      const filePath = join(logosDir, `${name}.svg`)
      writeFileSync(filePath, content, "utf-8")
      console.log(`✓ Downloaded SVG: ${name}.svg`)
      return true
    } else {
      // It's PNG or other format - save as PNG
      const buffer = await response.arrayBuffer()
      const filePath = join(logosDir, `${name}.png`)
      writeFileSync(filePath, Buffer.from(buffer))
      console.log(`✓ Downloaded PNG: ${name}.png`)
      return true
    }
  } catch (error) {
    console.error(`✗ Error downloading ${name}:`, error)
    return false
  }
}

async function main() {
  console.log(`Downloading ${Object.keys(logoAssets).length} logos from Figma...\n`)
  
  let downloaded = 0
  let failed = 0
  
  for (const [name, url] of Object.entries(logoAssets)) {
    const success = await downloadLogo(name, url)
    if (success) {
      downloaded++
    } else {
      failed++
    }
    
    // Small delay to avoid rate limiting
    await new Promise((resolve) => setTimeout(resolve, 150))
  }
  
  console.log(`\nDownload complete!`)
  console.log(`Downloaded: ${downloaded}`)
  console.log(`Failed: ${failed}`)
}

main().catch(console.error)

