import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://khdqwwzgxwwuyntphuoi.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Check if Supabase is properly configured
if (!supabaseAnonKey) {
  console.error('VITE_SUPABASE_ANON_KEY is not set in environment variables');
  console.log('Please add your Supabase anonymous key to the .env file');
}
// Create Supabase client
export const supabase = supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null

// Types for our database
export interface Recipe {
  id: number;
  title: string;
  cuisine: string;
  prep_time: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  image_url: string;
  servings: number;
  ingredients?: (string | { item: string; amount: string })[];
  instructions?: string[]; // This will be mapped from 'steps' column
  created_at?: string;
  updated_at?: string;
}

// Types for saved recipes
export interface SavedRecipe {
  id: string;
  user_id: string;
  recipe_id: number;
  created_at: string;
  notes?: string;
  recipe?: Recipe; // Joined recipe data
}
// API functions
export const recipesApi = {
  // Get all recipes
  async getAll(): Promise<Recipe[]> {
    if (!supabase) {
      console.error('Supabase not configured');
      throw new Error('Supabase not configured');
    }

    const { data, error } = await supabase
      .from('recipes')
      .select('id, title, cuisine, prep_time, difficulty, image_url, servings, created_at')
      .order('title', { ascending: true });
    
    if (error) {
      console.error('Error fetching recipes:', error);
      throw error;
    }
    
    // Sort to put Spaghetti Carbonara first, then alphabetical
    const recipes = data || [];
    return recipes.sort((a, b) => {
      if (a.title === 'Spaghetti Carbonara') return -1;
      if (b.title === 'Spaghetti Carbonara') return 1;
      return a.title.localeCompare(b.title);
    });
  },

  // Get recipe by ID
  async getById(id: number): Promise<Recipe | null> {
    if (!supabase) {
      console.error('Supabase not configured');
      throw new Error('Supabase not configured');
    }

    const { data, error } = await supabase
      .from('recipes')
      .select('id, title, cuisine, prep_time, difficulty, image_url, servings, ingredients, steps, created_at')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('Error fetching recipe:', error);
      throw error;
    }
    
    // Map steps column to instructions property
    return {
      ...data,
      instructions: data.steps || []
    };
  },

  // Search recipes
  async search(query: string): Promise<Recipe[]> {
    if (!supabase) {
      console.error('Supabase not configured');
      throw new Error('Supabase not configured');
    }

    const { data, error } = await supabase
      .from('recipes')
      .select('id, title, cuisine, prep_time, difficulty, image_url, servings, created_at')
      .or(`title.ilike.%${query}%,cuisine.ilike.%${query}%`)
      .order('title');
    
    if (error) {
      console.error('Error searching recipes:', error);
      throw error;
    }
    
    return data || [];
  },

  // Filter recipes
  async filter(filters: {
    cuisine?: string;
    difficulty?: string;
    maxPrepTime?: number;
  }): Promise<Recipe[]> {
    if (!supabase) {
      console.error('Supabase not configured');
      throw new Error('Supabase not configured');
    }

    let query = supabase
      .from('recipes')
      .select('id, title, cuisine, prep_time, difficulty, image_url, servings, created_at');

    if (filters.cuisine) {
      query = query.eq('cuisine', filters.cuisine);
    }

    if (filters.difficulty) {
      query = query.eq('difficulty', filters.difficulty);
    }

    const { data, error } = await query.order('title');
    
    if (error) {
      console.error('Error filtering recipes:', error);
      throw error;
    }
    
    return data || [];
  }
};

