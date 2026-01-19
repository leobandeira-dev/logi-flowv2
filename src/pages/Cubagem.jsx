import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Camera, QrCode, Save, X, Ruler, Package, CheckCircle, RotateCcw, CreditCard, Scan } from "lucide-react";
import { toast } from "react-hot-toast";
import QrScanner from "qr-scanner";
import * as cocoSsd from "@tensorflow-models/coco-ssd";
import "@tensorflow/tfjs";

export default function Cubagem() {
  const [isDark, setIsDark] = useState(false);
  const [etapa, setEtapa] = useState("inicial");
  const [cameraAtiva, setCameraAtiva] = useState(false);
  const [fotoCapturada, setFotoCapturada] = useState(null);
  const [medidasTempoReal, setMedidasTempoReal] = useState(null);
  const [medidasCapturadas, setMedidasCapturadas] = useState(null);
  const [volumeId, setVolumeId] = useState(null);
  const [volume, setVolume] = useState(null);
  const [cubagem, setCubagem] = useState(0);
  const [historico, setHistorico] = useState([]);
  const [scanningQR, setScanningQR] = useState(false);
  const [processandoCaptura, setProcessandoCaptura] = useState(false);
  const [objetoDetectado, setObjetoDetectado] = useState(null);
  const [referenciaPixels, setReferenciaPixels] = useState(() => {
    const saved = localStorage.getItem('cubagem_referencia');
    return saved ? parseFloat(saved) : null;
  });
  const [modelo, setModelo] = useState(null);
  const [modoCalibracao, setModoCalibracao] = useState(false);
  const [medidasPendentes, setMedidasPendentes] = useState(() => {
    const saved = localStorage.getItem('medidas_pendentes');
    return saved ? JSON.parse(saved) : [];
  });
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const canvasOverlayRef = useRef(null);
  const streamRef = useRef(null);
  const qrScannerRef = useRef(null);
  const deteccaoIntervalRef = useRef(null);

  const CARTAO_LARGURA_CM = 8.56;
  const CARTAO_ALTURA_CM = 5.398;

  useEffect(() => {
    const checkDarkMode = () => {
      setIsDark(document.documentElement.classList.contains('dark'));
    };
    checkDarkMode();
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    loadHistorico();
    carregarModelo();
  }, []);

  const carregarModelo = async () => {
    try {
      toast.loading("Carregando modelo de IA...", { id: "modelo" });
      const modeloCarregado = await cocoSsd.load();
      setModelo(modeloCarregado);
      toast.success("Modelo carregado!", { id: "modelo" });
    } catch (error) {
      console.error("Erro ao carregar modelo:", error);
      toast.error("Erro ao carregar modelo de IA", { id: "modelo" });
    }
  };

  const loadHistorico = async () => {
    try {
      const volumes = await base44.entities.Volume.list(null, 100);
      const volumesComCubagem = volumes.filter(v => v.cubagem_m3 && v.foto_cubagem_url);
      setHistorico(volumesComCubagem);
    } catch (error) {
      console.error("Erro ao carregar histórico:", error);
    }
  };

  const iniciarCamera = async () => {
    setCameraAtiva(true);
    setEtapa("medindo");
    
    setTimeout(async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            facingMode: "environment",
            width: { ideal: 1920 }, 
            height: { ideal: 1080 } 
          } 
        });
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          streamRef.current = stream;
          
          videoRef.current.onloadedmetadata = async () => {
            try {
              await videoRef.current.play();
              toast.success("Câmera ativada");
              iniciarDeteccaoTempoReal();
            } catch (err) {
              console.error("Erro ao reproduzir:", err);
            }
          };
        }
      } catch (error) {
        console.error("Erro ao acessar câmera:", error);
        toast.error("Erro ao acessar câmera: " + error.message);
        setCameraAtiva(false);
        setEtapa("inicial");
      }
    }, 100);
  };

  const pararCamera = () => {
    if (deteccaoIntervalRef.current) {
      clearInterval(deteccaoIntervalRef.current);
      deteccaoIntervalRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (qrScannerRef.current) {
      qrScannerRef.current.stop();
      qrScannerRef.current = null;
    }
    setCameraAtiva(false);
    setScanningQR(false);
    setMedidasTempoReal(null);
  };

  const iniciarDeteccaoTempoReal = () => {
    if (deteccaoIntervalRef.current) {
      clearInterval(deteccaoIntervalRef.current);
    }
    
    deteccaoIntervalRef.current = setInterval(async () => {
      if (!videoRef.current || !canvasRef.current || !modelo || processandoCaptura) return;
      
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const overlay = canvasOverlayRef.current;
      
      if (!video.videoWidth || !video.videoHeight) return;
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      if (overlay) {
        overlay.width = video.videoWidth;
        overlay.height = video.videoHeight;
      }
      
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0);
      
      try {
        const predictions = await modelo.detect(canvas, undefined, 0.3);
        
        if (predictions.length > 0 && overlay) {
          const objeto = predictions.reduce((prev, current) => {
            const prevArea = prev.bbox[2] * prev.bbox[3];
            const currentArea = current.bbox[2] * current.bbox[3];
            return currentArea > prevArea ? current : prev;
          });
          
          const [x, y, larguraPixels, alturaPixels] = objeto.bbox;
          
          // Calcular medidas
          let larguraCm, alturaCm, comprimentoCm;
          let semCalibracao = false;
          
          if (modoCalibracao) {
            larguraCm = CARTAO_LARGURA_CM;
            alturaCm = CARTAO_ALTURA_CM;
            comprimentoCm = 0.1;
          } else if (referenciaPixels) {
            larguraCm = larguraPixels / referenciaPixels;
            alturaCm = alturaPixels / referenciaPixels;
            comprimentoCm = larguraCm * 0.7;
          } else {
            const estimativaPixelsPorCm = 10;
            larguraCm = larguraPixels / estimativaPixelsPorCm;
            alturaCm = alturaPixels / estimativaPixelsPorCm;
            comprimentoCm = larguraCm * 0.7;
            semCalibracao = true;
          }
          
          // Calcular tamanho da fonte e espessuras dinamicamente
          const fontSize = Math.max(22, video.videoWidth / 35);
          const lineWidth = Math.max(5, video.videoWidth / 250);
          
          // Calcular offset para profundidade (efeito 3D isométrico)
          const profundOffset = larguraPixels * 0.4;
          
          // Desenhar cubo 3D em perspectiva isométrica
          const overlayCtx = overlay.getContext('2d');
          overlayCtx.clearRect(0, 0, overlay.width, overlay.height);
          
          // Face frontal (verde - sólida)
          overlayCtx.strokeStyle = '#00ff00';
          overlayCtx.lineWidth = lineWidth;
          overlayCtx.strokeRect(x, y, larguraPixels, alturaPixels);
          
          // Linhas de profundidade (laranja)
          overlayCtx.strokeStyle = '#ffaa00';
          overlayCtx.lineWidth = lineWidth - 1;
          overlayCtx.setLineDash([12, 6]);
          
          // Conectar cantos frontal -> traseira
          overlayCtx.beginPath();
          overlayCtx.moveTo(x, y);
          overlayCtx.lineTo(x + profundOffset, y - profundOffset);
          overlayCtx.stroke();
          
          overlayCtx.beginPath();
          overlayCtx.moveTo(x + larguraPixels, y);
          overlayCtx.lineTo(x + larguraPixels + profundOffset, y - profundOffset);
          overlayCtx.stroke();
          
          overlayCtx.beginPath();
          overlayCtx.moveTo(x, y + alturaPixels);
          overlayCtx.lineTo(x + profundOffset, y + alturaPixels - profundOffset);
          overlayCtx.stroke();
          
          overlayCtx.beginPath();
          overlayCtx.moveTo(x + larguraPixels, y + alturaPixels);
          overlayCtx.lineTo(x + larguraPixels + profundOffset, y + alturaPixels - profundOffset);
          overlayCtx.stroke();
          
          // Face traseira (laranja pontilhada - mais clara)
          overlayCtx.strokeStyle = '#ffcc66';
          overlayCtx.strokeRect(x + profundOffset, y - profundOffset, larguraPixels, alturaPixels);
          overlayCtx.setLineDash([]);
          
          // Linha de medição - LARGURA (vermelho sólido)
          overlayCtx.strokeStyle = '#ff0000';
          overlayCtx.lineWidth = lineWidth;
          const larguraY = y + alturaPixels + 50;
          overlayCtx.beginPath();
          overlayCtx.moveTo(x, larguraY);
          overlayCtx.lineTo(x + larguraPixels, larguraY);
          overlayCtx.stroke();
          
          // Setas largura (triângulos preenchidos)
          const arrowSize = fontSize / 1.5;
          overlayCtx.fillStyle = '#ff0000';
          overlayCtx.beginPath();
          overlayCtx.moveTo(x, larguraY);
          overlayCtx.lineTo(x + arrowSize, larguraY - arrowSize/2);
          overlayCtx.lineTo(x + arrowSize, larguraY + arrowSize/2);
          overlayCtx.closePath();
          overlayCtx.fill();
          
          overlayCtx.beginPath();
          overlayCtx.moveTo(x + larguraPixels, larguraY);
          overlayCtx.lineTo(x + larguraPixels - arrowSize, larguraY - arrowSize/2);
          overlayCtx.lineTo(x + larguraPixels - arrowSize, larguraY + arrowSize/2);
          overlayCtx.closePath();
          overlayCtx.fill();
          
          // Linha de medição - ALTURA (vermelho sólido)
          const alturaX = x + larguraPixels + 50;
          overlayCtx.strokeStyle = '#ff0000';
          overlayCtx.beginPath();
          overlayCtx.moveTo(alturaX, y);
          overlayCtx.lineTo(alturaX, y + alturaPixels);
          overlayCtx.stroke();
          
          // Setas altura
          overlayCtx.fillStyle = '#ff0000';
          overlayCtx.beginPath();
          overlayCtx.moveTo(alturaX, y);
          overlayCtx.lineTo(alturaX - arrowSize/2, y + arrowSize);
          overlayCtx.lineTo(alturaX + arrowSize/2, y + arrowSize);
          overlayCtx.closePath();
          overlayCtx.fill();
          
          overlayCtx.beginPath();
          overlayCtx.moveTo(alturaX, y + alturaPixels);
          overlayCtx.lineTo(alturaX - arrowSize/2, y + alturaPixels - arrowSize);
          overlayCtx.lineTo(alturaX + arrowSize/2, y + alturaPixels - arrowSize);
          overlayCtx.closePath();
          overlayCtx.fill();
          
          // Linha de medição - PROFUNDIDADE (laranja sólido)
          overlayCtx.strokeStyle = '#ffaa00';
          overlayCtx.lineWidth = lineWidth;
          overlayCtx.beginPath();
          const profX = x + larguraPixels + profundOffset;
          const profY = y - profundOffset;
          overlayCtx.moveTo(x + larguraPixels, y);
          overlayCtx.lineTo(profX, profY);
          overlayCtx.stroke();
          
          // Setas profundidade
          const profAngulo = Math.atan2(profY - y, profX - (x + larguraPixels));
          overlayCtx.save();
          overlayCtx.translate(profX, profY);
          overlayCtx.rotate(profAngulo);
          overlayCtx.fillStyle = '#ffaa00';
          overlayCtx.beginPath();
          overlayCtx.moveTo(0, 0);
          overlayCtx.lineTo(-arrowSize, -arrowSize/2);
          overlayCtx.lineTo(-arrowSize, arrowSize/2);
          overlayCtx.closePath();
          overlayCtx.fill();
          overlayCtx.restore();
          
          // Textos com medidas - fontes maiores com sombra forte
          overlayCtx.shadowColor = 'rgba(0, 0, 0, 0.9)';
          overlayCtx.shadowBlur = 12;
          overlayCtx.shadowOffsetX = 3;
          overlayCtx.shadowOffsetY = 3;
          
          overlayCtx.fillStyle = '#ff0000';
          overlayCtx.font = `bold ${fontSize}px Arial`;
          overlayCtx.fillText(`${larguraCm.toFixed(1)} cm`, x + larguraPixels/2 - fontSize * 1.8, larguraY + fontSize + 15);
          overlayCtx.fillText(`${alturaCm.toFixed(1)} cm`, alturaX + 15, y + alturaPixels/2 + fontSize/3);
          
          overlayCtx.fillStyle = '#ffaa00';
          overlayCtx.fillText(`${comprimentoCm.toFixed(1)} cm`, profX - fontSize * 2.5, profY - 20);
          
          // Nome do objeto com fundo semi-transparente
          overlayCtx.shadowBlur = 0;
          overlayCtx.fillStyle = 'rgba(0, 0, 0, 0.7)';
          overlayCtx.fillRect(x - 5, y - fontSize * 1.8, objeto.class.length * fontSize * 0.7, fontSize * 1.5);
          
          overlayCtx.fillStyle = '#00ff00';
          overlayCtx.font = `bold ${fontSize * 1.3}px Arial`;
          overlayCtx.shadowColor = 'rgba(0, 0, 0, 0.9)';
          overlayCtx.shadowBlur = 8;
          overlayCtx.fillText(objeto.class.toUpperCase(), x, y - fontSize * 0.5);
          overlayCtx.shadowBlur = 0;
          
          setMedidasTempoReal({
            largura: larguraCm,
            altura: alturaCm,
            comprimento: comprimentoCm,
            objeto: objeto.class,
            semCalibracao
          });
        } else if (overlay) {
          const overlayCtx = overlay.getContext('2d');
          overlayCtx.clearRect(0, 0, overlay.width, overlay.height);
          setMedidasTempoReal(null);
        }
      } catch (error) {
        console.error("Erro na detecção:", error);
      }
    }, 150);
  };

  const calibrarReferencia = async () => {
    if (!medidasTempoReal) {
      toast.error("Nenhum objeto detectado. Posicione o cartão de crédito na câmera.");
      return;
    }
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0);
    
    try {
      const predictions = await modelo.detect(canvas);
      if (predictions.length === 0) {
        toast.error("Nenhum objeto detectado no momento da calibração.");
        return;
      }
      
      const referencia = predictions[0];
      const larguraPixels = referencia.bbox[2];
      const pixelsPorCm = larguraPixels / CARTAO_LARGURA_CM;
      
      setReferenciaPixels(pixelsPorCm);
      localStorage.setItem('cubagem_referencia', pixelsPorCm.toString());
      setModoCalibracao(false);
      
      toast.success(`Calibrado! ${pixelsPorCm.toFixed(2)} pixels/cm`);
    } catch (error) {
      toast.error("Erro ao calibrar: " + error.message);
    }
  };

  const capturarObjeto = async () => {
    if (!referenciaPixels) {
      toast.error("Sistema não calibrado. Use um cartão de crédito para calibrar.");
      setModoCalibracao(true);
      return;
    }

    if (!medidasTempoReal) {
      toast.error("Nenhum objeto detectado. Posicione o objeto na câmera.");
      return;
    }

    setProcessandoCaptura(true);
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0);
    
    try {
      const predictions = await modelo.detect(canvas);
      
      if (predictions.length === 0) {
        toast.error("Nenhum objeto detectado no momento da captura.");
        setProcessandoCaptura(false);
        return;
      }

      const objeto = predictions[0];
      const [x, y, larguraPixels, alturaPixels] = objeto.bbox;
      
      const larguraCm = medidasTempoReal.largura;
      const alturaCm = medidasTempoReal.altura;
      const comprimentoCm = medidasTempoReal.comprimento;
      
      // Salvar medidas capturadas
      const medidas = {
        largura: larguraCm,
        altura: alturaCm,
        comprimento: comprimentoCm,
        objeto: objeto.class
      };
      setMedidasCapturadas(medidas);
      
      // Desenhar anotações 3D completas na foto
      const fontSize = Math.max(22, video.videoWidth / 35);
      const lineWidth = Math.max(5, video.videoWidth / 250);
      const profundOffset = larguraPixels * 0.4;
      
      // Face frontal (verde - sólida)
      ctx.strokeStyle = '#00ff00';
      ctx.lineWidth = lineWidth;
      ctx.strokeRect(x, y, larguraPixels, alturaPixels);
      
      // Linhas de profundidade (laranja)
      ctx.strokeStyle = '#ffaa00';
      ctx.lineWidth = lineWidth - 1;
      ctx.setLineDash([12, 6]);
      
      // Conectar cantos frontal -> traseira
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + profundOffset, y - profundOffset);
      ctx.stroke();
      
      ctx.beginPath();
      ctx.moveTo(x + larguraPixels, y);
      ctx.lineTo(x + larguraPixels + profundOffset, y - profundOffset);
      ctx.stroke();
      
      ctx.beginPath();
      ctx.moveTo(x, y + alturaPixels);
      ctx.lineTo(x + profundOffset, y + alturaPixels - profundOffset);
      ctx.stroke();
      
      ctx.beginPath();
      ctx.moveTo(x + larguraPixels, y + alturaPixels);
      ctx.lineTo(x + larguraPixels + profundOffset, y + alturaPixels - profundOffset);
      ctx.stroke();
      
      // Face traseira (laranja pontilhada)
      ctx.strokeStyle = '#ffcc66';
      ctx.strokeRect(x + profundOffset, y - profundOffset, larguraPixels, alturaPixels);
      ctx.setLineDash([]);
      
      // Linha de medição - LARGURA (vermelho sólido)
      ctx.strokeStyle = '#ff0000';
      ctx.lineWidth = lineWidth;
      const larguraY = y + alturaPixels + 50;
      ctx.beginPath();
      ctx.moveTo(x, larguraY);
      ctx.lineTo(x + larguraPixels, larguraY);
      ctx.stroke();
      
      // Setas largura (triângulos preenchidos)
      const arrowSize = fontSize / 1.5;
      ctx.fillStyle = '#ff0000';
      ctx.beginPath();
      ctx.moveTo(x, larguraY);
      ctx.lineTo(x + arrowSize, larguraY - arrowSize/2);
      ctx.lineTo(x + arrowSize, larguraY + arrowSize/2);
      ctx.closePath();
      ctx.fill();
      
      ctx.beginPath();
      ctx.moveTo(x + larguraPixels, larguraY);
      ctx.lineTo(x + larguraPixels - arrowSize, larguraY - arrowSize/2);
      ctx.lineTo(x + larguraPixels - arrowSize, larguraY + arrowSize/2);
      ctx.closePath();
      ctx.fill();
      
      // Linha de medição - ALTURA (vermelho sólido)
      const alturaX = x + larguraPixels + 50;
      ctx.strokeStyle = '#ff0000';
      ctx.beginPath();
      ctx.moveTo(alturaX, y);
      ctx.lineTo(alturaX, y + alturaPixels);
      ctx.stroke();
      
      // Setas altura
      ctx.fillStyle = '#ff0000';
      ctx.beginPath();
      ctx.moveTo(alturaX, y);
      ctx.lineTo(alturaX - arrowSize/2, y + arrowSize);
      ctx.lineTo(alturaX + arrowSize/2, y + arrowSize);
      ctx.closePath();
      ctx.fill();
      
      ctx.beginPath();
      ctx.moveTo(alturaX, y + alturaPixels);
      ctx.lineTo(alturaX - arrowSize/2, y + alturaPixels - arrowSize);
      ctx.lineTo(alturaX + arrowSize/2, y + alturaPixels - arrowSize);
      ctx.closePath();
      ctx.fill();
      
      // Linha de medição - PROFUNDIDADE (laranja sólido)
      ctx.strokeStyle = '#ffaa00';
      ctx.lineWidth = lineWidth;
      ctx.beginPath();
      const profX = x + larguraPixels + profundOffset;
      const profY = y - profundOffset;
      ctx.moveTo(x + larguraPixels, y);
      ctx.lineTo(profX, profY);
      ctx.stroke();
      
      // Setas profundidade
      const profAngulo = Math.atan2(profY - y, profX - (x + larguraPixels));
      ctx.save();
      ctx.translate(profX, profY);
      ctx.rotate(profAngulo);
      ctx.fillStyle = '#ffaa00';
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(-arrowSize, -arrowSize/2);
      ctx.lineTo(-arrowSize, arrowSize/2);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
      
      // Textos com medidas - fontes maiores com sombra forte
      ctx.shadowColor = 'rgba(0, 0, 0, 0.9)';
      ctx.shadowBlur = 12;
      ctx.shadowOffsetX = 3;
      ctx.shadowOffsetY = 3;
      
      ctx.fillStyle = '#ff0000';
      ctx.font = `bold ${fontSize}px Arial`;
      ctx.fillText(`${larguraCm.toFixed(1)} cm`, x + larguraPixels/2 - fontSize * 1.8, larguraY + fontSize + 15);
      ctx.fillText(`${alturaCm.toFixed(1)} cm`, alturaX + 15, y + alturaPixels/2 + fontSize/3);
      
      ctx.fillStyle = '#ffaa00';
      ctx.fillText(`${comprimentoCm.toFixed(1)} cm`, profX - fontSize * 2.5, profY - 20);
      
      // Nome do objeto com fundo semi-transparente
      ctx.shadowBlur = 0;
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(x - 5, y - fontSize * 1.8, objeto.class.length * fontSize * 0.7, fontSize * 1.5);
      
      ctx.fillStyle = '#00ff00';
      ctx.font = `bold ${fontSize * 1.3}px Arial`;
      ctx.shadowColor = 'rgba(0, 0, 0, 0.9)';
      ctx.shadowBlur = 8;
      ctx.fillText(objeto.class.toUpperCase(), x, y - fontSize * 0.5);
      ctx.shadowBlur = 0;
      
      const foto = canvas.toDataURL('image/jpeg', 0.9);
      const cubagemCalculada = (alturaCm / 100) * (larguraCm / 100) * (comprimentoCm / 100);
      
      setFotoCapturada(foto);
      setCubagem(cubagemCalculada);
      setObjetoDetectado(objeto);
      
      pararCamera();
      setEtapa("processando");
      
      toast.success(`Medido: ${larguraCm.toFixed(1)}×${alturaCm.toFixed(1)}×${comprimentoCm.toFixed(1)} cm`);
    } catch (error) {
      toast.error("Erro ao capturar: " + error.message);
    } finally {
      setProcessandoCaptura(false);
    }
  };

  const salvarMedidaSemAssociar = () => {
    const novaMedida = {
      id: Date.now().toString(),
      foto: fotoCapturada,
      altura: medidasCapturadas.altura,
      largura: medidasCapturadas.largura,
      comprimento: medidasCapturadas.comprimento,
      cubagem: cubagem,
      objeto: objetoDetectado?.class || "objeto",
      timestamp: new Date().toISOString()
    };
    
    const novasMedidas = [...medidasPendentes, novaMedida];
    setMedidasPendentes(novasMedidas);
    localStorage.setItem('medidas_pendentes', JSON.stringify(novasMedidas));
    
    toast.success("Medida salva! Associe ao volume depois.");
    reiniciar();
  };

  const removerMedidaPendente = (id) => {
    const novasMedidas = medidasPendentes.filter(m => m.id !== id);
    setMedidasPendentes(novasMedidas);
    localStorage.setItem('medidas_pendentes', JSON.stringify(novasMedidas));
    toast.success("Medida removida");
  };

  const associarMedidaPendente = async (medida) => {
    setFotoCapturada(medida.foto);
    setCubagem(medida.cubagem);
    setObjetoDetectado({ class: medida.objeto });
    
    setMedidasCapturadas({
      altura: medida.altura,
      largura: medida.largura,
      comprimento: medida.comprimento,
      objeto: medida.objeto
    });
    
    setEtapa("associando");
    await iniciarScanQR();
  };

  const iniciarScanQR = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: "environment" } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setCameraAtiva(true);
        setScanningQR(true);

        qrScannerRef.current = new QrScanner(
          videoRef.current,
          result => {
            handleQRDetected(result.data);
          },
          {
            returnDetailedScanResult: true,
            highlightScanRegion: true,
            highlightCodeOutline: true,
          }
        );
        
        await qrScannerRef.current.start();
        toast.success("Aponte a câmera para o QR Code do volume");
      }
    } catch (error) {
      console.error("Erro ao iniciar scanner QR:", error);
      toast.error("Erro ao iniciar scanner QR");
    }
  };

  const handleQRDetected = async (qrData) => {
    pararCamera();
    
    try {
      const volumes = await base44.entities.Volume.list();
      const volumeEncontrado = volumes.find(v => v.id === qrData || v.codigo_volume === qrData);
      
      if (!volumeEncontrado) {
        toast.error("Volume não encontrado");
        setEtapa("associando");
        await iniciarScanQR();
        return;
      }

      setVolume(volumeEncontrado);
      setVolumeId(volumeEncontrado.id);
      await associarCubagem(volumeEncontrado.id);
    } catch (error) {
      console.error("Erro ao processar QR Code:", error);
      toast.error("Erro ao processar QR Code");
    }
  };

  const associarCubagem = async (volId, medidaId = null) => {
    try {
      const blob = await fetch(fotoCapturada).then(r => r.blob());
      const file = new File([blob], `cubagem_${Date.now()}.jpg`, { type: 'image/jpeg' });
      const { file_url } = await base44.integrations.Core.UploadFile({ file });

      await base44.entities.Volume.update(volId, {
        altura_cm: medidasCapturadas.altura,
        largura_cm: medidasCapturadas.largura,
        comprimento_cm: medidasCapturadas.comprimento,
        cubagem_m3: cubagem,
        foto_cubagem_url: file_url,
        data_cubagem: new Date().toISOString(),
        objeto_detectado: objetoDetectado?.class || "unknown"
      });

      if (medidaId) {
        removerMedidaPendente(medidaId);
      }

      toast.success("Cubagem associada ao volume com sucesso!");
      setEtapa("concluido");
      await loadHistorico();
    } catch (error) {
      console.error("Erro ao associar cubagem:", error);
      toast.error("Erro ao salvar cubagem");
    }
  };

  const reiniciar = () => {
    setEtapa("inicial");
    setFotoCapturada(null);
    setMedidasCapturadas(null);
    setCubagem(0);
    setVolume(null);
    setVolumeId(null);
    setObjetoDetectado(null);
    setModoCalibracao(false);
    pararCamera();
  };

  const theme = {
    bg: isDark ? '#0f172a' : '#f9fafb',
    text: isDark ? '#ffffff' : '#111827',
    textMuted: isDark ? '#9ca3af' : '#6b7280',
    cardBg: isDark ? '#1e293b' : '#ffffff',
    cardBorder: isDark ? '#334155' : '#e5e7eb',
    inputBg: isDark ? '#1e293b' : '#ffffff',
    inputBorder: isDark ? '#334155' : '#d1d5db',
  };

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: theme.bg }}>
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2" style={{ color: theme.text }}>
            Cubagem de Volumes
          </h1>
          <p className="text-sm" style={{ color: theme.textMuted }}>
            Capture foto, meça dimensões e associe a cubagem ao volume
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Área de Captura e Medição */}
          <div>
            <Card style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}>
              <CardContent className="p-6">
                {/* Indicador de Etapas */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-1">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${etapa !== 'inicial' ? 'bg-green-600' : 'bg-blue-600'}`}>
                      <CreditCard className="w-4 h-4 text-white" />
                    </div>
                    <div className="w-8 h-1 bg-gray-300" />
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${etapa === 'processando' || etapa === 'associando' || etapa === 'concluido' ? 'bg-green-600' : etapa === 'medindo' ? 'bg-blue-600' : 'bg-gray-300'}`}>
                      <Scan className="w-4 h-4 text-white" />
                    </div>
                    <div className="w-8 h-1 bg-gray-300" />
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${etapa === 'concluido' ? 'bg-green-600' : etapa === 'associando' ? 'bg-blue-600' : 'bg-gray-300'}`}>
                      <QrCode className="w-4 h-4 text-white" />
                    </div>
                  </div>
                  <Badge className={etapa === 'concluido' ? 'bg-green-600' : 'bg-blue-600'}>
                    {etapa === 'inicial' && 'Calibração'}
                    {etapa === 'medindo' && 'Medir Objeto'}
                    {etapa === 'processando' && 'Processando...'}
                    {etapa === 'associando' && 'Ler QR Code'}
                    {etapa === 'concluido' && 'Concluído'}
                  </Badge>
                </div>

                {/* Etapa Inicial */}
                {etapa === 'inicial' && !cameraAtiva && (
                  <div className="text-center py-8">
                    <Ruler className="w-16 h-16 mx-auto mb-4" style={{ color: theme.textMuted }} />
                    <h3 className="font-semibold mb-2" style={{ color: theme.text }}>
                      Cubagem de Volumes
                    </h3>
                    <p className="text-sm mb-6" style={{ color: theme.textMuted }}>
                      Meça volumes automaticamente usando IA
                    </p>
                    
                    {referenciaPixels && (
                      <div className="mb-4 p-3 rounded-lg bg-green-50 dark:bg-green-950 border border-green-500">
                        <p className="text-xs text-green-800 dark:text-green-200">
                          ✓ Sistema calibrado ({referenciaPixels.toFixed(2)} px/cm)
                        </p>
                      </div>
                    )}
                    
                    {!referenciaPixels && (
                      <div className="mb-4 p-3 rounded-lg bg-orange-50 dark:bg-orange-950 border border-orange-500">
                        <p className="text-xs text-orange-800 dark:text-orange-200">
                          ⚠️ Sistema não calibrado. Calibre usando um cartão de crédito para maior precisão.
                        </p>
                      </div>
                    )}
                    
                    {!modelo && (
                      <p className="text-sm text-orange-600 mb-4">
                        ⏳ Carregando modelo de IA...
                      </p>
                    )}
                    
                    <Button 
                      onClick={iniciarCamera} 
                      className="bg-blue-600 hover:bg-blue-700 w-full"
                      disabled={!modelo}
                    >
                      <Camera className="w-4 h-4 mr-2" />
                      Iniciar Medição
                    </Button>
                  </div>
                )}

                {/* Câmera Ativa */}
                {cameraAtiva && !scanningQR && (
                <div className="space-y-4">
                  <div className="relative rounded-lg overflow-hidden bg-black">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-auto"
                      style={{ maxHeight: '500px' }}
                    />
                    
                    {/* Canvas overlay para desenhar medições 3D */}
                    <canvas
                      ref={canvasOverlayRef}
                      className="absolute top-0 left-0 w-full h-auto pointer-events-none"
                      style={{ maxHeight: '500px' }}
                    />
                    
                    {/* Overlay com medidas em tempo real */}
                    {medidasTempoReal && (
                      <div className="absolute top-4 left-4 right-4">
                        <div className="bg-black/80 backdrop-blur-sm rounded-lg p-4 border-2 border-green-500">
                          <div className="grid grid-cols-3 gap-3 text-white text-center">
                            <div>
                              <p className="text-xs text-gray-300 mb-1">Altura</p>
                              <p className="text-xl font-bold text-red-400">
                                {medidasTempoReal.altura.toFixed(1)}
                              </p>
                              <p className="text-xs text-gray-400">cm</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-300 mb-1">Largura</p>
                              <p className="text-xl font-bold text-red-400">
                                {medidasTempoReal.largura.toFixed(1)}
                              </p>
                              <p className="text-xs text-gray-400">cm</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-300 mb-1">Profund.</p>
                              <p className="text-xl font-bold text-orange-400">
                                {medidasTempoReal.comprimento.toFixed(1)}
                              </p>
                              <p className="text-xs text-gray-400">cm</p>
                            </div>
                          </div>
                          <p className="text-xs text-center text-gray-300 mt-3 font-medium">
                            {medidasTempoReal.objeto}
                            {medidasTempoReal.semCalibracao && " • ⚠️ Estimativa"}
                          </p>
                        </div>
                      </div>
                    )}
                    
                    {processandoCaptura && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                        <div className="text-center">
                          <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                          <p className="text-white font-semibold text-lg">Capturando...</p>
                        </div>
                      </div>
                    )}
                  </div>
                  <canvas ref={canvasRef} className="hidden" />
                    
                  <div className="space-y-2">
                    {modoCalibracao ? (
                      <>
                        <p className="text-center text-xs font-medium text-orange-600 dark:text-orange-400">
                          🎯 Modo Calibração - Posicione um cartão de crédito
                        </p>
                        <div className="flex gap-2">
                          <Button 
                            onClick={calibrarReferencia} 
                            className="flex-1 bg-green-600 hover:bg-green-700"
                            disabled={!medidasTempoReal}
                          >
                            <CreditCard className="w-4 h-4 mr-2" />
                            Confirmar Calibração
                          </Button>
                          <Button onClick={() => setModoCalibracao(false)} variant="outline" size="sm">
                            Cancelar
                          </Button>
                          <Button onClick={pararCamera} variant="outline" size="icon">
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </>
                    ) : (
                      <>
                        <p className="text-center text-xs font-medium" style={{ color: theme.text }}>
                          {!referenciaPixels 
                            ? "⚠️ Sem calibração - Medidas aproximadas"
                            : "Posicione o objeto e capture quando pronto"
                          }
                        </p>
                        <div className="flex gap-2">
                          {!referenciaPixels && (
                            <Button 
                              onClick={() => setModoCalibracao(true)} 
                              variant="outline"
                              size="sm"
                              className="border-orange-500 text-orange-600"
                            >
                              <CreditCard className="w-4 h-4 mr-2" />
                              Calibrar
                            </Button>
                          )}
                          <Button 
                            onClick={capturarObjeto} 
                            className="flex-1 bg-blue-600 hover:bg-blue-700"
                            disabled={processandoCaptura || !medidasTempoReal}
                          >
                            <Camera className="w-4 h-4 mr-2" />
                            Capturar Medidas
                          </Button>
                          {referenciaPixels && (
                            <Button 
                              onClick={() => setModoCalibracao(true)} 
                              variant="outline"
                              size="icon"
                              title="Recalibrar"
                            >
                              <RotateCcw className="w-4 h-4" />
                            </Button>
                          )}
                          <Button onClick={pararCamera} variant="outline" size="icon">
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                    
                </div>
              )}
              
              {/* Scanner QR */}
              {scanningQR && (
                <div className="space-y-4">
                  <div className="relative rounded-lg overflow-hidden bg-black">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-auto"
                      style={{ maxHeight: '400px' }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="border-4 border-blue-500 w-64 h-64 rounded-lg animate-pulse" />
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium mb-2" style={{ color: theme.text }}>
                      Aponte para o QR Code do volume
                    </p>
                    <Button onClick={pararCamera} variant="outline" size="sm">
                      Cancelar
                    </Button>
                  </div>
                </div>
              )}

                {/* Etapa de Processamento */}
                {etapa === 'processando' && fotoCapturada && (
                  <div className="space-y-4">
                    <div className="rounded-lg overflow-hidden border-2 border-blue-500">
                      <img src={fotoCapturada} alt="Objeto Medido" className="w-full h-auto" />
                    </div>
                    
                    <div className="grid grid-cols-3 gap-3">
                      <div className="text-center p-3 rounded-lg bg-blue-50 dark:bg-blue-950">
                        <p className="text-xs mb-1" style={{ color: theme.textMuted }}>Altura</p>
                        <p className="text-lg font-bold text-blue-600">{medidasCapturadas?.altura.toFixed(1) || 0} cm</p>
                      </div>
                      <div className="text-center p-3 rounded-lg bg-blue-50 dark:bg-blue-950">
                        <p className="text-xs mb-1" style={{ color: theme.textMuted }}>Largura</p>
                        <p className="text-lg font-bold text-blue-600">{medidasCapturadas?.largura.toFixed(1) || 0} cm</p>
                      </div>
                      <div className="text-center p-3 rounded-lg bg-blue-50 dark:bg-blue-950">
                        <p className="text-xs mb-1" style={{ color: theme.textMuted }}>Profundidade</p>
                        <p className="text-lg font-bold text-blue-600">{medidasCapturadas?.comprimento.toFixed(1) || 0} cm</p>
                      </div>
                    </div>

                    <div className="p-4 rounded-lg border-2 border-green-500 bg-green-50 dark:bg-green-950">
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-semibold text-green-900 dark:text-green-100">
                          Cubagem Calculada:
                        </span>
                        <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                          {cubagem.toFixed(4)} m³
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button 
                        onClick={salvarMedidaSemAssociar}
                        variant="outline"
                        className="flex-1"
                      >
                        <Save className="w-4 h-4 mr-2" />
                        Salvar para Depois
                      </Button>
                      <Button 
                        onClick={() => {
                          setEtapa("associando");
                          iniciarScanQR();
                        }} 
                        className="flex-1 bg-blue-600 hover:bg-blue-700"
                      >
                        <QrCode className="w-4 h-4 mr-2" />
                        Associar Agora
                      </Button>
                    </div>
                  </div>
                )}

                {/* Etapa Concluída */}
                {etapa === 'concluido' && volume && (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
                    </div>
                    <h3 className="font-semibold mb-2" style={{ color: theme.text }}>
                      Cubagem Registrada!
                    </h3>
                    <p className="text-sm mb-1" style={{ color: theme.textMuted }}>
                      Volume: {volume.codigo_volume || volume.id.slice(-6)}
                    </p>
                    <p className="text-2xl font-bold text-blue-600 mb-6">
                      {cubagem.toFixed(4)} m³
                    </p>
                    <Button onClick={reiniciar} className="bg-blue-600 hover:bg-blue-700">
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Nova Cubagem
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Medidas Pendentes e Histórico */}
          <div className="space-y-6">
            {/* Medidas Pendentes */}
            {medidasPendentes.length > 0 && (
              <Card style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}>
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-4 flex items-center gap-2" style={{ color: theme.text }}>
                    <Save className="w-5 h-5" />
                    Medidas Pendentes ({medidasPendentes.length})
                  </h3>
                  
                  <div className="space-y-3 max-h-[300px] overflow-y-auto">
                    {medidasPendentes.map(medida => (
                      <div key={medida.id} className="p-3 rounded-lg border border-orange-300 bg-orange-50 dark:bg-orange-950">
                        <div className="flex items-start gap-3">
                          <img
                            src={medida.foto}
                            alt="Objeto"
                            className="w-20 h-20 object-cover rounded"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm mb-1" style={{ color: theme.text }}>
                              {medida.objeto}
                            </p>
                            <div className="grid grid-cols-2 gap-2 text-xs mb-2" style={{ color: theme.textMuted }}>
                              <p>A: {medida.altura.toFixed(1)}cm</p>
                              <p>L: {medida.largura.toFixed(1)}cm</p>
                              <p>C: {medida.comprimento.toFixed(1)}cm</p>
                              <p className="font-semibold text-orange-600">
                                {medida.cubagem.toFixed(4)} m³
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                onClick={() => associarMedidaPendente(medida)}
                                size="sm"
                                className="bg-blue-600 hover:bg-blue-700 text-xs h-7"
                              >
                                <QrCode className="w-3 h-3 mr-1" />
                                Associar
                              </Button>
                              <Button
                                onClick={() => removerMedidaPendente(medida.id)}
                                variant="outline"
                                size="sm"
                                className="text-xs h-7"
                              >
                                <X className="w-3 h-3 mr-1" />
                                Remover
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Histórico */}
            <Card style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2" style={{ color: theme.text }}>
                  <Package className="w-5 h-5" />
                  Histórico de Cubagens
                </h3>
                
                <div className="space-y-3 max-h-[300px] overflow-y-auto">
                  {historico.length === 0 ? (
                    <p className="text-center text-sm py-8" style={{ color: theme.textMuted }}>
                      Nenhuma cubagem registrada ainda
                    </p>
                  ) : (
                    historico.map(vol => (
                      <div key={vol.id} className="p-3 rounded-lg border" style={{ borderColor: theme.cardBorder }}>
                        <div className="flex items-start gap-3">
                          {vol.foto_cubagem_url && (
                            <img
                              src={vol.foto_cubagem_url}
                              alt="Cubagem"
                              className="w-20 h-20 object-cover rounded"
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm mb-1" style={{ color: theme.text }}>
                              {vol.codigo_volume || `Vol. ${vol.id.slice(-6)}`}
                            </p>
                            <div className="grid grid-cols-2 gap-2 text-xs" style={{ color: theme.textMuted }}>
                              <p>A: {vol.altura_cm}cm</p>
                              <p>L: {vol.largura_cm}cm</p>
                              <p>C: {vol.comprimento_cm}cm</p>
                              <p className="font-semibold text-blue-600">
                                {vol.cubagem_m3?.toFixed(4)} m³
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}