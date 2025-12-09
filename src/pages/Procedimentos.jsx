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
    bg: isDark ? '#0f172a' : '#f9fafb',
    cardBg: isDark ? '#1e293b' : '#ffffff',
    cardBorder: isDark ? '#334155' : '#e5e7eb',
    text: isDark ? '#f1f5f9' : '#111827',
    textMuted: isDark ? '#94a3b8' : '#6b7280',
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
          </div>
        </div>

        {/* Conteúdo para Impressão */}
        <div className="print-content">
          {procedimentoSelecionado === "gestao_transportes" && (
            <ProcedimentoGestaoTransportes theme={theme} isDark={isDark} />
          )}
          {procedimentoSelecionado === "ordens_carga" && (
            <InstrucaoOrdensCarregamento theme={theme} isDark={isDark} />
          )}
          {procedimentoSelecionado === "tracking" && (
            <InstrucaoTracking theme={theme} isDark={isDark} />
          )}
          {procedimentoSelecionado === "ocorrencias" && (
            <InstrucaoOcorrencias theme={theme} isDark={isDark} />
          )}
          {procedimentoSelecionado === "formulario" && (
            <FormularioOrdemCarregamento theme={theme} isDark={isDark} />
          )}
          {procedimentoSelecionado === "manual" && (
            <ManualSistema theme={theme} isDark={isDark} />
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
                Gestão de Transportes
              </h2>
            </div>
            <div className="text-right text-sm" style={{ color: theme.textMuted }}>
              <p className="font-bold">Código: PO-LOG-001</p>
              <p>Revisão: 01</p>
              <p>Data: 09/12/2024</p>
              <p>Páginas: 1/2</p>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <p className="font-semibold" style={{ color: theme.text }}>Elaborado por:</p>
              <p style={{ color: theme.textMuted }}>Gestão de Qualidade</p>
            </div>
            <div>
              <p className="font-semibold" style={{ color: theme.text }}>Aprovado por:</p>
              <p style={{ color: theme.textMuted }}>Diretor Executivo</p>
            </div>
            <div>
              <p className="font-semibold" style={{ color: theme.text }}>Processo:</p>
              <p style={{ color: theme.textMuted }}>Operações Logísticas</p>
            </div>
          </div>
        </div>

        {/* 1. Objetivo e Escopo */}
        <section>
          <h3 className="text-lg font-bold mb-3" style={{ color: theme.text }}>1. OBJETIVO E ESCOPO</h3>
          <p className="text-sm mb-3" style={{ color: theme.textMuted }}>
            <strong>1.1 Objetivo:</strong> Estabelecer diretrizes para o planejamento, execução, monitoramento e controle 
            de operações de transporte rodoviário de cargas, assegurando conformidade com NBR ISO 9001:2015 
            (itens 8.1, 8.5 e 9.1).
          </p>
          <p className="text-sm" style={{ color: theme.textMuted }}>
            <strong>1.2 Escopo:</strong> Aplica-se a todas as operações de transporte gerenciadas através do sistema 
            Log Flow, incluindo carregamentos, coletas, entregas e recebimentos.
          </p>
        </section>

        {/* 2. Referências Normativas */}
        <section>
          <h3 className="text-lg font-bold mb-3" style={{ color: theme.text }}>2. REFERÊNCIAS NORMATIVAS</h3>
          <ul className="list-disc list-inside text-sm space-y-1 ml-4" style={{ color: theme.textMuted }}>
            <li>NBR ISO 9001:2015 - Sistemas de Gestão da Qualidade - Requisitos</li>
            <li>NBR ISO 9000:2015 - Sistemas de Gestão da Qualidade - Fundamentos e Vocabulário</li>
            <li>NBR ISO 10005:2007 - Diretrizes para Planos da Qualidade</li>
            <li>Resolução ANTT nº 5.867/2019 - Registro Nacional de Transportadores Rodoviários de Cargas</li>
            <li>Lei nº 11.442/2007 - Transporte Rodoviário de Cargas</li>
          </ul>
        </section>

        {/* 3. Macroprocesso */}
        <section>
          <h3 className="text-lg font-bold mb-3" style={{ color: theme.text }}>3. MACROPROCESSO DE TRANSPORTE</h3>
          <div className="space-y-4">
            <div>
              <h4 className="font-bold text-sm mb-2" style={{ color: theme.text }}>3.1 Planejamento</h4>
              <ul className="text-xs space-y-1 ml-6 list-disc" style={{ color: theme.textMuted }}>
                <li>Recebimento da solicitação de transporte</li>
                <li>Análise de viabilidade operacional</li>
                <li>Definição de recursos necessários (tipo de veículo, motorista)</li>
                <li>Configuração de SLA através do cadastro de Operações</li>
                <li>Precificação e aprovação comercial</li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-sm mb-2" style={{ color: theme.text }}>3.2 Execução</h4>
              <ul className="text-xs space-y-1 ml-6 list-disc" style={{ color: theme.textMuted }}>
                <li>Criação da Ordem de Carregamento no sistema</li>
                <li>Alocação de motorista e veículo</li>
                <li>Agendamento de carregamento e descarga</li>
                <li>Execução das etapas do fluxo operacional configurado</li>
                <li>Atualização de status de tracking em tempo real</li>
                <li>Gestão de documentos (NF-e, CT-e, MDF-e, etc.)</li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-sm mb-2" style={{ color: theme.text }}>3.3 Monitoramento</h4>
              <ul className="text-xs space-y-1 ml-6 list-disc" style={{ color: theme.textMuted }}>
                <li>Acompanhamento via Dashboard e Tracking</li>
                <li>Controle de prazos e SLA (carregamento e descarga)</li>
                <li>Identificação e tratamento de ocorrências</li>
                <li>Comunicação com motorista via App Motorista</li>
                <li>Atendimento ao cliente via SAC</li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-sm mb-2" style={{ color: theme.text }}>3.4 Finalização</h4>
              <ul className="text-xs space-y-1 ml-6 list-disc" style={{ color: theme.textMuted }}>
                <li>Confirmação de descarga realizada</li>
                <li>Upload de comprovante de entrega</li>
                <li>Cálculo e autorização de diárias (quando aplicável)</li>
                <li>Fechamento financeiro (adiantamento + saldo)</li>
                <li>Arquivamento de documentação</li>
              </ul>
            </div>
          </div>
        </section>

        {/* 4. Indicadores de Desempenho */}
        <section>
          <h3 className="text-lg font-bold mb-3" style={{ color: theme.text }}>4. INDICADORES DE PROCESSO (KPIs)</h3>
          <div className="space-y-2 text-sm">
            <p style={{ color: theme.textMuted }}>
              Conforme NBR ISO 9001:2015 (item 9.1.1 - Monitoramento e medição), devem ser acompanhados:
            </p>
            <table className="w-full text-xs border" style={{ borderColor: theme.cardBorder }}>
              <thead style={{ backgroundColor: isDark ? '#0f172a' : '#f3f4f6' }}>
                <tr>
                  <th className="border p-2 text-left" style={{ borderColor: theme.cardBorder, color: theme.text }}>Indicador</th>
                  <th className="border p-2 text-left" style={{ borderColor: theme.cardBorder, color: theme.text }}>Fórmula</th>
                  <th className="border p-2 text-left" style={{ borderColor: theme.cardBorder, color: theme.text }}>Meta</th>
                  <th className="border p-2 text-left" style={{ borderColor: theme.cardBorder, color: theme.text }}>Frequência</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>SLA Carregamento</td>
                  <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>(Carregamentos no prazo / Total) × 100</td>
                  <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>≥ 95%</td>
                  <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>Diária</td>
                </tr>
                <tr>
                  <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>SLA Descarga</td>
                  <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>(Descargas no prazo / Total) × 100</td>
                  <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>≥ 95%</td>
                  <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>Diária</td>
                </tr>
                <tr>
                  <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>Taxa de Alocação</td>
                  <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>(Ordens Alocadas / Total Ordens) × 100</td>
                  <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>≥ 90%</td>
                  <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>Semanal</td>
                </tr>
                <tr>
                  <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>Ocorrências Resolvidas</td>
                  <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>(Ocorrências resolvidas no prazo / Total) × 100</td>
                  <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>≥ 92%</td>
                  <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>Semanal</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* 5. Gestão de Riscos */}
        <section>
          <h3 className="text-lg font-bold mb-3" style={{ color: theme.text }}>5. GESTÃO DE RISCOS OPERACIONAIS</h3>
          <table className="w-full text-xs border" style={{ borderColor: theme.cardBorder }}>
            <thead style={{ backgroundColor: isDark ? '#0f172a' : '#f3f4f6' }}>
              <tr>
                <th className="border p-2 text-left" style={{ borderColor: theme.cardBorder, color: theme.text }}>Risco</th>
                <th className="border p-2 text-left" style={{ borderColor: theme.cardBorder, color: theme.text }}>Controle Preventivo</th>
                <th className="border p-2 text-left" style={{ borderColor: theme.cardBorder, color: theme.text }}>Ação Corretiva</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>Atraso no carregamento</td>
                <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>Agendamento prévio + tolerância configurada</td>
                <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>Registro de ocorrência + análise de diária</td>
              </tr>
              <tr>
                <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>Falta de veículo adequado</td>
                <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>Cadastro de ofertas + rede de parceiros</td>
                <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>Busca em rede terceirizada + negociação</td>
              </tr>
              <tr>
                <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>Dados incompletos/incorretos</td>
                <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>Validações automáticas do sistema</td>
                <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>Correção inline + notificação ao responsável</td>
              </tr>
              <tr>
                <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>Avaria ou extravio de carga</td>
                <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>Rastreamento + seguro de carga</td>
                <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>Abertura de sinistro + RNC</td>
              </tr>
            </tbody>
          </table>
        </section>

        {/* 6. Melhoria Contínua */}
        <section>
          <h3 className="text-lg font-bold mb-3" style={{ color: theme.text }}>6. MELHORIA CONTÍNUA</h3>
          <p className="text-sm mb-3" style={{ color: theme.textMuted }}>
            Conforme NBR ISO 9001:2015 (item 10 - Melhoria), devem ser realizadas:
          </p>
          <ul className="list-disc list-inside text-sm space-y-1 ml-4" style={{ color: theme.textMuted }}>
            <li><strong>Análise Crítica Mensal:</strong> Avaliação de indicadores e identificação de oportunidades</li>
            <li><strong>Reunião de Retrospectiva:</strong> Discussão de problemas recorrentes e ações preventivas</li>
            <li><strong>Análise de Causa Raiz:</strong> Para não conformidades graves (5 Porquês, Ishikawa)</li>
            <li><strong>Plano de Ação (5W2H):</strong> Documentação de melhorias identificadas</li>
            <li><strong>Gamificação:</strong> Reconhecimento de boas práticas e desempenho superior</li>
          </ul>
        </section>

        {/* 7. Anexos */}
        <section>
          <h3 className="text-lg font-bold mb-3" style={{ color: theme.text }}>7. ANEXOS</h3>
          <ul className="list-disc list-inside text-sm space-y-1 ml-4" style={{ color: theme.textMuted }}>
            <li>Anexo A - Fluxograma do Macroprocesso de Transporte</li>
            <li>Anexo B - Matriz de Responsabilidades RACI</li>
            <li>Anexo C - Tabela de SLA por Tipo de Operação</li>
          </ul>
        </section>

        <div className="border-t pt-4 mt-8 text-xs text-center" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>
          <p>Documento controlado eletronicamente - Versão impressa é cópia não controlada</p>
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