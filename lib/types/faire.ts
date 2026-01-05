/**
 * Faire Wholesale Management Types
 * For USA Vertical - E-commerce Back-office
 */

// ============================================================================
// ENUMS
// ============================================================================

export type FaireOrderState =
  | 'NEW'
  | 'PROCESSING'
  | 'PRE_TRANSIT'
  | 'IN_TRANSIT'
  | 'DELIVERED'
  | 'BACKORDERED'
  | 'CANCELED'

export type FaireOrderItemState =
  | 'NEW'
  | 'CONFIRMED'
  | 'BACKORDERED'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELED'

export type FaireProductSaleState = 'FOR_SALE' | 'SALES_PAUSED' | 'DISCONTINUED'

export type FaireProductLifecycleState = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'

export type FaireSupplierStatus = 'active' | 'inactive' | 'pending' | 'suspended'

export type FaireSyncStatus = 'pending' | 'in_progress' | 'completed' | 'failed'

export type FaireSyncEntityType = 'orders' | 'products' | 'inventory' | 'shipments'

// Enum-like objects for runtime usage
export const FaireOrderState = {
  NEW: 'NEW' as const,
  PROCESSING: 'PROCESSING' as const,
  PRE_TRANSIT: 'PRE_TRANSIT' as const,
  IN_TRANSIT: 'IN_TRANSIT' as const,
  DELIVERED: 'DELIVERED' as const,
  BACKORDERED: 'BACKORDERED' as const,
  CANCELED: 'CANCELED' as const,
}

export const FaireOrderItemState = {
  NEW: 'NEW' as const,
  CONFIRMED: 'CONFIRMED' as const,
  BACKORDERED: 'BACKORDERED' as const,
  SHIPPED: 'SHIPPED' as const,
  DELIVERED: 'DELIVERED' as const,
  CANCELED: 'CANCELED' as const,
}

export const FaireProductSaleState = {
  FOR_SALE: 'FOR_SALE' as const,
  SALES_PAUSED: 'SALES_PAUSED' as const,
  DISCONTINUED: 'DISCONTINUED' as const,
}

export const FaireProductLifecycleState = {
  DRAFT: 'DRAFT' as const,
  PUBLISHED: 'PUBLISHED' as const,
  ARCHIVED: 'ARCHIVED' as const,
}

export const FaireSupplierStatus = {
  ACTIVE: 'active' as const,
  INACTIVE: 'inactive' as const,
  PENDING: 'pending' as const,
  SUSPENDED: 'suspended' as const,
}

// ============================================================================
// STATUS CONFIGS (for UI badges)
// ============================================================================

export const FAIRE_ORDER_STATE_CONFIG: Record<
  FaireOrderState,
  { label: string; color: string; bgColor: string; order: number }
> = {
  NEW: { label: 'New', color: 'text-blue-700', bgColor: 'bg-blue-100', order: 1 },
  PROCESSING: { label: 'Processing', color: 'text-purple-700', bgColor: 'bg-purple-100', order: 2 },
  PRE_TRANSIT: { label: 'Pre-Transit', color: 'text-orange-700', bgColor: 'bg-orange-100', order: 3 },
  IN_TRANSIT: { label: 'In Transit', color: 'text-cyan-700', bgColor: 'bg-cyan-100', order: 4 },
  DELIVERED: { label: 'Delivered', color: 'text-green-700', bgColor: 'bg-green-100', order: 5 },
  BACKORDERED: { label: 'Backordered', color: 'text-yellow-700', bgColor: 'bg-yellow-100', order: 6 },
  CANCELED: { label: 'Canceled', color: 'text-red-700', bgColor: 'bg-red-100', order: 7 },
}

export const FAIRE_ORDER_ITEM_STATE_CONFIG: Record<
  FaireOrderItemState,
  { label: string; color: string; bgColor: string }
> = {
  NEW: { label: 'New', color: 'text-blue-700', bgColor: 'bg-blue-100' },
  CONFIRMED: { label: 'Confirmed', color: 'text-purple-700', bgColor: 'bg-purple-100' },
  BACKORDERED: { label: 'Backordered', color: 'text-yellow-700', bgColor: 'bg-yellow-100' },
  SHIPPED: { label: 'Shipped', color: 'text-cyan-700', bgColor: 'bg-cyan-100' },
  DELIVERED: { label: 'Delivered', color: 'text-green-700', bgColor: 'bg-green-100' },
  CANCELED: { label: 'Canceled', color: 'text-red-700', bgColor: 'bg-red-100' },
}

export const FAIRE_PRODUCT_SALE_STATE_CONFIG: Record<
  FaireProductSaleState,
  { label: string; color: string; bgColor: string }
