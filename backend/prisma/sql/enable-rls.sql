-- Phase 3 — Row Level Security PostgreSQL (multi-tenant)
-- Run after prisma migrate: psql $DATABASE_URL -f prisma/sql/enable-rls.sql
-- Application must SET app.tenant_id = '<tenantId>' per session/transaction.

ALTER TABLE IF EXISTS orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS order_line_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS order_status_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS shipments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS tenant_orders ON orders;
CREATE POLICY tenant_orders ON orders
  USING ("tenantId" = current_setting('app.tenant_id', true))
  WITH CHECK ("tenantId" = current_setting('app.tenant_id', true));

DROP POLICY IF EXISTS tenant_customers ON customers;
CREATE POLICY tenant_customers ON customers
  USING ("tenantId" = current_setting('app.tenant_id', true))
  WITH CHECK ("tenantId" = current_setting('app.tenant_id', true));

DROP POLICY IF EXISTS tenant_shipments ON shipments;
CREATE POLICY tenant_shipments ON shipments
  USING ("tenantId" = current_setting('app.tenant_id', true))
  WITH CHECK ("tenantId" = current_setting('app.tenant_id', true));

-- Child tables inherit via order join (simplified: allow when parent order matches)
DROP POLICY IF EXISTS tenant_order_line_items ON order_line_items;
CREATE POLICY tenant_order_line_items ON order_line_items
  USING (
    EXISTS (
      SELECT 1 FROM orders o
      WHERE o.id = order_line_items."orderId"
        AND o."tenantId" = current_setting('app.tenant_id', true)
    )
  );

DROP POLICY IF EXISTS tenant_order_status_events ON order_status_events;
CREATE POLICY tenant_order_status_events ON order_status_events
  USING (
    EXISTS (
      SELECT 1 FROM orders o
      WHERE o.id = order_status_events."orderId"
        AND o."tenantId" = current_setting('app.tenant_id', true)
    )
  );
