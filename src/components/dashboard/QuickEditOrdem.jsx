import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Save, Loader2, Package, MapPin, User, Truck, Calendar } from "lucide-react";

const statusTrackingOptions = [
  { value: "aguardando_agendamento", label: "Aguardando Agendamento" },
  { value: "carregamento_agendado", label: "Carregamento Agendado" },
  { value: "em_carregamento", label: "Em Carregamento" },
  { value: "carregado", label: "Carregado" },
  { value: "em_viagem", label: "Em Viagem" },
  { value: "chegada_destino", label: "Chegada no Destino" },
  { value: "descarga_agendada", label: "Descarga Agendada" },
  { value: "em_descarga", label: "Em Descarga" },
  { value: "descarga_realizada", label: "Descarga Realizada" },
  { value: "finalizado", label: "Finalizado" }
];

export default function QuickEditOrdem({ open, onClose, ordem, motoristas, veiculos, onUpdate }) {
  const [formData, setFormData] = useState({});
  const [saving, setSaving] = useState(false);
  const [isDark, setIsDark] = useState(false);

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
    if (ordem) {
      setFormData({
        status_tracking: ordem.status_tracking || "aguardando_agendamento",
        motorista_id: ordem.motorista_id || "",
        cavalo_id: ordem.cavalo_id || "",
        implemento1_id: ordem.implemento1_id || "",
        implemento2_id: ordem.implemento2_id || "",
        implemento3_id: ordem.implemento3_id || "",
        carregamento_agendamento_data: ordem.carregamento_agendamento_data || "",
        data_programacao_descarga: ordem.data_programacao_descarga || "",
        descarga_agendamento_data: ordem.descarga_agendamento_data || "",
        localizacao_atual: ordem.localizacao_atual || "",
        km_faltam: ordem.km_faltam || "",
      });
    }
  }, [ordem]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const dataToSave = {
        ...formData,
        km_faltam: formData.km_faltam ? parseFloat(formData.km_faltam) : null
      };

      await base44.entities.OrdemDeCarregamento.update(ordem.id, dataToSave);
      
      if (onUpdate) {
        await onUpdate();
      }
      
      onClose();
    } catch (error) {
      console.error("Erro ao salvar ordem:", error);
      alert("Erro ao salvar alterações");
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

  const formatDateForInput = (dateString) => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      return date.toISOString().slice(0, 10);
    } catch {
      return "";
    }
  };

  const theme = {
    bg: isDark ? '#1e293b' : '#ffffff',
    text: isDark ? '#f1f5f9' : '#111827',
    textMuted: isDark ? '#94a3b8' : '#6b7280',
    border: isDark ? '#334155' : '#e5e7eb',
  };

  const motoristasOrdenados = [...motoristas].sort((a, b) => 
    a.nome.localeCompare(b.nome)
  );

  const veiculosOrdenados = [...veiculos].sort((a, b) => 
    a.placa.localeCompare(b.placa)
  );

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="w-5 h-5 text-blue-600" />
            Edição Rápida - {ordem?.numero_carga || `#${ordem?.id?.slice(-6)}`}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Status Tracking */}
          <div>
            <Label className="text-base font-bold mb-3 flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Status do Tracking
            </Label>
            <Select
              value={formData.status_tracking}
              onValueChange={(value) => setFormData({ ...formData, status_tracking: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {statusTrackingOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Motorista e Veículos */}
          <div>
            <Label className="text-base font-bold mb-3 flex items-center gap-2">
              <User className="w-4 h-4" />
              Motorista e Veículos
            </Label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="motorista_id">Motorista</Label>
                <Select
                  value={formData.motorista_id}
                  onValueChange={(value) => setFormData({ ...formData, motorista_id: value || "" })}
                >
                  <SelectTrigger id="motorista_id">
                    <SelectValue placeholder="Selecione um motorista" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={null}>Nenhum</SelectItem>
                    {motoristasOrdenados.map((motorista) => (
                      <SelectItem key={motorista.id} value={motorista.id}>
                        {motorista.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="cavalo_id">Cavalo</Label>
                <Select
                  value={formData.cavalo_id}
                  onValueChange={(value) => setFormData({ ...formData, cavalo_id: value || "" })}
                >
                  <SelectTrigger id="cavalo_id">
                    <SelectValue placeholder="Selecione um cavalo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={null}>Nenhum</SelectItem>
                    {veiculosOrdenados.filter(v => v.tipo === "cavalo").map((veiculo) => (
                      <SelectItem key={veiculo.id} value={veiculo.id}>
                        {veiculo.placa} - {veiculo.marca} {veiculo.modelo}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="implemento1_id">Implemento 1</Label>
                <Select
                  value={formData.implemento1_id}
                  onValueChange={(value) => setFormData({ ...formData, implemento1_id: value || "" })}
                >
                  <SelectTrigger id="implemento1_id">
                    <SelectValue placeholder="Selecione um implemento" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={null}>Nenhum</SelectItem>
                    {veiculosOrdenados.filter(v => v.tipo !== "cavalo").map((veiculo) => (
                      <SelectItem key={veiculo.id} value={veiculo.id}>
                        {veiculo.placa} - {veiculo.tipo}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="implemento2_id">Implemento 2</Label>
                <Select
                  value={formData.implemento2_id}
                  onValueChange={(value) => setFormData({ ...formData, implemento2_id: value || "" })}
                >
                  <SelectTrigger id="implemento2_id">
                    <SelectValue placeholder="Selecione um implemento" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={null}>Nenhum</SelectItem>
                    {veiculosOrdenados.filter(v => v.tipo !== "cavalo").map((veiculo) => (
                      <SelectItem key={veiculo.id} value={veiculo.id}>
                        {veiculo.placa} - {veiculo.tipo}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Datas */}
          <div>
            <Label className="text-base font-bold mb-3 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Datas
            </Label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="carregamento_agendamento_data">Carregamento Agendado</Label>
                <Input
                  id="carregamento_agendamento_data"
                  type="datetime-local"
                  value={formatDateTimeForInput(formData.carregamento_agendamento_data)}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    carregamento_agendamento_data: e.target.value ? new Date(e.target.value).toISOString() : "" 
                  })}
                />
              </div>

              <div>
                <Label htmlFor="data_programacao_descarga">Data Programada Descarga</Label>
                <Input
                  id="data_programacao_descarga"
                  type="date"
                  value={formatDateForInput(formData.data_programacao_descarga)}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    data_programacao_descarga: e.target.value ? new Date(e.target.value).toISOString() : "" 
                  })}
                />
              </div>

              <div>
                <Label htmlFor="descarga_agendamento_data">Descarga Agendada</Label>
                <Input
                  id="descarga_agendamento_data"
                  type="datetime-local"
                  value={formatDateTimeForInput(formData.descarga_agendamento_data)}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    descarga_agendamento_data: e.target.value ? new Date(e.target.value).toISOString() : "" 
                  })}
                />
              </div>
            </div>
          </div>

          {/* Localização */}
          <div>
            <Label className="text-base font-bold mb-3 flex items-center gap-2">
              <Truck className="w-4 h-4" />
              Localização Atual
            </Label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="localizacao_atual">Localização</Label>
                <Input
                  id="localizacao_atual"
                  value={formData.localizacao_atual}
                  onChange={(e) => setFormData({ ...formData, localizacao_atual: e.target.value })}
                  placeholder="Ex: Rodovia BR-116, KM 350"
                />
              </div>

              <div>
                <Label htmlFor="km_faltam">KM Restantes</Label>
                <Input
                  id="km_faltam"
                  type="number"
                  value={formData.km_faltam}
                  onChange={(e) => setFormData({ ...formData, km_faltam: e.target.value })}
                  placeholder="0"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t" style={{ borderColor: theme.border }}>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={saving}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Salvar Alterações
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}