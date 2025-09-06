import React, { useState } from 'react';
import { ArrowLeft, ChefHat, Clock, Heart, Trash2, BookOpen } from 'lucide-react';
import { savedRecipesApi, SavedRecipe } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';


interface SavedRecipesProps {
  onBackToHome: () => void;
  onViewRecipe: (recipeId: string) => void;
  onGoToExplorer: () => void;
}

const SavedRecipes: React.FC<SavedRecipesProps> = ({ onBackToHome, onViewRecipe, onGoToExplorer }) => {
  const { user } = useAuth();
  const [savedRecipes, setSavedRecipes] = useState<SavedRecipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch saved recipes when component mounts or user changes
  React.useEffect(() => {
    const fetchSavedRecipes = async () => {
      if (!user) {
        setSavedRecipes([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const data = await savedRecipesApi.getUserSavedRecipes();
        setSavedRecipes(data);
      } catch (err: any) {
        console.error('Error fetching saved recipes:', err);
        setError('Failed to load saved recipes');
        setSavedRecipes([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSavedRecipes();
  }, [user]);

  const handleRemoveRecipe = async (savedRecipeId: string, recipeId: number) => {
    try {
      await savedRecipesApi.unsaveRecipe(recipeId);
      setSavedRecipes(prev => prev.filter(recipe => recipe.id !== savedRecipeId));
    } catch (error) {
      console.error('Error removing saved recipe:', error);
      alert('Failed to remove recipe. Please try again.');
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'bg-green-100 text-green-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'Hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const EmptyState = () => (
    <div className="text-center py-20">
      <div className="mb-8">
        <div className="w-32 h-32 mx-auto mb-6 bg-gradient-to-br from-orange-100 to-red-100 rounded-full flex items-center justify-center">
          <Heart className="h-16 w-16 text-orange-400" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-4">
          No recipes saved yet
        </h3>
        <p className="text-lg text-gray-600 max-w-md mx-auto mb-8">
          Explore our amazing fusion recipes and add your favorites to build your personal collection!
        </p>
        <button 
          onClick={onGoToExplorer}
          className="bg-gradient-to-r from-orange-600 to-red-600 text-white px-8 py-4 rounded-xl text-lg font-bold shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 inline-flex items-center space-x-3"
        >
          <BookOpen className="h-6 w-6" />
          <span>Go to Recipe Explorer</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-sm border-b border-orange-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <ChefHat className="h-8 w-8 text-orange-600" />
                <span className="text-2xl font-bold text-gray-900">FusionFlavors</span>
              </div>
            </div>
            <button 
              onClick={onBackToHome}
              className="flex items-center space-x-2 text-orange-600 hover:text-orange-700 font-semibold transition-colors duration-200 mr-4"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Home</span>
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!user ? (
          <div className="text-center py-20">
            <div className="mb-8">
              <div className="w-32 h-32 mx-auto mb-6 bg-gradient-to-br from-orange-100 to-red-100 rounded-full flex items-center justify-center">
                <Heart className="h-16 w-16 text-orange-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Sign in to view saved recipes
              </h3>
              <p className="text-lg text-gray-600 max-w-md mx-auto mb-8">
                Create an account or sign in to save your favorite recipes and access them anytime!
              </p>
            </div>
          </div>
        ) : loading ? (
          <div className="text-center py-20">
            <ChefHat className="h-16 w-16 text-orange-300 mx-auto mb-4 animate-spin" />
            <h3 className="text-xl font-semibold text-gray-600">Loading your saved recipes...</h3>
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <div className="mb-8">
              <div className="w-32 h-32 mx-auto mb-6 bg-gradient-to-br from-red-100 to-orange-100 rounded-full flex items-center justify-center">
                <Heart className="h-16 w-16 text-red-400" />
              </div>
              <h3 className="text-2xl font-bold text-red-600 mb-4">
                {error}
              </h3>
              <button 
                onClick={() => window.location.reload()}
                className="mt-4 px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors duration-200"
              >
                Try Again
              </button>
            </div>
          </div>
        ) : (
          <>
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Your Saved Recipes
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Here are the recipes you've bookmarked. Tap any card to view details or cook again.
          </p>
        </div>

        {/* Recipe Grid or Empty State */}
        {savedRecipes.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            {/* Recipe Count */}
            <div className="mb-8">
              <p className="text-lg text-gray-600 text-center">
                {savedRecipes.length} recipe{savedRecipes.length !== 1 ? 's' : ''} saved
              </p>
            </div>

            {/* Recipe Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {savedRecipes.map((recipe) => (
                <div
                  key={recipe.id}
                  className="group bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl hover:border-orange-200 transform hover:-translate-y-2 transition-all duration-300"
                >
                  {/* Recipe Image */}
                  <div className="relative overflow-hidden">
                    <img
                      src={recipe.recipe?.image_url || 'https://images.pexels.com/photos/1279330/pexels-photo-1279330.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop'}
                      alt={recipe.recipe?.title || 'Recipe'}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-3 left-3 flex space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getDifficultyColor(recipe.recipe?.difficulty || 'Medium')}`}>
                        {recipe.recipe?.difficulty || 'Medium'}
                      </span>
                      {recipe.notes?.includes('fusion') && (
                        <span className="px-2 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                          Fusion
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Recipe Content */}
                  <div className="p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-orange-600 transition-colors duration-200">
                      {recipe.recipe?.title || 'Recipe'}
                    </h3>
                    
                    {/* Metadata */}
                    <div className="flex items-center space-x-4 mb-4 text-sm text-gray-600">
                      <div className="flex items-center space-x-1">
                        <Clock className="h-4 w-4" />
                        <span>{recipe.recipe?.prep_time || 'N/A'}</span>
                      </div>
                      <span className="text-gray-400">•</span>
                      <span>{recipe.recipe?.cuisine || 'Unknown'}</span>
                    </div>

                    {/* Notes */}
                    {recipe.notes && (
                      <div className="mb-4 p-2 bg-orange-50 rounded-lg">
                        <p className="text-xs text-orange-700 font-medium">
                          Note: {recipe.notes}
                        </p>
                      </div>
                    )}

                    {/* Saved Date */}
                    <div className="mb-4">
                      <p className="text-xs text-gray-500">
                        Saved on {new Date(recipe.created_at).toLocaleDateString()}
                        </p>
                      </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col space-y-2">
                      <button 
                        onClick={() => onViewRecipe(recipe.recipe_id.toString())}
                        className="w-full py-3 rounded-xl font-semibold bg-gradient-to-r from-orange-600 to-red-600 text-white hover:from-orange-700 hover:to-red-700 transform hover:scale-105 hover:shadow-lg transition-all duration-200"
                      >
                        View Recipe
                      </button>
                      
                      <button 
                        onClick={() => handleRemoveRecipe(recipe.id, recipe.recipe_id)}
                        className="w-full py-3 rounded-xl font-semibold border-2 border-gray-200 text-gray-600 hover:border-red-300 hover:bg-red-50 hover:text-red-600 transition-all duration-200 inline-flex items-center justify-center space-x-2"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span>Remove</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
          </>
        )}
      </div>
    </div>
  );
};

export default SavedRecipes;