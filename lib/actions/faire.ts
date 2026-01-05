'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type {
  FaireStore,
  FaireSupplier,
  FaireProduct,
  FaireProductVariant,
  FaireOrder,
  FaireOrderItem,
  FaireShipment,
  FaireSyncLog,
  FaireInventoryLogEntry,
  FaireStoreFilters,
  FaireSupplierFilters,
  FaireProductFilters,
  FaireOrderFilters,
  FaireShipmentFilters,
  CreateFaireStoreInput,
  UpdateFaireStoreInput,
  CreateFaireSupplierInput,
  UpdateFaireSupplierInput,
  CreateFaireProductInput,
  UpdateFaireProductInput,
  CreateFaireProductVariantInput,
  UpdateFaireProductVariantInput,
  CreateFaireShipmentInput,
  UpdateFaireShipmentInput,
  AdjustFaireInventoryInput,
  FaireOrderState,
  FaireStoreStats,
  FaireOrderStats,
  FaireProductStats,
  FaireOverviewStats,
  FaireRetailer,
  PaginationParams,
  PaginatedResponse,
} from '@/lib/types/faire'
import { DEFAULT_PAGE_SIZE } from '@/lib/types/faire'

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function snakeToCamel(obj: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {}
  for (const key in obj) {
    if (obj[key] !== undefined) {
      const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase())
      result[camelKey] = obj[key]
    }
  }
  return result
}

