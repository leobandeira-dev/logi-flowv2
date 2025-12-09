import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  Package,
  RefreshCw,
  Menu,
  X,
  MessageCircle,
  Calculator,
  Phone
} from "lucide-react";
import { toast } from "sonner";
import { createPageUrl } from "@/utils";

const PACOTE_BASE = {
  nome: "Pacote Base",
  preco: 299,
  descricao: "Núcleo essencial do sistema",
  modulos: [
    "Dashboard Executivo",
    "Ordens de Carregamento",
    "Tracking Logístico",
    "Gestão de Usuários",
    "Motoristas e Veículos",
    "Operações (Config SLA)",
    "Parceiros"
  ]
};

const ADDONS = [
  {
    id: "workflow_qualidade",
    nome: "Workflow & Qualidade",
    descricao: "Processos customizáveis com métricas de performance",
    preco: 149,
    icon: Workflow,
    modulos: [
      "Fluxo BPMN Customizável",
      "Gestão de Ocorrências",
      "Sistema de Gamificação"
    ]
  },
  {
    id: "wms_completo",
    nome: "WMS Completo",
    descricao: "Gestão completa de armazém e expedição",
    preco: 199,
    icon: Package,
    modulos: [
      "Recebimento de NF-e",
      "Gestão de Notas Fiscais",
      "Etiquetas Mãe (Unitização)",
      "Carregamento e Expedição",
      "Ordem de Entrega"
    ]
  },
  {
    id: "portal_b2b",
    nome: "Portal B2B",
    descricao: "Self-service para clientes e fornecedores",
    preco: 149,
    icon: Users,
    modulos: [
      "Dashboard Coletas",
      "Solicitar Coleta (Fornecedor)",
      "Aprovar Coletas (Cliente)"
    ]
  },
  {
    id: "comunicacao",
    nome: "Comunicação Avançada",
    descricao: "App móvel e atendimento com IA",
    preco: 99,
    icon: MessageCircle,
    modulos: [
      "App Motorista (SMS)",
      "SAC com Chatbot IA"
    ]
  }
];

