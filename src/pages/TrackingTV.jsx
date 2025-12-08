import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  MapPin,
  Truck,
  Clock,
  AlertTriangle,
  Package,
  CheckCircle2,
  Calendar,
  X,
  Navigation
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const statusTrackingConfig = {
  aguardando_agendamento: { label: "Aguardando Agendamento", color: "bg-gray-500", textColor: "text-gray-100" },
  carregamento_agendado: { label: "Carregamento Agendado", color: "bg-blue-500", textColor: "text-blue-100" },
  em_carregamento: { label: "Em Carregamento", color: "bg-yellow-500", textColor: "text-yellow-100" },
  carregado: { label: "Carregado", color: "bg-green-500", textColor: "text-green-100" },
  em_viagem: { label: "Em Viagem", color: "bg-purple-500", textColor: "text-purple-100" },
  chegada_destino: { label: "Chegada no Destino", color: "bg-indigo-500", textColor: "text-indigo-100" },
  descarga_agendada: { label: "Descarga Agendada", color: "bg-blue-600", textColor: "text-blue-100" },
  em_descarga: { label: "Em Descarga", color: "bg-orange-500", textColor: "text-orange-100" },
  descarga_realizada: { label: "Descarga Realizada", color: "bg-green-600", textColor: "text-green-100" },
  finalizado: { label: "Finalizado", color: "bg-gray-600", textColor: "text-gray-100" }
};

