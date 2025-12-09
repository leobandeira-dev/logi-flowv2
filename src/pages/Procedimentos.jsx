import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  FileText, 
  AlertCircle, 
  Printer,
  Download,
  BookOpen,
  ClipboardCheck,
  Package,
  Truck,
  FileSpreadsheet
} from "lucide-react";
import { 
  InstrucaoOrdensCarregamentoDetalhada, 
  InstrucaoTrackingDetalhada 
} from "../components/procedimentos/DocumentosDetalhados";
import { 
  InstrucaoOcorrenciasDetalhada, 
  ManualSistemaCompleto 
} from "../components/procedimentos/DocumentosComplementares";
import { AnexosProcedimentoTransportes } from "../components/procedimentos/AnexosPOLOG001";

export default function Procedimentos() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isDark, setIsDark] = useState(false);
  const [procedimentoSelecionado, setProcedimentoSelecionado] = useState("ordens_carga");

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

  const loadUser = async () => {
    setLoading(true);
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
    } catch (error) {
      console.error("Erro ao carregar usuário:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleImprimir = () => {
    window.print();
  };

  const theme = {
    bg: isDark ? '#1e1e1e' : '#ffffff',
    cardBg: isDark ? '#2d2d2d' : '#ffffff',
    cardBorder: isDark ? '#404040' : '#d1d5db',
    text: isDark ? '#e5e5e5' : '#1f2937',
    textMuted: isDark ? '#a3a3a3' : '#4b5563',
    headerBg: isDark ? '#1a1a1a' : '#f3f4f6',
    accentBlue: '#1e40af',
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: theme.bg }}>
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p style={{ color: theme.textMuted }}>Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user || user.role !== "admin") {
    return (
      <div className="p-6 min-h-screen" style={{ backgroundColor: theme.bg }}>
        <div className="max-w-3xl mx-auto">
          <Alert variant="destructive">
            <AlertCircle className="w-4 h-4" />
            <AlertDescription>
              Acesso restrito a administradores.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 min-h-screen" style={{ backgroundColor: theme.bg }}>
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print-content, .print-content * {
            visibility: visible;
          }
          .print-content {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            padding: 20mm;
            background: white;
            color: black;
          }
          .no-print {
            display: none !important;
          }
          .print-page-break {
            page-break-before: always;
          }
        }
      `}</style>

      <div className="max-w-7xl mx-auto">
        {/* Header - Não imprime */}
        <div className="mb-6 no-print">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <BookOpen className="w-8 h-8 text-blue-600" />
                <h1 className="text-3xl font-bold" style={{ color: theme.text }}>
                  Procedimentos e Instruções de Trabalho
                </h1>
              </div>
              <p style={{ color: theme.textMuted }}>
                Documentação técnica conforme ISO 9001 e ABNT
              </p>
            </div>
            <Button
              onClick={handleImprimir}
              className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
            >
              <Printer className="w-4 h-4" />
              Imprimir
            </Button>
          </div>

          {/* Menu de Procedimentos */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
            <Card 
              onClick={() => setProcedimentoSelecionado("gestao_transportes")}
              className={`cursor-pointer transition-all ${procedimentoSelecionado === "gestao_transportes" ? 'ring-2 ring-blue-600' : ''}`}
              style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}
            >
              <CardContent className="p-4 flex items-center gap-3">
                <Truck className="w-8 h-8 text-blue-600" />
                <div>
                  <h3 className="font-bold text-sm" style={{ color: theme.text }}>Gestão de Transportes</h3>
                  <p className="text-xs" style={{ color: theme.textMuted }}>PO-LOG-001</p>
                </div>
              </CardContent>
            </Card>

            <Card 
              onClick={() => setProcedimentoSelecionado("ordens_carga")}
              className={`cursor-pointer transition-all ${procedimentoSelecionado === "ordens_carga" ? 'ring-2 ring-blue-600' : ''}`}
              style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}
            >
              <CardContent className="p-4 flex items-center gap-3">
                <Package className="w-8 h-8 text-blue-600" />
                <div>
                  <h3 className="font-bold text-sm" style={{ color: theme.text }}>Ordens de Carga</h3>
                  <p className="text-xs" style={{ color: theme.textMuted }}>IT-LOG-001</p>
                </div>
              </CardContent>
            </Card>

            <Card 
              onClick={() => setProcedimentoSelecionado("tracking")}
              className={`cursor-pointer transition-all ${procedimentoSelecionado === "tracking" ? 'ring-2 ring-blue-600' : ''}`}
              style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}
            >
              <CardContent className="p-4 flex items-center gap-3">
                <ClipboardCheck className="w-8 h-8 text-blue-600" />
                <div>
                  <h3 className="font-bold text-sm" style={{ color: theme.text }}>Tracking</h3>
                  <p className="text-xs" style={{ color: theme.textMuted }}>IT-LOG-002</p>
                </div>
              </CardContent>
            </Card>

            <Card 
              onClick={() => setProcedimentoSelecionado("ocorrencias")}
              className={`cursor-pointer transition-all ${procedimentoSelecionado === "ocorrencias" ? 'ring-2 ring-blue-600' : ''}`}
              style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}
            >
              <CardContent className="p-4 flex items-center gap-3">
                <AlertCircle className="w-8 h-8 text-blue-600" />
                <div>
                  <h3 className="font-bold text-sm" style={{ color: theme.text }}>Ocorrências</h3>
                  <p className="text-xs" style={{ color: theme.textMuted }}>IT-LOG-003</p>
                </div>
              </CardContent>
            </Card>

            <Card 
              onClick={() => setProcedimentoSelecionado("formulario")}
              className={`cursor-pointer transition-all ${procedimentoSelecionado === "formulario" ? 'ring-2 ring-blue-600' : ''}`}
              style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}
            >
              <CardContent className="p-4 flex items-center gap-3">
                <FileSpreadsheet className="w-8 h-8 text-blue-600" />
                <div>
                  <h3 className="font-bold text-sm" style={{ color: theme.text }}>Formulário OC</h3>
                  <p className="text-xs" style={{ color: theme.textMuted }}>FR-LOG-001</p>
                </div>
              </CardContent>
            </Card>

            <Card 
              onClick={() => setProcedimentoSelecionado("manual")}
              className={`cursor-pointer transition-all ${procedimentoSelecionado === "manual" ? 'ring-2 ring-blue-600' : ''}`}
              style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}
            >
              <CardContent className="p-4 flex items-center gap-3">
                <BookOpen className="w-8 h-8 text-blue-600" />
                <div>
                  <h3 className="font-bold text-sm" style={{ color: theme.text }}>Manual do Sistema</h3>
                  <p className="text-xs" style={{ color: theme.textMuted }}>MAN-LOG-001</p>
                </div>
              </CardContent>
            </Card>

            <Card 
              onClick={() => setProcedimentoSelecionado("anexos")}
              className={`cursor-pointer transition-all ${procedimentoSelecionado === "anexos" ? 'ring-2 ring-blue-600' : ''}`}
              style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}
            >
              <CardContent className="p-4 flex items-center gap-3">
                <FileText className="w-8 h-8 text-purple-600" />
                <div>
                  <h3 className="font-bold text-sm" style={{ color: theme.text }}>Anexos PO-LOG-001</h3>
                  <p className="text-xs" style={{ color: theme.textMuted }}>SIPOC, RACI, SLA, etc.</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Conteúdo para Impressão */}
        <div className="print-content">
          {procedimentoSelecionado === "gestao_transportes" && (
            <ProcedimentoGestaoTransportes theme={theme} isDark={isDark} />
          )}
          {procedimentoSelecionado === "anexos" && (
            <AnexosProcedimentoTransportes theme={theme} isDark={isDark} />
          )}
          {procedimentoSelecionado === "ordens_carga" && (
            <InstrucaoOrdensCarregamentoDetalhada theme={theme} isDark={isDark} />
          )}
          {procedimentoSelecionado === "tracking" && (
            <InstrucaoTrackingDetalhada theme={theme} isDark={isDark} />
          )}
          {procedimentoSelecionado === "ocorrencias" && (
            <InstrucaoOcorrenciasDetalhada theme={theme} isDark={isDark} />
          )}
          {procedimentoSelecionado === "formulario" && (
            <FormularioOrdemCarregamento theme={theme} isDark={isDark} />
          )}
          {procedimentoSelecionado === "manual" && (
            <ManualSistemaCompleto theme={theme} isDark={isDark} />
          )}
        </div>
      </div>
    </div>
  );
}

function InstrucaoOrdensCarregamento({ theme, isDark }) {
  return (
    <Card style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}>
      <CardContent className="p-8 space-y-6">
        {/* Cabeçalho do Documento */}
        <div className="border-b pb-6" style={{ borderColor: theme.cardBorder }}>
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h1 className="text-2xl font-bold mb-2" style={{ color: theme.text }}>
                INSTRUÇÃO DE TRABALHO
              </h1>
              <h2 className="text-xl font-semibold mb-1" style={{ color: theme.text }}>
                Gestão de Ordens de Carregamento
              </h2>
            </div>
            <div className="text-right text-sm" style={{ color: theme.textMuted }}>
              <p className="font-bold">Código: IT-LOG-001</p>
              <p>Revisão: 01</p>
              <p>Data: 09/12/2024</p>
              <p>Páginas: 1/1</p>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <p className="font-semibold" style={{ color: theme.text }}>Elaborado por:</p>
              <p style={{ color: theme.textMuted }}>Gestão de Qualidade</p>
            </div>
            <div>
              <p className="font-semibold" style={{ color: theme.text }}>Aprovado por:</p>
              <p style={{ color: theme.textMuted }}>Diretor de Operações</p>
            </div>
            <div>
              <p className="font-semibold" style={{ color: theme.text }}>Área:</p>
              <p style={{ color: theme.textMuted }}>Operações Logísticas</p>
            </div>
          </div>
        </div>

        {/* 1. Objetivo */}
        <section>
          <h3 className="text-lg font-bold mb-3 flex items-center gap-2" style={{ color: theme.text }}>
            <span className="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">1</span>
            OBJETIVO
          </h3>
          <p className="text-sm leading-relaxed" style={{ color: theme.textMuted }}>
            Estabelecer os critérios e procedimentos para criação, gestão e controle de Ordens de Carregamento, 
            garantindo a rastreabilidade, eficiência operacional e conformidade com requisitos de qualidade conforme 
            NBR ISO 9001:2015 (item 8.5 - Produção e provisão de serviço).
          </p>
        </section>

        {/* 2. Aplicação */}
        <section>
          <h3 className="text-lg font-bold mb-3 flex items-center gap-2" style={{ color: theme.text }}>
            <span className="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">2</span>
            APLICAÇÃO
          </h3>
          <p className="text-sm leading-relaxed mb-2" style={{ color: theme.textMuted }}>
            Esta instrução de trabalho aplica-se a:
          </p>
          <ul className="list-disc list-inside text-sm space-y-1 ml-4" style={{ color: theme.textMuted }}>
            <li>Operadores logísticos responsáveis pelo lançamento de ordens</li>
            <li>Coordenadores de expedição</li>
            <li>Gestores de operações</li>
            <li>Equipe de planejamento de transporte</li>
          </ul>
        </section>

        {/* 3. Definições */}
        <section>
          <h3 className="text-lg font-bold mb-3 flex items-center gap-2" style={{ color: theme.text }}>
            <span className="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">3</span>
            DEFINIÇÕES
          </h3>
          <div className="space-y-3 text-sm">
            <div>
              <p className="font-semibold" style={{ color: theme.text }}>3.1 Ordem de Carregamento (OC):</p>
              <p style={{ color: theme.textMuted }}>Documento que autoriza e registra o transporte de mercadorias entre origem e destino, contendo todas as informações necessárias para execução do serviço.</p>
            </div>
            <div>
              <p className="font-semibold" style={{ color: theme.text }}>3.2 Oferta de Carga:</p>
              <p style={{ color: theme.textMuted }}>Registro de disponibilidade de carga sem alocação de motorista ou veículo.</p>
            </div>
            <div>
              <p className="font-semibold" style={{ color: theme.text }}>3.3 Negociando:</p>
              <p style={{ color: theme.textMuted }}>Ordem com motorista alocado, porém sem veículo definido.</p>
            </div>
            <div>
              <p className="font-semibold" style={{ color: theme.text }}>3.4 Ordem Completa/Alocada:</p>
              <p style={{ color: theme.textMuted }}>Ordem com motorista e veículo completamente definidos, pronta para execução.</p>
            </div>
            <div>
              <p className="font-semibold" style={{ color: theme.text }}>3.5 Rastreabilidade:</p>
              <p style={{ color: theme.textMuted }}>Capacidade de recuperar o histórico, aplicação ou localização do que está sendo considerado (NBR ISO 9000:2015, item 3.6.13).</p>
            </div>
          </div>
        </section>

        {/* 4. Responsabilidades */}
        <section>
          <h3 className="text-lg font-bold mb-3 flex items-center gap-2" style={{ color: theme.text }}>
            <span className="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">4</span>
            RESPONSABILIDADES
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex gap-3">
              <p className="font-semibold w-48" style={{ color: theme.text }}>Operador Logístico:</p>
              <p style={{ color: theme.textMuted }}>Criar e manter atualizadas as ordens de carregamento no sistema.</p>
            </div>
            <div className="flex gap-3">
              <p className="font-semibold w-48" style={{ color: theme.text }}>Coordenador de Expedição:</p>
              <p style={{ color: theme.textMuted }}>Validar informações e aprovar alocações de recursos.</p>
            </div>
            <div className="flex gap-3">
              <p className="font-semibold w-48" style={{ color: theme.text }}>Gestor de Operações:</p>
              <p style={{ color: theme.textMuted }}>Monitorar indicadores e garantir conformidade do processo.</p>
            </div>
          </div>
        </section>

        {/* 5. Procedimento */}
        <section>
          <h3 className="text-lg font-bold mb-3 flex items-center gap-2" style={{ color: theme.text }}>
            <span className="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">5</span>
            PROCEDIMENTO
          </h3>

          {/* 5.1 Tipos de Registro */}
          <div className="mb-6">
            <h4 className="font-bold text-base mb-3" style={{ color: theme.text }}>
              5.1 Tipos de Registro de Ordem
            </h4>
            
            <div className="space-y-4">
              <Card style={{ backgroundColor: isDark ? '#0f172a' : '#f9fafb', borderColor: theme.cardBorder }}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Package className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h5 className="font-bold text-sm mb-1" style={{ color: theme.text }}>5.1.1 Oferta de Carga</h5>
                      <p className="text-xs mb-2" style={{ color: theme.textMuted }}>
                        <strong>Quando usar:</strong> Carga disponível sem motorista ou veículo definido.
                      </p>
                      <p className="text-xs" style={{ color: theme.textMuted }}>
                        <strong>Campos obrigatórios:</strong> Cliente, Origem, Destino, Produto, Peso, Tipo de Operação (CIF/FOB).
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card style={{ backgroundColor: isDark ? '#0f172a' : '#f9fafb', borderColor: theme.cardBorder }}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-yellow-600 rounded-lg flex items-center justify-center flex-shrink-0">
                      <ClipboardCheck className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h5 className="font-bold text-sm mb-1" style={{ color: theme.text }}>5.1.2 Negociando</h5>
                      <p className="text-xs mb-2" style={{ color: theme.textMuted }}>
                        <strong>Quando usar:</strong> Motorista já alocado, aguardando definição do veículo.
                      </p>
                      <p className="text-xs" style={{ color: theme.textMuted }}>
                        <strong>Transição automática:</strong> O sistema atualiza automaticamente de "Oferta" para "Negociando" ao informar nome do motorista.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card style={{ backgroundColor: isDark ? '#0f172a' : '#f9fafb', borderColor: theme.cardBorder }}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Truck className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h5 className="font-bold text-sm mb-1" style={{ color: theme.text }}>5.1.3 Ordem Completa/Alocada</h5>
                      <p className="text-xs mb-2" style={{ color: theme.textMuted }}>
                        <strong>Quando usar:</strong> Motorista e veículo (cavalo) completamente definidos.
                      </p>
                      <p className="text-xs" style={{ color: theme.textMuted }}>
                        <strong>Transição automática:</strong> O sistema atualiza para "Alocado" ao informar placa do cavalo.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* 5.2 Fluxo de Criação */}
          <div className="mb-6">
            <h4 className="font-bold text-base mb-3" style={{ color: theme.text }}>
              5.2 Fluxo de Criação de Ordem
            </h4>
            
            <div className="space-y-3">
              <div className="flex gap-3">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                  1
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-sm mb-1" style={{ color: theme.text }}>Acessar Menu</p>
                  <p className="text-xs" style={{ color: theme.textMuted }}>
                    Navegue até: <strong>Operações → Ordens</strong> e clique em <strong>"Nova Ordem"</strong>.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                  2
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-sm mb-1" style={{ color: theme.text }}>Selecionar Tipo</p>
                  <p className="text-xs mb-2" style={{ color: theme.textMuted }}>
                    Escolha o tipo de registro adequado:
                  </p>
                  <ul className="text-xs space-y-1 ml-4 list-disc" style={{ color: theme.textMuted }}>
                    <li><strong>Ordem Completa:</strong> Quando já possui motorista e veículo</li>
                    <li><strong>Oferta de Carga:</strong> Quando a carga está disponível mas sem alocação</li>
                    <li><strong>Lançamento em Lote:</strong> Para múltiplas ofertas simultâneas (planilha)</li>
                  </ul>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                  3
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-sm mb-1" style={{ color: theme.text }}>Preencher Dados Obrigatórios</p>
                  <div className="text-xs space-y-2" style={{ color: theme.textMuted }}>
                    <div>
                      <p className="font-semibold">Dados do Cliente e Operação:</p>
                      <ul className="ml-4 list-disc">
                        <li>Cliente (nome e CNPJ)</li>
                        <li>Tipo de Operação (CIF ou FOB)</li>
                        <li>Operação vinculada (define SLA e tolerâncias)</li>
                      </ul>
                    </div>
                    <div>
                      <p className="font-semibold">Dados da Carga:</p>
                      <ul className="ml-4 list-disc">
                        <li>Origem e Destino (cidade/UF ou endereço completo)</li>
                        <li>Produto</li>
                        <li>Peso (em kg)</li>
                        <li>Tipo de Veículo e Carroceria necessários</li>
                        <li>Modalidade (Normal, Prioridade, Expressa)</li>
                      </ul>
                    </div>
                    <div>
                      <p className="font-semibold">Dados Comerciais:</p>
                      <ul className="ml-4 list-disc">
                        <li>Valor do frete (por tonelada ou viagem)</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                  4
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-sm mb-1" style={{ color: theme.text }}>Vincular Notas Fiscais (Opcional)</p>
                  <p className="text-xs mb-2" style={{ color: theme.textMuted }}>
                    Caso a ordem já possua notas fiscais, vincule-as através de:
                  </p>
                  <ul className="text-xs space-y-1 ml-4 list-disc" style={{ color: theme.textMuted }}>
                    <li>Upload de XML da NF-e</li>
                    <li>Digitação da chave de 44 dígitos</li>
                    <li>Seleção de notas já cadastradas no sistema</li>
                  </ul>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                  5
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-sm mb-1" style={{ color: theme.text }}>Salvar e Validar</p>
                  <p className="text-xs" style={{ color: theme.textMuted }}>
                    Ao salvar, o sistema:<br/>
                    • Gera número único da ordem (formato ANO-SEQUENCIAL)<br/>
                    • Calcula automaticamente valor total do frete<br/>
                    • Define cliente final baseado no tipo de operação (CIF/FOB)<br/>
                    • Vincula automaticamente à primeira etapa do fluxo operacional<br/>
                    • Valida campos obrigatórios
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 5.3 Edição Inline */}
          <div className="mb-6">
            <h4 className="font-bold text-base mb-3" style={{ color: theme.text }}>
              5.3 Edição Rápida (Inline)
            </h4>
            <p className="text-sm mb-3" style={{ color: theme.textMuted }}>
              Para agilizar a operação, campos específicos podem ser editados diretamente na tabela:
            </p>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <Card style={{ backgroundColor: isDark ? '#0f172a' : '#f9fafb', borderColor: theme.cardBorder }}>
                <CardContent className="p-3">
                  <p className="font-semibold mb-2" style={{ color: theme.text }}>Campos Editáveis Inline:</p>
                  <ul className="space-y-1 list-disc ml-4" style={{ color: theme.textMuted }}>
                    <li>Modalidade de Carga</li>
                    <li>Tipo de Veículo</li>
                    <li>Nome do Motorista (temporário)</li>
                    <li>Placas (Cavalo e Implementos)</li>
                    <li>Valor do Frete</li>
                    <li>Agendamento Carregamento</li>
                    <li>Agendamento Descarga</li>
                    <li>Observações da Carga</li>
                  </ul>
                </CardContent>
              </Card>
              <Card style={{ backgroundColor: isDark ? '#0f172a' : '#f9fafb', borderColor: theme.cardBorder }}>
                <CardContent className="p-3">
                  <p className="font-semibold mb-2" style={{ color: theme.text }}>Procedimento de Edição:</p>
                  <ul className="space-y-1 list-decimal ml-4" style={{ color: theme.textMuted }}>
                    <li>Clique no campo desejado</li>
                    <li>Altere o valor</li>
                    <li>Pressione ENTER ou clique fora para salvar</li>
                    <li>Pressione ESC para cancelar</li>
                    <li><strong>Atalho "H":</strong> Nos campos de data/hora, preenche automaticamente com data/hora atual</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* 5.4 Transições de Status */}
          <div className="mb-6">
            <h4 className="font-bold text-base mb-3" style={{ color: theme.text }}>
              5.4 Transições Automáticas de Status
            </h4>
            <div className="space-y-2 text-sm" style={{ color: theme.textMuted }}>
              <div className="flex items-center gap-3">
                <div className="px-3 py-1 bg-green-600 text-white rounded text-xs font-bold">Oferta</div>
                <span>→</span>
                <div className="px-3 py-1 bg-yellow-600 text-white rounded text-xs font-bold">Negociando</div>
                <span className="text-xs">Ao informar motorista</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="px-3 py-1 bg-yellow-600 text-white rounded text-xs font-bold">Negociando</div>
                <span>→</span>
                <div className="px-3 py-1 bg-blue-600 text-white rounded text-xs font-bold">Alocado</div>
                <span className="text-xs">Ao informar placa do cavalo</span>
              </div>
            </div>
          </div>

          {/* 5.5 Status de Tracking */}
          <div className="mb-6">
            <h4 className="font-bold text-base mb-3" style={{ color: theme.text }}>
              5.5 Ciclo de Vida - Status de Tracking
            </h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {[
                { status: "aguardando_agendamento", label: "Aguardando Agendamento", cor: "#64748b" },
                { status: "carregamento_agendado", label: "Carregamento Agendado", cor: "#3b82f6" },
                { status: "em_carregamento", label: "Em Carregamento", cor: "#6366f1" },
                { status: "carregado", label: "Carregado", cor: "#8b5cf6" },
                { status: "em_viagem", label: "Em Viagem", cor: "#06b6d4" },
                { status: "chegada_destino", label: "Chegada ao Destino", cor: "#14b8a6" },
                { status: "descarga_agendada", label: "Descarga Agendada", cor: "#f59e0b" },
                { status: "em_descarga", label: "Em Descarga", cor: "#f97316" },
                { status: "descarga_realizada", label: "Descarga Realizada", cor: "#22c55e" },
                { status: "finalizado", label: "Finalizado", cor: "#6b7280" }
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded" style={{ backgroundColor: item.cor }} />
                  <span style={{ color: theme.textMuted }}>{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 6. Registros e Rastreabilidade */}
        <section>
          <h3 className="text-lg font-bold mb-3 flex items-center gap-2" style={{ color: theme.text }}>
            <span className="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">6</span>
            REGISTROS E RASTREABILIDADE
          </h3>
          <p className="text-sm mb-3" style={{ color: theme.textMuted }}>
            Conforme NBR ISO 9001:2015 (item 7.5 - Informação documentada), o sistema mantém automaticamente:
          </p>
          <ul className="list-disc list-inside text-sm space-y-1 ml-4" style={{ color: theme.textMuted }}>
            <li>Data e hora de criação da ordem</li>
            <li>Usuário responsável pela criação</li>
            <li>Histórico de alterações em campos críticos</li>
            <li>Data e hora de última atualização</li>
            <li>Número único de identificação (não reutilizável)</li>
            <li>Vinculação com etapas do fluxo operacional</li>
          </ul>
        </section>

        {/* 7. Critérios de Aceitação */}
        <section>
          <h3 className="text-lg font-bold mb-3 flex items-center gap-2" style={{ color: theme.text }}>
            <span className="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">7</span>
            CRITÉRIOS DE ACEITAÇÃO E VALIDAÇÃO
          </h3>
          <div className="space-y-2 text-sm">
            <div>
              <p className="font-semibold" style={{ color: theme.text }}>7.1 Validações Automáticas do Sistema:</p>
              <ul className="list-disc list-inside ml-4 space-y-1" style={{ color: theme.textMuted }}>
                <li>Campos obrigatórios preenchidos</li>
                <li>CNPJ válido (quando aplicável)</li>
                <li>Peso superior a zero</li>
                <li>Datas de agendamento em formato válido</li>
                <li>Placa de veículo no formato válido (7 caracteres alfanuméricos)</li>
              </ul>
            </div>
            <div>
              <p className="font-semibold" style={{ color: theme.text }}>7.2 Verificação Manual do Operador:</p>
              <ul className="list-disc list-inside ml-4 space-y-1" style={{ color: theme.textMuted }}>
                <li>Conferência dos dados do cliente e destinatário</li>
                <li>Validação da rota (origem → destino)</li>
                <li>Verificação da compatibilidade tipo de veículo × carga</li>
                <li>Confirmação do valor do frete acordado</li>
              </ul>
            </div>
          </div>
        </section>

        {/* 8. Não Conformidades */}
        <section>
          <h3 className="text-lg font-bold mb-3 flex items-center gap-2" style={{ color: theme.text }}>
            <span className="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">8</span>
            TRATAMENTO DE NÃO CONFORMIDADES
          </h3>
          <div className="space-y-2 text-sm">
            <p style={{ color: theme.textMuted }}>
              Caso sejam identificadas inconsistências ou erros nos dados da ordem:
            </p>
            <ol className="list-decimal list-inside ml-4 space-y-1" style={{ color: theme.textMuted }}>
              <li>Registrar ocorrência no módulo de Qualidade (categoria: fluxo ou tarefa)</li>
              <li>Informar responsável pela correção</li>
              <li>Corrigir dados diretamente na ordem (edição inline ou formulário completo)</li>
              <li>Documentar a correção nas observações internas</li>
              <li>Fechar a ocorrência após validação da correção</li>
            </ol>
          </div>
        </section>

        {/* 9. Indicadores */}
        <section>
          <h3 className="text-lg font-bold mb-3 flex items-center gap-2" style={{ color: theme.text }}>
            <span className="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">9</span>
            INDICADORES DE DESEMPENHO
          </h3>
          <div className="grid grid-cols-3 gap-3">
            <Card style={{ backgroundColor: isDark ? '#0f172a' : '#f9fafb', borderColor: theme.cardBorder }}>
              <CardContent className="p-3 text-center">
                <p className="text-xs font-semibold mb-1" style={{ color: theme.text }}>Taxa de Alocação</p>
                <p className="text-xs" style={{ color: theme.textMuted }}>
                  (Ordens Alocadas / Total Ordens) × 100
                </p>
                <p className="text-xs font-bold text-green-600 mt-1">Meta: ≥ 90%</p>
              </CardContent>
            </Card>
            <Card style={{ backgroundColor: isDark ? '#0f172a' : '#f9fafb', borderColor: theme.cardBorder }}>
              <CardContent className="p-3 text-center">
                <p className="text-xs font-semibold mb-1" style={{ color: theme.text }}>Tempo Médio de Alocação</p>
                <p className="text-xs" style={{ color: theme.textMuted }}>
                  Tempo entre criação e alocação completa
                </p>
                <p className="text-xs font-bold text-green-600 mt-1">Meta: ≤ 24h</p>
              </CardContent>
            </Card>
            <Card style={{ backgroundColor: isDark ? '#0f172a' : '#f9fafb', borderColor: theme.cardBorder }}>
              <CardContent className="p-3 text-center">
                <p className="text-xs font-semibold mb-1" style={{ color: theme.text }}>Dados Completos</p>
                <p className="text-xs" style={{ color: theme.textMuted }}>
                  % de ordens com todos campos preenchidos
                </p>
                <p className="text-xs font-bold text-green-600 mt-1">Meta: ≥ 95%</p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* 10. Documentos Relacionados */}
        <section>
          <h3 className="text-lg font-bold mb-3 flex items-center gap-2" style={{ color: theme.text }}>
            <span className="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">10</span>
            DOCUMENTOS RELACIONADOS
          </h3>
          <ul className="list-disc list-inside text-sm space-y-1 ml-4" style={{ color: theme.textMuted }}>
            <li>PO-LOG-001 - Procedimento Operacional de Gestão de Transportes</li>
            <li>IT-LOG-002 - Instrução de Trabalho para Tracking e Rastreamento</li>
            <li>IT-LOG-003 - Instrução de Trabalho para Gestão de Ocorrências</li>
            <li>FR-LOG-001 - Formulário de Ordem de Carregamento</li>
            <li>Manual do Sistema Log Flow</li>
          </ul>
        </section>

        {/* 11. Anexos */}
        <section>
          <h3 className="text-lg font-bold mb-3 flex items-center gap-2" style={{ color: theme.text }}>
            <span className="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">11</span>
            ANEXOS
          </h3>
          <p className="text-sm" style={{ color: theme.textMuted }}>
            Anexo A - Fluxograma do Processo de Criação de Ordens<br/>
            Anexo B - Tabela de Tipos de Veículo e Carroceria Padronizados<br/>
            Anexo C - Checklist de Validação de Dados
          </p>
        </section>

        {/* Rodapé */}
        <div className="border-t pt-4 mt-8 text-xs text-center" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>
          <p>Este documento é propriedade da empresa e não deve ser reproduzido sem autorização.</p>
          <p className="mt-1">Controlado eletronicamente - A versão impressa é considerada cópia não controlada.</p>
        </div>
      </CardContent>
    </Card>
  );
}

function ProcedimentoGestaoTransportes({ theme, isDark }) {
  return (
    <Card style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}>
      <CardContent className="p-8 space-y-6">
        {/* Cabeçalho */}
        <div className="border-b pb-6" style={{ borderColor: theme.cardBorder }}>
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h1 className="text-2xl font-bold mb-2" style={{ color: theme.text }}>
                PROCEDIMENTO OPERACIONAL
              </h1>
              <h2 className="text-xl font-semibold mb-1" style={{ color: theme.text }}>
                Gestão de Transportes Rodoviários de Cargas
              </h2>
            </div>
            <div className="text-right text-sm" style={{ color: theme.textMuted }}>
              <p className="font-bold">Código: PO-LOG-001</p>
              <p>Revisão: 01</p>
              <p>Data: 09/12/2024</p>
              <p>Páginas: 1/5</p>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-4 text-sm mb-4">
            <div>
              <p className="font-semibold" style={{ color: theme.text }}>Elaborado por:</p>
              <p style={{ color: theme.textMuted }}>Coordenador de Qualidade</p>
            </div>
            <div>
              <p className="font-semibold" style={{ color: theme.text }}>Aprovado por:</p>
              <p style={{ color: theme.textMuted }}>Diretor Executivo</p>
            </div>
            <div>
              <p className="font-semibold" style={{ color: theme.text }}>Data Aprovação:</p>
              <p style={{ color: theme.textMuted }}>09/12/2024</p>
            </div>
          </div>

          <div className="border rounded p-3 text-xs" style={{ borderColor: theme.cardBorder, backgroundColor: theme.headerBg }}>
            <p className="font-semibold mb-1" style={{ color: theme.text }}>Conformidade Normativa:</p>
            <p style={{ color: theme.textMuted }}>
              • NBR ISO 9001:2015 (itens 4.4, 6.1, 8.1, 8.5, 9.1, 10.2)<br/>
              • SASSMAQ v.7 (elementos 1.3, 2.1, 2.2, 3.1, 3.4, 4.2, 4.3)<br/>
              • Resolução ANTT nº 5.867/2019 - RNTRC<br/>
              • Lei nº 11.442/2007 - Transporte Rodoviário de Cargas
            </p>
          </div>
        </div>

        {/* 1. Objetivo e Escopo */}
        <section>
          <h3 className="text-lg font-bold mb-3" style={{ color: theme.text }}>1. OBJETIVO E ESCOPO</h3>
          <div className="space-y-3 text-sm" style={{ color: theme.textMuted }}>
            <div>
              <p className="font-semibold">1.1 Objetivo:</p>
              <p className="ml-4">
                Estabelecer diretrizes sistematizadas para o planejamento, execução, monitoramento e controle 
                de operações de transporte rodoviário de cargas, assegurando:
              </p>
              <ul className="list-disc ml-8 space-y-1 mt-2">
                <li>Conformidade com NBR ISO 9001:2015 (requisitos de processo)</li>
                <li>Atendimento aos critérios SASSMAQ v.7 (Segurança, Saúde, Meio Ambiente e Qualidade)</li>
                <li>Rastreabilidade completa das operações (ISO 9000:2015, 3.6.13)</li>
                <li>Eficiência operacional e cumprimento de prazos (SLA)</li>
                <li>Segurança da carga, motoristas e informações</li>
                <li>Melhoria contínua através de ciclo PDCA</li>
              </ul>
            </div>
            
            <div>
              <p className="font-semibold">1.2 Escopo:</p>
              <p className="ml-4 mb-2">
                Este procedimento abrange todo o ciclo de vida das operações de transporte, desde a 
                solicitação inicial até o encerramento e faturamento, aplicável a:
              </p>
              <ul className="list-disc ml-8 space-y-1">
                <li><strong>Carregamentos:</strong> Transferências, distribuição, cross-docking</li>
                <li><strong>Coletas B2B:</strong> Solicitadas por fornecedores, aprovadas por clientes</li>
                <li><strong>Entregas:</strong> Last mile, entregas fracionadas</li>
                <li><strong>Recebimentos:</strong> Armazenagem, conferência de mercadorias</li>
                <li><strong>Modalidades de Frota:</strong> Própria, terceirizada, agregados, acionistas</li>
              </ul>
            </div>

            <div>
              <p className="font-semibold">1.3 Exclusões:</p>
              <p className="ml-4">
                Este procedimento NÃO se aplica a: transporte aéreo, ferroviário ou marítimo, 
                operações internacionais (importação/exportação), transporte de cargas perigosas 
                (requer PO específico conforme ANTT).
              </p>
            </div>
          </div>
        </section>

        {/* 2. Referências Normativas */}
        <section>
          <h3 className="text-lg font-bold mb-3" style={{ color: theme.text }}>2. REFERÊNCIAS NORMATIVAS E DOCUMENTOS RELACIONADOS</h3>
          <div className="space-y-3 text-sm">
            <div>
              <p className="font-semibold mb-1" style={{ color: theme.text }}>2.1 Normas Técnicas:</p>
              <ul className="list-disc list-inside ml-4 space-y-1" style={{ color: theme.textMuted }}>
                <li>NBR ISO 9001:2015 - Sistemas de Gestão da Qualidade - Requisitos</li>
                <li>NBR ISO 9000:2015 - Sistemas de Gestão da Qualidade - Fundamentos e Vocabulário</li>
                <li>NBR ISO 10005:2007 - Diretrizes para Planos da Qualidade</li>
                <li>NBR ISO 31000:2018 - Gestão de Riscos - Diretrizes</li>
                <li>SASSMAQ v.7 - Sistema de Avaliação de SSM e Qualidade (ABIQUIM)</li>
              </ul>
            </div>

            <div>
              <p className="font-semibold mb-1" style={{ color: theme.text }}>2.2 Legislação Aplicável:</p>
              <ul className="list-disc list-inside ml-4 space-y-1" style={{ color: theme.textMuted }}>
                <li>Lei nº 11.442/2007 - Transporte Rodoviário de Cargas</li>
                <li>Resolução ANTT nº 5.867/2019 - RNTRC (Registro Nacional)</li>
                <li>Resolução ANTT nº 5.865/2019 - Seguro Obrigatório de Carga</li>
                <li>Resolução CONTRAN nº 918/2022 - Requisitos de Segurança Veicular</li>
                <li>Lei nº 13.709/2018 - LGPD (Proteção de Dados)</li>
              </ul>
            </div>

            <div>
              <p className="font-semibold mb-1" style={{ color: theme.text }}>2.3 Documentos Internos (SGQ):</p>
              <ul className="list-disc list-inside ml-4 space-y-1" style={{ color: theme.textMuted }}>
                <li><strong>IT-LOG-001</strong> - Instrução de Trabalho para Gestão de Ordens de Carregamento</li>
                <li><strong>IT-LOG-002</strong> - Instrução de Trabalho para Tracking e Rastreamento</li>
                <li><strong>IT-LOG-003</strong> - Instrução de Trabalho para Gestão de Ocorrências</li>
                <li><strong>FR-LOG-001</strong> - Formulário de Ordem de Carregamento</li>
                <li><strong>MAN-LOG-001</strong> - Manual do Sistema Log Flow</li>
              </ul>
            </div>
          </div>
        </section>

        {/* 3. Termos e Definições */}
        <section>
          <h3 className="text-lg font-bold mb-3" style={{ color: theme.text }}>3. TERMOS E DEFINIÇÕES (ISO 9000:2015)</h3>
          <div className="text-sm space-y-2" style={{ color: theme.textMuted }}>
            <p><strong>3.1 Ordem de Carregamento (OC):</strong> Documento controlado que autoriza e registra o transporte de mercadorias (ISO 9001:2015, 7.5).</p>
            <p><strong>3.2 SLA (Service Level Agreement):</strong> Acordo de nível de serviço com prazos definidos para carregamento e descarga.</p>
            <p><strong>3.3 Rastreabilidade:</strong> Capacidade de rastrear histórico, localização e status da carga (ISO 9000:2015, 3.6.13).</p>
            <p><strong>3.4 Ocorrência:</strong> Qualquer desvio do planejado que requeira registro e tratamento.</p>
            <p><strong>3.5 Não Conformidade:</strong> Não atendimento a um requisito (ISO 9000:2015, 3.6.9).</p>
            <p><strong>3.6 Ação Corretiva:</strong> Ação para eliminar a causa de uma não conformidade (ISO 9000:2015, 3.12.2).</p>
            <p><strong>3.7 Ação Preventiva:</strong> Ação para eliminar a causa de uma potencial não conformidade.</p>
            <p><strong>3.8 Frota Dedicada:</strong> Veículos próprios ou agregados vinculados à operação.</p>
            <p><strong>3.9 Diária:</strong> Cobrança adicional por tempo de espera além da tolerância acordada.</p>
            <p><strong>3.10 Expurgo:</strong> Exclusão justificada de atraso do cálculo de SLA (requer evidência).</p>
          </div>
        </section>

        {/* 4. SASSMAQ */}
        <section>
          <h3 className="text-lg font-bold mb-3" style={{ color: theme.text }}>4. ATENDIMENTO AOS REQUISITOS SASSMAQ v.7</h3>
          <table className="w-full text-xs border" style={{ borderColor: theme.cardBorder }}>
            <thead style={{ backgroundColor: isDark ? '#0f172a' : '#f3f4f6' }}>
              <tr>
                <th className="border p-2 text-left w-16" style={{ borderColor: theme.cardBorder, color: theme.text }}>Elem.</th>
                <th className="border p-2 text-left" style={{ borderColor: theme.cardBorder, color: theme.text }}>Requisito SASSMAQ</th>
                <th className="border p-2 text-left" style={{ borderColor: theme.cardBorder, color: theme.text }}>Evidência no Sistema Log Flow</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border p-2 font-semibold" style={{ borderColor: theme.cardBorder, color: theme.text }}>1.3</td>
                <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>Controle de documentos e registros</td>
                <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>
                  Versionamento automático, timestamps, rastreabilidade de alterações, backup diário
                </td>
              </tr>
              <tr>
                <td className="border p-2 font-semibold" style={{ borderColor: theme.cardBorder, color: theme.text }}>2.1</td>
                <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>Qualificação e seleção de motoristas</td>
                <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>
                  Cadastro completo: CNH, categoria, vencimento, RNTRC, referências comerciais/pessoais
                </td>
              </tr>
              <tr>
                <td className="border p-2 font-semibold" style={{ borderColor: theme.cardBorder, color: theme.text }}>2.2</td>
                <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>Qualificação e seleção de veículos</td>
                <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>
                  Cadastro: ANTT, CRLV, licenciamento, capacidade, controle de vencimentos
                </td>
              </tr>
              <tr>
                <td className="border p-2 font-semibold" style={{ borderColor: theme.cardBorder, color: theme.text }}>3.1</td>
                <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>Planejamento da viagem</td>
                <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>
                  Ordem de Carregamento, definição de rota, agendamentos, alocação de recursos
                </td>
              </tr>
              <tr>
                <td className="border p-2 font-semibold" style={{ borderColor: theme.cardBorder, color: theme.text }}>3.4</td>
                <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>Monitoramento da viagem</td>
                <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>
                  Tracking em tempo real, 10 estágios de status, alertas de SLA, comunicação motorista
                </td>
              </tr>
              <tr>
                <td className="border p-2 font-semibold" style={{ borderColor: theme.cardBorder, color: theme.text }}>4.2</td>
                <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>Tratamento de emergências e desvios</td>
                <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>
                  Gestão de Ocorrências, classificação por gravidade, SLA de resposta, plano de ação
                </td>
              </tr>
              <tr>
                <td className="border p-2 font-semibold" style={{ borderColor: theme.cardBorder, color: theme.text }}>4.3</td>
                <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>Análise de acidentes e incidentes</td>
                <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>
                  Análise de causa raiz (5 Porquês, Ishikawa), plano 5W2H, registro de lições aprendidas
                </td>
              </tr>
            </tbody>
          </table>
        </section>

        {/* 5. Macroprocesso DETALHADO */}
        <section className="print-page-break">
          <h3 className="text-lg font-bold mb-3" style={{ color: theme.text }}>5. MACROPROCESSO DE TRANSPORTE (ISO 9001 - 4.4)</h3>
          <div className="space-y-4">
            <div>
              <h4 className="font-bold text-base mb-3 px-3 py-2 border-l-4" style={{ color: theme.text, borderColor: theme.accentBlue, backgroundColor: theme.headerBg }}>
                5.1 PLANEJAMENTO (ISO 9001:2015 - 8.1)
              </h4>
              <table className="w-full text-xs border mt-2" style={{ borderColor: theme.cardBorder }}>
                <thead>
                  <tr style={{ backgroundColor: isDark ? '#0f172a' : '#f9fafb' }}>
                    <th className="border p-2 text-left" style={{ borderColor: theme.cardBorder, color: theme.text }}>Atividade</th>
                    <th className="border p-2 text-left w-32" style={{ borderColor: theme.cardBorder, color: theme.text }}>Responsável</th>
                    <th className="border p-2 text-left w-24" style={{ borderColor: theme.cardBorder, color: theme.text }}>IT Referência</th>
                    <th className="border p-2 text-left" style={{ borderColor: theme.cardBorder, color: theme.text }}>Saídas/Registros</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>
                      Recepção de solicitação de transporte
                    </td>
                    <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>Comercial</td>
                    <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>-</td>
                    <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>
                      Email, contato telefônico, solicitação B2B
                    </td>
                  </tr>
                  <tr>
                    <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>
                      Análise de viabilidade técnica e comercial
                    </td>
                    <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>Coord. Operações</td>
                    <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>IT-LOG-001</td>
                    <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>
                      Checklist de viabilidade, análise de capacidade
                    </td>
                  </tr>
                  <tr>
                    <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>
                      Precificação (tonelada ou viagem fechada)
                    </td>
                    <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>Ger. Comercial</td>
                    <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>-</td>
                    <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>
                      Proposta comercial, tabela de frete
                    </td>
                  </tr>
                  <tr>
                    <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>
                      Aprovação comercial (se valor fora da tabela)
                    </td>
                    <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>Diretor Comercial</td>
                    <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>-</td>
                    <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>
                      Email de aprovação
                    </td>
                  </tr>
                  <tr>
                    <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>
                      Criação de Ordem de Carregamento no sistema
                    </td>
                    <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>Operador Logístico</td>
                    <td className="border p-2 font-semibold text-blue-600" style={{ borderColor: theme.cardBorder }}>IT-LOG-001</td>
                    <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>
                      Ordem registrada (nº único), FR-LOG-001
                    </td>
                  </tr>
                  <tr>
                    <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>
                      Seleção e alocação de recursos (motorista/veículo)
                    </td>
                    <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>Coord. Expedição</td>
                    <td className="border p-2 font-semibold text-blue-600" style={{ borderColor: theme.cardBorder }}>IT-LOG-001</td>
                    <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>
                      Ordem alocada, validações ANTT/CNH
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div>
              <h4 className="font-bold text-base mb-3 px-3 py-2 border-l-4" style={{ color: theme.text, borderColor: theme.accentBlue, backgroundColor: theme.headerBg }}>
                5.2 EXECUÇÃO (ISO 9001:2015 - 8.5)
              </h4>
              <table className="w-full text-xs border mt-2" style={{ borderColor: theme.cardBorder }}>
                <thead>
                  <tr style={{ backgroundColor: isDark ? '#0f172a' : '#f9fafb' }}>
                    <th className="border p-2 text-left" style={{ borderColor: theme.cardBorder, color: theme.text }}>Atividade</th>
                    <th className="border p-2 text-left w-32" style={{ borderColor: theme.cardBorder, color: theme.text }}>Responsável</th>
                    <th className="border p-2 text-left w-24" style={{ borderColor: theme.cardBorder, color: theme.text }}>IT Referência</th>
                    <th className="border p-2 text-left" style={{ borderColor: theme.cardBorder, color: theme.text }}>Saídas/Registros</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>
                      Agendamento de carregamento (data/hora)
                    </td>
                    <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>Operador/Expedição</td>
                    <td className="border p-2 font-semibold text-blue-600" style={{ borderColor: theme.cardBorder }}>IT-LOG-002</td>
                    <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>
                      carregamento_agendamento_data
                    </td>
                  </tr>
                  <tr>
                    <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>
                      Execução das etapas do fluxo BPMN customizado
                    </td>
                    <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>Conforme RACI da etapa</td>
                    <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>Fluxo</td>
                    <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>
                      OrdemEtapa, campos customizados preenchidos
                    </td>
                  </tr>
                  <tr>
                    <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>
                      Liberação do veículo para viagem
                    </td>
                    <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>Conferente</td>
                    <td className="border p-2 font-semibold text-blue-600" style={{ borderColor: theme.cardBorder }}>IT-LOG-002</td>
                    <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>
                      Checklist veicular, teste bafômetro, espelhamento
                    </td>
                  </tr>
                  <tr>
                    <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>
                      Atualização de tracking durante transporte
                    </td>
                    <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>Operador/Motorista</td>
                    <td className="border p-2 font-semibold text-blue-600" style={{ borderColor: theme.cardBorder }}>IT-LOG-002</td>
                    <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>
                      10 status de tracking, timestamps, localização
                    </td>
                  </tr>
                  <tr>
                    <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>
                      Comprovação de descarga e entrega
                    </td>
                    <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>Motorista</td>
                    <td className="border p-2 font-semibold text-blue-600" style={{ borderColor: theme.cardBorder }}>IT-LOG-002</td>
                    <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>
                      Comprovante de entrega (PDF/foto), assinatura
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div>
              <h4 className="font-bold text-base mb-3 px-3 py-2 border-l-4" style={{ color: theme.text, borderColor: theme.accentBlue, backgroundColor: theme.headerBg }}>
                5.3 MONITORAMENTO E MEDIÇÃO (ISO 9001:2015 - 9.1)
              </h4>
              <table className="w-full text-xs border mt-2" style={{ borderColor: theme.cardBorder }}>
                <thead>
                  <tr style={{ backgroundColor: isDark ? '#0f172a' : '#f9fafb' }}>
                    <th className="border p-2 text-left" style={{ borderColor: theme.cardBorder, color: theme.text }}>O que Monitorar</th>
                    <th className="border p-2 text-left w-32" style={{ borderColor: theme.cardBorder, color: theme.text }}>Responsável</th>
                    <th className="border p-2 text-left w-24" style={{ borderColor: theme.cardBorder, color: theme.text }}>Frequência</th>
                    <th className="border p-2 text-left" style={{ borderColor: theme.cardBorder, color: theme.text }}>Ferramenta</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>
                      SLA de carregamento e descarga (tempo real)
                    </td>
                    <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>Coord. Operações</td>
                    <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>Contínua</td>
                    <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>
                      Dashboard → Cards SLA, Tracking → Alertas
                    </td>
                  </tr>
                  <tr>
                    <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>
                      Taxa de alocação, acuracidade de dados
                    </td>
                    <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>Gestor Operações</td>
                    <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>Diária</td>
                    <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>
                      Dashboard → Métricas operacionais
                    </td>
                  </tr>
                  <tr>
                    <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>
                      Ocorrências abertas/resolvidas, taxa de resolução
                    </td>
                    <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>Gestor Qualidade</td>
                    <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>Semanal</td>
                    <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>
                      Ocorrências → Dashboard, gráficos Pareto
                    </td>
                  </tr>
                  <tr>
                    <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>
                      Auditoria interna de processos
                    </td>
                    <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>Auditor Interno</td>
                    <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>Semestral</td>
                    <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>
                      Checklist de auditoria, relatório de auditoria
                    </td>
                  </tr>
                  <tr>
                    <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>
                      Análise crítica pela direção
                    </td>
                    <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>Diretor Executivo</td>
                    <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>Trimestral</td>
                    <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>
                      Ata de reunião, plano de ação estratégico
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div>
              <h4 className="font-bold text-base mb-3 px-3 py-2 border-l-4" style={{ color: theme.text, borderColor: theme.accentBlue, backgroundColor: theme.headerBg }}>
                5.4 NÃO CONFORMIDADE E AÇÃO CORRETIVA (ISO 9001:2015 - 10.2)
              </h4>
              <div className="text-sm space-y-2" style={{ color: theme.textMuted }}>
                <p>Metodologia sistemática para tratamento de não conformidades:</p>
                <ol className="ml-6 list-decimal space-y-2 text-xs">
                  <li>
                    <strong>Identificação:</strong> Detecção da não conformidade (registro de ocorrência categoria tracking/fluxo)
                  </li>
                  <li>
                    <strong>Contenção:</strong> Ação imediata para minimizar impacto (comunicação cliente, replanejar rota)
                  </li>
                  <li>
                    <strong>Análise de Causa Raiz:</strong> Aplicar ferramentas (5 Porquês, Ishikawa, Análise de Processo)
                  </li>
                  <li>
                    <strong>Definição de Ação Corretiva:</strong> Plano 5W2H documentado (What, Why, Who, When, Where, How, How Much)
                  </li>
                  <li>
                    <strong>Implementação:</strong> Executar ação conforme planejado
                  </li>
                  <li>
                    <strong>Verificação de Eficácia:</strong> Após período definido, verificar se NC não se repetiu
                  </li>
                  <li>
                    <strong>Atualização de Procedimentos:</strong> Se necessário, revisar PO/IT para prevenir recorrência
                  </li>
                </ol>
              </div>
            </div>
          </div>
        </section>

        {/* 6. Indicadores */}
        <section>
          <h3 className="text-lg font-bold mb-3" style={{ color: theme.text }}>6. INDICADORES DE DESEMPENHO (ISO 9001 - 9.1.1)</h3>
          <table className="w-full text-xs border" style={{ borderColor: theme.cardBorder }}>
            <thead style={{ backgroundColor: isDark ? '#0f172a' : '#f3f4f6' }}>
              <tr>
                <th className="border p-2 text-left" style={{ borderColor: theme.cardBorder, color: theme.text }}>Indicador (KPI)</th>
                <th className="border p-2 text-left" style={{ borderColor: theme.cardBorder, color: theme.text }}>Fórmula de Cálculo</th>
                <th className="border p-2 text-left w-16" style={{ borderColor: theme.cardBorder, color: theme.text }}>Meta</th>
                <th className="border p-2 text-left w-20" style={{ borderColor: theme.cardBorder, color: theme.text }}>Freq.</th>
                <th className="border p-2 text-left" style={{ borderColor: theme.cardBorder, color: theme.text }}>Responsável</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border p-2 font-semibold" style={{ borderColor: theme.cardBorder, color: theme.text }}>
                  SLA Carregamento
                </td>
                <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>
                  (Carregamentos no prazo / Total de carregamentos) × 100
                </td>
                <td className="border p-2 font-bold text-green-600" style={{ borderColor: theme.cardBorder }}>
                  ≥ 95%
                </td>
                <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>Diária</td>
                <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>Coord. Operações</td>
              </tr>
              <tr>
                <td className="border p-2 font-semibold" style={{ borderColor: theme.cardBorder, color: theme.text }}>
                  SLA Descarga
                </td>
                <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>
                  (Descargas no prazo / Total de descargas) × 100
                </td>
                <td className="border p-2 font-bold text-green-600" style={{ borderColor: theme.cardBorder }}>
                  ≥ 95%
                </td>
                <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>Diária</td>
                <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>Coord. Operações</td>
              </tr>
              <tr>
                <td className="border p-2 font-semibold" style={{ borderColor: theme.cardBorder, color: theme.text }}>
                  Taxa de Alocação
                </td>
                <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>
                  (Ordens Alocadas / Total de Ordens) × 100
                </td>
                <td className="border p-2 font-bold text-green-600" style={{ borderColor: theme.cardBorder }}>
                  ≥ 90%
                </td>
                <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>Semanal</td>
                <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>Gestor Operações</td>
              </tr>
              <tr>
                <td className="border p-2 font-semibold" style={{ borderColor: theme.cardBorder, color: theme.text }}>
                  Resolução de Ocorrências no Prazo
                </td>
                <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>
                  (Ocorrências resolvidas no prazo SLA / Total de ocorrências) × 100
                </td>
                <td className="border p-2 font-bold text-green-600" style={{ borderColor: theme.cardBorder }}>
                  ≥ 92%
                </td>
                <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>Semanal</td>
                <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>Gestor Qualidade</td>
              </tr>
              <tr>
                <td className="border p-2 font-semibold" style={{ borderColor: theme.cardBorder, color: theme.text }}>
                  Acuracidade de Dados
                </td>
                <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>
                  (Ordens sem necessidade de correção / Total de Ordens) × 100
                </td>
                <td className="border p-2 font-bold text-green-600" style={{ borderColor: theme.cardBorder }}>
                  ≥ 98%
                </td>
                <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>Mensal</td>
                <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>Gestor Operações</td>
              </tr>
              <tr>
                <td className="border p-2 font-semibold" style={{ borderColor: theme.cardBorder, color: theme.text }}>
                  Satisfação do Cliente (NPS)
                </td>
                <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>
                  Pesquisa de satisfação via SAC
                </td>
                <td className="border p-2 font-bold text-green-600" style={{ borderColor: theme.cardBorder }}>
                  ≥ 8.0
                </td>
                <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>Mensal</td>
                <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>Ger. Comercial</td>
              </tr>
              <tr>
                <td className="border p-2 font-semibold" style={{ borderColor: theme.cardBorder, color: theme.text }}>
                  Tempo Médio de Transporte
                </td>
                <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>
                  Média de (data_descarga - data_carregamento) por operação
                </td>
                <td className="border p-2 font-bold text-blue-600" style={{ borderColor: theme.cardBorder }}>
                  Por oper.
                </td>
                <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>Mensal</td>
                <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>Coord. Operações</td>
              </tr>
            </tbody>
          </table>
        </section>

        {/* 7. Gestão de Riscos */}
        <section>
          <h3 className="text-lg font-bold mb-3" style={{ color: theme.text }}>7. GESTÃO DE RISCOS (ISO 31000 / SASSMAQ 4.2)</h3>
          <table className="w-full text-xs border" style={{ borderColor: theme.cardBorder }}>
            <thead style={{ backgroundColor: isDark ? '#0f172a' : '#f3f4f6' }}>
              <tr>
                <th className="border p-2 text-left" style={{ borderColor: theme.cardBorder, color: theme.text }}>Risco Identificado</th>
                <th className="border p-2 text-left w-20" style={{ borderColor: theme.cardBorder, color: theme.text }}>Prob.</th>
                <th className="border p-2 text-left w-20" style={{ borderColor: theme.cardBorder, color: theme.text }}>Impacto</th>
                <th className="border p-2 text-left" style={{ borderColor: theme.cardBorder, color: theme.text }}>Controle Preventivo</th>
                <th className="border p-2 text-left" style={{ borderColor: theme.cardBorder, color: theme.text }}>Plano de Contingência</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>
                  Atraso carregamento
                </td>
                <td className="border p-2 text-center" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>Média</td>
                <td className="border p-2 text-center text-orange-600" style={{ borderColor: theme.cardBorder }}>Alto</td>
                <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>
                  Agendamento obrigatório + tolerância + alertas automáticos
                </td>
                <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>
                  IT-LOG-003 (ocorrência) + avaliação diária + comunicação cliente
                </td>
              </tr>
              <tr>
                <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>
                  Falta de veículo adequado
                </td>
                <td className="border p-2 text-center" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>Baixa</td>
                <td className="border p-2 text-center text-orange-600" style={{ borderColor: theme.cardBorder }}>Alto</td>
                <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>
                  Pool de parceiros cadastrados + ofertas públicas + frota reserva
                </td>
                <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>
                  Negociação express com agregados + frete spot
                </td>
              </tr>
              <tr>
                <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>
                  Avaria de carga
                </td>
                <td className="border p-2 text-center" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>Baixa</td>
                <td className="border p-2 text-center text-red-600" style={{ borderColor: theme.cardBorder }}>Crítico</td>
                <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>
                  Seguro obrigatório (RCTR-C) + vistoria pré-viagem + treinamento
                </td>
                <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>
                  Abertura sinistro + RNC + análise causa + ação preventiva
                </td>
              </tr>
              <tr>
                <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>
                  Dados incorretos/incompletos
                </td>
                <td className="border p-2 text-center" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>Média</td>
                <td className="border p-2 text-center text-yellow-600" style={{ borderColor: theme.cardBorder }}>Médio</td>
                <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>
                  Validação automática + campos obrigatórios + dupla checagem
                </td>
                <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>
                  Correção imediata + treinamento do operador + auditoria interna
                </td>
              </tr>
              <tr>
                <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>
                  Acidente rodoviário
                </td>
                <td className="border p-2 text-center" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>Baixa</td>
                <td className="border p-2 text-center text-red-600" style={{ borderColor: theme.cardBorder }}>Crítico</td>
                <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>
                  Treinamento MOPP + check-list veicular + controle de jornada
                </td>
                <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>
                  Protocolo de emergência + investigação + ação preventiva + revisão
                </td>
              </tr>
              <tr>
                <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>
                  Vazamento de dados (LGPD)
                </td>
                <td className="border p-2 text-center" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>Baixa</td>
                <td className="border p-2 text-center text-red-600" style={{ borderColor: theme.cardBorder }}>Crítico</td>
                <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>
                  Criptografia (TLS/AES-256) + controle acesso (RBAC) + logs auditoria
                </td>
                <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>
                  Notificar ANPD + investigação + reforço segurança
                </td>
              </tr>
            </tbody>
          </table>
        </section>

        {/* 8. Melhoria Contínua */}
        <section className="print-page-break">
          <h3 className="text-lg font-bold mb-3" style={{ color: theme.text }}>8. MELHORIA CONTÍNUA (ISO 9001:2015 - 10.3)</h3>
          <div className="text-sm space-y-3" style={{ color: theme.textMuted }}>
            <div>
              <p className="font-semibold mb-2" style={{ color: theme.text }}>8.1 Ciclo PDCA Aplicado ao Processo:</p>
              <table className="w-full text-xs border" style={{ borderColor: theme.cardBorder }}>
                <tbody>
                  <tr>
                    <td className="border p-2 font-bold bg-blue-50 dark:bg-blue-900/20 w-24" style={{ borderColor: theme.cardBorder, color: theme.text }}>
                      PLAN<br/>(Planejar)
                    </td>
                    <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>
                      • Definir operação com SLA, tolerância, prazo de entrega<br/>
                      • Configurar workflow (etapas, responsáveis, prazos)<br/>
                      • Alocar recursos adequados (motorista qualificado, veículo regular ANTT)<br/>
                      • Documentar rota e instruções especiais
                    </td>
                  </tr>
                  <tr>
                    <td className="border p-2 font-bold bg-green-50 dark:bg-green-900/20" style={{ borderColor: theme.cardBorder, color: theme.text }}>
                      DO<br/>(Executar)
                    </td>
                    <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>
                      • Executar ordem conforme planejado (IT-LOG-001, IT-LOG-002)<br/>
                      • Atualizar status em tempo real<br/>
                      • Comunicar partes interessadas<br/>
                      • Registrar evidências (fotos, documentos, comprovantes)
                    </td>
                  </tr>
                  <tr>
                    <td className="border p-2 font-bold bg-yellow-50 dark:bg-yellow-900/20" style={{ borderColor: theme.cardBorder, color: theme.text }}>
                      CHECK<br/>(Verificar)
                    </td>
                    <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>
                      • Monitorar indicadores (Dashboard)<br/>
                      • Identificar desvios de SLA<br/>
                      • Registrar ocorrências (IT-LOG-003)<br/>
                      • Analisar tendências e padrões
                    </td>
                  </tr>
                  <tr>
                    <td className="border p-2 font-bold bg-red-50 dark:bg-red-900/20" style={{ borderColor: theme.cardBorder, color: theme.text }}>
                      ACT<br/>(Agir)
                    </td>
                    <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>
                      • Implementar ações corretivas (10.2)<br/>
                      • Implementar ações preventivas<br/>
                      • Atualizar procedimentos se necessário<br/>
                      • Treinar equipe em novos processos
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div>
              <p className="font-semibold mb-2" style={{ color: theme.text }}>8.2 Reuniões de Gestão (Obrigatórias):</p>
              <table className="w-full text-xs border" style={{ borderColor: theme.cardBorder }}>
                <thead style={{ backgroundColor: isDark ? '#0f172a' : '#f3f4f6' }}>
                  <tr>
                    <th className="border p-2 text-left" style={{ borderColor: theme.cardBorder, color: theme.text }}>Reunião</th>
                    <th className="border p-2 text-left" style={{ borderColor: theme.cardBorder, color: theme.text }}>Frequência</th>
                    <th className="border p-2 text-left" style={{ borderColor: theme.cardBorder, color: theme.text }}>Participantes</th>
                    <th className="border p-2 text-left" style={{ borderColor: theme.cardBorder, color: theme.text }}>Pauta Principal</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border p-2 font-semibold" style={{ borderColor: theme.cardBorder, color: theme.text }}>Daily Meeting</td>
                    <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>Diária (15 min)</td>
                    <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>Operadores, Coordenador</td>
                    <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>
                      Ordens críticas do dia, alertas de SLA, recursos disponíveis
                    </td>
                  </tr>
                  <tr>
                    <td className="border p-2 font-semibold" style={{ borderColor: theme.cardBorder, color: theme.text }}>Análise Operacional</td>
                    <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>Semanal (1h)</td>
                    <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>Coordenadores, Gestores</td>
                    <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>
                      KPIs da semana, ocorrências abertas, ações corretivas em andamento
                    </td>
                  </tr>
                  <tr>
                    <td className="border p-2 font-semibold" style={{ borderColor: theme.cardBorder, color: theme.text }}>Retrospectiva Mensal</td>
                    <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>Mensal (2h)</td>
                    <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>Toda equipe operacional</td>
                    <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>
                      Consolidação mensal, problemas recorrentes, plano de melhorias
                    </td>
                  </tr>
                  <tr>
                    <td className="border p-2 font-semibold" style={{ borderColor: theme.cardBorder, color: theme.text }}>Análise Crítica Direção</td>
                    <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>Trimestral (4h)</td>
                    <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>Diretoria, Gestores</td>
                    <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>
                      Desempenho SGQ, resultados auditorias, plano estratégico
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div>
              <p className="font-semibold mb-2" style={{ color: theme.text }}>8.3 Ferramentas de Análise e Melhoria:</p>
              <div className="grid grid-cols-2 gap-3">
                <Card style={{ backgroundColor: isDark ? '#0f172a' : '#ffffff', borderColor: theme.cardBorder }}>
                  <CardContent className="p-3">
                    <p className="font-semibold text-xs mb-1" style={{ color: theme.text }}>5 Porquês</p>
                    <p className="text-[10px]" style={{ color: theme.textMuted }}>
                      Análise superficial de causa raiz - perguntar "por quê?" 5 vezes consecutivas
                    </p>
                  </CardContent>
                </Card>
                <Card style={{ backgroundColor: isDark ? '#0f172a' : '#ffffff', borderColor: theme.cardBorder }}>
                  <CardContent className="p-3">
                    <p className="font-semibold text-xs mb-1" style={{ color: theme.text }}>Diagrama Ishikawa</p>
                    <p className="text-[10px]" style={{ color: theme.textMuted }}>
                      Espinha de peixe - 6M (Método, Material, Mão-obra, Máquina, Medida, Meio Ambiente)
                    </p>
                  </CardContent>
                </Card>
                <Card style={{ backgroundColor: isDark ? '#0f172a' : '#ffffff', borderColor: theme.cardBorder }}>
                  <CardContent className="p-3">
                    <p className="font-semibold text-xs mb-1" style={{ color: theme.text }}>Plano 5W2H</p>
                    <p className="text-[10px]" style={{ color: theme.textMuted }}>
                      Plano de ação estruturado (What, Why, Who, When, Where, How, How Much)
                    </p>
                  </CardContent>
                </Card>
                <Card style={{ backgroundColor: isDark ? '#0f172a' : '#ffffff', borderColor: theme.cardBorder }}>
                  <CardContent className="p-3">
                    <p className="font-semibold text-xs mb-1" style={{ color: theme.text }}>Gráfico de Pareto</p>
                    <p className="text-[10px]" style={{ color: theme.textMuted }}>
                      Priorização 80/20 - focar nos 20% de causas que geram 80% dos problemas
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* 9. Controle de Registros */}
        <section>
          <h3 className="text-lg font-bold mb-3" style={{ color: theme.text }}>9. CONTROLE DE REGISTROS (ISO 9001:2015 - 7.5.3)</h3>
          <table className="w-full text-xs border" style={{ borderColor: theme.cardBorder }}>
            <thead style={{ backgroundColor: isDark ? '#0f172a' : '#f3f4f6' }}>
              <tr>
                <th className="border p-2 text-left" style={{ borderColor: theme.cardBorder, color: theme.text }}>Tipo de Registro</th>
                <th className="border p-2 text-left" style={{ borderColor: theme.cardBorder, color: theme.text }}>Forma de Armazenamento</th>
                <th className="border p-2 text-left w-24" style={{ borderColor: theme.cardBorder, color: theme.text }}>Retenção</th>
                <th className="border p-2 text-left" style={{ borderColor: theme.cardBorder, color: theme.text }}>Backup/Segurança</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border p-2 font-semibold" style={{ borderColor: theme.cardBorder, color: theme.text }}>
                  Ordens de Carregamento
                </td>
                <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>
                  Banco de dados relacional (PostgreSQL) criptografado
                </td>
                <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>5 anos</td>
                <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>
                  Backup automático diário + redundância geográfica
                </td>
              </tr>
              <tr>
                <td className="border p-2 font-semibold" style={{ borderColor: theme.cardBorder, color: theme.text }}>
                  Notas Fiscais (XML)
                </td>
                <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>
                  Object Storage em nuvem (AWS S3 / Google Cloud)
                </td>
                <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>5 anos</td>
                <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>
                  Versionamento + replicação multi-região
                </td>
              </tr>
              <tr>
                <td className="border p-2 font-semibold" style={{ borderColor: theme.cardBorder, color: theme.text }}>
                  Comprovantes de Entrega
                </td>
                <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>
                  Object Storage em nuvem
                </td>
                <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>5 anos</td>
                <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>
                  Redundância geográfica + controle de acesso
                </td>
              </tr>
              <tr>
                <td className="border p-2 font-semibold" style={{ borderColor: theme.cardBorder, color: theme.text }}>
                  Ocorrências e RNCs
                </td>
                <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>
                  Banco de dados relacional criptografado
                </td>
                <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>10 anos</td>
                <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>
                  Backup diário + imutabilidade (WORM)
                </td>
              </tr>
              <tr>
                <td className="border p-2 font-semibold" style={{ borderColor: theme.cardBorder, color: theme.text }}>
                  Logs de Auditoria
                </td>
                <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>
                  Banco de dados append-only (não editável)
                </td>
                <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>3 anos</td>
                <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>
                  Cópia incremental contínua
                </td>
              </tr>
              <tr>
                <td className="border p-2 font-semibold" style={{ borderColor: theme.cardBorder, color: theme.text }}>
                  Documentos SGQ (PO/IT)
                </td>
                <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>
                  Módulo Procedimentos (versionamento)
                </td>
                <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>Permanente</td>
                <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>
                  Controle de revisão, histórico completo
                </td>
              </tr>
            </tbody>
          </table>
        </section>

        {/* 10. Segurança da Informação */}
        <section>
          <h3 className="text-lg font-bold mb-3" style={{ color: theme.text }}>10. SEGURANÇA DA INFORMAÇÃO (SASSMAQ 1.3 / LGPD)</h3>
          <div className="text-sm space-y-3" style={{ color: theme.textMuted }}>
            <div>
              <p className="font-semibold mb-2" style={{ color: theme.text }}>10.1 Controles Técnicos Implementados:</p>
              <ul className="list-disc ml-6 space-y-1 text-xs">
                <li><strong>Autenticação:</strong> Obrigatória via email + senha (mín 8 caracteres)</li>
                <li><strong>Autorização (RBAC):</strong> Controle de acesso baseado em perfis (Admin, Operador, Fornecedor, Cliente)</li>
                <li><strong>Criptografia em Trânsito:</strong> HTTPS/TLS 1.3 em todas as comunicações</li>
                <li><strong>Criptografia em Repouso:</strong> AES-256 para dados sensíveis (CNPJ, CPF, valores comerciais)</li>
                <li><strong>Logs de Auditoria:</strong> Registro de TODAS operações (quem, quando, o quê, IP origem)</li>
                <li><strong>Backup Automático:</strong> Diário com retenção de 30 dias (rotação)</li>
                <li><strong>Recuperação de Desastres:</strong> RTO 4h, RPO 1h (tempo/perda máxima aceitável)</li>
              </ul>
            </div>

            <div>
              <p className="font-semibold mb-2" style={{ color: theme.text }}>10.2 Rastreabilidade de Alterações (ISO 9001 - 7.5.3.2):</p>
              <p className="ml-4 text-xs">
                Todas as modificações em registros críticos são automaticamente logadas com:
              </p>
              <ul className="list-disc ml-10 space-y-1 text-xs">
                <li>Timestamp UTC preciso</li>
                <li>Usuário responsável (email)</li>
                <li>Valores anteriores e novos</li>
                <li>IP de origem da requisição</li>
                <li>Tipo de operação (CREATE, UPDATE, DELETE)</li>
              </ul>
            </div>

            <div>
              <p className="font-semibold mb-2" style={{ color: theme.text }}>10.3 Conformidade LGPD (Lei 13.709/2018):</p>
              <ul className="list-disc ml-6 space-y-1 text-xs">
                <li>Consentimento explícito no cadastro de usuários</li>
                <li>Direito ao esquecimento (anonimização após exclusão)</li>
                <li>Portabilidade de dados (exportação em formato padrão)</li>
                <li>DPO designado: dpo@empresa.com.br</li>
              </ul>
            </div>
          </div>
        </section>

        {/* 11. Competência e Treinamento */}
        <section>
          <h3 className="text-lg font-bold mb-3" style={{ color: theme.text }}>11. COMPETÊNCIA E TREINAMENTO (ISO 9001 - 7.2)</h3>
          <table className="w-full text-xs border" style={{ borderColor: theme.cardBorder }}>
            <thead style={{ backgroundColor: isDark ? '#0f172a' : '#f3f4f6' }}>
              <tr>
                <th className="border p-2 text-left" style={{ borderColor: theme.cardBorder, color: theme.text }}>Função</th>
                <th className="border p-2 text-left" style={{ borderColor: theme.cardBorder, color: theme.text }}>Competências Requeridas</th>
                <th className="border p-2 text-left" style={{ borderColor: theme.cardBorder, color: theme.text }}>Treinamento Obrigatório</th>
                <th className="border p-2 text-left w-20" style={{ borderColor: theme.cardBorder, color: theme.text }}>Periodicidade</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border p-2 font-semibold" style={{ borderColor: theme.cardBorder, color: theme.text }}>Operador Logístico</td>
                <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>
                  Conhecimento de transportes, legislação ANTT, uso do sistema
                </td>
                <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>
                  Onboarding sistema (8h), IT-LOG-001, IT-LOG-002
                </td>
                <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>Admissão</td>
              </tr>
              <tr>
                <td className="border p-2 font-semibold" style={{ borderColor: theme.cardBorder, color: theme.text }}>Coordenador Operações</td>
                <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>
                  Gestão de equipes, análise de KPIs, tomada de decisão
                </td>
                <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>
                  Gestão logística avançada, ISO 9001, SASSMAQ
                </td>
                <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>Anual</td>
              </tr>
              <tr>
                <td className="border p-2 font-semibold" style={{ borderColor: theme.cardBorder, color: theme.text }}>Motorista</td>
                <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>
                  CNH categoria adequada, MOPP (se carga perigosa), direção defensiva
                </td>
                <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>
                  Uso do App Motorista, preenchimento documentos
                </td>
                <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>Admissão</td>
              </tr>
              <tr>
                <td className="border p-2 font-semibold" style={{ borderColor: theme.cardBorder, color: theme.text }}>Gestor Qualidade</td>
                <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>
                  ISO 9001, ferramentas de análise, auditoria interna
                </td>
                <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>
                  Formação Auditor Interno ISO 9001 (40h)
                </td>
                <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>Bienal</td>
              </tr>
            </tbody>
          </table>
        </section>

        {/* 12. Comunicação */}
        <section>
          <h3 className="text-lg font-bold mb-3" style={{ color: theme.text }}>12. COMUNICAÇÃO (ISO 9001 - 7.4)</h3>
          <div className="text-sm space-y-2" style={{ color: theme.textMuted }}>
            <p className="font-semibold">Canais de comunicação estabelecidos:</p>
            <table className="w-full text-xs border mt-2" style={{ borderColor: theme.cardBorder }}>
              <tbody>
                <tr>
                  <td className="border p-2 font-semibold w-40" style={{ borderColor: theme.cardBorder, color: theme.text }}>Operador ↔ Motorista</td>
                  <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>
                    WhatsApp via sistema, SMS (App Motorista), ligação telefônica
                  </td>
                </tr>
                <tr>
                  <td className="border p-2 font-semibold" style={{ borderColor: theme.cardBorder, color: theme.text }}>Operador ↔ Cliente</td>
                  <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>
                    Email, telefone, portal B2B (acesso direto a ordens)
                  </td>
                </tr>
                <tr>
                  <td className="border p-2 font-semibold" style={{ borderColor: theme.cardBorder, color: theme.text }}>Cliente ↔ SAC</td>
                  <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>
                    Chatbot IA 24/7 (consulta status, documentos, prazos)
                  </td>
                </tr>
                <tr>
                  <td className="border p-2 font-semibold" style={{ borderColor: theme.cardBorder, color: theme.text }}>Equipe Interna</td>
                  <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>
                    Notificações push no sistema, email, reuniões periódicas
                  </td>
                </tr>
                <tr>
                  <td className="border p-2 font-semibold" style={{ borderColor: theme.cardBorder, color: theme.text }}>Emergências</td>
                  <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>
                    Telefone 24h, WhatsApp, sistema de ocorrências (gravidade crítica)
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* 13. Análise Crítica e Revisão */}
        <section>
          <h3 className="text-lg font-bold mb-3" style={{ color: theme.text }}>13. ANÁLISE CRÍTICA E REVISÃO DO PROCEDIMENTO</h3>
          <div className="text-sm space-y-2" style={{ color: theme.textMuted }}>
            <p>Este procedimento operacional deve ser analisado criticamente e revisado nas seguintes situações:</p>
            <ul className="list-disc ml-6 space-y-1 text-xs">
              <li><strong>Periodicamente:</strong> No mínimo anualmente (próxima revisão: 09/12/2025)</li>
              <li><strong>Mudanças Legislativas:</strong> Alterações em ANTT, CONTRAN, leis de transporte</li>
              <li><strong>Mudanças Normativas:</strong> Nova versão da ISO 9001 ou SASSMAQ</li>
              <li><strong>Após Não Conformidades Graves:</strong> Acidentes, multas, perda de certificação</li>
              <li><strong>Baixo Desempenho:</strong> Indicadores fora da meta por 2 meses consecutivos</li>
              <li><strong>Solicitação da Direção:</strong> Mudança estratégica, auditoria externa</li>
              <li><strong>Melhoria Identificada:</strong> Oportunidade de otimização detectada pela equipe</li>
            </ul>

            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-300 dark:border-yellow-700 rounded p-3 mt-3 text-xs">
              <p className="font-semibold">⚠️ CONTROLE DE REVISÕES:</p>
              <p>
                Toda revisão deve ser documentada na seção 14 (Histórico de Revisões) com: número da revisão, 
                data, descrição da alteração, aprovador. Versões anteriores devem ser arquivadas mas acessíveis 
                para rastreabilidade.
              </p>
            </div>
          </div>
        </section>

        {/* 14. Histórico de Revisões */}
        <section>
          <h3 className="text-lg font-bold mb-3" style={{ color: theme.text }}>14. HISTÓRICO DE REVISÕES</h3>
          <table className="w-full text-xs border" style={{ borderColor: theme.cardBorder }}>
            <thead style={{ backgroundColor: isDark ? '#0f172a' : '#f3f4f6' }}>
              <tr>
                <th className="border p-2 w-16" style={{ borderColor: theme.cardBorder, color: theme.text }}>Rev.</th>
                <th className="border p-2 w-24" style={{ borderColor: theme.cardBorder, color: theme.text }}>Data</th>
                <th className="border p-2 text-left" style={{ borderColor: theme.cardBorder, color: theme.text }}>Descrição da Alteração</th>
                <th className="border p-2 text-left" style={{ borderColor: theme.cardBorder, color: theme.text }}>Seções Afetadas</th>
                <th className="border p-2 w-32" style={{ borderColor: theme.cardBorder, color: theme.text }}>Aprovado por</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border p-2 text-center font-bold" style={{ borderColor: theme.cardBorder, color: theme.text }}>01</td>
                <td className="border p-2 text-center" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>09/12/2024</td>
                <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>
                  Emissão inicial do procedimento
                </td>
                <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>Todas</td>
                <td className="border p-2 text-center" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>Diretor Executivo</td>
              </tr>
            </tbody>
          </table>
        </section>

        {/* 15. Anexos */}
        <section>
          <h3 className="text-lg font-bold mb-3" style={{ color: theme.text }}>15. ANEXOS</h3>
          <div className="space-y-2 text-sm" style={{ color: theme.textMuted }}>
            <p><strong>Anexo A</strong> - Fluxograma do Macroprocesso de Transporte (SIPOC)</p>
            <p><strong>Anexo B</strong> - Matriz de Responsabilidades RACI (por atividade)</p>
            <p><strong>Anexo C</strong> - Tabela de SLA por Tipo de Operação (cadastro padrão)</p>
            <p><strong>Anexo D</strong> - Checklist de Vistoria Pré-Viagem (SASSMAQ 3.1)</p>
            <p><strong>Anexo E</strong> - Matriz de Riscos Atualizada (ISO 31000)</p>
            <p><strong>Anexo F</strong> - Formulário de Análise de Causa Raiz (5 Porquês + Ishikawa)</p>
          </div>
        </section>

        {/* 16. Aprovações */}
        <section>
          <h3 className="text-lg font-bold mb-3" style={{ color: theme.text }}>16. REGISTRO DE APROVAÇÕES</h3>
          <div className="grid grid-cols-3 gap-4 mt-4">
            <div className="text-center">
              <div className="border-t-2 border-black pt-2 mt-12">
                <p className="text-xs font-semibold" style={{ color: theme.text }}>Coordenador de Qualidade</p>
                <p className="text-[10px]" style={{ color: theme.textMuted }}>(Elaboração)</p>
              </div>
            </div>
            <div className="text-center">
              <div className="border-t-2 border-black pt-2 mt-12">
                <p className="text-xs font-semibold" style={{ color: theme.text }}>Diretor de Operações</p>
                <p className="text-[10px]" style={{ color: theme.textMuted }}>(Análise Crítica)</p>
              </div>
            </div>
            <div className="text-center">
              <div className="border-t-2 border-black pt-2 mt-12">
                <p className="text-xs font-semibold" style={{ color: theme.text }}>Diretor Executivo</p>
                <p className="text-[10px]" style={{ color: theme.textMuted }}>(Aprovação Final)</p>
              </div>
            </div>
          </div>
        </section>

        <div className="border-t pt-4 mt-8 text-xs text-center space-y-1" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>
          <p className="font-semibold">Documento controlado eletronicamente</p>
          <p>Versão impressa é cópia não controlada - Consulte sempre a versão digital atualizada</p>
          <p className="mt-2 font-bold">Classificação: USO INTERNO | Distribuição: Controlada</p>
        </div>
      </CardContent>
    </Card>
  );
}

function InstrucaoTracking({ theme, isDark }) {
  return (
    <Card style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}>
      <CardContent className="p-8 space-y-6">
        <div className="border-b pb-6" style={{ borderColor: theme.cardBorder }}>
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h1 className="text-2xl font-bold mb-2" style={{ color: theme.text }}>
                INSTRUÇÃO DE TRABALHO
              </h1>
              <h2 className="text-xl font-semibold mb-1" style={{ color: theme.text }}>
                Tracking e Rastreamento de Cargas
              </h2>
            </div>
            <div className="text-right text-sm" style={{ color: theme.textMuted }}>
              <p className="font-bold">Código: IT-LOG-002</p>
              <p>Revisão: 01</p>
              <p>Data: 09/12/2024</p>
              <p>Páginas: 1/1</p>
            </div>
          </div>
        </div>

        <section>
          <h3 className="text-lg font-bold mb-3" style={{ color: theme.text }}>1. OBJETIVO</h3>
          <p className="text-sm" style={{ color: theme.textMuted }}>
            Padronizar o processo de monitoramento e atualização de status das cargas em trânsito, 
            garantindo rastreabilidade e visibilidade em tempo real para todas as partes interessadas.
          </p>
        </section>

        <section>
          <h3 className="text-lg font-bold mb-3" style={{ color: theme.text }}>2. ACESSO AO SISTEMA</h3>
          <p className="text-sm mb-2" style={{ color: theme.textMuted }}>
            Navegue até: <strong>Operações → Tracking</strong>
          </p>
          <div className="text-sm space-y-1" style={{ color: theme.textMuted }}>
            <p><strong>Visualizações disponíveis:</strong></p>
            <ul className="list-disc list-inside ml-4">
              <li>Tabela completa com todos os campos</li>
              <li>Modo planilha (compacto)</li>
              <li>Filtros por status, operação, período</li>
            </ul>
          </div>
        </section>

        <section>
          <h3 className="text-lg font-bold mb-3" style={{ color: theme.text }}>3. ATUALIZAÇÃO DE STATUS</h3>
          <div className="space-y-4">
            <div>
              <h4 className="font-bold text-sm mb-2" style={{ color: theme.text }}>3.1 Método Principal - Modal de Update</h4>
              <ol className="text-xs space-y-1 ml-6 list-decimal" style={{ color: theme.textMuted }}>
                <li>Localize a ordem na tabela</li>
                <li>Clique no botão de atualização (ícone de edição)</li>
                <li>Selecione o novo status de tracking</li>
                <li>Preencha data/hora do evento (use atalho "Agora" quando aplicável)</li>
                <li>Adicione observações se necessário</li>
                <li>Confirme a atualização</li>
              </ol>
            </div>

            <div>
              <h4 className="font-bold text-sm mb-2" style={{ color: theme.text }}>3.2 Sequência de Status Tracking</h4>
              <div className="space-y-1 text-xs" style={{ color: theme.textMuted }}>
                <p>1️⃣ <strong>Aguardando Agendamento</strong> → Status inicial</p>
                <p>2️⃣ <strong>Carregamento Agendado</strong> → Após agendar data/hora de carregamento</p>
                <p>3️⃣ <strong>Em Carregamento</strong> → Início do carregamento</p>
                <p>4️⃣ <strong>Carregado</strong> → Carregamento concluído</p>
                <p>5️⃣ <strong>Em Viagem</strong> → Veículo em trânsito</p>
                <p>6️⃣ <strong>Chegada ao Destino</strong> → Chegou ao local de descarga</p>
                <p>7️⃣ <strong>Descarga Agendada</strong> → Descarga programada</p>
                <p>8️⃣ <strong>Em Descarga</strong> → Início da descarga</p>
                <p>9️⃣ <strong>Descarga Realizada</strong> → Descarga concluída</p>
                <p>🔟 <strong>Finalizado</strong> → Processo completo</p>
              </div>
            </div>
          </div>
        </section>

        <section>
          <h3 className="text-lg font-bold mb-3" style={{ color: theme.text }}>4. CONTROLE DE SLA</h3>
          <div className="text-sm space-y-2" style={{ color: theme.textMuted }}>
            <p>
              <strong>4.1 Carregamento:</strong> Prazo inicia na data de agendamento. Tolerância definida na Operação.
            </p>
            <p>
              <strong>4.2 Descarga:</strong> Prazo calculado automaticamente (agendamento carregamento + dias da operação) 
              ou data de agendamento de descarga (conforme configuração da operação).
            </p>
            <p>
              <strong>4.3 Expurgo:</strong> Atrasos justificados podem ser expurgados do cálculo de SLA mediante:
            </p>
            <ul className="list-disc list-inside ml-6">
              <li>Justificativa detalhada do motivo</li>
              <li>Upload de evidência (email, autorização do cliente, etc.)</li>
              <li>Aprovação da gestão</li>
            </ul>
          </div>
        </section>

        <section>
          <h3 className="text-lg font-bold mb-3" style={{ color: theme.text }}>5. RASTREABILIDADE</h3>
          <p className="text-sm mb-2" style={{ color: theme.textMuted }}>
            Todos os eventos de tracking são registrados com:
          </p>
          <ul className="list-disc list-inside text-sm space-y-1 ml-4" style={{ color: theme.textMuted }}>
            <li>Timestamp exato do evento</li>
            <li>Usuário que realizou a atualização</li>
            <li>Dados alterados (histórico mantido)</li>
            <li>Localização (quando disponível via GPS)</li>
          </ul>
        </section>

        <div className="border-t pt-4 mt-8 text-xs text-center" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>
          <p>Documento controlado eletronicamente - Versão impressa é cópia não controlada</p>
        </div>
      </CardContent>
    </Card>
  );
}

function InstrucaoOcorrencias({ theme, isDark }) {
  return (
    <Card style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}>
      <CardContent className="p-8 space-y-6">
        <div className="border-b pb-6" style={{ borderColor: theme.cardBorder }}>
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h1 className="text-2xl font-bold mb-2" style={{ color: theme.text }}>
                INSTRUÇÃO DE TRABALHO
              </h1>
              <h2 className="text-xl font-semibold mb-1" style={{ color: theme.text }}>
                Gestão de Ocorrências e Não Conformidades
              </h2>
            </div>
            <div className="text-right text-sm" style={{ color: theme.textMuted }}>
              <p className="font-bold">Código: IT-LOG-003</p>
              <p>Revisão: 01</p>
              <p>Data: 09/12/2024</p>
              <p>Páginas: 1/2</p>
            </div>
          </div>
        </div>

        <section>
          <h3 className="text-lg font-bold mb-3" style={{ color: theme.text }}>1. OBJETIVO</h3>
          <p className="text-sm" style={{ color: theme.textMuted }}>
            Estabelecer metodologia para identificação, registro, tratamento e análise de ocorrências operacionais, 
            visando a melhoria contínua e conformidade com NBR ISO 9001:2015 (item 10.2 - Não conformidade e ação corretiva).
          </p>
        </section>

        <section>
          <h3 className="text-lg font-bold mb-3" style={{ color: theme.text }}>2. CATEGORIAS DE OCORRÊNCIAS</h3>
          <div className="space-y-3">
            <Card style={{ backgroundColor: isDark ? '#0f172a' : '#f9fafb', borderColor: theme.cardBorder }}>
              <CardContent className="p-4">
                <h4 className="font-bold text-sm mb-2" style={{ color: theme.text }}>2.1 Tracking (Viagem)</h4>
                <p className="text-xs" style={{ color: theme.textMuted }}>
                  <strong>Impacto:</strong> Afeta SLA e prazo de entrega.<br/>
                  <strong>Exemplos:</strong> Atraso, quebra de veículo, acidente, bloqueio de rodovia, carga retida.<br/>
                  <strong>Tratamento:</strong> Registrar data início/fim, calcular impacto no prazo, avaliar necessidade de diária.
                </p>
              </CardContent>
            </Card>

            <Card style={{ backgroundColor: isDark ? '#0f172a' : '#f9fafb', borderColor: theme.cardBorder }}>
              <CardContent className="p-4">
                <h4 className="font-bold text-sm mb-2" style={{ color: theme.text }}>2.2 Fluxo (Processos Internos)</h4>
                <p className="text-xs" style={{ color: theme.textMuted }}>
                  <strong>Impacto:</strong> Bloqueia ou atrasa etapas do fluxo operacional.<br/>
                  <strong>Exemplos:</strong> Documentação pendente, erro no cadastro, falta de informação.<br/>
                  <strong>Tratamento:</strong> Atribuir responsável, definir prazo de resolução, desbloquear etapa após resolução.
                </p>
              </CardContent>
            </Card>

            <Card style={{ backgroundColor: isDark ? '#0f172a' : '#f9fafb', borderColor: theme.cardBorder }}>
              <CardContent className="p-4">
                <h4 className="font-bold text-sm mb-2" style={{ color: theme.text }}>2.3 Tarefa</h4>
                <p className="text-xs" style={{ color: theme.textMuted }}>
                  <strong>Impacto:</strong> Não afeta SLA ou prazo de entrega.<br/>
                  <strong>Exemplos:</strong> Atualização de cadastro, envio de documento complementar, follow-up comercial.<br/>
                  <strong>Tratamento:</strong> Registro simples, sem impacto em métricas de performance.
                </p>
              </CardContent>
            </Card>

            <Card style={{ backgroundColor: isDark ? '#0f172a' : '#f9fafb', borderColor: theme.cardBorder }}>
              <CardContent className="p-4">
                <h4 className="font-bold text-sm mb-2" style={{ color: theme.text }}>2.4 Diária</h4>
                <p className="text-xs" style={{ color: theme.textMuted }}>
                  <strong>Impacto:</strong> Gera cobrança adicional ao cliente.<br/>
                  <strong>Exemplos:</strong> Espera superior à tolerância no carregamento ou descarga.<br/>
                  <strong>Tratamento:</strong> Calcular dias/valor de diária, solicitar autorização do cliente, faturar após aprovação.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        <section>
          <h3 className="text-lg font-bold mb-3" style={{ color: theme.text }}>3. PROCEDIMENTO DE REGISTRO</h3>
          <div className="space-y-3">
            <div className="flex gap-3">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">1</div>
              <div>
                <p className="font-semibold text-sm mb-1" style={{ color: theme.text }}>Acessar Módulo</p>
                <p className="text-xs" style={{ color: theme.textMuted }}>Navegue até: <strong>Qualidade → Ocorrências</strong></p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">2</div>
              <div>
                <p className="font-semibold text-sm mb-1" style={{ color: theme.text }}>Informar Dados Obrigatórios</p>
                <ul className="text-xs space-y-1 ml-4 list-disc" style={{ color: theme.textMuted }}>
                  <li>Ordem de Carregamento relacionada (se aplicável)</li>
                  <li>Tipo de Ocorrência (conforme catálogo pré-definido)</li>
                  <li>Categoria (Tracking, Fluxo, Tarefa ou Diária)</li>
                  <li>Data/Hora de Início</li>
                  <li>Descrição detalhada do problema</li>
                  <li>Gravidade (Baixa, Média, Alta, Crítica)</li>
                </ul>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">3</div>
              <div>
                <p className="font-semibold text-sm mb-1" style={{ color: theme.text }}>Sistema Gera Automaticamente</p>
                <ul className="text-xs space-y-1 ml-4 list-disc" style={{ color: theme.textMuted }}>
                  <li>Número do Ticket (formato: AAMMDDHHNN)</li>
                  <li>Prazo de Resolução (baseado no SLA do tipo de ocorrência)</li>
                  <li>Responsável padrão (conforme tipo ou departamento)</li>
                  <li>Notificação por email ao responsável</li>
                </ul>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">4</div>
              <div>
                <p className="font-semibold text-sm mb-1" style={{ color: theme.text }}>Tratamento da Ocorrência</p>
                <ul className="text-xs space-y-1 ml-4 list-disc" style={{ color: theme.textMuted }}>
                  <li>Responsável acessa a ocorrência</li>
                  <li>Preenche campos customizados (conforme tipo)</li>
                  <li>Anexa evidências (fotos, documentos)</li>
                  <li>Informa data/hora de resolução</li>
                  <li>Altera status para "Resolvida"</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section>
          <h3 className="text-lg font-bold mb-3" style={{ color: theme.text }}>4. OCORRÊNCIAS DE DIÁRIA</h3>
          <div className="text-sm space-y-2" style={{ color: theme.textMuted }}>
            <p><strong>4.1 Geração Automática:</strong></p>
            <p className="ml-4">
              O sistema detecta automaticamente quando o tempo entre agendamento e execução (carregamento ou descarga) 
              excede a tolerância configurada na operação, criando ocorrência categoria "Diária".
            </p>
            
            <p><strong>4.2 Fluxo de Aprovação:</strong></p>
            <ol className="list-decimal ml-8 space-y-1">
              <li>Sistema sugere valor de diária baseado na operação</li>
              <li>Gestor revisa e ajusta valor se necessário</li>
              <li>Solicitar autorização do cliente (número da autorização)</li>
              <li>Cliente aprova/abona a cobrança</li>
              <li>Incluir no faturamento quando autorizado</li>
            </ol>
          </div>
        </section>

        <section>
          <h3 className="text-lg font-bold mb-3" style={{ color: theme.text }}>5. NÍVEIS DE GRAVIDADE</h3>
          <table className="w-full text-xs border" style={{ borderColor: theme.cardBorder }}>
            <thead style={{ backgroundColor: isDark ? '#0f172a' : '#f3f4f6' }}>
              <tr>
                <th className="border p-2 text-left" style={{ borderColor: theme.cardBorder, color: theme.text }}>Gravidade</th>
                <th className="border p-2 text-left" style={{ borderColor: theme.cardBorder, color: theme.text }}>Critério</th>
                <th className="border p-2 text-left" style={{ borderColor: theme.cardBorder, color: theme.text }}>Prazo Resposta</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>Baixa</td>
                <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>Sem impacto no prazo ou qualidade</td>
                <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>Até 48h</td>
              </tr>
              <tr>
                <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>Média</td>
                <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>Risco de atraso menor</td>
                <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>Até 24h</td>
              </tr>
              <tr>
                <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>Alta</td>
                <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>Impacto direto no prazo</td>
                <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>Até 8h</td>
              </tr>
              <tr>
                <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>Crítica</td>
                <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>Parada total, risco de multa</td>
                <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>Imediato (2h)</td>
              </tr>
            </tbody>
          </table>
        </section>

        <section>
          <h3 className="text-lg font-bold mb-3" style={{ color: theme.text }}>6. ANÁLISE E PREVENÇÃO</h3>
          <p className="text-sm mb-2" style={{ color: theme.textMuted }}>
            Mensalmente, realizar análise de:
          </p>
          <ul className="list-disc list-inside text-sm space-y-1 ml-4" style={{ color: theme.textMuted }}>
            <li>Tipos de ocorrências mais frequentes</li>
            <li>Departamentos/usuários com maior incidência</li>
            <li>Impacto acumulado no SLA</li>
            <li>Eficácia das ações corretivas implementadas</li>
            <li>Oportunidades de ação preventiva</li>
          </ul>
        </section>

        <div className="border-t pt-4 mt-8 text-xs text-center" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>
          <p>Documento controlado eletronicamente - Versão impressa é cópia não controlada</p>
        </div>
      </CardContent>
    </Card>
  );
}

function FormularioOrdemCarregamento({ theme, isDark }) {
  return (
    <Card style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}>
      <CardContent className="p-8 space-y-6">
        <div className="border-b pb-6" style={{ borderColor: theme.cardBorder }}>
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h1 className="text-2xl font-bold mb-2" style={{ color: theme.text }}>
                FORMULÁRIO
              </h1>
              <h2 className="text-xl font-semibold mb-1" style={{ color: theme.text }}>
                Ordem de Carregamento
              </h2>
            </div>
            <div className="text-right text-sm" style={{ color: theme.textMuted }}>
              <p className="font-bold">Código: FR-LOG-001</p>
              <p>Revisão: 01</p>
              <p>Data: 09/12/2024</p>
            </div>
          </div>
        </div>

        {/* Seção 1 - Identificação */}
        <section className="border rounded-lg p-4" style={{ borderColor: theme.cardBorder }}>
          <h3 className="font-bold text-base mb-4 bg-blue-600 text-white px-3 py-2 -mx-4 -mt-4 rounded-t-lg">
            1. IDENTIFICAÇÃO DA ORDEM
          </h3>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <p className="font-semibold mb-1" style={{ color: theme.text }}>Número da Carga:</p>
              <div className="border rounded px-3 py-2 bg-gray-50" style={{ borderColor: theme.cardBorder }}>
                <p className="text-xs text-gray-400">Gerado automaticamente</p>
              </div>
            </div>
            <div>
              <p className="font-semibold mb-1" style={{ color: theme.text }}>Data Solicitação:</p>
              <div className="border rounded px-3 py-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>
                _____/_____/_________
              </div>
            </div>
            <div>
              <p className="font-semibold mb-1" style={{ color: theme.text }}>Tipo de Registro:</p>
              <div className="flex gap-2 text-xs">
                <label className="flex items-center gap-1">
                  <input type="checkbox" /> Oferta
                </label>
                <label className="flex items-center gap-1">
                  <input type="checkbox" /> Negociando
                </label>
                <label className="flex items-center gap-1">
                  <input type="checkbox" /> Alocado
                </label>
              </div>
            </div>
          </div>
        </section>

        {/* Seção 2 - Cliente */}
        <section className="border rounded-lg p-4" style={{ borderColor: theme.cardBorder }}>
          <h3 className="font-bold text-base mb-4 bg-blue-600 text-white px-3 py-2 -mx-4 -mt-4 rounded-t-lg">
            2. DADOS DO CLIENTE
          </h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="font-semibold mb-1" style={{ color: theme.text }}>Razão Social: *</p>
              <div className="border rounded px-3 py-2" style={{ borderColor: theme.cardBorder }}>
                <span className="text-transparent">_</span>
              </div>
            </div>
            <div>
              <p className="font-semibold mb-1" style={{ color: theme.text }}>CNPJ:</p>
              <div className="border rounded px-3 py-2" style={{ borderColor: theme.cardBorder }}>
                <span className="text-transparent">_</span>
              </div>
            </div>
            <div className="col-span-2">
              <p className="font-semibold mb-1" style={{ color: theme.text }}>Tipo de Operação: *</p>
              <div className="flex gap-4 text-xs">
                <label className="flex items-center gap-2">
                  <input type="radio" name="tipo_op" /> CIF (Cliente é Remetente)
                </label>
                <label className="flex items-center gap-2">
                  <input type="radio" name="tipo_op" /> FOB (Cliente é Destinatário)
                </label>
              </div>
            </div>
          </div>
        </section>

        {/* Seção 3 - Carga */}
        <section className="border rounded-lg p-4" style={{ borderColor: theme.cardBorder }}>
          <h3 className="font-bold text-base mb-4 bg-blue-600 text-white px-3 py-2 -mx-4 -mt-4 rounded-t-lg">
            3. DADOS DA CARGA
          </h3>
          <div className="grid grid-cols-2 gap-4 text-sm mb-4">
            <div>
              <p className="font-semibold mb-1" style={{ color: theme.text }}>Origem (Cidade/UF): *</p>
              <div className="border rounded px-3 py-2" style={{ borderColor: theme.cardBorder }}>
                <span className="text-transparent">_</span>
              </div>
            </div>
            <div>
              <p className="font-semibold mb-1" style={{ color: theme.text }}>Destino (Cidade/UF): *</p>
              <div className="border rounded px-3 py-2" style={{ borderColor: theme.cardBorder }}>
                <span className="text-transparent">_</span>
              </div>
            </div>
            <div>
              <p className="font-semibold mb-1" style={{ color: theme.text }}>Produto: *</p>
              <div className="border rounded px-3 py-2" style={{ borderColor: theme.cardBorder }}>
                <span className="text-transparent">_</span>
              </div>
            </div>
            <div>
              <p className="font-semibold mb-1" style={{ color: theme.text }}>Peso (kg): *</p>
              <div className="border rounded px-3 py-2" style={{ borderColor: theme.cardBorder }}>
                <span className="text-transparent">_</span>
              </div>
            </div>
            <div>
              <p className="font-semibold mb-1" style={{ color: theme.text }}>Tipo de Veículo:</p>
              <div className="border rounded px-3 py-2" style={{ borderColor: theme.cardBorder }}>
                <span className="text-transparent">_</span>
              </div>
            </div>
            <div>
              <p className="font-semibold mb-1" style={{ color: theme.text }}>Modalidade:</p>
              <div className="flex gap-3 text-xs">
                <label className="flex items-center gap-1">
                  <input type="radio" name="modalidade" /> Normal
                </label>
                <label className="flex items-center gap-1">
                  <input type="radio" name="modalidade" /> Prioridade
                </label>
                <label className="flex items-center gap-1">
                  <input type="radio" name="modalidade" /> Expressa
                </label>
              </div>
            </div>
          </div>
        </section>

        {/* Seção 4 - Recursos */}
        <section className="border rounded-lg p-4" style={{ borderColor: theme.cardBorder }}>
          <h3 className="font-bold text-base mb-4 bg-blue-600 text-white px-3 py-2 -mx-4 -mt-4 rounded-t-lg">
            4. ALOCAÇÃO DE RECURSOS
          </h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="font-semibold mb-1" style={{ color: theme.text }}>Motorista:</p>
              <div className="border rounded px-3 py-2" style={{ borderColor: theme.cardBorder }}>
                <span className="text-transparent">_</span>
              </div>
            </div>
            <div>
              <p className="font-semibold mb-1" style={{ color: theme.text }}>Placa Cavalo:</p>
              <div className="border rounded px-3 py-2" style={{ borderColor: theme.cardBorder }}>
                <span className="text-transparent">_</span>
              </div>
            </div>
            <div>
              <p className="font-semibold mb-1" style={{ color: theme.text }}>Implemento 1:</p>
              <div className="border rounded px-3 py-2" style={{ borderColor: theme.cardBorder }}>
                <span className="text-transparent">_</span>
              </div>
            </div>
            <div>
              <p className="font-semibold mb-1" style={{ color: theme.text }}>Implemento 2:</p>
              <div className="border rounded px-3 py-2" style={{ borderColor: theme.cardBorder }}>
                <span className="text-transparent">_</span>
              </div>
            </div>
          </div>
        </section>

        {/* Seção 5 - Agendamentos */}
        <section className="border rounded-lg p-4" style={{ borderColor: theme.cardBorder }}>
          <h3 className="font-bold text-base mb-4 bg-blue-600 text-white px-3 py-2 -mx-4 -mt-4 rounded-t-lg">
            5. AGENDAMENTOS
          </h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="font-semibold mb-1" style={{ color: theme.text }}>Carregamento (data/hora):</p>
              <div className="border rounded px-3 py-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>
                _____/_____/_________ às _____:_____
              </div>
            </div>
            <div>
              <p className="font-semibold mb-1" style={{ color: theme.text }}>Descarga (data/hora):</p>
              <div className="border rounded px-3 py-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>
                _____/_____/_________ às _____:_____
              </div>
            </div>
          </div>
        </section>

        {/* Seção 6 - Financeiro */}
        <section className="border rounded-lg p-4" style={{ borderColor: theme.cardBorder }}>
          <h3 className="font-bold text-base mb-4 bg-blue-600 text-white px-3 py-2 -mx-4 -mt-4 rounded-t-lg">
            6. VALORES
          </h3>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <p className="font-semibold mb-1" style={{ color: theme.text }}>Valor do Frete:</p>
              <div className="border rounded px-3 py-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>
                R$ ______________
              </div>
            </div>
            <div>
              <p className="font-semibold mb-1" style={{ color: theme.text }}>Adiantamento:</p>
              <div className="border rounded px-3 py-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>
                R$ ______________
              </div>
            </div>
            <div>
              <p className="font-semibold mb-1" style={{ color: theme.text }}>Saldo:</p>
              <div className="border rounded px-3 py-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>
                R$ ______________
              </div>
            </div>
          </div>
        </section>

        {/* Seção 7 - Observações */}
        <section className="border rounded-lg p-4" style={{ borderColor: theme.cardBorder }}>
          <h3 className="font-bold text-base mb-4 bg-blue-600 text-white px-3 py-2 -mx-4 -mt-4 rounded-t-lg">
            7. OBSERVAÇÕES
          </h3>
          <div className="border rounded px-3 py-8" style={{ borderColor: theme.cardBorder }}>
            <span className="text-transparent">_</span>
          </div>
        </section>

        {/* Assinaturas */}
        <section className="grid grid-cols-3 gap-6 mt-12">
          <div className="text-center">
            <div className="border-t pt-2 mt-8" style={{ borderColor: theme.cardBorder }}>
              <p className="text-xs font-semibold" style={{ color: theme.text }}>Solicitado por</p>
            </div>
          </div>
          <div className="text-center">
            <div className="border-t pt-2 mt-8" style={{ borderColor: theme.cardBorder }}>
              <p className="text-xs font-semibold" style={{ color: theme.text }}>Aprovado por</p>
            </div>
          </div>
          <div className="text-center">
            <div className="border-t pt-2 mt-8" style={{ borderColor: theme.cardBorder }}>
              <p className="text-xs font-semibold" style={{ color: theme.text }}>Data</p>
            </div>
          </div>
        </section>

        <div className="border-t pt-4 mt-8 text-xs" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>
          <p className="font-semibold mb-2">LEGENDA:</p>
          <p>* Campos obrigatórios</p>
          <p className="mt-2">Este formulário deve ser preenchido eletronicamente através do sistema Log Flow.</p>
        </div>
      </CardContent>
    </Card>
  );
}

function ManualSistema({ theme, isDark }) {
  return (
    <Card style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}>
      <CardContent className="p-8 space-y-6">
        <div className="border-b pb-6" style={{ borderColor: theme.cardBorder }}>
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h1 className="text-2xl font-bold mb-2" style={{ color: theme.text }}>
                MANUAL DO USUÁRIO
              </h1>
              <h2 className="text-xl font-semibold mb-1" style={{ color: theme.text }}>
                Sistema Log Flow - Gestão Logística Integrada
              </h2>
            </div>
            <div className="text-right text-sm" style={{ color: theme.textMuted }}>
              <p className="font-bold">Código: MAN-LOG-001</p>
              <p>Versão: 1.0</p>
              <p>Data: 09/12/2024</p>
            </div>
          </div>
        </div>

        {/* Sumário */}
        <section>
          <h3 className="text-lg font-bold mb-3" style={{ color: theme.text }}>SUMÁRIO</h3>
          <div className="space-y-1 text-sm" style={{ color: theme.textMuted }}>
            <p>1. Introdução ao Sistema</p>
            <p>2. Arquitetura e Módulos</p>
            <p>3. Perfis de Usuário e Permissões</p>
            <p>4. Módulos Operacionais</p>
            <p>5. Módulos de Suporte</p>
            <p>6. Funcionalidades Avançadas</p>
            <p>7. Boas Práticas</p>
            <p>8. Suporte e Manutenção</p>
          </div>
        </section>

        {/* 1. Introdução */}
        <section>
          <h3 className="text-lg font-bold mb-3" style={{ color: theme.text }}>1. INTRODUÇÃO AO SISTEMA</h3>
          <p className="text-sm mb-3" style={{ color: theme.textMuted }}>
            O Log Flow é uma plataforma integrada de gestão logística desenvolvida com tecnologia de ponta, 
            projetada para atender às necessidades de empresas de transporte rodoviário de cargas. 
            O sistema abrange todo o ciclo operacional, desde a recepção da solicitação até a entrega final e faturamento.
          </p>
          <div className="text-sm space-y-2" style={{ color: theme.textMuted }}>
            <p><strong>Principais Características:</strong></p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li>Interface responsiva e intuitiva</li>
              <li>Atualizações em tempo real</li>
              <li>Workflow customizável por empresa</li>
              <li>Integração com sistemas externos (ANTT, SEFAZ, APIs)</li>
              <li>Modo escuro/claro para conforto visual</li>
              <li>Aplicativo móvel para motoristas</li>
            </ul>
          </div>
        </section>

        {/* 2. Arquitetura */}
        <section>
          <h3 className="text-lg font-bold mb-3" style={{ color: theme.text }}>2. ARQUITETURA E MÓDULOS</h3>
          
          <div className="space-y-4">
            <div>
              <h4 className="font-bold text-sm mb-2 text-blue-600">2.1 Módulo Base (Obrigatório)</h4>
              <div className="grid grid-cols-2 gap-2 text-xs" style={{ color: theme.textMuted }}>
                <div className="border rounded p-2" style={{ borderColor: theme.cardBorder }}>
                  <p className="font-semibold">• Dashboard Executivo</p>
                  <p className="ml-4">Visão consolidada de métricas</p>
                </div>
                <div className="border rounded p-2" style={{ borderColor: theme.cardBorder }}>
                  <p className="font-semibold">• Ordens de Carregamento</p>
                  <p className="ml-4">Gestão completa de ordens</p>
                </div>
                <div className="border rounded p-2" style={{ borderColor: theme.cardBorder }}>
                  <p className="font-semibold">• Tracking Logístico</p>
                  <p className="ml-4">Rastreamento em tempo real</p>
                </div>
                <div className="border rounded p-2" style={{ borderColor: theme.cardBorder }}>
                  <p className="font-semibold">• Gestão de Usuários</p>
                  <p className="ml-4">Controle de acessos</p>
                </div>
                <div className="border rounded p-2" style={{ borderColor: theme.cardBorder }}>
                  <p className="font-semibold">• Motoristas e Veículos</p>
                  <p className="ml-4">Cadastros operacionais</p>
                </div>
                <div className="border rounded p-2" style={{ borderColor: theme.cardBorder }}>
                  <p className="font-semibold">• Operações</p>
                  <p className="ml-4">Configuração de SLA</p>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-bold text-sm mb-2 text-purple-600">2.2 Add-on: Workflow & Qualidade</h4>
              <ul className="text-xs ml-4 list-disc space-y-1" style={{ color: theme.textMuted }}>
                <li>Fluxo BPMN Customizável (Etapas configuráveis)</li>
                <li>Gestão de Ocorrências (Tracking, Fluxo, Tarefas, Diárias)</li>
                <li>Sistema de Gamificação (Pontuação e Conquistas)</li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-sm mb-2 text-green-600">2.3 Add-on: WMS Completo</h4>
              <ul className="text-xs ml-4 list-disc space-y-1" style={{ color: theme.textMuted }}>
                <li>Recebimento de NF-e (XML, chave, scanner)</li>
                <li>Gestão de Notas Fiscais</li>
                <li>Etiquetas Mãe (Unitização de volumes)</li>
                <li>Carregamento e Expedição</li>
                <li>Ordem de Entrega</li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-sm mb-2 text-orange-600">2.4 Add-on: Portal B2B</h4>
              <ul className="text-xs ml-4 list-disc space-y-1" style={{ color: theme.textMuted }}>
                <li>Dashboard Coletas (fornecedor/cliente)</li>
                <li>Solicitar Coleta (perfil fornecedor)</li>
                <li>Aprovar Coletas (perfil cliente)</li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-sm mb-2 text-cyan-600">2.5 Add-on: Comunicação Avançada</h4>
              <ul className="text-xs ml-4 list-disc space-y-1" style={{ color: theme.textMuted }}>
                <li>App Motorista (SMS + atualização de status)</li>
                <li>SAC com Chatbot IA</li>
              </ul>
            </div>
          </div>
        </section>

        {/* 3. Perfis de Usuário */}
        <section>
          <h3 className="text-lg font-bold mb-3" style={{ color: theme.text }}>3. PERFIS DE USUÁRIO</h3>
          <table className="w-full text-xs border" style={{ borderColor: theme.cardBorder }}>
            <thead style={{ backgroundColor: isDark ? '#0f172a' : '#f3f4f6' }}>
              <tr>
                <th className="border p-2 text-left" style={{ borderColor: theme.cardBorder, color: theme.text }}>Perfil</th>
                <th className="border p-2 text-left" style={{ borderColor: theme.cardBorder, color: theme.text }}>Descrição</th>
                <th className="border p-2 text-left" style={{ borderColor: theme.cardBorder, color: theme.text }}>Módulos Acessíveis</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border p-2 font-semibold" style={{ borderColor: theme.cardBorder, color: theme.text }}>Admin</td>
                <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>Acesso total ao sistema</td>
                <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>Todos</td>
              </tr>
              <tr>
                <td className="border p-2 font-semibold" style={{ borderColor: theme.cardBorder, color: theme.text }}>Operador</td>
                <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>Equipe operacional logística</td>
                <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>Dashboard, Tracking, Fluxo, Ordens, WMS, Qualidade</td>
              </tr>
              <tr>
                <td className="border p-2 font-semibold" style={{ borderColor: theme.cardBorder, color: theme.text }}>Fornecedor</td>
                <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>Empresa que solicita coletas</td>
                <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>Dashboard Coletas, Solicitar Coleta, Minhas Ordens</td>
              </tr>
              <tr>
                <td className="border p-2 font-semibold" style={{ borderColor: theme.cardBorder, color: theme.text }}>Cliente</td>
                <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>Empresa que aprova/recebe coletas</td>
                <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>Dashboard Coletas, Aprovar Coletas, Minhas Ordens</td>
              </tr>
              <tr>
                <td className="border p-2 font-semibold" style={{ borderColor: theme.cardBorder, color: theme.text }}>Motorista</td>
                <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>Motorista em viagem</td>
                <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>App Motorista (mobile)</td>
              </tr>
            </tbody>
          </table>
        </section>

        {/* 4. Módulos Principais */}
        <section>
          <h3 className="text-lg font-bold mb-3" style={{ color: theme.text }}>4. GUIA RÁPIDO - MÓDULOS PRINCIPAIS</h3>
          
          <div className="space-y-3">
            <div className="border-l-4 border-blue-600 pl-4 py-2" style={{ backgroundColor: isDark ? '#0f172a' : '#f9fafb' }}>
              <h4 className="font-bold text-sm mb-1" style={{ color: theme.text }}>📊 Dashboard</h4>
              <p className="text-xs" style={{ color: theme.textMuted }}>
                Visão executiva com métricas em tempo real, gráficos de performance, alertas de SLA e insights operacionais.
              </p>
            </div>

            <div className="border-l-4 border-green-600 pl-4 py-2" style={{ backgroundColor: isDark ? '#0f172a' : '#f9fafb' }}>
              <h4 className="font-bold text-sm mb-1" style={{ color: theme.text }}>📦 Ordens de Carregamento</h4>
              <p className="text-xs" style={{ color: theme.textMuted }}>
                Criação e gestão de ordens (oferta, negociando, alocado). Edição inline de campos, 
                exportação de ofertas em PDF, vinculação de notas fiscais.
              </p>
            </div>

            <div className="border-l-4 border-purple-600 pl-4 py-2" style={{ backgroundColor: isDark ? '#0f172a' : '#f9fafb' }}>
              <h4 className="font-bold text-sm mb-1" style={{ color: theme.text }}>🗺️ Tracking</h4>
              <p className="text-xs" style={{ color: theme.textMuted }}>
                Monitoramento de cargas em trânsito, atualização de status, controle de SLA, 
                abertura de ocorrências, chat com motorista, upload de documentos.
              </p>
            </div>

            <div className="border-l-4 border-yellow-600 pl-4 py-2" style={{ backgroundColor: isDark ? '#0f172a' : '#f9fafb' }}>
              <h4 className="font-bold text-sm mb-1" style={{ color: theme.text }}>⚙️ Fluxo</h4>
              <p className="text-xs" style={{ color: theme.textMuted }}>
                Gestão de etapas customizadas do processo interno (cadastro, rastreamento, expedição, financeiro). 
                Cada etapa pode ter campos próprios, prazos e responsáveis.
              </p>
            </div>

            <div className="border-l-4 border-red-600 pl-4 py-2" style={{ backgroundColor: isDark ? '#0f172a' : '#f9fafb' }}>
              <h4 className="font-bold text-sm mb-1" style={{ color: theme.text }}>🛡️ Ocorrências</h4>
              <p className="text-xs" style={{ color: theme.textMuted }}>
                Registro e tratamento de problemas (tracking, fluxo, tarefa, diária). 
                Sistema de tickets, SLA por tipo, notificações automáticas, gestão de diárias.
              </p>
            </div>

            <div className="border-l-4 border-teal-600 pl-4 py-2" style={{ backgroundColor: isDark ? '#0f172a' : '#f9fafb' }}>
              <h4 className="font-bold text-sm mb-1" style={{ color: theme.text }}>📥 Recebimento (WMS)</h4>
              <p className="text-xs" style={{ color: theme.textMuted }}>
                Importação de NF-e via XML, leitura de chave, ou scanner. 
                Criação de volumes, impressão de etiquetas, conferência de mercadorias.
              </p>
            </div>

            <div className="border-l-4 border-indigo-600 pl-4 py-2" style={{ backgroundColor: isDark ? '#0f172a' : '#f9fafb' }}>
              <h4 className="font-bold text-sm mb-1" style={{ color: theme.text }}>📤 Carregamento (WMS)</h4>
              <p className="text-xs" style={{ color: theme.textMuted }}>
                Seleção de notas/volumes para expedição, conferência de mercadorias, 
                endereçamento de veículo (posições A1, A2, etc.), documentação de saída.
              </p>
            </div>

            <div className="border-l-4 border-orange-600 pl-4 py-2" style={{ backgroundColor: isDark ? '#0f172a' : '#f9fafb' }}>
              <h4 className="font-bold text-sm mb-1" style={{ color: theme.text }}>🚚 Coletas (Portal B2B)</h4>
              <p className="text-xs" style={{ color: theme.textMuted }}>
                <strong>Fornecedor:</strong> Solicita coleta de mercadoria.<br/>
                <strong>Cliente:</strong> Aprova ou reprova solicitações.<br/>
                <strong>Operador:</strong> Gerencia todo o ciclo de coletas.
              </p>
            </div>
          </div>
        </section>

        {/* 5. Boas Práticas */}
        <section className="print-page-break">
          <h3 className="text-lg font-bold mb-3" style={{ color: theme.text }}>7. BOAS PRÁTICAS</h3>
          <div className="space-y-3 text-sm" style={{ color: theme.textMuted }}>
            <div>
              <p className="font-semibold mb-1" style={{ color: theme.text }}>✅ Gestão de Ordens</p>
              <ul className="list-disc ml-6 space-y-1">
                <li>Sempre vincule uma Operação à ordem para garantir SLA correto</li>
                <li>Use edição inline para agilizar atualizações rápidas</li>
                <li>Preencha observações para facilitar comunicação entre turnos</li>
                <li>Utilize ofertas de carga para negociações com parceiros</li>
              </ul>
            </div>

            <div>
              <p className="font-semibold mb-1" style={{ color: theme.text }}>✅ Tracking</p>
              <ul className="list-disc ml-6 space-y-1">
                <li>Atualize status assim que eventos ocorrem (não deixe acumular)</li>
                <li>Use o atalho "H" para preencher data/hora atual rapidamente</li>
                <li>Registre ocorrências imediatamente quando identificar problemas</li>
                <li>Mantenha comunicação ativa com motorista via chat</li>
              </ul>
            </div>

            <div>
              <p className="font-semibold mb-1" style={{ color: theme.text }}>✅ Qualidade</p>
              <ul className="list-disc ml-6 space-y-1">
                <li>Documente todas as ocorrências, mesmo as resolvidas rapidamente</li>
                <li>Anexe evidências sempre que possível (fotos, autorizações)</li>
                <li>Trate ocorrências dentro do prazo SLA</li>
                <li>Analise causas raiz para prevenir recorrências</li>
              </ul>
            </div>

            <div>
              <p className="font-semibold mb-1" style={{ color: theme.text }}>✅ WMS</p>
              <ul className="list-disc ml-6 space-y-1">
                <li>Importe XML sempre que possível (evita erros de digitação)</li>
                <li>Use etiquetas mãe para agrupar volumes de mesma rota</li>
                <li>Confira peso e volumes antes de finalizar recebimento</li>
                <li>Mantenha organização de endereçamento no armazém</li>
              </ul>
            </div>
          </div>
        </section>

        {/* 6. Suporte */}
        <section>
          <h3 className="text-lg font-bold mb-3" style={{ color: theme.text }}>8. SUPORTE E MANUTENÇÃO</h3>
          <div className="space-y-2 text-sm" style={{ color: theme.textMuted }}>
            <p><strong>Canal de Atendimento:</strong></p>
            <ul className="list-disc ml-6">
              <li>Sistema de Chamados integrado (botão flutuante em todas as telas)</li>
              <li>Classificação automática por página de origem</li>
              <li>Priorização por criticidade</li>
              <li>Histórico completo de chamados</li>
            </ul>
            
            <p className="mt-3"><strong>Atualizações do Sistema:</strong></p>
            <p className="ml-4">
              O sistema é atualizado continuamente. Melhorias e correções são implementadas sem necessidade 
              de intervenção do usuário. Mudanças significativas são comunicadas via email.
            </p>
          </div>
        </section>

        <div className="border-t pt-4 mt-8 text-xs text-center" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>
          <p>Log Flow © 2024 - Todos os direitos reservados</p>
          <p className="mt-1">Para suporte técnico, utilize o sistema de chamados integrado</p>
        </div>
      </CardContent>
    </Card>
  );
}