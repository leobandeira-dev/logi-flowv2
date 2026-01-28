import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Search,
  Filter,
  Plus,
  RefreshCw,
  Clock,
  CheckCircle2,
  XCircle,
  User,
  Package,
  AlertCircle,
  MapPin,
  Shield,
  Ticket,
  FileText,
  Copy,
  Trash2,
  MoreVertical,
  DollarSign
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { format, differenceInHours } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";
import TipoOcorrenciaForm from "../components/ocorrencias/TipoOcorrenciaForm";
import OcorrenciaDetalhes from "../components/ocorrencias/OcorrenciaDetalhes";
import FilterModal from "../components/ocorrencias/FilterModal";
import OcorrenciaAvulsaForm from "../components/ocorrencias/OcorrenciaAvulsaForm";
import FiltrosPredefinidos from "../components/filtros/FiltrosPredefinidos";
import PaginacaoControles from "../components/filtros/PaginacaoControles";
import GestaoDiariasModal from "../components/ocorrencias/GestaoDiariasModal";
import FiltroDataOcorrencias from "../components/filtros/FiltroDataOcorrencias";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

const gravidadeColors = {
  baixa: "bg-blue-100 text-blue-800 border-blue-300",
  media: "bg-yellow-100 text-yellow-800 border-yellow-300",
  alta: "bg-orange-100 text-orange-800 border-orange-300",
  critica: "bg-red-100 text-red-800 border-red-300"
};

const statusColors = {
  aberta: "bg-red-600 text-white",
  em_andamento: "bg-blue-600 text-white",
  resolvida: "bg-green-600 text-white",
  cancelada: "bg-gray-600 text-white"
};

const categoriaColors = {
  tracking: "bg-blue-600 text-white",
  fluxo: "bg-purple-600 text-white",
  tarefa: "bg-teal-600 text-white",
  diaria: "bg-green-600 text-white",
  nota_fiscal: "bg-violet-600 text-white"
};

// Função para gerar número de ticket - ATUALIZADA COM SEGUNDOS
const generateTicketNumber = () => {
  const now = new Date();
  const year = now.getFullYear().toString().slice(-2);
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  const day = now.getDate().toString().padStart(2, '0');
  const hour = now.getHours().toString().padStart(2, '0');
  const minute = now.getMinutes().toString().padStart(2, '0');
  const second = now.getSeconds().toString().padStart(2, '0');
  
  return `${year}${month}${day}${hour}${minute}${second}`;
};

// Função para calcular data de prazo
const calcularPrazo = (tipoOcorrencia) => {
  if (!tipoOcorrencia) return null;
  
  let prazoMinutos = null;
  if (tipoOcorrencia.prazo_sla_minutos !== undefined && tipoOcorrencia.prazo_sla_minutos !== null) {
    prazoMinutos = tipoOcorrencia.prazo_sla_minutos;
  } else if (tipoOcorrencia.prazo_sla_horas !== undefined && tipoOcorrencia.prazo_sla_horas !== null) {
    prazoMinutos = tipoOcorrencia.prazo_sla_horas * 60;
  }

  if (prazoMinutos === null || prazoMinutos === 0) return null;

  const dataInicio = new Date();
  const dataPrazo = new Date(dataInicio.getTime() + prazoMinutos * 60000);
  
  return dataPrazo;
};

// Função para formatar data e hora brasileira
const formatarDataHoraBR = (data) => {
  if (!data) return '';
  const opcoes = {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'America/Sao_Paulo'
  };
  return new Intl.DateTimeFormat('pt-BR', opcoes).format(data);
};

