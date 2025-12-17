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
        (result) => {
          if (result?.data) {
            const decodedText = result.data;
            // Limpar apenas caracteres não numéricos se parecer ser chave NF-e
            const cleaned = decodedText.replace(/\D/g, '');
            const finalCode = cleaned.length === 44 ? cleaned : decodedText.trim();
            onScan(finalCode);
            stopScanner();
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
      onScan(manualInput.trim());
      stopScanner();
      onClose();
    }
  };

  const theme = {
    bg: isDark ? '#0f172a' : '#ffffff',
    text: isDark ? '#f1f5f9' : '#111827',
    border: isDark ? '#334155' : '#e5e7eb',
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent 
        className="max-w-md w-[95vw] p-0" 
        style={{ backgroundColor: theme.bg, borderColor: theme.border }}
      >
        <DialogHeader className="p-4 pb-3">
          <DialogTitle style={{ color: theme.text }}>
            Scanner QR Code
          </DialogTitle>
          {notaAtual && progressoAtual && (
            <div className="mt-3 p-3 rounded-lg border" style={{ backgroundColor: isDark ? '#1e3a8a' : '#dbeafe', borderColor: isDark ? '#1e40af' : '#93c5fd' }}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold" style={{ color: isDark ? '#ffffff' : '#1e40af' }}>
                  NF {notaAtual.numero_nota}
                </span>
                <span className="text-xs font-bold" style={{ color: isDark ? '#60a5fa' : '#1e40af' }}>
                  {progressoAtual.embarcados}/{progressoAtual.total} volumes
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(progressoAtual.embarcados / progressoAtual.total) * 100}%` }}
                />
              </div>
              {progressoAtual.faltam > 0 && (
                <p className="text-xs mt-2 text-center font-medium" style={{ color: isDark ? '#93c5fd' : '#1e40af' }}>
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
                  className="border-4 border-green-400 shadow-lg"
                  style={{
                    width: '80%',
                    height: '80%',
                    aspectRatio: '1/1',
                    maxWidth: '80%',
                    maxHeight: '80%',
                    boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.5)',
                    borderRadius: '12px',
                    position: 'relative'
                  }}
                >
                  {/* Cantos animados */}
                  <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-green-400 animate-pulse" style={{ borderRadius: '12px 0 0 0' }}></div>
                  <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-green-400 animate-pulse" style={{ borderRadius: '0 12px 0 0' }}></div>
                  <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-green-400 animate-pulse" style={{ borderRadius: '0 0 0 12px' }}></div>
                  <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-green-400 animate-pulse" style={{ borderRadius: '0 0 12px 0' }}></div>
                </div>
              </div>



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

          <div className="mt-4 space-y-3">
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
              <p className="text-xs text-center font-medium mb-2" style={{ color: isDark ? '#93c5fd' : '#1e40af' }}>
                💡 Digite ou cole o código
              </p>
              <div className="flex gap-2">
                <Input
                  placeholder="Código QR ou código de barras..."
                  value={manualInput}
                  onChange={(e) => setManualInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleManualSubmit();
                    }
                  }}
                  className="text-center font-mono text-base"
                  style={{ backgroundColor: theme.bg, borderColor: theme.border, color: theme.text }}
                  autoFocus={useManualMode}
                />
                <Button
                  onClick={handleManualSubmit}
                  disabled={!manualInput.trim()}
                  className="bg-blue-600 hover:bg-blue-700 px-6"
                >
                  OK
                </Button>
              </div>
            </div>



            <Button
              variant="outline"
              onClick={onClose}
              className="w-full"
              style={{ borderColor: theme.border, color: theme.text }}
            >
              <X className="w-4 h-4 mr-2" />
              Cancelar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}