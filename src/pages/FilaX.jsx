import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Truck, Plus, RefreshCw, Settings, Search, X, Trash2, Edit, Clock, LayoutGrid, Table, GripVertical, MapPin, Share2, Copy, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import FilaKanban from "../components/fila/FilaKanban";
import AdicionarFilaCarousel from "../components/fila/AdicionarFilaCarousel";
import { createPageUrl } from "@/utils";

export default function FilaX() {
  const [isDark, setIsDark] = useState(false);
  const [loading, setLoading] = useState(true);
  const [fila, setFila] = useState([]);
  const [tiposFila, setTiposFila] = useState([]);
  const [statusFila, setStatusFila] = useState([]);
  const [motoristas, setMotoristas] = useState([]);
  const [veiculos, setVeiculos] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showTiposModal, setShowTiposModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [searchMotorista, setSearchMotorista] = useState("");
  const [searchPlaca, setSearchPlaca] = useState("");
  const [filteredMotoristas, setFilteredMotoristas] = useState([]);
  const [filteredVeiculos, setFilteredVeiculos] = useState([]);
  const [editingTipo, setEditingTipo] = useState(null);
  const [novoTipo, setNovoTipo] = useState({ nome: "", cor: "#3b82f6" });
  const [editingStatus, setEditingStatus] = useState(null);
  const [novoStatus, setNovoStatus] = useState({ nome: "", cor: "#3b82f6", icone: "🟢", remove_da_fila: false });
  const [editingCell, setEditingCell] = useState(null);
  const [editValue, setEditValue] = useState("");
  const [viewMode, setViewMode] = useState("table"); // "table" ou "kanban"
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [abaAtiva, setAbaAtiva] = useState("fila"); // "fila" ou "historico"
  const [ordensHistorico, setOrdensHistorico] = useState([]);
  const [historicoFila, setHistoricoFila] = useState([]);
  const [isMobile, setIsMobile] = useState(false);
  const [etapaModal, setEtapaModal] = useState("telefone"); // "telefone" ou "formulario"
  const [telefoneBusca, setTelefoneBusca] = useState("");
  const [buscandoMotorista, setBuscandoMotorista] = useState(false);
  const [preenchidoAutomatico, setPreenchidoAutomatico] = useState(false);
  const [motoristaEncontrado, setMotoristaEncontrado] = useState(false);
  const [feedbackTelefone, setFeedbackTelefone] = useState(null); // null, 'encontrado', 'novo'
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [filaCriada, setFilaCriada] = useState(null);

  const [formData, setFormData] = useState({
    motorista_id: "",
    motorista_nome: "",
    motorista_cpf: "",
    motorista_telefone: "",
    cavalo_id: "",
    cavalo_placa: "",
    implemento1_id: "",
    implemento1_placa: "",
    implemento2_id: "",
    implemento2_placa: "",
    tipo_fila_id: "",
    tipo_veiculo: "",
    tipo_carroceria: "",
    localizacao_atual: "",
    cidade_uf: "",
    observacoes: ""
  });

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
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    loadData();
  }, []);

  const recalcularPosicoesFIFO = async (empresaId) => {
    try {
      // Buscar todas as marcações da empresa
      const todasMarcacoes = await base44.entities.FilaVeiculo.filter({ empresa_id: empresaId });
      
      // Ordenar por data de entrada (FIFO)
      const ordenadas = todasMarcacoes.sort((a, b) => {
        const dataA = new Date(a.data_entrada_fila || 0);
        const dataB = new Date(b.data_entrada_fila || 0);
        return dataA - dataB;
      });
      
      // Atualizar posições em lote
      for (let i = 0; i < ordenadas.length; i++) {
        const novaPosicao = i + 1;
        if (ordenadas[i].posicao_fila !== novaPosicao) {
          await base44.entities.FilaVeiculo.update(ordenadas[i].id, { posicao_fila: novaPosicao });
        }
      }
    } catch (error) {
      console.error("Erro ao recalcular posições:", error);
    }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const user = await base44.auth.me();
      const [filaData, tiposData, statusData, motoristasData, veiculosData, ordensData, allFilaData] = await Promise.all([
        base44.entities.FilaVeiculo.filter({ empresa_id: user.empresa_id, data_saida_fila: null }, "posicao_fila"),
        base44.entities.TipoFilaVeiculo.filter({ empresa_id: user.empresa_id, ativo: true }, "ordem"),
        base44.entities.StatusFilaVeiculo.filter({ empresa_id: user.empresa_id, ativo: true }, "ordem"),
        base44.entities.Motorista.list(),
        base44.entities.Veiculo.filter({ tipo: "cavalo" }),
        base44.entities.OrdemDeCarregamento.filter({ empresa_id: user.empresa_id }, "-created_date", 500),
        base44.entities.FilaVeiculo.filter({ empresa_id: user.empresa_id }, "-data_saida_fila", 500)
      ]);

      const historicoFilaData = allFilaData.filter(i => i.data_saida_fila);

      setFila(filaData);
      setTiposFila(tiposData);
      setStatusFila(statusData);
      setMotoristas(motoristasData);
      setVeiculos(veiculosData);
      setOrdensHistorico(ordensData);
      setHistoricoFila(historicoFilaData);

      // Se não há tipos, criar os padrões
      if (tiposData.length === 0) {
        await criarTiposPadrao(user.empresa_id);
      }

      // Se não há status, criar os padrões
      if (statusData.length === 0) {
        await criarStatusPadrao(user.empresa_id);
      }

      // Recarregar dados se criou tipos/status
      if (tiposData.length === 0 || statusData.length === 0) {
        await loadData();
        return;
      }
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      toast.error("Erro ao carregar dados");
    } finally {
      setLoading(false);
    }
  };

  const criarTiposPadrao = async (empresaId) => {
    const tiposPadrao = [
      { nome: "Frota", cor: "#2563eb", ordem: 1 },
      { nome: "Acionista", cor: "#16a34a", ordem: 2 },
      { nome: "Agregado", cor: "#ea580c", ordem: 3 },
      { nome: "Terceiro", cor: "#6366f1", ordem: 4 }
    ];

    for (const tipo of tiposPadrao) {
      await base44.entities.TipoFilaVeiculo.create({
        ...tipo,
        empresa_id: empresaId,
        ativo: true
      });
    }

    await loadData();
    toast.success("Tipos de fila criados");
  };

  const criarStatusPadrao = async (empresaId) => {
    const statusPadrao = [
      { nome: "Aguardando", cor: "#16a34a", icone: "🟢", ordem: 1 },
      { nome: "Em Operação", cor: "#2563eb", icone: "🔵", ordem: 2 },
      { nome: "Indisponível", cor: "#dc2626", icone: "🔴", ordem: 3 }
    ];

    for (const status of statusPadrao) {
      await base44.entities.StatusFilaVeiculo.create({
        ...status,
        empresa_id: empresaId,
        ativo: true
      });
    }

    await loadData();
    toast.success("Status de fila criados");
  };

  const handleSearchMotorista = (termo) => {
    setSearchMotorista(termo);
    if (!termo.trim()) {
      setFilteredMotoristas([]);
      return;
    }

    const resultados = motoristas.filter(m =>
      m.nome?.toLowerCase().includes(termo.toLowerCase()) ||
      m.cpf?.includes(termo) ||
      m.celular?.includes(termo)
    );
    setFilteredMotoristas(resultados);
  };

  const handleSearchPlaca = (termo) => {
    setSearchPlaca(termo);
    if (!termo.trim()) {
      setFilteredVeiculos([]);
      return;
    }

    const resultados = veiculos.filter(v =>
      v.placa?.toLowerCase().includes(termo.toLowerCase())
    );
    setFilteredVeiculos(resultados);
  };

  const handleSelecionarMotorista = (motorista) => {
    setFormData(prev => ({
      ...prev,
      motorista_id: motorista.id,
      motorista_nome: motorista.nome,
      motorista_telefone: motorista.celular,
      cavalo_id: motorista.cavalo_id || ""
    }));

    // Buscar placas dos veículos vinculados
    if (motorista.cavalo_id) {
      const cavalo = veiculos.find(v => v.id === motorista.cavalo_id);
      if (cavalo) {
        setFormData(prev => ({ ...prev, cavalo_placa: cavalo.placa }));
      }
    }

    setSearchMotorista("");
    setFilteredMotoristas([]);
    toast.success("Motorista selecionado");
  };

  const handleSelecionarVeiculo = (veiculo) => {
    setFormData(prev => ({
      ...prev,
      cavalo_id: veiculo.id,
      cavalo_placa: veiculo.placa,
      tipo_veiculo: veiculo.tipo,
      tipo_carroceria: veiculo.carroceria
    }));
    setSearchPlaca("");
    setFilteredVeiculos([]);
    toast.success("Veículo selecionado");
  };

  // Buscar motorista automaticamente ao completar telefone
  useEffect(() => {
    const verificarMotorista = async () => {
      const telefoneLimpo = telefoneBusca.replace(/\D/g, '');
      
      if (telefoneLimpo.length !== 11) {
        setFeedbackTelefone(null);
        return;
      }

      setBuscandoMotorista(true);
      try {
        const motoristasEncontrados = motoristas.filter(m => 
          m.celular?.replace(/\D/g, '') === telefoneLimpo
        );

        if (motoristasEncontrados.length > 0) {
          const motorista = motoristasEncontrados[0];
          const cavalo = veiculos.find(v => v.id === motorista.cavalo_id);
          
          setFormData(prev => ({
            ...prev,
            motorista_id: motorista.id,
            motorista_nome: motorista.nome,
            motorista_telefone: telefoneLimpo,
            cavalo_id: motorista.cavalo_id || "",
            cavalo_placa: cavalo?.placa || "",
            tipo_veiculo: cavalo?.tipo || "",
            tipo_carroceria: cavalo?.carroceria || ""
          }));

          setMotoristaEncontrado(true);
          setPreenchidoAutomatico(true);
          setFeedbackTelefone('encontrado');
        } else {
          setFormData(prev => ({
            ...prev,
            motorista_telefone: telefoneLimpo
          }));
          setMotoristaEncontrado(false);
          setPreenchidoAutomatico(false);
          setFeedbackTelefone('novo');
        }
      } catch (error) {
        console.error("Erro ao buscar motorista:", error);
      } finally {
        setBuscandoMotorista(false);
      }
    };

    verificarMotorista();
  }, [telefoneBusca, motoristas, veiculos]);

  const handleBuscarMotorista = async () => {
    const telefoneLimpo = telefoneBusca.replace(/\D/g, '');
    
    if (telefoneLimpo.length !== 11) {
      toast.error("Digite um telefone válido com DDD");
      return;
    }

    setEtapaModal("formulario");
  };

  const handleAdicionarFila = async (e) => {
    if (e && e.preventDefault) {
      e.preventDefault();
    }

    if (!formData.motorista_nome || !formData.cavalo_placa || !formData.tipo_fila_id || !formData.motorista_telefone) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    try {
      const user = await base44.auth.me();
      const tipoSelecionado = tiposFila.find(t => t.id === formData.tipo_fila_id);

      // Pegar o primeiro status ou "aguardando" como padrão
      const statusPadrao = statusFila[0]?.nome.toLowerCase().replace(/ /g, '_') || "aguardando";

      // Gerar senha única alfanumérica de 4 dígitos
      const gerarSenhaFila = () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let senha = '';
        for (let i = 0; i < 4; i++) {
          senha += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return senha;
      };

      const senhaFila = gerarSenhaFila();

      await base44.entities.FilaVeiculo.create({
        empresa_id: user.empresa_id,
        ...formData,
        senha_fila: senhaFila,
        tipo_fila_nome: tipoSelecionado?.nome,
        status: statusPadrao,
        posicao_fila: 0, // Será recalculado
        data_entrada_fila: new Date().toISOString()
      });

      // Recalcular todas as posições FIFO
      await recalcularPosicoesFIFO(user.empresa_id);

      toast.success(`Check-in realizado! Senha: ${senhaFila}`);
      setShowAddModal(false);
      setEtapaModal("telefone");
      setTelefoneBusca("");
      setPreenchidoAutomatico(false);
      setMotoristaEncontrado(false);
      setFeedbackTelefone(null);
      setFormData({
        motorista_id: "",
        motorista_nome: "",
        motorista_cpf: "",
        motorista_telefone: "",
        cavalo_id: "",
        cavalo_placa: "",
        implemento1_id: "",
        implemento1_placa: "",
        implemento2_id: "",
        implemento2_placa: "",
        tipo_fila_id: "",
        tipo_veiculo: "",
        tipo_carroceria: "",
        localizacao_atual: "",
        cidade_uf: "",
        observacoes: ""
      });
      
      // Recarregar dados
      await loadData();
    } catch (error) {
      console.error("Erro ao adicionar à fila:", error);
      toast.error("Erro ao adicionar veículo");
    }
  };

  const handleRemoverDaFila = async (id) => {
    if (!confirm("Remover este veículo da fila?")) return;

    try {
      const user = await base44.auth.me();
      await base44.entities.FilaVeiculo.delete(id);
      
      // Recalcular todas as posições FIFO
      await recalcularPosicoesFIFO(user.empresa_id);
      
      toast.success("Veículo removido da fila");
      await loadData();
    } catch (error) {
      console.error("Erro ao remover:", error);
      toast.error("Erro ao remover veículo");
    }
  };

  const handleSalvarTipo = async (e) => {
    e.preventDefault();

    if (!novoTipo.nome) {
      toast.error("Nome do tipo é obrigatório");
      return;
    }

    try {
      const user = await base44.auth.me();
      
      if (editingTipo) {
        await base44.entities.TipoFilaVeiculo.update(editingTipo.id, novoTipo);
        toast.success("Tipo atualizado");
      } else {
        const proximaOrdem = tiposFila.length + 1;
        await base44.entities.TipoFilaVeiculo.create({
          ...novoTipo,
          empresa_id: user.empresa_id,
          ordem: proximaOrdem,
          ativo: true
        });
        toast.success("Tipo criado");
      }

      setNovoTipo({ nome: "", cor: "#3b82f6" });
      setEditingTipo(null);
      loadData();
    } catch (error) {
      console.error("Erro ao salvar tipo:", error);
      toast.error("Erro ao salvar tipo");
    }
  };

  const handleExcluirTipo = async (id) => {
    if (!confirm("Excluir este tipo de fila?")) return;

    try {
      await base44.entities.TipoFilaVeiculo.delete(id);
      toast.success("Tipo excluído");
      loadData();
    } catch (error) {
      console.error("Erro ao excluir tipo:", error);
      toast.error("Erro ao excluir tipo");
    }
  };

  const handleSalvarStatus = async (e) => {
    e.preventDefault();

    if (!novoStatus.nome) {
      toast.error("Nome do status é obrigatório");
      return;
    }

    try {
      const user = await base44.auth.me();
      
      if (editingStatus) {
        await base44.entities.StatusFilaVeiculo.update(editingStatus.id, novoStatus);
        toast.success("Status atualizado");
      } else {
        const proximaOrdem = statusFila.length + 1;
        await base44.entities.StatusFilaVeiculo.create({
          ...novoStatus,
          empresa_id: user.empresa_id,
          ordem: proximaOrdem,
          ativo: true
        });
        toast.success("Status criado");
      }

      setNovoStatus({ nome: "", cor: "#3b82f6", icone: "🟢", remove_da_fila: false });
      setEditingStatus(null);
      loadData();
    } catch (error) {
      console.error("Erro ao salvar status:", error);
      toast.error("Erro ao salvar status");
    }
  };

  const handleExcluirStatus = async (id) => {
    if (!confirm("Excluir este status?")) return;

    try {
      await base44.entities.StatusFilaVeiculo.delete(id);
      toast.success("Status excluído");
      loadData();
    } catch (error) {
      console.error("Erro ao excluir status:", error);
      toast.error("Erro ao excluir status");
    }
  };

  const calcularTempoNaFila = (dataEntrada, dataSaida) => {
    if (!dataEntrada) return "-";
    const inicio = new Date(dataEntrada);
    const fim = dataSaida ? new Date(dataSaida) : new Date();
    const diffMs = fim - inicio;
    const diffHoras = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutos = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    if (diffHoras > 0) {
      return `${diffHoras}h ${diffMinutos}min`;
    }
    return `${diffMinutos}min`;
  };

  const formatarTelefone = (telefone) => {
    if (!telefone) return "-";
    const numeros = telefone.replace(/\D/g, '');
    if (numeros.length === 11) {
      return `(${numeros.slice(0, 2)}) ${numeros.slice(2, 7)}-${numeros.slice(7)}`;
    } else if (numeros.length === 10) {
      return `(${numeros.slice(0, 2)}) ${numeros.slice(2, 6)}-${numeros.slice(6)}`;
    }
    return numeros;
  };

  const abrirWhatsApp = (telefone) => {
    if (!telefone) return;
    const numeros = telefone.replace(/\D/g, '');
    const numero = numeros.startsWith('55') ? numeros : `55${numeros}`;
    window.open(`https://wa.me/${numero}`, '_blank');
  };

  const handleDoubleClick = (itemId, field, currentValue) => {
    setEditingCell({ itemId, field });
    setEditValue(currentValue || "");
  };

  const handleSaveEdit = async () => {
    if (!editingCell) return;

    try {
      let updates = { [editingCell.field]: editValue };

      // Se editou nome do motorista, buscar dados do motorista
      if (editingCell.field === 'motorista_nome') {
        const termo = editValue.toLowerCase();
        const motorista = motoristas.find(m => 
          m.nome?.toLowerCase().includes(termo)
        );

        if (motorista) {
          // Buscar placas vinculadas - buscar todos os implementos
          const allVeiculos = await base44.entities.Veiculo.list();
          const cavalo = allVeiculos.find(v => v.id === motorista.cavalo_id);
          const implemento1 = allVeiculos.find(v => v.id === motorista.implemento1_id);
          const implemento2 = allVeiculos.find(v => v.id === motorista.implemento2_id);

          updates = {
            motorista_id: motorista.id,
            motorista_nome: motorista.nome,
            motorista_cpf: motorista.cpf,
            motorista_telefone: motorista.celular,
            cavalo_id: motorista.cavalo_id || "",
            cavalo_placa: cavalo?.placa || "",
            implemento1_id: motorista.implemento1_id || "",
            implemento1_placa: implemento1?.placa || "",
            implemento2_id: motorista.implemento2_id || "",
            implemento2_placa: implemento2?.placa || ""
          };
          toast.success("Dados do motorista carregados!");
        }
      }

      // Formatar telefone antes de salvar
      if (editingCell.field === 'motorista_telefone') {
        updates[editingCell.field] = formatarTelefone(editValue);
      }

      await base44.entities.FilaVeiculo.update(editingCell.itemId, updates);
      toast.success("Atualizado com sucesso!");
      
      // Atualizar estado local sem recarregar
      setFila(prev => prev.map(item => 
        item.id === editingCell.itemId ? { ...item, ...updates } : item
      ));
      
      setEditingCell(null);
      setEditValue("");
    } catch (error) {
      console.error("Erro ao atualizar:", error);
      toast.error("Erro ao atualizar campo");
    }
  };

  const handleCancelEdit = () => {
    setEditingCell(null);
    setEditValue("");
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSaveEdit();
    } else if (e.key === 'Escape') {
      handleCancelEdit();
    }
  };

  const handleObterLocalizacao = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocalização não suportada neste navegador");
      return;
    }

    setLoadingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        try {
          // Reverter coordenadas para endereço usando API de geocoding
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`
          );
          const data = await response.json();
          
          const endereco = data.display_name || `${latitude}, ${longitude}`;
          
          // Extrair cidade e UF do endereço
          const cidade = data.address?.city || data.address?.town || data.address?.municipality || "";
          const estado = data.address?.state || "";
          const cidadeUF = cidade && estado ? `${cidade}, ${estado}` : "";
          
          setFormData(prev => ({ 
            ...prev, 
            localizacao_atual: endereco,
            cidade_uf: cidadeUF
          }));
          toast.success("Localização obtida!");
        } catch (error) {
          console.error("Erro ao obter endereço:", error);
          setFormData(prev => ({ 
            ...prev, 
            localizacao_atual: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}` 
          }));
          toast.success("Coordenadas obtidas!");
        } finally {
          setLoadingLocation(false);
        }
      },
      (error) => {
        console.error("Erro ao obter localização:", error);
        toast.error("Erro ao obter localização");
        setLoadingLocation(false);
      }
    );
  };

  const handleDragEnd = async (result) => {
    if (!result.destination) return;

    const { source, destination, draggableId } = result;

    // Se soltou no mesmo lugar, não faz nada
    if (source.droppableId === destination.droppableId && source.index === destination.index) {
      return;
    }

    try {
      // Encontrar o status de destino
      const statusDestino = statusFila.find(s => s.id === destination.droppableId);
      if (!statusDestino) return;

      const statusNormalizado = statusDestino.nome.toLowerCase().replace(/ /g, '_');
      const user = await base44.auth.me();
      
      const updates = { 
        status: statusNormalizado
      };

      // Se mudou para status que remove da fila, registrar saída
      if (statusDestino.remove_da_fila) {
        const item = fila.find(f => f.id === draggableId);
        if (item && !item.data_saida_fila) {
          updates.data_saida_fila = new Date().toISOString();
        }
      }

      await base44.entities.FilaVeiculo.update(draggableId, updates);
      
      // Recalcular todas as posições FIFO
      await recalcularPosicoesFIFO(user.empresa_id);
      
      // Recarregar dados para refletir as novas posições
      await loadData();
      
      toast.success("Status atualizado!");
    } catch (error) {
      console.error("Erro ao atualizar status:", error);
      toast.error("Erro ao atualizar status");
    }
  };

  const handleCompartilharLink = async () => {
    try {
      const user = await base44.auth.me();
      if (!user.empresa_id) {
        toast.error("Empresa não identificada");
        return;
      }
      
      const linkPublico = "https://logiflow.com.br" + createPageUrl("FilaMotorista") + "?empresa_id=" + user.empresa_id;
      
      await navigator.clipboard.writeText(linkPublico);
      toast.success("Link exclusivo da sua empresa copiado!");
    } catch (error) {
      console.error("Erro ao copiar:", error);
      toast.error("Erro ao copiar link");
    }
  };

  const theme = {
    bg: isDark ? '#0f172a' : '#f9fafb',
    cardBg: isDark ? '#1e293b' : '#ffffff',
    cardBorder: isDark ? '#334155' : '#e5e7eb',
    text: isDark ? '#f1f5f9' : '#111827',
    textMuted: isDark ? '#94a3b8' : '#6b7280',
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
    <div className="p-4 md:p-6 min-h-screen pb-24 md:pb-6" style={{ backgroundColor: theme.bg }}>
      <div className="max-w-7xl mx-auto space-y-4 md:space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold mb-1" style={{ color: theme.text }}>Fila X</h1>
            <p className="text-xs md:text-sm" style={{ color: theme.textMuted }}>
              Gerenciamento de fila de veículos disponíveis
            </p>
          </div>
          <div className="flex flex-wrap gap-2 w-full md:w-auto">
            <div className="flex border rounded-lg" style={{ borderColor: theme.cardBorder }}>
              <Button
                variant={viewMode === "table" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("table")}
                className={viewMode === "table" ? "bg-blue-600 hover:bg-blue-700" : ""}
              >
                <Table className="w-4 h-4 md:mr-2" />
                <span className="hidden md:inline">Tabela</span>
              </Button>
              <Button
                variant={viewMode === "kanban" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("kanban")}
                className={viewMode === "kanban" ? "bg-blue-600 hover:bg-blue-700" : ""}
              >
                <LayoutGrid className="w-4 h-4 md:mr-2" />
                <span className="hidden md:inline">Kanban</span>
              </Button>
            </div>
            <Button
              variant="outline"
              onClick={() => setShowTiposModal(true)}
              size="sm"
              className="hidden md:flex"
              style={{ borderColor: theme.cardBorder, color: theme.text }}
            >
              <Settings className="w-4 h-4 mr-2" />
              Gerenciar Tipos
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowStatusModal(true)}
              size="sm"
              className="hidden md:flex"
              style={{ borderColor: theme.cardBorder, color: theme.text }}
            >
              <Settings className="w-4 h-4 mr-2" />
              Gerenciar Status
            </Button>
            <Button
              variant="outline"
              onClick={loadData}
              size="sm"
              style={{ borderColor: theme.cardBorder, color: theme.text }}
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              onClick={handleCompartilharLink}
              size="sm"
              className="gap-2"
              style={{ borderColor: theme.cardBorder, color: theme.text }}
              title="Copiar link exclusivo da sua empresa"
            >
              <Share2 className="w-4 h-4" />
              <span className="hidden md:inline">Link Exclusivo</span>
            </Button>
            <Button
              onClick={() => setShowAddModal(true)}
              size="sm"
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Adicionar
            </Button>
          </div>
        </div>

        {/* Tabs Fila / Histórico */}
        <div className="flex gap-2 mb-4">
          <Button
            variant={abaAtiva === "fila" ? "default" : "outline"}
            onClick={() => setAbaAtiva("fila")}
            className={abaAtiva === "fila" ? "bg-blue-600" : ""}
          >
            Fila Atual
          </Button>
          <Button
            variant={abaAtiva === "historico_marcacoes" ? "default" : "outline"}
            onClick={() => setAbaAtiva("historico_marcacoes")}
            className={abaAtiva === "historico_marcacoes" ? "bg-blue-600" : ""}
          >
            Histórico de Marcações
          </Button>
          <Button
            variant={abaAtiva === "historico" ? "default" : "outline"}
            onClick={() => setAbaAtiva("historico")}
            className={abaAtiva === "historico" ? "bg-blue-600" : ""}
          >
            Histórico de Ordens
          </Button>
        </div>

        {abaAtiva === "fila" && (
          <>
        {/* Estatísticas */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4">
          <Card style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}>
            <CardContent className="p-3 md:p-4">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                <div className="flex items-center gap-2 md:block">
                  <Truck className="w-5 h-5 md:hidden text-blue-600 flex-shrink-0" />
                  <div>
                    <p className="text-xs" style={{ color: theme.textMuted }}>Total na Fila</p>
                    <p className="text-2xl md:text-2xl font-bold" style={{ color: theme.text }}>{fila.length}</p>
                  </div>
                </div>
                <Truck className="hidden md:block w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          {tiposFila.map(tipo => {
            const count = fila.filter(v => v.tipo_fila_id === tipo.id).length;
            return (
              <Card key={tipo.id} style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}>
                <CardContent className="p-3 md:p-4">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                    <div className="flex items-center gap-2 md:block">
                      <div className="w-4 h-4 md:hidden rounded-full flex-shrink-0" style={{ backgroundColor: tipo.cor }} />
                      <div>
                        <p className="text-xs" style={{ color: theme.textMuted }}>{tipo.nome}</p>
                        <p className="text-2xl md:text-2xl font-bold" style={{ color: tipo.cor }}>{count}</p>
                      </div>
                    </div>
                    <div className="hidden md:block w-3 h-3 rounded-full" style={{ backgroundColor: tipo.cor }} />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Fila de Veículos */}
        {viewMode === "kanban" ? (
          <FilaKanban
            statusFila={statusFila}
            fila={fila}
            tiposFila={tiposFila}
            onDragEnd={handleDragEnd}
            onRemove={handleRemoverDaFila}
            calcularTempoNaFila={calcularTempoNaFila}
            formatarTelefone={formatarTelefone}
            abrirWhatsApp={abrirWhatsApp}
            onArquivarOrdens={async (veiculos, statusNome) => {
              if (!confirm(`Arquivar ${veiculos.length} veículo(s) do status "${statusNome}"?`)) return;
              try {
                const user = await base44.auth.me();
                for (const v of veiculos) {
                  await base44.entities.FilaVeiculo.delete(v.id);
                }
                await recalcularPosicoesFIFO(user.empresa_id);
                toast.success(`${veiculos.length} veículo(s) arquivado(s)!`);
                await loadData();
              } catch (error) {
                toast.error("Erro ao arquivar veículos");
              }
            }}
            theme={theme}
          />
        ) : (
          <DragDropContext onDragEnd={handleDragEnd}>
            {statusFila.map(statusObj => {
              const statusNormalizado = statusObj.nome.toLowerCase().replace(/ /g, '_');
              const veiculosDoStatus = fila.filter(v => v.status === statusNormalizado);

              return (
                <Card key={statusObj.id} style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}>
                  <CardHeader className="p-3 md:p-6">
                    <CardTitle className="flex items-center justify-between text-base md:text-lg" style={{ color: theme.text }}>
                      <div className="flex items-center gap-2">
                        <span style={{ color: statusObj.cor }}>{statusObj.icone}</span>
                        {statusObj.nome} ({veiculosDoStatus.length})
                      </div>
                      {statusObj.remove_da_fila && veiculosDoStatus.length > 0 && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={async () => {
                            if (!confirm(`Arquivar ${veiculosDoStatus.length} veículo(s) do status "${statusObj.nome}"?`)) return;
                            try {
                              const user = await base44.auth.me();
                              for (const v of veiculosDoStatus) {
                                await base44.entities.FilaVeiculo.delete(v.id);
                              }

                              // Recalcular posições FIFO
                              await recalcularPosicoesFIFO(user.empresa_id);

                              toast.success(`${veiculosDoStatus.length} veículo(s) arquivado(s)!`);
                              await loadData();
                            } catch (error) {
                              toast.error("Erro ao arquivar veículos");
                            }
                          }}
                          className="text-xs h-7"
                        >
                          <Trash2 className="w-3 h-3 mr-1" />
                          Arquivar ({veiculosDoStatus.length})
                        </Button>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0 md:p-6">
                    {/* View Mobile - Cards */}
                    <div className="md:hidden space-y-3 p-3">
                      {veiculosDoStatus.map((item, index) => {
                        const tipo = tiposFila.find(t => t.id === item.tipo_fila_id);
                        return (
                          <Card key={item.id} style={{ backgroundColor: isDark ? '#0f172a' : '#f9fafb', borderColor: theme.cardBorder }}>
                            <CardContent className="p-3">
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center flex-shrink-0">
                                    <span className="font-bold text-xs text-blue-700 dark:text-blue-300">
                                      {item.posicao_fila || index + 1}
                                    </span>
                                  </div>
                                  {tipo && (
                                    <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: tipo.cor }} title={tipo.nome} />
                                  )}
                                  <p className="font-bold text-sm" style={{ color: theme.text }}>{item.motorista_nome}</p>
                                </div>
                                <button
                                  onClick={() => handleRemoverDaFila(item.id)}
                                  className="text-red-600 hover:text-red-700 p-1"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>

                              <div className="grid grid-cols-2 gap-2 text-xs">
                                <div>
                                  <p className="text-[10px]" style={{ color: theme.textMuted }}>CPF</p>
                                  <p className="font-mono" style={{ color: theme.text }}>{item.motorista_cpf || "-"}</p>
                                </div>
                                <div>
                                  <p className="text-[10px]" style={{ color: theme.textMuted }}>Telefone</p>
                                  <div className="flex items-center gap-1">
                                    <p className="font-mono text-[9px]" style={{ color: theme.text }}>
                                      {formatarTelefone(item.motorista_telefone)}
                                    </p>
                                    {item.motorista_telefone && (
                                      <button
                                        onClick={() => abrirWhatsApp(item.motorista_telefone)}
                                        className="text-green-600 flex-shrink-0"
                                      >
                                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                                        </svg>
                                      </button>
                                    )}
                                  </div>
                                </div>
                                <div>
                                  <p className="text-[10px]" style={{ color: theme.textMuted }}>Senha</p>
                                  <p className="font-mono font-bold text-xs text-blue-600 dark:text-blue-400">{item.senha_fila || "-"}</p>
                                </div>
                                <div>
                                  <p className="text-[10px]" style={{ color: theme.textMuted }}>Cavalo</p>
                                  <p className="font-mono font-bold text-sm" style={{ color: theme.text }}>{item.cavalo_placa || "-"}</p>
                                </div>
                                <div>
                                  <p className="text-[10px]" style={{ color: theme.textMuted }}>Implemento</p>
                                  <p className="font-mono truncate" style={{ color: theme.text }}>
                                    {item.implemento1_placa || item.implemento2_placa || "-"}
                                  </p>
                                </div>
                                <div className="col-span-2">
                                  <p className="text-[10px]" style={{ color: theme.textMuted }}>Tipo Veículo</p>
                                  <p className="truncate" style={{ color: theme.text }}>
                                    {item.tipo_veiculo?.replace('CARRETA ', '') || "-"}
                                    {item.tipo_carroceria && ` / ${item.tipo_carroceria}`}
                                  </p>
                                </div>
                                <div className="col-span-2">
                                  <p className="text-[10px]" style={{ color: theme.textMuted }}>Localização</p>
                                  <p className="truncate" style={{ color: theme.text }}>{item.localizacao_atual || "-"}</p>
                                </div>
                                <div>
                                  <p className="text-[10px]" style={{ color: theme.textMuted }}>Entrada</p>
                                  <p className="text-xs" style={{ color: theme.text }}>
                                    {item.data_entrada_fila ? format(new Date(item.data_entrada_fila), "dd/MM HH:mm", { locale: ptBR }) : "-"}
                                  </p>
                                  {item.data_saida_fila && (
                                    <>
                                      <p className="text-[10px] mt-1" style={{ color: theme.textMuted }}>Saída</p>
                                      <p className="text-xs text-green-600 dark:text-green-400">
                                        {format(new Date(item.data_saida_fila), "dd/MM HH:mm", { locale: ptBR })}
                                      </p>
                                    </>
                                  )}
                                </div>
                                <div>
                                  <p className="text-[10px]" style={{ color: theme.textMuted }}>
                                    {item.data_saida_fila ? "Tempo Total" : "Tempo na Fila"}
                                  </p>
                                  <div className="flex items-center gap-1">
                                    <Clock className={`w-3 h-3 flex-shrink-0 ${item.data_saida_fila ? 'text-green-600' : 'text-orange-600'}`} />
                                    <span className={`text-xs font-semibold ${item.data_saida_fila ? 'text-green-600 dark:text-green-400' : 'text-orange-600'}`}>
                                      {calcularTempoNaFila(item.data_entrada_fila, item.data_saida_fila)}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                      
                      {veiculosDoStatus.length === 0 && (
                        <div className="text-center py-8">
                          <p className="text-sm" style={{ color: theme.textMuted }}>Nenhum veículo neste status</p>
                        </div>
                      )}
                    </div>

                    {/* View Desktop - Tabela */}
                    <div className="hidden md:block">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b" style={{ borderColor: theme.cardBorder }}>
                            <th className="text-left p-2 text-xs font-semibold w-8" style={{ color: theme.textMuted }}></th>
                            <th className="text-left p-2 text-xs font-semibold w-12" style={{ color: theme.textMuted }}>#</th>
                            <th className="text-left p-2 text-xs font-semibold w-20" style={{ color: theme.textMuted }}>Tipo</th>
                            <th className="text-left p-2 text-xs font-semibold" style={{ color: theme.textMuted }}>Motorista</th>
                            <th className="text-left p-2 text-xs font-semibold w-28" style={{ color: theme.textMuted }}>CPF</th>
                            <th className="text-left p-2 text-xs font-semibold w-28" style={{ color: theme.textMuted }}>Telefone</th>
                            <th className="text-left p-2 text-xs font-semibold w-24" style={{ color: theme.textMuted }}>Cavalo</th>
                            <th className="text-left p-2 text-xs font-semibold w-24" style={{ color: theme.textMuted }}>Impl.</th>
                            <th className="text-left p-2 text-xs font-semibold w-32" style={{ color: theme.textMuted }}>Tipo Veíc.</th>
                            <th className="text-left p-2 text-xs font-semibold w-20" style={{ color: theme.textMuted }}>Local</th>
                            <th className="text-left p-2 text-xs font-semibold w-28" style={{ color: theme.textMuted }}>Data</th>
                            <th className="text-left p-2 text-xs font-semibold w-20" style={{ color: theme.textMuted }}>Tempo</th>
                            <th className="text-left p-2 text-xs font-semibold w-12" style={{ color: theme.textMuted }}></th>
                          </tr>
                        </thead>
                        <Droppable droppableId={statusObj.id}>
                          {(provided, snapshot) => (
                            <tbody
                              ref={provided.innerRef}
                              {...provided.droppableProps}
                              style={{
                                backgroundColor: snapshot.isDraggingOver 
                                  ? (theme.cardBg === '#1e293b' ? '#334155' : '#f1f5f9')
                                  : 'transparent'
                              }}
                            >
                              {veiculosDoStatus.map((item, index) => {
                                const tipo = tiposFila.find(t => t.id === item.tipo_fila_id);
                                return (
                                  <Draggable key={item.id} draggableId={item.id} index={index}>
                                    {(provided, snapshot) => (
                                      <tr 
                                        ref={provided.innerRef}
                                        {...provided.draggableProps}
                                        className="border-b hover:bg-gray-50 dark:hover:bg-gray-800" 
                                        style={{ 
                                          ...provided.draggableProps.style,
                                          borderColor: theme.cardBorder,
                                          backgroundColor: snapshot.isDragging 
                                            ? (theme.cardBg === '#1e293b' ? '#1e293b' : '#ffffff')
                                            : 'transparent',
                                          opacity: snapshot.isDragging ? 0.9 : 1
                                        }}
                                      >
                                        <td className="p-2" {...provided.dragHandleProps}>
                                          <GripVertical className="w-4 h-4 text-gray-400 cursor-grab active:cursor-grabbing" />
                                        </td>
                                        <td className="p-2">
                                          <div className="w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                                            <span className="font-bold text-xs text-blue-700 dark:text-blue-300">
                                              {item.posicao_fila || index + 1}
                                            </span>
                                          </div>
                                        </td>
                                        <td className="p-2">
                            {editingCell?.itemId === item.id && editingCell?.field === 'status' ? (
                              <Select
                                value={editValue}
                                onValueChange={async (value) => {
                                  const statusSelecionado = statusFila.find(s => s.id === value);
                                  const statusNormalizado = statusSelecionado?.nome.toLowerCase().replace(/ /g, '_');
                                  
                                  try {
                                    const user = await base44.auth.me();
                                    const updates = { 
                                      status: statusNormalizado
                                    };

                                    // Se mudar para status que remove da fila, registrar saída
                                    if (statusSelecionado?.remove_da_fila && !item.data_saida_fila) {
                                      updates.data_saida_fila = new Date().toISOString();
                                    }

                                    await base44.entities.FilaVeiculo.update(item.id, updates);

                                    // Recalcular todas as posições FIFO
                                    await recalcularPosicoesFIFO(user.empresa_id);

                                    toast.success("Status atualizado!");
                                    setEditingCell(null);
                                    await loadData();
                                  } catch (error) {
                                    toast.error("Erro ao atualizar");
                                  }
                                }}
                              >
                                <SelectTrigger className="h-7 text-xs w-36" style={{ backgroundColor: theme.cardBg, borderColor: '#3b82f6' }}>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {statusFila.map(s => (
                                    <SelectItem key={s.id} value={s.id}>
                                      <div className="flex items-center gap-2">
                                        <span>{s.icone}</span>
                                        {s.nome}
                                      </div>
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            ) : (
                              <Select
                                value={item.tipo_fila_id}
                                onValueChange={(value) => {
                                  const tipoSel = tiposFila.find(t => t.id === value);
                                  base44.entities.FilaVeiculo.update(item.id, { 
                                    tipo_fila_id: value,
                                    tipo_fila_nome: tipoSel?.nome
                                  })
                                    .then(() => {
                                      toast.success("Tipo atualizado!");
                                      setFila(prev => prev.map(f => f.id === item.id ? {...f, tipo_fila_id: value, tipo_fila_nome: tipoSel?.nome} : f));
                                    })
                                    .catch(() => toast.error("Erro ao atualizar"));
                                }}
                              >
                                <SelectTrigger className="h-7 text-xs w-32" style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {tiposFila.map(t => (
                                    <SelectItem key={t.id} value={t.id}>
                                      <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: t.cor }} />
                                        {t.nome}
                                      </div>
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            )}
                          </td>
                          <td 
                            className="p-2 cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/20" 
                            onDoubleClick={() => handleDoubleClick(item.id, 'motorista_nome', item.motorista_nome)}
                          >
                            {editingCell?.itemId === item.id && editingCell?.field === 'motorista_nome' ? (
                              <Input
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                onKeyDown={handleKeyDown}
                                onBlur={handleSaveEdit}
                                autoFocus
                                className="text-sm h-7"
                                style={{ backgroundColor: theme.cardBg, borderColor: '#3b82f6', color: theme.text }}
                              />
                            ) : (
                              <p className="text-sm font-semibold truncate" style={{ color: theme.text }}>{item.motorista_nome}</p>
                            )}
                          </td>
                          <td 
                            className="p-2 cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/20" 
                            onDoubleClick={() => handleDoubleClick(item.id, 'motorista_cpf', item.motorista_cpf)}
                          >
                            {editingCell?.itemId === item.id && editingCell?.field === 'motorista_cpf' ? (
                              <Input
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                onKeyDown={handleKeyDown}
                                onBlur={handleSaveEdit}
                                autoFocus
                                className="text-xs font-mono h-7"
                                style={{ backgroundColor: theme.cardBg, borderColor: '#3b82f6', color: theme.text }}
                              />
                            ) : (
                              <p className="text-xs font-mono truncate" style={{ color: theme.textMuted }}>{item.motorista_cpf}</p>
                            )}
                          </td>
                          <td className="p-2">
                            {editingCell?.itemId === item.id && editingCell?.field === 'motorista_telefone' ? (
                              <Input
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                onKeyDown={handleKeyDown}
                                onBlur={handleSaveEdit}
                                autoFocus
                                className="text-xs h-7"
                                style={{ backgroundColor: theme.cardBg, borderColor: '#3b82f6', color: theme.text }}
                              />
                            ) : (
                              <div className="flex items-center gap-1">
                                <p 
                                  className="text-xs cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/20 px-1 rounded truncate" 
                                  style={{ color: theme.text }}
                                  onDoubleClick={() => handleDoubleClick(item.id, 'motorista_telefone', item.motorista_telefone)}
                                >
                                  {item.motorista_telefone?.replace(/\D/g, '').slice(-8)}
                                </p>
                                {item.motorista_telefone && (
                                  <button
                                    onClick={() => abrirWhatsApp(item.motorista_telefone)}
                                    className="text-green-600 hover:text-green-700 flex-shrink-0"
                                    title="WhatsApp"
                                  >
                                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                                    </svg>
                                  </button>
                                )}
                              </div>
                            )}
                          </td>
                          <td 
                            className="p-2 cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/20" 
                            onDoubleClick={() => handleDoubleClick(item.id, 'cavalo_placa', item.cavalo_placa)}
                          >
                            {editingCell?.itemId === item.id && editingCell?.field === 'cavalo_placa' ? (
                              <Input
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value.toUpperCase())}
                                onKeyDown={handleKeyDown}
                                onBlur={handleSaveEdit}
                                autoFocus
                                className="text-xs font-mono font-semibold h-7"
                                style={{ backgroundColor: theme.cardBg, borderColor: '#3b82f6', color: theme.text }}
                              />
                            ) : (
                              <div>
                                <p className="text-xs font-mono font-semibold truncate" style={{ color: theme.text }}>{item.cavalo_placa}</p>
                                <p className="text-xs text-blue-600 dark:text-blue-400 font-mono font-bold">Senha: {item.senha_fila}</p>
                              </div>
                            )}
                          </td>
                          <td className="p-2">
                            {editingCell?.itemId === item.id && (editingCell?.field === 'implemento1_placa' || editingCell?.field === 'implemento2_placa') ? (
                              <Input
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value.toUpperCase())}
                                onKeyDown={handleKeyDown}
                                onBlur={handleSaveEdit}
                                autoFocus
                                className="text-xs font-mono h-7"
                                style={{ backgroundColor: theme.cardBg, borderColor: '#3b82f6', color: theme.text }}
                              />
                            ) : (
                              <p 
                                className="text-xs font-mono cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/20 px-1 rounded truncate" 
                                style={{ color: theme.text }}
                                onDoubleClick={() => handleDoubleClick(item.id, 'implemento1_placa', item.implemento1_placa)}
                                title={item.implemento1_placa && item.implemento2_placa ? `${item.implemento1_placa} / ${item.implemento2_placa}` : item.implemento1_placa || item.implemento2_placa}
                              >
                                {item.implemento1_placa || item.implemento2_placa || "-"}
                              </p>
                            )}
                          </td>
                          <td className="p-2">
                            {editingCell?.itemId === item.id && (editingCell?.field === 'tipo_veiculo' || editingCell?.field === 'tipo_carroceria') ? (
                              <Select
                                value={editValue}
                                onValueChange={(value) => {
                                  setEditValue(value);
                                  base44.entities.FilaVeiculo.update(item.id, { [editingCell.field]: value })
                                    .then(() => {
                                      toast.success("Atualizado!");
                                      setEditingCell(null);
                                      setFila(prev => prev.map(f => f.id === item.id ? {...f, [editingCell.field]: value} : f));
                                    })
                                    .catch(() => toast.error("Erro ao atualizar"));
                                }}
                              >
                                <SelectTrigger className="h-7 text-xs" style={{ backgroundColor: theme.cardBg, borderColor: '#3b82f6' }}>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {editingCell.field === 'tipo_veiculo' ? (
                                    <>
                                      <SelectItem value="RODOTREM">RODOTREM</SelectItem>
                                      <SelectItem value="TRUCK">TRUCK</SelectItem>
                                      <SelectItem value="CARRETA 5EIXOS">5EIXOS</SelectItem>
                                      <SelectItem value="CARRETA 6EIXOS">6EIXOS</SelectItem>
                                      <SelectItem value="CARRETA 7EIXOS">7EIXOS</SelectItem>
                                      <SelectItem value="BITREM">BITREM</SelectItem>
                                      <SelectItem value="BI-TRUCK">BI-TRUCK</SelectItem>
                                    </>
                                  ) : (
                                    <>
                                      <SelectItem value="SIDER">SIDER</SelectItem>
                                      <SelectItem value="PRANCHA">PRANCHA</SelectItem>
                                      <SelectItem value="GRADE BAIXA">G.BAIXA</SelectItem>
                                      <SelectItem value="GRADE ALTA">G.ALTA</SelectItem>
                                      <SelectItem value="BAU">BAU</SelectItem>
                                    </>
                                  )}
                                </SelectContent>
                              </Select>
                            ) : (
                              <p 
                                className="text-xs cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/20 px-1 rounded truncate" 
                                style={{ color: theme.text }}
                                onDoubleClick={() => handleDoubleClick(item.id, 'tipo_veiculo', item.tipo_veiculo)}
                                title={`${item.tipo_veiculo || '-'}${item.tipo_carroceria ? ` / ${item.tipo_carroceria}` : ''}`}
                              >
                                {item.tipo_veiculo?.replace('CARRETA ', '') || "-"}
                              </p>
                            )}
                          </td>
                          <td 
                            className="p-2 cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/20" 
                            onDoubleClick={() => handleDoubleClick(item.id, 'localizacao_atual', item.localizacao_atual)}
                          >
                            {editingCell?.itemId === item.id && editingCell?.field === 'localizacao_atual' ? (
                              <Input
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                onKeyDown={handleKeyDown}
                                onBlur={handleSaveEdit}
                                autoFocus
                                className="text-xs h-7"
                                style={{ backgroundColor: theme.cardBg, borderColor: '#3b82f6', color: theme.text }}
                              />
                            ) : (
                              <p className="text-xs truncate" style={{ color: theme.text }} title={item.localizacao_atual}>{item.localizacao_atual || "-"}</p>
                            )}
                          </td>
                          <td className="p-2">
                            <div className="text-xs">
                              <p style={{ color: theme.text }}>
                                {item.data_entrada_fila ? format(new Date(item.data_entrada_fila), "dd/MM HH:mm", { locale: ptBR }) : "-"}
                              </p>
                              {item.data_saida_fila && (
                                <p className="text-green-600 dark:text-green-400 mt-0.5">
                                  Saída: {format(new Date(item.data_saida_fila), "dd/MM HH:mm", { locale: ptBR })}
                                </p>
                              )}
                            </div>
                          </td>
                          <td className="p-2">
                            <div className="flex items-center gap-1">
                              <Clock className={`w-3 h-3 flex-shrink-0 ${item.data_saida_fila ? 'text-green-600' : 'text-orange-600'}`} />
                              <span className={`text-xs font-semibold truncate ${item.data_saida_fila ? 'text-green-600 dark:text-green-400' : 'text-orange-600'}`}>
                                {calcularTempoNaFila(item.data_entrada_fila, item.data_saida_fila)}
                              </span>
                            </div>
                          </td>
                          <td className="p-2">
                            <button
                              onClick={() => handleRemoverDaFila(item.id)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 p-1 rounded"
                              title="Excluir"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                                      </tr>
                                    )}
                                  </Draggable>
                                );
                              })}
                              {provided.placeholder}
                              {veiculosDoStatus.length === 0 && (
                                <tr>
                                  <td colSpan="13" className="text-center py-8">
                                    <p className="text-sm" style={{ color: theme.textMuted }}>Nenhum veículo neste status</p>
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          )}
                        </Droppable>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </DragDropContext>
        )}

        {/* Modal Adicionar Veículo */}
        <Dialog open={showAddModal} onOpenChange={() => {
          setShowAddModal(false);
          setEtapaModal("telefone");
          setTelefoneBusca("");
          setPreenchidoAutomatico(false);
          setMotoristaEncontrado(false);
          setFeedbackTelefone(null);
        }}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto" style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}>
            <DialogHeader>
              <DialogTitle style={{ color: theme.text }}>
                {isMobile ? "Check-in na Fila" : "Adicionar Veículo à Fila"}
              </DialogTitle>
            </DialogHeader>

            {isMobile && etapaModal === "telefone" ? (
              <div className="space-y-6 py-4">
                <div className="text-center mb-4">
                  <p className="text-sm" style={{ color: theme.textMuted }}>
                    Digite seu celular para buscar seus dados
                  </p>
                </div>

                <div>
                  <Label style={{ color: theme.text }}>Telefone Celular</Label>
                  <Input
                    type="tel"
                    inputMode="numeric"
                    value={telefoneBusca}
                    onChange={(e) => {
                      const valor = e.target.value.replace(/\D/g, '');
                      if (valor.length <= 11) {
                        const formatado = valor.replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3');
                        setTelefoneBusca(valor.length === 11 ? formatado : valor);
                      }
                    }}
                    placeholder="(00) 00000-0000"
                    maxLength={15}
                    className="text-lg h-14 text-center font-bold"
                    style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder, color: theme.text }}
                    autoFocus
                  />
                  
                  {/* Feedback de busca */}
                  {buscandoMotorista && (
                    <div className="mt-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800 flex items-center justify-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                      <p className="text-sm text-gray-600 dark:text-gray-400">Verificando cadastro...</p>
                    </div>
                  )}
                  
                  {!buscandoMotorista && feedbackTelefone === 'encontrado' && (
                    <div className="mt-3 p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-green-700 dark:text-green-300">Cadastro encontrado!</p>
                          <p className="text-xs text-green-600 dark:text-green-400">Seus dados foram carregados</p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {!buscandoMotorista && feedbackTelefone === 'novo' && (
                    <div className="mt-3 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-blue-700 dark:text-blue-300">Novo cadastro</p>
                          <p className="text-xs text-blue-600 dark:text-blue-400">Preencha os dados para continuar</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <Button
                  type="button"
                  onClick={handleBuscarMotorista}
                  disabled={buscandoMotorista || telefoneBusca.replace(/\D/g, '').length !== 11}
                  className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-lg font-bold"
                >
                  Continuar
                </Button>
              </div>
            ) : isMobile ? (
              <AdicionarFilaCarousel
                formData={formData}
                setFormData={setFormData}
                tiposFila={tiposFila}
                theme={theme}
                loadingLocation={loadingLocation}
                onObterLocalizacao={handleObterLocalizacao}
                preenchidoAutomatico={preenchidoAutomatico}
                motoristaEncontrado={motoristaEncontrado}
                onSubmit={handleAdicionarFila}
              />
            ) : (
              <form onSubmit={handleAdicionarFila} className="space-y-4">
              {/* Telefone */}
              <div>
                <Label style={{ color: theme.text }}>Telefone Celular *</Label>
                <Input
                  type="tel"
                  inputMode="numeric"
                  value={formData.motorista_telefone}
                  onChange={(e) => {
                    const valor = e.target.value.replace(/\D/g, '');
                    if (valor.length <= 11) {
                      const formatado = valor.replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3');
                      setFormData(prev => ({ ...prev, motorista_telefone: valor.length === 11 ? formatado : valor }));
                    }
                  }}
                  placeholder="(00) 00000-0000"
                  maxLength={15}
                  style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder, color: theme.text }}
                />
              </div>

              {/* Nome Motorista */}
              <div>
                <Label style={{ color: theme.text }}>Nome Motorista *</Label>
                <Input
                  value={formData.motorista_nome}
                  onChange={(e) => setFormData(prev => ({ ...prev, motorista_nome: e.target.value }))}
                  placeholder="Nome completo"
                  style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder, color: theme.text }}
                />
              </div>

              {/* Placa do Cavalo */}
              <div>
                <Label style={{ color: theme.text }}>Placa do Cavalo *</Label>
                <Input
                  value={formData.cavalo_placa}
                  onChange={(e) => setFormData(prev => ({ ...prev, cavalo_placa: e.target.value.toUpperCase() }))}
                  placeholder="ABC1234"
                  className="font-mono font-bold"
                  style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder, color: theme.text }}
                />
              </div>



              {/* Tipo do Motorista e Características */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="md:col-span-3">
                  <Label style={{ color: theme.text }}>Tipo do Motorista *</Label>
                  <Select
                    value={formData.tipo_fila_id}
                    onValueChange={(value) => {
                      const tipo = tiposFila.find(t => t.id === value);
                      setFormData(prev => ({ ...prev, tipo_fila_id: value, tipo_fila_nome: tipo?.nome }));
                    }}
                  >
                    <SelectTrigger style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder, color: theme.text }}>
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      {tiposFila.map(tipo => (
                        <SelectItem key={tipo.id} value={tipo.id}>
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: tipo.cor }} />
                            {tipo.nome}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label style={{ color: theme.text }}>Tipo Veículo</Label>
                  <Select
                    value={formData.tipo_veiculo}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, tipo_veiculo: value }))}
                  >
                    <SelectTrigger style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder, color: theme.text }}>
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="RODOTREM">RODOTREM</SelectItem>
                      <SelectItem value="TRUCK">TRUCK</SelectItem>
                      <SelectItem value="CARRETA 5EIXOS">CARRETA 5EIXOS</SelectItem>
                      <SelectItem value="CARRETA 6EIXOS">CARRETA 6EIXOS</SelectItem>
                      <SelectItem value="CARRETA 7EIXOS">CARRETA 7EIXOS</SelectItem>
                      <SelectItem value="BITREM">BITREM</SelectItem>
                      <SelectItem value="BI-TRUCK">BI-TRUCK</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label style={{ color: theme.text }}>Tipo Carroceria</Label>
                  <Select
                    value={formData.tipo_carroceria}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, tipo_carroceria: value }))}
                  >
                    <SelectTrigger style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder, color: theme.text }}>
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SIDER">SIDER</SelectItem>
                      <SelectItem value="PRANCHA">PRANCHA</SelectItem>
                      <SelectItem value="GRADE BAIXA">GRADE BAIXA</SelectItem>
                      <SelectItem value="GRADE ALTA">GRADE ALTA</SelectItem>
                      <SelectItem value="BAU">BAU</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Localização e Observações */}
              <div>
                <Label style={{ color: theme.text }}>Localização Atual</Label>
                <div className="flex gap-2">
                  <Input
                    value={formData.localizacao_atual}
                    onChange={(e) => setFormData(prev => ({ ...prev, localizacao_atual: e.target.value }))}
                    placeholder="Ex: Pátio Central, Filial SP..."
                    style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder, color: theme.text }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleObterLocalizacao}
                    disabled={loadingLocation}
                    className="flex-shrink-0"
                    style={{ borderColor: theme.cardBorder }}
                  >
                    {loadingLocation ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <MapPin className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>

              <div>
                <Label style={{ color: theme.text }}>Observações</Label>
                <Textarea
                  value={formData.observacoes}
                  onChange={(e) => setFormData(prev => ({ ...prev, observacoes: e.target.value }))}
                  placeholder="Observações adicionais..."
                  rows={2}
                  style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder, color: theme.text }}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1"
                  style={{ borderColor: theme.cardBorder, color: theme.text }}
                >
                  Cancelar
                </Button>
                <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700">
                  Adicionar à Fila
                </Button>
              </div>
              </form>
              )}
              </DialogContent>
              </Dialog>

        {/* Modal Gerenciar Status */}
        <Dialog open={showStatusModal} onOpenChange={setShowStatusModal}>
          <DialogContent style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}>
            <DialogHeader>
              <DialogTitle style={{ color: theme.text }}>Gerenciar Status de Fila</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              {/* Form Adicionar/Editar Status */}
              <form onSubmit={handleSalvarStatus} className="border rounded-lg p-3" style={{ borderColor: theme.cardBorder }}>
                <div className="grid grid-cols-4 gap-3">
                  <div className="col-span-2">
                    <Label style={{ color: theme.text }}>Nome do Status</Label>
                    <Input
                      value={novoStatus.nome}
                      onChange={(e) => setNovoStatus(prev => ({ ...prev, nome: e.target.value }))}
                      placeholder="Ex: Aguardando Carga"
                      style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder, color: theme.text }}
                    />
                  </div>
                  <div>
                    <Label style={{ color: theme.text }}>Ícone</Label>
                    <Input
                      value={novoStatus.icone}
                      onChange={(e) => setNovoStatus(prev => ({ ...prev, icone: e.target.value }))}
                      placeholder="Ex: 🟢"
                      style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder, color: theme.text }}
                    />
                  </div>
                  <div>
                    <Label style={{ color: theme.text }}>Cor</Label>
                    <Input
                      type="color"
                      value={novoStatus.cor}
                      onChange={(e) => setNovoStatus(prev => ({ ...prev, cor: e.target.value }))}
                      className="h-10"
                    />
                  </div>
                </div>
                <div className="mt-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={novoStatus.remove_da_fila}
                      onChange={(e) => setNovoStatus(prev => ({ ...prev, remove_da_fila: e.target.checked }))}
                      className="w-4 h-4 rounded border-gray-300"
                    />
                    <span className="text-sm" style={{ color: theme.text }}>
                      Retirar da fila (marcações com este status são removidas)
                    </span>
                  </label>
                </div>
                <div className="flex gap-2 mt-3">
                  <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                    {editingStatus ? "Atualizar" : "Adicionar"}
                  </Button>
                  {editingStatus && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setEditingStatus(null);
                        setNovoStatus({ nome: "", cor: "#3b82f6", icone: "🟢", remove_da_fila: false });
                      }}
                    >
                      Cancelar
                    </Button>
                  )}
                </div>
              </form>

              {/* Lista de Status */}
              <div className="space-y-2">
                <Label style={{ color: theme.text }}>Status Cadastrados</Label>
                {statusFila.map(status => (
                  <div
                    key={status.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                    style={{ borderColor: theme.cardBorder }}
                  >
                    <div className="flex items-center gap-3">
                      <span style={{ fontSize: '1.5rem' }}>{status.icone}</span>
                      <div className="w-4 h-4 rounded-full" style={{ backgroundColor: status.cor }} />
                      <span className="font-semibold" style={{ color: theme.text }}>{status.nome}</span>
                      {status.remove_da_fila && (
                        <span className="text-xs bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400 px-2 py-0.5 rounded">
                          Remove da fila
                        </span>
                      )}
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setEditingStatus(status);
                          setNovoStatus({ nome: status.nome, cor: status.cor, icone: status.icone, remove_da_fila: status.remove_da_fila || false });
                        }}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleExcluirStatus(status.id)}
                        className="text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Modal Gerenciar Tipos */}
        <Dialog open={showTiposModal} onOpenChange={setShowTiposModal}>
          <DialogContent style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}>
            <DialogHeader>
              <DialogTitle style={{ color: theme.text }}>Gerenciar Tipos de Fila</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              {/* Form Adicionar/Editar Tipo */}
              <form onSubmit={handleSalvarTipo} className="border rounded-lg p-3" style={{ borderColor: theme.cardBorder }}>
                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-2">
                    <Label style={{ color: theme.text }}>Nome do Tipo</Label>
                    <Input
                      value={novoTipo.nome}
                      onChange={(e) => setNovoTipo(prev => ({ ...prev, nome: e.target.value }))}
                      placeholder="Ex: Frota Própria"
                      style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder, color: theme.text }}
                    />
                  </div>
                  <div>
                    <Label style={{ color: theme.text }}>Cor</Label>
                    <Input
                      type="color"
                      value={novoTipo.cor}
                      onChange={(e) => setNovoTipo(prev => ({ ...prev, cor: e.target.value }))}
                      className="h-10"
                    />
                  </div>
                </div>
                <div className="flex gap-2 mt-3">
                  <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                    {editingTipo ? "Atualizar" : "Adicionar"}
                  </Button>
                  {editingTipo && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setEditingTipo(null);
                        setNovoTipo({ nome: "", cor: "#3b82f6" });
                      }}
                    >
                      Cancelar
                    </Button>
                  )}
                </div>
              </form>

              {/* Lista de Tipos */}
              <div className="space-y-2">
                <Label style={{ color: theme.text }}>Tipos Cadastrados</Label>
                {tiposFila.map(tipo => (
                  <div
                    key={tipo.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                    style={{ borderColor: theme.cardBorder }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 rounded-full" style={{ backgroundColor: tipo.cor }} />
                      <span className="font-semibold" style={{ color: theme.text }}>{tipo.nome}</span>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setEditingTipo(tipo);
                          setNovoTipo({ nome: tipo.nome, cor: tipo.cor });
                        }}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleExcluirTipo(tipo.id)}
                        className="text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </DialogContent>
        </Dialog>
        </>
        )}

        {abaAtiva === "historico_marcacoes" && (
        <Card style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}>
        <CardHeader>
          <CardTitle style={{ color: theme.text }}>Histórico de Marcações na Fila</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b" style={{ borderColor: theme.cardBorder }}>
                  <th className="text-left px-3 py-3 text-xs font-semibold w-12" style={{ color: theme.textMuted }}>#</th>
                  <th className="text-left px-3 py-3 text-xs font-semibold" style={{ color: theme.textMuted }}>Motorista</th>
                  <th className="text-left px-3 py-3 text-xs font-semibold w-28" style={{ color: theme.textMuted }}>Placa</th>
                  <th className="text-left px-3 py-3 text-xs font-semibold w-24" style={{ color: theme.textMuted }}>Senha</th>
                  <th className="text-left px-3 py-3 text-xs font-semibold w-20" style={{ color: theme.textMuted }}>Tipo</th>
                  <th className="text-left px-3 py-3 text-xs font-semibold w-32" style={{ color: theme.textMuted }}>Entrada</th>
                  <th className="text-left px-3 py-3 text-xs font-semibold w-32" style={{ color: theme.textMuted }}>Saída</th>
                  <th className="text-left px-3 py-3 text-xs font-semibold w-28" style={{ color: theme.textMuted }}>Tempo Espera</th>
                  <th className="text-left px-3 py-3 text-xs font-semibold w-28" style={{ color: theme.textMuted }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {historicoFila.map((marcacao, index) => {
                  const tipo = tiposFila.find(t => t.id === marcacao.tipo_fila_id);
                  const status = statusFila.find(s => s.nome.toLowerCase().replace(/ /g, '_') === marcacao.status);
                  
                  return (
                    <tr key={marcacao.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800" style={{ borderColor: theme.cardBorder }}>
                      <td className="px-3 py-3">
                        <div className="w-7 h-7 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                          <span className="font-bold text-xs" style={{ color: theme.textMuted }}>
                            {marcacao.posicao_fila || index + 1}
                          </span>
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        <p className="text-sm font-semibold" style={{ color: theme.text }}>{marcacao.motorista_nome}</p>
                        <p className="text-xs" style={{ color: theme.textMuted }}>{formatarTelefone(marcacao.motorista_telefone)}</p>
                      </td>
                      <td className="px-3 py-3">
                        <p className="text-sm font-mono font-semibold" style={{ color: theme.text }}>{marcacao.cavalo_placa}</p>
                      </td>
                      <td className="px-3 py-3">
                        <p className="text-sm font-mono font-bold text-blue-600 dark:text-blue-400">{marcacao.senha_fila}</p>
                      </td>
                      <td className="px-3 py-3">
                        {tipo && (
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: tipo.cor }} />
                            <span className="text-xs" style={{ color: theme.text }}>{tipo.nome}</span>
                          </div>
                        )}
                      </td>
                      <td className="px-3 py-3">
                        <p className="text-xs" style={{ color: theme.text }}>
                          {marcacao.data_entrada_fila ? format(new Date(marcacao.data_entrada_fila), "dd/MM/yyyy HH:mm", { locale: ptBR }) : "-"}
                        </p>
                      </td>
                      <td className="px-3 py-3">
                        <p className="text-xs text-green-600 dark:text-green-400">
                          {marcacao.data_saida_fila ? format(new Date(marcacao.data_saida_fila), "dd/MM/yyyy HH:mm", { locale: ptBR }) : "-"}
                        </p>
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-green-600 flex-shrink-0" />
                          <span className="text-xs font-semibold text-green-600 dark:text-green-400">
                            {calcularTempoNaFila(marcacao.data_entrada_fila, marcacao.data_saida_fila)}
                          </span>
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        {status && (
                          <div className="flex items-center gap-2">
                            <span>{status.icone}</span>
                            <span className="text-xs" style={{ color: theme.text }}>{status.nome}</span>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {historicoFila.length === 0 && (
              <div className="text-center py-8">
                <p className="text-sm" style={{ color: theme.textMuted }}>Nenhuma marcação no histórico</p>
              </div>
            )}
          </div>

          {/* Resumo Estatístico */}
          {historicoFila.length > 0 && (
            <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border" style={{ borderColor: '#3b82f6' }}>
                <p className="text-xs text-blue-600 dark:text-blue-400">Total de Marcações</p>
                <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                  {historicoFila.length}
                </p>
              </div>
              <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border" style={{ borderColor: '#16a34a' }}>
                <p className="text-xs text-green-600 dark:text-green-400">Tempo Médio de Espera</p>
                <p className="text-2xl font-bold text-green-700 dark:text-green-300">
                  {(() => {
                    const marcacoesComTempo = historicoFila;
                    if (marcacoesComTempo.length === 0) return "-";
                    
                    const tempoTotal = marcacoesComTempo.reduce((acc, m) => {
                      const entrada = new Date(m.data_entrada_fila);
                      const saida = new Date(m.data_saida_fila);
                      return acc + (saida - entrada);
                    }, 0);
                    
                    const tempoMedio = tempoTotal / marcacoesComTempo.length;
                    const horas = Math.floor(tempoMedio / (1000 * 60 * 60));
                    const minutos = Math.floor((tempoMedio % (1000 * 60 * 60)) / (1000 * 60));
                    
                    return horas > 0 ? `${horas}h ${minutos}min` : `${minutos}min`;
                  })()}
                </p>
              </div>
              <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border" style={{ borderColor: '#9333ea' }}>
                <p className="text-xs text-purple-600 dark:text-purple-400">Tempo Mínimo</p>
                <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                  {(() => {
                    const marcacoesComTempo = historicoFila;
                    if (marcacoesComTempo.length === 0) return "-";
                    
                    const tempos = marcacoesComTempo.map(m => {
                      const entrada = new Date(m.data_entrada_fila);
                      const saida = new Date(m.data_saida_fila);
                      return saida - entrada;
                    });
                    
                    const tempoMin = Math.min(...tempos);
                    const horas = Math.floor(tempoMin / (1000 * 60 * 60));
                    const minutos = Math.floor((tempoMin % (1000 * 60 * 60)) / (1000 * 60));
                    
                    return horas > 0 ? `${horas}h ${minutos}min` : `${minutos}min`;
                  })()}
                </p>
              </div>
              <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg border" style={{ borderColor: '#f97316' }}>
                <p className="text-xs text-orange-600 dark:text-orange-400">Tempo Máximo</p>
                <p className="text-2xl font-bold text-orange-700 dark:text-orange-300">
                  {(() => {
                    const marcacoesComTempo = historicoFila;
                    if (marcacoesComTempo.length === 0) return "-";
                    
                    const tempos = marcacoesComTempo.map(m => {
                      const entrada = new Date(m.data_entrada_fila);
                      const saida = new Date(m.data_saida_fila);
                      return saida - entrada;
                    });
                    
                    const tempoMax = Math.max(...tempos);
                    const horas = Math.floor(tempoMax / (1000 * 60 * 60));
                    const minutos = Math.floor((tempoMax % (1000 * 60 * 60)) / (1000 * 60));
                    
                    return horas > 0 ? `${horas}h ${minutos}min` : `${minutos}min`;
                  })()}
                </p>
              </div>
            </div>
          )}
        </CardContent>
        </Card>
        )}

        {abaAtiva === "historico" && (
        <Card style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}>
        <CardHeader>
          <CardTitle style={{ color: theme.text }}>Histórico de Ordens de Carregamento</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b" style={{ borderColor: theme.cardBorder }}>
                  <th className="text-left px-3 py-3 text-xs font-semibold w-32" style={{ color: theme.textMuted }}>Nº Carga</th>
                  <th className="text-left px-3 py-3 text-xs font-semibold w-48" style={{ color: theme.textMuted }}>Motorista</th>
                  <th className="text-left px-3 py-3 text-xs font-semibold w-28" style={{ color: theme.textMuted }}>Placa</th>
                  <th className="text-left px-3 py-3 text-xs font-semibold w-32" style={{ color: theme.textMuted }}>Senha Fila</th>
                  <th className="text-left px-3 py-3 text-xs font-semibold" style={{ color: theme.textMuted }}>Cliente</th>
                  <th className="text-left px-3 py-3 text-xs font-semibold" style={{ color: theme.textMuted }}>Origem</th>
                  <th className="text-left px-3 py-3 text-xs font-semibold" style={{ color: theme.textMuted }}>Destino</th>
                  <th className="text-left px-3 py-3 text-xs font-semibold w-24" style={{ color: theme.textMuted }}>Data</th>
                  <th className="text-left px-3 py-3 text-xs font-semibold w-40" style={{ color: theme.textMuted }}>Status Fila</th>
                </tr>
              </thead>
              <tbody>
                {ordensHistorico.map(ordem => {
                  const temSenha = !!ordem.senha_fila;
                  const marcacaoFila = temSenha ? fila.find(f => f.senha_fila === ordem.senha_fila) : null;

                  return (
                    <tr key={ordem.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800" style={{ borderColor: theme.cardBorder }}>
                      <td className="px-3 py-3 whitespace-nowrap">
                        <p className="text-sm font-mono font-semibold" style={{ color: theme.text }}>{ordem.numero_carga || "-"}</p>
                      </td>
                      <td className="px-3 py-3">
                        <p className="text-sm" style={{ color: theme.text }}>
                          {ordem.motorista_nome_temp || motoristas.find(m => m.id === ordem.motorista_id)?.nome || "-"}
                        </p>
                      </td>
                      <td className="px-3 py-3">
                        <p className="text-sm font-mono font-semibold" style={{ color: theme.text }}>
                          {ordem.cavalo_placa_temp || veiculos.find(v => v.id === ordem.cavalo_id)?.placa || "-"}
                        </p>
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap">
                        {temSenha ? (
                          <div className="flex items-center gap-2">
                            <p className="text-base font-mono font-bold text-green-600 dark:text-green-400">{ordem.senha_fila}</p>
                            {marcacaoFila && (
                              <span className="text-xs bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400 px-2 py-0.5 rounded">
                                ✓
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-xs bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400 px-2.5 py-1 rounded font-semibold">
                            <span className="text-sm">⚠️</span>
                            SEM SENHA
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-3">
                        <p className="text-sm" style={{ color: theme.text }}>{ordem.cliente || "-"}</p>
                      </td>
                      <td className="px-3 py-3">
                        <p className="text-sm" style={{ color: theme.text }}>{ordem.origem || "-"}</p>
                      </td>
                      <td className="px-3 py-3">
                        <p className="text-sm" style={{ color: theme.text }}>{ordem.destino || "-"}</p>
                      </td>
                      <td className="px-3 py-3">
                        <p className="text-xs" style={{ color: theme.textMuted }}>
                          {ordem.created_date ? format(new Date(ordem.created_date), "dd/MM/yy", { locale: ptBR }) : "-"}
                        </p>
                      </td>
                      <td className="px-3 py-3">
                        {!temSenha ? (
                          <span className="text-xs bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400 px-2 py-1 rounded whitespace-nowrap">
                            Fila não respeitada
                          </span>
                        ) : marcacaoFila ? (
                          <span className="text-xs bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400 px-2 py-1 rounded whitespace-nowrap">
                            ✓ Fila respeitada
                          </span>
                        ) : (
                          <span className="text-xs bg-gray-100 text-gray-700 dark:bg-gray-900/20 dark:text-gray-400 px-2 py-1 rounded whitespace-nowrap">
                            Marcação removida
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {ordensHistorico.length === 0 && (
              <div className="text-center py-8">
                <p className="text-sm" style={{ color: theme.textMuted }}>Nenhuma ordem encontrada</p>
              </div>
            )}
          </div>

          {/* Resumo */}
          <div className="mt-6 grid grid-cols-3 gap-4">
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border" style={{ borderColor: '#3b82f6' }}>
              <p className="text-xs text-blue-600 dark:text-blue-400">Total de Ordens</p>
              <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">{ordensHistorico.length}</p>
            </div>
            <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border" style={{ borderColor: '#dc2626' }}>
              <p className="text-xs text-red-600 dark:text-red-400">Sem Senha (Fila Não Respeitada)</p>
              <p className="text-2xl font-bold text-red-700 dark:text-red-300">
                {ordensHistorico.filter(o => !o.senha_fila).length}
              </p>
            </div>
            <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border" style={{ borderColor: '#16a34a' }}>
              <p className="text-xs text-green-600 dark:text-green-400">Com Senha (Fila Respeitada)</p>
              <p className="text-2xl font-bold text-green-700 dark:text-green-300">
                {ordensHistorico.filter(o => o.senha_fila).length}
              </p>
            </div>
          </div>
        </CardContent>
        </Card>
        )}
        </div>
        </div>
        );
        }