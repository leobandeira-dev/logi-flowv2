import { useEffect, useRef, useCallback } from 'react';
import { ZEBRA_DETECTION } from './scannerConstants';

/**
 * Hook para gerenciar scanner Zebra com cleanup seguro
 */
export const useZebraScanner = (enabled, onScan, onFeedback) => {
  const handlersRef = useRef({});
  const abortControllerRef = useRef(null);

  const setupZebraScanner = useCallback(() => {
    if (handlersRef.current.datawedge) {
      console.log('⚠️ Scanner Zebra já registrado');
      return;
    }

    // Criar novo AbortController para cleanup
    abortControllerRef.current = new AbortController();

    // Handler único para DataWedge
    const handleZebraScan = async (event) => {
      const data = event.detail || { data: event.data };
      
      if (!data?.data) return;

      const scannedCode = data.data;
      console.log('🦓 ZEBRA SCAN:', scannedCode);

      // Enviar para processamento
      onFeedback('processing');
      const result = await Promise.resolve(onScan(scannedCode));
      onFeedback(result);
    };

    // Registrar listeners com referência para cleanup
    window.addEventListener('datawedge-scan', handleZebraScan);
    window.addEventListener('message', (e) => {
      if (e.data && typeof e.data === 'string') {
        handleZebraScan({ detail: { data: e.data } });
      }
    });

    handlersRef.current.datawedge = handleZebraScan;
    console.log('🦓 Scanner Zebra ativado');
  }, [onScan, onFeedback]);

  const cleanupZebraScanner = useCallback(() => {
    if (!handlersRef.current.datawedge) return;

    window.removeEventListener('datawedge-scan', handlersRef.current.datawedge);
    window.removeEventListener('message', handlersRef.current.datawedge);
    
    handlersRef.current.datawedge = null;
    
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    
    console.log('🔌 Scanner Zebra desligado');
  }, []);

  useEffect(() => {
    if (enabled) {
      setupZebraScanner();
    }
    return cleanupZebraScanner;
  }, [enabled, setupZebraScanner, cleanupZebraScanner]);

  return { setupZebraScanner, cleanupZebraScanner };
};