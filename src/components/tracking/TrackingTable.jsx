import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { Eye, Edit, MoreVertical, MessageSquare, Upload, MapPin, User, Truck, Package, FileText, ChevronDown, Table as TableIcon, CalendarDays, CheckCircle, XCircle, AlertTriangle, ArrowUpDown, ArrowUp, ArrowDown, Settings, GripVertical } from "lucide-react";
import { toast } from "sonner";
import { format, differenceInDays } from "date-fns";
import { ptBR } from "date-fns/locale";

const statusTrackingConfig = {
  aguardando_agendamento: { label: "Aguardando", color: "bg-gray-600 text-white", textColor: "text-gray-700 dark:text-gray-300" },
  carregamento_agendado: { label: "Agendado", color: "bg-blue-600 text-white", textColor: "text-blue-700 dark:text-blue-300" },
  em_carregamento: { label: "Carregando", color: "bg-yellow-600 text-white", textColor: "text-yellow-700 dark:text-yellow-300" },
  carregado: { label: "Carregado", color: "bg-green-600 text-white", textColor: "text-green-700 dark:text-green-300" },
  em_viagem: { label: "Em Viagem", color: "bg-purple-600 text-white", textColor: "text-purple-700 dark:text-purple-300" },
  chegada_destino: { label: "No Destino", color: "bg-indigo-600 text-white", textColor: "text-indigo-700 dark:text-indigo-300" },
  descarga_agendada: { label: "Desc. Agendada", color: "bg-blue-700 text-white", textColor: "text-blue-700 dark:text-blue-300" },
  em_descarga: { label: "Descarregando", color: "bg-orange-600 text-white", textColor: "text-orange-700 dark:text-orange-300" },
  descarga_realizada: { label: "Descarregado", color: "bg-green-700 text-white", textColor: "text-green-700 dark:text-green-300" },
  finalizado: { label: "Finalizado", color: "bg-gray-700 text-white", textColor: "text-gray-700 dark:text-gray-300" }
};

const COLUNAS_TABELA_DISPONIVEIS = [
  { id: "tipo", label: "Tipo", enabled: true, fixed: true },
  { id: "numero_carga", label: "Ordem", enabled: true, fixed: true },
  { id: "data_solicitacao", label: "Data Solic.", enabled: true },
  { id: "operacao", label: "Operação", enabled: true },
  { id: "asn", label: "ASN", enabled: true },
  { id: "origem_destino", label: "Origem — Destino", enabled: true },
  { id: "produto", label: "Produto", enabled: true },
  { id: "motorista", label: "Motorista Principal", enabled: true },
  { id: "motorista_reserva", label: "Motorista Reserva", enabled: true },
  { id: "cavalo", label: "Cavalo", enabled: true },
  { id: "implementos", label: "Implementos", enabled: true },
  { id: "carregamento", label: "Carregamento", enabled: false },
  { id: "agenda_carga", label: "Agenda Carga", enabled: true },
  { id: "entrada_galpao", label: "Chegada Carga", enabled: false },
  { id: "inicio_carregamento", label: "Início Carga", enabled: false },
  { id: "fim_carregamento", label: "Fim Carga", enabled: false },
  { id: "saida_unidade", label: "Inicio Viagem", enabled: false },
  { id: "chegada_destino", label: "Chegada Destino", enabled: true },
  { id: "agenda_descarga", label: "Agenda Descarga", enabled: true },
  { id: "agendamento_checklist_data", label: "Agenda Checklist", enabled: false },
  { id: "descarga_realizada", label: "Descarga Realiz.", enabled: true },
  { id: "prazo_entrega", label: "Prazo Entrega (SLA)", enabled: false },
  { id: "status", label: "Status", enabled: true },
  { id: "distancia", label: "Distância", enabled: true },
  { id: "km_faltam", label: "KM Faltantes", enabled: true },
  { id: "tempo", label: "Tempo", enabled: true },
  { id: "sla_carga", label: "SLA Carga", enabled: true },
  { id: "sla_entrega", label: "SLA Entrega", enabled: true },
  { id: "diaria_carga", label: "Diária Carga", enabled: true },
  { id: "diaria_desc", label: "Diária Desc.", enabled: true },
  { id: "info", label: "Info", enabled: true, fixed: true },
  { id: "editar", label: "Editar", enabled: true, fixed: true },
  { id: "acoes", label: "Ações", enabled: true, fixed: true }
];

