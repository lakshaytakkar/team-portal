-- ============================================================================
-- Faire Wholesale Management System for USA Vertical
-- Complete schema for managing 6 Faire seller accounts
-- ============================================================================

-- ============================================================================
-- ENUMS
-- ============================================================================

-- Order States (from Faire API)
DO $$ BEGIN
  CREATE TYPE faire_order_state AS ENUM (
    'NEW',
    'PROCESSING',
    'PRE_TRANSIT',
    'IN_TRANSIT',
    'DELIVERED',
    'BACKORDERED',
    'CANCELED'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Order Item States
DO $$ BEGIN
  CREATE TYPE faire_order_item_state AS ENUM (
    'NEW',
    'CONFIRMED',
    'BACKORDERED',
    'SHIPPED',
    'DELIVERED',
    'CANCELED'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Product Sale State
DO $$ BEGIN
  CREATE TYPE faire_product_sale_state AS ENUM (
    'FOR_SALE',
    'SALES_PAUSED',
    'DISCONTINUED'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Product Lifecycle State
DO $$ BEGIN
  CREATE TYPE faire_product_lifecycle_state AS ENUM (
    'DRAFT',
    'PUBLISHED',
    'ARCHIVED'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Supplier Status
DO $$ BEGIN
  CREATE TYPE faire_supplier_status AS ENUM (
    'active',
    'inactive',
    'pending',
    'suspended'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Sync Status (for API sync logs)
DO $$ BEGIN
  CREATE TYPE faire_sync_status AS ENUM (
    'pending',
    'in_progress',
    'completed',
    'failed'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Sync Entity Type
DO $$ BEGIN
  CREATE TYPE faire_sync_entity_type AS ENUM (
    'orders',
    'products',
    'inventory',
    'shipments'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- ============================================================================
-- TABLES
-- ============================================================================

-- Faire Stores (6 Faire seller accounts)
CREATE TABLE IF NOT EXISTS faire_stores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Faire API identifiers
  faire_brand_id TEXT UNIQUE,           -- b_* from Faire API

  -- Store Info
  name TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL,            -- e.g., FAIRE-US-01
  description TEXT,

  -- API Credentials (should be encrypted in production)
  api_token TEXT,
  api_token_encrypted BOOLEAN DEFAULT false,
  webhook_secret TEXT,

  -- Settings
  is_active BOOLEAN DEFAULT true,
  auto_sync_enabled BOOLEAN DEFAULT true,
  sync_interval_minutes INTEGER DEFAULT 15,
  last_sync_at TIMESTAMPTZ,

  -- Contact
  contact_email TEXT,
  contact_phone TEXT,

  -- Metadata
  timezone TEXT DEFAULT 'America/New_York',
  currency TEXT DEFAULT 'USD',

  -- Audit
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES profiles(id),
  updated_by UUID REFERENCES profiles(id),
  deleted_at TIMESTAMPTZ
);

-- Faire Suppliers
CREATE TABLE IF NOT EXISTS faire_suppliers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Relationship
  store_id UUID NOT NULL REFERENCES faire_stores(id),

  -- Supplier Info
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  status faire_supplier_status DEFAULT 'active',

  -- Contact
  contact_name TEXT,
  email TEXT,
  phone TEXT,
  website TEXT,

  -- Address
  address_line1 TEXT,
  address_line2 TEXT,
  city TEXT,
  state TEXT,
  postal_code TEXT,
  country TEXT DEFAULT 'US',

  -- Payment Terms
  payment_terms TEXT,
  lead_time_days INTEGER,
  minimum_order_amount DECIMAL(12, 2),

  -- Notes
  notes TEXT,

  -- Audit
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES profiles(id),
  updated_by UUID REFERENCES profiles(id),
  deleted_at TIMESTAMPTZ,

  UNIQUE(store_id, code)
);

-- Faire Products
CREATE TABLE IF NOT EXISTS faire_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Faire API identifiers
  faire_product_id TEXT,                -- p_* from Faire API
  faire_brand_id TEXT,                  -- b_*

  -- Relationships
  store_id UUID NOT NULL REFERENCES faire_stores(id),
  supplier_id UUID REFERENCES faire_suppliers(id),

  -- Product Info
  name TEXT NOT NULL,
  short_description TEXT,
  description TEXT,
  sku TEXT,

  -- State
  sale_state faire_product_sale_state DEFAULT 'FOR_SALE',
  lifecycle_state faire_product_lifecycle_state DEFAULT 'DRAFT',

  -- Pricing
  unit_multiplier INTEGER DEFAULT 1,
  minimum_order_quantity INTEGER DEFAULT 1,

  -- Taxonomy
  taxonomy_type JSONB,
  made_in_country TEXT,

  -- Preorder
  preorderable BOOLEAN DEFAULT false,
  preorder_details JSONB,

  -- Images
  images JSONB,                        -- Array of image URLs

  -- Metadata
  metadata JSONB,

  -- Sync tracking
  last_synced_at TIMESTAMPTZ,
  sync_hash TEXT,                      -- For change detection

  -- Audit
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES profiles(id),
  updated_by UUID REFERENCES profiles(id),
  deleted_at TIMESTAMPTZ,

  UNIQUE(store_id, faire_product_id)
);

-- Faire Product Variants
CREATE TABLE IF NOT EXISTS faire_product_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Faire API identifiers
  faire_variant_id TEXT,               -- po_* from Faire API

  -- Relationships
  product_id UUID NOT NULL REFERENCES faire_products(id) ON DELETE CASCADE,
  store_id UUID NOT NULL REFERENCES faire_stores(id),

  -- Variant Info
  name TEXT NOT NULL,
  sku TEXT,
  gtin TEXT,                           -- UPC/EAN

  -- State
  sale_state faire_product_sale_state DEFAULT 'FOR_SALE',
  lifecycle_state faire_product_lifecycle_state DEFAULT 'PUBLISHED',

  -- Pricing (supports multi-geo)
  prices JSONB,                        -- Array: [{geo_constraint, wholesale_price, retail_price}]

  -- Inventory
  available_quantity INTEGER DEFAULT 0,
  reserved_quantity INTEGER DEFAULT 0,
  backordered_until DATE,

  -- Options (Size, Color, etc.)
  options JSONB,

  -- Measurements
  measurements JSONB,                  -- Weight, dimensions

  -- Sync tracking
  last_synced_at TIMESTAMPTZ,

  -- Audit
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,

  UNIQUE(product_id, faire_variant_id)
);

-- Faire Orders
CREATE TABLE IF NOT EXISTS faire_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Faire API identifiers
  faire_order_id TEXT NOT NULL,        -- bo_* from Faire API
  display_id TEXT,                     -- Human-readable order number

  -- Relationships
  store_id UUID NOT NULL REFERENCES faire_stores(id),

  -- Order State
  state faire_order_state DEFAULT 'NEW',

  -- Retailer Info
  retailer_id TEXT,
  retailer_name TEXT,

  -- Shipping
  address JSONB,                       -- Full address object
  is_free_shipping BOOLEAN DEFAULT false,
  free_shipping_reason TEXT,
  faire_covered_shipping_cost_cents INTEGER,
  ship_after TIMESTAMPTZ,

  -- Financial (stored as cents)
  subtotal_cents INTEGER,
  shipping_cents INTEGER,
  tax_cents INTEGER,
  total_cents INTEGER,
  payout_costs JSONB,
  estimated_payout_at TIMESTAMPTZ,

  -- Order Details
  purchase_order_number TEXT,
  notes TEXT,
  source TEXT,
  payment_initiated_at TIMESTAMPTZ,
  sales_rep_name TEXT,

  -- Discounts
  brand_discounts JSONB,               -- Array of discount objects

  -- Cancellation
  has_pending_cancellation_request BOOLEAN DEFAULT false,

  -- Original order (for reorders)
  original_order_id TEXT,

  -- Sync tracking
  last_synced_at TIMESTAMPTZ,
  sync_hash TEXT,

  -- Timestamps from Faire
  faire_created_at TIMESTAMPTZ,
  faire_updated_at TIMESTAMPTZ,

  -- Audit
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES profiles(id),
  updated_by UUID REFERENCES profiles(id),
  deleted_at TIMESTAMPTZ,

  UNIQUE(store_id, faire_order_id)
);

-- Faire Order Items
CREATE TABLE IF NOT EXISTS faire_order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Faire API identifiers
  faire_order_item_id TEXT,            -- oi_*

  -- Relationships
  order_id UUID NOT NULL REFERENCES faire_orders(id) ON DELETE CASCADE,
  store_id UUID NOT NULL REFERENCES faire_stores(id),
  product_id UUID REFERENCES faire_products(id) ON DELETE SET NULL,
  variant_id UUID REFERENCES faire_product_variants(id) ON DELETE SET NULL,

  -- Faire References (preserved when products are deleted)
  faire_product_id TEXT,
  faire_variant_id TEXT,

  -- Item Details
  product_name TEXT NOT NULL,
  variant_name TEXT,
  sku TEXT,
  quantity INTEGER NOT NULL DEFAULT 1,

  -- State
  state faire_order_item_state DEFAULT 'NEW',

  -- Pricing (cents)
  price_cents INTEGER NOT NULL,
  currency TEXT DEFAULT 'USD',

  -- Tester
  includes_tester BOOLEAN DEFAULT false,
  tester_price_cents INTEGER,

  -- Discounts
  discounts JSONB,

  -- Timestamps from Faire
  faire_created_at TIMESTAMPTZ,
  faire_updated_at TIMESTAMPTZ,

  -- Audit
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Faire Shipments
CREATE TABLE IF NOT EXISTS faire_shipments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Faire API identifiers
  faire_shipment_id TEXT,              -- s_*

  -- Relationships
  order_id UUID NOT NULL REFERENCES faire_orders(id) ON DELETE CASCADE,
  store_id UUID NOT NULL REFERENCES faire_stores(id),

  -- Shipment Details
  carrier TEXT,
  tracking_code TEXT,
  tracking_url TEXT,
  shipping_type TEXT,

  -- Costs (cents)
  maker_cost_cents INTEGER,

  -- Items in shipment
  item_ids JSONB,                      -- Array of faire_order_item_ids

  -- Timestamps from Faire
  faire_created_at TIMESTAMPTZ,
  faire_updated_at TIMESTAMPTZ,
  shipped_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,

  -- Audit
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,

  UNIQUE(store_id, faire_shipment_id)
);

-- Faire Inventory Log (for tracking changes)
CREATE TABLE IF NOT EXISTS faire_inventory_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Relationships
  variant_id UUID NOT NULL REFERENCES faire_product_variants(id) ON DELETE CASCADE,
  store_id UUID NOT NULL REFERENCES faire_stores(id),

  -- Change Details
  previous_quantity INTEGER,
  new_quantity INTEGER,
  change_quantity INTEGER,
  change_reason TEXT,                  -- 'order', 'adjustment', 'sync', 'return'
  reference_id TEXT,                   -- Order ID or adjustment ID

  -- Who made the change
  performed_by UUID REFERENCES profiles(id),

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Faire Sync Logs (for API integration tracking)
CREATE TABLE IF NOT EXISTS faire_sync_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Relationships
  store_id UUID NOT NULL REFERENCES faire_stores(id),

  -- Sync Details
  entity_type faire_sync_entity_type NOT NULL,
  status faire_sync_status DEFAULT 'pending',

  -- Progress
  total_records INTEGER,
  processed_records INTEGER,
  failed_records INTEGER,

  -- Timing
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,

  -- Error Handling
  error_message TEXT,
  error_details JSONB,

  -- Metadata
  metadata JSONB,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- INDEXES
-- ============================================================================

-- faire_stores
CREATE INDEX IF NOT EXISTS idx_faire_stores_active ON faire_stores(is_active) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_faire_stores_faire_brand_id ON faire_stores(faire_brand_id);
CREATE INDEX IF NOT EXISTS idx_faire_stores_code ON faire_stores(code);

-- faire_suppliers
CREATE INDEX IF NOT EXISTS idx_faire_suppliers_store ON faire_suppliers(store_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_faire_suppliers_status ON faire_suppliers(status) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_faire_suppliers_code ON faire_suppliers(store_id, code);

-- faire_products
CREATE INDEX IF NOT EXISTS idx_faire_products_store ON faire_products(store_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_faire_products_supplier ON faire_products(supplier_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_faire_products_sale_state ON faire_products(sale_state) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_faire_products_lifecycle ON faire_products(lifecycle_state) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_faire_products_faire_id ON faire_products(faire_product_id);
CREATE INDEX IF NOT EXISTS idx_faire_products_sku ON faire_products(sku) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_faire_products_name ON faire_products(name) WHERE deleted_at IS NULL;

-- faire_product_variants
CREATE INDEX IF NOT EXISTS idx_faire_variants_product ON faire_product_variants(product_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_faire_variants_store ON faire_product_variants(store_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_faire_variants_sku ON faire_product_variants(sku) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_faire_variants_faire_id ON faire_product_variants(faire_variant_id);
CREATE INDEX IF NOT EXISTS idx_faire_variants_inventory ON faire_product_variants(available_quantity) WHERE deleted_at IS NULL;

-- faire_orders
CREATE INDEX IF NOT EXISTS idx_faire_orders_store ON faire_orders(store_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_faire_orders_state ON faire_orders(state) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_faire_orders_faire_id ON faire_orders(faire_order_id);
CREATE INDEX IF NOT EXISTS idx_faire_orders_display_id ON faire_orders(display_id);
CREATE INDEX IF NOT EXISTS idx_faire_orders_created ON faire_orders(faire_created_at DESC) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_faire_orders_retailer ON faire_orders(retailer_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_faire_orders_local_created ON faire_orders(created_at DESC) WHERE deleted_at IS NULL;

-- faire_order_items
CREATE INDEX IF NOT EXISTS idx_faire_order_items_order ON faire_order_items(order_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_faire_order_items_product ON faire_order_items(product_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_faire_order_items_variant ON faire_order_items(variant_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_faire_order_items_state ON faire_order_items(state) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_faire_order_items_sku ON faire_order_items(sku);

-- faire_shipments
CREATE INDEX IF NOT EXISTS idx_faire_shipments_order ON faire_shipments(order_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_faire_shipments_store ON faire_shipments(store_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_faire_shipments_tracking ON faire_shipments(tracking_code);
CREATE INDEX IF NOT EXISTS idx_faire_shipments_carrier ON faire_shipments(carrier) WHERE deleted_at IS NULL;

-- faire_inventory_log
CREATE INDEX IF NOT EXISTS idx_faire_inventory_log_variant ON faire_inventory_log(variant_id);
CREATE INDEX IF NOT EXISTS idx_faire_inventory_log_store ON faire_inventory_log(store_id);
CREATE INDEX IF NOT EXISTS idx_faire_inventory_log_created ON faire_inventory_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_faire_inventory_log_reason ON faire_inventory_log(change_reason);

-- faire_sync_logs
CREATE INDEX IF NOT EXISTS idx_faire_sync_logs_store ON faire_sync_logs(store_id);
CREATE INDEX IF NOT EXISTS idx_faire_sync_logs_status ON faire_sync_logs(status);
CREATE INDEX IF NOT EXISTS idx_faire_sync_logs_entity ON faire_sync_logs(entity_type);
CREATE INDEX IF NOT EXISTS idx_faire_sync_logs_created ON faire_sync_logs(created_at DESC);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_faire_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_faire_stores_updated_at
  BEFORE UPDATE ON faire_stores
  FOR EACH ROW EXECUTE FUNCTION update_faire_updated_at();

CREATE TRIGGER trigger_faire_suppliers_updated_at
  BEFORE UPDATE ON faire_suppliers
  FOR EACH ROW EXECUTE FUNCTION update_faire_updated_at();

CREATE TRIGGER trigger_faire_products_updated_at
  BEFORE UPDATE ON faire_products
  FOR EACH ROW EXECUTE FUNCTION update_faire_updated_at();

CREATE TRIGGER trigger_faire_product_variants_updated_at
  BEFORE UPDATE ON faire_product_variants
  FOR EACH ROW EXECUTE FUNCTION update_faire_updated_at();

CREATE TRIGGER trigger_faire_orders_updated_at
  BEFORE UPDATE ON faire_orders
  FOR EACH ROW EXECUTE FUNCTION update_faire_updated_at();

CREATE TRIGGER trigger_faire_order_items_updated_at
  BEFORE UPDATE ON faire_order_items
  FOR EACH ROW EXECUTE FUNCTION update_faire_updated_at();

CREATE TRIGGER trigger_faire_shipments_updated_at
  BEFORE UPDATE ON faire_shipments
  FOR EACH ROW EXECUTE FUNCTION update_faire_updated_at();

-- Inventory change logging
CREATE OR REPLACE FUNCTION log_faire_inventory_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.available_quantity IS DISTINCT FROM NEW.available_quantity THEN
    INSERT INTO faire_inventory_log (
      variant_id,
      store_id,
      previous_quantity,
      new_quantity,
      change_quantity,
      change_reason
    ) VALUES (
      NEW.id,
      NEW.store_id,
      OLD.available_quantity,
      NEW.available_quantity,
      NEW.available_quantity - COALESCE(OLD.available_quantity, 0),
      'adjustment'
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_faire_inventory_change
  AFTER UPDATE ON faire_product_variants
  FOR EACH ROW EXECUTE FUNCTION log_faire_inventory_change();

-- ============================================================================
-- RLS POLICIES
-- ============================================================================

-- Enable RLS
ALTER TABLE faire_stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE faire_suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE faire_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE faire_product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE faire_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE faire_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE faire_shipments ENABLE ROW LEVEL SECURITY;
ALTER TABLE faire_inventory_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE faire_sync_logs ENABLE ROW LEVEL SECURITY;

-- Superadmin full access for all tables
CREATE POLICY "Superadmins can manage all faire_stores"
  ON faire_stores FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'superadmin'
    )
  );

CREATE POLICY "Superadmins can manage all faire_suppliers"
  ON faire_suppliers FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'superadmin'
    )
  );

CREATE POLICY "Superadmins can manage all faire_products"
  ON faire_products FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'superadmin'
    )
  );

CREATE POLICY "Superadmins can manage all faire_product_variants"
  ON faire_product_variants FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'superadmin'
    )
  );

CREATE POLICY "Superadmins can manage all faire_orders"
  ON faire_orders FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'superadmin'
    )
  );

CREATE POLICY "Superadmins can manage all faire_order_items"
  ON faire_order_items FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'superadmin'
    )
  );

CREATE POLICY "Superadmins can manage all faire_shipments"
  ON faire_shipments FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'superadmin'
    )
  );

