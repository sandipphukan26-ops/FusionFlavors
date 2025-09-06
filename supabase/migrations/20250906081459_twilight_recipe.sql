/*
  # Disable Email Confirmation for Development

  1. Configuration
    - Disable email confirmation requirement
    - Allow users to sign in immediately after registration
    - This is suitable for development and testing

  2. Security
    - In production, you may want to enable email confirmation
    - This can be configured in Supabase Dashboard → Authentication → Settings
*/

-- This migration documents the email confirmation setting
-- The actual setting needs to be changed in Supabase Dashboard

-- Note: Email confirmation is controlled by Supabase Dashboard settings
-- Go to: Authentication → Settings → Email Confirmation
-- Set "Enable email confirmations" to OFF for development