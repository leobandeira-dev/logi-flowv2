import React, { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, RefreshCw, Eye, Edit, Tag, Package, Download, Printer, FileStack, TrendingUp, Calendar, Clock, FileText, Layers } from "lucide-react";
import { toast } from "sonner";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { CheckCircle2 } from "lucide-react";
import ImpressaoEtiquetas from "./ImpressaoEtiquetas";
import NotaFiscalForm from "./NotaFiscalForm";
import VolumesModal from "./VolumesModal";

const statusConfig = {
  aguardando_coleta: { label: "Aguardando Coleta", color: "bg-yellow-500" },
  coletado: { label: "Coletado", color: "bg-blue-500" },
  aguardando_consolidacao: { label: "Aguardando Consolidação", color: "bg-orange-500" },
  recebida: { label: "Recebida", color: "bg-green-500" },
  aguardando_expedicao: { label: "Aguardando Expedição", color: "bg-purple-500" },
  em_viagem: { label: "Em Viagem", color: "bg-indigo-500" },
  na_filial_destino: { label: "Na Filial de Destino", color: "bg-cyan-500" },
  em_rota_entrega: { label: "Em Rota de Entrega", color: "bg-violet-500" },
  entregue: { label: "Entregue", color: "bg-emerald-600" },
  cancelada: { label: "Cancelada", color: "bg-red-500" }
};

const statusVolumeConfig = {
  criado: { label: "Criado", color: "bg-gray-500" },
  etiquetado: { label: "Etiquetado", color: "bg-blue-500" },
  separado: { label: "Separado", color: "bg-green-500" },
  carregado: { label: "Carregado", color: "bg-purple-500" },
  em_transito: { label: "Em Trânsito", color: "bg-indigo-500" },
  entregue: { label: "Entregue", color: "bg-emerald-600" }
};

const calcularStatusDinamico = (nota) => {
  if (!nota) return "recebida";
  if (nota.data_entregue) return "entregue";
  if (nota.data_saida_para_entrega && !nota.data_entregue) return "em_rota_entrega";
  if (nota.data_chegada_destino_final && !nota.data_saida_para_entrega) return "na_filial_destino";
  if (nota.data_saida_para_viagem && !nota.data_chegada_destino_final) return "em_viagem";
  if (nota.data_coletado && nota.data_chegada_filial && !nota.data_saida_para_viagem) return "aguardando_consolidacao";
  if (nota.data_coletado && !nota.data_chegada_filial && !nota.data_saida_para_viagem) return "coletado";
  if (nota.data_coleta_solicitada && !nota.data_coletado) return "aguardando_coleta";
  return nota.status_nf || "recebida";
};

