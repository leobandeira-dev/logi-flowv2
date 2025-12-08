import React, { useState } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { base44 } from "@/api/base44Client";
import { Save, Loader2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

const tiposOcorrencia = [
  { value: "pneu_furado", label: "Pneu Furado" },
  { value: "problema_mecanico", label: "Problema Mecânico" },
  { value: "acidente", label: "Acidente" },
  { value: "atraso_origem", label: "Atraso na Origem" },
  { value: "atraso_destino", label: "Atraso no Destino" },
  { value: "documentacao_incorreta", label: "Documentação Incorreta/Faltante" },
  { value: "avaria_carga", label: "Avaria na Carga" },
  { value: "problema_rastreador", label: "Problema com Rastreador" },
  { value: "falta_combustivel", label: "Falta de Combustível" },
  { value: "condicoes_climaticas", label: "Condições Climáticas Adversas" },
  { value: "bloqueio_estrada", label: "Bloqueio de Estrada" },
  { value: "fiscalizacao", label: "Fiscalização/Abordagem" },
  { value: "recusa_carga", label: "Recusa de Carga" },
  { value: "problema_motorista", label: "Problema com Motorista" },
  { value: "roubo_tentativa", label: "Roubo/Tentativa de Roubo" },
  { value: "outro", label: "Outro" }
];

const gravidadeOptions = [
  { value: "baixa", label: "Baixa", color: "text-blue-600" },
  { value: "media", label: "Média", color: "text-yellow-600" },
  { value: "alta", label: "Alta", color: "text-orange-600" },
  { value: "critica", label: "Crítica", color: "text-red-600" }
];

export default function OcorrenciaModal({ open, onClose, ordem, onSuccess }) {
  const [formData, setFormData] = useState({
    tipo: "",
    data_inicio: new Date().toISOString(),
    data_fim: "",
    observacoes: "",
    localizacao: "",
    gravidade: "media",
    status: "aberta"
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.tipo || !formData.observacoes) {
      toast.error("Preencha o tipo e as observações da ocorrência");
      return;
    }

    setSaving(true);
    try {
      const user = await base44.auth.me();
      
      const tipoSelecionado = tiposOcorrencia.find(t => t.value === formData.tipo);
      
      await base44.entities.Ocorrencia.create({
        ordem_id: ordem.id,
        tipo: formData.tipo,
        descricao_tipo: tipoSelecionado?.label || formData.tipo,
        data_inicio: formData.data_inicio,
        data_fim: formData.data_fim || null,
        observacoes: formData.observacoes,
        localizacao: formData.localizacao,
        gravidade: formData.gravidade,
        status: formData.status,
        registrado_por: user.id
      });

      toast.success("Ocorrência registrada com sucesso!");
      onSuccess();
      onClose();
      
      // Reset form
      setFormData({
        tipo: "",
        data_inicio: new Date().toISOString(),
        data_fim: "",
        observacoes: "",
        localizacao: "",
        gravidade: "media",
        status: "aberta"
      });
    } catch (error) {
      console.error("Erro ao registrar ocorrência:", error);
      toast.error("Erro ao registrar ocorrência");
    } finally {
      setSaving(false);
    }
  };

  const formatDateTimeForInput = (dateString) => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      return date.toISOString().slice(0, 16);
    } catch {
      return "";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-orange-600" />
            Registrar Ocorrência - {ordem?.numero_carga || `#${ordem?.id.slice(-6)}`}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="tipo">Tipo de Ocorrência *</Label>
            <Select
              value={formData.tipo}
              onValueChange={(value) => setFormData({ ...formData, tipo: value })}
            >
              <SelectTrigger id="tipo">
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                {tiposOcorrencia.map((tipo) => (
                  <SelectItem key={tipo.value} value={tipo.value}>
                    {tipo.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="gravidade">Gravidade *</Label>
            <Select
              value={formData.gravidade}
              onValueChange={(value) => setFormData({ ...formData, gravidade: value })}
            >
              <SelectTrigger id="gravidade">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {gravidadeOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    <span className={opt.color}>{opt.label}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="data_inicio">Data/Hora Início *</Label>
              <Input
                id="data_inicio"
                type="datetime-local"
                value={formatDateTimeForInput(formData.data_inicio)}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  data_inicio: e.target.value ? new Date(e.target.value).toISOString() : "" 
                })}
              />
            </div>

            <div>
              <Label htmlFor="data_fim">Data/Hora Fim</Label>
              <Input
                id="data_fim"
                type="datetime-local"
                value={formatDateTimeForInput(formData.data_fim)}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  data_fim: e.target.value ? new Date(e.target.value).toISOString() : "" 
                })}
              />
              <p className="text-xs text-gray-500 mt-1">
                Deixe em branco se ainda não foi resolvida
              </p>
            </div>
          </div>

          <div>
            <Label htmlFor="localizacao">Localização</Label>
            <Input
              id="localizacao"
              value={formData.localizacao}
              onChange={(e) => setFormData({ ...formData, localizacao: e.target.value })}
              placeholder="Ex: KM 350 da BR-116, próximo a Curitiba"
            />
          </div>

          <div>
            <Label htmlFor="observacoes">Observações *</Label>
            <Textarea
              id="observacoes"
              value={formData.observacoes}
              onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
              placeholder="Descreva detalhadamente a ocorrência..."
              rows={4}
            />
          </div>

          <div>
            <Label htmlFor="status">Status</Label>
            <Select
              value={formData.status}
              onValueChange={(value) => setFormData({ ...formData, status: value })}
            >
              <SelectTrigger id="status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="aberta">Aberta</SelectItem>
                <SelectItem value="resolvida">Resolvida</SelectItem>
                <SelectItem value="cancelada">Cancelada</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={saving}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={saving}
              className="bg-orange-600 hover:bg-orange-700"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Registrando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Registrar Ocorrência
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}