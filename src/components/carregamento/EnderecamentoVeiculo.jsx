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
  Camera,
  Edit,
  DollarSign
} from "lucide-react";
import CameraScanner from "../etiquetas-mae/CameraScanner";
import DespesaPosicaoModal from "./DespesaPosicaoModal";
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
  const [numLinhasInput, setNumLinhasInput] = useState("6");
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
  const [feedbackNota, setFeedbackNota] = useState(null); // 'success' | 'duplicate' | 'error'
  const [feedbackMensagem, setFeedbackMensagem] = useState("");
  const [showEditarOrdemModal, setShowEditarOrdemModal] = useState(false);
  const [dadosOrdemEdit, setDadosOrdemEdit] = useState({});
  const [ordemAtual, setOrdemAtual] = useState(ordem);
  const [showDespesaModal, setShowDespesaModal] = useState(false);
  const [despesaContext, setDespesaContext] = useState(null);
  const [despesasExtras, setDespesasExtras] = useState([]);

  // Sincronizar ordemAtual quando prop ordem mudar
  useEffect(() => {
    setOrdemAtual(ordem);
  }, [ordem]);

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
      // Sempre false - usar layout desktop responsivo em todos os tamanhos
      setIsMobile(false);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    inicializarDados();
    loadDespesasExtras();
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
        
        // Restaurar TODOS os dados do rascunho na ordem correta
        if (rascunho.notasOrigem) setNotasOrigem(rascunho.notasOrigem);
        
        // CRÍTICO: Restaurar notas e volumes ANTES de endereçamentos
        if (rascunho.notas && rascunho.notas.length > 0) {
          setNotasFiscaisLocal(rascunho.notas);
          console.log(`📋 ${rascunho.notas.length} notas restauradas`);
        }
        
        if (rascunho.volumes && rascunho.volumes.length > 0) {
          setVolumesLocal(rascunho.volumes);
          console.log(`📦 ${rascunho.volumes.length} volumes restaurados`);
        }
        
        if (rascunho.enderecamentos && rascunho.enderecamentos.length > 0) {
          setEnderecamentos(rascunho.enderecamentos);
          console.log(`📍 ${rascunho.enderecamentos.length} endereçamentos restaurados`);
        }
        
        // Toast detalhado informando o que foi restaurado
        if (rascunho.enderecamentos?.length > 0 || rascunho.notas?.length > 0) {
          setTimeout(() => {
            const feedbackMsg = `💾 PROGRESSO RESTAURADO\n` +
              `📋 ${rascunho.notas?.length || 0} notas fiscais\n` +
              `📦 ${rascunho.volumes?.length || 0} volumes\n` +
              `📍 ${rascunho.enderecamentos?.length || 0} posicionamentos`;
            
            toast.info(feedbackMsg, { 
              duration: 5000,
              style: { whiteSpace: 'pre-line', fontSize: '12px', lineHeight: '1.4' }
            });
          }, 500);
        }
      }
    } catch (error) {
      console.error("Erro ao carregar rascunho:", error);
      toast.error("Erro ao restaurar progresso salvo");
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
      // 1. Salvar rascunho no localStorage com TODOS os dados
      const enderecamentosOrdemAtual = enderecamentos.filter(e => e.ordem_id === ordem.id);
      const rascunho = {
        enderecamentos: enderecamentosOrdemAtual,
        notas: notasFiscaisLocal,
        volumes: volumesLocal,
        notasOrigem: notasOrigem,
        timestamp: new Date().toISOString()
      };
      
      localStorage.setItem(`enderecamento_rascunho_${ordem.id}`, JSON.stringify(rascunho));
      console.log(`💾 Rascunho salvo completo:`, {
        enderecamentos: enderecamentosOrdemAtual.length,
        notas: notasFiscaisLocal.length,
        volumes: volumesLocal.length
      });
      
      // 2. Sincronizar notas vinculadas no banco
      const notasIds = notasFiscaisLocal.map(n => n.id);
      if (notasIds.length > 0) {
        await base44.entities.OrdemDeCarregamento.update(ordem.id, {
          notas_fiscais_ids: notasIds
        });
        
        // Garantir que cada nota está vinculada à ordem
        for (const nota of notasFiscaisLocal) {
          await base44.entities.NotaFiscal.update(nota.id, {
            ordem_id: ordem.id,
            status_nf: nota.status_nf || "aguardando_expedicao"
          });
        }
      }
      
      // 3. Feedback detalhado
      const totalVolumesEnderecados = enderecamentosOrdemAtual.length;
      const totalVolumes = volumesLocal.filter(v => notasFiscaisLocal.some(nf => nf.id === v.nota_fiscal_id)).length;
      
      const feedbackMsg = `✅ PROGRESSO SALVO COM SUCESSO!\n` +
        `📋 ${notasFiscaisLocal.length} nota(s) fiscal vinculada(s)\n` +
        `📦 ${totalVolumesEnderecados}/${totalVolumes} volumes posicionados\n` +
        `💾 Você pode continuar depois`;
      
      playSuccessBeep();
      toast.success(feedbackMsg, { 
        duration: 5000,
        style: { whiteSpace: 'pre-line', fontSize: '13px', lineHeight: '1.5', fontWeight: '500' }
      });
    } catch (error) {
      console.error("Erro ao salvar progresso:", error);
      playErrorBeep();
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
      setNumLinhasInput(template.linhas.toString());
    }
  }, [ordem.tipo_veiculo]);

  const loadDespesasExtras = async () => {
    try {
      const despesas = await base44.entities.DespesaExtra.list("-created_date", 500);
      setDespesasExtras(despesas);
    } catch (error) {
      console.error("Erro ao carregar despesas:", error);
    }
  };

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
    const volumesDisponiveis = volumesLocal.filter(v => 
      notasFiscaisLocal.some(nf => nf.id === v.nota_fiscal_id) &&
      !idsEnderecados.includes(v.id)
    );
    
    // DEBUG: Log para diagnóstico
    if (notasFiscaisLocal.length > 0 && volumesDisponiveis.length === 0) {
      console.log('⚠️ DEBUG Volumes:', {
        totalNotasVinculadas: notasFiscaisLocal.length,
        totalVolumesLocal: volumesLocal.length,
        volumesDasNotas: volumesLocal.filter(v => notasFiscaisLocal.some(nf => nf.id === v.nota_fiscal_id)).length,
        volumesJaEnderecados: idsEnderecados.length,
        notasIds: notasFiscaisLocal.map(n => n.id)
      });
    }
    
    return volumesDisponiveis;
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
    const notasEncontradas = notasFiscaisLocal.filter(nf => notasIds.includes(nf.id));
    
    // GARANTIR NOTAS ÚNICAS (prevenir duplicatas)
    const notasUnicas = notasEncontradas.reduce((acc, nota) => {
      if (!acc.find(n => n.id === nota.id)) {
        acc.push(nota);
      }
      return acc;
    }, []);
    
    return notasUnicas;
  };

  const getDespesasPaletePorNotaPosicao = (notaId, linha, coluna) => {
    return despesasExtras.filter(d => {
      if (d.nota_fiscal_id !== notaId) return false;
      // Verificar se a observação contém a posição
      const temPosicao = d.observacoes?.includes(`Posição: ${linha}-${coluna}`);
      // Verificar se é tipo palete/paletização (aceitar variações)
      const tipoLower = d.tipo_despesa_nome?.toLowerCase() || '';
      const ehPalete = tipoLower.includes('palete') || tipoLower.includes('paletiza');
      return temPosicao && ehPalete;
    });
  };

  const handleAbrirDespesaPosicao = (nota, linha, coluna, e) => {
    e.preventDefault();
    e.stopPropagation();
    setDespesaContext({ nota, linha, coluna });
    setShowDespesaModal(true);
  };

  const handleDespesaSuccess = async () => {
    await loadDespesasExtras();
    setShowDespesaModal(false);
    setDespesaContext(null);
    toast.success("Despesa registrada com sucesso!");
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
      // NÃO fechar modal - permitir continuar alocando na mesma célula
      // setShowBuscaModal(false);
      // setCelulaAtiva(null);
      
      toast.success(`✅ ${volumesParaEnderecear.length} volume(s) alocado(s)! Continue escaneando...`, { duration: 2000 });
      
      // Salvar rascunho de forma assíncrona
      salvarRascunho();
    } catch (error) {
      console.error("Erro ao alocar volumes:", error);
      toast.error("Erro ao alocar volumes");
    }
  };

  const handleClickCelula = async (linha, coluna) => {
    // Se houver volumes selecionados, alocar diretamente SEM abrir câmera
    if (volumesSelecionados.length > 0) {
      try {
        const user = await base44.auth.me();

        // Verificar duplicatas
        const endereçamentosExistentes = await base44.entities.EnderecamentoVolume.filter({
          ordem_id: ordem.id,
          volume_id: { $in: volumesSelecionados }
        });

        const volumesJaEnderecados = endereçamentosExistentes.map(e => e.volume_id);
        const volumesParaEnderecear = volumesSelecionados.filter(id => !volumesJaEnderecados.includes(id));

        if (volumesParaEnderecear.length === 0) {
          playErrorBeep();
          toast.warning("Todos os volumes selecionados já foram endereçados");
          setVolumesSelecionados([]);
          return;
        }

        if (volumesJaEnderecados.length > 0) {
          toast.info(`${volumesJaEnderecados.length} volume(s) já endereçado(s), alocando ${volumesParaEnderecear.length}`);
        }

        // ATUALIZAÇÃO OTIMISTA: Atualizar estado ANTES de chamar API
        const novosEnderecamentos = volumesParaEnderecear.map(volumeId => {
          const volume = volumesLocal.find(v => v.id === volumeId);
          return {
            id: `temp-${Date.now()}-${Math.random()}`,
            ordem_id: ordem.id,
            volume_id: volumeId,
            nota_fiscal_id: volume.nota_fiscal_id,
            linha: linha,
            coluna: coluna,
            posicao_celula: `${linha}-${coluna}`,
            data_enderecamento: new Date().toISOString(),
            enderecado_por: user.id
          };
        });

        setEnderecamentos(prev => [...prev, ...novosEnderecamentos]);
        setVolumesSelecionados([]);

        // Chamadas API em paralelo (background)
        const promises = volumesParaEnderecear.map(async volumeId => {
          const volume = volumesLocal.find(v => v.id === volumeId);
          if (!volume) return null;

          const [updatedVolume, novoEnd] = await Promise.all([
            base44.entities.Volume.update(volumeId, {
              status_volume: "carregado",
              localizacao_atual: `Ordem ${ordem.numero_carga || ordem.id.slice(-6)} - ${linha}-${coluna}`
            }),
            base44.entities.EnderecamentoVolume.create({
              ordem_id: ordem.id,
              volume_id: volumeId,
              nota_fiscal_id: volume.nota_fiscal_id,
              linha: linha,
              coluna: coluna,
              posicao_celula: `${linha}-${coluna}`,
              data_enderecamento: new Date().toISOString(),
              enderecado_por: user.id
            })
          ]);

          return novoEnd;
        });

        // Aguardar todas as chamadas em paralelo
        const resultados = await Promise.all(promises);

        // Substituir endereçamentos temporários pelos reais
        setEnderecamentos(prev => {
          const semTemporarios = prev.filter(e => !e.id.startsWith('temp-'));
          return [...semTemporarios, ...resultados.filter(Boolean)];
        });

        salvarRascunho();
        playSuccessBeep();
        toast.success(`✅ ${volumesParaEnderecear.length} volume(s) alocado(s) em ${linha}-${coluna}!`, { duration: 3000 });
      } catch (error) {
        console.error("Erro ao alocar volumes:", error);
        // Reverter estado em caso de erro
        await loadEnderecamentos();
        playErrorBeep();
        toast.error("Erro ao alocar volumes");
      }
      return;
    }

    // Se NÃO houver volumes selecionados, abrir câmera
    setCelulaAtiva({ linha, coluna });
    setShowCamera(true);
    setSearchTerm("");
  };

  const handleRemoverNotaDaCelula = async (linha, coluna, notaId) => {
    try {
      const endsParaRemover = getEnderecamentosOrdemAtual().filter(e =>
        e.linha === linha && e.coluna === coluna && e.nota_fiscal_id === notaId
      );

      // ATUALIZAÇÃO OTIMISTA: Remover do estado imediatamente
      const enderecamentosAtualizados = getEnderecamentosOrdemAtual().filter(e =>
        !(e.linha === linha && e.coluna === coluna && e.nota_fiscal_id === notaId)
      );
      setEnderecamentos(enderecamentosAtualizados);

      // Deletar do banco em paralelo (background)
      const deletePromises = endsParaRemover.map(async end => {
        await base44.entities.EnderecamentoVolume.delete(end.id);
        await base44.entities.Volume.update(end.volume_id, {
          status_volume: "criado",
          localizacao_atual: null
        });
      });

      await Promise.all(deletePromises);

      toast.success("✅ Nota fiscal removida da célula!", { duration: 3000 });
      salvarRascunho();
    } catch (error) {
      console.error("Erro ao remover:", error);
      await loadEnderecamentos();
      toast.error("Erro ao remover da célula");
    }
  };

  const handlePesquisarChaveNF = async (chaveNF) => {
    const chave = chaveNF || searchChaveNF;
    
    if (!chave || chave.length !== 44) {
      toast.error("Chave deve ter 44 dígitos", { id: 'pesquisa-nf' });
      setProcessandoChave(false);
      return;
    }

    if (processandoChave) {
      console.log('⚠️ Já processando uma chave, ignorando...');
      return;
    }

    setProcessandoChave(true);
    setFeedbackNota(null); // Limpar feedback anterior
    console.log('🔍 INICIANDO PESQUISA NF:', chave);

    try {
      // 1. Tentar buscar nota localmente primeiro (se já estiver na lista da ordem)
      const notaLocal = notasFiscaisLocal.find(nf => nf.chave_nota_fiscal === chave);
      
      if (notaLocal) {
        console.log('⚠️ Nota já vinculada localmente:', notaLocal.numero_nota);
        
        // Já está na lista local = já vinculada
        const volumesNota = volumesLocal.filter(v => v.nota_fiscal_id === notaLocal.id);
        const volumesNaoEnderecados = volumesNota.filter(v => {
          const idsEnderecados = enderecamentos.map(e => e.volume_id);
          return !idsEnderecados.includes(v.id);
        });
        
        setVolumesSelecionados(volumesNaoEnderecados.map(v => v.id));
        setSearchTerm("");
        setSearchChaveNF("");
        setNotasBaseBusca("");
        
        try { playErrorBeep(); } catch (e) {}
        
        setFeedbackNota('duplicate');
        setFeedbackMensagem(`⚠️ Nota ${notaLocal.numero_nota} já vinculada`);
        
        toast.warning(
          <div className="flex flex-col gap-1">
            <p className="font-bold text-base">⚠️ NOTA JÁ VINCULADA</p>
            <p className="text-sm">NF {notaLocal.numero_nota}</p>
            <p className="text-xs opacity-90">{notaLocal.emitente_razao_social}</p>
            <p className="text-xs font-semibold mt-1">{volumesNaoEnderecados.length} volumes selecionados</p>
          </div>,
          { 
            id: 'nota-duplicada',
            duration: 5000,
            style: { 
              background: isDark ? '#581c87' : '#f3e8ff',
              color: isDark ? '#e9d5ff' : '#581c87',
              border: '2px solid #a855f7',
              padding: '16px',
              fontSize: '14px'
            }
          }
        );
        
        setTimeout(() => {
          setFeedbackNota(null);
          setFeedbackMensagem("");
        }, 5000);
        setProcessandoChave(false);
        return;
      }

      // 2. Buscar nota no banco de dados
      console.log('🔍 Buscando no banco de dados...');
      const notasExistentes = await base44.entities.NotaFiscal.filter({ chave_nota_fiscal: chave });
      
      if (notasExistentes.length > 0) {
        const notaExistente = notasExistentes[0];
        console.log('✅ Nota encontrada no banco:', notaExistente.numero_nota);
        
        // Verificar duplicidade no estado local
        if (notasFiscaisLocal.some(n => n.id === notaExistente.id)) {
          console.log('⚠️ Nota já está no estado local, abortando');
          
          try { playErrorBeep(); } catch (e) {}
          toast.warning(`⚠️ Nota ${notaExistente.numero_nota} já está vinculada!`, { 
            id: 'pesquisa-nf',
            duration: 3000 
          });
          
          setSearchChaveNF("");
          setNotasBaseBusca("");
          setProcessandoChave(false);
          return;
        }
        
        // Buscar volumes ANTES de vincular (limite aumentado para 500)
        const volumesNota = await base44.entities.Volume.filter({ nota_fiscal_id: notaExistente.id }, null, 500);
        
        // Atualizar estados locais
        setNotasFiscaisLocal(prev => [...prev, notaExistente]);
        setVolumesLocal(prev => {
          const novos = volumesNota.filter(v => !prev.some(p => p.id === v.id));
          return [...prev, ...novos];
        });
        setNotasOrigem(prev => ({ ...prev, [notaExistente.id]: "Adicionada" }));
        
        // Vincular no banco (em background)
        (async () => {
          try {
            const notasIds = [...(ordem.notas_fiscais_ids || []).filter(id => id !== notaExistente.id), notaExistente.id];
            await Promise.all([
              base44.entities.NotaFiscal.update(notaExistente.id, {
                ordem_id: ordem.id,
                status_nf: "aguardando_expedicao"
              }),
              base44.entities.OrdemDeCarregamento.update(ordem.id, {
                notas_fiscais_ids: notasIds
              })
            ]);
            setTimeout(() => salvarRascunho(), 100);
          } catch (error) {
            console.error("Erro ao vincular nota no banco:", error);
          }
        })();
        
        try { playSuccessBeep(); } catch (e) {}
        
        setFeedbackNota('success');
        setFeedbackMensagem(`✅ NF ${notaExistente.numero_nota} vinculada`);
        
        toast.success(
          <div className="flex flex-col gap-1.5">
            <p className="font-bold text-lg">✅ NOTA VINCULADA!</p>
            <p className="text-base font-semibold">NF {notaExistente.numero_nota}</p>
            <div className="text-sm space-y-0.5 mt-1">
              <p>📤 {notaExistente.emitente_razao_social || 'N/A'}</p>
              <p className="opacity-80">📍 {notaExistente.emitente_cidade || 'N/A'}/{notaExistente.emitente_uf || 'N/A'}</p>
              <p>📥 {notaExistente.destinatario_razao_social || 'N/A'}</p>
              <p className="opacity-80">📍 {notaExistente.destinatario_cidade || 'N/A'}/{notaExistente.destinatario_uf || 'N/A'}</p>
            </div>
            <p className="text-base font-bold mt-1">📦 {volumesNota.length} volumes carregados</p>
          </div>,
          { 
            id: 'nota-vinculada',
            duration: 8000,
            style: { 
              background: isDark ? '#065f46' : '#d1fae5',
              color: isDark ? '#d1fae5' : '#065f46',
              border: '3px solid #10b981',
              padding: '20px',
              fontSize: '14px',
              minWidth: '320px'
            }
          }
        );
        
        setTimeout(() => {
          setFeedbackNota(null);
          setFeedbackMensagem("");
        }, 5000);
        setSearchChaveNF("");
        setNotasBaseBusca("");
        setProcessandoChave(false);
        return;
      }

      // 3. Nota não existe - Importar via API
      console.log('📡 Importando da SEFAZ...');
      toast.loading("🔍 Buscando na SEFAZ...", { id: 'pesquisa-nf' });
      
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

      // Atualizar estados locais
      setNotasFiscaisLocal(prev => {
        if (prev.some(n => n.id === novaNF.id)) return prev;
        return [...prev, novaNF];
      });
      
      setVolumesLocal(prev => [...prev, ...volumesCriados]);
      setNotasOrigem(prev => ({ ...prev, [novaNF.id]: "Importada" }));
      
      console.log('✅ Nota importada com sucesso:', numeroNota);
      
      try { playSuccessBeep(); } catch (e) {}
      
      setFeedbackNota('success');
      setFeedbackMensagem(`✅ NF ${numeroNota} importada`);
      
      const remetenteNome = emitElements?.getElementsByTagName('xNome')[0]?.textContent || 'N/A';
      const remetenteCidade = emitElements?.getElementsByTagName('xMun')[0]?.textContent || 'N/A';
      const remetenteUF = emitElements?.getElementsByTagName('UF')[0]?.textContent || 'N/A';
      const destNome = destElements?.getElementsByTagName('xNome')[0]?.textContent || 'N/A';
      const destCidade = destElements?.getElementsByTagName('xMun')[0]?.textContent || 'N/A';
      const destUF = destElements?.getElementsByTagName('UF')[0]?.textContent || 'N/A';
      const pesoTotal = pesoBruto > 0 ? pesoBruto : pesoLiquido;
      
      toast.success(
        <div className="flex flex-col gap-1.5">
          <p className="font-bold text-lg">✅ IMPORTADA DA SEFAZ!</p>
          <p className="text-base font-semibold">NF {numeroNota}</p>
          <div className="text-sm space-y-0.5 mt-1">
            <p>📤 {remetenteNome}</p>
            <p className="opacity-80">📍 {remetenteCidade}/{remetenteUF}</p>
            <p>📥 {destNome}</p>
            <p className="opacity-80">📍 {destCidade}/{destUF}</p>
          </div>
          <p className="text-base font-bold mt-1">
            📦 {volumesCriados.length} volumes | {pesoTotal.toLocaleString()} kg
          </p>
        </div>,
        { 
          id: 'nota-importada',
          duration: 9000,
          style: { 
            background: isDark ? '#065f46' : '#d1fae5',
            color: isDark ? '#d1fae5' : '#065f46',
            border: '3px solid #10b981',
            padding: '20px',
            fontSize: '14px',
            minWidth: '340px'
          }
        }
      );
      
      setTimeout(() => {
        setFeedbackNota(null);
        setFeedbackMensagem("");
      }, 3300);
      setSearchChaveNF("");
      setNotasBaseBusca("");
      
      setTimeout(() => salvarRascunho(), 100);

    } catch (error) {
      console.error("❌ ERRO ao processar chave NF:", error);
      try { playErrorBeep(); } catch (e) {}
      
      setFeedbackNota('error');
      setFeedbackMensagem("❌ Erro ao processar nota");
      
      toast.error(
        <div className="flex flex-col gap-1.5">
          <p className="font-bold text-lg">❌ ERRO</p>
          <p className="text-base font-semibold">Não foi possível processar a nota</p>
          <p className="text-sm mt-1">{error.message || 'Falha ao processar nota fiscal'}</p>
        </div>,
        { 
          id: 'nota-erro',
          duration: 6000,
          style: { 
            background: isDark ? '#7f1d1d' : '#fee2e2',
            color: isDark ? '#fecaca' : '#7f1d1d',
            border: '3px solid #ef4444',
            padding: '20px',
            fontSize: '14px',
            minWidth: '320px'
          }
        }
      );
      
      setTimeout(() => {
        setFeedbackNota(null);
        setFeedbackMensagem("");
      }, 3300);
      setSearchChaveNF("");
      setNotasBaseBusca("");
    } finally {
      setProcessandoChave(false);
      console.log('✅ Finalizado processamento de chave NF');
      
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

      toast.success(`✅ ${quantidade} volume(s) movido(s) com sucesso!`, { duration: 3000 });

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

      toast.success(`✅ NF ${nota.numero_nota} desvinculada com sucesso!`, { duration: 3000 });
      
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
        
        // SE HÁ VOLUMES SELECIONADOS, alocar TODOS os volumes selecionados (independente da nota arrastada)
        if (volumesSelecionados.length > 0) {
          const user = await base44.auth.me();
          
          try {
            setSaving(true);
            
            // Verificar duplicatas antes de criar
            const endereçamentosExistentes = await base44.entities.EnderecamentoVolume.filter({
              ordem_id: ordem.id,
              volume_id: { $in: volumesSelecionados }
            });

            const volumesJaEnderecadosIds = endereçamentosExistentes.map(e => e.volume_id);
            const volumesParaAlocar = volumesSelecionados.filter(id => !volumesJaEnderecadosIds.includes(id));

            if (volumesParaAlocar.length === 0) {
              playErrorBeep();
              toast.warning("Todos os volumes selecionados já foram endereçados");
              setVolumesSelecionados([]);
              setSaving(false);
              return;
            }

            if (volumesJaEnderecadosIds.length > 0) {
              toast.info(`${volumesJaEnderecadosIds.length} volume(s) já endereçado(s), alocando ${volumesParaAlocar.length}`);
            }
            
            // ATUALIZAÇÃO OTIMISTA: Criar endereçamentos temporários IMEDIATAMENTE
            const enderecamentosTemporarios = volumesParaAlocar.map(volumeId => {
              const volume = volumesLocal.find(v => v.id === volumeId);
              return {
                id: `temp-${Date.now()}-${Math.random()}`,
                ordem_id: ordem.id,
                volume_id: volumeId,
                nota_fiscal_id: volume.nota_fiscal_id,
                linha: parseInt(linhaDestino),
                coluna: colunaDestino,
                posicao_celula: `${linhaDestino}-${colunaDestino}`,
                data_enderecamento: new Date().toISOString(),
                enderecado_por: user.id
              };
            });

            setEnderecamentos(prev => [...prev, ...enderecamentosTemporarios]);
            setVolumesSelecionados([]);

            // Chamadas API em paralelo (background)
            const promises = volumesParaAlocar.map(async volumeId => {
              const volume = volumesLocal.find(v => v.id === volumeId);
              if (!volume) return null;

              const [updatedVolume, novoEnd] = await Promise.all([
                base44.entities.Volume.update(volumeId, {
                  status_volume: "carregado",
                  localizacao_atual: `Ordem ${ordem.numero_carga || ordem.id.slice(-6)} - ${linhaDestino}-${colunaDestino}`
                }),
                base44.entities.EnderecamentoVolume.create({
                  ordem_id: ordem.id,
                  volume_id: volumeId,
                  nota_fiscal_id: volume.nota_fiscal_id,
                  linha: parseInt(linhaDestino),
                  coluna: colunaDestino,
                  posicao_celula: `${linhaDestino}-${colunaDestino}`,
                  data_enderecamento: new Date().toISOString(),
                  enderecado_por: user.id
                })
              ]);

              return novoEnd;
            });

            const resultados = await Promise.all(promises);

            // Substituir endereçamentos temporários pelos reais
            setEnderecamentos(prev => {
              const semTemporarios = prev.filter(e => !e.id.startsWith('temp-'));
              return [...semTemporarios, ...resultados.filter(Boolean)];
            });

            salvarRascunho();
            playSuccessBeep();
            
            // Feedback detalhado por nota
            const notasAfetadas = {};
            volumesParaAlocar.forEach(volumeId => {
              const volume = volumesLocal.find(v => v.id === volumeId);
              if (volume?.nota_fiscal_id) {
                notasAfetadas[volume.nota_fiscal_id] = (notasAfetadas[volume.nota_fiscal_id] || 0) + 1;
              }
            });
            
            const feedbackMsg = `✅ ${volumesParaAlocar.length} volume(s) alocado(s) em ${linhaDestino}-${colunaDestino}\n` +
              `📋 ${Object.keys(notasAfetadas).length} nota(s) fiscal(is)\n` +
              Object.entries(notasAfetadas).map(([nId, count]) => {
                const n = notasFiscaisLocal.find(nf => nf.id === nId);
                return n ? `  • NF ${n.numero_nota}: ${count} vol.` : '';
              }).filter(Boolean).join('\n');
            
            toast.success(feedbackMsg, { 
              duration: 5000,
              style: { whiteSpace: 'pre-line', fontSize: '12px', lineHeight: '1.4' }
            });
            
            setSaving(false);
          } catch (error) {
            console.error("Erro ao alocar volumes:", error);
            await loadEnderecamentos();
            playErrorBeep();
            toast.error("Erro ao alocar volumes");
            setSaving(false);
          }
          return;
        }
        
        // SE NÃO HÁ SELEÇÕES, buscar volumes disponíveis e abrir modal
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
          // ATUALIZAÇÃO OTIMISTA: Remover imediatamente do estado
          const enderecamentosAtualizados = getEnderecamentosOrdemAtual().filter(e =>
            !(e.linha === parseInt(linhaOrigem) && e.coluna === colunaOrigem && e.nota_fiscal_id === notaId)
          );
          setEnderecamentos(enderecamentosAtualizados);

          // Executar deletar em paralelo (background) de forma assíncrona
          (async () => {
            try {
              const deletePromises = endsParaRemover.map(async end => {
                await base44.entities.EnderecamentoVolume.delete(end.id);
                await base44.entities.Volume.update(end.volume_id, {
                  status_volume: "criado",
                  localizacao_atual: null
                });
              });

              await Promise.all(deletePromises);

              toast.success(`✅ Nota desalocada! ${endsParaRemover.length} volumes removidos`, { duration: 3000 });
              salvarRascunho();
            } catch (error) {
              console.error("Erro ao desalocar nota:", error);
              await loadEnderecamentos();
              toast.error("Erro ao desalocar nota");
            }
          })();
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
      const alocacaoExistente = getEnderecamentosOrdemAtual().find(e => e.volume_id === volumeId);
      
      if (alocacaoExistente) {
        // ATUALIZAÇÃO OTIMISTA: Remover do estado imediatamente
        setEnderecamentos(prev => prev.filter(e => e.id !== alocacaoExistente.id));

        // Deletar do banco em paralelo (background) de forma assíncrona
        (async () => {
          try {
            await Promise.all([
              base44.entities.EnderecamentoVolume.delete(alocacaoExistente.id),
              base44.entities.Volume.update(volumeId, {
                status_volume: "criado",
                localizacao_atual: null
              })
            ]);

            toast.success("✅ Volume desalocado!", { duration: 2000 });
            setTimeout(() => salvarRascunho(), 100);
          } catch (error) {
            console.error("Erro ao desalocar volume:", error);
            await loadEnderecamentos();
            toast.error("Erro ao desalocar volume");
          }
        })();
      }
      return;
    }

    // Se soltar em uma célula do layout
    if (destination.droppableId.startsWith("cell-")) {
      const [_, linha, coluna] = destination.droppableId.split("-");

      const volume = volumesLocal.find(v => v.id === volumeId);
      if (!volume) return;

      // Executar operação de forma assíncrona
      (async () => {
        try {
          const user = await base44.auth.me();

          // ATUALIZAÇÃO OTIMISTA: Remover endereçamentos antigos e adicionar novo IMEDIATAMENTE
          const enderecamentosExistentes = enderecamentos.filter(e => 
            e.volume_id === volumeId && e.ordem_id === ordem.id
          );

          const novoEnderecamento = {
            id: `temp-${Date.now()}-${Math.random()}`,
            ordem_id: ordem.id,
            volume_id: volumeId,
            nota_fiscal_id: volume.nota_fiscal_id,
            linha: parseInt(linha),
            coluna: coluna,
            posicao_celula: `${linha}-${coluna}`,
            data_enderecamento: new Date().toISOString(),
            enderecado_por: user.id
          };

          // Atualizar estado imediatamente (remover antigos + adicionar novo)
          setEnderecamentos(prev => {
            const semEsteVolume = prev.filter(e => e.volume_id !== volumeId || e.ordem_id !== ordem.id);
            return [...semEsteVolume, novoEnderecamento];
          });

          // Chamadas API em paralelo (background)
          const deletePromises = enderecamentosExistentes
            .filter(e => !e.id.startsWith('temp-'))
            .map(e => base44.entities.EnderecamentoVolume.delete(e.id));

          const [updatedVolume, enderecamentoCriado] = await Promise.all([
            base44.entities.Volume.update(volumeId, {
              status_volume: "carregado",
              localizacao_atual: `Ordem ${ordem.numero_carga || ordem.id.slice(-6)} - ${linha}-${coluna}`
            }),
            base44.entities.EnderecamentoVolume.create({
              ordem_id: ordem.id,
              volume_id: volumeId,
              nota_fiscal_id: volume.nota_fiscal_id,
              linha: parseInt(linha),
              coluna: coluna,
              posicao_celula: `${linha}-${coluna}`,
              data_enderecamento: new Date().toISOString(),
              enderecado_por: user.id
            }),
            ...deletePromises
          ]);

          // Substituir endereçamento temporário pelo real
          setEnderecamentos(prev => {
            const semTemporario = prev.filter(e => e.id !== novoEnderecamento.id);
            return [...semTemporario, enderecamentoCriado];
          });

          if (enderecamentosExistentes.length > 0) {
            toast.success("✅ Volume realocado!", { duration: 2000 });
          } else {
            toast.success("✅ Volume posicionado!", { duration: 2000 });
          }
          
          setTimeout(() => salvarRascunho(), 100);
        } catch (error) {
          console.error("Erro ao posicionar volume:", error);
          toast.error("Erro ao posicionar volume");
          await loadEnderecamentos();
        }
      })();
    }
  };

  const handleBuscarVolumeOuEtiqueta = async (termo) => {
    if (!termo.trim()) return;

    setProcessandoBusca(true);
    const termoUpper = termo.trim().toUpperCase();

    try {
      // 1. Tentar encontrar como volume (busca exata primeiro)
      let volumesEncontrados = await base44.entities.Volume.filter({ identificador_unico: termoUpper });
      
      // BUSCA ALTERNATIVA: Se não encontrou com busca exata, tentar match por nota-sequencial
      if (volumesEncontrados.length === 0) {
        const todosVolumes = await base44.entities.Volume.list();
        const partesCodigo = termoUpper.split('-');
        
        // Buscar por nota-sequencial (ignorando timestamp)
        if (partesCodigo.length >= 3) {
          const notaSeqBuscado = `${partesCodigo[1]}-${partesCodigo[2]}`;
          
          const volumeAlternativo = todosVolumes.find(v => {
            if (!v.identificador_unico) return false;
            const partesVolume = v.identificador_unico.split('-');
            if (partesVolume.length >= 3) {
              const notaSeqVolume = `${partesVolume[1]}-${partesVolume[2]}`;
              return notaSeqBuscado === notaSeqVolume;
            }
            return false;
          });
          
          if (volumeAlternativo) {
            volumesEncontrados = [volumeAlternativo];
            console.log(`✅ Volume encontrado com busca alternativa: ${volumeAlternativo.identificador_unico}`);
          }
        }
      }
      
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

        // SEMPRE buscar TODOS os volumes da nota do banco (limite aumentado para 500)
        const todosVolumesDaNota = await base44.entities.Volume.filter({ nota_fiscal_id: notaDoVolume.id }, null, 500);

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
        toast.success(`✅ Volume ${termoUpper} selecionado! Total da NF: ${todosVolumesDaNota.length} volumes`, { duration: 3000 });
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
          toast.success(`✅ Etiqueta ${etiquetaMae.codigo}: ${volumesNaoEnderecados.length} volumes selecionados`, { duration: 3000 });
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
    if (!codigo || !codigo.trim()) {
      toast.error("Código inválido");
      return 'error';
    }

    const codigoLimpo = codigo.trim().toUpperCase();
    
    console.log('🔍 SCAN CÉLULA:', {
      codigo: codigoLimpo,
      celula: celulaAtiva ? `${celulaAtiva.linha}-${celulaAtiva.coluna}` : 'N/A'
    });

    // VALIDAÇÃO: Verificar se há célula ativa
    if (!celulaAtiva) {
      toast.error("Nenhuma célula selecionada");
      return 'error';
    }

    try {
      // 1. Tentar encontrar como ETIQUETA MÃE primeiro
      const etiquetasEncontradas = await base44.entities.EtiquetaMae.filter({ codigo: codigoLimpo });
      
      if (etiquetasEncontradas.length > 0) {
        const etiquetaMae = etiquetasEncontradas[0];
        
        if (etiquetaMae.volumes_ids && etiquetaMae.volumes_ids.length > 0) {
          // Buscar volumes do banco
          const volumesDaEtiquetaDB = await base44.entities.Volume.filter({ 
            id: { $in: etiquetaMae.volumes_ids } 
          });

          if (volumesDaEtiquetaDB.length === 0) {
            toast.warning(`Etiqueta ${etiquetaMae.codigo} sem volumes no sistema`);
            return 'error';
          }

          // Buscar notas fiscais únicas
          const notasIdsUnicas = [...new Set(volumesDaEtiquetaDB.map(v => v.nota_fiscal_id).filter(Boolean))];
          
          // VALIDAÇÃO: Se flag "Apenas Notas Vinculadas" estiver ativa
          if (apenasNotasVinculadas) {
            const notasJaVinculadasIds = notasFiscaisLocal.map(nf => nf.id);
            const notasNaoVinculadas = notasIdsUnicas.filter(id => !notasJaVinculadasIds.includes(id));
            
            if (notasNaoVinculadas.length > 0) {
              toast.error("❌ Etiqueta contém volumes de notas não vinculadas a esta ordem", { duration: 3000 });
              return 'error';
            }
          }

          // Verificar volumes já endereçados
          const idsEnderecados = enderecamentos.map(e => e.volume_id);
          const volumesParaEnderecear = volumesDaEtiquetaDB.filter(v => !idsEnderecados.includes(v.id));
          
          if (volumesParaEnderecear.length === 0) {
            playErrorBeep();
            toast.warning(`⚠️ Todos os volumes da etiqueta ${etiquetaMae.codigo} já foram endereçados`, { duration: 2000 });
            return 'duplicate';
          }

          // Verificar se precisa vincular notas
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

            setNotasFiscaisLocal(prev => [...prev, ...notasParaVincular]);
            setVolumesLocal(prev => [...prev, ...volumesDaEtiquetaDB.filter(v => !prev.some(p => p.id === v.id))]);

            // Feedback detalhado para cada nota vinculada
            notasParaVincular.forEach(nota => {
              const feedbackMsg = `✅ NF ${nota.numero_nota} AUTO-VINCULADA\n` +
                `📤 ${nota.emitente_razao_social || 'N/A'}\n` +
                `📍 ${nota.emitente_cidade || 'N/A'}/${nota.emitente_uf || 'N/A'}\n` +
                `📥 ${nota.destinatario_razao_social || 'N/A'}\n` +
                `📍 ${nota.destinatario_cidade || 'N/A'}/${nota.destinatario_uf || 'N/A'}`;
              
              toast.success(feedbackMsg, { 
                duration: 6000,
                style: { whiteSpace: 'pre-line', fontSize: '12px', lineHeight: '1.4' }
              });
            });
            
            playSuccessBeep();
          } else {
            // Garantir que os volumes estão no estado local
            const volumesIdsLocais = volumesLocal.map(v => v.id);
            const volumesNovos = volumesDaEtiquetaDB.filter(v => !volumesIdsLocais.includes(v.id));
            if (volumesNovos.length > 0) {
              setVolumesLocal(prev => [...prev, ...volumesNovos]);
            }
          }

          // Endereçar volumes em batch na célula selecionada
          const user = await base44.auth.me();
          const { linha, coluna } = celulaAtiva;

          for (const volume of volumesParaEnderecear) {
            await base44.entities.Volume.update(volume.id, {
              status_volume: "carregado",
              ordem_id: ordem.id,
              localizacao_atual: `Ordem ${ordem.numero_carga || ordem.id.slice(-6)} - ${linha}-${coluna}`
            });

            await base44.entities.EnderecamentoVolume.create({
              ordem_id: ordem.id,
              volume_id: volume.id,
              nota_fiscal_id: volume.nota_fiscal_id,
              linha: linha,
              coluna: coluna,
              posicao_celula: `${linha}-${coluna}`,
              data_enderecamento: new Date().toISOString(),
              enderecado_por: user.id
            });
          }

          // Recarregar endereçamentos do banco
          const todosEnderecamentos = await base44.entities.EnderecamentoVolume.filter({ ordem_id: ordem.id });
          setEnderecamentos(todosEnderecamentos);

          salvarRascunho();
          playSuccessBeep();
          
          // Feedback detalhado da etiqueta mãe
          const notasEtiqueta = [...new Set(volumesParaEnderecear.map(v => v.nota_fiscal_id))];
          const notasInfo = notasEtiqueta.map(nId => {
            const n = notasFiscaisLocal.find(nf => nf.id === nId);
            return n ? `NF ${n.numero_nota}` : '';
          }).filter(Boolean).join(', ');
          
          const feedbackMsg = `✅ ETIQUETA MÃE ${etiquetaMae.codigo}\n` +
            `📦 ${volumesParaEnderecear.length} volumes alocados em ${linha}-${coluna}\n` +
            `📋 ${notasInfo}\n` +
            `✓ Continue escaneando...`;
          
          toast.success(feedbackMsg, { 
            duration: 5000,
            style: { whiteSpace: 'pre-line', fontSize: '12px', lineHeight: '1.4', fontWeight: '500' }
          });
          
          return 'success';
        } else {
          toast.warning(`Etiqueta ${etiquetaMae.codigo} sem volumes vinculados`);
          return 'error';
        }
      }

      // 2. Tentar encontrar como VOLUME INDIVIDUAL
      console.log('📦 Buscando volume individual...');
      let volume = volumesLocal.find(v => 
        v.identificador_unico?.toUpperCase() === codigoLimpo
      );

      // Se não encontrou, buscar em TODOS os volumes do estoque
      if (!volume) {
        console.log('  ⚠️ Não encontrado no cache local, buscando no banco...');
        let volumesEncontrados = await base44.entities.Volume.filter({ 
          identificador_unico: codigoLimpo 
        });

        // BUSCA ALTERNATIVA: Match por nota-sequencial (ignorando timestamp)
        if (volumesEncontrados.length === 0) {
          console.log('  ⚠️ Busca exata falhou, tentando busca alternativa...');
          const todosVolumes = await base44.entities.Volume.list();
          console.log(`  📊 Total de volumes no banco: ${todosVolumes.length}`);
          
          const partesCodigo = codigoLimpo.split('-');
          console.log('  🔍 Partes do código escaneado:', partesCodigo);
          
          const volumeAlternativo = todosVolumes.find(v => {
            if (!v.identificador_unico) return false;
            
            const idVolume = v.identificador_unico.toUpperCase();
            const idCodigo = codigoLimpo;
            
            // Match exato (já testado antes)
            if (idVolume === idCodigo) return true;
            
            // Match parcial (um contém o outro)
            if (idVolume.includes(idCodigo) || idCodigo.includes(idVolume)) return true;
            
            // Match por componentes (remover prefixo VOL-)
            const volumeSemPrefixo = idVolume.replace(/^VOL-/i, '');
            const codigoSemPrefixo = idCodigo.replace(/^VOL-/i, '');
            
            if (volumeSemPrefixo === codigoSemPrefixo) return true;
            if (volumeSemPrefixo.includes(codigoSemPrefixo) || codigoSemPrefixo.includes(volumeSemPrefixo)) return true;
            
            // Match por partes principais (nota-sequencial) - IGNORAR timestamp
            // Formato esperado: VOL-NOTA-SEQUENCIAL-TIMESTAMP ou similares
            if (partesCodigo.length >= 3) {
              const partesVolume = v.identificador_unico.toUpperCase().split('-');
              
              if (partesVolume.length >= 3) {
                // Comparar apenas nota e sequencial (índices 1 e 2)
                const notaSeqVolume = `${partesVolume[1]}-${partesVolume[2]}`;
                const notaSeqBuscado = `${partesCodigo[1]}-${partesCodigo[2]}`;
                
                if (notaSeqVolume === notaSeqBuscado) {
                  console.log(`  🎯 Match por nota-sequencial encontrado!`);
                  console.log(`    • Escaneado: ${notaSeqBuscado}`);
                  console.log(`    • Banco: ${notaSeqVolume}`);
                  return true;
                }
              }
            }
            
            return false;
          });
          
          if (volumeAlternativo) {
            volumesEncontrados = [volumeAlternativo];
            console.log(`✅ Volume encontrado com busca alternativa!`);
            console.log(`  • Escaneado: ${codigoLimpo}`);
            console.log(`  • Encontrado: ${volumeAlternativo.identificador_unico}`);
            toast.info(`Volume localizado: ${volumeAlternativo.identificador_unico}`, { duration: 2000 });
          } else {
            console.log('  ❌ Nenhum volume encontrado com qualquer método de busca');
            console.log('  📋 Exemplos no banco:', todosVolumes.slice(0, 5).map(v => v.identificador_unico));
          }
        }

        if (volumesEncontrados.length > 0) {
          volume = volumesEncontrados[0];
          
          // Verificar se já está endereçado
          const jaEnderecado = enderecamentos.some(e => e.volume_id === volume.id);
          if (jaEnderecado) {
            playErrorBeep();
            toast.warning(`⚠️ Volume ${codigoLimpo} já foi endereçado`, { duration: 2000 });
            return 'duplicate';
          }
          
          // Buscar a nota fiscal deste volume
          const notaDoVolume = await base44.entities.NotaFiscal.get(volume.nota_fiscal_id);
          
          if (!notaDoVolume) {
            toast.error("Nota fiscal do volume não encontrada");
            return 'error';
          }

          // VALIDAÇÃO: Se flag "Apenas Notas Vinculadas" estiver ativa
          if (apenasNotasVinculadas) {
            const notaVinculada = notasFiscaisLocal.find(nf => nf.id === notaDoVolume.id);
            if (!notaVinculada) {
              toast.error("❌ Volume não pertence a nenhuma nota fiscal vinculada a esta ordem", { duration: 3000 });
              return 'error';
            }
          }

          // Buscar TODOS os volumes da nota do banco (limite aumentado para 500)
          const todosVolumesNota = await base44.entities.Volume.filter({ 
            nota_fiscal_id: notaDoVolume.id 
          }, null, 500);

          console.log('📦 Nova nota encontrada:', {
            nota: notaDoVolume.numero_nota,
            volumesEncontrados: todosVolumesNota.length
          });

          // Verificar se a nota já está vinculada
          const notaJaVinculada = notasFiscaisLocal.some(nf => nf.id === notaDoVolume.id);

          if (!notaJaVinculada) {
            // Vincular automaticamente a nota à ordem
            await base44.entities.NotaFiscal.update(notaDoVolume.id, {
              ordem_id: ordem.id,
              status_nf: "aguardando_expedicao"
            });

            const notasIds = [...(ordem.notas_fiscais_ids || []), notaDoVolume.id];
            await base44.entities.OrdemDeCarregamento.update(ordem.id, {
              notas_fiscais_ids: notasIds
            });

            console.log('✅ Nota vinculada à ordem, atualizando estados locais');

            setNotasFiscaisLocal(prev => [...prev, notaDoVolume]);
            setVolumesLocal(prev => [...prev, ...todosVolumesNota.filter(v => !prev.some(p => p.id === v.id))]);

            // Feedback detalhado da nota vinculada
            const feedbackMsg = `✅ NF ${notaDoVolume.numero_nota} AUTO-VINCULADA\n` +
              `📤 ${notaDoVolume.emitente_razao_social || 'N/A'}\n` +
              `📍 ${notaDoVolume.emitente_cidade || 'N/A'}/${notaDoVolume.emitente_uf || 'N/A'}\n` +
              `📥 ${notaDoVolume.destinatario_razao_social || 'N/A'}\n` +
              `📍 ${notaDoVolume.destinatario_cidade || 'N/A'}/${notaDoVolume.destinatario_uf || 'N/A'}\n` +
              `📦 ${todosVolumesNota.length} volumes carregados`;
            
            toast.success(feedbackMsg, { 
              duration: 7000,
              style: { whiteSpace: 'pre-line', fontSize: '12px', lineHeight: '1.4' }
            });
            
            playSuccessBeep();
          } else {
            // Garantir que TODOS os volumes da nota estão no estado local
            const volumesIdsLocais = volumesLocal.map(v => v.id);
            const volumesParaAdicionar = todosVolumesNota.filter(v => !volumesIdsLocais.includes(v.id));

            if (volumesParaAdicionar.length > 0) {
              setVolumesLocal(prev => [...prev, ...volumesParaAdicionar]);
            }
          }
        } else {
          toast.error("Volume não encontrado no estoque");
          return 'error';
        }
      }

      // GARANTIR QUE O VOLUME EXISTE
      if (!volume) {
        toast.error("Volume não encontrado");
        return 'error';
      }

      // Verificar duplicata
      const jaEnderecado = enderecamentos.some(e => e.volume_id === volume.id);
      if (jaEnderecado) {
        playErrorBeep();
        toast.warning(`⚠️ Volume ${codigoLimpo} já foi endereçado`, { duration: 2000 });
        return 'duplicate';
      }

      // VALIDAÇÃO: Se flag "Apenas Notas Vinculadas" estiver ativa
      if (apenasNotasVinculadas) {
        const notaVinculada = notasFiscaisLocal.find(nf => nf.id === volume.nota_fiscal_id);
        if (!notaVinculada) {
          toast.error("❌ Volume não pertence a nenhuma nota fiscal vinculada a esta ordem", { duration: 3000 });
          return 'error';
        }
      }

      // Endereçar o volume na célula ativa
      const user = await base44.auth.me();
      const { linha, coluna } = celulaAtiva;

      await base44.entities.Volume.update(volume.id, {
        status_volume: "carregado",
        ordem_id: ordem.id,
        localizacao_atual: `Ordem ${ordem.numero_carga || ordem.id.slice(-6)} - ${linha}-${coluna}`
      });

      await base44.entities.EnderecamentoVolume.create({
        ordem_id: ordem.id,
        volume_id: volume.id,
        nota_fiscal_id: volume.nota_fiscal_id,
        linha: linha,
        coluna: coluna,
        posicao_celula: `${linha}-${coluna}`,
        data_enderecamento: new Date().toISOString(),
        enderecado_por: user.id
      });

      // Recarregar endereçamentos
      const todosEnderecamentos = await base44.entities.EnderecamentoVolume.filter({ ordem_id: ordem.id });
      setEnderecamentos(todosEnderecamentos);

      salvarRascunho();
      
      // Buscar informações da nota para feedback detalhado
      const notaDoVolume = notasFiscaisLocal.find(nf => nf.id === volume.nota_fiscal_id);
      
      playSuccessBeep();
      
      if (notaDoVolume) {
        const feedbackMsg = `✅ Volume alocado em ${linha}-${coluna}\n` +
          `📋 NF ${notaDoVolume.numero_nota}\n` +
          `📤 ${notaDoVolume.emitente_razao_social?.substring(0, 30) || 'N/A'}\n` +
          `📥 ${notaDoVolume.destinatario_razao_social?.substring(0, 30) || 'N/A'}\n` +
          `📦 Continue escaneando...`;
        
        toast.success(feedbackMsg, { 
          duration: 4000,
          style: { whiteSpace: 'pre-line', fontSize: '12px', lineHeight: '1.4' }
        });
      } else {
        toast.success(`✅ Volume ${codigoLimpo} alocado em ${linha}-${coluna}! Continue escaneando...`, { duration: 3000 });
      }
      
      return 'success';
    } catch (error) {
      console.error("Erro ao processar scan:", error);
      playErrorBeep();
      toast.error(`Erro: ${error.message}`);
      return 'error';
    }
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
      if (ordemAtual.motorista_id) {
        try {
          const motoristas = await base44.entities.Motorista.filter({ id: ordemAtual.motorista_id });
          motorista = motoristas[0];
        } catch (error) {
          console.log("Erro ao buscar motorista:", error);
        }
      }

      // Buscar cavalo
      if (ordemAtual.cavalo_id) {
        try {
          const veiculos = await base44.entities.Veiculo.filter({ id: ordemAtual.cavalo_id });
          cavalo = veiculos[0];
        } catch (error) {
          console.log("Erro ao buscar cavalo:", error);
        }
      }

      // Buscar implementos
      const implementoIds = [ordemAtual.implemento1_id, ordemAtual.implemento2_id, ordemAtual.implemento3_id].filter(Boolean);
      if (implementoIds.length > 0) {
        try {
          const veiculos = await base44.entities.Veiculo.list();
          implementos = veiculos.filter(v => implementoIds.includes(v.id));
        } catch (error) {
          console.log("Erro ao buscar implementos:", error);
        }
      }

      const printWindow = window.open('', '_blank');
      const htmlContent = gerarPDFListaNotas(user, empresa, motorista, cavalo, implementos);
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      printWindow.print();
    } catch (error) {
      console.error("Erro ao imprimir lista:", error);
      toast.error("Erro ao gerar PDF");
    }
  };

  const handleAbrirEditarOrdem = async () => {
    try {
      // SEMPRE buscar dados mais atualizados do banco PRIMEIRO
      const ordemFresca = await base44.entities.OrdemDeCarregamento.get(ordem.id);
      setOrdemAtual(ordemFresca);
      Object.assign(ordem, ordemFresca);

      // PRIORIZAR campos _temp (editáveis) - só buscar cadastro se _temp estiver vazio
      let motoristaNome = ordemFresca.motorista_nome_temp || "";
      let cavaloPlaca = ordemFresca.cavalo_placa_temp || "";
      let impl1Placa = ordemFresca.implemento1_placa_temp || "";
      let impl2Placa = ordemFresca.implemento2_placa_temp || "";
      let impl3Placa = ordemFresca.implemento3_placa_temp || "";

      // Buscar motorista APENAS se _temp estiver vazio
      if (!motoristaNome && ordemFresca.motorista_id) {
        try {
          const motoristas = await base44.entities.Motorista.filter({ id: ordemFresca.motorista_id });
          if (motoristas[0]) motoristaNome = motoristas[0].nome;
        } catch (error) {
          console.log("Erro ao buscar motorista:", error);
        }
      }

      // Buscar cavalo APENAS se _temp estiver vazio
      if (!cavaloPlaca && ordemFresca.cavalo_id) {
        try {
          const veiculos = await base44.entities.Veiculo.filter({ id: ordemFresca.cavalo_id });
          if (veiculos[0]) cavaloPlaca = veiculos[0].placa;
        } catch (error) {
          console.log("Erro ao buscar cavalo:", error);
        }
      }

      // Buscar implementos APENAS se _temp estiver vazio
      if ((!impl1Placa && ordemFresca.implemento1_id) || 
          (!impl2Placa && ordemFresca.implemento2_id) || 
          (!impl3Placa && ordemFresca.implemento3_id)) {
        try {
          const implementoIds = [ordemFresca.implemento1_id, ordemFresca.implemento2_id, ordemFresca.implemento3_id].filter(Boolean);
          const veiculos = await base44.entities.Veiculo.list();
          const implementos = veiculos.filter(v => implementoIds.includes(v.id));
          
          if (!impl1Placa) {
            const impl1 = implementos.find(i => i.id === ordemFresca.implemento1_id);
            if (impl1) impl1Placa = impl1.placa;
          }
          
          if (!impl2Placa) {
            const impl2 = implementos.find(i => i.id === ordemFresca.implemento2_id);
            if (impl2) impl2Placa = impl2.placa;
          }
          
          if (!impl3Placa) {
            const impl3 = implementos.find(i => i.id === ordemFresca.implemento3_id);
            if (impl3) impl3Placa = impl3.placa;
          }
        } catch (error) {
          console.log("Erro ao buscar implementos:", error);
        }
      }

      console.log("📝 Valores carregados para edição:", {
        motorista: motoristaNome,
        cavalo: cavaloPlaca,
        impl1: impl1Placa,
        impl2: impl2Placa,
        impl3: impl3Placa
      });

      setDadosOrdemEdit({
        cliente: ordemFresca.cliente || "",
        origem: ordemFresca.origem || "",
        origem_cidade: ordemFresca.origem_cidade || "",
        destino: ordemFresca.destino || "",
        destino_cidade: ordemFresca.destino_cidade || "",
        produto: ordemFresca.produto || "",
        motorista_nome_temp: motoristaNome,
        cavalo_placa_temp: cavaloPlaca,
        implemento1_placa_temp: impl1Placa,
        implemento2_placa_temp: impl2Placa,
        implemento3_placa_temp: impl3Placa
      });
      setShowEditarOrdemModal(true);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      toast.error("Erro ao carregar dados da ordem");
    }
  };

  const handleSalvarEdicaoOrdem = async () => {
    try {
      console.log("💾 Salvando dados:", dadosOrdemEdit);
      
      // Salvar no banco
      await base44.entities.OrdemDeCarregamento.update(ordem.id, dadosOrdemEdit);
      
      // Buscar ordem atualizada do banco para garantir sincronização
      const ordemAtualizada = await base44.entities.OrdemDeCarregamento.get(ordem.id);
      console.log("✅ Ordem atualizada do banco:", {
        cliente: ordemAtualizada.cliente,
        origem: ordemAtualizada.origem,
        destino: ordemAtualizada.destino,
        motorista: ordemAtualizada.motorista_nome_temp,
        cavalo: ordemAtualizada.cavalo_placa_temp,
        impl1: ordemAtualizada.implemento1_placa_temp,
        impl2: ordemAtualizada.implemento2_placa_temp,
        impl3: ordemAtualizada.implemento3_placa_temp
      });
      
      setOrdemAtual(ordemAtualizada);
      
      // Atualizar prop ordem também
      Object.assign(ordem, ordemAtualizada);
      
      toast.success("Dados da ordem atualizados!");
      setShowEditarOrdemModal(false);
    } catch (error) {
      console.error("Erro ao atualizar ordem:", error);
      toast.error("Erro ao atualizar dados da ordem");
    }
  };

  const handleGerarArquivoChaves = async () => {
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

      const dataAtual = new Date().toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });

      // Gerar conteúdo do arquivo TXT
      let conteudo = `========================================\n`;
      conteudo += `CHAVES DE ACESSO - NOTAS FISCAIS\n`;
      conteudo += `========================================\n\n`;
      
      conteudo += `ORDEM DE CARREGAMENTO: ${ordem.numero_carga || `#${ordem.id.slice(-6)}`}\n`;
      conteudo += `CLIENTE: ${ordem.cliente || '-'}\n`;
      conteudo += `ORIGEM: ${ordem.origem_cidade || ordem.origem || '-'}\n`;
      conteudo += `DESTINO: ${ordem.destino_cidade || ordem.destino || '-'}\n`;
      
      if (empresa) {
        conteudo += `EMPRESA: ${empresa.nome_fantasia || empresa.razao_social}\n`;
        if (empresa.cnpj) conteudo += `CNPJ: ${empresa.cnpj}\n`;
      }
      
      conteudo += `GERADO POR: ${user.full_name || user.email}\n`;
      conteudo += `DATA/HORA: ${dataAtual}\n`;
      conteudo += `\n========================================\n`;
      conteudo += `TOTAL DE NOTAS: ${notasFiscaisLocal.length}\n`;
      conteudo += `========================================\n\n`;

      // Listar chaves das notas fiscais
      conteudo += `CHAVES DE ACESSO:\n\n`;
      
      notasFiscaisLocal.forEach((nota, index) => {
        if (nota.chave_nota_fiscal) {
          conteudo += `${nota.chave_nota_fiscal}\n`;
        }
      });

      conteudo += `\n========================================\n`;
      conteudo += `FIM DO ARQUIVO\n`;
      conteudo += `========================================\n`;

      // Criar blob e fazer download
      const blob = new Blob([conteudo], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `chaves_nf_${ordem.numero_carga || ordem.id.slice(-6)}_${new Date().toISOString().slice(0, 10)}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success(`✅ Arquivo TXT gerado com ${notasFiscaisLocal.length} chave(s)!`, { duration: 3000 });
    } catch (error) {
      console.error("Erro ao gerar arquivo TXT:", error);
      toast.error("Erro ao gerar arquivo TXT");
    }
  };

  const gerarPDFListaNotas = (user, empresa, motorista, cavalo, implementos) => {
    const dataAtual = new Date().toLocaleString('pt-BR');

    // PRIORIZAR campos _temp (editáveis) sobre cadastro
    const placasCavalo = ordemAtual.cavalo_placa_temp || cavalo?.placa || '';
    const placasImplementos = [];
    
    // Implemento 1: priorizar _temp
    if (ordemAtual.implemento1_placa_temp) {
      placasImplementos.push(ordemAtual.implemento1_placa_temp);
    } else if (ordemAtual.implemento1_id && implementos.find(i => i.id === ordemAtual.implemento1_id)) {
      placasImplementos.push(implementos.find(i => i.id === ordemAtual.implemento1_id).placa);
    }
    
    // Implemento 2: priorizar _temp
    if (ordemAtual.implemento2_placa_temp) {
      placasImplementos.push(ordemAtual.implemento2_placa_temp);
    } else if (ordemAtual.implemento2_id && implementos.find(i => i.id === ordemAtual.implemento2_id)) {
      placasImplementos.push(implementos.find(i => i.id === ordemAtual.implemento2_id).placa);
    }
    
    // Implemento 3: priorizar _temp
    if (ordemAtual.implemento3_placa_temp) {
      placasImplementos.push(ordemAtual.implemento3_placa_temp);
    } else if (ordemAtual.implemento3_id && implementos.find(i => i.id === ordemAtual.implemento3_id)) {
      placasImplementos.push(implementos.find(i => i.id === ordemAtual.implemento3_id).placa);
    }
    
    const placas = [placasCavalo, ...placasImplementos].filter(Boolean).join(' / ');
    const motoristaInfo = ordemAtual.motorista_nome_temp || motorista?.nome || '-';

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
            <p><strong>Cliente:</strong> ${ordemAtual.cliente || '-'} | <strong>Destino:</strong> ${ordemAtual.destino_cidade || ordemAtual.destino || '-'}</p>
            <p><strong>Motorista:</strong> ${motoristaInfo} | <strong>Placas:</strong> ${placas || 'Não informadas'}</p>
          </div>

          <table>
            <thead>
              <tr>
                <th style="width: 50px;">NF</th>
                <th style="width: 40px;">Origem</th>
                <th style="width: 180px;">Remetente / Origem</th>
                <th style="width: 180px;">Destinatário / Destino</th>
                <th style="width: 60px;">Volumes<br>Total/End.</th>
                <th style="width: 60px;">Peso<br>(kg)</th>
                <th style="width: 70px;">Valor<br>(R$)</th>
                <th style="width: 160px;">Chave NF-e</th>
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
          <td style="font-size: 7px; font-family: monospace; word-break: break-all; line-height: 1.2;">${nota.chave_nota_fiscal || '-'}</td>
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

    // PRIORIZAR campos _temp (editáveis) sobre cadastro
    const placasCavalo = ordemAtual.cavalo_placa_temp || cavalo?.placa || '';
    const placasImplementos = [];
    
    // Implemento 1: priorizar _temp
    if (ordemAtual.implemento1_placa_temp) {
      placasImplementos.push(ordemAtual.implemento1_placa_temp);
    } else if (ordemAtual.implemento1_id && implementos.find(i => i.id === ordemAtual.implemento1_id)) {
      placasImplementos.push(implementos.find(i => i.id === ordemAtual.implemento1_id).placa);
    }
    
    // Implemento 2: priorizar _temp
    if (ordemAtual.implemento2_placa_temp) {
      placasImplementos.push(ordemAtual.implemento2_placa_temp);
    } else if (ordemAtual.implemento2_id && implementos.find(i => i.id === ordemAtual.implemento2_id)) {
      placasImplementos.push(implementos.find(i => i.id === ordemAtual.implemento2_id).placa);
    }
    
    // Implemento 3: priorizar _temp
    if (ordemAtual.implemento3_placa_temp) {
      placasImplementos.push(ordemAtual.implemento3_placa_temp);
    } else if (ordemAtual.implemento3_id && implementos.find(i => i.id === ordemAtual.implemento3_id)) {
      placasImplementos.push(implementos.find(i => i.id === ordemAtual.implemento3_id).placa);
    }
    
    const placas = [placasCavalo, ...placasImplementos].filter(Boolean).join(' / ');

    const motoristaInfo = ordemAtual.motorista_nome_temp || motorista?.nome || 'Não alocado';

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
              <div class="info-line"><strong>Cliente:</strong> ${ordemAtual.cliente || '-'}</div>
              <div class="info-line"><strong>Origem:</strong> ${ordemAtual.origem_cidade || ordemAtual.origem || '-'}</div>
              <div class="info-line"><strong>Destino:</strong> ${ordemAtual.destino_cidade || ordemAtual.destino || '-'}</div>
              <div class="info-line"><strong>Produto:</strong> ${ordemAtual.produto || '-'}</div>
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
            
            // Calcular despesas palete desta posição
            const despesasPalete = getDespesasPaletePorNotaPosicao(nota.id, linha, coluna);
            const qtdPaletes = despesasPalete.reduce((sum, d) => sum + (d.quantidade || 0), 0);
            
            html += `<div class="nota-item">`;
            html += `<span class="nota-num">${nota.numero_nota}</span>`;
            html += `<span class="nota-forn" title="${nota.emitente_razao_social}">${fornecedorAbreviado}</span>`;
            if (qtdPaletes > 0) {
              html += `<span style="background: rgba(245, 158, 11, 0.2); color: #f59e0b; padding: 1px 4px; border-radius: 3px; font-size: 8px; font-weight: bold; margin: 0 2px;">📦${qtdPaletes}</span>`;
            }
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
          
          // Calcular despesas palete desta posição
          const despesasPalete = getDespesasPaletePorNotaPosicao(nota.id, linha, coluna);
          const qtdPaletes = despesasPalete.reduce((sum, d) => sum + (d.quantidade || 0), 0);
          
          html += `<div class="nota-group">`;
          html += `<div class="nota-label">NF ${nota.numero_nota} (${volumesNota.length} vol.)`;
          if (qtdPaletes > 0) {
            html += ` <span style="background: rgba(245, 158, 11, 0.2); color: #f59e0b; padding: 1px 4px; border-radius: 3px; font-size: 8px; font-weight: bold;">📦${qtdPaletes} palete(s)</span>`;
          }
          html += `</div>`;
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
              <Button
                variant="outline"
                onClick={handleGerarArquivoChaves}
                size="sm"
                className="h-7"
                style={{ borderColor: theme.cardBorder, color: theme.text }}
                title="Gerar arquivo TXT com chaves"
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
              <TabsContent value="volumes" className="flex-1 overflow-hidden p-3 space-y-2" style={{ margin: 0, display: 'flex', flexDirection: 'column' }}>
                  <div className="border-b pb-2 space-y-2 flex-shrink-0" style={{ borderColor: theme.cardBorder }}>
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
                    className="flex-1 overflow-y-auto space-y-2 pb-4"
                    style={{ overflowY: 'auto', WebkitOverflowScrolling: 'touch' }}
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
                        const isExpanded = notasExpandidas[expandKey] === true;
                        
                        return (
                          <div key={notaId} className="border rounded" style={{ borderColor: theme.cardBorder }}>
                            {/* Header da Nota - arrastável */}
                            <Draggable draggableId={`nota-sidebar-mobile-${notaId}`} index={Object.keys(volumesPorNota).indexOf(notaId)}>
                              {(provided, snapshot) => {
                                // Calcular despesas palete de TODAS as posições desta nota
                                const todasDespesasPalete = despesasExtras.filter(d => {
                                  if (d.nota_fiscal_id !== notaId) return false;
                                  const tipoLower = d.tipo_despesa_nome?.toLowerCase() || '';
                                  return tipoLower.includes('palete') || tipoLower.includes('paletiza');
                                });
                                const qtdPaleteTotal = todasDespesasPalete.reduce((sum, d) => sum + (d.quantidade || 0), 0);

                                return (
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
                                    {qtdPaleteTotal > 0 && (
                                       <div 
                                         className="flex items-center gap-0.5 px-1.5 py-0.5 rounded mr-1"
                                         style={{ backgroundColor: 'rgba(255, 165, 0, 0.2)' }}
                                         title={`${qtdPaleteTotal} palete(s)`}
                                       >
                                         <Package className="w-3 h-3" style={{ color: '#f59e0b' }} />
                                         <span className="text-[9px] font-bold" style={{ color: '#f59e0b' }}>
                                           {qtdPaleteTotal}
                                         </span>
                                       </div>
                                     )}
                                    <Badge 
                                     className={`${snapshot.isDragging ? 'bg-white/20' : (volumes.length > 0 ? 'bg-orange-600' : 'bg-green-600')} text-white text-[10px] h-5 px-2 select-none`}
                                     style={{ pointerEvents: 'none' }}
                                    >
                                     {volumes.length}/{volumesLocal.filter(v => v.nota_fiscal_id === notaId).length}
                                    </Badge>
                                  </div>
                                </div>
                                );
                              }}
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
                        <p className="text-sm mb-3">
                          {getVolumesNaoEnderecados().length === 0 && notasFiscaisLocal.length > 0
                            ? "Todos os volumes foram posicionados!"
                            : notasFiscaisLocal.length === 0
                            ? "Vincule notas fiscais para carregar volumes"
                            : "Carregando volumes..."}
                        </p>
                        {notasFiscaisLocal.length > 0 && volumesLocal.filter(v => notasFiscaisLocal.some(nf => nf.id === v.nota_fiscal_id)).length === 0 && (
                          <Button
                            size="sm"
                            onClick={async () => {
                              toast.loading("Recarregando volumes...", { id: 'reload-vols-mobile' });
                              try {
                                const notasIds = notasFiscaisLocal.map(n => n.id);
                                const volumesDB = await base44.entities.Volume.filter({ 
                                  nota_fiscal_id: { $in: notasIds } 
                                });

                                setVolumesLocal(prev => {
                                  const volumesIdsLocais = prev.map(v => v.id);
                                  const volumesNovos = volumesDB.filter(v => !volumesIdsLocais.includes(v.id));
                                  return [...prev, ...volumesNovos];
                                });

                                toast.success(`✅ ${volumesDB.length} volumes carregados!`, { id: 'reload-vols-mobile', duration: 3000 });
                              } catch (error) {
                                console.error("Erro ao recarregar volumes:", error);
                                toast.error("Erro ao carregar volumes", { id: 'reload-vols-mobile' });
                              }
                            }}
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            <Package className="w-4 h-4 mr-2" />
                            Recarregar Volumes
                          </Button>
                        )}
                      </div>
                    )}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </TabsContent>

            {/* Aba Lista de Notas Mobile */}
            <TabsContent value="notas" className="flex-1 overflow-y-auto" style={{ margin: 0, padding: 0 }}>
              <div className="space-y-1.5 p-2">
              {/* Cabeçalho com Totais Mobile */}
              <div className="p-2 mb-2 border rounded" style={{ borderColor: theme.cardBorder, backgroundColor: isDark ? '#1e40af22' : '#eff6ff' }}>
                <div className="grid grid-cols-2 gap-2 text-[10px]">
                  <div>
                    <span style={{ color: theme.textMuted }}>Notas:</span>
                    <span className="ml-1 font-bold" style={{ color: theme.text }}>
                      {notasFiscaisLocal.length}
                    </span>
                  </div>
                  <div>
                    <span style={{ color: theme.textMuted }}>Volumes:</span>
                    <span className="ml-1 font-bold" style={{ color: theme.text }}>
                      {volumesLocal.filter(v => notasFiscaisLocal.some(nf => nf.id === v.nota_fiscal_id)).length}
                    </span>
                  </div>
                  <div>
                    <span style={{ color: theme.textMuted }}>Peso:</span>
                    <span className="ml-1 font-bold" style={{ color: theme.text }}>
                      {notasFiscaisLocal.reduce((sum, nf) => sum + (nf.peso_total_nf || 0), 0).toLocaleString()} kg
                    </span>
                  </div>
                  <div>
                    <span style={{ color: theme.textMuted }}>m³:</span>
                    <span className="ml-1 font-bold" style={{ color: theme.text }}>
                      {volumesLocal.filter(v => notasFiscaisLocal.some(nf => nf.id === v.nota_fiscal_id))
                        .reduce((sum, v) => sum + (v.cubagem || 0), 0).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
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
            </TabsContent>

            {/* Aba Layout Mobile */}
            <TabsContent value="layout" className="flex-1 overflow-hidden mt-0">
              <div className="h-full flex flex-col">
                <div className="px-2 py-1.5 border-b flex items-center gap-2" style={{ borderColor: theme.cardBorder }}>
                  <Label className="text-xs whitespace-nowrap" style={{ color: theme.text }}>Linhas:</Label>
                  <Input
                    type="text"
                    inputMode="numeric"
                    value={numLinhasInput}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '');
                      setNumLinhasInput(value);
                      if (value) {
                        const val = parseInt(value);
                        setNumLinhas(Math.max(1, Math.min(20, val)));
                      }
                    }}
                    onBlur={() => {
                      if (!numLinhasInput) {
                        setNumLinhasInput("1");
                        setNumLinhas(1);
                      }
                    }}
                    className="w-16 h-7 text-xs text-center"
                    style={{ backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.text }}
                  />
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
                        {feedbackMensagem && (
                        <div 
                          className="text-sm font-bold mt-2 px-2 py-1 rounded"
                          style={{ 
                            color: feedbackNota === 'success' ? '#10b981' : 
                                   feedbackNota === 'duplicate' ? '#a855f7' : 
                                   feedbackNota === 'error' ? '#ef4444' : 
                                   theme.text,
                            backgroundColor: feedbackNota === 'success' ? 'rgba(16, 185, 129, 0.1)' :
                                            feedbackNota === 'duplicate' ? 'rgba(168, 85, 247, 0.1)' :
                                            feedbackNota === 'error' ? 'rgba(239, 68, 68, 0.1)' :
                                            'transparent'
                          }}
                        >
                          {feedbackMensagem}
                        </div>
                        )}
                        {processandoChave && (
                        <div className="flex items-center gap-2 mt-2">
                          <div className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                          <span className="text-xs" style={{ color: theme.text }}>Processando...</span>
                        </div>
                        )}
                        {!feedbackMensagem && !processandoChave && (
                        <p className="text-[9px] mt-1" style={{ color: theme.textMuted }}>
                          Cole ou bipe a chave - pesquisa automática
                        </p>
                        )}
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
                          className="h-9 text-sm pl-7 transition-all"
                          style={{ 
                            backgroundColor: theme.inputBg, 
                            borderColor: feedbackNota === 'success' ? '#10b981' : 
                                         feedbackNota === 'duplicate' ? '#a855f7' : 
                                         feedbackNota === 'error' ? '#ef4444' : 
                                         theme.inputBorder,
                            borderWidth: feedbackNota ? '3px' : '1px',
                            color: theme.text 
                          }}
                          autoFocus
                          />
                          </div>
                          {feedbackMensagem && (
                          <div 
                          className="text-sm font-bold mt-2 px-2 py-1 rounded"
                          style={{ 
                            color: feedbackNota === 'success' ? '#10b981' : 
                                   feedbackNota === 'duplicate' ? '#a855f7' : 
                                   feedbackNota === 'error' ? '#ef4444' : 
                                   theme.text,
                            backgroundColor: feedbackNota === 'success' ? 'rgba(16, 185, 129, 0.1)' :
                                            feedbackNota === 'duplicate' ? 'rgba(168, 85, 247, 0.1)' :
                                            feedbackNota === 'error' ? 'rgba(239, 68, 68, 0.1)' :
                                            'transparent'
                          }}
                          >
                          {feedbackMensagem}
                          </div>
                          )}
                          {!feedbackMensagem && (
                          <p className="text-[9px] mt-1" style={{ color: theme.textMuted }}>
                          Digite número ou bipe chave - Enter para importar
                          </p>
                          )}
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
                    // VERIFICAR SE JÁ ESTÁ VINCULADA
                    const jaVinculada = notasFiscaisLocal.some(nf => nf.id === nota.id);

                    if (jaVinculada) {
                    try { playErrorBeep(); } catch (e) {}
                    toast.warning(`⚠️ Nota ${nota.numero_nota} já está vinculada!`, { duration: 3000 });
                    return;
                    }

                    // BUSCAR VOLUMES DO BANCO PRIMEIRO
                    toast.loading("Carregando volumes...", { id: 'load-volumes' });

                    try {
                      const volumesNotaDB = await base44.entities.Volume.filter({ nota_fiscal_id: nota.id }, null, 500);

                    if (volumesNotaDB.length === 0) {
                    toast.error("❌ Nota sem volumes cadastrados!", { id: 'load-volumes', duration: 3000 });
                    return;
                    }

                    // ATUALIZAR ESTADO COM NOTA E VOLUMES
                    setNotasFiscaisLocal(prev => {
                    if (prev.some(n => n.id === nota.id)) return prev;
                    return [...prev, nota];
                    });

                    setVolumesLocal(prev => {
                    const volumesIdsLocais = prev.map(v => v.id);
                    const volumesNovos = volumesNotaDB.filter(v => !volumesIdsLocais.includes(v.id));
                    return [...prev, ...volumesNovos];
                    });

                    setNotasOrigem(prev => ({ ...prev, [nota.id]: "Adicionada" }));

                    // SELECIONAR VOLUMES NÃO ENDEREÇADOS
                    const idsEnderecados = getEnderecamentosOrdemAtual().map(e => e.volume_id);
                    const volumesParaSelecionar = volumesNotaDB.filter(v => !idsEnderecados.includes(v.id));

                    setVolumesSelecionados(volumesParaSelecionar.map(v => v.id));
                    setNotasBaseBusca("");
                    setAbaAtiva("volumes");

                    try { playSuccessBeep(); } catch (e) {}
                    toast.success(`✅ NF ${nota.numero_nota} vinculada! ${volumesParaSelecionar.length}/${volumesNotaDB.length} volumes disponíveis`, { 
                    id: 'load-volumes', 
                    duration: 4000 
                    });

                        // VINCULAR NO BANCO (em background)
                        (async () => {
                          try {
                            const notasIds = [...(ordem.notas_fiscais_ids || []).filter(id => id !== nota.id), nota.id];
                            await Promise.all([
                              base44.entities.NotaFiscal.update(nota.id, {
                                ordem_id: ordem.id,
                                status_nf: "aguardando_expedicao"
                              }),
                              base44.entities.OrdemDeCarregamento.update(ordem.id, {
                                notas_fiscais_ids: notasIds
                              })
                            ]);
                            
                            // Salvar rascunho após vincular
                            setTimeout(() => salvarRascunho(), 200);
                          } catch (error) {
                            console.error("Erro ao vincular nota no banco:", error);
                            toast.error("Erro ao salvar vinculação no banco", { duration: 3000 });
                          }
                        })();
                      } catch (error) {
                        console.error("Erro ao processar nota:", error);
                        toast.error(`Erro: ${error.message}`, { id: 'load-volumes', duration: 3000 });
                      }
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
      <div className="border-b p-2 sm:p-4" style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2 sm:gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
              className="h-8 sm:h-9"
              style={{ borderColor: theme.cardBorder, color: theme.text }}
            >
              <ArrowLeft className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Voltar</span>
            </Button>
            <div>
              <h2 className="text-base sm:text-xl font-bold" style={{ color: theme.text }}>
                Endereçamento
              </h2>
              <p className="text-xs sm:text-sm" style={{ color: theme.textMuted }}>
                {ordem.numero_carga || `#${ordem.id.slice(-6)}`}
              </p>
            </div>
          </div>
          <div className="flex gap-1 sm:gap-2 items-center flex-wrap w-full sm:w-auto">
            <Select value={tipoImpressao} onValueChange={setTipoImpressao}>
              <SelectTrigger className="w-20 sm:w-32 h-7 sm:h-9 text-xs" style={{ backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.text }}>
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
              size="sm"
              className="h-7 sm:h-9 px-2 sm:px-4"
              style={{ borderColor: theme.cardBorder, color: theme.text }}
            >
              <Printer className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" />
              <span className="hidden sm:inline">Layout</span>
            </Button>
            <Button
              variant="outline"
              onClick={handleImprimirListaNotas}
              size="sm"
              className="h-7 sm:h-9 px-2 sm:px-4"
              style={{ borderColor: theme.cardBorder, color: theme.text }}
            >
              <Printer className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" />
              <span className="hidden sm:inline">Notas</span>
            </Button>
            <Button
              variant="outline"
              onClick={handleGerarArquivoChaves}
              size="sm"
              className="h-7 sm:h-9 px-2 sm:px-4"
              style={{ borderColor: theme.cardBorder, color: theme.text }}
            >
              <FileText className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" />
              <span className="hidden sm:inline">Chaves</span>
            </Button>
            <Button
              variant="outline"
              onClick={handleAbrirEditarOrdem}
              size="sm"
              className="h-7 sm:h-9 px-2 sm:px-4"
              style={{ borderColor: theme.cardBorder, color: theme.text }}
            >
              <Edit className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" />
              <span className="hidden sm:inline">Editar Ordem</span>
            </Button>
            <Button
              onClick={handleSalvarProgresso}
              disabled={saving}
              variant="outline"
              size="sm"
              className="h-7 sm:h-9 px-2 sm:px-4"
              style={{ borderColor: theme.cardBorder, color: theme.text }}
            >
              <Save className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" />
              <span className="hidden sm:inline">Salvar</span>
            </Button>
            <Button
              onClick={handleAbrirFinalizacao}
              disabled={saving}
              size="sm"
              className="bg-green-600 hover:bg-green-700 text-white h-7 sm:h-9 px-2 sm:px-4 text-xs"
            >
              <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" />
              <span className="hidden sm:inline">Finalizar</span>
            </Button>
          </div>
        </div>

        {/* Progresso */}
        <div className="space-y-1 sm:space-y-2">
          <div className="flex justify-between text-xs sm:text-sm">
            <span style={{ color: theme.text }}>Progresso</span>
            <span className="font-bold" style={{ color: theme.text }}>
              {getEnderecamentosOrdemAtual().length}/{volumesLocal.filter(v => notasFiscaisLocal.some(nf => nf.id === v.nota_fiscal_id)).length}
            </span>
          </div>
          <Progress value={progressoEnderecamento} className="h-2 sm:h-3" />
        </div>
      </div>

      <div className="flex-1 flex flex-col sm:flex-row overflow-hidden">
        {/* Painel Esquerdo - Volumes e Lista de Notas */}
        <div className="w-full sm:w-80 border-b sm:border-b-0 sm:border-r flex flex-col" style={{ borderColor: theme.cardBorder, backgroundColor: theme.cardBg }}>
          <Tabs value={abaAtiva} onValueChange={setAbaAtiva} className="flex-1 flex flex-col" style={{ display: 'flex', flexDirection: 'column', height: '100%', margin: 0, padding: 0 }}>
            <TabsList className="grid w-full grid-cols-2 h-7 sm:h-8" style={{ flexShrink: 0, margin: 0, borderRadius: 0 }}>
              <TabsTrigger value="volumes" className="text-xs sm:text-sm h-7 sm:h-8">
                <Package className="w-3 h-3 mr-1" />
                Volumes
              </TabsTrigger>
              <TabsTrigger value="notas" className="text-xs sm:text-sm h-7 sm:h-8">
                <FileText className="w-3 h-3 mr-1" />
                Lista de Notas
              </TabsTrigger>
            </TabsList>

            {/* Aba Volumes */}
            <TabsContent value="volumes" className="flex-1 overflow-hidden space-y-2 p-2" style={{ margin: 0, display: 'flex', flexDirection: 'column' }}>
              {/* Tipo de Filtro */}
              <Tabs value={filtroTipo} onValueChange={setFiltroTipo} className="flex-shrink-0">
                <TabsList className="grid w-full grid-cols-2 h-7 sm:h-8">
                  <TabsTrigger value="volume" className="text-[10px] sm:text-xs">Volume / Etiq. Mãe</TabsTrigger>
                  <TabsTrigger value="nota_fiscal" className="text-[10px] sm:text-xs">Nota Fiscal</TabsTrigger>
                </TabsList>
              </Tabs>

              {/* Campo de Busca Unificado */}
              {filtroTipo === "nota_fiscal" ? (
              <div className="flex-shrink-0 p-2 border rounded" style={{ borderColor: theme.cardBorder, backgroundColor: isDark ? '#1e3a8a22' : '#eff6ff' }}>
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
                      onChange={(e) => {
                        setSearchChaveNF(e.target.value.replace(/\D/g, '').substring(0, 44));
                        if (feedbackNota) {
                          setFeedbackNota(null);
                          setFeedbackMensagem("");
                        }
                      }}
                      className="h-7 text-xs font-mono transition-all duration-300"
                      style={{ 
                        backgroundColor: theme.inputBg, 
                        borderColor: feedbackNota === 'success' ? '#10b981' : 
                                     feedbackNota === 'duplicate' ? '#a855f7' : 
                                     feedbackNota === 'error' ? '#ef4444' : 
                                     theme.inputBorder, 
                        borderWidth: feedbackNota ? '3px' : '1px',
                        boxShadow: feedbackNota === 'success' ? '0 0 0 3px rgba(16, 185, 129, 0.2)' :
                                   feedbackNota === 'duplicate' ? '0 0 0 3px rgba(168, 85, 247, 0.2)' :
                                   feedbackNota === 'error' ? '0 0 0 3px rgba(239, 68, 68, 0.2)' :
                                   'none',
                        color: theme.text 
                      }}
                      disabled={processandoChave}
                      autoFocus
                    />
                    {feedbackMensagem && (
                      <div 
                        className="text-sm font-bold mt-2 px-2 py-1.5 rounded"
                        style={{ 
                          color: feedbackNota === 'success' ? '#10b981' : 
                                 feedbackNota === 'duplicate' ? '#a855f7' : 
                                 feedbackNota === 'error' ? '#ef4444' : 
                                 theme.text,
                          backgroundColor: feedbackNota === 'success' ? 'rgba(16, 185, 129, 0.15)' :
                                          feedbackNota === 'duplicate' ? 'rgba(168, 85, 247, 0.15)' :
                                          feedbackNota === 'error' ? 'rgba(239, 68, 68, 0.15)' :
                                          'transparent'
                        }}
                      >
                        {feedbackMensagem}
                      </div>
                    )}
                    {processandoChave && (
                      <div className="flex items-center gap-2 mt-2">
                        <div className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                        <span className="text-xs" style={{ color: theme.text }}>Processando...</span>
                      </div>
                    )}
                    {!feedbackMensagem && !processandoChave && (
                      <p className="text-[9px] mt-1" style={{ color: theme.textMuted }}>
                        Cole ou bipe a chave - pesquisa automática
                      </p>
                    )}
                  </>
                ) : (
                  <>
                    <div className="relative">
                      <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-3 h-3" style={{ color: theme.textMuted }} />
                      <Input
                        ref={inputChaveRef}
                        placeholder="Número da NF ou chave (44 dígitos)..."
                        value={notasBaseBusca}
                        onChange={(e) => {
                          setNotasBaseBusca(e.target.value);
                          if (feedbackNota) {
                            setFeedbackNota(null);
                            setFeedbackMensagem("");
                          }
                        }}
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
                        className="h-7 text-xs pl-7 transition-all duration-300"
                        style={{ 
                          backgroundColor: theme.inputBg, 
                          borderColor: feedbackNota === 'success' ? '#10b981' : 
                                       feedbackNota === 'duplicate' ? '#a855f7' : 
                                       feedbackNota === 'error' ? '#ef4444' : 
                                       theme.inputBorder,
                          borderWidth: feedbackNota ? '3px' : '1px',
                          boxShadow: feedbackNota === 'success' ? '0 0 0 3px rgba(16, 185, 129, 0.2)' :
                                     feedbackNota === 'duplicate' ? '0 0 0 3px rgba(168, 85, 247, 0.2)' :
                                     feedbackNota === 'error' ? '0 0 0 3px rgba(239, 68, 68, 0.2)' :
                                     'none',
                          color: theme.text 
                        }}
                        autoFocus
                      />
                    </div>
                    {feedbackMensagem && (
                      <div 
                        className="text-sm font-bold mt-2 px-2 py-1.5 rounded"
                        style={{ 
                          color: feedbackNota === 'success' ? '#10b981' : 
                                 feedbackNota === 'duplicate' ? '#a855f7' : 
                                 feedbackNota === 'error' ? '#ef4444' : 
                                 theme.text,
                          backgroundColor: feedbackNota === 'success' ? 'rgba(16, 185, 129, 0.15)' :
                                          feedbackNota === 'duplicate' ? 'rgba(168, 85, 247, 0.15)' :
                                          feedbackNota === 'error' ? 'rgba(239, 68, 68, 0.15)' :
                                          'transparent'
                        }}
                      >
                        {feedbackMensagem}
                      </div>
                    )}
                    {!feedbackMensagem && (
                      <p className="text-[9px] mt-1" style={{ color: theme.textMuted }}>
                        Digite número ou bipe chave - Enter para importar
                      </p>
                    )}
                  </>
                )}
              </div>
            ) : (
              <div className="flex-shrink-0 space-y-2">
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
              </div>
            )}

            {volumesSelecionados.length > 0 && (
              <div className="flex-shrink-0 flex items-center justify-between">
                <Badge className="bg-blue-600 text-white">
                  {volumesSelecionados.length} selecionado(s)
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setVolumesSelecionados([])}
                  className="h-6 text-xs"
                  style={{ color: theme.textMuted }}
                >
                  Limpar
                </Button>
              </div>
            )}

            {/* Lista de Volumes Agrupados por NF ou Notas da Base */}
            <Droppable droppableId="volumes-list">
              {(provided) => (
                <div 
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="flex-1 overflow-y-auto space-y-3"
                >
                      {usarBase && filtroTipo === "nota_fiscal" ? (
                        // Exibir notas da base quando modo "Base" ativado
                        <NotasBaseList
                          notasBaseBusca={notasBaseBusca}
                          notasFiscaisLocal={notasFiscaisLocal}
                          volumesLocal={volumesLocal}
                          onSelecionarNota={async (nota) => {
                        // VERIFICAR SE JÁ ESTÁ VINCULADA
                        const jaVinculada = notasFiscaisLocal.some(nf => nf.id === nota.id);
                        
                        if (jaVinculada) {
                          try { playErrorBeep(); } catch (e) {}
                          toast.warning(`⚠️ Nota ${nota.numero_nota} já está vinculada!`, { duration: 3000 });
                          return;
                        }
                        
                        // BUSCAR VOLUMES DO BANCO PRIMEIRO
                        toast.loading("Carregando volumes da nota...", { id: 'load-volumes-desktop' });
                        
                        try {
                          const volumesNotaDB = await base44.entities.Volume.filter({ nota_fiscal_id: nota.id });
                          
                          if (volumesNotaDB.length === 0) {
                            toast.error("❌ Nota sem volumes cadastrados!", { id: 'load-volumes-desktop', duration: 3000 });
                            return;
                          }
                        
                          // ATUALIZAR ESTADO COM NOTA E VOLUMES
                          setNotasFiscaisLocal(prev => {
                            if (prev.some(n => n.id === nota.id)) return prev;
                            return [...prev, nota];
                          });
                          
                          setVolumesLocal(prev => {
                            const volumesIdsLocais = prev.map(v => v.id);
                            const volumesNovos = volumesNotaDB.filter(v => !volumesIdsLocais.includes(v.id));
                            return [...prev, ...volumesNovos];
                          });
                          
                          setNotasOrigem(prev => ({ ...prev, [nota.id]: "Adicionada" }));
                          
                          // SELECIONAR VOLUMES NÃO ENDEREÇADOS
                          const idsEnderecados = getEnderecamentosOrdemAtual().map(e => e.volume_id);
                          const volumesParaSelecionar = volumesNotaDB.filter(v => !idsEnderecados.includes(v.id));
                          
                          setVolumesSelecionados(volumesParaSelecionar.map(v => v.id));
                          setNotasBaseBusca("");
                          
                          try { playSuccessBeep(); } catch (e) {}
                          toast.success(`✅ NF ${nota.numero_nota} vinculada! ${volumesParaSelecionar.length}/${volumesNotaDB.length} volumes disponíveis`, { 
                            id: 'load-volumes-desktop', 
                            duration: 4000 
                          });
                          
                          // VINCULAR NO BANCO (em background)
                          (async () => {
                            try {
                              const notasIds = [...(ordem.notas_fiscais_ids || []).filter(id => id !== nota.id), nota.id];
                              await Promise.all([
                                base44.entities.NotaFiscal.update(nota.id, {
                                  ordem_id: ordem.id,
                                  status_nf: "aguardando_expedicao"
                                }),
                                base44.entities.OrdemDeCarregamento.update(ordem.id, {
                                  notas_fiscais_ids: notasIds
                                })
                              ]);
                              
                              // Salvar rascunho após vincular
                              setTimeout(() => salvarRascunho(), 200);
                            } catch (error) {
                              console.error("Erro ao vincular nota no banco:", error);
                              toast.error("Erro ao salvar vinculação no banco", { duration: 3000 });
                            }
                          })();
                        } catch (error) {
                          console.error("Erro ao processar nota:", error);
                          toast.error(`Erro: ${error.message}`, { id: 'load-volumes-desktop', duration: 3000 });
                        }
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
                                {(provided, snapshot) => {
                                  // Calcular despesas palete de TODAS as posições desta nota
                                  const todasDespesasPalete = despesasExtras.filter(d => {
                                    if (d.nota_fiscal_id !== notaId) return false;
                                    const tipoLower = d.tipo_despesa_nome?.toLowerCase() || '';
                                    return tipoLower.includes('palete') || tipoLower.includes('paletiza');
                                  });
                                  const qtdPaleteTotal = todasDespesasPalete.reduce((sum, d) => sum + (d.quantidade || 0), 0);

                                  return (
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
                                        {qtdPaleteTotal > 0 && (
                                          <div 
                                            className="flex items-center gap-0.5 px-1.5 py-0.5 rounded mr-1"
                                            style={{ backgroundColor: 'rgba(255, 165, 0, 0.2)' }}
                                            title={`${qtdPaleteTotal} palete(s)`}
                                          >
                                            <Package className="w-3 h-3" style={{ color: '#f59e0b' }} />
                                            <span className="text-[9px] font-bold" style={{ color: '#f59e0b' }}>
                                              {qtdPaleteTotal}
                                            </span>
                                          </div>
                                        )}
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
                                  );
                                }}
                                </Draggable>

                              {/* Lista de Volumes da Nota - com expand/collapse */}
                              <AnimatePresence>
                                {notasExpandidas[`sidebar-${notaId}`] === true && (
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
                              <p className="text-sm mb-3">
                                {getVolumesNaoEnderecados().length === 0 && notasFiscaisLocal.length > 0
                                  ? "Todos os volumes foram posicionados!"
                                  : notasFiscaisLocal.length === 0
                                  ? "Vincule notas fiscais para carregar volumes"
                                  : "Nenhum volume disponível"}
                              </p>
                              {notasFiscaisLocal.length > 0 && (
                                <Button
                                  size="sm"
                                  onClick={async () => {
                                    toast.loading("Recarregando volumes...", { id: 'reload-vols' });
                                    try {
                                      const notasIds = notasFiscaisLocal.map(n => n.id);
                                      const volumesDB = await base44.entities.Volume.filter({ 
                                        nota_fiscal_id: { $in: notasIds } 
                                      });

                                      setVolumesLocal(prev => {
                                        const volumesIdsLocais = prev.map(v => v.id);
                                        const volumesNovos = volumesDB.filter(v => !volumesIdsLocais.includes(v.id));
                                        return [...prev, ...volumesNovos];
                                      });

                                      toast.success(`✅ ${volumesDB.length} volumes carregados!`, { id: 'reload-vols', duration: 3000 });
                                    } catch (error) {
                                      console.error("Erro ao recarregar volumes:", error);
                                      toast.error("Erro ao carregar volumes", { id: 'reload-vols' });
                                    }
                                  }}
                                  className="bg-blue-600 hover:bg-blue-700"
                                >
                                  <Package className="w-4 h-4 mr-2" />
                                  Recarregar Volumes
                                </Button>
                              )}
                            </div>
                        )}
                      </>
                    )}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </TabsContent>

            {/* Aba Lista de Notas */}
            <TabsContent value="notas" className="h-full overflow-y-auto" style={{ margin: 0, padding: 0 }}>
              <div className="space-y-1.5 p-2">
              {/* Cabeçalho com Totais */}
              <div className="p-2 mb-2 border rounded" style={{ borderColor: theme.cardBorder, backgroundColor: isDark ? '#1e40af22' : '#eff6ff' }}>
                <div className="grid grid-cols-2 gap-2 text-[10px]">
                  <div>
                    <span style={{ color: theme.textMuted }}>Notas:</span>
                    <span className="ml-1 font-bold" style={{ color: theme.text }}>
                      {notasFiscaisLocal.length}
                    </span>
                  </div>
                  <div>
                    <span style={{ color: theme.textMuted }}>Volumes:</span>
                    <span className="ml-1 font-bold" style={{ color: theme.text }}>
                      {volumesLocal.filter(v => notasFiscaisLocal.some(nf => nf.id === v.nota_fiscal_id)).length}
                    </span>
                  </div>
                  <div>
                    <span style={{ color: theme.textMuted }}>Peso:</span>
                    <span className="ml-1 font-bold" style={{ color: theme.text }}>
                      {notasFiscaisLocal.reduce((sum, nf) => sum + (nf.peso_total_nf || 0), 0).toLocaleString()} kg
                    </span>
                  </div>
                  <div>
                    <span style={{ color: theme.textMuted }}>m³:</span>
                    <span className="ml-1 font-bold" style={{ color: theme.text }}>
                      {volumesLocal.filter(v => notasFiscaisLocal.some(nf => nf.id === v.nota_fiscal_id))
                        .reduce((sum, v) => sum + (v.cubagem || 0), 0).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
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
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Painel Central - Layout do Veículo */}
        <div className="flex-1 overflow-auto p-2 sm:p-4">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-2 sm:mb-4">
              <h3 className="font-semibold text-sm sm:text-base flex items-center gap-2" style={{ color: theme.text }}>
                <Grid3x3 className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Layout do Caminhão - {tipoVeiculo}</span>
                <span className="sm:hidden">Layout - {tipoVeiculo}</span>
              </h3>
              <div className="flex items-center gap-2">
                <Label className="text-xs sm:text-sm" style={{ color: theme.text }}>Linhas:</Label>
                <Input
                  type="text"
                  inputMode="numeric"
                  value={numLinhasInput}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '');
                    setNumLinhasInput(value);
                    if (value) {
                      const val = parseInt(value);
                      setNumLinhas(Math.max(1, Math.min(20, val)));
                    }
                  }}
                  onBlur={() => {
                    if (!numLinhasInput) {
                      setNumLinhasInput("1");
                      setNumLinhas(1);
                    }
                  }}
                  className="w-14 sm:w-16 h-7 sm:h-8 text-xs sm:text-sm text-center"
                  style={{ backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.text }}
                />
              </div>
            </div>

            {/* Grid do Veículo */}
            <div className="border-2 rounded-lg overflow-x-auto" style={{ borderColor: theme.cellBorder }}>
              {/* Cabeçalho */}
              <div className="grid gap-0" style={{ gridTemplateColumns: `50px repeat(${layoutConfig.colunas.length}, minmax(120px, 1fr))` }}>
                <div className="p-1.5 sm:p-2 font-bold text-center border-b border-r text-[10px] sm:text-sm" style={{ backgroundColor: isDark ? '#334155' : '#f1f5f9', borderColor: theme.cellBorder, color: theme.text }}>
                  Lin
                </div>
                {layoutConfig.colunas.map((coluna, idx) => (
                  <div
                    key={coluna}
                    className="p-1.5 sm:p-2 font-bold text-center border-b text-[9px] sm:text-sm"
                    style={{
                      backgroundColor: isDark ? '#334155' : '#f1f5f9',
                      borderColor: theme.cellBorder,
                      borderRight: idx < layoutConfig.colunas.length - 1 ? `1px solid ${theme.cellBorder}` : 'none',
                      color: theme.text
                    }}
                  >
                    <span className="hidden sm:inline">{coluna}</span>
                    <span className="sm:hidden">{coluna.substring(0, 3)}</span>
                  </div>
                ))}
              </div>

              {/* Linhas do Layout */}
              {Array.from({ length: numLinhas }, (_, i) => i + 1).map((linha) => (
                <div
                  key={linha}
                  className="grid gap-0"
                  style={{ gridTemplateColumns: `50px repeat(${layoutConfig.colunas.length}, minmax(120px, 1fr))` }}
                >
                  <div
                    className="p-1.5 sm:p-2 font-bold text-center border-b border-r text-[10px] sm:text-sm"
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
                            className="p-1 sm:p-2 border-b min-h-[60px] sm:min-h-[100px] cursor-pointer hover:bg-opacity-50 transition-all"
                            style={{
                              backgroundColor: snapshot.isDraggingOver 
                                ? (isDark ? '#1e40af44' : '#dbeafe')
                                : theme.cellBg,
                              borderColor: theme.cellBorder,
                              borderRight: idx < layoutConfig.colunas.length - 1 ? `1px solid ${theme.cellBorder}` : 'none'
                            }}
                            title="Clique para escanear volumes ou arraste volumes aqui"
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
                                      {(provided, snapshot) => {
                                        const despesasPalete = getDespesasPaletePorNotaPosicao(nota.id, linha, coluna);
                                        const qtdPaletes = despesasPalete.reduce((sum, d) => sum + (d.quantidade || 0), 0);

                                        return (
                                        <div
                                         ref={provided.innerRef}
                                         {...provided.draggableProps}
                                         {...provided.dragHandleProps}
                                         onClick={(e) => {
                                           e.stopPropagation();
                                           toggleNotaExpandida(nota.id, linha, coluna);
                                         }}
                                         onContextMenu={(e) => handleAbrirDespesaPosicao(nota, linha, coluna, e)}
                                         className="flex items-center justify-between gap-1 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-[9px] sm:text-[11px] leading-tight cursor-pointer"
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
                                         <span className="font-bold shrink-0 w-10 sm:w-14 uppercase text-[9px] sm:text-[10px]">
                                          {nota.numero_nota}
                                         </span>
                                         <span className="flex-1 truncate text-center px-0.5 sm:px-1 uppercase text-[8px] sm:text-[9px]" title={nota.emitente_razao_social}>
                                          {fornecedorAbreviado}
                                         </span>
                                         {qtdPaletes > 0 && (
                                           <div 
                                             className="flex items-center gap-0.5 px-1 py-0.5 rounded"
                                             style={{ backgroundColor: 'rgba(255, 165, 0, 0.2)' }}
                                             title={`${qtdPaletes} palete(s)`}
                                           >
                                             <Package className="w-2.5 h-2.5" style={{ color: '#f59e0b' }} />
                                             <span className="text-[8px] font-bold" style={{ color: '#f59e0b' }}>
                                               {qtdPaletes}
                                             </span>
                                           </div>
                                         )}
                                         <span className="font-bold shrink-0 w-4 sm:w-6 text-right text-[9px] sm:text-[10px]">
                                          {volumesNota.length}
                                         </span>
                                         <Button
                                           variant="ghost"
                                           size="sm"
                                           onClick={(e) => {
                                             e.stopPropagation();
                                             handleRemoverNotaDaCelula(linha, coluna, nota.id);
                                           }}
                                           className="h-3.5 w-3.5 sm:h-4 sm:w-4 p-0 hover:bg-red-100 dark:hover:bg-red-900 flex-shrink-0"
                                           title="Remover NF desta célula"
                                         >
                                           <Trash2 className="w-2 h-2 sm:w-2.5 sm:h-2.5 text-red-600" />
                                         </Button>
                                         </div>
                                         );
                                         }}
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
                                                  className="px-1 sm:px-1.5 py-0.5 rounded text-[7px] sm:text-[9px] leading-tight cursor-move ml-1 sm:ml-2"
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
                              <div className="text-center text-[10px] sm:text-xs" style={{ color: theme.textMuted, opacity: 0.5 }}>
                                {snapshot.isDraggingOver ? "Solte" : "Vazio"}
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
            <Card className="mt-2 sm:mt-4 hidden sm:block" style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}>
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

      {/* Modal de Busca/Scanner */}
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
                      id="usar-base-busca"
                      checked={usarBase}
                      onCheckedChange={setUsarBase}
                    />
                    <Label htmlFor="usar-base-busca" className="text-xs cursor-pointer" style={{ color: theme.text }}>
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
                      onChange={(e) => {
                        setSearchChaveNF(e.target.value.replace(/\D/g, '').substring(0, 44));
                        if (feedbackNota) {
                          setFeedbackNota(null);
                          setFeedbackMensagem("");
                        }
                      }}
                      className="h-9 text-sm font-mono transition-all duration-300"
                      style={{ 
                        backgroundColor: theme.inputBg, 
                        borderColor: feedbackNota === 'success' ? '#10b981' : 
                                     feedbackNota === 'duplicate' ? '#a855f7' : 
                                     feedbackNota === 'error' ? '#ef4444' : 
                                     theme.inputBorder,
                        borderWidth: feedbackNota ? '3px' : '1px',
                        boxShadow: feedbackNota === 'success' ? '0 0 0 3px rgba(16, 185, 129, 0.2)' :
                                   feedbackNota === 'duplicate' ? '0 0 0 3px rgba(168, 85, 247, 0.2)' :
                                   feedbackNota === 'error' ? '0 0 0 3px rgba(239, 68, 68, 0.2)' :
                                   'none',
                        color: theme.text 
                      }}
                      disabled={processandoChave}
                      autoFocus
                    />
                    {feedbackMensagem && (
                      <div 
                        className="text-sm font-bold mt-2 px-2 py-1.5 rounded"
                        style={{ 
                          color: feedbackNota === 'success' ? '#10b981' : 
                                 feedbackNota === 'duplicate' ? '#a855f7' : 
                                 feedbackNota === 'error' ? '#ef4444' : 
                                 theme.text,
                          backgroundColor: feedbackNota === 'success' ? 'rgba(16, 185, 129, 0.15)' :
                                          feedbackNota === 'duplicate' ? 'rgba(168, 85, 247, 0.15)' :
                                          feedbackNota === 'error' ? 'rgba(239, 68, 68, 0.15)' :
                                          'transparent'
                        }}
                      >
                        {feedbackMensagem}
                      </div>
                    )}
                    {processandoChave && (
                      <div className="flex items-center gap-2 mt-2">
                        <div className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                        <span className="text-xs" style={{ color: theme.text }}>Processando...</span>
                      </div>
                    )}
                    {!feedbackMensagem && !processandoChave && (
                      <p className="text-[9px] mt-1" style={{ color: theme.textMuted }}>
                        Cole ou bipe a chave - pesquisa automática
                      </p>
                    )}
                  </>
                ) : (
                  <>
                    <div className="relative">
                      <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-3 h-3" style={{ color: theme.textMuted }} />
                      <Input
                        ref={inputChaveRef}
                        placeholder="Número da NF ou chave (44 dígitos)..."
                        value={notasBaseBusca}
                        onChange={(e) => {
                          setNotasBaseBusca(e.target.value);
                          if (feedbackNota) setFeedbackNota(null);
                        }}
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
                        className="h-9 text-sm pl-7 transition-all duration-300"
                        style={{ 
                          backgroundColor: theme.inputBg, 
                          borderColor: feedbackNota === 'success' ? '#10b981' : 
                                       feedbackNota === 'duplicate' ? '#a855f7' : 
                                       feedbackNota === 'error' ? '#ef4444' : 
                                       theme.inputBorder,
                          borderWidth: feedbackNota ? '3px' : '1px',
                          boxShadow: feedbackNota === 'success' ? '0 0 0 3px rgba(16, 185, 129, 0.2)' :
                                     feedbackNota === 'duplicate' ? '0 0 0 3px rgba(168, 85, 247, 0.2)' :
                                     feedbackNota === 'error' ? '0 0 0 3px rgba(239, 68, 68, 0.2)' :
                                     'none',
                          color: theme.text 
                        }}
                        autoFocus
                      />
                    </div>
                    {feedbackMensagem && (
                      <div 
                        className="text-sm font-bold mt-2 px-2 py-1.5 rounded"
                        style={{ 
                          color: feedbackNota === 'success' ? '#10b981' : 
                                 feedbackNota === 'duplicate' ? '#a855f7' : 
                                 feedbackNota === 'error' ? '#ef4444' : 
                                 theme.text,
                          backgroundColor: feedbackNota === 'success' ? 'rgba(16, 185, 129, 0.15)' :
                                          feedbackNota === 'duplicate' ? 'rgba(168, 85, 247, 0.15)' :
                                          feedbackNota === 'error' ? 'rgba(239, 68, 68, 0.15)' :
                                          'transparent'
                        }}
                      >
                        {feedbackMensagem}
                      </div>
                    )}
                    {!feedbackMensagem && (
                      <p className="text-[9px] mt-1" style={{ color: theme.textMuted }}>
                        Digite número ou bipe chave - Enter para importar
                      </p>
                    )}
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
                    id="apenas-vinculadas-modal"
                    checked={apenasNotasVinculadas}
                    onCheckedChange={(checked) => setApenasNotasVinculadas(checked)}
                  />
                  <label
                    htmlFor="apenas-vinculadas-modal"
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
                  {feedbackMensagem && (
                    <div 
                      className="text-xs font-semibold mt-1 transition-all duration-300"
                      style={{ 
                        color: feedbackNota === 'success' ? '#10b981' : 
                               feedbackNota === 'duplicate' ? '#a855f7' : 
                               feedbackNota === 'error' ? '#ef4444' : 
                               theme.text 
                      }}
                    >
                      {feedbackMensagem}
                    </div>
                  )}
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
                  // VERIFICAR SE JÁ ESTÁ VINCULADA
                  const jaVinculada = notasFiscaisLocal.some(nf => nf.id === nota.id);

                  if (jaVinculada) {
                  try { playErrorBeep(); } catch (e) {}
                  toast.warning(`⚠️ Nota ${nota.numero_nota} já está vinculada!`, { duration: 3000 });
                  return;
                  }

                  // BUSCAR VOLUMES DO BANCO PRIMEIRO
                  toast.loading("Carregando volumes...", { id: 'load-volumes' });

                  try {
                  const volumesNotaDB = await base44.entities.Volume.filter({ nota_fiscal_id: nota.id });

                  if (volumesNotaDB.length === 0) {
                  toast.error("❌ Nota sem volumes cadastrados!", { id: 'load-volumes', duration: 3000 });
                  return;
                  }

                  // ATUALIZAR ESTADO COM NOTA E VOLUMES
                  setNotasFiscaisLocal(prev => {
                  if (prev.some(n => n.id === nota.id)) return prev;
                  return [...prev, nota];
                  });

                  setVolumesLocal(prev => {
                  const volumesIdsLocais = prev.map(v => v.id);
                  const volumesNovos = volumesNotaDB.filter(v => !volumesIdsLocais.includes(v.id));
                  return [...prev, ...volumesNovos];
                  });

                  setNotasOrigem(prev => ({ ...prev, [nota.id]: "Adicionada" }));

                  // SELECIONAR VOLUMES NÃO ENDEREÇADOS
                  const idsEnderecados = getEnderecamentosOrdemAtual().map(e => e.volume_id);
                  const volumesParaSelecionar = volumesNotaDB.filter(v => !idsEnderecados.includes(v.id));

                  setVolumesSelecionados(volumesParaSelecionar.map(v => v.id));
                  setNotasBaseBusca("");
                  setAbaAtiva("volumes");

                  try { playSuccessBeep(); } catch (e) {}
                  toast.success(`✅ NF ${nota.numero_nota} vinculada! ${volumesParaSelecionar.length}/${volumesNotaDB.length} volumes disponíveis`, { 
                  id: 'load-volumes', 
                  duration: 4000 
                  });

                      // VINCULAR NO BANCO (em background)
                      (async () => {
                        try {
                          const notasIds = [...(ordem.notas_fiscais_ids || []).filter(id => id !== nota.id), nota.id];
                          await Promise.all([
                            base44.entities.NotaFiscal.update(nota.id, {
                              ordem_id: ordem.id,
                              status_nf: "aguardando_expedicao"
                            }),
                            base44.entities.OrdemDeCarregamento.update(ordem.id, {
                              notas_fiscais_ids: notasIds
                            })
                          ]);
                          
                          // Salvar rascunho após vincular
                          setTimeout(() => salvarRascunho(), 200);
                        } catch (error) {
                          console.error("Erro ao vincular nota no banco:", error);
                          toast.error("Erro ao salvar vinculação no banco", { duration: 3000 });
                        }
                      })();
                    } catch (error) {
                      console.error("Erro ao processar nota:", error);
                      toast.error(`Erro: ${error.message}`, { id: 'load-volumes', duration: 3000 });
                    }
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

      {/* Modal Editar Ordem */}
      <Dialog open={showEditarOrdemModal} onOpenChange={setShowEditarOrdemModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}>
          <DialogHeader>
            <DialogTitle style={{ color: theme.text }}>Editar Dados da Ordem</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label style={{ color: theme.text }}>Cliente</Label>
                <Input
                  value={dadosOrdemEdit.cliente || ""}
                  onChange={(e) => setDadosOrdemEdit({ ...dadosOrdemEdit, cliente: e.target.value })}
                  className="mt-1"
                  style={{ backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.text }}
                />
              </div>
              <div>
                <Label style={{ color: theme.text }}>Produto</Label>
                <Input
                  value={dadosOrdemEdit.produto || ""}
                  onChange={(e) => setDadosOrdemEdit({ ...dadosOrdemEdit, produto: e.target.value })}
                  className="mt-1"
                  style={{ backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.text }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label style={{ color: theme.text }}>Origem</Label>
                <Input
                  value={dadosOrdemEdit.origem || ""}
                  onChange={(e) => setDadosOrdemEdit({ ...dadosOrdemEdit, origem: e.target.value })}
                  className="mt-1"
                  style={{ backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.text }}
                />
              </div>
              <div>
                <Label style={{ color: theme.text }}>Cidade Origem</Label>
                <Input
                  value={dadosOrdemEdit.origem_cidade || ""}
                  onChange={(e) => setDadosOrdemEdit({ ...dadosOrdemEdit, origem_cidade: e.target.value })}
                  className="mt-1"
                  style={{ backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.text }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label style={{ color: theme.text }}>Destino</Label>
                <Input
                  value={dadosOrdemEdit.destino || ""}
                  onChange={(e) => setDadosOrdemEdit({ ...dadosOrdemEdit, destino: e.target.value })}
                  className="mt-1"
                  style={{ backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.text }}
                />
              </div>
              <div>
                <Label style={{ color: theme.text }}>Cidade Destino</Label>
                <Input
                  value={dadosOrdemEdit.destino_cidade || ""}
                  onChange={(e) => setDadosOrdemEdit({ ...dadosOrdemEdit, destino_cidade: e.target.value })}
                  className="mt-1"
                  style={{ backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.text }}
                />
              </div>
            </div>

            <div>
              <Label style={{ color: theme.text }}>Motorista</Label>
              <Input
                value={dadosOrdemEdit.motorista_nome_temp || ""}
                onChange={(e) => setDadosOrdemEdit({ ...dadosOrdemEdit, motorista_nome_temp: e.target.value })}
                className="mt-1"
                style={{ backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.text }}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label style={{ color: theme.text }}>Placa Cavalo</Label>
                <Input
                  value={dadosOrdemEdit.cavalo_placa_temp || ""}
                  onChange={(e) => setDadosOrdemEdit({ ...dadosOrdemEdit, cavalo_placa_temp: e.target.value })}
                  className="mt-1"
                  style={{ backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.text }}
                />
              </div>
              <div>
                <Label style={{ color: theme.text }}>Placa Implemento 1</Label>
                <Input
                  value={dadosOrdemEdit.implemento1_placa_temp || ""}
                  onChange={(e) => setDadosOrdemEdit({ ...dadosOrdemEdit, implemento1_placa_temp: e.target.value })}
                  className="mt-1"
                  style={{ backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.text }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label style={{ color: theme.text }}>Placa Implemento 2</Label>
                <Input
                  value={dadosOrdemEdit.implemento2_placa_temp || ""}
                  onChange={(e) => setDadosOrdemEdit({ ...dadosOrdemEdit, implemento2_placa_temp: e.target.value })}
                  className="mt-1"
                  style={{ backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.text }}
                />
              </div>
              <div>
                <Label style={{ color: theme.text }}>Placa Implemento 3</Label>
                <Input
                  value={dadosOrdemEdit.implemento3_placa_temp || ""}
                  onChange={(e) => setDadosOrdemEdit({ ...dadosOrdemEdit, implemento3_placa_temp: e.target.value })}
                  className="mt-1"
                  style={{ backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.text }}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowEditarOrdemModal(false)}
              style={{ borderColor: theme.cardBorder, color: theme.text }}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSalvarEdicaoOrdem}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Salvar Alterações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Despesa Extra Posição */}
      {showDespesaModal && despesaContext && (
        <DespesaPosicaoModal
          open={showDespesaModal}
          onClose={() => {
            setShowDespesaModal(false);
            setDespesaContext(null);
          }}
          notaFiscal={despesaContext.nota}
          linha={despesaContext.linha}
          coluna={despesaContext.coluna}
          onSuccess={handleDespesaSuccess}
        />
      )}

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