
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import Replicate from 'https://esm.sh/replicate@0.25.2';
import { saveReplicateImageToBucket } from './storage.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const REPLICATE_API_KEY = Deno.env.get('REPLICATE_API_KEY');
    if (!REPLICATE_API_KEY) {
      throw new Error('REPLICATE_API_KEY is not set');
    }

    const replicate = new Replicate({
      auth: REPLICATE_API_KEY,
    });

    const body = await req.json();

    // If it's a status check request
    if (body.predictionId) {
      console.log('Checking status for prediction:', body.predictionId);
      const prediction = await replicate.predictions.get(body.predictionId);
      console.log('Status check response:', prediction);
      return new Response(JSON.stringify(prediction), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // If it's a generation request
    if (!body.prompt) {
      return new Response(
        JSON.stringify({ 
          error: 'Missing required field: prompt is required' 
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      );
    }

    console.log('Generating image with prompt:', body.prompt);
    const output = await replicate.run(
      'black-forest-labs/flux-schnell',
      {
        input: {
          prompt: body.prompt,
          go_fast: true,
          megapixels: '1',
          num_outputs: 1,
          aspect_ratio: '1:1',
          output_format: 'webp',
          output_quality: 80,
          num_inference_steps: 4
        }
      }
    );

    console.log('Generation response:', output);
    
    // Extract the image URL from output
    const imageUrl = Array.isArray(output) ? output[0] : output;
    
    if (!imageUrl) {
      throw new Error('No image URL returned from Replicate');
    }

    // Save to our storage bucket
    console.log('Saving image to bucket...');
    const publicUrl = await saveReplicateImageToBucket(imageUrl, body.prompt);
    
    return new Response(JSON.stringify({ 
      output: [publicUrl],  // Keep compatible format for existing code
      imageUrl: publicUrl   // Also return in unified format
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error('Error in replicate function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
