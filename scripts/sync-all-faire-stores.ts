/**
 * Script to sync all Faire stores - products, orders, and relationships
 * Run with: npx tsx scripts/sync-all-faire-stores.ts
 */

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://hbtugjzbncvxyetcktbl.supabase.co'
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhidHVnanpibmN2eHlldGNrdGJsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NjgyODIyNywiZXhwIjoyMDgyNDA0MjI3fQ.-B-mK6oZxXmqc6gZzR60xiBD4Zo-jZuck8tbmnIvx6w'
const FAIRE_API_BASE_URL = 'https://www.faire.com/external-api/v2'

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

interface FaireStore {
  id: string
  name: string
  code: string
  api_token: string
  webhook_secret: string
}

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

interface FaireApiOrderResponse {
  id: string
  display_id: string
  state: string
  created_at: string
  updated_at: string
  ship_after?: string
  payout_costs?: {
    payout_fee: { amount_minor: number; currency: string }
    payout_total: { amount_minor: number; currency: string }
    commission: { amount_minor: number; currency: string }
  }
  address?: {
    name?: string
    address1?: string
    address2?: string
    city?: string
    state?: string
    postal_code?: string
    country?: string
    company_name?: string
    phone_number?: string
  }
  retailer?: {
    id?: string
    brand_id?: string
    name?: string
  }
  items?: FaireApiOrderItemResponse[]
  shipments?: FaireApiShipmentResponse[]
  source?: string
}

interface FaireApiOrderItemResponse {
  id: string
  order_id: string
  product_id: string
  variant_id: string
  product_name: string
  variant_name?: string
  sku?: string
  quantity: number
  price_cents: number
  includes_tester?: boolean
  tester_price_cents?: number
}

interface FaireApiShipmentResponse {
  id: string
  order_id: string
  carrier?: string
  tracking_number?: string
  tracking_url?: string
  ship_date?: string
  expected_delivery_date?: string
  status?: string
}

// API fetch functions
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

async function fetchFaireOrders(
  credentials: FaireApiCredentials,
  cursor?: string
): Promise<{ orders: FaireApiOrderResponse[]; cursor?: string }> {
  const url = new URL(`${FAIRE_API_BASE_URL}/orders`)
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

function mapOrderState(state?: string): string {
  if (!state) return 'NEW'
  const map: Record<string, string> = {
    'NEW': 'NEW',
    'PROCESSING': 'PROCESSING',
    'PRE_TRANSIT': 'PRE_TRANSIT',
    'IN_TRANSIT': 'IN_TRANSIT',
    'DELIVERED': 'DELIVERED',
    'CANCELED': 'CANCELED',
    'BACKORDERED': 'BACKORDERED',
  }
  return map[state.toUpperCase()] || 'NEW'
}

async function syncProductsForStore(store: FaireStore): Promise<{ products: number; variants: number; errors: string[] }> {
  console.log(`\n  Syncing products for ${store.name}...`)

  const credentials: FaireApiCredentials = {
    appCredentials: store.webhook_secret,
    accessToken: store.api_token,
  }

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
      console.log(`    Fetching products page ${pageNum}...`)
      const response = await fetchFaireProducts(credentials, cursor)

      if (response.products?.length > 0) {
        allProducts.push(...response.products)
        console.log(`      Got ${response.products.length} products`)
        pageNum++
        cursor = response.cursor
        hasMore = !!response.cursor
      } else {
        hasMore = false
      }

      await new Promise(r => setTimeout(r, 300))
    }

    console.log(`    Total products fetched: ${allProducts.length}`)

    // Process each product
    for (const apiProduct of allProducts) {
      try {
        const productData = {
          faire_product_id: apiProduct.id,
          faire_brand_id: apiProduct.brand_id,
          store_id: store.id,
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
          .eq('store_id', store.id)
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
            errors.push(`Product ${apiProduct.id}: ${insertError?.message}`)
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
              store_id: store.id,
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
                errors.push(`Variant ${variant.id}: ${variantError.message}`)
                continue
              }
            }

            variantsProcessed++
          }
        }
      } catch (e) {
        errors.push(`Product ${apiProduct.id}: ${e instanceof Error ? e.message : 'Unknown'}`)
      }
    }

    console.log(`    Products processed: ${productsProcessed}, Variants: ${variantsProcessed}`)

  } catch (error) {
    console.error(`    Error syncing products:`, error)
    errors.push(`Store sync failed: ${error instanceof Error ? error.message : 'Unknown'}`)
  }

  return { products: productsProcessed, variants: variantsProcessed, errors }
}

