import { create } from 'zustand';
import { ImageAnalysis, ImageUploadData, ImageAnalysisState } from '@/types/image-analysis';

//using a zustand store to manage image analysis state
// this allows for easy state management across components without prop drilling
// zustand is a small, fast and scalable state management solution for React
// it provides a simple API and integrates well with React's functional components
// this store will handle image uploads, analysis results, and UI state
// it will also provide actions to add, update, and remove uploads and analyses

export const useImageAnalysisStore = create<ImageAnalysisState>((set) => ({
  // State
  images: [] as ImageAnalysis[],
  uploads: [] as ImageUploadData[],
  isLoading: false,
  error: null as string | null,

  // Upload actions
  addUpload: (upload: ImageUploadData) =>
    set((state) => ({
      uploads: [...state.uploads, upload],
    })),

  updateUpload: (id: string, update: Partial<ImageUploadData>) =>
    set((state) => ({
      uploads: state.uploads.map((upload) =>
        upload.file.name === id ? { ...upload, ...update } : upload
      ),
    })),

  removeUpload: (id: string) =>
    set((state) => ({
      uploads: state.uploads.filter((upload) => upload.file.name !== id),
    })),

  clearUploads: () =>
    set({
      uploads: [],
    }),

  // Analysis actions
  addAnalysis: (analysis: ImageAnalysis) =>
    set((state) => ({
      images: [...state.images, analysis],
    })),

  updateAnalysis: (id: string, update: Partial<ImageAnalysis>) =>
    set((state) => ({
      images: state.images.map((image) =>
        image.id === id ? { ...image, ...update } : image
      ),
    })),

  removeAnalysis: (id: string) =>
    set((state) => ({
      images: state.images.filter((image) => image.id !== id),
    })),

  clearAnalyses: () =>
    set({
      images: [],
    }),

  // UI state actions
  setLoading: (loading: boolean) =>
    set({
      isLoading: loading,
    }),

  setError: (error: string | null) =>
    set({
      error,
    }),
}));
