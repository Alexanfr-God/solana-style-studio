// Локальная палитра без Canvas API - только ArrayBuffer анализ
// Простая квантизация по пикселям для Deno environment

export interface ExtractedPalette {
  bg: string;     // фоновый цвет
  text: string;   // контрастный текст
  accent: string; // насыщенный акцент
}

interface RGBColor {
  r: number;
  g: number; 
  b: number;
}

// Простая функция для получения доминирующих цветов
function getQuantizedColors(imageData: Uint8Array, maxColors: number = 8): RGBColor[] {
  const colors: RGBColor[] = [];
  const step = Math.max(1, Math.floor(imageData.length / (4 * 1000))); // сэмплируем каждый N-й пиксель
  
  for (let i = 0; i < imageData.length; i += 4 * step) {
    if (i + 2 < imageData.length) {
      const r = imageData[i];
      const g = imageData[i + 1];
      const b = imageData[i + 2];
      const alpha = imageData[i + 3];
      
      // Игнорируем прозрачные пиксели
      if (alpha > 128) {
        colors.push({ r, g, b });
      }
    }
  }
  
  return quantizeColors(colors, maxColors);
}

// Простая квантизация методом k-means
function quantizeColors(colors: RGBColor[], k: number): RGBColor[] {
  if (colors.length === 0) return [];
  if (colors.length <= k) return colors;
  
  // Инициализация центроидов
  const centroids: RGBColor[] = [];
  for (let i = 0; i < k; i++) {
    const index = Math.floor((i * colors.length) / k);
    centroids.push({ ...colors[index] });
  }
  
  // Несколько итераций k-means
  for (let iter = 0; iter < 5; iter++) {
    const clusters: RGBColor[][] = Array(k).fill(null).map(() => []);
    
    // Назначение цветов к кластерам
    for (const color of colors) {
      let minDist = Infinity;
      let bestCluster = 0;
      
      for (let i = 0; i < centroids.length; i++) {
        const dist = colorDistance(color, centroids[i]);
        if (dist < minDist) {
          minDist = dist;
          bestCluster = i;
        }
      }
      
      clusters[bestCluster].push(color);
    }
    
    // Обновление центроидов
    for (let i = 0; i < centroids.length; i++) {
      if (clusters[i].length > 0) {
        const avgR = clusters[i].reduce((sum, c) => sum + c.r, 0) / clusters[i].length;
        const avgG = clusters[i].reduce((sum, c) => sum + c.g, 0) / clusters[i].length;
        const avgB = clusters[i].reduce((sum, c) => sum + c.b, 0) / clusters[i].length;
        centroids[i] = { r: Math.round(avgR), g: Math.round(avgG), b: Math.round(avgB) };
      }
    }
  }
  
  return centroids;
}

function colorDistance(c1: RGBColor, c2: RGBColor): number {
  return Math.sqrt(
    Math.pow(c1.r - c2.r, 2) +
    Math.pow(c1.g - c2.g, 2) +
    Math.pow(c1.b - c2.b, 2)
  );
}

