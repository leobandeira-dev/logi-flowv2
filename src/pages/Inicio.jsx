import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import MeuPerfilModal from "../components/usuario/MeuPerfilModal";
import {
  LayoutDashboard,
  MapPin,
  Workflow,
  FileText,
  Users,
  Truck,
  Settings,
  Shield,
  Trophy,
  Smartphone,
  MessageCircle,
  Package,
  ClipboardCheck,
  ArrowRight,
  Activity,
  AlertCircle,
  UserCog,
  UserCheck,
  Tag
} from "lucide-react";

const ModuleCard = ({ title, description, icon: Icon, url, color, badge, isDark }) => {
  const theme = {
    cardBg: isDark ? '#1e293b' : '#ffffff',
    cardBorder: isDark ? '#334155' : '#e5e7eb',
    text: isDark ? '#f1f5f9' : '#111827',
    textMuted: isDark ? '#94a3b8' : '#6b7280',
  };

  return (
    <Link to={url}>
      <Card 
        className="h-full hover:shadow-lg transition-all duration-300 border-2 group cursor-pointer"
        style={{ 
          backgroundColor: theme.cardBg, 
          borderColor: theme.cardBorder,
        }}
      >
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div 
              className={`w-14 h-14 rounded-xl flex items-center justify-center ${color} group-hover:scale-110 transition-transform`}
            >
              <Icon className="w-7 h-7 text-white" />
            </div>
            {badge && (
              <Badge className="bg-red-600 text-white font-bold">
                {badge}
              </Badge>
            )}
          </div>
          <h3 className="text-lg font-bold mb-2 flex items-center justify-between" style={{ color: theme.text }}>
            {title}
            <ArrowRight className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: theme.textMuted }} />
          </h3>
          <p className="text-sm leading-relaxed" style={{ color: theme.textMuted }}>
            {description}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
};

