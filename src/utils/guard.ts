
export function once<T extends (...args: any[]) => any>(fn: T) {
  let busy = false;
  return (...args: Parameters<T>) => {
    if (busy) return;
    busy = true;
    try { 
      return fn(...args); 
    } finally { 
      busy = false; 
    }
  };
}

export function withRenderGuard(name: string) {
  let count = 0;
  return () => {
    if (++count > 100) {
      console.error(`🚨 Render loop detected in ${name} after ${count} renders`);
      throw new Error(`Render loop suspected in ${name}`);
    }
  };
}
