import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  TrendingUp,
  Package,
  AlertCircle,
  Clock,
  CheckCircle2,
  MapPin,
  Workflow,
  Shield,
  Truck,
  FileText,
  Filter,
  ChevronRight,
  XCircle,
  Users,
  Activity,
  Calendar,
  Edit,
  User,
  Target
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format, addDays, startOfDay, endOfDay, isWithinInterval, startOfMonth, endOfMonth, getDaysInMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

import FilterModal from "../components/dashboard/FilterModal";
import QuickEditOrdem from "../components/dashboard/QuickEditOrdem";
import FiltroPeriodo from "../components/filtros/FiltroPeriodo";

export default function Dashboard() {
  const [ordens, setOrdens] = useState([]);
  const [motoristas, setMotoristas] = useState([]);
  const [veiculos, setVeiculos] = useState([]);
  const [etapas, setEtapas] = useState([]);
  const [ordensetapas, setOrdensEtapas] = useState([]);
  const [ocorrencias, setOcorrencias] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [operacoes, setOperacoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    dataInicio: "", dataFim: "", origem: "", destino: "", motorista: "", motoristaId: "",
    tipoOrdem: "", etapaId: "", status: "", frota: "", operacaoId: "", modalidadeCarga: "",
    tiposOrdemFiltro: ["carregamento"] // Padrão: apenas carregamento
  });
  const [showFilters, setShowFilters] = useState(false);
  const [isDark, setIsDark] = useState(false);
  
  // Filtros de período para o dashboard
  const [periodoFiltro, setPeriodoFiltro] = useState("mes_atual");
  const [anoSelecionado, setAnoSelecionado] = useState(new Date().getFullYear());
  const [mesSelecionado, setMesSelecionado] = useState(new Date().getMonth() + 1);
  const [dataInicioPersonalizada, setDataInicioPersonalizada] = useState("");
  const [dataFimPersonalizada, setDataFimPersonalizada] = useState("");
  
  // Estados para edição rápida
  const [selectedOrdemForEdit, setSelectedOrdemForEdit] = useState(null);
  const [showQuickEdit, setShowQuickEdit] = useState(false);
  const [expandedOperacao, setExpandedOperacao] = useState(null);

  // NOVO: Estado para modo de visualização dos gráficos
  const [viewMode, setViewMode] = useState("proximos7"); // "proximos7" ou "mesAtual"

  // Detect dark mode
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
      const user = await base44.auth.me();
      
      const [ordensData, motoristasData, veiculosData, etapasData, ordensEtapasData, ocorrenciasData, operacoesData] = await Promise.all([
        base44.entities.OrdemDeCarregamento.list("-data_solicitacao"),
        base44.entities.Motorista.list(),
        base44.entities.Veiculo.list(),
        base44.entities.Etapa.list("ordem"),
        base44.entities.OrdemEtapa.list(),
        base44.entities.Ocorrencia.list(),
        base44.entities.Operacao.list()
      ]);

      // Tentar carregar usuários apenas se for admin
      let usuariosData = [];
      try {
        if (user.role === "admin") {
          usuariosData = await base44.entities.User.list();
        }
      } catch (error) {
        console.log("Usuários não carregados (permissão negada - normal para não-admins)");
      }
      
      let ordensFiltradas = ordensData;
      
      // Filtrar baseado no tipo de perfil do usuário
      if (user.tipo_perfil === "fornecedor") {
        ordensFiltradas = ordensData.filter(o => o.cliente_cnpj === user.cnpj_associado);
      } else if (user.tipo_perfil === "cliente") {
        ordensFiltradas = ordensData.filter(o => o.destinatario_cnpj === user.cnpj_associado);
      } else if (user.tipo_perfil === "operador") {
        ordensFiltradas = user.empresa_id && user.role !== "admin"
          ? ordensData.filter(o => o.empresa_id === user.empresa_id || !o.empresa_id)
          : ordensData;
      } else if (user.role === "admin") {
        ordensFiltradas = ordensData;
      }
      
      setOrdens(ordensFiltradas);
      setMotoristas(motoristasData);
      setVeiculos(veiculosData);
      setEtapas(etapasData.filter(e => e.ativo));
      setOrdensEtapas(ordensEtapasData);
      setOcorrencias(ocorrenciasData);
      setUsuarios(usuariosData);
      setOperacoes(operacoesData.filter(op => op.ativo));
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    } finally {
      setLoading(false);
    }
  };

  const filtrarOrdensPorPeriodo = (ordensParaFiltrar) => {
    return ordensParaFiltrar.filter(ordem => {
      if (!ordem.data_solicitacao) return false;
      const dataOrdem = new Date(ordem.data_solicitacao);
      
      if (periodoFiltro === "mes_atual") {
        const inicioMes = startOfMonth(new Date());
        const fimMes = endOfMonth(new Date());
        return isWithinInterval(dataOrdem, { start: inicioMes, end: fimMes });
      } else if (periodoFiltro === "ano_atual") {
        return dataOrdem.getFullYear() === anoSelecionado;
      } else if (periodoFiltro === "mes_especifico") {
        // Criar datas usando UTC para evitar problemas de timezone
        const inicioMes = new Date(Date.UTC(anoSelecionado, mesSelecionado - 1, 1, 0, 0, 0));
        const fimMes = new Date(Date.UTC(anoSelecionado, mesSelecionado, 0, 23, 59, 59));
        return isWithinInterval(dataOrdem, { start: inicioMes, end: fimMes });
      } else if (periodoFiltro === "personalizado") {
        if (!dataInicioPersonalizada || !dataFimPersonalizada) return true;
        const inicio = new Date(dataInicioPersonalizada);
        const fim = new Date(dataFimPersonalizada);
        fim.setHours(23, 59, 59, 999);
        return isWithinInterval(dataOrdem, { start: inicio, end: fim });
      }
      return true;
    });
  };

  const getMetrics = () => {
    const ordensPorPeriodo = filtrarOrdensPorPeriodo(filteredOrdens);
    const totalOrdens = ordensPorPeriodo.length;
    const ofertas = ordensPorPeriodo.filter(o => o.tipo_registro === "oferta").length;
    const negociando = ordensPorPeriodo.filter(o => o.tipo_registro === "negociando").length;
    const ordensCompletas = ordensPorPeriodo.filter(o => o.tipo_registro === "ordem_completa").length;

    const emViagem = ordensPorPeriodo.filter(o => 
      o.status_tracking === "em_viagem" || 
      o.status_tracking === "carregado"
    ).length;
    
    const aguardando = ordensPorPeriodo.filter(o => 
      o.status_tracking === "aguardando_agendamento" ||
      o.status_tracking === "carregamento_agendado"
    ).length;
    
    const atrasadas = ordensPorPeriodo.filter(o => {
      if (!o.data_programacao_descarga) return false;
      const prazo = new Date(o.data_programacao_descarga);
      const hoje = new Date();
      return hoje > prazo && !o.descarga_realizada_data;
    }).length;

    const atrasadasCarregamento = ordensPorPeriodo.filter(o => {
      if (!o.carregamento_agendamento_data || o.fim_carregamento) return false;
      const agendado = new Date(o.carregamento_agendamento_data);
      const hoje = new Date();
      return hoje > agendado;
    }).length;

    const atrasadasDescarga = ordensPorPeriodo.filter(o => {
      if (!o.descarga_agendamento_data || o.descarga_realizada_data) return false;
      const agendado = new Date(o.descarga_agendamento_data);
      const hoje = new Date();
      return hoje > agendado;
    }).length;

    const etapasEmAndamento = ordensetapas.filter(oe => oe.status === "em_andamento").length;
    const etapasConcluidas = ordensetapas.filter(oe => oe.status === "concluida").length;
    const etapasBloqueadas = ordensetapas.filter(oe => oe.status === "bloqueada").length;

    const ocorrenciasAbertas = ocorrencias.filter(o => o.status === "aberta").length;
    const ocorrenciasCriticas = ocorrencias.filter(o => o.status === "aberta" && o.gravidade === "critica").length;

    return {
      totalOrdens, ofertas, negociando, ordensCompletas, emViagem, aguardando, atrasadas,
      atrasadasCarregamento, atrasadasDescarga,
      etapasEmAndamento, etapasConcluidas, etapasBloqueadas,
      ocorrenciasAbertas, ocorrenciasCriticas
    };
  };

  // ATUALIZADO: Próximos 7 dias (por data de carregamento)
  const getProximos7Dias = () => {
    const dias = [];
    const hoje = new Date();
    
    for (let i = 0; i <= 6; i++) {
      const dia = addDays(hoje, i);
      const dataStr = format(dia, 'dd/MM', { locale: ptBR });
      
      const ordensNoDia = ordens.filter(o => {
        if (!o.carregamento_agendamento_data) return false;
        const dataCarga = new Date(o.carregamento_agendamento_data);
        return isWithinInterval(dataCarga, {
          start: startOfDay(dia),
          end: endOfDay(dia)
        });
      });

      const ofertas = ordensNoDia.filter(o => o.tipo_registro === "oferta").length;
      const negociando = ordensNoDia.filter(o => o.tipo_registro === "negociando").length;
      const alocadas = ordensNoDia.filter(o => o.tipo_registro === "ordem_completa").length;

      dias.push({
        data: dataStr,
        ofertas,
        negociando,
        alocadas,
        total: ordensNoDia.length
      });
    }
    
    return dias;
  };

  // NOVO: Mês atual completo (dia 1 ao último dia, por data de carregamento)
  const getMesAtual = () => {
    const hoje = new Date();
    const inicioMes = startOfMonth(hoje);
    const diasNoMes = getDaysInMonth(hoje);
    const dias = [];
    
    for (let i = 0; i < diasNoMes; i++) {
      const dia = addDays(inicioMes, i);
      const dataStr = format(dia, 'dd/MM', { locale: ptBR });
      
      const ordensNoDia = ordens.filter(o => {
        if (!o.carregamento_agendamento_data) return false;
        const dataCarga = new Date(o.carregamento_agendamento_data);
        return isWithinInterval(dataCarga, {
          start: startOfDay(dia),
          end: endOfDay(dia)
        });
      });

      const ofertas = ordensNoDia.filter(o => o.tipo_registro === "oferta").length;
      const negociando = ordensNoDia.filter(o => o.tipo_registro === "negociando").length;
      const alocadas = ordensNoDia.filter(o => o.tipo_registro === "ordem_completa").length;

      dias.push({
        data: dataStr,
        ofertas,
        negociando,
        alocadas,
        total: ordensNoDia.length
      });
    }
    
    return dias;
  };

  // NOVO: Próximos 7 dias por Operação
  const getProximos7DiasPorOperacao = () => {
    const resultado = {};
    const hoje = new Date();
    
    for (let i = 0; i <= 6; i++) {
      const dia = addDays(hoje, i);
      const dataStr = format(dia, 'dd/MM', { locale: ptBR });
      
      filteredOrdens.forEach(ordem => {
        if (!ordem.carregamento_agendamento_data || !ordem.operacao_id) return;
        
        const dataCarga = new Date(ordem.carregamento_agendamento_data);
        if (!isWithinInterval(dataCarga, { start: startOfDay(dia), end: endOfDay(dia) })) return;
        
        const operacao = operacoes.find(op => op.id === ordem.operacao_id);
        const nomeOperacao = operacao?.nome || "Sem Operação";
        
        if (!resultado[nomeOperacao]) {
          resultado[nomeOperacao] = [];
        }
        
        let diaExistente = resultado[nomeOperacao].find(d => d.data === dataStr);
        if (!diaExistente) {
          diaExistente = { data: dataStr, ofertas: 0, negociando: 0, alocadas: 0 };
          resultado[nomeOperacao].push(diaExistente);
        }
        
        if (ordem.tipo_registro === "oferta") {
          diaExistente.ofertas++;
        } else if (ordem.tipo_registro === "negociando") {
          diaExistente.negociando++;
        } else {
          diaExistente.alocadas++;
        }
      });
    }
    
    // Preencher dias vazios e ordenar
    Object.keys(resultado).forEach(operacao => {
      const diasCompletos = [];
      for (let i = 0; i <= 6; i++) {
        const dia = addDays(hoje, i);
        const dataStr = format(dia, 'dd/MM', { locale: ptBR });
        const diaExistente = resultado[operacao].find(d => d.data === dataStr);
        diasCompletos.push(diaExistente || { data: dataStr, ofertas: 0, negociando: 0, alocadas: 0 });
      }
      resultado[operacao] = diasCompletos;
    });
    
    return resultado;
  };

  // NOVO: Mês atual por Operação
  const getMesAtualPorOperacao = () => {
    const resultado = {};
    const hoje = new Date();
    const inicioMes = startOfMonth(hoje);
    const diasNoMes = getDaysInMonth(hoje);
    
    for (let i = 0; i < diasNoMes; i++) {
      const dia = addDays(inicioMes, i);
      const dataStr = format(dia, 'dd/MM', { locale: ptBR });
      
      filteredOrdens.forEach(ordem => {
        if (!ordem.carregamento_agendamento_data || !ordem.operacao_id) return;
        
        const dataCarga = new Date(ordem.carregamento_agendamento_data);
        if (!isWithinInterval(dataCarga, { start: startOfDay(dia), end: endOfDay(dia) })) return;
        
        const operacao = operacoes.find(op => op.id === ordem.operacao_id);
        const nomeOperacao = operacao?.nome || "Sem Operação";
        
        if (!resultado[nomeOperacao]) {
          resultado[nomeOperacao] = [];
        }
        
        let diaExistente = resultado[nomeOperacao].find(d => d.data === dataStr);
        if (!diaExistente) {
          diaExistente = { data: dataStr, ofertas: 0, negociando: 0, alocadas: 0 };
          resultado[nomeOperacao].push(diaExistente);
        }
        
        if (ordem.tipo_registro === "oferta") {
          diaExistente.ofertas++;
        } else if (ordem.tipo_registro === "negociando") {
          diaExistente.negociando++;
        } else {
          diaExistente.alocadas++;
        }
      });
    }
    
    // Preencher dias vazios e ordenar
    Object.keys(resultado).forEach(operacao => {
      const diasCompletos = [];
      for (let i = 0; i < diasNoMes; i++) {
        const dia = addDays(inicioMes, i);
        const dataStr = format(dia, 'dd/MM', { locale: ptBR });
        const diaExistente = resultado[operacao].find(d => d.data === dataStr);
        diasCompletos.push(diaExistente || { data: dataStr, ofertas: 0, negociando: 0, alocadas: 0 });
      }
      resultado[operacao] = diasCompletos;
    });
    
    return resultado;
  };

  // Volume Mensal - Últimos 6 meses
  const getVolumeMensal = () => {
    const meses = [];
    const hoje = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const mes = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1);
      const mesStr = format(mes, 'MMM/yy', { locale: ptBR });
      const inicioMes = new Date(mes.getFullYear(), mes.getMonth(), 1);
      const fimMes = new Date(mes.getFullYear(), mes.getMonth() + 1, 0, 23, 59, 59);
      
      const ordensNoMes = ordens.filter(o => {
        if (!o.data_solicitacao) return false;
        const dataOrdem = new Date(o.data_solicitacao);
        return isWithinInterval(dataOrdem, { start: inicioMes, end: fimMes });
      }).length;

      const ocorrenciasNoMes = ocorrencias.filter(o => {
        if (!o.data_inicio) return false;
        const dataOcorrencia = new Date(o.data_inicio);
        return isWithinInterval(dataOcorrencia, { start: inicioMes, end: fimMes });
      }).length;

      const processosNoMes = ordensetapas.filter(oe => {
        if (!oe.data_conclusao) return false;
        const dataConclusao = new Date(oe.data_conclusao);
        return isWithinInterval(dataConclusao, { start: inicioMes, end: fimMes });
      }).length;

      meses.push({
        mes: mesStr,
        ordens: ordensNoMes,
        ocorrencias: ocorrenciasNoMes,
        processos: processosNoMes
      });
    }
    
    return meses;
  };

  // Análise detalhada de ordens
  const getOrdensDetalhadas = () => {
    const ordensPorPeriodo = filtrarOrdensPorPeriodo(filteredOrdens);
    const porOrigem = {};
    const porDestino = {};
    const porFrota = { própria: 0, terceirizada: 0, agregado: 0, acionista: 0 };
    const porModalidade = { normal: 0, prioridade: 0, expressa: 0 };

    ordensPorPeriodo.forEach(o => {
      if (o.origem) {
        porOrigem[o.origem] = (porOrigem[o.origem] || 0) + 1;
      }
      
      if (o.destino) {
        porDestino[o.destino] = (porDestino[o.destino] || 0) + 1;
      }
      
      if (o.frota && porFrota.hasOwnProperty(o.frota)) {
        porFrota[o.frota]++;
      }
      
      if (o.modalidade_carga && porModalidade.hasOwnProperty(o.modalidade_carga)) {
        porModalidade[o.modalidade_carga]++;
      }
    });

    const porOperacao = {};
    ordensPorPeriodo.forEach(o => {
      if (o.operacao_id) {
        const operacao = operacoes.find(op => op.id === o.operacao_id);
        const nomeOp = operacao?.nome || "Sem Operação";
        
        if (!porOperacao[nomeOp]) {
          porOperacao[nomeOp] = {
            total: 0,
            ofertas: 0,
            negociando: 0,
            alocadas: 0, 
            emViagem: 0,
            aguardando: 0,
            finalizadas: 0,
            atrasadas: 0,
            ordens: []
          };
        }
        
        porOperacao[nomeOp].total++;
        porOperacao[nomeOp].ordens.push(o);
        
        if (o.tipo_registro === "oferta") {
          porOperacao[nomeOp].ofertas++;
        } else if (o.tipo_registro === "negociando") {
          porOperacao[nomeOp].negociando++;
        } else {
          porOperacao[nomeOp].alocadas++;
        }
        
        if (o.status_tracking === "em_viagem" || o.status_tracking === "carregado") {
          porOperacao[nomeOp].emViagem++;
        }
        if (o.status_tracking === "aguardando_agendamento" || o.status_tracking === "carregamento_agendado") {
          porOperacao[nomeOp].aguardando++;
        }
        if (o.status_tracking === "finalizado") {
          porOperacao[nomeOp].finalizadas++;
        }
        if (o.data_programacao_descarga && !o.descarga_realizada_data && new Date() > new Date(o.data_programacao_descarga)) {
          porOperacao[nomeOp].atrasadas++;
        }
      }
    });

    const topOrigens = Object.entries(porOrigem)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
    
    const topDestinos = Object.entries(porDestino)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    return { topOrigens, topDestinos, porFrota, porModalidade, porOperacao };
  };

  const getInsights = () => {
    const statusTracking = {};
    filteredOrdens.forEach(o => {
      const status = o.status_tracking || "sem_status";
      statusTracking[status] = (statusTracking[status] || 0) + 1;
    });

    const etapasStats = {};
    ordensetapas.forEach(oe => {
      const etapa = etapas.find(e => e.id === oe.etapa_id);
      if (etapa) {
        if (!etapasStats[etapa.nome]) {
          etapasStats[etapa.nome] = { pendente: 0, em_andamento: 0, concluida: 0, bloqueada: 0 };
        }
        etapasStats[etapa.nome][oe.status]++;
      }
    });

    const operacoesStats = {};
    filteredOrdens.forEach(o => {
      if (o.operacao_id) {
        const op = operacoes.find(op => op.id === o.operacao_id);
        if (op) {
          operacoesStats[op.nome] = (operacoesStats[op.nome] || 0) + 1;
        }
      }
    });

    return { statusTracking, etapasStats, operacoesStats };
  };

  const filteredOrdens = ordens.filter(ordem => {
    // Filtro de tipo de ordem (carregamento, coleta, recebimento, entrega)
    if (filters.tiposOrdemFiltro && filters.tiposOrdemFiltro.length > 0) {
      let tipoOrdemAtual = ordem.tipo_ordem;
      
      // Se não tem tipo_ordem definido, inferir pelo tipo_registro e numero_coleta
      if (!tipoOrdemAtual) {
        if (ordem.numero_coleta && ordem.numero_coleta.startsWith("COL-")) {
          tipoOrdemAtual = "coleta";
        } else if (["coleta_solicitada", "coleta_aprovada", "coleta_reprovada"].includes(ordem.tipo_registro)) {
          tipoOrdemAtual = "coleta";
        } else if (ordem.tipo_registro === "recebimento") {
          tipoOrdemAtual = "recebimento";
        } else if (ordem.tipo_registro === "ordem_entrega") {
          tipoOrdemAtual = "entrega";
        } else {
          tipoOrdemAtual = "carregamento";
        }
      }
      
      if (!filters.tiposOrdemFiltro.includes(tipoOrdemAtual)) return false;
    }

    if (filters.dataInicio && ordem.data_solicitacao) {
      const dataOrdem = new Date(ordem.data_solicitacao);
      const dataInicio = new Date(filters.dataInicio);
      if (dataOrdem < dataInicio) return false;
    }

    if (filters.dataFim && ordem.data_solicitacao) {
      const dataOrdem = new Date(ordem.data_solicitacao);
      const dataFim = new Date(filters.dataFim);
      dataFim.setHours(23, 59, 59, 999);
      if (dataOrdem > dataFim) return false;
    }

    if (filters.tipoOrdem) {
      if (filters.tipoOrdem === "oferta" && ordem.tipo_registro !== "oferta") return false;
      if (filters.tipoOrdem === "negociando" && ordem.tipo_registro !== "negociando") return false;
      if (filters.tipoOrdem === "alocado" && ordem.tipo_registro !== "ordem_completa") return false;
    }

    if (filters.etapaId) {
      const temEtapa = ordensetapas.some(
        oe => oe.ordem_id === ordem.id && oe.etapa_id === filters.etapaId
      );
      if (!temEtapa) return false;
    }

    if (filters.status && filters.etapaId) {
      const ordemEtapa = ordensetapas.find(
        oe => oe.ordem_id === ordem.id && oe.etapa_id === filters.etapaId
      );
      if (!ordemEtapa || ordemEtapa.status !== filters.status) return false;
    }

    if (filters.frota && ordem.frota !== filters.frota) return false;
    if (filters.operacaoId && ordem.operacao_id !== filters.operacaoId) return false;
    if (filters.modalidadeCarga && ordem.modalidade_carga !== filters.modalidadeCarga) return false;
    if (filters.origem && !ordem.origem?.toLowerCase().includes(filters.origem.toLowerCase())) return false;
    if (filters.destino && !ordem.destino?.toLowerCase().includes(filters.destino.toLowerCase())) return false;
    
    if (filters.motoristaId) {
      if (ordem.motorista_id !== filters.motoristaId) return false;
    }

    if (!searchTerm) return true;

    const term = searchTerm.toLowerCase();
    const motorista = motoristas.find(m => m.id === ordem.motorista_id);
    const cavalo = veiculos.find(v => v.id === ordem.cavalo_id);
    const operacao = operacoes.find(op => op.id === ordem.operacao_id);

    return (
      ordem.numero_carga?.toLowerCase().includes(term) ||
      ordem.cliente?.toLowerCase().includes(term) ||
      ordem.origem?.toLowerCase().includes(term) ||
      ordem.destino?.toLowerCase().includes(term) ||
      ordem.produto?.toLowerCase().includes(term) ||
      motorista?.nome?.toLowerCase().includes(term) ||
      cavalo?.placa?.toLowerCase().includes(term) ||
      operacao?.nome?.toLowerCase().includes(term)
    );
  });

  const metrics = getMetrics();
  const insights = getInsights();
  const volumeMensal = getVolumeMensal();
  const ordensDetalhadas = getOrdensDetalhadas();
  
  // Dados baseados no modo de visualização
  const dadosGrafico = viewMode === "proximos7" ? getProximos7Dias() : getMesAtual();
  const dadosPorOperacao = viewMode === "proximos7" ? getProximos7DiasPorOperacao() : getMesAtualPorOperacao();

  const theme = {
    bg: isDark ? '#0f172a' : '#ffffff',
    bgAlt: isDark ? '#1e293b' : '#f9fafb',
    cardBg: isDark ? '#1e293b' : '#ffffff',
    cardBorder: isDark ? '#334155' : '#e5e7eb',
    text: isDark ? '#f1f5f9' : '#111827',
    textStrong: isDark ? '#ffffff' : '#000000',
    textMuted: isDark ? '#cbd5e1' : '#4b5563',
    inputBg: isDark ? '#1e293b' : '#ffffff',
    inputBorder: isDark ? '#334155' : '#d1d5db',
  };

  const handleEditOrdem = (ordem) => {
    setSelectedOrdemForEdit(ordem);
    setShowQuickEdit(true);
  };

  if (loading) {
    return (
      <div className="p-4 min-h-screen flex items-center justify-center" style={{ backgroundColor: theme.bg }}>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-semibold" style={{ color: theme.textMuted }}>Carregando dados...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 transition-colors" style={{ backgroundColor: theme.bgAlt }}>
      <div className="max-w-[1800px] mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2" style={{ color: theme.textStrong }}>Torre de Controle</h1>
            <p className="text-base font-medium" style={{ color: theme.textMuted }}>
              Visão geral das operações logísticas
            </p>
          </div>

          <FiltroPeriodo
            periodoFiltro={periodoFiltro}
            onPeriodoChange={setPeriodoFiltro}
            anoSelecionado={anoSelecionado}
            onAnoChange={setAnoSelecionado}
            mesSelecionado={mesSelecionado}
            onMesChange={setMesSelecionado}
            dataInicioPersonalizada={dataInicioPersonalizada}
            onDataInicioPersonalizadaChange={setDataInicioPersonalizada}
            dataFimPersonalizada={dataFimPersonalizada}
            onDataFimPersonalizadaChange={setDataFimPersonalizada}
            isDark={isDark}
          />

          <div className="flex items-center gap-2 w-full lg:w-auto">
            <div className="flex gap-2 flex-wrap">
              <Button
                variant={filters.tiposOrdemFiltro.includes("carregamento") ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  const tipos = filters.tiposOrdemFiltro.includes("carregamento")
                    ? filters.tiposOrdemFiltro.filter(t => t !== "carregamento")
                    : [...filters.tiposOrdemFiltro, "carregamento"];
                  setFilters({ ...filters, tiposOrdemFiltro: tipos });
                }}
                className="text-xs h-7"
                style={{
                  backgroundColor: filters.tiposOrdemFiltro.includes("carregamento") ? '#3b82f6' : 'transparent',
                  color: filters.tiposOrdemFiltro.includes("carregamento") ? '#ffffff' : theme.text,
                  borderColor: theme.inputBorder
                }}
              >
                Carregamento
              </Button>
              <Button
                variant={filters.tiposOrdemFiltro.includes("coleta") ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  const tipos = filters.tiposOrdemFiltro.includes("coleta")
                    ? filters.tiposOrdemFiltro.filter(t => t !== "coleta")
                    : [...filters.tiposOrdemFiltro, "coleta"];
                  setFilters({ ...filters, tiposOrdemFiltro: tipos });
                }}
                className="text-xs h-7"
                style={{
                  backgroundColor: filters.tiposOrdemFiltro.includes("coleta") ? '#10b981' : 'transparent',
                  color: filters.tiposOrdemFiltro.includes("coleta") ? '#ffffff' : theme.text,
                  borderColor: theme.inputBorder
                }}
              >
                Coleta
              </Button>
              <Button
                variant={filters.tiposOrdemFiltro.includes("recebimento") ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  const tipos = filters.tiposOrdemFiltro.includes("recebimento")
                    ? filters.tiposOrdemFiltro.filter(t => t !== "recebimento")
                    : [...filters.tiposOrdemFiltro, "recebimento"];
                  setFilters({ ...filters, tiposOrdemFiltro: tipos });
                }}
                className="text-xs h-7"
                style={{
                  backgroundColor: filters.tiposOrdemFiltro.includes("recebimento") ? '#f59e0b' : 'transparent',
                  color: filters.tiposOrdemFiltro.includes("recebimento") ? '#ffffff' : theme.text,
                  borderColor: theme.inputBorder
                }}
              >
                Recebimento
              </Button>
              <Button
                variant={filters.tiposOrdemFiltro.includes("entrega") ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  const tipos = filters.tiposOrdemFiltro.includes("entrega")
                    ? filters.tiposOrdemFiltro.filter(t => t !== "entrega")
                    : [...filters.tiposOrdemFiltro, "entrega"];
                  setFilters({ ...filters, tiposOrdemFiltro: tipos });
                }}
                className="text-xs h-7"
                style={{
                  backgroundColor: filters.tiposOrdemFiltro.includes("entrega") ? '#8b5cf6' : 'transparent',
                  color: filters.tiposOrdemFiltro.includes("entrega") ? '#ffffff' : theme.text,
                  borderColor: theme.inputBorder
                }}
              >
                Entrega
              </Button>
            </div>
            <div className="relative flex-1 lg:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: theme.textMuted }} />
              <Input
                placeholder="Buscar ordens, clientes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 font-medium"
                style={{ 
                  backgroundColor: theme.inputBg, 
                  borderColor: theme.inputBorder, 
                  color: theme.text 
                }}
              />
            </div>
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => setShowFilters(true)}
              style={{ borderColor: theme.inputBorder, backgroundColor: theme.inputBg, color: theme.text }}
            >
              <Filter className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Métricas Principais */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-9 gap-4">
          <Card style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }} className="border-2 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <Package className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <span className="text-2xl font-bold" style={{ color: theme.textStrong }}>{metrics.totalOrdens}</span>
              </div>
              <p className="text-xs font-bold uppercase tracking-wide" style={{ color: theme.textMuted }}>
                Total Ordens
                <span className="block text-blue-600 dark:text-blue-400 mt-1">100%</span>
              </p>
            </CardContent>
          </Card>

          <Card style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }} className="border-2 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <FileText className="w-5 h-5 text-green-600 dark:text-green-400" />
                <span className="text-2xl font-bold text-green-600 dark:text-green-400">{metrics.ofertas}</span>
              </div>
              <p className="text-xs font-bold uppercase tracking-wide" style={{ color: theme.textMuted }}>
                Ofertas
                <span className="block text-green-600 dark:text-green-400 mt-1">
                  {metrics.totalOrdens > 0 ? ((metrics.ofertas / metrics.totalOrdens) * 100).toFixed(1) : 0}%
                </span>
              </p>
            </CardContent>
          </Card>

          <Card style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }} className="border-2 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <Users className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                <span className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{metrics.negociando}</span>
              </div>
              <p className="text-xs font-bold uppercase tracking-wide" style={{ color: theme.textMuted }}>
                Negociando
                <span className="block text-yellow-600 dark:text-yellow-400 mt-1">
                  {metrics.totalOrdens > 0 ? ((metrics.negociando / metrics.totalOrdens) * 100).toFixed(1) : 0}%
                </span>
              </p>
            </CardContent>
          </Card>

          <Card style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }} className="border-2 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <CheckCircle2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">{metrics.ordensCompletas}</span>
              </div>
              <p className="text-xs font-bold uppercase tracking-wide" style={{ color: theme.textMuted }}>
                Alocadas
                <span className="block text-blue-600 dark:text-blue-400 mt-1">
                  {metrics.totalOrdens > 0 ? ((metrics.ordensCompletas / metrics.totalOrdens) * 100).toFixed(1) : 0}%
                </span>
              </p>
            </CardContent>
          </Card>

          <Card style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }} className="border-2 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <MapPin className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                <span className="text-2xl font-bold text-purple-600 dark:text-purple-400">{metrics.emViagem}</span>
              </div>
              <p className="text-xs font-bold uppercase tracking-wide" style={{ color: theme.textMuted }}>
                Em Viagem
                <span className="block text-purple-600 dark:text-purple-400 mt-1">
                  {metrics.totalOrdens > 0 ? ((metrics.emViagem / metrics.totalOrdens) * 100).toFixed(1) : 0}%
                </span>
              </p>
            </CardContent>
          </Card>

          <Card style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }} className="border-2 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <Clock className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                <span className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{metrics.aguardando}</span>
              </div>
              <p className="text-xs font-bold uppercase tracking-wide" style={{ color: theme.textMuted }}>
                Aguardando
                <span className="block text-yellow-600 dark:text-yellow-400 mt-1">
                  {metrics.totalOrdens > 0 ? ((metrics.aguardando / metrics.totalOrdens) * 100).toFixed(1) : 0}%
                </span>
              </p>
            </CardContent>
          </Card>

          <Card style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }} className="border-2 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                <span className="text-2xl font-bold text-red-600 dark:text-red-400">{metrics.atrasadas}</span>
              </div>
              <p className="text-xs font-bold uppercase tracking-wide" style={{ color: theme.textMuted }}>
                Atrasadas
                <span className="block text-red-600 dark:text-red-400 mt-1">
                  {metrics.totalOrdens > 0 ? ((metrics.atrasadas / metrics.totalOrdens) * 100).toFixed(1) : 0}%
                </span>
              </p>
            </CardContent>
          </Card>

          <Card style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }} className="border-2 shadow-sm border-l-4 border-l-orange-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <TrendingUp className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                <span className="text-2xl font-bold text-orange-600 dark:text-orange-400">{metrics.atrasadasCarregamento}</span>
              </div>
              <p className="text-xs font-bold uppercase tracking-wide" style={{ color: theme.textMuted }}>
                Atraso Carga
                <span className="block text-orange-600 dark:text-orange-400 mt-1">
                  {metrics.totalOrdens > 0 ? ((metrics.atrasadasCarregamento / metrics.totalOrdens) * 100).toFixed(1) : 0}%
                </span>
              </p>
            </CardContent>
          </Card>

          <Card style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }} className="border-2 shadow-sm border-l-4 border-l-red-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <TrendingUp className="w-5 h-5 text-red-600 dark:text-red-400" />
                <span className="text-2xl font-bold text-red-600 dark:text-red-400">{metrics.atrasadasDescarga}</span>
              </div>
              <p className="text-xs font-bold uppercase tracking-wide" style={{ color: theme.textMuted }}>
                Atraso Descarga
                <span className="block text-red-600 dark:text-red-400 mt-1">
                  {metrics.totalOrdens > 0 ? ((metrics.atrasadasDescarga / metrics.totalOrdens) * 100).toFixed(1) : 0}%
                </span>
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Status por Operação */}
        {Object.keys(ordensDetalhadas.porOperacao).length > 0 && (
          <Card style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }} className="border-2 shadow-sm">
            <CardHeader className="border-b-2" style={{ borderBottomColor: theme.cardBorder }}>
              <CardTitle className="flex items-center gap-2 text-base font-bold" style={{ color: theme.textStrong }}>
                <Activity className="w-5 h-5 text-blue-600" />
                Status por Operação
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-3">
                {Object.entries(ordensDetalhadas.porOperacao).map(([operacao, stats]) => (
                  <div key={operacao} className="p-4 rounded-lg border-2" 
                    style={{ backgroundColor: theme.bgAlt, borderColor: theme.cardBorder }}>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-bold text-sm" style={{ color: theme.text }}>{operacao}</h3>
                      <div className="flex items-center gap-2">
                        <Badge className="bg-blue-600 text-white font-bold">
                          {stats.total} total
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setExpandedOperacao(expandedOperacao === operacao ? null : operacao)}
                          className="h-8 px-2"
                        >
                          <ChevronRight 
                            className={`w-4 h-4 transition-transform ${expandedOperacao === operacao ? 'rotate-90' : ''}`}
                            style={{ color: theme.textMuted }}
                          />
                        </Button>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-9 gap-2">
                      <div className="text-center p-2 rounded border" 
                        style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}>
                        <div className="text-base sm:text-lg font-bold" style={{ color: theme.textStrong }}>
                          {stats.total}
                        </div>
                        <div className="text-[9px] sm:text-[10px] font-semibold uppercase" style={{ color: theme.textMuted }}>
                          Total
                          <span className="block text-blue-600 dark:text-blue-400 mt-0.5">100%</span>
                        </div>
                      </div>
                      <div className="text-center p-2 rounded border" 
                        style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}>
                        <div className="text-base sm:text-lg font-bold text-green-600 dark:text-green-400">
                          {stats.ofertas}
                        </div>
                        <div className="text-[9px] sm:text-[10px] font-semibold uppercase" style={{ color: theme.textMuted }}>
                          Offer
                          <span className="block text-green-600 dark:text-green-400 mt-0.5">
                            {stats.total > 0 ? ((stats.ofertas / stats.total) * 100).toFixed(1) : 0}%
                          </span>
                        </div>
                      </div>
                      <div className="text-center p-2 rounded border" 
                        style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}>
                        <div className="text-base sm:text-lg font-bold text-yellow-600 dark:text-yellow-400">
                          {stats.negociando}
                        </div>
                        <div className="text-[9px] sm:text-[10px] font-semibold uppercase" style={{ color: theme.textMuted }}>
                          Negoc
                          <span className="block text-yellow-600 dark:text-yellow-400 mt-0.5">
                            {stats.total > 0 ? ((stats.negociando / stats.total) * 100).toFixed(1) : 0}%
                          </span>
                        </div>
                      </div>
                      <div className="text-center p-2 rounded border" 
                        style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}>
                        <div className="text-base sm:text-lg font-bold text-blue-600 dark:text-blue-400">
                          {stats.alocadas}
                        </div>
                        <div className="text-[9px] sm:text-[10px] font-semibold uppercase" style={{ color: theme.textMuted }}>
                          Aloc
                          <span className="block text-blue-600 dark:text-blue-400 mt-0.5">
                            {stats.total > 0 ? ((stats.alocadas / stats.total) * 100).toFixed(1) : 0}%
                          </span>
                        </div>
                      </div>
                      <div className="text-center p-2 rounded border" 
                        style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}>
                        <div className="text-base sm:text-lg font-bold text-purple-600 dark:text-purple-400">
                          {stats.emViagem}
                        </div>
                        <div className="text-[9px] sm:text-[10px] font-semibold uppercase" style={{ color: theme.textMuted }}>
                          Em Viag
                          <span className="block text-purple-600 dark:text-purple-400 mt-0.5">
                            {stats.total > 0 ? ((stats.emViagem / stats.total) * 100).toFixed(1) : 0}%
                          </span>
                        </div>
                      </div>
                      <div className="text-center p-2 rounded border" 
                        style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}>
                        <div className="text-base sm:text-lg font-bold text-yellow-600 dark:text-yellow-400">
                          {stats.aguardando}
                        </div>
                        <div className="text-[9px] sm:text-[10px] font-semibold uppercase" style={{ color: theme.textMuted }}>
                          Aguar
                          <span className="block text-yellow-600 dark:text-yellow-400 mt-0.5">
                            {stats.total > 0 ? ((stats.aguardando / stats.total) * 100).toFixed(1) : 0}%
                          </span>
                        </div>
                      </div>
                      <div className="text-center p-2 rounded border" 
                        style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}>
                        <div className="text-base sm:text-lg font-bold text-red-600 dark:text-red-400">
                          {stats.atrasadas}
                        </div>
                        <div className="text-[9px] sm:text-[10px] font-semibold uppercase" style={{ color: theme.textMuted }}>
                          Atraso
                          <span className="block text-red-600 dark:text-red-400 mt-0.5">
                            {stats.total > 0 ? ((stats.atrasadas / stats.total) * 100).toFixed(1) : 0}%
                          </span>
                        </div>
                      </div>
                      <div className="text-center p-2 rounded border" 
                        style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}>
                        <div className="text-base sm:text-lg font-bold text-green-600 dark:text-green-400">
                          {stats.finalizadas}
                        </div>
                        <div className="text-[9px] sm:text-[10px] font-semibold uppercase" style={{ color: theme.textMuted }}>
                          Final
                          <span className="block text-green-600 dark:text-green-400 mt-0.5">
                            {stats.total > 0 ? ((stats.finalizadas / stats.total) * 100).toFixed(1) : 0}%
                          </span>
                        </div>
                      </div>
                      <div className="text-center p-2 rounded border" 
                        style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}>
                        <div className="text-base sm:text-lg font-bold" style={{ color: theme.textStrong }}>
                          {stats.total > 0 ? Math.round((stats.finalizadas / stats.total) * 100) : 0}%
                        </div>
                        <div className="text-[9px] sm:text-[10px] font-semibold uppercase" style={{ color: theme.textMuted }}>
                          Taxa
                        </div>
                      </div>
                    </div>
                    
                    {expandedOperacao === operacao && stats.ordens.length > 0 && (
                      <div className="mt-4 space-y-2 max-h-96 overflow-y-auto">
                        <div className="text-xs font-bold uppercase" style={{ color: theme.textMuted }}>
                          Ordens ({stats.ordens.length})
                        </div>
                        {stats.ordens.map((ordem) => {
                          const motorista = motoristas.find(m => m.id === ordem.motorista_id);
                          const cavalo = veiculos.find(v => v.id === ordem.cavalo_id);
                          const isOferta = ordem.tipo_registro === "oferta";
                          const isNegociando = ordem.tipo_registro === "negociando";
                          
                          return (
                            <div 
                              key={ordem.id}
                              className="flex items-center justify-between p-2 rounded border hover:shadow-sm transition-shadow"
                              style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}
                            >
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <Badge className={`text-xs h-5 px-2 font-bold ${
                                    isOferta 
                                      ? "bg-green-600 text-white" 
                                      : isNegociando
                                      ? "bg-yellow-600 text-white"
                                      : "bg-blue-600 text-white"
                                  }`}>
                                    {isOferta ? "Oferta" : isNegociando ? "Negociando" : "Alocado"}
                                  </Badge>
                                  <span className="text-sm font-bold" style={{ color: theme.text }}>
                                    {ordem.numero_carga || `#${ordem.id.slice(-6)}`}
                                  </span>
                                </div>
                                <div className="text-xs truncate" style={{ color: theme.textMuted }}>
                                  {ordem.cliente} • {ordem.origem} → {ordem.destino}
                                </div>
                                {motorista && (
                                  <div className="text-xs mt-0.5" style={{ color: theme.textMuted }}>
                                    <User className="w-3 h-3 inline mr-1" />
                                    {motorista.nome?.split(' ')[0]}
                                    {cavalo && ` • ${cavalo.placa}`}
                                  </div>
                                )}
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditOrdem(ordem)}
                                className="ml-2 h-8 px-2 flex-shrink-0"
                                title="Editar ordem"
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Gráficos de Volume - Compactos lado a lado */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Volume Mensal */}
          <Card style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }} className="border-2 shadow-sm">
            <CardHeader className="border-b-2 pb-3" style={{ borderBottomColor: theme.cardBorder }}>
              <CardTitle className="flex items-center gap-2 text-sm font-bold" style={{ color: theme.textStrong }}>
                <Calendar className="w-4 h-4 text-purple-600" />
                Volume Mensal - 6 Meses
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={volumeMensal}>
                  <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#334155' : '#e5e7eb'} />
                  <XAxis 
                    dataKey="mes" 
                    tick={{ fill: theme.textMuted, fontSize: 10, fontWeight: 600 }}
                  />
                  <YAxis 
                    tick={{ fill: theme.textMuted, fontSize: 10, fontWeight: 600 }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: theme.cardBg, 
                      border: `2px solid ${theme.cardBorder}`,
                      borderRadius: '8px',
                      fontWeight: 600,
                      fontSize: '12px'
                    }}
                    labelStyle={{ color: theme.textStrong, fontWeight: 'bold' }}
                  />
                  <Bar dataKey="ordens" fill="#3b82f6" name="Ordens" radius={[0, 0, 0, 0]} stackId="stack" />
                  <Bar dataKey="processos" fill="#10b981" name="Processos" radius={[0, 0, 0, 0]} stackId="stack" />
                  <Bar dataKey="ocorrencias" fill="#f59e0b" name="Ocorrências" radius={[8, 8, 0, 0]} stackId="stack" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* NOVO: Ofertas vs Alocadas com Tabs */}
        <Card style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }} className="border-2 shadow-sm">
          <CardHeader className="border-b-2" style={{ borderBottomColor: theme.cardBorder }}>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-base font-bold" style={{ color: theme.textStrong }}>
                <Target className="w-5 h-5 text-green-600" />
                Ofertas vs Negociando vs Alocadas - Geral (por Data de Carregamento)
              </CardTitle>
              <Tabs value={viewMode} onValueChange={setViewMode} className="w-auto">
                <TabsList style={{ backgroundColor: isDark ? '#0f172a' : '#f3f4f6' }}>
                  <TabsTrigger value="proximos7" className="text-xs">Próximos 7 Dias</TabsTrigger>
                  <TabsTrigger value="mesAtual" className="text-xs">Mês Atual</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            {dadosGrafico.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={dadosGrafico}>
                  <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#334155' : '#e5e7eb'} />
                  <XAxis 
                    dataKey="data" 
                    tick={{ fill: theme.textMuted, fontSize: 10, fontWeight: 600 }}
                    angle={viewMode === "mesAtual" ? -45 : 0}
                    textAnchor={viewMode === "mesAtual" ? "end" : "middle"}
                    height={viewMode === "mesAtual" ? 60 : 30}
                  />
                  <YAxis 
                    tick={{ fill: theme.textMuted, fontSize: 10, fontWeight: 600 }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: theme.cardBg, 
                      border: `2px solid ${theme.cardBorder}`,
                      borderRadius: '8px',
                      fontWeight: 600
                    }}
                    labelStyle={{ color: theme.textStrong, fontWeight: 'bold' }}
                  />
                  <Bar dataKey="ofertas" fill="#10b981" name="Ofertas" radius={[0, 0, 0, 0]} stackId="stack" />
                  <Bar dataKey="negociando" fill="#eab308" name="Negociando" radius={[0, 0, 0, 0]} stackId="stack" />
                  <Bar dataKey="alocadas" fill="#3b82f6" name="Alocadas" radius={[8, 8, 0, 0]} stackId="stack" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-12" style={{ color: theme.textMuted }}>
                <Package className="w-12 h-12 mx-auto mb-3 opacity-20" />
                <p className="font-medium">Nenhuma ordem com data de carregamento no período</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* NOVO: Ofertas vs Alocadas - Por Operação */}
        {Object.keys(dadosPorOperacao).length > 0 && (
          <div className="space-y-6">
            {Object.entries(dadosPorOperacao).map(([operacao, dados]) => (
              <Card key={operacao} style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }} className="border-2 shadow-sm">
                <CardHeader className="border-b-2" style={{ borderBottomColor: theme.cardBorder }}>
                  <CardTitle className="flex items-center gap-2 text-base font-bold" style={{ color: theme.textStrong }}>
                    <Activity className="w-5 h-5 text-purple-600" />
                    Ofertas vs Negociando vs Alocadas - {operacao}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  {dados.length > 0 ? (
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={dados}>
                        <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#334155' : '#e5e7eb'} />
                        <XAxis 
                          dataKey="data" 
                          tick={{ fill: theme.textMuted, fontSize: 10, fontWeight: 600 }}
                          angle={viewMode === "mesAtual" ? -45 : 0}
                          textAnchor={viewMode === "mesAtual" ? "end" : "middle"}
                          height={viewMode === "mesAtual" ? 60 : 30}
                        />
                        <YAxis 
                          tick={{ fill: theme.textMuted, fontSize: 10, fontWeight: 600 }}
                        />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: theme.cardBg, 
                            border: `2px solid ${theme.cardBorder}`,
                            borderRadius: '8px',
                            fontWeight: 600
                          }}
                          labelStyle={{ color: theme.textStrong, fontWeight: 'bold' }}
                        />
                        <Bar dataKey="ofertas" fill="#10b981" name="Ofertas" radius={[0, 0, 0, 0]} stackId="stack" />
                        <Bar dataKey="negociando" fill="#eab308" name="Negociando" radius={[0, 0, 0, 0]} stackId="stack" />
                        <Bar dataKey="alocadas" fill="#3b82f6" name="Alocadas" radius={[8, 8, 0, 0]} stackId="stack" />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="text-center py-8" style={{ color: theme.textMuted }}>
                      <Package className="w-10 h-10 mx-auto mb-2 opacity-20" />
                      <p className="font-medium">Nenhuma ordem para esta operação no período.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Dashboard de Ordens Detalhado */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Origens e Destinos */}
          <Card style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }} className="border-2 shadow-sm">
            <CardHeader className="border-b-2" style={{ borderBottomColor: theme.cardBorder }}>
              <CardTitle className="flex items-center gap-2 text-base font-bold" style={{ color: theme.textStrong }}>
                <MapPin className="w-5 h-5 text-blue-600" />
                Top Rotas
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide mb-2" style={{ color: theme.textMuted }}>
                    Top 5 Origens
                  </p>
                  <div className="space-y-2">
                    {ordensDetalhadas.topOrigens.map(([origem, count], idx) => (
                      <div key={origem} className="flex items-center justify-between p-2 rounded-lg border" 
                        style={{ backgroundColor: theme.bgAlt, borderColor: theme.cardBorder }}>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center">
                            {idx + 1}
                          </span>
                          <span className="text-sm font-bold" style={{ color: theme.text }}>{origem}</span>
                        </div>
                        <Badge className="bg-blue-600 text-white font-bold">{count}</Badge>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-xs font-bold uppercase tracking-wide mb-2" style={{ color: theme.textMuted }}>
                    Top 5 Destinos
                  </p>
                  <div className="space-y-2">
                    {ordensDetalhadas.topDestinos.map(([destino, count], idx) => (
                      <div key={destino} className="flex items-center justify-between p-2 rounded-lg border" 
                        style={{ backgroundColor: theme.bgAlt, borderColor: theme.cardBorder }}>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold w-5 h-5 rounded-full bg-purple-600 text-white flex items-center justify-center">
                            {idx + 1}
                          </span>
                          <span className="text-sm font-bold" style={{ color: theme.text }}>{destino}</span>
                        </div>
                        <Badge className="bg-purple-600 text-white font-bold">{count}</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Por Frota e Modalidade */}
          <Card style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }} className="border-2 shadow-sm">
            <CardHeader className="border-b-2" style={{ borderBottomColor: theme.cardBorder }}>
              <CardTitle className="flex items-center gap-2 text-base font-bold" style={{ color: theme.textStrong }}>
                <Truck className="w-5 h-5 text-green-600" />
                Distribuição de Ordens
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide mb-2" style={{ color: theme.textMuted }}>
                    Por Tipo de Frota
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(ordensDetalhadas.porFrota).map(([frota, count]) => (
                      <div key={frota} className="p-3 rounded-lg border-2" 
                        style={{ backgroundColor: theme.bgAlt, borderColor: theme.cardBorder }}>
                        <div className="flex items-center gap-2 mb-1">
                          <Truck className="w-4 h-4 text-green-600" />
                          <span className="text-lg font-bold" style={{ color: theme.textStrong }}>{count}</span>
                        </div>
                        <p className="text-xs font-bold uppercase tracking-wide capitalize" style={{ color: theme.textMuted }}>
                          {frota}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-xs font-bold uppercase tracking-wide mb-2" style={{ color: theme.textMuted }}>
                    Por Modalidade
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    {Object.entries(ordensDetalhadas.porModalidade).map(([modalidade, count]) => (
                      <div key={modalidade} className="p-3 rounded-lg border-2" 
                        style={{ backgroundColor: theme.bgAlt, borderColor: theme.cardBorder }}>
                        <span className="text-lg font-bold block mb-1" style={{ color: theme.textStrong }}>{count}</span>
                        <p className="text-xs font-bold uppercase tracking-wide capitalize" style={{ color: theme.textMuted }}>
                          {modalidade === 'normal' ? 'Normal' : modalidade === 'prioridade' ? 'Prior.' : 'Expr.'}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tracking e Workflow */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Status Tracking */}
          <Card style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }} className="border-2 shadow-sm">
            <CardHeader className="border-b-2" style={{ borderBottomColor: theme.cardBorder }}>
              <CardTitle className="flex items-center gap-2 text-base font-bold" style={{ color: theme.textStrong }}>
                <MapPin className="w-5 h-5 text-purple-600" />
                Status de Tracking
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              {Object.keys(insights.statusTracking).length > 0 ? (
                <div className="space-y-3">
                  {Object.entries(insights.statusTracking).map(([status, count]) => (
                    <div key={status} className="flex items-center justify-between p-3 rounded-lg border-2" 
                      style={{ backgroundColor: theme.bgAlt, borderColor: theme.cardBorder }}>
                      <span className="text-sm font-bold capitalize" style={{ color: theme.text }}>
                        {status.replace(/_/g, ' ')}
                      </span>
                      <Badge className="bg-purple-600 text-white font-bold text-sm">
                        {count}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-sm font-semibold py-8" style={{ color: theme.textMuted }}>
                  Nenhum dado disponível
                </p>
              )}
            </CardContent>
          </Card>

          {/* Workflow */}
          <Card style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }} className="border-2 shadow-sm">
            <CardHeader className="border-b-2" style={{ borderBottomColor: theme.cardBorder }}>
              <CardTitle className="flex items-center gap-2 text-base font-bold" style={{ color: theme.textStrong }}>
                <Workflow className="w-5 h-5 text-blue-600" />
                Fluxo de Processos
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="p-3 rounded-lg border-2" 
                  style={{ backgroundColor: theme.bgAlt, borderColor: theme.cardBorder }}>
                  <div className="flex items-center gap-2 mb-1">
                    <Clock className="w-4 h-4 text-yellow-600" />
                    <span className="text-lg font-bold" style={{ color: theme.textStrong }}>
                      {metrics.etapasEmAndamento}
                    </span>
                  </div>
                  <p className="text-xs font-bold uppercase tracking-wide" style={{ color: theme.textMuted }}>
                    Em Andamento
                  </p>
                </div>

                <div className="p-3 rounded-lg border-2" 
                  style={{ backgroundColor: theme.bgAlt, borderColor: theme.cardBorder }}>
                  <div className="flex items-center gap-2 mb-1">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    <span className="text-lg font-bold" style={{ color: theme.textStrong }}>
                      {metrics.etapasConcluidas}
                    </span>
                  </div>
                  <p className="text-xs font-bold uppercase tracking-wide" style={{ color: theme.textMuted }}>
                    Concluídas
                  </p>
                </div>

                <div className="p-3 rounded-lg border-2" 
                  style={{ backgroundColor: theme.bgAlt, borderColor: theme.cardBorder }}>
                  <div className="flex items-center gap-2 mb-1">
                    <XCircle className="w-4 h-4 text-red-600" />
                    <span className="text-lg font-bold" style={{ color: theme.textStrong }}>
                      {metrics.etapasBloqueadas}
                    </span>
                  </div>
                  <p className="text-xs font-bold uppercase tracking-wide" style={{ color: theme.textMuted }}>
                    Bloqueadas
                  </p>
                </div>
              </div>

              {Object.keys(insights.etapasStats).length > 0 && (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {Object.entries(insights.etapasStats).map(([etapa, stats]) => (
                    <div key={etapa} className="p-2 rounded border" 
                      style={{ backgroundColor: theme.bgAlt, borderColor: theme.cardBorder }}>
                      <p className="text-xs font-bold mb-1" style={{ color: theme.text }}>{etapa}</p>
                      <div className="flex gap-2 text-[10px] font-semibold">
                        <span style={{ color: theme.textMuted }}>
                          {stats.em_andamento} em andamento
                        </span>
                        <span style={{ color: theme.textMuted }}>•</span>
                        <span style={{ color: theme.textMuted }}>
                          {stats.concluida} concluídas
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Ocorrências e Operações */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Ocorrências */}
          <Card style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }} className="border-2 shadow-sm">
            <CardHeader className="border-b-2" style={{ borderBottomColor: theme.cardBorder }}>
              <CardTitle className="flex items-center gap-2 text-base font-bold" style={{ color: theme.textStrong }}>
                <Shield className="w-5 h-5 text-orange-600" />
                Ocorrências Abertas
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg border-2" 
                  style={{ backgroundColor: theme.bgAlt, borderColor: theme.cardBorder }}>
                  <div className="flex items-center gap-2 mb-1">
                    <AlertCircle className="w-4 h-4 text-orange-600" />
                    <span className="text-2xl font-bold" style={{ color: theme.textStrong }}>
                      {metrics.ocorrenciasAbertas}
                    </span>
                  </div>
                  <p className="text-xs font-bold uppercase tracking-wide" style={{ color: theme.textMuted }}>
                    Total Abertas
                  </p>
                </div>

                <div className="p-3 rounded-lg border-2" 
                  style={{ backgroundColor: theme.bgAlt, borderColor: theme.cardBorder }}>
                  <div className="flex items-center gap-2 mb-1">
                    <AlertCircle className="w-4 h-4 text-red-600" />
                    <span className="text-2xl font-bold text-red-600 dark:text-red-400">
                      {metrics.ocorrenciasCriticas}
                    </span>
                  </div>
                  <p className="text-xs font-bold uppercase tracking-wide" style={{ color: theme.textMuted }}>
                    Críticas
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Operações */}
          <Card style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }} className="border-2 shadow-sm">
            <CardHeader className="border-b-2" style={{ borderBottomColor: theme.cardBorder }}>
              <CardTitle className="flex items-center gap-2 text-base font-bold" style={{ color: theme.textStrong }}>
                <Activity className="w-5 h-5 text-blue-600" />
                Por Operação
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              {Object.keys(insights.operacoesStats).length > 0 ? (
                <div className="space-y-2">
                  {Object.entries(insights.operacoesStats).map(([operacao, count]) => (
                    <div key={operacao} className="flex items-center justify-between p-3 rounded-lg border-2" 
                      style={{ backgroundColor: theme.bgAlt, borderColor: theme.cardBorder }}>
                      <span className="text-sm font-bold" style={{ color: theme.text }}>
                        {operacao}
                      </span>
                      <Badge className="bg-blue-600 text-white font-bold">
                        {count}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-sm font-semibold py-8" style={{ color: theme.textMuted }}>
                  Nenhuma operação ativa
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <FilterModal
        open={showFilters}
        onClose={() => setShowFilters(false)}
        filters={filters}
        onFiltersChange={setFilters}
        motoristas={motoristas}
        etapas={etapas}
        operacoes={operacoes}
      />

      {showQuickEdit && selectedOrdemForEdit && (
        <QuickEditOrdem
          open={showQuickEdit}
          onClose={() => {
            setShowQuickEdit(false);
            setSelectedOrdemForEdit(null);
          }}
          ordem={selectedOrdemForEdit}
          motoristas={motoristas}
          veiculos={veiculos}
          onUpdate={loadData}
        />
      )}
    </div>
  );
}