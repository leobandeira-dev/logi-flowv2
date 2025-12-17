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
  TruckIcon,
  ChevronDown,
  ChevronRight
} from "lucide-react";
import CameraScanner from "../etiquetas-mae/CameraScanner";
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
  const [videoStream, setVideoStream] = useState(null);
  const [notasFiscaisLocal, setNotasFiscaisLocal] = useState([]);
  const [volumesLocal, setVolumesLocal] = useState([]);
  const [showFinalizarModal, setShowFinalizarModal] = useState(false);
  const [datasCarregamento, setDatasCarregamento] = useState({
    inicio: "",
    fim: ""
  });
  const [notasExpandidas, setNotasExpandidas] = useState({});
  const [notaEmConferencia, setNotaEmConferencia] = useState(null);

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
          
          // CRÍTICO: Filtrar apenas volumes que pertencem às notas atuais
          const notasIdsAtuais = notasFiscaisLocal.map(nf => nf.id);
          const volumesValidos = volumesRestaurados.filter(volumeId => {
            const volume = volumesLocal.find(v => v.id === volumeId);
            return volume && notasIdsAtuais.includes(volume.nota_fiscal_id);
          });
          
          setVolumesEmbarcados(volumesValidos);
          
          const novosDoRascunho = volumesValidos.length - embarcados.length;
          if (novosDoRascunho > 0) {
            toast.info(`${novosDoRascunho} volume(s) embarcado(s) restaurado(s) do rascunho`);
          }
          
          // Atualizar rascunho com volumes limpos
          localStorage.setItem(`conferencia_rascunho_${ordem.id}`, JSON.stringify({
            volumesEmbarcados: volumesValidos,
            timestamp: new Date().toISOString()
          }));
        }
      } catch (error) {
        console.error("Erro ao carregar rascunho:", error);
      }
    } else {
      setVolumesEmbarcados(embarcados);
    }
  }, [volumesLocal, ordem.id, notasFiscaisLocal]);

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
    const validos = volumesEmbarcados.filter(volumeId => {
      const volume = volumesLocal.find(v => v.id === volumeId);
      return volume && notasIdsAtuais.includes(volume.nota_fiscal_id);
    });
    
    // Debug log
    console.log('📊 Volumes Embarcados Debug:', {
      totalEmbarcados: volumesEmbarcados.length,
      volumesValidos: validos.length,
      totalVolumes: getTotalVolumes(),
      notasAtuais: notasFiscaisLocal.length,
      volumesOrf: volumesEmbarcados.length - validos.length
    });
    
    return validos;
  };

  const handleScanVolume = async (codigo) => {
    if (!codigo || !codigo.trim()) {
      toast.error("Digite ou escaneie um código");
      return 'error';
    }

    const codigoLimpo = codigo.trim().toUpperCase();

    // 1. Tentar encontrar como ETIQUETA MÃE primeiro

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

          // Atualizar volumes locais com status atualizado
          setVolumesLocal(prevVolumes => 
            prevVolumes.map(v => 
              novosIdsEmbarcados.includes(v.id) 
                ? { ...v, status_volume: "carregado" }
                : v
            )
          );

          // Salvar rascunho
          localStorage.setItem(`conferencia_rascunho_${ordem.id}`, JSON.stringify({
            volumesEmbarcados: volumesAtualizados,
            timestamp: new Date().toISOString()
          }));

          toast.success(`✅ ${volumesParaCarregar.length} volumes embarcados!`);

          // Atualizar nota em conferência
          if (notasIdsUnicas.length === 1) {
            const notaId = notasIdsUnicas[0];
            const nota = notasFiscaisLocal.find(nf => nf.id === notaId) || notasParaVincular.find(n => n.id === notaId);
            if (nota) {
              setNotaEmConferencia(nota);

              // Verificar se completou a nota
              const volumesNota = volumesLocal.filter(v => v.nota_fiscal_id === nota.id);
              const embarcadosNota = volumesAtualizados.filter(id => 
                volumesNota.some(v => v.id === id)
              );
              if (embarcadosNota.length === volumesNota.length) {
                toast.success(`✅ Nota Fiscal ${nota.numero_nota} completa!`);
                setNotaEmConferencia(null);
              }
            }
          }

          setCodigoScanner("");
          return 'success';
        } else {
          toast.warning(`Etiqueta ${etiquetaMae.codigo} sem volumes vinculados`);
          setCodigoScanner("");
          return;
        }
      }
    } catch (error) {
      console.log("Não é etiqueta mãe, continuando busca por volume...");
    }

