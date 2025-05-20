
// Style prompt builder module that handles OpenAI interactions for style generation

/**
 * Builds a style prompt for OpenAI and processes the response
 * @param prompt User's original prompt
 * @param layerType Type of wallet layer (login or wallet)
 * @param apiKey OpenAI API key
 * @returns JSON style object
 */
export async function buildStylePrompt(
  prompt: string,
  layerType: string,
  apiKey: string
): Promise<Record<string, any>> {
  console.log("Generating style attributes based on theme");
  
  const stylePrompt = `
    Generate a cohesive style profile for a ${layerType === "login" ? "login screen" : "wallet interface"} 
    with theme: "${prompt}".
    
    Return ONLY valid JSON with these properties:
    {
      "backgroundColor": "hex color code for background", 
      "backgroundImage": "URL of generated image or gradient",
      "accentColor": "hex color for accent elements",
      "textColor": "hex color for text that ensures readability",
      "buttonColor": "hex color for buttons",
      "buttonTextColor": "hex color for button text",
      "borderRadius": "radius value (e.g., '12px', '0px', etc.)",
      "fontFamily": "appropriate font family",
      "boxShadow": "appropriate shadow value",
      "styleNotes": "brief description of the style"
    }
  `;

  const styleResponse = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are a design system generator that creates wallet UI styles. Return only valid JSON that matches the requested format." },
        { role: "user", content: stylePrompt }
      ]
    })
  });

  if (!styleResponse.ok) {
    const errorData = await styleResponse.json();
    throw new Error(`OpenAI API error: ${JSON.stringify(errorData)}`);
  }

  const styleData = await styleResponse.json();
  let styleContent = styleData.choices[0].message.content;
  
  // Clean the response to ensure it's valid JSON
  styleContent = styleContent.replace(/```json|```/g, "").trim();
  console.log("Style content generated:", styleContent.substring(0, 100) + "...");
  
  try {
    return JSON.parse(styleContent);
  } catch (error) {
    console.error("Error parsing style JSON:", error);
    throw new Error("Failed to parse style data");
  }
}