const NotasFiscaisTable = React.memo(function NotasFiscaisTable({ 
  notasFiscais = [], 
  notasFiscaisPaginadas = null,
  volumes = [], 
  ordens = [],
  empresa = null,
  onRefresh,
  isDark = false,
  showFilters = true
}) {
  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("todos");
  const [selectedNota, setSelectedNota] = useState(null);
  const [notaVolumes, setNotaVolumes] = useState([]);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [notaParaImprimir, setNotaParaImprimir] = useState(null);
  const [volumesParaImprimir, setVolumesParaImprimir] = useState([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [notaParaEditar, setNotaParaEditar] = useState(null);
  const [showVolumesModal, setShowVolumesModal] = useState(false);
  const [notaParaEditarVolumes, setNotaParaEditarVolumes] = useState(null);
  const [volumesParaEditar, setVolumesParaEditar] = useState([]);
  const [imprimindoLote, setImprimindoLote] = useState(false);
  const [visualizacaoGrafico, setVisualizacaoGrafico] = useState("diario");
  const [metricaGrafico, setMetricaGrafico] = useState("notas");
  const [graficoExpandido, setGraficoExpandido] = useState(false);
  const [anoSelecionado, setAnoSelecionado] = useState(() => new Date().getFullYear());
  const [mesSelecionado, setMesSelecionado] = useState(() => new Date().getMonth() + 1);

  const handleViewDetails = (nota) => {
    setSelectedNota(nota);
    const volumesDaNota = volumes.filter(v => v.nota_fiscal_id === nota.id);
    setNotaVolumes(volumesDaNota);
  };

  const handlePrintEtiquetas = async (nota) => {
    try {
      // Buscar volumes sempre do banco de dados para garantir dados atualizados
      const volumesDaNota = await base44.entities.Volume.filter({ nota_fiscal_id: nota.id });
      
      if (volumesDaNota.length === 0) {
        toast.error("Nenhum volume encontrado para esta nota fiscal");
        return;
      }
      
      setNotaParaImprimir(nota);
      setVolumesParaImprimir(volumesDaNota);
      setShowPrintModal(true);
    } catch (error) {
      console.error("Erro ao buscar volumes:", error);
      toast.error("Erro ao buscar volumes da nota fiscal");
    }
  };

  const handleEditNota = (nota) => {
    setNotaParaEditar(nota);
    setShowEditModal(true);
  };

  const handleSaveNota = async (notaData) => {
    try {
      if (notaParaEditar?.id) {
        await base44.entities.NotaFiscal.update(notaParaEditar.id, notaData);
        toast.success("Nota fiscal atualizada com sucesso!");
      }
      setShowEditModal(false);
      setNotaParaEditar(null);
      if (onRefresh) onRefresh();
    } catch (error) {
      console.error("Erro ao salvar nota fiscal:", error);
      toast.error("Erro ao salvar nota fiscal");
    }
  };

  const handleEditVolumes = (nota) => {
    const volumesDaNota = volumes.filter(v => v.nota_fiscal_id === nota.id);
    setNotaParaEditarVolumes(nota);
    setVolumesParaEditar(volumesDaNota);
    setShowVolumesModal(true);
  };

  const handleSaveVolumes = async (volumesAtualizados) => {
    try {
      const volumesExistentes = volumes.filter(v => v.nota_fiscal_id === notaParaEditarVolumes.id);
      const volumesParaDeletar = volumesExistentes.filter(
        ve => !volumesAtualizados.find(va => va.id === ve.id)
      );

      for (const volume of volumesParaDeletar) {
        await base44.entities.Volume.delete(volume.id);
      }

      for (const volume of volumesAtualizados) {
        const volumeData = {
          nota_fiscal_id: notaParaEditarVolumes.id,
          ordem_id: notaParaEditarVolumes.ordem_id,
          identificador_unico: volume.identificador_unico,
          altura: volume.altura,
          largura: volume.largura,
          comprimento: volume.comprimento,
          m3: volume.m3,
          peso_volume: volume.peso_volume,
          quantidade: volume.quantidade || 1,
          numero_sequencial: volume.numero_sequencial
        };

        if (volume.id) {
          await base44.entities.Volume.update(volume.id, volumeData);
        } else {
          await base44.entities.Volume.create(volumeData);
        }
      }

      const pesoTotal = volumesAtualizados.reduce((acc, v) => acc + (parseFloat(v.peso_volume) || 0), 0);
      const qtdTotal = volumesAtualizados.reduce((acc, v) => acc + (parseInt(v.quantidade) || 1), 0);

      await base44.entities.NotaFiscal.update(notaParaEditarVolumes.id, {
        peso_total_nf: pesoTotal,
        quantidade_total_volumes_nf: qtdTotal
      });

      toast.success("Volumes atualizados com sucesso!");
      setShowVolumesModal(false);
      setNotaParaEditarVolumes(null);
      setVolumesParaEditar([]);
      if (onRefresh) onRefresh();
    } catch (error) {
      console.error("Erro ao salvar volumes:", error);
      toast.error("Erro ao salvar volumes");
    }
  };

  const handleDownloadXML = (nota) => {
    if (!nota.xml_content) {
      toast.error("XML não disponível para esta nota fiscal");
      return;
    }

    try {
      const blob = new Blob([nota.xml_content], { type: 'application/xml' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `NF-${nota.numero_nota}-${nota.chave_nota_fiscal}.xml`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success("XML baixado com sucesso!");
    } catch (error) {
      console.error("Erro ao baixar XML:", error);
      toast.error("Erro ao baixar XML");
    }
  };

  const handlePrintDANFE = async (nota) => {
    if (!nota.chave_nota_fiscal || nota.chave_nota_fiscal.length !== 44) {
      toast.error("Chave de acesso inválida");
      return;
    }

    toast.info("Gerando DANFE...");
    
    try {
      const { data } = await base44.functions.invoke('gerarDanfePdf', {
        chaveAcesso: nota.chave_nota_fiscal
      });

      if (!data?.success || !data?.pdf) {
        toast.error(data?.error || "Erro ao gerar DANFE");
        return;
      }

      try {
        await base44.entities.NotaFiscal.update(nota.id, {
          danfe_nfe_url: "gerado"
        });
        if (onRefresh) onRefresh();
      } catch (error) {
        console.log("Não foi possível atualizar status do DANFE:", error);
      }

      const binaryString = atob(data.pdf);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const blob = new Blob([bytes], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);

      const printWindow = window.open(url, '_blank');
      if (!printWindow) {
        toast.error('Por favor, permita pop-ups para imprimir o DANFE');
        window.URL.revokeObjectURL(url);
        return;
      }
      
      printWindow.onload = function() {
        setTimeout(() => {
          printWindow.print();
          window.URL.revokeObjectURL(url);
        }, 500);
      };
      
      toast.success("DANFE gerado com sucesso!");
    } catch (error) {
      console.error("Erro ao gerar DANFE:", error);
      toast.error(error.message || "Erro ao gerar DANFE");
    }
  };

  const handlePrintAllDANFE = async () => {
    const notasValidas = filteredNotas.filter(n => n.chave_nota_fiscal && n.chave_nota_fiscal.length === 44);
    
    if (notasValidas.length === 0) {
      toast.error("Nenhuma nota com chave de acesso válida");
      return;
    }

    const confirmacao = confirm(`Deseja imprimir ${notasValidas.length} DANFEs em lote? Isso pode demorar alguns segundos.`);
    if (!confirmacao) return;

    setImprimindoLote(true);
    toast.info(`Processando ${notasValidas.length} DANFEs...`);

    let sucessos = 0;
    let falhas = 0;
    const errosDetalhados = [];

    for (let i = 0; i < notasValidas.length; i++) {
      const nota = notasValidas[i];
      
      try {
        toast.info(`Gerando DANFE ${i + 1}/${notasValidas.length} - NF ${nota.numero_nota}...`);
        
        const response = await base44.functions.invoke('gerarDanfePdf', {
          chaveAcesso: nota.chave_nota_fiscal
        });

        if (!response?.data?.success || !response?.data?.pdf) {
          const erro = response?.data?.error || "Resposta inválida da API";
          errosDetalhados.push(`NF ${nota.numero_nota}: ${erro}`);
          falhas++;
          continue;
        }

        const binaryString = atob(response.data.pdf);
        const bytes = new Uint8Array(binaryString.length);
        for (let j = 0; j < binaryString.length; j++) {
          bytes[j] = binaryString.charCodeAt(j);
        }
        const blob = new Blob([bytes], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);

        const printWindow = window.open(url, '_blank');
        
        if (printWindow) {
          printWindow.onload = function() {
            setTimeout(() => {
              printWindow.print();
              window.URL.revokeObjectURL(url);
            }, 500);
          };
          
          sucessos++;
          
          try {
            await base44.entities.NotaFiscal.update(nota.id, {
              danfe_nfe_url: "gerado"
            });
          } catch (error) {
            console.log("Não foi possível atualizar status do DANFE:", error);
          }
        } else {
          errosDetalhados.push(`NF ${nota.numero_nota}: Bloqueio de pop-up`);
          falhas++;
        }

        if (i < notasValidas.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      } catch (error) {
        console.error(`Erro ao gerar DANFE da NF ${nota.numero_nota}:`, error);
        errosDetalhados.push(`NF ${nota.numero_nota}: ${error.message}`);
        falhas++;
      }
    }

    setImprimindoLote(false);
    
    if (sucessos > 0) {
      toast.success(`${sucessos} DANFE(s) gerado(s) com sucesso!${falhas > 0 ? ` (${falhas} falha(s))` : ''}`);
      if (onRefresh) onRefresh();
    } else {
      console.error("Erros detalhados:", errosDetalhados);
      toast.error(`Nenhum DANFE foi gerado. Verifique o console para detalhes.`);
    }
  };

  // Usar notasFiscaisPaginadas se fornecido (para exibição na tabela), senão usar todas
  const notasParaTabela = useMemo(() => notasFiscaisPaginadas || notasFiscais, [notasFiscaisPaginadas, notasFiscais]);
  
  // Memoizar filteredNotas para evitar recalcular a cada render
  const filteredNotas = useMemo(() => {
    return notasParaTabela.filter(nota => {
      const ordem = ordens.find(o => o.id === nota.ordem_id);
      const numeroCarga = ordem?.numero_carga || '';
      
      const matchesSearch = !searchTerm || 
        nota.numero_nota?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        nota.chave_nota_fiscal?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        nota.emitente_razao_social?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        nota.destinatario_razao_social?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        numeroCarga.toLowerCase().includes(searchTerm.toLowerCase());

      const statusDinamico = calcularStatusDinamico(nota);
      const matchesStatus = filtroStatus === "todos" || statusDinamico === filtroStatus;

      return matchesSearch && matchesStatus;
    });
  }, [notasParaTabela, searchTerm, filtroStatus, ordens]);

  // Memoizar dados do gráfico para evitar recalcular a cada digitação
  const dadosGrafico = useMemo(() => {
    if (visualizacaoGrafico === "diario") {
      const hoje = new Date().toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' });
      const notasHoje = notasFiscais.filter(n => {
        if (!n.created_date || n.status_nf === "cancelada") return false;
        const dataNota = new Date(n.created_date).toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' });
        return dataNota === hoje;
      });

      const porHora = Array.from({ length: 24 }, (_, i) => ({ hora: `${String(i).padStart(2, '0')}:00`, quantidade: 0 }));
      notasHoje.forEach(nota => {
        const dateUTC = new Date(nota.created_date.includes('Z') ? nota.created_date : nota.created_date + 'Z');
        const horaStr = dateUTC.toLocaleTimeString('pt-BR', { timeZone: 'America/Sao_Paulo', hour: '2-digit', hour12: false });
        const hora = parseInt(horaStr.split(':')[0]);
        if (hora >= 0 && hora < 24) {
          if (metricaGrafico === "notas") {
            porHora[hora].quantidade++;
          } else {
            porHora[hora].quantidade += (nota.quantidade_total_volumes_nf || 0);
          }
        }
      });
      return porHora;
    } else if (visualizacaoGrafico === "mensal") {
      const hoje = new Date();
      const dataHojeSP = hoje.toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' });
      const [dia, mes, ano] = dataHojeSP.split('/');
      const mesAtual = parseInt(mes) - 1;
      const anoAtual = parseInt(ano);
      const diasNoMes = new Date(anoAtual, mesAtual + 1, 0).getDate();

      const notasMes = notasFiscais.filter(n => {
        if (!n.created_date || n.status_nf === "cancelada") return false;
        const dataNota = new Date(n.created_date).toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' });
        const [, mesNota, anoNota] = dataNota.split('/');
        return mesNota === mes && anoNota === ano;
      });

      const porDia = Array.from({ length: diasNoMes }, (_, i) => ({ dia: String(i + 1).padStart(2, '0'), quantidade: 0 }));
      notasMes.forEach(nota => {
        const dataNota = new Date(nota.created_date).toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' });
        const [diaNota] = dataNota.split('/');
        const diaNum = parseInt(diaNota);
        if (diaNum > 0 && diaNum <= diasNoMes) {
          if (metricaGrafico === "notas") {
            porDia[diaNum - 1].quantidade++;
          } else {
            porDia[diaNum - 1].quantidade += (nota.quantidade_total_volumes_nf || 0);
          }
        }
      });
      return porDia;
    } else {
      const diasNoMes = new Date(anoSelecionado, mesSelecionado, 0).getDate();
      const notasMesSelecionado = notasFiscais.filter(n => {
        if (!n.created_date || n.status_nf === "cancelada") return false;
        const dataNota = new Date(n.created_date).toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' });
        const [, mesNota, anoNota] = dataNota.split('/');
        return parseInt(mesNota) === mesSelecionado && parseInt(anoNota) === anoSelecionado;
      });

      const porDia = Array.from({ length: diasNoMes }, (_, i) => ({ dia: String(i + 1).padStart(2, '0'), quantidade: 0 }));
      notasMesSelecionado.forEach(nota => {
        const dataNota = new Date(nota.created_date).toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' });
        const [diaNota] = dataNota.split('/');
        const diaNum = parseInt(diaNota);
        if (diaNum > 0 && diaNum <= diasNoMes) {
          if (metricaGrafico === "notas") {
            porDia[diaNum - 1].quantidade++;
          } else {
            porDia[diaNum - 1].quantidade += (nota.quantidade_total_volumes_nf || 0);
          }
        }
      });
      return porDia;
    }
  }, [notasFiscais, visualizacaoGrafico, metricaGrafico, mesSelecionado, anoSelecionado]);

  const theme = {
    cardBg: isDark ? '#1e293b' : '#ffffff',
    cardBorder: isDark ? '#334155' : '#e5e7eb',
    text: isDark ? '#f1f5f9' : '#111827',
    textMuted: isDark ? '#94a3b8' : '#6b7280',
    inputBg: isDark ? '#1e293b' : '#ffffff',
    inputBorder: isDark ? '#334155' : '#d1d5db',
  };

  return (
    <>
      {/* Gráfico */}
      <Card className="mb-4" style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <button
              onClick={() => setGraficoExpandido(!graficoExpandido)}
              className="flex items-center gap-2 hover:opacity-70 transition-opacity"
            >
              <CardTitle className="text-sm flex items-center gap-2" style={{ color: theme.text }}>
                <TrendingUp className="w-4 h-4 text-blue-600" />
                {metricaGrafico === "notas" ? "Quantidade de Notas Fiscais" : "Volume de Volumes"}
              </CardTitle>
              <Badge variant="outline" className="text-xs">
                {graficoExpandido ? "Retrair" : "Expandir"}
              </Badge>
            </button>
            <div className="flex gap-2 flex-wrap">
              <Button
                variant={metricaGrafico === "notas" ? "default" : "outline"}
                size="sm"
                onClick={() => setMetricaGrafico("notas")}
                className={metricaGrafico === "notas" ? "bg-blue-600 h-7 text-xs" : "h-7 text-xs"}
                style={metricaGrafico !== "notas" ? { borderColor: theme.inputBorder, color: theme.text } : {}}
              >
                <FileText className="w-3 h-3 mr-1" />
                Notas
              </Button>
              <Button
                variant={metricaGrafico === "volumes" ? "default" : "outline"}
                size="sm"
                onClick={() => setMetricaGrafico("volumes")}
                className={metricaGrafico === "volumes" ? "bg-purple-600 h-7 text-xs" : "h-7 text-xs"}
                style={metricaGrafico !== "volumes" ? { borderColor: theme.inputBorder, color: theme.text } : {}}
              >
                <Layers className="w-3 h-3 mr-1" />
                Volumes
              </Button>
              <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />
              <Button
                variant={visualizacaoGrafico === "diario" ? "default" : "outline"}
                size="sm"
                onClick={() => setVisualizacaoGrafico("diario")}
                className={visualizacaoGrafico === "diario" ? "bg-blue-600 h-7 text-xs" : "h-7 text-xs"}
                style={visualizacaoGrafico !== "diario" ? { borderColor: theme.inputBorder, color: theme.text } : {}}
              >
                <Clock className="w-3 h-3 mr-1" />
                Diário
              </Button>
              <Button
                variant={visualizacaoGrafico === "mensal" ? "default" : "outline"}
                size="sm"
                onClick={() => setVisualizacaoGrafico("mensal")}
                className={visualizacaoGrafico === "mensal" ? "bg-green-600 h-7 text-xs" : "h-7 text-xs"}
                style={visualizacaoGrafico !== "mensal" ? { borderColor: theme.inputBorder, color: theme.text } : {}}
              >
                <Calendar className="w-3 h-3 mr-1" />
                Mensal
              </Button>
              <Button
                variant={visualizacaoGrafico === "periodo" ? "default" : "outline"}
                size="sm"
                onClick={() => setVisualizacaoGrafico("periodo")}
                className={visualizacaoGrafico === "periodo" ? "bg-purple-600 h-7 text-xs" : "h-7 text-xs"}
                style={visualizacaoGrafico !== "periodo" ? { borderColor: theme.inputBorder, color: theme.text } : {}}
              >
                <Calendar className="w-3 h-3 mr-1" />
                Período
              </Button>
              {visualizacaoGrafico === "periodo" && (
                <>
                  <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />
                  <select
                    value={mesSelecionado}
                    onChange={(e) => setMesSelecionado(parseInt(e.target.value))}
                    className="h-7 text-xs px-2 rounded-lg border"
                    style={{ backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.text }}
                  >
                    <option value={1}>Janeiro</option>
                    <option value={2}>Fevereiro</option>
                    <option value={3}>Março</option>
                    <option value={4}>Abril</option>
                    <option value={5}>Maio</option>
                    <option value={6}>Junho</option>
                    <option value={7}>Julho</option>
                    <option value={8}>Agosto</option>
                    <option value={9}>Setembro</option>
                    <option value={10}>Outubro</option>
                    <option value={11}>Novembro</option>
                    <option value={12}>Dezembro</option>
                  </select>
                  <select
                    value={anoSelecionado}
                    onChange={(e) => setAnoSelecionado(parseInt(e.target.value))}
                    className="h-7 text-xs px-2 rounded-lg border"
                    style={{ backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.text }}
                  >
                    {[2025, 2024, 2023, 2022, 2021].map(ano => (
                      <option key={ano} value={ano}>{ano}</option>
                    ))}
                  </select>
                </>
              )}
            </div>
          </div>
        </CardHeader>
        {graficoExpandido && (
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={dadosGrafico}>
              <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#334155' : '#e5e7eb'} />
              <XAxis 
                dataKey={visualizacaoGrafico === "diario" ? "hora" : "dia"}
                tick={{ fill: theme.textMuted, fontSize: 11 }}
                stroke={isDark ? '#475569' : '#d1d5db'}
              />
              <YAxis 
                tick={{ fill: theme.textMuted, fontSize: 11 }}
                stroke={isDark ? '#475569' : '#d1d5db'}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: theme.cardBg,
                  borderColor: theme.cardBorder,
                  color: theme.text,
                  fontSize: '12px',
                  borderRadius: '6px'
                }}
                labelStyle={{ color: theme.text }}
              />
              <Line 
                type="monotone" 
                dataKey="quantidade" 
                stroke={metricaGrafico === "notas" ? "#3b82f6" : "#a855f7"} 
                strokeWidth={2}
                dot={{ fill: metricaGrafico === "notas" ? "#3b82f6" : "#a855f7", r: 3 }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
          <p className="text-xs text-center mt-2" style={{ color: theme.textMuted }}>
            {(() => {
              const hoje = new Date();
              const dataHojeSP = hoje.toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' });
              const [diaHojeSP, mesHojeSP, anoHojeSP] = dataHojeSP.split('/');

              if (visualizacaoGrafico === "diario") {
                const notasHoje = notasFiscais.filter(n => {
                  if (!n.created_date) return false;
                  const dataNota = new Date(n.created_date).toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' });
                  return dataNota === dataHojeSP;
                });
                const total = metricaGrafico === "notas" 
                  ? notasHoje.length 
                  : notasHoje.reduce((sum, n) => sum + (n.quantidade_total_volumes_nf || 0), 0);
                return `${metricaGrafico === "notas" ? "Notas" : "Volumes"} de hoje (${diaHojeSP}/${mesHojeSP}/${anoHojeSP}) por hora - Total: ${total}`;
              } else if (visualizacaoGrafico === "mensal") {
                const notasMes = notasFiscais.filter(n => {
                  if (!n.created_date) return false;
                  const dataNota = new Date(n.created_date).toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' });
                  const [, mesNota, anoNota] = dataNota.split('/');
                  return mesNota === mesHojeSP && anoNota === anoHojeSP;
                });
                const total = metricaGrafico === "notas" 
                  ? notasMes.length 
                  : notasMes.reduce((sum, n) => sum + (n.quantidade_total_volumes_nf || 0), 0);
                const mesNome = new Date(parseInt(anoHojeSP), parseInt(mesHojeSP) - 1, 1).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
                return `${metricaGrafico === "notas" ? "Notas" : "Volumes"} de ${mesNome} - Total: ${total}`;
              } else {
                const notasMesSelecionado = notasFiscais.filter(n => {
                  if (!n.created_date || n.status_nf === "cancelada") return false;
                  const dataNota = new Date(n.created_date).toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' });
                  const [, mesNota, anoNota] = dataNota.split('/');
                  return parseInt(mesNota) === mesSelecionado && parseInt(anoNota) === anoSelecionado;
                });
                const total = metricaGrafico === "notas" 
                  ? notasMesSelecionado.length 
                  : notasMesSelecionado.reduce((sum, n) => sum + (n.quantidade_total_volumes_nf || 0), 0);
                const mesNome = new Date(anoSelecionado, mesSelecionado - 1, 1).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
                return `${metricaGrafico === "notas" ? "Notas" : "Volumes"} de ${mesNome} - Total: ${total}`;
              }
            })()}
          </p>
        </CardContent>
        )}
      </Card>

      {showFilters && (
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-4 gap-4">
          <div className="flex gap-2 w-full lg:w-auto flex-1">
            <div className="relative flex-1 lg:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: theme.textMuted }} />
              <Input
                placeholder="Buscar notas..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    setSearchTerm(searchInput);
                  }
                }}
                className="pl-10 h-9 text-sm"
                style={{ backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.text }}
              />
            </div>
            <Button
              variant="default"
              size="sm"
              onClick={() => {
                setSearchTerm(searchInput);
              }}
              className="bg-blue-600 hover:bg-blue-700 h-9"
            >
              <Search className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              className="h-9"
              style={{ borderColor: theme.inputBorder, color: theme.text }}
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrintAllDANFE}
            disabled={imprimindoLote || filteredNotas.length === 0}
            className="h-9 w-full lg:w-auto"
            style={{ borderColor: '#10b981', color: '#10b981' }}
          >
            <FileStack className="w-4 h-4 mr-2" />
            {imprimindoLote ? "Imprimindo..." : `Imprimir ${filteredNotas.length} DANFE(s)`}
          </Button>
        </div>
      )}

      {showFilters && (
        <div className="flex gap-2 mb-4 flex-wrap">
          <Badge
            variant={filtroStatus === "todos" ? "default" : "outline"}
            className="cursor-pointer text-xs"
            onClick={() => setFiltroStatus("todos")}
          >
            Todos ({notasFiscais.length})
          </Badge>
          {Object.entries(statusConfig).map(([key, config]) => {
            const count = notasFiscais.filter(n => calcularStatusDinamico(n) === key).length;
            return (
              <Badge
                key={key}
                variant={filtroStatus === key ? "default" : "outline"}
                className="cursor-pointer text-xs"
                onClick={() => setFiltroStatus(key)}
              >
                {config.label} ({count})
              </Badge>
            );
          })}
        </div>
      )}

      <Card style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b" style={{ borderColor: theme.cardBorder }}>
                  <th className="text-left px-2 py-1.5 text-xs font-semibold" style={{ color: theme.textMuted }}>Nº Nota</th>
                  <th className="text-left px-2 py-1.5 text-xs font-semibold" style={{ color: theme.textMuted }}>Nº Receb.</th>
                  <th className="text-left px-2 py-1.5 text-xs font-semibold" style={{ color: theme.textMuted }}>Pedido</th>
                  <th className="text-left px-2 py-1.5 text-xs font-semibold" style={{ color: theme.textMuted }}>Emitente</th>
                  <th className="text-left px-2 py-1.5 text-xs font-semibold" style={{ color: theme.textMuted }}>Status</th>
                  <th className="text-left px-2 py-1.5 text-xs font-semibold" style={{ color: theme.textMuted }}>Receb.</th>
                  <th className="text-left px-2 py-1.5 text-xs font-semibold" style={{ color: theme.textMuted }}>Venc.</th>
                  <th className="text-left px-2 py-1.5 text-xs font-semibold" style={{ color: theme.textMuted }}>Vol.</th>
                  <th className="text-left px-2 py-1.5 text-xs font-semibold" style={{ color: theme.textMuted }}>Peso</th>
                  <th className="text-left px-2 py-1.5 text-xs font-semibold" style={{ color: theme.textMuted }}>Valor</th>
                  <th className="text-left px-2 py-1.5 text-xs font-semibold" style={{ color: theme.textMuted }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredNotas.map((nota) => {
                  const statusDinamico = calcularStatusDinamico(nota);
                  const statusInfo = statusConfig[statusDinamico] || statusConfig.recebida;
                  const ordem = ordens.find(o => o.id === nota.ordem_id);

                  const pesoEditado = nota.peso_original_xml && Math.abs(nota.peso_total_nf - nota.peso_original_xml) > 0.001;
                  const volumesEditado = nota.volumes_original_xml && nota.quantidade_total_volumes_nf !== nota.volumes_original_xml;

                  const hoje = new Date();
                  hoje.setHours(0, 0, 0, 0);
                  const dataVenc = nota.data_vencimento ? new Date(nota.data_vencimento) : null;
                  if (dataVenc) dataVenc.setHours(0, 0, 0, 0);
                  const notaVencida = dataVenc && dataVenc < hoje;

                  return (
                    <tr key={nota.id} className="border-b hover:bg-opacity-50" style={{ borderColor: theme.cardBorder }}>
                      <td className="px-2 py-1.5">
                        <span className="text-xs font-mono font-semibold" style={{ color: theme.text }}>
                          {nota.numero_nota}
                        </span>
                      </td>
                      <td className="px-2 py-1.5">
                        <span className="text-xs font-mono" style={{ color: theme.text }}>
                          {ordem?.numero_carga || '-'}
                        </span>
                      </td>
                      <td className="px-2 py-1.5">
                        <span className="text-xs font-mono" style={{ color: theme.text }}>
                          {nota.numero_pedido || '-'}
                        </span>
                      </td>
                      <td className="px-2 py-1.5">
                        <span className="text-xs truncate block max-w-[120px]" style={{ color: theme.text }} title={nota.emitente_razao_social}>
                          {nota.emitente_razao_social}
                        </span>
                      </td>
                      <td className="px-2 py-1.5">
                        <Badge className={`${statusInfo.color} text-white text-[10px] px-1.5 py-0`}>
                          {statusInfo.label}
                        </Badge>
                      </td>
                      <td className="px-2 py-1.5">
                        <span className="text-xs whitespace-nowrap leading-tight" style={{ color: theme.text }}>
                          {nota.created_date ? (() => {
                            const dateUTC = new Date(nota.created_date.includes('Z') ? nota.created_date : nota.created_date + 'Z');
                            return (
                              <>
                                {dateUTC.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', timeZone: 'America/Sao_Paulo' })}
                                {' '}
                                <span style={{ color: theme.textMuted }}>
                                  {dateUTC.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', timeZone: 'America/Sao_Paulo' })}
                                </span>
                              </>
                            );
                          })() : '-'}
                        </span>
                      </td>
                      <td className="px-2 py-1.5">
                        {nota.data_vencimento ? (
                          <span className="text-xs whitespace-nowrap font-semibold" style={{ color: notaVencida ? '#dc2626' : theme.text }}>
                            {new Date(nota.data_vencimento).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                            {notaVencida && <span className="ml-1">⚠</span>}
                          </span>
                        ) : '-'}
                      </td>
                      <td className="px-2 py-1.5">
                        <div className="text-xs">
                          <span className="font-semibold" style={{ color: volumesEditado ? '#dc2626' : theme.text }}>
                            {nota.quantidade_total_volumes_nf || 0}
                          </span>
                          {volumesEditado && (
                            <div className="text-[9px] text-red-600">
                              XML: {nota.volumes_original_xml}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-2 py-1.5">
                        <div className="text-xs">
                          <span className="whitespace-nowrap font-semibold" style={{ color: pesoEditado ? '#dc2626' : theme.text }}>
                            {nota.peso_total_nf?.toLocaleString()} kg
                          </span>
                          {pesoEditado && (
                            <div className="text-[9px] text-red-600 whitespace-nowrap">
                              XML: {nota.peso_original_xml?.toFixed(2)}kg
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-2 py-1.5">
                        <span className="text-xs whitespace-nowrap" style={{ color: theme.text }}>
                          R$ {nota.valor_nota_fiscal?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                      </td>
                      <td className="px-2 py-1.5">
                        <div className="flex gap-0.5">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewDetails(nota)}
                            style={{ borderColor: theme.inputBorder, color: theme.text }}
                            title="Ver detalhes"
                            className="h-6 w-6 p-0"
                          >
                            <Eye className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditNota(nota)}
                            style={{ borderColor: theme.inputBorder, color: theme.text }}
                            title="Editar nota fiscal"
                            className="h-6 w-6 p-0"
                          >
                            <Edit className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditVolumes(nota)}
                            style={{ borderColor: theme.inputBorder, color: theme.text }}
                            title="Editar volumes"
                            className="h-6 w-6 p-0"
                          >
                            <Package className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePrintEtiquetas(nota)}
                            style={(() => {
                              const volumesNota = volumes.filter(v => v.nota_fiscal_id === nota.id);
                              const impressas = volumesNota.length > 0 && volumesNota.every(v => v.etiquetas_impressas);
                              return {
                                borderColor: impressas ? '#10b981' : theme.inputBorder, 
                                color: impressas ? '#10b981' : theme.text,
                                backgroundColor: impressas ? (isDark ? '#064e3b33' : '#d1fae533') : 'transparent'
                              };
                            })()}
                            title={(() => {
                              const volumesNota = volumes.filter(v => v.nota_fiscal_id === nota.id);
                              const impressas = volumesNota.length > 0 && volumesNota.every(v => v.etiquetas_impressas);
                              return impressas ? "Etiquetas já impressas - clique para reimprimir" : "Imprimir etiquetas";
                            })()}
                            className="h-6 w-6 p-0"
                          >
                            <Tag className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDownloadXML(nota)}
                            style={{ borderColor: theme.inputBorder, color: theme.text }}
                            title="Baixar XML"
                            className="h-6 w-6 p-0"
                            disabled={!nota.xml_content}
                          >
                            <Download className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePrintDANFE(nota)}
                            style={{ 
                              borderColor: nota.danfe_nfe_url ? '#10b981' : theme.inputBorder, 
                              color: nota.danfe_nfe_url ? '#10b981' : theme.text,
                              backgroundColor: nota.danfe_nfe_url ? (isDark ? '#064e3b33' : '#d1fae533') : 'transparent'
                            }}
                            title={nota.danfe_nfe_url ? "DANFE já gerado - clique para reimprimir" : "Imprimir DANFE"}
                            className="h-6 w-6 p-0"
                          >
                            <Printer className="w-3 h-3" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {filteredNotas.length === 0 && (
              <div className="text-center py-12" style={{ color: theme.textMuted }}>
                <Package className="w-12 h-12 mx-auto mb-3 opacity-20" />
                <p>Nenhuma nota fiscal encontrada</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {showPrintModal && notaParaImprimir && (
        <ImpressaoEtiquetas
          open={showPrintModal}
          onClose={() => {
            setShowPrintModal(false);
            setNotaParaImprimir(null);
            setVolumesParaImprimir([]);
            if (onRefresh) onRefresh();
          }}
          nota={notaParaImprimir}
          volumes={volumesParaImprimir}
          empresa={empresa}
        />
      )}

      {showEditModal && (
        <NotaFiscalForm
          open={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setNotaParaEditar(null);
          }}
          nota={notaParaEditar}
          onSave={handleSaveNota}
          isDark={isDark}
        />
      )}

      {showVolumesModal && (
        <VolumesModal
          open={showVolumesModal}
          onClose={() => {
            setShowVolumesModal(false);
            setNotaParaEditarVolumes(null);
            setVolumesParaEditar([]);
          }}
          nota={notaParaEditarVolumes}
          volumes={volumesParaEditar}
          onSave={handleSaveVolumes}
          isDark={isDark}
        />
      )}

      {selectedNota && (
        <Dialog open={!!selectedNota} onOpenChange={() => setSelectedNota(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}>
            <DialogHeader>
              <DialogTitle style={{ color: theme.text }}>
                Detalhes da Nota Fiscal #{selectedNota.numero_nota}
              </DialogTitle>
            </DialogHeader>

            <Tabs defaultValue="detalhes" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="detalhes">Detalhes</TabsTrigger>
                <TabsTrigger value="timeline">Timeline</TabsTrigger>
              </TabsList>

              <TabsContent value="detalhes" className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs font-semibold" style={{ color: theme.textMuted }}>Chave de Acesso</Label>
                    <p className="text-sm font-mono" style={{ color: theme.text }}>{selectedNota.chave_nota_fiscal}</p>
                  </div>
                  <div>
                    <Label className="text-xs font-semibold" style={{ color: theme.textMuted }}>Status</Label>
                    <Badge className={`${statusConfig[calcularStatusDinamico(selectedNota)]?.color} text-white`}>
                      {statusConfig[calcularStatusDinamico(selectedNota)]?.label}
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs font-semibold" style={{ color: theme.textMuted }}>Emitente</Label>
                    <p className="text-sm" style={{ color: theme.text }}>{selectedNota.emitente_razao_social}</p>
                    <p className="text-xs" style={{ color: theme.textMuted }}>{selectedNota.emitente_cnpj}</p>
                  </div>
                  <div>
                    <Label className="text-xs font-semibold" style={{ color: theme.textMuted }}>Destinatário</Label>
                    <p className="text-sm" style={{ color: theme.text }}>{selectedNota.destinatario_razao_social}</p>
                    <p className="text-xs" style={{ color: theme.textMuted }}>{selectedNota.destinatario_cnpj}</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label className="text-xs font-semibold" style={{ color: theme.textMuted }}>Peso Total</Label>
                    <p className="text-sm" style={{ color: theme.text }}>{selectedNota.peso_total_nf?.toLocaleString()} kg</p>
                  </div>
                  <div>
                    <Label className="text-xs font-semibold" style={{ color: theme.textMuted }}>Valor</Label>
                    <p className="text-sm" style={{ color: theme.text }}>
                      R$ {selectedNota.valor_nota_fiscal?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div>
                    <Label className="text-xs font-semibold" style={{ color: theme.textMuted }}>Volumes</Label>
                    <p className="text-sm" style={{ color: theme.text }}>{selectedNota.quantidade_total_volumes_nf}</p>
                  </div>
                </div>

                {selectedNota.localizacao_atual && (
                  <div>
                    <Label className="text-xs font-semibold" style={{ color: theme.textMuted }}>Localização Atual</Label>
                    <p className="text-sm" style={{ color: theme.text }}>{selectedNota.localizacao_atual}</p>
                  </div>
                )}

                <div>
                  <Label className="text-sm font-semibold mb-2 block" style={{ color: theme.text }}>
                    Volumes ({notaVolumes.length})
                  </Label>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {notaVolumes.map((volume) => {
                      const volStatus = statusVolumeConfig[volume.status_volume] || statusVolumeConfig.criado;
                      return (
                        <div key={volume.id} className="p-3 border rounded-lg" style={{ borderColor: theme.cardBorder }}>
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="text-sm font-mono font-semibold" style={{ color: theme.text }}>
                                {volume.identificador_unico}
                              </p>
                              <p className="text-xs" style={{ color: theme.textMuted }}>
                                Volume {volume.numero_sequencial} | {volume.peso_volume?.toLocaleString()} kg
                              </p>
                              {volume.localizacao_atual && (
                                <p className="text-xs mt-1" style={{ color: theme.textMuted }}>
                                  📍 {volume.localizacao_atual}
                                </p>
                              )}
                            </div>
                            <Badge className={`${volStatus.color} text-white text-xs`}>
                              {volStatus.label}
                            </Badge>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="timeline" className="mt-4">
                <div className="space-y-4">
                  {selectedNota.data_coleta_solicitada && (
                    <div className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="w-10 h-10 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
                          <Clock className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                        </div>
                        <div className="w-0.5 h-full bg-gray-300 dark:bg-gray-600 mt-2"></div>
                      </div>
                      <div className="flex-1 pb-6">
                        <p className="font-semibold text-sm" style={{ color: theme.text }}>Coleta Solicitada</p>
                        <p className="text-xs" style={{ color: theme.textMuted }}>
                          {new Date(selectedNota.data_coleta_solicitada).toLocaleString('pt-BR')}
                        </p>
                      </div>
                    </div>
                  )}

                  {selectedNota.data_coletado && (
                    <div className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                          <CheckCircle2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="w-0.5 h-full bg-gray-300 dark:bg-gray-600 mt-2"></div>
                      </div>
                      <div className="flex-1 pb-6">
                        <p className="font-semibold text-sm" style={{ color: theme.text }}>Coletado</p>
                        <p className="text-xs" style={{ color: theme.textMuted }}>
                          {new Date(selectedNota.data_coletado).toLocaleString('pt-BR')}
                        </p>
                      </div>
                    </div>
                  )}

                  {selectedNota.data_entregue && (
                    <div className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                          <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-sm" style={{ color: theme.text }}>Entregue</p>
                        <p className="text-xs" style={{ color: theme.textMuted }}>
                          {new Date(selectedNota.data_entregue).toLocaleString('pt-BR')}
                        </p>
                      </div>
                    </div>
                  )}

                  {!selectedNota.data_coleta_solicitada && !selectedNota.data_coletado && !selectedNota.data_entregue && (
                    <div className="text-center py-8" style={{ color: theme.textMuted }}>
                      <Clock className="w-12 h-12 mx-auto mb-3 opacity-20" />
                      <p>Nenhum evento registrado no timeline ainda</p>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
});

export default NotasFiscaisTable;