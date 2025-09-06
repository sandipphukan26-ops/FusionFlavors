import React, { useState } from 'react';
import { ArrowLeft, ChefHat, Clock, Plus, Minus, Share, Heart, Utensils } from 'lucide-react';
import { savedRecipesApi } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';

interface FusionVariantsProps {
  baseRecipe: any;
  onBack: () => void;
  selectedCuisine: string;
  onCookFusion: (variant: string) => void;
}

interface VariantData {
  id: string;
  title: string;
  description: string;
  timeChange: string;
  ingredientSwaps: string[];
  stepHighlights: string[];
  expanded: boolean;
}

const FusionVariants: React.FC<FusionVariantsProps> = ({ baseRecipe, onBack, selectedCuisine, onCookFusion }) => {
  const { user } = useAuth();
  const [variants, setVariants] = useState<VariantData[]>([
    {
      id: 'subtle',
      title: 'Subtle Twist',
      description: 'A gentle fusion that maintains the classic carbonara base while adding subtle Japanese flavors.',
      timeChange: '+3 min',
      ingredientSwaps: [
        'Add 2 tbsp miso paste to the egg mixture',
        'Replace pancetta with thinly sliced shiitake mushrooms',
        'Garnish with nori flakes and sesame seeds'
      ],
      stepHighlights: [
        'Sauté shiitake mushrooms until golden and crispy',
        'Whisk miso paste into the egg and cheese mixture',
        'Finish with a sprinkle of toasted sesame seeds'
      ],
      expanded: false
    },
    {
      id: 'balanced',
      title: 'Balanced Twist',
      description: 'Perfect harmony between Italian and Japanese cuisines with complementary flavors and techniques.',
      timeChange: '+7 min',
      ingredientSwaps: [
        'Use udon noodles instead of spaghetti',
        'Add dashi powder to the cooking water',
        'Include edamame and cherry tomatoes',
        'Finish with Japanese mayo drizzle'
      ],
      stepHighlights: [
        'Cook udon noodles in dashi-infused water',
        'Blanch edamame and halve cherry tomatoes',
        'Create a creamy sauce with traditional carbonara technique',
        'Plate with artistic Japanese mayo drizzle'
      ],
      expanded: false
    },
    {
      id: 'bold',
      title: 'Bold Twist',
      description: 'An adventurous fusion that completely reimagines carbonara with bold Japanese flavors and presentation.',
      timeChange: '+12 min',
      ingredientSwaps: [
        'Replace pasta with fresh ramen noodles',
        'Use Japanese chashu pork instead of pancetta',
        'Add soft-boiled ajitsuke egg on top',
        'Include wakame seaweed and bamboo shoots',
        'Finish with spicy miso tare'
      ],
      stepHighlights: [
        'Prepare ajitsuke eggs 24 hours in advance',
        'Slow-cook chashu pork until tender',
        'Make spicy miso tare with garlic and chili oil',
        'Assemble ramen-style with traditional toppings',
        'Serve in authentic Japanese ramen bowls'
      ],
      expanded: false
    }
  ]);

  const [savedRecipes, setSavedRecipes] = useState<Set<string>>(new Set());
  const [savingRecipes, setSavingRecipes] = useState<Set<string>>(new Set());

  const handleShareRecipe = (variantId: string, title: string) => {
    // Create a specific URL for this fusion recipe
    const baseUrl = window.location.origin;
    const recipeUrl = `${baseUrl}?recipe=${encodeURIComponent(baseRecipe?.title || 'recipe')}&cuisine=${encodeURIComponent(selectedCuisine)}&variant=${encodeURIComponent(variantId)}`;
    const shareText = `Check out this amazing ${selectedCuisine}-${baseRecipe?.cuisine || 'Fusion'} fusion recipe: ${title}!\n\n🍽️ Base: ${baseRecipe?.title || 'Selected Recipe'}\n🌍 Fusion: ${selectedCuisine} cuisine\n✨ Style: ${title}\n\nTry it yourself:`;
    
    // Check if Web Share API is supported
    if (navigator.share) {
      navigator.share({
        title: `${title} - FusionFlavors`,
        text: shareText,
        url: recipeUrl,
      }).catch((error) => {
        console.log('Error sharing:', error);
        fallbackShare(shareText, recipeUrl);
      });
    } else {
      fallbackShare(shareText, recipeUrl);
    }
  };

  const fallbackShare = (text: string, url: string) => {
    // Copy to clipboard as fallback
    const shareContent = `${text}\n\n${url}`;
    
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareContent).then(() => {
        alert('Recipe link copied to clipboard! You can now paste it anywhere to share.');
      }).catch(() => {
        // Final fallback - show share options
        showShareOptions(text, url);
      });
    } else {
      showShareOptions(text, url);
    }
  };

  const showShareOptions = (text: string, url: string) => {
    const encodedText = encodeURIComponent(text);
    const encodedUrl = encodeURIComponent(url);
    
    const shareOptions = [
      {
        name: 'WhatsApp',
        url: `https://wa.me/?text=${encodedText}%20${encodedUrl}`,
      },
      {
        name: 'Twitter',
        url: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`,
      },
      {
        name: 'Facebook',
        url: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      },
      {
        name: 'Email',
        url: `mailto:?subject=${encodeURIComponent('Amazing Fusion Recipe!')}&body=${encodedText}%20${encodedUrl}`,
      }
    ];
    
    const shareMessage = `Share this recipe:\n\n${shareOptions.map((option, index) => 
      `${index + 1}. ${option.name}: Click to open`
    ).join('\n')}`;
    
    if (confirm(`${shareMessage}\n\nClick OK to open sharing options, or Cancel to copy the link manually.`)) {
      // Open the first sharing option (WhatsApp) as default
      window.open(shareOptions[0].url, '_blank');
    } else {
      // Manual copy fallback
      prompt('Copy this link to share the recipe:', `${text}\n\n${url}`);
    }
  };

  const toggleExpanded = (variantId: string) => {
    setVariants(prev => prev.map(variant => 
      variant.id === variantId 
        ? { ...variant, expanded: !variant.expanded }
        : variant
    ));
  };

  const handleSaveRecipe = async (variantId: string) => {
    if (!user) {
      alert('Please sign in to save recipes');
      return;
    }

    if (!baseRecipe) return;

    setSavingRecipes(prev => new Set([...prev, variantId]));
    
    try {
      const isCurrentlySaved = savedRecipes.has(variantId);
      
      if (isCurrentlySaved) {
        // For fusion variants, we'll use the base recipe ID
        // In a real app, you might want to create fusion recipe entries
        await savedRecipesApi.unsaveRecipe(baseRecipe.id);
        setSavedRecipes(prev => {
          const newSet = new Set(prev);
          newSet.delete(variantId);
          return newSet;
        });
      } else {
        // Save the base recipe (fusion variants would need their own recipe entries)
        await savedRecipesApi.saveRecipe(baseRecipe.id);
        setSavedRecipes(prev => new Set([...prev, variantId]));
      }
    } catch (error: any) {
      console.error('Error saving/unsaving recipe:', error);
      if (error.message?.includes('not authenticated')) {
        alert('Please sign in to save recipes');
      } else {
        alert('Failed to save recipe. Please try again.');
      }
    } finally {
      setSavingRecipes(prev => {
        const newSet = new Set(prev);
        newSet.delete(variantId);
        return newSet;
      });
    }
  };

  const getVariantColor = (variantId: string) => {
    switch (variantId) {
      case 'subtle': return 'from-green-500 to-emerald-500';
      case 'balanced': return 'from-orange-500 to-amber-500';
      case 'bold': return 'from-red-500 to-rose-500';
      default: return 'from-gray-500 to-slate-500';
    }
  };

  const getVariantBorder = (variantId: string) => {
    switch (variantId) {
      case 'subtle': return 'border-green-200 hover:border-green-300';
      case 'balanced': return 'border-orange-200 hover:border-orange-300';
      case 'bold': return 'border-red-200 hover:border-red-300';
      default: return 'border-gray-200 hover:border-gray-300';
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
                <span>Back to Cuisine Picker</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Your Fusion Options
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            We've created three fusion twists for your <span className="font-semibold text-orange-600">{baseRecipe?.title || 'selected recipe'}</span> with <span className="font-semibold text-orange-600">{selectedCuisine}</span> cuisine.
          </p>
        </div>

        {/* Fusion Variants */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {variants.map((variant) => (
            <div
              key={variant.id}
              className={`bg-white rounded-2xl shadow-sm border-2 ${getVariantBorder(variant.id)} transition-all duration-300 hover:shadow-lg`}
            >
              {/* Card Header */}
              <div className="p-6 border-b border-gray-100">
                <div className={`inline-flex items-center px-3 py-1 rounded-full bg-gradient-to-r ${getVariantColor(variant.id)} text-white text-sm font-semibold mb-3`}>
                  {variant.title}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {selectedCuisine}-{baseRecipe?.cuisine || 'Fusion'} {baseRecipe?.title || 'Recipe'}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed mb-3">
                  {variant.description}
                </p>
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600">Original time {variant.timeChange}</span>
                </div>
              </div>

              {/* Ingredient Swaps */}
              <div className="p-6 border-b border-gray-100">
                <h4 className="font-semibold text-gray-900 mb-3">Key Changes:</h4>
                <ul className="space-y-2">
                  {variant.ingredientSwaps.map((swap, index) => (
                    <li key={index} className="flex items-start space-x-2 text-sm">
                      <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-gray-700">{swap}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Step Highlights */}
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-gray-900">Modified Steps:</h4>
                  <button
                    onClick={() => toggleExpanded(variant.id)}
                    className="flex items-center space-x-1 text-orange-600 hover:text-orange-700 text-sm font-medium transition-colors duration-200"
                  >
                    <span>{variant.expanded ? 'Collapse' : 'Expand'}</span>
                    {variant.expanded ? (
                      <Minus className="h-4 w-4" />
                    ) : (
                      <Plus className="h-4 w-4" />
                    )}
                  </button>
                </div>
                
                {variant.expanded && (
                  <ol className="space-y-2">
                    {variant.stepHighlights.map((step, index) => (
                      <li key={index} className="flex items-start space-x-3 text-sm">
                        <div className="bg-orange-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                          {index + 1}
                        </div>
                        <span className="text-gray-700">{step}</span>
                      </li>
                    ))}
                  </ol>
                )}
              </div>

              {/* Action Buttons */}
              <div className="p-6">
                <div className="flex flex-col space-y-3">
                  <button 
                    onClick={() => handleSaveRecipe(variant.id)}
                    disabled={savingRecipes.has(variant.id)}
                    className={`w-full py-3 px-4 rounded-xl font-semibold transition-all duration-200 inline-flex items-center justify-center space-x-2 ${
                      savedRecipes.has(variant.id)
                        ? 'bg-red-50 border-2 border-red-200 text-red-600 hover:bg-red-100'
                        : 'bg-orange-600 text-white hover:bg-orange-700 shadow-md hover:shadow-lg'
                    } ${savingRecipes.has(variant.id) ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <Heart className={`h-5 w-5 ${savedRecipes.has(variant.id) ? 'fill-current' : ''}`} />
                    <span>
                      {savingRecipes.has(variant.id) ? 'Saving...' : (savedRecipes.has(variant.id) ? 'Saved' : 'Save Recipe')}
                    </span>
                  </button>
                  
                  <button 
                    onClick={() => handleShareRecipe(variant.id, variant.title)}
                    className="w-full py-3 px-4 rounded-xl font-semibold border-2 border-gray-200 text-gray-600 hover:border-green-300 hover:bg-green-50 hover:text-green-600 transition-all duration-200 inline-flex items-center justify-center space-x-2"
                  >
                    <Share className="h-5 w-5" />
                    <span>Share Recipe</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Cook This Fusion Button */}
        <div className="text-center">
          <button 
            onClick={() => onCookFusion('Balanced')}
            className="bg-gradient-to-r from-orange-600 to-red-600 text-white px-12 py-4 rounded-xl text-xl font-bold shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 inline-flex items-center space-x-3"
          >
            <Utensils className="h-6 w-6" />
            <span>Cook This Fusion</span>
          </button>
          <p className="mt-4 text-gray-500 text-sm">
            Interactive step-by-step cooking guide
          </p>
        </div>
      </div>
    </div>
  );
};

export default FusionVariants;