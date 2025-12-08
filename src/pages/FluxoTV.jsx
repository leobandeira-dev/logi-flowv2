import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  Workflow,
  Clock,
  CheckCircle2,
  XCircle,
  TrendingUp,
  Package,
  X,
  PlayCircle
} from "lucide-react";
import { format, differenceInMinutes } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function FluxoTV() {
  const [ordens, setOrdens] = useState([]);
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

      const [ordensData, etapasData, ordensEtapasData] = await Promise.all([
        base44.entities.OrdemDeCarregamento.list("-data_solicitacao"),
        base44.entities.Etapa.list("ordem"),
        base44.entities.OrdemEtapa.list()
      ]);

      // Filtrar pela empresa
      const ordensFiltradas = user.empresa_id && user.role !== "admin"
        ? ordensData.filter(o => o.empresa_id === user.empresa_id || !o.empresa_id)
        : ordensData;

      setOrdens(ordensFiltradas);
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

  const formatSLATime = (minutos) => {
    const dias = Math.floor(minutos / (24 * 60));
    const horas = Math.floor((minutos % (24 * 60)) / 60);
    const mins = Math.floor(minutos % 60);

    if (dias > 0) return `${dias}d ${horas}h`;
    if (horas > 0) return `${horas}h ${mins}m`;
    return `${mins}m`;
  };

  const getMetrics = () => {
    const etapasBloqueadas = ordensEtapas.filter(oe => oe.status === "bloqueada").length;
    const etapasEmAndamento = ordensEtapas.filter(oe => oe.status === "em_andamento");
    const etapasConcluidas = ordensEtapas.filter(oe => oe.status === "concluida").length;

    // Calcular etapas atrasadas
    let etapasAtrasadas = 0;
    let totalMinutosAtraso = 0;
    
    etapasEmAndamento.forEach(oe => {
      const etapa = etapas.find(e => e.id === oe.etapa_id);
      if (etapa) {
        const timeInfo = calculateTimeRemaining(oe, etapa);
        if (timeInfo && timeInfo.atrasado) {
          etapasAtrasadas++;
          totalMinutosAtraso += Math.abs(timeInfo.minutosRestantes);
        }
      }
    });

    const atrasoMedio = etapasAtrasadas > 0 ? Math.round(totalMinutosAtraso / etapasAtrasadas) : 0;

    // Calcular SLA médio geral
    const etapasConcluidasComPrazo = ordensEtapas.filter(oe => {
      const etapa = etapas.find(e => e.id === oe.etapa_id);
      return oe.status === "concluida" && etapa && oe.data_inicio && oe.data_conclusao;
    });

    let totalMinutosConclusao = 0;
    let dentroDoSLA = 0;

    etapasConcluidasComPrazo.forEach(oe => {
      const etapa = etapas.find(e => e.id === oe.etapa_id);
      if (etapa) {
        const prazoTotal = (etapa.prazo_dias || 0) * 24 * 60 + (etapa.prazo_horas || 0) * 60 + (etapa.prazo_minutos || 0);
        const inicio = new Date(oe.data_inicio);
        const fim = new Date(oe.data_conclusao);
        const minutosUsados = differenceInMinutes(fim, inicio);
        totalMinutosConclusao += minutosUsados;

        if (minutosUsados <= prazoTotal) {
          dentroDoSLA++;
        }
      }
    });

    const tempoMedioConclusao = etapasConcluidasComPrazo.length > 0 
      ? Math.round(totalMinutosConclusao / etapasConcluidasComPrazo.length) 
      : 0;

    const percentualSLA = etapasConcluidasComPrazo.length > 0
      ? Math.round((dentroDoSLA / etapasConcluidasComPrazo.length) * 100)
      : 0;

    return {
      totalEtapas: etapas.length,
      etapasBloqueadas,
      etapasEmAndamento: etapasEmAndamento.length,
      etapasAtrasadas,
      etapasConcluidas,
      atrasoMedio,
      tempoMedioConclusao,
      percentualSLA
    };
  };

  const getEtapaStats = () => {
    return etapas.map(etapa => {
      const ordensEtapa = ordensEtapas.filter(oe => oe.etapa_id === etapa.id);
      const emAndamento = ordensEtapa.filter(oe => oe.status === "em_andamento");
      const bloqueadas = ordensEtapa.filter(oe => oe.status === "bloqueada");
      const concluidas = ordensEtapa.filter(oe => oe.status === "concluida");

      let atrasadas = 0;
      emAndamento.forEach(oe => {
        const timeInfo = calculateTimeRemaining(oe, etapa);
        if (timeInfo && timeInfo.atrasado) {
          atrasadas++;
        }
      });

      return {
        etapa,
        emAndamento: emAndamento.length,
        bloqueadas: bloqueadas.length,
        concluidas: concluidas.length,
        atrasadas
      };
    });
  };

  const getOrdensEmAndamentoPorEtapa = (etapaId) => {
    const ordensIds = ordensEtapas
      .filter(oe => oe.etapa_id === etapaId && oe.status === "em_andamento")
      .map(oe => oe.ordem_id);

    return ordens.filter(ordem => ordensIds.includes(ordem.id)).slice(0, 5);
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center z-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white text-xl">Carregando Fluxo...</p>
        </div>
      </div>
    );
  }

  const metrics = getMetrics();
  const etapaStats = getEtapaStats();

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 overflow-auto z-50">
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
                  <Workflow className="w-10 h-10" />
                  Fluxo de Processos
                </h1>
                <p className="text-purple-200 text-lg">Andamento das Etapas Operacionais</p>
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
                <div className="text-purple-200 text-lg">
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
                <Workflow className="w-12 h-12 text-white opacity-80" />
                <div className="text-6xl font-bold text-white">{metrics.totalEtapas}</div>
              </div>
              <div className="text-white text-lg font-semibold mb-1">Etapas Ativas</div>
              <div className="text-blue-100 text-sm">Configuradas no fluxo</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 border-0 shadow-2xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <PlayCircle className="w-12 h-12 text-white opacity-80" />
                <div className="text-6xl font-bold text-white">{metrics.etapasEmAndamento}</div>
              </div>
              <div className="text-white text-lg font-semibold mb-1">Em Andamento</div>
              <div className="text-purple-100 text-sm">Etapas ativas</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500 to-orange-600 border-0 shadow-2xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <Clock className="w-12 h-12 text-white opacity-80" />
                <div className="text-6xl font-bold text-white">{metrics.etapasAtrasadas}</div>
              </div>
              <div className="text-white text-lg font-semibold mb-1">Atrasadas</div>
              <div className="text-orange-100 text-sm">
                {metrics.atrasoMedio > 0 ? `Média: ${formatSLATime(metrics.atrasoMedio)}` : 'Fora do SLA'}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-red-500 to-red-600 border-0 shadow-2xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <XCircle className="w-12 h-12 text-white opacity-80" />
                <div className="text-6xl font-bold text-white">{metrics.etapasBloqueadas}</div>
              </div>
              <div className="text-white text-lg font-semibold mb-1">Bloqueadas</div>
              <div className="text-red-100 text-sm">Requer ação</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-green-600 border-0 shadow-2xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <TrendingUp className="w-12 h-12 text-white opacity-80" />
                <div className="text-6xl font-bold text-white">{metrics.percentualSLA}%</div>
              </div>
              <div className="text-white text-lg font-semibold mb-1">SLA</div>
              <div className="text-green-100 text-sm">
                {metrics.tempoMedioConclusao > 0 ? `Média: ${formatSLATime(metrics.tempoMedioConclusao)}` : 'Conformidade'}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Visão por Etapas */}
        <div className="grid grid-cols-2 gap-6">
          {/* Estatísticas por Etapa */}
          <Card className="bg-white/10 backdrop-blur-md border-purple-500/30 border-2 shadow-2xl">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-3 text-white">
                <div className="p-2 bg-purple-500 rounded-lg">
                  <Workflow className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-2xl font-bold">Status das Etapas</div>
                  <div className="text-purple-200 text-sm font-normal">Visão geral por etapa</div>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 max-h-[600px] overflow-y-auto">
              {etapaStats.map((stat) => (
                <div
                  key={stat.etapa.id}
                  className="p-4 bg-white/10 backdrop-blur-sm rounded-xl border"
                  style={{ borderColor: `${stat.etapa.cor}50` }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: stat.etapa.cor }}
                      />
                      <span className="text-white font-bold text-lg">{stat.etapa.nome}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-2">
                    <div className="text-center p-2 bg-blue-500/20 rounded-lg">
                      <PlayCircle className="w-4 h-4 text-blue-300 mx-auto mb-1" />
                      <div className="text-2xl font-bold text-blue-300">{stat.emAndamento}</div>
                      <div className="text-xs text-blue-200">Em Andamento</div>
                    </div>

                    <div className="text-center p-2 bg-orange-500/20 rounded-lg">
                      <Clock className="w-4 h-4 text-orange-300 mx-auto mb-1" />
                      <div className="text-2xl font-bold text-orange-300">{stat.atrasadas}</div>
                      <div className="text-xs text-orange-200">Atrasadas</div>
                    </div>

                    <div className="text-center p-2 bg-red-500/20 rounded-lg">
                      <XCircle className="w-4 h-4 text-red-300 mx-auto mb-1" />
                      <div className="text-2xl font-bold text-red-300">{stat.bloqueadas}</div>
                      <div className="text-xs text-red-200">Bloqueadas</div>
                    </div>

                    <div className="text-center p-2 bg-green-500/20 rounded-lg">
                      <CheckCircle2 className="w-4 h-4 text-green-300 mx-auto mb-1" />
                      <div className="text-2xl font-bold text-green-300">{stat.concluidas}</div>
                      <div className="text-xs text-green-200">Concluídas</div>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Ordens em Andamento */}
          <Card className="bg-white/10 backdrop-blur-md border-blue-500/30 border-2 shadow-2xl">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-3 text-white">
                <div className="p-2 bg-blue-500 rounded-lg">
                  <Package className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-2xl font-bold">Ordens em Processamento</div>
                  <div className="text-blue-200 text-sm font-normal">Por etapa do fluxo</div>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 max-h-[600px] overflow-y-auto">
              {etapas.slice(0, 3).map((etapa) => {
                const ordensNaEtapa = getOrdensEmAndamentoPorEtapa(etapa.id);

                return (
                  <div key={etapa.id} className="space-y-2">
                    <div className="flex items-center gap-2 pb-2 border-b" style={{ borderColor: `${etapa.cor}50` }}>
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: etapa.cor }}
                      />
                      <span className="text-white font-semibold text-sm">{etapa.nome}</span>
                      <Badge className="ml-auto bg-white/20 text-white">{ordensNaEtapa.length}</Badge>
                    </div>

                    {ordensNaEtapa.length > 0 ? ordensNaEtapa.map((ordem) => (
                      <div
                        key={ordem.id}
                        className="p-3 bg-blue-500/10 rounded-lg border border-blue-400/20"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-white font-medium text-sm">
                            {ordem.numero_carga || `#${ordem.id.slice(-6)}`}
                          </span>
                          <span className="text-blue-200 text-xs">{ordem.cliente}</span>
                        </div>
                      </div>
                    )) : (
                      <div className="text-center py-4 text-blue-200/50 text-xs">
                        Nenhuma ordem nesta etapa
                      </div>
                    )}
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>

        {/* Rodapé com atualização */}
        <div className="fixed bottom-4 right-4 bg-white/10 backdrop-blur-md rounded-lg px-4 py-2 border border-white/20">
          <div className="flex items-center gap-2 text-white text-sm">
            <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" />
            <span>Atualizado automaticamente a cada 30s</span>
          </div>
        </div>
      </div>
    </div>
  );
}