# 🎨 Theme Apply Pipeline Architecture

**Version:** 2.0 (Manual = Git Full Apply)  
**Last Updated:** 2025-10-12

---

## 📊 Architecture Overview

```
┌──────────────────────────────────────────────────────────────────┐
│                     TWO MODES, ONE PIPELINE                      │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Manual Editor              Git/File Load                       │
│       │                           │                              │
│       v                           v                              │
│  updateThemeValue          setTheme(theme)                       │
│  (mode:'full')                    │                              │
│       │                           │                              │
│       v                           v                              │
│  theme-updated             theme-updated                         │
│  { forceFullApply:true }   { theme }                             │
│       │                           │                              │
│       └───────────┬───────────────┘                              │
│                   v                                              │
│         applyThemeToDOM(theme) ← UNIFIED PIPELINE                │
│                   │                                              │
│                   v                                              │
│         [All element mappings]                                   │
│                   │                                              │
│                   v                                              │
│         applyValueToNodeUnified() ← SINGLE MAPPER                │
│                   │                                              │
│                   v                                              │
│             DOM Updated ✅                                        │
│                                                                  │
│      RESULT: Manual и Git дают одинаковый визуальный эффект     │
└──────────────────────────────────────────────────────────────────┘
```

---

## 🔑 Key Principles

### **1. Manual = Git**
- Manual Editor и Git/File изменения идут **через один и тот же код**
- **Один** мэппер (`applyValueToNodeUnified`)
- **Один** алгоритм применения (`applyThemeToDOM`)
- **Результат:** Абсолютно идентичный визуальный эффект

### **2. Full Apply Only**
- Manual Editor **всегда** делает полный apply (`mode: 'full'`)
- Никаких конкатенаций путей
- Никаких эвристик "property to edit"
- `json_path` используется **как есть**

### **3. Scalar Paths Only**
- `wallet_elements.json_path` **всегда** указывает на скаляр
- ✅ `/assetCard/backgroundColor` → `"#444"`
- ❌ `/assetCard` → `{ backgroundColor: "#444", ... }`

---

## 📁 File Structure

```
src/
├── components/customization/
│   └── ManualColorEditor.tsx         ← Manual UI (mode:'full')
├── state/
│   └── themeStore.ts                 ← Theme state + history
├── services/
│   ├── runtimeMappingEngine.ts       ← DOM apply logic
│   └── jsonBridgeService.ts          ← DB sync
└── utils/
    └── styleUtils.ts                 ← Helper utilities

docs/
├── THEME_APPLY_PIPELINE.md           ← This file
└── json-path-validation-report.md    ← Validation audit

scripts/
└── validate-json-paths.ts            ← Path validator
```

---

## 🔄 Data Flow

### **Mode 1: Manual Editor**

```typescript
// User picks color in Manual Editor
↓
ManualColorEditor.applyColor()
  ↓
themeStore.updateThemeValue(path, value, { mode: 'full' })
  ↓
1) Update local theme state
2) Dispatch: window.dispatchEvent('theme-updated', {
     theme,
     forceFullApply: true  // ← Key flag
   })
3) Async save to DB
  ↓
runtimeMappingEngine.handleThemeUpdate()
  ↓
if (forceFullApply) {
  // Bypass anti-echo guard
  applyThemeToDOM(theme)  // ← Full apply
}
  ↓
For each mapping in wallet_elements:
  - Find DOM element by selector
  - Get value from theme by json_path
  - Call applyValueToNodeUnified(el, path, value)
  ↓
DOM updated ✅
```

### **Mode 2: Git/File Load**

```typescript
// User edits theme.json on GitHub / loads preset
↓
useUserThemeLoader() / setTheme()
  ↓
themeStore.setTheme(theme)
  ↓
Dispatch: window.dispatchEvent('theme-updated', { theme })
  ↓
runtimeMappingEngine.handleThemeUpdate()
  ↓
if (!updatedPath && !forceFullApply) {
  // Full apply by default
  applyThemeToDOM(theme)
}
  ↓
[Same pipeline as Manual]
  ↓
DOM updated ✅
```

---

## 🗄️ Database Contract: `wallet_elements`

### **Required Fields**

```sql
CREATE TABLE wallet_elements (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  selector TEXT NOT NULL,   -- CSS selector (preferably data-element-id)
  json_path TEXT,           -- MUST point to scalar value
  screen TEXT,
  type TEXT,
  updated_at TIMESTAMP
);
```

### **Rules**

#### **1. `selector` → Exact DOM Node**

✅ **Preferred:**
```sql
selector = '[data-element-id="home-send-button"]'
```

⚠️ **Acceptable:**
```sql
selector = '.send-button'  -- If unique
```

❌ **Avoid:**
```sql
selector = '.button'  -- Too generic
```

#### **2. `json_path` → Scalar Value**

