// Comprehensive debug script for Supabase setup
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

async function comprehensiveDebug() {
  console.log('🔍 Comprehensive Supabase Debug\n');

  // Check environment variables
  console.log('1. Environment Variables:');
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  console.log(`   URL: ${supabaseUrl ? '✅ Set' : '❌ Missing'}`);
  console.log(`   Key: ${supabaseKey ? '✅ Set' : '❌ Missing'}`);
  
  if (supabaseUrl) {
    console.log(`   URL format: ${supabaseUrl.includes('supabase.co') ? '✅ Valid' : '❌ Invalid'}`);
  }
  
  if (!supabaseUrl || !supabaseKey) {
    console.log('\n❌ Environment variables are missing or incorrect.');
    console.log('Check your .env.local file and ensure it contains:');
    console.log('NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co');
    console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key');
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  console.log('\n2. Testing Basic Connection:');
  try {
    // Test basic database query
    const { data, error } = await supabase.from('profiles').select('count');
    if (error) {
      console.log(`   Database: ❌ ${error.message}`);
    } else {
      console.log('   Database: ✅ Connected');
    }
  } catch (err) {
    console.log(`   Database: ❌ ${err.message}`);
  }

  console.log('\n3. Testing Auth Configuration:');
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) {
      console.log(`   Auth: ❌ ${error.message}`);
    } else {
      console.log('   Auth: ✅ Configured');
      console.log(`   Current user: ${session?.user ? session.user.email : 'Not logged in'}`);
    }
  } catch (err) {
    console.log(`   Auth: ❌ ${err.message}`);
  }

  console.log('\n4. Testing Storage Access:');
  try {
    // Try to list buckets
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.log(`   List buckets: ❌ ${listError.message}`);
      console.log('   This could mean:');
      console.log('   - Your anon key doesn\'t have storage permissions');
      console.log('   - Storage is not enabled for your project');
      console.log('   - There\'s a network connectivity issue');
    } else {
      console.log(`   List buckets: ✅ Success (found ${buckets?.length || 0} buckets)`);
      
      if (buckets && buckets.length > 0) {
        console.log('\n   Buckets found:');
        buckets.forEach(bucket => {
          console.log(`   - ${bucket.name} (${bucket.public ? 'public' : 'private'})`);
        });
      } else {
        console.log('   No buckets found - you need to create the "attachments" bucket');
      }
    }
  } catch (err) {
    console.log(`   Storage: ❌ ${err.message}`);
  }

  console.log('\n5. Testing Storage Direct Access:');
  try {
    // Try to access attachments bucket directly
    const { data: files, error: filesError } = await supabase.storage
      .from('attachments')
      .list('', { limit: 1 });
    
    if (filesError) {
      console.log(`   Access attachments bucket: ❌ ${filesError.message}`);
      if (filesError.message.includes('not found')) {
        console.log('   → The "attachments" bucket doesn\'t exist');
      }
    } else {
      console.log('   Access attachments bucket: ✅ Success');
    }
  } catch (err) {
    console.log(`   Direct access: ❌ ${err.message}`);
  }

  console.log('\n📋 Next Steps:');
  console.log('1. Go to your Supabase dashboard');
  console.log('2. Navigate to Storage');
  console.log('3. If no buckets exist, create a new bucket named "attachments"');
  console.log('4. Make sure it\'s set to "Public bucket"');
  console.log('5. If buckets exist but this script can\'t see them, check your API key permissions');
}

comprehensiveDebug(); 