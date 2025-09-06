import React, { useState, useEffect } from 'react';
import { ArrowLeft, Clock, ChefHat, Globe, Users, Heart, Plus } from 'lucide-react';
import { recipesApi, savedRecipesApi, Recipe } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';


interface BaseRecipeDetailProps {
  recipeId: number | null;
  onBack: () => void;
  onAddFusionTwist: (recipe: Recipe) => void;
}

const BaseRecipeDetail: React.FC<BaseRecipeDetailProps> = ({ recipeId, onBack, onAddFusionTwist }) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'ingredients' | 'instructions'>('ingredients');
  const [isSaved, setIsSaved] = useState(false);
  const [savingRecipe, setSavingRecipe] = useState(false);
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fallback recipe data for when database is not available
  const fallbackRecipes: { [key: number]: Recipe } = {
    1: {
      id: 1,
      title: "Spaghetti Carbonara",
      cuisine: "Italian",
      prep_time: "25 min",
      difficulty: "Medium",
      image_url: "https://images.pexels.com/photos/1279330/pexels-photo-1279330.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
      servings: 4,
      ingredients: [
        "400g spaghetti pasta",
        "200g pancetta or guanciale, diced",
        "4 large eggs",
        "100g Pecorino Romano cheese, grated",
        "50g Parmesan cheese, grated",
        "2 cloves garlic, minced",
        "Freshly ground black pepper",
        "Salt to taste",
        "2 tablespoons olive oil"
      ],
      instructions: [
        "Bring a large pot of salted water to boil. Cook spaghetti according to package directions until al dente.",
        "While pasta cooks, heat olive oil in a large skillet over medium heat. Add pancetta and cook until crispy, about 5-7 minutes.",
        "In a bowl, whisk together eggs, Pecorino Romano, Parmesan, and a generous amount of black pepper.",
        "Reserve 1 cup of pasta cooking water, then drain the pasta.",
        "Add the hot pasta to the skillet with pancetta. Remove from heat.",
        "Quickly pour the egg mixture over the pasta, tossing constantly to create a creamy sauce. Add pasta water as needed.",
        "Season with salt and additional pepper. Serve immediately with extra cheese."
      ]
    },
    2: {
      id: 2,
      title: "Chicken Teriyaki",
      cuisine: "Japanese",
      prep_time: "30 min",
      difficulty: "Easy",
      image_url: "https://images.pexels.com/photos/2338407/pexels-photo-2338407.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
      servings: 4,
      ingredients: [
        "4 chicken thighs",
        "1/4 cup soy sauce",
        "2 tbsp mirin",
        "2 tbsp sake",
        "2 tbsp sugar",
        "1 tbsp vegetable oil",
        "2 green onions, sliced",
        "1 tsp sesame seeds"
      ],
      instructions: [
        "Mix soy sauce, mirin, sake, and sugar to make teriyaki sauce.",
        "Heat oil in a pan and cook chicken skin-side down until golden.",
        "Flip chicken and cook until done.",
        "Add teriyaki sauce and simmer until glossy.",
        "Garnish with green onions and sesame seeds."
      ]
    }
  };

  useEffect(() => {
    const fetchRecipe = async () => {
      console.log('BaseRecipeDetail: fetchRecipe called with recipeId:', recipeId);
      
      if (!recipeId) {
        console.log('BaseRecipeDetail: No recipeId provided');
        setError('No recipe selected');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        console.log('BaseRecipeDetail: Fetching recipe with ID:', recipeId);
        
        // Try to fetch from Supabase first
        const data = await recipesApi.getById(recipeId);
        console.log('BaseRecipeDetail: Fetched recipe data:', data);
        
        if (data) {
          setRecipe(data);
          console.log('BaseRecipeDetail: Recipe set successfully');
        } else {
          // Fallback to local data
          console.log('BaseRecipeDetail: No data from Supabase, trying fallback');
          const fallbackRecipe = fallbackRecipes[recipeId];
          if (fallbackRecipe) {
            setRecipe(fallbackRecipe);
            console.log('BaseRecipeDetail: Using fallback recipe');
          } else {
            console.log('BaseRecipeDetail: No fallback recipe found');
            setError('Recipe not found');
          }
        }
      } catch (err) {
        console.warn('BaseRecipeDetail: Failed to fetch recipe from Supabase, using fallback:', err);
        // Use fallback data
        const fallbackRecipe = fallbackRecipes[recipeId];
        if (fallbackRecipe) {
          setRecipe(fallbackRecipe);
          setError(null);
          console.log('BaseRecipeDetail: Using fallback recipe after error');
        } else {
          console.log('BaseRecipeDetail: No fallback recipe available after error');
          setError('Recipe not found');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchRecipe();
  }, [recipeId]);
  // Check if recipe is saved when component mounts or user changes
  useEffect(() => {
    const checkIfSaved = async () => {
      if (!user || !recipeId) {
        console.log('BaseRecipeDetail: Cannot check saved status:', { user: !!user, recipeId });
        return;
      }
      
      console.log('BaseRecipeDetail: Checking if recipe is saved:', { 
        userId: user.id, 
        recipeId, 
        recipeIdType: typeof recipeId 
      });
      
      try {
        const saved = await savedRecipesApi.isRecipeSaved(recipeId);
        console.log('BaseRecipeDetail: Recipe saved status:', saved);
        setIsSaved(saved);
      } catch (error) {
        console.error('BaseRecipeDetail: Error checking if recipe is saved:', error);
      }
    };

    checkIfSaved();
  }, [user, recipeId]);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'bg-green-100 text-green-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'Hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleSaveRecipe = async () => {
    if (!user) {
      alert('Please sign in to save recipes');
      return;
    }

    if (!recipe) return;

    console.log('Save recipe button clicked:', { recipeId: recipe.id, isSaved });
    setSavingRecipe(true);
    
    try {
      if (isSaved) {
        // Unsave the recipe
        console.log('Unsaving recipe...');
        await savedRecipesApi.unsaveRecipe(recipe.id);
        setIsSaved(false);
        console.log('Recipe unsaved successfully');
      } else {
        // Save the recipe
        console.log('Saving recipe...');
        await savedRecipesApi.saveRecipe(recipe.id);
        setIsSaved(true);
        console.log('Recipe saved successfully');
      }
    } catch (error: any) {
      console.error('Error saving/unsaving recipe:', error);
      if (error.message?.includes('not authenticated')) {
        alert('Please sign in to save recipes');
      } else {
        alert(`Failed to ${isSaved ? 'unsave' : 'save'} recipe: ${error.message}`);
      }
    } finally {
      setSavingRecipe(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 flex items-center justify-center">
        <div className="text-center">
          <ChefHat className="h-16 w-16 text-orange-300 mx-auto mb-4 animate-spin" />
          <h3 className="text-xl font-semibold text-gray-600">Loading recipe...</h3>
        </div>
      </div>
    );
  }

  if (error || !recipe) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 flex items-center justify-center">
        <div className="text-center">
          <ChefHat className="h-16 w-16 text-red-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-red-600 mb-2">{error || 'Recipe not found'}</h3>
          <button 
            onClick={onBack}
            className="mt-4 px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors duration-200"
          >
            Back to Explorer
          </button>
        </div>
      </div>
    );
  }

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
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => window.location.href = '/'}
                className="flex items-center space-x-2 text-orange-600 hover:text-orange-700 font-semibold transition-colors duration-200"
              >
                <ArrowLeft className="h-5 w-5" />
                <span>Home</span>
              </button>
              <span className="text-gray-300">|</span>
              <button 
                onClick={onBack}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-700 font-semibold transition-colors duration-200"
              >
                <ArrowLeft className="h-5 w-5" />
                <span>Back to Explorer</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Recipe Image */}
        <div className="relative mb-8">
          <img
            src={recipe.image_url}
            alt={recipe.title}
            className="w-full h-80 lg:h-96 object-cover rounded-2xl shadow-lg"
          />
          <div className="absolute top-4 right-4">
            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getDifficultyColor(recipe.difficulty)}`}>
              {recipe.difficulty}
            </span>
          </div>
        </div>

        {/* Recipe Title */}
        <div className="text-center mb-8">
          <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            {recipe.title}
          </h1>
        </div>

        {/* Metadata Section */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="flex items-center space-x-3">
              <div className="bg-orange-100 p-2 rounded-lg">
                <Clock className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Prep Time</p>
                <p className="font-semibold text-gray-900">{recipe.prep_time}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="bg-red-100 p-2 rounded-lg">
                <ChefHat className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Difficulty</p>
                <p className="font-semibold text-gray-900">{recipe.difficulty}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="bg-blue-100 p-2 rounded-lg">
                <Globe className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Cuisine</p>
                <p className="font-semibold text-gray-900">{recipe.cuisine}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="bg-green-100 p-2 rounded-lg">
                <Users className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Servings</p>
                <p className="font-semibold text-gray-900">{recipe.servings}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Toggle Tabs */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-8">
          <div className="flex border-b border-gray-100">
            <button
              onClick={() => setActiveTab('ingredients')}
              className={`flex-1 py-4 px-6 text-center font-semibold transition-all duration-200 rounded-tl-2xl ${
                activeTab === 'ingredients'
                  ? 'bg-orange-50 text-orange-600 border-b-2 border-orange-600'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              Ingredients
            </button>
            <button
              onClick={() => setActiveTab('instructions')}
              className={`flex-1 py-4 px-6 text-center font-semibold transition-all duration-200 rounded-tr-2xl ${
                activeTab === 'instructions'
                  ? 'bg-orange-50 text-orange-600 border-b-2 border-orange-600'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              Instructions
            </button>
          </div>

          <div className="p-6">
            {activeTab === 'ingredients' ? (
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Ingredients</h3>
                {recipe.ingredients && recipe.ingredients.length > 0 ? (
                  <ul className="space-y-3">
                    {recipe.ingredients.map((ingredient, index) => (
                      <li key={index} className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-orange-600 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-gray-700 leading-relaxed">
                          {typeof ingredient === 'string' 
                            ? ingredient 
                            : `${ingredient.amount} ${ingredient.item}`
                          }
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500 italic">Ingredients list not available for this recipe.</p>
                )}
              </div>
            ) : (
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Instructions</h3>
                {recipe.instructions && Array.isArray(recipe.instructions) && recipe.instructions.length > 0 ? (
                  <ol className="space-y-4">
                    {recipe.instructions.map((instruction, index) => (
                      <li key={index} className="flex items-start space-x-4">
                        <div className="bg-orange-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-1">
                          {index + 1}
                        </div>
                        <p className="text-gray-700 leading-relaxed">
                          {typeof instruction === 'string' ? instruction : JSON.stringify(instruction)}
                        </p>
                      </li>
                    ))}
                  </ol>
                ) : (
                  <div>
                    <p className="text-gray-500 italic mb-4">No instructions found in database.</p>
                    {/* Show fallback instructions for known recipes */}
                    {recipe.id === 1 && recipe.title === "Spaghetti Carbonara" && (
                      <ol className="space-y-4">
                        {[
                          "Bring a large pot of salted water to boil. Cook spaghetti according to package directions until al dente.",
                          "While pasta cooks, heat olive oil in a large skillet over medium heat. Add pancetta and cook until crispy, about 5-7 minutes.",
                          "In a bowl, whisk together eggs, Pecorino Romano, Parmesan, and a generous amount of black pepper.",
                          "Reserve 1 cup of pasta cooking water, then drain the pasta.",
                          "Add the hot pasta to the skillet with pancetta. Remove from heat.",
                          "Quickly pour the egg mixture over the pasta, tossing constantly to create a creamy sauce. Add pasta water as needed.",
                          "Season with salt and additional pepper. Serve immediately with extra cheese."
                        ].map((instruction, index) => (
                          <li key={index} className="flex items-start space-x-4">
                            <div className="bg-orange-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-1">
                              {index + 1}
                            </div>
                            <p className="text-gray-700 leading-relaxed">{instruction}</p>
                          </li>
                        ))}
                      </ol>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button 
            onClick={() => onAddFusionTwist(recipe)}
            className="group bg-gradient-to-r from-orange-600 to-red-600 text-white px-8 py-4 rounded-xl text-lg font-bold shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 inline-flex items-center justify-center space-x-3"
          >
            <Plus className="h-6 w-6 group-hover:rotate-90 transition-transform duration-200" />
            <span>Add Fusion Twist</span>
          </button>
          
          <button 
            onClick={handleSaveRecipe}
            disabled={savingRecipe}
            className={`px-8 py-4 rounded-xl text-lg font-semibold border-2 transition-all duration-300 inline-flex items-center justify-center space-x-3 ${
              isSaved
                ? 'bg-red-50 border-red-200 text-red-600 hover:bg-red-100'
                : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
            } ${savingRecipe ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <Heart className={`h-5 w-5 transition-all duration-200 ${isSaved ? 'fill-current' : ''}`} />
            <span>
              {savingRecipe ? 'Saving...' : (isSaved ? 'Saved' : 'Save Recipe')}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default BaseRecipeDetail;