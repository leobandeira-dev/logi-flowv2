/**
 * Detecção e mapeamento de câmeras com suporte para iOS, Android e WebRTC
 */

export const CAMERA_TYPES = {
  REAR: 'rear',      // Traseira
  FRONT: 'front',    // Frontal
  UNKNOWN: 'unknown'
};

/**
 * Detecta o tipo de câmera baseado no label
 */
export const detectCameraType = (label = '') => {
  const lowerLabel = label.toLowerCase();
  
  // Padrões para câmera traseira
  const rearPatterns = ['back', 'rear', 'traseira', 'environment', 'wide', 'main', 'ultra wide'];
  // Padrões para câmera frontal
  const frontPatterns = ['front', 'frontal', 'user', 'selfie', 'user facing'];
  
  if (rearPatterns.some(p => lowerLabel.includes(p))) {
    return CAMERA_TYPES.REAR;
  }
  if (frontPatterns.some(p => lowerLabel.includes(p))) {
    return CAMERA_TYPES.FRONT;
  }
  
  return CAMERA_TYPES.UNKNOWN;
};

/**
 * Encontra índice da câmera traseira
 */
export const findRearCameraIndex = (cameras) => {
  // Primeira passagem: procura explicitamente por "rear"
  let index = cameras.findIndex(cam => detectCameraType(cam.label) === CAMERA_TYPES.REAR);
  if (index !== -1) return index;
  
  // Segunda passagem: procura por padrões mais específicos no label completo
  index = cameras.findIndex(cam => {
    const label = cam.label.toLowerCase();
    // iOS geralmente tem "Front Camera" e "Back Camera"
    return label.includes('back') || label === 'rear';
  });
  if (index !== -1) return index;
  
  // Terceira passagem: procura por "environment" (padrão WebRTC)
  index = cameras.findIndex(cam => {
    const label = cam.label.toLowerCase();
    return label.includes('environment') || label.includes('wide');
  });
  if (index !== -1) return index;
  
  // Fallback: retorna primeiro índice
  return 0;
};

/**
 * Encontra índice da câmera frontal
 */
export const findFrontCameraIndex = (cameras) => {
  let index = cameras.findIndex(cam => detectCameraType(cam.label) === CAMERA_TYPES.FRONT);
  if (index !== -1) return index;
  
  index = cameras.findIndex(cam => {
    const label = cam.label.toLowerCase();
    // iOS geralmente tem "Front Camera"
    return label.includes('front') || label === 'user';
  });
  if (index !== -1) return index;
  
  return cameras.length > 1 ? cameras.length - 1 : 0;
};

/**
 * Obtém configuração de câmera preferida para QrScanner
 * No iOS, precisamos usar o object da câmera, não string
 */
export const getCameraConfig = (cameras, cameraIndex) => {
  if (!cameras || cameras.length === 0) {
    return { facingMode: 'environment' };
  }
  
  const selectedCamera = cameras[cameraIndex];
  if (!selectedCamera) {
    return { facingMode: 'environment' };
  }
  
  // Retorna o objeto da câmera (QrScanner usa isso)
  return selectedCamera;
};

/**
 * Log detalhado de câmeras (para debug)
 */
export const logCameraInfo = (cameras) => {
  console.log('=== MAPEAMENTO DE CÂMERAS ===');
  console.log(`Total de câmeras: ${cameras.length}`);
  
  cameras.forEach((cam, idx) => {
    const type = detectCameraType(cam.label);
    console.log(`[${idx}] ${cam.label}`);
    console.log(`    ID: ${cam.id}`);
    console.log(`    Tipo: ${type}`);
  });
  
  const rearIdx = findRearCameraIndex(cameras);
  const frontIdx = findFrontCameraIndex(cameras);
  console.log(`Câmera traseira (padrão): [${rearIdx}] ${cameras[rearIdx]?.label}`);
  console.log(`Câmera frontal: [${frontIdx}] ${cameras[frontIdx]?.label}`);
  console.log('============================');
};

/**
 * Detecta se está em iOS
 */
export const isIOS = () => {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
};

/**
 * Detecta se está em Android
 */
export const isAndroid = () => {
  return /Android/.test(navigator.userAgent);
};