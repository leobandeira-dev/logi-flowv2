// Feedback de áudio para operações de endereçamento e conferência

export const playSuccessBeep = () => {
  try {
    const context = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = context.createOscillator();
    const gainNode = context.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(context.destination);
    
    oscillator.frequency.value = 800; // Frequência agradável
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.3, context.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.15);
    
    oscillator.start(context.currentTime);
    oscillator.stop(context.currentTime + 0.15);
  } catch (error) {
    console.log("Audio não suportado:", error);
  }
};

export const playErrorBeep = () => {
  try {
    const context = new (window.AudioContext || window.webkitAudioContext)();
    
    // Tocar 3 bipes rápidos
    for (let i = 0; i < 3; i++) {
      setTimeout(() => {
        const oscillator = context.createOscillator();
        const gainNode = context.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(context.destination);
        
        oscillator.frequency.value = 400; // Frequência mais grave para erro
        oscillator.type = 'square';
        
        gainNode.gain.setValueAtTime(0.3, context.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.1);
        
        oscillator.start(context.currentTime);
        oscillator.stop(context.currentTime + 0.1);
      }, i * 120); // 120ms entre cada bipe
    }
  } catch (error) {
    console.log("Audio não suportado:", error);
  }
};

export const playDuplicateBeep = () => {
  try {
    const context = new (window.AudioContext || window.webkitAudioContext)();
    
    // Tocar 2 bipes curtos
    for (let i = 0; i < 2; i++) {
      setTimeout(() => {
        const oscillator = context.createOscillator();
        const gainNode = context.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(context.destination);
        
        oscillator.frequency.value = 600; // Frequência média para alerta
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.3, context.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.12);
        
        oscillator.start(context.currentTime);
        oscillator.stop(context.currentTime + 0.12);
      }, i * 150); // 150ms entre cada bipe
    }
  } catch (error) {
    console.log("Audio não suportado:", error);
  }
};

export const playLongErrorBeep = () => {
  try {
    const context = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = context.createOscillator();
    const gainNode = context.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(context.destination);
    
    oscillator.frequency.value = 350; // Frequência grave para erro
    oscillator.type = 'square';
    
    gainNode.gain.setValueAtTime(0.4, context.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.5); // Bipe longo
    
    oscillator.start(context.currentTime);
    oscillator.stop(context.currentTime + 0.5);
  } catch (error) {
    console.log("Audio não suportado:", error);
  }
};