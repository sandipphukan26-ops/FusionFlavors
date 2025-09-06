import React, { useState } from 'react';
import { ArrowLeft, ChefHat, Clock, Users, Heart, Utensils, Share, Globe } from 'lucide-react';

interface SharedRecipeViewProps {
  recipeData: {
    recipeId: string;
    cuisine: string;
    variant: string;
  };
  onBackToHome: () => void;
  onCookRecipe: () => void;
}

const SharedRecipeView: React.FC<SharedRecipeViewProps> = ({ recipeData, onBackToHome, onCookRecipe }) => {
  const [isSaved, setIsSaved] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Get recipe details based on variant
  const getRecipeDetails = () => {
    const baseRecipe = {
      title: "Spaghetti Carbonara",
      // Using Unsplash which is more reliable for web display
      image: "https://images.unsplash.com/photo-1551892374-ecf8129d1475?w=800&h=600&fit=crop&crop=center&auto=format&q=80",
      // Fallback image in case the primary fails
      fallbackImage: "https://images.unsplash.com/photo-1563379091339-03246963d51a?w=800&h=600&fit=crop&crop=center&auto=format&q=80",
      baseCuisine: "Italian",
      servings: 4
    };

    const variantDetails = {
      subtle: {
        title: "Subtle Twist",
        description: "A gentle fusion that maintains the classic carbonara base while adding subtle flavors.",
        prepTime: "28 min",
        difficulty: "Medium",
        ingredients: [
          "400g spaghetti pasta",
          "200g shiitake mushrooms, sliced thin",
          "4 large eggs",
          "100g Pecorino Romano cheese, grated",
          "50g Parmesan cheese, grated",
          "2 tbsp miso paste",
          "2 tbsp olive oil",
          "Freshly ground black pepper",
          "Nori flakes for garnish",
          "Sesame seeds for garnish"
        ],
        keyChanges: [
          "Replace pancetta with shiitake mushrooms",
          "Add miso paste to egg mixture",
          "Garnish with nori flakes and sesame seeds"
        ]
      },
      balanced: {
        title: "Balanced Twist",
        description: "Perfect harmony between Italian and fusion cuisines with complementary flavors and techniques.",
        prepTime: "32 min",
        difficulty: "Medium",
        ingredients: [
          "400g udon noodles",
          "200g shiitake mushrooms",
          "4 large eggs",
          "100g Pecorino Romano cheese",
          "2 tbsp miso paste",
          "1 cup edamame, shelled",
          "200g cherry tomatoes, halved",
          "Japanese mayo for drizzle",
          "Dashi powder",
          "Sesame oil"
        ],
        keyChanges: [
          "Use udon noodles instead of spaghetti",
          "Add dashi powder to cooking water",
          "Include edamame and cherry tomatoes",
          "Finish with Japanese mayo drizzle"
        ]
      },
      bold: {
        title: "Bold Twist",
        description: "An adventurous fusion that completely reimagines carbonara with bold flavors and presentation.",
        prepTime: "37 min",
        difficulty: "Hard",
        ingredients: [
          "400g fresh ramen noodles",
          "300g chashu pork, sliced",
          "4 ajitsuke eggs (marinated soft-boiled)",
          "100g Pecorino Romano cheese",
          "3 tbsp spicy miso tare",
          "Wakame seaweed",
          "Bamboo shoots",
          "Green onions, sliced",
          "Nori sheets",
          "Chili oil"
        ],
        keyChanges: [
          "Replace pasta with fresh ramen noodles",
          "Use chashu pork instead of pancetta",
          "Add ajitsuke eggs on top",
          "Include wakame seaweed and bamboo shoots",
          "Finish with spicy miso tare"
        ]
      }
    };

    const variant = variantDetails[recipeData.variant as keyof typeof variantDetails] || variantDetails.balanced;
    
    return {
      ...baseRecipe,
      fusionTitle: `${recipeData.cuisine}-Italian Carbonara`,
      ...variant
    };
  };

  const recipe = getRecipeDetails();

  const handleSaveRecipe = () => {
    setIsSaved(!isSaved);
  };

  const handleShareRecipe = () => {
    const shareText = `Check out this amazing ${recipeData.cuisine}-Italian fusion recipe: ${recipe.title}!`;
    const shareUrl = window.location.href;
    
    if (navigator.share) {
      navigator.share({
        title: `${recipe.fusionTitle} - FusionFlavors`,
        text: shareText,
        url: shareUrl,
      }).catch(console.error);
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(`${shareText}\n\n${shareUrl}`).then(() => {
        alert('Recipe link copied to clipboard!');
      });
    }
  };

  const handleImageError = () => {
    setImageError(true);
  };

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

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Recipe Image */}
        <div className="relative mb-8">
          {!imageError ? (
            <img
              src={recipe.image}
              alt={recipe.fusionTitle}
              className="w-full h-80 lg:h-96 object-cover rounded-2xl shadow-lg"
              onError={handleImageError}
              loading="lazy"
            />
          ) : (
            <img
              src={recipe.fallbackImage}
              alt={recipe.fusionTitle}
              className="w-full h-80 lg:h-96 object-cover rounded-2xl shadow-lg"
              onError={() => {
                // If both images fail, show a placeholder
                const event = arguments[0] as any;
                event.target.style.display = 'none';
                event.target.nextElementSibling.style.display = 'flex';
              }}
              loading="lazy"
            />
          )}
          
          {/* Fallback placeholder if all images fail */}
          <div 
            className="hidden w-full h-80 lg:h-96 bg-gradient-to-br from-orange-200 to-red-200 rounded-2xl shadow-lg items-center justify-center"
          >
            <div className="text-center">
              <ChefHat className="h-16 w-16 text-orange-600 mx-auto mb-4" />
              <p className="text-orange-800 font-semibold text-lg">{recipe.fusionTitle}</p>
              <p className="text-orange-600 text-sm mt-2">Recipe Image</p>
            </div>
          </div>

          <div className="absolute top-4 right-4 flex space-x-2">
            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getDifficultyColor(recipe.difficulty)}`}>
              {recipe.difficulty}
            </span>
            <span className="px-3 py-1 rounded-full text-sm font-semibold bg-gradient-to-r from-purple-500 to-pink-500 text-white">
              Fusion Recipe
            </span>
          </div>
        </div>

        {/* Recipe Title */}
        <div className="text-center mb-8">
          <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            {recipe.fusionTitle}
          </h1>
          <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-full text-lg font-semibold mb-4">
            <Globe className="h-5 w-5 mr-2" />
            {recipe.title}: {recipeData.cuisine} + Italian
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {recipe.description}
          </p>
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
                <p className="font-semibold text-gray-900">{recipe.prepTime}</p>
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
                <p className="text-sm text-gray-500">Fusion Style</p>
                <p className="font-semibold text-gray-900">{recipe.title}</p>
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

        {/* Key Changes Section */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-8">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Fusion Elements</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Key Changes:</h4>
              <ul className="space-y-2">
                {recipe.keyChanges.map((change, index) => (
                  <li key={index} className="flex items-start space-x-2 text-sm">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-gray-700">{change}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Ingredients:</h4>
              <ul className="space-y-1 max-h-32 overflow-y-auto">
                {recipe.ingredients.slice(0, 5).map((ingredient, index) => (
                  <li key={index} className="text-sm text-gray-600">
                    • {ingredient}
                  </li>
                ))}
                {recipe.ingredients.length > 5 && (
                  <li className="text-sm text-gray-500 italic">
                    + {recipe.ingredients.length - 5} more ingredients...
                  </li>
                )}
              </ul>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button 
            onClick={onCookRecipe}
            className="group bg-gradient-to-r from-orange-600 to-red-600 text-white px-8 py-4 rounded-xl text-lg font-bold shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 inline-flex items-center justify-center space-x-3"
          >
            <Utensils className="h-6 w-6" />
            <span>Cook This Recipe</span>
          </button>
          
          <button 
            onClick={handleSaveRecipe}
            className={`px-8 py-4 rounded-xl text-lg font-semibold border-2 transition-all duration-300 inline-flex items-center justify-center space-x-3 ${
              isSaved
                ? 'bg-red-50 border-red-200 text-red-600 hover:bg-red-100'
                : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
            }`}
          >
            <Heart className={`h-5 w-5 transition-all duration-200 ${isSaved ? 'fill-current' : ''}`} />
            <span>{isSaved ? 'Saved' : 'Save Recipe'}</span>
          </button>

          <button 
            onClick={handleShareRecipe}
            className="px-8 py-4 rounded-xl text-lg font-semibold border-2 border-green-200 text-green-600 hover:border-green-300 hover:bg-green-50 transition-all duration-300 inline-flex items-center justify-center space-x-3"
          >
            <Share className="h-5 w-5" />
            <span>Share Recipe</span>
          </button>
        </div>
      </div>
    </div>
  );
};

// Demo component with sample data
const App = () => {
  const [showRecipe, setShowRecipe] = useState(true);

  const sampleRecipeData = {
    recipeId: "carbonara-fusion-1",
    cuisine: "Japanese",
    variant: "balanced"
  };

  if (showRecipe) {
    return (
      <SharedRecipeView
        recipeData={sampleRecipeData}
        onBackToHome={() => setShowRecipe(false)}
        onCookRecipe={() => alert('Starting cooking mode!')}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center">
      <div className="text-center">
        <ChefHat className="h-16 w-16 text-orange-600 mx-auto mb-4" />
        <h1 className="text-3xl font-bold text-gray-900 mb-4">FusionFlavors</h1>
        <button
          onClick={() => setShowRecipe(true)}
          className="bg-gradient-to-r from-orange-600 to-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all duration-200"
        >
          View Sample Recipe
        </button>
      </div>
    </div>
  );
};

export default App;