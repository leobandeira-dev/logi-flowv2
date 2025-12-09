import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";
import {
  Users,
  Search,
  LayoutList,
  LayoutGrid,
  Calculator,
  AlertCircle,
  Mail,
  Phone,
  Building2,
  DollarSign,
  Edit2,
  Plus,
  Trash2,
  Settings,
  X,
  Save,
  Calendar,
  MessageSquare,
  GripVertical,
  Tag,
  Download,
  Filter,
  ArrowUpDown,
  ChevronDown,
  CheckSquare,
  MoreHorizontal
} from "lucide-react";
import { createPageUrl } from "@/utils";
import { toast } from "sonner";
import { format } from "date-fns";
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

export default function CRM() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isDark, setIsDark] = useState(false);
  const [viewMode, setViewMode] = useState("kanban");
  const [searchTerm, setSearchTerm] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("todos");
  const [showConfigEtapas, setShowConfigEtapas] = useState(false);
  const [leadDetalhes, setLeadDetalhes] = useState(null);
  const [mostrarFiltrosAvancados, setMostrarFiltrosAvancados] = useState(false);
  const [filtroOrigem, setFiltroOrigem] = useState("todos");
  const [filtroDataDe, setFiltroDataDe] = useState("");
  const [filtroDataAte, setFiltroDataAte] = useState("");
  const [sortField, setSortField] = useState("created_date");
  const [sortDirection, setSortDirection] = useState("desc");
  const queryClient = useQueryClient();

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
    loadUser();
    inicializarEtapasPadrao();
  }, []);

  const loadUser = async () => {
    setLoading(true);
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
    } catch (error) {
      console.error("Erro ao carregar usuário:", error);
    } finally {
      setLoading(false);
    }
  };

  const inicializarEtapasPadrao = async () => {
    try {
      const etapasExistentes = await base44.entities.EtapaFunil.list();
      
      if (etapasExistentes.length === 0) {
        const etapasPadrao = [
          { nome: "Contato Inicial", cor: "#3b82f6", ordem: 1, editavel: true },
          { nome: "Proposta Enviada", cor: "#8b5cf6", ordem: 2, editavel: true },
          { nome: "Em Negociação", cor: "#eab308", ordem: 3, editavel: true },
          { nome: "Ganho ✓", cor: "#22c55e", ordem: 4, editavel: true },
          { nome: "Perdido", cor: "#ef4444", ordem: 5, editavel: true }
        ];

        for (const etapa of etapasPadrao) {
          await base44.entities.EtapaFunil.create(etapa);
        }
      }
    } catch (error) {
      console.log("Erro ao inicializar etapas (pode ser normal):", error.message);
    }
  };

  const { data: leads = [], isLoading: loadingLeads } = useQuery({
    queryKey: ['leads'],
    queryFn: () => base44.entities.Lead.list("-created_date"),
    initialData: [],
  });

  const { data: etapas = [] } = useQuery({
    queryKey: ['etapas-funil'],
    queryFn: () => base44.entities.EtapaFunil.filter({ ativo: true }, "ordem"),
    initialData: [],
  });

  const { data: usuarios = [] } = useQuery({
    queryKey: ['usuarios'],
    queryFn: () => base44.entities.User.list(),
    initialData: [],
  });

  const handleMudarStatus = async (leadId, novoStatus) => {
    try {
      const updateData = { status_funil: novoStatus };
      
      const etapa = etapas.find(e => e.id === novoStatus);
      if (etapa?.nome.toLowerCase().includes("ganho") || etapa?.nome.toLowerCase().includes("perdido")) {
        updateData.data_fechamento = new Date().toISOString();
      }

      await base44.entities.Lead.update(leadId, updateData);
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      toast.success("Status atualizado!");
    } catch (error) {
      console.error("Erro ao atualizar status:", error);
      toast.error("Erro ao atualizar status");
    }
  };

  const handleGerarProposta = (lead) => {
    const url = createPageUrl("Precificacao") + `?lead_id=${lead.id}`;
    window.location.href = url;
  };

  const leadsFiltrados = leads.filter(lead => {
    const matchSearch = !searchTerm || 
      lead.razao_social?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.cnpj?.includes(searchTerm) ||
      lead.responsavel_nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.responsavel_email?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchStatus = filtroStatus === "todos" || lead.status_funil === filtroStatus;
    const matchOrigem = filtroOrigem === "todos" || lead.origem === filtroOrigem;
    
    let matchData = true;
    if (filtroDataDe) {
      const dataLead = new Date(lead.created_date);
      const dataDe = new Date(filtroDataDe);
      matchData = dataLead >= dataDe;
    }
    if (filtroDataAte && matchData) {
      const dataLead = new Date(lead.created_date);
      const dataAte = new Date(filtroDataAte);
      dataAte.setHours(23, 59, 59, 999);
      matchData = dataLead <= dataAte;
    }

    return matchSearch && matchStatus && matchOrigem && matchData;
  }).sort((a, b) => {
    let aVal = a[sortField];
    let bVal = b[sortField];
    
    if (sortField === "valor_total_proposta") {
      aVal = aVal || 0;
      bVal = bVal || 0;
    }
    
    if (sortField === "created_date" || sortField === "data_proposta") {
      aVal = aVal ? new Date(aVal).getTime() : 0;
      bVal = bVal ? new Date(bVal).getTime() : 0;
    }
    
    if (sortDirection === "asc") {
      return aVal > bVal ? 1 : -1;
    } else {
      return aVal < bVal ? 1 : -1;
    }
  });

  const todasEtapas = [
    { id: "lead", nome: "Lead", cor: "#6b7280", editavel: false, ordem: 0 },
    ...etapas
  ];

  const leadsPorStatus = {};
  todasEtapas.forEach(etapa => {
    leadsPorStatus[etapa.id] = leadsFiltrados.filter(l => l.status_funil === etapa.id);
  });

  const calcularMetricas = () => {
    const total = leads.length;
    const ganhos = leads.filter(l => {
      const etapa = etapas.find(e => e.id === l.status_funil);
      return etapa?.nome.toLowerCase().includes("ganho");
    }).length;
    const perdidos = leads.filter(l => {
      const etapa = etapas.find(e => e.id === l.status_funil);
      return etapa?.nome.toLowerCase().includes("perdido");
    }).length;
    const emNegociacao = leads.filter(l => l.status_funil !== "lead" && !etapas.find(e => e.id === l.status_funil)?.nome.toLowerCase().includes("ganho") && !etapas.find(e => e.id === l.status_funil)?.nome.toLowerCase().includes("perdido")).length;
    const valorTotalPropostas = leads
      .filter(l => l.valor_total_proposta)
      .reduce((sum, l) => sum + l.valor_total_proposta, 0);
    const taxaConversao = (ganhos + perdidos) > 0 ? ((ganhos / (ganhos + perdidos)) * 100).toFixed(1) : 0;

    return { total, ganhos, perdidos, emNegociacao, valorTotalPropostas, taxaConversao };
  };

  const metricas = calcularMetricas();

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
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p style={{ color: theme.textMuted }}>Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user || user.role !== "admin") {
    return (
      <div className="p-6 min-h-screen" style={{ backgroundColor: theme.bg }}>
        <div className="max-w-3xl mx-auto">
          <Alert variant="destructive">
            <AlertCircle className="w-4 h-4" />
            <AlertDescription>
              Acesso restrito a administradores.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 min-h-screen" style={{ backgroundColor: theme.bg }}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Users className="w-8 h-8 text-blue-600" />
                <h1 className="text-3xl font-bold" style={{ color: theme.text }}>
                  CRM - Funil de Vendas
                </h1>
              </div>
              <p style={{ color: theme.textMuted }}>
                Gerencie leads e propostas comerciais
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => setShowConfigEtapas(true)}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Settings className="w-4 h-4" />
                Configurar Etapas
              </Button>
              <Button
                onClick={() => window.location.href = createPageUrl("Precificacao")}
                className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
              >
                <Calculator className="w-4 h-4" />
                Nova Proposta
              </Button>
            </div>
          </div>

          {/* Métricas */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            <Card style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}>
              <CardContent className="p-4 text-center">
                <p className="text-3xl font-bold text-blue-600">{metricas.total}</p>
                <p className="text-xs mt-1" style={{ color: theme.textMuted }}>Total Leads</p>
              </CardContent>
            </Card>
            <Card style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}>
              <CardContent className="p-4 text-center">
                <p className="text-3xl font-bold text-yellow-600">{metricas.emNegociacao}</p>
                <p className="text-xs mt-1" style={{ color: theme.textMuted }}>Em Negociação</p>
              </CardContent>
            </Card>
            <Card style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}>
              <CardContent className="p-4 text-center">
                <p className="text-3xl font-bold text-green-600">{metricas.ganhos}</p>
                <p className="text-xs mt-1" style={{ color: theme.textMuted }}>Ganhos</p>
              </CardContent>
            </Card>
            <Card style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}>
              <CardContent className="p-4 text-center">
                <p className="text-3xl font-bold text-purple-600">{metricas.taxaConversao}%</p>
                <p className="text-xs mt-1" style={{ color: theme.textMuted }}>Taxa Conversão</p>
              </CardContent>
            </Card>
            <Card style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}>
              <CardContent className="p-4 text-center">
                <p className="text-xl font-bold text-blue-600">
                  R$ {metricas.valorTotalPropostas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
                <p className="text-xs mt-1" style={{ color: theme.textMuted }}>Valor Propostas</p>
              </CardContent>
            </Card>
          </div>

          {/* Filtros e Busca */}
          <div className="space-y-3 mb-6">
            <div className="flex flex-col md:flex-row gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: theme.textMuted }} />
                <Input
                  placeholder="Buscar por empresa, CNPJ, responsável..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                  style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder, color: theme.text }}
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setMostrarFiltrosAvancados(!mostrarFiltrosAvancados)}
                  className="flex items-center gap-2"
                >
                  <Filter className="w-4 h-4" />
                  Filtros
                  {mostrarFiltrosAvancados && <ChevronDown className="w-4 h-4" />}
                </Button>
                <select
                  value={filtroStatus}
                  onChange={(e) => setFiltroStatus(e.target.value)}
                  className="px-3 py-2 rounded-lg border"
                  style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder, color: theme.text }}
                >
                  <option value="todos">Todos Status</option>
                  <option value="lead">Lead</option>
                  {etapas.map(etapa => (
                    <option key={etapa.id} value={etapa.id}>{etapa.nome}</option>
                  ))}
                </select>
                <Button
                  variant={viewMode === "lista" ? "default" : "outline"}
                  onClick={() => setViewMode("lista")}
                  size="icon"
                >
                  <LayoutList className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === "kanban" ? "default" : "outline"}
                  onClick={() => setViewMode("kanban")}
                  size="icon"
                >
                  <LayoutGrid className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Filtros Avançados */}
            {mostrarFiltrosAvancados && (
              <Card style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}>
                <CardContent className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-xs font-semibold mb-2 block" style={{ color: theme.text }}>
                        Origem
                      </label>
                      <select
                        value={filtroOrigem}
                        onChange={(e) => setFiltroOrigem(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border text-sm"
                        style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder, color: theme.text }}
                      >
                        <option value="todos">Todas Origens</option>
                        <option value="landing_page">Landing Page</option>
                        <option value="indicacao">Indicação</option>
                        <option value="manual">Manual</option>
                        <option value="cold_call">Cold Call</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-semibold mb-2 block" style={{ color: theme.text }}>
                        Data De
                      </label>
                      <Input
                        type="date"
                        value={filtroDataDe}
                        onChange={(e) => setFiltroDataDe(e.target.value)}
                        style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder, color: theme.text }}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold mb-2 block" style={{ color: theme.text }}>
                        Data Até
                      </label>
                      <Input
                        type="date"
                        value={filtroDataAte}
                        onChange={(e) => setFiltroDataAte(e.target.value)}
                        style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder, color: theme.text }}
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 mt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setFiltroOrigem("todos");
                        setFiltroDataDe("");
                        setFiltroDataAte("");
                      }}
                    >
                      Limpar Filtros
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Conteúdo */}
        {viewMode === "kanban" ? (
          <KanbanView
            leadsPorStatus={leadsPorStatus}
            todasEtapas={todasEtapas}
            onMudarStatus={handleMudarStatus}
            onGerarProposta={handleGerarProposta}
            onVerDetalhes={setLeadDetalhes}
            theme={theme}
            isDark={isDark}
            usuarios={usuarios}
          />
        ) : (
          <ListView
            leads={leadsFiltrados}
            todasEtapas={todasEtapas}
            onMudarStatus={handleMudarStatus}
            onGerarProposta={handleGerarProposta}
            onVerDetalhes={setLeadDetalhes}
            theme={theme}
            isDark={isDark}
            usuarios={usuarios}
          />
        )}

        {/* Modal Configurar Etapas */}
        {showConfigEtapas && (
          <ConfigurarEtapasModal
            open={showConfigEtapas}
            onClose={() => {
              setShowConfigEtapas(false);
              queryClient.invalidateQueries({ queryKey: ['etapas-funil'] });
            }}
            etapas={etapas}
            theme={theme}
            isDark={isDark}
          />
        )}

        {/* Modal Detalhes Lead */}
        {leadDetalhes && (
          <DetalhesLeadModal
            open={!!leadDetalhes}
            onClose={() => setLeadDetalhes(null)}
            lead={leadDetalhes}
            todasEtapas={todasEtapas}
            onAtualizar={() => {
              queryClient.invalidateQueries({ queryKey: ['leads'] });
              setLeadDetalhes(null);
            }}
            theme={theme}
            isDark={isDark}
            user={user}
          />
        )}
      </div>
    </div>
  );
}

