import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, GenerateContentResponse } from '@google/genai';
import { Send, MapPin, Globe, Loader2 } from 'lucide-react';
import { ChatMessage } from '../types';

const AtlasMaps: React.FC = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => console.error("Error getting location", error)
      );
    }
    // Initial greeting
    setMessages([{
      id: 'init',
      role: 'model',
      text: "Welcome to Atlas. I can help you find places, restaurants, and events using real-time Google Maps data. Where are we heading?",
      timestamp: Date.now()
    }]);
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const tools: any[] = [{ googleMaps: {} }];
      let toolConfig = undefined;

      if (userLocation) {
        toolConfig = {
          retrievalConfig: {
            latLng: {
              latitude: userLocation.lat,
              longitude: userLocation.lng
            }
          }
        };
      }

      const response: GenerateContentResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: userMsg.text,
        config: {
          tools: tools,
          toolConfig: toolConfig,
          systemInstruction: "You are a helpful geospatial assistant. Provide clear, concise answers grounded in Google Maps data. Always format place names in bold."
        }
      });

      const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
      const urls = groundingChunks?.map((chunk: any) => {
        if (chunk.maps) return { uri: chunk.maps.uri, title: chunk.maps.title };
        if (chunk.web) return { uri: chunk.web.uri, title: chunk.web.title };
        return null;
      }).filter((u: any) => u !== null);

      const modelMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: response.text || "I couldn't find specific information on that.",
        groundingUrls: urls,
        timestamp: Date.now()
      };

      setMessages(prev => [...prev, modelMsg]);

    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'model',
        text: "I encountered an error accessing the map data. Please try again.",
        timestamp: Date.now()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full max-h-screen">
      <header className="p-6 border-b border-gray-800/50 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-display font-bold text-white">Atlas Maps</h2>
          <p className="text-gray-400 text-sm">Powered by Gemini 2.5 Flash & Google Maps</p>
        </div>
        {userLocation ? (
           <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-900/20 border border-emerald-500/30 text-emerald-400 text-xs">
             <MapPin size={12} />
             <span>Location Active</span>
           </div>
        ) : (
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-amber-900/20 border border-amber-500/30 text-amber-400 text-xs">
             <Globe size={12} />
             <span>Locating...</span>
           </div>
        )}
      </header>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] rounded-2xl p-5 ${
              msg.role === 'user' 
                ? 'bg-indigo-600 text-white rounded-br-none' 
                : 'glass-panel text-gray-200 rounded-bl-none'
            }`}>
              <div className="prose prose-invert prose-sm mb-2 whitespace-pre-wrap">
                {msg.text}
              </div>
              
              {msg.groundingUrls && msg.groundingUrls.length > 0 && (
                <div className="mt-4 pt-3 border-t border-gray-700/50 grid gap-2">
                  <p className="text-xs text-gray-400 uppercase tracking-wider font-bold">Sources</p>
                  {msg.groundingUrls.map((url, idx) => (
                    <a 
                      key={idx}
                      href={url.uri}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 hover:underline bg-blue-900/10 p-2 rounded-lg transition-colors"
                    >
                      <MapPin size={14} />
                      <span className="truncate">{url.title || "View on Maps"}</span>
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>

      <div className="p-6 border-t border-gray-800 glass-panel">
        <div className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask about places, restaurants, distance..."
            className="w-full bg-gray-900/50 border border-gray-700 text-white rounded-xl px-4 py-4 pr-12 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 placeholder-gray-500 transition-all"
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="absolute right-2 top-2 p-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AtlasMaps;