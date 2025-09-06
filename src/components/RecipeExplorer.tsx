import React, { useState, useEffect } from 'react';
import { Search, Clock, ChefHat, ArrowLeft, Filter } from 'lucide-react';
import { recipesApi, Recipe, supabase } from '../lib/supabase';

interface RecipeExplorerProps {
  onRecipeClick: (recipeId: number) => void;
  onBackToHome: () => void;
}

// Fallback recipes in case Supabase is not available
const fallbackRecipes: Recipe[] = [
  {
    id: 1,
    title: "Spaghetti Carbonara",
    cuisine: "Italian",
    prep_time: "25 min",
    difficulty: "Medium",
    image_url: "https://images.pexels.com/photos/1279330/pexels-photo-1279330.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
    servings: 4,
    ingredients: ["400g spaghetti pasta", "200g pancetta or guanciale, diced", "4 large eggs", "100g Pecorino Romano cheese, grated", "50g Parmesan cheese, grated", "2 cloves garlic, minced", "Freshly ground black pepper", "Salt to taste", "2 tablespoons olive oil"],
    instructions: ["Bring a large pot of salted water to boil. Cook spaghetti according to package directions until al dente.", "While pasta cooks, heat olive oil in a large skillet over medium heat. Add pancetta and cook until crispy, about 5-7 minutes.", "In a bowl, whisk together eggs, Pecorino Romano, Parmesan, and a generous amount of black pepper.", "Reserve 1 cup of pasta cooking water, then drain the pasta.", "Add the hot pasta to the skillet with pancetta. Remove from heat.", "Quickly pour the egg mixture over the pasta, tossing constantly to create a creamy sauce. Add pasta water as needed.", "Season with salt and additional pepper. Serve immediately with extra cheese."]
  },
  {
    id: 2,
    title: "Chicken Teriyaki",
    cuisine: "Japanese",
    prep_time: "30 min",
    difficulty: "Easy",
    image_url: "https://images.pexels.com/photos/2338407/pexels-photo-2338407.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
    servings: 4,
    ingredients: ["4 chicken thighs", "1/4 cup soy sauce", "2 tbsp mirin", "2 tbsp sake", "2 tbsp sugar", "1 tbsp vegetable oil", "2 green onions, sliced", "1 tsp sesame seeds"],
    instructions: ["Mix soy sauce, mirin, sake, and sugar to make teriyaki sauce.", "Heat oil in a pan and cook chicken skin-side down until golden.", "Flip chicken and cook until done.", "Add teriyaki sauce and simmer until glossy.", "Garnish with green onions and sesame seeds."]
  },
  {
    id: 3,
    title: "Beef Bourguignon",
    cuisine: "French",
    prep_time: "45 min",
    difficulty: "Hard",
    image_url: "https://images.pexels.com/photos/4518843/pexels-photo-4518843.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
    servings: 6,
    ingredients: ["2 lbs beef chuck, cubed", "6 strips bacon", "1 onion, diced", "2 carrots, sliced", "3 cloves garlic", "3 tbsp tomato paste", "1 bottle red wine", "2 cups beef broth", "2 bay leaves", "Fresh thyme", "8 oz mushrooms", "Pearl onions"],
    instructions: ["Cook bacon until crispy, remove and set aside.", "Brown beef cubes in bacon fat.", "Add onions, carrots, and garlic, cook until soft.", "Add tomato paste and cook 1 minute.", "Add wine and broth, bring to simmer.", "Add herbs and simmer 2 hours until tender.", "Add mushrooms and pearl onions in last 30 minutes."]
  },
  {
    id: 4,
    title: "Pad Thai",
    cuisine: "Thai",
    prep_time: "20 min",
    difficulty: "Medium",
    image_url: "https://images.pexels.com/photos/4518843/pexels-photo-4518843.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
    servings: 2,
    ingredients: ["8 oz rice noodles", "2 tbsp tamarind paste", "2 tbsp fish sauce", "2 tbsp palm sugar", "2 eggs", "1 cup bean sprouts", "3 green onions", "1/4 cup peanuts", "Lime wedges", "2 tbsp vegetable oil"],
    instructions: ["Soak rice noodles in warm water until soft.", "Mix tamarind paste, fish sauce, and palm sugar for sauce.", "Heat oil in wok, scramble eggs.", "Add drained noodles and sauce, toss to combine.", "Add bean sprouts and green onions.", "Serve with peanuts and lime wedges."]
  },
  {
    id: 5,
    title: "Kung Pao Chicken",
    cuisine: "Chinese",
    prep_time: "25 min",
    difficulty: "Medium",
    image_url: "https://images.pexels.com/photos/5410400/pexels-photo-5410400.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
    servings: 4,
    ingredients: ["1 lb chicken breast, cubed", "1/2 cup peanuts", "3 dried chilies", "2 tbsp soy sauce", "1 tbsp rice wine", "1 tsp cornstarch", "2 tbsp vegetable oil", "2 cloves garlic", "1 inch ginger", "2 green onions"],
    instructions: ["Marinate chicken with soy sauce, rice wine, and cornstarch.", "Heat oil in wok, stir-fry chicken until cooked.", "Add garlic, ginger, and dried chilies.", "Add peanuts and green onions.", "Toss everything together and serve hot."]
  },
  {
    id: 6,
    title: "Açaí Bowl",
    cuisine: "Brazilian",
    prep_time: "10 min",
    difficulty: "Easy",
    image_url: "https://images.pexels.com/photos/1092730/pexels-photo-1092730.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
    servings: 2,
    ingredients: ["2 açaí packets", "1 banana", "1/2 cup blueberries", "1/4 cup granola", "2 tbsp coconut flakes", "1 tbsp honey", "1/4 cup almond milk"],
    instructions: ["Blend açaí packets with half banana and almond milk.", "Pour into bowl.", "Top with sliced banana, blueberries, granola.", "Sprinkle with coconut flakes and drizzle honey.", "Serve immediately."]
  },
  {
    id: 7,
    title: "Bibimbap",
    cuisine: "Korean",
    prep_time: "45 min",
    difficulty: "Medium",
    image_url: "https://images.pexels.com/photos/4518843/pexels-photo-4518843.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
    servings: 4,
    ingredients: ["2 cups cooked rice", "1 lb beef bulgogi", "1 cup spinach", "1 cup bean sprouts", "1 carrot, julienned", "4 shiitake mushrooms", "4 eggs", "Gochujang sauce", "Sesame oil", "Garlic"],
    instructions: ["Prepare and season each vegetable separately.", "Cook beef bulgogi until tender.", "Fry eggs sunny-side up.", "Arrange rice in bowls.", "Top with vegetables, beef, and egg.", "Serve with gochujang sauce."]
  },
  {
    id: 8,
    title: "Butter Croissant",
    cuisine: "French",
    prep_time: "180 min",
    difficulty: "Hard",
    image_url: "https://images.pexels.com/photos/2135/food-france-morning-breakfast.jpg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
    servings: 8,
    ingredients: ["3 cups bread flour", "1/4 cup sugar", "1 tsp salt", "1 packet active dry yeast", "1 cup warm milk", "1 cup cold butter", "1 egg for wash"],
    instructions: ["Make dough with flour, sugar, salt, yeast, and milk.", "Chill dough for 1 hour.", "Roll out butter into rectangle.", "Encase butter in dough and fold.", "Repeat folding process 3 times with chilling.", "Roll out and cut into triangles.", "Shape into croissants and proof.", "Brush with egg wash and bake until golden."]
  },
  {
    id: 9,
    title: "Chicken Tikka",
    cuisine: "Indian",
    prep_time: "50 min",
    difficulty: "Medium",
    image_url: "https://images.pexels.com/photos/5410400/pexels-photo-5410400.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
    servings: 4,
    ingredients: ["2 lbs chicken breast, cubed", "1 cup yogurt", "2 tbsp lemon juice", "2 tsp garam masala", "1 tsp turmeric", "1 tsp cumin", "3 cloves garlic", "1 inch ginger", "2 tbsp vegetable oil"],
    instructions: ["Mix yogurt with all spices, garlic, and ginger.", "Marinate chicken for at least 30 minutes.", "Thread chicken onto skewers.", "Grill or broil until cooked through.", "Serve with naan and chutney."]
  }
];
const RecipeExplorer: React.FC<RecipeExplorerProps> = ({ onRecipeClick, onBackToHome }) => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCuisine, setSelectedCuisine] = useState('');
  const [selectedPrepTime, setSelectedPrepTime] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('');

  // Fetch recipes on component mount
  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        setLoading(true);
        
        // Check if Supabase is available
        if (!supabase) {
          console.warn('Supabase not configured, using fallback data');
          setRecipes(fallbackRecipes);
          setError(null);
          setLoading(false);
          return;
        }

        // Try to fetch from Supabase
        const data = await recipesApi.getAll();
        
        if (data && data.length > 0) {
          setRecipes(data);
        } else {
          console.warn('No recipes found in database, using fallback data');
          setRecipes(fallbackRecipes);
        }
        setError(null);
      } catch (err) {
        console.warn('Failed to fetch recipes from Supabase, using fallback data:', err);
        setRecipes(fallbackRecipes);
        setError(null);
      } finally {
        setLoading(false);
      }
    };

    fetchRecipes();
  }, []);

  // Handle search
  useEffect(() => {
    const handleSearch = async () => {
      if (!searchTerm.trim() || !supabase) {
        // If no search term or no Supabase, use current recipes
        return;
      }

      try {
        const data = await recipesApi.search(searchTerm);
        if (data && data.length > 0) {
          setRecipes(data);
        } else {
          // If no results, filter fallback recipes
          const filtered = fallbackRecipes.filter(recipe => 
            recipe.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            recipe.cuisine.toLowerCase().includes(searchTerm.toLowerCase())
          );
          setRecipes(filtered);
        }
      } catch (err) {
        console.warn('Search failed, filtering fallback data:', err);
        const filtered = fallbackRecipes.filter(recipe => 
          recipe.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          recipe.cuisine.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setRecipes(filtered);
      }
    };

    if (!searchTerm.trim()) {
      // Reset to all recipes when search is cleared
      const resetRecipes = async () => {
        try {
          if (supabase) {
            const data = await recipesApi.getAll();
            if (data && data.length > 0) {
              setRecipes(data);
            } else {
              setRecipes(fallbackRecipes);
            }
          } else {
            setRecipes(fallbackRecipes);
          }
        } catch (err) {
          setRecipes(fallbackRecipes);
        }
      };
      resetRecipes();
    } else {
      const debounceTimer = setTimeout(handleSearch, 300);
      return () => clearTimeout(debounceTimer);
    };
  }, [searchTerm]);

  const filteredRecipes = recipes.filter(recipe => {
    const matchesCuisine = !selectedCuisine || recipe.cuisine.includes(selectedCuisine);
    const matchesPrepTime = !selectedPrepTime || 
      (selectedPrepTime === 'Quick' && parseInt(recipe.prep_time) <= 20) ||
      (selectedPrepTime === 'Medium' && parseInt(recipe.prep_time) > 20 && parseInt(recipe.prep_time) <= 40) ||
      (selectedPrepTime === 'Long' && parseInt(recipe.prep_time) > 40);
    const matchesDifficulty = !selectedDifficulty || recipe.difficulty === selectedDifficulty;
    
    return matchesCuisine && matchesPrepTime && matchesDifficulty;
  });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'bg-green-100 text-green-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'Hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

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
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Recipe Explorer
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Discover amazing fusion recipes from around the world
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search base recipe..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 text-lg border border-gray-200 rounded-2xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all duration-200 bg-white shadow-sm"
            />
          </div>
        </div>

        {/* Filters */}
        <div className="mb-12">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center space-x-2 mb-4">
              <Filter className="h-5 w-5 text-gray-600" />
              <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Cuisine Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cuisine Type
                </label>
                <select
                  value={selectedCuisine}
                  onChange={(e) => setSelectedCuisine(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all duration-200 bg-white"
                >
                  <option value="">All Cuisines</option>
                  <option value="Italian">Italian</option>
                  <option value="Japanese">Japanese</option>
                  <option value="French">French</option>
                  <option value="Thai">Thai</option>
                  <option value="Chinese">Chinese</option>
                  <option value="Brazilian">Brazilian</option>
                </select>
              </div>

              {/* Prep Time */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Prep Time
                </label>
                <select
                  value={selectedPrepTime}
                  onChange={(e) => setSelectedPrepTime(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all duration-200 bg-white"
                >
                  <option value="">Any Time</option>
                  <option value="Quick">Quick (≤20 min)</option>
                  <option value="Medium">Medium (21-40 min)</option>
                  <option value="Long">Long (40+ min)</option>
                </select>
              </div>

              {/* Difficulty */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Difficulty
                </label>
                <select
                  value={selectedDifficulty}
                  onChange={(e) => setSelectedDifficulty(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all duration-200 bg-white"
                >
                  <option value="">All Levels</option>
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Recipe Grid */}
        {loading ? (
          <div className="text-center py-16">
            <ChefHat className="h-16 w-16 text-orange-300 mx-auto mb-4 animate-spin" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              Loading recipes...
            </h3>
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <ChefHat className="h-16 w-16 text-red-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-red-600 mb-2">
              {error}
            </h3>
            <button 
              onClick={() => window.location.reload()}
              className="mt-4 px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors duration-200"
            >
              Try Again
            </button>
          </div>
        ) : filteredRecipes.length === 0 && !loading ? (
          <div className="text-center py-16">
            <ChefHat className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              No recipes found
            </h3>
            <p className="text-gray-500">
              Try adjusting your search or filter criteria
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredRecipes.map((recipe) => (
            <div
              key={recipe.id}
              className="group bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl hover:border-orange-200 transform hover:-translate-y-2 transition-all duration-300"
            >
              {/* Recipe Image */}
              <div className="relative overflow-hidden">
                <img
                  src={recipe.image_url}
                  alt={recipe.title}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-3 right-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getDifficultyColor(recipe.difficulty)}`}>
                    {recipe.difficulty}
                  </span>
                </div>
              </div>

              {/* Recipe Content */}
              <div className="p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-orange-600 transition-colors duration-200">
                  {recipe.title}
                </h3>
                
                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-4">
                  <div className="flex items-center space-x-1 text-sm text-gray-600">
                    <Clock className="h-4 w-4" />
                    <span>{recipe.prep_time}</span>
                  </div>
                  <span className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full font-medium">
                    {recipe.cuisine}
                  </span>
                  {recipe.difficulty && (
                    <span
                      className={`px-2 py-1 text-xs rounded-full font-medium ${getDifficultyColor(recipe.difficulty)}`}
                    >
                      {recipe.difficulty}
                    </span>
                  )}
                </div>

                {/* View Recipe Button */}
                <button 
                  onClick={() => onRecipeClick(recipe.id)}
                  className="w-full py-3 rounded-xl font-semibold transition-all duration-200 shadow-md bg-gradient-to-r from-orange-600 to-red-600 text-white hover:from-orange-700 hover:to-red-700 transform hover:scale-105 hover:shadow-lg cursor-pointer"
                >
                  View Recipe
                </button>
              </div>
            </div>
          ))}
        </div>
        )}

      </div>
    </div>
  );
};

export default RecipeExplorer;