function KanbanView({ leadsPorStatus, todasEtapas, onMudarStatus, onGerarProposta, onVerDetalhes, theme, isDark, usuarios }) {
  return (
    <div className="flex gap-4 overflow-x-auto pb-4" style={{ minHeight: 'calc(100vh - 450px)' }}>
      {todasEtapas.map((etapa) => {
        const leadsNaColuna = leadsPorStatus[etapa.id] || [];
        const valorTotal = leadsNaColuna.reduce((sum, l) => sum + (l.valor_total_proposta || 0), 0);
        
        return (
          <div key={etapa.id} className="flex-shrink-0" style={{ width: '320px' }}>
            <div className="sticky top-0 z-10 pb-3" style={{ backgroundColor: theme.bg }}>
              <Card style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder, borderLeftWidth: '4px', borderLeftColor: etapa.cor }}>
                <CardContent className="p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Badge style={{ backgroundColor: etapa.cor }} className="text-white text-xs">
                        {leadsNaColuna.length}
                      </Badge>
                      <h3 className="font-bold text-sm" style={{ color: theme.text }}>
                        {etapa.nome}
                      </h3>
                    </div>
                  </div>
                  {valorTotal > 0 && (
                    <p className="text-xs font-semibold text-green-600">
                      R$ {valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
            
            <div className="space-y-3 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 500px)' }}>
              {leadsNaColuna.map((lead) => (
                <LeadCard
                  key={lead.id}
                  lead={lead}
                  todasEtapas={todasEtapas}
                  onMudarStatus={onMudarStatus}
                  onGerarProposta={onGerarProposta}
                  onVerDetalhes={onVerDetalhes}
                  theme={theme}
                  isDark={isDark}
                  usuarios={usuarios}
                  isKanban={true}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ListView({ leads, todasEtapas, onMudarStatus, onGerarProposta, onVerDetalhes, theme, isDark, usuarios }) {
  const [selectedLeads, setSelectedLeads] = useState([]);

  const toggleSelect = (leadId) => {
    setSelectedLeads(prev => 
      prev.includes(leadId) ? prev.filter(id => id !== leadId) : [...prev, leadId]
    );
  };

  const toggleSelectAll = () => {
    if (selectedLeads.length === leads.length) {
      setSelectedLeads([]);
    } else {
      setSelectedLeads(leads.map(l => l.id));
    }
  };

  if (leads.length === 0) {
    return (
      <Card style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}>
        <CardContent className="p-12 text-center">
          <Users className="w-12 h-12 mx-auto mb-3" style={{ color: theme.textMuted }} />
          <p style={{ color: theme.textMuted }}>Nenhum lead encontrado</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div>
      {/* Cabeçalho da Tabela */}
      <Card style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }} className="mb-2">
        <CardContent className="p-3">
          <div className="grid grid-cols-12 gap-3 items-center text-xs font-semibold" style={{ color: theme.textMuted }}>
            <div className="col-span-1 flex items-center">
              <input
                type="checkbox"
                checked={selectedLeads.length === leads.length}
                onChange={toggleSelectAll}
                className="w-4 h-4"
              />
            </div>
            <div className="col-span-3">Empresa</div>
            <div className="col-span-2">Contato</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-1 text-right">Valor</div>
            <div className="col-span-2">Criado em</div>
            <div className="col-span-1 text-center">Ações</div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Leads */}
      <div className="space-y-2">
        {leads.map((lead) => {
          const etapaAtual = todasEtapas.find(e => e.id === lead.status_funil) || todasEtapas[0];
          const vendedor = usuarios.find(u => u.id === lead.vendedor_id);
          const isSelected = selectedLeads.includes(lead.id);

          return (
            <Card 
              key={lead.id}
              style={{ 
                backgroundColor: isSelected ? (isDark ? '#1e3a8a' : '#eff6ff') : theme.cardBg, 
                borderColor: theme.cardBorder,
                borderLeftWidth: '4px',
                borderLeftColor: etapaAtual.cor
              }}
              className="hover:shadow-md transition-all cursor-pointer"
              onClick={() => onVerDetalhes(lead)}
            >
              <CardContent className="p-3">
                <div className="grid grid-cols-12 gap-3 items-center">
                  <div className="col-span-1 flex items-center" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleSelect(lead.id)}
                      className="w-4 h-4"
                    />
                  </div>
                  
                  <div className="col-span-3">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-blue-600 flex-shrink-0" />
                      <div>
                        <p className="font-bold text-sm" style={{ color: theme.text }}>
                          {lead.razao_social}
                        </p>
                        {lead.cnpj && (
                          <p className="text-xs font-mono" style={{ color: theme.textMuted }}>
                            {lead.cnpj}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="col-span-2">
                    {lead.responsavel_nome && (
                      <div>
                        <p className="text-sm" style={{ color: theme.text }}>
                          {lead.responsavel_nome}
                        </p>
                        {lead.responsavel_email && (
                          <p className="text-xs" style={{ color: theme.textMuted }}>
                            {lead.responsavel_email}
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="col-span-2">
                    <Badge style={{ backgroundColor: etapaAtual.cor }} className="text-white text-xs">
                      {etapaAtual.nome}
                    </Badge>
                  </div>

                  <div className="col-span-1 text-right">
                    {lead.valor_total_proposta ? (
                      <p className="text-sm font-bold text-green-600">
                        R$ {(lead.valor_total_proposta / 1000).toFixed(0)}k
                      </p>
                    ) : (
                      <p className="text-xs" style={{ color: theme.textMuted }}>-</p>
                    )}
                  </div>

                  <div className="col-span-2">
                    <p className="text-xs" style={{ color: theme.textMuted }}>
                      {format(new Date(lead.created_date), "dd/MM/yyyy")}
                    </p>
                    {vendedor && (
                      <p className="text-xs" style={{ color: theme.textMuted }}>
                        {vendedor.full_name?.split(' ')[0]}
                      </p>
                    )}
                  </div>

                  <div className="col-span-1 flex justify-center gap-1" onClick={(e) => e.stopPropagation()}>
                    <Button
                      onClick={() => onGerarProposta(lead)}
                      size="sm"
                      variant="ghost"
                      className="h-7 w-7 p-0"
                    >
                      <Calculator className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Ações em Massa */}
      {selectedLeads.length > 0 && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
          <Card style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }} className="shadow-2xl">
            <CardContent className="p-4 flex items-center gap-4">
              <p className="text-sm font-semibold" style={{ color: theme.text }}>
                {selectedLeads.length} selecionado(s)
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedLeads([])}
                >
                  Cancelar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

function LeadCard({ lead, todasEtapas, onMudarStatus, onGerarProposta, onVerDetalhes, theme, isDark, usuarios, isKanban }) {
  const etapaAtual = todasEtapas.find(e => e.id === lead.status_funil) || todasEtapas[0];
  const vendedor = usuarios.find(u => u.id === lead.vendedor_id);

  const addons = lead.addons_selecionados ? JSON.parse(lead.addons_selecionados) : [];

  const ORIGEM_CONFIG = {
    landing_page: { label: "Landing Page", icon: "🌐" },
    indicacao: { label: "Indicação", icon: "👥" },
    manual: { label: "Manual", icon: "✍️" },
    cold_call: { label: "Cold Call", icon: "📞" }
  };

  const origemConfig = ORIGEM_CONFIG[lead.origem] || ORIGEM_CONFIG.manual;

  return (
    <Card 
      style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}
      className={`hover:shadow-lg transition-all cursor-pointer ${isKanban ? '' : 'border-l-4'}`}
      {...(!isKanban && { style: { ...{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }, borderLeftColor: etapaAtual.cor } })}
      onClick={() => onVerDetalhes(lead)}
    >
      <CardContent className="p-4">
        <div className={`flex ${isKanban ? 'flex-col' : 'items-start justify-between'} gap-3`}>
          <div className="flex-1">
            <div className="flex items-start gap-2 mb-2">
              <Building2 className="w-5 h-5 flex-shrink-0 mt-0.5 text-blue-600" />
              <div className="flex-1">
                <h3 className="font-bold text-base mb-1" style={{ color: theme.text }}>
                  {lead.razao_social}
                </h3>
                {lead.nome_fantasia && lead.nome_fantasia !== lead.razao_social && (
                  <p className="text-xs mb-1" style={{ color: theme.textMuted }}>
                    {lead.nome_fantasia}
                  </p>
                )}
                {lead.cnpj && (
                  <p className="text-xs font-mono" style={{ color: theme.textMuted }}>
                    CNPJ: {lead.cnpj}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-1 mb-3">
              {lead.responsavel_nome && (
                <div className="flex items-center gap-2 text-xs" style={{ color: theme.textMuted }}>
                  <Users className="w-3 h-3" />
                  {lead.responsavel_nome}
                </div>
              )}
              {lead.responsavel_email && (
                <div className="flex items-center gap-2 text-xs" style={{ color: theme.textMuted }}>
                  <Mail className="w-3 h-3" />
                  {lead.responsavel_email}
                </div>
              )}
              {lead.responsavel_telefone && (
                <div className="flex items-center gap-2 text-xs" style={{ color: theme.textMuted }}>
                  <Phone className="w-3 h-3" />
                  {lead.responsavel_telefone}
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-2 mb-3">
              <Badge style={{ backgroundColor: etapaAtual.cor }} className="text-white text-xs">
                {etapaAtual.nome}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {origemConfig.icon} {origemConfig.label}
              </Badge>
              {lead.valor_total_proposta && (
                <Badge className="bg-green-600 text-white text-xs">
                  R$ {lead.valor_total_proposta.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </Badge>
              )}
            </div>

            {addons.length > 0 && (
              <div className="mb-3">
                <p className="text-xs font-semibold mb-1" style={{ color: theme.text }}>Add-ons:</p>
                <div className="flex flex-wrap gap-1">
                  {addons.map((addon, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs">
                      {addon.nome}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {vendedor && (
              <p className="text-xs" style={{ color: theme.textMuted }}>
                Vendedor: {vendedor.full_name}
              </p>
            )}
          </div>

          <div className={`flex ${isKanban ? 'flex-col' : 'flex-row'} gap-2`} onClick={(e) => e.stopPropagation()}>
            <select
              value={lead.status_funil}
              onChange={(e) => onMudarStatus(lead.id, e.target.value)}
              className="text-xs px-2 py-1 rounded border"
              style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder, color: theme.text }}
            >
              <option value="lead">Lead</option>
              {todasEtapas.filter(e => e.id !== "lead").map((etapa) => (
                <option key={etapa.id} value={etapa.id}>{etapa.nome}</option>
              ))}
            </select>
            <Button
              onClick={(e) => {
                e.stopPropagation();
                onGerarProposta(lead);
              }}
              size="sm"
              variant="outline"
              className="flex items-center gap-1"
            >
              <Calculator className="w-3 h-3" />
              {lead.valor_total_proposta ? "Editar" : "Proposta"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ConfigurarEtapasModal({ open, onClose, etapas, theme, isDark }) {
  const [etapasEditadas, setEtapasEditadas] = useState([...etapas]);
  const queryClient = useQueryClient();

  const handleAddEtapa = () => {
    const novaOrdem = Math.max(...etapasEditadas.map(e => e.ordem), 0) + 1;
    setEtapasEditadas([
      ...etapasEditadas,
      { id: `nova_${Date.now()}`, nome: "Nova Etapa", cor: "#3b82f6", ordem: novaOrdem, editavel: true, isNova: true }
    ]);
  };

  const handleRemoverEtapa = (etapaId) => {
    setEtapasEditadas(etapasEditadas.filter(e => e.id !== etapaId));
  };

  const handleEditarEtapa = (etapaId, campo, valor) => {
    setEtapasEditadas(etapasEditadas.map(e => 
      e.id === etapaId ? { ...e, [campo]: valor } : e
    ));
  };

  const handleOnDragEnd = (result) => {
    if (!result.destination) return;

    const items = Array.from(etapasEditadas);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Atualizar a ordem de todas as etapas
    const etapasComNovaOrdem = items.map((etapa, index) => ({
      ...etapa,
      ordem: index + 1, // 'Lead' é ordem 0, então as editáveis começam em 1
    }));

    setEtapasEditadas(etapasComNovaOrdem);
  };

  const handleSalvar = async () => {
    try {
      // Separar novas etapas e etapas para atualizar
      const novasEtapas = etapasEditadas.filter(e => e.isNova).map(e => {
        const { isNova, id, ...etapaData } = e;
        return etapaData;
      });

      const etapasParaAtualizar = etapasEditadas.filter(e => !e.isNova);
      const etapasParaRemover = etapas.filter(e => !etapasEditadas.find(ee => ee.id === e.id));

      // Criar novas em lote
      if (novasEtapas.length > 0) {
        await base44.entities.EtapaFunil.bulkCreate(novasEtapas);
      }

      // Atualizar existentes em paralelo
      if (etapasParaAtualizar.length > 0) {
        await Promise.all(
          etapasParaAtualizar.map(etapa => {
            const { isNova, ...etapaData } = etapa;
            return base44.entities.EtapaFunil.update(etapa.id, etapaData);
          })
        );
      }

      // Remover em paralelo
      if (etapasParaRemover.length > 0) {
        await Promise.all(
          etapasParaRemover.map(etapa => base44.entities.EtapaFunil.delete(etapa.id))
        );
      }

      queryClient.invalidateQueries({ queryKey: ['etapas-funil'] });
      toast.success("Etapas atualizadas com sucesso!");
      onClose();
    } catch (error) {
      console.error("Erro ao salvar etapas:", error);
      toast.error("Erro ao salvar etapas");
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div 
        className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-lg shadow-xl"
        style={{ backgroundColor: theme.cardBg }}
      >
        <div className="sticky top-0 z-10 p-6 border-b flex items-center justify-between" 
          style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}>
          <h2 className="text-2xl font-bold" style={{ color: theme.text }}>
            Configurar Etapas do Funil
          </h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="p-6 space-y-4">
          <Alert>
            <AlertCircle className="w-4 h-4" />
            <AlertDescription>
              A etapa "Lead" é fixa e não pode ser editada. Arraste as etapas para reordenar o funil.
            </AlertDescription>
          </Alert>

          <DragDropContext onDragEnd={handleOnDragEnd}>
            <Droppable droppableId="etapas">
              {(provided) => (
                <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-4">
                  {etapasEditadas.map((etapa, index) => (
                    <Draggable key={etapa.id} draggableId={etapa.id} index={index}>
                      {(provided, snapshot) => (
                        <Card 
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          style={{
                            backgroundColor: isDark ? '#0f172a' : '#f9fafb',
                            borderColor: theme.cardBorder,
                            ...provided.draggableProps.style,
                          }}
                          className={snapshot.isDragging ? 'shadow-2xl' : ''}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start gap-3">
                              <div {...provided.dragHandleProps} className="p-2 -ml-2 cursor-grab active:cursor-grabbing">
                                <GripVertical className="w-5 h-5 text-gray-400" />
                              </div>
                              <div className="flex-1 space-y-3">
                                <div>
                                  <label className="text-xs font-semibold mb-1 block" style={{ color: theme.text }}>
                                    Nome da Etapa
                                  </label>
                                  <Input
                                    value={etapa.nome}
                                    onChange={(e) => handleEditarEtapa(etapa.id, 'nome', e.target.value)}
                                    style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder, color: theme.text }}
                                  />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                  <div>
                                    <label className="text-xs font-semibold mb-1 block" style={{ color: theme.text }}>
                                      Cor
                                    </label>
                                    <div className="flex gap-2">
                                      <Input
                                        type="color"
                                        value={etapa.cor}
                                        onChange={(e) => handleEditarEtapa(etapa.id, 'cor', e.target.value)}
                                        className="w-16 h-9 p-1"
                                      />
                                      <Input
                                        value={etapa.cor}
                                        onChange={(e) => handleEditarEtapa(etapa.id, 'cor', e.target.value)}
                                        placeholder="#3b82f6"
                                        style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder, color: theme.text }}
                                      />
                                    </div>
                                  </div>
                                  <div>
                                    <label className="text-xs font-semibold mb-1 block" style={{ color: theme.text }}>
                                      Ordem
                                    </label>
                                    <Input
                                      type="number"
                                      value={etapa.ordem}
                                      readOnly
                                      style={{ backgroundColor: isDark ? '#334155' : '#f3f4f6', borderColor: theme.cardBorder, color: theme.textMuted }}
                                    />
                                  </div>
                                </div>
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleRemoverEtapa(etapa.id)}
                                className="text-red-600 hover:bg-red-50"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>

          <Button
            onClick={handleAddEtapa}
            variant="outline"
            className="w-full flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Adicionar Etapa
          </Button>
        </div>

        <div className="sticky bottom-0 p-6 border-t flex items-center justify-end gap-3"
          style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button 
            onClick={handleSalvar}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Save className="w-4 h-4 mr-2" />
            Salvar Alterações
          </Button>
        </div>
      </div>
    </div>
  );
}

function DetalhesLeadModal({ open, onClose, lead, todasEtapas, onAtualizar, theme, isDark, user }) {
  const [observacoesInternas, setObservacoesInternas] = useState(lead.observacoes_internas || "");
  const [novaInteracao, setNovaInteracao] = useState({ tipo: "email", descricao: "" });
  const [salvando, setSalvando] = useState(false);

  const { data: interacoes = [] } = useQuery({
    queryKey: ['interacoes', lead.id],
    queryFn: () => base44.entities.InteracaoLead.filter({ lead_id: lead.id }, "-data_interacao"),
    initialData: [],
  });

  const handleSalvarObservacoes = async () => {
    setSalvando(true);
    try {
      await base44.entities.Lead.update(lead.id, { observacoes_internas: observacoesInternas });
      toast.success("Observações salvas!");
      onAtualizar();
    } catch (error) {
      console.error("Erro ao salvar:", error);
      toast.error("Erro ao salvar observações");
    } finally {
      setSalvando(false);
    }
  };

  const handleAdicionarInteracao = async () => {
    if (!novaInteracao.descricao) {
      toast.error("Preencha a descrição");
      return;
    }

    try {
      await base44.entities.InteracaoLead.create({
        lead_id: lead.id,
        tipo: novaInteracao.tipo,
        descricao: novaInteracao.descricao,
        data_interacao: new Date().toISOString(),
        usuario_id: user.id
      });

      await base44.entities.Lead.update(lead.id, {
        data_ultimo_contato: new Date().toISOString()
      });

      setNovaInteracao({ tipo: "email", descricao: "" });
      queryClient.invalidateQueries({ queryKey: ['interacoes', lead.id] });
      toast.success("Interação registrada!");
    } catch (error) {
      console.error("Erro ao adicionar interação:", error);
      toast.error("Erro ao registrar interação");
    }
  };

  const queryClient = useQueryClient();
  const etapaAtual = todasEtapas.find(e => e.id === lead.status_funil) || todasEtapas[0];

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div 
        className="w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-lg shadow-xl"
        style={{ backgroundColor: theme.cardBg }}
      >
        <div className="sticky top-0 z-10 p-6 border-b flex items-center justify-between" 
          style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: etapaAtual.cor }}>
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold" style={{ color: theme.text }}>
                {lead.razao_social}
              </h2>
              <Badge style={{ backgroundColor: etapaAtual.cor }} className="text-white text-xs mt-1">
                {etapaAtual.nome}
              </Badge>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="p-6 space-y-6">
          {/* Informações Básicas */}
          <div>
            <h3 className="font-bold text-lg mb-3" style={{ color: theme.text }}>Informações</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              {lead.cnpj && (
                <div>
                  <p className="font-semibold mb-1" style={{ color: theme.textMuted }}>CNPJ</p>
                  <p style={{ color: theme.text }}>{lead.cnpj}</p>
                </div>
              )}
              {lead.cidade && (
                <div>
                  <p className="font-semibold mb-1" style={{ color: theme.textMuted }}>Cidade/UF</p>
                  <p style={{ color: theme.text }}>{lead.cidade}/{lead.uf}</p>
                </div>
              )}
              {lead.responsavel_nome && (
                <div>
                  <p className="font-semibold mb-1" style={{ color: theme.textMuted }}>Responsável</p>
                  <p style={{ color: theme.text }}>{lead.responsavel_nome}</p>
                </div>
              )}
              {lead.responsavel_cargo && (
                <div>
                  <p className="font-semibold mb-1" style={{ color: theme.textMuted }}>Cargo</p>
                  <p style={{ color: theme.text }}>{lead.responsavel_cargo}</p>
                </div>
              )}
              {lead.responsavel_email && (
                <div>
                  <p className="font-semibold mb-1" style={{ color: theme.textMuted }}>Email</p>
                  <p style={{ color: theme.text }}>{lead.responsavel_email}</p>
                </div>
              )}
              {lead.responsavel_telefone && (
                <div>
                  <p className="font-semibold mb-1" style={{ color: theme.textMuted }}>Telefone</p>
                  <p style={{ color: theme.text }}>{lead.responsavel_telefone}</p>
                </div>
              )}
            </div>
          </div>

          {/* Proposta */}
          {lead.valor_total_proposta && (
            <div>
              <h3 className="font-bold text-lg mb-3" style={{ color: theme.text }}>Proposta Comercial</h3>
              <div className="grid grid-cols-2 gap-4">
                <Card style={{ backgroundColor: isDark ? '#0f172a' : '#f9fafb', borderColor: theme.cardBorder }}>
                  <CardContent className="p-4">
                    <p className="text-xs mb-1" style={{ color: theme.textMuted }}>Valor Total Mensal</p>
                    <p className="text-2xl font-bold text-green-600">
                      R$ {lead.valor_total_proposta.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                  </CardContent>
                </Card>
                {lead.data_proposta && (
                  <Card style={{ backgroundColor: isDark ? '#0f172a' : '#f9fafb', borderColor: theme.cardBorder }}>
                    <CardContent className="p-4">
                      <p className="text-xs mb-1" style={{ color: theme.textMuted }}>Data Proposta</p>
                      <p className="text-sm font-semibold" style={{ color: theme.text }}>
                        {format(new Date(lead.data_proposta), "dd/MM/yyyy HH:mm")}
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          )}

          {/* Observações Internas */}
          <div>
            <h3 className="font-bold text-lg mb-3" style={{ color: theme.text }}>Observações Internas</h3>
            <Textarea
              value={observacoesInternas}
              onChange={(e) => setObservacoesInternas(e.target.value)}
              placeholder="Anotações internas sobre o lead, negociação, próximos passos..."
              rows={4}
              style={{ backgroundColor: isDark ? '#0f172a' : '#ffffff', borderColor: theme.cardBorder, color: theme.text }}
            />
            <Button
              onClick={handleSalvarObservacoes}
              disabled={salvando}
              className="mt-2 bg-blue-600 hover:bg-blue-700"
              size="sm"
            >
              <Save className="w-3 h-3 mr-2" />
              Salvar Observações
            </Button>
          </div>

          {/* Histórico de Interações */}
          <div>
            <h3 className="font-bold text-lg mb-3" style={{ color: theme.text }}>Histórico de Interações</h3>
            
            {/* Nova Interação */}
            <Card style={{ backgroundColor: isDark ? '#0f172a' : '#f9fafb', borderColor: theme.cardBorder }} className="mb-4">
              <CardContent className="p-4 space-y-3">
                <div className="flex gap-3">
                  <select
                    value={novaInteracao.tipo}
                    onChange={(e) => setNovaInteracao({ ...novaInteracao, tipo: e.target.value })}
                    className="px-3 py-2 rounded-lg border text-sm"
                    style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder, color: theme.text }}
                  >
                    <option value="email">📧 Email</option>
                    <option value="telefone">📞 Telefone</option>
                    <option value="reuniao">👥 Reunião</option>
                    <option value="proposta">📄 Proposta</option>
                    <option value="followup">🔄 Follow-up</option>
                    <option value="outro">💬 Outro</option>
                  </select>
                  <Input
                    value={novaInteracao.descricao}
                    onChange={(e) => setNovaInteracao({ ...novaInteracao, descricao: e.target.value })}
                    placeholder="Descreva a interação..."
                    style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder, color: theme.text }}
                  />
                  <Button onClick={handleAdicionarInteracao} size="sm" className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Lista de Interações */}
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {interacoes.length === 0 ? (
                <p className="text-sm text-center py-8" style={{ color: theme.textMuted }}>
                  Nenhuma interação registrada
                </p>
              ) : (
                interacoes.map((interacao) => (
                  <Card key={interacao.id} style={{ backgroundColor: isDark ? '#0f172a' : '#ffffff', borderColor: theme.cardBorder }}>
                    <CardContent className="p-3">
                      <div className="flex items-start gap-3">
                        <MessageSquare className="w-4 h-4 flex-shrink-0 mt-1 text-blue-600" />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline" className="text-xs">
                              {interacao.tipo}
                            </Badge>
                            <span className="text-xs" style={{ color: theme.textMuted }}>
                              {format(new Date(interacao.data_interacao), "dd/MM/yyyy HH:mm")}
                            </span>
                          </div>
                          <p className="text-sm" style={{ color: theme.text }}>{interacao.descricao}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 p-6 border-t flex items-center justify-end gap-3"
          style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}>
          <Button variant="outline" onClick={onClose}>
            Fechar
          </Button>
        </div>
      </div>
    </div>
  );
}