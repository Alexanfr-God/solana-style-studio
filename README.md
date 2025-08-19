# WCC Wallet Customization Studio

Studio for customizing web3 wallet themes through AI-powered chat interface.

## Quick Start (10-15 minutes)

### 1. Clone and Install

```bash
git clone <repository-url>
cd wcc-wallet-studio
npm install
```

### 2. Environment Setup

```bash
# Copy environment template
cp .env.example .env

# Edit .env with your Supabase project details
# Only VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are required
```

### 3. Configure Supabase Secrets

Set server-side secrets in [Supabase Dashboard → Project Settings → Edge Functions → Secrets](https://supabase.com/dashboard/project/opxordptvpvzmhakvdde/settings/functions):

**Required for LLM functionality:**
```bash
# Via Supabase CLI:
supabase secrets set OPENAI_API_KEY=sk-your-key-here

# Via Dashboard: 
# Navigate to Project → Settings → Edge Functions → Add Secret
```

**Feature Flags (server-side):**
```bash
supabase secrets set ASSETS_ENABLED=false
supabase secrets set ICON_LIB_ENABLED=false  
supabase secrets set AI_LOGS_ENABLED=false
```

### 4. Seed Presets (20 Themes)

Load default theme presets into the database:

```bash
# Option A: Using seed script
npm run seed-presets

# Option B: Call Edge Function directly
curl -X POST "$VITE_SUPABASE_URL/functions/v1/admin/seed_presets" \
  -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY"
```

Verify presets loaded: Check Supabase Dashboard → Table Editor → presets (should have ~20 records)

### 5. Development Commands

```bash
# Start development server
npm run dev

# Production build
npm run build  

# TypeScript checks
npm run typecheck

# Code linting
npm run lint
```

### 6. Verify Setup

- Frontend loads at `http://localhost:5173`
- Theme carousel shows presets from database
- Chat interface connects without auth errors
- No 403 "feature disabled" errors (assets are disabled by design)

## API Examples

### LLM Patch (Theme Modification)

```bash
curl -X POST "$VITE_SUPABASE_URL/functions/v1/llm-patch" \
  -H "Authorization: Bearer <user_jwt_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "themeId": "550e8400-e29b-41d4-a716-446655440000",
    "pageId": "home", 
    "userPrompt": "make all buttons gold and increase font size",
    "presetId": "wolf"
  }'

# Expected Response (200):
{
  "valid": true,
  "patch": [
    {"op": "replace", "path": "/pages/home/components/primaryButton/backgroundColor", "value": "#FFD700"}
  ],
  "theme": { /* updated theme object */ },
  "executionTime": 1250
}

# Error Response (400):
{
  "valid": false, 
  "errors": [
    {"path": "pages/home/fontSize", "message": "Expected number, got string"}
  ]
}
```

### Export Theme

```bash
curl "$VITE_SUPABASE_URL/functions/v1/export_theme?themeId=550e8400-e29b-41d4-a716-446655440000" \
  -H "Authorization: Bearer <user_jwt_token>"

# Expected Response (200):
# Content-Type: application/json
# Body: exact current_theme JSON from database
{
  "pages": {
    "home": { /* theme data */ }
  }
  // ... rest of theme
}
```

## Architecture Overview

### 🎨 AI-Powered Theme System
- **User Input**: Natural language prompts ("make buttons purple")  
- **AI Processing**: OpenAI GPT generates JSON Patch operations
- **Validation**: AJV schema validator ensures theme consistency
- **Application**: Patches applied to theme with full rollback support

### 🔐 Row Level Security (RLS)
All data access is user-scoped:
- **Themes**: Users only see their own project themes
- **Patches**: Patch history tied to theme ownership  
- **Profiles**: Wallet addresses scoped to authenticated user
- **Telemetry**: AI request logs private to user

### 📋 Schema Validation (AJV)
- Theme modifications validated against `defaultTheme.schema.json`
- Invalid patches rejected with detailed error messages
- Ensures UI consistency and prevents breaking changes

### 🎛️ Feature Flags
**Client flags** (in `.env`):
- `VITE_ASSETS_ENABLED=false` - Hide asset management UI
- `VITE_ICON_LIB_ENABLED=false` - Disable icon library features  
- `VITE_AI_LOGS_ENABLED=false` - Hide telemetry dashboard

**Server flags** (Supabase Secrets):
- `ASSETS_ENABLED=false` - Block asset API endpoints (returns 403)
- `ICON_LIB_ENABLED=false` - Block icon management endpoints
- `AI_LOGS_ENABLED=false` - Disable AI request logging

### 📊 Telemetry (Optional)
When `AI_LOGS_ENABLED=true`, minimal analytics collected:
- Request performance (`duration_ms`, `patch_len`)  
- Success rates (`status: 'ok'|'error'`)
- **Privacy**: Prompt text never stored, only `prompt_len`
- Patch preview truncated to 2000 characters max

## Troubleshooting

### ❌ CORS Errors in Edge Functions
**Symptom**: `Access-Control-Allow-Origin` errors  
**Fix**: Edge functions return CORS headers on ALL responses (200/400/403/500)

### ❌ "Feature Disabled" 403 Errors  
**Symptom**: `{"error": "feature disabled", "code": "FEATURE_DISABLED"}`  
**Expected**: This is normal when `ASSETS_ENABLED=false` or `ICON_LIB_ENABLED=false`  
**Action**: Enable flags or ignore if assets intentionally disabled

### ❌ AJV Schema Validation Errors
**Symptom**: `{"valid": false, "errors": [...]}`  
**Debug**: Check `errors[].path` for invalid field, `errors[].message` for constraint  
**Example**: `"pages/home/fontSize": "Expected number, got string"`

### ❌ RLS Permission Errors
**Symptom**: 403/404 errors when accessing themes  
**Causes**:
- Invalid `themeId` (not UUID format)
- Theme belongs to different user  
- User not authenticated (missing/invalid JWT)
**Fix**: Verify theme ownership and valid auth token

### ❌ Missing Presets  
**Symptom**: Empty theme carousel  
**Fix**: Run preset seed (see Quick Start step 4)  
**Verify**: Check `presets` table has ~20 records with `payload.patch[]`

### ❌ TypeScript Build Errors
**Check**: Ensure `tsc --noEmit` passes  
**Common**: Missing imports, type mismatches in theme objects  
**Fix**: Run `npm run typecheck` for detailed error locations

## Development

### Adding New Presets
1. Add entry to `supabase/functions/admin/seed_presets/index.ts`
2. Include `payload.patch[]` and `payload.sample_context`  
3. Re-run seed function
4. Verify appears in theme carousel

### Extending Theme Schema  
1. Update `packages/schema/defaultTheme.schema.json`
2. Test schema validation with AJV
3. Update theme interfaces in TypeScript
4. Re-seed schema versions table

### Contributing Guidelines
- All theme changes via JSON Patch (no direct theme mutations)
- Maintain RLS policies for data isolation  
- Feature flags for experimental functionality
- AJV validation for schema compliance
- Minimal telemetry with privacy-first approach

---

## Technical Stack

- **Frontend**: React + TypeScript + Tailwind CSS
- **Backend**: Supabase Edge Functions + PostgreSQL  
- **AI**: OpenAI GPT-4 for theme generation
- **Validation**: JSON Schema + AJV for consistency
- **State**: Zustand for theme management
- **Patches**: fast-json-patch for modifications

## Privacy & Security

- 🔐 **RLS**: All data user-scoped with PostgreSQL policies
- 🛡️ **Validation**: AJV prevents malformed themes  
- 📊 **Telemetry**: Prompt text never stored, only metrics
- 🎛️ **Feature Flags**: Granular control over functionality
- 🔑 **Secrets**: Server keys isolated in Supabase Edge Functions
