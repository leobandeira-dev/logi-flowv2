import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Camera, X, Loader2, Keyboard, SwitchCamera, Scan } from "lucide-react";
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
  const zebraInputRef = useRef(null);
  const processandoRef = useRef(false);
  const zebraBufferRef = useRef('');
  const zebraTimeoutRef = useRef(null);
  const zebraListenersRef = useRef({});

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
        console.log('📷 Câmeras detectadas:', cameras.length);
        console.log('📷 Detalhes das câmeras:');
        cameras.forEach((cam, idx) => {
          console.log(`  [${idx}] Label: ${cam.label}, ID: ${cam.id}`);
        });
        
        // Estratégia de busca por câmera traseira (ordem de prioridade)
        let backCameraIndex = -1;
        
        // 1. Buscar por "back" ou "traseira"
        backCameraIndex = cameras.findIndex(cam => {
          const label = cam.label.toLowerCase();
          const id = cam.id.toLowerCase();
          return label.includes('back') || label.includes('traseira') || label.includes('rear');
        });
        
        // 2. Se não encontrar, buscar por "environment"
        if (backCameraIndex === -1) {
          backCameraIndex = cameras.findIndex(cam => 
            cam.label.toLowerCase().includes('environment')
          );
        }
        
        // 3. Se ainda não encontrar e houver múltiplas câmeras, usar a última (geralmente traseira em Zebra)
        if (backCameraIndex === -1 && cameras.length > 1) {
          backCameraIndex = cameras.length - 1;
          console.log('📷 Usando última câmera disponível como traseira');
        }
        
        // 4. Se ainda não encontrar, usar a primeira que não seja frontal
        if (backCameraIndex === -1) {
          backCameraIndex = cameras.findIndex(cam => 
            !cam.label.toLowerCase().includes('front') &&
            !cam.label.toLowerCase().includes('frontal') &&
            !cam.label.toLowerCase().includes('selfie')
          );
        }
        
        if (backCameraIndex !== -1) {
          setCurrentCameraIndex(backCameraIndex);
          console.log('📷✅ Câmera traseira selecionada:', cameras[backCameraIndex]?.label, `(índice: ${backCameraIndex})`);
        } else {
          console.log('📷⚠️ Nenhuma câmera traseira encontrada, usando padrão');
          setCurrentCameraIndex(0);
        }
      } catch (error) {
        console.log('❌ Erro ao detectar câmeras:', error.message);
      }
    };
    
    if (open) {
      const isZebra = detectZebra();
      console.log('🦓 Abrindo scanner - isZebra:', isZebra);
      
      if (isZebra) {
        console.log('🦓 FORÇANDO scanner Zebra nativo');
        setUseZebraScanner(true);
        setUseManualMode(false);
        // Aguardar rendering do input antes de setup
        setTimeout(() => {
          setupZebraScanner();
        }, 100);
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

  // Inicializar scanner de câmera APENAS quando não é Zebra
  useEffect(() => {
    if (open && !useManualMode && !useZebraScanner && availableCameras.length > 0) {
      console.log('📷 Iniciando câmera scanner...');
      setTimeout(() => {
        startScanner();
      }, 100);
    }

    return () => {
      if (!useZebraScanner) {
        console.log('📷 Parando câmera scanner...');
        stopScanner();
      }
    };
  }, [open, useManualMode, currentCameraIndex, useZebraScanner, availableCameras.length]);

  // Manter input Zebra oculto focado
  useEffect(() => {
   if (useZebraScanner && zebraInputRef.current) {
     zebraInputRef.current.focus();
     console.log('🦓 Input Zebra focado na inicialização');

     const refocusInterval = setInterval(() => {
       if (zebraInputRef.current) {
         zebraInputRef.current.focus();
       }
     }, 300);

     return () => clearInterval(refocusInterval);
   }
  }, [useZebraScanner, open]);

  // Setup do scanner Zebra com buffer acumulativo
  const setupZebraScanner = React.useCallback(() => {
    if (zebraListening) return;

    console.log('🦓 Iniciando setupZebraScanner com buffer acumulativo');

    const handleZebraScan = async (scannedCode) => {
      if (!scannedCode || processandoRef.current) return;

      processandoRef.current = true;
      const code = scannedCode.toString().trim();

      console.log('🦓 SCAN RECEBIDO:', code);

      setScanFeedback('processing');

      try {
        const scanResult = await Promise.resolve(onScan(code));
        console.log('🦓 RESULTADO:', scanResult);

        if (scanResult === 'success') {
          setScanFeedback('success');
          playSuccessBeep();
          if (window.navigator.vibrate) window.navigator.vibrate(200);
        } else if (scanResult === 'duplicate') {
          setScanFeedback('duplicate');
          playDuplicateBeep();
          if (window.navigator.vibrate) window.navigator.vibrate([100, 50, 100]);
        } else if (scanResult === 'error') {
          setScanFeedback('error');
          playLongErrorBeep();
          if (window.navigator.vibrate) window.navigator.vibrate([200, 100, 200]);
        }
      } catch (error) {
        console.error('🦓 ERRO:', error);
        setScanFeedback('error');
        playLongErrorBeep();
      }

      setTimeout(() => {
        setScanFeedback(null);
        processandoRef.current = false;
        zebraBufferRef.current = '';
        if (zebraInputRef.current) {
          zebraInputRef.current.focus();
          zebraInputRef.current.value = '';
        }
      }, 600);
    };

    // Focar input imediatamente
    if (zebraInputRef.current) {
      zebraInputRef.current.focus();
      console.log('🦓✅ Input focado');
    }

    // Listener para keypress - captura caracteres sendo digitados
    const handleKeyPress = (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        const buffer = zebraBufferRef.current.trim();
        console.log('🦓 Enter detectado. Buffer:', buffer);
        if (buffer) {
          handleZebraScan(buffer);
          zebraBufferRef.current = '';
        }
      } else {
        zebraBufferRef.current += e.key;

        // Limpar timeout anterior
        if (zebraTimeoutRef.current) clearTimeout(zebraTimeoutRef.current);

        // Se 50ms sem mais caracteres, considerar scan completo (fallback)
        zebraTimeoutRef.current = setTimeout(() => {
          const buffer = zebraBufferRef.current.trim();
          if (buffer && buffer.length > 10) { // Apenas se tiver tamanho razoável
            console.log('🦓 Timeout de buffer. Buffer:', buffer);
            handleZebraScan(buffer);
            zebraBufferRef.current = '';
          }
        }, 50);
      }
    };

    // Listener para input element value changes
    const handleInputChange = (e) => {
      const value = e.target.value.trim();
      console.log('🦓 Input change:', value);
      if (value && value.length > 10) {
        handleZebraScan(value);
        e.target.value = '';
        zebraBufferRef.current = '';
      }
    };

    // Listeners customizados Zebra
    const handleCustomScan = (e) => {
      console.log('🦓 Custom event:', e.type);
      const code = e.detail?.code || e.detail?.data;
      if (code) handleZebraScan(code);
    };

    // Registrar listeners
    if (zebraInputRef.current) {
      zebraInputRef.current.addEventListener('keypress', handleKeyPress);
      zebraInputRef.current.addEventListener('change', handleInputChange);
    }

    window.addEventListener('datawedge-scan', handleCustomScan);
    window.addEventListener('zebra-scan', handleCustomScan);

    zebraListenersRef.current = {
      keypress: handleKeyPress,
      change: handleInputChange,
      datawedge: handleCustomScan,
      zebra: handleCustomScan
    };

    setZebraListening(true);
    console.log('🦓✅ Scanner PRONTO - aguardando leitura');
  }, [onScan]);

  const cleanupZebraScanner = () => {
    console.log('🦓 Limpando scanner Zebra...');
    
    // Limpar timeout
    if (zebraTimeoutRef.current) {
      clearTimeout(zebraTimeoutRef.current);
      zebraTimeoutRef.current = null;
    }
    
    // Remover listeners do input
    if (zebraInputRef.current && zebraListenersRef.current.keypress) {
      zebraInputRef.current.removeEventListener('keypress', zebraListenersRef.current.keypress);
      zebraInputRef.current.removeEventListener('change', zebraListenersRef.current.change);
    }
    
    // Remover listeners globais
    if (zebraListenersRef.current.datawedge) {
      window.removeEventListener('datawedge-scan', zebraListenersRef.current.datawedge);
      window.removeEventListener('zebra-scan', zebraListenersRef.current.zebra);
    }
    
    zebraListenersRef.current = {};
    zebraBufferRef.current = '';
    setZebraListening(false);
    console.log('🦓 Limpeza concluída');
  };

  const startScanner = async () => {
   if (qrScannerRef.current || useManualMode || !videoRef.current) {
     console.log('📷 startScanner bloqueado:', { 
       hasScanner: !!qrScannerRef.current, 
       manualMode: useManualMode, 
       hasVideo: !!videoRef.current 
     });
     return;
   }

   try {
      console.log('📷 Iniciando scanner - currentCameraIndex:', currentCameraIndex, 'cameras:', availableCameras.length);

      // Priorizar câmera traseira (environment)
      let cameraConfig = { facingMode: "environment" };

      if (availableCameras.length > 0) {
        // Usar a câmera especificada pelo índice
        if (currentCameraIndex < availableCameras.length) {
          cameraConfig = availableCameras[currentCameraIndex];
          console.log('📷✅ Usando câmera selecionada:', cameraConfig?.label, `(índice: ${currentCameraIndex})`);
        } else {
          // Fallback: buscar câmera traseira
          const backCameraIndex = availableCameras.findIndex(cam => {
            const label = cam.label.toLowerCase();
            return label.includes('back') || 
                   label.includes('traseira') ||
                   label.includes('rear') ||
                   label.includes('environment');
          });

          if (backCameraIndex !== -1) {
            cameraConfig = availableCameras[backCameraIndex];
            setCurrentCameraIndex(backCameraIndex);
            console.log('📷✅ Câmera traseira encontrada:', cameraConfig?.label);
          }
        }
      } else {
        console.log('📷⚠️ Nenhuma câmera detectada, forçando environment');
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
               if (window.navigator.vibrate) {
                 window.navigator.vibrate(200);
               }
             } else if (scanResult === 'duplicate') {
               setScanFeedback('duplicate');
               if (window.navigator.vibrate) {
                 window.navigator.vibrate([100, 50, 100]);
               }
             } else if (scanResult === 'error') {
               setScanFeedback('error');
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

       // Verificar qual câmera foi ativada
       const videoTrack = videoRef.current?.srcObject?.getVideoTracks()[0];
       if (videoTrack) {
         const settings = videoTrack.getSettings();
         console.log('📷 Câmera ativa após start:', settings);
         console.log('📷 Facing mode:', settings.facingMode);
       }

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

      console.log('📸 Scanner QR iniciado com sucesso');
      } catch (error) {
      console.error("❌ Erro ao iniciar scanner:", error.message);
      console.error("Stack:", error.stack);
      // Tentar fallback para modo manual
      toast.error("Erro ao iniciar câmera: " + error.message);
      setUseManualMode(true);
      }
      };

  const toggleCamera = async () => {
   console.log('🔄 toggleCamera chamado - useZebraScanner:', useZebraScanner);

   // Se estiver usando Zebra scanner, alternar para câmera
   if (useZebraScanner) {
     cleanupZebraScanner();
     setUseZebraScanner(false);
     setUseManualMode(false);

     console.log('🔄 Alternando de scanner Zebra para câmera...');
     setTimeout(() => {
       startScanner();
     }, 500);
     return;
   }

   // Se estiver usando câmera, alternar para próxima câmera disponível
   if (availableCameras.length > 1) {
     const nextIndex = (currentCameraIndex + 1) % availableCameras.length;
     console.log(`🔄 Alternando câmera: ${currentCameraIndex} → ${nextIndex}`);
     setCurrentCameraIndex(nextIndex);

     stopScanner();
     setTimeout(() => {
       startScanner();
     }, 300);
     return;
   }

   // Se for dispositivo Zebra e não conseguiu alternar câmera, voltar para Zebra scanner
   const userAgent = navigator.userAgent.toLowerCase();
   const isZebraDevice = userAgent.includes('zebra') || 
                        userAgent.includes('tc21') || 
                        userAgent.includes('tc26') ||
                        userAgent.includes('mc');

   if (isZebraDevice && !useZebraScanner) {
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
            <div>
              {useZebraScanner ? (
                // ========== TELA DO LEITOR ZEBRA NATIVO ==========
                <div className="w-full rounded-lg overflow-hidden" style={{ aspectRatio: '1/1', maxHeight: '70vh' }}>
                  <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-b from-slate-700 via-slate-800 to-slate-900 text-white p-6 relative">
                    {/* Efeito de onda sutil ao fundo */}
                    <div className="absolute inset-0 overflow-hidden opacity-20">
                      <div className="absolute w-96 h-96 bg-green-500 rounded-full blur-3xl -bottom-20 -left-20 animate-pulse" />
                    </div>

                    <div className="relative z-10 flex flex-col items-center justify-center h-full gap-4">
                      {/* Ícone do Scanner */}
                      <div className="animate-pulse">
                        <Scan className="w-24 h-24 text-green-400" />
                      </div>

                      {/* Status Principal */}
                      <div className="text-center space-y-3">
                        <h3 className="text-3xl font-bold text-green-400">🦓 LEITOR ATIVO</h3>
                        <p className="text-slate-200 text-base font-semibold">
                          Aponte para o código de barras
                        </p>
                        <p className="text-slate-400 text-sm">
                          Pressione o gatilho ou passe o item
                        </p>
                      </div>

                      {/* Indicador Visual Grande */}
                      <div className="w-full max-w-sm">
                        {scanFeedback === 'processing' ? (
                          <div className="bg-blue-900/50 border-2 border-blue-500 rounded-xl p-6 backdrop-blur-sm">
                            <div className="flex items-center justify-center gap-3 mb-2">
                              <Loader2 className="w-6 h-6 text-blue-400 animate-spin" />
                              <span className="text-xl font-bold text-blue-300">PROCESSANDO</span>
                            </div>
                            <p className="text-xs text-blue-200 text-center">Aguarde...</p>
                          </div>
                        ) : scanFeedback === 'success' ? (
                          <div className="bg-green-900/50 border-2 border-green-500 rounded-xl p-6 backdrop-blur-sm animate-in zoom-in-95">
                            <div className="text-center">
                              <p className="text-2xl font-bold text-green-300 mb-1">✓ OK!</p>
                              <p className="text-sm text-green-200">Volume adicionado com sucesso</p>
                            </div>
                          </div>
                        ) : scanFeedback === 'duplicate' ? (
                          <div className="bg-yellow-900/50 border-2 border-yellow-500 rounded-xl p-6 backdrop-blur-sm animate-in zoom-in-95">
                            <div className="text-center">
                              <p className="text-2xl font-bold text-yellow-300 mb-1">⚠ DUPLICADO</p>
                              <p className="text-sm text-yellow-200">Este código já foi bipado</p>
                            </div>
                          </div>
                        ) : scanFeedback === 'error' ? (
                          <div className="bg-red-900/50 border-2 border-red-500 rounded-xl p-6 backdrop-blur-sm animate-in zoom-in-95">
                            <div className="text-center">
                              <p className="text-2xl font-bold text-red-300 mb-1">✗ ERRO</p>
                              <p className="text-sm text-red-200">Código não encontrado</p>
                            </div>
                          </div>
                        ) : (
                          <div className="bg-slate-800/80 border-2 border-green-500/50 rounded-xl p-6 backdrop-blur-sm">
                            <div className="text-center space-y-2">
                              <div className="w-12 h-12 rounded-full border-4 border-green-500 border-t-green-300 animate-spin mx-auto" />
                              <p className="text-lg font-bold text-green-400">AGUARDANDO</p>
                              <p className="text-xs text-slate-400">Pressione para ler</p>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Info Extra */}
                      <div className="text-center mt-2">
                        <p className="text-xs text-slate-400">
                          {notaAtual ? `NF ${notaAtual.numero_nota}` : 'Pronto para leitura'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                // ========== TELA DA CÂMERA DO CELULAR ==========
                <div className="relative bg-black rounded-lg overflow-hidden" style={{ aspectRatio: '1/1', maxHeight: '70vh' }}>
                  <video
                    ref={videoRef}
                    className="w-full h-full object-cover"
                    style={{ transform: 'scaleX(1)' }}
                  />
                  {/* Input oculto para capturar dados do scanner Zebra (configurado como teclado virtual) */}
                  <input
                    ref={zebraInputRef}
                    type="text"
                    style={{
                      position: 'absolute',
                      left: '-9999px',
                      width: '1px',
                      height: '1px',
                      opacity: 0,
                      pointerEvents: 'none'
                    }}
                    aria-label="Zebra Scanner Input"
                    autoComplete="off"
                  />
              )}

              {!useZebraScanner && (
               <>
                 {/* Overlay com Feedback por Cor - APENAS para câmera */}
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
                     title="Alternar câmera"
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
               </>
              )}
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