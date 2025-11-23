import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { Mic, MicOff, X, Radio } from 'lucide-react';
import { createPcmBlob, decodeAudioData, base64ToUint8Array } from '../utils/audio';

const LiveVoice: React.FC = () => {
  const [isActive, setIsActive] = useState(false);
  const [statusMessage, setStatusMessage] = useState("Ready to connect");
  const [volume, setVolume] = useState(0);
  const [transcriptions, setTranscriptions] = useState<{role: string, text: string}[]>([]);

  // Audio Context Refs
  const inputContextRef = useRef<AudioContext | null>(null);
  const outputContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const sessionRef = useRef<any>(null); // Holds session object explicitly if needed, but primarily used via promise closure

  // Visualizer Ref
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | null>(null);

  const cleanup = useCallback(() => {
    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current.onaudioprocess = null;
      processorRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (inputContextRef.current) {
      inputContextRef.current.close();
      inputContextRef.current = null;
    }
    if (outputContextRef.current) {
      outputContextRef.current.close();
      outputContextRef.current = null;
    }
    if (sessionRef.current) {
        // session.close() is defined in types but accessing strictly via wrapper often best. 
        // @google/genai wrapper handles close automatically if possible or manual
        try { sessionRef.current.close(); } catch(e) {}
        sessionRef.current = null;
    }
    sourcesRef.current.forEach(s => s.stop());
    sourcesRef.current.clear();
    setIsActive(false);
    setVolume(0);
    setStatusMessage("Disconnected");
  }, []);

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      cleanup();
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [cleanup]);

  // Visualizer Loop
  useEffect(() => {
    const draw = () => {
      if (!canvasRef.current) return;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;

      // Dynamic circle based on volume
      const radius = 50 + (volume * 100); 
      
      // Glow effect
      const gradient = ctx.createRadialGradient(centerX, centerY, radius * 0.5, centerX, centerY, radius);
      gradient.addColorStop(0, 'rgba(99, 102, 241, 0.8)'); // Indigo
      gradient.addColorStop(1, 'rgba(99, 102, 241, 0)');

      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
      ctx.fillStyle = gradient;
      ctx.fill();

      // Core
      ctx.beginPath();
      ctx.arc(centerX, centerY, 40, 0, 2 * Math.PI);
      ctx.fillStyle = '#ffffff';
      ctx.fill();

      animationFrameRef.current = requestAnimationFrame(draw);
    };
    draw();
  }, [volume]);

  const startSession = async () => {
    try {
      setStatusMessage("Connecting to Gemini Live...");
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      // Setup Audio
      inputContextRef.current = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 16000 });
      outputContextRef.current = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 24000 });
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        callbacks: {
          onopen: () => {
            setStatusMessage("Listening...");
            setIsActive(true);
            
            // Start Microphone Streaming
            if (!inputContextRef.current) return;
            
            const source = inputContextRef.current.createMediaStreamSource(stream);
            const processor = inputContextRef.current.createScriptProcessor(4096, 1, 1);
            processorRef.current = processor;

            processor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              
              // Calculate volume for visualizer
              let sum = 0;
              for(let i=0; i<inputData.length; i++) sum += inputData[i] * inputData[i];
              setVolume(Math.sqrt(sum / inputData.length));

              const pcmBlob = createPcmBlob(inputData);
              sessionPromise.then(session => {
                session.sendRealtimeInput({ media: pcmBlob });
              });
            };

            source.connect(processor);
            processor.connect(inputContextRef.current.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            if (!outputContextRef.current) return;

            // Handle Transcriptions
            if (message.serverContent?.inputTranscription?.text) {
               setTranscriptions(prev => [...prev.slice(-2), {role: 'user', text: message.serverContent!.inputTranscription!.text}]);
            }
            if (message.serverContent?.outputTranscription?.text) {
               setTranscriptions(prev => [...prev.slice(-2), {role: 'model', text: message.serverContent!.outputTranscription!.text}]);
            }

            // Handle Audio Output
            const base64Audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (base64Audio) {
              const ctx = outputContextRef.current;
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
              
              const audioBuffer = await decodeAudioData(
                base64ToUint8Array(base64Audio),
                ctx,
                24000,
                1
              );
              
              const source = ctx.createBufferSource();
              source.buffer = audioBuffer;
              source.connect(ctx.destination);
              
              source.addEventListener('ended', () => {
                sourcesRef.current.delete(source);
              });

              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += audioBuffer.duration;
              sourcesRef.current.add(source);
            }

            // Handle Interruption
            if (message.serverContent?.interrupted) {
               sourcesRef.current.forEach(s => s.stop());
               sourcesRef.current.clear();
               nextStartTimeRef.current = 0;
            }
          },
          onclose: () => {
            setStatusMessage("Session Closed");
            cleanup();
          },
          onerror: (err) => {
            console.error(err);
            setStatusMessage("Error encountered");
            cleanup();
          }
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } }
          },
          inputAudioTranscription: {}, // Enable user transcription
          outputAudioTranscription: {}, // Enable model transcription
          systemInstruction: "You are Gemini, a helpful, witty, and intelligent AI assistant in a premium web application. Keep responses concise and conversational."
        }
      });

      sessionRef.current = await sessionPromise;

    } catch (err) {
      console.error("Connection failed", err);
      setStatusMessage("Failed to connect. Check permissions.");
      cleanup();
    }
  };

  return (
    <div className="h-full flex flex-col relative overflow-hidden bg-gray-950">
      {/* Background Ambient Effect */}
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?q=80&w=2072&auto=format&fit=crop')] bg-cover bg-center opacity-20 blur-3xl"></div>
      
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center p-8">
        <div className="mb-8 text-center space-y-2">
          <h2 className="text-3xl font-display font-bold text-white tracking-wide">Gemini Live</h2>
          <p className={`text-sm font-medium uppercase tracking-widest transition-colors ${isActive ? 'text-emerald-400' : 'text-gray-500'}`}>
            {statusMessage}
          </p>
        </div>

        {/* Visualizer Canvas */}
        <div className="relative w-80 h-80 flex items-center justify-center">
          <canvas ref={canvasRef} width={400} height={400} className="w-full h-full" />
        </div>

        {/* Transcription Overlay (Subtitles style) */}
        <div className="h-32 w-full max-w-2xl flex flex-col justify-end items-center space-y-2 overflow-hidden mask-linear-fade">
          {transcriptions.map((t, i) => (
             <p key={i} className={`text-center text-lg font-medium ${t.role === 'user' ? 'text-gray-400' : 'text-indigo-300'}`}>
               {t.text}
             </p>
          ))}
        </div>
      </div>

      {/* Controls */}
      <div className="relative z-20 p-8 flex justify-center gap-6">
        {!isActive ? (
          <button
            onClick={startSession}
            className="w-16 h-16 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center shadow-[0_0_20px_rgba(79,70,229,0.5)] transition-all transform hover:scale-110"
          >
            <Mic size={32} />
          </button>
        ) : (
          <button
            onClick={cleanup}
            className="w-16 h-16 rounded-full bg-red-600 hover:bg-red-500 text-white flex items-center justify-center shadow-[0_0_20px_rgba(220,38,38,0.5)] transition-all transform hover:scale-110"
          >
            <X size={32} />
          </button>
        )}
      </div>
    </div>
  );
};

export default LiveVoice;