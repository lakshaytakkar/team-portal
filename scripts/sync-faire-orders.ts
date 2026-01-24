/**
 * Script to sync Faire orders for Toyarina store
 * Run with: npx tsx scripts/sync-faire-orders.ts
 */

import { config } from 'dotenv'
import { createClient } from '@supabase/supabase-js'

// Load environment variables from .env.local
config({ path: '.env.local' })

const FAIRE_API_BASE_URL = 'https://www.faire.com/external-api/v2'

const TOYARINA_CREDENTIALS = {
  appCredentials: 'YXBhX2pkd2RkOHNnOWg6YTVsc3l0NGUwZnhzNWFpbDE2aGYyazUydHZtcDU2aTl6cnVldzA3dmtmbTh0aGRiYmNleDNqMjdtbGRha2dpN3ZnbjMzeXZ1YjNqYmJvYXpoeDd4YmQ0MXhmMnJlamhzcmt5bw==',
  accessToken: 'oaa_dg8aks8omlj16gprazok5v6uy8gdkgpbiwm4gy13ddjbq7xbtbb4f4xm82jzo07q8atz4gfwb5hdeiarhe66psl1fa7xhsk9',
}

// Initialize Supabase client with service role key for direct access
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Types
interface FaireApiOrderResponse {
  id: string
  display_id?: string
  state: string
  retailer_id?: string
  customer?: {
    first_name?: string
    last_name?: string
  }
  address?: {
    id?: string
    name?: string
    company_name?: string
    address1?: string
    address2?: string
    city?: string
    state?: string
    state_code?: string
    postal_code?: string
    country?: string
    country_code?: string
    phone_number?: string
  }
  ship_after?: string
  payout_costs?: {
    total_payout?: { amount_minor: number; currency: string }
    commission_cents?: number
    commission_bps?: number
    commission?: { amount_minor: number; currency: string }
    payout_fee_cents?: number
    payout_fee_bps?: number
    payout_fee?: { amount_minor: number; currency: string }
    subtotal_after_brand_discounts?: { amount_minor: number; currency: string }
    total_brand_discounts?: { amount_minor: number; currency: string }
    payout_protection_fee?: { amount_minor: number; currency: string }
    net_tax?: { amount_minor: number; currency: string }
    shipping_subsidy?: { amount_minor: number; currency: string }
  }
  estimated_payout_at?: string
  purchase_order_number?: string
  source?: string
  is_free_shipping?: boolean
  free_shipping_reason?: string
  faire_covered_shipping_cost?: { amount_minor: number; currency: string }
  has_pending_retailer_cancellation_request?: boolean
  payment_initiated_at?: string
  items?: FaireApiOrderItemResponse[]
  shipments?: FaireApiShipmentResponse[]
  created_at?: string
  updated_at?: string
}

interface FaireApiOrderItemResponse {
  id: string
  order_id: string
  product_id: string
  variant_id: string
  quantity: number
  price_cents: number
  price?: { amount_minor: number; currency: string }
  currency?: string
  sku?: string
  product_name: string
  variant_name?: string
  state: string
  includes_tester?: boolean
  tester_price?: { amount_minor: number; currency: string }
  created_at?: string
  updated_at?: string
}

interface FaireApiShipmentResponse {
  id: string
  carrier?: string
  tracking_code?: string
  tracking_url?: string
  shipping_type?: string
  maker_cost?: { amount_minor: number; currency: string }
  order_item_ids?: string[]
  shipped_at?: string
  delivered_at?: string
  created_at?: string
  updated_at?: string
}

// Map order state
function mapFaireOrderState(apiState: string): string {
  const stateMap: Record<string, string> = {
    'NEW': 'NEW',
    'PROCESSING': 'PROCESSING',
    'PRE_TRANSIT': 'PRE_TRANSIT',
    'IN_TRANSIT': 'IN_TRANSIT',
    'DELIVERED': 'DELIVERED',
    'BACKORDERED': 'BACKORDERED',
    'CANCELED': 'CANCELED',
  }
  return stateMap[apiState.toUpperCase()] || 'NEW'
}

