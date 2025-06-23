// Test script to verify Supabase setup
// Run with: node test-supabase-setup.js

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

async function testSupabaseSetup() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase environment variables');
    console.log('Make sure you have:');
    console.log('- NEXT_PUBLIC_SUPABASE_URL');
    console.log('- NEXT_PUBLIC_SUPABASE_ANON_KEY');
    console.log('in your .env.local file');
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  console.log('🧪 Testing Supabase connection...');

  try {
    // Test database connection
    const { data, error } = await supabase.from('profiles').select('count');
    
    if (error) {
      console.error('❌ Database connection failed:', error.message);
      return;
    }

    console.log('✅ Database connection successful');

    // Test storage bucket
    const { data: buckets, error: storageError } = await supabase.storage.listBuckets();
    
    if (storageError) {
      console.error('❌ Storage connection failed:', storageError.message);
      return;
    }

    const attachmentsBucket = buckets.find(bucket => bucket.name === 'attachments');
    if (!attachmentsBucket) {
      console.error('❌ Attachments bucket not found');
      console.log('Please create an "attachments" bucket in Supabase Storage');
      return;
    }

    console.log('✅ Storage setup successful');

    // Test auth configuration
    const { data: authData, error: authError } = await supabase.auth.getSession();
    
    if (authError) {
      console.error('❌ Auth configuration issue:', authError.message);
      return;
    }

    console.log('✅ Auth configuration successful');
    console.log('🎉 Supabase setup is complete and working!');
    console.log('\nYou can now:');
    console.log('1. Run: npm run dev');
    console.log('2. Navigate to http://localhost:3000');
    console.log('3. Create an account and start chatting!');

  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  }
}

testSupabaseSetup(); 