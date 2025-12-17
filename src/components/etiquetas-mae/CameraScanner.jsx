import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Camera, X, Loader2, Keyboard } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import QrScanner from "qr-scanner";

export default function CameraScanner({ open, onClose, onScan, isDark, notaAtual, progressoAtual }) {
  const videoRef = useRef(null);
  const [scanning, setScanning] = useState(false);
  const [manualInput, setManualInput] = useState("");
  const [useManualMode, setUseManualMode] = useState(false);
  const qrScannerRef = useRef(null);
  const [scanFeedback, setScanFeedback] = useState(null); // 'success' | 'duplicate' | null

  useEffect(() => {
    if (open && !useManualMode) {
      setTimeout(() => {
        startScanner();
      }, 100);
    }

    return () => {
      stopScanner();
    };
  }, [open, useManualMode]);

  const startScanner = async () => {
    if (qrScannerRef.current || useManualMode || !videoRef.current) return;

    try {
      const qrScanner = new QrScanner(
        videoRef.current,
        async (result) => {
          if (result?.data) {
            const decodedText = result.data;
            console.log('🔍 QR Code detectado:', decodedText);
            
            // Limpar apenas caracteres não numéricos se parecer ser chave NF-e
            const cleaned = decodedText.replace(/\D/g, '');
            const finalCode = cleaned.length === 44 ? cleaned : decodedText.trim();
            
            console.log('📦 Código processado:', finalCode);
            
            // Garantir processamento assíncrono
            const scanResult = await Promise.resolve(onScan(finalCode));
            
            console.log('✅ Resultado do scan:', scanResult);
            
            // Feedback visual
            if (scanResult === 'duplicate') {
              setScanFeedback('duplicate');
            } else if (scanResult === 'success' || scanResult !== 'error') {
              setScanFeedback('success');
            }
            
            setTimeout(() => setScanFeedback(null), 1500);
            // NÃO parar o scanner - continuar pronto para próximo scan
          }
        },
        {
          returnDetailedScanResult: true,
          highlightScanRegion: true,
          highlightCodeOutline: true,
          preferredCamera: "environment"
        }
      );

      qrScannerRef.current = qrScanner;
      await qrScanner.start();
      setScanning(true);
      console.log('📸 Scanner QR iniciado');
    } catch (error) {
      console.error("Erro ao iniciar scanner:", error);
      setUseManualMode(true);
    }
  };

  const stopScanner = () => {
    if (qrScannerRef.current) {
      qrScannerRef.current.stop();
      qrScannerRef.current.destroy();
      qrScannerRef.current = null;
    }
    setScanning(false);
  };

  const handleManualSubmit = () => {
    if (manualInput.trim()) {
      const result = onScan(manualInput.trim());
      setManualInput(""); // Limpar campo após scan
      
      // Feedback visual
      if (result === 'duplicate') {
        setScanFeedback('duplicate');
      } else {
        setScanFeedback('success');
      }
      
      setTimeout(() => setScanFeedback(null), 1500);
      // NÃO fechar o modal - manter aberto para próximo scan
    }
  };

  const theme = {
    bg: isDark ? '#0f172a' : '#ffffff',
    text: isDark ? '#f1f5f9' : '#111827',
    border: isDark ? '#334155' : '#e5e7eb',
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <style>{`
        .scan-region-highlight-svg,
        .code-outline-highlight {
          display: none !important;
        }
      `}</style>
      <DialogContent 
        className="max-w-md w-[95vw] p-0" 
        style={{ backgroundColor: theme.bg, borderColor: theme.border }}
      >
        <DialogHeader className="p-4 pb-3">
          <DialogTitle style={{ color: theme.text }}>
            Scanner QR Code
          </DialogTitle>
          {notaAtual && progressoAtual && (
            <div className="mt-3 p-4 rounded-xl border-2 shadow-lg" style={{ backgroundColor: isDark ? '#1e3a8a' : '#dbeafe', borderColor: isDark ? '#1e40af' : '#2563eb' }}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-base font-bold" style={{ color: isDark ? '#ffffff' : '#1e40af' }}>
                  NF {notaAtual.numero_nota}
                </span>
                <span className="text-sm font-bold px-2 py-1 rounded-lg" style={{ 
                  color: 'white',
                  backgroundColor: isDark ? '#2563eb' : '#1e40af'
                }}>
                  {progressoAtual.embarcados}/{progressoAtual.total} volumes
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 shadow-inner">
                <div 
                  className="bg-blue-600 h-3 rounded-full transition-all duration-300 shadow-md"
                  style={{ 
                    width: `${(progressoAtual.embarcados / progressoAtual.total) * 100}%`,
                    boxShadow: '0 2px 6px rgba(37, 99, 235, 0.5)'
                  }}
                />
              </div>
              {progressoAtual.faltam > 0 && (
                <p className="text-sm mt-2 text-center font-bold" style={{ color: isDark ? '#93c5fd' : '#1e40af' }}>
                  Faltam {progressoAtual.faltam} volume{progressoAtual.faltam !== 1 ? 's' : ''}
                </p>
              )}
            </div>
          )}
        </DialogHeader>

        <div className="p-4 pt-0">
          {!useManualMode ? (
            <div className="relative bg-black rounded-lg overflow-hidden" style={{ aspectRatio: '1/1', maxHeight: '70vh' }}>
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                style={{ transform: 'scaleX(-1)' }}
              />

              {/* Overlay QUADRADO */}
              <div 
                className="absolute inset-0 pointer-events-none flex items-center justify-center"
                style={{ zIndex: 5 }}
              >
                <div 
                  className="shadow-lg transition-all duration-300"
                  style={{
                    width: '80%',
                    height: '80%',
                    aspectRatio: '1/1',
                    maxWidth: '80%',
                    maxHeight: '80%',
                    boxShadow: scanFeedback 
                      ? `0 0 0 9999px rgba(0, 0, 0, 0.7), 0 0 40px ${scanFeedback === 'success' ? '#10b981' : '#f59e0b'}` 
                      : '0 0 0 9999px rgba(0, 0, 0, 0.5)',
                    borderRadius: '12px',
                    position: 'relative',
                    border: scanFeedback === 'success' 
                      ? '6px solid #10b981' 
                      : scanFeedback === 'duplicate' 
                      ? '6px solid #f59e0b' 
                      : '6px solid #60a5fa'
                  }}
                >
                  {/* Cantos */}
                  <div className="absolute top-0 left-0 w-12 h-12 border-t-8 border-l-8" style={{ borderRadius: '12px 0 0 0', borderColor: scanFeedback === 'success' ? '#10b981' : scanFeedback === 'duplicate' ? '#f59e0b' : '#60a5fa' }}></div>
                  <div className="absolute top-0 right-0 w-12 h-12 border-t-8 border-r-8" style={{ borderRadius: '0 12px 0 0', borderColor: scanFeedback === 'success' ? '#10b981' : scanFeedback === 'duplicate' ? '#f59e0b' : '#60a5fa' }}></div>
                  <div className="absolute bottom-0 left-0 w-12 h-12 border-b-8 border-l-8" style={{ borderRadius: '0 0 0 12px', borderColor: scanFeedback === 'success' ? '#10b981' : scanFeedback === 'duplicate' ? '#f59e0b' : '#60a5fa' }}></div>
                  <div className="absolute bottom-0 right-0 w-12 h-12 border-b-8 border-r-8" style={{ borderRadius: '0 0 12px 0', borderColor: scanFeedback === 'success' ? '#10b981' : scanFeedback === 'duplicate' ? '#f59e0b' : '#60a5fa' }}></div>
                </div>
              </div>
              
              {/* Feedback Visual */}
              {scanFeedback && (
                <div 
                  className="absolute top-4 left-1/2 transform -translate-x-1/2 z-20 px-6 py-3 rounded-xl font-bold text-base animate-in fade-in slide-in-from-top-2 shadow-2xl"
                  style={{
                    backgroundColor: scanFeedback === 'success' ? '#10b981' : '#f59e0b',
                    color: 'white',
                    boxShadow: `0 10px 30px ${scanFeedback === 'success' ? 'rgba(16, 185, 129, 0.6)' : 'rgba(245, 158, 11, 0.6)'}`,
                    border: '3px solid white'
                  }}
                >
                  {scanFeedback === 'success' ? '✓ VOLUME ESCANEADO' : '⚠️ VOLUME JÁ ESCANEADO'}
                </div>
              )}



              <div className="absolute top-2 right-2 z-10">
                <Button
                  onClick={() => {
                    stopScanner();
                    setUseManualMode(true);
                  }}
                  variant="outline"
                  size="sm"
                  className="bg-white/90 hover:bg-white"
                >
                  <Keyboard className="w-4 h-4 mr-1" />
                  Digitar
                </Button>
              </div>
            </div>
          ) : (
            <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-8 text-center" style={{ aspectRatio: '1/1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div className="w-full">
                <Keyboard className="w-12 h-12 mx-auto mb-3 text-blue-600" />
                <p className="text-sm mb-2" style={{ color: theme.text }}>Modo Manual</p>
                <Button
                  onClick={() => {
                    setUseManualMode(false);
                  }}
                  variant="outline"
                  size="sm"
                  style={{ borderColor: theme.border, color: theme.text }}
                >
                  <Camera className="w-4 h-4 mr-2" />
                  Voltar para Câmera
                </Button>
              </div>
            </div>
          )}

          <div className="mt-3 space-y-2">
            <div className="bg-white dark:bg-gray-900 border-2 rounded-lg p-3" style={{ borderColor: isDark ? '#3b82f6' : '#2563eb' }}>
              <div className="flex gap-2">
                <Input
                  placeholder="Digite ou cole o código..."
                  value={manualInput}
                  onChange={(e) => setManualInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && manualInput.trim()) {
                      handleManualSubmit();
                    }
                  }}
                  className="text-center font-mono text-lg h-12"
                  style={{ 
                    backgroundColor: isDark ? '#1e293b' : '#ffffff',
                    borderColor: isDark ? '#475569' : '#cbd5e1',
                    color: isDark ? '#f1f5f9' : '#0f172a'
                  }}
                  autoFocus
                />
                <Button
                  onClick={handleManualSubmit}
                  disabled={!manualInput.trim()}
                  className="bg-blue-600 hover:bg-blue-700 px-8 h-12 text-base"
                >
                  OK
                </Button>
              </div>
            </div>

            <Button
              variant="outline"
              onClick={onClose}
              className="w-full h-11"
              style={{ borderColor: theme.border, color: theme.text }}
            >
              <X className="w-4 h-4 mr-2" />
              Fechar Scanner
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}