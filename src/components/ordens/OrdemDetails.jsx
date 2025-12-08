import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Package,
  MapPin,
  Calendar,
  FileText,
  Clock,
  CheckCircle,
  AlertCircle,
  Save,
  Printer,
  PlayCircle,
  CheckCircle2,
  XCircle,
  Navigation,
  Plus
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { base44 } from "@/api/base44Client";
import ImpressaoOrdem from "./ImpressaoOrdem";
import ConsultaBuonny from "../risco/ConsultaBuonny";
import CamposEtapaForm from "../etapas/CamposEtapaForm";
import OrdemFilhaForm from "./SubOrdemForm";
import { sincronizarOrdemMaeParaFilhas } from "@/functions/sincronizarOrdemMaeParaFilhas";
import { sincronizarStatusNotas } from "@/functions/sincronizarStatusNotas";

const statusConfig = {
  novo: { label: "Novo", color: "bg-gray-500" },
  pendente_cadastro: { label: "Pendente Cadastro", color: "bg-yellow-500" },
  pendente_rastreamento: { label: "Pendente Rastreamento", color: "bg-orange-500" },
  pendente_expedicao: { label: "Pendente Expedição", color: "bg-blue-500" },
  pendente_financeiro: { label: "Pendente Financeiro", color: "bg-purple-500" },
  aguardando_carregamento: { label: "Aguardando Carregamento", color: "bg-indigo-500" },
  em_transito: { label: "Em Trânsito", color: "bg-green-500" },
  entregue: { label: "Entregue", color: "bg-emerald-500" },
  finalizado: { label: "Finalizado", color: "bg-gray-400" },
  cancelado: { label: "Cancelado", color: "bg-red-500" }
};

const statusTrackingOptions = [
  { value: "aguardando_agendamento", label: "Aguardando Agendamento" },
  { value: "carregamento_agendado", label: "Carregamento Agendado" },
  { value: "em_carregamento", label: "Em Carregamento" },
  { value: "carregado", label: "Carregado" },
  { value: "em_viagem", label: "Em Viagem" },
  { value: "chegada_destino", label: "Chegada no Destino" },
  { value: "descarga_agendada", label: "Descarga Agendada" },
  { value: "em_descarga", label: "Em Descarga" },
  { value: "descarga_realizada", label: "Descarga Realizada" },
  { value: "finalizado", label: "Finalizado" }
];

const tiposOcorrenciaLabels = {
  pneu_furado: "Pneu Furado",
  problema_mecanico: "Problema Mecânico",
  acidente: "Acidente",
  atraso_origem: "Atraso na Origem",
  atraso_destino: "Atraso no Destino",
  documentacao_incorreta: "Documentação Incorreta/Faltante",
  avaria_carga: "Avaria na Carga",
  problema_rastreador: "Problema com Rastreador",
  falta_combustivel: "Falta de Combustível",
  condicoes_climaticas: "Condições Climáticas Adversas",
  bloqueio_estrada: "Bloqueio de Estrada",
  fiscalizacao: "Fiscalização/Abordagem",
  recusa_carga: "Recusa de Carga",
  problema_motorista: "Problema com Motorista",
  roubo_tentativa: "Roubo/Tentativa de Roubo",
  outro: "Outro"
};

const gravidadeColors = {
  baixa: "bg-blue-100 text-blue-700 border-blue-300",
  media: "bg-yellow-100 text-yellow-700 border-yellow-300",
  alta: "bg-orange-100 text-orange-700 border-orange-300",
  critica: "bg-red-100 text-red-700 border-red-300"
};

const statusOcorrenciaColors = {
  aberta: "bg-red-100 text-red-700",
  resolvida: "bg-green-100 text-green-700",
  cancelada: "bg-gray-100 text-gray-700"
};

