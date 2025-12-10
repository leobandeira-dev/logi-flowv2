import React from "react";
import { Card, CardContent } from "@/components/ui/card";

export function ProcedimentoGestaoTransportes({ theme, isDark }) {
  return (
    <Card style={{ backgroundColor: '#ffffff', borderColor: '#000000', border: '2px solid #000000' }}>
      <CardContent className="p-8 space-y-6">
        <div className="border-b-2 pb-6 border-black">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h1 className="text-2xl font-bold mb-2 text-black">
                PROCEDIMENTO OPERACIONAL
              </h1>
              <h2 className="text-xl font-semibold mb-1 text-black">
                Gestão de Transportes Rodoviários de Cargas
              </h2>
            </div>
            <div className="text-right text-sm text-black">
              <p className="font-bold">Código: PO-LOG-001</p>
              <p>Revisão: 01</p>
              <p>Data: 09/12/2024</p>
            </div>
          </div>
          
          <div className="bg-white border-2 border-black rounded p-3 text-xs">
            <p className="font-semibold mb-1 text-black">Conformidade Normativa:</p>
            <p className="text-black">
              NBR ISO 9001:2015 | SASSMAQ v.7 | ANTT 5.867/2019 | Lei 11.442/2007
            </p>
          </div>
        </div>

        <section>
          <h3 className="text-lg font-bold mb-3 text-black">1. OBJETIVO E ESCOPO</h3>
          <p className="text-sm text-black">
            Estabelecer diretrizes para planejamento, execução, monitoramento e controle de 
            operações de transporte rodoviário, assegurando conformidade com ISO 9001 e SASSMAQ.
          </p>
        </section>

        <section>
          <h3 className="text-lg font-bold mb-3 text-black">2. REFERÊNCIAS NORMATIVAS</h3>
          <ul className="ml-6 list-disc text-sm space-y-1 text-black">
            <li>NBR ISO 9001:2015 - Sistemas de Gestão da Qualidade</li>
            <li>NBR ISO 31000:2018 - Gestão de Riscos</li>
            <li>SASSMAQ v.7 - Sistema de Avaliação SSM e Qualidade</li>
            <li>Lei 11.442/2007 - Transporte Rodoviário de Cargas</li>
            <li>Resolução ANTT 5.867/2019 - RNTRC</li>
          </ul>
        </section>

        <section>
          <h3 className="text-lg font-bold mb-3 text-black">3. MACROPROCESSO</h3>
          <table className="w-full text-xs border-2 border-black">
            <thead>
              <tr style={{ backgroundColor: '#ffffff' }}>
                <th className="border border-black p-2 text-left text-black">Fase</th>
                <th className="border border-black p-2 text-left text-black">Atividades Principais</th>
                <th className="border border-black p-2 text-left text-black">Responsável</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-black p-2 font-bold text-black">Planejamento</td>
                <td className="border border-black p-2 text-black">
                  Recepção solicitação, análise viabilidade, criação OC
                </td>
                <td className="border border-black p-2 text-black">Operador + Coord.</td>
              </tr>
              <tr>
                <td className="border border-black p-2 font-bold text-black">Execução</td>
                <td className="border border-black p-2 text-black">
                  Agendamento, etapas fluxo, liberação veículo
                </td>
                <td className="border border-black p-2 text-black">Coord. Expedição</td>
              </tr>
              <tr>
                <td className="border border-black p-2 font-bold text-black">Monitoramento</td>
                <td className="border border-black p-2 text-black">
                  Tracking, controle SLA, tratamento ocorrências
                </td>
                <td className="border border-black p-2 text-black">Coord. Operações</td>
              </tr>
              <tr>
                <td className="border border-black p-2 font-bold text-black">Finalização</td>
                <td className="border border-black p-2 text-black">
                  Validação comprovante, cálculo diárias, fechamento
                </td>
                <td className="border border-black p-2 text-black">Financeiro</td>
              </tr>
            </tbody>
          </table>
        </section>

        <section>
          <h3 className="text-lg font-bold mb-3 text-black">4. INDICADORES (ISO 9001 - 9.1.1)</h3>
          <table className="w-full text-xs border-2 border-black">
            <thead>
              <tr style={{ backgroundColor: '#ffffff' }}>
                <th className="border border-black p-2 text-left text-black">Indicador</th>
                <th className="border border-black p-2 text-center text-black">Meta</th>
                <th className="border border-black p-2 text-center text-black">Frequência</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-black p-2 text-black">SLA Carregamento</td>
                <td className="border border-black p-2 text-center font-bold text-black">≥ 95%</td>
                <td className="border border-black p-2 text-center text-black">Diária</td>
              </tr>
              <tr>
                <td className="border border-black p-2 text-black">SLA Descarga</td>
                <td className="border border-black p-2 text-center font-bold text-black">≥ 95%</td>
                <td className="border border-black p-2 text-center text-black">Diária</td>
              </tr>
              <tr>
                <td className="border border-black p-2 text-black">Taxa de Alocação</td>
                <td className="border border-black p-2 text-center font-bold text-black">≥ 90%</td>
                <td className="border border-black p-2 text-center text-black">Semanal</td>
              </tr>
              <tr>
                <td className="border border-black p-2 text-black">Resolução Ocorrências</td>
                <td className="border border-black p-2 text-center font-bold text-black">≥ 92%</td>
                <td className="border border-black p-2 text-center text-black">Semanal</td>
              </tr>
            </tbody>
          </table>
        </section>

        <section>
          <h3 className="text-lg font-bold mb-3 text-black">5. ANEXOS</h3>
          <ul className="ml-6 list-disc text-sm text-black">
            <li>Anexo A - SIPOC</li>
            <li>Anexo B - Matriz RACI</li>
            <li>Anexo C - Tabela SLA</li>
            <li>Anexo D - Checklist Pré-Viagem</li>
            <li>Anexo E - Matriz de Riscos</li>
            <li>Anexo F - Formulário Causa Raiz</li>
          </ul>
        </section>

        <div className="border-t-2 pt-4 mt-8 text-xs text-center border-black text-black">
          <p className="font-semibold">Documento controlado eletronicamente</p>
          <p>Versão impressa é cópia não controlada</p>
        </div>
      </CardContent>
    </Card>
  );
}