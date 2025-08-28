
// Replicate API для извлечения цветовой палитры (заглушка)

export interface ColorPalette {
  primary: string;
  secondary: string;
  bg: string;
  text: string;
}

export async function extractPaletteFromImage(imageBlob: Blob): Promise<ColorPalette> {
  // TODO: Отправить imageBlob в Replicate модель палитры
  // ENV: REPLICATE_API_TOKEN
  
  return Promise.reject('extractPaletteFromImage not implemented yet');
}
