import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Upload,
  Loader2,
  FileText,
  X,
  AlertCircle
} from "lucide-react";

export default function CamposEtapaForm({ 
  etapaId, 
  ordemEtapaId,
  ordemId,
  onValidationChange,
  onValuesChange,
  onTrackingUpdate,
  onUnsavedChanges
}) {
  const [campos, setCampos] = useState([]);
  const [valores, setValores] = useState({});
  const [valoresOriginais, setValoresOriginais] = useState({});
  const [naAplicavel, setNaAplicavel] = useState({});
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState({});
  const [errors, setErrors] = useState({});
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  useEffect(() => {
    loadCamposEValores();
  }, [etapaId, ordemEtapaId, ordemId]);

  useEffect(() => {
    validateForm();
    checkForUnsavedChanges();
  }, [valores, naAplicavel, campos]);

  const checkForUnsavedChanges = () => {
    const hasChanges = JSON.stringify(valores) !== JSON.stringify(valoresOriginais);
    setHasUnsavedChanges(hasChanges);
    if (onUnsavedChanges) {
      onUnsavedChanges(hasChanges);
    }
  };

  const loadCamposEValores = async () => {
    setLoading(true);
    try {
      // Carregar campos da etapa
      const allCampos = await base44.entities.EtapaCampo.list("ordem");
      const camposEtapa = allCampos.filter(c => c.etapa_id === etapaId && c.ativo);
      setCampos(camposEtapa);

      const valoresMap = {};
      const naAplicavelMap = {};

      // Se já existe ordemEtapaId, carregar valores salvos
      if (ordemEtapaId) {
        const valoresSalvos = await base44.entities.OrdemEtapaCampo.list();
        const valoresEtapa = valoresSalvos.filter(v => v.ordem_etapa_id === ordemEtapaId);

        valoresEtapa.forEach(v => {
          valoresMap[v.campo_id] = v.valor;
          naAplicavelMap[v.campo_id] = v.nao_aplicavel;
        });
      }

      // Para campos do tipo data_tracking e campo_ordem, buscar valores da ordem
      if (ordemId) {
        const ordem = await base44.entities.OrdemDeCarregamento.get(ordemId);
        
        camposEtapa.forEach(campo => {
          if (campo.tipo === "data_tracking" && campo.campo_tracking && !valoresMap[campo.id]) {
            const valorTracking = ordem[campo.campo_tracking];
            if (valorTracking) {
              // Converter ISO para datetime-local format (YYYY-MM-DDTHH:mm)
              const date = new Date(valorTracking);
              const year = date.getFullYear();
              const month = String(date.getMonth() + 1).padStart(2, '0');
              const day = String(date.getDate()).padStart(2, '0');
              const hours = String(date.getHours()).padStart(2, '0');
              const minutes = String(date.getMinutes()).padStart(2, '0');
              valoresMap[campo.id] = `${year}-${month}-${day}T${hours}:${minutes}`;
            }
          }
          
          // Para campos de ordem, buscar valores diretos da ordem
          if (campo.tipo === "campo_ordem" && campo.campo_ordem && !valoresMap[campo.id]) {
            const valorOrdem = ordem[campo.campo_ordem];
            if (valorOrdem !== undefined && valorOrdem !== null) {
              valoresMap[campo.id] = String(valorOrdem);
            }
          }
        });
      }

      setValores(valoresMap);
      setValoresOriginais(valoresMap);
      setNaAplicavel(naAplicavelMap);
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error("Erro ao carregar campos:", error);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    let isValid = true;

    campos.forEach(campo => {
      if (campo.obrigatorio && !naAplicavel[campo.id]) {
        const valor = valores[campo.id];
        
        if (!valor || (typeof valor === 'string' && valor.trim() === '')) {
          newErrors[campo.id] = `${campo.nome} é obrigatório`;
          isValid = false;
        }

        // Validação específica para checklist
        if (campo.tipo === "checklist" && valor) {
          try {
            const checkedItems = JSON.parse(valor);
            if (checkedItems.length === 0) {
              newErrors[campo.id] = `Selecione pelo menos uma opção em ${campo.nome}`;
              isValid = false;
            }
          } catch (e) {
            newErrors[campo.id] = `${campo.nome} possui formato inválido`;
            isValid = false;
          }
        }
      }
    });

    setErrors(newErrors);
    
    if (onValidationChange) {
      onValidationChange(isValid);
    }

    if (onValuesChange) {
      onValuesChange({ valores, naAplicavel });
    }
  };

  const determinarStatusTracking = (ordem, campoAtualizado, valorAtualizado) => {
    // Criar objeto temporário com a atualização
    const ordemTemp = { ...ordem, [campoAtualizado]: valorAtualizado };
    
    // Lógica de determinação de status baseada nas datas preenchidas
    if (ordemTemp.descarga_realizada_data) return "descarga_realizada";
    if (ordemTemp.fim_carregamento && ordemTemp.chegada_destino) return "em_descarga";
    if (ordemTemp.descarga_agendamento_data) return "descarga_agendada";
    if (ordemTemp.chegada_destino) return "chegada_destino";
    if (ordemTemp.saida_unidade) return "em_viagem";
    if (ordemTemp.fim_carregamento) return "carregado";
    if (ordemTemp.inicio_carregamento) return "em_carregamento";
    if (ordemTemp.carregamento_agendamento_data) return "carregamento_agendado";
    
    return "aguardando_agendamento";
  };

  const determinarStatusNF = (statusTracking) => {
    // Mapear status tracking para status NF
    const mapeamento = {
      "descarga_realizada": "entregue",
      "finalizado": "entregue",
      "em_descarga": "em_rota_entrega",
      "descarga_agendada": "em_rota_entrega",
      "chegada_destino": "em_rota_entrega",
      "em_viagem": "em_rota_entrega",
      "carregado": "em_rota_entrega",
      "em_carregamento": "aguardando_expedicao",
      "carregamento_agendado": "aguardando_expedicao",
      "aguardando_agendamento": "aguardando_expedicao"
    };
    
    return mapeamento[statusTracking] || "recebida";
  };

  const handleValueChange = (campoId, value) => {
    setValores(prev => ({ ...prev, [campoId]: value }));
    setNaAplicavel(prev => ({ ...prev, [campoId]: false }));
  };

  const handleNaAplicavelChange = (campoId, checked) => {
    setNaAplicavel(prev => ({ ...prev, [campoId]: checked }));
    if (checked) {
      setValores(prev => ({ ...prev, [campoId]: "" }));
    }
  };

  const handleFileUpload = async (campoId, file) => {
    setUploading(prev => ({ ...prev, [campoId]: true }));
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      handleValueChange(campoId, file_url);
    } catch (error) {
      console.error("Erro ao fazer upload:", error);
      setErrors(prev => ({ ...prev, [campoId]: "Erro ao fazer upload do arquivo" }));
    } finally {
      setUploading(prev => ({ ...prev, [campoId]: false }));
    }
  };

  const handleChecklistChange = (campoId, opcao, checked) => {
    const valorAtual = valores[campoId] || "[]";
    let checkedItems = [];
    
    try {
      checkedItems = JSON.parse(valorAtual);
    } catch (e) {
      checkedItems = [];
    }

    if (checked) {
      checkedItems.push(opcao);
    } else {
      checkedItems = checkedItems.filter(item => item !== opcao);
    }

    handleValueChange(campoId, JSON.stringify(checkedItems));
  };

  const handleKeyDownDate = (e, campoId) => {
    if (e.key === 'h' || e.key === 'H') {
      e.preventDefault();
      const now = new Date();
      // Formato datetime-local: YYYY-MM-DDTHH:mm
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const datetimeLocal = `${year}-${month}-${day}T${hours}:${minutes}`;
      handleValueChange(campoId, datetimeLocal);
    }
  };

  const renderCampo = (campo) => {
    const valor = valores[campo.id] || "";
    const isNa = naAplicavel[campo.id] || false;
    const error = errors[campo.id];
    const isUploading = uploading[campo.id];

    return (
      <div key={campo.id} className="space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <Label htmlFor={campo.id} className="flex items-center gap-2">
              {campo.nome}
              {campo.obrigatorio && <span className="text-red-500">*</span>}
            </Label>
            {campo.descricao && (
              <p className="text-xs text-gray-500 mt-1">{campo.descricao}</p>
            )}
          </div>
          
          {!campo.obrigatorio && campo.tipo !== "data_tracking" && (
            <div className="flex items-center gap-2 mt-1">
              <input
                type="checkbox"
                id={`na_${campo.id}`}
                checked={isNa}
                onChange={(e) => handleNaAplicavelChange(campo.id, e.target.checked)}
                className="w-4 h-4 rounded border-gray-300"
              />
              <Label 
                htmlFor={`na_${campo.id}`} 
                className="cursor-pointer text-xs text-gray-600 whitespace-nowrap"
              >
                N/A
              </Label>
            </div>
          )}
        </div>

        {!isNa && (
          <>
            {campo.tipo === "texto" && (
              <Textarea
                id={campo.id}
                value={valor}
                onChange={(e) => handleValueChange(campo.id, e.target.value)}
                placeholder={`Digite ${campo.nome.toLowerCase()}`}
                rows={3}
                className={error ? "border-red-500" : ""}
              />
            )}

            {campo.tipo === "checklist" && (
              <div className="space-y-2 p-3 border rounded-lg">
                {campo.opcoes?.split('\n').filter(opt => opt.trim()).map((opcao, idx) => {
                  const checkedItems = JSON.parse(valor || "[]");
                  const isChecked = checkedItems.includes(opcao.trim());
                  
                  return (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id={`${campo.id}_${idx}`}
                        checked={isChecked}
                        onChange={(e) => handleChecklistChange(campo.id, opcao.trim(), e.target.checked)}
                        className="w-4 h-4 rounded border-gray-300"
                      />
                      <Label 
                        htmlFor={`${campo.id}_${idx}`} 
                        className="cursor-pointer text-sm"
                      >
                        {opcao.trim()}
                      </Label>
                    </div>
                  );
                })}
              </div>
            )}

            {campo.tipo === "anexo" && (
              <div>
                {valor ? (
                  <div className="flex items-center gap-2 p-3 border rounded-lg bg-green-50">
                    <FileText className="w-4 h-4 text-green-600" />
                    <a 
                      href={valor} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex-1 text-sm text-green-700 hover:underline truncate"
                    >
                      Arquivo anexado
                    </a>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleValueChange(campo.id, "")}
                      className="h-6 w-6 p-0"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <input
                      type="file"
                      id={campo.id}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileUpload(campo.id, file);
                      }}
                      className="hidden"
                      disabled={isUploading}
                    />
                    <label 
                      htmlFor={campo.id} 
                      className="flex flex-col items-center cursor-pointer"
                    >
                      {isUploading ? (
                        <>
                          <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-2" />
                          <p className="text-sm text-blue-600">Enviando...</p>
                        </>
                      ) : (
                        <>
                          <Upload className="w-8 h-8 text-gray-400 mb-2" />
                          <p className="text-sm text-gray-600">Clique para anexar arquivo</p>
                        </>
                      )}
                    </label>
                  </div>
                )}
              </div>
            )}

            {campo.tipo === "monetario" && (
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                  R$
                </span>
                <Input
                  id={campo.id}
                  type="number"
                  step="0.01"
                  value={valor}
                  onChange={(e) => handleValueChange(campo.id, e.target.value)}
                  placeholder="0,00"
                  className={`pl-10 ${error ? "border-red-500" : ""}`}
                />
              </div>
            )}

            {campo.tipo === "booleano" && (
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => handleValueChange(campo.id, "sim")}
                  className={`flex-1 py-2 px-4 rounded-lg border-2 transition-all ${
                    valor === "sim" 
                      ? "border-green-500 bg-green-50 text-green-700 font-medium" 
                      : "border-gray-300 hover:border-gray-400"
                  }`}
                >
                  Sim
                </button>
                <button
                  type="button"
                  onClick={() => handleValueChange(campo.id, "nao")}
                  className={`flex-1 py-2 px-4 rounded-lg border-2 transition-all ${
                    valor === "nao" 
                      ? "border-red-500 bg-red-50 text-red-700 font-medium" 
                      : "border-gray-300 hover:border-gray-400"
                  }`}
                >
                  Não
                </button>
                <button
                  type="button"
                  onClick={() => handleValueChange(campo.id, "na")}
                  className={`flex-1 py-2 px-4 rounded-lg border-2 transition-all ${
                    valor === "na" 
                      ? "border-gray-500 bg-gray-50 text-gray-700 font-medium" 
                      : "border-gray-300 hover:border-gray-400"
                  }`}
                >
                  N/A
                </button>
              </div>
            )}

            {campo.tipo === "data_tracking" && (
              <div>
                <Input
                  id={campo.id}
                  type="datetime-local"
                  value={valor}
                  onChange={(e) => handleValueChange(campo.id, e.target.value)}
                  onKeyDown={(e) => handleKeyDownDate(e, campo.id)}
                  className={error ? "border-red-500" : ""}
                />
                <p className="text-xs text-gray-500 mt-1">
                  💡 Pressione <kbd className="px-1.5 py-0.5 bg-gray-200 rounded text-xs font-bold">H</kbd> para preencher com data/hora atual
                </p>
              </div>
            )}

            {campo.tipo === "campo_ordem" && (
              <Input
                id={campo.id}
                type="text"
                value={valor}
                onChange={(e) => handleValueChange(campo.id, e.target.value)}
                placeholder={`Digite ${campo.nome.toLowerCase()}`}
                className={error ? "border-red-500" : ""}
              />
            )}
          </>
        )}

        {error && (
          <p className="text-xs text-red-600 flex items-center gap-1 mt-1">
            <AlertCircle className="w-3 h-3" />
            {error}
          </p>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
      </div>
    );
  }

  if (campos.length === 0) {
    return (
      <Alert className="bg-blue-50 border-blue-200">
        <AlertCircle className="w-4 h-4 text-blue-600" />
        <AlertDescription className="text-blue-800 text-sm">
          Esta etapa não possui campos customizados para preencher.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      {campos.map(campo => renderCampo(campo))}
    </div>
  );
}