> = {
  FOR_SALE: { label: 'For Sale', color: 'text-green-700', bgColor: 'bg-green-100' },
  SALES_PAUSED: { label: 'Paused', color: 'text-yellow-700', bgColor: 'bg-yellow-100' },
  DISCONTINUED: { label: 'Discontinued', color: 'text-red-700', bgColor: 'bg-red-100' },
}

export const FAIRE_PRODUCT_LIFECYCLE_STATE_CONFIG: Record<
  FaireProductLifecycleState,
  { label: string; color: string; bgColor: string }
> = {
  DRAFT: { label: 'Draft', color: 'text-gray-700', bgColor: 'bg-gray-100' },
  PUBLISHED: { label: 'Published', color: 'text-green-700', bgColor: 'bg-green-100' },
  ARCHIVED: { label: 'Archived', color: 'text-orange-700', bgColor: 'bg-orange-100' },
}

export const FAIRE_SUPPLIER_STATUS_CONFIG: Record<
  FaireSupplierStatus,
  { label: string; color: string; bgColor: string }
> = {
  active: { label: 'Active', color: 'text-green-700', bgColor: 'bg-green-100' },
  inactive: { label: 'Inactive', color: 'text-gray-700', bgColor: 'bg-gray-100' },
  pending: { label: 'Pending', color: 'text-yellow-700', bgColor: 'bg-yellow-100' },
  suspended: { label: 'Suspended', color: 'text-red-700', bgColor: 'bg-red-100' },
}

export const FAIRE_SYNC_STATUS_CONFIG: Record<
  FaireSyncStatus,
  { label: string; color: string; bgColor: string }
> = {
  pending: { label: 'Pending', color: 'text-gray-700', bgColor: 'bg-gray-100' },
  in_progress: { label: 'In Progress', color: 'text-blue-700', bgColor: 'bg-blue-100' },
  completed: { label: 'Completed', color: 'text-green-700', bgColor: 'bg-green-100' },
  failed: { label: 'Failed', color: 'text-red-700', bgColor: 'bg-red-100' },
}

// ============================================================================
// HELPER INTERFACES
// ============================================================================

// Price object (from Faire API)
export interface FairePrice {
  amountMinor: number // cents
  currency: string
}

// Address object
export interface FaireAddress {
  name?: string
  address1?: string
  address2?: string
  city?: string
  state?: string
  stateCode?: string
  postalCode?: string
  country?: string
  countryCode?: string
  phoneNumber?: string
  companyName?: string
}

// Payout costs from Faire
export interface FairePayoutCosts {
  payoutFeeCents?: number
  payoutFeeBps?: number
  commissionCents?: number
  commissionBps?: number
  subtotalAfterBrandDiscounts?: FairePrice
  totalBrandDiscounts?: FairePrice
}

// Brand discount
export interface FaireBrandDiscount {
  id: string
  code: string
  includesFreeShipping: boolean
  discountPercentage?: number
  discountAmount?: FairePrice
  discountType: 'PERCENTAGE' | 'FLAT_AMOUNT'
}

// Product variant pricing (multi-geo support)
export interface FaireVariantPrice {
  geoConstraint?: {
    country?: string
    countryGroup?: string
  }
  wholesalePrice: FairePrice
  retailPrice?: FairePrice
}

// Variant options (Size, Color, etc.)
export interface FaireVariantOption {
  name: string
  value: string
}

// Measurements
export interface FaireMeasurements {
  massUnit?: 'GRAM' | 'KILOGRAM' | 'OUNCE' | 'POUND'
  weight?: number
  distanceUnit?: 'CENTIMETER' | 'INCH'
  length?: number
  width?: number
  height?: number
}

// ============================================================================
// MAIN ENTITY INTERFACES
// ============================================================================

// Store (Faire Account)
export interface FaireStore {
  id: string
  faireBrandId?: string
  name: string
  code: string
  description?: string
  apiToken?: string
  apiTokenEncrypted: boolean
  webhookSecret?: string
  isActive: boolean
  autoSyncEnabled: boolean
  syncIntervalMinutes: number
  lastSyncAt?: string
  contactEmail?: string
  contactPhone?: string
  timezone: string
  currency: string
  createdAt: string
  updatedAt: string
  createdBy?: string
  updatedBy?: string
  deletedAt?: string
}

// Supplier Credentials
export interface FaireSupplierCredentials {
  email?: string
  password?: string
  domain?: string
  [key: string]: string | undefined
}

