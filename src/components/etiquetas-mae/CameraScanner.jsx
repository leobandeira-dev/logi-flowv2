import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Camera, X, Loader2, Keyboard, SwitchCamera } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import QrScanner from "qr-scanner";
import { useScanFeedback } from "./useScanFeedback";
import { useZebraScanner } from "./useZebraScanner";
import { ZEBRA_DETECTION, FEEDBACK_CONFIG, SCANNER_CONFIG } from "./scannerConstants";
import { findRearCameraIndex, findFrontCameraIndex, logCameraInfo, getCameraConfig, isIOS, isAndroid, detectCameraType } from "./cameraDetection";

export default function CameraScanner({ open, onClose, onScan, isDark, notaAtual, progressoAtual, externalFeedback }) {
  const videoRef = useRef(null);
  const [scanning, setScanning] = useState(false);
  const [manualInput, setManualInput] = useState("");
  const [useManualMode, setUseManualMode] = useState(false);
  const qrScannerRef = useRef(null);
  const [currentCameraIndex, setCurrentCameraIndex] = useState(0);
  const [availableCameras, setAvailableCameras] = useState([]);
  const [isUsingZebraScanner, setIsUsingZebraScanner] = useState(false);
  
  // Usar hooks customizados
  const { scanFeedback, applyFeedback } = useScanFeedback();
  const { setupZebraScanner: setupZebra, cleanupZebraScanner } = useZebraScanner(
    isUsingZebraScanner && open,
    onScan,
    applyFeedback
  );

  // Detectar dispositivo Zebra e câmeras ao abrir
  useEffect(() => {

    const detectCameras = async () => {
      try {
        const cameras = await QrScanner.listCameras(true);
        setAvailableCameras(cameras);
        
        // Log detalhado para debug
        logCameraInfo(cameras);
        
        // Priorizar câmera traseira por padrão
        const rearCameraIndex = findRearCameraIndex(cameras);
        setCurrentCameraIndex(rearCameraIndex);
        
        console.log(`Câmera selecionada: [${rearCameraIndex}] ${cameras[rearCameraIndex]?.label}`);
        console.log(`Plataforma: ${isIOS() ? 'iOS' : isAndroid() ? 'Android' : 'Outro'}`);
      } catch (error) {
        console.error('Erro ao detectar câmeras:', error);
      }
    };
    
    if (open) {
      const isZebra = ZEBRA_DETECTION.isZebraDevice(navigator.userAgent);
      setIsUsingZebraScanner(isZebra);
      detectCameras();
    }
  }, [open]);

  // Reiniciar scanner quando trocar de câmera
  useEffect(() => {
    if (open && !useManualMode && !isUsingZebraScanner && availableCameras.length > 0) {
      setTimeout(() => {
        startScanner();
      }, 100);
    }

    return () => {
      if (!isUsingZebraScanner) {
        stopScanner();
      }
    };
  }, [open, useManualMode, currentCameraIndex, isUsingZebraScanner]);

  // Ativar/desativar Zebra quando needed
  useEffect(() => {
    if (isUsingZebraScanner && open) {
      setupZebra();
    }
    return cleanupZebraScanner;
  }, [isUsingZebraScanner, open, setupZebra, cleanupZebraScanner]);

  const startScanner = async () => {
    if (qrScannerRef.current || useManualMode || !videoRef.current) return;

    try {
      const cameraConfig = getCameraConfig(availableCameras, currentCameraIndex);
      console.log('Iniciando scanner com câmera:', cameraConfig.label || 'padrão');

      const qrScanner = new QrScanner(
        videoRef.current,
        async (result) => {
          if (result?.data && !scanFeedback) {
            const decodedText = result.data;
            console.log('🔍 QR Code detectado:', decodedText);

            const cleaned = decodedText.replace(/\D/g, '');
            const finalCode = cleaned.length === 44 ? cleaned : decodedText.trim();

            console.log('📦 Código processado:', finalCode);

            // Usar hook de feedback centralizado
            const scanResult = await Promise.resolve(onScan(finalCode));
            applyFeedback(scanResult);
          }
        },
        {
          returnDetailedScanResult: true,
          highlightScanRegion: false,
          highlightCodeOutline: false,
          preferredCamera: cameraConfig,
          maxScansPerSecond: SCANNER_CONFIG.maxScansPerSecond,
          calculateScanRegion: (video) => {
            const smallestDimension = Math.min(video.videoWidth, video.videoHeight);
            const scanRegionSize = Math.round(0.9 * smallestDimension);

            return {
              x: Math.round((video.videoWidth - scanRegionSize) / 2),
              y: Math.round((video.videoHeight - scanRegionSize) / 2),
              width: scanRegionSize,
              height: scanRegionSize,
            };
          }
        }
      );

      qrScanner.setInversionMode('both');

      qrScannerRef.current = qrScanner;
      await qrScanner.start();
      setScanning(true);

      // Otimizações específicas para Zebra TC210K
      try {
        const videoTrack = videoRef.current?.srcObject?.getVideoTracks()[0];
        if (videoTrack) {
          const capabilities = videoTrack.getCapabilities();
          const constraints = {};

          // Foco contínuo otimizado
          if (capabilities.focusMode) {
            if (capabilities.focusMode.includes('continuous')) {
              constraints.focusMode = 'continuous';
            } else if (capabilities.focusMode.includes('single-shot')) {
              constraints.focusMode = 'single-shot';
            }
          }

          // Resolução alta
          if (capabilities.width && capabilities.height) {
            constraints.width = { ideal: 1920 };
            constraints.height = { ideal: 1080 };
          }

          // Exposição otimizada
          if (capabilities.exposureMode && capabilities.exposureMode.includes('continuous')) {
            constraints.exposureMode = 'continuous';
          }

          // Ativar torch/flash se disponível (câmera traseira)
          if (capabilities.torch) {
            constraints.torch = false; // Desligado por padrão, pode ser controlado depois
          }

          await videoTrack.applyConstraints({
            advanced: [{ ...constraints }]
          });

          console.log('📸 Scanner otimizado para Zebra TC210K');
          console.log('📸 Câmera ativa:', availableCameras[currentCameraIndex]?.label || 'Padrão');
        }
      } catch (error) {
        console.log('Otimizações de câmera não aplicadas:', error.message);
      }

      console.log('📸 Scanner QR iniciado');
    } catch (error) {
      console.error("Erro ao iniciar scanner:", error);
      setUseManualMode(true);
    }
  };

  const toggleCamera = async () => {
    if (isUsingZebraScanner) {
      cleanupZebraScanner();
      setIsUsingZebraScanner(false);
      setTimeout(() => {
        if (availableCameras.length > 0) {
          startScanner();
        }
      }, 300);
      return;
    }

    if (availableCameras.length < 2) {
      if (ZEBRA_DETECTION.isZebraDevice(navigator.userAgent)) {
        stopScanner();
        setIsUsingZebraScanner(true);
      }
      return;
    }

    // Alternar entre câmeras disponíveis
    stopScanner();
    const currentType = detectCameraType(availableCameras[currentCameraIndex]?.label);
    
    // Se está na traseira, ir para frontal; se está na frontal, ir para traseira
    let nextIndex;
    if (currentType === 'rear') {
      nextIndex = findFrontCameraIndex(availableCameras);
    } else {
      nextIndex = findRearCameraIndex(availableCameras);
    }
    
    setCurrentCameraIndex(nextIndex);
    console.log(`Alternando para câmera [${nextIndex}]: ${availableCameras[nextIndex]?.label}`);
  };

  const stopScanner = () => {
    if (qrScannerRef.current) {
      qrScannerRef.current.stop();
      qrScannerRef.current.destroy();
      qrScannerRef.current = null;
    }
    setScanning(false);
  };

  const handleManualSubmit = async () => {
    if (manualInput.trim()) {
      const result = await Promise.resolve(onScan(manualInput.trim()));
      applyFeedback(result);
      setManualInput("");
    }
  };

  const handleManualInputChange = async (e) => {
    const value = e.target.value;
    setManualInput(value);

    // Auto-submit se parecer um código válido (números com 44 dígitos ou padrão GTIN)
    if (value.length >= 44 || (value.length > 0 && value.endsWith('\n'))) {
      setTimeout(() => {
        const cleaned = value.trim().replace(/\D/g, '');
        if (cleaned.length >= 44 || value.trim().length > 0) {
          handleManualSubmit();
        }
      }, 100);
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
            Leitura de Código
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
          <div className="relative bg-black rounded-lg overflow-hidden" style={{ aspectRatio: '1/1', maxHeight: '70vh' }}>
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              style={{ transform: 'scaleX(-1)' }}
            />

            <div 
              className="absolute inset-0 pointer-events-none flex items-center justify-center transition-all duration-300"
              style={{ zIndex: 5 }}
            >
              <div 
                className="transition-all duration-300"
                style={{
                  width: '80%',
                  height: '80%',
                  border: scanFeedback === 'success' 
                    ? '2px solid #10b981' 
                    : scanFeedback === 'duplicate'
                    ? '2px solid #f59e0b'
                    : scanFeedback === 'error'
                    ? '2px solid #ef4444'
                    : scanFeedback === 'processing' 
                    ? '2px solid #3b82f6' 
                    : '2px solid rgba(255, 255, 255, 0.3)',
                  borderRadius: '8px'
                }}
              />
            </div>

            {/* Feedback Textual Central */}
            {scanFeedback && scanFeedback !== 'processing' && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div 
                  className={`px-6 py-3 rounded-lg font-semibold text-white shadow-2xl animate-in zoom-in-95 duration-200 ${
                    scanFeedback === 'success' 
                      ? 'bg-green-600' 
                      : scanFeedback === 'duplicate'
                      ? 'bg-yellow-600'
                      : 'bg-red-600'
                  }`}
                  style={{ fontSize: '16px' }}
                >
                  {scanFeedback === 'success' && 'Volume adicionado'}
                  {scanFeedback === 'duplicate' && 'Código já bipado'}
                  {scanFeedback === 'error' && 'Volume não encontrado'}
                </div>
              </div>
            )}

            <div className="absolute top-2 right-2 z-10 flex gap-2">
              <Button
                onClick={toggleCamera}
                variant="outline"
                size="sm"
                className="bg-white/90 hover:bg-white"
                title="Alternar câmera"
              >
                <SwitchCamera className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="mt-4 space-y-2">
            <div className="bg-white dark:bg-gray-900 border rounded-lg p-3" style={{ borderColor: isDark ? '#475569' : '#d1d5db' }}>
              <div className="flex gap-2">
                <Input
                  placeholder="Código..."
                  value={manualInput}
                  onChange={handleManualInputChange}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && manualInput.trim()) {
                      handleManualSubmit();
                    }
                  }}
                  className="text-center font-mono h-11"
                  style={{ 
                    backgroundColor: isDark ? '#1e293b' : '#ffffff',
                    borderColor: isDark ? '#334155' : '#e5e7eb',
                    color: isDark ? '#f1f5f9' : '#0f172a'
                  }}
                  autoFocus
                />
                <Button
                  onClick={handleManualSubmit}
                  disabled={!manualInput.trim()}
                  className="bg-blue-600 hover:bg-blue-700 px-6 h-11"
                >
                  OK
                </Button>
              </div>
            </div>

            <Button
              variant="outline"
              onClick={onClose}
              className="w-full h-10"
              style={{ borderColor: theme.border, color: theme.text }}
            >
              Fechar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}