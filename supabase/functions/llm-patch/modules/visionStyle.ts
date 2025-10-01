import { Operation } from 'https://esm.sh/fast-json-patch@3.1.1';
import { extractPaletteLocal, ExtractedPalette } from '../lib/palette.ts';
import { VISION_COLOR_PATHS, IMAGE_PROTECTED_PATHS, isAllowedVisionPath } from '../constants/visionColorPaths.ts';

export interface VisionStyleRequest {
  mode: 'vision-style';
  imageUrl: string;
  themeSnapshot: Record<string, any>;
  targets: string[];
  rules?: {
    exclusiveBg?: boolean;
    onlyReplace?: boolean;
    preserveSemanticColors?: boolean;
  };
  lang?: 'en' | 'ru';
}

export interface VisionStyleResponse {
  message: string;
  ops: Operation[];
}

// Проверить наличие backgroundImage в теме по базовому пути
function hasBackgroundImage(theme: any, basePath: string): boolean {
  const segments = basePath.split('/').filter(Boolean);
  let cursor = theme;
  
  for (const segment of segments) {
    if (cursor && typeof cursor === 'object' && segment in cursor) {
      cursor = cursor[segment];
    } else {
      return false;
    }
  }
  
  return cursor && typeof cursor === 'object' && 
         'backgroundImage' in cursor && 
         cursor.backgroundImage && 
         cursor.backgroundImage !== '';
}

// Создать replace операцию
function createReplaceOp(path: string, value: any): Operation {
  return { op: 'replace', path, value };
}

// Применить палитру к путям с учетом правил
function buildVisionColorOps(
  palette: ExtractedPalette,
  theme: any,
  rules: VisionStyleRequest['rules'] = {}
): Operation[] {
  const ops: Operation[] = [];
  const { exclusiveBg = true, onlyReplace = true, preserveSemanticColors = true } = rules;
  
  console.log('[VISION] Building ops with palette:', palette);
  console.log('[VISION] Rules:', rules);
  
  const changedPaths: string[] = [];
  const skippedPaths: string[] = [];
  
  // Center backgrounds - только если нет backgroundImage
  for (const path of VISION_COLOR_PATHS.centerBackgrounds) {
    if (!isAllowedVisionPath(path)) continue;
    
    // Проверяем базовый путь на наличие backgroundImage
    const basePath = path.replace('/backgroundColor', '');
    const protectedPath = IMAGE_PROTECTED_PATHS.find(p => basePath.startsWith(p));
    
    if (protectedPath && hasBackgroundImage(theme, protectedPath)) {
      console.log('[VISION] ⏭️  Skipping', path, '- backgroundImage exists');
      skippedPaths.push(path);
      continue;
    }
    
    ops.push(createReplaceOp(path, palette.bg));
    changedPaths.push(path);
    console.log('[VISION] ✅ Changed', path, '→', palette.bg);
  }
  
  // Secondary backgrounds (с прозрачностью)
  for (const path of VISION_COLOR_PATHS.secondaryBackgrounds) {
    if (!isAllowedVisionPath(path)) continue;
    
    // Конвертируем bg в rgba с прозрачностью
    const bgWithAlpha = convertToRgba(palette.bg, 0.12);
    ops.push(createReplaceOp(path, bgWithAlpha));
    changedPaths.push(path);
    console.log('[VISION] ✅ Changed', path, '→', bgWithAlpha);
  }
  
  // Text colors (контрастный текст)
  for (const path of VISION_COLOR_PATHS.textColors) {
    if (!isAllowedVisionPath(path)) continue;
    
    // Пропускаем семантические цвета если preserveSemanticColors = true
    if (preserveSemanticColors && (
      path.includes('positiveColor') || 
      path.includes('negativeColor') ||
      path.includes('successColor') ||
      path.includes('failedColor') ||
      path.includes('pendingColor')
    )) {
      skippedPaths.push(path);
      console.log('[VISION] ⏭️  Skipping', path, '- semantic color');
      continue;
    }
    
    ops.push(createReplaceOp(path, palette.text));
    changedPaths.push(path);
    console.log('[VISION] ✅ Changed', path, '→', palette.text);
  }
  
  // Accent colors (кнопки и активные элементы)
  for (const path of VISION_COLOR_PATHS.accentColors) {
    if (!isAllowedVisionPath(path)) continue;
    ops.push(createReplaceOp(path, palette.accent));
    changedPaths.push(path);
    console.log('[VISION] ✅ Changed', path, '→', palette.accent);
  }
  
  console.log('[VISION] 📊 Summary: Changed', changedPaths.length, 'paths, Skipped', skippedPaths.length, 'paths');
  console.log('[VISION] Generated', ops.length, 'operations');
  return ops;
}

