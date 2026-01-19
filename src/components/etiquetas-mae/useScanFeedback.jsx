import { useState, useCallback, useRef } from 'react';
import { FEEDBACK_CONFIG, SCANNER_CONFIG } from './scannerConstants';
import { playSuccessBeep, playDuplicateBeep, playLongErrorBeep } from '../utils/audioFeedback';

/**
 * Hook para gerenciar feedback de scan com anti-tremulação
 */
export const useScanFeedback = () => {
  const [scanFeedback, setScanFeedback] = useState(null);
  const feedbackTimeoutRef = useRef(null);
  const lastFeedbackRef = useRef(null);
  const feedbackQueueRef = useRef([]);

  const applyFeedback = useCallback((feedbackType) => {
    const config = FEEDBACK_CONFIG[feedbackType];
    if (!config) return;

    // Ignorar se mesmo feedback ativo
    if (lastFeedbackRef.current === feedbackType && scanFeedback === feedbackType) {
      return;
    }

    // Limpar timeout anterior para evitar piscadas
    if (feedbackTimeoutRef.current) {
      clearTimeout(feedbackTimeoutRef.current);
    }

    lastFeedbackRef.current = feedbackType;
    setScanFeedback(feedbackType);

    // Efeitos multisensoriais otimizados
    if (feedbackType === 'success') {
      playSuccessBeep();
      window.navigator.vibrate?.([100, 50, 100]);
    } else if (feedbackType === 'duplicate') {
      playDuplicateBeep();
      window.navigator.vibrate?.([80, 30, 80]);
    } else if (feedbackType === 'error') {
      playLongErrorBeep();
      window.navigator.vibrate?.([150, 80, 150]);
    }

    // Limpar feedback com duração otimizada
    feedbackTimeoutRef.current = setTimeout(() => {
      setScanFeedback(null);
    }, config.duration);
  }, [scanFeedback]);

  const clearFeedback = useCallback(() => {
    if (feedbackTimeoutRef.current) {
      clearTimeout(feedbackTimeoutRef.current);
    }
    setScanFeedback(null);
    lastFeedbackRef.current = null;
  }, []);

  return {
    scanFeedback,
    applyFeedback,
    clearFeedback,
    config: FEEDBACK_CONFIG
  };
};