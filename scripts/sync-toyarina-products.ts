/**
 * Script to sync Toyarina products from Faire API
 * Run with: npx tsx scripts/sync-toyarina-products.ts
 */

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://hbtugjzbncvxyetcktbl.supabase.co'
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhidHVnanpibmN2eHlldGNrdGJsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NjgyODIyNywiZXhwIjoyMDgyNDA0MjI3fQ.-B-mK6oZxXmqc6gZzR60xiBD4Zo-jZuck8tbmnIvx6w'
const FAIRE_API_BASE_URL = 'https://www.faire.com/external-api/v2'

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

interface FaireApiCredentials {
  appCredentials: string
  accessToken: string
}

interface FaireApiProductResponse {
  id: string
  brand_id: string
  name: string
  short_description?: string
  description?: string
  unit_multiplier?: number
  minimum_order_quantity?: number
  sale_state?: string
  lifecycle_state?: string
  taxonomy_type?: { id?: string; name?: string }
  made_in_country?: string
  preorderable?: boolean
  preorder_details?: {
    order_by_date?: string
    expected_ship_date?: string
  }
  images?: Array<{ id: string; url: string }>
  variants?: FaireApiVariantResponse[]
}

interface FaireApiVariantResponse {
  id: string
  product_id: string
  name: string
  sku?: string
  gtin?: string
  sale_state?: string
  lifecycle_state?: string
  prices?: Array<{
    geo_constraint?: { country?: string }
    wholesale_price: { amount_minor: number; currency: string }
    retail_price?: { amount_minor: number; currency: string }
  }>
  available_quantity?: number
  reserved_quantity?: number
  backordered_until?: string
  options?: Array<{ name: string; value: string }>
  measurements?: {
    mass_unit?: string
    weight?: number
    distance_unit?: string
    length?: number
    width?: number
    height?: number
  }
}

