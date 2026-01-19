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
  const [etapa, setEtapa] = useState("inicial"); // inicial, calibracao, medindo, processando, associando, concluido
  const [cameraAtiva, setCameraAtiva] = useState(false);
  const [fotoCapturada, setFotoCapturada] = useState(null);
  const [fotoReferencia, setFotoReferencia] = useState(null);
  const [medidas, setMedidas] = useState({ altura: 0, largura: 0, comprimento: 0 });
  const [volumeId, setVolumeId] = useState(null);
  const [volume, setVolume] = useState(null);
  const [cubagem, setCubagem] = useState(0);
  const [historico, setHistorico] = useState([]);
  const [scanningQR, setScanningQR] = useState(false);
  const [detectando, setDetectando] = useState(false);
  const [objetoDetectado, setObjetoDetectado] = useState(null);
  const [referenciaPixels, setReferenciaPixels] = useState(null);
  const [modelo, setModelo] = useState(null);
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const canvasOverlayRef = useRef(null);
  const streamRef = useRef(null);
  const qrScannerRef = useRef(null);

  // Tamanho real de um cartão de crédito (padrão internacional)
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
    // Ativar estado primeiro para mostrar o vídeo
    setCameraAtiva(true);
    setEtapa("calibracao");
    
    // Aguardar um momento para o DOM renderizar
    setTimeout(async () => {
      try {
        console.log("🎥 Solicitando acesso à câmera...");
        
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            facingMode: "environment",
            width: { ideal: 1920 }, 
            height: { ideal: 1080 } 
          } 
        });
        
        console.log("✅ Stream obtido:", stream);
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          streamRef.current = stream;
          
          // Aguardar carregamento e reproduzir
          videoRef.current.onloadedmetadata = async () => {
            try {
              await videoRef.current.play();
              console.log("✅ Vídeo reproduzindo");
              toast.success("Câmera ativada");
            } catch (err) {
              console.error("❌ Erro ao reproduzir:", err);
            }
          };
        }
      } catch (error) {
        console.error("❌ Erro ao acessar câmera:", error);
        toast.error("Erro ao acessar câmera: " + error.message);
        setCameraAtiva(false);
        setEtapa("inicial");
      }
    }, 100);
  };

  const pararCamera = () => {
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
  };

  const capturarReferencia = async () => {
    if (videoRef.current && canvasRef.current && modelo) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0);
      
      setDetectando(true);
      
      // Detectar objetos na imagem
      const predictions = await modelo.detect(canvas);
      
      if (predictions.length === 0) {
        toast.error("Nenhum objeto detectado. Posicione o cartão de crédito melhor.");
        setDetectando(false);
        return;
      }

      // Usar o primeiro objeto detectado como referência
      const referencia = predictions[0];
      const larguraPixels = referencia.bbox[2];
      const alturaPixels = referencia.bbox[3];
      
      // Desenhar retângulo na referência
      ctx.strokeStyle = '#00ff00';
      ctx.lineWidth = 3;
      ctx.strokeRect(referencia.bbox[0], referencia.bbox[1], larguraPixels, alturaPixels);
      
      // Adicionar texto
      ctx.fillStyle = '#00ff00';
      ctx.font = '16px Arial';
      ctx.fillText('Cartão de Referência', referencia.bbox[0], referencia.bbox[1] - 10);
      
      const foto = canvas.toDataURL('image/jpeg', 0.9);
      setFotoReferencia(foto);
      
      // Calcular pixels por cm (usando a largura do cartão)
      const pixelsPorCm = larguraPixels / CARTAO_LARGURA_CM;
      setReferenciaPixels(pixelsPorCm);
      
      setDetectando(false);
      pararCamera();
      setEtapa("medindo");
      toast.success(`Referência calibrada! ${pixelsPorCm.toFixed(2)} pixels/cm`);
    }
  };

  const capturarObjeto = async () => {
    if (!referenciaPixels) {
      toast.error("Calibre a referência primeiro!");
      return;
    }

    if (videoRef.current && canvasRef.current && modelo) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0);
      
      setDetectando(true);
      setEtapa("processando");
      
      // Detectar objetos na imagem
      const predictions = await modelo.detect(canvas);
      
      if (predictions.length === 0) {
        toast.error("Nenhum objeto detectado. Posicione melhor o objeto.");
        setDetectando(false);
        setEtapa("medindo");
        return;
      }

      // Usar o maior objeto detectado
      const objeto = predictions.reduce((prev, current) => {
        const prevArea = prev.bbox[2] * prev.bbox[3];
        const currentArea = current.bbox[2] * current.bbox[3];
        return currentArea > prevArea ? current : prev;
      });

      const [x, y, larguraPixels, alturaPixels] = objeto.bbox;
      
      // Calcular medidas em cm
      const larguraCm = larguraPixels / referenciaPixels;
      const alturaCm = alturaPixels / referenciaPixels;
      // Estimar profundidade (assumindo que é aproximadamente 70% da largura para objetos comuns)
      const comprimentoCm = larguraCm * 0.7;
      
      // Desenhar retângulo e linhas de medição
      ctx.strokeStyle = '#00ff00';
      ctx.lineWidth = 3;
      ctx.strokeRect(x, y, larguraPixels, alturaPixels);
      
      // Linha de largura
      ctx.strokeStyle = '#ff0000';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x, y + alturaPixels + 20);
      ctx.lineTo(x + larguraPixels, y + alturaPixels + 20);
      ctx.stroke();
      
      // Linha de altura
      ctx.beginPath();
      ctx.moveTo(x + larguraPixels + 20, y);
      ctx.lineTo(x + larguraPixels + 20, y + alturaPixels);
      ctx.stroke();
      
      // Textos com medidas
      ctx.fillStyle = '#ff0000';
      ctx.font = 'bold 18px Arial';
      ctx.fillText(`L: ${larguraCm.toFixed(1)}cm`, x + larguraPixels/2 - 40, y + alturaPixels + 45);
      ctx.fillText(`A: ${alturaCm.toFixed(1)}cm`, x + larguraPixels + 30, y + alturaPixels/2);
      
      // Nome do objeto detectado
      ctx.fillStyle = '#00ff00';
      ctx.font = 'bold 20px Arial';
      ctx.fillText(objeto.class.toUpperCase(), x, y - 10);
      
      const foto = canvas.toDataURL('image/jpeg', 0.9);
      setFotoCapturada(foto);
      
      setMedidas({
        altura: alturaCm,
        largura: larguraCm,
        comprimento: comprimentoCm
      });
      
      const cubagemCalculada = (alturaCm / 100) * (larguraCm / 100) * (comprimentoCm / 100);
      setCubagem(cubagemCalculada);
      
      setObjetoDetectado(objeto);
      setDetectando(false);
      pararCamera();
      
      toast.success(`Objeto detectado: ${objeto.class}`);
      setEtapa("associando");
      await iniciarScanQR();
    }
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

        // Iniciar scanner QR
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
      // QR Code deve conter o ID do volume
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

  const associarCubagem = async (volId) => {
    try {
      // Upload da foto
      const blob = await fetch(fotoCapturada).then(r => r.blob());
      const file = new File([blob], `cubagem_${Date.now()}.jpg`, { type: 'image/jpeg' });
      const { file_url } = await base44.integrations.Core.UploadFile({ file });

      // Atualizar volume com cubagem e foto
      await base44.entities.Volume.update(volId, {
        altura_cm: medidas.altura,
        largura_cm: medidas.largura,
        comprimento_cm: medidas.comprimento,
        cubagem_m3: cubagem,
        foto_cubagem_url: file_url,
        data_cubagem: new Date().toISOString(),
        objeto_detectado: objetoDetectado?.class || "unknown"
      });

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
    setFotoReferencia(null);
    setMedidas({ altura: 0, largura: 0, comprimento: 0 });
    setCubagem(0);
    setVolume(null);
    setVolumeId(null);
    setReferenciaPixels(null);
    setObjetoDetectado(null);
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

                {/* Etapa Inicial - Calibração */}
                {(etapa === 'inicial' || etapa === 'calibracao') && !cameraAtiva && (
                  <div className="text-center py-8">
                    <CreditCard className="w-16 h-16 mx-auto mb-4" style={{ color: theme.textMuted }} />
                    <h3 className="font-semibold mb-2" style={{ color: theme.text }}>
                      Calibrar Sistema
                    </h3>
                    <p className="text-sm mb-2" style={{ color: theme.textMuted }}>
                      Posicione um cartão de crédito na câmera para calibração
                    </p>
                    <p className="text-xs mb-6" style={{ color: theme.textMuted }}>
                      O cartão será usado como referência para medir outros objetos
                    </p>
                    {!modelo && (
                      <p className="text-sm text-orange-600 mb-4">
                        ⏳ Carregando modelo de IA...
                      </p>
                    )}
                    <Button 
                      onClick={iniciarCamera} 
                      className="bg-blue-600 hover:bg-blue-700"
                      disabled={!modelo}
                    >
                      <Camera className="w-4 h-4 mr-2" />
                      Iniciar Calibração
                    </Button>
                  </div>
                )}

                {/* Câmera Ativa */}
                {cameraAtiva && (
                 <div className="space-y-4">
                   <div className="relative rounded-lg overflow-hidden bg-black">
                     <video
                       ref={videoRef}
                       autoPlay
                       playsInline
                       muted
                       className="w-full h-auto"
                       style={{ maxHeight: '400px', transform: 'scaleX(-1)' }}
                     />
                      {scanningQR && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="border-4 border-blue-500 w-64 h-64 rounded-lg animate-pulse" />
                        </div>
                      )}
                    </div>
                    <canvas ref={canvasRef} className="hidden" />
                    
                    {!scanningQR && (etapa === 'inicial' || etapa === 'calibracao') && (
                      <div className="space-y-3">
                        <p className="text-center text-sm font-medium" style={{ color: theme.text }}>
                          Posicione o cartão de crédito no centro da imagem
                        </p>
                        <div className="flex gap-2">
                          <Button 
                            onClick={capturarReferencia} 
                            className="flex-1 bg-green-600 hover:bg-green-700"
                            disabled={detectando}
                          >
                            {detectando ? (
                              <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                                Detectando...
                              </>
                            ) : (
                              <>
                                <CreditCard className="w-4 h-4 mr-2" />
                                Calibrar Referência
                              </>
                            )}
                          </Button>
                          <Button onClick={pararCamera} variant="outline">
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                    
                    {!scanningQR && etapa === 'medindo' && (
                      <div className="space-y-3">
                        <p className="text-center text-sm font-medium" style={{ color: theme.text }}>
                          Posicione o objeto a ser medido no centro da imagem
                        </p>
                        <div className="flex gap-2">
                          <Button 
                            onClick={capturarObjeto} 
                            className="flex-1 bg-blue-600 hover:bg-blue-700"
                            disabled={detectando}
                          >
                            {detectando ? (
                              <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                                Medindo...
                              </>
                            ) : (
                              <>
                                <Ruler className="w-4 h-4 mr-2" />
                                Medir Objeto
                              </>
                            )}
                          </Button>
                          <Button onClick={pararCamera} variant="outline">
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                    
                    {scanningQR && (
                      <div className="text-center">
                        <p className="text-sm font-medium mb-2" style={{ color: theme.text }}>
                          Aponte para o QR Code do volume
                        </p>
                        <Button onClick={pararCamera} variant="outline" size="sm">
                          Cancelar
                        </Button>
                      </div>
                    )}
                  </div>
                )}

                {/* Etapa de Calibração Concluída */}
                {etapa === 'medindo' && fotoReferencia && !cameraAtiva && (
                  <div className="space-y-4">
                    <div className="rounded-lg overflow-hidden border-2 border-green-500" style={{ borderColor: theme.cardBorder }}>
                      <img src={fotoReferencia} alt="Referência" className="w-full h-auto" />
                    </div>
                    
                    <div className="p-4 rounded-lg bg-green-50 dark:bg-green-950 border-2 border-green-500">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <span className="font-semibold text-green-900 dark:text-green-100">
                          Calibração Concluída
                        </span>
                      </div>
                      <p className="text-sm text-green-800 dark:text-green-200">
                        {referenciaPixels?.toFixed(2)} pixels por centímetro
                      </p>
                    </div>

                    <Button onClick={iniciarCamera} className="w-full bg-blue-600 hover:bg-blue-700">
                      <Ruler className="w-4 h-4 mr-2" />
                      Medir Objeto
                    </Button>
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
                        <p className="text-lg font-bold text-blue-600">{medidas.altura.toFixed(1)} cm</p>
                      </div>
                      <div className="text-center p-3 rounded-lg bg-blue-50 dark:bg-blue-950">
                        <p className="text-xs mb-1" style={{ color: theme.textMuted }}>Largura</p>
                        <p className="text-lg font-bold text-blue-600">{medidas.largura.toFixed(1)} cm</p>
                      </div>
                      <div className="text-center p-3 rounded-lg bg-blue-50 dark:bg-blue-950">
                        <p className="text-xs mb-1" style={{ color: theme.textMuted }}>Profundidade</p>
                        <p className="text-lg font-bold text-blue-600">{medidas.comprimento.toFixed(1)} cm</p>
                      </div>
                    </div>

                    <div className="p-4 rounded-lg border-2 border-green-500 bg-green-50 dark:bg-green-950">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-green-900 dark:text-green-100">
                          Cubagem Calculada:
                        </span>
                        <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                          {cubagem.toFixed(4)} m³
                        </span>
                      </div>
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

          {/* Histórico */}
          <div>
            <Card style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2" style={{ color: theme.text }}>
                  <Package className="w-5 h-5" />
                  Histórico de Cubagens
                </h3>
                
                <div className="space-y-3 max-h-[600px] overflow-y-auto">
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