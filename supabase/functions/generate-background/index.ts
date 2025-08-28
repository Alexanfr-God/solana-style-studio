
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { prompt, size = '1024x1024', seed } = await req.json()
    
    console.log('🎨 [EDGE] Starting background generation:', { prompt, size, seed })
    
    const replicateApiKey = Deno.env.get('REPLICATE_API_KEY')
    if (!replicateApiKey) {
      console.error('❌ [EDGE] REPLICATE_API_KEY not configured')
      return new Response(
        JSON.stringify({ error: 'REPLICATE_API_KEY not configured' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Parse size for Replicate
    const [width, height] = size.split('x').map(Number)
    
    // 1. Create prediction
    console.log('🚀 [EDGE] Creating Replicate prediction...')
    const createResponse = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${replicateApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        version: 'f2ab8a5569070ad82329f4819e2448a5478718e68df5fecf462d5808764d91c1', // flux-schnell
        input: {
          prompt: prompt,
          go_fast: true,
          megapixels: '1',
          num_outputs: 1,
          aspect_ratio: size === '1024x1024' ? '1:1' : 
                        size === '768x1365' ? '9:16' : '16:9',
          output_format: 'png',
          output_quality: 90,
          num_inference_steps: 4,
          seed: seed
        }
      })
    })

    if (!createResponse.ok) {
      const errorText = await createResponse.text()
      console.error('❌ [EDGE] Replicate API error:', createResponse.status, errorText)
      return new Response(
        JSON.stringify({ error: `Replicate API error: ${createResponse.status}` }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    const prediction = await createResponse.json()
    console.log('✅ [EDGE] Prediction created:', prediction.id)

    // 2. Poll for completion with extended timeout for slow generations
    const startTime = Date.now()
    const timeout = 120000 // 2 minutes for edge function timeout safety
    let result = prediction
    
    while (result.status !== 'succeeded' && result.status !== 'failed') {
      if (Date.now() - startTime > timeout) {
        console.error('⏰ [EDGE] Generation timeout after 2 minutes')
        return new Response(
          JSON.stringify({ error: 'Generation timeout - try a simpler prompt' }),
          { 
            status: 504, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )
      }

      // Wait 2 seconds before polling
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const statusResponse = await fetch(`https://api.replicate.com/v1/predictions/${prediction.id}`, {
        headers: {
          'Authorization': `Token ${replicateApiKey}`,
        }
      })

      result = await statusResponse.json()
      console.log('📊 [EDGE] Status check:', result.status)
    }

    if (result.status === 'failed') {
      console.error('❌ [EDGE] Generation failed:', result.error)
      return new Response(
        JSON.stringify({ error: `Generation failed: ${result.error || 'Unknown error'}` }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // 3. Download generated image
    const imageUrl = result.output[0]
    console.log('📥 [EDGE] Downloading generated image:', imageUrl)
    
    const imageResponse = await fetch(imageUrl)
    if (!imageResponse.ok) {
      console.error('❌ [EDGE] Failed to download image')
      return new Response(
        JSON.stringify({ error: 'Failed to download generated image' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }
    
    const imageBlob = await imageResponse.blob()
    console.log('📦 [EDGE] Downloaded image size:', imageBlob.size)

    // 4. Upload to Supabase Storage
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    
    const supabase = createClient(supabaseUrl!, supabaseKey!)
    
    const timestamp = Date.now()
    const filename = `generated-bg-${timestamp}.png`
    const path = `wallpapers/ai-generated/${filename}`
    
    console.log('📤 [EDGE] Uploading to Storage:', path)
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('generated-images')
      .upload(path, imageBlob, {
        cacheControl: '3600',
        upsert: false,
        contentType: 'image/png'
      })

    if (uploadError) {
      console.error('❌ [EDGE] Storage upload error:', uploadError)
      return new Response(
        JSON.stringify({ error: `Storage upload failed: ${uploadError.message}` }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // 5. Get public URL
    const { data: urlData } = supabase.storage
      .from('generated-images')
      .getPublicUrl(uploadData.path)

    if (!urlData?.publicUrl) {
      console.error('❌ [EDGE] Failed to get public URL')
      return new Response(
        JSON.stringify({ error: 'Failed to get public URL' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    const publicUrl = urlData.publicUrl
    console.log('✅ [EDGE] Generation complete:', publicUrl)
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        imageUrl: publicUrl,
        path: uploadData.path,
        size: imageBlob.size,
        generationTime: `${((Date.now() - startTime) / 1000).toFixed(1)}s`
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('💥 [EDGE] Unexpected error:', error)
    return new Response(
      JSON.stringify({ error: `Unexpected error: ${error.message}` }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
