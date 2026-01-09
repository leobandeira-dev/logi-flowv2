import React, { useState } from "react";
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
import { ChevronLeft, ChevronRight, MapPin, RefreshCw } from "lucide-react";

export default function AdicionarFilaCarousel({ 
  formData, 
  setFormData, 
  tiposFila,
  theme,
  loadingLocation,
  onObterLocalizacao,
  preenchidoAutomatico 
}) {
  const [step, setStep] = useState(0);
  const [showError, setShowError] = useState(false);
  const [openSelect, setOpenSelect] = useState(false);

  const steps = [
    {
      title: "Nome do Motorista",
      field: "motorista_nome",
      render: () => (
        <div>
          <Label style={{ color: theme.text }}>Nome Completo *</Label>
          <Input
            value={formData.motorista_nome}
            onChange={(e) => setFormData(prev => ({ ...prev, motorista_nome: e.target.value }))}
            placeholder="Digite seu nome"
            className="text-lg h-12"
            style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder, color: theme.text }}
          />
        </div>
      )
    },
    {
      title: "Placa do Cavalo",
      field: "cavalo_placa",
      render: () => (
        <div>
          <Label style={{ color: theme.text }}>Placa do Cavalo *</Label>
          <Input
            value={formData.cavalo_placa}
            onChange={(e) => {
              const valor = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
              if (valor.length <= 7) {
                setFormData(prev => ({ ...prev, cavalo_placa: valor }));
              }
            }}
            placeholder="ABC1234"
            maxLength={7}
            className="text-lg h-12 font-mono font-bold"
            style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder, color: theme.text }}
          />
        </div>
      )
    },
    {
      title: "Tipo de Motorista, Veículo e Carroceria",
      field: "tipo_fila_id",
      isMultiSelect: true,
      render: () => (
        <div className="space-y-4">
          <div>
            <Label style={{ color: theme.text }}>Tipo do Motorista *</Label>
            <Select
              value={formData.tipo_fila_id}
              onValueChange={(value) => setFormData(prev => ({ ...prev, tipo_fila_id: value }))}
            >
              <SelectTrigger className="h-12" style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder, color: theme.text }}>
                <SelectValue placeholder="Selecione o tipo..." />
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
            <Label style={{ color: theme.text }}>Tipo de Veículo</Label>
            <Select
              value={formData.tipo_veiculo}
              onValueChange={(value) => setFormData(prev => ({ ...prev, tipo_veiculo: value }))}
            >
              <SelectTrigger className="h-12" style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder, color: theme.text }}>
                <SelectValue placeholder="Selecione..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="RODOTREM">RODOTREM</SelectItem>
                <SelectItem value="TRUCK">TRUCK</SelectItem>
                <SelectItem value="CARRETA 5EIXOS">5 EIXOS</SelectItem>
                <SelectItem value="CARRETA 6EIXOS">6 EIXOS</SelectItem>
                <SelectItem value="CARRETA 7EIXOS">7 EIXOS</SelectItem>
                <SelectItem value="BITREM">BITREM</SelectItem>
                <SelectItem value="BI-TRUCK">BI-TRUCK</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label style={{ color: theme.text }}>Tipo de Carroceria</Label>
            <Select
              value={formData.tipo_carroceria}
              onValueChange={(value) => setFormData(prev => ({ ...prev, tipo_carroceria: value }))}
            >
              <SelectTrigger className="h-12" style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder, color: theme.text }}>
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
      )
    },
    {
      title: "Localização Atual",
      field: "localizacao_atual",
      render: () => (
        <div>
          <Label style={{ color: theme.text }}>Onde você está?</Label>
          <div className="flex gap-2">
            <Input
              value={formData.localizacao_atual}
              onChange={(e) => setFormData(prev => ({ ...prev, localizacao_atual: e.target.value }))}
              placeholder="Ex: Pátio Central..."
              className="text-lg h-12"
              style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder, color: theme.text }}
            />
            <Button
              type="button"
              variant="outline"
              onClick={onObterLocalizacao}
              disabled={loadingLocation}
              className="flex-shrink-0 h-12 w-12"
            >
              {loadingLocation ? (
                <RefreshCw className="w-5 h-5 animate-spin" />
              ) : (
                <MapPin className="w-5 h-5" />
              )}
            </Button>
          </div>
        </div>
      )
    }
  ];

  const currentStep = steps[step];
  const isLastStep = step === steps.length - 1;
  const isRequired = ['motorista_nome', 'cavalo_placa', 'tipo_fila_id'].includes(currentStep.field);
  
  const validateCurrentStep = () => {
    if (currentStep.field === 'cavalo_placa') {
      const placaLimpa = formData.cavalo_placa?.replace(/\W/g, '') || '';
      return placaLimpa.length === 7;
    }
    return isRequired ? !!formData[currentStep.field] : true;
  };

  const handleNextClick = () => {
    if (!validateCurrentStep()) {
      setShowError(true);
      return;
    }
    setShowError(false);
    setOpenSelect(false);
    setStep(step + 1);
  };

  return (
    <div className="space-y-6">
      {/* Progress */}
      <div className="flex gap-1 mb-4">
        {steps.map((_, index) => (
          <div
            key={index}
            className={`h-1 flex-1 rounded-full transition-all ${
              index <= step ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
            }`}
          />
        ))}
      </div>

      {/* Step Indicator */}
      <div className="text-center mb-6">
        <p className="text-sm" style={{ color: theme.textMuted }}>
          Passo {step + 1} de {steps.length}
        </p>
        <h3 className="text-xl font-bold" style={{ color: theme.text }}>
          {currentStep.title}
        </h3>
      </div>

      {/* Current Step */}
      <div className="min-h-[120px]">
        {currentStep.render()}
        {showError && currentStep.field === 'cavalo_placa' && formData.cavalo_placa && formData.cavalo_placa.replace(/\W/g, '').length !== 7 && (
          <p className="text-sm text-orange-600 dark:text-orange-400 mt-2 flex items-center gap-1">
            <span>⚠️</span> A placa deve ter exatamente 7 caracteres
          </p>
        )}
        {showError && currentStep.field === 'cavalo_placa' && !formData.cavalo_placa && (
          <p className="text-sm text-orange-600 dark:text-orange-400 mt-2 flex items-center gap-1">
            <span>⚠️</span> Este campo é obrigatório
          </p>
        )}
        {showError && isRequired && currentStep.field !== 'cavalo_placa' && !formData[currentStep.field] && (
          <p className="text-sm text-orange-600 dark:text-orange-400 mt-2 flex items-center gap-1">
            <span>⚠️</span> Este campo é obrigatório
          </p>
        )}
      </div>

      {/* Navigation */}
      <div className="flex gap-3 pt-4">
        {step > 0 && (
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setStep(step - 1);
              setShowError(false);
            }}
            className="flex-1 h-12"
            style={{ borderColor: theme.cardBorder }}
          >
            <ChevronLeft className="w-5 h-5 mr-2" />
            Anterior
          </Button>
        )}
        {!isLastStep ? (
          <Button
            type="button"
            onClick={handleNextClick}
            className="flex-1 h-12 bg-blue-600 hover:bg-blue-700"
          >
            Próximo
            <ChevronRight className="w-5 h-5 ml-2" />
          </Button>
        ) : (
          <Button
            type="submit"
            className="flex-1 h-12 bg-green-600 hover:bg-green-700 font-bold"
          >
            {preenchidoAutomatico ? "Check-in" : "Entrar na Fila"}
          </Button>
        )}
      </div>
    </div>
  );
}