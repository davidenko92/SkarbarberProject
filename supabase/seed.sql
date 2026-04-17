-- ============================================
-- SEED: Datos iniciales de Skarbarber
-- ============================================

-- Tenant
INSERT INTO tenants (id, name, slug, phone, address) VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Skarbarber',
  'skarbarber',
  '623404772',
  'Galería Comercial, C. Barberán y Collar, s/n, Local 12, 28805 Alcalá de Henares, Madrid'
);

-- Servicios (actualizar precios cuando Raúl confirme)
INSERT INTO services (tenant_id, name, duration, price, sort_order) VALUES
  ('00000000-0000-0000-0000-000000000001', 'Corte clásico',      30, 15.00, 1),
  ('00000000-0000-0000-0000-000000000001', 'Barba',              30, 10.00, 2),
  ('00000000-0000-0000-0000-000000000001', 'Corte + Barba',      30, 22.00, 3),
  ('00000000-0000-0000-0000-000000000001', 'Tinte',              30, 20.00, 4);

-- NOTA: Los profiles de Raúl y Darío se crean después de
-- crear sus cuentas en Supabase Auth (necesitan auth.users.id)
