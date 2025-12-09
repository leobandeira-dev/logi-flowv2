import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Search, RefreshCw, Eye, Package, Printer, Clock, MapPin, CheckCircle2, Edit, Download, Filter, Calendar, FileText } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarUI } from "@/components/ui/calendar";
import { format } from "date-fns";
import ImpressaoEtiquetas from "../components/notas-fiscais/ImpressaoEtiquetas";
import NotaFiscalForm from "../components/notas-fiscais/NotaFiscalForm";
import FiltrosPredefinidos from "../components/filtros/FiltrosPredefinidos";
import PaginacaoControles from "../components/filtros/PaginacaoControles";

export default function GestaoDeNotasFiscais() {
  const [notasFiscais, setNotasFiscais] = useState([]);
  const [volumes, setVolumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedNota, setSelectedNota] = useState(null);
  const [notaVolumes, setNotaVolumes] = useState([]);
  const [isDark, setIsDark] = useState(false);
  const [filtroStatus, setFiltroStatus] = useState("todos");
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [notaParaImprimir, setNotaParaImprimir] = useState(null);
  const [volumesParaImprimir, setVolumesParaImprimir] = useState([]);
  const [empresa, setEmpresa] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [notaParaEditar, setNotaParaEditar] = useState(null);
  const [ordens, setOrdens] = useState([]);
  const [ctes, setCtes] = useState([]);
  
  // Filtros adicionais
  const [filtroEmitente, setFiltroEmitente] = useState("");
  const [filtroDestinatario, setFiltroDestinatario] = useState("");
  const [filtroDataInicio, setFiltroDataInicio] = useState(null);
  const [filtroDataFim, setFiltroDataFim] = useState(null);
  const [filtroCidade, setFiltroCidade] = useState("");
  const [filtroUF, setFiltroUF] = useState("");
  
  // Paginação
  const [paginaAtual, setPaginaAtual] = useState(1);
  const limite = 50;

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
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const user = await base44.auth.me();
      
      const [notasData, volumesData, empresaData, ordensData, ctesData] = await Promise.all([
        base44.entities.NotaFiscal.list("-created_date"),
        base44.entities.Volume.list(),
        user.empresa_id ? base44.entities.Empresa.get(user.empresa_id) : Promise.resolve(null),
        base44.entities.OrdemDeCarregamento.list(),
        base44.entities.CTe.list()
      ]);
      
      setNotasFiscais(notasData);
      setVolumes(volumesData);
      setEmpresa(empresaData);
      setOrdens(ordensData);
      setCtes(ctesData);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = async (nota) => {
    setSelectedNota(nota);
    const volumesDaNota = volumes.filter(v => v.nota_fiscal_id === nota.id);
    setNotaVolumes(volumesDaNota);
  };

  const handlePrintEtiquetas = async (nota) => {
    const volumesDaNota = volumes.filter(v => v.nota_fiscal_id === nota.id);
    setNotaParaImprimir(nota);
    setVolumesParaImprimir(volumesDaNota);
    setShowPrintModal(true);
  };

  const handleEditNota = (nota) => {
    setNotaParaEditar(nota);
    setShowEditModal(true);
  };

  const handleDownloadXML = (nota) => {
    if (!nota.xml_content) {
      toast.error("XML não disponível para esta nota");
      return;
    }

    try {
      const blob = new Blob([nota.xml_content], { type: 'text/xml' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `NFe_${nota.numero_nota}_${nota.chave_nota_fiscal || 'sem_chave'}.xml`;
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

  const handleSaveNota = async (notaData) => {
    try {
      if (notaParaEditar?.id) {
        await base44.entities.NotaFiscal.update(notaParaEditar.id, notaData);
        toast.success("Nota fiscal atualizada com sucesso!");
      }
      setShowEditModal(false);
      setNotaParaEditar(null);
      loadData();
    } catch (error) {
      console.error("Erro ao salvar nota fiscal:", error);
      toast.error("Erro ao salvar nota fiscal");
    }
  };

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

  const calcularStatusDinamico = (nota) => {
    if (!nota) return "recebida";

    // Entregue
    if (nota.data_entregue) return "entregue";

    // Em rota de entrega
    if (nota.data_saida_para_entrega && !nota.data_entregue) return "em_rota_entrega";

    // Na filial de destino
    if (nota.data_chegada_destino_final && !nota.data_saida_para_entrega) return "na_filial_destino";

    // Em viagem
    if (nota.data_saida_para_viagem && !nota.data_chegada_destino_final) return "em_viagem";

    // Aguardando consolidação
    if (nota.data_coletado && nota.data_chegada_filial && !nota.data_saida_para_viagem) return "aguardando_consolidacao";

    // Coletado
    if (nota.data_coletado && !nota.data_chegada_filial && !nota.data_saida_para_viagem) return "coletado";

    // Aguardando coleta
    if (nota.data_coleta_solicitada && !nota.data_coletado) return "aguardando_coleta";

    // Fallback para status da entidade
    return nota.status_nf || "recebida";
  };

  const statusVolumeConfig = {
    criado: { label: "Criado", color: "bg-gray-500" },
    etiquetado: { label: "Etiquetado", color: "bg-blue-500" },
    separado: { label: "Separado", color: "bg-green-500" },
    carregado: { label: "Carregado", color: "bg-purple-500" },
    em_transito: { label: "Em Trânsito", color: "bg-indigo-500" },
    entregue: { label: "Entregue", color: "bg-emerald-600" }
  };

  const limparFiltros = () => {
    setSearchTerm("");
    setFiltroStatus("todos");
    setFiltroEmitente("");
    setFiltroDestinatario("");
    setFiltroDataInicio(null);
    setFiltroDataFim(null);
    setFiltroCidade("");
    setFiltroUF("");
    setPaginaAtual(1);
  };

  const aplicarFiltrosSalvos = (filtros) => {
    if (filtros.searchTerm) setSearchTerm(filtros.searchTerm);
    if (filtros.filtroStatus) setFiltroStatus(filtros.filtroStatus);
    if (filtros.filtroEmitente) setFiltroEmitente(filtros.filtroEmitente);
    if (filtros.filtroDestinatario) setFiltroDestinatario(filtros.filtroDestinatario);
    if (filtros.filtroDataInicio) setFiltroDataInicio(new Date(filtros.filtroDataInicio));
    if (filtros.filtroDataFim) setFiltroDataFim(new Date(filtros.filtroDataFim));
    if (filtros.filtroCidade) setFiltroCidade(filtros.filtroCidade);
    if (filtros.filtroUF) setFiltroUF(filtros.filtroUF);
    setPaginaAtual(1);
    toast.success("Filtro aplicado!");
  };

  const filteredNotas = notasFiscais.filter(nota => {
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

    const matchesEmitente = !filtroEmitente || 
      nota.emitente_razao_social?.toLowerCase().includes(filtroEmitente.toLowerCase());

    const matchesDestinatario = !filtroDestinatario || 
      nota.destinatario_razao_social?.toLowerCase().includes(filtroDestinatario.toLowerCase());

    const matchesCidade = !filtroCidade || 
      nota.destinatario_cidade?.toLowerCase().includes(filtroCidade.toLowerCase());

    const matchesUF = !filtroUF || 
      nota.destinatario_uf?.toLowerCase().includes(filtroUF.toLowerCase());

    let matchesDataInicio = true;
    if (filtroDataInicio && nota.created_date) {
      const dataRecebimento = new Date(nota.created_date);
      dataRecebimento.setHours(0, 0, 0, 0);
      const dataInicio = new Date(filtroDataInicio);
      dataInicio.setHours(0, 0, 0, 0);
      matchesDataInicio = dataRecebimento >= dataInicio;
    }

    let matchesDataFim = true;
    if (filtroDataFim && nota.created_date) {
      const dataRecebimento = new Date(nota.created_date);
      dataRecebimento.setHours(0, 0, 0, 0);
      const dataFim = new Date(filtroDataFim);
      dataFim.setHours(23, 59, 59, 999);
      matchesDataFim = dataRecebimento <= dataFim;
    }

    return matchesSearch && matchesStatus && matchesEmitente && 
           matchesDestinatario && matchesCidade && matchesUF &&
           matchesDataInicio && matchesDataFim;
  });

  const notasPaginadas = filteredNotas.slice((paginaAtual - 1) * limite, paginaAtual * limite);

  const theme = {
    bg: isDark ? '#0f172a' : '#f9fafb',
    cardBg: isDark ? '#1e293b' : '#ffffff',
    cardBorder: isDark ? '#334155' : '#e5e7eb',
    text: isDark ? '#f1f5f9' : '#111827',
    textMuted: isDark ? '#94a3b8' : '#6b7280',
    inputBg: isDark ? '#1e293b' : '#ffffff',
    inputBorder: isDark ? '#334155' : '#d1d5db',
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: theme.bg }}>
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p style={{ color: theme.textMuted }}>Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 min-h-screen" style={{ backgroundColor: theme.bg }}>
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
          <div>
            <h1 className="text-2xl font-bold mb-1" style={{ color: theme.text }}>Gestão de Notas Fiscais</h1>
            <p className="text-sm" style={{ color: theme.textMuted }}>
              Visualize e gerencie todas as notas fiscais e seus volumes
              <span className="ml-2 font-semibold">({filteredNotas.length} nota{filteredNotas.length !== 1 ? 's' : ''})</span>
            </p>
          </div>
          
          <div className="flex gap-2 w-full lg:w-auto flex-wrap">
            <div className="relative flex-1 lg:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: theme.textMuted }} />
              <Input
                placeholder="Buscar notas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-9 text-sm"
                style={{ backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.text }}
              />
            </div>
            <FiltrosPredefinidos
              rota="gestao_notas_fiscais"
              filtrosAtuais={{
                searchTerm,
                filtroStatus,
                filtroEmitente,
                filtroDestinatario,
                filtroDataInicio,
                filtroDataFim,
                filtroCidade,
                filtroUF
              }}
              onAplicarFiltro={aplicarFiltrosSalvos}
            />
            <Button
              variant="outline"
              size="sm"
              onClick={loadData}
              className="h-9"
              style={{ borderColor: theme.inputBorder, color: theme.text }}
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="flex flex-col gap-3 mb-4">
          <div className="flex gap-2 flex-wrap items-center">
            <Badge
              variant={filtroStatus === "todos" ? "default" : "outline"}
              className="cursor-pointer"
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
                  className="cursor-pointer"
                  onClick={() => setFiltroStatus(key)}
                >
                  {config.label} ({count})
                </Badge>
              );
            })}
          </div>

          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-8 w-fit"
                style={{ borderColor: theme.inputBorder, color: theme.text }}
              >
                <Filter className="w-3.5 h-3.5 mr-2" />
                Filtros Avançados
                {(filtroEmitente || filtroDestinatario || filtroDataInicio || filtroDataFim || filtroCidade || filtroUF) && (
                  <Badge className="ml-2 h-4 px-1 text-[10px]">Ativos</Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent 
              className="w-96" 
              align="start"
              style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}
            >
              <div className="space-y-3">
                <h4 className="font-semibold text-sm" style={{ color: theme.text }}>Filtros Avançados</h4>
                
                <div>
                  <Label className="text-xs mb-1" style={{ color: theme.textMuted }}>Emitente</Label>
                  <Input
                    placeholder="Filtrar por emitente..."
                    value={filtroEmitente}
                    onChange={(e) => setFiltroEmitente(e.target.value)}
                    className="h-8 text-sm"
                    style={{ backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.text }}
                  />
                </div>

                <div>
                  <Label className="text-xs mb-1" style={{ color: theme.textMuted }}>Destinatário</Label>
                  <Input
                    placeholder="Filtrar por destinatário..."
                    value={filtroDestinatario}
                    onChange={(e) => setFiltroDestinatario(e.target.value)}
                    className="h-8 text-sm"
                    style={{ backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.text }}
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs mb-1" style={{ color: theme.textMuted }}>Cidade</Label>
                    <Input
                      placeholder="Cidade..."
                      value={filtroCidade}
                      onChange={(e) => setFiltroCidade(e.target.value)}
                      className="h-8 text-sm"
                      style={{ backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.text }}
                    />
                  </div>
                  <div>
                    <Label className="text-xs mb-1" style={{ color: theme.textMuted }}>UF</Label>
                    <Input
                      placeholder="UF..."
                      value={filtroUF}
                      onChange={(e) => setFiltroUF(e.target.value)}
                      className="h-8 text-sm"
                      style={{ backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.text }}
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-xs mb-1" style={{ color: theme.textMuted }}>Data Recebimento</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="h-8 text-xs justify-start"
                          style={{ backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.text }}
                        >
                          <Calendar className="w-3 h-3 mr-2" />
                          {filtroDataInicio ? format(filtroDataInicio, "dd/MM/yyyy") : "Início"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <CalendarUI
                          mode="single"
                          selected={filtroDataInicio}
                          onSelect={setFiltroDataInicio}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>

                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="h-8 text-xs justify-start"
                          style={{ backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.text }}
                        >
                          <Calendar className="w-3 h-3 mr-2" />
                          {filtroDataFim ? format(filtroDataFim, "dd/MM/yyyy") : "Fim"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <CalendarUI
                          mode="single"
                          selected={filtroDataFim}
                          onSelect={setFiltroDataFim}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={limparFiltros}
                    className="h-7 text-xs"
                    style={{ borderColor: theme.inputBorder, color: theme.text }}
                  >
                    Limpar
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>

        <Card style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm" style={{ color: theme.text }}>
                {filteredNotas.length} nota{filteredNotas.length !== 1 ? 's' : ''} encontrada{filteredNotas.length !== 1 ? 's' : ''}
              </CardTitle>
              <PaginacaoControles
                paginaAtual={paginaAtual}
                totalRegistros={filteredNotas.length}
                limite={limite}
                onPaginaAnterior={() => setPaginaAtual(p => Math.max(1, p - 1))}
                onProximaPagina={() => setPaginaAtual(p => Math.min(Math.ceil(filteredNotas.length / limite), p + 1))}
                isDark={isDark}
              />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b" style={{ borderColor: theme.cardBorder }}>
                    <th className="text-left px-2 py-1.5 text-xs font-semibold" style={{ color: theme.textMuted }}>Nº Nota</th>
                    <th className="text-left px-2 py-1.5 text-xs font-semibold" style={{ color: theme.textMuted }}>Nº Receb.</th>
                    <th className="text-left px-2 py-1.5 text-xs font-semibold" style={{ color: theme.textMuted }}>Emitente</th>
                    <th className="text-left px-2 py-1.5 text-xs font-semibold" style={{ color: theme.textMuted }}>Destinatário</th>
                    <th className="text-left px-2 py-1.5 text-xs font-semibold" style={{ color: theme.textMuted }}>Status</th>
                    <th className="text-left px-2 py-1.5 text-xs font-semibold" style={{ color: theme.textMuted }}>Receb.</th>
                    <th className="text-left px-2 py-1.5 text-xs font-semibold" style={{ color: theme.textMuted }}>Prev. Entr.</th>
                    <th className="text-left px-2 py-1.5 text-xs font-semibold" style={{ color: theme.textMuted }}>Vol.</th>
                    <th className="text-left px-2 py-1.5 text-xs font-semibold" style={{ color: theme.textMuted }}>Peso</th>
                    <th className="text-left px-2 py-1.5 text-xs font-semibold" style={{ color: theme.textMuted }}>Valor</th>
                    <th className="text-left px-2 py-1.5 text-xs font-semibold" style={{ color: theme.textMuted }}>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {notasPaginadas.map((nota) => {
                    const statusDinamico = calcularStatusDinamico(nota);
                    const statusInfo = statusConfig[statusDinamico] || statusConfig.recebida;
                    const ordem = ordens.find(o => o.id === nota.ordem_id);
                    const ctesVinculados = ctes.filter(cte => 
                      cte.notas_fiscais_ids?.includes(nota.id)
                    );
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
                          <span className="text-xs truncate block max-w-[150px]" style={{ color: theme.text }} title={nota.emitente_razao_social}>
                            {nota.emitente_razao_social}
                          </span>
                        </td>
                        <td className="px-2 py-1.5">
                          <span className="text-xs truncate block max-w-[150px]" style={{ color: theme.text }} title={nota.destinatario_razao_social}>
                            {nota.destinatario_razao_social}
                          </span>
                        </td>
                        <td className="px-2 py-1.5">
                          <Badge className={`${statusInfo.color} text-white text-[10px] px-1.5 py-0`}>
                            {statusInfo.label}
                          </Badge>
                        </td>
                        <td className="px-2 py-1.5">
                          <span className="text-xs whitespace-nowrap" style={{ color: theme.text }}>
                            {nota.created_date ? new Date(nota.created_date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '-'}
                          </span>
                        </td>
                        <td className="px-2 py-1.5">
                          <span className="text-xs whitespace-nowrap" style={{ color: theme.text }}>
                            {nota.data_entregue 
                              ? new Date(nota.data_entregue).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
                              : nota.data_saida_para_entrega
                              ? new Date(new Date(nota.data_saida_para_entrega).getTime() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
                              : '-'}
                          </span>
                        </td>
                        <td className="px-2 py-1.5">
                          <span className="text-xs" style={{ color: theme.text }}>
                            {nota.quantidade_total_volumes_nf || 0}
                          </span>
                        </td>
                        <td className="px-2 py-1.5">
                          <span className="text-xs whitespace-nowrap" style={{ color: theme.text }}>
                            {nota.peso_total_nf?.toLocaleString()} kg
                          </span>
                        </td>
                        <td className="px-2 py-1.5">
                          <span className="text-xs whitespace-nowrap" style={{ color: theme.text }}>
                            R$ {nota.valor_nota_fiscal?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </span>
                        </td>
                        <td className="px-2 py-1.5">
                          <div className="flex gap-0.5">
                            {ctesVinculados.length > 0 && (
                              <Popover>
                                <PopoverTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    style={{ 
                                      borderColor: '#10b981',
                                      color: '#10b981',
                                      backgroundColor: isDark ? '#064e3b33' : '#d1fae533'
                                    }}
                                    title={`${ctesVinculados.length} CT-e(s) vinculado(s)`}
                                    className="h-6 w-6 p-0 relative"
                                  >
                                    <FileText className="w-3 h-3" />
                                    {ctesVinculados.length > 1 && (
                                      <span className="absolute -top-1 -right-1 bg-green-600 text-white text-[8px] rounded-full w-3 h-3 flex items-center justify-center">
                                        {ctesVinculados.length}
                                      </span>
                                    )}
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent 
                                  className="w-80" 
                                  align="start"
                                  style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}
                                >
                                  <div className="space-y-3">
                                    <h4 className="font-semibold text-sm" style={{ color: theme.text }}>
                                      CT-es Vinculados ({ctesVinculados.length})
                                    </h4>
                                    {ctesVinculados.map(cte => (
                                      <div key={cte.id} className="border rounded p-2" style={{ borderColor: theme.cardBorder }}>
                                        <p className="text-xs font-semibold mb-1" style={{ color: theme.text }}>
                                          CT-e Nº {cte.numero_cte} - Série {cte.serie_cte}
                                        </p>
                                        <p className="text-[10px] mb-1" style={{ color: theme.textMuted }}>
                                          {cte.emitente_nome}
                                        </p>
                                        <div className="flex items-center justify-between mt-2">
                                          <span className="text-xs font-semibold text-green-600">
                                            R$ {(cte.valor_total || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                          </span>
                                          {cte.xml_url && (
                                            <Button
                                              size="sm"
                                              variant="outline"
                                              onClick={() => window.open(cte.xml_url, '_blank')}
                                              className="h-6 text-[10px]"
                                            >
                                              <Download className="w-3 h-3 mr-1" />
                                              XML
                                            </Button>
                                          )}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </PopoverContent>
                              </Popover>
                            )}
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
                              onClick={() => handlePrintEtiquetas(nota)}
                              style={{ 
                                borderColor: (() => {
                                  const volumesNota = volumes.filter(v => v.nota_fiscal_id === nota.id);
                                  const todosImpressos = volumesNota.length > 0 && volumesNota.every(v => v.etiquetas_impressas);
                                  return todosImpressos ? '#10b981' : theme.inputBorder;
                                })(),
                                color: (() => {
                                  const volumesNota = volumes.filter(v => v.nota_fiscal_id === nota.id);
                                  const todosImpressos = volumesNota.length > 0 && volumesNota.every(v => v.etiquetas_impressas);
                                  return todosImpressos ? '#10b981' : theme.text;
                                })(),
                                backgroundColor: (() => {
                                  const volumesNota = volumes.filter(v => v.nota_fiscal_id === nota.id);
                                  const todosImpressos = volumesNota.length > 0 && volumesNota.every(v => v.etiquetas_impressas);
                                  return todosImpressos ? (isDark ? '#064e3b33' : '#d1fae533') : 'transparent';
                                })()
                              }}
                              title={(() => {
                                const volumesNota = volumes.filter(v => v.nota_fiscal_id === nota.id);
                                const todosImpressos = volumesNota.length > 0 && volumesNota.every(v => v.etiquetas_impressas);
                                return todosImpressos ? "Etiquetas já impressas - clique para reimprimir" : "Imprimir etiquetas";
                              })()}
                              className="h-6 w-6 p-0"
                            >
                              <Printer className="w-3 h-3" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDownloadXML(nota)}
                              style={{ 
                                borderColor: nota.xml_content ? '#3b82f6' : theme.inputBorder,
                                color: nota.xml_content ? '#3b82f6' : theme.textMuted,
                                backgroundColor: nota.xml_content ? (isDark ? '#1e3a8a33' : '#dbeafe33') : 'transparent'
                              }}
                              title={nota.xml_content ? "Download XML" : "XML não disponível"}
                              className="h-6 w-6 p-0"
                              disabled={!nota.xml_content}
                            >
                              <Download className="w-3 h-3" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {notasPaginadas.length === 0 && filteredNotas.length === 0 && (
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
              loadData();
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

                    {selectedNota.data_chegada_filial && (
                      <div className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                            <MapPin className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                          </div>
                          <div className="w-0.5 h-full bg-gray-300 dark:bg-gray-600 mt-2"></div>
                        </div>
                        <div className="flex-1 pb-6">
                          <p className="font-semibold text-sm" style={{ color: theme.text }}>Chegada na Filial</p>
                          <p className="text-xs" style={{ color: theme.textMuted }}>
                            {new Date(selectedNota.data_chegada_filial).toLocaleString('pt-BR')}
                          </p>
                        </div>
                      </div>
                    )}

                    {selectedNota.data_saida_para_viagem && (
                      <div className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                            <MapPin className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                          </div>
                          <div className="w-0.5 h-full bg-gray-300 dark:bg-gray-600 mt-2"></div>
                        </div>
                        <div className="flex-1 pb-6">
                          <p className="font-semibold text-sm" style={{ color: theme.text }}>Saída para Viagem</p>
                          <p className="text-xs" style={{ color: theme.textMuted }}>
                            {new Date(selectedNota.data_saida_para_viagem).toLocaleString('pt-BR')}
                          </p>
                        </div>
                      </div>
                    )}

                    {selectedNota.data_chegada_destino_final && (
                      <div className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className="w-10 h-10 rounded-full bg-cyan-100 dark:bg-cyan-900/30 flex items-center justify-center">
                            <MapPin className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                          </div>
                          <div className="w-0.5 h-full bg-gray-300 dark:bg-gray-600 mt-2"></div>
                        </div>
                        <div className="flex-1 pb-6">
                          <p className="font-semibold text-sm" style={{ color: theme.text }}>Chegada ao Destino Final</p>
                          <p className="text-xs" style={{ color: theme.textMuted }}>
                            {new Date(selectedNota.data_chegada_destino_final).toLocaleString('pt-BR')}
                          </p>
                        </div>
                      </div>
                    )}

                    {selectedNota.data_saida_para_entrega && (
                      <div className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className="w-10 h-10 rounded-full bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center">
                            <MapPin className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                          </div>
                          <div className="w-0.5 h-full bg-gray-300 dark:bg-gray-600 mt-2"></div>
                        </div>
                        <div className="flex-1 pb-6">
                          <p className="font-semibold text-sm" style={{ color: theme.text }}>Saída para Entrega</p>
                          <p className="text-xs" style={{ color: theme.textMuted }}>
                            {new Date(selectedNota.data_saida_para_entrega).toLocaleString('pt-BR')}
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
      </div>
    </div>
  );
}