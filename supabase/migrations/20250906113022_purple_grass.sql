/*
  # Sync Auth Users to Public Users Table

  1. Purpose
    - Automatically create entries in public.users when auth.users are created
    - Keep user data synchronized between auth.users and public.users
    - Allow foreign key relationships to public.users table

  2. New Function
    - handle_new_user_to_public() - Creates public.users entry from auth.users data

  3. Trigger
    - Runs after INSERT on auth.users
    - Automatically populates public.users with user data

  4. Data Mapping
    - auth.users.id → public.users.id
    - auth.users.email → public.users.email  
    - auth.users.raw_user_meta_data->>'full_name' or email prefix → public.users.name
    - auth.users.created_at → public.users.created_at
*/

-- Ensure public.users table exists with correct structure
CREATE TABLE IF NOT EXISTS public.users (
  id uuid PRIMARY KEY,
  email text,
  name text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on public.users
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Create policies for public.users (users can read their own data)
DROP POLICY IF EXISTS "Users can read own data" ON public.users;
CREATE POLICY "Users can read own data"
  ON public.users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own data" ON public.users;
CREATE POLICY "Users can update own data"
  ON public.users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Create function to sync auth.users to public.users
CREATE OR REPLACE FUNCTION handle_new_user_to_public()
RETURNS trigger AS $$
BEGIN
  -- Insert new user data into public.users table
  INSERT INTO public.users (id, email, name, created_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'name', 
      split_part(NEW.email, '@', 1)
    ),
    NEW.created_at
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    name = COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'name',
      split_part(NEW.email, '@', 1)
    );
    
  RETURN NEW;
EXCEPTION
  WHEN others THEN
    -- Log error but don't fail user creation
    RAISE WARNING 'Could not sync user to public.users table for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created_sync_public ON auth.users;

-- Create trigger to sync new users to public.users
CREATE TRIGGER on_auth_user_created_sync_public
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user_to_public();

-- Also create trigger for updates (in case user metadata changes)
DROP TRIGGER IF EXISTS on_auth_user_updated_sync_public ON auth.users;
CREATE TRIGGER on_auth_user_updated_sync_public
  AFTER UPDATE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user_to_public();

-- Sync existing auth.users to public.users (one-time sync)
INSERT INTO public.users (id, email, name, created_at)
SELECT 
  au.id,
  au.email,
  COALESCE(
    au.raw_user_meta_data->>'full_name',
    au.raw_user_meta_data->>'name',
    split_part(au.email, '@', 1)
  ) as name,
  au.created_at
FROM auth.users au
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  name = EXCLUDED.name;

-- Now we can safely add the foreign key constraint back to saved_recipes
-- since public.users will have all the auth users
ALTER TABLE saved_recipes 
DROP CONSTRAINT IF EXISTS saved_recipes_user_id_fkey;

ALTER TABLE saved_recipes 
ADD CONSTRAINT saved_recipes_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;

RAISE NOTICE 'Successfully set up sync from auth.users to public.users';
RAISE NOTICE 'All new users will automatically be added to public.users table';
RAISE NOTICE 'Foreign key constraint on saved_recipes now points to public.users';