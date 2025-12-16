import React, { useState, useEffect, useMemo, useCallback } from "react";
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
import SelecionarVolumesModal from "./SelecionarVolumesModal";
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
  const [usarBase, setUsarBase] = useState(false);
  const [notasBaseBusca, setNotasBaseBusca] = useState("");
  const inputChaveRef = React.useRef(null);
  const [showCamera, setShowCamera] = useState(false);
  const [processandoQR, setProcessandoQR] = useState(false);
  const [showSelecionarVolumes, setShowSelecionarVolumes] = useState(false);
  const [notaParaAlocar, setNotaParaAlocar] = useState(null);
  const [celulaDestino, setCelulaDestino] = useState(null);

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
    setNotasFiscaisLocal(notasFiscais);
    setVolumesLocal(volumes);
    
    // Carregar rascunho do localStorage
    const rascunhoSalvo = localStorage.getItem(`enderecamento_rascunho_${ordem.id}`);
    if (rascunhoSalvo) {
      try {
        const rascunho = JSON.parse(rascunhoSalvo);
        if (rascunho.enderecamentos) {
          // Mesclar endereçamentos salvos com os do banco
          const idsExistentes = enderecamentos.map(e => e.volume_id);
          const enderecamentosRascunho = rascunho.enderecamentos.filter(e => !idsExistentes.includes(e.volume_id));
          if (enderecamentosRascunho.length > 0) {
            setEnderecamentos([...enderecamentos, ...enderecamentosRascunho]);
            toast.info(`${enderecamentosRascunho.length} endereçamento(s) restaurado(s) do rascunho`);
          }
        }
      } catch (error) {
        console.error("Erro ao carregar rascunho:", error);
      }
    }
  }, [notasFiscais, volumes]);

  useEffect(() => {
    loadEnderecamentos();
    loadNotasOrigem();
    
    // Restaurar notas e volumes do rascunho
    const rascunhoNotas = localStorage.getItem(`enderecamento_notas_${ordem.id}`);
    if (rascunhoNotas) {
      try {
        const rascunho = JSON.parse(rascunhoNotas);
        if (rascunho.notas && rascunho.volumes) {
          // Mesclar notas que não existem localmente
          const notasIdsExistentes = notasFiscaisLocal.map(n => n.id);
          const notasNovas = rascunho.notas.filter(n => !notasIdsExistentes.includes(n.id));
          
          const volumesIdsExistentes = volumesLocal.map(v => v.id);
          const volumesNovos = rascunho.volumes.filter(v => !volumesIdsExistentes.includes(v.id));
          
          if (notasNovas.length > 0 || volumesNovos.length > 0) {
            setNotasFiscaisLocal([...notasFiscaisLocal, ...notasNovas]);
            setVolumesLocal([...volumesLocal, ...volumesNovos]);
            
            if (notasNovas.length > 0) {
              toast.info(`${notasNovas.length} nota(s) restaurada(s) do rascunho`);
            }
          }
        }
      } catch (error) {
        console.error("Erro ao restaurar rascunho de notas:", error);
      }
    }
  }, [ordem.id]);

  const loadNotasOrigem = () => {
    const origens = {};
    notasFiscaisLocal.forEach(nf => {
      if (!origens[nf.id]) {
        origens[nf.id] = "Vinculada";
      }
    });
    setNotasOrigem(origens);
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
      const endData = await base44.entities.EnderecamentoVolume.filter({ ordem_id: ordem.id });
      setEnderecamentos(endData);
    } catch (error) {
      console.error("Erro ao carregar endereçamentos:", error);
    } finally {
      setLoading(false);
    }
  };

  // Otimização: usar useMemo para cálculos pesados
  const idsEnderecados = useMemo(() => 
    enderecamentos.map(e => e.volume_id), 
    [enderecamentos]
  );

  const volumesNaoEnderecados = useMemo(() => 
    volumesLocal.filter(v => 
      notasFiscaisLocal.some(nf => nf.id === v.nota_fiscal_id) &&
      !idsEnderecados.includes(v.id)
    ),
    [volumesLocal, notasFiscaisLocal, idsEnderecados]
  );

  const notasComVolumesNaoEnderecados = useMemo(() => {
    return notasFiscaisLocal.map(nota => {
      const volumesNota = volumesLocal.filter(v => v.nota_fiscal_id === nota.id);
      const volumesDisponiveis = volumesNota.filter(v => !idsEnderecados.includes(v.id));
      const volumesJaEnderecados = volumesNota.filter(v => idsEnderecados.includes(v.id));
      
      return {
        ...nota,
        volumesDisponiveis,
        volumesJaEnderecados,
        totalVolumes: volumesNota.length
      };
    }).filter(nota => nota.volumesDisponiveis.length > 0);
  }, [notasFiscaisLocal, volumesLocal, idsEnderecados]);

  // Cache de células para evitar recálculos
  const celulasCache = useMemo(() => {
    const cache = {};
    
    for (let linha = 1; linha <= numLinhas; linha++) {
      for (const coluna of layoutConfig.colunas) {
        const key = `${linha}-${coluna}`;
        const endsNaCelula = enderecamentos.filter(e => 
          e.linha === linha && e.coluna === coluna
        );
        const volumesNaCelula = endsNaCelula.map(e => 
          volumesLocal.find(v => v.id === e.volume_id)
        ).filter(Boolean);
        
        const notasIds = [...new Set(volumesNaCelula.map(v => v.nota_fiscal_id))];
        const notasNaCelula = notasFiscaisLocal.filter(nf => notasIds.includes(nf.id));
        
        cache[key] = {
          volumesNaCelula,
          notasNaCelula
        };
      }
    }
    
    return cache;
  }, [enderecamentos, volumesLocal, notasFiscaisLocal, numLinhas, layoutConfig.colunas]);

  const getVolumesNaCelula = useCallback((linha, coluna) => {
    return celulasCache[`${linha}-${coluna}`]?.volumesNaCelula || [];
  }, [celulasCache]);

  const getNotasFiscaisNaCelula = useCallback((linha, coluna) => {
    return celulasCache[`${linha}-${coluna}`]?.notasNaCelula || [];
  }, [celulasCache]);

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
      const novosEnderecamentos = [];

      for (const volumeId of volumesSelecionados) {
        const volume = volumesLocal.find(v => v.id === volumeId);
        if (!volume) continue;

        // Endereçar = conferir automaticamente
        await base44.entities.Volume.update(volumeId, {
          status_volume: "carregado",
          localizacao_atual: `Ordem ${ordem.numero_carga || ordem.id.slice(-6)} - ${linha}-${coluna}`
        });

        const enderecamento = {
          ordem_id: ordem.id,
          volume_id: volumeId,
          nota_fiscal_id: volume.nota_fiscal_id,
          linha: linha,
          coluna: coluna,
          posicao_celula: `${linha}-${coluna}`,
          data_enderecamento: new Date().toISOString(),
          enderecado_por: user.id
        };

        const created = await base44.entities.EnderecamentoVolume.create(enderecamento);
        novosEnderecamentos.push(created);
      }

      const enderecamentosAtualizados = [...enderecamentos, ...novosEnderecamentos];
      setEnderecamentos(enderecamentosAtualizados);
      setVolumesSelecionados([]);
      setShowBuscaModal(false);
      setCelulaAtiva(null);
      
      // Salvar rascunho
      localStorage.setItem(`enderecamento_rascunho_${ordem.id}`, JSON.stringify({
        enderecamentos: enderecamentosAtualizados,
        timestamp: new Date().toISOString()
      }));
      
      toast.success(`${volumesSelecionados.length} volume(s) alocado(s)!`);
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

  const handleRemoverNotaDaCelula = useCallback(async (linha, coluna, notaId) => {
    try {
      const endsParaRemover = enderecamentos.filter(e =>
        e.linha === linha && e.coluna === coluna && e.nota_fiscal_id === notaId
      );

      // Deletar em paralelo
      await Promise.all(endsParaRemover.map(end => 
        base44.entities.EnderecamentoVolume.delete(end.id)
      ));

      const enderecamentosAtualizados = enderecamentos.filter(e =>
        !(e.linha === linha && e.coluna === coluna && e.nota_fiscal_id === notaId)
      );
      setEnderecamentos(enderecamentosAtualizados);
      
      // Salvar rascunho
      localStorage.setItem(`enderecamento_rascunho_${ordem.id}`, JSON.stringify({
        enderecamentos: enderecamentosAtualizados,
        timestamp: new Date().toISOString()
      }));

      toast.success("Nota fiscal removida da célula!");
    } catch (error) {
      console.error("Erro ao remover:", error);
      toast.error("Erro ao remover da célula");
    }
  }, [enderecamentos, ordem.id]);

  const handlePesquisarChaveNF = async (chaveNF) => {
    const chave = chaveNF || searchChaveNF;
    
    if (!chave || chave.length !== 44) {
      return;
    }

    setProcessandoChave(true);
    try {
      // Buscar nota no banco de dados
      const notasExistentes = await base44.entities.NotaFiscal.filter({ chave_nota_fiscal: chave });
      
      if (notasExistentes.length > 0) {
        const notaExistente = notasExistentes[0];
        
        // Verificar se já está vinculada a esta ordem
        if (notaExistente.ordem_id === ordem.id) {
          // Buscar volumes da nota e selecionar automaticamente
          const volumesNota = volumesLocal.filter(v => v.nota_fiscal_id === notaExistente.id);
          const volumesNaoEnderecados = volumesNota.filter(v => {
            const idsEnderecados = enderecamentos.map(e => e.volume_id);
            return !idsEnderecados.includes(v.id);
          });
          
          setVolumesSelecionados(volumesNaoEnderecados.map(v => v.id));
          setSearchTerm("");
          setFiltroTipo("volume");
          setAbaAtiva("volumes");
          
          toast.success(`${volumesNaoEnderecados.length} volume(s) da NF ${notaExistente.numero_nota} selecionado(s)`);
          setSearchChaveNF("");
          
          // Manter foco no campo
          setTimeout(() => {
            if (inputChaveRef.current) {
              inputChaveRef.current.focus();
            }
          }, 100);
          
          setProcessandoChave(false);
          return;
        }

        // Nota existe mas não está vinculada - vincular automaticamente
        await base44.entities.NotaFiscal.update(notaExistente.id, {
          ordem_id: ordem.id,
          status_nf: "aguardando_expedicao",
          numero_area: notaExistente.numero_area || "manual"
        });

        // Buscar volumes da nota
        const volumesNota = await base44.entities.Volume.filter({ nota_fiscal_id: notaExistente.id });

        // Atualizar ordem com nova nota
        const notasIds = [...(ordem.notas_fiscais_ids || []), notaExistente.id];
        await base44.entities.OrdemDeCarregamento.update(ordem.id, {
          notas_fiscais_ids: notasIds
        });

        // Atualizar estados locais
        const notasAtualizadas = [...notasFiscaisLocal, notaExistente];
        const volumesAtualizados = [...volumesLocal, ...volumesNota];
        
        setNotasFiscaisLocal(notasAtualizadas);
        setVolumesLocal(volumesAtualizados);
        setNotasOrigem({ ...notasOrigem, [notaExistente.id]: "Adicionada" });
        
        // Salvar rascunho das notas e volumes vinculados
        localStorage.setItem(`enderecamento_notas_${ordem.id}`, JSON.stringify({
          notas: notasAtualizadas,
          volumes: volumesAtualizados,
          timestamp: new Date().toISOString()
        }));
        
        toast.success("Nota fiscal vinculada automaticamente!");
        setSearchChaveNF("");
        
        // Manter foco no campo
        setTimeout(() => {
          if (inputChaveRef.current) {
            inputChaveRef.current.focus();
          }
        }, 100);
        
        setProcessandoChave(false);
        return;
      }

      // Nota não existe - importar via API
      toast.info("Importando nota fiscal...");
      
      const response = await base44.functions.invoke('buscarNotaFiscalMeuDanfe', {
        chaveAcesso: chave
      });

      if (response.data.error) {
        toast.error("Erro ao importar nota: " + response.data.error);
        setProcessandoChave(false);
        return;
      }

      if (!response.data.xml) {
        toast.error("XML não retornado pela API");
        setProcessandoChave(false);
        return;
      }

      // Parse do XML
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(response.data.xml, "text/xml");
      
      // Extrair dados da NF-e
      const getNFeValue = (tag) => {
        const element = xmlDoc.getElementsByTagName(tag)[0];
        return element ? element.textContent : null;
      };
      
      const numeroNota = getNFeValue('nNF') || '';

      // Extrair dados do emit
      const emitElements = xmlDoc.getElementsByTagName('emit')[0];
      const emitCNPJ = emitElements?.getElementsByTagName('CNPJ')[0]?.textContent || '';
      const emitNome = emitElements?.getElementsByTagName('xNome')[0]?.textContent || '';
      const emitFone = emitElements?.getElementsByTagName('fone')[0]?.textContent || '';
      const emitEnder = emitElements?.getElementsByTagName('enderEmit')[0];
      
      // Extrair dados do dest
      const destElements = xmlDoc.getElementsByTagName('dest')[0];
      const destCNPJ = destElements?.getElementsByTagName('CNPJ')[0]?.textContent || '';
      const destNome = destElements?.getElementsByTagName('xNome')[0]?.textContent || '';
      const destFone = destElements?.getElementsByTagName('fone')[0]?.textContent || '';
      const destEnder = destElements?.getElementsByTagName('enderDest')[0];

      // Extrair informações de volume do XML
      const volElements = xmlDoc.getElementsByTagName('vol')[0];
      const quantidadeVolumes = parseInt(volElements?.getElementsByTagName('qVol')[0]?.textContent || '1');
      const pesoLiquido = parseFloat(volElements?.getElementsByTagName('pesoL')[0]?.textContent || '0');
      const pesoBruto = parseFloat(volElements?.getElementsByTagName('pesoB')[0]?.textContent || '0');
      
      const valorNF = parseFloat(getNFeValue('vNF') || '0');

      // Criar nota fiscal no banco
      const novaNF = await base44.entities.NotaFiscal.create({
        ordem_id: ordem.id,
        chave_nota_fiscal: chave,
        numero_nota: getNFeValue('nNF') || '',
        serie_nota: getNFeValue('serie') || '',
        data_hora_emissao: getNFeValue('dhEmi') || new Date().toISOString(),
        natureza_operacao: getNFeValue('natOp') || '',
        emitente_cnpj: emitCNPJ,
        emitente_razao_social: emitNome,
        emitente_telefone: emitFone,
        emitente_uf: emitEnder?.getElementsByTagName('UF')[0]?.textContent || '',
        emitente_cidade: emitEnder?.getElementsByTagName('xMun')[0]?.textContent || '',
        emitente_bairro: emitEnder?.getElementsByTagName('xBairro')[0]?.textContent || '',
        emitente_endereco: emitEnder?.getElementsByTagName('xLgr')[0]?.textContent || '',
        emitente_numero: emitEnder?.getElementsByTagName('nro')[0]?.textContent || '',
        emitente_cep: emitEnder?.getElementsByTagName('CEP')[0]?.textContent || '',
        destinatario_cnpj: destCNPJ,
        destinatario_razao_social: destNome,
        destinatario_telefone: destFone,
        destinatario_uf: destEnder?.getElementsByTagName('UF')[0]?.textContent || '',
        destinatario_cidade: destEnder?.getElementsByTagName('xMun')[0]?.textContent || '',
        destinatario_bairro: destEnder?.getElementsByTagName('xBairro')[0]?.textContent || '',
        destinatario_endereco: destEnder?.getElementsByTagName('xLgr')[0]?.textContent || '',
        destinatario_numero: destEnder?.getElementsByTagName('nro')[0]?.textContent || '',
        destinatario_cep: destEnder?.getElementsByTagName('CEP')[0]?.textContent || '',
        valor_nota_fiscal: valorNF,
        xml_content: response.data.xml,
        status_nf: "aguardando_expedicao",
        peso_total_nf: pesoBruto > 0 ? pesoBruto : pesoLiquido,
        quantidade_total_volumes_nf: quantidadeVolumes,
        numero_area: "manual"
      });

      // Criar volumes automaticamente
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

      // Atualizar ordem com nova nota e totais recalculados
      const notasIds = [...(ordem.notas_fiscais_ids || []), novaNF.id];
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

      // Atualizar estados locais
      const notasAtualizadas = [...notasFiscaisLocal, novaNF];
      const volumesAtualizados = [...volumesLocal, ...volumesCriados];
      
      setNotasFiscaisLocal(notasAtualizadas);
      setVolumesLocal(volumesAtualizados);
      setNotasOrigem({ ...notasOrigem, [novaNF.id]: "Importada" });
      
      // Salvar rascunho das notas e volumes vinculados
      localStorage.setItem(`enderecamento_notas_${ordem.id}`, JSON.stringify({
        notas: notasAtualizadas,
        volumes: volumesAtualizados,
        timestamp: new Date().toISOString()
      }));
      
      toast.success(`Nota fiscal importada! ${quantidadeVolumes} volume(s) criado(s).`);
      setSearchChaveNF("");
      
      // Manter foco no campo
      setTimeout(() => {
        if (inputChaveRef.current) {
          inputChaveRef.current.focus();
        }
      }, 100);
      
    } catch (error) {
      console.error("Erro ao processar chave NF:", error);
      toast.error("Erro ao processar nota fiscal");
      setSearchChaveNF("");
      
      // Manter foco no campo
      setTimeout(() => {
        if (inputChaveRef.current) {
          inputChaveRef.current.focus();
        }
      }, 100);
    } finally {
      setProcessandoChave(false);
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

  const handleDragEnd = async (result) => {
    if (!result.destination) return;

    const { source, destination } = result;

    // Se soltar na lista, apenas reorganizar (não fazer nada)
    if (destination.droppableId === "notas-list" || destination.droppableId === "notas-list-mobile" || 
        destination.droppableId === "volumes-list" || destination.droppableId === "volumes-list-mobile") {
      return;
    }

    // Se soltar em uma célula do layout
    if (destination.droppableId.startsWith("cell-")) {
      const draggableId = result.draggableId;
      const [_, linha, coluna] = destination.droppableId.split("-");

      // Se for uma nota sendo arrastada da célula (realocação)
      if (draggableId.startsWith("nota-") && draggableId.includes("-celula-")) {
        const notaIdMatch = draggableId.match(/nota-([^-]+)/);
        const notaId = notaIdMatch ? notaIdMatch[1] : null;
        const nota = notasFiscaisLocal.find(n => n.id === notaId);
        if (!nota) return;

        const volumesNota = volumesLocal.filter(v => v.nota_fiscal_id === notaId);
        
        const notaComDados = {
          ...nota,
          volumesDisponiveis: volumesNota,
          volumesJaEnderecados: [],
          estaRealocando: true,
          celulaOrigem: draggableId.match(/-celula-(\d+)-(.+)$/)
        };
        
        setNotaParaAlocar(notaComDados);
        setCelulaDestino({ linha: parseInt(linha), coluna });
        setShowSelecionarVolumes(true);
        return;
      }

      // Se for um volume individual sendo arrastado da lista
      const volumeId = draggableId;
      const volume = volumesLocal.find(v => v.id === volumeId);
      if (!volume) return;

      const nota = notasFiscaisLocal.find(nf => nf.id === volume.nota_fiscal_id);
      if (!nota) return;

      const volumesNota = volumesLocal.filter(v => v.nota_fiscal_id === nota.id);
      const volumesDisponiveis = volumesNota.filter(v => !idsEnderecados.includes(v.id));

      // Abrir modal para seleção de volumes (mesmo que seja só um)
      const notaComDados = {
        ...nota,
        volumesDisponiveis: volumesDisponiveis,
        volumesJaEnderecados: [],
        volumeInicial: volumeId, // Marcar qual volume foi arrastado
        estaRealocando: false,
        celulaOrigem: null
      };
      
      setNotaParaAlocar(notaComDados);
      setCelulaDestino({ linha: parseInt(linha), coluna });
      setShowSelecionarVolumes(true);
    }
  };

  const handleConfirmarVolumes = async (volumesIds) => {
    if (!celulaDestino || volumesIds.length === 0 || !notaParaAlocar) return;

    try {
      const user = await base44.auth.me();
      const { linha, coluna } = celulaDestino;

      // Se está realocando, remover endereçamentos anteriores PRIMEIRO
      if (notaParaAlocar.estaRealocando && notaParaAlocar.celulaOrigem) {
        const [_, linhaOrigem, colunaOrigem] = notaParaAlocar.celulaOrigem;
        const linhaOrigemInt = parseInt(linhaOrigem);
        
        const endsParaRemover = enderecamentos.filter(e =>
          e.linha === linhaOrigemInt && 
          e.coluna === colunaOrigem && 
          e.nota_fiscal_id === notaParaAlocar.id &&
          volumesIds.includes(e.volume_id) // Apenas os volumes selecionados
        );

        // Deletar em paralelo
        await Promise.all(endsParaRemover.map(end => 
          base44.entities.EnderecamentoVolume.delete(end.id)
        ));

        setEnderecamentos(prev => prev.filter(e => !endsParaRemover.some(er => er.id === e.id)));
      }

      // Criar novos endereçamentos em paralelo
      const enderecamentosPromises = volumesIds.map(async (volumeId) => {
        const volume = volumesLocal.find(v => v.id === volumeId);
        if (!volume) return null;

        // Endereçar = conferir automaticamente
        await base44.entities.Volume.update(volumeId, {
          status_volume: "carregado",
          localizacao_atual: `Ordem ${ordem.numero_carga || ordem.id.slice(-6)} - ${linha}-${coluna}`
        });

        const enderecamento = {
          ordem_id: ordem.id,
          volume_id: volumeId,
          nota_fiscal_id: volume.nota_fiscal_id,
          linha: linha,
          coluna: coluna,
          posicao_celula: `${linha}-${coluna}`,
          data_enderecamento: new Date().toISOString(),
          enderecado_por: user.id
        };

        return await base44.entities.EnderecamentoVolume.create(enderecamento);
      });

      const novosEnderecamentos = (await Promise.all(enderecamentosPromises)).filter(Boolean);

      const enderecamentosAtualizados = [...enderecamentos, ...novosEnderecamentos];
      setEnderecamentos(enderecamentosAtualizados);
      
      // Salvar rascunho
      localStorage.setItem(`enderecamento_rascunho_${ordem.id}`, JSON.stringify({
        enderecamentos: enderecamentosAtualizados,
        timestamp: new Date().toISOString()
      }));

      toast.success(`${volumesIds.length} volume(s) ${notaParaAlocar.estaRealocando ? 'realocado(s)' : 'endereçado(s)'}!`);
      setShowSelecionarVolumes(false);
      setNotaParaAlocar(null);
      setCelulaDestino(null);
    } catch (error) {
      console.error("Erro ao alocar volumes:", error);
      toast.error("Erro ao alocar volumes");
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

        // Verificar se já está endereçado
        const jaEnderecado = enderecamentos.some(e => e.volume_id === volumeEncontrado.id);
        if (jaEnderecado) {
          toast.warning(`Volume ${termoUpper} já foi endereçado`);
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
          
          // Salvar rascunho com todos os volumes
          localStorage.setItem(`enderecamento_notas_${ordem.id}`, JSON.stringify({
            notas: notaJaVinculada ? notasFiscaisLocal : [...notasFiscaisLocal, notaDoVolume],
            volumes: [...volumesLocal, ...volumesParaAdicionar],
            timestamp: new Date().toISOString()
          }));
        } else if (!notaJaVinculada) {
          // Salvar rascunho se nota foi vinculada
          localStorage.setItem(`enderecamento_notas_${ordem.id}`, JSON.stringify({
            notas: [...notasFiscaisLocal, notaDoVolume],
            volumes: volumesLocal,
            timestamp: new Date().toISOString()
          }));
        }

        // Selecionar apenas este volume bipado
        setVolumesSelecionados([volumeEncontrado.id]);
        setSearchTerm("");
        toast.success(`Volume ${termoUpper} selecionado! (${todosVolumesDaNota.length} vol. disponíveis)`);
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

          // Verificar quais volumes ainda não foram endereçados
          const idsEnderecados = enderecamentos.map(e => e.volume_id);
          const volumesNaoEnderecados = volumesDaEtiquetaDB.filter(v => !idsEnderecados.includes(v.id));
          
          if (volumesNaoEnderecados.length === 0) {
            toast.warning(`Todos os volumes da etiqueta ${etiquetaMae.codigo} já foram endereçados`);
            setSearchTerm("");
            setProcessandoBusca(false);
            return;
          }

          // Agrupar volumes por nota fiscal e buscar notas únicas
          const notasIdsUnicas = [...new Set(volumesDaEtiquetaDB.map(v => v.nota_fiscal_id).filter(Boolean))];
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
            
            // Salvar rascunho de notas e volumes
            localStorage.setItem(`enderecamento_notas_${ordem.id}`, JSON.stringify({
              notas: notasFiscaisLocal,
              volumes: [...volumesLocal, ...volumesParaAdicionar],
              timestamp: new Date().toISOString()
            }));
          }

          // Selecionar volumes não endereçados e finalizar
          setVolumesSelecionados(volumesNaoEnderecados.map(v => v.id));
          setSearchTerm("");
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
      toast.error(`Não encontrado: ${termoUpper}`);
      setSearchTerm("");
    } catch (error) {
      console.error("Erro ao buscar:", error);
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
          const volumesEndNota = enderecamentos.filter(e => e.nota_fiscal_id === nota.id);
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

      // Limpar rascunhos ao finalizar
      localStorage.removeItem(`enderecamento_rascunho_${ordem.id}`);
      localStorage.removeItem(`enderecamento_notas_${ordem.id}`);
      
      toast.success("Carregamento finalizado com sucesso!");
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
            .grid { width: 100%; border-collapse: collapse; margin-top: 10px; }
            .grid-row { display: table-row; }
            .grid-cell { border: 2px solid #333; padding: 6px; vertical-align: top; min-height: 50px; }
            .cell-header { font-weight: bold; background: #e8e8e8; text-align: center; padding: 6px; border: 2px solid #333; font-size: 11px; }
            .linha-header { font-weight: bold; background: #e8e8e8; text-align: center; width: 50px; }
            .nota-item { 
              background: #bfdbfe; 
              color: #1e3a8a; 
              padding: 3px 5px; 
              margin: 1px 0; 
              font-size: 9px; 
              border-radius: 2px; 
              display: flex; 
              align-items: center; 
              gap: 4px;
              border: 1px solid #93c5fd;
            }
            .nota-num { font-weight: bold; width: 45px; flex-shrink: 0; }
            .nota-forn { flex: 1; text-align: center; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
            .nota-qtd { font-weight: bold; width: 20px; text-align: right; flex-shrink: 0; }
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
              <div class="info-line"><strong>Volumes:</strong> ${volumesLocal.filter(v => notasFiscaisLocal.some(nf => nf.id === v.nota_fiscal_id)).length} total | ${enderecamentos.length} posicionados</div>
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
            const fornecedorAbreviado = nota.emitente_razao_social?.split(' ').slice(0, 2).join(' ').substring(0, 18) || 'N/A';
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
    let html = `
      <html>
        <head>
          <title>Layout de Carregamento - ${ordem.numero_carga}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            .header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #333; padding-bottom: 10px; }
            .info { margin-bottom: 20px; }
            .grid { display: table; border-collapse: collapse; width: 100%; margin-top: 20px; }
            .row { display: table-row; }
            .cell { display: table-cell; border: 2px solid #333; padding: 10px; vertical-align: top; min-height: 80px; }
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

  const notasDisponiveis = notasComVolumesNaoEnderecados;

  const totalVolumesOrdem = useMemo(() => 
    volumesLocal.filter(v => notasFiscaisLocal.some(nf => nf.id === v.nota_fiscal_id)).length,
    [volumesLocal, notasFiscaisLocal]
  );

  const progressoEnderecamento = useMemo(() => 
    totalVolumesOrdem > 0 ? (enderecamentos.length / totalVolumesOrdem) * 100 : 0,
    [enderecamentos.length, totalVolumesOrdem]
  );

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
                onClick={handleAbrirFinalizacao}
                disabled={saving}
                size="sm"
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <Save className="w-4 h-4 mr-1" />
                Finalizar
              </Button>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
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
              <div className="flex-1" />
              <Badge className="bg-blue-600 text-white text-xs">
                {enderecamentos.length}/{volumesLocal.filter(v => notasFiscaisLocal.some(nf => nf.id === v.nota_fiscal_id)).length} vol.
              </Badge>
              <Button
                variant="outline"
                onClick={handleImprimirLayout}
                disabled={enderecamentos.length === 0}
                size="sm"
                className="h-7"
                style={{ borderColor: theme.cardBorder, color: theme.text }}
              >
                <Printer className="w-3 h-3 mr-1" />
                Layout
              </Button>
              <Button
                variant="outline"
                onClick={handleImprimirListaNotas}
                size="sm"
                className="h-7"
                style={{ borderColor: theme.cardBorder, color: theme.text }}
              >
                <Printer className="w-3 h-3 mr-1" />
                Notas
              </Button>
            </div>
          </div>

          <div className="flex-1 flex overflow-hidden">
            {/* Painel Esquerdo Mobile - Volumes Não Alocados */}
            <div className="w-32 border-r flex flex-col overflow-hidden" style={{ borderColor: theme.cellBorder, backgroundColor: theme.cardBg }}>
              <div className="p-2 border-b" style={{ borderColor: theme.cardBorder }}>
                <h3 className="font-semibold text-xs" style={{ color: theme.text }}>
                  Notas Fiscais
                </h3>
                <p className="text-[9px]" style={{ color: theme.textMuted }}>
                  {notasDisponiveis.length} com volumes
                </p>
              </div>
              
              <Droppable droppableId="notas-list-mobile">
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className="flex-1 overflow-y-auto p-1 space-y-1"
                  >
                    {notasDisponiveis.map((nota, index) => {
                      return (
                        <Draggable key={nota.id} draggableId={`nota-${nota.id}`} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className="p-1.5 border rounded touch-none"
                              style={{
                                ...provided.draggableProps.style,
                                borderColor: snapshot.isDragging ? '#3b82f6' : theme.cardBorder,
                                backgroundColor: snapshot.isDragging 
                                  ? (isDark ? '#1e40af' : '#3b82f6')
                                  : theme.cardBg,
                                color: snapshot.isDragging ? '#ffffff' : 'inherit',
                                opacity: snapshot.isDragging ? 0.9 : 1
                              }}
                            >
                              <div className="flex items-center justify-between gap-1">
                                <p 
                                  className="font-bold text-[9px] shrink-0" 
                                  style={{ color: snapshot.isDragging ? '#ffffff' : theme.text }}
                                >
                                  NF {nota.numero_nota}
                                </p>
                                <Badge 
                                  className="text-[7px] h-3 px-1"
                                  style={{ 
                                    backgroundColor: snapshot.isDragging ? '#ffffff' : '#3b82f6',
                                    color: snapshot.isDragging ? '#1e40af' : '#ffffff'
                                  }}
                                >
                                  {nota.volumesDisponiveis.length} vol
                                </Badge>
                              </div>
                              <p 
                                className="text-[8px] leading-tight truncate" 
                                style={{ color: snapshot.isDragging ? '#e0e7ff' : theme.textMuted }}
                                title={nota.emitente_razao_social}
                              >
                                {nota.emitente_razao_social?.substring(0, 15)}
                              </p>
                            </div>
                          )}
                        </Draggable>
                      );
                    })}
                    {provided.placeholder}
                    
                    {notasDisponiveis.length === 0 && (
                      <div className="text-center py-4" style={{ color: theme.textMuted }}>
                        <FileText className="w-6 h-6 mx-auto mb-1 opacity-20" />
                        <p className="text-[9px]">Todos endereçados</p>
                      </div>
                    )}
                  </div>
                )}
              </Droppable>
            </div>

            {/* Grid do Veículo Mobile */}
            <div className="flex-1 overflow-auto p-2">
              <div className="border-2 rounded-lg overflow-hidden" style={{ borderColor: theme.cellBorder }}>
                {/* Cabeçalho */}
                <div className="grid gap-0" style={{ gridTemplateColumns: `50px repeat(${layoutConfig.colunas.length}, 1fr)` }}>
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
                    style={{ gridTemplateColumns: `50px repeat(${layoutConfig.colunas.length}, 1fr)` }}
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
                              className="p-1 border-b min-h-[70px] cursor-pointer active:bg-opacity-70 transition-colors relative"
                              style={{
                                backgroundColor: snapshot.isDraggingOver 
                                  ? (isDark ? '#1e40af44' : '#dbeafe') 
                                  : theme.cellBg,
                                borderColor: theme.cellBorder,
                                borderRight: idx < layoutConfig.colunas.length - 1 ? `1px solid ${theme.cellBorder}` : 'none'
                              }}
                            >
                              <div className="space-y-0.5">
                                {notasNaCelula.map((nota, notaIdx) => {
                                  const volumesNota = volumesNaCelula.filter(v => v.nota_fiscal_id === nota.id);
                                  const fornecedorAbreviado = nota.emitente_razao_social
                                    ?.split(' ')
                                    .slice(0, 1)
                                    .join(' ')
                                    .substring(0, 10) || 'N/A';
                                  
                                  return (
                                    <Draggable 
                                      key={nota.id} 
                                      draggableId={`nota-${nota.id}-celula-${linha}-${coluna}`} 
                                      index={notaIdx}
                                    >
                                      {(provided, snapshot) => (
                                        <div
                                          ref={provided.innerRef}
                                          {...provided.draggableProps}
                                          {...provided.dragHandleProps}
                                          className="flex items-center justify-between gap-0.5 px-1 py-0.5 rounded text-[8px] leading-tight group touch-none"
                                          style={{
                                            ...provided.draggableProps.style,
                                            backgroundColor: snapshot.isDragging 
                                              ? (isDark ? '#3b82f6' : '#60a5fa')
                                              : (isDark ? '#1e40af' : '#bfdbfe'),
                                            color: isDark ? '#ffffff' : '#1e3a8a',
                                            opacity: snapshot.isDragging ? 0.9 : 1
                                          }}
                                          onClick={(e) => e.stopPropagation()}
                                        >
                                          <span className="font-bold shrink-0 text-[9px]">
                                            {nota.numero_nota}
                                          </span>
                                          <span className="flex-1 truncate text-center px-0.5 text-[8px]" title={nota.emitente_razao_social}>
                                            {fornecedorAbreviado}
                                          </span>
                                          <span className="font-semibold shrink-0 text-[9px]">
                                            {volumesNota.length}
                                          </span>
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleRemoverNotaDaCelula(linha, coluna, nota.id);
                                            }}
                                            className="shrink-0 w-4 h-4 flex items-center justify-center rounded hover:bg-red-500 transition-colors opacity-0 group-hover:opacity-100"
                                            title="Remover"
                                          >
                                            <Trash2 className="w-2.5 h-2.5" />
                                          </button>
                                        </div>
                                      )}
                                    </Draggable>
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

              {/* Lista de Notas Fiscais Agrupadas */}
              <div className="flex-1 overflow-y-auto p-4">
                <DragDropContext onDragEnd={handleDragEnd}>
                  {usarBase && filtroTipo === "nota_fiscal" ? (
                    // Exibir notas da base quando modo "Base" ativado
                    <NotasBaseList
                      notasBaseBusca={notasBaseBusca}
                      notasFiscaisLocal={notasFiscaisLocal}
                      volumesLocal={volumesLocal}
                      onSelecionarNota={async (nota) => {
                        try {
                          const jaVinculada = notasFiscaisLocal.some(nf => nf.id === nota.id);
                          
                          if (!jaVinculada) {
                            await base44.entities.NotaFiscal.update(nota.id, {
                              ordem_id: ordem.id,
                              status_nf: "aguardando_expedicao"
                            });

                            const notasIds = [...(ordem.notas_fiscais_ids || []), nota.id];
                            await base44.entities.OrdemDeCarregamento.update(ordem.id, {
                              notas_fiscais_ids: notasIds
                            });

                            setNotasFiscaisLocal([...notasFiscaisLocal, nota]);
                            setNotasOrigem({ ...notasOrigem, [nota.id]: "Adicionada" });
                            
                            toast.success(`NF ${nota.numero_nota} vinculada à ordem!`);
                          }

                          let volumesNota = volumesLocal.filter(v => v.nota_fiscal_id === nota.id);
                          
                          if (volumesNota.length === 0) {
                            const volumesDB = await base44.entities.Volume.filter({ nota_fiscal_id: nota.id });
                            setVolumesLocal([...volumesLocal, ...volumesDB]);
                            volumesNota = volumesDB;
                          }
                          
                          const volumesNaoEnderecados = volumesNota.filter(v => {
                            const idsEnderecados = enderecamentos.map(e => e.volume_id);
                            return !idsEnderecados.includes(v.id);
                          });
                          
                          setVolumesSelecionados(volumesNaoEnderecados.map(v => v.id));
                          setNotasBaseBusca("");
                          setAbaAtiva("volumes");
                          
                          if (volumesNaoEnderecados.length > 0) {
                            toast.success(`${volumesNaoEnderecados.length} volume(s) selecionado(s)`);
                          } else {
                            toast.info("Todos os volumes desta NF já foram endereçados");
                          }
                        } catch (error) {
                          console.error("Erro ao vincular nota:", error);
                          toast.error("Erro ao vincular nota fiscal");
                        }
                      }}
                      theme={theme}
                      isDark={isDark}
                    />
                  ) : (
                    // Exibir notas agrupadas para drag and drop
                    <Droppable droppableId="notas-list">
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                          className="space-y-2"
                        >
                          {notasDisponiveis.map((nota, index) => {
                            const origem = notasOrigem[nota.id] || "Vinculada";
                            const origemColor = origem === "Vinculada" ? (isDark ? '#3b82f6' : '#2563eb') : 
                                              origem === "Adicionada" ? (isDark ? '#f59e0b' : '#d97706') : 
                                              (isDark ? '#10b981' : '#059669');

                            return (
                              <Draggable key={nota.id} draggableId={`nota-${nota.id}`} index={index}>
                                {(provided, snapshot) => (
                                  <div
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                    className="p-2 border rounded cursor-move hover:shadow-md transition-all"
                                    style={{
                                      ...provided.draggableProps.style,
                                      borderColor: snapshot.isDragging ? '#3b82f6' : theme.cardBorder,
                                      backgroundColor: snapshot.isDragging 
                                        ? (isDark ? '#1e40af' : '#3b82f6')
                                        : theme.cardBg,
                                      color: snapshot.isDragging ? '#ffffff' : 'inherit',
                                      opacity: snapshot.isDragging ? 0.95 : 1
                                    }}
                                  >
                                    <div className="flex items-center justify-between gap-2">
                                      <div className="flex items-center gap-2 min-w-0 flex-1">
                                        <FileText className="w-4 h-4 shrink-0" style={{ color: snapshot.isDragging ? '#ffffff' : '#3b82f6' }} />
                                        <div className="flex-1 min-w-0">
                                          <div className="flex items-center gap-2">
                                            <span 
                                              className="font-bold text-sm" 
                                              style={{ color: snapshot.isDragging ? '#ffffff' : theme.text }}
                                            >
                                              NF {nota.numero_nota}
                                            </span>
                                            <Badge
                                              className="text-[8px] h-4 px-1.5"
                                              style={{ 
                                                backgroundColor: snapshot.isDragging ? '#ffffff' : origemColor,
                                                color: snapshot.isDragging ? '#1e40af' : '#ffffff'
                                              }}
                                            >
                                              {origem}
                                            </Badge>
                                          </div>
                                          <p 
                                            className="text-xs truncate" 
                                            style={{ color: snapshot.isDragging ? '#e0e7ff' : theme.textMuted }}
                                            title={nota.emitente_razao_social}
                                          >
                                            {nota.emitente_razao_social}
                                          </p>
                                        </div>
                                      </div>
                                      <div className="shrink-0">
                                        <Badge 
                                          className="text-xs"
                                          style={{ 
                                            backgroundColor: snapshot.isDragging ? '#ffffff' : '#3b82f6',
                                            color: snapshot.isDragging ? '#1e40af' : '#ffffff'
                                          }}
                                        >
                                          {nota.volumesDisponiveis.length}/{nota.totalVolumes}
                                        </Badge>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-3 mt-1 text-xs" style={{ color: snapshot.isDragging ? '#e0e7ff' : theme.textMuted }}>
                                      <span>{(nota.peso_total_nf || 0).toLocaleString()} kg</span>
                                      <span>R$ {(nota.valor_nota_fiscal || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                                    </div>
                                  </div>
                                )}
                              </Draggable>
                            );
                          })}
                          {provided.placeholder}

                          {notasDisponiveis.length === 0 && (
                            <div className="text-center py-8" style={{ color: theme.textMuted }}>
                              <FileText className="w-12 h-12 mx-auto mb-2 opacity-20" />
                              <p className="text-sm">Todos os volumes foram endereçados!</p>
                            </div>
                          )}
                        </div>
                      )}
                    </Droppable>
                  )}
                </DragDropContext>
              </div>
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

        {/* Modal de Câmera Mobile */}
        {showCamera && (
          <CameraScanner
            open={showCamera}
            onClose={() => setShowCamera(false)}
            onScan={handleScanQRCode}
            isDark={isDark}
          />
        )}

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
              {enderecamentos.length} / {volumesLocal.filter(v => notasFiscaisLocal.some(nf => nf.id === v.nota_fiscal_id)).length} volumes
            </span>
          </div>
          <Progress value={progressoEnderecamento} className="h-3" />
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Painel Esquerdo - Volumes e Lista de Notas */}
        <div className="w-80 border-r flex flex-col" style={{ borderColor: theme.cardBorder, backgroundColor: theme.cardBg }}>
          <Tabs value={abaAtiva} onValueChange={setAbaAtiva} className="flex-1 flex flex-col">
            <TabsList className="grid w-full grid-cols-2 mx-4 mt-4">
              <TabsTrigger value="volumes" className="text-sm">
                <Package className="w-3 h-3 mr-1" />
                Volumes
              </TabsTrigger>
              <TabsTrigger value="notas" className="text-sm">
                <FileText className="w-3 h-3 mr-1" />
                Lista de Notas
              </TabsTrigger>
            </TabsList>

            {/* Aba Volumes */}
            <TabsContent value="volumes" className="flex-1 flex flex-col mt-0">
              <div className="p-4 border-b" style={{ borderColor: theme.cardBorder }}>
                <h3 className="font-semibold mb-3 flex items-center gap-2" style={{ color: theme.text }}>
                  <Package className="w-4 h-4" />
                  Volumes para Carregamento
                </h3>

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
                <div className="mb-3">
                  <Button
                    onClick={() => setShowCamera(true)}
                    className="bg-blue-600 hover:bg-blue-700 w-full h-9"
                    size="sm"
                  >
                    <Camera className="w-4 h-4 mr-2" />
                    Escanear QR Code
                  </Button>
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

              {/* Lista de Volumes Individuais */}
              <div className="flex-1 overflow-y-auto p-4">
                <Droppable droppableId="volumes-list">
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className="space-y-1"
                    >
                      {volumesNaoEnderecados.map((volume, index) => {
                        const nota = notasFiscaisLocal.find(nf => nf.id === volume.nota_fiscal_id);
                        const isSelecionado = volumesSelecionados.includes(volume.id);

                        return (
                          <Draggable key={volume.id} draggableId={volume.id} index={index}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                onClick={() => handleToggleVolume(volume.id)}
                                className="p-2 border rounded cursor-pointer hover:shadow-sm transition-all"
                                style={{
                                  ...provided.draggableProps.style,
                                  borderColor: isSelecionado ? '#3b82f6' : (snapshot.isDragging ? '#3b82f6' : theme.cardBorder),
                                  backgroundColor: snapshot.isDragging 
                                    ? (isDark ? '#1e40af' : '#3b82f6')
                                    : isSelecionado 
                                      ? (isDark ? '#1e3a8a' : '#dbeafe')
                                      : theme.cardBg,
                                  color: snapshot.isDragging ? '#ffffff' : 'inherit',
                                  opacity: snapshot.isDragging ? 0.9 : 1
                                }}
                              >
                                <div className="flex items-center gap-2">
                                  <Checkbox checked={isSelecionado} className="pointer-events-none" />
                                  <Package className="w-3 h-3 shrink-0" style={{ color: snapshot.isDragging ? '#ffffff' : '#3b82f6' }} />
                                  <div className="flex-1 min-w-0">
                                    <p 
                                      className="font-mono text-xs font-bold" 
                                      style={{ color: snapshot.isDragging ? '#ffffff' : theme.text }}
                                    >
                                      {volume.identificador_unico}
                                    </p>
                                    <p 
                                      className="text-[10px] truncate" 
                                      style={{ color: snapshot.isDragging ? '#e0e7ff' : theme.textMuted }}
                                    >
                                      NF {nota?.numero_nota} • {volume.peso_volume} kg
                                    </p>
                                  </div>
                                </div>
                              </div>
                            )}
                          </Draggable>
                        );
                      })}
                      {provided.placeholder}

                      {volumesNaoEnderecados.length === 0 && (
                        <div className="text-center py-8" style={{ color: theme.textMuted }}>
                          <Package className="w-12 h-12 mx-auto mb-2 opacity-20" />
                          <p className="text-sm">Todos os volumes foram endereçados!</p>
                        </div>
                      )}
                    </div>
                  )}
                </Droppable>
              </div>
            </TabsContent>

            {/* Aba Lista de Notas */}
            <TabsContent value="notas" className="flex-1 flex flex-col mt-0">
              <div className="p-4 border-b" style={{ borderColor: theme.cardBorder }}>
                <h3 className="font-semibold flex items-center gap-2" style={{ color: theme.text }}>
                  <FileText className="w-4 h-4" />
                  Notas Fiscais ({notasFiscaisLocal.length})
                </h3>
              </div>

              <div className="flex-1 overflow-y-auto p-4">
                <div className="space-y-1.5">
                  {notasFiscaisLocal.map((nota) => {
                    const volumesNota = volumesLocal.filter(v => v.nota_fiscal_id === nota.id);
                    const volumesEndNota = enderecamentos.filter(e => e.nota_fiscal_id === nota.id);
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
                            {origem === "Adicionada" && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-5 w-5 p-0 hover:bg-red-50 dark:hover:bg-red-950"
                                onClick={async (e) => {
                                  e.stopPropagation();
                                  if (!confirm(`Desvincular NF ${nota.numero_nota} e todos os seus volumes?`)) return;
                                  
                                  try {
                                    // Remover endereçamentos dos volumes desta nota
                                    const volumesNotaIds = volumesNota.map(v => v.id);
                                    const enderecamentosRemover = enderecamentos.filter(e => volumesNotaIds.includes(e.volume_id));
                                    
                                    for (const end of enderecamentosRemover) {
                                      await base44.entities.EnderecamentoVolume.delete(end.id);
                                    }

                                    // Remover nota da ordem
                                    const notasIds = (ordem.notas_fiscais_ids || []).filter(id => id !== nota.id);
                                    await base44.entities.OrdemDeCarregamento.update(ordem.id, {
                                      notas_fiscais_ids: notasIds
                                    });

                                    // Atualizar status da nota
                                    await base44.entities.NotaFiscal.update(nota.id, {
                                      ordem_id: null,
                                      status_nf: "recebida"
                                    });

                                    // Atualizar estados locais
                                    setNotasFiscaisLocal(notasFiscaisLocal.filter(nf => nf.id !== nota.id));
                                    setVolumesLocal(volumesLocal.filter(v => v.nota_fiscal_id !== nota.id));
                                    setEnderecamentos(enderecamentos.filter(e => !volumesNotaIds.includes(e.volume_id)));

                                    toast.success(`NF ${nota.numero_nota} desvinculada!`);
                                  } catch (error) {
                                    console.error("Erro ao desvincular nota:", error);
                                    toast.error("Erro ao desvincular nota");
                                  }
                                }}
                                title="Desvincular nota fiscal"
                              >
                                <Trash2 className="w-3 h-3 text-red-500" />
                              </Button>
                            )}
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
                  })}

                  {notasFiscaisLocal.length === 0 && (
                    <div className="text-center py-8" style={{ color: theme.textMuted }}>
                      <FileText className="w-12 h-12 mx-auto mb-2 opacity-20" />
                      <p className="text-sm">Nenhuma nota fiscal vinculada</p>
                    </div>
                  )}
                </div>
              </div>
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
              <div className="grid gap-0" style={{ gridTemplateColumns: `80px repeat(${layoutConfig.colunas.length}, 1fr)` }}>
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
                  style={{ gridTemplateColumns: `80px repeat(${layoutConfig.colunas.length}, 1fr)` }}
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
                            className="p-2 border-b min-h-[100px] cursor-pointer hover:bg-opacity-50 transition-colors"
                            style={{
                              backgroundColor: snapshot.isDraggingOver 
                                ? (isDark ? '#1e40af44' : '#dbeafe') 
                                : theme.cellBg,
                              borderColor: theme.cellBorder,
                              borderRight: idx < layoutConfig.colunas.length - 1 ? `1px solid ${theme.cellBorder}` : 'none'
                            }}
                          >
                            <div className="space-y-0.5">
                              {notasNaCelula.map((nota, notaIdx) => {
                                const volumesNota = volumesNaCelula.filter(v => v.nota_fiscal_id === nota.id);
                                const fornecedorAbreviado = nota.emitente_razao_social
                                  ?.split(' ')
                                  .slice(0, 2)
                                  .join(' ')
                                  .substring(0, 18) || 'N/A';
                                
                                return (
                                  <Draggable 
                                    key={nota.id} 
                                    draggableId={`nota-${nota.id}-celula-${linha}-${coluna}`} 
                                    index={notaIdx}
                                  >
                                    {(provided, snapshot) => (
                                      <div
                                        ref={provided.innerRef}
                                        {...provided.draggableProps}
                                        {...provided.dragHandleProps}
                                        className="flex items-center justify-between gap-1 px-1.5 py-0.5 rounded text-[10px] leading-tight group"
                                        style={{
                                          ...provided.draggableProps.style,
                                          backgroundColor: snapshot.isDragging 
                                            ? (isDark ? '#3b82f6' : '#60a5fa')
                                            : (isDark ? '#1e40af' : '#bfdbfe'),
                                          color: isDark ? '#ffffff' : '#1e3a8a',
                                          opacity: snapshot.isDragging ? 0.9 : 1
                                        }}
                                        onClick={(e) => e.stopPropagation()}
                                      >
                                        <span className="font-bold shrink-0 w-12">
                                          {nota.numero_nota}
                                        </span>
                                        <span className="flex-1 truncate text-center px-0.5" title={nota.emitente_razao_social}>
                                          {fornecedorAbreviado}
                                        </span>
                                        <span className="font-semibold shrink-0 w-5 text-right">
                                          {volumesNota.length}
                                        </span>
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleRemoverNotaDaCelula(linha, coluna, nota.id);
                                          }}
                                          className="shrink-0 w-4 h-4 flex items-center justify-center rounded hover:bg-red-500 transition-colors opacity-0 group-hover:opacity-100"
                                          title="Remover"
                                        >
                                          <Trash2 className="w-2.5 h-2.5" />
                                        </button>
                                      </div>
                                    )}
                                  </Draggable>
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

      {/* Modal de Câmera Desktop */}
      {showCamera && (
        <CameraScanner
          open={showCamera}
          onClose={() => setShowCamera(false)}
          onScan={handleScanQRCode}
          isDark={isDark}
        />
      )}

      {/* Modal Selecionar Volumes */}
      {showSelecionarVolumes && notaParaAlocar && celulaDestino && (
        <SelecionarVolumesModal
          open={showSelecionarVolumes}
          onClose={() => {
            setShowSelecionarVolumes(false);
            setNotaParaAlocar(null);
            setCelulaDestino(null);
          }}
          nota={notaParaAlocar}
          volumesDisponiveis={notaParaAlocar.volumesDisponiveis}
          volumesJaEnderecados={notaParaAlocar.volumesJaEnderecados}
          onConfirmar={handleConfirmarVolumes}
          isDark={isDark}
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