import ImageUploader from '@/components/ImageUploader';

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🧠 Visual Tagging Prototype
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Upload images and get AI-powered visual tags using advanced vision models. 
            Extract structured insights from your images with confidence scores.
          </p>
        </div>
        
        <ImageUploader />

        <div className="mt-12 text-center text-sm text-gray-500">
          <p>
            Powered by Hugging Face Vision Transformers • Built with Next.js, tRPC, and Zustand
          </p>
        </div>
      </div>
    </main>
  );
}
