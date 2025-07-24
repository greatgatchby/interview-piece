// Core image analysis types
export interface ImageTag {
  id: string;
  label: string;
  confidence: number;
  created_at: string;
}

export interface ImageAnalysis {
  id: string;
  filename: string;
  originalName: string;
  fileSize: number;
  mimeType: string;
  imageUrl: string;
  tags: ImageTag[];
  status: 'uploading' | 'processing' | 'completed' | 'error';
  error?: string;
  created_at: string;
  updated_at: string;
}

// API request/response types
export interface AnalyzeImageRequest {
  imageData: string; // base64 encoded image
  filename: string;
  mimeType: string;
}

export interface AnalyzeImageResponse {
  success: boolean;
  analysis?: ImageAnalysis;
  error?: string;
}

export interface ImageUploadData {
  file: File;
  preview: string;
  status: 'pending' | 'uploading' | 'processing' | 'completed' | 'error';
  analysis?: ImageAnalysis;
  error?: string;
}

// Hugging Face API types
export interface HuggingFaceClassificationResult {
  label: string;
  score: number;
}

export interface HuggingFaceResponse {
  results?: HuggingFaceClassificationResult[];
  error?: string;
}

// Store state types
export interface ImageAnalysisState {
  images: ImageAnalysis[];
  uploads: ImageUploadData[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  addUpload: (upload: ImageUploadData) => void;
  updateUpload: (id: string, update: Partial<ImageUploadData>) => void;
  removeUpload: (id: string) => void;
  clearUploads: () => void;
  
  addAnalysis: (analysis: ImageAnalysis) => void;
  updateAnalysis: (id: string, update: Partial<ImageAnalysis>) => void;
  removeAnalysis: (id: string) => void;
  clearAnalyses: () => void;
  
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}
