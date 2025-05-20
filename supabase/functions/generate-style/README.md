
# Generate Style Edge Function

This Edge Function generates wallet UI styles based on user prompts, with awareness of layout requirements for different UI components.

## Architecture

The function is organized in a modular structure:

- `index.ts`: Main entry point that orchestrates the style generation process
- `utils/`:
  - `layoutPrompts.ts`: Generates layout-aware prompts for background images
  - `stylePromptBuilder.ts`: Handles style JSON generation via OpenAI
  - `imageAnalysis.ts`: Functions for image generation and analysis

## Functionality

1. **Input Processing**:
   - Accepts a prompt, optional image URL, layer type, and user ID
   
2. **Layout-Aware Prompt Generation**:
   - Creates enhanced prompts that respect the layout of UI components
   - Different configurations for login screens vs. wallet interfaces
   - Ensures the central area (336x336px) remains visually clear
   - Positions character elements in the top 30-40% of the image
   
3. **Background Image Generation**:
   - Generates a suitable background image using DALL-E if none provided
   - Respects UI layout zones to ensure usability
   - Follows NFT portrait/Web3 avatar composition guidelines
   
4. **Image Analysis**:
   - Extracts dominant colors from uploaded images
   - Can detect objects in images for better style matching
   
5. **Style Generation**:
   - Creates a complete JSON style object with colors, typography, etc.
   - Ensures style is cohesive with the theme and any provided images

## Testing

Use the provided `test/testPayload.json` to test the function:

```bash
curl -X POST https://your-project.functions.supabase.co/generate-style \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  --data @test/testPayload.json
```

## Extension Points

- Add more sophisticated image analysis
- Integrate with user preferences
- Support additional style attributes
- Create theme variation generation

