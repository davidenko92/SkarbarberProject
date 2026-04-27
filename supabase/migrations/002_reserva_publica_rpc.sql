-- ============================================
-- RPC: crear_reserva_publica
-- Encapsula upsert de cliente + insert de cita para el flujo público /reservar
-- Usa SECURITY DEFINER para bypasear RLS de forma controlada.
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

  RETURN v_cita_id;
END;
$$;

GRANT EXECUTE ON FUNCTION crear_reserva_publica TO anon, authenticated;
