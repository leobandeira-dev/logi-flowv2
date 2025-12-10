import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  MapPin,
  Search,
  Filter,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Truck,
  Calendar,
  Download,
  RefreshCw,
  Table,
  FileSpreadsheet,
  Package,
  User,
  Loader2,
  ChevronDown,
  BarChart3,
  Printer
} from "lucide-react";
import { format, differenceInDays, differenceInHours } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import TrackingTable from "../components/tracking/TrackingTable";
import TrackingUpdateModal from "../components/tracking/TrackingUpdateModal";
import OrdemDetails from "../components/ordens/OrdemDetails";
import OrdemFormCompleto from "../components/ordens/OrdemFormCompleto";
import ChatCentral from "../components/tracking/ChatCentral";
import UploadDocumentos from "../components/motorista-app/UploadDocumentos";
import PlanilhaView from "../components/tracking/PlanilhaView";
import FiltrosPredefinidos from "../components/filtros/FiltrosPredefinidos";
import PaginacaoControles from "../components/filtros/PaginacaoControles";
import ExpurgoModal from "../components/tracking/ExpurgoModal";
import FiltroDataPeriodo from "../components/filtros/FiltroDataPeriodo";

const statusTrackingConfig = {
  aguardando_agendamento: { label: "Aguardando Agendamento", color: "bg-gray-500", icon: Clock },
  carregamento_agendado: { label: "Carregamento Agendado", color: "bg-blue-500", icon: Calendar },
  em_carregamento: { label: "Em Carregamento", color: "bg-yellow-500", icon: TrendingUp },
  carregado: { label: "Carregado", color: "bg-green-500", icon: CheckCircle2 },
  em_viagem: { label: "Em Viagem", color: "bg-purple-500", icon: Truck },
  chegada_destino: { label: "Chegada no Destino", color: "bg-indigo-500", icon: MapPin },
  descarga_agendada: { label: "Descarga Agendada", color: "bg-blue-600", icon: Calendar },
  em_descarga: { label: "Em Descarga", color: "bg-orange-500", icon: TrendingUp },
  descarga_realizada: { label: "Descarga Realizada", color: "bg-green-600", icon: CheckCircle2 },
  finalizado: { label: "Finalizado", color: "bg-gray-600", icon: CheckCircle2 }
};