export default function TrackingTable({
  ordens,
  motoristas,
  veiculos,
  operacoes,
  loading,
  onOrdemClick,
  onUpdate,
  onEditTracking,
  onEditOrdemCompleta,
  onAbrirChat,
  onAbrirUpload,
  onExpurgar
}) {
  const [isDark, setIsDark] = useState(false);
  const [distancias, setDistancias] = useState({});
  const [calculandoDistancias, setCalculandoDistancias] = useState(false);
  const tableContainerRef = useRef(null);
  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const scrollLeftRef = useRef(0);
  const [sortField, setSortField] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc');
  const [colunas, setColunas] = useState(COLUNAS_TABELA_DISPONIVEIS);
  const [showColumnConfig, setShowColumnConfig] = useState(false);
  const [user, setUser] = useState(null);

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

  useEffect(() => {
    const loadUserConfig = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
        
        if (currentUser.tabela_colunas_config) {
          try {
            const parsedConfig = JSON.parse(currentUser.tabela_colunas_config);
            setColunas(parsedConfig);
          } catch (error) {
            console.error("Erro ao parsear configuração:", error);
            setColunas(COLUNAS_TABELA_DISPONIVEIS);
          }
        } else {
          setColunas(COLUNAS_TABELA_DISPONIVEIS);
        }
      } catch (error) {
        console.error("Erro ao carregar usuário:", error);
        setColunas(COLUNAS_TABELA_DISPONIVEIS);
      }
    };
    
    loadUserConfig();
  }, []);

  // Calcular distâncias para ordens em viagem
  useEffect(() => {
    const calcularDistanciasEmViagem = async () => {
      const ordensEmViagem = ordens.filter(o => 
        o.status_tracking === "em_viagem" && 
        o.localizacao_atual && 
        (o.destino_endereco || o.destino_cidade)
      );

      if (ordensEmViagem.length === 0) return;

      setCalculandoDistancias(true);
      const novasDistancias = { ...distancias };

      for (const ordem of ordensEmViagem) {
        if (novasDistancias[ordem.id]) continue;

        try {
          const destino = ordem.destino_endereco 
            ? `${ordem.destino_endereco}, ${ordem.destino_cidade}, ${ordem.destino_uf}`
            : `${ordem.destino_cidade}, ${ordem.destino_uf}`;

          const response = await base44.functions.invoke('calcularDistancia', {
            origem: ordem.localizacao_atual,
            destino: destino
          });

          if (response.data && !response.data.error) {
            novasDistancias[ordem.id] = {
              distancia_km: response.data.distancia_km,
              distancia_texto: response.data.distancia_texto,
              duracao_texto: response.data.duracao_texto
            };
          }
        } catch (error) {
          console.log(`Erro ao calcular distância para ordem ${ordem.numero_carga}:`, error);
        }
      }

      setDistancias(novasDistancias);
      setCalculandoDistancias(false);
    };

    if (ordens.length > 0) {
      calcularDistanciasEmViagem();
    }
  }, [ordens]);

  // Drag to scroll functionality
  useEffect(() => {
    const container = tableContainerRef.current;
    if (!container) return;

    const handleMouseDown = (e) => {
      // Ignore if clicking on button or interactive elements
      if (e.target.closest('button, a, [role="button"], [role="menuitem"]')) {
        return;
      }
      
      isDraggingRef.current = true;
      startXRef.current = e.pageX - container.offsetLeft;
      scrollLeftRef.current = container.scrollLeft;
      container.style.cursor = 'grabbing';
      container.style.userSelect = 'none';
    };

    const handleMouseMove = (e) => {
      if (!isDraggingRef.current) return;
      e.preventDefault();
      const x = e.pageX - container.offsetLeft;
      const walk = (x - startXRef.current) * 1.5;
      container.scrollLeft = scrollLeftRef.current - walk;
    };

    const handleMouseUp = () => {
      isDraggingRef.current = false;
      container.style.cursor = 'grab';
      container.style.userSelect = '';
    };

    const handleMouseLeave = () => {
      isDraggingRef.current = false;
      container.style.cursor = 'grab';
      container.style.userSelect = '';
    };

    container.addEventListener('mousedown', handleMouseDown);
    container.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('mouseup', handleMouseUp);
    container.addEventListener('mouseleave', handleMouseLeave);

    container.style.cursor = 'grab';

    return () => {
      container.removeEventListener('mousedown', handleMouseDown);
      container.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('mouseup', handleMouseUp);
      container.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  const getMotorista = (motoristaId) => {
    return motoristas.find(m => m.id === motoristaId);
  };

  const getVeiculo = (veiculoId) => {
    return veiculos.find(v => v.id === veiculoId);
  };

  const getOperacao = (operacaoId) => {
    return operacoes.find(op => op.id === operacaoId);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    try {
      const date = new Date(dateString);
      return format(date, "dd/MM/yy HH:mm", { locale: ptBR });
    } catch (error) {
      return "-";
    }
  };

  const abreviarNome = (nomeCompleto) => {
    if (!nomeCompleto) return "-";
    const partes = nomeCompleto.trim().split(/\s+/);
    if (partes.length <= 2) return nomeCompleto;
    
    const primeiros = partes.slice(0, 2).join(' ');
    const abreviados = partes.slice(2).map(p => p.charAt(0).toUpperCase() + '.').join(' ');
    return `${primeiros} ${abreviados}`;
  };

  const calcularAtraso = (ordem) => {
    if (!ordem.data_programacao_descarga || ordem.descarga_realizada_data) return null;
    
    const dataProgramada = new Date(ordem.data_programacao_descarga);
    const hoje = new Date();
    const dias = differenceInDays(hoje, dataProgramada);
    
    if (dias > 0) return dias;
    return null;
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

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const ordensSorted = [...ordens].sort((a, b) => {
    if (!sortField) return 0;

    let aVal, bVal;

    switch (sortField) {
      case 'numero_carga':
        aVal = a.numero_carga || '';
        bVal = b.numero_carga || '';
        break;
      case 'data_solicitacao':
        aVal = a.data_solicitacao ? new Date(a.data_solicitacao) : new Date(0);
        bVal = b.data_solicitacao ? new Date(b.data_solicitacao) : new Date(0);
        break;
      case 'operacao':
        const opA = getOperacao(a.operacao_id);
        const opB = getOperacao(b.operacao_id);
        aVal = opA?.nome || '';
        bVal = opB?.nome || '';
        break;
      case 'asn':
        aVal = a.asn || '';
        bVal = b.asn || '';
        break;
      case 'origem':
        aVal = a.origem_cidade || a.origem || '';
        bVal = b.origem_cidade || b.origem || '';
        break;
      case 'produto':
        aVal = a.produto || '';
        bVal = b.produto || '';
        break;
      case 'motorista':
        const motA = getMotorista(a.motorista_id);
        const motB = getMotorista(b.motorista_id);
        aVal = motA?.nome || '';
        bVal = motB?.nome || '';
        break;
      case 'cavalo':
        const cavA = getVeiculo(a.cavalo_id);
        const cavB = getVeiculo(b.cavalo_id);
        aVal = cavA?.placa || '';
        bVal = cavB?.placa || '';
        break;
      case 'carregamento':
        aVal = a.data_carregamento ? new Date(a.data_carregamento) : new Date(0);
        bVal = b.data_carregamento ? new Date(b.data_carregamento) : new Date(0);
        break;
      case 'agenda_carga':
        aVal = a.carregamento_agendamento_data ? new Date(a.carregamento_agendamento_data) : new Date(0);
        bVal = b.carregamento_agendamento_data ? new Date(b.carregamento_agendamento_data) : new Date(0);
        break;
      case 'entrada_galpao':
        aVal = a.entrada_galpao ? new Date(a.entrada_galpao) : new Date(0);
        bVal = b.entrada_galpao ? new Date(b.entrada_galpao) : new Date(0);
        break;
      case 'inicio_carregamento':
        aVal = a.inicio_carregamento ? new Date(a.inicio_carregamento) : new Date(0);
        bVal = b.inicio_carregamento ? new Date(b.inicio_carregamento) : new Date(0);
        break;
      case 'fim_carregamento':
        aVal = a.fim_carregamento ? new Date(a.fim_carregamento) : new Date(0);
        bVal = b.fim_carregamento ? new Date(b.fim_carregamento) : new Date(0);
        break;
      case 'saida_unidade':
        aVal = a.saida_unidade ? new Date(a.saida_unidade) : new Date(0);
        bVal = b.saida_unidade ? new Date(b.saida_unidade) : new Date(0);
        break;
      case 'agenda_descarga':
        aVal = a.descarga_agendamento_data ? new Date(a.descarga_agendamento_data) : new Date(0);
        bVal = b.descarga_agendamento_data ? new Date(b.descarga_agendamento_data) : new Date(0);
        break;
      case 'agendamento_checklist_data':
        aVal = a.agendamento_checklist_data ? new Date(a.agendamento_checklist_data) : new Date(0);
        bVal = b.agendamento_checklist_data ? new Date(b.agendamento_checklist_data) : new Date(0);
        break;
      case 'chegada_destino':
        aVal = a.chegada_destino ? new Date(a.chegada_destino) : new Date(0);
        bVal = b.chegada_destino ? new Date(b.chegada_destino) : new Date(0);
        break;
      case 'descarga_realizada':
        aVal = a.descarga_realizada_data ? new Date(a.descarga_realizada_data) : new Date(0);
        bVal = b.descarga_realizada_data ? new Date(b.descarga_realizada_data) : new Date(0);
        break;
      case 'prazo_entrega':
        aVal = a.prazo_entrega ? new Date(a.prazo_entrega) : new Date(0);
        bVal = b.prazo_entrega ? new Date(b.prazo_entrega) : new Date(0);
        break;
      case 'status':
        aVal = a.status_tracking || '';
        bVal = b.status_tracking || '';
        break;
      case 'distancia':
        aVal = distancias[a.id]?.distancia_km || 0;
        bVal = distancias[b.id]?.distancia_km || 0;
        break;
      case 'km_faltam':
        aVal = a.km_faltam || 0;
        bVal = b.km_faltam || 0;
        break;
      default:
        return 0;
    }

    if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const SortableHeader = ({ field, children }) => (
    <TableHead 
      className="h-8 text-[10px] font-bold uppercase cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors select-none"
      style={{ color: theme.textMuted }}
      onClick={() => handleSort(field)}
    >
      <div className="flex items-center gap-1">
        {children}
        {sortField === field ? (
          sortDirection === 'asc' ? (
            <ArrowUp className="w-3 h-3" />
          ) : (
            <ArrowDown className="w-3 h-3" />
          )
        ) : (
          <ArrowUpDown className="w-3 h-3 opacity-30" />
        )}
      </div>
    </TableHead>
  );

  const toggleColuna = async (colunaId) => {
    const newColunas = colunas.map(col =>
      col.id === colunaId ? { ...col, enabled: !col.enabled } : col
    );
    setColunas(newColunas);
    
    try {
      await base44.auth.updateMe({
        tabela_colunas_config: JSON.stringify(newColunas)
      });
    } catch (error) {
      console.error("Erro ao salvar configuração:", error);
      toast.error("Erro ao salvar configuração");
    }
  };

  const handleDragEnd = async (result) => {
    if (!result.destination) return;

    const items = Array.from(colunas);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setColunas(items);
    
    try {
      await base44.auth.updateMe({
        tabela_colunas_config: JSON.stringify(items)
      });
      toast.success("Ordem das colunas atualizada!");
    } catch (error) {
      console.error("Erro ao salvar configuração:", error);
      toast.error("Erro ao salvar configuração");
    }
  };

  const resetColunas = async () => {
    setColunas(COLUNAS_TABELA_DISPONIVEIS);
    
    try {
      await base44.auth.updateMe({
        tabela_colunas_config: JSON.stringify(COLUNAS_TABELA_DISPONIVEIS)
      });
      toast.success("Configuração de colunas restaurada!");
    } catch (error) {
      console.error("Erro ao salvar configuração:", error);
      toast.error("Erro ao salvar configuração");
    }
  };

  const colunasVisiveis = colunas.filter(col => col.enabled);

  const exportarPDF = async (tipoVisao) => {
    try {
      const ordensParaExportar = ordens.map(ordem => {
        const motorista = getMotorista(ordem.motorista_id);
        const cavalo = getVeiculo(ordem.cavalo_id);
        const impl1 = getVeiculo(ordem.implemento1_id);
        const impl2 = getVeiculo(ordem.implemento2_id);
        const operacao = getOperacao(ordem.operacao_id);

        return {
          ...ordem,
          motorista_nome: motorista?.nome || "-",
          cavalo_placa: cavalo?.placa || "-",
          implemento1_placa: impl1?.placa || "-",
          implemento2_placa: impl2?.placa || "-",
          operacao_nome: operacao?.nome || "-",
          operacao_tolerancia_horas: operacao?.tolerancia_horas || 0
        };
      });

      // Carregar configuração de colunas
      let colunasConfig = null;
      const savedConfig = localStorage.getItem('planilha_colunas_config');
      if (savedConfig) {
        try {
          colunasConfig = JSON.parse(savedConfig).filter(col => col.enabled);
        } catch (error) {
          console.error("Erro ao carregar config de colunas:", error);
        }
      }

      const response = await base44.functions.invoke('gerarPdfTracking', {
        ordens: ordensParaExportar,
        tipoVisao: tipoVisao,
        colunasConfig: colunasConfig
      });

      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `tracking_${tipoVisao}_${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success('PDF exportado com sucesso!');
    } catch (error) {
      console.error('Erro ao exportar PDF:', error);
      toast.error('Erro ao exportar PDF');
    }
  };

  const theme = {
    cardBg: isDark ? '#1e293b' : '#ffffff',
    cardBorder: isDark ? '#334155' : '#e5e7eb',
    text: isDark ? '#f1f5f9' : '#111827',
    textMuted: isDark ? '#94a3b8' : '#6b7280',
    headerBg: isDark ? '#0f172a' : '#f9fafb',
    rowBg: isDark ? '#1e293b' : '#ffffff',
    rowBgAlt: isDark ? '#0f172a' : '#f9fafb',
    rowHover: isDark ? '#334155' : '#eff6ff',
    border: isDark ? '#334155' : '#e5e7eb',
  };

  if (loading) {
    return (
      <Card className="shadow" style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}>
        <CardContent className="p-6">
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-10 w-full" style={{ backgroundColor: isDark ? '#334155' : '#e5e7eb' }} />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow" style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}>
      <CardHeader className="pb-1.5 pt-1.5 px-3 border-b" style={{ backgroundColor: theme.headerBg, borderBottomColor: theme.border }}>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-sm font-semibold" style={{ color: theme.text }}>
            <Package className="w-4 h-4" />
            Tabela - Tracking ({ordens.length})
          </CardTitle>
          <div className="flex gap-2">
            <Button
              onClick={() => setShowColumnConfig(true)}
              variant="outline"
              size="sm"
              className="h-7 text-xs"
              style={{
                borderColor: theme.border,
                color: theme.textMuted,
                backgroundColor: 'transparent',
              }}
            >
              <Settings className="w-3 h-3 mr-1" />
              Colunas
            </Button>
            <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                disabled={loading || ordens.length === 0}
                size="sm"
                className="h-7 text-xs"
                style={{
                  backgroundColor: theme.cardBg,
                  borderColor: theme.border,
                  color: theme.text,
                  borderWidth: '1px'
                }}
              >
                <FileText className="w-3 h-3 mr-1.5" />
                Exportar PDF
                <ChevronDown className="w-3 h-3 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent 
              align="end"
              style={{
                backgroundColor: theme.cardBg,
                borderColor: theme.border
              }}
            >
              <DropdownMenuItem
                onClick={() => exportarPDF('table')}
                style={{ color: theme.text }}
                className="text-xs"
              >
                <FileText className="w-3 h-3 mr-2" />
                Tabela Padrão
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => exportarPDF('planilha')}
                style={{ color: theme.text }}
                className="text-xs"
              >
                <TableIcon className="w-3 h-3 mr-2" />
                Planilha Compacta
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => exportarPDF('agrupado_descarga')}
                style={{ color: theme.text }}
                className="text-xs"
              >
                <CalendarDays className="w-3 h-3 mr-2" />
                Agrupado por Descarga
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto" ref={tableContainerRef}>
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent" style={{ borderBottomColor: theme.border }}>
                {colunasVisiveis.map((coluna) => {
                  if (coluna.id === "tipo") {
                    return <TableHead key={coluna.id} className="h-8 text-[10px] font-bold uppercase" style={{ color: theme.textMuted }}>Tipo</TableHead>;
                  }
                  if (coluna.id === "numero_carga") {
                    return <SortableHeader key={coluna.id} field="numero_carga">Ordem</SortableHeader>;
                  }
                  if (coluna.id === "data_solicitacao") {
                    return <SortableHeader key={coluna.id} field="data_solicitacao">Data Solic.</SortableHeader>;
                  }
                  if (coluna.id === "operacao") {
                    return <SortableHeader key={coluna.id} field="operacao">Operação</SortableHeader>;
                  }
                  if (coluna.id === "asn") {
                    return <SortableHeader key={coluna.id} field="asn">ASN</SortableHeader>;
                  }
                  if (coluna.id === "origem_destino") {
                    return <SortableHeader key={coluna.id} field="origem">Origem — Destino</SortableHeader>;
                  }
                  if (coluna.id === "produto") {
                    return <SortableHeader key={coluna.id} field="produto">Produto</SortableHeader>;
                  }
                  if (coluna.id === "motorista") {
                    return <SortableHeader key={coluna.id} field="motorista">Motorista Principal</SortableHeader>;
                  }
                  if (coluna.id === "motorista_reserva") {
                    return <TableHead key={coluna.id} className="h-8 text-[10px] font-bold uppercase" style={{ color: theme.textMuted }}>Motorista Reserva</TableHead>;
                  }
                  if (coluna.id === "cavalo") {
                    return <SortableHeader key={coluna.id} field="cavalo">Cavalo</SortableHeader>;
                  }
                  if (coluna.id === "implementos") {
                    return <TableHead key={coluna.id} className="h-8 text-[10px] font-bold uppercase" style={{ color: theme.textMuted }}>Implementos</TableHead>;
                  }
                  if (coluna.id === "carregamento") {
                    return <SortableHeader key={coluna.id} field="carregamento">Carregamento</SortableHeader>;
                  }
                  if (coluna.id === "agenda_carga") {
                    return <SortableHeader key={coluna.id} field="agenda_carga">Agenda Carga</SortableHeader>;
                  }
                  if (coluna.id === "entrada_galpao") {
                    return <SortableHeader key={coluna.id} field="entrada_galpao">Chegada Carga</SortableHeader>;
                  }
                  if (coluna.id === "inicio_carregamento") {
                    return <SortableHeader key={coluna.id} field="inicio_carregamento">Início Carga</SortableHeader>;
                  }
                  if (coluna.id === "fim_carregamento") {
                    return <SortableHeader key={coluna.id} field="fim_carregamento">Fim Carga</SortableHeader>;
                  }
                  if (coluna.id === "saida_unidade") {
                    return <SortableHeader key={coluna.id} field="saida_unidade">Inicio Viagem</SortableHeader>;
                  }
                  if (coluna.id === "chegada_destino") {
                    return <SortableHeader key={coluna.id} field="chegada_destino">Chegada Destino</SortableHeader>;
                  }
                  if (coluna.id === "agenda_descarga") {
                    return <SortableHeader key={coluna.id} field="agenda_descarga">Agenda Descarga</SortableHeader>;
                  }
                  if (coluna.id === "agendamento_checklist_data") {
                    return <SortableHeader key={coluna.id} field="agendamento_checklist_data">Agenda Checklist</SortableHeader>;
                  }
                  if (coluna.id === "descarga_realizada") {
                    return <SortableHeader key={coluna.id} field="descarga_realizada">Descarga Realiz.</SortableHeader>;
                  }
                  if (coluna.id === "prazo_entrega") {
                    return <SortableHeader key={coluna.id} field="prazo_entrega">Prazo Entrega (SLA)</SortableHeader>;
                  }
                  if (coluna.id === "status") {
                    return <SortableHeader key={coluna.id} field="status">Status</SortableHeader>;
                  }
                  if (coluna.id === "distancia") {
                    return <SortableHeader key={coluna.id} field="distancia">Distância</SortableHeader>;
                  }
                  if (coluna.id === "km_faltam") {
                    return <SortableHeader key={coluna.id} field="km_faltam">KM Faltantes</SortableHeader>;
                  }
                  if (coluna.id === "tempo") {
                    return <TableHead key={coluna.id} className="h-8 text-[10px] font-bold uppercase" style={{ color: theme.textMuted }}>Tempo</TableHead>;
                  }
                  if (coluna.id === "sla_carga") {
                    return <TableHead key={coluna.id} className="h-8 text-[10px] font-bold uppercase" style={{ color: theme.textMuted }}>SLA Carga</TableHead>;
                  }
                  if (coluna.id === "sla_entrega") {
                    return <TableHead key={coluna.id} className="h-8 text-[10px] font-bold uppercase" style={{ color: theme.textMuted }}>SLA Entrega</TableHead>;
                  }
                  if (coluna.id === "diaria_carga") {
                    return <TableHead key={coluna.id} className="h-8 text-[10px] font-bold uppercase" style={{ color: theme.textMuted }}>Diária Carga</TableHead>;
                  }
                  if (coluna.id === "diaria_desc") {
                    return <TableHead key={coluna.id} className="h-8 text-[10px] font-bold uppercase" style={{ color: theme.textMuted }}>Diária Desc.</TableHead>;
                  }
                  if (coluna.id === "info") {
                    return <TableHead key={coluna.id} className="h-8 text-[10px] font-bold uppercase" style={{ color: theme.textMuted }}>Info</TableHead>;
                  }
                  if (coluna.id === "editar") {
                    return <TableHead key={coluna.id} className="h-8 text-[10px] font-bold uppercase" style={{ color: theme.textMuted }}>Editar</TableHead>;
                  }
                  if (coluna.id === "acoes") {
                    return <TableHead key={coluna.id} className="h-8 text-[10px] font-bold uppercase text-right" style={{ color: theme.textMuted }}>Ações</TableHead>;
                  }
                  return null;
                })}
              </TableRow>
            </TableHeader>
            <TableBody>
              {ordensSorted.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={colunasVisiveis.length} className="text-center py-12 text-xs" style={{ color: theme.textMuted }}>
                    Nenhuma ordem encontrada
                  </TableCell>
                </TableRow>
              ) : (
                ordensSorted.map((ordem, idx) => {
                  const motoristaPrincipal = getMotorista(ordem.motorista_id);
                  const motoristaReserva = getMotorista(ordem.motorista_reserva_id);
                  const cavalo = getVeiculo(ordem.cavalo_id);
                  const impl1 = getVeiculo(ordem.implemento1_id);
                  const impl2 = getVeiculo(ordem.implemento2_id);
                  const impl3 = getVeiculo(ordem.implemento3_id);
                  const operacao = getOperacao(ordem.operacao_id);
                  const statusInfo = statusTrackingConfig[ordem.status_tracking] || statusTrackingConfig.aguardando_agendamento;
                  
                  const temMotorista = !!ordem.motorista_id;
                  const temVeiculo = !!ordem.cavalo_id;
                  const isOferta = !temMotorista || !temVeiculo;
                  const diasAtraso = calcularAtraso(ordem);
                  const diariaCarregamento = calcularDiariaCarregamento(ordem);
                  const diariaDescarga = calcularDiariaDescarga(ordem);

                  return (
                    <TableRow
                      key={ordem.id}
                      className="transition-colors cursor-pointer h-[36px]"
                      style={{
                        backgroundColor: idx % 2 === 0 ? theme.rowBg : theme.rowBgAlt,
                        borderBottomColor: theme.border
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = theme.rowHover}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = idx % 2 === 0 ? theme.rowBg : theme.rowBgAlt}
                      onClick={() => onOrdemClick(ordem)}
                    >
                      {colunasVisiveis.map((coluna) => {
                        if (coluna.id === "tipo") {
                          return (
                            <TableCell key={coluna.id} className="py-1 px-2 align-middle" onClick={(e) => e.stopPropagation()}>
                        <Badge
                          className="font-bold text-[9px] h-5 px-2 whitespace-nowrap"
                          style={{
                            backgroundColor: isOferta 
                              ? (isDark ? 'rgba(22, 101, 52, 0.3)' : 'rgba(220, 252, 231, 1)')
                              : (isDark ? 'rgba(30, 64, 175, 0.3)' : 'rgba(219, 234, 254, 1)'),
                            color: isOferta
                              ? (isDark ? '#86efac' : '#15803d')
                              : (isDark ? '#93c5fd' : '#1e40af'),
                            borderWidth: '1px',
                            borderStyle: 'solid',
                            borderColor: isOferta
                              ? (isDark ? '#22c55e' : '#86efac')
                              : (isDark ? '#3b82f6' : '#93c5fd')
                          }}
                        >
                          {isOferta ? "🟢 Oferta" : "🔵 Alocado"}
                        </Badge>
                      </TableCell>
                          );
                        }
                        if (coluna.id === "numero_carga") {
                          return (
                            <TableCell key={coluna.id} className="py-1 px-2 align-middle">
                        <p className="font-bold text-[10px] truncate max-w-[80px]" style={{ color: isDark ? '#60a5fa' : '#1d4ed8' }}>
                          {ordem.numero_carga || `#${ordem.id.slice(-6)}`}
                        </p>
                      </TableCell>
                          );
                        }
                        if (coluna.id === "data_solicitacao") {
                          return (
                            <TableCell key={coluna.id} className="py-1 px-2 align-middle text-[10px]" style={{ color: theme.text }}>
                        {formatDate(ordem.data_solicitacao)}
                      </TableCell>
                          );
                        }
                        if (coluna.id === "operacao") {
                          return (
                            <TableCell key={coluna.id} className="py-1 px-2 align-middle">
                        {operacao ? (
                          <p 
                            className="text-[10px] font-semibold truncate max-w-[100px]" 
                            style={{ color: theme.text }}
                            title={operacao.nome}
                          >
                            {operacao.nome}
                          </p>
                        ) : (
                          <span className="text-[9px]" style={{ color: theme.textMuted }}>-</span>
                        )}
                      </TableCell>
                          );
                        }
                        if (coluna.id === "asn") {
                          return (
                            <TableCell key={coluna.id} className="py-1 px-2 align-middle text-[10px] font-medium" style={{ color: theme.text }}>
                        {ordem.asn || "-"}
                      </TableCell>
                          );
                        }
                        if (coluna.id === "origem_destino") {
                          return (
                            <TableCell key={coluna.id} className="py-1 px-2 align-middle text-[10px]" style={{ color: theme.text }}>
                        <span className="truncate max-w-[140px] inline-block">
                          {ordem.origem_cidade || ordem.origem} → {ordem.destino_cidade || ordem.destino}
                        </span>
                      </TableCell>
                          );
                        }
                        if (coluna.id === "produto") {
                          return (
                            <TableCell key={coluna.id} className="py-1 px-2 align-middle text-[10px]" style={{ color: theme.text }}>
                        <span className="truncate max-w-[100px] inline-block">{ordem.produto || "-"}</span>
                      </TableCell>
                          );
                        }
                        if (coluna.id === "motorista") {
                          return (
                            <TableCell key={coluna.id} className="py-1 px-2 align-middle">
                        {motoristaPrincipal ? (
                          <div className="flex items-center gap-1">
                            <User className="w-3 h-3 text-blue-600" />
                            <span className="text-[10px] truncate max-w-[140px] inline-block font-medium" style={{ color: theme.text }} title={motoristaPrincipal.nome}>
                              {abreviarNome(motoristaPrincipal.nome)}
                            </span>
                          </div>
                        ) : (
                          <span className="text-[9px]" style={{ color: theme.textMuted }}>-</span>
                        )}
                      </TableCell>
                          );
                        }
                        if (coluna.id === "motorista_reserva") {
                          return (
                            <TableCell key={coluna.id} className="py-1 px-2 align-middle">
                        {motoristaReserva ? (
                          <div className="flex items-center gap-1">
                            <User className="w-3 h-3 text-orange-600" />
                            <span className="text-[10px] truncate max-w-[140px] inline-block font-medium" style={{ color: theme.text }} title={motoristaReserva.nome}>
                              {abreviarNome(motoristaReserva.nome)}
                            </span>
                          </div>
                        ) : (
                          <span className="text-[9px]" style={{ color: theme.textMuted }}>-</span>
                        )}
                      </TableCell>
                          );
                        }
                        if (coluna.id === "cavalo") {
                          return (
                            <TableCell key={coluna.id} className="py-1 px-2 align-middle">
                        {cavalo ? (
                          <span className="text-[10px] font-mono font-bold" style={{ color: theme.text }}>
                            {cavalo.placa}
                          </span>
                        ) : (
                          <span className="text-[9px]" style={{ color: theme.textMuted }}>-</span>
                        )}
                      </TableCell>
                          );
                        }
                        if (coluna.id === "implementos") {
                          return (
                            <TableCell key={coluna.id} className="py-1 px-2 align-middle">
                        {impl1 || impl2 || impl3 ? (
                          <div className="flex flex-col gap-0.5">
                            {impl1 && <span className="text-[10px] font-mono font-bold" style={{ color: theme.text }}>{impl1.placa}</span>}
                            {impl2 && <span className="text-[10px] font-mono" style={{ color: theme.textMuted }}>{impl2.placa}</span>}
                            {impl3 && <span className="text-[10px] font-mono" style={{ color: theme.textMuted }}>{impl3.placa}</span>}
                          </div>
                        ) : (
                          <span className="text-[9px]" style={{ color: theme.textMuted }}>-</span>
                        )}
                      </TableCell>
                          );
                        }
                        if (coluna.id === "carregamento") {
                          return (
                            <TableCell key={coluna.id} className="py-1 px-2 align-middle text-[10px]" style={{ color: theme.text }}>
                        {formatDate(ordem.data_carregamento)}
                      </TableCell>
                          );
                        }
                        if (coluna.id === "agenda_carga") {
                          return (
                            <TableCell key={coluna.id} className="py-1 px-2 align-middle text-[10px]" style={{ color: theme.text }}>
                        {formatDate(ordem.carregamento_agendamento_data)}
                      </TableCell>
                          );
                        }
                        if (coluna.id === "entrada_galpao") {
                          return (
                            <TableCell key={coluna.id} className="py-1 px-2 align-middle text-[10px]" style={{ color: theme.text }}>
                        {formatDate(ordem.entrada_galpao)}
                      </TableCell>
                          );
                        }
                        if (coluna.id === "inicio_carregamento") {
                          return (
                            <TableCell key={coluna.id} className="py-1 px-2 align-middle text-[10px]" style={{ color: theme.text }}>
                        {formatDate(ordem.inicio_carregamento)}
                      </TableCell>
                          );
                        }
                        if (coluna.id === "fim_carregamento") {
                          return (
                            <TableCell key={coluna.id} className="py-1 px-2 align-middle text-[10px]" style={{ color: theme.text }}>
                        {formatDate(ordem.fim_carregamento)}
                      </TableCell>
                          );
                        }
                        if (coluna.id === "saida_unidade") {
                          return (
                            <TableCell key={coluna.id} className="py-1 px-2 align-middle text-[10px]" style={{ color: theme.text }}>
                        {formatDate(ordem.saida_unidade)}
                      </TableCell>
                          );
                        }
                        if (coluna.id === "chegada_destino") {
                          return (
                            <TableCell key={coluna.id} className="py-1 px-2 align-middle text-[10px]" style={{ color: theme.text }}>
                        {formatDate(ordem.chegada_destino)}
                      </TableCell>
                          );
                        }
                        if (coluna.id === "agenda_descarga") {
                          return (
                            <TableCell key={coluna.id} className="py-1 px-2 align-middle text-[10px]" style={{ color: theme.text }}>
                        {formatDate(ordem.descarga_agendamento_data)}
                      </TableCell>
                          );
                        }
                        if (coluna.id === "agendamento_checklist_data") {
                          return (
                            <TableCell key={coluna.id} className="py-1 px-2 align-middle text-[10px]" style={{ color: theme.text }}>
                        {formatDate(ordem.agendamento_checklist_data)}
                      </TableCell>
                          );
                        }
                        if (coluna.id === "descarga_realizada") {
                          return (
                            <TableCell key={coluna.id} className="py-1 px-2 align-middle text-[10px]" style={{ color: theme.text }}>
                        {formatDate(ordem.descarga_realizada_data)}
                      </TableCell>
                          );
                        }
                        if (coluna.id === "prazo_entrega") {
                          return (
                            <TableCell key={coluna.id} className="py-1 px-2 align-middle text-[10px]" style={{ color: theme.text }}>
                        {formatDate(ordem.prazo_entrega)}
                      </TableCell>
                          );
                        }
                        if (coluna.id === "status") {
                          return (
                            <TableCell key={coluna.id} className="py-1 px-2 align-middle" onClick={(e) => e.stopPropagation()}>
                        <Badge className={`${statusInfo.color} text-[9px] h-4 px-1.5 font-medium whitespace-nowrap`}>
                          {statusInfo.label}
                        </Badge>
                      </TableCell>
                          );
                        }
                        if (coluna.id === "distancia") {
                          return (
                            <TableCell key={coluna.id} className="py-1 px-2 align-middle text-center">
                        {ordem.status_tracking === "em_viagem" && ordem.localizacao_atual ? (
                          distancias[ordem.id] ? (
                            <div className="flex flex-col items-center">
                              <Badge className="bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400 text-[9px] h-4 px-1.5 font-bold">
                                {distancias[ordem.id].distancia_km} km
                              </Badge>
                              <span className="text-[8px] mt-0.5" style={{ color: theme.textMuted }}>
                                ~{distancias[ordem.id].duracao_texto}
                              </span>
                            </div>
                          ) : calculandoDistancias ? (
                            <div className="flex items-center justify-center">
                              <div className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                            </div>
                          ) : (
                            <span className="text-[9px]" style={{ color: theme.textMuted }}>-</span>
                          )
                        ) : (
                          <span className="text-[9px]" style={{ color: theme.textMuted }}>-</span>
                        )}
                      </TableCell>
                          );
                        }
                        if (coluna.id === "km_faltam") {
                          return (
                            <TableCell key={coluna.id} className="py-1 px-2 align-middle text-[10px] text-center font-medium" style={{ color: theme.text }}>
                        {ordem.km_faltam ? `${ordem.km_faltam} km` : "-"}
                      </TableCell>
                          );
                        }
                        if (coluna.id === "tempo") {
                          return (
                            <TableCell key={coluna.id} className="py-1 px-2 align-middle text-center">
                        {ordem.inicio_carregamento && !ordem.descarga_realizada_data ? (
                          <Badge 
                            className="text-[9px] h-4 px-1.5 font-semibold"
                            style={{ 
                              backgroundColor: isDark ? 'rgba(37, 99, 235, 0.15)' : '#dbeafe',
                              borderWidth: '1px',
                              borderColor: isDark ? '#3b82f6' : '#93c5fd',
                              color: isDark ? '#60a5fa' : '#1e40af'
                            }}
                          >
                            {differenceInDays(new Date(), new Date(ordem.inicio_carregamento))}d
                          </Badge>
                        ) : (
                          <span className="text-[9px]" style={{ color: theme.textMuted }}>-</span>
                        )}
                      </TableCell>
                          );
                        }
                        if (coluna.id === "sla_carga") {
                          return (
                            <TableCell key={coluna.id} className="py-1 px-2 align-middle text-center" onClick={(e) => e.stopPropagation()}>
                        {(() => {
                          // Verifica se tem carregamento_agendamento_data e fim_carregamento
                          if (!ordem.carregamento_agendamento_data || !ordem.fim_carregamento) {
                            return <span className="text-[9px]" style={{ color: theme.textMuted }}>-</span>;
                          }

                          const agendado = new Date(ordem.carregamento_agendamento_data);
                          const realizado = new Date(ordem.fim_carregamento);

                          // Se foi expurgado
                          if (ordem.carregamento_expurgado) {
                            return (
                              <div className="flex items-center justify-center gap-1">
                                <Badge 
                                  className="text-[9px] h-4 px-1.5 font-bold cursor-help"
                                  style={{
                                    backgroundColor: isDark ? 'rgba(107, 114, 128, 0.3)' : '#f3f4f6',
                                    borderWidth: '1px',
                                    borderColor: isDark ? '#6b7280' : '#d1d5db',
                                    color: isDark ? '#9ca3af' : '#6b7280'
                                  }}
                                  title={`Expurgado: ${ordem.carregamento_expurgo_motivo || 'N/A'}`}
                                >
                                  EXPURGADO
                                </Badge>
                              </div>
                            );
                          }

                          // Verifica se está no prazo (realizado <= agendado)
                          const noPrazo = realizado <= agendado;

                          if (noPrazo) {
                            return (
                              <Badge 
                                className="text-[9px] h-4 px-1.5 font-bold"
                                style={{
                                  backgroundColor: isDark ? 'rgba(34, 197, 94, 0.2)' : '#dcfce7',
                                  borderWidth: '1px',
                                  borderColor: isDark ? '#22c55e' : '#86efac',
                                  color: isDark ? '#4ade80' : '#15803d'
                                }}
                              >
                                ✓ NO PRAZO
                              </Badge>
                            );
                          } else {
                            return (
                              <div className="flex items-center justify-center gap-1">
                                <Badge 
                                  className="text-[9px] h-4 px-1.5 font-bold"
                                  style={{
                                    backgroundColor: isDark ? 'rgba(239, 68, 68, 0.2)' : '#fee2e2',
                                    borderWidth: '1px',
                                    borderColor: isDark ? '#ef4444' : '#fca5a5',
                                    color: isDark ? '#f87171' : '#dc2626'
                                  }}
                                >
                                  ✗ ATRASADO
                                </Badge>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-4 w-4 p-0"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onExpurgar(ordem, "carregamento");
                                  }}
                                  title="Expurgar carregamento"
                                >
                                  <AlertTriangle className="w-3 h-3 text-orange-600" />
                                </Button>
                              </div>
                            );
                          }
                        })()}
                      </TableCell>
                          );
                        }
                        if (coluna.id === "sla_entrega") {
                          return (
                            <TableCell key={coluna.id} className="py-1 px-2 align-middle text-center" onClick={(e) => e.stopPropagation()}>
                        {(() => {
                          // Verifica se tem prazo_entrega e chegada_destino
                          if (!ordem.prazo_entrega || !ordem.chegada_destino) {
                            return <span className="text-[9px]" style={{ color: theme.textMuted }}>-</span>;
                          }

                          const prazo = new Date(ordem.prazo_entrega);
                          const realizado = new Date(ordem.chegada_destino);

                          // Se foi expurgado
                          if (ordem.entrega_expurgada) {
                            return (
                              <div className="flex items-center justify-center gap-1">
                                <Badge 
                                  className="text-[9px] h-4 px-1.5 font-bold cursor-help"
                                  style={{
                                    backgroundColor: isDark ? 'rgba(107, 114, 128, 0.3)' : '#f3f4f6',
                                    borderWidth: '1px',
                                    borderColor: isDark ? '#6b7280' : '#d1d5db',
                                    color: isDark ? '#9ca3af' : '#6b7280'
                                  }}
                                  title={`Expurgado: ${ordem.entrega_expurgo_motivo || 'N/A'}`}
                                >
                                  EXPURGADO
                                </Badge>
                              </div>
                            );
                          }

                          // Verifica se está no prazo (realizado <= prazo)
                          const noPrazo = realizado <= prazo;

                          if (noPrazo) {
                            return (
                              <Badge 
                                className="text-[9px] h-4 px-1.5 font-bold"
                                style={{
                                  backgroundColor: isDark ? 'rgba(34, 197, 94, 0.2)' : '#dcfce7',
                                  borderWidth: '1px',
                                  borderColor: isDark ? '#22c55e' : '#86efac',
                                  color: isDark ? '#4ade80' : '#15803d'
                                }}
                              >
                                ✓ NO PRAZO
                              </Badge>
                            );
                          } else {
                            return (
                              <div className="flex items-center justify-center gap-1">
                                <Badge 
                                  className="text-[9px] h-4 px-1.5 font-bold"
                                  style={{
                                    backgroundColor: isDark ? 'rgba(239, 68, 68, 0.2)' : '#fee2e2',
                                    borderWidth: '1px',
                                    borderColor: isDark ? '#ef4444' : '#fca5a5',
                                    color: isDark ? '#f87171' : '#dc2626'
                                  }}
                                >
                                  ✗ ATRASADO
                                </Badge>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-4 w-4 p-0"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onExpurgar(ordem, "entrega");
                                  }}
                                  title="Expurgar entrega"
                                >
                                  <AlertTriangle className="w-3 h-3 text-orange-600" />
                                </Button>
                              </div>
                            );
                          }
                        })()}
                      </TableCell>
                          );
                        }
                        if (coluna.id === "diaria_carga") {
                          return (
                            <TableCell key={coluna.id} className="py-1 px-2 align-middle text-center">
                        {diariaCarregamento !== null && diariaCarregamento > 0 ? (
                          <Badge 
                            className="text-[9px] h-4 px-1.5 font-bold"
                            style={{
                              backgroundColor: isDark ? 'rgba(220, 38, 38, 0.15)' : '#fee2e2',
                              borderWidth: '1px',
                              borderColor: isDark ? '#ef4444' : '#fca5a5',
                              color: isDark ? '#f87171' : '#b91c1c'
                            }}
                          >
                            {diariaCarregamento.toFixed(1)}h
                          </Badge>
                        ) : (
                          <span className="text-[9px]" style={{ color: theme.textMuted }}>-</span>
                        )}
                      </TableCell>
                          );
                        }
                        if (coluna.id === "diaria_desc") {
                          return (
                            <TableCell key={coluna.id} className="py-1 px-2 align-middle text-center">
                        {diariaDescarga !== null && diariaDescarga > 0 ? (
                          <Badge 
                            className="text-[9px] h-4 px-1.5 font-bold"
                            style={{
                              backgroundColor: isDark ? 'rgba(220, 38, 38, 0.15)' : '#fee2e2',
                              borderWidth: '1px',
                              borderColor: isDark ? '#ef4444' : '#fca5a5',
                              color: isDark ? '#f87171' : '#b91c1c'
                            }}
                          >
                            {diariaDescarga.toFixed(1)}h
                          </Badge>
                        ) : (
                          <span className="text-[9px]" style={{ color: theme.textMuted }}>-</span>
                        )}
                      </TableCell>
                          );
                        }
                        if (coluna.id === "info") {
                          return (
                            <TableCell key={coluna.id} className="py-1 px-2 align-middle" onClick={(e) => e.stopPropagation()}>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onOrdemClick(ordem)}
                          className="h-6 w-6 p-0 rounded-full hover:bg-blue-100 dark:hover:bg-slate-700"
                        >
                          <Eye className="w-3 h-3" style={{ color: theme.textMuted }} />
                        </Button>
                      </TableCell>
                          );
                        }
                        if (coluna.id === "editar") {
                          return (
                            <TableCell key={coluna.id} className="py-1 px-2 align-middle" onClick={(e) => e.stopPropagation()}>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onEditOrdemCompleta(ordem)}
                          className="h-6 w-6 p-0 rounded-full hover:bg-blue-100 dark:hover:bg-slate-700"
                          title="Editar Ordem Completa"
                        >
                          <Edit className="w-3 h-3" style={{ color: theme.textMuted }} />
                        </Button>
                      </TableCell>
                          );
                        }
                        if (coluna.id === "acoes") {
                          return (
                            <TableCell key={coluna.id} className="py-1 px-2 align-middle text-right" onClick={(e) => e.stopPropagation()}>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-6 w-6 p-0 hover:bg-blue-100 dark:hover:bg-slate-700"
                            >
                              <MoreVertical className="w-3.5 h-3.5" style={{ color: theme.textMuted }} />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent 
                            align="end" 
                            style={{ 
                              backgroundColor: isDark ? '#1e293b' : '#ffffff', 
                              borderColor: isDark ? '#334155' : '#e5e7eb',
                              borderWidth: '1px'
                            }}
                          >
                            <DropdownMenuItem 
                              onClick={() => onAbrirChat(ordem)} 
                              className="text-xs"
                              style={{ color: theme.text }}
                            >
                              <MessageSquare className="w-3.5 h-3.5 mr-2" />
                              Chat
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => onAbrirUpload(ordem)} 
                              className="text-xs"
                              style={{ color: theme.text }}
                            >
                              <Upload className="w-3.5 h-3.5 mr-2" />
                              Documentos
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => onEditOrdemCompleta(ordem)} 
                              className="text-xs"
                              style={{ color: theme.text }}
                            >
                              <Edit className="w-3.5 h-3.5 mr-2" />
                              Editar Ordem
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                          );
                        }
                        return null;
                      })}
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>

      <Dialog open={showColumnConfig} onOpenChange={setShowColumnConfig}>
        <DialogContent
          className="max-w-2xl max-h-[80vh] overflow-y-auto"
          style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}
        >
          <DialogHeader>
            <DialogTitle style={{ color: theme.text }}>Configurar Colunas da Tabela</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div
              className="border rounded-lg p-3"
              style={{
                backgroundColor: isDark ? 'rgba(59, 130, 246, 0.1)' : '#eff6ff',
                borderColor: isDark ? '#3b82f6' : '#bfdbfe'
              }}
            >
              <p className="text-sm" style={{ color: isDark ? '#cbd5e1' : '#374151' }}>
                <strong>Dica:</strong> Arraste as colunas para reorganizá-las. Desmarque para ocultar na tabela.
              </p>
            </div>

            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="colunas">
                {(provided) => (
                  <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
                    {colunas.map((coluna, index) => (
                      <Draggable
                        key={coluna.id}
                        draggableId={coluna.id}
                        index={index}
                        isDragDisabled={coluna.fixed}
                      >
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className={`flex items-center gap-3 p-3 border rounded-lg ${
                              snapshot.isDragging ? 'shadow-lg' : ''
                            } ${coluna.fixed ? 'opacity-60' : ''}`}
                            style={{
                              ...provided.draggableProps.style,
                              backgroundColor: theme.rowBg,
                              borderColor: theme.border
                            }}
                          >
                            <div {...provided.dragHandleProps} className={coluna.fixed ? 'cursor-not-allowed' : 'cursor-grab'}>
                              <GripVertical className="w-4 h-4" style={{ color: theme.textMuted }} />
                            </div>

                            <Checkbox
                              checked={coluna.enabled}
                              onCheckedChange={() => toggleColuna(coluna.id)}
                              disabled={coluna.fixed}
                              style={{ borderColor: theme.border }}
                            />

                            <div className="flex-1">
                              <Label className="text-sm font-medium" style={{ color: theme.text }}>
                                {coluna.label}
                              </Label>
                              {coluna.fixed && (
                                <p className="text-xs" style={{ color: theme.textMuted }}>
                                  Coluna fixa (sempre visível)
                                </p>
                              )}
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={resetColunas}
              style={{
                borderColor: theme.border,
                color: theme.textMuted,
                backgroundColor: 'transparent'
              }}
            >
              Restaurar Padrão
            </Button>
            <Button
              onClick={() => setShowColumnConfig(false)}
              style={{ backgroundColor: theme.primaryBlue, color: 'white' }}
            >
              Concluído
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}