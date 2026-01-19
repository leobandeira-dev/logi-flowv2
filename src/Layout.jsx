import React from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import EmpresaOnboarding from "./components/onboarding/EmpresaOnboarding";
import PerfilFotoModal from "./components/usuario/PerfilFotoModal";
import MeuPerfilModal from "./components/usuario/MeuPerfilModal";
import NotificacaoOcorrencia from "./components/notificacoes/NotificacaoOcorrencia";
import TratarOcorrenciaModal from "./components/fluxo/TratarOcorrenciaModal";
import PWAInstaller from "./components/utils/PWAInstaller";

import {
  Truck,
  LayoutDashboard,
  Users,
  FileText,
  Settings,
  User,
  LogOut,
  UserCog,
  Shield,
  MapPin,
  Workflow,
  MessageCircle,
  Menu,
  X,
  Moon,
  Sun,
  Smartphone,
  Trophy,
  Camera,
  Package,
  ClipboardCheck,
  Activity,
  Clock,
  ChevronRight,
  Tag,
  Ruler
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

const getNavigationItems = (userProfile, userRole, ocorrenciasCount, etapasCount, aprovacoesCount) => {
  // Sempre retorna pelo menos o menu Início
  const baseMenu = [{ title: "Início", url: createPageUrl("Inicio"), icon: LayoutDashboard, type: "single" }];
  
  // Se for admin, mostrar menu completo
  if (userRole === "admin") {
    return [
      ...baseMenu,
      { 
        title: "Operações", 
        icon: Activity, 
        type: "dropdown",
        items: [
          { title: "Dashboard", url: createPageUrl("Dashboard"), icon: Activity },
          { title: "Tracking", url: createPageUrl("Tracking"), icon: MapPin },
          { title: "Fluxo", url: createPageUrl("Fluxo"), icon: Workflow, badge: etapasCount },
          { title: "Ordens", url: createPageUrl("OrdensCarregamento"), icon: FileText },
          { title: "Fila X", url: createPageUrl("FilaX"), icon: Truck },
        ]
      },
      { 
        title: "Coletas", 
        icon: Package, 
        type: "dropdown",
        items: [
          { title: "Dashboard Coletas", url: createPageUrl("Coletas"), icon: Activity },
          { title: "Solicitar Coleta", url: createPageUrl("SolicitacaoColeta"), icon: Package },
          { title: "Aprovar Coletas", url: createPageUrl("AprovacaoColeta"), icon: ClipboardCheck },
        ]
      },
      { 
        title: "Armazém", 
        icon: Package, 
        type: "dropdown",
        items: [
          { title: "Recebimento", url: createPageUrl("Recebimento"), icon: Package },
          { title: "Gestão de Notas Fiscais", url: createPageUrl("GestaoDeNotasFiscais"), icon: FileText },
          { title: "Gestão de CT-e", url: createPageUrl("GestaoDeCTe"), icon: FileText },
          { title: "Etiquetas Mãe", url: createPageUrl("EtiquetasMae"), icon: Tag },
          { title: "Cubagem", url: createPageUrl("Cubagem"), icon: Ruler },
          { title: "Carregamento", url: createPageUrl("Carregamento"), icon: Truck },
          { title: "Ordem de Entrega", url: createPageUrl("OrdemDeEntrega"), icon: Truck },
        ]
      },
      { 
        title: "Recursos", 
        icon: Users, 
        type: "dropdown",
        items: [
          { title: "Motoristas", url: createPageUrl("Motoristas"), icon: Users },
          { title: "Veículos", url: createPageUrl("Veiculos"), icon: Truck },
          { title: "Parceiros", url: createPageUrl("Parceiros"), icon: Users },
          { title: "Operações", url: createPageUrl("Operacoes"), icon: Settings },
          { title: "Tabelas de Frete", url: createPageUrl("Tabelas"), icon: FileText },
          { title: "Gestão de Usuários", url: createPageUrl("Usuarios"), icon: UserCog },
          { title: "Aprovações Pendentes", url: createPageUrl("Usuarios"), icon: UserCog, badge: aprovacoesCount },
        ]
      },
      { 
        title: "Qualidade", 
        icon: Shield, 
        type: "dropdown",
        badge: ocorrenciasCount,
        items: [
          { title: "Ocorrências", url: createPageUrl("OcorrenciasGestao"), icon: Shield, badge: ocorrenciasCount },
          { title: "Gamificação", url: createPageUrl("Gamificacao"), icon: Trophy },
        ]
      },
      { 
        title: "Comunicação", 
        icon: MessageCircle, 
        type: "dropdown",
        items: [
          { title: "App Motorista", url: createPageUrl("AppMotorista"), icon: Smartphone },
          { title: "SAC", url: createPageUrl("SAC"), icon: MessageCircle },
        ]
      },
    ];
  }

  // Se não tem perfil definido, retornar apenas Início
  if (!userProfile) {
    return baseMenu;
  }

  // Menu por perfil
  const menuPorPerfil = {
    operador: [
      ...baseMenu,
      { 
        title: "Operações", 
        icon: Activity, 
        type: "dropdown",
        items: [
          { title: "Dashboard", url: createPageUrl("Dashboard"), icon: Activity },
          { title: "Tracking", url: createPageUrl("Tracking"), icon: MapPin },
          { title: "Fluxo", url: createPageUrl("Fluxo"), icon: Workflow, badge: etapasCount },
          { title: "Ordens", url: createPageUrl("OrdensCarregamento"), icon: FileText },
          { title: "Fila X", url: createPageUrl("FilaX"), icon: Truck },
        ]
      },
      { 
        title: "Coletas", 
        icon: Package, 
        type: "dropdown",
        items: [
          { title: "Dashboard Coletas", url: createPageUrl("Coletas"), icon: Activity },
          { title: "Solicitar Coleta", url: createPageUrl("SolicitacaoColeta"), icon: Package },
          { title: "Aprovar Coletas", url: createPageUrl("AprovacaoColeta"), icon: ClipboardCheck },
        ]
      },
      { 
        title: "Armazém", 
        icon: Package, 
        type: "dropdown",
        items: [
          { title: "Recebimento", url: createPageUrl("Recebimento"), icon: Package },
          { title: "Gestão de Notas Fiscais", url: createPageUrl("GestaoDeNotasFiscais"), icon: FileText },
          { title: "Gestão de CT-e", url: createPageUrl("GestaoDeCTe"), icon: FileText },
          { title: "Etiquetas Mãe", url: createPageUrl("EtiquetasMae"), icon: Tag },
          { title: "Cubagem", url: createPageUrl("Cubagem"), icon: Ruler },
          { title: "Carregamento", url: createPageUrl("Carregamento"), icon: Truck },
          { title: "Ordem de Entrega", url: createPageUrl("OrdemDeEntrega"), icon: Truck },
        ]
      },
      { 
        title: "Recursos", 
        icon: Users, 
        type: "dropdown",
        items: [
          { title: "Motoristas", url: createPageUrl("Motoristas"), icon: Users },
          { title: "Veículos", url: createPageUrl("Veiculos"), icon: Truck },
          { title: "Operações", url: createPageUrl("Operacoes"), icon: Settings },
          { title: "Tabelas de Preços", url: createPageUrl("Tabelas"), icon: FileText },
        ]
      },
      { 
        title: "Qualidade", 
        icon: Shield, 
        type: "dropdown",
        badge: ocorrenciasCount,
        items: [
          { title: "Ocorrências", url: createPageUrl("OcorrenciasGestao"), icon: Shield, badge: ocorrenciasCount },
          { title: "Gamificação", url: createPageUrl("Gamificacao"), icon: Trophy },
        ]
      },
      { 
        title: "Comunicação", 
        icon: MessageCircle, 
        type: "dropdown",
        items: [
          { title: "App Motorista", url: createPageUrl("AppMotorista"), icon: Smartphone },
          { title: "SAC", url: createPageUrl("SAC"), icon: MessageCircle },
        ]
      },
    ],
    operador: [
      ...baseMenu,
      { 
        title: "Operações", 
        icon: Activity, 
        type: "dropdown",
        items: [
          { title: "Dashboard", url: createPageUrl("Dashboard"), icon: Activity },
          { title: "Tracking", url: createPageUrl("Tracking"), icon: MapPin },
          { title: "Fluxo", url: createPageUrl("Fluxo"), icon: Workflow, badge: etapasCount },
          { title: "Ordens", url: createPageUrl("OrdensCarregamento"), icon: FileText },
          { title: "Fila X", url: createPageUrl("FilaX"), icon: Truck },
        ]
      },
      { 
        title: "Coletas", 
        icon: Package, 
        type: "dropdown",
        items: [
          { title: "Dashboard Coletas", url: createPageUrl("Coletas"), icon: Activity },
          { title: "Solicitar Coleta", url: createPageUrl("SolicitacaoColeta"), icon: Package },
          { title: "Aprovar Coletas", url: createPageUrl("AprovacaoColeta"), icon: ClipboardCheck },
        ]
      },
      { 
        title: "Armazém", 
        icon: Package, 
        type: "dropdown",
        items: [
          { title: "Recebimento", url: createPageUrl("Recebimento"), icon: Package },
          { title: "Gestão de Notas Fiscais", url: createPageUrl("GestaoDeNotasFiscais"), icon: FileText },
          { title: "Gestão de CT-e", url: createPageUrl("GestaoDeCTe"), icon: FileText },
          { title: "Etiquetas Mãe", url: createPageUrl("EtiquetasMae"), icon: Tag },
          { title: "Cubagem", url: createPageUrl("Cubagem"), icon: Ruler },
          { title: "Carregamento", url: createPageUrl("Carregamento"), icon: Truck },
          { title: "Ordem de Entrega", url: createPageUrl("OrdemDeEntrega"), icon: Truck },
        ]
      },
      { 
        title: "Recursos", 
        icon: Users, 
        type: "dropdown",
        items: [
          { title: "Motoristas", url: createPageUrl("Motoristas"), icon: Users },
          { title: "Veículos", url: createPageUrl("Veiculos"), icon: Truck },
          { title: "Operações", url: createPageUrl("Operacoes"), icon: Settings },
          { title: "Tabelas de Preços", url: createPageUrl("Tabelas"), icon: FileText },
        ]
      },
      { 
        title: "Qualidade", 
        icon: Shield, 
        type: "dropdown",
        badge: ocorrenciasCount,
        items: [
          { title: "Ocorrências", url: createPageUrl("OcorrenciasGestao"), icon: Shield, badge: ocorrenciasCount },
          { title: "Gamificação", url: createPageUrl("Gamificacao"), icon: Trophy },
        ]
      },
      { 
        title: "Comunicação", 
        icon: MessageCircle, 
        type: "dropdown",
        items: [
          { title: "App Motorista", url: createPageUrl("AppMotorista"), icon: Smartphone },
          { title: "SAC", url: createPageUrl("SAC"), icon: MessageCircle },
        ]
      },
    ],
    fornecedor: [
      ...baseMenu,
      { 
        title: "Coletas", 
        icon: Package, 
        type: "dropdown",
        items: [
          { title: "Dashboard Coletas", url: createPageUrl("Coletas"), icon: Activity },
          { title: "Solicitar Coleta", url: createPageUrl("SolicitacaoColeta"), icon: Package },
          { title: "Minhas Ordens", url: createPageUrl("OrdensCarregamento"), icon: FileText },
        ]
      },
    ],
    cliente: [
      ...baseMenu,
      { 
        title: "Coletas", 
        icon: ClipboardCheck, 
        type: "dropdown",
        items: [
          { title: "Dashboard Coletas", url: createPageUrl("Coletas"), icon: Activity },
          { title: "Aprovar Coletas", url: createPageUrl("AprovacaoColeta"), icon: ClipboardCheck },
          { title: "Minhas Ordens", url: createPageUrl("OrdensCarregamento"), icon: FileText },
        ]
      },
    ]
  };

  return menuPorPerfil[userProfile] || baseMenu;
};

const adminItems = [
  { title: "Configurações", url: createPageUrl("Configuracoes"), icon: Settings },
  { title: "Usuários", url: createPageUrl("Usuarios"), icon: UserCog },
  { title: "Precificação", url: createPageUrl("Precificacao"), icon: Activity },
  { title: "Procedimentos", url: createPageUrl("Procedimentos"), icon: FileText },
  { title: "Perfis de Empresa", url: createPageUrl("PermissoesPerfilEmpresa"), icon: Shield },
  { title: "Permissões por Empresa", url: createPageUrl("PermissoesEmpresa"), icon: Shield },
];

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  const [user, setUser] = React.useState(null);
  const [empresa, setEmpresa] = React.useState(null);
  const [timezone, setTimezone] = React.useState("America/Sao_Paulo");
  const [showOnboarding, setShowOnboarding] = React.useState(false);
  const [loadingUser, setLoadingUser] = React.useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [darkMode, setDarkMode] = React.useState(false);
  const [showFotoModal, setShowFotoModal] = React.useState(false);
  const [showMeuPerfilModal, setShowMeuPerfilModal] = React.useState(false);
  const [ocorrenciasAbertas, setOcorrenciasAbertas] = React.useState(0);
  const [etapasPendentes, setEtapasPendentes] = React.useState(0);
  const [aprovacoesPendentes, setAprovacoesPendentes] = React.useState(0);
  const [showPerfilIncompleto, setShowPerfilIncompleto] = React.useState(false);
  const [perfilTempData, setPerfilTempData] = React.useState({ tipo_perfil: "" });

  // Estado para tratamento rápido de ocorrência
  const [ocorrenciaParaTratar, setOcorrenciaParaTratar] = React.useState(null);
  const [ordemDaOcorrencia, setOrdemDaOcorrencia] = React.useState(null);
  const [showTratarModal, setShowTratarModal] = React.useState(false);

  // Estado para notificações de novas ocorrências
  const [novaOcorrencia, setNovaOcorrencia] = React.useState(null);
  const [ordemNovaOcorrencia, setOrdemNovaOcorrencia] = React.useState(null);
  const [registradorNovaOcorrencia, setRegistradorNovaOcorrencia] = React.useState(null);
  const [showNotificacao, setShowNotificacao] = React.useState(false);
  const [ultimaVerificacao, setUltimaVerificacao] = React.useState(null);
  const [verificandoOcorrencias, setVerificandoOcorrencias] = React.useState(false);


  // Initialize dark mode on mount
  React.useEffect(() => {
    const savedMode = localStorage.getItem('darkMode');
    const shouldBeDark = savedMode === 'true';

    setDarkMode(shouldBeDark);

    const html = document.documentElement;
    if (shouldBeDark) {
      html.classList.add('dark');
      html.style.colorScheme = 'dark';
    } else {
      html.classList.remove('dark');
      html.style.colorScheme = 'light';
    }
  }, []);

  // Update dark mode when state changes
  React.useEffect(() => {
    const html = document.documentElement;

    if (darkMode) {
      html.classList.add('dark');
      html.style.colorScheme = 'dark';
      localStorage.setItem('darkMode', 'true');
    } else {
      html.classList.remove('dark');
      html.style.colorScheme = 'light';
      localStorage.setItem('darkMode', 'false');
    }
  }, [darkMode]);

  // Limpeza automática de cache antigo - roda 1x por dia
  React.useEffect(() => {
    const limparCacheAntigo = () => {
      const hoje = new Date().toDateString();
      const ultimaLimpeza = localStorage.getItem('ultima_limpeza_cache');

      if (ultimaLimpeza !== hoje) {
        const diasExpiracao = 30;
        const agora = Date.now();

        // Limpar filtros e rascunhos antigos (mais de 30 dias)
        Object.keys(localStorage).forEach(key => {
          if (key.startsWith('filtros_') || key.startsWith('conferencia_rascunho_') || key.startsWith('enderecamento_')) {
            try {
              const data = JSON.parse(localStorage.getItem(key));
              if (data?.timestamp) {
                const idade = (agora - new Date(data.timestamp).getTime()) / (1000 * 60 * 60 * 24);
                if (idade > diasExpiracao) {
                  localStorage.removeItem(key);
                  console.log(`🗑️ Cache removido: ${key} (${Math.floor(idade)} dias)`);
                }
              }
            } catch (e) {
              // Ignorar erros
            }
          }
        });

        localStorage.setItem('ultima_limpeza_cache', hoje);
      }
    };

    limparCacheAntigo();
  }, []);

  React.useEffect(() => {
    const loadUser = async () => {
      setLoadingUser(true);
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);

        // Admin nunca precisa de onboarding nem aprovação
        if (currentUser.role !== "admin") {
          // PRIMEIRA VERIFICAÇÃO: Se está pendente ou rejeitado, bloquear acesso
          if (currentUser.status_cadastro === "pendente_aprovacao" || currentUser.status_cadastro === "rejeitado") {
            setShowPerfilIncompleto(false);
            setShowOnboarding(false);
            setLoadingUser(false);
            return;
          }

          // SEGUNDA VERIFICAÇÃO: Checar dados pendentes apenas se aprovado ou sem status
          const dadosPendentes = [];

          // Verificar tipo_perfil
          if (!currentUser.tipo_perfil) {
            dadosPendentes.push("tipo_perfil");
          }

          // Se tem tipo_perfil, verificar dados obrigatórios por perfil
          if (currentUser.tipo_perfil) {
            if (currentUser.tipo_perfil === "operador") {
              if (!currentUser.empresa_id) dadosPendentes.push("empresa_id");
            }

            if (currentUser.tipo_perfil === "fornecedor" || currentUser.tipo_perfil === "cliente") {
              if (!currentUser.cnpj_associado) dadosPendentes.push("cnpj_associado");
            }
          }

          // Se há dados pendentes, abrir modal/onboarding
          if (dadosPendentes.length > 0) {
            console.log("Dados pendentes detectados:", dadosPendentes);

            if (dadosPendentes.includes("tipo_perfil")) {
              setShowPerfilIncompleto(true);
            } else {
              setShowOnboarding(true);
            }

            setLoadingUser(false);
            return;
          }
        }

        if (currentUser.empresa_id && currentUser.tipo_perfil !== "motorista") {
          try {
            const empresaData = await base44.entities.Empresa.get(currentUser.empresa_id);
            setEmpresa(empresaData);
            if (empresaData.timezone) {
              setTimezone(empresaData.timezone);
              localStorage.setItem('app_timezone', empresaData.timezone);
            }
          } catch (error) {
            console.error("Erro ao carregar empresa:", error);
          }
        }

        // Carregar apenas contador de ocorrências se for operador ou admin
        if (currentUser.tipo_perfil === "operador" || currentUser.role === "admin") {
          loadOcorrenciasCount(currentUser.id);
          loadEtapasCount(currentUser.id, currentUser.departamento_id);
        }

        // Carregar contador de aprovações se for admin
        if (currentUser.role === "admin") {
          try {
            const usuarios = await base44.entities.User.list();
            const pendentes = usuarios.filter(u => u.status_cadastro === "pendente_aprovacao");
            setAprovacoesPendentes(pendentes.length);
          } catch (error) {
            console.log("Erro ao carregar aprovações pendentes (ignorando):", error.message);
          }
        }

        // Inicializar timestamp da última verificação
        setUltimaVerificacao(new Date().toISOString());
      } catch (error) {
        console.error("Erro ao carregar usuário:", error);
      } finally {
        setLoadingUser(false);
      }
    };
    loadUser();
  }, []);

  // Polling de novas ocorrências a cada 60 segundos
  React.useEffect(() => {
    if (!user?.id || !ultimaVerificacao) return;

    const interval = setInterval(() => {
      checkNovasOcorrencias(user.id);
    }, 60000); // 60 segundos

    return () => clearInterval(interval);
  }, [user?.id, ultimaVerificacao]);

  const checkNovasOcorrencias = async (userId) => {
    // Evitar chamadas simultâneas
    if (verificandoOcorrencias) return;
    
    setVerificandoOcorrencias(true);
    
    try {
      // Buscar apenas ocorrências abertas (simplificado)
      const todasOcorrencias = await base44.entities.Ocorrencia.filter(
        { status: "aberta" },
        "-data_inicio",
        100
      );

      // Buscar ocorrências criadas após a última verificação
      const novas = todasOcorrencias.filter(o => {
        if (!o.data_inicio || !ultimaVerificacao) return false;
        
        const dataInicio = new Date(o.data_inicio);
        const ultimaCheck = new Date(ultimaVerificacao);

        return dataInicio > ultimaCheck &&
               (o.responsavel_id === userId || !o.responsavel_id);
      });

      // Atualizar timestamp
      setUltimaVerificacao(new Date().toISOString());

      // Se houver nova ocorrência, mostrar notificação
      if (novas.length > 0) {
        // Obter IDs das ocorrências já vistas do localStorage
        const ocorrenciaVistas = JSON.parse(localStorage.getItem('ocorrencias_vistas') || '[]');

        // Filtrar as novas ocorrências que ainda não foram vistas/notificadas
        const naoVistas = novas.filter(o => !ocorrenciaVistas.includes(o.id));

        if (naoVistas.length > 0) {
          const ocorrencia = naoVistas[0]; // Notificar a mais recente entre as não vistas

          // Adicionar a ID da ocorrência ao array de vistas no localStorage
          localStorage.setItem('ocorrencias_vistas', JSON.stringify([...ocorrenciaVistas, ocorrencia.id]));

          // Carregar dados relacionados de forma otimizada
          let ordem = null;
          let registrador = null;

          try {
            if (ocorrencia.ordem_id) {
              // Buscar apenas a ordem específica ao invés de listar todas
              const ordensData = await base44.entities.OrdemDeCarregamento.filter(
                { id: ocorrencia.ordem_id },
                null,
                1
              );
              ordem = ordensData[0];
            }

            // Tentar carregar usuário que registrou - apenas se for admin
            const currentUser = await base44.auth.me();
            if (currentUser.role === "admin" && ocorrencia.registrado_por) {
              const usuariosData = await base44.entities.User.filter(
                { id: ocorrencia.registrado_por },
                null,
                1
              );
              registrador = usuariosData[0];
            }
          } catch (error) {
            console.log("Erro ao carregar dados relacionados (normal para não-admins):", error);
          }

          setNovaOcorrencia(ocorrencia);
          setOrdemNovaOcorrencia(ordem);
          setRegistradorNovaOcorrencia(registrador);
          setShowNotificacao(true);
        }
      }

      // Atualizar contadores (independente de haver novas ou não)
      await loadOcorrenciasCount(userId);
      const userForDept = await base44.auth.me();
      await loadEtapasCount(userId, userForDept.departamento_id);

      // Atualizar contador de aprovações pendentes se for admin
      const currentUser = await base44.auth.me();
      if (currentUser.role === "admin") {
        try {
          const usuarios = await base44.entities.User.list();
          const pendentes = usuarios.filter(u => u.status_cadastro === "pendente_aprovacao");
          setAprovacoesPendentes(pendentes.length);
        } catch (error) {
          console.log("Erro ao carregar aprovações pendentes (ignorando):", error.message);
        }
      }
      } catch (error) {
      console.log("Erro ao verificar novas ocorrências (ignorando):", error.message);
      // Silenciar erro completamente - não interromper o polling
      } finally {
      setVerificandoOcorrencias(false);
      }
      };



  const loadOcorrenciasCount = async (userId) => {
    try {
      // Buscar apenas ocorrências abertas
      const ocorrencias = await base44.entities.Ocorrencia.filter(
        { status: "aberta" },
        "-data_inicio",
        200
      );

      const abertas = ocorrencias.filter(
        o => o.responsavel_id === userId || !o.responsavel_id
      );

      setOcorrenciasAbertas(abertas.length);
    } catch (error) {
      console.log("Erro ao carregar contador de ocorrências (ignorando):", error.message);
      // Silenciar erro completamente
    }
  };

  const loadEtapasCount = async (userId, departamentoId) => {
    try {
      const ordensEtapas = await base44.entities.OrdemEtapa.filter(
        { status: "em_andamento" },
        null,
        500
      );

      const minhasEtapas = ordensEtapas.filter(oe => {
        if (oe.responsavel_id === userId) return true;
        if (departamentoId && oe.departamento_responsavel_id === departamentoId) return true;
        return false;
      });

      setEtapasPendentes(minhasEtapas.length);
    } catch (error) {
      console.log("Erro ao carregar contador de etapas (ignorando):", error.message);
    }
  };

  const handleOnboardingComplete = async () => {
    setShowOnboarding(false);
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);

      if (currentUser.empresa_id && currentUser.tipo_perfil !== "motorista") {
        const empresaData = await base44.entities.Empresa.get(currentUser.empresa_id);
        setEmpresa(empresaData);
      }
      
      // Recarregar página para aplicar configurações
      window.location.reload();
    } catch (error) {
      console.error("Erro ao recarregar dados:", error);
    }
  };

  const handleLogout = async () => {
    try {
      await base44.auth.logout(createPageUrl("LandingPage"));
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    }
  };

  const toggleDarkMode = () => {
    setDarkMode(prev => !prev);
  };

  const handleFotoSuccess = async () => {
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
    } catch (error) {
      console.error("Erro ao recarregar usuário:", error);
    }
  };

  const handleCompletarPerfil = async () => {
    if (!perfilTempData.tipo_perfil) {
      alert("Por favor, selecione um tipo de perfil.");
      return;
    }

    try {
      await base44.auth.updateMe({
        tipo_perfil: perfilTempData.tipo_perfil
      });

      const currentUser = await base44.auth.me();
      setUser(currentUser);
      setShowPerfilIncompleto(false);
      
      // Abrir onboarding para completar os dados adicionais
      setShowOnboarding(true);
    } catch (error) {
      console.error("Erro ao atualizar perfil:", error);
      alert("Erro ao salvar perfil. Tente novamente.");
    }
  };

  const handleTratarSuccess = async () => {
    setShowTratarModal(false);
    setOcorrenciaParaTratar(null);
    setOrdemDaOcorrencia(null);

    if (user?.id) {
      await loadOcorrenciasCount(user.id);
    }
  };

  const handleTratarNotificacao = (ocorrencia, ordem) => {
    setOcorrenciaParaTratar(ocorrencia);
    setOrdemDaOcorrencia(ordem);
    setShowTratarModal(true);
    setShowNotificacao(false);
    // Optionally remove the item from localStorage to re-notify if not fully treated
    // const ocorrenciaVistas = JSON.parse(localStorage.getItem('ocorrencias_vistas') || '[]');
    // localStorage.setItem('ocorrencias_vistas', JSON.stringify(ocorrenciaVistas.filter(id => id !== ocorrencia.id)));
  };

  const handleCloseNotificacao = () => {
    setShowNotificacao(false);
    setNovaOcorrencia(null);
    setOrdemNovaOcorrencia(null);
    setRegistradorNovaOcorrencia(null);
  };

  const isAdmin = user?.role === "admin";
  const navigationItems = user ? getNavigationItems(user?.tipo_perfil, user?.role, ocorrenciasAbertas, etapasPendentes, aprovacoesPendentes) : [];


  const themeStyles = {
    light: {
      backgroundColor: '#f9fafb',
      color: '#111827'
    },
    dark: {
      backgroundColor: '#0f172a',
      color: '#f1f5f9'
    }
  };

  if (currentPageName === "LandingPage" || currentPageName === "PortalTransul" || currentPageName === "OfertasPublicas" || currentPageName === "FilaMotorista") {
    return children;
  }

  if (loadingUser) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={darkMode ? themeStyles.dark : themeStyles.light}>
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p style={{ color: darkMode ? '#9ca3af' : '#4b5563' }}>Carregando...</p>
        </div>
      </div>
    );
  }

  // BLOQUEIO CRÍTICO: Se usuário está aguardando aprovação ou foi rejeitado (EXCETO ADMIN)
  // Usuários sem status_cadastro são considerados aprovados (compatibilidade com cadastros antigos)
  if (user && user.role !== "admin" && user.status_cadastro && (user.status_cadastro === "pendente_aprovacao" || user.status_cadastro === "rejeitado")) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6" style={darkMode ? themeStyles.dark : themeStyles.light}>
        <div className="max-w-md w-full">
          <div className="rounded-lg shadow-xl p-8 text-center" style={{ backgroundColor: darkMode ? '#1e293b' : '#ffffff', borderColor: darkMode ? '#334155' : '#e5e7eb' }}>
            <div className={`w-16 h-16 ${user.status_cadastro === "rejeitado" ? "bg-red-100" : "bg-yellow-100"} rounded-full flex items-center justify-center mx-auto mb-4`}>
              <Clock className={`w-8 h-8 ${user.status_cadastro === "rejeitado" ? "text-red-600" : "text-yellow-600"}`} />
            </div>
            <h2 className="text-xl font-bold mb-3" style={{ color: darkMode ? '#ffffff' : '#111827' }}>
              {user.status_cadastro === "rejeitado" ? "Cadastro Rejeitado" : "Aguardando Aprovação"}
            </h2>
            <p className="text-sm mb-6" style={{ color: darkMode ? '#9ca3af' : '#6b7280' }}>
              {user.status_cadastro === "rejeitado" 
                ? "Seu cadastro foi rejeitado pelo administrador. Entre em contato para mais informações."
                : "Seu cadastro foi enviado para o administrador do sistema e está aguardando aprovação."
              }
            </p>
            <div className={`${user.status_cadastro === "rejeitado" ? "bg-red-50 border-red-200" : "bg-blue-50 border-blue-200"} border rounded-lg p-4 mb-6`}>
              <p className={`text-xs ${user.status_cadastro === "rejeitado" ? "text-red-800" : "text-blue-800"}`}>
                {user.status_cadastro === "rejeitado"
                  ? "Seu acesso foi bloqueado. Para reativar sua conta, entre em contato com o administrador."
                  : "Você receberá uma notificação por email quando seu cadastro for aprovado."
                }
              </p>
            </div>
            <Button 
              onClick={() => base44.auth.logout()}
              className="bg-blue-600 hover:bg-blue-700 w-full"
            >
              Fazer Logout
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (showOnboarding && user) {
    return (
      <div className="min-h-screen" style={darkMode ? themeStyles.dark : themeStyles.light}>
        <EmpresaOnboarding
          open={showOnboarding}
          user={user}
          onComplete={handleOnboardingComplete}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col" style={darkMode ? themeStyles.dark : themeStyles.light}>
      <nav
        className="border-b sticky top-0 z-50 shadow-sm"
        style={{
          backgroundColor: darkMode ? '#0f172a' : '#ffffff',
          borderBottomColor: darkMode ? '#1e293b' : '#e5e7eb'
        }}
      >
        <div className="px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center shadow-sm overflow-hidden flex-shrink-0">
              {empresa?.logo_url ? (
                <img src={empresa.logo_url} alt="Logo" className="w-full h-full object-contain p-1" />
              ) : (
                <Truck className="w-5 h-5 text-white" />
              )}
            </div>
            <div className="hidden md:block">
              <h2
                className="font-bold text-sm leading-tight"
                style={{ color: darkMode ? '#ffffff' : '#111827' }}
              >
                {empresa?.nome_fantasia || "TRANSUL TRANSPORTE"}
              </h2>
            </div>
            {user && !user.tipo_perfil && user.role !== "admin" && (
              <Button
                onClick={() => setShowPerfilIncompleto(true)}
                size="sm"
                className="ml-2 bg-orange-600 hover:bg-orange-700 text-white h-7 text-xs animate-pulse"
              >
                Completar Perfil
              </Button>
            )}
          </div>

          <div className="hidden lg:flex items-center gap-1">
            {navigationItems.map((item) => {
              if (item.type === "single") {
                const isActive = location.pathname === item.url;
                return (
                  <Link
                    key={item.title}
                    to={item.url}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium relative"
                    style={{
                      backgroundColor: isActive
                        ? (darkMode ? '#1e293b' : '#eff6ff')
                        : 'transparent',
                      color: isActive
                        ? (darkMode ? '#60a5fa' : '#1d4ed8')
                        : (darkMode ? '#d1d5db' : '#374151')
                    }}
                  >
                    <item.icon className="w-4 h-4" />
                    <span>{item.title}</span>
                  </Link>
                );
              }

              if (item.type === "dropdown") {
                return (
                  <DropdownMenu key={item.title}>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        className="flex items-center gap-2 px-3 py-2 h-auto text-sm font-medium relative"
                        style={{
                          color: darkMode ? '#d1d5db' : '#374151'
                        }}
                      >
                        <item.icon className="w-4 h-4" />
                        <span>{item.title}</span>
                        {item.badge > 0 && (
                          <Badge className="ml-1 h-5 min-w-[20px] px-1.5 text-[10px] font-bold bg-red-600 text-white">
                            {item.badge > 99 ? '99+' : item.badge}
                          </Badge>
                        )}
                        <ChevronRight className="w-3 h-3 rotate-90" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="start"
                      style={{
                        backgroundColor: darkMode ? '#1e293b' : '#ffffff',
                        borderColor: darkMode ? '#334155' : '#e5e7eb'
                      }}
                    >
                      {item.items.map((subItem) => (
                        <DropdownMenuItem key={subItem.title} asChild>
                          <Link
                            to={subItem.url}
                            className="flex items-center gap-2 cursor-pointer"
                            style={{
                              color: darkMode ? '#d1d5db' : '#374151'
                            }}
                          >
                            <subItem.icon className="w-4 h-4" />
                            <span>{subItem.title}</span>
                            {subItem.badge > 0 && (
                              <Badge className="ml-auto h-5 min-w-[20px] px-1.5 text-[10px] font-bold bg-red-600 text-white">
                                {subItem.badge > 99 ? '99+' : subItem.badge}
                              </Badge>
                            )}
                          </Link>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                );
              }

              return null;
            })}
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleDarkMode}
              className="h-9 w-9"
              style={{
                backgroundColor: 'transparent',
                color: darkMode ? '#fbbf24' : '#4b5563'
              }}
              title={darkMode ? "Ativar modo claro" : "Ativar modo escuro"}
            >
              {darkMode ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              style={{ color: darkMode ? '#d1d5db' : '#374151' }}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2 h-9 relative">
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0"
                    style={{
                      backgroundColor: user?.foto_url ? 'transparent' : (darkMode ? '#1e3a8a' : '#dbeafe')
                    }}
                  >
                    {user?.foto_url ? (
                      <img
                        src={user.foto_url}
                        alt={user.full_name || 'User Profile'}
                        className="w-full h-full object-cover"
                      />
                    ) : isAdmin ? (
                      <Shield className="w-4 h-4" style={{ color: darkMode ? '#60a5fa' : '#1d4ed8' }} />
                    ) : (
                      <User className="w-4 h-4" style={{ color: darkMode ? '#60a5fa' : '#1d4ed8' }} />
                    )}
                  </div>
                  <div className="hidden md:block text-left">
                    <p
                      className="text-xs font-medium leading-tight"
                      style={{ color: darkMode ? '#ffffff' : '#111827' }}
                    >
                      {user?.full_name?.split(' ')[0] || 'Usuário'}
                    </p>
                    <p
                      className="text-xs leading-tight"
                      style={{ color: darkMode ? '#9ca3af' : '#6b7280' }}
                    >
                      {isAdmin ? 'Admin' : user?.cargo || 'Usuário'}
                    </p>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-56"
                style={{
                  backgroundColor: darkMode ? '#1e293b' : '#ffffff',
                  borderColor: darkMode ? '#334155' : '#e5e7eb',
                  color: darkMode ? '#ffffff' : '#111827'
                }}
              >
                <DropdownMenuLabel>
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0"
                      style={{
                        backgroundColor: user?.foto_url ? 'transparent' : (darkMode ? '#1e3a8a' : '#dbeafe')
                      }}
                    >
                      {user?.foto_url ? (
                        <img
                          src={user.foto_url}
                          alt={user.full_name || 'User Profile'}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User className="w-5 h-5" style={{ color: darkMode ? '#60a5fa' : '#1d4ed8' }} />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{user?.full_name}</p>
                      <p className="text-xs mt-0.5" style={{ color: darkMode ? '#9ca3af' : '#6b7280' }}>
                        {user?.email}
                      </p>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator style={{ backgroundColor: darkMode ? '#334155' : '#e5e7eb' }} />

                <DropdownMenuItem onClick={() => setShowFotoModal(true)} className="cursor-pointer">
                  <Camera className="w-4 h-4 mr-2" />
                  {user?.foto_url ? 'Alterar Foto' : 'Adicionar Foto'}
                </DropdownMenuItem>

                <DropdownMenuItem onClick={() => setShowMeuPerfilModal(true)} className="cursor-pointer">
                  <User className="w-4 h-4 mr-2" />
                  Meu Perfil
                </DropdownMenuItem>

                <DropdownMenuSeparator style={{ backgroundColor: darkMode ? '#334155' : '#e5e7eb' }} />

                {isAdmin && (
                  <>
                    <DropdownMenuLabel className="text-xs font-medium uppercase" style={{ color: darkMode ? '#9ca3af' : '#6b7280' }}>
                      Admin
                    </DropdownMenuLabel>
                    {adminItems.map((item) => (
                      <DropdownMenuItem key={item.title} asChild>
                        <Link to={item.url} className="flex items-center gap-2 cursor-pointer">
                          <item.icon className="w-4 h-4" />
                          <span>{item.title}</span>
                        </Link>
                      </DropdownMenuItem>
                    ))}
                    <DropdownMenuItem asChild>
                      <Link to={createPageUrl("ChamadosAdmin")} className="flex items-center gap-2 cursor-pointer">
                        <MessageCircle className="w-4 h-4" />
                        <span>Chamados</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator style={{ backgroundColor: darkMode ? '#334155' : '#e5e7eb' }} />
                  </>
                )}

                <DropdownMenuItem
                  onClick={handleLogout}
                  className="cursor-pointer"
                  style={{ color: darkMode ? '#f87171' : '#dc2626' }}
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {mobileMenuOpen && (
          <div
            className="lg:hidden border-t max-h-[calc(100vh-3.5rem)] overflow-y-auto"
            style={{
              backgroundColor: darkMode ? '#0f172a' : '#ffffff',
              borderTopColor: darkMode ? '#1e293b' : '#e5e7eb'
            }}
          >
            <div className="px-4 py-3 space-y-2">
              {navigationItems.map((item) => {
                if (item.type === "single") {
                  const isActive = location.pathname === item.url;
                  return (
                    <Link
                      key={item.title}
                      to={item.url}
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium relative"
                      style={{
                        backgroundColor: isActive
                          ? (darkMode ? '#1e293b' : '#eff6ff')
                          : 'transparent',
                        color: isActive
                          ? (darkMode ? '#60a5fa' : '#1d4ed8')
                          : (darkMode ? '#d1d5db' : '#374151')
                      }}
                    >
                      <item.icon className="w-4 h-4" />
                      <span>{item.title}</span>
                    </Link>
                  );
                }

                if (item.type === "dropdown") {
                  return (
                    <div key={item.title} className="space-y-1">
                      <div
                        className="flex items-center gap-3 px-3 py-2 text-sm font-semibold"
                        style={{
                          color: darkMode ? '#9ca3af' : '#6b7280'
                        }}
                      >
                        <item.icon className="w-4 h-4" />
                        <span>{item.title}</span>
                        {item.badge > 0 && (
                          <Badge className="ml-auto h-5 min-w-[20px] px-1.5 text-[10px] font-bold bg-red-600 text-white">
                            {item.badge > 99 ? '99+' : item.badge}
                          </Badge>
                        )}
                      </div>
                      <div className="pl-7 space-y-1">
                        {item.items.map((subItem) => {
                          const isActive = location.pathname === subItem.url;
                          return (
                            <Link
                              key={subItem.title}
                              to={subItem.url}
                              onClick={() => setMobileMenuOpen(false)}
                              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm"
                              style={{
                                backgroundColor: isActive
                                  ? (darkMode ? '#1e293b' : '#eff6ff')
                                  : 'transparent',
                                color: isActive
                                  ? (darkMode ? '#60a5fa' : '#1d4ed8')
                                  : (darkMode ? '#d1d5db' : '#374151')
                              }}
                            >
                              <subItem.icon className="w-4 h-4" />
                              <span>{subItem.title}</span>
                              {subItem.badge > 0 && (
                                <Badge className="ml-auto h-5 min-w-[20px] px-1.5 text-[10px] font-bold bg-red-600 text-white">
                                  {subItem.badge > 99 ? '99+' : subItem.badge}
                                </Badge>
                              )}
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  );
                }

                return null;
              })}
            </div>
          </div>
        )}
      </nav>

      <main className="flex-1" style={darkMode ? themeStyles.dark : themeStyles.light}>
        {children}
      </main>



      {/* Notificação de Nova Ocorrência */}
      {showNotificacao && novaOcorrencia && (
        <div className="fixed bottom-4 right-4 z-[100] animate-in slide-in-from-bottom-5 duration-300">
          <NotificacaoOcorrencia
            ocorrencia={novaOcorrencia}
            ordem={ordemNovaOcorrencia}
            registrador={registradorNovaOcorrencia}
            onClose={handleCloseNotificacao}
            onTratar={handleTratarNotificacao}
            isDark={darkMode}
          />
        </div>
      )}

      {showFotoModal && user && (
        <PerfilFotoModal
          open={showFotoModal}
          onClose={() => setShowFotoModal(false)}
          user={user}
          onSuccess={handleFotoSuccess}
        />
      )}

      {showMeuPerfilModal && user && (
        <MeuPerfilModal
          open={showMeuPerfilModal}
          onClose={() => setShowMeuPerfilModal(false)}
          user={user}
          onSuccess={() => window.location.reload()}
        />
      )}

      {showTratarModal && ocorrenciaParaTratar && (
        <TratarOcorrenciaModal
          open={showTratarModal}
          onClose={() => {
            setShowTratarModal(false);
            setOcorrenciaParaTratar(null);
            setOrdemDaOcorrencia(null);
          }}
          ordem={ordemDaOcorrencia}
          etapa={null}
          ordemEtapa={null}
          ocorrenciaEspecifica={ocorrenciaParaTratar}
          onSuccess={handleTratarSuccess}
        />
      )}

      {/* PWA Installer */}
      <PWAInstaller />

      {/* Modal de Perfil Incompleto */}
      {showPerfilIncompleto && user && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[200] p-4">
          <div
            className="rounded-lg shadow-xl max-w-md w-full p-6"
            style={{
              backgroundColor: darkMode ? '#1e293b' : '#ffffff',
              borderColor: darkMode ? '#334155' : '#e5e7eb'
            }}
          >
            <h2 className="text-xl font-bold mb-4" style={{ color: darkMode ? '#ffffff' : '#111827' }}>
              Complete seu Perfil
            </h2>
            <p className="text-sm mb-6" style={{ color: darkMode ? '#9ca3af' : '#6b7280' }}>
              Para acessar o sistema, precisamos de algumas informações importantes.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: darkMode ? '#d1d5db' : '#374151' }}>
                  Tipo de Perfil *
                </label>
                <select
                  value={perfilTempData.tipo_perfil}
                  onChange={(e) => setPerfilTempData({ ...perfilTempData, tipo_perfil: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border"
                  style={{
                    backgroundColor: darkMode ? '#0f172a' : '#ffffff',
                    borderColor: darkMode ? '#334155' : '#d1d5db',
                    color: darkMode ? '#ffffff' : '#111827'
                  }}
                >
                  <option value="">Selecione seu perfil</option>
                  <option value="operador">Operador Logístico</option>
                  <option value="fornecedor">Fornecedor</option>
                  <option value="cliente">Cliente</option>
                </select>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
                <p className="text-xs" style={{ color: darkMode ? '#93c5fd' : '#1e40af' }}>
                  {perfilTempData.tipo_perfil === "operador" && "Você terá acesso ao sistema completo de gestão logística."}
                  {perfilTempData.tipo_perfil === "fornecedor" && "Você poderá solicitar coletas e acompanhar suas ordens."}
                  {perfilTempData.tipo_perfil === "cliente" && "Você poderá aprovar coletas e visualizar suas ordens."}
                  {!perfilTempData.tipo_perfil && "Selecione um perfil para ver suas permissões."}
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <Button
                onClick={handleCompletarPerfil}
                disabled={!perfilTempData.tipo_perfil}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Continuar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}