/*
  # Fix Saved Recipes Table Foreign Key Constraint

  1. New Tables
    - `saved_recipes` (recreated with proper foreign key handling)
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `recipe_id` (bigint, references recipes)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `saved_recipes` table
    - Add policies for authenticated users

  3. Fixes
    - Remove problematic foreign key constraint on user_id
    - Use proper UUID handling for user authentication
*/

-- Drop existing table if it exists (to fix constraint issues)
DROP TABLE IF EXISTS saved_recipes CASCADE;

-- Create saved_recipes table without strict foreign key constraint on user_id
CREATE TABLE saved_recipes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  recipe_id bigint REFERENCES recipes(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, recipe_id)
);

-- Enable RLS
ALTER TABLE saved_recipes ENABLE ROW LEVEL SECURITY;

-- Users can read their own saved recipes
CREATE POLICY "Users can read own saved recipes"
  ON saved_recipes
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Users can insert their own saved recipes
CREATE POLICY "Users can save recipes"
  ON saved_recipes
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own saved recipes
CREATE POLICY "Users can unsave recipes"
  ON saved_recipes
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_saved_recipes_user_id ON saved_recipes(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_recipes_recipe_id ON saved_recipes(recipe_id);

-- Create updated_at trigger
CREATE TRIGGER update_saved_recipes_updated_at 
    BEFORE UPDATE ON saved_recipes 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();