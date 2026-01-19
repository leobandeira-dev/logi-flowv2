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

export default function CameraScanner({ open, onClose, onScan, isDark, notaAtual, progressoAtual, externalFeedback }) {
  const videoRef = useRef(null);
  const [scanning, setScanning] = useState(false);
  const [manualInput, setManualInput] = useState("");
  const [useManualMode, setUseManualMode] = useState(false);
  const qrScannerRef = useRef(null);
  const [currentCameraIndex, setCurrentCameraIndex] = useState(0);
  const [availableCameras, setAvailableCameras] = useState([]);
  const [useZebraScanner, setUseZebraScanner] = useState(false);
  
  // Usar hooks customizados
  const { scanFeedback, applyFeedback } = useScanFeedback();
  const { setupZebraScanner: setupZebra, cleanupZebraScanner } = useZebraScanner(
    useZebraScanner && open,
    onScan,
    applyFeedback
  );

  // Detectar dispositivo Zebra e câmeras ao abrir
  useEffect(() => {

    const detectCameras = async () => {
      try {
        const cameras = await QrScanner.listCameras(true);
        setAvailableCameras(cameras);
        console.log('📷 Câmeras detectadas:', cameras);
        console.log('📷 Detalhes:', cameras.map(c => ({ label: c.label, id: c.id })));

        // Procurar câmera traseira (environment/back)
        const backCameraIndex = cameras.findIndex(cam => 
          cam.label.toLowerCase().includes('back') || 
          cam.label.toLowerCase().includes('traseira') ||
          cam.label.toLowerCase().includes('environment')
        );

        const selectedIndex = backCameraIndex !== -1 ? backCameraIndex : 0;
        setCurrentCameraIndex(selectedIndex);
        console.log('📷 Câmera selecionada (index):', selectedIndex, 'Label:', cameras[selectedIndex]?.label);
      } catch (error) {
        console.log('Não foi possível detectar câmeras:', error);
      }
    };
    
    if (open) {
      const isZebra = ZEBRA_DETECTION.isZebraDevice(navigator.userAgent);
      setUseZebraScanner(isZebra);
      detectCameras();
    }
  }, [open]);

  // Reiniciar scanner quando trocar de câmera
  useEffect(() => {
    if (open && !useManualMode && !useZebraScanner && availableCameras.length > 0) {
      setTimeout(() => {
        startScanner();
      }, 100);
    }

    return () => {
      if (!useZebraScanner) {
        stopScanner();
      }
    };
  }, [open, useManualMode, currentCameraIndex, useZebraScanner]);

  // Ativar/desativar Zebra quando needed
  useEffect(() => {
    if (useZebraScanner && open) {
      setupZebra();
    }
    return cleanupZebraScanner;
  }, [useZebraScanner, open, setupZebra, cleanupZebraScanner]);

  const startScanner = async () => {
    if (qrScannerRef.current || useManualMode || !videoRef.current) return;

    try {
      // Preferir câmera traseira (environment) se disponível, senão usar a primeira
      let cameraConfig = "environment"; // Padrão: câmera traseira

      if (availableCameras.length > 0) {
        const selectedCamera = availableCameras[currentCameraIndex];
        console.log('📷 Usando câmera:', selectedCamera.label);
        cameraConfig = selectedCamera;
      } else {
        console.log('📷 Nenhuma câmera detectada, usando preferência "environment"');
      }

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
    console.log('🔄 toggleCamera chamado. useZebraScanner:', useZebraScanner, 'availableCameras:', availableCameras.length);
    // Se estiver usando Zebra scanner, alternar para câmera web
    if (useZebraScanner) {
      cleanupZebraScanner();
      setUseZebraScanner(false);
      console.log('🔄 Alternando de scanner Zebra para câmera web...');
      // Aguardar um pouco antes de iniciar o scanner de câmera
      setTimeout(() => {
        if (availableCameras.length > 0) {
          startScanner();
        }
      }, 300);
      return;
    }

    // Se estiver usando câmera web, alternar entre câmeras ou voltar para Zebra
    if (availableCameras.length > 1) {
      stopScanner();
      const nextIndex = (currentCameraIndex + 1) % availableCameras.length;
      setCurrentCameraIndex(nextIndex);
      console.log('🔄 Alternando para câmera:', availableCameras[nextIndex]?.label);
    } else {
      // Se só tem uma câmera e é Zebra, voltar para scanner Zebra
      const userAgent = navigator.userAgent.toLowerCase();
      const isZebraDevice = userAgent.includes('zebra') || 
                           userAgent.includes('tc21') || 
                           userAgent.includes('tc26') ||
                           userAgent.includes('mc');
      
      if (isZebraDevice) {
        stopScanner();
        setUseZebraScanner(true);
        setupZebraScanner();
        console.log('🔄 Voltando para scanner Zebra nativo...');
      }
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

  const handleManualSubmit = async () => {
    if (manualInput.trim()) {
      const result = await Promise.resolve(onScan(manualInput.trim()));
      applyFeedback(result);
      setManualInput("");
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
              {/* Legenda de Modo */}
              <div className="absolute top-2 left-2 z-20 bg-black/70 text-white px-3 py-1 rounded-full text-xs font-semibold">
                {useZebraScanner ? '🦓 Modo Leitor' : '📷 Modo Câmera'}
              </div>

              {useZebraScanner ? (
                <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-blue-900 to-blue-950 text-white p-8 relative">
                  <div className="animate-pulse mb-6">
                    <Camera className="w-24 h-24" />
                  </div>
                  <h3 className="text-2xl font-bold mb-2">🦓 Scanner Zebra Ativo</h3>
                  <p className="text-blue-200 text-center mb-6">
                    Pressione os botões amarelos do coletor para ler
                  </p>

                  {/* Feedback visual para modo Zebra */}
                  {scanFeedback && scanFeedback !== 'processing' && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-20">
                      <div 
                        className={`px-8 py-4 rounded-xl font-bold text-white shadow-2xl animate-in zoom-in-95 duration-200 ${
                          scanFeedback === 'success' 
                            ? 'bg-green-600' 
                            : scanFeedback === 'duplicate'
                            ? 'bg-yellow-600'
                            : 'bg-red-600'
                        }`}
                        style={{ fontSize: '24px' }}
                      >
                        {scanFeedback === 'success' && '✓ VOLUME ADICIONADO'}
                        {scanFeedback === 'duplicate' && '⚠ JÁ BIPADO'}
                        {scanFeedback === 'error' && '✗ VOLUME NÃO ENCONTRADO'}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <video
                  ref={videoRef}
                  className="w-full h-full object-cover"
                  style={{ transform: 'scaleX(-1)' }}
                />
              )}

              {useZebraScanner ? null : (
                <div 
                  className="absolute inset-0 pointer-events-none flex items-center justify-center transition-all duration-300"
                  style={{ zIndex: 5 }}
                >
                  <div 
                    className="shadow-lg transition-all duration-300"
                    style={{
                      width: '85%',
                      height: '85%',
                      aspectRatio: '1/1',
                      maxWidth: '85%',
                      maxHeight: '85%',
                      boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.5)',
                      borderRadius: '12px',
                      position: 'relative',
                      border: scanFeedback === 'success' 
                        ? '8px solid #10b981' 
                        : scanFeedback === 'duplicate'
                        ? '8px solid #f59e0b'
                        : scanFeedback === 'error'
                        ? '8px solid #ef4444'
                        : scanFeedback === 'processing' 
                        ? '8px solid #3b82f6' 
                        : '6px solid #60a5fa',
                      backgroundColor: scanFeedback === 'success' 
                        ? 'rgba(16, 185, 129, 0.15)' 
                        : scanFeedback === 'duplicate'
                        ? 'rgba(245, 158, 11, 0.15)'
                        : scanFeedback === 'error'
                        ? 'rgba(239, 68, 68, 0.15)'
                        : scanFeedback === 'processing' 
                        ? 'rgba(59, 130, 246, 0.1)' 
                        : 'transparent'
                    }}
                  >
                    {/* Cantos com Feedback Visual */}
                    <div className="absolute top-0 left-0 w-16 h-16 border-t-8 border-l-8 transition-all duration-300" style={{ 
                      borderRadius: '12px 0 0 0', 
                      borderColor: scanFeedback === 'success' 
                        ? '#10b981' 
                        : scanFeedback === 'duplicate'
                        ? '#f59e0b'
                        : scanFeedback === 'error'
                        ? '#ef4444'
                        : scanFeedback === 'processing' 
                        ? '#3b82f6' 
                        : '#60a5fa',
                      borderWidth: scanFeedback ? '10px' : '8px'
                    }}></div>
                    <div className="absolute top-0 right-0 w-16 h-16 border-t-8 border-r-8 transition-all duration-300" style={{ 
                      borderRadius: '0 12px 0 0', 
                      borderColor: scanFeedback === 'success' 
                        ? '#10b981' 
                        : scanFeedback === 'duplicate'
                        ? '#f59e0b'
                        : scanFeedback === 'error'
                        ? '#ef4444'
                        : scanFeedback === 'processing' 
                        ? '#3b82f6' 
                        : '#60a5fa',
                      borderWidth: scanFeedback ? '10px' : '8px'
                    }}></div>
                    <div className="absolute bottom-0 left-0 w-16 h-16 border-b-8 border-l-8 transition-all duration-300" style={{ 
                      borderRadius: '0 0 0 12px', 
                      borderColor: scanFeedback === 'success' 
                        ? '#10b981' 
                        : scanFeedback === 'duplicate'
                        ? '#f59e0b'
                        : scanFeedback === 'error'
                        ? '#ef4444'
                        : scanFeedback === 'processing' 
                        ? '#3b82f6' 
                        : '#60a5fa',
                      borderWidth: scanFeedback ? '10px' : '8px'
                    }}></div>
                    <div className="absolute bottom-0 right-0 w-16 h-16 border-b-8 border-r-8 transition-all duration-300" style={{ 
                      borderRadius: '0 0 12px 0', 
                      borderColor: scanFeedback === 'success' 
                        ? '#10b981' 
                        : scanFeedback === 'duplicate'
                        ? '#f59e0b'
                        : scanFeedback === 'error'
                        ? '#ef4444'
                        : scanFeedback === 'processing' 
                        ? '#3b82f6' 
                        : '#60a5fa',
                      borderWidth: scanFeedback ? '10px' : '8px'
                    }}></div>

                    {/* Feedback Textual Central */}
                    {scanFeedback && scanFeedback !== 'processing' && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div 
                          className={`px-6 py-3 rounded-xl font-bold text-white shadow-2xl animate-in zoom-in-95 duration-200 ${
                            scanFeedback === 'success' 
                              ? 'bg-green-600' 
                              : scanFeedback === 'duplicate'
                              ? 'bg-yellow-600'
                              : 'bg-red-600'
                          }`}
                          style={{ fontSize: '18px' }}
                        >
                          {scanFeedback === 'success' && '✓ VOLUME ADICIONADO'}
                          {scanFeedback === 'duplicate' && '⚠ JÁ BIPADO'}
                          {scanFeedback === 'error' && '✗ VOLUME NÃO ENCONTRADO'}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}



              <div className="absolute top-2 right-2 z-10 flex gap-2">
                <Button
                  onClick={toggleCamera}
                  variant="outline"
                  size="sm"
                  className="bg-white/90 hover:bg-white"
                  title={useZebraScanner ? "Usar câmera web" : "Alternar câmera / Leitor"}
                >
                  <SwitchCamera className="w-4 h-4" />
                </Button>
                {!useZebraScanner && availableCameras.length === 0 && (
                  <Button
                    onClick={() => {
                      setUseZebraScanner(true);
                      setupZebraScanner();
                    }}
                    variant="outline"
                    size="sm"
                    className="bg-blue-100 hover:bg-blue-200 text-blue-900 font-bold"
                    title="Ativar leitor Zebra"
                  >
                    🦓 Leitor
                  </Button>
                )}
                <Button
                  onClick={() => {
                    if (!useZebraScanner) stopScanner();
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