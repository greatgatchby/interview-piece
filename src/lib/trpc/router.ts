import { initTRPC } from '@trpc/server';
import { z } from 'zod';
import ImageAnalysisService from '@/lib/data/ImageAnalysisService';

// Initialize tRPC
const t = initTRPC.create();

// Create router and procedure helpers
export const router = t.router;
export const publicProcedure = t.procedure;

// Input validation schemas
const analyzeImageSchema = z.object({
  imageData: z.string().min(1, 'Image data is required'),
  filename: z.string().min(1, 'Filename is required'),
  mimeType: z.string().min(1, 'MIME type is required'),
});

const imageIdSchema = z.object({
  id: z.string().min(1, 'Image ID is required'),
});

const updateImageSchema = z.object({
  id: z.string().min(1, 'Image ID is required'),
  update: z.object({
    filename: z.string().optional(),
    tags: z.array(z.object({
      id: z.string(),
      label: z.string(),
      confidence: z.number(),
      created_at: z.string(),
    })).optional(),
    status: z.enum(['uploading', 'processing', 'completed', 'error']).optional(),
    error: z.string().optional(),
  }),
});

// Create the main router
export const appRouter = router({
  // Analyze image procedure
  analyzeImage: publicProcedure
    .input(analyzeImageSchema)
    .mutation(async ({ input }) => {
      const service = new ImageAnalysisService();
      return await service.analyzeImage(input);
    }),

  // Get all images
  getImages: publicProcedure
    .query(async () => {
      const service = new ImageAnalysisService();
      return await service.fetchAll();
    }),

  // Get image by ID
  getImageById: publicProcedure
    .input(imageIdSchema)
    .query(async ({ input }) => {
      const service = new ImageAnalysisService();
      return await service.getById(input.id);
    }),

  // Update image
  updateImage: publicProcedure
    .input(updateImageSchema)
    .mutation(async ({ input }) => {
      const service = new ImageAnalysisService();
      return await service.update(input.id, input.update);
    }),

  // Delete image
  deleteImage: publicProcedure
    .input(imageIdSchema)
    .mutation(async ({ input }) => {
      const service = new ImageAnalysisService();
      return await service.delete(input.id);
    }),

  // Test connection
  healthCheck: publicProcedure
    .query(() => {
      return {
        status: 'ok',
        timestamp: new Date().toISOString(),
        message: 'Visual Tagging API is running',
      };
    }),
});

// Export the router type for client-side usage
export type AppRouter = typeof appRouter;
