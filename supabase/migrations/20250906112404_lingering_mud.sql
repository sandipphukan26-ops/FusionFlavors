/*
  # Fix Saved Recipes Foreign Key Constraint

  1. Problem
    - The saved_recipes table has a foreign key constraint pointing to public.users
    - But Supabase Auth users are stored in auth.users, not public.users
    - This causes "violates foreign key constraint" errors when saving recipes

  2. Solution
    - Drop the problematic foreign key constraint on user_id
    - Keep the user_id field to store auth.users UUIDs directly
    - Remove any references to public.users table

  3. Result
    - saved_recipes.user_id will store UUIDs from auth.users
    - No foreign key constraint to wrong table
    - Saved recipes functionality will work properly
*/

-- Drop the problematic foreign key constraint if it exists
DO $$
BEGIN
    -- Check if the constraint exists and drop it
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'saved_recipes_user_id_fkey' 
        AND table_name = 'saved_recipes'
    ) THEN
        ALTER TABLE saved_recipes DROP CONSTRAINT saved_recipes_user_id_fkey;
        RAISE NOTICE 'Dropped foreign key constraint saved_recipes_user_id_fkey';
    END IF;
END $$;

-- Ensure the saved_recipes table structure is correct
-- (This should already exist from previous migrations)
DO $$
BEGIN
    -- Ensure saved_recipes table exists with correct structure
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'saved_recipes') THEN
        CREATE TABLE saved_recipes (
            id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id uuid NOT NULL,
            recipe_id bigint NOT NULL,
            created_at timestamptz DEFAULT now(),
            updated_at timestamptz DEFAULT now(),
            UNIQUE(user_id, recipe_id)
        );
        
        -- Enable RLS
        ALTER TABLE saved_recipes ENABLE ROW LEVEL SECURITY;
        
        -- Add policies
        CREATE POLICY "Users can read own saved recipes"
            ON saved_recipes
            FOR SELECT
            TO authenticated
            USING (auth.uid() = user_id);

        CREATE POLICY "Users can save recipes"
            ON saved_recipes
            FOR INSERT
            TO authenticated
            WITH CHECK (auth.uid() = user_id);

        CREATE POLICY "Users can unsave recipes"
            ON saved_recipes
            FOR DELETE
            TO authenticated
            USING (auth.uid() = user_id);
            
        -- Add indexes
        CREATE INDEX idx_saved_recipes_user_id ON saved_recipes(user_id);
        CREATE INDEX idx_saved_recipes_recipe_id ON saved_recipes(recipe_id);
    END IF;
END $$;

-- Add foreign key constraint ONLY for recipes table (this should work)
DO $$
BEGIN
    -- Only add recipe foreign key if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'saved_recipes_recipe_id_fkey' 
        AND table_name = 'saved_recipes'
    ) THEN
        ALTER TABLE saved_recipes 
        ADD CONSTRAINT saved_recipes_recipe_id_fkey 
        FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE;
        RAISE NOTICE 'Added foreign key constraint for recipe_id';
    END IF;
END $$;

-- Ensure updated_at trigger exists
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at trigger if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.triggers 
        WHERE trigger_name = 'update_saved_recipes_updated_at'
    ) THEN
        CREATE TRIGGER update_saved_recipes_updated_at 
            BEFORE UPDATE ON saved_recipes 
            FOR EACH ROW 
            EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

-- Clean up any orphaned data (optional, but good practice)
-- This removes any saved_recipes that reference non-existent recipes
DELETE FROM saved_recipes 
WHERE recipe_id NOT IN (SELECT id FROM recipes);

RAISE NOTICE 'Fixed saved_recipes foreign key constraints - ready to use with auth.users UUIDs';