// Map order item state
function mapFaireOrderItemState(apiState: string): string {
  const stateMap: Record<string, string> = {
    'NEW': 'NEW',
    'CONFIRMED': 'CONFIRMED',
    'BACKORDERED': 'BACKORDERED',
    'SHIPPED': 'SHIPPED',
    'DELIVERED': 'DELIVERED',
    'CANCELED': 'CANCELED',
  }
  return stateMap[apiState.toUpperCase()] || 'NEW'
}

// Transform API order to database format
function transformFaireApiOrder(apiOrder: FaireApiOrderResponse, storeId: string): Record<string, unknown> {
  const customerName = apiOrder.customer
    ? [apiOrder.customer.first_name, apiOrder.customer.last_name].filter(Boolean).join(' ')
    : apiOrder.address?.company_name || apiOrder.address?.name || null

  return {
    faire_order_id: apiOrder.id,
    display_id: apiOrder.display_id || apiOrder.id,
    store_id: storeId,
    state: mapFaireOrderState(apiOrder.state),
    retailer_id: apiOrder.retailer_id,
    retailer_name: customerName,
    address: apiOrder.address ? {
      name: apiOrder.address.name,
      companyName: apiOrder.address.company_name,
      address1: apiOrder.address.address1,
      address2: apiOrder.address.address2,
      city: apiOrder.address.city,
      state: apiOrder.address.state,
      stateCode: apiOrder.address.state_code,
      postalCode: apiOrder.address.postal_code,
      country: apiOrder.address.country,
      countryCode: apiOrder.address.country_code,
      phoneNumber: apiOrder.address.phone_number,
    } : null,
    is_free_shipping: apiOrder.is_free_shipping || false,
    free_shipping_reason: apiOrder.free_shipping_reason,
    faire_covered_shipping_cost_cents: apiOrder.faire_covered_shipping_cost?.amount_minor,
    ship_after: apiOrder.ship_after,
    total_cents: apiOrder.payout_costs?.total_payout?.amount_minor || 0,
    payout_costs: apiOrder.payout_costs ? {
      totalPayout: apiOrder.payout_costs.total_payout?.amount_minor,
      commissionCents: apiOrder.payout_costs.commission?.amount_minor || apiOrder.payout_costs.commission_cents,
      commissionBps: apiOrder.payout_costs.commission_bps,
      payoutFeeCents: apiOrder.payout_costs.payout_fee?.amount_minor || apiOrder.payout_costs.payout_fee_cents,
      payoutFeeBps: apiOrder.payout_costs.payout_fee_bps,
      subtotalAfterBrandDiscounts: apiOrder.payout_costs.subtotal_after_brand_discounts?.amount_minor,
      totalBrandDiscounts: apiOrder.payout_costs.total_brand_discounts?.amount_minor,
      payoutProtectionFee: apiOrder.payout_costs.payout_protection_fee?.amount_minor,
      netTax: apiOrder.payout_costs.net_tax?.amount_minor,
      shippingSubsidy: apiOrder.payout_costs.shipping_subsidy?.amount_minor,
    } : null,
    estimated_payout_at: apiOrder.estimated_payout_at,
    purchase_order_number: apiOrder.purchase_order_number,
    source: apiOrder.source,
    payment_initiated_at: apiOrder.payment_initiated_at,
    has_pending_cancellation_request: apiOrder.has_pending_retailer_cancellation_request || false,
    faire_created_at: apiOrder.created_at,
    faire_updated_at: apiOrder.updated_at,
    last_synced_at: new Date().toISOString(),
  }
}