✅ **Correct:**
```sql
json_path = '/assetCard/backgroundColor'           → "#444444"
json_path = '/assetCard/title/textColor'           → "#FFFFFF"
json_path = '/homeLayer/actionButtons/sendButton/containerColor'  → "#6B7280"
```

❌ **Wrong:**
```sql
json_path = '/assetCard'              → { backgroundColor: "...", ... }
json_path = '/assetCard/title'        → { textColor: "...", fontFamily: "..." }
```

### **Examples by Screen**

<details>
<summary><strong>Lock Screen</strong></summary>

```sql
-- Lock background
{ id: 'lock-background', json_path: '/lockLayer/backgroundColor' }

-- Lock title
{ id: 'lock-title', json_path: '/lockLayer/title/textColor' }

-- Password input
{ id: 'lock-password-input', json_path: '/lockLayer/passwordInput/backgroundColor' }

-- Unlock button
{ id: 'lock-unlock-button', json_path: '/lockLayer/unlockButton/backgroundColor' }
```
</details>

<details>
<summary><strong>Home Screen (Asset Cards)</strong></summary>

```sql
-- Asset card container
{ id: 'home-asset-item', json_path: '/assetCard/backgroundColor' }

-- Asset name (e.g., "Solana")
{ id: 'home-asset-name', json_path: '/assetCard/title/textColor' }

-- Asset symbol (e.g., "12.45 SOL")
{ id: 'home-asset-symbol', json_path: '/assetCard/description/textColor' }

-- Asset value (e.g., "$2,150")
{ id: 'home-asset-value', json_path: '/assetCard/value/textColor' }
```
</details>

<details>
<summary><strong>Home Screen (Action Buttons)</strong></summary>

```sql
-- Send button: container (background)
{ id: 'home-send-button', json_path: '/homeLayer/actionButtons/sendButton/containerColor' }

-- Send button: icon
{ id: 'home-send-icon', json_path: '/homeLayer/actionButtons/sendButton/iconColor' }

-- Send button: label text
{ id: 'home-send-label', json_path: '/homeLayer/actionButtons/sendButton/labelColor' }

-- (Repeat for receive, buy, swap buttons)
```
</details>

---

## 🛠️ Unified Mapper Logic

**Location:** `src/services/runtimeMappingEngine.ts` → `applyValueToNodeUnified()`

### **Key Mappings**

| Theme Key | CSS Property | Logic |
|-----------|-------------|-------|
| `containerColor` | `backgroundColor` | Solid or gradient |
| `backgroundColor` | `backgroundColor` | Solid or gradient |
| `textColor` | `color` | Direct |
| `color` | `color` | Direct |
| `labelColor` | `color` | Direct |
| `iconColor` | `color` | Direct |
| `borderColor` | `borderColor` | Direct |
| `borderRadius` | `borderRadius` | Direct |
| `background` | `background` | Direct (for gradients) |

### **Special Handling**

**1. Background Image Protection:**
```typescript
if (key === 'backgroundcolor' || key === 'containercolor') {
  if (hasBackgroundImageAtSameNode(theme, jsonPath)) {
    console.log('🛡️ Skip backgroundColor (backgroundImage present)');
    return;
  }
}
```

**2. Gradient vs Solid:**
```typescript
if (value.includes('linear-gradient') || value.includes('radial-gradient')) {
  el.style.background = value;
} else {
  el.style.backgroundColor = value;
}
```

---

## 🐛 Debugging

### **Enable Debug Logs**

```javascript
// In DevTools Console
localStorage.setItem('WCC_DEBUG', '1');
location.reload();
```

### **Expected Console Output**

**1. Manual Editor:**
```
[ManualEdit] 🎨 Color changed: { path: "/assetCard/backgroundColor", value: "#FF0000" }
[ManualEdit] 🎨 Applying: { mode: "full", userId: "0x..." }
```

**2. Theme Store:**
```
[ThemeStore] 📝 Update: { path: "/assetCard/backgroundColor", value: "#FF0000", mode: "full" }
[ThemeStore] 📢 Event: FULL apply
```

**3. Runtime Engine:**
```
[Runtime] 🔄 FORCED full apply (Manual mode)
[Runtime] 🔄 Full apply: 42 mappings
[Runtime] ✅ Applied backgroundColor to #wallet-root [data-element-id="home-asset-item"]
[Runtime] ✅ Full apply complete: 15 applied
```

### **Common Issues**

| Issue | Cause | Fix |
|-------|-------|-----|
| "mapping not found" | Element missing in `wallet_elements` | Add to DB |
| "0 nodes found" | Selector doesn't match DOM | Update `selector` in DB |
| "unmapped key" | json_path key not in mapper | Add to `applyValueToNodeUnified` |
| "Objects are not valid as React child" | json_path points to object | Fix to scalar path (see migration) |

---

## ✅ Acceptance Criteria

