/**
 * Auto-mapping tool for wallet elements to JSON paths
 * Analyzes defaultTheme.json structure and suggests json_path for each element
 * 
 * Usage: 
 * 1. Run this script to see suggested mappings
 * 2. Review and approve suggestions
 * 3. Apply to database
 */

import { createClient } from '@supabase/supabase-js';

// Load from environment or use local dev defaults
const SUPABASE_URL = process.env.SUPABASE_URL || 'http://127.0.0.1:54321';
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY || '';
if (!SUPABASE_KEY) {
  console.warn('⚠️  SUPABASE_KEY not found, using local defaults');
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

interface ThemeStructure {
  pages?: {
    [key: string]: {
      components?: any;
      styles?: any;
      assets?: any;
    };
  };
  globals?: any;
}

interface ElementSuggestion {
  elementId: string;
  elementName: string;
  screen: string;
  type: string;
  currentPath: string | null;
  suggestedPath: string;
  confidence: 'high' | 'medium' | 'low';
  reasoning: string;
}

/**
 * Load default theme structure (simplified for script)
 * In production, this would load from public/themes/defaultTheme.json
 */
async function loadThemeStructure(): Promise<ThemeStructure> {
  // Simplified theme structure for mapping
  // In real usage, this would be loaded from the actual theme file
  return {
    pages: {
      homeLayer: { components: {}, styles: {}, assets: {} },
      lockLayer: { components: {}, styles: {}, assets: {} },
      sendLayer: { components: {}, styles: {}, assets: {} },
      receiveLayer: { components: {}, styles: {}, assets: {} },
      buyLayer: { components: {}, styles: {}, assets: {} },
      appsLayer: { components: {}, styles: {}, assets: {} },
      historyLayer: { components: {}, styles: {}, assets: {} },
      searchLayer: { components: {}, styles: {}, assets: {} },
      swapLayer: { components: {}, styles: {}, assets: {} }
    }
  };
}

/**
 * Generate suggestions based on element metadata and theme structure
 */
function generatePathSuggestion(
  element: any,
  theme: ThemeStructure
): { path: string; confidence: 'high' | 'medium' | 'low'; reasoning: string } {
  const { id, name, screen, type, category, description } = element;
  
  // Map screen names to theme structure
  const screenMap: Record<string, string> = {
    'home': 'homeLayer',
    'login': 'lockLayer',
    'send': 'sendLayer',
    'receive': 'receiveLayer',
    'buy': 'buyLayer',
    'apps': 'appsLayer',
    'history': 'historyLayer',
    'search': 'searchLayer',
    'swap': 'swapLayer'
  };

  const themeScreen = screenMap[screen] || screen;
  
  // Check if this screen exists in theme
  if (!theme.pages?.[themeScreen]) {
    return {
      path: `/pages/${themeScreen}/components/${id}`,
      confidence: 'low',
      reasoning: `Screen "${themeScreen}" not found in theme structure (guessed path)`
    };
  }

  const screenData = theme.pages[themeScreen];
  
  // Determine section based on type and category
  let section = 'components';
  let subPath = id;
  
  if (type === 'background' || category === 'backgrounds') {
    section = 'styles';
    subPath = 'backgroundColor';
  } else if (type === 'icon' || category === 'icons') {
    section = 'components';
    // Try to find icon in theme structure
    if (name.toLowerCase().includes('send')) subPath = 'actionButtons/send/icon';
    else if (name.toLowerCase().includes('receive')) subPath = 'actionButtons/receive/icon';
    else if (name.toLowerCase().includes('buy')) subPath = 'actionButtons/buy/icon';
    else subPath = `icons/${id}`;
  } else if (type === 'button' || category === 'buttons') {
    if (name.toLowerCase().includes('send')) subPath = 'actionButtons/send';
    else if (name.toLowerCase().includes('receive')) subPath = 'actionButtons/receive';
    else if (name.toLowerCase().includes('buy')) subPath = 'actionButtons/buy';
    else subPath = `buttons/${id}`;
  } else if (type === 'text' || category === 'typography') {
    section = 'styles';
    subPath = 'textColor';
  } else if (type === 'container') {
    // Check specific containers
    if (name.toLowerCase().includes('account')) subPath = 'accountDropdown';
    else if (name.toLowerCase().includes('balance')) subPath = 'balanceDisplay';
    else if (name.toLowerCase().includes('assets') || name.toLowerCase().includes('list')) subPath = 'assetsList';
    else if (name.toLowerCase().includes('navigation')) subPath = 'bottomNavigation';
    else subPath = id;
  }

  const confidence: 'high' | 'medium' | 'low' = 
    (screenData[section] && typeof screenData[section] === 'object') ? 'high' : 'medium';

  return {
    path: `/pages/${themeScreen}/${section}/${subPath}`,
    confidence,
    reasoning: `Mapped ${type} "${name}" to ${section} based on category and naming`
  };
}

/**
 * Fetch all customizable elements from database
 */
async function fetchElements() {
  const { data, error } = await supabase
    .from('wallet_elements')
    .select('*')
    .eq('customizable', true)
    .order('screen')
    .order('name');

  if (error) {
    console.error('❌ Error fetching elements:', error);
    process.exit(1);
  }

  return data;
}

/**
 * Generate all suggestions
 */
function generateAllSuggestions(elements: any[], theme: ThemeStructure): ElementSuggestion[] {
  return elements.map(el => {
    const suggestion = generatePathSuggestion(el, theme);
    
    return {
      elementId: el.id,
      elementName: el.name,
      screen: el.screen,
      type: el.type,
      currentPath: el.json_path,
      suggestedPath: suggestion.path,
      confidence: suggestion.confidence,
      reasoning: suggestion.reasoning
    };
  });
}

/**
 * Apply suggestions to database
 */
async function applySuggestions(suggestions: ElementSuggestion[], autoApply: boolean = false) {
  console.log('\n📊 Mapping suggestions:\n');
  
  const toApply = autoApply 
    ? suggestions.filter(s => s.confidence === 'high' && !s.currentPath)
    : suggestions;

  let applied = 0;
  let skipped = 0;

  for (const suggestion of toApply) {
    const statusIcon = suggestion.currentPath ? '🔄' : '🆕';
    const confidenceIcon = 
      suggestion.confidence === 'high' ? '✅' : 
      suggestion.confidence === 'medium' ? '⚠️' : '❓';
    
    console.log(`${statusIcon} ${confidenceIcon} [${suggestion.screen}] ${suggestion.elementName}`);
    console.log(`   ID: ${suggestion.elementId}`);
    console.log(`   Current: ${suggestion.currentPath || '(not set)'}`);
    console.log(`   Suggested: ${suggestion.suggestedPath}`);
    console.log(`   Reasoning: ${suggestion.reasoning}`);
    
    if (autoApply && suggestion.confidence === 'high' && !suggestion.currentPath) {
      const { error } = await supabase
        .from('wallet_elements')
        .update({ json_path: suggestion.suggestedPath })
        .eq('id', suggestion.elementId);

      if (error) {
        console.log(`   ❌ Failed to apply: ${error.message}`);
        skipped++;
      } else {
        console.log(`   ✅ Applied!`);
        applied++;
      }
    } else {
      skipped++;
    }
    
    console.log('');
  }

  console.log('\n📈 Summary:');
  console.log(`   Total suggestions: ${suggestions.length}`);
  console.log(`   Applied: ${applied}`);
  console.log(`   Skipped: ${skipped}`);
  console.log(`   High confidence: ${suggestions.filter(s => s.confidence === 'high').length}`);
  console.log(`   Medium confidence: ${suggestions.filter(s => s.confidence === 'medium').length}`);
  console.log(`   Low confidence: ${suggestions.filter(s => s.confidence === 'low').length}`);
}

/**
 * Main function
 */
async function main() {
  console.log('🚀 Auto-mapping tool for wallet elements\n');

  // Load theme structure
  console.log('📂 Loading theme structure...');
  const theme = await loadThemeStructure();
  console.log('✅ Theme loaded\n');

  // Fetch elements
  console.log('📥 Fetching elements from database...');
  const elements = await fetchElements();
  console.log(`✅ Found ${elements.length} customizable elements\n`);

  // Generate suggestions
  console.log('🤖 Generating path suggestions...');
  const suggestions = generateAllSuggestions(elements, theme);
  console.log(`✅ Generated ${suggestions.length} suggestions\n`);

  // Check command line arguments
  const autoApply = process.argv.includes('--apply');
  const applyHigh = process.argv.includes('--apply-high');

  if (applyHigh) {
    console.log('🎯 Auto-applying high-confidence suggestions without existing paths...\n');
    await applySuggestions(suggestions, true);
  } else if (autoApply) {
    console.log('⚠️  --apply flag detected but not implemented for safety');
    console.log('💡 Use --apply-high to apply only high-confidence suggestions\n');
    await applySuggestions(suggestions, false);
  } else {
    console.log('👀 Preview mode (use --apply-high to auto-apply high-confidence suggestions)\n');
    await applySuggestions(suggestions, false);
  }

  console.log('\n✨ Done!');
}

main().catch(console.error);
