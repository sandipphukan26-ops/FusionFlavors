import React, { useState, useEffect } from 'react';
import { ArrowLeft, ChefHat, Clock, Users, Play, Pause, RotateCcw, Eye, Save, Check, ChevronLeft, ChevronRight } from 'lucide-react';

interface GuidedCookModeProps {
  baseRecipe: any;
  onBack: () => void;
  selectedCuisine: string;
  variantType: string;
}

interface CookingStep {
  id: number;
  instruction: string;
  duration?: number; // in minutes
  tips?: string;
}

const GuidedCookMode: React.FC<GuidedCookModeProps> = ({ baseRecipe, onBack, selectedCuisine, variantType }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [timerActive, setTimerActive] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [showAllSteps, setShowAllSteps] = useState(false);

  // Mock recipe data - in real app this would come from props/API
  const recipe = {
    title: `${selectedCuisine}-${baseRecipe?.cuisine || 'Fusion'} ${baseRecipe?.title || 'Recipe'}`,
    variant: `${variantType} Twist`,
    prepTime: variantType === 'Subtle' ? '28 min' : variantType === 'Balanced' ? '32 min' : '37 min',
    servings: 4,
    steps: [
      {
        id: 1,
        instruction: "Bring a large pot of salted water to boil. This will be used for cooking the pasta.",
        tips: "Use about 1 tablespoon of salt per liter of water for properly seasoned pasta."
      },
      {
        id: 2,
        instruction: selectedCuisine === 'Japanese' 
          ? "Heat olive oil in a large skillet over medium heat. Add diced shiitake mushrooms and cook until golden and crispy."
          : "Heat olive oil in a large skillet over medium heat. Add pancetta and cook until crispy.",
        duration: 7,
        tips: selectedCuisine === 'Japanese' 
          ? "Shiitake mushrooms should be sliced thin and cooked until they release their moisture and become golden."
          : "Cook pancetta until it renders its fat and becomes crispy but not burnt."
      },
      {
        id: 3,
        instruction: selectedCuisine === 'Japanese'
          ? "In a bowl, whisk together eggs, Pecorino Romano, Parmesan, miso paste, and a generous amount of black pepper."
          : "In a bowl, whisk together eggs, Pecorino Romano, Parmesan, and a generous amount of black pepper.",
        tips: "The egg mixture should be smooth and well combined. This creates the creamy sauce base."
      },
      {
        id: 4,
        instruction: "Add pasta to the boiling water and cook according to package directions until al dente.",
        duration: 10,
        tips: "Stir occasionally to prevent sticking. Taste test a minute before the package time."
      },
      {
        id: 5,
        instruction: "Reserve 1 cup of pasta cooking water, then drain the pasta. The starchy water helps create a silky sauce.",
        tips: "Don't forget this step! The pasta water is crucial for the perfect sauce consistency."
      },
      {
        id: 6,
        instruction: "Add the hot pasta to the skillet with the cooked ingredients. Remove from heat immediately.",
        tips: "Working off the heat prevents the eggs from scrambling when you add them."
      },
      {
        id: 7,
        instruction: selectedCuisine === 'Japanese'
          ? "Quickly pour the egg mixture over the pasta, tossing constantly. Add pasta water as needed. Finish with nori flakes and sesame seeds."
          : "Quickly pour the egg mixture over the pasta, tossing constantly to create a creamy sauce. Add pasta water as needed.",
        tips: "Toss vigorously and continuously to create a smooth, creamy sauce without scrambled eggs."
      }
    ] as CookingStep[]
  };

  // Timer functionality
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timerActive && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(time => {
          if (time <= 1) {
            setTimerActive(false);
            return 0;
          }
          return time - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerActive, timeRemaining]);

  const startTimer = (minutes: number) => {
    setTimeRemaining(minutes * 60);
    setTimerActive(true);
  };

  const toggleTimer = () => {
    setTimerActive(!timerActive);
  };

  const resetTimer = () => {
    setTimerActive(false);
    setTimeRemaining(recipe.steps[currentStep]?.duration ? recipe.steps[currentStep].duration! * 60 : 0);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const markStepComplete = () => {
    setCompletedSteps(prev => new Set([...prev, currentStep]));
    if (currentStep < recipe.steps.length - 1) {
      setCurrentStep(currentStep + 1);
      setTimerActive(false);
      setTimeRemaining(0);
    }
  };

  const goToStep = (stepIndex: number) => {
    setCurrentStep(stepIndex);
    setTimerActive(false);
    setTimeRemaining(0);
  };

  const currentStepData = recipe.steps[currentStep];
  const isLastStep = currentStep === recipe.steps.length - 1;
  const isFirstStep = currentStep === 0;

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
        <div className="text-center mb-8">
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
            {recipe.title}
          </h1>
          <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full text-sm font-semibold mb-4">
            {recipe.variant}: {selectedCuisine} + {baseRecipe?.cuisine || 'Base Recipe'}
          </div>
          <div className="flex items-center justify-center space-x-6 text-gray-600">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5" />
              <span>{recipe.prepTime}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5" />
              <span>{recipe.servings} servings</span>
            </div>
          </div>
        </div>

        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <span className="text-lg font-semibold text-gray-900">
              Step {currentStep + 1} of {recipe.steps.length}
            </span>
            <span className="text-sm text-gray-500">
              {completedSteps.size} completed
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-orange-500 to-red-500 h-3 rounded-full transition-all duration-300"
              style={{ width: `${((currentStep + 1) / recipe.steps.length) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Current Step */}
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 mb-8">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Current Step
            </h2>
            <p className="text-lg text-gray-700 leading-relaxed mb-4">
              {currentStepData.instruction}
            </p>
            {currentStepData.tips && (
              <div className="bg-orange-50 border-l-4 border-orange-500 p-4 rounded-r-lg">
                <p className="text-sm text-orange-800">
                  <strong>Tip:</strong> {currentStepData.tips}
                </p>
              </div>
            )}
          </div>

          {/* Timer Section */}
          {currentStepData.duration && (
            <div className="bg-gray-50 rounded-xl p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Timer</h3>
                <span className="text-sm text-gray-500">
                  Suggested: {currentStepData.duration} minutes
                </span>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="text-3xl font-bold text-gray-900 min-w-[100px]">
                  {timeRemaining > 0 ? formatTime(timeRemaining) : `${currentStepData.duration}:00`}
                </div>
                
                <div className="flex space-x-2">
                  {timeRemaining === 0 ? (
                    <button
                      onClick={() => startTimer(currentStepData.duration!)}
                      className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-700 transition-colors duration-200"
                    >
                      <Play className="h-4 w-4" />
                      <span>Start</span>
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={toggleTimer}
                        className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-semibold transition-colors duration-200 ${
                          timerActive 
                            ? 'bg-yellow-600 text-white hover:bg-yellow-700' 
                            : 'bg-green-600 text-white hover:bg-green-700'
                        }`}
                      >
                        {timerActive ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                        <span>{timerActive ? 'Pause' : 'Resume'}</span>
                      </button>
                      <button
                        onClick={resetTimer}
                        className="flex items-center space-x-2 bg-gray-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-gray-700 transition-colors duration-200"
                      >
                        <RotateCcw className="h-4 w-4" />
                        <span>Reset</span>
                      </button>
                    </>
                  )}
                </div>
              </div>
              
              {timeRemaining === 0 && timerActive === false && currentStepData.duration && (
                <div className="mt-4 p-3 bg-green-100 border border-green-200 rounded-lg">
                  <p className="text-green-800 font-medium">⏰ Timer finished!</p>
                </div>
              )}
            </div>
          )}

          {/* Step Navigation */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex space-x-4 flex-1">
              <button
                onClick={() => goToStep(currentStep - 1)}
                disabled={isFirstStep}
                className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
                  isFirstStep
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-600 text-white hover:bg-gray-700'
                }`}
              >
                <ChevronLeft className="h-5 w-5" />
                <span>Previous</span>
              </button>
              
              <button
                onClick={() => goToStep(currentStep + 1)}
                disabled={isLastStep}
                className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
                  isLastStep
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-600 text-white hover:bg-gray-700'
                }`}
              >
                <span>Next</span>
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
            
            <button
              onClick={markStepComplete}
              className="flex items-center justify-center space-x-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
            >
              <Check className="h-5 w-5" />
              <span>{isLastStep ? 'Complete Recipe!' : 'Mark as Done'}</span>
            </button>
          </div>
        </div>

        {/* Floating Action Bar */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => setShowAllSteps(true)}
              className="flex items-center justify-center space-x-2 bg-orange-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-orange-700 transition-colors duration-200 flex-1"
            >
              <Eye className="h-5 w-5" />
              <span>View All Steps</span>
            </button>
            
            <button
              onClick={onBack}
              className="flex items-center justify-center space-x-2 border-2 border-gray-200 text-gray-600 px-6 py-3 rounded-xl font-semibold hover:border-gray-300 hover:bg-gray-50 transition-all duration-200 flex-1"
            >
              <Save className="h-5 w-5" />
              <span>Save & Exit</span>
            </button>
          </div>
        </div>
      </div>

      {/* All Steps Modal */}
      {showAllSteps && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100">
              <div className="flex justify-between items-center">
                <h3 className="text-2xl font-bold text-gray-900">All Recipe Steps</h3>
                <button
                  onClick={() => setShowAllSteps(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>
            </div>
            <div className="p-6">
              <ol className="space-y-6">
                {recipe.steps.map((step, index) => (
                  <li key={step.id} className="flex items-start space-x-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                      completedSteps.has(index)
                        ? 'bg-green-600 text-white'
                        : index === currentStep
                        ? 'bg-orange-600 text-white'
                        : 'bg-gray-200 text-gray-600'
                    }`}>
                      {completedSteps.has(index) ? <Check className="h-4 w-4" /> : index + 1}
                    </div>
                    <div className="flex-1">
                      <p className={`text-gray-700 leading-relaxed ${
                        index === currentStep ? 'font-semibold' : ''
                      }`}>
                        {step.instruction}
                      </p>
                      {step.duration && (
                        <p className="text-sm text-orange-600 mt-1">
                          ⏱️ {step.duration} minutes
                        </p>
                      )}
                      {step.tips && (
                        <p className="text-sm text-gray-500 mt-2 italic">
                          Tip: {step.tips}
                        </p>
                      )}
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GuidedCookMode;