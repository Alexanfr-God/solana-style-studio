import "jsr:@supabase/functions-js/edge-runtime.d.ts"

console.log("Hello from NFT Generator!")

export default async (req: Request) => {
  try {
    const { prompt } = await req.json();
    console.log("Received prompt:", prompt);

    // Use Edge Runtime environment variables
    const openaiApiKey = (globalThis as any).OPENAI_API_KEY;
    const pinataApiKey = (globalThis as any).PINATA_API_KEY;
    const pinataSecretApiKey = (globalThis as any).PINATA_SECRET_API_KEY;

    if (!openaiApiKey || !pinataApiKey || !pinataSecretApiKey) {
      throw new Error("Missing API keys");
    }

    console.log("Generating image with OpenAI...");
    const openaiResponse = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${openaiApiKey}`
      },
      body: JSON.stringify({
        prompt,
        n: 1,
        size: "1024x1024"
      })
    });

    if (!openaiResponse.ok) {
      throw new Error(`OpenAI API error: ${openaiResponse.statusText}`);
    }

    const openaiData = await openaiResponse.json();
    const imageUrl = openaiData.data[0].url;
    console.log("Image generated:", imageUrl);

    console.log("Downloading image...");
    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
      throw new Error(`Failed to download image: ${imageResponse.statusText}`);
    }
    const imageBuffer = await imageResponse.arrayBuffer();

    console.log("Uploading to Pinata...");
    const formData = new FormData();
    formData.append("file", new Blob([imageBuffer]), "nft-image.png");
    const pinataResponse = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
      method: "POST",
      headers: {
        "pinata_api_key": pinataApiKey,
        "pinata_secret_api_key": pinataSecretApiKey
      },
      body: formData
    });

    if (!pinataResponse.ok) {
      throw new Error(`Pinata API error: ${pinataResponse.statusText}`);
    }

    const pinataData = await pinataResponse.json();
    const imageUri = `ipfs://${pinataData.IpfsHash}`;
    console.log("Image uploaded to IPFS:", imageUri);

    const metadata = {
      name: `NFT for ${prompt}`,
      description: `An NFT generated with the prompt: ${prompt}`,
      image: imageUri,
      attributes: [{ trait_type: "Prompt", value: prompt }]
    };

    console.log("Returning metadata:", metadata);
    return new Response(
      JSON.stringify(metadata),
      { headers: { "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error) {
    console.error("Error in generate_nft:", error.message);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { "Content-Type": "application/json" }, status: 500 }
    );
  }
}