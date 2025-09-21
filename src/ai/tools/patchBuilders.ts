import type { Operation } from 'fast-json-patch';
import { BG_TARGETS, type BgTarget } from '@/ai/constants/backgroundTargets';

function addOrReplace(path: string, value: any, theme: any): Operation {
  // Если ключа нет — используем 'add', иначе 'replace'
  const segments = path.split('/').filter(Boolean);
  let cursor = theme;
  for (let i = 0; i < segments.length - 1; i++) {
    if (cursor && typeof cursor === 'object' && segments[i] in cursor) {
      cursor = cursor[segments[i]];
    } else {
      cursor = undefined;
      break;
    }
  }
  const exists = cursor && typeof cursor === 'object' && (segments[segments.length - 1] in cursor);
  return { op: exists ? 'replace' : 'add', path, value };
}

export function buildExclusiveImageOps(targetId: BgTarget['id'], imageUrl: string, theme: any): Operation[] {
  if (targetId === 'ALL') {
    return BG_TARGETS
      .filter(t => t.id !== 'ALL' && t.imgPtr && t.colorPtr)
      .flatMap(t => [
        addOrReplace(t.imgPtr!, imageUrl, theme),
        addOrReplace(t.colorPtr!, '', theme),
      ]);
  }
  const t = BG_TARGETS.find(x => x.id === targetId);
  if (!t || !t.imgPtr || !t.colorPtr) return [];
  return [
    addOrReplace(t.imgPtr, imageUrl, theme),
    addOrReplace(t.colorPtr, '', theme),
  ];
}

// На будущее — для ручного выбора цвета:
export function buildExclusiveColorOps(targetId: BgTarget['id'], rgbaOrHex: string, theme: any): Operation[] {
  if (targetId === 'ALL') {
    return BG_TARGETS
      .filter(t => t.id !== 'ALL' && t.imgPtr && t.colorPtr)
      .flatMap(t => [
        addOrReplace(t.imgPtr!, '', theme),
        addOrReplace(t.colorPtr!, rgbaOrHex, theme),
      ]);
  }
  const t = BG_TARGETS.find(x => x.id === targetId);
  if (!t || !t.imgPtr || !t.colorPtr) return [];
  return [
    addOrReplace(t.imgPtr, '', theme),
    addOrReplace(t.colorPtr, rgbaOrHex, theme),
  ];
}

// Функция для сброса всех примененных изображений и восстановления оригинальных фонов
export function buildResetOps(appliedTargets: string[], theme: any): Operation[] {
  const defaultColors = {
    'lock': 'rgba(31, 41, 55, 0.8)',
    'home': 'rgba(31, 41, 55, 0.9)', 
    'receiveCenter': 'rgba(107, 114, 128, 0.1)',
    'sendCenter': 'rgba(107, 114, 128, 0.1)',
    'buyCenter': 'rgba(75, 85, 99, 0.8)'
  };

  const operations: Operation[] = [];
  
  for (const targetId of appliedTargets) {
    if (targetId === 'ALL') {
      // Если был применен ALL, сбросить все слои
      BG_TARGETS
        .filter(t => t.id !== 'ALL' && t.imgPtr && t.colorPtr)
        .forEach(t => {
          operations.push(addOrReplace(t.imgPtr!, '', theme));
          const defaultColor = defaultColors[t.id as keyof typeof defaultColors];
          if (defaultColor) {
            operations.push(addOrReplace(t.colorPtr!, defaultColor, theme));
          }
        });
    } else {
      const t = BG_TARGETS.find(x => x.id === targetId);
      if (t && t.imgPtr && t.colorPtr) {
        operations.push(addOrReplace(t.imgPtr, '', theme));
        const defaultColor = defaultColors[targetId as keyof typeof defaultColors];
        if (defaultColor) {
          operations.push(addOrReplace(t.colorPtr, defaultColor, theme));
        }
      }
    }
  }
  
  return operations;
}