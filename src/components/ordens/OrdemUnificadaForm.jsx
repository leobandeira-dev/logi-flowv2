// Componente Unificado de Formulário de Ordens
// Usado para: Coleta, Carregamento, Recebimento, Entrega
// Campos adaptam-se de acordo com o tipo de ordem

import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { 
  Save, X, CheckCircle, Truck, RefreshCw, AlertCircle, Plus, FileUp, 
  CheckCircle2, Loader2, Edit, Zap, Package, Upload, Search,
  Check, ChevronsUpDown
} from "lucide-react";
import { toast } from "sonner";

import MotoristaForm from "../motoristas/MotoristaForm";
import VeiculoForm from "../veiculos/VeiculoForm";
import OperacaoForm from "../operacoes/OperacaoForm";
import NotaFiscalForm from "../notas-fiscais/NotaFiscalForm";
import VolumesModal from "../notas-fiscais/VolumesModal";

const frotaOptions = [
  { value: "própria", label: "Própria" },
  { value: "terceirizada", label: "Terceirizada" },
  { value: "agregado", label: "Agregado" },
  { value: "acionista", label: "Acionista" }
];

const tipoOperacaoOptions = [
  { value: "FOB", label: "FOB (Frete por conta do destinatário)" },
  { value: "CIF", label: "CIF (Frete por conta do remetente)" }
];

const modalidadeCargaOptions = [
  { value: "normal", label: "Normal" },
  { value: "prioridade", label: "Prioridade" },
  { value: "expressa", label: "Expressa" }
];

const tipoVeiculoOptions = [
  { value: "RODOTREM", label: "RODOTREM" },
  { value: "TRUCK", label: "TRUCK" },
  { value: "CARRETA 5EIXOS", label: "CARRETA 5EIXOS" },
  { value: "CARRETA 6EIXOS", label: "CARRETA 6EIXOS" },
  { value: "CARRETA 7EIXOS", label: "CARRETA 7EIXOS" },
  { value: "BITREM", label: "BITREM" },
  { value: "CARRETA LOC", label: "CARRETA LOC" },
  { value: "PRANCHA", label: "PRANCHA" },
  { value: "BI-TRUCK", label: "BI-TRUCK" },
  { value: "FIORINO", label: "FIORINO" }
];

const tipoCarroceriaOptions = [
  { value: "SIDER", label: "SIDER" },
  { value: "PRANCHA", label: "PRANCHA" },
  { value: "GRADE BAIXA", label: "GRADE BAIXA" },
  { value: "GRADE ALTA", label: "GRADE ALTA" },
  { value: "BAU", label: "BAU" },
  { value: "EXTENSIVA", label: "EXTENSIVA" },
  { value: "CARRETA LOC", label: "CARRETA LOC" }
];

