/*
  # Move Spaghetti Carbonara to Top

  1. Changes
    - Update the ordering to show Spaghetti Carbonara first
    - Add a display_order column for custom sorting
    - Set Carbonara as the featured recipe (order 0)

  2. Security
    - No changes to existing RLS policies
*/

-- Add display_order column for custom sorting
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'recipes' AND column_name = 'display_order'
  ) THEN
    ALTER TABLE recipes ADD COLUMN display_order integer DEFAULT 999;
  END IF;
END $$;

-- Set Spaghetti Carbonara as the first recipe (order 0)
UPDATE recipes 
SET display_order = 0 
WHERE title = 'Spaghetti Carbonara';

-- Set other recipes to maintain their relative order
UPDATE recipes 
SET display_order = id + 10 
WHERE title != 'Spaghetti Carbonara' AND display_order = 999;