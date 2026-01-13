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
import { ChevronLeft, ChevronRight, MapPin, RefreshCw, User, Truck, Package, CheckCircle, Upload, AlertCircle, FileText } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";

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
  const [uploadingComprovante, setUploadingComprovante] = useState(false);
  const [validandoComprovante, setValidandoComprovante] = useState(false);
  const [comprovanteValidado, setComprovanteValidado] = useState(null);

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
              value={formData.tipo_veiculo || ""}
              onValueChange={(value) => {
                setFormData(prev => ({ ...prev, tipo_veiculo: value }));
              }}
            >
              <SelectTrigger 
                className="h-14 transition-all duration-200" 
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
              value={formData.tipo_carroceria || ""}
              onValueChange={(value) => {
                setFormData(prev => ({ ...prev, tipo_carroceria: value }));
              }}
            >
              <SelectTrigger 
                className="h-14 transition-all duration-200" 
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
      title: "Comprovante de Descarga",
      field: "comprovante_descarga_url",
      render: () => (
        <div className="space-y-4">
          <div className="bg-amber-50 border-2 border-amber-200 rounded-lg p-4">
            <p className="text-xs text-amber-800 font-semibold mb-2">
              📸 Tire uma foto do comprovante de descarga
            </p>
            <p className="text-xs text-amber-700">
              • Deve conter data legível<br/>
              • Deve ser um comprovante de descarga válido
            </p>
          </div>

          {formData.comprovante_descarga_url ? (
            <div className="space-y-3">
              <div className="relative rounded-lg overflow-hidden border-2 border-green-500">
                <img 
                  src={formData.comprovante_descarga_url} 
                  alt="Comprovante" 
                  className="w-full h-48 object-cover"
                />
                <button
                  onClick={() => {
                    setFormData(prev => ({ ...prev, comprovante_descarga_url: "", comprovante_validacao: "" }));
                    setComprovanteValidado(null);
                  }}
                  className="absolute top-2 right-2 bg-red-600 text-white p-2 rounded-full hover:bg-red-700"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {validandoComprovante ? (
                <div className="flex items-center justify-center gap-2 p-4 bg-blue-50 rounded-lg">
                  <RefreshCw className="w-4 h-4 animate-spin text-blue-600" />
                  <p className="text-sm text-blue-700">Validando comprovante...</p>
                </div>
              ) : comprovanteValidado ? (
                <div className="space-y-3">
                  <div className={`p-4 rounded-lg border-2 ${
                    comprovanteValidado.valido 
                      ? 'bg-green-50 border-green-500' 
                      : 'bg-red-50 border-red-500'
                  }`}>
                    <div className="flex items-start gap-2">
                      {comprovanteValidado.valido ? (
                        <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                      )}
                      <div>
                        <p className={`text-sm font-semibold ${
                          comprovanteValidado.valido ? 'text-green-700' : 'text-red-700'
                        }`}>
                          {comprovanteValidado.valido ? '✅ Comprovante válido!' : '❌ Comprovante inválido'}
                        </p>
                        <p className={`text-xs mt-1 ${
                          comprovanteValidado.valido ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {comprovanteValidado.mensagem}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {!comprovanteValidado.valido && (
                    <Button
                      type="button"
                      onClick={() => {
                        setFormData(prev => ({ ...prev, comprovante_descarga_url: "", comprovante_validacao: "" }));
                        setComprovanteValidado(null);
                        // Reabrir o file input
                        setTimeout(() => {
                          document.getElementById('comprovante-upload')?.click();
                        }, 100);
                      }}
                      className="w-full h-12 bg-blue-600 hover:bg-blue-700"
                    >
                      <Upload className="w-5 h-5 mr-2" />
                      Tirar Outra Foto
                    </Button>
                  )}
                </div>
              ) : null}
            </div>
          ) : (
            <div>
              <input
                type="file"
                accept="image/*"
                capture="environment"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;

                  setUploadingComprovante(true);
                  try {
                    const { file_url } = await base44.integrations.Core.UploadFile({ file });
                    setFormData(prev => ({ ...prev, comprovante_descarga_url: file_url }));
                    
                    // Validar com IA
                    setValidandoComprovante(true);
                    try {
                      const validacao = await base44.integrations.Core.InvokeLLM({
                        prompt: `Analise esta imagem de comprovante de descarga. Você deve verificar:
1. Se a imagem está legível e de boa qualidade
2. Se contém uma data visível
3. Se é realmente um comprovante de descarga ou documento de entrega

Retorne JSON com: 
- valido (boolean): true se atende todos os critérios
- mensagem (string): explicação curta do resultado
- data_encontrada (string): data encontrada no documento, se houver`,
                        file_urls: [file_url],
                        response_json_schema: {
                          type: "object",
                          properties: {
                            valido: { type: "boolean" },
                            mensagem: { type: "string" },
                            data_encontrada: { type: "string" }
                          }
                        }
                      });

                      setComprovanteValidado(validacao);
                      setFormData(prev => ({ 
                        ...prev, 
                        comprovante_validacao: JSON.stringify(validacao),
                        comprovante_data_descarga: validacao.data_encontrada || ""
                      }));

                      if (!validacao.valido) {
                        toast.error("Comprovante inválido. Tire uma foto melhor.");
                      } else {
                        toast.success("Comprovante validado com sucesso!");
                      }
                    } catch (err) {
                      console.error("Erro ao validar comprovante:", err);
                      toast.error("Erro ao validar comprovante");
                    } finally {
                      setValidandoComprovante(false);
                    }
                  } catch (error) {
                    console.error("Erro ao fazer upload:", error);
                    toast.error("Erro ao enviar foto");
                  } finally {
                    setUploadingComprovante(false);
                  }
                }}
                id="comprovante-upload"
                className="hidden"
              />
              <label
                htmlFor="comprovante-upload"
                className={`flex flex-col items-center justify-center h-48 border-2 border-dashed rounded-lg cursor-pointer transition-all ${
                  uploadingComprovante ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-50 dark:hover:bg-blue-900/20'
                }`}
                style={{ borderColor: showError && !formData.comprovante_descarga_url ? '#ef4444' : '#3b82f6' }}
              >
                {uploadingComprovante ? (
                  <>
                    <RefreshCw className="w-12 h-12 text-blue-600 animate-spin mb-2" />
                    <p className="text-sm text-blue-600">Enviando foto...</p>
                  </>
                ) : (
                  <>
                    <Upload className="w-12 h-12 text-blue-600 mb-2" />
                    <p className="text-sm font-semibold text-blue-600">Toque para tirar foto</p>
                    <p className="text-xs text-gray-500 mt-1">Comprovante de descarga</p>
                  </>
                )}
              </label>
              {showError && !formData.comprovante_descarga_url && (
                <p className="text-xs text-red-600 mt-2 flex items-center gap-1">
                  <span>⚠️</span> Comprovante obrigatório
                </p>
              )}
            </div>
          )}
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
              <span>⚠️</span> É necessário obter sua localização para entrar na fila
            </p>
          )}
        </div>
      )
    },

  ];

  const currentStep = steps[step];
  const isLastStep = step === steps.length - 1;
  const isRequired = ['motorista_nome', 'cavalo_placa', 'tipo_fila_id', 'comprovante_descarga_url', 'cidade_uf'].includes(currentStep.field);
  
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
    // Se estiver no passo do comprovante, bloquear se não for válido
    if (currentStep.field === 'comprovante_descarga_url') {
      if (!formData.comprovante_descarga_url) {
        setShowError(true);
        return;
      }
      if (validandoComprovante) {
        toast.error("Aguarde a validação do comprovante");
        return;
      }
      if (comprovanteValidado && !comprovanteValidado.valido) {
        toast.error("Envie um comprovante válido para continuar");
        setShowError(true);
        return;
      }
      if (!comprovanteValidado) {
        toast.error("Aguarde a validação do comprovante");
        return;
      }
      setShowError(false);
      setStep(step + 1);
      return;
    }

    // Se estiver no passo de localização
    if (currentStep.field === 'cidade_uf') {
      // Se já tem localização, fazer check-in diretamente
      if (formData.cidade_uf) {
        setShowError(false);
        if (onSubmit) {
          onSubmit();
        }
        return;
      }
      // Senão, tentar obter localização
      await handleObterLocalizacao();
      return;
    }

    // Se estiver no passo de múltiplos selects
    if (currentStep.isMultiSelect) {
      const emptyField = getEmptySelectField();
      if (emptyField) {
        setShowError(true);
        return;
      }
      setShowError(false);
      setStep(step + 1);
      return;
    }

    if (!validateCurrentStep()) {
      setShowError(true);
      return;
    }
    setShowError(false);
    setStep(step + 1);
  };

  const handleObterLocalizacao = async () => {
    const success = await onObterLocalizacao();
    if (success && formData.cidade_uf) {
      // Realizar check-in diretamente
      setShowError(false);
      if (onSubmit) {
        onSubmit();
      }
    } else {
      // Mostrar erro se não conseguiu obter localização
      setShowError(true);
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
        <Button
          type="button"
          onClick={handleNextClick}
          disabled={
            loadingLocation || 
            (currentStep.field === 'comprovante_descarga_url' && 
              (!formData.comprovante_descarga_url || validandoComprovante || (comprovanteValidado && !comprovanteValidado.valido)))
          }
          className={`flex-1 h-12 disabled:opacity-50 disabled:cursor-not-allowed ${
            currentStep.field === 'cidade_uf' && formData.cidade_uf
              ? 'bg-green-600 hover:bg-green-700'
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {currentStep.field === 'cidade_uf' ? (
            loadingLocation ? (
              <>
                <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                Obtendo...
              </>
            ) : formData.cidade_uf ? (
              <>
                <CheckCircle className="w-5 h-5 mr-2" />
                Fazer Check-in
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
          </div>
          </div>
          );
          }