async function syncOrdersForStore(store: FaireStore): Promise<{ orders: number; items: number; shipments: number; errors: string[] }> {
  console.log(`\n  Syncing orders for ${store.name}...`)

  const credentials: FaireApiCredentials = {
    appCredentials: store.webhook_secret,
    accessToken: store.api_token,
  }

  let ordersProcessed = 0
  let itemsProcessed = 0
  let shipmentsProcessed = 0
  const errors: string[] = []

  try {
    // Fetch all orders
    let cursor: string | undefined
    let hasMore = true
    let pageNum = 1
    const allOrders: FaireApiOrderResponse[] = []

    while (hasMore) {
      console.log(`    Fetching orders page ${pageNum}...`)
      const response = await fetchFaireOrders(credentials, cursor)

      if (response.orders?.length > 0) {
        allOrders.push(...response.orders)
        console.log(`      Got ${response.orders.length} orders`)
        pageNum++
        cursor = response.cursor
        hasMore = !!response.cursor
      } else {
        hasMore = false
      }

      await new Promise(r => setTimeout(r, 300))
    }

    console.log(`    Total orders fetched: ${allOrders.length}`)

    // Process each order
    for (const apiOrder of allOrders) {
      try {
        const orderData = {
          faire_order_id: apiOrder.id,
          store_id: store.id,
          display_id: apiOrder.display_id,
          state: mapOrderState(apiOrder.state),
          faire_created_at: apiOrder.created_at,
          faire_updated_at: apiOrder.updated_at,
          ship_after: apiOrder.ship_after,
          payout_costs: apiOrder.payout_costs,
          address: apiOrder.address,
          retailer_id: apiOrder.retailer?.id,
          retailer_name: apiOrder.retailer?.name,
          source: apiOrder.source,
          last_synced_at: new Date().toISOString(),
        }

        // Upsert order
        const { data: existingOrder } = await supabase
          .from('faire_orders')
          .select('id')
          .eq('faire_order_id', apiOrder.id)
          .eq('store_id', store.id)
          .single()

        let orderId: string

        if (existingOrder) {
          await supabase
            .from('faire_orders')
            .update(orderData)
            .eq('id', existingOrder.id)
          orderId = existingOrder.id
        } else {
          const { data: newOrder, error: insertError } = await supabase
            .from('faire_orders')
            .insert(orderData)
            .select('id')
            .single()

          if (insertError || !newOrder) {
            errors.push(`Order ${apiOrder.id}: ${insertError?.message}`)
            continue
          }
          orderId = newOrder.id
        }

        ordersProcessed++

        // Process order items
        if (apiOrder.items?.length) {
          for (const item of apiOrder.items) {
            const itemData = {
              faire_order_item_id: item.id,
              order_id: orderId,
              store_id: store.id,
              faire_product_id: item.product_id,
              faire_variant_id: item.variant_id,
              product_name: item.product_name,
              variant_name: item.variant_name,
              sku: item.sku,
              quantity: item.quantity,
              price_cents: item.price_cents,
              includes_tester: item.includes_tester || false,
              tester_price_cents: item.tester_price_cents,
            }

            const { data: existingItem } = await supabase
              .from('faire_order_items')
              .select('id')
              .eq('faire_order_item_id', item.id)
              .eq('order_id', orderId)
              .single()

            if (existingItem) {
              await supabase
                .from('faire_order_items')
                .update(itemData)
                .eq('id', existingItem.id)
            } else {
              const { error: itemError } = await supabase
                .from('faire_order_items')
                .insert(itemData)

              if (itemError) {
                errors.push(`Item ${item.id}: ${itemError.message}`)
                continue
              }
            }

            itemsProcessed++
          }
        }

        // Process shipments
        if (apiOrder.shipments?.length) {
          for (const shipment of apiOrder.shipments) {
            const shipmentData = {
              faire_shipment_id: shipment.id,
              order_id: orderId,
              store_id: store.id,
              carrier: shipment.carrier,
              tracking_number: shipment.tracking_number,
              tracking_url: shipment.tracking_url,
              ship_date: shipment.ship_date,
              expected_delivery_date: shipment.expected_delivery_date,
              status: shipment.status,
            }

            const { data: existingShipment } = await supabase
              .from('faire_shipments')
              .select('id')
              .eq('faire_shipment_id', shipment.id)
              .eq('order_id', orderId)
              .single()

            if (existingShipment) {
              await supabase
                .from('faire_shipments')
                .update(shipmentData)
                .eq('id', existingShipment.id)
            } else {
              const { error: shipmentError } = await supabase
                .from('faire_shipments')
                .insert(shipmentData)

              if (shipmentError) {
                errors.push(`Shipment ${shipment.id}: ${shipmentError.message}`)
                continue
              }
            }

            shipmentsProcessed++
          }
        }
      } catch (e) {
        errors.push(`Order ${apiOrder.id}: ${e instanceof Error ? e.message : 'Unknown'}`)
      }
    }

    console.log(`    Orders: ${ordersProcessed}, Items: ${itemsProcessed}, Shipments: ${shipmentsProcessed}`)

  } catch (error) {
    console.error(`    Error syncing orders:`, error)
    errors.push(`Store sync failed: ${error instanceof Error ? error.message : 'Unknown'}`)
  }

  return { orders: ordersProcessed, items: itemsProcessed, shipments: shipmentsProcessed, errors }
}

