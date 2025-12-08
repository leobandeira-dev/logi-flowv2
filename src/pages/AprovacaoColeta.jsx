import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Download, RefreshCw, Search, Eye } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export default function AprovacaoColeta() {
  const [user, setUser] = useState(null);
  const [coletas, setColetas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDark, setIsDark] = useState(false);
  const [selectedColeta, setSelectedColeta] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [motivo, setMotivo] = useState("");
  const [showMotivoDialog, setShowMotivoDialog] = useState(false);
  const [actionType, setActionType] = useState(null);
  const [actionColeta, setActionColeta] = useState(null);

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
      
      if (currentUser.tipo_perfil !== "cliente" && currentUser.role !== "admin") {
        toast.error("Acesso negado. Esta página é apenas para clientes aprovadores.");
        return;
      }
      
      setUser(currentUser);
      
      // Carregar coletas
      const ordensData = await base44.entities.OrdemDeCarregamento.list("-data_solicitacao");
      
      let coletasPendentes;
      if (currentUser.role === "admin") {
        // Admin vê TODAS as coletas pendentes
        coletasPendentes = ordensData.filter(o => o.tipo_registro === "coleta_solicitada");
      } else {
        // Cliente vê apenas coletas onde seu CNPJ é o destinatário
        coletasPendentes = ordensData.filter(o => 
          o.tipo_registro === "coleta_solicitada" &&
          o.destinatario_cnpj === currentUser.cnpj_associado
        );
      }
      
      setColetas(coletasPendentes);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAprovar = async (coleta) => {
    setActionType("aprovar");
    setActionColeta(coleta);
    setShowMotivoDialog(true);
  };

  const handleReprovar = async (coleta) => {
    setActionType("reprovar");
    setActionColeta(coleta);
    setShowMotivoDialog(true);
  };

  const confirmAction = async () => {
    if (!actionColeta) return;

    try {
      const updateData = {
        tipo_registro: actionType === "aprovar" ? "coleta_aprovada" : "coleta_reprovada",
        status: actionType === "aprovar" ? "aprovada_coleta" : "reprovada_coleta",
        aprovador_id: user.id,
        observacoes_internas: motivo || (actionType === "aprovar" ? "Coleta aprovada" : "Coleta reprovada")
      };

      await base44.entities.OrdemDeCarregamento.update(actionColeta.id, updateData);
      
      toast.success(actionType === "aprovar" ? "Coleta aprovada com sucesso!" : "Coleta reprovada");
      setShowMotivoDialog(false);
      setMotivo("");
      setActionType(null);
      setActionColeta(null);
      loadData();
    } catch (error) {
      console.error("Erro ao processar coleta:", error);
      toast.error("Erro ao processar coleta");
    }
  };

  const filteredColetas = coletas.filter(coleta => {
    if (!searchTerm) return true;
    
    const term = searchTerm.toLowerCase();
    return (
      coleta.numero_coleta?.toLowerCase().includes(term) ||
      coleta.cliente?.toLowerCase().includes(term) ||
      coleta.produto?.toLowerCase().includes(term) ||
      coleta.notas_fiscais?.toLowerCase().includes(term)
    );
  });

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
          <div className="w-6 h-6 border-4 border-green-600 border-t-transparent rounded-full animate-spin" />
          <p style={{ color: theme.textMuted }}>Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user || (user.tipo_perfil !== "cliente" && user.role !== "admin")) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: theme.bg }}>
        <Card style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}>
          <CardContent className="p-8 text-center">
            <p style={{ color: theme.text }}>Acesso negado. Esta página é apenas para clientes aprovadores.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 min-h-screen" style={{ backgroundColor: theme.bg }}>
      <div className="max-w-[1800px] mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold mb-1" style={{ color: theme.text }}>Aprovação de Coletas</h1>
            <p className="text-sm" style={{ color: theme.textMuted }}>Aprove ou reprove solicitações de coleta</p>
          </div>
          <div className="flex gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: theme.textMuted }} />
              <Input
                placeholder="Buscar coletas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-64"
                style={{ backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.text }}
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={loadData}
              style={{ borderColor: theme.cardBorder, color: theme.text }}
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <Card style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b" style={{ borderColor: theme.cardBorder, backgroundColor: isDark ? '#1e293b' : '#f9fafb' }}>
                    <th className="text-left p-3 text-sm font-semibold" style={{ color: theme.textMuted }}>Coleta</th>
                    <th className="text-left p-3 text-sm font-semibold" style={{ color: theme.textMuted }}>Status</th>
                    <th className="text-left p-3 text-sm font-semibold" style={{ color: theme.textMuted }}>Pedido</th>
                    <th className="text-left p-3 text-sm font-semibold" style={{ color: theme.textMuted }}>NF</th>
                    <th className="text-left p-3 text-sm font-semibold" style={{ color: theme.textMuted }}>Data Solicitação</th>
                    <th className="text-left p-3 text-sm font-semibold" style={{ color: theme.textMuted }}>Remetente</th>
                    <th className="text-left p-3 text-sm font-semibold" style={{ color: theme.textMuted }}>Destinatário</th>
                    <th className="text-left p-3 text-sm font-semibold" style={{ color: theme.textMuted }}>Cidade Remetente</th>
                    <th className="text-left p-3 text-sm font-semibold" style={{ color: theme.textMuted }}>Cidade Destinatário</th>
                    <th className="text-left p-3 text-sm font-semibold" style={{ color: theme.textMuted }}>Valor da NF</th>
                    <th className="text-left p-3 text-sm font-semibold" style={{ color: theme.textMuted }}>Peso da NF</th>
                    <th className="text-left p-3 text-sm font-semibold" style={{ color: theme.textMuted }}>Volumes</th>
                    <th className="text-left p-3 text-sm font-semibold" style={{ color: theme.textMuted }}>Tipo</th>
                    <th className="text-left p-3 text-sm font-semibold" style={{ color: theme.textMuted }}>DANFE/NFe</th>
                    <th className="text-center p-3 text-sm font-semibold" style={{ color: theme.textMuted }}>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredColetas.map((coleta) => (
                    <tr key={coleta.id} className="border-b hover:bg-opacity-50" style={{ borderColor: theme.cardBorder }}>
                      <td className="p-3">
                        <span className="text-sm font-mono font-semibold text-green-600">
                          {coleta.numero_coleta || `#${coleta.id.slice(-6)}`}
                        </span>
                      </td>
                      <td className="p-3">
                        <Badge className="bg-yellow-500 text-white text-xs">
                          Pendente
                        </Badge>
                      </td>
                      <td className="p-3">
                        <span className="text-sm" style={{ color: theme.text }}>{coleta.viagem_pedido || "-"}</span>
                      </td>
                      <td className="p-3">
                        <span className="text-sm" style={{ color: theme.text }}>{coleta.notas_fiscais || "-"}</span>
                      </td>
                      <td className="p-3">
                        <span className="text-sm" style={{ color: theme.textMuted }}>
                          {coleta.data_solicitacao ? new Date(coleta.data_solicitacao).toLocaleDateString('pt-BR') : "-"}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className="text-sm" style={{ color: theme.text }}>{coleta.cliente}</span>
                      </td>
                      <td className="p-3">
                        <span className="text-sm" style={{ color: theme.text }}>{coleta.destinatario}</span>
                      </td>
                      <td className="p-3">
                        <span className="text-sm" style={{ color: theme.text }}>{coleta.origem_cidade || "-"}</span>
                      </td>
                      <td className="p-3">
                        <span className="text-sm" style={{ color: theme.text }}>{coleta.destino_cidade || "-"}</span>
                      </td>
                      <td className="p-3">
                        <span className="text-sm font-semibold text-green-600">
                          {coleta.valor_nf ? `R$ ${coleta.valor_nf.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : "-"}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className="text-sm" style={{ color: theme.text }}>
                          {coleta.peso_nf ? `${coleta.peso_nf.toLocaleString()} kg` : "-"}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className="text-sm" style={{ color: theme.text }}>{coleta.volumes_nf || "-"}</span>
                      </td>
                      <td className="p-3">
                        <span className="text-sm" style={{ color: theme.text }}>{coleta.tipo_embalagem || "-"}</span>
                      </td>
                      <td className="p-3">
                        {coleta.danfe_nfe_url ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            asChild
                          >
                            <a href={coleta.danfe_nfe_url} target="_blank" rel="noopener noreferrer">
                              <Download className="w-4 h-4" />
                            </a>
                          </Button>
                        ) : (
                          <span className="text-xs" style={{ color: theme.textMuted }}>-</span>
                        )}
                      </td>
                      <td className="p-3">
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedColeta(coleta);
                              setShowDetails(true);
                            }}
                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleAprovar(coleta)}
                            className="bg-green-600 hover:bg-green-700 text-white"
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Aprovar
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleReprovar(coleta)}
                            className="bg-red-600 hover:bg-red-700 text-white"
                          >
                            <XCircle className="w-4 h-4 mr-1" />
                            Reprovar
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredColetas.length === 0 && (
                <div className="text-center py-12" style={{ color: theme.textMuted }}>
                  <CheckCircle className="w-12 h-12 mx-auto mb-3 opacity-20" />
                  <p>Nenhuma coleta pendente de aprovação</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Dialog de Motivo */}
      <Dialog open={showMotivoDialog} onOpenChange={setShowMotivoDialog}>
        <DialogContent style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}>
          <DialogHeader>
            <DialogTitle style={{ color: theme.text }}>
              {actionType === "aprovar" ? "Aprovar Coleta" : "Reprovar Coleta"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Observações {actionType === "reprovar" && "(obrigatório)"}</Label>
              <Textarea
                placeholder={actionType === "aprovar" ? "Observações sobre a aprovação (opcional)" : "Informe o motivo da reprovação"}
                value={motivo}
                onChange={(e) => setMotivo(e.target.value)}
                rows={4}
                style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder, color: theme.text }}
              />
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setShowMotivoDialog(false);
                  setMotivo("");
                  setActionType(null);
                  setActionColeta(null);
                }}
                style={{ borderColor: theme.cardBorder, color: theme.text }}
              >
                Cancelar
              </Button>
              <Button
                onClick={confirmAction}
                disabled={actionType === "reprovar" && !motivo.trim()}
                className={actionType === "aprovar" ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"}
              >
                {actionType === "aprovar" ? "Confirmar Aprovação" : "Confirmar Reprovação"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog de Detalhes */}
      {showDetails && selectedColeta && (
        <Dialog open={showDetails} onOpenChange={setShowDetails}>
          <DialogContent className="max-w-2xl" style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}>
            <DialogHeader>
              <DialogTitle style={{ color: theme.text }}>Detalhes da Coleta</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs" style={{ color: theme.textMuted }}>Número da Coleta</Label>
                  <p className="font-mono font-semibold text-green-600">{selectedColeta.numero_coleta}</p>
                </div>
                <div>
                  <Label className="text-xs" style={{ color: theme.textMuted }}>Data Solicitação</Label>
                  <p style={{ color: theme.text }}>
                    {selectedColeta.data_solicitacao ? new Date(selectedColeta.data_solicitacao).toLocaleString('pt-BR') : "-"}
                  </p>
                </div>
              </div>
              
              <div className="border-t pt-4" style={{ borderColor: theme.cardBorder }}>
                <h3 className="font-semibold mb-3" style={{ color: theme.text }}>Origem (Remetente)</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs" style={{ color: theme.textMuted }}>Nome</Label>
                    <p style={{ color: theme.text }}>{selectedColeta.cliente}</p>
                  </div>
                  <div>
                    <Label className="text-xs" style={{ color: theme.textMuted }}>CNPJ</Label>
                    <p style={{ color: theme.text }}>{selectedColeta.cliente_cnpj}</p>
                  </div>
                  <div>
                    <Label className="text-xs" style={{ color: theme.textMuted }}>Cidade</Label>
                    <p style={{ color: theme.text }}>{selectedColeta.origem_cidade || "-"}</p>
                  </div>
                  <div>
                    <Label className="text-xs" style={{ color: theme.textMuted }}>UF</Label>
                    <p style={{ color: theme.text }}>{selectedColeta.origem_uf || "-"}</p>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4" style={{ borderColor: theme.cardBorder }}>
                <h3 className="font-semibold mb-3" style={{ color: theme.text }}>Destino</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs" style={{ color: theme.textMuted }}>Nome</Label>
                    <p style={{ color: theme.text }}>{selectedColeta.destinatario}</p>
                  </div>
                  <div>
                    <Label className="text-xs" style={{ color: theme.textMuted }}>CNPJ</Label>
                    <p style={{ color: theme.text }}>{selectedColeta.destinatario_cnpj}</p>
                  </div>
                  <div>
                    <Label className="text-xs" style={{ color: theme.textMuted }}>Cidade</Label>
                    <p style={{ color: theme.text }}>{selectedColeta.destino_cidade || "-"}</p>
                  </div>
                  <div>
                    <Label className="text-xs" style={{ color: theme.textMuted }}>UF</Label>
                    <p style={{ color: theme.text }}>{selectedColeta.destino_uf || "-"}</p>
                  </div>
                  <div className="col-span-2">
                    <Label className="text-xs" style={{ color: theme.textMuted }}>Endereço</Label>
                    <p style={{ color: theme.text }}>{selectedColeta.destino_endereco || "-"}</p>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4" style={{ borderColor: theme.cardBorder }}>
                <h3 className="font-semibold mb-3" style={{ color: theme.text }}>Informações da Carga</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs" style={{ color: theme.textMuted }}>Produto</Label>
                    <p style={{ color: theme.text }}>{selectedColeta.produto}</p>
                  </div>
                  <div>
                    <Label className="text-xs" style={{ color: theme.textMuted }}>Tipo Embalagem</Label>
                    <p style={{ color: theme.text }}>{selectedColeta.tipo_embalagem || "-"}</p>
                  </div>
                  <div>
                    <Label className="text-xs" style={{ color: theme.textMuted }}>Peso NF</Label>
                    <p style={{ color: theme.text }}>
                      {selectedColeta.peso_nf ? `${selectedColeta.peso_nf.toLocaleString()} kg` : "-"}
                    </p>
                  </div>
                  <div>
                    <Label className="text-xs" style={{ color: theme.textMuted }}>Valor NF</Label>
                    <p className="font-semibold text-green-600">
                      {selectedColeta.valor_nf ? `R$ ${selectedColeta.valor_nf.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : "-"}
                    </p>
                  </div>
                  <div>
                    <Label className="text-xs" style={{ color: theme.textMuted }}>Volumes</Label>
                    <p style={{ color: theme.text }}>{selectedColeta.volumes_nf || "-"}</p>
                  </div>
                  <div>
                    <Label className="text-xs" style={{ color: theme.textMuted }}>Notas Fiscais</Label>
                    <p style={{ color: theme.text }}>{selectedColeta.notas_fiscais || "-"}</p>
                  </div>
                </div>
              </div>

              {selectedColeta.observacao_carga && (
                <div className="border-t pt-4" style={{ borderColor: theme.cardBorder }}>
                  <Label className="text-xs" style={{ color: theme.textMuted }}>Observações</Label>
                  <p className="text-sm mt-1" style={{ color: theme.text }}>{selectedColeta.observacao_carga}</p>
                </div>
              )}

              <div className="flex gap-3 pt-4 border-t" style={{ borderColor: theme.cardBorder }}>
                <Button
                  variant="outline"
                  onClick={() => setShowDetails(false)}
                  style={{ borderColor: theme.cardBorder, color: theme.text }}
                >
                  Fechar
                </Button>
                <Button
                  onClick={() => {
                    setShowDetails(false);
                    handleAprovar(selectedColeta);
                  }}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Aprovar
                </Button>
                <Button
                  onClick={() => {
                    setShowDetails(false);
                    handleReprovar(selectedColeta);
                  }}
                  className="bg-red-600 hover:bg-red-700"
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Reprovar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}