export default function Tracking() {
  const [ordens, setOrdens] = useState([]);
  const [motoristas, setMotoristas] = useState([]);
  const [veiculos, setVeiculos] = useState([]);
  const [operacoes, setOperacoes] = useState([]);
  const [usuarios, setUsuarios] = useState([]); // Added state for users
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState("all");
  const [viewType, setViewType] = useState("table");
  const [selectedOrdem, setSelectedOrdem] = useState(null);
  const [editingOrdem, setEditingOrdem] = useState(null);
  const [editingOrdemCompleta, setEditingOrdemCompleta] = useState(null);
  const [limite, setLimite] = useState(50);
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [exportando, setExportando] = useState(false);
  const [periodoSelecionado, setPeriodoSelecionado] = useState("");
  const [filters, setFilters] = useState({
    statusTracking: "",
    origem: "",
    destino: "",
    dataInicio: "",
    dataFim: "",
    frota: "",
    operacoesIds: [],
    modalidadeCarga: "",
    tiposOrdem: [],
    diariaCarregamento: "",
    diariaDescarga: "",
    tipoRegistro: "",
    tiposOrdemFiltro: ["carregamento"]
  });
  const [showFilters, setShowFilters] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [chatOrdem, setChatOrdem] = useState(null);
  const [uploadOrdem, setUploadOrdem] = useState(null);
  const [showInsights, setShowInsights] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [ordemIdFromUrl, setOrdemIdFromUrl] = useState(null);
  const [showTrackingModal, setShowTrackingModal] = useState(false);
  const [selectedOrdemForExpurgo, setSelectedOrdemForExpurgo] = useState(null);
  const [tipoExpurgo, setTipoExpurgo] = useState(null);
  const [showExpurgoModal, setShowExpurgoModal] = useState(false);
  const [showRelatorioSLA, setShowRelatorioSLA] = useState(false);
  const [tipoRelatorioSLA, setTipoRelatorioSLA] = useState(null);

  // Detect dark mode changes
  useEffect(() => {
    const checkDarkMode = () => {
      setIsDark(document.documentElement.classList.contains('dark'));
    };

    checkDarkMode();

    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });

    return () => observer.disconnect();
  }, []);

  // Initial load data and parse URL param
  useEffect(() => {
    loadData();

    const urlParams = new URLSearchParams(window.location.search);
    const ordemId = urlParams.get('id');
    if (ordemId) {
      setOrdemIdFromUrl(ordemId); // Store the ID to be processed after data is loaded
    }
  }, []);

  // Process URL parameter once ordens are loaded
  useEffect(() => {
    if (ordemIdFromUrl && ordens.length > 0 && selectedOrdem === null) {
      const ordem = ordens.find(o => o.id === ordemIdFromUrl);
      if (ordem) {
        setSelectedOrdem(ordem);
        setShowTrackingModal(true); // As requested in the outline
      }
    }
  }, [ordemIdFromUrl, ordens, selectedOrdem]); // Dependencies ensure this runs after ordens are set

  const loadData = async () => {
    setLoading(true);
    try {
      const user = await base44.auth.me();

      const [ordensData, motoristasData, veiculosData, operacoesData] = await Promise.all([
        base44.entities.OrdemDeCarregamento.list("-data_solicitacao"),
        base44.entities.Motorista.list(),
        base44.entities.Veiculo.list(),
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
      
      // Debug: verificar tipos de ordem presentes
      const tiposPresentes = new Set(ordensData.map(o => o.tipo_ordem).filter(Boolean));
      const ordemsSemTipo = ordensData.filter(o => !o.tipo_ordem);
      console.log('🔍 Tipos de ordem encontrados:', Array.from(tiposPresentes));
      console.log('⚠️ Ordens SEM tipo_ordem:', ordemsSemTipo.length);
      console.log('📊 Amostra de ordens SEM tipo_ordem:', ordemsSemTipo.slice(0, 5).map(o => ({
        id: o.id.slice(-6),
        numero_carga: o.numero_carga,
        numero_coleta: o.numero_coleta,
        tipo_ordem: o.tipo_ordem,
        tipo_registro: o.tipo_registro
      })));
      console.log('📊 Ordens REC específicas:', ordensData.filter(o => 
        o.numero_carga?.startsWith('REC') || o.numero_coleta?.startsWith('REC')
      ).slice(0, 3).map(o => ({
        numero: o.numero_carga || o.numero_coleta,
        tipo_ordem: o.tipo_ordem,
        tipo_registro: o.tipo_registro
      })));
      
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

      const ordensEnriquecidas = ordensFiltradas.map(ordem => {
        const operacao = operacoesData.find(op => op.id === ordem.operacao_id);
        return {
          ...ordem,
          operacao_tolerancia_horas: operacao?.tolerancia_horas || 0
        };
      });

      setOrdens(ordensEnriquecidas);
      setMotoristas(motoristasData);
      setVeiculos(veiculosData);
      setOperacoes(operacoesData.filter(op => op.ativo));
      setUsuarios(usuariosData); // Set the loaded users data
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      toast.error("Erro ao carregar dados do tracking");
    } finally {
      setLoading(false);
    }
  };

  const calcularMetricas = (ordensBase) => {
    const emViagem = ordensBase.filter(o => o.status_tracking === "em_viagem");
    const aguardandoCarregamento = ordensBase.filter(o =>
      o.status_tracking === "aguardando_agendamento" ||
      o.status_tracking === "carregamento_agendado"
    );
    const finalizadas = ordensBase.filter(o => o.status_tracking === "finalizado");

    const atrasadas = ordensBase.filter(o => {
      if (o.status_tracking === "finalizado") return false;

      if (o.prazo_entrega && !o.descarga_realizada_data) {
        const prazoEntrega = new Date(o.prazo_entrega);
        const hoje = new Date();
        return hoje > prazoEntrega;
      }

      return false;
    });

    // Calcular SLA de carregamento - INCLUINDO expurgados como "No Prazo"
    // Se fim_carregamento vazio, usar data atual de SP
    const getDataAtualSP = () => {
      return new Date(new Date().toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' }));
    };
    
    const carregamentosRealizados = ordensBase.filter(o => 
      o.carregamento_agendamento_data
    );
    const carregamentosNoPrazo = carregamentosRealizados.filter(o => {
      // Se foi expurgado, contar como "No Prazo"
      if (o.carregamento_expurgado) return true;
      
      const agendado = new Date(o.carregamento_agendamento_data);
      // Se entrada_galpao vazio, usar data atual
      const realizado = o.entrada_galpao 
        ? new Date(o.entrada_galpao)
        : getDataAtualSP();
      return realizado <= agendado;
    });

    // Calcular SLA de descarga - INCLUINDO expurgados como "No Prazo"
    // Se chegada_destino vazio, usar data atual de SP
    const descargasRealizadas = ordensBase.filter(o => 
      o.prazo_entrega
    );
    const descargasNoPrazo = descargasRealizadas.filter(o => {
      // Se foi expurgado, contar como "No Prazo"
      if (o.entrega_expurgada) return true;
      
      const prazo = new Date(o.prazo_entrega);
      // Se chegada_destino vazio, usar data atual
      const realizado = o.chegada_destino 
        ? new Date(o.chegada_destino)
        : getDataAtualSP();
      return realizado <= prazo;
    });

    return {
      total: ordensBase.length,
      emViagem: emViagem.length,
      aguardandoCarregamento: aguardandoCarregamento.length,
      atrasadas: atrasadas.length,
      finalizadas: finalizadas.length,
      carregamentosRealizados: carregamentosRealizados.length,
      carregamentosNoPrazo: carregamentosNoPrazo.length,
      carregamentosForaPrazo: carregamentosRealizados.length - carregamentosNoPrazo.length,
      descargasRealizadas: descargasRealizadas.length,
      descargasNoPrazo: descargasNoPrazo.length,
      descargasForaPrazo: descargasRealizadas.length - descargasNoPrazo.length
    };
  };

  const tailwindColorToHex = (tailwindClass) => {
    const colorMap = {
      "bg-gray-500": "#6B7280",
      "bg-blue-500": "#3B82F6",
      "bg-yellow-500": "#F59E0B",
      "bg-green-500": "#10B981",
      "bg-purple-500": "#8B5CF6",
      "bg-indigo-500": "#6366F1",
      "bg-blue-600": "#2563EB",
      "bg-orange-500": "#F97316",
      "bg-green-600": "#059669",
      "bg-gray-600": "#4B5563",
      "bg-red-500": "#EF4444",
      "bg-cyan-500": "#06B6D4",
    };
    return colorMap[tailwindClass] || "#6B7280";
  };

  const calcularInsights = () => {
    const distribuicaoPorStatus = {};
    Object.keys(statusTrackingConfig).forEach(status => {
      distribuicaoPorStatus[status] = ordens.filter(o => o.status_tracking === status).length;
    });

    const calcularTempoMedio = (campoInicio, campoFim) => {
      const ordensComDates = ordens.filter(o => o[campoInicio] && o[campoFim]);
      if (ordensComDates.length === 0) return null;

      const totalDias = ordensComDates.reduce((sum, o) => {
        const inicio = new Date(o[campoInicio]);
        const fim = new Date(o[campoFim]);
        const diff = differenceInDays(fim, inicio);
        return sum + (diff >= 0 ? diff : 0);
      }, 0);

      return (totalDias / ordensComDates.length).toFixed(1);
    };

    const ordensFinalizadas = ordens.filter(o => o.status_tracking === "finalizado");
    const ordensNoPrazo = ordensFinalizadas.filter(o => {
      if (!o.data_programacao_descarga || !o.descarga_realizada_data) return false;
      return new Date(o.descarga_realizada_data) <= new Date(o.data_programacao_descarga);
    });
    const percentualNoPrazo = ordensFinalizadas.length > 0
      ? Math.round((ordensNoPrazo.length / ordensFinalizadas.length) * 100)
      : 0;

    const distribuicaoPorOrigem = {};
    ordens.forEach(o => {
      const origem = o.origem_cidade || o.origem || "Não informado";
      distribuicaoPorOrigem[origem] = (distribuicaoPorOrigem[origem] || 0) + 1;
    });
    const topOrigens = Object.entries(distribuicaoPorOrigem)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    const distribuicaoPorDestino = {};
    ordens.forEach(o => {
      const destino = o.destino_cidade || o.destino || "Não informado";
      distribuicaoPorDestino[destino] = (distribuicaoPorDestino[destino] || 0) + 1;
    });
    const topDestinos = Object.entries(distribuicaoPorDestino)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    const ordensComKM = ordens.filter(o => o.km_faltam && o.status_tracking === "em_viagem");
    const kmMedio = ordensComKM.length > 0
      ? Math.round(ordensComKM.reduce((sum, o) => sum + o.km_faltam, 0) / ordensComKM.length)
      : 0;

    const ordensComPeso = ordens.filter(o => o.peso);
    const pesoMedio = ordensComPeso.length > 0
      ? Math.round((ordensComPeso.reduce((sum, o) => sum + o.peso, 0) / ordensComPeso.length) / 1000)
      : 0;

    const distribuicaoPorMotorista = {};
    ordens.forEach(o => {
      if (o.motorista_id) {
        const motorista = motoristas.find(m => m.id === o.motorista_id);
        const nome = motorista?.nome || "Desconhecido";
        distribuicaoPorMotorista[nome] = (distribuicaoPorMotorista[nome] || 0) + 1;
      }
    });
    const topMotoristas = Object.entries(distribuicaoPorMotorista)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    return {
      distribuicaoPorStatus,
      tempoMedioCarregamento: calcularTempoMedio('inicio_carregamento', 'fim_carregamento'),
      tempoMedioViagem: calcularTempoMedio('saida_unidade', 'chegada_destino'),
      tempoMedioDescarga: calcularTempoMedio('inicio_descarregamento', 'fim_descarregamento'),
      percentualNoPrazo,
      ordensNoPrazo: ordensNoPrazo.length,
      ordensForaDoPrazo: ordensFinalizadas.length - ordensNoPrazo.length,
      topOrigens,
      topDestinos,
      kmMedio,
      pesoMedio,
      topMotoristas
    };
  };

  const calcularDiariaCarregamento = (ordem) => {
    const dataInicio = ordem.carregamento_agendamento_data && ordem.inicio_carregamento
      ? new Date(Math.max(new Date(ordem.carregamento_agendamento_data), new Date(ordem.inicio_carregamento)))
      : (ordem.carregamento_agendamento_data ? new Date(ordem.carregamento_agendamento_data) :
         (ordem.inicio_carregamento ? new Date(ordem.inicio_carregamento) : null));

    const dataFim = ordem.fim_carregamento ? new Date(ordem.fim_carregamento) : null;

    if (dataInicio && dataFim) {
      const diffMs = dataFim - dataInicio;
      const diffHoras = diffMs / (1000 * 60 * 60);
      const tolerancia = ordem.operacao_tolerancia_horas || 0;
      return Math.max(0, diffHoras - tolerancia);
    }
    return null;
  };

  const calcularDiariaDescarga = (ordem) => {
    const dataInicio = ordem.chegada_destino && ordem.descarga_agendamento_data
      ? new Date(Math.max(new Date(ordem.chegada_destino), new Date(ordem.descarga_agendamento_data)))
      : (ordem.chegada_destino ? new Date(ordem.chegada_destino) :
         (ordem.descarga_agendamento_data ? new Date(ordem.descarga_agendamento_data) : null));

    const dataFim = ordem.descarga_realizada_data ? new Date(ordem.descarga_realizada_data) : null;

    if (dataInicio && dataFim) {
      const diffMs = dataFim - dataInicio;
      const diffHoras = diffMs / (1000 * 60 * 60);
      const tolerancia = ordem.operacao_tolerancia_horas || 0;
      return Math.max(0, diffHoras - tolerancia);
    }
    return null;
  };

  const filteredOrdens = ordens.filter(ordem => {
    // REGRA: Excluir coletas não aprovadas
    if (ordem.tipo_registro === "coleta_solicitada" || ordem.tipo_registro === "coleta_reprovada") {
      return false;
    }

    // Filtro por tipo de ordem (carregamento, coleta, recebimento, entrega)
    if (filters.tiposOrdemFiltro && filters.tiposOrdemFiltro.length > 0) {
      // Determinar o tipo da ordem (prioridade: tipo_ordem > inferência por padrões)
      let tipoFinal = ordem.tipo_ordem;
      
      // Se não tem tipo_ordem preenchido, inferir baseado em regras
      if (!tipoFinal) {
        // Regra 1: Se tem numero_coleta, é coleta
        if (ordem.numero_coleta && ordem.numero_coleta.startsWith("COL-")) {
          tipoFinal = "coleta";
        }
        // Regra 2: Se numero_carga começa com REC-, é recebimento
        else if (ordem.numero_carga?.startsWith("REC-")) {
          tipoFinal = "recebimento";
        }
        // Regra 3: Se numero_carga começa com ENT-, é entrega
        else if (ordem.numero_carga?.startsWith("ENT-")) {
          tipoFinal = "entrega";
        }
        // Regra 4: Verificar tipo_registro legado
        else if (ordem.tipo_registro === "coleta_solicitada" || ordem.tipo_registro === "coleta_aprovada" || ordem.tipo_registro === "coleta_reprovada") {
          tipoFinal = "coleta";
        }
        else if (ordem.tipo_registro === "recebimento") {
          tipoFinal = "recebimento";
        }
        else if (ordem.tipo_registro === "ordem_entrega") {
          tipoFinal = "entrega";
        }
        // Regra 5: Default é carregamento (ordens normais)
        else {
          tipoFinal = "carregamento";
        }
      }
      
      // Verificar se o tipo final está no filtro selecionado
      if (!filters.tiposOrdemFiltro.includes(tipoFinal)) {
        return false;
      }
    }

    // Filtro tipo: coleta ou ordem de carga (DEPRECADO - mantido para compatibilidade)
    if (filters.tipoRegistro && filters.tipoRegistro !== "") {
      if (filters.tipoRegistro === "coleta" && ordem.tipo_registro !== "coleta_aprovada") {
        return false;
      }
      if (filters.tipoRegistro === "ordem" && ordem.tipo_registro === "coleta_aprovada") {
        return false;
      }
    }

    if (filters.tiposOrdem && filters.tiposOrdem.length > 0) {
      let tipoOrdem = ordem.tipo_registro;
      
      if (!tipoOrdem) {
        const temMotorista = !!ordem.motorista_id;
        const temVeiculo = !!ordem.cavalo_id;
        
        if (!temMotorista && !temVeiculo) {
          tipoOrdem = "oferta";
        } else if (temMotorista && !temVeiculo) {
          tipoOrdem = "negociando";
        } else if (temMotorista && temVeiculo) {
          tipoOrdem = "ordem_completa";
        } else {
          tipoOrdem = "oferta";
        }
      }

      const tipoNormalizado = tipoOrdem === "ordem_completa" ? "alocado" : tipoOrdem;
      const tiposFiltrados = filters.tiposOrdem.map(t => t === "ordem_completa" ? "alocado" : t);
      
      if (!tiposFiltrados.includes(tipoNormalizado)) return false;
    }

    if (filters.diariaCarregamento) {
      const diariaCarreg = calcularDiariaCarregamento(ordem);
      if (filters.diariaCarregamento === "com_diaria" && (diariaCarreg === null || diariaCarreg <= 0)) return false;
      if (filters.diariaCarregamento === "sem_diaria" && diariaCarreg !== null && diariaCarreg > 0) return false;
    }

    if (filters.diariaDescarga) {
      const diariaDesc = calcularDiariaDescarga(ordem);
      if (filters.diariaDescarga === "com_diaria" && (diariaDesc === null || diariaDesc <= 0)) return false;
      if (filters.diariaDescarga === "sem_diaria" && diariaDesc !== null && diariaDesc > 0) return false;
    }

    if (filters.statusTracking && ordem.status_tracking !== filters.statusTracking) return false;
    if (filters.frota && ordem.frota !== filters.frota) return false;
    if (filters.operacoesIds.length > 0 && !filters.operacoesIds.includes(ordem.operacao_id)) return false;
    if (filters.modalidadeCarga && ordem.modalidade_carga !== filters.modalidadeCarga) return false;
    if (filters.origem && !ordem.origem?.toLowerCase().includes(filters.origem.toLowerCase())) return false;
    if (filters.destino && !ordem.destino?.toLowerCase().includes(filters.destino.toLowerCase())) return false;

    if (filters.dataInicio && ordem.data_solicitacao) {
      if (new Date(ordem.data_solicitacao) < new Date(filters.dataInicio)) return false;
    }

    if (filters.dataFim && ordem.data_solicitacao) {
      const dataFim = new Date(filters.dataFim);
      dataFim.setHours(23, 59, 59, 999);
      if (new Date(ordem.data_solicitacao) > dataFim) return false;
    }

    if (viewMode !== "all") {
      if (viewMode === "em_andamento") {
        if (ordem.status_tracking === "finalizado") return false;
      } else if (ordem.status_tracking !== viewMode) {
        return false;
      }
    }

    if (!searchTerm) return true;

    const term = searchTerm.toLowerCase();
    const motorista = motoristas.find(m => m.id === ordem.motorista_id);
    const veiculo = veiculos.find(v => v.id === ordem.cavalo_id);

    return (
      ordem.numero_carga?.toLowerCase().includes(term) ||
      ordem.cliente?.toLowerCase().includes(term) ||
      ordem.asn?.toLowerCase().includes(term) ||
      ordem.produto?.toLowerCase().includes(term) ||
      ordem.origem?.toLowerCase().includes(term) ||
      ordem.destino?.toLowerCase().includes(term) ||
      motorista?.nome?.toLowerCase().includes(term) ||
      veiculo?.placa?.toLowerCase().includes(term)
    );
  });

  const toggleOperacao = (operacaoId) => {
    setFilters(prev => {
      const operacoesIds = prev.operacoesIds.includes(operacaoId)
        ? prev.operacoesIds.filter(id => id !== operacaoId)
        : [...prev.operacoesIds, operacaoId];
      return { ...prev, operacoesIds };
    });
  };

  const inicio = (paginaAtual - 1) * limite;
  const fim = inicio + limite;
  const ordensLimitadas = filteredOrdens.slice(inicio, fim);

  const getOrdensCountByStatus = (status) => {
    return filteredOrdens.filter(o => o.status_tracking === status).length;
  };

  const metrics = calcularMetricas(filteredOrdens);
  const insights = calcularInsights();

  const handleSubmitOrdemCompleta = async (data) => {
    try {
      const user = await base44.auth.me();

      let valorTotal = 0;
      if (data.peso && data.valor_tonelada) {
        valorTotal = (data.peso / 1000) * data.valor_tonelada;
      } else if (data.frete_viagem) {
        valorTotal = data.frete_viagem;
      }

      const ordemData = {
        ...data,
        empresa_id: user.empresa_id,
        valor_total_frete: valorTotal
      };

      await base44.entities.OrdemDeCarregamento.update(editingOrdemCompleta.id, ordemData);

      setEditingOrdemCompleta(null);
      loadData();
    } catch (error) {
      console.error("Erro ao salvar ordem:", error);
      toast.error("Erro ao salvar ordem de carregamento.");
    }
  };

  const handleAbrirChat = (ordem) => {
    setChatOrdem(ordem);
    setShowChat(true);
  };

  const handleAbrirUpload = (ordem) => {
    setUploadOrdem(ordem);
    setShowUpload(true);
  };

  const handleExportarPDF = async (tipoExportacao = null) => {
    setExportando(true);
    try {
      const ordensParaPdf = filteredOrdens.map(ordem => {
        const motorista = motoristas.find(m => m.id === ordem.motorista_id);
        const cavalo = veiculos.find(v => v.id === ordem.cavalo_id);
        const implemento1 = veiculos.find(v => v.id === ordem.implemento1_id);
        const implemento2 = veiculos.find(v => v.id === ordem.implemento2_id);

        return {
          ...ordem,
          motorista_nome: motorista?.nome || "",
          cavalo_placa: cavalo?.placa || "",
          implemento1_placa: implemento1?.placa || "",
          implemento2_placa: implemento2?.placa || ""
        };
      });

      let colunasConfig = null;
      let tipoFinal = tipoExportacao || viewType;
      
      // Carregar configuração de colunas para TODOS os tipos de visualização
      const savedConfig = localStorage.getItem('planilha_colunas_config');
      if (savedConfig) {
        try {
          colunasConfig = JSON.parse(savedConfig).filter(col => col.enabled);
        } catch (error) {
          console.error("Erro ao carregar config de colunas:", error);
        }
      }

      const response = await base44.functions.invoke('gerarPdfTracking', {
        ordens: ordensParaPdf,
        tipoVisao: tipoFinal,
        colunasConfig: colunasConfig
      });

      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `tracking_${tipoFinal}_${format(new Date(), 'dd-MM-yyyy_HHmm')}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();

      toast.success("PDF gerado com sucesso!");
    } catch (error) {
      console.error("Erro ao exportar PDF:", error);
      toast.error("Erro ao exportar relatório PDF");
    } finally {
      setExportando(false);
    }
  };

  const prepararDadosSLA = (tipo) => {
    if (tipo === 'geral') {
      const ordensCarregamento = { noPrazo: [], foraPrazo: [], expurgado: [] };
      const ordensEntrega = { noPrazo: [], foraPrazo: [], expurgado: [] };

      const getDataAtualSP = () => {
        return new Date(new Date().toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' }));
      };

      filteredOrdens.forEach(ordem => {
        if (ordem.carregamento_agendamento_data) {
          if (ordem.carregamento_expurgado) {
            // Expurgos são contados como "No Prazo" E também no array de expurgados (para relatório)
            ordensCarregamento.noPrazo.push(ordem);
            ordensCarregamento.expurgado.push(ordem);
          } else {
            const agendado = new Date(ordem.carregamento_agendamento_data);
            // Se entrada_galpao vazio, usar data atual
            const realizado = ordem.entrada_galpao 
              ? new Date(ordem.entrada_galpao)
              : getDataAtualSP();
            if (realizado <= agendado) {
              ordensCarregamento.noPrazo.push(ordem);
            } else {
              ordensCarregamento.foraPrazo.push(ordem);
            }
          }
        }

        if (ordem.prazo_entrega) {
          if (ordem.entrega_expurgada) {
            // Expurgos são contados como "No Prazo" E também no array de expurgados (para relatório)
            ordensEntrega.noPrazo.push(ordem);
            ordensEntrega.expurgado.push(ordem);
          } else {
            const prazo = new Date(ordem.prazo_entrega);
            // Se chegada_destino vazio, usar data atual
            const realizado = ordem.chegada_destino 
              ? new Date(ordem.chegada_destino)
              : getDataAtualSP();
            if (realizado <= prazo) {
              ordensEntrega.noPrazo.push(ordem);
            } else {
              ordensEntrega.foraPrazo.push(ordem);
            }
          }
        }
      });

      const totalCarregamento = ordensCarregamento.noPrazo.length + ordensCarregamento.foraPrazo.length;
      const totalEntrega = ordensEntrega.noPrazo.length + ordensEntrega.foraPrazo.length;
      const percCarregamentoNoPrazo = totalCarregamento > 0 ? ((ordensCarregamento.noPrazo.length / totalCarregamento) * 100).toFixed(2) : '0.00';
      const percEntregaNoPrazo = totalEntrega > 0 ? ((ordensEntrega.noPrazo.length / totalEntrega) * 100).toFixed(2) : '0.00';

      return {
        grafico: [
          { nome: 'No Prazo', Carregamento: ordensCarregamento.noPrazo.length, Entrega: ordensEntrega.noPrazo.length },
          { nome: 'Fora do Prazo', Carregamento: ordensCarregamento.foraPrazo.length, Entrega: ordensEntrega.foraPrazo.length },
          { nome: 'Expurgado', Carregamento: ordensCarregamento.expurgado.length, Entrega: ordensEntrega.expurgado.length }
        ],
        ordensCarregamento,
        ordensEntrega,
        percCarregamentoNoPrazo,
        percEntregaNoPrazo
      };
    } else if (tipo === 'carga') {
      const ordensNoPrazo = [];
      const ordensForaPrazo = [];
      const ordensExpurgadas = [];
      const dadosPorData = {};

      const getDataAtualSP = () => {
        return new Date(new Date().toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' }));
      };

      filteredOrdens.forEach(ordem => {
        if (ordem.carregamento_agendamento_data) {
          const data = new Date(ordem.carregamento_agendamento_data).toLocaleDateString('pt-BR');
          
          if (!dadosPorData[data]) {
            dadosPorData[data] = { noPrazo: 0, foraPrazo: 0, expurgado: 0 };
          }

          if (ordem.carregamento_expurgado) {
            // Expurgos contam como "No Prazo" E também como expurgado
            dadosPorData[data].noPrazo++;
            dadosPorData[data].expurgado++;
            ordensNoPrazo.push(ordem);
            ordensExpurgadas.push(ordem);
          } else {
            const agendado = new Date(ordem.carregamento_agendamento_data);
            // Se entrada_galpao vazio, usar data atual
            const realizado = ordem.entrada_galpao 
              ? new Date(ordem.entrada_galpao)
              : getDataAtualSP();
            if (realizado <= agendado) {
              dadosPorData[data].noPrazo++;
              ordensNoPrazo.push(ordem);
            } else {
              dadosPorData[data].foraPrazo++;
              ordensForaPrazo.push(ordem);
            }
          }
        }
      });

      const grafico = Object.entries(dadosPorData)
        .sort((a, b) => {
          const [diaA, mesA, anoA] = a[0].split('/');
          const [diaB, mesB, anoB] = b[0].split('/');
          return new Date(anoA, mesA - 1, diaA) - new Date(anoB, mesB - 1, diaB);
        })
        .map(([data, valores]) => ({
          data,
          'No Prazo': valores.noPrazo,
          'Fora do Prazo': valores.foraPrazo,
          'Expurgado': valores.expurgado
        }));

      return { grafico, ordensNoPrazo, ordensForaPrazo, ordensExpurgadas };
    } else if (tipo === 'entrega') {
      const ordensNoPrazo = [];
      const ordensForaPrazo = [];
      const ordensExpurgadas = [];
      const dadosPorData = {};

      const getDataAtualSP = () => {
        return new Date(new Date().toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' }));
      };

      filteredOrdens.forEach(ordem => {
        if (ordem.prazo_entrega) {
          const data = new Date(ordem.prazo_entrega).toLocaleDateString('pt-BR');
          
          if (!dadosPorData[data]) {
            dadosPorData[data] = { noPrazo: 0, foraPrazo: 0, expurgado: 0 };
          }

          if (ordem.entrega_expurgada) {
            // Expurgos contam como "No Prazo" E também como expurgado
            dadosPorData[data].noPrazo++;
            dadosPorData[data].expurgado++;
            ordensNoPrazo.push(ordem);
            ordensExpurgadas.push(ordem);
          } else {
            const prazo = new Date(ordem.prazo_entrega);
            // Se chegada_destino vazio, usar data atual
            const realizado = ordem.chegada_destino 
              ? new Date(ordem.chegada_destino)
              : getDataAtualSP();
            if (realizado <= prazo) {
              dadosPorData[data].noPrazo++;
              ordensNoPrazo.push(ordem);
            } else {
              dadosPorData[data].foraPrazo++;
              ordensForaPrazo.push(ordem);
            }
          }
        }
      });

      const grafico = Object.entries(dadosPorData)
        .sort((a, b) => {
          const [diaA, mesA, anoA] = a[0].split('/');
          const [diaB, mesB, anoB] = b[0].split('/');
          return new Date(anoA, mesA - 1, diaA) - new Date(anoB, mesB - 1, diaB);
        })
        .map(([data, valores]) => ({
          data,
          'No Prazo': valores.noPrazo,
          'Fora do Prazo': valores.foraPrazo,
          'Expurgado': valores.expurgado
        }));

      return { grafico, ordensNoPrazo, ordensForaPrazo, ordensExpurgadas };
    }
  };

  const theme = {
    bg: isDark ? '#0f172a' : '#f9fafb',
    cardBg: isDark ? '#1e293b' : '#ffffff',
    text: isDark ? '#f1f5f9' : '#111827',
    textMuted: isDark ? '#94a3b8' : '#6b7280',
    border: isDark ? '#334155' : '#e5e7eb',
    inputBg: isDark ? '#1e293b' : '#ffffff',
    buttonBg: isDark ? '#334155' : '#f3f4f6',
    tabsBg: isDark ? '#0f172a' : '#f9fafb',
  };

  if (loading) {
    return (
      <div className="p-4 min-h-screen flex items-center justify-center" style={{ backgroundColor: theme.bg }}>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm" style={{ color: theme.textMuted }}>Carregando tracking...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full transition-colors" style={{ backgroundColor: theme.bg }}>
      <div className="py-2 w-full">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-2 gap-2 px-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <MapPin className="w-6 h-6 text-blue-600" />
              <h1 className="text-2xl font-bold" style={{ color: theme.text }}>Tracking Logístico</h1>
            </div>
            <p className="text-xs" style={{ color: theme.textMuted }}>Acompanhamento em tempo real das cargas em operação</p>
          </div>

          <div className="flex gap-2 w-full lg:w-auto flex-wrap">
            <div className="relative flex-1 lg:w-52">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5" style={{ color: theme.textMuted }} />
              <Input
                placeholder="Buscar por ordem, ASN, motorista..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 h-8 text-sm"
                style={{
                  backgroundColor: theme.inputBg,
                  borderColor: theme.border,
                  color: theme.text
                }}
              />
            </div>
            <Select value={limite.toString()} onValueChange={(value) => setLimite(parseInt(value))}>
              <SelectTrigger
                className="h-8 w-20 text-xs"
                style={{
                  backgroundColor: theme.inputBg,
                  borderColor: theme.border,
                  color: theme.text
                }}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent style={{ backgroundColor: theme.cardBg, borderColor: theme.border }}>
                {[10, 50, 100, 200, 300, 400, 500].map(num => (
                  <SelectItem
                    key={num}
                    value={num.toString()}
                    style={{ color: theme.text }}
                  >
                    {num}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FiltrosPredefinidos
              rota="tracking"
              filtrosAtuais={filters}
              onAplicarFiltro={(novosFiltros) => {
                setFilters(novosFiltros);
                setPaginaAtual(1);
                toast.success("Filtro aplicado!");
              }}
            />
            <PaginacaoControles
              paginaAtual={paginaAtual}
              totalRegistros={filteredOrdens.length}
              limite={limite}
              onPaginaAnterior={() => setPaginaAtual(prev => Math.max(1, prev - 1))}
              onProximaPagina={() => setPaginaAtual(prev => prev + 1)}
              isDark={isDark}
            />
            <Button
              variant={showFilters ? "default" : "outline"}
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="h-8"
              style={!showFilters ? {
                backgroundColor: 'transparent',
                borderColor: theme.border,
                color: theme.text
              } : {}}
            >
              <Filter className="w-3.5 h-3.5" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={loadData}
              className="h-8"
              style={{
                backgroundColor: 'transparent',
                borderColor: theme.border,
                color: theme.text
              }}
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-2 mb-2 px-3">
          <Card className="hover:shadow-md transition-shadow cursor-pointer border" style={{ backgroundColor: theme.cardBg, borderColor: theme.border }} onClick={() => setViewMode("all")}>
            <CardContent className="p-3">
              <div className="flex items-center justify-between mb-1">
                <TrendingUp className="w-6 h-6 text-blue-600" />
                <div className="text-2xl font-bold" style={{ color: theme.text }}>{metrics.total}</div>
              </div>
              <p className="text-xs font-medium" style={{ color: theme.textMuted }}>Total de Cargas</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow cursor-pointer border-l-4 border-purple-500 border" style={{ backgroundColor: theme.cardBg, borderColor: theme.border }} onClick={() => setViewMode("em_viagem")}>
            <CardContent className="p-3">
              <div className="flex items-center justify-between mb-1">
                <Truck className="w-6 h-6 text-purple-600" />
                <div className="text-2xl font-bold text-purple-600">{metrics.emViagem}</div>
              </div>
              <p className="text-xs font-medium" style={{ color: theme.textMuted }}>Em Viagem</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow cursor-pointer border-l-4 border-yellow-500 border" style={{ backgroundColor: theme.cardBg, borderColor: theme.border }}>
            <CardContent className="p-3">
              <div className="flex items-center justify-between mb-1">
                <Clock className="w-6 h-6 text-yellow-600" />
                <div className="text-2xl font-bold text-yellow-600">{metrics.aguardandoCarregamento}</div>
              </div>
              <p className="text-xs font-medium" style={{ color: theme.textMuted }}>Aguardando Carga</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow cursor-pointer border-l-4 border-red-500 border" style={{ backgroundColor: theme.cardBg, borderColor: theme.border }}>
            <CardContent className="p-3">
              <div className="flex items-center justify-between mb-1">
                <AlertTriangle className="w-6 h-6 text-red-600" />
                <div className="text-2xl font-bold text-red-600">{metrics.atrasadas}</div>
              </div>
              <p className="text-xs font-medium" style={{ color: theme.textMuted }}>Atrasadas</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow cursor-pointer border-l-4 border-green-500 border" style={{ backgroundColor: theme.cardBg, borderColor: theme.border }} onClick={() => setViewMode("finalizado")}>
            <CardContent className="p-3">
              <div className="flex items-center justify-between mb-1">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
                <div className="text-2xl font-bold text-green-600">{metrics.finalizadas}</div>
              </div>
              <p className="text-xs font-medium" style={{ color: theme.textMuted }}>Finalizadas</p>
            </CardContent>
          </Card>
        </div>

        {/* SLA Cards - Carregamento e Descarga */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3 px-3">
          <Card style={{ backgroundColor: theme.cardBg, borderColor: theme.border }} className="border-l-4 border-l-blue-500">
            <CardContent className="p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4 text-blue-600" />
                  <span className="text-xs font-semibold" style={{ color: theme.text }}>SLA de Carregamento</span>
                </div>
              </div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-[10px]" style={{ color: theme.textMuted }}>No Prazo</span>
                  <Badge className="bg-green-600 text-white text-[10px] h-4 px-1.5">
                    {metrics.carregamentosNoPrazo}
                  </Badge>
                  <span className="text-[10px] font-bold text-green-600">
                    {metrics.carregamentosRealizados > 0 
                      ? ((metrics.carregamentosNoPrazo / metrics.carregamentosRealizados) * 100).toFixed(2)
                      : '0.00'}%
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px]" style={{ color: theme.textMuted }}>Fora do Prazo</span>
                  <Badge className="bg-red-600 text-white text-[10px] h-4 px-1.5">
                    {metrics.carregamentosForaPrazo}
                  </Badge>
                  <span className="text-[10px] font-bold text-red-600">
                    {metrics.carregamentosRealizados > 0 
                      ? ((metrics.carregamentosForaPrazo / metrics.carregamentosRealizados) * 100).toFixed(2)
                      : '0.00'}%
                  </span>
                </div>
              </div>
              <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-600 transition-all"
                  style={{
                    width: `${metrics.carregamentosRealizados > 0 
                      ? (metrics.carregamentosNoPrazo / metrics.carregamentosRealizados) * 100
                      : 0}%`
                  }}
                />
              </div>
              <p className="text-[9px] text-center mt-1" style={{ color: theme.textMuted }}>
                Total de {metrics.carregamentosRealizados} carregamentos realizados
              </p>
            </CardContent>
          </Card>

          <Card style={{ backgroundColor: theme.cardBg, borderColor: theme.border }} className="border-l-4 border-l-purple-500">
            <CardContent className="p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-purple-600" />
                  <span className="text-xs font-semibold" style={{ color: theme.text }}>SLA de Descarga</span>
                </div>
              </div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-[10px]" style={{ color: theme.textMuted }}>No Prazo</span>
                  <Badge className="bg-green-600 text-white text-[10px] h-4 px-1.5">
                    {metrics.descargasNoPrazo}
                  </Badge>
                  <span className="text-[10px] font-bold text-green-600">
                    {metrics.descargasRealizadas > 0 
                      ? ((metrics.descargasNoPrazo / metrics.descargasRealizadas) * 100).toFixed(2)
                      : '0.00'}%
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px]" style={{ color: theme.textMuted }}>Fora do Prazo</span>
                  <Badge className="bg-red-600 text-white text-[10px] h-4 px-1.5">
                    {metrics.descargasForaPrazo}
                  </Badge>
                  <span className="text-[10px] font-bold text-red-600">
                    {metrics.descargasRealizadas > 0 
                      ? ((metrics.descargasForaPrazo / metrics.descargasRealizadas) * 100).toFixed(2)
                      : '0.00'}%
                  </span>
                </div>
              </div>
              <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-600 transition-all"
                  style={{
                    width: `${metrics.descargasRealizadas > 0 
                      ? (metrics.descargasNoPrazo / metrics.descargasRealizadas) * 100
                      : 0}%`
                  }}
                />
              </div>
              <p className="text-[9px] text-center mt-1" style={{ color: theme.textMuted }}>
                Total de {metrics.descargasRealizadas} descargas realizadas
              </p>
            </CardContent>
          </Card>
        </div>

        {showFilters && (
          <Card className="mb-4 mx-3" style={{ backgroundColor: theme.cardBg, borderColor: theme.border }}>
            <CardContent className="pt-4 pb-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <div className="md:col-span-4">
                  <FiltroDataPeriodo
                    periodoSelecionado={periodoSelecionado}
                    onPeriodoChange={setPeriodoSelecionado}
                    dataInicio={filters.dataInicio}
                    dataFim={filters.dataFim}
                    onDataInicioChange={(val) => setFilters({...filters, dataInicio: val})}
                    onDataFimChange={(val) => setFilters({...filters, dataFim: val})}
                    isDark={isDark}
                  />
                </div>

                <div className="md:col-span-4">
                  <Label className="text-xs mb-2 block" style={{ color: theme.textMuted }}>Tipos de Ordem (múltiplos)</Label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { value: "carregamento", label: "Ordem de Carga", color: "blue" },
                      { value: "coleta", label: "Coleta", color: "green" },
                      { value: "recebimento", label: "Recebimento", color: "purple" },
                      { value: "entrega", label: "Entrega", color: "orange" }
                    ].map((tipo) => (
                      <Badge
                        key={tipo.value}
                        variant={filters.tiposOrdemFiltro?.includes(tipo.value) ? "default" : "outline"}
                        className="cursor-pointer hover:opacity-80 transition-opacity"
                        style={filters.tiposOrdemFiltro?.includes(tipo.value) ? {
                          backgroundColor: tipo.color === "blue" ? "#3b82f6" : tipo.color === "green" ? "#16a34a" : tipo.color === "purple" ? "#8b5cf6" : "#f97316",
                          color: "white"
                        } : {
                          backgroundColor: 'transparent',
                          borderColor: theme.border,
                          color: theme.text
                        }}
                        onClick={() => {
                          const tiposOrdemFiltro = filters.tiposOrdemFiltro?.includes(tipo.value)
                            ? filters.tiposOrdemFiltro.filter(t => t !== tipo.value)
                            : [...(filters.tiposOrdemFiltro || []), tipo.value];
                          setFilters({...filters, tiposOrdemFiltro});
                        }}
                      >
                        {tipo.label}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="md:col-span-2">
                  <Label className="text-xs mb-2 block" style={{ color: theme.textMuted }}>Status de Negociação (múltiplos)</Label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { value: "oferta", label: "Oferta", color: "green" },
                      { value: "negociando", label: "Negociando", color: "yellow" },
                      { value: "alocado", label: "Alocado", color: "blue" }
                    ].map((tipo) => (
                      <Badge
                        key={tipo.value}
                        variant={filters.tiposOrdem?.includes(tipo.value) ? "default" : "outline"}
                        className="cursor-pointer hover:opacity-80 transition-opacity"
                        style={filters.tiposOrdem?.includes(tipo.value) ? {
                          backgroundColor: tipo.color === "green" ? "#16a34a" : tipo.color === "yellow" ? "#ca8a04" : "#3b82f6",
                          color: "white"
                        } : {
                          backgroundColor: 'transparent',
                          borderColor: theme.border,
                          color: theme.text
                        }}
                        onClick={() => {
                          const tiposOrdem = filters.tiposOrdem?.includes(tipo.value)
                            ? filters.tiposOrdem.filter(t => t !== tipo.value)
                            : [...(filters.tiposOrdem || []), tipo.value];
                          setFilters({...filters, tiposOrdem});
                        }}
                      >
                        {tipo.label}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="text-xs" style={{ color: theme.textMuted }}>Status Tracking</Label>
                  <Select value={filters.statusTracking} onValueChange={(value) => setFilters({...filters, statusTracking: value})}>
                    <SelectTrigger className="h-8 text-sm" style={{ backgroundColor: theme.inputBg, borderColor: theme.border, color: theme.text }}>
                      <SelectValue placeholder="Todos os status" />
                    </SelectTrigger>
                    <SelectContent style={{ backgroundColor: theme.cardBg, borderColor: theme.border }}>
                      <SelectItem value={null} style={{ color: theme.text }}>Todos os status</SelectItem>
                      {Object.entries(statusTrackingConfig).map(([key, config]) => (
                        <SelectItem key={key} value={key} style={{ color: theme.text }}>{config.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-xs flex items-center gap-1" style={{ color: theme.textMuted }}>
                    💰 Diária Carregamento
                  </Label>
                  <Select value={filters.diariaCarregamento} onValueChange={(value) => setFilters({...filters, diariaCarregamento: value})}>
                    <SelectTrigger className="h-8 text-sm" style={{ backgroundColor: theme.inputBg, borderColor: theme.border, color: theme.text }}>
                      <SelectValue placeholder="Todas" />
                    </SelectTrigger>
                    <SelectContent style={{ backgroundColor: theme.cardBg, borderColor: theme.border }}>
                      <SelectItem value={null} style={{ color: theme.text }}>Todas</SelectItem>
                      <SelectItem value="com_diaria" style={{ color: theme.text }}>🟠 Com Diária</SelectItem>
                      <SelectItem value="sem_diaria" style={{ color: theme.text }}>✅ Sem Diária</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-xs flex items-center gap-1" style={{ color: theme.textMuted }}>
                    💰 Diária Descarga
                  </Label>
                  <Select value={filters.diariaDescarga} onValueChange={(value) => setFilters({...filters, diariaDescarga: value})}>
                    <SelectTrigger className="h-8 text-sm" style={{ backgroundColor: theme.inputBg, borderColor: theme.border, color: theme.text }}>
                      <SelectValue placeholder="Todas" />
                    </SelectTrigger>
                    <SelectContent style={{ backgroundColor: theme.cardBg, borderColor: theme.border }}>
                      <SelectItem value={null} style={{ color: theme.text }}>Todas</SelectItem>
                      <SelectItem value="com_diaria" style={{ color: theme.text }}>🟠 Com Diária</SelectItem>
                      <SelectItem value="sem_diaria" style={{ color: theme.text }}>✅ Sem Diária</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-xs" style={{ color: theme.textMuted }}>Origem</Label>
                  <Input
                    value={filters.origem}
                    onChange={(e) => setFilters({...filters, origem: e.target.value})}
                    placeholder="Filtrar por origem"
                    className="h-8 text-sm"
                    style={{ backgroundColor: theme.inputBg, borderColor: theme.border, color: theme.text }}
                  />
                </div>

                <div>
                  <Label className="text-xs" style={{ color: theme.textMuted }}>Destino</Label>
                  <Input
                    value={filters.destino}
                    onChange={(e) => setFilters({...filters, destino: e.target.value})}
                    placeholder="Filtrar por destino"
                    className="h-8 text-sm"
                    style={{ backgroundColor: theme.inputBg, borderColor: theme.border, color: theme.text }}
                  />
                </div>

                <div>
                  <Label className="text-xs" style={{ color: theme.textMuted }}>Tipo de Frota</Label>
                  <Select value={filters.frota} onValueChange={(value) => setFilters({...filters, frota: value})}>
                    <SelectTrigger className="h-8 text-sm" style={{ backgroundColor: theme.inputBg, borderColor: theme.border, color: theme.text }}>
                      <SelectValue placeholder="Todas" />
                    </SelectTrigger>
                    <SelectContent style={{ backgroundColor: theme.cardBg, borderColor: theme.border }}>
                      <SelectItem value={null} style={{ color: theme.text }}>Todas</SelectItem>
                      <SelectItem value="própria" style={{ color: theme.text }}>Própria</SelectItem>
                      <SelectItem value="terceirizada" style={{ color: theme.text }}>Terceirizada</SelectItem>
                      <SelectItem value="agregado" style={{ color: theme.text }}>Agregado</SelectItem>
                      <SelectItem value="acionista" style={{ color: theme.text }}>Acionista</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="md:col-span-2">
                  <Label className="text-xs mb-2 block" style={{ color: theme.textMuted }}>Operações (múltiplas)</Label>
                  <div className="flex flex-wrap gap-2">
                    {operacoes.map((op) => (
                      <Badge
                        key={op.id}
                        variant={filters.operacoesIds.includes(op.id) ? "default" : "outline"}
                        className="cursor-pointer hover:opacity-80 transition-opacity"
                        style={filters.operacoesIds.includes(op.id) ? {
                          backgroundColor: '#3b82f6',
                          color: 'white'
                        } : {
                          backgroundColor: 'transparent',
                          borderColor: theme.border,
                          color: theme.text
                        }}
                        onClick={() => toggleOperacao(op.id)}
                      >
                        {op.nome}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="text-xs" style={{ color: theme.textMuted }}>Modalidade</Label>
                  <Select value={filters.modalidadeCarga} onValueChange={(value) => setFilters({...filters, modalidadeCarga: value})}>
                    <SelectTrigger className="h-8 text-sm" style={{ backgroundColor: theme.inputBg, borderColor: theme.border, color: theme.text }}>
                      <SelectValue placeholder="Todas" />
                    </SelectTrigger>
                    <SelectContent style={{ backgroundColor: theme.cardBg, borderColor: theme.border }}>
                      <SelectItem value={null} style={{ color: theme.text }}>Todas</SelectItem>
                      <SelectItem value="normal" style={{ color: theme.text }}>Normal</SelectItem>
                      <SelectItem value="prioridade" style={{ color: theme.text }}>Prioridade</SelectItem>
                      <SelectItem value="expressa" style={{ color: theme.text }}>Expressa</SelectItem>
                    </SelectContent>
                  </Select>
                </div>


              </div>
              <div className="flex justify-end mt-3 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setFilters({
                      statusTracking: "", origem: "", destino: "",
                      dataInicio: "", dataFim: "", frota: "", operacoesIds: [], modalidadeCarga: "",
                      tiposOrdem: [], diariaCarregamento: "", diariaDescarga: "", tipoRegistro: "",
                      tiposOrdemFiltro: ["carregamento"]
                    });
                    setPeriodoSelecionado("");
                  }}
                  className="h-7 text-xs"
                  style={{
                    backgroundColor: 'transparent',
                    borderColor: theme.border,
                    color: theme.text
                  }}
                >
                  Limpar Filtros
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="mb-2 px-3">
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowInsights(!showInsights)}
              className="h-7 text-xs"
              style={{
                backgroundColor: 'transparent',
                borderColor: theme.border,
                color: theme.text
              }}
            >
              {showInsights ? (
                <>
                  <TrendingUp className="w-3 h-3 mr-1" />
                  Ocultar Insights
                </>
              ) : (
                <>
                  <TrendingUp className="w-3 h-3 mr-1" />
                  Mostrar Insights
                </>
              )}
            </Button>
            {showInsights && (
              <p className="text-xs" style={{ color: theme.textMuted }}>
                Análise detalhada das operações
              </p>
            )}
          </div>

          {showInsights && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-2">
              {Object.entries(insights.distribuicaoPorStatus).map(([status, count]) => {
                const config = statusTrackingConfig[status];
                if (!config || count === 0) return null;

                return (
                  <Card key={status} className="hover:shadow-md transition-all cursor-pointer border-l-2 border" style={{ backgroundColor: theme.cardBg, borderColor: theme.border, borderLeftColor: tailwindColorToHex(config.color) }}>
                    <CardContent className="p-2">
                      <div className="flex items-center justify-between mb-1">
                        <div className="w-2 h-2 rounded-full" style={{
                          backgroundColor: tailwindColorToHex(config.color)
                        }} />
                        <Badge variant="secondary" className="text-[10px] h-4 px-1" style={{ backgroundColor: theme.inputBg, color: theme.textMuted }}>
                          {count}
                        </Badge>
                      </div>
                      <p className="font-semibold text-xs leading-tight" style={{ color: theme.text }}>{config.label}</p>
                    </CardContent>
                  </Card>
                );
              })}

              <Card className="hover:shadow-md transition-all border-l-2 border-green-500 border" style={{ backgroundColor: theme.cardBg, borderColor: theme.border }}>
                <CardContent className="p-2">
                  <div className="flex items-center justify-between mb-1">
                    <CheckCircle2 className="w-3 h-3 text-green-600" />
                    <Badge variant="secondary" className="text-[10px] h-4 px-1" style={{ backgroundColor: theme.inputBg, color: theme.textMuted }}>
                      {insights.percentualNoPrazo}%
                    </Badge>
                  </div>
                  <p className="font-semibold text-xs leading-tight mb-1" style={{ color: theme.text }}>Entregas no Prazo</p>
                  <div className="h-1 bg-gray-200 rounded-full overflow-hidden" style={{backgroundColor: theme.border}}>
                    <div
                      className={`h-full ${insights.percentualNoPrazo >= 80 ? 'bg-green-500' : insights.percentualNoPrazo >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`}
                      style={{ width: `${insights.percentualNoPrazo}%` }}
                    />
                  </div>
                  <p className="text-[9px]" style={{ color: theme.textMuted }}>
                    {insights.ordensNoPrazo} no prazo / {insights.ordensForaDoPrazo} atrasadas
                  </p>
                </CardContent>
              </Card>

              {insights.kmMedio > 0 && (
                <Card className="hover:shadow-md transition-all border-l-2 border-purple-500 border" style={{ backgroundColor: theme.cardBg, borderColor: theme.border }}>
                  <CardContent className="p-2">
                    <div className="flex items-center justify-between mb-1">
                      <MapPin className="w-3 h-3 text-purple-600" />
                      <Badge variant="secondary" className="text-[10px] h-4 px-1" style={{ backgroundColor: theme.inputBg, color: theme.textMuted }}>
                        km
                      </Badge>
                    </div>
                    <p className="font-semibold text-xs leading-tight mb-1" style={{ color: theme.text }}>KM Médio Restante</p>
                    <p className="text-lg font-bold text-purple-600">{insights.kmMedio}</p>
                  </CardContent>
                </Card>
              )}

              {insights.pesoMedio > 0 && (
                <Card className="hover:shadow-md transition-all border-l-2 border-cyan-500 border" style={{ backgroundColor: theme.cardBg, borderColor: theme.border }}>
                  <CardContent className="p-2">
                    <div className="flex items-center justify-between mb-1">
                      <Package className="w-3 h-3 text-cyan-600" />
                      <Badge variant="secondary" className="text-[10px] h-4 px-1" style={{ backgroundColor: theme.inputBg, color: theme.textMuted }}>
                        ton
                      </Badge>
                    </div>
                    <p className="font-semibold text-xs leading-tight mb-1" style={{ color: theme.text }}>Carga Média</p>
                    <p className="text-lg font-bold text-cyan-600">{insights.pesoMedio}</p>
                  </CardContent>
                </Card>
              )}

              {insights.tempoMedioCarregamento && (
                <Card className="hover:shadow-md transition-all border-l-2 border-yellow-500 border" style={{ backgroundColor: theme.cardBg, borderColor: theme.border }}>
                  <CardContent className="p-2">
                    <div className="flex items-center justify-between mb-1">
                      <Clock className="w-3 h-3 text-yellow-600" />
                      <Badge variant="secondary" className="text-[10px] h-4 px-1" style={{ backgroundColor: theme.inputBg, color: theme.textMuted }}>
                        dias
                      </Badge>
                    </div>
                    <p className="font-semibold text-xs leading-tight mb-1" style={{ color: theme.text }}>Tempo Carregamento</p>
                    <p className="text-lg font-bold text-yellow-600">{insights.tempoMedioCarregamento}</p>
                  </CardContent>
                </Card>
              )}

              {insights.tempoMedioViagem && (
                <Card className="hover:shadow-md transition-all border-l-2 border-indigo-500 border" style={{ backgroundColor: theme.cardBg, borderColor: theme.border }}>
                  <CardContent className="p-2">
                    <div className="flex items-center justify-between mb-1">
                      <Truck className="w-3 h-3 text-indigo-600" />
                      <Badge variant="secondary" className="text-[10px] h-4 px-1" style={{ backgroundColor: theme.inputBg, color: theme.textMuted }}>
                        dias
                      </Badge>
                    </div>
                    <p className="font-semibold text-xs leading-tight mb-1" style={{ color: theme.text }}>Tempo de Viagem</p>
                    <p className="text-lg font-bold text-indigo-600">{insights.tempoMedioViagem}</p>
                  </CardContent>
                </Card>
              )}

              <Card className="col-span-2 hover:shadow-md transition-all border-l-2 border-blue-500 border" style={{ backgroundColor: theme.cardBg, borderColor: theme.border }}>
                <CardContent className="p-2">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-blue-600" />
                      <p className="font-semibold text-xs" style={{ color: theme.text }}>Top Origens</p>
                    </div>
                  </div>
                  <div className="space-y-1 mt-1">
                    {insights.topOrigens.map(([origem, count]) => (
                      <div key={origem} className="flex items-center justify-between">
                        <span className="text-[10px] truncate max-w-[120px]" style={{ color: theme.textMuted }}>{origem}</span>
                        <Badge variant="outline" className="text-[9px] h-3 px-1" style={{ backgroundColor: theme.inputBg, borderColor: theme.border, color: theme.textMuted }}>{count}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="col-span-2 hover:shadow-md transition-all border-l-2 border-indigo-500 border" style={{ backgroundColor: theme.cardBg, borderColor: theme.border }}>
                <CardContent className="p-2">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-indigo-600" />
                      <p className="font-semibold text-xs" style={{ color: theme.text }}>Top Destinos</p>
                    </div>
                  </div>
                  <div className="space-y-1 mt-1">
                    {insights.topDestinos.map(([destino, count]) => (
                      <div key={destino} className="flex items-center justify-between">
                        <span className="text-[10px] truncate max-w-[120px]" style={{ color: theme.textMuted }}>{destino}</span>
                        <Badge variant="outline" className="text-[9px] h-3 px-1" style={{ backgroundColor: theme.inputBg, borderColor: theme.border, color: theme.textMuted }}>{count}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {insights.topMotoristas.length > 0 && (
                <Card className="col-span-2 hover:shadow-md transition-all border-l-2 border-orange-500 border" style={{ backgroundColor: theme.cardBg, borderColor: theme.border }}>
                  <CardContent className="p-2">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1">
                        <User className="w-3 h-3 text-orange-600" />
                        <p className="font-semibold text-xs" style={{ color: theme.text }}>Top Motoristas</p>
                      </div>
                    </div>
                    <div className="space-y-1 mt-1">
                      {insights.topMotoristas.map(([motorista, count]) => (
                        <div key={motorista} className="flex items-center justify-between">
                          <span className="text-[10px] truncate max-w-[120px]" style={{ color: theme.textMuted }}>{motorista}</span>
                          <Badge variant="outline" className="text-[9px] h-3 px-1" style={{ backgroundColor: theme.inputBg, borderColor: theme.border, color: theme.textMuted }}>{count}</Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>

        <div className="mb-2 px-3">
          <div className="flex items-center justify-between">
            <Tabs value={viewType} onValueChange={setViewType}>
              <TabsList className="h-8" style={{ backgroundColor: theme.tabsBg, borderColor: theme.border }}>
                <TabsTrigger
                  value="table"
                  className="text-xs h-7"
                  style={{
                    color: viewType === 'table' ? theme.text : theme.textMuted,
                    backgroundColor: viewType === 'table' ? theme.cardBg : 'transparent'
                  }}
                >
                  <Table className="w-3 h-3 mr-1" />
                  Tabela
                </TabsTrigger>
                <TabsTrigger
                  value="planilha"
                  className="text-xs h-7"
                  style={{
                    color: viewType === 'planilha' ? theme.text : theme.textMuted,
                    backgroundColor: viewType === 'planilha' ? theme.cardBg : 'transparent'
                  }}
                >
                  <FileSpreadsheet className="w-3 h-3 mr-1" />
                  Planilha
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="flex items-center gap-2">
              <p className="text-xs" style={{ color: theme.textMuted }}>
                Mostrando <span className="font-bold" style={{ color: theme.text }}>{ordensLimitadas.length}</span> de <span className="font-bold" style={{ color: theme.text }}>{filteredOrdens.length}</span> ordens
                {filters.tiposOrdem && filters.tiposOrdem.length > 0 && (
                  <Badge className="ml-2 text-[10px] h-4 px-1.5">
                    {filters.tiposOrdem.length} tipo(s) selecionado(s)
                  </Badge>
                )}
              </p>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    disabled={exportando || filteredOrdens.length === 0}
                    size="sm"
                    className="h-7 bg-red-600 hover:bg-red-700 text-xs text-white"
                  >
                    {exportando ? (
                      <>
                        <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                        Gerando PDF...
                      </>
                    ) : (
                      <>
                        <Download className="w-3 h-3 mr-1" />
                        Exportar PDF
                        <ChevronDown className="w-3 h-3 ml-1" />
                      </>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" style={{ backgroundColor: theme.cardBg, borderColor: theme.border }}>
                  <DropdownMenuItem
                    onClick={() => handleExportarPDF('table')}
                    style={{ color: theme.text }}
                  >
                    <Table className="w-4 h-4 mr-2" />
                    Tabela Padrão
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleExportarPDF('planilha')}
                    style={{ color: theme.text }}
                  >
                    <FileSpreadsheet className="w-4 h-4 mr-2" />
                    Planilha Compacta
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleExportarPDF('agrupado_carregamento')}
                    style={{ color: theme.text }}
                  >
                    <Calendar className="w-4 h-4 mr-2" />
                    Agrupado por Data de Carregamento
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleExportarPDF('agrupado_descarga')}
                    style={{ color: theme.text }}
                  >
                    <Calendar className="w-4 h-4 mr-2" />
                    Agrupado por Data de Descarga
                  </DropdownMenuItem>
                  <DropdownMenuSeparator style={{ backgroundColor: theme.border }} />
                  <DropdownMenuItem
                    onClick={() => {
                      setTipoRelatorioSLA('geral');
                      setShowRelatorioSLA(true);
                    }}
                    style={{ color: theme.text }}
                  >
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Relatório SLA Geral
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => {
                      setTipoRelatorioSLA('carga');
                      setShowRelatorioSLA(true);
                    }}
                    style={{ color: theme.text }}
                  >
                    <Package className="w-4 h-4 mr-2" />
                    Relatório SLA Carregamento
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => {
                      setTipoRelatorioSLA('entrega');
                      setShowRelatorioSLA(true);
                    }}
                    style={{ color: theme.text }}
                  >
                    <Truck className="w-4 h-4 mr-2" />
                    Relatório SLA Entrega
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        {viewType === "planilha" && (
          <div className="px-3">
            <Tabs value={viewMode} onValueChange={setViewMode}>
              <div className="overflow-x-auto pb-2">
                <TabsList
                  className="mb-2 h-8 inline-flex min-w-max"
                  style={{ backgroundColor: theme.tabsBg, borderColor: theme.border }}
                >
                  {[
                    { value: "all", label: `Todas (${filteredOrdens.length})` },
                    { value: "em_andamento", label: `Em Andamento (${filteredOrdens.filter(o => o.status_tracking !== 'finalizado').length})` },
                    { value: "aguardando_agendamento", label: `Aguardando (${getOrdensCountByStatus('aguardando_agendamento')})` },
                    { value: "carregamento_agendado", label: `Agendado (${getOrdensCountByStatus('carregamento_agendado')})` },
                    { value: "em_carregamento", label: `Carregando (${getOrdensCountByStatus('em_carregamento')})` },
                    { value: "carregado", label: `Carregado (${getOrdensCountByStatus('carregado')})` },
                    { value: "em_viagem", label: `Em Viagem (${getOrdensCountByStatus('em_viagem')})` },
                    { value: "chegada_destino", label: `No Destino (${getOrdensCountByStatus('chegada_destino')})` },
                    { value: "descarga_agendada", label: `Desc. Agendada (${getOrdensCountByStatus('descarga_agendada')})` },
                    { value: "em_descarga", label: `Descarregando (${getOrdensCountByStatus('em_descarga')})` },
                    { value: "descarga_realizada", label: `Descarregado (${getOrdensCountByStatus('descarga_realizada')})` },
                    { value: "finalizado", label: `Finalizado (${getOrdensCountByStatus('finalizado')})` }
                  ].map(tab => (
                    <TabsTrigger
                      key={tab.value}
                      value={tab.value}
                      className="text-xs h-7 whitespace-nowrap"
                      style={{
                        color: viewMode === tab.value ? theme.text : theme.textMuted,
                        backgroundColor: viewMode === tab.value ? theme.cardBg : 'transparent'
                      }}
                    >
                      {tab.label}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </div>

              {["all", "em_andamento", "aguardando_agendamento", "carregamento_agendado", "em_carregamento", "carregado", "em_viagem", "chegada_destino", "descarga_agendada", "em_descarga", "descarga_realizada", "finalizado"].map(status => (
                <TabsContent key={status} value={status} className="mt-0">
                  <PlanilhaView
                    ordens={status === "all" ? ordensLimitadas : status === "em_andamento" ? ordensLimitadas.filter(o => o.status_tracking !== 'finalizado') : ordensLimitadas.filter(o => o.status_tracking === status)}
                    motoristas={motoristas}
                    veiculos={veiculos}
                    onUpdate={loadData}
                    onExpurgar={(ordem, tipo) => {
                      setSelectedOrdemForExpurgo(ordem);
                      setTipoExpurgo(tipo);
                      setShowExpurgoModal(true);
                    }}
                  />
                </TabsContent>
              ))}
            </Tabs>
          </div>
        )}

        {viewType === "table" && (
          <div className="px-3">
            <Tabs value={viewMode} onValueChange={setViewMode}>
              <div className="overflow-x-auto pb-2">
                <TabsList
                  className="mb-2 h-8 inline-flex min-w-max"
                  style={{ backgroundColor: theme.tabsBg, borderColor: theme.border }}
                >
                  {[
                    { value: "all", label: `Todas (${filteredOrdens.length})` },
                    { value: "em_andamento", label: `Em Andamento (${filteredOrdens.filter(o => o.status_tracking !== 'finalizado').length})` },
                    { value: "aguardando_agendamento", label: `Aguardando (${getOrdensCountByStatus('aguardando_agendamento')})` },
                    { value: "carregamento_agendado", label: `Agendado (${getOrdensCountByStatus('carregamento_agendado')})` },
                    { value: "em_carregamento", label: `Carregando (${getOrdensCountByStatus('em_carregamento')})` },
                    { value: "carregado", label: `Carregado (${getOrdensCountByStatus('carregado')})` },
                    { value: "em_viagem", label: `Em Viagem (${getOrdensCountByStatus('em_viagem')})` },
                    { value: "chegada_destino", label: `No Destino (${getOrdensCountByStatus('chegada_destino')})` },
                    { value: "descarga_agendada", label: `Desc. Agendada (${getOrdensCountByStatus('descarga_agendada')})` },
                    { value: "em_descarga", label: `Descarregando (${getOrdensCountByStatus('em_descarga')})` },
                    { value: "descarga_realizada", label: `Descarregado (${getOrdensCountByStatus('descarga_realizada')})` },
                    { value: "finalizado", label: `Finalizado (${getOrdensCountByStatus('finalizado')})` }
                  ].map(tab => (
                    <TabsTrigger
                      key={tab.value}
                      value={tab.value}
                      className="text-xs h-7 whitespace-nowrap"
                      style={{
                        color: viewMode === tab.value ? theme.text : theme.textMuted,
                        backgroundColor: viewMode === tab.value ? theme.cardBg : 'transparent'
                      }}
                    >
                      {tab.label}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </div>

              {["all", "em_andamento", "aguardando_agendamento", "carregamento_agendado", "em_carregamento", "carregado", "em_viagem", "chegada_destino", "descarga_agendada", "em_descarga", "descarga_realizada", "finalizado"].map(status => (
                <TabsContent key={status} value={status} className="mt-0">
                  <TrackingTable
                    ordens={status === "all" ? ordensLimitadas : status === "em_andamento" ? ordensLimitadas.filter(o => o.status_tracking !== 'finalizado') : ordensLimitadas.filter(o => o.status_tracking === status)}
                    motoristas={motoristas}
                    veiculos={veiculos}
                    operacoes={operacoes}
                    loading={loading}
                    onOrdemClick={(ordem) => {
                      setSelectedOrdem(ordem);
                      setShowTrackingModal(true); // Open the modal when an order is clicked
                    }}
                    onUpdate={loadData}
                    onEditTracking={(ordem) => setEditingOrdem(ordem)}
                    onEditOrdemCompleta={(ordem) => setEditingOrdemCompleta(ordem)}
                    onAbrirChat={handleAbrirChat}
                    onAbrirUpload={handleAbrirUpload}
                    onExpurgar={(ordem, tipo) => {
                      setSelectedOrdemForExpurgo(ordem);
                      setTipoExpurgo(tipo);
                      setShowExpurgoModal(true);
                    }}
                  />
                </TabsContent>
              ))}
            </Tabs>
          </div>
        )}
      </div>

      {selectedOrdem && (
        <OrdemDetails
          open={!!selectedOrdem && showTrackingModal} // Now controlled by both selectedOrdem and showTrackingModal
          onClose={() => {
            setSelectedOrdem(null);
            setShowTrackingModal(false); // Close the modal
          }}
          ordem={selectedOrdem}
          motoristas={motoristas}
          veiculos={veiculos}
          onUpdate={loadData}
          initialTab="tracking"
        />
      )}

      {editingOrdem && (
        <TrackingUpdateModal
          open={!!editingOrdem}
          onClose={() => setEditingOrdem(null)}
          ordem={editingOrdem}
          onUpdate={() => {
            loadData();
            setEditingOrdem(null);
          }}
          onEditOrdemCompleta={(ordem) => {
            setEditingOrdem(null);
            setEditingOrdemCompleta(ordem);
          }}
        />
      )}

      {editingOrdemCompleta && (
        <OrdemFormCompleto
          open={!!editingOrdemCompleta}
          onClose={() => setEditingOrdemCompleta(null)}
          onSubmit={handleSubmitOrdemCompleta}
          motoristas={motoristas}
          veiculos={veiculos}
          editingOrdem={editingOrdemCompleta}
        />
      )}

      {showChat && chatOrdem && (
          <ChatCentral
            open={showChat}
            onClose={() => {
              setShowChat(false);
              setChatOrdem(null);
            }}
            viagem={chatOrdem}
          />
        )}

        {showUpload && uploadOrdem && (
          <UploadDocumentos
            open={showUpload}
            onClose={() => {
              setShowUpload(false);
              setUploadOrdem(null);
            }}
            viagem={uploadOrdem}
          />
        )}

        {showExpurgoModal && selectedOrdemForExpurgo && (
          <ExpurgoModal
            open={showExpurgoModal}
            onClose={() => {
              setShowExpurgoModal(false);
              setSelectedOrdemForExpurgo(null);
              setTipoExpurgo(null);
            }}
            ordem={selectedOrdemForExpurgo}
            tipo={tipoExpurgo}
            onSuccess={() => {
              loadData();
              setShowExpurgoModal(false);
              setSelectedOrdemForExpurgo(null);
              setTipoExpurgo(null);
            }}
          />
        )}

        {showRelatorioSLA && tipoRelatorioSLA && (
          <RelatorioSLAModal 
            tipo={tipoRelatorioSLA}
            dados={prepararDadosSLA(tipoRelatorioSLA)}
            onClose={() => {
              setShowRelatorioSLA(false);
              setTipoRelatorioSLA(null);
            }}
            isDark={isDark}
          />
        )}
    </div>
  );
}

function RelatorioSLAModal({ tipo, dados, onClose, isDark }) {
  const [abaSelecionada, setAbaSelecionada] = useState('grafico');
  const titulo = tipo === 'geral' ? 'Relatório de SLA Geral' : tipo === 'carga' ? 'Relatório de SLA - Carregamento' : 'Relatório de SLA - Entrega';

  const theme = {
    cardBg: isDark ? '#1e293b' : '#ffffff',
    border: isDark ? '#334155' : '#e5e7eb',
    text: isDark ? '#f1f5f9' : '#111827',
    textMuted: isDark ? '#94a3b8' : '#6b7280',
    tabsBg: isDark ? '#0f172a' : '#f9fafb',
  };

  const handleImprimir = () => {
    window.print();
  };

  const formatarData = (dataStr) => {
    if (!dataStr) return '-';
    try {
      return new Date(dataStr).toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return '-';
    }
  };

  const calcularAtraso = (agendado, realizado) => {
    const diff = new Date(realizado) - new Date(agendado);
    const horas = Math.round(diff / (1000 * 60 * 60));
    return horas > 0 ? `+${horas}h` : `${horas}h`;
  };

  const TabelaOrdens = ({ ordens, tipoSLA }) => (
    <div className="overflow-x-auto">
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b" style={{ borderColor: theme.border, backgroundColor: isDark ? '#0f172a' : '#f9fafb' }}>
            <th className="text-left p-2 font-semibold" style={{ color: theme.text }}>Ordem</th>
            <th className="text-left p-2 font-semibold" style={{ color: theme.text }}>Pedido</th>
            <th className="text-left p-2 font-semibold" style={{ color: theme.text }}>Cliente</th>
            <th className="text-left p-2 font-semibold" style={{ color: theme.text }}>Origem - Destino</th>
            <th className="text-left p-2 font-semibold" style={{ color: theme.text }}>Agendado</th>
            <th className="text-left p-2 font-semibold" style={{ color: theme.text }}>Realizado</th>
            <th className="text-left p-2 font-semibold" style={{ color: theme.text }}>Diferença</th>
          </tr>
        </thead>
        <tbody>
          {ordens.map((ordem, idx) => {
            const agendado = tipoSLA === 'carga' ? ordem.carregamento_agendamento_data : ordem.prazo_entrega;
            const realizado = tipoSLA === 'carga' ? ordem.fim_carregamento : ordem.chegada_destino;
            
            return (
              <tr key={idx} className="border-b hover:bg-opacity-50" style={{ borderColor: theme.border }}>
                <td className="p-2 font-mono font-bold" style={{ color: theme.text }}>
                  {ordem.numero_carga || `#${ordem.id.slice(-6)}`}
                </td>
                <td className="p-2" style={{ color: theme.textMuted }}>{ordem.viagem_pedido || '-'}</td>
                <td className="p-2" style={{ color: theme.textMuted }}>{ordem.cliente || '-'}</td>
                <td className="p-2" style={{ color: theme.textMuted }}>
                  {(ordem.origem_cidade || ordem.origem || '-')} - {(ordem.destino_cidade || ordem.destino || '-')}
                </td>
                <td className="p-2" style={{ color: theme.textMuted }}>{formatarData(agendado)}</td>
                <td className="p-2" style={{ color: theme.textMuted }}>{formatarData(realizado)}</td>
                <td className="p-2 font-bold" style={{ color: new Date(realizado) <= new Date(agendado) ? '#22c55e' : '#ef4444' }}>
                  {calcularAtraso(agendado, realizado)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );

  const TabelaExpurgos = ({ ordens, tipoSLA }) => (
    <div className="overflow-x-auto">
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b" style={{ borderColor: theme.border, backgroundColor: isDark ? '#0f172a' : '#f9fafb' }}>
            <th className="text-left p-2 font-semibold" style={{ color: theme.text }}>Ordem</th>
            <th className="text-left p-2 font-semibold" style={{ color: theme.text }}>Pedido</th>
            <th className="text-left p-2 font-semibold" style={{ color: theme.text }}>Cliente</th>
            <th className="text-left p-2 font-semibold" style={{ color: theme.text }}>Origem - Destino</th>
            <th className="text-left p-2 font-semibold" style={{ color: theme.text }}>Motivo</th>
          </tr>
        </thead>
        <tbody>
          {ordens.map((ordem, idx) => {
            const motivo = tipoSLA === 'carga' ? ordem.carregamento_expurgo_motivo : ordem.entrega_expurgo_motivo;
            
            return (
              <tr key={idx} className="border-b hover:bg-opacity-50" style={{ borderColor: theme.border }}>
                <td className="p-2 font-mono font-bold" style={{ color: theme.text }}>
                  {ordem.numero_carga || `#${ordem.id.slice(-6)}`}
                </td>
                <td className="p-2" style={{ color: theme.textMuted }}>{ordem.viagem_pedido || '-'}</td>
                <td className="p-2" style={{ color: theme.textMuted }}>{ordem.cliente || '-'}</td>
                <td className="p-2" style={{ color: theme.textMuted }}>
                  {(ordem.origem_cidade || ordem.origem || '-')} - {(ordem.destino_cidade || ordem.destino || '-')}
                </td>
                <td className="p-2" style={{ color: theme.textMuted }}>{motivo || 'Não informado'}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );

  // Preparar lista única para impressão
  const getListaParaImpressao = () => {
    if (tipo === 'geral') {
      const todasOrdens = [
        ...dados.ordensCarregamento.noPrazo,
        ...dados.ordensCarregamento.foraPrazo,
        ...dados.ordensCarregamento.expurgado,
        ...dados.ordensEntrega.noPrazo,
        ...dados.ordensEntrega.foraPrazo,
        ...dados.ordensEntrega.expurgado
      ];
      // Remover duplicatas
      const ordensUnicas = todasOrdens.filter((ordem, index, self) => 
        index === self.findIndex((o) => o.id === ordem.id)
      );
      return ordensUnicas.sort((a, b) => {
        const dataA = new Date(a.carregamento_agendamento_data || a.prazo_entrega || 0);
        const dataB = new Date(b.carregamento_agendamento_data || b.prazo_entrega || 0);
        return dataA - dataB;
      });
    } else if (tipo === 'carga') {
      const todasOrdens = [
        ...dados.ordensNoPrazo,
        ...dados.ordensForaPrazo,
        ...dados.ordensExpurgadas
      ];
      return todasOrdens.sort((a, b) => {
        const dataA = new Date(a.carregamento_agendamento_data || 0);
        const dataB = new Date(b.carregamento_agendamento_data || 0);
        return dataA - dataB;
      });
    } else {
      const todasOrdens = [
        ...dados.ordensNoPrazo,
        ...dados.ordensForaPrazo,
        ...dados.ordensExpurgadas
      ];
      return todasOrdens.sort((a, b) => {
        const dataA = new Date(a.prazo_entrega || 0);
        const dataB = new Date(b.prazo_entrega || 0);
        return dataA - dataB;
      });
    }
  };

  const listaImpressao = getListaParaImpressao();

  const getStatusSLA = (ordem, tipoSLA) => {
  if (tipoSLA === 'carga') {
    if (ordem.carregamento_expurgado) return { label: 'Expurgado', color: '#64748b' };
    if (ordem.carregamento_agendamento_data) {
      const agendado = new Date(ordem.carregamento_agendamento_data);
      // Se entrada_galpao vazio, usar data atual
      const realizado = ordem.entrada_galpao 
        ? new Date(ordem.entrada_galpao)
        : getDataAtualSP();
      return realizado <= agendado ? { label: 'No Prazo', color: '#22c55e' } : { label: 'Fora do Prazo', color: '#ef4444' };
    }
    return { label: '-', color: theme.textMuted };
  } else {
    if (ordem.entrega_expurgada) return { label: 'Expurgado', color: '#64748b' };
    if (ordem.prazo_entrega) {
      const prazo = new Date(ordem.prazo_entrega);
      // Se chegada_destino vazio, usar data atual
      const realizado = ordem.chegada_destino 
        ? new Date(ordem.chegada_destino)
        : getDataAtualSP();
      return realizado <= prazo ? { label: 'No Prazo', color: '#22c55e' } : { label: 'Fora do Prazo', color: '#ef4444' };
    }
    return { label: '-', color: theme.textMuted };
  }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .relatorio-sla-print, .relatorio-sla-print * {
            visibility: visible !important;
          }
          .relatorio-sla-print {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .no-print {
            display: none !important;
          }
          @media print {
            .relatorio-sla-print table {
              font-size: 8px !important;
            }
            .relatorio-sla-print th,
            .relatorio-sla-print td {
              padding: 3px !important;
              word-break: break-word;
              line-height: 1.2;
            }
            .relatorio-sla-print h3 {
              font-size: 11px !important;
            }
            .relatorio-sla-print .resumo-card {
              font-size: 9px !important;
            }
            .relatorio-sla-print .resumo-card .text-xl {
              font-size: 16px !important;
            }
            .resumo-section {
              page-break-inside: avoid;
              margin-bottom: 20px !important;
            }
          }
          @page {
            size: A4 landscape;
            margin: 0.4cm;
          }
        }
      `}</style>
      <Card className="w-full max-w-7xl max-h-[90vh] overflow-auto relatorio-sla-print" style={{ backgroundColor: theme.cardBg, borderColor: theme.border }}>
        <CardHeader className="border-b sticky top-0 z-10" style={{ borderColor: theme.border, backgroundColor: theme.cardBg }}>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg" style={{ color: theme.text }}>{titulo}</CardTitle>
            <div className="flex gap-2 no-print">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleImprimir}
                className="flex items-center gap-2"
                style={{ borderColor: theme.border, color: theme.text }}
              >
                <Printer className="w-4 h-4" />
                Imprimir
              </Button>
              <Button variant="ghost" size="sm" onClick={onClose} style={{ color: theme.text }}>✕</Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4 space-y-4">
          {/* Cabeçalho e totais - sempre visível */}
          <div className="mb-4">
            <h3 className="text-sm font-semibold" style={{ color: theme.text }}>
              Total de Ordens: {listaImpressao.length}
            </h3>
            <p className="text-xs" style={{ color: theme.textMuted }}>
              Ordenado por {tipo === 'carga' ? 'Data de Agendamento de Carga' : tipo === 'entrega' ? 'Prazo de Entrega' : 'Data de Agendamento'}
            </p>
          </div>

          {/* Totalizadores */}
          <div className="mb-6 resumo-section">
            <div className="grid grid-cols-5 gap-3 resumo-cards">
              <div className="p-2 rounded border resumo-card" style={{ backgroundColor: '#eff6ff', borderColor: '#93c5fd' }}>
                <div className="text-xs text-blue-600 font-medium">Total de Ordens</div>
                <div className="text-xl font-bold text-blue-900">{listaImpressao.length}</div>
              </div>
              <div className="p-2 rounded border resumo-card" style={{ backgroundColor: '#f0fdf4', borderColor: '#86efac' }}>
                <div className="text-xs text-green-600 font-medium">No Prazo</div>
                <div className="text-xl font-bold text-green-900">
                  {(() => {
                    if (tipo === 'geral') {
                      return listaImpressao.filter(ordem => 
                       getStatusSLA(ordem, 'carga').label === 'No Prazo' && getStatusSLA(ordem, 'entrega').label === 'No Prazo'
                      ).length;
                      }
                      return listaImpressao.filter(ordem => getStatusSLA(ordem, tipo).label === 'No Prazo').length;
                      })()}
                      </div>
                      </div>
                      <div className="p-2 rounded border resumo-card" style={{ backgroundColor: '#fee2e2', borderColor: '#fca5a5' }}>
                      <div className="text-xs text-red-600 font-medium">Fora do Prazo</div>
                      <div className="text-xl font-bold text-red-900">
                      {(() => {
                      if (tipo === 'geral') {
                      return listaImpressao.filter(ordem => 
                       getStatusSLA(ordem, 'carga').label === 'Fora do Prazo' || getStatusSLA(ordem, 'entrega').label === 'Fora do Prazo'
                      ).length;
                      }
                      return listaImpressao.filter(ordem => getStatusSLA(ordem, tipo).label === 'Fora do Prazo').length;
                      })()}
                      </div>
                      </div>
                      <div className="p-2 rounded border resumo-card" style={{ backgroundColor: '#f3f4f6', borderColor: '#d1d5db' }}>
                      <div className="text-xs text-gray-600 font-medium">Expurgos</div>
                      <div className="text-xl font-bold text-gray-900">
                      {(() => {
                      if (tipo === 'geral') {
                      return listaImpressao.filter(ordem => ordem.carregamento_expurgado || ordem.entrega_expurgada).length;
                      }
                      return listaImpressao.filter(ordem => 
                      tipo === 'carga' ? ordem.carregamento_expurgado : ordem.entrega_expurgada
                      ).length;
                      })()}
                      </div>
                      </div>
                      <div className="p-2 rounded border resumo-card" style={{ backgroundColor: '#ecfdf5', borderColor: '#6ee7b7' }}>
                      <div className="text-xs text-green-700 font-medium">% no Prazo</div>
                      <div className="text-xl font-bold text-green-900">
                      {(() => {
                      if (tipo === 'geral') {
                      // Calcular SLA de Carga
                      const totalCarga = listaImpressao.filter(o => o.carregamento_agendamento_data).length;
                      const noPrazoCarga = listaImpressao.filter(o => getStatusSLA(o, 'carga').label === 'No Prazo').length;
                      const percCarga = totalCarga > 0 ? (noPrazoCarga / totalCarga) * 100 : 0;

                      // Calcular SLA de Descarga
                      const totalDescarga = listaImpressao.filter(o => o.prazo_entrega).length;
                      const noPrazoDescarga = listaImpressao.filter(o => getStatusSLA(o, 'entrega').label === 'No Prazo').length;
                      const percDescarga = totalDescarga > 0 ? (noPrazoDescarga / totalDescarga) * 100 : 0;
                      
                      // Média dos dois SLAs
                      const mediaSLA = (percCarga + percDescarga) / 2;
                      return mediaSLA.toFixed(2);
                    } else {
                      const noPrazo = listaImpressao.filter(ordem => getStatusSLA(ordem, tipo).label === 'No Prazo').length;
                      const totalConsiderado = listaImpressao.filter(ordem => 
                        tipo === 'carga' 
                          ? ordem.carregamento_agendamento_data
                          : ordem.prazo_entrega
                      ).length;
                      return totalConsiderado > 0 ? ((noPrazo / totalConsiderado) * 100).toFixed(2) : '0.00';
                    }
                  })()}%
                </div>
                {tipo === 'geral' && (
                  <div className="mt-2 pt-2 border-t grid grid-cols-2 gap-2" style={{ borderColor: '#86efac' }}>
                    <div>
                      <div className="text-[9px] text-blue-700 font-medium">SLA Carga</div>
                      <div className="text-sm font-bold text-blue-900">
                        {(() => {
                          const totalCarga = listaImpressao.filter(o => o.carregamento_agendamento_data).length;
                          const noPrazoCarga = listaImpressao.filter(o => getStatusSLA(o, 'carga').label === 'No Prazo').length;
                          return totalCarga > 0 ? ((noPrazoCarga / totalCarga) * 100).toFixed(2) : '0.00';
                        })()}%
                      </div>
                    </div>
                    <div>
                      <div className="text-[9px] text-purple-700 font-medium">SLA Descarga</div>
                      <div className="text-sm font-bold text-purple-900">
                        {(() => {
                          const totalDescarga = listaImpressao.filter(o => o.prazo_entrega).length;
                          const noPrazoDescarga = listaImpressao.filter(o => getStatusSLA(o, 'entrega').label === 'No Prazo').length;
                          return totalDescarga > 0 ? ((noPrazoDescarga / totalDescarga) * 100).toFixed(2) : '0.00';
                        })()}%
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Tabela de ordens - sempre visível */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr style={{ borderBottom: `2px solid ${theme.border}`, backgroundColor: '#f9fafb' }}>
                  <th className="text-left p-2 font-semibold" style={{ width: '6%' }}>Ordem</th>
                  <th className="text-left p-2 font-semibold" style={{ width: '6%' }}>Pedido</th>
                  <th className="text-left p-2 font-semibold" style={{ width: '10%' }}>Cliente</th>
                  <th className="text-left p-2 font-semibold" style={{ width: '12%' }}>Origem - Destino</th>
                  {tipo === 'geral' && <th className="text-left p-2 font-semibold" style={{ width: '9%' }}>Agenda Carga</th>}
                  {tipo === 'geral' && <th className="text-left p-2 font-semibold" style={{ width: '9%' }}>Chegada Carga</th>}
                  {tipo === 'geral' && <th className="text-left p-2 font-semibold" style={{ width: '7%' }}>SLA Carga</th>}
                  {tipo === 'geral' && <th className="text-left p-2 font-semibold" style={{ width: '9%' }}>Agenda Descarga</th>}
                  {tipo === 'geral' && <th className="text-left p-2 font-semibold" style={{ width: '9%' }}>Chegada Descarga</th>}
                  {tipo === 'geral' && <th className="text-left p-2 font-semibold" style={{ width: '7%' }}>SLA Descarga</th>}
                  {tipo === 'geral' && <th className="text-left p-2 font-semibold" style={{ width: '16%' }}>Motivo Expurgo</th>}
                  {tipo !== 'geral' && <th className="text-left p-2 font-semibold" style={{ width: '11%' }}>Agendado</th>}
                  {tipo !== 'geral' && <th className="text-left p-2 font-semibold" style={{ width: '11%' }}>Realizado</th>}
                  {tipo !== 'geral' && <th className="text-left p-2 font-semibold" style={{ width: '10%' }}>Status SLA</th>}
                  {tipo !== 'geral' && <th className="text-left p-2 font-semibold" style={{ width: '8%' }}>Diferença</th>}
                  {tipo !== 'geral' && <th className="text-left p-2 font-semibold" style={{ width: '16%' }}>Motivo Expurgo</th>}
                </tr>
              </thead>
              <tbody>
                {listaImpressao.map((ordem, idx) => {
                  const agendado = tipo === 'carga' ? ordem.carregamento_agendamento_data : ordem.prazo_entrega;
                  const realizado = tipo === 'carga' ? ordem.inicio_carregamento : ordem.chegada_destino;
                  const statusSLA = tipo !== 'geral' ? getStatusSLA(ordem, tipo) : null;
                  const statusCarga = tipo === 'geral' ? getStatusSLA(ordem, 'carga') : null;
                  const statusEntrega = tipo === 'geral' ? getStatusSLA(ordem, 'entrega') : null;
                  const motivoExpurgoCarga = ordem.carregamento_expurgado ? (ordem.carregamento_expurgo_motivo || 'Não informado') : '-';
                  const motivoExpurgoEntrega = ordem.entrega_expurgada ? (ordem.entrega_expurgo_motivo || 'Não informado') : '-';
                  const motivoExpurgo = tipo === 'carga' ? motivoExpurgoCarga : motivoExpurgoEntrega;
                  const motivoExpurgoGeral = ordem.carregamento_expurgado || ordem.entrega_expurgada 
                    ? (ordem.carregamento_expurgado ? `Carga: ${motivoExpurgoCarga}` : '') + (ordem.entrega_expurgada && ordem.carregamento_expurgado ? ' | ' : '') + (ordem.entrega_expurgada ? `Entrega: ${motivoExpurgoEntrega}` : '')
                    : '-';
                  
                  return (
                    <tr key={idx} style={{ borderBottom: `1px solid ${theme.border}` }}>
                      <td className="p-2 font-mono font-bold">{ordem.numero_carga || `#${ordem.id.slice(-6)}`}</td>
                      <td className="p-2">{ordem.viagem_pedido || '-'}</td>
                      <td className="p-2">{ordem.cliente || '-'}</td>
                      <td className="p-2">
                        {(ordem.origem_cidade || ordem.origem || '-')} - {(ordem.destino_cidade || ordem.destino || '-')}
                      </td>
                      {tipo === 'geral' && (
                        <>
                              <td className="p-2">{formatarData(ordem.carregamento_agendamento_data)}</td>
                              <td className="p-2">{formatarData(ordem.inicio_carregamento)}</td>
                              <td className="p-2 font-bold" style={{ color: statusCarga.color }}>{statusCarga.label}</td>
                              <td className="p-2">{formatarData(ordem.prazo_entrega)}</td>
                              <td className="p-2">{formatarData(ordem.chegada_destino)}</td>
                              <td className="p-2 font-bold" style={{ color: statusEntrega.color }}>{statusEntrega.label}</td>
                              <td className="p-2 text-xs">{motivoExpurgoGeral}</td>
                            </>
                          )}
                          {tipo !== 'geral' && (
                            <>
                              <td className="p-2">{formatarData(agendado)}</td>
                              <td className="p-2">{formatarData(realizado)}</td>
                          <td className="p-2 font-bold" style={{ color: statusSLA.color }}>{statusSLA.label}</td>
                          <td className="p-2 font-bold" style={{ color: agendado && realizado ? (new Date(realizado) <= new Date(agendado) ? '#22c55e' : '#ef4444') : theme.textMuted }}>
                            {agendado && realizado ? calcularAtraso(agendado, realizado) : '-'}
                          </td>
                          <td className="p-2 text-xs">{motivoExpurgo}</td>
                        </>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Versão para tela - com gráfico e abas */}
          <div className="no-print">
          {/* Gráfico */}
          <div className="p-4 rounded-lg border" style={{ backgroundColor: theme.cardBg, borderColor: theme.border }}>
            <h3 className="text-sm font-semibold mb-4" style={{ color: theme.text }}>
              {tipo === 'geral' ? 'Desempenho de SLA' : `Desempenho por ${tipo === 'carga' ? 'Data de Carregamento' : 'Data de Entrega'}`}
            </h3>
            {tipo === 'geral' && (
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="p-3 rounded-lg border-l-4 border-blue-500" style={{ backgroundColor: isDark ? '#1e293b' : '#eff6ff', borderColor: theme.border }}>
                  <div className="flex items-center gap-2 mb-2">
                    <Package className="w-4 h-4 text-blue-600" />
                    <span className="text-xs font-bold text-blue-600">SLA Carregamento</span>
                  </div>
                  <div className="text-2xl font-bold text-blue-900">{dados.percCarregamentoNoPrazo}%</div>
                  <p className="text-xs text-blue-700 mt-1">
                    {dados.ordensCarregamento.noPrazo.length} no prazo de {dados.ordensCarregamento.noPrazo.length + dados.ordensCarregamento.foraPrazo.length}
                  </p>
                </div>
                <div className="p-3 rounded-lg border-l-4 border-purple-500" style={{ backgroundColor: isDark ? '#1e293b' : '#f5f3ff', borderColor: theme.border }}>
                  <div className="flex items-center gap-2 mb-2">
                    <Truck className="w-4 h-4 text-purple-600" />
                    <span className="text-xs font-bold text-purple-600">SLA Entrega</span>
                  </div>
                  <div className="text-2xl font-bold text-purple-900">{dados.percEntregaNoPrazo}%</div>
                  <p className="text-xs text-purple-700 mt-1">
                    {dados.ordensEntrega.noPrazo.length} no prazo de {dados.ordensEntrega.noPrazo.length + dados.ordensEntrega.foraPrazo.length}
                  </p>
                </div>
              </div>
            )}
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dados.grafico}>
                <CartesianGrid strokeDasharray="3 3" stroke={theme.border} />
                <XAxis 
                  dataKey={tipo === 'geral' ? 'nome' : 'data'} 
                  tick={{ fontSize: 11, fill: theme.text }} 
                />
                <YAxis tick={{ fontSize: 11, fill: theme.text }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: theme.cardBg, 
                    borderColor: theme.border,
                    color: theme.text 
                  }} 
                />
                <Legend wrapperStyle={{ color: theme.text }} />
                {tipo === 'geral' ? (
                  <>
                    <Bar dataKey="Carregamento" fill="#3b82f6" />
                    <Bar dataKey="Entrega" fill="#8b5cf6" />
                  </>
                ) : (
                  <>
                    <Bar dataKey="No Prazo" fill="#22c55e" />
                    <Bar dataKey="Fora do Prazo" fill="#ef4444" />
                    <Bar dataKey="Expurgado" fill="#64748b" />
                  </>
                )}
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Detalhamento das Ordens */}
          {tipo === 'geral' ? (
            <div className="space-y-4">
              {/* Carregamento */}
              <div className="p-4 rounded-lg border" style={{ backgroundColor: theme.cardBg, borderColor: theme.border }}>
                <h3 className="text-sm font-semibold mb-3 flex items-center gap-2" style={{ color: theme.text }}>
                  <Package className="w-4 h-4 text-blue-600" />
                  SLA de Carregamento
                </h3>
                
                <Tabs value={abaSelecionada} onValueChange={setAbaSelecionada}>
                  <TabsList style={{ backgroundColor: theme.tabsBg }}>
                    <TabsTrigger value="grafico" className="text-xs">Resumo</TabsTrigger>
                    <TabsTrigger value="noPrazo_carga" className="text-xs">
                      No Prazo ({dados.ordensCarregamento.noPrazo.length})
                    </TabsTrigger>
                    <TabsTrigger value="foraPrazo_carga" className="text-xs">
                      Fora do Prazo ({dados.ordensCarregamento.foraPrazo.length})
                    </TabsTrigger>
                    <TabsTrigger value="expurgado_carga" className="text-xs">
                      Expurgados ({dados.ordensCarregamento.expurgado.length})
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="noPrazo_carga" className="mt-3">
                    {dados.ordensCarregamento.noPrazo.length > 0 ? (
                      <TabelaOrdens ordens={dados.ordensCarregamento.noPrazo} tipoSLA="carga" />
                    ) : (
                      <p className="text-center text-sm py-4" style={{ color: theme.textMuted }}>Nenhuma ordem nesta categoria</p>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="foraPrazo_carga" className="mt-3">
                    {dados.ordensCarregamento.foraPrazo.length > 0 ? (
                      <TabelaOrdens ordens={dados.ordensCarregamento.foraPrazo} tipoSLA="carga" />
                    ) : (
                      <p className="text-center text-sm py-4" style={{ color: theme.textMuted }}>Nenhuma ordem nesta categoria</p>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="expurgado_carga" className="mt-3">
                    {dados.ordensCarregamento.expurgado.length > 0 ? (
                      <TabelaExpurgos ordens={dados.ordensCarregamento.expurgado} tipoSLA="carga" />
                    ) : (
                      <p className="text-center text-sm py-4" style={{ color: theme.textMuted }}>Nenhuma ordem nesta categoria</p>
                    )}
                  </TabsContent>
                </Tabs>
              </div>

              {/* Entrega */}
              <div className="p-4 rounded-lg border" style={{ backgroundColor: theme.cardBg, borderColor: theme.border }}>
                <h3 className="text-sm font-semibold mb-3 flex items-center gap-2" style={{ color: theme.text }}>
                  <Truck className="w-4 h-4 text-purple-600" />
                  SLA de Entrega
                </h3>
                
                <Tabs value={abaSelecionada} onValueChange={setAbaSelecionada}>
                  <TabsList style={{ backgroundColor: theme.tabsBg }}>
                    <TabsTrigger value="grafico" className="text-xs">Resumo</TabsTrigger>
                    <TabsTrigger value="noPrazo_entrega" className="text-xs">
                      No Prazo ({dados.ordensEntrega.noPrazo.length})
                    </TabsTrigger>
                    <TabsTrigger value="foraPrazo_entrega" className="text-xs">
                      Fora do Prazo ({dados.ordensEntrega.foraPrazo.length})
                    </TabsTrigger>
                    <TabsTrigger value="expurgado_entrega" className="text-xs">
                      Expurgados ({dados.ordensEntrega.expurgado.length})
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="noPrazo_entrega" className="mt-3">
                    {dados.ordensEntrega.noPrazo.length > 0 ? (
                      <TabelaOrdens ordens={dados.ordensEntrega.noPrazo} tipoSLA="entrega" />
                    ) : (
                      <p className="text-center text-sm py-4" style={{ color: theme.textMuted }}>Nenhuma ordem nesta categoria</p>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="foraPrazo_entrega" className="mt-3">
                    {dados.ordensEntrega.foraPrazo.length > 0 ? (
                      <TabelaOrdens ordens={dados.ordensEntrega.foraPrazo} tipoSLA="entrega" />
                    ) : (
                      <p className="text-center text-sm py-4" style={{ color: theme.textMuted }}>Nenhuma ordem nesta categoria</p>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="expurgado_entrega" className="mt-3">
                    {dados.ordensEntrega.expurgado.length > 0 ? (
                      <TabelaExpurgos ordens={dados.ordensEntrega.expurgado} tipoSLA="entrega" />
                    ) : (
                      <p className="text-center text-sm py-4" style={{ color: theme.textMuted }}>Nenhuma ordem nesta categoria</p>
                    )}
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-lg border" style={{ backgroundColor: theme.cardBg, borderColor: theme.border }}>
              <Tabs defaultValue="noPrazo">
                <TabsList style={{ backgroundColor: theme.tabsBg }}>
                  <TabsTrigger value="noPrazo" className="text-xs">
                    No Prazo ({dados.ordensNoPrazo.length})
                  </TabsTrigger>
                  <TabsTrigger value="foraPrazo" className="text-xs">
                    Fora do Prazo ({dados.ordensForaPrazo.length})
                  </TabsTrigger>
                  <TabsTrigger value="expurgado" className="text-xs">
                    Expurgados ({dados.ordensExpurgadas.length})
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="noPrazo" className="mt-3">
                  {dados.ordensNoPrazo.length > 0 ? (
                    <TabelaOrdens ordens={dados.ordensNoPrazo} tipoSLA={tipo === 'carga' ? 'carga' : 'entrega'} />
                  ) : (
                    <p className="text-center text-sm py-4" style={{ color: theme.textMuted }}>Nenhuma ordem nesta categoria</p>
                  )}
                </TabsContent>
                
                <TabsContent value="foraPrazo" className="mt-3">
                  {dados.ordensForaPrazo.length > 0 ? (
                    <TabelaOrdens ordens={dados.ordensForaPrazo} tipoSLA={tipo === 'carga' ? 'carga' : 'entrega'} />
                  ) : (
                    <p className="text-center text-sm py-4" style={{ color: theme.textMuted }}>Nenhuma ordem nesta categoria</p>
                  )}
                </TabsContent>
                
                <TabsContent value="expurgado" className="mt-3">
                  {dados.ordensExpurgadas.length > 0 ? (
                    <TabelaExpurgos ordens={dados.ordensExpurgadas} tipoSLA={tipo === 'carga' ? 'carga' : 'entrega'} />
                  ) : (
                    <p className="text-center text-sm py-4" style={{ color: theme.textMuted }}>✅ Nenhum expurgo registrado</p>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}