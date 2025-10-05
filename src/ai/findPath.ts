
// Поиск существующих путей в JSON структуре темы

export function getExistingPath(theme: any, candidates: string[]): string | null {
  for (const path of candidates) {
    const parts = path.split('.');
    let current = theme;
    let exists = true;
    
    for (const key of parts) {
      if (current && typeof current === 'object' && key in current) {
        current = current[key];
      } else {
        exists = false;
        break;
      }
    }
    
    if (exists) {
      return path;
    }
  }
  
  return null;
}

// Утилита для установки значения по пути
export function setByPath(obj: any, path: string, value: any): void {
  // Поддержка путей с `/` и `.`
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  const parts = cleanPath.split(/[/.]/);
  const last = parts.pop()!;
  let current = obj;
  
  for (const part of parts) {
    current[part] ??= {};
    current = current[part];
  }
  
  current[last] = value;
}
