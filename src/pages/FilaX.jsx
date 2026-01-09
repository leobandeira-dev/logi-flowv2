import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Truck, Plus, RefreshCw, Settings, Search, X, Trash2, Edit, Clock } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export default function FilaX() {
  const [isDark, setIsDark] = useState(false);
  const [loading, setLoading] = useState(true);
  const [fila, setFila] = useState([]);
  const [tiposFila, setTiposFila] = useState([]);
  const [motoristas, setMotoristas] = useState([]);
  const [veiculos, setVeiculos] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showTiposModal, setShowTiposModal] = useState(false);
  const [searchMotorista, setSearchMotorista] = useState("");
  const [searchPlaca, setSearchPlaca] = useState("");
  const [filteredMotoristas, setFilteredMotoristas] = useState([]);
  const [filteredVeiculos, setFilteredVeiculos] = useState([]);
  const [editingTipo, setEditingTipo] = useState(null);
  const [novoTipo, setNovoTipo] = useState({ nome: "", cor: "#3b82f6" });

  const [formData, setFormData] = useState({
    motorista_id: "",
    motorista_nome: "",
    motorista_cpf: "",
    motorista_telefone: "",
    cavalo_id: "",
    cavalo_placa: "",
    implemento1_id: "",
    implemento1_placa: "",
    implemento2_id: "",
    implemento2_placa: "",
    tipo_fila_id: "",
    tipo_veiculo: "",
    tipo_carroceria: "",
    localizacao_atual: "",
    observacoes: ""
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
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const user = await base44.auth.me();
      const [filaData, tiposData, motoristasData, veiculosData] = await Promise.all([
        base44.entities.FilaVeiculo.filter({ empresa_id: user.empresa_id, status: "aguardando" }, "posicao_fila"),
        base44.entities.TipoFilaVeiculo.filter({ empresa_id: user.empresa_id, ativo: true }, "ordem"),
        base44.entities.Motorista.list(),
        base44.entities.Veiculo.filter({ tipo: "cavalo" })
      ]);

      setFila(filaData);
      setTiposFila(tiposData);
      setMotoristas(motoristasData);
      setVeiculos(veiculosData);

      // Se não há tipos, criar os padrões
      if (tiposData.length === 0) {
        await criarTiposPadrao(user.empresa_id);
      }
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      toast.error("Erro ao carregar dados");
    } finally {
      setLoading(false);
    }
  };

  const criarTiposPadrao = async (empresaId) => {
    const tiposPadrao = [
      { nome: "Frota", cor: "#2563eb", ordem: 1 },
      { nome: "Acionista", cor: "#16a34a", ordem: 2 },
      { nome: "Agregado", cor: "#ea580c", ordem: 3 },
      { nome: "Terceiro", cor: "#6366f1", ordem: 4 }
    ];

    for (const tipo of tiposPadrao) {
      await base44.entities.TipoFilaVeiculo.create({
        ...tipo,
        empresa_id: empresaId,
        ativo: true
      });
    }

    await loadData();
    toast.success("Tipos de fila criados");
  };

  const handleSearchMotorista = (termo) => {
    setSearchMotorista(termo);
    if (!termo.trim()) {
      setFilteredMotoristas([]);
      return;
    }

    const resultados = motoristas.filter(m =>
      m.nome?.toLowerCase().includes(termo.toLowerCase()) ||
      m.cpf?.includes(termo) ||
      m.celular?.includes(termo)
    );
    setFilteredMotoristas(resultados);
  };

  const handleSearchPlaca = (termo) => {
    setSearchPlaca(termo);
    if (!termo.trim()) {
      setFilteredVeiculos([]);
      return;
    }

    const resultados = veiculos.filter(v =>
      v.placa?.toLowerCase().includes(termo.toLowerCase())
    );
    setFilteredVeiculos(resultados);
  };

  const handleSelecionarMotorista = (motorista) => {
    setFormData(prev => ({
      ...prev,
      motorista_id: motorista.id,
      motorista_nome: motorista.nome,
      motorista_cpf: motorista.cpf,
      motorista_telefone: motorista.celular,
      cavalo_id: motorista.cavalo_id || "",
      implemento1_id: motorista.implemento1_id || "",
      implemento2_id: motorista.implemento2_id || ""
    }));

    // Buscar placas dos veículos vinculados
    if (motorista.cavalo_id) {
      const cavalo = veiculos.find(v => v.id === motorista.cavalo_id);
      if (cavalo) {
        setFormData(prev => ({ ...prev, cavalo_placa: cavalo.placa }));
      }
    }

    setSearchMotorista("");
    setFilteredMotoristas([]);
    toast.success("Motorista selecionado");
  };

  const handleSelecionarVeiculo = (veiculo) => {
    setFormData(prev => ({
      ...prev,
      cavalo_id: veiculo.id,
      cavalo_placa: veiculo.placa,
      tipo_veiculo: veiculo.tipo,
      tipo_carroceria: veiculo.carroceria
    }));
    setSearchPlaca("");
    setFilteredVeiculos([]);
    toast.success("Veículo selecionado");
  };

  const handleAdicionarFila = async (e) => {
    e.preventDefault();

    if (!formData.motorista_nome || !formData.cavalo_placa || !formData.tipo_fila_id) {
      toast.error("Preencha motorista, placa e tipo de fila");
      return;
    }

    try {
      const user = await base44.auth.me();
      const tipoSelecionado = tiposFila.find(t => t.id === formData.tipo_fila_id);
      
      // Calcular próxima posição na fila
      const proximaPosicao = fila.length + 1;

      await base44.entities.FilaVeiculo.create({
        empresa_id: user.empresa_id,
        ...formData,
        tipo_fila_nome: tipoSelecionado?.nome,
        status: "aguardando",
        posicao_fila: proximaPosicao,
        data_entrada_fila: new Date().toISOString()
      });

      toast.success("Veículo adicionado à fila!");
      setShowAddModal(false);
      setFormData({
        motorista_id: "",
        motorista_nome: "",
        motorista_cpf: "",
        motorista_telefone: "",
        cavalo_id: "",
        cavalo_placa: "",
        implemento1_id: "",
        implemento1_placa: "",
        implemento2_id: "",
        implemento2_placa: "",
        tipo_fila_id: "",
        tipo_veiculo: "",
        tipo_carroceria: "",
        localizacao_atual: "",
        observacoes: ""
      });
      loadData();
    } catch (error) {
      console.error("Erro ao adicionar à fila:", error);
      toast.error("Erro ao adicionar veículo");
    }
  };

  const handleRemoverDaFila = async (id) => {
    if (!confirm("Remover este veículo da fila?")) return;

    try {
      await base44.entities.FilaVeiculo.delete(id);
      toast.success("Veículo removido da fila");
      loadData();
    } catch (error) {
      console.error("Erro ao remover:", error);
      toast.error("Erro ao remover veículo");
    }
  };

  const handleSalvarTipo = async (e) => {
    e.preventDefault();

    if (!novoTipo.nome) {
      toast.error("Nome do tipo é obrigatório");
      return;
    }

    try {
      const user = await base44.auth.me();
      
      if (editingTipo) {
        await base44.entities.TipoFilaVeiculo.update(editingTipo.id, novoTipo);
        toast.success("Tipo atualizado");
      } else {
        const proximaOrdem = tiposFila.length + 1;
        await base44.entities.TipoFilaVeiculo.create({
          ...novoTipo,
          empresa_id: user.empresa_id,
          ordem: proximaOrdem,
          ativo: true
        });
        toast.success("Tipo criado");
      }

      setNovoTipo({ nome: "", cor: "#3b82f6" });
      setEditingTipo(null);
      loadData();
    } catch (error) {
      console.error("Erro ao salvar tipo:", error);
      toast.error("Erro ao salvar tipo");
    }
  };

  const handleExcluirTipo = async (id) => {
    if (!confirm("Excluir este tipo de fila?")) return;

    try {
      await base44.entities.TipoFilaVeiculo.delete(id);
      toast.success("Tipo excluído");
      loadData();
    } catch (error) {
      console.error("Erro ao excluir tipo:", error);
      toast.error("Erro ao excluir tipo");
    }
  };

  const calcularTempoNaFila = (dataEntrada) => {
    if (!dataEntrada) return "-";
    const agora = new Date();
    const entrada = new Date(dataEntrada);
    const diffMs = agora - entrada;
    const diffHoras = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutos = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    if (diffHoras > 0) {
      return `${diffHoras}h ${diffMinutos}min`;
    }
    return `${diffMinutos}min`;
  };

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

  return (
    <div className="p-6 min-h-screen" style={{ backgroundColor: theme.bg }}>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold mb-1" style={{ color: theme.text }}>Fila X</h1>
            <p className="text-sm" style={{ color: theme.textMuted }}>
              Gerenciamento de fila de veículos disponíveis
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setShowTiposModal(true)}
              style={{ borderColor: theme.cardBorder, color: theme.text }}
            >
              <Settings className="w-4 h-4 mr-2" />
              Gerenciar Tipos
            </Button>
            <Button
              variant="outline"
              onClick={loadData}
              style={{ borderColor: theme.cardBorder, color: theme.text }}
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
            <Button
              onClick={() => setShowAddModal(true)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Adicionar à Fila
            </Button>
          </div>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs" style={{ color: theme.textMuted }}>Total na Fila</p>
                  <p className="text-2xl font-bold" style={{ color: theme.text }}>{fila.length}</p>
                </div>
                <Truck className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          {tiposFila.map(tipo => {
            const count = fila.filter(v => v.tipo_fila_id === tipo.id).length;
            return (
              <Card key={tipo.id} style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs" style={{ color: theme.textMuted }}>{tipo.nome}</p>
                      <p className="text-2xl font-bold" style={{ color: tipo.cor }}>{count}</p>
                    </div>
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: tipo.cor }} />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Fila de Veículos */}
        <Card style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}>
          <CardHeader>
            <CardTitle style={{ color: theme.text }}>Veículos Aguardando</CardTitle>
          </CardHeader>
          <CardContent>
            {fila.length === 0 ? (
              <div className="text-center py-12">
                <Truck className="w-16 h-16 mx-auto mb-4 opacity-20" />
                <p style={{ color: theme.textMuted }}>Nenhum veículo na fila</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b" style={{ borderColor: theme.cardBorder }}>
                      <th className="text-left p-3 text-xs font-semibold" style={{ color: theme.textMuted }}>Posição</th>
                      <th className="text-left p-3 text-xs font-semibold" style={{ color: theme.textMuted }}>Tipo</th>
                      <th className="text-left p-3 text-xs font-semibold" style={{ color: theme.textMuted }}>Motorista</th>
                      <th className="text-left p-3 text-xs font-semibold" style={{ color: theme.textMuted }}>CPF</th>
                      <th className="text-left p-3 text-xs font-semibold" style={{ color: theme.textMuted }}>Telefone</th>
                      <th className="text-left p-3 text-xs font-semibold" style={{ color: theme.textMuted }}>Cavalo</th>
                      <th className="text-left p-3 text-xs font-semibold" style={{ color: theme.textMuted }}>Implementos</th>
                      <th className="text-left p-3 text-xs font-semibold" style={{ color: theme.textMuted }}>Tipo Veículo</th>
                      <th className="text-left p-3 text-xs font-semibold" style={{ color: theme.textMuted }}>Localização</th>
                      <th className="text-left p-3 text-xs font-semibold" style={{ color: theme.textMuted }}>Tempo na Fila</th>
                      <th className="text-left p-3 text-xs font-semibold" style={{ color: theme.textMuted }}>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {fila.map((item, index) => {
                      const tipo = tiposFila.find(t => t.id === item.tipo_fila_id);
                      return (
                        <tr key={item.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800" style={{ borderColor: theme.cardBorder }}>
                          <td className="p-3">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                                <span className="font-bold text-sm text-blue-700 dark:text-blue-300">
                                  {item.posicao_fila || index + 1}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="p-3">
                            <span
                              className="px-2 py-1 rounded text-xs font-semibold text-white"
                              style={{ backgroundColor: tipo?.cor || '#6b7280' }}
                            >
                              {item.tipo_fila_nome}
                            </span>
                          </td>
                          <td className="p-3">
                            <p className="text-sm font-semibold" style={{ color: theme.text }}>{item.motorista_nome}</p>
                          </td>
                          <td className="p-3">
                            <p className="text-xs font-mono" style={{ color: theme.textMuted }}>{item.motorista_cpf}</p>
                          </td>
                          <td className="p-3">
                            <p className="text-xs" style={{ color: theme.text }}>{item.motorista_telefone}</p>
                          </td>
                          <td className="p-3">
                            <p className="text-sm font-mono font-semibold" style={{ color: theme.text }}>{item.cavalo_placa}</p>
                          </td>
                          <td className="p-3">
                            <div className="text-xs space-y-0.5">
                              {item.implemento1_placa && (
                                <p className="font-mono" style={{ color: theme.text }}>{item.implemento1_placa}</p>
                              )}
                              {item.implemento2_placa && (
                                <p className="font-mono" style={{ color: theme.text }}>{item.implemento2_placa}</p>
                              )}
                              {!item.implemento1_placa && !item.implemento2_placa && (
                                <p style={{ color: theme.textMuted }}>-</p>
                              )}
                            </div>
                          </td>
                          <td className="p-3">
                            <p className="text-xs" style={{ color: theme.text }}>{item.tipo_veiculo || "-"}</p>
                            {item.tipo_carroceria && (
                              <p className="text-xs" style={{ color: theme.textMuted }}>{item.tipo_carroceria}</p>
                            )}
                          </td>
                          <td className="p-3">
                            <p className="text-xs" style={{ color: theme.text }}>{item.localizacao_atual || "-"}</p>
                          </td>
                          <td className="p-3">
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3 text-orange-600" />
                              <span className="text-xs font-semibold text-orange-600">
                                {calcularTempoNaFila(item.data_entrada_fila)}
                              </span>
                            </div>
                          </td>
                          <td className="p-3">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoverDaFila(item.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Modal Adicionar Veículo */}
        <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
          <DialogContent className="max-w-3xl" style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}>
            <DialogHeader>
              <DialogTitle style={{ color: theme.text }}>Adicionar Veículo à Fila</DialogTitle>
            </DialogHeader>

            <form onSubmit={handleAdicionarFila} className="space-y-4">
              {/* Buscar Motorista */}
              <div>
                <Label style={{ color: theme.text }}>Buscar Motorista *</Label>
                <div className="relative">
                  <Input
                    value={searchMotorista}
                    onChange={(e) => handleSearchMotorista(e.target.value)}
                    placeholder="Nome, CPF ou telefone..."
                    className="pr-10"
                    style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder, color: theme.text }}
                  />
                  <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2" style={{ color: theme.textMuted }} />
                </div>
                
                {filteredMotoristas.length > 0 && (
                  <div className="border rounded-lg mt-2 max-h-48 overflow-y-auto" style={{ borderColor: theme.cardBorder, backgroundColor: theme.cardBg }}>
                    {filteredMotoristas.map(m => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => handleSelecionarMotorista(m)}
                        className="w-full text-left p-3 hover:bg-gray-100 dark:hover:bg-gray-800 border-b"
                        style={{ borderColor: theme.cardBorder }}
                      >
                        <p className="font-semibold text-sm" style={{ color: theme.text }}>{m.nome}</p>
                        <p className="text-xs" style={{ color: theme.textMuted }}>CPF: {m.cpf} | {m.celular}</p>
                      </button>
                    ))}
                  </div>
                )}

                {formData.motorista_nome && (
                  <div className="mt-2 p-2 bg-green-50 dark:bg-green-900/20 rounded border" style={{ borderColor: '#16a34a' }}>
                    <p className="text-sm font-semibold text-green-700 dark:text-green-300">
                      ✓ {formData.motorista_nome}
                    </p>
                  </div>
                )}
              </div>

              {/* Dados Manuais do Motorista (se não encontrado) */}
              {!formData.motorista_id && (
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <Label style={{ color: theme.text }}>Nome Motorista *</Label>
                    <Input
                      value={formData.motorista_nome}
                      onChange={(e) => setFormData(prev => ({ ...prev, motorista_nome: e.target.value }))}
                      placeholder="Nome completo"
                      style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder, color: theme.text }}
                    />
                  </div>
                  <div>
                    <Label style={{ color: theme.text }}>CPF</Label>
                    <Input
                      value={formData.motorista_cpf}
                      onChange={(e) => setFormData(prev => ({ ...prev, motorista_cpf: e.target.value }))}
                      placeholder="000.000.000-00"
                      style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder, color: theme.text }}
                    />
                  </div>
                  <div>
                    <Label style={{ color: theme.text }}>Telefone</Label>
                    <Input
                      value={formData.motorista_telefone}
                      onChange={(e) => setFormData(prev => ({ ...prev, motorista_telefone: e.target.value }))}
                      placeholder="(00) 00000-0000"
                      style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder, color: theme.text }}
                    />
                  </div>
                </div>
              )}

              {/* Buscar Placa */}
              <div>
                <Label style={{ color: theme.text }}>Buscar Placa do Cavalo *</Label>
                <div className="relative">
                  <Input
                    value={searchPlaca}
                    onChange={(e) => handleSearchPlaca(e.target.value)}
                    placeholder="ABC1234..."
                    className="pr-10"
                    style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder, color: theme.text }}
                  />
                  <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2" style={{ color: theme.textMuted }} />
                </div>

                {filteredVeiculos.length > 0 && (
                  <div className="border rounded-lg mt-2 max-h-48 overflow-y-auto" style={{ borderColor: theme.cardBorder, backgroundColor: theme.cardBg }}>
                    {filteredVeiculos.map(v => (
                      <button
                        key={v.id}
                        type="button"
                        onClick={() => handleSelecionarVeiculo(v)}
                        className="w-full text-left p-3 hover:bg-gray-100 dark:hover:bg-gray-800 border-b"
                        style={{ borderColor: theme.cardBorder }}
                      >
                        <p className="font-semibold text-sm font-mono" style={{ color: theme.text }}>{v.placa}</p>
                        <p className="text-xs" style={{ color: theme.textMuted }}>{v.marca} {v.modelo} | {v.tipo}</p>
                      </button>
                    ))}
                  </div>
                )}

                {formData.cavalo_placa && (
                  <div className="mt-2 p-2 bg-green-50 dark:bg-green-900/20 rounded border" style={{ borderColor: '#16a34a' }}>
                    <p className="text-sm font-semibold font-mono text-green-700 dark:text-green-300">
                      ✓ {formData.cavalo_placa}
                    </p>
                  </div>
                )}
              </div>

              {/* Placa Manual (se não encontrado) */}
              {!formData.cavalo_id && (
                <div>
                  <Label style={{ color: theme.text }}>Placa do Cavalo (Manual) *</Label>
                  <Input
                    value={formData.cavalo_placa}
                    onChange={(e) => setFormData(prev => ({ ...prev, cavalo_placa: e.target.value.toUpperCase() }))}
                    placeholder="ABC1234"
                    style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder, color: theme.text }}
                  />
                </div>
              )}

              {/* Implementos */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label style={{ color: theme.text }}>Placa Implemento 1</Label>
                  <Input
                    value={formData.implemento1_placa}
                    onChange={(e) => setFormData(prev => ({ ...prev, implemento1_placa: e.target.value.toUpperCase() }))}
                    placeholder="DEF5678"
                    style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder, color: theme.text }}
                  />
                </div>
                <div>
                  <Label style={{ color: theme.text }}>Placa Implemento 2</Label>
                  <Input
                    value={formData.implemento2_placa}
                    onChange={(e) => setFormData(prev => ({ ...prev, implemento2_placa: e.target.value.toUpperCase() }))}
                    placeholder="GHI9012"
                    style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder, color: theme.text }}
                  />
                </div>
              </div>

              {/* Tipo de Fila e Características */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label style={{ color: theme.text }}>Tipo de Fila *</Label>
                  <Select
                    value={formData.tipo_fila_id}
                    onValueChange={(value) => {
                      const tipo = tiposFila.find(t => t.id === value);
                      setFormData(prev => ({ ...prev, tipo_fila_id: value, tipo_fila_nome: tipo?.nome }));
                    }}
                  >
                    <SelectTrigger style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder, color: theme.text }}>
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      {tiposFila.map(tipo => (
                        <SelectItem key={tipo.id} value={tipo.id}>
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: tipo.cor }} />
                            {tipo.nome}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label style={{ color: theme.text }}>Tipo Veículo</Label>
                  <Select
                    value={formData.tipo_veiculo}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, tipo_veiculo: value }))}
                  >
                    <SelectTrigger style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder, color: theme.text }}>
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="RODOTREM">RODOTREM</SelectItem>
                      <SelectItem value="TRUCK">TRUCK</SelectItem>
                      <SelectItem value="CARRETA 5EIXOS">CARRETA 5EIXOS</SelectItem>
                      <SelectItem value="CARRETA 6EIXOS">CARRETA 6EIXOS</SelectItem>
                      <SelectItem value="CARRETA 7EIXOS">CARRETA 7EIXOS</SelectItem>
                      <SelectItem value="BITREM">BITREM</SelectItem>
                      <SelectItem value="BI-TRUCK">BI-TRUCK</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label style={{ color: theme.text }}>Tipo Carroceria</Label>
                  <Select
                    value={formData.tipo_carroceria}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, tipo_carroceria: value }))}
                  >
                    <SelectTrigger style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder, color: theme.text }}>
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SIDER">SIDER</SelectItem>
                      <SelectItem value="PRANCHA">PRANCHA</SelectItem>
                      <SelectItem value="GRADE BAIXA">GRADE BAIXA</SelectItem>
                      <SelectItem value="GRADE ALTA">GRADE ALTA</SelectItem>
                      <SelectItem value="BAU">BAU</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Localização e Observações */}
              <div>
                <Label style={{ color: theme.text }}>Localização Atual</Label>
                <Input
                  value={formData.localizacao_atual}
                  onChange={(e) => setFormData(prev => ({ ...prev, localizacao_atual: e.target.value }))}
                  placeholder="Ex: Pátio Central, Filial SP..."
                  style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder, color: theme.text }}
                />
              </div>

              <div>
                <Label style={{ color: theme.text }}>Observações</Label>
                <Textarea
                  value={formData.observacoes}
                  onChange={(e) => setFormData(prev => ({ ...prev, observacoes: e.target.value }))}
                  placeholder="Observações adicionais..."
                  rows={2}
                  style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder, color: theme.text }}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowAddModal(false)}
                  style={{ borderColor: theme.cardBorder, color: theme.text }}
                >
                  Cancelar
                </Button>
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                  Adicionar à Fila
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Modal Gerenciar Tipos */}
        <Dialog open={showTiposModal} onOpenChange={setShowTiposModal}>
          <DialogContent style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}>
            <DialogHeader>
              <DialogTitle style={{ color: theme.text }}>Gerenciar Tipos de Fila</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              {/* Form Adicionar/Editar Tipo */}
              <form onSubmit={handleSalvarTipo} className="border rounded-lg p-3" style={{ borderColor: theme.cardBorder }}>
                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-2">
                    <Label style={{ color: theme.text }}>Nome do Tipo</Label>
                    <Input
                      value={novoTipo.nome}
                      onChange={(e) => setNovoTipo(prev => ({ ...prev, nome: e.target.value }))}
                      placeholder="Ex: Frota Própria"
                      style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder, color: theme.text }}
                    />
                  </div>
                  <div>
                    <Label style={{ color: theme.text }}>Cor</Label>
                    <Input
                      type="color"
                      value={novoTipo.cor}
                      onChange={(e) => setNovoTipo(prev => ({ ...prev, cor: e.target.value }))}
                      className="h-10"
                    />
                  </div>
                </div>
                <div className="flex gap-2 mt-3">
                  <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                    {editingTipo ? "Atualizar" : "Adicionar"}
                  </Button>
                  {editingTipo && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setEditingTipo(null);
                        setNovoTipo({ nome: "", cor: "#3b82f6" });
                      }}
                    >
                      Cancelar
                    </Button>
                  )}
                </div>
              </form>

              {/* Lista de Tipos */}
              <div className="space-y-2">
                <Label style={{ color: theme.text }}>Tipos Cadastrados</Label>
                {tiposFila.map(tipo => (
                  <div
                    key={tipo.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                    style={{ borderColor: theme.cardBorder }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 rounded-full" style={{ backgroundColor: tipo.cor }} />
                      <span className="font-semibold" style={{ color: theme.text }}>{tipo.nome}</span>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setEditingTipo(tipo);
                          setNovoTipo({ nome: tipo.nome, cor: tipo.cor });
                        }}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleExcluirTipo(tipo.id)}
                        className="text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}