export default function OrdemUnificadaForm({
  tipo_ordem, // 'coleta', 'carregamento', 'recebimento', 'entrega'
  open,
  onClose,
  onSubmit,
  editingOrdem,
  motoristas = [],
  veiculos = [],
  user,
  operadorLogistico, // Apenas para coletas
  isDark
}) {
  const [formData, setFormData] = useState({});
  const [notasFiscais, setNotasFiscais] = useState([]);
  const [chaveAcesso, setChaveAcesso] = useState("");
  const [buscandoNF, setBuscandoNF] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("basicos");
  const [valorTotal, setValorTotal] = useState(0);
  
  // Estados para motorista e veículos
  const [openMotoristaCombo, setOpenMotoristaCombo] = useState(false);
  const [motoristaSearchTerm, setMotoristaSearchTerm] = useState("");
  const [motoristaTelefone, setMotoristaTelefone] = useState("");
  const [editandoTelefone, setEditandoTelefone] = useState(false);
  const [salvandoTelefone, setSalvandoTelefone] = useState(false);
  const [showMotoristaForm, setShowMotoristaForm] = useState(false);
  const [nomeParaCadastro, setNomeParaCadastro] = useState("");
  const [motoristaBusca, setMotoristaBusca] = useState("");
  
  // Estados para motorista reserva
  const [openMotoristaReservaCombo, setOpenMotoristaReservaCombo] = useState(false);
  const [motoristaReservaBusca, setMotoristaReservaBusca] = useState("");
  
  const [openVeiculoCombo, setOpenVeiculoCombo] = useState({
    cavalo: false, implemento1: false, implemento2: false, implemento3: false
  });
  const [veiculoSearchTerm, setVeiculoSearchTerm] = useState({
    cavalo: "", implemento1: "", implemento2: "", implemento3: ""
  });
  const [showVeiculoForm, setShowVeiculoForm] = useState(false);
  const [tipoVeiculoCadastro, setTipoVeiculoCadastro] = useState(null);
  const [placaParaCadastro, setPlacaParaCadastro] = useState("");
  const [cavaloBusca, setCavaloBusca] = useState("");
  const [implemento1Busca, setImplemento1Busca] = useState("");
  const [implemento2Busca, setImplemento2Busca] = useState("");
  const [implemento3Busca, setImplemento3Busca] = useState("");
  
  const [itemsEncontrados, setItemsEncontrados] = useState({
    motorista: null, cavalo: null, implemento1: null, implemento2: null, implemento3: null, operacao: null
  });
  const [motoristaVeiculos, setMotoristaVeiculos] = useState({ cavalo: null, implementos: [] });
  const [veiculosAlterados, setVeiculosAlterados] = useState(false);
  const [atualizandoFicha, setAtualizandoFicha] = useState(false);
  
  // Operações
  const [operacoes, setOperacoes] = useState([]);
  const [openOperacaoCombo, setOpenOperacaoCombo] = useState(false);
  const [operacaoSearchTerm, setOperacaoSearchTerm] = useState("");
  const [showOperacaoForm, setShowOperacaoForm] = useState(false);
  
  // Import PDF
  const [importando, setImportando] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [importError, setImportError] = useState(null);
  const [importSuccess, setImportSuccess] = useState(false);
  const pdfInputRef = React.useRef(null);
  
  // Validação
  const [showValidation, setShowValidation] = useState(false);
  
  // Modais de Notas Fiscais
  const [showNotaForm, setShowNotaForm] = useState(false);
  const [notaParaEditar, setNotaParaEditar] = useState(null);
  const [showVolumesModal, setShowVolumesModal] = useState(false);
  const [notaParaVolumes, setNotaParaVolumes] = useState(null);
  const [showScanner, setShowScanner] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const videoRef = React.useRef(null);
  const cameraFileInputRef = React.useRef(null);
  const [processandoImagem, setProcessandoImagem] = useState(false);
  
  // Busca de Notas Fiscais Cadastradas
  const [showBuscarNF, setShowBuscarNF] = useState(false);
  const [notasCadastradas, setNotasCadastradas] = useState([]);
  const [loadingNotasCadastradas, setLoadingNotasCadastradas] = useState(false);
  const [buscaNFTerm, setBuscaNFTerm] = useState("");

  // Determinar quais campos são obrigatórios e visíveis de acordo com o tipo
  const camposObrigatorios = {
    coleta: ['destinatario', 'destinatario_cnpj'], // Para coletas: apenas destinatário obrigatório
    carregamento: ['cliente', 'origem', 'destino', 'produto', 'peso', 'motorista_id', 'operacao_id'],
    recebimento: ['origem', 'destinatario'],
    entrega: ['cliente', 'origem', 'destino', 'produto', 'peso', 'motorista_id']
  };

  const camposVisiveis = {
    coleta: ['notas_fiscais', 'remetente', 'destinatario', 'observacoes'], // Sem operação, motorista, veículos
    carregamento: ['operacao', 'motorista', 'veiculos', 'remetente', 'destinatario', 'carga_completa', 'notas_fiscais', 'observacoes'],
    recebimento: ['remetente', 'destinatario', 'notas_fiscais', 'observacoes'],
    entrega: ['motorista', 'veiculos', 'remetente', 'destinatario', 'carga_completa', 'notas_fiscais', 'observacoes']
  };

  const usarAbas = false; // Usar layout sem abas para todos os tipos

  useEffect(() => {
    const loadOperacoes = async () => {
      try {
        const operacoesData = await base44.entities.Operacao.list();
        setOperacoes(operacoesData.filter(op => op.ativo));
      } catch (error) {
        console.error("Erro ao carregar operações:", error);
      }
    };
    if (tipo_ordem !== 'coleta') {
      loadOperacoes();
    }
  }, [tipo_ordem]);

  useEffect(() => {
    const carregarDadosEdicao = async () => {
      if (editingOrdem) {
        setFormData(editingOrdem);
        
        const motorista = motoristas.find(m => m.id === editingOrdem.motorista_id);
        const cavalo = veiculos.find(v => v.id === editingOrdem.cavalo_id);
        const impl1 = veiculos.find(v => v.id === editingOrdem.implemento1_id);
        const impl2 = veiculos.find(v => v.id === editingOrdem.implemento2_id);
        const impl3 = veiculos.find(v => v.id === editingOrdem.implemento3_id);
        const operacao = operacoes.find(op => op.id === editingOrdem.operacao_id);
        
        setMotoristaSearchTerm(motorista?.nome || "");
        
        // Recarregar motorista da base para garantir telefone atualizado
        if (motorista?.id) {
          try {
            const motoristaAtualizado = await base44.entities.Motorista.get(motorista.id);
            setMotoristaTelefone(motoristaAtualizado.celular || "");
          } catch (error) {
            console.log("Usando telefone do cache:", error);
            setMotoristaTelefone(motorista?.celular || "");
          }
        } else {
          setMotoristaTelefone("");
        }
        setVeiculoSearchTerm({
          cavalo: cavalo?.placa || "", implemento1: impl1?.placa || "",
          implemento2: impl2?.placa || "", implemento3: impl3?.placa || ""
        });
        setOperacaoSearchTerm(operacao?.nome || "");
        setItemsEncontrados({
          motorista: motorista || null, cavalo: cavalo || null,
          implemento1: impl1 || null, implemento2: impl2 || null, 
          implemento3: impl3 || null, operacao: operacao || null
        });

        // Carregar notas fiscais vinculadas
        if (editingOrdem.notas_fiscais_ids && editingOrdem.notas_fiscais_ids.length > 0) {
          try {
            const todasNotas = await base44.entities.NotaFiscal.list();
            const notasVinculadas = todasNotas.filter(nota => 
              editingOrdem.notas_fiscais_ids.includes(nota.id)
            );

            // Converter notas para o formato do formulário
            const notasFormatadas = notasVinculadas.map(nota => ({
              numero_nota: nota.numero_nota,
              serie_nota: nota.serie_nota,
              chave_nota_fiscal: nota.chave_nota_fiscal,
              data_emissao_nf: nota.data_hora_emissao,
              natureza_operacao: nota.natureza_operacao,
              emitente_razao_social: nota.emitente_razao_social,
              emitente_cnpj: nota.emitente_cnpj,
              emitente_telefone: nota.emitente_telefone,
              emitente_uf: nota.emitente_uf,
              emitente_cidade: nota.emitente_cidade,
              emitente_bairro: nota.emitente_bairro,
              emitente_endereco: nota.emitente_endereco,
              emitente_numero: nota.emitente_numero,
              emitente_cep: nota.emitente_cep,
              destinatario_razao_social: nota.destinatario_razao_social,
              destinatario_cnpj: nota.destinatario_cnpj,
              destinatario_telefone: nota.destinatario_telefone,
              destino_cidade: nota.destinatario_cidade,
              destino_uf: nota.destinatario_uf,
              destino_endereco: nota.destinatario_endereco,
              destino_numero: nota.destinatario_numero,
              destino_bairro: nota.destinatario_bairro,
              destino_cep: nota.destinatario_cep,
              peso_nf: nota.peso_total_nf,
              valor_nf: nota.valor_nota_fiscal,
              volumes_nf: nota.quantidade_total_volumes_nf,
              xml_content: nota.xml_content,
              volumes: nota.volumes || [],
              nota_id_existente: nota.id
            }));

            setNotasFiscais(notasFormatadas);
          } catch (error) {
            console.error("Erro ao carregar notas fiscais vinculadas:", error);
          }
        } else {
          setNotasFiscais([]);
        }
      } else {
        // Inicializar form vazio
        setFormData({
          tipo_ordem: tipo_ordem,
          tipo_operacao: "FOB",
          modalidade_carga: "normal",
          frota: "própria",
          qtd_entregas: 1,
          mostrar_motorista_reserva: true
        });
        setNotasFiscais([]);
      }
      setActiveTab("basicos");
    };

    carregarDadosEdicao();
  }, [editingOrdem, open, tipo_ordem]);

  // Calcular valor total do frete
  useEffect(() => {
    const peso = parseFloat(formData.peso);
    const valorTonelada = parseFloat(formData.valor_tonelada);
    const freteViagem = parseFloat(formData.frete_viagem);

    if (freteViagem > 0) {
      setValorTotal(freteViagem);
    } else if (peso > 0 && valorTonelada > 0) {
      setValorTotal((peso / 1000) * valorTonelada);
    } else {
      setValorTotal(0);
    }
  }, [formData.peso, formData.valor_tonelada, formData.frete_viagem]);

  // Buscar e preencher veículos do motorista quando selecionado
  useEffect(() => {
    if (formData.motorista_id && motoristas.length > 0 && veiculos.length > 0) {
      const motorista = motoristas.find(m => m.id === formData.motorista_id);
      if (motorista) {
        const cavalo = veiculos.find(v => v.id === motorista.cavalo_id);
        const implementos = [
          veiculos.find(v => v.id === motorista.implemento1_id),
          veiculos.find(v => v.id === motorista.implemento2_id),
          veiculos.find(v => v.id === motorista.implemento3_id)
        ].filter(Boolean);
        setMotoristaVeiculos({ cavalo: cavalo || null, implementos: implementos });
        
        // Preencher automaticamente os campos de veículos se ainda não estiverem preenchidos
        if (!formData.cavalo_id && motorista.cavalo_id) {
          handleChange("cavalo_id", motorista.cavalo_id);
          setCavaloBusca("");
        }
        if (!formData.implemento1_id && motorista.implemento1_id) {
          handleChange("implemento1_id", motorista.implemento1_id);
          setImplemento1Busca("");
        }
        if (!formData.implemento2_id && motorista.implemento2_id) {
          handleChange("implemento2_id", motorista.implemento2_id);
          setImplemento2Busca("");
        }
        if (!formData.implemento3_id && motorista.implemento3_id) {
          handleChange("implemento3_id", motorista.implemento3_id);
          setImplemento3Busca("");
        }
      }
    }
  }, [formData.motorista_id, motoristas, veiculos]);

  // Detectar se veículos foram alterados
  useEffect(() => {
    if (!formData.motorista_id) {
      setVeiculosAlterados(false);
      return;
    }

    const motorista = motoristas.find(m => m.id === formData.motorista_id);
    if (!motorista) {
      setVeiculosAlterados(false);
      return;
    }

    const alterado =
      (formData.cavalo_id || null) !== (motorista.cavalo_id || null) ||
      (formData.implemento1_id || null) !== (motorista.implemento1_id || null) ||
      (formData.implemento2_id || null) !== (motorista.implemento2_id || null) ||
      (formData.implemento3_id || null) !== (motorista.implemento3_id || null);

    setVeiculosAlterados(alterado);
  }, [formData.motorista_id, formData.cavalo_id, formData.implemento1_id, formData.implemento2_id, formData.implemento3_id, motoristas]);

  // Handler para captura de imagem da câmera
  const handleCapturarImagem = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setProcessandoImagem(true);
    try {
      // Upload da imagem
      const { file_url } = await base44.integrations.Core.UploadFile({ file });

      // Extrair código de barras da imagem usando LLM
      const resultado = await base44.integrations.Core.InvokeLLM({
        prompt: `Analise esta imagem e extraia APENAS o código de barras ou chave de acesso da NF-e (44 dígitos numéricos).
        
Retorne SOMENTE os 44 dígitos, sem espaços, hífens ou outros caracteres.

Se não encontrar nenhum código de barras válido de 44 dígitos, retorne "null".`,
        file_urls: [file_url],
        response_json_schema: {
          type: "object",
          properties: {
            chave_acesso: { type: "string" }
          }
        }
      });

      const chave = resultado?.chave_acesso?.replace(/\D/g, '');
      
      if (chave && chave.length === 44) {
        setChaveAcesso(chave);
        await handleBuscarPorChave(chave);
        setShowScanner(false);
        toast.success("Código lido com sucesso!");
      } else {
        toast.error("Não foi possível identificar um código de barras válido na imagem.");
      }
    } catch (error) {
      console.error("Erro ao processar imagem:", error);
      toast.error("Erro ao processar a imagem. Tente novamente.");
    } finally {
      setProcessandoImagem(false);
      if (event.target) event.target.value = '';
    }
  };

  // Buscar notas fiscais cadastradas
  const handleBuscarNotasCadastradas = async () => {
    setLoadingNotasCadastradas(true);
    try {
      const todasNotas = await base44.entities.NotaFiscal.list("-created_date", 500);
      setNotasCadastradas(todasNotas);
    } catch (error) {
      console.error("Erro ao buscar notas cadastradas:", error);
      toast.error("Erro ao carregar notas fiscais");
    } finally {
      setLoadingNotasCadastradas(false);
    }
  };

  const handleSelecionarNotaCadastrada = (nota) => {
    // Converter nota da base para o formato esperado
    const notaFormatada = {
      numero_nota: nota.numero_nota,
      serie_nota: nota.serie_nota,
      chave_nota_fiscal: nota.chave_nota_fiscal,
      data_emissao_nf: nota.data_hora_emissao,
      natureza_operacao: nota.natureza_operacao,
      emitente_razao_social: nota.emitente_razao_social,
      emitente_cnpj: nota.emitente_cnpj,
      emitente_telefone: nota.emitente_telefone,
      emitente_uf: nota.emitente_uf,
      emitente_cidade: nota.emitente_cidade,
      emitente_bairro: nota.emitente_bairro,
      emitente_endereco: nota.emitente_endereco,
      emitente_numero: nota.emitente_numero,
      emitente_cep: nota.emitente_cep,
      destinatario_razao_social: nota.destinatario_razao_social,
      destinatario_cnpj: nota.destinatario_cnpj,
      destinatario_telefone: nota.destinatario_telefone,
      destino_cidade: nota.destinatario_cidade,
      destino_uf: nota.destinatario_uf,
      destino_endereco: nota.destinatario_endereco,
      destino_numero: nota.destinatario_numero,
      destino_bairro: nota.destinatario_bairro,
      destino_cep: nota.destinatario_cep,
      peso_nf: nota.peso_total_nf,
      valor_nf: nota.valor_nota_fiscal,
      volumes_nf: nota.quantidade_total_volumes_nf,
      xml_content: nota.xml_content,
      volumes: nota.volumes || [],
      nota_id_existente: nota.id // Guardar ID para vincular depois
    };

    // Preencher form se primeira nota
    if (notasFiscais.length === 0) {
      setFormData(prev => ({
        ...prev,
        remetente_razao_social: notaFormatada.emitente_razao_social,
        remetente_cnpj: notaFormatada.emitente_cnpj,
        remetente_telefone: notaFormatada.emitente_telefone,
        remetente_uf: notaFormatada.emitente_uf,
        remetente_cidade: notaFormatada.emitente_cidade,
        remetente_bairro: notaFormatada.emitente_bairro,
        remetente_endereco: notaFormatada.emitente_endereco,
        remetente_numero: notaFormatada.emitente_numero,
        remetente_cep: notaFormatada.emitente_cep,
        cliente: prev.cliente || notaFormatada.emitente_razao_social,
        cliente_cnpj: prev.cliente_cnpj || notaFormatada.emitente_cnpj,
        origem: prev.origem || notaFormatada.emitente_cidade,
        origem_cidade: prev.origem_cidade || notaFormatada.emitente_cidade,
        origem_uf: prev.origem_uf || notaFormatada.emitente_uf,
        origem_endereco: prev.origem_endereco || notaFormatada.emitente_endereco,
        origem_cep: prev.origem_cep || notaFormatada.emitente_cep,
        origem_bairro: prev.origem_bairro || notaFormatada.emitente_bairro,
        destinatario: notaFormatada.destinatario_razao_social,
        destinatario_cnpj: notaFormatada.destinatario_cnpj,
        destinatario_telefone: notaFormatada.destinatario_telefone,
        destino: prev.destino || notaFormatada.destino_cidade,
        destino_cidade: notaFormatada.destino_cidade,
        destino_uf: notaFormatada.destino_uf,
        destino_endereco: notaFormatada.destino_endereco,
        destino_cep: notaFormatada.destino_cep,
        destino_bairro: notaFormatada.destino_bairro,
        destino_numero: notaFormatada.destino_numero,
      }));
    }

    setNotasFiscais(prev => [...prev, notaFormatada]);
    toast.success(`NF-e ${notaFormatada.numero_nota} adicionada!`);
  };

  // Abrir modal e carregar notas quando necessário
  useEffect(() => {
    if (showBuscarNF && notasCadastradas.length === 0) {
      handleBuscarNotasCadastradas();
    }
  }, [showBuscarNF]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // ======= FUNÇÕES DE IMPORTAÇÃO DE NOTAS FISCAIS =======
  
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

    const emitNome = parseXmlValue(xmlDoc, "emit/xNome") || parseXmlValue(xmlDoc, "xNome");
    const emitCnpj = parseXmlValue(xmlDoc, "emit/CNPJ") || parseXmlValue(xmlDoc, "CNPJ");
    const emitFone = parseXmlValue(xmlDoc, "emit/enderEmit/fone") || parseXmlValue(xmlDoc, "fone");
    const emitUf = parseXmlValue(xmlDoc, "emit/enderEmit/UF") || parseXmlValue(xmlDoc, "enderEmit/UF");
    const emitCidade = parseXmlValue(xmlDoc, "emit/enderEmit/xMun") || parseXmlValue(xmlDoc, "enderEmit/xMun");
    const emitBairro = parseXmlValue(xmlDoc, "emit/enderEmit/xBairro") || parseXmlValue(xmlDoc, "enderEmit/xBairro");
    const emitLogr = parseXmlValue(xmlDoc, "emit/enderEmit/xLgr") || parseXmlValue(xmlDoc, "enderEmit/xLgr");
    const emitNro = parseXmlValue(xmlDoc, "emit/enderEmit/nro") || parseXmlValue(xmlDoc, "enderEmit/nro");
    const emitCep = parseXmlValue(xmlDoc, "emit/enderEmit/CEP") || parseXmlValue(xmlDoc, "enderEmit/CEP");

    const destNome = parseXmlValue(xmlDoc, "dest/xNome") || parseXmlValue(xmlDoc, "xNome");
    const destCnpj = parseXmlValue(xmlDoc, "dest/CNPJ") || parseXmlValue(xmlDoc, "CNPJ");
    const destFone = parseXmlValue(xmlDoc, "dest/enderDest/fone") || parseXmlValue(xmlDoc, "fone");
    const destCidade = parseXmlValue(xmlDoc, "dest/enderDest/xMun") || parseXmlValue(xmlDoc, "xMun");
    const destUf = parseXmlValue(xmlDoc, "dest/enderDest/UF") || parseXmlValue(xmlDoc, "UF");
    const destLogr = parseXmlValue(xmlDoc, "dest/enderDest/xLgr") || parseXmlValue(xmlDoc, "xLgr");
    const destNro = parseXmlValue(xmlDoc, "dest/enderDest/nro") || parseXmlValue(xmlDoc, "nro");
    const destBairro = parseXmlValue(xmlDoc, "dest/enderDest/xBairro") || parseXmlValue(xmlDoc, "xBairro");
    const destCep = parseXmlValue(xmlDoc, "dest/enderDest/CEP") || parseXmlValue(xmlDoc, "CEP");

    const prodNome = parseXmlValue(xmlDoc, "xProd");
    const pesoBruto = parseXmlValue(xmlDoc, "pesoB");
    const valorNF = parseXmlValue(xmlDoc, "vNF");
    const qtdVol = parseXmlValue(xmlDoc, "qVol");
    const especie = parseXmlValue(xmlDoc, "esp");
    const xPed = parseXmlValue(xmlDoc, "xPed");

    return {
      numero_nota: numeroNota || "",
      serie_nota: serieNota || "",
      data_emissao_nf: dataEmissao || "",
      natureza_operacao: natOp || "",
      chave_nota_fiscal: chaveAcesso,
      emitente_razao_social: emitNome || "",
      emitente_cnpj: emitCnpj || "",
      emitente_telefone: emitFone || "",
      emitente_uf: emitUf || "",
      emitente_cidade: emitCidade || "",
      emitente_bairro: emitBairro || "",
      emitente_endereco: emitLogr || "",
      emitente_numero: emitNro || "",
      emitente_cep: emitCep || "",
      destinatario_razao_social: destNome || "",
      destinatario_cnpj: destCnpj || "",
      destinatario_telefone: destFone || "",
      destino_cidade: destCidade || "",
      destino_uf: destUf || "",
      destino_endereco: destLogr || "",
      destino_numero: destNro || "",
      destino_bairro: destBairro || "",
      destino_cep: destCep || "",
      produto: prodNome || "",
      peso_nf: pesoBruto ? parseFloat(pesoBruto) : null,
      valor_nf: valorNF ? parseFloat(valorNF) : null,
      volumes_nf: qtdVol ? parseInt(qtdVol) : null,
      tipo_embalagem: especie || "",
      viagem: xPed || "",
      pedido_cliente: xPed || "",
      xml_content: xmlString
    };
  };

  const handleBuscarPorChave = async (chave) => {
    if (!chave || chave.length !== 44) return;

    setBuscandoNF(true);
    try {
      const response = await base44.functions.invoke('buscarNotaFiscalMeuDanfe', {
        chaveAcesso: chave
      });

      if (response.data?.error) {
        toast.error(response.data.error);
        setChaveAcesso("");
        return;
      }

      if (response.data?.xml) {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(response.data.xml, "text/xml");

        const parseError = xmlDoc.querySelector("parsererror");
        if (parseError) {
          toast.error("Erro ao processar o XML retornado.");
          setChaveAcesso("");
          return;
        }

        const dadosNF = extrairDadosXML(xmlDoc, response.data.xml);
        
        // Preencher form se primeira nota
        if (notasFiscais.length === 0) {
          setFormData(prev => ({
            ...prev,
            remetente_razao_social: dadosNF.emitente_razao_social,
            remetente_cnpj: dadosNF.emitente_cnpj,
            remetente_telefone: dadosNF.emitente_telefone,
            remetente_uf: dadosNF.emitente_uf,
            remetente_cidade: dadosNF.emitente_cidade,
            remetente_bairro: dadosNF.emitente_bairro,
            remetente_endereco: dadosNF.emitente_endereco,
            remetente_numero: dadosNF.emitente_numero,
            remetente_cep: dadosNF.emitente_cep,
            cliente: prev.cliente || dadosNF.emitente_razao_social,
            cliente_cnpj: prev.cliente_cnpj || dadosNF.emitente_cnpj,
            origem: prev.origem || dadosNF.emitente_cidade,
            origem_cidade: prev.origem_cidade || dadosNF.emitente_cidade,
            origem_uf: prev.origem_uf || dadosNF.emitente_uf,
            origem_endereco: prev.origem_endereco || dadosNF.emitente_endereco,
            origem_cep: prev.origem_cep || dadosNF.emitente_cep,
            origem_bairro: prev.origem_bairro || dadosNF.emitente_bairro,
            destinatario: dadosNF.destinatario_razao_social,
            destinatario_cnpj: dadosNF.destinatario_cnpj,
            destinatario_telefone: dadosNF.destinatario_telefone,
            destino: prev.destino || dadosNF.destino_cidade,
            destino_cidade: dadosNF.destino_cidade,
            destino_uf: dadosNF.destino_uf,
            destino_endereco: dadosNF.destino_endereco,
            destino_cep: dadosNF.destino_cep,
            destino_bairro: dadosNF.destino_bairro,
            destino_numero: dadosNF.destino_numero,
          }));
        }

        setNotasFiscais(prev => [...prev, dadosNF]);
        setChaveAcesso("");
        toast.success(`NF-e ${dadosNF.numero_nota} adicionada!`);
      }
    } catch (error) {
      toast.error(error?.response?.data?.error || error?.message || "Erro ao buscar nota fiscal");
      setChaveAcesso("");
    } finally {
      setBuscandoNF(false);
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
              
              if (notasFiscais.length === 0) {
                setFormData(prev => ({
                  ...prev,
                  remetente_razao_social: dadosNF.emitente_razao_social,
                  remetente_cnpj: dadosNF.emitente_cnpj,
                  remetente_telefone: dadosNF.emitente_telefone,
                  remetente_uf: dadosNF.emitente_uf,
                  remetente_cidade: dadosNF.emitente_cidade,
                  remetente_bairro: dadosNF.emitente_bairro,
                  remetente_endereco: dadosNF.emitente_endereco,
                  remetente_numero: dadosNF.emitente_numero,
                  remetente_cep: dadosNF.emitente_cep,
                  cliente: prev.cliente || dadosNF.emitente_razao_social,
                  cliente_cnpj: prev.cliente_cnpj || dadosNF.emitente_cnpj,
                  origem: prev.origem || dadosNF.emitente_cidade,
                  origem_cidade: prev.origem_cidade || dadosNF.emitente_cidade,
                  origem_uf: prev.origem_uf || dadosNF.emitente_uf,
                  origem_endereco: prev.origem_endereco || dadosNF.emitente_endereco,
                  origem_cep: prev.origem_cep || dadosNF.emitente_cep,
                  origem_bairro: prev.origem_bairro || dadosNF.emitente_bairro,
                  destinatario: dadosNF.destinatario_razao_social,
                  destinatario_cnpj: dadosNF.destinatario_cnpj,
                  destinatario_telefone: dadosNF.destinatario_telefone,
                  destino: prev.destino || dadosNF.destino_cidade,
                  destino_cidade: dadosNF.destino_cidade,
                  destino_uf: dadosNF.destino_uf,
                  destino_endereco: dadosNF.destino_endereco,
                  destino_cep: dadosNF.destino_cep,
                  destino_bairro: dadosNF.destino_bairro,
                  destino_numero: dadosNF.destino_numero,
                }));
              }
              
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

  const handleRemoverNota = (index) => {
    setNotasFiscais(prev => prev.filter((_, i) => i !== index));
    toast.success("Nota fiscal removida");
  };

  const handleEditarNota = (index) => {
    setNotaParaEditar({ ...notasFiscais[index], index });
    setShowNotaForm(true);
  };

  const handleInformarVolumes = (index) => {
    setNotaParaVolumes({ ...notasFiscais[index], index });
    setShowVolumesModal(true);
  };

  const handleSalvarNota = (notaData) => {
    if (notaParaEditar?.index !== undefined) {
      setNotasFiscais(prev => prev.map((nf, i) => i === notaParaEditar.index ? notaData : nf));
      toast.success("Nota fiscal atualizada");
    } else {
      setNotasFiscais(prev => [...prev, notaData]);
      toast.success("Nota fiscal adicionada");
    }
    setShowNotaForm(false);
    setNotaParaEditar(null);
  };

  const handleSalvarVolumes = (notaData) => {
    if (notaParaVolumes?.index !== undefined) {
      setNotasFiscais(prev => prev.map((nf, i) => i === notaParaVolumes.index ? notaData : nf));
      
      if (notaData.tem_carta_correcao) {
        const pesoOriginal = notaData.peso_nf || 0;
        const volumeOriginal = notaData.volumes_nf || 0;
        const pesoAtual = notaData.peso_total_nf || 0;
        const volumeAtual = notaData.quantidade_total_volumes_nf || 0;
        
        let textoCorrecao = "";
        if (Math.abs(pesoAtual - pesoOriginal) > 0.001 && volumeAtual !== volumeOriginal) {
          textoCorrecao = `[CARTA DE CORREÇÃO] NF ${notaData.numero_nota}: Alteração de peso (de ${pesoOriginal}kg para ${pesoAtual.toFixed(3)}kg) e volume (de ${volumeOriginal} para ${volumeAtual} volumes).`;
        } else if (Math.abs(pesoAtual - pesoOriginal) > 0.001) {
          textoCorrecao = `[CARTA DE CORREÇÃO] NF ${notaData.numero_nota}: Alteração de peso (de ${pesoOriginal}kg para ${pesoAtual.toFixed(3)}kg).`;
        } else if (volumeAtual !== volumeOriginal) {
          textoCorrecao = `[CARTA DE CORREÇÃO] NF ${notaData.numero_nota}: Alteração de volume (de ${volumeOriginal} para ${volumeAtual} volumes).`;
        }
        
        if (textoCorrecao) {
          setFormData(prev => ({
            ...prev,
            observacao_carga: prev.observacao_carga ? `${prev.observacao_carga}\n\n${textoCorrecao}` : textoCorrecao
          }));
        }
      }
      
      toast.success("Volumes atualizados com sucesso!");
    }
    setShowVolumesModal(false);
    setNotaParaVolumes(null);
  };

  // ======= FUNÇÕES DE MOTORISTA E VEÍCULOS =======

  const handleMotoristaSelect = async (motoristaId) => {
    const motorista = motoristas.find(m => m.id === motoristaId);
    if (motorista) {
      handleChange("motorista_id", motorista.id);
      setMotoristaSearchTerm(motorista.nome);
      
      // Recarregar motorista da base para garantir dados atualizados
      try {
        const motoristaAtualizado = await base44.entities.Motorista.get(motorista.id);
        setMotoristaTelefone(motoristaAtualizado.celular || "");
        setItemsEncontrados(prev => ({ ...prev, motorista: motoristaAtualizado }));
      } catch (error) {
        console.log("Usando dados do cache:", error);
        setMotoristaTelefone(motorista.celular || "");
        setItemsEncontrados(prev => ({ ...prev, motorista }));
      }
      
      setOpenMotoristaCombo(false);

      const cavalo = veiculos.find(v => v.id === motorista.cavalo_id);
      const impl1 = veiculos.find(v => v.id === motorista.implemento1_id);
      const impl2 = veiculos.find(v => v.id === motorista.implemento2_id);
      const impl3 = veiculos.find(v => v.id === motorista.implemento3_id);

      handleChange("cavalo_id", motorista.cavalo_id || "");
      handleChange("implemento1_id", motorista.implemento1_id || "");
      handleChange("implemento2_id", motorista.implemento2_id || "");
      handleChange("implemento3_id", motorista.implemento3_id || "");

      setVeiculoSearchTerm({
        cavalo: cavalo?.placa || "", implemento1: impl1?.placa || "",
        implemento2: impl2?.placa || "", implemento3: impl3?.placa || ""
      });

      setItemsEncontrados(prev => ({
        ...prev, cavalo: cavalo || null, implemento1: impl1 || null,
        implemento2: impl2 || null, implemento3: impl3 || null
      }));
    }
  };

  const handleMotoristaClear = () => {
    handleChange("motorista_id", "");
    setMotoristaSearchTerm("");
    setMotoristaTelefone("");
    setItemsEncontrados(prev => ({ ...prev, motorista: null }));
    handleChange("cavalo_id", "");
    handleChange("implemento1_id", "");
    handleChange("implemento2_id", "");
    handleChange("implemento3_id", "");
    setVeiculoSearchTerm({ cavalo: "", implemento1: "", implemento2: "", implemento3: "" });
    setItemsEncontrados(prev => ({
      ...prev, cavalo: null, implemento1: null, implemento2: null, implemento3: null
    }));
  };

  const handleVeiculoSelect = (tipo, veiculoId) => {
    const veiculo = veiculos.find(v => v.id === veiculoId);
    if (veiculo) {
      handleChange(`${tipo}_id`, veiculo.id);
      setVeiculoSearchTerm(prev => ({ ...prev, [tipo]: veiculo.placa }));
      setItemsEncontrados(prev => ({ ...prev, [tipo]: veiculo }));
      setOpenVeiculoCombo(prev => ({ ...prev, [tipo]: false }));
    }
  };

  const handleVeiculoClear = (tipo) => {
    handleChange(`${tipo}_id`, "");
    setVeiculoSearchTerm(prev => ({ ...prev, [tipo]: "" }));
    setItemsEncontrados(prev => ({ ...prev, [tipo]: null }));
  };

  const handleAtualizarFichaMotorista = async () => {
    if (!formData.motorista_id) return;

    setAtualizandoFicha(true);
    try {
      const updateData = {
        cavalo_id: formData.cavalo_id || null,
        implemento1_id: formData.implemento1_id || null,
        implemento2_id: formData.implemento2_id || null,
        implemento3_id: formData.implemento3_id || null
      };

      await base44.entities.Motorista.update(formData.motorista_id, updateData);
      setVeiculosAlterados(false);
      toast.success("Ficha do motorista atualizada!");
    } catch (error) {
      console.error("Erro ao atualizar ficha:", error);
      toast.error("Erro ao atualizar ficha do motorista");
    } finally {
      setAtualizandoFicha(false);
    }
  };

  const handleSalvarTelefone = async () => {
    if (!formData.motorista_id || !motoristaTelefone) return;

    setSalvandoTelefone(true);
    try {
      await base44.entities.Motorista.update(formData.motorista_id, {
        celular: motoristaTelefone
      });
      
      // Aguardar persistência
      await new Promise(resolve => setTimeout(resolve, 200));
      
      setEditandoTelefone(false);
      setItemsEncontrados(prev => ({
        ...prev,
        motorista: { ...prev.motorista, celular: motoristaTelefone }
      }));
      toast.success("✓ Telefone salvo com sucesso!");
    } catch (error) {
      console.error("Erro ao atualizar telefone:", error);
      toast.error("Erro ao atualizar telefone");
    } finally {
      setSalvandoTelefone(false);
    }
  };

  // ======= FUNÇÕES DE OPERAÇÃO =======

  const handleOperacaoSelect = (operacaoId) => {
    const operacao = operacoes.find(op => op.id === operacaoId);
    if (operacao) {
      handleChange("operacao_id", operacao.id);
      setOperacaoSearchTerm(operacao.nome);
      setItemsEncontrados(prev => ({ ...prev, operacao }));
      setOpenOperacaoCombo(false);
    }
  };

  const handleOperacaoClear = () => {
    handleChange("operacao_id", "");
    setOperacaoSearchTerm("");
    setItemsEncontrados(prev => ({ ...prev, operacao: null }));
  };

  // ======= FUNÇÕES DE IMPORT PDF (para ordem de carregamento) =======

  const handleImportarPDF = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImportando(true);
    setLoadingMessage("Enviando arquivo (1/3)...");
    setImportError(null);
    setImportSuccess(false);

    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });

      setLoadingMessage("IA analisando documento (2/3) - Aguarde...");

      const ordemSchema = {
        type: "object",
        properties: {
          numero_ordem: { type: "string", description: "Número da ordem de carregamento (ex: 2373)" },
          data_emissao: { type: "string", description: "Data e hora de emissão" },
          
          motorista_nome: { type: "string", description: "Nome do motorista (Campo 'Autorizamos o Sr.')" },
          motorista_cnh: { type: "string", description: "CNH do motorista" },
          motorista_cpf: { type: "string", description: "CPF do motorista" },
          motorista_rg: { type: "string", description: "RG do motorista" },
          vencimento_cnh: { type: "string", description: "Vencimento da CNH" },
          
          cavalo_placa: { type: "string", description: "Placa do veículo/cavalo" },
          cavalo_renavam: { type: "string", description: "Renavam do veículo/cavalo" },
          cavalo_antt: { type: "string", description: "ANTT do veículo" },
          
          implemento1_placa: { type: "string", description: "Placa do primeiro reboque" },
          implemento1_renavam: { type: "string", description: "Renavam do primeiro reboque" },
          implemento2_placa: { type: "string", description: "Placa do segundo reboque" },
          implemento2_renavam: { type: "string" },
          
          origem_completo: { type: "string", description: "Campo ORIGEM completo (Cidade/UF)" },
          destino_completo: { type: "string", description: "Campo DESTINO completo (Cidade/UF)" },
          
          remetente_razao_social: { type: "string", description: "Razão social do Remetente" },
          remetente_cnpj: { type: "string", description: "CNPJ do Remetente" },
          remetente_endereco: { type: "string", description: "Endereço completo do Remetente" },
          remetente_cep: { type: "string", description: "CEP do Remetente" },
          
          destinatario_razao_social: { type: "string", description: "Razão social do Destinatário" },
          destinatario_cnpj: { type: "string", description: "CNPJ do Destinatário" },
          destinatario_endereco: { type: "string", description: "Endereço completo do Destinatário" },
          destinatario_cep: { type: "string", description: "CEP do Destinatário" },
          
          produto: { type: "string", description: "Produto ou Espécie (campo A retirar ou Espécie)" },
          peso: { type: "string", description: "Peso bruto ou líquido" },
          volumes: { type: "string", description: "Quantidade ou volumes" },
          
          load_num: { type: "string", description: "Load Num/DT" },
          observacoes: { type: "string", description: "Observações gerais" }
        }
      };

      const result = await base44.integrations.Core.ExtractDataFromUploadedFile({
        file_url,
        json_schema: ordemSchema
      });

      if (result.status !== "success" || !result.output) {
        throw new Error("Não foi possível extrair os dados do PDF.");
      }

      setLoadingMessage("Processando dados e preenchendo (3/3)...");

      const dados = result.output;

      // Buscar ou criar motorista
      let motoristaId = null;
      let motoristaEncontradoOuCriado = null;
      if (dados.motorista_cpf) {
        const cpfLimpo = dados.motorista_cpf.replace(/\D/g, '');
        motoristaEncontradoOuCriado = motoristas.find(m => m.cpf?.replace(/\D/g, '') === cpfLimpo);

        if (motoristaEncontradoOuCriado) {
          motoristaId = motoristaEncontradoOuCriado.id;
        } else if (dados.motorista_nome && dados.motorista_cnh) {
          const novoMotorista = await base44.entities.Motorista.create({
            nome: dados.motorista_nome,
            cpf: dados.motorista_cpf,
            rg: dados.motorista_rg || "",
            cnh: dados.motorista_cnh,
            categoria_cnh: "E",
            celular: "",
            vencimento_cnh: dados.vencimento_cnh ? dados.vencimento_cnh.split('/').reverse().join('-') : null,
            status: "ativo",
            data_cadastro: new Date().toISOString().split('T')[0]
          });
          motoristaId = novoMotorista.id;
          motoristaEncontradoOuCriado = novoMotorista;
        }
      }

      // Buscar ou criar veículos
      const veiculosIds = { cavalo: null, implemento1: null, implemento2: null, implemento3: null };
      let currentVeiculosList = [...veiculos];

      const findOrCreateVeiculo = async (placa, renavam, antt, tipo) => {
        if (!placa) return null;
        const placaLimpa = placa.toUpperCase().replace(/[^A-Z0-9]/g, '');
        let veiculoObj = currentVeiculosList.find(v =>
          v.placa?.toUpperCase().replace(/[^A-Z0-9]/g, '') === placaLimpa
        );

        if (veiculoObj) {
          // Atualizar ANTT se disponível e não existente
          if (antt && !veiculoObj.antt_numero) {
             await base44.entities.Veiculo.update(veiculoObj.id, { antt_numero: antt });
          }
          return veiculoObj.id;
        } else {
          const novoVeiculo = await base44.entities.Veiculo.create({
            placa: placa,
            tipo: tipo,
            marca: "A definir",
            modelo: "A definir",
            renavam: renavam || "",
            antt_numero: antt || "",
            status: "disponível"
          });
          currentVeiculosList.push(novoVeiculo);
          return novoVeiculo.id;
        }
      };

      veiculosIds.cavalo = await findOrCreateVeiculo(dados.cavalo_placa, dados.cavalo_renavam, dados.cavalo_antt, "cavalo");
      veiculosIds.implemento1 = await findOrCreateVeiculo(dados.implemento1_placa, dados.implemento1_renavam, "semi-reboque");
      veiculosIds.implemento2 = await findOrCreateVeiculo(dados.implemento2_placa, dados.implemento2_renavam, "semi-reboque");
      veiculosIds.implemento3 = await findOrCreateVeiculo(dados.implemento3_placa, dados.implemento3_renavam, "semi-reboque");

      // Atualizar ficha do motorista
      if (motoristaId && veiculosIds.cavalo) {
        const updateMotoristaVehicles = {
          cavalo_id: veiculosIds.cavalo,
          implemento1_id: veiculosIds.implemento1,
          implemento2_id: veiculosIds.implemento2,
          implemento3_id: veiculosIds.implemento3
        };
        Object.keys(updateMotoristaVehicles).forEach(key => updateMotoristaVehicles[key] === null && delete updateMotoristaVehicles[key]);

        await base44.entities.Motorista.update(motoristaId, updateMotoristaVehicles);
        if (motoristaEncontradoOuCriado) {
          motoristaEncontradoOuCriado = { ...motoristaEncontradoOuCriado, ...updateMotoristaVehicles };
        }
      }

      // Atualizar status da ordem se for edição com motorista e veículo
      if (editingOrdem?.id && motoristaId && veiculosIds.cavalo) {
        await base44.entities.OrdemDeCarregamento.update(editingOrdem.id, {
          tipo_negociacao: "alocado",
          tipo_registro: "ordem_completa"
        });
      }

      // Processar peso
      let pesoKg = '';
      if (dados.peso) {
        let pesoStr = dados.peso.toString().replace(/[^0-9,.]/g, '').replace(',', '.');
        let pesoNum = parseFloat(pesoStr);
        if (!isNaN(pesoNum)) {
          const originalWeightText = dados.peso.toUpperCase();
          if (originalWeightText.includes('TON') || originalWeightText.includes(' T')) {
            pesoKg = (pesoNum * 1000).toString();
          } else if (pesoNum < 100 && !originalWeightText.includes('KG')) {
            pesoKg = (pesoNum * 1000).toString();
          } else {
            pesoKg = pesoNum.toString();
          }
        }
      }

      let volumesNum = '';
      if (dados.volumes) {
        const volumesStr = dados.volumes.replace(/\D/g, '');
        if (volumesStr) volumesNum = parseInt(volumesStr, 10).toString();
      }

      const normalizarCEP = (cep) => {
        if (!cep) return '';
        const apenasNumeros = cep.replace(/\D/g, '');
        if (apenasNumeros.length === 8) {
          return `${apenasNumeros.slice(0, 5)}-${apenasNumeros.slice(5)}`;
        }
        return apenasNumeros;
      };

      // Processar origem e destino
      let origemCidade = "", origemUF = "";
      if (dados.origem_completo) {
        const parts = dados.origem_completo.split('/');
        if (parts.length >= 2) {
          origemCidade = parts[0].trim();
          origemUF = parts[1].trim();
        } else {
          origemCidade = dados.origem_completo;
        }
      }

      let destinoCidade = "", destinoUF = "";
      if (dados.destino_completo) {
        const parts = dados.destino_completo.split('/');
        if (parts.length >= 2) {
          destinoCidade = parts[0].trim();
          destinoUF = parts[1].trim();
        } else {
          destinoCidade = dados.destino_completo;
        }
      }

      setFormData(prev => ({
        ...prev,
        // Cliente/Remetente
        cliente: dados.remetente_razao_social || prev.cliente,
        cliente_cnpj: dados.remetente_cnpj || prev.cliente_cnpj,
        remetente_razao_social: dados.remetente_razao_social || prev.remetente_razao_social,
        remetente_cnpj: dados.remetente_cnpj || prev.remetente_cnpj,
        remetente_endereco: dados.remetente_endereco || prev.remetente_endereco,
        remetente_cep: normalizarCEP(dados.remetente_cep) || prev.remetente_cep,
        
        // Origem
        origem: origemCidade || prev.origem,
        origem_cidade: origemCidade || prev.origem_cidade,
        origem_uf: origemUF || prev.origem_uf,
        origem_endereco: dados.remetente_endereco || prev.origem_endereco, // Assume endereço do remetente como origem física
        origem_cep: normalizarCEP(dados.remetente_cep) || prev.origem_cep,

        // Destinatário
        destinatario: dados.destinatario_razao_social || prev.destinatario,
        destinatario_cnpj: dados.destinatario_cnpj || prev.destinatario_cnpj,
        
        // Destino
        destino: destinoCidade || prev.destino,
        destino_cidade: destinoCidade || prev.destino_cidade,
        destino_uf: destinoUF || prev.destino_uf,
        destino_endereco: dados.destinatario_endereco || prev.destino_endereco,
        destino_cep: normalizarCEP(dados.destinatario_cep) || prev.destino_cep,

        // Carga
        produto: dados.produto || prev.produto,
        peso: pesoKg || prev.peso,
        volumes: volumesNum || prev.volumes,
        
        // Alocação
        motorista_id: motoristaId || prev.motorista_id,
        cavalo_id: veiculosIds.cavalo || prev.cavalo_id,
        implemento1_id: veiculosIds.implemento1 || prev.implemento1_id,
        implemento2_id: veiculosIds.implemento2 || prev.implemento2_id,
        implemento3_id: veiculosIds.implemento3_id || prev.implemento3_id,
        
        // Outros
        viagem: dados.load_num || prev.viagem,
        pedido_cliente: dados.load_num || prev.pedido_cliente,
        numero_oc: dados.numero_ordem || prev.numero_oc,
        observacao_carga: dados.observacoes || prev.observacao_carga
      }));

      if (motoristaEncontradoOuCriado) {
        setMotoristaSearchTerm(motoristaEncontradoOuCriado.nome);
        setMotoristaTelefone(motoristaEncontradoOuCriado.celular || "");
        setItemsEncontrados(prev => ({ ...prev, motorista: motoristaEncontradoOuCriado }));
      }

      ['cavalo', 'implemento1', 'implemento2', 'implemento3'].forEach(key => {
        if (veiculosIds[key]) {
          const veiculoObj = currentVeiculosList.find(v => v.id === veiculosIds[key]);
          if (veiculoObj) {
            setVeiculoSearchTerm(prev => ({ ...prev, [key]: veiculoObj.placa }));
            setItemsEncontrados(prev => ({ ...prev, [key]: veiculoObj }));
          }
        }
      });

      setVeiculosAlterados(false);
      setImportSuccess(true);
      setTimeout(() => setImportSuccess(false), 5000);
      toast.success("Dados importados com sucesso!");
    } catch (error) {
      console.error("Erro ao importar PDF:", error);
      setImportError(error.message || "Erro ao processar o PDF.");
      toast.error("Erro ao importar PDF");
    } finally {
      setImportando(false);
      if (pdfInputRef.current) pdfInputRef.current.value = '';
    }
  };

  // ======= VALIDAÇÃO =======

  const getFieldError = (fieldName) => {
    if (!showValidation) return null;
    const obrigatorios = camposObrigatorios[tipo_ordem] || [];

    switch(fieldName) {
      case 'cliente': return obrigatorios.includes('cliente') && !formData.cliente ? 'Cliente/Remetente é obrigatório' : null;
      case 'origem': return obrigatorios.includes('origem') && !formData.origem ? 'Local de Coleta é obrigatório' : null;
      case 'destino': return obrigatorios.includes('destino') && !formData.destino ? 'Local de Entrega é obrigatório' : null;
      case 'produto': return obrigatorios.includes('produto') && !formData.produto ? 'Produto é obrigatório' : null;
      case 'peso': return obrigatorios.includes('peso') && (!formData.peso || parseFloat(formData.peso) <= 0) ? 'Peso deve ser maior que zero' : null;
      case 'motorista': return obrigatorios.includes('motorista_id') && !formData.motorista_id ? 'Selecione um motorista' : null;
      case 'telefone': return obrigatorios.includes('motorista_id') && formData.motorista_id && !motoristaTelefone ? 'Telefone do motorista é obrigatório' : null;
      case 'operacao': return obrigatorios.includes('operacao_id') && !formData.operacao_id ? 'Selecione uma operação' : null;
      case 'destinatario': return obrigatorios.includes('destinatario') && !formData.destinatario ? 'Destinatário é obrigatório' : null;
      case 'destinatario_cnpj': return obrigatorios.includes('destinatario_cnpj') && !formData.destinatario_cnpj ? 'CNPJ do destinatário é obrigatório' : null;
      case 'preco':
        if (!obrigatorios.includes('peso')) return null;
        const hasPriceMethod = (!!formData.valor_tonelada && parseFloat(formData.valor_tonelada) > 0) ||
                              (!!formData.frete_viagem && parseFloat(formData.frete_viagem) > 0);
        return !hasPriceMethod ? 'Informe Valor/Tonelada OU Frete Viagem' : null;
      default: return null;
    }
  };

  const isFormValid = () => {
    const obrigatorios = camposObrigatorios[tipo_ordem] || [];
    
    // Verificações específicas
    if (obrigatorios.includes('destinatario') && !formData.destinatario) return false;
    if (obrigatorios.includes('destinatario_cnpj') && !formData.destinatario_cnpj) return false;
    if (obrigatorios.includes('cliente') && !formData.cliente) return false;
    if (obrigatorios.includes('origem') && !formData.origem) return false;
    if (obrigatorios.includes('destino') && !formData.destino) return false;
    if (obrigatorios.includes('produto') && !formData.produto) return false;
    if (obrigatorios.includes('peso') && (!formData.peso || parseFloat(formData.peso) <= 0)) return false;
    if (obrigatorios.includes('motorista_id') && !formData.motorista_id) return false;
    if (obrigatorios.includes('motorista_id') && formData.motorista_id && !motoristaTelefone) return false;
    if (obrigatorios.includes('operacao_id') && !formData.operacao_id) return false;
    
    // Verificar preço apenas se peso é obrigatório
    if (obrigatorios.includes('peso')) {
      const hasPriceMethod = (!!formData.valor_tonelada && parseFloat(formData.valor_tonelada) > 0) ||
                            (!!formData.frete_viagem && parseFloat(formData.frete_viagem) > 0);
      if (!hasPriceMethod) return false;
    }
    
    return true;
  };

  const handleSubmit = async () => {
    setShowValidation(true);
    
    if (!isFormValid()) {
      // Listar quais campos estão faltando
      const camposFaltando = [];
      const obrigatorios = camposObrigatorios[tipo_ordem] || [];
      
      if (obrigatorios.includes('cliente') && !formData.cliente) camposFaltando.push("Cliente/Remetente");
      if (obrigatorios.includes('origem') && !formData.origem) camposFaltando.push("Local de Coleta");
      if (obrigatorios.includes('destino') && !formData.destino) camposFaltando.push("Local de Entrega");
      if (obrigatorios.includes('produto') && !formData.produto) camposFaltando.push("Produto");
      if (obrigatorios.includes('peso') && (!formData.peso || parseFloat(formData.peso) <= 0)) camposFaltando.push("Peso");
      if (obrigatorios.includes('motorista_id') && !formData.motorista_id) camposFaltando.push("Motorista");
      if (obrigatorios.includes('motorista_id') && formData.motorista_id && !motoristaTelefone) camposFaltando.push("Telefone do Motorista");
      if (obrigatorios.includes('operacao_id') && !formData.operacao_id) camposFaltando.push("Operação");
      if (obrigatorios.includes('destinatario') && !formData.destinatario) camposFaltando.push("Destinatário");
      if (obrigatorios.includes('destinatario_cnpj') && !formData.destinatario_cnpj) camposFaltando.push("CNPJ do Destinatário");
      
      if (obrigatorios.includes('peso')) {
        const hasPriceMethod = (!!formData.valor_tonelada && parseFloat(formData.valor_tonelada) > 0) ||
                              (!!formData.frete_viagem && parseFloat(formData.frete_viagem) > 0);
        if (!hasPriceMethod) camposFaltando.push("Valor/Tonelada ou Frete Viagem");
      }
      
      // Toast mais visível
      toast.error(
        <div>
          <p className="font-bold text-base mb-3">⚠️ Preencha os campos obrigatórios:</p>
          <ul className="list-none space-y-1">
            {camposFaltando.map((campo, idx) => (
              <li key={idx} className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-red-600 rounded-full"></span>
                <span className="font-medium">{campo}</span>
              </li>
            ))}
          </ul>
        </div>,
        { duration: 8000, className: 'text-base' }
      );
      
      // Scroll para o topo do modal
      const modalContent = document.querySelector('[role="dialog"] .overflow-y-auto');
      if (modalContent) {
        modalContent.scrollTo({ top: 0, behavior: 'smooth' });
      }
      
      return;
    }

    // Atualizar cadastro do motorista se houve alterações nos veículos
    if (veiculosAlterados && formData.motorista_id) {
      try {
        await handleAtualizarFichaMotorista();
      } catch (error) {
        console.error("Erro ao atualizar ficha do motorista:", error);
      }
    }

    // Calcular cliente_final baseado em tipo_operacao
    let clienteFinalNome = "";
    let clienteFinalCnpj = "";
    
    if (formData.tipo_operacao === "CIF") {
      clienteFinalNome = formData.cliente;
      clienteFinalCnpj = formData.cliente_cnpj;
    } else if (formData.tipo_operacao === "FOB") {
      clienteFinalNome = formData.destinatario || formData.destino;
      clienteFinalCnpj = formData.destinatario_cnpj;
    }

    const dataToSubmit = {
      ...formData,
      peso: parseFloat(formData.peso),
      valor_tonelada: formData.valor_tonelada ? parseFloat(formData.valor_tonelada) : null,
      frete_viagem: formData.frete_viagem ? parseFloat(formData.frete_viagem) : null,
      valor_total_frete: valorTotal,
      volumes: formData.volumes ? parseInt(formData.volumes) : null,
      qtd_entregas: formData.qtd_entregas ? parseInt(formData.qtd_entregas) : 1,
      cliente_final_nome: clienteFinalNome,
      cliente_final_cnpj: clienteFinalCnpj
    };
    
    onSubmit(dataToSubmit, notasFiscais);
  };

  // ======= RENDERS =======

  const theme = {
    cardBg: isDark ? '#1e293b' : '#ffffff',
    cardBorder: isDark ? '#334155' : '#e5e7eb',
    text: isDark ? '#f1f5f9' : '#111827',
    textMuted: isDark ? '#94a3b8' : '#6b7280',
  };

  const camposVis = camposVisiveis[tipo_ordem] || [];
  const mostrarImportPDF = tipo_ordem === 'carregamento' && (!editingOrdem || editingOrdem.tipo_registro === "oferta" || !editingOrdem.motorista_id);
  const mostrarImportNF = camposVis.includes('notas_fiscais');

  const filteredMotoristas = motoristas.filter(motorista => {
    if (!motoristaSearchTerm || motoristaSearchTerm.length < 2) return true;
    const searchLower = motoristaSearchTerm.toLowerCase();
    return motorista.nome?.toLowerCase().includes(searchLower) ||
           motorista.cpf?.includes(motoristaSearchTerm) ||
           motorista.cnh?.includes(motoristaSearchTerm);
  });

  const getFilteredVeiculos = (tipo) => {
    const searchTerm = veiculoSearchTerm[tipo];
    if (!searchTerm || searchTerm.length < 2) return [];

    const searchNormalized = searchTerm.toUpperCase().replace(/[^A-Z0-9]/g, '');
    let veiculosFiltrados = veiculos;
    if (tipo === 'cavalo') {
      veiculosFiltrados = veiculos.filter(v => v.tipo === "cavalo");
    } else {
      veiculosFiltrados = veiculos.filter(v => v.tipo === "semi-reboque" || v.tipo === "carreta");
    }

    return veiculosFiltrados.filter(v =>
      v.placa?.toUpperCase().replace(/[^A-Z0-9]/g, '').includes(searchNormalized)
    );
  };

  const getFilteredOperacoes = () => {
    if (!operacaoSearchTerm || operacaoSearchTerm.length < 2) return [];
    const searchNormalized = operacaoSearchTerm.toLowerCase();
    return operacoes.filter(op =>
      op.nome?.toLowerCase().includes(searchNormalized) ||
      op.codigo?.toLowerCase().includes(searchNormalized)
    );
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-5xl max-h-[90vh] overflow-y-auto" style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}>
          <DialogHeader>
            <DialogTitle style={{ color: theme.text }}>
              {editingOrdem ? (
                tipo_ordem === 'coleta' 
                  ? `Editar Coleta ${editingOrdem.numero_coleta || editingOrdem.numero_carga || `#${editingOrdem.id?.slice(-6)}`}` 
                  : `Editar Ordem ${editingOrdem.numero_carga || `#${editingOrdem.id?.slice(-6)}`}`
              ) : (
                `Nova ${tipo_ordem === 'coleta' ? 'Solicitação de Coleta' : 'Ordem de Carregamento'}`
              )}
            </DialogTitle>
          </DialogHeader>

          {/* Import PDF - apenas para carregamento */}
          {tipo_ordem === 'carregamento' && (
            <div className="mb-4">
              <input ref={pdfInputRef} type="file" accept=".pdf" onChange={handleImportarPDF} className="hidden" disabled={importando} />
              
              {mostrarImportPDF ? (
                <div className="border-2 border-dashed border-blue-300 rounded-lg p-6 bg-blue-50 hover:bg-blue-100 transition-colors">
                  <div className="text-center">
                    <FileUp className="w-12 h-12 mx-auto mb-3 text-blue-600" />
                    <h3 className="text-lg font-semibold mb-2 text-blue-900">Completar Ordem com PDF do ERP</h3>
                    <p className="text-sm text-blue-700 mb-4">Faça upload do PDF para preencher automaticamente</p>
                    <Button type="button" onClick={() => pdfInputRef.current?.click()} disabled={importando} className="bg-blue-600 min-w-[200px]">
                      {importando ? (
                        <div className="flex flex-col items-center py-1">
                          <div className="flex items-center">
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            <span>Processando...</span>
                          </div>
                          {loadingMessage && <span className="text-[10px] opacity-90 mt-1">{loadingMessage}</span>}
                        </div>
                      ) : (
                        <><FileUp className="w-4 h-4 mr-2" />Selecionar PDF</>
                      )}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex justify-end mb-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm" 
                    onClick={() => pdfInputRef.current?.click()} 
                    disabled={importando}
                    className="bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100 text-xs"
                  >
                    {importando ? (
                      <><Loader2 className="w-3 h-3 mr-2 animate-spin" />Processando...</>
                    ) : (
                      <><FileUp className="w-3 h-3 mr-2" />Atualizar dados com PDF</>
                    )}
                  </Button>
                </div>
              )}

              {importError && (
                <Alert variant="destructive" className="mt-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{importError}</AlertDescription>
                </Alert>
              )}

              {importSuccess && (
                <Alert className="mt-4 bg-green-50 border-green-200">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">✅ Dados importados com sucesso!</AlertDescription>
                </Alert>
              )}
            </div>
          )}

          {/* Importação de Notas Fiscais */}
          {mostrarImportNF && (
            <div className="border rounded-lg p-4 space-y-4 mb-4" style={{ borderColor: theme.cardBorder }}>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-blue-600 rounded" />
                <Label className="text-base font-semibold" style={{ color: theme.text }}>Métodos de Entrada de NF-e</Label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                {/* Manual */}
                <button
                  type="button"
                  onClick={() => { setNotaParaEditar(null); setShowNotaForm(true); }}
                  className="border rounded-lg p-3 hover:shadow-md transition-all flex items-center gap-3"
                  style={{ borderColor: theme.cardBorder, backgroundColor: isDark ? '#0f172a' : '#f8fafc' }}
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
                <label className="border rounded-lg p-3 hover:shadow-md transition-all cursor-pointer flex items-center gap-3"
                  style={{ borderColor: theme.cardBorder, backgroundColor: isDark ? '#0f172a' : '#f8fafc' }}>
                  <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#10b981' }}>
                    <Upload className="w-4 h-4 text-white" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold text-sm" style={{ color: theme.text }}>Upload XML</h3>
                    <p className="text-xs" style={{ color: theme.textMuted }}>Arrastar XMLs</p>
                  </div>
                  <Input type="file" accept=".xml" multiple onChange={handleFileUpload} disabled={saving} className="hidden" />
                </label>

                {/* Importação por Chave */}
                <div className="border rounded-lg p-3" style={{ borderColor: theme.cardBorder, backgroundColor: isDark ? '#0f172a' : '#f8fafc' }}>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#8b5cf6' }}>
                      <Search className="w-4 h-4 text-white" />
                    </div>
                    <div className="text-left flex-1">
                      <h3 className="font-semibold text-sm" style={{ color: theme.text }}>Importação Chave</h3>
                      <p className="text-xs" style={{ color: theme.textMuted }}>Via chave NFe</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Cole 44 dígitos"
                      value={chaveAcesso}
                      onChange={(e) => {
                        const cleaned = e.target.value.replace(/\D/g, '').slice(0, 44);
                        setChaveAcesso(cleaned);
                        if (cleaned.length === 44 && !buscandoNF) {
                          handleBuscarPorChave(cleaned);
                        }
                      }}
                      maxLength={44}
                      className="text-xs font-mono flex-1 h-9"
                      style={{ backgroundColor: theme.cardBg, borderColor: buscandoNF ? '#8b5cf6' : theme.cardBorder, color: theme.text }}
                      disabled={buscandoNF}
                      autoComplete="off"
                    />
                    <Button type="button" onClick={() => setShowScanner(true)} disabled={buscandoNF} variant="outline"
                      className="h-9 w-9 p-0 flex-shrink-0" style={{ borderColor: theme.cardBorder, color: theme.text }}>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </Button>
                  </div>
                  {buscandoNF && (
                    <div className="flex items-center gap-2 mt-2 text-xs" style={{ color: theme.textMuted }}>
                      <div className="w-3 h-3 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
                      Importando NF...
                    </div>
                  )}
                </div>

                {/* Buscar NF Cadastrada */}
                <button
                  type="button"
                  onClick={() => setShowBuscarNF(true)}
                  className="border rounded-lg p-3 hover:shadow-md transition-all flex items-center gap-3"
                  style={{ borderColor: theme.cardBorder, backgroundColor: isDark ? '#0f172a' : '#f8fafc' }}
                >
                  <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#f59e0b' }}>
                    <Package className="w-4 h-4 text-white" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold text-sm" style={{ color: theme.text }}>Buscar NF</h3>
                    <p className="text-xs" style={{ color: theme.textMuted }}>NFs já cadastradas</p>
                  </div>
                </button>
              </div>

              {/* Extrato de Notas Fiscais */}
              {notasFiscais.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Package className="w-5 h-5 text-blue-600" />
                      <Label className="text-base font-semibold" style={{ color: theme.text }}>
                        Extrato de Volumes ({notasFiscais.length} notas)
                      </Label>
                    </div>
                    <Button type="button" variant="outline" size="sm" onClick={() => setNotasFiscais([])}
                      style={{ borderColor: theme.cardBorder, color: 'rgb(239, 68, 68)' }}>
                      <X className="w-3 h-3 mr-1" />Limpar Todos
                    </Button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b" style={{ borderColor: theme.cardBorder, backgroundColor: isDark ? '#1e293b' : '#f8fafc' }}>
                          <th className="text-left p-2 font-semibold" style={{ color: theme.textMuted }}>Nota</th>
                          <th className="text-left p-2 font-semibold" style={{ color: theme.textMuted }}>Emitente</th>
                          <th className="text-left p-2 font-semibold" style={{ color: theme.textMuted }}>Destinatário</th>
                          <th className="text-left p-2 font-semibold" style={{ color: theme.textMuted }}>Vol.</th>
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
                            v.altura && v.largura && v.comprimento && v.altura > 0 && v.largura > 0 && v.comprimento > 0
                          );
                          const borderColor = !temDimensoes ? '#f97316' : theme.cardBorder;
                          const bgColor = !temDimensoes ? (isDark ? '#431407' : '#fff7ed') : 'transparent';

                          return (
                            <tr key={index} className="border-b" style={{ borderColor: borderColor, backgroundColor: bgColor }}>
                              <td className="p-2">
                                <p className="font-semibold" style={{ color: theme.text }}>{nf.numero_nota}</p>
                                {nf.serie_nota && <p className="text-xs" style={{ color: theme.textMuted }}>Série {nf.serie_nota}</p>}
                              </td>
                              <td className="p-2">
                                <p className="truncate max-w-[150px]" style={{ color: theme.text }} title={nf.emitente_razao_social}>
                                  {nf.emitente_razao_social}
                                </p>
                              </td>
                              <td className="p-2">
                                <p className="truncate max-w-[150px]" style={{ color: theme.text }} title={nf.destinatario_razao_social || formData.destinatario}>
                                  {nf.destinatario_razao_social || formData.destinatario}
                                </p>
                              </td>
                              <td className="p-2 text-center" style={{ color: theme.text }}>{nf.volumes_nf || 0}</td>
                              <td className="p-2" style={{ color: theme.text }}>
                                {nf.peso_nf?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                              </td>
                              <td className="p-2" style={{ color: theme.text }}>
                                {nf.valor_nf?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                              </td>
                              <td className="p-2">
                                <Button type="button" size="sm" variant="outline" onClick={() => handleInformarVolumes(index)}
                                  className="text-xs" style={{ 
                                    borderColor: temDimensoes ? '#16a34a' : '#f97316',
                                    color: temDimensoes ? '#16a34a' : '#f97316'
                                  }}>
                                  {temDimensoes ? '✓ OK' : '⚠ Dimensões'}
                                </Button>
                              </td>
                              <td className="p-2">
                                <div className="flex gap-1">
                                  <Button type="button" variant="ghost" size="sm" onClick={() => handleEditarNota(index)}
                                    className="h-6 w-6 p-0"><Edit className="w-3 h-3" /></Button>
                                  <Button type="button" variant="ghost" size="sm" onClick={() => handleRemoverNota(index)}
                                    className="h-6 w-6 p-0" style={{ color: 'rgb(239, 68, 68)' }}><X className="w-3 h-3" /></Button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                      <tfoot>
                        <tr style={{ backgroundColor: isDark ? '#1e293b' : '#f0fdf4', borderTop: '2px solid', borderColor: theme.cardBorder }}>
                          <td colSpan="3" className="p-3 font-semibold" style={{ color: theme.text }}>
                            Total: {notasFiscais.reduce((sum, nf) => sum + (nf.volumes_nf || 0), 0)} vol.
                          </td>
                          <td colSpan="2" className="p-3" style={{ color: theme.text }}>
                            Peso: {notasFiscais.reduce((sum, nf) => sum + (nf.peso_nf || 0), 0).toLocaleString()} kg
                          </td>
                          <td colSpan="3" className="p-3 text-green-600">
                            R$ {notasFiscais.reduce((sum, nf) => sum + (nf.valor_nf || 0), 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Formulário - com ou sem abas */}
          {usarAbas ? (
            <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
              <TabsList className="grid w-full grid-cols-4 mb-4">
                <TabsTrigger value="basicos">Dados Básicos</TabsTrigger>
                <TabsTrigger value="origem">Origem</TabsTrigger>
                <TabsTrigger value="destino">Destino</TabsTrigger>
                <TabsTrigger value="carga">Carga</TabsTrigger>
              </TabsList>

              {/* TAB: DADOS BÁSICOS */}
              <TabsContent value="basicos" className="space-y-4">
              {/* Operação - apenas para carregamento/entrega */}
              {camposVis.includes('operacao') && (
                <div>
                  <Label className={getFieldError('operacao') ? 'text-red-600 font-semibold' : ''}>
                    Operação *{getFieldError('operacao') && <span className="ml-2 text-xs">⚠️</span>}
                  </Label>
                  <Popover open={openOperacaoCombo} onOpenChange={setOpenOperacaoCombo}>
                    <PopoverTrigger asChild>
                      <Button variant="outline" role="combobox" className={cn("w-full justify-between",
                        itemsEncontrados.operacao ? "border-green-500 bg-green-50" : (getFieldError('operacao') ? 'border-red-500 border-2 bg-red-50' : ''))}>
                        {itemsEncontrados.operacao ? (
                          <span className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-green-500" />{itemsEncontrados.operacao.nome}
                          </span>
                        ) : (<span className="text-gray-500">Busque ou cadastre...</span>)}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
                      <Command shouldFilter={false}>
                        <CommandInput placeholder="Digite o nome..." value={operacaoSearchTerm} onValueChange={setOperacaoSearchTerm} />
                        <CommandList>
                          <CommandEmpty>
                            {operacaoSearchTerm.length < 2 ? "Digite pelo menos 2 caracteres" : (
                              <div className="p-4 text-center">
                                <p className="text-sm text-gray-600 mb-3">Nenhuma operação encontrada</p>
                                <Button type="button" variant="outline" size="sm" onClick={() => { setOpenOperacaoCombo(false); setShowOperacaoForm(true); }}
                                  className="w-full bg-blue-50 border-blue-200 text-blue-700">
                                  <Plus className="w-4 h-4 mr-2" />Cadastrar Nova
                                </Button>
                              </div>
                            )}
                          </CommandEmpty>
                          <CommandGroup>
                            {getFilteredOperacoes().slice(0, 10).map((operacao) => (
                              <CommandItem key={operacao.id} value={operacao.id} onSelect={() => handleOperacaoSelect(operacao.id)} className="cursor-pointer">
                                <Check className={cn("mr-2 h-4 w-4", formData.operacao_id === operacao.id ? "opacity-100" : "opacity-0")} />
                                <span className="font-medium">{operacao.nome}</span>
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  {getFieldError('operacao') && <p className="text-xs text-red-600 mt-1 font-medium">{getFieldError('operacao')}</p>}
                </div>
              )}

              {/* Modalidade e Frota - apenas para carregamento/entrega */}
              {camposVis.includes('operacao') && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Modalidade da Carga</Label>
                    <Select value={formData.modalidade_carga || "normal"} onValueChange={(value) => handleChange("modalidade_carga", value)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {modalidadeCargaOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Tipo de Frota</Label>
                    <Select value={formData.frota || "própria"} onValueChange={(value) => handleChange("frota", value)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {frotaOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              {/* Motorista - apenas para carregamento/entrega */}
              {camposVis.includes('motorista') && (
                <>
                  <div>
                    <Label className={getFieldError('motorista') ? 'text-red-600 font-semibold' : ''}>
                      Motorista *{getFieldError('motorista') && <span className="ml-2 text-xs">⚠️</span>}
                    </Label>
                    <Popover open={openMotoristaCombo} onOpenChange={setOpenMotoristaCombo}>
                      <PopoverTrigger asChild>
                        <Button variant="outline" role="combobox" className={cn("w-full justify-between",
                          itemsEncontrados.motorista ? "border-green-500 bg-green-50" : (getFieldError('motorista') ? 'border-red-500 border-2 bg-red-50' : ''))}>
                          {itemsEncontrados.motorista ? (
                            <span className="flex items-center gap-2">
                              <CheckCircle className="w-4 h-4 text-green-500" />{itemsEncontrados.motorista.nome}
                            </span>
                          ) : (<span className="text-gray-500">Selecione...</span>)}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
                        <Command shouldFilter={false}>
                          <CommandInput placeholder="Digite nome, CPF ou CNH..." value={motoristaSearchTerm} onValueChange={setMotoristaSearchTerm} />
                          <CommandList>
                            <CommandEmpty>
                              {motoristaSearchTerm.length < 2 ? "Digite pelo menos 2 caracteres" : (
                                <div className="p-4 text-center">
                                  <p className="text-sm text-gray-600 mb-3">Nenhum motorista encontrado</p>
                                  <Button type="button" variant="outline" size="sm" onClick={() => { setOpenMotoristaCombo(false); setNomeParaCadastro(motoristaSearchTerm); setShowMotoristaForm(true); }}
                                    className="w-full bg-blue-50 border-blue-200 text-blue-700">
                                    <Plus className="w-4 h-4 mr-2" />Cadastrar Novo
                                  </Button>
                                </div>
                              )}
                            </CommandEmpty>
                            <CommandGroup>
                              {filteredMotoristas.slice(0, 10).map((motorista) => (
                                <CommandItem key={motorista.id} value={motorista.id} onSelect={() => handleMotoristaSelect(motorista.id)} className="cursor-pointer">
                                  <Check className={cn("mr-2 h-4 w-4", formData.motorista_id === motorista.id ? "opacity-100" : "opacity-0")} />
                                  <div className="flex flex-col">
                                    <span className="font-medium">{motorista.nome}</span>
                                    <span className="text-xs text-gray-500">CNH: {motorista.cnh}</span>
                                  </div>
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    {getFieldError('motorista') && <p className="text-xs text-red-600 mt-1 font-medium">{getFieldError('motorista')}</p>}

                    {itemsEncontrados.motorista && (
                      <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                        <p className="text-sm text-green-800 font-medium flex items-center gap-2">
                          <CheckCircle className="w-4 h-4" />CNH: {itemsEncontrados.motorista.cnh}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className={`text-sm font-medium ${getFieldError('telefone') ? 'text-red-600' : 'text-green-700'}`}>
                            📱 Tel: *{getFieldError('telefone') && <span className="ml-2 text-xs">⚠️</span>}
                          </span>
                          {editandoTelefone ? (
                            <div className="flex items-center gap-2 flex-1">
                              <Input type="tel" value={motoristaTelefone} onChange={(e) => setMotoristaTelefone(e.target.value)}
                                placeholder="(11) 99999-9999" className={`h-8 text-sm flex-1 ${getFieldError('telefone') ? 'border-red-500 border-2 bg-red-50' : ''}`} autoFocus />
                              <Button type="button" size="sm" onClick={handleSalvarTelefone} disabled={salvandoTelefone || !motoristaTelefone} className="h-8 bg-green-600">
                                {salvandoTelefone ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                              </Button>
                              <Button type="button" size="sm" variant="ghost" onClick={() => setEditandoTelefone(false)} className="h-8 p-0 px-2">
                                <X className="w-3 h-3" />
                              </Button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 flex-1">
                              <span className={`text-sm font-medium ${motoristaTelefone ? 'text-green-800' : 'text-red-600'}`}>
                                {motoristaTelefone || "OBRIGATÓRIO"}
                              </span>
                              <Button type="button" size="sm" variant="ghost" onClick={() => setEditandoTelefone(true)} className="h-6 text-xs text-blue-600 px-2">
                                <Edit className="w-3 h-3 mr-1" />{motoristaTelefone ? 'Editar' : 'Adicionar'}
                              </Button>
                            </div>
                          )}
                        </div>
                        {getFieldError('telefone') && <p className="text-xs text-red-600 mt-1 font-medium">{getFieldError('telefone')}</p>}
                      </div>
                    )}
                  </div>

                  {/* Veículos - apenas quando motorista selecionado */}
                  {formData.motorista_id && camposVis.includes('veiculos') && (
                    <div className="border-t pt-4 space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-semibold" style={{ color: theme.text }}>Veículos da Operação</h3>
                        {veiculosAlterados && (
                          <Button type="button" variant="outline" size="sm" onClick={handleAtualizarFichaMotorista} disabled={atualizandoFicha}
                            className="bg-blue-50 border-blue-200 text-blue-700">
                            <RefreshCw className={`w-4 h-4 ${atualizandoFicha ? 'animate-spin' : ''}`} />
                            {atualizandoFicha ? 'Atualizando...' : 'Atualizar Ficha'}
                          </Button>
                        )}
                      </div>

                      {veiculosAlterados && (
                        <Alert className="bg-yellow-50 border-yellow-200">
                          <AlertCircle className="w-4 h-4 text-yellow-600" />
                          <AlertDescription className="text-yellow-800">
                            Placas diferentes do cadastro. Atualize a ficha do motorista.
                          </AlertDescription>
                        </Alert>
                      )}

                      <div className="grid grid-cols-2 gap-4">
                        {['cavalo', 'implemento1', 'implemento2', 'implemento3'].map((tipo, idx) => {
                          const label = tipo === 'cavalo' ? 'Cavalo' : `Implemento ${idx}`;
                          const veiculoEnc = itemsEncontrados[tipo];
                          
                          return (
                            <div key={tipo}>
                              <Label>{label}{idx === 0 && tipo === 'cavalo' && ' *'}</Label>
                              <Popover open={openVeiculoCombo[tipo]} onOpenChange={(open) => setOpenVeiculoCombo(prev => ({ ...prev, [tipo]: open }))}>
                                <PopoverTrigger asChild>
                                  <Button variant="outline" role="combobox" className={cn("w-full justify-between", veiculoEnc ? "border-green-500 bg-green-50" : "")}>
                                    {veiculoEnc ? (
                                      <span className="flex items-center gap-2">
                                        <CheckCircle className="w-4 h-4 text-green-500" />{veiculoEnc.placa}
                                      </span>
                                    ) : (<span className="text-gray-500">Busque...</span>)}
                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
                                  <Command shouldFilter={false}>
                                    <CommandInput placeholder="Digite a placa..." value={veiculoSearchTerm[tipo]}
                                      onValueChange={(value) => setVeiculoSearchTerm(prev => ({ ...prev, [tipo]: value.toUpperCase() }))} />
                                    <CommandList>
                                      <CommandEmpty>
                                        {veiculoSearchTerm[tipo].length < 2 ? "Digite pelo menos 2 caracteres" : (
                                          <div className="p-4 text-center">
                                            <p className="text-sm text-gray-600 mb-3">Nenhum veículo encontrado</p>
                                            <Button type="button" variant="outline" size="sm"
                                              onClick={() => { setOpenVeiculoCombo(prev => ({ ...prev, [tipo]: false })); setTipoVeiculoCadastro(tipo); setPlacaParaCadastro(veiculoSearchTerm[tipo]); setShowVeiculoForm(true); }}
                                              className="w-full bg-blue-50 border-blue-200 text-blue-700">
                                              <Plus className="w-4 h-4 mr-2" />Cadastrar
                                            </Button>
                                          </div>
                                        )}
                                      </CommandEmpty>
                                      <CommandGroup>
                                        {getFilteredVeiculos(tipo).slice(0, 10).map((veiculo) => (
                                          <CommandItem key={veiculo.id} value={veiculo.id} onSelect={() => handleVeiculoSelect(tipo, veiculo.id)} className="cursor-pointer">
                                            <Check className={cn("mr-2 h-4 w-4", formData[`${tipo}_id`] === veiculo.id ? "opacity-100" : "opacity-0")} />
                                            <span>{veiculo.placa} - {veiculo.marca}</span>
                                          </CommandItem>
                                        ))}
                                      </CommandGroup>
                                    </CommandList>
                                  </Command>
                                </PopoverContent>
                              </Popover>
                              {veiculoEnc && (
                                <div className="flex items-center justify-between mt-1">
                                  <p className="text-xs text-gray-600">{veiculoEnc.marca} {veiculoEnc.modelo}</p>
                                  <Button type="button" variant="ghost" size="sm" onClick={() => handleVeiculoClear(tipo)} className="h-6 text-xs text-gray-500">
                                    <X className="w-3 h-3" />
                                  </Button>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Tipo Operação, Viagem, Pedido Cliente, Solicitado Por */}
              {camposVis.includes('carga_completa') && (
                <div className="grid grid-cols-4 gap-4">
                  <div>
                    <Label>Tipo Operação</Label>
                    <Select value={formData.tipo_operacao || "FOB"} onValueChange={(value) => handleChange("tipo_operacao", value)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {tipoOperacaoOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Viagem</Label>
                    <Input value={formData.viagem || ""} onChange={(e) => handleChange("viagem", e.target.value)} placeholder="Número da viagem" />
                  </div>
                  <div>
                    <Label>Pedido Cliente</Label>
                    <Input value={formData.pedido_cliente || ""} onChange={(e) => handleChange("pedido_cliente", e.target.value)} placeholder="Número do pedido" />
                  </div>
                  <div>
                    <Label>Solicitado Por</Label>
                    <Input value={formData.solicitado_por || ""} onChange={(e) => handleChange("solicitado_por", e.target.value)} placeholder="Nome" />
                  </div>
                </div>
              )}
            </TabsContent>

            {/* TAB: ORIGEM */}
            <TabsContent value="origem" className="space-y-4">
              {camposVis.includes('remetente') && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className={getFieldError('cliente') ? 'text-red-600 font-semibold' : ''}>
                        Cliente/Remetente {tipo_ordem !== 'coleta' && '*'}
                        {getFieldError('cliente') && <span className="ml-2 text-xs">⚠️</span>}
                      </Label>
                      <Input value={formData.cliente || formData.remetente_razao_social || ""} onChange={(e) => handleChange("cliente", e.target.value)}
                        placeholder="Nome" className={getFieldError('cliente') ? 'border-red-500 border-2 bg-red-50' : ''} />
                      {getFieldError('cliente') && <p className="text-xs text-red-600 mt-1 font-medium">{getFieldError('cliente')}</p>}
                    </div>
                    <div>
                      <Label>CNPJ Remetente</Label>
                      <Input value={formData.cliente_cnpj || formData.remetente_cnpj || ""} onChange={(e) => handleChange("cliente_cnpj", e.target.value)} placeholder="00.000.000/0000-00" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className={getFieldError('origem') ? 'text-red-600 font-semibold' : ''}>
                        Local de Coleta {tipo_ordem !== 'coleta' && '*'}
                        {getFieldError('origem') && <span className="ml-2 text-xs">⚠️</span>}
                      </Label>
                      <Input value={formData.origem || ""} onChange={(e) => handleChange("origem", e.target.value)}
                        placeholder="Local" className={getFieldError('origem') ? 'border-red-500 border-2 bg-red-50' : ''} />
                      {getFieldError('origem') && <p className="text-xs text-red-600 mt-1 font-medium">{getFieldError('origem')}</p>}
                    </div>
                    <div>
                      <Label>Endereço Completo</Label>
                      <Input value={formData.origem_endereco || formData.remetente_endereco || ""} onChange={(e) => handleChange("origem_endereco", e.target.value)} placeholder="Rua, número" />
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-4">
                    <div>
                      <Label>CEP</Label>
                      <Input value={formData.origem_cep || formData.remetente_cep || ""} onChange={(e) => handleChange("origem_cep", e.target.value)} placeholder="00000-000" />
                    </div>
                    <div>
                      <Label>Bairro</Label>
                      <Input value={formData.origem_bairro || formData.remetente_bairro || ""} onChange={(e) => handleChange("origem_bairro", e.target.value)} placeholder="Bairro" />
                    </div>
                    <div>
                      <Label>Cidade</Label>
                      <Input value={formData.origem_cidade || formData.remetente_cidade || ""} onChange={(e) => handleChange("origem_cidade", e.target.value)} placeholder="Cidade" />
                    </div>
                    <div>
                      <Label>UF</Label>
                      <Input value={formData.origem_uf || formData.remetente_uf || ""} onChange={(e) => handleChange("origem_uf", e.target.value.toUpperCase())} placeholder="SP" maxLength={2} />
                    </div>
                  </div>
                </>
              )}
            </TabsContent>

            {/* TAB: DESTINO */}
            <TabsContent value="destino" className="space-y-4">
              {camposVis.includes('destinatario') && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className={getFieldError('destinatario') ? 'text-red-600 font-semibold' : ''}>
                        Destinatário {(tipo_ordem === 'coleta' || tipo_ordem === 'recebimento') && '*'}
                        {getFieldError('destinatario') && <span className="ml-2 text-xs">⚠️</span>}
                      </Label>
                      <Input value={formData.destinatario || ""} onChange={(e) => handleChange("destinatario", e.target.value)}
                        placeholder="Nome" className={getFieldError('destinatario') ? 'border-red-500 border-2 bg-red-50' : ''} />
                      {getFieldError('destinatario') && <p className="text-xs text-red-600 mt-1 font-medium">{getFieldError('destinatario')}</p>}
                    </div>
                    <div>
                      <Label className={getFieldError('destinatario_cnpj') ? 'text-red-600 font-semibold' : ''}>
                        CNPJ Destinatário {(tipo_ordem === 'coleta' || tipo_ordem === 'recebimento') && '*'}
                        {getFieldError('destinatario_cnpj') && <span className="ml-2 text-xs">⚠️</span>}
                      </Label>
                      <Input value={formData.destinatario_cnpj || ""} onChange={(e) => handleChange("destinatario_cnpj", e.target.value)}
                        placeholder="00.000.000/0000-00" className={getFieldError('destinatario_cnpj') ? 'border-red-500 border-2 bg-red-50' : ''} />
                      {getFieldError('destinatario_cnpj') && <p className="text-xs text-red-600 mt-1 font-medium">{getFieldError('destinatario_cnpj')}</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className={getFieldError('destino') ? 'text-red-600 font-semibold' : ''}>
                        Local de Entrega {tipo_ordem !== 'coleta' && tipo_ordem !== 'recebimento' && '*'}
                        {getFieldError('destino') && <span className="ml-2 text-xs">⚠️</span>}
                      </Label>
                      <Input value={formData.destino || ""} onChange={(e) => handleChange("destino", e.target.value)}
                        placeholder="Local" className={getFieldError('destino') ? 'border-red-500 border-2 bg-red-50' : ''} />
                      {getFieldError('destino') && <p className="text-xs text-red-600 mt-1 font-medium">{getFieldError('destino')}</p>}
                    </div>
                    <div>
                      <Label>Endereço Completo</Label>
                      <Input value={formData.destino_endereco || ""} onChange={(e) => handleChange("destino_endereco", e.target.value)} placeholder="Rua, número" />
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-4">
                    <div>
                      <Label>CEP</Label>
                      <Input value={formData.destino_cep || ""} onChange={(e) => handleChange("destino_cep", e.target.value)} placeholder="00000-000" />
                    </div>
                    <div>
                      <Label>Bairro</Label>
                      <Input value={formData.destino_bairro || ""} onChange={(e) => handleChange("destino_bairro", e.target.value)} placeholder="Bairro" />
                    </div>
                    <div>
                      <Label>Cidade</Label>
                      <Input value={formData.destino_cidade || ""} onChange={(e) => handleChange("destino_cidade", e.target.value)} placeholder="Cidade" />
                    </div>
                    <div>
                      <Label>UF</Label>
                      <Input value={formData.destino_uf || ""} onChange={(e) => handleChange("destino_uf", e.target.value.toUpperCase())} placeholder="SP" maxLength={2} />
                    </div>
                  </div>
                </>
              )}
            </TabsContent>

            {/* TAB: CARGA */}
            <TabsContent value="carga" className="space-y-4">
              {camposVis.includes('carga_completa') && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className={getFieldError('produto') ? 'text-red-600 font-semibold' : ''}>
                        Produto *{getFieldError('produto') && <span className="ml-2 text-xs">⚠️</span>}
                      </Label>
                      <Input value={formData.produto || ""} onChange={(e) => handleChange("produto", e.target.value)}
                        placeholder="Produto" className={getFieldError('produto') ? 'border-red-500 border-2 bg-red-50' : ''} />
                      {getFieldError('produto') && <p className="text-xs text-red-600 mt-1 font-medium">{getFieldError('produto')}</p>}
                    </div>
                    <div>
                      <Label>Data Carregamento</Label>
                      <Input type="date" value={formData.data_carregamento || ""} onChange={(e) => handleChange("data_carregamento", e.target.value)} />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Tipo de Veículo</Label>
                      <Select value={formData.tipo_veiculo || ""} onValueChange={(value) => handleChange("tipo_veiculo", value)}>
                        <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                        <SelectContent>
                          {tipoVeiculoOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Tipo de Carroceria</Label>
                      <Select value={formData.tipo_carroceria || ""} onValueChange={(value) => handleChange("tipo_carroceria", value)}>
                        <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                        <SelectContent>
                          {tipoCarroceriaOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {getFieldError('preco') && (
                    <div className="p-3 bg-red-50 border-2 border-red-500 rounded-lg">
                      <p className="text-sm text-red-700 font-semibold flex items-center gap-2">
                        <AlertCircle className="w-4 h-4" />{getFieldError('preco')}
                      </p>
                    </div>
                  )}

                  <div className="grid grid-cols-4 gap-4">
                    <div>
                      <Label className={getFieldError('peso') ? 'text-red-600 font-semibold' : ''}>
                        Peso (kg) *{getFieldError('peso') && <span className="ml-2 text-xs">⚠️</span>}
                      </Label>
                      <Input type="number" value={formData.peso || ""} onChange={(e) => handleChange("peso", e.target.value)}
                        placeholder="Peso" className={getFieldError('peso') ? 'border-red-500 border-2 bg-red-50' : ''} />
                      {getFieldError('peso') && <p className="text-xs text-red-600 mt-1 font-medium">{getFieldError('peso')}</p>}
                    </div>
                    <div>
                      <Label className={getFieldError('preco') ? 'text-orange-600 font-medium' : ''}>
                        Valor/Tonelada {getFieldError('preco') && <span className="ml-2 text-xs">⚠️</span>}
                      </Label>
                      <Input type="number" step="0.01" value={formData.valor_tonelada || ""} onChange={(e) => handleChange("valor_tonelada", e.target.value)}
                        placeholder="R$" disabled={!!formData.frete_viagem && parseFloat(formData.frete_viagem) > 0}
                        className={getFieldError('preco') ? 'border-orange-400 border-2 bg-orange-50' : ''} />
                    </div>
                    <div>
                      <Label className={getFieldError('preco') ? 'text-orange-600 font-medium' : ''}>
                        Frete Viagem {getFieldError('preco') && <span className="ml-2 text-xs">⚠️</span>}
                      </Label>
                      <Input type="number" step="0.01" value={formData.frete_viagem || ""} onChange={(e) => handleChange("frete_viagem", e.target.value)}
                        placeholder="R$" disabled={!!formData.valor_tonelada && parseFloat(formData.valor_tonelada) > 0}
                        className={getFieldError('preco') ? 'border-orange-400 border-2 bg-orange-50' : ''} />
                    </div>
                    <div>
                      <Label>Valor Total</Label>
                      <div className="p-2 bg-gray-50 rounded border text-sm font-medium">
                        R$ {valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-4">
                    <div>
                      <Label>Volumes</Label>
                      <Input type="number" value={formData.volumes || ""} onChange={(e) => handleChange("volumes", e.target.value)} placeholder="Qtd" />
                    </div>
                    <div>
                      <Label>Embalagem</Label>
                      <Input value={formData.embalagem || formData.tipo_embalagem || ""} onChange={(e) => handleChange("embalagem", e.target.value)} placeholder="Tipo" />
                    </div>
                    <div>
                      <Label>Conteúdo</Label>
                      <Input value={formData.conteudo || ""} onChange={(e) => handleChange("conteudo", e.target.value)} placeholder="Descrição" />
                    </div>
                    <div>
                      <Label>Qtd Entregas</Label>
                      <Input type="number" value={formData.qtd_entregas || 1} onChange={(e) => handleChange("qtd_entregas", e.target.value)} />
                    </div>
                  </div>
                </>
              )}
            </TabsContent>
          </Tabs>
          ) : (
            /* Layout simplificado sem abas */
            <div className="space-y-4 mt-4">
              {/* Operação, Modalidade, Motorista e Veículos - se aplicável */}
              {camposVis.includes('operacao') && (
                <div className="border rounded-lg p-4 space-y-4" style={{ borderColor: theme.cardBorder }}>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-4 h-4 bg-blue-600 rounded" />
                    <Label className="text-base font-semibold" style={{ color: theme.text }}>Operação</Label>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                     <Label className={getFieldError('operacao') ? 'text-red-600 font-semibold' : ''}>
                       Operação *{getFieldError('operacao') && <span className="ml-2 text-xs">⚠️</span>}
                     </Label>
                     <Select value={formData.operacao_id || ""} onValueChange={(value) => handleChange("operacao_id", value)}>
                       <SelectTrigger className={getFieldError('operacao') ? 'border-red-500 border-2 bg-red-50' : ''}>
                         <SelectValue placeholder="Busque ou cadastre..." />
                       </SelectTrigger>
                       <SelectContent>
                         {operacoes.filter(o => o.ativo).map((op) => (
                           <SelectItem key={op.id} value={op.id}>{op.nome}</SelectItem>
                         ))}
                       </SelectContent>
                     </Select>
                     {getFieldError('operacao') && <p className="text-xs text-red-600 mt-1 font-medium">{getFieldError('operacao')}</p>}
                    </div>

                    <div>
                      <Label>Modalidade da Carga</Label>
                      <Select value={formData.modalidade_carga || "normal"} onValueChange={(value) => handleChange("modalidade_carga", value)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {modalidadeCargaOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Tipo de Frota</Label>
                      <Select value={formData.frota || ""} onValueChange={(value) => handleChange("frota", value)}>
                        <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                        <SelectContent>
                          {frotaOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Tipo Operação</Label>
                      <Select value={formData.tipo_operacao || "FOB"} onValueChange={(value) => handleChange("tipo_operacao", value)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {tipoOperacaoOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-4">
                    <div>
                      <Label>Viagem</Label>
                      <Input value={formData.viagem || ""} onChange={(e) => handleChange("viagem", e.target.value)} placeholder="Número da viagem" 
                        style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder, color: theme.text }} />
                    </div>
                    <div>
                      <Label>Pedido Cliente</Label>
                      <Input value={formData.pedido_cliente || ""} onChange={(e) => handleChange("pedido_cliente", e.target.value)} placeholder="Número do pedido" 
                        style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder, color: theme.text }} />
                    </div>
                    <div>
                      <Label>Solicitado Por</Label>
                      <Input value={formData.solicitado_por || ""} onChange={(e) => handleChange("solicitado_por", e.target.value)} placeholder="Nome" 
                        style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder, color: theme.text }} />
                    </div>
                    <div>
                      <Label>Meio Solicitação</Label>
                      <Select value={formData.meio_solicitacao || ""} onValueChange={(value) => handleChange("meio_solicitacao", value)}>
                        <SelectTrigger style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder, color: theme.text }}>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}>
                          <SelectItem value="email" style={{ color: theme.text }}>Email</SelectItem>
                          <SelectItem value="telefone" style={{ color: theme.text }}>Telefone</SelectItem>
                          <SelectItem value="whatsapp" style={{ color: theme.text }}>WhatsApp</SelectItem>
                          <SelectItem value="sistema" style={{ color: theme.text }}>Sistema</SelectItem>
                          <SelectItem value="presencial" style={{ color: theme.text }}>Presencial</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              )}

              {/* Motorista e Veículos */}
              {camposVis.includes('motorista') && (
                <div className="border rounded-lg p-4 space-y-4" style={{ borderColor: theme.cardBorder }}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-blue-600 rounded" />
                      <Label className="text-base font-semibold" style={{ color: theme.text }}>Motorista e Veículos</Label>
                    </div>
                    <Button type="button" variant="outline" size="sm" onClick={() => setShowMotoristaForm(true)}>
                      <Plus className="w-4 h-4 mr-2" />Novo Motorista
                    </Button>
                  </div>

                  <div>
                   <Label className={getFieldError('motorista') ? 'text-red-600 font-semibold' : ''}>
                     Motorista *{getFieldError('motorista') && <span className="ml-2 text-xs">⚠️</span>}
                   </Label>
                   <div className="relative">
                     <Input
                       value={(() => {
                         if (formData.motorista_id) {
                           const mot = motoristas.find(m => m.id === formData.motorista_id);
                           return mot ? mot.nome : '';
                         }
                         return motoristaBusca;
                       })()}
                       onChange={(e) => {
                         setMotoristaBusca(e.target.value);
                         handleChange("motorista_id", "");
                       }}
                       placeholder="Digite o nome do motorista..."
                       className={getFieldError('motorista') ? 'border-red-500 border-2 bg-red-50' : ''}
                       style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder, color: theme.text }}
                     />
                      {motoristaBusca && !formData.motorista_id && (
                        <div className="absolute z-50 w-full mt-1 rounded-lg shadow-lg max-h-60 overflow-auto" 
                          style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder, border: '1px solid' }}>
                          {motoristas
                            .filter(m => m.nome.toLowerCase().includes(motoristaBusca.toLowerCase()))
                            .slice(0, 10)
                            .map((m) => (
                              <div
                                key={m.id}
                                className="px-4 py-2 cursor-pointer transition-colors"
                                style={{ 
                                  backgroundColor: theme.cardBg,
                                  ':hover': { backgroundColor: isDark ? '#334155' : '#f3f4f6' }
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = isDark ? '#334155' : '#f3f4f6'}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = theme.cardBg}
                                onClick={async () => {
                                handleChange("motorista_id", m.id);
                                setMotoristaBusca("");

                                // Recarregar motorista para garantir telefone atualizado
                                try {
                                 const motoristaAtualizado = await base44.entities.Motorista.get(m.id);
                                 setMotoristaTelefone(motoristaAtualizado.celular || "");
                                } catch (error) {
                                 console.log("Usando telefone do cache:", error);
                                 setMotoristaTelefone(m.celular || "");
                                }

                                // Auto-preencher veículos do motorista
                                if (m.cavalo_id) {
                                 handleChange("cavalo_id", m.cavalo_id);
                                 setCavaloBusca("");
                                }
                                if (m.implemento1_id) {
                                 handleChange("implemento1_id", m.implemento1_id);
                                 setImplemento1Busca("");
                                }
                                if (m.implemento2_id) {
                                 handleChange("implemento2_id", m.implemento2_id);
                                 setImplemento2Busca("");
                                }
                                if (m.implemento3_id) {
                                 handleChange("implemento3_id", m.implemento3_id);
                                 setImplemento3Busca("");
                                }
                                }}
                              >
                                <p className="font-medium" style={{ color: theme.text }}>{m.nome}</p>
                                <p className="text-xs" style={{ color: theme.textMuted }}>CPF: {m.cpf} | CNH: {m.cnh}</p>
                              </div>
                            ))}
                          {motoristas.filter(m => m.nome.toLowerCase().includes(motoristaBusca.toLowerCase())).length === 0 && (
                            <div className="px-4 py-3">
                              <p className="text-sm mb-2" style={{ color: theme.textMuted }}>Motorista não encontrado</p>
                              <Button
                                type="button"
                                size="sm"
                                onClick={() => {
                                  setShowMotoristaForm(true);
                                  setMotoristaBusca("");
                                }}
                                className="w-full"
                              >
                                <Plus className="w-4 h-4 mr-2" />
                                Cadastrar "{motoristaBusca}"
                              </Button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    {getFieldError('motorista') && <p className="text-xs text-red-600 mt-1 font-medium">{getFieldError('motorista')}</p>}
                    
                    {/* Telefone do Motorista */}
                    {formData.motorista_id && (
                     <div className="mt-2">
                       <Label className={getFieldError('telefone') ? 'text-red-600 font-semibold' : ''}>
                         📱 Telefone *{getFieldError('telefone') && <span className="ml-2 text-xs">⚠️</span>}
                       </Label>
                       <div className="flex items-center gap-2">
                         {editandoTelefone ? (
                           <>
                             <Input 
                               type="tel" 
                               value={motoristaTelefone} 
                               onChange={(e) => setMotoristaTelefone(e.target.value)}
                               placeholder="(11) 99999-9999" 
                               className={`flex-1 ${getFieldError('telefone') ? 'border-red-500 border-2 bg-red-50' : ''}`}
                               autoFocus 
                             />
                             <Button type="button" size="sm" onClick={handleSalvarTelefone} disabled={salvandoTelefone} className="bg-green-600">
                               {salvandoTelefone ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                             </Button>
                             <Button type="button" size="sm" variant="ghost" onClick={() => setEditandoTelefone(false)}>
                               <X className="w-4 h-4" />
                             </Button>
                           </>
                         ) : (
                           <>
                             <Input 
                               value={motoristaTelefone || "OBRIGATÓRIO"} 
                               readOnly
                               className={`flex-1 ${!motoristaTelefone ? 'border-red-500 border-2 bg-red-50 text-red-600 font-semibold' : 'bg-green-50 border-green-500'}`}
                             />
                             <Button type="button" size="sm" variant="outline" onClick={() => setEditandoTelefone(true)}>
                               <Edit className="w-4 h-4 mr-1" />{motoristaTelefone ? 'Editar' : 'Adicionar'}
                             </Button>
                           </>
                         )}
                       </div>
                       {getFieldError('telefone') && <p className="text-xs text-red-600 mt-1 font-medium">{getFieldError('telefone')}</p>}
                     </div>
                    )}
                    </div>

                    {/* Motorista Reserva */}
                    <div>
                    <div className="flex items-center justify-between mb-2">
                     <Label>Motorista Reserva</Label>
                     <div className="flex items-center gap-2">
                       <input
                         type="checkbox"
                         id="mostrar_reserva"
                         checked={formData.mostrar_motorista_reserva !== false}
                         onChange={(e) => handleChange("mostrar_motorista_reserva", e.target.checked)}
                         className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                       />
                       <Label htmlFor="mostrar_reserva" className="text-xs cursor-pointer" style={{ color: theme.textMuted }}>
                         Exibir reserva no sistema
                       </Label>
                     </div>
                    </div>
                    <div className="relative">
                     <Input
                       value={(() => {
                         if (formData.motorista_reserva_id) {
                           const mot = motoristas.find(m => m.id === formData.motorista_reserva_id);
                           return mot ? mot.nome : '';
                         }
                         return motoristaReservaBusca;
                       })()}
                       onChange={(e) => {
                         setMotoristaReservaBusca(e.target.value);
                         handleChange("motorista_reserva_id", "");
                       }}
                       placeholder="Digite o nome do motorista reserva..."
                       style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder, color: theme.text }}
                     />
                     {motoristaReservaBusca && !formData.motorista_reserva_id && (
                       <div className="absolute z-50 w-full mt-1 rounded-lg shadow-lg max-h-60 overflow-auto" 
                         style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder, border: '1px solid' }}>
                         {motoristas
                           .filter(m => m.nome.toLowerCase().includes(motoristaReservaBusca.toLowerCase()))
                           .slice(0, 10)
                           .map((m) => (
                             <div
                               key={m.id}
                               className="px-4 py-2 cursor-pointer transition-colors"
                               style={{ backgroundColor: theme.cardBg }}
                               onMouseEnter={(e) => e.currentTarget.style.backgroundColor = isDark ? '#334155' : '#f3f4f6'}
                               onMouseLeave={(e) => e.currentTarget.style.backgroundColor = theme.cardBg}
                               onClick={() => {
                                 handleChange("motorista_reserva_id", m.id);
                                 setMotoristaReservaBusca("");
                               }}
                             >
                               <p className="font-medium" style={{ color: theme.text }}>{m.nome}</p>
                               <p className="text-xs" style={{ color: theme.textMuted }}>CPF: {m.cpf} | CNH: {m.cnh}</p>
                             </div>
                           ))}
                       </div>
                     )}
                    </div>
                    {formData.mostrar_motorista_reserva && formData.motorista_reserva_id && (
                     <p className="text-xs mt-1 text-blue-600">
                       ✓ Este motorista será exibido no sistema
                     </p>
                    )}
                    </div>

                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Label>Cavalo</Label>
                        <Button type="button" variant="ghost" size="sm" onClick={() => setShowVeiculoForm(true)}>
                          <Plus className="w-3 h-3 mr-1" />Novo
                        </Button>
                      </div>
                      <div className="relative">
                        <Input
                          value={(() => {
                            if (formData.cavalo_id) {
                              const veic = veiculos.find(v => v.id === formData.cavalo_id);
                              return veic ? veic.placa : '';
                            }
                            return cavaloBusca;
                          })()}
                          onChange={(e) => {
                            const valor = e.target.value.replace(/[^A-Za-z0-9]/g, '').toUpperCase().slice(0, 7);
                            setCavaloBusca(valor);
                            handleChange("cavalo_id", "");
                          }}
                          placeholder="Digite a placa (7 dígitos)..."
                          maxLength={7}
                          className="uppercase"
                          style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder, color: theme.text }}
                        />
                        {cavaloBusca && !formData.cavalo_id && (
                          <div className="absolute z-50 w-full mt-1 rounded-lg shadow-lg max-h-60 overflow-auto"
                            style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder, border: '1px solid' }}>
                            {veiculos
                              .filter(v => v.tipo === "cavalo" && v.placa.toLowerCase().includes(cavaloBusca.toLowerCase()))
                              .slice(0, 10)
                              .map((v) => (
                                <div
                                  key={v.id}
                                  className="px-4 py-2 cursor-pointer transition-colors"
                                  style={{ backgroundColor: theme.cardBg }}
                                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = isDark ? '#334155' : '#f3f4f6'}
                                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = theme.cardBg}
                                  onClick={() => {
                                    handleChange("cavalo_id", v.id);
                                    setCavaloBusca("");
                                  }}
                                >
                                  <p className="font-medium" style={{ color: theme.text }}>{v.placa}</p>
                                  <p className="text-xs" style={{ color: theme.textMuted }}>{v.marca} {v.modelo}</p>
                                </div>
                              ))}
                            {veiculos.filter(v => v.tipo === "cavalo" && v.placa.toLowerCase().includes(cavaloBusca.toLowerCase())).length === 0 && (
                              <div className="px-4 py-3">
                                <p className="text-sm mb-2" style={{ color: theme.textMuted }}>Veículo não encontrado</p>
                                <Button
                                  type="button"
                                  size="sm"
                                  onClick={() => {
                                    setShowVeiculoForm(true);
                                    setCavaloBusca("");
                                  }}
                                  className="w-full"
                                >
                                  <Plus className="w-4 h-4 mr-2" />
                                  Cadastrar placa "{cavaloBusca}"
                                </Button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label>Implemento 1</Label>
                        <div className="relative">
                          <Input
                            value={(() => {
                              if (formData.implemento1_id) {
                                const veic = veiculos.find(v => v.id === formData.implemento1_id);
                                return veic ? veic.placa : '';
                              }
                              return implemento1Busca;
                            })()}
                            onChange={(e) => {
                              const valor = e.target.value.replace(/[^A-Za-z0-9]/g, '').toUpperCase().slice(0, 7);
                              setImplemento1Busca(valor);
                              handleChange("implemento1_id", "");
                            }}
                            placeholder="Placa..."
                            maxLength={7}
                            className="uppercase"
                            style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder, color: theme.text }}
                          />
                          {implemento1Busca && !formData.implemento1_id && (
                            <div className="absolute z-50 w-full mt-1 rounded-lg shadow-lg max-h-48 overflow-auto"
                              style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder, border: '1px solid' }}>
                              {veiculos
                                .filter(v => v.tipo !== "cavalo" && v.placa.toLowerCase().includes(implemento1Busca.toLowerCase()))
                                .slice(0, 5)
                                .map((v) => (
                                  <div
                                    key={v.id}
                                    className="px-3 py-1.5 cursor-pointer text-xs transition-colors"
                                    style={{ backgroundColor: theme.cardBg }}
                                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = isDark ? '#334155' : '#f3f4f6'}
                                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = theme.cardBg}
                                    onClick={() => {
                                      handleChange("implemento1_id", v.id);
                                      setImplemento1Busca("");
                                    }}
                                  >
                                    <p className="font-medium" style={{ color: theme.text }}>{v.placa}</p>
                                  </div>
                                ))}
                              {veiculos.filter(v => v.tipo !== "cavalo" && v.placa.toLowerCase().includes(implemento1Busca.toLowerCase())).length === 0 && (
                                <div className="px-3 py-2">
                                  <Button
                                    type="button"
                                    size="sm"
                                    onClick={() => {
                                      setShowVeiculoForm(true);
                                      setImplemento1Busca("");
                                    }}
                                    className="w-full text-xs h-7"
                                  >
                                    Cadastrar "{implemento1Busca}"
                                  </Button>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      <div>
                        <Label>Implemento 2</Label>
                        <div className="relative">
                          <Input
                            value={(() => {
                              if (formData.implemento2_id) {
                                const veic = veiculos.find(v => v.id === formData.implemento2_id);
                                return veic ? veic.placa : '';
                              }
                              return implemento2Busca;
                            })()}
                            onChange={(e) => {
                              const valor = e.target.value.replace(/[^A-Za-z0-9]/g, '').toUpperCase().slice(0, 7);
                              setImplemento2Busca(valor);
                              handleChange("implemento2_id", "");
                            }}
                            placeholder="Placa..."
                            maxLength={7}
                            className="uppercase"
                            style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder, color: theme.text }}
                          />
                          {implemento2Busca && !formData.implemento2_id && (
                            <div className="absolute z-50 w-full mt-1 rounded-lg shadow-lg max-h-48 overflow-auto"
                              style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder, border: '1px solid' }}>
                              {veiculos
                                .filter(v => v.tipo !== "cavalo" && v.placa.toLowerCase().includes(implemento2Busca.toLowerCase()))
                                .slice(0, 5)
                                .map((v) => (
                                  <div
                                    key={v.id}
                                    className="px-3 py-1.5 cursor-pointer text-xs transition-colors"
                                    style={{ backgroundColor: theme.cardBg }}
                                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = isDark ? '#334155' : '#f3f4f6'}
                                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = theme.cardBg}
                                    onClick={() => {
                                      handleChange("implemento2_id", v.id);
                                      setImplemento2Busca("");
                                    }}
                                  >
                                    <p className="font-medium" style={{ color: theme.text }}>{v.placa}</p>
                                  </div>
                                ))}
                              {veiculos.filter(v => v.tipo !== "cavalo" && v.placa.toLowerCase().includes(implemento2Busca.toLowerCase())).length === 0 && (
                                <div className="px-3 py-2">
                                  <Button
                                    type="button"
                                    size="sm"
                                    onClick={() => {
                                      setShowVeiculoForm(true);
                                      setImplemento2Busca("");
                                    }}
                                    className="w-full text-xs h-7"
                                  >
                                    Cadastrar "{implemento2Busca}"
                                  </Button>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      <div>
                        <Label>Implemento 3</Label>
                        <div className="relative">
                          <Input
                            value={(() => {
                              if (formData.implemento3_id) {
                                const veic = veiculos.find(v => v.id === formData.implemento3_id);
                                return veic ? veic.placa : '';
                              }
                              return implemento3Busca;
                            })()}
                            onChange={(e) => {
                              const valor = e.target.value.replace(/[^A-Za-z0-9]/g, '').toUpperCase().slice(0, 7);
                              setImplemento3Busca(valor);
                              handleChange("implemento3_id", "");
                            }}
                            placeholder="Placa..."
                            maxLength={7}
                            className="uppercase"
                            style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder, color: theme.text }}
                          />
                          {implemento3Busca && !formData.implemento3_id && (
                            <div className="absolute z-50 w-full mt-1 rounded-lg shadow-lg max-h-48 overflow-auto"
                              style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder, border: '1px solid' }}>
                              {veiculos
                                .filter(v => v.tipo !== "cavalo" && v.placa.toLowerCase().includes(implemento3Busca.toLowerCase()))
                                .slice(0, 5)
                                .map((v) => (
                                  <div
                                    key={v.id}
                                    className="px-3 py-1.5 cursor-pointer text-xs transition-colors"
                                    style={{ backgroundColor: theme.cardBg }}
                                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = isDark ? '#334155' : '#f3f4f6'}
                                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = theme.cardBg}
                                    onClick={() => {
                                      handleChange("implemento3_id", v.id);
                                      setImplemento3Busca("");
                                    }}
                                  >
                                    <p className="font-medium" style={{ color: theme.text }}>{v.placa}</p>
                                  </div>
                                ))}
                              {veiculos.filter(v => v.tipo !== "cavalo" && v.placa.toLowerCase().includes(implemento3Busca.toLowerCase())).length === 0 && (
                                <div className="px-3 py-2">
                                  <Button
                                    type="button"
                                    size="sm"
                                    onClick={() => {
                                      setShowVeiculoForm(true);
                                      setImplemento3Busca("");
                                    }}
                                    className="w-full text-xs h-7"
                                  >
                                    Cadastrar "{implemento3Busca}"
                                  </Button>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Dados do Remetente e Destinatário - Lado a Lado */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Dados do Remetente */}
                <div className="border rounded-lg p-3 space-y-2" style={{ borderColor: theme.cardBorder }}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-blue-600 rounded" />
                      <Label className="text-sm font-semibold" style={{ color: theme.text }}>Dados do Emitente</Label>
                    </div>
                    <Button type="button" size="sm" onClick={() => toast.info("Funcionalidade em breve")}
                      variant="outline" className="text-xs h-6 px-2" style={{ borderColor: theme.cardBorder, color: theme.text }}>
                      📍 Empresa
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-xs mb-0.5" style={{ color: theme.textMuted }}>CNPJ</Label>
                      <Input value={formData.remetente_cnpj || formData.cliente_cnpj || ""} onChange={(e) => handleChange("remetente_cnpj", e.target.value)}
                        placeholder="00.000.000/0000-00" className="text-sm h-8"
                        style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder, color: theme.text }} />
                    </div>
                    <div>
                      <Label className="text-xs mb-0.5" style={{ color: theme.textMuted }}>Razão Social</Label>
                      <Input value={formData.remetente_razao_social || formData.cliente || ""} onChange={(e) => handleChange("remetente_razao_social", e.target.value)}
                        placeholder="Nome da empresa" className="text-sm h-8"
                        style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder, color: theme.text }} />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-xs mb-0.5" style={{ color: theme.textMuted }}>Telefone</Label>
                      <Input value={formData.remetente_telefone || ""} onChange={(e) => handleChange("remetente_telefone", e.target.value)}
                        placeholder="(00) 00000-0000" className="text-sm h-8"
                        style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder, color: theme.text }} />
                    </div>
                    <div>
                      <Label className="text-xs mb-0.5" style={{ color: theme.textMuted }}>UF</Label>
                      <Input value={formData.remetente_uf || formData.origem_uf || ""} onChange={(e) => handleChange("remetente_uf", e.target.value.toUpperCase())}
                        maxLength={2} placeholder="SP" className="text-sm h-8"
                        style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder, color: theme.text }} />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-xs mb-0.5" style={{ color: theme.textMuted }}>Cidade</Label>
                      <Input value={formData.remetente_cidade || formData.origem_cidade || ""} onChange={(e) => handleChange("remetente_cidade", e.target.value)}
                        placeholder="Cidade" className="text-sm h-8"
                        style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder, color: theme.text }} />
                    </div>
                    <div>
                      <Label className="text-xs mb-0.5" style={{ color: theme.textMuted }}>Bairro</Label>
                      <Input value={formData.remetente_bairro || formData.origem_bairro || ""} onChange={(e) => handleChange("remetente_bairro", e.target.value)}
                        placeholder="Bairro" className="text-sm h-8"
                        style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder, color: theme.text }} />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div className="col-span-2">
                      <Label className="text-xs mb-0.5" style={{ color: theme.textMuted }}>Endereço</Label>
                      <Input value={formData.remetente_endereco || formData.origem_endereco || ""} onChange={(e) => handleChange("remetente_endereco", e.target.value)}
                        placeholder="Rua/Avenida" className="text-sm h-8"
                        style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder, color: theme.text }} />
                    </div>
                    <div>
                      <Label className="text-xs mb-0.5" style={{ color: theme.textMuted }}>Número</Label>
                      <Input value={formData.remetente_numero || ""} onChange={(e) => handleChange("remetente_numero", e.target.value)}
                        placeholder="SN" className="text-sm h-8"
                        style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder, color: theme.text }} />
                    </div>
                  </div>

                  <div>
                    <Label className="text-xs mb-0.5" style={{ color: theme.textMuted }}>CEP</Label>
                    <Input value={formData.remetente_cep || formData.origem_cep || ""} onChange={(e) => handleChange("remetente_cep", e.target.value)}
                      placeholder="00000-000" className="text-sm h-8"
                      style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder, color: theme.text }} />
                  </div>
                </div>

                {/* Dados do Destinatário */}
                <div className="border rounded-lg p-3 space-y-2" style={{ borderColor: theme.cardBorder }}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-600 rounded" />
                      <Label className="text-sm font-semibold" style={{ color: theme.text }}>Dados do Destinatário</Label>
                    </div>
                    {operadorLogistico && (
                      <Button type="button" size="sm" onClick={() => toast.info("Funcionalidade em breve")}
                        className="bg-blue-600 hover:bg-blue-700 text-white text-xs h-6 px-2">
                        📍 Operador
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                   <div>
                     <Label className={`text-xs flex items-center gap-1 mb-0.5 ${getFieldError('destinatario_cnpj') ? 'text-red-600 font-semibold' : ''}`} style={{ color: getFieldError('destinatario_cnpj') ? '#dc2626' : theme.textMuted }}>
                       CNPJ <span className="text-red-500">*</span>{getFieldError('destinatario_cnpj') && <span className="ml-1">⚠️</span>}
                     </Label>
                     <Input placeholder="00.000.000/0000-00" value={formData.destinatario_cnpj || ""}
                       onChange={(e) => handleChange("destinatario_cnpj", e.target.value)}
                       className={`text-sm h-8 ${getFieldError('destinatario_cnpj') ? 'border-red-500 border-2 bg-red-50' : ''}`}
                       style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder, color: theme.text }} />
                     {getFieldError('destinatario_cnpj') && <p className="text-xs text-red-600 mt-1 font-medium">{getFieldError('destinatario_cnpj')}</p>}
                   </div>
                   <div>
                     <Label className={`text-xs flex items-center gap-1 mb-0.5 ${getFieldError('destinatario') ? 'text-red-600 font-semibold' : ''}`} style={{ color: getFieldError('destinatario') ? '#dc2626' : theme.textMuted }}>
                       Razão Social <span className="text-red-500">*</span>{getFieldError('destinatario') && <span className="ml-1">⚠️</span>}
                     </Label>
                     <Input placeholder="Nome do destinatário" value={formData.destinatario || ""}
                       onChange={(e) => handleChange("destinatario", e.target.value)}
                       className={`text-sm h-8 ${getFieldError('destinatario') ? 'border-red-500 border-2 bg-red-50' : ''}`}
                       style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder, color: theme.text }} />
                     {getFieldError('destinatario') && <p className="text-xs text-red-600 mt-1 font-medium">{getFieldError('destinatario')}</p>}
                   </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-xs mb-0.5" style={{ color: theme.textMuted }}>Telefone</Label>
                      <Input placeholder="(00) 00000-0000" value={formData.destinatario_telefone || ""}
                        onChange={(e) => handleChange("destinatario_telefone", e.target.value)}
                        className="text-sm h-8"
                        style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder, color: theme.text }} />
                    </div>
                    <div>
                      <Label className="text-xs mb-0.5" style={{ color: theme.textMuted }}>UF</Label>
                      <Input placeholder="SP" maxLength={2} value={formData.destino_uf || ""}
                        onChange={(e) => handleChange("destino_uf", e.target.value.toUpperCase())}
                        className="text-sm h-8"
                        style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder, color: theme.text }} />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-xs mb-0.5" style={{ color: theme.textMuted }}>Cidade</Label>
                      <Input value={formData.destino_cidade || ""} onChange={(e) => handleChange("destino_cidade", e.target.value)}
                        placeholder="Cidade" className="text-sm h-8"
                        style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder, color: theme.text }} />
                    </div>
                    <div>
                      <Label className="text-xs mb-0.5" style={{ color: theme.textMuted }}>Bairro</Label>
                      <Input placeholder="Bairro" value={formData.destino_bairro || ""}
                        onChange={(e) => handleChange("destino_bairro", e.target.value)}
                        className="text-sm h-8"
                        style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder, color: theme.text }} />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div className="col-span-2">
                      <Label className="text-xs mb-0.5" style={{ color: theme.textMuted }}>Endereço</Label>
                      <Input value={formData.destino_endereco || ""} onChange={(e) => handleChange("destino_endereco", e.target.value)}
                        placeholder="Rua/Avenida" className="text-sm h-8"
                        style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder, color: theme.text }} />
                    </div>
                    <div>
                      <Label className="text-xs mb-0.5" style={{ color: theme.textMuted }}>Número</Label>
                      <Input placeholder="SN" value={formData.destino_numero || ""}
                        onChange={(e) => handleChange("destino_numero", e.target.value)}
                        className="text-sm h-8"
                        style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder, color: theme.text }} />
                    </div>
                  </div>

                  <div>
                    <Label className="text-xs mb-0.5" style={{ color: theme.textMuted }}>CEP</Label>
                    <Input value={formData.destino_cep || ""} onChange={(e) => handleChange("destino_cep", e.target.value)}
                      placeholder="00000-000" className="text-sm h-8"
                      style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder, color: theme.text }} />
                  </div>
                </div>
              </div>

              {/* Dados da Carga - se aplicável */}
              {camposVis.includes('carga_completa') && (
                <div className="border rounded-lg p-4 space-y-4" style={{ borderColor: theme.cardBorder }}>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-4 h-4 bg-blue-600 rounded" />
                    <Label className="text-base font-semibold" style={{ color: theme.text }}>Dados da Carga</Label>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className={getFieldError('produto') ? 'text-red-600 font-semibold' : ''}>
                        Produto *{getFieldError('produto') && <span className="ml-2 text-xs">⚠️</span>}
                      </Label>
                      <Input value={formData.produto || ""} onChange={(e) => handleChange("produto", e.target.value)}
                        placeholder="Produto" className={getFieldError('produto') ? 'border-red-500 border-2 bg-red-50' : ''}
                        style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder, color: theme.text }} />
                      {getFieldError('produto') && <p className="text-xs text-red-600 mt-1 font-medium">{getFieldError('produto')}</p>}
                    </div>
                    <div>
                      <Label>Data Carregamento</Label>
                      <Input type="date" value={formData.data_carregamento || ""} onChange={(e) => handleChange("data_carregamento", e.target.value)}
                        style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder, color: theme.text }} />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Tipo de Veículo</Label>
                      <Select value={formData.tipo_veiculo || ""} onValueChange={(value) => handleChange("tipo_veiculo", value)}>
                        <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                        <SelectContent>
                          {tipoVeiculoOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Tipo de Carroceria</Label>
                      <Select value={formData.tipo_carroceria || ""} onValueChange={(value) => handleChange("tipo_carroceria", value)}>
                        <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                        <SelectContent>
                          {tipoCarroceriaOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {getFieldError('preco') && (
                    <div className="p-3 bg-red-50 border-2 border-red-500 rounded-lg">
                      <p className="text-sm text-red-700 font-semibold flex items-center gap-2">
                        <AlertCircle className="w-4 h-4" />{getFieldError('preco')}
                      </p>
                    </div>
                  )}

                  <div className="grid grid-cols-4 gap-4">
                    <div>
                      <Label className={getFieldError('peso') ? 'text-red-600 font-semibold' : ''}>
                        Peso (kg) *{getFieldError('peso') && <span className="ml-2 text-xs">⚠️</span>}
                      </Label>
                      <Input type="number" value={formData.peso || ""} onChange={(e) => handleChange("peso", e.target.value)}
                        placeholder="Peso" className={getFieldError('peso') ? 'border-red-500 border-2 bg-red-50' : ''}
                        style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder, color: theme.text }} />
                      {getFieldError('peso') && <p className="text-xs text-red-600 mt-1 font-medium">{getFieldError('peso')}</p>}
                    </div>
                    <div>
                      <Label className={getFieldError('preco') ? 'text-orange-600 font-medium' : ''}>
                        Valor/Tonelada {getFieldError('preco') && <span className="ml-2 text-xs">⚠️</span>}
                      </Label>
                      <Input type="number" step="0.01" value={formData.valor_tonelada || ""} onChange={(e) => handleChange("valor_tonelada", e.target.value)}
                        placeholder="R$" disabled={!!formData.frete_viagem && parseFloat(formData.frete_viagem) > 0}
                        className={getFieldError('preco') ? 'border-orange-400 border-2 bg-orange-50' : ''}
                        style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder, color: theme.text }} />
                    </div>
                    <div>
                      <Label className={getFieldError('preco') ? 'text-orange-600 font-medium' : ''}>
                        Frete Viagem {getFieldError('preco') && <span className="ml-2 text-xs">⚠️</span>}
                      </Label>
                      <Input type="number" step="0.01" value={formData.frete_viagem || ""} onChange={(e) => handleChange("frete_viagem", e.target.value)}
                        placeholder="R$" disabled={!!formData.valor_tonelada && parseFloat(formData.valor_tonelada) > 0}
                        className={getFieldError('preco') ? 'border-orange-400 border-2 bg-orange-50' : ''}
                        style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder, color: theme.text }} />
                    </div>
                    <div>
                      <Label>Valor Total</Label>
                      <div className="p-2 rounded border text-sm font-medium"
                        style={{ backgroundColor: isDark ? '#1e293b' : '#f9fafb', borderColor: theme.cardBorder, color: theme.text }}>
                        R$ {valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-4">
                    <div>
                      <Label>Volumes</Label>
                      <Input type="number" value={formData.volumes || ""} onChange={(e) => handleChange("volumes", e.target.value)} placeholder="Qtd"
                        style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder, color: theme.text }} />
                    </div>
                    <div>
                      <Label>Embalagem</Label>
                      <Input value={formData.embalagem || formData.tipo_embalagem || ""} onChange={(e) => handleChange("embalagem", e.target.value)} placeholder="Tipo"
                        style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder, color: theme.text }} />
                    </div>
                    <div>
                      <Label>Conteúdo</Label>
                      <Input value={formData.conteudo || ""} onChange={(e) => handleChange("conteudo", e.target.value)} placeholder="Descrição"
                        style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder, color: theme.text }} />
                    </div>
                    <div>
                      <Label>Qtd Entregas</Label>
                      <Input type="number" value={formData.qtd_entregas || 1} onChange={(e) => handleChange("qtd_entregas", e.target.value)}
                        style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder, color: theme.text }} />
                    </div>
                  </div>
                </div>
              )}

              {/* Observações */}
              {camposVis.includes('observacoes') && (
                <div className="border rounded-lg p-4 space-y-3" style={{ borderColor: theme.cardBorder }}>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-blue-600 rounded" />
                    <Label className="text-base font-semibold" style={{ color: theme.text }}>Observações</Label>
                  </div>
                  <Textarea placeholder="Informações adicionais sobre a ordem" value={formData.observacao_carga || ""}
                    onChange={(e) => handleChange("observacao_carga", e.target.value)} rows={3}
                    style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder, color: theme.text }} />
                </div>
              )}
            </div>
          )}

          {/* Observações */}
          {camposVis.includes('observacoes') && (
            <div className="mt-4">
              <Label>Observações</Label>
              <Textarea value={formData.observacao_carga || ""} onChange={(e) => handleChange("observacao_carga", e.target.value)}
                placeholder="Informações adicionais" rows={3} style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder, color: theme.text }} />
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              <X className="w-4 h-4 mr-2" />Cancelar
            </Button>
            <Button onClick={handleSubmit} disabled={showValidation && !isFormValid()} className="bg-blue-600 hover:bg-blue-700">
              <Save className="w-4 h-4 mr-2" />{editingOrdem ? "Atualizar" : "Criar"} Ordem
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modais auxiliares */}
      {showMotoristaForm && (
        <MotoristaForm open={showMotoristaForm} onClose={() => { setShowMotoristaForm(false); setNomeParaCadastro(""); }}
          onSubmit={async (motoristaData) => {
            const novoMotorista = await base44.entities.Motorista.create({ ...motoristaData, nome: nomeParaCadastro || motoristaData.nome, data_cadastro: new Date().toISOString().split('T')[0] });
            handleMotoristaSelect(novoMotorista.id);
            setShowMotoristaForm(false);
          }}
          editingMotorista={null} veiculos={veiculos} />
      )}

      {showVeiculoForm && (
        <VeiculoForm open={showVeiculoForm} onClose={() => { setShowVeiculoForm(false); setTipoVeiculoCadastro(null); setPlacaParaCadastro(""); }}
          onSubmit={async (veiculoData) => {
            const novoVeiculo = await base44.entities.Veiculo.create({ ...veiculoData, placa: placaParaCadastro || veiculoData.placa });
            handleVeiculoSelect(tipoVeiculoCadastro, novoVeiculo.id);
            setShowVeiculoForm(false);
          }}
          editingVeiculo={null} placaInicial={placaParaCadastro} tipoInicial={tipoVeiculoCadastro === 'cavalo' ? 'cavalo' : 'semi-reboque'} />
      )}

      {showOperacaoForm && (
        <OperacaoForm open={showOperacaoForm} onClose={() => setShowOperacaoForm(false)}
          onSubmit={async (operacaoData) => {
            const novaOperacao = await base44.entities.Operacao.create(operacaoData);
            const operacoesAtualizadas = await base44.entities.Operacao.list();
            setOperacoes(operacoesAtualizadas.filter(op => op.ativo));
            handleOperacaoSelect(novaOperacao.id);
            setShowOperacaoForm(false);
          }}
          editingOperacao={null} nomeInicial={operacaoSearchTerm} />
      )}

      {showNotaForm && (
        <NotaFiscalForm open={showNotaForm} onClose={() => { setShowNotaForm(false); setNotaParaEditar(null); }}
          nota={notaParaEditar} onSave={handleSalvarNota} isDark={isDark} showCubagem={false} />
      )}

      {showVolumesModal && (
        <VolumesModal open={showVolumesModal} onClose={() => { setShowVolumesModal(false); setNotaParaVolumes(null); }}
          nota={notaParaVolumes} onSave={handleSalvarVolumes} isDark={isDark} />
      )}

      {/* Scanner de Código de Barras */}
      {showScanner && (
        <Dialog open={showScanner} onOpenChange={setShowScanner}>
          <DialogContent className="max-w-md" style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}>
            <DialogHeader>
              <DialogTitle style={{ color: theme.text }}>Scanner de Código de Barras</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {/* Método 1: Captura de Imagem (mais confiável em mobile) */}
              <div className="border-2 border-dashed rounded-lg p-6 text-center"
                style={{ borderColor: theme.cardBorder, backgroundColor: isDark ? '#0f172a' : '#f8fafc' }}>
                <div className="w-16 h-16 mx-auto mb-3 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: '#8b5cf6' }}>
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <h3 className="font-semibold mb-2" style={{ color: theme.text }}>
                  Fotografar Código de Barras
                </h3>
                <p className="text-xs mb-4" style={{ color: theme.textMuted }}>
                  Posicione o código de barras da NF-e dentro da área marcada
                </p>
                <input
                  ref={cameraFileInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleCapturarImagem}
                  className="hidden"
                  disabled={processandoImagem}
                />
                <Button
                  type="button"
                  onClick={() => cameraFileInputRef.current?.click()}
                  disabled={processandoImagem}
                  className="bg-purple-600 hover:bg-purple-700 w-full"
                >
                  {processandoImagem ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processando imagem...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      </svg>
                      Abrir Câmera
                    </>
                  )}
                </Button>
              </div>

              {/* Método 2: Digitação Manual */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t" style={{ borderColor: theme.cardBorder }}></div>
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="px-2" style={{ backgroundColor: theme.cardBg, color: theme.textMuted }}>
                    OU
                  </span>
                </div>
              </div>

              <div>
                <Label className="text-sm mb-2 block" style={{ color: theme.text }}>
                  Digite ou cole a chave de acesso (44 dígitos)
                </Label>
                <Input
                  placeholder="00000000000000000000000000000000000000000000"
                  value={chaveAcesso}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '').slice(0, 44);
                    setChaveAcesso(value);
                    if (value.length === 44 && !buscandoNF) {
                      handleBuscarPorChave(value);
                      setShowScanner(false);
                    }
                  }}
                  maxLength={44}
                  className="font-mono text-sm"
                  style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder, color: theme.text }}
                  disabled={processandoImagem || buscandoNF}
                />
                <p className="text-xs mt-1" style={{ color: theme.textMuted }}>
                  {chaveAcesso.length}/44 dígitos
                </p>
              </div>

              <Button 
                onClick={() => setShowScanner(false)} 
                variant="outline" 
                className="w-full"
                disabled={processandoImagem || buscandoNF}
              >
                Cancelar
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Modal de Busca de Notas Fiscais Cadastradas */}
      {showBuscarNF && (
        <Dialog open={showBuscarNF} onOpenChange={setShowBuscarNF}>
          <DialogContent className="max-w-3xl max-h-[80vh]" style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}>
            <DialogHeader>
              <DialogTitle style={{ color: theme.text }}>Buscar Notas Fiscais Cadastradas</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Input
                  placeholder="Buscar por número, emitente ou destinatário..."
                  value={buscaNFTerm}
                  onChange={(e) => setBuscaNFTerm(e.target.value)}
                  className="w-full"
                  style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder, color: theme.text }}
                />
              </div>

              {loadingNotasCadastradas ? (
                <div className="text-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3 text-blue-600" />
                  <p className="text-sm" style={{ color: theme.textMuted }}>Carregando notas fiscais...</p>
                </div>
              ) : (
                <div className="overflow-y-auto max-h-[50vh] space-y-2">
                  {notasCadastradas
                    .filter(nota => {
                      if (!buscaNFTerm) return true;
                      const searchLower = buscaNFTerm.toLowerCase();
                      return (
                        nota.numero_nota?.toLowerCase().includes(searchLower) ||
                        nota.emitente_razao_social?.toLowerCase().includes(searchLower) ||
                        nota.destinatario_razao_social?.toLowerCase().includes(searchLower) ||
                        nota.chave_nota_fiscal?.includes(buscaNFTerm)
                      );
                    })
                    .map((nota) => (
                      <div
                        key={nota.id}
                        className="border rounded-lg p-3 cursor-pointer hover:shadow-md transition-all"
                        style={{ 
                          borderColor: theme.cardBorder, 
                          backgroundColor: isDark ? '#0f172a' : '#ffffff'
                        }}
                        onClick={() => {
                          handleSelecionarNotaCadastrada(nota);
                          setShowBuscarNF(false);
                          setBuscaNFTerm("");
                        }}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge className="bg-blue-600 text-white">
                                NF-e {nota.numero_nota}
                              </Badge>
                              {nota.serie_nota && (
                                <Badge variant="outline" style={{ borderColor: theme.cardBorder, color: theme.text }}>
                                  Série {nota.serie_nota}
                                </Badge>
                              )}
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                              <div>
                                <p className="font-medium mb-1" style={{ color: theme.textMuted }}>Emitente:</p>
                                <p style={{ color: theme.text }}>{nota.emitente_razao_social}</p>
                                <p className="text-xs" style={{ color: theme.textMuted }}>{nota.emitente_cnpj}</p>
                              </div>
                              <div>
                                <p className="font-medium mb-1" style={{ color: theme.textMuted }}>Destinatário:</p>
                                <p style={{ color: theme.text }}>{nota.destinatario_razao_social}</p>
                                <p className="text-xs" style={{ color: theme.textMuted }}>{nota.destinatario_cnpj}</p>
                              </div>
                            </div>
                            <div className="flex gap-4 mt-2 text-xs" style={{ color: theme.textMuted }}>
                              <span>Vol: {nota.quantidade_total_volumes_nf || 0}</span>
                              <span>Peso: {nota.peso_total_nf?.toLocaleString()} kg</span>
                              <span>Valor: R$ {nota.valor_nota_fiscal?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                            </div>
                          </div>
                          <Button
                            type="button"
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSelecionarNotaCadastrada(nota);
                              setShowBuscarNF(false);
                              setBuscaNFTerm("");
                            }}
                          >
                            <Plus className="w-4 h-4 mr-1" />
                            Adicionar
                          </Button>
                        </div>
                      </div>
                    ))}
                  
                  {notasCadastradas.filter(nota => {
                    if (!buscaNFTerm) return true;
                    const searchLower = buscaNFTerm.toLowerCase();
                    return (
                      nota.numero_nota?.toLowerCase().includes(searchLower) ||
                      nota.emitente_razao_social?.toLowerCase().includes(searchLower) ||
                      nota.destinatario_razao_social?.toLowerCase().includes(searchLower) ||
                      nota.chave_nota_fiscal?.includes(buscaNFTerm)
                    );
                  }).length === 0 && (
                    <div className="text-center py-12">
                      <Package className="w-12 h-12 mx-auto mb-3 opacity-20" style={{ color: theme.textMuted }} />
                      <p className="text-sm" style={{ color: theme.textMuted }}>
                        {buscaNFTerm ? "Nenhuma nota fiscal encontrada" : "Nenhuma nota fiscal disponível"}
                      </p>
                    </div>
                  )}
                </div>
              )}

              <DialogFooter>
                <Button onClick={() => {
                  setShowBuscarNF(false);
                  setBuscaNFTerm("");
                }} variant="outline" className="w-full">
                  Fechar
                </Button>
              </DialogFooter>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}