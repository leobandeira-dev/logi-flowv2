import React from "react";
import { Card, CardContent } from "@/components/ui/card";

export function InstrucaoOcorrenciasDetalhada({ theme, isDark }) {
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
              <p>Páginas: 1/3</p>
            </div>
          </div>
          
          <div className="grid grid-cols-4 gap-3 text-sm mb-4">
            <div>
              <p className="font-semibold" style={{ color: theme.text }}>Elaborado:</p>
              <p style={{ color: theme.textMuted }}>Qualidade</p>
            </div>
            <div>
              <p className="font-semibold" style={{ color: theme.text }}>Aprovado:</p>
              <p style={{ color: theme.textMuted }}>Dir. Qualidade</p>
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
              <strong>Referência:</strong> ISO 9001:2015 (10.2, 10.3) | ISO 31000:2018 | SASSMAQ v.7 (4.2, 4.3)
            </p>
          </div>
        </div>

        <section>
          <h3 className="text-lg font-bold mb-3" style={{ color: theme.text }}>1. OBJETIVO</h3>
          <p className="text-sm" style={{ color: theme.textMuted }}>
            Estabelecer metodologia padronizada para identificação, registro, classificação, tratamento, análise 
            e prevenção de ocorrências operacionais, garantindo melhoria contínua e conformidade com 
            NBR ISO 9001:2015 (Não conformidade e ação corretiva).
          </p>
        </section>

        <section>
          <h3 className="text-lg font-bold mb-3" style={{ color: theme.text }}>2. APLICAÇÃO E RESPONSABILIDADES</h3>
          <table className="w-full text-xs border" style={{ borderColor: theme.cardBorder }}>
            <thead style={{ backgroundColor: isDark ? '#0f172a' : '#f3f4f6' }}>
              <tr>
                <th className="border p-2 text-left" style={{ borderColor: theme.cardBorder, color: theme.text }}>Função</th>
                <th className="border p-2 text-left" style={{ borderColor: theme.cardBorder, color: theme.text }}>Responsabilidade</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border p-2 font-semibold" style={{ borderColor: theme.cardBorder, color: theme.text }}>TODOS os usuários</td>
                <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>
                  Identificar e registrar ocorrências assim que detectadas
                </td>
              </tr>
              <tr>
                <td className="border p-2 font-semibold" style={{ borderColor: theme.cardBorder, color: theme.text }}>Responsável Designado</td>
                <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>
                  Tratar ocorrência dentro do prazo SLA, preencher campos, anexar evidências
                </td>
              </tr>
              <tr>
                <td className="border p-2 font-semibold" style={{ borderColor: theme.cardBorder, color: theme.text }}>Gestor de Qualidade</td>
                <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>
                  Analisar tendências, identificar causas raiz, propor ações preventivas
                </td>
              </tr>
              <tr>
                <td className="border p-2 font-semibold" style={{ borderColor: theme.cardBorder, color: theme.text }}>Diretor de Operações</td>
                <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>
                  Aprovar ações corretivas estruturais, análise crítica mensal
                </td>
              </tr>
            </tbody>
          </table>
        </section>

        <section>
          <h3 className="text-lg font-bold mb-3" style={{ color: theme.text }}>3. CATEGORIAS DE OCORRÊNCIAS</h3>
          <div className="space-y-3">
            <div className="border-l-4 pl-4 py-3" style={{ backgroundColor: theme.headerBg, borderColor: theme.text }}>
              <h4 className="font-bold text-sm mb-2" style={{ color: theme.text }}>3.1 TRACKING (Viagem)</h4>
              <div className="text-xs space-y-2" style={{ color: theme.textMuted }}>
                <p><strong>Impacto:</strong> Afeta SLA de carregamento ou descarga. Pode gerar diária.</p>
                <p><strong>Exemplos:</strong></p>
                <ul className="ml-6 list-disc space-y-1">
                  <li>Atraso no carregamento (além da tolerância)</li>
                  <li>Quebra mecânica do veículo</li>
                  <li>Acidente rodoviário</li>
                  <li>Bloqueio de rodovia (polícia, manifestação)</li>
                  <li>Carga retida (fiscalização)</li>
                  <li>Condições climáticas adversas (impossibilita trânsito)</li>
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

            <div className="border-l-4 pl-4 py-3" style={{ backgroundColor: theme.headerBg, borderColor: theme.text }}>
              <h4 className="font-bold text-sm mb-2" style={{ color: theme.text }}>3.2 FLUXO (Processos Internos)</h4>
              <div className="text-xs space-y-2" style={{ color: theme.textMuted }}>
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
                  <li>Atribuir responsável específico (usuário ou departamento)</li>
                  <li>Definir prazo de resolução (conforme SLA do tipo)</li>
                  <li>Bloquear avanço da etapa até resolução</li>
                  <li>Desbloquear etapa após resolver</li>
                  <li>Registrar solução nas observações</li>
                </ol>
              </div>
            </div>

            <div className="border-l-4 pl-4 py-3" style={{ backgroundColor: theme.headerBg, borderColor: theme.textMuted }}>
              <h4 className="font-bold text-sm mb-2" style={{ color: theme.text }}>3.3 TAREFA</h4>
              <div className="text-xs space-y-2" style={{ color: theme.textMuted }}>
                <p><strong>Impacto:</strong> NÃO afeta SLA ou prazo. Atividade administrativa.</p>
                <p><strong>Exemplos:</strong></p>
                <ul className="ml-6 list-disc space-y-1">
                  <li>Atualização de cadastro de motorista</li>
                  <li>Envio de documento complementar</li>
                  <li>Follow-up comercial</li>
                  <li>Arquivo de documentação</li>
                  <li>Atualização de dados no sistema</li>
                </ul>
                <p className="mt-2"><strong>Tratamento:</strong> Registro simples, sem impacto em métricas de performance.</p>
              </div>
            </div>

            <div className="border-l-4 pl-4 py-3" style={{ backgroundColor: theme.headerBg, borderColor: theme.text }}>
              <h4 className="font-bold text-sm mb-2" style={{ color: theme.text }}>3.4 DIÁRIA (Cobrança Adicional)</h4>
              <div className="text-xs space-y-2" style={{ color: theme.textMuted }}>
                <p><strong>Impacto:</strong> Gera cobrança adicional ao cliente (receita).</p>
                <p><strong>Geração:</strong> Sistema cria AUTOMATICAMENTE quando:</p>
                <ul className="ml-6 list-disc space-y-1">
                  <li>Tempo entre agendamento e execução do carregamento {'>'} tolerância</li>
                  <li>Tempo entre agendamento e execução da descarga {'>'} tolerância</li>
                </ul>
                <p className="mt-2"><strong>Workflow de Aprovação (4 etapas):</strong></p>
                <ol className="ml-6 list-decimal space-y-1">
                  <li><strong>Pendente Valor:</strong> Sistema sugere valor, gestor revisa</li>
                  <li><strong>Pendente Autorização:</strong> Aguardando aprovação do cliente</li>
                  <li><strong>Autorizado para Faturamento:</strong> Cliente aprovou, pode faturar</li>
                  <li><strong>Faturado:</strong> Incluído na NFS ou boleto</li>
                  <li><strong>Abonado:</strong> Cliente dispensou cobrança (registrar motivo)</li>
                </ol>
              </div>
            </div>
          </div>
        </section>

        <section>
          <h3 className="text-lg font-bold mb-3" style={{ color: theme.text }}>4. REGISTRO DE OCORRÊNCIA - PASSO A PASSO</h3>
          
          <div className="space-y-4">
            <div className="border-l-4 pl-4 py-3" style={{ backgroundColor: theme.headerBg, borderColor: theme.accentBlue }}>
              <div className="flex items-start gap-3 mb-2">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">1</div>
                <h4 className="font-bold text-base" style={{ color: theme.text }}>Acessar Módulo de Ocorrências</h4>
              </div>
              <ol className="text-xs space-y-1 ml-11 list-decimal" style={{ color: theme.textMuted }}>
                <li>Navegue até: <strong>Qualidade → Ocorrências</strong></li>
                <li>Tela exibe todas as ocorrências em abas (Abertas, Em Andamento, Resolvidas)</li>
                <li>No canto superior direito, clique em <strong>"Nova Ocorrência"</strong></li>
                <li>Sistema abre formulário de registro</li>
              </ol>
            </div>

            <div className="border-l-4 pl-4 py-3" style={{ backgroundColor: theme.headerBg, borderColor: theme.accentBlue }}>
              <div className="flex items-start gap-3 mb-2">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">2</div>
                <h4 className="font-bold text-base" style={{ color: theme.text }}>Vincular Ordem (Se Aplicável)</h4>
              </div>
              <div className="ml-11 space-y-2">
                <p className="text-xs" style={{ color: theme.textMuted }}>
                  <strong>Quando vincular:</strong> Se a ocorrência está relacionada a uma ordem específica
                </p>
                <ol className="text-xs space-y-1 ml-4 list-decimal" style={{ color: theme.textMuted }}>
                  <li>No campo "Ordem de Carregamento", comece digitando:
                    <ul className="ml-6 list-disc mt-1">
                      <li>Número da carga (ex: 2024-0157)</li>
                      <li>Nome do cliente</li>
                      <li>Cidade origem ou destino</li>
                    </ul>
                  </li>
                  <li>Sistema filtra e exibe ordens correspondentes</li>
                  <li>Selecione a ordem correta da lista</li>
                  <li>Dados da ordem aparecem automaticamente (cliente, rota, motorista)</li>
                </ol>

                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-300 dark:border-yellow-700 rounded p-2 mt-2">
                  <p className="font-semibold text-xs">⚠️ ATENÇÃO:</p>
                  <p className="text-xs" style={{ color: theme.textMuted }}>
                    Nem toda ocorrência precisa estar vinculada a uma ordem (ex: problemas sistêmicos, treinamentos).
                  </p>
                </div>
              </div>
            </div>

            <div className="border-l-4 pl-4 py-3" style={{ backgroundColor: theme.headerBg, borderColor: theme.accentBlue }}>
              <div className="flex items-start gap-3 mb-2">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">3</div>
                <h4 className="font-bold text-base" style={{ color: theme.text }}>Selecionar Tipo de Ocorrência</h4>
              </div>
              <div className="ml-11 space-y-2">
                <ol className="text-xs space-y-1 ml-4 list-decimal" style={{ color: theme.textMuted }}>
                  <li>No campo "Tipo", clique na seta para ver lista</li>
                  <li>Tipos são pré-cadastrados pela gestão (conforme SASSMAQ 4.2)</li>
                  <li>Selecione o tipo que melhor descreve o problema:
                    <ul className="ml-6 list-disc mt-1 space-y-1">
                      <li><strong>Atraso Carregamento</strong> (tracking)</li>
                      <li><strong>Quebra de Veículo</strong> (tracking)</li>
                      <li><strong>Documentação Pendente</strong> (fluxo)</li>
                      <li><strong>Erro de Cadastro</strong> (tarefa)</li>
                      <li><strong>Diária Carregamento</strong> (diária - gerado automaticamente)</li>
                      <li>E outros conforme catálogo da empresa</li>
                    </ul>
                  </li>
                  <li>Cada tipo tem SLA e responsável padrão pré-configurados</li>
                </ol>

                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-300 dark:border-blue-700 rounded p-2 mt-2">
                  <p className="font-semibold text-xs">💡 DICA:</p>
                  <p className="text-xs" style={{ color: theme.textMuted }}>
                    Se não encontrar tipo adequado, use "Outro" e descreva detalhadamente. 
                    Solicite ao gestor criação de novo tipo de ocorrência.
                  </p>
                </div>
              </div>
            </div>

            <div className="border-l-4 pl-4 py-3" style={{ backgroundColor: theme.headerBg, borderColor: theme.accentBlue }}>
              <div className="flex items-start gap-3 mb-2">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">4</div>
                <h4 className="font-bold text-base" style={{ color: theme.text }}>Selecionar Categoria e Gravidade</h4>
              </div>
              <div className="ml-11 space-y-3">
                <div className="text-xs" style={{ color: theme.textMuted }}>
                  <p className="font-semibold mb-1">4.1 Categoria: *</p>
                  <table className="w-full border text-[10px]" style={{ borderColor: theme.cardBorder }}>
                    <tbody>
                      <tr>
                        <td className="border p-2 font-semibold" style={{ borderColor: theme.cardBorder }}>Tracking</td>
                        <td className="border p-2" style={{ borderColor: theme.cardBorder }}>Problema em viagem (afeta SLA)</td>
                        <td className="border p-2" style={{ borderColor: theme.cardBorder }}>Use quando impacta prazo de entrega</td>
                      </tr>
                      <tr>
                        <td className="border p-2 font-semibold" style={{ borderColor: theme.cardBorder }}>Fluxo</td>
                        <td className="border p-2" style={{ borderColor: theme.cardBorder }}>Problema em processo interno</td>
                        <td className="border p-2" style={{ borderColor: theme.cardBorder }}>Use quando bloqueia etapa do workflow</td>
                      </tr>
                      <tr>
                        <td className="border p-2 font-semibold" style={{ borderColor: theme.cardBorder }}>Tarefa</td>
                        <td className="border p-2" style={{ borderColor: theme.cardBorder }}>Atividade administrativa</td>
                        <td className="border p-2" style={{ borderColor: theme.cardBorder }}>Não afeta SLA nem KPIs</td>
                      </tr>
                      <tr>
                        <td className="border p-2 font-semibold" style={{ borderColor: theme.cardBorder }}>Diária</td>
                        <td className="border p-2" style={{ borderColor: theme.cardBorder }}>Cobrança por espera</td>
                        <td className="border p-2" style={{ borderColor: theme.cardBorder }}>Gerada automaticamente pelo sistema</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="text-xs" style={{ color: theme.textMuted }}>
                  <p className="font-semibold mb-1">4.2 Gravidade: *</p>
                  <table className="w-full border text-[10px]" style={{ borderColor: theme.cardBorder }}>
                    <tbody>
                      <tr>
                        <td className="border p-2 font-semibold text-blue-600" style={{ borderColor: theme.cardBorder }}>Baixa</td>
                        <td className="border p-2" style={{ borderColor: theme.cardBorder }}>Sem impacto no prazo ou qualidade</td>
                        <td className="border p-2" style={{ borderColor: theme.cardBorder }}>SLA: 48h</td>
                      </tr>
                      <tr>
                        <td className="border p-2 font-semibold text-yellow-600" style={{ borderColor: theme.cardBorder }}>Média</td>
                        <td className="border p-2" style={{ borderColor: theme.cardBorder }}>Risco de pequeno atraso</td>
                        <td className="border p-2" style={{ borderColor: theme.cardBorder }}>SLA: 24h</td>
                      </tr>
                      <tr>
                        <td className="border p-2 font-semibold text-orange-600" style={{ borderColor: theme.cardBorder }}>Alta</td>
                        <td className="border p-2" style={{ borderColor: theme.cardBorder }}>Impacto direto no prazo</td>
                        <td className="border p-2" style={{ borderColor: theme.cardBorder }}>SLA: 8h</td>
                      </tr>
                      <tr>
                        <td className="border p-2 font-semibold text-red-600" style={{ borderColor: theme.cardBorder }}>Crítica</td>
                        <td className="border p-2" style={{ borderColor: theme.cardBorder }}>Parada total, risco de multa/perda</td>
                        <td className="border p-2" style={{ borderColor: theme.cardBorder }}>SLA: 2h (imediato)</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="border-l-4 pl-4 py-3" style={{ backgroundColor: theme.headerBg, borderColor: theme.accentBlue }}>
              <div className="flex items-start gap-3 mb-2">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">5</div>
                <h4 className="font-bold text-base" style={{ color: theme.text }}>Preencher Dados da Ocorrência</h4>
              </div>
              <div className="ml-11 space-y-2">
                <div className="text-xs" style={{ color: theme.textMuted }}>
                  <p className="font-semibold">5.1 Data/Hora de Início: *</p>
                  <ol className="ml-4 list-disc">
                    <li>Informe QUANDO o problema começou (não quando você está registrando)</li>
                    <li>Use seletor ou botão "Agora" se o problema está acontecendo neste momento</li>
                    <li>Exemplo: Se quebra ocorreu às 14:30 e você está registrando às 16:00, informe 14:30</li>
                  </ol>
                </div>

                <div className="text-xs" style={{ color: theme.textMuted }}>
                  <p className="font-semibold">5.2 Descrição Detalhada: *</p>
                  <ol className="ml-4 list-disc">
                    <li>Mínimo 20 caracteres, máximo 500</li>
                    <li>Responda: O QUÊ aconteceu, ONDE, QUANDO, QUEM identificou</li>
                    <li><strong>BOM:</strong> "Quebra da caixa de transmissão do cavalo ABC1234 no km 350 da BR-381, 
                    identificada pelo motorista João às 14:30. Veículo parado no acostamento."</li>
                    <li><strong>RUIM:</strong> "Problema com o caminhão" (vago, sem detalhes)</li>
                  </ol>
                </div>

                <div className="text-xs" style={{ color: theme.textMuted }}>
                  <p className="font-semibold">5.3 Localização (Para categoria Tracking):</p>
                  <ol className="ml-4 list-disc">
                    <li>Informe onde o problema ocorreu</li>
                    <li>Exemplo: "Km 350 BR-381 sentido BH-SP" ou "Posto Graal - Betim/MG"</li>
                  </ol>
                </div>

                <div className="text-xs" style={{ color: theme.textMuted }}>
                  <p className="font-semibold">5.4 Anexar Imagem/Documento (Recomendado):</p>
                  <ol className="ml-4 list-disc">
                    <li>Clique em "Anexar Foto/Documento"</li>
                    <li>Selecione arquivo (foto do problema, email do cliente, autorização, etc.)</li>
                    <li>Formatos: JPG, PNG, PDF (máx 5MB)</li>
                    <li><strong>Obrigatório para:</strong> Acidentes, avarias, bloqueios (evidência para seguro)</li>
                  </ol>
                </div>
              </div>
            </div>

            <div className="border-l-4 pl-4 py-3" style={{ backgroundColor: theme.headerBg, borderColor: theme.accentBlue }}>
              <div className="flex items-start gap-3 mb-2">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">6</div>
                <h4 className="font-bold text-base" style={{ color: theme.text }}>Atribuir Responsável (Opcional)</h4>
              </div>
              <div className="ml-11 space-y-2">
                <p className="text-xs" style={{ color: theme.textMuted }}>
                  Sistema atribui automaticamente baseado no tipo de ocorrência, MAS você pode alterar:
                </p>
                <ol className="text-xs space-y-1 ml-4 list-decimal" style={{ color: theme.textMuted }}>
                  <li>Campo "Responsável": selecione usuário específico OU</li>
                  <li>Campo "Departamento Responsável": selecione departamento (ex: Manutenção, Cadastro)</li>
                  <li>Responsável recebe email automático com link direto para a ocorrência</li>
                </ol>
              </div>
            </div>

            <div className="border-l-4 border-green-600 pl-4 py-3" style={{ backgroundColor: isDark ? 'rgba(34, 197, 94, 0.1)' : '#dcfce7' }}>
              <div className="flex items-start gap-3 mb-2">
                <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">7</div>
                <h4 className="font-bold text-base text-green-600">Salvar Ocorrência</h4>
              </div>
              <div className="ml-11 space-y-2">
                <ol className="text-xs space-y-1 ml-4 list-decimal" style={{ color: theme.textMuted }}>
                  <li>Revise todos os dados preenchidos</li>
                  <li>Clique em <strong>"Registrar Ocorrência"</strong></li>
                  <li>Sistema GERA AUTOMATICAMENTE:
                    <ul className="ml-6 list-disc mt-1">
                      <li><strong>Número do Ticket:</strong> AAMMDDHHNN (ex: 2412091435-01)</li>
                      <li><strong>Prazo de Resolução:</strong> Baseado no SLA do tipo (ex: 24h para gravidade média)</li>
                      <li><strong>Status Inicial:</strong> "Aberta"</li>
                      <li><strong>Email de Notificação:</strong> Enviado ao responsável</li>
                    </ul>
                  </li>
                  <li>Ocorrência aparece na aba "Abertas" do módulo Ocorrências</li>
                  <li>Contador de ocorrências é atualizado no menu lateral</li>
                </ol>
              </div>
            </div>
          </div>
        </section>

        <section className="print-page-break">
          <h3 className="text-lg font-bold mb-3" style={{ color: theme.text }}>5. TRATAMENTO DE OCORRÊNCIA - PASSO A PASSO</h3>
          
          <p className="text-sm mb-3" style={{ color: theme.textMuted }}>
            <strong>Quem executa:</strong> Responsável designado (recebe email automático)
          </p>

          <div className="space-y-4">
            <div className="border-l-4 pl-4 py-3" style={{ backgroundColor: theme.headerBg, borderColor: theme.textMuted }}>
              <div className="flex items-start gap-3 mb-2">
                <div className="w-8 h-8 bg-orange-600 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">1</div>
                <h4 className="font-bold text-base" style={{ color: theme.text }}>Acessar Ocorrência</h4>
              </div>
              <ol className="text-xs space-y-1 ml-11 list-decimal" style={{ color: theme.textMuted }}>
                <li>Clique no link do email recebido OU</li>
                <li>Acesse Qualidade → Ocorrências → Aba "Abertas" ou "Minhas Ocorrências"</li>
                <li>Localize a ocorrência pelo número do ticket</li>
                <li>Clique na linha para abrir detalhes</li>
              </ol>
            </div>

            <div className="border-l-4 pl-4 py-3" style={{ backgroundColor: theme.headerBg, borderColor: theme.textMuted }}>
              <div className="flex items-start gap-3 mb-2">
                <div className="w-8 h-8 bg-orange-600 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">2</div>
                <h4 className="font-bold text-base" style={{ color: theme.text }}>Alterar Status para "Em Andamento"</h4>
              </div>
              <ol className="text-xs space-y-1 ml-11 list-decimal" style={{ color: theme.textMuted }}>
                <li>No campo "Status", selecione <strong>"Em Andamento"</strong></li>
                <li>Indica que você começou a trabalhar na solução</li>
                <li>Remove da lista de "Aguardando Tratamento"</li>
                <li>Gestão monitora tempo de tratamento</li>
              </ol>
            </div>

            <div className="border-l-4 pl-4 py-3" style={{ backgroundColor: theme.headerBg, borderColor: theme.textMuted }}>
              <div className="flex items-start gap-3 mb-2">
                <div className="w-8 h-8 bg-orange-600 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">3</div>
                <h4 className="font-bold text-base" style={{ color: theme.text }}>Preencher Campos Customizados</h4>
              </div>
              <div className="ml-11 space-y-2">
                <p className="text-xs" style={{ color: theme.textMuted }}>
                  Cada tipo de ocorrência pode ter campos específicos. Exemplos:
                </p>
                <ul className="text-xs ml-4 list-disc space-y-1" style={{ color: theme.textMuted }}>
                  <li><strong>Quebra de Veículo:</strong> Oficina, Peça Substituída, Custo Reparo</li>
                  <li><strong>Acidente:</strong> Boletim Ocorrência, Seguradoras Envolvidas, Avaria na Carga</li>
                  <li><strong>Documentação:</strong> Documento Pendente, Data Recebimento</li>
                  <li><strong>Diária:</strong> Valor Sugerido, Valor Autorizado, Nº Autorização Cliente</li>
                </ul>
                <p className="text-xs mt-2" style={{ color: theme.textMuted }}>
                  Preencha TODOS os campos obrigatórios (*) do tipo de ocorrência.
                </p>
              </div>
            </div>

            <div className="border-l-4 pl-4 py-3" style={{ backgroundColor: theme.headerBg, borderColor: theme.textMuted }}>
              <div className="flex items-start gap-3 mb-2">
                <div className="w-8 h-8 bg-orange-600 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">4</div>
                <h4 className="font-bold text-base" style={{ color: theme.text }}>Anexar Evidências</h4>
              </div>
              <ol className="text-xs space-y-1 ml-11 list-decimal" style={{ color: theme.textMuted }}>
                <li>Clique em "Adicionar Anexo"</li>
                <li>Selecione foto/documento que comprova a resolução</li>
                <li>Exemplos:
                  <ul className="ml-6 list-disc mt-1">
                    <li>Foto do veículo reparado</li>
                    <li>Email do cliente autorizando diária</li>
                    <li>Comprovante de emissão de CT-e</li>
                    <li>Print de tela mostrando correção</li>
                  </ul>
                </li>
                <li>Upload concluído: arquivo aparece na lista de anexos</li>
              </ol>
            </div>

            <div className="border-l-4 pl-4 py-3" style={{ backgroundColor: theme.headerBg, borderColor: theme.textMuted }}>
              <div className="flex items-start gap-3 mb-2">
                <div className="w-8 h-8 bg-orange-600 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">5</div>
                <h4 className="font-bold text-base" style={{ color: theme.text }}>Informar Resolução</h4>
              </div>
              <ol className="text-xs space-y-1 ml-11 list-decimal" style={{ color: theme.textMuted }}>
                <li>No campo "Observações" (seção Tratamento), descreva:
                  <ul className="ml-6 list-disc mt-1">
                    <li>O que foi feito para resolver</li>
                    <li>Quem ajudou (pessoas, empresas)</li>
                    <li>Custos envolvidos (se houver)</li>
                  </ul>
                </li>
                <li>Exemplo: "Acionada oficina Mecânica Silva. Substituída caixa de transmissão. 
                Veículo liberado às 18:30. Custo: R$ 2.500,00 cobrado da transportadora."</li>
              </ol>
            </div>

            <div className="border-l-4 border-green-600 pl-4 py-3" style={{ backgroundColor: isDark ? 'rgba(34, 197, 94, 0.1)' : '#dcfce7' }}>
              <div className="flex items-start gap-3 mb-2">
                <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">6</div>
                <h4 className="font-bold text-base text-green-600">Fechar Ocorrência</h4>
              </div>
              <ol className="text-xs space-y-1 ml-11 list-decimal" style={{ color: theme.textMuted }}>
                <li>Altere Status para <strong>"Resolvida"</strong></li>
                <li>Informe <strong>Data/Hora Fim:</strong> quando problema foi efetivamente resolvido</li>
                <li>Sistema calcula automaticamente:
                  <ul className="ml-6 list-disc mt-1">
                    <li>Tempo total de resolução</li>
                    <li>Se foi resolvida dentro do SLA (Verde = OK, Vermelho = Atrasado)</li>
                  </ul>
                </li>
                <li>Clique em <strong>"Salvar"</strong></li>
                <li>Ocorrência move para aba "Resolvidas"</li>
                <li>Contador de ocorrências abertas diminui</li>
              </ol>
            </div>
          </div>
        </section>

        <section>
          <h3 className="text-lg font-bold mb-3" style={{ color: theme.text }}>6. TRATAMENTO DE DIÁRIAS - PROCEDIMENTO ESPECÍFICO</h3>
          
          <p className="text-sm mb-3" style={{ color: theme.textMuted }}>
            Diárias são geradas AUTOMATICAMENTE pelo sistema. Operador não cria manualmente.
          </p>

          <div className="space-y-3">
            <div className="border-l-4 pl-4 py-3" style={{ backgroundColor: theme.headerBg, borderColor: theme.textMuted }}>
              <p className="font-bold text-sm mb-2 text-yellow-600">PASSO 1: Identificar Diária Gerada</p>
              <ol className="text-xs space-y-1 ml-4 list-decimal" style={{ color: theme.textMuted }}>
                <li>Sistema detecta atraso além da tolerância (carregamento ou descarga)</li>
                <li>Cria ocorrência categoria "Diária" automaticamente</li>
                <li>Calcula quantidade de dias de espera</li>
                <li>Sugere valor baseado na operação</li>
                <li>Status inicial: "Pendente Valor"</li>
                <li>Gestor recebe notificação para revisar</li>
              </ol>
            </div>

            <div className="border-l-4 pl-4 py-3" style={{ backgroundColor: theme.headerBg, borderColor: theme.textMuted }}>
              <p className="font-bold text-sm mb-2 text-yellow-600">PASSO 2: Revisar Valor (Gestor)</p>
              <ol className="text-xs space-y-1 ml-4 list-decimal" style={{ color: theme.textMuted }}>
                <li>Acesse Qualidade → Ocorrências → Filtro "Categoria: Diária"</li>
                <li>Localize diária com status "Pendente Valor"</li>
                <li>Abra detalhes da ocorrência</li>
                <li>Revise <strong>Valor Sugerido</strong> (calculado pelo sistema)</li>
                <li>Ajuste <strong>Valor Autorizado</strong> se necessário</li>
                <li>Altere status para <strong>"Pendente Autorização"</strong></li>
                <li>Sistema notifica comercial para solicitar aprovação do cliente</li>
              </ol>
            </div>

            <div className="border-l-4 pl-4 py-3" style={{ backgroundColor: theme.headerBg, borderColor: theme.textMuted }}>
              <p className="font-bold text-sm mb-2 text-yellow-600">PASSO 3: Obter Autorização do Cliente</p>
              <ol className="text-xs space-y-1 ml-4 list-decimal" style={{ color: theme.textMuted }}>
                <li>Comercial entra em contato com cliente</li>
                <li>Explica motivo da diária e valor</li>
                <li>Cliente aprova OU abona (dispensa cobrança)</li>
                <li><strong>Se Aprovado:</strong>
                  <ul className="ml-6 list-disc mt-1">
                    <li>Registrar número da autorização (email, protocolo)</li>
                    <li>Alterar status para <strong>"Autorizado para Faturamento"</strong></li>
                    <li>Anexar email/documento de aprovação</li>
                  </ul>
                </li>
                <li><strong>Se Abonado:</strong>
                  <ul className="ml-6 list-disc mt-1">
                    <li>Alterar status para <strong>"Abonado"</strong></li>
                    <li>Preencher motivo do abono</li>
                    <li>Não será cobrado</li>
                  </ul>
                </li>
              </ol>
            </div>

            <div className="border-l-4 pl-4 py-3" style={{ backgroundColor: theme.headerBg, borderColor: theme.textMuted }}>
              <p className="font-bold text-sm mb-2 text-yellow-600">PASSO 4: Faturamento</p>
              <ol className="text-xs space-y-1 ml-4 list-decimal" style={{ color: theme.textMuted }}>
                <li>Financeiro filtra diárias com status "Autorizado para Faturamento"</li>
                <li>Inclui valores na NFS ou boleto do cliente</li>
                <li>Após inclusão, altera status para <strong>"Faturado"</strong></li>
                <li>Registra data de faturamento</li>
                <li>Ocorrência considerada finalizada</li>
              </ol>
            </div>
          </div>
        </section>

        <section>
          <h3 className="text-lg font-bold mb-3" style={{ color: theme.text }}>7. ANÁLISE DE CAUSA RAIZ (ISO 9001 - 10.2.1)</h3>
          
          <p className="text-sm mb-3" style={{ color: theme.textMuted }}>
            Para ocorrências recorrentes ou graves, realizar análise aprofundada:
          </p>

          <div className="space-y-3">
            <div className="text-sm" style={{ color: theme.textMuted }}>
              <p className="font-semibold mb-2">7.1 Método dos 5 Porquês:</p>
              <div className="border rounded p-3 text-xs" style={{ borderColor: theme.cardBorder }}>
                <p className="mb-2"><strong>Exemplo - Atraso Recorrente:</strong></p>
                <ol className="ml-4 space-y-1 list-decimal">
                  <li><strong>Por quê atrasou?</strong> Quebrou o veículo</li>
                  <li><strong>Por quê quebrou?</strong> Manutenção preventiva não foi feita</li>
                  <li><strong>Por quê não foi feita?</strong> Não tem controle de vencimento</li>
                  <li><strong>Por quê não tem controle?</strong> Sistema não alerta</li>
                  <li><strong>Por quê sistema não alerta?</strong> Funcionalidade não ativada</li>
                  <li className="font-semibold text-red-600">CAUSA RAIZ: Falta ativar alertas de manutenção no sistema</li>
                </ol>
              </div>
            </div>

            <div className="text-sm" style={{ color: theme.textMuted }}>
              <p className="font-semibold mb-2">7.2 Plano de Ação 5W2H:</p>
              <table className="w-full text-[10px] border" style={{ borderColor: theme.cardBorder }}>
                <thead style={{ backgroundColor: isDark ? '#0f172a' : '#f3f4f6' }}>
                  <tr>
                    <th className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.text }}>What (O quê?)</th>
                    <th className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.text }}>Why (Por quê?)</th>
                    <th className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.text }}>Who (Quem?)</th>
                    <th className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.text }}>When (Quando?)</th>
                    <th className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.text }}>Where (Onde?)</th>
                    <th className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.text }}>How (Como?)</th>
                    <th className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.text }}>How Much?</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>
                      Ativar alertas de manutenção
                    </td>
                    <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>
                      Prevenir quebras
                    </td>
                    <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>
                      TI + Manutenção
                    </td>
                    <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>
                      Até 15/12/24
                    </td>
                    <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>
                      Sistema
                    </td>
                    <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>
                      Config + treinamento
                    </td>
                    <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>
                      R$ 0
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <section>
          <h3 className="text-lg font-bold mb-3" style={{ color: theme.text }}>8. INDICADORES E ANÁLISE MENSAL</h3>
          <div className="text-sm space-y-2" style={{ color: theme.textMuted }}>
            <p>Mensalmente, o Gestor de Qualidade deve analisar:</p>
            <ul className="ml-6 list-disc space-y-1 text-xs">
              <li><strong>Top 5 Tipos Mais Frequentes:</strong> Identificar padrões</li>
              <li><strong>Departamentos com Mais Ocorrências:</strong> Avaliar necessidade de treinamento</li>
              <li><strong>Taxa de Resolução no Prazo:</strong> Meta ≥ 92%</li>
              <li><strong>Ocorrências Críticas:</strong> Revisar causas e ações tomadas</li>
              <li><strong>Impacto Acumulado no SLA:</strong> Quanto as ocorrências afetaram prazos</li>
              <li><strong>Eficácia de Ações Corretivas:</strong> Problema se repetiu após ação?</li>
            </ul>
          </div>
        </section>

        <section>
          <h3 className="text-lg font-bold mb-3" style={{ color: theme.text }}>9. KPIs CRÍTICOS</h3>
          <div className="grid grid-cols-3 gap-3">
            <Card style={{ backgroundColor: isDark ? '#0f172a' : '#f9fafb', borderColor: theme.cardBorder }}>
              <CardContent className="p-3 text-center">
                <p className="text-2xl font-bold text-green-600">≥ 92%</p>
                <p className="text-xs font-semibold mt-1" style={{ color: theme.text }}>Resolvidas no Prazo</p>
              </CardContent>
            </Card>
            <Card style={{ backgroundColor: isDark ? '#0f172a' : '#f9fafb', borderColor: theme.cardBorder }}>
              <CardContent className="p-3 text-center">
                <p className="text-2xl font-bold text-blue-600">≤ 5%</p>
                <p className="text-xs font-semibold mt-1" style={{ color: theme.text }}>Taxa de Recorrência</p>
              </CardContent>
            </Card>
            <Card style={{ backgroundColor: isDark ? '#0f172a' : '#f9fafb', borderColor: theme.cardBorder }}>
              <CardContent className="p-3 text-center">
                <p className="text-2xl font-bold text-purple-600">≤ 24h</p>
                <p className="text-xs font-semibold mt-1" style={{ color: theme.text }}>Tempo Médio Resolução</p>
              </CardContent>
            </Card>
          </div>
        </section>

        <section>
          <h3 className="text-lg font-bold mb-3" style={{ color: theme.text }}>10. DOCUMENTOS RELACIONADOS</h3>
          <ul className="list-disc list-inside text-sm space-y-1 ml-4" style={{ color: theme.textMuted }}>
            <li><strong>PO-LOG-001</strong> - Procedimento de Gestão de Transportes (procedimento pai)</li>
            <li><strong>IT-LOG-001</strong> - Gestão de Ordens (origem de muitas ocorrências)</li>
            <li><strong>IT-LOG-002</strong> - Tracking (registro via tracking)</li>
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

