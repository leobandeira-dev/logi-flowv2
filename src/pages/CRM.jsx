import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Users,
  Search,
  LayoutList,
  LayoutGrid,
  Plus,
  Calculator,
  AlertCircle,
  TrendingUp,
  Mail,
  Phone,
  Building2,
  Calendar,
  DollarSign,
  Eye,
  Edit2
} from "lucide-react";
import { createPageUrl } from "@/utils";
import { toast } from "sonner";

const STATUS_CONFIG = {
  lead: { label: "Lead", color: "bg-gray-500", textColor: "text-gray-700" },
  contato_inicial: { label: "Contato Inicial", color: "bg-blue-500", textColor: "text-blue-700" },
  proposta_enviada: { label: "Proposta Enviada", color: "bg-purple-500", textColor: "text-purple-700" },
  negociacao: { label: "Em Negociação", color: "bg-yellow-500", textColor: "text-yellow-700" },
  fechado_ganho: { label: "Ganho ✓", color: "bg-green-500", textColor: "text-green-700" },
  fechado_perdido: { label: "Perdido", color: "bg-red-500", textColor: "text-red-700" }
};

const ORIGEM_CONFIG = {
  landing_page: { label: "Landing Page", icon: "🌐" },
  indicacao: { label: "Indicação", icon: "👥" },
  manual: { label: "Manual", icon: "✍️" },
  cold_call: { label: "Cold Call", icon: "📞" }
};

export default function CRM() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isDark, setIsDark] = useState(false);
  const [viewMode, setViewMode] = useState("kanban");
  const [searchTerm, setSearchTerm] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("todos");
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

  const { data: leads = [], isLoading: loadingLeads } = useQuery({
    queryKey: ['leads'],
    queryFn: () => base44.entities.Lead.list("-created_date"),
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
      
      if (novoStatus === "fechado_ganho" || novoStatus === "fechado_perdido") {
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

    return matchSearch && matchStatus;
  });

  const leadsPorStatus = {
    lead: leadsFiltrados.filter(l => l.status_funil === "lead"),
    contato_inicial: leadsFiltrados.filter(l => l.status_funil === "contato_inicial"),
    proposta_enviada: leadsFiltrados.filter(l => l.status_funil === "proposta_enviada"),
    negociacao: leadsFiltrados.filter(l => l.status_funil === "negociacao"),
    fechado_ganho: leadsFiltrados.filter(l => l.status_funil === "fechado_ganho"),
    fechado_perdido: leadsFiltrados.filter(l => l.status_funil === "fechado_perdido")
  };

  const calcularMetricas = () => {
    const total = leads.length;
    const ganhos = leads.filter(l => l.status_funil === "fechado_ganho").length;
    const perdidos = leads.filter(l => l.status_funil === "fechado_perdido").length;
    const emNegociacao = leads.filter(l => ["contato_inicial", "proposta_enviada", "negociacao"].includes(l.status_funil)).length;
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
            <Button
              onClick={() => window.location.href = createPageUrl("Precificacao")}
              className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
            >
              <Calculator className="w-4 h-4" />
              Nova Proposta
            </Button>
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
                <p className="text-2xl font-bold text-blue-600">
                  R$ {metricas.valorTotalPropostas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
                <p className="text-xs mt-1" style={{ color: theme.textMuted }}>Valor Propostas</p>
              </CardContent>
            </Card>
          </div>

          {/* Filtros e Busca */}
          <div className="flex flex-col md:flex-row gap-3 mb-6">
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
              <select
                value={filtroStatus}
                onChange={(e) => setFiltroStatus(e.target.value)}
                className="px-3 py-2 rounded-lg border"
                style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder, color: theme.text }}
              >
                <option value="todos">Todos Status</option>
                {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                  <option key={key} value={key}>{config.label}</option>
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
        </div>

        {/* Conteúdo */}
        {viewMode === "kanban" ? (
          <KanbanView
            leadsPorStatus={leadsPorStatus}
            onMudarStatus={handleMudarStatus}
            onGerarProposta={handleGerarProposta}
            theme={theme}
            isDark={isDark}
            usuarios={usuarios}
          />
        ) : (
          <ListView
            leads={leadsFiltrados}
            onMudarStatus={handleMudarStatus}
            onGerarProposta={handleGerarProposta}
            theme={theme}
            isDark={isDark}
            usuarios={usuarios}
          />
        )}
      </div>
    </div>
  );
}

function KanbanView({ leadsPorStatus, onMudarStatus, onGerarProposta, theme, isDark, usuarios }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {Object.entries(STATUS_CONFIG).map(([status, config]) => {
        const leadsNaColuna = leadsPorStatus[status] || [];
        
        return (
          <div key={status}>
            <div className="mb-3">
              <div className="flex items-center gap-2 mb-2">
                <Badge className={`${config.color} text-white`}>
                  {leadsNaColuna.length}
                </Badge>
                <h3 className="font-bold text-sm" style={{ color: theme.text }}>
                  {config.label}
                </h3>
              </div>
            </div>
            
            <div className="space-y-3 min-h-[200px]">
              {leadsNaColuna.map((lead) => (
                <LeadCard
                  key={lead.id}
                  lead={lead}
                  onMudarStatus={onMudarStatus}
                  onGerarProposta={onGerarProposta}
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

function ListView({ leads, onMudarStatus, onGerarProposta, theme, isDark, usuarios }) {
  return (
    <div className="space-y-3">
      {leads.length === 0 ? (
        <Card style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}>
          <CardContent className="p-12 text-center">
            <Users className="w-12 h-12 mx-auto mb-3" style={{ color: theme.textMuted }} />
            <p style={{ color: theme.textMuted }}>Nenhum lead encontrado</p>
          </CardContent>
        </Card>
      ) : (
        leads.map((lead) => (
          <LeadCard
            key={lead.id}
            lead={lead}
            onMudarStatus={onMudarStatus}
            onGerarProposta={onGerarProposta}
            theme={theme}
            isDark={isDark}
            usuarios={usuarios}
            isKanban={false}
          />
        ))
      )}
    </div>
  );
}

function LeadCard({ lead, onMudarStatus, onGerarProposta, theme, isDark, usuarios, isKanban }) {
  const config = STATUS_CONFIG[lead.status_funil] || STATUS_CONFIG.lead;
  const origemConfig = ORIGEM_CONFIG[lead.origem] || ORIGEM_CONFIG.manual;
  const vendedor = usuarios.find(u => u.id === lead.vendedor_id);

  const addons = lead.addons_selecionados ? JSON.parse(lead.addons_selecionados) : [];

  return (
    <Card 
      style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}
      className={`hover:shadow-lg transition-all ${isKanban ? '' : 'border-l-4'}`}
      {...(!isKanban && { style: { ...{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }, borderLeftColor: config.color.replace('bg-', '#') } })}
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
              <Badge className={`${config.color} text-white text-xs`}>
                {config.label}
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

          <div className={`flex ${isKanban ? 'flex-col' : 'flex-row'} gap-2`}>
            <select
              value={lead.status_funil}
              onChange={(e) => onMudarStatus(lead.id, e.target.value)}
              className="text-xs px-2 py-1 rounded border"
              style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder, color: theme.text }}
            >
              {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                <option key={key} value={key}>{config.label}</option>
              ))}
            </select>
            <Button
              onClick={() => onGerarProposta(lead)}
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