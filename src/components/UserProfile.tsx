import React, { useState } from 'react';
import { User, Settings, Heart, BookOpen, LogOut, X } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface UserProfileProps {
  user: any;
  isOpen: boolean;
  onClose: () => void;
  onSignOut: () => void;
  onNavigateToSavedRecipes?: () => void;
  onNavigateToMyCreations?: () => void;
  onNavigateToSettings?: () => void;
}

const UserProfile: React.FC<UserProfileProps> = ({ 
  user, 
  isOpen, 
  onClose, 
  onSignOut,
  onNavigateToSavedRecipes,
  onNavigateToMyCreations,
  onNavigateToSettings
}) => {
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSignOut = async () => {
    setLoading(true);
    try {
      await supabase.auth.signOut();
      onSignOut();
      onClose();
    } catch (error) {
      console.error('Error signing out:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDisplayName = () => {
    if (user?.user_metadata?.full_name) {
      return user.user_metadata.full_name;
    }
    if (user?.user_metadata?.name) {
      return user.user_metadata.name;
    }
    return user?.email?.split('@')[0] || 'User';
  };

  const getAvatarUrl = () => {
    return user?.user_metadata?.avatar_url || user?.user_metadata?.picture;
  };

  const handleSavedRecipesClick = () => {
    onClose();
    if (onNavigateToSavedRecipes) {
      onNavigateToSavedRecipes();
    }
  };

  const handleMyCreationsClick = () => {
    onClose();
    if (onNavigateToMyCreations) {
      onNavigateToMyCreations();
    } else {
      // Show coming soon message for now
      alert('My Creations feature is coming soon! You\'ll be able to create and save your own fusion recipes.');
    }
  };

  const handleSettingsClick = () => {
    onClose();
    if (onNavigateToSettings) {
      onNavigateToSettings();
    } else {
      // Show coming soon message for now
      alert('Settings feature is coming soon! You\'ll be able to customize your preferences and account settings.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-md w-full">
        {/* Header */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900">Profile</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* User Info */}
          <div className="text-center mb-8">
            <div className="mb-4">
              {getAvatarUrl() ? (
                <img
                  src={getAvatarUrl()}
                  alt="Profile"
                  className="w-20 h-20 rounded-full mx-auto border-4 border-orange-100"
                />
              ) : (
                <div className="w-20 h-20 rounded-full mx-auto bg-gradient-to-r from-orange-500 to-red-500 flex items-center justify-center">
                  <User className="h-10 w-10 text-white" />
                </div>
              )}
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-1">
              {getDisplayName()}
            </h3>
            <p className="text-gray-600">{user?.email}</p>
          </div>

          {/* Menu Items */}
          <div className="space-y-2 mb-8">
            <button 
              onClick={handleSavedRecipesClick}
              className="w-full flex items-center space-x-3 p-4 rounded-xl hover:bg-gray-50 transition-colors duration-200 text-left hover:bg-red-50 hover:border-red-200"
            >
              <Heart className="h-5 w-5 text-red-500" />
              <span className="font-medium text-gray-900">Saved Recipes</span>
            </button>
            
            <button 
              onClick={handleMyCreationsClick}
              className="w-full flex items-center space-x-3 p-4 rounded-xl hover:bg-gray-50 transition-colors duration-200 text-left hover:bg-blue-50 hover:border-blue-200"
            >
              <BookOpen className="h-5 w-5 text-blue-500" />
              <div className="flex items-center space-x-2">
                <span className="font-medium text-gray-900">My Creations</span>
                <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full">Coming Soon</span>
              </div>
            </button>
            
            <button 
              onClick={handleSettingsClick}
              className="w-full flex items-center space-x-3 p-4 rounded-xl hover:bg-gray-50 transition-colors duration-200 text-left hover:bg-gray-100 hover:border-gray-300"
            >
              <Settings className="h-5 w-5 text-gray-500" />
              <div className="flex items-center space-x-2">
                <span className="font-medium text-gray-900">Settings</span>
                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">Coming Soon</span>
              </div>
            </button>
          </div>

          {/* Sign Out Button */}
          <button
            onClick={handleSignOut}
            disabled={loading}
            className="w-full flex items-center justify-center space-x-3 p-4 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <LogOut className="h-5 w-5" />
            <span className="font-medium">{loading ? 'Signing out...' : 'Sign Out'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;