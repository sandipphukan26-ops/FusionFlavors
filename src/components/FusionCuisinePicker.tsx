import React, { useState } from 'react';
import { ArrowLeft, ChefHat, Globe, Sparkles } from 'lucide-react';

interface FusionCuisinePickerProps {
  baseRecipe: any;
  onBack: () => void;
  onCuisineSelected: (cuisine: string) => void;
}

const FusionCuisinePicker: React.FC<FusionCuisinePickerProps> = ({ baseRecipe, onBack, onCuisineSelected }) => {
  const [selectedCuisine, setSelectedCuisine] = useState('');

  const cuisines = [
    { name: 'Italian', flag: '🇮🇹', color: 'from-green-500 to-red-500' },
    { name: 'Japanese', flag: '🇯🇵', color: 'from-red-500 to-white' },
    { name: 'Mexican', flag: '🇲🇽', color: 'from-green-500 to-red-500' },
    { name: 'Indian', flag: '🇮🇳', color: 'from-orange-500 to-green-500' },
    { name: 'French', flag: '🇫🇷', color: 'from-blue-500 to-red-500' },
    { name: 'Thai', flag: '🇹🇭', color: 'from-red-500 to-blue-500' },
    { name: 'Chinese', flag: '🇨🇳', color: 'from-red-500 to-yellow-500' },
    { name: 'Korean', flag: '🇰🇷', color: 'from-blue-500 to-red-500' }
  ];

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
                <span>Back to Recipe</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <Sparkles className="h-8 w-8 text-orange-600" />
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900">
              Add Fusion Twist
            </h1>
            <Sparkles className="h-8 w-8 text-orange-600" />
          </div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Choose a cuisine to fuse with your <span className="font-semibold text-orange-600">{baseRecipe?.title || 'selected recipe'}</span> and create something amazing!
          </p>
        </div>

        {/* Base Recipe Display */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-8">
          <div className="flex items-center justify-center space-x-4">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Base Recipe</h3>
              <div className="bg-gradient-to-r from-orange-100 to-red-100 px-6 py-3 rounded-xl">
                <span className="text-xl font-bold text-gray-900">{baseRecipe?.title || 'Selected Recipe'}</span>
                <p className="text-sm text-gray-600 mt-1">{baseRecipe?.cuisine || 'Unknown'} Cuisine</p>
              </div>
            </div>
            <div className="text-3xl text-gray-400">+</div>
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Fusion Cuisine</h3>
              <div className="bg-gray-100 px-6 py-3 rounded-xl border-2 border-dashed border-gray-300">
                <span className="text-gray-500">Select cuisine...</span>
              </div>
            </div>
          </div>
        </div>

        {/* Cuisine Selection */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Choose Your Fusion Cuisine
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {cuisines.map((cuisine) => (
              <button
                key={cuisine.name}
                onClick={() => setSelectedCuisine(cuisine.name)}
                className={`group p-6 rounded-2xl border-2 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg ${
                  selectedCuisine === cuisine.name
                    ? 'border-orange-500 bg-orange-50 shadow-lg'
                    : 'border-gray-200 bg-white hover:border-orange-300'
                }`}
              >
                <div className="text-center">
                  <div className="text-4xl mb-3">{cuisine.flag}</div>
                  <h3 className="font-semibold text-gray-900 mb-2">{cuisine.name}</h3>
                  <div className={`h-2 rounded-full bg-gradient-to-r ${cuisine.color} opacity-60`}></div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Generate Button */}
        <div className="text-center">
          <button 
            onClick={() => selectedCuisine && onCuisineSelected(selectedCuisine)}
            disabled={!selectedCuisine}
            className={`px-12 py-4 rounded-xl text-xl font-bold transition-all duration-300 inline-flex items-center space-x-3 ${
              selectedCuisine
                ? 'bg-gradient-to-r from-orange-600 to-red-600 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-1'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            <Globe className="h-6 w-6" />
            <span>Generate Fusion Recipe</span>
          </button>
          
          {selectedCuisine && (
            <p className="mt-4 text-gray-600">
             Creating: <span className="font-semibold text-orange-600">{selectedCuisine}-{baseRecipe?.cuisine || 'Fusion'} {baseRecipe?.title || 'Recipe'}</span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default FusionCuisinePicker;