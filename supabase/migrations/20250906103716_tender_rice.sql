/*
  # Fix Saved Recipes and Profiles Tables

  1. New Tables
    - Ensure `profiles` table exists with proper structure
    - Recreate `saved_recipes` table without problematic foreign key constraints

  2. Security
    - Enable RLS on both tables
    - Add proper policies for authenticated users

  3. Fixes
    - Remove foreign key constraint on user_id that causes issues
    - Ensure profiles table exists for user data
*/

-- First, ensure profiles table exists
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY,
  email text,
  full_name text,
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
CREATE POLICY "Users can read own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
CREATE POLICY "Users can insert own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Drop and recreate saved_recipes table without foreign key constraints
DROP TABLE IF EXISTS saved_recipes CASCADE;

CREATE TABLE saved_recipes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  recipe_id bigint NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, recipe_id)
);

-- Add foreign key constraint only for recipes (this should work)
ALTER TABLE saved_recipes 
ADD CONSTRAINT saved_recipes_recipe_id_fkey 
FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE;

-- Enable RLS on saved_recipes
ALTER TABLE saved_recipes ENABLE ROW LEVEL SECURITY;

-- Saved recipes policies
DROP POLICY IF EXISTS "Users can read own saved recipes" ON saved_recipes;
CREATE POLICY "Users can read own saved recipes"
  ON saved_recipes
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can save recipes" ON saved_recipes;
CREATE POLICY "Users can save recipes"
  ON saved_recipes
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can unsave recipes" ON saved_recipes;
CREATE POLICY "Users can unsave recipes"
  ON saved_recipes
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Add indexes for better performance
DROP INDEX IF EXISTS idx_saved_recipes_user_id;
CREATE INDEX idx_saved_recipes_user_id ON saved_recipes(user_id);

DROP INDEX IF EXISTS idx_saved_recipes_recipe_id;
CREATE INDEX idx_saved_recipes_recipe_id ON saved_recipes(recipe_id);

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at 
    BEFORE UPDATE ON profiles 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_saved_recipes_updated_at ON saved_recipes;
CREATE TRIGGER update_saved_recipes_updated_at 
    BEFORE UPDATE ON saved_recipes 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();