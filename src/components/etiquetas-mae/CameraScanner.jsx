import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Camera, X, Loader2, Keyboard, RefreshCw } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import QrScanner from "qr-scanner";

export default function CameraScanner({ open, onClose, onScan, isDark, notaAtual, progressoAtual, externalFeedback }) {
  const videoRef = useRef(null);
  const inputRef = useRef(null);
  const [scanning, setScanning] = useState(false);
  const [manualInput, setManualInput] = useState("");
  const [useManualMode, setUseManualMode] = useState(false);
  const qrScannerRef = useRef(null);
  const [scanFeedback, setScanFeedback] = useState(null); // 'success' | 'duplicate' | 'error' | 'not_found' | 'processing' | null
  const [currentFacingMode, setCurrentFacingMode] = useState("environment"); // 'environment' ou 'user'
  const lastScannedCodeRef = useRef(null);
  const processingRef = useRef(false);
  const cooldownRef = useRef(false);

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

  // Auto-focus no input sempre que o modal abrir ou após processar
  useEffect(() => {
    if (open && inputRef.current) {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [open, scanFeedback]);

  // Auto-focus ao mudar para modo manual
  useEffect(() => {
    if (useManualMode && inputRef.current) {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [useManualMode]);

  // Manter foco no input sempre que não estiver processando
  useEffect(() => {
    if (open && !scanFeedback && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open, scanFeedback]);

  // Processamento automático quando scanner preencher o campo
  useEffect(() => {
    if (manualInput.trim() && !scanFeedback) {
      const timer = setTimeout(() => {
        handleManualSubmit();
      }, 100); // Pequeno delay para garantir que o código completo foi lido
      return () => clearTimeout(timer);
    }
  }, [manualInput]);

  const startScanner = async (facingMode = currentFacingMode) => {
    if (qrScannerRef.current || useManualMode || !videoRef.current) return;

    try {
      const qrScanner = new QrScanner(
        videoRef.current,
        async (result) => {
          // PREVENÇÃO CRÍTICA: Ignorar se já está processando ou em cooldown
          if (!result?.data || processingRef.current || cooldownRef.current) {
            return;
          }

          const decodedText = result.data;
          const cleaned = decodedText.replace(/\D/g, '');
          const finalCode = cleaned.length === 44 ? cleaned : decodedText.trim();

          // PREVENÇÃO DE DUPLICAÇÃO: Ignorar se é o mesmo código dos últimos 3 segundos
          if (lastScannedCodeRef.current === finalCode) {
            console.log('⏭️ Código já processado recentemente, ignorando');
            return;
          }

          console.log('🔍 Novo código detectado:', finalCode);

          // BLOQUEAR novos scans imediatamente
          processingRef.current = true;
          cooldownRef.current = true;
          lastScannedCodeRef.current = finalCode;
          setScanFeedback('processing');

          try {
            const scanResult = await Promise.resolve(onScan(finalCode));
            console.log('✅ Resultado:', scanResult);

            // Aplicar feedback visual
            if (scanResult === 'success') {
              setScanFeedback('success');
            } else if (scanResult === 'duplicate') {
              setScanFeedback('duplicate');
            } else if (scanResult === 'not_found') {
              setScanFeedback('not_found');
            } else if (scanResult === 'error') {
              setScanFeedback('error');
            }

            // Liberar após feedback visual
            setTimeout(() => {
              setScanFeedback(null);
              processingRef.current = false;
            }, 800);

            // Cooldown para aceitar novo código (3 segundos)
            setTimeout(() => {
              cooldownRef.current = false;
              lastScannedCodeRef.current = null;
            }, 3000);
            
          } catch (error) {
            console.error('❌ Erro no processamento:', error);
            setScanFeedback('error');
            setTimeout(() => {
              setScanFeedback(null);
              processingRef.current = false;
              cooldownRef.current = false;
            }, 800);
          }
        },
        {
          returnDetailedScanResult: true,
          highlightScanRegion: false,
          highlightCodeOutline: false,
          preferredCamera: facingMode,
          maxScansPerSecond: 2,
          calculateScanRegion: (video) => {
            // Área de scan maior para capturar códigos de diferentes distâncias
            const smallestDimension = Math.min(video.videoWidth, video.videoHeight);
            const scanRegionSize = Math.round(0.85 * smallestDimension);

            return {
              x: Math.round((video.videoWidth - scanRegionSize) / 2),
              y: Math.round((video.videoHeight - scanRegionSize) / 2),
              width: scanRegionSize,
              height: scanRegionSize,
            };
          }
        }
      );

      // Configurar vídeo para melhor qualidade e foco automático
      qrScanner.setInversionMode('both'); // Detectar QR codes claros e escuros

      qrScannerRef.current = qrScanner;
      await qrScanner.start();
      setScanning(true);
      setCurrentFacingMode(facingMode);

      // Otimizar configurações da câmera APÓS o scanner iniciar
      setTimeout(async () => {
        try {
          const videoTrack = videoRef.current?.srcObject?.getVideoTracks()[0];
          if (videoTrack) {
            const capabilities = videoTrack.getCapabilities();
            const constraints = {};

            // Ativar foco contínuo se disponível
            if (capabilities.focusMode && capabilities.focusMode.includes('continuous')) {
              constraints.focusMode = 'continuous';
            }

            // Zoom ideal se disponível
            if (capabilities.zoom) {
              constraints.zoom = Math.max(capabilities.zoom.min, 1);
            }

            if (Object.keys(constraints).length > 0) {
              await videoTrack.applyConstraints({
                advanced: [{ ...constraints }]
              });
            }

            console.log('📸 Scanner otimizado - Câmera:', facingMode);
          }
        } catch (error) {
          console.log('Otimizações de câmera não aplicadas:', error.message);
        }
      }, 500);

      console.log('📸 Scanner QR iniciado com câmera:', facingMode);
    } catch (error) {
      console.error("Erro ao iniciar scanner:", error);
      
      // Se falhar com câmera traseira, tentar frontal
      if (facingMode === "environment") {
        console.log("Tentando câmera frontal...");
        try {
          await startScanner("user");
        } catch (err) {
          setUseManualMode(true);
        }
      } else {
        setUseManualMode(true);
      }
    }
  };

  const stopScanner = () => {
    if (qrScannerRef.current) {
      qrScannerRef.current.stop();
      qrScannerRef.current.destroy();
      qrScannerRef.current = null;
    }
    
    // Parar todas as tracks de vídeo
    if (videoRef.current?.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    
    // Resetar estados
    setScanning(false);
    processingRef.current = false;
    cooldownRef.current = false;
    lastScannedCodeRef.current = null;
  };

  const toggleCamera = async () => {
    stopScanner();
    const newFacingMode = currentFacingMode === "environment" ? "user" : "environment";
    await startScanner(newFacingMode);
  };

  const handleManualSubmit = async () => {
    if (manualInput.trim()) {
      console.log('⌨️ MODO MANUAL - Código digitado:', manualInput.trim());
      
      const codigoParaProcessar = manualInput.trim();
      setManualInput(""); // Limpar imediatamente
      setScanFeedback('processing');
      
      const result = await Promise.resolve(onScan(codigoParaProcessar));
      
      console.log('⌨️ MODO MANUAL - Resultado:', result);
      
      // Aplicar feedback baseado no resultado
      if (result === 'success') {
        setScanFeedback('success');
      } else if (result === 'duplicate') {
        setScanFeedback('duplicate');
      } else if (result === 'not_found') {
        setScanFeedback('not_found');
      } else if (result === 'error') {
        setScanFeedback('error');
      }
      
      // Liberar para próximo scan e refocalizar
      setTimeout(() => {
        setScanFeedback(null);
        // Garantir foco
        setTimeout(() => {
          inputRef.current?.focus();
        }, 50);
      }, 800);
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
                    border: 'none',
                    backgroundColor: scanFeedback === 'success' 
                      ? 'rgba(16, 185, 129, 0.15)' 
                      : scanFeedback === 'duplicate'
                      ? 'rgba(245, 158, 11, 0.15)'
                      : scanFeedback === 'not_found'
                      ? 'rgba(249, 115, 22, 0.15)'
                      : scanFeedback === 'error'
                      ? 'rgba(239, 68, 68, 0.15)'
                      : scanFeedback === 'processing' 
                      ? 'rgba(59, 130, 246, 0.1)' 
                      : 'transparent'
                  }}
                >
                  {/* Cantos com Feedback Visual - Design Clean */}
                  <div className="absolute top-0 left-0 w-16 h-16 transition-all duration-300" style={{ 
                    borderTop: scanFeedback ? '3px solid' : '2px solid',
                    borderLeft: scanFeedback ? '3px solid' : '2px solid',
                    borderRadius: '8px 0 0 0', 
                    borderColor: scanFeedback === 'success' 
                      ? '#10b981' 
                      : scanFeedback === 'duplicate'
                      ? '#f59e0b'
                      : scanFeedback === 'not_found'
                      ? '#f97316'
                      : scanFeedback === 'error'
                      ? '#ef4444'
                      : scanFeedback === 'processing' 
                      ? '#3b82f6' 
                      : 'rgba(96, 165, 250, 0.8)',
                    boxShadow: scanFeedback 
                      ? scanFeedback === 'success' 
                        ? '0 0 12px rgba(16, 185, 129, 0.5)' 
                        : scanFeedback === 'duplicate'
                        ? '0 0 12px rgba(245, 158, 11, 0.5)'
                        : scanFeedback === 'not_found'
                        ? '0 0 12px rgba(249, 115, 22, 0.5)'
                        : scanFeedback === 'error'
                        ? '0 0 12px rgba(239, 68, 68, 0.5)'
                        : '0 0 12px rgba(59, 130, 246, 0.5)' 
                      : '0 0 8px rgba(96, 165, 250, 0.3)'
                  }}></div>
                  <div className="absolute top-0 right-0 w-16 h-16 transition-all duration-300" style={{ 
                    borderTop: scanFeedback ? '3px solid' : '2px solid',
                    borderRight: scanFeedback ? '3px solid' : '2px solid',
                    borderRadius: '0 8px 0 0', 
                    borderColor: scanFeedback === 'success' 
                      ? '#10b981' 
                      : scanFeedback === 'duplicate'
                      ? '#f59e0b'
                      : scanFeedback === 'not_found'
                      ? '#f97316'
                      : scanFeedback === 'error'
                      ? '#ef4444'
                      : scanFeedback === 'processing' 
                      ? '#3b82f6' 
                      : 'rgba(96, 165, 250, 0.8)',
                    boxShadow: scanFeedback 
                      ? scanFeedback === 'success' 
                        ? '0 0 12px rgba(16, 185, 129, 0.5)' 
                        : scanFeedback === 'duplicate'
                        ? '0 0 12px rgba(245, 158, 11, 0.5)'
                        : scanFeedback === 'not_found'
                        ? '0 0 12px rgba(249, 115, 22, 0.5)'
                        : scanFeedback === 'error'
                        ? '0 0 12px rgba(239, 68, 68, 0.5)'
                        : '0 0 12px rgba(59, 130, 246, 0.5)' 
                      : '0 0 8px rgba(96, 165, 250, 0.3)'
                  }}></div>
                  <div className="absolute bottom-0 left-0 w-16 h-16 transition-all duration-300" style={{ 
                    borderBottom: scanFeedback ? '3px solid' : '2px solid',
                    borderLeft: scanFeedback ? '3px solid' : '2px solid',
                    borderRadius: '0 0 0 8px', 
                    borderColor: scanFeedback === 'success' 
                      ? '#10b981' 
                      : scanFeedback === 'duplicate'
                      ? '#f59e0b'
                      : scanFeedback === 'not_found'
                      ? '#f97316'
                      : scanFeedback === 'error'
                      ? '#ef4444'
                      : scanFeedback === 'processing' 
                      ? '#3b82f6' 
                      : 'rgba(96, 165, 250, 0.8)',
                    boxShadow: scanFeedback 
                      ? scanFeedback === 'success' 
                        ? '0 0 12px rgba(16, 185, 129, 0.5)' 
                        : scanFeedback === 'duplicate'
                        ? '0 0 12px rgba(245, 158, 11, 0.5)'
                        : scanFeedback === 'not_found'
                        ? '0 0 12px rgba(249, 115, 22, 0.5)'
                        : scanFeedback === 'error'
                        ? '0 0 12px rgba(239, 68, 68, 0.5)'
                        : '0 0 12px rgba(59, 130, 246, 0.5)' 
                      : '0 0 8px rgba(96, 165, 250, 0.3)'
                  }}></div>
                  <div className="absolute bottom-0 right-0 w-16 h-16 transition-all duration-300" style={{ 
                    borderBottom: scanFeedback ? '3px solid' : '2px solid',
                    borderRight: scanFeedback ? '3px solid' : '2px solid',
                    borderRadius: '0 0 8px 0', 
                    borderColor: scanFeedback === 'success' 
                      ? '#10b981' 
                      : scanFeedback === 'duplicate'
                      ? '#f59e0b'
                      : scanFeedback === 'not_found'
                      ? '#f97316'
                      : scanFeedback === 'error'
                      ? '#ef4444'
                      : scanFeedback === 'processing' 
                      ? '#3b82f6' 
                      : 'rgba(96, 165, 250, 0.8)',
                    boxShadow: scanFeedback 
                      ? scanFeedback === 'success' 
                        ? '0 0 12px rgba(16, 185, 129, 0.5)' 
                        : scanFeedback === 'duplicate'
                        ? '0 0 12px rgba(245, 158, 11, 0.5)'
                        : scanFeedback === 'not_found'
                        ? '0 0 12px rgba(249, 115, 22, 0.5)'
                        : scanFeedback === 'error'
                        ? '0 0 12px rgba(239, 68, 68, 0.5)'
                        : '0 0 12px rgba(59, 130, 246, 0.5)' 
                      : '0 0 8px rgba(96, 165, 250, 0.3)'
                  }}></div>

                  {/* Feedback Textual Central */}
                  {scanFeedback && scanFeedback !== 'processing' && (
                    <div className="absolute inset-0 flex items-center justify-center px-4">
                      <div 
                        className={`px-6 py-4 rounded-xl font-bold text-white shadow-2xl animate-in zoom-in-95 duration-200 text-center ${
                          scanFeedback === 'success' 
                            ? 'bg-green-600' 
                            : scanFeedback === 'duplicate'
                            ? 'bg-yellow-600'
                            : scanFeedback === 'not_found'
                            ? 'bg-orange-600'
                            : 'bg-red-600'
                        }`}
                      >
                        <div style={{ fontSize: '20px', marginBottom: '4px' }}>
                          {scanFeedback === 'success' && '✓ VOLUME ADICIONADO'}
                          {scanFeedback === 'duplicate' && '⚠ JÁ ADICIONADO'}
                          {scanFeedback === 'not_found' && '⚠ NÃO ENCONTRADO'}
                          {scanFeedback === 'error' && '✗ ERRO'}
                        </div>
                        {scanFeedback === 'duplicate' && (
                          <div style={{ fontSize: '13px', opacity: 0.95, fontWeight: 'normal' }}>
                            Este volume já está na etiqueta
                          </div>
                        )}
                        {scanFeedback === 'not_found' && (
                          <div style={{ fontSize: '13px', opacity: 0.95, fontWeight: 'normal' }}>
                            Volume não existe no sistema
                          </div>
                        )}
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
                  <RefreshCw className="w-4 h-4" />
                </Button>
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
                  ref={inputRef}
                  placeholder="Pronto para bipar..."
                  value={manualInput}
                  onChange={(e) => setManualInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && manualInput.trim()) {
                      handleManualSubmit();
                    }
                  }}
                  readOnly
                  onFocus={(e) => {
                    e.target.readOnly = false;
                    setTimeout(() => {
                      if (document.activeElement === e.target) {
                        e.target.setSelectionRange(e.target.value.length, e.target.value.length);
                      }
                    }, 0);
                  }}
                  onBlur={(e) => {
                    e.target.readOnly = true;
                    // Re-focar imediatamente se perder foco
                    setTimeout(() => {
                      if (open && inputRef.current) {
                        inputRef.current.focus();
                      }
                    }, 10);
                  }}
                  className="text-center font-mono text-lg h-12"
                  style={{ 
                    backgroundColor: isDark ? '#1e293b' : '#ffffff',
                    borderColor: isDark ? '#475569' : '#cbd5e1',
                    color: isDark ? '#f1f5f9' : '#0f172a',
                    caretColor: 'transparent'
                  }}
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck="false"
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