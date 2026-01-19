import { useState, useCallback, useRef } from 'react';
import { FEEDBACK_CONFIG, SCANNER_CONFIG } from './scannerConstants';
import { playSuccessBeep, playDuplicateBeep, playLongErrorBeep } from '../utils/audioFeedback';

/**
 * Hook para gerenciar feedback de scan com debounce
 */
export const useScanFeedback = () => {
  const [scanFeedback, setScanFeedback] = useState(null);
  const feedbackTimeoutRef = useRef(null);
  const lastFeedbackTimeRef = useRef(0);

  const applyFeedback = useCallback((feedbackType) => {
    // Debounce: evitar múltiplos feedbacks em rápida sucessão
    const now = Date.now();
    if (now - lastFeedbackTimeRef.current < SCANNER_CONFIG.debounceMs) {
      return;
    }
    lastFeedbackTimeRef.current = now;

    const config = FEEDBACK_CONFIG[feedbackType];
    if (!config) return;

    // Limpar timeout anterior
    if (feedbackTimeoutRef.current) {
      clearTimeout(feedbackTimeoutRef.current);
    }

    // Aplicar feedback visual
    setScanFeedback(feedbackType);

    // Aplicar efeitos sonoros
    if (feedbackType === 'success') {
      playSuccessBeep();
    } else if (feedbackType === 'duplicate') {
      playDuplicateBeep();
    } else if (feedbackType === 'error') {
      playLongErrorBeep();
    }

    // Aplicar vibração
    if (config.vibration && window.navigator.vibrate) {
      window.navigator.vibrate(config.vibration);
    }

    // Limpar feedback após duração
    feedbackTimeoutRef.current = setTimeout(() => {
      setScanFeedback(null);
    }, config.duration);
  }, []);

  const clearFeedback = useCallback(() => {
    if (feedbackTimeoutRef.current) {
      clearTimeout(feedbackTimeoutRef.current);
    }
    setScanFeedback(null);
  }, []);

  return {
    scanFeedback,
    applyFeedback,
    clearFeedback,
    config: FEEDBACK_CONFIG
  };
};