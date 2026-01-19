import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Truck,
  MapPin,
  Clock,
  CheckCircle2,
  AlertCircle,
  History,
  User,
  Navigation,
  Package,
  MessageSquareText,
  FileText
} from "lucide-react";
import ViagemCard from "../components/motorista-app/ViagemCard";
import StatusUpdateModal from "../components/motorista-app/StatusUpdateModal";
import ViagemDetalhes from "../components/motorista-app/ViagemDetalhes";
import ChatCentral from "../components/tracking/ChatCentral";
import AtualizarCadastroForm from "../components/motorista-app/AtualizarCadastroForm";
import ChatAgenteCadastro from "../components/motorista-app/ChatAgenteCadastro";
import { Toaster, toast } from 'sonner';

const statusTrackingConfig = {
  aguardando_agendamento: { label: "Aguardando", color: "bg-gray-500", icon: Clock },
  carregamento_agendado: { label: "Agendado", color: "bg-blue-500", icon: Clock },
  em_carregamento: { label: "Carregando", color: "bg-yellow-500", icon: Package },
  carregado: { label: "Carregado", color: "bg-green-500", icon: CheckCircle2 },
  em_viagem: { label: "Em Viagem", color: "bg-purple-500", icon: Truck },
  chegada_destino: { label: "No Destino", color: "bg-indigo-500", icon: MapPin },
  descarga_agendada: { label: "Descarga Agendada", color: "bg-blue-600", icon: Clock },
  em_descarga: { label: "Descarregando", color: "bg-orange-500", icon: Package },
  descarga_realizada: { label: "Descarregado", color: "bg-green-600", icon: CheckCircle2 },
  finalizado: { label: "Finalizado", color: "bg-gray-600", icon: CheckCircle2 }
};

