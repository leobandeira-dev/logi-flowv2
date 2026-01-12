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
import { ChevronLeft, ChevronRight, MapPin, RefreshCw, User, Truck, Package } from "lucide-react";

export default function AdicionarFilaCarousel({ 
  formData, 
  setFormData, 
  tiposFila,
  theme,
  loadingLocation,
  onObterLocalizacao,
  preenchidoAutomatico,
  onSubmit
}) {
  const [step, setStep] = useState(0);
  const [showError, setShowError] = useState(false);
  const [openSelect, setOpenSelect] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [loadingGPS, setLoadingGPS] = useState(false);

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
              value={formData.tipo_veiculo}
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
                  <Truck className="w-5 h-5 text-green-600" />
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
              value={formData.tipo_carroceria}
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
                  <Package className="w-5 h-5 text-amber-600" />
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

  const getEmptySelectField = () => {
    const selectFields = ['tipo_fila_id', 'tipo_veiculo', 'tipo_carroceria'];
    for (const field of selectFields) {
      if (!formData[field]) {
        return field;
      }
    }
    return null;
  };

  const handleNextClick = () => {
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

  const handleCheckInClick = async () => {
    setShowConfirmModal(true);
    setLoadingGPS(true);
    
    // Tentar obter localização automaticamente
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`
            );
            const data = await response.json();
            
            const endereco = data.display_name || `${latitude}, ${longitude}`;
            setFormData(prev => ({ ...prev, localizacao_atual: endereco }));
          } catch (error) {
            setFormData(prev => ({ 
              ...prev, 
              localizacao_atual: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}` 
            }));
          } finally {
            setLoadingGPS(false);
          }
        },
        (error) => {
          console.error("Erro ao obter localização:", error);
          setLoadingGPS(false);
        }
      );
    } else {
      setLoadingGPS(false);
    }
  };

  const handleConfirmCheckIn = () => {
    setShowConfirmModal(false);
    if (onSubmit) {
      const fakeEvent = { preventDefault: () => {} };
      onSubmit(fakeEvent);
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
            className="flex-1 h-12 bg-blue-600 hover:bg-blue-700"
          >
            Próximo
            <ChevronRight className="w-5 h-5 ml-2" />
          </Button>
        ) : (
          <Button
            type="button"
            onClick={handleCheckInClick}
            className="flex-1 h-12 bg-green-600 hover:bg-green-700 font-bold"
          >
            {preenchidoAutomatico ? "Check-in" : "Entrar na Fila"}
          </Button>
        )}
      </div>

      {/* Modal de Confirmação */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div 
            className="rounded-lg shadow-xl max-w-md w-full p-6"
            style={{ backgroundColor: theme.cardBg }}
          >
            <h3 className="text-xl font-bold mb-4" style={{ color: theme.text }}>
              Confirmar Check-in
            </h3>
            
            <div className="space-y-4 mb-6">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                <p className="text-sm font-medium mb-1" style={{ color: theme.text }}>Nome do Motorista</p>
                <p className="text-base font-bold" style={{ color: theme.text }}>{formData.motorista_nome}</p>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                <p className="text-sm font-medium mb-1" style={{ color: theme.text }}>Placa do Cavalo</p>
                <p className="text-base font-bold font-mono" style={{ color: theme.text }}>{formData.cavalo_placa}</p>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                <p className="text-sm font-medium mb-1" style={{ color: theme.text }}>Localização Atual</p>
                {loadingGPS ? (
                  <div className="flex items-center gap-2">
                    <RefreshCw className="w-4 h-4 animate-spin text-blue-600" />
                    <p className="text-sm" style={{ color: theme.textMuted }}>Obtendo localização...</p>
                  </div>
                ) : (
                  <p className="text-sm" style={{ color: theme.text }}>
                    {formData.localizacao_atual || "Localização não informada"}
                  </p>
                )}
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowConfirmModal(false)}
                disabled={loadingGPS}
                className="flex-1"
                style={{ borderColor: theme.cardBorder }}
              >
                Cancelar
              </Button>
              <Button
                type="button"
                onClick={handleConfirmCheckIn}
                disabled={loadingGPS}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                Confirmar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}