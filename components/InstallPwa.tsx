import React, { useEffect, useState } from 'react';
import { Download } from 'lucide-react';

export default function InstallPwa() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsVisible(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsVisible(false);
    }
    setDeferredPrompt(null);
  };

  if (!isVisible) return null;

  return (
    <button
      onClick={handleInstall}
      className="fixed bottom-6 right-6 z-[100] bg-[#D4AF37] text-black px-4 py-3 rounded-full shadow-[0_0_20px_rgba(212,175,55,0.5)] hover:scale-105 transition-transform flex items-center gap-2 font-bold"
    >
      <Download size={20} />
      <span>Install App</span>
    </button>
  );
}