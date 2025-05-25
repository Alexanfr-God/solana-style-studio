
// Clean DALL-E API integration with proper error handling

export async function fetchDalleImage(prompt: string, apiKey: string): Promise<string> {
  console.log('🎨 Generating image with DALL-E 3...');
  
  const requestPayload = {
    model: "dall-e-3",
    prompt: prompt,
    n: 1,
    size: "1024x1024",
    response_format: "url",
    quality: "standard"
  };
  
  console.log('📤 DALL-E request:', JSON.stringify(requestPayload, null, 2));
  
  try {
    const response = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(requestPayload)
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ DALL-E API error:', errorData);
      throw new Error(`DALL-E API error: ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    const imageUrl = data.data[0].url;
    
    console.log('✅ DALL-E generation successful');
    return imageUrl;

  } catch (error) {
    console.error('❌ DALL-E generation failed:', error);
    throw new Error(`DALL-E generation failed: ${error.message}`);
  }
}

export async function validateImageUrl(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    return response.ok;
  } catch {
    return false;
  }
}
