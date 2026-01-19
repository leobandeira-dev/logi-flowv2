import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Camera, QrCode, Save, X, Ruler, Package, CheckCircle, RotateCcw } from "lucide-react";
import { toast } from "react-hot-toast";
import QrScanner from "qr-scanner";

export default function Cubagem() {
  const [isDark, setIsDark] = useState(false);
  const [etapa, setEtapa] = useState("inicial"); // inicial, medindo, associando, concluido
  const [cameraAtiva, setCameraAtiva] = useState(false);
  const [fotoCapturada, setFotoCapturada] = useState(null);
  const [medidas, setMedidas] = useState({ altura: "", largura: "", comprimento: "" });
  const [volumeId, setVolumeId] = useState(null);
  const [volume, setVolume] = useState(null);
  const [cubagem, setCubagem] = useState(0);
  const [historico, setHistorico] = useState([]);
  const [scanningQR, setScanningQR] = useState(false);
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const qrScannerRef = useRef(null);

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
  }, []);

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
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: "environment", width: { ideal: 1920 }, height: { ideal: 1080 } } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setCameraAtiva(true);
      }
    } catch (error) {
      console.error("Erro ao acessar câmera:", error);
      toast.error("Não foi possível acessar a câmera");
    }
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

  const capturarFoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0);
      const foto = canvas.toDataURL('image/jpeg', 0.9);
      setFotoCapturada(foto);
      pararCamera();
      setEtapa("medindo");
      toast.success("Foto capturada! Agora informe as medidas.");
    }
  };

  const calcularCubagem = () => {
    const { altura, largura, comprimento } = medidas;
    if (altura && largura && comprimento) {
      const cubagemMetros = (parseFloat(altura) / 100) * (parseFloat(largura) / 100) * (parseFloat(comprimento) / 100);
      setCubagem(cubagemMetros);
      return cubagemMetros;
    }
    return 0;
  };

  const salvarMedidas = async () => {
    const { altura, largura, comprimento } = medidas;
    
    if (!altura || !largura || !comprimento) {
      toast.error("Preencha todas as medidas");
      return;
    }

    const cubagemCalculada = calcularCubagem();
    
    if (cubagemCalculada <= 0) {
      toast.error("Medidas inválidas");
      return;
    }

    toast.success(`Cubagem calculada: ${cubagemCalculada.toFixed(4)} m³`);
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
        altura_cm: parseFloat(medidas.altura),
        largura_cm: parseFloat(medidas.largura),
        comprimento_cm: parseFloat(medidas.comprimento),
        cubagem_m3: cubagem,
        foto_cubagem_url: file_url,
        data_cubagem: new Date().toISOString()
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
    setMedidas({ altura: "", largura: "", comprimento: "" });
    setCubagem(0);
    setVolume(null);
    setVolumeId(null);
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
                  <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${etapa !== 'inicial' ? 'bg-green-600' : 'bg-blue-600'}`}>
                      <Camera className="w-4 h-4 text-white" />
                    </div>
                    <div className="w-12 h-1 bg-gray-300" />
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${etapa === 'associando' || etapa === 'concluido' ? 'bg-green-600' : etapa === 'medindo' ? 'bg-blue-600' : 'bg-gray-300'}`}>
                      <Ruler className="w-4 h-4 text-white" />
                    </div>
                    <div className="w-12 h-1 bg-gray-300" />
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${etapa === 'concluido' ? 'bg-green-600' : etapa === 'associando' ? 'bg-blue-600' : 'bg-gray-300'}`}>
                      <QrCode className="w-4 h-4 text-white" />
                    </div>
                  </div>
                  <Badge className={etapa === 'concluido' ? 'bg-green-600' : 'bg-blue-600'}>
                    {etapa === 'inicial' && 'Capturar Foto'}
                    {etapa === 'medindo' && 'Medir Objeto'}
                    {etapa === 'associando' && 'Ler QR Code'}
                    {etapa === 'concluido' && 'Concluído'}
                  </Badge>
                </div>

                {/* Etapa Inicial - Captura de Foto */}
                {etapa === 'inicial' && !cameraAtiva && (
                  <div className="text-center py-8">
                    <Camera className="w-16 h-16 mx-auto mb-4" style={{ color: theme.textMuted }} />
                    <h3 className="font-semibold mb-2" style={{ color: theme.text }}>
                      Capture a foto do objeto
                    </h3>
                    <p className="text-sm mb-6" style={{ color: theme.textMuted }}>
                      Posicione o objeto e tire uma foto para medição
                    </p>
                    <Button onClick={iniciarCamera} className="bg-blue-600 hover:bg-blue-700">
                      <Camera className="w-4 h-4 mr-2" />
                      Abrir Câmera
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
                        className="w-full h-auto"
                        style={{ maxHeight: '400px' }}
                      />
                      {scanningQR && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="border-4 border-blue-500 w-64 h-64 rounded-lg animate-pulse" />
                        </div>
                      )}
                    </div>
                    <canvas ref={canvasRef} className="hidden" />
                    
                    {!scanningQR && (
                      <div className="flex gap-2">
                        <Button onClick={capturarFoto} className="flex-1 bg-blue-600 hover:bg-blue-700">
                          <Camera className="w-4 h-4 mr-2" />
                          Capturar Foto
                        </Button>
                        <Button onClick={pararCamera} variant="outline">
                          <X className="w-4 h-4" />
                        </Button>
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

                {/* Etapa de Medição */}
                {etapa === 'medindo' && fotoCapturada && (
                  <div className="space-y-4">
                    <div className="rounded-lg overflow-hidden border" style={{ borderColor: theme.cardBorder }}>
                      <img src={fotoCapturada} alt="Objeto" className="w-full h-auto" />
                    </div>
                    
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <Label className="text-xs mb-1" style={{ color: theme.textMuted }}>
                          Altura (cm)
                        </Label>
                        <Input
                          type="number"
                          step="0.1"
                          value={medidas.altura}
                          onChange={(e) => setMedidas({...medidas, altura: e.target.value})}
                          placeholder="0.0"
                          style={{ backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.text }}
                        />
                      </div>
                      <div>
                        <Label className="text-xs mb-1" style={{ color: theme.textMuted }}>
                          Largura (cm)
                        </Label>
                        <Input
                          type="number"
                          step="0.1"
                          value={medidas.largura}
                          onChange={(e) => setMedidas({...medidas, largura: e.target.value})}
                          placeholder="0.0"
                          style={{ backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.text }}
                        />
                      </div>
                      <div>
                        <Label className="text-xs mb-1" style={{ color: theme.textMuted }}>
                          Comprimento (cm)
                        </Label>
                        <Input
                          type="number"
                          step="0.1"
                          value={medidas.comprimento}
                          onChange={(e) => setMedidas({...medidas, comprimento: e.target.value})}
                          placeholder="0.0"
                          style={{ backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.text }}
                        />
                      </div>
                    </div>

                    {medidas.altura && medidas.largura && medidas.comprimento && (
                      <div className="p-4 rounded-lg border-2 border-blue-500 bg-blue-50 dark:bg-blue-950">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-blue-900 dark:text-blue-100">
                            Cubagem:
                          </span>
                          <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                            {calcularCubagem().toFixed(4)} m³
                          </span>
                        </div>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <Button onClick={salvarMedidas} className="flex-1 bg-green-600 hover:bg-green-700">
                        <Save className="w-4 h-4 mr-2" />
                        Confirmar e Continuar
                      </Button>
                      <Button onClick={reiniciar} variant="outline">
                        <X className="w-4 h-4" />
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