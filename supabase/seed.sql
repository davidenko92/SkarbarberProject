-- ============================================
-- SEED: Datos iniciales de Skarbarber
-- ============================================

-- Negocio
INSERT INTO negocio (nombre, telefono, direccion) VALUES (
  'Skarbarber',
  '623404772',
  'Galería Comercial, C. Barberán y Collar, s/n, Local 12, 28805 Alcalá de Henares, Madrid'
);

-- Servicios (actualizar precios cuando Raúl confirme)
INSERT INTO servicios (nombre, duracion, precio, orden) VALUES
  ('Corte clásico',  30, 15.00, 1),
  ('Barba',          30, 10.00, 2),
  ('Corte + Barba',  30, 22.00, 3),
  ('Tinte',          30, 20.00, 4);

-- NOTA: Los empleados (Raúl y Darío) se crean después de
-- crear sus cuentas en Supabase Auth (necesitan auth.users.id)
-- INSERT INTO empleados (id, nombre, rol) VALUES
--   ('<UUID_DE_RAUL>', 'Raúl', 'propietario'),
--   ('<UUID_DE_DARIO>', 'Darío', 'barbero');
