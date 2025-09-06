# OAuth Setup Guide for FusionFlavors

## Step 1: Set Up Google OAuth

### 1.1 Create Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Select a project" → "New Project"
3. Name it "FusionFlavors" → Click "Create"
4. Wait for project creation to complete

### 1.2 Enable Google+ API
1. In your project, go to "APIs & Services" → "Library"
2. Search for "Google+ API"
3. Click on it and press "Enable"

### 1.3 Configure OAuth Consent Screen
1. Go to "APIs & Services" → "OAuth consent screen"
2. Choose "External" → Click "Create"
3. Fill in required fields:
   - App name: `FusionFlavors`
   - User support email: Your email
   - Developer contact: Your email
4. Click "Save and Continue"
5. Skip "Scopes" → Click "Save and Continue"
6. Skip "Test users" → Click "Save and Continue"

### 1.4 Create OAuth Credentials
1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "OAuth 2.0 Client IDs"
3. Choose "Web application"
4. Name it "FusionFlavors Web Client"
5. Add Authorized JavaScript origins:
   - `http://localhost:5173` (for development)
   - `https://yourdomain.com` (for production)
6. Add Authorized redirect URIs:
   - `https://khdqwwzgxwwuyntphuoi.supabase.co/auth/v1/callback`
7. Click "Create"
8. **Copy the Client ID and Client Secret** - you'll need these!

## Step 2: Set Up Facebook OAuth

### 2.1 Create Facebook App
1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Click "My Apps" → "Create App"
3. Choose "Consumer" → Click "Next"
4. Fill in:
   - App name: `FusionFlavors`
   - Contact email: Your email
5. Click "Create App"

### 2.2 Add Facebook Login
1. In your app dashboard, click "Add Product"
2. Find "Facebook Login" → Click "Set Up"
3. Choose "Web" platform
4. Enter Site URL: `http://localhost:5173` (for development)
5. Click "Save" → "Continue"

### 2.3 Configure Facebook Login Settings
1. Go to "Facebook Login" → "Settings"
2. Add Valid OAuth Redirect URIs:
   - `https://khdqwwzgxwwuyntphuoi.supabase.co/auth/v1/callback`
3. Click "Save Changes"
4. Go to "Settings" → "Basic"
5. **Copy the App ID and App Secret** - you'll need these!

## Step 3: Configure Supabase

### 3.1 Set Up Google Provider
1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to "Authentication" → "Providers"
4. Find "Google" and toggle it ON
5. Enter your Google OAuth credentials:
   - Client ID: (from Step 1.4)
   - Client Secret: (from Step 1.4)
6. Click "Save"

### 3.2 Set Up Facebook Provider
1. In the same "Providers" section
2. Find "Facebook" and toggle it ON
3. Enter your Facebook credentials:
   - Client ID: Your Facebook App ID (from Step 2.3)
   - Client Secret: Your Facebook App Secret (from Step 2.3)
4. Click "Save"

## Step 4: Update Your Environment

Create a `.env` file in your project root with your Supabase credentials:

```env
VITE_SUPABASE_URL=https://khdqwwzgxwwuyntphuoi.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

## Step 5: Test Your Setup

1. Start your development server: `npm run dev`
2. Click "Sign In" in your app
3. Try both Google and Facebook sign-in options
4. Users should be redirected to the respective login pages
5. After successful login, they should return to your app signed in

## Troubleshooting

### Common Issues:

1. **"Redirect URI mismatch"**
   - Make sure your redirect URIs match exactly in Google/Facebook and Supabase
   - Include both development and production URLs

2. **"App not verified"**
   - For development, this is normal
   - For production, you'll need to verify your app with Google/Facebook

3. **"Invalid client"**
   - Double-check your Client ID and Secret are correct
   - Make sure you're using the right credentials for the right environment

### Need Help?
- Check the browser console for error messages
- Verify all URLs match exactly
- Ensure your Supabase project is properly configured

## Production Deployment

When deploying to production:
1. Update authorized origins in Google Cloud Console
2. Update redirect URIs in Facebook Developer Console
3. Update your environment variables with production URLs
4. Test the authentication flow on your live site

---

**Important**: Keep your Client Secrets secure and never commit them to version control!