export default function TrackingTV() {
  const [ordens, setOrdens] = useState([]);
  const [motoristas, setMotoristas] = useState([]);
  const [veiculos, setVeiculos] = useState([]);
  const [ocorrencias, setOcorrencias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [empresa, setEmpresa] = useState(null);

  useEffect(() => {
    loadData();
    
    // Auto-refresh a cada 30 segundos
    const refreshInterval = setInterval(loadData, 30000);
    
    // Atualizar relógio a cada segundo
    const clockInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => {
      clearInterval(refreshInterval);
      clearInterval(clockInterval);
    };
  }, []);

  const loadData = async () => {
    try {
      const user = await base44.auth.me();

      // Carregar empresa
      if (user.empresa_id) {
        const empresaData = await base44.entities.Empresa.get(user.empresa_id);
        setEmpresa(empresaData);
      }

      const [ordensData, motoristasData, veiculosData, ocorrenciasData] = await Promise.all([
        base44.entities.OrdemDeCarregamento.list("-data_solicitacao"),
        base44.entities.Motorista.list(),
        base44.entities.Veiculo.list(),
        base44.entities.Ocorrencia.list()
      ]);

      // Filtrar pela empresa
      const ordensFiltradas = user.empresa_id && user.role !== "admin"
        ? ordensData.filter(o => o.empresa_id === user.empresa_id || !o.empresa_id)
        : ordensData;

      setOrdens(ordensFiltradas);
      setMotoristas(motoristasData);
      setVeiculos(veiculosData);
      setOcorrencias(ocorrenciasData);
      setLoading(false);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      setLoading(false);
    }
  };

  const getMetrics = () => {
    const emViagem = ordens.filter(o => o.status_tracking === "em_viagem");
    const aguardandoCarregamento = ordens.filter(o =>
      o.status_tracking === "aguardando_agendamento" ||
      o.status_tracking === "carregamento_agendado"
    );

    // Calcular atrasadas baseado em data de programação
    const atrasadas = ordens.filter(o => {
      if (o.status_tracking === "finalizado") return false;

      if (o.data_programacao_descarga && !o.descarga_realizada_data) {
        const dataProgramada = new Date(o.data_programacao_descarga);
        const hoje = new Date();
        return hoje > dataProgramada;
      }

      return false;
    });

    const ordensComKM = emViagem.filter(o => o.km_faltam);
    const kmMedioRestante = ordensComKM.length > 0
      ? Math.round(ordensComKM.reduce((sum, o) => sum + o.km_faltam, 0) / ordensComKM.length)
      : 0;

    const ocorrenciasAbertas = ocorrencias.filter(o => o.status === "aberta");

    const finalizadas = ordens.filter(o => o.status_tracking === "finalizado");

    return {
      totalOrdens: ordens.length,
      emViagem: emViagem.length,
      aguardandoCarregamento: aguardandoCarregamento.length,
      atrasadas: atrasadas.length,
      kmMedioRestante,
      ocorrenciasAbertas: ocorrenciasAbertas.length,
      finalizadas: finalizadas.length,
      ordensEmViagem: emViagem,
      ordensAtrasadas: atrasadas.slice(0, 4),
      ocorrenciasAtivas: ocorrenciasAbertas.slice(0, 4)
    };
  };

  const getMotorista = (motoristaId) => {
    return motoristas.find(m => m.id === motoristaId);
  };

  const getVeiculo = (veiculoId) => {
    return veiculos.find(v => v.id === veiculoId);
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-green-900 to-slate-900 flex items-center justify-center z-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white text-xl">Carregando Tracking...</p>
        </div>
      </div>
    );
  }

  const metrics = getMetrics();

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-green-900 to-slate-900 overflow-auto z-50">
      <div className="p-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {empresa?.logo_url && (
                <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center p-2 shadow-2xl">
                  <img src={empresa.logo_url} alt="Logo" className="w-full h-full object-contain" />
                </div>
              )}
              <div>
                <h1 className="text-4xl font-bold text-white mb-1 flex items-center gap-3">
                  <MapPin className="w-10 h-10" />
                  Tracking Logístico
                </h1>
                <p className="text-green-200 text-lg">Monitoramento em Tempo Real de Cargas</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Link to={createPageUrl("Tracking")}>
                <Button
                  variant="outline"
                  className="bg-white/10 backdrop-blur-md border-white/20 text-white hover:bg-white/20 flex items-center gap-2"
                >
                  <X className="w-5 h-5" />
                  Sair do Modo TV
                </Button>
              </Link>
              <div className="text-right">
                <div className="text-5xl font-bold text-white mb-1">
                  {format(currentTime, "HH:mm:ss")}
                </div>
                <div className="text-green-200 text-lg">
                  {format(currentTime, "EEEE, dd 'de' MMMM", { locale: ptBR })}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Métricas Principais */}
        <div className="grid grid-cols-5 gap-4 mb-6">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 border-0 shadow-2xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <Package className="w-12 h-12 text-white opacity-80" />
                <div className="text-6xl font-bold text-white">{metrics.totalOrdens}</div>
              </div>
              <div className="text-white text-lg font-semibold mb-1">Total de Cargas</div>
              <div className="text-blue-100 text-sm">Operações ativas</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-green-600 border-0 shadow-2xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <Truck className="w-12 h-12 text-white opacity-80" />
                <div className="text-6xl font-bold text-white">{metrics.emViagem}</div>
              </div>
              <div className="text-white text-lg font-semibold mb-1">Em Viagem</div>
              <div className="text-green-100 text-sm">Cargas em trânsito</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-500 to-yellow-600 border-0 shadow-2xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <Clock className="w-12 h-12 text-white opacity-80" />
                <div className="text-6xl font-bold text-white">{metrics.aguardandoCarregamento}</div>
              </div>
              <div className="text-white text-lg font-semibold mb-1">Aguardando</div>
              <div className="text-yellow-100 text-sm">Carregamento pendente</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-red-500 to-red-600 border-0 shadow-2xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <AlertTriangle className="w-12 h-12 text-white opacity-80" />
                <div className="text-6xl font-bold text-white">{metrics.atrasadas}</div>
              </div>
              <div className="text-white text-lg font-semibold mb-1">Atrasadas</div>
              <div className="text-red-100 text-sm">Requer atenção</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 border-0 shadow-2xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <Navigation className="w-12 h-12 text-white opacity-80" />
                <div className="text-6xl font-bold text-white">{metrics.kmMedioRestante}</div>
              </div>
              <div className="text-white text-lg font-semibold mb-1">KM Médio</div>
              <div className="text-purple-100 text-sm">Até destino</div>
            </CardContent>
          </Card>
        </div>

        {/* Conteúdo Principal */}
        <div className="grid grid-cols-3 gap-6">
          {/* Cargas em Viagem */}
          <Card className="bg-white/10 backdrop-blur-md border-green-500/30 border-2 shadow-2xl">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-3 text-white">
                <div className="p-2 bg-green-500 rounded-lg">
                  <Truck className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-2xl font-bold">Cargas em Viagem</div>
                  <div className="text-green-200 text-sm font-normal">Em trânsito agora</div>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 max-h-[600px] overflow-y-auto">
              {metrics.ordensEmViagem.length > 0 ? metrics.ordensEmViagem.slice(0, 8).map((ordem) => {
                const motorista = getMotorista(ordem.motorista_id);
                const veiculo = getVeiculo(ordem.cavalo_id);
                const statusConfig = statusTrackingConfig[ordem.status_tracking];

                return (
                  <div
                    key={ordem.id}
                    className="p-4 bg-green-500/20 backdrop-blur-sm rounded-xl border border-green-400/30"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white font-bold text-lg">
                        {ordem.numero_carga || `#${ordem.id.slice(-6)}`}
                      </span>
                      <Badge className={`${statusConfig.color} ${statusConfig.textColor}`}>
                        {statusConfig.label}
                      </Badge>
                    </div>
                    <div className="text-green-100 text-sm space-y-1">
                      <div className="flex items-center gap-2">
                        <Package className="w-4 h-4" />
                        <span className="font-medium">{ordem.cliente}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        <span>{ordem.origem} → {ordem.destino}</span>
                      </div>
                      {motorista && (
                        <div className="flex items-center gap-2">
                          <Truck className="w-4 h-4" />
                          <span>{motorista.nome}</span>
                        </div>
                      )}
                      {veiculo && (
                        <div className="flex items-center gap-2">
                          <span className="font-mono">{veiculo.placa}</span>
                        </div>
                      )}
                      {ordem.km_faltam && (
                        <div className="flex items-center gap-2 pt-1 border-t border-green-400/30">
                          <Navigation className="w-4 h-4" />
                          <span className="font-bold text-green-300">{ordem.km_faltam} km restantes</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              }) : (
                <div className="text-center py-8 text-green-200">
                  <Truck className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>Nenhuma carga em viagem</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Cargas Atrasadas */}
          <Card className="bg-white/10 backdrop-blur-md border-red-500/30 border-2 shadow-2xl">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-3 text-white">
                <div className="p-2 bg-red-500 rounded-lg">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-2xl font-bold">Cargas Atrasadas</div>
                  <div className="text-red-200 text-sm font-normal">Atenção urgente</div>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {metrics.ordensAtrasadas.length > 0 ? metrics.ordensAtrasadas.map((ordem) => {
                const motorista = getMotorista(ordem.motorista_id);
                const statusConfig = statusTrackingConfig[ordem.status_tracking];

                return (
                  <div
                    key={ordem.id}
                    className="p-4 bg-red-500/20 backdrop-blur-sm rounded-xl border border-red-400/30 animate-pulse"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white font-bold text-lg">
                        {ordem.numero_carga || `#${ordem.id.slice(-6)}`}
                      </span>
                      <Badge className="bg-red-600 text-white">URGENTE</Badge>
                    </div>
                    <div className="text-red-100 text-sm space-y-1">
                      <div className="flex items-center gap-2">
                        <Package className="w-4 h-4" />
                        <span className="font-medium">{ordem.cliente}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        <span>{ordem.origem} → {ordem.destino}</span>
                      </div>
                      {motorista && (
                        <div className="flex items-center gap-2">
                          <Truck className="w-4 h-4" />
                          <span>{motorista.nome}</span>
                        </div>
                      )}
                      {ordem.data_programacao_descarga && (
                        <div className="flex items-center gap-2 pt-1 border-t border-red-400/30">
                          <Calendar className="w-4 h-4" />
                          <span className="font-bold text-red-300">
                            Prevista: {format(new Date(ordem.data_programacao_descarga), "dd/MM HH:mm")}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              }) : (
                <div className="text-center py-8 text-red-200">
                  <CheckCircle2 className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>Nenhuma carga atrasada</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Ocorrências */}
          <Card className="bg-white/10 backdrop-blur-md border-orange-500/30 border-2 shadow-2xl">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-3 text-white">
                <div className="p-2 bg-orange-500 rounded-lg">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-2xl font-bold">Ocorrências Abertas</div>
                  <div className="text-orange-200 text-sm font-normal">{metrics.ocorrenciasAbertas} ativas</div>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {metrics.ocorrenciasAtivas.length > 0 ? metrics.ocorrenciasAtivas.map((ocorrencia) => {
                const ordem = ordens.find(o => o.id === ocorrencia.ordem_id);

                return (
                  <div
                    key={ocorrencia.id}
                    className="p-4 bg-orange-500/20 backdrop-blur-sm rounded-xl border border-orange-400/30"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white font-bold text-lg">
                        {ordem?.numero_carga || `#${ordem?.id.slice(-6)}`}
                      </span>
                      <Badge className={`
                        ${ocorrencia.gravidade === "critica" ? "bg-red-600" : 
                          ocorrencia.gravidade === "alta" ? "bg-orange-600" : 
                          "bg-yellow-600"} text-white
                      `}>
                        {ocorrencia.gravidade}
                      </Badge>
                    </div>
                    <div className="text-orange-100 text-sm space-y-1">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4" />
                        <span className="font-medium">{ocorrencia.tipo?.replace("_", " ")}</span>
                      </div>
                      {ordem && (
                        <div className="flex items-center gap-2">
                          <Package className="w-4 h-4" />
                          <span>{ordem.cliente}</span>
                        </div>
                      )}
                      <div className="text-xs pt-1 border-t border-orange-400/30">
                        <p className="line-clamp-2">{ocorrencia.observacoes}</p>
                      </div>
                      {ocorrencia.localizacao && (
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          <span className="text-xs">{ocorrencia.localizacao}</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              }) : (
                <div className="text-center py-8 text-orange-200">
                  <CheckCircle2 className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>Nenhuma ocorrência aberta</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Rodapé com atualização */}
        <div className="fixed bottom-4 right-4 bg-white/10 backdrop-blur-md rounded-lg px-4 py-2 border border-white/20">
          <div className="flex items-center gap-2 text-white text-sm">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span>Atualizado automaticamente a cada 30s</span>
          </div>
        </div>
      </div>
    </div>
  );
}