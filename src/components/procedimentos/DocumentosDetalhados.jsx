import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Package, Truck, ClipboardCheck, AlertCircle } from "lucide-react";

// Continua daqui com IT-LOG-001 aprimorada
export function InstrucaoOrdensCarregamentoDetalhada({ theme, isDark }) {
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
                Gestão de Ordens de Carregamento
              </h2>
            </div>
            <div className="text-right text-sm" style={{ color: theme.textMuted }}>
              <p className="font-bold">Código: IT-LOG-001</p>
              <p>Revisão: 01</p>
              <p>Data: 09/12/2024</p>
              <p>Páginas: 1/2</p>
            </div>
          </div>
          
          <div className="grid grid-cols-4 gap-3 text-sm mb-4">
            <div>
              <p className="font-semibold" style={{ color: theme.text }}>Elaborado:</p>
              <p style={{ color: theme.textMuted }}>Qualidade</p>
            </div>
            <div>
              <p className="font-semibold" style={{ color: theme.text }}>Aprovado:</p>
              <p style={{ color: theme.textMuted }}>Dir. Operações</p>
            </div>
            <div>
              <p className="font-semibold" style={{ color: theme.text }}>Processo:</p>
              <p style={{ color: theme.textMuted }}>PO-LOG-001</p>
            </div>
            <div>
              <p className="font-semibold" style={{ color: theme.text }}>Próxima Revisão:</p>
              <p style={{ color: theme.textMuted }}>09/12/2025</p>
            </div>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded p-2 text-xs">
            <p style={{ color: theme.textMuted }}>
              <strong>Referência:</strong> ISO 9001:2015 (8.5.1, 8.5.5, 8.5.6) | SASSMAQ v.7 (3.1, 3.2)
            </p>
          </div>
        </div>

        <section>
          <h3 className="text-lg font-bold mb-3" style={{ color: theme.text }}>1. OBJETIVO</h3>
          <p className="text-sm leading-relaxed" style={{ color: theme.textMuted }}>
            Padronizar a criação, atualização e controle de Ordens de Carregamento no sistema Log Flow, 
            assegurando rastreabilidade completa, alocação eficiente de recursos e conformidade com 
            requisitos normativos e contratuais.
          </p>
        </section>

        <section>
          <h3 className="text-lg font-bold mb-3" style={{ color: theme.text }}>2. APLICAÇÃO E RESPONSABILIDADES</h3>
          <table className="w-full text-xs border" style={{ borderColor: theme.cardBorder }}>
            <thead style={{ backgroundColor: isDark ? '#0f172a' : '#f3f4f6' }}>
              <tr>
                <th className="border p-2 text-left w-32" style={{ borderColor: theme.cardBorder, color: theme.text }}>Função</th>
                <th className="border p-2 text-left" style={{ borderColor: theme.cardBorder, color: theme.text }}>Responsabilidades Específicas</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border p-2 font-semibold" style={{ borderColor: theme.cardBorder, color: theme.text }}>Operador Logístico</td>
                <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>
                  Criar ordens, preencher dados obrigatórios, vincular NFs, atualizar informações inline
                </td>
              </tr>
              <tr>
                <td className="border p-2 font-semibold" style={{ borderColor: theme.cardBorder, color: theme.text }}>Coord. Expedição</td>
                <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>
                  Alocar motoristas e veículos, validar rotas, aprovar liberações
                </td>
              </tr>
              <tr>
                <td className="border p-2 font-semibold" style={{ borderColor: theme.cardBorder, color: theme.text }}>Gestor Operações</td>
                <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>
                  Monitorar taxa de alocação, tempo médio de alocação, acuracidade de dados
                </td>
              </tr>
            </tbody>
          </table>
        </section>

        <section>
          <h3 className="text-lg font-bold mb-3" style={{ color: theme.text }}>3. TERMINOLOGIA (ISO 9000:2015)</h3>
          <div className="text-sm space-y-2" style={{ color: theme.textMuted }}>
            <p><strong>Oferta:</strong> Carga disponível sem recursos alocados (motorista/veículo)</p>
            <p><strong>Negociando:</strong> Motorista definido, veículo pendente</p>
            <p><strong>Alocado:</strong> Motorista + veículo completos (ordem executável)</p>
            <p><strong>CIF (Cost, Insurance and Freight):</strong> Cliente é o remetente (paga frete)</p>
            <p><strong>FOB (Free On Board):</strong> Cliente é o destinatário (paga frete)</p>
            <p><strong>SLA:</strong> Acordo de prazo para carregamento e descarga</p>
            <p><strong>Rastreabilidade:</strong> Histórico completo de criação, alterações e status</p>
          </div>
        </section>

        <section>
          <h3 className="text-lg font-bold mb-3" style={{ color: theme.text }}>4. PASSO A PASSO OPERACIONAL</h3>
          
          <div className="space-y-4">
            {/* PASSO 1 */}
            <div className="border-l-4 border-blue-600 pl-4 py-3" style={{ backgroundColor: isDark ? '#0f172a' : '#f9fafb' }}>
              <div className="flex items-start gap-3 mb-2">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">1</div>
                <h4 className="font-bold text-base" style={{ color: theme.text }}>Acessar Módulo de Ordens</h4>
              </div>
              <ol className="text-xs space-y-1 ml-11 list-decimal" style={{ color: theme.textMuted }}>
                <li>Faça login no sistema Log Flow com suas credenciais</li>
                <li>No menu lateral esquerdo, localize a seção <strong>"Operações"</strong></li>
                <li>Clique em <strong>"Ordens"</strong> (ícone de pacote)</li>
                <li>Aguarde o carregamento da lista de ordens existentes</li>
                <li>No canto superior direito, localize o botão azul <strong>"Nova Ordem"</strong></li>
                <li>Clique em <strong>"Nova Ordem"</strong> - um menu dropdown será exibido</li>
              </ol>
            </div>

            {/* PASSO 2 */}
            <div className="border-l-4 border-blue-600 pl-4 py-3" style={{ backgroundColor: isDark ? '#0f172a' : '#f9fafb' }}>
              <div className="flex items-start gap-3 mb-2">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">2</div>
                <h4 className="font-bold text-base" style={{ color: theme.text }}>Selecionar Tipo de Ordem</h4>
              </div>
              <div className="text-xs space-y-2 ml-11" style={{ color: theme.textMuted }}>
                <p className="font-semibold">No menu dropdown, escolha UMA das opções:</p>
                
                <div className="space-y-2 mt-2">
                  <div className="flex items-start gap-2">
                    <span className="font-bold text-blue-600">A)</span>
                    <div>
                      <p className="font-semibold">Ordem Completa</p>
                      <p className="mt-1"><strong>Usar quando:</strong> Você JÁ tem motorista E veículo definidos</p>
                      <p><strong>Resultado:</strong> Cria ordem com tipo "Alocado" imediatamente</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <span className="font-bold text-green-600">B)</span>
                    <div>
                      <p className="font-semibold">Oferta de Carga</p>
                      <p className="mt-1"><strong>Usar quando:</strong> Tem apenas a carga disponível (sem motorista/veículo)</p>
                      <p><strong>Resultado:</strong> Cria ordem tipo "Oferta" - pode alocar recursos depois</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <span className="font-bold text-purple-600">C)</span>
                    <div>
                      <p className="font-semibold">Lançamento em Lote</p>
                      <p className="mt-1"><strong>Usar quando:</strong> Precisa criar várias ofertas de uma vez</p>
                      <p><strong>Resultado:</strong> Importa planilha Excel com múltiplas ofertas simultâneas</p>
                    </div>
                  </div>
                </div>

                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-300 dark:border-yellow-700 rounded p-2 mt-3">
                  <p className="font-semibold">⚠️ ATENÇÃO:</p>
                  <p>Escolha correta economiza tempo! Se tiver dúvida, use "Oferta" - você aloca recursos depois.</p>
                </div>
              </div>
            </div>

            {/* PASSO 3 */}
            <div className="border-l-4 border-blue-600 pl-4 py-3" style={{ backgroundColor: isDark ? '#0f172a' : '#f9fafb' }}>
              <div className="flex items-start gap-3 mb-2">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">3</div>
                <h4 className="font-bold text-base" style={{ color: theme.text }}>Preencher Dados do Cliente</h4>
              </div>
              <div className="ml-11 space-y-3">
                <div className="text-xs space-y-1" style={{ color: theme.textMuted }}>
                  <p className="font-semibold">3.1 Razão Social do Cliente: *</p>
                  <ol className="ml-4 list-disc">
                    <li>Digite o nome completo da empresa (conforme CNPJ/contrato)</li>
                    <li>Exemplo: "MINERAÇÃO BRASIL LTDA"</li>
                  </ol>
                </div>

                <div className="text-xs space-y-1" style={{ color: theme.textMuted }}>
                  <p className="font-semibold">3.2 CNPJ do Cliente:</p>
                  <ol className="ml-4 list-disc">
                    <li>Informe o CNPJ com ou sem formatação (sistema aceita ambos)</li>
                    <li>Exemplo: 00.000.000/0001-00 ou 00000000000100</li>
                    <li>Campo opcional, mas RECOMENDADO para rastreabilidade</li>
                  </ol>
                </div>

                <div className="text-xs space-y-1" style={{ color: theme.textMuted }}>
                  <p className="font-semibold">3.3 Tipo de Operação: *</p>
                  <ol className="ml-4 list-disc space-y-1">
                    <li><strong>Selecione CIF quando:</strong> O cliente É O REMETENTE (quem ENVIA a carga)
                      <ul className="ml-6 mt-1">
                        <li>→ Cliente paga o frete</li>
                        <li>→ Exemplo: Cliente envia produtos para outro destinatário</li>
                      </ul>
                    </li>
                    <li><strong>Selecione FOB quando:</strong> O cliente É O DESTINATÁRIO (quem RECEBE a carga)
                      <ul className="ml-6 mt-1">
                        <li>→ Cliente paga o frete</li>
                        <li>→ Exemplo: Fornecedor envia produtos para o cliente</li>
                      </ul>
                    </li>
                  </ol>
                </div>

                <div className="bg-red-50 dark:bg-red-900/20 border border-red-300 dark:border-red-700 rounded p-2">
                  <p className="font-semibold text-xs">❌ ERRO COMUM:</p>
                  <p className="text-xs" style={{ color: theme.textMuted }}>
                    Confundir CIF/FOB inverte quem paga o frete! Revise SEMPRE antes de salvar.
                  </p>
                </div>
              </div>
            </div>

            {/* PASSO 4 */}
            <div className="border-l-4 border-blue-600 pl-4 py-3" style={{ backgroundColor: isDark ? '#0f172a' : '#f9fafb' }}>
              <div className="flex items-start gap-3 mb-2">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">4</div>
                <h4 className="font-bold text-base" style={{ color: theme.text }}>Informar Rota e Carga</h4>
              </div>
              <div className="ml-11 space-y-3">
                <div className="text-xs space-y-1" style={{ color: theme.textMuted }}>
                  <p className="font-semibold">4.1 Origem da Carga: *</p>
                  <ol className="ml-4 list-disc">
                    <li>Digite a cidade e UF de onde a carga será coletada</li>
                    <li>Formato: "CIDADE/UF" (ex: "BELO HORIZONTE/MG")</li>
                    <li>Ou endereço completo se necessário rastreamento preciso</li>
                  </ol>
                </div>

                <div className="text-xs space-y-1" style={{ color: theme.textMuted }}>
                  <p className="font-semibold">4.2 Destino da Carga: *</p>
                  <ol className="ml-4 list-disc">
                    <li>Digite a cidade e UF de onde a carga será entregue</li>
                    <li>Formato: "CIDADE/UF" (ex: "SÃO PAULO/SP")</li>
                    <li>Se entrega em local específico, informe endereço completo</li>
                  </ol>
                </div>

                <div className="text-xs space-y-1" style={{ color: theme.textMuted }}>
                  <p className="font-semibold">4.3 Produto: *</p>
                  <ol className="ml-4 list-disc">
                    <li>Descreva a mercadoria a ser transportada</li>
                    <li>Seja específico: "Minério de Ferro" em vez de apenas "Minério"</li>
                    <li>Se carga perigosa, informe classe de risco</li>
                  </ol>
                </div>

                <div className="text-xs space-y-1" style={{ color: theme.textMuted }}>
                  <p className="font-semibold">4.4 Peso: *</p>
                  <ol className="ml-4 list-disc">
                    <li>Informe o peso TOTAL em quilogramas (kg)</li>
                    <li>Apenas números (sistema converte para toneladas automaticamente)</li>
                    <li>Exemplo: Digite 25000 para 25 toneladas</li>
                    <li><strong>Validação:</strong> Deve ser maior que zero</li>
                  </ol>
                </div>

                <div className="text-xs space-y-1" style={{ color: theme.textMuted }}>
                  <p className="font-semibold">4.5 Volumes:</p>
                  <ol className="ml-4 list-disc">
                    <li>Quantidade de itens/paletes/volumes</li>
                    <li>Exemplo: 20 paletes, 100 caixas, 1 container</li>
                  </ol>
                </div>

                <div className="text-xs space-y-1" style={{ color: theme.textMuted }}>
                  <p className="font-semibold">4.6 Embalagem:</p>
                  <ol className="ml-4 list-disc">
                    <li>Descreva como a carga está acondicionada</li>
                    <li>Exemplos: Palete PBR, Big Bag 1000kg, Granel, Engradado</li>
                  </ol>
                </div>
              </div>
            </div>

            {/* PASSO 5 */}
            <div className="border-l-4 border-blue-600 pl-4 py-3" style={{ backgroundColor: isDark ? '#0f172a' : '#f9fafb' }}>
              <div className="flex items-start gap-3 mb-2">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">5</div>
                <h4 className="font-bold text-base" style={{ color: theme.text }}>Definir Requisitos do Transporte</h4>
              </div>
              <div className="ml-11 space-y-3">
                <div className="text-xs space-y-1" style={{ color: theme.textMuted }}>
                  <p className="font-semibold">5.1 Operação Vinculada:</p>
                  <ol className="ml-4 list-disc">
                    <li>Selecione a operação pré-cadastrada na lista</li>
                    <li>A operação define: SLA, tolerância de diárias, prazo de entrega</li>
                    <li>Se não houver operação compatível, cadastre antes em: Recursos → Operações</li>
                    <li><strong>Importante:</strong> Sem operação, não há controle de SLA!</li>
                  </ol>
                </div>

                <div className="text-xs space-y-1" style={{ color: theme.textMuted }}>
                  <p className="font-semibold">5.2 Modalidade de Carga:</p>
                  <ol className="ml-4 list-disc">
                    <li><strong>Normal:</strong> Prazo padrão da operação</li>
                    <li><strong>Prioridade:</strong> Requer atenção especial (destacada em amarelo)</li>
                    <li><strong>Expressa:</strong> Urgente, prazo reduzido (destacada em laranja)</li>
                  </ol>
                </div>

                <div className="text-xs space-y-1" style={{ color: theme.textMuted }}>
                  <p className="font-semibold">5.3 Tipo de Veículo:</p>
                  <ol className="ml-4 list-disc">
                    <li>Selecione conforme necessidade da carga:</li>
                    <li>RODOTREM (9 eixos) - TRUCK (3 eixos) - CARRETA 5/6/7 EIXOS</li>
                    <li>BITREM - PRANCHA - BI-TRUCK - FIORINO</li>
                  </ol>
                </div>

                <div className="text-xs space-y-1" style={{ color: theme.textMuted }}>
                  <p className="font-semibold">5.4 Tipo de Carroceria:</p>
                  <ol className="ml-4 list-disc">
                    <li>SIDER (lona) - BAÚ (fechado) - PRANCHA (plataforma)</li>
                    <li>GRADE BAIXA/ALTA - EXTENSIVA - CARRETA LOC</li>
                  </ol>
                </div>

                <div className="text-xs space-y-1" style={{ color: theme.textMuted }}>
                  <p className="font-semibold">5.5 Data Prevista de Carregamento:</p>
                  <ol className="ml-4 list-disc">
                    <li>Informe quando a carga deve ser coletada</li>
                    <li>Formato: dd/mm/aaaa</li>
                    <li>Esta data é usada para planejamento (não é SLA ainda)</li>
                  </ol>
                </div>
              </div>
            </div>

            {/* PASSO 6 */}
            <div className="border-l-4 border-blue-600 pl-4 py-3" style={{ backgroundColor: isDark ? '#0f172a' : '#f9fafb' }}>
              <div className="flex items-start gap-3 mb-2">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">6</div>
                <h4 className="font-bold text-base" style={{ color: theme.text }}>Informar Valores Comerciais</h4>
              </div>
              <div className="ml-11 space-y-3">
                <div className="text-xs space-y-1" style={{ color: theme.textMuted }}>
                  <p className="font-semibold">6.1 Método de Cobrança - Escolha UM:</p>
                  
                  <div className="space-y-2 mt-2">
                    <div className="flex items-start gap-2">
                      <span className="font-bold text-blue-600">Opção A:</span>
                      <div>
                        <p className="font-semibold">Por Tonelada</p>
                        <ol className="ml-4 list-disc mt-1">
                          <li>Informe o <strong>Valor por Tonelada</strong> (campo numérico)</li>
                          <li>Exemplo: Digite 150.00 para R$ 150,00/ton</li>
                          <li>Sistema calcula automaticamente: (Peso ÷ 1000) × Valor/ton</li>
                          <li>Resultado aparece em "Valor Total Frete"</li>
                        </ol>
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <span className="font-bold text-green-600">Opção B:</span>
                      <div>
                        <p className="font-semibold">Por Viagem (Valor Fechado)</p>
                        <ol className="ml-4 list-disc mt-1">
                          <li>Informe o <strong>Frete por Viagem</strong> (valor total fechado)</li>
                          <li>Exemplo: Digite 3500.00 para R$ 3.500,00</li>
                          <li>Ignorar campo "Valor por Tonelada"</li>
                          <li>Sistema usa este valor como "Valor Total Frete"</li>
                        </ol>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="text-xs space-y-1" style={{ color: theme.textMuted }}>
                  <p className="font-semibold">6.2 Adiantamento (Opcional):</p>
                  <ol className="ml-4 list-disc">
                    <li>Se houver adiantamento acordado com motorista, informe o valor</li>
                    <li>Sistema calcula automaticamente: Saldo = Frete Total - Adiantamento</li>
                  </ol>
                </div>
              </div>
            </div>

            {/* PASSO 7 */}
            <div className="border-l-4 border-blue-600 pl-4 py-3" style={{ backgroundColor: isDark ? '#0f172a' : '#f9fafb' }}>
              <div className="flex items-start gap-3 mb-2">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">7</div>
                <h4 className="font-bold text-base" style={{ color: theme.text }}>Alocar Recursos (Se Ordem Completa)</h4>
              </div>
              <div className="ml-11 space-y-3">
                <p className="text-xs italic" style={{ color: theme.textMuted }}>
                  ℹ️ Este passo é OBRIGATÓRIO para "Ordem Completa" e OPCIONAL para "Oferta"
                </p>

                <div className="text-xs space-y-1" style={{ color: theme.textMuted }}>
                  <p className="font-semibold">7.1 Motorista:</p>
                  <ol className="ml-4 list-decimal space-y-1">
                    <li><strong>Opção A - Motorista Cadastrado:</strong>
                      <ul className="ml-6 list-disc mt-1">
                        <li>Clique no campo "Motorista"</li>
                        <li>Selecione da lista suspensa</li>
                        <li>Sistema valida CNH automaticamente (se vencida, alerta)</li>
                      </ul>
                    </li>
                    <li><strong>Opção B - Motorista Temporário:</strong>
                      <ul className="ml-6 list-disc mt-1">
                        <li>Clique em "Nome Temporário"</li>
                        <li>Digite nome COMPLETO em MAIÚSCULAS</li>
                        <li>Exemplo: JOÃO SILVA DOS SANTOS</li>
                        <li>⚠️ Cadastre motorista depois em: Recursos → Motoristas</li>
                      </ul>
                    </li>
                  </ol>
                </div>

                <div className="text-xs space-y-1" style={{ color: theme.textMuted }}>
                  <p className="font-semibold">7.2 Veículo Cavalo (Placa): *</p>
                  <ol className="ml-4 list-decimal space-y-1">
                    <li><strong>Opção A - Veículo Cadastrado:</strong>
                      <ul className="ml-6 list-disc mt-1">
                        <li>Selecione cavalo da lista</li>
                        <li>Sistema valida ANTT e licenciamento</li>
                      </ul>
                    </li>
                    <li><strong>Opção B - Placa Temporária:</strong>
                      <ul className="ml-6 list-disc mt-1">
                        <li>Digite placa com 7 caracteres (apenas letras e números)</li>
                        <li>Exemplo: ABC1D23 ou ABC1234</li>
                        <li>Sistema formata automaticamente em MAIÚSCULAS</li>
                        <li>⚠️ Cadastre veículo depois em: Recursos → Veículos</li>
                      </ul>
                    </li>
                  </ol>
                </div>

                <div className="text-xs space-y-1" style={{ color: theme.textMuted }}>
                  <p className="font-semibold">7.3 Implementos (Carretas):</p>
                  <ol className="ml-4 list-disc">
                    <li>Informe até 3 implementos (reboque/carreta)</li>
                    <li>Procedimento idêntico ao cavalo (cadastrado ou placa temporária)</li>
                    <li>Formato: 7 caracteres alfanuméricos</li>
                  </ol>
                </div>

                <div className="text-xs space-y-1" style={{ color: theme.textMuted }}>
                  <p className="font-semibold">7.4 Tipo de Frota:</p>
                  <ol className="ml-4 list-disc">
                    <li><strong>Própria:</strong> Veículo da empresa</li>
                    <li><strong>Terceirizada:</strong> Empresa terceira contratada</li>
                    <li><strong>Agregado:</strong> Motorista autônomo com veículo próprio</li>
                    <li><strong>Acionista:</strong> Sócio da empresa com veículo</li>
                  </ol>
                </div>
              </div>
            </div>

            {/* PASSO 8 */}
            <div className="border-l-4 border-blue-600 pl-4 py-3" style={{ backgroundColor: isDark ? '#0f172a' : '#f9fafb' }}>
              <div className="flex items-start gap-3 mb-2">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">8</div>
                <h4 className="font-bold text-base" style={{ color: theme.text }}>Vincular Notas Fiscais (Opcional)</h4>
              </div>
              <div className="ml-11 space-y-3">
                <p className="text-xs" style={{ color: theme.textMuted }}>
                  <strong>Quando vincular NFs:</strong> Se a ordem já possui documentação fiscal definida.
                </p>

                <div className="text-xs space-y-2" style={{ color: theme.textMuted }}>
                  <p className="font-semibold">Métodos de Vinculação:</p>
                  
                  <div className="space-y-2">
                    <div className="flex items-start gap-2">
                      <span className="font-bold text-blue-600">1)</span>
                      <div>
                        <p className="font-semibold">Upload de XML:</p>
                        <ol className="ml-4 list-disc mt-1">
                          <li>Clique em "Adicionar Nota Fiscal"</li>
                          <li>Selecione aba "Upload XML"</li>
                          <li>Arraste arquivo .xml ou clique para selecionar</li>
                          <li>Sistema extrai AUTOMATICAMENTE todos os dados</li>
                          <li>Peso, volumes, valores, emitente, destinatário preenchidos</li>
                        </ol>
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <span className="font-bold text-green-600">2)</span>
                      <div>
                        <p className="font-semibold">Chave de Acesso (44 dígitos):</p>
                        <ol className="ml-4 list-disc mt-1">
                          <li>Selecione aba "Chave NF-e"</li>
                          <li>Digite ou cole os 44 dígitos da chave</li>
                          <li>Sistema busca NF-e automaticamente na SEFAZ</li>
                          <li>Dados preenchidos automaticamente</li>
                        </ol>
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <span className="font-bold text-purple-600">3)</span>
                      <div>
                        <p className="font-semibold">Selecionar NF Existente:</p>
                        <ol className="ml-4 list-disc mt-1">
                          <li>Selecione aba "NFs Cadastradas"</li>
                          <li>Busque por número, chave ou remetente</li>
                          <li>Marque checkbox das NFs desejadas</li>
                          <li>Clique em "Vincular Selecionadas"</li>
                        </ol>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border rounded p-2" style={{ backgroundColor: theme.headerBg, borderColor: theme.cardBorder }}>
                  <p className="font-semibold text-xs" style={{ color: theme.text }}>✓ BENEFÍCIO:</p>
                  <p className="text-xs" style={{ color: theme.textMuted }}>
                    Quando NFs são vinculadas, peso/volumes da ordem são atualizados AUTOMATICAMENTE com totais consolidados.
                  </p>
                </div>
              </div>
            </div>

            {/* PASSO 9 */}
            <div className="border-l-4 pl-4 py-3" style={{ backgroundColor: theme.headerBg, borderColor: '#6b7280' }}>
              <div className="flex items-start gap-3 mb-2">
                <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">9</div>
                <h4 className="font-bold text-base text-green-600">Conferir e Salvar</h4>
              </div>
              <div className="ml-11">
                <p className="text-xs font-semibold mb-2" style={{ color: theme.textMuted }}>
                  CHECKLIST FINAL ANTES DE SALVAR:
                </p>
                <table className="w-full text-xs border" style={{ borderColor: theme.cardBorder }}>
                  <tbody>
                    <tr>
                      <td className="border p-2 w-8" style={{ borderColor: theme.cardBorder }}>☐</td>
                      <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>Cliente e CNPJ corretos</td>
                    </tr>
                    <tr>
                      <td className="border p-2" style={{ borderColor: theme.cardBorder }}>☐</td>
                      <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>Tipo de Operação (CIF/FOB) validado</td>
                    </tr>
                    <tr>
                      <td className="border p-2" style={{ borderColor: theme.cardBorder }}>☐</td>
                      <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>Rota (origem → destino) conferida</td>
                    </tr>
                    <tr>
                      <td className="border p-2" style={{ borderColor: theme.cardBorder }}>☐</td>
                      <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>Peso informado em kg e maior que zero</td>
                    </tr>
                    <tr>
                      <td className="border p-2" style={{ borderColor: theme.cardBorder }}>☐</td>
                      <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>Tipo de veículo compatível com a carga</td>
                    </tr>
                    <tr>
                      <td className="border p-2" style={{ borderColor: theme.cardBorder }}>☐</td>
                      <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>Valor do frete calculado corretamente</td>
                    </tr>
                    <tr>
                      <td className="border p-2" style={{ borderColor: theme.cardBorder }}>☐</td>
                      <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>Operação selecionada (para SLA)</td>
                    </tr>
                    <tr>
                      <td className="border p-2" style={{ borderColor: theme.cardBorder }}>☐</td>
                      <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>Motorista e veículo definidos (se ordem completa)</td>
                    </tr>
                  </tbody>
                </table>

                <div className="mt-3 space-y-2 text-xs" style={{ color: theme.textMuted }}>
                  <p className="font-semibold">Após conferência:</p>
                  <ol className="ml-4 list-decimal">
                    <li>Clique no botão <strong>"Salvar Ordem"</strong> (rodapé do formulário)</li>
                    <li>Aguarde mensagem de confirmação na tela</li>
                    <li>Sistema exibe número da ordem gerado (ex: 2024-0157)</li>
                    <li>Ordem aparece na tabela com status inicial</li>
                    <li>Sistema vincula automaticamente à primeira etapa do fluxo operacional</li>
                  </ol>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="print-page-break">
          <h3 className="text-lg font-bold mb-3" style={{ color: theme.text }}>5. EDIÇÃO RÁPIDA (INLINE EDITING)</h3>
          
          <p className="text-sm mb-3" style={{ color: theme.textMuted }}>
            Após criar a ordem, você pode editar campos diretamente na tabela sem abrir formulário:
          </p>

          <div className="space-y-3">
            <Card style={{ backgroundColor: isDark ? '#0f172a' : '#ffffff', borderColor: theme.cardBorder }}>
              <CardContent className="p-4">
                <h4 className="font-bold text-sm mb-2" style={{ color: theme.text }}>Procedimento de Edição Inline:</h4>
                <ol className="text-xs space-y-2 ml-4 list-decimal" style={{ color: theme.textMuted }}>
                  <li>
                    <strong>Localizar ordem:</strong> Na tela de Ordens, encontre a ordem na tabela
                  </li>
                  <li>
                    <strong>Clicar no campo:</strong> Clique DIRETAMENTE no campo que deseja editar
                    <ul className="ml-6 list-disc mt-1">
                      <li>Campo fica destacado em azul claro</li>
                      <li>Transforma em caixa de edição</li>
                    </ul>
                  </li>
                  <li>
                    <strong>Editar valor:</strong> Digite/selecione o novo valor
                    <ul className="ml-6 list-disc mt-1">
                      <li>Textos: digite livremente</li>
                      <li>Seleções: escolha da lista (modalidade, tipo veículo)</li>
                      <li>Datas: use seletor de data ou pressione "H" para AGORA</li>
                    </ul>
                  </li>
                  <li>
                    <strong>Salvar:</strong> Pressione ENTER ou clique FORA do campo
                    <ul className="ml-6 list-disc mt-1">
                      <li>Sistema salva automaticamente</li>
                      <li>Exibe mensagem: "Campo atualizado com sucesso!"</li>
                      <li>Atualiza tipo de ordem se necessário (oferta→negociando→alocado)</li>
                    </ul>
                  </li>
                  <li>
                    <strong>Cancelar:</strong> Pressione ESC para descartar alteração
                  </li>
                </ol>
              </CardContent>
            </Card>

            <div className="grid grid-cols-2 gap-3">
              <Card style={{ backgroundColor: isDark ? '#0f172a' : '#ffffff', borderColor: theme.cardBorder }}>
                <CardContent className="p-3">
                  <p className="font-semibold text-xs mb-2" style={{ color: theme.text }}>Campos Editáveis Inline:</p>
                  <ul className="text-xs space-y-1 list-disc ml-4" style={{ color: theme.textMuted }}>
                    <li>Modalidade (Normal/Prioridade/Expressa)</li>
                    <li>Tipo de Veículo</li>
                    <li>Nome Motorista Temporário</li>
                    <li>Placa Cavalo Temporária</li>
                    <li>Placas Implementos 1, 2, 3</li>
                    <li>Frete por Viagem (R$)</li>
                    <li>Data/Hora Agend. Carregamento</li>
                    <li>Data/Hora Agend. Descarga</li>
                    <li>Observações da Carga</li>
                  </ul>
                </CardContent>
              </Card>

              <Card style={{ backgroundColor: isDark ? '#0f172a' : '#ffffff', borderColor: theme.cardBorder }}>
                <CardContent className="p-3">
                  <p className="font-semibold text-xs mb-2" style={{ color: theme.text }}>⌨️ Atalhos de Produtividade:</p>
                  <div className="space-y-2 text-xs" style={{ color: theme.textMuted }}>
                    <div className="flex items-start gap-2">
                      <div className="px-2 py-0.5 bg-gray-700 text-white rounded font-mono text-[10px]">H</div>
                      <div>
                        <p className="font-semibold">Atalho "H" (Hoje/Hora)</p>
                        <p>Em campos de data/hora: preenche com timestamp ATUAL</p>
                        <p className="text-[10px] italic">Ex: 09/12/2024 14:35</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="px-2 py-0.5 bg-gray-700 text-white rounded font-mono text-[10px]">ENTER</div>
                      <div>
                        <p className="font-semibold">Salvar Campo</p>
                        <p>Confirma e salva a alteração</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="px-2 py-0.5 bg-gray-700 text-white rounded font-mono text-[10px]">ESC</div>
                      <div>
                        <p className="font-semibold">Cancelar Edição</p>
                        <p>Descarta alteração e fecha edição</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-300 dark:border-yellow-700 rounded p-3 text-xs">
              <p className="font-semibold mb-1">💡 DICA DE PRODUTIVIDADE:</p>
              <p style={{ color: theme.textMuted }}>
                Para ordens urgentes, crie como OFERTA primeiro (só dados básicos). Depois, use edição inline 
                para alocar motorista/veículo rapidamente conforme disponibilidade. Economiza até 80% do tempo!
              </p>
            </div>
          </div>
        </section>

        <section>
          <h3 className="text-lg font-bold mb-3" style={{ color: theme.text }}>6. TRANSIÇÕES AUTOMÁTICAS</h3>
          <div className="text-sm space-y-3" style={{ color: theme.textMuted }}>
            <p>O sistema atualiza automaticamente o tipo de ordem conforme você preenche dados:</p>
            
            <div className="flex items-center gap-2 flex-wrap">
              <div className="px-3 py-1.5 bg-green-600 text-white rounded font-bold text-xs">OFERTA</div>
              <span className="text-xl">→</span>
              <div className="text-xs">
                <p className="font-semibold">Ao informar MOTORISTA</p>
                <p className="text-[10px]">(nome temporário ou seleção)</p>
              </div>
              <span className="text-xl">→</span>
              <div className="px-3 py-1.5 bg-yellow-600 text-white rounded font-bold text-xs">NEGOCIANDO</div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <div className="px-3 py-1.5 bg-yellow-600 text-white rounded font-bold text-xs">NEGOCIANDO</div>
              <span className="text-xl">→</span>
              <div className="text-xs">
                <p className="font-semibold">Ao informar PLACA DO CAVALO</p>
                <p className="text-[10px]">(placa temporária ou seleção)</p>
              </div>
              <span className="text-xl">→</span>
              <div className="px-3 py-1.5 bg-blue-600 text-white rounded font-bold text-xs">ALOCADO</div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-300 dark:border-blue-700 rounded p-2 mt-3">
              <p className="font-semibold text-xs">ℹ️ AUTOMAÇÃO:</p>
              <p className="text-xs">
                Você NÃO precisa alterar manualmente o tipo de registro. O sistema faz isso automaticamente 
                baseado nos campos preenchidos.
              </p>
            </div>
          </div>
        </section>

        <section>
          <h3 className="text-lg font-bold mb-3" style={{ color: theme.text }}>7. TRATAMENTO DE ERROS</h3>
          <table className="w-full text-xs border" style={{ borderColor: theme.cardBorder }}>
            <thead style={{ backgroundColor: isDark ? '#0f172a' : '#f3f4f6' }}>
              <tr>
                <th className="border p-2 text-left" style={{ borderColor: theme.cardBorder, color: theme.text }}>Erro/Situação</th>
                <th className="border p-2 text-left" style={{ borderColor: theme.cardBorder, color: theme.text }}>Como Resolver</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>
                  "Campos obrigatórios não preenchidos"
                </td>
                <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>
                  Verifique campos marcados com * vermelho e preencha-os
                </td>
              </tr>
              <tr>
                <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>
                  "CNPJ inválido"
                </td>
                <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>
                  Confira se digitou 14 dígitos corretos (sistema valida dígitos verificadores)
                </td>
              </tr>
              <tr>
                <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>
                  "Placa em formato inválido"
                </td>
                <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>
                  Use apenas letras e números, total de 7 caracteres (ex: ABC1D23)
                </td>
              </tr>
              <tr>
                <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>
                  Dados errados após salvar
                </td>
                <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>
                  Use edição inline para corrigir OU clique em "Editar Completo"
                </td>
              </tr>
              <tr>
                <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>
                  CNH do motorista vencida
                </td>
                <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>
                  Sistema alerta mas permite salvar. Atualize cadastro em: Recursos → Motoristas
                </td>
              </tr>
            </tbody>
          </table>
        </section>

        <section>
          <h3 className="text-lg font-bold mb-3" style={{ color: theme.text }}>8. REGISTROS MANTIDOS (ISO 9001 - 7.5.3)</h3>
          <p className="text-sm mb-2" style={{ color: theme.textMuted }}>
            O sistema registra automaticamente (não requer ação do usuário):
          </p>
          <ul className="list-disc list-inside text-sm space-y-1 ml-4" style={{ color: theme.textMuted }}>
            <li><strong>ID único:</strong> Identificador permanente não reutilizável</li>
            <li><strong>Número sequencial:</strong> Formato ANO-SEQUÊNCIA (ex: 2024-0157)</li>
            <li><strong>created_date:</strong> Timestamp UTC de criação</li>
            <li><strong>created_by:</strong> Email do usuário criador</li>
            <li><strong>updated_date:</strong> Timestamp da última alteração</li>
            <li><strong>Histórico:</strong> Log de mudanças em campos críticos (motorista, veículo, valores)</li>
          </ul>
        </section>

        <section>
          <h3 className="text-lg font-bold mb-3" style={{ color: theme.text }}>9. KPIs E MÉTRICAS</h3>
          <div className="grid grid-cols-3 gap-3">
            <Card style={{ backgroundColor: isDark ? '#0f172a' : '#f9fafb', borderColor: theme.cardBorder }}>
              <CardContent className="p-3 text-center">
                <p className="text-2xl font-bold text-blue-600">≥ 90%</p>
                <p className="text-xs font-semibold mt-1" style={{ color: theme.text }}>Taxa de Alocação</p>
                <p className="text-[10px] mt-1" style={{ color: theme.textMuted }}>
                  (Ordens Alocadas / Total) × 100
                </p>
              </CardContent>
            </Card>
            <Card style={{ backgroundColor: isDark ? '#0f172a' : '#f9fafb', borderColor: theme.cardBorder }}>
              <CardContent className="p-3 text-center">
                <p className="text-2xl font-bold text-green-600">≤ 24h</p>
                <p className="text-xs font-semibold mt-1" style={{ color: theme.text }}>Tempo de Alocação</p>
                <p className="text-[10px] mt-1" style={{ color: theme.textMuted }}>
                  Entre criação e alocação completa
                </p>
              </CardContent>
            </Card>
            <Card style={{ backgroundColor: isDark ? '#0f172a' : '#f9fafb', borderColor: theme.cardBorder }}>
              <CardContent className="p-3 text-center">
                <p className="text-2xl font-bold text-purple-600">≥ 98%</p>
                <p className="text-xs font-semibold mt-1" style={{ color: theme.text }}>Acuracidade</p>
                <p className="text-[10px] mt-1" style={{ color: theme.textMuted }}>
                  Ordens sem necessidade de correção
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        <section>
          <h3 className="text-lg font-bold mb-3" style={{ color: theme.text }}>10. DOCUMENTOS RELACIONADOS</h3>
          <ul className="list-disc list-inside text-sm space-y-1 ml-4" style={{ color: theme.textMuted }}>
            <li><strong>PO-LOG-001</strong> - Procedimento Operacional de Gestão de Transportes (procedimento pai)</li>
            <li><strong>IT-LOG-002</strong> - Tracking e Rastreamento (próximo passo após criar ordem)</li>
            <li><strong>IT-LOG-003</strong> - Gestão de Ocorrências (caso haja problemas)</li>
            <li><strong>FR-LOG-001</strong> - Formulário de OC (modelo de referência)</li>
            <li><strong>MAN-LOG-001</strong> - Manual do Sistema (guia completo)</li>
          </ul>
        </section>

        <div className="border-t pt-4 mt-8 text-xs text-center space-y-1" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>
          <p className="font-semibold">Documento controlado eletronicamente</p>
          <p>Versão impressa é cópia não controlada</p>
        </div>
      </CardContent>
    </Card>
  );
}