CREATE POLICY "Superadmins can manage all faire_inventory_log"
  ON faire_inventory_log FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'superadmin'
    )
  );

CREATE POLICY "Superadmins can manage all faire_sync_logs"
  ON faire_sync_logs FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'superadmin'
    )
  );

-- Read access for authenticated users (stores, suppliers, products - non-sensitive)
CREATE POLICY "Authenticated users can view faire_stores"
  ON faire_stores FOR SELECT
  TO authenticated
  USING (deleted_at IS NULL);

CREATE POLICY "Authenticated users can view faire_suppliers"
  ON faire_suppliers FOR SELECT
  TO authenticated
  USING (deleted_at IS NULL);

CREATE POLICY "Authenticated users can view faire_products"
  ON faire_products FOR SELECT
  TO authenticated
  USING (deleted_at IS NULL);

CREATE POLICY "Authenticated users can view faire_product_variants"
  ON faire_product_variants FOR SELECT
  TO authenticated
  USING (deleted_at IS NULL);

CREATE POLICY "Authenticated users can view faire_orders"
  ON faire_orders FOR SELECT
  TO authenticated
  USING (deleted_at IS NULL);

CREATE POLICY "Authenticated users can view faire_order_items"
  ON faire_order_items FOR SELECT
  TO authenticated
  USING (deleted_at IS NULL);

