import React from "react";
import { Card, CardContent } from "@/components/ui/card";

export function AnexosProcedimentoTransportes({ theme, isDark }) {
  return (
    <div className="space-y-8">
      <Card style={{ backgroundColor: '#ffffff', borderColor: '#000000', border: '2px solid #000000' }}>
        <CardContent className="p-8 space-y-6">
          <div className="border-b-2 pb-4 border-black">
            <h2 className="text-xl font-bold mb-2 text-black">
              ANEXO A - FLUXOGRAMA DO MACROPROCESSO (SIPOC)
            </h2>
            <p className="text-sm text-black">
              Referência: PO-LOG-001 | Diagrama SIPOC
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs border-2 border-black">
              <thead>
                <tr style={{ backgroundColor: '#ffffff' }}>
                  <th className="border border-black p-3 text-left w-1/5 text-black">SUPPLIER</th>
                  <th className="border border-black p-3 text-left w-1/5 text-black">INPUT</th>
                  <th className="border border-black p-3 text-left w-1/5 text-black">PROCESS</th>
                  <th className="border border-black p-3 text-left w-1/5 text-black">OUTPUT</th>
                  <th className="border border-black p-3 text-left w-1/5 text-black">CUSTOMER</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-black p-3 align-top text-black">
                    • Cliente<br/>• Fornecedor<br/>• Comercial
                  </td>
                  <td className="border border-black p-3 align-top text-black">
                    • Solicitação<br/>• Dados carga<br/>• Rota<br/>• Prazo
                  </td>
                  <td className="border border-black p-3 align-top text-black">
                    <strong>PLANEJAMENTO</strong><br/>
                    • Análise viabilidade<br/>• Criar OC<br/>• Alocar recursos
                  </td>
                  <td className="border border-black p-3 align-top text-black">
                    • Ordem<br/>• Proposta<br/>• Agendamentos
                  </td>
                  <td className="border border-black p-3 align-top text-black">
                    • Coord. Expedição<br/>• Cliente
                  </td>
                </tr>
                <tr>
                  <td className="border border-black p-3 align-top text-black">
                    • Coord. Expedição<br/>• Operador
                  </td>
                  <td className="border border-black p-3 align-top text-black">
                    • Ordem Alocada<br/>• Documentação
                  </td>
                  <td className="border border-black p-3 align-top text-black">
                    <strong>EXECUÇÃO</strong><br/>• Carregamento<br/>• Transporte<br/>• Tracking
                  </td>
                  <td className="border border-black p-3 align-top text-black">
                    • Carga transportada<br/>• Updates status<br/>• Comprovantes
                  </td>
                  <td className="border border-black p-3 align-top text-black">
                    • Destinatário<br/>• Cliente
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card style={{ backgroundColor: '#ffffff', borderColor: '#000000', border: '2px solid #000000' }}>
        <CardContent className="p-8 space-y-6">
          <div className="border-b-2 pb-4 border-black">
            <h2 className="text-xl font-bold mb-2 text-black">
              ANEXO B - MATRIZ DE RESPONSABILIDADES RACI
            </h2>
            <p className="text-sm text-black">
              R=Executor | A=Aprovador | C=Consultado | I=Informado
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs border-2 border-black">
              <thead style={{ backgroundColor: '#ffffff' }}>
                <tr>
                  <th className="border border-black p-2 text-left text-black">Atividade</th>
                  <th className="border border-black p-2 text-center text-black">Operador</th>
                  <th className="border border-black p-2 text-center text-black">Coord.</th>
                  <th className="border border-black p-2 text-center text-black">Gestor</th>
                  <th className="border border-black p-2 text-center text-black">Cliente</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-black p-2 text-black">Criar Ordem</td>
                  <td className="border border-black p-2 text-center font-bold text-black">R</td>
                  <td className="border border-black p-2 text-center font-bold text-black">A</td>
                  <td className="border border-black p-2 text-center text-black">I</td>
                  <td className="border border-black p-2 text-center text-black">I</td>
                </tr>
                <tr>
                  <td className="border border-black p-2 text-black">Monitorar SLA</td>
                  <td className="border border-black p-2 text-center text-black">C</td>
                  <td className="border border-black p-2 text-center text-black">C</td>
                  <td className="border border-black p-2 text-center font-bold text-black">R</td>
                  <td className="border border-black p-2 text-center font-bold text-black">A</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card style={{ backgroundColor: '#ffffff', borderColor: '#000000', border: '2px solid #000000' }}>
        <CardContent className="p-8 space-y-6">
          <div className="border-b-2 pb-4 border-black">
            <h2 className="text-xl font-bold mb-2 text-black">
              ANEXO C - TABELA DE SLA POR OPERAÇÃO
            </h2>
          </div>

          <table className="w-full text-xs border-2 border-black">
            <thead style={{ backgroundColor: '#ffffff' }}>
              <tr>
                <th className="border border-black p-2 text-left text-black">Operação</th>
                <th className="border border-black p-2 text-center text-black">Tolerância Carga</th>
                <th className="border border-black p-2 text-center text-black">Tolerância Descarga</th>
                <th className="border border-black p-2 text-center text-black">Prazo Entrega</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-black p-2 text-black">Transporte Padrão</td>
                <td className="border border-black p-2 text-center text-black">24h</td>
                <td className="border border-black p-2 text-center text-black">24h</td>
                <td className="border border-black p-2 text-center text-black">5 dias úteis</td>
              </tr>
              <tr>
                <td className="border border-black p-2 text-black">Minério Vale</td>
                <td className="border border-black p-2 text-center text-black">48h</td>
                <td className="border border-black p-2 text-center text-black">72h</td>
                <td className="border border-black p-2 text-center text-black">Por agenda</td>
              </tr>
              <tr>
                <td className="border border-black p-2 text-black">Expresso</td>
                <td className="border border-black p-2 text-center text-black">8h</td>
                <td className="border border-black p-2 text-center text-black">8h</td>
                <td className="border border-black p-2 text-center text-black">2 dias úteis</td>
              </tr>
            </tbody>
          </table>
        </CardContent>
      </Card>

      <Card style={{ backgroundColor: '#ffffff', borderColor: '#000000', border: '2px solid #000000' }}>
        <CardContent className="p-8 space-y-6">
          <div className="border-b-2 pb-4 border-black">
            <h2 className="text-xl font-bold mb-2 text-black">
              ANEXO D - CHECKLIST PRÉ-VIAGEM
            </h2>
            <p className="text-sm text-black">SASSMAQ v.7 (3.1) | Resolução CONTRAN 918/2022</p>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <h4 className="font-bold text-sm mb-3 text-black">DOCUMENTAÇÃO MOTORISTA</h4>
              <table className="w-full text-xs border-2 border-black">
                <tbody>
                  <tr>
                    <td className="border border-black p-2 w-10 text-center text-black">☐</td>
                    <td className="border border-black p-2 text-black">CNH válida</td>
                  </tr>
                  <tr>
                    <td className="border border-black p-2 text-center text-black">☐</td>
                    <td className="border border-black p-2 text-black">RNTRC ativo</td>
                  </tr>
                  <tr>
                    <td className="border border-black p-2 text-center text-black">☐</td>
                    <td className="border border-black p-2 text-black">Teste bafômetro aprovado</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div>
              <h4 className="font-bold text-sm mb-3 text-black">DOCUMENTAÇÃO VEÍCULO</h4>
              <table className="w-full text-xs border-2 border-black">
                <tbody>
                  <tr>
                    <td className="border border-black p-2 w-10 text-center text-black">☐</td>
                    <td className="border border-black p-2 text-black">CRLV válido</td>
                  </tr>
                  <tr>
                    <td className="border border-black p-2 text-center text-black">☐</td>
                    <td className="border border-black p-2 text-black">ANTT regular</td>
                  </tr>
                  <tr>
                    <td className="border border-black p-2 text-center text-black">☐</td>
                    <td className="border border-black p-2 text-black">Seguro RCTR-C vigente</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div>
              <h4 className="font-bold text-sm mb-3 text-black">CONDIÇÕES VEÍCULO</h4>
              <table className="w-full text-xs border-2 border-black">
                <tbody>
                  <tr>
                    <td className="border border-black p-2 w-10 text-center text-black">☐</td>
                    <td className="border border-black p-2 text-black">Pneus em bom estado</td>
                  </tr>
                  <tr>
                    <td className="border border-black p-2 text-center text-black">☐</td>
                    <td className="border border-black p-2 text-black">Freios testados</td>
                  </tr>
                  <tr>
                    <td className="border border-black p-2 text-center text-black">☐</td>
                    <td className="border border-black p-2 text-black">Sistema elétrico OK</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div>
              <h4 className="font-bold text-sm mb-3 text-black">RASTREAMENTO</h4>
              <table className="w-full text-xs border-2 border-black">
                <tbody>
                  <tr>
                    <td className="border border-black p-2 w-10 text-center text-black">☐</td>
                    <td className="border border-black p-2 text-black">Rastreador testado</td>
                  </tr>
                  <tr>
                    <td className="border border-black p-2 text-center text-black">☐</td>
                    <td className="border border-black p-2 text-black">GPS transmitindo</td>
                  </tr>
                  <tr>
                    <td className="border border-black p-2 text-center text-black">☐</td>
                    <td className="border border-black p-2 text-black">App Motorista funcional</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card style={{ backgroundColor: '#ffffff', borderColor: '#000000', border: '2px solid #000000' }}>
        <CardContent className="p-8 space-y-6">
          <div className="border-b-2 pb-4 border-black">
            <h2 className="text-xl font-bold mb-2 text-black">
              ANEXO E - MATRIZ DE RISCOS (ISO 31000)
            </h2>
          </div>

          <table className="w-full text-xs border-2 border-black">
            <thead style={{ backgroundColor: '#ffffff' }}>
              <tr>
                <th className="border border-black p-2 text-left text-black">Risco</th>
                <th className="border border-black p-2 text-center text-black">Prob.</th>
                <th className="border border-black p-2 text-center text-black">Impacto</th>
                <th className="border border-black p-2 text-left text-black">Controle Preventivo</th>
                <th className="border border-black p-2 text-left text-black">Contingência</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-black p-2 text-black">Atraso carregamento</td>
                <td className="border border-black p-2 text-center text-black">3</td>
                <td className="border border-black p-2 text-center text-black">4</td>
                <td className="border border-black p-2 text-black">Agendamento + tolerância + alertas</td>
                <td className="border border-black p-2 text-black">Registrar ocorrência + comunicar cliente</td>
              </tr>
              <tr>
                <td className="border border-black p-2 text-black">Avaria de carga</td>
                <td className="border border-black p-2 text-center text-black">2</td>
                <td className="border border-black p-2 text-center text-black">5</td>
                <td className="border border-black p-2 text-black">Seguro + vistoria + treinamento</td>
                <td className="border border-black p-2 text-black">Acionar seguradora + RNC + análise causa</td>
              </tr>
              <tr>
                <td className="border border-black p-2 text-black">Quebra mecânica</td>
                <td className="border border-black p-2 text-center text-black">3</td>
                <td className="border border-black p-2 text-center text-black">3</td>
                <td className="border border-black p-2 text-black">Manutenção preventiva + check-list</td>
                <td className="border border-black p-2 text-black">Guincho + oficina + comunicar cliente</td>
              </tr>
            </tbody>
          </table>
        </CardContent>
      </Card>

      <Card style={{ backgroundColor: '#ffffff', borderColor: '#000000', border: '2px solid #000000' }}>
        <CardContent className="p-8 space-y-6">
          <div className="border-b-2 pb-4 border-black">
            <h2 className="text-xl font-bold mb-2 text-black">
              ANEXO F - ANÁLISE DE CAUSA RAIZ (5 PORQUÊS)
            </h2>
          </div>

          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((num) => (
              <div key={num} className="border-2 border-black rounded p-3">
                <p className="font-bold text-sm mb-2 text-black">Por quê {num}?</p>
                <div className="border-b-2 border-gray-400 pb-1 mt-2"></div>
              </div>
            ))}
          </div>

          <div className="border-2 border-black rounded p-4 bg-white">
            <p className="font-bold text-sm mb-2 text-black">CAUSA RAIZ IDENTIFICADA:</p>
            <div className="border-b-2 border-gray-400 pb-1 mt-2"></div>
          </div>

          <div>
            <h4 className="font-bold text-sm mb-3 text-black">PLANO DE AÇÃO (5W2H)</h4>
            <table className="w-full text-xs border-2 border-black">
              <tbody>
                <tr>
                  <td className="border border-black p-2 font-bold w-24 text-black">O QUÊ?</td>
                  <td className="border border-black p-2"><div className="h-12"></div></td>
                </tr>
                <tr>
                  <td className="border border-black p-2 font-bold text-black">POR QUÊ?</td>
                  <td className="border border-black p-2"><div className="h-12"></div></td>
                </tr>
                <tr>
                  <td className="border border-black p-2 font-bold text-black">QUEM?</td>
                  <td className="border border-black p-2"><div className="h-12"></div></td>
                </tr>
                <tr>
                  <td className="border border-black p-2 font-bold text-black">QUANDO?</td>
                  <td className="border border-black p-2"><div className="h-12"></div></td>
                </tr>
                <tr>
                  <td className="border border-black p-2 font-bold text-black">ONDE?</td>
                  <td className="border border-black p-2"><div className="h-12"></div></td>
                </tr>
                <tr>
                  <td className="border border-black p-2 font-bold text-black">COMO?</td>
                  <td className="border border-black p-2"><div className="h-12"></div></td>
                </tr>
                <tr>
                  <td className="border border-black p-2 font-bold text-black">QUANTO?</td>
                  <td className="border border-black p-2"><div className="h-12"></div></td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}