import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { 
  Search, 
  RefreshCw, 
  Eye, 
  Lightbulb, 
  Bug, 
  HelpCircle, 
  MessageCircle,
  CheckCircle2,
  Clock,
  Star
} from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import NPSModal from "../components/chamados/NPSModal";

export default function ChamadosAdmin() {
  const [chamados, setChamados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("todos");
  const [filtroTipo, setFiltroTipo] = useState("todos");
  const [selectedChamado, setSelectedChamado] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showNPS, setShowNPS] = useState(false);
  const [chamadoParaNPS, setChamadoParaNPS] = useState(null);
  const [isDark, setIsDark] = useState(false);
  const [respostaAdmin, setRespostaAdmin] = useState("");
  const [salvandoResposta, setSalvandoResposta] = useState(false);

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
      
      if (user.role !== "admin") {
        toast.error("Acesso restrito a administradores");
        return;
      }

      const chamadosData = await base44.entities.Chamado.list("-created_date");
      setChamados(chamadosData);
    } catch (error) {
      console.error("Erro ao carregar chamados:", error);
      toast.error("Erro ao carregar dados");
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (chamado) => {
    setSelectedChamado(chamado);
    setRespostaAdmin(chamado.resposta_admin || "");
    setShowDetails(true);
  };

  const handleUpdateStatus = async (chamadoId, newStatus) => {
    try {
      const updateData = {
        status: newStatus
      };

      if (newStatus === "resolvido") {
        const user = await base44.auth.me();
        updateData.data_resolucao = new Date().toISOString();
        updateData.resolvido_por = user.id;
      }

      await base44.entities.Chamado.update(chamadoId, updateData);
      
      if (newStatus === "resolvido") {
        const chamadoAtualizado = chamados.find(c => c.id === chamadoId);
        setChamadoParaNPS(chamadoAtualizado);
        setShowNPS(true);
      }
      
      toast.success("Status atualizado!");
      loadData();
    } catch (error) {
      console.error("Erro ao atualizar status:", error);
      toast.error("Erro ao atualizar status");
    }
  };

  const handleSalvarResposta = async () => {
    if (!selectedChamado || !respostaAdmin.trim()) return;

    setSalvandoResposta(true);
    try {
      await base44.entities.Chamado.update(selectedChamado.id, {
        resposta_admin: respostaAdmin.trim()
      });

      toast.success("Resposta salva!");
      setShowDetails(false);
      loadData();
    } catch (error) {
      console.error("Erro ao salvar resposta:", error);
      toast.error("Erro ao salvar resposta");
    } finally {
      setSalvandoResposta(false);
    }
  };

  const tiposConfig = {
    sugestao: { icon: Lightbulb, label: "Sugestão", color: "bg-yellow-500" },
    bug: { icon: Bug, label: "Bug", color: "bg-red-500" },
    duvida: { icon: HelpCircle, label: "Dúvida", color: "bg-blue-500" }
  };

  const statusConfig = {
    aberto: { label: "Aberto", color: "bg-gray-500" },
    em_analise: { label: "Em Análise", color: "bg-blue-500" },
    em_desenvolvimento: { label: "Em Desenvolvimento", color: "bg-purple-500" },
    resolvido: { label: "Resolvido", color: "bg-green-500" },
    fechado: { label: "Fechado", color: "bg-gray-400" }
  };

  const prioridadeConfig = {
    baixa: { label: "Baixa", color: "bg-blue-100 text-blue-800" },
    media: { label: "Média", color: "bg-yellow-100 text-yellow-800" },
    alta: { label: "Alta", color: "bg-red-100 text-red-800" }
  };

  const filteredChamados = chamados.filter(chamado => {
    const matchesSearch = !searchTerm || 
      chamado.titulo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      chamado.descricao?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      chamado.user_nome?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = filtroStatus === "todos" || chamado.status === filtroStatus;
    const matchesTipo = filtroTipo === "todos" || chamado.tipo === filtroTipo;

    return matchesSearch && matchesStatus && matchesTipo;
  });

  const calcularNPSMedio = () => {
    const chamadosComNPS = chamados.filter(c => c.nps_score !== null && c.nps_score !== undefined);
    if (chamadosComNPS.length === 0) return null;
    
    const soma = chamadosComNPS.reduce((acc, c) => acc + c.nps_score, 0);
    return (soma / chamadosComNPS.length).toFixed(1);
  };

  const theme = {
    bg: isDark ? '#0f172a' : '#f9fafb',
    cardBg: isDark ? '#1e293b' : '#ffffff',
    cardBorder: isDark ? '#334155' : '#e5e7eb',
    text: isDark ? '#f1f5f9' : '#111827',
    textMuted: isDark ? '#94a3b8' : '#6b7280',
    inputBg: isDark ? '#1e293b' : '#ffffff',
    inputBorder: isDark ? '#334155' : '#d1d5db',
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

  const npsMedio = calcularNPSMedio();

  return (
    <div className="p-6 min-h-screen" style={{ backgroundColor: theme.bg }}>
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
          <div>
            <h1 className="text-2xl font-bold mb-1" style={{ color: theme.text }}>
              Chamados e Sugestões
            </h1>
            <p className="text-sm" style={{ color: theme.textMuted }}>
              Gerencie feedback dos usuários
            </p>
          </div>
          
          <div className="flex gap-2 w-full lg:w-auto">
            <div className="relative flex-1 lg:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: theme.textMuted }} />
              <Input
                placeholder="Buscar chamados..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-9 text-sm"
                style={{ backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.text }}
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={loadData}
              className="h-9"
              style={{ borderColor: theme.inputBorder, color: theme.text }}
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-blue-600" />
                Total
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-blue-600">{chamados.length}</p>
            </CardContent>
          </Card>

          <Card style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Clock className="w-4 h-4 text-yellow-600" />
                Abertos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-yellow-600">
                {chamados.filter(c => c.status === "aberto" || c.status === "em_analise").length}
              </p>
            </CardContent>
          </Card>

          <Card style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                Resolvidos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-green-600">
                {chamados.filter(c => c.status === "resolvido").length}
              </p>
            </CardContent>
          </Card>

          <Card style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Star className="w-4 h-4 text-purple-600" />
                NPS Médio
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-purple-600">
                {npsMedio !== null ? `${npsMedio}/10` : "-"}
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="flex gap-2 mb-4 flex-wrap">
          <Badge
            variant={filtroStatus === "todos" ? "default" : "outline"}
            className="cursor-pointer"
            onClick={() => setFiltroStatus("todos")}
          >
            Todos ({chamados.length})
          </Badge>
          {Object.entries(statusConfig).map(([key, config]) => {
            const count = chamados.filter(c => c.status === key).length;
            return (
              <Badge
                key={key}
                variant={filtroStatus === key ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => setFiltroStatus(key)}
              >
                {config.label} ({count})
              </Badge>
            );
          })}
        </div>

        <div className="flex gap-2 mb-4">
          <Badge
            variant={filtroTipo === "todos" ? "default" : "outline"}
            className="cursor-pointer"
            onClick={() => setFiltroTipo("todos")}
          >
            Todos os Tipos
          </Badge>
          {Object.entries(tiposConfig).map(([key, config]) => {
            const Icon = config.icon;
            const count = chamados.filter(c => c.tipo === key).length;
            return (
              <Badge
                key={key}
                variant={filtroTipo === key ? "default" : "outline"}
                className="cursor-pointer flex items-center gap-1"
                onClick={() => setFiltroTipo(key)}
              >
                <Icon className="w-3 h-3" />
                {config.label} ({count})
              </Badge>
            );
          })}
        </div>

        <Card style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b" style={{ borderColor: theme.cardBorder }}>
                    <th className="text-left px-3 py-2 text-xs font-semibold" style={{ color: theme.textMuted }}>Tipo</th>
                    <th className="text-left px-3 py-2 text-xs font-semibold" style={{ color: theme.textMuted }}>Título</th>
                    <th className="text-left px-3 py-2 text-xs font-semibold" style={{ color: theme.textMuted }}>Usuário</th>
                    <th className="text-left px-3 py-2 text-xs font-semibold" style={{ color: theme.textMuted }}>Página</th>
                    <th className="text-left px-3 py-2 text-xs font-semibold" style={{ color: theme.textMuted }}>Status</th>
                    <th className="text-left px-3 py-2 text-xs font-semibold" style={{ color: theme.textMuted }}>Prioridade</th>
                    <th className="text-left px-3 py-2 text-xs font-semibold" style={{ color: theme.textMuted }}>Data</th>
                    <th className="text-left px-3 py-2 text-xs font-semibold" style={{ color: theme.textMuted }}>NPS</th>
                    <th className="text-left px-3 py-2 text-xs font-semibold" style={{ color: theme.textMuted }}>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredChamados.map((chamado) => {
                    const tipoInfo = tiposConfig[chamado.tipo];
                    const statusInfo = statusConfig[chamado.status];
                    const prioridadeInfo = prioridadeConfig[chamado.prioridade];
                    const TipoIcon = tipoInfo?.icon || MessageCircle;

                    return (
                      <tr key={chamado.id} className="border-b hover:bg-opacity-50" style={{ borderColor: theme.cardBorder }}>
                        <td className="px-3 py-2">
                          <div className="flex items-center gap-2">
                            <TipoIcon className={`w-4 h-4 ${chamado.tipo === 'sugestao' ? 'text-yellow-600' : chamado.tipo === 'bug' ? 'text-red-600' : 'text-blue-600'}`} />
                            <span className="text-xs" style={{ color: theme.text }}>
                              {tipoInfo?.label}
                            </span>
                          </div>
                        </td>
                        <td className="px-3 py-2">
                          <span className="text-sm font-medium" style={{ color: theme.text }}>
                            {chamado.titulo}
                          </span>
                        </td>
                        <td className="px-3 py-2">
                          <div>
                            <p className="text-xs font-medium" style={{ color: theme.text }}>
                              {chamado.user_nome}
                            </p>
                            <p className="text-xs" style={{ color: theme.textMuted }}>
                              {chamado.user_email}
                            </p>
                          </div>
                        </td>
                        <td className="px-3 py-2">
                          <Badge variant="outline" className="text-xs">
                            {chamado.pagina}
                          </Badge>
                        </td>
                        <td className="px-3 py-2">
                          <Badge className={`${statusInfo?.color} text-white text-xs`}>
                            {statusInfo?.label}
                          </Badge>
                        </td>
                        <td className="px-3 py-2">
                          <Badge className={`${prioridadeInfo?.color} text-xs`}>
                            {prioridadeInfo?.label}
                          </Badge>
                        </td>
                        <td className="px-3 py-2">
                          <span className="text-xs" style={{ color: theme.text }}>
                            {chamado.created_date ? new Date(chamado.created_date).toLocaleDateString('pt-BR') : '-'}
                          </span>
                        </td>
                        <td className="px-3 py-2">
                          {chamado.nps_score !== null && chamado.nps_score !== undefined ? (
                            <div className="flex items-center gap-1">
                              <Star className={`w-3 h-3 ${chamado.nps_score >= 9 ? 'text-green-500' : chamado.nps_score >= 7 ? 'text-yellow-500' : 'text-red-500'}`} />
                              <span className="text-xs font-semibold" style={{ color: theme.text }}>
                                {chamado.nps_score}/10
                              </span>
                            </div>
                          ) : (
                            <span className="text-xs" style={{ color: theme.textMuted }}>-</span>
                          )}
                        </td>
                        <td className="px-3 py-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewDetails(chamado)}
                            style={{ borderColor: theme.inputBorder, color: theme.text }}
                            className="h-7"
                          >
                            <Eye className="w-3 h-3 mr-1" />
                            Ver
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {filteredChamados.length === 0 && (
                <div className="text-center py-12" style={{ color: theme.textMuted }}>
                  <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-20" />
                  <p>Nenhum chamado encontrado</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {showDetails && selectedChamado && (
          <Dialog open={showDetails} onOpenChange={setShowDetails}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}>
              <DialogHeader>
                <DialogTitle style={{ color: theme.text }}>
                  Detalhes do Chamado
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {React.createElement(tiposConfig[selectedChamado.tipo]?.icon || MessageCircle, {
                        className: `w-5 h-5 ${selectedChamado.tipo === 'sugestao' ? 'text-yellow-600' : selectedChamado.tipo === 'bug' ? 'text-red-600' : 'text-blue-600'}`
                      })}
                      <Badge className={`${tiposConfig[selectedChamado.tipo]?.color} text-white`}>
                        {tiposConfig[selectedChamado.tipo]?.label}
                      </Badge>
                      <Badge className={`${prioridadeConfig[selectedChamado.prioridade]?.color}`}>
                        {prioridadeConfig[selectedChamado.prioridade]?.label}
                      </Badge>
                    </div>
                    <h2 className="text-xl font-bold mb-2" style={{ color: theme.text }}>
                      {selectedChamado.titulo}
                    </h2>
                    <div className="text-sm space-y-1" style={{ color: theme.textMuted }}>
                      <p>📍 Página: <strong>{selectedChamado.pagina}</strong></p>
                      <p>👤 Usuário: <strong>{selectedChamado.user_nome}</strong> ({selectedChamado.user_email})</p>
                      <p>📅 Data: <strong>{new Date(selectedChamado.created_date).toLocaleString('pt-BR')}</strong></p>
                    </div>
                  </div>

                  <div className="w-48">
                    <Label className="text-xs mb-1 block" style={{ color: theme.textMuted }}>Status</Label>
                    <Select
                      value={selectedChamado.status}
                      onValueChange={(value) => handleUpdateStatus(selectedChamado.id, value)}
                    >
                      <SelectTrigger className="text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(statusConfig).map(([key, config]) => (
                          <SelectItem key={key} value={key}>
                            {config.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label className="font-semibold mb-2 block" style={{ color: theme.text }}>
                    Descrição
                  </Label>
                  <div className="p-4 rounded-lg border whitespace-pre-wrap" style={{ backgroundColor: isDark ? '#0f172a' : '#f8fafc', borderColor: theme.cardBorder, color: theme.text }}>
                    {selectedChamado.descricao}
                  </div>
                </div>

                {selectedChamado.screenshot_url && (
                  <div>
                    <Label className="font-semibold mb-2 block" style={{ color: theme.text }}>
                      Captura de Tela
                    </Label>
                    <img
                      src={selectedChamado.screenshot_url}
                      alt="Screenshot"
                      className="max-w-full rounded-lg border"
                      style={{ borderColor: theme.cardBorder }}
                    />
                  </div>
                )}

                <div>
                  <Label className="font-semibold mb-2 block" style={{ color: theme.text }}>
                    Resposta do Administrador
                  </Label>
                  <Textarea
                    placeholder="Digite sua resposta ao usuário..."
                    value={respostaAdmin}
                    onChange={(e) => setRespostaAdmin(e.target.value)}
                    rows={4}
                    style={{ backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.text }}
                  />
                  <Button
                    onClick={handleSalvarResposta}
                    disabled={!respostaAdmin.trim() || salvandoResposta}
                    className="mt-2 bg-blue-600 hover:bg-blue-700"
                    size="sm"
                  >
                    {salvandoResposta ? "Salvando..." : "Salvar Resposta"}
                  </Button>
                </div>

                {selectedChamado.nps_score !== null && selectedChamado.nps_score !== undefined && (
                  <div className="border rounded-lg p-4" style={{ borderColor: theme.cardBorder, backgroundColor: isDark ? '#0f172a' : '#f0fdf4' }}>
                    <Label className="font-semibold mb-2 block flex items-center gap-2" style={{ color: theme.text }}>
                      <Star className="w-4 h-4 text-yellow-500" />
                      Avaliação NPS
                    </Label>
                    <div className="flex items-center gap-3">
                      <div className="text-3xl font-bold" style={{ 
                        color: selectedChamado.nps_score >= 9 ? '#10b981' : selectedChamado.nps_score >= 7 ? '#f59e0b' : '#ef4444'
                      }}>
                        {selectedChamado.nps_score}/10
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium" style={{ color: theme.text }}>
                          {selectedChamado.nps_score >= 9 ? "😊 Muito Satisfeito" : 
                           selectedChamado.nps_score >= 7 ? "😐 Satisfeito" : "😞 Insatisfeito"}
                        </p>
                        {selectedChamado.nps_comentario && (
                          <p className="text-xs mt-1 italic" style={{ color: theme.textMuted }}>
                            "{selectedChamado.nps_comentario}"
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setShowDetails(false)}
                  style={{ borderColor: theme.border, color: theme.text }}
                >
                  Fechar
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}

        {showNPS && chamadoParaNPS && (
          <NPSModal
            open={showNPS}
            onClose={() => {
              setShowNPS(false);
              setChamadoParaNPS(null);
              loadData();
            }}
            chamado={chamadoParaNPS}
          />
        )}
      </div>
    </div>
  );
}