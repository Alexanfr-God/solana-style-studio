
export interface ElementPosition {
  x: number;
  y: number;
  width: number;
  height: number;
}

export const getElementPosition = (element: HTMLElement | null): ElementPosition | null => {
  if (!element) return null;
  
  const rect = element.getBoundingClientRect();
  return {
    x: rect.left,
    y: rect.top,
    width: rect.width,
    height: rect.height
  };
};
