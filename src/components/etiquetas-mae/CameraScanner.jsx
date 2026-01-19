import React, { useState, useRef, useEffect, useCallback } from "react";
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
  const inputRef = useRef(null);
  const debounceTimerRef = useRef(null);
  const [scanning, setScanning] = useState(false);
  const [manualInput, setManualInput] = useState("");
  const [useManualMode, setUseManualMode] = useState(false);
  const qrScannerRef = useRef(null);
  const [currentCameraIndex, setCurrentCameraIndex] = useState(0);
  const [availableCameras, setAvailableCameras] = useState([]);
  const [isUsingZebraScanner, setIsUsingZebraScanner] = useState(false);

  // Wrapper para onScan que também atualiza o campo de input
  const handleScanResult = useCallback(async (code) => {
    setManualInput(code);
    return onScan(code);
  }, [onScan]);
  
  // Usar hooks customizados
  const { scanFeedback, applyFeedback } = useScanFeedback();
  const { setupZebraScanner: setupZebra, cleanupZebraScanner } = useZebraScanner(
    isUsingZebraScanner && open,
    handleScanResult,
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

  const stopScanner = useCallback(() => {
    if (qrScannerRef.current) {
      qrScannerRef.current.stop();
      qrScannerRef.current.destroy();
      qrScannerRef.current = null;
    }
    setScanning(false);
  }, []);

  const startScanner = useCallback(async () => {
    if (qrScannerRef.current || useManualMode || !videoRef.current) return;

    try {
      // Simplificar: sempre usar facingMode para câmera traseira no iOS
      let scannerConfig = {};

      if (isIOS()) {
        scannerConfig = { facingMode: 'environment' };
        console.log('📱 iOS: usando facingMode "environment" para câmera traseira');
      } else if (availableCameras.length > 0 && currentCameraIndex < availableCameras.length) {
        // Android/Desktop: usar a câmera específica
        scannerConfig = availableCameras[currentCameraIndex];
        console.log('📷 Usando câmera:', scannerConfig.label || 'padrão');
      } else {
        scannerConfig = { facingMode: 'environment' };
      }

      let lastScannedCode = null;
      let lastScanTime = 0;
      let processingRef = false;

      const qrScanner = new QrScanner(
        videoRef.current,
        async (result) => {
          if (!result?.data || processingRef) return;

          const now = Date.now();
          const decodedText = result.data.trim();

          // Debounce por tipo de scanner
          const minInterval = useManualMode ? SCANNER_CONFIG.cameraDebounceMs : SCANNER_CONFIG.cameraDebounceMs;

          // Anti-duplicate: mesmo código em intervalo curto
          if (decodedText === lastScannedCode && now - lastScanTime < minInterval) {
            return;
          }

          // Prevenir múltiplas requisições simultâneas
          if (processingRef) {
            return;
          }

          lastScannedCode = decodedText;
          lastScanTime = now;
          processingRef = true;

          try {
            const cleaned = decodedText.replace(/\D/g, '');
            const finalCode = cleaned.length === 44 ? cleaned : decodedText;

            const scanResult = await Promise.resolve(handleScanResult(finalCode));
            applyFeedback(scanResult);
          } catch (error) {
            console.error('❌ Erro ao processar QR:', error);
            applyFeedback('error');
          } finally {
            processingRef = false;
          }
        },
        {
          returnDetailedScanResult: true,
          highlightScanRegion: false,
          highlightCodeOutline: false,
          preferredCamera: scannerConfig,
          maxScansPerSecond: SCANNER_CONFIG.maxScansPerSecond
        }
      );

      qrScanner.setInversionMode('both');
      qrScannerRef.current = qrScanner;
      await qrScanner.start();
      setScanning(true);
      console.log('📸 Scanner iniciado com sucesso');

    } catch (error) {
      console.error("Erro ao iniciar scanner:", error);
      setUseManualMode(true);
    }
  }, [availableCameras, currentCameraIndex, useManualMode, handleScanResult, scanFeedback, applyFeedback, stopScanner]);

  // Reiniciar scanner quando trocar de câmera
  useEffect(() => {
    if (open && !useManualMode && !isUsingZebraScanner && availableCameras.length > 0) {
      setTimeout(() => {
        startScanner();
      }, 100);
    }

    return () => stopScanner();
  }, [open, useManualMode, currentCameraIndex, isUsingZebraScanner, startScanner, stopScanner]);

  // Ativar/desativar Zebra quando needed
  useEffect(() => {
    if (isUsingZebraScanner && open) {
      setupZebra();
    }
    return cleanupZebraScanner;
  }, [isUsingZebraScanner, open, setupZebra, cleanupZebraScanner]);

  const toggleCamera = useCallback(async () => {
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
  }, [availableCameras, currentCameraIndex, stopScanner, startScanner]);

  const handleManualSubmit = async () => {
    if (manualInput.trim()) {
      const result = await Promise.resolve(onScan(manualInput.trim()));
      applyFeedback(result);
      setManualInput("");
      // Refocus no input para o próximo volume
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const handleManualInputChange = async (e) => {
    const value = e.target.value;
    setManualInput(value);

    // Limpar debounce anterior para evitar múltiplas chamadas
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Se tem conteúdo e está completo (ou digitou espaço/Enter), buscar imediatamente
    if (value.trim()) {
      // Se detectar espaço ou caractere especial final, submit imediato
      if (value.includes(' ') || value.includes('\n') || value.endsWith('\t')) {
        const cleanValue = value.trim();
        if (cleanValue.length > 0) {
          // Atualizar state e chamar onScan
          setManualInput("");
          setTimeout(() => inputRef.current?.focus(), 50);
          onScan(cleanValue);
        }
      } else {
        // Debounce mais conservador para evitar múltiplas requisições
        debounceTimerRef.current = setTimeout(async () => {
          const finalValue = inputRef.current?.value?.trim();
          if (finalValue && finalValue.length > 0) {
            const result = await Promise.resolve(onScan(finalValue));
            applyFeedback(result);
            setManualInput("");
            setTimeout(() => inputRef.current?.focus(), 50);
          }
        }, 300);
      }
    }
  };

  const handleInputKeyDown = (e) => {
    // Capturar Enter - Zebra scanner envia Enter após o código
    if (e.key === 'Enter' && manualInput.trim()) {
      e.preventDefault();
      // Limpar debounce pendente e submeter imediatamente
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      handleManualSubmit();
    }
  };

  const handleInputPaste = async (e) => {
    // Prevenir comportamento padrão
    e.preventDefault();
    
    // Capturar o valor colado direto do evento
    const pastedValue = (e.clipboardData || window.clipboardData)?.getData('text')?.trim();
    
    if (pastedValue) {
      console.log('📋 Valor colado detectado:', pastedValue);
      
      // Limpar qualquer debounce anterior
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      
      // Atualizar o input visualmente
      if (inputRef.current) {
        inputRef.current.value = pastedValue;
      }
      
      // Chamar onScan direto (não esperar pelo state update)
      try {
        const result = await Promise.resolve(onScan(pastedValue));
        console.log('✅ onScan retornou:', result);
        
        applyFeedback(result);
        
        // Limpar input e manter foco
        if (inputRef.current) {
          inputRef.current.value = "";
        }
        setManualInput("");
        setTimeout(() => inputRef.current?.focus(), 100);
      } catch (error) {
        console.error('❌ Erro ao processar scan:', error);
        applyFeedback('error');
      }
    }
  };

  // Manter foco no input enquanto modal estiver aberto
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [open]);



  // Limpar debounce ao desmontar
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

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
          input { -webkit-user-select: none; user-select: none; }
          input:focus { outline: none; }
        `}</style>
        <DialogContent 
          className="!fixed !inset-0 !w-screen !h-screen !max-w-none !max-h-none !p-0 !m-0 !rounded-none !border-0 !left-0 !top-0 !translate-x-0 !translate-y-0" 
          style={{ backgroundColor: theme.bg, borderColor: theme.border, pointerEvents: 'none' }}
        >
        <DialogHeader className="absolute top-0 left-0 right-0 p-4 z-20 bg-gradient-to-b from-black/50 to-black/0">
          <DialogTitle style={{ color: 'white' }}>
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

        <div className="absolute inset-0 w-full h-full flex flex-col" style={{ pointerEvents: 'auto' }}>
          <div className="flex-1 bg-black overflow-hidden relative">
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              style={{ transform: 'scaleX(-1)' }}
            />

            <div 
              className="absolute inset-0 pointer-events-none flex items-center justify-center transition-all duration-200"
              style={{ zIndex: 5 }}
            >
              <div 
                className="transition-all duration-200"
                style={{
                  width: '92%',
                  height: '92%',
                  border: scanFeedback === 'success' 
                    ? '4px solid #10b981' 
                    : scanFeedback === 'duplicate'
                    ? '4px solid #f59e0b'
                    : scanFeedback === 'error'
                    ? '4px solid #ef4444'
                    : scanFeedback === 'processing' 
                    ? '4px solid #3b82f6' 
                    : '4px solid rgba(255, 255, 255, 0.5)',
                  borderRadius: '12px',
                  boxShadow: scanFeedback === 'success' 
                    ? '0 0 50px rgba(16, 185, 129, 0.8), 0 0 80px rgba(16, 185, 129, 0.5), inset 0 0 25px rgba(16, 185, 129, 0.3)' 
                    : scanFeedback === 'duplicate'
                    ? '0 0 50px rgba(245, 158, 11, 0.8), 0 0 80px rgba(245, 158, 11, 0.5), inset 0 0 25px rgba(245, 158, 11, 0.3)'
                    : scanFeedback === 'error'
                    ? '0 0 50px rgba(239, 68, 68, 0.8), 0 0 80px rgba(239, 68, 68, 0.5), inset 0 0 25px rgba(239, 68, 68, 0.3)'
                    : scanFeedback === 'processing' 
                    ? '0 0 50px rgba(59, 130, 246, 0.8), 0 0 80px rgba(59, 130, 246, 0.5), inset 0 0 25px rgba(59, 130, 246, 0.3)' 
                    : '0 0 40px rgba(255, 255, 255, 0.4), 0 0 60px rgba(255, 255, 255, 0.2), inset 0 0 20px rgba(255, 255, 255, 0.15)'
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

            <div className="absolute top-4 right-4 z-10 flex gap-2">
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

            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-black/0 space-y-2">
            <div className="bg-white dark:bg-gray-900 border rounded-lg p-3" style={{ borderColor: isDark ? '#475569' : '#d1d5db' }}>
              <div className="flex gap-2">
                <Input
                   ref={inputRef}
                   placeholder="Código..."
                   value={manualInput}
                   onChange={handleManualInputChange}
                   onKeyDown={handleInputKeyDown}
                   onPaste={handleInputPaste}
                   className="text-center font-mono h-11"
                   style={{ 
                     backgroundColor: isDark ? '#1e293b' : '#ffffff',
                     borderColor: isDark ? '#334155' : '#e5e7eb',
                     color: isDark ? '#f1f5f9' : '#0f172a'
                   }}
                   autoFocus
                   inputMode="none"
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