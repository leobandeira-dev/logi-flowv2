import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { X, Download, Smartphone } from "lucide-react";

export default function PWAInstaller() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);

  useEffect(() => {
    // Registrar Service Worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/service-worker.js')
        .then(registration => {
          console.log('✅ Service Worker registrado:', registration.scope);
        })
        .catch(error => {
          console.log('❌ Erro ao registrar Service Worker:', error);
        });
    }

    // Capturar evento de instalação PWA
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      
      // Verificar se já foi instalado ou se usuário já rejeitou
      const hasRejected = localStorage.getItem('pwa_install_rejected');
      const isInstalled = window.matchMedia('(display-mode: standalone)').matches;
      
      if (!hasRejected && !isInstalled) {
        setShowInstallPrompt(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    console.log(`Usuário ${outcome === 'accepted' ? 'aceitou' : 'rejeitou'} a instalação`);
    
    if (outcome === 'dismissed') {
      localStorage.setItem('pwa_install_rejected', 'true');
    }
    
    setDeferredPrompt(null);
    setShowInstallPrompt(false);
  };

  const handleDismiss = () => {
    setShowInstallPrompt(false);
    localStorage.setItem('pwa_install_rejected', 'true');
  };

  if (!showInstallPrompt) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-sm z-50 animate-in slide-in-from-bottom-5">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-2xl border-2 border-blue-500 p-4">
        <button
          onClick={handleDismiss}
          className="absolute top-2 right-2 p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
        >
          <X className="w-4 h-4 text-gray-500" />
        </button>
        
        <div className="flex items-start gap-3 mb-3">
          <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center flex-shrink-0">
            <Smartphone className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-gray-900 dark:text-white mb-1">
              Instalar Log Flow
            </h3>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Acesse mais rápido e use offline instalando o app em seu dispositivo
            </p>
          </div>
        </div>
        
        <Button
          onClick={handleInstall}
          className="w-full bg-blue-600 hover:bg-blue-700 h-10"
        >
          <Download className="w-4 h-4 mr-2" />
          Instalar Aplicativo
        </Button>
      </div>
    </div>
  );
}