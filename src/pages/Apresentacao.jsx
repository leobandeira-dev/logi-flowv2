import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  Printer,
  X,
  Activity,
  LayoutDashboard,
  MapPin,
  Workflow,
  FileText,
  Package,
  ClipboardCheck,
  Users,
  Truck,
  Settings,
  UserCog,
  Shield,
  Trophy,
  Smartphone,
  MessageCircle,
  Tag,
  Target,
  Award,
  TrendingUp,
  CheckCircle2,
  Navigation,
  Eye,
  FileSpreadsheet,
  Table as TableIcon,
  AlertCircle,
  Camera,
  BarChart3,
  Clock,
  Bell,
  Calendar,
  Filter,
  Search,
  Download,
  Edit
} from "lucide-react";
import { createPageUrl } from "@/utils";
import { useNavigate } from "react-router-dom";

export default function Apresentacao() {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [empresa, setEmpresa] = useState(null);

  useEffect(() => {
    loadEmpresa();
  }, []);

  const loadEmpresa = async () => {
    try {
      const user = await base44.auth.me();
      if (user.empresa_id) {
        const empresaData = await base44.entities.Empresa.get(user.empresa_id);
        setEmpresa(empresaData);
      }
    } catch (error) {
      console.error("Erro ao carregar empresa:", error);
    }
  };

  const slides = [
    // Slide 0 - Capa Institucional
    {
      title: "Capa",
      content: (
        <div className="slide-content flex flex-col items-center justify-center h-full bg-gradient-to-br from-blue-50 via-white to-cyan-50">
          <div className="text-center max-w-5xl mx-auto px-8">
            <div className="mb-12">
              <h1 className="text-7xl font-bold mb-6 bg-gradient-to-r from-blue-600 via-cyan-600 to-blue-700 bg-clip-text text-transparent leading-tight pb-2">
                LogiFlow
              </h1>
              <div className="w-48 h-1 bg-gradient-to-r from-blue-500 via-cyan-500 to-blue-600 mx-auto mb-6" />
            </div>

            <div className="mb-12">
              <h2 className="text-5xl font-bold text-gray-800 mb-4">
                Sistema de Gestão Logística Integrada
              </h2>
              <p className="text-2xl text-gray-600 font-light mb-3">
                Consultoria • Tecnologia • Transformação Digital
              </p>
              <p className="text-xl text-cyan-700 font-semibold">
                Processos Visuais • Métricas Objetivas • Melhoria Contínua
              </p>
            </div>

            <div className="grid grid-cols-4 gap-6 mb-12">
              <div className="bg-white p-8 rounded-2xl shadow-2xl border-t-4 border-blue-500 hover:scale-105 transition-transform">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                  <Activity className="w-10 h-10 text-white" />
                </div>
                <p className="font-bold text-4xl text-blue-700 mb-2">20+</p>
                <p className="text-sm text-gray-600 font-medium">Módulos Integrados</p>
              </div>

              <div className="bg-white p-8 rounded-2xl shadow-2xl border-t-4 border-cyan-500 hover:scale-105 transition-transform">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center">
                  <Users className="w-10 h-10 text-white" />
                </div>
                <p className="font-bold text-4xl text-cyan-700 mb-2">4</p>
                <p className="text-sm text-gray-600 font-medium">Perfis de Usuário</p>
              </div>

              <div className="bg-white p-8 rounded-2xl shadow-2xl border-t-4 border-blue-600 hover:scale-105 transition-transform">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
                  <Trophy className="w-10 h-10 text-white" />
                </div>
                <p className="font-bold text-4xl text-blue-700 mb-2">100%</p>
                <p className="text-sm text-gray-600 font-medium">Gamificado</p>
              </div>

              <div className="bg-white p-8 rounded-2xl shadow-2xl border-t-4 border-cyan-600 hover:scale-105 transition-transform">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                  <Target className="w-10 h-10 text-white" />
                </div>
                <p className="font-bold text-4xl text-cyan-700 mb-2">95%+</p>
                <p className="text-sm text-gray-600 font-medium">Meta SLA</p>
              </div>
            </div>

            <div className="bg-gradient-to-br from-slate-800 to-slate-900 text-white p-8 rounded-xl shadow-2xl border border-slate-700">
              <div className="grid grid-cols-2 gap-8 mb-6">
                <div className="text-left">
                  <p className="text-xs text-slate-400 uppercase tracking-wider mb-2">Empresa</p>
                  <p className="text-2xl font-bold mb-1">LAF Logística</p>
                  <p className="text-sm text-slate-300">CNPJ 34.579.341/0001-85</p>
                </div>
                <div className="text-left">
                  <p className="text-xs text-slate-400 uppercase tracking-wider mb-2">Product Owner</p>
                  <p className="text-xl font-bold mb-1">Leonardo Silva Bandeira</p>
                  <p className="text-sm text-slate-300">CPF 042.332.453-52</p>
                </div>
              </div>
              <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-slate-600 to-transparent my-4" />
              <div className="text-center">
                <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Stack Tecnológica</p>
                <p className="text-sm text-slate-300">React • TypeScript • PostgreSQL • Deno Deploy</p>
              </div>
            </div>

            <p className="text-gray-500 mt-12 text-lg font-medium">
              {new Date().toLocaleDateString('pt-BR', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
        </div>
      )
    },

    // Slide 1 - Visão Geral dos Módulos
    {
      title: "Visão Geral",
      content: (
        <div className="slide-content p-8">
          <div className="text-center mb-8">
            <h2 className="text-5xl font-bold mb-3 bg-gradient-to-r from-cyan-600 via-blue-600 to-blue-800 bg-clip-text text-transparent">
              Gestão Logística Completa
            </h2>
            <p className="text-xl text-gray-700 font-light">
              20 Módulos Integrados • Processos visuais • Métricas objetivas
            </p>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-bold text-cyan-700 mb-3 flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Gestão de Operações
            </h3>
            <div className="grid grid-cols-4 gap-3">
              <div className="bg-gradient-to-br from-cyan-400 to-cyan-600 text-white p-4 rounded-xl shadow-lg">
                <LayoutDashboard className="w-7 h-7 mb-2" />
                <h4 className="font-bold text-sm mb-1">Dashboard</h4>
                <p className="text-xs opacity-90">Métricas e KPIs</p>
              </div>
              <div className="bg-gradient-to-br from-cyan-500 to-blue-500 text-white p-4 rounded-xl shadow-lg">
                <MapPin className="w-7 h-7 mb-2" />
                <h4 className="font-bold text-sm mb-1">Tracking</h4>
                <p className="text-xs opacity-90">Rastreamento</p>
              </div>
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-4 rounded-xl shadow-lg">
                <Workflow className="w-7 h-7 mb-2" />
                <h4 className="font-bold text-sm mb-1">Fluxo BPMN</h4>
                <p className="text-xs opacity-90">Workflow</p>
              </div>
              <div className="bg-gradient-to-br from-blue-600 to-blue-700 text-white p-4 rounded-xl shadow-lg">
                <FileText className="w-7 h-7 mb-2" />
                <h4 className="font-bold text-sm mb-1">Ordens</h4>
                <p className="text-xs opacity-90">Carregamento</p>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-bold text-cyan-700 mb-3 flex items-center gap-2">
              <Package className="w-5 h-5" />
              Gestão de Coletas
            </h3>
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-gradient-to-br from-cyan-400 to-cyan-600 text-white p-4 rounded-xl shadow-lg">
                <Activity className="w-7 h-7 mb-2" />
                <h4 className="font-bold text-sm mb-1">Dashboard Coletas</h4>
                <p className="text-xs opacity-90">Visão Geral</p>
              </div>
              <div className="bg-gradient-to-br from-cyan-500 to-blue-500 text-white p-4 rounded-xl shadow-lg">
                <Package className="w-7 h-7 mb-2" />
                <h4 className="font-bold text-sm mb-1">Solicitar Coleta</h4>
                <p className="text-xs opacity-90">Portal Fornecedor</p>
              </div>
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-4 rounded-xl shadow-lg">
                <ClipboardCheck className="w-7 h-7 mb-2" />
                <h4 className="font-bold text-sm mb-1">Aprovar Coletas</h4>
                <p className="text-xs opacity-90">Portal Cliente</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-bold text-cyan-700 mb-3 flex items-center gap-2">
                <Package className="w-5 h-5" />
                Módulo de Armazém (WMS)
              </h3>
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-4 rounded-xl shadow-lg">
                  <Package className="w-6 h-6 mb-2" />
                  <h4 className="font-bold text-xs mb-1">Recebimento</h4>
                  <p className="text-[10px] opacity-90">Entrada NF-e</p>
                </div>
                <div className="bg-gradient-to-br from-blue-600 to-blue-700 text-white p-4 rounded-xl shadow-lg">
                  <Tag className="w-6 h-6 mb-2" />
                  <h4 className="font-bold text-xs mb-1">Etiquetas Mãe</h4>
                  <p className="text-[10px] opacity-90">Unitização</p>
                </div>
                <div className="bg-gradient-to-br from-blue-700 to-blue-800 text-white p-4 rounded-xl shadow-lg">
                  <Truck className="w-6 h-6 mb-2" />
                  <h4 className="font-bold text-xs mb-1">Carregamento</h4>
                  <p className="text-[10px] opacity-90">Expedição</p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-bold text-cyan-700 mb-3 flex items-center gap-2">
                <Users className="w-5 h-5" />
                Gestão de Recursos
              </h3>
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-gradient-to-br from-cyan-400 to-cyan-600 text-white p-4 rounded-xl shadow-lg">
                  <Users className="w-6 h-6 mb-2" />
                  <h4 className="font-bold text-xs mb-1">Motoristas</h4>
                  <p className="text-[10px] opacity-90">Cadastro</p>
                </div>
                <div className="bg-gradient-to-br from-cyan-500 to-blue-500 text-white p-4 rounded-xl shadow-lg">
                  <Truck className="w-6 h-6 mb-2" />
                  <h4 className="font-bold text-xs mb-1">Veículos</h4>
                  <p className="text-[10px] opacity-90">Frota ANTT</p>
                </div>
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-4 rounded-xl shadow-lg">
                  <Settings className="w-6 h-6 mb-2" />
                  <h4 className="font-bold text-xs mb-1">Operações</h4>
                  <p className="text-[10px] opacity-90">Config SLA</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    },

    // Slide 2 - Gestão de Ordens
    {
      title: "Gestão de Ordens",
      content: (
        <div className="slide-content p-8">
          <div className="text-center mb-8">
            <h2 className="text-4xl font-bold text-cyan-700 mb-3">Gestão Completa de Ordens</h2>
            <p className="text-xl text-gray-600">5 Modalidades de Criação - Do Simples ao Avançado</p>
          </div>

          <div className="grid grid-cols-5 gap-4 mb-12">
            <div className="bg-white rounded-lg p-6 shadow-xl border-t-4 border-cyan-500">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center text-white font-bold text-2xl mx-auto mb-4">01</div>
              <h3 className="font-bold text-lg text-gray-900 mb-2 text-center">Ordem Completa</h3>
              <p className="text-xs text-gray-600 text-center">60+ campos completos</p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-xl border-t-4 border-cyan-400">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-white font-bold text-2xl mx-auto mb-4">02</div>
              <h3 className="font-bold text-lg text-gray-900 mb-2 text-center">Oferta de Carga</h3>
              <p className="text-xs text-gray-600 text-center">Cadastro rápido</p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-xl border-t-4 border-blue-500">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-2xl mx-auto mb-4">03</div>
              <h3 className="font-bold text-lg text-gray-900 mb-2 text-center">Lote Excel</h3>
              <p className="text-xs text-gray-600 text-center">Importação em massa</p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-xl border-t-4 border-blue-600">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-bold text-2xl mx-auto mb-4">04</div>
              <h3 className="font-bold text-lg text-gray-900 mb-2 text-center">OCR de PDF</h3>
              <p className="text-xs text-gray-600 text-center">Extração via IA</p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-xl border-t-4 border-blue-700">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center text-white font-bold text-2xl mx-auto mb-4">05</div>
              <h3 className="font-bold text-lg text-gray-900 mb-2 text-center">Ordens Filhas</h3>
              <p className="text-xs text-gray-600 text-center">Múltiplos destinos</p>
            </div>
          </div>

          <div className="bg-gradient-to-r from-cyan-600 to-blue-700 text-white p-8 rounded-lg shadow-2xl text-center">
            <p className="text-3xl font-bold mb-3">Redução de 75% no tempo de cadastro</p>
            <p className="text-xl opacity-90">De 18 minutos para apenas 4 minutos por ordem</p>
          </div>
        </div>
      )
    },

    // Slide 3 - Tracking
    {
      title: "Tracking",
      content: (
        <div className="slide-content p-8">
          <div className="text-center mb-8">
            <h2 className="text-4xl font-bold text-cyan-700 mb-3">Tracking Logístico</h2>
            <p className="text-xl text-gray-600">10 Estágios Completos - Visibilidade Total</p>
          </div>

          <div className="grid grid-cols-10 gap-2 mb-12">
            {[
              'Agend.', 'Agendado', 'Carreg.', 'Carregado', 'Viagem',
              'Chegou', 'Desc.Ag', 'Descar.', 'Desc.OK', 'Final'
            ].map((est, idx) => (
              <div key={idx} className="bg-gradient-to-br from-cyan-100 to-blue-200 rounded-lg p-3 text-center border border-blue-400">
                <div className={`w-8 h-8 rounded-full ${idx < 3 ? 'bg-cyan-500' : idx < 6 ? 'bg-blue-500' : 'bg-blue-700'} flex items-center justify-center text-white text-xs font-bold mx-auto mb-1`}>
                  {idx + 1}
                </div>
                <p className="text-[10px] font-semibold text-gray-700">{est}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-8 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <h3 className="font-bold text-xl mb-4 text-gray-900">Recursos Principais</h3>
              <ul className="space-y-3 text-base text-gray-800">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-cyan-600" /> Localização via Google Distance Matrix</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-cyan-600" /> SLA com alertas visuais e expurgo</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-cyan-600" /> Chat central tempo real</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-cyan-600" /> Múltiplas visualizações</li>
              </ul>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <h3 className="font-bold text-xl mb-4 text-gray-900">Visualizações</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-cyan-50 rounded-lg">
                  <TableIcon className="w-6 h-6 text-cyan-600" />
                  <span className="font-semibold text-gray-900">Tabela Completa</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                  <FileSpreadsheet className="w-6 h-6 text-blue-600" />
                  <span className="font-semibold text-gray-900">Planilha Editável</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-blue-100 rounded-lg">
                  <Eye className="w-6 h-6 text-blue-700" />
                  <span className="font-semibold text-gray-900">Modo TV</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-cyan-600 to-blue-700 text-white p-6 rounded-lg shadow-2xl text-center">
            <p className="text-2xl font-bold">Redução de 70% em ligações telefônicas</p>
          </div>
        </div>
      )
    },

    // Slide 4 - Portal B2B
    {
      title: "Portal B2B",
      content: (
        <div className="slide-content p-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-cyan-700 mb-3">Portal B2B - Coletas</h2>
            <p className="text-xl text-gray-600">Self-Service para Fornecedores e Clientes</p>
          </div>

          <div className="grid grid-cols-3 gap-6 mb-12">
            <div className="bg-gradient-to-br from-cyan-50 to-cyan-100 rounded-lg p-6 border-2 border-cyan-500 shadow-xl">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-cyan-500 to-cyan-600 flex items-center justify-center text-white font-bold text-2xl mx-auto mb-4">1</div>
              <h3 className="font-bold text-xl text-center text-gray-900 mb-3">Fornecedor Solicita</h3>
              <p className="text-sm text-gray-600 text-center">Upload XMLs NF-e, dados carga, envio aprovação cliente</p>
            </div>
            <div className="bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg p-6 border-2 border-blue-500 shadow-xl">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-2xl mx-auto mb-4">2</div>
              <h3 className="font-bold text-xl text-center text-gray-900 mb-3">Cliente Aprova</h3>
              <p className="text-sm text-gray-600 text-center">Portal aprovações online</p>
            </div>
            <div className="bg-gradient-to-br from-blue-300 to-blue-400 rounded-lg p-6 border-2 border-blue-700 shadow-xl">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-700 to-blue-800 flex items-center justify-center text-white font-bold text-2xl mx-auto mb-4">3</div>
              <h3 className="font-bold text-xl text-center text-gray-900 mb-3">Conversão Automática</h3>
              <p className="text-sm text-gray-600 text-center">Vira ordem de carregamento</p>
            </div>
          </div>

          <div className="bg-gradient-to-r from-cyan-600 to-blue-700 text-white p-8 rounded-lg shadow-2xl text-center">
            <p className="text-3xl font-bold mb-3">Processo de coleta totalmente digital</p>
            <p className="text-xl opacity-90">De dias para minutos • Sem ligações • Rastreável</p>
          </div>
        </div>
      )
    },

    // Slide 5 - Workflow BPMN
    {
      title: "Workflow",
      content: (
        <div className="slide-content bg-gradient-to-r from-cyan-500 to-blue-700 text-white p-8">
          <div className="text-center mb-8">
            <h2 className="text-5xl font-bold mb-3">Workflow BPMN</h2>
            <p className="text-2xl opacity-90">Etapas Configuráveis com SLA Granular</p>
          </div>

          <div className="grid grid-cols-5 gap-4 mb-12">
            {['Cadastro', 'Rastreamento', 'Expedição', 'Financeiro', 'Finalização'].map((etapa, idx) => (
              <div key={idx} className="text-center p-5 bg-white/20 rounded-xl border-2 border-white/40">
                <div className="w-12 h-12 rounded-full bg-white/30 mx-auto mb-3 flex items-center justify-center text-white font-bold text-xl">
                  {idx < 4 ? idx + 1 : '✓'}
                </div>
                <p className="font-bold text-sm">{etapa}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-8">
            <div>
              <h3 className="text-2xl font-bold mb-4">Recursos:</h3>
              <ul className="space-y-3 text-lg">
                <li>• Prazos em dias/horas/minutos</li>
                <li>• 3 modos de contagem de prazo</li>
                <li>• Campos customizados por etapa</li>
                <li>• Atribuição por usuário ou departamento</li>
              </ul>
            </div>
            <div>
              <h3 className="text-2xl font-bold mb-4">Benefícios:</h3>
              <ul className="space-y-3 text-lg">
                <li>• Processos padronizados</li>
                <li>• Timeline visual do progresso</li>
                <li>• Histórico auditável completo</li>
                <li>• Alertas automáticos de prazo</li>
              </ul>
            </div>
          </div>
        </div>
      )
    },

    // Slide 6 - Ocorrências
    {
      title: "Ocorrências",
      content: (
        <div className="slide-content p-8">
          <div className="text-center mb-8">
            <h2 className="text-4xl font-bold text-cyan-700 mb-3">Gestão de Ocorrências</h2>
            <p className="text-xl text-gray-600">Sistema Profissional de Qualidade</p>
          </div>

          <div className="grid grid-cols-2 gap-8 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <h3 className="font-bold text-xl mb-4 text-gray-900">Tipos de Ocorrências</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-cyan-50 rounded-lg">
                  <Navigation className="w-6 h-6 text-cyan-600" />
                  <span className="font-semibold text-gray-900">Tracking (Viagem)</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                  <Workflow className="w-6 h-6 text-blue-600" />
                  <span className="font-semibold text-gray-900">Fluxo (Processos)</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                  <Settings className="w-6 h-6 text-purple-600" />
                  <span className="font-semibold text-gray-900">Configuráveis</span>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-lg">
              <h3 className="font-bold text-xl mb-4 text-gray-900">Níveis de Gravidade</h3>
              <div className="space-y-3">
                <div className="p-3 bg-gradient-to-br from-cyan-500 to-blue-600 text-white rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">Baixa</span>
                    <span className="text-sm">-5 pts</span>
                  </div>
                </div>
                <div className="p-3 bg-gradient-to-br from-cyan-500 to-blue-600 text-white rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">Média</span>
                    <span className="text-sm">-10 pts</span>
                  </div>
                </div>
                <div className="p-3 bg-gradient-to-br from-cyan-500 to-blue-600 text-white rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">Alta</span>
                    <span className="text-sm">-20 pts</span>
                  </div>
                </div>
                <div className="p-3 bg-gradient-to-br from-cyan-500 to-blue-600 text-white rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">Crítica</span>
                    <span className="text-sm">-40 pts</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    },

    // Slide 7 - Gamificação
    {
      title: "Gamificação",
      content: (
        <div className="slide-content p-8">
          <div className="text-center mb-8">
            <h2 className="text-4xl font-bold text-cyan-700 mb-3">Gamificação e SLA</h2>
            <p className="text-xl text-gray-600">Métricas de Performance e Reconhecimento</p>
          </div>

          <div className="bg-gradient-to-r from-cyan-400 via-cyan-500 to-blue-600 text-white p-8 rounded-lg shadow-2xl mb-8">
            <h3 className="font-bold text-2xl mb-6 text-center">Sistema de Níveis e Evolução</h3>
            <div className="grid grid-cols-5 gap-4">
              {[
                { num: '1', nome: 'Iniciante', pts: '0-100' },
                { num: '2', nome: 'Cadete', pts: '101-300' },
                { num: '3', nome: 'Operacional', pts: '301-600' },
                { num: '4', nome: 'Mestre', pts: '601-1000' },
                { num: '5', nome: 'Comandante', pts: '1000+' }
              ].map((nivel) => (
                <div key={nivel.num} className="text-center bg-white/20 p-4 rounded-xl border-2 border-white/40">
                  <div className="w-12 h-12 rounded-full bg-white/30 mx-auto mb-2 flex items-center justify-center text-white font-bold text-lg">{nivel.num}</div>
                  <p className="font-bold text-lg mb-1">{nivel.nome}</p>
                  <p className="text-sm">{nivel.pts}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-xl">
              <h3 className="font-bold text-xl mb-4 text-blue-900">Cálculo do SLA</h3>
              <div className="space-y-3">
                <div className="p-4 bg-cyan-50 rounded-lg border-2 border-cyan-500">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-lg text-gray-900">Qualidade</span>
                    <span className="text-2xl font-bold text-cyan-700">60%</span>
                  </div>
                </div>
                <div className="p-4 bg-blue-50 rounded-lg border-2 border-blue-600">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-lg text-gray-900">Produtividade</span>
                    <span className="text-2xl font-bold text-blue-700">40%</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-xl">
              <h3 className="font-bold text-xl mb-4 text-gray-900">Rankings</h3>
              <ul className="space-y-3 text-base text-gray-800">
                <li>• Ranking geral acumulado</li>
                <li>• Ranking mensal</li>
                <li>• Por categoria de usuário</li>
                <li>• Comparativo com média</li>
              </ul>
            </div>
          </div>
        </div>
      )
    },

    // Slide 8 - Resultados
    {
      title: "Resultados",
      content: (
        <div className="slide-content p-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-cyan-700 mb-3">Resultados Comprovados</h2>
            <p className="text-xl text-gray-600">Métricas Reais de 30 Dias de Operação</p>
          </div>

          <div className="grid grid-cols-3 gap-6 mb-12">
            <div className="bg-gradient-to-br from-cyan-400 to-cyan-600 text-white p-10 rounded-lg shadow-2xl text-center">
              <div className="text-6xl font-bold mb-4">+10pp</div>
              <p className="text-2xl font-bold mb-2">SLA Entregas</p>
              <p className="text-lg opacity-90">De 78% para 88%</p>
            </div>
            <div className="bg-gradient-to-br from-cyan-500 to-blue-500 text-white p-10 rounded-lg shadow-2xl text-center">
              <div className="text-6xl font-bold mb-4">-75%</div>
              <p className="text-2xl font-bold mb-2">Tempo Cadastro</p>
              <p className="text-lg opacity-90">De 18min para 4min</p>
            </div>
            <div className="bg-gradient-to-br from-blue-500 to-blue-700 text-white p-10 rounded-lg shadow-2xl text-center">
              <div className="text-6xl font-bold mb-4">-70%</div>
              <p className="text-2xl font-bold mb-2">Ligações Tel</p>
              <p className="text-lg opacity-90">Redução comunicação</p>
            </div>
          </div>

          <div className="bg-gradient-to-r from-cyan-600 via-blue-600 to-blue-700 text-white p-12 rounded-lg shadow-2xl text-center">
            <p className="text-4xl font-bold mb-4">Product-Market Fit Validado</p>
            <p className="text-2xl opacity-90">Todas métricas superaram metas em 30 dias</p>
          </div>
        </div>
      )
    }
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print-container, .print-container * {
            visibility: visible;
          }
          .print-container {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .slide-wrapper {
            page-break-after: always;
            page-break-inside: avoid;
            height: 100vh;
            width: 100vw;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .slide-wrapper:last-child {
            page-break-after: auto;
          }
          .no-print {
            display: none !important;
          }
          .slide-content {
            width: 100%;
            height: 100%;
          }
        }
        
        @media screen {
          .slide-wrapper {
            display: none;
          }
          .slide-wrapper.active {
            display: flex;
          }
        }
      `}</style>

      {/* Visualização na tela */}
      <div className="fixed inset-0 bg-gray-100 z-50 no-print">
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 bg-white border-b shadow-sm">
            <h1 className="text-xl font-bold text-gray-900">Apresentação Institucional</h1>
            <div className="flex gap-2">
              <Button
                onClick={() => {
                  const style = document.createElement('style');
                  style.innerHTML = '@page { margin: 0; size: landscape; }';
                  document.head.appendChild(style);
                  window.print();
                  setTimeout(() => document.head.removeChild(style), 1000);
                }}
                className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white shadow-lg"
                size="lg"
              >
                <Download className="w-5 h-5 mr-2" />
                Baixar PDF
              </Button>
              <Button
                onClick={() => navigate(createPageUrl("Configuracoes"))}
                variant="outline"
              >
                <X className="w-5 h-5 mr-2" />
                Fechar
              </Button>
            </div>
          </div>

          {/* Slide atual */}
          <div className="flex-1 bg-white m-6 rounded-lg shadow-xl overflow-auto">
            {slides[currentSlide].content}
          </div>

          {/* Navegação */}
          <div className="flex items-center justify-between px-6 py-4 bg-white border-t">
            <Button
              onClick={prevSlide}
              disabled={currentSlide === 0}
              variant="outline"
            >
              <ChevronLeft className="w-5 h-5 mr-2" />
              Anterior
            </Button>

            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600">
                Slide {currentSlide + 1} de {slides.length}
              </span>
              <div className="flex gap-2">
                {slides.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    className={`h-2 rounded-full transition-all ${
                      index === currentSlide
                        ? "bg-blue-600 w-8"
                        : "bg-gray-300 hover:bg-gray-400 w-2"
                    }`}
                  />
                ))}
              </div>
            </div>

            <Button
              onClick={nextSlide}
              disabled={currentSlide === slides.length - 1}
              variant="outline"
            >
              Próximo
              <ChevronRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </div>
      </div>

      {/* Container para impressão (todos os slides) */}
      <div className="print-container">
        {slides.map((slide, index) => (
          <div key={index} className={`slide-wrapper ${index === currentSlide ? 'active' : ''}`}>
            {slide.content}
          </div>
        ))}
      </div>
    </>
  );
}