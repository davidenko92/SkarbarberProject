-- 003 — RLS UPDATE policy para tabla negocio
--
-- La tabla negocio tenía RLS activo pero solo policy de SELECT pública.
-- Esto hacía que el formulario /panel/config no pudiese guardar cambios:
-- el UPDATE salía del servidor pero Postgres lo bloqueaba en silencio
-- (Supabase devolvía éxito con 0 filas afectadas).
--
-- Esta migración añade una policy de UPDATE restringida al rol 'propietario'.
-- Defensa en profundidad: el server action ya valida con requirePropietario,
-- y ahora la BD también lo enforza.

create policy "actualizar_negocio_propietario"
  on negocio
  for update
  to authenticated
  using (
    exists (
      select 1 from empleados e
      where e.id = auth.uid()
        and e.rol = 'propietario'
    )
  )
  with check (
    exists (
      select 1 from empleados e
      where e.id = auth.uid()
        and e.rol = 'propietario'
    )
  );
