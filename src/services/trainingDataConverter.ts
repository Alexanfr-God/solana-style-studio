/**
 * Service for converting training data to Few-Shot JSON format
 */

export interface TrainingDataConverter {
  convertToFewShots(): Promise<{
    success: boolean;
    processedFiles: number;
    jsonPath: string;
    examples: any[];
  }>;
  
  autoConvertAll(): Promise<{
    success: boolean;
    processedFolders: number;
    results: any[];
  }>;
  
  scanTrainingFolders(): Promise<{
    success: boolean;
    folders: Array<{
      name: string;
      elementType: string;
      hasDescriptions: boolean;
    }>;
  }>;
}

export class TrainingDataConverterService implements TrainingDataConverter {
  private static instance: TrainingDataConverterService;

  static getInstance(): TrainingDataConverterService {
    if (!TrainingDataConverterService.instance) {
      TrainingDataConverterService.instance = new TrainingDataConverterService();
    }
    return TrainingDataConverterService.instance;
  }

  async convertToFewShots() {
    try {
      console.log('🔄 Starting training data conversion...');

      const response = await fetch('https://opxordptvpvzmhakvdde.supabase.co/functions/v1/convert-training-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        console.log(`✅ Successfully converted ${result.processedFiles} files`);
        console.log(`📁 JSON saved to: ${result.jsonPath}`);
      }

      return result;

    } catch (error) {
      console.error('❌ Failed to convert training data:', error);
      throw error;
    }
  }

  async autoConvertAll() {
    try {
      console.log('🔄 Starting auto-conversion of all training folders...');

      const response = await fetch('https://opxordptvpvzmhakvdde.supabase.co/functions/v1/auto-convert-training-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        console.log(`✅ Successfully processed ${result.processedFolders} folders`);
        result.results.forEach((r: any) => {
          if (r.success) {
            console.log(`📁 Created ${r.elementType}/${r.elementName}.json (${r.examplesCount} examples)`);
          } else {
            console.error(`❌ Failed to process ${r.folder}: ${r.error}`);
          }
        });
      }

      return result;

    } catch (error) {
      console.error('❌ Failed to auto-convert training data:', error);
      throw error;
    }
  }

  async scanTrainingFolders() {
    try {
      console.log('🔍 Scanning training folders...');

      // Это упрощенная версия - в реальности можно сделать отдельный endpoint
      const folders = [
        { name: 'image-background1', elementType: 'backgrounds', hasDescriptions: true },
        { name: 'fonts-set1', elementType: 'fonts', hasDescriptions: false },
        { name: 'buttons-style1', elementType: 'buttons', hasDescriptions: false },
        { name: 'icons-pack1', elementType: 'icons', hasDescriptions: false },
      ];

      return {
        success: true,
        folders: folders
      };

    } catch (error) {
      console.error('❌ Failed to scan folders:', error);
      throw error;
    }
  }

  async testConversion() {
    try {
      const result = await this.convertToFewShots();
      console.log('🧪 Test conversion result:', result);
      return result;
    } catch (error) {
      console.error('🧪 Test conversion failed:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const trainingDataConverter = TrainingDataConverterService.getInstance();