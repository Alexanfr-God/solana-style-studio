/**
 * Generate JSON Patch operations from color palette
 * STRICT MODE: Only replace operations, never add/remove
 */

import { Operation } from 'https://esm.sh/fast-json-patch@3.1.1';
import { Palette } from './extractPalette.ts';

// Default safe prefixes for color modifications
export const DEFAULT_SAFE_PREFIXES = [
  "/lockLayer", "/homeLayer", "/sidebarLayer",
  "/receiveLayer", "/sendLayer", "/swapLayer",
  "/appsLayer", "/historyLayer", "/searchLayer",
  "/globalSearchInput", "/assetCard", "/global", "/inputs",
  "/sidebar", "/dropdownMenu", "/assetContainer", "/assetList"
];

// Keys that indicate a color property
const COLOR_KEYS_RE = /(color|Color|textColor|borderColor|iconColor|backgroundColor)$/;

// Keys that must never be modified (images, URLs, etc.)
const FORBIDDEN_KEYS_RE = /(image|url|src|backgroundImage|icon|svg|path|href)/i;

/**
 * Check if value is a hex or rgba color
 */
function isHexOrRgba(v: any): boolean {
  if (typeof v !== 'string') return false;
  return /^#([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i.test(v) || /^rgba?\(/i.test(v);
}

/**
 * Check if value looks like a URL
 */
function looksLikeUrl(v: any): boolean {
  if (typeof v !== 'string') return false;
  return /(https?:\/\/|supabase\.co|data:image|blob:|\.png|\.jpg|\.jpeg|\.svg|\.gif)/i.test(v);
}

/**
 * Convert hex to RGB string for rgba()
 */
function hexToRgb(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return '255, 255, 255';
  
  const r = parseInt(result[1], 16);
  const g = parseInt(result[2], 16);
  const b = parseInt(result[3], 16);
  
  return `${r}, ${g}, ${b}`;
}

/**
 * Convert hex to rgba string with alpha
 */
function toRgba(hex: string, alpha: number = 1): string {
  return `rgba(${hexToRgb(hex)}, ${alpha})`;
}

/**
 * Get object by path (e.g., "/homeLayer/header" -> theme.homeLayer.header)
 */
function getObjectByPath(obj: any, path: string): any {
  const parts = path.split('/').filter(p => p);
  let current = obj;
  for (const part of parts) {
    if (!current || typeof current !== 'object') return undefined;
    current = current[part];
  }
  return current;
}

/**
 * Decide which color from palette to use based on path and key
 */
function decideColor(path: string, key: string, palette: Palette): string {
  const k = key.toLowerCase();
  const lc = path.toLowerCase();
  
  // Text and icon colors - always use foreground
  if (k.endsWith('textcolor') || k === 'textcolor' || k.endsWith('iconcolor') || k === 'iconcolor') {
    return palette.fg;
  }
  
  // Border colors - foreground with transparency
  if (k.endsWith('bordercolor') || k === 'bordercolor') {
    return toRgba(palette.fg, 0.24);
  }
  
  // Buttons and interactive elements
  if (lc.includes('button') || lc.includes('unlock') || lc.includes('action')) {
    // Button text/icons
    if (k.includes('text') || k.includes('icon')) {
      return palette.fg;
    }
    // Button background
    if (k.includes('background') || k.includes('color')) {
      return palette.primary;
    }
  }
  
  // Sidebar specific elements
  if (lc.includes('sidebar') || lc.includes('/sidebar')) {
    if (k.includes('background')) {
      return palette.neutral;
    }
    if (k.includes('text') || k.includes('icon')) {
      return palette.fg;
    }
    if (k.includes('border')) {
      return toRgba(palette.fg, 0.24);
    }
  }
  
  // Dropdown menu specific elements
  if (lc.includes('dropdown') || lc.includes('menu')) {
    if (k.includes('background')) {
      return palette.neutral;
    }
    if (k.includes('text')) {
      return palette.fg;
    }
    if (k.includes('border')) {
      return toRgba(palette.fg, 0.24);
    }
  }
  
  // Asset containers and lists
  if (lc.includes('asset') || lc.includes('assetcontainer') || lc.includes('assetlist')) {
    if (k.includes('background')) {
      return palette.neutral;
    }
    if (k.includes('text')) {
      return palette.fg;
    }
    if (k.includes('border')) {
      return toRgba(palette.fg, 0.12);
    }
  }
  
  // Main layer backgrounds
  if (lc.includes('/homelayer/backgroundcolor') || lc.includes('/locklayer/backgroundcolor')) {
    return palette.bg;
  }
  
  // Cards, containers, headers, footers
  if (lc.includes('header') || lc.includes('footer') || lc.includes('container') || lc.includes('card')) {
    return palette.neutral;
  }
  
  // Default background colors
  if (k.includes('background')) {
    return palette.bg;
  }
  
  // Fallback to foreground
  return palette.fg;
}