export default function OcorrenciasGestao() {
  const [ocorrencias, setOcorrencias] = useState([]);
  const [tiposOcorrencia, setTiposOcorrencia] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [departamentos, setDepartamentos] = useState([]);
  const [ordens, setOrdens] = useState([]);
  const [ordensEtapas, setOrdensEtapas] = useState([]);
  const [etapas, setEtapas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingTipos, setLoadingTipos] = useState(false); // New state variable
  const [activeTab, setActiveTab] = useState("ocorrencias");
  const [viewMode, setViewMode] = useState("table");
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    status: "",
    gravidade: "",
    categoria: "",
    responsavel_id: "",
    tipo_ocorrencia_id: "",
    dataInicio: "",
    dataFim: ""
  });
  const [showFilters, setShowFilters] = useState(false);
  const [showTipoForm, setShowTipoForm] = useState(false);
  const [editingTipo, setEditingTipo] = useState(null);
  const [selectedOcorrencia, setSelectedOcorrencia] = useState(null);
  const [isDark, setIsDark] = useState(document.documentElement.classList.contains('dark'));
  const [updatingTickets, setUpdatingTickets] = useState(false);
  const [categoriaTipoFilter, setCategoriaTipoFilter] = useState("todos");
  const [showOcorrenciaAvulsaForm, setShowOcorrenciaAvulsaForm] = useState(false);
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [limite, setLimite] = useState(50);
  const [showDiariasModal, setShowDiariasModal] = useState(false);
  const [showResponsavelModal, setShowResponsavelModal] = useState(false);
  const [ocorrenciaParaResponsavel, setOcorrenciaParaResponsavel] = useState(null);
  const [responsavelSelecionado, setResponsavelSelecionado] = useState("");
  const [salvandoResponsavel, setSalvandoResponsavel] = useState(false);
  const [periodoSelecionado, setPeriodoSelecionado] = useState("mes_atual");
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");

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
    
    // Inicializar período mês atual
    const hoje = new Date();
    const primeiroDiaMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
    const ultimoDiaMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);
    setDataInicio(primeiroDiaMes.toISOString().split('T')[0]);
    setDataFim(ultimoDiaMes.toISOString().split('T')[0]);
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [ocorrenciasData, tiposData, departamentosData, ordensData, ordensEtapasData, etapasData] = await Promise.all([
        base44.entities.Ocorrencia.list("-data_inicio"),
        base44.entities.TipoOcorrencia.list(),
        base44.entities.Departamento.list(),
        base44.entities.OrdemDeCarregamento.list(),
        base44.entities.OrdemEtapa.list(),
        base44.entities.Etapa.list()
      ]);

      // Carregar usuários via função backend (service role)
      let usuariosData = [];
      try {
        const response = await base44.functions.invoke('listarUsuariosEmpresa', {});
        usuariosData = response.data || [];
      } catch (error) {
        console.log("Não foi possível carregar lista de usuários:", error);
      }

      setOcorrencias(ocorrenciasData);
      setTiposOcorrencia(tiposData);
      setDepartamentos(departamentosData);
      setUsuarios(usuariosData);
      setOrdens(ordensData);
      setOrdensEtapas(ordensEtapasData);
      setEtapas(etapasData);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    } finally {
      setLoading(false);
    }
  };

  // New function to load only tipos de ocorrência
  const loadTiposOcorrencia = async () => {
    setLoadingTipos(true);
    try {
      const tiposData = await base44.entities.TipoOcorrencia.list();
      setTiposOcorrencia(tiposData);
    } catch (error) {
      console.error("Erro ao carregar tipos de ocorrência:", error);
    } finally {
      setLoadingTipos(false);
    }
  };

  const updateMissingTickets = async () => {
    setUpdatingTickets(true);
    try {
      const ocorrenciasSemTicket = ocorrencias.filter(o => !o.numero_ticket);
      
      for (const ocorrencia of ocorrenciasSemTicket) {
        const dataInicio = new Date(ocorrencia.data_inicio);
        const year = dataInicio.getFullYear().toString().slice(-2);
        const month = (dataInicio.getMonth() + 1).toString().padStart(2, '0');
        const day = dataInicio.getDate().toString().padStart(2, '0');
        const hour = dataInicio.getHours().toString().padStart(2, '0');
        const minute = dataInicio.getMinutes().toString().padStart(2, '0');
        const second = dataInicio.getSeconds().toString().padStart(2, '0');
        
        const ticketNumber = `${year}${month}${day}${hour}${minute}${second}`;
        
        await base44.entities.Ocorrencia.update(ocorrencia.id, {
          numero_ticket: ticketNumber
        });
      }
      
      await loadData();
      alert(`${ocorrenciasSemTicket.length} números de ticket gerados com sucesso!`);
    } catch (error) {
      console.error("Erro ao atualizar tickets:", error);
      alert("Erro ao gerar números de ticket");
    } finally {
      setUpdatingTickets(false);
    }
  };

  const handleDuplicateTipo = (tipo, e) => {
    e.stopPropagation();
    
    // Criar cópia com novos dados
    const tipoDuplicado = {
      ...tipo,
      nome: `${tipo.nome} (Cópia)`,
      codigo: tipo.codigo ? `${tipo.codigo}-COPIA` : undefined,
      id: undefined // Remove o ID para criar novo
    };
    
    setEditingTipo(tipoDuplicado);
    setShowTipoForm(true);
  };

  const handleDeleteTipo = async (tipo, e) => {
    e.stopPropagation();
    
    // Verificar se existem ocorrências usando este tipo
    const ocorrenciasUsandoTipo = ocorrencias.filter(o => o.tipo_ocorrencia_id === tipo.id);
    
    if (ocorrenciasUsandoTipo.length > 0) {
      const confirmar = confirm(
        `Atenção! Existem ${ocorrenciasUsandoTipo.length} ocorrências usando este tipo.\n\n` +
        `Recomendamos DESATIVAR o tipo ao invés de excluí-lo para preservar o histórico.\n\n` +
        `Deseja realmente EXCLUIR permanentemente?`
      );
      
      if (!confirmar) return;
    } else {
      const confirmar = confirm(
        `Tem certeza que deseja excluir o tipo "${tipo.nome}"?\n\n` +
        `Esta ação não pode ser desfeita.`
      );
      
      if (!confirmar) return;
    }
    
    try {
      await base44.entities.TipoOcorrencia.delete(tipo.id);
      await loadTiposOcorrencia();
    } catch (error) {
      console.error("Erro ao excluir tipo:", error);
      alert("Erro ao excluir tipo de ocorrência. Tente novamente.");
    }
  };

  const handleSubmitTipo = async (data) => {
    try {
      // Verificar se é edição (tem id) ou criação (novo/duplicado sem id)
      if (editingTipo && editingTipo.id) {
        await base44.entities.TipoOcorrencia.update(editingTipo.id, data);
      } else {
        await base44.entities.TipoOcorrencia.create(data);
      }

      setShowTipoForm(false);
      setEditingTipo(null);
      
      // Recarregar APENAS os tipos de ocorrência, sem fechar a aba ou recarregar tudo
      await loadTiposOcorrencia();
      
      // Mensagem de sucesso sutil (opcional - remover se não quiser notificação)
      // toast.success(editingTipo ? "Tipo atualizado!" : "Tipo criado!");
    } catch (error) {
      console.error("Erro ao salvar tipo de ocorrência:", error);
      alert("Erro ao salvar tipo de ocorrência. Tente novamente.");
    }
  };

  const handleSubmitOcorrenciaAvulsa = async (data) => {
    try {
      const currentUser = await base44.auth.me();
      const ticketNumber = generateTicketNumber();
      const tipoOcorrencia = tiposOcorrencia.find(t => t.id === data.tipo_ocorrencia_id);
      const responsavel = usuarios.find(u => u.id === data.responsavel_id);
      const dataPrazo = calcularPrazo(tipoOcorrencia);
      
      // Criar objeto sem ordem_id - não enviar o campo
      const ocorrenciaData = {
        numero_ticket: ticketNumber,
        data_inicio: new Date().toISOString(),
        registrado_por: currentUser.id,
        tipo: data.tipo_ocorrencia_id ? tiposOcorrencia.find(t => t.id === data.tipo_ocorrencia_id)?.nome : "Ocorrência Avulsa",
        descricao_tipo: data.tipo_ocorrencia_id ? tiposOcorrencia.find(t => t.id === data.tipo_ocorrencia_id)?.descricao : null,
        categoria: data.categoria,
        observacoes: data.observacoes,
        gravidade: data.gravidade,
        status: data.status
      };

      // Adicionar campos opcionais apenas se tiverem valor (não nulo/vazio)
      if (data.tipo_ocorrencia_id) {
        ocorrenciaData.tipo_ocorrencia_id = data.tipo_ocorrencia_id;
      }
      
      if (data.responsavel_id) {
        ocorrenciaData.responsavel_id = data.responsavel_id;
      }

      await base44.entities.Ocorrencia.create(ocorrenciaData);

      // Enviar email para o responsável se houver
      if (responsavel && responsavel.email) {
        console.log("📧 [OCORRÊNCIA AVULSA] Enviando email para:", responsavel.email);
        
        try {
          const appUrl = window.location.origin;
          const linkOcorrencia = `${appUrl}/#/OcorrenciasGestao`;

          const prazoTexto = dataPrazo 
            ? formatarDataHoraBR(dataPrazo)
            : 'Não definido';

          const assuntoEmail = `🔔 Ocorrência Avulsa #${ticketNumber} - ${tipoOcorrencia?.nome || 'Nova Ocorrência'}`;

          const corpoEmail = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .ticket-number { font-size: 32px; font-weight: bold; font-family: monospace; letter-spacing: 2px; margin-top: 10px; }
    .avulsa-badge { background: #d1fae5; color: #065f46; padding: 8px 16px; border-radius: 20px; font-weight: bold; font-size: 14px; display: inline-block; margin-top: 10px; }
    .content { background: #ffffff; padding: 30px; border: 2px solid #e5e7eb; border-top: none; }
    .info-box { background: #f9fafb; padding: 15px; margin: 15px 0; border-left: 4px solid #10b981; border-radius: 4px; }
    .info-label { font-weight: bold; color: #6b7280; font-size: 12px; text-transform: uppercase; margin-bottom: 5px; }
    .info-value { font-size: 16px; color: #111827; font-weight: 600; }
    .gravidade { display: inline-block; padding: 8px 16px; border-radius: 6px; font-weight: bold; font-size: 14px; text-transform: uppercase; }
    .gravidade-baixa { background: #dbeafe; color: #1e40af; }
    .gravidade-media { background: #fef3c7; color: #92400e; }
    .gravidade-alta { background: #fed7aa; color: #9a3412; }
    .gravidade-critica { background: #fee2e2; color: #991b1b; }
    .prazo-box { background: #fef3c7; border: 2px solid #fbbf24; padding: 20px; margin: 20px 0; border-radius: 8px; text-align: center; }
    .prazo-value { font-size: 24px; font-weight: bold; color: #92400e; margin: 10px 0; }
    .btn { display: inline-block; padding: 15px 30px; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
    .btn:hover { background: linear-gradient(135deg, #059669 0%, #047857 100%); }
    .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 12px; border-top: 2px solid #e5e7eb; margin-top: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin: 0;">🔔 Nova Ocorrência Atribuída</h1>
      <div class="ticket-number">#${ticketNumber}</div>
      <div class="avulsa-badge">📋 AVULSA</div>
    </div>
    
    <div class="content">
      <p style="font-size: 16px; margin-bottom: 20px;">
        Olá <strong>${responsavel.full_name}</strong>,
      </p>
      
      <p style="font-size: 16px;">
        Você foi designado como responsável pela resolução de uma ocorrência avulsa.
      </p>

      ${tipoOcorrencia ? `
      <div class="info-box">
        <div class="info-label">Tipo de Ocorrência</div>
        <div class="info-value">${tipoOcorrencia.nome}</div>
      </div>
      ` : ''}

      <div class="info-box">
        <div class="info-label">Categoria</div>
        <div class="info-value">${data.categoria === 'tracking' ? '🚚 Tracking (Viagem)' : data.categoria === 'fluxo' ? '⚙️ Fluxo (Processos)' : '✅ Tarefa'}</div>
        ${data.categoria === 'tarefa' ? '<p style="margin: 5px 0 0 0; color: #059669; font-size: 13px;">ℹ️ Esta ocorrência não impacta o cálculo de SLA</p>' : ''}
      </div>

      <div class="info-box">
        <div class="info-label">Descrição</div>
        <div style="margin-top: 8px; color: #374151; font-size: 15px; line-height: 1.6;">
          ${data.observacoes}
        </div>
      </div>

      <div class="info-box">
        <div class="info-label">Gravidade</div>
        <div style="margin-top: 8px;">
          <span class="gravidade gravidade-${data.gravidade}">
            ${data.gravidade.charAt(0).toUpperCase() + data.gravidade.slice(1)}
          </span>
        </div>
      </div>

      ${dataPrazo ? `
      <div class="prazo-box">
        <div class="info-label">⏰ PRAZO PARA RESOLUÇÃO</div>
        <div class="prazo-value">${prazoTexto}</div>
        <p style="margin: 5px 0 0 0; color: #92400e; font-size: 14px;">
          ${tipoOcorrencia?.prazo_sla_minutos 
            ? `SLA: ${tipoOcorrencia.prazo_sla_minutos} minutos (${(tipoOcorrencia.prazo_sla_minutos / 60).toFixed(1)}h)`
            : tipoOcorrencia?.prazo_sla_horas 
              ? `SLA: ${tipoOcorrencia.prazo_sla_horas} horas`
              : ''
          }
        </p>
      </div>
      ` : ''}

      <div style="text-align: center; margin: 30px 0;">
        <a href="${linkOcorrencia}" class="btn">
          📋 ACESSAR SISTEMA E TRATAR OCORRÊNCIA
        </a>
      </div>

      <div style="background: #d1fae5; padding: 15px; border-radius: 8px; margin-top: 20px; border: 2px solid #10b981;">
        <p style="margin: 0; font-size: 14px; color: #065f46;">
          <strong>ℹ️ Ocorrência Avulsa:</strong> Esta ocorrência não está vinculada a nenhuma ordem ou etapa específica.
        </p>
      </div>
    </div>

    <div class="footer">
      <p style="margin: 5px 0;">
        <strong>Sistema de Gestão Logística</strong>
      </p>
      <p style="margin: 5px 0;">
        Este é um e-mail automático. Por favor, não responda.
      </p>
      <p style="margin: 5px 0;">
        Ticket: <strong>#${ticketNumber}</strong>
      </p>
    </div>
  </div>
</body>
</html>
          `;

          const resultadoEmail = await base44.integrations.Core.SendEmail({
            to: responsavel.email,
            subject: assuntoEmail,
            body: corpoEmail
          });

          console.log("✅ EMAIL ENVIADO COM SUCESSO para", responsavel.email);
          console.log("Resultado do envio:", resultadoEmail);
        } catch (emailError) {
          console.error("❌ ERRO AO ENVIAR EMAIL:", emailError);
          console.error("Detalhes:", emailError.message);
          alert(`⚠️ Ocorrência criada, mas erro ao enviar email:\n${emailError.message}`);
        }
      } else {
        console.log("⚠️ Responsável sem email cadastrado ou não selecionado");
      }

      setShowOcorrenciaAvulsaForm(false);
      loadData();
    } catch (error) {
      console.error("Erro ao salvar ocorrência avulsa:", error);
      alert("Erro ao criar ocorrência avulsa");
    }
  };

  const calculateElapsedTime = (ocorrencia) => {
    if (!ocorrencia.data_inicio) return null;
    
    const inicio = new Date(ocorrencia.data_inicio);
    const fim = ocorrencia.data_fim ? new Date(ocorrencia.data_fim) : new Date();
    const horas = differenceInHours(fim, inicio);
    
    return horas;
  };

  const calculateTimeRemaining = (ocorrencia) => {
    if (!ocorrencia.data_inicio || ocorrencia.status !== "aberta") return null;
    
    const tipo = tiposOcorrencia.find(t => t.id === ocorrencia.tipo_ocorrencia_id);
    if (!tipo) return null;
    
    // Usar prazo_sla_minutos, ou converter de horas se não existir
    let prazoMinutos = null;
    if (tipo.prazo_sla_minutos !== undefined && tipo.prazo_sla_minutos !== null) {
      prazoMinutos = tipo.prazo_sla_minutos;
    } else if (tipo.prazo_sla_horas !== undefined && tipo.prazo_sla_horas !== null) {
      prazoMinutos = tipo.prazo_sla_horas * 60;
    }

    if (prazoMinutos === null || prazoMinutos === 0) return null; // No SLA defined or SLA is 0 minutes

    const inicio = new Date(ocorrencia.data_inicio);
    const agora = new Date();
    const minutosDecorridos = Math.floor((agora - inicio) / (1000 * 60));
    const minutosRestantes = prazoMinutos - minutosDecorridos;

    return {
      minutosRestantes,
      minutosTotal: prazoMinutos,
      percentual: Math.min(100, (minutosDecorridos / prazoMinutos) * 100),
      atrasado: minutosRestantes < 0
    };
  };

  const formatTimeRemaining = (timeInfo) => {
    if (!timeInfo) return "-";
    
    const minutos = Math.abs(timeInfo.minutosRestantes);
    const dias = Math.floor(minutos / (24 * 60));
    const horas = Math.floor((minutos % (24 * 60)) / 60);
    const mins = minutos % 60;

    let texto = "";
    if (dias > 0) {
      texto = `${dias}d ${horas}h`;
    } else if (horas > 0) {
      texto = `${horas}h ${mins}m`;
    } else {
      texto = `${mins}m`;
    }

    return timeInfo.atrasado ? `Atrasado ${texto}` : texto;
  };

  const getTimeRemainingColor = (timeInfo) => {
    if (!timeInfo) return "text-gray-500";
    if (timeInfo.atrasado) return "text-red-600 dark:text-red-400 font-bold";
    if (timeInfo.percentual >= 80) return "text-orange-600 dark:text-orange-400 font-bold";
    if (timeInfo.percentual >= 60) return "text-yellow-600 dark:text-yellow-400 font-semibold";
    return "text-green-600 dark:text-green-400 font-semibold";
  };

  const formatElapsedTime = (horas) => {
    if (horas === null) return "-";
    
    const dias = Math.floor(horas / 24);
    const horasRestantes = horas % 24;
    
    if (dias > 0) {
      return `${dias}d ${horasRestantes}h`;
    }
    return `${horas}h`;
  };

  const todasOcorrenciasFiltradas = ocorrencias.filter(ocorrencia => {
    if (filters.status && ocorrencia.status !== filters.status) return false;
    if (filters.gravidade && ocorrencia.gravidade !== filters.gravidade) return false;
    if (filters.categoria && ocorrencia.categoria !== filters.categoria) return false;
    if (filters.responsavel_id && ocorrencia.responsavel_id !== filters.responsavel_id) return false;
    if (filters.tipo_ocorrencia_id && ocorrencia.tipo_ocorrencia_id !== filters.tipo_ocorrencia_id) return false;

    // Filtro de data do período (sempre ativo se datas estiverem definidas)
    if (dataInicio && ocorrencia.data_inicio) {
      const dataOcorrencia = new Date(ocorrencia.data_inicio);
      const dataInicioFilter = new Date(dataInicio);
      if (dataOcorrencia < dataInicioFilter) return false;
    }

    if (dataFim && ocorrencia.data_inicio) {
      const dataOcorrencia = new Date(ocorrencia.data_inicio);
      const dataFimFilter = new Date(dataFim);
      dataFimFilter.setHours(23, 59, 59, 999);
      if (dataOcorrencia > dataFimFilter) return false;
    }

    // Filtros avançados (modal)
    if (filters.dataInicio && ocorrencia.data_inicio) {
      const dataOcorrencia = new Date(ocorrencia.data_inicio);
      const dataInicio = new Date(filters.dataInicio);
      if (dataOcorrencia < dataInicio) return false;
    }

    if (filters.dataFim && ocorrencia.data_inicio) {
      const dataOcorrencia = new Date(ocorrencia.data_inicio);
      const dataFim = new Date(filters.dataFim);
      dataFim.setHours(23, 59, 59, 999);
      if (dataOcorrencia > dataFim) return false;
    }

    if (!searchTerm) return true;

    const term = searchTerm.toLowerCase();
    const tipo = tiposOcorrencia.find(t => t.id === ocorrencia.tipo_ocorrencia_id);
    const responsavel = usuarios.find(u => u.id === ocorrencia.responsavel_id);
    const ordem = ordens.find(o => o.id === ocorrencia.ordem_id);

    return (
      ocorrencia.tipo?.toLowerCase().includes(term) ||
      ocorrencia.observacoes?.toLowerCase().includes(term) ||
      ocorrencia.numero_ticket?.toLowerCase().includes(term) ||
      tipo?.nome?.toLowerCase().includes(term) ||
      responsavel?.full_name?.toLowerCase().includes(term) ||
      ordem?.numero_carga?.toLowerCase().includes(term) ||
      ordem?.viagem_pedido?.toLowerCase().includes(term)
    );
  });

  const inicio = (paginaAtual - 1) * limite;
  const fim = inicio + limite;
  const filteredOcorrencias = todasOcorrenciasFiltradas.slice(inicio, fim);

  const getStatusFromOcorrencia = (ocorrencia) => {
    // Para diárias, mapear status_cobranca → status
    if (ocorrencia.categoria === "diaria" && ocorrencia.status_cobranca) {
      if (ocorrencia.status_cobranca === "pendente_valor" || ocorrencia.status_cobranca === "pendente_autorizacao") {
        return "em_andamento";
      }
      if (ocorrencia.status_cobranca === "autorizado_faturamento" || ocorrencia.status_cobranca === "abonado" || ocorrencia.status_cobranca === "faturado") {
        return "resolvida";
      }
    }
    return ocorrencia.status;
  };

  const getMetrics = () => {
    const total = todasOcorrenciasFiltradas.length;
    const abertas = todasOcorrenciasFiltradas.filter(o => getStatusFromOcorrencia(o) === "aberta").length;
    const emAndamento = todasOcorrenciasFiltradas.filter(o => getStatusFromOcorrencia(o) === "em_andamento").length;
    const resolvidas = todasOcorrenciasFiltradas.filter(o => getStatusFromOcorrencia(o) === "resolvida").length;
    const criticas = todasOcorrenciasFiltradas.filter(o => o.gravidade === "critica").length;
    const atrasadas = todasOcorrenciasFiltradas.filter(o => {
      if (o.status !== "aberta") return false;
      const tipo = tiposOcorrencia.find(t => t.id === o.tipo_ocorrencia_id);
      if (!tipo) return false;
      
      let prazoMinutos = null;
      if (tipo.prazo_sla_minutos !== undefined && tipo.prazo_sla_minutos !== null) {
        prazoMinutos = tipo.prazo_sla_minutos;
      } else if (tipo.prazo_sla_horas !== undefined && tipo.prazo_sla_horas !== null) {
        prazoMinutos = tipo.prazo_sla_horas * 60;
      }

      if (prazoMinutos === null || prazoMinutos === 0) return false;

      const inicio = new Date(o.data_inicio);
      const fim = new Date();
      const minutosDecorridos = (fim.getTime() - inicio.getTime()) / (1000 * 60);

      return minutosDecorridos > prazoMinutos;
    }).length;

    const tracking = todasOcorrenciasFiltradas.filter(o => o.categoria === "tracking").length;
    const fluxo = todasOcorrenciasFiltradas.filter(o => o.categoria === "fluxo").length;
    const tarefa = todasOcorrenciasFiltradas.filter(o => o.categoria === "tarefa").length;
    const notasFiscais = todasOcorrenciasFiltradas.filter(o => o.categoria === "nota_fiscal").length;
    const avulsas = todasOcorrenciasFiltradas.filter(o => !o.ordem_id).length;
    const diarias = todasOcorrenciasFiltradas.filter(o => o.categoria === "diaria").length;
    const diariasPendentes = todasOcorrenciasFiltradas.filter(o => o.categoria === "diaria" && (o.status_cobranca === "pendente_valor" || o.status_cobranca === "pendente_autorizacao")).length;

    return { total, abertas, emAndamento, resolvidas, criticas, atrasadas, tracking, fluxo, tarefa, notasFiscais, avulsas, diarias, diariasPendentes };
  };

  const handleAtribuirResponsavel = async () => {
    if (!ocorrenciaParaResponsavel || !responsavelSelecionado) return;
    
    setSalvandoResponsavel(true);
    try {
      await base44.entities.Ocorrencia.update(ocorrenciaParaResponsavel.id, {
        responsavel_id: responsavelSelecionado,
        status: ocorrenciaParaResponsavel.status === "aberta" ? "em_andamento" : ocorrenciaParaResponsavel.status
      });
      
      setShowResponsavelModal(false);
      setOcorrenciaParaResponsavel(null);
      setResponsavelSelecionado("");
      await loadData();
      toast.success("Responsável atribuído!");
    } catch (error) {
      console.error("Erro ao atribuir responsável:", error);
      toast.error("Erro ao atribuir responsável");
    } finally {
      setSalvandoResponsavel(false);
    }
  };

  const theme = {
    bg: isDark ? '#0f172a' : '#f9fafb',
    cardBg: isDark ? '#1e293b' : '#ffffff',
    cardBorder: isDark ? '#334155' : '#e5e7eb',
    text: isDark ? '#f1f5f9' : '#111827',
    textMuted: isDark ? '#94a3b8' : '#6b7280',
    headerBg: isDark ? '#0f172a' : '#f9fafb',
    inputBg: isDark ? '#1e293b' : '#ffffff',
    inputBorder: isDark ? '#334155' : '#d1d5db',
  };

  if (loading) {
    return (
      <div className="p-4 min-h-screen flex items-center justify-center" style={{ backgroundColor: theme.bg }}>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm" style={{ color: theme.textMuted }}>Carregando ocorrências...</p>
        </div>
      </div>
    );
  }

  const formatDateTime = (dateString) => {
    if (!dateString) return "-";
    try {
      return format(new Date(dateString), "dd/MM/yyyy HH:mm", { locale: ptBR });
    } catch {
      return "-";
    }
  };

  const getOcorrenciasByStatus = (status) => {
    return filteredOcorrencias.filter(o => o.status === status);
  };

  const metrics = getMetrics();

  const getUsuario = (userId) => {
    return usuarios.find(u => u.id === userId);
  };

  const getEtapaNome = (ordemEtapaId) => {
    if (!ordemEtapaId) return null;
    const ordemEtapa = ordensEtapas.find(oe => oe.id === ordemEtapaId);
    if (!ordemEtapa) return null;
    const etapa = etapas.find(e => e.id === ordemEtapa.etapa_id);
    return etapa?.nome || null;
  };

  const truncateText = (text, maxLength = 50) => {
    if (!text) return "-";
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  const ocorrenciasSemTicket = ocorrencias.filter(o => !o.numero_ticket).length;

  const tiposFiltradosPorCategoria = tiposOcorrencia.filter(tipo => {
    if (categoriaTipoFilter === "todos") return true;
    return tipo.categoria === categoriaTipoFilter;
  });

  return (
    <div className="min-h-screen transition-colors p-6" style={{ backgroundColor: theme.bg }}>
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Shield className="w-6 h-6 text-orange-600" />
            <h1 className="text-2xl font-bold" style={{ color: theme.text }}>Gestão de Ocorrências</h1>
          </div>
          <p className="text-sm" style={{ color: theme.textMuted }}>Registro e acompanhamento de problemas</p>
        </div>

        <div className="flex items-center gap-2 w-full lg:w-auto">
          <div className="relative flex-1 lg:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: theme.textMuted }} />
            <Input
              placeholder="Buscar por ticket, tipo, ordem, pedido..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
              style={{ backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.text }}
            />
          </div>
          <FiltrosPredefinidos
            rota="ocorrencias"
            filtrosAtuais={filters}
            onAplicarFiltro={(novosFiltros) => {
              setFilters(novosFiltros);
              setPaginaAtual(1);
            }}
          />
          <PaginacaoControles
            paginaAtual={paginaAtual}
            totalRegistros={todasOcorrenciasFiltradas.length}
            limite={limite}
            onPaginaAnterior={() => setPaginaAtual(prev => Math.max(1, prev - 1))}
            onProximaPagina={() => setPaginaAtual(prev => prev + 1)}
            isDark={isDark}
          />
          <Button 
            variant="outline" 
            size="icon"
            onClick={() => setShowFilters(true)}
            style={{ borderColor: theme.inputBorder, backgroundColor: theme.inputBg, color: theme.text }}
          >
            <Filter className="w-4 h-4" />
          </Button>
          <Button 
            variant="outline" 
            size="icon"
            onClick={loadData}
            style={{ borderColor: theme.inputBorder, backgroundColor: theme.inputBg, color: theme.text }}
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
          <Button
            onClick={() => setShowOcorrenciaAvulsaForm(true)}
            className="bg-green-600 hover:bg-green-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Ocorrência Avulsa
          </Button>
          {ocorrenciasSemTicket > 0 && (
            <Button
              onClick={updateMissingTickets}
              disabled={updatingTickets}
              className="bg-orange-600 hover:bg-orange-700"
            >
              {updatingTickets ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Gerando...
                </>
              ) : (
                <>
                  <Ticket className="w-4 h-4 mr-2" />
                  Gerar {ocorrenciasSemTicket} Tickets
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      <div className="mb-4">
        <FiltroDataOcorrencias
          periodoSelecionado={periodoSelecionado}
          onPeriodoChange={setPeriodoSelecionado}
          dataInicio={dataInicio}
          dataFim={dataFim}
          onDataInicioChange={setDataInicio}
          onDataFimChange={setDataFim}
          isDark={isDark}
        />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-10 gap-4 mb-6">
        <Card 
          style={{ 
            backgroundColor: theme.cardBg, 
            borderColor: theme.cardBorder,
            cursor: 'pointer'
          }}
          className="hover:shadow-lg transition-shadow"
          onClick={() => {
            setFilters({ ...filters, status: "", gravidade: "", categoria: "" });
            setPaginaAtual(1);
          }}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Package className="w-5 h-5 text-blue-600" />
              <span className="text-2xl font-bold" style={{ color: theme.text }}>{metrics.total}</span>
            </div>
            <p className="text-xs font-medium" style={{ color: theme.textMuted }}>Total</p>
          </CardContent>
        </Card>

        <Card 
          style={{ 
            backgroundColor: filters.status === "aberta" ? (isDark ? '#1e293b' : '#fee2e2') : theme.cardBg, 
            borderColor: filters.status === "aberta" ? '#ef4444' : theme.cardBorder,
            cursor: 'pointer'
          }}
          className="hover:shadow-lg transition-shadow"
          onClick={() => {
            setFilters({ ...filters, status: filters.status === "aberta" ? "" : "aberta" });
            setPaginaAtual(1);
          }}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <span className="text-2xl font-bold text-red-600">{metrics.abertas}</span>
            </div>
            <p className="text-xs font-medium" style={{ color: theme.textMuted }}>Abertas</p>
          </CardContent>
        </Card>

        <Card 
          style={{ 
            backgroundColor: filters.status === "em_andamento" ? (isDark ? '#1e293b' : '#dbeafe') : theme.cardBg, 
            borderColor: filters.status === "em_andamento" ? '#3b82f6' : theme.cardBorder,
            cursor: 'pointer'
          }}
          className="hover:shadow-lg transition-shadow"
          onClick={() => {
            setFilters({ ...filters, status: filters.status === "em_andamento" ? "" : "em_andamento" });
            setPaginaAtual(1);
          }}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Clock className="w-5 h-5 text-blue-600" />
              <span className="text-2xl font-bold text-blue-600">{metrics.emAndamento}</span>
            </div>
            <p className="text-xs font-medium" style={{ color: theme.textMuted }}>Em Andamento</p>
          </CardContent>
        </Card>

        <Card 
          style={{ 
            backgroundColor: filters.status === "resolvida" ? (isDark ? '#1e293b' : '#d1fae5') : theme.cardBg, 
            borderColor: filters.status === "resolvida" ? '#10b981' : theme.cardBorder,
            cursor: 'pointer'
          }}
          className="hover:shadow-lg transition-shadow"
          onClick={() => {
            setFilters({ ...filters, status: filters.status === "resolvida" ? "" : "resolvida" });
            setPaginaAtual(1);
          }}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              <span className="text-2xl font-bold text-green-600">{metrics.resolvidas}</span>
            </div>
            <p className="text-xs font-medium" style={{ color: theme.textMuted }}>Resolvidas</p>
          </CardContent>
        </Card>

        <Card 
          style={{ 
            backgroundColor: filters.gravidade === "critica" ? (isDark ? '#1e293b' : '#fee2e2') : theme.cardBg, 
            borderColor: filters.gravidade === "critica" ? '#dc2626' : theme.cardBorder,
            cursor: 'pointer'
          }}
          className="hover:shadow-lg transition-shadow"
          onClick={() => {
            setFilters({ ...filters, gravidade: filters.gravidade === "critica" ? "" : "critica" });
            setPaginaAtual(1);
          }}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <AlertCircle className="w-5 h-5 text-red-700" />
              <span className="text-2xl font-bold text-red-700">{metrics.criticas}</span>
            </div>
            <p className="text-xs font-medium" style={{ color: theme.textMuted }}>Críticas</p>
          </CardContent>
        </Card>

        <Card style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Clock className="w-5 h-5 text-orange-600" />
              <span className="text-2xl font-bold text-orange-600">{metrics.atrasadas}</span>
            </div>
            <p className="text-xs font-medium" style={{ color: theme.textMuted }}>Atrasadas</p>
          </CardContent>
        </Card>

        <Card 
          style={{ 
            backgroundColor: filters.categoria === "tracking" ? (isDark ? '#1e293b' : '#dbeafe') : theme.cardBg, 
            borderColor: filters.categoria === "tracking" ? '#3b82f6' : theme.cardBorder,
            cursor: 'pointer'
          }}
          className="hover:shadow-lg transition-shadow"
          onClick={() => {
            setFilters({ ...filters, categoria: filters.categoria === "tracking" ? "" : "tracking" });
            setPaginaAtual(1);
          }}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <MapPin className="w-5 h-5 text-blue-600" />
              <span className="text-2xl font-bold text-blue-600">{metrics.tracking}</span>
            </div>
            <p className="text-xs font-medium" style={{ color: theme.textMuted }}>Tracking</p>
          </CardContent>
        </Card>

        <Card 
          style={{ 
            backgroundColor: filters.categoria === "fluxo" ? (isDark ? '#1e293b' : '#f3e8ff') : theme.cardBg, 
            borderColor: filters.categoria === "fluxo" ? '#9333ea' : theme.cardBorder,
            cursor: 'pointer'
          }}
          className="hover:shadow-lg transition-shadow"
          onClick={() => {
            setFilters({ ...filters, categoria: filters.categoria === "fluxo" ? "" : "fluxo" });
            setPaginaAtual(1);
          }}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Package className="w-5 h-5 text-purple-600" />
              <span className="text-2xl font-bold text-purple-600">{metrics.fluxo}</span>
            </div>
            <p className="text-xs font-medium" style={{ color: theme.textMuted }}>Fluxo</p>
          </CardContent>
        </Card>

        <Card 
          style={{ 
            backgroundColor: filters.categoria === "tarefa" ? (isDark ? '#1e293b' : '#ccfbf1') : theme.cardBg, 
            borderColor: filters.categoria === "tarefa" ? '#14b8a6' : theme.cardBorder,
            cursor: 'pointer'
          }}
          className="hover:shadow-lg transition-shadow"
          onClick={() => {
            setFilters({ ...filters, categoria: filters.categoria === "tarefa" ? "" : "tarefa" });
            setPaginaAtual(1);
          }}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <CheckCircle2 className="w-5 h-5 text-teal-600" />
              <span className="text-2xl font-bold text-teal-600">{metrics.tarefa}</span>
            </div>
            <p className="text-xs font-medium" style={{ color: theme.textMuted }}>Tarefa</p>
          </CardContent>
        </Card>

        <Card 
          style={{ 
            backgroundColor: filters.categoria === "nota_fiscal" ? (isDark ? '#1e293b' : '#ede9fe') : theme.cardBg, 
            borderColor: filters.categoria === "nota_fiscal" ? '#8b5cf6' : theme.cardBorder,
            cursor: 'pointer'
          }}
          className="hover:shadow-lg transition-shadow"
          onClick={() => {
            setFilters({ ...filters, categoria: filters.categoria === "nota_fiscal" ? "" : "nota_fiscal" });
            setPaginaAtual(1);
          }}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <FileText className="w-5 h-5 text-violet-600" />
              <span className="text-2xl font-bold text-violet-600">{metrics.notasFiscais}</span>
            </div>
            <p className="text-xs font-medium" style={{ color: theme.textMuted }}>Notas Fiscais</p>
          </CardContent>
        </Card>

        <Card style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <FileText className="w-5 h-5 text-green-600" />
              <span className="text-2xl font-bold text-green-600">{metrics.avulsas}</span>
            </div>
            <p className="text-xs font-medium" style={{ color: theme.textMuted }}>Avulsas</p>
          </CardContent>
        </Card>

        <Card 
          style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}
          className="cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => setShowDiariasModal(true)}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <DollarSign className="w-5 h-5 text-purple-600" />
              <span className="text-2xl font-bold text-purple-600">{metrics.diarias}</span>
            </div>
            <p className="text-xs font-medium" style={{ color: theme.textMuted }}>Diárias</p>
            {metrics.diariasPendentes > 0 && (
              <Badge className="mt-2 bg-orange-600 text-white text-[10px]">
                {metrics.diariasPendentes} pendentes
              </Badge>
            )}
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList style={{ backgroundColor: theme.cardBg }}>
          <TabsTrigger value="ocorrencias">Ocorrências</TabsTrigger>
          <TabsTrigger value="tipos">Tipos de Ocorrências</TabsTrigger>
        </TabsList>

        <TabsContent value="ocorrencias" className="mt-4">
          <Card style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle style={{ color: theme.text }}>Lista de Ocorrências</CardTitle>
              <Tabs value={viewMode} onValueChange={setViewMode}>
                <TabsList>
                  <TabsTrigger value="table">Tabela</TabsTrigger>
                  <TabsTrigger value="kanban">Kanban</TabsTrigger>
                </TabsList>
              </Tabs>
            </CardHeader>
            <CardContent>
              {viewMode === "table" ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b" style={{ borderColor: theme.cardBorder }}>
                        <th className="text-left px-2 py-2 text-sm font-semibold" style={{ color: theme.textMuted }}>Ticket</th>
                        <th className="text-left px-2 py-2 text-sm font-semibold" style={{ color: theme.textMuted }}>Tipo</th>
                        <th className="text-left px-2 py-2 text-sm font-semibold" style={{ color: theme.textMuted }}>Resp.</th>
                        <th className="text-left px-2 py-2 text-sm font-semibold" style={{ color: theme.textMuted }}>Categoria</th>
                        <th className="text-left px-2 py-2 text-sm font-semibold" style={{ color: theme.textMuted }}>Etapa</th>
                        <th className="text-left px-2 py-2 text-sm font-semibold" style={{ color: theme.textMuted }}>Nº Pedido</th>
                        <th className="text-left px-2 py-2 text-sm font-semibold" style={{ color: theme.textMuted }}>Observações</th>
                        <th className="text-left px-2 py-2 text-sm font-semibold" style={{ color: theme.textMuted }}>Gravidade</th>
                        <th className="text-left px-2 py-2 text-sm font-semibold" style={{ color: theme.textMuted }}>Status</th>
                        <th className="text-left px-2 py-2 text-sm font-semibold" style={{ color: theme.textMuted }}>Data Início</th>
                        <th className="text-left px-2 py-2 text-sm font-semibold" style={{ color: theme.textMuted }}>Tempo</th>
                        <th className="text-left px-2 py-2 text-sm font-semibold" style={{ color: theme.textMuted }}>Prazo SLA</th>
                        <th className="text-left px-2 py-2 text-sm font-semibold" style={{ color: theme.textMuted }}>Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredOcorrencias.map((ocorrencia) => {
                        const tipo = tiposOcorrencia.find(t => t.id === ocorrencia.tipo_ocorrencia_id);
                        const responsavel = getUsuario(ocorrencia.responsavel_id);
                        const ordem = ordens.find(o => o.id === ocorrencia.ordem_id);
                        const tempoDecorrido = calculateElapsedTime(ocorrencia);
                        const timeRemaining = calculateTimeRemaining(ocorrencia);
                        const etapaNome = ocorrencia.categoria === "fluxo" ? getEtapaNome(ocorrencia.ordem_etapa_id) : null;
                        const isAvulsa = !ocorrencia.ordem_id;

                        return (
                          <tr 
                            key={ocorrencia.id} 
                            className="border-b hover:bg-opacity-50 cursor-pointer transition-colors"
                            style={{ borderColor: theme.cardBorder }}
                            onClick={() => setSelectedOcorrencia(ocorrencia)}
                          >
                            <td className="px-2 py-1.5">
                              <span className="text-xs font-mono font-bold text-orange-600 block leading-tight">
                                {ocorrencia.numero_ticket || "-"}
                              </span>
                            </td>
                            <td className="px-2 py-1.5">
                              <div className="flex flex-col gap-0.5">
                                <span className="text-xs font-medium leading-tight line-clamp-1" style={{ color: theme.text }}>
                                  {tipo?.nome || ocorrencia.tipo}
                                </span>
                                {isAvulsa && (
                                  <Badge className="text-[10px] w-fit bg-green-600 text-white px-1.5 py-0 h-4 leading-none">
                                    AVULSA
                                  </Badge>
                                )}
                              </div>
                            </td>
                            <td className="px-2 py-1.5">
                              <span className="text-sm font-mono font-bold text-orange-600 block leading-tight">
                                {ocorrencia.numero_ticket || "-"}
                              </span>
                            </td>
                            <td className="px-2 py-1.5">
                              <div className="flex flex-col gap-0.5">
                                <span className="text-sm font-medium leading-tight line-clamp-1" style={{ color: theme.text }}>
                                  {tipo?.nome || ocorrencia.tipo}
                                </span>
                                {isAvulsa && (
                                  <Badge className="text-xs w-fit bg-green-600 text-white px-1.5 py-0.5 h-5 leading-none">
                                    AVULSA
                                  </Badge>
                                )}
                              </div>
                            </td>
                            <td 
                              className="px-2 py-1.5 cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-950 transition-colors"
                              onClick={(e) => {
                                e.stopPropagation();
                                setOcorrenciaParaResponsavel(ocorrencia);
                                setResponsavelSelecionado(ocorrencia.responsavel_id || "");
                                setShowResponsavelModal(true);
                              }}
                            >
                              {responsavel ? (
                                <div className="flex items-center gap-2">
                                  <div 
                                    className="w-7 h-7 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0 border"
                                    style={{
                                      backgroundColor: responsavel.foto_url ? 'transparent' : (isDark ? '#1e3a8a' : '#dbeafe'),
                                      borderColor: isDark ? '#3b82f6' : '#93c5fd'
                                    }}
                                  >
                                    {responsavel.foto_url ? (
                                      <img 
                                        src={responsavel.foto_url} 
                                        alt={responsavel.full_name} 
                                        className="w-full h-full object-cover"
                                      />
                                    ) : (
                                      <User className="w-3.5 h-3.5" style={{ color: isDark ? '#60a5fa' : '#1d4ed8' }} />
                                    )}
                                  </div>
                                  <span className="text-sm font-medium leading-tight" style={{ color: theme.text }}>
                                    {responsavel.full_name?.split(' ')[0]}
                                  </span>
                                </div>
                              ) : (
                                <div className="flex items-center gap-1.5 text-blue-600 hover:text-blue-700">
                                  <User className="w-3.5 h-3.5" />
                                  <span className="text-xs font-medium">Atribuir</span>
                                </div>
                              )}
                            </td>
                            <td className="px-2 py-1.5">
                              <Badge className={`text-xs px-2 py-0.5 ${categoriaColors[ocorrencia.categoria]}`}>
                                {ocorrencia.categoria === "nota_fiscal" ? "NF" : ocorrencia.categoria === "em_andamento" ? "andamento" : ocorrencia.categoria}
                              </Badge>
                            </td>
                            <td className="px-2 py-1.5">
                              {etapaNome ? (
                                <span className="text-xs font-medium text-purple-600 dark:text-purple-400 line-clamp-1 leading-tight">
                                  {etapaNome}
                                </span>
                              ) : (
                                <span className="text-xs" style={{ color: theme.textMuted }}>-</span>
                              )}
                            </td>
                            <td className="px-2 py-1.5">
                              <span className="text-xs font-mono leading-tight" style={{ color: theme.text }}>
                                {ordem?.viagem_pedido || "-"}
                              </span>
                            </td>
                            <td className="px-2 py-1.5 max-w-[180px]">
                              <div 
                                className="text-xs line-clamp-2 leading-tight" 
                                style={{ color: theme.textMuted }}
                                title={ocorrencia.observacoes}
                              >
                                {ocorrencia.observacoes}
                              </div>
                            </td>
                            <td className="px-2 py-1.5">
                              <Badge variant="outline" className={`text-xs px-2 py-0.5 border ${gravidadeColors[ocorrencia.gravidade]}`}>
                                {ocorrencia.gravidade}
                              </Badge>
                            </td>
                            <td className="px-2 py-1.5">
                              <Badge className={`text-xs px-2 py-0.5 ${statusColors[getStatusFromOcorrencia(ocorrencia)]}`}>
                                {getStatusFromOcorrencia(ocorrencia) === "em_andamento" ? "andamento" : getStatusFromOcorrencia(ocorrencia)}
                              </Badge>
                            </td>
                            <td className="px-2 py-1.5">
                              <span className="text-xs whitespace-nowrap leading-tight" style={{ color: theme.textMuted }}>
                                {ocorrencia.data_inicio ? (
                                  <>
                                    {new Date(ocorrencia.data_inicio).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                                    {' '}
                                    {new Date(ocorrencia.data_inicio).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                  </>
                                ) : '-'}
                              </span>
                            </td>
                            <td className="px-2 py-1.5">
                              <span className="text-xs font-medium leading-tight" style={{ color: theme.text }}>
                                {formatElapsedTime(tempoDecorrido)}
                              </span>
                            </td>
                            <td className="px-2 py-1.5">
                              {timeRemaining ? (
                                <div className="flex items-center gap-1.5">
                                  <span className={`text-xs font-medium leading-tight ${getTimeRemainingColor(timeRemaining)}`}>
                                    {formatTimeRemaining(timeRemaining)}
                                  </span>
                                  <div className="w-14 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden flex-shrink-0">
                                    <div
                                      className={`h-full transition-all ${
                                        timeRemaining.atrasado 
                                          ? 'bg-red-600' 
                                          : timeRemaining.percentual >= 80 
                                            ? 'bg-orange-500' 
                                            : timeRemaining.percentual >= 60
                                              ? 'bg-yellow-500'
                                              : 'bg-green-500'
                                      }`}
                                      style={{ width: `${Math.min(100, timeRemaining.percentual)}%` }}
                                    />
                                  </div>
                                </div>
                              ) : (
                                <span className="text-xs leading-tight" style={{ color: theme.textMuted }}>
                                  {ocorrencia.status === "aberta" ? "Sem prazo" : "-"}
                                </span>
                              )}
                            </td>
                            <td className="px-2 py-1.5">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedOcorrencia(ocorrencia);
                                }}
                                style={{ borderColor: theme.inputBorder }}
                                className="h-7 text-xs px-2"
                              >
                                Ver
                              </Button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>

                  {filteredOcorrencias.length === 0 && (
                    <div className="text-center py-12" style={{ color: theme.textMuted }}>
                      <AlertCircle className="w-12 h-12 mx-auto mb-3 opacity-20" />
                      <p className="font-medium">Nenhuma ocorrência encontrada</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-4 gap-6">
                  {["aberta", "em_andamento", "resolvida", "cancelada"].map((status) => {
                    const ocorrenciasStatus = filteredOcorrencias.filter(o => getStatusFromOcorrencia(o) === status);
                    const statusConfig = {
                      aberta: { icon: AlertCircle, color: "text-red-600", bgColor: "border-l-red-500" },
                      em_andamento: { icon: Clock, color: "text-blue-600", bgColor: "border-l-blue-500" },
                      resolvida: { icon: CheckCircle2, color: "text-green-600", bgColor: "border-l-green-500" },
                      cancelada: { icon: XCircle, color: "text-gray-600", bgColor: "border-l-gray-400" }
                    };
                    const config = statusConfig[status];
                    const Icon = config.icon;

                    return (
                      <div key={status}>
                        <h3 className="font-semibold mb-4 flex items-center gap-2" style={{ color: theme.text }}>
                          <Icon className={`w-5 h-5 ${config.color}`} />
                          {status === "aberta" && `Abertas (${ocorrenciasStatus.length})`}
                          {status === "em_andamento" && `Em Andamento (${ocorrenciasStatus.length})`}
                          {status === "resolvida" && `Resolvidas (${ocorrenciasStatus.length})`}
                          {status === "cancelada" && `Canceladas (${ocorrenciasStatus.length})`}
                        </h3>
                        <div className="space-y-3">
                          {ocorrenciasStatus.map((ocorrencia) => {
                            const tipo = tiposOcorrencia.find(t => t.id === ocorrencia.tipo_ocorrencia_id);
                            const responsavel = getUsuario(ocorrencia.responsavel_id);
                            const ordem = ordens.find(o => o.id === ocorrencia.ordem_id);
                            const etapaNome = ocorrencia.categoria === "fluxo" ? getEtapaNome(ocorrencia.ordem_etapa_id) : null;
                            const isAvulsa = !ocorrencia.ordem_id;

                            return (
                              <div
                                key={ocorrencia.id}
                                className={`p-4 border-l-4 ${config.bgColor} rounded-lg cursor-pointer hover:shadow-lg transition-shadow`}
                                style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}
                                onClick={() => setSelectedOcorrencia(ocorrencia)}
                              >
                                {ocorrencia.numero_ticket && (
                                  <div className="flex items-center gap-2 mb-2">
                                    <Ticket className="w-3 h-3 text-orange-600" />
                                    <span className="text-xs font-mono font-bold text-orange-600">
                                      {ocorrencia.numero_ticket}
                                    </span>
                                  </div>
                                )}
                                <div className="flex items-start gap-3 mb-2">
                                  {responsavel && (
                                    <div 
                                      className="w-10 h-10 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0 border-2"
                                      style={{
                                        backgroundColor: responsavel.foto_url ? 'transparent' : (isDark ? '#1e3a8a' : '#dbeafe'),
                                        borderColor: isDark ? '#3b82f6' : '#93c5fd'
                                      }}
                                    >
                                      {responsavel.foto_url ? (
                                        <img 
                                          src={responsavel.foto_url} 
                                          alt={responsavel.full_name} 
                                          className="w-full h-full object-cover"
                                        />
                                      ) : (
                                        <User className="w-5 h-5" style={{ color: isDark ? '#60a5fa' : '#1d4ed8' }} />
                                      )}
                                    </div>
                                  )}
                                  <div className="flex-1">
                                    <p className="font-semibold text-sm" style={{ color: theme.text }}>
                                      {tipo?.nome || ocorrencia.tipo}
                                    </p>
                                    {etapaNome && (
                                      <p className="text-xs font-medium text-purple-600 dark:text-purple-400 mt-0.5">
                                        Etapa: {etapaNome}
                                      </p>
                                    )}
                                    {ordem ? (
                                      <>
                                        <p className="text-xs" style={{ color: theme.textMuted }}>
                                          {ordem.numero_carga || `#${ocorrencia.ordem_id?.slice(-6)}`}
                                        </p>
                                        {ordem.viagem_pedido && (
                                          <p className="text-xs font-mono mt-0.5" style={{ color: isDark ? '#60a5fa' : '#1d4ed8' }}>
                                            Pedido: {ordem.viagem_pedido}
                                          </p>
                                        )}
                                      </>
                                    ) : (
                                      <p className="text-xs" style={{ color: theme.textMuted }}>Sem ordem vinculada</p>
                                    )}
                                  </div>
                                </div>
                                <div className="mb-2">
                                  <p className="text-xs" style={{ color: theme.textMuted }} title={ocorrencia.observacoes}>
                                    {truncateText(ocorrencia.observacoes, 80)}
                                  </p>
                                </div>
                                <div className="flex items-center gap-2 flex-wrap">
                                  <Badge variant="outline" className={`text-xs border ${gravidadeColors[ocorrencia.gravidade]}`}>
                                    {ocorrencia.gravidade}
                                  </Badge>
                                  <Badge className={`text-xs ${categoriaColors[ocorrencia.categoria]}`}>
                                    {ocorrencia.categoria}
                                  </Badge>
                                  {isAvulsa && (
                                    <Badge className="text-xs bg-green-600 text-white border-2 border-green-700 font-bold">
                                      AVULSA
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tipos" className="mt-4">
          <Card style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle style={{ color: theme.text }}>Tipos de Ocorrências</CardTitle>
                <Button 
                  onClick={() => {
                    setEditingTipo(null);
                    setShowTipoForm(true);
                  }}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Novo Tipo
                </Button>
              </div>
              
              <div className="flex gap-2 mt-4">
                <Button
                  variant={categoriaTipoFilter === "todos" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCategoriaTipoFilter("todos")}
                  className={categoriaTipoFilter === "todos" ? "bg-gray-700 text-white" : ""}
                >
                  Todos ({tiposOcorrencia.length})
                </Button>
                <Button
                  variant={categoriaTipoFilter === "tracking" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCategoriaTipoFilter("tracking")}
                  className={categoriaTipoFilter === "tracking" ? "bg-blue-600 text-white" : ""}
                >
                  Tracking ({tiposOcorrencia.filter(t => t.categoria === "tracking").length})
                </Button>
                <Button
                  variant={categoriaTipoFilter === "fluxo" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCategoriaTipoFilter("fluxo")}
                  className={categoriaTipoFilter === "fluxo" ? "bg-purple-600 text-white" : ""}
                >
                  Fluxo ({tiposOcorrencia.filter(t => t.categoria === "fluxo").length})
                </Button>
                <Button
                  variant={categoriaTipoFilter === "tarefa" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCategoriaTipoFilter("tarefa")}
                  className={categoriaTipoFilter === "tarefa" ? "bg-teal-600 text-white" : ""}
                >
                  Tarefa ({tiposOcorrencia.filter(t => t.categoria === "tarefa").length})
                </Button>
                <Button
                  variant={categoriaTipoFilter === "diaria" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCategoriaTipoFilter("diaria")}
                  className={categoriaTipoFilter === "diaria" ? "bg-green-600 text-white" : ""}
                >
                  Diária ({tiposOcorrencia.filter(t => t.categoria === "diaria").length})
                </Button>
                <Button
                  variant={categoriaTipoFilter === "nota_fiscal" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCategoriaTipoFilter("nota_fiscal")}
                  className={categoriaTipoFilter === "nota_fiscal" ? "bg-violet-600 text-white" : ""}
                >
                  Nota Fiscal ({tiposOcorrencia.filter(t => t.categoria === "nota_fiscal").length})
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {loadingTipos ? (
                <div className="flex items-center justify-center py-8">
                  <div className="w-5 h-5 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                  <p className="text-sm ml-2" style={{ color: theme.textMuted }}>Carregando tipos...</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b" style={{ borderColor: theme.cardBorder }}>
                        <th className="text-left px-2 py-2 text-sm font-semibold" style={{ color: theme.textMuted }}>Nome</th>
                        <th className="text-left px-2 py-2 text-sm font-semibold" style={{ color: theme.textMuted }}>Código</th>
                        <th className="text-left px-2 py-2 text-sm font-semibold" style={{ color: theme.textMuted }}>Categoria</th>
                        <th className="text-left px-2 py-2 text-sm font-semibold" style={{ color: theme.textMuted }}>Descrição</th>
                        <th className="text-left px-2 py-2 text-sm font-semibold" style={{ color: theme.textMuted }}>Gravidade</th>
                        <th className="text-left px-2 py-2 text-sm font-semibold" style={{ color: theme.textMuted }}>SLA</th>
                        <th className="text-left px-2 py-2 text-sm font-semibold" style={{ color: theme.textMuted }}>Status</th>
                        <th className="text-left px-2 py-2 text-sm font-semibold" style={{ color: theme.textMuted }}>Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tiposFiltradosPorCategoria.map((tipo) => (
                        <tr
                          key={tipo.id}
                          className="border-b hover:bg-opacity-50 cursor-pointer transition-colors group"
                          style={{ borderColor: theme.cardBorder }}
                          onClick={() => {
                            setEditingTipo(tipo);
                            setShowTipoForm(true);
                          }}
                        >
                          <td className="px-2 py-1.5">
                            <div className="flex items-center gap-2">
                              <div 
                                className="w-3 h-3 rounded-full flex-shrink-0"
                                style={{ backgroundColor: tipo.cor }}
                              />
                              <span className="text-sm font-semibold leading-tight line-clamp-1" style={{ color: theme.text }}>
                                {tipo.nome}
                              </span>
                            </div>
                          </td>
                          <td className="px-2 py-1.5">
                            <span className="text-xs font-mono leading-tight" style={{ color: theme.textMuted }}>
                              {tipo.codigo || '-'}
                            </span>
                          </td>
                          <td className="px-2 py-1.5">
                            <Badge className={`text-xs px-2 py-0.5 ${categoriaColors[tipo.categoria]}`}>
                              {tipo.categoria === "nota_fiscal" ? "NF" : tipo.categoria}
                            </Badge>
                          </td>
                          <td className="px-2 py-1.5 max-w-[200px]">
                            <div 
                              className="text-xs line-clamp-2 leading-tight" 
                              style={{ color: theme.textMuted }}
                              title={tipo.descricao}
                            >
                              {tipo.descricao || '-'}
                            </div>
                          </td>
                          <td className="px-2 py-1.5">
                            <Badge variant="outline" className={`text-xs px-2 py-0.5 border ${gravidadeColors[tipo.gravidade_padrao]}`}>
                              {tipo.gravidade_padrao}
                            </Badge>
                          </td>
                          <td className="px-2 py-1.5">
                            <span className="text-xs font-medium leading-tight" style={{ color: theme.text }}>
                              {tipo.prazo_sla_minutos ? `${tipo.prazo_sla_minutos}min` : tipo.prazo_sla_horas ? `${tipo.prazo_sla_horas}h` : '-'}
                            </span>
                          </td>
                          <td className="px-2 py-1.5">
                            <Badge variant="outline" className={`text-xs px-2 py-0.5 ${tipo.ativo ? 'bg-green-50 text-green-700 border-green-300 dark:bg-green-900/20 dark:text-green-400' : 'bg-gray-50 text-gray-700 border-gray-300 dark:bg-gray-700/20 dark:text-gray-400'}`}>
                              {tipo.ativo ? 'Ativo' : 'Inativo'}
                            </Badge>
                          </td>
                          <td className="px-2 py-1.5">
                            <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 w-6 p-0"
                                    onClick={(e) => e.stopPropagation()}
                                    style={{ color: theme.textMuted }}
                                  >
                                    <MoreVertical className="w-3 h-3" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}>
                                  <DropdownMenuItem
                                    onClick={(e) => handleDuplicateTipo(tipo, e)}
                                    style={{ color: theme.text }}
                                  >
                                    <Copy className="w-4 h-4 mr-2" />
                                    Duplicar
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator style={{ backgroundColor: theme.cardBorder }} />
                                  <DropdownMenuItem
                                    onClick={(e) => handleDeleteTipo(tipo, e)}
                                    className="text-red-600 dark:text-red-400"
                                  >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Excluir
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {!loadingTipos && tiposFiltradosPorCategoria.length === 0 && (
                <div className="text-center py-12" style={{ color: theme.textMuted }}>
                  <AlertCircle className="w-12 h-12 mx-auto mb-3 opacity-20" />
                  <p className="font-medium">Nenhum tipo de ocorrência encontrado nesta categoria</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {showTipoForm && (
        <TipoOcorrenciaForm
          open={showTipoForm}
          onClose={() => {
            setShowTipoForm(false);
            setEditingTipo(null);
          }}
          onSubmit={handleSubmitTipo}
          editingTipo={editingTipo}
        />
      )}

      {showOcorrenciaAvulsaForm && (
        <OcorrenciaAvulsaForm
          open={showOcorrenciaAvulsaForm}
          onClose={() => setShowOcorrenciaAvulsaForm(false)}
          onSubmit={handleSubmitOcorrenciaAvulsa}
          tiposOcorrencia={tiposOcorrencia}
          usuarios={usuarios}
          departamentos={departamentos}
        />
      )}

      {selectedOcorrencia && (
        <OcorrenciaDetalhes
          open={!!selectedOcorrencia}
          onClose={() => setSelectedOcorrencia(null)}
          ocorrencia={selectedOcorrencia}
          onUpdate={loadData}
        />
      )}

      {showFilters && (
        <FilterModal
          open={showFilters}
          onClose={() => setShowFilters(false)}
          filters={filters}
          setFilters={setFilters}
          usuarios={usuarios}
          tiposOcorrencia={tiposOcorrencia}
        />
      )}

      {showDiariasModal && (
        <GestaoDiariasModal
          open={showDiariasModal}
          onClose={() => setShowDiariasModal(false)}
          onUpdate={loadData}
        />
      )}

      {showResponsavelModal && ocorrenciaParaResponsavel && (
        <Dialog open={showResponsavelModal} onOpenChange={setShowResponsavelModal}>
          <DialogContent style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}>
            <DialogHeader>
              <DialogTitle style={{ color: theme.text }}>Atribuir Responsável</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label className="text-sm font-semibold mb-2 block" style={{ color: theme.text }}>
                  Ocorrência
                </Label>
                <div className="p-3 rounded border" style={{ borderColor: theme.cardBorder }}>
                  <p className="text-sm font-medium mb-1" style={{ color: theme.text }}>
                    {ocorrenciaParaResponsavel.tipo}
                  </p>
                  <p className="text-xs" style={{ color: theme.textMuted }}>
                    Ticket: {ocorrenciaParaResponsavel.numero_ticket || "-"}
                  </p>
                </div>
              </div>

              <div>
                <Label className="text-sm font-semibold mb-2 block" style={{ color: theme.text }}>
                  Selecione o Responsável
                </Label>
                <Select
                  value={responsavelSelecionado}
                  onValueChange={setResponsavelSelecionado}
                >
                  <SelectTrigger style={{ backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.text }}>
                    <SelectValue placeholder="Escolha um usuário" />
                  </SelectTrigger>
                  <SelectContent style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}>
                    <SelectItem value={null}>Nenhum</SelectItem>
                    {usuarios.filter(u => u.tipo_perfil === "operador" || u.role === "admin").map(u => (
                      <SelectItem key={u.id} value={u.id} style={{ color: theme.text }}>
                        {u.full_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setShowResponsavelModal(false);
                  setOcorrenciaParaResponsavel(null);
                  setResponsavelSelecionado("");
                }}
                style={{ borderColor: theme.cardBorder, color: theme.text }}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleAtribuirResponsavel}
                disabled={salvandoResponsavel || !responsavelSelecionado}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {salvandoResponsavel ? "Salvando..." : "Atribuir"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}