
import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";


import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Target,
  TrendingUp,
  TrendingDown,
  Loader2,
  Package,
  Workflow,
  AlertTriangle,
  CheckCircle,
  Timer,
  Activity,
  BarChart3,
  Calendar,
  RefreshCw,
  Users,
  Shield,
  Zap,
  Clock,
  Search,
  Settings,
  Info,
  Eye
} from "lucide-react";
import { motion } from "framer-motion";
import { format, differenceInHours } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";
import DetalhesMetricaSLA from "../components/gamificacao/DetalhesMetricaSLA";

export default function Gamificacao() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [gamificacao, setGamificacao] = useState(null);
  const [metricaMensal, setMetricaMensal] = useState(null);
  const [configuracaoSLA, setConfiguracaoSLA] = useState(null);
  const [ranking, setRanking] = useState([]);
  const [historicoMensal, setHistoricoMensal] = useState([]);
  const [activeTab, setActiveTab] = useState("sla_mensal");
  const [categoriaFilter, setCategoriaFilter] = useState("todos");
  const [isDark, setIsDark] = useState(false);

  const [todasMetricas, setTodasMetricas] = useState([]);
  const [todosUsuarios, setTodosUsuarios] = useState([]);
  const [searchMetricas, setSearchMetricas] = useState("");
  const [mesFilter, setMesFilter] = useState("");
  const [anoFilter, setAnoFilter] = useState("");
  const [selectedMetricaDetalhes, setSelectedMetricaDetalhes] = useState(null);

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
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);

      const mesAtual = format(new Date(), "yyyy-MM");

      let gamificacaoData = await base44.entities.GamificacaoUsuario.filter({ user_id: currentUser.id });
      
      if (gamificacaoData.length === 0) {
        const categoria = currentUser.cargo?.toLowerCase().includes('gerente') || currentUser.role === 'admin' 
          ? 'gerencial' 
          : currentUser.cargo?.toLowerCase().includes('admin') 
            ? 'administrativo' 
            : 'operacional';

        const novaGamificacao = await base44.entities.GamificacaoUsuario.create({
          user_id: currentUser.id,
          pontos_totais: 0,
          tipo_piloto: "iniciante",
          mes_referencia: mesAtual,
          categoria_usuario: categoria,
          sla_mes_atual: 100
        });
        gamificacaoData = [novaGamificacao];
      }
      setGamificacao(gamificacaoData[0]);

      const configs = await base44.entities.ConfiguracaoSLA.filter({ 
        categoria_usuario: gamificacaoData[0].categoria_usuario,
        ativo: true 
      });
      setConfiguracaoSLA(configs[0] || null);

      const metricas = await base44.entities.MetricaMensal.filter({
        user_id: currentUser.id,
        mes_referencia: mesAtual
      });
      const metricaNaoExpurgada = metricas.find(m => !m.expurgada);
      setMetricaMensal(metricaNaoExpurgada || null);

      const historicoData = await base44.entities.MetricaMensal.filter({ 
        user_id: currentUser.id 
      }, "-mes_referencia", 50);
      const historicoNaoExpurgado = historicoData.filter(m => !m.expurgada).slice(0, 6);
      setHistoricoMensal(historicoNaoExpurgado);

      const rankingData = await base44.entities.GamificacaoUsuario.list("-sla_mes_atual", 20);
      setRanking(rankingData);

      if (currentUser.role === 'admin') {
        const [allMetricas, allUsers] = await Promise.all([
          base44.entities.MetricaMensal.list("-mes_referencia"),
          base44.entities.User.list()
        ]);
        setTodasMetricas(allMetricas);
        setTodosUsuarios(allUsers);
      }

      await calcularMetricasEmTempoReal(currentUser, mesAtual, gamificacaoData[0], configs[0]);

    } catch (error) {
      console.error("Erro ao carregar gamificação:", error);
      toast.error("Erro ao carregar dados");
    } finally {
      setLoading(false);
    }
  };

  const calcularMetricasEmTempoReal = async (currentUser, mesAtual, gamif, config) => {
    try {
      const [inicioMes, fimMes] = [
        new Date(`${mesAtual}-01`), 
        new Date(new Date(`${mesAtual}-01`).getFullYear(), new Date(`${mesAtual}-01`).getMonth() + 1, 0)
      ];

      const [ocorrencias, ordens, ordensEtapas, usuarios, tiposOcorrencia, etapas, registrosExpurgados] = await Promise.all([
        base44.entities.Ocorrencia.list(),
        base44.entities.OrdemDeCarregamento.list(),
        base44.entities.OrdemEtapa.list(),
        base44.entities.User.list(),
        base44.entities.TipoOcorrencia.list(),
        base44.entities.Etapa.list(),
        base44.entities.RegistroSLAExpurgado.list()
      ]);

      const metricasAtuais = await base44.entities.MetricaMensal.filter({
        user_id: currentUser.id,
        mes_referencia: mesAtual
      });

      const metricaAtualNaoExpurgada = metricasAtuais.find(m => !m.expurgada);
      const metricaAtualId = metricaAtualNaoExpurgada?.id;

      const expurgadosMetricaAtual = metricaAtualId 
        ? registrosExpurgados.filter(r => r.metrica_mensal_id === metricaAtualId)
        : [];

      // FILTRAR APENAS ocorrências que NÃO são do tipo "tarefa" para cálculo de SLA
      const ocorrenciasUsuario = ocorrencias.filter(o => {
        const dataOcorrencia = new Date(o.data_inicio);
        const expurgado = expurgadosMetricaAtual.some(r => r.registro_id === o.id);
        const isTarefa = o.categoria === "tarefa"; // Nova verificação
        return !expurgado && 
               !isTarefa && // Excluir tarefas do cálculo de SLA
               (o.responsavel_id === currentUser.id || o.registrado_por === currentUser.id) &&
               dataOcorrencia >= inicioMes && dataOcorrencia <= fimMes;
      });

      const ordensUsuario = ordens.filter(o => {
        const dataSolicitacao = o.data_solicitacao ? new Date(o.data_solicitacao) : null;
        const expurgado = expurgadosMetricaAtual.some(r => r.registro_id === o.id);
        return !expurgado && o.created_by === currentUser.email && dataSolicitacao && 
               dataSolicitacao >= inicioMes && dataSolicitacao <= fimMes;
      });

      const etapasUsuario = ordensEtapas.filter(oe => {
        const dataConclusao = oe.data_conclusao ? new Date(oe.data_conclusao) : null;
        const expurgado = expurgadosMetricaAtual.some(r => r.registro_id === oe.id);
        return !expurgado && oe.responsavel_id === currentUser.id && dataConclusao && 
               dataConclusao >= inicioMes && dataConclusao <= fimMes;
      });

      const ocorrenciasAbertas = ocorrenciasUsuario.filter(o => o.status === 'aberta').length;
      const ocorrenciasResolvidas = ocorrenciasUsuario.filter(o => o.status === 'resolvida').length;
      const ocorrenciasCriticas = ocorrenciasUsuario.filter(o => o.gravidade === 'critica').length;

      let totalTempoResolucao = 0;
      let ocorrenciasAtrasadas = 0;

      const ocorrenciasResolvidasList = ocorrenciasUsuario.filter(o => o.status === 'resolvida' && o.data_fim);
      
      for (const ocorrencia of ocorrenciasResolvidasList) {
        const horasResolucao = differenceInHours(new Date(ocorrencia.data_fim), new Date(ocorrencia.data_inicio));
        totalTempoResolucao += horasResolucao;

        const tipo = tiposOcorrencia.find(t => t.id === ocorrencia.tipo_ocorrencia_id);
        if (tipo) {
          // Usar prazo_sla_minutos, ou converter de horas se não existir
          const prazoMinutos = tipo.prazo_sla_minutos || (tipo.prazo_sla_horas ? tipo.prazo_sla_horas * 60 : null);
          if (prazoMinutos) {
            const prazoHoras = prazoMinutos / 60;
            if (horasResolucao > prazoHoras) {
              ocorrenciasAtrasadas++;
            }
          }
        }
      }

      const tempoMedioResolucao = ocorrenciasResolvidasList.length > 0 
        ? totalTempoResolucao / ocorrenciasResolvidasList.length 
        : 0;

      const ordensCriadas = ordensUsuario.length;
      const etapasConcluidas = etapasUsuario.length;

      let etapasNoPrazo = 0;
      let etapasAtrasadas = 0;

      for (const oe of etapasUsuario) {
        if (!oe.data_inicio || !oe.data_conclusao) continue;

        const etapa = etapas.find(e => e.id === oe.etapa_id);
        if (!etapa) continue;

        const prazoTotal = (etapa.prazo_dias || 0) * 24 + (etapa.prazo_horas || 0) + ((etapa.prazo_minutos || 0) / 60);
        if (prazoTotal === 0) continue;

        const horasUsadas = differenceInHours(new Date(oe.data_conclusao), new Date(oe.data_inicio));
        
        if (horasUsadas <= prazoTotal) {
          etapasNoPrazo++;
        } else {
          etapasAtrasadas++;
        }
      }

      const todosUsuarios = usuarios.filter(u => u.empresa_id === currentUser.empresa_id);
      let totalOrdensEmpresa = 0;
      let totalEtapasEmpresa = 0;

      for (const usuario of todosUsuarios) {
        const ordensUsuarioEmpresa = ordens.filter(o => {
          const dataSolicitacao = o.data_solicitacao ? new Date(o.data_solicitacao) : null;
          return o.created_by === usuario.email && dataSolicitacao && 
                 dataSolicitacao >= inicioMes && dataSolicitacao <= fimMes;
        }).length;

        const etapasUsuarioEmpresa = ordensEtapas.filter(oe => {
          const dataConclusao = oe.data_conclusao ? new Date(oe.data_conclusao) : null;
          return oe.responsavel_id === usuario.id && dataConclusao && 
                 dataConclusao >= inicioMes && dataConclusao <= fimMes;
        }).length;

        totalOrdensEmpresa += ordensUsuarioEmpresa;
        totalEtapasEmpresa += etapasUsuarioEmpresa;
      }

      const mediaOrdensEmpresa = todosUsuarios.length > 0 ? totalOrdensEmpresa / todosUsuarios.length : 0;
      const mediaEtapasEmpresa = todosUsuarios.length > 0 ? totalEtapasEmpresa / todosUsuarios.length : 0;

      const cfg = config || {};
      let pontosQualidade = 100;

      // Penalizar apenas ocorrências que NÃO são tarefas
      pontosQualidade += (ocorrenciasUsuario.filter(o => o.gravidade === 'baixa').length * (cfg.pontos_ocorrencia_baixa || -5));
      pontosQualidade += (ocorrenciasUsuario.filter(o => o.gravidade === 'media').length * (cfg.pontos_ocorrencia_media || -10));
      pontosQualidade += (ocorrenciasUsuario.filter(o => o.gravidade === 'alta').length * (cfg.pontos_ocorrencia_alta || -20));
      pontosQualidade += (ocorrenciasCriticas * (cfg.pontos_ocorrencia_critica || -40));
      pontosQualidade += (ocorrenciasAtrasadas * (cfg.pontos_ocorrencia_atrasada || -15));

      const resolucoesRapidas = ocorrenciasResolvidasList.filter(o => {
        const horasResolucao = differenceInHours(new Date(o.data_fim), new Date(o.data_inicio));
        return horasResolucao < (tempoMedioResolucao * 0.5) && tempoMedioResolucao > 0;
      }).length;

      pontosQualidade += (resolucoesRapidas * (cfg.pontos_resolucao_rapida || 10));
      pontosQualidade = Math.max(0, Math.min(100, pontosQualidade));

      let pontosProdutividade = 0;

      pontosProdutividade += (ordensCriadas * (cfg.pontos_ordem_criada || 10));
      pontosProdutividade += (etapasConcluidas * (cfg.pontos_etapa_concluida || 5));
      pontosProdutividade += (etapasNoPrazo * (cfg.pontos_etapa_no_prazo || 3));

      if (ordensCriadas > mediaOrdensEmpresa * 1.2) {
        pontosProdutividade += (cfg.pontos_acima_media || 20);
      }

      if (etapasConcluidas > mediaEtapasEmpresa * 1.2) {
        pontosProdutividade += (cfg.pontos_acima_media || 20);
      }

      pontosProdutividade = Math.max(0, Math.min(100, pontosProdutividade));

      const pesoQualidade = (cfg.peso_qualidade || 60) / 100;
      const pesoProdutividade = (cfg.peso_produtividade || 40) / 100;

      const slaFinal = (pontosQualidade * pesoQualidade) + (pontosProdutividade * pesoProdutividade);

      await base44.entities.GamificacaoUsuario.update(gamif.id, {
        sla_mes_atual: Math.round(slaFinal * 100) / 100,
        pontos_qualidade_mes: Math.round(pontosQualidade * 100) / 100,
        pontos_produtividade_mes: Math.round(pontosProdutividade * 100) / 100,
        ordens_criadas_mes: ordensCriadas,
        etapas_concluidas_mes: etapasConcluidas,
        ocorrencias_resolvidas_mes: ocorrenciasResolvidas,
        ocorrencias_abertas_mes: ocorrenciasAbertas,
        ocorrencias_atrasadas_mes: ocorrenciasAtrasadas,
        etapas_no_prazo_mes: etapasNoPrazo,
        etapas_atrasadas_mes: etapasAtrasadas,
        tempo_medio_resolucao_horas: Math.round(tempoMedioResolucao * 100) / 100,
        mes_referencia: mesAtual
      });

      const percentualNoPrazo = etapasConcluidas > 0 ? (etapasNoPrazo / etapasConcluidas) * 100 : 100;
      const comparativoMedia = ordensCriadas >= mediaOrdensEmpresa * 1.1 
        ? 'acima' 
        : ordensCriadas >= mediaOrdensEmpresa * 0.9 
          ? 'na_media' 
          : 'abaixo';

      const metricaData = {
        user_id: currentUser.id,
        mes_referencia: mesAtual,
        sla_final: Math.round(slaFinal * 100) / 100,
        pontos_qualidade: Math.round(pontosQualidade * 100) / 100,
        pontos_produtividade: Math.round(pontosProdutividade * 100) / 100,
        ocorrencias_total: ocorrenciasUsuario.length,
        ocorrencias_resolvidas: ocorrenciasResolvidas,
        ocorrencias_atrasadas: ocorrenciasAtrasadas,
        ocorrencias_criticas: ocorrenciasCriticas,
        tempo_medio_resolucao: Math.round(tempoMedioResolucao * 100) / 100,
        ordens_criadas: ordensCriadas,
        etapas_concluidas: etapasConcluidas,
        etapas_no_prazo: etapasNoPrazo,
        etapas_atrasadas: etapasAtrasadas,
        percentual_no_prazo: Math.round(percentualNoPrazo * 100) / 100,
        media_empresa_ordens: Math.round(mediaOrdensEmpresa * 100) / 100,
        media_empresa_etapas: Math.round(mediaEtapasEmpresa * 100) / 100,
        comparativo_media: comparativoMedia,
        categoria_usuario: gamif.categoria_usuario,
        expurgada: false
      };

      const metricasExistentes = await base44.entities.MetricaMensal.filter({
        user_id: currentUser.id,
        mes_referencia: mesAtual
      });

      const metricaNaoExpurgada = metricasExistentes.find(m => !m.expurgada);

      if (metricaNaoExpurgada) {
        await base44.entities.MetricaMensal.update(metricaNaoExpurgada.id, metricaData);
      } else {
        await base44.entities.MetricaMensal.create(metricaData);
      }

      const gamifAtualizado = await base44.entities.GamificacaoUsuario.filter({ user_id: currentUser.id });
      setGamificacao(gamifAtualizado[0]);

      const metricaAtualizada = await base44.entities.MetricaMensal.filter({ 
        user_id: currentUser.id, 
        mes_referencia: mesAtual 
      });
      const metricaAtualizadaNaoExpurgada = metricaAtualizada.find(m => !m.expurgada);
      setMetricaMensal(metricaAtualizadaNaoExpurgada);

    } catch (error) {
      console.error("Erro ao calcular métricas:", error);
    }
  };

  const getUserName = (userId) => {
    const usuario = todosUsuarios.find(u => u.id === userId);
    return usuario?.full_name || `Usuário #${userId?.slice(-6)}`;
  };

  const filteredMetricas = todasMetricas.filter(metrica => {
    if (searchMetricas) {
      const term = searchMetricas.toLowerCase();
      const userName = getUserName(metrica.user_id).toLowerCase();
      const match = userName.includes(term) ||
        metrica.mes_referencia?.includes(term) ||
        metrica.categoria_usuario?.toLowerCase().includes(term);
      if (!match) return false;
    }

    if (mesFilter) {
      const mes = metrica.mes_referencia?.split('-')[1];
      if (mes !== mesFilter) return false;
    }

    if (anoFilter) {
      const ano = metrica.mes_referencia?.split('-')[0];
      if (ano !== anoFilter) return false;
    }

    return true;
  });

  const anosDisponiveis = [...new Set(todasMetricas.map(m => m.mes_referencia?.split('-')[0]).filter(Boolean))].sort().reverse();
  const mesesDisponiveis = [
    { value: "01", label: "Janeiro" },
    { value: "02", label: "Fevereiro" },
    { value: "03", label: "Março" },
    { value: "04", label: "Abril" },
    { value: "05", label: "Maio" },
    { value: "06", label: "Junho" },
    { value: "07", label: "Julho" },
    { value: "08", label: "Agosto" },
    { value: "09", label: "Setembro" },
    { value: "10", label: "Outubro" },
    { value: "11", label: "Novembro" },
    { value: "12", label: "Dezembro" }
  ];

  const theme = {
    bg: isDark ? '#0f172a' : '#f9fafb',
    cardBg: isDark ? '#1e293b' : '#ffffff',
    cardBorder: isDark ? '#334155' : '#e5e7eb',
    text: isDark ? '#f1f5f9' : '#111827',
    textMuted: isDark ? '#94a3b8' : '#6b7280',
  };

  if (loading) {
    return (
      <div className="p-6 min-h-screen flex items-center justify-center" style={{ backgroundColor: theme.bg }}>
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <p className="text-sm" style={{ color: theme.textMuted }}>Calculando métricas de performance...</p>
        </div>
      </div>
    );
  }

  const slaAtual = gamificacao?.sla_mes_atual || 100;
  const metaMinima = configuracaoSLA?.sla_minimo || 95;
  const metaIdeal = configuracaoSLA?.sla_ideal || 100;

  const bgSLA = slaAtual >= metaIdeal 
    ? 'from-green-400 to-green-600' 
    : slaAtual >= metaMinima 
      ? 'from-yellow-400 to-yellow-600' 
      : 'from-red-400 to-red-600';

  const isAdmin = user?.role === 'admin';

  return (
    <div className="min-h-screen transition-colors" style={{ backgroundColor: theme.bg }}>
      <div className="p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3" style={{ color: theme.text }}>
                <Target className="w-8 h-8 text-blue-600" />
                Performance & Melhoria Contínua
              </h1>
              <p className="mt-1" style={{ color: theme.textMuted }}>
                Acompanhe seu SLA mensal e desenvolvimento profissional
              </p>
            </div>
            <Button onClick={loadData} variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Atualizar
            </Button>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`relative overflow-hidden rounded-2xl bg-gradient-to-r ${bgSLA} p-8 text-white shadow-2xl`}
          >
            <div className="absolute top-0 right-0 w-64 h-64 opacity-10">
              <Activity className="w-full h-full" />
            </div>
            
            <div className="relative z-10">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <Target className="w-12 h-12" />
                    <div>
                      <h2 className="text-3xl font-bold">SLA Mensal</h2>
                      <p className="text-white/80">{format(new Date(), "MMMM yyyy", { locale: ptBR })}</p>
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-6xl font-bold mb-1">{slaAtual.toFixed(1)}%</div>
                  <div className="flex items-center gap-2 justify-end">
                    {slaAtual >= metaIdeal ? (
                      <><CheckCircle className="w-5 h-5" /><span>Excelente!</span></>
                    ) : slaAtual >= metaMinima ? (
                      <><Clock className="w-5 h-5" /><span>No prazo</span></>
                    ) : (
                      <><AlertTriangle className="w-5 h-5" /><span>Atenção!</span></>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/10 rounded-lg p-3">
                  <p className="text-white/70 text-sm mb-1">Meta Mínima</p>
                  <p className="text-2xl font-bold">{metaMinima}%</p>
                </div>
                <div className="bg-white/10 rounded-lg p-3">
                  <p className="text-white/70 text-sm mb-1">Meta Ideal</p>
                  <p className="text-2xl font-bold">{metaIdeal}%</p>
                </div>
              </div>

              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Qualidade ({configuracaoSLA?.peso_qualidade || 60}%)</span>
                  <span className="font-semibold">{(gamificacao?.pontos_qualidade_mes || 0).toFixed(1)} pts</span>
                </div>
                <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-white rounded-full"
                    style={{ width: `${gamificacao?.pontos_qualidade_mes || 0}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span>Produtividade ({configuracaoSLA?.peso_produtividade || 40}%)</span>
                  <span className="font-semibold">{(gamificacao?.pontos_produtividade_mes || 0).toFixed(1)} pts</span>
                </div>
                <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-white rounded-full"
                    style={{ width: `${gamificacao?.pontos_produtividade_mes || 0}%` }}
                  />
                </div>
              </div>
            </div>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <Card style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <Package className="w-5 h-5 text-blue-600" />
                  <span className="text-2xl font-bold" style={{ color: theme.text }}>
                    {gamificacao?.ordens_criadas_mes || 0}
                  </span>
                </div>
                <p className="text-xs font-medium" style={{ color: theme.textMuted }}>Ordens Criadas</p>
                {metricaMensal?.media_empresa_ordens && (
                  <p className="text-[10px] mt-1" style={{ color: theme.textMuted }}>
                    Média: {metricaMensal.media_empresa_ordens.toFixed(1)}
                  </p>
                )}
              </CardContent>
            </Card>

            <Card style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <Workflow className="w-5 h-5 text-purple-600" />
                  <span className="text-2xl font-bold" style={{ color: theme.text }}>
                    {gamificacao?.etapas_concluidas_mes || 0}
                  </span>
                </div>
                <p className="text-xs font-medium" style={{ color: theme.textMuted }}>Etapas Concluídas</p>
                {metricaMensal?.media_empresa_etapas && (
                  <p className="text-[10px] mt-1" style={{ color: theme.textMuted }}>
                    Média: {metricaMensal.media_empresa_etapas.toFixed(1)}
                  </p>
                )}
              </CardContent>
            </Card>

            <Card style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <AlertTriangle className="w-5 h-5 text-orange-600" />
                  <span className="text-2xl font-bold text-orange-600">
                    {gamificacao?.ocorrencias_abertas_mes || 0}
                  </span>
                </div>
                <p className="text-xs font-medium" style={{ color: theme.textMuted }}>Ocorrências Abertas</p>
              </CardContent>
            </Card>

            <Card style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-2xl font-bold text-green-600">
                    {gamificacao?.ocorrencias_resolvidas_mes || 0}
                  </span>
                </div>
                <p className="text-xs font-medium" style={{ color: theme.textMuted }}>Ocorrências Resolvidas</p>
              </CardContent>
            </Card>

            <Card style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <Timer className="w-5 h-5 text-blue-600" />
                  <span className="text-2xl font-bold" style={{ color: theme.text }}>
                    {gamificacao?.tempo_medio_resolucao_horas ? `${gamificacao.tempo_medio_resolucao_horas.toFixed(1)}h` : '-'}
                  </span>
                </div>
                <p className="text-xs font-medium" style={{ color: theme.textMuted }}>Tempo Médio Resolução</p>
              </CardContent>
            </Card>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className={`grid w-full ${isAdmin ? 'grid-cols-5' : 'grid-cols-4'}`} style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}>
              <TabsTrigger value="sla_mensal">SLA Mensal</TabsTrigger>
              <TabsTrigger value="qualidade">Qualidade</TabsTrigger>
              <TabsTrigger value="produtividade">Produtividade</TabsTrigger>
              <TabsTrigger value="ranking">Ranking</TabsTrigger>
              {isAdmin && (
                <TabsTrigger value="administracao">
                  <Settings className="w-4 h-4 mr-2" />
                  Administração
                </TabsTrigger>
              )}
            </TabsList>

            <TabsContent value="sla_mensal" className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <Card style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2" style={{ color: theme.text }}>
                      <Shield className="w-5 h-5 text-green-600" />
                      Pontos de Qualidade
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-center py-4">
                      <p className="text-5xl font-bold" style={{ color: theme.text }}>
                        {(gamificacao?.pontos_qualidade_mes || 0).toFixed(1)}
                      </p>
                      <p className="text-sm mt-2" style={{ color: theme.textMuted }}>de 100 pontos</p>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span style={{ color: theme.textMuted }}>Ocorrências Abertas</span>
                        <Badge variant="outline" className="text-red-600">
                          {gamificacao?.ocorrencias_abertas_mes || 0}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span style={{ color: theme.textMuted }}>Ocorrências Críticas</span>
                        <Badge variant="outline" className="text-red-600">
                          {metricaMensal?.ocorrencias_criticas || 0}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span style={{ color: theme.textMuted }}>Resolvidas com Atraso</span>
                        <Badge variant="outline" className="text-orange-600">
                          {gamificacao?.ocorrencias_atrasadas_mes || 0}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span style={{ color: theme.textMuted }}>Tempo Médio Resolução</span>
                        <Badge variant="outline" className="text-blue-600">
                          {gamificacao?.tempo_medio_resolucao_horas ? `${gamificacao.tempo_medio_resolucao_horas.toFixed(1)}h` : '-'}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2" style={{ color: theme.text }}>
                      <Zap className="w-5 h-5 text-blue-600" />
                      Pontos de Produtividade
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-center py-4">
                      <p className="text-5xl font-bold" style={{ color: theme.text }}>
                        {(gamificacao?.pontos_produtividade_mes || 0).toFixed(1)}
                      </p>
                      <p className="text-sm mt-2" style={{ color: theme.textMuted }}>de 100 pontos</p>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span style={{ color: theme.textMuted }}>Ordens Criadas</span>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">
                            {gamificacao?.ordens_criadas_mes || 0}
                          </Badge>
                          {metricaMensal?.comparativo_media === 'acima' && <TrendingUp className="w-4 h-4 text-green-600" />}
                          {metricaMensal?.comparativo_media === 'na_media' && (
                            <span className="text-sm text-blue-600">Na Média</span>
                          )}
                          {metricaMensal?.comparativo_media === 'abaixo' && <TrendingDown className="w-4 h-4 text-red-600" />}
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span style={{ color: theme.textMuted }}>Etapas Concluídas</span>
                        <Badge variant="outline">
                          {gamificacao?.etapas_concluidas_mes || 0}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span style={{ color: theme.textMuted }}>Etapas no Prazo</span>
                        <Badge variant="outline" className="text-green-600">
                          {gamificacao?.etapas_no_prazo_mes || 0}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span style={{ color: theme.textMuted }}>% no Prazo</span>
                        <Badge variant="outline" className="text-blue-600">
                          {metricaMensal?.percentual_no_prazo ? `${metricaMensal.percentual_no_prazo.toFixed(1)}%` : '100%'}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {historicoMensal.length > 0 && (
                <Card style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2" style={{ color: theme.text }}>
                      <BarChart3 className="w-5 h-5" />
                      Histórico de Performance (Últimos 6 Meses)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {historicoMensal.map((metrica, idx) => {
                        const slaMetrica = metrica.sla_final || 0;
                        const corMetrica = slaMetrica >= metaIdeal ? 'bg-green-600' : slaMetrica >= metaMinima ? 'bg-yellow-600' : 'bg-red-600';

                        return (
                          <div key={idx} className="space-y-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4" style={{ color: theme.textMuted }} />
                                <span className="text-sm font-medium" style={{ color: theme.text }}>
                                  {format(new Date(`${metrica.mes_referencia}-01`), "MMMM yyyy", { locale: ptBR })}
                                </span>
                              </div>
                              <span className="text-lg font-bold" style={{ color: theme.text }}>
                                {slaMetrica.toFixed(1)}%
                              </span>
                            </div>
                            <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                              <div className={`h-full ${corMetrica}`} style={{ width: `${slaMetrica}%` }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="qualidade" className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <Card style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2" style={{ color: theme.text }}>
                      <AlertTriangle className="w-5 h-5 text-orange-600" />
                      Ocorrências
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-4 rounded-lg bg-red-50 dark:bg-red-900/20">
                        <p className="text-3xl font-bold text-red-600">{gamificacao?.ocorrencias_abertas_mes || 0}</p>
                        <p className="text-xs mt-1 text-red-700 dark:text-red-400">Abertas</p>
                      </div>
                      <div className="text-center p-4 rounded-lg bg-green-50 dark:bg-green-900/20">
                        <p className="text-3xl font-bold text-green-600">{gamificacao?.ocorrencias_resolvidas_mes || 0}</p>
                        <p className="text-xs mt-1 text-green-700 dark:text-green-400">Resolvidas</p>
                      </div>
                    </div>

                    <div className="space-y-3 pt-4 border-t" style={{ borderColor: theme.cardBorder }}>
                      <div className="flex items-center justify-between">
                        <span style={{ color: theme.textMuted }}>Críticas</span>
                        <Badge className="bg-red-600 text-white">{metricaMensal?.ocorrencias_criticas || 0}</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span style={{ color: theme.textMuted }}>Com Atraso</span>
                        <Badge className="bg-orange-600 text-white">{gamificacao?.ocorrencias_atrasadas_mes || 0}</Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span style={{ color: theme.textMuted }}>Total do Mês</span>
                        <Badge variant="outline">{metricaMensal?.ocorrencias_total || 0}</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2" style={{ color: theme.text }}>
                      <Timer className="w-5 h-5 text-blue-600" />
                      Tempo de Resposta
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-center py-6">
                      <p className="text-5xl font-bold text-blue-600">
                        {gamificacao?.tempo_medio_resolucao_horas ? `${gamificacao.tempo_medio_resolucao_horas.toFixed(1)}h` : '-'}
                      </p>
                      <p className="text-sm mt-2" style={{ color: theme.textMuted }}>Tempo Médio de Resolução</p>
                    </div>

                    <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                      <p className="text-xs text-blue-700 dark:text-blue-400 font-medium mb-2">Meta de Melhoria Contínua</p>
                      <p className="text-sm" style={{ color: theme.text }}>
                        Reduza o tempo de resolução em <strong>10%</strong> a cada mês para ganhar bônus
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}>
                <CardHeader>
                  <CardTitle style={{ color: theme.text }}>Impacto das Ocorrências no SLA</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                      <p className="text-2xl font-bold text-blue-600">{configuracaoSLA?.pontos_ocorrencia_baixa || -5}</p>
                      <p className="text-xs mt-1" style={{ color: theme.textMuted }}>Gravidade Baixa</p>
                    </div>
                    <div className="text-center p-4 rounded-lg bg-yellow-50 dark:bg-yellow-900/20">
                      <p className="text-2xl font-bold text-yellow-600">{configuracaoSLA?.pontos_ocorrencia_media || -10}</p>
                      <p className="text-xs mt-1" style={{ color: theme.textMuted }}>Gravidade Média</p>
                    </div>
                    <div className="text-center p-4 rounded-lg bg-orange-50 dark:bg-orange-900/20">
                      <p className="text-2xl font-bold text-orange-600">{configuracaoSLA?.pontos_ocorrencia_alta || -20}</p>
                      <p className="text-xs mt-1" style={{ color: theme.textMuted }}>Gravidade Alta</p>
                    </div>
                    <div className="text-center p-4 rounded-lg bg-red-50 dark:bg-red-900/20">
                      <p className="text-2xl font-bold text-red-600">{configuracaoSLA?.pontos_ocorrencia_critica || -40}</p>
                      <p className="text-xs mt-1" style={{ color: theme.textMuted }}>Crítica</p>
                    </div>
                  </div>

                  <div className="mt-6 p-4 rounded-lg bg-orange-50 dark:bg-orange-900/20">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-orange-900 dark:text-orange-300 mb-1">Penalidade por Atraso</p>
                        <p className="text-sm text-orange-700 dark:text-orange-400">
                          Ocorrências resolvidas após o prazo SLA: <strong>{configuracaoSLA?.pontos_ocorrencia_atrasada || -15} pontos adicionais</strong>
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 p-4 rounded-lg bg-green-50 dark:bg-green-900/20">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-green-900 dark:text-green-300 mb-1">Bônus por Agilidade</p>
                        <p className="text-sm text-green-700 dark:text-green-400">
                          Resolução 50% mais rápida: <strong>+{configuracaoSLA?.pontos_resolucao_rapida || 10} pontos</strong>
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="produtividade" className="space-y-4">
              <div className="grid md:grid-cols-3 gap-4">
                <Card style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2" style={{ color: theme.text }}>
                      <Package className="w-5 h-5 text-blue-600" />
                      Ordens
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-center">
                      <p className="text-4xl font-bold" style={{ color: theme.text }}>
                        {gamificacao?.ordens_criadas_mes || 0}
                      </p>
                      <p className="text-sm mt-1" style={{ color: theme.textMuted }}>Criadas no Mês</p>
                    </div>

                    {metricaMensal?.media_empresa_ordens && (
                      <div className="pt-4 border-t space-y-2" style={{ borderColor: theme.cardBorder }}>
                        <div className="flex items-center justify-between text-sm">
                          <span style={{ color: theme.textMuted }}>Média da Empresa</span>
                          <span className="font-bold" style={{ color: theme.text }}>
                            {metricaMensal.media_empresa_ordens.toFixed(1)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          {metricaMensal.comparativo_media === 'acima' && (
                            <>
                              <TrendingUp className="w-4 h-4 text-green-600" />
                              <span className="text-sm text-green-600">Acima da Média</span>
                            </>
                          )}
                          {metricaMensal.comparativo_media === 'na_media' && (
                            <span className="text-sm text-blue-600">Na Média</span>
                          )}
                          {metricaMensal.comparativo_media === 'abaixo' && (
                            <>
                              <TrendingDown className="w-4 h-4 text-red-600" />
                              <span className="text-sm text-red-600">Abaixo da Média</span>
                            </>
                          )}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2" style={{ color: theme.text }}>
                      <Workflow className="w-5 h-5 text-purple-600" />
                      Etapas
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-center">
                      <p className="text-4xl font-bold" style={{ color: theme.text }}>
                        {gamificacao?.etapas_concluidas_mes || 0}
                      </p>
                      <p className="text-sm mt-1" style={{ color: theme.textMuted }}>Concluídas no Mês</p>
                    </div>

                    {metricaMensal?.media_empresa_etapas && (
                      <div className="pt-4 border-t space-y-2" style={{ borderColor: theme.cardBorder }}>
                        <div className="flex items-center justify-between text-sm">
                          <span style={{ color: theme.textMuted }}>Média da Empresa</span>
                          <span className="font-bold" style={{ color: theme.text }}>
                            {metricaMensal.media_empresa_etapas.toFixed(1)}
                          </span>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2" style={{ color: theme.text }}>
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      Cumprimento de Prazo
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-center">
                      <p className="text-4xl font-bold text-green-600">
                        {metricaMensal?.percentual_no_prazo ? `${metricaMensal.percentual_no_prazo.toFixed(0)}%` : '100%'}
                      </p>
                      <p className="text-sm mt-1" style={{ color: theme.textMuted }}>No Prazo</p>
                    </div>

                    <div className="pt-4 border-t space-y-2" style={{ borderColor: theme.cardBorder }}>
                      <div className="flex items-center justify-between text-sm">
                        <span style={{ color: theme.textMuted }}>No Prazo</span>
                        <Badge className="bg-green-600 text-white">{gamificacao?.etapas_no_prazo_mes || 0}</Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span style={{ color: theme.textMuted }}>Atrasadas</span>
                        <Badge className="bg-red-600 text-white">{gamificacao?.etapas_atrasadas_mes || 0}</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}>
                <CardHeader>
                  <CardTitle style={{ color: theme.text }}>Sistema de Pontuação</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                      <p className="text-2xl font-bold text-blue-600">+{configuracaoSLA?.pontos_ordem_criada || 10}</p>
                      <p className="text-xs mt-1" style={{ color: theme.textMuted }}>Por Ordem</p>
                    </div>
                    <div className="text-center p-4 rounded-lg bg-purple-50 dark:bg-purple-900/20">
                      <p className="text-2xl font-bold text-purple-600">+{configuracaoSLA?.pontos_etapa_concluida || 5}</p>
                      <p className="text-xs mt-1" style={{ color: theme.textMuted }}>Por Etapa</p>
                    </div>
                    <div className="text-center p-4 rounded-lg bg-green-50 dark:bg-green-900/20">
                      <p className="text-2xl font-bold text-green-600">+{configuracaoSLA?.pontos_etapa_no_prazo || 3}</p>
                      <p className="text-xs mt-1" style={{ color: theme.textMuted }}>Bônus Prazo</p>
                    </div>
                    <div className="text-center p-4 rounded-lg bg-yellow-50 dark:bg-yellow-900/20">
                      <p className="text-2xl font-bold text-yellow-600">+{configuracaoSLA?.pontos_acima_media || 20}</p>
                      <p className="text-xs mt-1" style={{ color: theme.textMuted }}>Acima Média</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="ranking" className="space-y-4">
              <div className="flex gap-2 mb-4">
                <Button
                  variant={categoriaFilter === 'todos' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setCategoriaFilter('todos')}
                >
                  Todos
                </Button>
                <Button
                  variant={categoriaFilter === 'operacional' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setCategoriaFilter('operacional')}
                >
                  Operacional
                </Button>
                <Button
                  variant={categoriaFilter === 'administrativo' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setCategoriaFilter('administrativo')}
                >
                  Administrativo
                </Button>
                <Button
                  variant={categoriaFilter === 'gerencial' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setCategoriaFilter('gerencial')}
                >
                  Gerencial
                </Button>
              </div>

              <Card style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2" style={{ color: theme.text }}>
                    <Users className="w-5 h-5" />
                    Ranking Mensal - SLA
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {ranking
                      .filter(r => categoriaFilter === 'todos' || r.categoria_usuario === categoriaFilter)
                      .slice(0, 20)
                      .map((piloto, index) => {
                        const isCurrentUser = piloto.user_id === user?.id;
                        const sla = piloto.sla_mes_atual || 0;
                        const corSla = sla >= metaIdeal ? 'text-green-600' : sla >= metaMinima ? 'text-yellow-600' : 'text-red-600';

                        return (
                          <div
                            key={piloto.id}
                            className={`flex items-center justify-between p-4 rounded-lg ${
                              isCurrentUser 
                                ? 'bg-blue-100 dark:bg-blue-900/40 border-2 border-blue-500' 
                                : ''
                            }`}
                            style={isCurrentUser ? {} : {backgroundColor: isDark ? '#1e293b' : '#f8f8f8'}}
                          >
                            <div className="flex items-center gap-4">
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                                index === 0 ? 'bg-yellow-400 text-white' :
                                index === 1 ? 'bg-gray-300 text-gray-700' :
                                index === 2 ? 'bg-orange-400 text-white' :
                                'bg-gray-200 dark:bg-slate-700 text-gray-600 dark:text-gray-400'
                              }`}>
                                {index + 1}
                              </div>
                              
                              <div>
                                <p className="font-semibold" style={{ color: theme.text }}>
                                  Usuário #{piloto.user_id.slice(-6)}
                                  {isCurrentUser && <span className="ml-2 text-blue-600">(Você)</span>}
                                </p>
                                <div className="flex items-center gap-2 text-xs">
                                  <Badge variant="outline" className="text-[10px]">
                                    {piloto.categoria_usuario}
                                  </Badge>
                                  <span style={{ color: theme.textMuted }}>
                                    {piloto.ordens_criadas_mes || 0} ordens · {piloto.etapas_concluidas_mes || 0} etapas
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="text-right">
                              <p className={`text-3xl font-bold ${corSla}`}>
                                {sla.toFixed(1)}%
                              </p>
                              <p className="text-xs" style={{ color: theme.textMuted }}>SLA Mensal</p>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {isAdmin && (
              <TabsContent value="administracao" className="space-y-4">
                <Card style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2" style={{ color: theme.text }}>
                        <Settings className="w-5 h-5" />
                        Gestão de Medições de SLA
                      </CardTitle>
                    </div>
                    
                    <div className="flex gap-2 mt-4">
                      <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: theme.textMuted }} />
                        <Input
                          placeholder="Buscar por usuário..."
                          value={searchMetricas}
                          onChange={(e) => setSearchMetricas(e.target.value)}
                          className="pl-10"
                          style={{ backgroundColor: theme.bg, borderColor: theme.cardBorder, color: theme.text }}
                        />
                      </div>

                      <select
                        value={mesFilter}
                        onChange={(e) => setMesFilter(e.target.value)}
                        className="px-3 py-2 rounded-lg border text-sm"
                        style={{ backgroundColor: theme.bg, borderColor: theme.cardBorder, color: theme.text }}
                      >
                        <option value="">Todos os meses</option>
                        {mesesDisponiveis.map(mes => (
                          <option key={mes.value} value={mes.value}>{mes.label}</option>
                        ))}
                      </select>

                      <select
                        value={anoFilter}
                        onChange={(e) => setAnoFilter(e.target.value)}
                        className="px-3 py-2 rounded-lg border text-sm"
                        style={{ backgroundColor: theme.bg, borderColor: theme.cardBorder, color: theme.text }}
                      >
                        <option value="">Todos os anos</option>
                        {anosDisponiveis.map(ano => (
                          <option key={ano} value={ano}>{ano}</option>
                        ))}
                      </select>

                      <Button
                        variant="outline"
                        onClick={() => {
                          setSearchMetricas("");
                          setMesFilter("");
                          setAnoFilter("");
                        }}
                        style={{ borderColor: theme.cardBorder }}
                      >
                        Limpar
                      </Button>
                    </div>

                    <p className="text-sm mt-3" style={{ color: theme.textMuted }}>
                      {filteredMetricas.length} medições encontradas
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="rounded-lg border" style={{ borderColor: theme.cardBorder }}>
                      <Table>
                        <TableHeader>
                          <TableRow style={{ borderBottomColor: theme.cardBorder }}>
                            <TableHead style={{ color: theme.textMuted }}>Usuário</TableHead>
                            <TableHead style={{ color: theme.textMuted }}>Mês/Ano</TableHead>
                            <TableHead style={{ color: theme.textMuted }}>Categoria</TableHead>
                            <TableHead style={{ color: theme.textMuted }}>SLA Final</TableHead>
                            <TableHead style={{ color: theme.textMuted }}>Qualidade</TableHead>
                            <TableHead style={{ color: theme.textMuted }}>Produtividade</TableHead>
                            <TableHead style={{ color: theme.textMuted }}>Ordens</TableHead>
                            <TableHead style={{ color: theme.textMuted }}>Etapas</TableHead>
                            <TableHead style={{ color: theme.textMuted }} className="text-right">Ações</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredMetricas.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={9} className="text-center py-8" style={{ color: theme.textMuted }}>
                                Nenhuma medição encontrada
                              </TableCell>
                            </TableRow>
                          ) : (
                            filteredMetricas.map((metricaItem) => {
                              const slaColor = metricaItem.sla_final >= metaIdeal 
                                ? 'text-green-600' 
                                : metricaItem.sla_final >= metaMinima 
                                  ? 'text-yellow-600' 
                                  : 'text-red-600';

                              return (
                                <TableRow 
                                  key={metricaItem.id} 
                                  style={{ borderBottomColor: theme.cardBorder }}
                                  className="cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                                  onClick={() => setSelectedMetricaDetalhes(metricaItem)}
                                >
                                  <TableCell style={{ color: theme.text }} className="font-medium">
                                    {getUserName(metricaItem.user_id)}
                                  </TableCell>
                                  <TableCell style={{ color: theme.text }}>
                                    {format(new Date(`${metricaItem.mes_referencia}-01`), "MMM/yyyy", { locale: ptBR })}
                                  </TableCell>
                                  <TableCell>
                                    <Badge variant="outline" className="text-xs">
                                      {metricaItem.categoria_usuario}
                                    </Badge>
                                  </TableCell>
                                  <TableCell className={`font-bold ${slaColor}`}>
                                    {metricaItem.sla_final?.toFixed(1)}%
                                  </TableCell>
                                  <TableCell style={{ color: theme.text }}>
                                    {metricaItem.pontos_qualidade?.toFixed(1)} pts
                                  </TableCell>
                                  <TableCell style={{ color: theme.text }}>
                                    {metricaItem.pontos_produtividade?.toFixed(1)} pts
                                  </TableCell>
                                  <TableCell style={{ color: theme.text }}>
                                    {metricaItem.ordens_criadas || 0}
                                  </TableCell>
                                  <TableCell style={{ color: theme.text }}>
                                    {metricaItem.etapas_concluidas || 0}
                                  </TableCell>
                                  <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => setSelectedMetricaDetalhes(metricaItem)}
                                      className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                                    >
                                      <Eye className="w-4 h-4" />
                                    </Button>
                                  </TableCell>
                                </TableRow>
                              );
                            })
                          )}
                        </TableBody>
                      </Table>
                    </div>

                    <div className="mt-4 p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                      <div className="flex items-start gap-3">
                        <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold text-blue-900 dark:text-blue-300 mb-1">
                            Como funciona
                          </p>
                          <p className="text-sm text-blue-700 dark:text-blue-400">
                            Clique em qualquer medição para visualizar os registros detalhados (ordens, etapas, ocorrências) 
                            que impactaram o SLA. Você pode expurgar registros individuais mediante justificativa, 
                            e o SLA será recalculado automaticamente.
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            )}
          </Tabs>
        </div>
      </div>

      {selectedMetricaDetalhes && (
        <DetalhesMetricaSLA
          open={!!selectedMetricaDetalhes}
          onClose={() => setSelectedMetricaDetalhes(null)}
          metrica={selectedMetricaDetalhes}
          onUpdate={loadData}
          isDark={isDark}
        />
      )}
    </div>
  );
}
