import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Package, FileText, Tag, Ruler, Truck, CheckCircle } from "lucide-react";

export function ProcedimentoModuloArmazem({ theme, isDark }) {
  return (
    <Card style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}>
      <CardContent className="p-8 space-y-6">
        {/* Cabeçalho do Documento */}
        <div className="border-b pb-6" style={{ borderColor: theme.cardBorder }}>
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h1 className="text-2xl font-bold mb-2" style={{ color: theme.text }}>
                PROCEDIMENTO OPERACIONAL
              </h1>
              <h2 className="text-xl font-semibold mb-1" style={{ color: theme.text }}>
                Gestão de Armazém e Movimentação de Cargas
              </h2>
            </div>
            <div className="text-right text-sm" style={{ color: theme.textMuted }}>
              <p className="font-bold">Código: PO-LOG-002</p>
              <p>Revisão: 01</p>
              <p>Data: 27/01/2026</p>
              <p>Páginas: 1/4</p>
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
              <p style={{ color: theme.textMuted }}>Armazém e Expedição</p>
            </div>
          </div>

          <div className="border rounded p-3 text-xs mt-4" style={{ borderColor: theme.cardBorder, backgroundColor: theme.headerBg }}>
            <p className="font-semibold mb-1" style={{ color: theme.text }}>Conformidade Normativa:</p>
            <p style={{ color: theme.textMuted }}>
              • NBR ISO 9001:2015 (itens 8.5 - Produção e provisão de serviço)<br/>
              • SASSMAQ v.7 (elementos 3.1, 3.2, 3.3 - Planejamento e Execução)<br/>
              • Resolução ANTT nº 5.867/2019 - RNTRC
            </p>
          </div>
        </div>

        {/* 1. Objetivo */}
        <section>
          <h3 className="text-lg font-bold mb-3 flex items-center gap-2" style={{ color: theme.text }}>
            <span className="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">1</span>
            OBJETIVO E ESCOPO
          </h3>
          <div className="text-sm leading-relaxed space-y-2" style={{ color: theme.textMuted }}>
            <p>
              <strong>1.1 Objetivo:</strong> Estabelecer os critérios e procedimentos para gestão completa do armazém, 
              desde o recebimento de mercadorias até a expedição e entrega, garantindo:
            </p>
            <ul className="list-disc ml-8 space-y-1">
              <li>Rastreabilidade total de volumes (NBR ISO 9001:2015, item 8.5.2)</li>
              <li>Acuracidade de inventário ≥ 98%</li>
              <li>Conformidade com documentação fiscal (SEFAZ)</li>
              <li>Organização eficiente do espaço físico</li>
              <li>Agilidade na separação e expedição</li>
            </ul>
            <p className="mt-3">
              <strong>1.2 Escopo:</strong> Este procedimento abrange as seguintes operações:
            </p>
            <ul className="list-disc ml-8 space-y-1">
              <li><strong>Recebimento:</strong> Entrada de mercadorias com NF-e</li>
              <li><strong>Gestão de Notas Fiscais:</strong> Controle documental e vencimentos</li>
              <li><strong>Gestão de CT-e:</strong> Conhecimentos de transporte eletrônicos</li>
              <li><strong>Etiquetas Mãe:</strong> Unitização de volumes para otimizar expedição</li>
              <li><strong>Cubagem:</strong> Medição de dimensões e peso</li>
              <li><strong>Carregamento:</strong> Conferência e endereçamento no veículo</li>
              <li><strong>Ordem de Entrega:</strong> Roteirização e gestão de entregas fracionadas</li>
            </ul>
          </div>
        </section>

        {/* 2. Aplicação */}
        <section>
          <h3 className="text-lg font-bold mb-3 flex items-center gap-2" style={{ color: theme.text }}>
            <span className="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">2</span>
            APLICAÇÃO
          </h3>
          <p className="text-sm leading-relaxed mb-2" style={{ color: theme.textMuted }}>
            Este procedimento aplica-se a:
          </p>
          <ul className="list-disc list-inside text-sm space-y-1 ml-4" style={{ color: theme.textMuted }}>
            <li>Conferentes de armazém</li>
            <li>Operadores de expedição</li>
            <li>Coordenadores de logística</li>
            <li>Gestores de armazém</li>
            <li>Equipe de conferência e carga</li>
          </ul>
        </section>

        {/* 3. Responsabilidades */}
        <section>
          <h3 className="text-lg font-bold mb-3 flex items-center gap-2" style={{ color: theme.text }}>
            <span className="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">3</span>
            RESPONSABILIDADES (RACI)
          </h3>
          <table className="w-full text-xs border" style={{ borderColor: theme.cardBorder }}>
            <thead style={{ backgroundColor: isDark ? '#0f172a' : '#f3f4f6' }}>
              <tr>
                <th className="border p-2 text-left" style={{ borderColor: theme.cardBorder, color: theme.text }}>Atividade</th>
                <th className="border p-2 w-24" style={{ borderColor: theme.cardBorder, color: theme.text }}>Responsável (R)</th>
                <th className="border p-2 w-24" style={{ borderColor: theme.cardBorder, color: theme.text }}>Aprovador (A)</th>
                <th className="border p-2 w-24" style={{ borderColor: theme.cardBorder, color: theme.text }}>Consultado (C)</th>
                <th className="border p-2 w-24" style={{ borderColor: theme.cardBorder, color: theme.text }}>Informado (I)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>Recebimento de NF-e</td>
                <td className="border p-2 text-center font-bold" style={{ borderColor: theme.cardBorder, color: theme.text }}>Conferente</td>
                <td className="border p-2 text-center" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>Coord. Armazém</td>
                <td className="border p-2 text-center" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>-</td>
                <td className="border p-2 text-center" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>Operador</td>
              </tr>
              <tr>
                <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>Conferência de volumes</td>
                <td className="border p-2 text-center font-bold" style={{ borderColor: theme.cardBorder, color: theme.text }}>Conferente</td>
                <td className="border p-2 text-center" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>-</td>
                <td className="border p-2 text-center" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>-</td>
                <td className="border p-2 text-center" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>Coord. Armazém</td>
              </tr>
              <tr>
                <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>Unitização (Etiqueta Mãe)</td>
                <td className="border p-2 text-center font-bold" style={{ borderColor: theme.cardBorder, color: theme.text }}>Operador Exp.</td>
                <td className="border p-2 text-center" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>-</td>
                <td className="border p-2 text-center" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>Coord. Armazém</td>
                <td className="border p-2 text-center" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>Motorista</td>
              </tr>
              <tr>
                <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>Carregamento/Endereçamento</td>
                <td className="border p-2 text-center font-bold" style={{ borderColor: theme.cardBorder, color: theme.text }}>Operador Exp.</td>
                <td className="border p-2 text-center" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>Coord. Expedição</td>
                <td className="border p-2 text-center" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>-</td>
                <td className="border p-2 text-center" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>Motorista</td>
              </tr>
              <tr>
                <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>Ordem de Entrega</td>
                <td className="border p-2 text-center font-bold" style={{ borderColor: theme.cardBorder, color: theme.text }}>Coord. Entrega</td>
                <td className="border p-2 text-center" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>-</td>
                <td className="border p-2 text-center" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>Cliente</td>
                <td className="border p-2 text-center" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>Motorista</td>
              </tr>
            </tbody>
          </table>
        </section>

        {/* 4. Macroprocesso */}
        <section className="print-page-break">
          <h3 className="text-lg font-bold mb-3 flex items-center gap-2" style={{ color: theme.text }}>
            <span className="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">4</span>
            MACROPROCESSO DE ARMAZÉM
          </h3>
          
          <div className="space-y-4">
            {/* Fase 1: Recebimento */}
            <Card style={{ backgroundColor: isDark ? '#0f172a' : '#f9fafb', borderColor: '#10b981', borderWidth: '2px' }}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Package className="w-7 h-7 text-white" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-base mb-2" style={{ color: theme.text }}>
                      FASE 1: RECEBIMENTO DE MERCADORIAS
                    </h4>
                    <div className="text-xs space-y-2" style={{ color: theme.textMuted }}>
                      <p><strong>Entrada:</strong> Caminhão com mercadorias + NF-e (XML ou chave)</p>
                      <p><strong>Processo:</strong></p>
                      <ol className="list-decimal ml-6 space-y-1">
                        <li>Importar NF-e via scanner, chave ou upload de XML</li>
                        <li>Sistema cria automaticamente volumes baseado na NF</li>
                        <li>Conferir fisicamente os volumes recebidos</li>
                        <li>Registrar divergências (falta, sobra, avaria)</li>
                        <li>Imprimir etiquetas de identificação dos volumes</li>
                        <li>Definir número da área de armazenagem</li>
                      </ol>
                      <p><strong>Saída:</strong> Volumes etiquetados e armazenados</p>
                      <p className="font-bold text-blue-600">
                        👉 Instrução: IT-ARM-001 - Recebimento
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Fase 2: Gestão Documental */}
            <Card style={{ backgroundColor: isDark ? '#0f172a' : '#f9fafb', borderColor: '#3b82f6', borderWidth: '2px' }}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FileText className="w-7 h-7 text-white" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-base mb-2" style={{ color: theme.text }}>
                      FASE 2: GESTÃO DOCUMENTAL
                    </h4>
                    <div className="text-xs space-y-2" style={{ color: theme.textMuted }}>
                      <p><strong>Processo:</strong></p>
                      <ol className="list-decimal ml-6 space-y-1">
                        <li>Controlar vencimentos de NF-e (prazo padrão: 20 dias após emissão)</li>
                        <li>Gerenciar status das notas (recebida, aguardando expedição, em rota, entregue)</li>
                        <li>Processar e armazenar CT-e (Conhecimentos de Transporte)</li>
                        <li>Vincular documentos às ordens de carregamento</li>
                        <li>Gerar arquivo TXT com chaves para validação fiscal</li>
                        <li>Manter histórico de alterações de peso/volumes</li>
                      </ol>
                      <p className="font-bold text-blue-600">
                        👉 Instruções: IT-ARM-002 (Gestão de NF-e) | IT-ARM-003 (Gestão de CT-e)
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Fase 3: Preparação para Expedição */}
            <Card style={{ backgroundColor: isDark ? '#0f172a' : '#f9fafb', borderColor: '#8b5cf6', borderWidth: '2px' }}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Tag className="w-7 h-7 text-white" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-base mb-2" style={{ color: theme.text }}>
                      FASE 3: PREPARAÇÃO PARA EXPEDIÇÃO
                    </h4>
                    <div className="text-xs space-y-2" style={{ color: theme.textMuted }}>
                      <p><strong>3A. Etiquetas Mãe (Unitização):</strong></p>
                      <ol className="list-decimal ml-6 space-y-1">
                        <li>Criar etiqueta mãe com código único (formato: AAAAMMDDHHNN)</li>
                        <li>Bipar volumes individuais ou chaves de NF-e completas</li>
                        <li>Agrupar volumes de mesma rota/cliente</li>
                        <li>Finalizar unitização e imprimir etiqueta consolidada</li>
                      </ol>
                      <p className="mt-2"><strong>3B. Cubagem (Opcional):</strong></p>
                      <ol className="list-decimal ml-6 space-y-1">
                        <li>Fotografar volume na balança/régua de cubagem</li>
                        <li>Sistema detecta automaticamente dimensões e peso</li>
                        <li>Atualizar registro do volume com medidas precisas</li>
                      </ol>
                      <p className="font-bold text-blue-600 mt-2">
                        👉 Instruções: IT-ARM-004 (Etiqueta Mãe) | IT-ARM-007 (Cubagem - opcional)
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Fase 4: Carregamento */}
            <Card style={{ backgroundColor: isDark ? '#0f172a' : '#f9fafb', borderColor: '#f59e0b', borderWidth: '2px' }}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 bg-orange-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Truck className="w-7 h-7 text-white" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-base mb-2" style={{ color: theme.text }}>
                      FASE 4: CARREGAMENTO E EXPEDIÇÃO
                    </h4>
                    <div className="text-xs space-y-2" style={{ color: theme.textMuted }}>
                      <p><strong>4A. Conferência de Volumes:</strong></p>
                      <ol className="list-decimal ml-6 space-y-1">
                        <li>Vincular notas fiscais à ordem de carregamento</li>
                        <li>Bipar volumes individualmente para conferência</li>
                        <li>Sistema valida: volume existe, nota vinculada, não duplicado</li>
                        <li>Ao concluir, todos volumes da ordem devem estar bipados</li>
                      </ol>
                      <p className="mt-2"><strong>4B. Endereçamento no Veículo:</strong></p>
                      <ol className="list-decimal ml-6 space-y-1">
                        <li>Selecionar tipo de veículo (CARRETA, TRUCK, BITREM, etc.)</li>
                        <li>Definir layout (linhas e colunas do caminhão)</li>
                        <li>Alocar volumes por célula (ex: A1, B2, C3)</li>
                        <li>Sistema gera mapa visual do carregamento</li>
                        <li>Imprimir layout para motorista</li>
                        <li>Registrar horário início/fim do carregamento</li>
                      </ol>
                      <p><strong>Saída:</strong> Veículo carregado, documentado e liberado para viagem</p>
                      <p className="font-bold text-blue-600 mt-2">
                        👉 Instrução: IT-ARM-005 - Carregamento (Conferência e Endereçamento)
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Fase 5: Ordem de Entrega */}
            <Card style={{ backgroundColor: isDark ? '#0f172a' : '#f9fafb', borderColor: '#06b6d4', borderWidth: '2px' }}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 bg-cyan-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-7 h-7 text-white" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-base mb-2" style={{ color: theme.text }}>
                      FASE 5: ORDEM DE ENTREGA (LAST MILE)
                    </h4>
                    <div className="text-xs space-y-2" style={{ color: theme.textMuted }}>
                      <p><strong>Processo:</strong></p>
                      <ol className="list-decimal ml-6 space-y-1">
                        <li>Selecionar notas fiscais para roteirização</li>
                        <li>Sistema agrupa por região/rota</li>
                        <li>Conferir volumes a serem entregues</li>
                        <li>Alocar motorista e veículo</li>
                        <li>Gerar romaneio de entrega</li>
                        <li>Acompanhar entregas via app motorista</li>
                        <li>Coletar comprovantes de entrega (foto + assinatura)</li>
                      </ol>
                      <p><strong>Saída:</strong> Entregas realizadas com comprovação</p>
                      <p className="font-bold text-blue-600 mt-2">
                        👉 Instrução: IT-ARM-006 - Ordem de Entrega
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* 5. Fluxo Geral */}
        <section>
          <h3 className="text-lg font-bold mb-3 flex items-center gap-2" style={{ color: theme.text }}>
            <span className="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">5</span>
            FLUXO GERAL SIMPLIFICADO
          </h3>
          <div className="flex items-center gap-2 text-sm flex-wrap" style={{ color: theme.textMuted }}>
            <div className="px-3 py-1.5 bg-green-600 text-white rounded font-bold">1. Receber NF-e</div>
            <span>→</span>
            <div className="px-3 py-1.5 bg-blue-600 text-white rounded font-bold">2. Conferir</div>
            <span>→</span>
            <div className="px-3 py-1.5 bg-purple-600 text-white rounded font-bold">3. Unitizar</div>
            <span>→</span>
            <div className="px-3 py-1.5 bg-orange-600 text-white rounded font-bold">4. Carregar</div>
            <span>→</span>
            <div className="px-3 py-1.5 bg-cyan-600 text-white rounded font-bold">5. Entregar</div>
          </div>
          <p className="text-xs mt-3 italic" style={{ color: theme.textMuted }}>
            * Nem todas as fases são obrigatórias. Por exemplo: carregamento direto pode pular a unitização.
          </p>
        </section>

        {/* 6. Indicadores */}
        <section>
          <h3 className="text-lg font-bold mb-3 flex items-center gap-2" style={{ color: theme.text }}>
            <span className="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">6</span>
            INDICADORES DE DESEMPENHO DO ARMAZÉM
          </h3>
          <div className="grid grid-cols-3 gap-3">
            <Card style={{ backgroundColor: isDark ? '#0f172a' : '#ffffff', borderColor: theme.cardBorder }}>
              <CardContent className="p-3 text-center">
                <p className="text-xs font-semibold mb-1" style={{ color: theme.text }}>Acuracidade de Inventário</p>
                <p className="text-xs" style={{ color: theme.textMuted }}>
                  (Volumes corretos / Total volumes) × 100
                </p>
                <p className="text-xs font-bold text-green-600 mt-1">Meta: ≥ 98%</p>
              </CardContent>
            </Card>
            <Card style={{ backgroundColor: isDark ? '#0f172a' : '#ffffff', borderColor: theme.cardBorder }}>
              <CardContent className="p-3 text-center">
                <p className="text-xs font-semibold mb-1" style={{ color: theme.text }}>Tempo Médio de Carregamento</p>
                <p className="text-xs" style={{ color: theme.textMuted }}>
                  Média (fim_carregamento - inicio_carregamento)
                </p>
                <p className="text-xs font-bold text-green-600 mt-1">Meta: ≤ 2h</p>
              </CardContent>
            </Card>
            <Card style={{ backgroundColor: isDark ? '#0f172a' : '#ffffff', borderColor: theme.cardBorder }}>
              <CardContent className="p-3 text-center">
                <p className="text-xs font-semibold mb-1" style={{ color: theme.text }}>Taxa de Entrega no 1º Tentativa</p>
                <p className="text-xs" style={{ color: theme.textMuted }}>
                  (Entregas OK / Total entregas) × 100
                </p>
                <p className="text-xs font-bold text-green-600 mt-1">Meta: ≥ 95%</p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* 7. Tecnologia e Equipamentos */}
        <section>
          <h3 className="text-lg font-bold mb-3 flex items-center gap-2" style={{ color: theme.text }}>
            <span className="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">7</span>
            TECNOLOGIA E EQUIPAMENTOS
          </h3>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <Card style={{ backgroundColor: isDark ? '#0f172a' : '#ffffff', borderColor: theme.cardBorder }}>
              <CardContent className="p-3">
                <p className="font-semibold mb-2" style={{ color: theme.text }}>Equipamentos Necessários:</p>
                <ul className="space-y-1 list-disc ml-4" style={{ color: theme.textMuted }}>
                  <li>Scanner de códigos de barras (QR/Barras)</li>
                  <li>Balança digital (para conferência de peso)</li>
                  <li>Impressora térmica (etiquetas 10x15cm)</li>
                  <li>Impressora A4 (romaneios e relatórios)</li>
                  <li>Tablets/Smartphones (câmera para cubagem)</li>
                  <li>Computadores (estações de trabalho)</li>
                </ul>
              </CardContent>
            </Card>
            <Card style={{ backgroundColor: isDark ? '#0f172a' : '#ffffff', borderColor: theme.cardBorder }}>
              <CardContent className="p-3">
                <p className="font-semibold mb-2" style={{ color: theme.text }}>Funcionalidades do Sistema:</p>
                <ul className="space-y-1 list-disc ml-4" style={{ color: theme.textMuted }}>
                  <li>Scanner de câmera integrado (QR Code)</li>
                  <li>Detecção automática de dimensões (cubagem)</li>
                  <li>Geração de QR Code para rastreio</li>
                  <li>Sincronização em tempo real</li>
                  <li>Modo offline com sincronização posterior</li>
                  <li>Feedback sonoro/visual para bipagens</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* 8. Controles de Qualidade */}
        <section>
          <h3 className="text-lg font-bold mb-3 flex items-center gap-2" style={{ color: theme.text }}>
            <span className="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">8</span>
            CONTROLES DE QUALIDADE
          </h3>
          <div className="space-y-2 text-sm" style={{ color: theme.textMuted }}>
            <p><strong>8.1 Verificações Obrigatórias:</strong></p>
            <ul className="list-disc ml-6 space-y-1">
              <li>Conferência de peso: comparar XML vs balança (tolerância ≤ 3%)</li>
              <li>Conferência de volumes: quantidade declarada vs recebida</li>
              <li>Integridade da embalagem: registrar avarias</li>
              <li>Validade de NF-e: alertar vencimentos próximos</li>
              <li>Divergências documentais: registrar ocorrência</li>
            </ul>
            
            <p className="mt-3"><strong>8.2 Carta de Correção:</strong></p>
            <p className="ml-4">
              Quando houver alteração de peso ou quantidade de volumes após o recebimento, 
              é obrigatório anexar Carta de Correção (CC-e) ou autorização do remetente.
            </p>
          </div>
        </section>

        {/* 9. Segurança */}
        <section>
          <h3 className="text-lg font-bold mb-3 flex items-center gap-2" style={{ color: theme.text }}>
            <span className="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">9</span>
            SEGURANÇA E MEIO AMBIENTE (SASSMAQ)
          </h3>
          <div className="space-y-2 text-sm" style={{ color: theme.textMuted }}>
            <p><strong>9.1 EPIs Obrigatórios:</strong></p>
            <ul className="list-disc ml-6 space-y-1">
              <li>Calçado de segurança com biqueira de aço</li>
              <li>Colete refletivo</li>
              <li>Luvas (quando manusear volumes pesados)</li>
            </ul>
            
            <p className="mt-3"><strong>9.2 Procedimentos de Segurança:</strong></p>
            <ul className="list-disc ml-6 space-y-1">
              <li>Não operar scanner/câmera ao dirigir empilhadeira</li>
              <li>Respeitar limite de peso por pilha/estrutura</li>
              <li>Sinalizar áreas de movimentação de carga</li>
              <li>Descartar embalagens conforme Plano de Gerenciamento de Resíduos</li>
            </ul>
          </div>
        </section>

        {/* 10. Rastreabilidade */}
        <section>
          <h3 className="text-lg font-bold mb-3 flex items-center gap-2" style={{ color: theme.text }}>
            <span className="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">10</span>
            RASTREABILIDADE (ISO 9001 - 8.5.2)
          </h3>
          <p className="text-sm mb-3" style={{ color: theme.textMuted }}>
            O sistema garante rastreabilidade total através de:
          </p>
          <ul className="list-disc list-inside text-sm space-y-1 ml-4" style={{ color: theme.textMuted }}>
            <li><strong>Identificador Único por Volume:</strong> Formato NF-SEQ (ex: 12345-01)</li>
            <li><strong>Timestamps:</strong> Registro automático de todas as movimentações</li>
            <li><strong>Usuário Responsável:</strong> Cada ação vincula o operador que executou</li>
            <li><strong>Histórico de Alterações:</strong> Qualquer mudança em peso/volumes é registrada</li>
            <li><strong>Localização:</strong> Área de armazenagem → Endereço no veículo → Destino final</li>
            <li><strong>Documentos Vinculados:</strong> NF-e, CT-e, Comprovante de Entrega</li>
          </ul>
        </section>

        {/* 11. Documentos Relacionados */}
        <section>
          <h3 className="text-lg font-bold mb-3 flex items-center gap-2" style={{ color: theme.text }}>
            <span className="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">11</span>
            DOCUMENTOS RELACIONADOS
          </h3>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <p className="font-semibold mb-1" style={{ color: theme.text }}>Instruções de Trabalho:</p>
              <ul className="list-disc list-inside ml-4 space-y-1" style={{ color: theme.textMuted }}>
                <li><strong>IT-ARM-001</strong> - Recebimento de Mercadorias</li>
                <li><strong>IT-ARM-002</strong> - Gestão de Notas Fiscais</li>
                <li><strong>IT-ARM-003</strong> - Gestão de CT-e</li>
                <li><strong>IT-ARM-004</strong> - Etiquetas Mãe (Unitização)</li>
                <li><strong>IT-ARM-005</strong> - Carregamento e Endereçamento</li>
                <li><strong>IT-ARM-006</strong> - Ordem de Entrega</li>
              </ul>
            </div>
            <div>
              <p className="font-semibold mb-1" style={{ color: theme.text }}>Outros Documentos:</p>
              <ul className="list-disc list-inside ml-4 space-y-1" style={{ color: theme.textMuted }}>
                <li><strong>PO-LOG-001</strong> - Gestão de Transportes</li>
                <li><strong>IT-LOG-002</strong> - Tracking Logístico</li>
                <li><strong>IT-LOG-003</strong> - Gestão de Ocorrências</li>
                <li><strong>MAN-LOG-001</strong> - Manual do Sistema</li>
              </ul>
            </div>
          </div>
        </section>

        {/* 12. Histórico de Revisões */}
        <section>
          <h3 className="text-lg font-bold mb-3 flex items-center gap-2" style={{ color: theme.text }}>
            <span className="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">12</span>
            HISTÓRICO DE REVISÕES
          </h3>
          <table className="w-full text-xs border" style={{ borderColor: theme.cardBorder }}>
            <thead style={{ backgroundColor: isDark ? '#0f172a' : '#f3f4f6' }}>
              <tr>
                <th className="border p-2 w-16" style={{ borderColor: theme.cardBorder, color: theme.text }}>Rev.</th>
                <th className="border p-2 w-24" style={{ borderColor: theme.cardBorder, color: theme.text }}>Data</th>
                <th className="border p-2 text-left" style={{ borderColor: theme.cardBorder, color: theme.text }}>Descrição da Alteração</th>
                <th className="border p-2 w-32" style={{ borderColor: theme.cardBorder, color: theme.text }}>Aprovado por</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border p-2 text-center font-bold" style={{ borderColor: theme.cardBorder, color: theme.text }}>01</td>
                <td className="border p-2 text-center" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>27/01/2026</td>
                <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>
                  Emissão inicial do procedimento de armazém
                </td>
                <td className="border p-2 text-center" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>Diretor de Operações</td>
              </tr>
            </tbody>
          </table>
        </section>

        {/* Rodapé */}
        <div className="border-t pt-4 mt-8 text-xs text-center space-y-1" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>
          <p className="font-semibold">Documento controlado eletronicamente</p>
          <p>Versão impressa é cópia não controlada - Consulte sempre a versão digital atualizada</p>
          <p className="mt-2 font-bold">Classificação: USO INTERNO | Distribuição: Controlada</p>
        </div>
      </CardContent>
    </Card>
  );
}