/**
 * Generate patch operations from palette
 */
export function generatePatchFromPalette(
  palette: Palette,
  currentTheme: any,
  safePrefixes: string[] = DEFAULT_SAFE_PREFIXES,
  allowFontChange: boolean = false
): Operation[] {
  const ops: Operation[] = [];
  const stack: Array<{ v: any; p: string }> = [{ v: currentTheme, p: "" }];
  
  console.log('[GENERATE-PATCH] 🎨 Starting patch generation');
  console.log('[GENERATE-PATCH] 📋 Safe prefixes:', safePrefixes);
  console.log('[GENERATE-PATCH] 🎨 Palette:', palette);
  
  // Check if path is within safe prefixes
  const withinSafe = (path: string): boolean => {
    if (safePrefixes.length === 0) return true;
    return safePrefixes.some(pref => path.startsWith(pref));
  };

  let processedPaths = 0;
  let skippedPaths = 0;
  let replacedColors = 0;

  while (stack.length > 0) {
    const { v, p } = stack.pop()!;
    processedPaths++;
    
    // Handle arrays
    if (Array.isArray(v)) {
      v.forEach((item, i) => stack.push({ v: item, p: `${p}/${i}` }));
      continue;
    }
    
    // Handle objects
    if (v && typeof v === "object") {
      for (const [k, val] of Object.entries(v)) {
        const child = `${p}/${k}`;
        
        // Recurse into nested objects
        if (val && typeof val === "object" && !Array.isArray(val)) {
          stack.push({ v: val, p: child });
          continue;
        }
        
        // Only modify within safe prefixes
        if (!withinSafe(child)) {
          skippedPaths++;
          continue;
        }
        
        // Ignore forbidden keys (images, URLs, etc.)
        if (FORBIDDEN_KEYS_RE.test(k)) {
          continue;
        }
        
        // Ignore URL values
        if (looksLikeUrl(val)) {
          continue;
        }
        
        // Replace color values
        if (COLOR_KEYS_RE.test(k) && isHexOrRgba(val)) {
          // Skip backgroundColor if backgroundImage exists in parent
          if (k.toLowerCase().includes('background') && k.toLowerCase().includes('color')) {
            const parentPath = child.substring(0, child.lastIndexOf('/'));
            const parentObj = getObjectByPath(currentTheme, parentPath);
            if (parentObj && parentObj.backgroundImage) {
              continue; // Don't change backgroundColor if backgroundImage is present
            }
          }
          
          const nextColor = decideColor(child, k, palette);
          if (nextColor && nextColor !== val) {
            ops.push({ 
              op: "replace", 
              path: child, 
              value: nextColor 
            });
            replacedColors++;
          }
        }
        
        // Font changes (if enabled)
        // TODO: Add font replacement with whitelist when needed
        // if (allowFontChange && k === 'fontFamily' && typeof val === 'string') {
        //   const FONT_WHITELIST = ['Inter', 'Poppins', 'Rubik', 'JetBrains Mono'];
        //   // Logic here
        // }
      }
    }
  }
  
  console.log('[GENERATE-PATCH] ✅ Patch generation complete');
  console.log('[GENERATE-PATCH] 📊 Processed paths:', processedPaths);
  console.log('[GENERATE-PATCH] 📊 Skipped paths (outside safe zones):', skippedPaths);
  console.log('[GENERATE-PATCH] 📊 Replaced colors:', replacedColors);
  console.log('[GENERATE-PATCH] 📊 Total operations:', ops.length);
  
  return ops;
}
