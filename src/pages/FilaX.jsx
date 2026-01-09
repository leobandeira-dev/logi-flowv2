import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Truck, Plus, RefreshCw, Settings, Search, X, Trash2, Edit, Clock, LayoutGrid, Table, GripVertical } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
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
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import FilaKanban from "../components/fila/FilaKanban";

export default function FilaX() {
  const [isDark, setIsDark] = useState(false);
  const [loading, setLoading] = useState(true);
  const [fila, setFila] = useState([]);
  const [tiposFila, setTiposFila] = useState([]);
  const [statusFila, setStatusFila] = useState([]);
  const [motoristas, setMotoristas] = useState([]);
  const [veiculos, setVeiculos] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showTiposModal, setShowTiposModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [searchMotorista, setSearchMotorista] = useState("");
  const [searchPlaca, setSearchPlaca] = useState("");
  const [filteredMotoristas, setFilteredMotoristas] = useState([]);
  const [filteredVeiculos, setFilteredVeiculos] = useState([]);
  const [editingTipo, setEditingTipo] = useState(null);
  const [novoTipo, setNovoTipo] = useState({ nome: "", cor: "#3b82f6" });
  const [editingStatus, setEditingStatus] = useState(null);
  const [novoStatus, setNovoStatus] = useState({ nome: "", cor: "#3b82f6", icone: "🟢" });
  const [editingCell, setEditingCell] = useState(null);
  const [editValue, setEditValue] = useState("");
  const [viewMode, setViewMode] = useState("table"); // "table" ou "kanban"

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
      const [filaData, tiposData, statusData, motoristasData, veiculosData] = await Promise.all([
        base44.entities.FilaVeiculo.filter({ empresa_id: user.empresa_id }, "posicao_fila"),
        base44.entities.TipoFilaVeiculo.filter({ empresa_id: user.empresa_id, ativo: true }, "ordem"),
        base44.entities.StatusFilaVeiculo.filter({ empresa_id: user.empresa_id, ativo: true }, "ordem"),
        base44.entities.Motorista.list(),
        base44.entities.Veiculo.filter({ tipo: "cavalo" })
      ]);

      setFila(filaData);
      setTiposFila(tiposData);
      setStatusFila(statusData);
      setMotoristas(motoristasData);
      setVeiculos(veiculosData);

      // Se não há tipos, criar os padrões
      if (tiposData.length === 0) {
        await criarTiposPadrao(user.empresa_id);
      }

      // Se não há status, criar os padrões
      if (statusData.length === 0) {
        await criarStatusPadrao(user.empresa_id);
      }

      // Recarregar dados se criou tipos/status
      if (tiposData.length === 0 || statusData.length === 0) {
        await loadData();
        return;
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

  const criarStatusPadrao = async (empresaId) => {
    const statusPadrao = [
      { nome: "Aguardando", cor: "#16a34a", icone: "🟢", ordem: 1 },
      { nome: "Em Operação", cor: "#2563eb", icone: "🔵", ordem: 2 },
      { nome: "Indisponível", cor: "#dc2626", icone: "🔴", ordem: 3 }
    ];

    for (const status of statusPadrao) {
      await base44.entities.StatusFilaVeiculo.create({
        ...status,
        empresa_id: empresaId,
        ativo: true
      });
    }

    await loadData();
    toast.success("Status de fila criados");
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

      // Pegar o primeiro status ou "aguardando" como padrão
      const statusPadrao = statusFila[0]?.nome.toLowerCase().replace(/ /g, '_') || "aguardando";

      await base44.entities.FilaVeiculo.create({
        empresa_id: user.empresa_id,
        ...formData,
        tipo_fila_nome: tipoSelecionado?.nome,
        status: statusPadrao,
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

  const handleSalvarStatus = async (e) => {
    e.preventDefault();

    if (!novoStatus.nome) {
      toast.error("Nome do status é obrigatório");
      return;
    }

    try {
      const user = await base44.auth.me();
      
      if (editingStatus) {
        await base44.entities.StatusFilaVeiculo.update(editingStatus.id, novoStatus);
        toast.success("Status atualizado");
      } else {
        const proximaOrdem = statusFila.length + 1;
        await base44.entities.StatusFilaVeiculo.create({
          ...novoStatus,
          empresa_id: user.empresa_id,
          ordem: proximaOrdem,
          ativo: true
        });
        toast.success("Status criado");
      }

      setNovoStatus({ nome: "", cor: "#3b82f6", icone: "🟢" });
      setEditingStatus(null);
      loadData();
    } catch (error) {
      console.error("Erro ao salvar status:", error);
      toast.error("Erro ao salvar status");
    }
  };

  const handleExcluirStatus = async (id) => {
    if (!confirm("Excluir este status?")) return;

    try {
      await base44.entities.StatusFilaVeiculo.delete(id);
      toast.success("Status excluído");
      loadData();
    } catch (error) {
      console.error("Erro ao excluir status:", error);
      toast.error("Erro ao excluir status");
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

  const formatarTelefone = (telefone) => {
    if (!telefone) return "";
    const numeros = telefone.replace(/\D/g, '');
    if (numeros.length === 11) {
      return `(${numeros.slice(0, 2)}) ${numeros.slice(2, 7)}-${numeros.slice(7)}`;
    } else if (numeros.length === 10) {
      return `(${numeros.slice(0, 2)}) ${numeros.slice(2, 6)}-${numeros.slice(6)}`;
    }
    return telefone;
  };

  const abrirWhatsApp = (telefone) => {
    if (!telefone) return;
    const numeros = telefone.replace(/\D/g, '');
    const numero = numeros.startsWith('55') ? numeros : `55${numeros}`;
    window.open(`https://wa.me/${numero}`, '_blank');
  };

  const handleDoubleClick = (itemId, field, currentValue) => {
    setEditingCell({ itemId, field });
    setEditValue(currentValue || "");
  };

  const handleSaveEdit = async () => {
    if (!editingCell) return;

    try {
      let updates = { [editingCell.field]: editValue };

      // Se editou nome do motorista, buscar dados do motorista
      if (editingCell.field === 'motorista_nome') {
        const termo = editValue.toLowerCase();
        const motorista = motoristas.find(m => 
          m.nome?.toLowerCase().includes(termo)
        );

        if (motorista) {
          // Buscar placas vinculadas - buscar todos os implementos
          const allVeiculos = await base44.entities.Veiculo.list();
          const cavalo = allVeiculos.find(v => v.id === motorista.cavalo_id);
          const implemento1 = allVeiculos.find(v => v.id === motorista.implemento1_id);
          const implemento2 = allVeiculos.find(v => v.id === motorista.implemento2_id);

          updates = {
            motorista_id: motorista.id,
            motorista_nome: motorista.nome,
            motorista_cpf: motorista.cpf,
            motorista_telefone: motorista.celular,
            cavalo_id: motorista.cavalo_id || "",
            cavalo_placa: cavalo?.placa || "",
            implemento1_id: motorista.implemento1_id || "",
            implemento1_placa: implemento1?.placa || "",
            implemento2_id: motorista.implemento2_id || "",
            implemento2_placa: implemento2?.placa || ""
          };
          toast.success("Dados do motorista carregados!");
        }
      }

      // Formatar telefone antes de salvar
      if (editingCell.field === 'motorista_telefone') {
        updates[editingCell.field] = formatarTelefone(editValue);
      }

      await base44.entities.FilaVeiculo.update(editingCell.itemId, updates);
      toast.success("Atualizado com sucesso!");
      setEditingCell(null);
      setEditValue("");
      loadData();
    } catch (error) {
      console.error("Erro ao atualizar:", error);
      toast.error("Erro ao atualizar campo");
    }
  };

  const handleCancelEdit = () => {
    setEditingCell(null);
    setEditValue("");
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSaveEdit();
    } else if (e.key === 'Escape') {
      handleCancelEdit();
    }
  };

  const handleDragEnd = async (result) => {
    if (!result.destination) return;

    const { source, destination, draggableId } = result;

    // Se soltou no mesmo lugar, não faz nada
    if (source.droppableId === destination.droppableId && source.index === destination.index) {
      return;
    }

    try {
      // Encontrar o status de destino
      const statusDestino = statusFila.find(s => s.id === destination.droppableId);
      if (!statusDestino) return;

      const statusNormalizado = statusDestino.nome.toLowerCase().replace(/ /g, '_');
      const updates = { status: statusNormalizado };

      // Se mudou para "em_operacao", registrar saída
      if (statusNormalizado === 'em_operacao') {
        const item = fila.find(f => f.id === draggableId);
        if (item && !item.data_saida_fila) {
          updates.data_saida_fila = new Date().toISOString();
        }
      }

      await base44.entities.FilaVeiculo.update(draggableId, updates);
      toast.success("Status atualizado!");
      loadData();
    } catch (error) {
      console.error("Erro ao atualizar status:", error);
      toast.error("Erro ao atualizar status");
    }
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
            <div className="flex border rounded-lg" style={{ borderColor: theme.cardBorder }}>
              <Button
                variant={viewMode === "table" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("table")}
                className={viewMode === "table" ? "bg-blue-600 hover:bg-blue-700" : ""}
              >
                <Table className="w-4 h-4 mr-2" />
                Tabela
              </Button>
              <Button
                variant={viewMode === "kanban" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("kanban")}
                className={viewMode === "kanban" ? "bg-blue-600 hover:bg-blue-700" : ""}
              >
                <LayoutGrid className="w-4 h-4 mr-2" />
                Kanban
              </Button>
            </div>
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
              onClick={() => setShowStatusModal(true)}
              style={{ borderColor: theme.cardBorder, color: theme.text }}
            >
              <Settings className="w-4 h-4 mr-2" />
              Gerenciar Status
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
        {viewMode === "kanban" ? (
          <FilaKanban
            statusFila={statusFila}
            fila={fila}
            tiposFila={tiposFila}
            onDragEnd={handleDragEnd}
            onRemove={handleRemoverDaFila}
            calcularTempoNaFila={calcularTempoNaFila}
            formatarTelefone={formatarTelefone}
            abrirWhatsApp={abrirWhatsApp}
            theme={theme}
          />
        ) : (
          <DragDropContext onDragEnd={handleDragEnd}>
            {statusFila.map(statusObj => {
              const veiculosDoStatus = fila.filter(v => v.status === statusObj.nome.toLowerCase().replace(/ /g, '_'));

              return (
                <Card key={statusObj.id} style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2" style={{ color: theme.text }}>
                      <span style={{ color: statusObj.cor }}>{statusObj.icone}</span>
                      {statusObj.nome} ({veiculosDoStatus.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b" style={{ borderColor: theme.cardBorder }}>
                            <th className="text-left p-3 text-xs font-semibold w-8" style={{ color: theme.textMuted }}></th>
                            <th className="text-left p-3 text-xs font-semibold" style={{ color: theme.textMuted }}>Tipo</th>
                            <th className="text-left p-3 text-xs font-semibold" style={{ color: theme.textMuted }}>Motorista</th>
                            <th className="text-left p-3 text-xs font-semibold" style={{ color: theme.textMuted }}>CPF</th>
                            <th className="text-left p-3 text-xs font-semibold" style={{ color: theme.textMuted }}>Telefone</th>
                            <th className="text-left p-3 text-xs font-semibold" style={{ color: theme.textMuted }}>Cavalo</th>
                            <th className="text-left p-3 text-xs font-semibold" style={{ color: theme.textMuted }}>Implementos</th>
                            <th className="text-left p-3 text-xs font-semibold" style={{ color: theme.textMuted }}>Tipo Veículo</th>
                            <th className="text-left p-3 text-xs font-semibold" style={{ color: theme.textMuted }}>Localização</th>
                            <th className="text-left p-3 text-xs font-semibold" style={{ color: theme.textMuted }}>Data Entrada</th>
                            <th className="text-left p-3 text-xs font-semibold" style={{ color: theme.textMuted }}>Tempo na Fila</th>
                            <th className="text-left p-3 text-xs font-semibold" style={{ color: theme.textMuted }}>Ações</th>
                          </tr>
                        </thead>
                        <Droppable droppableId={statusObj.id}>
                          {(provided, snapshot) => (
                            <tbody
                              ref={provided.innerRef}
                              {...provided.droppableProps}
                              style={{
                                backgroundColor: snapshot.isDraggingOver 
                                  ? (theme.cardBg === '#1e293b' ? '#334155' : '#f1f5f9')
                                  : 'transparent'
                              }}
                            >
                              {veiculosDoStatus.map((item, index) => {
                                const tipo = tiposFila.find(t => t.id === item.tipo_fila_id);
                                return (
                                  <Draggable key={item.id} draggableId={item.id} index={index}>
                                    {(provided, snapshot) => (
                                      <tr 
                                        ref={provided.innerRef}
                                        {...provided.draggableProps}
                                        className="border-b hover:bg-gray-50 dark:hover:bg-gray-800" 
                                        style={{ 
                                          ...provided.draggableProps.style,
                                          borderColor: theme.cardBorder,
                                          backgroundColor: snapshot.isDragging 
                                            ? (theme.cardBg === '#1e293b' ? '#1e293b' : '#ffffff')
                                            : 'transparent',
                                          opacity: snapshot.isDragging ? 0.9 : 1
                                        }}
                                      >
                                        <td className="p-3" {...provided.dragHandleProps}>
                                          <GripVertical className="w-4 h-4 text-gray-400 cursor-grab active:cursor-grabbing" />
                                        </td>
                          <td className="p-3">
                            {editingCell?.itemId === item.id && editingCell?.field === 'status' ? (
                              <Select
                                value={editValue}
                                onValueChange={(value) => {
                                  const statusSelecionado = statusFila.find(s => s.id === value);
                                  const statusNormalizado = statusSelecionado?.nome.toLowerCase().replace(/ /g, '_');
                                  const updates = { status: statusNormalizado };
                                  // Se mudar status, registrar mudança
                                  if (statusNormalizado !== item.status && statusNormalizado === 'em_operacao' && !item.data_saida_fila) {
                                    updates.data_saida_fila = new Date().toISOString();
                                  }
                                  base44.entities.FilaVeiculo.update(item.id, updates)
                                    .then(() => {
                                      toast.success("Status atualizado!");
                                      setEditingCell(null);
                                      loadData();
                                    })
                                    .catch(() => toast.error("Erro ao atualizar"));
                                }}
                              >
                                <SelectTrigger className="h-7 text-xs w-36" style={{ backgroundColor: theme.cardBg, borderColor: '#3b82f6' }}>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {statusFila.map(s => (
                                    <SelectItem key={s.id} value={s.id}>
                                      <div className="flex items-center gap-2">
                                        <span>{s.icone}</span>
                                        {s.nome}
                                      </div>
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            ) : (
                              <Select
                                value={item.tipo_fila_id}
                                onValueChange={(value) => {
                                  const tipoSel = tiposFila.find(t => t.id === value);
                                  base44.entities.FilaVeiculo.update(item.id, { 
                                    tipo_fila_id: value,
                                    tipo_fila_nome: tipoSel?.nome
                                  })
                                    .then(() => {
                                      toast.success("Tipo atualizado!");
                                      loadData();
                                    })
                                    .catch(() => toast.error("Erro ao atualizar"));
                                }}
                              >
                                <SelectTrigger className="h-7 text-xs w-32" style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {tiposFila.map(t => (
                                    <SelectItem key={t.id} value={t.id}>
                                      <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: t.cor }} />
                                        {t.nome}
                                      </div>
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            )}
                          </td>
                          <td className="p-3">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center flex-shrink-0">
                                <span className="font-bold text-xs text-blue-700 dark:text-blue-300">
                                  {item.posicao_fila || index + 1}
                                </span>
                              </div>
                              <div 
                                className="cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/20 px-1 rounded flex-1" 
                                onDoubleClick={() => handleDoubleClick(item.id, 'motorista_nome', item.motorista_nome)}
                              >
                                {editingCell?.itemId === item.id && editingCell?.field === 'motorista_nome' ? (
                                  <Input
                                    value={editValue}
                                    onChange={(e) => setEditValue(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    onBlur={handleSaveEdit}
                                    autoFocus
                                    className="text-sm h-8"
                                    style={{ backgroundColor: theme.cardBg, borderColor: '#3b82f6', color: theme.text }}
                                  />
                                ) : (
                                  <p className="text-sm font-semibold" style={{ color: theme.text }}>{item.motorista_nome}</p>
                                )}
                              </div>
                            </div>
                          </td>
                          <td 
                            className="p-3 cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/20" 
                            onDoubleClick={() => handleDoubleClick(item.id, 'motorista_cpf', item.motorista_cpf)}
                          >
                            {editingCell?.itemId === item.id && editingCell?.field === 'motorista_cpf' ? (
                              <Input
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                onKeyDown={handleKeyDown}
                                onBlur={handleSaveEdit}
                                autoFocus
                                className="text-xs font-mono h-8"
                                style={{ backgroundColor: theme.cardBg, borderColor: '#3b82f6', color: theme.text }}
                              />
                            ) : (
                              <p className="text-xs font-mono" style={{ color: theme.textMuted }}>{item.motorista_cpf}</p>
                            )}
                          </td>
                          <td className="p-3">
                            <div className="flex items-center gap-2">
                              {editingCell?.itemId === item.id && editingCell?.field === 'motorista_telefone' ? (
                                <Input
                                  value={editValue}
                                  onChange={(e) => setEditValue(e.target.value)}
                                  onKeyDown={handleKeyDown}
                                  onBlur={handleSaveEdit}
                                  autoFocus
                                  className="text-xs h-8 flex-1"
                                  style={{ backgroundColor: theme.cardBg, borderColor: '#3b82f6', color: theme.text }}
                                />
                              ) : (
                                <>
                                  <p 
                                    className="text-xs cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/20 px-2 py-1 rounded flex-1" 
                                    style={{ color: theme.text }}
                                    onDoubleClick={() => handleDoubleClick(item.id, 'motorista_telefone', item.motorista_telefone)}
                                  >
                                    {formatarTelefone(item.motorista_telefone)}
                                  </p>
                                  {item.motorista_telefone && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => abrirWhatsApp(item.motorista_telefone)}
                                      className="h-7 w-7 p-0 text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-900/20"
                                      title="Abrir WhatsApp"
                                    >
                                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                                      </svg>
                                    </Button>
                                  )}
                                </>
                              )}
                            </div>
                          </td>
                          <td 
                            className="p-3 cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/20" 
                            onDoubleClick={() => handleDoubleClick(item.id, 'cavalo_placa', item.cavalo_placa)}
                          >
                            {editingCell?.itemId === item.id && editingCell?.field === 'cavalo_placa' ? (
                              <Input
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value.toUpperCase())}
                                onKeyDown={handleKeyDown}
                                onBlur={handleSaveEdit}
                                autoFocus
                                className="text-sm font-mono font-semibold h-8"
                                style={{ backgroundColor: theme.cardBg, borderColor: '#3b82f6', color: theme.text }}
                              />
                            ) : (
                              <p className="text-sm font-mono font-semibold" style={{ color: theme.text }}>{item.cavalo_placa}</p>
                            )}
                          </td>
                          <td className="p-3">
                            <div className="text-xs space-y-1">
                              {editingCell?.itemId === item.id && editingCell?.field === 'implemento1_placa' ? (
                                <Input
                                  value={editValue}
                                  onChange={(e) => setEditValue(e.target.value.toUpperCase())}
                                  onKeyDown={handleKeyDown}
                                  onBlur={handleSaveEdit}
                                  autoFocus
                                  className="text-xs font-mono h-7"
                                  style={{ backgroundColor: theme.cardBg, borderColor: '#3b82f6', color: theme.text }}
                                />
                              ) : (
                                <p 
                                  className="font-mono cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/20 px-1 rounded" 
                                  style={{ color: item.implemento1_placa ? theme.text : theme.textMuted }}
                                  onDoubleClick={() => handleDoubleClick(item.id, 'implemento1_placa', item.implemento1_placa)}
                                >
                                  {item.implemento1_placa || "Impl. 1: Clique para adicionar"}
                                </p>
                              )}
                              
                              {editingCell?.itemId === item.id && editingCell?.field === 'implemento2_placa' ? (
                                <Input
                                  value={editValue}
                                  onChange={(e) => setEditValue(e.target.value.toUpperCase())}
                                  onKeyDown={handleKeyDown}
                                  onBlur={handleSaveEdit}
                                  autoFocus
                                  className="text-xs font-mono h-7"
                                  style={{ backgroundColor: theme.cardBg, borderColor: '#3b82f6', color: theme.text }}
                                />
                              ) : (
                                <p 
                                  className="font-mono cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/20 px-1 rounded" 
                                  style={{ color: item.implemento2_placa ? theme.text : theme.textMuted }}
                                  onDoubleClick={() => handleDoubleClick(item.id, 'implemento2_placa', item.implemento2_placa)}
                                >
                                  {item.implemento2_placa || "Impl. 2: Clique para adicionar"}
                                </p>
                              )}
                            </div>
                          </td>
                          <td className="p-3">
                            <div className="space-y-1">
                              {/* Tipo de Veículo */}
                              {editingCell?.itemId === item.id && editingCell?.field === 'tipo_veiculo' ? (
                                <Select
                                  value={editValue}
                                  onValueChange={(value) => {
                                    setEditValue(value);
                                    base44.entities.FilaVeiculo.update(item.id, { tipo_veiculo: value })
                                      .then(() => {
                                        toast.success("Tipo de veículo atualizado!");
                                        setEditingCell(null);
                                        loadData();
                                      })
                                      .catch(() => toast.error("Erro ao atualizar"));
                                  }}
                                >
                                  <SelectTrigger className="h-7 text-xs" style={{ backgroundColor: theme.cardBg, borderColor: '#3b82f6' }}>
                                    <SelectValue />
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
                              ) : (
                                <p 
                                  className="text-xs cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/20 px-1 rounded" 
                                  style={{ color: theme.text }}
                                  onDoubleClick={() => handleDoubleClick(item.id, 'tipo_veiculo', item.tipo_veiculo)}
                                >
                                  {item.tipo_veiculo || "-"}
                                </p>
                              )}

                              {/* Tipo de Carroceria */}
                              {editingCell?.itemId === item.id && editingCell?.field === 'tipo_carroceria' ? (
                                <Select
                                  value={editValue}
                                  onValueChange={(value) => {
                                    setEditValue(value);
                                    base44.entities.FilaVeiculo.update(item.id, { tipo_carroceria: value })
                                      .then(() => {
                                        toast.success("Tipo de carroceria atualizado!");
                                        setEditingCell(null);
                                        loadData();
                                      })
                                      .catch(() => toast.error("Erro ao atualizar"));
                                  }}
                                >
                                  <SelectTrigger className="h-7 text-xs" style={{ backgroundColor: theme.cardBg, borderColor: '#3b82f6' }}>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="SIDER">SIDER</SelectItem>
                                    <SelectItem value="PRANCHA">PRANCHA</SelectItem>
                                    <SelectItem value="GRADE BAIXA">GRADE BAIXA</SelectItem>
                                    <SelectItem value="GRADE ALTA">GRADE ALTA</SelectItem>
                                    <SelectItem value="BAU">BAU</SelectItem>
                                  </SelectContent>
                                </Select>
                              ) : (
                                <p 
                                  className="text-xs cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/20 px-1 rounded" 
                                  style={{ color: theme.textMuted }}
                                  onDoubleClick={() => handleDoubleClick(item.id, 'tipo_carroceria', item.tipo_carroceria)}
                                >
                                  {item.tipo_carroceria || "Clique para adicionar"}
                                </p>
                              )}
                            </div>
                          </td>
                          <td 
                            className="p-3 cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/20" 
                            onDoubleClick={() => handleDoubleClick(item.id, 'localizacao_atual', item.localizacao_atual)}
                          >
                            {editingCell?.itemId === item.id && editingCell?.field === 'localizacao_atual' ? (
                              <Input
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                onKeyDown={handleKeyDown}
                                onBlur={handleSaveEdit}
                                autoFocus
                                className="text-xs h-8"
                                style={{ backgroundColor: theme.cardBg, borderColor: '#3b82f6', color: theme.text }}
                              />
                            ) : (
                              <p className="text-xs" style={{ color: theme.text }}>{item.localizacao_atual || "-"}</p>
                            )}
                          </td>
                          <td className="p-3">
                            <div className="text-xs space-y-0.5">
                              <p className="font-semibold" style={{ color: theme.text }}>
                                {item.data_entrada_fila ? format(new Date(item.data_entrada_fila), "dd/MM/yyyy", { locale: ptBR }) : "-"}
                              </p>
                              <p style={{ color: theme.textMuted }}>
                                {item.data_entrada_fila ? format(new Date(item.data_entrada_fila), "HH:mm", { locale: ptBR }) : "-"}
                              </p>
                            </div>
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
                                    )}
                                  </Draggable>
                                );
                              })}
                              {provided.placeholder}
                              {veiculosDoStatus.length === 0 && (
                                <tr>
                                  <td colSpan="12" className="text-center py-8">
                                    <p className="text-sm" style={{ color: theme.textMuted }}>Nenhum veículo neste status</p>
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          )}
                        </Droppable>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </DragDropContext>
        )}

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

        {/* Modal Gerenciar Status */}
        <Dialog open={showStatusModal} onOpenChange={setShowStatusModal}>
          <DialogContent style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}>
            <DialogHeader>
              <DialogTitle style={{ color: theme.text }}>Gerenciar Status de Fila</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              {/* Form Adicionar/Editar Status */}
              <form onSubmit={handleSalvarStatus} className="border rounded-lg p-3" style={{ borderColor: theme.cardBorder }}>
                <div className="grid grid-cols-4 gap-3">
                  <div className="col-span-2">
                    <Label style={{ color: theme.text }}>Nome do Status</Label>
                    <Input
                      value={novoStatus.nome}
                      onChange={(e) => setNovoStatus(prev => ({ ...prev, nome: e.target.value }))}
                      placeholder="Ex: Aguardando Carga"
                      style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder, color: theme.text }}
                    />
                  </div>
                  <div>
                    <Label style={{ color: theme.text }}>Ícone</Label>
                    <Input
                      value={novoStatus.icone}
                      onChange={(e) => setNovoStatus(prev => ({ ...prev, icone: e.target.value }))}
                      placeholder="Ex: 🟢"
                      style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder, color: theme.text }}
                    />
                  </div>
                  <div>
                    <Label style={{ color: theme.text }}>Cor</Label>
                    <Input
                      type="color"
                      value={novoStatus.cor}
                      onChange={(e) => setNovoStatus(prev => ({ ...prev, cor: e.target.value }))}
                      className="h-10"
                    />
                  </div>
                </div>
                <div className="flex gap-2 mt-3">
                  <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                    {editingStatus ? "Atualizar" : "Adicionar"}
                  </Button>
                  {editingStatus && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setEditingStatus(null);
                        setNovoStatus({ nome: "", cor: "#3b82f6", icone: "🟢" });
                      }}
                    >
                      Cancelar
                    </Button>
                  )}
                </div>
              </form>

              {/* Lista de Status */}
              <div className="space-y-2">
                <Label style={{ color: theme.text }}>Status Cadastrados</Label>
                {statusFila.map(status => (
                  <div
                    key={status.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                    style={{ borderColor: theme.cardBorder }}
                  >
                    <div className="flex items-center gap-3">
                      <span style={{ fontSize: '1.5rem' }}>{status.icone}</span>
                      <div className="w-4 h-4 rounded-full" style={{ backgroundColor: status.cor }} />
                      <span className="font-semibold" style={{ color: theme.text }}>{status.nome}</span>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setEditingStatus(status);
                          setNovoStatus({ nome: status.nome, cor: status.cor, icone: status.icone });
                        }}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleExcluirStatus(status.id)}
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