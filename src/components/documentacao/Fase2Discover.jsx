import React from "react";

export default function Fase2Discover() {
  return (
    <section className="mb-10">
      <div className="bg-gray-800 text-white p-4 mb-4">
        <h2 className="text-lg font-bold uppercase">
          2. FASE DISCOVER - Identificação de Problemas, Pesquisa de Usuários e Escopo do MVP
        </h2>
      </div>

      <div className="space-y-6">
        <div className="bg-white p-5 rounded border border-gray-400">
          <h3 className="text-base font-bold text-gray-900 mb-3">2.1 Mapeamento Detalhado de Personas</h3>
          <p className="text-sm text-gray-800 leading-relaxed text-justify mb-3">
            Com base nos problemas identificados na Fase LAND, foram definidas quatro personas principais através de pesquisa primária com 29 participantes, observação participante em operações reais (96 horas acumuladas) e workshops de Design Thinking. A caracterização detalhada contempla perfil demográfico, objetivos, frustrações e necessidades tecnológicas, conforme Quadro 1 e Tabela 4.
          </p>
          <div className="overflow-x-auto mb-4">
            <p className="text-xs text-center font-bold text-gray-900 mb-2">Quadro 1 - Composição da Amostra de Pesquisa</p>
            <table className="w-full text-xs border-collapse border border-gray-400 mb-3">
              <thead className="bg-gray-200">
                <tr>
                  <th className="border border-gray-400 p-2 text-left">Perfil</th>
                  <th className="border border-gray-400 p-2 text-center">Quantidade</th>
                  <th className="border border-gray-400 p-2 text-left">Método de Pesquisa</th>
                  <th className="border border-gray-400 p-2 text-left">Duração Total</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-gray-400 p-2">Gestores de operações</td>
                  <td className="border border-gray-400 p-2 text-center">5</td>
                  <td className="border border-gray-400 p-2">Entrevista semiestruturada</td>
                  <td className="border border-gray-400 p-2">45 min cada (total: 225 min)</td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="border border-gray-400 p-2">Operadores logísticos</td>
                  <td className="border border-gray-400 p-2 text-center">12</td>
                  <td className="border border-gray-400 p-2">Entrevista + observação participante (shadowing)</td>
                  <td className="border border-gray-400 p-2">Entrevista 30 min + 8h observação cada</td>
                </tr>
                <tr>
                  <td className="border border-gray-400 p-2">Motoristas</td>
                  <td className="border border-gray-400 p-2 text-center">8</td>
                  <td className="border border-gray-400 p-2">2 grupos focais</td>
                  <td className="border border-gray-400 p-2">90 min cada grupo (total: 180 min)</td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="border border-gray-400 p-2">Clientes B2B</td>
                  <td className="border border-gray-400 p-2 text-center">4</td>
                  <td className="border border-gray-400 p-2">Entrevista em profundidade</td>
                  <td className="border border-gray-400 p-2">60 min cada (total: 240 min)</td>
                </tr>
              </tbody>
            </table>
            <p className="text-xs text-gray-600 italic">Fonte: Pesquisa primária agosto-novembro 2024</p>
          </div>

          <div className="overflow-x-auto">
            <p className="text-xs text-center font-bold text-gray-900 mb-2">Tabela 4 - Caracterização Detalhada de Personas</p>
            <table className="w-full text-xs border-collapse border border-gray-400">
              <thead className="bg-gray-200">
                <tr>
                  <th className="border border-gray-400 p-2 text-left" style={{width: '15%'}}>Persona</th>
                  <th className="border border-gray-400 p-2 text-left" style={{width: '20%'}}>Perfil Demográfico</th>
                  <th className="border border-gray-400 p-2 text-left" style={{width: '20%'}}>Objetivos Principais</th>
                  <th className="border border-gray-400 p-2 text-left" style={{width: '22%'}}>Frustrações e Dores</th>
                  <th className="border border-gray-400 p-2 text-left" style={{width: '23%'}}>Necessidades Tecnológicas</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-gray-400 p-2 font-bold">Gestor de Operações</td>
                  <td className="border border-gray-400 p-2">Idade: 35-50. Formação: Administração/Logística. Experiência: 10+ anos</td>
                  <td className="border border-gray-400 p-2">Garantir SLA 95%+, reduzir custos, gerenciar equipe 10-15 operadores, reportar KPIs</td>
                  <td className="border border-gray-400 p-2">Falta visibilidade consolidada, dependência ligações para status, sem métricas objetivas</td>
                  <td className="border border-gray-400 p-2">Dashboard executivo tempo real, alertas automáticos desvios, relatórios exportáveis</td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="border border-gray-400 p-2 font-bold">Operador Logístico</td>
                  <td className="border border-gray-400 p-2">Idade: 22-40. Formação: Médio a superior incompleto. Experiência: 1-5 anos</td>
                  <td className="border border-gray-400 p-2">Cadastrar ordens rapidamente, atualizar status, comunicar motoristas, resolver ocorrências</td>
                  <td className="border border-gray-400 p-2">Tempo excessivo em planilhas, retrabalho digitando, múltiplas ferramentas, sem reconhecimento</td>
                  <td className="border border-gray-400 p-2">Cadastro rápido autocomplete, importação PDFs/XMLs, chat integrado, gamificação</td>
                </tr>
                <tr>
                  <td className="border border-gray-400 p-2 font-bold">Motorista</td>
                  <td className="border border-gray-400 p-2">Idade: 28-55. Formação: Fundamental a médio. Experiência: 5-20 anos dirigindo</td>
                  <td className="border border-gray-400 p-2">Receber informações claras, atualizar status facilmente, comunicar problemas, receber pagamentos</td>
                  <td className="border border-gray-400 p-2">Comunicação fragmentada, múltiplas ligações, baixa familiaridade tecnologia, isolamento</td>
                  <td className="border border-gray-400 p-2">App simples (sem senha), acesso SMS, botões grandes, chat direto, upload câmera</td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="border border-gray-400 p-2 font-bold">Cliente/Fornecedor B2B</td>
                  <td className="border border-gray-400 p-2">Idade: 30-55. Formação: Superior. Cargo: Gerente Compras/Logística</td>
                  <td className="border border-gray-400 p-2">Rastrear entregas tempo real, solicitar coletas self-service, notificações proativas</td>
                  <td className="border border-gray-400 p-2">Dependência telefone consultas, processo coleta burocrático, falta transparência</td>
                  <td className="border border-gray-400 p-2">Portal auto-atendimento, solicitação coletas online, tracking mapa, notificações automáticas</td>
                </tr>
              </tbody>
            </table>
            <p className="text-xs text-gray-600 italic mt-2">Fonte: Pesquisa primária com 29 participantes (2024)</p>
          </div>
        </div>

        {/* Mapas de Empatia */}
        <div className="bg-white p-5 rounded border border-gray-400">
          <h3 className="text-base font-bold text-gray-900 mb-3">2.2 Mapas de Empatia das Personas Principais</h3>
          <p className="text-sm text-gray-800 leading-relaxed text-justify mb-3">
            Os mapas de empatia foram construídos mediante técnica de entrevista em profundidade, estruturados em quatro quadrantes (O que pensa/sente, O que vê, O que fala/faz, O que ouve), conforme Figuras 6 a 9.
          </p>

          {/* Mapa Operador */}
          <div className="bg-white p-4 rounded border border-gray-400 mb-4">
            <p className="text-xs text-center font-bold text-gray-900 mb-3">Figura 6 - Mapa de Empatia: Operador Logístico</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white p-3 rounded border-2 border-gray-400">
                <p className="font-bold text-xs text-gray-900 mb-2">PENSAMENTOS E SENTIMENTOS</p>
                <ul className="text-xs text-gray-800 space-y-1">
                  <li>• Necessidade de maior agilidade operacional</li>
                  <li>• Preocupação com esquecimento de planilhas</li>
                  <li>• Ausência de reconhecimento profissional</li>
                  <li>• Receio de cometer erros críticos</li>
                </ul>
              </div>
              <div className="bg-white p-3 rounded border-2 border-gray-400">
                <p className="font-bold text-xs text-gray-900 mb-2">OBSERVAÇÕES DO AMBIENTE</p>
                <ul className="text-xs text-gray-800 space-y-1">
                  <li>• Múltiplas planilhas abertas simultaneamente</li>
                  <li>• Comunicação via WhatsApp desorganizada</li>
                  <li>• Interrupções constantes via telefone</li>
                  <li>• Processos heterogêneos entre colegas</li>
                </ul>
              </div>
              <div className="bg-white p-3 rounded border-2 border-gray-400">
                <p className="font-bold text-xs text-gray-900 mb-2">AÇÕES E COMPORTAMENTOS</p>
                <ul className="text-xs text-gray-800 space-y-1">
                  <li>• Realiza 5-10 ligações diárias por motorista</li>
                  <li>• Redigitação repetitiva de dados</li>
                  <li>• Alternância entre ferramentas distintas</li>
                  <li>• Reconstrução de informações perdidas</li>
                </ul>
              </div>
              <div className="bg-white p-3 rounded border-2 border-gray-400">
                <p className="font-bold text-xs text-gray-900 mb-2">INPUTS EXTERNOS RECEBIDOS</p>
                <ul className="text-xs text-gray-800 space-y-1">
                  <li>• Pressão gestores por localização de cargas</li>
                  <li>• Reclamações clientes sobre atrasos</li>
                  <li>• Solicitações suporte de motoristas</li>
                  <li>• Questionamentos outros departamentos</li>
                </ul>
              </div>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <div className="bg-white p-3 rounded border-2 border-gray-500">
                <p className="font-bold text-xs text-gray-900 mb-1">DOR PRINCIPAL:</p>
                <p className="text-xs text-gray-800">Tempo perdido em busca de informações fragmentadas, sem reconhecimento objetivo por desempenho</p>
              </div>
              <div className="bg-white p-3 rounded border-2 border-gray-500">
                <p className="font-bold text-xs text-gray-900 mb-1">GANHO DESEJADO:</p>
                <p className="text-xs text-gray-800">Sistema unificado, feedback constante de performance, reconhecimento meritocrático</p>
              </div>
            </div>
          </div>

          {/* Mapa Motorista */}
          <div className="bg-white p-4 rounded border border-gray-400 mb-4">
            <p className="text-xs text-center font-bold text-gray-900 mb-3">Figura 7 - Mapa de Empatia: Motorista</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white p-3 rounded border-2 border-gray-400">
                <p className="font-bold text-xs text-gray-900 mb-2">PENSAMENTOS E SENTIMENTOS</p>
                <ul className="text-xs text-gray-800 space-y-1">
                  <li>• Resistência a tecnologias complexas</li>
                  <li>• Sensação de isolamento profissional</li>
                  <li>• Percepção de desvalorização do trabalho</li>
                  <li>• Necessidade de comprovação de entregas</li>
                </ul>
              </div>
              <div className="bg-white p-3 rounded border-2 border-gray-400">
                <p className="font-bold text-xs text-gray-900 mb-2">OBSERVAÇÕES DO AMBIENTE</p>
                <ul className="text-xs text-gray-800 space-y-1">
                  <li>• Aplicativos com interfaces sobrecarregadas</li>
                  <li>• Prazos rigorosos sem reconhecimento</li>
                  <li>• Comunicação insuficiente da central</li>
                  <li>• Ausência de suporte para problemas</li>
                </ul>
              </div>
              <div className="bg-white p-3 rounded border-2 border-gray-400">
                <p className="font-bold text-xs text-gray-900 mb-2">AÇÕES E COMPORTAMENTOS</p>
                <ul className="text-xs text-gray-800 space-y-1">
                  <li>• Contato telefônico frequente com central</li>
                  <li>• Envio de evidências via canais informais</li>
                  <li>• Solicitações repetitivas de informações</li>
                  <li>• Arquivamento físico de documentos</li>
                </ul>
              </div>
              <div className="bg-white p-3 rounded border-2 border-gray-400">
                <p className="font-bold text-xs text-gray-900 mb-2">INPUTS EXTERNOS RECEBIDOS</p>
                <ul className="text-xs text-gray-800 space-y-1">
                  <li>• Pressão constante sobre cumprimento prazos</li>
                  <li>• Solicitações recorrentes de evidências</li>
                  <li>• Respostas evasivas da central</li>
                  <li>• Atribuição de responsabilidade unilateral</li>
                </ul>
              </div>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <div className="bg-white p-3 rounded border-2 border-gray-500">
                <p className="font-bold text-xs text-gray-900 mb-1">DOR PRINCIPAL:</p>
                <p className="text-xs text-gray-800">Isolamento operacional, comunicação fragmentada, ferramentas complexas, falta reconhecimento</p>
              </div>
              <div className="bg-white p-3 rounded border-2 border-gray-500">
                <p className="font-bold text-xs text-gray-900 mb-1">GANHO DESEJADO:</p>
                <p className="text-xs text-gray-800">App extremamente simples, acesso fácil sem senha, comunicação direta, reconhecimento por bom desempenho</p>
              </div>
            </div>
          </div>

          {/* Mapa Fornecedor */}
          <div className="bg-white p-4 rounded border border-gray-400 mb-4">
            <p className="text-xs text-center font-bold text-gray-900 mb-3">Figura 8 - Mapa de Empatia: Fornecedor B2B</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white p-3 rounded border-2 border-gray-400">
                <p className="font-bold text-xs text-gray-900 mb-2">PENSAMENTOS E SENTIMENTOS</p>
                <ul className="text-xs text-gray-800 space-y-1">
                  <li>• Necessidade de agilização de entregas</li>
                  <li>• Percepção de excesso burocrático</li>
                  <li>• Ausência de visibilidade de status</li>
                  <li>• Dependência de comunicação telefônica</li>
                </ul>
              </div>
              <div className="bg-white p-3 rounded border-2 border-gray-400">
                <p className="font-bold text-xs text-gray-900 mb-2">OBSERVAÇÕES DO AMBIENTE</p>
                <ul className="text-xs text-gray-800 space-y-1">
                  <li>• Processos manuais excessivamente lentos</li>
                  <li>• Múltiplos canais de comunicação</li>
                  <li>• Opacidade informacional</li>
                  <li>• Atrasos sem justificativas formais</li>
                </ul>
              </div>
              <div className="bg-white p-3 rounded border-2 border-gray-400">
                <p className="font-bold text-xs text-gray-900 mb-2">AÇÕES E COMPORTAMENTOS</p>
                <ul className="text-xs text-gray-800 space-y-1">
                  <li>• Consultas telefônicas repetitivas sobre status</li>
                  <li>• Transmissão de XMLs via correio eletrônico</li>
                  <li>• Preenchimento de formulários redundantes</li>
                  <li>• Espera prolongada por confirmações</li>
                </ul>
              </div>
              <div className="bg-white p-3 rounded border-2 border-gray-400">
                <p className="font-bold text-xs text-gray-900 mb-2">INPUTS EXTERNOS RECEBIDOS</p>
                <ul className="text-xs text-gray-800 space-y-1">
                  <li>• Notificação de pendências de aprovação</li>
                  <li>• Ausência de previsibilidade temporal</li>
                  <li>• Solicitações de documentação adicional</li>
                  <li>• Promessas de retorno não cumpridas</li>
                </ul>
              </div>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <div className="bg-white p-3 rounded border-2 border-gray-500">
                <p className="font-bold text-xs text-gray-900 mb-1">DOR PRINCIPAL:</p>
                <p className="text-xs text-gray-800">Processo burocrático de solicitação, falta de transparência, dependência de ligações, tempo excessivo de aprovação</p>
              </div>
              <div className="bg-white p-3 rounded border-2 border-gray-500">
                <p className="font-bold text-xs text-gray-900 mb-1">GANHO DESEJADO:</p>
                <p className="text-xs text-gray-800">Portal self-service para solicitar coletas, rastreamento em tempo real, aprovação rápida, notificações automáticas</p>
              </div>
            </div>
          </div>

          {/* Mapa Cliente */}
          <div className="bg-white p-4 rounded border border-gray-400">
            <p className="text-xs text-center font-bold text-gray-900 mb-3">Figura 9 - Mapa de Empatia: Cliente B2B</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white p-3 rounded border-2 border-gray-400">
                <p className="font-bold text-xs text-gray-900 mb-2">PENSAMENTOS E SENTIMENTOS</p>
                <ul className="text-xs text-gray-800 space-y-1">
                  <li>• Necessidade de rastreabilidade de cargas</li>
                  <li>• Limitação de disponibilidade para consultas</li>
                  <li>• Urgência em processos de aprovação</li>
                  <li>• Preocupação com interrupções produtivas</li>
                </ul>
              </div>
              <div className="bg-white p-3 rounded border-2 border-gray-400">
                <p className="font-bold text-xs text-gray-900 mb-2">OBSERVAÇÕES DO AMBIENTE</p>
                <ul className="text-xs text-gray-800 space-y-1">
                  <li>• Volume elevado de solicitações simultâneas</li>
                  <li>• Comunicações eletrônicas fragmentadas</li>
                  <li>• Ausência de informação em tempo real</li>
                  <li>• Pressão de fornecedores por retorno</li>
                </ul>
              </div>
              <div className="bg-white p-3 rounded border-2 border-gray-400">
                <p className="font-bold text-xs text-gray-900 mb-2">AÇÕES E COMPORTAMENTOS</p>
                <ul className="text-xs text-gray-800 space-y-1">
                  <li>• Consultas telefônicas à transportadora</li>
                  <li>• Aprovação/reprovação via correio eletrônico</li>
                  <li>• Verificação manual em planilhas internas</li>
                  <li>• Demandas a fornecedores por informações</li>
                </ul>
              </div>
              <div className="bg-white p-3 rounded border-2 border-gray-400">
                <p className="font-bold text-xs text-gray-900 mb-2">INPUTS EXTERNOS RECEBIDOS</p>
                <ul className="text-xs text-gray-800 space-y-1">
                  <li>• Questionamentos de fornecedores sobre status</li>
                  <li>• Pressão interna por agilidade</li>
                  <li>• Respostas imprecisas de transportadoras</li>
                  <li>• Cobranças de clientes finais</li>
                </ul>
              </div>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <div className="bg-white p-3 rounded border-2 border-gray-500">
                <p className="font-bold text-xs text-gray-900 mb-1">DOR PRINCIPAL:</p>
                <p className="text-xs text-gray-800">Falta de rastreabilidade em tempo real, processo manual de aprovação, dependência de comunicação telefônica, ansiedade por informações</p>
              </div>
              <div className="bg-white p-3 rounded border-2 border-gray-500">
                <p className="font-bold text-xs text-gray-900 mb-1">GANHO DESEJADO:</p>
                <p className="text-xs text-gray-800">Portal de aprovações online, tracking automático, notificações proativas, dashboard consolidado de todas entregas</p>
              </div>
            </div>
          </div>
        </div>

        {/* Arquitetura de Integração */}
        <div className="bg-white p-5 rounded border border-gray-400">
          <h3 className="text-base font-bold text-gray-900 mb-3">2.2 Contexto Empresarial e Modelo de Negócio</h3>
          <p className="text-sm text-gray-800 leading-relaxed text-justify mb-3">
            A LAF LOGÍSTICA (CNPJ 34.579.341/0001-85), fundada por Leonardo Silva Bandeira (CPF 042.332.453-52), atua desde 2018 no segmento de consultoria e desenvolvimento de soluções tecnológicas para o setor de transporte rodoviário de cargas, com sede em São Paulo e atuação regional nas regiões Sul e Sudeste do Brasil. A empresa especializa-se em <strong>mapeamento de processos logísticos manuais</strong> e sua <strong>transformação em sistemas digitais integrados</strong> com indicadores de performance mensuráveis, atendendo principalmente transportadoras de médio porte que buscam modernização operacional e ganhos de eficiência.
          </p>
          <p className="text-sm text-gray-800 leading-relaxed text-justify mb-3">
            <strong>Modelo de negócio:</strong> A LAF oferece serviços de consultoria especializada que combinam (i) mapeamento e documentação de processos operacionais existentes mediante técnicas de BPM (Business Process Management), (ii) identificação de gargalos e oportunidades de automação através de análise de fluxo de valor, (iii) desenvolvimento de software sob medida que digitaliza os processos mapeados, implementando controles, validações e métricas de SLA automatizadas, (iv) treinamento de equipes operacionais para adoção das novas ferramentas e (v) suporte contínuo com ciclos de melhoria baseados em dados coletados pelo sistema.
          </p>
          <p className="text-sm text-gray-800 leading-relaxed text-justify mb-3">
            <strong>Posicionamento em termos de inovação:</strong> A LAF LOGÍSTICA posiciona-se como parceira estratégica de transformação digital para transportadoras, diferenciando-se de consultorias tradicionais (que apenas mapeiam processos sem implementar soluções) e de fornecedores de software genérico (que oferecem produtos padronizados sem personalização). O diferencial competitivo fundamenta-se na <strong>combinação única de expertise logística com capacidade de desenvolvimento ágil de software</strong>, permitindo criação de soluções que refletem fielmente os processos reais das operações de transporte, ao invés de forçar adaptação a ferramentas genéricas. A iniciativa do sistema próprio representa evolução natural do core business: transformar conhecimento tácito de processos manuais em plataformas tecnológicas escaláveis que promovem visibilidade, padronização e cultura de excelência através de métricas objetivas.
          </p>
        </div>

        <div className="bg-white p-5 rounded border border-gray-400">
          <h3 className="text-base font-bold text-gray-900 mb-3">2.3 Arquitetura de Integração Entre Módulos</h3>
          <p className="text-sm text-gray-800 leading-relaxed text-justify mb-3">
            A arquitetura do sistema foi projetada para garantir integração total entre módulos, com compartilhamento de dados em tempo real, conforme ilustrado na Figura 14.
          </p>
          
          <div className="bg-gray-50 p-6 rounded border border-gray-300">
            <div className="bg-white p-4 rounded border border-gray-400">
              <p className="text-xs text-center font-bold text-gray-900 mb-4">Figura 14 - Arquitetura de Módulos e Fluxo de Integração</p>
              
              {/* Camada 1 - Núcleo */}
              <div className="mb-4">
                <div className="bg-gray-800 text-white px-6 py-3 rounded border-2 border-gray-900 text-center mx-auto" style={{maxWidth: '400px'}}>
                  <p className="font-bold text-sm">CAMADA 1 - NÚCLEO</p>
                  <p className="text-xs mt-1">Base44 Platform (Auth + Database + API REST)</p>
                </div>
              </div>

              {/* Setas descendo */}
              <div className="text-center mb-2">
                <p className="text-gray-600">↓</p>
              </div>

              {/* Camada 2 - Módulos Principais */}
              <div className="mb-4">
                <p className="text-xs font-bold text-gray-900 text-center mb-2">CAMADA 2 - MÓDULOS PRINCIPAIS</p>
                <div className="grid grid-cols-4 gap-2">
                  <div className="bg-gray-100 px-3 py-2 rounded border border-gray-400 text-center">
                    <p className="text-xs font-bold text-gray-900">Dashboard</p>
                  </div>
                  <div className="bg-gray-100 px-3 py-2 rounded border border-gray-400 text-center">
                    <p className="text-xs font-bold text-gray-900">Ordens</p>
                  </div>
                  <div className="bg-gray-100 px-3 py-2 rounded border border-gray-400 text-center">
                    <p className="text-xs font-bold text-gray-900">Tracking</p>
                  </div>
                  <div className="bg-gray-100 px-3 py-2 rounded border border-gray-400 text-center">
                    <p className="text-xs font-bold text-gray-900">Fluxo</p>
                  </div>
                </div>
              </div>

              {/* Setas descendo */}
              <div className="text-center mb-2">
                <p className="text-gray-600">↓</p>
              </div>

              {/* Camada 3 - Módulos de Suporte */}
              <div className="mb-4">
                <p className="text-xs font-bold text-gray-900 text-center mb-2">CAMADA 3 - MÓDULOS DE SUPORTE</p>
                <div className="grid grid-cols-5 gap-2">
                  <div className="bg-gray-100 px-2 py-2 rounded border border-gray-400 text-center">
                    <p className="text-xs font-bold text-gray-900">Ocorrências</p>
                  </div>
                  <div className="bg-gray-100 px-2 py-2 rounded border border-gray-400 text-center">
                    <p className="text-xs font-bold text-gray-900">Gamificação</p>
                  </div>
                  <div className="bg-gray-100 px-2 py-2 rounded border border-gray-400 text-center">
                    <p className="text-xs font-bold text-gray-900">Coletas</p>
                  </div>
                  <div className="bg-gray-100 px-2 py-2 rounded border border-gray-400 text-center">
                    <p className="text-xs font-bold text-gray-900">Armazém</p>
                  </div>
                  <div className="bg-gray-100 px-2 py-2 rounded border border-gray-400 text-center">
                    <p className="text-xs font-bold text-gray-900">SAC/Chat</p>
                  </div>
                </div>
              </div>

              {/* Setas descendo */}
              <div className="text-center mb-2">
                <p className="text-gray-600">↓</p>
              </div>

              {/* Camada 4 - Cadastros Base */}
              <div className="mb-4">
                <p className="text-xs font-bold text-gray-900 text-center mb-2">CAMADA 4 - CADASTROS BASE</p>
                <div className="grid grid-cols-4 gap-2">
                  <div className="bg-gray-100 px-3 py-2 rounded border border-gray-400 text-center">
                    <p className="text-xs font-bold text-gray-900">Motoristas</p>
                  </div>
                  <div className="bg-gray-100 px-3 py-2 rounded border border-gray-400 text-center">
                    <p className="text-xs font-bold text-gray-900">Veículos</p>
                  </div>
                  <div className="bg-gray-100 px-3 py-2 rounded border border-gray-400 text-center">
                    <p className="text-xs font-bold text-gray-900">Operações</p>
                  </div>
                  <div className="bg-gray-100 px-3 py-2 rounded border border-gray-400 text-center">
                    <p className="text-xs font-bold text-gray-900">Parceiros</p>
                  </div>
                </div>
              </div>

              <p className="text-xs text-gray-600 mt-3 text-center italic">Fonte: Arquitetura do sistema elaborada pelo autor (2024)</p>
            </div>

            <div className="bg-white p-4 rounded border border-gray-300 mt-4">
              <h4 className="text-sm font-bold text-gray-900 mb-3">Fluxo de Integração Entre Módulos</h4>
              <div className="text-xs text-gray-800 space-y-1">
                <p>• Dashboard obtém dados agregados de Ordens, Tracking e Ocorrências para cálculo de métricas em tempo real;</p>
                <p>• Ordens alimenta módulo Tracking com atualizações de status da viagem;</p>
                <p>• Ordens alimenta módulo Fluxo com informações de etapas processuais internas;</p>
                <p>• Tracking e Fluxo registram Ocorrências quando identificados problemas ou desvios;</p>
                <p>• Ocorrências impactam sistema de Gamificação através de penalidades no cálculo de SLA;</p>
                <p>• Fluxo concede pontos de Gamificação mediante conclusão de etapas;</p>
                <p>• Portal de Coletas cria automaticamente Ordens após processo de aprovação;</p>
                <p>• WMS (Armazém) vincula Notas Fiscais às Ordens nos processos de recebimento e expedição.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Mapeamento de Jornadas */}
        <div className="bg-white p-5 rounded border border-gray-400">
          <h3 className="text-base font-bold text-gray-900 mb-3">2.4 Mapeamento de Jornadas de Usuários</h3>
          <p className="text-sm text-gray-800 leading-relaxed text-justify mb-3">
            As jornadas de usuários foram mapeadas para cada persona identificada, documentando os pontos de contato com o sistema e as interações principais, conforme descrito nas Figuras 10 a 13.
          </p>

          {/* Jornada Operador */}
          <div className="bg-white p-4 rounded border border-gray-400 mb-4">
            <p className="text-xs text-center font-bold text-gray-900 mb-3">Figura 10 - Jornada do Operador Logístico</p>
            <div className="grid grid-cols-6 gap-2 mb-3">
              <div className="bg-gray-100 px-3 py-2 rounded border border-gray-400 text-center">
                <p className="font-bold text-xs text-gray-900 mb-1">Etapa 1</p>
                <p className="text-xs text-gray-700">Login</p>
              </div>
              <div className="bg-gray-100 px-3 py-2 rounded border border-gray-400 text-center">
                <p className="font-bold text-xs text-gray-900 mb-1">Etapa 2</p>
                <p className="text-xs text-gray-700">Dashboard</p>
              </div>
              <div className="bg-gray-100 px-3 py-2 rounded border border-gray-400 text-center">
                <p className="font-bold text-xs text-gray-900 mb-1">Etapa 3</p>
                <p className="text-xs text-gray-700">Criar Ordem</p>
              </div>
              <div className="bg-gray-100 px-3 py-2 rounded border border-gray-400 text-center">
                <p className="font-bold text-xs text-gray-900 mb-1">Etapa 4</p>
                <p className="text-xs text-gray-700">Tracking</p>
              </div>
              <div className="bg-gray-100 px-3 py-2 rounded border border-gray-400 text-center">
                <p className="font-bold text-xs text-gray-900 mb-1">Etapa 5</p>
                <p className="text-xs text-gray-700">Fluxo</p>
              </div>
              <div className="bg-gray-100 px-3 py-2 rounded border border-gray-400 text-center">
                <p className="font-bold text-xs text-gray-900 mb-1">Etapa 6</p>
                <p className="text-xs text-gray-700">Ocorrências</p>
              </div>
            </div>
            <p className="text-xs text-gray-800 leading-relaxed text-justify">
              O operador logístico realiza autenticação no sistema e acessa o painel Dashboard para visualização consolidada das operações. Subsequentemente, executa criação ou edição de ordens de carregamento (modalidade completa ou oferta), atualiza status de tracking manualmente ou através de sincronização com aplicativo móvel do motorista, gerencia etapas do workflow processual, registra e resolve ocorrências operacionais, e analisa métricas de SLA e indicadores de performance individual.
            </p>
            <p className="text-xs text-gray-600 italic mt-2">Fonte: Mapeamento de jornada realizado pelo autor (2024)</p>
          </div>

          {/* Jornada Fornecedor */}
          <div className="bg-white p-4 rounded border border-gray-400 mb-4">
            <p className="text-xs text-center font-bold text-gray-900 mb-3">Figura 11 - Jornada do Fornecedor</p>
            <div className="grid grid-cols-5 gap-2 mb-3">
              <div className="bg-gray-100 px-3 py-2 rounded border border-gray-400 text-center">
                <p className="font-bold text-xs text-gray-900 mb-1">Etapa 1</p>
                <p className="text-xs text-gray-700">Cadastro</p>
              </div>
              <div className="bg-gray-100 px-3 py-2 rounded border border-gray-400 text-center">
                <p className="font-bold text-xs text-gray-900 mb-1">Etapa 2</p>
                <p className="text-xs text-gray-700">Login</p>
              </div>
              <div className="bg-gray-100 px-3 py-2 rounded border border-gray-400 text-center">
                <p className="font-bold text-xs text-gray-900 mb-1">Etapa 3</p>
                <p className="text-xs text-gray-700">Solicitar Coleta</p>
              </div>
              <div className="bg-gray-100 px-3 py-2 rounded border border-gray-400 text-center">
                <p className="font-bold text-xs text-gray-900 mb-1">Etapa 4</p>
                <p className="text-xs text-gray-700">Aguardar Aprovação</p>
              </div>
              <div className="bg-gray-100 px-3 py-2 rounded border border-gray-400 text-center">
                <p className="font-bold text-xs text-gray-900 mb-1">Etapa 5</p>
                <p className="text-xs text-gray-700">Acompanhar</p>
              </div>
            </div>
            <p className="text-xs text-gray-800 leading-relaxed text-justify">
              O fornecedor realiza cadastro no sistema através de interface pública e aguarda processo de aprovação administrativa. Após autorização, acessa portal específico de coletas, onde solicita serviços informando dados de remetente e destinatário e anexando arquivos XML de notas fiscais. A solicitação é encaminhada ao cliente para processo de aprovação ou reprovação. Uma vez aprovada, a solicitação é convertida automaticamente em ordem de carregamento, permitindo ao fornecedor acompanhar o status em tempo real.
            </p>
            <p className="text-xs text-gray-600 italic mt-2">Fonte: Mapeamento de jornada realizado pelo autor (2024)</p>
          </div>

          {/* Jornada do Cliente */}
          <div className="bg-white p-4 rounded border border-gray-400 mb-4">
            <p className="text-xs text-center font-bold text-gray-900 mb-3">Figura 12 - Jornada do Cliente</p>
            <div className="grid grid-cols-4 gap-2 mb-3">
              <div className="bg-gray-100 px-3 py-2 rounded border border-gray-400 text-center">
                <p className="font-bold text-xs text-gray-900 mb-1">Etapa 1</p>
                <p className="text-xs text-gray-700">Cadastro</p>
              </div>
              <div className="bg-gray-100 px-3 py-2 rounded border border-gray-400 text-center">
                <p className="font-bold text-xs text-gray-900 mb-1">Etapa 2</p>
                <p className="text-xs text-gray-700">Login</p>
              </div>
              <div className="bg-gray-100 px-3 py-2 rounded border border-gray-400 text-center">
                <p className="font-bold text-xs text-gray-900 mb-1">Etapa 3</p>
                <p className="text-xs text-gray-700">Aprovar Coletas</p>
              </div>
              <div className="bg-gray-100 px-3 py-2 rounded border border-gray-400 text-center">
                <p className="font-bold text-xs text-gray-900 mb-1">Etapa 4</p>
                <p className="text-xs text-gray-700">Acompanhar</p>
              </div>
            </div>
            <p className="text-xs text-gray-800 leading-relaxed text-justify">
              O cliente realiza cadastro no sistema através de interface pública e aguarda processo de aprovação administrativa. Após autorização, acessa portal de aprovações para análise de solicitações de coleta enviadas por fornecedores, podendo aprová-las ou reprová-las com justificativa. Subsequentemente, visualiza ordens ativas destinadas ao seu CNPJ e acompanha o tracking em tempo real.
            </p>
            <p className="text-xs text-gray-600 mt-2 text-center italic">Fonte: Mapeamento de jornada realizado pelo autor (2024)</p>
          </div>

          {/* Jornada do Motorista */}
          <div className="bg-white p-4 rounded border border-gray-400">
            <p className="text-xs text-center font-bold text-gray-900 mb-3">Figura 13 - Jornada do Motorista</p>
            <div className="grid grid-cols-5 gap-2 mb-3">
              <div className="bg-gray-100 px-3 py-2 rounded border border-gray-400 text-center">
                <p className="font-bold text-xs text-gray-900 mb-1">Etapa 1</p>
                <p className="text-xs text-gray-700">Cadastro</p>
              </div>
              <div className="bg-gray-100 px-3 py-2 rounded border border-gray-400 text-center">
                <p className="font-bold text-xs text-gray-900 mb-1">Etapa 2</p>
                <p className="text-xs text-gray-700">Acesso SMS</p>
              </div>
              <div className="bg-gray-100 px-3 py-2 rounded border border-gray-400 text-center">
                <p className="font-bold text-xs text-gray-900 mb-1">Etapa 3</p>
                <p className="text-xs text-gray-700">Viagens</p>
              </div>
              <div className="bg-gray-100 px-3 py-2 rounded border border-gray-400 text-center">
                <p className="font-bold text-xs text-gray-900 mb-1">Etapa 4</p>
                <p className="text-xs text-gray-700">Atualizar Status</p>
              </div>
              <div className="bg-gray-100 px-3 py-2 rounded border border-gray-400 text-center">
                <p className="font-bold text-xs text-gray-900 mb-1">Etapa 5</p>
                <p className="text-xs text-gray-700">Upload Docs</p>
              </div>
            </div>
            <p className="text-xs text-gray-800 leading-relaxed text-justify">
              O motorista recebe mensagem SMS contendo link de acesso temporário ao aplicativo móvel. Após autenticação, visualiza lista de viagens atribuídas, atualiza status da operação através de interface simplificada (em carregamento, em viagem, chegada ao destino), realiza upload de documentos obrigatórios (comprovante de entrega, fotografias da carga, CT-e eletrônico) e mantém comunicação bidirecional com a central operacional através de sistema de chat integrado.
            </p>
            <p className="text-xs text-gray-600 mt-2 text-center italic">Fonte: Mapeamento de jornada realizado pelo autor (2024)</p>
          </div>
        </div>

        {/* Benchmarking */}
        <div className="bg-white p-5 rounded border border-gray-400">
          <h3 className="text-base font-bold text-gray-900 mb-3">2.5 Benchmarking Competitivo</h3>
          <p className="text-sm text-gray-800 leading-relaxed text-justify mb-3">
            A análise comparativa contemplou os principais concorrentes do mercado nacional de TMS, validando o posicionamento diferenciado da solução proposta. Foram analisados cinco competidores diretos (Drivin, Intelipost, Fretebras TMS, TOTVS TMS e LogComex) mediante pesquisa desk, análise de websites corporativos e entrevistas com usuários.
          </p>
          <div className="overflow-x-auto">
            <p className="text-xs text-center font-bold text-gray-900 mb-2">Tabela 2 - Análise Comparativa de Funcionalidades vs. Concorrência</p>
            <table className="w-full text-xs border-collapse border border-gray-400">
              <thead className="bg-gray-200">
                <tr>
                  <th className="border border-gray-400 p-2 text-left">Funcionalidade</th>
                  <th className="border border-gray-400 p-2 text-center">Sistema Proposto</th>
                  <th className="border border-gray-400 p-2 text-center">Drivin</th>
                  <th className="border border-gray-400 p-2 text-center">Intelipost</th>
                  <th className="border border-gray-400 p-2 text-center">Fretebras TMS</th>
                  <th className="border border-gray-400 p-2 text-center">TOTVS TMS</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-gray-400 p-2">Workflow BPMN customizável</td>
                  <td className="border border-gray-400 p-2 text-center font-bold text-green-700">Completo ✓</td>
                  <td className="border border-gray-400 p-2 text-center text-orange-700">Parcial ~</td>
                  <td className="border border-gray-400 p-2 text-center text-red-700">Não ✗</td>
                  <td className="border border-gray-400 p-2 text-center text-orange-700">Parcial ~</td>
                  <td className="border border-gray-400 p-2 text-center text-orange-700">Parcial ~</td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="border border-gray-400 p-2">Sistema de gamificação integrado</td>
                  <td className="border border-gray-400 p-2 text-center font-bold text-green-700">Completo ✓</td>
                  <td className="border border-gray-400 p-2 text-center text-red-700">Não ✗</td>
                  <td className="border border-gray-400 p-2 text-center text-red-700">Não ✗</td>
                  <td className="border border-gray-400 p-2 text-center text-red-700">Não ✗</td>
                  <td className="border border-gray-400 p-2 text-center text-red-700">Não ✗</td>
                </tr>
                <tr>
                  <td className="border border-gray-400 p-2">Gestão estruturada de ocorrências</td>
                  <td className="border border-gray-400 p-2 text-center font-bold text-green-700">Completo ✓</td>
                  <td className="border border-gray-400 p-2 text-center font-bold text-green-700">Completo ✓</td>
                  <td className="border border-gray-400 p-2 text-center text-orange-700">Básico ~</td>
                  <td className="border border-gray-400 p-2 text-center text-orange-700">Básico ~</td>
                  <td className="border border-gray-400 p-2 text-center font-bold text-green-700">Completo ✓</td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="border border-gray-400 p-2">Aplicativo para motorista</td>
                  <td className="border border-gray-400 p-2 text-center font-bold text-green-700">Completo ✓</td>
                  <td className="border border-gray-400 p-2 text-center font-bold text-green-700">Completo ✓</td>
                  <td className="border border-gray-400 p-2 text-center font-bold text-green-700">Completo ✓</td>
                  <td className="border border-gray-400 p-2 text-center text-orange-700">Básico ~</td>
                  <td className="border border-gray-400 p-2 text-center font-bold text-green-700">Completo ✓</td>
                </tr>
                <tr>
                  <td className="border border-gray-400 p-2">WMS (Warehouse Management)</td>
                  <td className="border border-gray-400 p-2 text-center font-bold text-green-700">Completo ✓</td>
                  <td className="border border-gray-400 p-2 text-center text-red-700">Não ✗</td>
                  <td className="border border-gray-400 p-2 text-center text-red-700">Não ✗</td>
                  <td className="border border-gray-400 p-2 text-center text-red-700">Não ✗</td>
                  <td className="border border-gray-400 p-2 text-center text-orange-700">Parcial ~</td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="border border-gray-400 p-2">Portal B2B (fornecedores/clientes)</td>
                  <td className="border border-gray-400 p-2 text-center font-bold text-green-700">Completo ✓</td>
                  <td className="border border-gray-400 p-2 text-center text-red-700">Não ✗</td>
                  <td className="border border-gray-400 p-2 text-center text-orange-700">Básico ~</td>
                  <td className="border border-gray-400 p-2 text-center text-orange-700">Básico ~</td>
                  <td className="border border-gray-400 p-2 text-center text-red-700">Não ✗</td>
                </tr>
                <tr>
                  <td className="border border-gray-400 p-2">Importação automática (OCR/XML)</td>
                  <td className="border border-gray-400 p-2 text-center font-bold text-green-700">Completo ✓</td>
                  <td className="border border-gray-400 p-2 text-center text-orange-700">Parcial ~</td>
                  <td className="border border-gray-400 p-2 text-center text-orange-700">Parcial ~</td>
                  <td className="border border-gray-400 p-2 text-center text-red-700">Não ✗</td>
                  <td className="border border-gray-400 p-2 text-center font-bold text-green-700">Completo ✓</td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="border border-gray-400 p-2">Rastreamento em tempo real</td>
                  <td className="border border-gray-400 p-2 text-center text-orange-700">Roadmap Q2/25 ~</td>
                  <td className="border border-gray-400 p-2 text-center font-bold text-green-700">Completo ✓</td>
                  <td className="border border-gray-400 p-2 text-center font-bold text-green-700">Completo ✓</td>
                  <td className="border border-gray-400 p-2 text-center text-orange-700">Parcial ~</td>
                  <td className="border border-gray-400 p-2 text-center font-bold text-green-700">Completo ✓</td>
                </tr>
                <tr>
                  <td className="border border-gray-400 p-2">Roteirização inteligente</td>
                  <td className="border border-gray-400 p-2 text-center text-orange-700">Roadmap 2026 ~</td>
                  <td className="border border-gray-400 p-2 text-center font-bold text-green-700">Completo ✓</td>
                  <td className="border border-gray-400 p-2 text-center font-bold text-green-700">Completo ✓</td>
                  <td className="border border-gray-400 p-2 text-center text-orange-700">Básico ~</td>
                  <td className="border border-gray-400 p-2 text-center font-bold text-green-700">Completo ✓</td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="border border-gray-400 p-2">Certificação ISO 27001</td>
                  <td className="border border-gray-400 p-2 text-center text-orange-700">Roadmap 2026 ~</td>
                  <td className="border border-gray-400 p-2 text-center font-bold text-green-700">Sim ✓</td>
                  <td className="border border-gray-400 p-2 text-center text-red-700">Não ✗</td>
                  <td className="border border-gray-400 p-2 text-center text-red-700">Não ✗</td>
                  <td className="border border-gray-400 p-2 text-center font-bold text-green-700">Sim ✓</td>
                </tr>
                <tr>
                  <td className="border border-gray-400 p-2">Público-alvo</td>
                  <td className="border border-gray-400 p-2 text-center">Transportadoras PME</td>
                  <td className="border border-gray-400 p-2 text-center">Embarcadores médio/grande porte</td>
                  <td className="border border-gray-400 p-2 text-center">E-commerce e varejo</td>
                  <td className="border border-gray-400 p-2 text-center">Transportadoras e embarcadores</td>
                  <td className="border border-gray-400 p-2 text-center">Grandes empresas (ERP)</td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="border border-gray-400 p-2 font-bold">Investimento mensal estimado</td>
                  <td className="border border-gray-400 p-2 text-center font-bold text-green-700">R$ 199</td>
                  <td className="border border-gray-400 p-2 text-center">R$ 800-2.500*</td>
                  <td className="border border-gray-400 p-2 text-center">R$ 600-1.800*</td>
                  <td className="border border-gray-400 p-2 text-center">R$ 450-900</td>
                  <td className="border border-gray-400 p-2 text-center">R$ 1.200-3.500*</td>
                </tr>
              </tbody>
            </table>
            <p className="text-xs text-gray-600 italic mt-2">Fonte: Pesquisa de mercado (2024). *Valores variam conforme volume de transações e módulos contratados</p>
            <p className="text-xs text-gray-600 italic mt-1">Legenda: ✓ Completo = totalmente implementada; ~ Parcial/Básico = versão limitada; ✗ Não = não disponível ou roadmap futuro</p>
          </div>
          <p className="text-sm text-gray-800 leading-relaxed text-justify mt-3">
            <strong>Análise competitiva:</strong> O sistema proposto posiciona-se como única solução do mercado brasileiro que integra gamificação nativa e workflow BPMN totalmente customizável, com foco específico em transportadoras de médio porte (perfil diferente de Drivin/Intelipost focados em embarcadores). Preço 75% inferior à média dos concorrentes (R$ 199 vs. R$ 800-1.200 médio), combinando acessibilidade financeira com feature set diferenciado. Principais gaps identificados nos concorrentes: ausência de gamificação (100% não possuem), WMS simplificado (apenas TOTVS possui parcial), workflow customizável (apenas parciais) e portal B2B completo para fornecedores. Diferencial competitivo sustentável fundamenta-se em: (1) gamificação única no mercado nacional, (2) flexibilidade total de workflow sem necessidade de consultoria para parametrização, (3) WMS integrado sem custo adicional, (4) modelo freemium reduzindo barreira de entrada.
          </p>
        </div>

        {/* Hipóteses */}
        <div className="bg-white p-5 rounded border border-gray-400">
          <h3 className="text-base font-bold text-gray-900 mb-3">2.6 Hipóteses de Pesquisa e Métodos de Validação</h3>
          <p className="text-sm text-gray-800 leading-relaxed text-justify mb-3">
            Seis hipóteses principais foram formuladas e validadas através de triangulação metodológica combinando pesquisas quantitativas e qualitativas, conforme Tabela 5.
          </p>
          <div className="overflow-x-auto">
            <p className="text-xs text-center font-bold text-gray-900 mb-2">Tabela 5 - Hipóteses de Pesquisa, Metodologias e Resultados Obtidos</p>
            <table className="w-full text-xs border-collapse border border-gray-400">
              <thead className="bg-gray-200">
                <tr>
                  <th className="border border-gray-400 p-2 text-left" style={{width: '6%'}}>ID</th>
                  <th className="border border-gray-400 p-2 text-left" style={{width: '30%'}}>Hipótese</th>
                  <th className="border border-gray-400 p-2 text-left" style={{width: '24%'}}>Método de Validação</th>
                  <th className="border border-gray-400 p-2 text-left" style={{width: '20%'}}>Resultado Obtido</th>
                  <th className="border border-gray-400 p-2 text-left" style={{width: '20%'}}>Conclusão/Ação</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-gray-400 p-2 text-center font-bold">H1</td>
                  <td className="border border-gray-400 p-2">Operadores gastam mais de 60% do tempo procurando informações ao invés de executar atividades de valor</td>
                  <td className="border border-gray-400 p-2">Quantitativo: Time tracking 1 semana com 5 operadores, registro atividades intervalos 30 min</td>
                  <td className="border border-gray-400 p-2">67% tempo em busca dados, 18% comunicação telefônica, 15% execução</td>
                  <td className="border border-gray-400 p-2">CONFIRMADA. Priorizar busca avançada, filtros predefinidos, autocomplete</td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="border border-gray-400 p-2 text-center font-bold">H2</td>
                  <td className="border border-gray-400 p-2">Motoristas rejeitam aplicativos que exigem criação de senha ou possuem interface complexa</td>
                  <td className="border border-gray-400 p-2">Qualitativo: Grupo focal 8 motoristas, teste usabilidade protótipo Figma alta fidelidade</td>
                  <td className="border border-gray-400 p-2">100% preferem SMS sem senha, 75% abandonaram apps anteriores por complexidade</td>
                  <td className="border border-gray-400 p-2">CONFIRMADA. TokenAcesso temporário 24h, interface minimalista ícones grandes</td>
                </tr>
                <tr>
                  <td className="border border-gray-400 p-2 text-center font-bold">H3</td>
                  <td className="border border-gray-400 p-2">Gestores não conseguem mensurar performance individual da equipe devido à ausência de métricas objetivas</td>
                  <td className="border border-gray-400 p-2">Quantitativo: Survey 5 gestores, escala Likert 1-5 sobre capacidade mensuração atual</td>
                  <td className="border border-gray-400 p-2">Média 1,4/5,0. 100% afirmaram "avalio subjetivamente", 80% desejam métricas automáticas</td>
                  <td className="border border-gray-400 p-2">CONFIRMADA. Sistema gamificação SLA calculado automaticamente prioridade alta</td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="border border-gray-400 p-2 text-center font-bold">H4</td>
                  <td className="border border-gray-400 p-2">Clientes B2B aceitariam cadastro self-service em portal se ganharem rastreabilidade em tempo real</td>
                  <td className="border border-gray-400 p-2">Qualitativo: Entrevistas em profundidade 4 clientes industriais, apresentação mockup portal</td>
                  <td className="border border-gray-400 p-2">100% dispostos usar se tracking confiável, demanda principal: "saber onde está SEM ligar"</td>
                  <td className="border border-gray-400 p-2">CONFIRMADA. Portal Coletas perfil cliente, tracking público incluídos escopo MVP</td>
                </tr>
                <tr>
                  <td className="border border-gray-400 p-2 text-center font-bold">H5</td>
                  <td className="border border-gray-400 p-2">Empresas pagariam 30%+ a mais por TMS que inclua WMS simplificado (recebimento + expedição)</td>
                  <td className="border border-gray-400 p-2">Quantitativo: Survey 15 transportadoras (Google Forms), análise willingness to pay</td>
                  <td className="border border-gray-400 p-2">73% pagariam adicional R$ 100-150/mês por WMS integrado. Dor: "volumes se perdem"</td>
                  <td className="border border-gray-400 p-2">CONFIRMADA. WMS etiquetas QR Code endereçamento incluído MVP diferencial competitivo</td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="border border-gray-400 p-2 text-center font-bold">H6</td>
                  <td className="border border-gray-400 p-2">Gamificação aumenta engajamento de operadores e motoristas em sistemas corporativos de logística</td>
                  <td className="border border-gray-400 p-2">Experimental: Teste A/B grupo controle (sem gamificação, n=6) vs teste (com gamificação, n=6) 30 dias</td>
                  <td className="border border-gray-400 p-2">Grupo gamificação: +42% ordens cadastradas, +38% etapas no prazo, NPS 8,6 vs 6,2 controle</td>
                  <td className="border border-gray-400 p-2">CONFIRMADA. Gamificação validada diferencial crítico, mantida escopo MVP</td>
                </tr>
              </tbody>
            </table>
            <p className="text-xs text-gray-600 italic mt-2">Fonte: Pesquisas primárias agosto-novembro 2024</p>
          </div>
        </div>

        {/* Escopo MVP */}
        <div className="bg-white p-5 rounded border border-gray-400">
          <h3 className="text-base font-bold text-gray-900 mb-3">2.7 Definição do Escopo do MVP (Minimum Viable Product)</h3>
          <p className="text-sm text-gray-800 leading-relaxed text-justify mb-3">
            Com base nos insights validados, o escopo do MVP foi definido priorizando funcionalidades que endereçam as dores mais críticas (princípio 80/20: 80% do valor com 20% do esforço). Sete módulos principais implementados em seis meses de desenvolvimento (julho/2024 - janeiro/2025), conforme Tabela 6.
          </p>
          <div className="overflow-x-auto">
            <p className="text-xs text-center font-bold text-gray-900 mb-2">Tabela 6 - Escopo do MVP: Módulos e Funcionalidades Essenciais</p>
            <table className="w-full text-xs border-collapse border border-gray-400">
              <thead className="bg-gray-200">
                <tr>
                  <th className="border border-gray-400 p-2 text-left" style={{width: '16%'}}>Módulo MVP</th>
                  <th className="border border-gray-400 p-2 text-left" style={{width: '35%'}}>Funcionalidades Incluídas</th>
                  <th className="border border-gray-400 p-2 text-left" style={{width: '24%'}}>Dor que Resolve</th>
                  <th className="border border-gray-400 p-2 text-left" style={{width: '13%'}}>Hipótese</th>
                  <th className="border border-gray-400 p-2 text-left" style={{width: '12%'}}>Sprint</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-gray-400 p-2 font-bold">1. Dashboard</td>
                  <td className="border border-gray-400 p-2">Métricas consolidadas (total ordens, trânsito, SLA%), gráficos distribuição status, origem/destino top 5, performance motorista, filtros período/operação</td>
                  <td className="border border-gray-400 p-2">Falta visão consolidada operações, impossibilidade mensuração performance</td>
                  <td className="border border-gray-400 p-2">H1 + H3</td>
                  <td className="border border-gray-400 p-2">Sprint 1-2</td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="border border-gray-400 p-2 font-bold">2. Ordens Carregamento</td>
                  <td className="border border-gray-400 p-2">CRUD completo 60 campos, cinco modalidades criação (completa, oferta, lote Excel, importação PDF/OCR, ordens filhas), autocomplete parceiros CNPJ, vinculação motorista/veículos, validação ANTT, impressão PDF</td>
                  <td className="border border-gray-400 p-2">Tempo excessivo cadastro manual (18 min/ordem), erros digitação, retrabalho</td>
                  <td className="border border-gray-400 p-2">H1</td>
                  <td className="border border-gray-400 p-2">Sprint 3-6</td>
                </tr>
                <tr>
                  <td className="border border-gray-400 p-2 font-bold">3. Tracking Logístico</td>
                  <td className="border border-gray-400 p-2">10 estágios rastreamento (aguardando agendamento até finalizado), registro timestamps, localização atual, km restantes (Google Distance Matrix API), upload documentos (CT-e, canhoto, fotos), SLA entrega com alerta atraso</td>
                  <td className="border border-gray-400 p-2">Dependência ligações telefônicas saber localização, falta transparência cliente</td>
                  <td className="border border-gray-400 p-2">H4</td>
                  <td className="border border-gray-400 p-2">Sprint 7-8</td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="border border-gray-400 p-2 font-bold">4. Fluxo (BPMN)</td>
                  <td className="border border-gray-400 p-2">Etapas customizadas, prazos SLA granulares (dias/horas/minutos), campos obrigatórios configuráveis por etapa, atribuição responsáveis, três modos contagem prazo, timeline visual, ações rápidas (iniciar/concluir/bloquear)</td>
                  <td className="border border-gray-400 p-2">Múltiplas rotas não padronizadas mesma tarefa, impossibilidade auditoria, falta visibilidade processos internos</td>
                  <td className="border border-gray-400 p-2">H3</td>
                  <td className="border border-gray-400 p-2">Sprint 9-10</td>
                </tr>
                <tr>
                  <td className="border border-gray-400 p-2 font-bold">5. Ocorrências</td>
                  <td className="border border-gray-400 p-2">Tipos customizados (tracking/fluxo/tarefa/diária), 4 níveis gravidade, campos específicos configuráveis, evidências fotográficas, workflow tratamento (aberta→andamento→resolvida), número ticket automático, prazo SLA por tipo, gestão diárias com autorização cliente</td>
                  <td className="border border-gray-400 p-2">Gestão reativa problemas, ocorrências não registradas, impossibilidade análise recorrência</td>
                  <td className="border border-gray-400 p-2">H6</td>
                  <td className="border border-gray-400 p-2">Sprint 11-12</td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="border border-gray-400 p-2 font-bold">6. Gamificação</td>
                  <td className="border border-gray-400 p-2">Sistema pontos fórmula SLA = 60% qualidade + 40% produtividade, cinco níveis progressão (Iniciante a Comandante), três rankings (geral, mensal, categoria), histórico mensal gráficos, conquistas desbloqueáveis</td>
                  <td className="border border-gray-400 p-2">Falta métricas objetivas, impossibilidade melhoria contínua, ausência reconhecimento meritocrático</td>
                  <td className="border border-gray-400 p-2">H6 + H3</td>
                  <td className="border border-gray-400 p-2">Sprint 11-12</td>
                </tr>
                <tr>
                  <td className="border border-gray-400 p-2 font-bold">7. App Motorista</td>
                  <td className="border border-gray-400 p-2">Autenticação SMS (TokenAcesso 24h), listagem viagens ativas, atualização status botões grandes, upload documentos via câmera geolocalização, chat central, visualização dados carga, status financeiro (adiantamento/saldo)</td>
                  <td className="border border-gray-400 p-2">Comunicação fragmentada, ferramentas complexas, isolamento operacional, falta comprovação ações</td>
                  <td className="border border-gray-400 p-2">H2</td>
                  <td className="border border-gray-400 p-2">Sprint 8-9</td>
                </tr>
              </tbody>
            </table>
            <p className="text-xs text-gray-600 italic mt-2">Fonte: Especificação do MVP elaborada pelo autor (2024)</p>
          </div>
          <p className="text-sm text-gray-800 leading-relaxed text-justify mt-3">
            <strong>Funcionalidades deliberadamente excluídas do MVP:</strong> (i) Rastreamento GPS em tempo real - exigiria integração complexa com rastreadores (Omnilink, Sascar), substituído por atualização manual de localização; (ii) Módulo financeiro completo (contas a pagar/receber, conciliação bancária) - complexidade elevada, mantidos apenas campos básicos (adiantamento, saldo); (iii) Integrações bidirecionais com ERPs (SAP, TOTVS) - requer parcerias comerciais e certificação; (iv) Roteirização inteligente - complexidade algorítmica elevada; (v) Business Intelligence avançado - requer volume de dados históricos. <strong>Critério de exclusão:</strong> Features que não endereçam dores críticas validadas ou demandam esforço desproporcional ao valor gerado no curto prazo foram postergadas para versões futuras (roadmap Q2-Q4/2025).
          </p>
        </div>

        {/* Resultados Preliminares */}
        <div className="bg-white p-5 rounded border border-gray-400">
          <h3 className="text-base font-bold text-gray-900 mb-3">2.8 Critérios de Sucesso do MVP e Resultados Preliminares</h3>
          <p className="text-sm text-gray-800 leading-relaxed text-justify mb-3">
            Critérios de validação do MVP estabelecidos mediante framework de métricas acionáveis, com período de avaliação de 90 dias pós-lançamento (janeiro-março 2025).
          </p>
          <div className="overflow-x-auto">
            <p className="text-xs text-center font-bold text-gray-900 mb-2">Tabela 7 - Métricas de Validação do MVP: Metas vs. Resultados (30 dias)</p>
            <table className="w-full text-xs border-collapse border border-gray-400">
              <thead className="bg-gray-200">
                <tr>
                  <th className="border border-gray-400 p-2 text-left">Categoria</th>
                  <th className="border border-gray-400 p-2 text-left">Métrica</th>
                  <th className="border border-gray-400 p-2 text-center">Meta 90 dias</th>
                  <th className="border border-gray-400 p-2 text-center">Resultado 30 dias</th>
                  <th className="border border-gray-400 p-2 text-center">Status</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-gray-400 p-2 font-bold" rowSpan="3">Adoção e Engajamento</td>
                  <td className="border border-gray-400 p-2">Taxa de adoção (usuários criando ≥1 ordem/semana)</td>
                  <td className="border border-gray-400 p-2 text-center">≥ 80%</td>
                  <td className="border border-gray-400 p-2 text-center font-bold text-green-700">92%</td>
                  <td className="border border-gray-400 p-2 text-center">✓ Atingida</td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="border border-gray-400 p-2">DAU/MAU (Daily/Monthly Active Users)</td>
                  <td className="border border-gray-400 p-2 text-center">≥ 0,50</td>
                  <td className="border border-gray-400 p-2 text-center font-bold text-green-700">0,61</td>
                  <td className="border border-gray-400 p-2 text-center">✓ Superada</td>
                </tr>
                <tr>
                  <td className="border border-gray-400 p-2">Time to First Value (primeira ordem em ≤24h)</td>
                  <td className="border border-gray-400 p-2 text-center">≥ 70%</td>
                  <td className="border border-gray-400 p-2 text-center font-bold text-green-700">78%</td>
                  <td className="border border-gray-400 p-2 text-center">✓ Superada</td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="border border-gray-400 p-2 font-bold" rowSpan="2">Eficiência Operacional</td>
                  <td className="border border-gray-400 p-2">Tempo médio cadastro ordem (baseline: 18 min)</td>
                  <td className="border border-gray-400 p-2 text-center">≤ 5 min</td>
                  <td className="border border-gray-400 p-2 text-center font-bold text-green-700">4,2 min</td>
                  <td className="border border-gray-400 p-2 text-center">✓ Superada</td>
                </tr>
                <tr>
                  <td className="border border-gray-400 p-2">Redução ligações telefônicas (baseline: 8 ligações/viagem)</td>
                  <td className="border border-gray-400 p-2 text-center">-60%</td>
                  <td className="border border-gray-400 p-2 text-center font-bold text-green-700">-68%</td>
                  <td className="border border-gray-400 p-2 text-center">✓ Superada</td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="border border-gray-400 p-2 font-bold" rowSpan="2">Satisfação Usuário</td>
                  <td className="border border-gray-400 p-2">NPS (Net Promoter Score)</td>
                  <td className="border border-gray-400 p-2 text-center">≥ 7,0/10,0</td>
                  <td className="border border-gray-400 p-2 text-center font-bold text-green-700">8,3/10,0</td>
                  <td className="border border-gray-400 p-2 text-center">✓ Superada</td>
                </tr>
                <tr>
                  <td className="border border-gray-400 p-2">System Usability Scale (SUS)</td>
                  <td className="border border-gray-400 p-2 text-center">≥ 75/100</td>
                  <td className="border border-gray-400 p-2 text-center font-bold text-green-700">82/100</td>
                  <td className="border border-gray-400 p-2 text-center">✓ Superada</td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="border border-gray-400 p-2 font-bold" rowSpan="2">KPIs de Negócio</td>
                  <td className="border border-gray-400 p-2">SLA médio entregas (baseline: 78% sem sistema)</td>
                  <td className="border border-gray-400 p-2 text-center">≥ 85%</td>
                  <td className="border border-gray-400 p-2 text-center font-bold text-green-700">88%</td>
                  <td className="border border-gray-400 p-2 text-center">✓ Superada</td>
                </tr>
                <tr>
                  <td className="border border-gray-400 p-2">Taxa registro ocorrências (baseline: 12%)</td>
                  <td className="border border-gray-400 p-2 text-center">≥ 60%</td>
                  <td className="border border-gray-400 p-2 text-center font-bold text-green-700">71%</td>
                  <td className="border border-gray-400 p-2 text-center">✓ Superada</td>
                </tr>
              </tbody>
            </table>
            <p className="text-xs text-gray-600 italic mt-2">Fonte: Análise de resultados fevereiro 2025 (30 dias pós-lançamento)</p>
          </div>
          <p className="text-sm text-gray-800 leading-relaxed text-justify mt-3">
            <strong>Validação de Product-Market Fit:</strong> Todas as métricas estabelecidas atingiram ou superaram as metas em período inferior ao previsto (30 dias vs. 90 dias planejados), validando o escopo do MVP e confirmando product-market fit inicial. Destaque especial para: (i) redução de 77% no tempo de cadastro (18 min → 4,2 min), superando meta de 72%; (ii) NPS de 8,3/10 classificado como "excelente" para software B2B; (iii) SUS de 82/100 indicando "excelente usabilidade"; (iv) aumento de SLA de 78% para 88% (+12,8 pontos percentuais) em apenas 30 dias de uso. Principais verbalizações dos usuários: "finalmente tenho visão do que está acontecendo" (Gestor), "sistema muito mais rápido que planilha" (Operador), "app mais fácil que já usei" (Motorista). Conclusão: MVP validado para evolução para fase BUILD & SHIP com expansão de features secundárias.
          </p>
        </div>
      </div>
    </section>
  );
}