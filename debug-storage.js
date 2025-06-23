// Debug script to check storage setup
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

async function debugStorage() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  const supabase = createClient(supabaseUrl, supabaseKey);

  console.log('🔍 Debugging storage setup...\n');

  try {
    // List all buckets
    const { data: buckets, error: storageError } = await supabase.storage.listBuckets();
    
    if (storageError) {
      console.error('❌ Error listing buckets:', storageError.message);
      return;
    }

    console.log('📦 Found buckets:');
    if (buckets && buckets.length > 0) {
      buckets.forEach(bucket => {
        console.log(`  - ${bucket.name} (${bucket.public ? 'public' : 'private'})`);
        console.log(`    ID: ${bucket.id}`);
        console.log(`    Created: ${bucket.created_at}`);
        console.log('');
      });
    } else {
      console.log('  No buckets found');
    }

    // Check specifically for attachments bucket
    const attachmentsBucket = buckets?.find(bucket => bucket.name === 'attachments');
    if (attachmentsBucket) {
      console.log('✅ Attachments bucket found!');
      console.log(`   Public: ${attachmentsBucket.public}`);
      console.log(`   ID: ${attachmentsBucket.id}`);
    } else {
      console.log('❌ Attachments bucket not found');
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  }
}

debugStorage(); 