import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, AlertTriangle, CheckCircle, Circle, Users } from "lucide-react";

export function AnexosProcedimentoTransportes({ theme, isDark }) {
  return (
    <div className="space-y-8">
      {/* ANEXO A - SIPOC */}
      <Card style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}>
        <CardContent className="p-8 space-y-6">
          <div className="border-b pb-4" style={{ borderColor: theme.cardBorder }}>
            <h2 className="text-xl font-bold mb-2" style={{ color: theme.text }}>
              ANEXO A - FLUXOGRAMA DO MACROPROCESSO (SIPOC)
            </h2>
            <p className="text-sm" style={{ color: theme.textMuted }}>
              Referência: PO-LOG-001 | Diagrama SIPOC (Supplier, Input, Process, Output, Customer)
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs border" style={{ borderColor: theme.cardBorder }}>
              <thead>
                <tr style={{ backgroundColor: isDark ? '#0f172a' : '#f3f4f6' }}>
                  <th className="border p-3 text-left w-1/5" style={{ borderColor: theme.cardBorder, color: theme.text }}>
                    SUPPLIER<br/>
                    <span className="font-normal text-[10px]">(Fornecedor)</span>
                  </th>
                  <th className="border p-3 text-left w-1/5" style={{ borderColor: theme.cardBorder, color: theme.text }}>
                    INPUT<br/>
                    <span className="font-normal text-[10px]">(Entrada)</span>
                  </th>
                  <th className="border p-3 text-left w-1/5" style={{ borderColor: theme.cardBorder, color: theme.text }}>
                    PROCESS<br/>
                    <span className="font-normal text-[10px]">(Processo)</span>
                  </th>
                  <th className="border p-3 text-left w-1/5" style={{ borderColor: theme.cardBorder, color: theme.text }}>
                    OUTPUT<br/>
                    <span className="font-normal text-[10px]">(Saída)</span>
                  </th>
                  <th className="border p-3 text-left w-1/5" style={{ borderColor: theme.cardBorder, color: theme.text }}>
                    CUSTOMER<br/>
                    <span className="font-normal text-[10px]">(Cliente)</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border p-3 align-top" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>
                    • Cliente (CIF/FOB)<br/>
                    • Fornecedor<br/>
                    • Comercial Interno<br/>
                    • Portal B2B
                  </td>
                  <td className="border p-3 align-top" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>
                    • Solicitação transporte<br/>
                    • Dados da carga<br/>
                    • Rota (origem/destino)<br/>
                    • Prazo desejado<br/>
                    • NF-e (XML)
                  </td>
                  <td className="border p-3 align-top bg-blue-50 dark:bg-blue-900/20" style={{ borderColor: theme.cardBorder, color: theme.text }}>
                    <strong>PLANEJAMENTO</strong><br/>
                    <span className="text-[10px]" style={{ color: theme.textMuted }}>
                      • Análise viabilidade<br/>
                      • Precificação<br/>
                      • Criar OC (IT-LOG-001)<br/>
                      • Definir SLA<br/>
                      • Alocar recursos
                    </span>
                  </td>
                  <td className="border p-3 align-top" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>
                    • Ordem de Carregamento<br/>
                    • Proposta comercial<br/>
                    • Agendamentos<br/>
                    • Motorista/veículo alocado
                  </td>
                  <td className="border p-3 align-top" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>
                    • Coord. Expedição<br/>
                    • Cliente (confirmação)<br/>
                    • Equipe Operacional
                  </td>
                </tr>
                <tr>
                  <td className="border p-3 align-top" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>
                    • Coord. Expedição<br/>
                    • Operador Logístico<br/>
                    • Sistema (workflow)
                  </td>
                  <td className="border p-3 align-top" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>
                    • Ordem Alocada<br/>
                    • Motorista definido<br/>
                    • Veículo definido<br/>
                    • Documentação<br/>
                    • Agendamento
                  </td>
                  <td className="border p-3 align-top bg-green-50 dark:bg-green-900/20" style={{ borderColor: theme.cardBorder, color: theme.text }}>
                    <strong>EXECUÇÃO</strong><br/>
                    <span className="text-[10px]" style={{ color: theme.textMuted }}>
                      • Etapas do Fluxo<br/>
                      • Carregamento<br/>
                      • Transporte<br/>
                      • Tracking (IT-LOG-002)<br/>
                      • Descarga
                    </span>
                  </td>
                  <td className="border p-3 align-top" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>
                    • Carga transportada<br/>
                    • Updates de status<br/>
                    • Comprovante entrega<br/>
                    • Documentos viagem<br/>
                    • Dados de tracking
                  </td>
                  <td className="border p-3 align-top" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>
                    • Destinatário (recebe)<br/>
                    • Cliente (visibilidade)<br/>
                    • Financeiro
                  </td>
                </tr>
                <tr>
                  <td className="border p-3 align-top" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>
                    • Sistema (sensores)<br/>
                    • Operador<br/>
                    • Motorista<br/>
                    • Dashboard
                  </td>
                  <td className="border p-3 align-top" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>
                    • Dados de tracking<br/>
                    • Timestamps<br/>
                    • Localização GPS<br/>
                    • Status atual<br/>
                    • Ocorrências
                  </td>
                  <td className="border p-3 align-top bg-purple-50 dark:bg-purple-900/20" style={{ borderColor: theme.cardBorder, color: theme.text }}>
                    <strong>MONITORAMENTO</strong><br/>
                    <span className="text-[10px]" style={{ color: theme.textMuted }}>
                      • Controle SLA<br/>
                      • Identificar desvios<br/>
                      • Tratar ocorrências<br/>
                      • Comunicação<br/>
                      • Análise de KPIs
                    </span>
                  </td>
                  <td className="border p-3 align-top" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>
                    • Alertas de SLA<br/>
                    • Ocorrências registradas<br/>
                    • Relatórios<br/>
                    • Notificações<br/>
                    • Dashboards atualizados
                  </td>
                  <td className="border p-3 align-top" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>
                    • Coord. Operações<br/>
                    • Gestor Qualidade<br/>
                    • Cliente (via SAC)<br/>
                    • Direção
                  </td>
                </tr>
                <tr>
                  <td className="border p-3 align-top" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>
                    • Operador<br/>
                    • Motorista<br/>
                    • Sistema (automático)
                  </td>
                  <td className="border p-3 align-top" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>
                    • Descarga confirmada<br/>
                    • Comprovante assinado<br/>
                    • Documentos CT-e/MDF-e<br/>
                    • Ocorrências resolvidas
                  </td>
                  <td className="border p-3 align-top bg-gray-50 dark:bg-gray-900/20" style={{ borderColor: theme.cardBorder, color: theme.text }}>
                    <strong>FINALIZAÇÃO</strong><br/>
                    <span className="text-[10px]" style={{ color: theme.textMuted }}>
                      • Validar comprovante<br/>
                      • Calcular diárias<br/>
                      • Fechar financeiro<br/>
                      • Arquivar docs<br/>
                      • Finalizar ordem
                    </span>
                  </td>
                  <td className="border p-3 align-top" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>
                    • Ordem finalizada<br/>
                    • Valores consolidados<br/>
                    • Diárias autorizadas<br/>
                    • Docs arquivados<br/>
                    • Métricas atualizadas
                  </td>
                  <td className="border p-3 align-top" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>
                    • Financeiro<br/>
                    • Contabilidade<br/>
                    • Gestão (métricas)<br/>
                    • Auditor
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="border rounded p-3 text-xs" style={{ backgroundColor: theme.headerBg, borderColor: theme.cardBorder }}>
            <p className="font-semibold mb-1" style={{ color: theme.text }}>NOTA - Como Ler o SIPOC:</p>
            <p style={{ color: theme.textMuted }}>
              Leia horizontalmente cada linha. Exemplo linha 1: <strong>Cliente</strong> fornece 
              <strong> Solicitação</strong>, que passa pelo processo de <strong>Planejamento</strong>, 
              gerando <strong>Ordem de Carregamento</strong> para o cliente interno <strong>Coord. Expedição</strong>.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* ANEXO B - MATRIZ RACI */}
      <Card style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}>
        <CardContent className="p-8 space-y-6">
          <div className="border-b pb-4" style={{ borderColor: theme.cardBorder }}>
            <h2 className="text-xl font-bold mb-2" style={{ color: theme.text }}>
              ANEXO B - MATRIZ DE RESPONSABILIDADES RACI
            </h2>
            <p className="text-sm mb-3" style={{ color: theme.textMuted }}>
              Referência: PO-LOG-001 | Define papéis e responsabilidades por atividade
            </p>
            <div className="grid grid-cols-4 gap-2 text-xs">
              <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded">
                <strong className="text-blue-600">R</strong> = Responsible (Executor)
              </div>
              <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded">
                <strong className="text-green-600">A</strong> = Accountable (Aprovador)
              </div>
              <div className="bg-yellow-100 dark:bg-yellow-900/30 p-2 rounded">
                <strong className="text-yellow-600">C</strong> = Consulted (Consultado)
              </div>
              <div className="bg-purple-100 dark:bg-purple-900/30 p-2 rounded">
                <strong className="text-purple-600">I</strong> = Informed (Informado)
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-[10px] border" style={{ borderColor: theme.cardBorder }}>
              <thead style={{ backgroundColor: isDark ? '#0f172a' : '#f3f4f6' }}>
                <tr>
                  <th className="border p-2 text-left" style={{ borderColor: theme.cardBorder, color: theme.text }}>
                    Atividade do Processo
                  </th>
                  <th className="border p-2 text-center" style={{ borderColor: theme.cardBorder, color: theme.text }}>Operador</th>
                  <th className="border p-2 text-center" style={{ borderColor: theme.cardBorder, color: theme.text }}>Coord.<br/>Expedição</th>
                  <th className="border p-2 text-center" style={{ borderColor: theme.cardBorder, color: theme.text }}>Coord.<br/>Operações</th>
                  <th className="border p-2 text-center" style={{ borderColor: theme.cardBorder, color: theme.text }}>Gestor<br/>Qualidade</th>
                  <th className="border p-2 text-center" style={{ borderColor: theme.cardBorder, color: theme.text }}>Comercial</th>
                  <th className="border p-2 text-center" style={{ borderColor: theme.cardBorder, color: theme.text }}>Financeiro</th>
                  <th className="border p-2 text-center" style={{ borderColor: theme.cardBorder, color: theme.text }}>Motorista</th>
                  <th className="border p-2 text-center" style={{ borderColor: theme.cardBorder, color: theme.text }}>Cliente</th>
                </tr>
              </thead>
              <tbody>
                {/* PLANEJAMENTO */}
                <tr>
                  <td className="border p-2 font-semibold bg-blue-50 dark:bg-blue-900/20" colSpan="9" style={{ borderColor: theme.cardBorder, color: theme.text }}>
                    FASE 1: PLANEJAMENTO
                  </td>
                </tr>
                <tr>
                  <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>
                    Receber solicitação de transporte
                  </td>
                  <td className="border p-2 text-center" style={{ borderColor: theme.cardBorder }}>I</td>
                  <td className="border p-2 text-center" style={{ borderColor: theme.cardBorder }}>I</td>
                  <td className="border p-2 text-center" style={{ borderColor: theme.cardBorder }}>C</td>
                  <td className="border p-2 text-center" style={{ borderColor: theme.cardBorder }}>-</td>
                  <td className="border p-2 text-center font-bold text-blue-600" style={{ borderColor: theme.cardBorder }}>R</td>
                  <td className="border p-2 text-center" style={{ borderColor: theme.cardBorder }}>-</td>
                  <td className="border p-2 text-center" style={{ borderColor: theme.cardBorder }}>-</td>
                  <td className="border p-2 text-center font-bold text-green-600" style={{ borderColor: theme.cardBorder }}>A</td>
                </tr>
                <tr>
                  <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>
                    Análise de viabilidade operacional
                  </td>
                  <td className="border p-2 text-center" style={{ borderColor: theme.cardBorder }}>C</td>
                  <td className="border p-2 text-center" style={{ borderColor: theme.cardBorder }}>C</td>
                  <td className="border p-2 text-center font-bold text-blue-600" style={{ borderColor: theme.cardBorder }}>R</td>
                  <td className="border p-2 text-center" style={{ borderColor: theme.cardBorder }}>-</td>
                  <td className="border p-2 text-center font-bold text-green-600" style={{ borderColor: theme.cardBorder }}>A</td>
                  <td className="border p-2 text-center" style={{ borderColor: theme.cardBorder }}>C</td>
                  <td className="border p-2 text-center" style={{ borderColor: theme.cardBorder }}>-</td>
                  <td className="border p-2 text-center" style={{ borderColor: theme.cardBorder }}>I</td>
                </tr>
                <tr>
                  <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>
                    Precificação (ton ou viagem)
                  </td>
                  <td className="border p-2 text-center" style={{ borderColor: theme.cardBorder }}>I</td>
                  <td className="border p-2 text-center" style={{ borderColor: theme.cardBorder }}>C</td>
                  <td className="border p-2 text-center" style={{ borderColor: theme.cardBorder }}>C</td>
                  <td className="border p-2 text-center" style={{ borderColor: theme.cardBorder }}>-</td>
                  <td className="border p-2 text-center font-bold text-blue-600" style={{ borderColor: theme.cardBorder }}>R</td>
                  <td className="border p-2 text-center" style={{ borderColor: theme.cardBorder }}>C</td>
                  <td className="border p-2 text-center" style={{ borderColor: theme.cardBorder }}>-</td>
                  <td className="border p-2 text-center font-bold text-green-600" style={{ borderColor: theme.cardBorder }}>A</td>
                </tr>
                <tr>
                  <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>
                    Criar Ordem de Carregamento (IT-LOG-001)
                  </td>
                  <td className="border p-2 text-center font-bold text-blue-600" style={{ borderColor: theme.cardBorder }}>R</td>
                  <td className="border p-2 text-center font-bold text-green-600" style={{ borderColor: theme.cardBorder }}>A</td>
                  <td className="border p-2 text-center" style={{ borderColor: theme.cardBorder }}>I</td>
                  <td className="border p-2 text-center" style={{ borderColor: theme.cardBorder }}>-</td>
                  <td className="border p-2 text-center" style={{ borderColor: theme.cardBorder }}>I</td>
                  <td className="border p-2 text-center" style={{ borderColor: theme.cardBorder }}>I</td>
                  <td className="border p-2 text-center" style={{ borderColor: theme.cardBorder }}>-</td>
                  <td className="border p-2 text-center" style={{ borderColor: theme.cardBorder }}>I</td>
                </tr>
                <tr>
                  <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>
                    Alocar motorista e veículo
                  </td>
                  <td className="border p-2 text-center" style={{ borderColor: theme.cardBorder }}>C</td>
                  <td className="border p-2 text-center font-bold text-blue-600" style={{ borderColor: theme.cardBorder }}>R</td>
                  <td className="border p-2 text-center font-bold text-green-600" style={{ borderColor: theme.cardBorder }}>A</td>
                  <td className="border p-2 text-center" style={{ borderColor: theme.cardBorder }}>-</td>
                  <td className="border p-2 text-center" style={{ borderColor: theme.cardBorder }}>I</td>
                  <td className="border p-2 text-center" style={{ borderColor: theme.cardBorder }}>-</td>
                  <td className="border p-2 text-center" style={{ borderColor: theme.cardBorder }}>I</td>
                  <td className="border p-2 text-center" style={{ borderColor: theme.cardBorder }}>I</td>
                </tr>

                {/* EXECUÇÃO */}
                <tr>
                  <td className="border p-2 font-semibold bg-green-50 dark:bg-green-900/20" colSpan="9" style={{ borderColor: theme.cardBorder, color: theme.text }}>
                    FASE 2: EXECUÇÃO
                  </td>
                </tr>
                <tr>
                  <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>
                    Agendar carregamento (data/hora)
                  </td>
                  <td className="border p-2 text-center font-bold text-blue-600" style={{ borderColor: theme.cardBorder }}>R</td>
                  <td className="border p-2 text-center" style={{ borderColor: theme.cardBorder }}>C</td>
                  <td className="border p-2 text-center font-bold text-green-600" style={{ borderColor: theme.cardBorder }}>A</td>
                  <td className="border p-2 text-center" style={{ borderColor: theme.cardBorder }}>-</td>
                  <td className="border p-2 text-center" style={{ borderColor: theme.cardBorder }}>I</td>
                  <td className="border p-2 text-center" style={{ borderColor: theme.cardBorder }}>-</td>
                  <td className="border p-2 text-center" style={{ borderColor: theme.cardBorder }}>I</td>
                  <td className="border p-2 text-center" style={{ borderColor: theme.cardBorder }}>I</td>
                </tr>
                <tr>
                  <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>
                    Executar etapas do fluxo operacional
                  </td>
                  <td className="border p-2 text-center font-bold text-blue-600" style={{ borderColor: theme.cardBorder }}>R</td>
                  <td className="border p-2 text-center" style={{ borderColor: theme.cardBorder }}>C</td>
                  <td className="border p-2 text-center font-bold text-green-600" style={{ borderColor: theme.cardBorder }}>A</td>
                  <td className="border p-2 text-center" style={{ borderColor: theme.cardBorder }}>C</td>
                  <td className="border p-2 text-center" style={{ borderColor: theme.cardBorder }}>-</td>
                  <td className="border p-2 text-center" style={{ borderColor: theme.cardBorder }}>-</td>
                  <td className="border p-2 text-center" style={{ borderColor: theme.cardBorder }}>I</td>
                  <td className="border p-2 text-center" style={{ borderColor: theme.cardBorder }}>I</td>
                </tr>
                <tr>
                  <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>
                    Liberar veículo para viagem
                  </td>
                  <td className="border p-2 text-center" style={{ borderColor: theme.cardBorder }}>C</td>
                  <td className="border p-2 text-center font-bold text-blue-600" style={{ borderColor: theme.cardBorder }}>R</td>
                  <td className="border p-2 text-center font-bold text-green-600" style={{ borderColor: theme.cardBorder }}>A</td>
                  <td className="border p-2 text-center" style={{ borderColor: theme.cardBorder }}>-</td>
                  <td className="border p-2 text-center" style={{ borderColor: theme.cardBorder }}>-</td>
                  <td className="border p-2 text-center" style={{ borderColor: theme.cardBorder }}>-</td>
                  <td className="border p-2 text-center" style={{ borderColor: theme.cardBorder }}>I</td>
                  <td className="border p-2 text-center" style={{ borderColor: theme.cardBorder }}>I</td>
                </tr>
                <tr>
                  <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>
                    Transportar carga (viagem)
                  </td>
                  <td className="border p-2 text-center" style={{ borderColor: theme.cardBorder }}>I</td>
                  <td className="border p-2 text-center" style={{ borderColor: theme.cardBorder }}>I</td>
                  <td className="border p-2 text-center font-bold text-green-600" style={{ borderColor: theme.cardBorder }}>A</td>
                  <td className="border p-2 text-center" style={{ borderColor: theme.cardBorder }}>-</td>
                  <td className="border p-2 text-center" style={{ borderColor: theme.cardBorder }}>-</td>
                  <td className="border p-2 text-center" style={{ borderColor: theme.cardBorder }}>-</td>
                  <td className="border p-2 text-center font-bold text-blue-600" style={{ borderColor: theme.cardBorder }}>R</td>
                  <td className="border p-2 text-center" style={{ borderColor: theme.cardBorder }}>I</td>
                </tr>
                <tr>
                  <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>
                    Comprovar descarga/entrega
                  </td>
                  <td className="border p-2 text-center" style={{ borderColor: theme.cardBorder }}>I</td>
                  <td className="border p-2 text-center" style={{ borderColor: theme.cardBorder }}>I</td>
                  <td className="border p-2 text-center" style={{ borderColor: theme.cardBorder }}>I</td>
                  <td className="border p-2 text-center" style={{ borderColor: theme.cardBorder }}>-</td>
                  <td className="border p-2 text-center" style={{ borderColor: theme.cardBorder }}>-</td>
                  <td className="border p-2 text-center" style={{ borderColor: theme.cardBorder }}>I</td>
                  <td className="border p-2 text-center font-bold text-blue-600" style={{ borderColor: theme.cardBorder }}>R</td>
                  <td className="border p-2 text-center font-bold text-green-600" style={{ borderColor: theme.cardBorder }}>A</td>
                </tr>

                {/* MONITORAMENTO */}
                <tr>
                  <td className="border p-2 font-semibold bg-purple-50 dark:bg-purple-900/20" colSpan="9" style={{ borderColor: theme.cardBorder, color: theme.text }}>
                    FASE 3: MONITORAMENTO
                  </td>
                </tr>
                <tr>
                  <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>
                    Atualizar status tracking (IT-LOG-002)
                  </td>
                  <td className="border p-2 text-center font-bold text-blue-600" style={{ borderColor: theme.cardBorder }}>R</td>
                  <td className="border p-2 text-center font-bold text-green-600" style={{ borderColor: theme.cardBorder }}>A</td>
                  <td className="border p-2 text-center" style={{ borderColor: theme.cardBorder }}>I</td>
                  <td className="border p-2 text-center" style={{ borderColor: theme.cardBorder }}>-</td>
                  <td className="border p-2 text-center" style={{ borderColor: theme.cardBorder }}>-</td>
                  <td className="border p-2 text-center" style={{ borderColor: theme.cardBorder }}>-</td>
                  <td className="border p-2 text-center" style={{ borderColor: theme.cardBorder }}>C</td>
                  <td className="border p-2 text-center" style={{ borderColor: theme.cardBorder }}>I</td>
                </tr>
                <tr>
                  <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>
                    Monitorar SLA (carregamento/descarga)
                  </td>
                  <td className="border p-2 text-center" style={{ borderColor: theme.cardBorder }}>C</td>
                  <td className="border p-2 text-center" style={{ borderColor: theme.cardBorder }}>C</td>
                  <td className="border p-2 text-center font-bold text-blue-600" style={{ borderColor: theme.cardBorder }}>R</td>
                  <td className="border p-2 text-center" style={{ borderColor: theme.cardBorder }}>C</td>
                  <td className="border p-2 text-center" style={{ borderColor: theme.cardBorder }}>I</td>
                  <td className="border p-2 text-center" style={{ borderColor: theme.cardBorder }}>-</td>
                  <td className="border p-2 text-center" style={{ borderColor: theme.cardBorder }}>-</td>
                  <td className="border p-2 text-center font-bold text-green-600" style={{ borderColor: theme.cardBorder }}>A</td>
                </tr>
                <tr>
                  <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>
                    Registrar ocorrência (IT-LOG-003)
                  </td>
                  <td className="border p-2 text-center font-bold text-blue-600" style={{ borderColor: theme.cardBorder }}>R</td>
                  <td className="border p-2 text-center" style={{ borderColor: theme.cardBorder }}>I</td>
                  <td className="border p-2 text-center" style={{ borderColor: theme.cardBorder }}>I</td>
                  <td className="border p-2 text-center font-bold text-green-600" style={{ borderColor: theme.cardBorder }}>A</td>
                  <td className="border p-2 text-center" style={{ borderColor: theme.cardBorder }}>-</td>
                  <td className="border p-2 text-center" style={{ borderColor: theme.cardBorder }}>-</td>
                  <td className="border p-2 text-center" style={{ borderColor: theme.cardBorder }}>C</td>
                  <td className="border p-2 text-center" style={{ borderColor: theme.cardBorder }}>I</td>
                </tr>
                <tr>
                  <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>
                    Tratar ocorrência
                  </td>
                  <td className="border p-2 text-center font-bold text-blue-600" style={{ borderColor: theme.cardBorder }}>R</td>
                  <td className="border p-2 text-center" style={{ borderColor: theme.cardBorder }}>C</td>
                  <td className="border p-2 text-center" style={{ borderColor: theme.cardBorder }}>C</td>
                  <td className="border p-2 text-center font-bold text-green-600" style={{ borderColor: theme.cardBorder }}>A</td>
                  <td className="border p-2 text-center" style={{ borderColor: theme.cardBorder }}>-</td>
                  <td className="border p-2 text-center" style={{ borderColor: theme.cardBorder }}>-</td>
                  <td className="border p-2 text-center" style={{ borderColor: theme.cardBorder }}>C</td>
                  <td className="border p-2 text-center" style={{ borderColor: theme.cardBorder }}>I</td>
                </tr>

                {/* FINALIZAÇÃO */}
                <tr>
                  <td className="border p-2 font-semibold bg-gray-50 dark:bg-gray-900/20" colSpan="9" style={{ borderColor: theme.cardBorder, color: theme.text }}>
                    FASE 4: FINALIZAÇÃO
                  </td>
                </tr>
                <tr>
                  <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>
                    Validar comprovante de entrega
                  </td>
                  <td className="border p-2 text-center font-bold text-blue-600" style={{ borderColor: theme.cardBorder }}>R</td>
                  <td className="border p-2 text-center font-bold text-green-600" style={{ borderColor: theme.cardBorder }}>A</td>
                  <td className="border p-2 text-center" style={{ borderColor: theme.cardBorder }}>I</td>
                  <td className="border p-2 text-center" style={{ borderColor: theme.cardBorder }}>-</td>
                  <td className="border p-2 text-center" style={{ borderColor: theme.cardBorder }}>I</td>
                  <td className="border p-2 text-center" style={{ borderColor: theme.cardBorder }}>I</td>
                  <td className="border p-2 text-center" style={{ borderColor: theme.cardBorder }}>C</td>
                  <td className="border p-2 text-center" style={{ borderColor: theme.cardBorder }}>I</td>
                </tr>
                <tr>
                  <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>
                    Calcular e aprovar diárias (se aplicável)
                  </td>
                  <td className="border p-2 text-center" style={{ borderColor: theme.cardBorder }}>C</td>
                  <td className="border p-2 text-center" style={{ borderColor: theme.cardBorder }}>C</td>
                  <td className="border p-2 text-center font-bold text-blue-600" style={{ borderColor: theme.cardBorder }}>R</td>
                  <td className="border p-2 text-center font-bold text-green-600" style={{ borderColor: theme.cardBorder }}>A</td>
                  <td className="border p-2 text-center" style={{ borderColor: theme.cardBorder }}>C</td>
                  <td className="border p-2 text-center" style={{ borderColor: theme.cardBorder }}>I</td>
                  <td className="border p-2 text-center" style={{ borderColor: theme.cardBorder }}>-</td>
                  <td className="border p-2 text-center" style={{ borderColor: theme.cardBorder }}>C</td>
                </tr>
                <tr>
                  <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>
                    Fechamento financeiro (frete + diárias)
                  </td>
                  <td className="border p-2 text-center" style={{ borderColor: theme.cardBorder }}>I</td>
                  <td className="border p-2 text-center" style={{ borderColor: theme.cardBorder }}>I</td>
                  <td className="border p-2 text-center" style={{ borderColor: theme.cardBorder }}>I</td>
                  <td className="border p-2 text-center" style={{ borderColor: theme.cardBorder }}>-</td>
                  <td className="border p-2 text-center" style={{ borderColor: theme.cardBorder }}>C</td>
                  <td className="border p-2 text-center font-bold text-blue-600" style={{ borderColor: theme.cardBorder }}>R</td>
                  <td className="border p-2 text-center" style={{ borderColor: theme.cardBorder }}>-</td>
                  <td className="border p-2 text-center font-bold text-green-600" style={{ borderColor: theme.cardBorder }}>A</td>
                </tr>
                <tr>
                  <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>
                    Arquivar documentação
                  </td>
                  <td className="border p-2 text-center font-bold text-blue-600" style={{ borderColor: theme.cardBorder }}>R</td>
                  <td className="border p-2 text-center" style={{ borderColor: theme.cardBorder }}>-</td>
                  <td className="border p-2 text-center font-bold text-green-600" style={{ borderColor: theme.cardBorder }}>A</td>
                  <td className="border p-2 text-center" style={{ borderColor: theme.cardBorder }}>C</td>
                  <td className="border p-2 text-center" style={{ borderColor: theme.cardBorder }}>-</td>
                  <td className="border p-2 text-center" style={{ borderColor: theme.cardBorder }}>-</td>
                  <td className="border p-2 text-center" style={{ borderColor: theme.cardBorder }}>-</td>
                  <td className="border p-2 text-center" style={{ borderColor: theme.cardBorder }}>-</td>
                </tr>

                {/* MELHORIA */}
                <tr>
                  <td className="border p-2 font-semibold bg-yellow-50 dark:bg-yellow-900/20" colSpan="9" style={{ borderColor: theme.cardBorder, color: theme.text }}>
                    MELHORIA CONTÍNUA
                  </td>
                </tr>
                <tr>
                  <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>
                    Análise de causa raiz (5 Porquês)
                  </td>
                  <td className="border p-2 text-center" style={{ borderColor: theme.cardBorder }}>C</td>
                  <td className="border p-2 text-center" style={{ borderColor: theme.cardBorder }}>C</td>
                  <td className="border p-2 text-center" style={{ borderColor: theme.cardBorder }}>C</td>
                  <td className="border p-2 text-center font-bold text-blue-600" style={{ borderColor: theme.cardBorder }}>R</td>
                  <td className="border p-2 text-center" style={{ borderColor: theme.cardBorder }}>-</td>
                  <td className="border p-2 text-center" style={{ borderColor: theme.cardBorder }}>-</td>
                  <td className="border p-2 text-center" style={{ borderColor: theme.cardBorder }}>C</td>
                  <td className="border p-2 text-center" style={{ borderColor: theme.cardBorder }}>-</td>
                </tr>
                <tr>
                  <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>
                    Implementar ação corretiva
                  </td>
                  <td className="border p-2 text-center font-bold text-blue-600" style={{ borderColor: theme.cardBorder }}>R</td>
                  <td className="border p-2 text-center" style={{ borderColor: theme.cardBorder }}>C</td>
                  <td className="border p-2 text-center font-bold text-green-600" style={{ borderColor: theme.cardBorder }}>A</td>
                  <td className="border p-2 text-center" style={{ borderColor: theme.cardBorder }}>C</td>
                  <td className="border p-2 text-center" style={{ borderColor: theme.cardBorder }}>-</td>
                  <td className="border p-2 text-center" style={{ borderColor: theme.cardBorder }}>-</td>
                  <td className="border p-2 text-center" style={{ borderColor: theme.cardBorder }}>C</td>
                  <td className="border p-2 text-center" style={{ borderColor: theme.cardBorder }}>-</td>
                </tr>
                <tr>
                  <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>
                    Análise crítica mensal
                  </td>
                  <td className="border p-2 text-center" style={{ borderColor: theme.cardBorder }}>I</td>
                  <td className="border p-2 text-center" style={{ borderColor: theme.cardBorder }}>C</td>
                  <td className="border p-2 text-center font-bold text-blue-600" style={{ borderColor: theme.cardBorder }}>R</td>
                  <td className="border p-2 text-center" style={{ borderColor: theme.cardBorder }}>C</td>
                  <td className="border p-2 text-center" style={{ borderColor: theme.cardBorder }}>C</td>
                  <td className="border p-2 text-center" style={{ borderColor: theme.cardBorder }}>C</td>
                  <td className="border p-2 text-center" style={{ borderColor: theme.cardBorder }}>-</td>
                  <td className="border p-2 text-center font-bold text-green-600" style={{ borderColor: theme.cardBorder }}>A</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* ANEXO C - SLA por Operação */}
      <Card style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}>
        <CardContent className="p-8 space-y-6">
          <div className="border-b pb-4" style={{ borderColor: theme.cardBorder }}>
            <h2 className="text-xl font-bold mb-2" style={{ color: theme.text }}>
              ANEXO C - TABELA DE SLA POR TIPO DE OPERAÇÃO
            </h2>
            <p className="text-sm" style={{ color: theme.textMuted }}>
              Referência: PO-LOG-001 | Padrões sugeridos para cadastro de Operações no sistema
            </p>
          </div>

          <table className="w-full text-xs border" style={{ borderColor: theme.cardBorder }}>
            <thead style={{ backgroundColor: isDark ? '#0f172a' : '#f3f4f6' }}>
              <tr>
                <th className="border p-2 text-left" style={{ borderColor: theme.cardBorder, color: theme.text }}>
                  Tipo de Operação
                </th>
                <th className="border p-2 text-left" style={{ borderColor: theme.cardBorder, color: theme.text }}>
                  Modalidade
                </th>
                <th className="border p-2 text-center" style={{ borderColor: theme.cardBorder, color: theme.text }}>
                  Tolerância<br/>Carregamento
                </th>
                <th className="border p-2 text-center" style={{ borderColor: theme.cardBorder, color: theme.text }}>
                  Tolerância<br/>Descarga
                </th>
                <th className="border p-2 text-center" style={{ borderColor: theme.cardBorder, color: theme.text }}>
                  Prazo<br/>Entrega
                </th>
                <th className="border p-2 text-left" style={{ borderColor: theme.cardBorder, color: theme.text }}>
                  Observações
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border p-2 font-semibold" style={{ borderColor: theme.cardBorder, color: theme.text }}>
                  Transporte Rodoviário Padrão
                </td>
                <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>Normal</td>
                <td className="border p-2 text-center" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>24h</td>
                <td className="border p-2 text-center" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>24h</td>
                <td className="border p-2 text-center" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>
                  Agend. + 5 dias úteis
                </td>
                <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>
                  Operação genérica curta/média distância
                </td>
              </tr>
              <tr>
                <td className="border p-2 font-semibold" style={{ borderColor: theme.cardBorder, color: theme.text }}>
                  Minério - Vale (Vitória/ES)
                </td>
                <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>Normal</td>
                <td className="border p-2 text-center" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>48h</td>
                <td className="border p-2 text-center" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>72h</td>
                <td className="border p-2 text-center" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>
                  Agenda descarga<br/><span className="text-[10px]">(flag ativa)</span>
                </td>
                <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>
                  Tolerância maior devido complexidade logística portuária
                </td>
              </tr>
              <tr>
                <td className="border p-2 font-semibold" style={{ borderColor: theme.cardBorder, color: theme.text }}>
                  Transporte Expresso
                </td>
                <td className="border p-2 text-orange-600 font-semibold" style={{ borderColor: theme.cardBorder }}>Expresso</td>
                <td className="border p-2 text-center" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>8h</td>
                <td className="border p-2 text-center" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>8h</td>
                <td className="border p-2 text-center" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>
                  Agend. + 2 dias úteis
                </td>
                <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>
                  Tolerância reduzida, acompanhamento intensivo
                </td>
              </tr>
              <tr>
                <td className="border p-2 font-semibold" style={{ borderColor: theme.cardBorder, color: theme.text }}>
                  Distribuição Urbana (Last Mile)
                </td>
                <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>Normal</td>
                <td className="border p-2 text-center" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>4h</td>
                <td className="border p-2 text-center" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>4h</td>
                <td className="border p-2 text-center" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>
                  Mesmo dia
                </td>
                <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>
                  Múltiplas entregas, janelas de tempo restritas
                </td>
              </tr>
              <tr>
                <td className="border p-2 font-semibold" style={{ borderColor: theme.cardBorder, color: theme.text }}>
                  Transferência entre Filiais
                </td>
                <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>Normal</td>
                <td className="border p-2 text-center" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>12h</td>
                <td className="border p-2 text-center" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>12h</td>
                <td className="border p-2 text-center" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>
                  Agend. + 3 dias úteis
                </td>
                <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>
                  Cliente interno, flexibilidade maior
                </td>
              </tr>
              <tr>
                <td className="border p-2 font-semibold" style={{ borderColor: theme.cardBorder, color: theme.text }}>
                  Carga Frigorificada
                </td>
                <td className="border p-2 text-yellow-600 font-semibold" style={{ borderColor: theme.cardBorder }}>Prioridade</td>
                <td className="border p-2 text-center" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>6h</td>
                <td className="border p-2 text-center" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>6h</td>
                <td className="border p-2 text-center" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>
                  Agend. + 48h corridas
                </td>
                <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>
                  Controle de temperatura obrigatório
                </td>
              </tr>
              <tr>
                <td className="border p-2 font-semibold" style={{ borderColor: theme.cardBorder, color: theme.text }}>
                  Coleta B2B (Portal Fornecedor)
                </td>
                <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>Normal</td>
                <td className="border p-2 text-center" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>24h</td>
                <td className="border p-2 text-center" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>48h</td>
                <td className="border p-2 text-center" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>
                  Agend. + 7 dias úteis
                </td>
                <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>
                  Aguarda aprovação cliente (até 8h)
                </td>
              </tr>
            </tbody>
          </table>

          <div className="border rounded p-3 text-xs" style={{ backgroundColor: theme.headerBg, borderColor: theme.cardBorder }}>
            <p className="font-semibold mb-1" style={{ color: theme.text }}>IMPORTANTE - Dias Úteis vs Corridos:</p>
            <p style={{ color: theme.textMuted }}>
              O sistema calcula automaticamente com base na flag "prazo_entrega_dias_uteis" da operação:<br/>
              • <strong>Dias Úteis:</strong> Conta apenas seg-sex, pula sáb/dom e feriados<br/>
              • <strong>Dias Corridos:</strong> Conta todos os dias incluindo fins de semana
            </p>
          </div>
        </CardContent>
      </Card>

      {/* ANEXO D - Checklist Pré-Viagem */}
      <Card style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}>
        <CardContent className="p-8 space-y-6">
          <div className="border-b pb-4" style={{ borderColor: theme.cardBorder }}>
            <h2 className="text-xl font-bold mb-2" style={{ color: theme.text }}>
              ANEXO D - CHECKLIST DE VISTORIA PRÉ-VIAGEM
            </h2>
            <p className="text-sm" style={{ color: theme.textMuted }}>
              Referência: PO-LOG-001 | Conformidade: SASSMAQ v.7 (elemento 3.1) | Resolução CONTRAN nº 918/2022
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold text-sm mb-3 bg-blue-600 text-white px-3 py-2 rounded">
                DOCUMENTAÇÃO DO MOTORISTA
              </h4>
              <table className="w-full text-xs border" style={{ borderColor: theme.cardBorder }}>
                <tbody>
                  <tr>
                    <td className="border p-2 w-10 text-center" style={{ borderColor: theme.cardBorder }}>☐</td>
                    <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>
                      CNH válida e categoria adequada
                    </td>
                  </tr>
                  <tr>
                    <td className="border p-2 text-center" style={{ borderColor: theme.cardBorder }}>☐</td>
                    <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>
                      RNTRC ativo
                    </td>
                  </tr>
                  <tr>
                    <td className="border p-2 text-center" style={{ borderColor: theme.cardBorder }}>☐</td>
                    <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>
                      Curso MOPP (se carga perigosa)
                    </td>
                  </tr>
                  <tr>
                    <td className="border p-2 text-center" style={{ borderColor: theme.cardBorder }}>☐</td>
                    <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>
                      Exame toxicológico válido
                    </td>
                  </tr>
                  <tr>
                    <td className="border p-2 text-center" style={{ borderColor: theme.cardBorder }}>☐</td>
                    <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>
                      <strong>Teste de bafômetro APROVADO</strong>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div>
              <h4 className="font-semibold text-sm mb-3 bg-blue-600 text-white px-3 py-2 rounded">
                DOCUMENTAÇÃO DO VEÍCULO
              </h4>
              <table className="w-full text-xs border" style={{ borderColor: theme.cardBorder }}>
                <tbody>
                  <tr>
                    <td className="border p-2 w-10 text-center" style={{ borderColor: theme.cardBorder }}>☐</td>
                    <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>
                      CRLV válido (licenciamento em dia)
                    </td>
                  </tr>
                  <tr>
                    <td className="border p-2 text-center" style={{ borderColor: theme.cardBorder }}>☐</td>
                    <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>
                      <strong>ANTT ativo e regular</strong>
                    </td>
                  </tr>
                  <tr>
                    <td className="border p-2 text-center" style={{ borderColor: theme.cardBorder }}>☐</td>
                    <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>
                      Seguro RCTR-C vigente
                    </td>
                  </tr>
                  <tr>
                    <td className="border p-2 text-center" style={{ borderColor: theme.cardBorder }}>☐</td>
                    <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>
                      Certificado de tacógrafo (se obrigatório)
                    </td>
                  </tr>
                  <tr>
                    <td className="border p-2 text-center" style={{ borderColor: theme.cardBorder }}>☐</td>
                    <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>
                      Certificado de vistoria (se aplicável)
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div>
              <h4 className="font-semibold text-sm mb-3 bg-green-600 text-white px-3 py-2 rounded">
                CONDIÇÕES DO VEÍCULO
              </h4>
              <table className="w-full text-xs border" style={{ borderColor: theme.cardBorder }}>
                <tbody>
                  <tr>
                    <td className="border p-2 w-10 text-center" style={{ borderColor: theme.cardBorder }}>☐</td>
                    <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>
                      Pneus em bom estado (sulco mín 1,6mm)
                    </td>
                  </tr>
                  <tr>
                    <td className="border p-2 text-center" style={{ borderColor: theme.cardBorder }}>☐</td>
                    <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>
                      Freios testados e funcionando
                    </td>
                  </tr>
                  <tr>
                    <td className="border p-2 text-center" style={{ borderColor: theme.cardBorder }}>☐</td>
                    <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>
                      Sistema elétrico (faróis, setas, lanternas)
                    </td>
                  </tr>
                  <tr>
                    <td className="border p-2 text-center" style={{ borderColor: theme.cardBorder }}>☐</td>
                    <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>
                      Nível de óleo, água e combustível adequados
                    </td>
                  </tr>
                  <tr>
                    <td className="border p-2 text-center" style={{ borderColor: theme.cardBorder }}>☐</td>
                    <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>
                      Extintor de incêndio com carga válida
                    </td>
                  </tr>
                  <tr>
                    <td className="border p-2 text-center" style={{ borderColor: theme.cardBorder }}>☐</td>
                    <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>
                      Triângulo de sinalização e kit primeiros socorros
                    </td>
                  </tr>
                  <tr>
                    <td className="border p-2 text-center" style={{ borderColor: theme.cardBorder }}>☐</td>
                    <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>
                      Carroceria sem danos, lonas/travas funcionando
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div>
              <h4 className="font-semibold text-sm mb-3 bg-green-600 text-white px-3 py-2 rounded">
                RASTREAMENTO E SEGURANÇA
              </h4>
              <table className="w-full text-xs border" style={{ borderColor: theme.cardBorder }}>
                <tbody>
                  <tr>
                    <td className="border p-2 w-10 text-center" style={{ borderColor: theme.cardBorder }}>☐</td>
                    <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>
                      <strong>Rastreador instalado e testado</strong>
                    </td>
                  </tr>
                  <tr>
                    <td className="border p-2 text-center" style={{ borderColor: theme.cardBorder }}>☐</td>
                    <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>
                      Sinal GPS ativo e transmitindo
                    </td>
                  </tr>
                  <tr>
                    <td className="border p-2 text-center" style={{ borderColor: theme.cardBorder }}>☐</td>
                    <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>
                      Motorista com celular carregado e chip ativo
                    </td>
                  </tr>
                  <tr>
                    <td className="border p-2 text-center" style={{ borderColor: theme.cardBorder }}>☐</td>
                    <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>
                      App Motorista instalado e funcional
                    </td>
                  </tr>
                  <tr>
                    <td className="border p-2 text-center" style={{ borderColor: theme.cardBorder }}>☐</td>
                    <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>
                      Lacres de segurança (se necessário)
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div>
              <h4 className="font-semibold text-sm mb-3 bg-purple-600 text-white px-3 py-2 rounded">
                CARGA E DOCUMENTAÇÃO
              </h4>
              <table className="w-full text-xs border" style={{ borderColor: theme.cardBorder }}>
                <tbody>
                  <tr>
                    <td className="border p-2 w-10 text-center" style={{ borderColor: theme.cardBorder }}>☐</td>
                    <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>
                      Ordem de Carregamento impressa ou digital
                    </td>
                  </tr>
                  <tr>
                    <td className="border p-2 text-center" style={{ borderColor: theme.cardBorder }}>☐</td>
                    <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>
                      DANFE das NF-e (via sistema ou impresso)
                    </td>
                  </tr>
                  <tr>
                    <td className="border p-2 text-center" style={{ borderColor: theme.cardBorder }}>☐</td>
                    <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>
                      CT-e emitido (quando obrigatório)
                    </td>
                  </tr>
                  <tr>
                    <td className="border p-2 text-center" style={{ borderColor: theme.cardBorder }}>☐</td>
                    <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>
                      MDF-e emitido (quando obrigatório)
                    </td>
                  </tr>
                  <tr>
                    <td className="border p-2 text-center" style={{ borderColor: theme.cardBorder }}>☐</td>
                    <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>
                      <strong>Espelhamento realizado</strong> (fotos carga, caçamba, lacres)
                    </td>
                  </tr>
                  <tr>
                    <td className="border p-2 text-center" style={{ borderColor: theme.cardBorder }}>☐</td>
                    <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>
                      Peso conferido (não excede CMT/PBT)
                    </td>
                  </tr>
                  <tr>
                    <td className="border p-2 text-center" style={{ borderColor: theme.cardBorder }}>☐</td>
                    <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>
                      Carga devidamente amarrada/peada
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div>
              <h4 className="font-semibold text-sm mb-3 bg-purple-600 text-white px-3 py-2 rounded">
                LIBERAÇÃO FINAL
              </h4>
              <table className="w-full text-xs border" style={{ borderColor: theme.cardBorder }}>
                <tbody>
                  <tr>
                    <td className="border p-2 w-10 text-center" style={{ borderColor: theme.cardBorder }}>☐</td>
                    <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>
                      Todos os itens acima conferidos
                    </td>
                  </tr>
                  <tr>
                    <td className="border p-2 text-center" style={{ borderColor: theme.cardBorder }}>☐</td>
                    <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>
                      Motorista orientado sobre rota e prazos
                    </td>
                  </tr>
                  <tr>
                    <td className="border p-2 text-center" style={{ borderColor: theme.cardBorder }}>☐</td>
                    <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>
                      Telefones de emergência fornecidos
                    </td>
                  </tr>
                  <tr>
                    <td className="border p-2 text-center" style={{ borderColor: theme.cardBorder }}>☐</td>
                    <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>
                      App Motorista testado e funcionando
                    </td>
                  </tr>
                </tbody>
              </table>

              <div className="mt-4 border-t pt-3" style={{ borderColor: theme.cardBorder }}>
                <p className="text-xs font-semibold mb-2" style={{ color: theme.text }}>Responsável pela Vistoria:</p>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <p style={{ color: theme.textMuted }}>Nome:</p>
                    <div className="border-b border-black mt-2 pb-1"></div>
                  </div>
                  <div>
                    <p style={{ color: theme.textMuted }}>Data/Hora:</p>
                    <div className="border-b border-black mt-2 pb-1"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="border-2 rounded p-3 text-xs" style={{ backgroundColor: theme.headerBg, borderColor: theme.text }}>
            <p className="font-semibold mb-1" style={{ color: theme.text }}>⚠️ CRITÉRIO DE BLOQUEIO - Não Liberar Viagem Se:</p>
            <ul className="list-disc ml-6 space-y-1" style={{ color: theme.textMuted }}>
              <li>Bafômetro REPROVADO (tolerância zero para álcool)</li>
              <li>CNH vencida ou categoria incompatível</li>
              <li>ANTT irregular ou inativo</li>
              <li>Rastreador não funcionando (obrigatório para cargas acima de R$ 50k)</li>
              <li>Condições inseguras do veículo (freios, pneus carecas)</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* ANEXO E - Matriz de Riscos */}
      <Card style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}>
        <CardContent className="p-8 space-y-6">
          <div className="border-b pb-4" style={{ borderColor: theme.cardBorder }}>
            <h2 className="text-xl font-bold mb-2" style={{ color: theme.text }}>
              ANEXO E - MATRIZ DE RISCOS OPERACIONAIS (ISO 31000)
            </h2>
            <p className="text-sm mb-3" style={{ color: theme.textMuted }}>
              Referência: PO-LOG-001 | Avaliação de Riscos conforme SASSMAQ 4.2 e ISO 31000:2018
            </p>
            <div className="grid grid-cols-3 gap-2 text-[10px]">
              <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded text-center">
                <strong className="text-green-600">BAIXO:</strong> Prob × Imp ≤ 4
              </div>
              <div className="bg-yellow-100 dark:bg-yellow-900/30 p-2 rounded text-center">
                <strong className="text-yellow-600">MÉDIO:</strong> Prob × Imp = 5-9
              </div>
              <div className="bg-red-100 dark:bg-red-900/30 p-2 rounded text-center">
                <strong className="text-red-600">ALTO/CRÍTICO:</strong> Prob × Imp ≥ 10
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-[10px] border" style={{ borderColor: theme.cardBorder }}>
              <thead style={{ backgroundColor: isDark ? '#0f172a' : '#f3f4f6' }}>
                <tr>
                  <th className="border p-2 text-left" style={{ borderColor: theme.cardBorder, color: theme.text }}>
                    Risco Identificado
                  </th>
                  <th className="border p-2 text-center w-16" style={{ borderColor: theme.cardBorder, color: theme.text }}>
                    Prob.<br/>(1-5)
                  </th>
                  <th className="border p-2 text-center w-16" style={{ borderColor: theme.cardBorder, color: theme.text }}>
                    Impacto<br/>(1-5)
                  </th>
                  <th className="border p-2 text-center w-16" style={{ borderColor: theme.cardBorder, color: theme.text }}>
                    Nível
                  </th>
                  <th className="border p-2 text-left" style={{ borderColor: theme.cardBorder, color: theme.text }}>
                    Controle Preventivo Implementado
                  </th>
                  <th className="border p-2 text-left" style={{ borderColor: theme.cardBorder, color: theme.text }}>
                    Plano de Contingência (Se Ocorrer)
                  </th>
                  <th className="border p-2 text-left w-24" style={{ borderColor: theme.cardBorder, color: theme.text }}>
                    Responsável
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>
                    Atraso no carregamento (além tolerância)
                  </td>
                  <td className="border p-2 text-center font-bold" style={{ borderColor: theme.cardBorder }}>3</td>
                  <td className="border p-2 text-center font-bold" style={{ borderColor: theme.cardBorder }}>4</td>
                  <td className="border p-2 text-center font-bold bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600" style={{ borderColor: theme.cardBorder }}>
                    12<br/>MÉDIO
                  </td>
                  <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>
                    • Agendamento obrigatório<br/>
                    • Tolerância configurada (24-48h)<br/>
                    • Alertas automáticos via sistema<br/>
                    • Comunicação prévia com remetente
                  </td>
                  <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>
                    1. Registrar ocorrência (IT-LOG-003)<br/>
                    2. Calcular impacto no prazo<br/>
                    3. Avaliar diária (sistema automático)<br/>
                    4. Comunicar cliente imediatamente<br/>
                    5. Reprogramar descarga se necessário
                  </td>
                  <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>
                    Coord.<br/>Operações
                  </td>
                </tr>
                <tr>
                  <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>
                    Falta de veículo adequado disponível
                  </td>
                  <td className="border p-2 text-center font-bold" style={{ borderColor: theme.cardBorder }}>2</td>
                  <td className="border p-2 text-center font-bold" style={{ borderColor: theme.cardBorder }}>4</td>
                  <td className="border p-2 text-center font-bold bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600" style={{ borderColor: theme.cardBorder }}>
                    8<br/>MÉDIO
                  </td>
                  <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>
                    • Pool de parceiros cadastrados<br/>
                    • Ofertas públicas (portal)<br/>
                    • Frota reserva planejada<br/>
                    • Contratos com agregados
                  </td>
                  <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>
                    1. Acionar parceiros cadastrados<br/>
                    2. Publicar oferta (exportar PDF)<br/>
                    3. Negociar frete spot<br/>
                    4. Validar ANTT do agregado<br/>
                    5. Comunicar ajuste de prazo ao cliente
                  </td>
                  <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>
                    Coord.<br/>Expedição
                  </td>
                </tr>
                <tr>
                  <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>
                    Avaria ou extravio de carga
                  </td>
                  <td className="border p-2 text-center font-bold" style={{ borderColor: theme.cardBorder }}>2</td>
                  <td className="border p-2 text-center font-bold" style={{ borderColor: theme.cardBorder }}>5</td>
                  <td className="border p-2 text-center font-bold bg-red-100 dark:bg-red-900/30 text-red-600" style={{ borderColor: theme.cardBorder }}>
                    10<br/>ALTO
                  </td>
                  <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>
                    • Seguro RCTR-C obrigatório<br/>
                    • Rastreamento GPS 24/7<br/>
                    • Vistoria pré-viagem<br/>
                    • Treinamento motorista<br/>
                    • Espelhamento fotográfico
                  </td>
                  <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>
                    1. Acionar seguradora (sinistro)<br/>
                    2. Registrar RNC (IT-LOG-003)<br/>
                    3. Vistoria técnica<br/>
                    4. Laudo pericial<br/>
                    5. Análise causa raiz (Anexo F)<br/>
                    6. Ação preventiva
                  </td>
                  <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>
                    Dir.<br/>Operações
                  </td>
                </tr>
                <tr>
                  <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>
                    Quebra mecânica do veículo em viagem
                  </td>
                  <td className="border p-2 text-center font-bold" style={{ borderColor: theme.cardBorder }}>3</td>
                  <td className="border p-2 text-center font-bold" style={{ borderColor: theme.cardBorder }}>3</td>
                  <td className="border p-2 text-center font-bold bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600" style={{ borderColor: theme.cardBorder }}>
                    9<br/>MÉDIO
                  </td>
                  <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>
                    • Manutenção preventiva programada<br/>
                    • Controle de vencimentos<br/>
                    • Check-list pré-viagem<br/>
                    • Rede de oficinas credenciadas
                  </td>
                  <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>
                    1. Motorista aciona guincho<br/>
                    2. Registrar ocorrência tracking<br/>
                    3. Oficina mais próxima<br/>
                    4. Avaliar transbordo (se urgente)<br/>
                    5. Comunicar novo prazo ao cliente
                  </td>
                  <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>
                    Coord.<br/>Operações
                  </td>
                </tr>
                <tr>
                  <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>
                    Acidente rodoviário (colisão, tombamento)
                  </td>
                  <td className="border p-2 text-center font-bold" style={{ borderColor: theme.cardBorder }}>2</td>
                  <td className="border p-2 text-center font-bold" style={{ borderColor: theme.cardBorder }}>5</td>
                  <td className="border p-2 text-center font-bold bg-red-100 dark:bg-red-900/30 text-red-600" style={{ borderColor: theme.cardBorder }}>
                    10<br/>CRÍTICO
                  </td>
                  <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>
                    • Treinamento direção defensiva<br/>
                    • Controle jornada (máx 8h)<br/>
                    • Vistoria veicular rigorosa<br/>
                    • Monitoramento GPS comportamento
                  </td>
                  <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>
                    1. <strong>PROTOCOLO EMERGÊNCIA 24H</strong><br/>
                    2. Acionar SAMU/Bombeiros<br/>
                    3. Boletim Ocorrência (PRF/PC)<br/>
                    4. Acionar seguro (DPVAT + RCTR-C)<br/>
                    5. Investigação completa<br/>
                    6. RNC + análise causa raiz
                  </td>
                  <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>
                    Diretor<br/>Executivo
                  </td>
                </tr>
                <tr>
                  <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>
                    Dados incorretos/incompletos na ordem
                  </td>
                  <td className="border p-2 text-center font-bold" style={{ borderColor: theme.cardBorder }}>3</td>
                  <td className="border p-2 text-center font-bold" style={{ borderColor: theme.cardBorder }}>2</td>
                  <td className="border p-2 text-center font-bold bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600" style={{ borderColor: theme.cardBorder }}>
                    6<br/>MÉDIO
                  </td>
                  <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>
                    • Validação automática campos<br/>
                    • Campos obrigatórios (*)<br/>
                    • Dupla checagem coordenador<br/>
                    • Treinamento operadores
                  </td>
                  <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>
                    1. Correção inline imediata<br/>
                    2. Notificar responsável<br/>
                    3. Registrar em observações<br/>
                    4. Se recorrente: treinamento<br/>
                    5. Auditoria interna
                  </td>
                  <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>
                    Coord.<br/>Operações
                  </td>
                </tr>
                <tr>
                  <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>
                    Roubo de carga
                  </td>
                  <td className="border p-2 text-center font-bold" style={{ borderColor: theme.cardBorder }}>2</td>
                  <td className="border p-2 text-center font-bold" style={{ borderColor: theme.cardBorder }}>5</td>
                  <td className="border p-2 text-center font-bold bg-red-100 dark:bg-red-900/30 text-red-600" style={{ borderColor: theme.cardBorder }}>
                    10<br/>CRÍTICO
                  </td>
                  <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>
                    • Rastreamento 24/7 obrigatório<br/>
                    • Escolta (cargas alto valor)<br/>
                    • Rotas seguras pré-definidas<br/>
                    • Treinamento antiroubo
                  </td>
                  <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>
                    1. <strong>Acionar polícia (190)</strong><br/>
                    2. Bloqueio rastreador<br/>
                    3. Boletim Ocorrência<br/>
                    4. Acionar seguro<br/>
                    5. Apoio psicológico motorista<br/>
                    6. Análise rota + ação preventiva
                  </td>
                  <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>
                    Diretor<br/>Executivo
                  </td>
                </tr>
                <tr>
                  <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>
                    Vazamento de dados (LGPD)
                  </td>
                  <td className="border p-2 text-center font-bold" style={{ borderColor: theme.cardBorder }}>1</td>
                  <td className="border p-2 text-center font-bold" style={{ borderColor: theme.cardBorder }}>5</td>
                  <td className="border p-2 text-center font-bold bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600" style={{ borderColor: theme.cardBorder }}>
                    5<br/>MÉDIO
                  </td>
                  <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>
                    • Criptografia TLS + AES-256<br/>
                    • Controle acesso (RBAC)<br/>
                    • Logs de auditoria<br/>
                    • Backup diário<br/>
                    • Treinamento LGPD
                  </td>
                  <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>
                    1. <strong>Notificar ANPD em 72h</strong><br/>
                    2. Investigar origem vazamento<br/>
                    3. Conter propagação<br/>
                    4. Notificar titulares afetados<br/>
                    5. Reforço segurança<br/>
                    6. Auditoria externa
                  </td>
                  <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>
                    DPO +<br/>Dir. TI
                  </td>
                </tr>
                <tr>
                  <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>
                    Perda de certificação ISO 9001/SASSMAQ
                  </td>
                  <td className="border p-2 text-center font-bold" style={{ borderColor: theme.cardBorder }}>2</td>
                  <td className="border p-2 text-center font-bold" style={{ borderColor: theme.cardBorder }}>5</td>
                  <td className="border p-2 text-center font-bold bg-red-100 dark:bg-red-900/30 text-red-600" style={{ borderColor: theme.cardBorder }}>
                    10<br/>ALTO
                  </td>
                  <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>
                    • SGQ documentado e ativo<br/>
                    • Auditorias internas semestrais<br/>
                    • Análise crítica trimestral<br/>
                    • Gestão de NC/AC rigorosa<br/>
                    • Treinamento contínuo
                  </td>
                  <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>
                    1. Identificar não conformidades<br/>
                    2. Plano ação corretiva urgente<br/>
                    3. Auditoria extraordinária<br/>
                    4. Implementar melhorias<br/>
                    5. Solicitar recertificação
                  </td>
                  <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>
                    Gestor<br/>Qualidade
                  </td>
                </tr>
                <tr>
                  <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>
                    Indisponibilidade do sistema (downtime)
                  </td>
                  <td className="border p-2 text-center font-bold" style={{ borderColor: theme.cardBorder }}>2</td>
                  <td className="border p-2 text-center font-bold" style={{ borderColor: theme.cardBorder }}>4</td>
                  <td className="border p-2 text-center font-bold bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600" style={{ borderColor: theme.cardBorder }}>
                    8<br/>MÉDIO
                  </td>
                  <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>
                    • Infraestrutura redundante<br/>
                    • Backup automático diário<br/>
                    • Monitoramento 24/7<br/>
                    • SLA uptime 99,5%<br/>
                    • Plano de DR (RTO 4h)
                  </td>
                  <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>
                    1. Acionar suporte técnico<br/>
                    2. Ativar ambiente backup<br/>
                    3. Comunicar usuários (email/SMS)<br/>
                    4. Restaurar dados (RPO 1h)<br/>
                    5. Pós-mortem técnico
                  </td>
                  <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>
                    Diretor<br/>TI
                  </td>
                </tr>
                <tr>
                  <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>
                    Greve ou paralisação de motoristas
                  </td>
                  <td className="border p-2 text-center font-bold" style={{ borderColor: theme.cardBorder }}>2</td>
                  <td className="border p-2 text-center font-bold" style={{ borderColor: theme.cardBorder }}>4</td>
                  <td className="border p-2 text-center font-bold bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600" style={{ borderColor: theme.cardBorder }}>
                    8<br/>MÉDIO
                  </td>
                  <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>
                    • Relacionamento RH (pesquisa clima)<br/>
                    • Pagamentos em dia<br/>
                    • Benefícios competitivos<br/>
                    • Canal de comunicação aberto
                  </td>
                  <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>
                    1. Negociação com representantes<br/>
                    2. Acionar frota terceirizada<br/>
                    3. Repriorizar entregas<br/>
                    4. Comunicar clientes<br/>
                    5. Acordo + plano de normalização
                  </td>
                  <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>
                    Dir. RH +<br/>Dir. Operações
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="border rounded p-3 text-xs" style={{ backgroundColor: theme.headerBg, borderColor: theme.cardBorder }}>
            <p className="font-semibold mb-1" style={{ color: theme.text }}>ESCALA DE AVALIAÇÃO:</p>
            <div className="grid grid-cols-2 gap-4 mt-2">
              <div>
                <p className="font-semibold mb-1">Probabilidade:</p>
                <p>1 = Muito Baixa (≤5% ao ano)</p>
                <p>2 = Baixa (5-20%)</p>
                <p>3 = Média (20-50%)</p>
                <p>4 = Alta (50-80%)</p>
                <p>5 = Muito Alta ({'>'} 80%)</p>
              </div>
              <div>
                <p className="font-semibold mb-1">Impacto:</p>
                <p>1 = Insignificante (sem consequências)</p>
                <p>2 = Pequeno ({'<'} R$ 5k)</p>
                <p>3 = Moderado (R$ 5k-20k)</p>
                <p>4 = Grave (R$ 20k-100k ou multa)</p>
                <p>5 = Catastrófico ({'>'} R$ 100k ou vida)</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ANEXO F - Análise Causa Raiz */}
      <Card style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}>
        <CardContent className="p-8 space-y-6">
          <div className="border-b pb-4" style={{ borderColor: theme.cardBorder }}>
            <h2 className="text-xl font-bold mb-2" style={{ color: theme.text }}>
              ANEXO F - FORMULÁRIO DE ANÁLISE DE CAUSA RAIZ
            </h2>
            <p className="text-sm" style={{ color: theme.textMuted }}>
              Referência: PO-LOG-001 | Ferramentas: 5 Porquês + Diagrama de Ishikawa | ISO 9001:2015 (10.2.1)
            </p>
          </div>

          {/* Identificação */}
          <div className="border rounded p-4" style={{ borderColor: theme.cardBorder }}>
            <h4 className="font-bold text-sm mb-3" style={{ color: theme.text }}>1. IDENTIFICAÇÃO DA NÃO CONFORMIDADE</h4>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <p className="font-semibold mb-1" style={{ color: theme.text }}>Nº da Ocorrência/RNC:</p>
                <div className="border-b border-gray-400 pb-1 mt-2"></div>
              </div>
              <div>
                <p className="font-semibold mb-1" style={{ color: theme.text }}>Data Identificação:</p>
                <div className="border-b border-gray-400 pb-1 mt-2"></div>
              </div>
              <div className="col-span-2">
                <p className="font-semibold mb-1" style={{ color: theme.text }}>Descrição do Problema:</p>
                <div className="border rounded p-3 h-16" style={{ borderColor: theme.cardBorder }}></div>
              </div>
              <div>
                <p className="font-semibold mb-1" style={{ color: theme.text }}>Gravidade:</p>
                <div className="flex gap-3 mt-2">
                  <label className="flex items-center gap-1">
                    <input type="radio" name="gravidade" /> Baixa
                  </label>
                  <label className="flex items-center gap-1">
                    <input type="radio" name="gravidade" /> Média
                  </label>
                  <label className="flex items-center gap-1">
                    <input type="radio" name="gravidade" /> Alta
                  </label>
                  <label className="flex items-center gap-1">
                    <input type="radio" name="gravidade" /> Crítica
                  </label>
                </div>
              </div>
              <div>
                <p className="font-semibold mb-1" style={{ color: theme.text }}>Responsável pela Análise:</p>
                <div className="border-b border-gray-400 pb-1 mt-2"></div>
              </div>
            </div>
          </div>

          {/* 5 Porquês */}
          <div className="border rounded p-4" style={{ borderColor: theme.cardBorder }}>
            <h4 className="font-bold text-sm mb-3" style={{ color: theme.text }}>2. ANÁLISE - MÉTODO DOS 5 PORQUÊS</h4>
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((num) => (
                <div key={num}>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                      {num}
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-semibold mb-1" style={{ color: theme.text }}>
                        Por quê {num === 1 ? 'o problema ocorreu' : 'isso aconteceu'}?
                      </p>
                      <div className="border rounded p-2 h-12" style={{ borderColor: theme.cardBorder }}></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 bg-red-50 dark:bg-red-900/20 border border-red-300 dark:border-red-700 rounded p-3">
              <p className="text-xs font-semibold mb-1 text-red-600">🎯 CAUSA RAIZ IDENTIFICADA:</p>
              <div className="border rounded p-3 h-16 bg-white dark:bg-slate-800" style={{ borderColor: theme.cardBorder }}></div>
            </div>
          </div>

          {/* Ishikawa (6M) */}
          <div className="border rounded p-4" style={{ borderColor: theme.cardBorder }}>
            <h4 className="font-bold text-sm mb-3" style={{ color: theme.text }}>
              3. ANÁLISE COMPLEMENTAR - DIAGRAMA DE ISHIKAWA (6M)
            </h4>
            <p className="text-xs mb-3 italic" style={{ color: theme.textMuted }}>
              Para não conformidades críticas ou recorrentes, analisar contribuição de cada dimensão:
            </p>

            <div className="grid grid-cols-2 gap-3">
              <Card style={{ backgroundColor: isDark ? '#0f172a' : '#ffffff', borderColor: theme.cardBorder }}>
                <CardContent className="p-3">
                  <p className="font-semibold text-xs mb-2 text-blue-600">🔧 MÉTODO (Processo)</p>
                  <div className="border rounded p-2 h-16 text-[10px]" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>
                    Ex: Procedimento não seguido, falta de padronização
                  </div>
                </CardContent>
              </Card>

              <Card style={{ backgroundColor: isDark ? '#0f172a' : '#ffffff', borderColor: theme.cardBorder }}>
                <CardContent className="p-3">
                  <p className="font-semibold text-xs mb-2 text-green-600">📦 MATERIAL (Insumos)</p>
                  <div className="border rounded p-2 h-16 text-[10px]" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>
                    Ex: Embalagem inadequada, produto frágil
                  </div>
                </CardContent>
              </Card>

              <Card style={{ backgroundColor: isDark ? '#0f172a' : '#ffffff', borderColor: theme.cardBorder }}>
                <CardContent className="p-3">
                  <p className="font-semibold text-xs mb-2 text-purple-600">👥 MÃO-DE-OBRA (Pessoas)</p>
                  <div className="border rounded p-2 h-16 text-[10px]" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>
                    Ex: Falta de treinamento, fadiga, erro humano
                  </div>
                </CardContent>
              </Card>

              <Card style={{ backgroundColor: isDark ? '#0f172a' : '#ffffff', borderColor: theme.cardBorder }}>
                <CardContent className="p-3">
                  <p className="font-semibold text-xs mb-2 text-orange-600">⚙️ MÁQUINA (Equipamento)</p>
                  <div className="border rounded p-2 h-16 text-[10px]" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>
                    Ex: Veículo sem manutenção, falha mecânica
                  </div>
                </CardContent>
              </Card>

              <Card style={{ backgroundColor: isDark ? '#0f172a' : '#ffffff', borderColor: theme.cardBorder }}>
                <CardContent className="p-3">
                  <p className="font-semibold text-xs mb-2 text-cyan-600">📏 MEDIDA (Medição)</p>
                  <div className="border rounded p-2 h-16 text-[10px]" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>
                    Ex: Peso não conferido, dados incorretos
                  </div>
                </CardContent>
              </Card>

              <Card style={{ backgroundColor: isDark ? '#0f172a' : '#ffffff', borderColor: theme.cardBorder }}>
                <CardContent className="p-3">
                  <p className="font-semibold text-xs mb-2 text-yellow-600">🌍 MEIO AMBIENTE (Contexto)</p>
                  <div className="border rounded p-2 h-16 text-[10px]" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>
                    Ex: Condições climáticas, greve, bloqueio
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Plano de Ação 5W2H */}
          <div className="border rounded p-4" style={{ borderColor: theme.cardBorder }}>
            <h4 className="font-bold text-sm mb-3" style={{ color: theme.text }}>4. PLANO DE AÇÃO CORRETIVA (5W2H)</h4>
            
            <table className="w-full text-xs border" style={{ borderColor: theme.cardBorder }}>
              <thead style={{ backgroundColor: isDark ? '#0f172a' : '#f3f4f6' }}>
                <tr>
                  <th className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.text }}>
                    WHAT<br/><span className="font-normal text-[10px]">O que fazer?</span>
                  </th>
                  <th className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.text }}>
                    WHY<br/><span className="font-normal text-[10px]">Por quê?</span>
                  </th>
                  <th className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.text }}>
                    WHO<br/><span className="font-normal text-[10px]">Quem?</span>
                  </th>
                  <th className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.text }}>
                    WHEN<br/><span className="font-normal text-[10px]">Quando?</span>
                  </th>
                  <th className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.text }}>
                    WHERE<br/><span className="font-normal text-[10px]">Onde?</span>
                  </th>
                  <th className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.text }}>
                    HOW<br/><span className="font-normal text-[10px]">Como?</span>
                  </th>
                  <th className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.text }}>
                    HOW MUCH<br/><span className="font-normal text-[10px]">Quanto?</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border p-2" style={{ borderColor: theme.cardBorder }}>
                    <div className="h-20"></div>
                  </td>
                  <td className="border p-2" style={{ borderColor: theme.cardBorder }}>
                    <div className="h-20"></div>
                  </td>
                  <td className="border p-2" style={{ borderColor: theme.cardBorder }}>
                    <div className="h-20"></div>
                  </td>
                  <td className="border p-2" style={{ borderColor: theme.cardBorder }}>
                    <div className="h-20"></div>
                  </td>
                  <td className="border p-2" style={{ borderColor: theme.cardBorder }}>
                    <div className="h-20"></div>
                  </td>
                  <td className="border p-2" style={{ borderColor: theme.cardBorder }}>
                    <div className="h-20"></div>
                  </td>
                  <td className="border p-2" style={{ borderColor: theme.cardBorder }}>
                    <div className="h-20"></div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Verificação de Eficácia */}
          <div className="border rounded p-4" style={{ borderColor: theme.cardBorder }}>
            <h4 className="font-bold text-sm mb-3" style={{ color: theme.text }}>5. VERIFICAÇÃO DE EFICÁCIA</h4>
            <div className="grid grid-cols-3 gap-4 text-xs">
              <div>
                <p className="font-semibold mb-1" style={{ color: theme.text }}>Data Implementação:</p>
                <div className="border-b border-gray-400 pb-1 mt-2"></div>
              </div>
              <div>
                <p className="font-semibold mb-1" style={{ color: theme.text }}>Data Verificação:</p>
                <div className="border-b border-gray-400 pb-1 mt-2"></div>
              </div>
              <div>
                <p className="font-semibold mb-1" style={{ color: theme.text }}>Responsável Verificação:</p>
                <div className="border-b border-gray-400 pb-1 mt-2"></div>
              </div>
              <div className="col-span-3">
                <p className="font-semibold mb-1" style={{ color: theme.text }}>Resultado da Verificação:</p>
                <div className="flex gap-4 mt-2">
                  <label className="flex items-center gap-2">
                    <input type="radio" name="resultado" />
                    <span className="text-green-600 font-semibold">✅ EFICAZ</span>
                    <span className="text-[10px]" style={{ color: theme.textMuted }}>(problema não se repetiu)</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="radio" name="resultado" />
                    <span className="text-red-600 font-semibold">❌ NÃO EFICAZ</span>
                    <span className="text-[10px]" style={{ color: theme.textMuted }}>(problema recorreu - nova análise)</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Exemplo Prático */}
          <div className="border rounded p-4" style={{ borderColor: theme.cardBorder, backgroundColor: theme.headerBg }}>
            <h4 className="font-bold text-sm mb-3" style={{ color: theme.text }}>EXEMPLO PRÁTICO - Análise de Atraso Recorrente</h4>
            <div className="space-y-3 text-xs" style={{ color: theme.textMuted }}>
              <div>
                <p className="font-semibold">Problema:</p>
                <p className="ml-4">Atrasos recorrentes no carregamento da operação "Minério - Vale"</p>
              </div>

              <div>
                <p className="font-semibold">5 Porquês:</p>
                <ol className="ml-6 list-decimal space-y-1">
                  <li><strong>Por quê atrasou?</strong> Fila no pátio da Vale</li>
                  <li><strong>Por quê tinha fila?</strong> Muitos caminhões agendados no mesmo horário</li>
                  <li><strong>Por quê isso ocorreu?</strong> Sistema não controla capacidade de janelas</li>
                  <li><strong>Por quê não controla?</strong> Não há integração com sistema da Vale</li>
                  <li><strong>Por quê não há integração?</strong> Projeto nunca foi priorizado</li>
                </ol>
                <p className="font-semibold text-red-600 mt-2">→ CAUSA RAIZ: Falta de integração com sistema do cliente</p>
              </div>

              <div>
                <p className="font-semibold">Plano 5W2H:</p>
                <table className="w-full text-[10px] border mt-2" style={{ borderColor: '#3b82f6' }}>
                  <tbody>
                    <tr>
                      <td className="border p-2 font-semibold" style={{ borderColor: '#3b82f6' }}>What:</td>
                      <td className="border p-2" style={{ borderColor: '#3b82f6' }}>Desenvolver integração API com sistema Vale (consultar janelas disponíveis)</td>
                    </tr>
                    <tr>
                      <td className="border p-2 font-semibold" style={{ borderColor: '#3b82f6' }}>Why:</td>
                      <td className="border p-2" style={{ borderColor: '#3b82f6' }}>Evitar filas, cumprir SLA, eliminar diárias desnecessárias</td>
                    </tr>
                    <tr>
                      <td className="border p-2 font-semibold" style={{ borderColor: '#3b82f6' }}>Who:</td>
                      <td className="border p-2" style={{ borderColor: '#3b82f6' }}>Equipe TI (dev) + Coord. Operações (validação)</td>
                    </tr>
                    <tr>
                      <td className="border p-2 font-semibold" style={{ borderColor: '#3b82f6' }}>When:</td>
                      <td className="border p-2" style={{ borderColor: '#3b82f6' }}>Início: 15/12/2024 | Conclusão: 31/01/2025</td>
                    </tr>
                    <tr>
                      <td className="border p-2 font-semibold" style={{ borderColor: '#3b82f6' }}>Where:</td>
                      <td className="border p-2" style={{ borderColor: '#3b82f6' }}>Módulo de Agendamentos do sistema Log Flow</td>
                    </tr>
                    <tr>
                      <td className="border p-2 font-semibold" style={{ borderColor: '#3b82f6' }}>How:</td>
                      <td className="border p-2" style={{ borderColor: '#3b82f6' }}>API REST, consulta janelas em tempo real, bloqueio de horários lotados</td>
                    </tr>
                    <tr>
                      <td className="border p-2 font-semibold" style={{ borderColor: '#3b82f6' }}>How Much:</td>
                      <td className="border p-2" style={{ borderColor: '#3b82f6' }}>R$ 15.000,00 (desenvolvimento) + R$ 500/mês (manutenção)</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Aprovações */}
          <div className="border-t pt-4 grid grid-cols-3 gap-6" style={{ borderColor: theme.cardBorder }}>
            <div className="text-center">
              <div className="border-t-2 border-black pt-2 mt-8">
                <p className="text-xs font-semibold" style={{ color: theme.text }}>Elaborado por</p>
                <p className="text-[10px]" style={{ color: theme.textMuted }}>(Responsável Análise)</p>
              </div>
            </div>
            <div className="text-center">
              <div className="border-t-2 border-black pt-2 mt-8">
                <p className="text-xs font-semibold" style={{ color: theme.text }}>Aprovado por</p>
                <p className="text-[10px]" style={{ color: theme.textMuted }}>(Gestor de Qualidade)</p>
              </div>
            </div>
            <div className="text-center">
              <div className="border-t-2 border-black pt-2 mt-8">
                <p className="text-xs font-semibold" style={{ color: theme.text }}>Data</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}