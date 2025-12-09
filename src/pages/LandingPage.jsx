import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Truck,
  MapPin,
  Workflow,
  BarChart3,
  CheckCircle2,
  Users,
  Shield,
  Zap,
  FileText,
  ArrowRight,
  Mail,
  Phone,
  Package,
  RefreshCw,
  Menu,
  X,
  MessageCircle,
  Globe
} from "lucide-react";
import { toast } from "sonner";
import { createPageUrl } from "@/utils";

export default function LandingPage() {
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    telefone: "",
    empresa: ""
  });
  const [enviando, setEnviando] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("visao-geral");

  const scrollToSection = (sectionId) => {
    setMobileMenuOpen(false);
    setActiveSection(sectionId);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleLogin = () => {
    base44.auth.redirectToLogin(window.location.origin);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.nome || !formData.email || !formData.telefone) {
      toast.error("Preencha os campos obrigatórios");
      return;
    }

    setEnviando(true);

    try {
      await base44.entities.Lead.create({
        razao_social: formData.empresa || formData.nome,
        responsavel_nome: formData.nome,
        responsavel_email: formData.email,
        responsavel_telefone: formData.telefone,
        status_funil: "lead",
        origem: "landing_page"
      });

      await base44.integrations.Core.SendEmail({
        to: "leonardobandeira@laflogistica.com.br",
        subject: `🚛 Nova Solicitação - ${formData.nome}`,
        body: `Nome: ${formData.nome}\nEmail: ${formData.email}\nTelefone: ${formData.telefone}\nEmpresa: ${formData.empresa || "Não informado"}`
      });

      toast.success("Solicitação enviada! Entraremos em contato em breve.");
      setFormData({ nome: "", email: "", telefone: "", empresa: "" });
    } catch (error) {
      console.error("Erro:", error);
      toast.error("Erro ao enviar. Tente novamente.");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Truck className="w-5 h-5 text-white" />
              </div>
              <div className="font-bold text-lg text-gray-900">Log Flow</div>
            </div>

            <nav className="hidden md:flex items-center gap-1">
              <button 
                onClick={() => scrollToSection('visao-geral')} 
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeSection === 'visao-geral' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:text-blue-600'}`}
              >
                Visão Geral
              </button>
              <button 
                onClick={() => scrollToSection('modulos')} 
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeSection === 'modulos' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:text-blue-600'}`}
              >
                Módulos
              </button>
              <button 
                onClick={() => scrollToSection('calculadora')} 
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeSection === 'calculadora' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:text-blue-600'}`}
              >
                Calculadora
              </button>
              <button 
                onClick={() => scrollToSection('funcionalidades')} 
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeSection === 'funcionalidades' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:text-blue-600'}`}
              >
                Funcionalidades
              </button>
            </nav>

            <div className="flex items-center gap-2">
              <Button variant="ghost" onClick={handleLogin} className="text-sm hidden md:flex">
                Entrar
              </Button>
              <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2">
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {mobileMenuOpen && (
            <div className="md:hidden mt-4 pb-4 border-t pt-4 space-y-2">
              <button onClick={() => scrollToSection('visao-geral')} className="block w-full text-left px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg">
                Visão Geral
              </button>
              <button onClick={() => scrollToSection('modulos')} className="block w-full text-left px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg">
                Módulos
              </button>
              <button onClick={() => scrollToSection('calculadora')} className="block w-full text-left px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg">
                Calculadora
              </button>
              <button onClick={() => scrollToSection('funcionalidades')} className="block w-full text-left px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg">
                Funcionalidades
              </button>
            </div>
          )}
        </div>
      </header>

      <div className="h-16"></div>

      {/* Hero Section */}
      <section id="visao-geral" className="py-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Pare de Perder Clientes
          </h1>
          
          <p className="text-xl text-gray-600 mb-4 max-w-3xl mx-auto">
            Enquanto seus concorrentes oferecem portais modernos e rastreamento em tempo real, você ainda usa planilhas?
          </p>
          <p className="text-xl font-semibold text-gray-900 mb-12">
            Seus clientes estão migrando para quem oferece mais transparência.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-16 max-w-xl mx-auto">
            <Input
              type="email"
              placeholder="Seu melhor email comercial"
              className="h-12 text-base"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
            <Button 
              size="lg" 
              className="bg-blue-600 hover:bg-blue-700 h-12 px-6"
              onClick={() => scrollToSection('contato')}
            >
              Solicitar Demonstração Gratuita
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>

          {/* Benefícios */}
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-50 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="font-bold text-lg text-gray-900 mb-2">
                100% Seguro e Confiável
              </h3>
              <p className="text-sm text-gray-600">
                Infraestrutura enterprise com backup automático e disponibilidade 99.9%
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-50 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Zap className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="font-bold text-lg text-gray-900 mb-2">
                Implementação em 24h
              </h3>
              <p className="text-sm text-gray-600">
                Sistema 100% nuvem. Sem instalação, sem complicação, sem demora
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-50 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="font-bold text-lg text-gray-900 mb-2">
                Suporte Especializado
              </h3>
              <p className="text-sm text-gray-600">
                30 dias de implementação com especialista dedicado + suporte contínuo
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Módulos */}
      <section id="modulos" className="py-20 px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Módulos do Sistema
            </h2>
            <p className="text-lg text-gray-600">
              Escolha os módulos que sua operação precisa. Comece com o básico e expanda conforme cresce.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <Card className="border-2 border-blue-200 bg-white">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-xl font-bold text-gray-900">Plataforma Base</h3>
                      <Badge className="bg-blue-600 text-white">Obrigatório</Badge>
                    </div>
                    <p className="text-sm text-gray-600">
                      Dashboard, Tracking, Ordens, Motoristas, Veículos, Operações
                    </p>
                  </div>
                  <p className="text-3xl font-bold text-blue-600">R$ 299</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    Dashboard operacional completo
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    Tracking logístico em tempo real
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    Gestão de recursos (motoristas/veículos)
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-gray-200 bg-white hover:border-blue-300 transition-colors">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-xl font-bold text-gray-900">Workflow & Qualidade</h3>
                      <Badge variant="outline">Opcional</Badge>
                    </div>
                    <p className="text-sm text-gray-600">
                      Processos customizáveis com métricas
                    </p>
                  </div>
                  <p className="text-3xl font-bold text-blue-600">R$ 149</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    Fluxo BPMN customizável
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    Gestão de ocorrências
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    Sistema de gamificação
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-gray-200 bg-white hover:border-blue-300 transition-colors">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-xl font-bold text-gray-900">WMS Completo</h3>
                      <Badge variant="outline">Opcional</Badge>
                    </div>
                    <p className="text-sm text-gray-600">
                      Gestão de armazém e expedição
                    </p>
                  </div>
                  <p className="text-3xl font-bold text-blue-600">R$ 199</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    Recebimento de NF-e
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    Etiquetas e unitização
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    Expedição e carregamento
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-gray-200 bg-white hover:border-blue-300 transition-colors">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-xl font-bold text-gray-900">Portal B2B</h3>
                      <Badge variant="outline">Opcional</Badge>
                    </div>
                    <p className="text-sm text-gray-600">
                      Self-service para clientes/fornecedores
                    </p>
                  </div>
                  <p className="text-3xl font-bold text-blue-600">R$ 149</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    Dashboard de coletas
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    Solicitação/aprovação
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    Rastreamento online
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Como Funciona */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Como Funciona o Log Flow
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <Card className="border border-gray-200 bg-white">
              <CardContent className="p-8">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
                    <FileText className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">💳 Assinatura do Software</h3>
                    <p className="text-sm text-gray-600">
                      Pague apenas pelos módulos que usar. Plataforma Base é obrigatória (R$ 299/mês), 
                      demais módulos são opcionais (R$ 149-199/mês cada).
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-gray-200 bg-white">
              <CardContent className="p-8">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center flex-shrink-0">
                    <BarChart3 className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">📊 Plano de Processamento</h3>
                    <p className="text-sm text-gray-600">
                      Baseado no volume de documentos mensais. Comece pequeno e escale conforme cresce.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Calculadora */}
      <section id="calculadora" className="py-20 px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Calculadora de Investimento
            </h2>
            <p className="text-lg text-gray-600">
              Descubra o investimento exato para sua operação
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Seleção */}
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-6">Selecione os Módulos</h3>
              <div className="space-y-4">
                <Card className="border-2 border-blue-200 bg-blue-50/30">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Package className="w-5 h-5 text-blue-600" />
                      <div>
                        <p className="font-semibold text-gray-900">Plataforma Base</p>
                        <p className="text-xs text-gray-600">Dashboard, Tracking e Ordens</p>
                      </div>
                    </div>
                    <p className="font-bold text-blue-600">R$ 299</p>
                  </CardContent>
                </Card>

                <Card className="border border-gray-200 bg-white">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Workflow className="w-5 h-5 text-gray-600" />
                      <div>
                        <p className="font-semibold text-gray-900">Workflow & Qualidade</p>
                        <p className="text-xs text-gray-600">Processos e gamificação</p>
                      </div>
                    </div>
                    <p className="font-bold text-gray-900">R$ 149</p>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Resumo */}
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-6">Resumo do Investimento</h3>
              <Card className="border-2 border-gray-200 bg-white">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-semibold text-gray-600 mb-3">Módulos Selecionados:</p>
                      <div className="flex items-center justify-between py-2">
                        <p className="text-sm text-gray-900">Plataforma Base</p>
                        <p className="font-semibold text-gray-900">R$ 299,00</p>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-gray-200">
                      <p className="text-sm font-semibold text-gray-600 mb-3">Plano de Processamento:</p>
                      <div className="flex items-center justify-between py-2">
                        <p className="text-sm text-gray-900">Inicial (até 1.000 docs)</p>
                        <p className="font-semibold text-gray-900">R$ 450,00</p>
                      </div>
                    </div>

                    <div className="pt-4 border-t-2 border-gray-900">
                      <div className="flex items-center justify-between">
                        <p className="text-lg font-bold text-gray-900">Total Mensal:</p>
                        <p className="text-3xl font-bold text-blue-600">R$ 749,00</p>
                      </div>
                    </div>

                    <Button 
                      className="w-full bg-blue-600 hover:bg-blue-700 mt-4"
                      onClick={() => scrollToSection('contato')}
                    >
                      Solicitar Proposta Comercial
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Funcionalidades */}
      <section id="funcionalidades" className="py-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Funcionalidades Avançadas
            </h2>
            <p className="text-lg text-gray-600">
              Descubra todas as funcionalidades que tornam o Log Flow a escolha ideal
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-6 mb-16">
            <Card className="border border-gray-200 bg-white">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-4">
                  <Package className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-bold text-lg text-gray-900 mb-3">Armazenagem</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Dashboard operacional</li>
                  <li>• Conferência de volumes</li>
                  <li>• Endereçamento dinâmico</li>
                  <li>• Checklist personalizado</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border border-gray-200 bg-white">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center mb-4">
                  <Truck className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="font-bold text-lg text-gray-900 mb-3">Coletas</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Solicitações online</li>
                  <li>• Rastreamento GPS</li>
                  <li>• Gestão de veículos</li>
                  <li>• Status em tempo real</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border border-gray-200 bg-white">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center mb-4">
                  <MapPin className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="font-bold text-lg text-gray-900 mb-3">Carregamento</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Ordem de carga otimizada</li>
                  <li>• Layout do caminhão</li>
                  <li>• Conferência fotográfica</li>
                  <li>• Documentação completa</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border border-gray-200 bg-white">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center mb-4">
                  <BarChart3 className="w-6 h-6 text-orange-600" />
                </div>
                <h3 className="font-bold text-lg text-gray-900 mb-3">Analytics</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Dashboard executivo</li>
                  <li>• Relatórios automatizados</li>
                  <li>• KPIs operacionais</li>
                  <li>• Análise de performance</li>
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Dashboard Preview */}
          <Card className="border-2 border-gray-200 bg-white">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">
                Dashboard em Tempo Real
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <p className="text-4xl font-bold text-blue-600 mb-2">1,247</p>
                  <p className="text-sm text-gray-600">Volumes Processados</p>
                  <p className="text-xs text-green-600 mt-1">+12% vs. mês anterior</p>
                </div>
                <div className="text-center">
                  <p className="text-4xl font-bold text-green-600 mb-2">98.5%</p>
                  <p className="text-sm text-gray-600">Taxa de Precisão</p>
                  <p className="text-xs text-green-600 mt-1">+2.3% vs. mês anterior</p>
                </div>
                <div className="text-center">
                  <p className="text-4xl font-bold text-purple-600 mb-2">2.1h</p>
                  <p className="text-sm text-gray-600">Tempo Médio</p>
                  <p className="text-xs text-green-600 mt-1">-15min vs. mês anterior</p>
                </div>
                <div className="text-center">
                  <p className="text-4xl font-bold text-orange-600 mb-2">47</p>
                  <p className="text-sm text-gray-600">Coletas Ativas</p>
                  <p className="text-xs text-blue-600 mt-1">Em tempo real</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Pronto para transformar sua operação logística?
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Junte-se a centenas de operadores que já automatizaram seus processos
          </p>
          <Button 
            size="lg"
            className="bg-blue-600 hover:bg-blue-700 text-lg px-8 h-14"
            onClick={() => scrollToSection('contato')}
          >
            Começar Agora Gratuitamente
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </section>

      {/* Contato */}
      <section id="contato" className="py-20 px-6 bg-white border-t border-gray-100">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">
              Solicite uma Demonstração
            </h2>
            <p className="text-base text-gray-600">
              Preencha o formulário e nossa equipe entrará em contato em até 24h
            </p>
          </div>

          <Card className="border border-gray-200 bg-white">
            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="nome" className="text-sm">Nome Completo *</Label>
                    <Input
                      id="nome"
                      value={formData.nome}
                      onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                      placeholder="Seu nome"
                      required
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="email" className="text-sm">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="seu@email.com"
                      required
                      className="mt-1"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="telefone" className="text-sm">Telefone *</Label>
                    <Input
                      id="telefone"
                      value={formData.telefone}
                      onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                      placeholder="(00) 00000-0000"
                      required
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="empresa" className="text-sm">Empresa</Label>
                    <Input
                      id="empresa"
                      value={formData.empresa}
                      onChange={(e) => setFormData({ ...formData, empresa: e.target.value })}
                      placeholder="Nome da empresa"
                      className="mt-1"
                    />
                  </div>
                </div>

                <Button type="submit" disabled={enviando} className="w-full bg-blue-600 hover:bg-blue-700 h-12">
                  {enviando ? "Enviando..." : "Solicitar Demonstração Gratuita"}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Truck className="w-5 h-5 text-white" />
                </div>
                <div className="font-bold text-lg">Log Flow</div>
              </div>
              <p className="text-sm text-gray-400">
                Plataforma logística integrada para operações de alta performance.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-sm mb-3 text-gray-300">Produto</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>Funcionalidades</li>
                <li>Preços</li>
                <li>API</li>
                <li>Integrações</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-sm mb-3 text-gray-300">Empresa</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>Sobre</li>
                <li>Blog</li>
                <li>Carreiras</li>
                <li>Contato</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-sm mb-3 text-gray-300">Suporte</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>Documentação</li>
                <li>Tutoriais</li>
                <li>Status</li>
                <li>Contato</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-6 text-center">
            <p className="text-sm text-gray-400">
              © {new Date().getFullYear()} Log Flow. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>

      {/* Floating SAC */}
      <button
        onClick={() => window.location.href = createPageUrl("SAC")}
        className="fixed bottom-6 right-6 w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-xl flex items-center justify-center transition-all hover:scale-105 z-50"
        title="Assistente Virtual"
      >
        <MessageCircle className="w-6 h-6" />
      </button>
    </div>
  );
}