export const SETUP_SQL = `-- ============================================
-- BARBER CONTROL - Script SQL para Supabase
-- ============================================
-- Ejecuta este SQL en el SQL Editor de tu proyecto Supabase
-- (https://supabase.com/dashboard -> SQL Editor)
-- ============================================

-- 1. Perfiles (nombres de barberos)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Cortes (servicios)
CREATE TABLE IF NOT EXISTS cortes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  barbero_id UUID NOT NULL DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE CASCADE,
  servicio TEXT NOT NULL,
  precio NUMERIC(10,2) NOT NULL,
  metodo_pago TEXT NOT NULL CHECK (metodo_pago IN ('Efectivo', 'Transferencia', 'Tarjeta')),
  creado_en TIMESTAMPTZ DEFAULT now()
);

-- 3. Productos (inventario compartido)
CREATE TABLE IF NOT EXISTS productos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre TEXT NOT NULL,
  stock INTEGER NOT NULL DEFAULT 0,
  precio_costo NUMERIC(10,2) NOT NULL DEFAULT 0,
  precio_venta NUMERIC(10,2) NOT NULL DEFAULT 0,
  creado_en TIMESTAMPTZ DEFAULT now()
);

-- 4. Ventas de productos
CREATE TABLE IF NOT EXISTS ventas_productos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  producto_id UUID NOT NULL REFERENCES productos(id) ON DELETE CASCADE,
  cantidad INTEGER NOT NULL DEFAULT 1,
  barbero_id UUID NOT NULL DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE CASCADE,
  total_venta NUMERIC(10,2) NOT NULL,
  creado_en TIMESTAMPTZ DEFAULT now()
);

-- 5. Gastos (compartido)
CREATE TABLE IF NOT EXISTS gastos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  descripcion TEXT NOT NULL,
  monto NUMERIC(10,2) NOT NULL,
  categoria TEXT NOT NULL CHECK (categoria IN ('Fijo', 'Variable')),
  creado_en TIMESTAMPTZ DEFAULT now()
);

-- Activar RLS en todas las tablas
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE cortes ENABLE ROW LEVEL SECURITY;
ALTER TABLE productos ENABLE ROW LEVEL SECURITY;
ALTER TABLE ventas_productos ENABLE ROW LEVEL SECURITY;
ALTER TABLE gastos ENABLE ROW LEVEL SECURITY;

-- Profiles: cualquiera autenticado puede leer, solo el dueño puede modificar
DROP POLICY IF EXISTS "select_profiles" ON profiles;
CREATE POLICY "select_profiles" ON profiles FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "insert_own_profile" ON profiles;
CREATE POLICY "insert_own_profile" ON profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
DROP POLICY IF EXISTS "update_own_profile" ON profiles;
CREATE POLICY "update_own_profile" ON profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Cortes: cualquiera puede leer (para dashboard), solo el barbero puede insertar/modificar/eliminar
DROP POLICY IF EXISTS "select_cortes" ON cortes;
CREATE POLICY "select_cortes" ON cortes FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "insert_own_cortes" ON cortes;
CREATE POLICY "insert_own_cortes" ON cortes FOR INSERT TO authenticated WITH CHECK (barbero_id = auth.uid());
DROP POLICY IF EXISTS "update_own_cortes" ON cortes;
CREATE POLICY "update_own_cortes" ON cortes FOR UPDATE TO authenticated USING (barbero_id = auth.uid()) WITH CHECK (barbero_id = auth.uid());
DROP POLICY IF EXISTS "delete_own_cortes" ON cortes;
CREATE POLICY "delete_own_cortes" ON cortes FOR DELETE TO authenticated USING (barbero_id = auth.uid());

-- Productos: compartido entre todos los barberos
DROP POLICY IF EXISTS "select_productos" ON productos;
CREATE POLICY "select_productos" ON productos FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "insert_productos" ON productos;
CREATE POLICY "insert_productos" ON productos FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "update_productos" ON productos;
CREATE POLICY "update_productos" ON productos FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "delete_productos" ON productos;
CREATE POLICY "delete_productos" ON productos FOR DELETE TO authenticated USING (true);

-- Ventas: cualquiera puede leer (para dashboard), solo el barbero puede insertar/modificar/eliminar
DROP POLICY IF EXISTS "select_ventas" ON ventas_productos;
CREATE POLICY "select_ventas" ON ventas_productos FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "insert_own_ventas" ON ventas_productos;
CREATE POLICY "insert_own_ventas" ON ventas_productos FOR INSERT TO authenticated WITH CHECK (barbero_id = auth.uid());
DROP POLICY IF EXISTS "update_own_ventas" ON ventas_productos;
CREATE POLICY "update_own_ventas" ON ventas_productos FOR UPDATE TO authenticated USING (barbero_id = auth.uid()) WITH CHECK (barbero_id = auth.uid());
DROP POLICY IF EXISTS "delete_own_ventas" ON ventas_productos;
CREATE POLICY "delete_own_ventas" ON ventas_productos FOR DELETE TO authenticated USING (barbero_id = auth.uid());

-- Gastos: compartido entre todos los barberos
DROP POLICY IF EXISTS "select_gastos" ON gastos;
CREATE POLICY "select_gastos" ON gastos FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "insert_gastos" ON gastos;
CREATE POLICY "insert_gastos" ON gastos FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "update_gastos" ON gastos;
CREATE POLICY "update_gastos" ON gastos FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "delete_gastos" ON gastos;
CREATE POLICY "delete_gastos" ON gastos FOR DELETE TO authenticated USING (true);

-- Indices para rendimiento
CREATE INDEX IF NOT EXISTS idx_cortes_barbero ON cortes(barbero_id);
CREATE INDEX IF NOT EXISTS idx_cortes_creado ON cortes(creado_en DESC);
CREATE INDEX IF NOT EXISTS idx_ventas_barbero ON ventas_productos(barbero_id);
CREATE INDEX IF NOT EXISTS idx_ventas_creado ON ventas_productos(creado_en DESC);
CREATE INDEX IF NOT EXISTS idx_gastos_creado ON gastos(creado_en DESC);

-- Trigger: crear perfil automaticamente al registrar usuario
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', 'Barbero'));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();`;
