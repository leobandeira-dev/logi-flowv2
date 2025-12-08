import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import {
  Plus,
  Trash2,
  Edit,
  GripVertical,
  Save,
  X,
  Type,
  CheckSquare,
  Paperclip,
  DollarSign,
  ToggleLeft,
  Calendar
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

const tiposCampo = [
  { value: "texto", label: "Texto", icon: Type },
  { value: "checklist", label: "Checklist", icon: CheckSquare },
  { value: "anexo", label: "Anexo", icon: Paperclip },
  { value: "monetario", label: "R$", icon: DollarSign },
  { value: "booleano", label: "Sim/Não", icon: ToggleLeft },
  { value: "data", label: "Data", icon: Calendar }
];

export default function CamposTipoOcorrenciaManager({ tipoOcorrenciaId }) {
  const [campos, setCampos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCampo, setEditingCampo] = useState(null);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    nome: "",
    tipo: "texto",
    obrigatorio: false,
    descricao: "",
    opcoes: ""
  });

  useEffect(() => {
    if (tipoOcorrenciaId) {
      loadCampos();
    }
  }, [tipoOcorrenciaId]);

  const loadCampos = async () => {
    setLoading(true);
    try {
      const allCampos = await base44.entities.TipoOcorrenciaCampo.list("ordem");
      const camposTipo = allCampos.filter(c => c.tipo_ocorrencia_id === tipoOcorrenciaId && c.ativo);
      setCampos(camposTipo);
    } catch (error) {
      console.error("Erro ao carregar campos:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const dataToSave = {
        ...formData,
        tipo_ocorrencia_id: tipoOcorrenciaId,
        ordem: editingCampo ? formData.ordem : campos.length + 1,
        ativo: true
      };

      if (editingCampo) {
        await base44.entities.TipoOcorrenciaCampo.update(editingCampo.id, dataToSave);
      } else {
        await base44.entities.TipoOcorrenciaCampo.create(dataToSave);
      }

      setShowForm(false);
      setEditingCampo(null);
      resetForm();
      loadCampos();
    } catch (error) {
      console.error("Erro ao salvar campo:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (campo) => {
    setEditingCampo(campo);
    setFormData({
      nome: campo.nome,
      tipo: campo.tipo,
      obrigatorio: campo.obrigatorio,
      descricao: campo.descricao || "",
      opcoes: campo.opcoes || "",
      ordem: campo.ordem
    });
    setShowForm(true);
  };

  const handleDelete = async (campoId) => {
    if (!confirm("Tem certeza que deseja excluir este campo?")) return;

    try {
      await base44.entities.TipoOcorrenciaCampo.update(campoId, { ativo: false });
      loadCampos();
    } catch (error) {
      console.error("Erro ao excluir campo:", error);
    }
  };

  const resetForm = () => {
    setFormData({
      nome: "",
      tipo: "texto",
      obrigatorio: false,
      descricao: "",
      opcoes: ""
    });
  };

  const getTipoIcon = (tipo) => {
    const tipoConfig = tiposCampo.find(t => t.value === tipo);
    return tipoConfig ? tipoConfig.icon : Type;
  };

  return (
    <Card className="mt-4">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Campos Customizados</CardTitle>
          <Button
            size="sm"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              resetForm();
              setEditingCampo(null);
              setShowForm(true);
            }}
            className="bg-blue-600 hover:bg-blue-700"
            type="button"
          >
            <Plus className="w-4 h-4 mr-2" />
            Adicionar Campo
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-8 text-gray-500">
            <div className="w-6 h-6 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="text-sm">Carregando campos...</p>
          </div>
        ) : campos.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Type className="w-8 h-8 mx-auto mb-2 opacity-20" />
            <p className="text-sm">Nenhum campo cadastrado</p>
            <p className="text-xs mt-1">Campos personalizados aparecerão aqui</p>
          </div>
        ) : (
          <div className="space-y-2">
            {campos.map((campo) => {
              const Icon = getTipoIcon(campo.tipo);
              return (
                <div
                  key={campo.id}
                  className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <GripVertical className="w-4 h-4 text-gray-400 cursor-move" />
                  <Icon className="w-4 h-4 text-blue-600" />
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-sm">{campo.nome}</p>
                      {campo.obrigatorio && (
                        <Badge variant="destructive" className="text-xs px-1.5 py-0">
                          Obrigatório
                        </Badge>
                      )}
                    </div>
                    {campo.descricao && (
                      <p className="text-xs text-gray-500 mt-1">{campo.descricao}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(campo)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(campo.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>

      {showForm && (
        <div className="mt-4 p-4 border-2 rounded-lg bg-gray-50" 
             style={{
               borderColor: '#3b82f6'
             }}>
          <h4 className="font-semibold mb-4 text-sm text-gray-900">
            {editingCampo ? "Editar Campo" : "Novo Campo"}
          </h4>

          <form onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleSubmit(e);
          }} className="space-y-4">
            <div>
              <Label htmlFor="nome">Nome do Campo *</Label>
              <Input
                id="nome"
                value={formData.nome}
                onChange={(e) => handleInputChange("nome", e.target.value)}
                placeholder="Ex: Número da Apólice, Fotos do Local"
                required
              />
            </div>

            <div>
              <Label htmlFor="tipo">Tipo de Campo *</Label>
              <Select
                value={formData.tipo}
                onValueChange={(value) => handleInputChange("tipo", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {tiposCampo.map((tipo) => {
                    const Icon = tipo.icon;
                    return (
                      <SelectItem key={tipo.value} value={tipo.value}>
                        <div className="flex items-center gap-2">
                          <Icon className="w-4 h-4" />
                          {tipo.label}
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            {formData.tipo === "checklist" && (
              <div>
                <Label htmlFor="opcoes">Opções (uma por linha)</Label>
                <Textarea
                  id="opcoes"
                  value={formData.opcoes}
                  onChange={(e) => handleInputChange("opcoes", e.target.value)}
                  placeholder="Acionou seguro&#10;Comunicou autoridades&#10;Fotografou local"
                  rows={4}
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Digite cada opção em uma linha separada
                </p>
              </div>
            )}

            <div>
              <Label htmlFor="descricao">Descrição/Ajuda</Label>
              <Textarea
                id="descricao"
                value={formData.descricao}
                onChange={(e) => handleInputChange("descricao", e.target.value)}
                placeholder="Orientações sobre como preencher este campo"
                rows={2}
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="obrigatorio"
                checked={formData.obrigatorio}
                onChange={(e) => handleInputChange("obrigatorio", e.target.checked)}
                className="w-4 h-4 rounded border-gray-300"
              />
              <Label htmlFor="obrigatorio" className="cursor-pointer">
                Campo obrigatório para registrar ocorrência
              </Label>
            </div>

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setShowForm(false);
                  setEditingCampo(null);
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
                {saving ? "Salvando..." : "Salvar Campo"}
              </Button>
            </div>
          </form>
        </div>
      )}
    </Card>
  );
}