async function fetchFaireProducts(
  credentials: FaireApiCredentials,
  cursor?: string
): Promise<{ products: FaireApiProductResponse[]; cursor?: string }> {
  const url = new URL(`${FAIRE_API_BASE_URL}/products`)
  url.searchParams.set('limit', '50')
  if (cursor) url.searchParams.set('cursor', cursor)

  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: {
      'X-FAIRE-APP-CREDENTIALS': credentials.appCredentials,
      'X-FAIRE-OAUTH-ACCESS-TOKEN': credentials.accessToken,
      'Content-Type': 'application/json',
    },
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Faire API error (${response.status}): ${errorText}`)
  }

  return response.json()
}

function mapSaleState(state?: string): string {
  if (!state) return 'FOR_SALE'
  const map: Record<string, string> = {
    'FOR_SALE': 'FOR_SALE',
    'SALES_PAUSED': 'SALES_PAUSED',
    'DISCONTINUED': 'DISCONTINUED',
  }
  return map[state.toUpperCase()] || 'FOR_SALE'
}

function mapLifecycleState(state?: string): string {
  if (!state) return 'PUBLISHED'
  const map: Record<string, string> = {
    'DRAFT': 'DRAFT',
    'PUBLISHED': 'PUBLISHED',
    'ARCHIVED': 'ARCHIVED',
  }
  return map[state.toUpperCase()] || 'PUBLISHED'
}

async function main() {
  console.log('Starting Toyarina products sync...')
  console.log('=' .repeat(50))

  // Get store and credentials
  const { data: store, error: storeError } = await supabase
    .from('faire_stores')
    .select('id, api_token, webhook_secret')
    .eq('code', 'TOYARINA')
    .single()

  if (storeError || !store) {
    console.error('Failed to get store:', storeError?.message)
    return
  }

  const credentials: FaireApiCredentials = {
    appCredentials: store.webhook_secret || '',
    accessToken: store.api_token || '',
  }

  const storeId = store.id

  // Create sync log
  const { data: syncLog } = await supabase
    .from('faire_sync_logs')
    .insert({
      store_id: storeId,
      entity_type: 'products',
      status: 'in_progress',
      started_at: new Date().toISOString(),
    })
    .select('id')
    .single()

  let productsProcessed = 0
  let variantsProcessed = 0
  const errors: string[] = []

  try {
    // Fetch all products
    let cursor: string | undefined
    let hasMore = true
    let pageNum = 1
    const allProducts: FaireApiProductResponse[] = []

    while (hasMore) {
      console.log(`Fetching page ${pageNum}...`)
      const response = await fetchFaireProducts(credentials, cursor)

      if (response.products?.length > 0) {
        allProducts.push(...response.products)
        console.log(`  Got ${response.products.length} products`)
        pageNum++
        cursor = response.cursor
        hasMore = !!response.cursor
      } else {
        hasMore = false
      }

      await new Promise(r => setTimeout(r, 500))
    }

    console.log(`\nTotal products fetched: ${allProducts.length}`)

    // Process each product
    for (const apiProduct of allProducts) {
      try {
        const productData = {
          faire_product_id: apiProduct.id,
          faire_brand_id: apiProduct.brand_id,
          store_id: storeId,
          name: apiProduct.name,
          short_description: apiProduct.short_description,
          description: apiProduct.description,
          sale_state: mapSaleState(apiProduct.sale_state),
          lifecycle_state: mapLifecycleState(apiProduct.lifecycle_state),
          unit_multiplier: apiProduct.unit_multiplier || 1,
          minimum_order_quantity: apiProduct.minimum_order_quantity || 1,
          taxonomy_type: apiProduct.taxonomy_type,
          made_in_country: apiProduct.made_in_country,
          preorderable: apiProduct.preorderable || false,
          preorder_details: apiProduct.preorder_details,
          images: apiProduct.images?.map(img => img.url) || [],
          last_synced_at: new Date().toISOString(),
        }

        // Upsert product
        const { data: existingProduct } = await supabase
          .from('faire_products')
          .select('id')
          .eq('faire_product_id', apiProduct.id)
          .eq('store_id', storeId)
          .single()

        let productId: string

        if (existingProduct) {
          await supabase
            .from('faire_products')
            .update(productData)
            .eq('id', existingProduct.id)
          productId = existingProduct.id
        } else {
          const { data: newProduct, error: insertError } = await supabase
            .from('faire_products')
            .insert(productData)
            .select('id')
            .single()

          if (insertError || !newProduct) {
            errors.push(`Failed to insert product ${apiProduct.id}: ${insertError?.message}`)
            continue
          }
          productId = newProduct.id
        }

        productsProcessed++

        // Process variants
        if (apiProduct.variants?.length) {
          for (const variant of apiProduct.variants) {
            const variantData = {
              faire_variant_id: variant.id,
              product_id: productId,
              store_id: storeId,
              name: variant.name,
              sku: variant.sku,
              gtin: variant.gtin,
              sale_state: mapSaleState(variant.sale_state),
              lifecycle_state: mapLifecycleState(variant.lifecycle_state),
              prices: variant.prices?.map(p => ({
                geoConstraint: p.geo_constraint,
                wholesalePrice: p.wholesale_price,
                retailPrice: p.retail_price,
              })),
              available_quantity: variant.available_quantity || 0,
              reserved_quantity: variant.reserved_quantity || 0,
              backordered_until: variant.backordered_until,
              options: variant.options,
              measurements: variant.measurements,
              last_synced_at: new Date().toISOString(),
            }

            const { data: existingVariant } = await supabase
              .from('faire_product_variants')
              .select('id')
              .eq('faire_variant_id', variant.id)
              .eq('product_id', productId)
              .single()

            if (existingVariant) {
              await supabase
                .from('faire_product_variants')
                .update(variantData)
                .eq('id', existingVariant.id)
            } else {
              const { error: variantError } = await supabase
                .from('faire_product_variants')
                .insert(variantData)

              if (variantError) {
                errors.push(`Failed to insert variant ${variant.id}: ${variantError.message}`)
                continue
              }
            }

            variantsProcessed++
          }
        }

        if (productsProcessed % 50 === 0) {
          console.log(`  Processed ${productsProcessed} products, ${variantsProcessed} variants...`)
        }
      } catch (e) {
        errors.push(`Error processing ${apiProduct.id}: ${e instanceof Error ? e.message : 'Unknown'}`)
      }
    }

    // Update sync log
    if (syncLog) {
      await supabase
        .from('faire_sync_logs')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          total_records: allProducts.length,
          processed_records: productsProcessed,
          failed_records: errors.length,
        })
        .eq('id', syncLog.id)
    }

    // Update store last_sync_at
    await supabase
      .from('faire_stores')
      .update({ last_sync_at: new Date().toISOString() })
      .eq('id', storeId)

  } catch (error) {
    console.error('Sync failed:', error)
    if (syncLog) {
      await supabase
        .from('faire_sync_logs')
        .update({
          status: 'failed',
          completed_at: new Date().toISOString(),
          error_message: error instanceof Error ? error.message : 'Unknown error',
        })
        .eq('id', syncLog.id)
    }
  }

  console.log('\n' + '=' .repeat(50))
  console.log('Sync completed!')
  console.log(`Products processed: ${productsProcessed}`)
  console.log(`Variants processed: ${variantsProcessed}`)
  console.log(`Errors: ${errors.length}`)

  if (errors.length > 0) {
    console.log('\nFirst 5 errors:')
    errors.slice(0, 5).forEach(e => console.log(`  - ${e}`))
  }
}

main().catch(console.error)