CREATE POLICY "Authenticated users can view faire_shipments"
  ON faire_shipments FOR SELECT
  TO authenticated
  USING (deleted_at IS NULL);

CREATE POLICY "Authenticated users can view faire_inventory_log"
  ON faire_inventory_log FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can view faire_sync_logs"
  ON faire_sync_logs FOR SELECT
  TO authenticated
  USING (true);

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE faire_stores IS 'Faire seller accounts (6 stores for USA vertical)';
COMMENT ON TABLE faire_suppliers IS 'USA suppliers providing products';
COMMENT ON TABLE faire_products IS 'Product catalog synced from Faire';
COMMENT ON TABLE faire_product_variants IS 'Product variants with SKUs and pricing';
COMMENT ON TABLE faire_orders IS 'Orders from Faire marketplace';
COMMENT ON TABLE faire_order_items IS 'Line items within orders';
COMMENT ON TABLE faire_shipments IS 'Shipment tracking for orders';
COMMENT ON TABLE faire_inventory_log IS 'Audit trail of inventory changes';
COMMENT ON TABLE faire_sync_logs IS 'API sync job logs for monitoring';

COMMENT ON COLUMN faire_stores.faire_brand_id IS 'Faire brand ID (b_*)';
COMMENT ON COLUMN faire_stores.code IS 'Internal store code (e.g., FAIRE-US-01)';
COMMENT ON COLUMN faire_orders.faire_order_id IS 'Faire order ID (bo_*)';
COMMENT ON COLUMN faire_orders.display_id IS 'Human-readable order number from Faire';
COMMENT ON COLUMN faire_orders.total_cents IS 'Order total in cents (USD)';
COMMENT ON COLUMN faire_product_variants.prices IS 'Multi-geo pricing: [{geo_constraint, wholesale_price, retail_price}]';
