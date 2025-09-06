/*
  # Remove Problematic User Foreign Key Constraint

  1. Problem
    - saved_recipes table has foreign key constraint pointing to public.users
    - But we need to use auth.users UUIDs directly without foreign key constraint
    - Error: "Key (user_id)=(fa4f310e-121b-4967-8b3f-37f644148193) is not present in table \"users\""

  2. Solution
    - Drop the problematic foreign key constraint saved_recipes_user_id_fkey
    - Keep user_id field to store auth.users UUIDs directly
    - No foreign key constraint needed for user_id (auth.users is managed by Supabase)

  3. Result
    - saved_recipes.user_id stores UUIDs from auth.users
    - No foreign key constraint violation errors
    - Saved recipes functionality works properly
*/

-- First, check if the constraint exists and drop it
DO $$
BEGIN
    -- Drop the problematic foreign key constraint if it exists
    IF EXISTS (
        SELECT 1 
        FROM information_schema.table_constraints 
        WHERE constraint_name = 'saved_recipes_user_id_fkey' 
        AND table_name = 'saved_recipes'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.saved_recipes DROP CONSTRAINT saved_recipes_user_id_fkey;
        RAISE NOTICE 'Dropped foreign key constraint saved_recipes_user_id_fkey';
    ELSE
        RAISE NOTICE 'Foreign key constraint saved_recipes_user_id_fkey does not exist';
    END IF;
END $$;

-- Also check for any other user-related foreign key constraints and drop them
DO $$
DECLARE
    constraint_record RECORD;
BEGIN
    -- Find any foreign key constraints on user_id column
    FOR constraint_record IN
        SELECT constraint_name
        FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu 
            ON tc.constraint_name = kcu.constraint_name
        WHERE tc.table_name = 'saved_recipes'
        AND tc.constraint_type = 'FOREIGN KEY'
        AND kcu.column_name = 'user_id'
        AND tc.table_schema = 'public'
    LOOP
        EXECUTE 'ALTER TABLE public.saved_recipes DROP CONSTRAINT ' || constraint_record.constraint_name;
        RAISE NOTICE 'Dropped constraint: %', constraint_record.constraint_name;
    END LOOP;
END $$;

-- Ensure the saved_recipes table structure is correct
-- Keep user_id as uuid (no foreign key constraint)
-- Keep recipe_id with foreign key to recipes table
DO $$
BEGIN
    -- Ensure user_id column exists and is uuid type
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'saved_recipes' 
        AND column_name = 'user_id'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.saved_recipes ADD COLUMN user_id uuid NOT NULL;
    END IF;
    
    -- Ensure recipe_id has proper foreign key to recipes
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.table_constraints 
        WHERE constraint_name = 'saved_recipes_recipe_id_fkey' 
        AND table_name = 'saved_recipes'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.saved_recipes 
        ADD CONSTRAINT saved_recipes_recipe_id_fkey 
        FOREIGN KEY (recipe_id) REFERENCES public.recipes(id) ON DELETE CASCADE;
        RAISE NOTICE 'Added foreign key constraint for recipe_id';
    END IF;
END $$;

-- Ensure RLS policies are correct
ALTER TABLE public.saved_recipes ENABLE ROW LEVEL SECURITY;

-- Drop existing policies and recreate them
DROP POLICY IF EXISTS "Users can read own saved recipes" ON public.saved_recipes;
DROP POLICY IF EXISTS "Users can save recipes" ON public.saved_recipes;
DROP POLICY IF EXISTS "Users can unsave recipes" ON public.saved_recipes;

-- Create policies that work with auth.uid()
CREATE POLICY "Users can read own saved recipes"
    ON public.saved_recipes
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can save recipes"
    ON public.saved_recipes
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unsave recipes"
    ON public.saved_recipes
    FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

-- Ensure unique constraint exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'saved_recipes_user_id_recipe_id_key' 
        AND table_name = 'saved_recipes'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.saved_recipes 
        ADD CONSTRAINT saved_recipes_user_id_recipe_id_key 
        UNIQUE (user_id, recipe_id);
        RAISE NOTICE 'Added unique constraint on user_id, recipe_id';
    END IF;
END $$;

-- Clean up any orphaned records (optional safety measure)
DELETE FROM public.saved_recipes 
WHERE recipe_id NOT IN (SELECT id FROM public.recipes);

RAISE NOTICE 'Successfully removed user foreign key constraints from saved_recipes table';
RAISE NOTICE 'saved_recipes.user_id now stores auth.users UUIDs directly without foreign key constraint';