export default function OrdemDetails({
  open,
  onClose,
  ordem,
  motoristas,
  veiculos,
  onUpdate,
  initialTab = "geral",
  focusedEtapaId = null
}) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [etapas, setEtapas] = useState([]);
  const [ordensEtapas, setOrdensEtapas] = useState([]);
  const [editingEtapa, setEditingEtapa] = useState(null);
  const [formData, setFormData] = useState({});
  const [saving, setSaving] = useState(false);
  const [showImpressao, setShowImpressao] = useState(false);
  const [user, setUser] = useState(null);
  const [empresa, setEmpresa] = useState(null);
  const [loadingEtapas, setLoadingEtapas] = useState(true);
  const [savingEtapaId, setSavingEtapaId] = useState(null);
  const [trackingData, setTrackingData] = useState({});
  const [savingTracking, setSavingTracking] = useState(false);
  const [ocorrencias, setOcorrencias] = useState([]);
  const [loadingOcorrencias, setLoadingOcorrencias] = useState(false);
  const [showOrdemFilhaForm, setShowOrdemFilhaForm] = useState(false);
  const [subOrdens, setSubOrdens] = useState([]);

  const handleKeyDown = (e, field) => {
    if (e.key === 'h' || e.key === 'H') {
      e.preventDefault();
      const now = new Date();
      const day = String(now.getDate()).padStart(2, '0');
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const year = now.getFullYear();
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const localDateTime = `${day}/${month}/${year} ${hours}:${minutes}`;
      setTrackingData(prev => ({ ...prev, [field]: localDateTime }));
    }
  };

  const handleKeyDownDate = (e, field) => {
    if (e.key === 'h' || e.key === 'H') {
      e.preventDefault();
      const now = new Date();
      const day = String(now.getDate()).padStart(2, '0');
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const year = now.getFullYear();
      const localDate = `${day}/${month}/${year}`;
      setTrackingData(prev => ({ ...prev, [field]: localDate }));
    }
  };

  React.useEffect(() => {
    const loadUserAndCompany = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);

        if (currentUser.empresa_id) {
          const empresaData = await base44.entities.Empresa.get(currentUser.empresa_id);
          setEmpresa(empresaData);
        }
      } catch (error) {
        console.error("Erro ao carregar usuário e empresa:", error);
      }
    };
    loadUserAndCompany();
  }, []);

  // Converter data ISO para formato BR legível
  const convertISOToLocal = (isoString) => {
    if (!isoString) return "";
    try {
      // Se já estiver no formato dd/mm/aaaa hh:mm, retornar como está
      if (/^\d{2}\/\d{2}\/\d{4}\s+\d{2}:\d{2}$/.test(isoString)) {
        return isoString;
      }
      
      let date;
      
      // Tentar parsear string sem separadores (ex: "21112025")
      if (/^\d{8}$/.test(isoString)) {
        const day = isoString.substring(0, 2);
        const month = isoString.substring(2, 4);
        const year = isoString.substring(4, 8);
        date = new Date(year, month - 1, day);
      } else {
        date = new Date(isoString);
      }
      
      // Verificar se a data é válida
      if (isNaN(date.getTime())) return "";
      
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      return `${day}/${month}/${year} ${hours}:${minutes}`;
    } catch {
      return "";
    }
  };

  const convertISOToLocalDate = (isoString) => {
    if (!isoString) return "";
    try {
      // Se já estiver no formato dd/mm/aaaa, retornar como está
      if (/^\d{2}\/\d{2}\/\d{4}$/.test(isoString)) {
        return isoString;
      }
      
      let date;
      
      // Tentar parsear string sem separadores (ex: "21112025")
      if (/^\d{8}$/.test(isoString)) {
        const day = isoString.substring(0, 2);
        const month = isoString.substring(2, 4);
        const year = isoString.substring(4, 8);
        date = new Date(year, month - 1, day);
      } else {
        date = new Date(isoString);
      }
      
      // Verificar se a data é válida
      if (isNaN(date.getTime())) return "";
      
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    } catch {
      return "";
    }
  };

  const reloadOrdemData = async () => {
    try {
      const ordemAtualizada = await base44.entities.OrdemDeCarregamento.get(ordem.id);
      
      // Atualizar dados de tracking com valores atualizados
      setTrackingData({
        status_tracking: ordemAtualizada.status_tracking || "aguardando_agendamento",
        carregamento_agendamento_data: convertISOToLocal(ordemAtualizada.carregamento_agendamento_data),
        inicio_carregamento: convertISOToLocal(ordemAtualizada.inicio_carregamento),
        fim_carregamento: convertISOToLocal(ordemAtualizada.fim_carregamento),
        saida_unidade: convertISOToLocal(ordemAtualizada.saida_unidade),
        chegada_destino: convertISOToLocal(ordemAtualizada.chegada_destino),
        descarga_realizada_data: convertISOToLocal(ordemAtualizada.descarga_realizada_data),
        descarga_agendamento_data: convertISOToLocal(ordemAtualizada.descarga_agendamento_data),
        agendamento_checklist_data: convertISOToLocal(ordemAtualizada.agendamento_checklist_data),
        prazo_entrega: convertISOToLocal(ordemAtualizada.prazo_entrega),
        asn: ordemAtualizada.asn || "",
        numero_cte: ordemAtualizada.numero_cte || "",
        senha_agendamento: ordemAtualizada.senha_agendamento || "",
        infolog: ordemAtualizada.infolog || "",
        localizacao_atual: ordemAtualizada.localizacao_atual || "",
        km_faltam: ordemAtualizada.km_faltam || ""
      });
    } catch (error) {
      console.error("Erro ao recarregar ordem:", error);
    }
  };

  React.useEffect(() => {
    if (open && ordem) {
      loadEtapasData();
      loadOcorrencias();
      loadSubOrdens();
      setActiveTab(initialTab);
      
      // Inicializar dados de tracking
      setTrackingData({
        status_tracking: ordem.status_tracking || "aguardando_agendamento",
        carregamento_agendamento_data: convertISOToLocal(ordem.carregamento_agendamento_data),
        inicio_carregamento: convertISOToLocal(ordem.inicio_carregamento),
        fim_carregamento: convertISOToLocal(ordem.fim_carregamento),
        saida_unidade: convertISOToLocal(ordem.saida_unidade),
        chegada_destino: convertISOToLocal(ordem.chegada_destino),
        descarga_realizada_data: convertISOToLocal(ordem.descarga_realizada_data),
        descarga_agendamento_data: convertISOToLocal(ordem.descarga_agendamento_data),
        agendamento_checklist_data: convertISOToLocal(ordem.agendamento_checklist_data),
        prazo_entrega: convertISOToLocal(ordem.prazo_entrega),
        asn: ordem.asn || "",
        numero_cte: ordem.numero_cte || "",
        senha_agendamento: ordem.senha_agendamento || "",
        infolog: ordem.infolog || "",
        localizacao_atual: ordem.localizacao_atual || "",
        km_faltam: ordem.km_faltam || ""
      });
    }
  }, [open, ordem?.id, initialTab]);

  // Separate effect to handle focused etapa after data is loaded
  React.useEffect(() => {
    if (focusedEtapaId && etapas.length > 0 && !loadingEtapas) {
      const ordemEtapa = ordensEtapas.find(oe => oe.etapa_id === focusedEtapaId);
      const etapa = etapas.find(e => e.id === focusedEtapaId);

      if (etapa) {
        setActiveTab("workflow"); // Ensure workflow tab is active
        handleEtapaEdit(etapa, ordemEtapa);
      }
    }
  }, [focusedEtapaId, loadingEtapas, etapas, ordensEtapas, setActiveTab]); // Added setActiveTab to dependencies as it's used inside

  const loadEtapasData = async () => {
    setLoadingEtapas(true);
    try {
      const [etapasData, ordensEtapasData] = await Promise.all([
        base44.entities.Etapa.list("ordem"),
        base44.entities.OrdemEtapa.list()
      ]);

      setEtapas(etapasData.filter(e => e.ativo));
      setOrdensEtapas(ordensEtapasData.filter(oe => oe.ordem_id === ordem.id));
    } catch (error) {
      console.error("Erro ao carregar etapas:", error);
    } finally {
      setLoadingEtapas(false);
    }
  };

  const loadOcorrencias = async () => {
    setLoadingOcorrencias(true);
    try {
      const ocorrenciasData = await base44.entities.Ocorrencia.list();
      const ocorrenciasOrdem = ocorrenciasData.filter(o => o.ordem_id === ordem.id);
      // Ordenar por data de início (mais recente primeiro)
      ocorrenciasOrdem.sort((a, b) => new Date(b.data_inicio) - new Date(a.data_inicio));
      setOcorrencias(ocorrenciasOrdem);
    } catch (error) {
      console.error("Erro ao carregar ocorrências:", error);
    } finally {
      setLoadingOcorrencias(false);
    }
  };

  const loadSubOrdens = async () => {
    try {
      const todasOrdens = await base44.entities.OrdemDeCarregamento.list();
      const ordensFilhasData = todasOrdens.filter(o => o.ordem_mae_id === ordem.id);
      setSubOrdens(ordensFilhasData);
    } catch (error) {
      console.error("Erro ao carregar ordens filhas:", error);
    }
  };

  const motorista = motoristas.find(m => m.id === ordem.motorista_id);
  const veiculo = veiculos.find(v => v.id === ordem.veiculo_id);
  const statusInfo = statusConfig[ordem.status] || statusConfig.novo;

  const getOrdemEtapa = (etapaId) => {
    return ordensEtapas.find(oe => oe.etapa_id === etapaId);
  };

  const getStatusIcon = (status) => {
    const icons = {
      pendente: Clock,
      em_andamento: PlayCircle,
      concluida: CheckCircle2,
      bloqueada: XCircle,
      cancelada: XCircle
    };
    return icons[status] || Clock;
  };

  const getStatusColor = (status) => {
    const colors = {
      pendente: "text-gray-400",
      em_andamento: "text-blue-500",
      concluida: "text-green-500",
      bloqueada: "text-red-500",
      cancelada: "text-gray-500"
    };
    return colors[status] || "text-gray-400";
  };

  const getStatusBadgeColor = (status) => {
    const colors = {
      pendente: "bg-gray-100 text-gray-600",
      em_andamento: "bg-blue-100 text-blue-700",
      concluida: "bg-green-100 text-green-700",
      bloqueada: "bg-red-100 text-red-700",
      cancelada: "bg-gray-100 text-gray-500"
    };
    return colors[status] || "bg-gray-100 text-gray-600";
  };

  const handleEtapaEdit = (etapa, ordemEtapa) => {
    setEditingEtapa(etapa.id);
    setFormData({
      status: ordemEtapa?.status || "pendente",
      observacoes: ordemEtapa?.observacoes || ""
    });
  };

  const handleStatusChange = async (etapaId, newStatus) => {
    setSavingEtapaId(etapaId);
    try {
      const ordemEtapa = getOrdemEtapa(etapaId);

      const dataToSave = {
        ordem_id: ordem.id,
        etapa_id: etapaId,
        status: newStatus,
        observacoes: formData.observacoes || ordemEtapa?.observacoes || "",
        data_inicio: ordemEtapa?.data_inicio || (newStatus === "em_andamento" ? new Date().toISOString() : null),
        data_conclusao: newStatus === "concluida" ? new Date().toISOString() : null,
        responsavel_id: user?.id
      };

      if (ordemEtapa) {
        await base44.entities.OrdemEtapa.update(ordemEtapa.id, dataToSave);
      } else {
        await base44.entities.OrdemEtapa.create(dataToSave);
      }

      await loadEtapasData();
      onUpdate();
      
      // Sincronizar com ordens filhas (se houver)
      if (ordem.tipo_ordem !== "ordem_filha") {
        try {
          await sincronizarOrdemMaeParaFilhas({ ordemMaeId: ordem.id });
        } catch (error) {
          console.log("Erro ao sincronizar ordens filhas (ignorando):", error);
        }
      }
    } catch (error) {
      console.error("Erro ao salvar status da etapa:", error);
    } finally {
      setSavingEtapaId(null);
    }
  };

  const handleEtapaSave = async (etapaId) => {
    setSaving(true);
    try {
      const ordemEtapa = getOrdemEtapa(etapaId);

      const dataToSave = {
        ordem_id: ordem.id,
        etapa_id: etapaId,
        status: formData.status,
        observacoes: formData.observacoes,
        data_inicio: ordemEtapa?.data_inicio || (formData.status === "em_andamento" ? new Date().toISOString() : null),
        data_conclusao: formData.status === "concluida" ? new Date().toISOString() : null,
        responsavel_id: user?.id
      };

      if (ordemEtapa) {
        await base44.entities.OrdemEtapa.update(ordemEtapa.id, dataToSave);
      } else {
        await base44.entities.OrdemEtapa.create(dataToSave);
      }

      setEditingEtapa(null);
      await loadEtapasData();
      onUpdate();
    } catch (error) {
      console.error("Erro ao salvar etapa:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleIniciarEtapa = async (etapaId) => {
    setSavingEtapaId(etapaId);
    try {
      const ordemEtapa = getOrdemEtapa(etapaId);

      const dataToSave = {
        ordem_id: ordem.id,
        etapa_id: etapaId,
        status: "em_andamento",
        data_inicio: new Date().toISOString(),
        responsavel_id: user?.id
      };

      if (ordemEtapa) {
        await base44.entities.OrdemEtapa.update(ordemEtapa.id, dataToSave);
      } else {
        await base44.entities.OrdemEtapa.create(dataToSave);
      }

      await loadEtapasData();
      onUpdate();
    } catch (error) {
      console.error("Erro ao iniciar etapa:", error);
    } finally {
      setSavingEtapaId(null);
    }
  };

  const handleConcluirEtapa = async (etapaId) => {
    setSavingEtapaId(etapaId);
    try {
      const ordemEtapa = getOrdemEtapa(etapaId);

      if (ordemEtapa) {
        await base44.entities.OrdemEtapa.update(ordemEtapa.id, {
          status: "concluida",
          data_conclusao: new Date().toISOString()
        });
      } else {
        await base44.entities.OrdemEtapa.create({
          ordem_id: ordem.id,
          etapa_id: etapaId,
          status: "concluida",
          data_inicio: new Date().toISOString(),
          data_conclusao: new Date().toISOString(),
          responsavel_id: user?.id
        });
      }

      await loadEtapasData();
      onUpdate();
    } catch (error) {
      console.error("Erro ao concluir etapa:", error);
    } finally {
      setSavingEtapaId(null);
    }
  };

  const handleSaveTracking = async () => {
    setSavingTracking(true);
    try {
      // Converter datas do formato BR para ISO antes de salvar
      const convertLocalToISO = (localDatetime) => {
        if (!localDatetime) return null;
        try {
          // Formato esperado: dd/mm/aaaa hh:mm
          const regex = /(\d{2})\/(\d{2})\/(\d{4})\s+(\d{2}):(\d{2})/;
          const match = localDatetime.match(regex);
          
          if (match) {
            const [, day, month, year, hours, minutes] = match;
            const date = new Date(year, month - 1, day, hours, minutes);
            return date.toISOString();
          }
          
          // Se já for ISO, retornar como está
          if (localDatetime.includes('T') || localDatetime.includes('Z')) {
            return localDatetime;
          }
          
          return new Date(localDatetime).toISOString();
        } catch {
          return null;
        }
      };

      const convertLocalDateToISO = (localDate) => {
        if (!localDate) return null;
        try {
          // Formato esperado: dd/mm/aaaa
          const regex = /(\d{2})\/(\d{2})\/(\d{4})/;
          const match = localDate.match(regex);
          
          if (match) {
            const [, day, month, year] = match;
            const date = new Date(year, month - 1, day);
            return date.toISOString();
          }
          
          // Se já for ISO, retornar como está
          if (localDate.includes('T') || localDate.includes('Z')) {
            return localDate;
          }
          
          return new Date(localDate).toISOString();
        } catch {
          return null;
        }
      };

      // Calcular prazo_entrega automaticamente se não foi preenchido manualmente
      let prazoEntregaCalculado = convertLocalToISO(trackingData.prazo_entrega);
      
      if (!prazoEntregaCalculado && ordem.operacao_id) {
        try {
          const operacao = await base44.entities.Operacao.get(ordem.operacao_id);
          
          if (operacao.prazo_entrega_usa_agenda_descarga) {
            // Usar agenda de descarga como prazo
            prazoEntregaCalculado = convertLocalToISO(trackingData.descarga_agendamento_data);
          } else if (operacao.prazo_entrega_dias && trackingData.carregamento_agendamento_data) {
            // Calcular prazo = carregamento + dias
            const dataCarregamento = new Date(convertLocalToISO(trackingData.carregamento_agendamento_data));
            let prazo = new Date(dataCarregamento);
            
            if (operacao.prazo_entrega_dias_uteis) {
              // Adicionar dias úteis (pular sábados e domingos)
              let diasAdicionados = 0;
              while (diasAdicionados < operacao.prazo_entrega_dias) {
                prazo.setDate(prazo.getDate() + 1);
                const diaSemana = prazo.getDay();
                // 0 = domingo, 6 = sábado
                if (diaSemana !== 0 && diaSemana !== 6) {
                  diasAdicionados++;
                }
              }
            } else {
              // Adicionar dias corridos
              prazo.setDate(prazo.getDate() + operacao.prazo_entrega_dias);
            }
            
            prazoEntregaCalculado = prazo.toISOString();
          }
        } catch (error) {
          console.log("Erro ao calcular prazo de entrega:", error);
        }
      }

      const dataToSave = {
        status_tracking: trackingData.status_tracking,
        carregamento_agendamento_data: convertLocalToISO(trackingData.carregamento_agendamento_data),
        inicio_carregamento: convertLocalToISO(trackingData.inicio_carregamento),
        fim_carregamento: convertLocalToISO(trackingData.fim_carregamento),
        saida_unidade: convertLocalToISO(trackingData.saida_unidade),
        chegada_destino: convertLocalToISO(trackingData.chegada_destino),
        descarga_agendamento_data: convertLocalToISO(trackingData.descarga_agendamento_data),
        descarga_realizada_data: convertLocalToISO(trackingData.descarga_realizada_data),
        agendamento_checklist_data: convertLocalToISO(trackingData.agendamento_checklist_data),
        prazo_entrega: prazoEntregaCalculado,
        asn: trackingData.asn || null,
        numero_cte: trackingData.numero_cte || null,
        senha_agendamento: trackingData.senha_agendamento || null,
        infolog: trackingData.infolog || null,
        localizacao_atual: trackingData.localizacao_atual || null,
        km_faltam: trackingData.km_faltam ? parseFloat(trackingData.km_faltam) : null
      };

      await base44.entities.OrdemDeCarregamento.update(ordem.id, dataToSave);
      
      // Sincronizar status das notas fiscais
      try {
        await sincronizarStatusNotas({ ordemId: ordem.id });
      } catch (error) {
        console.log("Erro ao sincronizar status das notas (ignorando):", error);
      }
      
      // Sincronizar com ordens filhas (se houver)
      if (ordem.tipo_ordem !== "ordem_filha") {
        try {
          await sincronizarOrdemMaeParaFilhas({ ordemMaeId: ordem.id });
        } catch (error) {
          console.log("Erro ao sincronizar ordens filhas (ignorando):", error);
        }
      }
      
      onUpdate();
    } catch (error) {
      console.error("Erro ao salvar tracking:", error);
    } finally {
      setSavingTracking(false);
    }
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "-";
    try {
      return format(new Date(dateString), "dd/MM/yyyy HH:mm", { locale: ptBR });
    } catch (error) {
      return "-";
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    try {
      return format(new Date(dateString), "dd/MM/yyyy", { locale: ptBR });
    } catch (error) {
      return "-";
    }
  };

  const formatDateTimeForInput = (dateString) => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      return date.toISOString().slice(0, 16);
    } catch {
      return "";
    }
  };

  const formatDateForInput = (dateString) => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      return date.toISOString().slice(0, 10);
    } catch {
      return "";
    }
  };

  const getTimelineEvents = () => {
    const events = [];

    // Eventos tradicionais da ordem
    if (ordem.entrada_galpao) {
      events.push({
        tipo: 'ordem',
        titulo: 'Entrada no Galpão',
        data: ordem.entrada_galpao,
        cor: 'bg-blue-500'
      });
    }

    if (ordem.inicio_carregamento) {
      events.push({
        tipo: 'ordem',
        titulo: 'Início do Carregamento',
        data: ordem.inicio_carregamento,
        cor: 'bg-green-500'
      });
    }

    if (ordem.fim_carregamento) {
      events.push({
        tipo: 'ordem',
        titulo: 'Fim do Carregamento',
        data: ordem.fim_carregamento,
        cor: 'bg-green-600'
      });
    }

    if (ordem.saida_unidade) {
      events.push({
        tipo: 'ordem',
        titulo: 'Saída da Unidade',
        data: ordem.saida_unidade,
        cor: 'bg-yellow-500'
      });
    }

    if (ordem.chegada_destino) {
      events.push({
        tipo: 'ordem',
        titulo: 'Chegada ao Destino',
        data: ordem.chegada_destino,
        cor: 'bg-purple-500'
      });
    }

    if (ordem.fim_descarregamento) {
      events.push({
        tipo: 'ordem',
        titulo: 'Fim do Descarregamento',
        data: ordem.fim_descarregamento,
        cor: 'bg-red-500'
      });
    }

    // Eventos das etapas do workflow
    ordensEtapas.forEach(ordemEtapa => {
      const etapa = etapas.find(e => e.id === ordemEtapa.etapa_id);
      if (!etapa) return;

      // Evento de início da etapa
      if (ordemEtapa.data_inicio) {
        events.push({
          tipo: 'etapa',
          titulo: `${etapa.nome} - Iniciada`,
          data: ordemEtapa.data_inicio,
          cor: etapa.cor || 'bg-gray-500',
          descricao: ordemEtapa.observacoes || null,
          status: 'inicio'
        });
      }

      // Evento de conclusão da etapa
      if (ordemEtapa.data_conclusao) {
        events.push({
          tipo: 'etapa',
          titulo: `${etapa.nome} - Concluída`,
          data: ordemEtapa.data_conclusao,
          cor: 'bg-green-600',
          descricao: ordemEtapa.observacoes || null,
          status: 'conclusao'
        });
      }

      // Evento de bloqueio
      if (ordemEtapa.status === 'bloqueada' && ordemEtapa.data_inicio) {
        events.push({
          tipo: 'etapa',
          titulo: `${etapa.nome} - Bloqueada`,
          data: ordemEtapa.data_inicio,
          cor: 'bg-red-600',
          descricao: ordemEtapa.observacoes || 'Etapa bloqueada',
          status: 'bloqueada'
        });
      }
    });

    // Eventos de Ocorrências
    ocorrencias.forEach(ocorrencia => {
      if (ocorrencia.data_inicio) {
        events.push({
          tipo: 'ocorrencia',
          titulo: `Ocorrência: ${tiposOcorrenciaLabels[ocorrencia.tipo] || ocorrencia.tipo}`,
          data: ocorrencia.data_inicio,
          cor: 'bg-orange-500', // Default color for occurrences
          descricao: ocorrencia.observacoes || null,
          status: ocorrencia.status,
          gravidade: ocorrencia.gravidade
        });
      }
      if (ocorrencia.data_fim) {
        events.push({
          tipo: 'ocorrencia',
          titulo: `Ocorrência Resolvida: ${tiposOcorrenciaLabels[ocorrencia.tipo] || ocorrencia.tipo}`,
          data: ocorrencia.data_fim,
          cor: 'bg-green-500', // Color for resolved occurrences
          descricao: ocorrencia.observacoes || null,
          status: ocorrencia.status,
          gravidade: ocorrencia.gravidade
        });
      }
    });

    // Ordenar por data (mais recente primeiro)
    return events.sort((a, b) => new Date(b.data) - new Date(a.data));
  };


  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                {ordem.numero_carga || `Ordem #${ordem.id.slice(-6)}`}
              </DialogTitle>
              <div className="flex items-center gap-2">
                {ordem.tipo_ordem !== "ordem_filha" && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowOrdemFilhaForm(true)}
                    className="flex items-center gap-2 bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Criar Ordem Filha
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowImpressao(true)}
                  className="flex items-center gap-2"
                >
                  <Printer className="w-4 h-4 mr-2" />
                  Imprimir
                </Button>
                <Badge className={`${statusInfo.color} text-white`}>
                  {statusInfo.label}
                </Badge>
              </div>
            </div>
          </DialogHeader>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-8">
              <TabsTrigger value="geral">Geral</TabsTrigger>
              <TabsTrigger value="tracking">Tracking</TabsTrigger>
              <TabsTrigger value="workflow">Workflow</TabsTrigger>
              <TabsTrigger value="ocorrencias">Ocorrências</TabsTrigger>
              {ordem.tipo_ordem !== "ordem_filha" && (
                <TabsTrigger value="subordens">
                  Sub-Ordens
                  {subOrdens.length > 0 && (
                    <Badge className="ml-2 bg-purple-600 text-white text-xs">
                      {subOrdens.length}
                    </Badge>
                  )}
                </TabsTrigger>
              )}
              <TabsTrigger value="risco">Risco</TabsTrigger>
              <TabsTrigger value="timeline">Timeline</TabsTrigger>
              <TabsTrigger value="documentos">Documentos</TabsTrigger>
            </TabsList>

            <TabsContent value="geral" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Package className="w-5 h-5" />
                      Informações da Carga
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Cliente:</span>
                      <span className="font-medium">{ordem.cliente}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Produto:</span>
                      <span className="font-medium">{ordem.produto}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Peso:</span>
                      <span className="font-medium">{ordem.peso?.toLocaleString()} kg</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Valor Total:</span>
                      <span className="font-medium">R$ {ordem.valor_total_frete?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <MapPin className="w-5 h-5" />
                      Rota e Recursos
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Origem:</span>
                      <span className="font-medium">{ordem.origem}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Destino:</span>
                      <span className="font-medium">{ordem.destino}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Motorista:</span>
                      <span className="font-medium">{motorista?.nome || "-"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Veículo:</span>
                      <span className="font-medium">{veiculo?.placa || "-"}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {ordem.observacao_carga && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Observações</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700">{ordem.observacao_carga}</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="tracking" className="space-y-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Navigation className="w-5 h-5 text-blue-600" />
                    Tracking Logístico
                  </CardTitle>
                  <Button
                    onClick={handleSaveTracking}
                    disabled={savingTracking}
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {savingTracking ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        Salvando...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Salvar Tracking
                      </>
                    )}
                  </Button>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Status do Tracking */}
                  <div>
                    <Label className="text-base font-semibold mb-4 block">Status do Tracking</Label>
                    <Select
                      value={trackingData.status_tracking}
                      onValueChange={(value) => setTrackingData({ ...trackingData, status_tracking: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {statusTrackingOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Datas de Carregamento e Transporte */}
                  <div>
                    <Label className="text-base font-semibold mb-4 block">📦 Datas de Carregamento e Transporte</Label>
                    <div className="bg-blue-50 rounded-lg p-3 border border-blue-200 mb-4">
                      <p className="text-xs font-medium text-blue-900">
                        💡 Digite <kbd className="px-1.5 py-0.5 bg-blue-200 rounded text-xs font-bold">H</kbd> em qualquer campo para preencher com a data e hora atual
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="carregamento_agendamento_data">Carregamento Agendado</Label>
                        <Input
                          id="carregamento_agendamento_data"
                          type="text"
                          value={trackingData.carregamento_agendamento_data}
                          onChange={(e) => {
                            let value = e.target.value;
                            // Aplicar máscara dd/mm/aaaa hh:mm
                            value = value.replace(/\D/g, '');
                            if (value.length >= 2) value = value.substring(0, 2) + '/' + value.substring(2);
                            if (value.length >= 5) value = value.substring(0, 5) + '/' + value.substring(5);
                            if (value.length >= 10) value = value.substring(0, 10) + ' ' + value.substring(10);
                            if (value.length >= 13) value = value.substring(0, 13) + ':' + value.substring(13, 15);
                            setTrackingData({ ...trackingData, carregamento_agendamento_data: value });
                          }}
                          onKeyDown={(e) => handleKeyDown(e, "carregamento_agendamento_data")}
                          placeholder="dd/mm/aaaa hh:mm"
                          maxLength={16}
                        />
                      </div>
                      <div>
                        <Label htmlFor="inicio_carregamento">Chegada no Carregamento</Label>
                        <Input
                          id="inicio_carregamento"
                          type="text"
                          value={trackingData.inicio_carregamento}
                          onChange={(e) => {
                            let value = e.target.value;
                            value = value.replace(/\D/g, '');
                            if (value.length >= 2) value = value.substring(0, 2) + '/' + value.substring(2);
                            if (value.length >= 5) value = value.substring(0, 5) + '/' + value.substring(5);
                            if (value.length >= 10) value = value.substring(0, 10) + ' ' + value.substring(10);
                            if (value.length >= 13) value = value.substring(0, 13) + ':' + value.substring(13, 15);
                            setTrackingData({ ...trackingData, inicio_carregamento: value });
                          }}
                          onKeyDown={(e) => handleKeyDown(e, "inicio_carregamento")}
                          placeholder="dd/mm/aaaa hh:mm"
                          maxLength={16}
                        />
                      </div>
                      <div>
                        <Label htmlFor="fim_carregamento">Fim do Carregamento</Label>
                        <Input
                          id="fim_carregamento"
                          type="text"
                          value={trackingData.fim_carregamento}
                          onChange={(e) => {
                            let value = e.target.value;
                            value = value.replace(/\D/g, '');
                            if (value.length >= 2) value = value.substring(0, 2) + '/' + value.substring(2);
                            if (value.length >= 5) value = value.substring(0, 5) + '/' + value.substring(5);
                            if (value.length >= 10) value = value.substring(0, 10) + ' ' + value.substring(10);
                            if (value.length >= 13) value = value.substring(0, 13) + ':' + value.substring(13, 15);
                            setTrackingData({ ...trackingData, fim_carregamento: value });
                          }}
                          onKeyDown={(e) => handleKeyDown(e, "fim_carregamento")}
                          placeholder="dd/mm/aaaa hh:mm"
                          maxLength={16}
                        />
                      </div>
                      <div>
                        <Label htmlFor="saida_unidade">Saída da Unidade</Label>
                        <Input
                          id="saida_unidade"
                          type="text"
                          value={trackingData.saida_unidade}
                          onChange={(e) => {
                            let value = e.target.value;
                            value = value.replace(/\D/g, '');
                            if (value.length >= 2) value = value.substring(0, 2) + '/' + value.substring(2);
                            if (value.length >= 5) value = value.substring(0, 5) + '/' + value.substring(5);
                            if (value.length >= 10) value = value.substring(0, 10) + ' ' + value.substring(10);
                            if (value.length >= 13) value = value.substring(0, 13) + ':' + value.substring(13, 15);
                            setTrackingData({ ...trackingData, saida_unidade: value });
                          }}
                          onKeyDown={(e) => handleKeyDown(e, "saida_unidade")}
                          placeholder="dd/mm/aaaa hh:mm"
                          maxLength={16}
                        />
                      </div>
                      <div>
                        <Label htmlFor="chegada_destino">Chegada no Destino</Label>
                        <Input
                          id="chegada_destino"
                          type="text"
                          value={trackingData.chegada_destino}
                          onChange={(e) => {
                            let value = e.target.value;
                            value = value.replace(/\D/g, '');
                            if (value.length >= 2) value = value.substring(0, 2) + '/' + value.substring(2);
                            if (value.length >= 5) value = value.substring(0, 5) + '/' + value.substring(5);
                            if (value.length >= 10) value = value.substring(0, 10) + ' ' + value.substring(10);
                            if (value.length >= 13) value = value.substring(0, 13) + ':' + value.substring(13, 15);
                            setTrackingData({ ...trackingData, chegada_destino: value });
                          }}
                          onKeyDown={(e) => handleKeyDown(e, "chegada_destino")}
                          placeholder="dd/mm/aaaa hh:mm"
                          maxLength={16}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Agendamento e Descarga */}
                  <div>
                    <Label className="text-base font-semibold mb-4 block">📅 Agendamento e Descarga</Label>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="descarga_agendamento_data">Descarga Agendada (Data/Hora)</Label>
                        <Input
                          id="descarga_agendamento_data"
                          type="text"
                          value={trackingData.descarga_agendamento_data}
                          onChange={(e) => {
                            let value = e.target.value;
                            value = value.replace(/\D/g, '');
                            if (value.length >= 2) value = value.substring(0, 2) + '/' + value.substring(2);
                            if (value.length >= 5) value = value.substring(0, 5) + '/' + value.substring(5);
                            if (value.length >= 10) value = value.substring(0, 10) + ' ' + value.substring(10);
                            if (value.length >= 13) value = value.substring(0, 13) + ':' + value.substring(13, 15);
                            setTrackingData({ ...trackingData, descarga_agendamento_data: value });
                          }}
                          onKeyDown={(e) => handleKeyDown(e, "descarga_agendamento_data")}
                          placeholder="dd/mm/aaaa hh:mm"
                          maxLength={16}
                        />
                      </div>
                      <div>
                        <Label htmlFor="senha_agendamento">Senha de Agendamento</Label>
                        <Input
                          id="senha_agendamento"
                          value={trackingData.senha_agendamento}
                          onChange={(e) => setTrackingData({ ...trackingData, senha_agendamento: e.target.value })}
                          placeholder="Senha/código do agendamento"
                        />
                      </div>
                      <div>
                        <Label htmlFor="agendamento_checklist_data">Checklist de Agendamento</Label>
                        <Input
                          id="agendamento_checklist_data"
                          type="text"
                          value={trackingData.agendamento_checklist_data}
                          onChange={(e) => {
                            let value = e.target.value;
                            value = value.replace(/\D/g, '');
                            if (value.length >= 2) value = value.substring(0, 2) + '/' + value.substring(2);
                            if (value.length >= 5) value = value.substring(0, 5) + '/' + value.substring(5);
                            if (value.length >= 10) value = value.substring(0, 10) + ' ' + value.substring(10);
                            if (value.length >= 13) value = value.substring(0, 13) + ':' + value.substring(13, 15);
                            setTrackingData({ ...trackingData, agendamento_checklist_data: value });
                          }}
                          onKeyDown={(e) => handleKeyDown(e, "agendamento_checklist_data")}
                          placeholder="dd/mm/aaaa hh:mm"
                          maxLength={16}
                        />
                      </div>
                      <div className="col-span-2">
                        <Label htmlFor="descarga_realizada_data">Descarga Realizada (Data/Hora)</Label>
                        <Input
                          id="descarga_realizada_data"
                          type="text"
                          value={trackingData.descarga_realizada_data}
                          onChange={(e) => {
                            let value = e.target.value;
                            value = value.replace(/\D/g, '');
                            if (value.length >= 2) value = value.substring(0, 2) + '/' + value.substring(2);
                            if (value.length >= 5) value = value.substring(0, 5) + '/' + value.substring(5);
                            if (value.length >= 10) value = value.substring(0, 10) + ' ' + value.substring(10);
                            if (value.length >= 13) value = value.substring(0, 13) + ':' + value.substring(13, 15);
                            setTrackingData({ ...trackingData, descarga_realizada_data: value });
                          }}
                          onKeyDown={(e) => handleKeyDown(e, "descarga_realizada_data")}
                          placeholder="dd/mm/aaaa hh:mm"
                          maxLength={16}
                        />
                      </div>
                      <div className="col-span-2">
                        <Label htmlFor="prazo_entrega" className="flex items-center gap-2 text-orange-700 font-semibold">
                          <Calendar className="w-4 h-4" />
                          Prazo de Entrega (SLA)
                        </Label>
                        <Input
                          id="prazo_entrega"
                          type="text"
                          value={trackingData.prazo_entrega}
                          onChange={(e) => {
                            let value = e.target.value;
                            value = value.replace(/\D/g, '');
                            if (value.length >= 2) value = value.substring(0, 2) + '/' + value.substring(2);
                            if (value.length >= 5) value = value.substring(0, 5) + '/' + value.substring(5);
                            if (value.length >= 10) value = value.substring(0, 10) + ' ' + value.substring(10);
                            if (value.length >= 13) value = value.substring(0, 13) + ':' + value.substring(13, 15);
                            setTrackingData({ ...trackingData, prazo_entrega: value });
                          }}
                          onKeyDown={(e) => handleKeyDown(e, "prazo_entrega")}
                          placeholder="dd/mm/aaaa hh:mm"
                          maxLength={16}
                          className="border-orange-300 focus:ring-orange-500"
                        />
                        <p className="text-xs text-orange-600 mt-1">
                          ⚠️ Calculado automaticamente. Edite se necessário ajustar.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Documentação */}
                  <div>
                    <Label className="text-base font-semibold mb-4 block">📄 Documentação</Label>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="asn">ASN</Label>
                        <Input
                          id="asn"
                          value={trackingData.asn}
                          onChange={(e) => setTrackingData({ ...trackingData, asn: e.target.value })}
                          placeholder="Número ASN"
                        />
                      </div>
                      <div>
                        <Label htmlFor="numero_cte">Número CT-e</Label>
                        <Input
                          id="numero_cte"
                          value={trackingData.numero_cte}
                          onChange={(e) => setTrackingData({ ...trackingData, numero_cte: e.target.value })}
                          placeholder="Número do CT-e"
                        />
                      </div>
                      <div>
                        <Label htmlFor="infolog">Infolog</Label>
                        <Input
                          id="infolog"
                          value={trackingData.infolog}
                          onChange={(e) => setTrackingData({ ...trackingData, infolog: e.target.value })}
                          placeholder="Código Infolog"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Localização */}
                  <div>
                    <Label className="text-base font-semibold mb-4 block">📍 Localização Atual</Label>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="localizacao_atual">Localização</Label>
                        <Input
                          id="localizacao_atual"
                          value={trackingData.localizacao_atual}
                          onChange={(e) => setTrackingData({ ...trackingData, localizacao_atual: e.target.value })}
                          placeholder="Ex: Rodovia BR-116, KM 350"
                        />
                      </div>
                      <div>
                        <Label htmlFor="km_faltam">KM Restantes para Destino</Label>
                        <Input
                          id="km_faltam"
                          type="number"
                          value={trackingData.km_faltam}
                          onChange={(e) => setTrackingData({ ...trackingData, km_faltam: e.target.value })}
                          placeholder="0"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <Button
                      onClick={handleSaveTracking}
                      disabled={savingTracking}
                      className="w-full bg-blue-600 hover:bg-blue-700"
                    >
                      {savingTracking ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                          Salvando Alterações...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          Salvar Todas as Alterações
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="workflow" className="space-y-4">
              {loadingEtapas ? (
                <div className="text-center py-12">
                  <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                  <p className="text-gray-600">Carregando etapas...</p>
                </div>
              ) : etapas.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <AlertCircle className="w-12 h-12 mx-auto mb-4 opacity-20" />
                  <p>Nenhuma etapa configurada</p>
                  <p className="text-sm mt-2">Configure as etapas em Fluxo → Configurar Etapas</p>
                </div>
              ) : (
                etapas.map((etapa) => {
                  const ordemEtapa = getOrdemEtapa(etapa.id);
                  const status = ordemEtapa?.status || "pendente";
                  const StatusIcon = getStatusIcon(status);
                  const isEditing = editingEtapa === etapa.id;
                  const isSavingThis = savingEtapaId === etapa.id;

                  return (
                    <Card key={etapa.id} className="border-l-4" style={{ borderLeftColor: etapa.cor }}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div
                              className="w-10 h-10 rounded-lg flex items-center justify-center"
                              style={{ backgroundColor: `${etapa.cor}20` }}
                            >
                              {isSavingThis ? (
                                <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                              ) : (
                                <StatusIcon className={`w-5 h-5 ${getStatusColor(status)}`} />
                              )}
                            </div>
                            <div>
                              <CardTitle className="text-lg flex items-center gap-2">
                                {etapa.nome}
                                <Badge className={getStatusBadgeColor(status)}>
                                  {status === "pendente" && "Pendente"}
                                  {status === "em_andamento" && "Em Andamento"}
                                  {status === "concluida" && "Concluída"}
                                  {status === "bloqueada" && "Bloqueada"}
                                  {status === "cancelada" && "Cancelada"}
                                </Badge>
                              </CardTitle>
                              {etapa.descricao && (
                                <p className="text-sm text-gray-600 mt-1">{etapa.descricao}</p>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {status === "pendente" && (
                              <Button
                                size="sm"
                                onClick={() => handleIniciarEtapa(etapa.id)}
                                disabled={saving || isSavingThis}
                                className="bg-blue-600 hover:bg-blue-700"
                              >
                                <PlayCircle className="w-4 h-4 mr-2" />
                                Iniciar
                              </Button>
                            )}

                            {status === "em_andamento" && (
                              <>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleEtapaEdit(etapa, ordemEtapa)}
                                  disabled={isEditing || isSavingThis}
                                >
                                  Editar
                                </Button>
                                <Button
                                  size="sm"
                                  onClick={() => handleConcluirEtapa(etapa.id)}
                                  disabled={saving || isSavingThis}
                                  className="bg-green-600 hover:bg-green-700"
                                >
                                  <CheckCircle2 className="w-4 h-4 mr-2" />
                                  Concluir
                                </Button>
                              </>
                            )}

                            {status === "concluida" && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleEtapaEdit(etapa, ordemEtapa)}
                                disabled={isEditing || isSavingThis}
                              >
                                Ver Detalhes
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardHeader>

                      {(isEditing || (ordemEtapa && status !== "pendente")) && (
                        <CardContent>
                          {isEditing ? (
                            <div className="space-y-4">
                              <div>
                                <Label>Status</Label>
                                <Select
                                  value={formData.status}
                                  onValueChange={(value) => {
                                    setFormData({...formData, status: value});
                                    handleStatusChange(etapa.id, value);
                                  }}
                                  disabled={isSavingThis}
                                >
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="pendente">Pendente</SelectItem>
                                    <SelectItem value="em_andamento">Em Andamento</SelectItem>
                                    <SelectItem value="concluida">Concluída</SelectItem>
                                    <SelectItem value="bloqueada">Bloqueada</SelectItem>
                                    <SelectItem value="cancelada">Cancelada</SelectItem>
                                  </SelectContent>
                                </Select>
                                {isSavingThis && (
                                  <p className="text-xs text-blue-600 mt-1 flex items-center gap-1">
                                    <div className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                                    Salvando automaticamente...
                                  </p>
                                )}
                              </div>

                              <div>
                                <Label>Observações</Label>
                                <Textarea
                                  value={formData.observacoes}
                                  onChange={(e) => setFormData({...formData, observacoes: e.target.value})}
                                  placeholder="Adicione observações sobre esta etapa..."
                                  rows={3}
                                  disabled={isSavingThis}
                                />
                              </div>

                              <div className="flex gap-2 justify-end">
                                <Button
                                  variant="outline"
                                  onClick={() => setEditingEtapa(null)}
                                  disabled={isSavingThis}
                                >
                                  Cancelar
                                </Button>
                                <Button
                                  onClick={() => handleEtapaSave(etapa.id)}
                                  disabled={saving || isSavingThis}
                                  className="bg-blue-600 hover:bg-blue-700"
                                >
                                  <Save className="w-4 h-4 mr-2" />
                                  {saving ? "Salvando..." : "Salvar Observações"}
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-4 text-sm">
                              {/* Campos Customizados - Sempre visíveis */}
                              <div>
                                <CamposEtapaForm
                                  etapaId={etapa.id}
                                  ordemEtapaId={ordemEtapa?.id}
                                  ordemId={ordem.id}
                                  onValidationChange={() => {}}
                                  onValuesChange={() => {}}
                                  onTrackingUpdate={async () => {
                                    await reloadOrdemData();
                                    onUpdate();
                                  }}
                                />
                              </div>

                              {/* Datas */}
                              {ordemEtapa?.data_inicio && (
                                <div className="flex items-center gap-2 text-gray-600 pt-3 border-t">
                                  <Clock className="w-4 h-4" />
                                  <span>Iniciada em:</span>
                                  <span className="font-medium">{formatDateTime(ordemEtapa.data_inicio)}</span>
                                </div>
                              )}

                              {ordemEtapa?.data_conclusao && (
                                <div className="flex items-center gap-2 text-gray-600">
                                  <CheckCircle className="w-4 h-4 text-green-600" />
                                  <span>Concluída em:</span>
                                  <span className="font-medium">{formatDateTime(ordemEtapa.data_conclusao)}</span>
                                </div>
                              )}

                              {ordemEtapa?.observacoes && (
                                <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                                  <p className="text-xs font-medium text-gray-600 mb-1">Observações:</p>
                                  <p className="text-gray-700">{ordemEtapa.observacoes}</p>
                                </div>
                              )}
                            </div>
                          )}
                        </CardContent>
                      )}
                    </Card>
                  );
                })
              )}
            </TabsContent>

            <TabsContent value="ocorrencias" className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <AlertCircle className="w-5 h-5 text-orange-600" />
                      Ocorrências Registradas
                    </CardTitle>
                    <Badge variant="outline" className="text-base px-3 py-1">
                      {ocorrencias.length} {ocorrencias.length === 1 ? "ocorrência" : "ocorrências"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  {loadingOcorrencias ? (
                    <div className="text-center py-8">
                      <div className="w-6 h-6 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                      <p className="text-sm text-gray-600">Carregando ocorrências...</p>
                    </div>
                  ) : ocorrencias.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                      <AlertCircle className="w-12 h-12 mx-auto mb-4 opacity-20" />
                      <p>Nenhuma ocorrência registrada</p>
                      <p className="text-sm mt-2">As ocorrências aparecerão aqui quando forem registradas</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {ocorrencias.map((ocorrencia) => (
                        <Card key={ocorrencia.id} className="border-l-4 border-l-orange-500">
                          <CardHeader>
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <CardTitle className="text-base">
                                    {tiposOcorrenciaLabels[ocorrencia.tipo] || ocorrencia.tipo}
                                  </CardTitle>
                                  <Badge className={statusOcorrenciaColors[ocorrencia.status]}>
                                    {ocorrencia.status === 'aberta' && 'Aberta'}
                                    {ocorrencia.status === 'resolvida' && 'Resolvida'}
                                    {ocorrencia.status === 'cancelada' && 'Cancelada'}
                                  </Badge>
                                  <Badge variant="outline" className={gravidadeColors[ocorrencia.gravidade]}>
                                    Gravidade: {ocorrencia.gravidade}
                                  </Badge>
                                </div>
                                <div className="space-y-1 text-sm text-gray-600">
                                  <div className="flex items-center gap-2">
                                    <Clock className="w-4 h-4" />
                                    <span>Início: {formatDateTime(ocorrencia.data_inicio)}</span>
                                  </div>
                                  {ocorrencia.data_fim && (
                                    <div className="flex items-center gap-2">
                                      <CheckCircle className="w-4 h-4 text-green-600" />
                                      <span>Fim: {formatDateTime(ocorrencia.data_fim)}</span>
                                    </div>
                                  )}
                                  {ocorrencia.localizacao && (
                                    <div className="flex items-center gap-2">
                                      <MapPin className="w-4 h-4" />
                                      <span>{ocorrencia.localizacao}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                              <p className="text-xs font-medium text-gray-600 mb-1">Observações:</p>
                              <p className="text-sm text-gray-700 whitespace-pre-wrap">{ocorrencia.observacoes}</p>
                            </div>
                            {ocorrencia.data_fim && (
                              <div className="mt-3 text-xs text-gray-500">
                                Tempo de resolução: {
                                  Math.round(
                                    (new Date(ocorrencia.data_fim) - new Date(ocorrencia.data_inicio)) / (1000 * 60 * 60)
                                  )
                                } horas
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {ordem.tipo_ordem !== "ordem_filha" && (
              <TabsContent value="subordens" className="space-y-4">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <FileText className="w-5 h-5 text-purple-600" />
                        Ordens Filhas Vinculadas
                      </CardTitle>
                      <Button
                        size="sm"
                        onClick={() => setShowOrdemFilhaForm(true)}
                        className="bg-purple-600 hover:bg-purple-700"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Criar Ordem Filha
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {subOrdens.length === 0 ? (
                      <div className="text-center py-12 text-gray-500">
                        <FileText className="w-12 h-12 mx-auto mb-4 opacity-20" />
                        <p>Nenhuma ordem filha criada</p>
                        <p className="text-sm mt-2">Crie ordens filhas para gerenciar variações desta ordem</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {subOrdens.map((subOrdem) => (
                          <div key={subOrdem.id} className="p-4 border border-purple-200 rounded-lg bg-purple-50/50">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <h4 className="font-semibold text-purple-900">
                                    {subOrdem.numero_carga || `Ordem Filha #${subOrdem.id.slice(-6)}`}
                                  </h4>
                                  <Badge className="bg-purple-600 text-white text-xs">
                                    Ordem Filha
                                  </Badge>
                                </div>
                                <div className="grid grid-cols-2 gap-3 text-sm">
                                  <div>
                                    <span className="text-gray-600">Remetente:</span>
                                    <p className="font-medium">{subOrdem.cliente}</p>
                                  </div>
                                  <div>
                                    <span className="text-gray-600">Destinatário:</span>
                                    <p className="font-medium">{subOrdem.destinatario || subOrdem.destino}</p>
                                  </div>
                                  <div>
                                    <span className="text-gray-600">Produto:</span>
                                    <p className="font-medium">{subOrdem.produto}</p>
                                  </div>
                                  <div>
                                    <span className="text-gray-600">Peso:</span>
                                    <p className="font-medium">{subOrdem.peso?.toLocaleString()} kg</p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            )}

            <TabsContent value="risco" className="space-y-4">
              <ConsultaBuonny 
                ordem={ordem}
                motorista={motorista}
                veiculo={veiculos.find(v => v.id === ordem.cavalo_id)}
              />
            </TabsContent>

            <TabsContent value="timeline" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    Timeline de Eventos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {loadingEtapas || loadingOcorrencias ? (
                    <div className="text-center py-8">
                      <div className="w-6 h-6 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                      <p className="text-sm text-gray-600">Carregando eventos...</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {getTimelineEvents().length === 0 ? (
                        <div className="text-center py-12 text-gray-500">
                          <Clock className="w-12 h-12 mx-auto mb-4 opacity-20" />
                          <p>Nenhum evento registrado ainda</p>
                          <p className="text-sm mt-2">Os eventos aparecerão aqui conforme as etapas e ocorrências forem registradas</p>
                        </div>
                      ) : (
                        getTimelineEvents().map((evento, index) => (
                          <div key={index} className="flex gap-4 relative">
                            {index !== getTimelineEvents().length - 1 && (
                              <div className="absolute left-[9px] top-8 bottom-0 w-0.5 bg-gray-200" />
                            )}
                            <div className={`w-5 h-5 rounded-full ${evento.cor} flex-shrink-0 mt-0.5 relative z-10 ring-4 ring-white`} />
                            <div className="flex-1 pb-6">
                              <div className="flex items-start justify-between gap-2">
                                <div>
                                  <p className="font-semibold text-gray-900">{evento.titulo}</p>
                                  <p className="text-sm text-gray-600 mt-1">
                                    {formatDateTime(evento.data)}
                                  </p>
                                </div>
                                <Badge
                                  variant="outline"
                                  className={`${evento.tipo === 'etapa' ? 'bg-blue-50 border-blue-200 text-blue-700' :
                                                evento.tipo === 'ocorrencia' ? 'bg-orange-50 border-orange-200 text-orange-700' :
                                                'bg-gray-50 border-gray-200 text-gray-700'}`}
                                >
                                  {evento.tipo === 'etapa' ? 'Workflow' :
                                   evento.tipo === 'ocorrencia' ? 'Ocorrência' :
                                   'Operação'}
                                </Badge>
                              </div>
                              {evento.descricao && (
                                <div className="mt-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                                  <p className="text-sm text-gray-700">{evento.descricao}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="documentos" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Documentos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>MDF-e</Label>
                        <div className="p-3 border rounded-lg">
                          {ordem.mdfe_url ? (
                            <a href={ordem.mdfe_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">
                              Ver MDF-e
                            </a>
                          ) : (
                            <span className="text-gray-500">Não anexado</span>
                          )}
                        </div>
                      </div>

                      <div>
                        <Label>Comprovante de Adiantamento</Label>
                        <div className="p-3 border rounded-lg">
                          {ordem.comprovante_adiantamento_url ? (
                            <a href={ordem.comprovante_adiantamento_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">
                              Ver Comprovante
                            </a>
                          ) : (
                            <span className="text-gray-500">Não anexado</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div>
                      <Label>Comprovante de Entrega</Label>
                      <div className="p-3 border rounded-lg">
                        {ordem.comprovante_entrega_url ? (
                          <a href={ordem.comprovante_entrega_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">
                            Ver Comprovante de Entrega
                          </a>
                        ) : (
                            <span className="text-gray-500">Não anexado</span>
                          )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {showImpressao && (
        <ImpressaoOrdem
          open={showImpressao}
          onClose={() => setShowImpressao(false)}
          ordem={ordem}
          motorista={motorista}
          veiculo={veiculo}
          user={user}
          empresa={empresa}
        />
      )}

      {showOrdemFilhaForm && (
        <OrdemFilhaForm
          open={showOrdemFilhaForm}
          onClose={() => setShowOrdemFilhaForm(false)}
          ordemMae={ordem}
          onSuccess={async () => {
            setShowOrdemFilhaForm(false);
            await loadSubOrdens();
            onUpdate();
          }}
          motoristas={motoristas}
          veiculos={veiculos}
        />
      )}
    </>
  );
}