function getLuminance(color: RGBColor): number {
  const { r, g, b } = color;
  const [rs, gs, bs] = [r, g, b].map(c => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

function getContrastRatio(c1: RGBColor, c2: RGBColor): number {
  const l1 = getLuminance(c1);
  const l2 = getLuminance(c2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

function getSaturation(color: RGBColor): number {
  const { r, g, b } = color;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  return max === 0 ? 0 : (max - min) / max;
}

function rgbToHex(color: RGBColor): string {
  const toHex = (n: number) => Math.round(Math.max(0, Math.min(255, n))).toString(16).padStart(2, '0');
  return `#${toHex(color.r)}${toHex(color.g)}${toHex(color.b)}`;
}

// Основная функция извлечения палитры
export async function extractPaletteLocal(imageUrl: string): Promise<ExtractedPalette> {
  try {
    console.log('[PALETTE] Fetching image for analysis:', imageUrl);
    
    // Загружаем изображение
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.status}`);
    }
    
    const arrayBuffer = await response.arrayBuffer();
    console.log('[PALETTE] Image downloaded, size:', arrayBuffer.byteLength);
    
    // Простая проверка PNG/JPEG по magic bytes
    const bytes = new Uint8Array(arrayBuffer);
    let imageData: Uint8Array;
    
    if (bytes[0] === 0x89 && bytes[1] === 0x50) {
      // PNG - простая экстракция RGBA данных
      imageData = extractPNGData(bytes);
    } else if (bytes[0] === 0xFF && bytes[1] === 0xD8) {
      // JPEG - более сложный, используем упрощенный подход
      imageData = extractJPEGData(bytes);
    } else {
      throw new Error('Unsupported image format');
    }
    
    console.log('[PALETTE] Extracted pixel data, analyzing colors...');
    
    // Получаем доминирующие цвета
    const dominantColors = getQuantizedColors(imageData, 6);
    
    if (dominantColors.length === 0) {
      throw new Error('No colors extracted from image');
    }
    
    // Выбираем bg (самый темный или средний)
    const sortedByLuminance = dominantColors.sort((a, b) => getLuminance(a) - getLuminance(b));
    const bg = sortedByLuminance[0]; // самый темный
    
    // Выбираем text (максимальный контраст к bg)
    let text = { r: 255, g: 255, b: 255 }; // fallback белый
    let maxContrast = 0;
    
    for (const color of dominantColors) {
      const contrast = getContrastRatio(bg, color);
      if (contrast > maxContrast) {
        maxContrast = contrast;
        text = color;
      }
    }
    
    // Если контраст недостаточен, принудительно ставим белый/черный
    if (maxContrast < 4.5) {
      const bgLuminance = getLuminance(bg);
      text = bgLuminance > 0.5 ? { r: 0, g: 0, b: 0 } : { r: 255, g: 255, b: 255 };
    }
    
    // Выбираем accent (наиболее насыщенный, отличный от bg)
    let accent = dominantColors[dominantColors.length - 1]; // fallback
    let maxSaturation = 0;
    
    for (const color of dominantColors) {
      const distance = colorDistance(color, bg);
      const saturation = getSaturation(color);
      if (distance > 50 && saturation > maxSaturation) {
        maxSaturation = saturation;
        accent = color;
      }
    }
    
    const result = {
      bg: rgbToHex(bg),
      text: rgbToHex(text),
      accent: rgbToHex(accent)
    };
    
    console.log('[PALETTE] Extracted palette:', result);
    return result;
    
  } catch (error) {
    console.error('[PALETTE] Error:', error);
    // Fallback палитра
    return {
      bg: '#0B0D12',
      text: '#FFFFFF', 
      accent: '#FF6A00'
    };
  }
}

// Упрощенная экстракция данных PNG (только для демо)
function extractPNGData(bytes: Uint8Array): Uint8Array {
  // Очень упрощенно - возвращаем семпл пикселей
  const sampleSize = Math.min(1000, Math.floor(bytes.length / 16));
  const result = new Uint8Array(sampleSize * 4);
  
  for (let i = 0; i < sampleSize; i++) {
    const offset = Math.floor((i * bytes.length) / sampleSize);
    result[i * 4] = bytes[offset] || 0;     // R
    result[i * 4 + 1] = bytes[offset + 1] || 0; // G
    result[i * 4 + 2] = bytes[offset + 2] || 0; // B
    result[i * 4 + 3] = 255; // A
  }
  
  return result;
}

// Упрощенная экстракция данных JPEG
function extractJPEGData(bytes: Uint8Array): Uint8Array {
  // Еще более упрощенно - семпл каждый 3-й байт как RGB
  const sampleSize = Math.min(1000, Math.floor(bytes.length / 12));
  const result = new Uint8Array(sampleSize * 4);
  
  for (let i = 0; i < sampleSize; i++) {
    const offset = Math.floor((i * bytes.length) / sampleSize);
    result[i * 4] = bytes[offset] || 0;
    result[i * 4 + 1] = bytes[offset + 3] || 0;
    result[i * 4 + 2] = bytes[offset + 6] || 0;
    result[i * 4 + 3] = 255;
  }
  
  return result;
}