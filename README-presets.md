
# Presets System

This project uses a hybrid approach for loading presets - it attempts to load from Supabase first, then falls back to the file system if needed.

## Database Schema

The `presets` table has the following structure:
- `id`: UUID primary key
- `slug`: Unique text identifier (matches theme file names)  
- `title`: Human-readable name
- `cover_url`: URL to preview image
- `tags`: JSONB array of tags
- `payload`: JSONB object containing:
  - `patch`: JSON patch operations to transform default theme
  - `sample_context`: Description for AI context

## Seeding Presets

To populate the database with presets from theme files:

1. Set the service role key:
```bash
export SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

2. Run the seed script:
```bash
node scripts/seed-presets.js
```

The script will:
- Read all theme files from `public/themes/`
- Generate JSON patches by comparing each theme to `defaultTheme.json`
- Insert/update records in the `presets` table
- Include metadata like titles, tags, and sample contexts

## How it Works

1. **Primary**: Load presets from Supabase `presets` table
2. **Fallback**: Load from `public/themes/manifest.json` if DB fails
3. **Theme Application**: Apply JSON patches locally using `fast-json-patch`

The system is designed to be resilient - if Supabase is unavailable, it gracefully falls back to the file-based system that was used previously.

## Available Presets

The system includes 20+ presets covering various styles:
- Luxury themes (Wolf of Wall Street, Gucci Cat)  
- Tech themes (CZ Minimalist, Elon Musk)
- Cultural themes (China, Mexico)
- Entertainment themes (Superman, Simpsons, Nirvana)
- Meme themes (Pepe, WIF)
- And more...

Each preset includes appropriate tags and AI context for intelligent theme application.
