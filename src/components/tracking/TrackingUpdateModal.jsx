import React, { useState, useEffect, useRef } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { base44 } from "@/api/base44Client";
import { sincronizarOrdemMaeParaFilhas } from "@/functions/sincronizarOrdemMaeParaFilhas";
import { sincronizarStatusNotas } from "@/functions/sincronizarStatusNotas";
import { Save, Loader2, MapPin, Package, Calendar, FileText, Edit, CheckCircle2, Truck, Clock, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import OcorrenciaModal from "./OcorrenciaModal";

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

const quickActionConfig = {
  agendar_carregamento: {
    title: "Agendar Carregamento",
    field: "carregamento_agendamento_data",
    label: "Data e Hora do Carregamento Agendado",
    icon: Calendar,
    status: "carregamento_agendado"
  },
  agendar_descarga: {
    title: "Agendar Descarga",
    field: "descarga_agendamento_data",
    label: "Data e Hora da Descarga Agendada",
    icon: Calendar,
    status: "descarga_agendada"
  },
  iniciar_carregamento: {
    title: "Iniciar Carregamento",
    field: "inicio_carregamento",
    label: "Data e Hora do Início do Carregamento",
    icon: Package,
    status: "em_carregamento"
  },
  finalizar_carregamento: {
    title: "Finalizar Carregamento",
    field: "fim_carregamento",
    label: "Data e Hora do Fim do Carregamento",
    icon: CheckCircle2,
    status: "carregado"
  },
  iniciar_viagem: {
    title: "Iniciar Viagem",
    field: "saida_unidade",
    label: "Data e Hora da Saída da Unidade",
    icon: Truck,
    status: "em_viagem"
  },
  chegou_destino: {
    title: "Chegou no Destino",
    field: "chegada_destino",
    label: "Data e Hora da Chegada no Destino",
    icon: MapPin,
    status: "chegada_destino"
  },
  finalizar: {
    title: "Finalizar",
    field: "descarga_realizada_data",
    label: "Data e Hora da Descarga Realizada",
    icon: CheckCircle2,
    status: "finalizado"
  }
};

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

export default function TrackingUpdateModal({ open, onClose, ordem, onUpdate, onEditOrdemCompleta, initialTab = "status" }) {
  // Converter data ISO para formato BR legível
  const convertISOToLocal = (isoString) => {
    if (!isoString) return "";
    try {
      const date = new Date(isoString);
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

  const [formData, setFormData] = useState({
    status_tracking: ordem?.status_tracking || "aguardando_agendamento",
    carregamento_agendamento_data: convertISOToLocal(ordem?.carregamento_agendamento_data),
    inicio_carregamento: convertISOToLocal(ordem?.inicio_carregamento),
    fim_carregamento: convertISOToLocal(ordem?.fim_carregamento),
    saida_unidade: convertISOToLocal(ordem?.saida_unidade),
    chegada_destino: convertISOToLocal(ordem?.chegada_destino),
    descarga_realizada_data: convertISOToLocal(ordem?.descarga_realizada_data),
    prazo_entrega: convertISOToLocal(ordem?.prazo_entrega),
    asn: ordem?.asn || "",
    numero_cte: ordem?.numero_cte || "",
    senha_agendamento: ordem?.senha_agendamento || "",
    descarga_agendamento_data: convertISOToLocal(ordem?.descarga_agendamento_data),
    localizacao_atual: ordem?.localizacao_atual || "",
    km_faltam: ordem?.km_faltam || ""
  });
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState(initialTab);
  const [quickActionModal, setQuickActionModal] = useState(null);
  const [quickActionDate, setQuickActionDate] = useState("");
  const [savingQuickAction, setSavingQuickAction] = useState(false);
  const [showOcorrenciaModal, setShowOcorrenciaModal] = useState(false);
  const [ocorrencias, setOcorrencias] = useState([]);
  const [loadingOcorrencias, setLoadingOcorrencias] = useState(false);
  const [resolvingOcorrenciaId, setResolvingOcorrenciaId] = useState(null);
  const [resolucaoData, setResolucaoData] = useState({});
  const [calculandoDistancia, setCalculandoDistancia] = useState(false);
  const [sugestoesLocalizacao, setSugestoesLocalizacao] = useState([]);
  const [buscandoSugestoes, setBuscandoSugestoes] = useState(false);
  const [showSugestoes, setShowSugestoes] = useState(false);
  const debounceTimerRef = useRef(null);

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
      setFormData(prev => ({ ...prev, [field]: localDateTime }));
    }
  };

  useEffect(() => {
    if (open && ordem) {
      loadOcorrencias();
    }
  }, [open, ordem?.id]);

  const loadOcorrencias = async () => {
    setLoadingOcorrencias(true);
    try {
      const ocorrenciasData = await base44.entities.Ocorrencia.list();
      const ocorrenciasOrdem = ocorrenciasData.filter(o => o.ordem_id === ordem.id);
      ocorrenciasOrdem.sort((a, b) => new Date(b.data_inicio).getTime() - new Date(a.data_inicio).getTime());
      setOcorrencias(ocorrenciasOrdem);
    } catch (error) {
      console.error("Erro ao carregar ocorrências:", error);
      toast.error("Erro ao carregar ocorrências");
    } finally {
      setLoadingOcorrencias(false);
    }
  };

  // Função para calcular distância entre dois pontos (Haversine)
  const calcularDistancia = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Raio da Terra em km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distancia = R * c;
    return Math.round(distancia);
  };

  // Função para obter coordenadas de um endereço
  const obterCoordenadas = async (endereco) => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(endereco)}&limit=1`,
        {
          signal: controller.signal,
          headers: {
            'User-Agent': 'LogFlow-App/1.0'
          }
        }
      );
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data && data.length > 0) {
        return {
          latitude: parseFloat(data[0].lat),
          longitude: parseFloat(data[0].lon)
        };
      }
      return null;
    } catch (error) {
      if (error.name === 'AbortError') {
        console.error("Timeout ao buscar coordenadas");
      } else {
        console.error("Erro ao obter coordenadas:", error);
      }
      return null;
    }
  };

  // Calcular distância usando Google Distance Matrix API
  const calcularDistanciaParaDestino = async (localizacao) => {
    const enderecoDestino = ordem.destino_endereco || 
                           `${ordem.destino_cidade || ordem.destino}, ${ordem.destino_uf || ''}`;
    
    if (!enderecoDestino || enderecoDestino.trim() === "," || enderecoDestino.trim() === "") {
      toast.info("Não há endereço de destino para calcular a distância.");
      return;
    }

    setCalculandoDistancia(true);
    try {
      console.log('Calculando distância de:', localizacao, 'para:', enderecoDestino);
      
      const response = await base44.functions.invoke('calcularDistancia', {
        origem: localizacao,
        destino: enderecoDestino
      });
      
      console.log('Resposta da API:', response.data);
      
      if (response.data && response.data.error) {
        console.error('Erro da API:', response.data.error);
        toast.error("Não foi possível calcular a distância. Informe os KM manualmente.");
        return;
      }
      
      if (response.data && response.data.distancia_km) {
        const distanciaKm = parseFloat(response.data.distancia_km);
        setFormData(prev => ({ ...prev, km_faltam: distanciaKm }));
        toast.success(`✅ Distância: ${response.data.distancia_texto} (~${response.data.duracao_texto})`);
      }
      
    } catch (error) {
      console.error("Erro ao calcular distância:", error);
      toast.error("Erro ao calcular distância. Informe os KM manualmente.");
    } finally {
      setCalculandoDistancia(false);
    }
  };

  // Buscar sugestões de localização com debounce
  const buscarSugestoesLocalizacao = (query) => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (!query || query.trim().length < 3) {
      setSugestoesLocalizacao([]);
      setShowSugestoes(false);
      setBuscandoSugestoes(false);
      return;
    }

    setBuscandoSugestoes(true);

    debounceTimerRef.current = setTimeout(async () => {
      try {
        console.log('Buscando sugestões para:', query);
        
        const response = await base44.functions.invoke('buscarLocalizacoes', {
          query: query
        });

        console.log('Sugestões recebidas:', response.data);

        if (response.data && response.data.predictions && response.data.predictions.length > 0) {
          setSugestoesLocalizacao(response.data.predictions);
          setShowSugestoes(true);
        } else {
          setSugestoesLocalizacao([]);
          setShowSugestoes(false);
        }
      } catch (error) {
        console.error("Erro ao buscar sugestões:", error);
        setSugestoesLocalizacao([]);
        setShowSugestoes(false);
      } finally {
        setBuscandoSugestoes(false);
      }
    }, 500);
  };

  // Handler para mudança no campo de localização
  const handleLocalizacaoChange = (novaLocalizacao) => {
    setFormData(prev => ({ ...prev, localizacao_atual: novaLocalizacao }));
    buscarSugestoesLocalizacao(novaLocalizacao);
  };

  // Handler para selecionar sugestão
  const handleSelecionarSugestao = (sugestao) => {
    const endereco = sugestao.description;
    setFormData(prev => ({ ...prev, localizacao_atual: endereco }));
    setShowSugestoes(false);
    setSugestoesLocalizacao([]);
    calcularDistanciaParaDestino(endereco);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

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
          
          // Tentar como fallback
          return new Date(localDatetime).toISOString();
        } catch {
          return null;
        }
      };

      // Calcular prazo_entrega automaticamente se não foi preenchido manualmente
      let prazoEntregaCalculado = convertLocalToISO(formData.prazo_entrega);
      
      if (!prazoEntregaCalculado && ordem.operacao_id) {
        try {
          const operacao = await base44.entities.Operacao.get(ordem.operacao_id);
          
          if (operacao.prazo_entrega_usa_agenda_descarga) {
            // Usar agenda de descarga como prazo
            prazoEntregaCalculado = convertLocalToISO(formData.descarga_agendamento_data);
          } else if (operacao.prazo_entrega_dias && formData.carregamento_agendamento_data) {
            // Calcular prazo = carregamento + dias
            const dataCarregamento = new Date(convertLocalToISO(formData.carregamento_agendamento_data));
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
        status_tracking: formData.status_tracking,
        carregamento_agendamento_data: convertLocalToISO(formData.carregamento_agendamento_data),
        inicio_carregamento: convertLocalToISO(formData.inicio_carregamento),
        fim_carregamento: convertLocalToISO(formData.fim_carregamento),
        saida_unidade: convertLocalToISO(formData.saida_unidade),
        chegada_destino: convertLocalToISO(formData.chegada_destino),
        descarga_agendamento_data: convertLocalToISO(formData.descarga_agendamento_data),
        descarga_realizada_data: convertLocalToISO(formData.descarga_realizada_data),
        prazo_entrega: prazoEntregaCalculado,
        asn: formData.asn || null,
        numero_cte: formData.numero_cte || null,
        senha_agendamento: formData.senha_agendamento || null,
        localizacao_atual: formData.localizacao_atual || null,
        km_faltam: formData.km_faltam ? parseFloat(formData.km_faltam) : null
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
          const result = await sincronizarOrdemMaeParaFilhas({ ordemMaeId: ordem.id });
          if (result?.data?.sincronizadas > 0) {
            toast.success(`Tracking atualizado! ${result.data.sincronizadas} ordem(ns) filha(s) sincronizada(s).`);
          } else {
            toast.success("Tracking atualizado com sucesso!");
          }
        } catch (error) {
          console.log("Erro ao sincronizar ordens filhas (ignorando):", error);
          toast.success("Tracking atualizado com sucesso!");
        }
      } else {
        toast.success("Tracking atualizado com sucesso!");
      }
      
      onUpdate();
      onClose();
    } catch (error) {
      console.error("Erro ao atualizar tracking:", error);
      toast.error("Erro ao atualizar tracking");
    } finally {
      setSaving(false);
    }
  };

  const handleQuickActionClick = (action) => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const localDateTime = `${year}-${month}-${day}T${hours}:${minutes}`;
    setQuickActionDate(localDateTime);
    setQuickActionModal(action);
  };

  const handleSaveQuickAction = async () => {
    if (!quickActionModal) return;

    setSavingQuickAction(true);
    try {
      const config = quickActionConfig[quickActionModal];
      const dataToSave = {
        status_tracking: config.status,
        [config.field]: quickActionDate ? new Date(quickActionDate).toISOString() : null
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
      
      toast.success(`${config.title} registrado com sucesso!`);
      setQuickActionModal(null);
      onUpdate();
    } catch (error) {
      console.error("Erro ao salvar ação rápida:", error);
      toast.error("Erro ao salvar");
    } finally {
      setSavingQuickAction(false);
    }
  };

  const handleResolverOcorrencia = async (ocorrenciaId) => {
    try {
      const user = await base44.auth.me();
      const resolucao = resolucaoData[ocorrenciaId] || {};

      if (!resolucao.data_fim) {
        toast.error("Informe a data e hora da resolução");
        return;
      }

      await base44.entities.Ocorrencia.update(ocorrenciaId, {
        status: "resolvida",
        data_fim: resolucao.data_fim,
        observacoes: resolucao.observacoes_resolucao 
          ? `${resolucao.observacoes_original}\n\n--- RESOLUÇÃO ---\n${resolucao.observacoes_resolucao}`
          : resolucao.observacoes_original,
        resolvido_por: user.id
      });

      toast.success("Ocorrência resolvida com sucesso!");
      setResolvingOcorrenciaId(null);
      setResolucaoData({});
      loadOcorrencias();
      onUpdate();
    } catch (error) {
      console.error("Erro ao resolver ocorrência:", error);
      toast.error("Erro ao resolver ocorrência");
    }
  };

  const handleCancelarOcorrencia = async (ocorrenciaId, observacoesOriginal) => {
    try {
      const user = await base44.auth.me();
      const motivo = prompt("Motivo do cancelamento:");
      
      if (!motivo) return;

      await base44.entities.Ocorrencia.update(ocorrenciaId, {
        status: "cancelada",
        observacoes: `${observacoesOriginal}\n\n--- CANCELADA ---\n${motivo}`,
        resolvido_por: user.id
      });

      toast.success("Ocorrência cancelada");
      loadOcorrencias();
      onUpdate();
    } catch (error) {
      console.error("Erro ao cancelar ocorrência:", error);
      toast.error("Erro ao cancelar ocorrência");
    }
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "-";
    try {
      return format(new Date(dateString), "dd/MM/yyyy HH:mm", { locale: ptBR });
    } catch {
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

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-blue-600" />
              Atualizar Tracking - {ordem?.numero_carga || `#${ordem?.id?.slice(-6)}`}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit}>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="status">Status</TabsTrigger>
                <TabsTrigger value="datas">Datas</TabsTrigger>
                <TabsTrigger value="documentos">Documentos</TabsTrigger>
                <TabsTrigger value="localizacao">Localização</TabsTrigger>
                <TabsTrigger value="ocorrencias">
                  Ocorrências
                  {ocorrencias.filter(o => o.status === 'aberta').length > 0 && (
                    <Badge className="ml-2 bg-red-500 text-white text-xs">
                      {ocorrencias.filter(o => o.status === 'aberta').length}
                    </Badge>
                  )}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="status" className="space-y-4 mt-4">
                <div>
                  <Label>Status do Tracking *</Label>
                  <Select
                    value={formData.status_tracking}
                    onValueChange={(value) => setFormData({ ...formData, status_tracking: value })}
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

                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm font-medium text-blue-900 mb-3">
                    Atualização Rápida de Status
                  </p>
                  <p className="text-xs text-blue-700 mb-3">
                    Clique em uma ação para registrar a data e hora do evento.
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuickActionClick("agendar_carregamento")}
                      disabled={saving}
                      className="justify-start"
                    >
                      <Calendar className="w-4 h-4 mr-2" />
                      Agendar Carregamento
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuickActionClick("agendar_descarga")}
                      disabled={saving}
                      className="justify-start"
                    >
                      <Calendar className="w-4 h-4 mr-2" />
                      Agendar Descarga
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuickActionClick("iniciar_carregamento")}
                      disabled={saving}
                      className="justify-start"
                    >
                      <Package className="w-4 h-4 mr-2" />
                      Iniciar Carregamento
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuickActionClick("finalizar_carregamento")}
                      disabled={saving}
                      className="justify-start"
                    >
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Finalizar Carregamento
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuickActionClick("iniciar_viagem")}
                      disabled={saving}
                      className="justify-start"
                    >
                      <Truck className="w-4 h-4 mr-2" />
                      Iniciar Viagem
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuickActionClick("chegou_destino")}
                      disabled={saving}
                      className="justify-start"
                    >
                      <MapPin className="w-4 h-4 mr-2" />
                      Chegou no Destino
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuickActionClick("finalizar")}
                      disabled={saving}
                      className="justify-start"
                    >
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Finalizar
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setShowOcorrenciaModal(true);
                        setActiveTab("ocorrencias"); // Switch to occurrences tab when opening modal
                      }}
                      disabled={saving}
                      className="justify-start col-span-2 border-orange-300 hover:bg-orange-50 text-orange-700"
                    >
                      <AlertTriangle className="w-4 h-4 mr-2" />
                      Registrar Ocorrência
                    </Button>
                  </div>
                </div>

                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-sm font-medium text-green-900 mb-3">
                    Edição Completa da Ordem
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => onEditOrdemCompleta(ordem)}
                    className="w-full justify-start bg-white hover:bg-green-50 border-green-300"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Abrir Editor Completo da Ordem
                  </Button>
                  <p className="text-xs text-green-700 mt-2">
                    Abra o editor completo para alterar motorista, veículos, dados da carga e mais
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="datas" className="space-y-4 mt-4">
                <div className="bg-blue-50 rounded-lg p-3 border border-blue-200 mb-4">
                  <p className="text-xs font-medium text-blue-900">
                    💡 Digite <kbd className="px-1.5 py-0.5 bg-blue-200 rounded text-xs font-bold">H</kbd> em qualquer campo para preencher com a data e hora atual
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Agend. Carregamento
                    </Label>
                    <Input
                      type="text"
                      value={formData.carregamento_agendamento_data}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        carregamento_agendamento_data: e.target.value
                      })}
                      onKeyDown={(e) => handleKeyDown(e, "carregamento_agendamento_data")}
                      placeholder="dd/mm/aaaa hh:mm"
                    />
                  </div>
                  <div>
                    <Label className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Chegada no Carregamento
                    </Label>
                    <Input
                      type="text"
                      value={formData.inicio_carregamento}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        inicio_carregamento: e.target.value
                      })}
                      onKeyDown={(e) => handleKeyDown(e, "inicio_carregamento")}
                      placeholder="dd/mm/aaaa hh:mm"
                    />
                  </div>

                  <div>
                    <Label className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4" />
                      Fim do Carregamento
                    </Label>
                    <Input
                      type="text"
                      value={formData.fim_carregamento}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        fim_carregamento: e.target.value
                      })}
                      onKeyDown={(e) => handleKeyDown(e, "fim_carregamento")}
                      placeholder="dd/mm/aaaa hh:mm"
                    />
                  </div>

                  <div>
                    <Label className="flex items-center gap-2">
                      <Truck className="w-4 h-4" />
                      Saída da Unidade
                    </Label>
                    <Input
                      type="text"
                      value={formData.saida_unidade}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        saida_unidade: e.target.value
                      })}
                      onKeyDown={(e) => handleKeyDown(e, "saida_unidade")}
                      placeholder="dd/mm/aaaa hh:mm"
                    />
                  </div>

                  <div>
                    <Label className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      Chegada no Destino
                    </Label>
                    <Input
                      type="text"
                      value={formData.chegada_destino}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        chegada_destino: e.target.value
                      })}
                      onKeyDown={(e) => handleKeyDown(e, "chegada_destino")}
                      placeholder="dd/mm/aaaa hh:mm"
                    />
                  </div>

                  <div>
                    <Label className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Descarga Agendada
                    </Label>
                    <Input
                      type="text"
                      value={formData.descarga_agendamento_data}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        descarga_agendamento_data: e.target.value
                      })}
                      onKeyDown={(e) => handleKeyDown(e, "descarga_agendamento_data")}
                      placeholder="dd/mm/aaaa hh:mm"
                    />
                  </div>

                  <div>
                    <Label className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4" />
                      Descarga Realizada
                    </Label>
                    <Input
                      type="text"
                      value={formData.descarga_realizada_data}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        descarga_realizada_data: e.target.value
                      })}
                      onKeyDown={(e) => handleKeyDown(e, "descarga_realizada_data")}
                      placeholder="dd/mm/aaaa hh:mm"
                    />
                  </div>
                </div>

                  <div>
                    <Label className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-orange-600" />
                      <span className="font-semibold text-orange-900">Prazo de Entrega (SLA)</span>
                    </Label>
                    <Input
                      type="text"
                      value={formData.prazo_entrega}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        prazo_entrega: e.target.value
                      })}
                      onKeyDown={(e) => handleKeyDown(e, "prazo_entrega")}
                      placeholder="dd/mm/aaaa hh:mm"
                    />
                    <p className="text-xs text-orange-700 mt-1">
                      ⚠️ Calculado automaticamente baseado na operação. Pode ser editado manualmente se necessário.
                    </p>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="documentos" className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>ASN</Label>
                    <Input
                      value={formData.asn}
                      onChange={(e) => setFormData({ ...formData, asn: e.target.value })}
                      placeholder="Número ASN"
                    />
                  </div>

                  <div>
                    <Label>Número CT-e</Label>
                    <Input
                      value={formData.numero_cte}
                      onChange={(e) => setFormData({ ...formData, numero_cte: e.target.value })}
                      placeholder="Número do CT-e"
                    />
                  </div>

                  <div className="col-span-2">
                    <Label>Senha de Agendamento</Label>
                    <Input
                      value={formData.senha_agendamento}
                      onChange={(e) => setFormData({ ...formData, senha_agendamento: e.target.value })}
                      placeholder="Senha/código do agendamento"
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="localizacao" className="space-y-4 mt-4">
                <div className="space-y-4">
                  <div className="relative">
                    <Label htmlFor="localizacao_atual">Localização Atual</Label>
                    <Input
                      id="localizacao_atual"
                      value={formData.localizacao_atual}
                      onChange={(e) => handleLocalizacaoChange(e.target.value)}
                      placeholder="Digite a cidade ou endereço..."
                      autoComplete="off"
                    />
                    {buscandoSugestoes && (
                      <p className="text-xs text-blue-600 mt-1 flex items-center gap-1">
                        <div className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                        Buscando localizações...
                      </p>
                    )}
                    {showSugestoes && sugestoesLocalizacao.length > 0 && (
                      <div className="absolute z-50 w-full mt-1 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-lg shadow-lg max-h-64 overflow-y-auto">
                        {sugestoesLocalizacao.map((sugestao, idx) => (
                          <div
                            key={idx}
                            onClick={() => handleSelecionarSugestao(sugestao)}
                            className="px-3 py-2 hover:bg-blue-50 dark:hover:bg-slate-700 cursor-pointer border-b border-gray-100 dark:border-slate-600 last:border-b-0"
                          >
                            <div className="flex items-start gap-2">
                              <MapPin className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                                  {sugestao.structured_formatting?.main_text || sugestao.description}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                  {sugestao.structured_formatting?.secondary_text || sugestao.description}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    {calculandoDistancia && (
                      <p className="text-xs text-blue-600 mt-1 flex items-center gap-1">
                        <div className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                        Calculando distância...
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="km_faltam">KM Restantes para Destino</Label>
                    <div className="flex gap-2">
                      <Input
                        id="km_faltam"
                        type="number"
                        value={formData.km_faltam}
                        onChange={(e) => setFormData({ ...formData, km_faltam: e.target.value })}
                        placeholder="0"
                        className="flex-1"
                      />
                      {formData.km_faltam && (
                        <Badge variant="outline" className="flex items-center gap-1 px-3">
                          {formData.km_faltam} km
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      💡 A distância é calculada automaticamente quando você preenche a localização atual
                    </p>
                  </div>

                  <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-blue-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-blue-900">Destino da Carga</p>
                        <p className="text-xs text-blue-700 mt-1">
                          {ordem.destino_endereco || `${ordem.destino_cidade || ordem.destino}, ${ordem.destino_uf || ''}`}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="ocorrencias" className="space-y-4 mt-4">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h3 className="text-lg font-semibold">Gestão de Ocorrências</h3>
                    <p className="text-sm text-gray-600">
                      Resolva e acompanhe as ocorrências desta ordem
                    </p>
                  </div>
                  <Button
                    type="button"
                    onClick={() => setShowOcorrenciaModal(true)}
                    className="bg-orange-600 hover:bg-orange-700"
                  >
                    <AlertTriangle className="w-4 h-4 mr-2" />
                    Nova Ocorrência
                  </Button>
                </div>

                {loadingOcorrencias ? (
                  <div className="text-center py-8">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-blue-600" />
                    <p className="text-sm text-gray-600">Carregando ocorrências...</p>
                  </div>
                ) : ocorrencias.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <AlertTriangle className="w-16 h-16 mx-auto mb-4 opacity-20" />
                    <p className="text-lg">Nenhuma ocorrência registrada</p>
                    <p className="text-sm mt-2">Clique em "Nova Ocorrência" para registrar um problema</p>
                  </div>
                ) : (
                  <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                    {ocorrencias.map((ocorrencia) => {
                      const isResolving = resolvingOcorrenciaId === ocorrencia.id;

                      return (
                        <Card key={ocorrencia.id} className={`border-l-4 ${
                          ocorrencia.status === 'aberta' ? 'border-l-red-500' :
                          ocorrencia.status === 'resolvida' ? 'border-l-green-500' :
                          'border-l-gray-400'
                        }`}>
                          <CardHeader className="pb-3">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2 flex-wrap">
                                  <CardTitle className="text-base">
                                    {tiposOcorrenciaLabels[ocorrencia.tipo] || ocorrencia.tipo}
                                  </CardTitle>
                                  <Badge className={statusOcorrenciaColors[ocorrencia.status]}>
                                    {ocorrencia.status === 'aberta' && '🔴 Aberta'}
                                    {ocorrencia.status === 'resolvida' && '✅ Resolvida'}
                                    {ocorrencia.status === 'cancelada' && '❌ Cancelada'}
                                  </Badge>
                                  <Badge variant="outline" className={gravidadeColors[ocorrencia.gravidade]}>
                                    {ocorrencia.gravidade}
                                  </Badge>
                                </div>
                                <div className="space-y-1 text-sm text-gray-600">
                                  <div className="flex items-center gap-2">
                                    <Clock className="w-4 h-4" />
                                    <span>Início: {formatDateTime(ocorrencia.data_inicio)}</span>
                                  </div>
                                  {ocorrencia.data_fim && (
                                    <div className="flex items-center gap-2">
                                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                                      <span>Resolução: {formatDateTime(ocorrencia.data_fim)}</span>
                                      <span className="text-xs text-gray-500">
                                        ({Math.round((new Date(ocorrencia.data_fim).getTime() - new Date(ocorrencia.data_inicio).getTime()) / (1000 * 60 * 60))}h)
                                      </span>
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
                            <div className="bg-gray-50 rounded-lg p-3 border border-gray-200 mb-3">
                              <p className="text-xs font-medium text-gray-600 mb-1">Descrição:</p>
                              <p className="text-sm text-gray-700 whitespace-pre-wrap">{ocorrencia.observacoes}</p>
                            </div>

                            {ocorrencia.status === 'aberta' && (
                              <>
                                {!isResolving ? (
                                  <div className="flex gap-2">
                                    <Button
                                      type="button"
                                      onClick={() => {
                                        setResolvingOcorrenciaId(ocorrencia.id);
                                        const now = new Date();
                                        const year = now.getFullYear();
                                        const month = String(now.getMonth() + 1).padStart(2, '0');
                                        const day = String(now.getDate()).padStart(2, '0');
                                        const hours = String(now.getHours()).padStart(2, '0');
                                        const minutes = String(now.getMinutes()).padStart(2, '0');
                                        const localDateTime = `${year}-${month}-${day}T${hours}:${minutes}`;
                                        setResolucaoData(prev => ({
                                          ...prev,
                                          [ocorrencia.id]: {
                                            data_fim: now.toISOString(),
                                            data_fim_local: localDateTime,
                                            observacoes_original: ocorrencia.observacoes,
                                            observacoes_resolucao: ""
                                          }
                                        }));
                                      }}
                                      className="flex-1 bg-green-600 hover:bg-green-700"
                                    >
                                      <CheckCircle2 className="w-4 h-4 mr-2" />
                                      Resolver Ocorrência
                                    </Button>
                                    <Button
                                      type="button"
                                      variant="outline"
                                      onClick={() => handleCancelarOcorrencia(ocorrencia.id, ocorrencia.observacoes)}
                                      className="text-red-600 border-red-300 hover:bg-red-50"
                                    >
                                      Cancelar
                                    </Button>
                                  </div>
                                ) : (
                                  <div className="space-y-3 p-4 bg-green-50 rounded-lg border border-green-200">
                                    <p className="font-medium text-green-900">Resolução da Ocorrência</p>
                                    
                                    <div>
                                      <Label>Data e Hora da Resolução *</Label>
                                      <Input
                                        type="datetime-local"
                                        value={resolucaoData[ocorrencia.id]?.data_fim_local || ""}
                                        onChange={(e) => setResolucaoData(prev => ({
                                          ...prev,
                                          [ocorrencia.id]: {
                                            ...prev[ocorrencia.id],
                                            data_fim: e.target.value ? new Date(e.target.value).toISOString() : "",
                                            data_fim_local: e.target.value
                                          }
                                        }))}
                                      />
                                    </div>

                                    <div>
                                      <Label>Observações da Resolução</Label>
                                      <Textarea
                                        value={resolucaoData[ocorrencia.id]?.observacoes_resolucao || ""}
                                        onChange={(e) => setResolucaoData(prev => ({
                                          ...prev,
                                          [ocorrencia.id]: {
                                            ...prev[ocorrencia.id],
                                            observacoes_resolucao: e.target.value
                                          }
                                        }))}
                                        placeholder="Descreva como a ocorrência foi resolvida..."
                                        rows={3}
                                      />
                                    </div>

                                    <div className="flex gap-2">
                                      <Button
                                        type="button"
                                        onClick={() => handleResolverOcorrencia(ocorrencia.id)}
                                        className="flex-1 bg-green-600 hover:bg-green-700"
                                      >
                                        <Save className="w-4 h-4 mr-2" />
                                        Confirmar Resolução
                                      </Button>
                                      <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => {
                                          setResolvingOcorrenciaId(null);
                                          setResolucaoData(prev => {
                                            const newResolucaoData = { ...prev };
                                            delete newResolucaoData[ocorrencia.id];
                                            return newResolucaoData;
                                          });
                                        }}
                                      >
                                        Cancelar
                                      </Button>
                                    </div>
                                  </div>
                                )}
                              </>
                            )}
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </TabsContent>
            </Tabs>

            <DialogFooter className="mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={saving}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={saving}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Salvar Alterações
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal de Ação Rápida */}
      {quickActionModal && (
        <Dialog open={!!quickActionModal} onOpenChange={() => setQuickActionModal(null)}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {React.createElement(quickActionConfig[quickActionModal].icon, { className: "w-5 h-5 text-blue-600" })}
                {quickActionConfig[quickActionModal].title}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="quick-action-date">
                  {quickActionConfig[quickActionModal].label}
                </Label>
                <Input
                  id="quick-action-date"
                  type="datetime-local"
                  value={quickActionDate}
                  onChange={(e) => setQuickActionDate(e.target.value)}
                  className="mt-2"
                />
                <p className="text-xs text-gray-500 mt-2">
                  A data e hora atual foram preenchidas automaticamente. Você pode ajustá-las se necessário.
                </p>
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setQuickActionModal(null)}
                disabled={savingQuickAction}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleSaveQuickAction}
                disabled={savingQuickAction || !quickActionDate}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {savingQuickAction ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Salvar
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      <OcorrenciaModal
        open={showOcorrenciaModal}
        onClose={() => setShowOcorrenciaModal(false)}
        ordem={ordem}
        onSuccess={() => {
          loadOcorrencias();
          onUpdate();
        }}
      />
    </>
  );
}