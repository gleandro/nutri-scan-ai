-- ==============================================================================
-- NUTRISCAN AI: Script Maestro de Base de Datos para Supabase
-- Copia y ejecuta TODO este script en: Supabase Dashboard -> SQL Editor -> Run
-- ==============================================================================

-- 1. Permisos del esquema público
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;

-- 2. Tabla de Perfiles con Antropometría y Macros
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  weight_kg NUMERIC DEFAULT 75,
  height_cm NUMERIC DEFAULT 175,
  age INTEGER DEFAULT 28,
  gender TEXT DEFAULT 'male',
  activity_level TEXT DEFAULT 'moderate',
  fitness_goal TEXT DEFAULT 'deficit_moderate',
  macro_preset TEXT DEFAULT 'balanced',
  daily_calorie_goal INTEGER DEFAULT 2200,
  protein_goal_g NUMERIC DEFAULT 165,
  carbs_goal_g NUMERIC DEFAULT 220,
  fat_goal_g NUMERIC DEFAULT 73,
  carb_cycling_enabled BOOLEAN DEFAULT FALSE,
  streak_count INTEGER DEFAULT 1,
  last_logged_date TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Asegurar columnas en profiles si ya existía la tabla
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS weight_kg NUMERIC DEFAULT 75;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS height_cm NUMERIC DEFAULT 175;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS age INTEGER DEFAULT 28;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS gender TEXT DEFAULT 'male';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS activity_level TEXT DEFAULT 'moderate';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS fitness_goal TEXT DEFAULT 'deficit_moderate';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS macro_preset TEXT DEFAULT 'balanced';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS daily_calorie_goal INTEGER DEFAULT 2200;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS protein_goal_g NUMERIC DEFAULT 165;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS carbs_goal_g NUMERIC DEFAULT 220;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS fat_goal_g NUMERIC DEFAULT 73;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS carb_cycling_enabled BOOLEAN DEFAULT FALSE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS streak_count INTEGER DEFAULT 1;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS last_logged_date TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now());

-- 3. Tabla de Registro de Comidas
CREATE TABLE IF NOT EXISTS public.food_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  food_name TEXT NOT NULL,
  meal_type TEXT DEFAULT 'lunch',
  source TEXT DEFAULT 'gemini_photo',
  total_calories INTEGER NOT NULL,
  protein_g NUMERIC DEFAULT 0,
  carbs_g NUMERIC DEFAULT 0,
  fat_g NUMERIC DEFAULT 0,
  breakdown JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.food_logs ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.food_logs ADD COLUMN IF NOT EXISTS food_name TEXT;
ALTER TABLE public.food_logs ADD COLUMN IF NOT EXISTS meal_type TEXT DEFAULT 'lunch';
ALTER TABLE public.food_logs ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'gemini_photo';
ALTER TABLE public.food_logs ADD COLUMN IF NOT EXISTS total_calories INTEGER;
ALTER TABLE public.food_logs ADD COLUMN IF NOT EXISTS protein_g NUMERIC DEFAULT 0;
ALTER TABLE public.food_logs ADD COLUMN IF NOT EXISTS carbs_g NUMERIC DEFAULT 0;
ALTER TABLE public.food_logs ADD COLUMN IF NOT EXISTS fat_g NUMERIC DEFAULT 0;
ALTER TABLE public.food_logs ADD COLUMN IF NOT EXISTS breakdown JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.food_logs ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now());

-- 4. Tabla de Registro de Ejercicio
CREATE TABLE IF NOT EXISTS public.exercise_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  activity_name TEXT NOT NULL,
  duration_min INTEGER DEFAULT 0,
  calories_burned INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 5. Tabla de Historial de Peso y Medidas
CREATE TABLE IF NOT EXISTS public.weight_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  weight_kg NUMERIC NOT NULL,
  waist_cm NUMERIC,
  chest_cm NUMERIC,
  arms_cm NUMERIC,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 6. Tabla de Registro de Hidratación Diaria (Water Tracker)
CREATE TABLE IF NOT EXISTS public.water_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  amount_ml INTEGER NOT NULL DEFAULT 0,
  logged_date DATE NOT NULL DEFAULT CURRENT_DATE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  UNIQUE(user_id, logged_date)
);

-- 7. Otorgar permisos a todos los roles de Supabase
GRANT ALL ON TABLE public.profiles TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.food_logs TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.exercise_logs TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.weight_logs TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.water_logs TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;

-- 7. Habilitar Seguridad a Nivel de Fila (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.food_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercise_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weight_logs ENABLE ROW LEVEL SECURITY;

-- 8. Políticas RLS para profiles
DROP POLICY IF EXISTS "profiles_select" ON public.profiles;
CREATE POLICY "profiles_select" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_insert" ON public.profiles;
CREATE POLICY "profiles_insert" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_update" ON public.profiles;
CREATE POLICY "profiles_update" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_delete" ON public.profiles;
CREATE POLICY "profiles_delete" ON public.profiles FOR DELETE TO authenticated USING (auth.uid() = id);

-- 9. Políticas RLS para food_logs
DROP POLICY IF EXISTS "food_logs_select" ON public.food_logs;
CREATE POLICY "food_logs_select" ON public.food_logs FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "food_logs_insert" ON public.food_logs;
CREATE POLICY "food_logs_insert" ON public.food_logs FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "food_logs_update" ON public.food_logs;
CREATE POLICY "food_logs_update" ON public.food_logs FOR UPDATE TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "food_logs_delete" ON public.food_logs;
CREATE POLICY "food_logs_delete" ON public.food_logs FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- 10. Políticas RLS para exercise_logs
DROP POLICY IF EXISTS "exercise_logs_select" ON public.exercise_logs;
CREATE POLICY "exercise_logs_select" ON public.exercise_logs FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "exercise_logs_insert" ON public.exercise_logs;
CREATE POLICY "exercise_logs_insert" ON public.exercise_logs FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "exercise_logs_delete" ON public.exercise_logs;
CREATE POLICY "exercise_logs_delete" ON public.exercise_logs FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- 11. Políticas RLS para weight_logs
DROP POLICY IF EXISTS "weight_logs_select" ON public.weight_logs;
CREATE POLICY "weight_logs_select" ON public.weight_logs FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "weight_logs_insert" ON public.weight_logs;
CREATE POLICY "weight_logs_insert" ON public.weight_logs FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "weight_logs_delete" ON public.weight_logs;
CREATE POLICY "weight_logs_delete" ON public.weight_logs FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- 12. Políticas RLS para water_logs (Hidratación)
ALTER TABLE public.water_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "water_logs_select" ON public.water_logs;
CREATE POLICY "water_logs_select" ON public.water_logs FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "water_logs_insert" ON public.water_logs;
CREATE POLICY "water_logs_insert" ON public.water_logs FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "water_logs_update" ON public.water_logs;
CREATE POLICY "water_logs_update" ON public.water_logs FOR UPDATE TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "water_logs_delete" ON public.water_logs;
CREATE POLICY "water_logs_delete" ON public.water_logs FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- 13. Trigger para nuevo usuario automático
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (
    id, weight_kg, height_cm, age, gender, activity_level, 
    fitness_goal, macro_preset, daily_calorie_goal, protein_goal_g, carbs_goal_g, fat_goal_g
  )
  VALUES (
    new.id, 75, 175, 28, 'male', 'moderate',
    'deficit_moderate', 'balanced', 2150, 161, 215, 72
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
