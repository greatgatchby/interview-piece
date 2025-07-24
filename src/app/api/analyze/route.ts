import { NextRequest, NextResponse } from 'next/server';
import { InferenceClient } from '@huggingface/inference';
import { ImageAnalysis, ImageTag } from '@/types/image-analysis';

const hf = new InferenceClient(process.env.HUGGING_FACE_API_TOKEN);

export async function POST(request: NextRequest) {
  try {
    const { imageData, filename, mimeType } = await request.json();

    if (!imageData || !filename || !mimeType) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Convert base64 to buffer and then to Blob
    const base64Data = imageData.replace(/^data:image\/[a-z]+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');
    const blob = new Blob([buffer], { type: mimeType });

    // Use Hugging Face Vision Transformer model for image classification
    const results = await hf.imageClassification({
      data: blob,
      model: 'google/vit-base-patch16-224'
    });

    // Convert results to our tag format
    const tags: ImageTag[] = results.slice(0, 5).map((result, index) => ({
      id: `tag-${Date.now()}-${index}`,
      label: result.label,
      confidence: Math.round(result.score * 100) / 100,
      created_at: new Date().toISOString(),
    }));

    // Create analysis object
    const analysis: ImageAnalysis = {
      id: `analysis-${Date.now()}`,
      filename,
      originalName: filename,
      fileSize: buffer.length,
      mimeType,
      imageUrl: imageData, // In a real app, you'd upload to storage and return URL
      tags,
      status: 'completed',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      analysis,
    });

  } catch (error) {
    console.error('Error analyzing image:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to analyze image',
      },
      { status: 500 }
    );
  }
}