### **Test Case 1: Lock Title**
```
1. Element Edit → select "lock-title"
2. Manual Editor → pick #9333EA (purple)
3. Apply Color
✅ Only lock title text changes
❌ Background, button, input unchanged
```

### **Test Case 2: Asset Card Container**
```
1. Element Edit → select "home-asset-item"
2. Manual Editor → pick #EF4444 (red)
3. Apply Color
✅ Entire Solana card background turns red
❌ Other asset cards (Bitcoin, ETH) unchanged
```

### **Test Case 3: Send Button Container**
```
1. Element Edit → select "home-send-button"
2. Manual Editor → pick #10B981 (green)
3. Apply Color
✅ Send button background (square container) turns green
❌ Icon inside button unchanged
```

### **Test Case 4: Send Button Icon**
```
1. Element Edit → select "home-send-icon"
2. Manual Editor → pick #FBBF24 (yellow)
3. Apply Color
✅ Only icon inside Send button turns yellow
❌ Button background, label text unchanged
```

### **Test Case 5: Send Button Label**
```
1. Element Edit → select "home-send-label"
2. Manual Editor → pick #F97316 (orange)
3. Apply Color
✅ Only "Send" text turns orange
❌ Button background, icon unchanged
```

### **🎯 Critical Check: Manual = Git**

For each test case above:
1. Note the color value (e.g., `#EF4444`)
2. Open `theme.json` in GitHub
3. Edit the same `json_path` to the same value
4. Commit → reload app
5. **Visual result MUST be identical**

---

## 📋 Validation Process

### **1. Run Path Validator**

```bash
bun run scripts/validate-json-paths.ts
```

**Expected Output:**
```
✅ Valid paths: 80+
❌ Problems found: 0

🎉 All json_path values are valid!
```

### **2. Check Selectors**

For critical elements, verify `data-element-id` attributes exist in DOM:

```javascript
// In DevTools Console
document.querySelectorAll('[data-element-id]').length  // Should be 80+

// Check specific element
document.querySelector('[data-element-id="home-send-button"]')  // Should exist
```

---

## 🧹 Cleanup Checklist

### **Completed:**
- ✅ Removed `PathAnalyzer` imports from `ManualColorEditor.tsx`
- ✅ Removed "Property to edit" UI dropdown
- ✅ Removed path concatenation logic
- ✅ Removed prefix heuristics (e.g., `startsWith('/colors')`)
- ✅ Fixed all `wallet_elements` paths to scalars

### **Preserved (for other modes):**
- ✅ `applyStyleToPath()` — Used for targeted updates (not Manual)
- ✅ `applyPreviewPatch()` — Used for AI preview
- ✅ `applyPatch()` — Used for AI final apply

---

## 📦 Migration History

| Migration | Date | Description |
|-----------|------|-------------|
| `20251012152024` | 2025-10-12 | Initial 13 critical elements (home action buttons, asset card) |
| `20251012153637` | 2025-10-12 | Comprehensive fix: ~60 elements across all screens |

---

## 🚀 Next Steps

### **Phase 5: Post-Acceptance Cleanup**
1. Archive `src/services/pathAnalyzer.ts` (no longer used)
2. Remove dead imports across codebase
3. Update TypeScript types to remove `PathAnalysis`

### **Phase 6: Expand Coverage**
1. Add missing elements (e.g., `receive-*`, `sidebar-*`)
2. Validate all screens (Lock, Unlock, Home, Send, Receive, Buy, Swap, Apps, History)
3. Ensure 100% `data-element-id` coverage

### **Phase 7: Performance Optimization**
1. Batch DOM updates to reduce reflow
2. Add throttling for rapid Manual Editor changes
3. Profile `applyThemeToDOM` for large themes

---

## 📚 Related Documentation

- [Validation Report](./json-path-validation-report.md) — Detailed audit of all paths
- [Troubleshooting Guide](https://docs.lovable.dev/tips-tricks/troubleshooting) — Common issues
- [Supabase Schema](../supabase/migrations/) — Database structure

---

## 💡 FAQs

**Q: Why "Manual = Git"?**  
A: To ensure consistent behavior across all editing methods. Users expect the same visual result whether they edit manually or via theme files.

**Q: Why full apply instead of targeted?**  
A: Simplicity and reliability. Targeted updates require complex dependency tracking. Full apply is fast enough (<100ms) and guarantees correctness.

**Q: What if I add a new element?**  
A: Add it to `wallet_elements` table with a scalar `json_path`. Run validator to confirm. Update DOM to include `data-element-id` attribute.

**Q: Can I use nested paths?**  
A: Yes, but they MUST end at a scalar. `/lockLayer/title/textColor` is valid. `/lockLayer/title` (object) is not.

---

**Last Updated:** 2025-10-12  
**Maintained by:** Wallet Customization Team  
**Status:** ✅ Production Ready