// Supplier
export interface FaireSupplier {
  id: string
  storeId: string
  store?: FaireStore
  name: string
  code: string
  status: FaireSupplierStatus
  contactName?: string
  email?: string
  phone?: string
  website?: string
  addressLine1?: string
  addressLine2?: string
  city?: string
  state?: string
  postalCode?: string
  country: string
  paymentTerms?: string
  leadTimeDays?: number
  minimumOrderAmount?: number
  notes?: string
  credentials?: FaireSupplierCredentials
  createdAt: string
  updatedAt: string
  createdBy?: string
  updatedBy?: string
  deletedAt?: string
  // Computed
  productCount?: number
}

// Product
export interface FaireProduct {
  id: string
  faireProductId?: string
  faireBrandId?: string
  storeId: string
  store?: FaireStore
  supplierId?: string
  supplier?: FaireSupplier
  name: string
  shortDescription?: string
  description?: string
  sku?: string
  saleState: FaireProductSaleState
  lifecycleState: FaireProductLifecycleState
  unitMultiplier: number
  minimumOrderQuantity: number
  taxonomyType?: Record<string, unknown>
  madeInCountry?: string
  preorderable: boolean
  preorderDetails?: {
    orderByDate?: string
    keepActivePastOrderByDate?: boolean
    expectedShipDate?: string
    expectedShipWindowEndDate?: string
  }
  images?: string[]
  metadata?: Record<string, unknown>
  lastSyncedAt?: string
  syncHash?: string
  createdAt: string
  updatedAt: string
  createdBy?: string
  updatedBy?: string
  deletedAt?: string
  // Related
  variants?: FaireProductVariant[]
  // Computed
  variantCount?: number
  totalInventory?: number
}

// Product Variant
export interface FaireProductVariant {
  id: string
  faireVariantId?: string
  productId: string
  storeId: string
  name: string
  sku?: string
  gtin?: string
  saleState: FaireProductSaleState
  lifecycleState: FaireProductLifecycleState
  prices?: FaireVariantPrice[]
  availableQuantity: number
  reservedQuantity: number
  backorderedUntil?: string
  options?: FaireVariantOption[]
  measurements?: FaireMeasurements
  lastSyncedAt?: string
  createdAt: string
  updatedAt: string
  deletedAt?: string
  // Computed
  wholesalePrice?: number // Primary price in cents
  retailPrice?: number // Primary retail price in cents
}

// Order
export interface FaireOrder {
  id: string
  faireOrderId: string
  displayId?: string
  storeId: string
  store?: FaireStore
  state: FaireOrderState
  retailerId?: string
  retailerName?: string
  address?: FaireAddress
  isFreeShipping: boolean
  freeShippingReason?: string
  faireCoveredShippingCostCents?: number
  shipAfter?: string
  subtotalCents?: number
  shippingCents?: number
  taxCents?: number
  totalCents?: number
  payoutCosts?: FairePayoutCosts
  estimatedPayoutAt?: string
  purchaseOrderNumber?: string
  notes?: string
  source?: string
  paymentInitiatedAt?: string
  salesRepName?: string
  brandDiscounts?: FaireBrandDiscount[]
  hasPendingCancellationRequest: boolean
  originalOrderId?: string
  lastSyncedAt?: string
  syncHash?: string
  faireCreatedAt?: string
  faireUpdatedAt?: string
  createdAt: string
  updatedAt: string
  createdBy?: string
  updatedBy?: string
  deletedAt?: string
  // Related
  items?: FaireOrderItem[]
  shipments?: FaireShipment[]
  // Computed
  itemCount?: number
  shipmentCount?: number
}

// Order Item
export interface FaireOrderItem {
  id: string
  faireOrderItemId?: string
  orderId: string
  storeId: string
  productId?: string
  variantId?: string
  faireProductId?: string
  faireVariantId?: string
  productName: string
  variantName?: string
  sku?: string
  quantity: number
  state: FaireOrderItemState
  priceCents: number
  currency: string
  includesTester: boolean
  testerPriceCents?: number
  discounts?: FaireBrandDiscount[]
  faireCreatedAt?: string
  faireUpdatedAt?: string
  createdAt: string
  updatedAt: string
  deletedAt?: string
  // Related
  product?: FaireProduct
  variant?: FaireProductVariant
}

// Shipment
export interface FaireShipment {
  id: string
  faireShipmentId?: string
  orderId: string
  storeId: string
  carrier?: string
  trackingCode?: string
  trackingUrl?: string
  shippingType?: string
  makerCostCents?: number
  itemIds?: string[]
  faireCreatedAt?: string
  faireUpdatedAt?: string
  shippedAt?: string
  deliveredAt?: string
  createdAt: string
  updatedAt: string
  deletedAt?: string
  // Related
  order?: FaireOrder
}

