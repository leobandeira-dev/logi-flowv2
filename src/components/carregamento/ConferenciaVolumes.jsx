import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Package,
  CheckCircle,
  AlertCircle,
  Camera,
  X,
  Check,
  ArrowLeft,
  FileText,
  Scan,
  AlertTriangle,
  TruckIcon
} from "lucide-react";
import { toast } from "sonner";
import { sincronizarStatusNotas } from "@/functions/sincronizarStatusNotas";

export default function ConferenciaVolumes({ ordem, notasFiscais, volumes, onClose, onComplete }) {
  const [isDark, setIsDark] = useState(false);
  const [codigoScanner, setCodigoScanner] = useState("");
  const [volumesEmbarcados, setVolumesEmbarcados] = useState([]);
  const [showCamera, setShowCamera] = useState(false);
  const [showOcorrenciaModal, setShowOcorrenciaModal] = useState(false);
  const [volumeOcorrencia, setVolumeOcorrencia] = useState(null);
  const [notaOcorrencia, setNotaOcorrencia] = useState(null);
  const [ocorrenciaData, setOcorrenciaData] = useState({
    tipo: "avaria_carga",
    observacoes: ""
  });
  const [saving, setSaving] = useState(false);
  const [showConfirmarNF, setShowConfirmarNF] = useState(false);
  const [nfParaConfirmar, setNfParaConfirmar] = useState(null);
  const [videoStream, setVideoStream] = useState(null);
  const [notasFiscaisLocal, setNotasFiscaisLocal] = useState([]);
  const [volumesLocal, setVolumesLocal] = useState([]);
  const [showFinalizarModal, setShowFinalizarModal] = useState(false);
  const [datasCarregamento, setDatasCarregamento] = useState({
    inicio: "",
    fim: ""
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
    setNotasFiscaisLocal(notasFiscais);
    setVolumesLocal(volumes);
    
    // Restaurar notas e volumes do rascunho de endereçamento (podem ter sido adicionadas lá)
    const rascunhoNotas = localStorage.getItem(`enderecamento_notas_${ordem.id}`);
    if (rascunhoNotas) {
      try {
        const rascunho = JSON.parse(rascunhoNotas);
        if (rascunho.notas && rascunho.volumes) {
          const notasIdsExistentes = notasFiscais.map(n => n.id);
          const notasNovas = rascunho.notas.filter(n => !notasIdsExistentes.includes(n.id));
          
          const volumesIdsExistentes = volumes.map(v => v.id);
          const volumesNovos = rascunho.volumes.filter(v => !volumesIdsExistentes.includes(v.id));
          
          if (notasNovas.length > 0 || volumesNovos.length > 0) {
            setNotasFiscaisLocal([...notasFiscais, ...notasNovas]);
            setVolumesLocal([...volumes, ...volumesNovos]);
          }
        }
      } catch (error) {
        console.error("Erro ao restaurar notas do rascunho:", error);
      }
    }
  }, [notasFiscais, volumes]);

  useEffect(() => {
    // Carregar volumes já embarcados do banco
    const embarcados = volumesLocal.filter(v => 
      v.ordem_id === ordem.id && 
      (v.status_volume === "carregado" || v.status_volume === "em_transito")
    ).map(v => v.id);
    
    // Carregar rascunho do localStorage
    const rascunhoSalvo = localStorage.getItem(`conferencia_rascunho_${ordem.id}`);
    if (rascunhoSalvo) {
      try {
        const rascunho = JSON.parse(rascunhoSalvo);
        if (rascunho.volumesEmbarcados) {
          // Mesclar volumes do rascunho com os do banco
          const volumesRestaurados = [...new Set([...embarcados, ...rascunho.volumesEmbarcados])];
          setVolumesEmbarcados(volumesRestaurados);
          
          const novosDoRascunho = volumesRestaurados.length - embarcados.length;
          if (novosDoRascunho > 0) {
            toast.info(`${novosDoRascunho} volume(s) embarcado(s) restaurado(s) do rascunho`);
          }
        }
      } catch (error) {
        console.error("Erro ao carregar rascunho:", error);
      }
    } else {
      setVolumesEmbarcados(embarcados);
    }
  }, [volumesLocal, ordem.id]);

  useEffect(() => {
    return () => {
      if (videoStream) {
        videoStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [videoStream]);

  const getVolumesNota = (notaId) => {
    return volumesLocal.filter(v => v.nota_fiscal_id === notaId);
  };

  const getVolumesEmbarcadosNota = (notaId) => {
    const volumesNota = getVolumesNota(notaId);
    return volumesNota.filter(v => volumesEmbarcados.includes(v.id));
  };

  const getTotalVolumes = () => {
    return volumesLocal.filter(v => 
      notasFiscaisLocal.some(nf => nf.id === v.nota_fiscal_id)
    ).length;
  };

  const getVolumesEmbarcadosValidos = () => {
    // Contar apenas volumes embarcados que pertencem às notas atuais
    const notasIdsAtuais = notasFiscaisLocal.map(nf => nf.id);
    return volumesEmbarcados.filter(volumeId => {
      const volume = volumesLocal.find(v => v.id === volumeId);
      return volume && notasIdsAtuais.includes(volume.nota_fiscal_id);
    });
  };

  const handleScanVolume = async (codigo) => {
    if (!codigo || !codigo.trim()) {
      toast.error("Digite ou escaneie um código de volume");
      return;
    }

    const codigoLimpo = codigo.trim().toUpperCase();

    // Verificar se é uma etiqueta mãe
    try {
      const etiquetasEncontradas = await base44.entities.EtiquetaMae.filter({ codigo: codigoLimpo });
      
      if (etiquetasEncontradas.length > 0) {
        const etiquetaMae = etiquetasEncontradas[0];
        
        if (etiquetaMae.volumes_ids && etiquetaMae.volumes_ids.length > 0) {
          // Buscar volumes do banco de dados pela etiqueta mãe
          const volumesDaEtiquetaDB = await base44.entities.Volume.filter({ 
            id: { $in: etiquetaMae.volumes_ids } 
          });
          
          if (volumesDaEtiquetaDB.length === 0) {
            toast.warning(`Etiqueta ${etiquetaMae.codigo} sem volumes no sistema`);
            setCodigoScanner("");
            return;
          }

          // Buscar notas fiscais únicas dos volumes
          const notasIdsUnicas = [...new Set(volumesDaEtiquetaDB.map(v => v.nota_fiscal_id).filter(Boolean))];
          
          // Verificar quais notas precisam ser vinculadas à ordem
          const notasParaVincular = [];
          for (const notaId of notasIdsUnicas) {
            if (!notasFiscaisLocal.some(nf => nf.id === notaId)) {
              const nota = await base44.entities.NotaFiscal.get(notaId);
              notasParaVincular.push(nota);
            }
          }

          // Vincular notas em batch se necessário
          if (notasParaVincular.length > 0) {
            const updatePromises = notasParaVincular.map(nota =>
              base44.entities.NotaFiscal.update(nota.id, {
                ordem_id: ordem.id,
                status_nf: "aguardando_expedicao"
              })
            );

            const notasIds = [...(ordem.notas_fiscais_ids || []), ...notasParaVincular.map(n => n.id)];
            const updateOrdemPromise = base44.entities.OrdemDeCarregamento.update(ordem.id, {
              notas_fiscais_ids: notasIds
            });

            await Promise.all([...updatePromises, updateOrdemPromise]);

            // Atualizar estados locais
            setNotasFiscaisLocal(prev => [...prev, ...notasParaVincular]);
            setVolumesLocal(prev => [...prev, ...volumesDaEtiquetaDB]);

            toast.success(`${notasParaVincular.length} nota(s) vinculada(s) automaticamente`);
          } else {
            // Garantir que os volumes estão no estado local
            const volumesIdsLocais = volumesLocal.map(v => v.id);
            const volumesNovos = volumesDaEtiquetaDB.filter(v => !volumesIdsLocais.includes(v.id));
            if (volumesNovos.length > 0) {
              setVolumesLocal(prev => [...prev, ...volumesNovos]);
            }
          }

          // Filtrar volumes que ainda não foram carregados
          const volumesParaCarregar = volumesDaEtiquetaDB.filter(v => 
            !volumesEmbarcados.includes(v.id) && v.nota_fiscal_id
          );

          if (volumesParaCarregar.length === 0) {
            toast.info(`Todos os volumes da etiqueta ${etiquetaMae.codigo} já foram embarcados`);
            setCodigoScanner("");
            return;
          }

          // Embarcar volumes em batch (paralelo)
          const updateVolumePromises = volumesParaCarregar.map(volume =>
            base44.entities.Volume.update(volume.id, {
              status_volume: "carregado",
              localizacao_atual: `Ordem ${ordem.numero_carga || ordem.id.slice(-6)}`
            })
          );

          await Promise.all(updateVolumePromises);

          // Atualizar estado local
          const novosIdsEmbarcados = volumesParaCarregar.map(v => v.id);
          const volumesAtualizados = [...volumesEmbarcados, ...novosIdsEmbarcados];
          setVolumesEmbarcados(volumesAtualizados);

          // Salvar rascunho
          localStorage.setItem(`conferencia_rascunho_${ordem.id}`, JSON.stringify({
            volumesEmbarcados: volumesAtualizados,
            timestamp: new Date().toISOString()
          }));
          
          toast.success(`✅ ${volumesParaCarregar.length} volumes da etiqueta ${etiquetaMae.codigo} embarcados!`);
          setCodigoScanner("");
          return;
        } else {
          toast.warning(`Etiqueta ${etiquetaMae.codigo} sem volumes vinculados`);
          setCodigoScanner("");
          return;
        }
      }
    } catch (error) {
      console.log("Não é etiqueta mãe, continuando busca por volume...");
    }

    // Buscar volume primeiro nas notas vinculadas
    let volume = volumesLocal.find(v => 
      v.identificador_unico?.toUpperCase() === codigoLimpo &&
      notasFiscaisLocal.some(nf => nf.id === v.nota_fiscal_id)
    );

    // Se não encontrou, buscar em TODOS os volumes do estoque
    if (!volume) {
      try {
        const todosVolumes = await base44.entities.Volume.filter({ 
          identificador_unico: codigoLimpo 
        });

        if (todosVolumes.length > 0) {
          volume = todosVolumes[0];
          
          // Buscar a nota fiscal deste volume
          const notaDoVolume = await base44.entities.NotaFiscal.get(volume.nota_fiscal_id);
          
          if (!notaDoVolume) {
            toast.error("Nota fiscal do volume não encontrada");
            return;
          }

          // Buscar TODOS os volumes da nota do banco
          const todosVolumesNota = await base44.entities.Volume.filter({ 
            nota_fiscal_id: notaDoVolume.id 
          });

          // Vincular automaticamente a nota à ordem
          await base44.entities.NotaFiscal.update(notaDoVolume.id, {
            ordem_id: ordem.id,
            status_nf: "aguardando_expedicao"
          });

          // Atualizar ordem com nova nota
          const notasIds = [...(ordem.notas_fiscais_ids || []), notaDoVolume.id];
          const todasNotasOrdem = await base44.entities.NotaFiscal.filter({ 
            id: { $in: notasIds } 
          });
          
          const pesoTotal = todasNotasOrdem.reduce((sum, nf) => sum + (nf.peso_total_nf || 0), 0);
          const volumesTotal = todasNotasOrdem.reduce((sum, nf) => sum + (nf.quantidade_total_volumes_nf || 0), 0);
          const valorTotal = todasNotasOrdem.reduce((sum, nf) => sum + (nf.valor_nota_fiscal || 0), 0);
          
          await base44.entities.OrdemDeCarregamento.update(ordem.id, {
            notas_fiscais_ids: notasIds,
            peso_total_consolidado: pesoTotal,
            volumes_total_consolidado: volumesTotal,
            valor_total_consolidado: valorTotal,
            peso: pesoTotal,
            volumes: volumesTotal
          });

          // Atualizar estados locais com TODOS os volumes da nota
          setNotasFiscaisLocal([...notasFiscaisLocal, notaDoVolume]);
          setVolumesLocal([...volumesLocal, ...todosVolumesNota]);

          // Salvar rascunho
          localStorage.setItem(`enderecamento_notas_${ordem.id}`, JSON.stringify({
            notas: [...notasFiscaisLocal, notaDoVolume],
            volumes: [...volumesLocal, ...todosVolumesNota],
            timestamp: new Date().toISOString()
          }));

          toast.success(`✅ NF ${notaDoVolume.numero_nota} vinculada! ${todosVolumesNota.length} volumes disponíveis.`);
        } else {
          toast.error("Volume não encontrado no estoque");
          setCodigoScanner("");
          return;
        }
      } catch (error) {
        console.error("Erro ao buscar volume:", error);
        toast.error("Erro ao processar volume");
        setCodigoScanner("");
        return;
      }
    } else {
      // Volume encontrado localmente - garantir que todos os volumes da nota estão carregados
      const notaDoVolume = notasFiscaisLocal.find(nf => nf.id === volume.nota_fiscal_id);
      if (notaDoVolume) {
        const volumesNotaLocais = volumesLocal.filter(v => v.nota_fiscal_id === notaDoVolume.id);
        
        // Se tiver menos volumes locais do que o total da nota, buscar do banco
        if (volumesNotaLocais.length < (notaDoVolume.quantidade_total_volumes_nf || 0)) {
          const todosVolumesNota = await base44.entities.Volume.filter({ 
            nota_fiscal_id: notaDoVolume.id 
          });
          
          const volumesIdsLocais = volumesLocal.map(v => v.id);
          const volumesParaAdicionar = todosVolumesNota.filter(v => !volumesIdsLocais.includes(v.id));
          
          if (volumesParaAdicionar.length > 0) {
            setVolumesLocal(prev => [...prev, ...volumesParaAdicionar]);
            
            localStorage.setItem(`enderecamento_notas_${ordem.id}`, JSON.stringify({
              notas: notasFiscaisLocal,
              volumes: [...volumesLocal, ...volumesParaAdicionar],
              timestamp: new Date().toISOString()
            }));
            
            toast.info(`${volumesParaAdicionar.length} volumes adicionais da NF ${notaDoVolume.numero_nota} carregados`);
          }
        }
      }
    }

    // Garantir que todos os volumes da nota estão carregados localmente
    const notaDoVolume = notasFiscaisLocal.find(nf => nf.id === volume.nota_fiscal_id);
    if (notaDoVolume) {
      const volumesNotaLocais = volumesLocal.filter(v => v.nota_fiscal_id === notaDoVolume.id);
      
      // Se tiver menos volumes locais do que o total da nota, buscar do banco
      if (volumesNotaLocais.length < (notaDoVolume.quantidade_total_volumes_nf || 0)) {
        const todosVolumesNota = await base44.entities.Volume.filter({ 
          nota_fiscal_id: notaDoVolume.id 
        });
        
        const volumesIdsLocais = volumesLocal.map(v => v.id);
        const volumesParaAdicionar = todosVolumesNota.filter(v => !volumesIdsLocais.includes(v.id));
        
        if (volumesParaAdicionar.length > 0) {
          setVolumesLocal(prev => [...prev, ...volumesParaAdicionar]);
          
          localStorage.setItem(`enderecamento_notas_${ordem.id}`, JSON.stringify({
            notas: notasFiscaisLocal,
            volumes: [...volumesLocal, ...volumesParaAdicionar],
            timestamp: new Date().toISOString()
          }));
          
          toast.info(`${volumesParaAdicionar.length} volumes adicionais da NF ${notaDoVolume.numero_nota} carregados`);
        }
      }
    }

    if (volumesEmbarcados.includes(volume.id)) {
      toast.warning("Volume já foi embarcado!");
      setCodigoScanner("");
      return;
    }

    // Embarcar volume
    try {
      await base44.entities.Volume.update(volume.id, {
        status_volume: "carregado",
        localizacao_atual: `Ordem ${ordem.numero_carga || ordem.id.slice(-6)}`
      });

      const volumesAtualizados = [...volumesEmbarcados, volume.id];
      setVolumesEmbarcados(volumesAtualizados);
      setCodigoScanner("");

      // Salvar rascunho
      localStorage.setItem(`conferencia_rascunho_${ordem.id}`, JSON.stringify({
        volumesEmbarcados: volumesAtualizados,
        timestamp: new Date().toISOString()
      }));

      const nota = notasFiscaisLocal.find(nf => nf.id === volume.nota_fiscal_id);
      toast.success(`Volume embarcado! NF ${nota?.numero_nota || ''}`);

      // Verificar se todos os volumes da NF foram embarcados
      const volumesNota = getVolumesNota(volume.nota_fiscal_id);
      const embarcadosNota = [...volumesEmbarcados, volume.id].filter(id => 
        volumesNota.some(v => v.id === id)
      );

      if (embarcadosNota.length === volumesNota.length) {
        toast.success(`✅ Nota Fiscal ${nota?.numero_nota} completa!`);
      }
    } catch (error) {
      console.error("Erro ao embarcar volume:", error);
      toast.error("Erro ao registrar embarque");
    }
  };

  const handleConfirmarNFCompleta = async () => {
    if (!nfParaConfirmar) return;

    setSaving(true);
    try {
      const volumesNota = getVolumesNota(nfParaConfirmar.id);
      
      for (const volume of volumesNota) {
        if (!volumesEmbarcados.includes(volume.id)) {
          await base44.entities.Volume.update(volume.id, {
            status_volume: "carregado",
            localizacao_atual: `Ordem ${ordem.numero_carga || ordem.id.slice(-6)}`
          });
        }
      }

      const novosEmbarcados = [...volumesEmbarcados, ...volumesNota.map(v => v.id)];
      const volumesAtualizados = [...new Set(novosEmbarcados)];
      setVolumesEmbarcados(volumesAtualizados);

      // Salvar rascunho
      localStorage.setItem(`conferencia_rascunho_${ordem.id}`, JSON.stringify({
        volumesEmbarcados: volumesAtualizados,
        timestamp: new Date().toISOString()
      }));

      toast.success(`NF ${nfParaConfirmar.numero_nota} confirmada completamente!`);
      setShowConfirmarNF(false);
      setNfParaConfirmar(null);
    } catch (error) {
      console.error("Erro ao confirmar NF:", error);
      toast.error("Erro ao confirmar NF completa");
    } finally {
      setSaving(false);
    }
  };

  const handleRegistrarOcorrencia = async () => {
    if (!ocorrenciaData.observacoes.trim()) {
      toast.error("Digite uma descrição da ocorrência");
      return;
    }

    setSaving(true);
    try {
      await base44.entities.Ocorrencia.create({
        ordem_id: ordem.id,
        categoria: "tracking",
        tipo: ocorrenciaData.tipo,
        data_inicio: new Date().toISOString(),
        observacoes: ocorrenciaData.observacoes,
        status: "aberta",
        gravidade: "media",
        registrado_por: (await base44.auth.me()).id
      });

      // Se for um volume específico, marcar como divergência
      if (volumeOcorrencia) {
        await base44.entities.Volume.update(volumeOcorrencia.id, {
          status_volume: "divergencia"
        });
      }

      toast.success("Ocorrência registrada!");
      setShowOcorrenciaModal(false);
      setVolumeOcorrencia(null);
      setNotaOcorrencia(null);
      setOcorrenciaData({ tipo: "avaria_carga", observacoes: "" });
    } catch (error) {
      console.error("Erro ao registrar ocorrência:", error);
      toast.error("Erro ao registrar ocorrência");
    } finally {
      setSaving(false);
    }
  };

  const handleAbrirFinalizacao = () => {
    // Preencher com datas existentes se já tiverem sido definidas
    const dataInicio = ordem.inicio_carregamento 
      ? new Date(ordem.inicio_carregamento).toISOString().slice(0, 16)
      : new Date().toISOString().slice(0, 16);
    
    const dataFim = ordem.fim_carregamento
      ? new Date(ordem.fim_carregamento).toISOString().slice(0, 16)
      : new Date().toISOString().slice(0, 16);

    setDatasCarregamento({
      inicio: dataInicio,
      fim: dataFim
    });
    setShowFinalizarModal(true);
  };

  const handleFinalizarCarregamento = async () => {
    if (!datasCarregamento.inicio || !datasCarregamento.fim) {
      toast.error("Preencha as datas de início e fim do carregamento");
      return;
    }

    const totalVolumes = getTotalVolumes();
    const volumesEmbarcadosValidos = getVolumesEmbarcadosValidos();
    const totalEmbarcados = volumesEmbarcadosValidos.length;

    if (totalEmbarcados < totalVolumes) {
      const confirmar = window.confirm(
        `Apenas ${totalEmbarcados} de ${totalVolumes} volumes foram embarcados. Deseja mesmo finalizar?`
      );
      if (!confirmar) return;
    }

    setSaving(true);
    try {
      await base44.entities.OrdemDeCarregamento.update(ordem.id, {
        status: "aguardando_carregamento",
        status_tracking: "carregado",
        inicio_carregamento: new Date(datasCarregamento.inicio).toISOString(),
        fim_carregamento: new Date(datasCarregamento.fim).toISOString()
      });

      // Sincronizar status das notas fiscais com base no tracking
      try {
        await sincronizarStatusNotas({ ordemId: ordem.id });
      } catch (error) {
        console.log("Erro ao sincronizar status das notas (ignorando):", error);
      }

      // Limpar rascunho ao finalizar
      localStorage.removeItem(`conferencia_rascunho_${ordem.id}`);

      toast.success("Carregamento finalizado com sucesso!");
      setShowFinalizarModal(false);
      onComplete();
    } catch (error) {
      console.error("Erro ao finalizar carregamento:", error);
      toast.error("Erro ao finalizar carregamento");
    } finally {
      setSaving(false);
    }
  };

  const handleOpenCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: "environment" } 
      });
      setVideoStream(stream);
      setShowCamera(true);
    } catch (error) {
      console.error("Erro ao acessar câmera:", error);
      toast.error("Não foi possível acessar a câmera");
    }
  };

  const handleCloseCamera = () => {
    if (videoStream) {
      videoStream.getTracks().forEach(track => track.stop());
      setVideoStream(null);
    }
    setShowCamera(false);
  };

  const progressoGeral = getTotalVolumes() > 0 
    ? (getVolumesEmbarcadosValidos().length / getTotalVolumes()) * 100 
    : 0;

  const theme = {
    bg: isDark ? '#0f172a' : '#f9fafb',
    cardBg: isDark ? '#1e293b' : '#ffffff',
    cardBorder: isDark ? '#334155' : '#e5e7eb',
    text: isDark ? '#f1f5f9' : '#111827',
    textMuted: isDark ? '#94a3b8' : '#6b7280',
    inputBg: isDark ? '#1e293b' : '#ffffff',
    inputBorder: isDark ? '#334155' : '#d1d5db',
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex flex-col" style={{ backgroundColor: theme.bg }}>
        {/* Header */}
        <div className="border-b p-4" style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={onClose}
                style={{ borderColor: theme.cardBorder, color: theme.text }}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>
              <div>
                <h2 className="text-xl font-bold" style={{ color: theme.text }}>
                  Conferência de Carregamento
                </h2>
                <p className="text-sm" style={{ color: theme.textMuted }}>
                  Ordem: {ordem.numero_carga || `#${ordem.id.slice(-6)}`}
                </p>
              </div>
            </div>
            <Button
              onClick={handleAbrirFinalizacao}
              disabled={saving}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <TruckIcon className="w-4 h-4 mr-2" />
              Finalizar Carregamento
            </Button>
          </div>

          {/* Progresso Geral */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span style={{ color: theme.text }}>Progresso Geral</span>
              <span className="font-bold" style={{ color: theme.text }}>
                {getVolumesEmbarcadosValidos().length} / {getTotalVolumes()} volumes
              </span>
            </div>
            <Progress value={progressoGeral} className="h-3" />
          </div>
        </div>

        {/* Scanner */}
        <div className="border-b p-4" style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}>
          <div className="max-w-2xl mx-auto">
            <Label className="text-sm font-semibold mb-2 block" style={{ color: theme.text }}>
              Escanear Volume
            </Label>
            <div className="flex gap-2">
              <Input
                value={codigoScanner}
                onChange={(e) => setCodigoScanner(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleScanVolume(codigoScanner);
                  }
                }}
                placeholder="Digite ou escaneie o código do volume..."
                className="flex-1 h-12 text-lg"
                style={{ backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.text }}
                autoFocus
              />
              <Button
                variant="outline"
                size="lg"
                onClick={handleOpenCamera}
                style={{ borderColor: theme.cardBorder, color: theme.text }}
              >
                <Camera className="w-5 h-5" />
              </Button>
              <Button
                onClick={() => handleScanVolume(codigoScanner)}
                size="lg"
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Scan className="w-5 h-5 mr-2" />
                Confirmar
              </Button>
            </div>
          </div>
        </div>

        {/* Lista de Notas Fiscais e Volumes */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="max-w-5xl mx-auto space-y-4">
            {notasFiscaisLocal.map((nota) => {
              const volumesNota = getVolumesNota(nota.id);
              const volumesEmbarcadosNota = getVolumesEmbarcadosNota(nota.id);
              const progressoNota = volumesNota.length > 0
                ? (volumesEmbarcadosNota.length / volumesNota.length) * 100
                : 0;
              const notaCompleta = progressoNota === 100;

              return (
                <Card key={nota.id} style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <FileText className="w-5 h-5 text-blue-600" />
                          <CardTitle className="text-base" style={{ color: theme.text }}>
                            NF {nota.numero_nota}
                          </CardTitle>
                          {notaCompleta && (
                            <Badge className="bg-green-600 text-white">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Completa
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm mb-2" style={{ color: theme.textMuted }}>
                          {nota.emitente_razao_social}
                        </p>
                        <div className="flex items-center gap-4 text-sm" style={{ color: theme.textMuted }}>
                          <span>Volumes: {volumesEmbarcadosNota.length}/{volumesNota.length}</span>
                          <span>Peso: {nota.peso_total_nf?.toLocaleString()} kg</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setNfParaConfirmar(nota);
                            setShowConfirmarNF(true);
                          }}
                          disabled={notaCompleta}
                          style={{ borderColor: theme.cardBorder, color: theme.text }}
                        >
                          <Check className="w-4 h-4 mr-2" />
                          Confirmar NF Completa
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setNotaOcorrencia(nota);
                            setShowOcorrenciaModal(true);
                          }}
                          style={{ borderColor: '#ef4444', color: '#ef4444' }}
                        >
                          <AlertTriangle className="w-4 h-4 mr-2" />
                          Ocorrência
                        </Button>
                      </div>
                    </div>
                    <Progress value={progressoNota} className="h-2 mt-2" />
                  </CardHeader>

                  <CardContent>
                    <div className="space-y-1">
                      {volumesNota.map((volume) => {
                        const embarcado = volumesEmbarcados.includes(volume.id);
                        return (
                          <div
                            key={volume.id}
                            className="flex items-center justify-between p-2 rounded border"
                            style={{
                              backgroundColor: embarcado ? (isDark ? '#064e3b' : '#d1fae5') : 'transparent',
                              borderColor: embarcado ? '#10b981' : theme.cardBorder
                            }}
                          >
                            <div className="flex items-center gap-3">
                              {embarcado ? (
                                <CheckCircle className="w-4 h-4 text-green-600" />
                              ) : (
                                <Package className="w-4 h-4" style={{ color: theme.textMuted }} />
                              )}
                              <span className="font-mono text-sm" style={{ color: theme.text }}>
                                {volume.identificador_unico}
                              </span>
                              <span className="text-xs" style={{ color: theme.textMuted }}>
                                {volume.peso_volume} kg
                              </span>
                            </div>
                            {!embarcado && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleScanVolume(volume.identificador_unico)}
                                style={{ borderColor: theme.cardBorder, color: theme.text }}
                              >
                                Embarcar
                              </Button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>

      {/* Modal Confirmar NF Completa */}
      <Dialog open={showConfirmarNF} onOpenChange={setShowConfirmarNF}>
        <DialogContent style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}>
          <DialogHeader>
            <DialogTitle style={{ color: theme.text }}>Confirmar NF Completa</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p style={{ color: theme.text }}>
              Deseja confirmar todos os volumes da NF <strong>{nfParaConfirmar?.numero_nota}</strong>?
            </p>
            <p className="text-sm mt-2" style={{ color: theme.textMuted }}>
              Total de volumes: {nfParaConfirmar ? getVolumesNota(nfParaConfirmar.id).length : 0}
            </p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowConfirmarNF(false);
                setNfParaConfirmar(null);
              }}
              style={{ borderColor: theme.cardBorder, color: theme.text }}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleConfirmarNFCompleta}
              disabled={saving}
              className="bg-green-600 hover:bg-green-700"
            >
              {saving ? "Confirmando..." : "Confirmar Todos"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Finalizar Carregamento */}
      <Dialog open={showFinalizarModal} onOpenChange={setShowFinalizarModal}>
        <DialogContent style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}>
          <DialogHeader>
            <DialogTitle style={{ color: theme.text }}>Finalizar Carregamento</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label style={{ color: theme.text }}>Data/Hora Início do Carregamento *</Label>
              <Input
                type="datetime-local"
                value={datasCarregamento.inicio}
                onChange={(e) => setDatasCarregamento({ ...datasCarregamento, inicio: e.target.value })}
                className="mt-1"
                style={{ backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.text }}
              />
            </div>
            <div>
              <Label style={{ color: theme.text }}>Data/Hora Fim do Carregamento *</Label>
              <Input
                type="datetime-local"
                value={datasCarregamento.fim}
                onChange={(e) => setDatasCarregamento({ ...datasCarregamento, fim: e.target.value })}
                className="mt-1"
                style={{ backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.text }}
              />
            </div>
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded">
              <p className="text-xs" style={{ color: theme.text }}>
                ℹ️ {ordem.inicio_carregamento ? "Atualizando datas existentes" : "Registrando datas do carregamento"}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowFinalizarModal(false);
                setDatasCarregamento({ inicio: "", fim: "" });
              }}
              style={{ borderColor: theme.cardBg, color: theme.text }}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleFinalizarCarregamento}
              disabled={saving || !datasCarregamento.inicio || !datasCarregamento.fim}
              className="bg-green-600 hover:bg-green-700"
            >
              {saving ? "Finalizando..." : "Finalizar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Registrar Ocorrência */}
      <Dialog open={showOcorrenciaModal} onOpenChange={setShowOcorrenciaModal}>
        <DialogContent style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}>
          <DialogHeader>
            <DialogTitle style={{ color: theme.text }}>Registrar Ocorrência</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label style={{ color: theme.text }}>Tipo de Ocorrência</Label>
              <select
                value={ocorrenciaData.tipo}
                onChange={(e) => setOcorrenciaData({ ...ocorrenciaData, tipo: e.target.value })}
                className="w-full mt-1 p-2 rounded border"
                style={{ backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.text }}
              >
                <option value="avaria_carga">Avaria na Carga</option>
                <option value="falta_volume">Falta de Volume</option>
                <option value="volume_extra">Volume Extra</option>
                <option value="divergencia_nf">Divergência na NF</option>
                <option value="outro">Outro</option>
              </select>
            </div>
            <div>
              <Label style={{ color: theme.text }}>Descrição</Label>
              <Textarea
                value={ocorrenciaData.observacoes}
                onChange={(e) => setOcorrenciaData({ ...ocorrenciaData, observacoes: e.target.value })}
                placeholder="Descreva a ocorrência..."
                rows={4}
                className="mt-1"
                style={{ backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.text }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowOcorrenciaModal(false);
                setVolumeOcorrencia(null);
                setNotaOcorrencia(null);
                setOcorrenciaData({ tipo: "avaria_carga", observacoes: "" });
              }}
              style={{ borderColor: theme.cardBorder, color: theme.text }}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleRegistrarOcorrencia}
              disabled={saving}
              className="bg-orange-600 hover:bg-orange-700"
            >
              {saving ? "Registrando..." : "Registrar Ocorrência"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Câmera (Placeholder - requer biblioteca de QR Code) */}
      {showCamera && (
        <Dialog open={showCamera} onOpenChange={handleCloseCamera}>
          <DialogContent style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}>
            <DialogHeader>
              <DialogTitle style={{ color: theme.text }}>Scanner de Código de Barras</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <p className="text-center text-sm mb-4" style={{ color: theme.textMuted }}>
                Funcionalidade de scanner via câmera disponível em breve.
              </p>
              <p className="text-center text-sm" style={{ color: theme.textMuted }}>
                Por enquanto, digite o código manualmente no campo acima.
              </p>
            </div>
            <DialogFooter>
              <Button onClick={handleCloseCamera}>Fechar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}