import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function TipoDespesaForm({ open, onClose, tipo, onSuccess }) {
  const [formData, setFormData] = useState(tipo || {
    nome: "",
    codigo: "",
    descricao: "",
    valor_padrao: 0,
    unidade_cobranca: "unidade",
    ativo: true
  });

  const handleSubmit = () => {
    if (!formData.nome) {
      alert("Nome é obrigatório");
      return;
    }
    onSuccess(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{tipo ? "Editar" : "Novo"} Tipo de Despesa</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div>
            <Label>Nome *</Label>
            <Input
              value={formData.nome}
              onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
              placeholder="Ex: Carga, Descarga, Munck..."
            />
          </div>
          <div>
            <Label>Código</Label>
            <Input
              value={formData.codigo}
              onChange={(e) => setFormData({ ...formData, codigo: e.target.value.toUpperCase() })}
              placeholder="Ex: CARGA, DESC, MUNCK"
            />
          </div>
          <div>
            <Label>Descrição</Label>
            <Textarea
              value={formData.descricao}
              onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
              placeholder="Descrição detalhada..."
              rows={3}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Valor Padrão (R$)</Label>
              <Input
                type="number"
                step="0.01"
                value={formData.valor_padrao}
                onChange={(e) => setFormData({ ...formData, valor_padrao: parseFloat(e.target.value) || 0 })}
              />
            </div>
            <div>
              <Label>Unidade Cobrança</Label>
              <Select
                value={formData.unidade_cobranca}
                onValueChange={(value) => setFormData({ ...formData, unidade_cobranca: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unidade">Unidade</SelectItem>
                  <SelectItem value="tonelada">Tonelada</SelectItem>
                  <SelectItem value="m3">m³</SelectItem>
                  <SelectItem value="hora">Hora</SelectItem>
                  <SelectItem value="viagem">Viagem</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleSubmit} className="bg-blue-600 hover:bg-blue-700">
            {tipo ? "Atualizar" : "Criar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}