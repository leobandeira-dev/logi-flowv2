import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Camera, X, Loader2, Keyboard, SwitchCamera } from "lucide-react";
import { playSuccessBeep, playDuplicateBeep, playLongErrorBeep } from "../utils/audioFeedback";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import QrScanner from "qr-scanner";

export default function CameraScanner({ open, onClose, onScan, isDark, notaAtual, progressoAtual, externalFeedback }) {
  const videoRef = useRef(null);
  const [scanning, setScanning] = useState(false);
  const [manualInput, setManualInput] = useState("");
  const [useManualMode, setUseManualMode] = useState(false);
  const qrScannerRef = useRef(null);
  const [scanFeedback, setScanFeedback] = useState(null); // 'success' | 'duplicate' | 'error' | 'processing' | null
  const [currentCameraIndex, setCurrentCameraIndex] = useState(0);
  const [availableCameras, setAvailableCameras] = useState([]);
  const [useZebraScanner, setUseZebraScanner] = useState(false);
  const [zebraListening, setZebraListening] = useState(false);
  const inputRef = useRef(null);
  const processandoRef = useRef(false);

  // Detectar dispositivo Zebra e câmeras ao abrir
  useEffect(() => {
    const detectZebra = () => {
      const userAgent = navigator.userAgent.toLowerCase();
      const isZebra = userAgent.includes('zebra') || 
                      userAgent.includes('tc21') || 
                      userAgent.includes('tc26') ||
                      userAgent.includes('tc2') ||
                      userAgent.includes('mc') ||
                      userAgent.includes('motorola');
      console.log('🦓 User Agent:', userAgent);
      console.log('🦓 Is Zebra?', isZebra);
      return isZebra;
    };

    const detectCameras = async () => {
      try {
        const cameras = await QrScanner.listCameras(true);
        setAvailableCameras(cameras);
        console.log('📷 Câmeras detectadas:', cameras);
        console.log('📷 Detalhes das câmeras:');
        cameras.forEach((cam, idx) => {
          console.log(`  [${idx}] Label: ${cam.label}, ID: ${cam.id}`);
        });
        
        // Buscar câmera traseira com prioridade
        let backCameraIndex = cameras.findIndex(cam => {
          const label = cam.label.toLowerCase();
          const id = cam.id.toLowerCase();
          return label.includes('back') || 
                 label.includes('traseira') ||
                 id.includes('back') ||
                 id.includes('environment');
        });
        
        // Se não encontrar, buscar environment
        if (backCameraIndex === -1) {
          backCameraIndex = cameras.findIndex(cam => 
            cam.label.toLowerCase().includes('environment')
          );
        }
        
        if (backCameraIndex !== -1) {
          setCurrentCameraIndex(backCameraIndex);
          console.log('📷 Câmera traseira selecionada:', cameras[backCameraIndex]?.label);
        } else {
          console.log('📷 Nenhuma câmera traseira encontrada');
        }
      } catch (error) {
        console.log('❌ Não foi possível detectar câmeras:', error);
      }
    };
    
    if (open) {
      const isZebra = detectZebra();
      console.log('🦓 Abrindo scanner - isZebra:', isZebra);
      
      if (isZebra) {
        console.log('🦓 FORÇANDO scanner Zebra nativo');
        setUseZebraScanner(true);
        setUseManualMode(false);
        setupZebraScanner();
      } else {
        console.log('📷 Detectando câmeras para QR Scanner');
        detectCameras();
        setUseZebraScanner(false);
      }
    }

    return () => {
      cleanupZebraScanner();
    };
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

  // Setup do scanner Zebra (DataWedge Intent)
  const setupZebraScanner = () => {
    if (zebraListening) return;

    const handleZebraScan = async (event) => {
      const data = event.detail;
      
      if (data && data.data && !processandoRef.current) {
        processandoRef.current = true;
        const scannedCode = data.data;
        console.log('🦓 ZEBRA SCAN:', scannedCode);

        const cleaned = scannedCode.replace(/\D/g, '');
        const finalCode = cleaned.length === 44 ? cleaned : scannedCode.trim();

        setScanFeedback('processing');
        const scanResult = await Promise.resolve(onScan(finalCode));

        if (scanResult === 'success') {
          setScanFeedback('success');
          playSuccessBeep(); // 1 bipe curto
          if (window.navigator.vibrate) window.navigator.vibrate(200);
        } else if (scanResult === 'duplicate') {
          setScanFeedback('duplicate');
          playDuplicateBeep(); // 2 bipes curtos
          if (window.navigator.vibrate) window.navigator.vibrate([100, 50, 100]);
        } else if (scanResult === 'error') {
          setScanFeedback('error');
          playLongErrorBeep(); // 1 bipe longo
          if (window.navigator.vibrate) window.navigator.vibrate([200, 100, 200]);
        }

        setTimeout(() => {
          setScanFeedback(null);
          processandoRef.current = false;
        }, 600);
      }
    };

    // Listener para Intent do DataWedge
    window.addEventListener('datawedge-scan', handleZebraScan);
    
    // Listener alternativo via broadcast
    const handleBroadcast = (e) => {
      if (e.data && typeof e.data === 'string') {
        handleZebraScan({ detail: { data: e.data } });
      }
    };
    window.addEventListener('message', handleBroadcast);

    setZebraListening(true);
    console.log('🦓 Scanner Zebra ativado - aguardando leitura...');
  };

  const cleanupZebraScanner = () => {
    if (zebraListening) {
      window.removeEventListener('datawedge-scan', () => {});
      window.removeEventListener('message', () => {});
      setZebraListening(false);
    }
  };

  const startScanner = async () => {
    if (qrScannerRef.current || useManualMode || !videoRef.current) return;

    try {
       // Forçar câmera traseira
       let cameraConfig = "environment";

       if (availableCameras.length > 0) {
         const camera = availableCameras[currentCameraIndex];
         console.log('📷 QrScanner iniciando com câmera:', camera?.label, camera?.id);
         cameraConfig = camera;
       } else {
         console.log('📷 Nenhuma câmera detectada, usando "environment"');
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

            // Bloquear novos scans
            setScanFeedback('processing');

            const scanResult = await Promise.resolve(onScan(finalCode));

            console.log('✅ Resultado do scan:', scanResult);

            // Aplicar feedback baseado no resultado
            if (scanResult === 'success') {
              setScanFeedback('success');
              // Vibração de sucesso no coletor Zebra
              if (window.navigator.vibrate) {
                window.navigator.vibrate(200);
              }
            } else if (scanResult === 'duplicate') {
              setScanFeedback('duplicate');
              // Vibração de alerta (padrão diferente)
              if (window.navigator.vibrate) {
                window.navigator.vibrate([100, 50, 100]);
              }
            } else if (scanResult === 'error') {
              setScanFeedback('error');
              // Vibração de erro
              if (window.navigator.vibrate) {
                window.navigator.vibrate([200, 100, 200]);
              }
            }

            // Liberar para próximo scan
            setTimeout(() => setScanFeedback(null), 800);
          }
        },
        {
          returnDetailedScanResult: true,
          highlightScanRegion: false,
          highlightCodeOutline: false,
          preferredCamera: cameraConfig,
          maxScansPerSecond: 8,
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
    // Se estiver usando Zebra scanner, alternar para câmera traseira
    if (useZebraScanner) {
      cleanupZebraScanner();
      setUseZebraScanner(false);
      
      // Buscar câmera traseira
      const backCameraIndex = availableCameras.findIndex(cam => 
        cam.label.toLowerCase().includes('back') || 
        cam.label.toLowerCase().includes('traseira') ||
        cam.label.toLowerCase().includes('environment') ||
        cam.id.toLowerCase().includes('back')
      );
      
      if (backCameraIndex !== -1) {
        setCurrentCameraIndex(backCameraIndex);
      }
      
      console.log('🔄 Alternando de scanner Zebra para câmera traseira...');
      setTimeout(() => {
        if (availableCameras.length > 0) {
          startScanner();
        }
      }, 300);
      return;
    }

    // Se estiver usando câmera traseira, voltar para scanner Zebra
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
    const codigo = manualInput.trim();
    
    if (!codigo || processandoRef.current) return;
    
    processandoRef.current = true;
    console.log('⌨️ Código lido:', codigo);
    
    setScanFeedback('processing');
    
    try {
      const result = await Promise.resolve(onScan(codigo));
      
      console.log('✅ Resultado:', result);
      
      // Aplicar feedback baseado no resultado
      if (result === 'success') {
        setScanFeedback('success');
        playSuccessBeep();
      } else if (result === 'duplicate') {
        setScanFeedback('duplicate');
        playDuplicateBeep();
      } else if (result === 'error') {
        setScanFeedback('error');
        playLongErrorBeep();
      }
    } catch (error) {
      console.error('Erro ao processar:', error);
      setScanFeedback('error');
      playLongErrorBeep();
    }
    
    // Limpar e re-focar após feedback
    setTimeout(() => {
      setScanFeedback(null);
      setManualInput("");
      processandoRef.current = false;
      
      // Re-focar input para próxima leitura
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 600);
  };

  // Manter foco sempre ativo no input APENAS no modo manual
  useEffect(() => {
    if (useManualMode && !processandoRef.current && inputRef.current) {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [useManualMode, scanFeedback, manualInput]);

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
              {useZebraScanner ? (
                <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-blue-900 to-blue-950 text-white p-6 relative">
                  <div className="animate-pulse mb-4">
                    <Camera className="w-16 h-16" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">🦓 Scanner Zebra Ativo</h3>
                  <p className="text-blue-200 text-center text-sm mb-4">
                    Aponte e pressione o gatilho amarelo
                  </p>
                  
                  {/* Indicador de status - SEM INPUT no modo nativo */}
                  <div className="w-full max-w-sm bg-white rounded-lg p-4 border-2 border-blue-400 shadow-xl">
                    <div className="text-center">
                      <p className="text-lg font-bold text-blue-900 mb-2">
                        {scanFeedback === 'processing' ? '⏳ Processando...' : '✓ Pronto para leitura'}
                      </p>
                      <p className="text-xs text-blue-700">
                        Aponte e pressione o gatilho
                      </p>
                    </div>
                  </div>
                  
                  {/* Feedback visual para modo Zebra */}
                  {scanFeedback && scanFeedback !== 'processing' && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/70 z-20">
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
                  style={{ transform: 'scaleX(1)' }}
                />
              )}

              {/* Overlay com Feedback por Cor */}
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



              <div className="absolute top-2 right-2 z-10 flex gap-2">
                <Button
                  onClick={toggleCamera}
                  variant="outline"
                  size="sm"
                  className="bg-white/90 hover:bg-white"
                  title={useZebraScanner ? "Usar câmera web" : "Alternar câmera"}
                >
                  <SwitchCamera className="w-4 h-4" />
                </Button>
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
          {useManualMode && (
            <div className="bg-white dark:bg-gray-900 border-2 rounded-lg p-3" style={{ borderColor: isDark ? '#3b82f6' : '#2563eb' }}>
              <div className="flex gap-2">
                <Input
                  ref={inputRef}
                  placeholder="Digite ou cole o código..."
                  value={manualInput}
                  onChange={(e) => setManualInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && manualInput.trim()) {
                      e.preventDefault();
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
                  disabled={!manualInput.trim() || processandoRef.current}
                  className="bg-blue-600 hover:bg-blue-700 px-8 h-12 text-base"
                >
                  OK
                </Button>
              </div>
            </div>
          )}

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