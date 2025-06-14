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

      const response = await fetch('/api/convert-training-data', {
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