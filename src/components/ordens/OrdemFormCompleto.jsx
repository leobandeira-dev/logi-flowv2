
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Save, X, CheckCircle, Truck, RefreshCw, AlertCircle, Plus, FileUp, CheckCircle2, Loader2, Edit, Zap, MapPin, Search, AlertTriangle } from "lucide-react";
import { base44 } from "@/api/base44Client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";

import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

import MotoristaForm from "../motoristas/MotoristaForm";
import VeiculoForm from "../veiculos/VeiculoForm";
import OperacaoForm from "../operacoes/OperacaoForm";
import { calcularDistancia } from "@/functions/calcularDistancia";
import { calcularFrete } from "@/functions/calcularFrete";
import { toast } from "sonner";

const frotaOptions = [
  { value: "própria", label: "Própria" },
  { value: "terceirizada", label: "Terceirizada" },
  { value: "agregado", label: "Agregado" },
  { value: "acionista", label: "Acionista" }
];

const tipoOperacaoOptions = [
  { value: "FOB", label: "FOB" },
  { value: "CIF", label: "CIF" }
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

export default function OrdemFormCompleto({ open, onClose, onSubmit, motoristas, veiculos, editingOrdem }) {
  const [formData, setFormData] = useState({
    cliente: "", cliente_cnpj: "", origem: "", destino: "", produto: "",
    peso: "", valor_tonelada: "", frete_viagem: "", motorista_id: "", cavalo_id: "",
    implemento1_id: "", implemento2_id: "", implemento3_id: "", frota: "própria", operacao_id: "",
    modalidade_carga: "normal", tipo_veiculo: "", tipo_carroceria: "",
    origem_endereco: "", origem_cep: "", origem_bairro: "", origem_cidade: "", origem_uf: "",
    destinatario: "", destinatario_cnpj: "", destino_endereco: "", destino_cep: "", destino_bairro: "", destino_cidade: "", destino_uf: "",
    data_carregamento: "", tipo_operacao: "FOB", viagem_pedido: "", notas_fiscais: "",
    volumes: "", embalagem: "", conteudo: "", qtd_entregas: 1, duv: "", numero_oc: "",
    observacao_carga: "", solicitado_por: "", senha_fila: "", carga_dedicada: false,
    valor_nf: ""
  });

  const [valorTotal, setValorTotal] = useState(0);
  const [activeTab, setActiveTab] = useState("basicos");
  const [motoristaVeiculos, setMotoristaVeiculos] = useState({ cavalo: null, implementos: [] });
  const [veiculosAlterados, setVeiculosAlterados] = useState(false);
  const [atualizandoFicha, setAtualizandoFicha] = useState(false);

  const [itemsEncontrados, setItemsEncontrados] = useState({
    motorista: null, cavalo: null, implemento1: null, implemento2: null, implemento3: null
  });

  const [openMotoristaCombo, setOpenMotoristaCombo] = useState(false);
  const [motoristaSearchTerm, setMotoristaSearchTerm] = useState("");

  const [openVeiculoCombo, setOpenVeiculoCombo] = useState({
    cavalo: false, implemento1: false, implemento2: false, implemento3: false
  });

  const [veiculoSearchTerm, setVeiculoSearchTerm] = useState({
    cavalo: "", implemento1: "", implemento2: "", implemento3: ""
  });

  const [showVeiculoForm, setShowVeiculoForm] = useState(false);
  const [tipoVeiculoCadastro, setTipoVeiculoCadastro] = useState(null);
  const [placaParaCadastro, setPlacaParaCadastro] = useState("");

  const [showMotoristaForm, setShowMotoristaForm] = useState(false);
  const [nomeParaCadastro, setNomeParaCadastro] = useState("");

  const [importando, setImportando] = useState(false);
  const [importError, setImportError] = useState(null);
  const [importSuccess, setImportSuccess] = useState(false);
  const pdfInputRef = React.useRef(null);

  const [motoristaTelefone, setMotoristaTelefone] = useState("");
  const [editandoTelefone, setEditandoTelefone] = useState(false);
  const [salvandoTelefone, setSalvandoTelefone] = useState(false);
  const [showValidation, setShowValidation] = useState(false);

  const [operacoes, setOperacoes] = useState([]);
  const [openOperacaoCombo, setOpenOperacaoCombo] = useState(false);
  const [operacaoSearchTerm, setOperacaoSearchTerm] = useState("");
  const [operacaoEncontrada, setOperacaoEncontrada] = useState(null);
  const [showOperacaoForm, setShowOperacaoForm] = useState(false);

  // Estados de precificação
  const [tabelas, setTabelas] = useState([]);
  const [tabelaSelecionada, setTabelaSelecionada] = useState(null);
  const [showTabelaManual, setShowTabelaManual] = useState(false);
  const [searchTabela, setSearchTabela] = useState("");
  const [tipoFrete, setTipoFrete] = useState(null);
  const [showTipoFreteModal, setShowTipoFreteModal] = useState(false);
  const [precificacaoCalculada, setPrecificacaoCalculada] = useState(null);
  const [calculandoDistancia, setCalculandoDistancia] = useState(false);
  const [distanciaEmitenteDest, setDistanciaEmitenteDest] = useState(null);
  const [erroCalculoDistancia, setErroCalculoDistancia] = useState(false);
  const [kmManual, setKmManual] = useState(null);
  const [aliquotaIcmsManual, setAliquotaIcmsManual] = useState(null);
  const [calculandoFrete, setCalculandoFrete] = useState(false);

  useEffect(() => {
    const loadTabelas = async () => {
      try {
        const tabelasData = await base44.entities.TabelaPreco.filter({ ativo: true });
        setTabelas(tabelasData);
      } catch (error) {
        console.error("Erro ao carregar tabelas:", error);
      }
    };
    if (open) {
      loadTabelas();
    }
  }, [open]);

  useEffect(() => {
    if (editingOrdem) {
      setFormData({
        cliente: editingOrdem.cliente || "", cliente_cnpj: editingOrdem.cliente_cnpj || "",
        origem: editingOrdem.origem || "", destino: editingOrdem.destino || "",
        produto: editingOrdem.produto || "", peso: editingOrdem.peso || "",
        valor_tonelada: editingOrdem.valor_tonelada || "", frete_viagem: editingOrdem.frete_viagem || "",
        motorista_id: editingOrdem.motorista_id || "", cavalo_id: editingOrdem.cavalo_id || "",
        implemento1_id: editingOrdem.implemento1_id || "", implemento2_id: editingOrdem.implemento2_id || "",
        implemento3_id: editingOrdem.implemento3_id || "", frota: editingOrdem.frota || "própria",
        operacao_id: editingOrdem.operacao_id || "",
        modalidade_carga: editingOrdem.modalidade_carga || "normal",
        tipo_veiculo: editingOrdem.tipo_veiculo || "",
        tipo_carroceria: editingOrdem.tipo_carroceria || "",
        origem_endereco: editingOrdem.origem_endereco || "", origem_cep: editingOrdem.origem_cep || "",
        origem_bairro: editingOrdem.origem_bairro || "", origem_cidade: editingOrdem.origem_cidade || "",
        origem_uf: editingOrdem.origem_uf || "",
        destinatario: editingOrdem.destinatario || "", destinatario_cnpj: editingOrdem.destinatario_cnpj || "",
        destino_endereco: editingOrdem.destino_endereco || "", destino_cep: editingOrdem.destino_cep || "",
        destino_bairro: editingOrdem.destino_bairro || "", destino_cidade: editingOrdem.destino_cidade || "",
        destino_uf: editingOrdem.destino_uf || "",
        data_carregamento: editingOrdem.data_carregamento || "", tipo_operacao: editingOrdem.tipo_operacao || "FOB",
        viagem_pedido: editingOrdem.viagem_pedido || "", notas_fiscais: editingOrdem.notas_fiscais || "",
        volumes: editingOrdem.volumes || "", embalagem: editingOrdem.embalagem || "",
        conteudo: editingOrdem.conteudo || "", qtd_entregas: editingOrdem.qtd_entregas || 1,
        duv: editingOrdem.duv || "", numero_oc: editingOrdem.numero_oc || "",
        observacao_carga: editingOrdem.observacao_carga || "", solicitado_por: editingOrdem.solicitado_por || "",
        senha_fila: editingOrdem.senha_fila || "", carga_dedicada: editingOrdem.carga_dedicada || false,
        valor_nf: editingOrdem.valor_total_consolidado || editingOrdem.valor_nf || ""
      });

      const motorista = motoristas.find(m => m.id === editingOrdem.motorista_id);
      const cavalo = veiculos.find(v => v.id === editingOrdem.cavalo_id);
      const impl1 = veiculos.find(v => v.id === editingOrdem.implemento1_id);
      const impl2 = veiculos.find(v => v.id === editingOrdem.implemento2_id);
      const impl3 = veiculos.find(v => v.id === editingOrdem.implemento3_id);

      setMotoristaSearchTerm(motorista?.nome || "");
      setMotoristaTelefone(motorista?.celular || "");
      setVeiculoSearchTerm({
        cavalo: cavalo?.placa || "", implemento1: impl1?.placa || "",
        implemento2: impl2?.placa || "", implemento3: impl3?.placa || ""
      });
      setItemsEncontrados({
        motorista: motorista || null, cavalo: cavalo || null,
        implemento1: impl1 || null, implemento2: impl2 || null, implemento3: impl3 || null
      });
    } else {
      setFormData({
        cliente: "", cliente_cnpj: "", origem: "", destino: "", produto: "",
        peso: "", valor_tonelada: "", frete_viagem: "", motorista_id: "", cavalo_id: "",
        implemento1_id: "", implemento2_id: "", implemento3_id: "", frota: "própria", operacao_id: "",
        modalidade_carga: "normal", tipo_veiculo: "", tipo_carroceria: "",
        origem_endereco: "", origem_cep: "", origem_bairro: "", origem_cidade: "", origem_uf: "",
        destinatario: "", destinatario_cnpj: "", destino_endereco: "", destino_cep: "", destino_bairro: "", destino_cidade: "", destino_uf: "",
        data_carregamento: "", tipo_operacao: "FOB", viagem_pedido: "", notas_fiscais: "",
        volumes: "", embalagem: "", conteudo: "", qtd_entregas: 1, duv: "", numero_oc: "",
        observacao_carga: "", solicitado_por: "", senha_fila: "", carga_dedicada: false,
        valor_nf: ""
      });
      setMotoristaSearchTerm("");
      setMotoristaTelefone("");
      setEditandoTelefone(false);
      setVeiculoSearchTerm({ cavalo: "", implemento1: "", implemento2: "", implemento3: "" });
      setItemsEncontrados({ motorista: null, cavalo: null, implemento1: null, implemento2: null, implemento3: null });
      setOperacaoEncontrada(null);
      setOperacaoSearchTerm("");
    }
    setMotoristaVeiculos({ cavalo: null, implementos: [] });
    setActiveTab("basicos");
    setVeiculosAlterados(false);
    setImportError(null);
    setImportSuccess(false);
    setShowValidation(false);
    
    // Reset precificação
    setTabelaSelecionada(null);
    setShowTabelaManual(false);
    setPrecificacaoCalculada(null);
    setKmManual(null);
    setAliquotaIcmsManual(null);
    setTipoFrete(null);
    setDistanciaEmitenteDest(null);
    setErroCalculoDistancia(false);
  }, [editingOrdem, open, motoristas, veiculos, operacoes]);

  useEffect(() => {
    const loadOperacoes = async () => {
      try {
        const operacoesData = await base44.entities.Operacao.list();
        setOperacoes(operacoesData.filter(op => op.ativo));
        if (editingOrdem?.operacao_id) {
          const operacao = operacoesData.find(op => op.id === editingOrdem.operacao_id);
          if (operacao) {
            setOperacaoEncontrada(operacao);
            setOperacaoSearchTerm(operacao.nome);
          }
        }
      } catch (error) {
        console.error("Erro ao carregar operações:", error);
      }
    };
    loadOperacoes();
  }, [editingOrdem]);

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
      } else {
        setMotoristaVeiculos({ cavalo: null, implementos: [] });
      }
    } else {
      setMotoristaVeiculos({ cavalo: null, implementos: [] });
    }
  }, [formData.motorista_id, motoristas, veiculos]);

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

  // Buscar tabela automaticamente quando CNPJs mudarem
  useEffect(() => {
    const buscarTabelaAutomatica = async () => {
      if (!formData.cliente_cnpj && !formData.destinatario_cnpj) {
        setTabelaSelecionada(null);
        setTipoFrete(null);
        setShowTabelaManual(false);
        return;
      }

      const tabelaRemetente = await buscarTabelaParceiro(formData.cliente_cnpj);
      const tabelaDestinatario = await buscarTabelaParceiro(formData.destinatario_cnpj);

      if (tabelaRemetente && tabelaDestinatario && !tipoFrete) {
        setShowTipoFreteModal(true);
        return;
      }

      if (tabelaRemetente && !tabelaDestinatario) {
        const tabelaComItens = await carregarItensDaTabela(tabelaRemetente);
        setTabelaSelecionada(tabelaComItens);
        setShowTabelaManual(false);
      } else if (tabelaDestinatario && !tabelaRemetente) {
        const tabelaComItens = await carregarItensDaTabela(tabelaDestinatario);
        setTabelaSelecionada(tabelaComItens);
        setShowTabelaManual(false);
      } else if (tipoFrete) {
        const tabelaEscolhida = tipoFrete === "CIF" ? tabelaRemetente : tabelaDestinatario;
        if (tabelaEscolhida) {
          const tabelaComItens = await carregarItensDaTabela(tabelaEscolhida);
          setTabelaSelecionada(tabelaComItens);
          setShowTabelaManual(false);
        }
      } else {
        setTabelaSelecionada(null);
        setShowTabelaManual(true);
      }
    };

    buscarTabelaAutomatica();
  }, [formData.cliente_cnpj, formData.destinatario_cnpj, tipoFrete, tabelas]);

  // Recalcular distância e frete quando mudam os parâmetros
  useEffect(() => {
    if (tabelaSelecionada && formData.peso && formData.origem_cidade && formData.destino_cidade) {
      calcularDistancias();
    }
  }, [formData.origem_cidade, formData.origem_uf, formData.destino_cidade, formData.destino_uf, tabelaSelecionada]);

  useEffect(() => {
    if (tabelaSelecionada && formData.peso && (distanciaEmitenteDest || kmManual)) {
      calcularFreteAutomatico();
    }
  }, [tabelaSelecionada, formData.peso, formData.valor_nf, kmManual, aliquotaIcmsManual, distanciaEmitenteDest]);

  const buscarTabelaParceiro = async (cnpj) => {
    if (!cnpj) return null;

    try {
      const parceiros = await base44.entities.Parceiro.list();
      const parceiro = parceiros.find(p => p.cnpj === cnpj.replace(/\D/g, ''));
      
      if (!parceiro) return null;

      const tabelasParceiro = tabelas.filter(t => 
        t.clientes_parceiros_ids?.includes(parceiro.id)
      );

      if (tabelasParceiro.length > 0) {
        const hoje = new Date();
        const tabelaValida = tabelasParceiro.find(t => {
          const inicio = t.vigencia_inicio ? new Date(t.vigencia_inicio) : null;
          const fim = t.vigencia_fim ? new Date(t.vigencia_fim) : null;
          
          if (inicio && hoje < inicio) return false;
          if (fim && hoje > fim) return false;
          
          return true;
        });

        return tabelaValida || tabelasParceiro[0];
      }
    } catch (error) {
      console.error("Erro ao buscar tabela do parceiro:", error);
    }

    return null;
  };

  const carregarItensDaTabela = async (tabela) => {
    try {
      const itens = await base44.entities.TabelaPrecoItem.filter(
        { tabela_preco_id: tabela.id },
        "ordem",
        100
      );
      return { ...tabela, itens };
    } catch (error) {
      console.error("Erro ao carregar itens da tabela:", error);
      return { ...tabela, itens: [] };
    }
  };

  const calcularDistancias = async () => {
    if (!formData.origem_cidade || !formData.origem_uf || !formData.destino_cidade || !formData.destino_uf) {
      setDistanciaEmitenteDest(null);
      return;
    }

    setCalculandoDistancia(true);
    setErroCalculoDistancia(false);
    try {
      const origem = `${formData.origem_cidade}, ${formData.origem_uf}, Brasil`;
      const destino = `${formData.destino_cidade}, ${formData.destino_uf}, Brasil`;

      const response = await calcularDistancia({ 
        origem, 
        destino,
        tabelaPrecoId: tabelaSelecionada?.id 
      });

      setDistanciaEmitenteDest({
        km: parseFloat(response.data.distancia_km),
        texto: response.data.distancia_texto,
        origem: response.data.origem_endereco,
        destino: response.data.destino_endereco
      });
    } catch (error) {
      console.error("Erro ao calcular distância:", error);
      setErroCalculoDistancia(true);
      toast.error("API do Google Maps não disponível. Insira o KM manualmente.");
    } finally {
      setCalculandoDistancia(false);
    }
  };

  const calcularFreteAutomatico = async () => {
    if (!tabelaSelecionada || !formData.peso) {
      setPrecificacaoCalculada(null);
      return;
    }

    setCalculandoFrete(true);
    try {
      const kmParaCalculo = kmManual || distanciaEmitenteDest?.km || 0;
      
      if (kmParaCalculo === 0) {
        setPrecificacaoCalculada(null);
        setCalculandoFrete(false);
        return;
      }

      const response = await calcularFrete({
        tabela_preco_id: tabelaSelecionada.id,
        peso_kg: parseFloat(formData.peso),
        valor_nf: parseFloat(formData.valor_nf) || 0,
        km: kmParaCalculo,
        aliquota_icms_manual: aliquotaIcmsManual
      });

      const resultado = response.data;
      setPrecificacaoCalculada({
        ...resultado,
        kmCalculado: kmParaCalculo,
        distanciaUsada: kmManual ? "KM Manual" : "Calculado automaticamente",
        tabela: tabelaSelecionada.nome
      });
    } catch (error) {
      console.error("Erro ao calcular frete:", error);
      toast.error("Erro ao calcular frete");
    } finally {
      setCalculandoFrete(false);
    }
  };

  const handleSelecionarTabelaManual = async (tabelaId) => {
    const tabela = tabelas.find(t => t.id === tabelaId);
    if (tabela) {
      const tabelaComItens = await carregarItensDaTabela(tabela);
      setTabelaSelecionada(tabelaComItens);
      setShowTabelaManual(false);
      setSearchTabela("");
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleMotoristaSelect = (motoristaId) => {
    const motorista = motoristas.find(m => m.id === motoristaId);
    if (motorista) {
      handleInputChange("motorista_id", motorista.id);
      setMotoristaSearchTerm(motorista.nome);
      setMotoristaTelefone(motorista.celular || "");
      setItemsEncontrados(prev => ({ ...prev, motorista }));
      setOpenMotoristaCombo(false);

      const cavalo = veiculos.find(v => v.id === motorista.cavalo_id);
      const impl1 = veiculos.find(v => v.id === motorista.implemento1_id);
      const impl2 = veiculos.find(v => v.id === motorista.implemento2_id);
      const impl3 = veiculos.find(v => v.id === motorista.implemento3_id);

      handleInputChange("cavalo_id", motorista.cavalo_id || "");
      handleInputChange("implemento1_id", motorista.implemento1_id || "");
      handleInputChange("implemento2_id", motorista.implemento2_id || "");
      handleInputChange("implemento3_id", motorista.implemento3_id || "");

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
    handleInputChange("motorista_id", "");
    setMotoristaSearchTerm("");
    setMotoristaTelefone("");
    setItemsEncontrados(prev => ({ ...prev, motorista: null }));
    handleInputChange("cavalo_id", "");
    handleInputChange("implemento1_id", "");
    handleInputChange("implemento2_id", "");
    handleInputChange("implemento3_id", "");
    setVeiculoSearchTerm({ cavalo: "", implemento1: "", implemento2: "", implemento3: "" });
    setItemsEncontrados(prev => ({
      ...prev, cavalo: null, implemento1: null, implemento2: null, implemento3: null
    }));
  };

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

  const abrirCadastroMotorista = (termo) => {
    setNomeParaCadastro(termo);
    setShowMotoristaForm(true);
  };

  const handleMotoristaCadastrado = async (novoMotorista) => {
    if (novoMotorista.id) {
      handleInputChange("motorista_id", novoMotorista.id);
      setMotoristaSearchTerm(novoMotorista.nome);
      setMotoristaTelefone(novoMotorista.celular || "");
      setItemsEncontrados(prev => ({ ...prev, motorista: novoMotorista }));
      handleInputChange("cavalo_id", "");
      handleInputChange("implemento1_id", "");
      handleInputChange("implemento2_id", "");
      handleInputChange("implemento3_id", "");
      setVeiculoSearchTerm({ cavalo: "", implemento1: "", implemento2: "", implemento3: "" });
      setItemsEncontrados(prev => ({ ...prev, cavalo: null, implemento1: null, implemento2: null, implemento3: null }));
    }
    setShowMotoristaForm(false);
    setNomeParaCadastro("");
  };

  const handleVeiculoSelect = (tipo, veiculoId) => {
    const veiculo = veiculos.find(v => v.id === veiculoId);
    if (veiculo) {
      handleInputChange(`${tipo}_id`, veiculo.id);
      setVeiculoSearchTerm(prev => ({ ...prev, [tipo]: veiculo.placa }));
      setItemsEncontrados(prev => ({ ...prev, [tipo]: veiculo }));
      setOpenVeiculoCombo(prev => ({ ...prev, [tipo]: false }));
    }
  };

  const handleVeiculoClear = (tipo) => {
    handleInputChange(`${tipo}_id`, "");
    setVeiculoSearchTerm(prev => ({ ...prev, [tipo]: "" }));
    setItemsEncontrados(prev => ({ ...prev, [tipo]: null }));
  };

  const abrirCadastroVeiculo = (tipo, placa) => {
    setTipoVeiculoCadastro(tipo);
    setPlacaParaCadastro(placa);
    setShowVeiculoForm(true);
  };

  const handleVeiculoCadastrado = async (novoVeiculo) => {
    if (novoVeiculo.id) {
      handleInputChange(tipoVeiculoCadastro + "_id", novoVeiculo.id);
      setVeiculoSearchTerm(prev => ({ ...prev, [tipoVeiculoCadastro]: novoVeiculo.placa }));
      setItemsEncontrados(prev => ({ ...prev, [tipoVeiculoCadastro]: novoVeiculo }));
    } else {
      setVeiculoSearchTerm(prev => ({ ...prev, [tipoVeiculoCadastro]: "" }));
      setItemsEncontrados(prev => ({ ...prev, [tipoVeiculoCadastro]: null }));
    }
    setShowVeiculoForm(false);
    setTipoVeiculoCadastro(null);
    setPlacaParaCadastro("");
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

      const motorista = motoristas.find(m => m.id === formData.motorista_id);
      if (motorista) {
        const updatedMotorista = { ...motorista, ...updateData };
        const cavalo = veiculos.find(v => v.id === updatedMotorista.cavalo_id);
        const implementos = [
          veiculos.find(v => v.id === updatedMotorista.implemento1_id),
          veiculos.find(v => v.id === updatedMotorista.implemento2_id),
          veiculos.find(v => v.id === updatedMotorista.implemento3_id)
        ].filter(Boolean);
        setMotoristaVeiculos({ cavalo: cavalo || null, implementos: implementos });
      }
    } catch (error) {
      console.error("Erro ao atualizar ficha do motorista:", error);
    } finally {
      setAtualizandoFicha(false);
    }
  };

  const handleImportarPDF = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImportando(true);
    setImportError(null);
    setImportSuccess(false);

    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });

      const ordemSchema = {
        type: "object",
        properties: {
          numero_ordem: { type: "string", description: "Número da ordem de carregamento (ex: 326)" },
          motorista_nome: { type: "string", description: "Nome completo do motorista" },
          motorista_cnh: { type: "string", description: "CNH do motorista" },
          motorista_cpf: { type: "string", description: "CPF do motorista" },
          motorista_rg: { type: "string", description: "RG do motorista" },
          vencimento_cnh: { type: "string", description: "Data de vencimento da CNH (DD/MM/YYYY)" },
          cavalo_placa: { type: "string", description: "Placa do veículo cavalo" },
          cavalo_renavam: { type: "string", description: "Renavam do cavalo" },
          implemento1_placa: { type: "string", description: "Placa do primeiro reboque/implemento" },
          implemento1_renavam: { type: "string", description: "Renavam do primeiro implemento" },
          implemento2_placa: { type: "string", description: "Placa do segundo reboque/implemento" },
          implemento2_renavam: { type: "string", description: "Renavam do segundo implemento" },
          implemento3_placa: { type: "string", description: "Placa do terceiro reboque/implemento" },
          implemento3_renavam: { type: "string", description: "Renavam do terceiro implemento" },
          origem_cidade: { type: "string", description: "Nome da cidade de ORIGEM/COLETA" },
          origem_uf: { type: "string", description: "UF de origem" },
          destino_cidade: { type: "string", description: "Nome completo da cidade de DESTINO" },
          destino_uf: { type: "string", description: "UF de destino" },
          coleta_razao_social: { type: "string", description: "Razão social do local de COLETA" },
          coleta_cnpj: { type: "string", description: "CNPJ/CPF do local de coleta" },
          coleta_endereco: { type: "string", description: "Endereço completo do local de COLETA/ORIGEM" },
          coleta_cep: { type: "string", description: "CEP do local de coleta" },
          destinatario_razao_social: { type: "string", description: "Razão social do DESTINATÁRIO" },
          destinatario_cnpj: { type: "string", description: "CNPJ do destinatário" },
          destinatario_endereco: { type: "string", description: "Endereço completo de DESTINO/ENTREGA" },
          destinatario_cep: { type: "string", description: "CEP do DESTINATÁRIO/local de entrega" },
          destinatario_cidade: { type: "string", description: "Cidade completa do DESTINATÁRIO" },
          destinatario_uf: { type: "string", description: "UF do destinatário" },
          produto: { type: "string", description: "Descrição do produto/mercadoria" },
          peso: { type: "string", description: "Peso da carga em toneladas ou kg" },
          volumes: { type: "string", description: "Quantidade de volumes/bags" },
          pedido_numero: { type: "string", description: "Número do pedido" },
          observacoes: { type: "string", description: "Observações sobre a carga" }
        },
        required: ["motorista_nome", "cavalo_placa", "coleta_razao_social", "origem_cidade", "destino_cidade", "produto", "peso"]
      };

      const result = await base44.integrations.Core.ExtractDataFromUploadedFile({
        file_url,
        json_schema: ordemSchema
      });

      if (result.status !== "success" || !result.output) {
        throw new Error("Não foi possível extrair os dados do PDF.");
      }

      const dados = result.output;

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

      const veiculosIds = { cavalo: null, implemento1: null, implemento2: null, implemento3: null };
      let currentVeiculosList = [...veiculos];

      const findOrCreateVeiculo = async (placa, renavam, tipo) => {
        if (!placa) return null;
        const placaLimpa = placa.toUpperCase().replace(/[^A-Z0-9]/g, '');
        let veiculoObj = currentVeiculosList.find(v =>
          v.placa?.toUpperCase().replace(/[^A-Z0-9]/g, '') === placaLimpa
        );

        if (veiculoObj) {
          return veiculoObj.id;
        } else {
          const novoVeiculo = await base44.entities.Veiculo.create({
            placa: placa,
            tipo: tipo,
            marca: "A definir",
            modelo: "A definir",
            renavam: renavam || "",
            status: "disponível"
          });
          currentVeiculosList.push(novoVeiculo);
          return novoVeiculo.id;
        }
      };

      veiculosIds.cavalo = await findOrCreateVeiculo(dados.cavalo_placa, dados.cavalo_renavam, "cavalo");
      veiculosIds.implemento1 = await findOrCreateVeiculo(dados.implemento1_placa, dados.implemento1_renavam, "semi-reboque");
      veiculosIds.implemento2 = await findOrCreateVeiculo(dados.implemento2_placa, dados.implemento2_renavam, "semi-reboque");
      veiculosIds.implemento3 = await findOrCreateVeiculo(dados.implemento3_placa, dados.implemento3_renavam, "semi-reboque");

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

      setFormData(prev => ({
        ...prev,
        cliente: dados.coleta_razao_social || prev.cliente,
        cliente_cnpj: dados.coleta_cnpj || prev.cliente_cnpj,
        origem: dados.origem_cidade || prev.origem,
        origem_uf: dados.origem_uf || prev.origem_uf,
        origem_endereco: dados.coleta_endereco || prev.origem_endereco,
        origem_cep: normalizarCEP(dados.coleta_cep) || prev.origem_cep,
        origem_cidade: dados.origem_cidade || prev.origem_cidade,
        destino: dados.destinatario_cidade || dados.destino_cidade || prev.destino,
        destino_uf: dados.destinatario_uf || dados.destino_uf || prev.destino_uf,
        destinatario: dados.destinatario_razao_social || prev.destinatario,
        destinatario_cnpj: dados.destinatario_cnpj || prev.destinatario_cnpj,
        destino_endereco: dados.destinatario_endereco || prev.destino_endereco,
        destino_cep: normalizarCEP(dados.destinatario_cep) || prev.destino_cep,
        destino_cidade: dados.destinatario_cidade || dados.destino_cidade || prev.destino_cidade,
        produto: dados.produto || prev.produto,
        peso: pesoKg || prev.peso,
        volumes: volumesNum || prev.volumes,
        motorista_id: motoristaId || prev.motorista_id,
        cavalo_id: veiculosIds.cavalo || prev.cavalo_id,
        implemento1_id: veiculosIds.implemento1 || prev.implemento1_id,
        implemento2_id: veiculosIds.implemento2 || prev.implemento2_id,
        implemento3_id: veiculosIds.implemento3 || prev.implemento3_id,
        viagem_pedido: dados.pedido_numero || prev.viagem_pedido,
        numero_oc: dados.numero_ordem || prev.numero_oc,
        observacao_carga: dados.observacoes || prev.observacao_carga
      }));

      if (motoristaEncontradoOuCriado) {
        setMotoristaSearchTerm(motoristaEncontradoOuCriado.nome);
        setMotoristaTelefone(motoristaEncontradoOuCriado.celular || "");
        setItemsEncontrados(prev => ({ ...prev, motorista: motoristaEncontradoOuCriado }));
        const cavaloFound = currentVeiculosList.find(v => v.id === motoristaEncontradoOuCriado.cavalo_id);
        const implementosFound = [
          currentVeiculosList.find(v => v.id === motoristaEncontradoOuCriado.implemento1_id),
          currentVeiculosList.find(v => v.id === motoristaEncontradoOuCriado.implemento2_id),
          currentVeiculosList.find(v => v.id === motoristaEncontradoOuCriado.implemento3_id)
        ].filter(Boolean);
        setMotoristaVeiculos({ cavalo: cavaloFound || null, implementos: implementosFound });
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

      if (editingOrdem && editingOrdem.tipo_registro === "oferta" && motoristaId) {
        await base44.entities.OrdemDeCarregamento.update(editingOrdem.id, {
          tipo_registro: "ordem_completa"
        });
      }

    } catch (error) {
      console.error("Erro ao importar PDF:", error);
      setImportError(error.message || "Erro ao processar o PDF.");
    } finally {
      setImportando(false);
      if (pdfInputRef.current) {
        pdfInputRef.current.value = '';
      }
    }
  };

  const handleSalvarTelefone = async () => {
    if (!formData.motorista_id || !motoristaTelefone) return;

    setSalvandoTelefone(true);
    try {
      await base44.entities.Motorista.update(formData.motorista_id, {
        celular: motoristaTelefone
      });
      setEditandoTelefone(false);
      setItemsEncontrados(prev => ({
        ...prev,
        motorista: { ...prev.motorista, celular: motoristaTelefone }
      }));
    } catch (error) {
      console.error("Erro ao atualizar telefone:", error);
      alert("Erro ao atualizar telefone do motorista");
    } finally {
      setSalvandoTelefone(false);
    }
  };

  const handleWhatsAppClick = () => {
    if (!motoristaTelefone) {
      alert("Adicione o telefone do motorista primeiro!");
      return;
    }

    const telefone = motoristaTelefone.replace(/\D/g, '');
    const motorista = motoristas.find(m => m.id === formData.motorista_id);
    const cavalo = veiculos.find(v => v.id === formData.cavalo_id);
    const impl1 = veiculos.find(v => v.id === formData.implemento1_id);
    const impl2 = veiculos.find(v => v.id === formData.implemento2_id);
    const impl3 = veiculos.find(v => v.id === formData.implemento3_id);

    let placasTexto = cavalo ? `🚛 Cavalo: ${cavalo.placa}` : '';
    if (impl1) placasTexto += `\n🚚 Implemento 1: ${impl1.placa}`;
    if (impl2) placasTexto += `\n🚚 Implemento 2: ${impl2.placa}`;
    if (impl3) placasTexto += `\n🚚 Implemento 3: ${impl3.placa}`;

    const mensagem = `📋 *ORDEM DE CARREGAMENTO*
${editingOrdem ? `Nº: ${editingOrdem.numero_carga}` : 'Nova Ordem'}

👤 *Motorista:* ${motorista?.nome || 'Não informado'}

${placasTexto}

📦 *COLETA (Remetente)*
${formData.cliente || 'Não informado'}
${formData.cliente_cnpj ? `CNPJ: ${formData.cliente_cnpj}` : ''}
📍 ${formData.origem_endereco || formData.origem || 'Não informado'}
${formData.origem_cidade ? `${formData.origem_cidade}/${formData.origem_uf || ''}` : ''}
${formData.origem_cep ? `CEP: ${formData.origem_cep}` : ''}

🎯 *ENTREGA (Destinatário)*
${formData.destinatario || formData.destino || 'Não informado'}
${formData.destinatario_cnpj ? `CNPJ: ${formData.destinatario_cnpj}` : ''}
📍 ${formData.destino_endereco || 'Não informado'}
${formData.destino_cidade ? `${formData.destino_cidade}/${formData.destino_uf || ''}` : ''}
${formData.destino_cep ? `CEP: ${formData.destino_cep}` : ''}

📦 *Produto:* ${formData.produto || 'Não informado'}
⚖️ *Peso:* ${formData.peso ? `${parseFloat(formData.peso).toLocaleString()} kg` : 'Não informado'}
${formData.observacao_carga ? `\n📝 *Obs:* ${formData.observacao_carga}` : ''}`.trim();

    const whatsappUrl = `https://wa.me/55${telefone}?text=${encodeURIComponent(mensagem)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleSubmit = (e) => {
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
      volumes: formData.volumes ? parseInt(formData.volumes) : null,
      qtd_entregas: formData.qtd_entregas ? parseInt(formData.qtd_entregas) : 1,
      cliente_final_nome: clienteFinalNome,
      cliente_final_cnpj: clienteFinalCnpj,
      valor_total_frete: precificacaoCalculada?.valor_total || valorTotal
    };
    onSubmit(dataToSubmit);
  };

  const isFormValid = () => {
    const hasPriceMethod = (!!formData.valor_tonelada && parseFloat(formData.valor_tonelada) > 0 && parseFloat(formData.peso) > 0) ||
                          (!!formData.frete_viagem && parseFloat(formData.frete_viagem) > 0);
    return formData.cliente && formData.origem && formData.destino &&
           formData.produto && parseFloat(formData.peso) > 0 &&
           hasPriceMethod && formData.motorista_id &&
           motoristaTelefone &&
           formData.operacao_id;
  };

  const getFieldError = (fieldName) => {
    if (!showValidation) return null;

    switch(fieldName) {
      case 'cliente': return !formData.cliente ? 'Cliente/Remetente é obrigatório' : null;
      case 'origem': return !formData.origem ? 'Local de Coleta é obrigatório' : null;
      case 'destino': return !formData.destino ? 'Local de Entrega é obrigatória' : null;
      case 'produto': return !formData.produto ? 'Produto é obrigatório' : null;
      case 'peso': return !formData.peso || parseFloat(formData.peso) <= 0 ? 'Peso deve ser maior que zero' : null;
      case 'motorista': return !formData.motorista_id ? 'Selecione um motorista' : null;
      case 'telefone': return !motoristaTelefone ? 'Telefone do motorista é obrigatório' : null;
      case 'operacao': return !formData.operacao_id ? 'Selecione uma operação' : null;
      case 'preco':
        const hasPriceMethod = (!!formData.valor_tonelada && parseFloat(formData.valor_tonelada) > 0) ||
                              (!!formData.frete_viagem && parseFloat(formData.frete_viagem) > 0);
        return !hasPriceMethod ? 'Informe Valor/Tonelada OU Frete Viagem' : null;
      default: return null;
    }
  };

  const handleSubmitWithValidation = (e) => {
    e.preventDefault();
    setShowValidation(true);

    if (!isFormValid()) {
      setTimeout(() => {
        const firstErrorLabel = document.querySelector('label.text-red-600');
        const firstErrorInput = document.querySelector('input.border-red-500, select.border-red-500, button.border-red-500');
        const firstErrorP = document.querySelector('p.text-red-600');

        let firstErrorElement = null;
        if (firstErrorLabel) firstErrorElement = firstErrorLabel;
        if (firstErrorInput && (!firstErrorElement || firstErrorInput.offsetTop < firstErrorElement.offsetTop)) firstErrorElement = firstErrorInput;
        if (firstErrorP && (!firstErrorElement || firstErrorP.offsetTop < firstErrorElement.offsetTop)) firstErrorElement = firstErrorP;

        if (firstErrorElement) {
          let currentElement = firstErrorElement;
          while (currentElement && !currentElement.classList.contains('tab-content-container')) {
            if (currentElement.closest('[data-state="inactive"][role="tabpanel"]')) {
              const inactiveTabPanel = currentElement.closest('[data-state="inactive"][role="tabpanel"]');
              const tabId = inactiveTabPanel.id;
              const triggerButton = document.querySelector(`[aria-controls="${tabId}"]`);
              if (triggerButton) {
                const value = triggerButton.getAttribute('value');
                if (value) {
                  setActiveTab(value);
                }
              }
              break;
            }
            currentElement = currentElement.parentElement;
          }
          firstErrorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
      return;
    }
    handleSubmit(e);
  };

  const renderBuscaMotorista = () => {
    const motoristaEncontrado = itemsEncontrados.motorista;

    return (
      <div>
        <Label htmlFor="motorista" className={getFieldError('motorista') ? 'text-red-600 font-semibold' : ''}>
          Motorista *
          {getFieldError('motorista') && <span className="ml-2 text-xs">⚠️</span>}
        </Label>
        <Popover open={openMotoristaCombo} onOpenChange={setOpenMotoristaCombo}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              className={cn(
                "w-full justify-between",
                motoristaEncontrado ? "border-green-500 bg-green-50" : (getFieldError('motorista') ? 'border-red-500 border-2 bg-red-50' : '')
              )}
            >
              {motoristaEncontrado ? (
                <span className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  {motoristaEncontrado.nome}
                </span>
              ) : (
                <span className="text-gray-500">Selecione ou busque um motorista...</span>
              )}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
            <Command shouldFilter={false}>
              <CommandInput
                placeholder="Digite nome, CPF ou CNH..."
                value={motoristaSearchTerm}
                onValueChange={setMotoristaSearchTerm}
              />
              <CommandList>
                <CommandEmpty>
                  {motoristaSearchTerm.length < 2 ? (
                    "Digite pelo menos 2 caracteres"
                  ) : (
                    <div className="p-4 text-center">
                      <p className="text-sm text-gray-600 mb-3">Nenhum motorista encontrado</p>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setOpenMotoristaCombo(false);
                          abrirCadastroMotorista(motoristaSearchTerm);
                        }}
                        className="w-full bg-blue-50 border-blue-200 text-blue-700"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Cadastrar Novo Motorista
                      </Button>
                    </div>
                  )}
                </CommandEmpty>
                <CommandGroup>
                  {filteredMotoristas.slice(0, 10).map((motorista) => (
                    <CommandItem
                      key={motorista.id}
                      value={motorista.id}
                      onSelect={() => handleMotoristaSelect(motorista.id)}
                      className="cursor-pointer"
                    >
                      <Check className={cn("mr-2 h-4 w-4", formData.motorista_id === motorista.id ? "opacity-100" : "opacity-0")} />
                      <div className="flex flex-col">
                        <span className="font-medium">{motorista.nome}</span>
                        <span className="text-xs text-gray-500">CNH: {motorista.cnh} | CPF: {motorista.cpf}</span>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>

        {getFieldError('motorista') && (
          <p className="text-xs text-red-600 mt-1 font-medium">{getFieldError('motorista')}</p>
        )}

        {motoristaEncontrado && (
          <div className="mt-3">
            <div className="flex items-start justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex-1">
                <p className="text-sm text-green-800 font-medium flex items-center gap-2 mb-1">
                  <CheckCircle className="w-4 h-4" />
                  CNH: {motoristaEncontrado.cnh}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <span className={`text-sm font-medium ${getFieldError('telefone') ? 'text-red-600' : 'text-green-700'}`}>
                    📱 Tel: *
                    {getFieldError('telefone') && <span className="ml-2 text-xs">⚠️</span>}
                  </span>
                  {editandoTelefone ? (
                    <div className="flex items-center gap-2 flex-1">
                      <Input
                        type="tel"
                        value={motoristaTelefone}
                        onChange={(e) => setMotoristaTelefone(e.target.value)}
                        placeholder="(11) 99999-9999"
                        className={`h-8 text-sm flex-1 ${getFieldError('telefone') ? 'border-red-500 border-2 bg-red-50' : ''}`}
                        autoFocus
                      />
                      <Button type="button" size="sm" onClick={handleSalvarTelefone} disabled={salvandoTelefone || !motoristaTelefone} className="h-8 bg-green-600">
                        {salvandoTelefone ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                      </Button>
                      <Button type="button" size="sm" variant="ghost" onClick={() => {
                        setEditandoTelefone(false);
                        setMotoristaTelefone(motoristaEncontrado.celular || "");
                      }} className="h-8 p-0 px-2">
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
                      {motoristaTelefone && (
                        <Button type="button" size="sm" onClick={handleWhatsAppClick} className="h-6 bg-green-600 text-xs px-2">
                          <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                          </svg>
                          WhatsApp
                        </Button>
                      )}
                    </div>
                  )}
                </div>
                {getFieldError('telefone') && (
                  <p className="text-xs text-red-600 mt-1 font-medium">{getFieldError('telefone')}</p>
                )}
              </div>
              <Button type="button" variant="ghost" size="sm" onClick={handleMotoristaClear} className="h-7 text-xs text-gray-500 hover:text-red-600 ml-2">
                <X className="w-3 h-3 mr-1" />Limpar
              </Button>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderBuscaVeiculo = (tipo, label) => {
    const veiculoEncontrado = itemsEncontrados[tipo];
    const temMotorista = !!formData.motorista_id;

    let registeredVehicleId = null;
    if (tipo === 'cavalo') {
      registeredVehicleId = motoristaVeiculos.cavalo?.id;
    } else {
      const implementoIndex = parseInt(tipo.replace('implemento', '')) - 1;
      registeredVehicleId = motoristaVeiculos.implementos[implementoIndex]?.id;
    }
    const isVinculado = veiculoEncontrado?.id === registeredVehicleId;

    return (
      <div>
        <Label htmlFor={tipo} className={!temMotorista ? 'text-gray-400' : ''}>
          {label}
          {!temMotorista && <span className="text-xs ml-2">(Selecione um motorista primeiro)</span>}
        </Label>
        <Popover open={openVeiculoCombo[tipo]} onOpenChange={(open) => setOpenVeiculoCombo(prev => ({ ...prev, [tipo]: open }))}>
          <PopoverTrigger asChild>
            <Button variant="outline" role="combobox" disabled={!temMotorista}
              className={cn("w-full justify-between", veiculoEncontrado ? "border-green-500 bg-green-50" : "")}>
              {veiculoEncontrado ? (
                <span className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  {veiculoEncontrado.placa}
                </span>
              ) : (
                <span className="text-gray-500">Busque ou digite a placa...</span>
              )}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
            <Command shouldFilter={false}>
              <CommandInput
                placeholder="Digite a placa..."
                value={veiculoSearchTerm[tipo]}
                onValueChange={(value) => setVeiculoSearchTerm(prev => ({ ...prev, [tipo]: value.toUpperCase() }))}
              />
              <CommandList>
                <CommandEmpty>
                  {veiculoSearchTerm[tipo].length < 2 ? "Digite pelo menos 2 caracteres" : (
                    <div className="p-4 text-center">
                      <p className="text-sm text-gray-600 mb-3">Nenhum veículo encontrado</p>
                      <Button type="button" variant="outline" size="sm"
                        onClick={() => {
                          setOpenVeiculoCombo(prev => ({ ...prev, [tipo]: false }));
                          abrirCadastroVeiculo(tipo, veiculoSearchTerm[tipo]);
                        }}
                        className="w-full bg-blue-50 border-blue-200 text-blue-700">
                        <Plus className="w-4 h-4 mr-2" />Cadastrar {label}
                      </Button>
                    </div>
                  )}
                </CommandEmpty>
                <CommandGroup>
                  {getFilteredVeiculos(tipo).slice(0, 10).map((veiculo) => (
                    <CommandItem key={veiculo.id} value={veiculo.id} onSelect={() => handleVeiculoSelect(tipo, veiculo.id)} className="cursor-pointer">
                      <Check className={cn("mr-2 h-4 w-4", formData[`${tipo}_id`] === veiculo.id ? "opacity-100" : "opacity-0")} />
                      <div className="flex flex-col">
                        <span className="font-medium">{veiculo.placa}</span>
                        <span className="text-xs text-gray-500">{veiculo.marca} {veiculo.modelo}</span>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>

        {veiculoEncontrado && (
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-2">
              {isVinculado && <CheckCircle className="w-3 h-3 text-green-600" />}
              <p className={`text-sm ${isVinculado ? 'text-green-600 font-medium' : 'text-gray-600'}`}>
                {isVinculado && '✓ '}{veiculoEncontrado.marca} {veiculoEncontrado.modelo}
              </p>
            </div>
            <Button type="button" variant="ghost" size="sm" onClick={() => handleVeiculoClear(tipo)} className="h-7 text-xs text-gray-500 hover:text-red-600">
              <X className="w-3 h-3 mr-1" />Limpar
            </Button>
          </div>
        )}
      </div>
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

  const handleOperacaoSelect = (operacaoId) => {
    const operacao = operacoes.find(op => op.id === operacaoId);
    if (operacao) {
      handleInputChange("operacao_id", operacao.id);
      setOperacaoSearchTerm(operacao.nome);
      setOperacaoEncontrada(operacao);
      setOpenOperacaoCombo(false);
    }
  };

  const handleOperacaoClear = () => {
    handleInputChange("operacao_id", "");
    setOperacaoSearchTerm("");
    setOperacaoEncontrada(null);
  };

  const abrirCadastroOperacao = () => {
    setShowOperacaoForm(true);
  };

  const handleOperacaoCadastrada = async (novaOperacao) => {
    try {
      const operacoesAtualizadas = await base44.entities.Operacao.list();
      setOperacoes(operacoesAtualizadas.filter(op => op.ativo));
      const operacaoCriada = operacoesAtualizadas.find(op => op.id === novaOperacao.id);
      if (operacaoCriada) {
        setOperacaoEncontrada(operacaoCriada);
        handleInputChange("operacao_id", operacaoCriada.id);
        setOperacaoSearchTerm(operacaoCriada.nome);
      }
      setShowOperacaoForm(false);
    } catch (error) {
      console.error("Erro ao atualizar operações:", error);
    }
  };

  const getPrioridadeBadge = (prioridade) => {
    const colors = {
      baixa: "bg-gray-100 text-gray-700", media: "bg-blue-100 text-blue-700",
      alta: "bg-orange-100 text-orange-700", urgente: "bg-red-100 text-red-700"
    };
    return colors[prioridade] || colors.media;
  };

  const getModalidadeBadge = (modalidade) => {
    const colors = { normal: "bg-green-100 text-green-700", expresso: "bg-purple-100 text-purple-700" };
    return colors[modalidade] || colors.normal;
  };

  const isOferta = editingOrdem?.tipo_registro === "oferta";
  const semMotorista = editingOrdem && !editingOrdem.motorista_id;
  const mostrarUploadPDF = !editingOrdem || isOferta || semMotorista;

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle>
                {editingOrdem ? (
                  <div className="flex items-center gap-2">
                    Editar Ordem de Carregamento
                    {isOferta && (
                      <Badge className="bg-green-100 text-green-700 border-green-300">
                        Oferta - Complete os Dados
                      </Badge>
                    )}
                    {!isOferta && semMotorista && (
                      <Badge className="bg-yellow-100 text-yellow-700 border-yellow-300">
                        Sem Motorista - Importe PDF
                      </Badge>
                    )}
                  </div>
                ) : (
                  "Nova Ordem de Carregamento"
                )}
              </DialogTitle>
            </div>
          </DialogHeader>

          {mostrarUploadPDF && (
            <div className="mb-4">
              <div className="border-2 border-dashed border-blue-300 rounded-lg p-6 bg-blue-50 hover:bg-blue-100 transition-colors">
                <div className="text-center">
                  <FileUp className="w-12 h-12 mx-auto mb-3 text-blue-600" />
                  <h3 className="text-lg font-semibold mb-2 text-blue-900">
                    {isOferta
                      ? "Completar Ordem com PDF do ERP"
                      : semMotorista
                        ? "Adicionar Motorista e Veículo via PDF"
                        : "Importar Ordem do ERP"}
                  </h3>
                  <p className="text-sm text-blue-700 mb-4">
                    {isOferta
                      ? "Faça upload do PDF para adicionar motorista, veículo e completar os dados"
                      : semMotorista
                        ? "Faça upload do PDF para preencher motorista e veículos"
                        : "Faça upload do PDF para preencher automaticamente"}
                  </p>
                  <input ref={pdfInputRef} type="file" accept=".pdf" onChange={handleImportarPDF} className="hidden" disabled={importando} />
                  <Button type="button" onClick={() => pdfInputRef.current?.click()} disabled={importando} className="bg-blue-600">
                    {importando ? (
                      <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Processando PDF...</>
                    ) : (
                      <><FileUp className="w-4 h-4 mr-2" />Selecionar PDF da Ordem</>
                    )}
                  </Button>
                </div>
              </div>

              {importError && (
                <Alert variant="destructive" className="mt-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{importError}</AlertDescription>
                </Alert>
              )}

              {importSuccess && (
                <Alert className="mt-4 bg-green-50 border-green-200">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    ✅ Dados importados com sucesso!
                    {isOferta && " A oferta será convertida em ordem completa ao salvar."}
                  </AlertDescription>
                </Alert>
              )}

              {importando && (
                <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                    <div>
                      <p className="font-medium text-blue-900">Importando dados...</p>
                      <p className="text-sm text-blue-700">Extraindo informações...</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="basicos" className="relative">
                Dados Básicos
                {showValidation && (getFieldError('motorista') || getFieldError('telefone') || getFieldError('operacao') || getFieldError('preco')) && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full" />
                )}
              </TabsTrigger>
              <TabsTrigger value="origem" className="relative">
                Origem
                {showValidation && (getFieldError('cliente') || getFieldError('origem')) && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full" />
                )}
              </TabsTrigger>
              <TabsTrigger value="destino" className="relative">
                Destino
                {showValidation && getFieldError('destino') && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full" />
                )}
              </TabsTrigger>
              <TabsTrigger value="carga" className="relative">
                Carga
                {showValidation && (getFieldError('produto') || getFieldError('peso') || getFieldError('preco')) && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full" />
                )}
              </TabsTrigger>
              <TabsTrigger value="precificacao">
                Precificação
              </TabsTrigger>
            </TabsList>

            <TabsContent value="basicos" className="space-y-4 tab-content-container">
              <div>
                <Label htmlFor="operacao" className={getFieldError('operacao') ? 'text-red-600 font-semibold' : ''}>
                  Operação *
                  {getFieldError('operacao') && <span className="ml-2 text-xs">⚠️</span>}
                </Label>
                <Popover open={openOperacaoCombo} onOpenChange={setOpenOperacaoCombo}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" role="combobox"
                      className={cn(
                        "w-full justify-between",
                        operacaoEncontrada ? "border-green-500 bg-green-50" : (getFieldError('operacao') ? 'border-red-500 border-2 bg-red-50' : '')
                      )}>
                      {operacaoEncontrada ? (
                        <span className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />{operacaoEncontrada.nome}
                        </span>
                      ) : (
                        <span className="text-gray-500">Busque ou cadastre uma operação...</span>
                      )}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
                    <Command shouldFilter={false}>
                      <CommandInput placeholder="Digite o nome ou código..." value={operacaoSearchTerm} onValueChange={setOperacaoSearchTerm} />
                      <CommandList>
                        <CommandEmpty>
                          {operacaoSearchTerm.length < 2 ? "Digite pelo menos 2 caracteres" : (
                            <div className="p-4 text-center">
                              <p className="text-sm text-gray-600 mb-3">Nenhuma operação encontrada</p>
                              <Button type="button" variant="outline" size="sm"
                                onClick={() => { setOpenOperacaoCombo(false); abrirCadastroOperacao(); }}
                                className="w-full bg-blue-50 border-blue-200 text-blue-700">
                                <Plus className="w-4 h-4 mr-2" />Cadastrar Nova Operação
                              </Button>
                            </div>
                          )}
                        </CommandEmpty>
                        <CommandGroup>
                          {getFilteredOperacoes().slice(0, 10).map((operacao) => (
                            <CommandItem key={operacao.id} value={operacao.id} onSelect={() => handleOperacaoSelect(operacao.id)} className="cursor-pointer">
                              <Check className={cn("mr-2 h-4 w-4", formData.operacao_id === operacao.id ? "opacity-100" : "opacity-0")} />
                              <div className="flex items-center justify-between flex-1">
                                <div className="flex flex-col">
                                  <span className="font-medium">{operacao.nome}</span>
                                  {operacao.codigo && <span className="text-xs text-gray-500">{operacao.codigo}</span>}
                                </div>
                                <div className="flex items-center gap-1">
                                  <Badge className={`text-xs ${getModalidadeBadge(operacao.modalidade)}`}>
                                    {operacao.modalidade === 'expresso' ? <><Zap className="w-3 h-3 mr-1" />Expresso</> : 'Normal'}
                                  </Badge>
                                  <Badge className={`text-xs ${getPrioridadeBadge(operacao.prioridade)}`}>{operacao.prioridade}</Badge>
                                </div>
                              </div>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>

                {getFieldError('operacao') && (
                  <p className="text-xs text-red-600 mt-1 font-medium">{getFieldError('operacao')}</p>
                )}

                {operacaoEncontrada && (
                  <div className="flex items-center justify-between mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <div>
                        <p className="text-sm font-medium text-green-900">{operacaoEncontrada.nome}</p>
                        {operacaoEncontrada.codigo && <p className="text-xs text-green-700">{operacaoEncontrada.codigo}</p>}
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={`text-xs ${getModalidadeBadge(operacaoEncontrada.modalidade)}`}>
                          {operacaoEncontrada.modalidade === 'expresso' ? <><Zap className="w-3 h-3 mr-1" />Expresso</> : 'Normal'}
                        </Badge>
                        <Badge className={`text-xs ${getPrioridadeBadge(operacaoEncontrada.prioridade)}`}>
                          Prioridade: {operacaoEncontrada.prioridade}
                        </Badge>
                      </div>
                    </div>
                    <Button type="button" variant="ghost" size="sm" onClick={handleOperacaoClear} className="h-7 text-xs text-gray-500 hover:text-red-600">
                      <X className="w-3 h-3 mr-1" />Limpar
                    </Button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="modalidade_carga">Modalidade da Carga</Label>
                  <Select value={formData.modalidade_carga} onValueChange={(value) => handleInputChange("modalidade_carga", value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {modalidadeCargaOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="frota">Tipo de Frota</Label>
                  <Select value={formData.frota} onValueChange={(value) => handleInputChange("frota", value)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {frotaOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {renderBuscaMotorista()}

              <div className="border-t pt-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-gray-700">Veículos da Operação</h3>
                  {formData.motorista_id && veiculosAlterados && (
                    <Button type="button" variant="outline" size="sm" onClick={handleAtualizarFichaMotorista} disabled={atualizandoFicha}
                      className="flex items-center gap-2 bg-blue-50 border-blue-200 text-blue-700">
                      <RefreshCw className={`w-4 h-4 ${atualizandoFicha ? 'animate-spin' : ''}`} />
                      {atualizandoFicha ? 'Atualizando...' : 'Atualizar Ficha do Motorista'}
                    </Button>
                  )}
                </div>

                {formData.motorista_id && veiculosAlterados && (
                  <Alert className="bg-yellow-50 border-yellow-200">
                    <AlertCircle className="w-4 h-4 text-yellow-600" />
                    <AlertDescription className="text-yellow-800">
                      As placas selecionadas são diferentes do cadastro. Clique em "Atualizar Ficha do Motorista".
                    </AlertDescription>
                  </Alert>
                )}

                <div className="grid grid-cols-2 gap-4">
                  {renderBuscaVeiculo("cavalo", "Cavalo")}
                  {renderBuscaVeiculo("implemento1", "Implemento 1")}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {renderBuscaVeiculo("implemento2", "Implemento 2")}
                  {renderBuscaVeiculo("implemento3", "Implemento 3")}
                </div>
              </div>

              {motoristaVeiculos.cavalo && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-green-900">Veículos cadastrados no motorista</p>
                      <div className="mt-2 space-y-1 text-sm text-green-800">
                        <div className="flex items-center gap-2">
                          <Truck className="w-4 h-4" />
                          <span className="font-medium">Cavalo:</span>
                          <span>{motoristaVeiculos.cavalo.placa} - {motoristaVeiculos.cavalo.marca} {motoristaVeiculos.cavalo.modelo}</span>
                        </div>
                        {motoristaVeiculos.implementos.length > 0 && (
                          <div className="ml-6 space-y-1">
                            {motoristaVeiculos.implementos.map((impl, index) => (
                              <div key={impl.id} className="flex items-center gap-2">
                                <span className="text-xs">•</span>
                                <span className="font-medium">Implemento {index + 1}:</span>
                                <span>{impl.placa} - {impl.marca} {impl.modelo}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="tipo_operacao">Tipo Operação</Label>
                  <Select value={formData.tipo_operacao} onValueChange={(value) => handleInputChange("tipo_operacao", value)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {tipoOperacaoOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="viagem_pedido">Viagem/Pedido Nº</Label>
                  <Input id="viagem_pedido" value={formData.viagem_pedido} onChange={(e) => handleInputChange("viagem_pedido", e.target.value)} placeholder="Número" />
                </div>
                <div>
                  <Label htmlFor="notas_fiscais">Notas Fiscais</Label>
                  <Input id="notas_fiscais" value={formData.notas_fiscais} onChange={(e) => handleInputChange("notas_fiscais", e.target.value)} placeholder="Números das NFs" />
                </div>
              </div>

              <div className="grid grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="senha_fila" className="flex items-center gap-2">
                    Senha Fila
                    <label className="flex items-center gap-1 cursor-pointer ml-2">
                      <input
                        type="checkbox"
                        checked={formData.carga_dedicada}
                        onChange={(e) => {
                          handleInputChange("carga_dedicada", e.target.checked);
                          if (e.target.checked) {
                            handleInputChange("senha_fila", "DEDI");
                          } else {
                            handleInputChange("senha_fila", "");
                          }
                        }}
                        className="w-4 h-4"
                      />
                      <span className="text-xs text-purple-600 font-semibold">Dedicada</span>
                    </label>
                  </Label>
                  <Input 
                    id="senha_fila" 
                    value={formData.senha_fila} 
                    onChange={(e) => handleInputChange("senha_fila", e.target.value)} 
                    placeholder={formData.carga_dedicada ? "DEDI" : "4 dígitos"} 
                    maxLength={6}
                    disabled={formData.carga_dedicada}
                    className={`font-mono font-bold ${formData.carga_dedicada ? 'bg-purple-50 text-purple-700' : ''}`}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {formData.carga_dedicada ? "Carga dedicada (não usa Fila X)" : "Vincular com marcação da Fila X"}
                  </p>
                </div>
                <div>
                  <Label htmlFor="duv">DUV</Label>
                  <Input id="duv" value={formData.duv} onChange={(e) => handleInputChange("duv", e.target.value)} placeholder="Número DUV" />
                </div>
                <div>
                  <Label htmlFor="numero_oc">Número OC</Label>
                  <Input id="numero_oc" value={formData.numero_oc} onChange={(e) => handleInputChange("numero_oc", e.target.value)} placeholder="Número da OC" />
                </div>
                <div>
                  <Label htmlFor="solicitado_por">Solicitado Por</Label>
                  <Input id="solicitado_por" value={formData.solicitado_por} onChange={(e) => handleInputChange("solicitado_por", e.target.value)} placeholder="Nome" />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="origem" className="space-y-4 tab-content-container">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="cliente" className={getFieldError('cliente') ? 'text-red-600 font-semibold' : ''}>
                    Cliente/Remetente *
                    {getFieldError('cliente') && <span className="ml-2 text-xs">⚠️</span>}
                  </Label>
                  <Input id="cliente" value={formData.cliente} onChange={(e) => handleInputChange("cliente", e.target.value)}
                    placeholder="Nome do cliente/remetente" required
                    className={getFieldError('cliente') ? 'border-red-500 border-2 bg-red-50' : ''} />
                  {getFieldError('cliente') && <p className="text-xs text-red-600 mt-1 font-medium">{getFieldError('cliente')}</p>}
                </div>
                <div>
                  <Label htmlFor="cliente_cnpj">CNPJ Remetente</Label>
                  <Input id="cliente_cnpj" value={formData.cliente_cnpj} onChange={(e) => handleInputChange("cliente_cnpj", e.target.value)} placeholder="00.000.000/0000-00" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="origem" className={getFieldError('origem') ? 'text-red-600 font-semibold' : ''}>
                    Local de Coleta *
                    {getFieldError('origem') && <span className="ml-2 text-xs">⚠️</span>}
                  </Label>
                  <Input id="origem" value={formData.origem} onChange={(e) => handleInputChange("origem", e.target.value)}
                    placeholder="Local de origem" required className={getFieldError('origem') ? 'border-red-500 border-2 bg-red-50' : ''} />
                  {getFieldError('origem') && <p className="text-xs text-red-600 mt-1 font-medium">{getFieldError('origem')}</p>}
                </div>
                <div>
                  <Label htmlFor="origem_endereco">Endereço Completo</Label>
                  <Input id="origem_endereco" value={formData.origem_endereco} onChange={(e) => handleInputChange("origem_endereco", e.target.value)} placeholder="Rua, número" />
                </div>
              </div>

              <div className="grid grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="origem_cep">CEP</Label>
                  <Input id="origem_cep" value={formData.origem_cep} onChange={(e) => handleInputChange("origem_cep", e.target.value)} placeholder="00000-000" />
                </div>
                <div>
                  <Label htmlFor="origem_bairro">Bairro</Label>
                  <Input id="origem_bairro" value={formData.origem_bairro} onChange={(e) => handleInputChange("origem_bairro", e.target.value)} placeholder="Bairro" />
                </div>
                <div>
                  <Label htmlFor="origem_cidade">Cidade</Label>
                  <Input id="origem_cidade" value={formData.origem_cidade} onChange={(e) => handleInputChange("origem_cidade", e.target.value)} placeholder="Cidade" />
                </div>
                <div>
                  <Label htmlFor="origem_uf">UF</Label>
                  <Input id="origem_uf" value={formData.origem_uf} onChange={(e) => handleInputChange("origem_uf", e.target.value.toUpperCase())} placeholder="SP" maxLength={2} />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="destino" className="space-y-4 tab-content-container">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="destinatario">Cliente/Destinatário</Label>
                  <Input id="destinatario" value={formData.destinatario} onChange={(e) => handleInputChange("destinatario", e.target.value)} placeholder="Nome do destinatário" />
                </div>
                <div>
                  <Label htmlFor="destinatario_cnpj">CNPJ Destinatário</Label>
                  <Input id="destinatario_cnpj" value={formData.destinatario_cnpj} onChange={(e) => handleInputChange("destinatario_cnpj", e.target.value)} placeholder="00.000.000/0000-00" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="destino" className={getFieldError('destino') ? 'text-red-600 font-semibold' : ''}>
                    Local de Entrega *
                    {getFieldError('destino') && <span className="ml-2 text-xs">⚠️</span>}
                  </Label>
                  <Input id="destino" value={formData.destino} onChange={(e) => handleInputChange("destino", e.target.value)}
                    placeholder="Local de destino" required className={getFieldError('destino') ? 'border-red-500 border-2 bg-red-50' : ''} />
                  {getFieldError('destino') && <p className="text-xs text-red-600 mt-1 font-medium">{getFieldError('destino')}</p>}
                </div>
                <div>
                  <Label htmlFor="destino_endereco">Endereço Completo</Label>
                  <Input id="destino_endereco" value={formData.destino_endereco} onChange={(e) => handleInputChange("destino_endereco", e.target.value)} placeholder="Rua, número" />
                </div>
              </div>

              <div className="grid grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="destino_cep">CEP</Label>
                  <Input id="destino_cep" value={formData.destino_cep} onChange={(e) => handleInputChange("destino_cep", e.target.value)} placeholder="00000-000" />
                </div>
                <div>
                  <Label htmlFor="destino_bairro">Bairro</Label>
                  <Input id="destino_bairro" value={formData.destino_bairro} onChange={(e) => handleInputChange("destino_bairro", e.target.value)} placeholder="Bairro" />
                </div>
                <div>
                  <Label htmlFor="destino_cidade">Cidade</Label>
                  <Input id="destino_cidade" value={formData.destino_cidade} onChange={(e) => handleInputChange("destino_cidade", e.target.value)} placeholder="Cidade" />
                </div>
                <div>
                  <Label htmlFor="destino_uf">UF</Label>
                  <Input id="destino_uf" value={formData.destino_uf} onChange={(e) => handleInputChange("destino_uf", e.target.value.toUpperCase())} placeholder="SP" maxLength={2} />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="carga" className="space-y-4 tab-content-container">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="produto" className={getFieldError('produto') ? 'text-red-600 font-semibold' : ''}>
                    Produto *
                    {getFieldError('produto') && <span className="ml-2 text-xs">⚠️</span>}
                  </Label>
                  <Input id="produto" value={formData.produto} onChange={(e) => handleInputChange("produto", e.target.value)}
                    placeholder="Produto" required className={getFieldError('produto') ? 'border-red-500 border-2 bg-red-50' : ''} />
                  {getFieldError('produto') && <p className="text-xs text-red-600 mt-1 font-medium">{getFieldError('produto')}</p>}
                </div>
                <div>
                  <Label htmlFor="data_carregamento">Data Carregamento</Label>
                  <Input id="data_carregamento" type="date" value={formData.data_carregamento} onChange={(e) => handleInputChange("data_carregamento", e.target.value)} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="tipo_veiculo">Tipo de Veículo</Label>
                  <Select value={formData.tipo_veiculo} onValueChange={(value) => handleInputChange("tipo_veiculo", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo de veículo" />
                    </SelectTrigger>
                    <SelectContent>
                      {tipoVeiculoOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="tipo_carroceria">Tipo de Carroceria</Label>
                  <Select value={formData.tipo_carroceria} onValueChange={(value) => handleInputChange("tipo_carroceria", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo de carroceria" />
                    </SelectTrigger>
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
                  <Label htmlFor="peso" className={getFieldError('peso') ? 'text-red-600 font-semibold' : ''}>
                    Peso (kg) *
                    {getFieldError('peso') && <span className="ml-2 text-xs">⚠️</span>}
                  </Label>
                  <Input id="peso" type="number" value={formData.peso} onChange={(e) => handleInputChange("peso", e.target.value)}
                    placeholder="Peso em kg" required className={getFieldError('peso') ? 'border-red-500 border-2 bg-red-50' : ''} />
                  {getFieldError('peso') && <p className="text-xs text-red-600 mt-1 font-medium">{getFieldError('peso')}</p>}
                </div>
                <div>
                  <Label htmlFor="valor_nf">Valor NF (R$)</Label>
                  <Input id="valor_nf" type="number" step="0.01" value={formData.valor_nf}
                    onChange={(e) => handleInputChange("valor_nf", e.target.value)} placeholder="Valor da NF" />
                </div>
                <div>
                  <Label htmlFor="valor_tonelada" className={getFieldError('preco') ? 'text-orange-600 font-medium' : ''}>
                    Valor/Tonelada {getFieldError('preco') && <span className="ml-2 text-xs">⚠️</span>}
                  </Label>
                  <Input id="valor_tonelada" type="number" step="0.01" value={formData.valor_tonelada}
                    onChange={(e) => handleInputChange("valor_tonelada", e.target.value)} placeholder="Valor por tonelada"
                    disabled={!!formData.frete_viagem && parseFloat(formData.frete_viagem) > 0}
                    className={getFieldError('preco') ? 'border-orange-400 border-2 bg-orange-50' : ''} />
                </div>
                <div>
                  <Label htmlFor="frete_viagem" className={getFieldError('preco') ? 'text-orange-600 font-medium' : ''}>
                    Frete Viagem {getFieldError('preco') && <span className="ml-2 text-xs">⚠️</span>}
                  </Label>
                  <Input id="frete_viagem" type="number" step="0.01" value={formData.frete_viagem}
                    onChange={(e) => handleInputChange("frete_viagem", e.target.value)} placeholder="Valor da viagem"
                    disabled={!!formData.valor_tonelada && parseFloat(formData.valor_tonelada) > 0}
                    className={getFieldError('preco') ? 'border-orange-400 border-2 bg-orange-50' : ''} />
                </div>
              </div>

              <div className="grid grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="volumes">Volumes</Label>
                  <Input id="volumes" type="number" value={formData.volumes} onChange={(e) => handleInputChange("volumes", e.target.value)} placeholder="Qtd" />
                </div>
                <div>
                  <Label htmlFor="embalagem">Embalagem</Label>
                  <Input id="embalagem" value={formData.embalagem} onChange={(e) => handleInputChange("embalagem", e.target.value)} placeholder="Tipo" />
                </div>
                <div>
                  <Label htmlFor="conteudo">Conteúdo</Label>
                  <Input id="conteudo" value={formData.conteudo} onChange={(e) => handleInputChange("conteudo", e.target.value)} placeholder="Descrição" />
                </div>
                <div>
                  <Label htmlFor="qtd_entregas">Qtd Entregas</Label>
                  <Input id="qtd_entregas" type="number" value={formData.qtd_entregas} onChange={(e) => handleInputChange("qtd_entregas", e.target.value)} placeholder="1" />
                </div>
              </div>

              <div>
                <Label htmlFor="observacao_carga">Observações</Label>
                <Textarea id="observacao_carga" value={formData.observacao_carga} onChange={(e) => handleInputChange("observacao_carga", e.target.value)}
                  placeholder="Observações sobre a carga" rows={3} />
              </div>
            </TabsContent>

            <TabsContent value="precificacao" className="space-y-4 tab-content-container">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Precificação Automática</h3>
                  {tabelaSelecionada && (
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setTabelaSelecionada(null);
                        setShowTabelaManual(true);
                        setTipoFrete(null);
                      }}
                      className="text-xs"
                    >
                      Trocar Tabela
                    </Button>
                  )}
                </div>

                {tabelaSelecionada ? (
                  <div className="space-y-4">
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                      <p className="text-sm font-semibold text-blue-900 dark:text-blue-200">
                        📋 Tabela Aplicada: {tabelaSelecionada.nome}
                      </p>
                      {tabelaSelecionada.codigo && (
                        <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                          Código: {tabelaSelecionada.codigo}
                        </p>
                      )}
                    </div>

                    {calculandoDistancia ? (
                      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
                        <div className="flex items-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin text-yellow-700" />
                          <p className="text-sm text-yellow-800">Calculando distância via Google Maps...</p>
                        </div>
                      </div>
                    ) : erroCalculoDistancia ? (
                      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-2">
                          <AlertTriangle className="w-4 h-4 text-red-700" />
                          <p className="text-sm font-semibold text-red-900">API Google Maps não disponível</p>
                        </div>
                        <p className="text-xs text-red-700 mb-3">
                          Não foi possível calcular a distância automaticamente. Insira o KM manualmente abaixo.
                        </p>
                        <div>
                          <Label className="text-xs text-red-700">KM Manual</Label>
                          <div className="flex gap-2 mt-1">
                            <Input
                              type="number"
                              step="0.1"
                              value={kmManual || ""}
                              onChange={(e) => setKmManual(parseFloat(e.target.value) || null)}
                              placeholder="Ex: 450"
                              className="flex-1 bg-white"
                            />
                            <Button
                              type="button"
                              onClick={calcularFreteAutomatico}
                              className="bg-red-600 hover:bg-red-700 text-white px-4"
                              disabled={calculandoFrete}
                            >
                              {calculandoFrete ? <Loader2 className="w-4 h-4 animate-spin" /> : "Calcular"}
                            </Button>
                          </div>
                        </div>
                      </div>
                    ) : distanciaEmitenteDest && (
                      <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-2">
                          <MapPin className="w-4 h-4 text-purple-700" />
                          <p className="text-sm font-semibold text-purple-900">Distância Calculada via Google Maps</p>
                        </div>
                        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-purple-300">
                          <p className="text-lg font-bold text-purple-900">{distanciaEmitenteDest.texto}</p>
                          <p className="text-xs text-gray-600 mt-1">De: {distanciaEmitenteDest.origem}</p>
                          <p className="text-xs text-gray-600">Para: {distanciaEmitenteDest.destino}</p>
                        </div>
                        
                        <div className="border-t pt-3 mt-3">
                          <Label className="text-xs text-purple-700">KM Manual (Opcional)</Label>
                          <div className="flex gap-2 mt-1">
                            <Input
                              type="number"
                              step="0.1"
                              value={kmManual || ""}
                              onChange={(e) => setKmManual(parseFloat(e.target.value) || null)}
                              placeholder="Ex: 1000"
                              className="flex-1 bg-white"
                            />
                            <Button
                              type="button"
                              onClick={calcularFreteAutomatico}
                              className="bg-purple-600 hover:bg-purple-700 text-white px-4"
                              disabled={calculandoFrete}
                            >
                              {calculandoFrete ? <Loader2 className="w-4 h-4 animate-spin" /> : "Recalcular"}
                            </Button>
                          </div>
                          <p className="text-xs text-purple-600 mt-1">
                            Se preenchido, este valor será usado no lugar do cálculo automático
                          </p>
                        </div>
                      </div>
                    )}

                    {precificacaoCalculada && (
                      <div className="space-y-3">
                        {/* Campo ICMS Manual */}
                        <div className="border rounded-lg p-3 bg-blue-50 dark:bg-blue-900/20 border-blue-300">
                          <Label className="text-xs text-blue-700 mb-1 block">Alíquota ICMS (%) - Opcional</Label>
                          <Input
                            type="number"
                            step="0.01"
                            value={aliquotaIcmsManual ?? ""}
                            onChange={(e) => setAliquotaIcmsManual(e.target.value ? parseFloat(e.target.value) : null)}
                            placeholder={tabelaSelecionada.icms ? `Padrão: ${tabelaSelecionada.icms}%` : "Ex: 12"}
                            className="bg-white"
                          />
                        </div>

                        {/* Breakdown Detalhado */}
                        <div className="border-2 rounded-lg p-4 bg-white border-blue-400">
                          <h3 className="font-bold text-sm mb-3 text-blue-700">
                            📊 Composição do Frete
                          </h3>
                          
                          <div className="space-y-2 text-sm">
                            {precificacaoCalculada.breakdown?.map((item, idx) => (
                              <div key={idx} className="flex justify-between py-1 border-b border-gray-200">
                                <span className="text-gray-600">{item.nome}</span>
                                <span className="font-semibold">R$ {item.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                              </div>
                            ))}

                            <div className="flex justify-between py-3 bg-green-50 px-3 -mx-2 rounded-lg border-2 border-green-600 mt-3">
                              <span className="font-bold text-lg text-green-700">VALOR TOTAL</span>
                              <span className="font-bold text-xl text-green-700">
                                R$ {precificacaoCalculada.valor_total?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                              </span>
                            </div>

                            {precificacaoCalculada.prazo_entrega && (
                              <div className="bg-blue-50 p-3 rounded-lg border border-blue-300 mt-3">
                                <p className="text-xs text-blue-700 mb-1">Prazo de Entrega</p>
                                <p className="font-bold text-blue-900">
                                  {precificacaoCalculada.prazo_entrega.dias} dias ({precificacaoCalculada.prazo_entrega.tipo})
                                </p>
                                {precificacaoCalculada.prazo_entrega.data_prevista && (
                                  <p className="text-xs text-blue-600 mt-1">
                                    Previsão: {new Date(precificacaoCalculada.prazo_entrega.data_prevista).toLocaleDateString('pt-BR')}
                                  </p>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : showTabelaManual ? (
                  <div className="space-y-3">
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                      <p className="text-sm text-yellow-800">
                        ⚠ Nenhuma tabela encontrada automaticamente. Pesquise e selecione uma tabela manualmente.
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <Input
                        value={searchTabela}
                        onChange={(e) => setSearchTabela(e.target.value)}
                        placeholder="Pesquisar tabela por nome ou código..."
                        className="flex-1"
                      />
                      <Button type="button" onClick={() => {}} variant="outline" size="sm">
                        <Search className="w-4 h-4" />
                      </Button>
                    </div>

                    <div className="max-h-64 overflow-y-auto border rounded-lg">
                      {tabelas
                        .filter(t => 
                          t.nome?.toLowerCase().includes(searchTabela.toLowerCase()) ||
                          t.codigo?.toLowerCase().includes(searchTabela.toLowerCase())
                        )
                        .map(t => (
                          <button
                            key={t.id}
                            type="button"
                            onClick={() => handleSelecionarTabelaManual(t.id)}
                            className="w-full text-left p-3 hover:bg-gray-100 border-b"
                          >
                            <p className="text-sm font-semibold">{t.nome}</p>
                            {t.codigo && <p className="text-xs text-gray-600">Código: {t.codigo}</p>}
                          </button>
                        ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p className="text-sm">Preencha os CNPJs do remetente ou destinatário para carregar a tabela automaticamente</p>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter>
            <Button variant="outline" onClick={onClose}>
              <X className="w-4 h-4 mr-2" />Cancelar
            </Button>
            <Button onClick={handleSubmitWithValidation} disabled={showValidation && !isFormValid()}
              className={`bg-blue-600 hover:bg-blue-700 ${showValidation && !isFormValid() ? 'opacity-50 cursor-not-allowed' : ''}`}>
              <Save className="w-4 h-4 mr-2" />{editingOrdem ? "Atualizar" : "Criar"} Ordem
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Tipo de Frete CIF/FOB */}
      {showTipoFreteModal && (
        <Dialog open={showTipoFreteModal} onOpenChange={setShowTipoFreteModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Tipo de Frete</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <p className="text-sm text-gray-600">
                Tanto o remetente quanto o destinatário possuem tabelas de frete. Qual é o tipo de frete?
              </p>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setTipoFrete("CIF");
                    setShowTipoFreteModal(false);
                  }}
                  className="border-2 rounded-lg p-4 hover:bg-blue-50"
                >
                  <p className="font-bold text-lg mb-1">CIF</p>
                  <p className="text-xs text-gray-600">Frete pago pelo remetente</p>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setTipoFrete("FOB");
                    setShowTipoFreteModal(false);
                  }}
                  className="border-2 rounded-lg p-4 hover:bg-blue-50"
                >
                  <p className="font-bold text-lg mb-1">FOB</p>
                  <p className="text-xs text-gray-600">Frete pago pelo destinatário</p>
                </button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {showMotoristaForm && (
        <MotoristaForm
          open={showMotoristaForm}
          onClose={() => { setShowMotoristaForm(false); setNomeParaCadastro(""); }}
          onSubmit={async (motoristaData) => {
            try {
              const novoMotorista = await base44.entities.Motorista.create({
                ...motoristaData,
                nome: nomeParaCadastro || motoristaData.nome,
                data_cadastro: new Date().toISOString().split('T')[0]
              });
              handleMotoristaCadastrado(novoMotorista);
            } catch (error) {
              console.error("Erro ao cadastrar motorista:", error);
            }
          }}
          editingMotorista={null}
          veiculos={veiculos}
        />
      )}

      {showVeiculoForm && (
        <VeiculoForm
          open={showVeiculoForm}
          onClose={() => { setShowVeiculoForm(false); setTipoVeiculoCadastro(null); setPlacaParaCadastro(""); }}
          onSubmit={async (veiculoData) => {
            try {
              const novoVeiculo = await base44.entities.Veiculo.create({
                ...veiculoData,
                placa: placaParaCadastro || veiculoData.placa
              });
              handleVeiculoCadastrado(novoVeiculo);
            } catch (error) {
              console.error("Erro ao cadastrar veículo:", error);
            }
          }}
          editingVeiculo={null}
          placaInicial={placaParaCadastro}
          tipoInicial={tipoVeiculoCadastro === 'cavalo' ? 'cavalo' : 'semi-reboque'}
        />
      )}

      {showOperacaoForm && (
        <OperacaoForm
          open={showOperacaoForm}
          onClose={() => setShowOperacaoForm(false)}
          onSubmit={async (operacaoData) => {
            try {
              const novaOperacao = await base44.entities.Operacao.create(operacaoData);
              handleOperacaoCadastrada(novaOperacao);
            } catch (error) {
              console.error("Erro ao cadastrar operação:", error);
            }
          }}
          editingOperacao={null}
          nomeInicial={operacaoSearchTerm}
        />
      )}
    </>
  );
}