async function linkOrderItemsToProducts(storeId: string, storeName: string): Promise<{ linked: number }> {
  console.log(`\n  Linking order items to products for ${storeName}...`)

  // Get all order items without product_id linked
  const { data: items } = await supabase
    .from('faire_order_items')
    .select('id, faire_product_id, faire_variant_id')
    .eq('store_id', storeId)
    .is('product_id', null)

  if (!items?.length) {
    console.log(`    No items to link`)
    return { linked: 0 }
  }

  let linked = 0

  // Get all products for this store
  const { data: products } = await supabase
    .from('faire_products')
    .select('id, faire_product_id')
    .eq('store_id', storeId)

  const productMap = new Map(products?.map(p => [p.faire_product_id, p.id]) || [])

  // Get all variants for this store
  const { data: variants } = await supabase
    .from('faire_product_variants')
    .select('id, faire_variant_id')
    .eq('store_id', storeId)

  const variantMap = new Map(variants?.map(v => [v.faire_variant_id, v.id]) || [])

  // Update items
  for (const item of items) {
    const productId = productMap.get(item.faire_product_id)
    const variantId = variantMap.get(item.faire_variant_id)

    if (productId) {
      await supabase
        .from('faire_order_items')
        .update({
          product_id: productId,
          variant_id: variantId || null,
        })
        .eq('id', item.id)

      linked++
    }
  }

  console.log(`    Linked ${linked} items to products`)
  return { linked }
}