// Конвертировать hex в rgba с прозрачностью
function convertToRgba(hex: string, alpha: number): string {
  // Убираем # если есть
  hex = hex.replace('#', '');
  
  // Конвертируем в RGB
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  
  return `rgba(${r},${g},${b},${alpha})`;
}

// Определить язык сообщений
function detectLanguage(lang?: string): 'en' | 'ru' {
  return lang === 'ru' ? 'ru' : 'en';
}

// Форматировать итоговое сообщение
function formatMessage(palette: ExtractedPalette, opsCount: number, lang: 'en' | 'ru'): string {
  if (lang === 'ru') {
    return `Применена палитра: фон ${palette.bg} • текст ${palette.text} • акцент ${palette.accent} • изменено ${opsCount} полей`;
  } else {
    return `Applied palette: bg ${palette.bg} • text ${palette.text} • accent ${palette.accent} • updated ${opsCount} fields`;
  }
}

// Основная функция обработки Vision-запроса
export async function processVisionStyle(
  request: VisionStyleRequest,
  supabase: any
): Promise<VisionStyleResponse> {
  const startTime = Date.now();
  
  try {
    console.log('[VISION] Processing vision-style request');
    console.log('[VISION] Image URL:', request.imageUrl);
    console.log('[VISION] Targets:', request.targets);
    
    // Валидация входных данных
    if (!request.imageUrl || !request.themeSnapshot) {
      throw new Error('Missing required fields: imageUrl or themeSnapshot');
    }
    
    // Валидация targets
    const allowedTargets = [
      'lockLayer',
      'homeLayer', 
      'receiveLayer.centerContainer',
      'sendLayer.centerContainer',
      'buyLayer.centerContainer'
    ];
    
    for (const target of request.targets) {
      if (!allowedTargets.includes(target)) {
        throw new Error(`Invalid target: ${target}`);
      }
    }
    
    // Извлекаем палитру из изображения
    console.log('[VISION] Extracting palette...');
    const palette = await extractPaletteLocal(request.imageUrl);
    
    // Генерируем операции
    console.log('[VISION] Building color operations...');
    const ops = buildVisionColorOps(palette, request.themeSnapshot, request.rules);
    
    if (ops.length === 0) {
      throw new Error('No operations generated - all paths may be protected by existing images');
    }
    
    // Определяем язык и форматируем сообщение
    const lang = detectLanguage(request.lang);
    const message = formatMessage(palette, ops.length, lang);
    
    const executionTime = Date.now() - startTime;
    console.log('[VISION] Completed in', executionTime, 'ms');
    
    return {
      message,
      ops
    };
    
  } catch (error) {
    const executionTime = Date.now() - startTime;
    console.error('[VISION] Error processing request:', error);
    
    // Возвращаем ошибку в правильном формате
    const lang = detectLanguage(request.lang);
    const errorMessage = lang === 'ru' 
      ? `Ошибка анализа: ${error.message}`
      : `Analysis error: ${error.message}`;
    
    return {
      message: errorMessage,
      ops: []
    };
  }
}