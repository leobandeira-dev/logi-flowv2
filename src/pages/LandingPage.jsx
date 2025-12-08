import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Truck,
  Workflow,
  BarChart3,
  CheckCircle2,
  Clock,
  Users,
  Shield,
  Zap,
  FileText,
  ArrowRight,
  Mail,
  Phone,
  Sparkles,
  TrendingUp,
  Menu,
  X,
  LogIn,
  UserPlus,
  MessageCircle,
  Globe,
  RefreshCw,
  Target,
  Award,
  PlayCircle,
  Package,
  Navigation,
  Settings,
  Eye,
  Filter,
  XCircle
} from "lucide-react";
import { toast } from "sonner";
import { createPageUrl } from "@/utils";

export default function LandingPage() {
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    telefone: "",
    empresa: "",
    plano: "",
    mensagem: ""
  });
  const [enviando, setEnviando] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const metodologias = [
    {
      sigla: "BPMN",
      nome: "Business Process Model and Notation",
      cor: "from-blue-600 to-blue-700",
      icone: Workflow,
      definicao: "Metodologia de modelagem de processos de negócio que permite mapear, visualizar e otimizar fluxos de trabalho de forma padronizada.",
      aplicacao: [
        {
          modulo: "Fluxo de Processos",
          implementacao: "Etapas configuráveis representam cada atividade do processo (Gateway, Task, Event)",
          beneficio: "Gestores configuram workflows customizados sem código, com prazos SLA e campos específicos por etapa"
        },
        {
          modulo: "Timeline Visual",
          implementacao: "Matriz interativa (Ordens × Etapas) mostra status em tempo real",
          beneficio: "Identificação instantânea de gargalos e processos travados"
        },
        {
          modulo: "Kanban por Etapa",
          implementacao: "Cards organizados em colunas representando cada stage do processo",
          beneficio: "Drag-and-drop para mover ordens entre etapas (WIP limits configuráveis no futuro)"
        }
      ]
    },
    {
      sigla: "PDCA",
      nome: "Plan-Do-Check-Act",
      cor: "from-green-600 to-green-700",
      icone: RefreshCw,
      definicao: "Ciclo de melhoria contínua que promove análise, execução, verificação e ação corretiva em processos operacionais.",
      aplicacao: [
        {
          modulo: "PLAN - Configurações",
          implementacao: "Admin define etapas, prazos SLA, metas de qualidade e produtividade",
          beneficio: "Planejamento estruturado antes da execução, baseado em dados históricos"
        },
        {
          modulo: "DO - Execução Operacional",
          implementacao: "Equipe executa processos (criação de ordens, tracking, resolução de ocorrências)",
          beneficio: "Ações rastreadas automaticamente, timestamps precisos, evidências anexadas"
        },
        {
          modulo: "CHECK - Gamificação e SLA",
          implementacao: "Sistema calcula SLA mensal, rankings, compara com metas e média da empresa",
          beneficio: "Métricas objetivas para avaliar performance individual e coletiva"
        },
        {
          modulo: "ACT - Expurgo e Ajustes",
          implementacao: "Gestores podem expurgar medições injustas (com auditoria) e reconfigurar processos",
          beneficio: "Correções baseadas em análise de dados, fechando o ciclo de melhoria"
        }
      ]
    },
    {
      sigla: "5S",
      nome: "Seiri, Seiton, Seiso, Seiketsu, Shitsuke",
      cor: "from-purple-600 to-purple-700",
      icone: CheckCircle2,
      definicao: "Programa de organização do ambiente de trabalho focado em eliminar desperdícios e padronizar operações.",
      aplicacao: [
        {
          modulo: "SEIRI (Utilização) - Filtros Inteligentes",
          implementacao: "Busca avançada e filtros multi-critério em todas as telas (Dashboard, Tracking, Fluxo)",
          beneficio: "Usuários encontram apenas dados relevantes, eliminando informação desnecessária"
        },
        {
          modulo: "SEITON (Organização) - Estrutura Modular",
          implementacao: "7 módulos separados com responsabilidades claras (Dashboard, Tracking, Fluxo, Ocorrências, etc.)",
          beneficio: "Cada coisa em seu lugar, navegação intuitiva, zero confusão"
        },
        {
          modulo: "SEISO (Limpeza) - UI/UX Limpo",
          implementacao: "Interface minimalista, cores consistentes, espaçamentos adequados, dark mode",
          beneficio: "Ambiente de trabalho digital limpo reduz fadiga visual e aumenta foco"
        },
        {
          modulo: "SEIKETSU (Padronização) - Templates",
          implementacao: "Formulários padronizados, badges com cores semânticas, status unificados",
          beneficio: "Todos seguem o mesmo padrão, reduzindo curva de aprendizado"
        },
        {
          modulo: "SHITSUKE (Disciplina) - Gamificação",
          implementacao: "Sistema de pontos, níveis e rankings incentiva boas práticas diárias",
          beneficio: "Cultura de autodisciplina através de recompensas e reconhecimento"
        }
      ]
    }
  ];

  const funcionalidadesDetalhadas = [
    {
      titulo: "Dashboard - Torre de Controle",
      icone: BarChart3,
      cor: "blue",
      bpmn: "Gateway de decisão: visualiza métricas e escolhe foco de atenção",
      pdca: "CHECK: Verifica SLA, performance e identifica desvios",
      cinco_s: "SEIRI: Filtros mostram apenas dados relevantes do período"
    },
    {
      titulo: "Ordens de Carregamento",
      icone: FileText,
      cor: "green",
      bpmn: "Start Event: Inicia processo ao criar ordem completa ou oferta",
      pdca: "DO: Executa o planejamento logístico com dados estruturados",
      cinco_s: "SEIKETSU: Templates padronizados (oferta, ordem completa, lote)"
    },
    {
      titulo: "Tracking Logístico",
      icone: Navigation,
      cor: "purple",
      bpmn: "Sequence Flow: 10 status representam fluxo sequencial da viagem",
      pdca: "DO: Executa tracking com timestamps precisos e evidências",
      cinco_s: "SEISO: Planilha editável com auto-save mantém dados limpos"
    },
    {
      titulo: "Fluxo (Workflow BPMN)",
      icone: Workflow,
      cor: "indigo",
      bpmn: "Core do sistema: Tasks, Gateways, Events totalmente configuráveis",
      pdca: "PLAN: Define processos, prazos e requisitos antes da execução",
      cinco_s: "SEITON: Timeline organiza visualmente todas as etapas"
    },
    {
      titulo: "Gestão de Ocorrências",
      icone: Shield,
      cor: "orange",
      bpmn: "Error Event: Captura desvios e bloqueia fluxo até resolução",
      pdca: "CHECK: Mede impacto de problemas no SLA e qualidade",
      cinco_s: "SEIRI: Categorização (tracking/fluxo/tarefa) separa o essencial"
    },
    {
      titulo: "Gamificação e SLA",
      icone: Award,
      cor: "yellow",
      bpmn: "End Event: Cada processo concluído gera pontos e atualiza métricas",
      pdca: "CHECK: Fórmula 60% Qualidade + 40% Produtividade = SLA Final",
      cinco_s: "SHITSUKE: Rankings incentivam disciplina e boas práticas diárias"
    },
    {
      titulo: "App Motorista",
      icone: Users,
      cor: "teal",
      bpmn: "User Task: Motorista executa atividades (atualizar status, enviar foto)",
      pdca: "DO: Coleta dados em campo para verificação posterior",
      cinco_s: "SEISO: Interface simples e limpa para uso durante viagem"
    }
  ];

  const beneficiosMetodologicos = [
    {
      icone: Workflow,
      titulo: "BPMN em Ação",
      descricao: "Processos mapeados visualmente, prazos rastreáveis, gargalos identificados automaticamente",
      estatistica: "+42%",
      metrica: "Eficiência Operacional"
    },
    {
      icone: RefreshCw,
      titulo: "PDCA Contínuo",
      descricao: "Ciclo de melhoria em cada processo: planeje, execute, verifique, corrija",
      estatistica: "95%+",
      metrica: "SLA Médio Alcançado"
    },
    {
      icone: CheckCircle2,
      titulo: "5S Digital",
      descricao: "Organização, padronização e disciplina aplicados na interface e processos",
      estatistica: "-68%",
      metrica: "Redução de Erros"
    }
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.nome || !formData.email || !formData.telefone) {
      toast.error("Preencha os campos obrigatórios");
      return;
    }

    setEnviando(true);

    try {
      const emailBody = `
Nova Solicitação de Interesse - Log Flow

Nome: ${formData.nome}
Email: ${formData.email}
Telefone: ${formData.telefone}
Empresa: ${formData.empresa || "Não informado"}
Plano de Interesse: ${formData.plano || "Não especificado"}

Mensagem:
${formData.mensagem || "Não informado"}

---
Enviado via Landing Page - ${new Date().toLocaleString('pt-BR')}
      `;

      await base44.integrations.Core.SendEmail({
        to: "leonardobandeira@laflogistica.com.br",
        subject: `🚛 Nova Solicitação de Interesse - ${formData.nome}`,
        body: emailBody
      });

      toast.success("Interesse enviado com sucesso! Entraremos em contato em breve.");
      
      setFormData({
        nome: "",
        email: "",
        telefone: "",
        empresa: "",
        plano: "",
        mensagem: ""
      });
    } catch (error) {
      console.error("Erro ao enviar interesse:", error);
      toast.error("Erro ao enviar. Tente novamente ou entre em contato diretamente.");
    } finally {
      setEnviando(false);
    }
  };

  const handleLogin = () => {
    base44.auth.redirectToLogin(window.location.origin);
  };

  const handleCadastro = () => {
    window.location.href = `${window.location.origin}/auth/register`;
  };

  const scrollToSection = (sectionId) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSAC = () => {
    window.location.href = createPageUrl("SAC");
  };

  const handlePortalCliente = () => {
    window.location.href = createPageUrl("PortalTransul");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Header/Navbar */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
                <Truck className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="font-bold text-xl text-gray-900">Log Flow</div>
                <div className="text-xs text-gray-500">BPMN • PDCA • 5S</div>
              </div>
            </div>

            <nav className="hidden md:flex items-center gap-8">
              <button onClick={() => scrollToSection('metodologias')} className="text-gray-600 hover:text-blue-600 transition-colors font-medium">
                Metodologias
              </button>
              <button onClick={() => scrollToSection('funcionalidades')} className="text-gray-600 hover:text-blue-600 transition-colors font-medium">
                Funcionalidades
              </button>
              <button onClick={() => scrollToSection('planos')} className="text-gray-600 hover:text-blue-600 transition-colors font-medium">
                Planos
              </button>
              <button onClick={() => scrollToSection('contato')} className="text-gray-600 hover:text-blue-600 transition-colors font-medium">
                Contato
              </button>
            </nav>

            <div className="hidden md:flex items-center gap-3">
              <Button variant="outline" onClick={handleLogin} className="flex items-center gap-2">
                <LogIn className="w-4 h-4" />
                Entrar
              </Button>
              <Button onClick={handleCadastro} className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2">
                <UserPlus className="w-4 h-4" />
                Cadastrar
              </Button>
            </div>

            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors">
              {mobileMenuOpen ? <X className="w-6 h-6 text-gray-600" /> : <Menu className="w-6 h-6 text-gray-600" />}
            </button>
          </div>

          {mobileMenuOpen && (
            <div className="md:hidden mt-4 pb-4 border-t border-gray-200 pt-4">
              <nav className="flex flex-col gap-4">
                <button onClick={() => scrollToSection('metodologias')} className="text-left text-gray-600 hover:text-blue-600 transition-colors font-medium py-2">
                  Metodologias
                </button>
                <button onClick={() => scrollToSection('funcionalidades')} className="text-left text-gray-600 hover:text-blue-600 transition-colors font-medium py-2">
                  Funcionalidades
                </button>
                <button onClick={() => scrollToSection('planos')} className="text-left text-gray-600 hover:text-blue-600 transition-colors font-medium py-2">
                  Planos
                </button>
                <button onClick={() => scrollToSection('contato')} className="text-left text-gray-600 hover:text-blue-600 transition-colors font-medium py-2">
                  Contato
                </button>
                <div className="flex flex-col gap-2 pt-4 border-t border-gray-200">
                  <Button variant="outline" onClick={handleLogin} className="w-full flex items-center justify-center gap-2">
                    <LogIn className="w-4 h-4" />
                    Entrar
                  </Button>
                  <Button onClick={handleCadastro} className="w-full bg-blue-600 hover:bg-blue-700 flex items-center justify-center gap-2">
                    <UserPlus className="w-4 h-4" />
                    Cadastrar
                  </Button>
                </div>
              </nav>
            </div>
          )}
        </div>
      </header>

      <div className="h-20 md:h-24"></div>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-800 text-white">
        <div className="absolute inset-0 bg-grid-white/10 bg-[size:20px_20px]" />
        <div className="absolute inset-0 bg-gradient-to-t from-blue-900/50" />
        
        <div className="relative max-w-7xl mx-auto px-6 py-24 lg:py-32">
          <div className="text-center max-w-5xl mx-auto">
            <Badge className="mb-6 bg-white/20 text-white border-white/30 hover:bg-white/30 text-base px-4 py-2">
              <Sparkles className="w-4 h-4 mr-2" />
              Gestão Logística Inteligente com BPMN, PDCA e 5S
            </Badge>
            
            <h1 className="text-5xl lg:text-7xl font-bold mb-6 leading-tight">
              Torre de Controle Logístico
              <span className="block text-blue-200 mt-3">Baseada em Metodologias de Excelência</span>
            </h1>
            
            <p className="text-xl lg:text-2xl text-blue-100 mb-12 leading-relaxed max-w-4xl mx-auto">
              Transforme sua operação com processos estruturados (BPMN), melhoria contínua (PDCA) 
              e organização sistemática (5S). A única plataforma que une tecnologia e metodologia.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50 text-lg px-8 py-6" onClick={() => scrollToSection('metodologias')}>
                Conhecer Metodologias
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 text-lg px-8 py-6" onClick={() => scrollToSection('contato')}>
                Solicitar Demo
              </Button>
            </div>

            <div className="mt-16 grid grid-cols-3 gap-12 max-w-3xl mx-auto">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <Workflow className="w-12 h-12 mx-auto mb-3" />
                <div className="text-3xl font-bold mb-1">BPMN</div>
                <div className="text-sm text-blue-200">Processos Visuais</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <RefreshCw className="w-12 h-12 mx-auto mb-3" />
                <div className="text-3xl font-bold mb-1">PDCA</div>
                <div className="text-sm text-blue-200">Melhoria Contínua</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <CheckCircle2 className="w-12 h-12 mx-auto mb-3" />
                <div className="text-3xl font-bold mb-1">5S</div>
                <div className="text-sm text-blue-200">Organização Total</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Metodologias Section */}
      <section id="metodologias" className="py-24 px-6 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-blue-600 text-white text-base px-4 py-2">Metodologias Aplicadas</Badge>
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Fundamentos de Excelência Operacional
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Cada funcionalidade do Log Flow foi projetada com base em metodologias comprovadas da indústria
            </p>
          </div>

          <div className="space-y-12">
            {metodologias.map((met, index) => (
              <Card key={index} className="border-2 border-gray-200 shadow-xl overflow-hidden">
                <div className={`bg-gradient-to-r ${met.cor} p-6 text-white`}>
                  <div className="flex items-center gap-4 mb-3">
                    <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center border-2 border-white/40">
                      <met.icone className="w-10 h-10" />
                    </div>
                    <div>
                      <h3 className="text-3xl font-bold">{met.sigla}</h3>
                      <p className="text-lg opacity-90">{met.nome}</p>
                    </div>
                  </div>
                  <p className="text-base leading-relaxed bg-white/10 p-4 rounded-lg border border-white/20">
                    {met.definicao}
                  </p>
                </div>
                <CardContent className="p-8">
                  <h4 className="font-bold text-xl text-gray-900 mb-6 flex items-center gap-2">
                    <Zap className="w-6 h-6 text-orange-600" />
                    Como aplicamos no Log Flow:
                  </h4>
                  <div className="space-y-4">
                    {met.aplicacao.map((app, idx) => (
                      <div key={idx} className="bg-gray-50 p-5 rounded-xl border-2 border-gray-200">
                        <div className="flex items-start gap-3 mb-3">
                          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                            <span className="text-white font-bold">{idx + 1}</span>
                          </div>
                          <div className="flex-1">
                            <h5 className="font-bold text-lg text-gray-900 mb-2">{app.modulo}</h5>
                            <p className="text-sm text-gray-700 mb-2">
                              <strong className="text-blue-900">Implementação:</strong> {app.implementacao}
                            </p>
                            <p className="text-sm text-gray-700">
                              <strong className="text-green-900">Benefício:</strong> {app.beneficio}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Funcionalidades Detalhadas */}
      <section id="funcionalidades" className="py-24 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-purple-600 text-white text-base px-4 py-2">Funcionalidades</Badge>
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Cada Módulo, Uma Aplicação Prática
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Veja como BPMN, PDCA e 5S se integram em cada rotina do sistema
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {funcionalidadesDetalhadas.map((func, index) => (
              <Card key={index} className="border-2 border-gray-200 hover:border-blue-500 hover:shadow-2xl transition-all duration-300">
                <CardHeader className={`bg-gradient-to-br from-${func.cor}-50 to-${func.cor}-100 border-b-2`}>
                  <div className={`w-14 h-14 bg-gradient-to-br from-${func.cor}-600 to-${func.cor}-700 rounded-xl flex items-center justify-center mb-3 shadow-lg`}>
                    <func.icone className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="text-xl text-gray-900">{func.titulo}</CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-600">
                    <div className="flex items-center gap-2 mb-2">
                      <Workflow className="w-5 h-5 text-blue-600" />
                      <span className="font-bold text-sm text-blue-900">BPMN</span>
                    </div>
                    <p className="text-xs text-gray-700">{func.bpmn}</p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-600">
                    <div className="flex items-center gap-2 mb-2">
                      <RefreshCw className="w-5 h-5 text-green-600" />
                      <span className="font-bold text-sm text-green-900">PDCA</span>
                    </div>
                    <p className="text-xs text-gray-700">{func.pdca}</p>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg border-l-4 border-purple-600">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle2 className="w-5 h-5 text-purple-600" />
                      <span className="font-bold text-sm text-purple-900">5S</span>
                    </div>
                    <p className="text-xs text-gray-700">{func.cinco_s}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefícios Metodológicos */}
      <section className="py-24 px-6 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 text-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold mb-6">
              Resultados Comprovados com Metodologias de Excelência
            </h2>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              Empresas que implementaram BPMN, PDCA e 5S em processos logísticos alcançaram resultados extraordinários
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {beneficiosMetodologicos.map((ben, index) => (
              <div key={index} className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border-2 border-white/20 hover:bg-white/20 transition-all">
                <ben.icone className="w-16 h-16 mb-6" />
                <h3 className="text-2xl font-bold mb-3">{ben.titulo}</h3>
                <p className="text-base text-blue-100 mb-6 leading-relaxed">{ben.descricao}</p>
                <div className="bg-white/20 rounded-xl p-4 border border-white/30">
                  <div className="text-5xl font-bold mb-2">{ben.estatistica}</div>
                  <div className="text-sm opacity-90">{ben.metrica}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PDCA Visual Cycle */}
      <section className="py-24 px-6 bg-gradient-to-br from-gray-50 to-green-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-green-600 text-white text-base px-4 py-2">Ciclo PDCA Aplicado</Badge>
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Melhoria Contínua em Cada Processo
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              O sistema implementa naturalmente o ciclo Plan-Do-Check-Act em toda operação
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="bg-gradient-to-br from-blue-600 to-blue-700 text-white border-4 border-blue-800 shadow-2xl">
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center border-2 border-white/40 text-2xl font-bold">
                    P
                  </div>
                  <div>
                    <CardTitle className="text-3xl text-white">PLAN (Planejar)</CardTitle>
                    <p className="text-blue-100 mt-1">Configuração Estratégica</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-3">
                  <Settings className="w-5 h-5 flex-shrink-0 mt-1" />
                  <span>Configurar etapas do fluxo com prazos SLA</span>
                </div>
                <div className="flex items-start gap-3">
                  <Target className="w-5 h-5 flex-shrink-0 mt-1" />
                  <span>Definir metas de qualidade e produtividade</span>
                </div>
                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 flex-shrink-0 mt-1" />
                  <span>Cadastrar tipos de ocorrências e gravidades</span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-600 to-green-700 text-white border-4 border-green-800 shadow-2xl">
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center border-2 border-white/40 text-2xl font-bold">
                    D
                  </div>
                  <div>
                    <CardTitle className="text-3xl text-white">DO (Fazer)</CardTitle>
                    <p className="text-green-100 mt-1">Execução Operacional</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-3">
                  <FileText className="w-5 h-5 flex-shrink-0 mt-1" />
                  <span>Criar ordens e alocar recursos</span>
                </div>
                <div className="flex items-start gap-3">
                  <PlayCircle className="w-5 h-5 flex-shrink-0 mt-1" />
                  <span>Executar etapas do processo</span>
                </div>
                <div className="flex items-start gap-3">
                  <Navigation className="w-5 h-5 flex-shrink-0 mt-1" />
                  <span>Rastrear viagens e atualizar status</span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-600 to-orange-700 text-white border-4 border-orange-800 shadow-2xl">
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center border-2 border-white/40 text-2xl font-bold">
                    C
                  </div>
                  <div>
                    <CardTitle className="text-3xl text-white">CHECK (Verificar)</CardTitle>
                    <p className="text-orange-100 mt-1">Análise de Performance</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-3">
                  <BarChart3 className="w-5 h-5 flex-shrink-0 mt-1" />
                  <span>Analisar SLA mensal e rankings</span>
                </div>
                <div className="flex items-start gap-3">
                  <TrendingUp className="w-5 h-5 flex-shrink-0 mt-1" />
                  <span>Comparar com metas e média da empresa</span>
                </div>
                <div className="flex items-start gap-3">
                  <Eye className="w-5 h-5 flex-shrink-0 mt-1" />
                  <span>Identificar desvios e oportunidades</span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-600 to-purple-700 text-white border-4 border-purple-800 shadow-2xl">
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center border-2 border-white/40 text-2xl font-bold">
                    A
                  </div>
                  <div>
                    <CardTitle className="text-3xl text-white">ACT (Agir)</CardTitle>
                    <p className="text-purple-100 mt-1">Correção e Melhoria</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-3">
                  <Settings className="w-5 h-5 flex-shrink-0 mt-1" />
                  <span>Ajustar configurações de processos</span>
                </div>
                <div className="flex items-start gap-3">
                  <XCircle className="w-5 h-5 flex-shrink-0 mt-1" />
                  <span>Expurgar medições com auditoria</span>
                </div>
                <div className="flex items-start gap-3">
                  <RefreshCw className="w-5 h-5 flex-shrink-0 mt-1" />
                  <span>Reiniciar ciclo de melhoria contínua</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* 5S Applied */}
      <section className="py-24 px-6 bg-gradient-to-br from-purple-50 to-pink-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-purple-600 text-white text-base px-4 py-2">Programa 5S Digital</Badge>
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Organização e Padronização em Cada Detalhe
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Os 5 sensos japoneses aplicados à gestão de informação e processos digitais
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <Card className="border-2 border-red-500 hover:shadow-2xl transition-all">
              <CardHeader className="bg-gradient-to-br from-red-600 to-red-700 text-white">
                <div className="text-4xl mb-2">1️⃣</div>
                <CardTitle className="text-lg">SEIRI</CardTitle>
                <p className="text-sm text-red-100">Utilização</p>
              </CardHeader>
              <CardContent className="p-4">
                <p className="text-xs text-gray-700 mb-3 font-semibold">No sistema:</p>
                <ul className="text-xs text-gray-600 space-y-2">
                  <li className="flex items-start gap-2">
                    <Filter className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                    <span>Filtros avançados em todas as telas</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Eye className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                    <span>Apenas dados relevantes visíveis</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-2 border-blue-500 hover:shadow-2xl transition-all">
              <CardHeader className="bg-gradient-to-br from-blue-600 to-blue-700 text-white">
                <div className="text-4xl mb-2">2️⃣</div>
                <CardTitle className="text-lg">SEITON</CardTitle>
                <p className="text-sm text-blue-100">Organização</p>
              </CardHeader>
              <CardContent className="p-4">
                <p className="text-xs text-gray-700 mb-3 font-semibold">No sistema:</p>
                <ul className="text-xs text-gray-600 space-y-2">
                  <li className="flex items-start gap-2">
                    <Package className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                    <span>7 módulos separados e organizados</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Workflow className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                    <span>Timeline visual clara</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-2 border-green-500 hover:shadow-2xl transition-all">
              <CardHeader className="bg-gradient-to-br from-green-600 to-green-700 text-white">
                <div className="text-4xl mb-2">3️⃣</div>
                <CardTitle className="text-lg">SEISO</CardTitle>
                <p className="text-sm text-green-100">Limpeza</p>
              </CardHeader>
              <CardContent className="p-4">
                <p className="text-xs text-gray-700 mb-3 font-semibold">No sistema:</p>
                <ul className="text-xs text-gray-600 space-y-2">
                  <li className="flex items-start gap-2">
                    <Sparkles className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>Interface limpa e moderna</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <RefreshCw className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>Dados sempre atualizados</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-2 border-yellow-500 hover:shadow-2xl transition-all">
              <CardHeader className="bg-gradient-to-br from-yellow-600 to-yellow-700 text-white">
                <div className="text-4xl mb-2">4️⃣</div>
                <CardTitle className="text-lg">SEIKETSU</CardTitle>
                <p className="text-sm text-yellow-100">Padronização</p>
              </CardHeader>
              <CardContent className="p-4">
                <p className="text-xs text-gray-700 mb-3 font-semibold">No sistema:</p>
                <ul className="text-xs text-gray-600 space-y-2">
                  <li className="flex items-start gap-2">
                    <FileText className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <span>Templates de processos</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <span>Fluxos replicáveis</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-2 border-purple-500 hover:shadow-2xl transition-all">
              <CardHeader className="bg-gradient-to-br from-purple-600 to-purple-700 text-white">
                <div className="text-4xl mb-2">5️⃣</div>
                <CardTitle className="text-lg">SHITSUKE</CardTitle>
                <p className="text-sm text-purple-100">Autodisciplina</p>
              </CardHeader>
              <CardContent className="p-4">
                <p className="text-xs text-gray-700 mb-3 font-semibold">No sistema:</p>
                <ul className="text-xs text-gray-600 space-y-2">
                  <li className="flex items-start gap-2">
                    <Award className="w-4 h-4 text-purple-600 flex-shrink-0 mt-0.5" />
                    <span>Gamificação incentiva boas práticas</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <TrendingUp className="w-4 h-4 text-purple-600 flex-shrink-0 mt-0.5" />
                    <span>Rankings mensais</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Banner SAC */}
      <section className="py-16 bg-gradient-to-r from-green-500 to-emerald-600">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="text-white flex-1">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center">
                  <MessageCircle className="w-8 h-8 text-green-600" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold">Assistente Virtual SAC</h2>
                  <p className="text-green-100 text-lg">Atendimento inteligente 24/7</p>
                </div>
              </div>
              <p className="text-lg text-green-50 mb-6 leading-relaxed">
                Consulte status de cargas, tire dúvidas e receba informações instantâneas 
                através do nosso assistente virtual com IA
              </p>
              <div className="flex flex-wrap gap-3">
                <Button onClick={handleSAC} size="lg" className="bg-white text-green-600 hover:bg-green-50 font-bold">
                  <MessageCircle className="w-5 h-5 mr-2" />
                  Abrir Chat
                </Button>
                <Button onClick={handlePortalCliente} size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-green-600">
                  <Globe className="w-5 h-5 mr-2" />
                  Portal do Cliente
                </Button>
              </div>
            </div>

            <Card className="bg-white/10 backdrop-blur border-white/20 max-w-md">
              <CardContent className="p-6 text-white">
                <h3 className="font-bold text-lg mb-4">💬 O que o assistente pode fazer:</h3>
                <ul className="space-y-3 text-sm">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <span>Consultar status e localização por CNPJ</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <span>Informar previsões de entrega</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <span>Verificar ocorrências reportadas</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <span>Histórico de entregas e estatísticas</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Planos Section */}
      <section id="planos" className="py-24 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-blue-600 text-white text-base px-4 py-2">Planos e Investimento</Badge>
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Escolha o plano ideal para seu negócio
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Soluções escaláveis para empresas de todos os portes, com suporte especializado
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <Card className="border-2 border-blue-200 hover:border-blue-500 hover:shadow-2xl transition-all">
              <CardHeader className="text-center pb-8 bg-gradient-to-br from-blue-50 to-blue-100">
                <CardTitle className="text-2xl mb-2">Starter</CardTitle>
                <CardDescription className="text-base mb-4">Ideal para pequenas operações</CardDescription>
                <div className="text-4xl font-bold text-blue-900">Sob Consulta</div>
              </CardHeader>
              <CardContent className="p-6">
                <ul className="space-y-3 mb-8">
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">Até 50 ordens/mês</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">2 usuários</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">Tracking básico</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">Dashboard simplificado</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">Suporte por email</span>
                  </li>
                </ul>
                <Button className="w-full bg-blue-600 hover:bg-blue-700" onClick={() => { setFormData(prev => ({ ...prev, plano: "Starter" })); scrollToSection('contato'); }}>
                  Solicitar Orçamento
                </Button>
              </CardContent>
            </Card>

            <Card className="border-2 border-purple-500 shadow-2xl scale-105 relative">
              <div className="absolute top-0 right-0 bg-purple-600 text-white px-4 py-1 text-sm font-bold rounded-bl-lg">
                MAIS POPULAR
              </div>
              <CardHeader className="text-center pb-8 bg-gradient-to-br from-purple-50 to-purple-100">
                <CardTitle className="text-2xl mb-2">Professional</CardTitle>
                <CardDescription className="text-base mb-4">Para empresas em crescimento</CardDescription>
                <div className="text-4xl font-bold text-purple-900">Sob Consulta</div>
              </CardHeader>
              <CardContent className="p-6">
                <ul className="space-y-3 mb-8">
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">Até 200 ordens/mês</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">5 usuários</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">Tracking avançado em tempo real</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">Dashboard completo + TV Mode</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">Fluxo BPMN + Gamificação</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">Chat com motoristas</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">Suporte prioritário</span>
                  </li>
                </ul>
                <Button className="w-full bg-purple-600 hover:bg-purple-700" onClick={() => { setFormData(prev => ({ ...prev, plano: "Professional" })); scrollToSection('contato'); }}>
                  Solicitar Orçamento
                </Button>
              </CardContent>
            </Card>

            <Card className="border-2 border-indigo-200 hover:border-indigo-500 hover:shadow-2xl transition-all">
              <CardHeader className="text-center pb-8 bg-gradient-to-br from-indigo-50 to-indigo-100">
                <CardTitle className="text-2xl mb-2">Enterprise</CardTitle>
                <CardDescription className="text-base mb-4">Solução completa e personalizada</CardDescription>
                <div className="text-4xl font-bold text-indigo-900">Sob Consulta</div>
              </CardHeader>
              <CardContent className="p-6">
                <ul className="space-y-3 mb-8">
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">Ordens ilimitadas</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">Usuários ilimitados</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">Múltiplas empresas (multi-tenant)</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">API e integrações customizadas</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">White-label disponível</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">Treinamento dedicado</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">Suporte 24/7 + Gerente de conta</span>
                  </li>
                </ul>
                <Button className="w-full bg-indigo-600 hover:bg-indigo-700" onClick={() => { setFormData(prev => ({ ...prev, plano: "Enterprise" })); scrollToSection('contato'); }}>
                  Solicitar Orçamento
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="text-center mt-12">
            <p className="text-gray-600 text-lg">
              Dúvidas sobre qual plano escolher?{" "}
              <button onClick={() => scrollToSection('contato')} className="text-blue-600 font-semibold hover:underline">
                Fale com nossa equipe
              </button>
            </p>
          </div>
        </div>
      </section>

      {/* Contato Section */}
      <section id="contato" className="py-24 px-6 bg-gradient-to-br from-gray-50 to-purple-50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-green-600 text-white text-base px-4 py-2">Entre em Contato</Badge>
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Solicite uma Demonstração
            </h2>
            <p className="text-xl text-gray-600">
              Preencha o formulário e nossa equipe entrará em contato em até 24h
            </p>
          </div>

          <Card className="border-2 shadow-2xl">
            <CardContent className="p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="nome">Nome Completo *</Label>
                    <Input
                      id="nome"
                      value={formData.nome}
                      onChange={(e) => handleInputChange("nome", e.target.value)}
                      placeholder="Seu nome"
                      required
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      placeholder="seu@email.com"
                      required
                      className="mt-1"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="telefone">Telefone/WhatsApp *</Label>
                    <Input
                      id="telefone"
                      value={formData.telefone}
                      onChange={(e) => handleInputChange("telefone", e.target.value)}
                      placeholder="(00) 00000-0000"
                      required
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="empresa">Empresa</Label>
                    <Input
                      id="empresa"
                      value={formData.empresa}
                      onChange={(e) => handleInputChange("empresa", e.target.value)}
                      placeholder="Nome da empresa"
                      className="mt-1"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="plano">Plano de Interesse</Label>
                  <select
                    id="plano"
                    value={formData.plano}
                    onChange={(e) => handleInputChange("plano", e.target.value)}
                    className="w-full mt-1 p-2 border rounded-lg"
                  >
                    <option value="">Selecione um plano</option>
                    <option value="Starter">Starter</option>
                    <option value="Professional">Professional</option>
                    <option value="Enterprise">Enterprise</option>
                    <option value="Outro">Outro / Não sei</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="mensagem">Mensagem</Label>
                  <Textarea
                    id="mensagem"
                    value={formData.mensagem}
                    onChange={(e) => handleInputChange("mensagem", e.target.value)}
                    placeholder="Conte-nos mais sobre suas necessidades..."
                    rows={4}
                    className="mt-1"
                  />
                </div>

                <Button type="submit" disabled={enviando} className="w-full bg-blue-600 hover:bg-blue-700 text-lg py-6">
                  {enviando ? (
                    <>
                      <Clock className="w-5 h-5 mr-2 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Mail className="w-5 h-5 mr-2" />
                      Enviar Solicitação
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          <div className="mt-12 grid md:grid-cols-2 gap-6">
            <Card className="border-2 border-gray-200 hover:shadow-xl transition-all">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Mail className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <div className="font-semibold text-gray-900 mb-1">Email</div>
                  <a href="mailto:leonardobandeira@laflogistica.com.br" className="text-blue-600 hover:underline">
                    leonardobandeira@laflogistica.com.br
                  </a>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-gray-200 hover:shadow-xl transition-all">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Phone className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <div className="font-semibold text-gray-900 mb-1">Suporte</div>
                  <div className="text-gray-600">Segunda a Sexta, 8h às 18h</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-gray-900 to-slate-900 text-white py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-12 mb-12">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <Truck className="w-7 h-7" />
                </div>
                <div>
                  <div className="font-bold text-2xl">Log Flow</div>
                  <div className="text-sm text-gray-400">Torre de Controle Logístico</div>
                </div>
              </div>
              <p className="text-gray-400 leading-relaxed">
                Transformando operações logísticas com tecnologia e metodologias de excelência.
              </p>
            </div>

            <div>
              <h3 className="font-bold text-lg mb-4">Metodologias</h3>
              <ul className="space-y-2 text-gray-400">
                <li className="flex items-center gap-2">
                  <Workflow className="w-4 h-4 text-blue-400" />
                  BPMN - Processos Visuais
                </li>
                <li className="flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 text-green-400" />
                  PDCA - Melhoria Contínua
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-purple-400" />
                  5S - Organização Digital
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold text-lg mb-4">Recursos</h3>
              <ul className="space-y-2 text-gray-400">
                <li>Dashboard Executivo</li>
                <li>Tracking em Tempo Real</li>
                <li>Workflow Configurável</li>
                <li>Gamificação e SLA</li>
                <li>App Motorista</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-400 text-sm">
              © {new Date().getFullYear()} Log Flow. Todos os direitos reservados.
            </p>
            <p className="text-gray-400 text-sm">
              Desenvolvido com ❤️ para revolucionar a logística brasileira
            </p>
          </div>
        </div>
      </footer>

      {/* Floating SAC Button */}
      <button
        onClick={handleSAC}
        className="fixed bottom-6 right-6 w-16 h-16 bg-green-600 hover:bg-green-700 text-white rounded-full shadow-2xl flex items-center justify-center transition-all hover:scale-110 z-50 animate-pulse"
        title="Falar com Assistente Virtual"
      >
        <MessageCircle className="w-7 h-7" />
      </button>
    </div>
  );
}