// 2. Buscar como VOLUME INDIVIDUAL
    let volume = volumesLocal.find(v => 
      v.identificador_unico?.toUpperCase() === codigoLimpo &&
      notasFiscaisLocal.some(nf => nf.id === v.nota_fiscal_id)
    );

    // Verificar se já foi embarcado ANTES de qualquer processamento
      if (volume && volumesEmbarcados.includes(volume.id)) {
        toast.warning("Volume já foi embarcado!", { duration: 1500 });
        setCodigoScanner("");
        return 'duplicate';
      }

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
                setNotasFiscaisLocal(prev => [...prev, notaDoVolume]);
                setVolumesLocal(prev => [...prev, ...todosVolumesNota]);

                // Salvar rascunho de notas e volumes
                localStorage.setItem(`enderecamento_notas_${ordem.id}`, JSON.stringify({
                  notas: [...notasFiscaisLocal, notaDoVolume],
                  volumes: [...volumesLocal, ...todosVolumesNota],
                  timestamp: new Date().toISOString()
                }));

                toast.success(`✅ NF ${notaDoVolume.numero_nota} vinculada! ${todosVolumesNota.length} volumes disponíveis.`, { duration: 2000 });
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
      toast.warning("Volume já foi embarcado!", { duration: 1500 });
      setCodigoScanner("");
      return 'duplicate';
    }

    // Embarcar volume individual
    try {
      await base44.entities.Volume.update(volume.id, {
        status_volume: "carregado",
        localizacao_atual: `Ordem ${ordem.numero_carga || ordem.id.slice(-6)}`
      });

      const volumesAtualizados = [...volumesEmbarcados, volume.id];
      setVolumesEmbarcados(volumesAtualizados);
      
      // Atualizar volumes locais com status atualizado
      setVolumesLocal(prevVolumes => 
        prevVolumes.map(v => 
          v.id === volume.id 
            ? { ...v, status_volume: "carregado" }
            : v
        )
      );
      
      setCodigoScanner("");

      // Salvar rascunho
      localStorage.setItem(`conferencia_rascunho_${ordem.id}`, JSON.stringify({
        volumesEmbarcados: volumesAtualizados,
        timestamp: new Date().toISOString()
      }));

      const nota = notasFiscaisLocal.find(nf => nf.id === volume.nota_fiscal_id);
      toast.success(`✓ Volume embarcado! NF ${nota?.numero_nota || ''}`, { duration: 1500 });

      // Verificar se todos os volumes da NF foram embarcados
      const volumesNota = volumesLocal.filter(v => v.nota_fiscal_id === volume.nota_fiscal_id);
      const embarcadosNota = volumesAtualizados.filter(id => 
        volumesNota.some(v => v.id === id)
      );

      // Atualizar nota em conferência
      setNotaEmConferencia(nota);

      if (embarcadosNota.length === volumesNota.length) {
        toast.success(`✅ Nota Fiscal ${nota?.numero_nota} completa!`);
        setNotaEmConferencia(null);
      }

      return 'success';
      } catch (error) {
      console.error("Erro ao embarcar volume:", error);
      toast.error("Erro ao registrar embarque");
      return 'error';
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

  const handleScanQRCode = async (codigo) => {
    // Não fechar o modal - deixar aberto para scans consecutivos
    const result = await handleScanVolume(codigo);
    return result; // Retornar resultado para feedback visual
  };

  const toggleNotaExpandida = (notaId) => {
    setNotasExpandidas(prev => ({
      ...prev,
      [notaId]: !prev[notaId]
    }));
  };

  // Limpar volumes embarcados órfãos quando notas mudarem
  useEffect(() => {
    const notasIdsAtuais = notasFiscaisLocal.map(nf => nf.id);
    const volumesValidos = volumesEmbarcados.filter(volumeId => {
      const volume = volumesLocal.find(v => v.id === volumeId);
      return volume && notasIdsAtuais.includes(volume.nota_fiscal_id);
    });
    
    if (volumesValidos.length !== volumesEmbarcados.length) {
      setVolumesEmbarcados(volumesValidos);
      
      // Atualizar rascunho
      localStorage.setItem(`conferencia_rascunho_${ordem.id}`, JSON.stringify({
        volumesEmbarcados: volumesValidos,
        timestamp: new Date().toISOString()
      }));
    }
  }, [notasFiscaisLocal, volumesLocal]);

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
        {/* Header Compacto */}
        <div className="border-b p-3" style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={onClose}
                className="h-8"
                style={{ borderColor: theme.cardBorder, color: theme.text }}
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <div>
                <h2 className="text-base font-bold leading-tight" style={{ color: theme.text }}>
                  Conferência de Carregamento
                </h2>
                <p className="text-xs" style={{ color: theme.textMuted }}>
                  Ordem: {ordem.numero_carga || `#${ordem.id.slice(-6)}`}
                </p>
              </div>
            </div>
            <Button
              onClick={handleAbrirFinalizacao}
              disabled={saving}
              size="sm"
              className="bg-green-600 hover:bg-green-700 text-white h-8 text-xs"
            >
              <TruckIcon className="w-3 h-3 mr-1" />
              Finalizar
            </Button>
          </div>

          {/* Progresso Geral */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span style={{ color: theme.text }}>Progresso Geral</span>
              <span className="font-bold" style={{ color: theme.text }}>
                {getVolumesEmbarcadosValidos().length} / {getTotalVolumes()} volumes
              </span>
            </div>
            <Progress value={progressoGeral} className="h-2" />
          </div>
        </div>

        {/* Scanner QR Code */}
        <div className="border-b p-3" style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}>
          <Button
            onClick={() => {
              // Identificar nota em conferência (primeira com volumes pendentes)
              const notaPendente = notasFiscaisLocal.find(nota => {
                const volumesNota = getVolumesNota(nota.id);
                const embarcadosNota = getVolumesEmbarcadosNota(nota.id);
                return embarcadosNota.length < volumesNota.length;
              });
              setNotaEmConferencia(notaPendente);
              setShowCamera(true);
            }}
            size="lg"
            className="w-full bg-blue-600 hover:bg-blue-700 h-12"
          >
            <Camera className="w-5 h-5 mr-2" />
            Escanear QR Code
          </Button>
        </div>

        {/* Lista Resumida de Notas Fiscais */}
        <div className="flex-1 overflow-y-auto p-3">
          <div className="space-y-2">
            {notasFiscaisLocal.map((nota) => {
              const volumesNota = getVolumesNota(nota.id);
              const volumesEmbarcadosNota = getVolumesEmbarcadosNota(nota.id);
              const progressoNota = volumesNota.length > 0
                ? (volumesEmbarcadosNota.length / volumesNota.length) * 100
                : 0;
              const notaCompleta = progressoNota === 100;
              const pendentes = volumesNota.length - volumesEmbarcadosNota.length;
              const isExpanded = notasExpandidas[nota.id];

              return (
                <Card key={nota.id} style={{ backgroundColor: theme.cardBg, borderColor: notaCompleta ? '#10b981' : theme.cardBorder }}>
                  {/* Header Resumido */}
                  <div 
                    className="p-3 cursor-pointer active:bg-gray-50 dark:active:bg-gray-800/50 transition-colors"
                    onClick={() => toggleNotaExpandida(nota.id)}
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex items-start gap-2 flex-1 min-w-0">
                        {isExpanded ? (
                          <ChevronDown className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: theme.textMuted }} />
                        ) : (
                          <ChevronRight className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: theme.textMuted }} />
                        )}
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <FileText className="w-4 h-4 text-blue-600 flex-shrink-0" />
                            <span className="font-bold text-base" style={{ color: theme.text }}>
                              NF {nota.numero_nota}
                            </span>
                            {notaCompleta ? (
                              <Badge className="bg-green-600 text-white text-xs px-2 py-0.5">
                                Completa
                              </Badge>
                            ) : (
                              <Badge className="bg-orange-500 text-white text-xs px-2 py-0.5 font-bold">
                                {pendentes} pendente{pendentes !== 1 ? 's' : ''}
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs truncate" style={{ color: theme.textMuted }}>
                            {nota.emitente_razao_social}
                          </p>
                        </div>
                      </div>

                      <div className="text-right flex-shrink-0">
                        <div className="text-base font-bold whitespace-nowrap" style={{ color: theme.text }}>
                          {volumesEmbarcadosNota.length}/{volumesNota.length}
                        </div>
                        <div className="text-xs whitespace-nowrap" style={{ color: theme.textMuted }}>
                          {nota.destinatario_cidade}/{nota.destinatario_uf}
                        </div>
                        <div className="text-xs whitespace-nowrap" style={{ color: theme.textMuted }}>
                          {nota.peso_total_nf?.toLocaleString()} kg
                        </div>
                      </div>
                    </div>

                    <Progress value={progressoNota} className="h-1.5" />
                  </div>

                  {/* Lista Detalhada (Expansível) */}
                  {isExpanded && (
                    <CardContent className="pt-0 pb-3 px-3">
                      <div className="space-y-1 mb-3">
                        {volumesNota.map((volume) => {
                          const embarcado = volumesEmbarcados.includes(volume.id);
                          return (
                            <div
                              key={volume.id}
                              className="flex items-center gap-2 p-2 rounded border"
                              style={{
                                backgroundColor: embarcado ? (isDark ? '#064e3b' : '#d1fae5') : 'transparent',
                                borderColor: embarcado ? '#10b981' : theme.cardBorder
                              }}
                            >
                              {embarcado ? (
                                <CheckCircle className="w-3.5 h-3.5 text-green-600 flex-shrink-0" />
                              ) : (
                                <Package className="w-3.5 h-3.5 flex-shrink-0" style={{ color: theme.textMuted }} />
                              )}
                              <span className="font-mono text-xs flex-1" style={{ color: theme.text }}>
                                {volume.identificador_unico}
                              </span>
                              <span className="text-[10px] flex-shrink-0" style={{ color: theme.textMuted }}>
                                {volume.peso_volume} kg
                              </span>
                            </div>
                          );
                        })}
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setNotaOcorrencia(nota);
                          setShowOcorrenciaModal(true);
                        }}
                        className="w-full h-9"
                        style={{ borderColor: '#ef4444', color: '#ef4444' }}
                      >
                        <AlertTriangle className="w-4 h-4 mr-2" />
                        Registrar Ocorrência
                      </Button>
                    </CardContent>
                  )}
                </Card>
              );
            })}
          </div>
        </div>
      </div>



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

      {/* Modal de Câmera */}
      {showCamera && (
        <CameraScanner
          open={showCamera}
          onClose={() => {
            setShowCamera(false);
            setNotaEmConferencia(null);
          }}
          onScan={handleScanQRCode}
          isDark={isDark}
          notaAtual={notaEmConferencia}
          progressoAtual={notaEmConferencia ? {
            embarcados: getVolumesEmbarcadosNota(notaEmConferencia.id).length,
            total: getVolumesNota(notaEmConferencia.id).length,
            faltam: getVolumesNota(notaEmConferencia.id).length - getVolumesEmbarcadosNota(notaEmConferencia.id).length
          } : null}
        />
      )}
    </>
  );
}