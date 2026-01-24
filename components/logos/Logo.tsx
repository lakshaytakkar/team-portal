"use client"

import { cn } from "@/lib/utils"

export type LogoName =
  | "google"
  | "facebook"
  | "instagram"
  | "twitter"
  | "linkedin"
  | "youtube"
  | "whatsapp"
  | "discord"
  | "slack"
  | "telegram"
  | "tiktok"
  | "snapchat"
  | "pinterest"
  | "reddit"
  | "notion"
  | "figma"
  | "trello"
  | "monday"
  | "zoom"
  | "google-meet"
  | "google-teams"
  | "shopify"
  | "stripe"
  | "paypal"
  | "amazon"
  | "klarna"
  | "google-drive"
  | "google-photos"
  | "google-maps"
  | "google-cloud"
  | "google-play"
  | "google-analytics"
  | "google-ads"
  | "netflix"
  | "spotify"
  | "soundcloud"
  | "twitch"
  | "vimeo"
  | "webflow"
  | "wordpress"
  | "mailchimp"
  | "zendesk"
  | "zapier"
  | "office365"
  | "meta"
  | "tumblr"
  | "patreon"
  | "xing"
  | "yelp"
  | "quora"
  | "behance"
  | "dribbble"
  | "medium"
  | "opera"
  | "android"
  | "apple"
  | "app-store"
  | "tinder"
  | "vk"
  | "watppad"
  | "truth"
  | "evergreen"
  | "font-awesome"
  | "apple-podcast"
  | "google-fit"
  | "google-home"
  | "google-pay"
  | "google-shopping"
  | "google-adsense"
  | "skype"
  | "messenger"

interface LogoProps {
  name: LogoName
  size?: number
  className?: string
}

const logoPath: Record<LogoName, string> = {
  google: "/logos/google.svg",
  facebook: "/logos/facebook.svg",
  instagram: "/logos/instagram.svg",
  twitter: "/logos/twitter.svg",
  linkedin: "/logos/linkedin.svg",
  youtube: "/logos/youtube.svg",
  whatsapp: "/logos/whatsapp.svg",
  discord: "/logos/discord.svg",
  slack: "/logos/slack.svg",
  telegram: "/logos/telegram.svg",
  tiktok: "/logos/tiktok.svg",
  snapchat: "/logos/snapchat.svg",
  pinterest: "/logos/pinterest.svg",
  reddit: "/logos/reddit.svg",
  notion: "/logos/notion.svg",
  figma: "/logos/figma.svg",
  trello: "/logos/trello.svg",
  monday: "/logos/monday.svg",
  zoom: "/logos/zoom.svg",
  "google-meet": "/logos/google-meet.svg",
  "google-teams": "/logos/google-teams.svg",
  shopify: "/logos/shopify.svg",
  stripe: "/logos/stripe.svg",
  paypal: "/logos/paypal.svg",
  amazon: "/logos/amazon.svg",
  klarna: "/logos/klarna.svg",
  "google-drive": "/logos/google-drive.svg",
  "google-photos": "/logos/google-photos.svg",
  "google-maps": "/logos/google-maps.svg",
  "google-cloud": "/logos/google-cloud.svg",
  "google-play": "/logos/google-play.svg",
  "google-analytics": "/logos/google-analytics.svg",
  "google-ads": "/logos/google-ads.svg",
  netflix: "/logos/netflix.svg",
  spotify: "/logos/spotify.svg",
  soundcloud: "/logos/soundcloud.svg",
  twitch: "/logos/twitch.svg",
  vimeo: "/logos/vimeo.svg",
  webflow: "/logos/webflow.svg",
  wordpress: "/logos/wordpress.svg",
  mailchimp: "/logos/mailchimp.svg",
  zendesk: "/logos/zendesk.svg",
  zapier: "/logos/zapier.svg",
  office365: "/logos/office365.svg",
  meta: "/logos/meta.svg",
  tumblr: "/logos/tumblr.svg",
  patreon: "/logos/patreon.svg",
  xing: "/logos/xing.svg",
  yelp: "/logos/yelp.svg",
  quora: "/logos/quora.svg",
  behance: "/logos/behance.svg",
  dribbble: "/logos/dribbble.svg",
  medium: "/logos/medium.svg",
  opera: "/logos/opera.svg",
  android: "/logos/android.svg",
  apple: "/logos/apple.svg",
  "app-store": "/logos/app-store.svg",
  tinder: "/logos/tinder.svg",
  vk: "/logos/vk.svg",
  watppad: "/logos/watppad.svg",
  truth: "/logos/truth.svg",
  evergreen: "/logos/evergreen.svg",
  "font-awesome": "/logos/font-awesome.svg",
  "apple-podcast": "/logos/apple-podcast.svg",
  "google-fit": "/logos/google-fit.svg",
  "google-home": "/logos/google-home.svg",
  "google-pay": "/logos/google-pay.svg",
  "google-shopping": "/logos/google-shopping.svg",
  "google-adsense": "/logos/google-adsense.svg",
  skype: "/logos/skype.svg",
  messenger: "/logos/messenger.svg",
}

export function Logo({ name, size = 24, className }: LogoProps) {
  const src = logoPath[name]

  if (!src) {
    console.warn(`Logo "${name}" not found in registry`)
    return null
  }

  return (
    <img
      src={src}
      alt={`${name} logo`}
      width={size}
      height={size}
      className={cn("inline-block object-contain", className)}
      onError={(e) => {
        const target = e.target as HTMLImageElement
        target.style.display = "none"
      }}
    />
  )
}

