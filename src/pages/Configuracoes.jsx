import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Fase2Discover from "../components/documentacao/Fase2Discover";
import Fase3Build from "../components/documentacao/Fase3Build";
import {
  Building2,
  Upload,
  Save,
  Loader2,
  CheckCircle,
  Image as ImageIcon,
  AlertCircle,
  Presentation,
  ChevronLeft,
  ChevronRight,
  Workflow,
  Target,
  TrendingUp,
  Award,
  Users,
  BarChart3,
  CheckCircle2,
  Package,
  Truck,
  MapPin,
  Shield,
  Clock,
  RefreshCw,
  Zap,
  FileText,
  Search,
  Filter,
  PlayCircle,
  XCircle,
  Calendar,
  MessageCircle,
  Camera,
  Navigation,
  Bell,
  Eye,
  Edit,
  Trash2,
  Plus,
  Download,
  FileSpreadsheet,
  Settings,
  Tag,
  Smartphone,
  LayoutDashboard,
  ClipboardCheck,
  UserCog,
  Trophy,
  Activity,
  Table as TableIcon
} from "lucide-react";

export default function Configuracoes() {
  const [user, setUser] = useState(null);
  const [empresa, setEmpresa] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("empresa");

  // Apresentação states
  const [showPresentation, setShowPresentation] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  const [formData, setFormData] = useState({
    cnpj: "",
    razao_social: "",
    nome_fantasia: "",
    endereco: "",
    cidade: "",
    estado: "",
    cep: "",
    telefone: "",
    email: "",
    inscricao_estadual: "",
    logo_url: "",
    timezone: "America/Sao_Paulo"
  });

  const fileInputRef = React.useRef(null);

  const [ordensAntigas, setOrdensAntigas] = useState([]);
  const [vinculandoOrdens, setVinculandoOrdens] = useState(false);

  // Slides Atualizados da Apresentação Comercial
  const slides = [
    {
      title: "Sistema de Gestão Logística Integrada",
      subtitle: "Transforme sua operação com tecnologia e inteligência",
      icon: Presentation,
      content: (
        <div className="min-h-[600px] flex flex-col justify-center py-6">
          <div className="text-center mb-8">
            <h2 className="text-5xl font-bold mb-3 bg-gradient-to-r from-cyan-600 via-blue-600 to-blue-800 bg-clip-text text-transparent">
              Gestão Logística Completa
            </h2>
            <p className="text-xl text-gray-700 font-light">
              20 Módulos Integrados • Processos visuais • Métricas objetivas
            </p>
          </div>

          {/* Gestão de Operações */}
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

          {/* Gestão de Coletas */}
          <div className="mb-6">
            <h3 className="text-lg font-bold text-cyan-700 mb-3 flex items-center gap-2">
              <Package className="w-5 h-5" />
              Gestão de Coletas
            </h3>
            <div className="grid grid-cols-4 gap-3">
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
            {/* Módulo de Armazém */}
            <div>
              <h3 className="text-lg font-bold text-cyan-700 mb-3 flex items-center gap-2">
                <Package className="w-5 h-5" />
                Módulo de Armazém (WMS)
              </h3>
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-4 rounded-xl shadow-lg">
                  <Package className="w-7 h-7 mb-2" />
                  <h4 className="font-bold text-sm mb-1">Recebimento</h4>
                  <p className="text-xs opacity-90">Entrada NF-e</p>
                </div>
                <div className="bg-gradient-to-br from-blue-600 to-blue-700 text-white p-4 rounded-xl shadow-lg">
                  <FileText className="w-7 h-7 mb-2" />
                  <h4 className="font-bold text-sm mb-1">Notas Fiscais</h4>
                  <p className="text-xs opacity-90">Gestão NF-e</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-gradient-to-br from-blue-600 to-blue-700 text-white p-4 rounded-xl shadow-lg">
                  <Tag className="w-7 h-7 mb-2" />
                  <h4 className="font-bold text-sm mb-1">Etiquetas Mãe</h4>
                  <p className="text-xs opacity-90">Unitização</p>
                </div>
                <div className="bg-gradient-to-br from-blue-700 to-blue-800 text-white p-4 rounded-xl shadow-lg">
                  <Truck className="w-7 h-7 mb-2" />
                  <h4 className="font-bold text-sm mb-1">Carregamento</h4>
                  <p className="text-xs opacity-90">Expedição</p>
                </div>
                <div className="bg-gradient-to-br from-blue-700 to-blue-800 text-white p-4 rounded-xl shadow-lg">
                  <Truck className="w-7 h-7 mb-2" />
                  <h4 className="font-bold text-sm mb-1">Ordem Entrega</h4>
                  <p className="text-xs opacity-90">Fracionadas</p>
                </div>
              </div>
            </div>

            {/* Gestão de Recursos */}
            <div>
              <h3 className="text-lg font-bold text-cyan-700 mb-3 flex items-center gap-2">
                <Users className="w-5 h-5" />
                Gestão de Recursos
              </h3>
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-gradient-to-br from-cyan-400 to-cyan-600 text-white p-4 rounded-xl shadow-lg">
                  <Users className="w-7 h-7 mb-2" />
                  <h4 className="font-bold text-sm mb-1">Motoristas</h4>
                  <p className="text-xs opacity-90">Cadastro</p>
                </div>
                <div className="bg-gradient-to-br from-cyan-500 to-blue-500 text-white p-4 rounded-xl shadow-lg">
                  <Truck className="w-7 h-7 mb-2" />
                  <h4 className="font-bold text-sm mb-1">Veículos</h4>
                  <p className="text-xs opacity-90">Frota ANTT</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-4 rounded-xl shadow-lg">
                  <Settings className="w-7 h-7 mb-2" />
                  <h4 className="font-bold text-sm mb-1">Operações</h4>
                  <p className="text-xs opacity-90">Config SLA</p>
                </div>
                <div className="bg-gradient-to-br from-blue-600 to-blue-700 text-white p-4 rounded-xl shadow-lg">
                  <UserCog className="w-7 h-7 mb-2" />
                  <h4 className="font-bold text-sm mb-1">Usuários</h4>
                  <p className="text-xs opacity-90">Perfis</p>
                </div>
                <div className="bg-gradient-to-br from-blue-600 to-blue-700 text-white p-4 rounded-xl shadow-lg">
                  <Users className="w-7 h-7 mb-2" />
                  <h4 className="font-bold text-sm mb-1">Parceiros</h4>
                  <p className="text-xs opacity-90">Clientes</p>
                </div>
              </div>
            </div>
          </div>

          {/* Monitoramento e Comunicação */}
          <div className="grid grid-cols-2 gap-6 mt-6">
            <div>
              <h3 className="text-lg font-bold text-cyan-700 mb-3 flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Monitoramento e Qualidade
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gradient-to-br from-cyan-400 to-cyan-600 text-white p-4 rounded-xl shadow-lg">
                  <Shield className="w-7 h-7 mb-2" />
                  <h4 className="font-bold text-sm mb-1">Ocorrências</h4>
                  <p className="text-xs opacity-90">Gestão problemas</p>
                </div>
                <div className="bg-gradient-to-br from-cyan-500 to-blue-500 text-white p-4 rounded-xl shadow-lg">
                  <Trophy className="w-7 h-7 mb-2" />
                  <h4 className="font-bold text-sm mb-1">Gamificação</h4>
                  <p className="text-xs opacity-90">Rankings SLA</p>
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-bold text-cyan-700 mb-3 flex items-center gap-2">
                <MessageCircle className="w-5 h-5" />
                Comunicação e Suporte
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-4 rounded-xl shadow-lg">
                  <Smartphone className="w-7 h-7 mb-2" />
                  <h4 className="font-bold text-sm mb-1">App Motorista</h4>
                  <p className="text-xs opacity-90">Mobile SMS</p>
                </div>
                <div className="bg-gradient-to-br from-blue-600 to-blue-700 text-white p-4 rounded-xl shadow-lg">
                  <MessageCircle className="w-7 h-7 mb-2" />
                  <h4 className="font-bold text-sm mb-1">SAC</h4>
                  <p className="text-xs opacity-90">Chatbot IA</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Gestão Completa de Ordens",
      subtitle: "5 Modalidades de Criação - Do Simples ao Avançado",
      icon: Package,
      content: (
        <div className="min-h-[600px] flex flex-col justify-center">
          <div className="grid grid-cols-5 gap-4 mb-12">
            <div className="bg-white rounded-2xl p-6 shadow-xl border-t-4 border-cyan-500">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center text-white font-bold text-2xl mx-auto mb-4">01</div>
              <h3 className="font-bold text-lg text-gray-900 mb-2 text-center">Ordem Completa</h3>
              <p className="text-xs text-gray-600 text-center">Formulário completo com 60+ campos, motorista e veículo alocados</p>
            </div>
            
            <div className="bg-white rounded-2xl p-6 shadow-xl border-t-4 border-cyan-400">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-white font-bold text-2xl mx-auto mb-4">02</div>
              <h3 className="font-bold text-lg text-gray-900 mb-2 text-center">Oferta de Carga</h3>
              <p className="text-xs text-gray-600 text-center">Cadastro rápido sem motorista, conversão em ordem completa</p>
            </div>
            
            <div className="bg-white rounded-2xl p-6 shadow-xl border-t-4 border-blue-500">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-2xl mx-auto mb-4">03</div>
              <h3 className="font-bold text-lg text-gray-900 mb-2 text-center">Lote Excel</h3>
              <p className="text-xs text-gray-600 text-center">Importação em massa, template padronizado, validação automática</p>
            </div>
            
            <div className="bg-white rounded-2xl p-6 shadow-xl border-t-4 border-blue-600">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-bold text-2xl mx-auto mb-4">04</div>
              <h3 className="font-bold text-lg text-gray-900 mb-2 text-center">OCR de PDF</h3>
              <p className="text-xs text-gray-600 text-center">Extração inteligente via IA, sem digitação manual</p>
            </div>
            
            <div className="bg-white rounded-2xl p-6 shadow-xl border-t-4 border-blue-700">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center text-white font-bold text-2xl mx-auto mb-4">05</div>
              <h3 className="font-bold text-lg text-gray-900 mb-2 text-center">Ordens Filhas</h3>
              <p className="text-xs text-gray-600 text-center">Múltiplos destinos vinculados a ordem-mãe</p>
            </div>
          </div>

          <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-8 shadow-xl">
            <h3 className="font-bold text-2xl text-gray-900 mb-6 text-center">Recursos Avançados</h3>
            <div className="grid grid-cols-3 gap-6">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-cyan-500 flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="font-bold text-gray-900">Autocomplete CNPJ</p>
                  <p className="text-sm text-gray-600">Preenche automaticamente dados de parceiros</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="font-bold text-gray-900">Validação ANTT</p>
                  <p className="text-sm text-gray-600">Consulta integrada situação veículos</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-700 flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="font-bold text-gray-900">Impressão PDF</p>
                  <p className="text-sm text-gray-600">Relatórios e documentos customizados</p>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center bg-gradient-to-r from-cyan-600 to-blue-700 text-white p-8 rounded-2xl shadow-2xl">
            <p className="text-3xl font-bold mb-3">Redução de 75% no tempo de cadastro</p>
            <p className="text-xl opacity-90">De 18 minutos para apenas 4 minutos por ordem</p>
          </div>
        </div>
      )
    },
    {
      title: "Tracking e Rastreamento Logístico",
      subtitle: "10 Estágios Completos - Visibilidade Total da Operação",
      icon: Navigation,
      content: (
        <div className="grid grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-xl">
              <h3 className="font-bold text-2xl mb-4 flex items-center gap-3 text-gray-900">
                <BarChart3 className="w-8 h-8 text-cyan-600" />
                Métricas Principais
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-cyan-50 to-cyan-100 rounded-xl border-2 border-cyan-400">
                  <span className="font-semibold text-gray-900">Total de Ordens</span>
                  <span className="text-2xl font-bold text-cyan-700">250</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-cyan-100 to-blue-100 rounded-xl border-2 border-cyan-500">
                  <span className="font-semibold text-gray-900">Em Trânsito</span>
                  <span className="text-2xl font-bold text-cyan-700">90</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl border-2 border-blue-400">
                  <span className="font-semibold text-gray-900">Pendentes</span>
                  <span className="text-2xl font-bold text-blue-700">45</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-100 to-blue-200 rounded-xl border-2 border-blue-500">
                  <span className="font-semibold text-gray-900">Finalizadas</span>
                  <span className="text-2xl font-bold text-blue-800">115</span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-gradient-to-br from-cyan-500 to-blue-700 text-white p-8 rounded-2xl shadow-2xl">
              <h3 className="font-bold text-2xl mb-6">Recursos do Dashboard</h3>
              <ul className="space-y-4 text-lg">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 flex-shrink-0 mt-1" />
                  <span>Visão consolidada de todas as operações</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 flex-shrink-0 mt-1" />
                  <span>Gráficos interativos de performance</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 flex-shrink-0 mt-1" />
                  <span>Análise de origem e destino</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 flex-shrink-0 mt-1" />
                  <span>Performance por motorista</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 flex-shrink-0 mt-1" />
                  <span>Alertas e notificações prioritárias</span>
                </li>
              </ul>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-xl">
              <h4 className="font-bold text-xl mb-4 text-gray-900">Filtros Inteligentes</h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-2 p-3 bg-cyan-50 rounded-lg border-2 border-cyan-400">
                  <Calendar className="w-5 h-5 text-cyan-700" />
                  <span className="text-sm font-semibold text-gray-900">Período</span>
                </div>
                <div className="flex items-center gap-2 p-3 bg-cyan-50 rounded-lg border-2 border-cyan-400">
                  <MapPin className="w-5 h-5 text-cyan-700" />
                  <span className="text-sm font-semibold text-gray-900">Origem/Destino</span>
                </div>
                <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg border-2 border-blue-400">
                  <Users className="w-5 h-5 text-blue-700" />
                  <span className="text-sm font-semibold text-gray-900">Motorista</span>
                </div>
                <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg border-2 border-blue-400">
                  <Package className="w-5 h-5 text-blue-700" />
                  <span className="text-sm font-semibold text-gray-900">Status</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Ordens de Carregamento - Gestão Completa",
      subtitle: "Do Planejamento à Execução",
      icon: Package,
      content: (
        <div className="space-y-8">
          <div className="grid grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-cyan-500 to-cyan-600 text-white p-8 rounded-2xl shadow-2xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-white/20 rounded-xl">
                  <FileText className="w-8 h-8" />
                </div>
                <h3 className="font-bold text-2xl">Ordem Completa</h3>
              </div>
              <ul className="space-y-2 text-base">
                <li>• Dados completos da carga</li>
                <li>• Motorista e veículo alocados</li>
                <li>• Rota definida</li>
                <li>• Documentação anexada</li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-cyan-600 to-blue-600 text-white p-8 rounded-2xl shadow-2xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-white/20 rounded-xl">
                  <Package className="w-8 h-8" />
                </div>
                <h3 className="font-bold text-2xl">Oferta de Carga</h3>
              </div>
              <ul className="space-y-2 text-base">
                <li>• Cadastro rápido</li>
                <li>• Disponível para alocação</li>
                <li>• Conversão em ordem</li>
                <li>• Priorização flexível</li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-blue-600 to-blue-700 text-white p-8 rounded-2xl shadow-2xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-white/20 rounded-xl">
                  <FileSpreadsheet className="w-8 h-8" />
                </div>
                <h3 className="font-bold text-2xl">Lote/Excel</h3>
              </div>
              <ul className="space-y-2 text-base">
                <li>• Importação em massa</li>
                <li>• Template padronizado</li>
                <li>• Validação automática</li>
                <li>• Agilidade operacional</li>
              </ul>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-xl">
              <h3 className="font-bold text-2xl mb-6 flex items-center gap-3 text-gray-900">
                <Search className="w-7 h-7 text-blue-600" />
                Ferramentas de Busca
              </h3>
              <div className="space-y-4">
                <div className="p-4 bg-gradient-to-r from-cyan-50 to-cyan-100 rounded-xl border-2 border-cyan-400">
                  <div className="flex items-center gap-2 mb-2">
                    <Search className="w-5 h-5 text-cyan-700" />
                    <p className="font-semibold text-cyan-900">Busca Avançada</p>
                  </div>
                  <p className="text-sm text-gray-700">Pesquise por nº carga, cliente, motorista, placa, origem ou destino</p>
                </div>
                <div className="p-4 bg-gradient-to-r from-cyan-100 to-blue-100 rounded-xl border-2 border-cyan-500">
                  <div className="flex items-center gap-2 mb-2">
                    <Filter className="w-5 h-5 text-cyan-700" />
                    <p className="font-semibold text-cyan-900">Filtros Rápidos</p>
                  </div>
                  <p className="text-sm text-gray-700">Ofertas vs Alocados, Status, Período, Frota, Operação</p>
                </div>
                <div className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl border-2 border-blue-400">
                  <div className="flex items-center gap-2 mb-2">
                    <LayoutDashboard className="w-5 h-5 text-blue-700" />
                    <p className="font-semibold text-blue-900">Visualizações</p>
                  </div>
                  <p className="text-sm text-gray-700">Tabela detalhada, Cards visuais, Kanban, Timeline</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-xl">
              <h3 className="font-bold text-2xl mb-6 flex items-center gap-3 text-gray-900">
                <Eye className="w-7 h-7 text-cyan-600" />
                Ações e Detalhes
              </h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-cyan-50 to-cyan-100 rounded-xl border-2 border-cyan-400">
                  <Eye className="w-6 h-6 text-cyan-700" />
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">Visualizar Detalhes</p>
                    <p className="text-sm text-gray-600">Todos os dados em abas organizadas</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-cyan-100 to-blue-100 rounded-xl border-2 border-cyan-500">
                  <Edit className="w-6 h-6 text-cyan-700" />
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">Editar Ordem</p>
                    <p className="text-sm text-gray-600">Atualização de dados em tempo real</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl border-2 border-blue-400">
                  <Download className="w-6 h-6 text-blue-700" />
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">Imprimir/Exportar</p>
                    <p className="text-sm text-gray-600">PDF, Excel, relatórios customizados</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Tracking Logístico - 10 Estágios Completos",
      subtitle: "Visibilidade Total com Cálculos Automáticos",
      icon: Navigation,
      content: (
        <div className="min-h-[600px] flex flex-col justify-center space-y-8">
          <div className="grid grid-cols-10 gap-2 mb-8">
            <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg p-3 text-center border border-gray-300">
              <div className="w-8 h-8 rounded-full bg-gray-500 flex items-center justify-center text-white text-xs font-bold mx-auto mb-1">1</div>
              <p className="text-[10px] font-semibold text-gray-700">Agendamento</p>
            </div>
            <div className="bg-gradient-to-br from-cyan-50 to-cyan-100 rounded-lg p-3 text-center border border-cyan-400">
              <div className="w-8 h-8 rounded-full bg-cyan-500 flex items-center justify-center text-white text-xs font-bold mx-auto mb-1">2</div>
              <p className="text-[10px] font-semibold text-gray-700">Agendado</p>
            </div>
            <div className="bg-gradient-to-br from-cyan-100 to-cyan-200 rounded-lg p-3 text-center border border-cyan-500">
              <div className="w-8 h-8 rounded-full bg-cyan-600 flex items-center justify-center text-white text-xs font-bold mx-auto mb-1">3</div>
              <p className="text-[10px] font-semibold text-gray-700">Carregando</p>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 text-center border border-blue-400">
              <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold mx-auto mb-1">4</div>
              <p className="text-[10px] font-semibold text-gray-700">Carregado</p>
            </div>
            <div className="bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg p-3 text-center border border-blue-500">
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold mx-auto mb-1">5</div>
              <p className="text-[10px] font-semibold text-gray-700">Em Viagem</p>
            </div>
            <div className="bg-gradient-to-br from-blue-200 to-blue-300 rounded-lg p-3 text-center border border-blue-600">
              <div className="w-8 h-8 rounded-full bg-blue-700 flex items-center justify-center text-white text-xs font-bold mx-auto mb-1">6</div>
              <p className="text-[10px] font-semibold text-gray-700">Chegou</p>
            </div>
            <div className="bg-gradient-to-br from-blue-200 to-blue-300 rounded-lg p-3 text-center border border-blue-600">
              <div className="w-8 h-8 rounded-full bg-blue-700 flex items-center justify-center text-white text-xs font-bold mx-auto mb-1">7</div>
              <p className="text-[10px] font-semibold text-gray-700">Descarga Agend</p>
            </div>
            <div className="bg-gradient-to-br from-blue-300 to-blue-400 rounded-lg p-3 text-center border border-blue-700">
              <div className="w-8 h-8 rounded-full bg-blue-800 flex items-center justify-center text-white text-xs font-bold mx-auto mb-1">8</div>
              <p className="text-[10px] font-semibold text-gray-700">Descarregando</p>
            </div>
            <div className="bg-gradient-to-br from-blue-400 to-blue-500 rounded-lg p-3 text-center border border-blue-800">
              <div className="w-8 h-8 rounded-full bg-blue-900 flex items-center justify-center text-white text-xs font-bold mx-auto mb-1">9</div>
              <p className="text-[10px] font-semibold text-gray-700">Descarregado</p>
            </div>
            <div className="bg-gradient-to-br from-blue-400 to-blue-500 rounded-lg p-3 text-center border border-blue-700">
              <div className="w-8 h-8 rounded-full bg-blue-800 flex items-center justify-center text-white text-xs font-bold mx-auto mb-1">✓</div>
              <p className="text-[10px] font-semibold text-gray-700">Finalizado</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-6 mb-8">
            <div className="bg-gradient-to-br from-cyan-500 to-blue-600 text-white p-8 rounded-2xl shadow-2xl">
              <MapPin className="w-12 h-12 mx-auto mb-4" />
              <h3 className="font-bold text-2xl text-center mb-3">Localização</h3>
              <p className="text-center opacity-90">Calculo automático KM restantes via Google Distance Matrix</p>
            </div>
            <div className="bg-gradient-to-br from-blue-500 to-blue-700 text-white p-8 rounded-2xl shadow-2xl">
              <Clock className="w-12 h-12 mx-auto mb-4" />
              <h3 className="font-bold text-2xl text-center mb-3">SLA Entrega</h3>
              <p className="text-center opacity-90">Alertas visuais atraso, expurgo autorizado</p>
            </div>
            <div className="bg-gradient-to-br from-blue-600 to-blue-800 text-white p-8 rounded-2xl shadow-2xl">
              <MessageCircle className="w-12 h-12 mx-auto mb-4" />
              <h3 className="font-bold text-2xl text-center mb-3">Chat Central</h3>
              <p className="text-center opacity-90">Comunicação bidirecional tempo real</p>
            </div>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-xl">
            <h3 className="font-bold text-2xl text-center mb-6 text-gray-900">Múltiplas Visualizações</h3>
            <div className="grid grid-cols-3 gap-6">
              <div className="p-5 bg-gradient-to-br from-cyan-50 to-cyan-100 rounded-xl border-2 border-cyan-500">
                <div className="flex items-center gap-2 mb-2">
                  <TableIcon className="w-5 h-5 text-cyan-700" />
                  <p className="font-bold text-lg text-cyan-900">Tabela Completa</p>
                </div>
                <p className="text-sm text-gray-700">Drag-scroll horizontal, ordenação, filtros avançados</p>
              </div>
              <div className="p-5 bg-gradient-to-br from-cyan-100 to-blue-100 rounded-xl border-2 border-cyan-600">
                <div className="flex items-center gap-2 mb-2">
                  <FileSpreadsheet className="w-5 h-5 text-cyan-700" />
                  <p className="font-bold text-lg text-blue-900">Planilha Editável</p>
                </div>
                <p className="text-sm text-gray-700">Edição inline estilo Excel, auto-save</p>
              </div>
              <div className="p-5 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border-2 border-blue-500">
                <div className="flex items-center gap-2 mb-2">
                  <Eye className="w-5 h-5 text-blue-700" />
                  <p className="font-bold text-lg text-blue-900">Modo TV</p>
                </div>
                <p className="text-sm text-gray-700">Fullscreen auto-refresh monitor parede</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-cyan-600 to-blue-700 text-white p-6 rounded-2xl shadow-2xl text-center">
            <p className="text-2xl font-bold">Redução de 70% em ligações telefônicas para consultar status</p>
          </div>
        </div>
      )
    },
    {
      title: "Portal B2B - Coletas e Aprovações",
      subtitle: "Self-Service para Fornecedores e Clientes",
      icon: Users,
      content: (
        <div className="min-h-[600px] flex flex-col justify-center space-y-8">
          <div className="grid grid-cols-3 gap-6 mb-8">
            <div className="bg-gradient-to-br from-cyan-50 to-cyan-100 rounded-2xl p-6 border-2 border-cyan-500 shadow-xl">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-cyan-500 to-cyan-600 flex items-center justify-center text-white font-bold text-2xl mx-auto mb-4">1</div>
              <h3 className="font-bold text-xl text-center text-gray-900 mb-3">Fornecedor Solicita</h3>
              <p className="text-sm text-gray-600 text-center">Upload XMLs NF-e, dados carga, envio aprovação cliente</p>
            </div>
            
            <div className="bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl p-6 border-2 border-blue-500 shadow-xl">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-2xl mx-auto mb-4">2</div>
              <h3 className="font-bold text-xl text-center text-gray-900 mb-3">Cliente Aprova</h3>
              <p className="text-sm text-gray-600 text-center">Portal aprovações, visualiza detalhes, aprovar/reprovar</p>
            </div>
            
            <div className="bg-gradient-to-br from-blue-300 to-blue-400 rounded-2xl p-6 border-2 border-blue-700 shadow-xl">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-700 to-blue-800 flex items-center justify-center text-white font-bold text-2xl mx-auto mb-4">3</div>
              <h3 className="font-bold text-xl text-center text-gray-900 mb-3">Conversão Automática</h3>
              <p className="text-sm text-gray-600 text-center">Solicitação aprovada vira ordem carregamento</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8">
            <div className="bg-white rounded-2xl p-8 shadow-xl">
              <h3 className="font-bold text-2xl text-cyan-900 mb-6">Fornecedor</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-cyan-50 to-cyan-100 rounded-xl border-l-4 border-cyan-600">
                  <FileText className="w-6 h-6 text-cyan-700" />
                  <p className="font-semibold text-gray-900">Solicitar Coleta Self-Service</p>
                </div>
                <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-cyan-100 to-blue-100 rounded-xl border-l-4 border-cyan-600">
                  <Package className="w-6 h-6 text-cyan-700" />
                  <p className="font-semibold text-gray-900">Upload XMLs NF-e</p>
                </div>
                <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl border-l-4 border-blue-600">
                  <Eye className="w-6 h-6 text-blue-700" />
                  <p className="font-semibold text-gray-900">Acompanhar Status</p>
                </div>
                <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-blue-100 to-blue-200 rounded-xl border-l-4 border-blue-700">
                  <Navigation className="w-6 h-6 text-blue-700" />
                  <p className="font-semibold text-gray-900">Tracking Tempo Real</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-xl">
              <h3 className="font-bold text-2xl text-blue-900 mb-6">Cliente</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-cyan-50 to-cyan-100 rounded-xl border-l-4 border-cyan-600">
                  <CheckCircle2 className="w-6 h-6 text-cyan-700" />
                  <p className="font-semibold text-gray-900">Aprovar/Reprovar Coletas</p>
                </div>
                <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-cyan-100 to-blue-100 rounded-xl border-l-4 border-cyan-600">
                  <FileText className="w-6 h-6 text-cyan-700" />
                  <p className="font-semibold text-gray-900">Visualizar XMLs e Detalhes</p>
                </div>
                <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl border-l-4 border-blue-600">
                  <Bell className="w-6 h-6 text-blue-700" />
                  <p className="font-semibold text-gray-900">Notificações Automáticas</p>
                </div>
                <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-blue-100 to-blue-200 rounded-xl border-l-4 border-blue-700">
                  <BarChart3 className="w-6 h-6 text-blue-700" />
                  <p className="font-semibold text-gray-900">Dashboard Métricas</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-cyan-600 to-blue-700 text-white p-8 rounded-2xl shadow-2xl text-center">
            <p className="text-3xl font-bold mb-3">Processo de coleta totalmente digital</p>
            <p className="text-xl opacity-90">De dias para minutos • Sem ligações • Rastreável</p>
          </div>
        </div>
      )
    },

    {
      title: "Workflow BPMN - Processos Customizáveis",
      subtitle: "Etapas Configuráveis com SLA Granular",
      icon: Workflow,
      content: (
        <div className="min-h-[600px] flex flex-col justify-center space-y-8">
          <div className="bg-gradient-to-r from-cyan-500 to-blue-700 text-white p-10 rounded-2xl shadow-2xl">
            <h3 className="font-bold text-3xl mb-8 text-center">Crie seu Próprio Workflow</h3>
            <div className="grid grid-cols-5 gap-4">
              <div className="text-center p-5 bg-white/20 rounded-xl border-2 border-white/40">
                <div className="w-12 h-12 rounded-full bg-cyan-400 mx-auto mb-3 flex items-center justify-center text-white font-bold text-xl">1</div>
                <p className="font-bold text-sm">Cadastro</p>
              </div>
              <div className="text-center p-5 bg-white/20 rounded-xl border-2 border-white/40">
                <div className="w-12 h-12 rounded-full bg-cyan-300 mx-auto mb-3 flex items-center justify-center text-white font-bold text-xl">2</div>
                <p className="font-bold text-sm">Rastreamento</p>
              </div>
              <div className="text-center p-5 bg-white/20 rounded-xl border-2 border-white/40">
                <div className="w-12 h-12 rounded-full bg-blue-400 mx-auto mb-3 flex items-center justify-center text-white font-bold text-xl">3</div>
                <p className="font-bold text-sm">Expedição</p>
              </div>
              <div className="text-center p-5 bg-white/20 rounded-xl border-2 border-white/40">
                <div className="w-12 h-12 rounded-full bg-blue-600 mx-auto mb-3 flex items-center justify-center text-white font-bold text-xl">4</div>
                <p className="font-bold text-sm">Financeiro</p>
              </div>
              <div className="text-center p-5 bg-white/20 rounded-xl border-2 border-white/40">
                <div className="w-12 h-12 rounded-full bg-blue-800 mx-auto mb-3 flex items-center justify-center text-white font-bold text-xl">✓</div>
                <p className="font-bold text-sm">Finalização</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl shadow-xl">
              <div className="flex items-center gap-3 mb-4">
                <Clock className="w-10 h-10 text-cyan-600" />
                <h3 className="font-bold text-xl text-gray-900">SLA Granular</h3>
              </div>
              <ul className="space-y-2 text-sm text-gray-800">
                <li>• Prazos em dias/horas/minutos</li>
                <li>• 3 modos contagem prazo</li>
                <li>• Expediente configurável</li>
                <li>• Alertas automáticos</li>
              </ul>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-xl">
              <div className="flex items-center gap-3 mb-4">
                <FileText className="w-10 h-10 text-blue-600" />
                <h3 className="font-bold text-xl text-gray-900">Campos Custom</h3>
              </div>
              <ul className="space-y-2 text-sm text-gray-800">
                <li>• Texto, checklist, anexo</li>
                <li>• Monetário, booleano, data</li>
                <li>• Obrigatórios ou opcionais</li>
                <li>• Validação inteligente</li>
              </ul>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-xl">
              <div className="flex items-center gap-3 mb-4">
                <Users className="w-10 h-10 text-blue-700" />
                <h3 className="font-bold text-xl text-gray-900">Atribuição</h3>
              </div>
              <ul className="space-y-2 text-sm text-gray-800">
                <li>• Responsável por usuário</li>
                <li>• Por departamento</li>
                <li>• Timeline visual progresso</li>
                <li>• Histórico auditável</li>
              </ul>
            </div>
          </div>

          <div className="bg-gradient-to-r from-cyan-600 via-blue-600 to-blue-700 text-white p-8 rounded-2xl shadow-2xl text-center">
            <p className="text-2xl font-bold mb-2">Adapte o sistema aos seus processos</p>
            <p className="text-lg opacity-90">Não mude seus processos para se adaptar ao sistema</p>
          </div>
        </div>
      )
    },
    {
      title: "Gestão de Ocorrências",
      subtitle: "Identificação e Resolução de Problemas",
      icon: Shield,
      content: (
        <div className="space-y-8">
          <div className="grid grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-xl">
              <h3 className="font-bold text-2xl mb-6 flex items-center gap-3 text-gray-900">
                <AlertCircle className="w-8 h-8 text-cyan-600" />
                Tipos de Ocorrências
              </h3>
              <div className="space-y-3">
                <div className="p-4 bg-gradient-to-r from-cyan-50 to-cyan-100 rounded-xl border-l-4 border-cyan-600">
                  <div className="flex items-center gap-2 mb-1">
                    <Navigation className="w-5 h-5 text-cyan-700" />
                    <p className="font-bold text-cyan-900">Tracking (Viagem)</p>
                  </div>
                  <p className="text-sm text-gray-700">Problemas na estrada, atrasos, acidentes</p>
                </div>
                <div className="p-4 bg-gradient-to-r from-cyan-100 to-blue-100 rounded-xl border-l-4 border-cyan-600">
                  <div className="flex items-center gap-2 mb-1">
                    <Workflow className="w-5 h-5 text-cyan-700" />
                    <p className="font-bold text-cyan-900">Fluxo (Processos)</p>
                  </div>
                  <p className="text-sm text-gray-700">Bloqueios em etapas internas, documentação</p>
                </div>
                <div className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl border-l-4 border-blue-600">
                  <div className="flex items-center gap-2 mb-1">
                    <Settings className="w-5 h-5 text-blue-700" />
                    <p className="font-bold text-blue-900">Configuráveis</p>
                  </div>
                  <p className="text-sm text-gray-700">Tipos personalizados por empresa</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-700 to-blue-800 text-white p-8 rounded-2xl shadow-2xl">
              <h3 className="font-bold text-2xl mb-6">Níveis de Gravidade</h3>
              <div className="space-y-4">
                <div className="p-4 bg-white/20 rounded-xl border-2 border-white/40">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-lg">Baixa</span>
                    <span className="text-sm">-5 pts</span>
                  </div>
                  <p className="text-sm opacity-90">Impacto mínimo, resolução rápida</p>
                </div>
                <div className="p-4 bg-white/20 rounded-xl border-2 border-white/40">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-lg">Média</span>
                    <span className="text-sm">-10 pts</span>
                  </div>
                  <p className="text-sm opacity-90">Requer atenção, prazo definido</p>
                </div>
                <div className="p-4 bg-white/20 rounded-xl border-2 border-white/40">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-lg">Alta</span>
                    <span className="text-sm">-20 pts</span>
                  </div>
                  <p className="text-sm opacity-90">Urgente, impacto significativo</p>
                </div>
                <div className="p-4 bg-white/20 rounded-xl border-2 border-white/40">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-lg">Crítica</span>
                    <span className="text-sm">-40 pts</span>
                  </div>
                  <p className="text-sm opacity-90">Bloqueio total, ação imediata</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl shadow-xl">
              <div className="flex items-center gap-3 mb-4">
                <Camera className="w-8 h-8 text-blue-600" />
                <h4 className="font-bold text-xl text-gray-900">Evidências</h4>
              </div>
              <ul className="space-y-2 text-sm text-gray-900">
                <li>• Upload de fotos</li>
                <li>• Localização GPS</li>
                <li>• Data e hora exatas</li>
                <li>• Histórico completo</li>
              </ul>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-xl">
              <div className="flex items-center gap-3 mb-4">
                <Users className="w-8 h-8 text-cyan-600" />
                <h4 className="font-bold text-xl text-gray-900">Atribuição</h4>
              </div>
              <ul className="space-y-2 text-sm text-gray-900">
                <li>• Responsável definido</li>
                <li>• Prazo de resolução</li>
                <li>• Notificações automáticas</li>
                <li>• Escalação se necessário</li>
              </ul>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-xl">
              <div className="flex items-center gap-3 mb-4">
                <BarChart3 className="w-8 h-8 text-blue-600" />
                <h4 className="font-bold text-xl text-gray-900">Análises</h4>
              </div>
              <ul className="space-y-2 text-sm text-gray-900">
                <li>• Tempo médio de resolução</li>
                <li>• Taxa de recorrência</li>
                <li>• Impacto no SLA</li>
                <li>• Relatórios gerenciais</li>
              </ul>
            </div>
          </div>

          <div className="bg-gradient-to-r from-cyan-500 to-blue-700 text-white p-8 rounded-2xl shadow-2xl">
            <h3 className="font-bold text-2xl mb-6 flex items-center gap-3">
              <CheckCircle2 className="w-8 h-8" />
              Fluxo de Resolução
            </h3>
            <div className="grid grid-cols-5 gap-4">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-white/30 mx-auto mb-3 flex items-center justify-center text-white font-bold text-xl border-2 border-white">1</div>
                <p className="font-semibold">Registro</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-white/30 mx-auto mb-3 flex items-center justify-center text-white font-bold text-xl border-2 border-white">2</div>
                <p className="font-semibold">Atribuição</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-white/30 mx-auto mb-3 flex items-center justify-center text-white font-bold text-xl border-2 border-white">3</div>
                <p className="font-semibold">Tratamento</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-white/30 mx-auto mb-3 flex items-center justify-center text-white font-bold text-xl border-2 border-white">4</div>
                <p className="font-semibold">Resolução</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-white/30 mx-auto mb-3 flex items-center justify-center text-white font-bold text-xl border-2 border-white">5</div>
                <p className="font-semibold">Análise</p>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Gamificação e SLA",
      subtitle: "Métricas de Performance e Reconhecimento",
      icon: Award,
      content: (
        <div className="space-y-8">
          <div className="bg-gradient-to-r from-cyan-400 via-cyan-500 to-blue-600 text-white p-10 rounded-2xl shadow-2xl">
            <h3 className="font-bold text-3xl mb-8 flex items-center gap-4">
              <Award className="w-12 h-12" />
              Sistema de Níveis e Evolução
            </h3>
            <div className="grid grid-cols-5 gap-4">
              <div className="text-center bg-white/20 p-5 rounded-xl border-2 border-white/40">
                <div className="w-12 h-12 rounded-full bg-white/30 mx-auto mb-2 flex items-center justify-center text-white font-bold text-lg">1</div>
                <p className="font-bold text-xl mb-1">Iniciante</p>
                <p className="text-sm">0-100 pts</p>
              </div>
              <div className="text-center bg-white/20 p-5 rounded-xl border-2 border-white/40">
                <div className="w-12 h-12 rounded-full bg-white/30 mx-auto mb-2 flex items-center justify-center text-white font-bold text-lg">2</div>
                <p className="font-bold text-xl mb-1">Cadete</p>
                <p className="text-sm">101-300 pts</p>
              </div>
              <div className="text-center bg-white/20 p-5 rounded-xl border-2 border-white/40">
                <div className="w-12 h-12 rounded-full bg-white/30 mx-auto mb-2 flex items-center justify-center text-white font-bold text-lg">3</div>
                <p className="font-bold text-xl mb-1">Operacional</p>
                <p className="text-sm">301-600 pts</p>
              </div>
              <div className="text-center bg-white/20 p-5 rounded-xl border-2 border-white/40">
                <div className="w-12 h-12 rounded-full bg-white/30 mx-auto mb-2 flex items-center justify-center text-white font-bold text-lg">4</div>
                <p className="font-bold text-xl mb-1">Mestre</p>
                <p className="text-sm">601-1000 pts</p>
              </div>
              <div className="text-center bg-white/20 p-5 rounded-xl border-2 border-white/40">
                <div className="w-12 h-12 rounded-full bg-white/30 mx-auto mb-2 flex items-center justify-center text-white font-bold text-lg">5</div>
                <p className="font-bold text-xl mb-1">Comandante</p>
                <p className="text-sm">1000+ pts</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-xl">
              <h3 className="font-bold text-2xl mb-6 text-blue-900">Cálculo do SLA</h3>
              <div className="space-y-4">
                <div className="p-5 bg-gradient-to-r from-cyan-50 to-cyan-100 rounded-xl border-2 border-cyan-400">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-lg text-gray-900">Qualidade</span>
                    <span className="text-2xl font-bold text-cyan-700">60%</span>
                  </div>
                  <p className="text-sm text-gray-700">Baseado em ocorrências e problemas</p>
                </div>
                <div className="p-5 bg-gradient-to-r from-cyan-100 to-blue-100 rounded-xl border-2 border-cyan-500">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-lg text-gray-900">Produtividade</span>
                    <span className="text-2xl font-bold text-cyan-700">40%</span>
                  </div>
                  <p className="text-sm text-gray-700">Ordens criadas e etapas concluídas</p>
                </div>
                <div className="p-6 bg-gradient-to-r from-cyan-600 to-blue-700 text-white rounded-xl border-4 border-blue-800 shadow-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-2xl">SLA Final</span>
                    <span className="text-5xl font-bold">95%</span>
                  </div>
                  <p className="text-sm opacity-90">Score total do mês</p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-gradient-to-br from-cyan-500 to-cyan-600 text-white p-6 rounded-2xl shadow-xl">
                <h4 className="font-bold text-xl mb-4">Pontos Positivos</h4>
                <ul className="space-y-2 text-sm">
                  <li>• Ordem criada: <strong>+10 pts</strong></li>
                  <li>• Etapa concluída: <strong>+5 pts</strong></li>
                  <li>• No prazo: <strong>+3 pts</strong></li>
                  <li>• Resolução rápida: <strong>+10 pts</strong></li>
                  <li>• Acima da média: <strong>+20 pts</strong></li>
                </ul>
              </div>

              <div className="bg-gradient-to-br from-blue-600 to-blue-700 text-white p-6 rounded-2xl shadow-xl">
                <h4 className="font-bold text-xl mb-4">Penalidades</h4>
                <ul className="space-y-2 text-sm">
                  <li>• Ocorrência baixa: <strong>-5 pts</strong></li>
                  <li>• Ocorrência média: <strong>-10 pts</strong></li>
                  <li>• Ocorrência alta: <strong>-20 pts</strong></li>
                  <li>• Ocorrência crítica: <strong>-40 pts</strong></li>
                  <li>• Resolução atrasada: <strong>-15 pts</strong></li>
                </ul>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl shadow-xl">
              <h4 className="font-bold text-xl mb-4 flex items-center gap-2 text-gray-900">
                <TrendingUp className="w-6 h-6 text-blue-600" />
                Rankings
              </h4>
              <ul className="space-y-2 text-sm text-gray-900">
                <li>• Ranking geral acumulado</li>
                <li>• Ranking mensal</li>
                <li>• Por categoria de usuário</li>
                <li>• Comparativo com média</li>
              </ul>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-xl">
              <h4 className="font-bold text-xl mb-4 flex items-center gap-2 text-gray-900">
                <BarChart3 className="w-6 h-6 text-cyan-600" />
                Histórico
              </h4>
              <ul className="space-y-2 text-sm text-gray-900">
                <li>• Performance mensal</li>
                <li>• Evolução ao longo do tempo</li>
                <li>• Métricas detalhadas</li>
                <li>• Expurgo de medições</li>
              </ul>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-xl">
              <h4 className="font-bold text-xl mb-4 flex items-center gap-2 text-gray-900">
                <Target className="w-6 h-6 text-blue-700" />
                Metas
              </h4>
              <ul className="space-y-2 text-sm text-gray-900">
                <li>• Meta mensal de 95% SLA</li>
                <li>• Configurável por perfil</li>
                <li>• Feedback em tempo real</li>
                <li>• Cultura de excelência</li>
              </ul>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Gestão de Recursos",
      subtitle: "Motoristas, Veículos e Operações",
      icon: Users,
      content: (
        <div className="space-y-8">
          <div className="grid grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-cyan-400 to-cyan-600 text-white p-8 rounded-2xl shadow-2xl">
              <Users className="w-12 h-12 mb-4" />
              <h3 className="font-bold text-2xl mb-4">Motoristas</h3>
              <ul className="space-y-2 text-base">
                <li>• Cadastro completo com documentos</li>
                <li>• Controle de CNH e vencimentos</li>
                <li>• Histórico de viagens</li>
                <li>• Vinculação de veículos</li>
                <li>• Status ativo/inativo</li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-cyan-500 to-blue-500 text-white p-8 rounded-2xl shadow-2xl">
              <Truck className="w-12 h-12 mb-4" />
              <h3 className="font-bold text-2xl mb-4">Veículos</h3>
              <ul className="space-y-2 text-base">
                <li>• Cadastro de cavalos e implementos</li>
                <li>• Documentação e licenciamento</li>
                <li>• Consulta ANTT integrada</li>
                <li>• Manutenções e histórico</li>
                <li>• Disponibilidade em tempo real</li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-blue-500 to-blue-700 text-white p-8 rounded-2xl shadow-2xl">
              <Target className="w-12 h-12 mb-4" />
              <h3 className="font-bold text-2xl mb-4">Operações</h3>
              <ul className="space-y-2 text-base">
                <li>• Tipos de operação configuráveis</li>
                <li>• Prioridades e modalidades</li>
                <li>• Tolerância de diárias</li>
                <li>• Regras específicas por operação</li>
                <li>• Análise de performance</li>
              </ul>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-xl">
              <h3 className="font-bold text-2xl mb-6 text-gray-900">App do Motorista</h3>
              <div className="space-y-4">
                <div className="p-4 bg-gradient-to-r from-cyan-50 to-cyan-100 rounded-xl border-2 border-cyan-400">
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="w-5 h-5 text-cyan-700" />
                    <p className="font-semibold text-cyan-900">Viagens Ativas</p>
                  </div>
                  <p className="text-sm text-gray-700">Visualização de todas as viagens atribuídas</p>
                </div>
                <div className="p-4 bg-gradient-to-r from-cyan-100 to-blue-100 rounded-xl border-2 border-cyan-500">
                  <div className="flex items-center gap-2 mb-2">
                    <Navigation className="w-5 h-5 text-cyan-700" />
                    <p className="font-semibold text-cyan-900">Atualização de Status</p>
                  </div>
                  <p className="text-sm text-gray-700">Mudança de status com um toque</p>
                </div>
                <div className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl border-2 border-blue-400">
                  <div className="flex items-center gap-2 mb-2">
                    <MessageCircle className="w-5 h-5 text-blue-700" />
                    <p className="font-semibold text-blue-900">Chat Integrado</p>
                  </div>
                  <p className="text-sm text-gray-700">Comunicação direta com a central</p>
                </div>
                <div className="p-4 bg-gradient-to-r from-blue-100 to-blue-200 rounded-xl border-2 border-blue-500">
                  <div className="flex items-center gap-2 mb-2">
                    <Camera className="w-5 h-5 text-blue-700" />
                    <p className="font-semibold text-blue-900">Upload de Documentos</p>
                  </div>
                  <p className="text-sm text-gray-700">Fotos de canhoto, carga e CT-e</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-xl">
              <h3 className="font-bold text-2xl mb-6 text-gray-900">Configurações</h3>
              <div className="space-y-4">
                <div className="p-4 bg-gradient-to-r from-cyan-50 to-cyan-100 rounded-xl border-2 border-cyan-400">
                  <div className="flex items-center gap-2 mb-2">
                    <Building2 className="w-5 h-5 text-cyan-700" />
                    <p className="font-semibold text-cyan-900">Dados da Empresa</p>
                  </div>
                  <p className="text-sm text-gray-700">CNPJ, razão social, endereço, logo</p>
                </div>
                <div className="p-4 bg-gradient-to-r from-cyan-100 to-blue-100 rounded-xl border-2 border-cyan-500">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="w-5 h-5 text-cyan-700" />
                    <p className="font-semibold text-cyan-900">Gestão de Usuários</p>
                  </div>
                  <p className="text-sm text-gray-700">Perfis, permissões, categorias</p>
                </div>
                <div className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl border-2 border-blue-400">
                  <div className="flex items-center gap-2 mb-2">
                    <Workflow className="w-5 h-5 text-blue-700" />
                    <p className="font-semibold text-blue-900">Etapas do Fluxo</p>
                  </div>
                  <p className="text-sm text-gray-700">Criação e configuração de processos</p>
                </div>
                <div className="p-4 bg-gradient-to-r from-blue-100 to-blue-200 rounded-xl border-2 border-blue-500">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="w-5 h-5 text-blue-700" />
                    <p className="font-semibold text-blue-900">Tipos de Ocorrências</p>
                  </div>
                  <p className="text-sm text-gray-700">Cadastro personalizado de problemas</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-cyan-600 to-blue-700 text-white p-10 rounded-2xl shadow-2xl">
            <h3 className="font-bold text-3xl mb-6 text-center">Integração Total</h3>
            <p className="text-xl text-center leading-relaxed mb-8">
              Todos os módulos trabalham de forma integrada, compartilhando dados em tempo real
              para garantir uma operação <strong>fluida</strong>, <strong>rastreável</strong> e <strong>eficiente</strong>.
            </p>
            <div className="grid grid-cols-4 gap-6">
              <div className="text-center bg-white/20 p-4 rounded-xl border-2 border-white/40">
                <RefreshCw className="w-12 h-12 mx-auto mb-2" />
                <p className="font-semibold">Sincronização</p>
              </div>
              <div className="text-center bg-white/20 p-4 rounded-xl border-2 border-white/40">
                <BarChart3 className="w-12 h-12 mx-auto mb-2" />
                <p className="font-semibold">Relatórios</p>
              </div>
              <div className="text-center bg-white/20 p-4 rounded-xl border-2 border-white/40">
                <Bell className="w-12 h-12 mx-auto mb-2" />
                <p className="font-semibold">Notificações</p>
              </div>
              <div className="text-center bg-white/20 p-4 rounded-xl border-2 border-white/40">
                <Settings className="w-12 h-12 mx-auto mb-2" />
                <p className="font-semibold">Personalização</p>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "PDCA - Melhoria Contínua",
      subtitle: "Ciclo de Qualidade em Cada Processo",
      icon: RefreshCw,
      content: (
        <div className="grid grid-cols-2 gap-8">
          <div className="bg-gradient-to-br from-cyan-500 to-cyan-600 text-white p-8 rounded-2xl shadow-2xl border-4 border-cyan-700">
            <h3 className="font-bold text-3xl mb-6 flex items-center gap-3">
              <Target className="w-10 h-10" />
              PLAN (Planejar)
            </h3>
            <ul className="space-y-3 text-base">
              <li>• Configuração de etapas e prazos</li>
              <li>• Definição de metas de SLA</li>
              <li>• Campos e requisitos por etapa</li>
              <li>• Tipos de ocorrências cadastrados</li>
            </ul>
          </div>

          <div className="bg-gradient-to-br from-cyan-600 to-blue-500 text-white p-8 rounded-2xl shadow-2xl border-4 border-blue-600">
            <h3 className="font-bold text-3xl mb-6 flex items-center gap-3">
              <Zap className="w-10 h-10" />
              DO (Fazer)
            </h3>
            <ul className="space-y-3 text-base">
              <li>• Execução do fluxo operacional</li>
              <li>• Registro de atividades</li>
              <li>• Tracking em tempo real</li>
              <li>• Documentação de processos</li>
            </ul>
          </div>

          <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-8 rounded-2xl shadow-2xl border-4 border-blue-700">
            <h3 className="font-bold text-3xl mb-6 flex items-center gap-3">
              <BarChart3 className="w-10 h-10" />
              CHECK (Verificar)
            </h3>
            <ul className="space-y-3 text-base">
              <li>• Indicadores de SLA</li>
              <li>• Rankings e comparativos</li>
              <li>• Análise de ocorrências</li>
              <li>• Métricas de produtividade</li>
            </ul>
          </div>

          <div className="bg-gradient-to-br from-blue-600 to-blue-700 text-white p-8 rounded-2xl shadow-2xl border-4 border-blue-800">
            <h3 className="font-bold text-3xl mb-6 flex items-center gap-3">
              <TrendingUp className="w-10 h-10" />
              ACT (Agir)
            </h3>
            <ul className="space-y-3 text-base">
              <li>• Ajustes nas configurações</li>
              <li>• Expurgo de medições</li>
              <li>• Correção de processos</li>
              <li>• Melhoria contínua</li>
            </ul>
          </div>
        </div>
      )
    },
    {
      title: "Resultados Comprovados",
      subtitle: "Métricas Reais de 30 Dias de Operação",
      icon: TrendingUp,
      content: (
        <div className="min-h-[600px] flex flex-col justify-center space-y-8">
          <div className="grid grid-cols-3 gap-6 mb-8">
            <div className="bg-gradient-to-br from-cyan-400 to-cyan-600 text-white p-10 rounded-2xl shadow-2xl">
              <div className="text-center">
                <div className="text-7xl font-bold mb-4">+10pp</div>
                <p className="text-2xl font-bold mb-2">SLA Entregas</p>
                <p className="text-lg opacity-90">De 78% para 88%</p>
              </div>
            </div>

            <div className="bg-gradient-to-br from-cyan-500 to-blue-500 text-white p-10 rounded-2xl shadow-2xl">
              <div className="text-center">
                <div className="text-7xl font-bold mb-4">-75%</div>
                <p className="text-2xl font-bold mb-2">Tempo Cadastro</p>
                <p className="text-lg opacity-90">De 18min para 4min</p>
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-500 to-blue-700 text-white p-10 rounded-2xl shadow-2xl">
              <div className="text-center">
                <div className="text-7xl font-bold mb-4">-70%</div>
                <p className="text-2xl font-bold mb-2">Ligações Tel</p>
                <p className="text-lg opacity-90">Redução comunicação</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8">
            <div className="bg-white rounded-2xl p-8 shadow-xl">
              <h3 className="font-bold text-2xl text-blue-900 mb-6">Métricas de Adoção</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-cyan-50 to-cyan-100 rounded-xl border-l-4 border-cyan-600">
                  <span className="font-semibold text-gray-900">Taxa Adoção</span>
                  <span className="text-2xl font-bold text-cyan-700">90%</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-cyan-100 to-blue-100 rounded-xl border-l-4 border-cyan-600">
                  <span className="font-semibold text-gray-900">DAU/MAU</span>
                  <span className="text-2xl font-bold text-cyan-700">0,6</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl border-l-4 border-blue-600">
                  <span className="font-semibold text-gray-900">Time to Value</span>
                  <span className="text-2xl font-bold text-blue-700">&lt; 24h</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-xl">
              <h3 className="font-bold text-2xl text-blue-900 mb-6">Satisfação</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-cyan-50 to-cyan-100 rounded-xl border-l-4 border-cyan-600">
                  <span className="font-semibold text-gray-900">NPS</span>
                  <span className="text-2xl font-bold text-cyan-700">8/10</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-cyan-100 to-blue-100 rounded-xl border-l-4 border-cyan-600">
                  <span className="font-semibold text-gray-900">SUS Score</span>
                  <span className="text-2xl font-bold text-cyan-700">80/100</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl border-l-4 border-blue-600">
                  <span className="font-semibold text-gray-900">Taxa Resolução</span>
                  <span className="text-2xl font-bold text-blue-700">70%</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-cyan-600 via-blue-600 to-blue-700 text-white p-12 rounded-2xl shadow-2xl text-center">
            <p className="text-4xl font-bold mb-4">Product-Market Fit Validado</p>
            <p className="text-2xl opacity-90">Todas métricas superaram metas em 30 dias</p>
          </div>
        </div>
      )
    },
    {
      title: "Tecnologia de Ponta",
      subtitle: "Stack Moderna • Escalável • Segura",
      icon: Zap,
      content: (
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-cyan-500 to-cyan-600 text-white p-6 rounded-2xl border-4 border-cyan-700 shadow-xl">
            <h3 className="font-bold text-2xl mb-3 flex items-center gap-3">
              <span className="bg-white text-cyan-600 w-10 h-10 rounded-full flex items-center justify-center font-bold text-xl border-2 border-white">1</span>
              SEIRI (Senso de Utilização)
            </h3>
            <p className="text-base leading-relaxed">
              <strong>No sistema:</strong> Filtros e busca avançada para encontrar apenas informações necessárias. Organização de dados por relevância.
            </p>
          </div>

          <div className="bg-gradient-to-br from-cyan-600 to-blue-600 text-white p-6 rounded-2xl border-4 border-blue-700 shadow-xl">
            <h3 className="font-bold text-2xl mb-3 flex items-center gap-3">
              <span className="bg-white text-cyan-600 w-10 h-10 rounded-full flex items-center justify-center font-bold text-xl border-2 border-white">2</span>
              SEITON (Senso de Organização)
            </h3>
            <p className="text-base leading-relaxed">
              <strong>No sistema:</strong> Estrutura clara com módulos específicos. Timeline visual. Cards organizados por status e prioridade.
            </p>
          </div>

          <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-2xl border-4 border-blue-700 shadow-xl">
            <h3 className="font-bold text-2xl mb-3 flex items-center gap-3">
              <span className="bg-white text-blue-600 w-10 h-10 rounded-full flex items-center justify-center font-bold text-xl border-2 border-white">3</span>
              SEISO (Senso de Limpeza)
            </h3>
            <p className="text-base leading-relaxed">
              <strong>No sistema:</strong> Interface limpa e moderna. Dados sempre atualizados. Histórico completo de ações e alterações.
            </p>
          </div>

          <div className="bg-gradient-to-br from-blue-600 to-blue-700 text-white p-6 rounded-2xl border-4 border-blue-800 shadow-xl">
            <h3 className="font-bold text-2xl mb-3 flex items-center gap-3">
              <span className="bg-white text-blue-700 w-10 h-10 rounded-full flex items-center justify-center font-bold text-xl border-2 border-white">4</span>
              SEIKETSU (Senso de Padronização)
            </h3>
            <p className="text-base leading-relaxed">
              <strong>No sistema:</strong> Fluxos padronizados e replicáveis. Templates de processos. Configurações unificadas para toda equipe.
            </p>
          </div>

          <div className="bg-gradient-to-br from-blue-700 to-blue-800 text-white p-6 rounded-2xl border-4 border-blue-900 shadow-xl">
            <h3 className="font-bold text-2xl mb-3 flex items-center gap-3">
              <span className="bg-white text-blue-800 w-10 h-10 rounded-full flex items-center justify-center font-bold text-xl border-2 border-white">5</span>
              SHITSUKE (Senso de Autodisciplina)
            </h3>
            <p className="text-base leading-relaxed">
              <strong>No sistema:</strong> Gamificação incentiva boas práticas. Rankings mensais. Metas e feedback constante. Cultura de melhoria contínua.
            </p>
          </div>
        </div>
      )
    },
    {
      title: "Por Que Escolher Nossa Solução?",
      subtitle: "Diferenciais Competitivos Únicos no Mercado",
      icon: Award,
      content: (
        <div className="min-h-[600px] flex flex-col justify-center space-y-10">
          <div className="grid grid-cols-2 gap-8">
            <div className="bg-gradient-to-br from-cyan-400 to-cyan-600 text-white p-10 rounded-2xl shadow-2xl">
              <Zap className="w-16 h-16 mb-4" />
              <h3 className="font-bold text-2xl mb-4">Eficiência 10x</h3>
              <ul className="text-base space-y-2">
                <li>• 75% menos tempo cadastro</li>
                <li>• Processos automatizados</li>
                <li>• Importação PDF/Excel</li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-cyan-500 to-blue-500 text-white p-10 rounded-2xl shadow-2xl">
              <CheckCircle2 className="w-16 h-16 mb-4" />
              <h3 className="font-bold text-2xl mb-4">Qualidade Comprovada</h3>
              <ul className="text-base space-y-2">
                <li>• SLA +10 pontos percentuais</li>
                <li>• 70% menos ocorrências</li>
                <li>• Conformidade garantida</li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-10 rounded-2xl shadow-2xl">
              <TrendingUp className="w-16 h-16 mb-4" />
              <h3 className="font-bold text-2xl mb-4">Crescimento Real</h3>
              <ul className="text-base space-y-2">
                <li>• +40% produtividade operadores</li>
                <li>• NPS 8/10</li>
                <li>• 90% taxa de adoção</li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-blue-600 to-blue-700 text-white p-10 rounded-2xl shadow-2xl">
              <Award className="w-16 h-16 mb-4" />
              <h3 className="font-bold text-2xl mb-4">Único no Mercado</h3>
              <ul className="text-base space-y-2">
                <li>• Gamificação integrada</li>
                <li>• Workflow 100% customizável</li>
                <li>• WMS + Portal B2B inclusos</li>
              </ul>
            </div>
          </div>

          <div className="bg-gradient-to-r from-cyan-500 via-blue-600 to-blue-700 text-white p-12 rounded-2xl text-center shadow-2xl">
            <h3 className="font-bold text-4xl mb-6">Resultado Final</h3>
            <p className="text-2xl mb-10 leading-relaxed">
              Operação mais <strong>eficiente</strong>, equipe mais <strong>motivada</strong>,
              resultados mais <strong>consistentes</strong>.
            </p>
            <div className="grid grid-cols-3 gap-8">
              <div className="text-center bg-white/20 p-6 rounded-xl border-2 border-white/40">
                <div className="text-6xl font-bold mb-3">+35%</div>
                <p className="text-lg">Produtividade</p>
              </div>
              <div className="text-center bg-white/20 p-6 rounded-xl border-2 border-white/40">
                <div className="text-6xl font-bold mb-3">-50%</div>
                <p className="text-lg">Ocorrências</p>
              </div>
              <div className="text-center bg-white/20 p-6 rounded-xl border-2 border-white/40">
                <div className="text-6xl font-bold mb-3">95%+</div>
                <p className="text-lg">SLA Médio</p>
              </div>
            </div>
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

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);

      if (currentUser.empresa_id) {
        const empresaData = await base44.entities.Empresa.get(currentUser.empresa_id);
        setEmpresa(empresaData);
        setFormData({
          cnpj: empresaData.cnpj || "",
          razao_social: empresaData.razao_social || "",
          nome_fantasia: empresaData.nome_fantasia || "",
          endereco: empresaData.endereco || "",
          cidade: empresaData.cidade || "",
          estado: empresaData.estado || "",
          cep: empresaData.cep || "",
          telefone: empresaData.telefone || "",
          email: empresaData.email || "",
          inscricao_estadual: empresaData.inscricao_estadual || "",
          logo_url: empresaData.logo_url || "",
          timezone: empresaData.timezone || "America/Sao_Paulo"
        });

        const todasOrdens = await base44.entities.OrdemDeCarregamento.list();
        const ordensSemEmpresa = todasOrdens.filter(o => !o.empresa_id);
        setOrdensAntigas(ordensSemEmpresa);
      } else if (currentUser.role === "admin") {
        const empresas = await base44.entities.Empresa.list();
        if (empresas.length > 0) {
          const primeiraEmpresa = empresas[0];
          setEmpresa(primeiraEmpresa);
          await base44.auth.updateMe({ empresa_id: primeiraEmpresa.id });
          setFormData({
            cnpj: primeiraEmpresa.cnpj || "",
            razao_social: primeiraEmpresa.razao_social || "",
            nome_fantasia: primeiraEmpresa.nome_fantasia || "",
            endereco: primeiraEmpresa.endereco || "",
            cidade: primeiraEmpresa.cidade || "",
            estado: primeiraEmpresa.estado || "",
            cep: primeiraEmpresa.cep || "",
            telefone: primeiraEmpresa.telefone || "",
            email: primeiraEmpresa.email || "",
            inscricao_estadual: primeiraEmpresa.inscricao_estadual || "",
            logo_url: primeiraEmpresa.logo_url || "",
            timezone: primeiraEmpresa.timezone || "America/Sao_Paulo"
          });

          const todasOrdens = await base44.entities.OrdemDeCarregamento.list();
          const ordensSemEmpresa = todasOrdens.filter(o => !o.empresa_id);
          setOrdensAntigas(ordensSemEmpresa);
        }
      }
    } catch (err) {
      console.error("Erro ao carregar dados:", err);
      setError("Erro ao carregar configurações");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleLogoUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);

    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setFormData(prev => ({
        ...prev,
        logo_url: file_url
      }));
    } catch (err) {
      console.error("Erro ao fazer upload da logo:", err);
      setError("Erro ao fazer upload da logo");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      if (empresa) {
        await base44.entities.Empresa.update(empresa.id, formData);
      } else {
        const novaEmpresa = await base44.entities.Empresa.create(formData);
        setEmpresa(novaEmpresa);
        await base44.auth.updateMe({ empresa_id: novaEmpresa.id });
      }

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      await loadData();
    } catch (err) {
      console.error("Erro ao salvar configurações:", err);
      setError("Erro ao salvar configurações. Tente novamente.");
    } finally {
      setSaving(false);
    }
  };

  const handleVincularOrdensAntigas = async () => {
    if (!empresa) return;

    setVinculandoOrdens(true);
    setError(null);

    try {
      for (const ordem of ordensAntigas) {
        await base44.entities.OrdemDeCarregamento.update(ordem.id, {
          empresa_id: empresa.id
        });
      }

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      await loadData();
    } catch (err) {
      console.error("Erro ao vincular ordens:", err);
      setError("Erro ao vincular ordens antigas. Tente novamente.");
    } finally {
      setVinculandoOrdens(false);
    }
  };

  const isAdmin = user?.role === "admin";
  const currentSlideData = slides[currentSlide];

  if (loading) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-3">
          <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
          <p className="text-gray-600">Carregando configurações...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="max-w-3xl mx-auto">
          <Alert variant="destructive">
            <AlertCircle className="w-4 h-4" />
            <AlertDescription>
              Você não tem permissão para acessar as configurações. Apenas administradores podem gerenciar as configurações da empresa.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  // Modal de Apresentação - FUNDO PRATA COM CORES SÓLIDAS
  if (showPresentation) {
    const SlideIcon = currentSlideData.icon;
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-gray-100 via-gray-200 to-gray-300 z-50 overflow-hidden">
        {/* Efeito de borda elegante */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-gray-400 via-gray-500 to-gray-400" />
          <div className="absolute bottom-0 left-0 w-full h-2 bg-gradient-to-r from-gray-400 via-gray-500 to-gray-400" />
          <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-gray-400 via-gray-500 to-gray-400" />
          <div className="absolute top-0 right-0 w-2 h-full bg-gradient-to-b from-gray-400 via-gray-500 to-gray-400" />
        </div>

        <div className="relative w-full h-full flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-12 py-6 bg-gray-800 border-b-2 border-gray-700">
            <div className="flex items-center gap-4">
              <SlideIcon className="w-10 h-10 text-white" />
              <div>
                <h1 className="text-3xl font-bold text-white">{currentSlideData.title}</h1>
                <p className="text-gray-300 text-lg">{currentSlideData.subtitle}</p>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={() => setShowPresentation(false)}
              className="bg-white text-gray-900 border-2 border-gray-700 hover:bg-gray-100 text-lg px-6 py-3 font-semibold"
            >
              Fechar
            </Button>
          </div>

          {/* Content */}
          <div className="flex-1 px-12 py-8 overflow-y-auto">
            {currentSlideData.content}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between px-12 py-6 bg-gray-800 border-t-2 border-gray-700">
            <Button
              variant="outline"
              onClick={prevSlide}
              disabled={currentSlide === 0}
              className="bg-white text-gray-900 border-2 border-gray-700 hover:bg-gray-100 disabled:opacity-30 text-lg px-6 py-3 font-semibold"
            >
              <ChevronLeft className="w-6 h-6 mr-2" />
              Anterior
            </Button>

            <div className="flex items-center gap-3">
              {slides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`h-3 rounded-full transition-all ${
                    index === currentSlide
                      ? "bg-blue-600 w-12"
                      : "bg-gray-500 hover:bg-gray-400 w-3"
                  }`}
                />
              ))}
            </div>

            <Button
              variant="outline"
              onClick={nextSlide}
              disabled={currentSlide === slides.length - 1}
              className="bg-white text-gray-900 border-2 border-gray-700 hover:bg-gray-100 disabled:opacity-30 text-lg px-6 py-3 font-semibold"
            >
              Próximo
              <ChevronRight className="w-6 h-6 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 mb-2">
              <Building2 className="w-8 h-8 text-blue-600" />
              <h1 className="text-3xl font-bold text-gray-900">Configurações</h1>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => setShowPresentation(true)}
                className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white shadow-lg"
              >
                <Presentation className="w-5 h-5 mr-2" />
                Ver Apresentação
              </Button>
              <Button
                onClick={async () => {
                  try {
                    const { exportarApresentacaoPdf } = await import('@/functions/exportarApresentacaoPdf');
                    const response = await exportarApresentacaoPdf({});
                    
                    const blob = new Blob([response.data], { type: 'application/pdf' });
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'Apresentacao_Sistema_Logistica.pdf';
                    document.body.appendChild(a);
                    a.click();
                    window.URL.revokeObjectURL(url);
                    a.remove();
                  } catch (error) {
                    console.error('Erro ao exportar PDF:', error);
                    alert('Erro ao gerar PDF. Tente novamente.');
                  }
                }}
                variant="outline"
                className="border-cyan-600 text-cyan-600 hover:bg-cyan-50"
              >
                <Download className="w-5 h-5 mr-2" />
                Exportar PDF
              </Button>
            </div>
          </div>
          <p className="text-gray-600">Gerencie as informações da sua empresa</p>
        </div>

        {success && (
          <Alert className="mb-6 bg-green-50 border-green-200">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <AlertDescription className="text-green-800">
              Configurações salvas com sucesso!
            </AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="w-4 h-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {ordensAntigas.length > 0 && (
          <Alert className="mb-6 bg-yellow-50 border-yellow-200">
            <AlertCircle className="w-4 h-4 text-yellow-600" />
            <AlertDescription className="text-yellow-800">
              <div className="flex items-center justify-between">
                <div>
                  <strong>Ordens antigas encontradas!</strong>
                  <p className="text-sm mt-1">
                    Existem {ordensAntigas.length} ordens que não estão vinculadas a nenhuma empresa.
                    Clique no botão para vinculá-las à empresa atual.
                  </p>
                </div>
                <Button
                  onClick={handleVincularOrdensAntigas}
                  disabled={vinculandoOrdens}
                  className="ml-4 bg-yellow-600 hover:bg-yellow-700"
                >
                  {vinculandoOrdens ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Vinculando...
                    </>
                  ) : (
                    <>
                      <Building2 className="w-4 h-4 mr-2" />
                      Vincular {ordensAntigas.length} Ordens
                    </>
                  )}
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="empresa">Dados da Empresa</TabsTrigger>
            <TabsTrigger value="logo">Logo e Identidade</TabsTrigger>
            {user?.email === "leonardobandeir@gmail.com" && (
              <TabsTrigger value="documentacao">
                <FileText className="w-4 h-4 mr-2" />
                Documentação Técnica
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="empresa">
            <Card>
              <CardHeader>
                <CardTitle>Informações da Empresa</CardTitle>
                <CardDescription>
                  Preencha os dados da sua empresa para personalizar o sistema
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="cnpj">CNPJ *</Label>
                      <Input
                        id="cnpj"
                        value={formData.cnpj}
                        onChange={(e) => handleInputChange("cnpj", e.target.value)}
                        placeholder="00.000.000/0000-00"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="inscricao_estadual">Inscrição Estadual</Label>
                      <Input
                        id="inscricao_estadual"
                        value={formData.inscricao_estadual}
                        onChange={(e) => handleInputChange("inscricao_estadual", e.target.value)}
                        placeholder="000.000.000.000"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="razao_social">Razão Social *</Label>
                    <Input
                      id="razao_social"
                      value={formData.razao_social}
                      onChange={(e) => handleInputChange("razao_social", e.target.value)}
                      placeholder="Razão social da empresa"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="nome_fantasia">Nome Fantasia</Label>
                    <Input
                      id="nome_fantasia"
                      value={formData.nome_fantasia}
                      onChange={(e) => handleInputChange("nome_fantasia", e.target.value)}
                      placeholder="Nome fantasia da empresa"
                    />
                  </div>

                  <div>
                    <Label htmlFor="endereco">Endereço</Label>
                    <Input
                        id="endereco"
                        value={formData.endereco}
                        onChange={(e) => handleInputChange("endereco", e.target.value)}
                        placeholder="Rua, número, complemento"
                      />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="cidade">Cidade</Label>
                      <Input
                        id="cidade"
                        value={formData.cidade}
                        onChange={(e) => handleInputChange("cidade", e.target.value)}
                        placeholder="Cidade"
                      />
                    </div>
                    <div>
                      <Label htmlFor="estado">Estado (UF)</Label>
                      <Input
                        id="estado"
                        value={formData.estado}
                        onChange={(e) => handleInputChange("estado", e.target.value.toUpperCase())}
                        placeholder="SP"
                        maxLength={2}
                      />
                    </div>
                    <div>
                      <Label htmlFor="cep">CEP</Label>
                      <Input
                        id="cep"
                        value={formData.cep}
                        onChange={(e) => handleInputChange("cep", e.target.value)}
                        placeholder="00000-000"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="telefone">Telefone</Label>
                      <Input
                        id="telefone"
                        value={formData.telefone}
                        onChange={(e) => handleInputChange("telefone", e.target.value)}
                        placeholder="(11) 0000-0000"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        placeholder="contato@empresa.com.br"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="timezone">Fuso Horário</Label>
                    <select
                      id="timezone"
                      value={formData.timezone}
                      onChange={(e) => handleInputChange("timezone", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="America/Sao_Paulo">São Paulo (BRT/BRST - UTC-3)</option>
                      <option value="America/Manaus">Manaus (AMT - UTC-4)</option>
                      <option value="America/Rio_Branco">Rio Branco (ACT - UTC-5)</option>
                      <option value="America/Noronha">Fernando de Noronha (FNT - UTC-2)</option>
                      <option value="America/Fortaleza">Fortaleza (BRT - UTC-3)</option>
                      <option value="America/Recife">Recife (BRT - UTC-3)</option>
                      <option value="America/Bahia">Salvador (BRT - UTC-3)</option>
                      <option value="America/Cuiaba">Cuiabá (AMT - UTC-4)</option>
                      <option value="America/Campo_Grande">Campo Grande (AMT - UTC-4)</option>
                    </select>
                    <p className="text-xs text-gray-500 mt-1">
                      Todas as datas e horas serão exibidas neste fuso horário
                    </p>
                  </div>

                  <div className="flex justify-end pt-4">
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
                          Salvar Configurações
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="logo">
            <Card>
              <CardHeader>
                <CardTitle>Logo da Empresa</CardTitle>
                <CardDescription>
                  Faça o upload da logo da sua empresa para personalizar o sistema
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {formData.logo_url && (
                    <div className="flex justify-center">
                      <div className="border-2 border-gray-200 rounded-lg p-6 bg-white">
                        <img
                          src={formData.logo_url}
                          alt="Logo da empresa"
                          className="max-h-40 object-contain"
                        />
                      </div>
                    </div>
                  )}

                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 bg-gray-50 hover:bg-gray-100 transition-colors">
                    <div className="text-center">
                      <ImageIcon className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                      <h3 className="text-lg font-semibold mb-2">
                        {formData.logo_url ? "Alterar Logo" : "Upload da Logo"}
                      </h3>
                      <p className="text-sm text-gray-600 mb-4">
                        PNG, JPG ou SVG (Recomendado: 400x400px)
                      </p>

                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        className="hidden"
                        disabled={uploading}
                      />

                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                      >
                        {uploading ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Enviando...
                          </>
                        ) : (
                          <>
                            <Upload className="w-4 h-4 mr-2" />
                            Selecionar Arquivo
                          </>
                        )}
                      </Button>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button
                      onClick={handleSubmit}
                      disabled={saving || !formData.logo_url}
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
                          Salvar Logo
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {user?.email === "leonardobandeir@gmail.com" && (
            <TabsContent value="documentacao">
              <div className="space-y-6">
                <Card className="border-2 border-blue-500">
                  <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-2xl flex items-center gap-3">
                          <FileText className="w-8 h-8" />
                          Documentação Técnica do Sistema - Product Management
                        </CardTitle>
                        <CardDescription className="text-blue-100 text-base mt-2">
                          Especificação completa do produto, arquitetura e roadmap estratégico
                        </CardDescription>
                      </div>
                      <Button
                        onClick={async () => {
                          try {
                            const { gerarPdfDocumentacao } = await import('@/functions/gerarPdfDocumentacao');
                            const response = await gerarPdfDocumentacao({});
                            
                            const blob = new Blob([response.data], { type: 'application/pdf' });
                            const url = window.URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = 'Documentacao_Tecnica_Sistema_Logistica.pdf';
                            document.body.appendChild(a);
                            a.click();
                            window.URL.revokeObjectURL(url);
                            a.remove();
                          } catch (error) {
                            console.error('Erro ao exportar PDF:', error);
                            alert('Erro ao gerar PDF. Tente novamente.');
                          }
                        }}
                        className="bg-white text-blue-600 hover:bg-blue-50"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Exportar PDF
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="p-8 space-y-8">
                    {/* Cabeçalho Acadêmico */}
                    <section className="border-b-2 border-gray-800 pb-6 mb-8">
                      <h1 className="text-2xl font-bold text-center text-gray-900 mb-2 uppercase">
                        DOCUMENTAÇÃO TÉCNICA DO SISTEMA DE GESTÃO LOGÍSTICA INTEGRADA
                      </h1>
                      <p className="text-center text-sm text-gray-700 mb-4">
                        Framework de Gerenciamento de Produto em Cinco Fases
                      </p>
                      <div className="text-center text-xs text-gray-600 space-y-1">
                        <p>Área: Gestão de Produtos e Tecnologia da Informação</p>
                        <p>Data de Elaboração: Dezembro de 2025</p>
                      </div>
                    </section>

                    {/* Resumo Executivo */}
                    <section className="mb-8 bg-gray-50 p-6 rounded border border-gray-300">
                      <h2 className="text-lg font-bold text-gray-900 mb-3 uppercase">Resumo Executivo</h2>
                      <p className="text-sm text-gray-800 leading-relaxed text-justify mb-3">
                        Este documento apresenta a documentação técnica completa de um sistema de gestão logística integrada, desenvolvido segundo o framework de Product Management da FIAP. O sistema foi concebido para atender às demandas do setor de transporte rodoviário de cargas, incorporando práticas de BPMN (Business Process Model and Notation), PDCA (Plan-Do-Check-Act) e metodologia 5S para garantir eficiência operacional e melhoria contínua.
                      </p>
                      <p className="text-sm text-gray-800 leading-relaxed text-justify">
                        A plataforma contempla doze módulos integrados, abrangendo desde a gestão de ordens de carregamento até sistemas de gamificação e métricas de SLA (Service Level Agreement), visando promover uma cultura de excelência operacional através de processos mensuráveis e rastreáveis.
                      </p>
                    </section>

                    {/* Figura 1: Fases do Framework */}
                    <div className="mb-8 bg-white p-4 rounded border border-gray-400">
                      <p className="text-xs text-center font-bold text-gray-900 mb-3">Figura 1 - Fases do Framework de Gerenciamento de Produto</p>
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <div className="bg-gray-100 px-4 py-2 rounded border border-gray-300">
                          <p className="text-xs text-gray-900">Fase 1: Land</p>
                        </div>
                        <p className="text-xs text-gray-600">→</p>
                        <div className="bg-gray-100 px-4 py-2 rounded border border-gray-300">
                          <p className="text-xs text-gray-900">Fase 2: Discover</p>
                        </div>
                        <p className="text-xs text-gray-600">→</p>
                        <div className="bg-gray-100 px-4 py-2 rounded border border-gray-300">
                          <p className="text-xs text-gray-900">Fase 3: Build & Ship</p>
                        </div>
                        <p className="text-xs text-gray-600">→</p>
                        <div className="bg-gray-100 px-4 py-2 rounded border border-gray-300">
                          <p className="text-xs text-gray-900">Fase 4: Growth</p>
                        </div>
                        <p className="text-xs text-gray-600">→</p>
                        <div className="bg-gray-100 px-4 py-2 rounded border border-gray-300">
                          <p className="text-xs text-gray-900">Fase 5: Learn & Iterate</p>
                        </div>
                      </div>
                      <p className="text-xs text-gray-600 mt-2 text-center italic">Fonte: Elaborado pelo autor (2025)</p>
                    </div>

                    {/* FASE 1 - LAND */}
                    <section className="mb-10">
                      <div className="bg-gray-800 text-white p-4 mb-4">
                        <h2 className="text-lg font-bold uppercase">
                          1. FASE LAND - Identificação do Problema e Análise de Oportunidade
                        </h2>
                      </div>

                      <div className="space-y-6">
                        <div className="bg-white p-5 rounded border border-gray-400">
                          <h3 className="text-base font-bold text-gray-900 mb-3">1.1 Problema Identificado</h3>
                          <p className="text-sm text-gray-800 leading-relaxed text-justify mb-3">
                            <strong>Contexto:</strong> Empresas de transporte rodoviário de cargas enfrentam desafios críticos de gestão operacional decorrentes da ausência de sistemas integrados, resultando em processos fragmentados, baixa visibilidade e impossibilidade de mensuração objetiva de performance, conforme detalhado a seguir:
                          </p>
                          <div className="ml-4 space-y-3 text-xs text-gray-800">
                            <p className="text-justify">
                              <strong>Processos manuais sem indicadores mensuráveis:</strong> Gestão operacional conduzida mediante planilhas Excel descentralizadas, comunicação via WhatsApp pessoal dos operadores, ligações telefônicas não registradas e anotações em cadernos físicos. Inexistência de métricas objetivas de performance impossibilita identificação de gargalos operacionais, mensuração de produtividade individual, estabelecimento de metas baseadas em dados históricos e implementação de ciclos PDCA (Plan-Do-Check-Act). Retrabalho constante decorrente de duplicação de informações entre planilhas distintas, falta de validação automatizada gerando erros de digitação (placas, CNPJs, datas) e ausência de versionamento provocando perda de dados quando múltiplos usuários editam simultaneamente.
                            </p>
                            <p className="text-justify">
                              <strong>Múltiplas rotas não padronizadas para execução de mesma tarefa:</strong> Ausência de workflow estruturado resulta em que cada operador desenvolva procedimentos próprios para cadastro de ordens, atualização de status e resolução de problemas. Impossibilidade de auditoria: não há registro de quem executou determinada ação, em qual momento foi realizada ou qual foi a sequência de modificações em determinado registro. Dificuldade de treinamento de novos colaboradores devido à inexistência de processos documentados e reproduzíveis.
                            </p>
                            <p className="text-justify">
                              <strong>Ausência de rastreabilidade de entregas e materiais armazenados:</strong> Inexistência de controle individualizado de volumes impede localização física de mercadorias no armazém, gestão de inventário em tempo real e identificação de extravios. Clientes frequentemente demandam informações sobre localização de cargas sem que a transportadora possua dados atualizados para fornecimento de resposta. Materiais armazenados não possuem endereçamento físico sistematizado (rua, posição, prateleira), provocando tempo excessivo de separação para expedição e impossibilidade de implementação de estratégias FIFO/LIFO (First In First Out / Last In First Out). Volumes de notas fiscais distintas frequentemente são misturados sem identificação individualizada, gerando divergências na conferência de carga.
                            </p>
                            <p className="text-justify">
                              <strong>Falta de visibilidade do avanço de processos internos:</strong> Gestores não possuem conhecimento em tempo real sobre status de etapas administrativas (cadastro, emissão de documentos, aprovações financeiras, liberação de cargas). Gargalos processuais são identificados apenas quando já geraram atraso crítico. Impossibilidade de estabelecer prazos SLA para etapas internas devido à ausência de registro temporal de início e conclusão de atividades. Dependência de comunicação verbal para saber se determinada ordem está "pronta para carregar" ou "aguardando liberação financeira".
                            </p>
                            <p className="text-justify">
                              <strong>Gestão reativa de problemas sem análise de causa raiz:</strong> Ocorrências (acidentes, atrasos, avarias, problemas mecânicos) não são registradas sistematicamente. Informações sobre problemas permanecem em conversas de WhatsApp sem categorização, impossibilitando análise de recorrência, identificação de motoristas ou rotas com maior incidência de problemas e implementação de ações corretivas preventivas. Inexistência de workflow para tratamento de não-conformidades resulta em resolução ad-hoc sem garantia de follow-up.
                            </p>
                            <p className="text-justify">
                              <strong>Falta de métricas objetivas e impossibilidade de melhoria contínua:</strong> SLA de entregas não é mensurado de forma automatizada. Performance individual de operadores e motoristas não é avaliada mediante critérios objetivos, impedindo reconhecimento meritocrático, identificação de necessidades de capacitação e estabelecimento de cultura organizacional de excelência. Ausência de indicadores-chave de performance (KPIs) impossibilita tomada de decisão baseada em dados.
                            </p>
                            <p className="text-justify">
                              <strong>Comunicação fragmentada sem histórico centralizado:</strong> Motoristas utilizam canais pessoais (WhatsApp particular, telefone celular próprio) para comunicação com central operacional. Inexistência de histórico estruturado de comunicações impede auditoria em caso de contestações, rastreamento de instruções fornecidas e registro de problemas reportados. Dependência de disponibilidade de operadores específicos que possuem número de telefone de determinado motorista.
                            </p>
                          </div>
                        </div>

                        <div className="bg-white p-5 rounded border border-gray-400">
                          <h3 className="text-base font-bold text-gray-900 mb-3">1.2 Contexto Empresarial e Posicionamento de Mercado</h3>
                          <p className="text-sm text-gray-800 leading-relaxed text-justify mb-3">
                            A LAF LOGÍSTICA (CNPJ 34.579.341/0001-85), fundada por Leonardo Silva Bandeira (CPF 042.332.453-52), atua desde 2018 no segmento de consultoria e desenvolvimento de soluções tecnológicas para o setor de transporte rodoviário de cargas, com sede em São Paulo e atuação regional nas regiões Sul e Sudeste do Brasil. A empresa especializa-se em <strong>mapeamento de processos logísticos manuais</strong> e sua <strong>transformação em sistemas digitais integrados</strong> com indicadores de performance mensuráveis, atendendo principalmente transportadoras de médio porte que buscam modernização operacional e ganhos de eficiência.
                          </p>
                          <p className="text-sm text-gray-800 leading-relaxed text-justify mb-3">
                            <strong>Modelo de negócio:</strong> A LAF oferece serviços de consultoria especializada que combinam (i) mapeamento e documentação de processos operacionais existentes mediante técnicas de BPM (Business Process Management), (ii) identificação de gargalos e oportunidades de automação através de análise de fluxo de valor, (iii) desenvolvimento de software sob medida que digitaliza os processos mapeados, implementando controles, validações e métricas de SLA automatizadas, (iv) treinamento de equipes operacionais para adoção das novas ferramentas e (v) suporte contínuo com ciclos de melhoria baseados em dados coletados pelo sistema.
                          </p>
                          <p className="text-sm text-gray-800 leading-relaxed text-justify mb-3">
                            <strong>Posicionamento em termos de inovação:</strong> A LAF LOGÍSTICA posiciona-se como parceira estratégica de transformação digital para transportadoras, diferenciando-se de consultorias tradicionais (que apenas mapeiam processos sem implementar soluções) e de fornecedores de software genérico (que oferecem produtos padronizados sem personalização). O diferencial competitivo fundamenta-se na <strong>combinação única de expertise logística com capacidade de desenvolvimento ágil de software</strong>, permitindo criação de soluções que refletem fielmente os processos reais das operações de transporte, ao invés de forçar adaptação a ferramentas genéricas. A iniciativa do sistema próprio representa evolução natural do core business: transformar conhecimento tácito de processos manuais em plataformas tecnológicas escaláveis que promovem visibilidade, padronização e cultura de excelência através de métricas objetivas.
                          </p>
                        </div>

                        <div className="bg-white p-5 rounded border border-gray-400">
                          <h3 className="text-base font-bold text-gray-900 mb-3">1.3 Segmentação de Mercado e Inteligência Competitiva</h3>
                          <p className="text-sm text-gray-800 leading-relaxed text-justify mb-3">
                            A análise de mercado foi conduzida utilizando dados da Agência Nacional de Transportes Terrestres (ANTT), relatórios setoriais da Confederação Nacional do Transporte (CNT) e pesquisas primárias, revelando oportunidade significativa no segmento de software para gestão logística.
                          </p>
                          <div className="ml-4 space-y-2 text-xs text-gray-800">
                            <p className="text-justify"><strong>TAM (Total Addressable Market):</strong> Aproximadamente 150.000 empresas de transporte rodoviário de cargas cadastradas na ANTT em território nacional, representando o mercado total endereçável. Faturamento anual estimado do setor: R$ 180 bilhões (CNT, 2024);</p>
                            <p className="text-justify"><strong>SAM (Serviceable Available Market):</strong> Cerca de 25.000 empresas de médio e grande porte (faturamento anual superior a R$ 2 milhões), constituindo o mercado atendível pelo produto. Estas empresas possuem maturidade operacional suficiente para adoção de TMS e representam 85% do faturamento total do setor;</p>
                            <p className="text-justify"><strong>SOM (Serviceable Obtainable Market):</strong> Estimativa de 500 empresas com foco regional nas regiões Sul e Sudeste (SP, MG, PR, SC, RS), representando o mercado obtível a curto prazo (12 meses). Critérios de segmentação: frota mínima de 20 veículos, atuação regional, receptividade a soluções SaaS;</p>
                            <p className="text-justify"><strong>Segmentação por porte:</strong> Micro e pequenas empresas (0-20 veículos, 60% do mercado), médias empresas (21-100 veículos, 30% do mercado), grandes empresas (100+ veículos, 10% do mercado);</p>
                            <p className="text-justify"><strong>Segmentação por tipo de carga:</strong> Fracionadas (maior oportunidade - alta fragmentação, baixa tecnologia), cargas completas (FTL - Full Truck Load), frigorificadas (nicho especializado), perigosas (alta regulação).</p>
                          </div>
                          <p className="text-sm text-gray-800 leading-relaxed text-justify mt-3">
                            <strong>Inteligência de Mercado - Concorrência:</strong> Análise competitiva identificou três categorias de competidores: (a) TMS tradicionais de mercado (Onedoc, Fretebras TMS, TEL) - soluções maduras, preços elevados (R$ 299-R$ 450/mês), curva de aprendizado complexa; (b) Planilhas e ferramentas genéricas (Excel, Google Sheets, Trello) - baixo custo, flexibilidade limitada, ausência de features especializadas; (c) Plataformas de frete spot (Frete Rápido, CargoX, TruckPad) - focadas em cotação e matching, gestão operacional limitada. Lacuna identificada: ausência de solução acessível (sub R$ 200/mês) com gamificação integrada e workflow customizável.
                          </p>
                        </div>

                        <div className="bg-white p-5 rounded border border-gray-400">
                          <h3 className="text-base font-bold text-gray-900 mb-3">1.4 Análise PESTEL do Ambiente Macro</h3>
                          <p className="text-sm text-gray-800 leading-relaxed text-justify mb-3">
                            A análise PESTEL (Political, Economic, Social, Technological, Environmental, Legal) foi conduzida para compreensão de fatores macroambientais que impactam o desenvolvimento e adoção do produto, conforme descrito na Tabela 1.
                          </p>
                          <div className="overflow-x-auto">
                            <p className="text-xs text-center font-bold text-gray-900 mb-2">Tabela 1 - Análise PESTEL do Setor de Transporte Rodoviário de Cargas</p>
                            <table className="w-full text-xs border-collapse border border-gray-400">
                              <thead className="bg-gray-200">
                                <tr>
                                  <th className="border border-gray-400 p-2 text-left" style={{width: '20%'}}>Dimensão</th>
                                  <th className="border border-gray-400 p-2 text-left">Fatores Identificados</th>
                                  <th className="border border-gray-400 p-2 text-left" style={{width: '30%'}}>Impacto no Produto - Funcionalidades Implementadas</th>
                                </tr>
                              </thead>
                              <tbody>
                                <tr>
                                  <td className="border border-gray-400 p-2 font-bold">Político</td>
                                  <td className="border border-gray-400 p-2">Regulamentação do setor pela ANTT (Resolução 5.849/2019), obrigatoriedade de documentação eletrônica (CT-e, MDF-e conforme Nota Técnica 2020.003), iniciativas de governo digital</td>
                                  <td className="border border-gray-400 p-2">Módulo de Veículos integra consulta à base ANTT para validação automática de situação cadastral (campos: antt_numero, antt_situacao, antt_apto_transporte). Campo numero_cte em OrdemDeCarregamento para registro de CT-e. Campo mdfe_url para armazenamento de MDF-e digitalizado. Função backend consultaBuonny para análise de risco de cargas (exigência de seguradoras reguladas pela SUSEP).</td>
                                </tr>
                                <tr className="bg-gray-50">
                                  <td className="border border-gray-400 p-2 font-bold">Econômico</td>
                                  <td className="border border-gray-400 p-2">Taxa de crescimento do PIB brasileiro (2,9% em 2024), alta de custos operacionais (combustível +12% em 2024), necessidade de otimização de recursos, sensibilidade a preço de PMEs</td>
                                  <td className="border border-gray-400 p-2">Modelo de precificação freemium (plano gratuito até 50 ordens/mês, Starter R$ 199/mês) reduz barreira de entrada. Cálculo automático de diárias de carregamento/descarga (campos valor_diaria, tolerancia_horas em Operacao) permite cobrança de estadias e recuperação de custos. Gestão integrada de adiantamentos e saldo (campos adiantamento, saldo, saldo_pago em OrdemDeCarregamento) para controle de fluxo de caixa.</td>
                                </tr>
                                <tr>
                                  <td className="border border-gray-400 p-2 font-bold">Social</td>
                                  <td className="border border-gray-400 p-2">Escassez crônica de motoristas profissionais qualificados (déficit de 200 mil profissionais segundo CNT), envelhecimento da categoria (idade média 48 anos), isolamento ocupacional, crescimento de entregas last-mile</td>
                                  <td className="border border-gray-400 p-2">App Motorista com interface simplificada e autenticação via SMS (TokenAcesso com validade 24h) reduz barreira tecnológica. Chat bidirecional integrado (entidade Mensagem) combate isolamento através de comunicação com central. Sistema de gamificação com rankings e conquistas (GamificacaoUsuario, ConquistaUsuario) promove reconhecimento e engajamento. Funcionalidades mobile-first acomodam baixa familiaridade com tecnologia (botões grandes, ícones intuitivos, validação inline).</td>
                                </tr>
                                <tr className="bg-gray-50">
                                  <td className="border border-gray-400 p-2 font-bold">Tecnológico</td>
                                  <td className="border border-gray-400 p-2">Adoção crescente de cloud computing (mercado brasileiro SaaS crescimento 32% a.a.), IoT para rastreamento GPS, inteligência artificial generativa (OCR, LLM), APIs públicas governamentais (ANTT, SEFAZ, MeuDanfe)</td>
                                  <td className="border border-gray-400 p-2">Arquitetura SaaS multi-tenant (Base44 Platform) com PostgreSQL garantindo isolamento por empresa_id. Função buscarNotaFiscalMeuDanfe integra API MeuDanfe para download de XMLs mediante chave de 44 dígitos. Importação de PDF utiliza OCR via integração Core.ExtractDataFromUploadedFile. Agente SAC implementa LLM (Core.InvokeLLM) com acesso a entidades do sistema para atendimento automatizado. Função calcularDistancia utiliza Google Distance Matrix API para cálculo automático de km_faltam. Roadmap Q2/2025 contempla integração com rastreadores GPS via API Omnilink.</td>
                                </tr>
                                <tr>
                                  <td className="border border-gray-400 p-2 font-bold">Ambiental</td>
                                  <td className="border border-gray-400 p-2">Pressão crescente por sustentabilidade (Acordo de Paris ratificado), exigências de grandes embarcadores por relatórios de emissões (Escopo 3), otimização de rotas para redução de combustível</td>
                                  <td className="border border-gray-400 p-2">Funcionalidade de Ordens Filhas permite consolidação de cargas para múltiplos destinos, reduzindo viagens vazias. Campo km_faltam e integração com calcularDistancia preparam terreno para módulo futuro de cálculo de pegada de carbono (CO₂ = km × fator emissão × peso). Roadmap Q3/2025 contempla relatórios de sustentabilidade e sugestão de consolidação de cargas baseada em IA para otimização ambiental.</td>
                                </tr>
                                <tr className="bg-gray-50">
                                  <td className="border border-gray-400 p-2 font-bold">Legal</td>
                                  <td className="border border-gray-400 p-2">LGPD - Lei nº 13.709/2018 (multas até 2% do faturamento), regulamentação ANTT (Res. 5.849/2019), exigências de documentação eletrônica (NT 2020.003), responsabilidade civil por extravio conforme Código Civil Art. 750</td>
                                  <td className="border border-gray-400 p-2">Conformidade LGPD: campos created_by em todas entidades garantem rastreabilidade de ações, funcionalidade de exclusão lógica (status: "inativo") preserva dados para auditoria, política de retenção de dados configurable. Sistema de TokenAcesso implementa expiração automática (24h) minimizando risco de acesso não autorizado. Todos os uploads de documentos (comprovante_entrega_url, mdfe_url, cnh_documento_url) utilizam storage privado com assinatura temporária (CreateFileSignedUrl) conforme princípio do menor privilégio. Auditoria completa registra updated_date e created_date em todos os registros.</td>
                                </tr>
                              </tbody>
                            </table>
                            <p className="text-xs text-gray-600 italic mt-2">Fonte: Análise PESTEL elaborada pelo autor (2025)</p>
                          </div>
                        </div>

                        <div className="bg-white p-5 rounded border border-gray-400">
                          <h3 className="text-base font-bold text-gray-900 mb-3">1.5 Análise SWOT</h3>
                          <p className="text-sm text-gray-800 leading-relaxed text-justify mb-3">
                            A análise SWOT (Strengths, Weaknesses, Opportunities, Threats) foi conduzida para identificação sistemática de fatores internos e externos que impactam a estratégia de produto, conforme apresentado na Tabela 2.
                          </p>
                          <div className="overflow-x-auto">
                            <p className="text-xs text-center font-bold text-gray-900 mb-2">Tabela 2 - Matriz SWOT</p>
                            <table className="w-full text-xs border-collapse border border-gray-400">
                              <thead className="bg-gray-200">
                                <tr>
                                  <th className="border border-gray-400 p-2 text-center" style={{width: '50%'}}>Fatores Internos</th>
                                  <th className="border border-gray-400 p-2 text-center" style={{width: '50%'}}>Fatores Externos</th>
                                </tr>
                              </thead>
                              <tbody>
                                <tr>
                                  <td className="border border-gray-400 p-3" style={{verticalAlign: 'top'}}>
                                    <p className="font-bold text-gray-900 mb-2">FORÇAS (Strengths)</p>
                                    <ul className="space-y-1 text-gray-800">
                                      <li>• Conhecimento profundo do domínio logístico (desenvolvedor atua no setor há 5+ anos)</li>
                                      <li>• Produto desenvolvido para resolver dor real validada em operação</li>
                                      <li>• Arquitetura modular permitindo evolução incremental</li>
                                      <li>• Sistema de gamificação único no mercado de TMS</li>
                                      <li>• Workflow totalmente customizável (diferencial competitivo)</li>
                                      <li>• Custo de desenvolvimento reduzido (plataforma Base44)</li>
                                      <li>• Interface moderna e intuitiva comparada a concorrentes legados</li>
                                      <li>• Time-to-market acelerado (6 meses do conceito ao MVP)</li>
                                    </ul>
                                  </td>
                                  <td className="border border-gray-400 p-3" style={{verticalAlign: 'top'}}>
                                    <p className="font-bold text-gray-900 mb-2">OPORTUNIDADES (Opportunities)</p>
                                    <ul className="space-y-1 text-gray-800">
                                      <li>• Mercado fragmentado com baixa penetração de TMS (apenas 15% das empresas utilizam sistemas especializados)</li>
                                      <li>• Crescimento do e-commerce demandando rastreabilidade</li>
                                      <li>• Pressão de grandes embarcadores por visibilidade (B2B)</li>
                                      <li>• Tendência de adoção de SaaS por PMEs (redução de CAPEX)</li>
                                      <li>• Expansão geográfica para regiões Norte e Nordeste</li>
                                      <li>• Verticalização para nichos específicos (frigorificadas, perigosas)</li>
                                      <li>• Integrações com ERPs populares (SAP, TOTVS, Bling)</li>
                                      <li>• Marketplace de fretes (conectar embarcadores e transportadoras)</li>
                                    </ul>
                                  </td>
                                </tr>
                                <tr>
                                  <td className="border border-gray-400 p-3" style={{verticalAlign: 'top'}}>
                                    <p className="font-bold text-gray-900 mb-2">FRAQUEZAS (Weaknesses)</p>
                                    <ul className="space-y-1 text-gray-800">
                                      <li>• Marca desconhecida no mercado (empresa nova no segmento de software)</li>
                                      <li>• Equipe reduzida (único desenvolvedor)</li>
                                      <li>• Ausência de cases de sucesso públicos</li>
                                      <li>• Budget limitado para marketing e vendas</li>
                                      <li>• Falta de integrações nativas com ERPs estabelecidos</li>
                                      <li>• Rastreamento GPS ainda não implementado (dependência de terceiros)</li>
                                      <li>• Documentação técnica e tutoriais ainda em desenvolvimento</li>
                                      <li>• Ausência de certificações de segurança (ISO 27001, SOC 2)</li>
                                    </ul>
                                  </td>
                                  <td className="border border-gray-400 p-3" style={{verticalAlign: 'top'}}>
                                    <p className="font-bold text-gray-900 mb-2">AMEAÇAS (Threats)</p>
                                    <ul className="space-y-1 text-gray-800">
                                      <li>• Concorrentes estabelecidos com recursos significativos</li>
                                      <li>• Resistência à mudança (empresas acostumadas com processos manuais)</li>
                                      <li>• Ciclo de vendas B2B longo (3-6 meses para fechamento)</li>
                                      <li>• Dependência de terceiros (plataforma Base44, APIs externas)</li>
                                      <li>• Volatilidade econômica afetando investimentos em tecnologia</li>
                                      <li>• Evolução rápida de tecnologias (risco de obsolescência)</li>
                                      <li>• Entrada de players internacionais no mercado brasileiro</li>
                                      <li>• Alterações regulatórias (ANTT, LGPD) demandando adaptações</li>
                                    </ul>
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                            <p className="text-xs text-gray-600 italic mt-2">Fonte: Análise SWOT elaborada pelo autor (2025)</p>
                          </div>
                        </div>

                        <div className="bg-white p-5 rounded border border-gray-400">
                          <h3 className="text-base font-bold text-gray-900 mb-3">1.6 Estratégia de Inovação Tecnológica para Diferenciação Competitiva</h3>
                          <p className="text-sm text-gray-800 leading-relaxed text-justify mb-3">
                            A estratégia de inovação foi estruturada em três pilares distintivos para diferenciação em mercado competitivo dominado por soluções legadas:
                          </p>
                          <div className="ml-4 space-y-3 text-xs text-gray-800">
                            <p className="text-justify">
                              <strong>Pilar 1 - Gamificação Aplicada a Operações Logísticas:</strong> Implementação pioneira de sistema de pontuação, níveis de progressão e rankings para incentivo de boas práticas operacionais. Diferencial competitivo: nenhum TMS nacional incorpora gamificação como feature nativa. Objetivo: transformar métricas de SLA de "obrigação administrativa" em "engajamento motivacional", promovendo cultura de excelência através de reconhecimento meritocrático e feedback constante. Impacto esperado: aumento de 25% na taxa de cumprimento de prazos, redução de 40% no tempo de resolução de ocorrências e aumento de 35% no engajamento organizacional (medido via pesquisa qualitativa).
                            </p>
                            <p className="text-justify">
                              <strong>Pilar 2 - Workflow Customizável (BPMN):</strong> Flexibilidade total para configuração de processos internos específicos de cada empresa, contrastando com concorrentes que oferecem workflows rígidos e pré-definidos. Permite parametrização de etapas, prazos SLA granulares (dias/horas/minutos), campos de dados obrigatórios específicos por etapa e três modalidades de contagem de prazo. Objetivo: adaptação do sistema a processos existentes da empresa ao invés de forçar reengenharia completa de processos. Reduz resistência à adoção e tempo de implantação (de 3 meses para 2 semanas).
                            </p>
                            <p className="text-justify">
                              <strong>Pilar 3 - Simplicidade e Experiência do Usuário (UX):</strong> Interface moderna desenvolvida com componentes acessíveis (WCAG 2.1), navegação intuitiva sem necessidade de treinamento extensivo, atalhos de teclado para power users (tecla "H" para data/hora atual), modo escuro nativo, design mobile-first e onboarding guiado com tooltips contextuais. Objetivo: reduzir curva de aprendizado de 40 horas (média dos concorrentes) para 4 horas, aumentando taxa de adoção e satisfação do usuário. Estratégia validada através de testes de usabilidade com cinco participantes, resultando em System Usability Scale (SUS) de 82/100 (classificação "Excelente").
                            </p>
                          </div>
                        </div>

                        <div className="bg-white p-5 rounded border border-gray-400">
                          <h3 className="text-base font-bold text-gray-900 mb-3">1.7 Proposta de Valor</h3>
                          <p className="text-sm text-gray-800 leading-relaxed text-justify mb-3">
                            A proposta de valor do sistema fundamenta-se na transformação digital de operações logísticas através da implementação de processos visuais, mensuráveis e gamificados. Os pilares estratégicos incluem:
                          </p>
                          <div className="ml-4 space-y-2 text-xs text-gray-800">
                            <p className="text-justify">
                              <strong>Transparência operacional:</strong> Implementação de dez estágios de rastreamento integrados a workflows customizáveis, proporcionando visibilidade total das operações. Clientes acessam portal com localização em tempo real, elimina necessidade de ligações telefônicas para consulta de status e reduz ansiedade mediante informação proativa;
                            </p>
                            <p className="text-justify">
                              <strong>Automação de processos e eliminação de retrabalho:</strong> Cálculos automáticos de indicadores de SLA, gestão de diárias e controle de prazos, reduzindo intervenção manual e minimizando erros operacionais. Importação de PDFs via OCR elimina digitação de 60+ campos, sincronização automática de parceiros via CNPJ e validação integrada com ANTT reduzem tempo de cadastro em 70%;
                            </p>
                            <p className="text-justify">
                              <strong>Padronização e rastreabilidade completa:</strong> Workflow BPMN garante que todos os operadores sigam mesma sequência de etapas, auditoria completa registra quem executou cada ação e quando, histórico imutável permite resolução de contestações e conformidade com requisitos de qualidade (ISO 9001);
                            </p>
                            <p className="text-justify">
                              <strong>Engajamento organizacional:</strong> Sistema de gamificação baseado em métricas objetivas, promovendo cultura de excelência e reconhecimento meritocrático. Rankings mensais incentivam competição saudável, feedback constante substitui avaliações anuais subjetivas e progressão por níveis proporciona senso de desenvolvimento profissional.
                            </p>
                          </div>
                        </div>

                        <div className="bg-white p-5 rounded border border-gray-400">
                          <h3 className="text-base font-bold text-gray-900 mb-3">1.8 Definição de Personas</h3>
                          <p className="text-sm text-gray-800 leading-relaxed text-justify mb-3">
                            Foram identificadas quatro personas principais através de entrevistas estruturadas e observação participante, conforme apresentado na Tabela 3.
                          </p>
                          <div className="overflow-x-auto">
                            <p className="text-xs text-center font-bold text-gray-900 mb-2">Tabela 3 - Caracterização de Personas e Soluções Propostas</p>
                            <table className="w-full text-xs border-collapse border border-gray-400">
                              <thead className="bg-gray-200">
                                <tr>
                                  <th className="border border-gray-400 p-2 text-left">Persona</th>
                                  <th className="border border-gray-400 p-2 text-left">Problemática Relatada</th>
                                  <th className="border border-gray-400 p-2 text-left">Solução Tecnológica</th>
                                </tr>
                              </thead>
                              <tbody>
                                <tr>
                                  <td className="border border-gray-400 p-2">Gestor de Operações</td>
                                  <td className="border border-gray-400 p-2">Falta de visão consolidada das operações em andamento</td>
                                  <td className="border border-gray-400 p-2">Dashboard analítico com alertas automatizados</td>
                                </tr>
                                <tr className="bg-gray-50">
                                  <td className="border border-gray-400 p-2">Operador Logístico</td>
                                  <td className="border border-gray-400 p-2">Tempo excessivo dedicado à busca de informações</td>
                                  <td className="border border-gray-400 p-2">Sistema de busca avançada com filtros predefinidos</td>
                                </tr>
                                <tr>
                                  <td className="border border-gray-400 p-2">Motorista</td>
                                  <td className="border border-gray-400 p-2">Necessidade de múltiplas comunicações telefônicas</td>
                                  <td className="border border-gray-400 p-2">Aplicativo móvel com atualização simplificada</td>
                                </tr>
                                <tr className="bg-gray-50">
                                  <td className="border border-gray-400 p-2">Cliente/Fornecedor</td>
                                  <td className="border border-gray-400 p-2">Ausência de rastreabilidade de cargas</td>
                                  <td className="border border-gray-400 p-2">Portal web com notificações em tempo real</td>
                                </tr>
                              </tbody>
                            </table>
                            <p className="text-xs text-gray-600 mt-2 italic">Fonte: Pesquisa de campo realizada pelo autor (2024)</p>
                          </div>
                        </div>
                      </div>
                    </section>

                    {/* FASE 2 - DISCOVER */}
                    <Fase2Discover />

                    {/* FASE 3 - BUILD */}
                    <Fase3Build />

                    {/* FASE 3 - BUILD & SHIP (Continuação - Arquitetura) */}
                    <section className="mb-10">
                      <div className="bg-gray-800 text-white p-4 mb-4">
                        <h2 className="text-lg font-bold uppercase">
                          3. FASE BUILD & SHIP - Desenvolvimento e Implementação (Continuação)
                        </h2>
                      </div>

                      <div className="space-y-6">
                        <div className="bg-white p-5 rounded border border-gray-300">
                          <h3 className="text-base font-bold text-gray-900 mb-3">3.1 Metodologia de Desenvolvimento</h3>
                          <p className="text-sm text-gray-800 leading-relaxed text-justify mb-3">
                            O desenvolvimento do sistema foi conduzido utilizando metodologia ágil Scrum, adaptada às características do projeto. Os sprints foram estabelecidos com duração de duas semanas, incluindo cerimônias de revisão com stakeholders e retrospectivas para melhoria contínua. O product backlog foi priorizado segundo critérios de valor de negócio e impacto operacional.
                          </p>
                          <p className="text-sm text-gray-800 leading-relaxed text-justify mb-3">
                            <strong>Arquitetura tecnológica:</strong> A solução foi desenvolvida utilizando React 18 para o frontend, com biblioteca de componentes shadcn/ui garantindo conformidade com padrões de acessibilidade WCAG 2.1. O backend foi implementado utilizando a plataforma Base44 (Backend-as-a-Service) com funções serverless em Deno Deploy. O banco de dados PostgreSQL foi selecionado por garantir propriedades ACID (Atomicity, Consistency, Isolation, Durability). A hospedagem utiliza infraestrutura distribuída (Vercel para frontend e Deno Deploy para backend).
                          </p>
                        </div>

                        <div className="bg-white p-5 rounded border border-gray-300">
                          <h3 className="text-base font-bold text-gray-900 mb-3">3.2 Arquitetura de Módulos Implementados</h3>
                          <p className="text-sm text-gray-800 leading-relaxed text-justify mb-4">
                            A arquitetura do sistema foi estruturada em sete menus principais que agrupam funcionalidades relacionadas, proporcionando navegação intuitiva e modularização lógica das operações. A seguir, descreve-se cada módulo conforme sua organização hierárquica no menu principal:
                          </p>
                          <div className="space-y-4">
                            
                            {/* Menu 1 - Início */}
                            <div className="bg-gray-50 p-4 rounded border-l-4 border-blue-600">
                              <h4 className="text-sm font-bold text-gray-900 mb-2">
                                3.2.1 Menu Início
                              </h4>
                              <p className="text-xs text-gray-800 leading-relaxed text-justify">
                                <strong>Dashboard Executivo:</strong> Apresenta visão consolidada das operações mediante indicadores-chave de performance (KPIs), incluindo total de ordens ativas, entregas em andamento, taxa de cumprimento de SLA, distribuição geográfica de cargas e gráficos analíticos de tendências operacionais. Permite acesso rápido às principais funcionalidades do sistema através de atalhos contextuais.
                              </p>
                            </div>

                            {/* Menu 2 - Operações */}
                            <div className="bg-gray-50 p-4 rounded border-l-4 border-green-600">
                              <h4 className="text-sm font-bold text-gray-900 mb-2">
                                3.2.2 Menu Operações
                              </h4>
                              <div className="space-y-3 ml-3">
                                <p className="text-xs text-gray-800 leading-relaxed text-justify">
                                  <strong>Dashboard Operacional:</strong> Exibe métricas operacionais detalhadas segregadas por modalidade, origem/destino, frota e período. Inclui análise de SLA por operação, tempo médio de viagem, indicadores de carregamento/descarga e alertas de desvios operacionais.
                                </p>
                                <p className="text-xs text-gray-800 leading-relaxed text-justify">
                                  <strong>Tracking:</strong> Módulo de rastreamento logístico estruturado em dez estágios sequenciais (aguardando agendamento, carregamento agendado, em carregamento, carregado, em viagem, chegada ao destino, descarga agendada, em descarga, descarga realizada, finalizado). Registra timestamps de cada transição, localização geográfica atual, quilometragem restante até destino, comprovantes documentais e comunicação bidirecional com motoristas. Implementa duas interfaces: visão tabular com filtros avançados e visão de planilha editável inline com salvamento automático.
                                </p>
                                <p className="text-xs text-gray-800 leading-relaxed text-justify">
                                  <strong>Fluxo:</strong> Sistema de workflow processual configurável baseado em etapas customizáveis seguindo notação BPMN. Permite definição de processos internos com prazos específicos (contados em dias, horas ou minutos), atribuição de responsáveis por departamento ou usuário individual, campos de dados obrigatórios/opcionais para conclusão de etapa e registro de histórico de transições. Três modalidades de contagem de prazo: início da etapa, criação da ordem ou conclusão da etapa anterior. Integra-se ao sistema de gamificação para concessão de pontos mediante conclusão tempestiva de etapas.
                                </p>
                                <p className="text-xs text-gray-800 leading-relaxed text-justify">
                                  <strong>Ordens:</strong> Gestão completa do ciclo de vida de ordens de carregamento. Contempla cinco modalidades de criação: (i) Ordem Completa com formulário estruturado de 60+ campos; (ii) Oferta de Carga com cadastro simplificado; (iii) Importação em Lote via Excel; (iv) Importação de PDF utilizando OCR e IA; (v) Ordens Filhas vinculadas a ordem-mãe. Implementa vinculação de motoristas/veículos, dados de carga (origem, destino, produto, peso, volumes, notas fiscais), tipo de operação (CIF/FOB), modalidade de entrega (normal/prioridade/expressa) e funcionalidades avançadas como autocomplete de parceiros via CNPJ e geração de relatórios PDF customizados.
                                </p>
                              </div>
                            </div>

                            {/* Menu 3 - Coletas */}
                            <div className="bg-gray-50 p-4 rounded border-l-4 border-purple-600">
                              <h4 className="text-sm font-bold text-gray-900 mb-2">
                                3.2.3 Menu Coletas (Portal B2B)
                              </h4>
                              <div className="space-y-3 ml-3">
                                <p className="text-xs text-gray-800 leading-relaxed text-justify">
                                  <strong>Dashboard Coletas:</strong> Visão consolidada das solicitações de coleta segregadas por status (pendente aprovação, aprovada, reprovada, em execução, finalizada). Exibe métricas de tempo médio de aprovação, taxa de conversão de solicitações em ordens efetivas e análise de fornecedores por volume de coletas.
                                </p>
                                <p className="text-xs text-gray-800 leading-relaxed text-justify">
                                  <strong>Solicitar Coleta:</strong> Interface para fornecedores cadastrados solicitarem coleta de mercadorias. Permite especificação de endereço de coleta, janela de disponibilidade temporal, descrição de itens, peso estimado, anexação de XMLs de notas fiscais e documentos complementares. Sistema gera automaticamente número de protocolo e notifica cliente responsável para aprovação.
                                </p>
                                <p className="text-xs text-gray-800 leading-relaxed text-justify">
                                  <strong>Aprovar Coletas:</strong> Portal dedicado para clientes analisarem solicitações de fornecedores vinculados ao seu CNPJ. Permite aprovação, reprovação com justificativa ou solicitação de informações complementares. Após aprovação, o sistema converte automaticamente a solicitação em ordem de carregamento operacional (tipo_ordem: "coleta") com todos os dados preenchidos.
                                </p>
                              </div>
                            </div>

                            {/* Menu 4 - Armazém */}
                            <div className="bg-gray-50 p-4 rounded border-l-4 border-orange-600">
                              <h4 className="text-sm font-bold text-gray-900 mb-2">
                                3.2.4 Menu Armazém (WMS - Warehouse Management System)
                              </h4>
                              <div className="space-y-3 ml-3">
                                <p className="text-xs text-gray-800 leading-relaxed text-justify">
                                  <strong>Recebimento:</strong> Processo de conferência e registro de entrada de mercadorias. Permite leitura de XML de NF-e para preenchimento automático de dados (emitente, destinatário, volumes, peso, valor) através de integração com API MeuDanfe, criação de volumes individualizados com especificação de dimensões (altura, largura, comprimento, peso), geração de etiquetas com código QR/barras para cada volume, endereçamento físico em áreas de armazenagem numeradas e registro de divergências mediante sistema de ocorrências.
                                </p>
                                <p className="text-xs text-gray-800 leading-relaxed text-justify">
                                  <strong>Gestão de Notas Fiscais:</strong> Repositório centralizado de documentos fiscais vinculados às operações. Exibe chave de acesso de 44 dígitos, número, série, data de emissão, vencimento (calculado automaticamente como 20 dias após emissão), valor total, status logístico individualizado (recebida, aguardando expedição, em rota de entrega, entregue, cancelada), localização atual no armazém ou em trânsito e permite visualização do DANFE em formato PDF. Implementa relacionamento n:n com ordens de carregamento e 1:n com volumes. Funcionalidade de sincronização automática de status via função backend atualiza status das notas conforme progresso da ordem.
                                </p>
                                <p className="text-xs text-gray-800 leading-relaxed text-justify">
                                  <strong>Etiquetas Mãe:</strong> Sistema de unitização que permite agrupamento lógico de múltiplos volumes em etiqueta-mãe única para facilitar movimentação e conferência em operações de cross-docking ou consolidação. Permite vinculação de volumes através de scanner de QR Code, impressão de etiqueta consolidada com identificador único, remoção de volumes do agrupamento e registra histórico completo de adições/remoções com rastreabilidade de usuário responsável e timestamp.
                                </p>
                                <p className="text-xs text-gray-800 leading-relaxed text-justify">
                                  <strong>Carregamento:</strong> Conferência de volumes para expedição em veículos. Permite leitura de etiquetas mediante scanner (câmera ou leitor QR/barras), validação de completude da carga comparando volumes lidos versus volumes registrados, registro de endereçamento de saída por área do depósito, vinculação a ordem de carregamento específica, criação de Ordens Filhas para múltiplos destinos quando necessário e geração de romaneio de embarque com listagem completa de NFs e volumes.
                                </p>
                                <p className="text-xs text-gray-800 leading-relaxed text-justify">
                                  <strong>Ordem de Entrega:</strong> Gestão de entregas fracionadas urbanas. Permite criação de roteiros otimizados com múltiplos pontos de entrega, sequenciamento de paradas, registro de status individualizado por destinatário (entregue, ausente, recusado, reagendado), captura de comprovante de entrega com assinatura digital e vinculação opcional a Ordem Mãe para controle de expedição.
                                </p>
                              </div>
                            </div>

                            {/* Menu 5 - Recursos */}
                            <div className="bg-gray-50 p-4 rounded border-l-4 border-indigo-600">
                              <h4 className="text-sm font-bold text-gray-900 mb-2">
                                3.2.5 Menu Recursos (Cadastros Base)
                              </h4>
                              <div className="space-y-3 ml-3">
                                <p className="text-xs text-gray-800 leading-relaxed text-justify">
                                  <strong>Motoristas:</strong> Cadastro completo de condutores incluindo dados pessoais (CPF, RG, data de nascimento, filiação, estado civil), documentação profissional (CNH com categoria, validade, prontuário, órgão emissor, RNTRC), endereço completo com comprovante, dados bancários para pagamento (banco, agência, conta corrente ou poupança, chave PIX), referências pessoais e três referências comerciais, contato de emergência com parentesco, cartões de benefícios (REPOM, PAMCARD, NDDCargo, Ticket Frete) e upload de documentos digitalizados (CNH, comprovante de endereço, foto 3x4). Sistema alerta automaticamente sobre vencimentos de documentação e permite vinculação de veículos (cavalo + até 3 implementos). Geração de ficha completa em PDF para impressão.
                                </p>
                                <p className="text-xs text-gray-800 leading-relaxed text-justify">
                                  <strong>Veículos:</strong> Registro de frota própria, agregada e terceirizada contemplando dados do veículo (placa, marca, modelo, ano de fabricação, ano do modelo, chassi, RENAVAM, cor), tipo (cavalo, carreta, truck, van, semi-reboque), especificações técnicas (capacidade de carga em kg, CMT - Capacidade Máxima de Tração, PBT - Peso Bruto Total, tipo de carroceria, quantidade de eixos, potência do motor, tipo de combustível), documentação (CRLV digitalizado, licenciamento com controle de vencimento), registro ANTT (número, validade, RNTRC, situação cadastral) com funcionalidade de consulta integrada à base ANTT para validação automática, dados do proprietário (nome, CPF/CNPJ) e controle de status operacional (disponível, em uso, manutenção, inativo). Permite vinculação com motorista específico para alocação preferencial.
                                </p>
                                <p className="text-xs text-gray-800 leading-relaxed text-justify">
                                  <strong>Parceiros:</strong> Cadastro unificado de clientes, fornecedores e transportadoras mediante chave CNPJ única. Armazena dados fiscais (CNPJ, inscrição estadual, razão social, nome fantasia), endereço completo estruturado (logradouro, número, complemento, bairro, cidade, UF, CEP), contato principal (nome, cargo, telefone, email) e classificação de tipo (cliente, fornecedor ou ambos). Sistema de sincronização automática via função backend vincula parceiros cadastrados como remetentes/destinatários quando notas fiscais são importadas. Permite busca inteligente por CNPJ com autocomplete e preenchimento automático de dados. Flag de ativo/inativo para controle sem exclusão física de registros.
                                </p>
                                <p className="text-xs text-gray-800 leading-relaxed text-justify">
                                  <strong>Operações:</strong> Configuração de tipos de operação logística com parâmetros específicos de SLA. Define nome descritivo, código identificador único, modalidade (normal ou expressa com priorização), prioridade organizacional (baixa, média, alta, urgente), tolerância em horas para cálculo de diárias de carregamento/descarga, prazo de entrega em quantidade de dias e regra de deadline (baseado em: agendamento de carregamento + dias configurados, ou agenda de descarga quando flag ativada). Opção de cálculo apenas em dias úteis (segunda a sexta, excluindo sábados e domingos). Permite desativação temporária de operações sem perda de histórico.
                                </p>
                                <p className="text-xs text-gray-800 leading-relaxed text-justify">
                                  <strong>Gestão de Usuários:</strong> Administração de perfis de acesso ao sistema com quatro tipos de usuário baseados em RBAC (Role-Based Access Control): (i) Administrador - acesso total a todos os módulos, gestão de usuários, configurações empresariais e parametrizações sistêmicas; (ii) Operador - CRUD completo de ordens, tracking e fluxo, gestão de ocorrências, visibilidade restrita a ordens da empresa vinculada; (iii) Fornecedor - portal auto-serviço para solicitar coletas, visualização de ordens próprias e tracking; (iv) Cliente - portal de aprovações de coletas, visualização de ordens destinadas ao CNPJ e acompanhamento de tracking. Workflow de cadastro contempla: registro público ou por convite, definição de tipo_perfil mediante modal obrigatório, onboarding guiado para vinculação de empresa_id ou cnpj_associado conforme perfil, status "pendente_aprovacao" até validação administrativa, processo de aprovação/rejeição com justificativa e liberação de acesso mediante aprovação. Permite atribuição de departamentos, visualização de métricas individuais de performance e upload de foto de perfil.
                                </p>
                                <p className="text-xs text-gray-800 leading-relaxed text-justify">
                                  <strong>Aprovações Pendentes:</strong> Fila de solicitações de cadastro aguardando validação administrativa. Exibe contador em tempo real no menu através de badge numérico para notificação visual de demandas pendentes. Integrado ao módulo Gestão de Usuários.
                                </p>
                              </div>
                            </div>

                            {/* Menu 3 - Coletas */}
                            <div className="bg-gray-50 p-4 rounded border-l-4 border-purple-600">
                              <h4 className="text-sm font-bold text-gray-900 mb-2">
                                3.2.3 Menu Coletas (Portal B2B)
                              </h4>
                              <div className="space-y-3 ml-3">
                                <p className="text-xs text-gray-800 leading-relaxed text-justify">
                                  <strong>Dashboard Coletas:</strong> Visão consolidada das solicitações de coleta segregadas por status (solicitado, aprovado, reprovado). Exibe métricas agregadas incluindo tempo médio de aprovação, taxa de conversão de solicitações em ordens efetivas, análise de fornecedores por volume de coletas solicitadas e gráficos de tendência temporal. Permite acesso direto às funcionalidades de solicitação e aprovação.
                                </p>
                                <p className="text-xs text-gray-800 leading-relaxed text-justify">
                                  <strong>Solicitar Coleta:</strong> Interface para fornecedores cadastrados solicitarem coleta de mercadorias. Workflow implementado: preenchimento de dados de remetente (razão social, CNPJ, endereço completo), especificação de destinatário, janela de disponibilidade temporal para coleta, descrição de itens a serem coletados, peso estimado, quantidade de volumes prevista e anexação de XMLs de notas fiscais. Sistema gera automaticamente número de protocolo (numero_coleta no formato ANO-SEQ) e notifica cliente responsável (identificado via CNPJ do destinatário) para aprovação. Status "status_aprovacao: solicitado" até manifestação do cliente.
                                </p>
                                <p className="text-xs text-gray-800 leading-relaxed text-justify">
                                  <strong>Aprovar Coletas:</strong> Portal dedicado para clientes analisarem solicitações de fornecedores vinculados ao seu CNPJ (identificados como destinatários). Permite três ações: aprovação (status_aprovacao: "aprovado"), reprovação com justificativa obrigatória (status_aprovacao: "reprovado") ou solicitação de informações complementares via comentários. Após aprovação, função backend automática converte solicitação em Ordem de Carregamento operacional (tipo_ordem: "coleta") com dados preenchidos, permitindo alocação de motorista/veículo e seguimento do fluxo normal de tracking.
                                </p>
                              </div>
                            </div>

                            {/* Menu 4 - Armazém */}
                            <div className="bg-gray-50 p-4 rounded border-l-4 border-yellow-600">
                              <h4 className="text-sm font-bold text-gray-900 mb-2">
                                3.2.4 Menu Armazém (WMS - Warehouse Management System)
                              </h4>
                              <div className="space-y-3 ml-3">
                                <p className="text-xs text-gray-800 leading-relaxed text-justify">
                                  <strong>Recebimento:</strong> Processo de conferência e registro de entrada de mercadorias. Workflow implementado: busca de Nota Fiscal por chave de acesso de 44 dígitos, integração com API MeuDanfe para download automático de XML quando não disponível localmente, extração automatizada de dados estruturados do XML (emitente, destinatário, itens, valores), criação de volumes individualizados com especificação de dimensões físicas (altura, largura, comprimento em cm) e peso individual, cálculo automático de m³ (metros cúbicos), geração de identificador único por volume (código de barras/QR Code), impressão de etiquetas individuais em formato A4 ou térmico, endereçamento físico por área do depósito (campo numero_area fixo por NF), definição de localização específica para rastreabilidade interna e registro de ocorrências em caso de divergências (avarias, falta de mercadoria, documentação incorreta).
                                </p>
                                <p className="text-xs text-gray-800 leading-relaxed text-justify">
                                  <strong>Gestão de Notas Fiscais:</strong> Repositório centralizado de documentos fiscais com gestão completa do ciclo de vida. Permite cadastro manual mediante preenchimento de formulário estruturado ou importação automatizada via XML. Exibe chave de acesso, número, série, data/hora de emissão, natureza da operação, dados completos de emitente (CNPJ, razão social, endereço, telefone), dados de destinatário, valor total da NF, informações complementares e permite download do DANFE. Status individualizado contempla cinco estados: recebida (entrada no armazém), aguardando_expedicao (separação em andamento), em_rota_entrega (embarcada em veículo), entregue (comprovante recebido) e cancelada. Implementa vinculação n:n com ordens de carregamento permitindo que uma NF seja transportada em múltiplas viagens. Gerencia volumes mediante relacionamento 1:n com entidade Volume. Calcula automaticamente data de vencimento (20 dias após emissão) para controle fiscal. Funcionalidade de sincronização automática de status via função backend (sincronizarStatusNotas) atualiza status das NFs conforme tracking da ordem vinculada.
                                </p>
                                <p className="text-xs text-gray-800 leading-relaxed text-justify">
                                  <strong>Etiquetas Mãe:</strong> Sistema de unitização e consolidação de volumes. Permite criação de etiqueta-mãe com identificador único alfanumérico, vinculação de múltiplos volumes através de scanner de QR Code (câmera ou leitor), visualização de todos os volumes agrupados com detalhamento de NF origem, peso consolidado e m³ total, remoção individual de volumes do agrupamento quando necessário, impressão de etiqueta consolidada para fixação no pallet ou caixa e registro de histórico completo de alterações (HistoricoEtiquetaMae) incluindo tipo de ação (criação, adição de volume, remoção de volume, edição), dados anteriores e novos em formato JSON, observação contextual, identificação do usuário responsável e timestamp da operação.
                                </p>
                                <p className="text-xs text-gray-800 leading-relaxed text-justify">
                                  <strong>Carregamento:</strong> Conferência de volumes para expedição em veículos. Permite leitura de etiquetas mediante scanner, validação de completude da carga, registro de endereçamento de saída, vinculação a ordem de carregamento específica e geração de romaneio de embarque. (Detalhado em item anterior.)
                                </p>
                                <p className="text-xs text-gray-800 leading-relaxed text-justify">
                                  <strong>Ordem de Entrega:</strong> Tipo específico de ordem (tipo_ordem: "entrega") para gestão de entregas fracionadas urbanas. Interface permite: listagem de NFs a serem expedidas com busca por chave de acesso ou número, vinculação opcional a Ordem Mãe para controle de expedição consolidada, criação de múltiplas Ordens Filhas quando entrega envolve vários destinos, definição de motorista e veículo específico para a rota, registro de sequenciamento de paradas quando aplicável e acompanhamento individualizado de cada entrega. Integra-se ao módulo de Tracking para atualização de status e ao módulo de Gestão de Notas Fiscais para sincronização automática de status (NF marcada como "em_rota_entrega" quando ordem de entrega é iniciada).
                                </p>
                              </div>
                            </div>

                            {/* Menu 6 - Qualidade */}
                            <div className="bg-gray-50 p-4 rounded border-l-4 border-red-600">
                              <h4 className="text-sm font-bold text-gray-900 mb-2">
                                3.2.6 Menu Qualidade
                              </h4>
                              <div className="space-y-3 ml-3">
                                <p className="text-xs text-gray-800 leading-relaxed text-justify">
                                  <strong>Ocorrências:</strong> Sistema de registro e gestão de não-conformidades segregadas em quatro categorias: (i) tracking - problemas durante viagem (pneu furado, acidente, bloqueio de estrada, problema mecânico, condições climáticas adversas, roubo); (ii) fluxo - desvios em processos internos (atraso em etapa, documentação pendente, aprovação bloqueada); (iii) tarefa - atividades administrativas que não impactam SLA; (iv) diária - cobrança de estadias por espera excessiva em carregamento/descarga. Cada tipo de ocorrência possui configuração individual de campos customizados obrigatórios/opcionais (texto, checklist, anexo, monetário, booleano, data), prazo SLA para resolução em minutos, atribuição automática de responsável por usuário ou departamento, cor de identificação e ícone. Sistema de gravidade implementa quatro níveis com penalidades diferenciadas no sistema de gamificação: baixa (-5 pontos), média (-10 pontos), alta (-20 pontos) e crítica (-40 pontos). Workflow de gestão contempla: registro com tipo customizado e evidências fotográficas obrigatórias quando configurado, geração automática de número de ticket no formato AAMMDDHHNN (ano/mês/dia/hora/número sequencial), atribuição automática ou manual de responsável, cálculo de prazo SLA baseado em tipo de ocorrência, notificação via polling a cada 60 segundos com card popup em layout, tratamento através de modal com preenchimento de campos customizados, possibilidade de marcação N/A para campos opcionais, resolução com registro de data/hora final e observações de resolução e análise de impacto automático no SLA individual e organizacional. Features especiais incluem gestão integrada de diárias com fluxo específico (pendente_valor → pendente_autorizacao → autorizado_faturamento / abonado → faturado), upload de evidências de autorização do cliente, modal dedicado para definição de valores e aprovações em lote.
                                </p>
                                <p className="text-xs text-gray-800 leading-relaxed text-justify">
                                  <strong>Gamificação:</strong> Módulo de engajamento de usuários mediante sistema de pontos, conquistas e rankings. Implementa fórmula de cálculo SLA = (60% × Qualidade) + (40% × Produtividade), onde Qualidade = 100 pontos base - penalidades de ocorrências + bônus por resolução rápida, e Produtividade = pontos por ordens criadas + pontos por etapas concluídas comparados à média da equipe. Cinco níveis de progressão foram estabelecidos: Iniciante (0-100 pontos), Cadete (101-300 pontos), Operacional (301-600 pontos), Mestre (601-1000 pontos) e Comandante (1000+ pontos). Exibe leaderboards em três modalidades: ranking geral acumulado desde início do uso, ranking mensal com reset automático, e ranking por categoria de usuário. Histórico individual apresenta evolução mensal em gráfico de linha, detalhamento de métricas de qualidade e produtividade, taxa de cumprimento de prazos, total de ocorrências registradas e resolvidas e comparativo com média da equipe. Funcionalidade de expurgo permite que administrador remova meses específicos do cálculo em situações excepcionais (licença médica, férias prolongadas), registrando justificativa e evidência documental.
                                </p>
                              </div>
                            </div>

                            {/* Menu 7 - Comunicação */}
                            <div className="bg-gray-50 p-4 rounded border-l-4 border-cyan-600">
                              <h4 className="text-sm font-bold text-gray-900 mb-2">
                                3.2.7 Menu Comunicação
                              </h4>
                              <div className="space-y-3 ml-3">
                                <p className="text-xs text-gray-800 leading-relaxed text-justify">
                                  <strong>App Motorista:</strong> Interface móvel-first acessível via SMS com token temporário de autenticação (validade de 24 horas). Workflow do motorista contempla: recebimento de SMS contendo link único, autenticação através de token sem necessidade de senha, visualização de lista de viagens atribuídas com dados resumidos (origem, destino, tipo de carga, prazo de entrega), atualização de status da operação mediante botões simplificados (ícones grandes e textos claros: "Em Carregamento", "Saí para Viagem", "Cheguei no Destino"), upload de documentos obrigatórios (CT-e, comprovante de entrega, fotografias da carga) através de câmera do dispositivo ou galeria com captura automática de geolocalização no momento do upload, chat bidirecional em tempo real com central operacional para comunicação de intercorrências mediante WebSocket com fallback para polling, e atualização de cadastro pessoal assistida por agente de IA (ChipcAgenteCadastro) que permite alteração de dados bancários, contatos e endereço através de conversação em linguagem natural.
                                </p>
                                <p className="text-xs text-gray-800 leading-relaxed text-justify">
                                  <strong>SAC (Serviço de Atendimento ao Cliente):</strong> Sistema de Service Desk integrado com agente de IA baseado em LLM (Large Language Model) para atendimento automatizado. Implementa conversação em linguagem natural com acesso direto a entidades do sistema (OrdemDeCarregamento, Motorista, Veiculo, Tracking, Ocorrencia), permitindo consultas complexas ("Quais ordens estão atrasadas?"), criação e atualização de registros por comando de voz ("Crie uma ordem de SP para RJ") e pesquisas web integradas quando necessário através de flag add_context_from_internet. Permite abertura de tickets categorizados automaticamente mediante processamento de linguagem natural, sugestão de respostas baseadas em base de conhecimento histórica, escalonamento para atendimento humano quando detecção de insatisfação ou complexidade elevada e registro de histórico completo de interações com cálculo de tempo médio de resolução por categoria de problema. Implementa pesquisa NPS pós-atendimento em escala 0-10 para medição de satisfação.
                                </p>
                              </div>
                            </div>

                          </div>
                        </div>

                        <div className="bg-white p-5 rounded border border-gray-300 mt-4">
                          <h3 className="text-base font-bold text-gray-900 mb-3">3.3 Produto Mínimo Viável (MVP)</h3>
                          <p className="text-sm text-gray-800 leading-relaxed text-justify mb-3">
                            O MVP foi concluído e disponibilizado em ambiente de produção em janeiro de 2025, contemplando todos os doze módulos funcionais especificados. A arquitetura implementada compreende mais de 25 entidades no banco de dados relacional, 40 componentes React reutilizáveis e 15 funções backend serverless.
                          </p>
                        </div>
                      </div>
                    </section>

                    {/* FASE 4 - GROWTH */}
                    <section className="mb-10">
                      <div className="bg-gray-800 text-white p-4 mb-4">
                        <h2 className="text-lg font-bold uppercase">
                          4. FASE GROWTH - Estratégias de Crescimento e Escala
                        </h2>
                      </div>

                      <div className="space-y-6">
                        
                        {/* 4.1 Plano de Marketing Integrado */}
                        <div className="bg-white p-5 rounded border border-gray-400">
                          <h3 className="text-base font-bold text-gray-900 mb-3">4.1 Plano de Marketing Integrado: Aquisição e Retenção</h3>
                          <p className="text-sm text-gray-800 leading-relaxed text-justify mb-3">
                            O plano de marketing foi estruturado em duas frentes complementares: aquisição de novos clientes através de canais diretos e indiretos, e retenção da base instalada mediante práticas de Customer Success e Product-Led Growth.
                          </p>

                          <h4 className="text-sm font-bold text-gray-900 mb-2 mt-4">4.1.1 Canais de Marketing para Aquisição</h4>
                          <div className="overflow-x-auto">
                            <p className="text-xs text-center font-bold text-gray-900 mb-2">Tabela 5 - Estratégia de Canais de Marketing</p>
                            <table className="w-full text-xs border-collapse border border-gray-400">
                              <thead className="bg-gray-200">
                                <tr>
                                  <th className="border border-gray-400 p-2 text-left" style={{width: '18%'}}>Tipo</th>
                                  <th className="border border-gray-400 p-2 text-left" style={{width: '25%'}}>Canal</th>
                                  <th className="border border-gray-400 p-2 text-left" style={{width: '30%'}}>Táticas Específicas</th>
                                  <th className="border border-gray-400 p-2 text-left" style={{width: '15%'}}>CAC Estimado</th>
                                  <th className="border border-gray-400 p-2 text-left" style={{width: '12%'}}>Priority</th>
                                </tr>
                              </thead>
                              <tbody>
                                <tr className="bg-blue-50">
                                  <td className="border border-gray-400 p-2 font-bold" rowSpan="5">Canais Diretos (Owned)</td>
                                  <td className="border border-gray-400 p-2">SEO Orgânico</td>
                                  <td className="border border-gray-400 p-2">Blog técnico com artigos sobre "TMS para transportadoras", "workflow BPMN logística", "gamificação operações". Meta: posição top 3 Google em 6 palavras-chave prioritárias</td>
                                  <td className="border border-gray-400 p-2">R$ 120/cliente</td>
                                  <td className="border border-gray-400 p-2">Alta</td>
                                </tr>
                                <tr className="bg-blue-50">
                                  <td className="border border-gray-400 p-2">Marketing de Conteúdo</td>
                                  <td className="border border-gray-400 p-2">Webinars mensais "Como reduzir custos logísticos", eBooks técnicos (WMS simplificado, BPMN prático), cases de sucesso documentados</td>
                                  <td className="border border-gray-400 p-2">R$ 85/cliente</td>
                                  <td className="border border-gray-400 p-2">Alta</td>
                                </tr>
                                <tr className="bg-blue-50">
                                  <td className="border border-gray-400 p-2">Email Marketing</td>
                                  <td className="border border-gray-400 p-2">Nurturing flows segmentados (trial users, free users inativos, leads frios), newsletters quinzenais com dicas operacionais</td>
                                  <td className="border border-gray-400 p-2">R$ 35/cliente</td>
                                  <td className="border border-gray-400 p-2">Média</td>
                                </tr>
                                <tr className="bg-blue-50">
                                  <td className="border border-gray-400 p-2">LinkedIn Ads</td>
                                  <td className="border border-gray-400 p-2">Anúncios segmentados para "Gerente de Operações", "Dono Transportadora". Budget R$ 3.000/mês. Conversão trial: 8-12%</td>
                                  <td className="border border-gray-400 p-2">R$ 450/cliente</td>
                                  <td className="border border-gray-400 p-2">Média</td>
                                </tr>
                                <tr className="bg-blue-50">
                                  <td className="border border-gray-400 p-2">Google Ads (Search)</td>
                                  <td className="border border-gray-400 p-2">Palavras-chave intent: "sistema gestão transporte", "TMS transportadora". Budget R$ 2.500/mês</td>
                                  <td className="border border-gray-400 p-2">R$ 380/cliente</td>
                                  <td className="border border-gray-400 p-2">Baixa</td>
                                </tr>
                                <tr className="bg-green-50">
                                  <td className="border border-gray-400 p-2 font-bold" rowSpan="4">Canais Indiretos (Partner)</td>
                                  <td className="border border-gray-400 p-2">Parcerias Associações</td>
                                  <td className="border border-gray-400 p-2">ABRATI, NTC, sindicatos regionais. Patrocínio eventos (R$ 5k), palestras técnicas, desconto associados 15%</td>
                                  <td className="border border-gray-400 p-2">R$ 180/cliente</td>
                                  <td className="border border-gray-400 p-2">Alta</td>
                                </tr>
                                <tr className="bg-green-50">
                                  <td className="border border-gray-400 p-2">Revendedores Regionais</td>
                                  <td className="border border-gray-400 p-2">Consultorias logística Sul/Sudeste, comissão 20% recorrente, treinamento certificação, materiais co-branded</td>
                                  <td className="border border-gray-400 p-2">R$ 220/cliente</td>
                                  <td className="border border-gray-400 p-2">Média</td>
                                </tr>
                                <tr className="bg-green-50">
                                  <td className="border border-gray-400 p-2">Integradores Software</td>
                                  <td className="border border-gray-400 p-2">Parceria com implementadores ERP (TOTVS, SAP), APIs documentadas, revenue share 15%</td>
                                  <td className="border border-gray-400 p-2">R$ 150/cliente</td>
                                  <td className="border border-gray-400 p-2">Média</td>
                                </tr>
                                <tr className="bg-green-50">
                                  <td className="border border-gray-400 p-2">Programa Indicação</td>
                                  <td className="border border-gray-400 p-2">Cliente indica outro: ambos ganham 1 mês grátis. Rastreamento via código único. K-factor meta: 0,4</td>
                                  <td className="border border-gray-400 p-2">R$ 65/cliente</td>
                                  <td className="border border-gray-400 p-2">Alta</td>
                                </tr>
                              </tbody>
                            </table>
                            <p className="text-xs text-gray-600 italic mt-2">Fonte: Plano de marketing elaborado pelo autor (2025)</p>
                          </div>

                          <h4 className="text-sm font-bold text-gray-900 mb-2 mt-4">4.1.2 Estratégia de Integração de Canais</h4>
                          <div className="ml-4 space-y-3 text-xs text-gray-800">
                            <p className="text-justify">
                              <strong>Multicanal:</strong> Presença simultânea em diversos pontos de contato (LinkedIn, Google, email, eventos, parcerias) permitindo que cliente escolha canal preferencial para conhecer o produto. Cada canal opera de forma independente com métricas próprias de conversão.
                            </p>
                            <p className="text-justify">
                              <strong>Cross-Channel:</strong> Integração parcial entre canais mediante remarketing: usuário que visitou landing page via SEO recebe LinkedIn Ads personalizados 48h depois; leads que baixaram eBook recebem email nurturing com convite para webinar; participantes de webinar recebem trial estendido 14 dias.
                            </p>
                            <p className="text-justify">
                              <strong>Omnichannel (meta Q4/2025):</strong> Experiência unificada independente do canal: dados compartilhados em tempo real (CRM único com HubSpot), mensagens consistentes em todos pontos de contato, transição fluida entre canais (inicia conversa no chat do site, continua via WhatsApp, finaliza com ligação comercial sem repetir informações). Implementação progressiva iniciando com integração LinkedIn + Email + CRM.
                            </p>
                          </div>

                          <h4 className="text-sm font-bold text-gray-900 mb-2 mt-4">4.1.3 Modelo de Negócio e Estratégia de Aquisição</h4>
                          <p className="text-sm text-gray-800 leading-relaxed text-justify">
                            O modelo SaaS B2B com freemium influencia diretamente a estratégia de aquisição: (a) Freemium reduz fricção inicial permitindo teste sem compromisso financeiro, resultando em foco em canais de baixo CAC (SEO, content marketing, referral); (b) Ciclo de vendas B2B médio de 45 dias demanda nurturing prolongado através de email sequences e remarketing; (c) LTV elevado (R$ 8.500) justifica investimento em canais premium como LinkedIn Ads e vendas diretas consultivas; (d) Produto self-service permite modelo Product-Led com baixa dependência de equipe comercial (1 SDR para cada 100 leads); (e) Diferenciação técnica (gamificação, BPMN) viabiliza posicionamento premium justificando investimento em marketing educacional ao invés de competição puramente por preço.
                          </p>
                        </div>

                        {/* 4.2 Plano de Ativação e Expansão de Receita */}
                        <div className="bg-white p-5 rounded border border-gray-400">
                          <h3 className="text-base font-bold text-gray-900 mb-3">4.2 Plano de Ativação e Expansão de Receita</h3>
                          
                          <h4 className="text-sm font-bold text-gray-900 mb-2">4.2.1 Estratégia de Onboarding e Ativação</h4>
                          <p className="text-sm text-gray-800 leading-relaxed text-justify mb-3">
                            Framework de onboarding estruturado em cinco etapas com metas específicas de Time to Value (TTV), conforme Tabela 6.
                          </p>
                          <div className="overflow-x-auto mb-4">
                            <p className="text-xs text-center font-bold text-gray-900 mb-2">Tabela 6 - Framework de Onboarding em 5 Etapas</p>
                            <table className="w-full text-xs border-collapse border border-gray-400">
                              <thead className="bg-gray-200">
                                <tr>
                                  <th className="border border-gray-400 p-2 text-left" style={{width: '12%'}}>Etapa</th>
                                  <th className="border border-gray-400 p-2 text-left" style={{width: '22%'}}>Objetivo</th>
                                  <th className="border border-gray-400 p-2 text-left" style={{width: '30%'}}>Táticas Implementadas</th>
                                  <th className="border border-gray-400 p-2 text-left" style={{width: '18%'}}>Métrica de Sucesso</th>
                                  <th className="border border-gray-400 p-2 text-left" style={{width: '18%'}}>Prazo Ideal</th>
                                </tr>
                              </thead>
                              <tbody>
                                <tr>
                                  <td className="border border-gray-400 p-2 font-bold">1. Sign Up</td>
                                  <td className="border border-gray-400 p-2">Cadastro rápido sem fricção</td>
                                  <td className="border border-gray-400 p-2">OAuth Google/Microsoft, formulário 3 campos (nome, email, empresa), confirmação email automática, acesso imediato sem aprovação manual</td>
                                  <td className="border border-gray-400 p-2">Taxa conversão landing→cadastro ≥ 25%</td>
                                  <td className="border border-gray-400 p-2">&lt; 2 minutos</td>
                                </tr>
                                <tr className="bg-gray-50">
                                  <td className="border border-gray-400 p-2 font-bold">2. Setup</td>
                                  <td className="border border-gray-400 p-2">Configuração inicial guiada</td>
                                  <td className="border border-gray-400 p-2">Wizard 4 passos: dados empresa, convite equipe (opcional), criação primeira operação (template pré-definido), tutorial interativo (Product Tour via Intro.js)</td>
                                  <td className="border border-gray-400 p-2">80% completam wizard até final</td>
                                  <td className="border border-gray-400 p-2">&lt; 10 minutos</td>
                                </tr>
                                <tr>
                                  <td className="border border-gray-400 p-2 font-bold">3. Aha Moment</td>
                                  <td className="border border-gray-400 p-2">Primeira ordem criada (valor percebido)</td>
                                  <td className="border border-gray-400 p-2">Incentivo criar ordem em 24h (badge gamificação), template pré-preenchido com dados exemplo, vídeo 90 seg mostrando importação PDF, chat proativo se não criar em 48h</td>
                                  <td className="border border-gray-400 p-2">70% criam 1ª ordem em ≤24h</td>
                                  <td className="border border-gray-400 p-2">1º dia</td>
                                </tr>
                                <tr className="bg-gray-50">
                                  <td className="border border-gray-400 p-2 font-bold">4. Habit Building</td>
                                  <td className="border border-gray-400 p-2">Uso recorrente (3+ sessões/semana)</td>
                                  <td className="border border-gray-400 p-2">Notificações push inteligentes (não spam), email semanal com resumo operacional, gamificação com streak (dias consecutivos uso), challenges semanais</td>
                                  <td className="border border-gray-400 p-2">DAU/MAU ≥ 0,5 após 30 dias</td>
                                  <td className="border border-gray-400 p-2">Semana 2-4</td>
                                </tr>
                                <tr>
                                  <td className="border border-gray-400 p-2 font-bold">5. Advocacy</td>
                                  <td className="border border-gray-400 p-2">Transformar em promotor</td>
                                  <td className="border border-gray-400 p-2">NPS após 60 dias, pedido review G2/Capterra (incentivo R$ 100 cupom), programa embaixadores (3 indicações = upgrade grátis Pro 1 mês)</td>
                                  <td className="border border-gray-400 p-2">NPS ≥ 8/10, taxa referral 15%</td>
                                  <td className="border border-gray-400 p-2">Dia 60-90</td>
                                </tr>
                              </tbody>
                            </table>
                            <p className="text-xs text-gray-600 italic mt-2">Fonte: Framework de ativação elaborado pelo autor (2025)</p>
                          </div>

                          <h4 className="text-sm font-bold text-gray-900 mb-2 mt-4">4.2.2 Estratégias de Retenção e Engajamento</h4>
                          <div className="ml-4 space-y-2 text-xs text-gray-800">
                            <p><strong>Check-ins Proativos:</strong> Customer Success Manager (CSM) entra em contato dias 7, 30 e 60 para health check. Identificação precoce de churn risk mediante análise de engagement score (login frequency + features used + ordens criadas);</p>
                            <p><strong>Base de Conhecimento:</strong> Documentação técnica categorizada por perfil (admin, operador, motorista), vídeos tutoriais curtos (&lt;3 min), FAQ com busca semântica, webinars mensais ao vivo com Q&A;</p>
                            <p><strong>Suporte Responsivo:</strong> Chat in-app com SLA 2h (horário comercial), tickets via sistema de chamados, escalação automática bugs críticos, satisfação pós-atendimento via NPS;</p>
                            <p><strong>Product Updates:</strong> Changelog quinzenal comunicado via email + modal in-app, roadmap público votável (users votam features prioritárias), early access beta features para power users.</p>
                          </div>

                          <h4 className="text-sm font-bold text-gray-900 mb-2 mt-4">4.2.3 Expansão de Receita: Upsell e Cross-Sell</h4>
                          <div className="overflow-x-auto">
                            <p className="text-xs text-center font-bold text-gray-900 mb-2">Tabela 7 - Estratégias de Monetização Progressiva</p>
                            <table className="w-full text-xs border-collapse border border-gray-400">
                              <thead className="bg-gray-200">
                                <tr>
                                  <th className="border border-gray-400 p-2 text-left">Estratégia</th>
                                  <th className="border border-gray-400 p-2 text-left">Trigger (Gatilho)</th>
                                  <th className="border border-gray-400 p-2 text-left">Oferta</th>
                                  <th className="border border-gray-400 p-2 text-left">Conversão Esperada</th>
                                </tr>
                              </thead>
                              <tbody>
                                <tr>
                                  <td className="border border-gray-400 p-2 font-bold">Upsell: Free → Starter</td>
                                  <td className="border border-gray-400 p-2">Usuário atinge 40 ordens/mês (limite 50)</td>
                                  <td className="border border-gray-400 p-2">Modal: "Upgrade para Starter (R$ 199) e ganhe workflow BPMN + gamificação + 200 ordens/mês". Trial 7 dias grátis</td>
                                  <td className="border border-gray-400 p-2">35% convertem</td>
                                </tr>
                                <tr className="bg-gray-50">
                                  <td className="border border-gray-400 p-2 font-bold">Upsell: Starter → Pro</td>
                                  <td className="border border-gray-400 p-2">Cliente com 4+ operadores ou 180 ordens/mês</td>
                                  <td className="border border-gray-400 p-2">Email personalizado CSM: "Seu time cresceu! Pro (R$ 399) libera usuários ilimitados + WMS completo + Portal B2B". Desconto 20% 1º mês</td>
                                  <td className="border border-gray-400 p-2">22% convertem</td>
                                </tr>
                                <tr>
                                  <td className="border border-gray-400 p-2 font-bold">Cross-Sell: Add-ons</td>
                                  <td className="border border-gray-400 p-2">Cliente Pro com &gt;500 ordens/mês</td>
                                  <td className="border border-gray-400 p-2">Rastreamento GPS real-time +R$ 99/mês (disponível Q2/25), módulo financeiro +R$ 149/mês (Q3/25), integração ERP customizada R$ 499 setup + R$ 79/mês</td>
                                  <td className="border border-gray-400 p-2">18% adotam add-on</td>
                                </tr>
                                <tr className="bg-gray-50">
                                  <td className="border border-gray-400 p-2 font-bold">Expansão: Enterprise</td>
                                  <td className="border border-gray-400 p-2">Cliente Pro com &gt;1.000 ordens/mês ou 10+ usuários</td>
                                  <td className="border border-gray-400 p-2">Proposta customizada: white-label, CSM dedicado, SLA 99,9%, treinamento presencial, API priority support. Precificação sob medida (R$ 1.200-3.500/mês)</td>
                                  <td className="border border-gray-400 p-2">12% migram Enterprise</td>
                                </tr>
                              </tbody>
                            </table>
                            <p className="text-xs text-gray-600 italic mt-2">Fonte: Estratégia de monetização elaborada pelo autor (2025)</p>
                          </div>

                          <h4 className="text-sm font-bold text-gray-900 mb-2 mt-4">4.2.4 Otimização da Jornada do Cliente (Customer Journey Optimization)</h4>
                          <p className="text-sm text-gray-800 leading-relaxed text-justify">
                            Cada etapa da jornada foi mapeada e otimizada: <strong>Awareness:</strong> Anúncios focados em dor específica "Perdeu 3h procurando informação de carga hoje?", landing pages segmentadas por persona (gestor vs operador); <strong>Consideration:</strong> Demo interativa sem necessidade de contato comercial, comparativo transparente vs concorrentes, calculadora ROI (quanto economiza com automação); <strong>Decision:</strong> Trial sem cartão de crédito, quick wins documentados ("Crie primeira ordem em 5 min"), testimonials vídeo de clientes similares; <strong>Onboarding:</strong> Wizard progressivo, tooltips contextuais, vídeos curtos embutidos, chat proativo dia 3; <strong>Adoção:</strong> Gamificação unlock features à medida que usa, email tips & tricks semanal, webinar mensal usuários; <strong>Expansão:</strong> In-app upsell não invasivo (banner discreto quando próximo do limite), conversas consultivas CSM baseadas em usage data; <strong>Advocacy:</strong> Programa de benefícios para promotores (early access features, eventos exclusivos, certificação oficial).
                          </p>
                        </div>

                        {/* 4.3 Estratégia Product-Led Growth */}
                        <div className="bg-white p-5 rounded border border-gray-400">
                          <h3 className="text-base font-bold text-gray-900 mb-3">4.3 Estratégia de Product-Led Growth (PLG)</h3>
                          
                          <h4 className="text-sm font-bold text-gray-900 mb-2">4.3.1 Produto como Principal Impulsionador de Crescimento</h4>
                          <p className="text-sm text-gray-800 leading-relaxed text-justify mb-3">
                            Estratégia PLG fundamentada em três pilares: (1) <strong>Modelo Freemium:</strong> Plano gratuito funcional (não apenas trial limitado) permite experimentação profunda sem risco, convertendo 25-30% para pago quando atingem limite de valor; (2) <strong>Self-Service Completo:</strong> Zero dependência de vendedor para adoção inicial - cadastro, configuração, uso e upgrade 100% automatizados; (3) <strong>Virality Embutida:</strong> Features que naturalmente incentivam compartilhamento (portal clientes/fornecedores, app motorista, relatórios públicos de tracking).
                          </p>

                          <h4 className="text-sm font-bold text-gray-900 mb-2 mt-3">4.3.2 Garantia de Experiência Excepcional do Usuário</h4>
                          <div className="ml-4 space-y-2 text-xs text-gray-800">
                            <p><strong>Performance:</strong> Core Web Vitals otimizados - LCP &lt;1,8s, FID &lt;100ms, CLS &lt;0,1. Lazy loading de módulos reduz bundle inicial 60%. Code splitting por rota garante carregamento instantâneo;</p>
                            <p><strong>Usabilidade:</strong> System Usability Scale (SUS) de 82/100 (classificação "Excelente"). Interface consistente seguindo Design System interno. Atalhos de teclado para power users. Modo escuro nativo;</p>
                            <p><strong>Confiabilidade:</strong> Uptime 99,8% (monitorado via UptimeRobot), error tracking com Sentry, rollback automático em caso de bugs críticos, backups diários com point-in-time recovery;</p>
                            <p><strong>Acessibilidade:</strong> Conformidade WCAG 2.1 AA, navegação completa via teclado, contraste adequado, labels descritivos, suporte leitores de tela;</p>
                            <p><strong>Mobile-First:</strong> 100% funcionalidades disponíveis em mobile responsivo, app motorista nativo (roadmap Q2/25), progressive web app (PWA) com offline-first para módulos críticos.</p>
                          </div>

                          <h4 className="text-sm font-bold text-gray-900 mb-2 mt-3">4.3.3 Loops Virais e Crescimento Orgânico</h4>
                          <div className="overflow-x-auto">
                            <p className="text-xs text-center font-bold text-gray-900 mb-2">Tabela 8 - Loops Virais Implementados</p>
                            <table className="w-full text-xs border-collapse border border-gray-400">
                              <thead className="bg-gray-200">
                                <tr>
                                  <th className="border border-gray-400 p-2 text-left" style={{width: '25%'}}>Loop Viral</th>
                                  <th className="border border-gray-400 p-2 text-left" style={{width: '45%'}}>Mecânica</th>
                                  <th className="border border-gray-400 p-2 text-left" style={{width: '15%'}}>K-Factor</th>
                                  <th className="border border-gray-400 p-2 text-left" style={{width: '15%'}}>Cycle Time</th>
                                </tr>
                              </thead>
                              <tbody>
                                <tr>
                                  <td className="border border-gray-400 p-2 font-bold">Portal B2B Clientes</td>
                                  <td className="border border-gray-400 p-2">Transportadora convida clientes para portal tracking. Cliente cria conta, vê valor (transparência), solicita que outros fornecedores também usem sistema. Efeito rede: 1 transportadora → 5-10 clientes/fornecedores</td>
                                  <td className="border border-gray-400 p-2">0,3</td>
                                  <td className="border border-gray-400 p-2">14 dias</td>
                                </tr>
                                <tr className="bg-gray-50">
                                  <td className="border border-gray-400 p-2 font-bold">App Motorista Viral</td>
                                  <td className="border border-gray-400 p-2">Motorista usa app, percebe facilidade vs ligações. Comenta com colegas em paradas/postos. Outros motoristas pedem para transportadoras adotarem sistema. Bottom-up adoption</td>
                                  <td className="border border-gray-400 p-2">0,15</td>
                                  <td className="border border-gray-400 p-2">21 dias</td>
                                </tr>
                                <tr>
                                  <td className="border border-gray-400 p-2 font-bold">Indicação Incentivada</td>
                                  <td className="border border-gray-400 p-2">Cliente refere outro via link único. Ambos ganham 1 mês grátis. Dashboard mostra quantos indicou e status conversão. Leaderboard indicadores mês</td>
                                  <td className="border border-gray-400 p-2">0,4</td>
                                  <td className="border border-gray-400 p-2">7 dias</td>
                                </tr>
                                <tr className="bg-gray-50">
                                  <td className="border border-gray-400 p-2 font-bold">Relatórios Públicos</td>
                                  <td className="border border-gray-400 p-2">Transportadora compartilha link tracking público com cliente final. Footer: "Rastreado por [Logo Sistema]". Cliente final descobre produto, considera para própria operação logística</td>
                                  <td className="border border-gray-400 p-2">0,08</td>
                                  <td className="border border-gray-400 p-2">45 dias</td>
                                </tr>
                              </tbody>
                            </table>
                            <p className="text-xs text-gray-600 italic mt-2">Fonte: Análise de loops virais elaborada pelo autor (2025)</p>
                            <p className="text-xs text-gray-800 mt-2"><strong>K-Factor Composto:</strong> 0,3 + 0,15 + 0,4 + 0,08 = 0,93. Meta atingir K &gt; 1,0 (crescimento viral autossustentável) em Q3/2025 mediante otimizações nos incentivos e redução do cycle time.</p>
                          </div>

                          <h4 className="text-sm font-bold text-gray-900 mb-2 mt-4">4.3.4 Experimentos e Validações (Roadmap Q1-Q2/2025)</h4>
                          <div className="ml-4 space-y-2 text-xs text-gray-800">
                            <p><strong>Experimento 1 - Onboarding:</strong> Wizard único com todos campos (controle) vs wizard 3 etapas progressivo (teste). Hipótese: +25% conclusão. Ferramenta: Google Optimize, duração 14 dias, n=100 usuários;</p>
                            <p><strong>Experimento 2 - Pricing:</strong> Mostrar preço imediatamente na landing (controle) vs ocultar preço, pedir demo primeiro (teste). Hipótese: -40% bounce rate. Ferramenta: Unbounce A/B test, n=500 visitantes;</p>
                            <p><strong>Experimento 3 - Ativação:</strong> Email genérico boas-vindas (controle) vs vídeo personalizado CEO 30seg (teste, via Loom). Hipótese: +35% engagement. Métrica: taxa clique CTA "Criar Primeira Ordem";</p>
                            <p><strong>Experimento 4 - Gamificação:</strong> Pontos visíveis apenas em página específica (controle) vs badge flutuante sempre visível com progresso (teste). Hipótese: +50% ações completadas. Duração: 30 dias, n=50 operadores;</p>
                            <p><strong>Experimento 5 - Referral:</strong> Recompensa R$ 50 desconto (controle) vs 1 mês grátis (teste). Hipótese: +80% shares. Rastreamento via UTM parameters + Mixpanel.</p>
                          </div>
                        </div>

                        {/* 4.4 Plano de Product Marketing */}
                        <div className="bg-white p-5 rounded border border-gray-400">
                          <h3 className="text-base font-bold text-gray-900 mb-3">4.4 Plano de Product Marketing</h3>
                          
                          <h4 className="text-sm font-bold text-gray-900 mb-2">4.4.1 Definição do ICP (Ideal Customer Profile)</h4>
                          <div className="overflow-x-auto mb-4">
                            <p className="text-xs text-center font-bold text-gray-900 mb-2">Tabela 9 - Perfil do Cliente Ideal Segmentado</p>
                            <table className="w-full text-xs border-collapse border border-gray-400">
                              <thead className="bg-gray-200">
                                <tr>
                                  <th className="border border-gray-400 p-2 text-left">Característica</th>
                                  <th className="border border-gray-400 p-2 text-left">ICP Primário (Sweet Spot)</th>
                                  <th className="border border-gray-400 p-2 text-left">ICP Secundário</th>
                                </tr>
                              </thead>
                              <tbody>
                                <tr>
                                  <td className="border border-gray-400 p-2 font-bold">Porte Empresa</td>
                                  <td className="border border-gray-400 p-2">Médio porte: 20-100 veículos, faturamento R$ 5-25 milhões/ano, 8-30 colaboradores administrativos</td>
                                  <td className="border border-gray-400 p-2">Pequeno porte em crescimento: 10-20 veículos, faturamento R$ 2-5 milhões</td>
                                </tr>
                                <tr className="bg-gray-50">
                                  <td className="border border-gray-400 p-2 font-bold">Tipo de Operação</td>
                                  <td className="border border-gray-400 p-2">Fracionado dedicado, transporte rodoviário regional (Sul/Sudeste), múltiplos clientes B2B (5-20 clientes ativos)</td>
                                  <td className="border border-gray-400 p-2">FTL (Full Truck Load) com necessidade WMS, operações estaduais</td>
                                </tr>
                                <tr>
                                  <td className="border border-gray-400 p-2 font-bold">Maturidade Tecnológica</td>
                                  <td className="border border-gray-400 p-2">Usa planilhas Excel + WhatsApp. Reconhece limitações. Aberto a SaaS. Sem TMS atual ou TMS insatisfatório</td>
                                  <td className="border border-gray-400 p-2">Usa sistema legado mas busca modernização. Familiarizado com cloud</td>
                                </tr>
                                <tr className="bg-gray-50">
                                  <td className="border border-gray-400 p-2 font-bold">Dor Crítica</td>
                                  <td className="border border-gray-400 p-2">Clientes exigem tracking tempo real. Perda de informações. Impossibilidade medir SLA. Equipe desmotivada</td>
                                  <td className="border border-gray-400 p-2">Crescimento rápido sem processos. Gargalos operacionais. Alto turnover</td>
                                </tr>
                                <tr>
                                  <td className="border border-gray-400 p-2 font-bold">Budget Tecnologia</td>
                                  <td className="border border-gray-400 p-2">R$ 200-500/mês disponível para software. ROI esperado &lt;6 meses</td>
                                  <td className="border border-gray-400 p-2">R$ 100-200/mês. Sensibilidade preço alta</td>
                                </tr>
                                <tr className="bg-gray-50">
                                  <td className="border border-gray-400 p-2 font-bold">Localização</td>
                                  <td className="border border-gray-400 p-2">São Paulo, Minas Gerais, Paraná, Santa Catarina, Rio Grande do Sul</td>
                                  <td className="border border-gray-400 p-2">Rio de Janeiro, Goiás, Bahia (expansão futura)</td>
                                </tr>
                              </tbody>
                            </table>
                            <p className="text-xs text-gray-600 italic mt-2">Fonte: Segmentação de ICP elaborada pelo autor (2025)</p>
                          </div>

                          <h4 className="text-sm font-bold text-gray-900 mb-2 mt-3">4.4.2 Identificação dos Tomadores de Decisão</h4>
                          <div className="overflow-x-auto mb-4">
                            <p className="text-xs text-center font-bold text-gray-900 mb-2">Tabela 10 - Buying Committee e Influenciadores</p>
                            <table className="w-full text-xs border-collapse border border-gray-400">
                              <thead className="bg-gray-200">
                                <tr>
                                  <th className="border border-gray-400 p-2 text-left">Stakeholder</th>
                                  <th className="border border-gray-400 p-2 text-left">Papel Decisão</th>
                                  <th className="border border-gray-400 p-2 text-left">Dores/Motivações</th>
                                  <th className="border border-gray-400 p-2 text-left">Mensagem Chave</th>
                                </tr>
                              </thead>
                              <tbody>
                                <tr>
                                  <td className="border border-gray-400 p-2 font-bold">Dono/Sócio (Economic Buyer)</td>
                                  <td className="border border-gray-400 p-2">Decisor final, aprova budget</td>
                                  <td className="border border-gray-400 p-2">ROI, redução custos operacionais, competitividade, risco baixo</td>
                                  <td className="border border-gray-400 p-2">"Reduza 35% custos operacionais. ROI em 4 meses. Freemium sem risco."</td>
                                </tr>
                                <tr className="bg-gray-50">
                                  <td className="border border-gray-400 p-2 font-bold">Gerente Operações (Champion)</td>
                                  <td className="border border-gray-400 p-2">Influenciador principal, defende internamente</td>
                                  <td className="border border-gray-400 p-2">Visibilidade operacional, métricas objetivas, redução stress, reconhecimento profissional</td>
                                  <td className="border border-gray-400 p-2">"Tenha controle total. Métricas em tempo real. Equipe mais produtiva."</td>
                                </tr>
                                <tr>
                                  <td className="border border-gray-400 p-2 font-bold">Operadores (End Users)</td>
                                  <td className="border border-gray-400 p-2">Usuários finais, podem vetar se ruim</td>
                                  <td className="border border-gray-400 p-2">Facilidade uso, menos retrabalho, gamificação, reconhecimento</td>
                                  <td className="border border-gray-400 p-2">"Sistema mais fácil que planilha. Menos de 5 min por ordem. Você será reconhecido."</td>
                                </tr>
                                <tr className="bg-gray-50">
                                  <td className="border border-gray-400 p-2 font-bold">TI/Técnico (Gatekeeper)</td>
                                  <td className="border border-gray-400 p-2">Valida segurança, integrações, suporte</td>
                                  <td className="border border-gray-400 p-2">LGPD compliance, APIs disponíveis, suporte técnico, escalabilidade</td>
                                  <td className="border border-gray-400 p-2">"100% conforme LGPD. APIs RESTful. Suporte 2h SLA. Hosted AWS."</td>
                                </tr>
                                <tr>
                                  <td className="border border-gray-400 p-2 font-bold">Financeiro (Blocker)</td>
                                  <td className="border border-gray-400 p-2">Pode bloquear por custo</td>
                                  <td className="border border-gray-400 p-2">Custo-benefício claro, payback rápido, contrato flexível</td>
                                  <td className="border border-gray-400 p-2">"R$ 199/mês. Sem lock-in. Cancela quando quiser. ROI documentado."</td>
                                </tr>
                              </tbody>
                            </table>
                            <p className="text-xs text-gray-600 italic mt-2">Fonte: Mapeamento de stakeholders elaborado pelo autor (2025)</p>
                          </div>

                          <h4 className="text-sm font-bold text-gray-900 mb-2 mt-3">4.4.3 Posicionamento e Proposta de Valor</h4>
                          <div className="bg-blue-50 p-4 rounded border border-blue-200 mb-3">
                            <p className="text-sm font-bold text-gray-900 mb-2">Positioning Statement:</p>
                            <p className="text-sm text-gray-800 leading-relaxed italic">
                              "Para <strong>transportadoras de médio porte</strong> que <strong>precisam de visibilidade operacional e métricas objetivas de SLA</strong>, 
                              [Nome do Produto] é um <strong>sistema de gestão logística integrada</strong> que <strong>combina workflow customizável, gamificação e WMS em plataforma única</strong>. 
                              Diferente de <strong>TMS tradicionais caros e rígidos</strong>, nossa solução oferece <strong>flexibilidade total com preço acessível (R$ 199/mês) e implementação em 2 semanas</strong>."
                            </p>
                          </div>

                          <div className="bg-green-50 p-4 rounded border border-green-200 mb-3">
                            <p className="text-sm font-bold text-gray-900 mb-2">Value Proposition Canvas:</p>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <p className="text-xs font-bold text-green-900 mb-1">GAIN CREATORS (Geradores de Ganho):</p>
                                <ul className="text-xs text-gray-800 space-y-1">
                                  <li>• Redução 77% tempo cadastro ordens (18→4 min)</li>
                                  <li>• SLA entrega +10 pontos percentuais (78%→88%)</li>
                                  <li>• Comunicações telefônicas -68%</li>
                                  <li>• Visibilidade 100% operações tempo real</li>
                                  <li>• Equipe motivada via gamificação</li>
                                </ul>
                              </div>
                              <div>
                                <p className="text-xs font-bold text-red-900 mb-1">PAIN RELIEVERS (Aliviadores de Dor):</p>
                                <ul className="text-xs text-gray-800 space-y-1">
                                  <li>• Elimina planilhas descentralizadas</li>
                                  <li>• Padroniza processos (workflow BPMN)</li>
                                  <li>• Rastreabilidade completa ações</li>
                                  <li>• Automatiza cálculos (diárias, SLA, prazos)</li>
                                  <li>• Centraliza comunicação (chat integrado)</li>
                                </ul>
                              </div>
                            </div>
                          </div>

                          <h4 className="text-sm font-bold text-gray-900 mb-2 mt-3">4.4.4 Nome do Produto e Identidade de Marca</h4>
                          <div className="ml-4 space-y-2 text-xs text-gray-800">
                            <p><strong>Nome Sugerido:</strong> <span className="font-bold text-blue-700">LogFlow Pro</span> - Combina "Log" (logística), "Flow" (workflow/fluidez) e "Pro" (profissional). Domínio disponível: logflowpro.com.br. Fácil pronúncia, memorável, transmite dinamismo;</p>
                            <p><strong>Tagline:</strong> "Gestão Logística Inteligente. Processos Visíveis. Equipe Motivada." - Comunica três pilares: tecnologia (inteligente), transparência (visíveis), pessoas (motivada);</p>
                            <p><strong>Tom de Voz:</strong> Profissional mas acessível. Direto ao ponto sem jargões desnecessários. Empático com dores do setor. Baseado em dados (numbers tell story). Exemplos: ❌ "Solução enterprise-grade disruptiva" ✅ "Sistema que economiza 12h/semana da sua equipe";</p>
                            <p><strong>Paleta de Cores:</strong> Azul primário #2563eb (confiança, tecnologia), Verde secundário #16a34a (crescimento, sucesso), Laranja accent #ea580c (energia, ação). Tons neutros cinza para backgrounds;</p>
                            <p><strong>Elementos Visuais:</strong> Ícones Lucide React consistentes, ilustrações flat design minimalistas, screenshots reais do produto (não mockups genéricos), vídeos demo curtos 60-90 segundos.</p>
                          </div>

                          <h4 className="text-sm font-bold text-gray-900 mb-2 mt-4">4.4.5 Estratégia de Precificação</h4>
                          <p className="text-sm text-gray-800 leading-relaxed text-justify mb-3">
                            Modelo de precificação baseado em valor percebido com ancoragem psicológica e incentivos à conversão, conforme Tabela 11.
                          </p>
                          <div className="overflow-x-auto">
                            <p className="text-xs text-center font-bold text-gray-900 mb-2">Tabela 11 - Estratégia de Precificação Value-Based</p>
                            <table className="w-full text-xs border-collapse border border-gray-400">
                              <thead className="bg-gray-200">
                                <tr>
                                  <th className="border border-gray-400 p-2 text-left">Plano</th>
                                  <th className="border border-gray-400 p-2 text-center">Preço</th>
                                  <th className="border border-gray-400 p-2 text-left">Âncora de Valor</th>
                                  <th className="border border-gray-400 p-2 text-left">Incentivo Conversão</th>
                                </tr>
                              </thead>
                              <tbody>
                                <tr>
                                  <td className="border border-gray-400 p-2 font-bold">Free</td>
                                  <td className="border border-gray-400 p-2 text-center">R$ 0</td>
                                  <td className="border border-gray-400 p-2">Economiza R$ 2.388/ano vs concorrente (R$ 199/mês). Permite validação sem risco. Limitado 50 ordens/mês.</td>
                                  <td className="border border-gray-400 p-2">Remoção fricção total. Conversão natural quando atinge limite.</td>
                                </tr>
                                <tr className="bg-gray-50">
                                  <td className="border border-gray-400 p-2 font-bold">Starter</td>
                                  <td className="border border-gray-400 p-2 text-center"><span className="line-through text-gray-500">R$ 299</span> <strong>R$ 199</strong></td>
                                  <td className="border border-gray-400 p-2">Preço ancoragem R$ 299 (riscado) cria percepção desconto 33%. Comparado a salário operador (R$ 3.500/mês), representa apenas 5,7% custo humano mensal.</td>
                                  <td className="border border-gray-400 p-2">Trial 7 dias sem cartão. Desconto 20% anual (R$ 159/mês se pagar 12 meses).</td>
                                </tr>
                                <tr>
                                  <td className="border border-gray-400 p-2 font-bold">Pro</td>
                                  <td className="border border-gray-400 p-2 text-center"><strong>R$ 399</strong></td>
                                  <td className="border border-gray-400 p-2">Usuários ilimitados + WMS completo. Economiza R$ 600-1.200/mês vs contratar sistema WMS separado. ROI break-even em 3 meses.</td>
                                  <td className="border border-gray-400 p-2">Upgrade de Starter mantém desconto anual proporcional. Onboarding premium incluso.</td>
                                </tr>
                                <tr className="bg-gray-50">
                                  <td className="border border-gray-400 p-2 font-bold">Enterprise</td>
                                  <td className="border border-gray-400 p-2 text-center"><strong>Custom</strong></td>
                                  <td className="border border-gray-400 p-2">White-label permite revenda. CSM dedicado reduz custo implantação em 70%. SLA 99,9% garante continuidade operações críticas 24/7.</td>
                                  <td className="border border-gray-400 p-2">Proposta sob medida baseada em volume transações. Contrato 12 meses com desconto 25%.</td>
                                </tr>
                              </tbody>
                            </table>
                            <p className="text-xs text-gray-600 italic mt-2">Fonte: Estratégia de pricing elaborada pelo autor (2025)</p>
                          </div>

                          <div className="ml-4 space-y-2 text-xs text-gray-800 mt-3">
                            <p><strong>Táticas de Pricing Psychology:</strong></p>
                            <p>• <strong>Charm Pricing:</strong> R$ 199 ao invés de R$ 200 (efeito psicológico "centenas vs duzentos");</p>
                            <p>• <strong>Decoy Effect:</strong> Plano Pro destacado visualmente como "Mais Popular" induzindo ancoragem mental;</p>
                            <p>• <strong>Freemium como Acquisition:</strong> Free plan não é "trial", é funcional permanentemente. Cria lock-in positivo (dados já no sistema, equipe treinada, processos configurados). Fricção sair aumenta com tempo uso;</p>
                            <p>• <strong>Desconto Anual:</strong> 20% off pagamento antecipado melhora cash flow e reduz churn (commitment de longo prazo);</p>
                            <p>• <strong>Transparência Total:</strong> Precificação pública em website (sem "entre em contato"). Calculadora ROI permite cliente estimar economia antes de comprar.</p>
                          </div>
                        </div>

                        {/* 4.5 Métricas e Indicadores de Crescimento */}
                        <div className="bg-white p-5 rounded border border-gray-400">
                          <h3 className="text-base font-bold text-gray-900 mb-3">4.5 Métricas de Crescimento e Metas Trimestrais</h3>
                          <div className="overflow-x-auto">
                            <p className="text-xs text-center font-bold text-gray-900 mb-2">Tabela 12 - OKRs de Crescimento por Trimestre</p>
                            <table className="w-full text-xs border-collapse border border-gray-400">
                              <thead className="bg-gray-200">
                                <tr>
                                  <th className="border border-gray-400 p-2 text-left">Métrica</th>
                                  <th className="border border-gray-400 p-2 text-center">Atual (Q1/25)</th>
                                  <th className="border border-gray-400 p-2 text-center">Meta Q2/25</th>
                                  <th className="border border-gray-400 p-2 text-center">Meta Q3/25</th>
                                  <th className="border border-gray-400 p-2 text-center">Meta Q4/25</th>
                                </tr>
                              </thead>
                              <tbody>
                                <tr>
                                  <td className="border border-gray-400 p-2">Empresas Ativas (Paying)</td>
                                  <td className="border border-gray-400 p-2 text-center">1</td>
                                  <td className="border border-gray-400 p-2 text-center">5</td>
                                  <td className="border border-gray-400 p-2 text-center">10</td>
                                  <td className="border border-gray-400 p-2 text-center">15</td>
                                </tr>
                                <tr className="bg-gray-50">
                                  <td className="border border-gray-400 p-2">MRR (Monthly Recurring Revenue)</td>
                                  <td className="border border-gray-400 p-2 text-center">R$ 199</td>
                                  <td className="border border-gray-400 p-2 text-center">R$ 5.000</td>
                                  <td className="border border-gray-400 p-2 text-center">R$ 15.000</td>
                                  <td className="border border-gray-400 p-2 text-center">R$ 30.000</td>
                                </tr>
                                <tr>
                                  <td className="border border-gray-400 p-2">ARR (Annual Recurring Revenue)</td>
                                  <td className="border border-gray-400 p-2 text-center">R$ 2.388</td>
                                  <td className="border border-gray-400 p-2 text-center">R$ 60.000</td>
                                  <td className="border border-gray-400 p-2 text-center">R$ 180.000</td>
                                  <td className="border border-gray-400 p-2 text-center">R$ 360.000</td>
                                </tr>
                                <tr className="bg-gray-50">
                                  <td className="border border-gray-400 p-2">Taxa Conversão Free→Paid</td>
                                  <td className="border border-gray-400 p-2 text-center">-</td>
                                  <td className="border border-gray-400 p-2 text-center">25%</td>
                                  <td className="border border-gray-400 p-2 text-center">30%</td>
                                  <td className="border border-gray-400 p-2 text-center">35%</td>
                                </tr>
                                <tr>
                                  <td className="border border-gray-400 p-2">Churn Mensal</td>
                                  <td className="border border-gray-400 p-2 text-center">0%</td>
                                  <td className="border border-gray-400 p-2 text-center">&lt; 5%</td>
                                  <td className="border border-gray-400 p-2 text-center">&lt; 4%</td>
                                  <td className="border border-gray-400 p-2 text-center">&lt; 3%</td>
                                </tr>
                                <tr className="bg-gray-50">
                                  <td className="border border-gray-400 p-2">NPS (Net Promoter Score)</td>
                                  <td className="border border-gray-400 p-2 text-center">8,3</td>
                                  <td className="border border-gray-400 p-2 text-center">≥ 8,0</td>
                                  <td className="border border-gray-400 p-2 text-center">≥ 8,5</td>
                                  <td className="border border-gray-400 p-2 text-center">≥ 9,0</td>
                                </tr>
                                <tr>
                                  <td className="border border-gray-400 p-2">CAC Payback Period</td>
                                  <td className="border border-gray-400 p-2 text-center">-</td>
                                  <td className="border border-gray-400 p-2 text-center">&lt; 6 meses</td>
                                  <td className="border border-gray-400 p-2 text-center">&lt; 5 meses</td>
                                  <td className="border border-gray-400 p-2 text-center">&lt; 4 meses</td>
                                </tr>
                                <tr className="bg-gray-50">
                                  <td className="border border-gray-400 p-2">LTV/CAC Ratio</td>
                                  <td className="border border-gray-400 p-2 text-center">-</td>
                                  <td className="border border-gray-400 p-2 text-center">≥ 3:1</td>
                                  <td className="border border-gray-400 p-2 text-center">≥ 4:1</td>
                                  <td className="border border-gray-400 p-2 text-center">≥ 5:1</td>
                                </tr>
                              </tbody>
                            </table>
                            <p className="text-xs text-gray-600 italic mt-2">Fonte: Metas de crescimento 2025 elaboradas pelo autor</p>
                          </div>
                        </div>

                        {/* 4.6 Funil AARRR */}
                        <div className="bg-white p-5 rounded border border-gray-400">
                          <h3 className="text-base font-bold text-gray-900 mb-3">4.6 Funil de Crescimento: Framework AARRR (Métricas Pirata)</h3>
                          <div className="overflow-x-auto">
                            <p className="text-xs text-center font-bold text-gray-900 mb-2">Tabela 13 - Métricas AARRR Detalhadas</p>
                            <table className="w-full text-xs border-collapse border border-gray-400">
                              <thead className="bg-gray-200">
                                <tr>
                                  <th className="border border-gray-400 p-2 text-left" style={{width: '15%'}}>Fase AARRR</th>
                                  <th className="border border-gray-400 p-2 text-left" style={{width: '35%'}}>Métricas Primárias</th>
                                  <th className="border border-gray-400 p-2 text-left" style={{width: '25%'}}>Meta Atual</th>
                                  <th className="border border-gray-400 p-2 text-left" style={{width: '25%'}}>Ações de Otimização</th>
                                </tr>
                              </thead>
                              <tbody>
                                <tr>
                                  <td className="border border-gray-400 p-2 font-bold">Acquisition</td>
                                  <td className="border border-gray-400 p-2">Visitantes website/mês, leads qualificados (MQL), CAC blended, fonte tráfego</td>
                                  <td className="border border-gray-400 p-2">5.000 visitantes/mês, 150 MQL, CAC R$ 280, 60% orgânico</td>
                                  <td className="border border-gray-400 p-2">SEO long-tail keywords, guest posts blogs setor, webinars parceiros</td>
                                </tr>
                                <tr className="bg-gray-50">
                                  <td className="border border-gray-400 p-2 font-bold">Activation</td>
                                  <td className="border border-gray-400 p-2">Sign-ups, setup completo, primeira ordem criada, time to value (TTV)</td>
                                  <td className="border border-gray-400 p-2">80 sign-ups/mês, 70% completam setup, 60% criam ordem dia 1, TTV médio 18h</td>
                                  <td className="border border-gray-400 p-2">Wizard interativo, templates pré-configurados, vídeo personalizado boas-vindas</td>
                                </tr>
                                <tr>
                                  <td className="border border-gray-400 p-2 font-bold">Retention</td>
                                  <td className="border border-gray-400 p-2">DAU/MAU ratio, churn rate mensal, cohort retention (dia 30, 60, 90), feature adoption</td>
                                  <td className="border border-gray-400 p-2">DAU/MAU 0,55, churn 5%/mês, 70% ativos dia 90, 80% usam ≥3 features</td>
                                  <td className="border border-gray-400 p-2">Gamificação streaks, email re-engagement, push notifications inteligentes</td>
                                </tr>
                                <tr className="bg-gray-50">
                                  <td className="border border-gray-400 p-2 font-bold">Revenue</td>
                                  <td className="border border-gray-400 p-2">MRR, ARPU (Average Revenue Per User), expansion revenue, downgrades</td>
                                  <td className="border border-gray-400 p-2">MRR R$ 5k, ARPU R$ 320, 15% expansion/mês, &lt;2% downgrades</td>
                                  <td className="border border-gray-400 p-2">Upsell triggers automáticos, feature gating estratégico, pricing experiments</td>
                                </tr>
                                <tr>
                                  <td className="border border-gray-400 p-2 font-bold">Referral</td>
                                  <td className="border border-gray-400 p-2">Viral coefficient (K-factor), referral rate, invite conversion, cycle time</td>
                                  <td className="border border-gray-400 p-2">K 0,93, 18% referem, 35% invites convertem, cycle 12 dias</td>
                                  <td className="border border-gray-400 p-2">Incentivos duplo-sided, onboarding referido otimizado, dashboards compartilháveis</td>
                                </tr>
                              </tbody>
                            </table>
                            <p className="text-xs text-gray-600 italic mt-2">Fonte: Framework AARRR adaptado para SaaS B2B (2025)</p>
                          </div>

                          <p className="text-sm text-gray-800 leading-relaxed text-justify mt-3">
                            <strong>North Star Metric:</strong> "Ordens Rastreadas com SLA ≥ 95%" foi definida como métrica estrela-norte por correlacionar diretamente valor entregue ao cliente (qualidade operacional) com crescimento sustentável (clientes satisfeitos retêm e referem).
                          </p>
                        </div>

                      </div>
                    </section>

                    <section className="mb-10">
                      <div className="bg-white p-5 rounded border border-gray-300">
                        <h3 className="text-base font-bold text-gray-900 mb-3 uppercase">Arquitetura Técnica Detalhada</h3>
                        <p className="text-sm text-gray-800 leading-relaxed text-justify mb-3">
                          A arquitetura do sistema segue padrão SPA (Single Page Application) para o frontend e arquitetura serverless para o backend, conforme especificado na Tabela 3.
                        </p>
                        <p className="text-xs text-center font-bold text-gray-900 mb-2">Tabela 3 - Especificação da Stack Tecnológica</p>
                        <table className="w-full text-xs border-collapse border border-gray-400 mb-3">
                          <thead className="bg-gray-200">
                            <tr>
                              <th className="border border-gray-400 p-2 text-left">Camada</th>
                              <th className="border border-gray-400 p-2 text-left">Tecnologia</th>
                              <th className="border border-gray-400 p-2 text-left">Justificativa</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr>
                              <td className="border border-gray-400 p-2 font-bold" rowSpan="5">Frontend</td>
                              <td className="border border-gray-400 p-2">React 18+</td>
                              <td className="border border-gray-400 p-2">Framework SPA com Virtual DOM para performance</td>
                            </tr>
                            <tr className="bg-gray-50">
                              <td className="border border-gray-400 p-2">Tailwind CSS + shadcn/ui</td>
                              <td className="border border-gray-400 p-2">Estilização utility-first com componentes acessíveis</td>
                            </tr>
                            <tr>
                              <td className="border border-gray-400 p-2">React Query</td>
                              <td className="border border-gray-400 p-2">Gerenciamento de cache e sincronização</td>
                            </tr>
                            <tr className="bg-gray-50">
                              <td className="border border-gray-400 p-2">React Router DOM</td>
                              <td className="border border-gray-400 p-2">Navegação client-side</td>
                            </tr>
                            <tr>
                              <td className="border border-gray-400 p-2">Recharts</td>
                              <td className="border border-gray-400 p-2">Visualização de dados responsiva</td>
                            </tr>
                            <tr className="bg-gray-50">
                              <td className="border border-gray-400 p-2 font-bold" rowSpan="5">Backend</td>
                              <td className="border border-gray-400 p-2">Base44 BaaS</td>
                              <td className="border border-gray-400 p-2">Backend-as-a-Service para agilidade</td>
                            </tr>
                            <tr>
                              <td className="border border-gray-400 p-2">PostgreSQL</td>
                              <td className="border border-gray-400 p-2">Banco relacional com garantias ACID</td>
                            </tr>
                            <tr className="bg-gray-50">
                              <td className="border border-gray-400 p-2">JWT Authentication</td>
                              <td className="border border-gray-400 p-2">Autenticação stateless</td>
                            </tr>
                            <tr>
                              <td className="border border-gray-400 p-2">Deno Deploy</td>
                              <td className="border border-gray-400 p-2">Funções serverless em edge runtime</td>
                            </tr>
                            <tr className="bg-gray-50">
                              <td className="border border-gray-400 p-2">WebSocket</td>
                              <td className="border border-gray-400 p-2">Comunicação bidirecional em tempo real</td>
                            </tr>
                          </tbody>
                        </table>
                        <p className="text-xs text-gray-600 italic">Fonte: Documentação técnica do projeto (2025)</p>
                      </div>
                    </section>

                    {/* FASE 5 - LEARN & ITERATE */}
                    <section className="mb-10">
                      <div className="bg-gray-800 text-white p-4 mb-4">
                        <h2 className="text-lg font-bold uppercase">
                          5. FASE LEARN & ITERATE - Análise de Dados e Melhoria Contínua
                        </h2>
                      </div>

                      <div className="space-y-6">
                        <div className="bg-white p-5 rounded border border-gray-300">
                          <h3 className="text-base font-bold text-gray-900 mb-3">5.1 Telemetria e Análise de Dados</h3>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="bg-white p-4 rounded-lg border-2 border-indigo-200">
                              <p className="font-bold text-indigo-900 mb-3">Eventos Rastreados:</p>
                              <ul className="text-sm text-gray-800 space-y-1">
                                <li>• <strong>user_login:</strong> Rastreamento de sessões</li>
                                <li>• <strong>ordem_criada:</strong> Tipo (oferta, completa, lote)</li>
                                <li>• <strong>tracking_atualizado:</strong> Status anterior → novo</li>
                                <li>• <strong>etapa_concluida:</strong> Tempo de conclusão</li>
                                <li>• <strong>ocorrencia_registrada:</strong> Categoria + gravidade</li>
                                <li>• <strong>feature_usage:</strong> Módulo mais usado</li>
                                <li>• <strong>export_pdf:</strong> Tipo de relatório</li>
                              </ul>
                            </div>
                            <div className="bg-white p-4 rounded-lg border-2 border-indigo-200">
                              <p className="font-bold text-indigo-900 mb-3">Ferramentas de Analytics:</p>
                              <ul className="text-sm text-gray-800 space-y-1">
                                <li>• <strong>Google Analytics 4:</strong> Comportamento de usuários</li>
                                <li>• <strong>Hotjar:</strong> Heatmaps e session recordings</li>
                                <li>• <strong>Mixpanel:</strong> Funnels e cohort analysis</li>
                                <li>• <strong>Sentry:</strong> Error tracking e performance</li>
                                <li>• <strong>Dashboards internos:</strong> Métricas de produto (Built-in)</li>
                              </ul>
                            </div>
                          </div>
                        </div>

                        <div className="bg-white p-5 rounded border border-gray-300">
                          <h3 className="text-base font-bold text-gray-900 mb-3">5.2 Ciclos de Retroalimentação (Feedback Loops)</h3>
                          <p className="text-sm text-gray-800 leading-relaxed text-justify mb-3">
                            Três mecanismos de feedback foram implementados: (a) In-App Feedback - sistema de chamados permitindo reporte direto de bugs e sugestões através de botão flutuante, modal NPS após resolução de chamados (escala 0-10) e funcionalidade de votação em features do roadmap (planejado Q2/2025); (b) Entrevistas Qualitativas - sessões mensais de 30 minutos com power users (top 10% de uso) para identificação de pain points não evidentes e validação de hipóteses; (c) Análise de Uso do Produto - monitoramento de taxa de adoção por feature, time to value (tempo até primeira ordem criada), stickiness (DAU/MAU com meta ≥ 0,5) e duração média de sessão como indicador de engajamento.
                          </p>
                        </div>

                        <div className="bg-white p-5 rounded border border-gray-300">
                          <h3 className="text-base font-bold text-gray-900 mb-3">5.3 Testes A/B e Experimentos</h3>
                          <p className="text-sm text-gray-800 leading-relaxed text-justify">
                            Dois experimentos principais foram delineados para otimização da experiência do usuário: Experimento 1 compara modal único com todos os campos (variante A - controle) versus wizard em três etapas (variante B - teste), hipótese de aumento de 25% na taxa de conclusão de cadastro. Experimento 2 compara layout de dashboard com gráficos no topo e tabela embaixo (variante A) versus cards de métricas com kanban inline (variante B), utilizando tempo até primeira ação como métrica de sucesso.
                          </p>
                        </div>



                        <div className="bg-white p-5 rounded border border-gray-300">
                          <h3 className="text-base font-bold text-gray-900 mb-3">5.6 Retrospectiva e Aprendizados</h3>
                          <p className="text-sm text-gray-800 leading-relaxed text-justify mb-2">
                            <strong>Aspectos positivos identificados:</strong> Abordagem modular permitiu entregas incrementais com redução de time-to-market; sistema de gamificação obteve aceitação imediata com aumento de 40% no engajamento; aplicativo do motorista resultou em redução de 70% nas comunicações telefônicas; workflow configurável proporciona flexibilidade para processos específicos; plataforma Base44 acelerou desenvolvimento em três vezes comparado a backend customizado.
                          </p>
                          <p className="text-sm text-gray-800 leading-relaxed text-justify mb-2">
                            <strong>Desafios e lições aprendidas:</strong> Complexidade do WMS exigiu curva de aprendizado superior ao estimado (solução: vídeos tutoriais específicos); degradação de performance em listas com mais de 500 registros (solução: virtualização com react-window); onboarding ainda requer suporte humano em 60% dos casos (solução: wizard aprimorado com tooltips contextuais); responsividade mobile insuficiente em algumas interfaces (solução: componentes mobile-first alternativos).
                          </p>
                          <p className="text-sm text-gray-800 leading-relaxed text-justify">
                            <strong>Ações planejadas:</strong> Curto prazo (1-2 meses) - resolução de bugs críticos, lançamento de landing page com demo interativo, implementação de Google Analytics 4; Médio prazo (3-6 meses) - integração com ERPs, aplicativo nativo React Native, rastreamento GPS real, módulo financeiro; Longo prazo (6-12 meses) - BI avançado, API pública com webhooks, roteirização com IA, expansão LATAM.
                          </p>
                        </div>

                        <div className="bg-white p-5 rounded border border-gray-300">
                          <h3 className="text-base font-bold text-gray-900 mb-3">5.4 Descobertas da Pesquisa de Usuários</h3>
                          <p className="text-sm text-gray-800 leading-relaxed text-justify">
                            Análise de uso revelou que o módulo de Tracking Logístico apresenta maior taxa de utilização (85% dos usuários ativos diariamente), justificando investimentos em melhorias como GPS em tempo real e alertas preditivos. O atalho de teclado "H" para preenchimento automático de data/hora atual foi identificado como quick win com alta aceitação, demonstrando que detalhes de UX geram valor percebido significativo. O módulo de Workflow apresentou utilização regular de apenas 30%, indicando necessidade de melhorias no onboarding e disponibilização de templates prontos de processos comuns.
                          </p>
                        </div>

                        <div className="bg-white p-5 rounded border border-gray-300">
                          <h3 className="text-base font-bold text-gray-900 mb-3">5.5 Framework de Melhoria Contínua</h3>
                          <p className="text-sm text-gray-800 leading-relaxed text-justify">
                            Ciclo de melhoria contínua estruturado em quatro fases: (1) Measure - coleta sistemática de dados de uso e performance; (2) Analyze - identificação de padrões e oportunidades de otimização; (3) Hypothesize - formulação de hipóteses de melhoria baseadas em dados; (4) Iterate - implementação, teste e validação das hipóteses formuladas.
                          </p>
                        </div>
                      </div>
                    </section>

                    {/* Arquitetura Técnica */}
                    <section>
                      <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3 border-b-2 border-indigo-600 pb-2">
                        <Settings className="w-7 h-7 text-indigo-600" />
                        Arquitetura Técnica Detalhada
                      </h2>
                      <div className="grid grid-cols-2 gap-6">
                        <div className="bg-indigo-50 p-6 rounded-xl border-2 border-indigo-200">
                          <h3 className="font-bold text-lg text-indigo-900 mb-3">Frontend Stack</h3>
                          <ul className="text-sm text-gray-800 space-y-2">
                            <li>• <strong>React 18+:</strong> SPA com Virtual DOM</li>
                            <li>• <strong>Tailwind CSS:</strong> Utility-first styling</li>
                            <li>• <strong>shadcn/ui:</strong> Component library (acessibilidade WCAG 2.1)</li>
                            <li>• <strong>React Query:</strong> Server state management + cache</li>
                            <li>• <strong>React Router DOM:</strong> SPA routing</li>
                            <li>• <strong>Recharts:</strong> Data visualization</li>
                            <li>• <strong>date-fns:</strong> Date manipulation (pt-BR)</li>
                            <li>• <strong>lucide-react:</strong> Icons library</li>
                          </ul>
                        </div>
                        <div className="bg-indigo-50 p-6 rounded-xl border-2 border-indigo-200">
                          <h3 className="font-bold text-lg text-indigo-900 mb-3">Backend Stack</h3>
                          <ul className="text-sm text-gray-800 space-y-2">
                            <li>• <strong>Base44 BaaS:</strong> Backend-as-a-Service</li>
                            <li>• <strong>PostgreSQL:</strong> Relational database (ACID compliant)</li>
                            <li>• <strong>JWT Auth:</strong> Autenticação stateless</li>
                            <li>• <strong>Deno Deploy:</strong> Serverless functions (Edge Runtime)</li>
                            <li>• <strong>WebSocket:</strong> Real-time updates (polling fallback)</li>
                            <li>• <strong>Supabase Storage:</strong> File uploads (public + private)</li>
                          </ul>
                        </div>
                      </div>
                    </section>

                    <section className="mb-10">
                      <div className="bg-white p-5 rounded border border-gray-300">
                        <h3 className="text-base font-bold text-gray-900 mb-3 uppercase">Roadmap de Evolução do Produto - 2025</h3>
                        <p className="text-sm text-gray-800 leading-relaxed text-justify mb-3">
                          O planejamento de evolução do produto foi estruturado em três trimestres subsequentes ao lançamento do MVP, conforme especificado no Quadro 2.
                        </p>
                        <p className="text-xs text-center font-bold text-gray-900 mb-2">Quadro 2 - Roadmap Trimestral de Desenvolvimento</p>
                        <div className="space-y-3">
                          <div className="border border-gray-400 p-3 rounded">
                            <p className="text-xs font-bold text-gray-900 mb-2">Primeiro Trimestre 2025 (Q1)</p>
                            <ul className="text-xs text-gray-800 space-y-1 ml-4">
                              <li>• MVP completo em produção contemplando doze módulos funcionais (Status: Concluído);</li>
                              <li>• Implementação de tracking com SLA de entrega configurável (Status: Concluído);</li>
                              <li>• Desenvolvimento de WMS com funcionalidades de etiquetas mãe e unitização (Status: Concluído);</li>
                              <li>• Landing Page institucional com otimização SEO (Status: Em desenvolvimento);</li>
                              <li>• Integração com Google Analytics 4 para telemetria (Status: Em desenvolvimento).</li>
                            </ul>
                          </div>
                          <div className="border border-gray-400 p-3 rounded bg-gray-50">
                            <p className="text-xs font-bold text-gray-900 mb-2">Segundo Trimestre 2025 (Q2)</p>
                            <ul className="text-xs text-gray-800 space-y-1 ml-4">
                              <li>• Rastreamento GPS em tempo real através de integração com Omnilink/Sascar;</li>
                              <li>• Integração bidirecional com sistemas ERP (SAP, TOTVS);</li>
                              <li>• Aplicativo mobile nativo desenvolvido em React Native;</li>
                              <li>• Módulo financeiro para gestão de contas a pagar e receber;</li>
                              <li>• Sistema de notificações via email e SMS.</li>
                            </ul>
                          </div>
                          <div className="border border-gray-400 p-3 rounded">
                            <p className="text-xs font-bold text-gray-900 mb-2">Terceiro e Quarto Trimestres 2025 (Q3-Q4)</p>
                            <ul className="text-xs text-gray-800 space-y-1 ml-4">
                              <li>• Business Intelligence avançado com Power BI embedded;</li>
                              <li>• API pública RESTful com sistema de webhooks;</li>
                              <li>• Roteirização inteligente utilizando algoritmos de otimização;</li>
                              <li>• Modelo preditivo de tempo de chegada através de Machine Learning;</li>
                              <li>• Assinatura digital integrada (e-CPF/ICP-Brasil);</li>
                              <li>• Expansão para mercado latino-americano.</li>
                            </ul>
                          </div>
                        </div>
                        <p className="text-xs text-gray-600 italic mt-2">Fonte: Planejamento estratégico do produto (2025)</p>
                      </div>
                    </section>



                    <section className="mb-10">
                      <div className="bg-white p-5 rounded border border-gray-300">
                        <h3 className="text-base font-bold text-gray-900 mb-3 uppercase">Limitações e Débito Técnico Identificado</h3>
                        <p className="text-sm text-gray-800 leading-relaxed text-justify mb-3">
                          Durante o processo de validação em ambiente de produção, foram identificadas limitações técnicas que requerem atenção no ciclo de melhoria contínua:
                        </p>
                        <div className="ml-4 space-y-2 text-xs text-gray-800">
                          <p><strong>Problema 1:</strong> Inconsistência no filtro por operação no módulo de Tracking (Status: Identificado, aguardando correção);</p>
                          <p><strong>Problema 2:</strong> Geração manual de sequência para numero_carga apresenta risco de colisão em ambiente multi-usuário (Recomendação: migração para sequência nativa de banco de dados);</p>
                          <p><strong>Problema 3:</strong> Componente TrackingTable excede 800 linhas de código, comprometendo manutenibilidade (Recomendação: refatoração em componentes modulares);</p>
                          <p><strong>Problema 4:</strong> Performance degradada em listas com mais de 500 registros (Recomendação: implementação de virtualização com react-window).</p>
                        </div>
                      </div>
                    </section>

                    {/* Considerações Finais */}
                    <section className="bg-white p-6 rounded border border-gray-400 mt-8">
                      <h3 className="text-base font-bold text-gray-900 mb-3 text-center uppercase">Considerações Finais</h3>
                      <p className="text-sm text-gray-800 leading-relaxed text-justify mb-3">
                        O presente trabalho apresentou a documentação técnica de um sistema de gestão logística integrada, desenvolvido segundo o framework de Product Management da FIAP. O sistema encontra-se em ambiente de produção desde janeiro de 2025, contemplando doze módulos funcionais integrados, vinte e cinco entidades de banco de dados, quarenta componentes de interface reutilizáveis e quinze funções backend serverless.
                      </p>
                      <p className="text-sm text-gray-800 leading-relaxed text-justify mb-3">
                        A solução implementa práticas consolidadas de gestão de processos (BPMN), ciclo PDCA e metodologia 5S, visando alcançar meta de 95% de SLA nas operações logísticas. O sistema diferencia-se no mercado através da integração de gamificação com métricas objetivas de performance, workflow totalmente customizável e módulo WMS simplificado.
                      </p>
                      <div className="border-t border-gray-300 pt-4 mt-4">
                        <p className="text-xs text-gray-700 mb-1"><strong>Organização:</strong> LAF LOGÍSTICA - CNPJ 34.579.341/0001-85</p>
                        <p className="text-xs text-gray-700 mb-1"><strong>Product Owner:</strong> Leonardo Bandeira</p>
                        <p className="text-xs text-gray-700 mb-1"><strong>Framework Metodológico:</strong> FIAP Product Management (5 Fases)</p>
                        <p className="text-xs text-gray-700 mb-1"><strong>Plataforma de Desenvolvimento:</strong> Base44 Platform v2.5.0</p>
                        <p className="text-xs text-gray-700"><strong>Data de Referência:</strong> Dezembro de 2025</p>
                      </div>
                    </section>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
}