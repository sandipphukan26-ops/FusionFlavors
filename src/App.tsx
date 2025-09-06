import React, { useState } from 'react';
import { ChefHat, BookOpen, Heart, ArrowRight } from 'lucide-react';
import { useAuth } from './hooks/useAuth';
import SignInModal from './components/SignInModal';
import UserProfile from './components/UserProfile';
import SavedRecipes from './components/SavedRecipes';
import RecipeExplorer from './components/RecipeExplorer';
import BaseRecipeDetail from './components/BaseRecipeDetail';
import FusionCuisinePicker from './components/FusionCuisinePicker';
import FusionVariants from './components/FusionVariants';
import GuidedCookMode from './components/GuidedCookMode';
import SharedRecipeView from './components/SharedRecipeView';

function App() {
  const { user, loading } = useAuth();
  const [currentPage, setCurrentPage] = useState<'home' | 'explorer' | 'recipe-detail' | 'fusion-picker' | 'fusion-variants' | 'saved-recipes' | 'guided-cook' | 'shared-recipe'>('home');
  const [selectedCuisine, setSelectedCuisine] = useState('');
  const [selectedVariant, setSelectedVariant] = useState('');
  const [selectedRecipeId, setSelectedRecipeId] = useState<number | null>(null);
  const [selectedRecipe, setSelectedRecipe] = useState<any>(null);
  const [sharedRecipeData, setSharedRecipeData] = useState<any>(null);
  const [showSignInModal, setShowSignInModal] = useState(false);
  const [showUserProfile, setShowUserProfile] = useState(false);

  // Handle URL parameters for shared recipes
  React.useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const recipeId = urlParams.get('recipe');
    const cuisine = urlParams.get('cuisine');
    const variant = urlParams.get('variant');
    
    if (recipeId && cuisine && variant) {
      setSharedRecipeData({ recipeId, cuisine, variant });
      setSelectedCuisine(cuisine);
      setSelectedVariant(variant);
      setCurrentPage('shared-recipe');
    }
  }, []);

  const handleSignInSuccess = () => {
    setShowSignInModal(false);
  };

  const handleSignOut = () => {
    setShowUserProfile(false);
  };

  const handleSavedRecipesClick = () => {
    if (user) {
      setCurrentPage('saved-recipes');
    } else {
      setShowSignInModal(true);
    }
  };

  const handleViewRecipeFromSaved = (recipeId: string) => {
    const numericRecipeId = parseInt(recipeId, 10);
    console.log('Navigating to recipe detail:', { recipeId, numericRecipeId });
    setSelectedRecipeId(numericRecipeId);
    setCurrentPage('recipe-detail');
  };

  // Shared Recipe View
  if (currentPage === 'shared-recipe' && sharedRecipeData) {
    return (
      <SharedRecipeView 
        recipeData={sharedRecipeData}
        onBackToHome={() => {
          setCurrentPage('home');
          setSharedRecipeData(null);
          // Clear URL parameters
          window.history.replaceState({}, document.title, window.location.pathname);
        }}
        onCookRecipe={() => {
          setCurrentPage('guided-cook');
        }}
      />
    );
  }

  if (currentPage === 'explorer') {
    return (
      <RecipeExplorer 
        onRecipeClick={(recipeId) => {
          setSelectedRecipeId(recipeId);
          setCurrentPage('recipe-detail');
        }}
        onBackToHome={() => setCurrentPage('home')}
      />
    );
  }

  if (currentPage === 'recipe-detail') {
    return (
      <BaseRecipeDetail 
        recipeId={selectedRecipeId}
        onBack={() => setCurrentPage('explorer')}
        onAddFusionTwist={(recipe) => {
          setSelectedRecipe(recipe);
          setCurrentPage('fusion-picker');
        }}
      />
    );
  }

  if (currentPage === 'fusion-picker') {
    return (
      <FusionCuisinePicker 
        baseRecipe={selectedRecipe}
        onBack={() => setCurrentPage('recipe-detail')}
        onCuisineSelected={(cuisine) => {
          setSelectedCuisine(cuisine);
          setCurrentPage('fusion-variants');
        }}
      />
    );
  }

  if (currentPage === 'fusion-variants') {
    return (
      <FusionVariants 
        baseRecipe={selectedRecipe}
        onBack={() => setCurrentPage('fusion-picker')}
        selectedCuisine={selectedCuisine}
        onCookFusion={(variant) => {
          setSelectedVariant(variant);
          setCurrentPage('guided-cook');
        }}
      />
    );
  }

  if (currentPage === 'saved-recipes') {
    return (
      <SavedRecipes 
        onBackToHome={() => setCurrentPage('home')}
        onViewRecipe={handleViewRecipeFromSaved}
        onGoToExplorer={() => setCurrentPage('explorer')}
      />
    );
  }

  if (currentPage === 'guided-cook') {
    return (
      <GuidedCookMode 
        baseRecipe={selectedRecipe}
        onBack={() => setCurrentPage('fusion-variants')}
        selectedCuisine={selectedCuisine}
        variantType={selectedVariant}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-orange-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              <ChefHat className="h-8 w-8 text-orange-600" />
              <span className="text-2xl font-bold text-gray-900">FusionFlavors</span>
            </div>
            <div className="flex items-center space-x-4">
              <button 
                onClick={handleSavedRecipesClick}
                className="flex items-center space-x-2 text-gray-600 hover:text-orange-600 font-semibold transition-colors duration-200"
              >
                <Heart className="h-5 w-5" />
                <span>Saved Recipes</span>
              </button>
              
              {loading ? (
                <div className="bg-gray-200 animate-pulse px-6 py-2 rounded-full">
                  <span className="text-transparent">Loading...</span>
                </div>
              ) : user ? (
                <button 
                  onClick={() => setShowUserProfile(true)}
                  className="flex items-center space-x-2 bg-orange-600 text-white px-6 py-2 rounded-full font-semibold hover:bg-orange-700 transition-colors duration-200"
                >
                  {user.user_metadata?.avatar_url || user.user_metadata?.picture ? (
                    <img
                      src={user.user_metadata.avatar_url || user.user_metadata.picture}
                      alt="Profile"
                      className="w-6 h-6 rounded-full"
                    />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-white bg-opacity-20 flex items-center justify-center">
                      <span className="text-xs font-bold">
                        {(user.user_metadata?.full_name || user.user_metadata?.name || user.email)?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <span>
                    {user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || 'User'}
                  </span>
                </button>
              ) : (
                <button 
                  onClick={() => setShowSignInModal(true)}
                  className="bg-orange-600 text-white px-6 py-2 rounded-full font-semibold hover:bg-orange-700 transition-colors duration-200"
                >
                  Sign In
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        {/* Background Image */}
        <div 
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: 'url(https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1280&fit=crop)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: '0.1'
          }}
        />
        
        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl lg:text-7xl font-bold text-gray-900 mb-8 leading-tight">
              Discover Fusion Recipes{' '}
              <span className="bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                Like Never Before
              </span>
            </h1>
            
            <p className="text-xl lg:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
              Pick a base cuisine, blend it with another, and get unique fusion recipes instantly.
            </p>
            
            <button 
              onClick={() => setCurrentPage('explorer')}
              className="group bg-gradient-to-r from-orange-600 to-red-600 text-white px-12 py-4 rounded-full text-xl font-bold shadow-2xl hover:shadow-3xl transform hover:-translate-y-1 transition-all duration-300 inline-flex items-center space-x-3"
            >
              <span>Start Exploring</span>
              <ArrowRight className="h-6 w-6 group-hover:translate-x-1 transition-transform duration-200" />
            </button>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Why Choose FusionFlavors?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Experience the future of cooking with our innovative approach to fusion cuisine
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Card 1 */}
            <div className="group bg-gradient-to-br from-orange-50 to-white p-8 rounded-2xl border border-orange-100 hover:border-orange-200 hover:shadow-xl transform hover:-translate-y-2 transition-all duration-300">
              <div className="bg-gradient-to-br from-orange-500 to-red-500 w-16 h-16 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-200">
                <ChefHat className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Personalized Fusion Recipes
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Get customized fusion recipes tailored to your taste preferences and dietary requirements. Every recipe is unique to you.
              </p>
            </div>

            {/* Card 2 */}
            <div className="group bg-gradient-to-br from-red-50 to-white p-8 rounded-2xl border border-red-100 hover:border-red-200 hover:shadow-xl transform hover:-translate-y-2 transition-all duration-300">
              <div className="bg-gradient-to-br from-red-500 to-orange-500 w-16 h-16 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-200">
                <BookOpen className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Step-by-step Interactive Cooking
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Follow along with interactive cooking guides that adapt to your pace. Never get lost in the kitchen again.
              </p>
            </div>

            {/* Card 3 */}
            <div className="group bg-gradient-to-br from-yellow-50 to-white p-8 rounded-2xl border border-yellow-100 hover:border-yellow-200 hover:shadow-xl transform hover:-translate-y-2 transition-all duration-300">
              <div className="bg-gradient-to-br from-yellow-500 to-orange-500 w-16 h-16 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-200">
                <Heart className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Save & Share Your Creations
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Build your personal recipe collection and share your culinary masterpieces with the FusionFlavors community.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-orange-600 to-red-600 relative overflow-hidden">
        {/* Background Pattern */}
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: 'url(https://images.pexels.com/photos/1640772/pexels-photo-1640772.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1280&fit=crop)',
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        />
        
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
            Ready to Create Something Amazing?
          </h2>
          <p className="text-xl text-orange-100 mb-10 max-w-2xl mx-auto">
            Join thousands of home chefs who are already discovering incredible fusion recipes.
          </p>
          
          <button 
            onClick={() => setCurrentPage('explorer')}
            className="group bg-white text-orange-600 px-12 py-4 rounded-full text-xl font-bold shadow-2xl hover:shadow-3xl transform hover:-translate-y-1 transition-all duration-300 inline-flex items-center space-x-3 hover:bg-gray-50"
          >
            <span>Start Exploring</span>
            <ArrowRight className="h-6 w-6 group-hover:translate-x-1 transition-transform duration-200" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <ChefHat className="h-6 w-6 text-orange-400" />
              <span className="text-xl font-bold">FusionFlavors</span>
            </div>
            <p className="text-gray-400">
              © 2025 FusionFlavors. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <SignInModal
        isOpen={showSignInModal}
        onClose={() => setShowSignInModal(false)}
        onSignInSuccess={handleSignInSuccess}
      />

      <UserProfile
        user={user}
        isOpen={showUserProfile}
        onClose={() => setShowUserProfile(false)}
        onSignOut={handleSignOut}
        onNavigateToSavedRecipes={() => setCurrentPage('saved-recipes')}
        onNavigateToMyCreations={() => {
          // My Creations feature coming soon
          alert('My Creations feature is coming soon! You\'ll be able to create and save your own fusion recipes.');
        }}
        onNavigateToSettings={() => {
          // Settings feature coming soon
          alert('Settings feature is coming soon! You\'ll be able to customize your preferences and account settings.');
        }}
      />
    </div>
  );
}

export default App;
