import React, { useState, useEffect, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Package, Upload, Plus, RefreshCw, Printer, X, Tag, FileText, Edit, Search, Filter, TrendingUp, Calendar, Clock } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import ImpressaoEtiquetas from "../components/notas-fiscais/ImpressaoEtiquetas";
import NotasFiscaisTable from "../components/notas-fiscais/NotasFiscaisTable";
import NotaFiscalForm from "../components/notas-fiscais/NotaFiscalForm";
import VolumesModal from "../components/notas-fiscais/VolumesModal";
import FiltrosPredefinidos from "../components/filtros/FiltrosPredefinidos";
import PaginacaoControles from "../components/filtros/PaginacaoControles";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";

export default function Recebimento() {
  const [user, setUser] = useState(null);
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [recebimentos, setRecebimentos] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [chaveAcesso, setChaveAcesso] = useState("");
  const [buscandoNF, setBuscandoNF] = useState(false);
  const [filaImportacao, setFilaImportacao] = useState([]);
  const inputChaveRef = React.useRef(null);
  const [showScanner, setShowScanner] = useState(false);
  const [notasFiscais, setNotasFiscais] = useState([]);
  const [numeroColeta, setNumeroColeta] = useState("");
  const [buscandoColeta, setBuscandoColeta] = useState(false);
  const [coletaSelecionada, setColetaSelecionada] = useState(null);
  const [showNotaForm, setShowNotaForm] = useState(false);
  const [notaParaEditar, setNotaParaEditar] = useState(null);
  const [showVolumesModal, setShowVolumesModal] = useState(false);
  const [notaParaVolumes, setNotaParaVolumes] = useState(null);
  const [showImpressaoOrdemModal, setShowImpressaoOrdemModal] = useState(false);
  const [ordemParaImpressao, setOrdemParaImpressao] = useState(null);
  const [notasOrdemImpressao, setNotasOrdemImpressao] = useState([]);
  const [volumesOrdemImpressao, setVolumesOrdemImpressao] = useState([]);
  const [showColetaModal, setShowColetaModal] = useState(false);
  const [showEtiquetasModal, setShowEtiquetasModal] = useState(false);
  const [recebimentoSelecionado, setRecebimentoSelecionado] = useState(null);
  const [notasSelecionadas, setNotasSelecionadas] = useState([]);
  const [volumesSelecionados, setVolumesSelecionados] = useState([]);
  const [empresa, setEmpresa] = useState(null);
  const [todasNotasFiscais, setTodasNotasFiscais] = useState([]);
  const [todosVolumes, setTodosVolumes] = useState([]);
  const [todasOrdens, setTodasOrdens] = useState([]);
  const [totalNotasFiscais, setTotalNotasFiscais] = useState(0);
  const [loadingNotas, setLoadingNotas] = useState(false);
  const [notasCarregadas, setNotasCarregadas] = useState(false);
  const [volumesCache, setVolumesCache] = useState({});
  const [editandoRecebimento, setEditandoRecebimento] = useState(null);
  const [abaAtiva, setAbaAtiva] = useState("notas");
  const [showFiltersRecebimentos, setShowFiltersRecebimentos] = useState(false);
  const [filtersRecebimentos, setFiltersRecebimentos] = useState({
    dataInicio: "",
    dataFim: "",
    fornecedor: "",
    conferente: ""
  });
  const [paginaAtualRecebimentos, setPaginaAtualRecebimentos] = useState(1);
  const [limiteRecebimentos, setLimiteRecebimentos] = useState(50);
  const [searchTermRecebimentos, setSearchTermRecebimentos] = useState("");
  const [visualizacaoGrafico, setVisualizacaoGrafico] = useState("diario");
  const [graficoExpandidoRecebimento, setGraficoExpandidoRecebimento] = useState(false);
  const [anoSelecionadoRecebimento, setAnoSelecionadoRecebimento] = useState(() => new Date().getFullYear());
  const [mesSelecionadoRecebimento, setMesSelecionadoRecebimento] = useState(() => new Date().getMonth() + 1);
  const [searchTermNotas, setSearchTermNotas] = useState("");
  const [searchInputNotas, setSearchInputNotas] = useState("");
  const [paginaAtualNotas, setPaginaAtualNotas] = useState(1);
  const [limiteNotas, setLimiteNotas] = useState(50);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [recebimentoParaCancelar, setRecebimentoParaCancelar] = useState(null);
  const [motivoCancelamento, setMotivoCancelamento] = useState("");

  const [formData, setFormData] = useState({
    observacao_carga: "",
    numero_area: "",
  });

  // Calcular notas fiscais filtradas com useMemo no nível superior
  const notasFiscaisFiltradas = useMemo(() => {
    const filtered = todasNotasFiscais.filter(nf => {
      if (!searchTermNotas) return true;
      const search = searchTermNotas.toLowerCase();
      return nf.numero_nota?.toLowerCase().includes(search) ||
             nf.emitente_razao_social?.toLowerCase().includes(search) ||
             nf.destinatario_razao_social?.toLowerCase().includes(search);
    });
    const inicio = (paginaAtualNotas - 1) * limiteNotas;
    const fim = inicio + limiteNotas;
    return filtered.slice(inicio, fim);
  }, [todasNotasFiscais, searchTermNotas, paginaAtualNotas, limiteNotas]);

  // Calcular total de registros filtrados
  const totalNotasFiltradas = useMemo(() => {
    const filtered = todasNotasFiscais.filter(nf => {
      if (!searchTermNotas) return true;
      const search = searchTermNotas.toLowerCase();
      return nf.numero_nota?.toLowerCase().includes(search) ||
             nf.emitente_razao_social?.toLowerCase().includes(search) ||
             nf.destinatario_razao_social?.toLowerCase().includes(search);
    });
    return filtered.length;
  }, [todasNotasFiscais, searchTermNotas]);

  // Memoizar indicadores de recebimentos para evitar recalcular a cada digitação
  const indicadoresRecebimentos = useMemo(() => {
    const hoje = new Date();
    const dataHojeSP = hoje.toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' });
    const [, mesHojeSP, anoHojeSP] = dataHojeSP.split('/');

    const recebimentosMes = recebimentos.filter(r => {
      if (!r.data_solicitacao || r.status === "cancelado") return false;
      const dataRec = new Date(r.data_solicitacao);
      const dataRecSP = dataRec.toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' });
      const [, mesRec, anoRec] = dataRecSP.split('/');
      return mesRec === mesHojeSP && anoRec === anoHojeSP;
    });

    const mesNome = new Date(parseInt(anoHojeSP), parseInt(mesHojeSP) - 1, 1).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

    return {
      totalMes: recebimentosMes.length,
      mesNome
    };
  }, [recebimentos]);

  // Memoizar indicadores de notas fiscais
  const indicadoresNotas = useMemo(() => {
    const hoje = new Date();
    const dataHojeSP = hoje.toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' });
    const [, mesHojeSP, anoHojeSP] = dataHojeSP.split('/');

    const notasMes = todasNotasFiscais.filter(n => {
      if (!n.created_date || n.status_nf === "cancelada") return false;
      const dataNota = new Date(n.created_date).toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' });
      const [, mesNota, anoNota] = dataNota.split('/');
      return mesNota === mesHojeSP && anoNota === anoHojeSP;
    });

    const notasHoje = todasNotasFiscais.filter(n => {
      if (!n.created_date || n.status_nf === "cancelada") return false;
      const dataNota = new Date(n.created_date).toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' });
      return dataNota === dataHojeSP;
    });

    const volumesTotal = notasMes.reduce((sum, n) => sum + (n.quantidade_total_volumes_nf || 0), 0);
    const volumesHoje = notasHoje.reduce((sum, n) => sum + (n.quantidade_total_volumes_nf || 0), 0);
    const pesoTotal = notasMes.reduce((sum, n) => sum + (n.peso_total_nf || 0), 0);
    const valorTotal = notasMes.reduce((sum, n) => sum + (n.valor_nota_fiscal || 0), 0);
    const valorHoje = notasHoje.reduce((sum, n) => sum + (n.valor_nota_fiscal || 0), 0);

    return {
      totalMes: notasMes.length,
      totalHoje: notasHoje.length,
      volumesTotal,
      volumesHoje,
      pesoTotal,
      valorTotal,
      valorHoje
    };
  }, [todasNotasFiscais]);

  // Memoizar dados do gráfico de recebimentos
  const dadosGraficoRecebimentos = useMemo(() => {
    const todosRecebimentosSemPaginacao = recebimentos.filter(rec => {
      const matchesSearch = !searchTermRecebimentos ||
        rec.numero_carga?.toLowerCase().includes(searchTermRecebimentos.toLowerCase()) ||
        rec.cliente?.toLowerCase().includes(searchTermRecebimentos.toLowerCase());
      
      const matchesFornecedor = !filtersRecebimentos.fornecedor || 
        rec.cliente?.toLowerCase().includes(filtersRecebimentos.fornecedor.toLowerCase());
      
      const matchesConferente = !filtersRecebimentos.conferente ||
        usuarios.find(u => u.id === rec.conferente_id)?.full_name?.toLowerCase().includes(filtersRecebimentos.conferente.toLowerCase());
      
      const matchesDataInicio = !filtersRecebimentos.dataInicio || 
        (rec.data_solicitacao && new Date(rec.data_solicitacao) >= new Date(filtersRecebimentos.dataInicio));
      
      const matchesDataFim = !filtersRecebimentos.dataFim || 
        (rec.data_solicitacao && new Date(rec.data_solicitacao) <= new Date(filtersRecebimentos.dataFim + 'T23:59:59'));
      
      return matchesSearch && matchesFornecedor && matchesConferente && matchesDataInicio && matchesDataFim;
    });

    if (visualizacaoGrafico === "diario") {
      const hoje = new Date();
      const offsetSP = -3 * 60;
      const dataHojeSP = new Date(hoje.getTime() + offsetSP * 60 * 1000);
      
      const recebimentosHoje = todosRecebimentosSemPaginacao.filter(r => {
        if (!r.data_solicitacao || r.status === "cancelado") return false;
        const dataRec = new Date(r.data_solicitacao);
        const dataRecSP = new Date(dataRec.getTime() + offsetSP * 60 * 1000);
        
        return dataRecSP.getUTCFullYear() === dataHojeSP.getUTCFullYear() &&
               dataRecSP.getUTCMonth() === dataHojeSP.getUTCMonth() &&
               dataRecSP.getUTCDate() === dataHojeSP.getUTCDate();
      });

      const porHora = Array.from({ length: 24 }, (_, i) => ({
        hora: `${String(i).padStart(2, '0')}:00`,
        volume: 0
      }));

      recebimentosHoje.forEach(rec => {
        const dataRec = new Date(rec.data_solicitacao);
        const dataRecSP = new Date(dataRec.getTime() + offsetSP * 60 * 1000);
        const hora = dataRecSP.getUTCHours();
        if (hora >= 0 && hora < 24) {
          porHora[hora].volume++;
        }
      });

      return porHora;
    } else if (visualizacaoGrafico === "mensal") {
      const hoje = new Date();
      const offsetSP = -3 * 60;
      const dataHojeSP = new Date(hoje.getTime() + offsetSP * 60 * 1000);
      const mesAtual = dataHojeSP.getUTCMonth();
      const anoAtual = dataHojeSP.getUTCFullYear();
      const diasNoMes = new Date(Date.UTC(anoAtual, mesAtual + 1, 0)).getUTCDate();

      const recebimentosMes = todosRecebimentosSemPaginacao.filter(r => {
        if (!r.data_solicitacao || r.status === "cancelado") return false;
        const dataRec = new Date(r.data_solicitacao);
        const dataRecSP = new Date(dataRec.getTime() + offsetSP * 60 * 1000);
        return dataRecSP.getUTCMonth() === mesAtual && dataRecSP.getUTCFullYear() === anoAtual;
      });

      const porDia = Array.from({ length: diasNoMes }, (_, i) => ({
        dia: String(i + 1).padStart(2, '0'),
        volume: 0
      }));

      recebimentosMes.forEach(rec => {
        const dataRec = new Date(rec.data_solicitacao);
        const dataRecSP = new Date(dataRec.getTime() + offsetSP * 60 * 1000);
        const dia = dataRecSP.getUTCDate();
        if (dia > 0 && dia <= diasNoMes) {
          porDia[dia - 1].volume++;
        }
      });

      return porDia;
    } else {
      const diasNoMes = new Date(anoSelecionadoRecebimento, mesSelecionadoRecebimento, 0).getDate();

      const recebimentosMesSelecionado = todosRecebimentosSemPaginacao.filter(r => {
        if (!r.data_solicitacao || r.status === "cancelado") return false;
        const dataRec = new Date(r.data_solicitacao);
        const dataRecSP = dataRec.toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' });
        const [, mesRec, anoRec] = dataRecSP.split('/');
        return parseInt(mesRec) === mesSelecionadoRecebimento && parseInt(anoRec) === anoSelecionadoRecebimento;
      });

      const porDia = Array.from({ length: diasNoMes }, (_, i) => ({
        dia: String(i + 1).padStart(2, '0'),
        volume: 0
      }));

      recebimentosMesSelecionado.forEach(rec => {
        const dataRec = new Date(rec.data_solicitacao);
        const dataRecSP = dataRec.toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' });
        const [diaRec] = dataRecSP.split('/');
        const diaNum = parseInt(diaRec);
        if (diaNum > 0 && diaNum <= diasNoMes) {
          porDia[diaNum - 1].volume++;
        }
      });

      return porDia;
    }
  }, [recebimentos, searchTermRecebimentos, filtersRecebimentos, usuarios, visualizacaoGrafico, anoSelecionadoRecebimento, mesSelecionadoRecebimento]);

  // Memoizar cálculos dos indicadores para evitar recalcular a cada digitação
  const indicadoresNotas = useMemo(() => {
    const hoje = new Date();
    const dataHojeSP = hoje.toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' });
    const [, mesHojeSP, anoHojeSP] = dataHojeSP.split('/');

    const notasMes = todasNotasFiscais.filter(n => {
      if (!n.created_date || n.status_nf === "cancelada") return false;
      const dataNota = new Date(n.created_date).toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' });
      const [, mesNota, anoNota] = dataNota.split('/');
      return mesNota === mesHojeSP && anoNota === anoHojeSP;
    });

    const notasHoje = todasNotasFiscais.filter(n => {
      if (!n.created_date || n.status_nf === "cancelada") return false;
      const dataNota = new Date(n.created_date).toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' });
      return dataNota === dataHojeSP;
    });

    const volumesTotal = notasMes.reduce((sum, n) => sum + (n.quantidade_total_volumes_nf || 0), 0);
    const volumesHoje = notasHoje.reduce((sum, n) => sum + (n.quantidade_total_volumes_nf || 0), 0);
    const pesoTotal = notasMes.reduce((sum, n) => sum + (n.peso_total_nf || 0), 0);
    const valorTotal = notasMes.reduce((sum, n) => sum + (n.valor_nota_fiscal || 0), 0);
    const valorHoje = notasHoje.reduce((sum, n) => sum + (n.valor_nota_fiscal || 0), 0);

    return {
      totalMes: notasMes.length,
      totalHoje: notasHoje.length,
      volumesTotal,
      volumesHoje,
      pesoTotal,
      valorTotal,
      valorHoje
    };
  }, [todasNotasFiscais]);

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
    loadUserAndRecebimentos();
  }, []);

  useEffect(() => {
    // Carregar notas automaticamente ao entrar na aba
    if (abaAtiva === "notas" && !notasCarregadas && !loadingNotas) {
      carregarNotasFiscaisPaginadas();
    }
  }, [abaAtiva]);

  const carregarNotasFiscaisPaginadas = async (forcarRecarregar = false) => {
    // Carregar apenas quando solicitado (não automaticamente)
    if (notasCarregadas && !forcarRecarregar) return;
    
    setLoadingNotas(true);
    try {
      // Carregar todas as notas com limit alto (SDK suporta até 10000 por chamada)
      const notasData = await base44.entities.NotaFiscal.list("-created_date", 10000);
      
      console.log(`📦 Total de notas fiscais carregadas: ${notasData.length}`);
      
      setTodasNotasFiscais(notasData);
      setTotalNotasFiscais(notasData.length);
      setNotasCarregadas(true);
    } catch (error) {
      console.error("Erro ao carregar notas fiscais:", error);
      toast.error("Erro ao carregar notas fiscais");
    } finally {
      setLoadingNotas(false);
    }
  };

  const loadUserAndRecebimentos = async () => {
    setLoading(true);
    try {
      const currentUser = await base44.auth.me();
      
      if (currentUser.tipo_perfil !== "operador" && currentUser.role !== "admin") {
        toast.error("Acesso negado. Esta página é apenas para operadores.");
        return;
      }
      
      setUser(currentUser);
      
      // Carregar empresa
      if (currentUser.empresa_id) {
        try {
          const empresaData = await base44.entities.Empresa.get(currentUser.empresa_id);
          setEmpresa(empresaData);
        } catch (error) {
          console.error("Erro ao carregar empresa:", error);
        }
      }
      
      // Carregar usuários com cache (TTL 5 minutos)
      let usuariosData = [];
      try {
        const cacheKey = `usuarios_${currentUser.empresa_id}`;
        const cached = localStorage.getItem(cacheKey);
        const cacheTime = localStorage.getItem(`${cacheKey}_time`);
        
        if (cached && cacheTime && (Date.now() - parseInt(cacheTime)) < 300000) {
          usuariosData = JSON.parse(cached);
        } else {
          const response = await base44.functions.invoke('listarUsuariosEmpresa', {});
          usuariosData = response.data || [];
          localStorage.setItem(cacheKey, JSON.stringify(usuariosData));
          localStorage.setItem(`${cacheKey}_time`, Date.now().toString());
        }
      } catch (error) {
        console.log("Não foi possível carregar usuários:", error);
      }
      
      // Carregar apenas recebimentos (sem limit para ter dados completos)
      const ordensData = await base44.entities.OrdemDeCarregamento.filter(
        { tipo_registro: "recebimento" }, 
        "-data_solicitacao"
      );
      
      setRecebimentos(ordensData);
      setTodasOrdens(ordensData);
      setUsuarios(usuariosData);
      
      // Notas e volumes carregados sob demanda
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const parseXmlValue = (xmlDoc, path) => {
    try {
      const parts = path.split('/');
      let element = xmlDoc;
      
      for (const part of parts) {
        if (!element) return null;
        const elements = element.getElementsByTagName(part);
        if (elements.length === 0) return null;
        element = elements[0];
      }
      
      return element ? element.textContent : null;
    } catch (e) {
      return null;
    }
  };

  const extrairDadosXML = (xmlDoc, xmlString = "") => {
    const numeroNota = parseXmlValue(xmlDoc, "nNF");
    const serieNota = parseXmlValue(xmlDoc, "serie");
    const dhEmi = parseXmlValue(xmlDoc, "dhEmi");
    const dataEmissao = dhEmi ? dhEmi.split('T')[0] : "";
    const natOp = parseXmlValue(xmlDoc, "natOp");
    const chaveNFe = parseXmlValue(xmlDoc, "chNFe") || chaveAcesso;

    const emitNome = parseXmlValue(xmlDoc, "emit/xNome");
    const emitCnpj = parseXmlValue(xmlDoc, "emit/CNPJ");
    const emitFone = parseXmlValue(xmlDoc, "emit/fone");
    const emitCidade = parseXmlValue(xmlDoc, "emit/xMun");
    const emitUf = parseXmlValue(xmlDoc, "emit/UF");
    const emitLogr = parseXmlValue(xmlDoc, "emit/xLgr");
    const emitNro = parseXmlValue(xmlDoc, "emit/nro");
    const emitBairro = parseXmlValue(xmlDoc, "emit/xBairro");
    const emitCep = parseXmlValue(xmlDoc, "emit/CEP");
    
    const destNome = parseXmlValue(xmlDoc, "dest/xNome");
    const destCnpj = parseXmlValue(xmlDoc, "dest/CNPJ");
    const destFone = parseXmlValue(xmlDoc, "dest/fone");
    const destCidade = parseXmlValue(xmlDoc, "dest/xMun");
    const destUf = parseXmlValue(xmlDoc, "dest/UF");
    const destLogr = parseXmlValue(xmlDoc, "dest/xLgr");
    const destNro = parseXmlValue(xmlDoc, "dest/nro");
    const destBairro = parseXmlValue(xmlDoc, "dest/xBairro");
    const destCep = parseXmlValue(xmlDoc, "dest/CEP");
    
    const pesoBruto = parseXmlValue(xmlDoc, "pesoB");
    const valorNF = parseXmlValue(xmlDoc, "vNF");
    const qtdVol = parseXmlValue(xmlDoc, "qVol");
    const xPed = parseXmlValue(xmlDoc, "xPed");
    const infCpl = parseXmlValue(xmlDoc, "infCpl");

    // Calcular data de vencimento (20 dias após emissão)
    let dataVencimento = "";
    if (dataEmissao) {
      const dataEmissaoDate = new Date(dataEmissao);
      dataEmissaoDate.setDate(dataEmissaoDate.getDate() + 20);
      dataVencimento = dataEmissaoDate.toISOString().split('T')[0];
    }

    const pesoOriginal = pesoBruto ? parseFloat(pesoBruto) : 0;
    const volumesOriginal = qtdVol ? parseInt(qtdVol) : 1;

    return {
      chave_nota_fiscal: chaveNFe,
      numero_nota: numeroNota || "",
      serie_nota: serieNota || "",
      data_hora_emissao: dataEmissao || "",
      data_vencimento: dataVencimento,
      natureza_operacao: natOp || "",
      emitente_cnpj: emitCnpj || "",
      emitente_razao_social: emitNome || "",
      emitente_telefone: emitFone || "",
      emitente_cidade: emitCidade || "",
      emitente_uf: emitUf || "",
      emitente_endereco: emitLogr || "",
      emitente_numero: emitNro || "",
      emitente_bairro: emitBairro || "",
      emitente_cep: emitCep || "",
      destinatario_cnpj: destCnpj || "",
      destinatario_razao_social: destNome || "",
      destinatario_telefone: destFone || "",
      destinatario_cidade: destCidade || "",
      destinatario_uf: destUf || "",
      destinatario_endereco: destLogr || "",
      destinatario_numero: destNro || "",
      destinatario_bairro: destBairro || "",
      destinatario_cep: destCep || "",
      peso_total_nf: pesoOriginal,
      peso_original_xml: pesoOriginal,
      valor_nota_fiscal: valorNF ? parseFloat(valorNF) : 0,
      quantidade_total_volumes_nf: volumesOriginal,
      volumes_original_xml: volumesOriginal,
      numero_pedido: xPed || "",
      informacoes_complementares: infCpl || "",
      xml_content: xmlString,
      status_nf: "recebida",
      numero_area: formData.numero_area || ""
    };
  };

  const handleBuscarPorChave = async (chave = chaveAcesso) => {
    if (!chave || chave.length !== 44) {
      return;
    }

    // VALIDAÇÃO DE DUPLICATA: Verificar se já existe antes de buscar na API
    const jaExisteNaLista = notasFiscais.some(nf => nf.chave_nota_fiscal === chave);
    if (jaExisteNaLista) {
      toast.error("⚠️ Esta nota já foi importada!");
      setChaveAcesso("");
      setTimeout(() => {
        const inputChave = document.querySelector('input[placeholder*="Cole ou escaneie"]');
        if (inputChave) inputChave.focus();
      }, 50);
      return;
    }

    // Verificar se já existe no banco de dados
    try {
      const notasExistentes = await base44.entities.NotaFiscal.filter({
        chave_nota_fiscal: chave
      }, null, 1);

      if (notasExistentes.length > 0) {
        const nf = notasExistentes[0];
        const dataRecebimento = nf.created_date ? new Date(nf.created_date).toLocaleDateString('pt-BR') : 'N/A';
        toast.error(`⚠️ Esta nota já foi recebida em ${dataRecebimento}!`);
        setChaveAcesso("");
        setTimeout(() => {
          const inputChave = document.querySelector('input[placeholder*="Cole ou escaneie"]');
          if (inputChave) inputChave.focus();
        }, 50);
        return;
      }
    } catch (error) {
      console.log("Erro ao verificar duplicata (continuando):", error);
    }

    // OTIMIZAÇÃO: Adicionar à fila e liberar UI imediatamente
    const idFila = Date.now();
    setFilaImportacao(prev => [...prev, { id: idFila, chave, status: 'processando' }]);
    setChaveAcesso(""); // Limpar imediatamente para próxima bipagem
    
    // Manter foco para próxima bipagem
    setTimeout(() => {
      if (inputChaveRef.current) {
        inputChaveRef.current.focus();
      }
    }, 50);

    try {
      const response = await base44.functions.invoke('buscarNotaFiscalMeuDanfe', {
        chaveAcesso: chave
      });

      if (response.data?.error) {
        setFilaImportacao(prev => prev.filter(item => item.id !== idFila));
        toast.error(response.data.error);
        return;
      }

      if (response.data?.xml) {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(response.data.xml, "text/xml");

        const parseError = xmlDoc.querySelector("parsererror");
        if (parseError) {
          setFilaImportacao(prev => prev.filter(item => item.id !== idFila));
          toast.error("Erro ao processar o XML retornado.");
          return;
        }

        const dadosNF = extrairDadosXML(xmlDoc, response.data.xml);
        
        if (response.data.danfe_url) {
          dadosNF.danfe_nfe_url = response.data.danfe_url;
        }

        setNotasFiscais(prev => [...prev, dadosNF]);
        setFilaImportacao(prev => prev.filter(item => item.id !== idFila));
        toast.success(`✓ NF-e ${dadosNF.numero_nota} importada!`, { duration: 2000 });
        
        // Limpar e manter foco no campo
        if (inputChaveRef.current) {
          inputChaveRef.current.value = "";
          inputChaveRef.current.focus();
        }
      } else {
        setFilaImportacao(prev => prev.filter(item => item.id !== idFila));
        toast.error("Resposta inválida da API");
      }
    } catch (error) {
      console.error("Erro ao importar nota:", error);
      setFilaImportacao(prev => prev.filter(item => item.id !== idFila));
      const errorMsg = error?.response?.data?.error || error?.message || "Erro ao buscar nota fiscal";
      toast.error(errorMsg);
    }
  };



  const calcularStatusColeta = (coleta) => {
    if (!coleta) return "pendente_aprovacao";

    // Se tem data_coletado nas NFs, está coletado
    if (coleta.status === "aprovada_coleta" && coleta.data_carregamento) {
      return "coletado";
    }

    // Se foi aprovada mas ainda não coletou
    if (coleta.status === "aprovada_coleta") {
      return "aguardando_coleta";
    }

    // Status pendente ou reprovado
    return coleta.status === "reprovada_coleta" ? "reprovada" : "pendente_aprovacao";
  };

  const handleBuscarColetaPorNumero = async () => {
    if (!numeroColeta || numeroColeta.trim() === "") {
      toast.error("Por favor, informe o número da coleta.");
      return;
    }

    setBuscandoColeta(true);
    try {
      const ordensEncontradas = await base44.entities.OrdemDeCarregamento.filter({
        numero_coleta: numeroColeta.trim()
      });

      if (!ordensEncontradas || ordensEncontradas.length === 0) {
        toast.error("Coleta não encontrada.");
        return;
      }

      const coleta = ordensEncontradas[0];

      // Abrir modal com detalhes da coleta
      setColetaSelecionada(coleta);
      setShowColetaModal(true);
      setNumeroColeta("");
    } catch (error) {
      console.error("Erro ao buscar coleta:", error);
      toast.error("Erro ao buscar coleta. Tente novamente.");
    } finally {
      setBuscandoColeta(false);
    }
  };

  const handleImportarColeta = async (coleta) => {
    try {
      if (!coleta.notas_fiscais_ids || coleta.notas_fiscais_ids.length === 0) {
        toast.error("Coleta não possui notas fiscais associadas.");
        return;
      }

      // Buscar todas as notas fiscais da coleta
      const notasFiscaisColeta = await Promise.all(
        coleta.notas_fiscais_ids.map(id => base44.entities.NotaFiscal.get(id))
      );

      // Adicionar todas as notas ao estado
      for (const nf of notasFiscaisColeta) {
        const dadosNF = {
          chave_nota_fiscal: nf.chave_nota_fiscal || "",
          numero_nota: nf.numero_nota || "",
          serie_nota: nf.serie_nota || "",
          data_hora_emissao: nf.data_hora_emissao || "",
          natureza_operacao: nf.natureza_operacao || "",
          emitente_cnpj: nf.emitente_cnpj || "",
          emitente_razao_social: nf.emitente_razao_social || "",
          emitente_telefone: nf.emitente_telefone || "",
          emitente_cidade: nf.emitente_cidade || "",
          emitente_uf: nf.emitente_uf || "",
          emitente_endereco: nf.emitente_endereco || "",
          emitente_numero: nf.emitente_numero || "",
          emitente_bairro: nf.emitente_bairro || "",
          emitente_cep: nf.emitente_cep || "",
          destinatario_cnpj: nf.destinatario_cnpj || "",
          destinatario_razao_social: nf.destinatario_razao_social || "",
          destinatario_telefone: nf.destinatario_telefone || "",
          destinatario_cidade: nf.destinatario_cidade || "",
          destinatario_uf: nf.destinatario_uf || "",
          destinatario_endereco: nf.destinatario_endereco || "",
          destinatario_numero: nf.destinatario_numero || "",
          destinatario_bairro: nf.destinatario_bairro || "",
          destinatario_cep: nf.destinatario_cep || "",
          peso_total_nf: nf.peso_total_nf || 0,
          valor_nota_fiscal: nf.valor_nota_fiscal || 0,
          quantidade_total_volumes_nf: nf.quantidade_total_volumes_nf || 1,
          numero_pedido: nf.numero_pedido || "",
          informacoes_complementares: nf.informacoes_complementares || "",
          xml_content: nf.xml_content || "",
          status_nf: "recebida",
          numero_area: nf.numero_area || formData.numero_area || ""
        };

        setNotasFiscais(prev => [...prev, dadosNF]);
      }

      // Preencher observações se houver
      if (coleta.observacao_carga) {
        setFormData(prev => ({
          ...prev,
          observacao_carga: coleta.observacao_carga
        }));
      }

      setShowColetaModal(false);
      setColetaSelecionada(null);
      toast.success(`${notasFiscaisColeta.length} nota(s) fiscal(is) importada(s) da coleta ${coleta.numero_coleta}!`);
    } catch (error) {
      console.error("Erro ao importar coleta:", error);
      toast.error("Erro ao importar notas fiscais da coleta.");
    }
  };

  const handleFileUpload = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setSaving(true);
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        if (file.type === "text/xml" || file.name.endsWith(".xml")) {
          const reader = new FileReader();
          reader.onload = async (event) => {
            try {
              const parser = new DOMParser();
              const xmlDoc = parser.parseFromString(event.target.result, "text/xml");

              const parseError = xmlDoc.querySelector("parsererror");
              if (parseError) {
                toast.error(`Erro ao processar ${file.name}`);
                return;
              }

              const dadosNF = extrairDadosXML(xmlDoc, event.target.result);
              setNotasFiscais(prev => [...prev, dadosNF]);
              toast.success(`NF-e ${dadosNF.numero_nota} adicionada!`);
            } catch (xmlError) {
              console.error("Erro ao processar XML:", xmlError);
              toast.error(`Erro ao processar ${file.name}`);
            }
          };
          reader.readAsText(file);
        }
      }
    } catch (error) {
      console.error("Erro ao processar arquivos:", error);
      toast.error("Erro ao processar arquivos");
    } finally {
      setSaving(false);
      e.target.value = '';
    }
  };

  const generateNumeroRecebimento = () => {
    const year = new Date().getFullYear();
    const sequence = (recebimentos.length + 1).toString().padStart(5, '0');
    return `REC-${year}-${sequence}`;
  };

  const generateIdentificadorUnico = (notaNumero, sequencial) => {
    const agora = new Date();
    const dia = String(agora.getDate()).padStart(2, '0');
    const mes = String(agora.getMonth() + 1).padStart(2, '0');
    const ano = String(agora.getFullYear()).slice(-2);
    const hh = String(agora.getHours()).padStart(2, '0');
    const mm = String(agora.getMinutes()).padStart(2, '0');
    const ss = String(agora.getSeconds()).padStart(2, '0');
    const timestamp = `${dia}${mes}${ano}${hh}${mm}${ss}`;
    return `VOL-${notaNumero}-${sequencial}-${timestamp}`;
  };

  const handleRemoverNota = (index) => {
    setNotasFiscais(prev => prev.filter((_, i) => i !== index));
    toast.success("Nota fiscal removida");
  };

  const handleEditarNota = (index) => {
    setNotaParaEditar({ ...notasFiscais[index], index });
    setShowNotaForm(true);
  };

  const handleInformarVolumes = async (index) => {
    const nota = notasFiscais[index];
    
    // Carregar volumes da nota se já foi salva (tem ID)
    if (nota.id && nota.volumes_ids?.length > 0) {
      try {
        const volumes = await Promise.all(
          nota.volumes_ids.map(id => base44.entities.Volume.get(id))
        );
        setNotaParaVolumes({ ...nota, index, volumes });
      } catch (error) {
        console.log("Erro ao carregar volumes (usando dados locais):", error);
        setNotaParaVolumes({ ...nota, index });
      }
    } else {
      setNotaParaVolumes({ ...nota, index });
    }
    
    setShowVolumesModal(true);
  };

  const handleSalvarVolumes = (notaData) => {
    if (notaParaVolumes?.index !== undefined) {
      setNotasFiscais(prev => prev.map((nf, i) => i === notaParaVolumes.index ? notaData : nf));
      
      // Se tem carta de correção, adicionar observação
      if (notaData.tem_carta_correcao) {
        const pesoOriginal = notaData.peso_nf || 0;
        const volumeOriginal = notaData.volumes_nf || 0;
        const pesoAtual = notaData.peso_total_nf || 0;
        const volumeAtual = notaData.quantidade_total_volumes_nf || 0;
        
        let textoCorrecao = "";
        
        if (Math.abs(pesoAtual - pesoOriginal) > 0.001 && volumeAtual !== volumeOriginal) {
          textoCorrecao = `[CARTA DE CORREÇÃO] NF ${notaData.numero_nota}: Alteração de peso (de ${pesoOriginal}kg para ${pesoAtual.toFixed(3)}kg) e volume (de ${volumeOriginal} para ${volumeAtual} volumes). Carta de correção anexada.`;
        } else if (Math.abs(pesoAtual - pesoOriginal) > 0.001) {
          textoCorrecao = `[CARTA DE CORREÇÃO] NF ${notaData.numero_nota}: Alteração de peso (de ${pesoOriginal}kg para ${pesoAtual.toFixed(3)}kg). Carta de correção anexada.`;
        } else if (volumeAtual !== volumeOriginal) {
          textoCorrecao = `[CARTA DE CORREÇÃO] NF ${notaData.numero_nota}: Alteração de volume (de ${volumeOriginal} para ${volumeAtual} volumes). Carta de correção anexada.`;
        }
        
        if (textoCorrecao) {
          setFormData(prev => ({
            ...prev,
            observacao_carga: prev.observacao_carga 
              ? `${prev.observacao_carga}\n\n${textoCorrecao}` 
              : textoCorrecao
          }));
        }
      }
      
      toast.success("Volumes atualizados com sucesso!");
    }
  };

  const handleSalvarNota = (notaData) => {
    if (notaParaEditar?.index !== undefined) {
      setNotasFiscais(prev => prev.map((nf, i) => i === notaParaEditar.index ? notaData : nf));
      toast.success("Nota fiscal atualizada");
    } else {
      setNotasFiscais(prev => [...prev, notaData]);
      toast.success("Nota fiscal adicionada");
    }
  };

  const handleCancelarRecebimento = async () => {
    if (!recebimentoParaCancelar) return;
    
    if (!motivoCancelamento.trim()) {
      toast.error("Por favor, informe o motivo do cancelamento");
      return;
    }

    setSaving(true);
    try {
      // Atualizar status da ordem para cancelado
      await base44.entities.OrdemDeCarregamento.update(recebimentoParaCancelar.id, {
        status: "cancelado",
        observacao_carga: recebimentoParaCancelar.observacao_carga 
          ? `${recebimentoParaCancelar.observacao_carga}\n\n[CANCELADO] ${motivoCancelamento}` 
          : `[CANCELADO] ${motivoCancelamento}`
      });

      // Atualizar status das notas fiscais para "entrada_cancelada"
      if (recebimentoParaCancelar.notas_fiscais_ids && recebimentoParaCancelar.notas_fiscais_ids.length > 0) {
        for (const nfId of recebimentoParaCancelar.notas_fiscais_ids) {
          await base44.entities.NotaFiscal.update(nfId, {
            status_nf: "cancelada"
          });
        }
      }

      toast.success("Recebimento cancelado com sucesso!");
      setShowCancelModal(false);
      setRecebimentoParaCancelar(null);
      setMotivoCancelamento("");
      loadUserAndRecebimentos();
    } catch (error) {
      console.error("Erro ao cancelar recebimento:", error);
      toast.error("Erro ao cancelar recebimento");
    } finally {
      setSaving(false);
    }
  };

  const handleEditarRecebimento = async (recebimento) => {
    try {
      setEditandoRecebimento(recebimento);
      
      // Carregar notas fiscais do recebimento
      if (recebimento.notas_fiscais_ids && recebimento.notas_fiscais_ids.length > 0) {
        const notasPromises = recebimento.notas_fiscais_ids.map(id => 
          base44.entities.NotaFiscal.get(id)
        );
        const notas = await Promise.all(notasPromises);
        
        // Converter para formato do formulário
        const notasFormatadas = notas.map(nf => ({
          chave_nota_fiscal: nf.chave_nota_fiscal || "",
          numero_nota: nf.numero_nota || "",
          serie_nota: nf.serie_nota || "",
          data_hora_emissao: nf.data_hora_emissao || "",
          natureza_operacao: nf.natureza_operacao || "",
          emitente_cnpj: nf.emitente_cnpj || "",
          emitente_razao_social: nf.emitente_razao_social || "",
          emitente_telefone: nf.emitente_telefone || "",
          emitente_cidade: nf.emitente_cidade || "",
          emitente_uf: nf.emitente_uf || "",
          emitente_endereco: nf.emitente_endereco || "",
          emitente_numero: nf.emitente_numero || "",
          emitente_bairro: nf.emitente_bairro || "",
          emitente_cep: nf.emitente_cep || "",
          destinatario_cnpj: nf.destinatario_cnpj || "",
          destinatario_razao_social: nf.destinatario_razao_social || "",
          destinatario_telefone: nf.destinatario_telefone || "",
          destinatario_cidade: nf.destinatario_cidade || "",
          destinatario_uf: nf.destinatario_uf || "",
          destinatario_endereco: nf.destinatario_endereco || "",
          destinatario_numero: nf.destinatario_numero || "",
          destinatario_bairro: nf.destinatario_bairro || "",
          destinatario_cep: nf.destinatario_cep || "",
          peso_total_nf: nf.peso_total_nf || 0,
          valor_nota_fiscal: nf.valor_nota_fiscal || 0,
          quantidade_total_volumes_nf: nf.quantidade_total_volumes_nf || 1,
          numero_pedido: nf.numero_pedido || "",
          informacoes_complementares: nf.informacoes_complementares || "",
          xml_content: nf.xml_content || "",
          numero_area: nf.numero_area || ""
        }));
        
        setNotasFiscais(notasFormatadas);
      }
      
      setFormData({
        observacao_carga: recebimento.observacao_carga || "",
        numero_area: recebimento.notas_fiscais_ids && recebimento.notas_fiscais_ids.length > 0 
          ? (await base44.entities.NotaFiscal.get(recebimento.notas_fiscais_ids[0])).numero_area || ""
          : ""
      });
      
      setShowForm(true);
    } catch (error) {
      console.error("Erro ao carregar recebimento para edição:", error);
      toast.error("Erro ao carregar recebimento");
    }
  };

  const carregarVolumesOrdem = async (ordemId) => {
    // Verificar cache primeiro
    if (volumesCache[ordemId]) {
      return volumesCache[ordemId];
    }
    
    // Carregar do banco
    const volumes = await base44.entities.Volume.filter({ ordem_id: ordemId }, null, 1000);
    
    // Salvar no cache
    setVolumesCache(prev => ({ ...prev, [ordemId]: volumes }));
    
    return volumes;
  };

  const handleImprimirEtiquetas = async (recebimento) => {
    try {
      // Carregar notas e volumes sob demanda
      const notas = await Promise.all(
        recebimento.notas_fiscais_ids.map(id => base44.entities.NotaFiscal.get(id))
      );
      
      const volumes = await carregarVolumesOrdem(recebimento.id);
      
      setOrdemParaImpressao(recebimento);
      setNotasOrdemImpressao(notas);
      setVolumesOrdemImpressao(volumes);
      setShowImpressaoOrdemModal(true);
    } catch (error) {
      console.error("Erro ao carregar dados para impressão:", error);
      toast.error("Erro ao carregar dados para impressão");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (notasFiscais.length === 0) {
      toast.error("Adicione ao menos uma nota fiscal");
      return;
    }

    if (!formData.numero_area || formData.numero_area.trim() === "") {
      toast.error("Informe o número da área de armazenagem");
      return;
    }

    setSaving(true);
    try {
      // VALIDAÇÃO DE DUPLICATAS: Verificar se alguma nota já existe no banco
      const chavesParaVerificar = notasFiscais
        .map(nf => nf.chave_nota_fiscal)
        .filter(chave => chave && chave.length === 44);
      
      if (chavesParaVerificar.length > 0) {
        const notasDuplicadas = [];
        
        for (const chave of chavesParaVerificar) {
          const existentes = await base44.entities.NotaFiscal.filter({
            chave_nota_fiscal: chave
          }, null, 1);
          
          if (existentes.length > 0) {
            notasDuplicadas.push({
              chave,
              nota: existentes[0]
            });
          }
        }
        
        if (notasDuplicadas.length > 0) {
          const mensagens = notasDuplicadas.map(dup => 
            `• NF ${dup.nota.numero_nota} - Recebida em ${dup.nota.created_date ? new Date(dup.nota.created_date).toLocaleDateString('pt-BR') : 'N/A'}`
          ).join('\n');
          
          const confirmar = confirm(
            `⚠️ ATENÇÃO: ${notasDuplicadas.length} nota(s) fiscal(is) já existe(m) no banco de dados:\n\n${mensagens}\n\nDeseja continuar mesmo assim?`
          );
          
          if (!confirmar) {
            setSaving(false);
            return;
          }
        }
      }
      
      const pesoTotal = notasFiscais.reduce((sum, nf) => sum + (nf.peso_total_nf || 0), 0);
      const valorTotal = notasFiscais.reduce((sum, nf) => sum + (nf.valor_nota_fiscal || 0), 0);
      const volumesTotal = notasFiscais.reduce((sum, nf) => sum + (nf.quantidade_total_volumes_nf || 0), 0);

      // Validar campos obrigatórios ANTES de tentar salvar
      const camposFaltando = [];
      
      if (!notasFiscais[0]?.emitente_razao_social) {
        camposFaltando.push("Remetente (primeira nota fiscal)");
      }
      if (!notasFiscais[0]?.emitente_cidade) {
        camposFaltando.push("Cidade de Origem (primeira nota fiscal)");
      }
      if (!notasFiscais[0]?.destinatario_cidade && !notasFiscais[0]?.destino_cidade) {
        camposFaltando.push("Cidade de Destino (primeira nota fiscal)");
      }
      if (!pesoTotal || pesoTotal <= 0) {
        camposFaltando.push("Peso Total (informar dimensões dos volumes)");
      }

      if (camposFaltando.length > 0) {
        toast.error(`Campos obrigatórios faltando:\n${camposFaltando.join('\n')}`, {
          duration: 6000
        });
        setSaving(false);
        return;
      }

      if (editandoRecebimento) {
        // Atualizar ordem existente - enviar apenas campos opcionais
        const updateData = {
          observacao_carga: formData.observacao_carga || "",
          peso_total_consolidado: pesoTotal || 0,
          valor_total_consolidado: valorTotal || 0,
          volumes_total_consolidado: volumesTotal || 0,
          peso: pesoTotal || 0,
          volumes: volumesTotal || 0
        };

        // Atualizar apenas se houver dados válidos da nota fiscal
        if (notasFiscais.length > 0 && notasFiscais[0]) {
          if (notasFiscais[0].emitente_razao_social) {
            updateData.cliente = notasFiscais[0].emitente_razao_social;
          }
          if (notasFiscais[0].emitente_cnpj) {
            updateData.cliente_cnpj = notasFiscais[0].emitente_cnpj;
          }
          if (notasFiscais[0].emitente_cidade) {
            updateData.origem = notasFiscais[0].emitente_cidade;
          }
          if (notasFiscais[0].emitente_uf) {
            updateData.origem_uf = notasFiscais[0].emitente_uf;
          }
          if (notasFiscais[0].destinatario_cnpj) {
            updateData.destinatario_cnpj = notasFiscais[0].destinatario_cnpj;
          }
          if (notasFiscais[0].destinatario_razao_social) {
            updateData.destinatario = notasFiscais[0].destinatario_razao_social;
          }
          if (notasFiscais[0].destinatario_cidade) {
            updateData.destino = notasFiscais[0].destinatario_cidade;
          }
          if (notasFiscais[0].destinatario_uf) {
            updateData.destino_uf = notasFiscais[0].destinatario_uf;
          }
        }

        await base44.entities.OrdemDeCarregamento.update(editandoRecebimento.id, updateData);

        // Atualizar número da área em todas as notas fiscais
        if (editandoRecebimento.notas_fiscais_ids) {
          for (const nfId of editandoRecebimento.notas_fiscais_ids) {
            await base44.entities.NotaFiscal.update(nfId, {
              numero_area: formData.numero_area
            });
          }
        }

        toast.success("Recebimento atualizado com sucesso!");
      } else {
        // Criar nova ordem de recebimento
        const ordemData = {
          tipo_ordem: "recebimento",
          tipo_registro: "recebimento",
          status: "novo",
          numero_carga: generateNumeroRecebimento(),
          empresa_id: user.empresa_id,
          
          cliente: notasFiscais[0]?.emitente_razao_social || "Diversos",
          cliente_cnpj: notasFiscais[0]?.emitente_cnpj || "",
          origem: notasFiscais[0]?.emitente_cidade || "Diversos",
          origem_uf: notasFiscais[0]?.emitente_uf || "",
          
          destinatario: user.empresa_id ? "Armazém Operador" : notasFiscais[0]?.destinatario_razao_social,
          destinatario_cnpj: notasFiscais[0]?.destinatario_cnpj || "",
          destino: notasFiscais[0]?.destinatario_cidade || "Armazém",
          destino_uf: notasFiscais[0]?.destinatario_uf || "",
          
          produto: "Diversos",
          peso: pesoTotal,
          volumes: volumesTotal,
          peso_total_consolidado: pesoTotal,
          valor_total_consolidado: valorTotal,
          volumes_total_consolidado: volumesTotal,
          
          observacao_carga: formData.observacao_carga,
          data_solicitacao: new Date().toISOString(),
          meio_solicitacao: "sistema"
        };

        const novaOrdem = await base44.entities.OrdemDeCarregamento.create(ordemData);
        
        // Criar as notas fiscais e seus volumes
        const notasIds = [];
        
        for (const nfData of notasFiscais) {
          const notaFiscal = await base44.entities.NotaFiscal.create({
            ...nfData,
            ordem_id: novaOrdem.id,
            numero_area: formData.numero_area
          });
          
          notasIds.push(notaFiscal.id);
          
          // Criar volumes em lote para esta nota (OTIMIZADO para muitos volumes)
          const volumesParaCriar = [];
          for (let i = 1; i <= nfData.quantidade_total_volumes_nf; i++) {
            volumesParaCriar.push({
              nota_fiscal_id: notaFiscal.id,
              ordem_id: novaOrdem.id,
              identificador_unico: generateIdentificadorUnico(nfData.numero_nota, i),
              numero_sequencial: i,
              peso_volume: nfData.peso_total_nf / nfData.quantidade_total_volumes_nf,
              quantidade: 1,
              status_volume: "criado"
            });
          }
          
          // Criar volumes em lote
          const volumesCriados = await base44.entities.Volume.bulkCreate(volumesParaCriar);
          const volumesIds = volumesCriados.map(v => v.id);
          
          // Atualizar nota com IDs dos volumes
          await base44.entities.NotaFiscal.update(notaFiscal.id, {
            volumes_ids: volumesIds
          });
        }
        
        // Atualizar ordem com IDs das notas
        await base44.entities.OrdemDeCarregamento.update(novaOrdem.id, {
          notas_fiscais_ids: notasIds
        });
        
        toast.success("Recebimento registrado com sucesso!");
        
        // Perguntar se deseja imprimir etiquetas
        const desejaImprimir = confirm("Recebimento salvo! Deseja imprimir as etiquetas agora?");
        
        if (desejaImprimir) {
          // Carregar a ordem recém-criada/atualizada
          const ordemId = editandoRecebimento?.id || novaOrdem.id;
          const ordemAtualizada = await base44.entities.OrdemDeCarregamento.get(ordemId);
          
          // Carregar notas fiscais e volumes
          const notasPromises = ordemAtualizada.notas_fiscais_ids.map(id => 
            base44.entities.NotaFiscal.get(id)
          );
          const notasData = await Promise.all(notasPromises);
          
          const volumesPromises = notasData.flatMap(nota => 
            nota.volumes_ids?.map(id => base44.entities.Volume.get(id)) || []
          );
          const volumesData = await Promise.all(volumesPromises);
          
          setOrdemParaImpressao(ordemAtualizada);
          setNotasOrdemImpressao(notasData);
          setVolumesOrdemImpressao(volumesData);
          setShowImpressaoOrdemModal(true);
        }
      }
      
      setShowForm(false);
      setEditandoRecebimento(null);
      setNotasFiscais([]);
      setFormData({ observacao_carga: "", numero_area: "" });
      
      if (!confirm("Recebimento salvo! Deseja imprimir as etiquetas agora?")) {
        loadUserAndRecebimentos();
      }
    } catch (error) {
      console.error("Erro ao salvar recebimento:", error);
      toast.error("Erro ao salvar recebimento");
    } finally {
      setSaving(false);
    }
  };

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

  if (!user || (user.tipo_perfil !== "operador" && user.role !== "admin")) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: theme.bg }}>
        <Card style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}>
          <CardContent className="p-8 text-center">
            <p style={{ color: theme.text }}>Acesso negado. Esta página é apenas para operadores.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const statusColetaConfig = {
    pendente_aprovacao: { label: "Pendente Aprovação", color: "bg-yellow-500" },
    aguardando_coleta: { label: "Aguardando Coleta", color: "bg-blue-500" },
    coletado: { label: "Coletado", color: "bg-green-500" },
    reprovada: { label: "Reprovada", color: "bg-red-500" }
  };

  // Memoizar filtros de recebimentos para evitar recalcular a cada digitação
  const recebimentosFiltrados = useMemo(() => {
    return recebimentos.filter(rec => {
      const matchesSearch = !searchTermRecebimentos ||
        rec.numero_carga?.toLowerCase().includes(searchTermRecebimentos.toLowerCase()) ||
        rec.cliente?.toLowerCase().includes(searchTermRecebimentos.toLowerCase());
      
      const matchesFornecedor = !filtersRecebimentos.fornecedor || 
        rec.cliente?.toLowerCase().includes(filtersRecebimentos.fornecedor.toLowerCase());
      
      const matchesConferente = !filtersRecebimentos.conferente ||
        usuarios.find(u => u.id === rec.conferente_id)?.full_name?.toLowerCase().includes(filtersRecebimentos.conferente.toLowerCase());
      
      const matchesDataInicio = !filtersRecebimentos.dataInicio || 
        (rec.data_solicitacao && new Date(rec.data_solicitacao) >= new Date(filtersRecebimentos.dataInicio));
      
      const matchesDataFim = !filtersRecebimentos.dataFim || 
        (rec.data_solicitacao && new Date(rec.data_solicitacao) <= new Date(filtersRecebimentos.dataFim + 'T23:59:59'));
      
      return matchesSearch && matchesFornecedor && matchesConferente && matchesDataInicio && matchesDataFim;
    });
  }, [recebimentos, searchTermRecebimentos, filtersRecebimentos, usuarios]);

  return (
    <div className="min-h-screen" style={{ backgroundColor: theme.bg }}>
      <div className="p-3 sm:p-6 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 sm:mb-6">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold mb-1" style={{ color: theme.text }}>Recebimento e Notas Fiscais</h1>
            <p className="text-xs sm:text-sm" style={{ color: theme.textMuted }}>Gerencie o recebimento de mercadorias</p>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={loadUserAndRecebimentos}
              style={{ borderColor: theme.cardBorder, color: theme.text }}
              className="flex-1 sm:flex-none"
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
            {(user?.role === 'admin' || user?.tipo_perfil === 'operador') && (
              <Button
                variant="outline"
                size="sm"
                onClick={async () => {
                  const forcar = confirm('Deseja FORÇAR atualização de TODAS as notas (incluindo as que já têm vencimento)?');
                  
                  try {
                    toast.info("Atualizando vencimentos...");
                    const { data } = await base44.functions.invoke('atualizarVencimentosNotas', { forcar });
                    if (data.success) {
                      toast.success(data.mensagem);
                      if (data.detalhes?.length > 0) {
                        console.log('Detalhes da atualização:', data.detalhes);
                      }
                      loadUserAndRecebimentos();
                    } else {
                      toast.error(data.error || "Erro ao atualizar vencimentos");
                    }
                  } catch (error) {
                    console.error(error);
                    toast.error("Erro ao atualizar vencimentos");
                  }
                }}
                style={{ borderColor: theme.cardBorder, color: theme.text }}
                className="flex-1 sm:flex-none text-xs"
              >
                Atualizar Vencimentos
              </Button>
            )}
            <Button
              onClick={() => {
                setEditandoRecebimento(null);
                setNotasFiscais([]);
                setFormData({ observacao_carga: "", numero_area: "" });
                setAbaAtiva("recebimentos");
                setShowForm(true);
              }}
              className="bg-blue-600 hover:bg-blue-700 flex-1 sm:flex-none"
              size="sm"
            >
              <Plus className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Novo Recebimento</span>
              <span className="sm:hidden">Novo</span>
            </Button>
          </div>
        </div>

        <Tabs value={abaAtiva} onValueChange={setAbaAtiva} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="notas" className="text-xs sm:text-sm">
              <FileText className="w-4 h-4 mr-2" />
              Notas Fiscais
            </TabsTrigger>
            <TabsTrigger value="recebimentos" className="text-xs sm:text-sm">
              <Package className="w-4 h-4 mr-2" />
              Ordens de Recebimento
            </TabsTrigger>
          </TabsList>

          <TabsContent value="notas" className="mt-0">
            {/* Indicadores Memoizados */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
              <Card style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2" style={{ color: theme.text }}>
                    <FileText className="w-4 h-4 text-blue-600" />
                    Total de Notas Fiscais
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-blue-600">{indicadoresNotas.totalMes}</p>
                  <p className="text-xs mt-1" style={{ color: theme.textMuted }}>
                    {indicadoresNotas.totalHoje} recebidas hoje
                  </p>
                </CardContent>
              </Card>

              <Card style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2" style={{ color: theme.text }}>
                    <Package className="w-4 h-4 text-green-600" />
                    Total de Volumes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-green-600">{indicadoresNotas.volumesTotal}</p>
                  <p className="text-xs mt-1" style={{ color: theme.textMuted }}>
                    {indicadoresNotas.volumesHoje} volumes hoje
                  </p>
                </CardContent>
              </Card>

              <Card style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2" style={{ color: theme.text }}>
                    <TrendingUp className="w-4 h-4 text-purple-600" />
                    Valor Total
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-purple-600">
                    R$ {indicadoresNotas.valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                  <p className="text-xs mt-1" style={{ color: theme.textMuted }}>
                    R$ {indicadoresNotas.valorHoje.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} recebidos hoje
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-4 gap-4">
              <div className="flex gap-2 w-full lg:w-auto flex-1">
                <div className="relative flex-1 lg:w-64">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: theme.textMuted }} />
                  <Input
                    placeholder="Buscar notas fiscais..."
                    value={searchInputNotas}
                    onChange={(e) => setSearchInputNotas(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        setSearchTermNotas(searchInputNotas);
                        setPaginaAtualNotas(1);
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
                    setSearchTermNotas(searchInputNotas);
                    setPaginaAtualNotas(1);
                  }}
                  className="bg-blue-600 hover:bg-blue-700 h-9"
                >
                  <Search className="w-4 h-4" />
                </Button>
                {searchTermNotas && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSearchTermNotas("");
                      setSearchInputNotas("");
                      setPaginaAtualNotas(1);
                    }}
                    className="h-9"
                    style={{ borderColor: theme.cardBorder, color: theme.text }}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => carregarNotasFiscaisPaginadas(true)}
                  disabled={loadingNotas}
                  className="h-8"
                  style={{ borderColor: theme.cardBorder, color: theme.text }}
                >
                  <RefreshCw className={`w-3 h-3 ${loadingNotas ? 'animate-spin' : ''}`} />
                </Button>
                <PaginacaoControles
                  paginaAtual={paginaAtualNotas}
                  totalRegistros={totalNotasFiltradas}
                  limite={limiteNotas}
                  onPaginaAnterior={() => setPaginaAtualNotas(prev => Math.max(1, prev - 1))}
                  onProximaPagina={() => setPaginaAtualNotas(prev => prev + 1)}
                  isDark={isDark}
                />
              </div>
            </div>
            {loadingNotas ? (
              <Card style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}>
                <CardContent className="py-12 text-center">
                  <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                  <p className="text-sm" style={{ color: theme.textMuted }}>Carregando notas fiscais...</p>
                </CardContent>
              </Card>
            ) : (
              <NotasFiscaisTable
                notasFiscais={todasNotasFiscais}
                notasFiscaisPaginadas={notasFiscaisFiltradas}
                volumes={todosVolumes}
                ordens={todasOrdens}
                empresa={empresa}
                onRefresh={() => carregarNotasFiscaisPaginadas(true)}
                isDark={isDark}
                showFilters={false}
                loading={loadingNotas}
              />
            )}
          </TabsContent>

          <TabsContent value="recebimentos" className="mt-0">
            {/* Indicadores e Gráficos */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
              <Card style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2" style={{ color: theme.text }}>
                    <Package className="w-4 h-4 text-blue-600" />
                    Total de Recebimentos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-blue-600">
                    {indicadoresRecebimentos.totalMes}
                  </p>
                  <p className="text-xs mt-1" style={{ color: theme.textMuted }}>
                    Em {indicadoresRecebimentos.mesNome}
                  </p>
                </CardContent>
              </Card>

              <Card style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2" style={{ color: theme.text }}>
                    <TrendingUp className="w-4 h-4 text-green-600" />
                    Volume Total
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-green-600">
                    {indicadoresNotas.volumesTotal}
                  </p>
                  <p className="text-xs mt-1" style={{ color: theme.textMuted }}>
                    {indicadoresNotas.pesoTotal.toLocaleString()} kg
                  </p>
                </CardContent>
              </Card>

              <Card style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2" style={{ color: theme.text }}>
                    <FileText className="w-4 h-4 text-purple-600" />
                    Notas Fiscais
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-purple-600">
                    {indicadoresNotas.totalMes}
                  </p>
                  <p className="text-xs mt-1" style={{ color: theme.textMuted }}>
                    R$ {indicadoresNotas.valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Gráfico de Recebimentos */}
            <Card className="mb-4" style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => setGraficoExpandidoRecebimento(!graficoExpandidoRecebimento)}
                    className="flex items-center gap-2 hover:opacity-70 transition-opacity"
                  >
                    <CardTitle className="text-sm flex items-center gap-2" style={{ color: theme.text }}>
                      <TrendingUp className="w-4 h-4 text-blue-600" />
                      Volume de Recebimentos
                    </CardTitle>
                    <Badge variant="outline" className="text-xs">
                      {graficoExpandidoRecebimento ? "Retrair" : "Expandir"}
                    </Badge>
                  </button>
                  <div className="flex gap-2 flex-wrap">
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
                          value={mesSelecionadoRecebimento}
                          onChange={(e) => setMesSelecionadoRecebimento(parseInt(e.target.value))}
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
                          value={anoSelecionadoRecebimento}
                          onChange={(e) => setAnoSelecionadoRecebimento(parseInt(e.target.value))}
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
              {graficoExpandidoRecebimento && (
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={dadosGraficoRecebimentos}>
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
                      dataKey="volume" 
                      stroke="#3b82f6" 
                      strokeWidth={2}
                      dot={{ fill: '#3b82f6', r: 3 }}
                      activeDot={{ r: 5 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
                <p className="text-xs text-center mt-2" style={{ color: theme.textMuted }}>
                  {(() => {
                    const hoje = new Date();
                    const offsetSP = -3 * 60;
                    const dataHojeSP = new Date(hoje.getTime() + offsetSP * 60 * 1000);
                    const diaHojeSP = dataHojeSP.getUTCDate();
                    const mesHojeSP = dataHojeSP.getUTCMonth();
                    const anoHojeSP = dataHojeSP.getUTCFullYear();

                    if (visualizacaoGrafico === "diario") {
                      const total = recebimentos.filter(r => {
                        if (!r.data_solicitacao) return false;
                        const dataRec = new Date(r.data_solicitacao);
                        const dataRecSP = new Date(dataRec.getTime() + offsetSP * 60 * 1000);
                        return dataRecSP.getUTCFullYear() === anoHojeSP &&
                               dataRecSP.getUTCMonth() === mesHojeSP &&
                               dataRecSP.getUTCDate() === diaHojeSP;
                      }).length;
                      return `Recebimentos de hoje (${diaHojeSP}/${mesHojeSP + 1}/${anoHojeSP}) por hora - Total: ${total}`;
                    } else if (visualizacaoGrafico === "mensal") {
                      const total = recebimentos.filter(r => {
                        if (!r.data_solicitacao) return false;
                        const dataRec = new Date(r.data_solicitacao);
                        const dataRecSP = new Date(dataRec.getTime() + offsetSP * 60 * 1000);
                        return dataRecSP.getUTCMonth() === mesHojeSP && dataRecSP.getUTCFullYear() === anoHojeSP;
                      }).length;
                      const mesNome = new Date(anoHojeSP, mesHojeSP, 1).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
                      return `Recebimentos de ${mesNome} - Total: ${total}`;
                    } else {
                      const recebimentosMesSelecionado = recebimentos.filter(r => {
                        if (!r.data_solicitacao || r.status === "cancelado") return false;
                        const dataRec = new Date(r.data_solicitacao);
                        const dataRecSP = dataRec.toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' });
                        const [, mesRec, anoRec] = dataRecSP.split('/');
                        return parseInt(mesRec) === mesSelecionadoRecebimento && parseInt(anoRec) === anoSelecionadoRecebimento;
                      });
                      const total = recebimentosMesSelecionado.length;
                      const mesNome = new Date(anoSelecionadoRecebimento, mesSelecionadoRecebimento - 1, 1).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
                      return `Recebimentos de ${mesNome} - Total: ${total}`;
                    }
                  })()}
                </p>
              </CardContent>
              )}
            </Card>

            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-4 gap-4">
              <div className="flex gap-2 w-full lg:w-auto flex-1">
                <div className="relative flex-1 lg:w-64">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: theme.textMuted }} />
                  <Input
                    placeholder="Buscar recebimentos..."
                    value={searchTermRecebimentos}
                    onChange={(e) => setSearchTermRecebimentos(e.target.value)}
                    className="pl-10 h-9 text-sm"
                    style={{ backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.text }}
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <FiltrosPredefinidos
                  rota="recebimentos"
                  filtrosAtuais={filtersRecebimentos}
                  onAplicarFiltro={(novosFiltros) => {
                    setFiltersRecebimentos(novosFiltros);
                    setPaginaAtualRecebimentos(1);
                  }}
                />
                <PaginacaoControles
                  paginaAtual={paginaAtualRecebimentos}
                  totalRegistros={recebimentosFiltrados.length}
                  limite={limiteRecebimentos}
                  onPaginaAnterior={() => setPaginaAtualRecebimentos(prev => Math.max(1, prev - 1))}
                  onProximaPagina={() => setPaginaAtualRecebimentos(prev => prev + 1)}
                  isDark={isDark}
                />
                <Button
                  variant={showFiltersRecebimentos ? "default" : "outline"}
                  size="sm"
                  onClick={() => setShowFiltersRecebimentos(!showFiltersRecebimentos)}
                  className="h-9"
                  style={!showFiltersRecebimentos ? {
                    backgroundColor: 'transparent',
                    borderColor: theme.inputBorder,
                    color: theme.text
                  } : {}}
                >
                  <Filter className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {showFiltersRecebimentos && (
              <Card className="mb-4" style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}>
                <CardContent className="pt-4 pb-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                    <div>
                      <Label className="text-xs mb-1" style={{ color: theme.textMuted }}>Fornecedor</Label>
                      <Input
                        value={filtersRecebimentos.fornecedor}
                        onChange={(e) => setFiltersRecebimentos({...filtersRecebimentos, fornecedor: e.target.value})}
                        placeholder="Filtrar por fornecedor"
                        className="h-8 text-sm"
                        style={{ backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.text }}
                      />
                    </div>
                    
                    <div>
                      <Label className="text-xs mb-1" style={{ color: theme.textMuted }}>Conferente</Label>
                      <Input
                        value={filtersRecebimentos.conferente}
                        onChange={(e) => setFiltersRecebimentos({...filtersRecebimentos, conferente: e.target.value})}
                        placeholder="Filtrar por conferente"
                        className="h-8 text-sm"
                        style={{ backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.text }}
                      />
                    </div>

                    <div>
                      <Label className="text-xs mb-1" style={{ color: theme.textMuted }}>Data Início</Label>
                      <Input
                        type="date"
                        value={filtersRecebimentos.dataInicio}
                        onChange={(e) => setFiltersRecebimentos({...filtersRecebimentos, dataInicio: e.target.value})}
                        className="h-8 text-sm"
                        style={{ backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.text }}
                      />
                    </div>

                    <div>
                      <Label className="text-xs mb-1" style={{ color: theme.textMuted }}>Data Fim</Label>
                      <Input
                        type="date"
                        value={filtersRecebimentos.dataFim}
                        onChange={(e) => setFiltersRecebimentos({...filtersRecebimentos, dataFim: e.target.value})}
                        className="h-8 text-sm"
                        style={{ backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.text }}
                      />
                    </div>
                  </div>
                  <div className="flex justify-end mt-3 gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setFiltersRecebimentos({
                        dataInicio: "",
                        dataFim: "",
                        fornecedor: "",
                        conferente: ""
                      })}
                      className="h-7 text-xs"
                      style={{
                        backgroundColor: 'transparent',
                        borderColor: theme.inputBorder,
                        color: theme.text
                      }}
                    >
                      Limpar Filtros
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

        {showForm && (
          <Card className="mb-4 sm:mb-6" style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}>
            <CardHeader className="pb-3">
              <CardTitle className="text-base sm:text-lg" style={{ color: theme.text }}>
                {editandoRecebimento ? `Editar Recebimento ${editandoRecebimento.numero_carga}` : 'Novo Recebimento'}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">

                <div className="border rounded-lg p-3 space-y-3" style={{ borderColor: theme.cardBorder, backgroundColor: isDark ? '#1e293b' : '#f8fafc' }}>
                  <div className="flex items-center gap-2">
                    <Upload className="w-4 h-4 text-blue-600" />
                    <Label className="text-sm font-semibold" style={{ color: theme.text }}>
                      Métodos de Entrada
                    </Label>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {/* Manual */}
                    <button
                      type="button"
                      onClick={() => toast.info("Funcionalidade em breve")}
                      className="border rounded-lg p-3 hover:shadow-md transition-all flex items-center gap-3"
                      style={{ 
                        borderColor: theme.cardBorder,
                        backgroundColor: isDark ? '#0f172a' : '#f8fafc'
                      }}
                    >
                      <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#3b82f6' }}>
                        <Edit className="w-4 h-4 text-white" />
                      </div>
                      <div className="text-left">
                        <h3 className="font-semibold text-sm" style={{ color: theme.text }}>Manual</h3>
                        <p className="text-xs" style={{ color: theme.textMuted }}>Criar NF manualmente</p>
                      </div>
                    </button>

                    {/* Upload XML */}
                    <label
                      className="border rounded-lg p-3 hover:shadow-md transition-all cursor-pointer flex items-center gap-3"
                      style={{ 
                        borderColor: theme.cardBorder,
                        backgroundColor: isDark ? '#0f172a' : '#f8fafc'
                      }}
                    >
                      <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#10b981' }}>
                        <Upload className="w-4 h-4 text-white" />
                      </div>
                      <div className="text-left">
                        <h3 className="font-semibold text-sm" style={{ color: theme.text }}>Upload XML</h3>
                        <p className="text-xs" style={{ color: theme.textMuted }}>Arrastar arquivos</p>
                      </div>
                      <Input
                        type="file"
                        accept=".xml"
                        multiple
                        onChange={handleFileUpload}
                        disabled={saving}
                        className="hidden"
                      />
                    </label>

                    {/* Importação por Chave */}
                    <div
                      className="border rounded-lg p-3"
                      style={{ 
                        borderColor: theme.cardBorder,
                        backgroundColor: isDark ? '#0f172a' : '#f8fafc'
                      }}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#8b5cf6' }}>
                          <Search className="w-4 h-4 text-white" />
                        </div>
                        <div className="text-left flex-1">
                          <h3 className="font-semibold text-sm" style={{ color: theme.text }}>Importação Avançada</h3>
                          <p className="text-xs" style={{ color: theme.textMuted }}>XML via chave</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Input
                          ref={inputChaveRef}
                          placeholder="Cole ou escaneie"
                          defaultValue=""
                          onPaste={(e) => {
                            e.preventDefault();
                            const pastedText = e.clipboardData.getData('text');
                            const cleaned = pastedText.replace(/\D/g, '').slice(0, 44);
                            
                            if (inputChaveRef.current) {
                              inputChaveRef.current.value = cleaned;
                            }
                            
                            if (cleaned.length === 44) {
                              handleBuscarPorChave(cleaned);
                              if (inputChaveRef.current) {
                                inputChaveRef.current.value = "";
                              }
                            }
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              const value = e.target.value.replace(/\D/g, '').slice(0, 44);
                              if (value.length === 44) {
                                handleBuscarPorChave(value);
                                if (inputChaveRef.current) {
                                  inputChaveRef.current.value = "";
                                }
                              }
                            }
                          }}
                          maxLength={44}
                          className="text-xs font-mono flex-1 h-9"
                          style={{
                            backgroundColor: theme.cardBg,
                            borderColor: filaImportacao.length > 0 ? '#8b5cf6' : theme.cardBorder,
                            color: theme.text
                          }}
                          disabled={filaImportacao.length > 0}
                          autoComplete="off"
                        />
                        <Button
                          type="button"
                          onClick={() => setShowScanner(true)}
                          disabled={filaImportacao.length > 0}
                          variant="outline"
                          className="h-9 w-9 p-0 flex-shrink-0"
                          style={{ borderColor: theme.cardBorder, color: theme.text }}
                          title="Escanear código"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        </Button>
                      </div>
                      {filaImportacao.length > 0 && (
                        <div className="flex items-center gap-2 mt-2 text-xs" style={{ color: theme.textMuted }}>
                          <div className="w-3 h-3 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
                          Importando {filaImportacao.length} nota(s)...
                        </div>
                      )}
                      <p className="text-xs mt-1" style={{ color: theme.textMuted }}>
                        💡 Busca automática ao colar 44 dígitos | Continue bipando enquanto importa
                      </p>
                    </div>
                  </div>

                  <div>
                    <Label className="text-xs mb-1.5 block" style={{ color: theme.textMuted }}>
                      Buscar por Nº da Coleta
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Ex: COL-2023-00001"
                        value={numeroColeta}
                        onChange={(e) => setNumeroColeta(e.target.value)}
                        className="text-xs flex-1 h-9"
                        style={{
                          backgroundColor: theme.cardBg,
                          borderColor: theme.cardBorder,
                          color: theme.text
                        }}
                      />
                      <Button
                        type="button"
                        onClick={handleBuscarColetaPorNumero}
                        disabled={buscandoColeta || !numeroColeta.trim()}
                        className="bg-green-600 hover:bg-green-700 text-xs px-3 h-9"
                      >
                        {buscandoColeta ? "Buscando..." : "Buscar"}
                      </Button>
                    </div>
                  </div>
                </div>

                {notasFiscais.length > 0 && (
                  <div className="border rounded-lg p-3 sm:p-4 space-y-3" style={{ borderColor: theme.cardBorder }}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Package className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                        <Label className="text-sm sm:text-base font-semibold" style={{ color: theme.text }}>
                          Extrato de Volumes ({notasFiscais.length} notas)
                        </Label>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setNotasFiscais([])}
                        style={{ borderColor: theme.cardBorder, color: 'rgb(239, 68, 68)' }}
                        className="h-7 text-xs px-2"
                      >
                        <X className="w-3 h-3 sm:mr-1" />
                        <span className="hidden sm:inline">Limpar</span>
                      </Button>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="border-b" style={{ borderColor: theme.cardBorder, backgroundColor: isDark ? '#1e293b' : '#f8fafc' }}>
                            <th className="text-left p-2 font-semibold" style={{ color: theme.textMuted }}>Nota</th>
                            <th className="text-left p-2 font-semibold" style={{ color: theme.textMuted }}>Pedido</th>
                            <th className="text-left p-2 font-semibold" style={{ color: theme.textMuted }}>Vencimento</th>
                            <th className="text-left p-2 font-semibold" style={{ color: theme.textMuted }}>Remetente</th>
                            <th className="text-left p-2 font-semibold" style={{ color: theme.textMuted }}>Vols</th>
                            <th className="text-left p-2 font-semibold" style={{ color: theme.textMuted }}>Peso (kg)</th>
                            <th className="text-left p-2 font-semibold" style={{ color: theme.textMuted }}>Valor (R$)</th>
                            <th className="text-left p-2 font-semibold" style={{ color: theme.textMuted }}>Dimensões</th>
                            <th className="text-left p-2 font-semibold" style={{ color: theme.textMuted }}>Ações</th>
                          </tr>
                        </thead>
                        <tbody>
                          {notasFiscais.map((nf, index) => {
                            const volumes = nf.volumes || [];
                            const temDimensoes = volumes.length > 0 && volumes.every(v => 
                              v.altura && v.largura && v.comprimento && 
                              v.altura > 0 && v.largura > 0 && v.comprimento > 0
                            );
                            const dimensoesPendentes = !temDimensoes;
                            
                            // Verificar se peso ou volumes foram editados
                            const pesoEditado = nf.peso_original_xml && Math.abs(nf.peso_total_nf - nf.peso_original_xml) > 0.001;
                            const volumesEditado = nf.volumes_original_xml && nf.quantidade_total_volumes_nf !== nf.volumes_original_xml;
                            
                            // Verificar se nota está vencida
                            const hoje = new Date();
                            hoje.setHours(0, 0, 0, 0);
                            const dataVenc = nf.data_vencimento ? new Date(nf.data_vencimento) : null;
                            if (dataVenc) dataVenc.setHours(0, 0, 0, 0);
                            const notaVencida = dataVenc && dataVenc < hoje;
                            
                            const borderColor = dimensoesPendentes ? '#f97316' : theme.cardBorder;
                            const bgColor = dimensoesPendentes ? (isDark ? '#431407' : '#fff7ed') : 'transparent';

                            return (
                              <tr key={index} className="border-b hover:bg-opacity-50" style={{ borderColor: borderColor, backgroundColor: bgColor }}>
                                <td className="p-2">
                                  <div>
                                    <p className="font-semibold" style={{ color: theme.text }}>{nf.numero_nota}</p>
                                    {nf.serie_nota && (
                                      <p className="text-xs" style={{ color: theme.textMuted }}>Série {nf.serie_nota}</p>
                                    )}
                                  </div>
                                </td>
                                <td className="p-2">
                                  <p className="text-xs font-mono" style={{ color: theme.text }} title={nf.numero_pedido}>
                                    {nf.numero_pedido || "-"}
                                  </p>
                                </td>
                                <td className="p-2">
                                  {nf.data_vencimento ? (
                                    <div className="text-xs">
                                      <p className="font-semibold" style={{ color: notaVencida ? '#dc2626' : theme.text }}>
                                        {new Date(nf.data_vencimento).toLocaleDateString('pt-BR')}
                                      </p>
                                      {notaVencida && (
                                        <p className="text-[10px] text-red-600">⚠ VENCIDA</p>
                                      )}
                                    </div>
                                  ) : '-'}
                                </td>
                                <td className="p-2">
                                  <p className="truncate max-w-[120px] text-xs" style={{ color: theme.text }} title={nf.emitente_razao_social}>
                                    {nf.emitente_razao_social}
                                  </p>
                                </td>
                                <td className="p-2 text-center">
                                  <span style={{ color: volumesEditado ? '#dc2626' : theme.text }} className="font-semibold">
                                    {nf.quantidade_total_volumes_nf || 0}
                                  </span>
                                  {volumesEditado && (
                                    <p className="text-[10px] text-red-600">
                                      Orig: {nf.volumes_original_xml}
                                    </p>
                                  )}
                                </td>
                                <td className="p-2">
                                  <span style={{ color: pesoEditado ? '#dc2626' : theme.text }} className="font-semibold">
                                    {nf.peso_total_nf?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                  </span>
                                  {pesoEditado && (
                                    <p className="text-[10px] text-red-600">
                                      Orig: {nf.peso_original_xml?.toFixed(2)}
                                    </p>
                                  )}
                                </td>
                                <td className="p-2" style={{ color: theme.text }}>
                                  {nf.valor_nota_fiscal?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                </td>
                                <td className="p-2">
                                  <Button
                                    type="button"
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleInformarVolumes(index)}
                                    className="text-xs"
                                    style={{ 
                                      borderColor: temDimensoes ? '#16a34a' : '#f97316',
                                      color: temDimensoes ? '#16a34a' : '#f97316'
                                    }}
                                  >
                                    {temDimensoes ? '✓ Dimensões OK' : '⚠ Informar Dimensões'}
                                  </Button>
                                  {temDimensoes && (
                                    <p className="text-xs mt-1" style={{ color: '#16a34a' }}>
                                      Máx: {(() => {
                                        const volumes = nf.volumes || [];
                                        if (volumes.length === 0) return "N/A";
                                        const maxA = Math.max(...volumes.map(v => v.altura || 0));
                                        const maxL = Math.max(...volumes.map(v => v.largura || 0));
                                        const maxC = Math.max(...volumes.map(v => v.comprimento || 0));
                                        return `${maxA}x${maxL}x${maxC}m`;
                                      })()}
                                    </p>
                                  )}
                                </td>
                                <td className="p-2">
                                  <div className="flex gap-1">
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleEditarNota(index)}
                                      className="h-6 w-6 p-0"
                                      title="Editar"
                                    >
                                      <Edit className="w-3 h-3" />
                                    </Button>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleRemoverNota(index)}
                                      className="h-6 w-6 p-0"
                                      style={{ color: 'rgb(239, 68, 68)' }}
                                      title="Remover"
                                    >
                                      <X className="w-3 h-3" />
                                    </Button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                        <tfoot>
                          <tr style={{ backgroundColor: isDark ? '#1e293b' : '#f0fdf4', borderTop: '2px solid', borderColor: theme.cardBorder }}>
                            <td colSpan="3" className="p-3 font-semibold" style={{ color: theme.text }}>
                              <div className="text-sm">Total de Volumes</div>
                              <div className="text-lg text-blue-600 dark:text-blue-400">
                                {notasFiscais.reduce((sum, nf) => sum + (nf.quantidade_total_volumes_nf || 0), 0)}
                              </div>
                            </td>
                            <td className="p-3">
                              <div className="text-xs" style={{ color: theme.textMuted }}>Peso Total (kg)</div>
                              <div className="text-sm font-bold" style={{ color: theme.text }}>
                                {notasFiscais.reduce((sum, nf) => sum + (nf.peso_total_nf || 0), 0).toLocaleString('pt-BR', { minimumFractionDigits: 3 })}
                              </div>
                            </td>
                            <td colSpan="2" className="p-3">
                              <div className="text-xs" style={{ color: theme.textMuted }}>Valor Total (R$)</div>
                              <div className="text-sm font-bold text-green-600 dark:text-green-400">
                                R$ {notasFiscais.reduce((sum, nf) => sum + (nf.valor_nota_fiscal || 0), 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                              </div>
                            </td>
                            <td colSpan="2" className="p-3">
                              {(() => {
                                const todosVolumes = notasFiscais.flatMap(nf => nf.volumes || []);
                                const totalM3 = todosVolumes.reduce((sum, v) => sum + (v.m3 || 0), 0);
                                const temDimensoes = todosVolumes.length > 0;

                                if (!temDimensoes) {
                                  return (
                                    <div className="text-xs text-orange-600 dark:text-orange-400">
                                      ⚠ Dimensões não informadas
                                    </div>
                                  );
                                }

                                const maxAltura = Math.max(...todosVolumes.map(v => v.altura || 0));
                                const maxLargura = Math.max(...todosVolumes.map(v => v.largura || 0));
                                const maxComprimento = Math.max(...todosVolumes.map(v => v.comprimento || 0));

                                return (
                                  <div>
                                    <div className="text-xs" style={{ color: theme.textMuted }}>M³ Total</div>
                                    <div className="text-sm font-bold text-blue-600 dark:text-blue-400">
                                      {totalM3.toFixed(2)} m³
                                    </div>
                                    <div className="text-xs mt-1 text-green-600 dark:text-green-400">
                                      Maiores Dimensões: {maxAltura}x{maxLargura}x{maxComprimento}m
                                    </div>
                                  </div>
                                );
                              })()}
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>
                )}

                <div className="border rounded-lg p-3 sm:p-4 space-y-3" style={{ 
                  borderColor: !formData.numero_area || formData.numero_area.trim() === "" ? '#f97316' : theme.cardBorder,
                  backgroundColor: !formData.numero_area || formData.numero_area.trim() === "" ? (isDark ? '#431407' : '#fff7ed') : 'transparent'
                }}>
                  <div className="flex items-center gap-2">
                    <Tag className="w-4 h-4 text-blue-600" />
                    <Label className="text-sm sm:text-base font-semibold" style={{ color: theme.text }}>
                      Número da Área <span className="text-red-500">*</span>
                    </Label>
                  </div>
                  <div>
                    <Input
                      placeholder="Ex: 01, 02, A1, B3, etc."
                      value={formData.numero_area}
                      onChange={(e) => handleChange("numero_area", e.target.value.toUpperCase())}
                      className="w-full sm:w-48 h-9"
                      maxLength={5}
                      required
                      style={{ 
                        backgroundColor: theme.cardBg, 
                        borderColor: !formData.numero_area || formData.numero_area.trim() === "" ? '#f97316' : theme.cardBorder, 
                        color: theme.text 
                      }}
                    />
                    <p className="text-xs mt-1" style={{ 
                      color: !formData.numero_area || formData.numero_area.trim() === "" ? '#f97316' : theme.textMuted 
                    }}>
                      {!formData.numero_area || formData.numero_area.trim() === "" 
                        ? '⚠ Campo obrigatório - será impresso nas etiquetas'
                        : 'Este número será impresso nas etiquetas'
                      }
                    </p>
                  </div>
                </div>

                <div className="border rounded-lg p-3 sm:p-4 space-y-3" style={{ borderColor: theme.cardBorder }}>
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-blue-600" />
                    <Label className="text-sm sm:text-base font-semibold" style={{ color: theme.text }}>Observações</Label>
                  </div>
                  <Textarea
                    placeholder="Informações adicionais sobre o recebimento"
                    value={formData.observacao_carga}
                    onChange={(e) => handleChange("observacao_carga", e.target.value)}
                    rows={3}
                    style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder, color: theme.text }}
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-2 sm:pt-4 border-t" style={{ borderColor: theme.cardBorder }}>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowForm(false);
                      setEditandoRecebimento(null);
                      setNotasFiscais([]);
                      setFormData({ observacao_carga: "", numero_area: "" });
                    }}
                    className="flex-1 sm:flex-none"
                    style={{ borderColor: theme.cardBorder, color: theme.text }}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    disabled={saving || notasFiscais.length === 0}
                    className="bg-blue-600 hover:bg-blue-700 flex-1 sm:flex-none"
                  >
                    {saving ? "Salvando..." : editandoRecebimento ? "Atualizar Recebimento" : "Salvar Recebimento"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

            <Card style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b" style={{ borderColor: theme.cardBorder }}>
                        <th className="text-left px-2 py-1 text-xs font-semibold" style={{ color: theme.textMuted }}>Nº Receb.</th>
                        <th className="text-left px-2 py-1 text-xs font-semibold" style={{ color: theme.textMuted }}>Data/Horário</th>
                        <th className="text-left px-2 py-1 text-xs font-semibold" style={{ color: theme.textMuted }}>Fornecedor</th>
                        <th className="text-left px-2 py-1 text-xs font-semibold" style={{ color: theme.textMuted }}>Criado Por</th>
                        <th className="text-left px-2 py-1 text-xs font-semibold" style={{ color: theme.textMuted }}>Conferente</th>
                        <th className="text-left px-2 py-1 text-xs font-semibold" style={{ color: theme.textMuted }}>Qtd NFs</th>
                        <th className="text-left px-2 py-1 text-xs font-semibold" style={{ color: theme.textMuted }}>Peso</th>
                        <th className="text-left px-2 py-1 text-xs font-semibold" style={{ color: theme.textMuted }}>Vol.</th>
                        <th className="text-left px-2 py-1 text-xs font-semibold" style={{ color: theme.textMuted }}>Valor</th>
                        <th className="text-left px-2 py-1 text-xs font-semibold" style={{ color: theme.textMuted }}>Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(() => {
                        const inicio = (paginaAtualRecebimentos - 1) * limiteRecebimentos;
                        const fim = inicio + limiteRecebimentos;
                        const recebimentosExibidos = recebimentosFiltrados.slice(inicio, fim);

                        return recebimentosExibidos.map((rec) => (
                        <tr key={rec.id} className="border-b hover:bg-opacity-50" style={{ borderColor: theme.cardBorder }}>
                          <td className="px-2 py-1">
                            <span className="text-xs font-mono font-semibold text-blue-600">
                              {rec.numero_carga}
                            </span>
                          </td>
                          <td className="px-2 py-1">
                            <span className="text-xs whitespace-nowrap leading-tight" style={{ color: theme.text }}>
                              {rec.data_solicitacao ? (
                                <>
                                  {new Date(rec.data_solicitacao).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                                  {' '}
                                  <span style={{ color: theme.textMuted }}>
                                    {new Date(rec.data_solicitacao).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                  </span>
                                </>
                              ) : "-"}
                            </span>
                          </td>
                          <td className="px-2 py-1">
                            <span className="text-xs truncate block max-w-[150px]" style={{ color: theme.text }} title={rec.cliente}>
                              {rec.cliente}
                            </span>
                          </td>
                          <td className="px-2 py-1">
                            <span className="text-xs" style={{ color: theme.text }}>
                              {usuarios.find(u => u.id === rec.created_by)?.full_name?.split(' ')[0] || "-"}
                            </span>
                          </td>
                          <td className="px-2 py-1">
                            <span className="text-xs" style={{ color: theme.text }}>
                              {usuarios.find(u => u.id === rec.conferente_id)?.full_name?.split(' ')[0] || "-"}
                            </span>
                          </td>
                          <td className="px-2 py-1">
                            <span className="text-xs text-center font-semibold" style={{ color: theme.text }}>
                              {rec.notas_fiscais_ids?.length || 0}
                            </span>
                          </td>
                          <td className="px-2 py-1">
                            <span className="text-xs whitespace-nowrap" style={{ color: theme.text }}>
                              {rec.peso_total_consolidado?.toLocaleString()} kg
                            </span>
                          </td>
                          <td className="px-2 py-1">
                            <span className="text-xs" style={{ color: theme.text }}>
                              {rec.volumes_total_consolidado}
                            </span>
                          </td>
                          <td className="px-2 py-1">
                            <span className="text-xs whitespace-nowrap" style={{ color: theme.text }}>
                              R$ {rec.valor_total_consolidado?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </span>
                          </td>
                          <td className="px-2 py-1">
                            <div className="flex gap-1">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleEditarRecebimento(rec)}
                                className="h-6 w-6 p-0"
                                style={{ borderColor: theme.cardBorder, color: theme.text }}
                                title="Editar recebimento"
                                disabled={rec.status === "cancelado"}
                              >
                                <Edit className="w-3 h-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleImprimirEtiquetas(rec)}
                                className="h-6 w-6 p-0"
                                style={{ borderColor: theme.cardBorder, color: theme.text }}
                                title="Imprimir etiquetas"
                                disabled={rec.status === "cancelado"}
                              >
                                <Printer className="w-3 h-3" />
                              </Button>
                              {rec.status !== "cancelado" && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setRecebimentoParaCancelar(rec);
                                    setMotivoCancelamento("");
                                    setShowCancelModal(true);
                                  }}
                                  className="h-6 w-6 p-0"
                                  style={{ borderColor: '#dc2626', color: '#dc2626' }}
                                  title="Cancelar recebimento"
                                >
                                  <X className="w-3 h-3" />
                                </Button>
                              )}
                              {rec.status === "cancelado" && (
                                <Badge className="bg-red-600 text-white text-[10px] px-1.5 py-0">
                                  CANCELADO
                                </Badge>
                              )}
                            </div>
                          </td>
                        </tr>
                        ));
                      })()}
                    </tbody>
                  </table>
                  {recebimentos.length === 0 && (
                    <div className="text-center py-12" style={{ color: theme.textMuted }}>
                      <Package className="w-12 h-12 mx-auto mb-3 opacity-20" />
                      <p>Nenhum recebimento registrado ainda</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {showImpressaoOrdemModal && ordemParaImpressao && (
        <Dialog open={showImpressaoOrdemModal} onOpenChange={() => {
          setShowImpressaoOrdemModal(false);
          setOrdemParaImpressao(null);
          setNotasOrdemImpressao([]);
          setVolumesOrdemImpressao([]);
          loadUserAndRecebimentos();
        }}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto" style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}>
            <DialogHeader>
              <DialogTitle style={{ color: theme.text }}>
                Impressão de Etiquetas - {ordemParaImpressao.numero_carga}
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-3">
              <p className="text-sm" style={{ color: theme.textMuted }}>
                Selecione a nota fiscal para imprimir as etiquetas dos volumes:
              </p>
              
              {notasOrdemImpressao.map((nota) => {
                const volumesNota = volumesOrdemImpressao.filter(v => v.nota_fiscal_id === nota.id);
                const todosImpressos = volumesNota.length > 0 && volumesNota.every(v => v.etiquetas_impressas);
                
                return (
                  <div 
                    key={nota.id} 
                    className="border rounded-lg p-4 flex items-center justify-between" 
                    style={{ 
                      borderColor: todosImpressos ? '#10b981' : theme.cardBorder,
                      backgroundColor: todosImpressos ? (isDark ? '#064e3b' : '#d1fae5') : 'transparent'
                    }}
                  >
                    <div className="flex-1">
                      <p className="text-sm font-semibold flex items-center gap-2" style={{ color: theme.text }}>
                        NF-e {nota.numero_nota} {nota.serie_nota && `- Série ${nota.serie_nota}`}
                        {todosImpressos && (
                          <Badge className="bg-green-600 text-white text-[10px] px-1.5 py-0.5">
                            ✓ Impressas
                          </Badge>
                        )}
                      </p>
                      <p className="text-xs" style={{ color: theme.textMuted }}>
                        {nota.emitente_razao_social}
                      </p>
                      <p className="text-xs mt-1" style={{ color: theme.textMuted }}>
                        {volumesNota.length} volume(s) | {nota.peso_total_nf?.toLocaleString()} kg | R$ {nota.valor_nota_fiscal?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                    <Button
                      onClick={() => {
                        setRecebimentoSelecionado(ordemParaImpressao);
                        setNotasSelecionadas([nota]);
                        setVolumesSelecionados(volumesNota);
                        setShowEtiquetasModal(true);
                      }}
                      className={todosImpressos ? "bg-green-600 hover:bg-green-700" : "bg-blue-600 hover:bg-blue-700"}
                      size="sm"
                    >
                      <Tag className="w-4 h-4 mr-2" />
                      {todosImpressos ? 'Reimprimir' : 'Imprimir'} {volumesNota.length} etiqueta(s)
                    </Button>
                  </div>
                );
              })}
              
              <div className="flex justify-end gap-2 pt-4 border-t" style={{ borderColor: theme.cardBorder }}>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowImpressaoOrdemModal(false);
                    setOrdemParaImpressao(null);
                    setNotasOrdemImpressao([]);
                    setVolumesOrdemImpressao([]);
                    loadUserAndRecebimentos();
                  }}
                  style={{ borderColor: theme.cardBorder, color: theme.text }}
                >
                  Fechar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {showEtiquetasModal && notasSelecionadas.length > 0 && (
        <ImpressaoEtiquetas
          open={showEtiquetasModal}
          onClose={() => {
            setShowEtiquetasModal(false);
            setRecebimentoSelecionado(null);
            setNotasSelecionadas([]);
            setVolumesSelecionados([]);
          }}
          nota={notasSelecionadas[0]}
          volumes={volumesSelecionados}
          empresa={empresa}
        />
      )}

      {showColetaModal && coletaSelecionada && (
        <Dialog open={showColetaModal} onOpenChange={setShowColetaModal}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}>
            <DialogHeader>
              <DialogTitle style={{ color: theme.text }}>
                Detalhes da Coleta {coletaSelecionada.numero_coleta}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg border" style={{ borderColor: theme.cardBorder, backgroundColor: isDark ? '#1e293b' : '#f8fafc' }}>
                <div>
                  <p className="text-sm font-semibold" style={{ color: theme.text }}>Status da Coleta</p>
                  <p className="text-xs mt-1" style={{ color: theme.textMuted }}>
                    Solicitada em {coletaSelecionada.data_solicitacao ? new Date(coletaSelecionada.data_solicitacao).toLocaleDateString('pt-BR') : '-'}
                  </p>
                </div>
                <Badge className={`${statusColetaConfig[calcularStatusColeta(coletaSelecionada)]?.color} text-white`}>
                  {statusColetaConfig[calcularStatusColeta(coletaSelecionada)]?.label}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="border rounded-lg p-4" style={{ borderColor: theme.cardBorder }}>
                  <Label className="text-xs font-semibold mb-2 block" style={{ color: theme.textMuted }}>Remetente (Fornecedor)</Label>
                  <p className="text-sm font-semibold" style={{ color: theme.text }}>{coletaSelecionada.cliente}</p>
                  <p className="text-xs" style={{ color: theme.textMuted }}>{coletaSelecionada.cliente_cnpj}</p>
                  <p className="text-xs mt-2" style={{ color: theme.textMuted }}>
                    📍 {coletaSelecionada.origem_cidade} - {coletaSelecionada.origem_uf}
                  </p>
                </div>

                <div className="border rounded-lg p-4" style={{ borderColor: theme.cardBorder }}>
                  <Label className="text-xs font-semibold mb-2 block" style={{ color: theme.textMuted }}>Destinatário</Label>
                  <p className="text-sm font-semibold" style={{ color: theme.text }}>{coletaSelecionada.destinatario}</p>
                  <p className="text-xs" style={{ color: theme.textMuted }}>{coletaSelecionada.destinatario_cnpj}</p>
                  <p className="text-xs mt-2" style={{ color: theme.textMuted }}>
                    📍 {coletaSelecionada.destino_cidade} - {coletaSelecionada.destino_uf}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="border rounded-lg p-3" style={{ borderColor: theme.cardBorder }}>
                  <Label className="text-xs" style={{ color: theme.textMuted }}>Peso Total</Label>
                  <p className="text-lg font-bold" style={{ color: theme.text }}>
                    {coletaSelecionada.peso?.toLocaleString() || 0} kg
                  </p>
                </div>
                <div className="border rounded-lg p-3" style={{ borderColor: theme.cardBorder }}>
                  <Label className="text-xs" style={{ color: theme.textMuted }}>Valor Total</Label>
                  <p className="text-lg font-bold" style={{ color: theme.text }}>
                    R$ {coletaSelecionada.valor_nf?.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00'}
                  </p>
                </div>
                <div className="border rounded-lg p-3" style={{ borderColor: theme.cardBorder }}>
                  <Label className="text-xs" style={{ color: theme.textMuted }}>Volumes</Label>
                  <p className="text-lg font-bold" style={{ color: theme.text }}>
                    {coletaSelecionada.volumes || 0}
                  </p>
                </div>
              </div>

              {coletaSelecionada.produto && (
                <div className="border rounded-lg p-4" style={{ borderColor: theme.cardBorder }}>
                  <Label className="text-xs font-semibold mb-2 block" style={{ color: theme.textMuted }}>Produto</Label>
                  <p className="text-sm" style={{ color: theme.text }}>{coletaSelecionada.produto}</p>
                </div>
              )}

              {coletaSelecionada.observacao_carga && (
                <div className="border rounded-lg p-4" style={{ borderColor: theme.cardBorder }}>
                  <Label className="text-xs font-semibold mb-2 block" style={{ color: theme.textMuted }}>Observações</Label>
                  <p className="text-sm" style={{ color: theme.text }}>{coletaSelecionada.observacao_carga}</p>
                </div>
              )}

              {coletaSelecionada.notas_fiscais && (
                <div className="border rounded-lg p-4" style={{ borderColor: theme.cardBorder }}>
                  <Label className="text-xs font-semibold mb-2 block" style={{ color: theme.textMuted }}>Notas Fiscais</Label>
                  <p className="text-sm font-mono" style={{ color: theme.text }}>{coletaSelecionada.notas_fiscais}</p>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <Button
                  onClick={() => handleImportarColeta(coletaSelecionada)}
                  className="bg-green-600 hover:bg-green-700 flex-1"
                >
                  <Package className="w-4 h-4 mr-2" />
                  Importar Notas Fiscais desta Coleta
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowColetaModal(false);
                    setColetaSelecionada(null);
                  }}
                  style={{ borderColor: theme.cardBorder, color: theme.text }}
                >
                  Fechar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {showScanner && (
        <Dialog open={showScanner} onOpenChange={setShowScanner}>
          <DialogContent className="max-w-md" style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}>
            <DialogHeader>
              <DialogTitle style={{ color: theme.text }}>Scanner de Código de Barras</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="bg-gray-900 rounded-lg aspect-video flex items-center justify-center relative overflow-hidden">
                <video 
                  id="scanner-video-recebimento" 
                  autoPlay 
                  playsInline
                  className="w-full h-full object-cover"
                  ref={(video) => {
                    if (video && showScanner) {
                      navigator.mediaDevices.getUserMedia({ 
                        video: { facingMode: 'environment' } 
                      })
                      .then(stream => {
                        video.srcObject = stream;
                      })
                      .catch(err => {
                        console.error("Erro ao acessar câmera:", err);
                        toast.error("Não foi possível acessar a câmera");
                        setShowScanner(false);
                      });
                    }
                  }}
                />
                <div className="absolute inset-0 border-2 border-purple-500 m-8 rounded-lg pointer-events-none"></div>
              </div>
              <div className="text-center">
                <p className="text-sm mb-4" style={{ color: theme.textMuted }}>
                  Posicione o código de barras da NF-e dentro da área marcada
                </p>
                <Input
                  placeholder="Ou cole a chave aqui"
                  value={chaveAcesso}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '').slice(0, 44);
                    setChaveAcesso(value);
                    if (value.length === 44) {
                      handleBuscarPorChave(value);
                      setShowScanner(false);
                      const video = document.getElementById('scanner-video-recebimento');
                      if (video && video.srcObject) {
                        video.srcObject.getTracks().forEach(track => track.stop());
                      }
                    }
                  }}
                  className="font-mono"
                  autoFocus
                  style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder, color: theme.text }}
                />
              </div>
              <Button
                onClick={() => {
                  setShowScanner(false);
                  const video = document.getElementById('scanner-video-recebimento');
                  if (video && video.srcObject) {
                    video.srcObject.getTracks().forEach(track => track.stop());
                  }
                }}
                variant="outline"
                className="w-full"
                style={{ borderColor: theme.cardBorder, color: theme.text }}
              >
                Cancelar
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {showNotaForm && (
        <NotaFiscalForm
          open={showNotaForm}
          onClose={() => {
            setShowNotaForm(false);
            setNotaParaEditar(null);
          }}
          nota={notaParaEditar}
          onSave={handleSalvarNota}
          isDark={isDark}
          showCubagem={false}
        />
      )}

      {showVolumesModal && (
        <VolumesModal
          open={showVolumesModal}
          onClose={() => {
            setShowVolumesModal(false);
            setNotaParaVolumes(null);
          }}
          nota={notaParaVolumes}
          onSave={handleSalvarVolumes}
          isDark={isDark}
        />
      )}

      {showCancelModal && recebimentoParaCancelar && (
        <Dialog open={showCancelModal} onOpenChange={setShowCancelModal}>
          <DialogContent className="max-w-md" style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}>
            <DialogHeader>
              <DialogTitle style={{ color: theme.text }}>
                Cancelar Recebimento {recebimentoParaCancelar.numero_carga}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div className="bg-red-600 p-4 rounded-lg border-2 border-red-700">
                <p className="text-sm font-semibold text-white">
                  ⚠️ Esta ação irá cancelar o recebimento e marcar todas as {recebimentoParaCancelar.notas_fiscais_ids?.length || 0} nota(s) fiscal(is) associada(s) como canceladas.
                </p>
              </div>

              <div>
                <Label className="text-sm font-semibold mb-2 block" style={{ color: theme.text }}>
                  Motivo do Cancelamento <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  placeholder="Descreva o motivo do cancelamento..."
                  value={motivoCancelamento}
                  onChange={(e) => setMotivoCancelamento(e.target.value)}
                  rows={4}
                  className="w-full"
                  style={{ backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.text }}
                  autoFocus
                />
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowCancelModal(false);
                    setRecebimentoParaCancelar(null);
                    setMotivoCancelamento("");
                  }}
                  className="flex-1"
                  style={{ borderColor: theme.cardBorder, color: theme.text }}
                >
                  Voltar
                </Button>
                <Button
                  onClick={handleCancelarRecebimento}
                  disabled={saving || !motivoCancelamento.trim()}
                  className="bg-red-600 hover:bg-red-700 text-white flex-1"
                >
                  {saving ? "Cancelando..." : "Confirmar Cancelamento"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}