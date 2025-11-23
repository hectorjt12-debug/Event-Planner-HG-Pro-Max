import React, { useState, useRef } from 'react';
import { GoogleGenAI } from '@google/genai';
import { View, ProcessingState } from '../types';
import ApiKeyGuard from '../components/ApiKeyGuard';
import { Wand2, ImagePlus, Download, AlertCircle, Loader2, X } from 'lucide-react';

enum Mode {
  GENERATE = 'GENERATE',
  EDIT = 'EDIT'
}

const ImageStudio: React.FC = () => {
  const [mode, setMode] = useState<Mode>(Mode.GENERATE);
  const [prompt, setPrompt] = useState('');
  const [resolution, setResolution] = useState<'1K' | '2K' | '4K'>('1K');
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [status, setStatus] = useState<ProcessingState>(ProcessingState.IDLE);
  
  // Edit mode state
  const [sourceImage, setSourceImage] = useState<string | null>(null);
  const [sourceMimeType, setSourceMimeType] = useState<string>('image/jpeg');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleGenerate = async (ai: GoogleGenAI) => {
    if (!prompt) return;
    setStatus(ProcessingState.PROCESSING);
    setResultImage(null);

    try {
      // Using Gemini 3 Pro Image for generation (Premium)
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-image-preview',
        contents: {
          parts: [{ text: prompt }],
        },
        config: {
          imageConfig: {
            imageSize: resolution,
            aspectRatio: "1:1"
          }
        },
      });

      let foundImage = false;
      if (response.candidates && response.candidates[0].content.parts) {
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData) {
            const base64 = part.inlineData.data;
            setResultImage(`data:image/png;base64,${base64}`);
            foundImage = true;
            break;
          }
        }
      }
      
      if (!foundImage) throw new Error("No image generated");
      setStatus(ProcessingState.SUCCESS);

    } catch (error) {
      console.error(error);
      setStatus(ProcessingState.ERROR);
    }
  };

  const handleEdit = async () => {
    // Editing uses gemini-2.5-flash-image (Standard API Key, usually free/standard tier)
    if (!prompt || !sourceImage) return;
    setStatus(ProcessingState.PROCESSING);
    setResultImage(null);

    try {
       const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
       const cleanBase64 = sourceImage.split(',')[1];

       const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [
            {
              inlineData: {
                data: cleanBase64,
                mimeType: sourceMimeType,
              },
            },
            { text: prompt },
          ],
        },
      });

      let foundImage = false;
      if (response.candidates && response.candidates[0].content.parts) {
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData) {
            const base64 = part.inlineData.data;
            setResultImage(`data:image/png;base64,${base64}`);
            foundImage = true;
            break;
          }
        }
      }
      
      if (!foundImage) throw new Error("No edited image returned");
      setStatus(ProcessingState.SUCCESS);

    } catch (error) {
      console.error(error);
      setStatus(ProcessingState.ERROR);
    }
  };

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

  return (
    <div className="h-full flex flex-col lg:flex-row">
      {/* Controls Panel */}
      <div className="w-full lg:w-1/3 p-6 border-b lg:border-b-0 lg:border-r border-gray-800 overflow-y-auto">
        <h2 className="text-2xl font-display font-bold text-white mb-6">Image Studio</h2>
        
        <div className="flex p-1 bg-gray-800 rounded-lg mb-8">
          <button
            onClick={() => { setMode(Mode.GENERATE); setResultImage(null); setStatus(ProcessingState.IDLE); }}
            className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
              mode === Mode.GENERATE ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'
            }`}
          >
            Generate (Pro)
          </button>
          <button
            onClick={() => { setMode(Mode.EDIT); setResultImage(null); setStatus(ProcessingState.IDLE); }}
            className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
              mode === Mode.EDIT ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'
            }`}
          >
            Edit (Flash)
          </button>
        </div>

        <div className="space-y-6">
          {mode === Mode.EDIT && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">Source Image</label>
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-700 hover:border-indigo-500 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer transition-colors bg-gray-900/30 relative overflow-hidden group"
              >
                 {sourceImage ? (
                   <>
                    <img src={sourceImage} alt="Source" className="absolute inset-0 w-full h-full object-cover opacity-50 group-hover:opacity-30 transition-opacity" />
                    <div className="relative z-10 flex flex-col items-center">
                      <p className="text-xs text-white font-bold mb-1">Click to change</p>
                    </div>
                   </>
                 ) : (
                   <>
                    <ImagePlus className="text-gray-500 mb-2" size={32} />
                    <span className="text-xs text-gray-500">Upload Image</span>
                   </>
                 )}
                 <input 
                   ref={fileInputRef} 
                   type="file" 
                   accept="image/*" 
                   className="hidden" 
                   onChange={handleFileSelect}
                 />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">
              {mode === Mode.GENERATE ? 'Description' : 'Edit Instruction'}
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={mode === Mode.GENERATE ? "A futuristic city made of crystal..." : "Add a retro filter, remove the background..."}
              className="w-full h-32 bg-gray-900 border border-gray-700 rounded-xl p-3 text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
            />
          </div>

          {mode === Mode.GENERATE && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">Quality</label>
              <div className="grid grid-cols-3 gap-2">
                {['1K', '2K', '4K'].map((res) => (
                  <button
                    key={res}
                    onClick={() => setResolution(res as any)}
                    className={`py-2 px-4 rounded-lg border ${
                      resolution === res 
                        ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300' 
                        : 'border-gray-700 text-gray-500 hover:border-gray-500'
                    } text-sm font-mono transition-all`}
                  >
                    {res}
                  </button>
                ))}
              </div>
            </div>
          )}

          {mode === Mode.GENERATE ? (
            <ApiKeyGuard fallbackMessage="High-resolution image generation (Nano Banana Pro) requires a paid API key.">
              {(ai) => (
                <button
                  onClick={() => handleGenerate(ai)}
                  disabled={status === ProcessingState.PROCESSING || !prompt}
                  className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl shadow-lg hover:shadow-indigo-500/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                >
                  {status === ProcessingState.PROCESSING ? <Loader2 className="animate-spin" /> : <Wand2 size={20} />}
                  <span>Generate Image</span>
                </button>
              )}
            </ApiKeyGuard>
          ) : (
            <button
              onClick={handleEdit}
              disabled={status === ProcessingState.PROCESSING || !prompt || !sourceImage}
              className="w-full py-4 bg-indigo-600 text-white font-bold rounded-xl shadow-lg hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
            >
              {status === ProcessingState.PROCESSING ? <Loader2 className="animate-spin" /> : <Wand2 size={20} />}
              <span>Edit Image</span>
            </button>
          )}
        </div>
      </div>

      {/* Canvas/Preview Panel */}
      <div className="flex-1 bg-[#0a0a0a] p-8 flex items-center justify-center relative">
        {status === ProcessingState.IDLE && !resultImage && (
          <div className="text-center opacity-30">
            <div className="w-32 h-32 rounded-full border-4 border-dashed border-gray-600 mx-auto mb-6 flex items-center justify-center animate-spin-slow">
               <Wand2 size={48} className="text-gray-500" />
            </div>
            <p className="text-xl font-display text-gray-500">Ready to Create</p>
          </div>
        )}

        {status === ProcessingState.ERROR && (
           <div className="text-center text-red-400 bg-red-900/10 p-8 rounded-2xl border border-red-900/50">
             <AlertCircle size={48} className="mx-auto mb-4" />
             <p>Generation Failed. Please check your prompt or try again.</p>
           </div>
        )}

        {resultImage && (
          <div className="relative group max-w-full max-h-full">
            <img 
              src={resultImage} 
              alt="Generated Result" 
              className="rounded-lg shadow-2xl border border-gray-800 max-h-[80vh] object-contain" 
            />
            <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <a 
                href={resultImage} 
                download={`gemini-creation-${Date.now()}.png`}
                className="p-3 bg-black/70 backdrop-blur-md text-white rounded-lg hover:bg-indigo-600 transition-colors"
              >
                <Download size={20} />
              </a>
              <button 
                onClick={() => setResultImage(null)}
                className="p-3 bg-black/70 backdrop-blur-md text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageStudio;