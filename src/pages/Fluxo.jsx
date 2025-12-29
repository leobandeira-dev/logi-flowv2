import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import OrdemDetails from "../components/ordens/OrdemDetails";
import OrdemUnificadaForm from "../components/ordens/OrdemUnificadaForm";
import QuickStatusPopover from "../components/fluxo/QuickStatusPopover";
import FiltrosPredefinidos from "../components/filtros/FiltrosPredefinidos";
import PaginacaoControles from "../components/filtros/PaginacaoControles";
import FiltroDataPeriodo from "../components/filtros/FiltroDataPeriodo";
import { toast } from "sonner";
import {
  Search,
  Filter,
  Calendar,
  Edit,
  RefreshCw,
  Package,
  LayoutList,
  Clock,
  CheckCircle2,
  AlertCircle,
  User,
  Truck,
  PlayCircle,
  Settings,
  ExternalLink,
  List,
  Building2
} from "lucide-react";
import { format, differenceInHours, differenceInDays, differenceInMinutes, addHours } from "date-fns";
import { ptBR } from "date-fns/locale";
import FilterModal from "../components/dashboard/FilterModal";
import FiltroPeriodo from "../components/filtros/FiltroPeriodo";


export default function Fluxo() {
  const [ordens, setOrdens] = useState([]);
  const [motoristas, setMotoristas] = useState([]);
  const [veiculos, setVeiculos] = useState([]);
  const [etapas, setEtapas] = useState([]);
  const [ordensetapas, setOrdensEtapas] = useState([]);
  const [ocorrencias, setOcorrencias] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [departamentos, setDepartamentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState("timeline");
  const [selectedOrdem, setSelectedOrdem] = useState(null);
  const [ordemParaEditar, setOrdemParaEditar] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [limite, setLimite] = useState(20);
  const [filtroAtribuicao, setFiltroAtribuicao] = useState("todos");

  const [periodoSelecionado, setPeriodoSelecionado] = useState("mes_atual");
  const [anoSelecionado, setAnoSelecionado] = useState(new Date().getFullYear());
  const [mesSelecionado, setMesSelecionado] = useState(new Date().getMonth() + 1);
  const [dataInicioPersonalizada, setDataInicioPersonalizada] = useState("");
  const [dataFimPersonalizada, setDataFimPersonalizada] = useState("");
  
  const [filters, setFilters] = useState({
    etapaId: "",
    status: "",
    frota: "",
    operacoesIds: [],
    origem: "",
    destino: "",
    motoristaId: "",
    tiposOrdem: ["negociando", "alocado"], // Padrão: apenas negociando e alocado
    modalidadeCarga: ""
  });
  const [showFilters, setShowFilters] = useState(false);
  const [operacoes, setOperacoes] = useState([]);
  const [isDark, setIsDark] = useState(document.documentElement.classList.contains('dark'));
  const [paginaAtual, setPaginaAtual] = useState(1);

  // Estado para iniciar fluxo de ofertas
  const [iniciandoFluxo, setIniciandoFluxo] = useState(false);

  // Estado para processar etapas de novembro (ADMIN)
  const [processandoNovembro, setProcessandoNovembro] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showModalConcluir, setShowModalConcluir] = useState(false);
  const [dataInicioConcluir, setDataInicioConcluir] = useState("");
  const [dataFimConcluir, setDataFimConcluir] = useState("");
  const [progressoTotal, setProgressoTotal] = useState(0);
  const [progressoAtual, setProgressoAtual] = useState(0);

  // Listener para detectar mudanças no dark mode
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
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const user = await base44.auth.me();
      setCurrentUser(user);
      setIsAdmin(user?.role === "admin");
    } catch (error) {
      console.error("Erro ao carregar usuário:", error);
    }
  };

  const processarEtapasPorPeriodo = async () => {
    if (!dataInicioConcluir || !dataFimConcluir) {
      toast.error('Informe o período de datas');
      return;
    }

    // Iniciar processamento
    setProcessandoNovembro(true);
    setProgressoAtual(0);
    setProgressoTotal(1);

    try {
      console.log('🔍 INICIANDO PROCESSAMENTO');
      console.log('📅 Período selecionado:', dataInicioConcluir, 'até', dataFimConcluir);

      const [todasOrdens, todasEtapasOrdem, todasEtapasConfig] = await Promise.all([
        base44.entities.OrdemDeCarregamento.list(),
        base44.entities.OrdemEtapa.list(),
        base44.entities.Etapa.list("ordem")
      ]);

      console.log('📦 Total ordens sistema:', todasOrdens.length);
      console.log('📋 Total OrdemEtapa sistema:', todasEtapasOrdem.length);
      console.log('⚙️ Total Etapas config:', todasEtapasConfig.length);

      const [anoInicio, mesInicio, diaInicio] = dataInicioConcluir.split('-').map(n => parseInt(n));
      const [anoFim, mesFim, diaFim] = dataFimConcluir.split('-').map(n => parseInt(n));
      
      const inicio = new Date(anoInicio, mesInicio - 1, diaInicio, 0, 0, 0);
      const fim = new Date(anoFim, mesFim - 1, diaFim, 23, 59, 59);
      
      console.log('🎯 Período filtro:', inicio.toISOString(), 'até', fim.toISOString());

      // 1. Buscar ORDENS criadas no período
      const ordensPeriodo = todasOrdens.filter(ordem => {
        if (!ordem.created_date) return false;
        const dataOrdem = new Date(ordem.created_date);
        return dataOrdem >= inicio && dataOrdem <= fim;
      });

      console.log('✅ Ordens encontradas no período:', ordensPeriodo.length);
      console.log('📊 IDs das primeiras 5 ordens:', ordensPeriodo.slice(0, 5).map(o => o.numero_carga || o.id.slice(-6)));

      if (ordensPeriodo.length === 0) {
        toast.warning('Nenhuma ordem encontrada no período');
        setProcessandoNovembro(false);
        setProgressoTotal(0);
        return;
      }

      const dataAtual = new Date().toISOString();
      
      // IDs das ordens do período
      const ordensIds = new Set(ordensPeriodo.map(o => o.id));

      // Buscar APENAS etapas existentes e não concluídas
      const etapasNaoConcluidas = todasEtapasOrdem.filter(etapa => 
        ordensIds.has(etapa.ordem_id) && 
        etapa.status !== "concluida" && 
        etapa.status !== "cancelada"
      );

      console.log(`📋 Etapas existentes não concluídas: ${etapasNaoConcluidas.length}`);

      if (etapasNaoConcluidas.length === 0) {
        toast.info('Nenhuma etapa não concluída encontrada no período');
        setProcessandoNovembro(false);
        setProgressoTotal(0);
        return;
      }

      setProgressoTotal(etapasNaoConcluidas.length);

      // Processar em lotes otimizados
      const BATCH_SIZE = 20;
      const DELAY_MS = 500;
      let processadas = 0;

      for (let i = 0; i < etapasNaoConcluidas.length; i += BATCH_SIZE) {
        const batch = etapasNaoConcluidas.slice(i, i + BATCH_SIZE);
        
        try {
          await Promise.all(
            batch.map(etapa => 
              base44.entities.OrdemEtapa.update(etapa.id, {
                status: "concluida",
                data_conclusao: dataAtual,
                data_inicio: etapa.data_inicio || dataAtual
              })
            )
          );
          
          processadas += batch.length;
          setProgressoAtual(processadas);
          console.log(`✅ ${processadas}/${etapasNaoConcluidas.length}`);
        } catch (error) {
          console.error(`❌ Erro no lote:`, error);
        }
        
        if (i + BATCH_SIZE < etapasNaoConcluidas.length) {
          await new Promise(resolve => setTimeout(resolve, DELAY_MS));
        }
      }

      const totalEtapasProcessadas = processadas;

      console.log('✅ PROCESSAMENTO COMPLETO!');
      console.log(`📊 Total: ${totalEtapasProcessadas} etapas atualizadas`);
      toast.success(`✅ ${totalEtapasProcessadas} etapas concluídas!`);
      setShowModalConcluir(false);
      setDataInicioConcluir("");
      setDataFimConcluir("");
      
      // Forçar reload completo da página para garantir dados atualizados
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      console.error('❌ ERRO:', error);
      toast.error(`Erro: ${error.message}`);
    } finally {
      setProcessandoNovembro(false);
      setProgressoAtual(0);
      setProgressoTotal(0);
    }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const user = await base44.auth.me();

      // Carregar dados básicos primeiro
      const [ordensData, etapasData, ordensEtapasData, motoristasData, veiculosData, operacoesData, ocorrenciasData, departamentosData] = await Promise.all([
        base44.entities.OrdemDeCarregamento.list("-data_solicitacao"),
        base44.entities.Etapa.list("ordem"),
        base44.entities.OrdemEtapa.list(),
        base44.entities.Motorista.list(),
        base44.entities.Veiculo.list(),
        base44.entities.Operacao.list(),
        base44.entities.Ocorrencia.list(),
        base44.entities.Departamento.list()
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
      
      setDepartamentos(departamentosData);

      // FILTRO DE SEGURANÇA: Apenas admins veem tudo, demais usuários veem apenas sua empresa
      let ordensFiltradas;

      if (user.role === "admin") {
        ordensFiltradas = ordensData;
      } else if (user.empresa_id) {
        ordensFiltradas = ordensData.filter(o =>
          o.empresa_id === user.empresa_id ||
          !o.empresa_id
        );
      } else {
        ordensFiltradas = ordensData;
      }

      setOrdens(ordensFiltradas);
      setEtapas(etapasData.filter(e => e.ativo));
      setOrdensEtapas(ordensEtapasData);
      setMotoristas(motoristasData);
      setVeiculos(veiculosData);
      setOperacoes(operacoesData.filter(op => op.ativo));
      setOcorrencias(ocorrenciasData);
      setUsuarios(usuariosData);
    } catch (error) {
      console.error("❌ FLUXO - Erro ao carregar dados:", error);
    } finally {
      setLoading(false);
    }
  };

  // Função para iniciar o fluxo de uma ordem (criar primeira etapa)
  const iniciarFluxoOrdem = async (ordem) => {
    setIniciandoFluxo(true);
    try {
      if (etapas.length === 0) {
        alert("Não há etapas configuradas. Configure as etapas primeiro.");
        return;
      }

      const primeiraEtapa = etapas[0];

      await base44.entities.OrdemEtapa.create({
        ordem_id: ordem.id,
        etapa_id: primeiraEtapa.id,
        status: "em_andamento",
        data_inicio: new Date().toISOString(),
        responsavel_id: primeiraEtapa.responsavel_id || currentUser?.id,
        departamento_responsavel_id: primeiraEtapa.departamento_responsavel_id || undefined
      });

      await loadData();
    } catch (error) {
      console.error("Erro ao iniciar fluxo:", error);
      alert("Erro ao iniciar fluxo. Tente novamente.");
    } finally {
      setIniciandoFluxo(false);
    }
  };

  const updateOrdemEtapa = async (ordemEtapaId, data, retryCount = 0) => {
    const MAX_RETRIES = 3;
    const RETRY_DELAY = 1000;

    try {
      // Caso especial: apenas recarregar dados
      if (ordemEtapaId === null) {
        const ordensEtapasAtualizadas = await base44.entities.OrdemEtapa.list();
        setOrdensEtapas(ordensEtapasAtualizadas);
        return;
      }

      // Validação rigorosa de entrada
      if (!ordemEtapaId || typeof ordemEtapaId !== 'string') {
        console.error("❌ FLUXO - ID inválido:", ordemEtapaId);
        throw new Error("ID da etapa é obrigatório");
      }

      if (!data || typeof data !== 'object') {
        console.error("❌ FLUXO - Dados inválidos:", data);
        throw new Error("Dados para atualização são obrigatórios");
      }

      // Log detalhado antes da atualização
      console.log(`🔄 FLUXO - Atualizando OrdemEtapa:`, {
        ordemEtapaId: ordemEtapaId.slice(-6),
        dados: data,
        tentativa: retryCount + 1
      });

      // Verificar se o registro ainda existe antes de atualizar (prevenir race conditions)
      const registroAtual = ordensetapas.find(oe => oe.id === ordemEtapaId);
      if (!registroAtual) {
        console.warn("⚠️ FLUXO - Registro não encontrado localmente, recarregando...");
        await loadData();
        throw new Error("Registro não encontrado. Dados recarregados, tente novamente.");
      }

      // Executar a atualização
      await base44.entities.OrdemEtapa.update(ordemEtapaId, data);

      console.log(`✅ FLUXO - OrdemEtapa atualizada com sucesso:`, ordemEtapaId.slice(-6));

      // Recarregar apenas OrdemEtapa ao invés de tudo
      const ordensEtapasAtualizadas = await base44.entities.OrdemEtapa.list();
      setOrdensEtapas(ordensEtapasAtualizadas);

      // Verificar se a atualização foi persistida
      const registroAtualizado = ordensEtapasAtualizadas.find(oe => oe.id === ordemEtapaId);
      if (!registroAtualizado) {
        throw new Error("Registro não encontrado após atualização");
      }

      // Validar se os dados foram salvos corretamente
      if (data.status && registroAtualizado.status !== data.status) {
        console.warn("⚠️ FLUXO - Status não foi atualizado corretamente, retry necessário");
        throw new Error("Dados não foram salvos corretamente");
      }

      return registroAtualizado;

    } catch (error) {
      console.error(`❌ FLUXO - Erro ao atualizar (tentativa ${retryCount + 1}/${MAX_RETRIES}):`, error);

      // Retry automático em caso de falha
      if (retryCount < MAX_RETRIES) {
        console.log(`🔄 FLUXO - Tentando novamente em ${RETRY_DELAY}ms...`);
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * (retryCount + 1)));
        return updateOrdemEtapa(ordemEtapaId, data, retryCount + 1);
      }

      // Após 3 tentativas, mostrar erro ao usuário
      const mensagemErro = `Erro ao atualizar etapa: ${error.message || 'Erro desconhecido'}. Tente novamente.`;
      toast.error(mensagemErro);
      throw error;
    }
  };

  const createOrdemEtapa = async (data, retryCount = 0) => {
    const MAX_RETRIES = 3;
    const RETRY_DELAY = 1000;

    try {
      // Validação rigorosa de entrada
      if (!data || typeof data !== 'object') {
        console.error("❌ FLUXO - Dados inválidos para criação:", data);
        throw new Error("Dados são obrigatórios");
      }

      if (!data.ordem_id || !data.etapa_id) {
        console.error("❌ FLUXO - Faltam campos obrigatórios:", data);
        throw new Error("ordem_id e etapa_id são obrigatórios");
      }

      // Verificar se já existe esta combinação (prevenir duplicatas)
      const jaExiste = ordensetapas.find(
        oe => oe.ordem_id === data.ordem_id && oe.etapa_id === data.etapa_id
      );

      if (jaExiste) {
        console.warn("⚠️ FLUXO - OrdemEtapa já existe, atualizando ao invés de criar:", {
          ordemEtapaId: jaExiste.id.slice(-6),
          ordem_id: data.ordem_id.slice(-6),
          etapa_id: data.etapa_id.slice(-6)
        });
        return updateOrdemEtapa(jaExiste.id, data);
      }

      // Log detalhado antes da criação
      console.log(`➕ FLUXO - Criando nova OrdemEtapa:`, {
        ordem_id: data.ordem_id.slice(-6),
        etapa_id: data.etapa_id.slice(-6),
        status: data.status,
        tentativa: retryCount + 1
      });

      // Criar o registro
      const novaOrdemEtapa = await base44.entities.OrdemEtapa.create(data);

      console.log(`✅ FLUXO - OrdemEtapa criada com sucesso:`, novaOrdemEtapa.id.slice(-6));

      // Recarregar apenas OrdemEtapa
      const ordensEtapasAtualizadas = await base44.entities.OrdemEtapa.list();
      setOrdensEtapas(ordensEtapasAtualizadas);

      // Verificar se foi criada corretamente
      const registroCriado = ordensEtapasAtualizadas.find(oe => oe.id === novaOrdemEtapa.id);
      if (!registroCriado) {
        throw new Error("Registro não encontrado após criação");
      }

      return novaOrdemEtapa;

    } catch (error) {
      console.error(`❌ FLUXO - Erro ao criar (tentativa ${retryCount + 1}/${MAX_RETRIES}):`, error);

      // Retry automático em caso de falha
      if (retryCount < MAX_RETRIES) {
        console.log(`🔄 FLUXO - Tentando novamente em ${RETRY_DELAY}ms...`);
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * (retryCount + 1)));
        return createOrdemEtapa(data, retryCount + 1);
      }

      // Após 3 tentativas, mostrar erro ao usuário
      const mensagemErro = `Erro ao criar etapa: ${error.message || 'Erro desconhecido'}. Tente novamente.`;
      toast.error(mensagemErro);
      throw error;
    }
  };

  const getOrdemEtapas = (ordemId) => {
    return ordensetapas.filter(oe => oe.ordem_id === ordemId);
  };

  const getEtapaStatus = (ordemId, etapaId) => {
    const ordemEtapa = ordensetapas.find(
      oe => oe.ordem_id === ordemId && oe.etapa_id === etapaId
    );
    return ordemEtapa?.status || "pendente";
  };

  const getStatusColor = (status) => {
    const colors = {
      pendente: "bg-gray-200 text-gray-700",
      em_andamento: "text-white font-bold",
      concluida: "bg-green-600 text-white font-bold",
      bloqueada: "bg-red-600 text-white font-bold",
      cancelada: "bg-gray-400 text-white"
    };
    return colors[status] || "bg-gray-300";
  };

  const getStatusIcon = (status) => {
    const icons = {
      pendente: Clock,
      em_andamento: Clock,
      concluida: CheckCircle2,
      bloqueada: AlertCircle,
      cancelada: AlertCircle
    };
    const Icon = icons[status] || Clock;
    return <Icon className="w-3 h-3" />;
  };

  const getStatusBadgeColor = (status) => {
    const colors = {
      pendente: "bg-gray-100 text-gray-600",
      em_andamento: "bg-blue-100 text-blue-700",
      concluida: "bg-green-100 text-green-700",
      bloqueada: "bg-red-100 text-red-700",
      cancelada: "bg-gray-100 text-gray-500"
    };
    return colors[status] || "bg-gray-100 text-gray-600";
  };

  const temOcorrenciaAberta = (ordemId, etapaId, ordemEtapaId) => {
    if (!ordemEtapaId) {
      return false;
    }

    return ocorrencias.some(
      oc => oc.ordem_id === ordemId &&
            oc.ordem_etapa_id === ordemEtapaId &&
            oc.status === "aberta" &&
            oc.categoria === "fluxo"
    );
  };

  const getResponsavelOcorrenciaAberta = (ordemId, ordemEtapaId) => {
    if (!ordemEtapaId || usuarios.length === 0) {
      return null;
    }

    const ocorrenciaAberta = ocorrencias.find(
      oc => oc.ordem_id === ordemId &&
            oc.ordem_etapa_id === ordemEtapaId &&
            oc.status === "aberta" &&
            oc.categoria === "fluxo"
    );

    if (!ocorrenciaAberta || !ocorrenciaAberta.responsavel_id) {
      return null;
    }

    return usuarios.find(u => u.id === ocorrenciaAberta.responsavel_id);
  };

  const calculateTimeRemaining = (ordemEtapa, etapa, ordem) => {
    if (!ordemEtapa || ordemEtapa.status === "concluida" || ordemEtapa.status === "bloqueada" || ordemEtapa.status === "cancelada") return null;

    const prazoTotal = (etapa.prazo_dias || 0) * 24 * 60 + (etapa.prazo_horas || 0) * 60 + (etapa.prazo_minutos || 0);
    if (prazoTotal === 0) return null;

    let dataInicio;
    const tipoContagem = etapa.tipo_contagem_prazo || "inicio_etapa";

    if (tipoContagem === "criacao_ordem") {
      dataInicio = ordem?.data_solicitacao ? new Date(ordem.data_solicitacao) : new Date(ordemEtapa.data_inicio);
    } else if (tipoContagem === "conclusao_etapa_anterior") {
      const etapaAnterior = etapas.find(e => e.ordem === etapa.ordem - 1);
      if (etapaAnterior) {
        const ordemEtapaAnterior = ordensetapas.find(
          oe => oe.ordem_id === ordem?.id && oe.etapa_id === etapaAnterior.id
        );
        dataInicio = ordemEtapaAnterior?.data_conclusao 
          ? new Date(ordemEtapaAnterior.data_conclusao) 
          : new Date(ordemEtapa.data_inicio);
      } else {
        dataInicio = new Date(ordemEtapa.data_inicio);
      }
    } else {
      dataInicio = new Date(ordemEtapa.data_inicio);
    }

    const agora = new Date();
    let minutosPassados;

    // Verificar se deve contar apenas durante expediente
    if (etapa.prazo_durante_expediente && etapa.expediente_inicio && etapa.expediente_fim) {
      minutosPassados = calcularMinutosExpediente(dataInicio, agora, etapa.expediente_inicio, etapa.expediente_fim);
    } else {
      minutosPassados = differenceInMinutes(agora, dataInicio);
    }

    const minutosRestantes = prazoTotal - minutosPassados;

    return {
      minutosRestantes,
      percentual: Math.max(0, Math.min(100, (minutosPassados / prazoTotal) * 100)),
      atrasado: minutosRestantes < 0
    };
  };

  const calcularMinutosExpediente = (inicio, fim, horarioInicio, horarioFim) => {
    const [horaInicio, minInicio] = horarioInicio.split(':').map(Number);
    const [horaFim, minFim] = horarioFim.split(':').map(Number);
    
    let totalMinutos = 0;
    let dataAtual = new Date(inicio);
    const dataFinal = new Date(fim);

    while (dataAtual < dataFinal) {
      const diaSemana = dataAtual.getDay();
      
      // Contar apenas dias úteis (seg-sex)
      if (diaSemana >= 1 && diaSemana <= 5) {
        const inicioDia = new Date(dataAtual);
        inicioDia.setHours(horaInicio, minInicio, 0, 0);
        
        const fimDia = new Date(dataAtual);
        fimDia.setHours(horaFim, minFim, 0, 0);

        // Ajustar início se começou no meio do expediente
        const inicioReal = dataAtual > inicioDia ? dataAtual : inicioDia;
        
        // Ajustar fim se é o dia atual
        const fimReal = dataFinal < fimDia && dataFinal.toDateString() === dataAtual.toDateString() 
          ? dataFinal 
          : fimDia;

        // Contar minutos apenas se estiver dentro do expediente
        if (inicioReal < fimReal) {
          const minutosNoDia = differenceInMinutes(fimReal, inicioReal);
          totalMinutos += Math.max(0, minutosNoDia);
        }
      }

      // Avançar para o próximo dia
      dataAtual.setDate(dataAtual.getDate() + 1);
      dataAtual.setHours(0, 0, 0, 0);
    }

    return totalMinutos;
  };

  const calculateEtapaSLA = (etapaId, ordensNaEtapa) => {
    const etapa = etapas.find(e => e.id === etapaId);
    if (!etapa) return null;

    const prazoTotalMinutos = (etapa.prazo_dias || 0) * 24 * 60 + (etapa.prazo_horas || 0) * 60 + (etapa.prazo_minutos || 0);
    if (prazoTotalMinutos === 0) return null;

    const ordensComEtapa = ordensNaEtapa
      .map(ordem => ordensetapas.find(oe => oe.ordem_id === ordem.id && oe.etapa_id === etapaId))
      .filter(oe => oe && oe.data_inicio);

    if (ordensComEtapa.length === 0) return null;

    let totalMinutosUsados = 0;
    let noCumprimento = 0;

    ordensComEtapa.forEach(oe => {
      const inicio = new Date(oe.data_inicio);
      const fim = oe.data_conclusao ? new Date(oe.data_conclusao) : new Date();
      
      let minutosUsados;
      if (etapa.prazo_durante_expediente && etapa.expediente_inicio && etapa.expediente_fim) {
        minutosUsados = calcularMinutosExpediente(inicio, fim, etapa.expediente_inicio, etapa.expediente_fim);
      } else {
        minutosUsados = differenceInMinutes(fim, inicio);
      }
      
      totalMinutosUsados += minutosUsados;

      if (oe.status === "concluida" && minutosUsados <= prazoTotalMinutos) {
        noCumprimento++;
      }
    });

    const mediaMinutos = totalMinutosUsados / ordensComEtapa.length;
    const percentualCumprimento = ordensComEtapa.filter(oe => oe.status === "concluida").length > 0
      ? (noCumprimento / ordensComEtapa.filter(oe => oe.status === "concluida").length) * 100
      : 0;

    return {
      mediaMinutos,
      percentualCumprimento,
      prazoMinutos: prazoTotalMinutos
    };
  };

  const formatTimeRemaining = (minutos) => {
    if (minutos < 0) {
      const abs = Math.abs(minutos);
      const dias = Math.floor(abs / (24 * 60));
      const horas = Math.floor((abs % (24 * 60)) / 60);
      const mins = abs % 60;

      if (dias > 0) return `Atrasado ${dias}d ${horas}h`;
      if (horas > 0) return `Atrasado ${horas}h ${mins}m`;
      return `Atrasado ${mins}m`;
    }

    const dias = Math.floor(minutos / (24 * 60));
    const horas = Math.floor((minutos % (24 * 60)) / 60);
    const mins = minutos % 60;

    if (dias > 0) return `${dias}d ${horas}h restantes`;
    if (horas > 0) return `${horas}h ${mins}m restantes`;
    return `${mins}m restantes`;
  };



  const formatSLATime = (minutos) => {
    const dias = Math.floor(minutos / (24 * 60));
    const horas = Math.floor((minutos % (24 * 60)) / 60);
    const mins = Math.floor(minutos % 60);

    if (dias > 0) return `${dias}d ${horas}h`;
    if (horas > 0) return `${horas}h ${mins}m`;
    return `${mins}m`;
  };

  const getMotorista = (motoristaId) => {
    return motoristas.find(m => m.id === motoristaId);
  };

  const getVeiculo = (veiculoId) => {
    return veiculos.find(v => v.id === veiculoId);
  };

  const getOperacao = (operacaoId) => {
    return operacoes.find(op => op.id === operacaoId);
  };

  const formatarNomeMotorista = (nomeCompleto) => {
    if (!nomeCompleto) return "";
    const partes = nomeCompleto.split(' ').filter(p => p.length > 0);
    if (partes.length === 1) return partes[0];

    // Apenas primeiro nome + primeira inicial do sobrenome
    const primeiroNome = partes[0];
    const primeiraInicial = partes[partes.length - 1][0] + '.';
    return `${primeiroNome} ${primeiraInicial}`;
  };

  const getModalidadeBadge = (modalidade) => {
    const colors = {
      normal: "bg-green-600 text-white dark:bg-green-700 dark:text-white font-bold",
      prioridade: "bg-yellow-600 text-white dark:bg-yellow-700 dark:text-white font-bold",
      expressa: "bg-red-600 text-white dark:bg-red-700 dark:text-white font-bold"
    };
    return colors[modalidade] || colors.normal;
  };

  const getFrotaBadge = (frota) => {
    const colors = {
      "própria": "bg-blue-600 text-white dark:bg-blue-700 dark:text-white border-2 border-blue-700 dark:border-blue-600 font-bold",
      "acionista": "bg-purple-600 text-white dark:bg-purple-700 dark:text-white border-2 border-purple-700 dark:border-purple-600 font-bold",
      "terceirizada": "bg-red-600 text-white dark:bg-red-700 dark:text-white border-2 border-red-700 dark:border-red-600 font-bold",
      "agregado": "bg-orange-600 text-white dark:bg-orange-700 dark:text-white border-2 border-orange-700 dark:border-orange-600 font-bold"
    };
    return colors[frota] || "bg-gray-600 text-white dark:bg-gray-700 dark:text-white border-2 border-gray-700 dark:border-gray-600 font-bold";
  };

  const toggleOperacao = (operacaoId) => {
    setFilters(prev => {
      const operacoesIds = prev.operacoesIds.includes(operacaoId)
        ? prev.operacoesIds.filter(id => id !== operacaoId)
        : [...prev.operacoesIds, operacaoId];
      return { ...prev, operacoesIds };
    });
  };

  const filteredOrdensByAtribuicao = ordens.filter(ordem => {
    if (filtroAtribuicao === "todos") return true;
    
    const ordemEtapaAtual = ordensetapas.find(oe => 
      oe.ordem_id === ordem.id && oe.status === "em_andamento"
    );
    
    if (!ordemEtapaAtual) return false;
    
    if (filtroAtribuicao === "meus") {
      return ordemEtapaAtual.responsavel_id === currentUser?.id;
    }
    
    if (filtroAtribuicao === "meu_departamento") {
      return ordemEtapaAtual.departamento_responsavel_id === currentUser?.departamento_id;
    }
    
    return true;
  });

  console.log('📊 FLUXO - Estado dos filtros:', {
    periodoSelecionado,
    dataInicio: filters.dataInicio,
    dataFim: filters.dataFim,
    totalOrdens: filteredOrdensByAtribuicao.length
  });

  // Filtrar por período de data primeiro
  const ordensFiltradaPorPeriodo = filteredOrdensByAtribuicao.filter(ordem => {
    if (!ordem.created_date) return false;
    const dataOrdem = new Date(ordem.created_date);

    if (periodoSelecionado === "mes_atual") {
      const hoje = new Date();
      return dataOrdem.getMonth() === hoje.getMonth() && dataOrdem.getFullYear() === hoje.getFullYear();
    } else if (periodoSelecionado === "ano_atual") {
      return dataOrdem.getFullYear() === anoSelecionado;
    } else if (periodoSelecionado === "mes_especifico") {
      return dataOrdem.getFullYear() === anoSelecionado && dataOrdem.getMonth() + 1 === mesSelecionado;
    } else if (periodoSelecionado === "personalizado") {
      if (!dataInicioPersonalizada || !dataFimPersonalizada) return true;
      const inicio = new Date(dataInicioPersonalizada);
      const fim = new Date(dataFimPersonalizada);
      fim.setHours(23, 59, 59, 999);
      return dataOrdem >= inicio && dataOrdem <= fim;
    }
    return true;
  });

  const filteredOrdens = ordensFiltradaPorPeriodo.filter(ordem => {
    // REGRA: Excluir coletas, recebimentos e entregas - apenas ordens de carregamento
    
    // Excluir por numero_coleta (qualquer ordem com COL- é coleta)
    if (ordem.numero_coleta && ordem.numero_coleta.startsWith("COL-")) {
      return false;
    }
    
    // Excluir por tipo_registro
    const tiposExcluidos = ["coleta_solicitada", "coleta_aprovada", "coleta_reprovada", "recebimento", "ordem_entrega"];
    if (tiposExcluidos.includes(ordem.tipo_registro)) {
      return false;
    }
    
    // Excluir por tipo_ordem
    const tiposOrdemExcluidos = ["coleta", "recebimento", "entrega"];
    if (tiposOrdemExcluidos.includes(ordem.tipo_ordem)) {
      return false;
    }

    // Filtro de tipos de ordem (múltiplos) - NÃO aplicar quando filtro de etapa está ativo
    if (filters.tiposOrdem && filters.tiposOrdem.length > 0 && !filters.etapaId) {
      // Usar tipo_registro se existir, caso contrário calcular baseado em IDs
      let tipoOrdem = ordem.tipo_registro;
      
      if (!tipoOrdem) {
        const temMotorista = !!ordem.motorista_id;
        const temVeiculo = !!ordem.cavalo_id; // Apenas ID, não placa temporária
        
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

      // Normalizar: aceitar "alocado" ou "ordem_completa" como equivalentes
      const tipoNormalizado = tipoOrdem === "ordem_completa" ? "alocado" : tipoOrdem;
      const tiposFiltrados = filters.tiposOrdem.map(t => t === "ordem_completa" ? "alocado" : t);
      
      if (!tiposFiltrados.includes(tipoNormalizado)) return false;
    }

    if (filters.dataInicio && filters.dataInicio !== "" && ordem.created_date) {
      const dataOrdem = new Date(ordem.created_date);
      const dataInicio = new Date(filters.dataInicio);
      if (dataOrdem < dataInicio) {
        console.log('❌ Ordem rejeitada por dataInicio:', {
          ordem: ordem.numero_carga,
          dataOrdem: dataOrdem.toISOString().split('T')[0],
          dataInicio: filters.dataInicio
        });
        return false;
      }
    }

    if (filters.dataFim && filters.dataFim !== "" && ordem.created_date) {
      const dataOrdem = new Date(ordem.created_date);
      const dataFim = new Date(filters.dataFim);
      dataFim.setHours(23, 59, 59, 999);
      if (dataOrdem > dataFim) {
        console.log('❌ Ordem rejeitada por dataFim:', {
          ordem: ordem.numero_carga,
          dataOrdem: dataOrdem.toISOString().split('T')[0],
          dataFim: filters.dataFim
        });
        return false;
      }
    }

    if (filters.etapaId && filters.etapaId !== "") {
      const ordemEtapa = ordensetapas.find(
        oe => oe.ordem_id === ordem.id && oe.etapa_id === filters.etapaId
      );
      
      // Se não tem a etapa criada, considera pendente (incluir)
      if (!ordemEtapa) return true;
      
      // Se tem a etapa, excluir apenas se estiver concluída ou cancelada
      if (ordemEtapa.status === "concluida" || ordemEtapa.status === "cancelada") return false;
    }

    if (filters.status && filters.status !== "" && filters.etapaId && filters.etapaId !== "") {
      const ordemEtapa = ordensetapas.find(
        oe => oe.ordem_id === ordem.id && oe.etapa_id === filters.etapaId
      );
      if (!ordemEtapa || ordemEtapa.status !== filters.status) return false;
    }

    if (filters.frota && filters.frota !== "" && ordem.frota !== filters.frota) return false;
    
    if (filters.operacoesIds && filters.operacoesIds.length > 0 && !filters.operacoesIds.includes(ordem.operacao_id)) return false;
    
    if (filters.modalidadeCarga && filters.modalidadeCarga !== "" && ordem.modalidade_carga !== filters.modalidadeCarga) return false;

    if (filters.origem && filters.origem !== "" && !ordem.origem?.toLowerCase().includes(filters.origem.toLowerCase())) return false;
    
    if (filters.destino && filters.destino !== "" && !ordem.destino?.toLowerCase().includes(filters.destino.toLowerCase())) return false;

    if (filters.motoristaId && filters.motoristaId !== "" && ordem.motorista_id !== filters.motoristaId) return false;

    if (!searchTerm) return true;

    const term = searchTerm.toLowerCase();
    const motorista = getMotorista(ordem.motorista_id);
    const cavalo = getVeiculo(ordem.cavalo_id);
    const implemento1 = getVeiculo(ordem.implemento1_id);
    const implemento2 = getVeiculo(ordem.implemento2_id);
    const implemento3 = getVeiculo(ordem.implemento3_id);

    const etapasOrdem = ordensetapas.filter(oe => oe.ordem_id === ordem.id);
    const etapasNomes = etapasOrdem.map(oe => {
      const etapa = etapas.find(e => e.id === oe.etapa_id);
      return etapa?.nome?.toLowerCase() || "";
    });

    const statusEtapas = etapasOrdem.map(oe => oe.status.toLowerCase());

    return (
      ordem.numero_carga?.toLowerCase().includes(term) ||
      ordem.cliente?.toLowerCase().includes(term) ||
      ordem.produto?.toLowerCase().includes(term) ||
      motorista?.nome?.toLowerCase().includes(term) ||
      cavalo?.placa?.toLowerCase().includes(term) ||
      implemento1?.placa?.toLowerCase().includes(term) ||
      implemento2?.placa?.toLowerCase().includes(term) ||
      implemento3?.placa?.toLowerCase().includes(term) ||
      etapasNomes.some(nome => nome.includes(term)) ||
      statusEtapas.some(status => status.includes(term)) ||
      ordem.origem?.toLowerCase().includes(term) ||
      ordem.destino?.toLowerCase().includes(term)
    );
  });

  const inicio = (paginaAtual - 1) * limite;
  const fim = inicio + limite;
  const ordensLimitadas = filteredOrdens.slice(inicio, fim);

  const getOrdensporEtapa = (etapaId) => {
    const ordensIds = ordensetapas
      .filter(oe => oe.etapa_id === etapaId && oe.status === "em_andamento")
      .map(oe => oe.ordem_id);

    return filteredOrdens.filter(ordem => ordensIds.includes(ordem.id));
  };

  const getOrdensAtivasNaEtapa = (etapaId) => {
    // Usar filteredOrdens ao invés de ordens base para respeitar todos os filtros
    return filteredOrdens.filter(ordem => {
      const ordemEtapa = ordensetapas.find(oe => oe.ordem_id === ordem.id && oe.etapa_id === etapaId);
      
      // Se não tem a etapa criada, considera pendente (conta)
      if (!ordemEtapa) return true;
      
      // Se tem a etapa, só conta se não está concluída ou cancelada
      return ordemEtapa.status !== "concluida" && ordemEtapa.status !== "cancelada";
    });
  };

  const handleOrdemClick = (ordem) => {
    setSelectedOrdem(ordem);
  };

  const handleEditOrdem = (ordem) => {
    setOrdemParaEditar(ordem);
    setShowEditModal(true);
  };

  const handleEditSuccess = async () => {
    setShowEditModal(false);
    setOrdemParaEditar(null);
    await loadData();
  };

  // Verificar se a ordem tem pelo menos uma etapa iniciada
  const ordemTemFluxoIniciado = (ordemId) => {
    return ordensetapas.some(oe => oe.ordem_id === ordemId);
  };

  const theme = {
    bg: isDark ? '#0f172a' : '#f9fafb',
    cardBg: isDark ? '#1e293b' : '#ffffff',
    cardBorder: isDark ? '#334155' : '#e5e7eb',
    text: isDark ? '#f1f5f9' : '#111827',
    textMuted: isDark ? '#94a3b8' : '#6b7280',
    headerBg: isDark ? '#0f172a' : '#f9fafb',
    inputBg: isDark ? '#1e293b' : '#ffffff',
    inputBorder: isDark ? '#334155' : '#d1d5db',
    buttonBg: isDark ? '#334155' : '#f3f4f6',
  };

  if (loading) {
    return (
      <div className="p-4 min-h-screen flex items-center justify-center" style={{ backgroundColor: theme.bg }}>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm" style={{ color: theme.textMuted }}>Carregando workflow...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen transition-colors" style={{ backgroundColor: theme.bg }}>
      <div className="p-6">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Package className="w-6 h-6 text-purple-600" />
              <h1 className="text-2xl font-bold" style={{ color: theme.text }}>Fluxo de Processos</h1>
            </div>
            <p className="text-sm" style={{ color: theme.textMuted }}>Acompanhamento das etapas operacionais</p>
          </div>

          <div className="flex flex-col lg:flex-row items-start lg:items-center gap-3 w-full lg:w-auto">
            <FiltroPeriodo
              periodoFiltro={periodoSelecionado}
              onPeriodoChange={setPeriodoSelecionado}
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
              <Link to={createPageUrl("ConfiguracaoEtapas")}>
                <Button
                  variant="outline"
                  className="flex items-center gap-2"
                  style={{
                    borderColor: theme.inputBorder,
                    backgroundColor: theme.inputBg,
                    color: theme.text
                  }}
                >
                  <Settings className="w-4 h-4" />
                  Configurar Etapas
                </Button>
              </Link>
              {isAdmin && (
                <Button
                  onClick={() => setShowModalConcluir(true)}
                  disabled={processandoNovembro}
                  className="bg-orange-600 hover:bg-orange-700 text-white"
                >
                  {processandoNovembro ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Processando...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Concluir Etapas
                    </>
                  )}
                </Button>
              )}
              <div className="relative flex-1 lg:w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: theme.textMuted }} />
                <Input
                  placeholder="Buscar ordens..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                  style={{ backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.text }}
                />
              </div>
            
            <div className="flex gap-2 flex-wrap w-full lg:w-auto">
              <Button
                variant={filtroAtribuicao === "todos" ? "default" : "outline"}
                size="sm"
                onClick={() => setFiltroAtribuicao("todos")}
                className="text-xs h-7"
                style={{
                  backgroundColor: filtroAtribuicao === "todos" ? '#3b82f6' : 'transparent',
                  color: filtroAtribuicao === "todos" ? '#ffffff' : theme.text,
                  borderColor: theme.inputBorder
                }}
              >
                Todas
              </Button>
              <Button
                variant={filtroAtribuicao === "meus" ? "default" : "outline"}
                size="sm"
                onClick={() => setFiltroAtribuicao("meus")}
                className="text-xs h-7"
                style={{
                  backgroundColor: filtroAtribuicao === "meus" ? '#3b82f6' : 'transparent',
                  color: filtroAtribuicao === "meus" ? '#ffffff' : theme.text,
                  borderColor: theme.inputBorder
                }}
              >
                Atribuídos a Mim
              </Button>
              {currentUser?.departamento_id && (
                <Button
                  variant={filtroAtribuicao === "meu_departamento" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFiltroAtribuicao("meu_departamento")}
                  className="text-xs h-7"
                  style={{
                    backgroundColor: filtroAtribuicao === "meu_departamento" ? '#3b82f6' : 'transparent',
                    color: filtroAtribuicao === "meu_departamento" ? '#ffffff' : theme.text,
                    borderColor: theme.inputBorder
                  }}
                >
                  Meu Departamento
                </Button>
              )}
            </div>

            <Select value={limite.toString()} onValueChange={(value) => setLimite(parseInt(value))}>
              <SelectTrigger className="w-20" style={{ backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.text }}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}>
                <SelectItem value="10" style={{ color: theme.text }}>10</SelectItem>
                <SelectItem value="20" style={{ color: theme.text }}>20</SelectItem>
                <SelectItem value="50" style={{ color: theme.text }}>50</SelectItem>
                <SelectItem value="100" style={{ color: theme.text }}>100</SelectItem>
                <SelectItem value="150" style={{ color: theme.text }}>150</SelectItem>
                <SelectItem value="200" style={{ color: theme.text }}>200</SelectItem>
              </SelectContent>
            </Select>
              <FiltrosPredefinidos
                rota="fluxo"
                filtrosAtuais={filters}
                onAplicarFiltro={(novosFiltros) => {
                  setFilters(novosFiltros);
                  setPaginaAtual(1);
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
                variant="outline"
                size="icon"
                onClick={() => setShowFilters(true)}
                style={{ borderColor: theme.inputBorder, backgroundColor: theme.inputBg, color: theme.text }}
              >
                <Filter className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={loadData}
                style={{ borderColor: theme.inputBorder, backgroundColor: theme.inputBg, color: theme.text }}
              >
                <RefreshCw className="w-4 h-4" />
              </Button>
              <Link to={createPageUrl("FluxoTV")}>
                <Button
                  variant="outline"
                  size="icon"
                  style={{ borderColor: theme.inputBorder, backgroundColor: theme.inputBg, color: theme.text }}
                >
                  <ExternalLink className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <Package className="w-5 h-5 text-blue-600" />
                <span className="text-2xl font-bold" style={{ color: theme.text }}>
                  {filteredOrdens.length}
                </span>
              </div>
              <p className="text-xs font-medium" style={{ color: theme.textMuted }}>Total de Ordens</p>
            </CardContent>
          </Card>

          <Card style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <Clock className="w-5 h-5 text-yellow-600" />
                <span className="text-2xl font-bold text-yellow-600">
                  {ordensetapas.filter(oe => oe.status === "em_andamento").length}
                </span>
              </div>
              <p className="text-xs font-medium" style={{ color: theme.textMuted }}>Em Andamento</p>
            </CardContent>
          </Card>

          <Card style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <span className="text-2xl font-bold text-red-600">
                  {ordensetapas.filter(oe => oe.status === "bloqueada").length}
                </span>
              </div>
              <p className="text-xs font-medium" style={{ color: theme.textMuted }}>Bloqueadas</p>
            </CardContent>
          </Card>

          <Card style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                <span className="text-2xl font-bold text-green-600">
                  {ordensetapas.filter(oe => oe.status === "concluida").length}
                </span>
              </div>
              <p className="text-xs font-medium" style={{ color: theme.textMuted }}>Concluídas</p>
            </CardContent>
          </Card>
        </div>

        {/* Cartões de Ordens por Etapa */}
        <div className="mb-6">
          <h2 className="text-sm font-bold mb-3" style={{ color: theme.text }}>Ordens Ativas por Etapa</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
            {etapas.map((etapa) => {
              const ordensNaEtapa = getOrdensAtivasNaEtapa(etapa.id);
              const isFiltered = filters.etapaId === etapa.id;

              return (
                <Card
                  key={etapa.id}
                  className={`cursor-pointer transition-all hover:shadow-lg ${
                    isFiltered ? 'ring-2 ring-blue-500' : ''
                  }`}
                  style={{
                    backgroundColor: theme.cardBg,
                    borderColor: isFiltered ? '#3b82f6' : theme.cardBorder,
                    borderTopColor: etapa.cor,
                    borderTopWidth: '3px'
                  }}
                  onClick={() => {
                    if (isFiltered) {
                      setFilters(prev => ({ ...prev, etapaId: "" }));
                    } else {
                      setFilters(prev => ({ ...prev, etapaId: etapa.id }));
                    }
                    setPaginaAtual(1);
                  }}
                >
                  <CardContent className="p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <div
                        className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{ backgroundColor: etapa.cor }}
                      />
                      <p className="text-xs font-semibold truncate" style={{ color: theme.text }}>
                        {etapa.nome}
                      </p>
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-bold" style={{ color: etapa.cor }}>
                        {ordensNaEtapa.length}
                      </span>
                      <span className="text-xs" style={{ color: theme.textMuted }}>
                        {ordensNaEtapa.length === 1 ? 'ordem' : 'ordens'}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        <div className="flex items-center justify-between mb-4">
          <p className="text-sm" style={{ color: theme.textMuted }}>
            Mostrando <span className="font-bold" style={{ color: theme.text }}>{ordensLimitadas.length}</span> de <span className="font-bold" style={{ color: theme.text }}>{filteredOrdens.length}</span> ordens
          </p>
        </div>

        <Tabs value={viewMode} onValueChange={setViewMode} className="w-full">
          <TabsList style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}>
            <TabsTrigger value="timeline" style={{ color: viewMode === 'timeline' ? theme.text : theme.textMuted }}>
              <Calendar className="w-4 h-4 mr-2" />Timeline
            </TabsTrigger>
            <TabsTrigger value="list" style={{ color: viewMode === 'list' ? theme.text : theme.textMuted }}>
              <LayoutList className="w-4 h-4 mr-2" />Lista
            </TabsTrigger>
          </TabsList>

          <TabsContent value="timeline" className="mt-4">
            <Card style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }} className="shadow">
              <CardHeader className="pb-1.5 pt-1.5 px-3 border-b" style={{ backgroundColor: theme.headerBg, borderBottomColor: theme.cardBorder }}>
                <CardTitle className="text-sm font-semibold" style={{ color: theme.text }}>Timeline de Ordens</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <div className="min-w-[1200px]">
                    <div className="flex items-center gap-0.5 px-2 py-1 border-b sticky top-0 z-20" style={{ backgroundColor: theme.headerBg, borderBottomColor: theme.cardBorder }}>
                      <div className="w-80 flex-shrink-0 px-1.5">
                        <p className="text-xs font-bold uppercase" style={{ color: theme.textMuted }}>Ordem / Recursos</p>
                      </div>
                      <div className="w-20 flex-shrink-0 px-0.5">
                        <p className="text-xs font-bold uppercase" style={{ color: theme.textMuted }}>Pedido Nº</p>
                      </div>
                      <div className="w-14 flex-shrink-0 px-0.5">
                        <p className="text-xs font-bold uppercase" style={{ color: theme.textMuted }}>Frota</p>
                      </div>
                      <div className="w-20 flex-shrink-0 px-0.5">
                        <p className="text-xs font-bold uppercase" style={{ color: theme.textMuted }}>Operação</p>
                      </div>
                      <div className="w-16 flex-shrink-0 px-0.5">
                        <p className="text-xs font-bold uppercase" style={{ color: theme.textMuted }}>Modal.</p>
                      </div>
                      <div className="w-20 flex-shrink-0 px-0.5">
                        <p className="text-xs font-bold uppercase" style={{ color: theme.textMuted }}>Status</p>
                      </div>
                      <div className="flex-1 flex gap-0.5 px-1">
                        {etapas.map((etapa) => (
                          <div
                            key={etapa.id}
                            className="flex-1 min-w-[70px] text-center px-0.5"
                          >
                            <div className="flex items-center justify-center gap-1 py-0.5 px-1 rounded"
                              style={{ backgroundColor: `${etapa.cor}15` }}>
                              <div
                                className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                                style={{ backgroundColor: etapa.cor }}
                              />
                              <p className="text-xs font-bold truncate" style={{ color: theme.text }}>
                                {etapa.nome}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="w-8 flex-shrink-0" />
                    </div>

                    <div className="divide-y" style={{ borderColor: theme.cardBorder }}>
                      {ordensLimitadas.map((ordem, idx) => {
                        const motorista = getMotorista(ordem.motorista_id);
                        const cavalo = getVeiculo(ordem.cavalo_id);
                        const implemento1 = getVeiculo(ordem.implemento1_id);
                        const implemento2 = getVeiculo(ordem.implemento2_id);
                        const implemento3 = getVeiculo(ordem.implemento3_id);
                        const operacao = getOperacao(ordem.operacao_id);

                        // Determinar tipo da ordem usando tipo_registro ou calculando
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
                        
                        const isOferta = tipoOrdem === "oferta";
                        const isNegociando = tipoOrdem === "negociando";
                        const temFluxo = ordemTemFluxoIniciado(ordem.id);

                        // Reunir todas as placas
                        const placas = [
                          cavalo?.placa,
                          implemento1?.placa,
                          implemento2?.placa,
                          implemento3?.placa
                        ].filter(Boolean);

                        return (
                          <div
                            key={ordem.id}
                            className="flex items-center gap-0.5 px-2 py-1 transition-colors"
                            style={{
                              backgroundColor: idx % 2 === 0 ? theme.cardBg : (isDark ? '#0f172a' : '#f9fafb'),
                              minHeight: '44px'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = isDark ? '#334155' : '#eff6ff'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = idx % 2 === 0 ? theme.cardBg : (isDark ? '#0f172a' : '#f9fafb')}
                          >
                            <div
                              className="w-80 flex-shrink-0 cursor-pointer px-1.5 py-1 rounded transition-colors"
                              onClick={() => handleOrdemClick(ordem)}
                              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = isDark ? '#1e293b' : '#dbeafe'}
                              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                            >
                              <div className="flex items-center gap-1.5 mb-1">
                                <Badge className={`text-[9px] h-4 px-1.5 font-bold border-2 flex-shrink-0 ${
                                  isOferta
                                    ? "bg-green-600 text-white border-green-700 dark:bg-green-700 dark:border-green-600"
                                    : isNegociando
                                      ? "bg-yellow-600 text-white border-yellow-700 dark:bg-yellow-700 dark:border-yellow-600"
                                      : "bg-blue-600 text-white border-blue-700 dark:bg-blue-700 dark:border-blue-600"
                                }`}>
                                  {isOferta ? "Oferta" : isNegociando ? "Negociando" : "Alocado"}
                                </Badge>
                                <span className="font-bold text-xs flex-shrink-0" style={{ color: isDark ? '#60a5fa' : '#1d4ed8' }}>
                                  {ordem.numero_carga || `#${ordem.id.slice(-6)}`}
                                </span>
                                <span className="text-[10px] font-medium truncate" style={{ color: theme.textMuted }}>
                                  {ordem.cliente}
                                </span>
                              </div>

                              {/* Linha 1: Motorista e Placas lado a lado */}
                              <div className="flex items-center gap-1.5 min-h-[20px]">
                                {(motorista || ordem.motorista_nome_temp) ? (
                                  <>
                                    <div className="flex items-center gap-0.5 border rounded px-1 py-0.5 flex-shrink-0"
                                      style={{
                                        backgroundColor: isDark ? '#1e293b' : '#eff6ff',
                                        borderColor: isDark ? '#334155' : '#bfdbfe',
                                        maxWidth: '120px'
                                      }}>
                                      <User className="w-2.5 h-2.5 flex-shrink-0 text-blue-600 dark:text-blue-400" />
                                      <span className="text-[10px] font-semibold truncate" style={{ color: isDark ? '#60a5fa' : '#1d4ed8' }}>
                                        {motorista ? formatarNomeMotorista(motorista.nome) : formatarNomeMotorista(ordem.motorista_nome_temp)}
                                      </span>
                                    </div>
                                    {(placas.length > 0 || ordem.cavalo_placa_temp || ordem.implemento1_placa_temp) && (
                                      <div className="flex items-center gap-0.5 border rounded px-1 py-0.5 flex-shrink-0"
                                        style={{
                                          backgroundColor: isDark ? '#1e293b' : '#f3f4f6',
                                          borderColor: theme.cardBorder
                                        }}>
                                        <Truck className="w-2.5 h-2.5 flex-shrink-0" style={{ color: theme.textMuted }} />
                                        <span className="text-[9px] font-bold font-mono whitespace-nowrap" style={{ color: theme.text }}>
                                          {placas.length > 0 
                                            ? placas.join(' • ')
                                            : [ordem.cavalo_placa_temp, ordem.implemento1_placa_temp, ordem.implemento2_placa_temp].filter(Boolean).join(' • ')
                                          }
                                        </span>
                                      </div>
                                    )}
                                  </>
                                ) : (
                                  <div className="flex items-center gap-2">
                                    <div className="flex items-center gap-0.5 border rounded px-1 py-0.5"
                                      style={{
                                        backgroundColor: isDark ? '#1e293b' : '#fef3c7',
                                        borderColor: isDark ? '#334155' : '#fbbf24'
                                      }}>
                                      <User className="w-2.5 h-2.5 flex-shrink-0 text-yellow-600 dark:text-yellow-400" />
                                      <span className="text-[10px] font-semibold" style={{ color: isDark ? '#fbbf24' : '#92400e' }}>
                                        Alocar Motorista
                                      </span>
                                    </div>
                                    {!placas.length && !ordem.cavalo_placa_temp && (
                                      <div className="flex items-center gap-0.5 border rounded px-1 py-0.5"
                                        style={{
                                          backgroundColor: isDark ? '#1e293b' : '#fef3c7',
                                          borderColor: theme.cardBorder
                                        }}>
                                        <Truck className="w-2.5 h-2.5 flex-shrink-0" style={{ color: theme.textMuted }} />
                                        <span className="text-[9px] font-semibold" style={{ color: isDark ? '#fbbf24' : '#92400e' }}>
                                          Alocar Veículo
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>

                            <div className="w-20 flex-shrink-0 px-0.5">
                              {ordem.viagem_pedido ? (
                                <span className="text-[10px] font-semibold" style={{ color: theme.text }}>
                                  {ordem.viagem_pedido}
                                </span>
                              ) : (
                                <span className="text-[10px]" style={{ color: theme.textMuted }}>-</span>
                              )}
                            </div>

                            <div className="w-14 flex-shrink-0 px-0.5">
                              {ordem.frota ? (
                                <Badge className={`text-[8px] h-4 px-0.5 border font-bold ${getFrotaBadge(ordem.frota)}`}>
                                  {ordem.frota.slice(0, 4).toUpperCase()}
                                </Badge>
                              ) : (
                                <span className="text-[10px]" style={{ color: theme.textMuted }}>-</span>
                              )}
                            </div>

                            <div className="w-20 flex-shrink-0 px-0.5">
                              {operacao ? (
                                <Badge variant="outline" className="text-[9px] h-4 px-0.5 truncate max-w-full"
                                  style={{
                                    borderColor: theme.cardBorder,
                                    backgroundColor: theme.cardBg,
                                    color: theme.text
                                  }}>
                                  {operacao.nome}
                                </Badge>
                              ) : (
                                <span className="text-[10px]" style={{ color: theme.textMuted }}>-</span>
                              )}
                            </div>

                            <div className="w-16 flex-shrink-0 px-0.5">
                              {ordem.modalidade_carga ? (
                                <Badge className={`text-[8px] h-4 px-0.5 font-bold ${getModalidadeBadge(ordem.modalidade_carga)}`}>
                                  {ordem.modalidade_carga === 'prioridade' ? 'PRIOR' : ordem.modalidade_carga === 'expressa' ? 'EXPR' : 'NORM'}
                                </Badge>
                              ) : (
                                <span className="text-[10px]" style={{ color: theme.textMuted }}>-</span>
                              )}
                            </div>

                            <div className="w-20 flex-shrink-0 px-0.5">
                              {ordem.status_tracking ? (
                                <Badge className={`text-[9px] h-6 px-1.5 font-bold flex flex-col items-center justify-center leading-[1.2] py-0.5 ${
                                  ordem.status_tracking === 'aguardando_agendamento' ? 'bg-slate-500 text-white' :
                                  ordem.status_tracking === 'carregamento_agendado' ? 'bg-blue-500 text-white' :
                                  ordem.status_tracking === 'em_carregamento' ? 'bg-indigo-500 text-white' :
                                  ordem.status_tracking === 'carregado' ? 'bg-purple-500 text-white' :
                                  ordem.status_tracking === 'em_viagem' ? 'bg-cyan-500 text-white' :
                                  ordem.status_tracking === 'chegada_destino' ? 'bg-teal-500 text-white' :
                                  ordem.status_tracking === 'descarga_agendada' ? 'bg-amber-500 text-white' :
                                  ordem.status_tracking === 'em_descarga' ? 'bg-orange-500 text-white' :
                                  ordem.status_tracking === 'descarga_realizada' ? 'bg-green-500 text-white' :
                                  ordem.status_tracking === 'finalizado' ? 'bg-gray-600 text-white' :
                                  'bg-gray-400 text-white'
                                }`}>
                                  {ordem.status_tracking === 'aguardando_agendamento' ? (
                                    <><span className="whitespace-nowrap">Aguard.</span><span className="whitespace-nowrap">Agend.</span></>
                                  ) : ordem.status_tracking === 'carregamento_agendado' ? (
                                    <><span className="whitespace-nowrap">Carreg.</span><span className="whitespace-nowrap">Agendado</span></>
                                  ) : ordem.status_tracking === 'em_carregamento' ? (
                                    <><span className="whitespace-nowrap">Em</span><span className="whitespace-nowrap">Carreg.</span></>
                                  ) : ordem.status_tracking === 'carregado' ? (
                                    <span className="whitespace-nowrap">Carregado</span>
                                  ) : ordem.status_tracking === 'em_viagem' ? (
                                    <><span className="whitespace-nowrap">Em</span><span className="whitespace-nowrap">Viagem</span></>
                                  ) : ordem.status_tracking === 'chegada_destino' ? (
                                    <><span className="whitespace-nowrap">Chegou</span><span className="whitespace-nowrap">Destino</span></>
                                  ) : ordem.status_tracking === 'descarga_agendada' ? (
                                    <><span className="whitespace-nowrap">Descarga</span><span className="whitespace-nowrap">Agendada</span></>
                                  ) : ordem.status_tracking === 'em_descarga' ? (
                                    <><span className="whitespace-nowrap">Em</span><span className="whitespace-nowrap">Descarga</span></>
                                  ) : ordem.status_tracking === 'descarga_realizada' ? (
                                    <><span className="whitespace-nowrap">Descarga</span><span className="whitespace-nowrap">Realizada</span></>
                                  ) : ordem.status_tracking === 'finalizado' ? (
                                    <span className="whitespace-nowrap">Finalizado</span>
                                  ) : (
                                    <span className="whitespace-nowrap">{ordem.status_tracking}</span>
                                  )}
                                </Badge>
                              ) : (
                                <span className="text-[10px]" style={{ color: theme.textMuted }}>-</span>
                              )}
                            </div>

                            <div className="flex-1 flex gap-0.5 px-1">
                              {!temFluxo ? (
                                <div className="flex-1 flex items-center justify-center">
                                  <Button
                                    onClick={() => iniciarFluxoOrdem(ordem)}
                                    disabled={iniciandoFluxo}
                                    size="sm"
                                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs h-6 px-2"
                                  >
                                    {iniciandoFluxo ? (
                                      <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    ) : (
                                      <>
                                        <PlayCircle className="w-3 h-3 mr-1" />
                                        Iniciar Fluxo
                                      </>
                                    )}
                                  </Button>
                                </div>
                              ) : (
                                etapas.map((etapa) => {
                                  const status = getEtapaStatus(ordem.id, etapa.id);
                                  const ordemEtapa = ordensetapas.find(
                                    oe => oe.ordem_id === ordem.id && oe.etapa_id === etapa.id
                                  );
                                  const timeInfo = calculateTimeRemaining(ordemEtapa, etapa, ordem);

                                  const getStatusStyle = (status, cor, temOcorrencia) => {
                                    const styles = {
                                      pendente: `border shadow-sm ${isDark ? 'bg-slate-800 text-gray-400 border-slate-700' : 'bg-gray-200 text-gray-700 border-gray-300'}`,
                                      em_andamento: `bg-blue-500 dark:bg-blue-600 text-white font-bold border border-blue-600 dark:border-blue-500 shadow-sm`,
                                      concluida: `bg-green-600 dark:bg-green-700 text-white font-bold border border-green-700 dark:border-green-600`,
                                      bloqueada: `bg-red-600 dark:bg-red-700 text-white font-bold border border-red-700 dark:border-red-600 animate-pulse`,
                                      cancelada: `bg-gray-400 dark:bg-slate-700 text-white border border-gray-500 dark:border-slate-600`
                                    };

                                    // Bloqueado com ocorrência aberta = amarelo
                                    if (status === "bloqueada" && temOcorrencia) {
                                      return `bg-yellow-500 dark:bg-yellow-600 text-white font-bold border border-yellow-600 dark:border-yellow-500 animate-pulse`;
                                    }

                                    return styles[status] || styles.pendente;
                                  };

                                  const hasOcorrencia = temOcorrenciaAberta(ordem.id, etapa.id, ordemEtapa?.id);
                                  const responsavelOcorrencia = (hasOcorrencia && ordemEtapa) ? getResponsavelOcorrenciaAberta(ordem.id, ordemEtapa.id) : null;

                                  return (
                                    <div
                                      key={etapa.id}
                                      className="flex-1 min-w-[70px] relative"
                                    >
                                      <QuickStatusPopover
                                        ordem={ordem}
                                        etapa={etapa}
                                        ordemEtapa={ordemEtapa}
                                        currentStatus={status}
                                        currentUser={currentUser}
                                        onStatusUpdate={updateOrdemEtapa}
                                        onCreateOrdemEtapa={createOrdemEtapa}
                                        onOpenDetails={handleOrdemClick}
                                      >
                                        <button
                                          className={`w-full h-6 rounded flex items-center justify-center transition-all cursor-pointer ${getStatusStyle(status, etapa.cor, hasOcorrencia)} hover:scale-105 hover:shadow relative`}
                                          title={`${etapa.nome} - ${status}${hasOcorrencia ? ' (com ocorrência)' : ''}`}
                                        >
                                          {hasOcorrencia && responsavelOcorrencia && (
                                            <div
                                              className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center overflow-hidden border-2 border-white z-10"
                                              style={{
                                                backgroundColor: responsavelOcorrencia.foto_url ? 'transparent' : (isDark ? '#1e3a8a' : '#dbeafe')
                                              }}
                                            >
                                              {responsavelOcorrencia.foto_url ? (
                                                <img
                                                  src={responsavelOcorrencia.foto_url}
                                                  alt={responsavelOcorrencia.full_name}
                                                  className="w-full h-full object-cover"
                                                />
                                              ) : (
                                                <User className="w-2 h-2" style={{ color: isDark ? '#60a5fa' : '#1d4ed8' }} />
                                              )}
                                            </div>
                                          )}

                                          <div className="flex items-center gap-0.5">
                                            {status === "concluida" && <CheckCircle2 className="w-2.5 h-2.5" />}
                                            {status === "bloqueada" && <AlertCircle className="w-2.5 h-2.5" />}
                                            {status === "em_andamento" && <Clock className="w-2.5 h-2.5" />}
                                            {status === "pendente" && <span className="text-xs leading-none">•</span>}
                                            {status === "cancelada" && <span className="text-xs leading-none">×</span>}
                                          </div>
                                        </button>
                                      </QuickStatusPopover>

                                      {timeInfo && status === "em_andamento" && (
                                        <div className="mt-0.5">
                                          <div className="h-0.5 rounded-full overflow-hidden"
                                            style={{ backgroundColor: isDark ? '#1e293b' : '#e5e7eb' }}>
                                            <div
                                              className={`h-full ${timeInfo.atrasado ? 'bg-red-500' : timeInfo.percentual > 75 ? 'bg-yellow-500' : 'bg-green-500'}`}
                                              style={{ width: `${Math.min(100, timeInfo.percentual)}%` }}
                                            />
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  );
                                })
                              )}
                            </div>

                            <div className="w-8 flex-shrink-0 flex items-center justify-center">
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-5 w-5 p-0"
                                style={{ color: theme.textMuted }}
                                onClick={() => handleEditOrdem(ordem)}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = isDark ? '#1e293b' : '#dbeafe'}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                title="Editar ordem"
                              >
                                <Edit className="w-2.5 h-2.5" />
                              </Button>
                            </div>
                          </div>
                        );
                      })}

                    </div>

                    {ordensLimitadas.length === 0 && (
                      <div className="text-center py-12" style={{ color: theme.textMuted }}>
                        <Package className="w-12 h-12 mx-auto mb-3 opacity-20" />
                        <p className="font-medium text-sm">Nenhuma ordem encontrada</p>
                        <p className="text-xs mt-1" style={{ color: isDark ? '#475569' : '#9ca3af' }}>Ajuste os filtros</p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="list" className="mt-4">
            <div className="overflow-x-auto pb-3">
              <div className="flex gap-3 min-w-max">
                {etapas.map((etapa) => {
                  const ordensNaEtapa = getOrdensporEtapa(etapa.id);

                  return (
                    <Card key={etapa.id} className="w-64 flex-shrink-0 border-t-2 shadow"
                      style={{ borderTopColor: etapa.cor, backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}>
                      <CardHeader className="pb-1.5 pt-2 px-3" style={{ backgroundColor: theme.cardBg }}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <div
                              className="w-2 h-2 rounded-full"
                              style={{ backgroundColor: etapa.cor }}
                            />
                            <CardTitle className="text-xs font-bold" style={{ color: theme.text }}>
                              {etapa.nome}
                            </CardTitle>
                          </div>
                          <Badge className="text-[10px] h-4 px-1.5 font-bold" style={{ backgroundColor: etapa.cor, color: 'white' }}>
                            {ordensNaEtapa.length}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-1.5 max-h-[500px] overflow-y-auto p-2">
                        {ordensNaEtapa.length === 0 ? (
                          <div className="text-center py-8" style={{ color: theme.textMuted }}>
                            <p className="text-xs">Nenhuma ordem</p>
                          </div>
                        ) : (
                          ordensNaEtapa.map((ordem) => {
                            const motorista = getMotorista(ordem.motorista_id);
                            const cavalo = getVeiculo(ordem.cavalo_id);
                            const implemento1 = getVeiculo(ordem.implemento1_id);
                            const implemento2 = getVeiculo(ordem.implemento2_id);
                            const implemento3 = getVeiculo(ordem.implemento3_id);
                            const ordemEtapa = ordensetapas.find(
                              oe => oe.ordem_id === ordem.id && oe.etapa_id === etapa.id
                            );
                            const timeInfo = calculateTimeRemaining(ordemEtapa, etapa, ordem);

                            const placas = [
                              cavalo?.placa,
                              implemento1?.placa,
                              implemento2?.placa,
                              implemento3?.placa
                            ].filter(Boolean);

                            return (
                              <div
                                key={ordem.id}
                                className="p-1.5 border rounded transition-all cursor-pointer"
                                style={{
                                  backgroundColor: theme.cardBg,
                                  borderColor: timeInfo && timeInfo.atrasado ? (isDark ? '#b91c1c' : '#f87171') : theme.cardBorder
                                }}
                                onClick={() => handleOrdemClick(ordem)}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
                                  e.currentTarget.style.borderColor = isDark ? '#3b82f6' : '#93c5fd';
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.boxShadow = '';
                                  e.currentTarget.style.borderColor = timeInfo && timeInfo.atrasado ? (isDark ? '#b91c1c' : '#f87171') : theme.cardBorder;
                                }}
                              >
                                <div className="flex items-start justify-between mb-1">
                                  <p className="font-bold text-xs text-blue-700 dark:text-blue-400 leading-tight">
                                    {ordem.numero_carga || `#${ordem.id.slice(-6)}`}
                                  </p>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-5 w-5 p-0"
                                    style={{ color: theme.textMuted }}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleEditOrdem(ordem);
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = isDark ? '#1e293b' : '#dbeafe'}
                                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                    title="Editar ordem"
                                  >
                                    <Edit className="w-2.5 h-2.5" />
                                  </Button>
                                </div>

                                <div className="space-y-0.5 text-[10px]">
                                  <p className="font-semibold truncate leading-tight" style={{ color: theme.text }}>{ordem.cliente}</p>
                                  <p className="truncate leading-tight" style={{ color: theme.textMuted }}>{ordem.origem} → {ordem.destino}</p>
                                  {(motorista || ordem.motorista_nome_temp) && (
                                    <p className="flex items-center gap-0.5 truncate leading-tight" style={{ color: theme.textMuted }}>
                                      <User className="w-2.5 h-2.5 flex-shrink-0" />
                                      <span className="truncate">{motorista ? formatarNomeMotorista(motorista.nome) : ordem.motorista_nome_temp}</span>
                                    </p>
                                  )}
                                  {(placas.length > 0 || ordem.cavalo_placa_temp || ordem.implemento1_placa_temp) && (
                                    <div className="flex items-start gap-0.5 leading-tight" style={{ color: theme.textMuted }}>
                                      <Truck className="w-2.5 h-2.5 flex-shrink-0 mt-0.5" />
                                      <span className="text-[9px] font-mono font-bold break-words" style={{ color: theme.text }}>
                                        {placas.length > 0 
                                          ? placas.join(' • ')
                                          : [ordem.cavalo_placa_temp, ordem.implemento1_placa_temp, ordem.implemento2_placa_temp].filter(Boolean).join(' • ')
                                        }
                                      </span>
                                    </div>
                                  )}

                                  {timeInfo && (
                                    <div className="mt-1 pt-1 border-t" style={{ borderColor: theme.cardBorder }}>
                                      <div className="h-0.5 rounded-full overflow-hidden mb-0.5"
                                        style={{ backgroundColor: isDark ? '#334155' : '#e5e7eb' }}>
                                        <div
                                          className={`h-full ${timeInfo.atrasado ? 'bg-red-500' : timeInfo.percentual > 75 ? 'bg-yellow-500' : 'bg-blue-500'}`}
                                          style={{ width: `${Math.min(100, timeInfo.percentual)}%` }}
                                        />
                                      </div>
                                      <p className={`text-[9px] font-bold ${timeInfo.atrasado ? 'text-red-600 dark:text-red-400' : 'text-blue-600 dark:text-blue-400'}`}>
                                        {timeInfo.atrasado && '⚠️ '}
                                        {formatTimeRemaining(timeInfo.minutosRestantes)}
                                      </p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {selectedOrdem && (
        <OrdemDetails
          open={!!selectedOrdem}
          onClose={() => setSelectedOrdem(null)}
          ordem={selectedOrdem}
          motoristas={motoristas}
          veiculos={veiculos}
          onUpdate={loadData}
          initialTab="workflow"
        />
      )}

      <FilterModal
        open={showFilters}
        onClose={() => setShowFilters(false)}
        filters={filters}
        onFiltersChange={setFilters}
        motoristas={motoristas}
        etapas={etapas}
        operacoes={operacoes}
        periodoSelecionado={periodoSelecionado}
        onPeriodoChange={(valor) => {
          console.log('📅 FLUXO FilterModal - Período alterado para:', valor);
          setPeriodoSelecionado(valor);
        }}
        isDark={isDark}
      />

      {showEditModal && ordemParaEditar && (
        <OrdemUnificadaForm
          tipo_ordem="carregamento"
          open={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setOrdemParaEditar(null);
          }}
          editingOrdem={ordemParaEditar}
          onSubmit={async (ordemData, notasFiscaisData) => {
            try {
              await base44.entities.OrdemDeCarregamento.update(ordemParaEditar.id, ordemData);
              handleEditSuccess();
            } catch (error) {
              console.error("Erro ao atualizar ordem:", error);
              alert("Erro ao atualizar ordem");
            }
          }}
          motoristas={motoristas}
          veiculos={veiculos}
          user={currentUser}
          isDark={isDark}
        />
      )}

      {/* Modal para Concluir Etapas por Período */}
      <Dialog open={showModalConcluir} onOpenChange={(open) => {
        if (!processandoNovembro) {
          setShowModalConcluir(open);
        }
      }}>
        <DialogContent style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}>
          <DialogHeader>
            <DialogTitle style={{ color: theme.text }}>Concluir Etapas Pendentes</DialogTitle>
            <DialogDescription style={{ color: theme.textMuted }}>
              Selecione o período para concluir todas as etapas não finalizadas das ordens criadas nesse intervalo.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div>
              <Label className="mb-2 block" style={{ color: theme.text }}>Data Inicial</Label>
              <Input
                type="date"
                value={dataInicioConcluir}
                onChange={(e) => setDataInicioConcluir(e.target.value)}
                disabled={processandoNovembro}
                style={{ backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.text }}
              />
            </div>
            
            <div>
              <Label className="mb-2 block" style={{ color: theme.text }}>Data Final</Label>
              <Input
                type="date"
                value={dataFimConcluir}
                onChange={(e) => setDataFimConcluir(e.target.value)}
                disabled={processandoNovembro}
                style={{ backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.text }}
              />
            </div>

            {processandoNovembro && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm" style={{ color: theme.text }}>
                  <span>{progressoTotal === 1 ? 'Carregando dados...' : 'Processando etapas...'}</span>
                  {progressoTotal > 1 && (
                    <span className="font-bold">{progressoAtual} / {progressoTotal}</span>
                  )}
                </div>
                <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: isDark ? '#334155' : '#e5e7eb' }}>
                  <div
                    className="h-full bg-orange-600 transition-all duration-300"
                    style={{ width: progressoTotal === 1 ? '100%' : `${(progressoAtual / progressoTotal) * 100}%` }}
                  />
                </div>
                {progressoTotal > 1 && (
                  <p className="text-xs text-center" style={{ color: theme.textMuted }}>
                    {Math.round((progressoAtual / progressoTotal) * 100)}% concluído
                  </p>
                )}
              </div>
            )}

            {!processandoNovembro && (
              <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-3">
                <p className="text-xs text-orange-800 dark:text-orange-400 font-medium">
                  ⚠️ Esta ação marcará como <strong>concluídas</strong> todas as etapas pendentes, em andamento ou bloqueadas das ordens criadas no período selecionado.
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowModalConcluir(false)}
              disabled={processandoNovembro}
              style={{ borderColor: theme.inputBorder, color: theme.text }}
            >
              {processandoNovembro ? 'Processando...' : 'Cancelar'}
            </Button>
            <Button
              onClick={processarEtapasPorPeriodo}
              disabled={!dataInicioConcluir || !dataFimConcluir || processandoNovembro}
              className="bg-orange-600 hover:bg-orange-700 text-white"
            >
              {processandoNovembro ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Processando...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Concluir Etapas
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}