async function main() {
  console.log('=' .repeat(60))
  console.log('FAIRE ALL STORES SYNC')
  console.log('=' .repeat(60))
  console.log(`Started at: ${new Date().toISOString()}`)

  // Get all active stores
  const { data: stores, error: storesError } = await supabase
    .from('faire_stores')
    .select('id, name, code, api_token, webhook_secret')
    .eq('is_active', true)
    .order('name')

  if (storesError || !stores?.length) {
    console.error('Failed to get stores:', storesError?.message)
    return
  }

  console.log(`\nFound ${stores.length} active stores to sync`)

  const results: Record<string, {
    products: number
    variants: number
    orders: number
    items: number
    shipments: number
    linked: number
    errors: string[]
  }> = {}

  // Sync each store
  for (const store of stores) {
    console.log(`\n${'='.repeat(50)}`)
    console.log(`SYNCING: ${store.name} (${store.code})`)
    console.log('='.repeat(50))

    results[store.name] = {
      products: 0,
      variants: 0,
      orders: 0,
      items: 0,
      shipments: 0,
      linked: 0,
      errors: [],
    }

    try {
      // Sync products
      const productResult = await syncProductsForStore(store)
      results[store.name].products = productResult.products
      results[store.name].variants = productResult.variants
      results[store.name].errors.push(...productResult.errors)

      // Sync orders
      const orderResult = await syncOrdersForStore(store)
      results[store.name].orders = orderResult.orders
      results[store.name].items = orderResult.items
      results[store.name].shipments = orderResult.shipments
      results[store.name].errors.push(...orderResult.errors)

      // Link order items to products
      const linkResult = await linkOrderItemsToProducts(store.id, store.name)
      results[store.name].linked = linkResult.linked

      // Update store last_sync_at
      await supabase
        .from('faire_stores')
        .update({ last_sync_at: new Date().toISOString() })
        .eq('id', store.id)

      // Create sync log
      await supabase
        .from('faire_sync_logs')
        .insert({
          store_id: store.id,
          entity_type: 'full_sync',
          status: 'completed',
          started_at: new Date().toISOString(),
          completed_at: new Date().toISOString(),
          total_records: productResult.products + orderResult.orders,
          processed_records: productResult.products + orderResult.orders,
          failed_records: results[store.name].errors.length,
        })

    } catch (error) {
      console.error(`  Store sync failed:`, error)
      results[store.name].errors.push(`Store sync failed: ${error instanceof Error ? error.message : 'Unknown'}`)
    }
  }

  // Print summary
  console.log('\n' + '='.repeat(60))
  console.log('SYNC SUMMARY')
  console.log('='.repeat(60))

  let totalProducts = 0
  let totalVariants = 0
  let totalOrders = 0
  let totalItems = 0
  let totalShipments = 0
  let totalLinked = 0
  let totalErrors = 0

  for (const [storeName, result] of Object.entries(results)) {
    console.log(`\n${storeName}:`)
    console.log(`  Products: ${result.products}, Variants: ${result.variants}`)
    console.log(`  Orders: ${result.orders}, Items: ${result.items}, Shipments: ${result.shipments}`)
    console.log(`  Items Linked: ${result.linked}`)
    console.log(`  Errors: ${result.errors.length}`)

    totalProducts += result.products
    totalVariants += result.variants
    totalOrders += result.orders
    totalItems += result.items
    totalShipments += result.shipments
    totalLinked += result.linked
    totalErrors += result.errors.length

    if (result.errors.length > 0) {
      console.log(`  First 3 errors:`)
      result.errors.slice(0, 3).forEach(e => console.log(`    - ${e}`))
    }
  }

  console.log('\n' + '='.repeat(60))
  console.log('TOTALS ACROSS ALL STORES:')
  console.log('='.repeat(60))
  console.log(`Products: ${totalProducts}`)
  console.log(`Variants: ${totalVariants}`)
  console.log(`Orders: ${totalOrders}`)
  console.log(`Order Items: ${totalItems}`)
  console.log(`Shipments: ${totalShipments}`)
  console.log(`Items Linked: ${totalLinked}`)
  console.log(`Errors: ${totalErrors}`)
  console.log(`\nCompleted at: ${new Date().toISOString()}`)
}

main().catch(console.error)
