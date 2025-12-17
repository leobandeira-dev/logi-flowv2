import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { base44 } from "@/api/base44Client";
import { AlertTriangle, CheckCircle2, XCircle, User, Clock, MapPin, Package, Workflow } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";

const gravidadeColors = {
  baixa: "bg-blue-600 text-white border-2 border-blue-700 font-bold",
  media: "bg-yellow-600 text-white border-2 border-yellow-700 font-bold",
  alta: "bg-orange-600 text-white border-2 border-orange-700 font-bold",
  critica: "bg-red-600 text-white border-2 border-red-700 font-bold"
};

const statusColors = {
  aberta: "bg-red-600 text-white font-bold",
  em_andamento: "bg-blue-600 text-white font-bold",
  resolvida: "bg-green-600 text-white font-bold",
  cancelada: "bg-gray-600 text-white font-bold"
};

export default function OcorrenciaDetalhes({ open, onClose, ocorrencia, onUpdate }) {
  const [ordem, setOrdem] = useState(null);
  const [responsavel, setResponsavel] = useState(null);
  const [registradoPor, setRegistradoPor] = useState(null);
  const [resolucao, setResolucao] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open && ocorrencia) {
      loadData();
    }
  }, [open, ocorrencia]);

  const loadData = async () => {
    try {
      const [ordensData, usuariosData] = await Promise.all([
        base44.entities.OrdemDeCarregamento.list(),
        base44.entities.User.list()
      ]);

      const ordemData = ordensData.find(o => o.id === ocorrencia.ordem_id);
      setOrdem(ordemData);

      if (ocorrencia.responsavel_id) {
        setResponsavel(usuariosData.find(u => u.id === ocorrencia.responsavel_id));
      }
      if (ocorrencia.registrado_por) {
        setRegistradoPor(usuariosData.find(u => u.id === ocorrencia.registrado_por));
      }
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    }
  };

  const handleEmAndamento = async () => {
    if (!resolucao.trim()) {
      toast.error("Descreva o motivo de não poder concluir agora");
      return;
    }

    setSaving(true);
    try {
      await base44.entities.Ocorrencia.update(ocorrencia.id, {
        status: "em_andamento",
        observacoes: `${ocorrencia.observacoes}\n\n[EM ANDAMENTO]: ${resolucao}`
      });

      toast.success("Ocorrência marcada como em andamento");
      onUpdate();
      onClose();
    } catch (error) {
      console.error("Erro ao atualizar:", error);
      toast.error("Erro ao atualizar ocorrência");
    } finally {
      setSaving(false);
    }
  };

  const handleResolver = async () => {
    if (!resolucao.trim()) {
      toast.error("Adicione uma descrição da resolução");
      return;
    }

    setSaving(true);
    try {
      const user = await base44.auth.me();

      await base44.entities.Ocorrencia.update(ocorrencia.id, {
        status: "resolvida",
        data_fim: new Date().toISOString(),
        resolvido_por: user.id,
        observacoes: `${ocorrencia.observacoes}\n\n--- RESOLUÇÃO ---\n${resolucao}`
      });

      if (ocorrencia.categoria === "fluxo" && ocorrencia.ordem_etapa_id) {
        await base44.entities.OrdemEtapa.update(ocorrencia.ordem_etapa_id, {
          status: "em_andamento"
        });
      }

      toast.success("Ocorrência resolvida!");
      onUpdate();
      onClose();
    } catch (error) {
      console.error("Erro ao resolver:", error);
      toast.error("Erro ao resolver ocorrência");
    } finally {
      setSaving(false);
    }
  };

  const handleCancelar = async () => {
    setSaving(true);
    try {
      await base44.entities.Ocorrencia.update(ocorrencia.id, {
        status: "cancelada"
      });

      if (ocorrencia.categoria === "fluxo" && ocorrencia.ordem_etapa_id) {
        await base44.entities.OrdemEtapa.update(ocorrencia.ordem_etapa_id, {
          status: "em_andamento"
        });
      }

      toast.success("Ocorrência cancelada!");
      onUpdate();
      onClose();
    } catch (error) {
      console.error("Erro ao cancelar:", error);
      toast.error("Erro ao cancelar ocorrência");
    } finally {
      setSaving(false);
    }
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "-";
    try {
      return format(new Date(dateString), "dd/MM/yyyy HH:mm", { locale: ptBR });
    } catch {
      return "-";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <div className="flex items-center justify-between mb-3">
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              {ocorrencia.tipo}
            </DialogTitle>
            <div className="flex gap-2">
              <Badge className={statusColors[ocorrencia.status]}>
                {ocorrencia.status === "aberta" && <><AlertTriangle className="w-3 h-3 mr-1" />Aberta</>}
                {ocorrencia.status === "em_andamento" && <><Clock className="w-3 h-3 mr-1" />Em Andamento</>}
                {ocorrencia.status === "resolvida" && <><CheckCircle2 className="w-3 h-3 mr-1" />Resolvida</>}
                {ocorrencia.status === "cancelada" && <><XCircle className="w-3 h-3 mr-1" />Cancelada</>}
              </Badge>
              <Badge className={gravidadeColors[ocorrencia.gravidade]}>
                {ocorrencia.gravidade}
              </Badge>
              <Badge className={ocorrencia.categoria === "tracking" ? "bg-purple-600 text-white font-bold" : ocorrencia.categoria === "fluxo" ? "bg-indigo-600 text-white font-bold" : "bg-teal-600 text-white font-bold"}>
                {ocorrencia.categoria === "tracking" ? (
                  <><Package className="w-3 h-3 mr-1" />Tracking</>
                ) : ocorrencia.categoria === "fluxo" ? (
                  <><Workflow className="w-3 h-3 mr-1" />Fluxo</>
                ) : (
                  <><CheckCircle2 className="w-3 h-3 mr-1" />Tarefa</>
                )}
              </Badge>
            </div>
          </div>

          {/* Número do Ticket em Destaque */}
          {ocorrencia.numero_ticket && (
            <div className="bg-orange-50 dark:bg-orange-900/20 border-2 border-orange-400 dark:border-orange-600 rounded-lg p-3 mb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="bg-orange-600 text-white rounded px-2 py-1 text-xs font-bold">
                    TICKET
                  </div>
                  <span className="text-2xl font-mono font-bold text-orange-600 dark:text-orange-400">
                    #{ocorrencia.numero_ticket}
                  </span>
                </div>
                {ordem && (
                  <div className="text-right">
                    <p className="text-xs font-semibold text-gray-600 dark:text-gray-400">Ordem</p>
                    <p className="text-sm font-bold text-blue-600 dark:text-blue-400">
                      {ordem.numero_carga || `#${ordem.id?.slice(-6)}`}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            {!ocorrencia.numero_ticket && ordem && (
              <div>
                <p className="text-xs font-medium text-gray-600 dark:text-gray-400">Ordem</p>
                <p className="font-bold text-blue-600 dark:text-blue-400">
                  {ordem.numero_carga || `#${ordem.id?.slice(-6)}`}
                </p>
              </div>
            )}

            <div>
              <p className="text-xs font-medium text-gray-600 dark:text-gray-400">Data de Início</p>
              <p className="font-medium">{formatDateTime(ocorrencia.data_inicio)}</p>
            </div>

            {ocorrencia.data_fim && (
              <div>
                <p className="text-xs font-medium text-gray-600 dark:text-gray-400">Data de Resolução</p>
                <p className="font-medium">{formatDateTime(ocorrencia.data_fim)}</p>
              </div>
            )}

            {responsavel && (
              <div>
                <p className="text-xs font-medium text-gray-600 dark:text-gray-400">Responsável</p>
                <p className="font-medium flex items-center gap-1">
                  <User className="w-3 h-3" />
                  {responsavel.full_name}
                </p>
              </div>
            )}

            {registradoPor && (
              <div>
                <p className="text-xs font-medium text-gray-600 dark:text-gray-400">Registrado por</p>
                <p className="font-medium">{registradoPor.full_name}</p>
              </div>
            )}

            {ocorrencia.localizacao && (
              <div>
                <p className="text-xs font-medium text-gray-600 dark:text-gray-400">Localização</p>
                <p className="font-medium flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {ocorrencia.localizacao}
                </p>
              </div>
            )}
          </div>

          <div>
            <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">Observações</p>
            <div className="bg-gray-50 dark:bg-gray-900/40 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <p className="text-sm whitespace-pre-wrap">{ocorrencia.observacoes}</p>
            </div>
          </div>

          {ocorrencia.imagem_url && (
            <div>
              <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">Imagem Anexada</p>
              <img
                src={ocorrencia.imagem_url}
                alt="Ocorrência"
                className="w-full rounded-lg border border-gray-200 dark:border-gray-700"
              />
            </div>
          )}

          {(ocorrencia.status === "aberta" || ocorrencia.status === "em_andamento") && (
            <div>
              <Label htmlFor="resolucao" className="text-sm font-medium">
                {ocorrencia.status === "em_andamento" 
                  ? "Nova Atualização / Resolução *" 
                  : "Motivo / Resolução *"
                }
              </Label>
              <Textarea
                id="resolucao"
                value={resolucao}
                onChange={(e) => setResolucao(e.target.value)}
                placeholder={
                  ocorrencia.status === "em_andamento"
                    ? "Atualize o progresso ou descreva como foi resolvido..."
                    : "Por que não pode ser concluída agora? ou Como foi resolvido?"
                }
                rows={3}
                className="mt-2 border-2 border-orange-400 dark:border-orange-600 focus:border-blue-600"
              />
              <p className="text-xs text-orange-600 dark:text-orange-400 font-medium mt-1.5">
                ⚠️ {ocorrencia.status === "em_andamento" 
                  ? "Justificativa obrigatória para atualizar ou resolver" 
                  : "Justificativa obrigatória para marcar como 'Em Andamento' ou 'Resolver'"
                }
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          {(ocorrencia.status === "aberta" || ocorrencia.status === "em_andamento") && (
            <div className="flex flex-col gap-2 w-full">
              <div className="flex gap-2">
                <Button
                  onClick={handleEmAndamento}
                  disabled={saving}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  {saving ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Clock className="w-4 h-4 mr-2" />
                      Em Andamento
                    </>
                  )}
                </Button>
                <Button
                  onClick={handleResolver}
                  disabled={saving}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  {saving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Resolvendo...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Resolver
                    </>
                  )}
                </Button>
              </div>
              <Button
                variant="outline"
                onClick={handleCancelar}
                disabled={saving}
              >
                <XCircle className="w-4 h-4 mr-2" />
                Cancelar Ocorrência
              </Button>
            </div>
          )}
          {ocorrencia.status !== "aberta" && ocorrencia.status !== "em_andamento" && (
            <Button onClick={onClose}>Fechar</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}