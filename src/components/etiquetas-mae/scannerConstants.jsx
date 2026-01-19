// Constantes e configurações do scanner
export const FEEDBACK_TYPES = {
  SUCCESS: 'success',
  DUPLICATE: 'duplicate',
  ERROR: 'error',
  PROCESSING: 'processing',
  NONE: null
};

export const FEEDBACK_CONFIG = {
  success: {
    message: '✓ VOLUME ADICIONADO',
    color: 'bg-green-600',
    borderColor: '#10b981',
    bgColor: 'rgba(16, 185, 129, 0.15)',
    vibration: [200],
    duration: 800
  },
  duplicate: {
    message: '⚠ JÁ BIPADO',
    color: 'bg-yellow-600',
    borderColor: '#f59e0b',
    bgColor: 'rgba(245, 158, 11, 0.15)',
    vibration: [100, 50, 100],
    duration: 800
  },
  error: {
    message: '✗ VOLUME NÃO ENCONTRADO',
    color: 'bg-red-600',
    borderColor: '#ef4444',
    bgColor: 'rgba(239, 68, 68, 0.15)',
    vibration: [200, 100, 200],
    duration: 800
  },
  processing: {
    message: 'PROCESSANDO...',
    color: 'bg-blue-600',
    borderColor: '#3b82f6',
    bgColor: 'rgba(59, 130, 246, 0.1)',
    vibration: null,
    duration: 0
  }
};

export const ZEBRA_DETECTION = {
  patterns: ['zebra', 'tc21', 'tc26', 'mc'],
  isZebraDevice: (userAgent) => {
    const ua = userAgent.toLowerCase();
    return ZEBRA_DETECTION.patterns.some(pattern => ua.includes(pattern));
  }
};

export const SCANNER_CONFIG = {
  maxScansPerSecond: 8,
  scanRegionRatio: 0.9,
  focusMode: 'continuous',
  resolution: { ideal: 1920, height: 1080 },
  feedbackDuration: 800,
  debounceMs: 500
};