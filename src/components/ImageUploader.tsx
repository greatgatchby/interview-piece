'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { useImageAnalysisStore } from '@/lib/stores/image-analysis-store';
import { ImageUploadData } from '@/types/image-analysis';
import { trpc } from '@/lib/trpc/client';

export default function ImageUploader() {
  const [isDragActive, setIsDragActive] = useState(false);
  const { uploads, addUpload, updateUpload, removeUpload } = useImageAnalysisStore();
  const analyzeImageMutation = trpc.analyzeImage.useMutation();

  const processFile = useCallback(async (file: File) => {
    // Validate file
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (!allowedTypes.includes(file.type)) {
      alert('Invalid file type. Please upload JPEG, PNG, WebP, or GIF images.');
      return;
    }

    if (file.size > maxSize) {
      alert('File size too large. Please upload images smaller than 10MB.');
      return;
    }

    // Create preview URL
    const preview = URL.createObjectURL(file);

    // Add to uploads
    const uploadData: ImageUploadData = {
      file,
      preview,
      status: 'pending',
    };

    addUpload(uploadData);

    // Convert to base64 and analyze
    try {
      updateUpload(file.name, { status: 'processing' });

      const reader = new FileReader();
      reader.onload = async () => {
        if (typeof reader.result === 'string') {
          try {
            const result = await analyzeImageMutation.mutateAsync({
              imageData: reader.result,
              filename: file.name,
              mimeType: file.type,
            });

            if (result.success && result.analysis) {
              updateUpload(file.name, {
                status: 'completed',
                analysis: result.analysis,
              });
            } else {
              updateUpload(file.name, {
                status: 'error',
                error: result.error || 'Failed to analyze image',
              });
            }
          } catch (error) {
            updateUpload(file.name, {
              status: 'error',
              error: error instanceof Error ? error.message : 'Failed to analyze image',
            });
          }
        }
      };

      reader.onerror = () => {
        updateUpload(file.name, {
          status: 'error',
          error: 'Failed to read file',
        });
      };

      reader.readAsDataURL(file);
    } catch (error) {
      updateUpload(file.name, {
        status: 'error',
        error: error instanceof Error ? error.message : 'Failed to process file',
      });
    }
  }, [addUpload, updateUpload, analyzeImageMutation]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    acceptedFiles.forEach(processFile);
    setIsDragActive(false);
  }, [processFile]);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp', '.gif']
    },
    multiple: true,
    onDragEnter: () => setIsDragActive(true),
    onDragLeave: () => setIsDragActive(false),
  });

  const removeImage = useCallback((fileName: string, preview: string) => {
    URL.revokeObjectURL(preview);
    removeUpload(fileName);
  }, [removeUpload]);

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      {/* Upload Area */}
      <div
        {...getRootProps()}
        className={`
          relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-200
          ${isDragActive 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
          }
        `}
      >
        <input {...getInputProps()} />
        <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <div className="space-y-2">
          <p className="text-lg font-medium text-gray-900">
            {isDragActive ? 'Drop images here...' : 'Upload images for analysis'}
          </p>
          <p className="text-sm text-gray-500">
            Drag and drop or click to select images (JPEG, PNG, WebP, GIF - max 10MB each)
          </p>
        </div>
      </div>

      {/* Upload Progress and Results */}
      {uploads.length > 0 && (
        <div className="mt-8 space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Processing Images ({uploads.length})
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {uploads.map((upload) => (
              <div
                key={upload.file.name}
                className="relative bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden"
              >
                {/* Remove Button */}
                <button
                  onClick={() => removeImage(upload.file.name, upload.preview)}
                  className="absolute top-2 right-2 z-10 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>

                {/* Image Preview */}
                <div className="aspect-video bg-gray-100 relative overflow-hidden">
                  <img
                    src={upload.preview}
                    alt={upload.file.name}
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Status Overlay */}
                  {upload.status === 'processing' && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                      <div className="text-white text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
                        <p className="text-sm">Analyzing...</p>
                      </div>
                    </div>
                  )}

                  {upload.status === 'error' && (
                    <div className="absolute inset-0 bg-red-500 bg-opacity-75 flex items-center justify-center">
                      <div className="text-white text-center">
                        <X className="h-8 w-8 mx-auto mb-2" />
                        <p className="text-sm">Error</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Image Info and Tags */}
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <ImageIcon className="h-4 w-4 text-gray-400" />
                    <span className="text-sm font-medium text-gray-900 truncate">
                      {upload.file.name}
                    </span>
                  </div>
                  
                  <p className="text-xs text-gray-500 mb-3">
                    {(upload.file.size / 1024 / 1024).toFixed(2)} MB
                  </p>

                  {/* Tags */}
                  {upload.analysis?.tags && upload.analysis.tags.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-gray-900">
                        Detected Tags:
                      </h4>
                      <div className="space-y-1">
                        {upload.analysis.tags.map((tag) => (
                          <div
                            key={tag.id}
                            className="flex justify-between items-center text-xs"
                          >
                            <span className="text-gray-700 truncate">
                              {tag.label}
                            </span>
                            <span className="text-gray-500 ml-2">
                              {Math.round(tag.confidence * 100)}%
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Error Message */}
                  {upload.error && (
                    <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700">
                      {upload.error}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
