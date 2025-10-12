/**
 * JSON Path Validator for wallet_elements
 * Validates that all json_path values:
 * 1. Point to existing keys in defaultTheme.json
 * 2. Point to scalar values (not objects)
 * 3. Match the expected data type
 */

import { supabase } from '../src/integrations/supabase/client';
import defaultTheme from '../public/themes/defaultTheme.json';

interface ValidationProblem {
  id: string;
  name: string;
  selector: string;
  json_path: string;
  screen: string | null;
  type: string;
  issue: string;
  currentValue?: any;
  valueType?: string;
}

/**
 * Get value from theme by JSON path
 */
function getByPath(obj: any, path: string): any {
  if (!path || path === '/') return obj;
  
  const keys = path.split('/').filter(Boolean);
  let current = obj;
  
  for (const key of keys) {
    if (current === null || current === undefined) {
      return undefined;
    }
    current = current[key];
  }
  
  return current;
}

/**
 * Check if value is scalar (string, number, boolean, null)
 */
function isScalar(value: any): boolean {
  return value === null || 
         typeof value === 'string' || 
         typeof value === 'number' || 
         typeof value === 'boolean';
}

/**
 * Validate a single json_path
 */
function validatePath(element: any): ValidationProblem | null {
  const { id, name, selector, json_path, screen, type } = element;
  
  // Check if path exists in theme
  const value = getByPath(defaultTheme, json_path);
  
  if (value === undefined) {
    return {
      id,
      name,
      selector,
      json_path,
      screen,
      type,
      issue: '❌ PATH_NOT_FOUND: json_path does not exist in defaultTheme.json',
      currentValue: undefined,
      valueType: 'undefined'
    };
  }
  
  // Check if value is scalar
  if (!isScalar(value)) {
    return {
      id,
      name,
      selector,
      json_path,
      screen,
      type,
      issue: `❌ NOT_SCALAR: json_path points to object/array (keys: ${Object.keys(value).join(', ')})`,
      currentValue: value,
      valueType: typeof value
    };
  }
  
  return null; // No problems
}

/**
 * Run validation on all wallet_elements
 */
async function runValidation() {
  console.log('🔍 Starting json_path validation...\n');
  
  // Fetch all elements from database
  const { data: elements, error } = await supabase
    .from('wallet_elements')
    .select('id, name, selector, json_path, screen, type')
    .order('screen', { ascending: true })
    .order('id', { ascending: true });
  
  if (error) {
    console.error('❌ Database error:', error);
    return;
  }
  
  if (!elements || elements.length === 0) {
    console.log('⚠️ No elements found in wallet_elements table');
    return;
  }
  
  console.log(`📊 Validating ${elements.length} elements...\n`);
  
  const problems: ValidationProblem[] = [];
  const valid: any[] = [];
  
  // Validate each element
  for (const element of elements) {
    const problem = validatePath(element);
    if (problem) {
      problems.push(problem);
    } else {
      valid.push(element);
    }
  }
  
  // Print report
  console.log('═'.repeat(80));
  console.log('📋 VALIDATION REPORT');
  console.log('═'.repeat(80));
  console.log(`✅ Valid paths: ${valid.length}`);
  console.log(`❌ Problems found: ${problems.length}\n`);
  
  if (problems.length > 0) {
    console.log('🔴 PROBLEMS DETECTED:\n');
    
    // Group by issue type
    const pathNotFound = problems.filter(p => p.issue.includes('PATH_NOT_FOUND'));
    const notScalar = problems.filter(p => p.issue.includes('NOT_SCALAR'));
    
    if (pathNotFound.length > 0) {
      console.log(`❌ PATH_NOT_FOUND (${pathNotFound.length}):`);
      console.log('─'.repeat(80));
      pathNotFound.forEach(p => {
        console.log(`  ID: ${p.id}`);
        console.log(`  Name: ${p.name}`);
        console.log(`  Selector: ${p.selector}`);
        console.log(`  Path: ${p.json_path}`);
        console.log(`  Screen: ${p.screen || 'N/A'}`);
        console.log(`  Type: ${p.type}`);
        console.log();
      });
    }
    
    if (notScalar.length > 0) {
      console.log(`❌ NOT_SCALAR (${notScalar.length}):`);
      console.log('─'.repeat(80));
      notScalar.forEach(p => {
        console.log(`  ID: ${p.id}`);
        console.log(`  Name: ${p.name}`);
        console.log(`  Selector: ${p.selector}`);
        console.log(`  Path: ${p.json_path}`);
        console.log(`  Current Value Type: ${p.valueType}`);
        if (p.currentValue && typeof p.currentValue === 'object') {
          console.log(`  Available Keys: ${Object.keys(p.currentValue).join(', ')}`);
        }
        console.log(`  Screen: ${p.screen || 'N/A'}`);
        console.log();
      });
    }
    
    // Generate SQL fixes
    console.log('═'.repeat(80));
    console.log('🛠️ SUGGESTED SQL FIXES:');
    console.log('═'.repeat(80));
    console.log('-- Copy this SQL to fix the issues:\n');
    
    problems.forEach(p => {
      if (p.issue.includes('NOT_SCALAR')) {
        // Suggest common scalar paths
        const basePath = p.json_path;
        console.log(`-- Fix: ${p.id} (${p.name})`);
        console.log(`-- Current: ${basePath} -> object`);
        console.log(`-- Suggestion: Add property name (e.g., /backgroundColor, /textColor)`);
        console.log(`UPDATE wallet_elements SET json_path = '${basePath}/backgroundColor', updated_at = NOW() WHERE id = '${p.id}';`);
        console.log();
      } else if (p.issue.includes('PATH_NOT_FOUND')) {
        console.log(`-- Fix: ${p.id} (${p.name})`);
        console.log(`-- Path not found: ${p.json_path}`);
        console.log(`-- TODO: Manually verify correct path in defaultTheme.json`);
        console.log(`-- UPDATE wallet_elements SET json_path = '<correct_path>', updated_at = NOW() WHERE id = '${p.id}';`);
        console.log();
      }
    });
  } else {
    console.log('🎉 All json_path values are valid!');
  }
  
  console.log('═'.repeat(80));
  console.log('✅ Validation complete');
  console.log('═'.repeat(80));
  
  return { problems, valid };
}

// Run validation
runValidation().catch(console.error);
