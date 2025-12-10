import React from "react";
import { Card, CardContent } from "@/components/ui/card";

export function InstrucaoOcorrenciasDetalhada({ theme, isDark }) {
  return (
    <Card style={{ backgroundColor: '#ffffff', borderColor: '#000000', border: '2px solid #000000' }}>
      <CardContent className="p-8 space-y-6">
        <div className="border-b-2 pb-6 border-black">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h1 className="text-2xl font-bold mb-2 text-black">
                INSTRUÇÃO DE TRABALHO
              </h1>
              <h2 className="text-xl font-semibold mb-1 text-black">
                Gestão de Ocorrências e Não Conformidades
              </h2>
            </div>
            <div className="text-right text-sm text-black">
              <p className="font-bold">Código: IT-LOG-003</p>
              <p>Revisão: 01</p>
              <p>Data: 09/12/2024</p>
              <p>Páginas: 1/3</p>
            </div>
          </div>
          
          <div className="grid grid-cols-4 gap-3 text-sm mb-4">
            <div>
              <p className="font-semibold text-black">Elaborado:</p>
              <p className="text-black">Qualidade</p>
            </div>
            <div>
              <p className="font-semibold text-black">Aprovado:</p>
              <p className="text-black">Dir. Qualidade</p>
            </div>
            <div>
              <p className="font-semibold text-black">Processo:</p>
              <p className="text-black">PO-LOG-001</p>
            </div>
            <div>
              <p className="font-semibold text-black">Próxima Revisão:</p>
              <p className="text-black">09/12/2025</p>
            </div>
          </div>

          <div className="bg-white border-2 border-black rounded p-2 text-xs">
            <p className="text-black">
              <strong>Referência:</strong> ISO 9001:2015 (10.2, 10.3) | ISO 31000:2018 | SASSMAQ v.7 (4.2, 4.3)
            </p>
          </div>
        </div>

        <section>
          <h3 className="text-lg font-bold mb-3 text-black">1. OBJETIVO</h3>
          <p className="text-sm text-black">
            Estabelecer metodologia padronizada para identificação, registro, classificação, tratamento, análise 
            e prevenção de ocorrências operacionais, garantindo melhoria contínua e conformidade com 
            NBR ISO 9001:2015 (Não conformidade e ação corretiva).
          </p>
        </section>

        <section>
          <h3 className="text-lg font-bold mb-3 text-black">2. APLICAÇÃO E RESPONSABILIDADES</h3>
          <table className="w-full text-xs border-2 border-black">
            <thead style={{ backgroundColor: '#ffffff' }}>
              <tr>
                <th className="border border-black p-2 text-left text-black">Função</th>
                <th className="border border-black p-2 text-left text-black">Responsabilidade</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-black p-2 font-semibold text-black">TODOS os usuários</td>
                <td className="border border-black p-2 text-black">
                  Identificar e registrar ocorrências assim que detectadas
                </td>
              </tr>
              <tr>
                <td className="border border-black p-2 font-semibold text-black">Responsável Designado</td>
                <td className="border border-black p-2 text-black">
                  Tratar ocorrência dentro do prazo SLA, preencher campos, anexar evidências
                </td>
              </tr>
              <tr>
                <td className="border border-black p-2 font-semibold text-black">Gestor de Qualidade</td>
                <td className="border border-black p-2 text-black">
                  Analisar tendências, identificar causas raiz, propor ações preventivas
                </td>
              </tr>
              <tr>
                <td className="border border-black p-2 font-semibold text-black">Diretor de Operações</td>
                <td className="border border-black p-2 text-black">
                  Aprovar ações corretivas estruturais, análise crítica mensal
                </td>
              </tr>
            </tbody>
          </table>
        </section>

        <section>
          <h3 className="text-lg font-bold mb-3 text-black">3. CATEGORIAS DE OCORRÊNCIAS</h3>
          <div className="space-y-3">
            <div className="border-2 border-black pl-4 py-3">
              <h4 className="font-bold text-sm mb-2 text-black">3.1 TRACKING (Viagem)</h4>
              <div className="text-xs space-y-2 text-black">
                <p><strong>Impacto:</strong> Afeta SLA de carregamento ou descarga. Pode gerar diária.</p>
                <p><strong>Exemplos:</strong></p>
                <ul className="ml-6 list-disc space-y-1">
                  <li>Atraso no carregamento (além da tolerância)</li>
                  <li>Quebra mecânica do veículo</li>
                  <li>Acidente rodoviário</li>
                  <li>Bloqueio de rodovia (polícia, manifestação)</li>
                  <li>Carga retida (fiscalização)</li>
                  <li>Condições climáticas adversas</li>
                </ul>
                <p className="mt-2"><strong>Tratamento obrigatório:</strong></p>
                <ol className="ml-6 list-decimal">
                  <li>Registrar data/hora início do problema</li>
                  <li>Registrar data/hora fim (quando resolvido)</li>
                  <li>Calcular impacto no prazo de entrega</li>
                  <li>Avaliar necessidade de diária</li>
                  <li>Comunicar cliente se impactar prazo</li>
                </ol>
              </div>
            </div>

            <div className="border-2 border-black pl-4 py-3">
              <h4 className="font-bold text-sm mb-2 text-black">3.2 FLUXO (Processos Internos)</h4>
              <div className="text-xs space-y-2 text-black">
                <p><strong>Impacto:</strong> Bloqueia ou atrasa etapas do workflow operacional.</p>
                <p><strong>Exemplos:</strong></p>
                <ul className="ml-6 list-disc space-y-1">
                  <li>Documentação pendente (CT-e não emitido)</li>
                  <li>Erro no cadastro (dados incorretos)</li>
                  <li>Falta de informação do cliente</li>
                  <li>Aprovação pendente de diretoria</li>
                  <li>Pagamento de adiantamento atrasado</li>
                </ul>
                <p className="mt-2"><strong>Tratamento obrigatório:</strong></p>
                <ol className="ml-6 list-decimal">
                  <li>Atribuir responsável específico</li>
                  <li>Definir prazo de resolução (conforme SLA)</li>
                  <li>Bloquear avanço da etapa até resolução</li>
                  <li>Desbloquear etapa após resolver</li>
                  <li>Registrar solução nas observações</li>
                </ol>
              </div>
            </div>

            <div className="border-2 border-black pl-4 py-3">
              <h4 className="font-bold text-sm mb-2 text-black">3.3 TAREFA</h4>
              <div className="text-xs space-y-2 text-black">
                <p><strong>Impacto:</strong> NÃO afeta SLA ou prazo. Atividade administrativa.</p>
                <p><strong>Exemplos:</strong></p>
                <ul className="ml-6 list-disc space-y-1">
                  <li>Atualização de cadastro de motorista</li>
                  <li>Envio de documento complementar</li>
                  <li>Follow-up comercial</li>
                  <li>Arquivo de documentação</li>
                  <li>Atualização de dados no sistema</li>
                </ul>
                <p className="mt-2"><strong>Tratamento:</strong> Registro simples, sem impacto em métricas.</p>
              </div>
            </div>

            <div className="border-2 border-black pl-4 py-3">
              <h4 className="font-bold text-sm mb-2 text-black">3.4 DIÁRIA (Cobrança Adicional)</h4>
              <div className="text-xs space-y-2 text-black">
                <p><strong>Impacto:</strong> Gera cobrança adicional ao cliente.</p>
                <p><strong>Geração:</strong> Sistema cria AUTOMATICAMENTE quando:</p>
                <ul className="ml-6 list-disc space-y-1">
                  <li>Tempo entre agendamento e execução do carregamento > tolerância</li>
                  <li>Tempo entre agendamento e execução da descarga > tolerância</li>
                </ul>
                <p className="mt-2"><strong>Workflow de Aprovação:</strong></p>
                <ol className="ml-6 list-decimal space-y-1">
                  <li><strong>Pendente Valor:</strong> Sistema sugere valor</li>
                  <li><strong>Pendente Autorização:</strong> Aguardando cliente</li>
                  <li><strong>Autorizado:</strong> Cliente aprovou</li>
                  <li><strong>Faturado:</strong> Incluído na NFS</li>
                  <li><strong>Abonado:</strong> Dispensado</li>
                </ol>
              </div>
            </div>
          </div>
        </section>

        <section>
          <h3 className="text-lg font-bold mb-3 text-black">4. REGISTRO DE OCORRÊNCIA - PASSO A PASSO</h3>
          
          <div className="space-y-4">
            <div className="border-2 border-black pl-4 py-3">
              <div className="flex items-start gap-3 mb-2">
                <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">1</div>
                <h4 className="font-bold text-base text-black">Acessar Módulo de Ocorrências</h4>
              </div>
              <ol className="text-xs space-y-1 ml-11 list-decimal text-black">
                <li>Navegue até: <strong>Qualidade → Ocorrências</strong></li>
                <li>Tela exibe abas (Abertas, Em Andamento, Resolvidas)</li>
                <li>Clique em <strong>"Nova Ocorrência"</strong></li>
                <li>Sistema abre formulário</li>
              </ol>
            </div>

            <div className="border-2 border-black pl-4 py-3">
              <div className="flex items-start gap-3 mb-2">
                <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">2</div>
                <h4 className="font-bold text-base text-black">Vincular Ordem (Se Aplicável)</h4>
              </div>
              <ol className="text-xs space-y-1 ml-11 list-decimal text-black">
                <li>No campo "Ordem de Carregamento", digite número, cliente ou cidade</li>
                <li>Sistema filtra e exibe ordens correspondentes</li>
                <li>Selecione a ordem correta</li>
                <li>Dados aparecem automaticamente</li>
              </ol>
            </div>

            <div className="border-2 border-black pl-4 py-3">
              <div className="flex items-start gap-3 mb-2">
                <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">3</div>
                <h4 className="font-bold text-base text-black">Selecionar Tipo de Ocorrência</h4>
              </div>
              <ol className="text-xs space-y-1 ml-11 list-decimal text-black">
                <li>No campo "Tipo", clique na seta</li>
                <li>Tipos são pré-cadastrados pela gestão</li>
                <li>Selecione o tipo adequado (ex: Atraso Carregamento, Quebra de Veículo)</li>
                <li>Cada tipo tem SLA e responsável padrão</li>
              </ol>
            </div>

            <div className="border-2 border-black pl-4 py-3">
              <div className="flex items-start gap-3 mb-2">
                <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">4</div>
                <h4 className="font-bold text-base text-black">Selecionar Categoria e Gravidade</h4>
              </div>
              <div className="ml-11 space-y-3">
                <div className="text-xs text-black">
                  <p className="font-semibold mb-1">Categoria:</p>
                  <table className="w-full border-2 border-black text-xs">
                    <tbody>
                      <tr>
                        <td className="border border-black p-2 font-semibold text-black">Tracking</td>
                        <td className="border border-black p-2 text-black">Impacta SLA</td>
                      </tr>
                      <tr>
                        <td className="border border-black p-2 font-semibold text-black">Fluxo</td>
                        <td className="border border-black p-2 text-black">Bloqueia etapa</td>
                      </tr>
                      <tr>
                        <td className="border border-black p-2 font-semibold text-black">Tarefa</td>
                        <td className="border border-black p-2 text-black">Não afeta SLA</td>
                      </tr>
                      <tr>
                        <td className="border border-black p-2 font-semibold text-black">Diária</td>
                        <td className="border border-black p-2 text-black">Cobrança adicional</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="text-xs text-black">
                  <p className="font-semibold mb-1">Gravidade:</p>
                  <table className="w-full border-2 border-black text-xs">
                    <tbody>
                      <tr>
                        <td className="border border-black p-2 font-semibold text-black">Baixa</td>
                        <td className="border border-black p-2 text-black">Sem impacto</td>
                        <td className="border border-black p-2 text-black">SLA: 48h</td>
                      </tr>
                      <tr>
                        <td className="border border-black p-2 font-semibold text-black">Média</td>
                        <td className="border border-black p-2 text-black">Risco pequeno atraso</td>
                        <td className="border border-black p-2 text-black">SLA: 24h</td>
                      </tr>
                      <tr>
                        <td className="border border-black p-2 font-semibold text-black">Alta</td>
                        <td className="border border-black p-2 text-black">Impacto direto</td>
                        <td className="border border-black p-2 text-black">SLA: 8h</td>
                      </tr>
                      <tr>
                        <td className="border border-black p-2 font-semibold text-black">Crítica</td>
                        <td className="border border-black p-2 text-black">Parada total</td>
                        <td className="border border-black p-2 text-black">SLA: 2h</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="border-2 border-black pl-4 py-3">
              <div className="flex items-start gap-3 mb-2">
                <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">5</div>
                <h4 className="font-bold text-base text-black">Preencher Dados da Ocorrência</h4>
              </div>
              <div className="ml-11 space-y-2">
                <div className="text-xs text-black">
                  <p className="font-semibold">5.1 Data/Hora de Início:</p>
                  <ol className="ml-4 list-disc">
                    <li>Informe QUANDO o problema começou</li>
                    <li>Use botão "Agora" se o problema está ocorrendo neste momento</li>
                  </ol>
                </div>

                <div className="text-xs text-black">
                  <p className="font-semibold">5.2 Descrição Detalhada:</p>
                  <ol className="ml-4 list-disc">
                    <li>Mínimo 20 caracteres, máximo 500</li>
                    <li>Responda: O QUÊ, ONDE, QUANDO, QUEM identificou</li>
                    <li><strong>BOM:</strong> "Quebra da caixa de transmissão do cavalo ABC1234 no km 350 da BR-381"</li>
                    <li><strong>RUIM:</strong> "Problema com o caminhão"</li>
                  </ol>
                </div>

                <div className="text-xs text-black">
                  <p className="font-semibold">5.3 Anexar Imagem:</p>
                  <ol className="ml-4 list-disc">
                    <li>Clique em "Anexar Foto/Documento"</li>
                    <li>Formatos: JPG, PNG, PDF (máx 5MB)</li>
                    <li><strong>Obrigatório para:</strong> Acidentes, avarias, bloqueios</li>
                  </ol>
                </div>
              </div>
            </div>

            <div className="border-2 border-black pl-4 py-3">
              <div className="flex items-start gap-3 mb-2">
                <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">6</div>
                <h4 className="font-bold text-base text-black">Salvar Ocorrência</h4>
              </div>
              <ol className="text-xs space-y-1 ml-11 list-decimal text-black">
                <li>Revise todos os dados</li>
                <li>Clique em <strong>"Registrar Ocorrência"</strong></li>
                <li>Sistema GERA AUTOMATICAMENTE:
                  <ul className="ml-6 list-disc mt-1">
                    <li><strong>Número Ticket:</strong> AAMMDDHHNN</li>
                    <li><strong>Prazo Resolução:</strong> Baseado no SLA</li>
                    <li><strong>Status Inicial:</strong> "Aberta"</li>
                    <li><strong>Email:</strong> Enviado ao responsável</li>
                  </ul>
                </li>
              </ol>
            </div>
          </div>
        </section>

        <section className="print-page-break">
          <h3 className="text-lg font-bold mb-3 text-black">5. TRATAMENTO DE OCORRÊNCIA</h3>
          
          <div className="space-y-4">
            <div className="border-2 border-black pl-4 py-3">
              <div className="flex items-start gap-3 mb-2">
                <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">1</div>
                <h4 className="font-bold text-base text-black">Acessar Ocorrência</h4>
              </div>
              <ol className="text-xs space-y-1 ml-11 list-decimal text-black">
                <li>Clique no link do email recebido OU</li>
                <li>Acesse Qualidade → Ocorrências → Aba "Abertas"</li>
                <li>Localize pelo número do ticket</li>
                <li>Clique para abrir detalhes</li>
              </ol>
            </div>

            <div className="border-2 border-black pl-4 py-3">
              <div className="flex items-start gap-3 mb-2">
                <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">2</div>
                <h4 className="font-bold text-base text-black">Alterar para "Em Andamento"</h4>
              </div>
              <ol className="text-xs space-y-1 ml-11 list-decimal text-black">
                <li>No campo "Status", selecione <strong>"Em Andamento"</strong></li>
                <li>Indica que começou a trabalhar na solução</li>
                <li>Remove da lista de "Aguardando Tratamento"</li>
              </ol>
            </div>

            <div className="border-2 border-black pl-4 py-3">
              <div className="flex items-start gap-3 mb-2">
                <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">3</div>
                <h4 className="font-bold text-base text-black">Preencher Campos Customizados</h4>
              </div>
              <div className="ml-11 text-xs text-black">
                <p>Cada tipo tem campos específicos. Exemplos:</p>
                <ul className="ml-4 list-disc space-y-1">
                  <li><strong>Quebra:</strong> Oficina, Peça, Custo</li>
                  <li><strong>Acidente:</strong> Boletim, Seguradoras, Avaria</li>
                  <li><strong>Diária:</strong> Valor Sugerido, Autorizado, Nº Autorização</li>
                </ul>
              </div>
            </div>

            <div className="border-2 border-black pl-4 py-3">
              <div className="flex items-start gap-3 mb-2">
                <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">4</div>
                <h4 className="font-bold text-base text-black">Anexar Evidências</h4>
              </div>
              <ol className="text-xs space-y-1 ml-11 list-decimal text-black">
                <li>Clique em "Adicionar Anexo"</li>
                <li>Selecione foto/documento</li>
                <li>Exemplos: Foto do veículo reparado, Email cliente, Comprovante</li>
              </ol>
            </div>

            <div className="border-2 border-black pl-4 py-3">
              <div className="flex items-start gap-3 mb-2">
                <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">5</div>
                <h4 className="font-bold text-base text-black">Fechar Ocorrência</h4>
              </div>
              <ol className="text-xs space-y-1 ml-11 list-decimal text-black">
                <li>Altere Status para <strong>"Resolvida"</strong></li>
                <li>Informe <strong>Data/Hora Fim</strong></li>
                <li>Sistema calcula tempo de resolução</li>
                <li>Clique em <strong>"Salvar"</strong></li>
              </ol>
            </div>
          </div>
        </section>

        <section>
          <h3 className="text-lg font-bold mb-3 text-black">6. TRATAMENTO DE DIÁRIAS</h3>
          
          <div className="space-y-3">
            <div className="border-2 border-black pl-4 py-3">
              <p className="font-bold text-sm mb-2 text-black">PASSO 1: Identificar Diária Gerada</p>
              <ol className="text-xs space-y-1 ml-4 list-decimal text-black">
                <li>Sistema detecta atraso além da tolerância</li>
                <li>Cria ocorrência categoria "Diária" automaticamente</li>
                <li>Calcula quantidade de dias</li>
                <li>Sugere valor baseado na operação</li>
                <li>Status: "Pendente Valor"</li>
              </ol>
            </div>

            <div className="border-2 border-black pl-4 py-3">
              <p className="font-bold text-sm mb-2 text-black">PASSO 2: Revisar Valor</p>
              <ol className="text-xs space-y-1 ml-4 list-decimal text-black">
                <li>Acesse Qualidade → Ocorrências → Filtro "Diária"</li>
                <li>Revise <strong>Valor Sugerido</strong></li>
                <li>Ajuste <strong>Valor Autorizado</strong> se necessário</li>
                <li>Altere para <strong>"Pendente Autorização"</strong></li>
              </ol>
            </div>

            <div className="border-2 border-black pl-4 py-3">
              <p className="font-bold text-sm mb-2 text-black">PASSO 3: Obter Autorização</p>
              <ol className="text-xs space-y-1 ml-4 list-decimal text-black">
                <li>Comercial entra em contato com cliente</li>
                <li>Explica motivo e valor</li>
                <li><strong>Se Aprovado:</strong> Registrar nº autorização, alterar para "Autorizado"</li>
                <li><strong>Se Abonado:</strong> Alterar para "Abonado", preencher motivo</li>
              </ol>
            </div>

            <div className="border-2 border-black pl-4 py-3">
              <p className="font-bold text-sm mb-2 text-black">PASSO 4: Faturamento</p>
              <ol className="text-xs space-y-1 ml-4 list-decimal text-black">
                <li>Financeiro filtra "Autorizado para Faturamento"</li>
                <li>Inclui valores na NFS ou boleto</li>
                <li>Altera status para <strong>"Faturado"</strong></li>
              </ol>
            </div>
          </div>
        </section>

        <section>
          <h3 className="text-lg font-bold mb-3 text-black">7. ANÁLISE DE CAUSA RAIZ (ISO 9001)</h3>
          
          <div className="text-sm text-black">
            <p className="mb-2">Para ocorrências recorrentes ou graves:</p>
            
            <div className="border-2 border-black rounded p-3 text-xs">
              <p className="mb-2"><strong>Método dos 5 Porquês - Exemplo:</strong></p>
              <ol className="ml-4 space-y-1 list-decimal">
                <li><strong>Por quê atrasou?</strong> Quebrou o veículo</li>
                <li><strong>Por quê quebrou?</strong> Manutenção não foi feita</li>
                <li><strong>Por quê não foi feita?</strong> Não tem controle de vencimento</li>
                <li><strong>Por quê não tem controle?</strong> Sistema não alerta</li>
                <li><strong>Por quê não alerta?</strong> Funcionalidade não ativada</li>
                <li className="font-semibold text-black">CAUSA RAIZ: Falta ativar alertas no sistema</li>
              </ol>
            </div>
          </div>

          <div className="mt-4">
            <p className="font-semibold mb-2 text-sm text-black">Plano de Ação 5W2H:</p>
            <table className="w-full text-xs border-2 border-black">
              <thead style={{ backgroundColor: '#ffffff' }}>
                <tr>
                  <th className="border border-black p-2 text-black">O quê?</th>
                  <th className="border border-black p-2 text-black">Por quê?</th>
                  <th className="border border-black p-2 text-black">Quem?</th>
                  <th className="border border-black p-2 text-black">Quando?</th>
                  <th className="border border-black p-2 text-black">Onde?</th>
                  <th className="border border-black p-2 text-black">Como?</th>
                  <th className="border border-black p-2 text-black">Quanto?</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-black p-2 text-black">Ativar alertas</td>
                  <td className="border border-black p-2 text-black">Prevenir quebras</td>
                  <td className="border border-black p-2 text-black">TI + Manutenção</td>
                  <td className="border border-black p-2 text-black">15/12/24</td>
                  <td className="border border-black p-2 text-black">Sistema</td>
                  <td className="border border-black p-2 text-black">Config + treino</td>
                  <td className="border border-black p-2 text-black">R$ 0</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h3 className="text-lg font-bold mb-3 text-black">8. INDICADORES E ANÁLISE</h3>
          <div className="text-sm text-black">
            <p className="mb-2">Análise mensal obrigatória:</p>
            <ul className="ml-6 list-disc space-y-1 text-xs">
              <li>Top 5 Tipos Mais Frequentes</li>
              <li>Departamentos com Mais Ocorrências</li>
              <li>Taxa de Resolução no Prazo (Meta ≥ 92%)</li>
              <li>Ocorrências Críticas</li>
              <li>Impacto no SLA</li>
              <li>Eficácia de Ações Corretivas</li>
            </ul>
          </div>
        </section>

        <section>
          <h3 className="text-lg font-bold mb-3 text-black">9. DOCUMENTOS RELACIONADOS</h3>
          <ul className="list-disc list-inside text-sm space-y-1 ml-4 text-black">
            <li><strong>PO-LOG-001</strong> - Gestão de Transportes</li>
            <li><strong>IT-LOG-001</strong> - Gestão de Ordens</li>
            <li><strong>IT-LOG-002</strong> - Tracking</li>
            <li><strong>MAN-LOG-001</strong> - Manual do Sistema</li>
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