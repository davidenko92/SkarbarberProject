-- ============================================
-- ANTI DOBLE-RESERVA — constraint a nivel DB
-- ============================================
-- Garantiza que dos citas activas (no canceladas) del mismo empleado
-- no puedan solaparse en el tiempo. Bloquea la race condition entre
-- la validación lógica de slots y el INSERT.
--
-- Implementación: EXCLUDE USING gist con tstzrange + btree_gist para
-- combinar igualdad de UUID con solape de rangos.

CREATE EXTENSION IF NOT EXISTS btree_gist;

ALTER TABLE citas
  ADD CONSTRAINT citas_no_solape_excl
  EXCLUDE USING gist (
    empleado_id WITH =,
    tstzrange(inicio, fin, '[)') WITH &&
  )
  WHERE (estado <> 'cancelada');

COMMENT ON CONSTRAINT citas_no_solape_excl ON citas IS
  'Impide solape de citas activas del mismo empleado. Rango [) para que '
  '10:00-10:30 no choque con 10:30-11:00.';

-- ============================================
-- RPC: crear_reserva_publica (v2)
-- Captura el conflicto de solape y devuelve un error claro al cliente.
-- ============================================
CREATE OR REPLACE FUNCTION crear_reserva_publica(
  p_empleado_id UUID,
  p_servicio_id UUID,
  p_inicio TIMESTAMPTZ,
  p_fin TIMESTAMPTZ,
  p_nombre TEXT,
  p_telefono TEXT,
  p_email TEXT DEFAULT NULL,
  p_notas TEXT DEFAULT NULL
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_cliente_id UUID;
  v_cita_id UUID;
BEGIN
  INSERT INTO clientes (nombre, telefono, email)
  VALUES (p_nombre, p_telefono, NULLIF(p_email, ''))
  ON CONFLICT (telefono) DO UPDATE
    SET nombre = EXCLUDED.nombre,
        email = COALESCE(EXCLUDED.email, clientes.email),
        actualizado_en = NOW()
  RETURNING id INTO v_cliente_id;

  BEGIN
    INSERT INTO citas (cliente_id, empleado_id, servicio_id, inicio, fin, notas)
    VALUES (
      v_cliente_id,
      p_empleado_id,
      p_servicio_id,
      p_inicio,
      p_fin,
      NULLIF(p_notas, '')
    )
    RETURNING id INTO v_cita_id;
  EXCEPTION
    WHEN exclusion_violation THEN
      RAISE EXCEPTION 'SLOT_OCUPADO'
        USING ERRCODE = 'P0001',
              HINT = 'Esa hora ya está ocupada. Elige otra.';
  END;

  RETURN v_cita_id;
END;
$$;
