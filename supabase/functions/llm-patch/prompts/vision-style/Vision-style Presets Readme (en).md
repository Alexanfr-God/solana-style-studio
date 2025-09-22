# Vision‑Style Presets — README (EN)

**Path:** `supabase/functions/llm-patch/prompts/vision-style/`

This folder contains **few‑shot style presets** for the `vision-style` mode of the `llm-patch` Edge Function. Presets define how extracted palettes (or provided palettes) are mapped onto a Wallet Theme JSON **using only safe `replace` operations** on a **whitelisted set of color paths**. Background images are never modified.

---

## Quick Start

1. **Drop a preset** JSON file here (see schema below). Example files:

   * `01_dark_neon.json`
   * `02_pastel_light.json`
2. From UI (ThemeChat) or via API call, pass `fewShot: "01_dark_neon"` (filename without `.json`).
3. The function returns a `patches` array with only `op: "replace"` on allowed color paths.
4. Apply patches to the current theme on the frontend.

> If `fewShot` is not provided, the function uses the palette extracted by Vision from the uploaded image.

---

## API Usage (Edge Function)

**Endpoint**: `POST /functions/v1/llm-patch`

**Body (example)**:

```json
{
  "mode": "vision-style",
  "imageUrl": "https://example.com/wallet-bg.png",
  "themeId": "current",
  "locale": "en",
  "fewShot": "01_dark_neon"
}
```

**Response (shape)**:

```json
{
  "ok": true,
  "mode": "vision-style",
  "patches": [
    { "op": "replace", "path": "lockLayer.background.color", "value": "#0B0B10" }
    // ...only whitelisted color-like paths
  ],
  "preserved": [
    "lockLayer.backgroundImage",
    "homeLayer.backgroundImage"
  ],
  "stats": { "replaced": 42, "skipped": 7, "coverage": 0.73 }
}
```

---

## Preset File Schema

Each preset is a JSON object with the following fields:

```ts
{
  meta: {
    name: string,
    description?: string,
    tone?: "dark-high-contrast" | "light-soft" | string,
    notes?: string[]
  },
  input: {
    palette: {
      primary: string,
      secondary: string,
      background: string,
      surface: string,
      surfaceAlt?: string,
      textPrimary: string,
      textSecondary: string,
      success?: string,
      error?: string,
      warning?: string,
      info?: string
    }
  },
  whitelistGroups: Record<string, string[]>,
  transform: {
    replace: Array<
      | { targetGroup: string; value: string }
      | { targetGroup: string; map: Record<string, string> }
    >
  },
  constraints?: {
    preserveBackgroundImages?: boolean,
    noAddRemove?: boolean,
    excludePaths?: string[]
  },
  expected?: {
    contrast?: string, // e.g., ">= 4.5:1 for body text"
    vibe?: string,
    i18n?: ("en" | "ru" | string)[]
  }
}
```

### Notes

* `whitelistGroups` contains **dot‑path patterns** (supports wildcards) pointing to color properties in the Theme JSON. Examples:

  * `lockLayer.background.color`
  * `homeLayer.background.color`
  * `receiveLayer.centerContainer.background.color`
  * `*.card.background.color`
  * `*.typography.primary.color`
* `transform.replace` can either set a **single value** for all paths in a group, or provide a **map** for fine‑grained control.
* `constraints.preserveBackgroundImages: true` is recommended and enforced by the function; any `*.backgroundImage` path must not be patched.

---

## Safe‑Ops & Guardrails

* **Only `replace` operations**. No `add` / `remove` / `move` / `copy`.
* **Background images are preserved** (`*.backgroundImage`, `*Image`, `*url*` are excluded by design).
* **No structural changes**: do not create new keys or change types.
* **Denylist** includes, but is not limited to: `*.backgroundImage`, `*Image`, `*url*`, `*radius`, `*spacing`, `*opacity`.

---

## UI Integration (ThemeChat)

* Provide a **dropdown** for presets populated from this folder (the function can expose a `list` endpoint or return available presets as part of a metadata call).
* Call `vision-style` with `fewShot` value from the dropdown.
* Display `stats.coverage` in the UI (e.g., a small badge next to the Analyze button).

---

## Coverage & Whitelists

To increase coverage (percentage of color-like paths affected):

* Extend `supabase/functions/llm-patch/constants/visionColorPaths.ts` to include more groups, for example:

  * `inputs`: `*.input.*.color`, `*.select.*.color`, `*.textarea.*.color`
  * `buttons.states`: `*.button.*.background.color`, `*.button.*.text.color`, `*.button.*.border.color`, `*.button.*.hover.*`, `*.button.*.focus.*`, `*.button.*.disabled.*`
  * `tabs & chips`: `*.tabs.*.color`, `*.tab.*.color`, `*.chip.*.color`, `*.tag.*.color`, `*.badge.*.color`
  * `lists & cards`: `*.list.*.color`, `*.listItem.*.color`, `*.card.border.color`, `*.card.header.*.color`, `*.table.*.color`
  * `overlays`: `*.modal.*.color`, `*.dialog.*.color`, `*.tooltip.*.color`, `*.popover.*.color`, `*.toast.*.color`
  * `borders & dividers`: `*.border.color`, `*.divider.color`, `*.separator.color`
  * `shadows & outlines`: `*.shadow.color`, `*.outline.color`, `*.focusRing.color`
  * `icons (extended)`: `*.icon.*.color`
  * `gradients (color only)`: `*.gradient.from`, `*.gradient.to`, `*.gradient.via`
  * `charts`: `*.chart.*.color`

> Keep the denylist intact. Do not patch non‑color properties.

---

## Troubleshooting

**Low coverage (e.g., \~2%)**

* Whitelist too narrow — add more path patterns as shown above.
* Theme paths differ from patterns — confirm actual keys (case, nesting, naming).
* Path matcher uses dot‑paths — ensure your engine properly expands wildcards.
* Constraints skipped candidates — check `excludePaths` and denylist.

**Patches target images**

* Ensure `preserveBackgroundImages` is enabled and denylist includes `*Image` / `*url*`.

**No visual change**

* UI didn’t apply patches to the active theme instance — verify reducer/store update.
* Overridden at runtime by CSS variables — confirm the final computed style.

---

## Versioning & Naming

* Use numeric prefixes to control ordering in the UI, e.g. `01_*.json`, `02_*.json`.
* Keep names short and descriptive (`dark_neon`, `pastel_light`, `solarized_dark`).
* Treat presets as content — adding a new preset should **not** require code changes if the UI lists files dynamically.

---

## Example Presets

See `01_dark_neon.json` and `02_pastel_light.json` in this folder as working, production‑ready examples.