// Saved Recipes API
export const savedRecipesApi = {
  // Save a recipe for the current user
  async saveRecipe(recipeId: number): Promise<SavedRecipe | null> {
    if (!supabase) {
      console.error('Supabase client not configured');
      throw new Error('Supabase not configured');
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error('Auth error:', authError);
      throw new Error('User not authenticated');
    }

    console.log('Attempting to save recipe:', { 
      userId: user.id, 
      userEmail: user.email,
      recipeId,
      userMetadata: user.user_metadata 
    });

    // First check if recipe exists
    const { data: recipeExists, error: recipeError } = await supabase
      .from('recipes')
      .select('id')
      .eq('id', recipeId)
      .maybeSingle();

    if (recipeError || !recipeExists) {
      console.error('Recipe not found:', recipeError);
      throw new Error('Recipe not found');
    }

    // Check if recipe is already saved
    const { data: existingSave, error: checkError } = await supabase
      .from('saved_recipes')
      .select('id')
      .eq('user_id', user.id)
      .eq('recipe_id', recipeId)
      .maybeSingle();

    if (checkError) {
      console.error('Error checking existing save:', checkError);
    }

    if (existingSave) {
      console.log('Recipe already saved:', existingSave);
      return existingSave as SavedRecipe;
    }

    // Try to insert the saved recipe
    const { data, error } = await supabase
      .from('saved_recipes')
      .insert({
        user_id: user.id,
        recipe_id: recipeId
      })
      .select()
      .maybeSingle();

    if (error) {
      console.error('Error saving recipe:', error);
      // If it's a duplicate error, that's okay - recipe is already saved
      if (error.code === '23505') {
        console.log('Recipe already saved (duplicate)');
        // Return the existing saved recipe
        const { data: existing } = await supabase
          .from('saved_recipes')
          .select()
          .eq('user_id', user.id)
          .eq('recipe_id', recipeId)
          .maybeSingle();
        return existing;
      }
      throw error;
    }

    console.log('Recipe saved successfully:', data);
    return data;
  },

  // Remove a saved recipe
  async unsaveRecipe(recipeId: number): Promise<boolean> {
    if (!supabase) {
      console.error('Supabase client not configured');
      throw new Error('Supabase not configured');
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error('User not authenticated');
      throw new Error('User not authenticated');
    }

    console.log('Attempting to unsave recipe:', { 
      userId: user.id, 
      userEmail: user.email,
      recipeId 
    });

    const { error } = await supabase
      .from('saved_recipes')
      .delete()
      .eq('user_id', user.id)
      .eq('recipe_id', recipeId);

    if (error) {
      console.error('Error unsaving recipe:', error);
      throw error;
    }

    console.log('Recipe unsaved successfully');
    return true;
  },

  // Check if a recipe is saved by the current user
  async isRecipeSaved(recipeId: number): Promise<boolean> {
    if (!supabase) {
      console.log('Supabase not configured, returning false');
      return false;
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.log('User not authenticated, returning false');
      return false;
    }

    console.log('Checking if recipe is saved:', { 
      userId: user.id, 
      userEmail: user.email,
      recipeId,
      userIdType: typeof user.id,
      recipeIdType: typeof recipeId
    });

    const { data, error } = await supabase
      .from('saved_recipes')
      .select('id')
      .eq('user_id', user.id)
      .eq('recipe_id', parseInt(recipeId.toString()))
      .limit(1);

    if (error) {
      console.error('Error checking if recipe is saved:', {
        error,
        query: { user_id: user.id, recipe_id: recipeId },
        userIdType: typeof user.id,
        recipeIdType: typeof recipeId
      });
      return false;
    }

    const isSaved = data && data.length > 0;
    console.log('Recipe saved status:', { isSaved, foundRecords: data?.length || 0 });
    return isSaved;
  },

  // Get all saved recipes for the current user
  async getUserSavedRecipes(): Promise<SavedRecipe[]> {
    if (!supabase) {
      throw new Error('Supabase not configured');
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      throw new Error('User not authenticated');
    }

    console.log('Fetching saved recipes for user:', { 
      userId: user.id, 
      userEmail: user.email 
    });

    const { data, error } = await supabase
      .from('saved_recipes')
      .select(`
        id,
        user_id,
        recipe_id,
        created_at,
        recipe:recipes(
          id,
          title,
          cuisine,
          prep_time,
          difficulty,
          image_url,
          servings
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching saved recipes:', error);
      throw error;
    }

    console.log('Fetched saved recipes:', { count: data?.length || 0, data });
    return data || [];
  }
};