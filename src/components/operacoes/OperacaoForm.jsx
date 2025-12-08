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
import { Save, X, Calendar, AlertCircle } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

const modalidadeOptions = [
  { value: "normal", label: "Normal" },
  { value: "expresso", label: "Expresso" }
];

const prioridadeOptions = [
  { value: "baixa", label: "Baixa" },
  { value: "media", label: "Média" },
  { value: "alta", label: "Alta" },
  { value: "urgente", label: "Urgente" }
];

export default function OperacaoForm({ open, onClose, onSubmit, editingOperacao, nomeInicial, codigoInicial }) {
  const [isDark, setIsDark] = useState(false);
  const [formData, setFormData] = useState({
    nome: "",
    codigo: "",
    modalidade: "normal",
    prioridade: "media",
    descricao: "",
    tolerancia_horas: "",
    prazo_entrega_dias: "",
    prazo_entrega_usa_agenda_descarga: false,
    prazo_entrega_dias_uteis: false,
    ativo: true
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
    if (editingOperacao) {
      setFormData({
        nome: editingOperacao.nome || "",
        codigo: editingOperacao.codigo || "",
        modalidade: editingOperacao.modalidade || "normal",
        prioridade: editingOperacao.prioridade || "media",
        descricao: editingOperacao.descricao || "",
        tolerancia_horas: editingOperacao.tolerancia_horas !== undefined && editingOperacao.tolerancia_horas !== null ? String(editingOperacao.tolerancia_horas) : "",
        prazo_entrega_dias: editingOperacao.prazo_entrega_dias !== undefined && editingOperacao.prazo_entrega_dias !== null ? String(editingOperacao.prazo_entrega_dias) : "",
        prazo_entrega_usa_agenda_descarga: editingOperacao.prazo_entrega_usa_agenda_descarga || false,
        prazo_entrega_dias_uteis: editingOperacao.prazo_entrega_dias_uteis || false,
        ativo: editingOperacao.ativo !== undefined ? editingOperacao.ativo : true
      });
    } else {
      setFormData({
        nome: nomeInicial || "",
        codigo: codigoInicial || "",
        modalidade: "normal",
        prioridade: "media",
        descricao: "",
        tolerancia_horas: "",
        prazo_entrega_dias: "",
        prazo_entrega_usa_agenda_descarga: false,
        prazo_entrega_dias_uteis: false,
        ativo: true
      });
    }
  }, [editingOperacao, nomeInicial, codigoInicial]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const dataToSubmit = {
      ...formData,
      tolerancia_horas: formData.tolerancia_horas ? parseFloat(formData.tolerancia_horas) : null,
      prazo_entrega_dias: formData.prazo_entrega_dias ? parseFloat(formData.prazo_entrega_dias) : null,
      prazo_entrega_usa_agenda_descarga: formData.prazo_entrega_usa_agenda_descarga,
      prazo_entrega_dias_uteis: formData.prazo_entrega_dias_uteis
    };
    onSubmit(dataToSubmit);
  };

  const isFormValid = () => {
    return formData.nome && formData.modalidade && formData.prioridade;
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {editingOperacao ? "Editar Operação" : "Nova Operação"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="nome">Nome da Operação *</Label>
            <Input
              id="nome"
              value={formData.nome}
              onChange={(e) => handleInputChange("nome", e.target.value)}
              placeholder="Ex: Transporte SP-RJ, Carga Frigorificada"
              required
              autoFocus
            />
          </div>

          <div>
            <Label htmlFor="codigo">Código</Label>
            <Input
              id="codigo"
              value={formData.codigo}
              onChange={(e) => handleInputChange("codigo", e.target.value.toUpperCase())}
              placeholder="Ex: OP-001, EXPR-RJ"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="modalidade">Modalidade *</Label>
              <Select 
                value={formData.modalidade} 
                onValueChange={(value) => handleInputChange("modalidade", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {modalidadeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="prioridade">Prioridade *</Label>
              <Select 
                value={formData.prioridade} 
                onValueChange={(value) => handleInputChange("prioridade", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {prioridadeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="tolerancia_horas">Tolerância (horas)</Label>
            <Input
              id="tolerancia_horas"
              type="number"
              step="0.5"
              value={formData.tolerancia_horas}
              onChange={(e) => handleInputChange("tolerancia_horas", e.target.value)}
              placeholder="Ex: 2 (para 2 horas de tolerância)"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Tempo de tolerância em horas para cálculo de diárias
            </p>
          </div>

          <div 
            className="border rounded-lg p-4"
            style={{
              backgroundColor: isDark ? '#1e293b' : '#eff6ff',
              borderColor: isDark ? '#475569' : '#bfdbfe'
            }}
          >
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="w-4 h-4" style={{ color: isDark ? '#60a5fa' : '#2563eb' }} />
              <Label className="text-sm font-bold" style={{ color: isDark ? '#f1f5f9' : '#111827' }}>
                Configuração de Prazo de Entrega
              </Label>
            </div>

            <div className="space-y-3">
              <div 
                className="flex items-start gap-3 rounded-lg p-3 border"
                style={{
                  backgroundColor: isDark ? '#334155' : '#ffffff',
                  borderColor: isDark ? '#475569' : '#e5e7eb'
                }}
              >
                <Checkbox
                  id="usa_agenda_descarga"
                  checked={formData.prazo_entrega_usa_agenda_descarga}
                  onCheckedChange={(checked) => handleInputChange("prazo_entrega_usa_agenda_descarga", checked)}
                  className="mt-1"
                />
                <div className="flex-1">
                  <Label 
                    htmlFor="usa_agenda_descarga" 
                    className="cursor-pointer font-semibold text-sm"
                    style={{ color: isDark ? '#f1f5f9' : '#111827' }}
                  >
                    Prazo de Entrega = Agenda de Descarga
                  </Label>
                  <p className="text-xs mt-1 leading-relaxed" style={{ color: isDark ? '#cbd5e1' : '#4b5563' }}>
                    Quando ativado, o prazo de entrega será igual à data de agendamento de descarga
                  </p>
                </div>
              </div>

              {!formData.prazo_entrega_usa_agenda_descarga && (
                <div 
                  className="rounded-lg p-3 border"
                  style={{
                    backgroundColor: isDark ? '#334155' : '#ffffff',
                    borderColor: isDark ? '#475569' : '#e5e7eb'
                  }}
                >
                  <Label 
                    htmlFor="prazo_entrega_dias" 
                    className="flex items-center gap-1 font-semibold"
                    style={{ color: isDark ? '#f1f5f9' : '#111827' }}
                  >
                    <AlertCircle className="w-3 h-3" />
                    Prazo de Entrega (dias)
                  </Label>
                  <Input
                    id="prazo_entrega_dias"
                    type="number"
                    step="0.5"
                    value={formData.prazo_entrega_dias}
                    onChange={(e) => handleInputChange("prazo_entrega_dias", e.target.value)}
                    placeholder="Ex: 3 (dias após carregamento)"
                    className="mt-2"
                  />
                  
                  <div className="flex items-start gap-2 mt-3">
                    <Checkbox
                      id="prazo_entrega_dias_uteis"
                      checked={formData.prazo_entrega_dias_uteis}
                      onCheckedChange={(checked) => handleInputChange("prazo_entrega_dias_uteis", checked)}
                      className="mt-0.5"
                    />
                    <div className="flex-1">
                      <Label 
                        htmlFor="prazo_entrega_dias_uteis" 
                        className="cursor-pointer text-xs font-medium"
                        style={{ color: isDark ? '#f1f5f9' : '#111827' }}
                      >
                        Calcular em dias úteis
                      </Label>
                      <p className="text-xs mt-0.5 leading-relaxed" style={{ color: isDark ? '#cbd5e1' : '#4b5563' }}>
                        Se a entrega cair em sábado ou domingo, considera o próximo dia útil
                      </p>
                    </div>
                  </div>

                  <p className="text-xs mt-2 leading-relaxed" style={{ color: isDark ? '#cbd5e1' : '#4b5563' }}>
                    Prazo de entrega = Agendamento de Carregamento + dias informados
                  </p>
                </div>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="descricao">Descrição</Label>
            <Textarea
              id="descricao"
              value={formData.descricao}
              onChange={(e) => handleInputChange("descricao", e.target.value)}
              placeholder="Descrição detalhada da operação..."
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
            {editingOperacao ? "Atualizar" : "Cadastrar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}