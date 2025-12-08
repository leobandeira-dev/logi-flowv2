import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Settings, 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  X,
  GripVertical,
  CheckCircle,
  AlertCircle,
  User,
  Building2
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import CamposEtapaManager from "../components/etapas/CamposEtapaManager";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

export default function ConfiguracaoEtapas() {
  const [etapas, setEtapas] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [departamentos, setDepartamentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingEtapa, setEditingEtapa] = useState(null);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [reordering, setReordering] = useState(false);

  const [expandedEtapa, setExpandedEtapa] = useState(null);
  const [usuarioBusca, setUsuarioBusca] = useState("");
  const [departamentoBusca, setDepartamentoBusca] = useState("");
  const [showUsuarioDropdown, setShowUsuarioDropdown] = useState(false);
  const [showDepartamentoDropdown, setShowDepartamentoDropdown] = useState(false);
  const [isDark, setIsDark] = useState(false);

  const [formData, setFormData] = useState({
    nome: "",
    descricao: "",
    cor: "#3B82F6",
    ordem: 0,
    prazo_dias: null,
    prazo_horas: null,
    prazo_minutos: null,
    tipo_contagem_prazo: "inicio_etapa",
    prazo_durante_expediente: false,
    expediente_inicio: "08:00",
    expediente_fim: "18:00",
    requer_aprovacao: false,
    responsavel_id: "",
    departamento_responsavel_id: "",
    ativo: true
  });

  const coresPredefinidas = [
    { nome: "Azul", valor: "#3B82F6" },
    { nome: "Verde", valor: "#10B981" },
    { nome: "Amarelo", valor: "#F59E0B" },
    { nome: "Vermelho", valor: "#EF4444" },
    { nome: "Roxo", valor: "#8B5CF6" },
    { nome: "Rosa", valor: "#EC4899" },
    { nome: "Laranja", valor: "#F97316" },
    { nome: "Ciano", valor: "#06B6D4" },
    { nome: "Cinza", valor: "#6B7280" },
    { nome: "Índigo", valor: "#6366F1" }
  ];

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    const checkDarkMode = () => {
      setIsDark(document.documentElement.classList.contains('dark'));
    };
    checkDarkMode();
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [etapasData, usuariosData, departamentosData] = await Promise.all([
        base44.entities.Etapa.list("ordem"),
        base44.entities.User.list(),
        base44.entities.Departamento.list()
      ]);
      setEtapas(etapasData);
      setUsuarios(usuariosData);
      setDepartamentos(departamentosData);
    } catch (err) {
      console.error("Erro ao carregar dados:", err);
      setError("Erro ao carregar dados");
    } finally {
      setLoading(false);
    }
  };

  const loadEtapas = async () => {
    try {
      const data = await base44.entities.Etapa.list("ordem");
      setEtapas(data);
    } catch (err) {
      console.error("Erro ao carregar etapas:", err);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const dataToSave = {
        ...formData,
        // Ensure numeric fields are correctly null if empty strings
        prazo_dias: formData.prazo_dias === "" ? null : formData.prazo_dias,
        prazo_horas: formData.prazo_horas === "" ? null : formData.prazo_horas,
        prazo_minutos: formData.prazo_minutos === "" ? null : formData.prazo_minutos,
        // For new items, assign an order to put them at the end. For existing, use formData.ordem (which might have been updated by D&D)
        ordem: editingEtapa ? formData.ordem : etapas.length + 1
      };

      if (editingEtapa) {
        await base44.entities.Etapa.update(editingEtapa.id, dataToSave);
      } else {
        await base44.entities.Etapa.create(dataToSave);
      }

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      setShowForm(false);
      setEditingEtapa(null);
      resetForm();
      loadEtapas();
    } catch (err) {
      console.error("Erro ao salvar etapa:", err);
      setError("Erro ao salvar etapa. Tente novamente.");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (etapa) => {
    setEditingEtapa(etapa);
    setFormData({
      nome: etapa.nome,
      descricao: etapa.descricao || "",
      cor: etapa.cor,
      ordem: etapa.ordem,
      prazo_dias: etapa.prazo_dias,
      prazo_horas: etapa.prazo_horas,
      prazo_minutos: etapa.prazo_minutos,
      tipo_contagem_prazo: etapa.tipo_contagem_prazo || "inicio_etapa",
      prazo_durante_expediente: etapa.prazo_durante_expediente || false,
      expediente_inicio: etapa.expediente_inicio || "08:00",
      expediente_fim: etapa.expediente_fim || "18:00",
      requer_aprovacao: etapa.requer_aprovacao || false,
      responsavel_id: etapa.responsavel_id || "",
      departamento_responsavel_id: etapa.departamento_responsavel_id || "",
      ativo: etapa.ativo !== undefined ? etapa.ativo : true
    });
    setShowForm(true);
  };

  const handleDelete = async (etapaId) => {
    if (!confirm("Tem certeza que deseja excluir esta etapa?")) return;

    try {
      await base44.entities.Etapa.delete(etapaId);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      loadEtapas();
    } catch (err) {
      console.error("Erro ao excluir etapa:", err);
      setError("Erro ao excluir etapa. Verifique se não há ordens vinculadas.");
    }
  };

  const resetForm = () => {
    setFormData({
      nome: "",
      descricao: "",
      cor: "#3B82F6",
      ordem: 0,
      prazo_dias: null,
      prazo_horas: null,
      prazo_minutos: null,
      tipo_contagem_prazo: "inicio_etapa",
      prazo_durante_expediente: false,
      expediente_inicio: "08:00",
      expediente_fim: "18:00",
      requer_aprovacao: false,
      responsavel_id: "",
      departamento_responsavel_id: "",
      ativo: true
    });
    setUsuarioBusca("");
    setDepartamentoBusca("");
  };

  const formatPrazo = (etapa) => {
    const parts = [];
    if (etapa.prazo_dias && etapa.prazo_dias > 0) parts.push(`${etapa.prazo_dias}d`);
    if (etapa.prazo_horas && etapa.prazo_horas > 0) parts.push(`${etapa.prazo_horas}h`);
    if (etapa.prazo_minutos && etapa.prazo_minutos > 0) parts.push(`${etapa.prazo_minutos}m`);
    return parts.length > 0 ? parts.join(' ') : null;
  };

  const handleDragEnd = async (result) => {
    if (!result.destination) return;

    const { source, destination } = result;
    
    if (source.index === destination.index) return;

    setReordering(true);

    try {
      // Reordenar array localmente
      const newEtapas = Array.from(etapas);
      const [removed] = newEtapas.splice(source.index, 1);
      newEtapas.splice(destination.index, 0, removed);

      // Atualizar estado local imediatamente para feedback visual
      setEtapas(newEtapas);

      // Atualizar as ordens no banco de dados
      const updatePromises = newEtapas.map((etapa, index) => 
        base44.entities.Etapa.update(etapa.id, { ordem: index + 1 }) // Ordem é 1-based
      );

      await Promise.all(updatePromises);

      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
      
      // Recarregar para garantir sincronização
      await loadEtapas();
    } catch (err) {
      console.error("Erro ao reordenar etapas:", err);
      setError("Erro ao reordenar etapas. Recarregando...");
      // Recarregar em caso de erro
      await loadEtapas();
    } finally {
      setReordering(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-600">Carregando configurações...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Settings className="w-8 h-8 text-blue-600" />
              <h1 className="text-3xl font-bold text-gray-900">Configuração de Etapas</h1>
            </div>
            <p className="text-gray-600">Gerencie as etapas do fluxo de processos</p>
          </div>
          
          <Button
            onClick={() => {
              resetForm();
              setEditingEtapa(null);
              setShowForm(true);
            }}
            className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Nova Etapa
          </Button>
        </div>

        {/* Alerts */}
        {success && (
          <Alert className="mb-6 bg-green-50 border-green-200">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <AlertDescription className="text-green-800">
              Operação realizada com sucesso!
            </AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="w-4 h-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {reordering && (
          <Alert className="mb-6 bg-blue-50 border-blue-200">
            <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <AlertDescription className="text-blue-800">
              Reordenando etapas...
            </AlertDescription>
          </Alert>
        )}

        {/* Lista de Etapas com Drag and Drop */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Etapas Cadastradas</span>
              <span className="text-sm font-normal text-gray-500">
                Arraste para reordenar
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {etapas.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Settings className="w-12 h-12 mx-auto mb-4 opacity-20" />
                <p>Nenhuma etapa cadastrada</p>
                <p className="text-sm mt-2">Comece criando a primeira etapa do seu fluxo</p>
              </div>
            ) : (
              <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="etapas-list">
                  {(provided, snapshot) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className={`space-y-3 ${snapshot.isDraggingOver ? 'bg-blue-50 rounded-lg p-2' : ''}`}
                    >
                      {etapas.map((etapa, index) => (
                        <Draggable 
                          key={etapa.id} 
                          draggableId={etapa.id} 
                          index={index}
                          isDragDisabled={reordering}
                        >
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              className={`border rounded-lg ${
                                snapshot.isDragging 
                                  ? 'shadow-2xl bg-white ring-2 ring-blue-500' 
                                  : 'bg-white'
                              }`}
                            >
                              <div
                                className={`flex items-center gap-4 p-4 transition-colors ${
                                  !expandedEtapa || expandedEtapa !== etapa.id 
                                    ? 'cursor-pointer hover:bg-gray-50' 
                                    : ''
                                }`}
                                onClick={() => setExpandedEtapa(expandedEtapa === etapa.id ? null : etapa.id)}
                              >
                                <div
                                  {...provided.dragHandleProps}
                                  className="cursor-grab active:cursor-grabbing hover:bg-gray-100 p-1 rounded transition-colors"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <GripVertical className="w-5 h-5 text-gray-400" />
                                </div>
                                
                                <div 
                                  className="w-4 h-4 rounded-full flex-shrink-0"
                                  style={{ backgroundColor: etapa.cor }}
                                />
                                
                                <div className="flex-1">
                                  <h3 className="font-semibold text-gray-900">{etapa.nome}</h3>
                                  {etapa.descricao && (
                                    <p className="text-sm text-gray-600 mt-1">{etapa.descricao}</p>
                                  )}
                                  <div className="flex items-center gap-4 mt-2 text-xs text-gray-500 flex-wrap">
                                   <span>Ordem: {etapa.ordem}</span>
                                   {formatPrazo(etapa) && <span>Prazo: {formatPrazo(etapa)}</span>}
                                   {etapa.requer_aprovacao && <span className="text-orange-600">⚠ Requer aprovação</span>}
                                   {etapa.responsavel_id && (
                                     <span className="text-blue-600 flex items-center gap-1">
                                       <User className="w-3 h-3" />
                                       {usuarios.find(u => u.id === etapa.responsavel_id)?.full_name || "Usuário"}
                                     </span>
                                   )}
                                   {etapa.departamento_responsavel_id && (
                                     <span className="text-purple-600 flex items-center gap-1">
                                       <Building2 className="w-3 h-3" />
                                       {departamentos.find(d => d.id === etapa.departamento_responsavel_id)?.nome || "Departamento"}
                                     </span>
                                   )}
                                   {!etapa.ativo && <span className="text-red-600">⛔ Inativa</span>}
                                  </div>
                                </div>

                                <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleEdit(etapa);
                                    }}
                                  >
                                    <Edit className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDelete(etapa.id);
                                    }}
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              </div>

                              {/* Campos Customizados - Expandível */}
                              {expandedEtapa === etapa.id && (
                                <div className="border-t bg-gray-50 p-4">
                                  <CamposEtapaManager 
                                    etapaId={etapa.id} 
                                    etapaNome={etapa.nome}
                                  />
                                </div>
                              )}
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
            )}
          </CardContent>
        </Card>

        {/* Dialog Form */}
        <Dialog open={showForm} onOpenChange={setShowForm}>
          <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingEtapa ? "Editar Etapa" : "Nova Etapa"}
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <Label htmlFor="nome" className="text-sm">Nome da Etapa *</Label>
                <Input
                  id="nome"
                  value={formData.nome}
                  onChange={(e) => handleInputChange("nome", e.target.value)}
                  placeholder="Ex: Cadastro, Rastreamento, Expedição"
                  required
                  className="h-9"
                />
              </div>

              <div>
                <Label htmlFor="descricao" className="text-sm">Descrição</Label>
                <Textarea
                  id="descricao"
                  value={formData.descricao}
                  onChange={(e) => handleInputChange("descricao", e.target.value)}
                  placeholder="Descreva o que acontece nesta etapa"
                  rows={2}
                  className="text-sm resize-none"
                />
              </div>

              <div>
                <Label className="text-sm">Cor da Etapa *</Label>
                <div className="grid grid-cols-5 gap-1.5 mt-2">
                  {coresPredefinidas.map((cor) => (
                    <button
                      key={cor.valor}
                      type="button"
                      className={`h-7 rounded border-2 transition-all ${
                        formData.cor === cor.valor
                          ? "border-gray-900 ring-2 ring-offset-1 ring-gray-900"
                          : "border-gray-300 hover:border-gray-500"
                      }`}
                      style={{ backgroundColor: cor.valor }}
                      onClick={() => handleInputChange("cor", cor.valor)}
                      title={cor.nome}
                    />
                  ))}
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <div 
                    className="w-7 h-7 rounded border-2 flex-shrink-0"
                    style={{ backgroundColor: formData.cor, borderColor: '#9ca3af' }}
                  />
                  <Input
                    type="text"
                    value={formData.cor}
                    onChange={(e) => handleInputChange("cor", e.target.value)}
                    placeholder="#3B82F6"
                    className="flex-1 h-8 text-sm font-mono"
                  />
                </div>
              </div>

              <div>
                <Label className="text-sm">Prazo</Label>
                <div className="grid grid-cols-3 gap-2 mt-1">
                  <div>
                    <Label htmlFor="prazo_dias" className="text-xs text-gray-600">Dias</Label>
                    <Input
                      id="prazo_dias"
                      type="number"
                      min="0"
                      value={formData.prazo_dias || ""}
                      onChange={(e) => handleInputChange("prazo_dias", e.target.value ? parseInt(e.target.value) : null)}
                      placeholder="0"
                      className="h-8 text-sm"
                    />
                  </div>
                  <div>
                    <Label htmlFor="prazo_horas" className="text-xs text-gray-600">Horas</Label>
                    <Input
                      id="prazo_horas"
                      type="number"
                      min="0"
                      max="23"
                      value={formData.prazo_horas || ""}
                      onChange={(e) => handleInputChange("prazo_horas", e.target.value ? parseInt(e.target.value) : null)}
                      placeholder="0"
                      className="h-8 text-sm"
                    />
                  </div>
                  <div>
                    <Label htmlFor="prazo_minutos" className="text-xs text-gray-600">Minutos</Label>
                    <Input
                      id="prazo_minutos"
                      type="number"
                      min="0"
                      max="59"
                      value={formData.prazo_minutos || ""}
                      onChange={(e) => handleInputChange("prazo_minutos", e.target.value ? parseInt(e.target.value) : null)}
                      placeholder="30"
                      className="h-8 text-sm"
                    />
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="tipo_contagem_prazo" className="text-sm">Início da Contagem do Prazo</Label>
                <Select
                  value={formData.tipo_contagem_prazo}
                  onValueChange={(value) => handleInputChange("tipo_contagem_prazo", value)}
                >
                  <SelectTrigger className="h-9 text-sm mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="inicio_etapa">Quando a etapa é iniciada (padrão)</SelectItem>
                    <SelectItem value="criacao_ordem">Desde a criação da ordem</SelectItem>
                    <SelectItem value="conclusao_etapa_anterior">Desde a conclusão da etapa anterior</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-[11px] text-gray-500 mt-1">
                  Define quando o prazo começa a ser contado
                </p>
              </div>

              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <input
                    type="checkbox"
                    id="prazo_durante_expediente"
                    checked={formData.prazo_durante_expediente}
                    onChange={(e) => handleInputChange("prazo_durante_expediente", e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300"
                  />
                  <Label htmlFor="prazo_durante_expediente" className="cursor-pointer text-sm">
                    Prazo durante expediente
                  </Label>
                </div>

                {formData.prazo_durante_expediente && (
                  <div className="grid grid-cols-2 gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <div>
                      <Label htmlFor="expediente_inicio" className="text-xs">Início do Expediente</Label>
                      <Input
                        id="expediente_inicio"
                        type="time"
                        value={formData.expediente_inicio}
                        onChange={(e) => handleInputChange("expediente_inicio", e.target.value)}
                        className="mt-1 h-9 text-sm"
                      />
                    </div>
                    <div>
                      <Label htmlFor="expediente_fim" className="text-xs">Fim do Expediente</Label>
                      <Input
                        id="expediente_fim"
                        type="time"
                        value={formData.expediente_fim}
                        onChange={(e) => handleInputChange("expediente_fim", e.target.value)}
                        className="mt-1 h-9 text-sm"
                      />
                    </div>
                    <div className="col-span-2">
                      <p className="text-[11px] text-blue-800 dark:text-blue-300">
                        ⏰ O prazo será contado apenas de {formData.expediente_inicio} às {formData.expediente_fim} em dias úteis
                      </p>
                    </div>
                  </div>
                )}

                {!formData.prazo_durante_expediente && (
                  <p className="text-[11px] text-gray-500 mt-1">
                    Prazo corrido (24 horas por dia, 7 dias por semana)
                  </p>
                )}
              </div>

              <div>
                <Label className="text-sm">Responsável Padrão</Label>
                <p className="text-[11px] text-gray-500 mb-2">
                  Quando uma ordem entrar nesta etapa, será atribuída automaticamente a este responsável
                </p>
                
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label htmlFor="responsavel_id" className="text-xs mb-1 flex items-center gap-1">
                      <User className="w-3 h-3" />
                      Usuário
                    </Label>
                    <div className="relative">
                      <Input
                        value={(() => {
                          if (formData.responsavel_id) {
                            const usr = usuarios.find(u => u.id === formData.responsavel_id);
                            return usr ? usr.full_name : '';
                          }
                          return usuarioBusca;
                        })()}
                        onChange={(e) => {
                          setUsuarioBusca(e.target.value);
                          handleInputChange("responsavel_id", "");
                          setShowUsuarioDropdown(true);
                        }}
                        onFocus={() => setShowUsuarioDropdown(true)}
                        onBlur={() => setTimeout(() => setShowUsuarioDropdown(false), 200)}
                        placeholder="Digite o nome do usuário..."
                        className="w-full h-8 text-sm"
                      />
                      {showUsuarioDropdown && !formData.responsavel_id && (
                        <div className={`absolute z-50 w-full mt-1 border rounded-lg shadow-lg max-h-60 overflow-auto ${
                          isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'
                        }`}>
                          <div
                            className={`px-4 py-2 cursor-pointer border-b ${
                              isDark 
                                ? 'hover:bg-slate-700 border-slate-700' 
                                : 'hover:bg-gray-50 border-gray-100'
                            }`}
                            onClick={() => {
                              handleInputChange("responsavel_id", "");
                              setUsuarioBusca("");
                              setShowUsuarioDropdown(false);
                            }}
                          >
                            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Nenhum usuário</p>
                          </div>
                          {usuarios
                            .filter(u => u.full_name.toLowerCase().includes(usuarioBusca.toLowerCase()))
                            .slice(0, 10)
                            .map((usuario) => (
                              <div
                                key={usuario.id}
                                className={`px-4 py-2 cursor-pointer transition-colors ${
                                  isDark ? 'hover:bg-slate-700' : 'hover:bg-gray-50'
                                }`}
                                onClick={() => {
                                  handleInputChange("responsavel_id", usuario.id);
                                  if (usuario.id) handleInputChange("departamento_responsavel_id", "");
                                  setUsuarioBusca("");
                                  setShowUsuarioDropdown(false);
                                }}
                              >
                                <div className="flex items-center gap-3">
                                  <div className={`w-8 h-8 rounded-full flex items-center justify-center overflow-hidden ${
                                    isDark ? 'bg-blue-900' : 'bg-blue-100'
                                  }`}>
                                    {usuario.foto_url ? (
                                      <img src={usuario.foto_url} alt={usuario.full_name} className="w-full h-full object-cover" />
                                    ) : (
                                      <User className={`w-4 h-4 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
                                    )}
                                  </div>
                                  <div className="flex-1">
                                    <p className={`font-medium text-sm ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
                                      {usuario.full_name}
                                    </p>
                                    <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                      {usuario.cargo || usuario.email}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="departamento_responsavel_id" className="text-xs mb-1 flex items-center gap-1">
                      <Building2 className="w-3 h-3" />
                      Departamento
                    </Label>
                    <div className="relative">
                      <Input
                        value={(() => {
                          if (formData.departamento_responsavel_id) {
                            const dept = departamentos.find(d => d.id === formData.departamento_responsavel_id);
                            return dept ? dept.nome : '';
                          }
                          return departamentoBusca;
                        })()}
                        onChange={(e) => {
                          setDepartamentoBusca(e.target.value);
                          handleInputChange("departamento_responsavel_id", "");
                          setShowDepartamentoDropdown(true);
                        }}
                        onFocus={() => setShowDepartamentoDropdown(true)}
                        onBlur={() => setTimeout(() => setShowDepartamentoDropdown(false), 200)}
                        placeholder="Digite o nome do departamento..."
                        className="w-full h-8 text-sm"
                      />
                      {showDepartamentoDropdown && !formData.departamento_responsavel_id && (
                        <div className={`absolute z-50 w-full mt-1 border rounded-lg shadow-lg max-h-60 overflow-auto ${
                          isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'
                        }`}>
                          <div
                            className={`px-4 py-2 cursor-pointer border-b ${
                              isDark 
                                ? 'hover:bg-slate-700 border-slate-700' 
                                : 'hover:bg-gray-50 border-gray-100'
                            }`}
                            onClick={() => {
                              handleInputChange("departamento_responsavel_id", "");
                              setDepartamentoBusca("");
                              setShowDepartamentoDropdown(false);
                            }}
                          >
                            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Nenhum departamento</p>
                          </div>
                          {departamentos
                            .filter(d => d.ativo && d.nome.toLowerCase().includes(departamentoBusca.toLowerCase()))
                            .slice(0, 10)
                            .map((departamento) => (
                              <div
                                key={departamento.id}
                                className={`px-4 py-2 cursor-pointer transition-colors ${
                                  isDark ? 'hover:bg-slate-700' : 'hover:bg-gray-50'
                                }`}
                                onClick={() => {
                                  handleInputChange("departamento_responsavel_id", departamento.id);
                                  if (departamento.id) handleInputChange("responsavel_id", "");
                                  setDepartamentoBusca("");
                                  setShowDepartamentoDropdown(false);
                                }}
                              >
                                <div className="flex items-center gap-3">
                                  <div
                                    className="w-3 h-12 rounded flex-shrink-0"
                                    style={{ backgroundColor: departamento.cor }}
                                  />
                                  <div className="flex-1">
                                    <p className={`font-medium text-sm ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
                                      {departamento.nome}
                                    </p>
                                    <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                      {departamento.usuarios_ids?.length || 0} membros
                                    </p>
                                  </div>
                                </div>
                              </div>
                            ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                {formData.responsavel_id && formData.departamento_responsavel_id && (
                  <p className="text-xs text-orange-600 mt-2">
                    ⚠️ Selecione apenas usuário OU departamento, não ambos
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3 items-center">
                {editingEtapa && (
                  <div>
                    <Label htmlFor="ordem" className="text-sm">Ordem</Label>
                    <Input
                      id="ordem"
                      type="number"
                      value={formData.ordem}
                      onChange={(e) => handleInputChange("ordem", parseInt(e.target.value))}
                      required
                      className="h-8"
                    />
                  </div>
                )}

                <div className={editingEtapa ? "" : "col-span-2"}>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="requer_aprovacao"
                        checked={formData.requer_aprovacao}
                        onChange={(e) => handleInputChange("requer_aprovacao", e.target.checked)}
                        className="w-4 h-4 rounded border-gray-300"
                      />
                      <Label htmlFor="requer_aprovacao" className="cursor-pointer text-sm">
                        Requer aprovação
                      </Label>
                    </div>

                    {editingEtapa && (
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="ativo"
                          checked={formData.ativo}
                          onChange={(e) => handleInputChange("ativo", e.target.checked)}
                          className="w-4 h-4 rounded border-gray-300"
                        />
                        <Label htmlFor="ativo" className="cursor-pointer text-sm">
                          Etapa ativa
                        </Label>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowForm(false);
                    setEditingEtapa(null);
                    resetForm();
                  }}
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={saving}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {saving ? "Salvando..." : "Salvar Etapa"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}