export default function Inicio() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isDark, setIsDark] = useState(false);
  const [ocorrenciasAbertas, setOcorrenciasAbertas] = useState(0);
  const [showMeuPerfilModal, setShowMeuPerfilModal] = useState(false);
  const [aprovacoesPendentes, setAprovacoesPendentes] = useState(0);

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
    loadUser();
  }, []);

  const verificarDadosFaltantes = (user) => {
    if (!user) return [];
    
    const faltantes = [];
    
    // Admin não precisa de dados adicionais
    if (user.role === "admin") return [];
    
    // Verificar tipo_perfil
    if (!user.tipo_perfil) {
      faltantes.push({ campo: "tipo_perfil", label: "Tipo de Perfil" });
      return faltantes; // Se não tem perfil, retorna logo
    }
    
    // Verificações específicas por perfil - REMOVIDAS as validações de empresa_id, cnpj_associado e cargo
    // Esses campos não são obrigatórios para acessar o sistema
    
    return faltantes;
  };

  const loadUser = async () => {
    setLoading(true);
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);

      // Carregar contador de ocorrências para operadores e admins
      if (currentUser.tipo_perfil === "operador" || currentUser.role === "admin") {
        try {
          const ocorrencias = await base44.entities.Ocorrencia.filter({ status: "aberta" });
          setOcorrenciasAbertas(ocorrencias.length);
        } catch (error) {
          console.log("Erro ao carregar ocorrências (ignorando):", error.message);
          // Silenciar erro - não é crítico para a página Início
        }
      }

      // Auto-abrir modal se dados incompletos
      const faltantes = verificarDadosFaltantes(currentUser);
      if (faltantes.length > 0) {
        setTimeout(() => setShowMeuPerfilModal(true), 500);
      }

      // Carregar contador de aprovações pendentes para admins
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
      console.error("Erro ao carregar usuário:", error);
    } finally {
      setLoading(false);
    }
  };

  const theme = {
    bg: isDark ? '#0f172a' : '#f9fafb',
    text: isDark ? '#f1f5f9' : '#111827',
    textMuted: isDark ? '#94a3b8' : '#6b7280',
  };

  const getModulesForUser = () => {
    if (!user) {
      console.log("getModulesForUser: usuário não carregado");
      return [];
    }

    const isAdmin = user.role === "admin";
    const perfil = user.tipo_perfil;

    console.log("getModulesForUser - isAdmin:", isAdmin, "perfil:", perfil);

    const allModules = [
      {
        category: "Gestão de Operações",
        modules: [
          { 
            title: "Dashboard", 
            description: "Visão geral das operações com métricas, gráficos e indicadores em tempo real",
            icon: LayoutDashboard, 
            url: createPageUrl("Dashboard"), 
            color: "bg-blue-600",
            profiles: ["admin", "operador"]
          },
          { 
            title: "Tracking", 
            description: "Acompanhamento logístico em tempo real de todas as cargas em trânsito",
            icon: MapPin, 
            url: createPageUrl("Tracking"), 
            color: "bg-purple-600",
            profiles: ["admin", "operador"]
          },
          { 
            title: "Fluxo de Processos", 
            description: "Gestão e acompanhamento do workflow operacional por etapas",
            icon: Workflow, 
            url: createPageUrl("Fluxo"), 
            color: "bg-indigo-600",
            profiles: ["admin", "operador"]
          },
          { 
            title: "Ordens de Carregamento", 
            description: "Gestão completa de ordens, ofertas e cargas alocadas",
            icon: FileText, 
            url: createPageUrl("OrdensCarregamento"), 
            color: "bg-cyan-600",
            profiles: ["admin", "operador", "fornecedor", "cliente"]
          },
        ]
      },
      {
        category: "Gestão de Coletas",
        modules: [
          { 
            title: "Solicitar Coleta", 
            description: "Envie solicitações de coleta com dados da NF para o operador logístico",
            icon: Package, 
            url: createPageUrl("SolicitacaoColeta"), 
            color: "bg-orange-600",
            profiles: ["fornecedor"]
          },
          { 
            title: "Aprovar Coletas", 
            description: "Aprove ou reprove solicitações de coleta de seus fornecedores",
            icon: ClipboardCheck, 
            url: createPageUrl("AprovacaoColeta"), 
            color: "bg-green-600",
            profiles: ["cliente"]
          },
        ]
      },
      {
        category: "Módulo de Armazém",
        modules: [
          { 
            title: "Recebimento", 
            description: "Entrada direta de notas fiscais e volumes no armazém do operador",
            icon: Package, 
            url: createPageUrl("Recebimento"), 
            color: "bg-blue-600",
            profiles: ["admin", "operador"]
          },
          { 
            title: "Gestão de Notas Fiscais", 
            description: "Visão consolidada e rastreamento de todas as notas fiscais e volumes",
            icon: FileText, 
            url: createPageUrl("GestaoDeNotasFiscais"), 
            color: "bg-indigo-600",
            profiles: ["admin", "operador"]
          },
          { 
            title: "Etiquetas Mãe", 
            description: "Unitização e agrupamento de volumes para otimização de cargas",
            icon: Tag, 
            url: createPageUrl("EtiquetasMae"), 
            color: "bg-purple-600",
            profiles: ["admin", "operador"]
          },
          { 
            title: "Carregamento", 
            description: "Gestão de carregamento de veículos com conferência de volumes",
            icon: Truck, 
            url: createPageUrl("Carregamento"), 
            color: "bg-emerald-600",
            profiles: ["admin", "operador"]
          },
          { 
            title: "Ordem de Entrega", 
            description: "Gestão de entregas finais a múltiplos destinos a partir de filiais",
            icon: Truck, 
            url: createPageUrl("OrdemDeEntrega"), 
            color: "bg-cyan-600",
            profiles: ["admin", "operador"]
          },
        ]
      },
      {
        category: "Gestão de Recursos",
        modules: [
          { 
            title: "Motoristas", 
            description: "Cadastro e gestão completa de motoristas, documentos e CNH",
            icon: Users, 
            url: createPageUrl("Motoristas"), 
            color: "bg-teal-600",
            profiles: ["admin", "operador"]
          },
          { 
            title: "Veículos", 
            description: "Controle de veículos, documentação e vinculação de implementos",
            icon: Truck, 
            url: createPageUrl("Veiculos"), 
            color: "bg-emerald-600",
            profiles: ["admin", "operador"]
          },
          { 
            title: "Operações", 
            description: "Configure operações, modalidades e parâmetros de SLA",
            icon: Settings, 
            url: createPageUrl("Operacoes"), 
            color: "bg-slate-600",
            profiles: ["admin", "operador"]
          },
          { 
            title: "Gestão de Usuários", 
            description: "Gerencie usuários, perfis e permissões do sistema",
            icon: UserCog, 
            url: createPageUrl("Usuarios"), 
            color: "bg-gray-600",
            profiles: ["admin"]
          },
          { 
            title: "Aprovações Pendentes", 
            description: "Aprove cadastros de novos operadores e usuários",
            icon: UserCheck, 
            url: createPageUrl("Usuarios"), 
            color: "bg-orange-600",
            badge: aprovacoesPendentes > 0 ? aprovacoesPendentes : null,
            profiles: ["admin"]
          },
        ]
      },
      {
        category: "Monitoramento e Qualidade",
        modules: [
          { 
            title: "Ocorrências", 
            description: "Gestão de problemas, incidentes e resolução de ocorrências",
            icon: Shield, 
            url: createPageUrl("OcorrenciasGestao"), 
            color: "bg-red-600",
            badge: ocorrenciasAbertas > 0 ? ocorrenciasAbertas : null,
            profiles: ["admin", "operador"]
          },
          { 
            title: "Gamificação", 
            description: "Rankings, pontuações e indicadores de desempenho da equipe",
            icon: Trophy, 
            url: createPageUrl("Gamificacao"), 
            color: "bg-yellow-600",
            profiles: ["admin", "operador"]
          },
        ]
      },
      {
        category: "Comunicação e Suporte",
        modules: [
          { 
            title: "App Motorista", 
            description: "Interface mobile para motoristas acompanharem suas viagens",
            icon: Smartphone, 
            url: createPageUrl("AppMotorista"), 
            color: "bg-pink-600",
            profiles: ["admin", "operador"]
          },
          { 
            title: "SAC - Central de Atendimento", 
            description: "Chatbot inteligente para suporte e dúvidas do sistema",
            icon: MessageCircle, 
            url: createPageUrl("SAC"), 
            color: "bg-violet-600",
            profiles: ["admin", "operador"]
          },
        ]
      }
    ];

    // Se é admin, retorna todos os módulos
    if (isAdmin) {
      console.log("Usuário é admin, retornando todos os módulos");
      return allModules;
    }

    // Se não tem perfil, retorna vazio
    if (!perfil) {
      console.log("Usuário não tem tipo_perfil definido");
      return [];
    }

    // Filtrar módulos baseado no perfil do usuário
    const filtered = allModules
      .map(category => ({
        ...category,
        modules: category.modules.filter(module => {
          // Se o módulo não tem profiles definido, todos têm acesso
          if (!module.profiles || module.profiles.length === 0) {
            console.log(`Módulo ${module.title} - SEM restrição de perfil - acesso liberado`);
            return true;
          }
          
          // Se o módulo tem profiles definido, verificar se o perfil do usuário está na lista
          const hasAccess = module.profiles.includes(perfil);
          console.log(`Módulo ${module.title} - perfis permitidos:`, module.profiles, "- perfil do usuário:", perfil, "- tem acesso:", hasAccess);
          return hasAccess;
        })
      }))
      .filter(category => category.modules.length > 0);

    console.log("====================================");
    console.log("RESULTADO FINAL - Módulos filtrados para o perfil", perfil, ":", filtered.length, "categorias");
    console.log("Categorias retornadas:", filtered.map(c => c.category));
    console.log("====================================");
    return filtered;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: theme.bg }}>
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p style={{ color: theme.textMuted }}>Carregando módulos...</p>
        </div>
      </div>
    );
  }

  // Verificar cadastro incompleto para não-admins
  if (user && user.role !== "admin" && !user.tipo_perfil) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6" style={{ backgroundColor: theme.bg }}>
        <Card style={{ backgroundColor: isDark ? '#1e293b' : '#ffffff', borderColor: isDark ? '#334155' : '#e5e7eb' }}>
          <CardContent className="p-8 text-center max-w-md">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-orange-600" />
            </div>
            <h2 className="text-xl font-bold mb-3" style={{ color: theme.text }}>
              Cadastro Incompleto
            </h2>
            <p className="text-sm mb-6" style={{ color: theme.textMuted }}>
              Para acessar os módulos do sistema, você precisa completar seu cadastro definindo seu tipo de perfil.
            </p>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <p className="text-xs font-semibold text-yellow-800 mb-2">Dados Faltantes:</p>
              <ul className="text-xs text-yellow-700 text-left space-y-1">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-yellow-600 rounded-full" />
                  Tipo de Perfil (Operador, Fornecedor ou Cliente)
                </li>
              </ul>
            </div>
            <Button 
              onClick={() => window.location.reload()}
              className="bg-blue-600 hover:bg-blue-700 w-full"
            >
              Completar Cadastro
            </Button>
            <Button 
              variant="outline"
              onClick={() => base44.auth.logout()}
              className="mt-3 w-full"
            >
              Fazer Logout
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const modules = getModulesForUser();
  const isAdmin = user?.role === "admin";
  const dadosFaltantes = verificarDadosFaltantes(user);
  const temDadosFaltantes = dadosFaltantes.length > 0;

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: theme.bg }}>
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold mb-2" style={{ color: theme.text }}>
                Bem-vindo ao Sistema de Gestão Logística
              </h1>
              <p className="text-lg" style={{ color: theme.textMuted }}>
                Selecione um módulo abaixo para começar
              </p>
            </div>
            <Button
              onClick={() => setShowMeuPerfilModal(true)}
              variant={temDadosFaltantes ? "default" : "outline"}
              className={`flex items-center gap-2 relative ${temDadosFaltantes ? 'bg-orange-600 hover:bg-orange-700 text-white animate-pulse' : ''}`}
            >
              <UserCog className="w-4 h-4" />
              {temDadosFaltantes ? "Completar Perfil" : "Meu Perfil"}
              {temDadosFaltantes && (
                <Badge className="ml-1 bg-red-600 text-white h-5 min-w-[20px] px-1.5 text-[10px]">
                  !
                </Badge>
              )}
            </Button>
          </div>
        </div>

        {temDadosFaltantes ? (
          <div className="flex items-center justify-center py-16">
            <Card style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }} className="max-w-2xl w-full">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Settings className="w-8 h-8 text-orange-600" />
                </div>
                <h3 className="text-xl font-bold mb-2 text-center" style={{ color: theme.text }}>
                  Complete seu Cadastro
                </h3>
                <p className="text-sm mb-6 text-center" style={{ color: theme.textMuted }}>
                  Para acessar o sistema, precisamos de algumas informações adicionais:
                </p>
                
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-6">
                  <h4 className="font-semibold text-sm mb-2" style={{ color: theme.text }}>
                    Dados Necessários:
                  </h4>
                  <ul className="space-y-1">
                    {dadosFaltantes.map((item) => (
                      <li key={item.campo} className="text-sm flex items-center gap-2" style={{ color: theme.textMuted }}>
                        <span className="w-1.5 h-1.5 bg-orange-500 rounded-full" />
                        {item.label}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="text-center">
                  <p className="text-sm mb-4" style={{ color: theme.textMuted }}>
                    Entre em contato com o administrador do sistema para que ele complete seu cadastro com as informações necessárias, ou clique no botão "Completar Perfil" no menu superior.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : modules.length === 0 ? (
          <div className="flex items-center justify-center py-16">
            <Card style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }} className="max-w-md">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <LayoutDashboard className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold mb-2" style={{ color: theme.text }}>
                  Nenhum módulo disponível
                </h3>
                <p className="text-sm" style={{ color: theme.textMuted }}>
                  Seu perfil atual não tem acesso a nenhum módulo do sistema. 
                  Entre em contato com o administrador.
                </p>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="space-y-8">
            {modules.map((category) => (
              <div key={category.category}>
                <div className="flex items-center gap-2 mb-4">
                  <Activity className="w-5 h-5" style={{ color: theme.textMuted }} />
                  <h2 className="text-xl font-bold" style={{ color: theme.text }}>
                    {category.category}
                  </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {category.modules.map((module) => (
                    <ModuleCard
                      key={module.title}
                      title={module.title}
                      description={module.description}
                      icon={module.icon}
                      url={module.url}
                      color={module.color}
                      badge={module.badge}
                      isDark={isDark}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showMeuPerfilModal && user && (
        <MeuPerfilModal
          open={showMeuPerfilModal}
          onClose={() => setShowMeuPerfilModal(false)}
          user={user}
          onSuccess={() => window.location.reload()}
        />
      )}
    </div>
  );
}