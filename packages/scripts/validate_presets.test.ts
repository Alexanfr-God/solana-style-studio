
import { validatePresets } from './validate_presets';
import * as fs from 'fs';
import * as path from 'path';

// Mock fs module
jest.mock('fs');
const mockFs = fs as jest.Mocked<typeof fs>;

describe('validatePresets', () => {
  const validPresetList = {
    titles: [
      "wolf of wall street", "cz", "superman", "snoop dogg",
      "pepe", "elonmusk", "gorillaz", "mia", 
      "wifTheme", "guccicatluxurytheme", "luxuryTheme", "defaultTheme"
    ]
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockFs.existsSync.mockReturnValue(true);
  });

  test('should pass with valid 12 unique non-empty titles', () => {
    mockFs.readFileSync.mockReturnValue(JSON.stringify(validPresetList));
    
    expect(() => validatePresets()).not.toThrow();
  });

  test('should fail if file does not exist', () => {
    mockFs.existsSync.mockReturnValue(false);
    
    expect(() => validatePresets()).toThrow('Preset list file not found');
  });

  test('should fail with invalid JSON', () => {
    mockFs.readFileSync.mockReturnValue('invalid json');
    
    expect(() => validatePresets()).toThrow('Failed to parse preset list JSON');
  });

  test('should fail with wrong number of titles', () => {
    const wrongCount = { titles: ["one", "two"] };
    mockFs.readFileSync.mockReturnValue(JSON.stringify(wrongCount));
    
    expect(() => validatePresets()).toThrow('Expected exactly 12 presets, got 2');
  });

  test('should fail with empty titles', () => {
    const withEmpty = { ...validPresetList, titles: [...validPresetList.titles.slice(0, 11), ""] };
    mockFs.readFileSync.mockReturnValue(JSON.stringify(withEmpty));
    
    expect(() => validatePresets()).toThrow('Found 1 empty preset titles');
  });

  test('should fail with duplicate titles', () => {
    const withDuplicates = { titles: [...validPresetList.titles.slice(0, 11), "cz"] };
    mockFs.readFileSync.mockReturnValue(JSON.stringify(withDuplicates));
    
    expect(() => validatePresets()).toThrow('Found duplicate preset titles');
  });

  test('should fail if titles is not array', () => {
    const notArray = { titles: "not an array" };
    mockFs.readFileSync.mockReturnValue(JSON.stringify(notArray));
    
    expect(() => validatePresets()).toThrow('Preset list must have "titles" array');
  });
});
