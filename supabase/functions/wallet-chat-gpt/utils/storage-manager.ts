
// Supabase storage management utilities
export async function loadDesignExamples(supabase: any) {
  try {
    const examples = [];
    
    console.log('🎨 Loading design examples from Supabase Storage...');
    
    // Load all poster folders poster-001 to poster-010
    for (let i = 1; i <= 10; i++) {
      const posterNum = String(i).padStart(3, '0');
      const { data, error } = await supabase.storage
        .from('ai-examples-json')
        .download(`poster-${posterNum}/metadata.json`);
      
      if (data && !error) {
        const metadata = JSON.parse(await data.text());
        examples.push(metadata);
        console.log(`✅ Loaded style: ${metadata.id}`);
      }
    }
    
    console.log(`📚 Total loaded examples: ${examples.length}`);
    return examples;
  } catch (error) {
    console.error('❌ Error loading design examples:', error);
    return [];
  }
}

export function chooseStyle(userRequest: string, examples: any[]) {
  const request = userRequest.toLowerCase();
  
  // Simple keyword-based style selection
  for (const example of examples) {
    const style = example.description?.toLowerCase() || '';
    const mood = example.background?.mood?.toLowerCase() || '';
    
    if (request.includes('trump') && style.includes('trump')) {
      return example;
    }
    if (request.includes('bitcoin') && style.includes('bitcoin')) {
      return example;
    }
    if (request.includes('dark') && mood.includes('dark')) {
      return example;
    }
  }
  
  return examples[0] || null;
}