function camelToSnake<T extends object>(obj: T): Record<string, unknown> {
  const result: Record<string, unknown> = {}
  for (const key in obj) {
    if (obj[key] !== undefined) {
      const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`)
      result[snakeKey] = obj[key]
    }
  }
  return result
}

function transformStore(row: Record<string, unknown>): FaireStore {
  return snakeToCamel(row) as unknown as FaireStore
}

function transformSupplier(row: Record<string, unknown>): FaireSupplier {
  const supplier = snakeToCamel(row) as unknown as FaireSupplier
  if (row.store) {
    supplier.store = transformStore(row.store as Record<string, unknown>)
  }
  return supplier
}

function transformProduct(row: Record<string, unknown>): FaireProduct {
  const product = snakeToCamel(row) as unknown as FaireProduct
  if (row.store) {
    product.store = transformStore(row.store as Record<string, unknown>)
  }
  if (row.supplier) {
    product.supplier = transformSupplier(row.supplier as Record<string, unknown>)
  }
  if (row.variants && Array.isArray(row.variants)) {
    product.variants = row.variants.map((v: Record<string, unknown>) => transformVariant(v))
  }
  return product
}

function transformVariant(row: Record<string, unknown>): FaireProductVariant {
  return snakeToCamel(row) as unknown as FaireProductVariant
}

function transformOrder(row: Record<string, unknown>): FaireOrder {
  const order = snakeToCamel(row) as unknown as FaireOrder
  if (row.store) {
    order.store = transformStore(row.store as Record<string, unknown>)
  }
  if (row.items && Array.isArray(row.items)) {
    order.items = row.items.map((i: Record<string, unknown>) => transformOrderItem(i))
  }
  if (row.shipments && Array.isArray(row.shipments)) {
    order.shipments = row.shipments.map((s: Record<string, unknown>) => transformShipment(s))
  }
  return order
}

function transformOrderItem(row: Record<string, unknown>): FaireOrderItem {
  return snakeToCamel(row) as unknown as FaireOrderItem
}

function transformShipment(row: Record<string, unknown>): FaireShipment {
  const shipment = snakeToCamel(row) as unknown as FaireShipment
  if (row.order) {
    shipment.order = transformOrder(row.order as Record<string, unknown>)
  }
  return shipment
}

function transformSyncLog(row: Record<string, unknown>): FaireSyncLog {
  const log = snakeToCamel(row) as unknown as FaireSyncLog
  if (row.store) {
    log.store = transformStore(row.store as Record<string, unknown>)
  }
  return log
}

function transformInventoryLog(row: Record<string, unknown>): FaireInventoryLogEntry {
  return snakeToCamel(row) as unknown as FaireInventoryLogEntry
}

// ============================================================================
// STORES
// ============================================================================

export async function getFaireStores(filters?: FaireStoreFilters): Promise<FaireStore[]> {
  const supabase = await createClient()

  let query = supabase
    .from('faire_stores')
    .select('*')
    .is('deleted_at', null)
    .order('name', { ascending: true })

  if (filters?.isActive !== undefined) {
    query = query.eq('is_active', filters.isActive)
  }

  if (filters?.searchQuery) {
    query = query.or(`name.ilike.%${filters.searchQuery}%,code.ilike.%${filters.searchQuery}%`)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching faire stores:', error)
    throw new Error('Failed to fetch stores')
  }

  return (data || []).map(transformStore)
}

export async function getFaireStoreById(id: string): Promise<FaireStore | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('faire_stores')
    .select('*')
    .eq('id', id)
    .is('deleted_at', null)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    console.error('Error fetching faire store:', error)
    throw new Error('Failed to fetch store')
  }

  return data ? transformStore(data) : null
}

export async function getFaireStoreByCode(code: string): Promise<FaireStore | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('faire_stores')
    .select('*')
    .eq('code', code)
    .is('deleted_at', null)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    console.error('Error fetching faire store by code:', error)
    throw new Error('Failed to fetch store')
  }

  return data ? transformStore(data) : null
}

export async function createFaireStore(input: CreateFaireStoreInput): Promise<FaireStore> {
  const supabase = await createClient()

  // Generate code if not provided
  const code = input.code || `FAIRE-US-${Date.now().toString().slice(-4)}`

  const { data, error } = await supabase
    .from('faire_stores')
    .insert(camelToSnake({ ...input, code }))
    .select()
    .single()

  if (error) {
    console.error('Error creating faire store:', error)
    throw new Error('Failed to create store')
  }

  revalidatePath('/faire-wholesale')
  return transformStore(data)
}

export async function updateFaireStore(id: string, input: UpdateFaireStoreInput): Promise<FaireStore> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('faire_stores')
    .update(camelToSnake(input))
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating faire store:', error)
    throw new Error('Failed to update store')
  }

  revalidatePath('/faire-wholesale')
  return transformStore(data)
}

export async function deleteFaireStore(id: string): Promise<void> {
  const supabase = await createClient()

  const { error } = await supabase
    .from('faire_stores')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id)

  if (error) {
    console.error('Error deleting faire store:', error)
    throw new Error('Failed to delete store')
  }

  revalidatePath('/faire-wholesale')
}

// ============================================================================
// SUPPLIERS
// ============================================================================

export async function getFaireSuppliers(
  filters?: FaireSupplierFilters,
  pagination?: PaginationParams
): Promise<PaginatedResponse<FaireSupplier>> {
  const supabase = await createClient()
  const page = pagination?.page ?? 1
  const pageSize = pagination?.pageSize ?? DEFAULT_PAGE_SIZE
  const sortBy = pagination?.sortBy ?? 'name'
  const sortOrder = pagination?.sortOrder ?? 'asc'
  const offset = (page - 1) * pageSize

  // Map frontend sort columns to database columns
  const sortColumnMap: Record<string, string> = {
    name: 'name',
    store: 'store_id',
    status: 'status',
    products: 'id', // fallback since products is computed
  }
  const dbSortColumn = sortColumnMap[sortBy] || sortBy

  // Build count query
  let countQuery = supabase
    .from('faire_suppliers')
    .select('*', { count: 'exact', head: true })
    .is('deleted_at', null)

  // Build data query
  let dataQuery = supabase
    .from('faire_suppliers')
    .select(`
      *,
      store:faire_stores(id, name, code)
    `)
    .is('deleted_at', null)

  // Apply filters to both queries
  if (filters?.storeId) {
    const storeIds = Array.isArray(filters.storeId) ? filters.storeId : [filters.storeId]
    countQuery = countQuery.in('store_id', storeIds)
    dataQuery = dataQuery.in('store_id', storeIds)
  }

  if (filters?.status) {
    const statuses = Array.isArray(filters.status) ? filters.status : [filters.status]
    countQuery = countQuery.in('status', statuses)
    dataQuery = dataQuery.in('status', statuses)
  }

  if (filters?.searchQuery) {
    const searchFilter = `name.ilike.%${filters.searchQuery}%,code.ilike.%${filters.searchQuery}%,contact_name.ilike.%${filters.searchQuery}%`
    countQuery = countQuery.or(searchFilter)
    dataQuery = dataQuery.or(searchFilter)
  }

  // Add sorting and pagination
  dataQuery = dataQuery
    .order(dbSortColumn, { ascending: sortOrder === 'asc' })
    .range(offset, offset + pageSize - 1)

  // Execute both queries in parallel
  const [countResult, dataResult] = await Promise.all([countQuery, dataQuery])

  if (countResult.error) {
    console.error('Error counting faire suppliers:', countResult.error)
    throw new Error('Failed to count suppliers')
  }

  if (dataResult.error) {
    console.error('Error fetching faire suppliers:', dataResult.error)
    throw new Error('Failed to fetch suppliers')
  }

  const total = countResult.count ?? 0
  const totalPages = Math.ceil(total / pageSize)

  return {
    data: (dataResult.data || []).map(transformSupplier),
    total,
    page,
    pageSize,
    totalPages,
  }
}

export async function getFaireSupplierById(id: string): Promise<FaireSupplier | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('faire_suppliers')
    .select(`
      *,
      store:faire_stores(id, name, code)
    `)
    .eq('id', id)
    .is('deleted_at', null)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    console.error('Error fetching faire supplier:', error)
    throw new Error('Failed to fetch supplier')
  }

  return data ? transformSupplier(data) : null
}

export async function createFaireSupplier(input: CreateFaireSupplierInput): Promise<FaireSupplier> {
  const supabase = await createClient()

  // Generate code if not provided
  const code = input.code || `SUP-${Date.now().toString().slice(-6)}`

  const { data, error } = await supabase
    .from('faire_suppliers')
    .insert(camelToSnake({ ...input, code }))
    .select(`
      *,
      store:faire_stores(id, name, code)
    `)
    .single()

  if (error) {
    console.error('Error creating faire supplier:', error)
    throw new Error('Failed to create supplier')
  }

  revalidatePath('/faire-wholesale/suppliers')
  return transformSupplier(data)
}

export async function updateFaireSupplier(id: string, input: UpdateFaireSupplierInput): Promise<FaireSupplier> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('faire_suppliers')
    .update(camelToSnake(input))
    .eq('id', id)
    .select(`
      *,
      store:faire_stores(id, name, code)
    `)
    .single()

  if (error) {
    console.error('Error updating faire supplier:', error)
    throw new Error('Failed to update supplier')
  }

  revalidatePath('/faire-wholesale/suppliers')
  return transformSupplier(data)
}

export async function deleteFaireSupplier(id: string): Promise<void> {
  const supabase = await createClient()

  const { error } = await supabase
    .from('faire_suppliers')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id)

  if (error) {
    console.error('Error deleting faire supplier:', error)
    throw new Error('Failed to delete supplier')
  }

  revalidatePath('/faire-wholesale/suppliers')
}

// ============================================================================
// PRODUCTS
// ============================================================================

export async function getFaireProducts(
  filters?: FaireProductFilters,
  pagination?: PaginationParams
): Promise<PaginatedResponse<FaireProduct>> {
  const supabase = await createClient()
  const page = pagination?.page ?? 1
  const pageSize = pagination?.pageSize ?? DEFAULT_PAGE_SIZE
  const sortBy = pagination?.sortBy ?? 'name'
  const sortOrder = pagination?.sortOrder ?? 'asc'
  const offset = (page - 1) * pageSize

  // Map frontend sort columns to database columns
  const sortColumnMap: Record<string, string> = {
    name: 'name',
    store: 'store_id',
    supplier: 'supplier_id',
    saleState: 'sale_state',
    stock: 'id', // We'll sort by name as fallback since inventory is computed
  }
  const dbSortColumn = sortColumnMap[sortBy] || sortBy

  // Build count query
  let countQuery = supabase
    .from('faire_products')
    .select('*', { count: 'exact', head: true })
    .is('deleted_at', null)

  // Build data query
  let dataQuery = supabase
    .from('faire_products')
    .select(`
      *,
      store:faire_stores(id, name, code),
      supplier:faire_suppliers(id, name, code),
      variants:faire_product_variants(*)
    `)
    .is('deleted_at', null)

  // Apply filters to both queries
  if (filters?.storeId) {
    const storeIds = Array.isArray(filters.storeId) ? filters.storeId : [filters.storeId]
    countQuery = countQuery.in('store_id', storeIds)
    dataQuery = dataQuery.in('store_id', storeIds)
  }

  if (filters?.supplierId) {
    countQuery = countQuery.eq('supplier_id', filters.supplierId)
    dataQuery = dataQuery.eq('supplier_id', filters.supplierId)
  }

  if (filters?.saleState) {
    const states = Array.isArray(filters.saleState) ? filters.saleState : [filters.saleState]
    countQuery = countQuery.in('sale_state', states)
    dataQuery = dataQuery.in('sale_state', states)
  }

  if (filters?.lifecycleState) {
    const states = Array.isArray(filters.lifecycleState) ? filters.lifecycleState : [filters.lifecycleState]
    countQuery = countQuery.in('lifecycle_state', states)
    dataQuery = dataQuery.in('lifecycle_state', states)
  }

  if (filters?.searchQuery) {
    const searchFilter = `name.ilike.%${filters.searchQuery}%,sku.ilike.%${filters.searchQuery}%,description.ilike.%${filters.searchQuery}%`
    countQuery = countQuery.or(searchFilter)
    dataQuery = dataQuery.or(searchFilter)
  }

  // Add sorting and pagination
  dataQuery = dataQuery
    .order(dbSortColumn, { ascending: sortOrder === 'asc' })
    .range(offset, offset + pageSize - 1)

  // Execute both queries in parallel
  const [countResult, dataResult] = await Promise.all([countQuery, dataQuery])

  if (countResult.error) {
    console.error('Error counting faire products:', countResult.error)
    throw new Error('Failed to count products')
  }

  if (dataResult.error) {
    console.error('Error fetching faire products:', dataResult.error)
    throw new Error('Failed to fetch products')
  }

  const total = countResult.count ?? 0
  const totalPages = Math.ceil(total / pageSize)

  return {
    data: (dataResult.data || []).map(transformProduct),
    total,
    page,
    pageSize,
    totalPages,
  }
}

export async function getFaireProductById(id: string): Promise<FaireProduct | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('faire_products')
    .select(`
      *,
      store:faire_stores(id, name, code),
      supplier:faire_suppliers(id, name, code),
      variants:faire_product_variants(*)
    `)
    .eq('id', id)
    .is('deleted_at', null)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    console.error('Error fetching faire product:', error)
    throw new Error('Failed to fetch product')
  }

  return data ? transformProduct(data) : null
}

export async function createFaireProduct(input: CreateFaireProductInput): Promise<FaireProduct> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('faire_products')
    .insert(camelToSnake(input))
    .select(`
      *,
      store:faire_stores(id, name, code),
      supplier:faire_suppliers(id, name, code)
    `)
    .single()

  if (error) {
    console.error('Error creating faire product:', error)
    throw new Error('Failed to create product')
  }

  revalidatePath('/faire-wholesale/products')
  return transformProduct(data)
}

export async function updateFaireProduct(id: string, input: UpdateFaireProductInput): Promise<FaireProduct> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('faire_products')
    .update(camelToSnake(input))
    .eq('id', id)
    .select(`
      *,
      store:faire_stores(id, name, code),
      supplier:faire_suppliers(id, name, code)
    `)
    .single()

  if (error) {
    console.error('Error updating faire product:', error)
    throw new Error('Failed to update product')
  }

  revalidatePath('/faire-wholesale/products')
  return transformProduct(data)
}

export async function deleteFaireProduct(id: string): Promise<void> {
  const supabase = await createClient()

  const { error } = await supabase
    .from('faire_products')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id)

  if (error) {
    console.error('Error deleting faire product:', error)
    throw new Error('Failed to delete product')
  }

  revalidatePath('/faire-wholesale/products')
}

// ============================================================================
// PRODUCT VARIANTS
// ============================================================================

export async function getFaireProductVariants(productId: string): Promise<FaireProductVariant[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('faire_product_variants')
    .select('*')
    .eq('product_id', productId)
    .is('deleted_at', null)
    .order('name', { ascending: true })

  if (error) {
    console.error('Error fetching faire product variants:', error)
    throw new Error('Failed to fetch variants')
  }

  return (data || []).map(transformVariant)
}

export async function createFaireProductVariant(input: CreateFaireProductVariantInput): Promise<FaireProductVariant> {
  const supabase = await createClient()

  // Get store_id from product
  const { data: product } = await supabase
    .from('faire_products')
    .select('store_id')
    .eq('id', input.productId)
    .single()

  if (!product) throw new Error('Product not found')

  const prices = [{
    wholesalePrice: { amountMinor: input.wholesalePriceCents, currency: 'USD' },
    retailPrice: input.retailPriceCents ? { amountMinor: input.retailPriceCents, currency: 'USD' } : undefined,
  }]

  const { data, error } = await supabase
    .from('faire_product_variants')
    .insert({
      product_id: input.productId,
      store_id: product.store_id,
      name: input.name,
      sku: input.sku,
      gtin: input.gtin,
      prices: prices,
      available_quantity: input.availableQuantity || 0,
      options: input.options,
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating faire product variant:', error)
    throw new Error('Failed to create variant')
  }

  revalidatePath('/faire-wholesale/products')
  return transformVariant(data)
}

export async function updateFaireProductVariant(id: string, input: UpdateFaireProductVariantInput): Promise<FaireProductVariant> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('faire_product_variants')
    .update(camelToSnake(input))
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating faire product variant:', error)
    throw new Error('Failed to update variant')
  }

  revalidatePath('/faire-wholesale/products')
  return transformVariant(data)
}

export async function adjustFaireInventory(input: AdjustFaireInventoryInput): Promise<FaireProductVariant> {
  const supabase = await createClient()

  // Get current variant
  const { data: variant, error: fetchError } = await supabase
    .from('faire_product_variants')
    .select('*')
    .eq('id', input.variantId)
    .single()

  if (fetchError || !variant) {
    throw new Error('Variant not found')
  }

  const newQuantity = input.quantity
  const changeQuantity = newQuantity - (variant.available_quantity || 0)

  // Update variant
  const { data, error } = await supabase
    .from('faire_product_variants')
    .update({ available_quantity: newQuantity })
    .eq('id', input.variantId)
    .select()
    .single()

  if (error) {
    console.error('Error adjusting inventory:', error)
    throw new Error('Failed to adjust inventory')
  }

  // Log the change manually (trigger might not capture reason)
  await supabase.from('faire_inventory_log').insert({
    variant_id: input.variantId,
    store_id: variant.store_id,
    previous_quantity: variant.available_quantity,
    new_quantity: newQuantity,
    change_quantity: changeQuantity,
    change_reason: input.reason,
    reference_id: input.referenceId,
  })

  revalidatePath('/faire-wholesale/products')
  return transformVariant(data)
}

// ============================================================================
// ORDERS
// ============================================================================

export async function getFaireOrders(
  filters?: FaireOrderFilters,
  pagination?: PaginationParams
): Promise<PaginatedResponse<FaireOrder>> {
  const supabase = await createClient()
  const page = pagination?.page ?? 1
  const pageSize = pagination?.pageSize ?? DEFAULT_PAGE_SIZE
  const sortBy = pagination?.sortBy ?? 'created_at'
  const sortOrder = pagination?.sortOrder ?? 'desc'
  const offset = (page - 1) * pageSize

  // Map frontend sort columns to database columns
  const sortColumnMap: Record<string, string> = {
    date: 'created_at',
    displayId: 'display_id',
    store: 'store_id',
    customer: 'retailer_name',
    total: 'total_cents',
    state: 'state',
  }
  const dbSortColumn = sortColumnMap[sortBy] || sortBy

  // Build base query for count
  let countQuery = supabase
    .from('faire_orders')
    .select('*', { count: 'exact', head: true })
    .is('deleted_at', null)

  // Build data query
  let dataQuery = supabase
    .from('faire_orders')
    .select(`
      *,
      store:faire_stores(id, name, code),
      items:faire_order_items(*),
      shipments:faire_shipments(*)
    `)
    .is('deleted_at', null)

  // Apply filters to both queries
  if (filters?.storeId) {
    const storeIds = Array.isArray(filters.storeId) ? filters.storeId : [filters.storeId]
    countQuery = countQuery.in('store_id', storeIds)
    dataQuery = dataQuery.in('store_id', storeIds)
  }

  if (filters?.state) {
    const states = Array.isArray(filters.state) ? filters.state : [filters.state]
    countQuery = countQuery.in('state', states)
    dataQuery = dataQuery.in('state', states)
  }

  if (filters?.retailerId) {
    countQuery = countQuery.eq('retailer_id', filters.retailerId)
    dataQuery = dataQuery.eq('retailer_id', filters.retailerId)
  }

  if (filters?.searchQuery) {
    const searchFilter = `display_id.ilike.%${filters.searchQuery}%,retailer_name.ilike.%${filters.searchQuery}%,purchase_order_number.ilike.%${filters.searchQuery}%`
    countQuery = countQuery.or(searchFilter)
    dataQuery = dataQuery.or(searchFilter)
  }

  if (filters?.dateFrom) {
    countQuery = countQuery.gte('created_at', filters.dateFrom)
    dataQuery = dataQuery.gte('created_at', filters.dateFrom)
  }

  if (filters?.dateTo) {
    countQuery = countQuery.lte('created_at', filters.dateTo)
    dataQuery = dataQuery.lte('created_at', filters.dateTo)
  }

  // Add sorting and pagination
  dataQuery = dataQuery
    .order(dbSortColumn, { ascending: sortOrder === 'asc' })
    .range(offset, offset + pageSize - 1)

  // Execute both queries in parallel
  const [countResult, dataResult] = await Promise.all([countQuery, dataQuery])

  if (countResult.error) {
    console.error('Error counting faire orders:', countResult.error)
    throw new Error('Failed to count orders')
  }

  if (dataResult.error) {
    console.error('Error fetching faire orders:', dataResult.error)
    throw new Error('Failed to fetch orders')
  }

  const total = countResult.count ?? 0
  const totalPages = Math.ceil(total / pageSize)

  return {
    data: (dataResult.data || []).map(transformOrder),
    total,
    page,
    pageSize,
    totalPages,
  }
}

export async function getFaireOrderById(id: string): Promise<FaireOrder | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('faire_orders')
    .select(`
      *,
      store:faire_stores(id, name, code),
      items:faire_order_items(*),
      shipments:faire_shipments(*)
    `)
    .eq('id', id)
    .is('deleted_at', null)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    console.error('Error fetching faire order:', error)
    throw new Error('Failed to fetch order')
  }

  return data ? transformOrder(data) : null
}

export async function updateFaireOrderState(id: string, state: FaireOrderState): Promise<FaireOrder> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('faire_orders')
    .update({ state })
    .eq('id', id)
    .select(`
      *,
      store:faire_stores(id, name, code)
    `)
    .single()

  if (error) {
    console.error('Error updating faire order state:', error)
    throw new Error('Failed to update order state')
  }

  revalidatePath('/faire-wholesale/orders')
  return transformOrder(data)
}

// ============================================================================
// SHIPMENTS
// ============================================================================

export async function getFaireShipments(
  filters?: FaireShipmentFilters,
  pagination?: PaginationParams
): Promise<PaginatedResponse<FaireShipment>> {
  const supabase = await createClient()
  const page = pagination?.page ?? 1
  const pageSize = pagination?.pageSize ?? DEFAULT_PAGE_SIZE
  const sortBy = pagination?.sortBy ?? 'created_at'
  const sortOrder = pagination?.sortOrder ?? 'desc'
  const offset = (page - 1) * pageSize

  // Map frontend sort columns to database columns
  const sortColumnMap: Record<string, string> = {
    date: 'created_at',
    shipDate: 'shipped_at',
    carrier: 'carrier',
    status: 'delivered_at', // Use delivered_at as proxy for status
    order: 'order_id',
  }
  const dbSortColumn = sortColumnMap[sortBy] || sortBy

  // Build count query
  let countQuery = supabase
    .from('faire_shipments')
    .select('*', { count: 'exact', head: true })
    .is('deleted_at', null)

  // Build data query
  let dataQuery = supabase
    .from('faire_shipments')
    .select(`
      *,
      order:faire_orders(id, display_id, retailer_name, state)
    `)
    .is('deleted_at', null)

  // Apply filters to both queries
  if (filters?.storeId) {
    const storeIds = Array.isArray(filters.storeId) ? filters.storeId : [filters.storeId]
    countQuery = countQuery.in('store_id', storeIds)
    dataQuery = dataQuery.in('store_id', storeIds)
  }

  if (filters?.orderId) {
    countQuery = countQuery.eq('order_id', filters.orderId)
    dataQuery = dataQuery.eq('order_id', filters.orderId)
  }

  if (filters?.carrier) {
    countQuery = countQuery.eq('carrier', filters.carrier)
    dataQuery = dataQuery.eq('carrier', filters.carrier)
  }

  if (filters?.hasTracking !== undefined) {
    if (filters.hasTracking) {
      countQuery = countQuery.not('tracking_code', 'is', null)
      dataQuery = dataQuery.not('tracking_code', 'is', null)
    } else {
      countQuery = countQuery.is('tracking_code', null)
      dataQuery = dataQuery.is('tracking_code', null)
    }
  }

  if (filters?.searchQuery) {
    const searchFilter = `tracking_code.ilike.%${filters.searchQuery}%,carrier.ilike.%${filters.searchQuery}%`
    countQuery = countQuery.or(searchFilter)
    dataQuery = dataQuery.or(searchFilter)
  }

  // Add sorting and pagination
  dataQuery = dataQuery
    .order(dbSortColumn, { ascending: sortOrder === 'asc' })
    .range(offset, offset + pageSize - 1)

  // Execute both queries in parallel
  const [countResult, dataResult] = await Promise.all([countQuery, dataQuery])

  if (countResult.error) {
    console.error('Error counting faire shipments:', countResult.error)
    throw new Error('Failed to count shipments')
  }

  if (dataResult.error) {
    console.error('Error fetching faire shipments:', dataResult.error)
    throw new Error('Failed to fetch shipments')
  }

  const total = countResult.count ?? 0
  const totalPages = Math.ceil(total / pageSize)

  return {
    data: (dataResult.data || []).map(transformShipment),
    total,
    page,
    pageSize,
    totalPages,
  }
}

export async function createFaireShipment(input: CreateFaireShipmentInput): Promise<FaireShipment> {
  const supabase = await createClient()

  // Get store_id from order
  const { data: order } = await supabase
    .from('faire_orders')
    .select('store_id')
    .eq('id', input.orderId)
    .single()

  if (!order) throw new Error('Order not found')

  const { data, error } = await supabase
    .from('faire_shipments')
    .insert({
      order_id: input.orderId,
      store_id: order.store_id,
      carrier: input.carrier,
      tracking_code: input.trackingCode,
      tracking_url: input.trackingUrl,
      shipping_type: input.shippingType,
      item_ids: input.itemIds,
      shipped_at: new Date().toISOString(),
    })
    .select(`
      *,
      order:faire_orders(id, display_id, retailer_name)
    `)
    .single()

  if (error) {
    console.error('Error creating faire shipment:', error)
    throw new Error('Failed to create shipment')
  }

  // Update order state to PRE_TRANSIT
  await supabase
    .from('faire_orders')
    .update({ state: 'PRE_TRANSIT' })
    .eq('id', input.orderId)

  revalidatePath('/faire-wholesale/orders')
  revalidatePath('/faire-wholesale/shipments')
  return transformShipment(data)
}

export async function updateFaireShipment(id: string, input: UpdateFaireShipmentInput): Promise<FaireShipment> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('faire_shipments')
    .update(camelToSnake(input))
    .eq('id', id)
    .select(`
      *,
      order:faire_orders(id, display_id, retailer_name)
    `)
    .single()

  if (error) {
    console.error('Error updating faire shipment:', error)
    throw new Error('Failed to update shipment')
  }

  revalidatePath('/faire-wholesale/shipments')
  return transformShipment(data)
}

// ============================================================================
// SYNC LOGS
// ============================================================================

export async function getFaireSyncLogs(storeId?: string, limit = 50): Promise<FaireSyncLog[]> {
  const supabase = await createClient()

  let query = supabase
    .from('faire_sync_logs')
    .select(`
      *,
      store:faire_stores(id, name, code)
    `)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (storeId) {
    query = query.eq('store_id', storeId)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching faire sync logs:', error)
    throw new Error('Failed to fetch sync logs')
  }

  return (data || []).map(transformSyncLog)
}

// ============================================================================
// STATISTICS
// ============================================================================

export async function getFaireStoreStats(storeId: string): Promise<FaireStoreStats> {
  const supabase = await createClient()
  const now = new Date()
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()
  const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay()).toISOString()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

  // Get order counts and revenue
  const { data: orders } = await supabase
    .from('faire_orders')
    .select('total_cents, created_at, state')
    .eq('store_id', storeId)
    .is('deleted_at', null)

  const orderList = orders || []

  const todayOrders = orderList.filter(o => o.created_at >= startOfDay)
  const weekOrders = orderList.filter(o => o.created_at >= startOfWeek)
  const monthOrders = orderList.filter(o => o.created_at >= startOfMonth)

  const pendingShipments = orderList.filter(o =>
    ['NEW', 'PROCESSING'].includes(o.state)
  ).length

  // Get low stock products
  const { count: lowStockCount } = await supabase
    .from('faire_product_variants')
    .select('*', { count: 'exact', head: true })
    .eq('store_id', storeId)
    .gt('available_quantity', 0)
    .lte('available_quantity', 10)
    .is('deleted_at', null)

  const { count: outOfStockCount } = await supabase
    .from('faire_product_variants')
    .select('*', { count: 'exact', head: true })
    .eq('store_id', storeId)
    .lte('available_quantity', 0)
    .is('deleted_at', null)

  // Get last sync
  const { data: syncLog } = await supabase
    .from('faire_sync_logs')
    .select('created_at')
    .eq('store_id', storeId)
    .eq('status', 'completed')
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  return {
    ordersToday: todayOrders.length,
    ordersThisWeek: weekOrders.length,
    ordersThisMonth: monthOrders.length,
    revenueToday: todayOrders.reduce((sum, o) => sum + (o.total_cents || 0), 0),
    revenueThisWeek: weekOrders.reduce((sum, o) => sum + (o.total_cents || 0), 0),
    revenueThisMonth: monthOrders.reduce((sum, o) => sum + (o.total_cents || 0), 0),
    pendingShipments,
    lowStockProducts: lowStockCount || 0,
    outOfStockProducts: outOfStockCount || 0,
    lastSyncAt: syncLog?.created_at,
  }
}

export async function getFaireOrderStats(storeIds?: string[]): Promise<FaireOrderStats> {
  const supabase = await createClient()
  const now = new Date()
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()
  const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay()).toISOString()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

  // Get total count
  let countQuery = supabase
    .from('faire_orders')
    .select('*', { count: 'exact', head: true })
    .is('deleted_at', null)

  if (storeIds && storeIds.length > 0) {
    countQuery = countQuery.in('store_id', storeIds)
  }

  const { count: totalCount } = await countQuery

  // Get all orders for state breakdown and revenue calculation
  // We need to fetch all orders but with pagination to handle > 1000
  let allOrders: any[] = []
  let offset = 0
  const pageSize = 1000
  let hasMore = true

  while (hasMore) {
    let query = supabase
      .from('faire_orders')
      .select('state, total_cents, created_at')
      .is('deleted_at', null)

    if (storeIds && storeIds.length > 0) {
      query = query.in('store_id', storeIds)
    }

    query = query
      .order('created_at', { ascending: false })
      .range(offset, offset + pageSize - 1)

    const { data: pageData, error } = await query

    if (error) {
      console.error('Error fetching orders for stats:', error)
      break
    }

    if (pageData && pageData.length > 0) {
      allOrders.push(...pageData)
      offset += pageSize
      hasMore = pageData.length === pageSize
    } else {
      hasMore = false
    }
  }

  const byState: Record<FaireOrderState, number> = {
    NEW: 0,
    PROCESSING: 0,
    PRE_TRANSIT: 0,
    IN_TRANSIT: 0,
    DELIVERED: 0,
    BACKORDERED: 0,
    CANCELED: 0,
  }

  let totalRevenue = 0
  allOrders.forEach(order => {
    if (order.state && byState.hasOwnProperty(order.state)) {
      byState[order.state as FaireOrderState]++
    }
    totalRevenue += order.total_cents || 0
  })

  const todayOrders = allOrders.filter(o => o.created_at >= startOfDay).length
  const weekOrders = allOrders.filter(o => o.created_at >= startOfWeek).length
  const monthOrders = allOrders.filter(o => o.created_at >= startOfMonth).length
  const pendingShipments = byState.NEW + byState.PROCESSING

  return {
    total: totalCount || 0,
    byState,
    totalRevenueCents: totalRevenue,
    averageOrderValueCents: allOrders.length > 0 ? Math.round(totalRevenue / allOrders.length) : 0,
    pendingShipments,
    todayOrders,
    thisWeekOrders: weekOrders,
    thisMonthOrders: monthOrders,
  }
}

export async function getFaireProductStats(storeIds?: string[]): Promise<FaireProductStats> {
  const supabase = await createClient()

  let query = supabase
    .from('faire_products')
    .select(`
      *,
      variants:faire_product_variants(available_quantity)
    `)
    .is('deleted_at', null)

  if (storeIds && storeIds.length > 0) {
    query = query.in('store_id', storeIds)
  }

  const { data: products } = await query
  const productList = products || []

  const bySaleState: Record<string, number> = {
    FOR_SALE: 0,
    SALES_PAUSED: 0,
    DISCONTINUED: 0,
  }

  const byLifecycleState: Record<string, number> = {
    DRAFT: 0,
    PUBLISHED: 0,
    ARCHIVED: 0,
  }

  let totalVariants = 0
  let lowStockCount = 0
  let outOfStockCount = 0

  productList.forEach(product => {
    bySaleState[product.sale_state]++
    byLifecycleState[product.lifecycle_state]++

    if (product.variants) {
      totalVariants += product.variants.length
      product.variants.forEach((v: { available_quantity: number }) => {
        if (v.available_quantity <= 0) outOfStockCount++
        else if (v.available_quantity <= 10) lowStockCount++
      })
    }
  })

  return {
    total: productList.length,
    bySaleState: bySaleState as Record<string, number>,
    byLifecycleState: byLifecycleState as Record<string, number>,
    totalVariants,
    lowStockCount,
    outOfStockCount,
    totalInventoryValue: 0, // Would need price data to calculate
  }
}

export interface FaireSupplierStats {
  total: number
  activeSuppliers: number
  byStatus: Record<string, number>
  totalProducts: number
}

export async function getFaireSupplierStats(storeId?: string): Promise<FaireSupplierStats> {
  const supabase = await createClient()

  // Build query
  let query = supabase
    .from('faire_suppliers')
    .select('id, status')
    .is('deleted_at', null)

  if (storeId) {
    query = query.eq('store_id', storeId)
  }

  const { data: suppliers } = await query

  const supplierList = suppliers || []

  // Count by status
  const byStatus: Record<string, number> = {
    active: 0,
    inactive: 0,
    pending: 0,
    suspended: 0,
  }

  supplierList.forEach(s => {
    if (s.status && byStatus.hasOwnProperty(s.status)) {
      byStatus[s.status]++
    }
  })

  // Get product count for these suppliers
  const supplierIds = supplierList.map(s => s.id)
  let totalProducts = 0

  if (supplierIds.length > 0) {
    const { count } = await supabase
      .from('faire_products')
      .select('*', { count: 'exact', head: true })
      .in('supplier_id', supplierIds)
      .is('deleted_at', null)

    totalProducts = count || 0
  }

  return {
    total: supplierList.length,
    activeSuppliers: byStatus.active,
    byStatus,
    totalProducts,
  }
}

export async function getFaireOverviewStats(): Promise<FaireOverviewStats> {
  const supabase = await createClient()

  // Get store counts
  const { count: totalStores } = await supabase
    .from('faire_stores')
    .select('*', { count: 'exact', head: true })
    .is('deleted_at', null)

  const { count: activeStores } = await supabase
    .from('faire_stores')
    .select('*', { count: 'exact', head: true })
    .eq('is_active', true)
    .is('deleted_at', null)

  // Get order stats
  const orderStats = await getFaireOrderStats()

  // Get product stats
  const productStats = await getFaireProductStats()

  return {
    totalStores: totalStores || 0,
    activeStores: activeStores || 0,
    totalOrders: orderStats.total,
    totalRevenue: orderStats.totalRevenueCents,
    pendingOrders: orderStats.byState.NEW + orderStats.byState.PROCESSING,
    pendingShipments: orderStats.pendingShipments,
    totalProducts: productStats.total,
    lowStockAlerts: productStats.lowStockCount + productStats.outOfStockCount,
  }
}

// ============================================================================
// RETAILERS
// ============================================================================

export interface FaireRetailerFilters {
  storeId?: string | string[]
  searchQuery?: string
}

export async function getFaireRetailers(
  filters?: FaireRetailerFilters,
  pagination?: PaginationParams
): Promise<PaginatedResponse<FaireRetailer>> {
  const supabase = await createClient()
  const page = pagination?.page ?? 1
  const pageSize = pagination?.pageSize ?? DEFAULT_PAGE_SIZE
  const sortBy = pagination?.sortBy ?? 'lastOrderDate'
  const sortOrder = pagination?.sortOrder ?? 'desc'

  // Get all orders with retailer info - we need to aggregate so fetch all
  let query = supabase
    .from('faire_orders')
    .select('retailer_id, retailer_name, address, store_id, total_cents, created_at, state')
    .is('deleted_at', null)
    .not('retailer_id', 'is', null)
    .not('retailer_name', 'is', null)

  if (filters?.storeId) {
    const storeIds = Array.isArray(filters.storeId) ? filters.storeId : [filters.storeId]
    query = query.in('store_id', storeIds)
  }

  if (filters?.searchQuery) {
    query = query.or(`retailer_name.ilike.%${filters.searchQuery}%,retailer_id.ilike.%${filters.searchQuery}%`)
  }

  const { data: orders, error } = await query

  if (error) {
    console.error('Error fetching faire retailers:', error)
    throw new Error('Failed to fetch retailers')
  }

  // Aggregate retailers from orders
  const retailerMap = new Map<string, {
    retailerId: string
    retailerName: string
    address?: any
    orderCount: number
    totalRevenueCents: number
    firstOrderDate?: string
    lastOrderDate?: string
    stores: Set<string>
    latestState?: string
  }>()

  ;(orders || []).forEach((order: any) => {
    const retailerId = order.retailer_id
    if (!retailerId) return

    if (!retailerMap.has(retailerId)) {
      retailerMap.set(retailerId, {
        retailerId,
        retailerName: order.retailer_name || 'Unknown',
        address: order.address,
        orderCount: 0,
        totalRevenueCents: 0,
        stores: new Set(),
        latestState: order.state,
      })
    }

    const retailer = retailerMap.get(retailerId)!
    retailer.orderCount++
    retailer.totalRevenueCents += order.total_cents || 0
    if (order.store_id) retailer.stores.add(order.store_id)

    if (order.created_at) {
      if (!retailer.firstOrderDate || order.created_at < retailer.firstOrderDate) {
        retailer.firstOrderDate = order.created_at
      }
      if (!retailer.lastOrderDate || order.created_at > retailer.lastOrderDate) {
        retailer.lastOrderDate = order.created_at
        retailer.latestState = order.state
      }
    }
  })

  // Convert to array and transform
  let retailers = Array.from(retailerMap.values())
    .map((r) => ({
      retailerId: r.retailerId,
      retailerName: r.retailerName,
      address: r.address,
      orderCount: r.orderCount,
      totalRevenueCents: r.totalRevenueCents,
      firstOrderDate: r.firstOrderDate,
      lastOrderDate: r.lastOrderDate,
      storeIds: Array.from(r.stores),
      latestOrderState: r.latestState,
    }))

  // Sort based on pagination params
  const sortFunctions: Record<string, (a: FaireRetailer, b: FaireRetailer) => number> = {
    name: (a, b) => a.retailerName.localeCompare(b.retailerName),
    orderCount: (a, b) => a.orderCount - b.orderCount,
    revenue: (a, b) => a.totalRevenueCents - b.totalRevenueCents,
    lastOrderDate: (a, b) => (a.lastOrderDate || '').localeCompare(b.lastOrderDate || ''),
  }

  const sortFn = sortFunctions[sortBy] || sortFunctions.lastOrderDate
  retailers.sort((a, b) => {
    const result = sortFn(a, b)
    return sortOrder === 'desc' ? -result : result
  })

  // Get total count before pagination
  const total = retailers.length
  const totalPages = Math.ceil(total / pageSize)

  // Apply pagination
  const offset = (page - 1) * pageSize
  const paginatedData = retailers.slice(offset, offset + pageSize)

  return {
    data: paginatedData,
    total,
    page,
    pageSize,
    totalPages,
  }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

export async function getUniqueFaireCarriers(): Promise<string[]> {
  const supabase = await createClient()

  const { data } = await supabase
    .from('faire_shipments')
    .select('carrier')
    .not('carrier', 'is', null)
    .is('deleted_at', null)

  const carriers = new Set<string>()
  ;(data || []).forEach(s => {
    if (s.carrier) carriers.add(s.carrier)
  })

  return Array.from(carriers).sort()
}

export async function getUniqueFaireCountries(): Promise<string[]> {
  const supabase = await createClient()

  const { data } = await supabase
    .from('faire_suppliers')
    .select('country')
    .not('country', 'is', null)
    .is('deleted_at', null)

  const countries = new Set<string>()
  ;(data || []).forEach(s => {
    if (s.country) countries.add(s.country)
  })

  return Array.from(countries).sort()
}

// ============================================================================
// FAIRE API SYNC FUNCTIONS
// ============================================================================

const FAIRE_API_BASE_URL = 'https://www.faire.com/external-api/v2'

interface FaireApiCredentials {
  appCredentials: string
  accessToken: string
}

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
    address_type?: string
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
  brand_contacted?: boolean
  payment_initiated_at?: string
  source?: string
  is_free_shipping?: boolean
  free_shipping_reason?: string
  faire_covered_shipping_cost?: {
    amount_minor: number
    currency: string
  }
  is_fulfilled_by_faire?: boolean
  has_pending_retailer_cancellation_request?: boolean
  items?: FaireApiOrderItemResponse[]
  shipments?: FaireApiShipmentResponse[]
  brand_discounts?: unknown[]
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
  tester_price?: {
    amount_minor: number
    currency: string
  }
  customizations?: unknown[]
  discounts?: unknown[]
  created_at?: string
  updated_at?: string
}

interface FaireApiShipmentResponse {
  id: string
  carrier?: string
  tracking_code?: string
  tracking_url?: string
  shipping_type?: string
  maker_cost?: {
    amount_minor: number
    currency: string
  }
  order_item_ids?: string[]
  shipped_at?: string
  delivered_at?: string
  created_at?: string
  updated_at?: string
}

interface FaireApiOrdersListResponse {
  orders: FaireApiOrderResponse[]
  page: number
  limit: number
  cursor?: string
}

// Map Faire API state to our state enum
function mapFaireOrderState(apiState: string): FaireOrderState {
  const stateMap: Record<string, FaireOrderState> = {
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

// Fetch orders from Faire API with cursor-based pagination
async function fetchFaireOrders(
  credentials: FaireApiCredentials,
  cursor?: string,
  limit: number = 50
): Promise<FaireApiOrdersListResponse> {
  const url = new URL(`${FAIRE_API_BASE_URL}/orders`)
  url.searchParams.set('limit', Math.min(limit, 50).toString())
  if (cursor) {
    url.searchParams.set('cursor', cursor)
  }

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

  const data = await response.json()
  return data
}

// Transform Faire API order to our database structure
function transformFaireApiOrder(
  apiOrder: FaireApiOrderResponse,
  storeId: string
): Record<string, unknown> {
  // Build retailer name from customer info
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

// Transform Faire API order item to our database structure
function transformFaireApiOrderItem(
  apiItem: FaireApiOrderItemResponse,
  orderId: string,
  storeId: string
): Record<string, unknown> {
  // Price can come as price_cents or price.amount_minor
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

// Transform Faire API shipment to our database structure
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

export interface SyncFaireOrdersResult {
  success: boolean
  ordersProcessed: number
  orderItemsProcessed: number
  shipmentsProcessed: number
  errors: string[]
  syncLogId?: string
}

// Main sync function
export async function syncFaireOrders(
  storeId: string,
  credentials: FaireApiCredentials
): Promise<SyncFaireOrdersResult> {
  const supabase = await createClient()
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
      console.log(`Fetching page ${pageNum} of orders...${cursor ? ` (cursor: ${cursor.slice(0, 20)}...)` : ''}`)
      const response = await fetchFaireOrders(credentials, cursor, 50)

      if (response.orders && response.orders.length > 0) {
        allOrders.push(...response.orders)
        console.log(`Fetched ${response.orders.length} orders on page ${pageNum}`)
        pageNum++

        // Use cursor for next page if available, otherwise stop
        if (response.cursor) {
          cursor = response.cursor
        } else {
          hasMore = false
        }
      } else {
        hasMore = false
      }

      // Rate limiting - wait 500ms between requests
      await new Promise(resolve => setTimeout(resolve, 500))
    }

    console.log(`Total orders fetched: ${allOrders.length}`)

    // Process orders in batches
    for (const apiOrder of allOrders) {
      try {
        // Transform and upsert order
        const orderData = transformFaireApiOrder(apiOrder, storeId)

        // Check if order exists
        const { data: existingOrder } = await supabase
          .from('faire_orders')
          .select('id')
          .eq('faire_order_id', apiOrder.id)
          .single()

        let orderId: string

        if (existingOrder) {
          // Update existing order
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
          // Insert new order
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

        // Process order items
        if (apiOrder.items && apiOrder.items.length > 0) {
          for (const apiItem of apiOrder.items) {
            try {
              const itemData = transformFaireApiOrderItem(apiItem, orderId, storeId)

              // Check if item exists
              const { data: existingItem } = await supabase
                .from('faire_order_items')
                .select('id')
                .eq('faire_order_item_id', apiItem.id)
                .single()

              if (existingItem) {
                await supabase
                  .from('faire_order_items')
                  .update({
                    ...itemData,
                    updated_at: new Date().toISOString(),
                  })
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

              // Check if shipment exists
              const { data: existingShipment } = await supabase
                .from('faire_shipments')
                .select('id')
                .eq('faire_shipment_id', apiShipment.id)
                .single()

              if (existingShipment) {
                await supabase
                  .from('faire_shipments')
                  .update({
                    ...shipmentData,
                    updated_at: new Date().toISOString(),
                  })
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

      } catch (orderError) {
        errors.push(`Failed to process order ${apiOrder.id}: ${orderError}`)
      }
    }

    // Update sync log
    if (syncLog) {
      await supabase
        .from('faire_sync_logs')
        .update({
          status: errors.length > 0 ? 'completed' : 'completed',
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

    revalidatePath('/faire-wholesale/orders')

    return {
      success: errors.length === 0,
      ordersProcessed,
      orderItemsProcessed,
      shipmentsProcessed,
      errors,
      syncLogId: syncLog?.id,
    }

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    errors.push(errorMessage)

    // Update sync log with failure
    if (syncLog) {
      await supabase
        .from('faire_sync_logs')
        .update({
          status: 'failed',
          completed_at: new Date().toISOString(),
          error_message: errorMessage,
        })
        .eq('id', syncLog.id)
    }

    return {
      success: false,
      ordersProcessed,
      orderItemsProcessed,
      shipmentsProcessed,
      errors,
      syncLogId: syncLog?.id,
    }
  }
}

// Convenience function to sync orders for Toyarina
export async function syncToyarinaOrders(): Promise<SyncFaireOrdersResult> {
  const credentials: FaireApiCredentials = {
    appCredentials: 'YXBhX2pkd2RkOHNnOWg6YTVsc3l0NGUwZnhzNWFpbDE2aGYyazUydHZtcDU2aTl6cnVldzA3dmtmbTh0aGRiYmNleDNqMjdtbGRha2dpN3ZnbjMzeXZ1YjNqYmJvYXpoeDd4YmQ0MXhmMnJlamhzcmt5bw==',
    accessToken: 'oaa_dg8aks8omlj16gprazok5v6uy8gdkgpbiwm4gy13ddjbq7xbtbb4f4xm82jzo07q8atz4gfwb5hdeiarhe66psl1fa7xhsk9',
  }

  // Get Toyarina store ID
  const supabase = await createClient()
  const { data: store } = await supabase
    .from('faire_stores')
    .select('id')
    .eq('code', 'TOYARINA')
    .single()

  if (!store) {
    return {
      success: false,
      ordersProcessed: 0,
      orderItemsProcessed: 0,
      shipmentsProcessed: 0,
      errors: ['Toyarina store not found'],
    }
  }

  return syncFaireOrders(store.id, credentials)
}

// ============================================================================
// FAIRE API - PRODUCTS SYNC
// ============================================================================

// Faire API Product Response
interface FaireApiProductResponse {
  id: string // p_*
  brand_id: string // b_*
  name: string
  short_description?: string
  description?: string
  unit_multiplier?: number
  minimum_order_quantity?: number
  sale_state?: string
  lifecycle_state?: string
  taxonomy_type?: {
    id?: string
    name?: string
  }
  made_in_country?: string
  preorderable?: boolean
  preorder_fulfillment_type?: string
  preorder_details?: {
    order_by_date?: string
    keep_active_past_order_by_date?: boolean
    expected_ship_date?: string
    expected_ship_window_end_date?: string
  }
  images?: Array<{
    id: string
    url: string
    width?: number
    height?: number
    sequence?: number
    tags?: string[]
  }>
  variants?: FaireApiVariantResponse[]
  created_at?: string
  updated_at?: string
}

interface FaireApiVariantResponse {
  id: string // po_*
  product_id: string
  name: string
  sku?: string
  gtin?: string
  sale_state?: string
  lifecycle_state?: string
  prices?: Array<{
    geo_constraint?: {
      country?: string
      country_group?: string
    }
    wholesale_price: {
      amount_minor: number
      currency: string
    }
    retail_price?: {
      amount_minor: number
      currency: string
    }
  }>
  available_quantity?: number
  reserved_quantity?: number
  backordered_until?: string
  options?: Array<{
    name: string
    value: string
  }>
  measurements?: {
    mass_unit?: string
    weight?: number
    distance_unit?: string
    length?: number
    width?: number
    height?: number
  }
  created_at?: string
  updated_at?: string
}

interface FaireApiProductsListResponse {
  products: FaireApiProductResponse[]
  cursor?: string
}

// Fetch products from Faire API with cursor-based pagination
async function fetchFaireProducts(
  credentials: FaireApiCredentials,
  cursor?: string,
  limit: number = 50
): Promise<FaireApiProductsListResponse> {
  const url = new URL(`${FAIRE_API_BASE_URL}/products`)
  url.searchParams.set('limit', Math.min(limit, 50).toString())
  if (cursor) {
    url.searchParams.set('cursor', cursor)
  }

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

  const data = await response.json()
  return data
}

// Transform Faire API product to our database structure
function transformFaireApiProduct(
  apiProduct: FaireApiProductResponse,
  storeId: string
): Record<string, unknown> {
  return {
    faire_product_id: apiProduct.id,
    faire_brand_id: apiProduct.brand_id,
    store_id: storeId,
    name: apiProduct.name,
    short_description: apiProduct.short_description,
    description: apiProduct.description,
    sale_state: mapFaireProductSaleState(apiProduct.sale_state),
    lifecycle_state: mapFaireProductLifecycleState(apiProduct.lifecycle_state),
    unit_multiplier: apiProduct.unit_multiplier || 1,
    minimum_order_quantity: apiProduct.minimum_order_quantity || 1,
    taxonomy_type: apiProduct.taxonomy_type,
    made_in_country: apiProduct.made_in_country,
    preorderable: apiProduct.preorderable || false,
    preorder_details: apiProduct.preorder_details ? {
      orderByDate: apiProduct.preorder_details.order_by_date,
      keepActivePastOrderByDate: apiProduct.preorder_details.keep_active_past_order_by_date,
      expectedShipDate: apiProduct.preorder_details.expected_ship_date,
      expectedShipWindowEndDate: apiProduct.preorder_details.expected_ship_window_end_date,
    } : null,
    images: apiProduct.images?.map(img => img.url) || [],
    last_synced_at: new Date().toISOString(),
  }
}

// Transform Faire API variant to our database structure
function transformFaireApiVariant(
  apiVariant: FaireApiVariantResponse,
  productId: string,
  storeId: string
): Record<string, unknown> {
  return {
    faire_variant_id: apiVariant.id,
    product_id: productId,
    store_id: storeId,
    name: apiVariant.name,
    sku: apiVariant.sku,
    gtin: apiVariant.gtin,
    sale_state: mapFaireProductSaleState(apiVariant.sale_state),
    lifecycle_state: mapFaireProductLifecycleState(apiVariant.lifecycle_state),
    prices: apiVariant.prices?.map(p => ({
      geoConstraint: p.geo_constraint,
      wholesalePrice: {
        amountMinor: p.wholesale_price.amount_minor,
        currency: p.wholesale_price.currency,
      },
      retailPrice: p.retail_price ? {
        amountMinor: p.retail_price.amount_minor,
        currency: p.retail_price.currency,
      } : null,
    })),
    available_quantity: apiVariant.available_quantity || 0,
    reserved_quantity: apiVariant.reserved_quantity || 0,
    backordered_until: apiVariant.backordered_until,
    options: apiVariant.options,
    measurements: apiVariant.measurements ? {
      massUnit: apiVariant.measurements.mass_unit,
      weight: apiVariant.measurements.weight,
      distanceUnit: apiVariant.measurements.distance_unit,
      length: apiVariant.measurements.length,
      width: apiVariant.measurements.width,
      height: apiVariant.measurements.height,
    } : null,
    last_synced_at: new Date().toISOString(),
  }
}

// Map Faire product sale state
function mapFaireProductSaleState(apiState?: string): string {
  if (!apiState) return 'FOR_SALE'
  const stateMap: Record<string, string> = {
    'FOR_SALE': 'FOR_SALE',
    'SALES_PAUSED': 'SALES_PAUSED',
    'DISCONTINUED': 'DISCONTINUED',
  }
  return stateMap[apiState.toUpperCase()] || 'FOR_SALE'
}

// Map Faire product lifecycle state
function mapFaireProductLifecycleState(apiState?: string): string {
  if (!apiState) return 'PUBLISHED'
  const stateMap: Record<string, string> = {
    'DRAFT': 'DRAFT',
    'PUBLISHED': 'PUBLISHED',
    'ARCHIVED': 'ARCHIVED',
  }
  return stateMap[apiState.toUpperCase()] || 'PUBLISHED'
}

// Sync result type for products
export interface SyncFaireProductsResult {
  success: boolean
  productsProcessed: number
  variantsProcessed: number
  errors: string[]
  syncLogId?: string
}

// Main sync function for products
export async function syncFaireProducts(
  storeId: string,
  credentials: FaireApiCredentials
): Promise<SyncFaireProductsResult> {
  const supabase = await createClient()
  const errors: string[] = []
  let productsProcessed = 0
  let variantsProcessed = 0

  // Create sync log
  const { data: syncLog, error: syncLogError } = await supabase
    .from('faire_sync_logs')
    .insert({
      store_id: storeId,
      entity_type: 'products',
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
    const allProducts: FaireApiProductResponse[] = []

    // Fetch all products with cursor-based pagination
    while (hasMore) {
      console.log(`Fetching page ${pageNum} of products...${cursor ? ` (cursor: ${cursor.slice(0, 20)}...)` : ''}`)
      const response = await fetchFaireProducts(credentials, cursor, 50)

      if (response.products && response.products.length > 0) {
        allProducts.push(...response.products)
        console.log(`Fetched ${response.products.length} products on page ${pageNum}`)
        pageNum++

        if (response.cursor) {
          cursor = response.cursor
        } else {
          hasMore = false
        }
      } else {
        hasMore = false
      }

      // Rate limiting - wait 500ms between requests
      await new Promise(resolve => setTimeout(resolve, 500))
    }

    console.log(`Total products fetched: ${allProducts.length}`)

    // Process products
    for (const apiProduct of allProducts) {
      try {
        const productData = transformFaireApiProduct(apiProduct, storeId)

        // Check if product exists
        const { data: existingProduct } = await supabase
          .from('faire_products')
          .select('id')
          .eq('faire_product_id', apiProduct.id)
          .eq('store_id', storeId)
          .single()

        let productId: string

        if (existingProduct) {
          // Update existing product
          const { error: updateError } = await supabase
            .from('faire_products')
            .update({
              ...productData,
              updated_at: new Date().toISOString(),
            })
            .eq('id', existingProduct.id)

          if (updateError) {
            errors.push(`Failed to update product ${apiProduct.id}: ${updateError.message}`)
            continue
          }
          productId = existingProduct.id
        } else {
          // Insert new product
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
        if (apiProduct.variants && apiProduct.variants.length > 0) {
          for (const apiVariant of apiProduct.variants) {
            try {
              const variantData = transformFaireApiVariant(apiVariant, productId, storeId)

              // Check if variant exists
              const { data: existingVariant } = await supabase
                .from('faire_product_variants')
                .select('id')
                .eq('faire_variant_id', apiVariant.id)
                .eq('product_id', productId)
                .single()

              if (existingVariant) {
                // Update existing variant
                const { error: updateError } = await supabase
                  .from('faire_product_variants')
                  .update({
                    ...variantData,
                    updated_at: new Date().toISOString(),
                  })
                  .eq('id', existingVariant.id)

                if (updateError) {
                  errors.push(`Failed to update variant ${apiVariant.id}: ${updateError.message}`)
                  continue
                }
              } else {
                // Insert new variant
                const { error: insertError } = await supabase
                  .from('faire_product_variants')
                  .insert(variantData)

                if (insertError) {
                  errors.push(`Failed to insert variant ${apiVariant.id}: ${insertError.message}`)
                  continue
                }
              }

              variantsProcessed++
            } catch (variantError) {
              errors.push(`Error processing variant ${apiVariant.id}: ${variantError instanceof Error ? variantError.message : 'Unknown error'}`)
            }
          }
        }
      } catch (productError) {
        errors.push(`Error processing product ${apiProduct.id}: ${productError instanceof Error ? productError.message : 'Unknown error'}`)
      }
    }

    // Update sync log
    if (syncLog) {
      await supabase
        .from('faire_sync_logs')
        .update({
          status: errors.length === 0 ? 'completed' : 'completed',
          completed_at: new Date().toISOString(),
          total_records: allProducts.length,
          processed_records: productsProcessed,
          failed_records: errors.length,
          error_message: errors.length > 0 ? errors.slice(0, 5).join('; ') : null,
        })
        .eq('id', syncLog.id)
    }

    // Update store last_sync_at
    await supabase
      .from('faire_stores')
      .update({ last_sync_at: new Date().toISOString() })
      .eq('id', storeId)

    return {
      success: errors.length === 0,
      productsProcessed,
      variantsProcessed,
      errors,
      syncLogId: syncLog?.id,
    }
  } catch (error) {
    // Update sync log with error
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

    return {
      success: false,
      productsProcessed,
      variantsProcessed,
      errors: [error instanceof Error ? error.message : 'Unknown error'],
      syncLogId: syncLog?.id,
    }
  }
}

// Convenience function to sync products for Toyarina
export async function syncToyarinaProducts(): Promise<SyncFaireProductsResult> {
  const supabase = await createClient()

  // Get Toyarina store with credentials
  const { data: store } = await supabase
    .from('faire_stores')
    .select('id, api_token, webhook_secret')
    .eq('code', 'TOYARINA')
    .single()

  if (!store || !store.api_token) {
    return {
      success: false,
      productsProcessed: 0,
      variantsProcessed: 0,
      errors: ['Toyarina store not found or missing API token'],
    }
  }

  const credentials: FaireApiCredentials = {
    appCredentials: store.webhook_secret || '',
    accessToken: store.api_token,
  }

  return syncFaireProducts(store.id, credentials)
}

// ============================================================================
// FAIRE API - LINK ORDER ITEMS TO PRODUCTS
// ============================================================================

// Link order items to products based on faire_product_id and faire_variant_id
export async function linkOrderItemsToProducts(storeId: string): Promise<{
  success: boolean
  itemsLinked: number
  errors: string[]
}> {
  const supabase = await createClient()
  const errors: string[] = []
  let itemsLinked = 0

  try {
    // Get all order items that have faire_product_id but no product_id link
    const { data: orderItems, error: fetchError } = await supabase
      .from('faire_order_items')
      .select('id, faire_product_id, faire_variant_id')
      .eq('store_id', storeId)
      .is('product_id', null)
      .not('faire_product_id', 'is', null)

    if (fetchError) {
      return { success: false, itemsLinked: 0, errors: [fetchError.message] }
    }

    if (!orderItems || orderItems.length === 0) {
      return { success: true, itemsLinked: 0, errors: [] }
    }

    console.log(`Found ${orderItems.length} order items to link`)

    // Get all products for this store
    const { data: products } = await supabase
      .from('faire_products')
      .select('id, faire_product_id')
      .eq('store_id', storeId)

    // Get all variants for this store
    const { data: variants } = await supabase
      .from('faire_product_variants')
      .select('id, faire_variant_id, product_id')
      .eq('store_id', storeId)

    // Create lookup maps
    const productMap = new Map(products?.map(p => [p.faire_product_id, p.id]) || [])
    const variantMap = new Map(variants?.map(v => [v.faire_variant_id, { id: v.id, productId: v.product_id }]) || [])

    // Update order items in batches
    for (const item of orderItems) {
      const productId = productMap.get(item.faire_product_id)
      const variantInfo = item.faire_variant_id ? variantMap.get(item.faire_variant_id) : null

      if (productId || variantInfo) {
        const { error: updateError } = await supabase
          .from('faire_order_items')
          .update({
            product_id: productId || variantInfo?.productId,
            variant_id: variantInfo?.id,
            updated_at: new Date().toISOString(),
          })
          .eq('id', item.id)

        if (updateError) {
          errors.push(`Failed to link item ${item.id}: ${updateError.message}`)
        } else {
          itemsLinked++
        }
      }
    }

    return {
      success: errors.length === 0,
      itemsLinked,
      errors,
    }
  } catch (error) {
    return {
      success: false,
      itemsLinked,
      errors: [error instanceof Error ? error.message : 'Unknown error'],
    }
  }
}

// Convenience function to link Toyarina order items
export async function linkToyarinaOrderItems(): Promise<{
  success: boolean
  itemsLinked: number
  errors: string[]
}> {
  const supabase = await createClient()

  const { data: store } = await supabase
    .from('faire_stores')
    .select('id')
    .eq('code', 'TOYARINA')
    .single()

  if (!store) {
    return { success: false, itemsLinked: 0, errors: ['Toyarina store not found'] }
  }

  return linkOrderItemsToProducts(store.id)
}

// ============================================================================
// FAIRE API - COMPREHENSIVE SYNC
// ============================================================================

export interface ComprehensiveSyncResult {
  success: boolean
  orders: SyncFaireOrdersResult
  products: SyncFaireProductsResult
  relationshipsLinked: number
  totalErrors: string[]
}

// Sync everything for a store
export async function syncAllFaireData(storeId: string): Promise<ComprehensiveSyncResult> {
  const supabase = await createClient()
  const totalErrors: string[] = []

  // Get store credentials
  const { data: store } = await supabase
    .from('faire_stores')
    .select('id, api_token, webhook_secret')
    .eq('id', storeId)
    .single()

  if (!store || !store.api_token) {
    return {
      success: false,
      orders: { success: false, ordersProcessed: 0, orderItemsProcessed: 0, shipmentsProcessed: 0, errors: ['Store not found or missing credentials'] },
      products: { success: false, productsProcessed: 0, variantsProcessed: 0, errors: ['Store not found or missing credentials'] },
      relationshipsLinked: 0,
      totalErrors: ['Store not found or missing API credentials'],
    }
  }

  const credentials: FaireApiCredentials = {
    appCredentials: store.webhook_secret || '',
    accessToken: store.api_token,
  }

  // Sync orders
  console.log('Starting orders sync...')
  const ordersResult = await syncFaireOrders(storeId, credentials)
  totalErrors.push(...ordersResult.errors)

  // Sync products
  console.log('Starting products sync...')
  const productsResult = await syncFaireProducts(storeId, credentials)
  totalErrors.push(...productsResult.errors)

  // Link order items to products
  console.log('Linking order items to products...')
  const linkResult = await linkOrderItemsToProducts(storeId)
  totalErrors.push(...linkResult.errors)

  return {
    success: totalErrors.length === 0,
    orders: ordersResult,
    products: productsResult,
    relationshipsLinked: linkResult.itemsLinked,
    totalErrors,
  }
}

// Convenience function to sync everything for Toyarina
export async function syncAllToyarinaData(): Promise<ComprehensiveSyncResult> {
  const supabase = await createClient()

  const { data: store } = await supabase
    .from('faire_stores')
    .select('id')
    .eq('code', 'TOYARINA')
    .single()

  if (!store) {
    return {
      success: false,
      orders: { success: false, ordersProcessed: 0, orderItemsProcessed: 0, shipmentsProcessed: 0, errors: ['Toyarina store not found'] },
      products: { success: false, productsProcessed: 0, variantsProcessed: 0, errors: ['Toyarina store not found'] },
      relationshipsLinked: 0,
      totalErrors: ['Toyarina store not found'],
    }
  }

  return syncAllFaireData(store.id)
}
