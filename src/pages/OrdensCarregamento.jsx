import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Filter, ChevronDown, FileText, Package, FileSpreadsheet, X, Scan, Grid3x3, RefreshCw } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from 'react-hot-toast';
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import OrdensTableEditable from "../components/ordens/OrdensTableEditable";
import OrdemUnificadaForm from "../components/ordens/OrdemUnificadaForm";
import OrdemDetails from "../components/ordens/OrdemDetails";
import OfertaCargaForm from "../components/ordens/OfertaCargaForm";
import OfertaCargaLote from "../components/ordens/OfertaCargaLote";
import TipoOrdemModal from "../components/ordens/TipoOrdemModal";
import ExportarOfertasPDF from "../components/ordens/ExportarOfertasPDF";
import FiltrosPredefinidos from "../components/filtros/FiltrosPredefinidos";
import PaginacaoControles from "../components/filtros/PaginacaoControles";
import FiltroDataPeriodo from "../components/filtros/FiltroDataPeriodo";
import ConferenciaVolumes from "../components/carregamento/ConferenciaVolumes";
import EnderecamentoVeiculo from "../components/carregamento/EnderecamentoVeiculo";

export default function OrdensCarregamento() {
  const [ordens, setOrdens] = useState([]);
  const [motoristas, setMotoristas] = useState([]);
  const [veiculos, setVeiculos] = useState([]);
  const [operacoes, setOperacoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedOrdem, setSelectedOrdem] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingOrdem, setEditingOrdem] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [showTipoModal, setShowTipoModal] = useState(false);
  const [showOfertaForm, setShowOfertaForm] = useState(false);
  const [showOfertaLote, setShowOfertaLote] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [periodoSelecionado, setPeriodoSelecionado] = useState("mes_atual");
  
  // Calcular datas do mês atual
  const hoje = new Date();
  const primeiroDiaMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
  const ultimoDiaMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);
  
  const [filters, setFilters] = useState({
    operacoesIds: [],
    status: "",
    tiposRegistro: [],
    origem: "",
    destino: "",
    dataInicio: primeiroDiaMes.toISOString().split('T')[0],
    dataFim: ultimoDiaMes.toISOString().split('T')[0],
    tipoRegistro: "",
    statusTracking: ""
  });
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [limite, setLimite] = useState(50);
  const [graficoExpandido, setGraficoExpandido] = useState(false);
  const [showConferencia, setShowConferencia] = useState(false);
  const [showEnderecamento, setShowEnderecamento] = useState(false);
  const [ordemParaConferencia, setOrdemParaConferencia] = useState(null);
  const [notasFiscaisData, setNotasFiscaisData] = useState([]);
  const [volumesData, setVolumesData] = useState([]);
  const [isTablet, setIsTablet] = useState(false);
  const [isLandscape, setIsLandscape] = useState(false);

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
    const checkDevice = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      // Detectar tablet: largura entre 768px e 1366px (típico de tablets 10")
      const isTabletSize = width >= 768 && width <= 1366;
      setIsTablet(isTabletSize);
      setIsLandscape(width > height);
      
      console.log('Device check:', { width, height, isTabletSize, isLandscape: width > height });
    };
    
    checkDevice();
    window.addEventListener('resize', checkDevice);
    window.addEventListener('orientationchange', checkDevice);
    screen.orientation?.addEventListener('change', checkDevice);
    return () => {
      window.removeEventListener('resize', checkDevice);
      window.removeEventListener('orientationchange', checkDevice);
      screen.orientation?.removeEventListener('change', checkDevice);
    };
  }, []);

  useEffect(() => {
    loadCurrentUser();
    loadData();
    
    const urlParams = new URLSearchParams(window.location.search);
    const ordemId = urlParams.get('id');
    if (ordemId) {
      loadOrdemForEdit(ordemId);
    }
  }, []);

  const loadCurrentUser = async () => {
    try {
      const user = await base44.auth.me();
      setCurrentUser(user);
    } catch (error) {
      console.error("Erro ao carregar usuário:", error);
    }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const user = await base44.auth.me();
      
      const [ordensData, motoristasData, veiculosData, operacoesData] = await Promise.all([
        base44.entities.OrdemDeCarregamento.list("-data_solicitacao"),
        base44.entities.Motorista.list(),
        base44.entities.Veiculo.list(),
        base44.entities.Operacao.list()
      ]);
      
      let ordensFiltradas = ordensData;
      
      // Filtrar baseado no tipo de perfil do usuário
      if (user.tipo_perfil === "fornecedor") {
        // Fornecedor vê apenas ordens onde seu CNPJ é o remetente
        ordensFiltradas = ordensData.filter(o => o.cliente_cnpj === user.cnpj_associado);
      } else if (user.tipo_perfil === "cliente") {
        // Cliente vê apenas ordens onde seu CNPJ é o destinatário
        ordensFiltradas = ordensData.filter(o => o.destinatario_cnpj === user.cnpj_associado);
      } else if (user.tipo_perfil === "operador") {
        // Operador vê todas as ordens da empresa do operador logístico
        ordensFiltradas = user.empresa_id && user.role !== "admin"
          ? ordensData.filter(o => o.empresa_id === user.empresa_id || !o.empresa_id)
          : ordensData;
      } else if (user.role === "admin") {
        // Admin vê tudo
        ordensFiltradas = ordensData;
      }
      
      setOrdens(ordensFiltradas);
      setMotoristas(motoristasData);
      setVeiculos(veiculosData);
      setOperacoes(operacoesData.filter(op => op.ativo));
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadOrdemForEdit = async (id) => {
    try {
      const ordemData = await base44.entities.OrdemDeCarregamento.list();
      const ordem = ordemData.find(o => o.id === id);
      if (ordem) {
        setEditingOrdem(ordem);
        setShowForm(true);
      }
    } catch (error) {
      console.error("Erro ao carregar ordem para edição:", error);
    }
  };

  const loadOrdemDetails = async (id) => {
    try {
      const ordemData = await base44.entities.OrdemDeCarregamento.list();
      const ordem = ordemData.find(o => o.id === id);
      if (ordem) {
        setSelectedOrdem(ordem);
      }
    } catch (error) {
      console.error("Erro ao carregar ordem:", error);
    }
  };

  const generateNumeroCarga = (offset = 0) => {
    const year = new Date().getFullYear();
    const sequence = (ordens.length + 1 + offset).toString().padStart(4, '0');
    return `${year}-${sequence}`;
  };

  const handleSubmit = async (data, notasFiscaisData = []) => {
    console.log(`💾 ORDENS - Iniciando salvamento:`, {
      editando: !!editingOrdem,
      temNotas: notasFiscaisData?.length > 0,
      notasQtd: notasFiscaisData?.length
    });

    try {
      const user = await base44.auth.me();

      let valorTotal = 0;
      if (data.peso && data.valor_tonelada) {
        valorTotal = (data.peso / 1000) * data.valor_tonelada;
      } else if (data.frete_viagem) {
        valorTotal = data.frete_viagem;
      }

      let clienteFinalNome = data.cliente_final_nome;
      let clienteFinalCnpj = data.cliente_final_cnpj;
      
      if (!clienteFinalNome || !clienteFinalCnpj) {
        if (data.tipo_operacao === "CIF") {
          clienteFinalNome = data.cliente;
          clienteFinalCnpj = data.cliente_cnpj;
        } else if (data.tipo_operacao === "FOB") {
          clienteFinalNome = data.destinatario || data.destino;
          clienteFinalCnpj = data.destinatario_cnpj;
        }
      }

      // Calcular tipo_registro e tipo_negociacao baseado nos dados atuais
      const temMotorista = data.motorista_id || data.motorista_nome_temp;
      const temVeiculo = data.cavalo_id;
      
      let tipoRegistro = data.tipo_registro || "ordem_completa";
      let tipoNegociacao = data.tipo_negociacao;
      
      if (data.tipo_ordem !== "coleta") {
        if (temMotorista && temVeiculo) {
          tipoRegistro = "ordem_completa";
          tipoNegociacao = "alocado";
        } else if (temMotorista && !temVeiculo) {
          tipoRegistro = "negociando";
          tipoNegociacao = "negociando";
        } else {
          tipoRegistro = "oferta";
          tipoNegociacao = "oferta";
        }
      }

      const ordemData = {
        ...data,
        empresa_id: user.empresa_id,
        valor_total_frete: valorTotal,
        data_solicitacao: editingOrdem ? editingOrdem.data_solicitacao : new Date().toISOString(),
        numero_carga: editingOrdem ? editingOrdem.numero_carga : generateNumeroCarga(),
        tipo_registro: tipoRegistro,
        tipo_negociacao: tipoNegociacao,
        status: editingOrdem?.status || "novo",
        cliente_final_nome: clienteFinalNome,
        cliente_final_cnpj: clienteFinalCnpj
      };

      // VALIDAÇÃO DE SENHA DE FILA ÚNICA (exceto DEDI)
      if (ordemData.senha_fila && ordemData.senha_fila.toUpperCase() !== 'DEDI') {
        const todasAsOrdens = await base44.entities.OrdemDeCarregamento.list();
        
        const isDuplicate = todasAsOrdens.some(ordem => 
          ordem.senha_fila === ordemData.senha_fila &&
          (!editingOrdem || ordem.id !== editingOrdem.id)
        );

        if (isDuplicate) {
          toast.error('Essa Senha da Fila já está em uso. Por favor, utilize outra.');
          return; // Interrompe o envio
        }
      }

      let ordemId;
      let ordemSalva;

      if (editingOrdem) {
        console.log(`📝 ORDENS - Atualizando ordem existente:`, editingOrdem.id.slice(-6));
        await base44.entities.OrdemDeCarregamento.update(editingOrdem.id, ordemData);
        ordemId = editingOrdem.id;
        
        // Se senha_fila foi adicionada/atualizada, mover veículo para status configurado
        if (ordemData.senha_fila && ordemData.senha_fila !== editingOrdem.senha_fila) {
          await moverVeiculoParaStatusVinculado(ordemData.senha_fila);
        }
        
        const mudouParaAlocado = tipoNegociacao === "alocado" && editingOrdem.tipo_negociacao !== "alocado";
        if (mudouParaAlocado) {
          toast.success("Ordem alocada com sucesso! Motorista e veículo definidos.");
        } else {
          toast.success("Ordem de carregamento atualizada com sucesso!");
        }
      } else {
        console.log(`➕ ORDENS - Criando nova ordem`);
        ordemSalva = await base44.entities.OrdemDeCarregamento.create(ordemData);
        ordemId = ordemSalva.id;

        console.log(`✅ ORDENS - Ordem criada:`, ordemId.slice(-6));

        await vincularPrimeiraEtapa(ordemId);
        
        // Se senha_fila foi informada, mover veículo para status configurado
        if (ordemData.senha_fila) {
          await moverVeiculoParaStatusVinculado(ordemData.senha_fila);
        }
        
        toast.success("Ordem de carregamento criada com sucesso!");
      }

      // Aguardar um momento para garantir persistência
      await new Promise(resolve => setTimeout(resolve, 200));

      // Processar e vincular notas fiscais
      if (notasFiscaisData && notasFiscaisData.length > 0) {
        console.log(`📋 ORDENS - Processando ${notasFiscaisData.length} notas fiscais`);

        const notasIds = [];
        let pesoTotal = 0;
        let valorTotalNotas = 0;
        let volumesTotal = 0;

        for (const nf of notasFiscaisData) {
          let notaId;
          
          if (nf.nota_id_existente) {
            console.log(`📝 ORDENS - Vinculando nota existente:`, nf.nota_id_existente.slice(-6));
            // Nota já existe na base, apenas atualizar o vínculo
            await base44.entities.NotaFiscal.update(nf.nota_id_existente, {
              ordem_id: ordemId,
              status_nf: "aguardando_expedicao"
            });
            notaId = nf.nota_id_existente;
          } else {
            console.log(`➕ ORDENS - Criando nova nota fiscal:`, nf.numero_nota);
            // Criar nova nota fiscal
            const notaData = {
              ordem_id: ordemId,
              numero_nota: nf.numero_nota,
              serie_nota: nf.serie_nota,
              chave_nota_fiscal: nf.chave_nota_fiscal,
              data_hora_emissao: nf.data_emissao_nf,
              natureza_operacao: nf.natureza_operacao,
              emitente_razao_social: nf.emitente_razao_social,
              emitente_cnpj: nf.emitente_cnpj,
              emitente_telefone: nf.emitente_telefone,
              emitente_uf: nf.emitente_uf,
              emitente_cidade: nf.emitente_cidade,
              emitente_bairro: nf.emitente_bairro,
              emitente_endereco: nf.emitente_endereco,
              emitente_numero: nf.emitente_numero,
              emitente_cep: nf.emitente_cep,
              destinatario_razao_social: nf.destinatario_razao_social,
              destinatario_cnpj: nf.destinatario_cnpj,
              destinatario_telefone: nf.destinatario_telefone,
              destinatario_cidade: nf.destino_cidade,
              destinatario_uf: nf.destino_uf,
              destinatario_endereco: nf.destino_endereco,
              destinatario_numero: nf.destino_numero,
              destinatario_bairro: nf.destino_bairro,
              destinatario_cep: nf.destino_cep,
              valor_nota_fiscal: nf.valor_nf,
              xml_content: nf.xml_content,
              peso_total_nf: nf.peso_nf,
              quantidade_total_volumes_nf: nf.volumes_nf,
              status_nf: "aguardando_expedicao"
            };

            const notaCriada = await base44.entities.NotaFiscal.create(notaData);
            notaId = notaCriada.id;
            console.log(`✅ ORDENS - Nota criada:`, notaId.slice(-6));
          }

          // Acumular IDs e totais
          notasIds.push(notaId);
          pesoTotal += nf.peso_nf || 0;
          valorTotalNotas += nf.valor_nf || 0;
          volumesTotal += nf.volumes_nf || 0;
        }

        console.log(`📊 ORDENS - Totais consolidados:`, {
          notas: notasIds.length,
          peso: pesoTotal,
          valor: valorTotalNotas,
          volumes: volumesTotal
        });

        // Atualizar ordem com array de IDs e totais consolidados
        await base44.entities.OrdemDeCarregamento.update(ordemId, {
          notas_fiscais_ids: notasIds,
          peso_total_consolidado: pesoTotal,
          valor_total_consolidado: valorTotalNotas,
          volumes_total_consolidado: volumesTotal,
          peso: pesoTotal,
          volumes: volumesTotal
        });

        console.log(`✅ ORDENS - Ordem atualizada com totais consolidados`);
      }

      // Aguardar persistência completa antes de fechar modal
      await new Promise(resolve => setTimeout(resolve, 300));

      console.log(`🎉 ORDENS - Salvamento concluído, fechando modal e recarregando dados`);

      setShowForm(false);
      setEditingOrdem(null);
      
      // Recarregar dados com loading para mostrar progresso
      await loadData();

      console.log(`✅ ORDENS - Página atualizada com sucesso`);

    } catch (error) {
      console.error("❌ ORDENS - Erro ao salvar ordem:", error);
      toast.error(`Erro ao salvar ordem: ${error.message || 'Tente novamente'}`);
      throw error;
    }
  };

  const vincularPrimeiraEtapa = async (ordemId) => {
    try {
      const etapas = await base44.entities.Etapa.list("ordem"); 
      const etapasAtivas = etapas.filter(e => e.ativo);
      
      if (etapasAtivas.length > 0) {
        const primeiraEtapa = etapasAtivas[0];
        
        await base44.entities.OrdemEtapa.create({
          ordem_id: ordemId,
          etapa_id: primeiraEtapa.id,
          status: "em_andamento",
          data_inicio: new Date().toISOString()
        });
        
        console.log("Ordem vinculada à primeira etapa:", primeiraEtapa.nome);
      }
    } catch (error) {
      console.error("Erro ao vincular ordem à primeira etapa:", error);
    }
  };

  const handleSubmitOferta = async (data) => {
    try {
      const user = await base44.auth.me();
      
      let valorTotal = 0;
      if (data.peso && data.valor_tonelada) {
        valorTotal = (data.peso / 1000) * data.valor_tonelada;
      } else if (data.frete_viagem) {
        valorTotal = data.frete_viagem;
      }

      let clienteFinalNome = data.cliente_final_nome;
      let clienteFinalCnpj = data.cliente_final_cnpj;
      
      if (!clienteFinalNome || !clienteFinalCnpj) {
        if (data.tipo_operacao === "CIF") {
          clienteFinalNome = data.cliente;
          clienteFinalCnpj = data.cliente_cnpj;
        } else if (data.tipo_operacao === "FOB") {
          clienteFinalNome = data.destinatario || data.destino;
          clienteFinalCnpj = data.destinatario_cnpj;
        }
      }
      
      const ofertaData = {
        ...data,
        empresa_id: user.empresa_id,
        valor_total_frete: valorTotal,
        data_solicitacao: new Date().toISOString(),
        numero_carga: generateNumeroCarga(),
        tipo_registro: "oferta",
        status: "novo",
        cliente_final_nome: clienteFinalNome,
        cliente_final_cnpj: clienteFinalCnpj
      };

      const novaOferta = await base44.entities.OrdemDeCarregamento.create(ofertaData);
      
      await vincularPrimeiraEtapa(novaOferta.id);
      
      setShowOfertaForm(false);
      loadData();
      toast.success("Oferta de carga criada com sucesso!");
    } catch (error) {
      console.error("Erro ao salvar oferta:", error);
      toast.error("Erro ao criar oferta de carga");
    }
  };

  const handleSubmitOfertasLote = async (ofertas) => {
    try {
      const user = await base44.auth.me();
      
      const ofertasComDados = ofertas.map((oferta, index) => {
        let clienteFinalNome = oferta.cliente_final_nome;
        let clienteFinalCnpj = oferta.cliente_final_cnpj;
        
        if (!clienteFinalNome || !clienteFinalCnpj) {
          if (oferta.tipo_operacao === "CIF") {
            clienteFinalNome = oferta.cliente;
            clienteFinalCnpj = oferta.cliente_cnpj;
          } else if (oferta.tipo_operacao === "FOB") {
            clienteFinalNome = oferta.destinatario || oferta.destino;
            clienteFinalCnpj = oferta.destinatario_cnpj;
          }
        }

        return {
          ...oferta,
          empresa_id: user.empresa_id,
          data_solicitacao: new Date().toISOString(),
          numero_carga: generateNumeroCarga(index),
          tipo_registro: "oferta",
          status: "novo",
          cliente_final_nome: clienteFinalNome,
          cliente_final_cnpj: clienteFinalCnpj,
          carregamento_agendamento_data: oferta.carregamento_agendamento_data,
          descarga_agendamento_data: oferta.descarga_agendamento_data,
          status_tracking: oferta.status_tracking
        };
      });

      for (const oferta of ofertasComDados) {
        const novaOferta = await base44.entities.OrdemDeCarregamento.create(oferta);
        await vincularPrimeiraEtapa(novaOferta.id);
      }
      
      setShowOfertaLote(false);
      loadData();
      toast.success("Ofertas de carga criadas com sucesso!");
    } catch (error) {
      console.error("Erro ao salvar ofertas em lote:", error);
      toast.error("Erro ao criar ofertas em lote");
    }
  };

  const handleSelectTipoOrdem = (tipo) => {
    setShowTipoModal(false);
    if (tipo === "ordem_completa") {
      setShowForm(true);
    } else if (tipo === "oferta_individual") {
      setShowOfertaForm(true);
    } else if (tipo === "oferta_lote") {
      setShowOfertaLote(true);
    }
  };

  const toggleOperacao = (operacaoId) => {
    setFilters(prev => {
      const operacoesIds = prev.operacoesIds.includes(operacaoId)
        ? prev.operacoesIds.filter(id => id !== operacaoId)
        : [...prev.operacoesIds, operacaoId];
      return { ...prev, operacoesIds };
    });
  };

  const filteredOrdens = ordens.filter(ordem => {
    // REGRA: Excluir apenas coletas, recebimentos e ordens de entrega
    // Permitir: oferta, negociando, ordem_completa, alocado
    if (ordem.tipo_ordem === "coleta" || ordem.tipo_ordem === "recebimento" || ordem.tipo_ordem === "entrega") {
      return false;
    }
    
    // Verificar tipo_registro legado para garantir exclusão de coletas/recebimentos/entregas
    const tiposExcluidosLegado = ["coleta_solicitada", "coleta_aprovada", "coleta_reprovada", "recebimento", "ordem_entrega"];
    if (tiposExcluidosLegado.includes(ordem.tipo_registro)) {
      return false;
    }

    if (filters.operacoesIds.length > 0 && !filters.operacoesIds.includes(ordem.operacao_id)) return false;
    if (filters.status && ordem.status !== filters.status) return false;
    if (filters.statusTracking && ordem.status_tracking !== filters.statusTracking) return false;
    if (filters.tiposRegistro && filters.tiposRegistro.length > 0 && !filters.tiposRegistro.includes(ordem.tipo_registro)) return false;
    if (filters.origem && !ordem.origem?.toLowerCase().includes(filters.origem.toLowerCase())) return false;
    if (filters.destino && !ordem.destino?.toLowerCase().includes(filters.destino.toLowerCase())) return false;
    
    if (filters.dataInicio && ordem.data_solicitacao) {
      if (new Date(ordem.data_solicitacao) < new Date(filters.dataInicio)) return false;
    }
    
    if (filters.dataFim && ordem.data_solicitacao) {
      const dataFim = new Date(filters.dataFim);
      dataFim.setHours(23, 59, 59, 999);
      if (new Date(ordem.data_solicitacao) > dataFim) return false;
    }

    if (!searchTerm) return true;

    const term = searchTerm.toLowerCase();
    const motorista = motoristas.find(m => m.id === ordem.motorista_id);
    const nomeMotorista = motorista?.nome || ordem.motorista_nome_temp || "";

    return (
      ordem.numero_carga?.toLowerCase().includes(term) ||
      ordem.cliente?.toLowerCase().includes(term) ||
      ordem.origem?.toLowerCase().includes(term) ||
      ordem.destino?.toLowerCase().includes(term) ||
      ordem.produto?.toLowerCase().includes(term) ||
      nomeMotorista.toLowerCase().includes(term)
    );
  });

  const inicio = (paginaAtual - 1) * limite;
  const fim = inicio + limite;
  const ordensExibidas = filteredOrdens.slice(inicio, fim);

  const handleEdit = (ordem) => {
    setEditingOrdem(ordem);
    setShowForm(true);
  };

  const handleViewDetails = (ordem) => {
    setSelectedOrdem(ordem);
  };

  const handleAbrirConferencia = async (ordem) => {
    try {
      // Carregar notas e volumes
      const [notasData, volumesDataAll] = await Promise.all([
        base44.entities.NotaFiscal.list(),
        base44.entities.Volume.list(null, 500)
      ]);

      setOrdemParaConferencia(ordem);
      setNotasFiscaisData(notasData);
      setVolumesData(volumesDataAll);
      setShowConferencia(true);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      toast.error("Erro ao carregar dados para conferência");
    }
  };

  const handleAbrirEnderecamento = async (ordem) => {
    try {
      // Carregar notas e volumes
      const [notasData, volumesDataAll] = await Promise.all([
        base44.entities.NotaFiscal.list(),
        base44.entities.Volume.list(null, 500)
      ]);

      setOrdemParaConferencia(ordem);
      setNotasFiscaisData(notasData);
      setVolumesData(volumesDataAll);
      setShowEnderecamento(true);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      toast.error("Erro ao carregar dados para endereçamento");
    }
  };

  const moverVeiculoParaStatusVinculado = async (senhaFila) => {
    try {
      // Buscar o veículo na fila com essa senha
      const veiculosNaFila = await base44.entities.FilaVeiculo.list();
      const veiculoNaFila = veiculosNaFila.find(v => v.senha_fila === senhaFila);
      
      if (!veiculoNaFila) {
        console.log("Veículo não encontrado na fila para senha:", senhaFila);
        return;
      }

      // Buscar o status que tem a flag "mover_quando_vinculado"
      const todosStatus = await base44.entities.StatusFilaVeiculo.list();
      const statusVinculado = todosStatus.find(s => s.mover_quando_vinculado === true);

      if (!statusVinculado) {
        console.log("Nenhum status configurado com flag 'mover_quando_vinculado'");
        return;
      }

      // Atualizar o status do veículo na fila
      await base44.entities.FilaVeiculo.update(veiculoNaFila.id, {
        status: statusVinculado.nome
      });

      console.log(`✅ Veículo movido para status: ${statusVinculado.nome}`);
    } catch (error) {
      console.error("Erro ao mover veículo para status vinculado:", error);
      // Não bloquear o salvamento da ordem por esse erro
    }
  };

  const handleDelete = async (ordem) => {
    if (!confirm(`Tem certeza que deseja excluir a ordem ${ordem.numero_carga || '#' + ordem.id.slice(-6)}?`)) {
      return;
    }

    try {
      await base44.entities.OrdemDeCarregamento.delete(ordem.id);
      toast.success("Ordem excluída com sucesso!");
      loadData();
    } catch (error) {
      console.error("Erro ao excluir ordem:", error);
      toast.error("Erro ao excluir ordem");
    }
  };

  const theme = {
    bg: isDark ? '#0f172a' : '#f9fafb',
    text: isDark ? '#ffffff' : '#111827',
    textMuted: isDark ? '#9ca3af' : '#6b7280',
    inputBg: isDark ? '#1e293b' : '#ffffff',
    inputBorder: isDark ? '#334155' : '#d1d5db',
    cardBg: isDark ? '#1e293b' : '#ffffff',
    cardBorder: isDark ? '#334155' : '#e5e7eb',
  };

  // Layout Tablet Otimizado
  if (isTablet) {
    return (
      <div className="min-h-screen transition-colors" style={{ backgroundColor: theme.bg }}>
        {/* Header Compacto */}
        <div className="sticky top-0 z-10 border-b px-4 py-3" style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}>
          <div className="flex items-center justify-between gap-3">
            <div className="flex-1 min-w-0">
              <h1 className="text-lg font-bold truncate" style={{ color: theme.text }}>Ordens</h1>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={loadData} style={{ borderColor: theme.inputBorder, color: theme.text }}>
                <RefreshCw className="w-4 h-4" />
              </Button>
              <Button
                variant={showFilters ? "default" : "outline"}
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                style={!showFilters ? { backgroundColor: 'transparent', borderColor: theme.inputBorder, color: theme.text } : {}}
              >
                <Filter className="w-4 h-4" />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" style={{ backgroundColor: theme.inputBg, borderColor: theme.inputBorder }}>
                  <DropdownMenuItem onClick={() => setShowTipoModal(true)} style={{ color: theme.text }}>
                    <FileText className="w-4 h-4 mr-2" />
                    Ordem Completa
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setShowOfertaForm(true)} style={{ color: theme.text }}>
                    <Package className="w-4 h-4 mr-2" />
                    Oferta
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          
          {/* Busca */}
          <div className="relative mt-3">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: theme.textMuted }} />
            <Input
              placeholder="Buscar ordem..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-10 text-base"
              style={{ backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.text }}
            />
          </div>

          {showFilters && (
            <div className="mt-3 p-3 rounded-lg border space-y-3" style={{ backgroundColor: theme.inputBg, borderColor: theme.cardBorder }}>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs mb-1 block" style={{ color: theme.textMuted }}>Status</Label>
                  <select
                    value={filters.status}
                    onChange={(e) => setFilters({...filters, status: e.target.value})}
                    className="w-full h-9 px-2 rounded border text-sm"
                    style={{ backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.text }}
                  >
                    <option value="">Todos</option>
                    <option value="novo">Novo</option>
                    <option value="aguardando_carregamento">Ag. Carregamento</option>
                    <option value="em_transito">Em Trânsito</option>
                  </select>
                </div>
                <div>
                  <Label className="text-xs mb-1 block" style={{ color: theme.textMuted }}>Tipo</Label>
                  <select
                    value={filters.tiposRegistro?.[0] || ""}
                    onChange={(e) => setFilters({...filters, tiposRegistro: e.target.value ? [e.target.value] : []})}
                    className="w-full h-9 px-2 rounded border text-sm"
                    style={{ backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.text }}
                  >
                    <option value="">Todos</option>
                    <option value="oferta">Oferta</option>
                    <option value="negociando">Negociando</option>
                    <option value="ordem_completa">Alocado</option>
                  </select>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setFilters({ operacoesIds: [], status: "", tiposRegistro: [], origem: "", destino: "", dataInicio: "", dataFim: "", statusTracking: "" })}
                className="w-full h-8"
                style={{ borderColor: theme.inputBorder, color: theme.text }}
              >
                <X className="w-3 h-3 mr-2" />
                Limpar
              </Button>
            </div>
          )}
        </div>

        {/* Grid de Ordens */}
        <div className={`p-4 ${isLandscape ? 'grid grid-cols-2 gap-4' : 'space-y-3'}`}>
          {loading ? (
            <div className="col-span-2 flex items-center justify-center py-12">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : ordensExibidas.length === 0 ? (
            <div className="col-span-2 text-center py-12" style={{ color: theme.textMuted }}>
              <Package className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p>Nenhuma ordem encontrada</p>
            </div>
          ) : (
            ordensExibidas.map(ordem => {
              const qtdNotas = ordem.notas_fiscais_ids?.length || 0;
              const motorista = motoristas.find(m => m.id === ordem.motorista_id);
              const operacao = operacoes.find(op => op.id === ordem.operacao_id);
              
              const tipoConfig = {
                oferta: { label: "Oferta", color: "bg-green-600" },
                negociando: { label: "Negociando", color: "bg-yellow-600" },
                ordem_completa: { label: "Alocado", color: "bg-blue-600" }
              };
              const tipoInfo = tipoConfig[ordem.tipo_registro] || { label: "Ordem", color: "bg-gray-500" };

              return (
                <Card key={ordem.id} style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}>
                  <CardContent className="p-4">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-base mb-1 truncate" style={{ color: theme.text }}>
                          {ordem.numero_carga}
                        </h3>
                        <p className="text-sm truncate" style={{ color: theme.textMuted }}>
                          {ordem.cliente}
                        </p>
                      </div>
                      <Badge className={`${tipoInfo.color} text-white text-xs whitespace-nowrap ml-2`}>
                        {tipoInfo.label}
                      </Badge>
                    </div>

                    {/* Info */}
                    <div className="space-y-2 text-sm mb-4">
                      <p style={{ color: theme.textMuted }}>
                        📍 {ordem.origem} → {ordem.destino}
                      </p>
                      {operacao && (
                        <Badge variant="outline" className="text-xs" style={{ borderColor: theme.cardBorder, color: theme.text }}>
                          {operacao.nome}
                        </Badge>
                      )}
                      {(motorista?.nome || ordem.motorista_nome_temp) && (
                        <p style={{ color: theme.textMuted }}>
                          👤 {motorista?.nome || ordem.motorista_nome_temp}
                        </p>
                      )}
                      <div className="flex items-center justify-between pt-2 border-t" style={{ borderColor: theme.cardBorder }}>
                        <span style={{ color: theme.textMuted }}>
                          {qtdNotas} NF{qtdNotas !== 1 ? 's' : ''}
                        </span>
                        <span className="font-semibold" style={{ color: theme.text }}>
                          {ordem.volumes_total_consolidado || 0}v | {(ordem.peso_total_consolidado || 0).toLocaleString()}kg
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        onClick={() => handleAbrirConferencia(ordem)}
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed h-11 text-sm font-medium"
                      >
                        <Scan className="w-5 h-5 mr-2" />
                        Conferir
                      </Button>
                      <Button
                        onClick={() => handleAbrirEnderecamento(ordem)}
                        size="sm"
                        className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed h-11 text-sm font-medium"
                      >
                        <Grid3x3 className="w-5 h-5 mr-2" />
                        Endereçar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>

        {/* Paginação */}
        {filteredOrdens.length > limite && (
          <div className="sticky bottom-0 border-t px-4 py-3" style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}>
            <PaginacaoControles
              paginaAtual={paginaAtual}
              totalRegistros={filteredOrdens.length}
              limite={limite}
              onPaginaAnterior={() => setPaginaAtual(prev => Math.max(1, prev - 1))}
              onProximaPagina={() => setPaginaAtual(prev => prev + 1)}
              isDark={isDark}
            />
          </div>
        )}

        {/* Modais */}
        <TipoOrdemModal open={showTipoModal} onClose={() => setShowTipoModal(false)} onSelectTipo={handleSelectTipoOrdem} />
        {showForm && (
          <OrdemUnificadaForm tipo_ordem="carregamento" open={showForm} onClose={() => { setShowForm(false); setEditingOrdem(null); }}
            onSubmit={(ordemData, notasFiscaisData) => handleSubmit(ordemData, notasFiscaisData)}
            motoristas={motoristas} veiculos={veiculos} editingOrdem={editingOrdem} user={currentUser} isDark={isDark} />
        )}
        {showOfertaForm && <OfertaCargaForm open={showOfertaForm} onClose={() => setShowOfertaForm(false)} onSubmit={handleSubmitOferta} />}
        {showOfertaLote && <OfertaCargaLote open={showOfertaLote} onClose={() => setShowOfertaLote(false)} onSubmit={handleSubmitOfertasLote} />}
        {selectedOrdem && <OrdemDetails open={!!selectedOrdem} onClose={() => setSelectedOrdem(null)} ordem={selectedOrdem} motoristas={motoristas} veiculos={veiculos} onUpdate={loadData} />}
        {showConferencia && ordemParaConferencia && (
          <ConferenciaVolumes ordem={ordemParaConferencia} notasFiscais={notasFiscaisData.filter(nota => ordemParaConferencia.notas_fiscais_ids?.includes(nota.id))}
            volumes={volumesData} onClose={() => { setShowConferencia(false); setOrdemParaConferencia(null); }}
            onComplete={async () => { setShowConferencia(false); setOrdemParaConferencia(null); await loadData(); }} />
        )}
        {showEnderecamento && ordemParaConferencia && (
          <EnderecamentoVeiculo key={`enderecamento-${ordemParaConferencia.id}-${ordemParaConferencia.notas_fiscais_ids?.length || 0}`}
            ordem={ordemParaConferencia} notasFiscais={notasFiscaisData.filter(nota => ordemParaConferencia.notas_fiscais_ids?.includes(nota.id))}
            volumes={volumesData.filter(v => ordemParaConferencia.notas_fiscais_ids?.some(nfId => { const nf = notasFiscaisData.find(n => n.id === nfId); return nf && v.nota_fiscal_id === nf.id; }))}
            onClose={() => { setShowEnderecamento(false); setOrdemParaConferencia(null); }}
            onComplete={async () => { setShowEnderecamento(false); setOrdemParaConferencia(null); await loadData(); }} />
        )}
      </div>
    );
  }

  // Layout Desktop
  return (
    <div className="p-6 min-h-screen transition-colors" style={{ backgroundColor: theme.bg }}>
      <div className="max-w-[1800px] mx-auto">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
          <div>
            <h1 className="text-2xl font-bold mb-1" style={{ color: theme.text }}>Ordens de Carregamento</h1>
            <p className="text-sm" style={{ color: theme.textMuted }}>Gerencie todas as ordens de carregamento</p>
          </div>
          
          <div className="flex gap-2 w-full lg:w-auto">
            <div className="relative flex-1 lg:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: theme.textMuted }} />
              <Input
                placeholder="Buscar ordens..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-9 text-sm"
                style={{ backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.text }}
              />
            </div>

            <FiltrosPredefinidos
              rota="ordens"
              filtrosAtuais={filters}
              onAplicarFiltro={(novosFiltros) => {
                setFilters(novosFiltros);
                setPaginaAtual(1);
              }}
            />
            <PaginacaoControles
              paginaAtual={paginaAtual}
              totalRegistros={filteredOrdens.length}
              limite={limite}
              onPaginaAnterior={() => setPaginaAtual(prev => Math.max(1, prev - 1))}
              onProximaPagina={() => setPaginaAtual(prev => prev + 1)}
              isDark={isDark}
            />
            <Button
              variant={showFilters ? "default" : "outline"}
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="h-9"
              style={!showFilters ? {
                backgroundColor: 'transparent',
                borderColor: theme.inputBorder,
                color: theme.text
              } : {}}
            >
              <Filter className="w-4 h-4" />
            </Button>

            <ExportarOfertasPDF ordens={filteredOrdens} />
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 h-9 text-sm flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Nova Ordem
                  <ChevronDown className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56" style={{ backgroundColor: theme.inputBg, borderColor: theme.inputBorder }}>
                <DropdownMenuItem onClick={() => setShowTipoModal(true)} style={{ color: theme.text }}>
                  <FileText className="w-4 h-4 mr-2" />
                  Ordem Completa
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setShowOfertaForm(true)} style={{ color: theme.text }}>
                  <Package className="w-4 h-4 mr-2 text-green-600" />
                  Oferta de Carga
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setShowOfertaLote(true)} style={{ color: theme.text }}>
                  <FileSpreadsheet className="w-4 h-4 mr-2 text-purple-600" />
                  Lançamento em Lote
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {showFilters && (
          <Card className="mb-4" style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}>
            <CardContent className="pt-4 pb-4">
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-3">
                <div className="md:col-span-2">
                  <Label className="text-xs mb-2 block" style={{ color: theme.textMuted }}>Operações (múltiplas)</Label>
                  <div className="flex flex-wrap gap-2">
                    {operacoes.map((op) => (
                      <Badge
                        key={op.id}
                        variant={filters.operacoesIds.includes(op.id) ? "default" : "outline"}
                        className="cursor-pointer hover:opacity-80 transition-opacity"
                        style={filters.operacoesIds.includes(op.id) ? {
                          backgroundColor: '#3b82f6',
                          color: 'white'
                        } : {
                          backgroundColor: 'transparent',
                          borderColor: theme.inputBorder,
                          color: theme.text
                        }}
                        onClick={() => toggleOperacao(op.id)}
                      >
                        {op.nome}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="md:col-span-2">
                  <Label className="text-xs mb-2 block" style={{ color: theme.textMuted }}>Tipo de Registro (múltiplos)</Label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { value: "oferta", label: "Oferta", color: "green" },
                      { value: "negociando", label: "Negociando", color: "yellow" },
                      { value: "ordem_completa", label: "Ordem Completa", color: "blue" }
                    ].map((tipo) => (
                      <Badge
                        key={tipo.value}
                        variant={filters.tiposRegistro?.includes(tipo.value) ? "default" : "outline"}
                        className="cursor-pointer hover:opacity-80 transition-opacity"
                        style={filters.tiposRegistro?.includes(tipo.value) ? {
                          backgroundColor: tipo.color === "green" ? "#16a34a" : tipo.color === "yellow" ? "#ca8a04" : "#3b82f6",
                          color: "white"
                        } : {
                          backgroundColor: 'transparent',
                          borderColor: theme.inputBorder,
                          color: theme.text
                        }}
                        onClick={() => {
                          const tiposRegistro = filters.tiposRegistro?.includes(tipo.value)
                            ? filters.tiposRegistro.filter(t => t !== tipo.value)
                            : [...(filters.tiposRegistro || []), tipo.value];
                          setFilters({...filters, tiposRegistro});
                        }}
                      >
                        {tipo.label}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="text-xs mb-1" style={{ color: theme.textMuted }}>Status</Label>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="w-full h-8 justify-between text-sm" style={{ backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.text }}>
                        {filters.status || 'Todos'}
                        <ChevronDown className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}>
                      <DropdownMenuItem onClick={() => setFilters({...filters, status: ""})} style={{ color: theme.text }}>Todos</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setFilters({...filters, status: "novo"})} style={{ color: theme.text }}>Novo</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setFilters({...filters, status: "pendente_cadastro"})} style={{ color: theme.text }}>Pendente Cadastro</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setFilters({...filters, status: "aguardando_carregamento"})} style={{ color: theme.text }}>Aguardando Carregamento</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setFilters({...filters, status: "em_transito"})} style={{ color: theme.text }}>Em Trânsito</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setFilters({...filters, status: "entregue"})} style={{ color: theme.text }}>Entregue</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setFilters({...filters, status: "finalizado"})} style={{ color: theme.text }}>Finalizado</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setFilters({...filters, status: "cancelado"})} style={{ color: theme.text }}>Cancelado</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div>
                  <Label className="text-xs mb-1" style={{ color: theme.textMuted }}>Status Tracking</Label>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="w-full h-8 justify-between text-sm" style={{ backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.text }}>
                        {filters.statusTracking || 'Todos'}
                        <ChevronDown className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}>
                      <DropdownMenuItem onClick={() => setFilters({...filters, statusTracking: ""})} style={{ color: theme.text }}>Todos</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setFilters({...filters, statusTracking: "aguardando_agendamento"})} style={{ color: theme.text }}>Aguardando Agendamento</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setFilters({...filters, statusTracking: "carregamento_agendado"})} style={{ color: theme.text }}>Carregamento Agendado</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setFilters({...filters, statusTracking: "em_carregamento"})} style={{ color: theme.text }}>Em Carregamento</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setFilters({...filters, statusTracking: "carregado"})} style={{ color: theme.text }}>Carregado</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setFilters({...filters, statusTracking: "em_viagem"})} style={{ color: theme.text }}>Em Viagem</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setFilters({...filters, statusTracking: "chegada_destino"})} style={{ color: theme.text }}>Chegada Destino</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setFilters({...filters, statusTracking: "descarga_agendada"})} style={{ color: theme.text }}>Descarga Agendada</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setFilters({...filters, statusTracking: "em_descarga"})} style={{ color: theme.text }}>Em Descarga</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setFilters({...filters, statusTracking: "descarga_realizada"})} style={{ color: theme.text }}>Descarga Realizada</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setFilters({...filters, statusTracking: "finalizado"})} style={{ color: theme.text }}>Finalizado</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div>
                  <Label className="text-xs mb-1" style={{ color: theme.textMuted }}>Origem</Label>
                  <Input
                    value={filters.origem}
                    onChange={(e) => setFilters({...filters, origem: e.target.value})}
                    placeholder="Filtrar por origem"
                    className="h-8 text-sm"
                    style={{ backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.text }}
                  />
                </div>

                <div>
                  <Label className="text-xs mb-1" style={{ color: theme.textMuted }}>Destino</Label>
                  <Input
                    value={filters.destino}
                    onChange={(e) => setFilters({...filters, destino: e.target.value})}
                    placeholder="Filtrar por destino"
                    className="h-8 text-sm"
                    style={{ backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.text }}
                  />
                </div>

                <div className="md:col-span-3 lg:col-span-4">
                  <FiltroDataPeriodo
                    periodoSelecionado={periodoSelecionado}
                    onPeriodoChange={setPeriodoSelecionado}
                    dataInicio={filters.dataInicio}
                    dataFim={filters.dataFim}
                    onDataInicioChange={(val) => setFilters({...filters, dataInicio: val})}
                    onDataFimChange={(val) => setFilters({...filters, dataFim: val})}
                    isDark={isDark}
                  />
                </div>

                  <div>
                  <Label className="text-xs mb-1" style={{ color: theme.textMuted }}>Tipo</Label>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="w-full h-8 justify-between text-sm" style={{ backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.text }}>
                        {filters.tipoRegistro === "coleta" ? "Coleta" : filters.tipoRegistro === "ordem" ? "Ordem de Carga" : "Todos"}
                        <ChevronDown className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}>
                      <DropdownMenuItem onClick={() => setFilters({...filters, tipoRegistro: ""})} style={{ color: theme.text }}>Todos</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setFilters({...filters, tipoRegistro: "coleta"})} style={{ color: theme.text }}>Coleta</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setFilters({...filters, tipoRegistro: "ordem"})} style={{ color: theme.text }}>Ordem de Carga</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  </div>
                  </div>
              <div className="flex justify-end mt-3 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setFilters({
                    operacoesIds: [], status: "", tiposRegistro: [],
                    origem: "", destino: "", dataInicio: "", dataFim: "", tipoRegistro: "", statusTracking: ""
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

        <OrdensTableEditable
          ordens={ordensExibidas}
          motoristas={motoristas}
          veiculos={veiculos}
          operacoes={operacoes}
          loading={loading}
          onEdit={handleEdit}
          onViewDetails={handleViewDetails}
          onDelete={handleDelete}
          onUpdate={loadData}
          onConferencia={handleAbrirConferencia}
          onEnderecamento={handleAbrirEnderecamento}
        />
      </div>

      <TipoOrdemModal
        open={showTipoModal}
        onClose={() => setShowTipoModal(false)}
        onSelectTipo={handleSelectTipoOrdem}
      />

      {showForm && (
        <OrdemUnificadaForm
          tipo_ordem="carregamento"
          open={showForm}
          onClose={() => {
            setShowForm(false);
            setEditingOrdem(null);
          }}
          onSubmit={(ordemData, notasFiscaisData) => handleSubmit(ordemData, notasFiscaisData)}
          motoristas={motoristas}
          veiculos={veiculos}
          editingOrdem={editingOrdem}
          user={currentUser}
          isDark={isDark}
        />
      )}

      {showOfertaForm && (
        <OfertaCargaForm
          open={showOfertaForm}
          onClose={() => setShowOfertaForm(false)}
          onSubmit={handleSubmitOferta}
        />
      )}

      {showOfertaLote && (
        <OfertaCargaLote
          open={showOfertaLote}
          onClose={() => setShowOfertaLote(false)}
          onSubmit={handleSubmitOfertasLote}
        />
      )}

      {selectedOrdem && (
        <OrdemDetails
          open={!!selectedOrdem}
          onClose={() => setSelectedOrdem(null)}
          ordem={selectedOrdem}
          motoristas={motoristas}
          veiculos={veiculos}
          onUpdate={loadData}
        />
      )}

      {/* Modal de Conferência */}
      {showConferencia && ordemParaConferencia && (
        <ConferenciaVolumes
          ordem={ordemParaConferencia}
          notasFiscais={notasFiscaisData.filter(nota => 
            ordemParaConferencia.notas_fiscais_ids?.includes(nota.id)
          )}
          volumes={volumesData}
          onClose={() => {
            setShowConferencia(false);
            setOrdemParaConferencia(null);
          }}
          onComplete={async () => {
            setShowConferencia(false);
            setOrdemParaConferencia(null);
            await loadData();
          }}
        />
      )}

      {/* Modal de Endereçamento */}
      {showEnderecamento && ordemParaConferencia && (
        <EnderecamentoVeiculo
          key={`enderecamento-${ordemParaConferencia.id}-${ordemParaConferencia.notas_fiscais_ids?.length || 0}`}
          ordem={ordemParaConferencia}
          notasFiscais={notasFiscaisData.filter(nota => 
            ordemParaConferencia.notas_fiscais_ids?.includes(nota.id)
          )}
          volumes={volumesData.filter(v => 
            ordemParaConferencia.notas_fiscais_ids?.some(nfId => {
              const nf = notasFiscaisData.find(n => n.id === nfId);
              return nf && v.nota_fiscal_id === nf.id;
            })
          )}
          onClose={() => {
            setShowEnderecamento(false);
            setOrdemParaConferencia(null);
          }}
          onComplete={async () => {
            setShowEnderecamento(false);
            setOrdemParaConferencia(null);
            await loadData();
          }}
        />
      )}
      </div>
      );
      }