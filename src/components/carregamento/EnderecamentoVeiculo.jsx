import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import {
  ArrowLeft,
  Search,
  Printer,
  Save,
  Trash2,
  Package,
  FileText,
  Grid3x3,
  CheckCircle,
  Camera
} from "lucide-react";
import CameraScanner from "../etiquetas-mae/CameraScanner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { motion, AnimatePresence } from "framer-motion";
import { playSuccessBeep, playErrorBeep } from "../utils/audioFeedback";

// Componente auxiliar para exibir lista de notas da base
const NotasBaseList = ({ notasBaseBusca, notasFiscaisLocal, volumesLocal, onSelecionarNota, theme, isDark }) => {
  const [todasNotas, setTodasNotas] = React.useState([]);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    loadNotasBase();
  }, []);

  const loadNotasBase = async () => {
    setLoading(true);
    try {
      const notas = await base44.entities.NotaFiscal.list("-created_date", 200);
      setTodasNotas(notas);
    } catch (error) {
      console.error("Erro ao carregar notas da base:", error);
    } finally {
      setLoading(false);
    }
  };

  const notasFiltradas = todasNotas.filter(nota => {
    if (!notasBaseBusca) return true;
    const termo = notasBaseBusca.trim().toLowerCase();
    const termoNumerico = notasBaseBusca.trim().replace(/\D/g, '');
    
    return nota.numero_nota?.toLowerCase().includes(termo) ||
           nota.chave_nota_fiscal?.includes(termoNumerico) ||
           nota.emitente_razao_social?.toLowerCase().includes(termo) ||
           nota.destinatario_razao_social?.toLowerCase().includes(termo);
  });

  if (loading) {
    return (
      <div className="text-center py-8" style={{ color: theme.textMuted }}>
        <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
        <p className="text-xs">Carregando notas...</p>
      </div>
    );
  }

  return (
    <>
      {notasFiltradas.map((nota) => {
        const volumesNota = volumesLocal.filter(v => v.nota_fiscal_id === nota.id);
        const jaVinculada = notasFiscaisLocal.some(nf => nf.id === nota.id);

        return (
          <div
            key={nota.id}
            onClick={() => onSelecionarNota(nota)}
            className="p-2 border rounded cursor-pointer hover:shadow-sm transition-all"
            style={{
              borderColor: theme.cardBorder,
              backgroundColor: jaVinculada ? (isDark ? '#065f4633' : '#d1fae533') : 'transparent'
            }}
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-bold text-xs" style={{ color: theme.text }}>
                    NF {nota.numero_nota}
                  </p>
                  {jaVinculada && (
                    <Badge className="bg-green-600 text-white text-[8px] h-3.5 px-1.5">
                      Vinculada
                    </Badge>
                  )}
                </div>
                <p className="text-xs truncate" style={{ color: theme.textMuted }}>
                  {nota.emitente_razao_social}
                </p>
                <p className="text-[10px]" style={{ color: theme.textMuted }}>
                  {volumesNota.length} vol. | {(nota.peso_total_nf || 0).toLocaleString()} kg
                </p>
              </div>
            </div>
          </div>
        );
      })}

      {notasFiltradas.length === 0 && (
        <div className="text-center py-8" style={{ color: theme.textMuted }}>
          <FileText className="w-12 h-12 mx-auto mb-2 opacity-20" />
          <p className="text-sm">Nenhuma nota fiscal encontrada</p>
        </div>
      )}
    </>
  );
};

const TEMPLATES_VEICULO = {
  "CARRETA": { linhas: 6, colunas: ["Esquerda", "Centro", "Direita"] },
  "TRUCK": { linhas: 4, colunas: ["Esquerda", "Direita"] },
  "BITREM": { linhas: 8, colunas: ["Esquerda", "Centro", "Direita"] },
  "RODOTREM": { linhas: 10, colunas: ["Esquerda", "Centro", "Direita"] },
  "VAN": { linhas: 3, colunas: ["Esquerda", "Direita"] },
};

