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
          </div>
        </div>

        {/* Conteúdo para Impressão */}
        <div className="print-content">
          {procedimentoSelecionado === "ordens_carga" && (
            <InstrucaoOrdensCarregamento theme={theme} isDark={isDark} />
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