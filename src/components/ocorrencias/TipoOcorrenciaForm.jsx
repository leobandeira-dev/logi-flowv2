import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Save, Clock } from "lucide-react";
import { base44 } from "@/api/base44Client";
import CamposTipoOcorrenciaManager from "./CamposTipoOcorrenciaManager";

export default function TipoOcorrenciaForm({ open, onClose, onSubmit, editingTipo }) {
  const [formData, setFormData] = useState({
    nome: "",
    codigo: "",
    categoria: "fluxo",
    descricao: "",
    cor: "#EF4444",
    icone: "AlertTriangle",
    gravidade_padrao: "media",
    prazo_sla_minutos: "",
    responsavel_padrao_id: "",
    departamento_responsavel_id: "",
    ativo: true,
    requer_imagem: false
  });
  const [usuarios, setUsuarios] = useState([]);
  const [departamentos, setDepartamentos] = useState([]);

  const isDuplicating = editingTipo && !editingTipo.id;

  useEffect(() => {
    if (open) {
      loadUsuariosEDepartamentos();
    }
  }, [open]);

  useEffect(() => {
    if (editingTipo) {
      // Converter horas para minutos se necessário (compatibilidade com dados antigos)
      let prazoMinutos = editingTipo.prazo_sla_minutos;
      
      if (!prazoMinutos && editingTipo.prazo_sla_horas) {
        prazoMinutos = editingTipo.prazo_sla_horas * 60;
      }
      
      setFormData({
        ...editingTipo,
        prazo_sla_minutos: prazoMinutos !== undefined && prazoMinutos !== null 
          ? String(prazoMinutos) 
          : "",
        responsavel_padrao_id: editingTipo.responsavel_padrao_id || "",
        departamento_responsavel_id: editingTipo.departamento_responsavel_id || ""
      });
    } else {
      setFormData({
        nome: "",
        codigo: "",
        categoria: "fluxo",
        descricao: "",
        cor: "#EF4444",
        icone: "AlertTriangle",
        gravidade_padrao: "media",
        prazo_sla_minutos: "",
        responsavel_padrao_id: "",
        departamento_responsavel_id: "",
        ativo: true,
        requer_imagem: false
      });
    }
  }, [editingTipo, open]);

  const loadUsuariosEDepartamentos = async () => {
    try {
      const user = await base44.auth.me();
      
      if (user.role === "admin") {
        const [usuariosData, departamentosData] = await Promise.all([
          base44.entities.User.list(),
          base44.entities.Departamento.list()
        ]);
        setUsuarios(usuariosData.filter(u => u.tipo_perfil === "operador" || u.role === "admin"));
        setDepartamentos(departamentosData);
      } else {
        setUsuarios([]);
        setDepartamentos([]);
      }
    } catch (error) {
      console.log("Erro ao carregar usuários/departamentos:", error);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const dataToSubmit = {
      ...formData,
      prazo_sla_minutos: formData.prazo_sla_minutos ? parseFloat(formData.prazo_sla_minutos) : null,
      responsavel_padrao_id: formData.responsavel_padrao_id || null,
      departamento_responsavel_id: formData.departamento_responsavel_id || null
    };
    onSubmit(dataToSubmit);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isDuplicating ? "Duplicar Tipo de Ocorrência" : editingTipo ? "Editar Tipo de Ocorrência" : "Novo Tipo de Ocorrência"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Nome *</Label>
              <Input
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                placeholder="Ex: Atraso na aprovação"
                required
              />
            </div>

            <div>
              <Label>Código</Label>
              <Input
                value={formData.codigo}
                onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
                placeholder="Ex: ATR-APR"
              />
            </div>
          </div>

          <div>
            <Label>Categoria *</Label>
            <Select
              value={formData.categoria}
              onValueChange={(value) => setFormData({ ...formData, categoria: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tracking">Tracking (Viagem)</SelectItem>
                <SelectItem value="fluxo">Fluxo (Processos)</SelectItem>
                <SelectItem value="tarefa">Tarefa (Não impacta SLA)</SelectItem>
                <SelectItem value="diaria">Diária (Cobrança)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Descrição</Label>
            <Textarea
              value={formData.descricao}
              onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
              placeholder="Descreva quando usar este tipo..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label>Gravidade Padrão</Label>
              <Select
                value={formData.gravidade_padrao}
                onValueChange={(value) => setFormData({ ...formData, gravidade_padrao: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="baixa">Baixa</SelectItem>
                  <SelectItem value="media">Média</SelectItem>
                  <SelectItem value="alta">Alta</SelectItem>
                  <SelectItem value="critica">Crítica</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Prazo SLA (minutos)
              </Label>
              <Input
                type="number"
                step="1"
                min="0"
                value={formData.prazo_sla_minutos}
                onChange={(e) => setFormData({ ...formData, prazo_sla_minutos: e.target.value })}
                placeholder="Ex: 1440"
              />
              {formData.prazo_sla_minutos && (
                <p className="text-xs text-gray-500 mt-1">
                  ≈ {(parseFloat(formData.prazo_sla_minutos) / 60).toFixed(1)}h
                </p>
              )}
            </div>

            <div>
              <Label>Cor</Label>
              <Input
                type="color"
                value={formData.cor}
                onChange={(e) => setFormData({ ...formData, cor: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Responsável Padrão</Label>
              <Select
                value={formData.responsavel_padrao_id}
                onValueChange={(value) => setFormData({ ...formData, responsavel_padrao_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione (opcional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={null}>Nenhum</SelectItem>
                  {usuarios.map(u => (
                    <SelectItem key={u.id} value={u.id}>
                      {u.full_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Departamento Responsável</Label>
              <Select
                value={formData.departamento_responsavel_id}
                onValueChange={(value) => setFormData({ ...formData, departamento_responsavel_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione (opcional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={null}>Nenhum</SelectItem>
                  {departamentos.map(d => (
                    <SelectItem key={d.id} value={d.id}>
                      {d.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              id="requer_imagem"
              checked={formData.requer_imagem}
              onCheckedChange={(checked) => setFormData({ ...formData, requer_imagem: checked })}
            />
            <Label htmlFor="requer_imagem" className="cursor-pointer">
              Requer anexo de imagem
            </Label>
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              id="ativo"
              checked={formData.ativo}
              onCheckedChange={(checked) => setFormData({ ...formData, ativo: checked })}
            />
            <Label htmlFor="ativo" className="cursor-pointer">
              Tipo ativo
            </Label>
            </div>

            {editingTipo && editingTipo.id && (
            <CamposTipoOcorrenciaManager tipoOcorrenciaId={editingTipo.id} />
            )}

            <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
              <Save className="w-4 h-4 mr-2" />
              {isDuplicating ? "Criar Cópia" : editingTipo ? "Atualizar" : "Criar"}
            </Button>
            </DialogFooter>
            </form>
            </DialogContent>
            </Dialog>
  );
}