export default function EnderecamentoVeiculo({ ordem, notasFiscais, volumes, onClose, onComplete }) {
  const [isDark, setIsDark] = useState(false);
  const [loading, setLoading] = useState(true);
  const [tipoVeiculo, setTipoVeiculo] = useState("CARRETA");
  const [numLinhas, setNumLinhas] = useState(6);
  const [layoutConfig, setLayoutConfig] = useState({ linhas: 6, colunas: ["Esquerda", "Centro", "Direita"] });
  const [enderecamentos, setEnderecamentos] = useState([]);
  const [volumesSelecionados, setVolumesSelecionados] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filtroTipo, setFiltroTipo] = useState("volume");
  const [processandoBusca, setProcessandoBusca] = useState(false);
  const [saving, setSaving] = useState(false);
  const [tipoImpressao, setTipoImpressao] = useState("resumido");
  const [searchChaveNF, setSearchChaveNF] = useState("");
  const [processandoChave, setProcessandoChave] = useState(false);
  const [notasOrigem, setNotasOrigem] = useState({});
  const [abaAtiva, setAbaAtiva] = useState("volumes");
  const [notasFiscaisLocal, setNotasFiscaisLocal] = useState([]);
  const [volumesLocal, setVolumesLocal] = useState([]);
  const [isMobile, setIsMobile] = useState(false);
  const [showBuscaModal, setShowBuscaModal] = useState(false);
  const [celulaAtiva, setCelulaAtiva] = useState(null);
  const [showFinalizarModal, setShowFinalizarModal] = useState(false);
  const [datasCarregamento, setDatasCarregamento] = useState({
    inicio: "",
    fim: ""
  });
  const [usarBase, setUsarBase] = useState(true);
  const [notasBaseBusca, setNotasBaseBusca] = useState("");
  const inputChaveRef = React.useRef(null);
  const [showCamera, setShowCamera] = useState(false);
  const [processandoQR, setProcessandoQR] = useState(false);
  const [notasExpandidas, setNotasExpandidas] = useState({});
  const [showQuantidadeModal, setShowQuantidadeModal] = useState(false);
  const [movimentacaoNota, setMovimentacaoNota] = useState(null);
  const [quantidadeMovimentar, setQuantidadeMovimentar] = useState("");
  const [apenasNotasVinculadas, setApenasNotasVinculadas] = useState(false);
  const [showCameraNotaFiscal, setShowCameraNotaFiscal] = useState(false);

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
    const checkMobile = () => {
      // Verificar se é dispositivo touch OU se largura é menor que 1024
      const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      const isSmallScreen = window.innerWidth <= 1024;
      setIsMobile(isTouchDevice || isSmallScreen);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    inicializarDados();
  }, [notasFiscais, volumes]);

  const inicializarDados = async () => {
    try {
      // 1. Carregar endereçamentos da ordem do banco
      const enderecamentosDB = await base44.entities.EnderecamentoVolume.filter({ ordem_id: ordem.id });
      
      // 2. Extrair IDs únicos de notas e volumes dos endereçamentos
      const notasIdsEnderecadas = [...new Set(enderecamentosDB.map(e => e.nota_fiscal_id).filter(Boolean))];
      const volumesIdsEnderecados = [...new Set(enderecamentosDB.map(e => e.volume_id).filter(Boolean))];
      
      // 3. Buscar notas e volumes do banco se houver endereçamentos
      let notasDB = [];
      let volumesDB = [];
      
      if (notasIdsEnderecadas.length > 0) {
        notasDB = await base44.entities.NotaFiscal.filter({ id: { $in: notasIdsEnderecadas } });
      }
      
      if (volumesIdsEnderecados.length > 0) {
        volumesDB = await base44.entities.Volume.filter({ id: { $in: volumesIdsEnderecados } });
      }
      
      // 4. Mesclar com dados das props (sem duplicar)
      const notasIdsProps = notasFiscais.map(n => n.id);
      const volumesIdsProps = volumes.map(v => v.id);
      
      const notasFinais = [
        ...notasFiscais,
        ...notasDB.filter(n => !notasIdsProps.includes(n.id))
      ];
      
      const volumesFinais = [
        ...volumes,
        ...volumesDB.filter(v => !volumesIdsProps.includes(v.id))
      ];
      
      setNotasFiscaisLocal(notasFinais);
      setVolumesLocal(volumesFinais);
      
      if (notasDB.length > 0 || volumesDB.length > 0) {
        console.log(`📦 Restaurados: ${notasDB.length} notas, ${volumesDB.length} volumes`);
      }
    } catch (error) {
      console.error("Erro ao inicializar dados:", error);
      // Fallback para props
      setNotasFiscaisLocal(notasFiscais);
      setVolumesLocal(volumes);
    }
  };

  useEffect(() => {
    // Carregar dados do banco e depois restaurar rascunho se existir
    const init = async () => {
      await loadEnderecamentos();
      loadNotasOrigem();
      // Pequeno delay para garantir que o estado do banco foi processado
      setTimeout(() => carregarRascunhoLocal(), 100);
    };
    init();
  }, [ordem.id]);

  const carregarRascunhoLocal = () => {
    try {
      const rascunhoSalvo = localStorage.getItem(`enderecamento_rascunho_${ordem.id}`);
      if (rascunhoSalvo) {
        const rascunho = JSON.parse(rascunhoSalvo);
        
        // Verificar se o rascunho não é muito antigo (7 dias)
        const dataRascunho = new Date(rascunho.timestamp);
        const diasPassados = (Date.now() - dataRascunho.getTime()) / (1000 * 60 * 60 * 24);
        
        if (diasPassados > 7) {
          console.log('🗑️ Rascunho antigo removido');
          localStorage.removeItem(`enderecamento_rascunho_${ordem.id}`);
          return;
        }
        
        console.log('📂 Rascunho encontrado:', {
          enderecamentos: rascunho.enderecamentos?.length || 0,
          notas: rascunho.notas?.length || 0,
          volumes: rascunho.volumes?.length || 0,
          idade: `${Math.floor(diasPassados * 24)}h`
        });
        
        // Restaurar dados do rascunho
        if (rascunho.notasOrigem) setNotasOrigem(rascunho.notasOrigem);
        if (rascunho.notas && rascunho.notas.length > 0) setNotasFiscaisLocal(rascunho.notas);
        if (rascunho.volumes && rascunho.volumes.length > 0) setVolumesLocal(rascunho.volumes);
        if (rascunho.enderecamentos && rascunho.enderecamentos.length > 0) setEnderecamentos(rascunho.enderecamentos);
        
        // Toast discreto informando que há um rascunho
        if (rascunho.enderecamentos?.length > 0) {
          setTimeout(() => {
            toast.info(`💾 Progresso anterior restaurado: ${rascunho.enderecamentos.length} endereçamentos`, { 
              duration: 3000 
            });
          }, 500);
        }
      }
    } catch (error) {
      console.error("Erro ao carregar rascunho:", error);
    }
  };

  const loadNotasOrigem = () => {
    const origens = {};
    notasFiscaisLocal.forEach(nf => {
      if (!origens[nf.id]) {
        origens[nf.id] = "Vinculada";
      }
    });
    setNotasOrigem(origens);
  };

  // Helper para salvar rascunho (síncrono para garantir salvamento)
  const salvarRascunho = () => {
    try {
      const enderecamentosOrdemAtual = enderecamentos.filter(e => e.ordem_id === ordem.id);
      const rascunho = {
        enderecamentos: enderecamentosOrdemAtual,
        notas: notasFiscaisLocal,
        volumes: volumesLocal,
        notasOrigem: notasOrigem,
        timestamp: new Date().toISOString()
      };
      
      localStorage.setItem(`enderecamento_rascunho_${ordem.id}`, JSON.stringify(rascunho));
      console.log(`💾 Rascunho salvo: ${enderecamentosOrdemAtual.length} endereçamentos, ${notasFiscaisLocal.length} notas, ${volumesLocal.length} volumes`);
    } catch (error) {
      console.error("Erro ao salvar rascunho:", error);
    }
  };

  const handleSalvarProgresso = async () => {
    setSaving(true);
    try {
      // Salvar no localStorage
      salvarRascunho();
      
      // Opcional: sincronizar dados críticos com o banco (notas vinculadas)
      const notasIds = notasFiscaisLocal.map(n => n.id);
      if (notasIds.length > 0) {
        await base44.entities.OrdemDeCarregamento.update(ordem.id, {
          notas_fiscais_ids: notasIds
        });
      }
      
      toast.success("✅ Progresso salvo! Você pode continuar depois.", { duration: 2000 });
    } catch (error) {
      console.error("Erro ao salvar progresso:", error);
      toast.error("Erro ao salvar progresso");
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    if (ordem.tipo_veiculo) {
      const tipoBase = ordem.tipo_veiculo.split(' ')[0];
      const template = TEMPLATES_VEICULO[tipoBase] || TEMPLATES_VEICULO["CARRETA"];
      setTipoVeiculo(tipoBase);
      setLayoutConfig(template);
      setNumLinhas(template.linhas);
    }
  }, [ordem.tipo_veiculo]);

  const loadEnderecamentos = async () => {
    setLoading(true);
    try {
      // Buscar apenas endereçamentos desta ordem
      const endData = await base44.entities.EnderecamentoVolume.filter({ ordem_id: ordem.id });
      
      // CRÍTICO: Remover duplicatas por volume_id (manter apenas o mais recente)
      const endereçamentosUnicos = endData.reduce((acc, end) => {
        const existente = acc.find(e => e.volume_id === end.volume_id);
        if (!existente) {
          acc.push(end);
        } else {
          // Manter o mais recente
          const dataExistente = new Date(existente.data_enderecamento || existente.created_date);
          const dataAtual = new Date(end.data_enderecamento || end.created_date);
          if (dataAtual > dataExistente) {
            const index = acc.findIndex(e => e.volume_id === end.volume_id);
            acc[index] = end;
          }
        }
        return acc;
      }, []);
      
      console.log(`📦 Endereçamentos carregados: ${endereçamentosUnicos.length} únicos (${endData.length} total do banco)`);
      setEnderecamentos(endereçamentosUnicos);
      
      // Buscar notas e volumes relacionados aos endereçamentos únicos
      const notasIds = [...new Set(endereçamentosUnicos.map(e => e.nota_fiscal_id).filter(Boolean))];
      const volumesIds = [...new Set(endereçamentosUnicos.map(e => e.volume_id).filter(Boolean))];
      
      if (notasIds.length > 0) {
        const notasDB = await base44.entities.NotaFiscal.filter({ id: { $in: notasIds } });
        const notasIdsExistentes = notasFiscaisLocal.map(n => n.id);
        const notasNovas = notasDB.filter(n => !notasIdsExistentes.includes(n.id));
        
        if (notasNovas.length > 0) {
          setNotasFiscaisLocal(prev => [...prev, ...notasNovas]);
        }
      }
      
      if (volumesIds.length > 0) {
        const volumesDB = await base44.entities.Volume.filter({ id: { $in: volumesIds } });
        const volumesIdsExistentes = volumesLocal.map(v => v.id);
        const volumesNovos = volumesDB.filter(v => !volumesIdsExistentes.includes(v.id));
        
        if (volumesNovos.length > 0) {
          setVolumesLocal(prev => [...prev, ...volumesNovos]);
        }
      }
    } catch (error) {
      console.error("Erro ao carregar endereçamentos:", error);
    } finally {
      setLoading(false);
    }
  };

  // Helper para pegar apenas endereçamentos da ordem atual
  const getEnderecamentosOrdemAtual = () => {
    return enderecamentos.filter(e => e.ordem_id === ordem.id);
  };

  const getVolumesNaoEnderecados = () => {
    const idsEnderecados = getEnderecamentosOrdemAtual().map(e => e.volume_id);
    return volumesLocal.filter(v => 
      notasFiscaisLocal.some(nf => nf.id === v.nota_fiscal_id) &&
      !idsEnderecados.includes(v.id)
    );
  };

  const getVolumesNaCelula = (linha, coluna) => {
    const endsNaCelula = getEnderecamentosOrdemAtual().filter(e => 
      e.linha === linha && e.coluna === coluna
    );
    return endsNaCelula.map(e => volumesLocal.find(v => v.id === e.volume_id)).filter(Boolean);
  };

  const getNotasFiscaisNaCelula = (linha, coluna) => {
    const volumesNaCelula = getVolumesNaCelula(linha, coluna);
    const notasIds = [...new Set(volumesNaCelula.map(v => v.nota_fiscal_id))];
    return notasFiscaisLocal.filter(nf => notasIds.includes(nf.id));
  };

  const handleToggleVolume = (volumeId) => {
    setVolumesSelecionados(prev =>
      prev.includes(volumeId)
        ? prev.filter(id => id !== volumeId)
        : [...prev, volumeId]
    );
  };

  const handleAlocarNaCelula = async (linha, coluna) => {
    if (volumesSelecionados.length === 0) {
      toast.error("Selecione ao menos um volume");
      return;
    }

    try {
      const user = await base44.auth.me();

      // CRÍTICO: Verificar se volumes já estão endereçados antes de criar
      const endereçamentosExistentes = await base44.entities.EnderecamentoVolume.filter({
        ordem_id: ordem.id,
        volume_id: { $in: volumesSelecionados }
      });

      const volumesJaEnderecados = endereçamentosExistentes.map(e => e.volume_id);
      const volumesParaEnderecear = volumesSelecionados.filter(id => !volumesJaEnderecados.includes(id));

      if (volumesParaEnderecear.length === 0) {
        toast.warning("Todos os volumes selecionados já foram endereçados");
        setVolumesSelecionados([]);
        return;
      }

      if (volumesJaEnderecados.length > 0) {
        toast.info(`${volumesJaEnderecados.length} volume(s) já endereçado(s), alocando ${volumesParaEnderecear.length}`);
      }

      for (const volumeId of volumesParaEnderecear) {
        const volume = volumesLocal.find(v => v.id === volumeId);
        if (!volume) continue;

        // Endereçar = conferir automaticamente
        await base44.entities.Volume.update(volumeId, {
          status_volume: "carregado",
          localizacao_atual: `Ordem ${ordem.numero_carga || ordem.id.slice(-6)} - ${linha}-${coluna}`
        });

        await base44.entities.EnderecamentoVolume.create({
          ordem_id: ordem.id,
          volume_id: volumeId,
          nota_fiscal_id: volume.nota_fiscal_id,
          linha: linha,
          coluna: coluna,
          posicao_celula: `${linha}-${coluna}`,
          data_enderecamento: new Date().toISOString(),
          enderecado_por: user.id
        });
      }

      // Recarregar endereçamentos do banco para sincronizar (evitar estado inconsistente)
      const todosEnderecamentos = await base44.entities.EnderecamentoVolume.filter({ ordem_id: ordem.id });
      setEnderecamentos(todosEnderecamentos);
      
      setVolumesSelecionados([]);
      setShowBuscaModal(false);
      setCelulaAtiva(null);
      
      toast.success(`${volumesParaEnderecear.length} volume(s) alocado(s)!`);
      
      // Salvar rascunho de forma assíncrona
      salvarRascunho();
    } catch (error) {
      console.error("Erro ao alocar volumes:", error);
      toast.error("Erro ao alocar volumes");
    }
  };

  const handleClickCelula = (linha, coluna) => {
    if (isMobile) {
      setCelulaAtiva({ linha, coluna });
      setShowBuscaModal(true);
      setVolumesSelecionados([]);
      setSearchTerm("");
      setSearchChaveNF("");
      setFiltroTipo("volume");
    } else {
      handleAlocarNaCelula(linha, coluna);
    }
  };

  const handleRemoverNotaDaCelula = async (linha, coluna, notaId) => {
    try {
      const endsParaRemover = getEnderecamentosOrdemAtual().filter(e =>
        e.linha === linha && e.coluna === coluna && e.nota_fiscal_id === notaId
      );

      for (const end of endsParaRemover) {
        await base44.entities.EnderecamentoVolume.delete(end.id);
      }

      const enderecamentosAtualizados = getEnderecamentosOrdemAtual().filter(e =>
        !(e.linha === linha && e.coluna === coluna && e.nota_fiscal_id === notaId)
      );
      setEnderecamentos(enderecamentosAtualizados);

      toast.success("Nota fiscal removida da célula!");
      
      // Salvar rascunho de forma assíncrona
      salvarRascunho();
    } catch (error) {
      console.error("Erro ao remover:", error);
      toast.error("Erro ao remover da célula");
    }
  };

  const handlePesquisarChaveNF = async (chaveNF) => {
    const chave = chaveNF || searchChaveNF;
    
    if (!chave || chave.length !== 44) {
      return;
    }

    if (processandoChave) return;

    setProcessandoChave(true);
    let feedbackDado = false;

    try {
      // 1. Tentar buscar nota localmente primeiro (se já estiver na lista da ordem)
      const notaLocal = notasFiscaisLocal.find(nf => nf.chave_nota_fiscal === chave);
      
      if (notaLocal) {
        // Já está na lista local = já vinculada
        const volumesNota = volumesLocal.filter(v => v.nota_fiscal_id === notaLocal.id);
        const volumesNaoEnderecados = volumesNota.filter(v => {
          const idsEnderecados = enderecamentos.map(e => e.volume_id);
          return !idsEnderecados.includes(v.id);
        });
        
        setVolumesSelecionados(volumesNaoEnderecados.map(v => v.id));
        setSearchTerm("");
        
        try { playErrorBeep(); } catch (e) {} // Beep diferente para alertar que já existe
        toast.info(`⚠️ Nota ${notaLocal.numero_nota} JÁ VINCULADA! Volumes selecionados.`);
        
        setSearchChaveNF("");
        setNotasBaseBusca("");
        feedbackDado = true;
        return;
      }

      // 2. Buscar nota no banco de dados
      const notasExistentes = await base44.entities.NotaFiscal.filter({ chave_nota_fiscal: chave });
      
      if (notasExistentes.length > 0) {
        const notaExistente = notasExistentes[0];
        
        // Proteção extra contra duplicidade no estado local
        setNotasFiscaisLocal(prev => {
          if (prev.some(n => n.id === notaExistente.id)) return prev;
          
          // Se não existir, prosseguir com a vinculação
          (async () => {
            await base44.entities.NotaFiscal.update(notaExistente.id, {
              ordem_id: ordem.id,
              status_nf: "aguardando_expedicao"
            });

            // Atualizar ordem
            const notasIds = [...(ordem.notas_fiscais_ids || []).filter(id => id !== notaExistente.id), notaExistente.id];
            await base44.entities.OrdemDeCarregamento.update(ordem.id, {
              notas_fiscais_ids: notasIds
            });
          })();

          return [...prev, notaExistente];
        });

        // Buscar volumes
        const volumesNota = await base44.entities.Volume.filter({ nota_fiscal_id: notaExistente.id });
        setVolumesLocal(prev => {
          // Filtrar volumes que já existem para não duplicar
          const novos = volumesNota.filter(v => !prev.some(p => p.id === v.id));
          return [...prev, ...novos];
        });
        
        setNotasOrigem(prev => ({ ...prev, [notaExistente.id]: "Adicionada" }));
        
        try { playSuccessBeep(); } catch (e) {}
        toast.success(`✅ Nota fiscal ${notaExistente.numero_nota} VINCULADA com sucesso!`);
        
        setSearchChaveNF("");
        setNotasBaseBusca("");
        feedbackDado = true;
        
        setTimeout(() => salvarRascunho(), 100);
        return;
      }

      // 3. Nota não existe - Importar via API
      toast.info("🔍 Buscando na SEFAZ...", { duration: 2000 });
      
      const response = await base44.functions.invoke('buscarNotaFiscalMeuDanfe', {
        chaveAcesso: chave
      });

      if (response.data.error) {
        throw new Error(response.data.error);
      }

      if (!response.data.xml) {
        throw new Error("XML não retornado pela API");
      }

      // Parse do XML
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(response.data.xml, "text/xml");
      
      const getNFeValue = (tag) => {
        const element = xmlDoc.getElementsByTagName(tag)[0];
        return element ? element.textContent : null;
      };
      
      const numeroNota = getNFeValue('nNF') || '';

      // Dados básicos
      const emitElements = xmlDoc.getElementsByTagName('emit')[0];
      const destElements = xmlDoc.getElementsByTagName('dest')[0];
      const volElements = xmlDoc.getElementsByTagName('vol')[0];
      
      // Valores
      const quantidadeVolumes = parseInt(volElements?.getElementsByTagName('qVol')[0]?.textContent || '1');
      const pesoLiquido = parseFloat(volElements?.getElementsByTagName('pesoL')[0]?.textContent || '0');
      const pesoBruto = parseFloat(volElements?.getElementsByTagName('pesoB')[0]?.textContent || '0');
      const valorNF = parseFloat(getNFeValue('vNF') || '0');

      // Criar nota fiscal
      const novaNF = await base44.entities.NotaFiscal.create({
        ordem_id: ordem.id,
        chave_nota_fiscal: chave,
        numero_nota: numeroNota,
        serie_nota: getNFeValue('serie') || '',
        data_hora_emissao: getNFeValue('dhEmi') || new Date().toISOString(),
        natureza_operacao: getNFeValue('natOp') || '',
        emitente_cnpj: emitElements?.getElementsByTagName('CNPJ')[0]?.textContent || '',
        emitente_razao_social: emitElements?.getElementsByTagName('xNome')[0]?.textContent || '',
        destinatario_cnpj: destElements?.getElementsByTagName('CNPJ')[0]?.textContent || '',
        destinatario_razao_social: destElements?.getElementsByTagName('xNome')[0]?.textContent || '',
        destinatario_cidade: destElements?.getElementsByTagName('xMun')[0]?.textContent || '',
        destinatario_uf: destElements?.getElementsByTagName('UF')[0]?.textContent || '',
        valor_nota_fiscal: valorNF,
        xml_content: response.data.xml,
        status_nf: "aguardando_expedicao",
        peso_total_nf: pesoBruto > 0 ? pesoBruto : pesoLiquido,
        quantidade_total_volumes_nf: quantidadeVolumes,
        numero_area: "manual"
      });

      // Criar volumes
      const volumesCriados = [];
      const pesoMedioPorVolume = (pesoBruto > 0 ? pesoBruto : pesoLiquido) / quantidadeVolumes;
      
      for (let i = 1; i <= quantidadeVolumes; i++) {
        const identificadorVolume = `${numeroNota}-${String(i).padStart(2, '0')}`;
        
        const novoVolume = await base44.entities.Volume.create({
          nota_fiscal_id: novaNF.id,
          ordem_id: ordem.id,
          identificador_unico: identificadorVolume,
          numero_sequencial: i,
          peso_volume: pesoMedioPorVolume,
          quantidade: 1,
          status_volume: "criado"
        });
        
        volumesCriados.push(novoVolume);
      }

      // Vincular à ordem
      const notasIds = [...(ordem.notas_fiscais_ids || []), novaNF.id];
      await base44.entities.OrdemDeCarregamento.update(ordem.id, {
        notas_fiscais_ids: notasIds
      });

      // Atualizar estado com proteção contra duplicidade
      setNotasFiscaisLocal(prev => {
        if (prev.some(n => n.id === novaNF.id)) return prev;
        return [...prev, novaNF];
      });
      
      setVolumesLocal(prev => [...prev, ...volumesCriados]);
      setNotasOrigem(prev => ({ ...prev, [novaNF.id]: "Importada" }));
      
      try { playSuccessBeep(); } catch (e) {}
      toast.success(`✅ Nota fiscal ${numeroNota} IMPORTADA e vinculada!`);
      
      setSearchChaveNF("");
      setNotasBaseBusca("");
      feedbackDado = true;
      
      setTimeout(() => salvarRascunho(), 100);

    } catch (error) {
      console.error("Erro ao processar chave NF:", error);
      try { playErrorBeep(); } catch (e) {}
      toast.error(`❌ Erro: ${error.message || 'Falha ao processar nota'}`);
      setSearchChaveNF("");
      setNotasBaseBusca("");
    } finally {
      setProcessandoChave(false);
      // Focar novamente no input apropriado
      setTimeout(() => {
        if (inputChaveRef.current) {
          inputChaveRef.current.focus();
        }
      }, 100);
    }
  };

  // Auto-processar quando chave completa (44 dígitos)
  useEffect(() => {
    if (searchChaveNF.length === 44 && !processandoChave) {
      handlePesquisarChaveNF(searchChaveNF);
    }
  }, [searchChaveNF]);

  // Auto-processar chave quando no modo Base (44 dígitos)
  useEffect(() => {
    if (usarBase && filtroTipo === "nota_fiscal" && !processandoChave) {
      const valor = notasBaseBusca.trim().replace(/\D/g, '');
      if (valor.length === 44) {
        handlePesquisarChaveNF(valor);
        setNotasBaseBusca("");
      }
    }
  }, [notasBaseBusca, usarBase, filtroTipo]);

  const toggleNotaExpandida = (notaId, linha, coluna) => {
    const key = `${notaId}-${linha}-${coluna}`;
    setNotasExpandidas(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleConfirmarMovimentacao = async () => {
    if (!movimentacaoNota) return;

    const quantidade = parseInt(quantidadeMovimentar) || movimentacaoNota.totalVolumes;
    
    if (quantidade <= 0 || quantidade > movimentacaoNota.totalVolumes) {
      toast.error(`Quantidade inválida. Máximo: ${movimentacaoNota.totalVolumes}`);
      return;
    }

    const { notaId, linhaOrigem, colunaOrigem, linhaDestino, colunaDestino, endsParaMover, volumesDisponiveis } = movimentacaoNota;
    
    // Se vem da sidebar (volumesDisponiveis), criar novos endereçamentos
    if (volumesDisponiveis) {
      const volumesParaAlocar = volumesDisponiveis.slice(0, quantidade);
      
      const user = await base44.auth.me();
      const novosEnderecamentos = [];
      
      // Feedback visual imediato
      toast.loading(`Alocando ${quantidade} volume(s)...`, { id: 'alocando' });

      try {
        setSaving(true);

        // VERIFICAR duplicatas ANTES de criar
        const endereçamentosExistentes = await base44.entities.EnderecamentoVolume.filter({
          ordem_id: ordem.id,
          volume_id: { $in: volumesParaAlocar.map(v => v.id) }
        });

        const volumesJaEnderecadosIds = endereçamentosExistentes.map(e => e.volume_id);
        const volumesParaEnderecearFinal = volumesParaAlocar.filter(v => !volumesJaEnderecadosIds.includes(v.id));

        if (volumesParaEnderecearFinal.length === 0) {
          toast.warning("Todos os volumes selecionados já foram endereçados", { id: 'alocando' });
          setSaving(false);
          setShowQuantidadeModal(false);
          setMovimentacaoNota(null);
          setQuantidadeMovimentar("");
          return;
        }

        // Criar endereçamentos um por um com pequeno delay para animação
        for (let i = 0; i < volumesParaEnderecearFinal.length; i++) {
          const volume = volumesParaEnderecearFinal[i];

          await base44.entities.Volume.update(volume.id, {
            status_volume: "carregado",
            localizacao_atual: `Ordem ${ordem.numero_carga || ordem.id.slice(-6)} - ${linhaDestino}-${colunaDestino}`
          });

          const enderecamento = await base44.entities.EnderecamentoVolume.create({
            ordem_id: ordem.id,
            volume_id: volume.id,
            nota_fiscal_id: notaId,
            linha: linhaDestino,
            coluna: colunaDestino,
            posicao_celula: `${linhaDestino}-${colunaDestino}`,
            data_enderecamento: new Date().toISOString(),
            enderecado_por: user.id
          });

          novosEnderecamentos.push(enderecamento);

          // Pequeno delay para animação suave
          if (i < volumesParaEnderecearFinal.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 120));
          }
        }

        // Recarregar apenas endereçamentos desta ordem
        const todosEnderecamentos = await base44.entities.EnderecamentoVolume.filter({ ordem_id: ordem.id });

        // Remover duplicatas (manter apenas o mais recente por volume_id)
        const endereçamentosUnicos = todosEnderecamentos.reduce((acc, end) => {
          const existente = acc.find(e => e.volume_id === end.volume_id);
          if (!existente) {
            acc.push(end);
          } else {
            const dataExistente = new Date(existente.data_enderecamento || existente.created_date);
            const dataAtual = new Date(end.data_enderecamento || end.created_date);
            if (dataAtual > dataExistente) {
              const index = acc.findIndex(e => e.volume_id === end.volume_id);
              acc[index] = end;
            }
          }
          return acc;
        }, []);

        setEnderecamentos(endereçamentosUnicos);

        toast.success(`${volumesParaEnderecearFinal.length} volume(s) alocado(s)!`, { id: 'alocando' });
        
        // Salvar rascunho automaticamente
        setTimeout(() => salvarRascunho(), 100);
        
        // Fechar modal após concluir
        setShowQuantidadeModal(false);
        setMovimentacaoNota(null);
        setQuantidadeMovimentar("");
        setSaving(false);
      } catch (error) {
        console.error("Erro ao alocar volumes:", error);
        toast.error("Erro ao alocar volumes");
      }
      return;
    }
    
    // Selecionar apenas a quantidade escolhida
    const endsParaMoverSelecionados = endsParaMover.slice(0, quantidade);
    
    const user = await base44.auth.me();

    try {
      setSaving(true);
      
      // Mover volumes um por um com atualização progressiva do estado
      for (let i = 0; i < endsParaMoverSelecionados.length; i++) {
        const end = endsParaMoverSelecionados[i];
        
        // Deletar endereçamento antigo
        await base44.entities.EnderecamentoVolume.delete(end.id);
        
        // Atualizar localização do volume
        await base44.entities.Volume.update(end.volume_id, {
          localizacao_atual: `Ordem ${ordem.numero_carga || ordem.id.slice(-6)} - ${linhaDestino}-${colunaDestino}`
        });

        // Criar novo endereçamento
        await base44.entities.EnderecamentoVolume.create({
          ordem_id: ordem.id,
          volume_id: end.volume_id,
          nota_fiscal_id: notaId,
          linha: linhaDestino,
          coluna: colunaDestino,
          posicao_celula: `${linhaDestino}-${colunaDestino}`,
          data_enderecamento: new Date().toISOString(),
          enderecado_por: user.id
        });

        // Pequeno delay para animação suave
        if (i < endsParaMoverSelecionados.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 120));
        }
      }

      // Recarregar apenas endereçamentos desta ordem
      const todosEnderecamentos = await base44.entities.EnderecamentoVolume.filter({ ordem_id: ordem.id });
      
      // Remover duplicatas (manter apenas o mais recente por volume_id)
      const endereçamentosUnicos = todosEnderecamentos.reduce((acc, end) => {
        const existente = acc.find(e => e.volume_id === end.volume_id);
        if (!existente) {
          acc.push(end);
        } else {
          const dataExistente = new Date(existente.data_enderecamento || existente.created_date);
          const dataAtual = new Date(end.data_enderecamento || end.created_date);
          if (dataAtual > dataExistente) {
            const index = acc.findIndex(e => e.volume_id === end.volume_id);
            acc[index] = end;
          }
        }
        return acc;
      }, []);
      
      setEnderecamentos(endereçamentosUnicos);

      toast.success(`${quantidade} volume(s) movido(s)!`);
      
      // Salvar rascunho automaticamente
      setTimeout(() => salvarRascunho(), 100);
      
      // Fechar modal após concluir
      setShowQuantidadeModal(false);
      setMovimentacaoNota(null);
      setQuantidadeMovimentar("");
      setSaving(false);
    } catch (error) {
      console.error("Erro ao mover volumes:", error);
      // Reverter em caso de erro
      setEnderecamentos(enderecamentos);
      toast.error("Erro ao mover volumes");
    }
  };

  const handleDesvincularNota = async (nota) => {
    if (!confirm(`Desvincular NF ${nota.numero_nota} e todos os seus volumes?`)) return;
    
    try {
      const volumesNota = volumesLocal.filter(v => v.nota_fiscal_id === nota.id);
      
      // Remover endereçamentos dos volumes desta nota (apenas da ordem atual)
      const volumesNotaIds = volumesNota.map(v => v.id);
      const enderecamentosRemover = getEnderecamentosOrdemAtual().filter(e => volumesNotaIds.includes(e.volume_id));

      for (const end of enderecamentosRemover) {
        await base44.entities.EnderecamentoVolume.delete(end.id);
      }

      // Remover nota da ordem
      const notasIds = (ordem.notas_fiscais_ids || []).filter(id => id !== nota.id);
      await base44.entities.OrdemDeCarregamento.update(ordem.id, {
        notas_fiscais_ids: notasIds
      });

      // Atualizar status da nota para disponível/recebida
      await base44.entities.NotaFiscal.update(nota.id, {
        ordem_id: null,
        status_nf: "recebida" 
      });

      // Recarregar apenas endereçamentos desta ordem
      const todosEnderecamentos = await base44.entities.EnderecamentoVolume.filter({ ordem_id: ordem.id });
      setEnderecamentos(todosEnderecamentos);

      // Atualizar estados locais
      setNotasFiscaisLocal(prev => prev.filter(nf => nf.id !== nota.id));
      setVolumesLocal(prev => prev.filter(v => v.nota_fiscal_id !== nota.id));

      toast.success(`NF ${nota.numero_nota} desvinculada!`);
      
      // Tentar salvar rascunho após atualização do estado
      setTimeout(() => {
        try {
          const rascunho = {
            enderecamentos: todosEnderecamentos,
            notas: notasFiscaisLocal.filter(nf => nf.id !== nota.id),
            volumes: volumesLocal.filter(v => v.nota_fiscal_id !== nota.id),
            notasOrigem: notasOrigem,
            timestamp: new Date().toISOString()
          };
          localStorage.setItem(`enderecamento_rascunho_${ordem.id}`, JSON.stringify(rascunho));
        } catch (e) { console.error("Erro ao salvar rascunho auto", e); }
      }, 500);

    } catch (error) {
      console.error("Erro ao desvincular nota:", error);
      toast.error("Erro ao desvincular nota");
    }
  };

  const handleDragEnd = async (result) => {
    if (!result.destination) return;

    const { source, destination } = result;

    const draggableId = result.draggableId;
    
    // Verificar se é uma nota da SIDEBAR sendo arrastada
    if (draggableId.startsWith("nota-sidebar-")) {
      const notaId = draggableId.replace("nota-sidebar-", "").replace("mobile-", "");
      
      // Só pode soltar em células
      if (destination.droppableId.startsWith("cell-")) {
        const [__, linhaDestino, colunaDestino] = destination.droppableId.split("-");
        
        // Buscar volumes não endereçados desta nota
        const volumesNota = volumesLocal.filter(v => v.nota_fiscal_id === notaId);
        const idsEnderecados = getEnderecamentosOrdemAtual().map(e => e.volume_id);
        const volumesDisponiveis = volumesNota.filter(v => !idsEnderecados.includes(v.id));
        
        if (volumesDisponiveis.length === 0) {
          toast.warning("Todos os volumes desta nota já foram endereçados");
          return;
        }
        
        // Abrir modal para perguntar quantidade
        setMovimentacaoNota({
          notaId,
          linhaOrigem: null,
          colunaOrigem: null,
          linhaDestino: parseInt(linhaDestino),
          colunaDestino,
          totalVolumes: volumesDisponiveis.length,
          volumesDisponiveis
        });
        setQuantidadeMovimentar(volumesDisponiveis.length.toString());
        setShowQuantidadeModal(true);
      }
      return;
    }
    
    // Verificar se é uma nota completa sendo arrastada de uma CÉLULA
    if (draggableId.startsWith("nota-")) {
      const [_, notaId, linhaOrigem, colunaOrigem] = draggableId.split("-");
      
      // Se soltar na lista de volumes, DESALOCAR todos os volumes da nota
      if (destination.droppableId === "volumes-list" || destination.droppableId === "volumes-list-mobile") {
        const endsParaRemover = getEnderecamentosOrdemAtual().filter(e =>
          e.linha === parseInt(linhaOrigem) && e.coluna === colunaOrigem && e.nota_fiscal_id === notaId
        );

        if (endsParaRemover.length > 0) {
          // Atualização otimista
          const enderecamentosAtualizados = getEnderecamentosOrdemAtual().filter(e =>
            !(e.linha === parseInt(linhaOrigem) && e.coluna === colunaOrigem && e.nota_fiscal_id === notaId)
          );
          setEnderecamentos(enderecamentosAtualizados);

          try {
            for (const end of endsParaRemover) {
              await base44.entities.EnderecamentoVolume.delete(end.id);
              await base44.entities.Volume.update(end.volume_id, {
                status_volume: "criado",
                localizacao_atual: null
              });
            }

            // Recarregar apenas endereçamentos desta ordem
            const todosEnderecamentos = await base44.entities.EnderecamentoVolume.filter({ ordem_id: ordem.id });
            setEnderecamentos(todosEnderecamentos);

            toast.success(`Nota fiscal desalocada! ${endsParaRemover.length} volumes removidos.`);
            
            // Salvar rascunho de forma assíncrona
            salvarRascunho();
          } catch (error) {
            console.error("Erro ao desalocar nota:", error);
            // Reverter em caso de erro
            await loadEnderecamentos();
            toast.error("Erro ao desalocar nota");
          }
        }
        return;
      }

      // Se soltar em outra célula, PERGUNTAR quantos volumes mover
      if (destination.droppableId.startsWith("cell-")) {
        const [__, linhaDestino, colunaDestino] = destination.droppableId.split("-");
        
        const endsParaMover = getEnderecamentosOrdemAtual().filter(e =>
          e.linha === parseInt(linhaOrigem) && e.coluna === colunaOrigem && e.nota_fiscal_id === notaId
        );

        if (endsParaMover.length > 0) {
          // Abrir modal para perguntar quantidade
          setMovimentacaoNota({
            notaId,
            linhaOrigem: parseInt(linhaOrigem),
            colunaOrigem,
            linhaDestino: parseInt(linhaDestino),
            colunaDestino,
            totalVolumes: endsParaMover.length,
            endsParaMover
          });
          setQuantidadeMovimentar(endsParaMover.length.toString());
          setShowQuantidadeModal(true);
        }
        return;
      }
    }
    
    const volumeId = draggableId.startsWith("allocated-") ? draggableId.replace("allocated-", "") : draggableId;

    // Se soltar na lista de volumes, DESALOCAR
    if (destination.droppableId === "volumes-list" || destination.droppableId === "volumes-list-mobile") {
      // Verificar se o volume estava alocado
      const alocacaoExistente = getEnderecamentosOrdemAtual().find(e => e.volume_id === volumeId);
      
      if (alocacaoExistente) {
        try {
          // Remover endereçamento
          await base44.entities.EnderecamentoVolume.delete(alocacaoExistente.id);
          
          // Atualizar status do volume
          await base44.entities.Volume.update(volumeId, {
            status_volume: "criado",
            localizacao_atual: null
          });

          // Recarregar apenas endereçamentos desta ordem
          const todosEnderecamentos = await base44.entities.EnderecamentoVolume.filter({ ordem_id: ordem.id });
          setEnderecamentos(todosEnderecamentos);

          toast.success("Volume desalocado!");
          
          // Salvar rascunho automaticamente
          setTimeout(() => salvarRascunho(), 100);
        } catch (error) {
          console.error("Erro ao desalocar volume:", error);
          await loadEnderecamentos();
          toast.error("Erro ao desalocar volume");
        }
      }
      return;
    }

    // Se soltar em uma célula do layout
    if (destination.droppableId.startsWith("cell-")) {
      const [_, linha, coluna] = destination.droppableId.split("-");

      const volume = volumesLocal.find(v => v.id === volumeId);
      if (!volume) return;

      try {
        const user = await base44.auth.me();

        // CRÍTICO: Buscar TODOS os endereçamentos existentes deste volume nesta ordem
        const enderecamentosExistentes = await base44.entities.EnderecamentoVolume.filter({
          ordem_id: ordem.id,
          volume_id: volumeId
        });

        // Deletar TODOS os endereçamentos antigos (se houver)
        if (enderecamentosExistentes.length > 0) {
          console.log(`🗑️ Removendo ${enderecamentosExistentes.length} endereçamento(s) antigo(s) do volume ${volumeId.slice(-6)}`);
          for (const end of enderecamentosExistentes) {
            await base44.entities.EnderecamentoVolume.delete(end.id);
          }
        }

        // Atualizar localização do volume
        await base44.entities.Volume.update(volumeId, {
          status_volume: "carregado",
          localizacao_atual: `Ordem ${ordem.numero_carga || ordem.id.slice(-6)} - ${linha}-${coluna}`
        });

        // Criar ÚNICO novo endereçamento
        await base44.entities.EnderecamentoVolume.create({
          ordem_id: ordem.id,
          volume_id: volumeId,
          nota_fiscal_id: volume.nota_fiscal_id,
          linha: parseInt(linha),
          coluna: coluna,
          posicao_celula: `${linha}-${coluna}`,
          data_enderecamento: new Date().toISOString(),
          enderecado_por: user.id
        });

        // Recarregar apenas endereçamentos desta ordem e remover duplicatas
        const todosEnderecamentos = await base44.entities.EnderecamentoVolume.filter({ ordem_id: ordem.id });
        
        const endereçamentosUnicos = todosEnderecamentos.reduce((acc, end) => {
          const existente = acc.find(e => e.volume_id === end.volume_id);
          if (!existente) {
            acc.push(end);
          } else {
            const dataExistente = new Date(existente.data_enderecamento || existente.created_date);
            const dataAtual = new Date(end.data_enderecamento || end.created_date);
            if (dataAtual > dataExistente) {
              const index = acc.findIndex(e => e.volume_id === end.volume_id);
              acc[index] = end;
            }
          }
          return acc;
        }, []);
        
        setEnderecamentos(endereçamentosUnicos);

        if (enderecamentosExistentes.length > 0) {
          toast.success("Volume realocado!");
        } else {
          toast.success("Volume posicionado!");
        }
        
        // Salvar rascunho automaticamente
        setTimeout(() => salvarRascunho(), 100);
      } catch (error) {
        console.error("Erro ao posicionar volume:", error);
        toast.error("Erro ao posicionar volume");
        // Recarregar do banco em caso de erro
        await loadEnderecamentos();
      }
    }
  };

  const handleBuscarVolumeOuEtiqueta = async (termo) => {
    if (!termo.trim()) return;

    setProcessandoBusca(true);
    const termoUpper = termo.trim().toUpperCase();

    try {
      // 1. Tentar encontrar como volume
      const volumesEncontrados = await base44.entities.Volume.filter({ identificador_unico: termoUpper });
      
      if (volumesEncontrados.length > 0) {
        const volumeEncontrado = volumesEncontrados[0];
        
        // VALIDAÇÃO: Se flag "Apenas Notas Vinculadas" estiver ativa
        if (apenasNotasVinculadas) {
          const notaVinculada = notasFiscaisLocal.find(nf => nf.id === volumeEncontrado.nota_fiscal_id);
          if (!notaVinculada) {
            toast.error("❌ Volume não pertence a nenhuma nota fiscal vinculada a esta ordem", { duration: 3000 });
            setSearchTerm("");
            setProcessandoBusca(false);
            return;
          }
        }

        // Verificar se já está endereçado
        const jaEnderecado = getEnderecamentosOrdemAtual().some(e => e.volume_id === volumeEncontrado.id);
        if (jaEnderecado) {
          playErrorBeep();
          toast.warning(`⚠️ Volume ${termoUpper} já foi endereçado`, { duration: 2000 });
          setSearchTerm("");
          setProcessandoBusca(false);
          return;
        }

        // Buscar a nota fiscal do volume
        const notaDoVolume = await base44.entities.NotaFiscal.get(volumeEncontrado.nota_fiscal_id);
        const notaJaVinculada = notasFiscaisLocal.some(nf => nf.id === notaDoVolume.id);

        // SEMPRE buscar TODOS os volumes da nota do banco
        const todosVolumesDaNota = await base44.entities.Volume.filter({ nota_fiscal_id: notaDoVolume.id });

        if (!notaJaVinculada) {
          // Vincular a nota à ordem
          await base44.entities.NotaFiscal.update(notaDoVolume.id, {
            ordem_id: ordem.id,
            status_nf: "aguardando_expedicao"
          });

          const notasIds = [...(ordem.notas_fiscais_ids || []), notaDoVolume.id];
          await base44.entities.OrdemDeCarregamento.update(ordem.id, {
            notas_fiscais_ids: notasIds
          });

          setNotasFiscaisLocal([...notasFiscaisLocal, notaDoVolume]);
          setNotasOrigem({ ...notasOrigem, [notaDoVolume.id]: "Auto-vinculada" });

          toast.success(`NF ${notaDoVolume.numero_nota} vinculada! ${todosVolumesDaNota.length} volumes carregados.`);
        }

        // Garantir que TODOS os volumes da nota estão no estado local
        const volumesIdsLocais = volumesLocal.map(v => v.id);
        const volumesParaAdicionar = todosVolumesDaNota.filter(v => !volumesIdsLocais.includes(v.id));

        if (volumesParaAdicionar.length > 0) {
          setVolumesLocal(prev => [...prev, ...volumesParaAdicionar]);
        }

        // Salvar rascunho automaticamente
        setTimeout(() => salvarRascunho(), 100);

        // Selecionar apenas este volume bipado
        setVolumesSelecionados([volumeEncontrado.id]);
        setSearchTerm("");
        playSuccessBeep();
        toast.success(`✅ Volume ${termoUpper} selecionado! (${todosVolumesDaNota.length} vol. disponíveis)`);
        setProcessandoBusca(false);
        return;
      }

      // 2. Se não encontrou como volume, tentar como etiqueta mãe
      const etiquetasEncontradas = await base44.entities.EtiquetaMae.filter({ codigo: termoUpper });
      
      if (etiquetasEncontradas.length > 0) {
        const etiquetaMae = etiquetasEncontradas[0];
        
        if (etiquetaMae.volumes_ids && etiquetaMae.volumes_ids.length > 0) {
          // Buscar volumes do banco de dados
          const volumesDaEtiquetaDB = await base44.entities.Volume.filter({ 
            id: { $in: etiquetaMae.volumes_ids } 
          });

          if (volumesDaEtiquetaDB.length === 0) {
            toast.warning(`Etiqueta ${etiquetaMae.codigo} sem volumes no sistema`);
            setSearchTerm("");
            setProcessandoBusca(false);
            return;
          }

          // Agrupar volumes por nota fiscal e buscar notas únicas
          const notasIdsUnicas = [...new Set(volumesDaEtiquetaDB.map(v => v.nota_fiscal_id).filter(Boolean))];
          
          // VALIDAÇÃO: Se flag "Apenas Notas Vinculadas" estiver ativa
          if (apenasNotasVinculadas) {
            const notasJaVinculadasIds = notasFiscaisLocal.map(nf => nf.id);
            const notasNaoVinculadas = notasIdsUnicas.filter(id => !notasJaVinculadasIds.includes(id));
            
            if (notasNaoVinculadas.length > 0) {
              toast.error("❌ Etiqueta contém volumes de notas não vinculadas a esta ordem", { duration: 3000 });
              setSearchTerm("");
              setProcessandoBusca(false);
              return;
            }
          }

          // Verificar quais volumes ainda não foram endereçados
          const idsEnderecados = enderecamentos.map(e => e.volume_id);
          const volumesNaoEnderecados = volumesDaEtiquetaDB.filter(v => !idsEnderecados.includes(v.id));
          
          if (volumesNaoEnderecados.length === 0) {
            toast.warning(`Todos os volumes da etiqueta ${etiquetaMae.codigo} já foram endereçados`);
            setSearchTerm("");
            setProcessandoBusca(false);
            return;
          }

          const notasParaVincular = notasIdsUnicas.filter(notaId => 
            !notasFiscaisLocal.some(nf => nf.id === notaId)
          );

          if (notasParaVincular.length > 0) {
            // Buscar todas as notas de uma vez
            const notasDB = await base44.entities.NotaFiscal.filter({
              id: { $in: notasParaVincular }
            });

            // Atualizar notas em batch (paralelo)
            const updatePromises = notasDB.map(nota =>
              base44.entities.NotaFiscal.update(nota.id, {
                ordem_id: ordem.id,
                status_nf: "aguardando_expedicao"
              })
            );

            // Atualizar ordem com todas as notas de uma vez
            const notasIds = [...(ordem.notas_fiscais_ids || []), ...notasParaVincular];
            const updateOrdemPromise = base44.entities.OrdemDeCarregamento.update(ordem.id, {
              notas_fiscais_ids: notasIds
            });

            // Aguardar todas as operações em paralelo
            await Promise.all([...updatePromises, updateOrdemPromise]);

            // Atualizar estados de uma vez
            const novasOrigens = {};
            notasDB.forEach(n => {
              novasOrigens[n.id] = "Etiqueta Mãe";
            });

            setNotasFiscaisLocal(prev => [...prev, ...notasDB]);
            setNotasOrigem(prev => ({ ...prev, ...novasOrigens }));

            toast.success(`${notasDB.length} nota(s) vinculada(s)`);
          }

          // Garantir que TODOS os volumes da etiqueta estão no estado local
          const volumesIdsLocais = volumesLocal.map(v => v.id);
          const volumesParaAdicionar = volumesDaEtiquetaDB.filter(v => !volumesIdsLocais.includes(v.id));
          
          if (volumesParaAdicionar.length > 0) {
            setVolumesLocal(prev => [...prev, ...volumesParaAdicionar]);
          }

          // Salvar rascunho automaticamente
          setTimeout(() => salvarRascunho(), 100);

          // Selecionar volumes não endereçados e finalizar
          setVolumesSelecionados(volumesNaoEnderecados.map(v => v.id));
          setSearchTerm("");
          playSuccessBeep();
          toast.success(`✅ ${volumesNaoEnderecados.length} volumes da etiqueta ${etiquetaMae.codigo} selecionados!`);
          setProcessandoBusca(false);
          return;
        } else {
          toast.warning(`Etiqueta ${etiquetaMae.codigo} sem volumes vinculados`);
          setSearchTerm("");
          setProcessandoBusca(false);
          return;
        }
      }

      // Não encontrou nem como volume nem como etiqueta
      playErrorBeep();
      toast.error(`❌ Não encontrado: ${termoUpper}`);
      setSearchTerm("");
    } catch (error) {
      console.error("Erro ao buscar:", error);
      playErrorBeep();
      toast.error("Erro ao processar busca");
      setSearchTerm("");
    } finally {
      setProcessandoBusca(false);
    }
  };

  const handleScanQRCode = async (codigo) => {
    setShowCamera(false);
    await handleBuscarVolumeOuEtiqueta(codigo);
  };

  const handleScanCodigoBarrasNF = async (codigo) => {
    setShowCameraNotaFiscal(false);
    const chave = codigo.trim().replace(/\D/g, '');
    if (chave.length === 44) {
      await handlePesquisarChaveNF(chave);
    } else {
      toast.error("Código de barras inválido. Deve ter 44 dígitos.");
    }
  };

  const handleImprimirListaNotas = async () => {
    try {
      const user = await base44.auth.me();
      let empresa = null;

      if (user.empresa_id) {
        try {
          empresa = await base44.entities.Empresa.get(user.empresa_id);
        } catch (error) {
          console.log("Erro ao buscar empresa:", error);
        }
      }

      const printWindow = window.open('', '_blank');
      const htmlContent = gerarPDFListaNotas(user, empresa);
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      printWindow.print();
    } catch (error) {
      console.error("Erro ao imprimir lista:", error);
      toast.error("Erro ao gerar PDF");
    }
  };

  const gerarPDFListaNotas = (user, empresa) => {
    const dataAtual = new Date().toLocaleString('pt-BR');

    let html = `
      <html>
        <head>
          <title>Lista de Notas Fiscais - ${ordem.numero_carga}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: Arial, sans-serif; padding: 20px; font-size: 11px; }
            .header { text-align: center; margin-bottom: 15px; border-bottom: 3px solid #333; padding-bottom: 10px; }
            .header h1 { font-size: 18px; margin-bottom: 5px; }
            .empresa-info { text-align: center; font-size: 10px; color: #555; margin-bottom: 15px; }
            .ordem-info { margin-bottom: 15px; padding: 8px; background: #f5f5f5; border-radius: 4px; }
            .ordem-info p { margin: 3px 0; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; table-layout: fixed; }
            th { background: #333; color: white; padding: 6px; text-align: left; font-size: 9px; border: 1px solid #333; line-height: 1.2; }
            td { padding: 4px 5px; border: 1px solid #ddd; font-size: 9px; vertical-align: middle; height: 32px; }
            tr { height: 32px; }
            .origem-badge { 
              display: inline-block; 
              padding: 2px 6px; 
              border-radius: 3px; 
              font-size: 8px; 
              font-weight: bold;
            }
            .origem-vinculada { background: #e0f2fe; color: #0369a1; }
            .origem-adicionada { background: #fef3c7; color: #92400e; }
            .origem-importada { background: #dcfce7; color: #166534; }
            .footer { margin-top: 20px; padding-top: 10px; border-top: 1px solid #ddd; font-size: 9px; text-align: center; color: #666; }
            .totais { margin-top: 15px; padding: 10px; background: #f5f5f5; border-radius: 4px; }
            .totais p { margin: 3px 0; font-weight: bold; }
            @media print { body { padding: 15px; } }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Lista de Notas Fiscais do Carregamento</h1>
            <p>Ordem: ${ordem.numero_carga || `#${ordem.id.slice(-6)}`}</p>
          </div>

          ${empresa ? `
            <div class="empresa-info">
              <strong>${empresa.nome_fantasia || empresa.razao_social}</strong><br>
              ${empresa.cnpj ? `CNPJ: ${empresa.cnpj}` : ''} ${empresa.telefone ? `| Tel: ${empresa.telefone}` : ''}
            </div>
          ` : ''}

          <div class="ordem-info">
            <p><strong>Cliente:</strong> ${ordem.cliente || '-'} | <strong>Destino:</strong> ${ordem.destino_cidade || ordem.destino || '-'}</p>
          </div>

          <table>
            <thead>
              <tr>
                <th style="width: 60px;">NF</th>
                <th style="width: 50px;">Origem</th>
                <th style="width: 200px;">Remetente / Origem</th>
                <th style="width: 200px;">Destinatário / Destino</th>
                <th style="width: 70px;">Volumes<br>Total/End.</th>
                <th style="width: 70px;">Peso<br>(kg)</th>
                <th style="width: 80px;">Valor<br>(R$)</th>
              </tr>
            </thead>
            <tbody>
          `;

          let totalVolumes = 0;
          let totalVolumesEnd = 0;
          let totalPeso = 0;
          let totalValor = 0;

          notasFiscaisLocal.forEach(nota => {
          const volumesNota = volumesLocal.filter(v => v.nota_fiscal_id === nota.id);
          const volumesEndNota = enderecamentos.filter(e => e.nota_fiscal_id === nota.id && e.ordem_id === ordem.id);
          const origem = notasOrigem[nota.id] || "Vinculada";

          totalVolumes += volumesNota.length;
          totalVolumesEnd += volumesEndNota.length;
          totalPeso += nota.peso_total_nf || 0;
          totalValor += nota.valor_nota_fiscal || 0;

          const origemClass = origem === "Vinculada" ? "origem-vinculada" : origem === "Adicionada" ? "origem-adicionada" : "origem-importada";

          const remetenteResumo = (nota.emitente_razao_social || '-').substring(0, 30);
          const destinatarioResumo = (nota.destinatario_razao_social || '-').substring(0, 30);

          html += `
          <tr>
          <td><strong>${nota.numero_nota}</strong></td>
          <td><span class="origem-badge ${origemClass}">${origem}</span></td>
          <td>
            <div style="line-height: 1.3;">
              <strong>${remetenteResumo}</strong><br>
              <span style="font-size: 8px; color: #666;">${nota.emitente_cidade || '-'}/${nota.emitente_uf || '-'}</span>
            </div>
          </td>
          <td>
            <div style="line-height: 1.3;">
              <strong>${destinatarioResumo}</strong><br>
              <span style="font-size: 8px; color: #666;">${nota.destinatario_cidade || '-'}/${nota.destinatario_uf || '-'}</span>
            </div>
          </td>
          <td style="text-align: center;"><strong>${volumesEndNota.length}</strong>/${volumesNota.length}</td>
          <td style="text-align: right;">${(nota.peso_total_nf || 0).toLocaleString('pt-BR')}</td>
          <td style="text-align: right;">${(nota.valor_nota_fiscal || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
          </tr>
          `;
          });

    html += `
            </tbody>
          </table>

          <div class="totais">
            <p>Total de Notas: ${notasFiscaisLocal.length}</p>
            <p>Total de Volumes: ${totalVolumesEnd}/${totalVolumes} endereçados</p>
            <p>Peso Total: ${totalPeso.toLocaleString('pt-BR')} kg</p>
            <p>Valor Total: R$ ${totalValor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
          </div>

          <div class="footer">
            <p><strong>Relatório gerado por:</strong> ${user.full_name || user.email} | <strong>Data:</strong> ${dataAtual}</p>
          </div>
        </body>
      </html>
    `;

    return html;
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

  const handleSalvarLayout = async () => {
    if (!datasCarregamento.inicio || !datasCarregamento.fim) {
      toast.error("Preencha as datas de início e fim do carregamento");
      return;
    }

    const volumesNaoEnderecados = getVolumesNaoEnderecados();
    
    if (volumesNaoEnderecados.length > 0) {
      const confirmar = window.confirm(
        `Ainda há ${volumesNaoEnderecados.length} volume(s) não posicionado(s). Deseja salvar mesmo assim?`
      );
      if (!confirmar) return;
    }

    setSaving(true);
    try {
      await base44.entities.OrdemDeCarregamento.update(ordem.id, {
        status: "aguardando_carregamento",
        status_tracking: "carregado",
        inicio_carregamento: new Date(datasCarregamento.inicio).toISOString(),
        fim_carregamento: new Date(datasCarregamento.fim).toISOString(),
        observacoes_internas: `Layout de ${enderecamentos.length} volumes salvo em ${new Date().toLocaleString('pt-BR')}`
      });

      // Atualizar status das notas fiscais
      for (const nota of notasFiscaisLocal) {
        await base44.entities.NotaFiscal.update(nota.id, {
          status_nf: "em_rota_entrega",
          data_saida_para_viagem: new Date(datasCarregamento.fim).toISOString()
        });
      }

      // Limpar rascunho ao finalizar
      localStorage.removeItem(`enderecamento_rascunho_${ordem.id}`);
      
      toast.success("✅ Carregamento finalizado com sucesso!");
      setShowFinalizarModal(false);
      onComplete();
    } catch (error) {
      console.error("Erro ao salvar layout:", error);
      toast.error("Erro ao salvar layout");
    } finally {
      setSaving(false);
    }
  };

  const handleImprimirLayout = async () => {
    try {
      const user = await base44.auth.me();
      let empresa = null;
      let motorista = null;
      let cavalo = null;
      let implementos = [];

      // Buscar dados da empresa
      if (user.empresa_id) {
        try {
          empresa = await base44.entities.Empresa.get(user.empresa_id);
        } catch (error) {
          console.log("Erro ao buscar empresa:", error);
        }
      }

      // Buscar motorista
      if (ordem.motorista_id) {
        try {
          const motoristas = await base44.entities.Motorista.filter({ id: ordem.motorista_id });
          motorista = motoristas[0];
        } catch (error) {
          console.log("Erro ao buscar motorista:", error);
        }
      }

      // Buscar veículos
      if (ordem.cavalo_id) {
        try {
          const veiculos = await base44.entities.Veiculo.filter({ id: ordem.cavalo_id });
          cavalo = veiculos[0];
        } catch (error) {
          console.log("Erro ao buscar cavalo:", error);
        }
      }

      // Buscar implementos
      const implementoIds = [ordem.implemento1_id, ordem.implemento2_id, ordem.implemento3_id].filter(Boolean);
      if (implementoIds.length > 0) {
        try {
          const veiculos = await base44.entities.Veiculo.list();
          implementos = veiculos.filter(v => implementoIds.includes(v.id));
        } catch (error) {
          console.log("Erro ao buscar implementos:", error);
        }
      }

      const printWindow = window.open('', '_blank');
      const htmlContent = tipoImpressao === "resumido" 
        ? gerarHTMLImpressaoResumido(user, empresa, motorista, cavalo, implementos) 
        : gerarHTMLImpressao();
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      printWindow.print();
    } catch (error) {
      console.error("Erro ao preparar impressão:", error);
      toast.error("Erro ao preparar impressão");
    }
  };

  const gerarHTMLImpressaoResumido = (user, empresa, motorista, cavalo, implementos) => {
    const dataAtual = new Date().toLocaleString('pt-BR', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    const placas = [
      cavalo?.placa || ordem.cavalo_placa_temp,
      ...implementos.map(i => i.placa),
      ordem.implemento1_placa_temp,
      ordem.implemento2_placa_temp,
      ordem.implemento3_placa_temp
    ].filter(Boolean).join(' / ');

    const motoristaInfo = motorista?.nome || ordem.motorista_nome_temp || 'Não alocado';

    let html = `
      <html>
        <head>
          <title>Layout de Carregamento - ${ordem.numero_carga}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: Arial, sans-serif; padding: 15px; font-size: 11px; }
            .header { text-align: center; margin-bottom: 12px; border-bottom: 3px solid #333; padding-bottom: 8px; }
            .header h1 { font-size: 20px; margin-bottom: 4px; }
            .header h2 { font-size: 16px; color: #333; }
            .empresa-info { text-align: center; font-size: 10px; color: #555; margin-bottom: 10px; }
            .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 12px; }
            .info-section { border: 1px solid #ddd; padding: 6px; border-radius: 4px; }
            .info-section h3 { font-size: 11px; font-weight: bold; margin-bottom: 4px; border-bottom: 1px solid #ddd; padding-bottom: 2px; }
            .info-line { margin: 2px 0; font-size: 10px; }
            .info-line strong { font-weight: bold; min-width: 80px; display: inline-block; }
            .grid { width: 100%; border-collapse: collapse; margin-top: 10px; table-layout: fixed; }
            .grid-row { display: table-row; }
            .grid-cell { border: 2px solid #333; padding: 6px; vertical-align: top; min-height: 50px; width: ${100 / (layoutConfig.colunas.length + 1)}%; }
            .cell-header { font-weight: bold; background: #e8e8e8; text-align: center; padding: 6px; border: 2px solid #333; font-size: 11px; }
            .linha-header { font-weight: bold; background: #e8e8e8; text-align: center; width: 50px; }
            .nota-item { 
              background: #bfdbfe; 
              color: #1e3a8a; 
              padding: 4px 6px; 
              margin: 2px 0; 
              font-size: 10px; 
              font-weight: 600;
              letter-spacing: 0.3px;
              border-radius: 3px; 
              display: flex; 
              align-items: center; 
              gap: 5px;
              border: 1px solid #93c5fd;
              text-transform: uppercase;
            }
            .nota-num { font-weight: bold; width: 50px; flex-shrink: 0; }
            .nota-forn { flex: 1; text-align: center; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
            .nota-qtd { font-weight: bold; width: 22px; text-align: right; flex-shrink: 0; }
            .footer { margin-top: 12px; padding-top: 8px; border-top: 1px solid #ddd; font-size: 9px; color: #666; text-align: center; }
            @media print { 
              body { padding: 10px; } 
              .info-grid { page-break-inside: avoid; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Layout de Carregamento</h1>
            <h2>Ordem: ${ordem.numero_carga || `#${ordem.id.slice(-6)}`}</h2>
          </div>
          
          ${empresa ? `
            <div class="empresa-info">
              <strong>${empresa.nome_fantasia || empresa.razao_social}</strong><br>
              ${empresa.cnpj ? `CNPJ: ${empresa.cnpj}` : ''} ${empresa.telefone ? `| Tel: ${empresa.telefone}` : ''}
            </div>
          ` : ''}

          <div class="info-grid">
            <div class="info-section">
              <h3>📦 DADOS DA CARGA</h3>
              <div class="info-line"><strong>Cliente:</strong> ${ordem.cliente || '-'}</div>
              <div class="info-line"><strong>Origem:</strong> ${ordem.origem_cidade || ordem.origem || '-'}</div>
              <div class="info-line"><strong>Destino:</strong> ${ordem.destino_cidade || ordem.destino || '-'}</div>
              <div class="info-line"><strong>Produto:</strong> ${ordem.produto || '-'}</div>
            </div>
            
            <div class="info-section">
              <h3>🚛 DADOS DO TRANSPORTE</h3>
              <div class="info-line"><strong>Motorista:</strong> ${motoristaInfo}</div>
              <div class="info-line"><strong>Placas:</strong> ${placas || 'Não alocadas'}</div>
              <div class="info-line"><strong>Tipo Veículo:</strong> ${tipoVeiculo}</div>
              <div class="info-line"><strong>Volumes:</strong> ${volumesLocal.filter(v => notasFiscaisLocal.some(nf => nf.id === v.nota_fiscal_id)).length} total | ${getEnderecamentosOrdemAtual().length} posicionados</div>
            </div>
          </div>

          <table class="grid">
            <tr>
              <td class="cell-header linha-header">Linha</td>
              ${layoutConfig.colunas.map(col => `<td class="cell-header">${col}</td>`).join('')}
            </tr>
    `;

    for (let linha = 1; linha <= numLinhas; linha++) {
      html += `<tr>`;
      html += `<td class="cell-header linha-header">${linha}</td>`;
      
      layoutConfig.colunas.forEach(coluna => {
        const notasNaCelula = getNotasFiscaisNaCelula(linha, coluna);
        html += `<td class="grid-cell">`;
        
        if (notasNaCelula.length === 0) {
          html += `<span style="color: #aaa; font-size: 10px; font-style: italic;">Vazio</span>`;
        } else {
          notasNaCelula.forEach(nota => {
            const volumesNota = getVolumesNaCelula(linha, coluna).filter(v => v.nota_fiscal_id === nota.id);
            const fornecedorAbreviado = (nota.emitente_razao_social?.split(' ').slice(0, 2).join(' ').substring(0, 18) || 'N/A').toUpperCase();
            html += `<div class="nota-item">`;
            html += `<span class="nota-num">${nota.numero_nota}</span>`;
            html += `<span class="nota-forn" title="${nota.emitente_razao_social}">${fornecedorAbreviado}</span>`;
            html += `<span class="nota-qtd">${volumesNota.length}</span>`;
            html += `</div>`;
          });
        }
        
        html += `</td>`;
      });
      
      html += `</tr>`;
    }

    html += `
          </table>

          <div class="footer">
            <p><strong>Layout elaborado por:</strong> ${user.full_name || user.email} | <strong>Data:</strong> ${dataAtual}</p>
            ${empresa ? `<p>${empresa.razao_social}</p>` : ''}
          </div>
        </body>
      </html>
    `;
    
    return html;
  };

  const gerarHTMLImpressao = () => {
    const enderecamentosOrdem = getEnderecamentosOrdemAtual();
    let html = `
      <html>
        <head>
          <title>Layout de Carregamento - ${ordem.numero_carga}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            .header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #333; padding-bottom: 10px; }
            .info { margin-bottom: 20px; }
            .grid { display: table; border-collapse: collapse; width: 100%; margin-top: 20px; table-layout: fixed; }
            .row { display: table-row; }
            .cell { display: table-cell; border: 2px solid #333; padding: 10px; vertical-align: top; min-height: 80px; width: ${100 / (layoutConfig.colunas.length + 1)}%; }
            .cell-header { font-weight: bold; background: #f0f0f0; text-align: center; padding: 5px; }
            .volume-item { background: #e3f2fd; border-left: 3px solid #1976d2; padding: 4px; margin: 2px 0; font-size: 11px; }
            .nota-group { margin-bottom: 8px; }
            .nota-label { font-weight: bold; color: #1976d2; font-size: 10px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Layout de Carregamento</h1>
            <h2>Ordem: ${ordem.numero_carga || ordem.id}</h2>
          </div>
          <div class="info">
            <p><strong>Cliente:</strong> ${ordem.cliente}</p>
            <p><strong>Destino:</strong> ${ordem.destino}</p>
            <p><strong>Tipo de Veículo:</strong> ${tipoVeiculo}</p>
            <p><strong>Total Volumes:</strong> ${volumesLocal.filter(v => notasFiscaisLocal.some(nf => nf.id === v.nota_fiscal_id)).length}</p>
            <p><strong>Volumes Posicionados:</strong> ${enderecamentos.length}</p>
          </div>
          <div class="grid">
            <div class="row">
              <div class="cell cell-header">Linha</div>
              ${layoutConfig.colunas.map(col => `<div class="cell cell-header">${col}</div>`).join('')}
            </div>
    `;

    for (let linha = 1; linha <= numLinhas; linha++) {
      html += `<div class="row">`;
      html += `<div class="cell cell-header">${linha}</div>`;
      
      layoutConfig.colunas.forEach(coluna => {
        const notasNaCelula = getNotasFiscaisNaCelula(linha, coluna);
        html += `<div class="cell">`;
        
        notasNaCelula.forEach(nota => {
          const volumesNota = getVolumesNaCelula(linha, coluna).filter(v => v.nota_fiscal_id === nota.id);
          html += `<div class="nota-group">`;
          html += `<div class="nota-label">NF ${nota.numero_nota} (${volumesNota.length} vol.)</div>`;
          volumesNota.forEach(vol => {
            html += `<div class="volume-item">${vol.identificador_unico}</div>`;
          });
          html += `</div>`;
        });
        
        html += `</div>`;
      });
      
      html += `</div>`;
    }

    html += `
          </div>
        </body>
      </html>
    `;
    
    return html;
  };

  const filteredVolumes = getVolumesNaoEnderecados();

  const progressoEnderecamento = volumesLocal.filter(v => notasFiscaisLocal.some(nf => nf.id === v.nota_fiscal_id)).length > 0
    ? (getEnderecamentosOrdemAtual().length / volumesLocal.filter(v => notasFiscaisLocal.some(nf => nf.id === v.nota_fiscal_id)).length) * 100
    : 0;

  const theme = {
    bg: isDark ? '#0f172a' : '#f9fafb',
    cardBg: isDark ? '#1e293b' : '#ffffff',
    cardBorder: isDark ? '#334155' : '#e5e7eb',
    text: isDark ? '#f1f5f9' : '#111827',
    textMuted: isDark ? '#94a3b8' : '#6b7280',
    inputBg: isDark ? '#1e293b' : '#ffffff',
    inputBorder: isDark ? '#334155' : '#d1d5db',
    cellBg: isDark ? '#1e293b' : '#ffffff',
    cellBorder: isDark ? '#475569' : '#cbd5e1',
  };

  // Renderização Mobile
  if (isMobile) {
    return (
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="fixed inset-0 z-50 flex flex-col" style={{ backgroundColor: theme.bg }}>
          {/* Header Mobile */}
          <div className="border-b p-3" style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onClose}
                  style={{ borderColor: theme.cardBorder, color: theme.text }}
                >
                  <ArrowLeft className="w-4 h-4" />
                </Button>
                <div>
                  <h2 className="text-lg font-bold" style={{ color: theme.text }}>
                    Endereçamento
                  </h2>
                  <p className="text-xs" style={{ color: theme.textMuted }}>
                    {ordem.numero_carga || `#${ordem.id.slice(-6)}`}
                  </p>
                </div>
              </div>
              <Button
                onClick={handleSalvarProgresso}
                disabled={saving}
                size="sm"
                variant="outline"
                style={{ borderColor: theme.cardBorder, color: theme.text }}
              >
                <Save className="w-4 h-4 mr-1" />
                Salvar
              </Button>
              <Button
                onClick={handleAbrirFinalizacao}
                disabled={saving}
                size="sm"
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <CheckCircle className="w-4 h-4 mr-1" />
                Finalizar
              </Button>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <Badge className="bg-blue-600 text-white text-xs">
                {getEnderecamentosOrdemAtual().length}/{volumesLocal.filter(v => notasFiscaisLocal.some(nf => nf.id === v.nota_fiscal_id)).length} vol.
              </Badge>
              <div className="flex-1" />
              <Button
                variant="outline"
                onClick={handleImprimirLayout}
                disabled={getEnderecamentosOrdemAtual().length === 0}
                size="sm"
                className="h-7"
                style={{ borderColor: theme.cardBorder, color: theme.text }}
              >
                <Printer className="w-3 h-3" />
              </Button>
              <Button
                variant="outline"
                onClick={handleImprimirListaNotas}
                size="sm"
                className="h-7"
                style={{ borderColor: theme.cardBorder, color: theme.text }}
              >
                <FileText className="w-3 h-3" />
              </Button>
            </div>
          </div>

          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Tabs Mobile - Volumes / Notas / Layout */}
            <Tabs value={abaAtiva} onValueChange={setAbaAtiva} className="flex-1 flex flex-col">
              <TabsList className="grid w-full grid-cols-3 mx-3 mt-2 h-8">
                <TabsTrigger value="volumes" className="text-xs">
                  <Package className="w-3 h-3 mr-1" />
                  Volumes
                </TabsTrigger>
                <TabsTrigger value="notas" className="text-xs">
                  <FileText className="w-3 h-3 mr-1" />
                  Notas
                </TabsTrigger>
                <TabsTrigger value="layout" className="text-xs">
                  <Grid3x3 className="w-3 h-3 mr-1" />
                  Layout
                </TabsTrigger>
              </TabsList>

              {/* Aba Volumes Mobile */}
              <TabsContent value="volumes" className="flex-1 overflow-hidden mt-0">
                <div className="h-full flex flex-col overflow-hidden" style={{ backgroundColor: theme.cardBg }}>
                  <div className="p-3 border-b space-y-2" style={{ borderColor: theme.cardBorder }}>
                    <h3 className="font-semibold text-xs flex items-center gap-2" style={{ color: theme.text }}>
                      <Package className="w-4 h-4" />
                      Volumes para Carregamento
                    </h3>

                    {/* Botão de Câmera */}
                    <Button
                      onClick={() => setShowCamera(true)}
                      className="bg-blue-600 hover:bg-blue-700 w-full h-9"
                      size="sm"
                    >
                      <Camera className="w-4 h-4 mr-2" />
                      Escanear QR Code
                    </Button>
                    
                    <div className="flex items-center gap-2 p-2 rounded border" style={{ borderColor: theme.cardBorder }}>
                      <Checkbox
                        id="apenas-vinculadas-volumes-mobile"
                        checked={apenasNotasVinculadas}
                        onCheckedChange={(checked) => setApenasNotasVinculadas(checked)}
                      />
                      <label
                        htmlFor="apenas-vinculadas-volumes-mobile"
                        className="text-xs font-medium cursor-pointer flex-1"
                        style={{ color: theme.text }}
                      >
                        Apenas Notas Vinculadas
                      </label>
                      {apenasNotasVinculadas && (
                        <Badge className="bg-blue-600 text-white text-[10px] px-1.5 py-0">
                          Ativo
                        </Badge>
                      )}
                    </div>

                    {/* Campo de Busca */}
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: theme.textMuted }} />
                      <Input
                        placeholder="Digite volume ou etiqueta..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value.toUpperCase())}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && searchTerm.trim()) {
                            handleBuscarVolumeOuEtiqueta(searchTerm);
                          }
                        }}
                        className="pl-10 h-9 text-sm"
                        style={{ backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.text }}
                        disabled={processandoBusca}
                      />
                      {processandoBusca && (
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                          <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                        </div>
                      )}
                    </div>
                    <p className="text-[9px] text-center" style={{ color: theme.textMuted }}>
                      {filteredVolumes.length} volumes disponíveis
                    </p>
                  </div>
              
              <Droppable droppableId="volumes-list-mobile">
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className="flex-1 overflow-y-auto p-3 space-y-2"
                  >
                    {(() => {
                      // Agrupar volumes por nota fiscal
                      const volumesPorNota = {};
                      filteredVolumes.forEach(volume => {
                        const notaId = volume.nota_fiscal_id;
                        if (!volumesPorNota[notaId]) {
                          volumesPorNota[notaId] = [];
                        }
                        volumesPorNota[notaId].push(volume);
                      });

                      return Object.entries(volumesPorNota).map(([notaId, volumes]) => {
                        const nota = notasFiscaisLocal.find(nf => nf.id === notaId);
                        const expandKey = `sidebar-mobile-${notaId}`;
                        const isExpanded = notasExpandidas[expandKey] !== false;
                        
                        return (
                          <div key={notaId} className="border rounded" style={{ borderColor: theme.cardBorder }}>
                            {/* Header da Nota - arrastável */}
                            <Draggable draggableId={`nota-sidebar-mobile-${notaId}`} index={Object.keys(volumesPorNota).indexOf(notaId)}>
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  className="p-2.5 border-b cursor-grab active:cursor-grabbing select-none touch-none"
                                  style={{ 
                                    ...provided.draggableProps.style,
                                    borderColor: theme.cardBorder,
                                    backgroundColor: snapshot.isDragging 
                                      ? (isDark ? '#1e40af' : '#3b82f6')
                                      : (isDark ? '#1e3a8a22' : '#eff6ff'),
                                    userSelect: 'none',
                                    WebkitUserSelect: 'none',
                                    MozUserSelect: 'none',
                                    minHeight: '48px',
                                    opacity: snapshot.isDragging ? 0.95 : 1,
                                    transform: snapshot.isDragging ? `${provided.draggableProps.style?.transform} scale(1.03)` : provided.draggableProps.style?.transform,
                                    transition: snapshot.isDragging ? 'all 0.15s cubic-bezier(0.2, 0, 0, 1)' : 'background-color 0.2s ease, opacity 0.2s ease',
                                    boxShadow: snapshot.isDragging ? '0 10px 20px rgba(0, 0, 0, 0.2)' : 'none',
                                    borderRadius: snapshot.isDragging ? '8px' : '0'
                                  }}
                                >
                                  <div className="flex items-center justify-between">
                                    <div 
                                      className="flex-1 min-w-0 select-none" 
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setNotasExpandidas(prev => ({
                                          ...prev,
                                          [expandKey]: !isExpanded
                                        }));
                                      }}
                                      style={{ 
                                        userSelect: 'none',
                                        WebkitUserSelect: 'none',
                                        MozUserSelect: 'none',
                                        color: snapshot.isDragging ? '#ffffff' : 'inherit'
                                      }}
                                    >
                                      <p className="font-bold text-xs" style={{ color: snapshot.isDragging ? '#ffffff' : theme.text }}>
                                        NF {nota?.numero_nota}
                                      </p>
                                      <p className="text-[10px] truncate" style={{ color: snapshot.isDragging ? '#e0e7ff' : theme.textMuted }}>
                                        {nota?.emitente_razao_social?.substring(0, 15)}
                                      </p>
                                    </div>
                                    <Badge 
                                      className={`${snapshot.isDragging ? 'bg-white/20' : (volumes.length > 0 ? 'bg-orange-600' : 'bg-green-600')} text-white text-[10px] h-5 px-2 select-none`}
                                      style={{ pointerEvents: 'none' }}
                                    >
                                      {volumes.length}/{volumesLocal.filter(v => v.nota_fiscal_id === notaId).length}
                                    </Badge>
                                  </div>
                                </div>
                              )}
                            </Draggable>

                            {/* Lista de Volumes - com expand/collapse */}
                            <AnimatePresence>
                              {isExpanded && (
                                <motion.div
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: "auto" }}
                                  exit={{ opacity: 0, height: 0 }}
                                  transition={{ duration: 0.2, ease: "easeInOut" }}
                                  className="p-1 space-y-0.5 overflow-hidden"
                                >
                                  {volumes.map((volume, index) => {
                                    return (
                                      <Draggable key={volume.id} draggableId={volume.id} index={index}>
                                        {(provided, snapshot) => (
                                          <div
                                            ref={provided.innerRef}
                                            {...provided.draggableProps}
                                            {...provided.dragHandleProps}
                                            className="p-2 border rounded touch-none"
                                            style={{
                                              ...provided.draggableProps.style,
                                              borderColor: snapshot.isDragging ? '#3b82f6' : theme.cardBorder,
                                              backgroundColor: snapshot.isDragging 
                                                ? (isDark ? '#1e40af' : '#3b82f6')
                                                : theme.cardBg,
                                              color: snapshot.isDragging ? '#ffffff' : 'inherit',
                                              opacity: snapshot.isDragging ? 0.95 : 1,
                                              minHeight: '44px',
                                              display: 'flex',
                                              flexDirection: 'column',
                                              justifyContent: 'center',
                                              transform: snapshot.isDragging ? `${provided.draggableProps.style?.transform} scale(1.02)` : provided.draggableProps.style?.transform,
                                              transition: snapshot.isDragging ? 'all 0.15s cubic-bezier(0.2, 0, 0, 1)' : 'background-color 0.2s ease',
                                              boxShadow: snapshot.isDragging ? '0 6px 12px rgba(0, 0, 0, 0.15)' : 'none'
                                            }}
                                          >
                                            <p 
                                              className="font-mono text-[10px] font-bold leading-tight break-all select-none" 
                                              style={{ 
                                                color: snapshot.isDragging ? '#ffffff' : theme.text,
                                                userSelect: 'none',
                                                WebkitUserSelect: 'none',
                                                MozUserSelect: 'none',
                                                pointerEvents: 'none'
                                              }}
                                            >
                                              {volume.identificador_unico}
                                            </p>
                                            <p 
                                              className="text-[8px] leading-tight select-none" 
                                              style={{ 
                                                color: snapshot.isDragging ? '#e0e7ff' : theme.textMuted,
                                                userSelect: 'none',
                                                WebkitUserSelect: 'none',
                                                MozUserSelect: 'none',
                                                pointerEvents: 'none'
                                              }}
                                            >
                                              {volume.peso_volume} kg
                                            </p>
                                          </div>
                                        )}
                                      </Draggable>
                                    );
                                  })}
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        );
                      });
                    })()}
                    {provided.placeholder}
                    
                    {filteredVolumes.length === 0 && (
                      <div className="text-center py-8" style={{ color: theme.textMuted }}>
                        <Package className="w-12 h-12 mx-auto mb-2 opacity-20" />
                        <p className="text-sm">
                          {getVolumesNaoEnderecados().length === 0
                            ? "Todos posicionados!"
                            : "Nenhum volume"}
                        </p>
                      </div>
                    )}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
              </div>
            </TabsContent>

            {/* Aba Lista de Notas Mobile */}
            <TabsContent value="notas" className="flex-1 overflow-hidden mt-0">
                <div className="h-full flex flex-col">
                  <div className="p-3 border-b" style={{ borderColor: theme.cardBorder }}>
                    <h3 className="font-semibold text-xs flex items-center gap-2" style={{ color: theme.text }}>
                      <FileText className="w-4 h-4" />
                      Notas Fiscais ({notasFiscaisLocal.length})
                    </h3>
                  </div>

                  <div className="flex-1 overflow-y-auto p-3">
                    <div className="space-y-2">
                      {(() => {
                        const notasUnicas = notasFiscaisLocal.reduce((acc, nota) => {
                          if (!acc.find(n => n.id === nota.id)) {
                            acc.push(nota);
                          }
                          return acc;
                        }, []);
                        
                        return notasUnicas.map((nota) => {
                          const volumesNota = volumesLocal.filter(v => v.nota_fiscal_id === nota.id);
                          const volumesEndNota = enderecamentos.filter(e => e.nota_fiscal_id === nota.id && e.ordem_id === ordem.id);
                          const origem = notasOrigem[nota.id] || "Vinculada";
                          const origemColor = origem === "Vinculada" ? (isDark ? '#3b82f6' : '#2563eb') : origem === "Adicionada" ? (isDark ? '#f59e0b' : '#d97706') : (isDark ? '#10b981' : '#059669');

                          return (
                            <div
                              key={nota.id}
                              className="p-2 border rounded"
                              style={{ borderColor: theme.cardBorder, backgroundColor: theme.cardBg }}
                            >
                              <div className="flex items-center justify-between gap-2 mb-1">
                                <div className="flex items-center gap-2 min-w-0 flex-1">
                                  <span className="font-bold text-xs whitespace-nowrap" style={{ color: theme.text }}>
                                    NF {nota.numero_nota}
                                  </span>
                                  <Badge
                                    className="text-[8px] h-3.5 px-1.5 flex-shrink-0"
                                    style={{ backgroundColor: origemColor, color: 'white' }}
                                  >
                                    {origem}
                                  </Badge>
                                </div>
                                <Badge className={`${volumesEndNota.length === volumesNota.length ? 'bg-green-600' : 'bg-orange-500'} text-white text-[10px] h-5 px-2`}>
                                  {volumesEndNota.length}/{volumesNota.length}
                                </Badge>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 w-6 p-0 hover:bg-red-50 dark:hover:bg-red-950 ml-1"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDesvincularNota(nota);
                                  }}
                                  title="Desvincular nota fiscal"
                                >
                                  <Trash2 className="w-3.5 h-3.5 text-red-500" />
                                </Button>
                              </div>
                              <p className="text-[10px] truncate mb-1" style={{ color: theme.textMuted }} title={nota.emitente_razao_social}>
                                {nota.emitente_razao_social}
                              </p>
                              <div className="flex items-center justify-between text-[9px]" style={{ color: theme.textMuted }}>
                                <span className="truncate">{nota.destinatario_cidade}/{nota.destinatario_uf}</span>
                                <span className="ml-2 font-semibold whitespace-nowrap">{(nota.peso_total_nf || 0).toLocaleString()} kg</span>
                              </div>
                            </div>
                          );
                        });
                      })()}

                      {notasFiscaisLocal.length === 0 && (
                        <div className="text-center py-8" style={{ color: theme.textMuted }}>
                          <FileText className="w-12 h-12 mx-auto mb-2 opacity-20" />
                          <p className="text-sm">Nenhuma nota vinculada</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Aba Layout Mobile */}
              <TabsContent value="layout" className="flex-1 overflow-hidden mt-0">
                <div className="h-full flex flex-col">
                  <div className="p-3 border-b space-y-2" style={{ borderColor: theme.cardBorder }}>
                    <div className="flex items-center gap-2">
                      <Label className="text-xs whitespace-nowrap" style={{ color: theme.text }}>Linhas:</Label>
                      <Input
                        type="number"
                        value={numLinhas}
                        onChange={(e) => {
                          const val = parseInt(e.target.value) || 1;
                          setNumLinhas(Math.max(1, Math.min(20, val)));
                        }}
                        className="w-16 h-7 text-sm"
                        style={{ backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.text }}
                        min={1}
                        max={20}
                      />
                    </div>
                  </div>

            {/* Grid do Veículo Mobile */}
            <div className="flex-1 overflow-auto p-2">
              <div className="border-2 rounded-lg overflow-hidden" style={{ borderColor: theme.cellBorder }}>
                {/* Cabeçalho */}
                <div className="grid gap-0" style={{ gridTemplateColumns: `50px repeat(${layoutConfig.colunas.length}, minmax(80px, 1fr))` }}>
                  <div className="p-2 font-bold text-center border-b border-r text-xs" style={{ backgroundColor: isDark ? '#334155' : '#f1f5f9', borderColor: theme.cellBorder, color: theme.text }}>
                    Lin
                  </div>
                  {layoutConfig.colunas.map((coluna, idx) => (
                    <div
                      key={coluna}
                      className="p-2 font-bold text-center border-b text-[9px]"
                      style={{
                        backgroundColor: isDark ? '#334155' : '#f1f5f9',
                        borderColor: theme.cellBorder,
                        borderRight: idx < layoutConfig.colunas.length - 1 ? `1px solid ${theme.cellBorder}` : 'none',
                        color: theme.text
                      }}
                    >
                      {coluna.substring(0, 3)}
                    </div>
                  ))}
                </div>

                {/* Linhas do Layout */}
                {Array.from({ length: numLinhas }, (_, i) => i + 1).map((linha) => (
                  <div
                    key={linha}
                    className="grid gap-0"
                    style={{ gridTemplateColumns: `50px repeat(${layoutConfig.colunas.length}, minmax(80px, 1fr))` }}
                  >
                    <div
                      className="p-2 font-bold text-center border-b border-r text-xs"
                      style={{
                        backgroundColor: isDark ? '#334155' : '#f1f5f9',
                        borderColor: theme.cellBorder,
                        color: theme.text
                      }}
                    >
                      {linha}
                    </div>
                    
                    {layoutConfig.colunas.map((coluna, idx) => {
                      const notasNaCelula = getNotasFiscaisNaCelula(linha, coluna);
                      const volumesNaCelula = getVolumesNaCelula(linha, coluna);
                      const temVolumes = volumesNaCelula.length > 0;

                      return (
                        <Droppable key={`${linha}-${coluna}`} droppableId={`cell-${linha}-${coluna}`}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.droppableProps}
                              onClick={() => handleClickCelula(linha, coluna)}
                              className="p-1 border-b min-h-[70px] cursor-pointer active:bg-opacity-70 transition-all relative"
                              style={{
                                backgroundColor: snapshot.isDraggingOver 
                                  ? (isDark ? '#1e40af44' : '#dbeafe') 
                                  : theme.cellBg,
                                borderColor: theme.cellBorder,
                                borderRight: idx < layoutConfig.colunas.length - 1 ? `1px solid ${theme.cellBorder}` : 'none'
                              }}
                            >
                              <div className="space-y-0.5">
                                {notasNaCelula.map((nota, notaIndex) => {
                                  const volumesNota = volumesNaCelula.filter(v => v.nota_fiscal_id === nota.id);
                                  const fornecedorAbreviado = nota.emitente_razao_social
                                    ?.split(' ')
                                    .slice(0, 1)
                                    .join(' ')
                                    .substring(0, 10) || 'N/A';
                                  const expandKey = `${nota.id}-${linha}-${coluna}`;
                                  const isExpanded = notasExpandidas[expandKey];
                                  
                                  return (
                                    <div key={nota.id} className="space-y-0.5">
                                      <Draggable draggableId={`nota-${nota.id}-${linha}-${coluna}`} index={notaIndex}>
                                        {(provided, snapshot) => (
                                          <div
                                            ref={provided.innerRef}
                                            {...provided.draggableProps}
                                            {...provided.dragHandleProps}
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              toggleNotaExpandida(nota.id, linha, coluna);
                                            }}
                                            className="flex items-center justify-between gap-1 px-1.5 py-1 rounded text-[9px] leading-tight group cursor-pointer touch-none"
                                            style={{
                                              ...provided.draggableProps.style,
                                              backgroundColor: snapshot.isDragging 
                                                ? (isDark ? '#1e40af' : '#3b82f6')
                                                : (isDark ? '#1e40af' : '#bfdbfe'),
                                              color: isDark ? '#ffffff' : '#1e3a8a',
                                              opacity: snapshot.isDragging ? 0.9 : 1,
                                              fontWeight: '600',
                                              letterSpacing: '0.3px'
                                            }}
                                          >
                                            <span className="font-bold shrink-0 text-[10px] uppercase">
                                              NF {nota.numero_nota}
                                            </span>
                                            <span className="flex-1 truncate text-center px-0.5 text-[9px] uppercase" title={nota.emitente_razao_social}>
                                              {fornecedorAbreviado}
                                            </span>
                                            <span className="font-bold shrink-0 text-[10px]">
                                              {volumesNota.length}
                                            </span>
                                            <button
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                handleRemoverNotaDaCelula(linha, coluna, nota.id);
                                              }}
                                              className="shrink-0 w-4 h-4 flex items-center justify-center rounded hover:bg-red-500 transition-colors opacity-70 group-hover:opacity-100"
                                              title="Remover"
                                            >
                                              <Trash2 className="w-2.5 h-2.5" />
                                            </button>
                                          </div>
                                        )}
                                      </Draggable>
                                      
                                      {/* Volumes individuais - mostrar apenas quando expandido */}
                                      <AnimatePresence>
                                        {isExpanded && (
                                          <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: "auto" }}
                                            exit={{ opacity: 0, height: 0 }}
                                            transition={{ duration: 0.2, ease: "easeInOut" }}
                                            className="space-y-0.5 overflow-hidden"
                                          >
                                            {volumesNota.map((vol, volIndex) => (
                                              <Draggable key={vol.id} draggableId={`allocated-${vol.id}`} index={volIndex}>
                                                {(provided, snapshot) => (
                                                  <div
                                                    ref={provided.innerRef}
                                                    {...provided.draggableProps}
                                                    {...provided.dragHandleProps}
                                                    className="px-1 py-0.5 rounded text-[8px] leading-tight cursor-move touch-none ml-2"
                                                    style={{
                                                      ...provided.draggableProps.style,
                                                      backgroundColor: snapshot.isDragging 
                                                        ? (isDark ? '#1e40af' : '#3b82f6')
                                                        : (isDark ? '#334155' : '#e2e8f0'),
                                                      color: snapshot.isDragging ? '#ffffff' : theme.text,
                                                      opacity: snapshot.isDragging ? 0.9 : 1
                                                    }}
                                                    title="Arraste para mover"
                                                  >
                                                    <span className="font-mono font-bold text-[8px]">
                                                      {vol.identificador_unico}
                                                    </span>
                                                  </div>
                                                )}
                                              </Draggable>
                                            ))}
                                          </motion.div>
                                        )}
                                      </AnimatePresence>
                                    </div>
                                  );
                                })}
                                

                              </div>

                              {!temVolumes && (
                                <div className="text-center text-xs" style={{ color: theme.textMuted, opacity: 0.5 }}>
                                  {snapshot.isDraggingOver ? "Solte aqui" : "Vazio"}
                                </div>
                              )}
                              {provided.placeholder}
                            </div>
                          )}
                        </Droppable>
                      );
                    })}
                  </div>
                ))}
                </div>
                </div>
                </div>
                </TabsContent>
                </Tabs>
                </div>

                {/* Modal de Busca Mobile */}
          <Dialog open={showBuscaModal} onOpenChange={setShowBuscaModal}>
          <DialogContent className="max-w-md max-h-[90vh] overflow-hidden flex flex-col" style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}>
            <DialogHeader>
              <DialogTitle style={{ color: theme.text }}>
                Posição: {celulaAtiva?.linha}-{celulaAtiva?.coluna}
              </DialogTitle>
            </DialogHeader>
            
            <div className="flex-1 overflow-y-auto space-y-4 py-4">
              {/* Tipo de Filtro */}
              <div>
                <Tabs value={filtroTipo} onValueChange={setFiltroTipo}>
                  <TabsList className="grid w-full grid-cols-2 h-9">
                    <TabsTrigger value="volume" className="text-xs">Volume / Etiq. Mãe</TabsTrigger>
                    <TabsTrigger value="nota_fiscal" className="text-xs">Nota Fiscal</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>

              {/* Campo de Busca Unificado */}
              {filtroTipo === "nota_fiscal" ? (
                <div className="p-2 border rounded" style={{ borderColor: theme.cardBorder, backgroundColor: isDark ? '#1e3a8a22' : '#eff6ff' }}>
                  <div className="flex items-center justify-between mb-2">
                    <Label className="text-xs font-semibold" style={{ color: theme.text }}>
                      Pesquisar Nota Fiscal
                    </Label>
                    <div className="flex items-center gap-1.5">
                      <Checkbox
                        id="usar-base-mobile"
                        checked={usarBase}
                        onCheckedChange={setUsarBase}
                      />
                      <Label htmlFor="usar-base-mobile" className="text-xs cursor-pointer" style={{ color: theme.text }}>
                        Base
                      </Label>
                    </div>
                  </div>
                  
                  {!usarBase ? (
                    <>
                      <Button
                        onClick={() => setShowCameraNotaFiscal(true)}
                        className="bg-blue-600 hover:bg-blue-700 w-full mb-2 h-8"
                        size="sm"
                      >
                        <Camera className="w-3 h-3 mr-2" />
                        Escanear Código de Barras
                      </Button>
                      <Input
                        ref={inputChaveRef}
                        placeholder="Cole ou bipe a chave..."
                        value={searchChaveNF}
                        onChange={(e) => setSearchChaveNF(e.target.value.replace(/\D/g, '').substring(0, 44))}
                        className="h-9 text-sm font-mono"
                        style={{ backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.text }}
                        disabled={processandoChave}
                        autoFocus
                      />
                      {processandoChave && (
                        <div className="flex items-center gap-2 mt-2">
                          <div className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                          <span className="text-xs" style={{ color: theme.text }}>Processando...</span>
                        </div>
                      )}
                      <p className="text-[9px] mt-1" style={{ color: theme.textMuted }}>
                        Cole ou bipe a chave - pesquisa automática
                      </p>
                    </>
                  ) : (
                    <>
                      <div className="relative">
                        <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-3 h-3" style={{ color: theme.textMuted }} />
                        <Input
                          ref={inputChaveRef}
                          placeholder="Número da NF ou chave (44 dígitos)..."
                          value={notasBaseBusca}
                          onChange={(e) => setNotasBaseBusca(e.target.value)}
                          onKeyDown={async (e) => {
                            if (e.key === 'Enter' && notasBaseBusca.trim()) {
                              const valor = notasBaseBusca.trim().replace(/\D/g, '');
                              
                              // Se tiver 44 dígitos, importar diretamente
                              if (valor.length === 44) {
                                setNotasBaseBusca("");
                                await handlePesquisarChaveNF(valor);
                              }
                            }
                          }}
                          className="h-9 text-sm pl-7"
                          style={{ backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.text }}
                          autoFocus
                        />
                      </div>
                      <p className="text-[9px] mt-1" style={{ color: theme.textMuted }}>
                        Digite número ou bipe chave - Enter para importar
                      </p>
                    </>
                  )}
                </div>
              ) : (
                <>
                  {/* Botão de Câmera */}
                  <div className="flex justify-center">
                    <Button
                      onClick={() => setShowCamera(true)}
                      className="bg-blue-600 hover:bg-blue-700 w-full"
                      size="sm"
                    >
                      <Camera className="w-4 h-4 mr-2" />
                      Escanear QR Code
                    </Button>
                  </div>
                  
                  <div className="flex items-center gap-2 p-2 rounded border" style={{ borderColor: theme.cardBorder }}>
                    <Checkbox
                      id="apenas-vinculadas-mobile"
                      checked={apenasNotasVinculadas}
                      onCheckedChange={(checked) => setApenasNotasVinculadas(checked)}
                    />
                    <label
                      htmlFor="apenas-vinculadas-mobile"
                      className="text-xs font-medium cursor-pointer flex-1"
                      style={{ color: theme.text }}
                    >
                      Apenas Notas Vinculadas
                    </label>
                    {apenasNotasVinculadas && (
                      <Badge className="bg-blue-600 text-white text-[10px] px-1.5 py-0">
                        Ativo
                      </Badge>
                    )}
                  </div>

                  {/* Campo de Busca Unificado */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: theme.textMuted }} />
                    <Input
                      placeholder="Digite volume ou etiqueta mãe..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value.toUpperCase())}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && searchTerm.trim()) {
                          handleBuscarVolumeOuEtiqueta(searchTerm);
                        }
                      }}
                      className="pl-10 h-10"
                      style={{ backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.text }}
                      disabled={processandoBusca}
                      autoFocus
                    />
                    {processandoBusca && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                      </div>
                    )}
                  </div>
                  <p className="text-[9px] mt-1 text-center" style={{ color: theme.textMuted }}>
                    Pressione Enter ou escaneie para buscar
                  </p>
                </>
              )}

              {volumesSelecionados.length > 0 && (
                <div className="flex items-center justify-between p-2 border rounded" style={{ borderColor: theme.cardBorder }}>
                  <Badge className="bg-blue-600 text-white">
                    {volumesSelecionados.length} selecionado(s)
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setVolumesSelecionados([])}
                    className="h-7 text-xs"
                    style={{ color: theme.textMuted }}
                  >
                    Limpar
                  </Button>
                </div>
              )}

              {/* Lista de Volumes Filtrados ou Notas da Base */}
              <Droppable droppableId="volumes-list">
                {(provided) => (
                  <div 
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className="space-y-2 max-h-[300px] overflow-y-auto"
                  >
                    {usarBase && filtroTipo === "nota_fiscal" ? (
                  // Exibir notas da base quando modo "Base" ativado
                  <NotasBaseList
                    notasBaseBusca={notasBaseBusca}
                    notasFiscaisLocal={notasFiscaisLocal}
                    volumesLocal={volumesLocal}
                    onSelecionarNota={async (nota) => {
                      // UI OTIMISTA: Atualizar interface IMEDIATAMENTE
                      const jaVinculada = notasFiscaisLocal.some(nf => nf.id === nota.id);
                      
                      if (!jaVinculada) {
                        setNotasFiscaisLocal(prev => [...prev, nota]);
                        setNotasOrigem(prev => ({ ...prev, [nota.id]: "Adicionada" }));
                      }
                      
                      // Já buscar volumes locais
                      let volumesNota = volumesLocal.filter(v => v.nota_fiscal_id === nota.id);
                      const idsEnderecados = getEnderecamentosOrdemAtual().map(e => e.volume_id);
                      const volumesNaoEnderecados = volumesNota.filter(v => !idsEnderecados.includes(v.id));
                      
                      setVolumesSelecionados(volumesNaoEnderecados.map(v => v.id));
                      setNotasBaseBusca("");
                      setAbaAtiva("volumes");
                      toast.success(`✓ ${volumesNaoEnderecados.length || volumesNota.length} vol.`, { duration: 1200 });

                      // Operações de banco em BACKGROUND (não bloqueiam UI)
                      (async () => {
                        try {
                          const volumesNotaDB = await base44.entities.Volume.filter({ nota_fiscal_id: nota.id });
                          const volumesIdsLocais = volumesLocal.map(v => v.id);
                          const volumesNovos = volumesNotaDB.filter(v => !volumesIdsLocais.includes(v.id));

                          if (volumesNovos.length > 0) {
                            setVolumesLocal(prev => [...prev, ...volumesNovos]);
                          }

                          if (!jaVinculada) {
                            const notasIds = [...(ordem.notas_fiscais_ids || []), nota.id];
                            await Promise.all([
                              base44.entities.NotaFiscal.update(nota.id, {
                                ordem_id: ordem.id,
                                status_nf: "aguardando_expedicao"
                              }),
                              base44.entities.OrdemDeCarregamento.update(ordem.id, {
                                notas_fiscais_ids: notasIds
                              })
                            ]);
                          }
                        } catch (error) {
                          console.error("Erro ao vincular nota:", error);
                        }
                      })();
                    }}
                    theme={theme}
                    isDark={isDark}
                  />
                ) : (
                  // Exibir volumes normalmente
                  <>
                    {filteredVolumes.map((volume, index) => {
                      const nota = notasFiscaisLocal.find(nf => nf.id === volume.nota_fiscal_id);
                      const isSelected = volumesSelecionados.includes(volume.id);

                      return (
                        <Draggable key={volume.id} draggableId={volume.id} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              onClick={() => handleToggleVolume(volume.id)}
                              className="p-2 border rounded cursor-pointer hover:shadow-sm transition-all touch-none"
                              style={{
                                ...provided.draggableProps.style,
                                borderColor: isSelected ? '#3b82f6' : theme.cardBorder,
                                backgroundColor: snapshot.isDragging 
                                  ? (isDark ? '#1e40af' : '#3b82f6')
                                  : (isSelected ? (isDark ? '#1e3a8a33' : '#dbeafe33') : 'transparent'),
                                color: snapshot.isDragging ? '#ffffff' : 'inherit',
                                opacity: snapshot.isDragging ? 0.9 : 1,
                                transform: provided.draggableProps.style?.transform || 'none'
                              }}
                            >
                              <div className="flex items-start gap-2">
                                <Checkbox
                                  checked={isSelected}
                                  onCheckedChange={() => handleToggleVolume(volume.id)}
                                  onClick={(e) => e.stopPropagation()}
                                />
                                <div className="flex-1 min-w-0">
                                  <p 
                                    className="font-mono text-xs font-bold truncate" 
                                    style={{ color: snapshot.isDragging ? '#ffffff' : theme.text }}
                                  >
                                    {volume.identificador_unico}
                                  </p>
                                  <p 
                                    className="text-xs truncate" 
                                    style={{ color: snapshot.isDragging ? '#e0e7ff' : theme.textMuted }}
                                  >
                                    NF {nota?.numero_nota}
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      );
                    })}

                    {filteredVolumes.length === 0 && (
                      <div className="text-center py-8" style={{ color: theme.textMuted }}>
                        <Package className="w-12 h-12 mx-auto mb-2 opacity-20" />
                        <p className="text-sm">Nenhum volume encontrado</p>
                      </div>
                    )}
                    {provided.placeholder}
                  </>
                )}
                  </div>
                )}
              </Droppable>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setShowBuscaModal(false);
                  setCelulaAtiva(null);
                  setVolumesSelecionados([]);
                }}
                style={{ borderColor: theme.cardBorder, color: theme.text }}
              >
                Cancelar
              </Button>
              <Button
                onClick={() => handleAlocarNaCelula(celulaAtiva.linha, celulaAtiva.coluna)}
                disabled={volumesSelecionados.length === 0}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Alocar ({volumesSelecionados.length})
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Modal de Câmera Mobile - Volumes */}
        {showCamera && (
          <CameraScanner
            open={showCamera}
            onClose={() => setShowCamera(false)}
            onScan={handleScanQRCode}
            isDark={isDark}
          />
        )}

        {/* Modal de Câmera Mobile - Nota Fiscal */}
        {showCameraNotaFiscal && (
          <CameraScanner
            open={showCameraNotaFiscal}
            onClose={() => setShowCameraNotaFiscal(false)}
            onScan={handleScanCodigoBarrasNF}
            isDark={isDark}
          />
        )}

        {/* Modal Quantidade de Volumes a Movimentar Mobile */}
        <Dialog open={showQuantidadeModal} onOpenChange={setShowQuantidadeModal}>
          <DialogContent style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}>
            <DialogHeader>
              <DialogTitle style={{ color: theme.text }}>Movimentar Volumes</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <p className="text-sm" style={{ color: theme.text }}>
                Quantos volumes da nota fiscal deseja movimentar?
              </p>
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded">
                <p className="text-xs" style={{ color: theme.text }}>
                  Total disponível: <strong>{movimentacaoNota?.totalVolumes || 0}</strong>
                </p>
              </div>
              <div>
                <Label style={{ color: theme.text }}>Quantidade *</Label>
                <Input
                  type="number"
                  value={quantidadeMovimentar}
                  onChange={(e) => setQuantidadeMovimentar(e.target.value)}
                  min={1}
                  max={movimentacaoNota?.totalVolumes || 1}
                  className="mt-1"
                  style={{ backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.text }}
                  placeholder={`Máximo: ${movimentacaoNota?.totalVolumes || 0}`}
                  autoFocus
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setQuantidadeMovimentar(movimentacaoNota?.totalVolumes.toString() || "0")}
                  className="flex-1"
                  style={{ borderColor: theme.cardBorder, color: theme.text }}
                >
                  Todos
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setQuantidadeMovimentar("1")}
                  className="flex-1"
                  style={{ borderColor: theme.cardBorder, color: theme.text }}
                >
                  1 vol.
                </Button>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setShowQuantidadeModal(false);
                  setMovimentacaoNota(null);
                  setQuantidadeMovimentar("");
                }}
                style={{ borderColor: theme.cardBorder, color: theme.text }}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleConfirmarMovimentacao}
                disabled={!quantidadeMovimentar || parseInt(quantidadeMovimentar) <= 0}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Confirmar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Modal Finalizar Carregamento Mobile */}
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
                style={{ borderColor: theme.cardBorder, color: theme.text }}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleSalvarLayout}
                disabled={saving || !datasCarregamento.inicio || !datasCarregamento.fim}
                className="bg-green-600 hover:bg-green-700"
              >
                {saving ? "Finalizando..." : "Finalizar"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        </div>
      </DragDropContext>
    );
  }

  // Renderização Desktop
  return (
    <DragDropContext onDragEnd={handleDragEnd}>
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
                Endereçamento no Caminhão
              </h2>
              <p className="text-sm" style={{ color: theme.textMuted }}>
                Ordem: {ordem.numero_carga || `#${ordem.id.slice(-6)}`}
              </p>
            </div>
          </div>
          <div className="flex gap-2 items-center">
            <Select value={tipoImpressao} onValueChange={setTipoImpressao}>
              <SelectTrigger className="w-32 h-9" style={{ backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.text }}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}>
                <SelectItem value="resumido" style={{ color: theme.text }}>Resumido</SelectItem>
                <SelectItem value="detalhado" style={{ color: theme.text }}>Detalhado</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              onClick={handleImprimirLayout}
              disabled={enderecamentos.length === 0}
              style={{ borderColor: theme.cardBorder, color: theme.text }}
            >
              <Printer className="w-4 h-4 mr-2" />
              Layout
            </Button>
            <Button
              variant="outline"
              onClick={handleImprimirListaNotas}
              style={{ borderColor: theme.cardBorder, color: theme.text }}
            >
              <Printer className="w-4 h-4 mr-2" />
              Notas
            </Button>
            <Button
              onClick={handleSalvarProgresso}
              disabled={saving}
              variant="outline"
              style={{ borderColor: theme.cardBorder, color: theme.text }}
            >
              <Save className="w-4 h-4 mr-2" />
              Salvar Progresso
            </Button>
            <Button
              onClick={handleAbrirFinalizacao}
              disabled={saving}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Finalizar Carregamento
            </Button>
          </div>
        </div>

        {/* Progresso */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span style={{ color: theme.text }}>Progresso do Endereçamento</span>
            <span className="font-bold" style={{ color: theme.text }}>
              {getEnderecamentosOrdemAtual().length} / {volumesLocal.filter(v => notasFiscaisLocal.some(nf => nf.id === v.nota_fiscal_id)).length} volumes
            </span>
          </div>
          <Progress value={progressoEnderecamento} className="h-3" />
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Painel Esquerdo - Volumes e Lista de Notas */}
        <div className="w-80 border-r flex flex-col" style={{ borderColor: theme.cardBorder, backgroundColor: theme.cardBg }}>
          <Tabs value={abaAtiva} onValueChange={setAbaAtiva} className="flex-1 flex flex-col overflow-hidden">
            <TabsList className="grid w-[calc(100%-1rem)] grid-cols-2 mx-auto mt-2">
              <TabsTrigger value="volumes" className="text-sm h-8">
                <Package className="w-3 h-3 mr-1" />
                Volumes
              </TabsTrigger>
              <TabsTrigger value="notas" className="text-sm h-8">
                <FileText className="w-3 h-3 mr-1" />
                Lista de Notas
              </TabsTrigger>
            </TabsList>

            {/* Aba Volumes */}
            <TabsContent value="volumes" className="flex-1 flex flex-col mt-0 overflow-hidden">
              <div className="p-2 border-b" style={{ borderColor: theme.cardBorder }}>
                {/* Tipo de Filtro */}
                <div className="mb-3">
                  <Tabs value={filtroTipo} onValueChange={setFiltroTipo}>
                <TabsList className="grid w-full grid-cols-2 h-8">
                  <TabsTrigger value="volume" className="text-xs">Volume / Etiq. Mãe</TabsTrigger>
                  <TabsTrigger value="nota_fiscal" className="text-xs">Nota Fiscal</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {/* Campo de Busca Unificado */}
            {filtroTipo === "nota_fiscal" ? (
              <div className="mb-3 p-2 border rounded" style={{ borderColor: theme.cardBorder, backgroundColor: isDark ? '#1e3a8a22' : '#eff6ff' }}>
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-xs font-semibold" style={{ color: theme.text }}>
                    Pesquisar Nota Fiscal
                  </Label>
                  <div className="flex items-center gap-1.5">
                    <Checkbox
                      id="usar-base"
                      checked={usarBase}
                      onCheckedChange={setUsarBase}
                    />
                    <Label htmlFor="usar-base" className="text-xs cursor-pointer" style={{ color: theme.text }}>
                      Base
                    </Label>
                  </div>
                </div>
                
                {!usarBase ? (
                  <>
                    <Button
                      onClick={() => setShowCameraNotaFiscal(true)}
                      className="bg-blue-600 hover:bg-blue-700 w-full mb-2 h-7"
                      size="sm"
                    >
                      <Camera className="w-3 h-3 mr-2" />
                      Escanear Código de Barras
                    </Button>
                    <Input
                      ref={inputChaveRef}
                      placeholder="44 dígitos - bipe ou cole..."
                      value={searchChaveNF}
                      onChange={(e) => setSearchChaveNF(e.target.value.replace(/\D/g, '').substring(0, 44))}
                      className="h-7 text-xs font-mono"
                      style={{ backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.text }}
                      disabled={processandoChave}
                      autoFocus
                    />
                    {processandoChave && (
                      <div className="flex items-center gap-2 mt-2">
                        <div className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                        <span className="text-xs" style={{ color: theme.text }}>Processando...</span>
                      </div>
                    )}
                    <p className="text-[9px] mt-1" style={{ color: theme.textMuted }}>
                      Cole ou bipe a chave - pesquisa automática
                    </p>
                  </>
                ) : (
                  <>
                    <div className="relative">
                      <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-3 h-3" style={{ color: theme.textMuted }} />
                      <Input
                        ref={inputChaveRef}
                        placeholder="Número da NF ou chave (44 dígitos)..."
                        value={notasBaseBusca}
                        onChange={(e) => setNotasBaseBusca(e.target.value)}
                        onKeyDown={async (e) => {
                          if (e.key === 'Enter' && notasBaseBusca.trim()) {
                            const valor = notasBaseBusca.trim().replace(/\D/g, '');
                            
                            // Se tiver 44 dígitos, importar diretamente
                            if (valor.length === 44) {
                              setNotasBaseBusca("");
                              await handlePesquisarChaveNF(valor);
                            }
                          }
                        }}
                        className="h-7 text-xs pl-7"
                        style={{ backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.text }}
                        autoFocus
                      />
                    </div>
                    <p className="text-[9px] mt-1" style={{ color: theme.textMuted }}>
                      Digite número ou bipe chave - Enter para importar
                    </p>
                  </>
                )}
              </div>
            ) : (
              <>
                <div className="mb-3 space-y-2">
                  <Button
                    onClick={() => setShowCamera(true)}
                    className="bg-blue-600 hover:bg-blue-700 w-full h-9"
                    size="sm"
                  >
                    <Camera className="w-4 h-4 mr-2" />
                    Escanear QR Code
                  </Button>
                  
                  <div className="flex items-center gap-2 p-2 rounded border" style={{ borderColor: theme.cardBorder }}>
                    <Checkbox
                      id="apenas-vinculadas-desktop"
                      checked={apenasNotasVinculadas}
                      onCheckedChange={(checked) => setApenasNotasVinculadas(checked)}
                    />
                    <label
                      htmlFor="apenas-vinculadas-desktop"
                      className="text-xs font-medium cursor-pointer flex-1"
                      style={{ color: theme.text }}
                    >
                      Apenas Notas Vinculadas
                    </label>
                    {apenasNotasVinculadas && (
                      <Badge className="bg-blue-600 text-white text-[10px] px-1.5 py-0">
                        Ativo
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: theme.textMuted }} />
                  <Input
                    placeholder="Digite volume ou etiqueta mãe..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value.toUpperCase())}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && searchTerm.trim()) {
                        handleBuscarVolumeOuEtiqueta(searchTerm);
                      }
                    }}
                    className="pl-10 h-9 text-sm"
                    style={{ backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.text }}
                    disabled={processandoBusca}
                  />
                  {processandoBusca && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    </div>
                  )}
                </div>
                <p className="text-[9px] mt-1 text-center" style={{ color: theme.textMuted }}>
                  Pressione Enter ou escaneie para buscar
                </p>
              </>
            )}

            {volumesSelecionados.length > 0 && (
              <div className="mt-3">
                <Badge className="bg-blue-600 text-white">
                  {volumesSelecionados.length} selecionado(s)
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setVolumesSelecionados([])}
                  className="ml-2 h-6 text-xs"
                  style={{ color: theme.textMuted }}
                >
                  Limpar
                </Button>
              </div>
            )}
          </div>

              {/* Lista de Volumes Agrupados por NF ou Notas da Base */}
              <Droppable droppableId="volumes-list">
                {(provided) => (
                  <div 
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className="flex-1 overflow-y-auto p-4"
                  >
                    <div className="space-y-3">
                      {usarBase && filtroTipo === "nota_fiscal" ? (
                        // Exibir notas da base quando modo "Base" ativado
                        <NotasBaseList
                          notasBaseBusca={notasBaseBusca}
                          notasFiscaisLocal={notasFiscaisLocal}
                          volumesLocal={volumesLocal}
                          onSelecionarNota={(nota) => {
                        // Verificação de duplicidade
                        const jaVinculada = notasFiscaisLocal.some(nf => nf.id === nota.id);
                        
                        if (jaVinculada) {
                          try { playErrorBeep(); } catch (e) {}
                          toast.info(`⚠️ Nota ${nota.numero_nota} JÁ VINCULADA!`);
                        } else {
                          // UI OTIMISTA: Atualizar interface com proteção
                          setNotasFiscaisLocal(prev => {
                            if (prev.some(n => n.id === nota.id)) return prev;
                            return [...prev, nota];
                          });
                          setNotasOrigem(prev => ({ ...prev, [nota.id]: "Adicionada" }));
                          try { playSuccessBeep(); } catch (e) {}
                          toast.success(`✅ Nota ${nota.numero_nota} vinculada!`);
                        }
                        
                        // Buscar volumes da nota
                        let volumesNota = volumesLocal.filter(v => v.nota_fiscal_id === nota.id);
                        const idsEnderecados = getEnderecamentosOrdemAtual().map(e => e.volume_id);
                        const volumesNaoEnderecados = volumesNota.filter(v => !idsEnderecados.includes(v.id));
                        
                        // Se não tem volumes locais, tenta buscar (pode ser que ainda não tenham sido carregados)
                        if (volumesNota.length === 0) {
                           toast.loading("Carregando volumes...");
                        } else {
                           setVolumesSelecionados(volumesNaoEnderecados.map(v => v.id));
                        }
                        
                        setNotasBaseBusca("");

                        // Operações de banco em BACKGROUND
                        (async () => {
                          try {
                            const volumesNotaDB = await base44.entities.Volume.filter({ nota_fiscal_id: nota.id });
                            
                            // Atualizar volumes locais com proteção contra duplicidade
                            setVolumesLocal(prev => {
                              const volumesIdsLocais = prev.map(v => v.id);
                              const volumesNovos = volumesNotaDB.filter(v => !volumesIdsLocais.includes(v.id));
                              return [...prev, ...volumesNovos];
                            });
                            
                            // Selecionar volumes recém carregados se necessário
                            if (volumesNota.length === 0 && volumesNotaDB.length > 0) {
                               const idsEnd = getEnderecamentosOrdemAtual().map(e => e.volume_id);
                               const volNaoEnd = volumesNotaDB.filter(v => !idsEnd.includes(v.id));
                               setVolumesSelecionados(volNaoEnd.map(v => v.id));
                               toast.dismiss();
                               toast.success(`${volNaoEnd.length} volumes selecionados`);
                            }

                            if (!jaVinculada) {
                              const notasIds = [...(ordem.notas_fiscais_ids || []), nota.id];
                              await Promise.all([
                                base44.entities.NotaFiscal.update(nota.id, {
                                  ordem_id: ordem.id,
                                  status_nf: "aguardando_expedicao"
                                }),
                                base44.entities.OrdemDeCarregamento.update(ordem.id, {
                                  notas_fiscais_ids: notasIds
                                })
                              ]);
                            }
                          } catch (error) {
                            console.error("Erro ao vincular nota:", error);
                            toast.error("Erro ao sincronizar dados da nota");
                          }
                        })();
                      }}
                          theme={theme}
                          isDark={isDark}
                        />
                      ) : (
                        // Exibir volumes agrupados por nota fiscal
                        <>
                          {(() => {
                            // Agrupar volumes por nota fiscal
                            const volumesPorNota = {};
                            filteredVolumes.forEach(volume => {
                              const notaId = volume.nota_fiscal_id;
                              if (!volumesPorNota[notaId]) {
                                volumesPorNota[notaId] = [];
                              }
                              volumesPorNota[notaId].push(volume);
                            });

                            return Object.entries(volumesPorNota).map(([notaId, volumes]) => {
                          const nota = notasFiscaisLocal.find(nf => nf.id === notaId);
                          const volumesSelecionadosNota = volumes.filter(v => volumesSelecionados.includes(v.id));
                          const todosNaSelecionados = volumes.length > 0 && volumes.every(v => volumesSelecionados.includes(v.id));
                          
                          // Calcular quantos volumes da nota já foram endereçados
                          const todosVolumesNota = volumesLocal.filter(v => v.nota_fiscal_id === notaId);
                          const volumesJaEnderecados = enderecamentos.filter(e => e.nota_fiscal_id === notaId).length;
                          const volumesFaltam = volumes.length; // Volumes não endereçados (disponíveis)

                          return (
                            <div key={notaId} className="border rounded" style={{ borderColor: theme.cardBorder }}>
                              {/* Header da Nota Fiscal - arrastável */}
                              <Draggable draggableId={`nota-sidebar-${notaId}`} index={Object.keys(volumesPorNota).indexOf(notaId)}>
                                {(provided, snapshot) => (
                                  <div
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                    className="p-3 border-b cursor-grab active:cursor-grabbing hover:bg-opacity-50 select-none"
                                    style={{ 
                                      ...provided.draggableProps.style,
                                      borderColor: theme.cardBorder,
                                      backgroundColor: snapshot.isDragging 
                                        ? (isDark ? '#1e40af' : '#3b82f6')
                                        : (volumesSelecionadosNota.length > 0 ? (isDark ? '#1e3a8a22' : '#eff6ff') : 'transparent'),
                                      userSelect: 'none',
                                      WebkitUserSelect: 'none',
                                      MozUserSelect: 'none',
                                      minHeight: '56px',
                                      opacity: snapshot.isDragging ? 0.95 : 1,
                                      transform: snapshot.isDragging ? `${provided.draggableProps.style?.transform} scale(1.02)` : provided.draggableProps.style?.transform,
                                      transition: snapshot.isDragging ? 'all 0.15s cubic-bezier(0.2, 0, 0, 1)' : 'background-color 0.2s ease, opacity 0.2s ease',
                                      boxShadow: snapshot.isDragging ? '0 8px 16px rgba(0, 0, 0, 0.15)' : 'none',
                                      borderRadius: snapshot.isDragging ? '8px' : '0'
                                    }}
                                  >
                                    <div className="flex items-center gap-3 mb-1">
                                      <div 
                                        onClick={(e) => e.stopPropagation()}
                                        className="p-1"
                                        style={{ minWidth: '32px', minHeight: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                      >
                                        <Checkbox
                                          checked={todosNaSelecionados}
                                          onCheckedChange={() => {
                                            if (todosNaSelecionados) {
                                              setVolumesSelecionados(prev => prev.filter(id => !volumes.map(v => v.id).includes(id)));
                                            } else {
                                              setVolumesSelecionados(prev => [...new Set([...prev, ...volumes.map(v => v.id)])]);
                                            }
                                          }}
                                          className="h-5 w-5"
                                        />
                                      </div>
                                        <div 
                                          className="flex-1 min-w-0 select-none" 
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            const key = `sidebar-${notaId}`;
                                            setNotasExpandidas(prev => ({
                                              ...prev,
                                              [key]: prev[key] === false ? true : false
                                            }));
                                          }}
                                          style={{ 
                                            userSelect: 'none',
                                            WebkitUserSelect: 'none',
                                            MozUserSelect: 'none',
                                            color: snapshot.isDragging ? '#ffffff' : 'inherit'
                                          }}
                                        >
                                          <p className="font-bold text-sm" style={{ color: snapshot.isDragging ? '#ffffff' : theme.text }}>
                                            NF {nota?.numero_nota}
                                          </p>
                                          <p className="text-xs truncate" style={{ color: snapshot.isDragging ? '#e0e7ff' : theme.textMuted }}>
                                            {nota?.emitente_razao_social}
                                          </p>
                                        </div>
                                        <Badge 
                                          className={`${snapshot.isDragging ? 'bg-white/20' : (volumesFaltam > 0 ? 'bg-orange-600' : 'bg-green-600')} text-white text-xs h-6 px-2 select-none`}
                                          style={{ pointerEvents: 'none' }}
                                        >
                                          {volumesFaltam}/{todosVolumesNota.length}
                                        </Badge>
                                      </div>
                                      <div 
                                        className="flex items-center justify-between text-xs px-6" 
                                        style={{ color: snapshot.isDragging ? '#e0e7ff' : theme.textMuted, pointerEvents: 'none' }}
                                      >
                                        <span>
                                          Alocados: <strong style={{ color: snapshot.isDragging ? '#ffffff' : '#10b981' }}>{volumesJaEnderecados}</strong>
                                        </span>
                                        <span>
                                          Pendentes: <strong style={{ color: snapshot.isDragging ? '#ffffff' : (volumesFaltam > 0 ? '#ef4444' : '#10b981') }}>{volumesFaltam}</strong>
                                        </span>
                                      </div>
                                    </div>
                                  )}
                                </Draggable>

                              {/* Lista de Volumes da Nota - com expand/collapse */}
                              <AnimatePresence>
                                {notasExpandidas[`sidebar-${notaId}`] !== false && (
                                  <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    transition={{ duration: 0.2, ease: "easeInOut" }}
                                    className="p-2 space-y-1 overflow-hidden"
                                  >
                                    {volumes.map((volume, index) => {
                                      const isSelected = volumesSelecionados.includes(volume.id);

                                      return (
                                        <Draggable key={volume.id} draggableId={volume.id} index={index}>
                                          {(provided, snapshot) => (
                                            <div
                                              ref={provided.innerRef}
                                              {...provided.draggableProps}
                                              {...provided.dragHandleProps}
                                              onClick={() => handleToggleVolume(volume.id)}
                                              className="p-1.5 border rounded cursor-pointer hover:shadow-sm transition-all text-xs"
                                              style={{
                                                ...provided.draggableProps.style,
                                                borderColor: isSelected ? '#3b82f6' : theme.cardBorder,
                                                backgroundColor: snapshot.isDragging 
                                                  ? (isDark ? '#1e40af' : '#3b82f6')
                                                  : (isSelected ? (isDark ? '#1e3a8a33' : '#dbeafe33') : 'transparent'),
                                                color: snapshot.isDragging ? '#ffffff' : 'inherit'
                                              }}
                                            >
                                              <div className="flex items-center gap-2">
                                                <Checkbox
                                                  checked={isSelected}
                                                  onCheckedChange={() => handleToggleVolume(volume.id)}
                                                  onClick={(e) => e.stopPropagation()}
                                                />
                                                <p className="font-mono font-bold flex-1 truncate select-none" style={{ 
                                                  color: snapshot.isDragging ? '#ffffff' : theme.text,
                                                  userSelect: 'none',
                                                  WebkitUserSelect: 'none',
                                                  MozUserSelect: 'none'
                                                }}>
                                                  {volume.identificador_unico}
                                                </p>
                                                <p className="text-xs select-none" style={{ 
                                                  color: snapshot.isDragging ? '#e0e7ff' : theme.textMuted,
                                                  userSelect: 'none',
                                                  WebkitUserSelect: 'none',
                                                  MozUserSelect: 'none'
                                                }}>
                                                  {volume.peso_volume} kg
                                                </p>
                                              </div>
                                            </div>
                                          )}
                                        </Draggable>
                                      );
                                    })}
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          );
                        });
                      })()}

                          {filteredVolumes.length === 0 && (
                            <div className="text-center py-8" style={{ color: theme.textMuted }}>
                              <Package className="w-12 h-12 mx-auto mb-2 opacity-20" />
                              <p className="text-sm">
                                {getVolumesNaoEnderecados().length === 0
                                  ? "Todos os volumes foram posicionados!"
                                  : "Nenhum volume encontrado"}
                              </p>
                            </div>
                          )}
                        </>
                      )}
                      {provided.placeholder}
                    </div>
                  </div>
                )}
              </Droppable>
            </TabsContent>

            {/* Aba Lista de Notas */}
            <TabsContent value="notas" className="flex-1 overflow-y-auto m-0 px-2 pb-2 space-y-1.5">
              {(() => {
                // CRÍTICO: Remover duplicatas por ID antes de renderizar
                const notasUnicas = notasFiscaisLocal.reduce((acc, nota) => {
                  if (!acc.find(n => n.id === nota.id)) {
                    acc.push(nota);
                  }
                  return acc;
                }, []);
                
                return notasUnicas.map((nota) => {
                    const volumesNota = volumesLocal.filter(v => v.nota_fiscal_id === nota.id);
                    const volumesEndNota = enderecamentos.filter(e => e.nota_fiscal_id === nota.id && e.ordem_id === ordem.id);
                    const origem = notasOrigem[nota.id] || "Vinculada";
                    const origemColor = origem === "Vinculada" ? (isDark ? '#3b82f6' : '#2563eb') : origem === "Adicionada" ? (isDark ? '#f59e0b' : '#d97706') : (isDark ? '#10b981' : '#059669');

                    return (
                      <div
                        key={nota.id}
                        className="p-2 border rounded"
                        style={{ borderColor: theme.cardBorder, backgroundColor: isDark ? '#1e293b' : '#ffffff' }}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0 flex-1">
                            <span className="font-bold text-xs whitespace-nowrap" style={{ color: theme.text }}>
                              NF {nota.numero_nota}
                            </span>
                            <Badge
                              className="text-[8px] h-3.5 px-1.5 flex-shrink-0"
                              style={{ backgroundColor: origemColor, color: 'white' }}
                            >
                              {origem}
                            </Badge>
                            <span className="text-[10px] truncate" style={{ color: theme.textMuted }} title={nota.emitente_razao_social}>
                              {nota.emitente_razao_social?.substring(0, 20) || '-'}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-2 text-[10px] whitespace-nowrap" style={{ color: theme.textMuted }}>
                              <span>
                                <strong style={{ color: theme.text }}>{volumesEndNota.length}/{volumesNota.length}</strong> vol
                              </span>
                              <span>
                                <strong style={{ color: theme.text }}>{(nota.peso_total_nf || 0).toLocaleString()}</strong> kg
                              </span>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-5 w-5 p-0 hover:bg-red-50 dark:hover:bg-red-950"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDesvincularNota(nota);
                              }}
                              title="Desvincular nota fiscal"
                            >
                              <Trash2 className="w-3 h-3 text-red-500" />
                            </Button>
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-[9px] mt-0.5" style={{ color: theme.textMuted }}>
                          <span className="truncate" title={`${nota.emitente_cidade}/${nota.emitente_uf} → ${nota.destinatario_cidade}/${nota.destinatario_uf}`}>
                            {nota.emitente_cidade}/{nota.emitente_uf} → {nota.destinatario_cidade}/{nota.destinatario_uf}
                          </span>
                          <span className="ml-2 font-semibold whitespace-nowrap" style={{ color: theme.text }}>
                            R$ {(nota.valor_nota_fiscal || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                      </div>
                    );
                    });
                    })()}

                    {notasFiscaisLocal.length === 0 && (
                    <div className="text-center py-8" style={{ color: theme.textMuted }}>
                    <FileText className="w-12 h-12 mx-auto mb-2 opacity-20" />
                    <p className="text-sm">Nenhuma nota fiscal vinculada</p>
                    </div>
                    )}
                    </TabsContent>
          </Tabs>
        </div>

        {/* Painel Central - Layout do Veículo */}
        <div className="flex-1 overflow-auto p-4">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold flex items-center gap-2" style={{ color: theme.text }}>
                <Grid3x3 className="w-4 h-4" />
                Layout do Caminhão - {tipoVeiculo}
              </h3>
              <div className="flex items-center gap-2">
                <Label className="text-sm" style={{ color: theme.text }}>Linhas:</Label>
                <Input
                  type="number"
                  value={numLinhas}
                  onChange={(e) => {
                    const val = parseInt(e.target.value) || 1;
                    setNumLinhas(Math.max(1, Math.min(20, val)));
                  }}
                  className="w-16 h-8 text-sm"
                  style={{ backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.text }}
                  min={1}
                  max={20}
                />
              </div>
            </div>

            {/* Grid do Veículo */}
            <div className="border-2 rounded-lg overflow-hidden" style={{ borderColor: theme.cellBorder }}>
              {/* Cabeçalho */}
              <div className="grid gap-0" style={{ gridTemplateColumns: `80px repeat(${layoutConfig.colunas.length}, minmax(200px, 1fr))` }}>
                <div className="p-2 font-bold text-center border-b border-r" style={{ backgroundColor: isDark ? '#334155' : '#f1f5f9', borderColor: theme.cellBorder, color: theme.text }}>
                  Linha
                </div>
                {layoutConfig.colunas.map((coluna, idx) => (
                  <div
                    key={coluna}
                    className="p-2 font-bold text-center border-b"
                    style={{
                      backgroundColor: isDark ? '#334155' : '#f1f5f9',
                      borderColor: theme.cellBorder,
                      borderRight: idx < layoutConfig.colunas.length - 1 ? `1px solid ${theme.cellBorder}` : 'none',
                      color: theme.text
                    }}
                  >
                    {coluna}
                  </div>
                ))}
              </div>

              {/* Linhas do Layout */}
              {Array.from({ length: numLinhas }, (_, i) => i + 1).map((linha) => (
                <div
                  key={linha}
                  className="grid gap-0"
                  style={{ gridTemplateColumns: `80px repeat(${layoutConfig.colunas.length}, minmax(200px, 1fr))` }}
                >
                  <div
                    className="p-2 font-bold text-center border-b border-r"
                    style={{
                      backgroundColor: isDark ? '#334155' : '#f1f5f9',
                      borderColor: theme.cellBorder,
                      color: theme.text
                    }}
                  >
                    {linha}
                  </div>
                  
                  {layoutConfig.colunas.map((coluna, idx) => {
                    const notasNaCelula = getNotasFiscaisNaCelula(linha, coluna);
                    const volumesNaCelula = getVolumesNaCelula(linha, coluna);
                    const temVolumes = volumesNaCelula.length > 0;

                    return (
                      <Droppable key={`${linha}-${coluna}`} droppableId={`cell-${linha}-${coluna}`}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                            onClick={() => handleAlocarNaCelula(linha, coluna)}
                            className="p-2 border-b min-h-[100px] cursor-pointer hover:bg-opacity-50 transition-all"
                            style={{
                              backgroundColor: snapshot.isDraggingOver 
                                ? (isDark ? '#1e40af44' : '#dbeafe')
                                : theme.cellBg,
                              borderColor: theme.cellBorder,
                              borderRight: idx < layoutConfig.colunas.length - 1 ? `1px solid ${theme.cellBorder}` : 'none'
                            }}
                            title="Clique para alocar volumes selecionados ou arraste volumes aqui"
                          >
                            <div className="space-y-0.5">
                              {notasNaCelula.map((nota, notaIndex) => {
                                const volumesNota = volumesNaCelula.filter(v => v.nota_fiscal_id === nota.id);
                                const fornecedorAbreviado = nota.emitente_razao_social
                                  ?.split(' ')
                                  .slice(0, 2)
                                  .join(' ')
                                  .substring(0, 18) || 'N/A';
                                const expandKey = `${nota.id}-${linha}-${coluna}`;
                                const isExpanded = notasExpandidas[expandKey];
                                
                                return (
                                  <div key={nota.id} className="space-y-0.5">
                                    <Draggable draggableId={`nota-${nota.id}-${linha}-${coluna}`} index={notaIndex}>
                                      {(provided, snapshot) => (
                                        <div
                                          ref={provided.innerRef}
                                          {...provided.draggableProps}
                                          {...provided.dragHandleProps}
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            toggleNotaExpandida(nota.id, linha, coluna);
                                          }}
                                          className="flex items-center justify-between gap-1 px-2 py-1 rounded text-[11px] leading-tight cursor-pointer"
                                          style={{
                                           ...provided.draggableProps.style,
                                           backgroundColor: snapshot.isDragging 
                                             ? (isDark ? '#1e40af' : '#3b82f6')
                                             : (isDark ? '#1e40af' : '#bfdbfe'),
                                           color: isDark ? '#ffffff' : '#1e3a8a',
                                           opacity: snapshot.isDragging ? 0.9 : 1,
                                           fontWeight: '600',
                                           letterSpacing: '0.3px'
                                          }}
                                          >
                                          <span className="font-bold shrink-0 w-14 uppercase">
                                           {nota.numero_nota}
                                          </span>
                                          <span className="flex-1 truncate text-center px-1 uppercase" title={nota.emitente_razao_social}>
                                           {fornecedorAbreviado}
                                          </span>
                                          <span className="font-bold shrink-0 w-6 text-right">
                                           {volumesNota.length}
                                          </span>
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleRemoverNotaDaCelula(linha, coluna, nota.id);
                                            }}
                                            className="h-4 w-4 p-0 hover:bg-red-100 dark:hover:bg-red-900 flex-shrink-0"
                                            title="Remover NF desta célula"
                                          >
                                            <Trash2 className="w-2.5 h-2.5 text-red-600" />
                                          </Button>
                                        </div>
                                      )}
                                    </Draggable>
                                    
                                    {/* Volumes individuais - mostrar apenas quando expandido */}
                                    <AnimatePresence>
                                      {isExpanded && (
                                        <motion.div
                                          initial={{ opacity: 0, height: 0 }}
                                          animate={{ opacity: 1, height: "auto" }}
                                          exit={{ opacity: 0, height: 0 }}
                                          transition={{ duration: 0.2, ease: "easeInOut" }}
                                          className="space-y-0.5 overflow-hidden"
                                        >
                                          {volumesNota.map((vol, volIndex) => (
                                            <Draggable key={vol.id} draggableId={`allocated-${vol.id}`} index={volIndex}>
                                              {(provided, snapshot) => (
                                                <div
                                                  ref={provided.innerRef}
                                                  {...provided.draggableProps}
                                                  {...provided.dragHandleProps}
                                                  className="px-1.5 py-0.5 rounded text-[9px] leading-tight cursor-move ml-2"
                                                  style={{
                                                    ...provided.draggableProps.style,
                                                    backgroundColor: snapshot.isDragging 
                                                      ? (isDark ? '#1e40af' : '#3b82f6')
                                                      : (isDark ? '#334155' : '#e2e8f0'),
                                                    color: snapshot.isDragging ? '#ffffff' : theme.text,
                                                    opacity: snapshot.isDragging ? 0.9 : 1
                                                  }}
                                                  title="Arraste para mover"
                                                >
                                                  <span className="font-mono font-bold">
                                                    {vol.identificador_unico}
                                                  </span>
                                                </div>
                                              )}
                                            </Draggable>
                                          ))}
                                        </motion.div>
                                      )}
                                    </AnimatePresence>
                                  </div>
                                );
                              })}
                            </div>
                            
                            {!temVolumes && (
                              <div className="text-center text-xs" style={{ color: theme.textMuted, opacity: 0.5 }}>
                                {snapshot.isDraggingOver ? "Solte aqui" : "Vazio"}
                              </div>
                            )}
                            {provided.placeholder}
                          </div>
                        )}
                      </Droppable>
                    );
                  })}
                </div>
              ))}
            </div>

            {/* Instruções de Carregamento */}
            <Card className="mt-4" style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}>
              <CardHeader>
                <CardTitle className="text-sm" style={{ color: theme.text }}>
                  📋 Instruções de Carregamento
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-xs space-y-1" style={{ color: theme.textMuted }}>
                  <li>• Volumes frágeis devem ser posicionados por último e no topo</li>
                  <li>• Volumes mais pesados devem ficar na base e para inferior</li>
                  <li>• Volumes maiores devem ser carregados primeiro</li>
                  <li>• Verificar a distribuição de peso entre os eixos</li>
                  <li>• Respeitar a capacidade máxima de peso por zona</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Modal de Câmera Desktop - Volumes */}
      {showCamera && (
        <CameraScanner
          open={showCamera}
          onClose={() => setShowCamera(false)}
          onScan={handleScanQRCode}
          isDark={isDark}
        />
      )}

      {/* Modal de Câmera Desktop - Nota Fiscal */}
      {showCameraNotaFiscal && (
        <CameraScanner
          open={showCameraNotaFiscal}
          onClose={() => setShowCameraNotaFiscal(false)}
          onScan={handleScanCodigoBarrasNF}
          isDark={isDark}
        />
      )}

      {/* Modal Quantidade de Volumes a Movimentar */}
      <Dialog open={showQuantidadeModal} onOpenChange={setShowQuantidadeModal}>
        <DialogContent style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}>
          <DialogHeader>
            <DialogTitle style={{ color: theme.text }}>Movimentar Volumes da Nota Fiscal</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm" style={{ color: theme.text }}>
              Quantos volumes da nota fiscal deseja movimentar?
            </p>
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded">
              <p className="text-xs" style={{ color: theme.text }}>
                Total de volumes disponíveis: <strong>{movimentacaoNota?.totalVolumes || 0}</strong>
              </p>
            </div>
            <div>
              <Label style={{ color: theme.text }}>Quantidade de Volumes *</Label>
              <Input
                type="number"
                value={quantidadeMovimentar}
                onChange={(e) => setQuantidadeMovimentar(e.target.value)}
                min={1}
                max={movimentacaoNota?.totalVolumes || 1}
                className="mt-1"
                style={{ backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.text }}
                placeholder={`Máximo: ${movimentacaoNota?.totalVolumes || 0}`}
                autoFocus
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setQuantidadeMovimentar(movimentacaoNota?.totalVolumes.toString() || "0")}
                className="flex-1"
                style={{ borderColor: theme.cardBorder, color: theme.text }}
              >
                Todos ({movimentacaoNota?.totalVolumes || 0})
              </Button>
              <Button
                variant="outline"
                onClick={() => setQuantidadeMovimentar("1")}
                className="flex-1"
                style={{ borderColor: theme.cardBorder, color: theme.text }}
              >
                Apenas 1
              </Button>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowQuantidadeModal(false);
                setMovimentacaoNota(null);
                setQuantidadeMovimentar("");
              }}
              style={{ borderColor: theme.cardBorder, color: theme.text }}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleConfirmarMovimentacao}
              disabled={!quantidadeMovimentar || parseInt(quantidadeMovimentar) <= 0 || saving}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {saving ? "Movimentando..." : "Confirmar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Finalizar Carregamento Desktop */}
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
              style={{ borderColor: theme.cardBorder, color: theme.text }}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSalvarLayout}
              disabled={saving || !datasCarregamento.inicio || !datasCarregamento.fim}
              className="bg-green-600 hover:bg-green-700"
            >
              {saving ? "Finalizando..." : "Finalizar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      </div>
    </DragDropContext>
  );
}