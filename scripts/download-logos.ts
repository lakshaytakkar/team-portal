// Script to download logos from Figma MCP asset URLs
import { writeFileSync, mkdirSync, existsSync } from "fs"
import { join } from "path"

const logosDir = join(process.cwd(), "public", "logos")

// Ensure directory exists
if (!existsSync(logosDir)) {
  mkdirSync(logosDir, { recursive: true })
}

// Logo names and their corresponding asset URLs from Figma
// These are extracted from the Figma design context response
const logoUrls: Record<string, string> = {
  "google": "https://www.figma.com/api/mcp/asset/d46ad0a4-c582-452c-af86-7e91f82b0aaa",
  "notion": "https://www.figma.com/api/mcp/asset/b5ec3f99-eb8e-480c-b245-069aad26ee59",
  "google-analytics": "https://www.figma.com/api/mcp/asset/310081b2-47de-46d1-9465-c747f6a7dab6",
  "google-fit": "https://www.figma.com/api/mcp/asset/802b68c0-8bd1-4294-95af-46e3164a01fb",
  "google-ads": "https://www.figma.com/api/mcp/asset/a4b6aca1-dce4-437e-a727-8a7a8f568670",
  "google-shopping": "https://www.figma.com/api/mcp/asset/bd4a2770-10b5-4e29-a06b-f9f09667bb30",
  "google-home": "https://www.figma.com/api/mcp/asset/9a993dd5-7f7e-4481-8aa1-2c20890c4585",
  "google-pay": "https://www.figma.com/api/mcp/asset/18dbc3f0-7e96-40a6-bec1-dc48f57d0e56",
  "google-drive": "https://www.figma.com/api/mcp/asset/3069bb59-2dc1-4273-9df4-4559e953d3df",
  "google-photos": "https://www.figma.com/api/mcp/asset/34874f11-c2c4-4ecd-bec7-0a6618b7b8d7",
  "google-maps": "https://www.figma.com/api/mcp/asset/1232ebbd-f55e-4ba6-89aa-a50a3b8a0924",
  "google-cloud": "https://www.figma.com/api/mcp/asset/1dc64ab6-6993-4c2a-9a29-b05f59dff5cc",
  "google-adsense": "https://www.figma.com/api/mcp/asset/707aec12-a080-4033-b29c-2aa3a036fd73",
  "monday": "https://www.figma.com/api/mcp/asset/14642862-67bc-4b73-afa8-9fa78ee749fa",
  "medium": "https://www.figma.com/api/mcp/asset/9a6de1e2-5686-4a2d-aa33-5a9631d27718",
  "telegram": "https://www.figma.com/api/mcp/asset/7a5dee68-e1fc-4df2-a4bb-c06c5a707160",
  "dribbble": "https://www.figma.com/api/mcp/asset/bcd7ae8a-13bf-49e6-9f17-a700e1724fd3",
  "webflow": "https://www.figma.com/api/mcp/asset/b74916d5-aae8-4ca1-bebb-9708687b658d",
  "trello": "https://www.figma.com/api/mcp/asset/93436150-d3e1-42d8-a580-3528f5719417",
  "behance": "https://www.figma.com/api/mcp/asset/d2a09f87-982a-4791-b618-e8097f1f3821",
  "evergreen": "https://www.figma.com/api/mcp/asset/40006d0b-3822-4b19-873d-7bcca0d7232b",
  "apple-podcast": "https://www.figma.com/api/mcp/asset/ae75e359-d6ea-4ab6-9c8f-677a05cbab58",
  "klarna": "https://www.figma.com/api/mcp/asset/6a5d00a5-252b-455a-a751-337088a5a723",
  "font-awesome": "https://www.figma.com/api/mcp/asset/4f82ffad-5e1d-4adf-aac3-859727593c0a",
  "opera": "https://www.figma.com/api/mcp/asset/296a0840-ce8f-4b63-8c05-3a41fe266daa",
  "figma": "https://www.figma.com/api/mcp/asset/bf613d4f-f079-47ec-a8c1-8e2897d6b9df",
  "dropbox": "https://www.figma.com/api/mcp/asset/13ab7811-e34d-46dd-9b86-d540be4193c9",
  "paypal": "https://www.figma.com/api/mcp/asset/91a54bb1-1e05-4e23-b78d-26ef57692f19",
  "skype": "https://www.figma.com/api/mcp/asset/14874469-7e8f-4509-8d59-b9147b262f12",
  "amazon": "https://www.figma.com/api/mcp/asset/e9675439-52c6-4bb7-ba37-f9dd43908afe",
  "tiktok": "https://www.figma.com/api/mcp/asset/018df58e-79f3-4c4e-8df4-d098e3c316d5",
  "twitch": "https://www.figma.com/api/mcp/asset/82ff8c85-1d52-4e05-970a-0eade069eb6f",
  "app-store": "https://www.figma.com/api/mcp/asset/4391ecb2-5fdb-44a8-ab2f-6dc4fe00d84f",
  "reddit": "https://www.figma.com/api/mcp/asset/d7231c85-47d5-44cb-9379-1f251cf44512",
  "tinder": "https://www.figma.com/api/mcp/asset/aa6d1912-d2fc-4b2d-9425-f93347af4be5",
  "android": "https://www.figma.com/api/mcp/asset/f59cc227-ffc5-4d1f-829f-f138a451d075",
  "netflix": "https://www.figma.com/api/mcp/asset/a97f4a88-aa0f-4ea1-8916-299e51d25bb4",
  "soundcloud": "https://www.figma.com/api/mcp/asset/dd04e144-d0ae-4346-b09b-c7ceca7a7b57",
  "facebook": "https://www.figma.com/api/mcp/asset/98711dab-a1ca-4c07-94e2-c28a2d0dc92c",
  "instagram": "https://www.figma.com/api/mcp/asset/fc1039b2-e7eb-43f9-b4f3-7041d82a0b37",
  "whatsapp": "https://www.figma.com/api/mcp/asset/a728ffcc-50fb-4c64-9544-6ded47e82843",
  "twitter": "https://www.figma.com/api/mcp/asset/b21c5ae3-b6ac-44e0-9d7d-51f3d9fd4653",
  "linkedin": "https://www.figma.com/api/mcp/asset/164b5caa-ad4a-4851-846f-de09b90a552c",
  "apple": "https://www.figma.com/api/mcp/asset/e3293d3b-ed97-4a30-8fee-3fed5b90e285",
  "google-play": "https://www.figma.com/api/mcp/asset/b218ac71-5060-48a4-9148-d2aa46fe3f3c",
  "youtube": "https://www.figma.com/api/mcp/asset/7be704f2-211d-4c51-9ce5-fe91fa8928c5",
  "slack": "https://www.figma.com/api/mcp/asset/34d25f2a-e914-4f0a-afd2-a5796b2c408e",
  "discord": "https://www.figma.com/api/mcp/asset/990136cf-ea0b-4bf2-9e03-4c5ad40548b8",
  "spotify": "https://www.figma.com/api/mcp/asset/21cf4aa6-a81f-49ed-a8fd-23e9b42cd7a9",
  "wordpress": "https://www.figma.com/api/mcp/asset/eb4a6872-41d9-482e-8350-8aeb72ca1f63",
  "mailchimp": "https://www.figma.com/api/mcp/asset/010fe04b-78c7-48be-a6a7-ae7ae852a061",
  "messenger": "https://www.figma.com/api/mcp/asset/dcc63322-c298-465c-b4e0-5a7f53d9e437",
  "zendesk": "https://www.figma.com/api/mcp/asset/5654a3ec-3859-44c3-8c78-d7f26c43c680",
  "zapier": "https://www.figma.com/api/mcp/asset/03f269ff-255a-4c14-aa3e-3393ad3d7b37",
  "office365": "https://www.figma.com/api/mcp/asset/b009fe5d-90e8-4aef-afae-60ae71a25df9",
  "snapchat": "https://www.figma.com/api/mcp/asset/1d43d6af-29de-4376-a66d-01788038220c",
  "shopify": "https://www.figma.com/api/mcp/asset/39d1d763-39f9-4ad1-9836-ead4a53d142e",
  "stripe": "https://www.figma.com/api/mcp/asset/346699ff-b51e-43a6-82ce-b15546e6930e",
  "google-meet": "https://www.figma.com/api/mcp/asset/4a44c705-bd58-4299-8afb-1e1b77edf4ec",
  "zoom": "https://www.figma.com/api/mcp/asset/99ae8d3e-a081-4bb6-ab40-2abd4e254679",
  "google-teams": "https://www.figma.com/api/mcp/asset/c48e5c12-e4bc-4c2c-ac3c-b36921259349",
  "vk": "https://www.figma.com/api/mcp/asset/6e26e811-351d-47e9-8cb5-7ea2454a3d86",
  "meta": "https://www.figma.com/api/mcp/asset/90872cae-be98-46d0-8efd-b2dd168314c7",
  "tumblr": "https://www.figma.com/api/mcp/asset/305afb28-80c5-4a40-8200-fc643208c16d",
  "watppad": "https://www.figma.com/api/mcp/asset/5d2ff5f2-ab78-4152-941b-eacdbd53e62c",
  "patreon": "https://www.figma.com/api/mcp/asset/f6ba1ef1-f6ba-43b3-b2a8-c5b7aaf97cd5",
  "vimeo": "https://www.figma.com/api/mcp/asset/8f14db6a-db6a-477d-b7de-f8fc5c4d7a9e",
  "xing": "https://www.figma.com/api/mcp/asset/5bb9b131-dca2-4cce-80d9-70f79ed8ebd1",
  "yelp": "https://www.figma.com/api/mcp/asset/6b503746-eb44-439e-a14e-c3e945b2ec47",
  "truth": "https://www.figma.com/api/mcp/asset/f1c5e0d5-e39b-43a8-94ed-6ec9fdefc7a3",
  "quora": "https://www.figma.com/api/mcp/asset/452fc3ef-054c-4d17-9a45-6ebc67a85277",
  "pinterest": "https://www.figma.com/api/mcp/asset/ee593ff9-8f06-4955-87a0-ba6a4a09ac9c",
}

