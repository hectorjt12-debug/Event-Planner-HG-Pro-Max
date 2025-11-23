import React, { useState, useRef } from 'react';
import { GoogleGenAI } from '@google/genai';
import ApiKeyGuard from '../components/ApiKeyGuard';
import { ProcessingState } from '../types';
import { Clapperboard, Upload, Film, Loader2, Play } from 'lucide-react';

const VeoCinema: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [sourceImage, setSourceImage] = useState<string | null>(null);
  const [sourceMimeType, setSourceMimeType] = useState<string>('image/jpeg');
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16'>('16:9');
  const [status, setStatus] = useState<ProcessingState>(ProcessingState.IDLE);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        setSourceImage(evt.target?.result as string);
        setSourceMimeType(file.type);
      };
      reader.readAsDataURL(file);
    }
  };

  const generateVideo = async (ai: GoogleGenAI) => {
    if (!sourceImage) return;
    setStatus(ProcessingState.PROCESSING);
    setVideoUrl(null);

    try {
      const cleanBase64 = sourceImage.split(',')[1];
      
      // Use 'veo-3.1-fast-generate-preview' as requested
      let operation = await ai.models.generateVideos({
        model: 'veo-3.1-fast-generate-preview',
        prompt: prompt || undefined, // Prompt is optional if image is provided for image-to-video, but good to have
        image: {
          imageBytes: cleanBase64,
          mimeType: sourceMimeType,
        },
        config: {
          numberOfVideos: 1,
          resolution: '720p', // Fast model typically 720p
          aspectRatio: aspectRatio
        }
      });

      // Polling loop
      while (!operation.done) {
        await new Promise(resolve => setTimeout(resolve, 5000)); // 5s poll
        operation = await ai.operations.getVideosOperation({ operation: operation });
      }

      const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
      
      if (downloadLink && process.env.API_KEY) {
        // Fetch with key appended
        const vidResponse = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
        const blob = await vidResponse.blob();
        const url = URL.createObjectURL(blob);
        setVideoUrl(url);
        setStatus(ProcessingState.SUCCESS);
      } else {
        throw new Error("Video URI not found in response");
      }

    } catch (error) {
      console.error("Veo Generation Error", error);
      setStatus(ProcessingState.ERROR);
    }
  };

  return (
    <ApiKeyGuard fallbackMessage="Veo Video Generation requires a paid API key selected from your Google Cloud Project.">
      {(ai) => (
        <div className="h-full flex flex-col lg:flex-row p-6 gap-6">
          {/* Configuration Card */}
          <div className="w-full lg:w-96 glass-panel rounded-2xl p-6 flex flex-col h-fit">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-pink-500/20 rounded-lg text-pink-400">
                <Clapperboard size={24} />
              </div>
              <h2 className="text-xl font-display font-bold text-white">Veo Cinema</h2>
            </div>

            <div className="space-y-6">
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="aspect-video rounded-xl border-2 border-dashed border-gray-700 hover:border-pink-500 bg-gray-900/50 cursor-pointer flex flex-col items-center justify-center relative overflow-hidden group transition-all"
              >
                {sourceImage ? (
                  <>
                    <img src={sourceImage} alt="Ref" className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-40 transition-opacity" />
                     <div className="relative z-10 bg-black/60 px-3 py-1 rounded-full backdrop-blur-sm text-xs font-medium">Change Image</div>
                  </>
                ) : (
                  <>
                    <Upload className="text-gray-500 mb-2" />
                    <span className="text-sm text-gray-400">Upload Reference Image</span>
                  </>
                )}
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileSelect} />
              </div>

              <div>
                <label className="text-sm text-gray-400 font-medium mb-2 block">Optional Prompt</label>
                <textarea 
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Describe motion (e.g., 'The camera pans right', 'The water flows')"
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-sm text-white focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none resize-none h-24"
                />
              </div>

              <div>
                <label className="text-sm text-gray-400 font-medium mb-2 block">Aspect Ratio</label>
                <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={() => setAspectRatio('16:9')}
                    className={`py-3 rounded-lg border text-sm font-medium transition-all ${aspectRatio === '16:9' ? 'bg-pink-600/20 border-pink-500 text-pink-300' : 'border-gray-700 text-gray-500'}`}
                  >
                    16:9 Landscape
                  </button>
                  <button 
                    onClick={() => setAspectRatio('9:16')}
                    className={`py-3 rounded-lg border text-sm font-medium transition-all ${aspectRatio === '9:16' ? 'bg-pink-600/20 border-pink-500 text-pink-300' : 'border-gray-700 text-gray-500'}`}
                  >
                    9:16 Portrait
                  </button>
                </div>
              </div>

              <button 
                onClick={() => generateVideo(ai)}
                disabled={!sourceImage || status === ProcessingState.PROCESSING}
                className="w-full py-4 mt-auto bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white font-bold rounded-xl shadow-lg shadow-pink-900/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
              >
                {status === ProcessingState.PROCESSING ? (
                  <>
                    <Loader2 className="animate-spin" />
                    <span>Animating...</span>
                  </>
                ) : (
                  <>
                    <Film size={20} />
                    <span>Generate Video</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Viewer */}
          <div className="flex-1 bg-black rounded-2xl overflow-hidden relative border border-gray-800 flex items-center justify-center">
            {status === ProcessingState.PROCESSING && (
              <div className="text-center space-y-4">
                <div className="w-16 h-16 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p className="text-pink-400 font-medium animate-pulse">Veo is dreaming up your video...</p>
                <p className="text-gray-600 text-xs">This may take a minute</p>
              </div>
            )}

            {videoUrl && status === ProcessingState.SUCCESS && (
              <video controls autoPlay loop className="max-w-full max-h-full shadow-2xl">
                <source src={videoUrl} type="video/mp4" />
              </video>
            )}

            {!videoUrl && status !== ProcessingState.PROCESSING && (
              <div className="text-gray-700 flex flex-col items-center">
                <Film size={64} className="opacity-20 mb-4" />
                <p>Upload an image to animate it</p>
              </div>
            )}
          </div>
        </div>
      )}
    </ApiKeyGuard>
  );
};

export default VeoCinema;