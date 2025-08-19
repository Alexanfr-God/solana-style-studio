
# Presets Seeding

## Overview
This document explains how to populate the `presets` table with theme data from the file system.

## Prerequisites
- Supabase service role key
- Theme files in `public/themes/` directory
- `fast-json-patch` package installed

## Running the Seed Script

1. **Set the service role key**:
   ```bash
   export SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
   ```

2. **Run the seed script**:
   ```bash
   node scripts/seed-presets.js
   ```

## What the Script Does

The seed script:
1. Loads `public/themes/defaultTheme.json` as the base theme
2. Reads `public/themes/manifest.json` to get the list of available themes
3. For each theme file:
   - Loads the theme JSON data
   - Generates a JSON patch using `fast-json-patch.compare()`
   - Creates metadata (title, tags, sample_context) from known presets
   - Inserts/updates the preset in the database

## Expected Output

The script will output:
- Number of themes processed
- Any errors encountered
- Final list of seeded presets by slug
- Total count of successfully seeded presets

## Troubleshooting

- **Missing service role key**: Ensure `SUPABASE_SERVICE_ROLE_KEY` is set
- **Theme files not found**: Check that `public/themes/` contains the theme JSON files
- **Database connection issues**: Verify Supabase URL and credentials
- **Permission errors**: Ensure the service role key has the necessary permissions

## Fallback Behavior

If the database is empty or unavailable, the frontend will automatically fall back to loading themes from the file system at `public/themes/manifest.json`.
