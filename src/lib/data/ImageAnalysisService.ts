import { ImageAnalysis, AnalyzeImageRequest, AnalyzeImageResponse, HuggingFaceResponse } from '@/types/image-analysis';

export default class ImageAnalysisService {
  private huggingFaceToken?: string;

  // written as a class to encapsulate functionality and allow for potential future expansion
  // such as different analysis providers or additional methods
  // also allows for easier mocking in tests
  // constructor can accept a token for Hugging Face API, or use the one from environment
  // variables if not provided
  constructor(huggingFaceToken?: string) {
    this.huggingFaceToken = huggingFaceToken || process.env.HUGGING_FACE_API_TOKEN;
  }

  async analyzeImage(request: AnalyzeImageRequest): Promise<AnalyzeImageResponse> {
    try {
      // Convert base64 to blob for Hugging Face API
      // Note: Ensure the API URL is correct in your environment. Must be explicitly set in .env due to Next.js server-side rendering not being aware of the current URL.
      const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: AnalyzeImageResponse = await response.json();
      return result;
    } catch (error) {
      console.error('Error during image analysis:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  async analyzeWithHuggingFace(imageData: string): Promise<HuggingFaceResponse> {
    try {
      if (!this.huggingFaceToken) {
        throw new Error('Hugging Face API token not provided');
      }

      // Convert base64 to binary
      const binaryData = this.base64ToBlob(imageData);

      const response = await fetch(
        `https://api-inference.huggingface.co/models/google/vit-base-patch16-224`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.huggingFaceToken}`,
            'Content-Type': 'application/octet-stream',
          },
          body: binaryData,
        }
      );

      if (!response.ok) {
        throw new Error(`Hugging Face API error: ${response.status}`);
      }

      const results = await response.json();
      return {
        results: results.slice(0, 5), // Top 5 predictions
      };
    } catch (error) {
      console.error('Error during Hugging Face analysis:', error);
      return {
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  async fetchAll(): Promise<ImageAnalysis[]> {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/images`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching images:', error);
      return [];
    }
  }

  async getById(id: string): Promise<ImageAnalysis | null> {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/images/${id}`);
      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching image by ID:', error);
      return null;
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/images/${id}`, {
        method: 'DELETE',
      });
      return response.ok;
    } catch (error) {
      console.error('Error deleting image:', error);
      return false;
    }
  }

  async update(id: string, update: Partial<ImageAnalysis>): Promise<ImageAnalysis | null> {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/images/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(update),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating image:', error);
      return null;
    }
  }

  // Utility methods
  private base64ToBlob(base64: string): Blob {
    // Remove data URL prefix if present
    const base64Data = base64.replace(/^data:image\/[a-z]+;base64,/, '');
    const binaryString = atob(base64Data);
    const bytes = new Uint8Array(binaryString.length);
    
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    
    return new Blob([bytes]);
  }

  convertFileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result);
        } else {
          reject(new Error('Failed to convert file to base64'));
        }
      };
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });
  }

  validateImageFile(file: File): boolean {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (!allowedTypes.includes(file.type)) {
      throw new Error('Invalid file type. Please upload JPEG, PNG, WebP, or GIF images.');
    }

    if (file.size > maxSize) {
      throw new Error('File size too large. Please upload images smaller than 10MB.');
    }

    return true;
  }
}
