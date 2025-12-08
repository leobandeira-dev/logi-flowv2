import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  FileText,
  TrendingUp,
  Truck,
  Users,
  Clock,
  AlertTriangle,
  Package,
  MapPin,
  X
} from "lucide-react";
import { format, differenceInMinutes } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function DashboardTV() {
  const [ordens, setOrdens] = useState([]);
  const [motoristas, setMotoristas] = useState([]);
  const [veiculos, setVeiculos] = useState([]);
  const [etapas, setEtapas] = useState([]);
  const [ordensEtapas, setOrdensEtapas] = useState([]);
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

      const [ordensData, motoristasData, veiculosData, etapasData, ordensEtapasData] = await Promise.all([
        base44.entities.OrdemDeCarregamento.list("-data_solicitacao"),
        base44.entities.Motorista.list(),
        base44.entities.Veiculo.list(),
        base44.entities.Etapa.list("ordem"),
        base44.entities.OrdemEtapa.list()
      ]);

      // Filtrar pela empresa
      const ordensFiltradas = user.empresa_id && user.role !== "admin"
        ? ordensData.filter(o => o.empresa_id === user.empresa_id || !o.empresa_id)
        : ordensData;

      setOrdens(ordensFiltradas);
      setMotoristas(motoristasData);
      setVeiculos(veiculosData);
      setEtapas(etapasData.filter(e => e.ativo));
      setOrdensEtapas(ordensEtapasData);
      setLoading(false);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      setLoading(false);
    }
  };

  const calculateTimeRemaining = (ordemEtapa, etapa) => {
    if (!ordemEtapa || !ordemEtapa.data_inicio || ordemEtapa.status === "concluida" || ordemEtapa.status === "bloqueada" || ordemEtapa.status === "cancelada") return null;

    const prazoTotal = (etapa.prazo_dias || 0) * 24 * 60 + (etapa.prazo_horas || 0) * 60 + (etapa.prazo_minutos || 0);
    if (prazoTotal === 0) return null;

    const inicio = new Date(ordemEtapa.data_inicio);
    const agora = new Date();
    const minutosPassados = differenceInMinutes(agora, inicio);
    const minutosRestantes = prazoTotal - minutosPassados;

    return {
      minutosRestantes,
      percentual: Math.max(0, Math.min(100, (minutosPassados / prazoTotal) * 100)),
      atrasado: minutosRestantes < 0
    };
  };

  const isOrdemAtrasada = (ordem) => {
    // Verificar se alguma etapa da ordem está atrasada
    const etapasOrdem = ordensEtapas.filter(oe => oe.ordem_id === ordem.id);
    
    for (const ordemEtapa of etapasOrdem) {
      const etapa = etapas.find(e => e.id === ordemEtapa.etapa_id);
      if (!etapa) continue;
      
      const timeInfo = calculateTimeRemaining(ordemEtapa, etapa);
      if (timeInfo && timeInfo.atrasado && ordemEtapa.status === "em_andamento") {
        return true;
      }
    }
    
    return false;
  };

  const getMetrics = () => {
    const hoje = new Date();
    const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);

    const ordensHoje = ordens.filter(o => {
      const dataOrdem = new Date(o.data_solicitacao);
      return dataOrdem.toDateString() === hoje.toDateString();
    });

    const ordensEsteMes = ordens.filter(o => {
      const dataOrdem = new Date(o.data_solicitacao);
      return dataOrdem >= inicioMes;
    });

    const ordensEmTransito = ordens.filter(o => o.status === "em_transito");
    
    // Usar o novo cálculo baseado em etapas atrasadas
    const ordensAtrasadas = ordens.filter(o => {
      if (["entregue", "finalizado", "cancelado"].includes(o.status)) return false;
      return isOrdemAtrasada(o);
    });

    const ordensAguardandoCarregamento = ordens.filter(o => o.status === "aguardando_carregamento");
    const ordensNovas = ordens.filter(o => o.status === "novo" || o.status === "pendente_cadastro");

    return {
      totalOrdens: ordens.length,
      ordensHoje: ordensHoje.length,
      ordensEsteMes: ordensEsteMes.length,
      ordensEmTransito: ordensEmTransito.length,
      ordensAtrasadas: ordensAtrasadas.length,
      ordensAguardandoCarregamento: ordensAguardandoCarregamento.length,
      ordensNovas: ordensNovas.length,
      totalMotoristas: motoristas.length,
      motoristasAtivos: motoristas.filter(m => m.status === "ativo").length,
      totalVeiculos: veiculos.length,
      veiculosDisponiveis: veiculos.filter(v => v.status === "disponível").length,
      veiculosEmUso: veiculos.filter(v => v.status === "em_uso").length
    };
  };

  const getOrdensRecentes = () => {
    return [...ordens]
      .sort((a, b) => new Date(b.data_solicitacao) - new Date(a.data_solicitacao))
      .slice(0, 8);
  };

  const getOrdensDestaque = () => {
    // Usar o novo cálculo baseado em etapas atrasadas
    const atrasadas = ordens.filter(o => {
      if (["entregue", "finalizado", "cancelado"].includes(o.status)) return false;
      return isOrdemAtrasada(o);
    }).slice(0, 3);

    const emTransito = ordens.filter(o => o.status === "em_transito").slice(0, 3);

    return { atrasadas, emTransito };
  };

  const getMotorista = (motoristaId) => {
    return motoristas.find(m => m.id === motoristaId);
  };

  const getVeiculo = (veiculoId) => {
    return veiculos.find(v => v.id === veiculoId);
  };

  const getEtapaStatus = (ordemId, etapaId) => {
    const ordemEtapa = ordensEtapas.find(
      oe => oe.ordem_id === ordemId && oe.etapa_id === etapaId
    );
    return ordemEtapa?.status || "pendente";
  };

  const getStatusColor = (status) => {
    const colors = {
      pendente: "bg-gray-400",
      em_andamento: "bg-blue-500",
      concluida: "bg-green-500",
      bloqueada: "bg-red-500",
      cancelada: "bg-gray-500"
    };
    return colors[status] || "bg-gray-300";
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center z-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white text-xl">Carregando Dashboard...</p>
        </div>
      </div>
    );
  }

  const metrics = getMetrics();
  const ordensRecentes = getOrdensRecentes();
  const { atrasadas, emTransito } = getOrdensDestaque();

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 overflow-auto z-50">
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
                <h1 className="text-4xl font-bold text-white mb-1">
                  {empresa?.nome_fantasia || "Torre de Controle"}
                </h1>
                <p className="text-blue-200 text-lg">Monitoramento em Tempo Real</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Link to={createPageUrl("Fluxo")}>
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
                <div className="text-blue-200 text-lg">
                  {format(currentTime, "EEEE, dd 'de' MMMM", { locale: ptBR })}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Métricas Principais */}
        <div className="grid grid-cols-6 gap-4 mb-6">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 border-0 shadow-2xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <FileText className="w-12 h-12 text-white opacity-80" />
                <div className="text-6xl font-bold text-white">{metrics.totalOrdens}</div>
              </div>
              <div className="text-white text-lg font-semibold mb-1">Total de Ordens</div>
              <div className="text-blue-100 text-sm">{metrics.ordensHoje} hoje • {metrics.ordensEsteMes} este mês</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-green-600 border-0 shadow-2xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <TrendingUp className="w-12 h-12 text-white opacity-80" />
                <div className="text-6xl font-bold text-white">{metrics.ordensEmTransito}</div>
              </div>
              <div className="text-white text-lg font-semibold mb-1">Em Trânsito</div>
              <div className="text-green-100 text-sm">Cargas em movimento</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-red-500 to-red-600 border-0 shadow-2xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <AlertTriangle className="w-12 h-12 text-white opacity-80" />
                <div className="text-6xl font-bold text-white">{metrics.ordensAtrasadas}</div>
              </div>
              <div className="text-white text-lg font-semibold mb-1">Atrasadas</div>
              <div className="text-red-100 text-sm">Etapas com atraso</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500 to-orange-600 border-0 shadow-2xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <Clock className="w-12 h-12 text-white opacity-80" />
                <div className="text-6xl font-bold text-white">{metrics.ordensAguardandoCarregamento}</div>
              </div>
              <div className="text-white text-lg font-semibold mb-1">Aguardando</div>
              <div className="text-orange-100 text-sm">Carregamento pendente</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 border-0 shadow-2xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <Users className="w-12 h-12 text-white opacity-80" />
                <div className="text-6xl font-bold text-white">{metrics.motoristasAtivos}</div>
              </div>
              <div className="text-white text-lg font-semibold mb-1">Motoristas</div>
              <div className="text-purple-100 text-sm">de {metrics.totalMotoristas} ativos</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-indigo-500 to-indigo-600 border-0 shadow-2xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <Truck className="w-12 h-12 text-white opacity-80" />
                <div className="text-6xl font-bold text-white">{metrics.veiculosEmUso}</div>
              </div>
              <div className="text-white text-lg font-semibold mb-1">Veículos</div>
              <div className="text-indigo-100 text-sm">{metrics.veiculosDisponiveis} disponíveis</div>
            </CardContent>
          </Card>
        </div>

        {/* Conteúdo Principal */}
        <div className="grid grid-cols-3 gap-6">
          {/* Ordens Atrasadas */}
          {atrasadas.length > 0 && (
            <Card className="bg-white/10 backdrop-blur-md border-red-500/30 border-2 shadow-2xl">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-3 text-white">
                  <div className="p-2 bg-red-500 rounded-lg">
                    <AlertTriangle className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">Ordens Atrasadas</div>
                    <div className="text-red-200 text-sm font-normal">Etapas com atraso crítico</div>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {atrasadas.map((ordem) => {
                  const motorista = getMotorista(ordem.motorista_id);
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
                            <Users className="w-4 h-4" />
                            <span>{motorista.nome}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          )}

          {/* Ordens em Trânsito */}
          <Card className="bg-white/10 backdrop-blur-md border-green-500/30 border-2 shadow-2xl">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-3 text-white">
                <div className="p-2 bg-green-500 rounded-lg">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-2xl font-bold">Em Trânsito</div>
                  <div className="text-green-200 text-sm font-normal">Cargas em movimento</div>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {emTransito.length > 0 ? emTransito.map((ordem) => {
                const motorista = getMotorista(ordem.motorista_id);
                const veiculo = getVeiculo(ordem.veiculo_id);
                return (
                  <div
                    key={ordem.id}
                    className="p-4 bg-green-500/20 backdrop-blur-sm rounded-xl border border-green-400/30"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white font-bold text-lg">
                        {ordem.numero_carga || `#${ordem.id.slice(-6)}`}
                      </span>
                      <Badge className="bg-green-600 text-white">ATIVO</Badge>
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
                          <Users className="w-4 h-4" />
                          <span>{motorista.nome}</span>
                        </div>
                      )}
                      {veiculo && (
                        <div className="flex items-center gap-2">
                          <Truck className="w-4 h-4" />
                          <span>{veiculo.placa}</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              }) : (
                <div className="text-center py-8 text-green-200">
                  <Truck className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>Nenhuma ordem em trânsito</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Ordens Recentes */}
          <Card className="bg-white/10 backdrop-blur-md border-blue-500/30 border-2 shadow-2xl">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-3 text-white">
                <div className="p-2 bg-blue-500 rounded-lg">
                  <Clock className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-2xl font-bold">Ordens Recentes</div>
                  <div className="text-blue-200 text-sm font-normal">Últimas atualizações</div>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 max-h-[500px] overflow-y-auto">
              {ordensRecentes.map((ordem) => {
                const motorista = getMotorista(ordem.motorista_id);
                return (
                  <div
                    key={ordem.id}
                    className="p-3 bg-blue-500/20 backdrop-blur-sm rounded-lg border border-blue-400/30"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-white font-semibold">
                        {ordem.numero_carga || `#${ordem.id.slice(-6)}`}
                      </span>
                      <Badge className="bg-blue-600 text-white text-xs">
                        {ordem.status === "novo" && "Novo"}
                        {ordem.status === "em_transito" && "Em Trânsito"}
                        {ordem.status === "aguardando_carregamento" && "Aguardando"}
                        {ordem.status === "entregue" && "Entregue"}
                      </Badge>
                    </div>
                    <div className="text-blue-100 text-xs space-y-0.5">
                      <div className="truncate">{ordem.cliente}</div>
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        <span className="truncate">{ordem.origem} → {ordem.destino}</span>
                      </div>
                      {motorista && (
                        <div className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          <span className="truncate">{motorista.nome}</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
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