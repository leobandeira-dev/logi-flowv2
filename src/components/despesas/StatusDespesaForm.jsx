import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

export default function StatusDespesaForm({ open, onClose, status, onSuccess }) {
  const [formData, setFormData] = useState({
    nome: "",
    codigo: "",
    cor: "#3B82F6",
    ordem: 1,
    ativo: true,
    padrao: false
  });

  useEffect(() => {
    if (status) {
      setFormData({
        nome: status.nome || "",
        codigo: status.codigo || "",
        cor: status.cor || "#3B82F6",
        ordem: status.ordem || 1,
        ativo: status.ativo !== undefined ? status.ativo : true,
        padrao: status.padrao || false
      });
    }
  }, [status]);

  const handleSubmit = () => {
    if (!formData.nome) {
      toast.error("Nome é obrigatório");
      return;
    }
    if (!formData.codigo) {
      toast.error("Código é obrigatório");
      return;
    }
    onSuccess(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{status ? "Editar" : "Novo"} Status</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div>
            <Label>Nome do Status *</Label>
            <Input
              value={formData.nome}
              onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
              placeholder="Ex: Pendente, Aprovada..."
            />
          </div>

          <div>
            <Label>Código *</Label>
            <Input
              value={formData.codigo}
              onChange={(e) => setFormData({ ...formData, codigo: e.target.value.toLowerCase().replace(/\s+/g, '_') })}
              placeholder="Ex: pendente, aprovada..."
              disabled={!!status}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Identificador único (não pode ser alterado após criação)
            </p>
          </div>

          <div>
            <Label>Cor</Label>
            <div className="flex items-center gap-3">
              <Input
                type="color"
                value={formData.cor}
                onChange={(e) => setFormData({ ...formData, cor: e.target.value })}
                className="w-20 h-10 cursor-pointer"
              />
              <Input
                value={formData.cor}
                onChange={(e) => setFormData({ ...formData, cor: e.target.value })}
                placeholder="#3B82F6"
                className="flex-1"
              />
            </div>
          </div>

          <div>
            <Label>Ordem de Exibição</Label>
            <Input
              type="number"
              value={formData.ordem}
              onChange={(e) => setFormData({ ...formData, ordem: parseInt(e.target.value) || 1 })}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label>Status Ativo</Label>
            <Switch
              checked={formData.ativo}
              onCheckedChange={(checked) => setFormData({ ...formData, ativo: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Status Padrão</Label>
              <p className="text-xs text-muted-foreground">Para novas despesas</p>
            </div>
            <Switch
              checked={formData.padrao}
              onCheckedChange={(checked) => setFormData({ ...formData, padrao: checked })}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} className="bg-blue-600 hover:bg-blue-700">
            {status ? "Atualizar" : "Criar"} Status
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}