async function downloadLogo(name: string, url: string) {
  try {
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`Failed to fetch ${url}: ${response.statusText}`)
    }
    
    // Check content type
    const contentType = response.headers.get("content-type") || ""
    const isSvg = contentType.includes("svg") || url.includes("svg")
    const extension = isSvg ? "svg" : "png"
    
    const buffer = await response.arrayBuffer()
    const filePath = join(logosDir, `${name}.${extension}`)
    writeFileSync(filePath, Buffer.from(buffer))
    console.log(`✓ Downloaded: ${name}.${extension}`)
    return true
  } catch (error) {
    console.error(`✗ Error downloading ${name}:`, error)
    return false
  }
}

async function main() {
  console.log(`Downloading ${Object.keys(logoUrls).length} logos to ${logosDir}`)
  
  let downloaded = 0
  let failed = 0
  
  for (const [name, url] of Object.entries(logoUrls)) {
    const success = await downloadLogo(name, url)
    if (success) {
      downloaded++
    } else {
      failed++
    }
    
    // Small delay to avoid rate limiting
    await new Promise((resolve) => setTimeout(resolve, 100))
  }
  
  console.log(`\nDownload complete!`)
  console.log(`Downloaded: ${downloaded}`)
  console.log(`Failed: ${failed}`)
}

main().catch(console.error)