// Transform order item
function transformFaireApiOrderItem(
  apiItem: FaireApiOrderItemResponse,
  orderId: string,
  storeId: string
): Record<string, unknown> {
  const priceCents = apiItem.price_cents || apiItem.price?.amount_minor || 0
  const currency = apiItem.currency || apiItem.price?.currency || 'USD'

  return {
    faire_order_item_id: apiItem.id,
    order_id: orderId,
    store_id: storeId,
    faire_product_id: apiItem.product_id,
    faire_variant_id: apiItem.variant_id,
    product_name: apiItem.product_name,
    variant_name: apiItem.variant_name,
    sku: apiItem.sku,
    quantity: apiItem.quantity,
    state: mapFaireOrderItemState(apiItem.state),
    price_cents: priceCents,
    currency: currency,
    includes_tester: apiItem.includes_tester || false,
    tester_price_cents: apiItem.tester_price?.amount_minor,
    faire_created_at: apiItem.created_at,
    faire_updated_at: apiItem.updated_at,
  }
}

// Transform shipment
function transformFaireApiShipment(
  apiShipment: FaireApiShipmentResponse,
  orderId: string,
  storeId: string
): Record<string, unknown> {
  return {
    faire_shipment_id: apiShipment.id,
    order_id: orderId,
    store_id: storeId,
    carrier: apiShipment.carrier,
    tracking_code: apiShipment.tracking_code,
    tracking_url: apiShipment.tracking_url,
    shipping_type: apiShipment.shipping_type,
    maker_cost_cents: apiShipment.maker_cost?.amount_minor,
    item_ids: apiShipment.order_item_ids,
    shipped_at: apiShipment.shipped_at,
    delivered_at: apiShipment.delivered_at,
    faire_created_at: apiShipment.created_at,
    faire_updated_at: apiShipment.updated_at,
  }
}

