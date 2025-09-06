// Test script to verify Supabase connection
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://khdqwwzgxwwuyntphuoi.supabase.co';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

console.log('Testing Supabase connection...');
console.log('URL:', supabaseUrl);
console.log('Key provided:', !!supabaseAnonKey);

if (!supabaseAnonKey) {
  console.error('❌ VITE_SUPABASE_ANON_KEY is missing from environment variables');
  console.log('📝 To fix this:');
  console.log('1. Go to your Supabase Dashboard: https://supabase.com/dashboard');
  console.log('2. Select your project: khdqwwzgxwwuyntphuoi');
  console.log('3. Go to Settings → API');
  console.log('4. Copy the "anon public" key');
  console.log('5. Add it to your .env file as VITE_SUPABASE_ANON_KEY=your_key_here');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Test the connection
async function testConnection() {
  try {
    console.log('🔄 Testing connection...');
    
    // Test basic connection
    const { data, error } = await supabase.from('profiles').select('count').limit(1);
    
    if (error) {
      console.log('⚠️  Connection test result:', error.message);
      if (error.message.includes('relation "profiles" does not exist')) {
        console.log('📝 The profiles table doesn\'t exist yet. This is normal for a new project.');
        console.log('✅ Connection to Supabase is working!');
        console.log('🔧 You need to run the database migrations to create the tables.');
      } else {
        console.error('❌ Connection failed:', error.message);
      }
    } else {
      console.log('✅ Successfully connected to Supabase!');
      console.log('📊 Profiles table exists and is accessible');
    }
    
    // Test auth service
    console.log('🔄 Testing auth service...');
    const { data: authData, error: authError } = await supabase.auth.getSession();
    
    if (authError) {
      console.error('❌ Auth service error:', authError.message);
    } else {
      console.log('✅ Auth service is working!');
    }
    
  } catch (err) {
    console.error('❌ Unexpected error:', err.message);
  }
}

testConnection();