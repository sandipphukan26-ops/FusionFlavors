/*
  # Create Saved Recipes Table

  1. New Tables
    - `saved_recipes`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `recipe_id` (bigint, foreign key to recipes)
      - `saved_at` (timestamp)
      - `notes` (text, optional user notes)

  2. Security
    - Enable RLS on `saved_recipes` table
    - Add policy for users to read their own saved recipes
    - Add policy for users to insert their own saved recipes
    - Add policy for users to delete their own saved recipes

  3. Indexes
    - Add index on user_id for faster queries
    - Add unique constraint on user_id + recipe_id to prevent duplicates
*/

-- Create saved_recipes table
CREATE TABLE IF NOT EXISTS saved_recipes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  recipe_id bigint REFERENCES recipes(id) ON DELETE CASCADE NOT NULL,
  saved_at timestamptz DEFAULT now(),
  notes text,
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

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_saved_recipes_user_id ON saved_recipes(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_recipes_recipe_id ON saved_recipes(recipe_id);

-- Create updated_at trigger
CREATE TRIGGER update_saved_recipes_updated_at 
    BEFORE UPDATE ON saved_recipes 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();