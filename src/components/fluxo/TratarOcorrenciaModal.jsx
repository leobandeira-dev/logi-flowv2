import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { base44 } from "@/api/base44Client";
import { 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Clock,
  User,
  Calendar,
  Loader2,
  Image as ImageIcon
} from "lucide-react";
import { format, differenceInHours } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";

const gravidadeColors = {
  baixa: "bg-blue-500 text-white border-blue-600",
  media: "bg-yellow-500 text-white border-yellow-600",
  alta: "bg-orange-500 text-white border-orange-600",
  critica: "bg-red-600 text-white border-red-700"
};

export default function TratarOcorrenciaModal({
  open,
  onClose,
  ordem,
  etapa,
  ordemEtapa,
  ocorrenciaEspecifica,
  onSuccess
}) {
  const [ocorrencias, setOcorrencias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [resolvendoId, setResolvendoId] = useState(null);
  const [observacoesResolucao, setObservacoesResolucao] = useState({});
  const [usuarios, setUsuarios] = useState([]);
  const [isDark, setIsDark] = useState(false);

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

  useEffect(() => {
    if (open) {
      loadOcorrencias();
    }
  }, [open, ordemEtapa, ocorrenciaEspecifica]);

  const loadOcorrencias = async () => {
    setLoading(true);
    try {
      const [todasOcorrencias, todosUsuarios] = await Promise.all([
        base44.entities.Ocorrencia.list(),
        base44.entities.User.list()
      ]);

      setUsuarios(todosUsuarios);

      let ocorrenciasAbertas;

      if (ocorrenciaEspecifica) {
        // Se foi passada uma ocorrência específica, carregar apenas ela
        ocorrenciasAbertas = [ocorrenciaEspecifica];
      } else if (ordemEtapa) {
        // Filtrar ocorrências abertas E em andamento desta etapa
        ocorrenciasAbertas = todasOcorrencias.filter(
          o => o.ordem_id === ordem.id && 
               o.ordem_etapa_id === ordemEtapa.id && 
               (o.status === "aberta" || o.status === "em_andamento") &&
               o.categoria === "fluxo"
        );
      } else {
        // Se não tem ordemEtapa, não carregar nenhuma ocorrência
        ocorrenciasAbertas = [];
      }

      // Ordenar por data (mais recente primeiro)
      ocorrenciasAbertas.sort((a, b) => new Date(b.data_inicio) - new Date(a.data_inicio));

      setOcorrencias(ocorrenciasAbertas);
    } catch (error) {
      console.error("Erro ao carregar ocorrências:", error);
      toast.error("Erro ao carregar ocorrências");
    } finally {
      setLoading(false);
    }
  };

  const handleEmAndamento = async (ocorrencia) => {
    const obs = observacoesResolucao[ocorrencia.id];
    if (!obs || !obs.trim()) {
      toast.error("Descreva o motivo de não poder concluir agora");
      return;
    }

    setResolvendoId(ocorrencia.id);
    try {
      // Atualizar ocorrência para em andamento
      await base44.entities.Ocorrencia.update(ocorrencia.id, {
        status: "em_andamento",
        observacoes: `${ocorrencia.observacoes}\n\n[EM ANDAMENTO]: ${obs}`
      });

      toast.success("Ocorrência marcada como em andamento");

      // Limpar observações desta ocorrência
      setObservacoesResolucao(prev => {
        const newObs = { ...prev };
        delete newObs[ocorrencia.id];
        return newObs;
      });

      await loadOcorrencias();
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Erro ao atualizar ocorrência:", error);
      toast.error("Erro ao atualizar ocorrência");
    } finally {
      setResolvendoId(null);
    }
  };

  const handleResolver = async (ocorrencia) => {
    const obs = observacoesResolucao[ocorrencia.id];
    if (!obs || !obs.trim()) {
      toast.error("Adicione observações sobre a resolução");
      return;
    }

    setResolvendoId(ocorrencia.id);
    try {
      // Atualizar ocorrência para resolvida
      await base44.entities.Ocorrencia.update(ocorrencia.id, {
        status: "resolvida",
        data_fim: new Date().toISOString(),
        observacoes: `${ocorrencia.observacoes}\n\n[RESOLUÇÃO]: ${obs}`
      });

      // Verificar se ainda há outras ocorrências abertas nesta etapa
      const outrasOcorrenciasAbertas = ocorrencias.filter(
        o => o.id !== ocorrencia.id
      );

      // Se não há mais ocorrências abertas E existe uma ordemEtapa, desbloquear a etapa
      if (outrasOcorrenciasAbertas.length === 0 && ordemEtapa) {
        await base44.entities.OrdemEtapa.update(ordemEtapa.id, {
          status: "em_andamento"
        });
        toast.success("Ocorrência resolvida e etapa desbloqueada!");
      } else {
        toast.success("Ocorrência resolvida!");
      }

      // Limpar observações desta ocorrência
      setObservacoesResolucao(prev => {
        const newObs = { ...prev };
        delete newObs[ocorrencia.id];
        return newObs;
      });

      await loadOcorrencias();
      onSuccess();
      
      // Se não há mais ocorrências, fechar o modal
      if (outrasOcorrenciasAbertas.length === 0) {
        onClose();
      }
    } catch (error) {
      console.error("Erro ao resolver ocorrência:", error);
      toast.error("Erro ao resolver ocorrência");
    } finally {
      setResolvendoId(null);
    }
  };

  const handleCancelar = async (ocorrencia) => {
    if (!confirm("Tem certeza que deseja cancelar esta ocorrência?")) {
      return;
    }

    setResolvendoId(ocorrencia.id);
    try {
      // Atualizar ocorrência para cancelada
      await base44.entities.Ocorrencia.update(ocorrencia.id, {
        status: "cancelada",
        data_fim: new Date().toISOString()
      });

      // Verificar se ainda há outras ocorrências abertas nesta etapa
      const outrasOcorrenciasAbertas = ocorrencias.filter(
        o => o.id !== ocorrencia.id
      );

      // Se não há mais ocorrências abertas E existe uma ordemEtapa, desbloquear a etapa
      if (outrasOcorrenciasAbertas.length === 0 && ordemEtapa) {
        await base44.entities.OrdemEtapa.update(ordemEtapa.id, {
          status: "em_andamento"
        });
        toast.success("Ocorrência cancelada e etapa desbloqueada!");
      } else {
        toast.success("Ocorrência cancelada!");
      }

      await loadOcorrencias();
      onSuccess();
      
      // Se não há mais ocorrências, fechar o modal
      if (outrasOcorrenciasAbertas.length === 0) {
        onClose();
      }
    } catch (error) {
      console.error("Erro ao cancelar ocorrência:", error);
      toast.error("Erro ao cancelar ocorrência");
    } finally {
      setResolvendoId(null);
    }
  };

  const getUsuarioNome = (userId) => {
    const usuario = usuarios.find(u => u.id === userId);
    return usuario?.full_name || "Usuário desconhecido";
  };

  const calcularTempoAberto = (dataInicio) => {
    const horas = differenceInHours(new Date(), new Date(dataInicio));
    
    if (horas < 1) return "Menos de 1 hora";
    if (horas === 1) return "1 hora";
    if (horas < 24) return `${horas} horas`;
    
    const dias = Math.floor(horas / 24);
    if (dias === 1) return "1 dia";
    return `${dias} dias`;
  };

  if (loading) {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-2xl">
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (ocorrencias.length === 0) {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              Nenhuma Ocorrência Aberta
            </DialogTitle>
          </DialogHeader>
          <div className="text-center py-8">
            <CheckCircle2 className="w-16 h-16 text-green-600 mx-auto mb-4 opacity-20" />
            <p className="text-gray-600 dark:text-gray-400">
              Não há ocorrências abertas para esta etapa.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-orange-600" />
            {etapa ? `Tratar Ocorrências - ${etapa.nome}` : 'Tratar Ocorrência'}
          </DialogTitle>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {ordem?.numero_carga || `#${ordem?.id?.slice(-6)}`} {ordem?.cliente && `• ${ordem.cliente}`}
          </p>
        </DialogHeader>

        <div className="space-y-4">
          {!ocorrenciaEspecifica && (
            <div className="bg-blue-600 text-white rounded-lg p-3 shadow-md">
              <p className="text-sm font-semibold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                {ocorrencias.length} {ocorrencias.length === 1 ? 'ocorrência aberta' : 'ocorrências abertas'} nesta etapa
              </p>
            </div>
          )}

          {ocorrencias.map((ocorrencia, index) => {
            const isResolvendo = resolvendoId === ocorrencia.id;
            
            return (
              <div
                key={ocorrencia.id}
                className={`
                  rounded-lg p-5 shadow-lg border-2 transition-all
                  ${isResolvendo 
                    ? isDark 
                      ? 'bg-gray-800 border-gray-600 opacity-75' 
                      : 'bg-gray-100 border-gray-400 opacity-75'
                    : isDark
                      ? 'bg-gray-800 border-orange-600'
                      : 'bg-white border-orange-400'
                  }
                `}
              >
                {isResolvendo && (
                  <div className={`mb-4 p-3 rounded-lg border ${
                    isDark 
                      ? 'bg-blue-900/30 border-blue-700' 
                      : 'bg-blue-100 border-blue-400'
                  }`}>
                    <div className={`flex items-center justify-center gap-2 ${
                      isDark ? 'text-blue-300' : 'text-blue-700'
                    }`}>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span className="font-semibold">Processando resolução...</span>
                    </div>
                  </div>
                )}

                {/* Número do Ticket - Movido para o topo */}
                {ocorrencia.numero_ticket && (
                  <div className="mb-3 pb-3 border-b-2 border-orange-400 dark:border-orange-600">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-semibold uppercase ${
                        isDark ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        Ordem
                      </span>
                      <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                        {ordem?.numero_carga || `#${ordem?.id?.slice(-6)}`}
                      </span>
                      <span className="ml-auto text-sm font-bold text-orange-600 dark:text-orange-400">
                        Ticket #{ocorrencia.numero_ticket}
                      </span>
                    </div>
                  </div>
                )}

                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className={`font-bold text-lg ${
                        isDark ? 'text-gray-100' : 'text-gray-900'
                      }`}>
                        {ocorrencia.tipo}
                      </h4>
                      <Badge className={`text-xs font-bold border ${gravidadeColors[ocorrencia.gravidade]}`}>
                        {ocorrencia.gravidade.toUpperCase()}
                      </Badge>
                      {etapa && (
                        <Badge className="text-xs font-bold bg-purple-600 text-white border-purple-700">
                          {etapa.nome}
                        </Badge>
                      )}
                      <Badge className={`text-xs font-bold ${
                        ocorrencia.status === 'em_andamento' 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-red-600 text-white'
                      }`}>
                        {ocorrencia.status === 'em_andamento' ? 'Em Andamento' : 'Aberta'}
                      </Badge>
                    </div>

                    {ocorrencia.descricao_tipo && (
                      <p className={`text-sm font-medium mb-2 ${
                        isDark ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        {ocorrencia.descricao_tipo}
                      </p>
                    )}
                  </div>
                </div>

                <div className={`mb-4 grid grid-cols-2 gap-3 text-sm ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  <div>
                    <p className={`text-xs font-semibold mb-1 ${
                      isDark ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      Data de Início
                    </p>
                    <p className="font-medium">
                      {format(new Date(ocorrencia.data_inicio), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                    </p>
                  </div>
                  <div>
                    <p className={`text-xs font-semibold mb-1 ${
                      isDark ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      Registrado por
                    </p>
                    <p className="font-medium">{getUsuarioNome(ocorrencia.registrado_por)}</p>
                  </div>
                  {ocorrencia.responsavel_id && (
                    <div className="col-span-2">
                      <p className={`text-xs font-semibold mb-1 ${
                        isDark ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        Responsável
                      </p>
                      <p className="font-medium">{getUsuarioNome(ocorrencia.responsavel_id)}</p>
                    </div>
                  )}
                </div>

                <div>
                  <p className={`text-xs font-semibold mb-1 ${
                    isDark ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    Observações
                  </p>
                  <div className={`rounded-lg p-3 border-2 ${
                    isDark 
                      ? 'bg-gray-900 border-gray-700' 
                      : 'bg-gray-50 border-gray-200'
                  }`}>
                    <p className={`text-sm whitespace-pre-wrap ${
                      isDark ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      {ocorrencia.observacoes}
                    </p>
                  </div>
                </div>

                {ocorrencia.imagem_url && (
                  <div className="mt-4">
                    <a
                      href={ocorrencia.imagem_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`inline-flex items-center gap-2 text-sm font-medium ${
                        isDark 
                          ? 'text-blue-400 hover:text-blue-300' 
                          : 'text-blue-600 hover:text-blue-800'
                      }`}
                    >
                      <ImageIcon className="w-4 h-4" />
                      Ver imagem anexada
                    </a>
                  </div>
                )}

                <div className={`mt-4 space-y-3 pt-4 border-t-2 ${
                  isDark ? 'border-gray-700' : 'border-gray-300'
                }`}>
                  <div>
                    <Label className={`font-bold text-sm mb-2 block ${
                      isDark ? 'text-gray-100' : 'text-gray-900'
                    }`}>
                      {ocorrencia.status === 'em_andamento' 
                        ? 'Nova Atualização / Resolução'
                        : 'Motivo / Resolução'
                      }
                    </Label>
                    <Textarea
                      value={observacoesResolucao[ocorrencia.id] || ""}
                      onChange={(e) => setObservacoesResolucao(prev => ({
                        ...prev,
                        [ocorrencia.id]: e.target.value
                      }))}
                      placeholder={
                        ocorrencia.status === 'em_andamento'
                          ? "Atualize o progresso ou descreva como foi resolvido..."
                          : "Por que não pode ser concluída agora? ou Como foi resolvido?"
                      }
                      rows={3}
                      className="mt-1 border-2 focus:border-blue-500"
                      disabled={!!resolvendoId}
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleEmAndamento(ocorrencia)}
                        disabled={!!resolvendoId}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold h-12"
                      >
                        {isResolvendo ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <>
                            <Clock className="w-5 h-5 mr-2" />
                            Em Andamento
                          </>
                        )}
                      </Button>
                      <Button
                        onClick={() => handleResolver(ocorrencia)}
                        disabled={!!resolvendoId}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold h-12"
                      >
                        {isResolvendo ? (
                          <>
                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                            Resolvendo...
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="w-5 h-5 mr-2" />
                            Resolver
                          </>
                        )}
                      </Button>
                    </div>
                    <Button
                      onClick={() => handleCancelar(ocorrencia)}
                      disabled={!!resolvendoId}
                      variant="outline"
                      className={`w-full h-10 border-2 ${
                        isDark 
                          ? 'border-gray-600 text-gray-300 hover:bg-gray-900' 
                          : 'border-gray-400 text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {isResolvendo ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <XCircle className="w-4 h-4 mr-2" />
                          Cancelar Ocorrência
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                {index < ocorrencias.length - 1 && (
                  <div className={`mt-6 pt-6 border-t-4 border-dashed ${
                    isDark ? 'border-orange-700' : 'border-orange-300'
                  }`} />
                )}
              </div>
            );
          })}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={!!resolvendoId}>
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}