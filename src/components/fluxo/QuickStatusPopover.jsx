import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Clock,
  PlayCircle,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Loader2,
  AlertTriangle
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import CamposEtapaForm from "../etapas/CamposEtapaForm";
import OcorrenciaFluxoModal from "./OcorrenciaFluxoModal";
import TratarOcorrenciaModal from "./TratarOcorrenciaModal";

export default function QuickStatusPopover({
  ordem,
  etapa,
  ordemEtapa,
  currentStatus,
  currentUser,
  onStatusUpdate,
  onCreateOrdemEtapa,
  onOpenDetails,
  children
}) {
  const [open, setOpen] = useState(false);
  const [changing, setChanging] = useState(false);
  const [observacoes, setObservacoes] = useState(ordemEtapa?.observacoes || "");
  const [ocorrenciasAbertas, setOcorrenciasAbertas] = useState(0);
  const [isDark, setIsDark] = useState(false);

  // Estados para o dialog de conclusão com campos
  const [showConclusaoDialog, setShowConclusaoDialog] = useState(false);
  const [camposValidos, setCamposValidos] = useState(false);
  const [camposValores, setCamposValores] = useState({ valores: {}, naAplicavel: {} });

  // Estado para o modal de ocorrências
  const [showOcorrenciaModal, setShowOcorrenciaModal] = useState(false);
  const [showTratarOcorrenciaModal, setShowTratarOcorrenciaModal] = useState(false);

  // Detectar dark mode
  useEffect(() => {
    const checkDarkMode = () => {
      setIsDark(document.documentElement.classList.contains('dark'));
    };
    checkDarkMode();
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  // Carregar ocorrências abertas ao abrir o popover
  useEffect(() => {
    if (open) { // Condition changed from 'open && ordemEtapa' to 'open'
      loadOcorrenciasAbertas();
    }
  }, [open, ordemEtapa]);

  const loadOcorrenciasAbertas = async () => {
    try {
      const todasOcorrencias = await base44.entities.Ocorrencia.list();
      
      let abertas = [];
      
      if (ordemEtapa) {
        // Se existe ordemEtapa, buscar APENAS ocorrências específicas desta etapa
        abertas = todasOcorrencias.filter(
          o => o.ordem_id === ordem.id && 
               o.status === "aberta" &&
               o.categoria === "fluxo" &&
               o.ordem_etapa_id === ordemEtapa.id  // APENAS desta etapa específica
        );
      }
      // Se não existe ordemEtapa (etapa pendente), não buscar ocorrências
      
      setOcorrenciasAbertas(abertas.length);
    } catch (error) {
      console.error("Erro ao carregar ocorrências:", error);
    }
  };

  const statusOptions = [
    {
      value: "pendente",
      label: "Pendente",
      icon: Clock,
      color: isDark ? "bg-gray-700 text-gray-300 hover:bg-gray-600" : "bg-gray-100 text-gray-700 hover:bg-gray-200",
      activeColor: isDark ? "bg-gray-600 text-gray-100 border-2 border-gray-400" : "bg-gray-200 text-gray-900 border-2 border-600"
    },
    {
      value: "em_andamento",
      label: "Em Andamento",
      icon: PlayCircle,
      color: isDark ? "bg-blue-900/40 text-blue-300 hover:bg-blue-900/60" : "bg-blue-100 text-blue-700 hover:bg-blue-200",
      activeColor: isDark ? "bg-blue-800/60 text-blue-100 border-2 border-blue-400" : "bg-blue-200 text-blue-900 border-2 border-blue-600"
    },
    {
      value: "concluida",
      label: "Concluída",
      icon: CheckCircle2,
      color: isDark ? "bg-green-900/40 text-green-300 hover:bg-green-900/60" : "bg-green-100 text-green-700 hover:bg-green-200",
      activeColor: isDark ? "bg-green-800/60 text-green-100 border-2 border-green-400" : "bg-green-200 text-green-900 border-2 border-green-600",
      requiresCampos: true
    },
    {
      value: "bloqueada",
      label: "Bloqueada",
      icon: XCircle,
      color: isDark ? "bg-red-900/40 text-red-300 hover:bg-red-900/60" : "bg-red-100 text-red-700 hover:bg-red-200",
      activeColor: isDark ? "bg-red-800/60 text-red-100 border-2 border-red-400" : "bg-red-200 text-red-900 border-2 border-red-600"
    }
  ];

  const handleStatusChange = async (newStatus) => {
    // Se for conclusão, abrir dialog com campos
    if (newStatus === "concluida") {
      setShowConclusaoDialog(true);
      return;
    }

    setChanging(true);
    try {
      // Validações rigorosas
      if (!ordem?.id || !etapa?.id) {
        console.error("❌ POPOVER - Dados faltando:", { ordem: !!ordem, etapa: !!etapa });
        throw new Error("Dados da ordem ou etapa estão faltando");
      }

      if (!currentUser?.id) {
        console.error("❌ POPOVER - Usuário não identificado");
        throw new Error("Usuário não identificado");
      }

      if (!newStatus) {
        console.error("❌ POPOVER - Status não fornecido");
        throw new Error("Status é obrigatório");
      }

      // Preparar dados com valores padrão seguros
      const dataToSave = {
        ordem_id: ordem.id,
        etapa_id: etapa.id,
        status: newStatus,
        observacoes: observacoes?.trim() || "",
        data_inicio: ordemEtapa?.data_inicio || (newStatus === "em_andamento" ? new Date().toISOString() : null),
        data_conclusao: null,
        responsavel_id: currentUser.id,
        departamento_responsavel_id: etapa.departamento_responsavel_id || currentUser.departamento_id || null
      };

      // Log detalhado
      console.log(`🔄 POPOVER - Salvando status:`, {
        ordem: ordem.numero_carga || ordem.id.slice(-6),
        etapa: etapa.nome,
        statusAnterior: currentStatus,
        statusNovo: newStatus,
        temOrdemEtapa: !!ordemEtapa,
        dados: dataToSave
      });

      // Executar update ou create com as funções que já têm retry
      if (ordemEtapa) {
        await onStatusUpdate(ordemEtapa.id, dataToSave);
      } else {
        await onCreateOrdemEtapa(dataToSave);
      }

      console.log(`✅ POPOVER - Status salvo com sucesso`);
      setOpen(false);

    } catch (error) {
      console.error("❌ POPOVER - Erro ao atualizar status:", error);
      // Erro já tratado pelas funções de update/create com toast
    } finally {
      setChanging(false);
    }
  };

  const handleConcluirComCampos = async () => {
    setChanging(true);
    try {
      // Validações rigorosas
      if (!ordem?.id || !etapa?.id) {
        console.error("❌ POPOVER - Dados faltando na conclusão:", { ordem: !!ordem, etapa: !!etapa });
        throw new Error("Dados da ordem ou etapa estão faltando");
      }

      if (!currentUser?.id) {
        console.error("❌ POPOVER - Usuário não identificado");
        throw new Error("Usuário não identificado");
      }

      console.log(`🏁 POPOVER - Iniciando conclusão de etapa:`, {
        ordem: ordem.numero_carga || ordem.id.slice(-6),
        etapa: etapa.nome,
        temOrdemEtapa: !!ordemEtapa
      });

      // Preparar dados da OrdemEtapa
      const dataToSave = {
        ordem_id: ordem.id,
        etapa_id: etapa.id,
        status: "concluida",
        observacoes: observacoes?.trim() || "",
        data_inicio: ordemEtapa?.data_inicio || new Date().toISOString(),
        data_conclusao: new Date().toISOString(),
        responsavel_id: currentUser.id,
        departamento_responsavel_id: etapa.departamento_responsavel_id || currentUser.departamento_id || null
      };

      let ordemEtapaId;
      let ordemEtapaSalva;

      // Salvar OrdemEtapa primeiro
      if (ordemEtapa) {
        console.log(`📝 POPOVER - Atualizando OrdemEtapa existente:`, ordemEtapa.id.slice(-6));
        ordemEtapaSalva = await onStatusUpdate(ordemEtapa.id, dataToSave);
        ordemEtapaId = ordemEtapa.id;
      } else {
        console.log(`➕ POPOVER - Criando nova OrdemEtapa`);
        ordemEtapaSalva = await onCreateOrdemEtapa(dataToSave);
        ordemEtapaId = ordemEtapaSalva?.id || ordemEtapaSalva;
        
        if (!ordemEtapaId) {
          throw new Error("ID da OrdemEtapa não foi retornado após criação");
        }
      }

      console.log(`✅ POPOVER - OrdemEtapa salva:`, ordemEtapaId.slice?.(-6) || ordemEtapaId);

      // Aguardar um momento para garantir que o registro foi persistido
      await new Promise(resolve => setTimeout(resolve, 300));

      // Salvar valores dos campos customizados
      const { valores, naAplicavel } = camposValores;

      if (valores && Object.keys(valores).length > 0) {
        console.log(`💾 POPOVER - Salvando ${Object.keys(valores).length} campos customizados`);

        // Buscar campos para identificar os do tipo data_tracking
        const camposData = await base44.entities.EtapaCampo.list();
        const trackingUpdates = {};

        // Buscar registros existentes UMA VEZ
        const registrosExistentes = await base44.entities.OrdemEtapaCampo.list();

        const promises = [];

        for (const [campoId, valor] of Object.entries(valores)) {
          if (valor || naAplicavel[campoId]) {
            const registroExistente = registrosExistentes.find(
              r => r.ordem_etapa_id === ordemEtapaId && r.campo_id === campoId
            );

            const dataValor = {
              ordem_etapa_id: ordemEtapaId,
              campo_id: campoId,
              valor: String(valor || ""),
              nao_aplicavel: naAplicavel[campoId] || false,
              data_preenchimento: new Date().toISOString(),
              preenchido_por: currentUser.id
            };

            if (registroExistente) {
              promises.push(
                base44.entities.OrdemEtapaCampo.update(registroExistente.id, dataValor)
                  .catch(err => {
                    console.error(`❌ Erro ao atualizar campo ${campoId}:`, err);
                    throw err;
                  })
              );
            } else {
              promises.push(
                base44.entities.OrdemEtapaCampo.create(dataValor)
                  .catch(err => {
                    console.error(`❌ Erro ao criar campo ${campoId}:`, err);
                    throw err;
                  })
              );
            }

            // Se for campo de data_tracking, adicionar ao tracking
            const campo = camposData.find(c => c.id === campoId);
            if (campo && campo.tipo === "data_tracking" && campo.campo_tracking && valor) {
              try {
                const dataISO = new Date(valor).toISOString();
                trackingUpdates[campo.campo_tracking] = dataISO;
              } catch (err) {
                console.error(`❌ Erro ao converter data tracking:`, err);
              }
            }
          }
        }

        // Salvar todos os campos em paralelo
        await Promise.all(promises);
        console.log(`✅ POPOVER - Campos customizados salvos com sucesso`);

        // Atualizar tracking se houver campos de data
        if (Object.keys(trackingUpdates).length > 0) {
          console.log(`📍 POPOVER - Atualizando tracking:`, trackingUpdates);
          await base44.entities.OrdemDeCarregamento.update(ordem.id, trackingUpdates);
          console.log(`✅ POPOVER - Tracking atualizado com sucesso`);
        }
      }

      setShowConclusaoDialog(false);
      setOpen(false);

      console.log(`🎉 POPOVER - Conclusão finalizada com sucesso!`);

    } catch (error) {
      console.error("❌ POPOVER - Erro ao concluir etapa:", error);
      // Erro já tratado pelas funções de update/create com toast
    } finally {
      setChanging(false);
    }
  };

  const handleOpenDetails = () => {
    setOpen(false);
    onOpenDetails(ordem, etapa.id);
  };

  const handleContextMenu = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowOcorrenciaModal(true);
  };

  const handleOcorrenciaSuccess = async () => {
    await loadOcorrenciasAbertas();
    // Não chamar onStatusUpdate com null - apenas recarregar localmente
  };

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <div onContextMenu={handleContextMenu}>
            {children}
          </div>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-0" align="center" side="top">
          <div
            className={`p-4 border-b-2 ${
              isDark ? 'border-gray-700' : 'border-gray-200'
            }`}
            style={{ borderLeftWidth: '4px', borderLeftColor: etapa.cor }}
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex-1">
                <h4 className={`font-semibold ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
                  {etapa.nome}
                </h4>
                <p className={`text-xs mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {ordem.numero_carga || `#${ordem.id.slice(-6)}`} • {ordem.cliente}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleOpenDetails}
                className="h-8 w-8 p-0"
                title="Ver detalhes completos"
              >
                <ExternalLink className="w-4 h-4" />
              </Button>
            </div>

            {etapa.descricao && (
              <p className={`text-xs mt-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                {etapa.descricao}
              </p>
            )}

            {ocorrenciasAbertas > 0 && (
              <div className="mt-3">
                <Button
                  onClick={() => {
                    setOpen(false);
                    setShowTratarOcorrenciaModal(true);
                  }}
                  className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold"
                  size="sm"
                >
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  {ocorrenciasAbertas} {ocorrenciasAbertas === 1 ? 'Ocorrência' : 'Ocorrências'} para Tratar
                </Button>
              </div>
            )}
          </div>

          <div className="p-4 space-y-3">
            {changing && (
              <div className={`p-3 rounded-lg border mb-3 ${
                isDark 
                  ? 'bg-blue-900/30 border-blue-700' 
                  : 'bg-blue-100 border-blue-400'
              }`}>
                <div className={`flex items-center justify-center gap-2 ${
                  isDark ? 'text-blue-300' : 'text-blue-700'
                }`}>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span className="font-semibold">Salvando...</span>
                </div>
              </div>
            )}

            <div>
              <Label className={`text-xs font-bold mb-2 block ${
                isDark ? 'text-gray-300' : 'text-gray-600'
              }`}>
                Alterar Status
              </Label>
              <div className="grid grid-cols-2 gap-2">
                {statusOptions.map((option) => {
                  const Icon = option.icon;
                  const isActive = currentStatus === option.value;

                  return (
                    <button
                      key={option.value}
                      onClick={() => handleStatusChange(option.value)}
                      disabled={changing}
                      className={`
                        flex items-center gap-2 p-2 rounded-lg text-sm font-medium
                        transition-all duration-200
                        ${isActive ? option.activeColor : option.color}
                        ${changing ? 'opacity-50 cursor-not-allowed' : ''}
                      `}
                    >
                      <Icon className="w-4 h-4 flex-shrink-0" />
                      <span className="truncate">{option.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <Label 
                htmlFor="observacoes" 
                className={`text-xs font-bold mb-1 block ${
                  isDark ? 'text-gray-300' : 'text-gray-600'
                }`}
              >
                Observações (opcional)
              </Label>
              <Textarea
                id="observacoes"
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
                placeholder="Adicione observações..."
                rows={2}
                className="text-sm resize-none border-2"
                disabled={changing}
              />
            </div>

            {/* Campos Customizados - Sempre visíveis quando há OrdemEtapa */}
            {ordemEtapa && (
              <div className={`pt-3 border-t-2 ${
                isDark ? 'border-gray-700' : 'border-gray-200'
              }`}>
                <Label className={`text-xs font-bold mb-2 block ${
                  isDark ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  Campos da Etapa
                </Label>
                <CamposEtapaForm
                  etapaId={etapa.id}
                  ordemEtapaId={ordemEtapa.id}
                  ordemId={ordem.id}
                  onValidationChange={() => {}}
                  onValuesChange={() => {}}
                  onTrackingUpdate={async () => {
                    await loadOcorrenciasAbertas();
                  }}
                />
              </div>
            )}

            {ordemEtapa?.data_inicio && (
              <div className={`pt-2 border-t-2 space-y-1 ${
                isDark ? 'border-gray-700' : 'border-gray-200'
              }`}>
                <div className="flex items-center justify-between text-xs">
                  <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>
                    Iniciada:
                  </span>
                  <span className={`font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {new Date(ordemEtapa.data_inicio).toLocaleDateString('pt-BR')}
                  </span>
                </div>
                {ordemEtapa.data_conclusao && (
                  <div className="flex items-center justify-between text-xs">
                    <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>
                      Concluída:
                    </span>
                    <span className={`font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {new Date(ordemEtapa.data_conclusao).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>

      {/* Dialog de Conclusão com Campos */}
      <Dialog open={showConclusaoDialog} onOpenChange={setShowConclusaoDialog}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Concluir Etapa: {etapa.nome}</DialogTitle>
          </DialogHeader>

          {changing && (
            <div className={`p-3 rounded-lg border ${
              isDark 
                ? 'bg-blue-900/30 border-blue-700' 
                : 'bg-blue-100 border-blue-400'
            }`}>
              <div className={`flex items-center justify-center gap-2 ${
                isDark ? 'text-blue-300' : 'text-blue-700'
              }`}>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span className="font-semibold">Concluindo etapa...</span>
              </div>
            </div>
          )}

          <div className="space-y-4 py-4">
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Preencha os campos abaixo para concluir esta etapa. Campos marcados com * são obrigatórios.
            </p>

            <CamposEtapaForm
              etapaId={etapa.id}
              ordemEtapaId={ordemEtapa?.id}
              ordemId={ordem.id}
              onValidationChange={setCamposValidos}
              onValuesChange={setCamposValores}
            />

            <div>
              <Label htmlFor="observacoes_conclusao" className="font-bold">
                Observações
              </Label>
              <Textarea
                id="observacoes_conclusao"
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
                placeholder="Adicione observações sobre a conclusão desta etapa..."
                rows={3}
                className="border-2"
                disabled={changing}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowConclusaoDialog(false)}
              disabled={changing}
              className="border-2"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleConcluirComCampos}
              disabled={!camposValidos || changing}
              className="bg-green-600 hover:bg-green-700 font-bold"
            >
              {changing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Concluindo...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Concluir Etapa
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {showOcorrenciaModal && (
        <OcorrenciaFluxoModal
          open={showOcorrenciaModal}
          onClose={() => setShowOcorrenciaModal(false)}
          ordem={ordem}
          etapa={etapa}
          ordemEtapa={ordemEtapa}
          onSuccess={handleOcorrenciaSuccess}
        />
      )}

      {showTratarOcorrenciaModal && (
        <TratarOcorrenciaModal
          open={showTratarOcorrenciaModal}
          onClose={() => setShowTratarOcorrenciaModal(false)}
          ordem={ordem}
          etapa={etapa}
          ordemEtapa={ordemEtapa}
          onSuccess={handleOcorrenciaSuccess}
        />
      )}
    </>
  );
}