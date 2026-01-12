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
import { ChevronLeft, ChevronRight, MapPin, RefreshCw, User, Truck, Package, CheckCircle } from "lucide-react";

export default function AdicionarFilaCarousel({ 
  formData, 
  setFormData, 
  tiposFila,
  theme,
  loadingLocation,
  onObterLocalizacao,
  preenchidoAutomatico,
  onSubmit,
  motoristaEncontrado
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
            style={{ 
              backgroundColor: theme.cardBg, 
              borderColor: showError && !formData.motorista_nome ? '#ef4444' : theme.cardBorder,
              borderWidth: showError && !formData.motorista_nome ? '2px' : '1px',
              color: theme.text 
            }}
          />
          {showError && !formData.motorista_nome && (
            <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
              <span>⚠️</span> Campo obrigatório
            </p>
          )}
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
            style={{ 
              backgroundColor: theme.cardBg, 
              borderColor: showError && (!formData.cavalo_placa || formData.cavalo_placa.length !== 7) ? '#ef4444' : theme.cardBorder,
              borderWidth: showError && (!formData.cavalo_placa || formData.cavalo_placa.length !== 7) ? '2px' : '1px',
              color: theme.text 
            }}
          />
          {showError && (!formData.cavalo_placa || formData.cavalo_placa.length !== 7) && (
            <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
              <span>⚠️</span> {!formData.cavalo_placa ? 'Campo obrigatório' : 'Placa deve ter 7 caracteres'}
            </p>
          )}
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
              <SelectTrigger 
                className="h-14 transition-all duration-200 hover:shadow-md" 
                style={{ 
                  backgroundColor: formData.tipo_fila_id ? '#dbeafe' : theme.cardBg,
                  borderColor: showError && !formData.tipo_fila_id ? '#ef4444' : (formData.tipo_fila_id ? '#3b82f6' : theme.cardBorder),
                  borderWidth: '2px',
                  color: theme.text 
                }}
              >
                <div className="flex items-center gap-2">
                  <User className="w-5 h-5 text-blue-600" />
                  <SelectValue placeholder="Selecione o tipo..." />
                </div>
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
            {showError && !formData.tipo_fila_id && (
              <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                <span>⚠️</span> Campo obrigatório
              </p>
            )}
          </div>

          <div>
            <Label style={{ color: theme.text }}>Tipo de Veículo *</Label>
            <Select
              value={formData.tipo_veiculo || undefined}
              onValueChange={(value) => setFormData(prev => ({ ...prev, tipo_veiculo: value }))}
            >
              <SelectTrigger 
                className="h-14 transition-all duration-200 hover:shadow-md" 
                style={{ 
                  backgroundColor: formData.tipo_veiculo ? '#dcfce7' : theme.cardBg,
                  borderColor: showError && !formData.tipo_veiculo ? '#ef4444' : (formData.tipo_veiculo ? '#10b981' : theme.cardBorder),
                  borderWidth: '2px',
                  color: theme.text 
                }}
              >
                <div className="flex items-center gap-2">
                  <Truck className={`w-5 h-5 ${formData.tipo_veiculo ? 'text-green-600' : 'text-gray-400'}`} />
                  <SelectValue placeholder="Selecione..." />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="RODOTREM">🚛 RODOTREM</SelectItem>
                <SelectItem value="TRUCK">🚚 TRUCK</SelectItem>
                <SelectItem value="CARRETA 5EIXOS">🚛 5 EIXOS</SelectItem>
                <SelectItem value="CARRETA 6EIXOS">🚛 6 EIXOS</SelectItem>
                <SelectItem value="CARRETA 7EIXOS">🚛 7 EIXOS</SelectItem>
                <SelectItem value="BITREM">🚛 BITREM</SelectItem>
                <SelectItem value="BI-TRUCK">🚚 BI-TRUCK</SelectItem>
              </SelectContent>
            </Select>
            {showError && !formData.tipo_veiculo && (
              <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                <span>⚠️</span> Campo obrigatório
              </p>
            )}
          </div>

          <div>
            <Label style={{ color: theme.text }}>Tipo de Carroceria *</Label>
            <Select
              value={formData.tipo_carroceria || undefined}
              onValueChange={(value) => setFormData(prev => ({ ...prev, tipo_carroceria: value }))}
            >
              <SelectTrigger 
                className="h-14 transition-all duration-200 hover:shadow-md" 
                style={{ 
                  backgroundColor: formData.tipo_carroceria ? '#fef3c7' : theme.cardBg,
                  borderColor: showError && !formData.tipo_carroceria ? '#ef4444' : (formData.tipo_carroceria ? '#f59e0b' : theme.cardBorder),
                  borderWidth: '2px',
                  color: theme.text 
                }}
              >
                <div className="flex items-center gap-2">
                  <Package className={`w-5 h-5 ${formData.tipo_carroceria ? 'text-amber-600' : 'text-gray-400'}`} />
                  <SelectValue placeholder="Selecione..." />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="SIDER">📦 SIDER</SelectItem>
                <SelectItem value="PRANCHA">🛠️ PRANCHA</SelectItem>
                <SelectItem value="GRADE BAIXA">📊 GRADE BAIXA</SelectItem>
                <SelectItem value="GRADE ALTA">📈 GRADE ALTA</SelectItem>
                <SelectItem value="BAU">🚚 BAU</SelectItem>
              </SelectContent>
            </Select>
            {showError && !formData.tipo_carroceria && (
              <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                <span>⚠️</span> Campo obrigatório
              </p>
            )}
          </div>
        </div>
      )
    },
    {
      title: "Localização Atual",
      field: "cidade_uf",
      render: () => (
        <div>
          <Label style={{ color: theme.text }}>Cidade e UF *</Label>
          <div className="flex gap-2">
            <Input
              value={formData.cidade_uf}
              onChange={(e) => setFormData(prev => ({ ...prev, cidade_uf: e.target.value }))}
              placeholder="Ex: São Paulo, SP"
              className="text-lg h-14"
              style={{ 
                backgroundColor: theme.cardBg, 
                borderColor: showError && !formData.cidade_uf ? '#ef4444' : theme.cardBorder,
                borderWidth: showError && !formData.cidade_uf ? '2px' : '1px',
                color: theme.text 
              }}
            />
            <Button
              type="button"
              variant="outline"
              onClick={handleObterLocalizacao}
              disabled={loadingLocation}
              className="flex-shrink-0 h-14 w-14"
            >
              {loadingLocation ? (
                <RefreshCw className="w-5 h-5 animate-spin" />
              ) : (
                <MapPin className="w-5 h-5" />
              )}
            </Button>
          </div>
          {showError && !formData.cidade_uf && (
            <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
              <span>⚠️</span> Campo obrigatório
            </p>
          )}
        </div>
      )
    },
    {
      title: "Confirmar Check-in",
      field: "confirmacao",
      render: () => (
        <div className="space-y-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border-2 border-blue-200 dark:border-blue-700">
            <p className="text-sm font-semibold text-blue-700 dark:text-blue-400 mb-3">
              Confirme seus dados para check-in:
            </p>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-xs text-gray-600 dark:text-gray-400">Motorista:</span>
                <span className="text-xs font-semibold" style={{ color: theme.text }}>{formData.motorista_nome}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-gray-600 dark:text-gray-400">Placa:</span>
                <span className="text-xs font-mono font-bold" style={{ color: theme.text }}>{formData.cavalo_placa}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-gray-600 dark:text-gray-400">Tipo Veículo:</span>
                <span className="text-xs font-semibold" style={{ color: theme.text }}>{formData.tipo_veiculo}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-gray-600 dark:text-gray-400">Carroceria:</span>
                <span className="text-xs font-semibold" style={{ color: theme.text }}>{formData.tipo_carroceria}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-gray-600 dark:text-gray-400">Localização:</span>
                <span className="text-xs font-semibold text-right" style={{ color: theme.text }}>{formData.cidade_uf || "Não informada"}</span>
              </div>
            </div>
          </div>
        </div>
      )
    }
  ];

  const currentStep = steps[step];
  const isLastStep = step === steps.length - 1;
  const isRequired = ['motorista_nome', 'cavalo_placa', 'tipo_fila_id', 'cidade_uf'].includes(currentStep.field);
  
  const validateCurrentStep = () => {
    if (currentStep.field === 'cavalo_placa') {
      const placaLimpa = formData.cavalo_placa?.replace(/\W/g, '') || '';
      return placaLimpa.length === 7;
    }
    if (currentStep.field === 'confirmacao') {
      return true; // Confirmação sempre válida
    }
    return isRequired ? !!formData[currentStep.field] : true;
  };

  const getEmptySelectField = () => {
    const selectFields = ['tipo_fila_id', 'tipo_veiculo', 'tipo_carroceria'];
    for (const field of selectFields) {
      if (!formData[field]) {
        return field;
      }
    }
    return null;
  };

  const handleNextClick = async () => {
    // Se estiver no passo de localização, obter localização primeiro
    if (currentStep.field === 'cidade_uf') {
      await handleObterLocalizacao();
      return; // A função handleObterLocalizacao vai avançar automaticamente
    }

    // Se estiver no passo de múltiplos selects
    if (currentStep.isMultiSelect) {
      const emptyField = getEmptySelectField();
      if (emptyField) {
        setShowError(true);
        setOpenSelect(true);
        return;
      }
      setShowError(false);
      setOpenSelect(false);
      setStep(step + 1);
      return;
    }

    if (!validateCurrentStep()) {
      setShowError(true);
      return;
    }
    setShowError(false);
    setOpenSelect(false);
    setStep(step + 1);
  };

  const handleObterLocalizacao = async () => {
    const success = await onObterLocalizacao();
    if (success) {
      // Avançar automaticamente se localização foi obtida com sucesso
      setShowError(false);
      setStep(step + 1);
    }
  };

  const handleCheckInClick = () => {
    if (onSubmit) {
      onSubmit();
    }
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
            disabled={loadingLocation}
            className="flex-1 h-12 bg-blue-600 hover:bg-blue-700"
          >
            {currentStep.field === 'cidade_uf' ? (
              loadingLocation ? (
                <>
                  <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                  Obtendo...
                </>
              ) : (
                <>
                  <MapPin className="w-5 h-5 mr-2" />
                  Obter Localização
                </>
              )
            ) : (
              <>
                Próximo
                <ChevronRight className="w-5 h-5 ml-2" />
              </>
            )}
          </Button>
        ) : (
          <Button
            type="button"
            onClick={handleCheckInClick}
            className="flex-1 h-12 bg-green-600 hover:bg-green-700 font-bold"
          >
            Check-in
          </Button>
        )}
        </div>
    </div>
  );
}