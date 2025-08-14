
import * as fs from 'fs';
import * as path from 'path';

interface PresetList {
  titles: string[];
}

export function validatePresets(): string[] {
  const presetPath = path.join(process.cwd(), 'packages/prompts/presets/preset_list.json');
  
  if (!fs.existsSync(presetPath)) {
    throw new Error(`Preset list file not found: ${presetPath}`);
  }

  let presetData: PresetList;
  try {
    const content = fs.readFileSync(presetPath, 'utf-8');
    presetData = JSON.parse(content);
  } catch (error) {
    throw new Error(`Failed to parse preset list JSON: ${error}`);
  }

  if (!presetData.titles || !Array.isArray(presetData.titles)) {
    throw new Error('Preset list must have "titles" array');
  }

  const { titles } = presetData;

  // Check exactly 12 titles
  if (titles.length !== 12) {
    throw new Error(`Expected exactly 12 presets, got ${titles.length}`);
  }

  // Check for empty strings
  const emptyTitles = titles.filter(title => !title || title.trim() === '');
  if (emptyTitles.length > 0) {
    throw new Error(`Found ${emptyTitles.length} empty preset titles`);
  }

  // Check for duplicates
  const uniqueTitles = new Set(titles);
  if (uniqueTitles.size !== titles.length) {
    throw new Error(`Found duplicate preset titles. Unique: ${uniqueTitles.size}, Total: ${titles.length}`);
  }

  console.log('✅ Preset validation passed: 12 unique non-empty titles');
  return titles;
}

// Allow running directly
if (require.main === module) {
  try {
    validatePresets();
    console.log('Validation successful!');
  } catch (error) {
    console.error('❌ Validation failed:', error.message);
    process.exit(1);
  }
}