// Inventory Log Entry
export interface FaireInventoryLogEntry {
  id: string
  variantId: string
  storeId: string
  previousQuantity?: number
  newQuantity?: number
  changeQuantity?: number
  changeReason?: string
  referenceId?: string
  performedBy?: string
  createdAt: string
  // Related
  variant?: FaireProductVariant
}

// Sync Log
export interface FaireSyncLog {
  id: string
  storeId: string
  entityType: FaireSyncEntityType
  status: FaireSyncStatus
  totalRecords?: number
  processedRecords?: number
  failedRecords?: number
  startedAt?: string
  completedAt?: string
  errorMessage?: string
  errorDetails?: Record<string, unknown>
  metadata?: Record<string, unknown>
  createdAt: string
  // Related
  store?: FaireStore
}

// ============================================================================
// INPUT TYPES (for forms)
// ============================================================================

export interface CreateFaireStoreInput {
  name: string
  code?: string
  description?: string
  faireBrandId?: string
  apiToken?: string
  contactEmail?: string
  contactPhone?: string
  timezone?: string
  currency?: string
  isActive?: boolean
  autoSyncEnabled?: boolean
}

export interface UpdateFaireStoreInput {
  name?: string
  code?: string
  description?: string
  faireBrandId?: string
  apiToken?: string
  isActive?: boolean
  autoSyncEnabled?: boolean
  syncIntervalMinutes?: number
  contactEmail?: string
  contactPhone?: string
  timezone?: string
  currency?: string
}

export interface CreateFaireSupplierInput {
  storeId: string
  name: string
  code?: string
  status?: FaireSupplierStatus
  contactName?: string
  email?: string
  phone?: string
  website?: string
  addressLine1?: string
  addressLine2?: string
  city?: string
  state?: string
  postalCode?: string
  country?: string
  paymentTerms?: string
  leadTimeDays?: number
  minimumOrderAmount?: number
  notes?: string
}

export interface UpdateFaireSupplierInput {
  name?: string
  code?: string
  status?: FaireSupplierStatus
  contactName?: string
  email?: string
  phone?: string
  website?: string
  addressLine1?: string
  addressLine2?: string
  city?: string
  state?: string
  postalCode?: string
  country?: string
  paymentTerms?: string
  leadTimeDays?: number
  minimumOrderAmount?: number
  notes?: string
}

export interface CreateFaireProductInput {
  storeId: string
  supplierId?: string
  name: string
  shortDescription?: string
  description?: string
  sku?: string
  saleState?: FaireProductSaleState
  lifecycleState?: FaireProductLifecycleState
  unitMultiplier?: number
  minimumOrderQuantity?: number
  madeInCountry?: string
  images?: string[]
}

export interface UpdateFaireProductInput {
  supplierId?: string
  name?: string
  shortDescription?: string
  description?: string
  sku?: string
  saleState?: FaireProductSaleState
  lifecycleState?: FaireProductLifecycleState
  unitMultiplier?: number
  minimumOrderQuantity?: number
  madeInCountry?: string
  preorderable?: boolean
  images?: string[]
}

export interface CreateFaireProductVariantInput {
  productId: string
  name: string
  sku?: string
  gtin?: string
  wholesalePriceCents: number
  retailPriceCents?: number
  availableQuantity?: number
  options?: FaireVariantOption[]
}

export interface UpdateFaireProductVariantInput {
  name?: string
  sku?: string
  gtin?: string
  saleState?: FaireProductSaleState
  lifecycleState?: FaireProductLifecycleState
  availableQuantity?: number
  backorderedUntil?: string
}

export interface CreateFaireShipmentInput {
  orderId: string
  carrier: string
  trackingCode: string
  trackingUrl?: string
  shippingType?: string
  itemIds?: string[]
}

export interface UpdateFaireShipmentInput {
  carrier?: string
  trackingCode?: string
  trackingUrl?: string
  shippedAt?: string
  deliveredAt?: string
}

export interface UpdateFaireOrderStateInput {
  state: FaireOrderState
}

export interface AdjustFaireInventoryInput {
  variantId: string
  quantity: number
  reason: string
  referenceId?: string
}

// ============================================================================
// PAGINATION TYPES
// ============================================================================

