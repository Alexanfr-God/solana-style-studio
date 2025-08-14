
import { useRef } from "react";

export function useRenderGuard(limit = 100) {
  const cnt = useRef(0);
  
  if (process.env.NODE_ENV === 'development') {
    cnt.current++;
    if (cnt.current > limit) {
      console.error(`Render loop detected: ${cnt.current} renders`);
      throw new Error("Render loop detected");
    }
  }
  
  return cnt.current;
}