// Fetch orders from Faire API with cursor pagination
async function fetchFaireOrders(cursor?: string, limit: number = 50) {
  const url = new URL(`${FAIRE_API_BASE_URL}/orders`)
  url.searchParams.set('limit', Math.min(limit, 50).toString())
  if (cursor) {
    url.searchParams.set('cursor', cursor)
  }

  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: {
      'X-FAIRE-APP-CREDENTIALS': TOYARINA_CREDENTIALS.appCredentials,
      'X-FAIRE-OAUTH-ACCESS-TOKEN': TOYARINA_CREDENTIALS.accessToken,
      'Content-Type': 'application/json',
    },
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Faire API error (${response.status}): ${errorText}`)
  }

  return response.json()
}

async function syncFaireOrders() {
  console.log('Starting Faire order sync for Toyarina...\n')

  // Get Toyarina store ID
  const { data: store, error: storeError } = await supabase
    .from('faire_stores')
    .select('id, name')
    .eq('code', 'TOYARINA')
    .single()

  if (storeError || !store) {
    console.error('Toyarina store not found:', storeError)
    return
  }

  console.log(`Store: ${store.name} (${store.id})\n`)

  const storeId = store.id
  const errors: string[] = []
  let ordersProcessed = 0
  let orderItemsProcessed = 0
  let shipmentsProcessed = 0

  // Create sync log
  const { data: syncLog, error: syncLogError } = await supabase
    .from('faire_sync_logs')
    .insert({
      store_id: storeId,
      entity_type: 'orders',
      status: 'in_progress',
      started_at: new Date().toISOString(),
    })
    .select('id')
    .single()

  if (syncLogError) {
    console.error('Failed to create sync log:', syncLogError)
  }

  try {
    let cursor: string | undefined = undefined
    let hasMore = true
    let pageNum = 1
    const allOrders: FaireApiOrderResponse[] = []

    // Fetch all orders with cursor-based pagination
    while (hasMore) {
      console.log(`Fetching page ${pageNum}...${cursor ? ` (cursor: ${cursor.slice(0, 20)}...)` : ''}`)
      const response = await fetchFaireOrders(cursor, 50)

      if (response.orders && response.orders.length > 0) {
        allOrders.push(...response.orders)
        console.log(`  Fetched ${response.orders.length} orders`)
        pageNum++

        if (response.cursor) {
          cursor = response.cursor
        } else {
          hasMore = false
        }
      } else {
        hasMore = false
      }

      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 500))
    }

    console.log(`\nTotal orders fetched: ${allOrders.length}\n`)
    console.log('Processing orders...\n')

    // Process orders
    for (const apiOrder of allOrders) {
      try {
        const orderData = transformFaireApiOrder(apiOrder, storeId)

        // Check if order exists
        const { data: existingOrder } = await supabase
          .from('faire_orders')
          .select('id')
          .eq('faire_order_id', apiOrder.id)
          .single()

        let orderId: string

        if (existingOrder) {
          // Update
          const { error: updateError } = await supabase
            .from('faire_orders')
            .update({
              ...orderData,
              updated_at: new Date().toISOString(),
            })
            .eq('id', existingOrder.id)

          if (updateError) {
            errors.push(`Failed to update order ${apiOrder.id}: ${updateError.message}`)
            continue
          }
          orderId = existingOrder.id
        } else {
          // Insert
          const { data: newOrder, error: insertError } = await supabase
            .from('faire_orders')
            .insert({
              ...orderData,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            })
            .select('id')
            .single()

          if (insertError) {
            errors.push(`Failed to insert order ${apiOrder.id}: ${insertError.message}`)
            continue
          }
          orderId = newOrder.id
        }

        ordersProcessed++

        // Process items
        if (apiOrder.items && apiOrder.items.length > 0) {
          for (const apiItem of apiOrder.items) {
            try {
              const itemData = transformFaireApiOrderItem(apiItem, orderId, storeId)

              const { data: existingItem } = await supabase
                .from('faire_order_items')
                .select('id')
                .eq('faire_order_item_id', apiItem.id)
                .single()

              if (existingItem) {
                await supabase
                  .from('faire_order_items')
                  .update({ ...itemData, updated_at: new Date().toISOString() })
                  .eq('id', existingItem.id)
              } else {
                await supabase
                  .from('faire_order_items')
                  .insert({
                    ...itemData,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                  })
              }

              orderItemsProcessed++
            } catch (itemError) {
              errors.push(`Failed to process item ${apiItem.id}: ${itemError}`)
            }
          }
        }

        // Process shipments
        if (apiOrder.shipments && apiOrder.shipments.length > 0) {
          for (const apiShipment of apiOrder.shipments) {
            try {
              const shipmentData = transformFaireApiShipment(apiShipment, orderId, storeId)

              const { data: existingShipment } = await supabase
                .from('faire_shipments')
                .select('id')
                .eq('faire_shipment_id', apiShipment.id)
                .single()

              if (existingShipment) {
                await supabase
                  .from('faire_shipments')
                  .update({ ...shipmentData, updated_at: new Date().toISOString() })
                  .eq('id', existingShipment.id)
              } else {
                await supabase
                  .from('faire_shipments')
                  .insert({
                    ...shipmentData,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                  })
              }

              shipmentsProcessed++
            } catch (shipmentError) {
              errors.push(`Failed to process shipment ${apiShipment.id}: ${shipmentError}`)
            }
          }
        }

        // Progress indicator
        if (ordersProcessed % 10 === 0) {
          console.log(`  Processed ${ordersProcessed}/${allOrders.length} orders...`)
        }

      } catch (orderError) {
        errors.push(`Failed to process order ${apiOrder.id}: ${orderError}`)
      }
    }

    // Update sync log
    if (syncLog) {
      await supabase
        .from('faire_sync_logs')
        .update({
          status: 'completed',
          total_records: allOrders.length,
          processed_records: ordersProcessed,
          failed_records: errors.length,
          completed_at: new Date().toISOString(),
          error_message: errors.length > 0 ? errors.slice(0, 10).join('; ') : null,
        })
        .eq('id', syncLog.id)
    }

    // Update store last sync time
    await supabase
      .from('faire_stores')
      .update({ last_sync_at: new Date().toISOString() })
      .eq('id', storeId)

    console.log('\n=== Sync Complete ===')
    console.log(`Orders processed: ${ordersProcessed}`)
    console.log(`Order items processed: ${orderItemsProcessed}`)
    console.log(`Shipments processed: ${shipmentsProcessed}`)
    if (errors.length > 0) {
      console.log(`\nErrors (${errors.length}):`)
      errors.slice(0, 10).forEach(e => console.log(`  - ${e}`))
    }

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
}

syncFaireOrders()