const FAIXAS_PROCESSAMENTO = [
  { volume: 1000, preco: 450, nome: "Inicial" },
  { volume: 2500, preco: 950, nome: "Crescimento" },
  { volume: 5000, preco: 1450, nome: "Consolidado" },
  { volume: 10000, preco: 1950, nome: "Expansão" },
  { volume: 15000, preco: 2700, nome: "Enterprise" }
];

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("visao-geral");
  
  // Estados da calculadora
  const [addonsSelecionados, setAddonsSelecionados] = useState([]);
  const [volumeColetas, setVolumeColetas] = useState(0);
  const [volumeCarregamentos, setVolumeCarregamentos] = useState(0);
  const [volumeEntregas, setVolumeEntregas] = useState(0);
  const [volumeNotasFiscais, setVolumeNotasFiscais] = useState(0);
  const [precosCustomizados, setPrecosCustomizados] = useState(null);
  
  // Estados do formulário
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    telefone: "",
    empresa: ""
  });
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('precos_customizados');
    if (saved) {
      setPrecosCustomizados(JSON.parse(saved));
    }
  }, []);

  const obterPacoteBase = () => {
    if (precosCustomizados?.pacoteBase) {
      return { ...PACOTE_BASE, preco: precosCustomizados.pacoteBase };
    }
    return PACOTE_BASE;
  };

  const obterAddons = () => {
    if (!precosCustomizados?.addons) return ADDONS;
    return ADDONS.map(addon => ({
      ...addon,
      preco: precosCustomizados.addons[addon.id] || addon.preco
    }));
  };

  const toggleAddon = (addonId) => {
    setAddonsSelecionados(prev => {
      if (prev.includes(addonId)) {
        return prev.filter(id => id !== addonId);
      } else {
        return [...prev, addonId];
      }
    });
  };

  const calcularVolumeDocumentos = () => {
    const totalOrdens = volumeColetas + volumeCarregamentos + volumeEntregas;
    return totalOrdens + volumeNotasFiscais;
  };

  const obterFaixaProcessamento = (totalDocs) => {
    for (let i = 0; i < FAIXAS_PROCESSAMENTO.length; i++) {
      if (totalDocs <= FAIXAS_PROCESSAMENTO[i].volume) {
        return FAIXAS_PROCESSAMENTO[i];
      }
    }
    return FAIXAS_PROCESSAMENTO[FAIXAS_PROCESSAMENTO.length - 1];
  };

  const calcularCustoProcessamento = () => {
    const totalDocs = calcularVolumeDocumentos();
    const faixa = obterFaixaProcessamento(totalDocs);
    let custoBase = faixa.preco;
    let custoExtra = 0;
    let docsExcedentes = 0;

    if (totalDocs > 15000) {
      docsExcedentes = totalDocs - 15000;
      custoExtra = docsExcedentes * 0.18;
    }

    return {
      faixa,
      custoBase,
      custoExtra,
      docsExcedentes,
      total: custoBase + custoExtra
    };
  };

  const calcularTotais = () => {
    const processamento = calcularCustoProcessamento();
    const totalDocs = calcularVolumeDocumentos();
    const pacoteBase = obterPacoteBase();
    const addons = obterAddons();
    
    const totalAddons = addons
      .filter(a => addonsSelecionados.includes(a.id))
      .reduce((sum, a) => sum + a.preco, 0);
    
    return {
      pacoteBase: pacoteBase.preco,
      addons: addons.filter(a => addonsSelecionados.includes(a.id)),
      totalAddons,
      processamento,
      totalDocumentos: totalDocs,
      totalMensal: pacoteBase.preco + totalAddons + processamento.total
    };
  };

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

  const handleSolicitarProposta = async () => {
    if (!formData.email || !formData.telefone || !formData.nome) {
      toast.error("Preencha nome, email e telefone");
      return;
    }

    setEnviando(true);

    try {
      const totais = calcularTotais();
      
      // Criar lead no CRM com dados da proposta
      await base44.entities.Lead.create({
        razao_social: formData.empresa || formData.nome,
        responsavel_nome: formData.nome,
        responsavel_email: formData.email,
        responsavel_telefone: formData.telefone,
        status_funil: "lead",
        origem: "landing_page",
        pacote_base_preco: totais.pacoteBase,
        addons_selecionados: JSON.stringify(totais.addons.map(a => ({ id: a.id, nome: a.nome, preco: a.preco }))),
        volume_coletas: volumeColetas,
        volume_carregamentos: volumeCarregamentos,
        volume_entregas: volumeEntregas,
        volume_notas_fiscais: volumeNotasFiscais,
        valor_total_proposta: totais.totalMensal,
        data_proposta: new Date().toISOString()
      });

      // Enviar email de notificação
      const emailBody = `
Nova Proposta via Landing Page - Log Flow

CONTATO:
Nome: ${formData.nome}
Email: ${formData.email}
Telefone/WhatsApp: ${formData.telefone}
Empresa: ${formData.empresa || "Não informado"}

PROPOSTA CALCULADA:
Pacote Base: R$ ${totais.pacoteBase.toFixed(2)}
Add-ons Selecionados: ${totais.addons.map(a => `${a.nome} (R$ ${a.preco})`).join(', ') || 'Nenhum'}
Total Add-ons: R$ ${totais.totalAddons.toFixed(2)}

VOLUME DE DOCUMENTOS:
Coletas: ${volumeColetas}
Carregamentos: ${volumeCarregamentos}
Entregas: ${volumeEntregas}
Notas Fiscais: ${volumeNotasFiscais}
Total Documentos: ${totais.totalDocumentos}

PROCESSAMENTO:
Faixa: ${totais.processamento.faixa.nome}
Custo Processamento: R$ ${totais.processamento.total.toFixed(2)}

VALOR TOTAL MENSAL: R$ ${totais.totalMensal.toFixed(2)}

---
Lead criado automaticamente no CRM
Enviado em ${new Date().toLocaleString('pt-BR')}
      `;

      await base44.integrations.Core.SendEmail({
        to: "leonardobandeira@laflogistica.com.br",
        subject: `💰 Nova Proposta Landing Page - ${formData.nome} - R$ ${totais.totalMensal.toFixed(2)}/mês`,
        body: emailBody
      });

      toast.success("Proposta enviada com sucesso! Entraremos em contato em breve.");
      
      // Limpar formulário
      setFormData({ nome: "", email: "", telefone: "", empresa: "" });
      setAddonsSelecionados([]);
      setVolumeColetas(0);
      setVolumeCarregamentos(0);
      setVolumeEntregas(0);
      setVolumeNotasFiscais(0);
    } catch (error) {
      console.error("Erro ao enviar proposta:", error);
      toast.error("Erro ao enviar. Tente novamente.");
    } finally {
      setEnviando(false);
    }
  };

  const pacoteBase = obterPacoteBase();
  const addons = obterAddons();
  const totais = calcularTotais();

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
              onClick={() => scrollToSection('calculadora')}
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
                      <h3 className="text-xl font-bold text-gray-900">{pacoteBase.nome}</h3>
                      <Badge className="bg-blue-600 text-white">Obrigatório</Badge>
                    </div>
                    <p className="text-sm text-gray-600">{pacoteBase.descricao}</p>
                  </div>
                  <p className="text-3xl font-bold text-blue-600">R$ {pacoteBase.preco}</p>
                </div>
                <div className="space-y-2">
                  {pacoteBase.modulos.slice(0, 3).map((mod, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm text-gray-700">
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                      {mod}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {addons.map((addon) => {
              const Icon = addon.icon;
              return (
                <Card key={addon.id} className="border border-gray-200 bg-white hover:border-blue-300 transition-colors">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-xl font-bold text-gray-900">{addon.nome}</h3>
                          <Badge variant="outline">Opcional</Badge>
                        </div>
                        <p className="text-sm text-gray-600">{addon.descricao}</p>
                      </div>
                      <p className="text-3xl font-bold text-blue-600">R$ {addon.preco}</p>
                    </div>
                    <div className="space-y-2">
                      {addon.modulos.slice(0, 3).map((mod, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-sm text-gray-700">
                          <CheckCircle2 className="w-4 h-4 text-green-600" />
                          {mod}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Calculadora */}
      <section id="calculadora" className="py-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Calculadora de Investimento
            </h2>
            <p className="text-lg text-gray-600">
              Descubra o investimento exato para sua operação
            </p>
          </div>

          <div className="grid lg:grid-cols-5 gap-8">
            {/* Seleção - 3 colunas */}
            <div className="lg:col-span-3 space-y-6">
              {/* Pacote Base */}
              <Card className="border-2 border-blue-200 bg-blue-50/30">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                        <Package className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="font-bold text-lg text-gray-900">{pacoteBase.nome}</p>
                        <p className="text-xs text-gray-600">{pacoteBase.descricao}</p>
                      </div>
                    </div>
                    <p className="text-2xl font-bold text-blue-600">R$ {pacoteBase.preco}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Add-ons Selecionáveis */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4">Add-ons Opcionais</h3>
                <div className="space-y-3">
                  {addons.map((addon) => {
                    const Icon = addon.icon;
                    const selecionado = addonsSelecionados.includes(addon.id);
                    
                    return (
                      <Card
                        key={addon.id}
                        onClick={() => toggleAddon(addon.id)}
                        className="cursor-pointer transition-all hover:shadow-lg border-2"
                        style={{
                          backgroundColor: selecionado ? '#dbeafe' : '#ffffff',
                          borderColor: selecionado ? '#3b82f6' : '#e5e7eb'
                        }}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                                selecionado ? 'bg-blue-600' : 'bg-gray-200'
                              }`}>
                                <Icon className={`w-5 h-5 ${selecionado ? 'text-white' : 'text-gray-600'}`} />
                              </div>
                              <div>
                                <p className="font-bold text-gray-900">{addon.nome}</p>
                                <p className="text-xs text-gray-600">{addon.descricao}</p>
                              </div>
                            </div>
                            <p className="text-xl font-bold text-blue-600">+R$ {addon.preco}</p>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>

              {/* Volume de Documentos */}
              <Card className="border border-gray-200 bg-white">
                <CardHeader>
                  <CardTitle className="text-lg">Volume de Documentos/Mês</CardTitle>
                  <p className="text-sm text-gray-600">Informe a quantidade mensal de cada tipo</p>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div>
                      <label className="text-xs font-semibold mb-1 block text-gray-700">Coletas</label>
                      <Input
                        type="number"
                        value={volumeColetas}
                        onChange={(e) => setVolumeColetas(parseInt(e.target.value) || 0)}
                        min="0"
                        className="text-center"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold mb-1 block text-gray-700">Carregamentos</label>
                      <Input
                        type="number"
                        value={volumeCarregamentos}
                        onChange={(e) => setVolumeCarregamentos(parseInt(e.target.value) || 0)}
                        min="0"
                        className="text-center"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold mb-1 block text-gray-700">Entregas</label>
                      <Input
                        type="number"
                        value={volumeEntregas}
                        onChange={(e) => setVolumeEntregas(parseInt(e.target.value) || 0)}
                        min="0"
                        className="text-center"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold mb-1 block text-gray-700">Notas Fiscais</label>
                      <Input
                        type="number"
                        value={volumeNotasFiscais}
                        onChange={(e) => setVolumeNotasFiscais(parseInt(e.target.value) || 0)}
                        min="0"
                        className="text-center"
                      />
                    </div>
                  </div>

                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-sm font-semibold text-blue-900">Total de Documentos:</p>
                      <p className="text-2xl font-bold text-blue-600">{calcularVolumeDocumentos()}</p>
                    </div>
                    <div className="space-y-1">
                      {FAIXAS_PROCESSAMENTO.map((faixa, idx) => {
                        const totalDocs = calcularVolumeDocumentos();
                        const isAtiva = totalDocs > 0 && totalDocs <= faixa.volume && (idx === 0 || totalDocs > FAIXAS_PROCESSAMENTO[idx - 1].volume);
                        
                        return (
                          <div 
                            key={faixa.volume} 
                            className={`flex items-center justify-between py-1 px-2 rounded ${isAtiva ? 'bg-green-100 border-l-4 border-green-600' : ''}`}
                          >
                            <p className={`text-xs ${isAtiva ? 'font-semibold text-green-900' : 'text-blue-600'}`}>
                              {faixa.nome} (até {faixa.volume.toLocaleString('pt-BR')})
                            </p>
                            <p className={`text-xs ${isAtiva ? 'font-bold text-green-900' : 'text-blue-600'}`}>
                              R$ {faixa.preco.toFixed(2)}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Resumo e Formulário - 2 colunas */}
            <div className="lg:col-span-2 space-y-6">
              {/* Resumo */}
              <Card className="border-2 border-gray-200 bg-white sticky top-24">
                <CardHeader>
                  <CardTitle>Resumo do Investimento</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm font-semibold text-gray-600 mb-3">Módulos Selecionados:</p>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-900">{pacoteBase.nome}</p>
                        <p className="font-semibold text-gray-900">R$ {pacoteBase.preco.toFixed(2)}</p>
                      </div>
                      {totais.addons.map(addon => (
                        <div key={addon.id} className="flex items-center justify-between">
                          <p className="text-sm text-gray-900">{addon.nome}</p>
                          <p className="font-semibold text-gray-900">R$ {addon.preco.toFixed(2)}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {totais.totalDocumentos > 0 && (
                    <div className="pt-4 border-t border-gray-200">
                      <p className="text-sm font-semibold text-gray-600 mb-3">Plano de Processamento:</p>
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-900">{totais.processamento.faixa.nome}</p>
                        <p className="font-semibold text-gray-900">R$ {totais.processamento.total.toFixed(2)}</p>
                      </div>
                    </div>
                  )}

                  <div className="pt-4 border-t-2 border-gray-900">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-lg font-bold text-gray-900">Total Mensal:</p>
                    </div>
                    <p className="text-4xl font-bold text-blue-600 text-right">
                      R$ {totais.totalMensal.toFixed(2)}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Formulário de Contato */}
              <Card className="border-2 border-blue-200 bg-white">
                <CardHeader>
                  <CardTitle className="text-lg">Solicitar Proposta Comercial</CardTitle>
                  <p className="text-sm text-gray-600">Preencha seus dados para receber a proposta detalhada</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="nome" className="text-sm">Nome Completo *</Label>
                    <Input
                      id="nome"
                      value={formData.nome}
                      onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                      placeholder="Seu nome"
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
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="telefone" className="text-sm">WhatsApp *</Label>
                    <Input
                      id="telefone"
                      value={formData.telefone}
                      onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                      placeholder="(00) 00000-0000"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="empresa" className="text-sm">Empresa</Label>
                    <Input
                      id="empresa"
                      value={formData.empresa}
                      onChange={(e) => setFormData({ ...formData, empresa: e.target.value })}
                      placeholder="Nome da empresa (opcional)"
                      className="mt-1"
                    />
                  </div>

                  <Button 
                    onClick={handleSolicitarProposta}
                    disabled={enviando}
                    className="w-full bg-blue-600 hover:bg-blue-700 h-12"
                  >
                    {enviando ? "Enviando..." : "Solicitar Proposta Comercial"}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>

                  <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                    <p className="text-xs font-semibold text-green-900 text-center">
                      💰 Economia de até 60% vs. concorrentes
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Como Funciona */}
      <section className="py-20 px-6 bg-gray-50">
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
                      Pague apenas pelos módulos que usar. {pacoteBase.nome} é obrigatório (R$ {pacoteBase.preco}/mês), 
                      demais módulos são opcionais.
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

          {/* Custos Adicionais */}
          <div className="grid md:grid-cols-2 gap-6 mt-8">
            <Card className="border border-gray-200 bg-white">
              <CardContent className="p-6">
                <h4 className="font-bold mb-3 text-gray-900">Armazenamento em Nuvem</h4>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>10 GB inclusos</span>
                    <span className="font-semibold text-green-600">Grátis</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Armazenamento adicional</span>
                    <span className="font-semibold">US$ 6,00/GB/mês</span>
                  </div>
                  <p className="text-xs mt-2">Backup automático, redundância e acesso 24/7</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-gray-200 bg-white">
              <CardContent className="p-6">
                <h4 className="font-bold mb-3 text-gray-900">Documentos Excedentes</h4>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>Planos até 15.000 docs</span>
                    <span className="font-semibold text-green-600">Sem cobrança</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Acima de 15.000 docs</span>
                    <span className="font-semibold">R$ 0,18/doc extra</span>
                  </div>
                  <p className="text-xs mt-2">Flexibilidade para picos sazonais</p>
                </div>
              </CardContent>
            </Card>
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
            onClick={() => scrollToSection('calculadora')}
          >
            Começar Agora Gratuitamente
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
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