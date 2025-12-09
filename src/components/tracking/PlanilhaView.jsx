import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Save, Loader2, Table as TableIcon, Settings, GripVertical, ChevronLeft, ChevronRight, MapPin, CheckCircle, XCircle, AlertTriangle, ArrowUp, ArrowDown } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import TrackingUpdateModal from "./TrackingUpdateModal";
import { format } from "date-fns";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

const COLUNAS_DISPONIVEIS = [
  { id: "numero_carga", label: "Ordem", width: "w-20", enabled: true, fixed: true },
  { id: "viagem_pedido", label: "Pedido", width: "w-24", enabled: true },
  { id: "cliente", label: "Remetente", width: "w-28", enabled: true, truncate: true },
  { id: "origem_destino", label: "Origem - Destino", width: "w-40", enabled: true, truncate: true },
  { id: "destinatario", label: "Destinatário", width: "w-28", enabled: true, truncate: true },
  { id: "motorista", label: "Motorista", width: "w-32", enabled: true, truncate: true },
  { id: "cavalo", label: "Cavalo", width: "w-20", enabled: true },
  { id: "carreta", label: "Carreta", width: "w-20", enabled: true },
  { id: "carreta2", label: "Carreta 2", width: "w-20", enabled: true },
  { id: "tipo_veiculo", label: "Tipo de Veículo", width: "w-32", enabled: true },
  { id: "tipo_carroceria", label: "Tipo de Carroceria", width: "w-32", enabled: true },
  { id: "produto", label: "Produto", width: "w-32", enabled: true, truncate: true },
  { id: "modalidade_carga", label: "Modalidade", width: "w-24", enabled: true },
  { id: "carregamento_agendamento_data", label: "Agenda Carga", width: "w-32", enabled: true },
  { id: "entrada_galpao", label: "Chegada Carga", width: "w-32", enabled: true },
  { id: "inicio_carregamento", label: "Início Carga", width: "w-32", enabled: true },
  { id: "fim_carregamento", label: "Fim Carga", width: "w-32", enabled: true },
  { id: "saida_unidade", label: "Inicio Viagem", width: "w-32", enabled: true },
  { id: "chegada_destino", label: "Chegada Destino", width: "w-32", enabled: true },
  { id: "descarga_agendamento_data", label: "Agenda Descarga", width: "w-32", enabled: true },
  { id: "agendamento_checklist_data", label: "Agenda Checklist", width: "w-32", enabled: true },
  { id: "descarga_realizada_data", label: "Descarga Realizada", width: "w-32", enabled: true },
  { id: "prazo_entrega", label: "Prazo de Entrega (SLA)", width: "w-32", enabled: true },
  { id: "sla_carregamento", label: "SLA Carga", width: "w-28", enabled: true },
  { id: "sla_entrega", label: "SLA Entrega", width: "w-28", enabled: true },
  { id: "localizacao_atual", label: "Localização", width: "w-48", enabled: true },
  { id: "km_faltam", label: "KM", width: "w-20", enabled: true },
  { id: "senha_agendamento", label: "Senha", width: "w-24", enabled: true },
  { id: "notas_fiscais", label: "Nº NF", width: "w-32", enabled: true },
  { id: "peso", label: "Peso Bruto", width: "w-24", enabled: true },
  { id: "numero_cte", label: "CT-e", width: "w-24", enabled: true },
  { id: "mdfe_url", label: "MDF-e", width: "w-24", enabled: true },
  { id: "mdfe_baixado", label: "MDF-Bx", width: "w-16", enabled: true },
  { id: "saldo_pago", label: "Saldo", width: "w-16", enabled: true },
  { id: "comprovante_entrega_recebido", label: "Comprv.", width: "w-16", enabled: true },
  { id: "observacao_carga", label: "Observações", width: "w-64", enabled: true },
  { id: "observacoes_internas", label: "OBS Internas", width: "w-64", enabled: true },
  { id: "status_tracking", label: "Status", width: "w-20", enabled: true },
  { id: "tolerancia", label: "Tolerância (h)", width: "w-24", enabled: true },
  { id: "diaria_carregamento", label: "Diária Carregamento (h)", width: "w-28", enabled: true },
  { id: "diaria_descarga", label: "Diária Descarga (h)", width: "w-28", enabled: true },
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

export default function PlanilhaView({ ordens, motoristas, veiculos, onUpdate, onExpurgar }) {
  const [editingData, setEditingData] = useState({});
  const [saving, setSaving] = useState(false);
  const [selectedRows, setSelectedRows] = useState(new Set());
  const [colunas, setColunas] = useState(COLUNAS_DISPONIVEIS);
  const [showColumnConfig, setShowColumnConfig] = useState(false);
  const [autoSavingRows, setAutoSavingRows] = useState(new Set());
  const [isDark, setIsDark] = useState(false);
  const [selectedOrdemForTracking, setSelectedOrdemForTracking] = useState(null);
  const [showTrackingModal, setShowTrackingModal] = useState(false);
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState("asc");
  const saveTimeoutRef = useRef({});
  const initialDataRef = useRef({});
  const scrollContainerRef = useRef(null);
  const topScrollRef = useRef(null);
  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const scrollLeftRef = useRef(0);

  // Detect dark mode changes
  useEffect(() => {
    const checkDarkMode = () => {
      setIsDark(document.documentElement.classList.contains('dark'));
    };
    checkDarkMode();
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const savedConfig = localStorage.getItem('planilha_colunas_config');
    if (savedConfig) {
      try {
        const parsedConfig = JSON.parse(savedConfig);
        
        const filteredConfig = parsedConfig.filter(col => col.id !== "data_programacao_descarga");
        
        const newColumnIds = ["mdfe_baixado", "saldo_pago", "comprovante_entrega_recebido", "tolerancia", "diaria_carregamento", "diaria_descarga", "modalidade_carga", "prazo_entrega", "entrada_galpao", "agendamento_checklist_data"];
        const hasNewColumns = newColumnIds.some(colId => !filteredConfig.some(col => col.id === colId));
        
        const labelsAtualizados = {
          "carregamento_agendamento_data": "Agenda Carga",
          "fim_carregamento": "Fim Carga",
          "saida_unidade": "Inicio Viagem",
          "chegada_destino": "Chegada Destino",
          "descarga_agendamento_data": "Agenda Descarga",
          "agendamento_checklist_data": "Agenda Checklist",
          "origem_destino": "Origem - Destino"
        };
        
        const needsLabelUpdate = filteredConfig.some(col => 
          labelsAtualizados[col.id] && col.label !== labelsAtualizados[col.id]
        );

        if (hasNewColumns || needsLabelUpdate) {
          const updatedConfig = COLUNAS_DISPONIVEIS.map(defaultCol => {
            const existingCol = filteredConfig.find(pCol => pCol.id === defaultCol.id);
            return existingCol ? { ...defaultCol, enabled: existingCol.enabled } : defaultCol;
          });
          const finalConfig = updatedConfig.filter(col => COLUNAS_DISPONIVEIS.some(defaultCol => defaultCol.id === col.id));
          setColunas(finalConfig);
          localStorage.setItem('planilha_colunas_config', JSON.stringify(finalConfig));
        } else {
          setColunas(filteredConfig);
        }
      } catch (error) {
        console.error("Erro ao carregar configuração de colunas:", error);
        setColunas(COLUNAS_DISPONIVEIS);
        localStorage.setItem('planilha_colunas_config', JSON.stringify(COLUNAS_DISPONIVEIS));
      }
    } else {
      localStorage.setItem('planilha_colunas_config', JSON.stringify(COLUNAS_DISPONIVEIS));
    }
  }, []);

  useEffect(() => {
    const initialData = {};
    
    // Não sobrescrever valores que estão sendo editados no momento
    const ordensBeingEdited = new Set(Object.keys(saveTimeoutRef.current));
    
    ordens.forEach(ordem => {
      // Se a ordem está sendo editada (tem timeout pendente), manter dados locais
      if (ordensBeingEdited.has(ordem.id) && editingData[ordem.id]) {
        initialData[ordem.id] = editingData[ordem.id];
        console.log(`⏸️ Mantendo dados locais da ordem ${ordem.id.slice(-6)} (em edição)`);
        return;
      }
      
      initialData[ordem.id] = {
        localizacao_atual: ordem.localizacao_atual || "",
        km_faltam: ordem.km_faltam ? ordem.km_faltam.toString() : "",
        observacao_carga: ordem.observacao_carga || "",
        senha_agendamento: ordem.senha_agendamento || "",
        carregamento_agendamento_data: ordem.carregamento_agendamento_data || "",
        entrada_galpao: ordem.entrada_galpao || "",
        inicio_carregamento: ordem.inicio_carregamento || "",
        fim_carregamento: ordem.fim_carregamento || "",
        saida_unidade: ordem.saida_unidade || "",
        chegada_destino: ordem.chegada_destino || "",
        descarga_agendamento_data: ordem.descarga_agendamento_data || "",
        agendamento_checklist_data: ordem.agendamento_checklist_data || "",
        descarga_realizada_data: ordem.descarga_realizada_data || "",
        prazo_entrega: ordem.prazo_entrega || "",
        numero_cte: ordem.numero_cte || "",
        mdfe_url: ordem.mdfe_url || "",
        mdfe_baixado: Boolean(ordem.mdfe_baixado),
        saldo_pago: Boolean(ordem.saldo_pago),
        comprovante_entrega_recebido: Boolean(ordem.comprovante_entrega_recebido),
        observacoes_internas: ordem.observacoes_internas || "",
        notas_fiscais: ordem.notas_fiscais || "",
        tipo_veiculo: ordem.tipo_veiculo || "",
        tipo_carroceria: ordem.tipo_carroceria || "",
        produto: ordem.produto || "",
        viagem_pedido: ordem.viagem_pedido || ""
      };
    });
    
    setEditingData(initialData);
    initialDataRef.current = JSON.parse(JSON.stringify(initialData));
    
    console.log('📊 Dados da planilha sincronizados:', {
      total_ordens: ordens.length,
      ordens_em_edicao: ordensBeingEdited.size,
      exemplo_ordem: ordens[0] ? {
        id: ordens[0].id.slice(-6),
        descarga_realizada_data_servidor: ordens[0].descarga_realizada_data,
        descarga_realizada_data_local: initialData[ordens[0].id]?.descarga_realizada_data
      } : null
    });
  }, [ordens]);

  // Sincronizar scroll entre barra superior e container principal
  useEffect(() => {
    const handleTopScroll = (e) => {
      if (scrollContainerRef.current && !scrollContainerRef.current.dataset.scrolling) {
        scrollContainerRef.current.dataset.scrolling = "true";
        scrollContainerRef.current.scrollLeft = e.target.scrollLeft;
        setTimeout(() => delete scrollContainerRef.current.dataset.scrolling, 10);
      }
    };

    const handleMainScroll = (e) => {
      if (topScrollRef.current && !topScrollRef.current.dataset.scrolling) {
        topScrollRef.current.dataset.scrolling = "true";
        topScrollRef.current.scrollLeft = e.target.scrollLeft;
        setTimeout(() => delete topScrollRef.current.dataset.scrolling, 10);
      }
    };

    const topScroll = topScrollRef.current;
    const mainScroll = scrollContainerRef.current;

    if (topScroll) topScroll.addEventListener('scroll', handleTopScroll);
    if (mainScroll) mainScroll.addEventListener('scroll', handleMainScroll);

    return () => {
      if (topScroll) topScroll.removeEventListener('scroll', handleTopScroll);
      if (mainScroll) mainScroll.removeEventListener('scroll', handleMainScroll);
    };
  }, []);

  // Drag to scroll functionality
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleMouseDown = (e) => {
      // Ignore if clicking on input, button, select or checkbox
      if (e.target.closest('input, button, select, [role="combobox"], [role="checkbox"]')) {
        return;
      }
      
      isDraggingRef.current = true;
      startXRef.current = e.pageX - container.offsetLeft;
      scrollLeftRef.current = container.scrollLeft;
      container.style.cursor = 'grabbing';
      container.style.userSelect = 'none';
    };

    const handleMouseMove = (e) => {
      if (!isDraggingRef.current) return;
      e.preventDefault();
      const x = e.pageX - container.offsetLeft;
      const walk = (x - startXRef.current) * 1.5;
      container.scrollLeft = scrollLeftRef.current - walk;
    };

    const handleMouseUp = () => {
      isDraggingRef.current = false;
      container.style.cursor = 'grab';
      container.style.userSelect = '';
    };

    const handleMouseLeave = () => {
      isDraggingRef.current = false;
      container.style.cursor = 'grab';
      container.style.userSelect = '';
    };

    container.addEventListener('mousedown', handleMouseDown);
    container.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('mouseup', handleMouseUp);
    container.addEventListener('mouseleave', handleMouseLeave);

    container.style.cursor = 'grab';

    return () => {
      container.removeEventListener('mousedown', handleMouseDown);
      container.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('mouseup', handleMouseUp);
      container.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  const autoSaveRow = async (ordemId) => {
    setAutoSavingRows(prev => new Set(prev).add(ordemId));
    try {
      const data = editingData[ordemId];
      if (!data) {
        console.warn(`Dados não encontrados para ordem ${ordemId.slice(-6)}`);
        return;
      }
      
      const ordemAtual = ordens.find(o => o.id === ordemId);
      
      const toISO = (dateStr) => {
        if (!dateStr) return null;
        try {
          // Se já for ISO válido, retornar
          if (dateStr.includes('Z') || dateStr.includes('+')) {
            const date = new Date(dateStr);
            if (!isNaN(date.getTime())) {
              return date.toISOString();
            }
          }
          
          // Tentar converter qualquer formato
          const date = new Date(dateStr);
          if (!isNaN(date.getTime())) {
            return date.toISOString();
          }
          
          console.warn('Data inválida não será salva:', dateStr);
          return null;
        } catch (error) {
          console.error('Erro ao converter data:', dateStr, error);
          return null;
        }
      };

      const dataToSave = {
        localizacao_atual: data.localizacao_atual ? String(data.localizacao_atual) : null,
        km_faltam: data.km_faltam ? parseFloat(data.km_faltam) : null,
        observacao_carga: data.observacao_carga ? String(data.observacao_carga) : null,
        senha_agendamento: data.senha_agendamento ? String(data.senha_agendamento) : null,
        carregamento_agendamento_data: toISO(data.carregamento_agendamento_data),
        entrada_galpao: toISO(data.entrada_galpao),
        inicio_carregamento: toISO(data.inicio_carregamento),
        fim_carregamento: toISO(data.fim_carregamento),
        saida_unidade: toISO(data.saida_unidade),
        chegada_destino: toISO(data.chegada_destino),
        descarga_agendamento_data: toISO(data.descarga_agendamento_data),
        agendamento_checklist_data: toISO(data.agendamento_checklist_data),
        descarga_realizada_data: toISO(data.descarga_realizada_data),
        prazo_entrega: toISO(data.prazo_entrega),
        numero_cte: data.numero_cte ? String(data.numero_cte) : null,
        mdfe_url: data.mdfe_url ? String(data.mdfe_url) : null,
        mdfe_baixado: Boolean(data.mdfe_baixado),
        saldo_pago: Boolean(data.saldo_pago),
        comprovante_entrega_recebido: Boolean(data.comprovante_entrega_recebido),
        observacoes_internas: data.observacoes_internas ? String(data.observacoes_internas) : null,
        notas_fiscais: data.notas_fiscais ? String(data.notas_fiscais) : null,
        tipo_veiculo: data.tipo_veiculo ? String(data.tipo_veiculo) : null,
        tipo_carroceria: data.tipo_carroceria ? String(data.tipo_carroceria) : null,
        produto: data.produto ? String(data.produto) : null,
        viagem_pedido: data.viagem_pedido ? String(data.viagem_pedido) : null
      };
      
      console.log(`💾 Auto-salvando ordem ${ordemId.slice(-6)}:`, {
        descarga_realizada_data: { 
          original: data.descarga_realizada_data, 
          convertido: dataToSave.descarga_realizada_data,
          tipo: typeof data.descarga_realizada_data
        }
      });

      // Atualizar status automaticamente baseado nas datas preenchidas
      let novoStatus = ordemAtual?.status_tracking;

      if (toISO(data.descarga_realizada_data)) {
        novoStatus = "finalizado";
      } else if (toISO(data.chegada_destino)) {
        novoStatus = "chegada_destino";
      } else if (toISO(data.saida_unidade)) {
        novoStatus = "em_viagem";
      } else if (toISO(data.fim_carregamento)) {
        novoStatus = "carregado";
      } else if (toISO(data.inicio_carregamento)) {
        novoStatus = "em_carregamento";
      } else if (toISO(data.descarga_agendamento_data)) {
        novoStatus = "descarga_agendada";
      } else if (toISO(data.carregamento_agendamento_data)) {
        novoStatus = "carregamento_agendado";
      }

      if (novoStatus) {
        dataToSave.status_tracking = novoStatus;
      }

      await base44.entities.OrdemDeCarregamento.update(ordemId, dataToSave);
      
      console.log(`✅ Ordem ${ordemId.slice(-6)} salva com sucesso no servidor`);
      
      // Atualizar dados de referência apenas após confirmação do servidor
      initialDataRef.current[ordemId] = JSON.parse(JSON.stringify(editingData[ordemId]));
    } catch (error) {
      console.error("Erro ao salvar automaticamente:", error);
      toast.error(`Erro ao salvar ordem ${ordemId.slice(-6)}`);
    } finally {
      setAutoSavingRows(prev => {
        const newSet = new Set(prev);
        newSet.delete(ordemId);
        return newSet;
      });
    }
  };

  const handleCellChange = (ordemId, field, value) => {
    console.log(`📝 Campo alterado - Ordem: ${ordemId.slice(-6)}, Campo: ${field}, Valor: ${value}`);
    
    setEditingData(prev => ({
      ...prev,
      [ordemId]: { ...prev[ordemId], [field]: value }
    }));

    if (saveTimeoutRef.current[ordemId]) {
      clearTimeout(saveTimeoutRef.current[ordemId]);
    }

    saveTimeoutRef.current[ordemId] = setTimeout(() => {
      autoSaveRow(ordemId);
    }, 300);
  };

  useEffect(() => {
    return () => {
      Object.values(saveTimeoutRef.current).forEach(timeout => clearTimeout(timeout));
    };
  }, []);

  const handleKeyDown = (e, ordemId, field) => {
    if (e.key === 'h' || e.key === 'H') {
      e.preventDefault();
      const agora = new Date();
      const ano = agora.getFullYear();
      const mes = String(agora.getMonth() + 1).padStart(2, '0');
      const dia = String(agora.getDate()).padStart(2, '0');
      const hora = String(agora.getHours()).padStart(2, '0');
      const min = String(agora.getMinutes()).padStart(2, '0');
      handleCellChange(ordemId, field, `${ano}-${mes}-${dia}T${hora}:${min}`);
    }
  };

  const handleSave = async (ordemId) => {
    if (saveTimeoutRef.current[ordemId]) {
      clearTimeout(saveTimeoutRef.current[ordemId]);
    }

    setSaving(true);
    try {
      const data = editingData[ordemId];
      const ordemAtual = ordens.find(o => o.id === ordemId);
      
      const toISO = (dateStr) => {
        if (!dateStr) return null;
        try {
          // Se já for ISO válido, retornar
          if (dateStr.includes('Z') || dateStr.includes('+')) {
            const date = new Date(dateStr);
            if (!isNaN(date.getTime())) {
              return date.toISOString();
            }
          }
          
          // Tentar converter qualquer formato
          const date = new Date(dateStr);
          if (!isNaN(date.getTime())) {
            return date.toISOString();
          }
          
          return null;
        } catch (error) {
          console.error('Erro ao converter data:', dateStr, error);
          return null;
        }
      };

      const dataToSave = {
        localizacao_atual: data.localizacao_atual ? String(data.localizacao_atual) : null,
        km_faltam: data.km_faltam ? parseFloat(data.km_faltam) : null,
        observacao_carga: data.observacao_carga ? String(data.observacao_carga) : null,
        senha_agendamento: data.senha_agendamento ? String(data.senha_agendamento) : null,
        carregamento_agendamento_data: toISO(data.carregamento_agendamento_data),
        entrada_galpao: toISO(data.entrada_galpao),
        inicio_carregamento: toISO(data.inicio_carregamento),
        fim_carregamento: toISO(data.fim_carregamento),
        saida_unidade: toISO(data.saida_unidade),
        chegada_destino: toISO(data.chegada_destino),
        descarga_agendamento_data: toISO(data.descarga_agendamento_data),
        agendamento_checklist_data: toISO(data.agendamento_checklist_data),
        descarga_realizada_data: toISO(data.descarga_realizada_data),
        prazo_entrega: toISO(data.prazo_entrega),
        numero_cte: data.numero_cte ? String(data.numero_cte) : null,
        mdfe_url: data.mdfe_url ? String(data.mdfe_url) : null,
        mdfe_baixado: Boolean(data.mdfe_baixado),
        saldo_pago: Boolean(data.saldo_pago),
        comprovante_entrega_recebido: Boolean(data.comprovante_entrega_recebido),
        observacoes_internas: data.observacoes_internas ? String(data.observacoes_internas) : null,
        notas_fiscais: data.notas_fiscais ? String(data.notas_fiscais) : null,
        tipo_veiculo: data.tipo_veiculo ? String(data.tipo_veiculo) : null,
        tipo_carroceria: data.tipo_carroceria ? String(data.tipo_carroceria) : null,
        produto: data.produto ? String(data.produto) : null,
        viagem_pedido: data.viagem_pedido ? String(data.viagem_pedido) : null
      };
      
      console.log(`💾 Salvando manualmente ordem ${ordemId.slice(-6)}:`, {
        descarga_realizada_data: { valor: data.descarga_realizada_data, convertido: dataToSave.descarga_realizada_data }
      });

      // Atualizar status automaticamente baseado nas datas preenchidas
      let novoStatus = ordemAtual?.status_tracking;

      if (toISO(data.descarga_realizada_data)) {
        novoStatus = "finalizado";
      } else if (toISO(data.chegada_destino)) {
        novoStatus = "chegada_destino";
      } else if (toISO(data.saida_unidade)) {
        novoStatus = "em_viagem";
      } else if (toISO(data.fim_carregamento)) {
        novoStatus = "carregado";
      } else if (toISO(data.inicio_carregamento)) {
        novoStatus = "em_carregamento";
      } else if (toISO(data.descarga_agendamento_data)) {
        novoStatus = "descarga_agendada";
      } else if (toISO(data.carregamento_agendamento_data)) {
        novoStatus = "carregamento_agendado";
      }

      if (novoStatus) {
        dataToSave.status_tracking = novoStatus;
      }

      await base44.entities.OrdemDeCarregamento.update(ordemId, dataToSave);
      initialDataRef.current[ordemId] = JSON.parse(JSON.stringify(editingData[ordemId]));
      toast.success("Dados salvos com sucesso!");
    } catch (error) {
      console.error("Erro ao salvar:", error);
      toast.error("Erro ao salvar dados");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveSelected = async () => {
    if (selectedRows.size === 0) {
      toast.error("Selecione pelo menos uma ordem");
      return;
    }

    selectedRows.forEach(ordemId => {
      if (saveTimeoutRef.current[ordemId]) {
        clearTimeout(saveTimeoutRef.current[ordemId]);
        delete saveTimeoutRef.current[ordemId];
      }
    });

    setSaving(true);
    try {
      const toISO = (dateStr) => {
        if (!dateStr) return null;
        try {
          // Se já for ISO válido, retornar
          if (dateStr.includes('Z') || dateStr.includes('+')) {
            const date = new Date(dateStr);
            if (!isNaN(date.getTime())) {
              return date.toISOString();
            }
          }
          
          // Tentar converter qualquer formato
          const date = new Date(dateStr);
          if (!isNaN(date.getTime())) {
            return date.toISOString();
          }
          
          return null;
        } catch (error) {
          console.error('Erro ao converter data:', dateStr, error);
          return null;
        }
      };

      const promises = Array.from(selectedRows).map(ordemId => {
        const data = editingData[ordemId];
        const dataToSave = {
          localizacao_atual: data.localizacao_atual ? String(data.localizacao_atual) : null,
          km_faltam: data.km_faltam ? parseFloat(data.km_faltam) : null,
          observacao_carga: data.observacao_carga ? String(data.observacao_carga) : null,
          senha_agendamento: data.senha_agendamento ? String(data.senha_agendamento) : null,
          carregamento_agendamento_data: toISO(data.carregamento_agendamento_data),
          entrada_galpao: toISO(data.entrada_galpao),
          inicio_carregamento: toISO(data.inicio_carregamento),
          fim_carregamento: toISO(data.fim_carregamento),
          saida_unidade: toISO(data.saida_unidade),
          chegada_destino: toISO(data.chegada_destino),
          descarga_agendamento_data: toISO(data.descarga_agendamento_data),
          agendamento_checklist_data: toISO(data.agendamento_checklist_data),
          descarga_realizada_data: toISO(data.descarga_realizada_data),
          prazo_entrega: toISO(data.prazo_entrega),
          numero_cte: data.numero_cte ? String(data.numero_cte) : null,
          mdfe_url: data.mdfe_url ? String(data.mdfe_url) : null,
          mdfe_baixado: data.mdfe_baixado || false,
          saldo_pago: data.saldo_pago || false,
          comprovante_entrega_recebido: data.comprovante_entrega_recebido || false,
          observacoes_internas: data.observacoes_internas ? String(data.observacoes_internas) : null,
          notas_fiscais: data.notas_fiscais ? String(data.notas_fiscais) : null,
          tipo_veiculo: data.tipo_veiculo ? String(data.tipo_veiculo) : null,
          tipo_carroceria: data.tipo_carroceria ? String(data.tipo_carroceria) : null,
          produto: data.produto ? String(data.produto) : null,
          viagem_pedido: data.viagem_pedido ? String(data.viagem_pedido) : null
        };
        return base44.entities.OrdemDeCarregamento.update(ordemId, dataToSave);
      });

      await Promise.all(promises);

      selectedRows.forEach(ordemId => {
        initialDataRef.current[ordemId] = JSON.parse(JSON.stringify(editingData[ordemId]));
      });

      toast.success(`${promises.length} ordens selecionadas atualizadas!`);
      setSelectedRows(new Set());
    } catch (error) {
      console.error("Erro ao salvar selecionadas:", error);
      toast.error("Erro ao salvar dados");
    } finally {
      setSaving(false);
    }
  };

  const toggleRowSelection = (ordemId) => {
    setSelectedRows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(ordemId)) {
        newSet.delete(ordemId);
      } else {
        newSet.add(ordemId);
      }
      return newSet;
    });
  };

  const toggleAllRows = () => {
    if (selectedRows.size === ordens.length) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(ordens.map(o => o.id)));
    }
  };

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const items = Array.from(colunas);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setColunas(items);
    localStorage.setItem('planilha_colunas_config', JSON.stringify(items));
    toast.success("Ordem das colunas atualizada!");
  };

  const toggleColuna = (colunaId) => {
    const newColunas = colunas.map(col =>
      col.id === colunaId ? { ...col, enabled: !col.enabled } : col
    );
    setColunas(newColunas);
    localStorage.setItem('planilha_colunas_config', JSON.stringify(newColunas));
  };

  const resetColunas = () => {
    setColunas(COLUNAS_DISPONIVEIS);
    localStorage.setItem('planilha_colunas_config', JSON.stringify(COLUNAS_DISPONIVEIS));
    toast.success("Configuração de colunas restaurada e atualizada!");
  };

  const theme = {
    cardBg: isDark ? '#1e293b' : '#ffffff',
    cardBorder: isDark ? '#334155' : '#e5e7eb',
    text: isDark ? '#f1f5f9' : '#111827',
    textMuted: isDark ? '#94a3b8' : '#6b7280',
    headerBg: isDark ? '#0f172a' : '#f9fafb',
    headerBgDark: isDark ? 'linear-gradient(to right, #0f172a, #0f172a)' : 'linear-gradient(to right, rgb(249, 250, 251), rgb(239, 246, 255))',
    rowBg: isDark ? '#1e293b' : '#ffffff',
    rowBgAlt: isDark ? '#0f172a' : '#f9fafb',
    rowBgSelected: isDark ? 'rgba(37, 99, 235, 0.3)' : '#dbeafe',
    rowHover: isDark ? 'rgba(51, 65, 85, 0.5)' : '#eff6ff',
    border: isDark ? '#334155' : '#e5e7eb',
    footerBg: isDark
      ? 'linear-gradient(to right, #0f172a, #0f172a)'
      : 'linear-gradient(to right, rgb(249, 250, 251), rgb(239, 246, 255))',
    inputBg: isDark ? '#1e293b' : '#ffffff',
    inputBorder: isDark ? '#475569' : '#d1d5db',
    inputTextColor: isDark ? '#e2e8f0' : '#1f2937',
    inputPlaceholderColor: isDark ? '#64748b' : '#6b7280',
    primaryBlue: isDark ? '#60a5fa' : '#2563eb',
    primaryGreen: isDark ? '#4ade80' : '#16a34a',
    orangeText: isDark ? '#fb923c' : '#ea580c',
    grayText: isDark ? '#94a3b8' : '#6b7280',
    blueBgLight: isDark ? 'rgba(59, 130, 246, 0.2)' : '#dbeafe',
    grayBgLight: isDark ? '#1e293b' : '#f3f4f6',
    greenBgLight: isDark ? 'rgba(34, 197, 94, 0.1)' : '#f0fdf4',
    greenBorderLight: isDark ? '#16a34a' : '#bbf7d0',
    blueBorderLight: isDark ? '#1e40af' : '#bfdbfe',
    badgeBgDark: isDark ? '#475569' : '#f9fafb',
  };

  const getStatusBadge = (status) => {
    const colors = {
      finalizado: "bg-gray-600 text-white",
      em_viagem: "bg-purple-100 text-purple-700",
      carregado: "bg-green-100 text-green-700"
    };
    const darkColors = {
      finalizado: "bg-gray-600 text-white",
      em_viagem: "bg-purple-900/40 text-purple-400",
      carregado: "bg-green-900/40 text-green-400"
    };
    return isDark ? (darkColors[status] || "bg-slate-700 text-gray-300") : (colors[status] || "bg-gray-100 text-gray-700");
  };

  const renderCell = (coluna, ordem, data) => {
    const motorista = getMotorista(ordem.motorista_id);
    const cavalo = getVeiculo(ordem.cavalo_id);
    const impl1 = getVeiculo(ordem.implemento1_id);
    const impl2 = getVeiculo(ordem.implemento2_id);

    switch (coluna.id) {
      case "numero_carga":
        return (
          <p className="font-bold text-[10px] truncate" style={{ color: theme.primaryBlue }}>
            {ordem.numero_carga || `#${ordem.id.slice(-6)}`}
          </p>
        );
      case "viagem_pedido":
        return (
          <Input
            value={data.viagem_pedido || ""}
            onChange={(e) => handleCellChange(ordem.id, "viagem_pedido", e.target.value)}
            placeholder="Pedido"
            className="h-6 text-[10px] w-full min-w-[80px]"
            style={{ backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.inputTextColor }}
          />
        );
      case "cliente":
        const clienteText = ordem.cliente || "-";
        return (
          <p 
            className="font-medium text-[10px] leading-tight" 
            style={{ 
              color: theme.text,
              maxHeight: '28px',
              overflow: 'hidden',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              wordBreak: 'break-word'
            }}
            title={clienteText}
          >
            {clienteText}
          </p>
        );
      case "origem_destino":
        const origemText = ordem.origem_cidade || ordem.origem || "-";
        const destinoText = ordem.destino_cidade || ordem.destino || "-";
        return (
          <p 
            className="text-[10px] leading-tight" 
            style={{ 
              color: theme.text,
              maxHeight: '28px',
              overflow: 'hidden',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              wordBreak: 'break-word'
            }}
            title={`${origemText} - ${destinoText}`}
          >
            {origemText} - {destinoText}
          </p>
        );
      case "destinatario":
        const destText = ordem.destinatario || ordem.destino || "-";
        return (
          <p 
            className="font-medium text-[10px] leading-tight" 
            style={{ 
              color: theme.text,
              maxHeight: '28px',
              overflow: 'hidden',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              wordBreak: 'break-word'
            }}
            title={destText}
          >
            {destText}
          </p>
        );
      case "motorista":
        const motoristaText = motorista?.nome || "-";
        return (
          <p 
            className="font-medium text-[10px] leading-tight" 
            style={{ 
              color: theme.text,
              maxHeight: '28px',
              overflow: 'hidden',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              wordBreak: 'break-word'
            }}
            title={motoristaText}
          >
            {motoristaText}
          </p>
        );
      case "produto":
        const produtoText = data.produto || "";
        return (
          <div className="w-full" style={{ maxHeight: '28px', overflow: 'hidden' }}>
            <Input
              value={produtoText}
              onChange={(e) => handleCellChange(ordem.id, "produto", e.target.value)}
              placeholder="Produto"
              className="h-6 text-[10px] w-full min-w-[120px]"
              style={{ backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.inputTextColor }}
              title={produtoText}
            />
          </div>
        );
      case "modalidade_carga":
        const modalidadeBadges = {
          normal: { label: "Normal", color: "#3b82f6" },
          prioridade: { label: "Prior.", color: "#f59e0b" },
          expressa: { label: "Express", color: "#ef4444" }
        };
        const modalidade = modalidadeBadges[ordem.modalidade_carga] || { label: "Normal", color: "#6b7280" };
        return (
          <div className="flex items-center justify-center h-full">
            <Badge 
              className="text-[8px] px-1.5 py-0.5 whitespace-nowrap font-bold leading-tight"
              style={{ backgroundColor: modalidade.color, color: 'white', minWidth: '50px', textAlign: 'center' }}
            >
              {modalidade.label}
            </Badge>
          </div>
        );
      case "cavalo":
        return <p className="font-mono font-bold text-[10px]" style={{ color: theme.text }}>{cavalo?.placa || "-"}</p>;
      case "carreta":
        return <p className="font-mono text-[10px]" style={{ color: theme.text }}>{impl1?.placa || "-"}</p>;
      case "carreta2":
        return <p className="font-mono text-[10px]" style={{ color: theme.text }}>{impl2?.placa || "-"}</p>;
      case "tipo_veiculo":
        return (
          <Select
            value={data.tipo_veiculo || ""}
            onValueChange={(value) => handleCellChange(ordem.id, "tipo_veiculo", value)}
          >
            <SelectTrigger className="h-6 text-[10px] w-full min-w-[120px]"
              style={{ backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.inputTextColor }}
            >
              <SelectValue placeholder="Tipo..." />
            </SelectTrigger>
            <SelectContent style={{ backgroundColor: theme.rowBgAlt, borderColor: theme.inputBorder }}>
              {tipoVeiculoOptions.map((option) => (
                <SelectItem key={option.value} value={option.value} className="text-xs"
                  style={{ color: theme.inputTextColor, backgroundColor: theme.rowBgAlt }}
                >
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      case "tipo_carroceria":
        return (
          <Select
            value={data.tipo_carroceria || ""}
            onValueChange={(value) => handleCellChange(ordem.id, "tipo_carroceria", value)}
          >
            <SelectTrigger className="h-6 text-[10px] w-full min-w-[120px]"
              style={{ backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.inputTextColor }}
            >
              <SelectValue placeholder="Tipo..." />
            </SelectTrigger>
            <SelectContent style={{ backgroundColor: theme.rowBgAlt, borderColor: theme.inputBorder }}>
              {tipoCarroceriaOptions.map((option) => (
                <SelectItem key={option.value} value={option.value} className="text-xs"
                  style={{ color: theme.inputTextColor, backgroundColor: theme.rowBgAlt }}
                >
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      case "notas_fiscais":
        return (
          <Input
            value={data.notas_fiscais || ""}
            onChange={(e) => handleCellChange(ordem.id, "notas_fiscais", e.target.value)}
            placeholder="Nº NF"
            className="h-6 text-[10px] w-full min-w-[120px]"
            style={{ backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.inputTextColor }}
          />
        );
      case "peso":
        return (
          <div className="text-[10px]" style={{ color: theme.text }}>
            {ordem.peso ? `${(ordem.peso / 1000).toFixed(2)} ton` : "-"}
          </div>
        );
      case "numero_cte":
        return (
          <Input
            value={data.numero_cte || ""}
            onChange={(e) => handleCellChange(ordem.id, "numero_cte", e.target.value)}
            placeholder="CT-e"
            className="h-6 text-[10px] w-full min-w-[100px]"
            style={{ backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.inputTextColor }}
          />
        );
      case "mdfe_url":
        return (
          <Input
            value={data.mdfe_url || ""}
            onChange={(e) => handleCellChange(ordem.id, "mdfe_url", e.target.value)}
            placeholder="MDF-e"
            className="h-6 text-[10px] w-full min-w-[100px]"
            style={{ backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.inputTextColor }}
          />
        );
      case "mdfe_baixado":
        return (
          <div className="flex items-center justify-center">
            <Checkbox
              checked={data.mdfe_baixado || false}
              onCheckedChange={(checked) => handleCellChange(ordem.id, "mdfe_baixado", checked)}
              className="h-4 w-4"
              style={{
                borderColor: data.mdfe_baixado ? (isDark ? '#22c55e' : '#22c55e') : (isDark ? '#6b7280' : '#6b7280'),
                backgroundColor: data.mdfe_baixado ? (isDark ? '#22c55e' : '#22c55e') : 'transparent'
              }}
            />
          </div>
        );
      case "saldo_pago":
        return (
          <div className="flex items-center justify-center">
            <Checkbox
              checked={data.saldo_pago || false}
              onCheckedChange={(checked) => handleCellChange(ordem.id, "saldo_pago", checked)}
              className="h-4 w-4"
              style={{
                borderColor: data.saldo_pago ? (isDark ? '#22c55e' : '#22c55e') : (isDark ? '#6b7280' : '#6b7280'),
                backgroundColor: data.saldo_pago ? (isDark ? '#22c55e' : '#22c55e') : 'transparent'
              }}
            />
          </div>
        );
      case "comprovante_entrega_recebido":
        return (
          <div className="flex items-center justify-center">
            <Checkbox
              checked={data.comprovante_entrega_recebido || false}
              onCheckedChange={(checked) => handleCellChange(ordem.id, "comprovante_entrega_recebido", checked)}
              className="h-4 w-4"
              style={{
                borderColor: data.comprovante_entrega_recebido ? (isDark ? '#22c55e' : '#22c55e') : (isDark ? '#6b7280' : '#6b7280'),
                backgroundColor: data.comprovante_entrega_recebido ? (isDark ? '#22c55e' : '#22c55e') : 'transparent'
              }}
            />
          </div>
        );
      case "carregamento_agendamento_data":
      case "entrada_galpao":
      case "inicio_carregamento":
      case "fim_carregamento":
      case "saida_unidade":
      case "chegada_destino":
      case "descarga_agendamento_data":
      case "agendamento_checklist_data":
      case "descarga_realizada_data":
      case "prazo_entrega":
        const formatDateTimeLocal = (dateStr) => {
          if (!dateStr) return "";
          try {
            const date = new Date(dateStr);
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            const hours = String(date.getHours()).padStart(2, '0');
            const minutes = String(date.getMinutes()).padStart(2, '0');
            return `${year}-${month}-${day}T${hours}:${minutes}`;
          } catch (e) {
            return "";
          }
        };
        
        return (
          <Input
            type="datetime-local"
            value={formatDateTimeLocal(data[coluna.id])}
            onChange={(e) => handleCellChange(ordem.id, coluna.id, e.target.value)}
            onKeyDown={(e) => handleKeyDown(e, ordem.id, coluna.id)}
            className="h-6 text-[10px] w-full"
            style={{ backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.inputTextColor }}
            title="Digite H para agora"
          />
        );
      case "localizacao_atual":
        return (
          <Input
            value={data.localizacao_atual || ""}
            onChange={(e) => handleCellChange(ordem.id, "localizacao_atual", e.target.value)}
            placeholder="Ex: BR-116, KM 350"
            className="h-6 text-[10px] w-full min-w-[180px]"
            style={{ backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.inputTextColor }}
          />
        );
      case "km_faltam":
        return (
          <Input
            type="text"
            value={data.km_faltam || ""}
            onChange={(e) => handleCellChange(ordem.id, "km_faltam", e.target.value)}
            placeholder="KM"
            className="h-6 text-[10px] w-full min-w-[80px]"
            style={{ backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.inputTextColor }}
          />
        );
      case "senha_agendamento":
        return (
          <Input
            type="text"
            value={data.senha_agendamento || ""}
            onChange={(e) => handleCellChange(ordem.id, "senha_agendamento", e.target.value)}
            placeholder="Senha"
            className="h-6 text-[10px] w-full min-w-[100px]"
            style={{ backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.inputTextColor }}
          />
        );
      case "observacao_carga":
        return (
          <Input
            value={data.observacao_carga || ""}
            onChange={(e) => handleCellChange(ordem.id, "observacao_carga", e.target.value)}
            placeholder="Observações..."
            className="h-6 text-[10px] w-full min-w-[240px]"
            style={{ backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.inputTextColor }}
          />
        );
      case "observacoes_internas":
        return (
          <Input
            value={data.observacoes_internas || ""}
            onChange={(e) => handleCellChange(ordem.id, "observacoes_internas", e.target.value)}
            placeholder="Internas..."
            className="h-6 text-[10px] w-full min-w-[240px]"
            style={{ backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.inputTextColor }}
          />
        );
      case "status_tracking":
        const statusLabels = {
          aguardando_agendamento: "AGUARDA",
          carregamento_agendado: "AGEND.",
          em_carregamento: "CARREG.",
          carregado: "CARREGADO",
          em_viagem: "VIAGEM",
          chegada_destino: "DESTINO",
          descarga_agendada: "AG. DESC",
          em_descarga: "DESCAR.",
          descarga_realizada: "DESC. OK",
          finalizado: "FINAL"
        };
        const statusLabel = statusLabels[ordem.status_tracking] || "PEND.";
        return (
          <div className="flex items-center justify-center h-full">
            <Badge 
              className={`${getStatusBadge(ordem.status_tracking)} text-[8px] px-1.5 py-0.5 font-bold leading-tight whitespace-nowrap`}
              style={{ minWidth: '60px', textAlign: 'center' }}
            >
              {statusLabel}
            </Badge>
          </div>
        );

      case "tolerancia":
        return (
          <div className="text-[10px] text-center font-medium" style={{ color: theme.text }}>
            {ordem.operacao_tolerancia_horas ? `${ordem.operacao_tolerancia_horas}h` : "-"}
          </div>
        );

      case "diaria_carregamento":
        let dataInicioCarregamento = null;
        if (ordem.carregamento_agendamento_data && ordem.inicio_carregamento) {
          dataInicioCarregamento = new Date(Math.max(new Date(ordem.carregamento_agendamento_data).getTime(), new Date(ordem.inicio_carregamento).getTime()));
        } else if (ordem.carregamento_agendamento_data) {
          dataInicioCarregamento = new Date(ordem.carregamento_agendamento_data);
        } else if (ordem.inicio_carregamento) {
          dataInicioCarregamento = new Date(ordem.inicio_carregamento);
        }

        const dataFimCarregamento = ordem.fim_carregamento ? new Date(ordem.fim_carregamento) : null;

        let horasCarregamento = null;
        let corCarregamento = '#854d0e'; // Amarelo escuro padrão
        if (dataInicioCarregamento && dataFimCarregamento) {
          const diffMs = dataFimCarregamento - dataInicioCarregamento;
          const diffHoras = diffMs / (1000 * 60 * 60);
          const tolerancia = ordem.operacao_tolerancia_horas || 0;
          horasCarregamento = Math.max(0, diffHoras - tolerancia);
          
          // Calcular cor baseada em dias
          const dias = horasCarregamento / 24;
          if (dias <= 10) {
            corCarregamento = '#854d0e'; // Amarelo escuro
          } else if (dias <= 20) {
            corCarregamento = '#ea580c'; // Laranja
          } else {
            corCarregamento = '#dc2626'; // Vermelho
          }
        }

        return (
          <div className="flex justify-center items-center">
            {horasCarregamento !== null && horasCarregamento > 0 ? (
              <span 
                className="text-[10px] px-2 py-0.5 rounded font-bold whitespace-nowrap inline-block"
                style={{ backgroundColor: corCarregamento, color: '#ffffff' }}
              >
                {horasCarregamento.toFixed(1)}h
              </span>
            ) : (
              <span className="text-[10px]" style={{ color: theme.grayText }}>-</span>
            )}
          </div>
        );

      case "diaria_descarga":
        let dataInicioDescarga = null;
        if (ordem.chegada_destino && ordem.descarga_agendamento_data) {
          dataInicioDescarga = new Date(Math.max(new Date(ordem.chegada_destino).getTime(), new Date(ordem.descarga_agendamento_data).getTime()));
        } else if (ordem.chegada_destino) {
          dataInicioDescarga = new Date(ordem.chegada_destino);
        } else if (ordem.descarga_agendamento_data) {
          dataInicioDescarga = new Date(ordem.descarga_agendamento_data);
        }

        const dataFimDescarga = ordem.descarga_realizada_data ? new Date(ordem.descarga_realizada_data) : null;

        let horasDescarga = null;
        let corDescarga = '#854d0e'; // Amarelo escuro padrão
        if (dataInicioDescarga && dataFimDescarga) {
          const diffMs = dataFimDescarga - dataInicioDescarga;
          const diffHoras = diffMs / (1000 * 60 * 60);
          const tolerancia = ordem.operacao_tolerancia_horas || 0;
          horasDescarga = Math.max(0, diffHoras - tolerancia);
          
          // Calcular cor baseada em dias
          const dias = horasDescarga / 24;
          if (dias <= 10) {
            corDescarga = '#854d0e'; // Amarelo escuro
          } else if (dias <= 20) {
            corDescarga = '#ea580c'; // Laranja
          } else {
            corDescarga = '#dc2626'; // Vermelho
          }
        }

        return (
          <div className="flex justify-center items-center">
            {horasDescarga !== null && horasDescarga > 0 ? (
              <span 
                className="text-[10px] px-2 py-0.5 rounded font-bold whitespace-nowrap inline-block"
                style={{ backgroundColor: corDescarga, color: '#ffffff' }}
              >
                {horasDescarga.toFixed(1)}h
              </span>
            ) : (
              <span className="text-[10px]" style={{ color: theme.grayText }}>-</span>
            )}
          </div>
        );

      case "sla_carregamento":
        // Se expurgado
        if (ordem.carregamento_expurgado) {
          return (
            <div className="flex items-center justify-center gap-1">
              <Badge 
                className="text-[9px] h-4 px-1.5 font-bold cursor-help"
                style={{
                  backgroundColor: isDark ? 'rgba(107, 114, 128, 0.3)' : '#f3f4f6',
                  borderWidth: '1px',
                  borderColor: isDark ? '#6b7280' : '#d1d5db',
                  color: isDark ? '#9ca3af' : '#6b7280'
                }}
                title={`Expurgado: ${ordem.carregamento_expurgo_motivo || 'N/A'}`}
              >
                EXPURGADO
              </Badge>
            </div>
          );
        }

        // Se já carregou (fim_carregamento preenchido)
        if (ordem.fim_carregamento) {
          const agendadoCarga = new Date(ordem.carregamento_agendamento_data);
          const realizadoCarga = new Date(ordem.fim_carregamento);
          const noPrazoCarga = realizadoCarga <= agendadoCarga;
          
          const diffMs = realizadoCarga - agendadoCarga;
          const horasAtraso = Math.round(diffMs / (1000 * 60 * 60));

          if (noPrazoCarga) {
            return (
              <Badge 
                className="text-[9px] h-4 px-1.5 font-bold"
                style={{
                  backgroundColor: isDark ? 'rgba(34, 197, 94, 0.2)' : '#dcfce7',
                  borderWidth: '1px',
                  borderColor: isDark ? '#22c55e' : '#86efac',
                  color: isDark ? '#4ade80' : '#15803d'
                }}
              >
                ✓ NO PRAZO
              </Badge>
            );
          } else {
            return (
              <div className="flex items-center justify-center gap-1">
                <Badge 
                  className="text-[9px] h-4 px-1.5 font-bold"
                  style={{
                    backgroundColor: isDark ? 'rgba(239, 68, 68, 0.2)' : '#fee2e2',
                    borderWidth: '1px',
                    borderColor: isDark ? '#ef4444' : '#fca5a5',
                    color: isDark ? '#f87171' : '#dc2626'
                  }}
                >
                  +{horasAtraso}h
                </Badge>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-4 w-4 p-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    onExpurgar(ordem, "carregamento");
                  }}
                  title="Expurgar carregamento"
                >
                  <AlertTriangle className="w-3 h-3 text-orange-600" />
                </Button>
              </div>
            );
          }
        }

        // Se ainda não carregou, mas tem agendamento (cronômetro)
        if (ordem.carregamento_agendamento_data) {
          const agora = new Date();
          const agendado = new Date(ordem.carregamento_agendamento_data);
          const diffMs = agendado - agora;
          const horasRestantes = Math.round(diffMs / (1000 * 60 * 60));
          
          let corCronometro = "#3b82f6"; // Azul padrão
          if (horasRestantes < 0) {
            corCronometro = "#ef4444"; // Vermelho - atrasado
          } else if (horasRestantes <= 6) {
            corCronometro = "#ef4444"; // Vermelho - < 6h
          } else if (horasRestantes <= 24) {
            corCronometro = "#eab308"; // Amarelo - < 24h
          }
          
          return (
            <div className="flex items-center justify-center gap-1.5">
              <div 
                className="w-2 h-2 rounded-full animate-pulse" 
                style={{ backgroundColor: corCronometro }}
                title="Indicador de tempo"
              />
              <span 
                className="text-[9px] font-bold"
                style={{ color: corCronometro }}
              >
                {horasRestantes < 0 ? `+${Math.abs(horasRestantes)}h` : `${horasRestantes}h`}
              </span>
            </div>
          );
        }

        return <span className="text-[9px]" style={{ color: theme.grayText }}>-</span>;

      case "sla_entrega":
        // Se expurgado
        if (ordem.entrega_expurgada) {
          return (
            <div className="flex items-center justify-center gap-1">
              <Badge 
                className="text-[9px] h-4 px-1.5 font-bold cursor-help"
                style={{
                  backgroundColor: isDark ? 'rgba(107, 114, 128, 0.3)' : '#f3f4f6',
                  borderWidth: '1px',
                  borderColor: isDark ? '#6b7280' : '#d1d5db',
                  color: isDark ? '#9ca3af' : '#6b7280'
                }}
                title={`Expurgado: ${ordem.entrega_expurgo_motivo || 'N/A'}`}
              >
                EXPURGADO
              </Badge>
            </div>
          );
        }

        // Se já entregou (chegada_destino preenchida)
        if (ordem.chegada_destino && ordem.prazo_entrega) {
          const prazoEntrega = new Date(ordem.prazo_entrega);
          const realizadoEntrega = new Date(ordem.chegada_destino);
          const noPrazoEntrega = realizadoEntrega <= prazoEntrega;
          
          const diffMs = realizadoEntrega - prazoEntrega;
          const horasAtraso = Math.round(diffMs / (1000 * 60 * 60));

          if (noPrazoEntrega) {
            return (
              <Badge 
                className="text-[9px] h-4 px-1.5 font-bold"
                style={{
                  backgroundColor: isDark ? 'rgba(34, 197, 94, 0.2)' : '#dcfce7',
                  borderWidth: '1px',
                  borderColor: isDark ? '#22c55e' : '#86efac',
                  color: isDark ? '#4ade80' : '#15803d'
                }}
              >
                ✓ NO PRAZO
              </Badge>
            );
          } else {
            return (
              <div className="flex items-center justify-center gap-1">
                <Badge 
                  className="text-[9px] h-4 px-1.5 font-bold"
                  style={{
                    backgroundColor: isDark ? 'rgba(239, 68, 68, 0.2)' : '#fee2e2',
                    borderWidth: '1px',
                    borderColor: isDark ? '#ef4444' : '#fca5a5',
                    color: isDark ? '#f87171' : '#dc2626'
                  }}
                >
                  +{horasAtraso}h
                </Badge>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-4 w-4 p-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    onExpurgar(ordem, "entrega");
                  }}
                  title="Expurgar entrega"
                >
                  <AlertTriangle className="w-3 h-3 text-orange-600" />
                </Button>
              </div>
            );
          }
        }

        // Se ainda não entregou, mas tem prazo (cronômetro)
        if (ordem.prazo_entrega) {
          const agora = new Date();
          const prazo = new Date(ordem.prazo_entrega);
          const diffMs = prazo - agora;
          const horasRestantes = Math.round(diffMs / (1000 * 60 * 60));
          
          let corCronometro = "#3b82f6"; // Azul padrão
          if (horasRestantes < 0) {
            corCronometro = "#ef4444"; // Vermelho - atrasado
          } else if (horasRestantes <= 6) {
            corCronometro = "#ef4444"; // Vermelho - < 6h
          } else if (horasRestantes <= 24) {
            corCronometro = "#eab308"; // Amarelo - < 24h
          }
          
          return (
            <div className="flex items-center justify-center gap-1.5">
              <div 
                className="w-2 h-2 rounded-full animate-pulse" 
                style={{ backgroundColor: corCronometro }}
                title="Indicador de tempo"
              />
              <span 
                className="text-[9px] font-bold"
                style={{ color: corCronometro }}
              >
                {horasRestantes < 0 ? `+${Math.abs(horasRestantes)}h` : `${horasRestantes}h`}
              </span>
            </div>
          );
        }

        return <span className="text-[9px]" style={{ color: theme.grayText }}>-</span>;

      default:
        return null;
    }
  };

  const getMotorista = (motoristaId) => motoristas.find(m => m.id === motoristaId);
  const getVeiculo = (veiculoId) => veiculos.find(v => v.id === veiculoId);

  const handleSort = (colunaId) => {
    if (sortColumn === colunaId) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(colunaId);
      setSortDirection("asc");
    }
  };

  const ordensOrdenadas = React.useMemo(() => {
    if (!sortColumn) return ordens;

    return [...ordens].sort((a, b) => {
      let valorA, valorB;

      // Obter valores baseados na coluna
      switch (sortColumn) {
        case "motorista":
          valorA = getMotorista(a.motorista_id)?.nome || "";
          valorB = getMotorista(b.motorista_id)?.nome || "";
          break;
        case "cavalo":
          valorA = getVeiculo(a.cavalo_id)?.placa || "";
          valorB = getVeiculo(b.cavalo_id)?.placa || "";
          break;
        case "carreta":
          valorA = getVeiculo(a.implemento1_id)?.placa || "";
          valorB = getVeiculo(b.implemento1_id)?.placa || "";
          break;
        case "carreta2":
          valorA = getVeiculo(a.implemento2_id)?.placa || "";
          valorB = getVeiculo(b.implemento2_id)?.placa || "";
          break;
        case "peso":
          valorA = a.peso || 0;
          valorB = b.peso || 0;
          break;
        case "km_faltam":
          valorA = a.km_faltam || 0;
          valorB = b.km_faltam || 0;
          break;
        case "origem_destino":
          valorA = `${a.origem_cidade || a.origem || ""} ${a.destino_cidade || a.destino || ""}`;
          valorB = `${b.origem_cidade || b.origem || ""} ${b.destino_cidade || b.destino || ""}`;
          break;
        case "destinatario":
          valorA = a.destinatario || a.destino || "";
          valorB = b.destinatario || b.destino || "";
          break;
        case "sla_carregamento":
          // Expurgados vão para o final
          if (a.carregamento_expurgado && !b.carregamento_expurgado) return 1;
          if (!a.carregamento_expurgado && b.carregamento_expurgado) return -1;
          if (a.carregamento_expurgado && b.carregamento_expurgado) return 0;
          
          // Se já carregou, calcular horas de atraso (positivo) ou antecedência (negativo)
          if (a.fim_carregamento && a.carregamento_agendamento_data) {
            const agendadoA = new Date(a.carregamento_agendamento_data);
            const realizadoA = new Date(a.fim_carregamento);
            valorA = (realizadoA - agendadoA) / (1000 * 60 * 60); // horas
          } else if (a.carregamento_agendamento_data) {
            // Se ainda não carregou, calcular horas restantes (negativo = futuro)
            const agora = new Date();
            const agendadoA = new Date(a.carregamento_agendamento_data);
            valorA = (agora - agendadoA) / (1000 * 60 * 60); // horas desde agendamento
          } else {
            valorA = -999999; // Sem dados vai para o início
          }
          
          if (b.fim_carregamento && b.carregamento_agendamento_data) {
            const agendadoB = new Date(b.carregamento_agendamento_data);
            const realizadoB = new Date(b.fim_carregamento);
            valorB = (realizadoB - agendadoB) / (1000 * 60 * 60);
          } else if (b.carregamento_agendamento_data) {
            const agora = new Date();
            const agendadoB = new Date(b.carregamento_agendamento_data);
            valorB = (agora - agendadoB) / (1000 * 60 * 60);
          } else {
            valorB = -999999;
          }
          break;
        case "sla_entrega":
          // Expurgados vão para o final
          if (a.entrega_expurgada && !b.entrega_expurgada) return 1;
          if (!a.entrega_expurgada && b.entrega_expurgada) return -1;
          if (a.entrega_expurgada && b.entrega_expurgada) return 0;
          
          // Se já entregou, calcular horas de atraso (positivo) ou antecedência (negativo)
          if (a.chegada_destino && a.prazo_entrega) {
            const prazoA = new Date(a.prazo_entrega);
            const realizadoA = new Date(a.chegada_destino);
            valorA = (realizadoA - prazoA) / (1000 * 60 * 60); // horas
          } else if (a.prazo_entrega) {
            // Se ainda não entregou, calcular horas restantes (negativo = futuro)
            const agora = new Date();
            const prazoA = new Date(a.prazo_entrega);
            valorA = (agora - prazoA) / (1000 * 60 * 60); // horas desde prazo
          } else {
            valorA = -999999; // Sem dados vai para o início
          }
          
          if (b.chegada_destino && b.prazo_entrega) {
            const prazoB = new Date(b.prazo_entrega);
            const realizadoB = new Date(b.chegada_destino);
            valorB = (realizadoB - prazoB) / (1000 * 60 * 60);
          } else if (b.prazo_entrega) {
            const agora = new Date();
            const prazoB = new Date(b.prazo_entrega);
            valorB = (agora - prazoB) / (1000 * 60 * 60);
          } else {
            valorB = -999999;
          }
          break;
        default:
          valorA = a[sortColumn] || "";
          valorB = b[sortColumn] || "";
      }

      // Comparação
      if (typeof valorA === "number" && typeof valorB === "number") {
        return sortDirection === "asc" ? valorA - valorB : valorB - valorA;
      }

      // Comparação de datas
      if (sortColumn.includes("data") || sortColumn === "prazo_entrega") {
        const dateA = valorA ? new Date(valorA).getTime() : 0;
        const dateB = valorB ? new Date(valorB).getTime() : 0;
        return sortDirection === "asc" ? dateA - dateB : dateB - dateA;
      }

      // Comparação de strings
      const strA = String(valorA).toLowerCase();
      const strB = String(valorB).toLowerCase();
      return sortDirection === "asc" 
        ? strA.localeCompare(strB) 
        : strB.localeCompare(strA);
    });
  }, [ordens, sortColumn, sortDirection, motoristas, veiculos]);

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -400, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 400, behavior: 'smooth' });
    }
  };

  const colunasVisiveis = colunas.filter(col => col.enabled);

  return (
    <>
      <Card className="shadow" style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}>
        <CardHeader 
          className="pb-1.5 pt-2 px-3 border-b" 
          style={{ 
            background: theme.headerBgDark,
            borderBottomColor: theme.border
          }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded flex items-center justify-center" style={{ backgroundColor: theme.primaryBlue }}>
                <TableIcon className="w-4 h-4 text-white" />
              </div>
              <div>
                <CardTitle className="text-sm font-semibold" style={{ color: theme.text }}>
                  Controle de Tracking - Visão Planilha
                </CardTitle>
                <p className="text-[10px] mt-0.5" style={{ color: theme.textMuted }}>
                  ✨ Salvamento automático • {ordens.length} cargas • {selectedRows.size} selecionadas •
                  <span className="font-medium ml-1" style={{ color: theme.primaryBlue }}>
                    Digite "H" para preencher com agora
                  </span>
                </p>
              </div>
            </div>
            <div className="flex gap-1.5">
              <Button
                onClick={async () => {
                  setSaving(true);
                  try {
                    const toISO = (dateStr) => {
                      if (!dateStr) return null;
                      try {
                        if (dateStr.includes('Z') || dateStr.includes('+')) {
                          const date = new Date(dateStr);
                          if (!isNaN(date.getTime())) return date.toISOString();
                        }
                        const date = new Date(dateStr);
                        if (!isNaN(date.getTime())) return date.toISOString();
                        return null;
                      } catch (error) {
                        return null;
                      }
                    };

                    const promises = ordens.map(ordem => {
                      const data = editingData[ordem.id] || {};
                      const dataToSave = {
                        localizacao_atual: data.localizacao_atual ? String(data.localizacao_atual) : null,
                        km_faltam: data.km_faltam ? parseFloat(data.km_faltam) : null,
                        observacao_carga: data.observacao_carga ? String(data.observacao_carga) : null,
                        senha_agendamento: data.senha_agendamento ? String(data.senha_agendamento) : null,
                        carregamento_agendamento_data: toISO(data.carregamento_agendamento_data),
                        entrada_galpao: toISO(data.entrada_galpao),
                        inicio_carregamento: toISO(data.inicio_carregamento),
                        fim_carregamento: toISO(data.fim_carregamento),
                        saida_unidade: toISO(data.saida_unidade),
                        chegada_destino: toISO(data.chegada_destino),
                        descarga_agendamento_data: toISO(data.descarga_agendamento_data),
                        agendamento_checklist_data: toISO(data.agendamento_checklist_data),
                        descarga_realizada_data: toISO(data.descarga_realizada_data),
                        prazo_entrega: toISO(data.prazo_entrega),
                        numero_cte: data.numero_cte ? String(data.numero_cte) : null,
                        mdfe_url: data.mdfe_url ? String(data.mdfe_url) : null,
                        mdfe_baixado: Boolean(data.mdfe_baixado),
                        saldo_pago: Boolean(data.saldo_pago),
                        comprovante_entrega_recebido: Boolean(data.comprovante_entrega_recebido),
                        observacoes_internas: data.observacoes_internas ? String(data.observacoes_internas) : null,
                        notas_fiscais: data.notas_fiscais ? String(data.notas_fiscais) : null,
                        tipo_veiculo: data.tipo_veiculo ? String(data.tipo_veiculo) : null,
                        tipo_carroceria: data.tipo_carroceria ? String(data.tipo_carroceria) : null,
                        produto: data.produto ? String(data.produto) : null,
                        viagem_pedido: data.viagem_pedido ? String(data.viagem_pedido) : null
                      };
                      return base44.entities.OrdemDeCarregamento.update(ordem.id, dataToSave);
                    });

                    await Promise.all(promises);
                    toast.success(`${promises.length} ordens salvas com sucesso!`);
                    onUpdate();
                  } catch (error) {
                    console.error("Erro ao salvar todas:", error);
                    toast.error("Erro ao salvar ordens");
                  } finally {
                    setSaving(false);
                  }
                }}
                disabled={saving}
                size="sm"
                className="h-7 text-xs"
                style={{ backgroundColor: theme.primaryGreen, color: 'white' }}
              >
                {saving ? (
                  <>
                    <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="w-3 h-3 mr-1" />
                    Salvar Tudo
                  </>
                )}
              </Button>
              <Button
                onClick={scrollLeft}
                variant="outline"
                size="sm"
                className="h-7 w-7 p-0"
                style={{
                  borderColor: theme.border,
                  color: theme.textMuted,
                  backgroundColor: 'transparent',
                }}
                title="Rolar para esquerda"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                onClick={scrollRight}
                variant="outline"
                size="sm"
                className="h-7 w-7 p-0"
                style={{
                  borderColor: theme.border,
                  color: theme.textMuted,
                  backgroundColor: 'transparent',
                }}
                title="Rolar para direita"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
              <Button
                onClick={() => setShowColumnConfig(true)}
                variant="outline"
                size="sm"
                className="h-7 text-xs"
                style={{
                  borderColor: theme.border,
                  color: theme.textMuted,
                  backgroundColor: 'transparent',
                }}
              >
                <Settings className="w-3 h-3 mr-1" />
                Colunas
              </Button>
              {selectedRows.size > 0 && (
                <Button
                  onClick={handleSaveSelected}
                  disabled={saving}
                  size="sm"
                  className="h-7 text-xs"
                  style={{ backgroundColor: theme.primaryBlue, color: 'white' }}
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Save className="w-3 h-3 mr-1" />
                      Salvar ({selectedRows.size})
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div
            ref={topScrollRef}
            className="overflow-x-auto"
            style={{
              height: '14px',
              overflowY: 'hidden',
              borderBottom: `1px solid ${theme.border}`,
              backgroundColor: theme.headerBg
            }}
          >
            <div style={{ width: '5000px', height: '1px' }} />
          </div>

          <div 
            ref={scrollContainerRef}
            className="overflow-x-auto"
            style={{
              scrollbarWidth: 'thin',
              scrollbarColor: `${theme.primaryBlue} ${theme.border}`
            }}
          >
            <table className="w-full border-collapse text-[10px]">
              <thead className="sticky top-0 z-10">
                <tr style={{ borderBottom: `1px solid ${theme.border}` }}>
                  <th 
                    className="h-8 px-2 text-center w-8 sticky left-0 z-20" 
                    style={{ 
                      borderRight: `1px solid ${theme.border}`,
                      color: theme.textMuted,
                      backgroundColor: theme.headerBg
                    }}
                  >
                    <Checkbox
                      checked={selectedRows.size === ordens.length && ordens.length > 0}
                      onCheckedChange={toggleAllRows}
                      style={{ borderColor: theme.border }}
                    />
                  </th>
                  {colunasVisiveis.map((coluna) => (
                    <th
                      key={coluna.id}
                      className={`h-8 px-2 text-left font-bold uppercase text-[10px] ${coluna.width} ${
                        coluna.id === 'numero_carga' ? 'sticky left-8 z-20' : ''
                      } cursor-pointer hover:bg-opacity-80 transition-colors`}
                      style={{ 
                        borderRight: `1px solid ${theme.border}`,
                        color: sortColumn === coluna.id ? theme.primaryBlue : theme.textMuted,
                        backgroundColor: theme.headerBg
                      }}
                      onClick={() => handleSort(coluna.id)}
                      title="Clique para ordenar"
                    >
                      <div className="flex items-center gap-1">
                        {coluna.label}
                        {sortColumn === coluna.id && (
                          sortDirection === "asc" ? (
                            <ArrowUp className="w-3 h-3" />
                          ) : (
                            <ArrowDown className="w-3 h-3" />
                          )
                        )}
                      </div>
                    </th>
                  ))}
                  <th 
                    className="h-8 px-2 text-center font-bold uppercase text-[10px] w-20"
                    style={{ color: theme.textMuted, backgroundColor: theme.headerBg }}
                  >
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody>
                {ordensOrdenadas.map((ordem, index) => {
                  const data = editingData[ordem.id] || {};
                  const isSelected = selectedRows.has(ordem.id);
                  const isAutoSaving = autoSavingRows.has(ordem.id);

                  return (
                    <tr
                      key={ordem.id}
                      className="transition-colors"
                      style={{
                        backgroundColor: isSelected
                          ? theme.rowBgSelected
                          : index % 2 === 0
                            ? theme.rowBg
                            : theme.rowBgAlt,
                        borderBottom: `1px solid ${theme.border}`,
                        minHeight: '32px',
                        height: 'auto'
                      }}
                      onMouseEnter={(e) => !isSelected && (e.currentTarget.style.backgroundColor = theme.rowHover)}
                      onMouseLeave={(e) => !isSelected && (e.currentTarget.style.backgroundColor = index % 2 === 0 ? theme.rowBg : theme.rowBgAlt)}
                    >
                      <td className="py-1 px-2 align-middle text-center sticky left-0 z-10" style={{ 
                        borderRight: `1px solid ${theme.border}`,
                        backgroundColor: isSelected ? theme.rowBgSelected : (index % 2 === 0 ? theme.rowBg : theme.rowBgAlt)
                      }}>
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => toggleRowSelection(ordem.id)}
                          style={{ borderColor: theme.border }}
                        />
                      </td>
                      {colunasVisiveis.map((coluna) => (
                       <td
                         key={coluna.id}
                         className={`py-1.5 px-2 ${
                           ["mdfe_baixado", "saldo_pago", "comprovante_entrega_recebido", "status_tracking", "tolerancia", "diaria_carregamento", "diaria_descarga", "modalidade_carga", "sla_carregamento", "sla_entrega"].includes(coluna.id)
                             ? "text-center align-middle"
                             : "align-top"
                         } ${coluna.id === 'numero_carga' ? 'sticky left-8 z-10' : ''}`}
                          style={{ 
                            borderRight: `1px solid ${theme.border}`,
                            backgroundColor: coluna.id === 'numero_carga' 
                              ? (isSelected ? theme.rowBgSelected : (index % 2 === 0 ? theme.rowBg : theme.rowBgAlt))
                              : 'transparent',
                            verticalAlign: coluna.truncate ? 'top' : 'middle',
                            minHeight: '32px',
                            maxHeight: coluna.truncate ? '36px' : 'auto'
                          }}
                        >
                          {renderCell(coluna, ordem, data)}
                        </td>
                      ))}
                      <td className="py-1 px-2 align-middle text-center">
                        <div className="flex items-center justify-center gap-1">
                          {isAutoSaving ? (
                            <div className="flex items-center gap-1" title="Salvando automaticamente...">
                              <Loader2 className="w-3 h-3 animate-spin" style={{ color: theme.primaryGreen }} />
                            </div>
                          ) : (
                            <Button
                              size="sm"
                              onClick={() => handleSave(ordem.id)}
                              disabled={saving}
                              variant="ghost"
                              className="h-6 px-1 text-[10px]"
                              style={{
                                backgroundColor: 'transparent',
                                color: theme.textMuted
                              }}
                              title="Salvar manualmente"
                            >
                              <Save className="w-3 h-3" />
                            </Button>
                          )}
                          <Button
                            size="sm"
                            onClick={() => {
                              setSelectedOrdemForTracking(ordem);
                              setShowTrackingModal(true);
                            }}
                            variant="ghost"
                            className="h-6 px-1 text-[10px]"
                            style={{
                              backgroundColor: 'transparent',
                              color: theme.primaryBlue
                            }}
                            title="Editar Tracking Completo"
                          >
                            <MapPin className="w-3 h-3" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div
            className="p-3 border-t-2"
            style={{
              background: theme.footerBg,
              borderTopColor: isDark ? '#1e293b' : '#bfdbfe'
            }}
          >
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h3 className="font-bold flex items-center gap-1.5 text-xs" style={{ color: theme.text }}>
                  <TableIcon className="w-4 h-4" style={{ color: theme.primaryBlue }} />
                  Informações da Planilha
                </h3>
                <div className="space-y-1.5 text-[10px]">
                  <div
                    className="flex justify-between p-1.5 rounded border"
                    style={{ backgroundColor: theme.rowBg, borderColor: theme.border }}
                  >
                    <span style={{ color: theme.textMuted }}>Total de Ordens:</span>
                    <span className="font-bold" style={{ color: theme.text }}>{ordens.length}</span>
                  </div>
                  <div
                    className="flex justify-between p-1.5 rounded border"
                    style={{ backgroundColor: theme.rowBg, borderColor: theme.border }}
                  >
                    <span style={{ color: theme.textMuted }}>Selecionadas:</span>
                    <span className="font-bold" style={{ color: theme.primaryBlue }}>{selectedRows.size}</span>
                  </div>
                  <div
                    className="flex justify-between p-1.5 rounded border"
                    style={{ backgroundColor: theme.rowBg, borderColor: theme.border }}
                  >
                    <span style={{ color: theme.textMuted }}>Colunas Visíveis:</span>
                    <span className="font-bold" style={{ color: theme.primaryGreen }}>
                      {colunasVisiveis.length}/{colunas.length}
                    </span>
                  </div>
                  {autoSavingRows.size > 0 && (
                    <div
                      className="flex justify-between p-1.5 rounded border"
                      style={{
                        backgroundColor: theme.greenBgLight,
                        borderColor: theme.greenBorderLight
                      }}
                    >
                      <span className="flex items-center gap-1" style={{ color: theme.primaryGreen }}>
                        <Loader2 className="w-3 h-3 animate-spin" />
                        Salvando automaticamente:
                      </span>
                      <span className="font-bold" style={{ color: theme.primaryGreen }}>
                        {autoSavingRows.size}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="font-bold text-xs" style={{ color: theme.text }}>💡 Dicas de Uso</h3>
                <ul
                  className="space-y-1.5 text-[10px] p-2.5 rounded border"
                  style={{
                    color: isDark ? '#cbd5e1' : '#374151',
                    backgroundColor: theme.rowBg,
                    borderColor: theme.border
                  }}
                >
                  <li className="flex items-start gap-1.5">
                    <span className="font-bold" style={{ color: theme.primaryGreen }}>✨</span>
                    <span>
                      <strong>Salvamento automático</strong> - Os dados são salvos 1.5s após você parar de digitar
                    </span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="font-bold" style={{ color: theme.primaryBlue }}>•</span>
                    <span>
                      Digite <kbd
                        className="px-1 py-0.5 rounded text-[9px] font-bold"
                        style={{ backgroundColor: theme.blueBgLight }}
                      >H</kbd> em campos de data para preencher com agora
                    </span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="font-bold" style={{ color: theme.primaryBlue }}>•</span>
                    <span>
                      Clique em <kbd
                        className="px-1 py-0.5 rounded text-[9px]"
                        style={{ backgroundColor: theme.grayBgLight }}
                      >Colunas</kbd> para reorganizar e selecionar colunas
                    </span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="font-bold" style={{ color: theme.primaryBlue }}>•</span>
                    <span>Arraste com o mouse para navegar horizontalmente</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="font-bold" style={{ color: theme.primaryBlue }}>•</span>
                    <span>Coluna "Ordem" fixa ao rolar horizontalmente</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={showColumnConfig} onOpenChange={setShowColumnConfig}>
        <DialogContent
          className="max-w-2xl max-h-[80vh] overflow-y-auto"
          style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}
        >
          <DialogHeader>
            <DialogTitle style={{ color: theme.text }}>Configurar Colunas da Planilha</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div
              className="border rounded-lg p-3"
              style={{
                backgroundColor: isDark ? 'rgba(59, 130, 246, 0.1)' : '#eff6ff',
                borderColor: theme.blueBorderLight
              }}
            >
              <p className="text-sm" style={{ color: isDark ? '#cbd5e1' : '#374151' }}>
                <strong>Dica:</strong> Arraste as colunas para reorganizá-las. Desmarque para ocultar na planilha.
              </p>
            </div>

            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="colunas">
                {(provided) => (
                  <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
                    {colunas.map((coluna, index) => (
                      <Draggable
                        key={coluna.id}
                        draggableId={coluna.id}
                        index={index}
                        isDragDisabled={coluna.fixed}
                      >
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className={`flex items-center gap-3 p-3 border rounded-lg ${
                              snapshot.isDragging ? 'shadow-lg' : ''
                            } ${coluna.fixed ? 'opacity-60' : ''}`}
                            style={{
                              ...provided.draggableProps.style,
                              backgroundColor: theme.rowBg,
                              borderColor: theme.border
                            }}
                          >
                            <div {...provided.dragHandleProps} className={coluna.fixed ? 'cursor-not-allowed' : 'cursor-grab'}>
                              <GripVertical className="w-4 h-4" style={{ color: theme.textMuted }} />
                            </div>

                            <Checkbox
                              checked={coluna.enabled}
                              onCheckedChange={() => toggleColuna(coluna.id)}
                              disabled={coluna.fixed}
                              style={{ borderColor: theme.border }}
                            />

                            <div className="flex-1">
                              <Label className="text-sm font-medium" style={{ color: theme.text }}>
                                {coluna.label}
                              </Label>
                              {coluna.fixed && (
                                <p className="text-xs" style={{ color: theme.textMuted }}>
                                  Coluna fixa (sempre visível e congelada)
                                </p>
                              )}
                            </div>

                            <Badge
                              variant="outline"
                              className="text-xs"
                              style={{
                                backgroundColor: theme.badgeBgDark,
                                borderColor: theme.border,
                                color: theme.textMuted
                              }}
                            >
                              {coluna.width.replace('w-', '')}
                            </Badge>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={resetColunas}
              style={{
                borderColor: theme.border,
                color: theme.textMuted,
                backgroundColor: 'transparent'
              }}
            >
              Restaurar Padrão
            </Button>
            <Button
              onClick={() => setShowColumnConfig(false)}
              style={{ backgroundColor: theme.primaryBlue, color: 'white' }}
            >
              Concluído
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {showTrackingModal && selectedOrdemForTracking && (
        <TrackingUpdateModal
          open={showTrackingModal}
          onClose={() => {
            setShowTrackingModal(false);
            setSelectedOrdemForTracking(null);
          }}
          ordem={selectedOrdemForTracking}
          onUpdate={() => {
            onUpdate();
            setShowTrackingModal(false);
            setSelectedOrdemForTracking(null);
          }}
          onEditOrdemCompleta={() => {}}
          initialTab="datas"
        />
      )}
    </>
  );
}