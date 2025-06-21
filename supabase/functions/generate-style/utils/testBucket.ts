
// Test bucket accessibility
export async function testBucketAccess(supabase: any): Promise<boolean> {
  try {
    console.log('🧪 Testing bucket access...');
    
    // List buckets to see if our bucket exists
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    
    if (bucketsError) {
      console.error('❌ Error listing buckets:', bucketsError);
      return false;
    }
    
    console.log('📋 Available buckets:', buckets.map(b => b.name));
    
    const generatedImagesBucket = buckets.find(b => b.name === 'generated-images');
    if (!generatedImagesBucket) {
      console.error('❌ generated-images bucket not found');
      return false;
    }
    
    console.log('✅ generated-images bucket found:', generatedImagesBucket);
    
    // Test if we can list objects in the bucket
    const { data: objects, error: objectsError } = await supabase.storage
      .from('generated-images')
      .list('generated', { limit: 1 });
    
    if (objectsError) {
      console.error('⚠️ Error listing objects (might be empty):', objectsError);
      // This might be OK if the bucket is empty
    } else {
      console.log('📁 Bucket accessible, objects:', objects);
    }
    
    return true;
  } catch (error) {
    console.error('💥 Bucket test failed:', error);
    return false;
  }
}