export function InstrucaoTrackingDetalhada({ theme, isDark }) {
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
                Tracking e Rastreamento de Cargas em Trânsito
              </h2>
            </div>
            <div className="text-right text-sm" style={{ color: theme.textMuted }}>
              <p className="font-bold">Código: IT-LOG-002</p>
              <p>Revisão: 01</p>
              <p>Data: 09/12/2024</p>
              <p>Páginas: 1/2</p>
            </div>
          </div>
          
          <div className="grid grid-cols-4 gap-3 text-sm mb-4">
            <div>
              <p className="font-semibold" style={{ color: theme.text }}>Elaborado:</p>
              <p style={{ color: theme.textMuted }}>Qualidade</p>
            </div>
            <div>
              <p className="font-semibold" style={{ color: theme.text }}>Aprovado:</p>
              <p style={{ color: theme.textMuted }}>Dir. Operações</p>
            </div>
            <div>
              <p className="font-semibold" style={{ color: theme.text }}>Processo:</p>
              <p style={{ color: theme.textMuted }}>PO-LOG-001</p>
            </div>
            <div>
              <p className="font-semibold" style={{ color: theme.text }}>Próxima Revisão:</p>
              <p style={{ color: theme.textMuted }}>09/12/2025</p>
            </div>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded p-2 text-xs">
            <p style={{ color: theme.textMuted }}>
              <strong>Referência:</strong> ISO 9001:2015 (8.2.1, 8.5.2, 9.1.1) | SASSMAQ v.7 (3.4, 4.1)
            </p>
          </div>
        </div>

        <section>
          <h3 className="text-lg font-bold mb-3" style={{ color: theme.text }}>1. OBJETIVO</h3>
          <p className="text-sm" style={{ color: theme.textMuted }}>
            Padronizar o monitoramento e atualização de status das cargas em trânsito, assegurando rastreabilidade 
            em tempo real, visibilidade para stakeholders, controle rigoroso de SLA e identificação proativa de desvios.
          </p>
        </section>

        <section>
          <h3 className="text-lg font-bold mb-3" style={{ color: theme.text }}>2. RESPONSABILIDADES</h3>
          <table className="w-full text-xs border" style={{ borderColor: theme.cardBorder }}>
            <thead style={{ backgroundColor: isDark ? '#0f172a' : '#f3f4f6' }}>
              <tr>
                <th className="border p-2 text-left" style={{ borderColor: theme.cardBorder, color: theme.text }}>Função</th>
                <th className="border p-2 text-left" style={{ borderColor: theme.cardBorder, color: theme.text }}>Responsabilidade</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border p-2 font-semibold" style={{ borderColor: theme.cardBorder, color: theme.text }}>Operador Logístico</td>
                <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>
                  Atualizar status de tracking conforme eventos ocorrem (tempo real)
                </td>
              </tr>
              <tr>
                <td className="border p-2 font-semibold" style={{ borderColor: theme.cardBorder, color: theme.text }}>Motorista</td>
                <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>
                  Informar status via App Motorista (carregado, em viagem, chegou destino, descarga)
                </td>
              </tr>
              <tr>
                <td className="border p-2 font-semibold" style={{ borderColor: theme.cardBorder, color: theme.text }}>Coordenador</td>
                <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>
                  Monitorar SLA, identificar atrasos, escalar ocorrências críticas
                </td>
              </tr>
            </tbody>
          </table>
        </section>

        <section>
          <h3 className="text-lg font-bold mb-3" style={{ color: theme.text }}>3. ACESSO AO MÓDULO TRACKING</h3>
          <ol className="text-sm space-y-2 ml-6 list-decimal" style={{ color: theme.textMuted }}>
            <li>
              <strong>Navegação:</strong> Menu → Operações → Tracking
            </li>
            <li>
              <strong>Visualizações disponíveis:</strong>
              <ul className="ml-6 list-disc mt-1 text-xs">
                <li>Tabela Completa (todos os campos)</li>
                <li>Modo Planilha (compacto, ideal para múltiplas ordens)</li>
              </ul>
            </li>
            <li>
              <strong>Filtros:</strong>
              <ul className="ml-6 list-disc mt-1 text-xs">
                <li>Por Status de Tracking (aguardando, em viagem, etc.)</li>
                <li>Por Operação</li>
                <li>Por Período (data inicial e final)</li>
                <li>Por Motorista</li>
                <li>Por Origem/Destino</li>
              </ul>
            </li>
            <li>
              <strong>Abas de Status:</strong> Clique nas abas superiores para filtrar por status (Ativas, Em Viagem, Finalizadas)
            </li>
          </ol>
        </section>

        <section>
          <h3 className="text-lg font-bold mb-3" style={{ color: theme.text }}>4. ATUALIZAÇÃO DE STATUS - PASSO A PASSO</h3>
          
          <div className="space-y-4">
            <div className="border-l-4 border-purple-600 pl-4 py-3" style={{ backgroundColor: isDark ? '#0f172a' : '#f9fafb' }}>
              <p className="font-bold text-sm mb-2" style={{ color: theme.text }}>Método 1: Via Modal de Atualização (RECOMENDADO)</p>
              <ol className="text-xs space-y-1 ml-4 list-decimal" style={{ color: theme.textMuted }}>
                <li>Na tabela de Tracking, localize a ordem desejada</li>
                <li>Clique no botão <strong>de atualização</strong> (ícone lápis/edição) na coluna Ações</li>
                <li>Modal "Atualizar Tracking" abre com dados da ordem</li>
                <li>No campo <strong>"Novo Status"</strong>, selecione o status atual da carga:
                  <ul className="ml-6 list-disc mt-1">
                    <li>Aguardando Agendamento</li>
                    <li>Carregamento Agendado</li>
                    <li>Em Carregamento</li>
                    <li>Carregado</li>
                    <li>Em Viagem</li>
                    <li>Chegada ao Destino</li>
                    <li>Descarga Agendada</li>
                    <li>Em Descarga</li>
                    <li>Descarga Realizada</li>
                    <li>Finalizado</li>
                  </ul>
                </li>
                <li>Preencha <strong>data e hora</strong> correspondente ao evento:
                  <ul className="ml-6 list-disc mt-1">
                    <li>Use seletor de data/hora (clique no campo)</li>
                    <li>OU clique no botão <strong>"Agora"</strong> para timestamp atual</li>
                    <li>Formato automático: dd/mm/aaaa HH:mm</li>
                  </ul>
                </li>
                <li>Adicione <strong>observações</strong> se necessário (opcional mas recomendado):
                  <ul className="ml-6 list-disc mt-1">
                    <li>Km percorrido</li>
                    <li>Condições da estrada</li>
                    <li>Problemas identificados</li>
                  </ul>
                </li>
                <li>Clique em <strong>"Salvar Atualização"</strong></li>
                <li>Sistema confirma e atualiza status na lista instantaneamente</li>
              </ol>
            </div>

            <div className="border-l-4 border-purple-600 pl-4 py-3" style={{ backgroundColor: isDark ? '#0f172a' : '#f9fafb' }}>
              <p className="font-bold text-sm mb-2" style={{ color: theme.text }}>Método 2: Via App Motorista (Automático)</p>
              <ol className="text-xs space-y-1 ml-4 list-decimal" style={{ color: theme.textMuted }}>
                <li>Motorista recebe SMS com link do App Motorista</li>
                <li>Motorista acessa sua viagem no app</li>
                <li>Motorista clica em botão de status (Carreguei, Saí, Cheguei, Descarreguei)</li>
                <li>App envia atualização para sistema automaticamente</li>
                <li>Operador vê atualização em tempo real no Tracking</li>
                <li><strong>Vantagem:</strong> Reduz carga do operador, aumenta precisão de horários</li>
              </ol>
            </div>
          </div>
        </section>

        <section>
          <h3 className="text-lg font-bold mb-3" style={{ color: theme.text }}>5. SEQUÊNCIA LÓGICA DE STATUS</h3>
          <div className="space-y-2 text-xs" style={{ color: theme.textMuted }}>
            <p className="font-semibold mb-2">Siga sempre esta ordem cronológica:</p>
            
            <div className="grid grid-cols-1 gap-1">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded bg-slate-500 text-white flex items-center justify-center font-bold text-[10px]">1</div>
                <div className="flex-1">
                  <p><strong>Aguardando Agendamento</strong></p>
                  <p className="text-[10px]">Ordem criada, aguardando definir data de carregamento</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded bg-blue-500 text-white flex items-center justify-center font-bold text-[10px]">2</div>
                <div className="flex-1">
                  <p><strong>Carregamento Agendado</strong></p>
                  <p className="text-[10px]">Data/hora de carregamento definida | <strong>Campo:</strong> carregamento_agendamento_data</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded bg-indigo-500 text-white flex items-center justify-center font-bold text-[10px]">3</div>
                <div className="flex-1">
                  <p><strong>Em Carregamento</strong></p>
                  <p className="text-[10px]">Carregamento iniciado | <strong>Campo:</strong> inicio_carregamento | <strong>Inicia contagem SLA</strong></p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded bg-purple-500 text-white flex items-center justify-center font-bold text-[10px]">4</div>
                <div className="flex-1">
                  <p><strong>Carregado</strong></p>
                  <p className="text-[10px]">Carregamento concluído | <strong>Campo:</strong> fim_carregamento | <strong>Fim contagem SLA carreg.</strong></p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded bg-cyan-500 text-white flex items-center justify-center font-bold text-[10px]">5</div>
                <div className="flex-1">
                  <p><strong>Em Viagem</strong></p>
                  <p className="text-[10px]">Veículo em trânsito | <strong>Campo:</strong> saida_unidade | Rastreamento GPS ativo</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded bg-teal-500 text-white flex items-center justify-center font-bold text-[10px]">6</div>
                <div className="flex-1">
                  <p><strong>Chegada ao Destino</strong></p>
                  <p className="text-[10px]">Chegou ao local de descarga | <strong>Campo:</strong> chegada_destino</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded bg-amber-500 text-white flex items-center justify-center font-bold text-[10px]">7</div>
                <div className="flex-1">
                  <p><strong>Descarga Agendada</strong></p>
                  <p className="text-[10px]">Horário de descarga confirmado | <strong>Campo:</strong> descarga_agendamento_data</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded bg-orange-500 text-white flex items-center justify-center font-bold text-[10px]">8</div>
                <div className="flex-1">
                  <p><strong>Em Descarga</strong></p>
                  <p className="text-[10px]">Descarga iniciada | <strong>Campo:</strong> inicio_descarregamento | <strong>Inicia contagem SLA desc.</strong></p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded bg-green-500 text-white flex items-center justify-center font-bold text-[10px]">9</div>
                <div className="flex-1">
                  <p><strong>Descarga Realizada</strong></p>
                  <p className="text-[10px]">Descarga concluída | <strong>Campo:</strong> fim_descarregamento | <strong>Fim contagem SLA desc.</strong></p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded bg-gray-600 text-white flex items-center justify-center font-bold text-[10px]">10</div>
                <div className="flex-1">
                  <p><strong>Finalizado</strong></p>
                  <p className="text-[10px]">Processo completo, comprovante anexado, financeiro OK</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section>
          <h3 className="text-lg font-bold mb-3" style={{ color: theme.text }}>6. CONTROLE DE SLA - REGRAS CRÍTICAS</h3>
          <div className="space-y-3 text-sm" style={{ color: theme.textMuted }}>
            <div className="border border-blue-300 dark:border-blue-700 rounded p-3" style={{ backgroundColor: isDark ? 'rgba(59, 130, 246, 0.1)' : '#eff6ff' }}>
              <p className="font-bold text-xs mb-2 text-blue-600">SLA DE CARREGAMENTO:</p>
              <ol className="ml-4 list-decimal text-xs space-y-1">
                <li><strong>Início:</strong> Data de agendamento de carregamento (carregamento_agendamento_data)</li>
                <li><strong>Tolerância:</strong> Horas configuradas na Operação (ex: 24h, 48h)</li>
                <li><strong>Cálculo:</strong> Data Agend. + Tolerância = Prazo Limite</li>
                <li><strong>No Prazo:</strong> fim_carregamento ≤ Prazo Limite</li>
                <li><strong>Fora do Prazo:</strong> Sistema gera ocorrência de diária automaticamente</li>
                <li><strong>Expurgo:</strong> Atrasos justificados podem ser expurgados (motivo + evidência)</li>
              </ol>
            </div>

            <div className="border border-green-300 dark:border-green-700 rounded p-3" style={{ backgroundColor: isDark ? 'rgba(34, 197, 94, 0.1)' : '#dcfce7' }}>
              <p className="font-bold text-xs mb-2 text-green-600">SLA DE DESCARGA:</p>
              <ol className="ml-4 list-decimal text-xs space-y-1">
                <li><strong>Método A:</strong> Carregamento Agend. + Prazo Dias da Operação (flag desativada)</li>
                <li><strong>Método B:</strong> Data de Agenda de Descarga (flag ativada na operação)</li>
                <li><strong>Tolerância:</strong> Configurada na Operação</li>
                <li><strong>No Prazo:</strong> fim_descarregamento ≤ Prazo Limite + Tolerância</li>
                <li><strong>Fora do Prazo:</strong> Sistema gera ocorrência de diária automaticamente</li>
                <li><strong>Expurgo:</strong> Possível com justificativa + evidência + aprovação</li>
              </ol>
            </div>
          </div>
        </section>

        <section>
          <h3 className="text-lg font-bold mb-3" style={{ color: theme.text }}>7. REGISTRO DE OCORRÊNCIAS VIA TRACKING</h3>
          <div className="text-sm space-y-2" style={{ color: theme.textMuted }}>
            <p>Quando identificar QUALQUER problema durante monitoramento:</p>
            <ol className="ml-6 list-decimal space-y-1 text-xs">
              <li>Na tela de Tracking, localize a ordem com problema</li>
              <li>Clique no botão <strong>"Ocorrência"</strong> (ícone de alerta)</li>
              <li>Sistema abre modal de registro de ocorrência</li>
              <li>Ordem já vem pré-selecionada</li>
              <li>Selecione <strong>Tipo de Ocorrência</strong> (ex: Atraso, Quebra Veículo, Bloqueio)</li>
              <li>Categoria: selecione <strong>"Tracking"</strong> (afeta SLA)</li>
              <li>Gravidade: Baixa/Média/Alta/Crítica (conforme impacto)</li>
              <li>Descrição: detalhe o problema (O QUE, ONDE, QUANDO aconteceu)</li>
              <li>Data/Hora Início: quando o problema começou</li>
              <li>Anexe fotos/documentos se disponível</li>
              <li>Clique em <strong>"Registrar Ocorrência"</strong></li>
              <li>Sistema: gera ticket, notifica responsável, aparece em Qualidade → Ocorrências</li>
            </ol>

            <p className="mt-3"><strong>→ Continuar tratamento conforme IT-LOG-003</strong></p>
          </div>
        </section>

        <section>
          <h3 className="text-lg font-bold mb-3" style={{ color: theme.text }}>8. COMUNICAÇÃO COM MOTORISTA</h3>
          <ol className="text-sm space-y-2 ml-6 list-decimal" style={{ color: theme.textMuted }}>
            <li>Na tabela, clique no ícone de <strong>chat</strong> (balão de mensagem)</li>
            <li>Abre chat direto com motorista via WhatsApp/SMS</li>
            <li>Digite mensagem (ex: "Confirme chegada ao destino")</li>
            <li>Motorista recebe notificação no celular</li>
            <li>Histórico de mensagens fica registrado na ordem</li>
          </ol>
        </section>

        <section>
          <h3 className="text-lg font-bold mb-3" style={{ color: theme.text }}>9. UPLOAD DE DOCUMENTOS</h3>
          <ol className="text-sm space-y-2 ml-6 list-decimal" style={{ color: theme.textMuted }}>
            <li>Na coluna Ações, clique no ícone de <strong>anexo</strong></li>
            <li>Selecione tipo de documento: CT-e, MDF-e, Comprovante Entrega, etc.</li>
            <li>Clique em "Escolher Arquivo" ou arraste arquivo</li>
            <li>Formatos aceitos: PDF, JPG, PNG (máx 10MB)</li>
            <li>Clique em "Upload"</li>
            <li>Documento fica vinculado à ordem (download disponível)</li>
          </ol>
        </section>

        <section>
          <h3 className="text-lg font-bold mb-3" style={{ color: theme.text }}>10. PROCEDIMENTO DE EXPURGO</h3>
          <div className="text-sm space-y-2" style={{ color: theme.textMuted }}>
            <p><strong>Quando usar:</strong> Atraso foi causado por motivo externo justificável (não é culpa da transportadora)</p>
            
            <p className="font-semibold mt-3">Passo a passo:</p>
            <ol className="ml-6 list-decimal space-y-1 text-xs">
              <li>Na tabela, identifique ordem com atraso (indicador vermelho no SLA)</li>
              <li>Clique no botão <strong>"Expurgo"</strong></li>
              <li>Selecione tipo: <strong>Carregamento</strong> ou <strong>Descarga</strong></li>
              <li>Preencha <strong>motivo detalhado</strong>:
                <ul className="ml-6 list-disc mt-1">
                  <li>Exemplo: "Solicitação do cliente para atrasar carregamento em 2 dias"</li>
                  <li>Exemplo: "Bloqueio de rodovia pela PRF por 8 horas"</li>
                </ul>
              </li>
              <li>Anexe <strong>evidência</strong>:
                <ul className="ml-6 list-disc mt-1">
                  <li>Email do cliente autorizando</li>
                  <li>Foto do bloqueio</li>
                  <li>Boletim de ocorrência</li>
                </ul>
              </li>
              <li>Clique em <strong>"Confirmar Expurgo"</strong></li>
              <li>Sistema marca como expurgado (não conta no cálculo de SLA)</li>
            </ol>

            <div className="bg-red-50 dark:bg-red-900/20 border border-red-300 dark:border-red-700 rounded p-2 mt-3">
              <p className="font-semibold text-xs">⚠️ IMPORTANTE:</p>
              <p className="text-xs">
                Expurgo DEVE ter evidência. Auditorias verificam se expurgos são justificados. Uso indevido 
                compromete certificações (ISO 9001, SASSMAQ).
              </p>
            </div>
          </div>
        </section>

        <section>
          <h3 className="text-lg font-bold mb-3" style={{ color: theme.text }}>11. KPIs MONITORADOS</h3>
          <div className="grid grid-cols-2 gap-3">
            <Card style={{ backgroundColor: isDark ? '#0f172a' : '#f9fafb', borderColor: theme.cardBorder }}>
              <CardContent className="p-3 text-center">
                <p className="text-2xl font-bold text-green-600">≥ 95%</p>
                <p className="text-xs font-semibold mt-1" style={{ color: theme.text }}>SLA Carregamento</p>
                <p className="text-[10px] mt-1" style={{ color: theme.textMuted }}>Meta crítica</p>
              </CardContent>
            </Card>
            <Card style={{ backgroundColor: isDark ? '#0f172a' : '#f9fafb', borderColor: theme.cardBorder }}>
              <CardContent className="p-3 text-center">
                <p className="text-2xl font-bold text-green-600">≥ 95%</p>
                <p className="text-xs font-semibold mt-1" style={{ color: theme.text }}>SLA Descarga</p>
                <p className="text-[10px] mt-1" style={{ color: theme.textMuted }}>Meta crítica</p>
              </CardContent>
            </Card>
          </div>
        </section>

        <section>
          <h3 className="text-lg font-bold mb-3" style={{ color: theme.text }}>12. DOCUMENTOS RELACIONADOS</h3>
          <ul className="list-disc list-inside text-sm space-y-1 ml-4" style={{ color: theme.textMuted }}>
            <li><strong>PO-LOG-001</strong> - Procedimento de Gestão de Transportes</li>
            <li><strong>IT-LOG-001</strong> - Criação de Ordens (passo anterior)</li>
            <li><strong>IT-LOG-003</strong> - Gestão de Ocorrências (em caso de problemas)</li>
            <li><strong>MAN-LOG-001</strong> - Manual do Sistema</li>
          </ul>
        </section>

        <div className="border-t pt-4 mt-8 text-xs text-center space-y-1" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>
          <p className="font-semibold">Documento controlado eletronicamente</p>
          <p>Versão impressa é cópia não controlada</p>
        </div>
      </CardContent>
    </Card>
  );
}