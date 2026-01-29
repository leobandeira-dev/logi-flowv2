import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Plus,
  Search,
  FileText,
  DollarSign,
  Settings,
  CheckCircle,
  XCircle,
  Edit,
  Trash2,
  Download,
  List,
  LayoutGrid,
  ChevronDown
} from "lucide-react";
import DespesaExtraForm from "../components/despesas/DespesaExtraForm";
import TipoDespesaForm from "../components/despesas/TipoDespesaForm";
import VincularCTeModal from "../components/despesas/VincularCTeModal";
import { toast } from "sonner";

export default function DespesasExtras() {
  const [isDark, setIsDark] = useState(false);
  const [despesas, setDespesas] = useState([]);
  const [tiposDespesa, setTiposDespesa] = useState([]);
  const [notasFiscaisMap, setNotasFiscaisMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("todos");
  const [showDespesaForm, setShowDespesaForm] = useState(false);
  const [showTipoForm, setShowTipoForm] = useState(false);
  const [despesaEdit, setDespesaEdit] = useState(null);
  const [tipoEdit, setTipoEdit] = useState(null);
  const [abaAtiva, setAbaAtiva] = useState("despesas");
  const [visualizacao, setVisualizacao] = useState("lista");
  const [showVincularCTe, setShowVincularCTe] = useState(false);
  const [notaFiscalParaVincular, setNotaFiscalParaVincular] = useState(null);
  const [despesaPendente, setDespesaPendente] = useState(null);

  useEffect(() => {
    const checkDarkMode = () => setIsDark(document.documentElement.classList.contains('dark'));
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
      const [despesasData, tiposData] = await Promise.all([
        base44.entities.DespesaExtra.list("-created_date", 200),
        base44.entities.TipoDespesaExtra.list()
      ]);
      setDespesas(despesasData);
      setTiposDespesa(tiposData);
      
      // Carregar notas fiscais vinculadas
      const notasIds = [...new Set(despesasData.map(d => d.nota_fiscal_id).filter(Boolean))];
      if (notasIds.length > 0) {
        const notas = await base44.entities.NotaFiscal.filter({ id: { $in: notasIds } });
        const notasMap = {};
        notas.forEach(nf => {
          notasMap[nf.id] = nf;
        });
        setNotasFiscaisMap(notasMap);
      }
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      toast.error("Erro ao carregar dados");
    } finally {
      setLoading(false);
    }
  };

  const handleSalvarTipo = async (data) => {
    try {
      if (tipoEdit) {
        await base44.entities.TipoDespesaExtra.update(tipoEdit.id, data);
        toast.success("Tipo atualizado!");
      } else {
        await base44.entities.TipoDespesaExtra.create(data);
        toast.success("Tipo criado!");
      }
      setShowTipoForm(false);
      setTipoEdit(null);
      loadData();
    } catch (error) {
      console.error("Erro ao salvar tipo:", error);
      toast.error("Erro ao salvar tipo de despesa");
    }
  };

  const handleAprovar = async (despesa) => {
    try {
      const user = await base44.auth.me();
      await base44.entities.DespesaExtra.update(despesa.id, {
        status: "aprovada",
        aprovado_por: user.id,
        data_aprovacao: new Date().toISOString()
      });
      toast.success("Despesa aprovada!");
      loadData();
    } catch (error) {
      console.error("Erro ao aprovar:", error);
      toast.error("Erro ao aprovar despesa");
    }
  };

  const handleCancelar = async (despesa) => {
    if (!confirm("Cancelar esta despesa?")) return;
    try {
      await base44.entities.DespesaExtra.update(despesa.id, { status: "cancelada" });
      toast.success("Despesa cancelada");
      loadData();
    } catch (error) {
      console.error("Erro ao cancelar:", error);
      toast.error("Erro ao cancelar despesa");
    }
  };

  const handleDragEnd = async (result) => {
    if (!result.destination) return;

    const { draggableId, destination } = result;
    const newStatus = destination.droppableId;
    const despesa = despesas.find(d => d.id === draggableId);

    if (!despesa || despesa.status === newStatus) return;

    // Verificar se está tentando mover para "faturada"
    if (newStatus === "faturada") {
      try {
        // Verificar se a despesa tem nota fiscal vinculada
        if (!despesa.nota_fiscal_id) {
          toast.error("Esta despesa precisa estar vinculada a uma Nota Fiscal");
          return;
        }

        // Buscar a nota fiscal para verificar se tem CT-e vinculado
        const notaFiscal = await base44.entities.NotaFiscal.get(despesa.nota_fiscal_id);
        
        if (!notaFiscal.cte_id) {
          // Abrir modal para vincular CT-e
          setNotaFiscalParaVincular(notaFiscal);
          setDespesaPendente({ despesa, newStatus });
          setShowVincularCTe(true);
          return;
        }
      } catch (error) {
        console.error("Erro ao verificar vinculação:", error);
        toast.error("Erro ao verificar vinculação com CT-e");
        return;
      }
    }

    try {
      const user = await base44.auth.me();
      const updateData = { status: newStatus };

      if (newStatus === "aprovada") {
        updateData.aprovado_por = user.id;
        updateData.data_aprovacao = new Date().toISOString();
      }

      await base44.entities.DespesaExtra.update(despesa.id, updateData);
      toast.success(`Despesa movida para ${newStatus}`);
      loadData();
    } catch (error) {
      console.error("Erro ao atualizar status:", error);
      toast.error("Erro ao atualizar status");
    }
  };

  const handleVincularCTeSuccess = async () => {
    setShowVincularCTe(false);
    
    if (despesaPendente) {
      try {
        const user = await base44.auth.me();
        await base44.entities.DespesaExtra.update(despesaPendente.despesa.id, {
          status: despesaPendente.newStatus
        });
        toast.success("Despesa faturada com sucesso!");
        loadData();
      } catch (error) {
        console.error("Erro ao atualizar despesa:", error);
        toast.error("Erro ao faturar despesa");
      }
    }
    
    setDespesaPendente(null);
    setNotaFiscalParaVincular(null);
  };

  const handleExcluirTipo = async (tipo) => {
    if (!confirm(`Desativar tipo "${tipo.nome}"?`)) return;
    try {
      await base44.entities.TipoDespesaExtra.update(tipo.id, { ativo: false });
      toast.success("Tipo desativado");
      loadData();
    } catch (error) {
      console.error("Erro ao desativar:", error);
      toast.error("Erro ao desativar tipo");
    }
  };

  const despesasFiltradas = despesas.filter(d => {
    const matchStatus = filtroStatus === "todos" || d.status === filtroStatus;
    const matchSearch = !searchTerm || 
      d.numero_despesa?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.tipo_despesa_nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.descricao?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchStatus && matchSearch;
  });

  const despesasAgrupadas = {
    pendente: despesasFiltradas.filter(d => d.status === "pendente"),
    aprovada: despesasFiltradas.filter(d => d.status === "aprovada"),
    faturada: despesasFiltradas.filter(d => d.status === "faturada"),
    cancelada: despesasFiltradas.filter(d => d.status === "cancelada")
  };

  const statusColors = {
    pendente: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
    aprovada: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
    faturada: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
    cancelada: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
  };

  const statusLabels = {
    pendente: "Pendente",
    aprovada: "Aprovada",
    faturada: "Faturada",
    cancelada: "Cancelada"
  };

  const getStatusColor = (status, theme) => {
    const colors = {
      pendente: { bg: '#fbbf24', text: '#ffffff' },
      aprovada: { bg: '#10b981', text: '#ffffff' },
      faturada: { bg: '#3b82f6', text: '#ffffff' },
      cancelada: { bg: '#ef4444', text: '#ffffff' }
    };
    return colors[status] || { bg: theme.textMuted, text: '#ffffff' };
  };

  const theme = {
    bg: isDark ? '#0f172a' : '#f9fafb',
    cardBg: isDark ? '#1e293b' : '#ffffff',
    cardBorder: isDark ? '#334155' : '#e5e7eb',
    text: isDark ? '#f1f5f9' : '#111827',
    textMuted: isDark ? '#94a3b8' : '#6b7280'
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: theme.bg }}>
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4" style={{ backgroundColor: theme.bg }}>
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold" style={{ color: theme.text }}>
              Despesas Extras
            </h1>
            <p className="text-sm mt-1" style={{ color: theme.textMuted }}>
              Gestão de despesas apropriadas às notas fiscais
            </p>
          </div>
        </div>

        <Tabs value={abaAtiva} onValueChange={setAbaAtiva}>
          <TabsList className="grid w-full max-w-md grid-cols-2 mb-6">
            <TabsTrigger value="despesas">
              <DollarSign className="w-4 h-4 mr-2" />
              Despesas
            </TabsTrigger>
            <TabsTrigger value="tipos">
              <Settings className="w-4 h-4 mr-2" />
              Tipos de Despesa
            </TabsTrigger>
          </TabsList>

          {/* Aba Despesas */}
          <TabsContent value="despesas">
            <Card style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle style={{ color: theme.text }}>Registro de Despesas</CardTitle>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center border rounded-lg" style={{ borderColor: theme.cardBorder }}>
                      <Button
                        variant={visualizacao === "lista" ? "default" : "ghost"}
                        size="sm"
                        onClick={() => setVisualizacao("lista")}
                        className="rounded-r-none"
                      >
                        <List className="w-4 h-4" />
                      </Button>
                      <Button
                        variant={visualizacao === "kanban" ? "default" : "ghost"}
                        size="sm"
                        onClick={() => setVisualizacao("kanban")}
                        className="rounded-l-none"
                      >
                        <LayoutGrid className="w-4 h-4" />
                      </Button>
                    </div>
                    <Button
                      onClick={() => {
                        setDespesaEdit(null);
                        setShowDespesaForm(true);
                      }}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Nova Despesa
                    </Button>
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: theme.textMuted }} />
                    <Input
                      placeholder="Buscar por número, tipo ou descrição..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <select
                    value={filtroStatus}
                    onChange={(e) => setFiltroStatus(e.target.value)}
                    className="px-3 py-2 border rounded-lg text-sm"
                    style={{
                      backgroundColor: theme.cardBg,
                      borderColor: theme.cardBorder,
                      color: theme.text
                    }}
                  >
                    <option value="todos">Todos Status</option>
                    <option value="pendente">Pendente</option>
                    <option value="aprovada">Aprovada</option>
                    <option value="faturada">Faturada</option>
                    <option value="cancelada">Cancelada</option>
                  </select>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {visualizacao === "lista" ? (
                  <DragDropContext onDragEnd={handleDragEnd}>
                    <div>
                    {/* Header da Tabela - Estilo Monday.com */}
                    <div 
                      className="grid grid-cols-12 gap-3 px-6 py-3 border-b sticky top-0 z-10"
                      style={{
                        backgroundColor: isDark ? '#1a2332' : '#f7f8fa',
                        borderColor: theme.cardBorder
                      }}
                    >
                      <div className="col-span-1 flex items-center">
                        <span className="text-xs font-bold uppercase tracking-wider" style={{ color: theme.textMuted }}>
                          Nº Despesa
                        </span>
                      </div>
                      <div className="col-span-2 flex items-center">
                        <span className="text-xs font-bold uppercase tracking-wider" style={{ color: theme.textMuted }}>
                          Tipo
                        </span>
                      </div>
                      <div className="col-span-3 flex items-center">
                        <span className="text-xs font-bold uppercase tracking-wider" style={{ color: theme.textMuted }}>
                          Nota Fiscal
                        </span>
                      </div>
                      <div className="col-span-2 flex items-center">
                        <span className="text-xs font-bold uppercase tracking-wider" style={{ color: theme.textMuted }}>
                          Descrição
                        </span>
                      </div>
                      <div className="col-span-1 flex items-center justify-center">
                        <span className="text-xs font-bold uppercase tracking-wider" style={{ color: theme.textMuted }}>
                          Status
                        </span>
                      </div>
                      <div className="col-span-2 flex items-center justify-end">
                        <span className="text-xs font-bold uppercase tracking-wider" style={{ color: theme.textMuted }}>
                          Valor
                        </span>
                      </div>
                      <div className="col-span-1 flex items-center justify-center">
                        <span className="text-xs font-bold uppercase tracking-wider" style={{ color: theme.textMuted }}>
                          Ações
                        </span>
                      </div>
                    </div>

                    {/* Agrupamento por Status - Estilo Monday.com */}
                    {Object.entries(despesasAgrupadas).map(([status, despesasDoStatus]) => 
                      despesasDoStatus.length > 0 && (
                        <Droppable key={status} droppableId={status}>
                          {(provided) => (
                            <div 
                              ref={provided.innerRef}
                              {...provided.droppableProps}
                              className="mb-1"
                            >
                          {/* Header do Grupo */}
                          <div 
                            className="px-6 py-3 flex items-center gap-3 sticky top-[49px] z-[9]"
                            style={{
                              backgroundColor: isDark ? '#1a2332' : '#f7f8fa',
                              borderBottom: `2px solid ${getStatusColor(status, theme).bg}`
                            }}
                          >
                            <div 
                              className="w-2 h-2 rounded-full"
                              style={{ backgroundColor: getStatusColor(status, theme).bg }}
                            />
                            <span className="text-sm font-bold uppercase tracking-wide" style={{ color: theme.text }}>
                              {statusLabels[status]}
                            </span>
                            <Badge 
                              className="text-xs font-bold px-2 py-0.5 rounded-full"
                              style={{
                                backgroundColor: getStatusColor(status, theme).bg,
                                color: getStatusColor(status, theme).text
                              }}
                            >
                              {despesasDoStatus.length}
                            </Badge>
                          </div>

                          {/* Linhas do Grupo */}
                          {despesasDoStatus.map((despesa, index) => {
                            const statusColor = getStatusColor(despesa.status, theme);
                            const notaFiscal = notasFiscaisMap[despesa.nota_fiscal_id];
                            return (
                              <Draggable key={despesa.id} draggableId={despesa.id} index={index}>
                                {(provided, snapshot) => (
                                  <div
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                    className="grid grid-cols-12 gap-3 px-6 py-4 border-b group transition-all duration-200"
                                    style={{
                                      ...provided.draggableProps.style,
                                      backgroundColor: snapshot.isDragging 
                                        ? (isDark ? '#334155' : '#e2e8f0')
                                        : (index % 2 === 0 ? theme.cardBg : (isDark ? '#151d2b' : '#fafbfc')),
                                      borderColor: isDark ? '#2d3748' : '#e2e8f0',
                                      cursor: snapshot.isDragging ? 'grabbing' : 'grab',
                                      opacity: snapshot.isDragging ? 0.9 : 1
                                    }}
                                    onMouseEnter={(e) => {
                                      if (!snapshot.isDragging) {
                                        e.currentTarget.style.backgroundColor = isDark ? '#1e293b' : '#f1f5f9';
                                      }
                                    }}
                                    onMouseLeave={(e) => {
                                      if (!snapshot.isDragging) {
                                        e.currentTarget.style.backgroundColor = index % 2 === 0 ? theme.cardBg : (isDark ? '#151d2b' : '#fafbfc');
                                      }
                                    }}
                                  >
                                <div className="col-span-1 flex items-center">
                                  <span className="font-mono text-sm font-bold" style={{ color: theme.text }}>
                                    {despesa.numero_despesa}
                                  </span>
                                </div>

                                <div className="col-span-2 flex items-center gap-2">
                                  <div 
                                    className="w-1 h-10 rounded-full flex-shrink-0"
                                    style={{ backgroundColor: statusColor.bg }}
                                  />
                                  <span className="text-sm font-medium" style={{ color: theme.text }}>
                                    {despesa.tipo_despesa_nome}
                                  </span>
                                </div>

                                <div className="col-span-3 flex items-center">
                                  {despesa.nota_fiscal_id && notaFiscal ? (
                                    <div className="flex flex-col gap-0.5">
                                      <span className="text-sm font-medium" style={{ color: theme.text }}>
                                        NF {notaFiscal.numero_nota}
                                      </span>
                                      <span className="text-xs truncate max-w-[220px]" style={{ color: theme.textMuted }}>
                                        {notaFiscal.emitente_razao_social}
                                      </span>
                                    </div>
                                  ) : (
                                    <span className="text-sm" style={{ color: theme.textMuted }}>
                                      -
                                    </span>
                                  )}
                                </div>

                                <div className="col-span-2 flex items-center">
                                  {despesa.descricao ? (
                                    <span className="text-sm truncate" style={{ color: theme.textMuted }}>
                                      {despesa.descricao}
                                    </span>
                                  ) : (
                                    <span className="text-sm" style={{ color: theme.textMuted }}>-</span>
                                  )}
                                </div>

                                <div className="col-span-1 flex items-center justify-center">
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <button
                                        className="flex items-center gap-1 px-3 py-1 rounded-full border-0 text-xs font-semibold transition-all hover:opacity-80 cursor-pointer"
                                        style={{
                                          backgroundColor: statusColor.bg,
                                          color: statusColor.text
                                        }}
                                      >
                                        {statusLabels[despesa.status]}
                                        <ChevronDown className="w-3 h-3" />
                                      </button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="center">
                                      {Object.entries(statusLabels).map(([key, label]) => {
                                        const itemColor = getStatusColor(key, theme);
                                        return (
                                          <DropdownMenuItem
                                            key={key}
                                            onClick={async () => {
                                              if (key === despesa.status) return;
                                              
                                              // Verificar se está tentando mover para "faturada"
                                              if (key === "faturada") {
                                                if (!despesa.nota_fiscal_id) {
                                                  toast.error("Esta despesa precisa estar vinculada a uma Nota Fiscal");
                                                  return;
                                                }
                                                const notaFiscal = await base44.entities.NotaFiscal.get(despesa.nota_fiscal_id);
                                                if (!notaFiscal.cte_id) {
                                                  setNotaFiscalParaVincular(notaFiscal);
                                                  setDespesaPendente({ despesa, newStatus: key });
                                                  setShowVincularCTe(true);
                                                  return;
                                                }
                                              }
                                              
                                              const user = await base44.auth.me();
                                              const updateData = { status: key };
                                              if (key === "aprovada") {
                                                updateData.aprovado_por = user.id;
                                                updateData.data_aprovacao = new Date().toISOString();
                                              }
                                              await base44.entities.DespesaExtra.update(despesa.id, updateData);
                                              toast.success(`Status atualizado para ${label}`);
                                              loadData();
                                            }}
                                            className="flex items-center gap-2"
                                          >
                                            <div 
                                              className="w-2 h-2 rounded-full"
                                              style={{ backgroundColor: itemColor.bg }}
                                            />
                                            {label}
                                          </DropdownMenuItem>
                                        );
                                      })}
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </div>

                                <div className="col-span-2 flex items-center justify-end">
                                  <div className="text-right">
                                    <p className="font-bold text-base" style={{ color: theme.text }}>
                                      R$ {(despesa.valor_total || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                    </p>
                                    <p className="text-xs" style={{ color: theme.textMuted }}>
                                      {despesa.quantidade} {despesa.unidade_cobranca}
                                    </p>
                                  </div>
                                </div>

                                <div className="col-span-1 flex items-center justify-center">
                                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                    {despesa.status === "pendente" && (
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleAprovar(despesa)}
                                        className="h-8 w-8 p-0 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg"
                                        title="Aprovar"
                                      >
                                        <CheckCircle className="w-4 h-4 text-green-600" />
                                      </Button>
                                    )}
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => {
                                        setDespesaEdit(despesa);
                                        setShowDespesaForm(true);
                                      }}
                                      className="h-8 w-8 p-0 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg"
                                      title={despesa.status === "aprovada" || despesa.status === "faturada" ? "Visualizar" : "Editar"}
                                    >
                                      <Edit className="w-4 h-4 text-blue-600" />
                                    </Button>
                                    {despesa.status === "pendente" && (
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleCancelar(despesa)}
                                        className="h-8 w-8 p-0 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                                        title="Cancelar"
                                      >
                                        <XCircle className="w-4 h-4 text-red-600" />
                                      </Button>
                                    )}
                                  </div>
                                </div>
                              </div>
                            )}
                          </Draggable>
                        );
                      })}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              )
            )}

                    {despesasFiltradas.length === 0 && (
                      <div 
                        className="flex flex-col items-center justify-center py-16"
                        style={{ color: theme.textMuted }}
                      >
                        <DollarSign className="w-12 h-12 opacity-20 mb-3" />
                        <p className="text-sm">Nenhuma despesa encontrada</p>
                      </div>
                    )}
                  </div>
                  </DragDropContext>
                ) : (
                  <DragDropContext onDragEnd={handleDragEnd}>
                    <div className="grid grid-cols-4 gap-4">
                      {Object.entries(despesasAgrupadas).map(([status, despesasDoStatus]) => {
                        const statusColor = getStatusColor(status, theme);
                        return (
                          <Droppable key={status} droppableId={status}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.droppableProps}
                                className="rounded-lg p-4 transition-all duration-200"
                                style={{
                                  backgroundColor: snapshot.isDraggingOver ? (isDark ? '#1e293b' : '#f1f5f9') : (isDark ? '#151d2b' : '#fafbfc'),
                                  border: `2px solid ${snapshot.isDraggingOver ? statusColor.bg : (isDark ? '#2d3748' : '#e2e8f0')}`,
                                  minHeight: '500px'
                                }}
                              >
                                <div className="flex items-center justify-between mb-4 pb-3 border-b" style={{ borderColor: theme.cardBorder }}>
                                  <div className="flex items-center gap-2">
                                    <div 
                                      className="w-3 h-3 rounded-full"
                                      style={{ backgroundColor: statusColor.bg }}
                                    />
                                    <span className="text-sm font-bold uppercase tracking-wide" style={{ color: theme.text }}>
                                      {statusLabels[status]}
                                    </span>
                                  </div>
                                  <Badge 
                                    className="text-xs font-bold px-2.5 py-0.5 rounded-full"
                                    style={{
                                      backgroundColor: statusColor.bg,
                                      color: statusColor.text
                                    }}
                                  >
                                    {despesasDoStatus.length}
                                  </Badge>
                                </div>
                                <div className="space-y-3">
                                  {despesasDoStatus.map((despesa, index) => {
                                    const notaFiscal = notasFiscaisMap[despesa.nota_fiscal_id];
                                    return (
                                      <Draggable key={despesa.id} draggableId={despesa.id} index={index}>
                                        {(provided, snapshot) => (
                                          <div
                                            ref={provided.innerRef}
                                            {...provided.draggableProps}
                                            {...provided.dragHandleProps}
                                            className="rounded-lg shadow-sm hover:shadow-md transition-all duration-200 group overflow-hidden"
                                            style={{
                                              ...provided.draggableProps.style,
                                              backgroundColor: snapshot.isDragging ? (isDark ? '#334155' : '#ffffff') : theme.cardBg,
                                              border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
                                              cursor: 'grab'
                                            }}
                                          >
                                            <div 
                                              className="h-1 w-full"
                                              style={{ backgroundColor: statusColor.bg }}
                                            />
                                            <div className="p-3">
                                              <div className="flex items-start justify-between mb-2">
                                                <span className="font-mono text-xs font-bold" style={{ color: theme.text }}>
                                                  {despesa.numero_despesa}
                                                </span>
                                                <Button
                                                  variant="ghost"
                                                  size="sm"
                                                  onClick={(e) => {
                                                    e.stopPropagation();
                                                    setDespesaEdit(despesa);
                                                    setShowDespesaForm(true);
                                                  }}
                                                  className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-blue-50 dark:hover:bg-blue-900/20"
                                                >
                                                  <Edit className="w-3 h-3 text-blue-600" />
                                                </Button>
                                              </div>
                                              <p className="text-sm font-semibold mb-2 leading-tight" style={{ color: theme.text }}>
                                                {despesa.tipo_despesa_nome}
                                              </p>
                                              {despesa.nota_fiscal_id && notaFiscal && (
                                                <div className="mb-2 p-2 rounded" style={{ backgroundColor: isDark ? '#1e293b' : '#f1f5f9' }}>
                                                  <p className="text-xs font-medium" style={{ color: theme.text }}>
                                                    NF {notaFiscal.numero_nota}
                                                  </p>
                                                  <p className="text-xs truncate" style={{ color: theme.textMuted }}>
                                                    {notaFiscal.emitente_razao_social}
                                                  </p>
                                                </div>
                                              )}
                                              {despesa.descricao && (
                                                <p className="text-xs mb-3 line-clamp-2 leading-relaxed" style={{ color: theme.textMuted }}>
                                                  {despesa.descricao}
                                                </p>
                                              )}
                                              <div className="flex items-center justify-between pt-3 border-t" style={{ borderColor: theme.cardBorder }}>
                                                <span className="text-xs font-medium" style={{ color: theme.textMuted }}>
                                                  {despesa.quantidade} {despesa.unidade_cobranca}
                                                </span>
                                                <span className="font-bold text-base" style={{ color: theme.text }}>
                                                  R$ {(despesa.valor_total || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                                </span>
                                              </div>
                                            </div>
                                          </div>
                                        )}
                                      </Draggable>
                                    );
                                  })}
                                  {provided.placeholder}
                                </div>
                              </div>
                            )}
                          </Droppable>
                        );
                      })}
                    </div>
                  </DragDropContext>
                )}

                {despesasFiltradas.length === 0 && (
                  <div className="text-center py-12">
                    <DollarSign className="w-16 h-16 mx-auto mb-4 opacity-20" style={{ color: theme.textMuted }} />
                    <p className="text-sm" style={{ color: theme.textMuted }}>
                      {searchTerm ? "Nenhuma despesa encontrada" : "Nenhuma despesa registrada"}
                    </p>
                  </div>
                )}

                <div className="overflow-x-auto hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b" style={{ borderColor: theme.cardBorder }}>
                        <th className="text-left p-2 text-sm font-semibold" style={{ color: theme.text }}>Nº Despesa</th>
                        <th className="text-left p-2 text-sm font-semibold" style={{ color: theme.text }}>Tipo</th>
                        <th className="text-left p-2 text-sm font-semibold" style={{ color: theme.text }}>NF</th>
                        <th className="text-left p-2 text-sm font-semibold" style={{ color: theme.text }}>Descrição</th>
                        <th className="text-right p-2 text-sm font-semibold" style={{ color: theme.text }}>Qtd</th>
                        <th className="text-right p-2 text-sm font-semibold" style={{ color: theme.text }}>Valor</th>
                        <th className="text-center p-2 text-sm font-semibold" style={{ color: theme.text }}>Status</th>
                        <th className="text-right p-2 text-sm font-semibold" style={{ color: theme.text }}>Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {despesasFiltradas.map((despesa) => (
                        <tr key={despesa.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800/50" style={{ borderColor: theme.cardBorder }}>
                          <td className="p-2">
                            <span className="font-mono text-sm font-bold" style={{ color: theme.text }}>
                              {despesa.numero_despesa}
                            </span>
                          </td>
                          <td className="p-2">
                            <span className="text-sm" style={{ color: theme.text }}>
                              {despesa.tipo_despesa_nome}
                            </span>
                          </td>
                          <td className="p-2">
                            {despesa.nota_fiscal_id ? (
                              notasFiscaisMap[despesa.nota_fiscal_id] ? (
                                <div className="flex flex-col gap-0.5">
                                  <span className="text-sm font-medium" style={{ color: theme.text }}>
                                    NF {notasFiscaisMap[despesa.nota_fiscal_id].numero_nota}
                                  </span>
                                  <span className="text-xs" style={{ color: theme.textMuted }}>
                                    {notasFiscaisMap[despesa.nota_fiscal_id].emitente_razao_social}
                                  </span>
                                </div>
                              ) : (
                                <span className="text-xs" style={{ color: theme.textMuted }}>
                                  NF vinculada
                                </span>
                              )
                            ) : (
                              <span className="text-sm" style={{ color: theme.textMuted }}>
                                -
                              </span>
                            )}
                          </td>
                          <td className="p-2">
                            <span className="text-xs truncate max-w-xs block" style={{ color: theme.textMuted }}>
                              {despesa.descricao || '-'}
                            </span>
                          </td>
                          <td className="p-2 text-right">
                            <span className="text-sm" style={{ color: theme.text }}>
                              {despesa.quantidade} {despesa.unidade_cobranca}
                            </span>
                          </td>
                          <td className="p-2 text-right">
                            <span className="font-bold text-sm" style={{ color: theme.text }}>
                              R$ {(despesa.valor_total || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </span>
                          </td>
                          <td className="p-2 text-center">
                            <Badge className={statusColors[despesa.status]}>
                              {despesa.status}
                            </Badge>
                          </td>
                          <td className="p-2">
                            <div className="flex items-center justify-end gap-1">
                              {despesa.status === "pendente" && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleAprovar(despesa)}
                                  className="h-7 w-7 p-0"
                                  title="Aprovar"
                                >
                                  <CheckCircle className="w-4 h-4 text-green-600" />
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setDespesaEdit(despesa);
                                  setShowDespesaForm(true);
                                }}
                                className="h-7 w-7 p-0"
                                title="Editar"
                              >
                                <Edit className="w-4 h-4 text-blue-600" />
                              </Button>
                              {despesa.status === "pendente" && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleCancelar(despesa)}
                                  className="h-7 w-7 p-0"
                                  title="Cancelar"
                                >
                                  <XCircle className="w-4 h-4 text-red-600" />
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Resumo */}
                {despesas.length > 0 && (
                  <div className="mt-6 grid grid-cols-4 gap-4">
                    <div className="p-4 border rounded-lg" style={{ borderColor: theme.cardBorder }}>
                      <p className="text-xs mb-1" style={{ color: theme.textMuted }}>Total Despesas</p>
                      <p className="text-2xl font-bold" style={{ color: theme.text }}>
                        {despesas.length}
                      </p>
                    </div>
                    <div className="p-4 border rounded-lg" style={{ borderColor: theme.cardBorder }}>
                      <p className="text-xs mb-1" style={{ color: theme.textMuted }}>Valor Total</p>
                      <p className="text-2xl font-bold text-blue-600">
                        R$ {despesas.reduce((sum, d) => sum + (d.valor_total || 0), 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                    <div className="p-4 border rounded-lg" style={{ borderColor: theme.cardBorder }}>
                      <p className="text-xs mb-1" style={{ color: theme.textMuted }}>Pendentes</p>
                      <p className="text-2xl font-bold text-yellow-600">
                        {despesas.filter(d => d.status === "pendente").length}
                      </p>
                    </div>
                    <div className="p-4 border rounded-lg" style={{ borderColor: theme.cardBorder }}>
                      <p className="text-xs mb-1" style={{ color: theme.textMuted }}>Aprovadas</p>
                      <p className="text-2xl font-bold text-green-600">
                        {despesas.filter(d => d.status === "aprovada").length}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Aba Tipos de Despesa */}
          <TabsContent value="tipos">
            <Card style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle style={{ color: theme.text }}>Tipos de Despesa</CardTitle>
                  <Button
                    onClick={() => {
                      setTipoEdit(null);
                      setShowTipoForm(true);
                    }}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Novo Tipo
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {/* Header da Tabela - Estilo Monday.com */}
                <div 
                  className="grid grid-cols-12 gap-3 px-6 py-3 border-b sticky top-0 z-10"
                  style={{
                    backgroundColor: isDark ? '#1a2332' : '#f7f8fa',
                    borderColor: theme.cardBorder
                  }}
                >
                  <div className="col-span-3 flex items-center">
                    <span className="text-xs font-bold uppercase tracking-wider" style={{ color: theme.textMuted }}>
                      Nome
                    </span>
                  </div>
                  <div className="col-span-1 flex items-center">
                    <span className="text-xs font-bold uppercase tracking-wider" style={{ color: theme.textMuted }}>
                      Código
                    </span>
                  </div>
                  <div className="col-span-3 flex items-center">
                    <span className="text-xs font-bold uppercase tracking-wider" style={{ color: theme.textMuted }}>
                      Descrição
                    </span>
                  </div>
                  <div className="col-span-2 flex items-center justify-end">
                    <span className="text-xs font-bold uppercase tracking-wider" style={{ color: theme.textMuted }}>
                      Valor Padrão
                    </span>
                  </div>
                  <div className="col-span-2 flex items-center justify-center">
                    <span className="text-xs font-bold uppercase tracking-wider" style={{ color: theme.textMuted }}>
                      Unidade
                    </span>
                  </div>
                  <div className="col-span-1 flex items-center justify-center">
                    <span className="text-xs font-bold uppercase tracking-wider" style={{ color: theme.textMuted }}>
                      Ações
                    </span>
                  </div>
                </div>

                {/* Linhas de Dados - Estilo Monday.com */}
                {tiposDespesa.map((tipo, index) => (
                  <div
                    key={tipo.id}
                    className="grid grid-cols-12 gap-3 px-6 py-4 border-b group transition-all duration-200"
                    style={{
                      backgroundColor: index % 2 === 0 ? theme.cardBg : (isDark ? '#151d2b' : '#fafbfc'),
                      borderColor: isDark ? '#2d3748' : '#e2e8f0',
                      opacity: tipo.ativo ? 1 : 0.6
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = isDark ? '#1e293b' : '#f1f5f9';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = index % 2 === 0 ? theme.cardBg : (isDark ? '#151d2b' : '#fafbfc');
                    }}
                  >
                    <div className="col-span-3 flex items-center gap-2">
                      <div 
                        className="w-1 h-10 rounded-full flex-shrink-0"
                        style={{ backgroundColor: tipo.ativo ? '#10b981' : '#6b7280' }}
                      />
                      <div className="flex flex-col justify-center">
                        <span className="text-sm font-bold leading-tight" style={{ color: theme.text }}>
                          {tipo.nome}
                        </span>
                        {!tipo.ativo && (
                          <Badge className="bg-gray-500 text-white text-xs w-fit mt-1">
                            Inativo
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="col-span-1 flex items-center">
                      {tipo.codigo ? (
                        <Badge variant="outline" className="text-xs">
                          {tipo.codigo}
                        </Badge>
                      ) : (
                        <span className="text-sm" style={{ color: theme.textMuted }}>-</span>
                      )}
                    </div>

                    <div className="col-span-3 flex items-center">
                      {tipo.descricao ? (
                        <span className="text-sm truncate" style={{ color: theme.textMuted }}>
                          {tipo.descricao}
                        </span>
                      ) : (
                        <span className="text-sm" style={{ color: theme.textMuted }}>-</span>
                      )}
                    </div>

                    <div className="col-span-2 flex items-center justify-end">
                      <span className="font-bold text-base" style={{ color: theme.text }}>
                        R$ {(tipo.valor_padrao || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    </div>

                    <div className="col-span-2 flex items-center justify-center">
                      <Badge 
                        className="text-xs font-medium px-3 py-1"
                        style={{
                          backgroundColor: isDark ? '#334155' : '#e2e8f0',
                          color: theme.text
                        }}
                      >
                        {tipo.unidade_cobranca}
                      </Badge>
                    </div>

                    <div className="col-span-1 flex items-center justify-center">
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setTipoEdit(tipo);
                            setShowTipoForm(true);
                          }}
                          className="h-8 w-8 p-0 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg"
                          title="Editar"
                        >
                          <Edit className="w-4 h-4 text-blue-600" />
                        </Button>
                        {tipo.ativo && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleExcluirTipo(tipo)}
                            className="h-8 w-8 p-0 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                            title="Desativar"
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {tiposDespesa.length === 0 && (
                  <div 
                    className="flex flex-col items-center justify-center py-16"
                    style={{ color: theme.textMuted }}
                  >
                    <Settings className="w-12 h-12 opacity-20 mb-3" />
                    <p className="text-sm">Nenhum tipo de despesa cadastrado</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {showDespesaForm && (
        <DespesaExtraForm
          open={showDespesaForm}
          onClose={() => {
            setShowDespesaForm(false);
            setDespesaEdit(null);
          }}
          despesa={despesaEdit}
          onSuccess={() => {
            setShowDespesaForm(false);
            setDespesaEdit(null);
            loadData();
          }}
        />
      )}

      {showTipoForm && (
        <TipoDespesaForm
          open={showTipoForm}
          onClose={() => {
            setShowTipoForm(false);
            setTipoEdit(null);
          }}
          tipo={tipoEdit}
          onSuccess={handleSalvarTipo}
        />
      )}

      {showVincularCTe && notaFiscalParaVincular && (
        <VincularCTeModal
          open={showVincularCTe}
          onClose={() => {
            setShowVincularCTe(false);
            setNotaFiscalParaVincular(null);
            setDespesaPendente(null);
          }}
          notaFiscal={notaFiscalParaVincular}
          onSuccess={handleVincularCTeSuccess}
        />
      )}
    </div>
  );
}