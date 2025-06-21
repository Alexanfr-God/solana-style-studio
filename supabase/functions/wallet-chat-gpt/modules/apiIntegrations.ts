
// External API integrations (Google Fonts, etc.)
export async function fetchGoogleFonts(): Promise<string[]> {
  try {
    // Placeholder for Google Fonts API integration
    return [
      'Inter', 'Roboto', 'Open Sans', 'Lato', 'Montserrat',
      'Source Sans Pro', 'Raleway', 'PT Sans', 'Lora', 'Merriweather'
    ];
  } catch (error) {
    console.error('❌ Error fetching Google Fonts:', error);
    return ['Inter']; // fallback
  }
}

export async function validateImageUrl(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    return response.ok && response.headers.get('content-type')?.startsWith('image/');
  } catch {
    return false;
  }
}