export default function AppMotorista() {
  const [user, setUser] = useState(null);
  const [motorista, setMotorista] = useState(null);
  const [viagens, setViagens] = useState([]);
  const [veiculos, setVeiculos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedViagem, setSelectedViagem] = useState(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showDetalhes, setShowDetalhes] = useState(false);
  const [activeTab, setActiveTab] = useState("ativas");
  const [isAdminView, setIsAdminView] = useState(false);

  const [showChat, setShowChat] = useState(false);
  const [chatViagem, setChatViagem] = useState(null);
  const [trackingInterval, setTrackingInterval] = useState(null);
  const [offlineQueue, setOfflineQueue] = useState([]);

  const [gpsAtivo, setGpsAtivo] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isDark, setIsDark] = useState(false);
  
  const [showCadastroForm, setShowCadastroForm] = useState(false);
  const [showCadastroChat, setShowCadastroChat] = useState(false);

  const latestState = useRef({ viagens: [], motorista: null, user: null, isAdminView: false });

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
    latestState.current.viagens = viagens;
    latestState.current.motorista = motorista;
    latestState.current.user = user;
    latestState.current.isAdminView = isAdminView;
  }, [viagens, motorista, user, isAdminView]);

  useEffect(() => {
    loadData();
    requestNotificationPermission();
    
    const offlineSyncCleanup = initOfflineSync();
    const gpsIntervalId = startGPSTracking();
    
    return () => {
      offlineSyncCleanup();
      if (gpsIntervalId) {
        clearInterval(gpsIntervalId);
      }
      setGpsAtivo(false);
    };
  }, []);

  const requestNotificationPermission = async () => {
    if ("Notification" in window && Notification.permission === "default") {
      await Notification.requestPermission();
    }
  };

  const showNotification = (title, body) => {
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification(title, {
        body,
        icon: "/logo.png",
        badge: "/logo.png"
      });
    }
  };

  const initOfflineSync = () => {
    const savedQueue = localStorage.getItem("offlineQueue");
    if (savedQueue) {
      setOfflineQueue(JSON.parse(savedQueue));
    }

    const handleOnline = () => {
      setIsOnline(true);
      syncOfflineData();
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  };

  const syncOfflineData = async () => {
    const queue = JSON.parse(localStorage.getItem("offlineQueue") || "[]");
    
    if (queue.length === 0) return;
    
    console.log("Sincronizando dados offline...", queue);
    
    const successfulSyncs = [];
    for (const item of queue) {
      try {
        if (item.type === "gps") {
          await base44.entities.PontoRastreamento.create(item.data);
          successfulSyncs.push(item);
        } else if (item.type === "status") {
          await base44.entities.OrdemDeCarregamento.update(item.id, item.data);
          successfulSyncs.push(item);
        }
      } catch (error) {
        console.error("Erro ao sincronizar item:", item, error);
      }
    }
    
    const remainingQueue = queue.filter(item => !successfulSyncs.includes(item));
    localStorage.setItem("offlineQueue", JSON.stringify(remainingQueue));
    setOfflineQueue(remainingQueue);

    if (successfulSyncs.length > 0) {
      toast.success(`${successfulSyncs.length} itens sincronizados com sucesso!`);
      loadData();
    }
  };

  const addToOfflineQueue = (item) => {
    const queue = [...offlineQueue, item];
    setOfflineQueue(queue);
    localStorage.setItem("offlineQueue", JSON.stringify(queue));
    toast.info("Item adicionado à fila offline. Será sincronizado quando a conexão for restaurada.");
  };

  const startGPSTracking = () => {
    setGpsAtivo(true);
    sendGPSPosition();
    
    const intervalId = setInterval(() => {
      sendGPSPosition();
    }, 60 * 60 * 1000);
    
    setTrackingInterval(intervalId);
    return intervalId;
  };

  const sendGPSPosition = async () => {
    const currentViagens = latestState.current.viagens;
    const currentMotorista = latestState.current.motorista;
    const currentUser = latestState.current.user;
    const currentIsAdminView = latestState.current.isAdminView;

    if (!currentMotorista && !currentIsAdminView) {
      console.log("Não há motorista associado ou em modo admin, GPS tracking ignorado.");
      return;
    }
    
    if (!currentMotorista && currentIsAdminView) {
      console.log("Em modo admin sem motorista selecionado para rastreamento. Ignorando GPS.");
      return;
    }

    const viagensAtivasForGPS = currentViagens.filter(v => 
      v.status_tracking !== "finalizado" && 
      v.status_tracking !== "cancelado" &&
      v.motorista_id === currentMotorista?.id
    );
    
    if (viagensAtivasForGPS.length === 0) {
      console.log("Nenhuma viagem ativa para rastrear.");
      return;
    }
    
    if (!navigator.geolocation) {
      console.warn("Navegador não suporta geolocalização.");
      return;
    }
    
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude, speed, accuracy } = position.coords;
          
          let endereco = "";
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`
            );
            const data = await response.json();
            if (data && data.display_name) {
              endereco = data.display_name;
            }
          } catch (error) {
            console.warn("Erro ao buscar endereço:", error);
          }
          
          let bateria = null;
          if ("getBattery" in navigator) {
            try {
              const battery = await navigator.getBattery();
              bateria = Math.round(battery.level * 100);
            } catch (error) {
              console.warn("Erro ao obter nível da bateria:", error);
            }
          }
          
          for (const viagem of viagensAtivasForGPS) {
            const pontoData = {
              ordem_id: viagem.id,
              motorista_id: currentMotorista.id,
              latitude,
              longitude,
              endereco,
              velocidade: speed ? Math.round(speed * 3.6) : null,
              precisao: accuracy,
              bateria,
              online: navigator.onLine
            };
            
            try {
              if (navigator.onLine) {
                await base44.entities.PontoRastreamento.create(pontoData);
                
                await base44.entities.OrdemDeCarregamento.update(viagem.id, {
                  localizacao_atual: endereco || `GPS: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`
                });
                console.log(`Ponto GPS enviado para viagem ${viagem.id}`);
              } else {
                addToOfflineQueue({
                  type: "gps",
                  data: pontoData
                });
                console.log(`Ponto GPS adicionado à fila offline para viagem ${viagem.id}`);
              }
            } catch (error) {
              console.error(`Erro ao enviar ou salvar posição GPS para viagem ${viagem.id}:`, error);
              addToOfflineQueue({
                type: "gps",
                data: pontoData
              });
            }
          }
        } catch (error) {
          console.error("Erro ao processar posição GPS:", error);
        }
      },
      (error) => {
        console.warn("Erro ao obter localização:", error.message);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);

      const isAdmin = currentUser.role === "admin";
      setIsAdminView(isAdmin);

      const [motoristasData, veiculosData] = await Promise.all([
        base44.entities.Motorista.list(),
        base44.entities.Veiculo.list()
      ]);
      
      setVeiculos(veiculosData || []);
      
      let motoristaEncontrado;
      
      if (isAdmin) {
        motoristaEncontrado = motoristasData?.[0];
      } else {
        motoristaEncontrado = motoristasData?.find(m => 
          m.email === currentUser.email || m.cpf === currentUser.cpf
        );
      }

      if (!motoristaEncontrado && !isAdmin) {
        console.error("Motorista não encontrado para este usuário");
        setLoading(false);
        return;
      }

      setMotorista(motoristaEncontrado);

      const ordensData = await base44.entities.OrdemDeCarregamento.list("-data_solicitacao");
      
      let viagensMotorista;
      if (isAdmin) {
        viagensMotorista = ordensData;
      } else {
        viagensMotorista = ordensData.filter(o => o.motorista_id === motoristaEncontrado.id);
      }
      
      setViagens(viagensMotorista);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      toast.error("Erro ao carregar dados: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const viagensAtivas = viagens.filter(v => 
    v.status_tracking !== "finalizado" && 
    v.status_tracking !== "cancelado"
  );

  const viagensHistorico = viagens.filter(v => 
    v.status_tracking === "finalizado" || 
    v.status_tracking === "cancelado"
  ).slice(0, 30);

  const handleAbrirStatus = (viagem) => {
    setSelectedViagem(viagem);
    setShowStatusModal(true);
  };

  const handleVerDetalhes = (viagem) => {
    setSelectedViagem(viagem);
    setShowDetalhes(true);
  };

  const handleAbrirChat = (viagem) => {
    setChatViagem(viagem);
    setShowChat(true);
  };

  const getPrimeiroNome = (nomeCompleto) => {
    if (!nomeCompleto) return "";
    return nomeCompleto.split(' ')[0];
  };

  const getPlacasVinculadas = () => {
    if (!motorista) return [];
    const veiculoIds = [
      motorista.cavalo_id,
      motorista.implemento1_id,
      motorista.implemento2_id,
      motorista.implemento3_id
    ].filter(Boolean);

    return veiculos.filter(v => veiculoIds.includes(v.id)).map(v => v.placa);
  };

  const theme = {
    bg: isDark ? '#0f172a' : '#f9fafb',
    cardBg: isDark ? '#1e293b' : '#ffffff',
    cardBorder: isDark ? '#334155' : '#e5e7eb',
    text: isDark ? '#f1f5f9' : '#111827',
    textMuted: isDark ? '#94a3b8' : '#6b7280',
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: theme.bg }}>
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p style={{ color: theme.textMuted }}>Carregando...</p>
        </div>
        <Toaster />
      </div>
    );
  }

  if (!motorista && !isAdminView) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: theme.bg }}>
        <Card style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}>
          <CardContent className="p-8 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2" style={{ color: theme.text }}>Acesso Negado</h2>
            <p style={{ color: theme.textMuted }}>
              Você não está cadastrado como motorista no sistema.
            </p>
          </CardContent>
        </Card>
        <Toaster />
      </div>
    );
  }

  return (
    <div className="min-h-screen transition-colors pb-20" style={{ backgroundColor: theme.bg }}>
      <Toaster richColors />
      
      <div className="p-4">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <h1 className="text-2xl font-bold" style={{ color: theme.text }}>Minhas Viagens</h1>
              <div className="flex items-center gap-2">
                <Badge className={gpsAtivo ? "bg-green-500 text-white" : "bg-gray-500 text-white"}>
                  <Navigation className="w-3 h-3 mr-1" />
                  GPS {gpsAtivo ? "Ativo" : "Inativo"}
                </Badge>
                {!isOnline && (
                  <Badge className="bg-orange-500 text-white">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    Offline
                  </Badge>
                )}
              </div>
            </div>
            <div className="flex flex-col gap-0.5">
              <p className="text-sm" style={{ color: theme.textMuted }}>
                Olá, {getPrimeiroNome(motorista?.nome)}
              </p>
              {getPlacasVinculadas().length > 0 && (
                <p className="text-xs font-mono" style={{ color: theme.textMuted }}>
                  🚛 {getPlacasVinculadas().join(' • ')}
                </p>
              )}
            </div>
          </div>

          <Card 
            className="mb-4 border"
            style={{ 
              backgroundColor: theme.cardBg, 
              borderColor: theme.cardBorder
            }}
          >
            <CardContent className="p-2.5">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <div className="h-7 w-7 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <User className="h-3.5 w-3.5 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-xs leading-none mb-0.5" style={{ color: theme.text }}>
                      Atualizar Cadastro
                    </h3>
                    <p className="text-[9px] leading-none truncate" style={{ color: theme.textMuted }}>
                      CNH • Veículos • Endereço • Dados Bancários
                    </p>
                  </div>
                </div>
                <div className="flex gap-1.5 flex-shrink-0">
                  <Button
                    onClick={() => setShowCadastroForm(true)}
                    variant="outline"
                    size="sm"
                    className="h-7 px-2.5 text-[10px] border-blue-200 text-blue-600 hover:bg-blue-50"
                  >
                    <FileText className="h-3 w-3 mr-1" />
                    Formulário
                  </Button>
                  <Button
                    onClick={() => setShowCadastroChat(true)}
                    size="sm"
                    className="h-7 px-2.5 text-[10px] bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <MessageSquareText className="h-3 w-3 mr-1" />
                    Chat
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full h-auto p-1 grid grid-cols-2" style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}>
              <TabsTrigger 
                value="ativas" 
                className="flex-1 text-sm py-2 rounded-md transition-colors data-[state=active]:bg-blue-600 data-[state=active]:text-white" 
                style={{ color: theme.text }}
              >
                Ativas ({viagensAtivas.length})
              </TabsTrigger>
              <TabsTrigger 
                value="historico" 
                className="flex-1 text-sm py-2 rounded-md transition-colors data-[state=active]:bg-blue-600 data-[state=active]:text-white" 
                style={{ color: theme.text }}
              >
                Histórico ({viagensHistorico.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="ativas" className="space-y-4 mt-4">
              {viagensAtivas.length === 0 ? (
                <Card style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}>
                  <CardContent className="py-10 text-center">
                    <Truck className="w-12 h-12 mx-auto mb-3" style={{ color: theme.textMuted, opacity: 0.5 }} />
                    <p className="text-sm font-medium" style={{ color: theme.textMuted }}>Nenhuma viagem ativa no momento</p>
                    <p className="text-xs mt-1.5" style={{ color: theme.textMuted, opacity: 0.7 }}>
                      Aguarde novas viagens serem atribuídas a você
                    </p>
                  </CardContent>
                </Card>
              ) : (
                viagensAtivas.map((viagem) => (
                  <ViagemCard
                    key={viagem.id}
                    viagem={viagem}
                    onAtualizarStatus={() => handleAbrirStatus(viagem)}
                    onVerDetalhes={() => handleVerDetalhes(viagem)}
                    onAbrirChat={() => handleAbrirChat(viagem)}
                    onUpdate={loadData}
                  />
                ))
              )}
            </TabsContent>

            <TabsContent value="historico" className="space-y-4 mt-4">
              {viagensHistorico.length === 0 ? (
                <Card style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}>
                  <CardContent className="py-10 text-center">
                    <History className="w-12 h-12 mx-auto mb-3" style={{ color: theme.textMuted, opacity: 0.5 }} />
                    <p className="text-sm font-medium" style={{ color: theme.textMuted }}>Nenhuma viagem no histórico</p>
                    <p className="text-xs mt-1.5" style={{ color: theme.textMuted, opacity: 0.7 }}>
                      Suas viagens finalizadas aparecerão aqui
                    </p>
                  </CardContent>
                </Card>
              ) : (
                viagensHistorico.map((viagem) => (
                  <ViagemCard
                    key={viagem.id}
                    viagem={viagem}
                    onVerDetalhes={() => handleVerDetalhes(viagem)}
                    onAbrirChat={() => handleAbrirChat(viagem)}
                    onUpdate={loadData}
                    isHistorico
                  />
                ))
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {showStatusModal && selectedViagem && (
        <StatusUpdateModal
          open={showStatusModal}
          onClose={() => {
            setShowStatusModal(false);
            setSelectedViagem(null);
          }}
          viagem={selectedViagem}
          onUpdate={loadData}
        />
      )}

      {showDetalhes && selectedViagem && (
        <ViagemDetalhes
          open={showDetalhes}
          onClose={() => {
            setShowDetalhes(false);
            setSelectedViagem(null);
          }}
          viagem={selectedViagem}
          onAtualizarStatus={() => {
            setShowDetalhes(false);
            setShowStatusModal(true);
          }}
        />
      )}

      {showChat && chatViagem && (
        <ChatCentral
          open={showChat}
          onClose={() => {
            setShowChat(false);
            setChatViagem(null);
          }}
          viagem={chatViagem}
        />
      )}

      {showCadastroForm && (
        <AtualizarCadastroForm
          open={showCadastroForm}
          onClose={() => setShowCadastroForm(false)}
          motorista={motorista}
          onSuccess={() => {
            loadData();
            setShowCadastroForm(false);
          }}
        />
      )}

      {showCadastroChat && (
        <ChatAgenteCadastro
          open={showCadastroChat}
          onClose={() => setShowCadastroChat(false)}
          motorista={motorista}
        />
      )}
    </div>
  );
}