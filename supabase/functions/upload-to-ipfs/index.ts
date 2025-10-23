// supabase/functions/upload-to-ipfs/index.ts
// ✅ Pure Deno runtime (no Node.js imports)

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function jsonResponse(status: number, body: unknown) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders },
  });
}

async function sha256Hex(input: Uint8Array): Promise<string> {
  const hash = await crypto.subtle.digest("SHA-256", input);
  const bytes = new Uint8Array(hash);
  return Array.from(bytes).map(b => b.toString(16).padStart(2, "0")).join("");
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // 1. Check for NFT.Storage API key
    const NFT_STORAGE_KEY = Deno.env.get("NFT_STORAGE_KEY");
    if (!NFT_STORAGE_KEY) {
      console.error("[upload-to-ipfs] ❌ Missing NFT_STORAGE_KEY");
      return jsonResponse(500, { error: "Missing NFT_STORAGE_KEY" });
    }

    // 2. Parse request body
    const body = await req.json().catch(() => ({}));
    const { imageData, themeName, description, themeData } = body as {
      imageData?: string;
      themeName?: string;
      description?: string;
      themeData?: any;
    };

    console.log("[upload-to-ipfs] 📦 Request keys:", Object.keys(body));

    if (!imageData || !themeName || !themeData) {
      console.error("[upload-to-ipfs] ❌ Missing required fields");
      return jsonResponse(400, {
        error: "imageData, themeName, themeData are required",
      });
    }

    console.log(`[upload-to-ipfs] 📦 Theme: ${themeName}, Image size: ${imageData.length} chars`);

    // 3. Decode base64 image
    const base64 = imageData.includes("base64,")
      ? imageData.split("base64,")[1]
      : imageData;
    const imageBytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
    const imageBlob = new Blob([imageBytes], { type: "image/png" });

    // 4. Upload image to NFT.Storage
    console.log("[upload-to-ipfs] 📤 Uploading image...");
    const imgForm = new FormData();
    imgForm.append("file", imageBlob, `${themeName}.png`);

    const imgRes = await fetch("https://api.nft.storage/upload", {
      method: "POST",
      headers: { Authorization: `Bearer ${NFT_STORAGE_KEY}` },
      body: imgForm,
    });

    if (!imgRes.ok) {
      const errorText = await imgRes.text();
      console.error(`[upload-to-ipfs] ❌ Image upload failed: ${imgRes.status}`, errorText);
      return jsonResponse(502, {
        error: "Image upload failed",
        status: imgRes.status,
        detail: errorText,
      });
    }

    const imgJson = await imgRes.json();
    const imageCid = imgJson.value?.cid ?? imgJson.cid;
    if (!imageCid) {
      console.error("[upload-to-ipfs] ❌ No image CID returned");
      return jsonResponse(502, { error: "No image CID returned", raw: imgJson });
    }

    // 5. Upload theme JSON
    console.log("[upload-to-ipfs] 📤 Uploading theme JSON...");
    const themeStr = JSON.stringify(themeData);
    const themeBytes = new TextEncoder().encode(themeStr);
    const themeBlob = new Blob([themeBytes], { type: "application/json" });

    const themeForm = new FormData();
    themeForm.append("file", themeBlob, `${themeName}.theme.json`);

    const themeRes = await fetch("https://api.nft.storage/upload", {
      method: "POST",
      headers: { Authorization: `Bearer ${NFT_STORAGE_KEY}` },
      body: themeForm,
    });

    if (!themeRes.ok) {
      const errorText = await themeRes.text();
      console.error(`[upload-to-ipfs] ❌ Theme upload failed: ${themeRes.status}`, errorText);
      return jsonResponse(502, {
        error: "Theme upload failed",
        status: themeRes.status,
        detail: errorText,
      });
    }

    const themeJson = await themeRes.json();
    const themeCid = themeJson.value?.cid ?? themeJson.cid;
    if (!themeCid) {
      console.error("[upload-to-ipfs] ❌ No theme CID returned");
      return jsonResponse(502, { error: "No theme CID returned", raw: themeJson });
    }

    // 6. Calculate SHA256 hash of theme
    const themeSha256 = await sha256Hex(themeBytes);

    // 7. Create and upload metadata
    console.log("[upload-to-ipfs] 📤 Uploading metadata...");
    const metadata = {
      name: `WCC: ${themeName}`,
      symbol: "WCC",
      description: description ?? "Custom wallet theme created with Wallet Coast Customs",
      image: `ipfs://${imageCid}`,
      attributes: [
        { trait_type: "Schema Version", value: "wcc-theme-v1" },
        { trait_type: "Created At", value: new Date().toISOString() },
      ],
      properties: {
        category: "image",
        files: [
          { uri: `ipfs://${imageCid}`, type: "image/png" },
          { uri: `ipfs://${themeCid}`, type: "application/json" },
        ],
      },
      wcc_theme_uri: `ipfs://${themeCid}`,
      wcc_theme_sha256: themeSha256,
      schemaVersion: "wcc-theme-v1",
    };

    const metaBlob = new Blob([new TextEncoder().encode(JSON.stringify(metadata))], {
      type: "application/json",
    });
    const metaForm = new FormData();
    metaForm.append("file", metaBlob, `${themeName}.metadata.json`);

    const metaRes = await fetch("https://api.nft.storage/upload", {
      method: "POST",
      headers: { Authorization: `Bearer ${NFT_STORAGE_KEY}` },
      body: metaForm,
    });

    if (!metaRes.ok) {
      const errorText = await metaRes.text();
      console.error(`[upload-to-ipfs] ❌ Metadata upload failed: ${metaRes.status}`, errorText);
      return jsonResponse(502, {
        error: "Metadata upload failed",
        status: metaRes.status,
        detail: errorText,
      });
    }

    const metaJson = await metaRes.json();
    const metadataCid = metaJson.value?.cid ?? metaJson.cid;
    if (!metadataCid) {
      console.error("[upload-to-ipfs] ❌ No metadata CID returned");
      return jsonResponse(502, { error: "No metadata CID returned", raw: metaJson });
    }

    // 8. Success response
    console.log(`[upload-to-ipfs] ✅ Success! Metadata CID: ${metadataCid}`);
    return jsonResponse(200, {
      success: true,
      imageCid,
      themeCid,
      metadataCid,
      imageUri: `ipfs://${imageCid}`,
      themeUri: `ipfs://${themeCid}`,
      metadataUri: `ipfs://${metadataCid}`,
      imageUrl: `https://nftstorage.link/ipfs/${imageCid}`,
      themeUrl: `https://nftstorage.link/ipfs/${themeCid}`,
      metadataUrl: `https://nftstorage.link/ipfs/${metadataCid}`,
      themeSha256,
      schemaVersion: "wcc-theme-v1",
    });
  } catch (error) {
    console.error("[upload-to-ipfs] ❌ Unhandled error:", error);
    return jsonResponse(500, {
      error: "Internal Error",
      detail: String(error),
    });
  }
});
