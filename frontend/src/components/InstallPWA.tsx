import React, { useState, useEffect } from 'react';

export function InstallPWA() {
  const [prompt, setPrompt] = useState<any>(null);

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  if (!prompt) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 bg-purple-600 
                    text-white p-4 rounded-xl shadow-xl z-50 flex 
                    items-center justify-between animate-bounce-in">
      <div className="flex items-center gap-3">
        <span className="text-2xl">📱</span>
        <div>
          <p className="font-bold">Installer EcomPilot</p>
          <p className="text-sm opacity-90">Accédez à votre boutique en un clic</p>
        </div>
      </div>
      <button 
        onClick={() => {
          prompt.prompt();
          prompt.userChoice.then((choice: any) => {
            if (choice.outcome === 'accepted') {
              setPrompt(null);
            }
          });
        }} 
        className="bg-white text-purple-600 px-6 py-2 rounded-lg font-bold hover:bg-purple-50 transition-colors shadow-md"
      >
        Installer
      </button>
    </div>
  );
}