export interface PaginationParams {
  page: number
  pageSize: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

// Default pagination values
export const DEFAULT_PAGE_SIZE = 25
export const PAGE_SIZE_OPTIONS = [10, 25, 50, 100]

// ============================================================================
// FILTER TYPES
// ============================================================================

export interface FaireStoreFilters {
  isActive?: boolean
  searchQuery?: string
}

export interface FaireSupplierFilters {
  storeId?: string | string[]
  status?: FaireSupplierStatus | FaireSupplierStatus[]
  searchQuery?: string
}

export interface FaireProductFilters {
  storeId?: string | string[]
  supplierId?: string
  saleState?: FaireProductSaleState | FaireProductSaleState[]
  lifecycleState?: FaireProductLifecycleState | FaireProductLifecycleState[]
  searchQuery?: string
  hasLowStock?: boolean
  lowStockThreshold?: number
}

export interface FaireOrderFilters {
  storeId?: string | string[]
  state?: FaireOrderState | FaireOrderState[]
  retailerId?: string
  searchQuery?: string
  dateFrom?: string
  dateTo?: string
}

export interface FaireShipmentFilters {
  storeId?: string | string[]
  orderId?: string
  carrier?: string
  hasTracking?: boolean
  searchQuery?: string
}

// ============================================================================
// STATS & AGGREGATES
// ============================================================================

export interface FaireStoreStats {
  ordersToday: number
  ordersThisWeek: number
  ordersThisMonth: number
  revenueToday: number
  revenueThisWeek: number
  revenueThisMonth: number
  pendingShipments: number
  lowStockProducts: number
  outOfStockProducts: number
  lastSyncAt?: string
}

export interface FaireOrderStats {
  total: number
  byState: Record<FaireOrderState, number>
  totalRevenueCents: number
  averageOrderValueCents: number
  pendingShipments: number
  todayOrders: number
  thisWeekOrders: number
  thisMonthOrders: number
}

export interface FaireProductStats {
  total: number
  bySaleState: Record<FaireProductSaleState, number>
  byLifecycleState: Record<FaireProductLifecycleState, number>
  totalVariants: number
  lowStockCount: number
  outOfStockCount: number
  totalInventoryValue: number
}

export interface FaireSupplierStats {
  total: number
  byStatus: Record<FaireSupplierStatus, number>
  activeSuppliers: number
  totalProducts: number
}

export interface FaireOverviewStats {
  totalStores: number
  activeStores: number
  totalOrders: number
  totalRevenue: number
  pendingOrders: number
  pendingShipments: number
  totalProducts: number
  lowStockAlerts: number
}

export interface FaireRetailer {
  retailerId: string
  retailerName: string
  address?: FaireAddress
  orderCount: number
  totalRevenueCents: number
  firstOrderDate?: string
  lastOrderDate?: string
  storeIds: string[]
  latestOrderState?: string
}

// ============================================================================
// UNIFIED VIEW TYPES
// ============================================================================

export interface FaireUnifiedOrderView {
  order: FaireOrder
  storeName: string
  storeCode: string
  itemCount: number
  shipmentCount: number
}

export interface FaireUnifiedProductView {
  product: FaireProduct
  storeName: string
  storeCode: string
  totalInventory: number
  variantCount: number
  supplierName?: string
}

export interface FaireUnifiedShipmentView {
  shipment: FaireShipment
  storeName: string
  storeCode: string
  orderDisplayId?: string
  retailerName?: string
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Format cents to currency string
 */
export function formatCents(cents: number | undefined, currency = 'USD'): string {
  if (cents === undefined || cents === null) return '-'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(cents / 100)
}

/**
 * Get total value of order in cents
 */
export function getOrderTotalCents(order: FaireOrder): number {
  return order.totalCents || 0
}

/**
 * Get primary wholesale price from variant
 */
export function getVariantWholesalePrice(variant: FaireProductVariant): number | undefined {
  if (!variant.prices || variant.prices.length === 0) return undefined
  // Get USD price or first available
  const usdPrice = variant.prices.find(p => p.wholesalePrice.currency === 'USD')
  return (usdPrice || variant.prices[0])?.wholesalePrice.amountMinor
}

/**
 * Check if variant is low stock
 */
export function isLowStock(variant: FaireProductVariant, threshold = 10): boolean {
  return variant.availableQuantity > 0 && variant.availableQuantity <= threshold
}

/**
 * Check if variant is out of stock
 */
export function isOutOfStock(variant: FaireProductVariant): boolean {
  return variant.availableQuantity <= 0
}

/**
 * Get order state badge variant
 */
export function getOrderStateBadgeVariant(
  state: FaireOrderState
): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (state) {
    case 'DELIVERED':
      return 'default'
    case 'CANCELED':
      return 'destructive'
    case 'NEW':
    case 'PROCESSING':
      return 'secondary'
    default:
      return 'outline'
  }
}
