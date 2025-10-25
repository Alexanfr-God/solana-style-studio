// supabase/functions/upload-to-ipfs/index.ts
// ✅ Pure Deno runtime - Lighthouse.storage implementation

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

// Helper: Upload blob to Lighthouse
async function uploadBlobToLighthouse(
  blob: Blob,
  filename: string,
  apiKey: string
): Promise<string> {
  const fd = new FormData();
  fd.append('file', blob, filename);

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout

  const res = await fetch('https://upload.lighthouse.storage/api/v0/add', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}` },
    body: fd,
    signal: controller.signal,
  });

  clearTimeout(timeoutId);

  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Lighthouse upload failed: ${res.status} ${txt}`);
  }

  // Response format: { Hash: "bafyrei...", Name: "file.png", Size: "1234" }
  const data = await res.json();
  return data.Hash as string;
}

// Helper: Convert CID to IPFS URI
function toIpfsUri(cid: string): string {
  return `ipfs://${cid}`;
}

// Helper: Convert CID to Gateway URL
function toGatewayUrl(cid: string): string {
  return `https://gateway.lighthouse.storage/ipfs/${cid}`;
}

// Helper: SHA256 hash of string
async function sha256HexFromString(input: string): Promise<string> {
  const enc = new TextEncoder();
  const buf = enc.encode(input);
  const hash = await crypto.subtle.digest('SHA-256', buf);
  return Array.from(new Uint8Array(hash))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // 1. Check for Lighthouse API key
    const LIGHTHOUSE_API_KEY = Deno.env.get("LIGHTHOUSE_API_KEY");
    if (!LIGHTHOUSE_API_KEY) {
      console.error("[upload-to-ipfs] ❌ Missing LIGHTHOUSE_API_KEY");
      return jsonResponse(500, { 
        success: false,
        message: "Missing LIGHTHOUSE_API_KEY in environment" 
      });
    }

    // 2. Parse request body
    const body = await req.json().catch(() => ({}));
    const { previewImageUrl, themeName, description, themeData } = body as {
      previewImageUrl?: string;
      themeName?: string;
      description?: string;
      themeData?: any;
    };

    console.log("[upload-to-ipfs] 🚀 Start", {
      hasTheme: !!themeData,
      themeName,
      previewUrl: previewImageUrl,
    });

    if (!previewImageUrl || !themeName || !themeData) {
      console.error("[upload-to-ipfs] ❌ Missing required fields");
      return jsonResponse(400, {
        success: false,
        message: "previewImageUrl, themeName, and themeData are required",
      });
    }

    // 3. Download preview image from URL
    console.log("[upload-to-ipfs] 📥 Downloading preview image...");
    const imageRes = await fetch(previewImageUrl);
    if (!imageRes.ok) {
      throw new Error(`Failed to download preview image: ${imageRes.status} ${imageRes.statusText}`);
    }
    const imageBlob = await imageRes.blob();
    console.log("[upload-to-ipfs] ✅ Image downloaded:", {
      size: `${(imageBlob.size / 1024).toFixed(2)} KB`,
      type: imageBlob.type
    });

    // 4. Upload image to Lighthouse
    console.log("[upload-to-ipfs] 📤 Uploading image to Lighthouse...");
    const imageCid = await uploadBlobToLighthouse(
      imageBlob,
      `${themeName}.png`,
      LIGHTHOUSE_API_KEY
    );
    console.log("[upload-to-ipfs] ✅ Image uploaded:", { cid: imageCid });

    // 5. Upload theme JSON (if provided)
    let themeCid: string | undefined;
    let themeSha256: string | undefined;

    if (themeData) {
      console.log("[upload-to-ipfs] 📤 Uploading theme JSON to Lighthouse...");
      const themeStr = JSON.stringify(themeData);
      themeSha256 = await sha256HexFromString(themeStr);
      
      const themeBlob = new Blob([new TextEncoder().encode(themeStr)], {
        type: "application/json",
      });
      
      themeCid = await uploadBlobToLighthouse(
        themeBlob,
        `${themeName}.theme.json`,
        LIGHTHOUSE_API_KEY
      );
      console.log("[upload-to-ipfs] ✅ Theme uploaded:", { cid: themeCid, sha256: themeSha256 });
    }

    // 6. Build Metaplex-compatible metadata
    const metadata = {
      name: `WCC: ${themeName}`,
      symbol: "WCC",
      description: description ?? "Custom wallet theme created with Wallet Coast Customs",
      image: toGatewayUrl(imageCid), // HTTP URL for Solscan display
      external_url: "https://walletcoastcustoms.com",
      attributes: [
        { trait_type: "Theme Name", value: themeName },
        { trait_type: "Schema Version", value: "wcc-theme-v1" },
        { trait_type: "Created At", value: new Date().toISOString() },
      ],
      properties: {
        theme: themeData, // ✅ Full theme JSON for Apply button
        category: "image",
        files: [
          { uri: toIpfsUri(imageCid), type: "image/png" },
          ...(themeCid ? [{ uri: toIpfsUri(themeCid), type: "application/json" }] : []),
        ],
      },
      ...(themeCid && { wcc_theme_uri: toIpfsUri(themeCid) }),
      ...(themeSha256 && { wcc_theme_sha256: themeSha256 }),
      schemaVersion: "wcc-theme-v1",
    };

    // 7. Upload metadata to Lighthouse
    console.log("[upload-to-ipfs] 📤 Uploading metadata to Lighthouse...");
    const metaBlob = new Blob([JSON.stringify(metadata)], {
      type: "application/json",
    });

    const metadataCid = await uploadBlobToLighthouse(
      metaBlob,
      `${themeName}.metadata.json`,
      LIGHTHOUSE_API_KEY
    );
    console.log("[upload-to-ipfs] ✅ Metadata uploaded:", { cid: metadataCid });

    // 8. Success response (backward compatible)
    console.log("[upload-to-ipfs] ✅ Success! All files uploaded to Lighthouse");
    return jsonResponse(200, {
      success: true,
      
      // Primary fields
      imageCid,
      imageUri: toIpfsUri(imageCid),
      imageUrl: toGatewayUrl(imageCid),
      
      themeCid: themeCid ?? null,
      themeUri: themeCid ? toIpfsUri(themeCid) : null,
      themeUrl: themeCid ? toGatewayUrl(themeCid) : null,
      themeSha256: themeSha256 ?? null,
      
      metadataCid,
      metadataUri: toIpfsUri(metadataCid),
      metadataUrl: toGatewayUrl(metadataCid),
      
      schemaVersion: "wcc-theme-v1",
      
      // Backward compatibility aliases
      metadata_uri: toIpfsUri(metadataCid),
      image_url: toGatewayUrl(imageCid),
      theme_cid: themeCid ?? null,
    });
  } catch (error) {
    console.error("[upload-to-ipfs] ❌ Unhandled error:", error);
    
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorName = error instanceof Error ? error.name : '';
    
    // Timeout-specific error handling
    if (errorName === 'AbortError' || errorMessage.includes('ETIMEDOUT') || errorMessage.includes('timed out')) {
      return jsonResponse(504, {
        success: false,
        message: "Upload timeout (>60s). Try a smaller file or retry later.",
        detail: errorMessage,
      });
    }
    
    // Lighthouse-specific error handling
    if (errorMessage.includes('401')) {
      return jsonResponse(401, {
        success: false,
        message: "Invalid or expired LIGHTHOUSE_API_KEY",
        detail: errorMessage,
      });
    }
    
    if (errorMessage.includes('413')) {
      return jsonResponse(413, {
        success: false,
        message: "File too large (max 100MB per file)",
        detail: errorMessage,
      });
    }
    
    return jsonResponse(500, {
      success: false,
      message: "Internal server error during IPFS upload",
      detail: errorMessage,
    });
  }
});
