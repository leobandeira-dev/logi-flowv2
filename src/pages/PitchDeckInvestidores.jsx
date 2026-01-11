import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { createPageUrl } from "@/utils";
import { useNavigate } from "react-router-dom";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import {
  ChevronLeft,
  ChevronRight,
  X,
  Download,
  TrendingUp,
  Users,
  Target,
  Rocket,
  DollarSign,
  BarChart3,
  Zap,
  Award,
  MapPin,
  Shield,
  Briefcase,
  Lightbulb,
  Activity
} from "lucide-react";

export default function PitchDeckInvestidores() {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    // Slide 0 - Capa
    {
      title: "Capa",
      content: (
        <div className="slide-content flex flex-col items-center justify-center h-full bg-gradient-to-br from-blue-900 via-blue-800 to-cyan-900">
          <div className="text-center max-w-5xl mx-auto px-8">
            <div className="mb-8">
              <h1 className="text-8xl font-bold mb-6 text-white leading-tight">
                LogiFlow
              </h1>
              <div className="w-48 h-1.5 bg-gradient-to-r from-cyan-400 via-blue-400 to-cyan-500 mx-auto mb-8" />
            </div>

            <h2 className="text-5xl font-bold text-white mb-6">
              Revolucionando a Gestão Logística
            </h2>
            <p className="text-3xl text-cyan-300 font-light mb-12">
              Workflow Gamificado • SLA Automatizado • WMS Integrado
            </p>

            <div className="grid grid-cols-3 gap-8 mb-12">
              <div className="bg-white/10 backdrop-blur-sm p-8 rounded-2xl border-2 border-white/20">
                <p className="font-bold text-6xl text-cyan-300 mb-2">R$ 15B</p>
                <p className="text-xl text-white/90">Mercado Endereçável</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm p-8 rounded-2xl border-2 border-white/20">
                <p className="font-bold text-6xl text-cyan-300 mb-2">25K</p>
                <p className="text-xl text-white/90">Empresas Target</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm p-8 rounded-2xl border-2 border-white/20">
                <p className="font-bold text-6xl text-cyan-300 mb-2">15%</p>
                <p className="text-xl text-white/90">Penetração Atual</p>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/20">
              <p className="text-xl text-white/90 mb-2">Buscando Investimento</p>
              <p className="text-5xl font-bold text-cyan-300">R$ 500K</p>
            </div>
          </div>
        </div>
      )
    },

    // Slide 1 - Problema
    {
      title: "Problema",
      content: (
        <div className="slide-content p-12 bg-gradient-to-br from-gray-50 to-gray-100">
          <div className="text-center mb-12">
            <h2 className="text-5xl font-bold mb-4 bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
              O Problema
            </h2>
            <p className="text-2xl text-gray-600">Caos Operacional na Logística Brasileira</p>
          </div>

          <div className="grid grid-cols-2 gap-8 mb-10">
            <div className="bg-white p-8 rounded-2xl shadow-2xl border-l-8 border-red-500">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-3xl">📊</span>
                </div>
                <div>
                  <h3 className="font-bold text-2xl text-gray-900 mb-2">Processos Manuais</h3>
                  <p className="text-lg text-gray-700">Planilhas Excel descentralizadas, WhatsApp pessoal, zero rastreabilidade</p>
                </div>
              </div>
              <div className="bg-red-50 p-4 rounded-lg">
                <p className="text-xl font-bold text-red-700">18 minutos/ordem</p>
                <p className="text-sm text-gray-600">Tempo médio de cadastro manual</p>
              </div>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-2xl border-l-8 border-orange-500">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-3xl">🔍</span>
                </div>
                <div>
                  <h3 className="font-bold text-2xl text-gray-900 mb-2">Sem Visibilidade</h3>
                  <p className="text-lg text-gray-700">Clientes ligam 8x/dia perguntando "onde está minha carga?"</p>
                </div>
              </div>
              <div className="bg-orange-50 p-4 rounded-lg">
                <p className="text-xl font-bold text-orange-700">70% das ligações</p>
                <p className="text-sm text-gray-600">Apenas para consultar status</p>
              </div>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-2xl border-l-8 border-red-600">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-3xl">📉</span>
                </div>
                <div>
                  <h3 className="font-bold text-2xl text-gray-900 mb-2">SLA Baixo</h3>
                  <p className="text-lg text-gray-700">Impossível medir performance objetivamente, equipe desmotivada</p>
                </div>
              </div>
              <div className="bg-red-50 p-4 rounded-lg">
                <p className="text-xl font-bold text-red-700">78% SLA médio</p>
                <p className="text-sm text-gray-600">Antes da solução</p>
              </div>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-2xl border-l-8 border-orange-600">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-3xl">💸</span>
                </div>
                <div>
                  <h3 className="font-bold text-2xl text-gray-900 mb-2">Custo Elevado</h3>
                  <p className="text-lg text-gray-700">TMS tradicionais custam R$ 299-450/mês e são complexos demais</p>
                </div>
              </div>
              <div className="bg-orange-50 p-4 rounded-lg">
                <p className="text-xl font-bold text-orange-700">85% não usa TMS</p>
                <p className="text-sm text-gray-600">Mercado sub-penetrado</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-red-600 to-orange-600 text-white p-10 rounded-2xl shadow-2xl text-center">
            <p className="text-4xl font-bold mb-3">R$ 25 bilhões/ano desperdiçados</p>
            <p className="text-2xl opacity-90">em ineficiências operacionais evitáveis</p>
          </div>
        </div>
      )
    },

    // Slide 2 - Solução
    {
      title: "Solução",
      content: (
        <div className="slide-content p-12 bg-gradient-to-br from-cyan-50 to-blue-50">
          <div className="text-center mb-12">
            <h2 className="text-5xl font-bold mb-4 bg-gradient-to-r from-cyan-600 to-blue-700 bg-clip-text text-transparent">
              Nossa Solução
            </h2>
            <p className="text-2xl text-gray-600">TMS Gamificado com WMS Integrado</p>
          </div>

          <div className="grid grid-cols-3 gap-8 mb-12">
            <div className="bg-white p-8 rounded-2xl shadow-2xl border-t-8 border-cyan-500 hover:scale-105 transition-transform">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center mx-auto mb-6">
                <Zap className="w-12 h-12 text-white" />
              </div>
              <h3 className="font-bold text-2xl text-gray-900 mb-4 text-center">Automação Radical</h3>
              <ul className="space-y-3 text-base text-gray-700">
                <li>• Import PDF via OCR/IA</li>
                <li>• Import Excel em lote</li>
                <li>• Autocomplete CNPJ</li>
                <li>• Cálculo SLA automático</li>
              </ul>
              <div className="mt-6 bg-cyan-50 p-4 rounded-lg">
                <p className="text-3xl font-bold text-cyan-700 text-center">75%</p>
                <p className="text-sm text-gray-600 text-center">Redução tempo</p>
              </div>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-2xl border-t-8 border-blue-600 hover:scale-105 transition-transform">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center mx-auto mb-6">
                <Award className="w-12 h-12 text-white" />
              </div>
              <h3 className="font-bold text-2xl text-gray-900 mb-4 text-center">Gamificação Única</h3>
              <ul className="space-y-3 text-base text-gray-700">
                <li>• Rankings em tempo real</li>
                <li>• Sistema de pontos e níveis</li>
                <li>• Conquistas e badges</li>
                <li>• Cultura de excelência</li>
              </ul>
              <div className="mt-6 bg-blue-50 p-4 rounded-lg">
                <p className="text-3xl font-bold text-blue-700 text-center">+40%</p>
                <p className="text-sm text-gray-600 text-center">Engajamento</p>
              </div>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-2xl border-t-8 border-blue-700 hover:scale-105 transition-transform">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center mx-auto mb-6">
                <Target className="w-12 h-12 text-white" />
              </div>
              <h3 className="font-bold text-2xl text-gray-900 mb-4 text-center">Workflow Custom</h3>
              <ul className="space-y-3 text-base text-gray-700">
                <li>• BPMN configurável</li>
                <li>• SLA granular (dias/h/min)</li>
                <li>• Campos personalizados</li>
                <li>• Adapta-se ao cliente</li>
              </ul>
              <div className="mt-6 bg-blue-50 p-4 rounded-lg">
                <p className="text-3xl font-bold text-blue-700 text-center">100%</p>
                <p className="text-sm text-gray-600 text-center">Customizável</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-cyan-600 via-blue-600 to-blue-800 text-white p-10 rounded-2xl shadow-2xl">
            <div className="text-center">
              <p className="text-5xl font-bold mb-4">3 em 1: TMS + WMS + Gamificação</p>
              <p className="text-2xl opacity-90">Único no mercado com essa combinação</p>
            </div>
          </div>
        </div>
      )
    },

    // Slide 3 - Tamanho do Mercado
    {
      title: "Mercado",
      content: (
        <div className="slide-content p-12 bg-gradient-to-br from-gray-50 to-blue-50">
          <div className="text-center mb-12">
            <h2 className="text-5xl font-bold mb-4 bg-gradient-to-r from-cyan-600 to-blue-700 bg-clip-text text-transparent">
              Tamanho do Mercado
            </h2>
            <p className="text-2xl text-gray-600">Oportunidade Massiva no Transporte Rodoviário</p>
          </div>

          <div className="grid grid-cols-3 gap-8 mb-12">
            <div className="bg-white p-10 rounded-2xl shadow-2xl border-t-8 border-cyan-400">
              <div className="text-center">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center mx-auto mb-6">
                  <MapPin className="w-14 h-14 text-white" />
                </div>
                <p className="text-sm text-gray-500 uppercase tracking-wider mb-2">TAM</p>
                <p className="font-bold text-5xl text-cyan-700 mb-3">R$ 15B</p>
                <p className="text-lg text-gray-700 mb-4">Total Addressable Market</p>
                <p className="text-base text-gray-600">150.000 empresas de transporte no Brasil</p>
              </div>
            </div>

            <div className="bg-white p-10 rounded-2xl shadow-2xl border-t-8 border-blue-500">
              <div className="text-center">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center mx-auto mb-6">
                  <Target className="w-14 h-14 text-white" />
                </div>
                <p className="text-sm text-gray-500 uppercase tracking-wider mb-2">SAM</p>
                <p className="font-bold text-5xl text-blue-700 mb-3">R$ 2.5B</p>
                <p className="text-lg text-gray-700 mb-4">Serviceable Available</p>
                <p className="text-base text-gray-600">25.000 empresas médio/grande porte</p>
              </div>
            </div>

            <div className="bg-white p-10 rounded-2xl shadow-2xl border-t-8 border-blue-700">
              <div className="text-center">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-600 to-blue-900 flex items-center justify-center mx-auto mb-6">
                  <Rocket className="w-14 h-14 text-white" />
                </div>
                <p className="text-sm text-gray-500 uppercase tracking-wider mb-2">SOM</p>
                <p className="font-bold text-5xl text-blue-900 mb-3">R$ 50M</p>
                <p className="text-lg text-gray-700 mb-4">Serviceable Obtainable</p>
                <p className="text-base text-gray-600">500 empresas Sul/Sudeste (12 meses)</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8">
            <div className="bg-gradient-to-br from-cyan-500 to-blue-600 text-white p-8 rounded-2xl shadow-xl">
              <h3 className="font-bold text-2xl mb-6">Tendências de Mercado</h3>
              <ul className="space-y-3 text-lg">
                <li>• Setor cresce <strong>8% ao ano</strong></li>
                <li>• E-commerce impulsiona rastreabilidade</li>
                <li>• PMEs migrando para SaaS (+32% a.a.)</li>
                <li>• Regulação ANTT cada vez mais rigorosa</li>
              </ul>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-xl border-4 border-blue-600">
              <h3 className="font-bold text-2xl mb-6 text-gray-900">Penetração de TMS</h3>
              <div className="mb-6">
                <div className="flex justify-between mb-2">
                  <span className="text-lg text-gray-700">Mercado atual</span>
                  <span className="text-2xl font-bold text-blue-700">15%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-6">
                  <div className="bg-gradient-to-r from-cyan-500 to-blue-600 h-6 rounded-full" style={{ width: '15%' }} />
                </div>
              </div>
              <p className="text-xl text-center font-bold text-gray-900 mt-8">85% ainda usa planilhas</p>
              <p className="text-lg text-center text-gray-600">Enorme oportunidade inexplorada</p>
            </div>
          </div>
        </div>
      )
    },

    // Slide 4 - Modelo de Negócio
    {
      title: "Modelo de Negócio",
      content: (
        <div className="slide-content p-12 bg-gradient-to-br from-white to-gray-50">
          <div className="text-center mb-12">
            <h2 className="text-5xl font-bold mb-4 bg-gradient-to-r from-green-600 to-emerald-700 bg-clip-text text-transparent">
              Modelo de Negócio
            </h2>
            <p className="text-2xl text-gray-600">SaaS B2B com Receita Recorrente</p>
          </div>

          <div className="grid grid-cols-4 gap-6 mb-10">
            <div className="bg-white p-6 rounded-xl shadow-lg border-t-4 border-gray-400">
              <h3 className="font-bold text-lg text-gray-900 mb-3 text-center">Free</h3>
              <p className="text-4xl font-bold text-center text-gray-700 mb-4">R$ 0</p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Até 50 ordens/mês</li>
                <li>• Tracking básico</li>
                <li>• 1 usuário</li>
              </ul>
              <div className="mt-4 pt-4 border-t">
                <p className="text-xs text-gray-500 text-center">Aquisição</p>
              </div>
            </div>

            <div className="bg-gradient-to-br from-cyan-50 to-cyan-100 p-6 rounded-xl shadow-xl border-t-4 border-cyan-500 relative">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-cyan-600 text-white px-4 py-1 rounded-full text-xs font-bold">
                POPULAR
              </div>
              <h3 className="font-bold text-lg text-gray-900 mb-3 text-center">Starter</h3>
              <p className="text-4xl font-bold text-center text-cyan-700 mb-4">R$ 199</p>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>• 200 ordens/mês</li>
                <li>• Workflow + Gamificação</li>
                <li>• 3 usuários</li>
              </ul>
              <div className="mt-4 pt-4 border-t border-cyan-200">
                <p className="text-xs text-cyan-700 text-center font-semibold">Foco atual</p>
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl shadow-xl border-t-4 border-blue-600">
              <h3 className="font-bold text-lg text-gray-900 mb-3 text-center">Pro</h3>
              <p className="text-4xl font-bold text-center text-blue-700 mb-4">R$ 399</p>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>• Ordens ilimitadas</li>
                <li>• WMS completo</li>
                <li>• Usuários ilimitados</li>
              </ul>
              <div className="mt-4 pt-4 border-t border-blue-200">
                <p className="text-xs text-blue-700 text-center font-semibold">Expansão</p>
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-100 to-blue-200 p-6 rounded-xl shadow-xl border-t-4 border-blue-800">
              <h3 className="font-bold text-lg text-gray-900 mb-3 text-center">Enterprise</h3>
              <p className="text-4xl font-bold text-center text-blue-900 mb-4">Custom</p>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>• White-label</li>
                <li>• CSM dedicado</li>
                <li>• SLA 99.9%</li>
              </ul>
              <div className="mt-4 pt-4 border-t border-blue-300">
                <p className="text-xs text-blue-900 text-center font-semibold">2026+</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-xl shadow-xl">
              <h3 className="font-bold text-2xl mb-6 text-gray-900">Unit Economics</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg">
                  <span className="text-lg font-semibold text-gray-900">ARPU</span>
                  <span className="text-2xl font-bold text-green-700">R$ 320/mês</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-blue-50 rounded-lg">
                  <span className="text-lg font-semibold text-gray-900">CAC</span>
                  <span className="text-2xl font-bold text-blue-700">R$ 850</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-cyan-50 rounded-lg">
                  <span className="text-lg font-semibold text-gray-900">LTV (36 meses)</span>
                  <span className="text-2xl font-bold text-cyan-700">R$ 8.500</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-gradient-to-r from-cyan-600 to-blue-700 text-white rounded-lg">
                  <span className="text-lg font-semibold">LTV/CAC Ratio</span>
                  <span className="text-3xl font-bold">10:1</span>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-500 to-emerald-600 text-white p-8 rounded-xl shadow-xl">
              <h3 className="font-bold text-2xl mb-6">Streams de Receita</h3>
              <div className="space-y-4">
                <div className="bg-white/20 p-4 rounded-lg backdrop-blur-sm">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-lg font-semibold">Assinaturas SaaS</span>
                    <span className="text-xl font-bold">80%</span>
                  </div>
                  <p className="text-sm opacity-90">Receita recorrente previsível</p>
                </div>
                <div className="bg-white/20 p-4 rounded-lg backdrop-blur-sm">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-lg font-semibold">Add-ons (GPS, BI)</span>
                    <span className="text-xl font-bold">12%</span>
                  </div>
                  <p className="text-sm opacity-90">Expansão de receita</p>
                </div>
                <div className="bg-white/20 p-4 rounded-lg backdrop-blur-sm">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-lg font-semibold">Consultoria</span>
                    <span className="text-xl font-bold">8%</span>
                  </div>
                  <p className="text-sm opacity-90">Setup e customização</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    },

    // Slide 5 - Tração
    {
      title: "Tração",
      content: (
        <div className="slide-content p-12 bg-gradient-to-br from-white to-cyan-50">
          <div className="text-center mb-12">
            <h2 className="text-5xl font-bold mb-4 bg-gradient-to-r from-green-600 to-cyan-700 bg-clip-text text-transparent">
              Tração e Métricas
            </h2>
            <p className="text-2xl text-gray-600">Validação em 30 Dias de Operação Real</p>
          </div>

          <div className="grid grid-cols-3 gap-8 mb-10">
            <div className="bg-gradient-to-br from-green-400 to-green-600 text-white p-10 rounded-2xl shadow-2xl text-center">
              <div className="mb-4">
                <TrendingUp className="w-16 h-16 mx-auto mb-4" />
                <p className="text-7xl font-bold mb-3">+10pp</p>
              </div>
              <p className="text-2xl font-bold mb-2">SLA Entregas</p>
              <p className="text-xl opacity-90">78% → 88%</p>
            </div>

            <div className="bg-gradient-to-br from-cyan-500 to-blue-500 text-white p-10 rounded-2xl shadow-2xl text-center">
              <div className="mb-4">
                <Zap className="w-16 h-16 mx-auto mb-4" />
                <p className="text-7xl font-bold mb-3">-75%</p>
              </div>
              <p className="text-2xl font-bold mb-2">Tempo Cadastro</p>
              <p className="text-xl opacity-90">18min → 4min</p>
            </div>

            <div className="bg-gradient-to-br from-blue-600 to-blue-800 text-white p-10 rounded-2xl shadow-2xl text-center">
              <div className="mb-4">
                <Users className="w-16 h-16 mx-auto mb-4" />
                <p className="text-7xl font-bold mb-3">90%</p>
              </div>
              <p className="text-2xl font-bold mb-2">Taxa Adoção</p>
              <p className="text-xl opacity-90">Time ativo diariamente</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-xl shadow-xl">
              <h3 className="font-bold text-2xl mb-6 text-gray-900">Métricas de Produto</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                  <span className="text-lg text-gray-900">DAU/MAU</span>
                  <span className="text-2xl font-bold text-cyan-700">0.6</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                  <span className="text-lg text-gray-900">NPS</span>
                  <span className="text-2xl font-bold text-cyan-700">8.3/10</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                  <span className="text-lg text-gray-900">Time to Value</span>
                  <span className="text-2xl font-bold text-cyan-700">&lt; 24h</span>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-cyan-600 to-blue-700 text-white p-8 rounded-xl shadow-xl">
              <h3 className="font-bold text-2xl mb-6">Early Wins</h3>
              <ul className="space-y-4 text-lg">
                <li className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-xl">✓</span>
                  </div>
                  <span><strong>1 cliente</strong> piloto pagante</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-xl">✓</span>
                  </div>
                  <span><strong>250+ ordens</strong> processadas</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-xl">✓</span>
                  </div>
                  <span><strong>Pipeline R$ 15K MRR</strong> validado</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )
    },

    // Slide 6 - Concorrência
    {
      title: "Concorrência",
      content: (
        <div className="slide-content p-12 bg-gradient-to-br from-gray-50 to-white">
          <div className="text-center mb-12">
            <h2 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-700 bg-clip-text text-transparent">
              Análise Competitiva
            </h2>
            <p className="text-2xl text-gray-600">Diferenciação Clara no Mercado</p>
          </div>

          <div className="overflow-x-auto mb-10">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gradient-to-r from-cyan-600 to-blue-700 text-white">
                  <th className="p-4 text-lg font-bold border border-gray-300">Feature</th>
                  <th className="p-4 text-lg font-bold border border-gray-300 text-center bg-cyan-700">LogiFlow</th>
                  <th className="p-4 text-lg font-bold border border-gray-300 text-center">OneDok</th>
                  <th className="p-4 text-lg font-bold border border-gray-300 text-center">Fretebras</th>
                  <th className="p-4 text-lg font-bold border border-gray-300 text-center">TEL</th>
                </tr>
              </thead>
              <tbody className="bg-white">
                <tr>
                  <td className="p-4 font-semibold border border-gray-300">Preço/mês</td>
                  <td className="p-4 border border-gray-300 text-center bg-green-50"><strong className="text-green-700 text-xl">R$ 199</strong></td>
                  <td className="p-4 border border-gray-300 text-center">R$ 299</td>
                  <td className="p-4 border border-gray-300 text-center">R$ 350</td>
                  <td className="p-4 border border-gray-300 text-center">R$ 450</td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="p-4 font-semibold border border-gray-300">Gamificação</td>
                  <td className="p-4 border border-gray-300 text-center bg-green-50"><span className="text-2xl text-green-600">✓</span></td>
                  <td className="p-4 border border-gray-300 text-center"><span className="text-2xl text-red-500">✗</span></td>
                  <td className="p-4 border border-gray-300 text-center"><span className="text-2xl text-red-500">✗</span></td>
                  <td className="p-4 border border-gray-300 text-center"><span className="text-2xl text-red-500">✗</span></td>
                </tr>
                <tr>
                  <td className="p-4 font-semibold border border-gray-300">Workflow Custom</td>
                  <td className="p-4 border border-gray-300 text-center bg-green-50"><span className="text-2xl text-green-600">✓</span></td>
                  <td className="p-4 border border-gray-300 text-center"><span className="text-xl text-orange-500">~</span></td>
                  <td className="p-4 border border-gray-300 text-center"><span className="text-2xl text-red-500">✗</span></td>
                  <td className="p-4 border border-gray-300 text-center"><span className="text-xl text-orange-500">~</span></td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="p-4 font-semibold border border-gray-300">WMS Integrado</td>
                  <td className="p-4 border border-gray-300 text-center bg-green-50"><span className="text-2xl text-green-600">✓</span></td>
                  <td className="p-4 border border-gray-300 text-center"><span className="text-2xl text-red-500">✗</span></td>
                  <td className="p-4 border border-gray-300 text-center"><span className="text-xl text-orange-500">~</span></td>
                  <td className="p-4 border border-gray-300 text-center"><span className="text-2xl text-red-500">✗</span></td>
                </tr>
                <tr>
                  <td className="p-4 font-semibold border border-gray-300">Portal B2B</td>
                  <td className="p-4 border border-gray-300 text-center bg-green-50"><span className="text-2xl text-green-600">✓</span></td>
                  <td className="p-4 border border-gray-300 text-center"><span className="text-2xl text-red-500">✗</span></td>
                  <td className="p-4 border border-gray-300 text-center"><span className="text-xl text-orange-500">~</span></td>
                  <td className="p-4 border border-gray-300 text-center"><span className="text-2xl text-red-500">✗</span></td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="bg-gradient-to-r from-cyan-600 to-blue-700 text-white p-10 rounded-2xl shadow-2xl text-center">
            <p className="text-4xl font-bold mb-3">Único TMS com Gamificação Nativa</p>
            <p className="text-2xl opacity-90">Diferencial impossível de copiar rapidamente</p>
          </div>
        </div>
      )
    },

    // Slide 7 - Roadmap
    {
      title: "Roadmap",
      content: (
        <div className="slide-content p-12 bg-gradient-to-br from-white to-blue-50">
          <div className="text-center mb-12">
            <h2 className="text-5xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-blue-700 bg-clip-text text-transparent">
              Roadmap de Produto
            </h2>
            <p className="text-2xl text-gray-600">Evolução Estratégica 2025-2026</p>
          </div>

          <div className="space-y-6">
            <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-2xl shadow-xl">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl font-bold">Q1</span>
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-2xl mb-2">2025 - MVP Completo ✓</h3>
                  <p className="text-lg opacity-90">20 módulos • Gamificação • Portal B2B • WMS básico</p>
                </div>
                <div className="text-right">
                  <p className="text-sm opacity-75">CONCLUÍDO</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white p-6 rounded-2xl shadow-xl">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl font-bold">Q2</span>
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-2xl mb-2">2025 - Expansão de Features</h3>
                  <p className="text-lg opacity-90">GPS Tempo Real • App Nativo • Integrações ERP • Módulo Financeiro</p>
                </div>
                <div className="text-right">
                  <p className="text-sm opacity-75">EM DESENVOLVIMENTO</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 rounded-2xl shadow-xl">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl font-bold">Q3</span>
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-2xl mb-2">2025 - Inteligência Artificial</h3>
                  <p className="text-lg opacity-90">Roteirização IA • Predição Chegada ML • BI Avançado • API Pública</p>
                </div>
                <div className="text-right">
                  <p className="text-sm opacity-75">PLANEJADO</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-blue-700 to-purple-700 text-white p-6 rounded-2xl shadow-xl">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl font-bold">Q4</span>
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-2xl mb-2">2025-2026 - Escala Internacional</h3>
                  <p className="text-lg opacity-90">Expansão LATAM • White-Label • Marketplace Fretes</p>
                </div>
                <div className="text-right">
                  <p className="text-sm opacity-75">VISÃO</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    },

    // Slide 8 - Projeções Financeiras
    {
      title: "Financeiro",
      content: (
        <div className="slide-content p-12 bg-gradient-to-br from-gray-50 to-green-50">
          <div className="text-center mb-12">
            <h2 className="text-5xl font-bold mb-4 bg-gradient-to-r from-green-600 to-emerald-700 bg-clip-text text-transparent">
              Projeções Financeiras
            </h2>
            <p className="text-2xl text-gray-600">Crescimento Sustentável 24-36 Meses</p>
          </div>

          <div className="grid grid-cols-4 gap-6 mb-10">
            <div className="bg-white p-6 rounded-xl shadow-xl text-center">
              <p className="text-sm text-gray-500 uppercase mb-2">Atual (Q1/25)</p>
              <p className="text-5xl font-bold text-gray-900 mb-2">R$ 2K</p>
              <p className="text-lg text-gray-600">MRR</p>
              <div className="mt-4 pt-4 border-t">
                <p className="text-sm text-gray-500">1 cliente</p>
              </div>
            </div>

            <div className="bg-gradient-to-br from-cyan-50 to-cyan-100 p-6 rounded-xl shadow-xl text-center border-2 border-cyan-400">
              <p className="text-sm text-cyan-700 uppercase mb-2 font-semibold">Meta Q2/25</p>
              <p className="text-5xl font-bold text-cyan-700 mb-2">R$ 5K</p>
              <p className="text-lg text-gray-700">MRR</p>
              <div className="mt-4 pt-4 border-t border-cyan-200">
                <p className="text-sm text-gray-700">5 clientes</p>
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl shadow-xl text-center border-2 border-blue-500">
              <p className="text-sm text-blue-700 uppercase mb-2 font-semibold">Meta Q3/25</p>
              <p className="text-5xl font-bold text-blue-700 mb-2">R$ 15K</p>
              <p className="text-lg text-gray-700">MRR</p>
              <div className="mt-4 pt-4 border-t border-blue-200">
                <p className="text-sm text-gray-700">10 clientes</p>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-100 to-emerald-200 p-6 rounded-xl shadow-xl text-center border-2 border-green-600">
              <p className="text-sm text-green-700 uppercase mb-2 font-semibold">Meta Q4/25</p>
              <p className="text-5xl font-bold text-green-700 mb-2">R$ 30K</p>
              <p className="text-lg text-gray-700">MRR</p>
              <div className="mt-4 pt-4 border-t border-green-300">
                <p className="text-sm text-gray-700">15 clientes</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-xl shadow-xl">
              <h3 className="font-bold text-2xl mb-6 text-gray-900">Uso do Investimento</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-full bg-gray-200 rounded-full h-8">
                    <div className="bg-gradient-to-r from-blue-500 to-blue-600 h-8 rounded-full flex items-center justify-center text-white font-bold" style={{ width: '40%' }}>
                      40%
                    </div>
                  </div>
                  <span className="text-lg font-semibold text-gray-900 whitespace-nowrap">Marketing</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-full bg-gray-200 rounded-full h-8">
                    <div className="bg-gradient-to-r from-cyan-500 to-cyan-600 h-8 rounded-full flex items-center justify-center text-white font-bold" style={{ width: '30%' }}>
                      30%
                    </div>
                  </div>
                  <span className="text-lg font-semibold text-gray-900 whitespace-nowrap">Produto</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-full bg-gray-200 rounded-full h-8">
                    <div className="bg-gradient-to-r from-purple-500 to-purple-600 h-8 rounded-full flex items-center justify-center text-white font-bold" style={{ width: '20%' }}>
                      20%
                    </div>
                  </div>
                  <span className="text-lg font-semibold text-gray-900 whitespace-nowrap">Vendas</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-full bg-gray-200 rounded-full h-8">
                    <div className="bg-gradient-to-r from-green-500 to-green-600 h-8 rounded-full flex items-center justify-center text-white font-bold" style={{ width: '10%' }}>
                      10%
                    </div>
                  </div>
                  <span className="text-lg font-semibold text-gray-900 whitespace-nowrap">Reserva</span>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-500 to-emerald-600 text-white p-8 rounded-xl shadow-xl">
              <h3 className="font-bold text-2xl mb-6">Projeção 24 Meses</h3>
              <div className="space-y-4">
                <div className="bg-white/20 p-4 rounded-lg backdrop-blur-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold">ARR</span>
                    <span className="text-3xl font-bold">R$ 360K</span>
                  </div>
                </div>
                <div className="bg-white/20 p-4 rounded-lg backdrop-blur-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold">Clientes Pagantes</span>
                    <span className="text-3xl font-bold">15</span>
                  </div>
                </div>
                <div className="bg-white/20 p-4 rounded-lg backdrop-blur-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold">Churn</span>
                    <span className="text-3xl font-bold">&lt; 3%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    },

    // Slide 9 - Time
    {
      title: "Time",
      content: (
        <div className="slide-content p-12 bg-gradient-to-br from-white to-cyan-50">
          <div className="text-center mb-12">
            <h2 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-700 bg-clip-text text-transparent">
              Time e Expertise
            </h2>
            <p className="text-2xl text-gray-600">Combinação Única: Logística + Tecnologia</p>
          </div>

          <div className="grid grid-cols-2 gap-12 mb-12">
            <div className="bg-white p-10 rounded-2xl shadow-2xl border-t-8 border-blue-600">
              <div className="flex items-center gap-6 mb-8">
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-400 to-blue-700 flex items-center justify-center text-white font-bold text-4xl flex-shrink-0">
                  LB
                </div>
                <div>
                  <h3 className="font-bold text-3xl text-gray-900 mb-2">Leonardo Bandeira</h3>
                  <p className="text-xl text-cyan-700 font-semibold">Founder & CEO</p>
                </div>
              </div>
              <div className="space-y-4 text-lg text-gray-700">
                <p><strong>• 5+ anos</strong> no setor de transporte rodoviário</p>
                <p><strong>• Desenvolvedor Full-Stack</strong> (React, Node, PostgreSQL)</p>
                <p><strong>• Consultor Logístico</strong> certificado</p>
                <p><strong>• MBA em Product Management</strong> (FIAP)</p>
              </div>
            </div>

            <div className="bg-gradient-to-br from-cyan-500 to-blue-700 text-white p-10 rounded-2xl shadow-2xl">
              <h3 className="font-bold text-3xl mb-8">Vantagens Competitivas</h3>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                    <Lightbulb className="w-7 h-7" />
                  </div>
                  <div>
                    <p className="font-bold text-xl mb-2">Domain Expertise</p>
                    <p className="text-lg opacity-90">Conhece as dores reais, validou com 20+ transportadoras</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                    <Zap className="w-7 h-7" />
                  </div>
                  <div>
                    <p className="font-bold text-xl mb-2">Velocidade</p>
                    <p className="text-lg opacity-90">MVP em 6 meses, iterações semanais</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                    <Target className="w-7 h-7" />
                  </div>
                  <div>
                    <p className="font-bold text-xl mb-2">Product-Market Fit</p>
                    <p className="text-lg opacity-90">NPS 8.3, DAU/MAU 0.6, SLA +10pp</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-blue-800 to-purple-800 text-white p-8 rounded-2xl shadow-2xl text-center">
            <p className="text-3xl font-bold mb-3">Plano de Expansão do Time</p>
            <div className="grid grid-cols-4 gap-6 mt-6">
              <div className="bg-white/10 p-4 rounded-lg">
                <p className="text-lg mb-2">Q2/25</p>
                <p className="text-2xl font-bold">+1 Dev</p>
              </div>
              <div className="bg-white/10 p-4 rounded-lg">
                <p className="text-lg mb-2">Q3/25</p>
                <p className="text-2xl font-bold">+1 SDR</p>
              </div>
              <div className="bg-white/10 p-4 rounded-lg">
                <p className="text-lg mb-2">Q3/25</p>
                <p className="text-2xl font-bold">+1 CSM</p>
              </div>
              <div className="bg-white/10 p-4 rounded-lg">
                <p className="text-lg mb-2">Q4/25</p>
                <p className="text-2xl font-bold">+1 Mkt</p>
              </div>
            </div>
          </div>
        </div>
      )
    },

    // Slide 10 - Go-to-Market
    {
      title: "GTM",
      content: (
        <div className="slide-content p-12 bg-gradient-to-br from-white to-purple-50">
          <div className="text-center mb-12">
            <h2 className="text-5xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Go-to-Market Strategy
            </h2>
            <p className="text-2xl text-gray-600">Múltiplos Canais de Aquisição</p>
          </div>

          <div className="grid grid-cols-3 gap-8 mb-10">
            <div className="bg-white p-8 rounded-2xl shadow-xl">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="w-9 h-9 text-white" />
              </div>
              <h3 className="font-bold text-xl text-gray-900 mb-4 text-center">Product-Led</h3>
              <ul className="space-y-3 text-base text-gray-700">
                <li>• Freemium (50 ordens grátis)</li>
                <li>• Self-service completo</li>
                <li>• Onboarding guiado</li>
                <li>• Trial sem cartão</li>
              </ul>
              <div className="mt-6 bg-cyan-50 p-3 rounded-lg">
                <p className="text-sm text-center font-semibold text-cyan-900">CAC: R$ 120</p>
              </div>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-xl">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center mx-auto mb-4">
                <Users className="w-9 h-9 text-white" />
              </div>
              <h3 className="font-bold text-xl text-gray-900 mb-4 text-center">Parcerias</h3>
              <ul className="space-y-3 text-base text-gray-700">
                <li>• Associações (ABRATI, NTC)</li>
                <li>• Revendedores regionais</li>
                <li>• Integradores ERP</li>
                <li>• Programa indicação</li>
              </ul>
              <div className="mt-6 bg-blue-50 p-3 rounded-lg">
                <p className="text-sm text-center font-semibold text-blue-900">CAC: R$ 180</p>
              </div>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-xl">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center mx-auto mb-4">
                <Briefcase className="w-9 h-9 text-white" />
              </div>
              <h3 className="font-bold text-xl text-gray-900 mb-4 text-center">Vendas Diretas</h3>
              <ul className="space-y-3 text-base text-gray-700">
                <li>• LinkedIn Ads</li>
                <li>• Google Ads (intent)</li>
                <li>• Eventos do setor</li>
                <li>• Outbound qualificado</li>
              </ul>
              <div className="mt-6 bg-purple-50 p-3 rounded-lg">
                <p className="text-sm text-center font-semibold text-purple-900">CAC: R$ 450</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-blue-700 text-white p-10 rounded-2xl shadow-2xl">
            <div className="grid grid-cols-3 gap-8 text-center">
              <div>
                <p className="text-5xl font-bold mb-2">R$ 280</p>
                <p className="text-xl opacity-90">CAC Blended Médio</p>
              </div>
              <div>
                <p className="text-5xl font-bold mb-2">4.5M</p>
                <p className="text-xl opacity-90">Payback CAC</p>
              </div>
              <div>
                <p className="text-5xl font-bold mb-2">10:1</p>
                <p className="text-xl opacity-90">LTV/CAC Ratio</p>
              </div>
            </div>
          </div>
        </div>
      )
    },

    // Slide 11 - Ask
    {
      title: "Ask",
      content: (
        <div className="slide-content flex flex-col items-center justify-center h-full bg-gradient-to-br from-blue-900 via-purple-900 to-blue-950">
          <div className="text-center max-w-5xl mx-auto px-8">
            <div className="mb-12">
              <Rocket className="w-32 h-32 mx-auto mb-8 text-cyan-300" />
              <h2 className="text-6xl font-bold text-white mb-6">
                O Pedido
              </h2>
            </div>

            <div className="bg-white/10 backdrop-blur-sm p-12 rounded-3xl border-4 border-white/30 mb-10">
              <p className="text-3xl text-cyan-300 mb-6">Buscando Investimento</p>
              <p className="text-8xl font-bold text-white mb-6">R$ 500K</p>
              <p className="text-2xl text-white/80">em troca de <strong className="text-cyan-300">8% equity</strong></p>
            </div>

            <div className="grid grid-cols-3 gap-8 mb-10">
              <div className="bg-white/10 backdrop-blur-sm p-8 rounded-2xl border-2 border-white/20">
                <DollarSign className="w-16 h-16 mx-auto mb-4 text-green-300" />
                <p className="text-4xl font-bold text-white mb-2">15</p>
                <p className="text-xl text-white/90">Clientes em 12M</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm p-8 rounded-2xl border-2 border-white/20">
                <TrendingUp className="w-16 h-16 mx-auto mb-4 text-cyan-300" />
                <p className="text-4xl font-bold text-white mb-2">R$ 360K</p>
                <p className="text-xl text-white/90">ARR em 24M</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm p-8 rounded-2xl border-2 border-white/20">
                <Rocket className="w-16 h-16 mx-auto mb-4 text-blue-300" />
                <p className="text-4xl font-bold text-white mb-2">Série A</p>
                <p className="text-xl text-white/90">Prep Q4/26</p>
              </div>
            </div>

            <div className="bg-gradient-to-r from-cyan-500 to-blue-600 p-10 rounded-2xl shadow-2xl">
              <h3 className="font-bold text-3xl text-white mb-6 text-center">Por Que Agora?</h3>
              <div className="grid grid-cols-2 gap-6 text-white text-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-xl">✓</span>
                  </div>
                  <span>Product-Market Fit validado</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-xl">✓</span>
                  </div>
                  <span>Mercado sub-penetrado (85%)</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-xl">✓</span>
                  </div>
                  <span>Unit economics provadas</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-xl">✓</span>
                  </div>
                  <span>Timing perfeito pós-pandemia</span>
                </div>
              </div>
            </div>

            <div className="text-center mt-12">
              <p className="text-3xl text-white/90 mb-4">Vamos revolucionar a logística juntos?</p>
              <div className="text-2xl text-cyan-300 font-semibold">
                leonardo@logiflow.com.br
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

  return (
    <>
      <style>{`
        @media print {
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      <div className="fixed inset-0 bg-gray-900 z-50 no-print">
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-8 py-6 bg-gradient-to-r from-slate-950 to-blue-950 border-b-2 border-cyan-500/30 shadow-2xl">
            <div className="flex items-center gap-4">
              <Rocket className="w-10 h-10 text-cyan-400" />
              <div>
                <h1 className="text-3xl font-bold text-white">Pitch Deck - Investidores</h1>
                <p className="text-cyan-300 text-lg">LogiFlow • Série Seed</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={async (event) => {
                  const btn = event.target.closest('button');
                  const originalText = btn.innerHTML;
                  btn.innerHTML = '<div class="flex items-center gap-2"><div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>Gerando PDF...</div>';
                  btn.disabled = true;
                  
                  try {
                    const pdf = new jsPDF({
                      orientation: 'landscape',
                      unit: 'px',
                      format: [1920, 1080]
                    });
                    
                    const slideElements = document.querySelectorAll('.slide-content');
                    
                    for (let i = 0; i < slideElements.length; i++) {
                      const slide = slideElements[i];
                      
                      const canvas = await html2canvas(slide, {
                        scale: 2,
                        useCORS: true,
                        allowTaint: true,
                        backgroundColor: '#ffffff',
                        width: 1920,
                        height: 1080
                      });
                      
                      const imgData = canvas.toDataURL('image/png');
                      if (i > 0) pdf.addPage();
                      pdf.addImage(imgData, 'PNG', 0, 0, 1920, 1080);
                    }
                    
                    pdf.save('PitchDeck_LogiFlow_Investidores.pdf');
                  } catch (error) {
                    console.error('Erro ao gerar PDF:', error);
                    alert('Erro ao gerar PDF. Tente novamente.');
                  } finally {
                    btn.innerHTML = originalText;
                    btn.disabled = false;
                  }
                }}
                className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white shadow-lg font-semibold text-lg px-6 py-3"
              >
                <Download className="w-5 h-5 mr-2" />
                Baixar PDF
              </Button>
              <Button
                onClick={() => navigate(createPageUrl("Configuracoes"))}
                variant="outline"
                className="bg-white/10 text-white border-2 border-cyan-500/50 hover:bg-white/20 text-lg px-6 py-3 font-semibold"
              >
                <X className="w-5 h-5 mr-2" />
                Fechar
              </Button>
            </div>
          </div>

          {/* Slide atual */}
          <div className="flex-1 m-6 rounded-xl shadow-2xl overflow-auto">
            {slides[currentSlide].content}
          </div>

          {/* Navegação */}
          <div className="flex items-center justify-between px-8 py-6 bg-gradient-to-r from-slate-950 to-blue-950 border-t-2 border-cyan-500/30">
            <Button
              onClick={prevSlide}
              disabled={currentSlide === 0}
              variant="outline"
              className="bg-white/10 text-white border-2 border-cyan-500/50 hover:bg-white/20 disabled:opacity-30 text-lg px-6 py-3 font-semibold"
            >
              <ChevronLeft className="w-6 h-6 mr-2" />
              Anterior
            </Button>

            <div className="flex items-center gap-4">
              <span className="text-xl text-cyan-300 font-semibold">
                Slide {currentSlide + 1} de {slides.length}
              </span>
              <div className="flex gap-2">
                {slides.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    className={`h-3 rounded-full transition-all ${
                      index === currentSlide
                        ? "bg-cyan-400 w-12"
                        : "bg-gray-600 hover:bg-gray-500 w-3"
                    }`}
                  />
                ))}
              </div>
            </div>

            <Button
              onClick={nextSlide}
              disabled={currentSlide === slides.length - 1}
              variant="outline"
              className="bg-white/10 text-white border-2 border-cyan-500/50 hover:bg-white/20 disabled:opacity-30 text-lg px-6 py-3 font-semibold"
            >
              Próximo
              <ChevronRight className="w-6 h-6 ml-2" />
            </Button>
          </div>
        </div>
      </div>

      {/* Container para impressão/PDF (todos os slides escondidos) */}
      <div className="hidden">
        {slides.map((slide, index) => (
          <div key={index} style={{ width: '1920px', height: '1080px' }}>
            {slide.content}
          </div>
        ))}
      </div>
    </>
  );
}