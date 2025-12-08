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
import { Save, X } from "lucide-react";

const frotaOptions = [
  { value: "própria", label: "Própria" },
  { value: "terceirizada", label: "Terceirizada" }
];

export default function OrdemForm({ open, onClose, onSubmit, motoristas, veiculos, editingOrdem }) {
  const [formData, setFormData] = useState({
    cliente: "",
    origem: "",
    destino: "",
    produto: "",
    peso: "",
    valor_tonelada: "",
    motorista_id: "",
    veiculo_id: "",
    frota: "própria",
    duv: "",
    numero_oc: "",
    observacao_carga: ""
  });

  const [valorTotal, setValorTotal] = useState(0);

  useEffect(() => {
    if (editingOrdem) {
      setFormData({
        cliente: editingOrdem.cliente || "",
        origem: editingOrdem.origem || "",
        destino: editingOrdem.destino || "",
        produto: editingOrdem.produto || "",
        peso: editingOrdem.peso || "",
        valor_tonelada: editingOrdem.valor_tonelada || "",
        motorista_id: editingOrdem.motorista_id || "",
        veiculo_id: editingOrdem.veiculo_id || "",
        frota: editingOrdem.frota || "própria",
        duv: editingOrdem.duv || "",
        numero_oc: editingOrdem.numero_oc || "",
        observacao_carga: editingOrdem.observacao_carga || ""
      });
    }
  }, [editingOrdem]);

  useEffect(() => {
    if (formData.peso && formData.valor_tonelada) {
      const peso = parseFloat(formData.peso);
      const valorTonelada = parseFloat(formData.valor_tonelada);
      const total = (peso / 1000) * valorTonelada;
      setValorTotal(total);
    } else {
      setValorTotal(0);
    }
  }, [formData.peso, formData.valor_tonelada]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Converter strings para números onde necessário
    const dataToSubmit = {
      ...formData,
      peso: parseFloat(formData.peso),
      valor_tonelada: parseFloat(formData.valor_tonelada)
    };
    
    onSubmit(dataToSubmit);
  };

  const isFormValid = () => {
    return formData.cliente && formData.origem && formData.destino && 
           formData.produto && formData.peso && formData.valor_tonelada;
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editingOrdem ? "Editar Ordem de Carregamento" : "Nova Ordem de Carregamento"}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="cliente">Cliente *</Label>
              <Input
                id="cliente"
                value={formData.cliente}
                onChange={(e) => handleInputChange("cliente", e.target.value)}
                placeholder="Nome do cliente"
                required
              />
            </div>
            <div>
              <Label htmlFor="frota">Tipo de Frota</Label>
              <Select value={formData.frota} onValueChange={(value) => handleInputChange("frota", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {frotaOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="origem">Origem *</Label>
              <Input
                id="origem"
                value={formData.origem}
                onChange={(e) => handleInputChange("origem", e.target.value)}
                placeholder="Local de origem"
                required
              />
            </div>
            <div>
              <Label htmlFor="destino">Destino *</Label>
              <Input
                id="destino"
                value={formData.destino}
                onChange={(e) => handleInputChange("destino", e.target.value)}
                placeholder="Local de destino"
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="produto">Produto *</Label>
            <Input
              id="produto"
              value={formData.produto}
              onChange={(e) => handleInputChange("produto", e.target.value)}
              placeholder="Produto a ser transportado"
              required
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="peso">Peso (kg) *</Label>
              <Input
                id="peso"
                type="number"
                value={formData.peso}
                onChange={(e) => handleInputChange("peso", e.target.value)}
                placeholder="Peso em kg"
                required
              />
            </div>
            <div>
              <Label htmlFor="valor_tonelada">Valor/Tonelada *</Label>
              <Input
                id="valor_tonelada"
                type="number"
                step="0.01"
                value={formData.valor_tonelada}
                onChange={(e) => handleInputChange("valor_tonelada", e.target.value)}
                placeholder="Valor por tonelada"
                required
              />
            </div>
            <div>
              <Label>Valor Total</Label>
              <div className="p-2 bg-gray-50 rounded border text-sm font-medium">
                R$ {valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="motorista">Motorista</Label>
              <Select value={formData.motorista_id} onValueChange={(value) => handleInputChange("motorista_id", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um motorista" />
                </SelectTrigger>
                <SelectContent>
                  {motoristas.map((motorista) => (
                    <SelectItem key={motorista.id} value={motorista.id}>
                      {motorista.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="veiculo">Veículo</Label>
              <Select value={formData.veiculo_id} onValueChange={(value) => handleInputChange("veiculo_id", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um veículo" />
                </SelectTrigger>
                <SelectContent>
                  {veiculos.map((veiculo) => (
                    <SelectItem key={veiculo.id} value={veiculo.id}>
                      {veiculo.placa} - {veiculo.marca} {veiculo.modelo}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="duv">DUV</Label>
              <Input
                id="duv"
                value={formData.duv}
                onChange={(e) => handleInputChange("duv", e.target.value)}
                placeholder="Número DUV"
              />
            </div>
            <div>
              <Label htmlFor="numero_oc">Número OC</Label>
              <Input
                id="numero_oc"
                value={formData.numero_oc}
                onChange={(e) => handleInputChange("numero_oc", e.target.value)}
                placeholder="Número da OC"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="observacao_carga">Observações</Label>
            <Textarea
              id="observacao_carga"
              value={formData.observacao_carga}
              onChange={(e) => handleInputChange("observacao_carga", e.target.value)}
              placeholder="Observações sobre a carga"
              rows={3}
            />
          </div>
        </form>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            <X className="w-4 h-4 mr-2" />
            Cancelar
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={!isFormValid()}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Save className="w-4 h-4 mr-2" />
            {editingOrdem ? "Atualizar" : "Criar"} Ordem
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}