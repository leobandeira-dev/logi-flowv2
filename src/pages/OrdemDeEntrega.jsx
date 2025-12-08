import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Truck, Plus, RefreshCw, Search } from "lucide-react";
import { toast } from "sonner";

export default function OrdemDeEntrega() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [ordensEntrega, setOrdensEntrega] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [notasFiscais, setNotasFiscais] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [notasSelecionadas, setNotasSelecionadas] = useState([]);
  
  const [formData, setFormData] = useState({
    destino_cidade: "",
    destino_uf: "",
    destino_endereco: "",
    observacao_carga: "",
  });

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
    loadUserAndOrdens();
  }, []);

  const loadUserAndOrdens = async () => {
    setLoading(true);
    try {
      const currentUser = await base44.auth.me();
      
      if (currentUser.tipo_perfil !== "operador" && currentUser.role !== "admin") {
        toast.error("Acesso negado. Esta página é apenas para operadores.");
        return;
      }
      
      setUser(currentUser);
      
      const [ordensData, notasData] = await Promise.all([
        base44.entities.OrdemDeCarregamento.list("-data_solicitacao"),
        base44.entities.NotaFiscal.list()
      ]);
      
      const ordensEntregaData = ordensData.filter(o => o.tipo_registro === "ordem_entrega");
      setOrdensEntrega(ordensEntregaData);
      
      // Filtrar notas que estão prontas para expedição (separadas ou aguardando expedição)
      const notasProntasExpedicao = notasData.filter(
        n => n.status_nf === "separada" || n.status_nf === "aguardando_expedicao"
      );
      setNotasFiscais(notasProntasExpedicao);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleNotaSelecionada = (notaId) => {
    setNotasSelecionadas(prev => {
      if (prev.includes(notaId)) {
        return prev.filter(id => id !== notaId);
      } else {
        return [...prev, notaId];
      }
    });
  };

  const generateNumeroEntrega = () => {
    const year = new Date().getFullYear();
    const sequence = (ordensEntrega.length + 1).toString().padStart(5, '0');
    return `ENT-${year}-${sequence}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (notasSelecionadas.length === 0) {
      toast.error("Selecione ao menos uma nota fiscal para entrega");
      return;
    }

    if (!formData.destino_cidade || !formData.destino_uf) {
      toast.error("Preencha cidade e UF de destino");
      return;
    }

    setSaving(true);
    try {
      // Buscar as notas selecionadas
      const notasSelecionadasData = notasFiscais.filter(n => notasSelecionadas.includes(n.id));
      
      const pesoTotal = notasSelecionadasData.reduce((sum, nf) => sum + (nf.peso_total_nf || 0), 0);
      const valorTotal = notasSelecionadasData.reduce((sum, nf) => sum + (nf.valor_nota_fiscal || 0), 0);
      const volumesTotal = notasSelecionadasData.reduce((sum, nf) => sum + (nf.quantidade_total_volumes_nf || 0), 0);

      const ordemData = {
        tipo_ordem: "entrega",
        tipo_registro: "ordem_entrega",
        status: "aguardando_carregamento",
        numero_carga: generateNumeroEntrega(),
        empresa_id: user.empresa_id,
        
        cliente: "Diversos Destinatários",
        origem: "Armazém",
        origem_cidade: user.empresa_id ? "Sede" : "",
        
        destino: formData.destino_cidade,
        destino_cidade: formData.destino_cidade,
        destino_uf: formData.destino_uf,
        destino_endereco: formData.destino_endereco,
        
        produto: "Diversos",
        peso: pesoTotal,
        volumes: volumesTotal,
        peso_total_consolidado: pesoTotal,
        valor_total_consolidado: valorTotal,
        volumes_total_consolidado: volumesTotal,
        
        notas_fiscais_ids: notasSelecionadas,
        observacao_carga: formData.observacao_carga,
        data_solicitacao: new Date().toISOString(),
        meio_solicitacao: "sistema"
      };

      const novaOrdem = await base44.entities.OrdemDeCarregamento.create(ordemData);
      
      // Atualizar status das notas para "em_rota_entrega"
      for (const notaId of notasSelecionadas) {
        await base44.entities.NotaFiscal.update(notaId, {
          status_nf: "em_rota_entrega"
        });
      }
      
      toast.success("Ordem de entrega criada com sucesso!");
      setShowForm(false);
      setNotasSelecionadas([]);
      setFormData({
        destino_cidade: "",
        destino_uf: "",
        destino_endereco: "",
        observacao_carga: "",
      });
      loadUserAndOrdens();
    } catch (error) {
      console.error("Erro ao criar ordem de entrega:", error);
      toast.error("Erro ao criar ordem de entrega");
    } finally {
      setSaving(false);
    }
  };

  const filteredNotas = notasFiscais.filter(nota => 
    !searchTerm ||
    nota.numero_nota?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    nota.destinatario_razao_social?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    nota.destinatario_cidade?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
          <div className="w-6 h-6 border-4 border-cyan-600 border-t-transparent rounded-full animate-spin" />
          <p style={{ color: theme.textMuted }}>Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user || (user.tipo_perfil !== "operador" && user.role !== "admin")) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: theme.bg }}>
        <Card style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}>
          <CardContent className="p-8 text-center">
            <p style={{ color: theme.text }}>Acesso negado. Esta página é apenas para operadores.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 min-h-screen" style={{ backgroundColor: theme.bg }}>
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold mb-1" style={{ color: theme.text }}>Ordem de Entrega</h1>
            <p className="text-sm" style={{ color: theme.textMuted }}>Crie rotas de entrega para múltiplos destinos</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={loadUserAndOrdens}
              style={{ borderColor: theme.cardBorder, color: theme.text }}
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
            <Button
              onClick={() => setShowForm(true)}
              className="bg-cyan-600 hover:bg-cyan-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nova Ordem de Entrega
            </Button>
          </div>
        </div>

        {showForm && (
          <Card className="mb-6" style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}>
            <CardHeader>
              <CardTitle style={{ color: theme.text }}>Nova Ordem de Entrega</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                
                <div className="border rounded-lg p-4 space-y-3" style={{ borderColor: theme.cardBorder }}>
                  <Label className="text-base font-semibold" style={{ color: theme.text }}>
                    Destino da Entrega
                  </Label>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="col-span-2">
                      <Label className="text-xs" style={{ color: theme.textMuted }}>Cidade *</Label>
                      <Input
                        placeholder="Ex: São Paulo"
                        value={formData.destino_cidade}
                        onChange={(e) => handleChange("destino_cidade", e.target.value)}
                        required
                        style={{ backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.text }}
                      />
                    </div>
                    <div>
                      <Label className="text-xs" style={{ color: theme.textMuted }}>UF *</Label>
                      <Input
                        placeholder="SP"
                        maxLength={2}
                        value={formData.destino_uf}
                        onChange={(e) => handleChange("destino_uf", e.target.value.toUpperCase())}
                        required
                        style={{ backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.text }}
                      />
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs" style={{ color: theme.textMuted }}>Endereço / Região</Label>
                    <Input
                      placeholder="Informações adicionais sobre a região de entrega"
                      value={formData.destino_endereco}
                      onChange={(e) => handleChange("destino_endereco", e.target.value)}
                      style={{ backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.text }}
                    />
                  </div>
                </div>

                <div className="border rounded-lg p-4 space-y-3" style={{ borderColor: theme.cardBorder }}>
                  <div className="flex items-center justify-between">
                    <Label className="text-base font-semibold" style={{ color: theme.text }}>
                      Selecionar Notas Fiscais ({notasSelecionadas.length} selecionadas)
                    </Label>
                    <div className="relative w-64">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: theme.textMuted }} />
                      <Input
                        placeholder="Buscar notas..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 h-8 text-sm"
                        style={{ backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.text }}
                      />
                    </div>
                  </div>
                  
                  <div className="max-h-80 overflow-y-auto space-y-2">
                    {filteredNotas.map((nota) => (
                      <div 
                        key={nota.id} 
                        className="flex items-start gap-3 p-3 border rounded-lg cursor-pointer hover:bg-opacity-50"
                        style={{ borderColor: theme.cardBorder }}
                        onClick={() => toggleNotaSelecionada(nota.id)}
                      >
                        <Checkbox
                          checked={notasSelecionadas.includes(nota.id)}
                          onCheckedChange={() => toggleNotaSelecionada(nota.id)}
                        />
                        <div className="flex-1">
                          <p className="text-sm font-semibold" style={{ color: theme.text }}>
                            NF-e {nota.numero_nota}
                          </p>
                          <p className="text-xs" style={{ color: theme.textMuted }}>
                            {nota.destinatario_razao_social}
                          </p>
                          <p className="text-xs" style={{ color: theme.textMuted }}>
                            {nota.destinatario_cidade}/{nota.destinatario_uf} | 
                            {nota.quantidade_total_volumes_nf} volumes | 
                            {nota.peso_total_nf?.toLocaleString()} kg
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {filteredNotas.length === 0 && (
                    <div className="text-center py-8" style={{ color: theme.textMuted }}>
                      <Truck className="w-12 h-12 mx-auto mb-3 opacity-20" />
                      <p>Nenhuma nota fiscal disponível para entrega</p>
                    </div>
                  )}
                </div>

                <div>
                  <Label style={{ color: theme.text }}>Observações</Label>
                  <Textarea
                    placeholder="Informações adicionais sobre a entrega"
                    value={formData.observacao_carga}
                    onChange={(e) => handleChange("observacao_carga", e.target.value)}
                    rows={3}
                    style={{ backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.text }}
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowForm(false);
                      setNotasSelecionadas([]);
                    }}
                    style={{ borderColor: theme.cardBorder, color: theme.text }}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    disabled={saving || notasSelecionadas.length === 0}
                    className="bg-cyan-600 hover:bg-cyan-700"
                  >
                    {saving ? "Criando..." : "Criar Ordem de Entrega"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        <Card style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}>
          <CardHeader>
            <CardTitle style={{ color: theme.text }}>Ordens de Entrega</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b" style={{ borderColor: theme.cardBorder }}>
                    <th className="text-left p-3 text-sm font-semibold" style={{ color: theme.textMuted }}>Nº Entrega</th>
                    <th className="text-left p-3 text-sm font-semibold" style={{ color: theme.textMuted }}>Data</th>
                    <th className="text-left p-3 text-sm font-semibold" style={{ color: theme.textMuted }}>Destino</th>
                    <th className="text-left p-3 text-sm font-semibold" style={{ color: theme.textMuted }}>NFs</th>
                    <th className="text-left p-3 text-sm font-semibold" style={{ color: theme.textMuted }}>Volumes</th>
                    <th className="text-left p-3 text-sm font-semibold" style={{ color: theme.textMuted }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {ordensEntrega.map((ordem) => (
                    <tr key={ordem.id} className="border-b" style={{ borderColor: theme.cardBorder }}>
                      <td className="p-3">
                        <span className="text-sm font-mono font-semibold text-cyan-600">
                          {ordem.numero_carga}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className="text-sm" style={{ color: theme.textMuted }}>
                          {ordem.data_solicitacao ? new Date(ordem.data_solicitacao).toLocaleDateString('pt-BR') : "-"}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className="text-sm" style={{ color: theme.text }}>
                          {ordem.destino_cidade}/{ordem.destino_uf}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className="text-sm" style={{ color: theme.text }}>
                          {ordem.notas_fiscais_ids?.length || 0}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className="text-sm" style={{ color: theme.text }}>
                          {ordem.volumes_total_consolidado}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className="text-sm" style={{ color: theme.text }}>
                          {ordem.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {ordensEntrega.length === 0 && (
                <div className="text-center py-12" style={{ color: theme.textMuted }}>
                  <Truck className="w-12 h-12 mx-auto mb-3 opacity-20" />
                  <p>Nenhuma ordem de entrega criada ainda</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}