export function ManualSistemaCompleto({ theme, isDark }) {
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
              <p className="text-sm mt-2" style={{ color: theme.textMuted }}>
                Guia Completo de Utilização de Todos os Módulos
              </p>
            </div>
            <div className="text-right text-sm" style={{ color: theme.textMuted }}>
              <p className="font-bold">Código: MAN-LOG-001</p>
              <p>Versão: 1.0</p>
              <p>Data: 09/12/2024</p>
              <p>Páginas: 1/8</p>
            </div>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded p-3 text-xs">
            <p className="font-semibold mb-1">Conformidade Normativa:</p>
            <p style={{ color: theme.textMuted }}>
              Este manual referencia todos os procedimentos operacionais (PO) e instruções de trabalho (IT) 
              do Sistema de Gestão da Qualidade conforme ISO 9001:2015.
            </p>
          </div>
        </div>

        {/* SUMÁRIO EXPANDIDO */}
        <section>
          <h3 className="text-lg font-bold mb-3" style={{ color: theme.text }}>SUMÁRIO</h3>
          <div className="grid grid-cols-2 gap-4 text-sm" style={{ color: theme.textMuted }}>
            <div>
              <p className="font-bold mb-2">PARTE I - FUNDAMENTOS</p>
              <ol className="ml-4 space-y-1">
                <li>1. Introdução ao Sistema</li>
                <li>2. Arquitetura e Módulos</li>
                <li>3. Perfis de Usuário</li>
                <li>4. Primeiro Acesso</li>
              </ol>
            </div>
            <div>
              <p className="font-bold mb-2">PARTE II - MÓDULOS OPERACIONAIS</p>
              <ol className="ml-4 space-y-1" start="5">
                <li>5. Dashboard Executivo</li>
                <li>6. Ordens de Carregamento</li>
                <li>7. Tracking Logístico</li>
                <li>8. Fluxo Operacional</li>
              </ol>
            </div>
            <div>
              <p className="font-bold mb-2">PARTE III - GESTÃO DE QUALIDADE</p>
              <ol className="ml-4 space-y-1" start="9">
                <li>9. Ocorrências</li>
                <li>10. Gamificação</li>
              </ol>
            </div>
            <div>
              <p className="font-bold mb-2">PARTE IV - MÓDULOS WMS</p>
              <ol className="ml-4 space-y-1" start="11">
                <li>11. Recebimento</li>
                <li>12. Gestão de Notas Fiscais</li>
                <li>13. Etiquetas Mãe</li>
                <li>14. Carregamento WMS</li>
                <li>15. Ordem de Entrega</li>
              </ol>
            </div>
            <div>
              <p className="font-bold mb-2">PARTE V - PORTAL B2B</p>
              <ol className="ml-4 space-y-1" start="16">
                <li>16. Solicitar Coleta</li>
                <li>17. Aprovar Coletas</li>
              </ol>
            </div>
            <div>
              <p className="font-bold mb-2">PARTE VI - RECURSOS E CADASTROS</p>
              <ol className="ml-4 space-y-1" start="18">
                <li>18. Motoristas</li>
                <li>19. Veículos</li>
                <li>20. Parceiros</li>
                <li>21. Operações (SLA)</li>
              </ol>
            </div>
            <div>
              <p className="font-bold mb-2">PARTE VII - COMUNICAÇÃO</p>
              <ol className="ml-4 space-y-1" start="22">
                <li>22. App Motorista</li>
                <li>23. SAC</li>
              </ol>
            </div>
            <div>
              <p className="font-bold mb-2">PARTE VIII - ADMINISTRAÇÃO</p>
              <ol className="ml-4 space-y-1" start="24">
                <li>24. Configurações</li>
                <li>25. Usuários</li>
                <li>26. Boas Práticas</li>
                <li>27. Suporte</li>
              </ol>
            </div>
          </div>
        </section>

        {/* PARTE I */}
        <section className="print-page-break">
          <div className="border-b-2 px-4 py-3 mb-4" style={{ borderColor: theme.text }}>
            <h2 className="text-xl font-bold" style={{ color: theme.text }}>PARTE I - FUNDAMENTOS DO SISTEMA</h2>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-bold mb-3" style={{ color: theme.text }}>1. INTRODUÇÃO AO LOG FLOW</h3>
              <div className="text-sm space-y-3" style={{ color: theme.textMuted }}>
                <p>
                  O <strong>Log Flow</strong> é uma plataforma web integrada de gestão logística, desenvolvida 
                  especificamente para empresas de transporte rodoviário de cargas. O sistema abrange todo o 
                  ciclo operacional, desde o planejamento até o faturamento, com foco em:
                </p>
                <ul className="ml-6 list-disc space-y-1">
                  <li><strong>Eficiência:</strong> Automatização de processos repetitivos</li>
                  <li><strong>Rastreabilidade:</strong> Registro completo de todas as operações</li>
                  <li><strong>Qualidade:</strong> Conformidade com ISO 9001 e SASSMAQ</li>
                  <li><strong>Visibilidade:</strong> Informação em tempo real para todos stakeholders</li>
                  <li><strong>Escalabilidade:</strong> Suporta de 100 a 50.000+ documentos/mês</li>
                </ul>

                <div className="bg-green-50 dark:bg-green-900/20 border border-green-300 dark:border-green-700 rounded p-3 mt-3">
                  <p className="font-semibold text-xs">✅ DIFERENCIAIS COMPETITIVOS:</p>
                  <ul className="text-xs space-y-1 ml-4 list-disc">
                    <li>Interface intuitiva (não requer treinamento extenso)</li>
                    <li>Workflow 100% customizável</li>
                    <li>Edição inline (agiliza 80% das operações)</li>
                    <li>Integração nativa com ANTT, SEFAZ, APIs</li>
                    <li>App móvel para motoristas (sem custo adicional)</li>
                    <li>Modo escuro/claro (conforto visual)</li>
                  </ul>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-bold mb-3" style={{ color: theme.text }}>2. ARQUITETURA MODULAR</h3>
              <p className="text-sm mb-3" style={{ color: theme.textMuted }}>
                O sistema é estruturado em módulos independentes mas integrados:
              </p>

              <div className="space-y-3">
                <Card style={{ backgroundColor: isDark ? '#0f172a' : '#ffffff', borderColor: theme.cardBorder }}>
                  <CardContent className="p-4">
                    <h4 className="font-bold text-sm mb-2 text-blue-600">PACOTE BASE (Obrigatório)</h4>
                    <div className="grid grid-cols-2 gap-2 text-xs" style={{ color: theme.textMuted }}>
                      <div>• Dashboard Executivo</div>
                      <div>• Ordens de Carregamento</div>
                      <div>• Tracking Logístico</div>
                      <div>• Gestão de Usuários</div>
                      <div>• Motoristas</div>
                      <div>• Veículos</div>
                      <div>• Parceiros</div>
                      <div>• Operações (Config SLA)</div>
                    </div>
                    <p className="text-xs mt-3 italic">
                      <strong>Referências:</strong> IT-LOG-001 (Ordens), IT-LOG-002 (Tracking)
                    </p>
                  </CardContent>
                </Card>

                <Card style={{ backgroundColor: isDark ? '#0f172a' : '#ffffff', borderColor: theme.cardBorder }}>
                  <CardContent className="p-4">
                    <h4 className="font-bold text-sm mb-2 text-purple-600">ADD-ON: Workflow & Qualidade</h4>
                    <div className="text-xs space-y-1" style={{ color: theme.textMuted }}>
                      <p>• <strong>Fluxo BPMN:</strong> Etapas customizáveis por empresa</p>
                      <p>• <strong>Ocorrências:</strong> Tracking, Fluxo, Tarefa, Diária</p>
                      <p>• <strong>Gamificação:</strong> Pontuação, conquistas, ranking</p>
                    </div>
                    <p className="text-xs mt-3 italic">
                      <strong>Referências:</strong> IT-LOG-003 (Ocorrências)
                    </p>
                  </CardContent>
                </Card>

                <Card style={{ backgroundColor: isDark ? '#0f172a' : '#ffffff', borderColor: theme.cardBorder }}>
                  <CardContent className="p-4">
                    <h4 className="font-bold text-sm mb-2 text-green-600">ADD-ON: WMS Completo</h4>
                    <div className="text-xs space-y-1" style={{ color: theme.textMuted }}>
                      <p>• <strong>Recebimento:</strong> Importação NF-e (XML, chave, scanner)</p>
                      <p>• <strong>Gestão de NFs:</strong> Controle completo de fiscais</p>
                      <p>• <strong>Volumes:</strong> Etiquetagem individual</p>
                      <p>• <strong>Etiquetas Mãe:</strong> Unitização de cargas</p>
                      <p>• <strong>Carregamento:</strong> Conferência e expedição</p>
                      <p>• <strong>Entrega:</strong> Last mile delivery</p>
                    </div>
                  </CardContent>
                </Card>

                <Card style={{ backgroundColor: isDark ? '#0f172a' : '#ffffff', borderColor: theme.cardBorder }}>
                  <CardContent className="p-4">
                    <h4 className="font-bold text-sm mb-2 text-orange-600">ADD-ON: Portal B2B</h4>
                    <div className="text-xs space-y-1" style={{ color: theme.textMuted }}>
                      <p>• <strong>Fornecedor:</strong> Solicita coletas self-service</p>
                      <p>• <strong>Cliente:</strong> Aprova/reprova coletas</p>
                      <p>• <strong>Dashboard:</strong> Visibilidade de coletas em tempo real</p>
                    </div>
                  </CardContent>
                </Card>

                <Card style={{ backgroundColor: isDark ? '#0f172a' : '#ffffff', borderColor: theme.cardBorder }}>
                  <CardContent className="p-4">
                    <h4 className="font-bold text-sm mb-2 text-cyan-600">ADD-ON: Comunicação Avançada</h4>
                    <div className="text-xs space-y-1" style={{ color: theme.textMuted }}>
                      <p>• <strong>App Motorista:</strong> SMS + atualização de status mobile</p>
                      <p>• <strong>SAC Inteligente:</strong> Chatbot com IA para atendimento 24/7</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-bold mb-3" style={{ color: theme.text }}>3. PERFIS DE USUÁRIO E PERMISSÕES</h3>
              <table className="w-full text-xs border" style={{ borderColor: theme.cardBorder }}>
                <thead style={{ backgroundColor: isDark ? '#0f172a' : '#f3f4f6' }}>
                  <tr>
                    <th className="border p-2 text-left w-24" style={{ borderColor: theme.cardBorder, color: theme.text }}>Perfil</th>
                    <th className="border p-2 text-left" style={{ borderColor: theme.cardBorder, color: theme.text }}>Descrição</th>
                    <th className="border p-2 text-left" style={{ borderColor: theme.cardBorder, color: theme.text }}>Módulos Disponíveis</th>
                    <th className="border p-2 text-left w-20" style={{ borderColor: theme.cardBorder, color: theme.text }}>Acesso</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border p-2 font-bold text-red-600" style={{ borderColor: theme.cardBorder }}>Admin</td>
                    <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>
                      Administrador do sistema
                    </td>
                    <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>
                      TODOS (configurações, usuários, procedimentos, CRM)
                    </td>
                    <td className="border p-2 text-center font-bold text-green-600" style={{ borderColor: theme.cardBorder }}>Total</td>
                  </tr>
                  <tr>
                    <td className="border p-2 font-bold text-blue-600" style={{ borderColor: theme.cardBorder }}>Operador</td>
                    <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>
                      Equipe operacional da transportadora
                    </td>
                    <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>
                      Dashboard, Tracking, Fluxo, Ordens, WMS, Qualidade, Comunicação
                    </td>
                    <td className="border p-2 text-center font-bold text-blue-600" style={{ borderColor: theme.cardBorder }}>Amplo</td>
                  </tr>
                  <tr>
                    <td className="border p-2 font-bold text-green-600" style={{ borderColor: theme.cardBorder }}>Fornecedor</td>
                    <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>
                      Empresa que solicita coletas (B2B)
                    </td>
                    <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>
                      Dashboard Coletas, Solicitar Coleta, Minhas Ordens
                    </td>
                    <td className="border p-2 text-center font-bold text-green-600" style={{ borderColor: theme.cardBorder }}>Limitado</td>
                  </tr>
                  <tr>
                    <td className="border p-2 font-bold text-purple-600" style={{ borderColor: theme.cardBorder }}>Cliente</td>
                    <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>
                      Empresa que recebe/aprova coletas (B2B)
                    </td>
                    <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>
                      Dashboard Coletas, Aprovar Coletas, Minhas Ordens
                    </td>
                    <td className="border p-2 text-center font-bold text-purple-600" style={{ borderColor: theme.cardBorder }}>Limitado</td>
                  </tr>
                  <tr>
                    <td className="border p-2 font-bold text-orange-600" style={{ borderColor: theme.cardBorder }}>Motorista</td>
                    <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>
                      Motorista em viagem
                    </td>
                    <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>
                      App Motorista (versão mobile via SMS)
                    </td>
                    <td className="border p-2 text-center font-bold text-orange-600" style={{ borderColor: theme.cardBorder }}>Mobile</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div>
              <h3 className="text-lg font-bold mb-3" style={{ color: theme.text }}>4. PRIMEIRO ACESSO</h3>
              <ol className="text-sm space-y-2 ml-6 list-decimal" style={{ color: theme.textMuted }}>
                <li>
                  <strong>Convite por Email:</strong> Você receberá email com link de acesso
                </li>
                <li>
                  <strong>Criar Senha:</strong> Clique no link e defina sua senha (mín 8 caracteres)
                </li>
                <li>
                  <strong>Completar Perfil:</strong> Sistema solicita dados obrigatórios:
                  <ul className="ml-6 list-disc mt-1 text-xs">
                    <li>Tipo de Perfil (Operador/Fornecedor/Cliente)</li>
                    <li>Empresa vinculada (CNPJ)</li>
                    <li>Cargo e Departamento</li>
                    <li>Foto (opcional mas recomendado)</li>
                  </ul>
                </li>
                <li>
                  <strong>Aguardar Aprovação:</strong> Admin aprova seu cadastro (notificação por email)
                </li>
                <li>
                  <strong>Acessar Sistema:</strong> Após aprovação, faça login e acesse módulos do seu perfil
                </li>
              </ol>
            </div>
          </div>
        </section>

        {/* PARTE II */}
        <section className="print-page-break">
          <div className="border-b-2 px-4 py-3 mb-4" style={{ borderColor: theme.text }}>
            <h2 className="text-xl font-bold" style={{ color: theme.text }}>PARTE II - MÓDULOS OPERACIONAIS (CORE)</h2>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-bold mb-3" style={{ color: theme.text }}>6. ORDENS DE CARREGAMENTO</h3>
              <p className="text-sm mb-2" style={{ color: theme.textMuted }}>
                <strong>Caminho:</strong> Menu → Operações → Ordens | <strong>Referência:</strong> IT-LOG-001
              </p>
              
              <div className="space-y-3 text-sm" style={{ color: theme.textMuted }}>
                <div>
                  <p className="font-semibold">6.1 Funções Principais:</p>
                  <ul className="ml-6 list-disc space-y-1 text-xs">
                    <li>Criar ordens (completa, oferta, lote)</li>
                    <li>Visualizar e filtrar ordens</li>
                    <li>Editar campos inline (clique direto na tabela)</li>
                    <li>Exportar ofertas em PDF</li>
                    <li>Imprimir ordem de coleta</li>
                    <li>Ver detalhes completos</li>
                    <li>Excluir ordem (se permitido)</li>
                  </ul>
                </div>

                <div>
                  <p className="font-semibold">6.2 Filtros Disponíveis:</p>
                  <ul className="ml-6 list-disc text-xs">
                    <li>Por Operação (múltipla seleção)</li>
                    <li>Por Tipo de Registro (Oferta, Negociando, Alocado)</li>
                    <li>Por Status</li>
                    <li>Por Status de Tracking</li>
                    <li>Por Origem/Destino</li>
                    <li>Por Período (data início/fim)</li>
                    <li>Busca livre (nº ordem, cliente, cidade)</li>
                  </ul>
                </div>

                <div>
                  <p className="font-semibold">6.3 Ações Rápidas:</p>
                  <table className="w-full text-[10px] border mt-2" style={{ borderColor: theme.cardBorder }}>
                    <tbody>
                      <tr>
                        <td className="border p-2 font-semibold" style={{ borderColor: theme.cardBorder }}>Clique no campo</td>
                        <td className="border p-2" style={{ borderColor: theme.cardBorder }}>Edita inline (modalidade, tipo veículo, placas, frete, agendamentos, obs)</td>
                      </tr>
                      <tr>
                        <td className="border p-2 font-semibold" style={{ borderColor: theme.cardBorder }}>Botão Olho</td>
                        <td className="border p-2" style={{ borderColor: theme.cardBorder }}>Ver detalhes completos (popup)</td>
                      </tr>
                      <tr>
                        <td className="border p-2 font-semibold" style={{ borderColor: theme.cardBorder }}>Botão Lápis</td>
                        <td className="border p-2" style={{ borderColor: theme.cardBorder }}>Editar completo (formulário full)</td>
                      </tr>
                      <tr>
                        <td className="border p-2 font-semibold" style={{ borderColor: theme.cardBorder }}>Botão Impressora</td>
                        <td className="border p-2" style={{ borderColor: theme.cardBorder }}>Imprimir ordem de coleta</td>
                      </tr>
                      <tr>
                        <td className="border p-2 font-semibold" style={{ borderColor: theme.cardBorder }}>Botão PDF</td>
                        <td className="border p-2" style={{ borderColor: theme.cardBorder }}>Exportar oferta (para ofertar a parceiros)</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-300 dark:border-blue-700 rounded p-3">
                  <p className="font-semibold text-xs">📖 LEIA A IT-LOG-001 PARA:</p>
                  <p className="text-xs">Passo a passo detalhado de criação, edição e validação de ordens</p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-bold mb-3" style={{ color: theme.text }}>7. TRACKING LOGÍSTICO</h3>
              <p className="text-sm mb-2" style={{ color: theme.textMuted }}>
                <strong>Caminho:</strong> Menu → Operações → Tracking | <strong>Referência:</strong> IT-LOG-002
              </p>
              
              <div className="space-y-3 text-sm" style={{ color: theme.textMuted }}>
                <div>
                  <p className="font-semibold">7.1 Funções Principais:</p>
                  <ul className="ml-6 list-disc space-y-1 text-xs">
                    <li>Monitorar cargas em tempo real</li>
                    <li>Atualizar status de tracking (10 estágios)</li>
                    <li>Controlar SLA de carregamento e descarga</li>
                    <li>Registrar ocorrências diretamente</li>
                    <li>Chat com motorista (WhatsApp/SMS)</li>
                    <li>Upload de documentos (CT-e, MDF-e, Comprovante)</li>
                    <li>Expurgar atrasos justificados</li>
                    <li>Exportar relatórios (PDF, Excel)</li>
                  </ul>
                </div>

                <div>
                  <p className="font-semibold">7.2 Abas de Visualização:</p>
                  <table className="w-full text-[10px] border mt-2" style={{ borderColor: theme.cardBorder }}>
                    <tbody>
                      <tr>
                        <td className="border p-2 font-semibold" style={{ borderColor: theme.cardBorder }}>Todas</td>
                        <td className="border p-2" style={{ borderColor: theme.cardBorder }}>Exibe todas as ordens (filtros aplicados)</td>
                      </tr>
                      <tr>
                        <td className="border p-2 font-semibold" style={{ borderColor: theme.cardBorder }}>Ativas</td>
                        <td className="border p-2" style={{ borderColor: theme.cardBorder }}>Aguardando carregamento ou em carregamento</td>
                      </tr>
                      <tr>
                        <td className="border p-2 font-semibold" style={{ borderColor: theme.cardBorder }}>Em Viagem</td>
                        <td className="border p-2" style={{ borderColor: theme.cardBorder }}>Carregado, em viagem ou chegou destino</td>
                      </tr>
                      <tr>
                        <td className="border p-2 font-semibold" style={{ borderColor: theme.cardBorder }}>Descarregando</td>
                        <td className="border p-2" style={{ borderColor: theme.cardBorder }}>Descarga agendada, em descarga</td>
                      </tr>
                      <tr>
                        <td className="border p-2 font-semibold" style={{ borderColor: theme.cardBorder }}>Finalizadas</td>
                        <td className="border p-2" style={{ borderColor: theme.cardBorder }}>Descarga realizada e finalizado</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div>
                  <p className="font-semibold">7.3 Visualizações:</p>
                  <ul className="ml-6 list-disc text-xs">
                    <li><strong>Tabela Completa:</strong> Todos os campos (ideal para análise detalhada)</li>
                    <li><strong>Modo Planilha:</strong> Visão compacta (ideal para múltiplas ordens, atualização rápida)</li>
                  </ul>
                </div>

                <div>
                  <p className="font-semibold">7.4 Métricas em Tempo Real:</p>
                  <p className="text-xs ml-4">
                    Cards superiores exibem: Total de Ordens, Em Progresso, SLA Carregamento, SLA Descarga, 
                    Média de Tempo de Carregamento/Descarga
                  </p>
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-300 dark:border-blue-700 rounded p-3">
                  <p className="font-semibold text-xs">📖 LEIA A IT-LOG-002 PARA:</p>
                  <p className="text-xs">Sequência correta de status, controle de SLA, procedimento de expurgo</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* PARTE III */}
        <section className="print-page-break">
          <div className="border-b-2 px-4 py-3 mb-4" style={{ borderColor: theme.text }}>
            <h2 className="text-xl font-bold" style={{ color: theme.text }}>PARTE III - GESTÃO DE QUALIDADE (ISO 9001)</h2>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-bold mb-3" style={{ color: theme.text }}>9. OCORRÊNCIAS E NÃO CONFORMIDADES</h3>
              <p className="text-sm mb-2" style={{ color: theme.textMuted }}>
                <strong>Caminho:</strong> Menu → Qualidade → Ocorrências | <strong>Referência:</strong> IT-LOG-003
              </p>

              <div className="space-y-3 text-sm" style={{ color: theme.textMuted }}>
                <div>
                  <p className="font-semibold">9.1 Quando Usar:</p>
                  <ul className="ml-6 list-disc text-xs">
                    <li>Qualquer desvio do processo padrão</li>
                    <li>Problemas que impactam prazo ou qualidade</li>
                    <li>Necessidade de rastreabilidade de problema</li>
                    <li>Diárias (geradas automaticamente)</li>
                  </ul>
                </div>

                <div>
                  <p className="font-semibold">9.2 Funcionalidades:</p>
                  <ul className="ml-6 list-disc text-xs space-y-1">
                    <li><strong>Registro:</strong> Via tracking, via fluxo ou avulsa</li>
                    <li><strong>Classificação:</strong> 4 categorias × 4 gravidades = 16 combinações</li>
                    <li><strong>Atribuição:</strong> Responsável automático ou manual</li>
                    <li><strong>SLA:</strong> Prazo de resolução por tipo</li>
                    <li><strong>Notificações:</strong> Email automático</li>
                    <li><strong>Campos Customizados:</strong> Por tipo de ocorrência</li>
                    <li><strong>Anexos:</strong> Fotos, documentos, evidências</li>
                    <li><strong>Dashboard:</strong> Visão de ocorrências abertas/resolvidas</li>
                    <li><strong>Análises:</strong> Pareto, tendências, recorrências</li>
                  </ul>
                </div>

                <div>
                  <p className="font-semibold">9.3 Workflow de Ocorrência:</p>
                  <div className="flex items-center gap-2 text-xs flex-wrap mt-2">
                    <div className="px-2 py-1 bg-yellow-500 text-white rounded font-bold">Aberta</div>
                    <span>→</span>
                    <div className="px-2 py-1 bg-blue-500 text-white rounded font-bold">Em Andamento</div>
                    <span>→</span>
                    <div className="px-2 py-1 bg-green-500 text-white rounded font-bold">Resolvida</div>
                  </div>
                  <p className="text-xs mt-2">
                    Também pode ser <strong>Cancelada</strong> se identificado erro de registro ou duplicidade
                  </p>
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-300 dark:border-blue-700 rounded p-3">
                  <p className="font-semibold text-xs">📖 LEIA A IT-LOG-003 PARA:</p>
                  <p className="text-xs">Registro passo a passo, tratamento de diárias, análise de causa raiz</p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-bold mb-3" style={{ color: theme.text }}>10. SISTEMA DE GAMIFICAÇÃO</h3>
              <p className="text-sm mb-2" style={{ color: theme.textMuted }}>
                <strong>Caminho:</strong> Menu → Qualidade → Gamificação
              </p>
              
              <div className="text-sm space-y-2" style={{ color: theme.textMuted }}>
                <p>Sistema de reconhecimento e engajamento da equipe através de pontuação e conquistas.</p>
                
                <div className="text-xs">
                  <p className="font-semibold">Ações Pontuadas:</p>
                  <ul className="ml-6 list-disc">
                    <li>Criar ordem completa (alocada) - 10 pontos</li>
                    <li>Atualizar tracking - 5 pontos</li>
                    <li>Resolver ocorrência no prazo - 15 pontos</li>
                    <li>Entregar no prazo (SLA 100%) - 20 pontos</li>
                    <li>Mês sem ocorrências críticas - 50 pontos</li>
                  </ul>
                </div>

                <div className="text-xs">
                  <p className="font-semibold">Conquistas (Badges):</p>
                  <ul className="ml-6 list-disc">
                    <li>🏆 Mestre da Qualidade: 100% SLA por 3 meses</li>
                    <li>⚡ Velocista: 50 atualizações de tracking em 1 mês</li>
                    <li>🎯 Acuracidade Total: 0 correções em 50 ordens</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* PARTE VII */}
        <section className="print-page-break">
          <div className="border-b-2 px-4 py-3 mb-4" style={{ borderColor: theme.text }}>
            <h2 className="text-xl font-bold" style={{ color: theme.text }}>PARTE VII - COMUNICAÇÃO</h2>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-bold mb-3" style={{ color: theme.text }}>22. APP MOTORISTA</h3>
              <p className="text-sm mb-3" style={{ color: theme.textMuted }}>
                <strong>Caminho:</strong> Menu → Comunicação → App Motorista (Operador) | Via SMS (Motorista)
              </p>
              
              <div className="space-y-3 text-sm" style={{ color: theme.textMuted }}>
                <div>
                  <p className="font-semibold">22.1 Enviar Link para Motorista:</p>
                  <ol className="ml-6 list-decimal text-xs space-y-1">
                    <li>Acesse App Motorista no menu</li>
                    <li>Localize a ordem/viagem</li>
                    <li>Clique em "Enviar SMS"</li>
                    <li>Informe número do celular do motorista</li>
                    <li>Motorista recebe SMS com link de acesso</li>
                  </ol>
                </div>

                <div>
                  <p className="font-semibold">22.2 Funcionalidades do App (Motorista):</p>
                  <ul className="ml-6 list-disc text-xs">
                    <li>Ver detalhes da viagem (origem, destino, produto, agendamentos)</li>
                    <li>Atualizar status com 1 clique (Carreguei, Saí, Cheguei, Descarreguei)</li>
                    <li>Upload de fotos (carga, comprovante entrega)</li>
                    <li>Chat com central (dúvidas, problemas)</li>
                    <li>Ver documentos (ordem, NFs)</li>
                  </ul>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-bold mb-3" style={{ color: theme.text }}>23. SAC - ATENDIMENTO AO CLIENTE</h3>
              <p className="text-sm mb-3" style={{ color: theme.textMuted }}>
                <strong>Caminho:</strong> Menu → Comunicação → SAC
              </p>
              
              <div className="text-sm space-y-2" style={{ color: theme.textMuted }}>
                <p>Chatbot inteligente para atendimento de clientes/fornecedores.</p>
                
                <div className="text-xs">
                  <p className="font-semibold">Perguntas Atendidas:</p>
                  <ul className="ml-6 list-disc">
                    <li>Status de uma ordem específica</li>
                    <li>Localização de carga em trânsito</li>
                    <li>Prazo de entrega estimado</li>
                    <li>Documentos disponíveis para download</li>
                    <li>Problemas/ocorrências registradas</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* BOAS PRÁTICAS */}
        <section className="print-page-break">
          <div className="border-b-2 px-4 py-3 mb-4" style={{ borderColor: theme.text }}>
            <h2 className="text-xl font-bold" style={{ color: theme.text }}>PARTE VIII - BOAS PRÁTICAS OPERACIONAIS</h2>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-bold mb-3" style={{ color: theme.text }}>26. BOAS PRÁTICAS POR MÓDULO</h3>
              
              <div className="space-y-4">
                <Card style={{ backgroundColor: isDark ? '#0f172a' : '#f9fafb', borderColor: theme.cardBorder }}>
                  <CardContent className="p-4">
                    <h4 className="font-bold text-sm mb-2 text-blue-600">✅ Ordens de Carregamento (IT-LOG-001)</h4>
                    <ul className="text-xs space-y-1 list-disc ml-4" style={{ color: theme.textMuted }}>
                      <li>Sempre vincule uma <strong>Operação</strong> (garante SLA correto)</li>
                      <li>Use <strong>edição inline</strong> para agilizar (80% mais rápido que formulário)</li>
                      <li>Preencha <strong>observações</strong> para facilitar passagem de turno</li>
                      <li>Use <strong>ofertas de carga</strong> para negociar com parceiros externos</li>
                      <li>Revise tipo de operação <strong>(CIF/FOB)</strong> antes de salvar</li>
                      <li>Vincule NFs logo na criação (evita retrabalho)</li>
                    </ul>
                  </CardContent>
                </Card>

                <Card style={{ backgroundColor: isDark ? '#0f172a' : '#f9fafb', borderColor: theme.cardBorder }}>
                  <CardContent className="p-4">
                    <h4 className="font-bold text-sm mb-2 text-purple-600">✅ Tracking (IT-LOG-002)</h4>
                    <ul className="text-xs space-y-1 list-disc ml-4" style={{ color: theme.textMuted }}>
                      <li>Atualize status <strong>assim que eventos ocorrem</strong> (não deixe acumular)</li>
                      <li>Use atalho <strong>"H"</strong> em datas para preencher hora atual instantaneamente</li>
                      <li>Registre ocorrências <strong>imediatamente</strong> ao identificar problemas</li>
                      <li>Mantenha <strong>comunicação ativa</strong> com motorista via chat</li>
                      <li>Anexe comprovantes assim que disponíveis</li>
                      <li>Monitore alertas de SLA (cards vermelhos = atenção!)</li>
                    </ul>
                  </CardContent>
                </Card>

                <Card style={{ backgroundColor: isDark ? '#0f172a' : '#f9fafb', borderColor: theme.cardBorder }}>
                  <CardContent className="p-4">
                    <h4 className="font-bold text-sm mb-2 text-red-600">✅ Ocorrências (IT-LOG-003)</h4>
                    <ul className="text-xs space-y-1 list-disc ml-4" style={{ color: theme.textMuted }}>
                      <li>Documente <strong>TODAS</strong> as ocorrências (mesmo resolvidas rápido)</li>
                      <li>Anexe <strong>evidências sempre</strong> (foto, email, autorização)</li>
                      <li>Trate dentro do <strong>prazo SLA</strong> do tipo</li>
                      <li>Para recorrências, faça <strong>análise de causa raiz</strong> (5 Porquês)</li>
                      <li>Registre <strong>lições aprendidas</strong> nas observações</li>
                      <li>Ocorrências críticas: <strong>escalar imediatamente</strong> para gestão</li>
                    </ul>
                  </CardContent>
                </Card>

                <Card style={{ backgroundColor: isDark ? '#0f172a' : '#f9fafb', borderColor: theme.cardBorder }}>
                  <CardContent className="p-4">
                    <h4 className="font-bold text-sm mb-2 text-green-600">✅ WMS (Armazém)</h4>
                    <ul className="text-xs space-y-1 list-disc ml-4" style={{ color: theme.textMuted }}>
                      <li>Sempre <strong>importe XML</strong> (evita 95% de erros de digitação)</li>
                      <li>Confira <strong>peso e volumes</strong> antes de finalizar recebimento</li>
                      <li>Use <strong>etiquetas mãe</strong> para agrupar volumes de mesma rota</li>
                      <li>Mantenha <strong>organização de endereçamento</strong> (A1, A2, B1...)</li>
                      <li>Imprima etiquetas <strong>imediatamente após recebimento</strong></li>
                      <li>Confira notas na expedição antes de liberar veículo</li>
                    </ul>
                  </CardContent>
                </Card>

                <Card style={{ backgroundColor: isDark ? '#0f172a' : '#f9fafb', borderColor: theme.cardBorder }}>
                  <CardContent className="p-4">
                    <h4 className="font-bold text-sm mb-2 text-orange-600">✅ Portal B2B (Coletas)</h4>
                    <ul className="text-xs space-y-1 list-disc ml-4" style={{ color: theme.textMuted }}>
                      <li><strong>Fornecedor:</strong> Solicite coletas com antecedência mínima de 24h</li>
                      <li><strong>Cliente:</strong> Aprove/reprove coletas em até 8h (evita atrasos)</li>
                      <li><strong>Operador:</strong> Monitore solicitações pendentes diariamente</li>
                      <li>Preencha TODOS os dados da coleta (evita rejeição)</li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* REFERÊNCIAS CRUZADAS */}
        <section className="print-page-break">
          <h3 className="text-lg font-bold mb-3" style={{ color: theme.text }}>REFERÊNCIAS CRUZADAS - DOCUMENTAÇÃO SGQ</h3>
          <table className="w-full text-xs border" style={{ borderColor: theme.cardBorder }}>
            <thead style={{ backgroundColor: isDark ? '#0f172a' : '#f3f4f6' }}>
              <tr>
                <th className="border p-2 text-left" style={{ borderColor: theme.cardBorder, color: theme.text }}>Módulo do Sistema</th>
                <th className="border p-2 text-left" style={{ borderColor: theme.cardBorder, color: theme.text }}>Documento de Referência</th>
                <th className="border p-2 text-left" style={{ borderColor: theme.cardBorder, color: theme.text }}>Seção do Manual</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>Ordens de Carregamento</td>
                <td className="border p-2 font-semibold" style={{ borderColor: theme.cardBorder, color: theme.text }}>IT-LOG-001</td>
                <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>Seção 6</td>
              </tr>
              <tr>
                <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>Tracking</td>
                <td className="border p-2 font-semibold" style={{ borderColor: theme.cardBorder, color: theme.text }}>IT-LOG-002</td>
                <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>Seção 7</td>
              </tr>
              <tr>
                <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>Ocorrências</td>
                <td className="border p-2 font-semibold" style={{ borderColor: theme.cardBorder, color: theme.text }}>IT-LOG-003</td>
                <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>Seção 9</td>
              </tr>
              <tr>
                <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>Todos os Processos</td>
                <td className="border p-2 font-semibold" style={{ borderColor: theme.cardBorder, color: theme.text }}>PO-LOG-001</td>
                <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>Todas</td>
              </tr>
              <tr>
                <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>Formulários de Preenchimento</td>
                <td className="border p-2 font-semibold" style={{ borderColor: theme.cardBorder, color: theme.text }}>FR-LOG-001</td>
                <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>-</td>
              </tr>
            </tbody>
          </table>
        </section>

        {/* SUPORTE */}
        <section>
          <h3 className="text-lg font-bold mb-3" style={{ color: theme.text }}>27. SUPORTE TÉCNICO</h3>
          <div className="space-y-3 text-sm" style={{ color: theme.textMuted }}>
            <div>
              <p className="font-semibold">27.1 Sistema de Chamados (Integrado):</p>
              <ol className="ml-6 list-decimal text-xs space-y-1">
                <li>Em QUALQUER tela, clique no botão flutuante <strong>"?"</strong> (canto inferior direito)</li>
                <li>Descreva seu problema ou dúvida</li>
                <li>Sistema identifica automaticamente a página de origem</li>
                <li>Chamado é criado e enviado ao suporte</li>
                <li>Você recebe email com número do chamado</li>
                <li>Acompanhe status em: Perfil → Meus Chamados</li>
              </ol>
            </div>

            <div>
              <p className="font-semibold">27.2 Níveis de Prioridade:</p>
              <ul className="ml-6 list-disc text-xs">
                <li><strong>Crítico:</strong> Sistema indisponível - SLA 2h</li>
                <li><strong>Alto:</strong> Funcionalidade não funciona - SLA 8h</li>
                <li><strong>Médio:</strong> Dúvida operacional - SLA 24h</li>
                <li><strong>Baixo:</strong> Sugestão de melhoria - SLA 72h</li>
              </ul>
            </div>

            <div>
              <p className="font-semibold">27.3 Canais Alternativos:</p>
              <ul className="ml-6 list-disc text-xs">
                <li>Email: suporte@logflow.com.br</li>
                <li>WhatsApp: (31) 9xxxx-xxxx (horário comercial)</li>
                <li>Documentação: Menu Admin → Procedimentos</li>
              </ul>
            </div>
          </div>
        </section>

        <div className="border-t pt-4 mt-8 text-xs text-center space-y-1" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>
          <p className="font-bold">Log Flow © 2024 - Gestão Logística Inteligente</p>
          <p>Versão 1.0 - Dezembro 2024</p>
          <p className="mt-2">Para suporte, utilize o sistema de chamados integrado ou consulte os procedimentos (IT/PO)</p>
        </div>
      </CardContent>
    </Card>
  );
}