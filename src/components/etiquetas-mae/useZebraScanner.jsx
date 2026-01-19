import { useEffect, useRef, useCallback } from 'react';
import { ZEBRA_DETECTION, SCANNER_CONFIG } from './scannerConstants';

/**
 * Hook para gerenciar scanner Zebra com suporte otimizado ao TC 210
 */
export const useZebraScanner = (enabled, onScan, onFeedback) => {
  const handlersRef = useRef({});
  const abortControllerRef = useRef(null);
  const lastScanTimeRef = useRef(0);
  const pendingRequestRef = useRef(false);

  const setupZebraScanner = useCallback(() => {
    if (handlersRef.current.datawedge) {
      return;
    }

    abortControllerRef.current = new AbortController();
    let messageHandler = null;
    let datawedgeHandler = null;

    // Handler único com anti-duplicate e fila
    const handleZebraScan = async (scannedData) => {
      if (!scannedData || scannedData.length === 0) return;

      // Anti-duplicate: evitar multiplos scans do mesmo código
      const now = Date.now();
      if (now - lastScanTimeRef.current < SCANNER_CONFIG.zebraDebouncMs) {
        return;
      }

      // Fila de requisição: máximo 1 por vez
      if (pendingRequestRef.current) {
        return;
      }

      lastScanTimeRef.current = now;
      pendingRequestRef.current = true;

      try {
        const scannedCode = scannedData.trim();
        onFeedback('processing');
        
        const result = await Promise.resolve(onScan(scannedCode));
        onFeedback(result);
      } catch (error) {
        console.error('Erro ao processar scan Zebra:', error);
        onFeedback('error');
      } finally {
        pendingRequestRef.current = false;
      }
    };

    // Event listener para DataWedge (evento nativo Zebra)
    datawedgeHandler = (event) => {
      const data = event.detail?.data || event.data;
      if (data) {
        handleZebraScan(data);
      }
    };

    // Message listener para fallback
    messageHandler = (e) => {
      if (e.data && typeof e.data === 'string' && e.data.length > 5) {
        // Evitar processar mensagens muito curtas
        handleZebraScan(e.data);
      }
    };

    window.addEventListener('datawedge-scan', datawedgeHandler);
    window.addEventListener('message', messageHandler);

    // Registrar handlers para cleanup
    handlersRef.current = { datawedgeHandler, messageHandler };
    
    console.log('✓ Scanner Zebra TC 210 ativado');
  }, [onScan, onFeedback]);

  const cleanupZebraScanner = useCallback(() => {
    if (!handlersRef.current.datawedgeHandler) return;

    const { datawedgeHandler, messageHandler } = handlersRef.current;
    
    window.removeEventListener('datawedge-scan', datawedgeHandler);
    window.removeEventListener('message', messageHandler);
    
    handlersRef.current = {};
    pendingRequestRef.current = false;
    
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (enabled) {
      setupZebraScanner();
    }
    return cleanupZebraScanner;
  }, [enabled, setupZebraScanner, cleanupZebraScanner]);

  return { setupZebraScanner, cleanupZebraScanner };
};