import React from "react";

export default function Fase3Build() {
  return (
    <section className="mb-10">
      <div className="bg-gray-800 text-white p-4 mb-4">
        <h2 className="text-lg font-bold uppercase">
          3. FASE BUILD - Prototipagem, Desenvolvimento e Testes da Solução
        </h2>
      </div>

      <div className="space-y-6">
        {/* Introdução */}
        <div className="bg-white p-5 rounded border border-gray-400">
          <p className="text-sm text-gray-800 leading-relaxed text-justify">
            A Fase BUILD representa a materialização do escopo validado na Fase DISCOVER em uma solução funcional e testável. Esta etapa compreende três pilares fundamentais: (1) Prototipagem de alta fidelidade com validação junto aos usuários finais, (2) Desenvolvimento utilizando stack tecnológica moderna com foco em agilidade e escalabilidade, (3) Testes abrangentes de usabilidade, funcionalidade e performance. O período de execução total foi de seis meses (julho/2024 - janeiro/2025), seguindo metodologia ágil Scrum com sprints de duas semanas (12 sprints totais).
          </p>
        </div>

        {/* Prototipagem */}
        <div className="bg-white p-5 rounded border border-gray-400">
          <h3 className="text-base font-bold text-gray-900 mb-3">3.1 Prototipagem da Solução e Testes de Usabilidade</h3>
          <p className="text-sm text-gray-800 leading-relaxed text-justify mb-3">
            A prototipagem foi conduzida em três ciclos iterativos de validação, aplicando metodologia Design Thinking com foco em usabilidade mobile-first e acessibilidade. Ferramentas utilizadas: Figma (wireframes e protótipos interativos), Maze (testes remotos de usabilidade), UserTesting.com (gravações de sessões).
          </p>

          {/* Ciclos de Prototipagem */}
          <div className="overflow-x-auto mb-4">
            <p className="text-xs text-center font-bold text-gray-900 mb-2">Tabela 8 - Ciclos de Prototipagem e Validação Iterativa</p>
            <table className="w-full text-xs border-collapse border border-gray-400">
              <thead className="bg-gray-200">
                <tr>
                  <th className="border border-gray-400 p-2 text-left" style={{width: '12%'}}>Ciclo</th>
                  <th className="border border-gray-400 p-2 text-left" style={{width: '15%'}}>Ferramenta</th>
                  <th className="border border-gray-400 p-2 text-left" style={{width: '20%'}}>Métrica Avaliada</th>
                  <th className="border border-gray-400 p-2 text-left" style={{width: '18%'}}>Resultado Inicial</th>
                  <th className="border border-gray-400 p-2 text-left" style={{width: '18%'}}>Melhorias Implementadas</th>
                  <th className="border border-gray-400 p-2 text-left" style={{width: '17%'}}>Resultado Final</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-gray-400 p-2 font-bold">Ciclo 1 (Sprint 1-2)</td>
                  <td className="border border-gray-400 p-2">Figma Wireframes (baixa fidelidade)</td>
                  <td className="border border-gray-400 p-2">Task Success Rate (conclusão tarefa)</td>
                  <td className="border border-gray-400 p-2">68% (n=8 usuários)</td>
                  <td className="border border-gray-400 p-2">Redução campos form 60→40, agrupamento lógico sessões</td>
                  <td className="border border-gray-400 p-2">89% (+21pp)</td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="border border-gray-400 p-2 font-bold">Ciclo 2 (Sprint 3-4)</td>
                  <td className="border border-gray-400 p-2">Figma Protótipo Interativo (alta fidelidade)</td>
                  <td className="border border-gray-400 p-2">Time on Task (tempo conclusão)</td>
                  <td className="border border-gray-400 p-2">8,2 min/ordem (n=12)</td>
                  <td className="border border-gray-400 p-2">Autocomplete CNPJ, máscaras input, validação tempo real</td>
                  <td className="border border-gray-400 p-2">5,1 min (-38%)</td>
                </tr>
                <tr>
                  <td className="border border-gray-400 p-2 font-bold">Ciclo 3 (Sprint 5-6)</td>
                  <td className="border border-gray-400 p-2">Maze (teste remoto navegação)</td>
                  <td className="border border-gray-400 p-2">Misclick Rate (cliques errados)</td>
                  <td className="border border-gray-400 p-2">23% (n=15 usuários)</td>
                  <td className="border border-gray-400 p-2">Contraste cores WCAG AA, botões maiores mobile, hierarquia visual</td>
                  <td className="border border-gray-400 p-2">7% (-16pp)</td>
                </tr>
              </tbody>
            </table>
            <p className="text-xs text-gray-600 italic mt-2">Fonte: Testes de usabilidade julho-setembro 2024 (n total = 35 participantes)</p>
          </div>

          {/* Principais Ajustes */}
          <div className="bg-blue-50 p-4 rounded border border-blue-200 mb-3">
            <p className="text-xs font-bold text-blue-900 mb-2">Principais Insights dos Testes e Ajustes Implementados:</p>
            <ul className="text-xs text-gray-800 space-y-1">
              <li><strong>Dashboard:</strong> Usuários ignoravam gráficos complexos → Simplificação para 4 métricas principais visíveis acima da dobra, gráficos opcionais expansíveis</li>
              <li><strong>Formulário Ordem:</strong> Campos "produto" e "peso" frequentemente invertidos → Reordenação lógica com ícones visuais e tooltips contextuais</li>
              <li><strong>App Motorista:</strong> 100% usuários testaram botão "ligar para central" antes do chat → Inversão hierarquia: chat primário (destaque azul), telefone secundário (ícone discreto)</li>
              <li><strong>Tracking:</strong> Motoristas confusos com 10 estágios simultâneos → Implementação wizard passo-a-passo com apenas próximo estágio visível</li>
              <li><strong>Gamificação:</strong> Operadores desmotivados vendo apenas líder absoluto → Criação de rankings por categoria (iniciante/intermediário/avançado) e mensal</li>
            </ul>
          </div>

          <p className="text-sm text-gray-800 leading-relaxed text-justify">
            <strong>Validação final de usabilidade:</strong> System Usability Scale (SUS) aplicado com 18 usuários finais (6 operadores, 5 motoristas, 4 gestores, 3 clientes) resultou em pontuação média de 84,2/100 (classificação "excelente" segundo padrão Bangor), superando meta estabelecida de 75/100. Destaques verbalizados: "não precisa de treinamento, é muito intuitivo" (Operador, 32 anos), "pela primeira vez consigo usar um app de trabalho sozinho" (Motorista, 48 anos), "finalmente vejo tudo que preciso em uma tela" (Gestor, 41 anos).
          </p>
        </div>

        {/* Desenvolvimento */}
        <div className="bg-white p-5 rounded border border-gray-400">
          <h3 className="text-base font-bold text-gray-900 mb-3">3.2 Desenvolvimento da Solução Funcional</h3>
          
          {/* Stack Tecnológica */}
          <div className="mb-4">
            <p className="text-sm font-bold text-gray-900 mb-2">3.2.1 Stack Tecnológica e Arquitetura</p>
            <p className="text-sm text-gray-800 leading-relaxed text-justify mb-3">
              A solução foi desenvolvida utilizando plataforma <strong>Base44</strong> (Backend-as-a-Service brasileiro) combinada com desenvolvimento low-code/código personalizado, priorizando velocidade de entrega sem comprometer qualidade e escalabilidade. Esta abordagem híbrida permitiu redução de 60% no tempo de desenvolvimento comparado a stack tradicional full-code (MERN/PERN).
            </p>
            <div className="overflow-x-auto">
              <p className="text-xs text-center font-bold text-gray-900 mb-2">Tabela 9 - Stack Tecnológica Detalhada</p>
              <table className="w-full text-xs border-collapse border border-gray-400">
                <thead className="bg-gray-200">
                  <tr>
                    <th className="border border-gray-400 p-2 text-left">Camada</th>
                    <th className="border border-gray-400 p-2 text-left">Tecnologia</th>
                    <th className="border border-gray-400 p-2 text-left">Justificativa Técnica</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-gray-400 p-2 font-bold">Backend (BaaS)</td>
                    <td className="border border-gray-400 p-2">Base44 Platform (Node.js/PostgreSQL)</td>
                    <td className="border border-gray-400 p-2">Autenticação JWT nativa, CRUD automático, permissões granulares, escalabilidade automática (serverless)</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="border border-gray-400 p-2 font-bold">Frontend Web</td>
                    <td className="border border-gray-400 p-2">React 18 + TypeScript + Tailwind CSS</td>
                    <td className="border border-gray-400 p-2">Performance (Virtual DOM), componentização reutilizável, tipagem forte reduz bugs, design system consistente</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-400 p-2 font-bold">UI Components</td>
                    <td className="border border-gray-400 p-2">Shadcn/ui + Lucide Icons + Framer Motion</td>
                    <td className="border border-gray-400 p-2">Componentes acessíveis (ARIA), ícones otimizados SVG, animações performáticas 60fps</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="border border-gray-400 p-2 font-bold">State Management</td>
                    <td className="border border-gray-400 p-2">React Query (TanStack Query)</td>
                    <td className="border border-gray-400 p-2">Cache inteligente, sincronização background, invalidação automática, retry logic</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-400 p-2 font-bold">Integrações</td>
                    <td className="border border-gray-400 p-2">Base44 Integrations + APIs REST</td>
                    <td className="border border-gray-400 p-2">OCR nativo (PDFs), LLM (OpenAI GPT-4o-mini), upload arquivos, envio emails/SMS</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="border border-gray-400 p-2 font-bold">Banco de Dados</td>
                    <td className="border border-gray-400 p-2">PostgreSQL (gerenciado Base44)</td>
                    <td className="border border-gray-400 p-2">Relacional (integridade referencial), índices otimizados, backups automáticos diários</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-400 p-2 font-bold">Hospedagem</td>
                    <td className="border border-gray-400 p-2">Base44 Cloud (AWS infrastructure)</td>
                    <td className="border border-gray-400 p-2">CDN global (CloudFront), SSL automático, escalabilidade horizontal, uptime 99,9% SLA</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="border border-gray-400 p-2 font-bold">Autenticação</td>
                    <td className="border border-gray-400 p-2">Base44 Auth (JWT + RBAC)</td>
                    <td className="border border-gray-400 p-2">Login social (Google), controle permissões por role, tokens seguros HttpOnly, sessões gerenciadas</td>
                  </tr>
                </tbody>
              </table>
              <p className="text-xs text-gray-600 italic mt-2">Fonte: Documentação técnica do projeto (2024)</p>
            </div>
          </div>

          {/* Metodologia de Desenvolvimento */}
          <div className="mb-4">
            <p className="text-sm font-bold text-gray-900 mb-2">3.2.2 Metodologia de Desenvolvimento Ágil</p>
            <p className="text-sm text-gray-800 leading-relaxed text-justify mb-3">
              Adotou-se framework Scrum com sprints de 14 dias, totalizando 12 sprints. Equipe composta por: 1 Product Owner (autor), 2 desenvolvedores full-stack, 1 UX/UI designer. Cerimônias realizadas: Planning (segunda-feira sprint), Daily Standups (15 min remotos), Sprint Review com usuários piloto (última sexta), Retrospective (melhoria contínua). Desenvolvimento priorizado segundo MoSCoW: Must Have (MVP core) maior que Should Have (roadmap Q2) maior que Could Have (backlog futuro) maior que Won't Have (descartado).
            </p>
            <div className="overflow-x-auto">
              <p className="text-xs text-center font-bold text-gray-900 mb-2">Tabela 10 - Cronograma de Desenvolvimento por Sprint</p>
              <table className="w-full text-xs border-collapse border border-gray-400">
                <thead className="bg-gray-200">
                  <tr>
                    <th className="border border-gray-400 p-2 text-center">Sprint</th>
                    <th className="border border-gray-400 p-2 text-left">Período</th>
                    <th className="border border-gray-400 p-2 text-left">Módulo Principal</th>
                    <th className="border border-gray-400 p-2 text-left">Entregas Realizadas</th>
                    <th className="border border-gray-400 p-2 text-center">Story Points</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-gray-400 p-2 text-center font-bold">1-2</td>
                    <td className="border border-gray-400 p-2">Jul 01-28/24</td>
                    <td className="border border-gray-400 p-2">Dashboard + Autenticação</td>
                    <td className="border border-gray-400 p-2">Login Google, métricas básicas, entidades core (Ordem, Motorista, Veículo), gráficos Recharts</td>
                    <td className="border border-gray-400 p-2 text-center">34</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="border border-gray-400 p-2 text-center font-bold">3-4</td>
                    <td className="border border-gray-400 p-2">Jul 29-Ago 25/24</td>
                    <td className="border border-gray-400 p-2">Ordens Carregamento</td>
                    <td className="border border-gray-400 p-2">CRUD completo, autocomplete parceiros, validação ANTT integrada, impressão PDF (jsPDF)</td>
                    <td className="border border-gray-400 p-2 text-center">55</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-400 p-2 text-center font-bold">5-6</td>
                    <td className="border border-gray-400 p-2">Ago 26-Set 22/24</td>
                    <td className="border border-gray-400 p-2">Importação OCR + Oferta Lote</td>
                    <td className="border border-gray-400 p-2">OCR PDFs (Base44 Core Integration), upload Excel lote, ordens filhas, validação duplicatas</td>
                    <td className="border border-gray-400 p-2 text-center">42</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="border border-gray-400 p-2 text-center font-bold">7-8</td>
                    <td className="border border-gray-400 p-2">Set 23-Out 20/24</td>
                    <td className="border border-gray-400 p-2">Tracking Logístico</td>
                    <td className="border border-gray-400 p-2">10 estágios rastreamento, timestamps, SLA calculado, cálculo distância (Google Distance Matrix), upload documentos</td>
                    <td className="border border-gray-400 p-2 text-center">48</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-400 p-2 text-center font-bold">8-9</td>
                    <td className="border border-gray-400 p-2">Set 23-Out 20/24</td>
                    <td className="border border-gray-400 p-2">App Motorista</td>
                    <td className="border border-gray-400 p-2">Autenticação SMS (TokenAcesso), listagem viagens, atualização status, upload câmera geolocalização, chat tempo real</td>
                    <td className="border border-gray-400 p-2 text-center">38</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="border border-gray-400 p-2 text-center font-bold">9-10</td>
                    <td className="border border-gray-400 p-2">Out 21-Nov 17/24</td>
                    <td className="border border-gray-400 p-2">Fluxo (BPMN)</td>
                    <td className="border border-gray-400 p-2">Etapas customizadas, prazos SLA granulares, campos obrigatórios configuráveis, atribuição responsáveis, timeline visual</td>
                    <td className="border border-gray-400 p-2 text-center">51</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-400 p-2 text-center font-bold">11-12</td>
                    <td className="border border-gray-400 p-2">Nov 18-Dez 15/24</td>
                    <td className="border border-gray-400 p-2">Ocorrências + Gamificação</td>
                    <td className="border border-gray-400 p-2">Tipos customizados, gravidade, campos específicos, sistema pontos SLA, rankings, conquistas, métricas mensais</td>
                    <td className="border border-gray-400 p-2 text-center">46</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="border border-gray-400 p-2 text-center font-bold">Dez/24</td>
                    <td className="border border-gray-400 p-2">Dez 16-31/24</td>
                    <td className="border border-gray-400 p-2">Polimento + Correções</td>
                    <td className="border border-gray-400 p-2">Correção bugs, otimização performance (lazy loading), responsividade mobile, acessibilidade WCAG</td>
                    <td className="border border-gray-400 p-2 text-center">28</td>
                  </tr>
                </tbody>
              </table>
              <p className="text-xs text-gray-600 italic mt-2">Fonte: Backlog e sprints Jira (2024). Total: 342 story points entregues</p>
            </div>
          </div>

          {/* Arquitetura de Dados */}
          <div className="mb-4">
            <p className="text-sm font-bold text-gray-900 mb-2">3.2.3 Modelagem de Dados e Entidades</p>
            <p className="text-sm text-gray-800 leading-relaxed text-justify mb-3">
              Banco de dados modelado seguindo princípios de normalização (3FN) com 18 entidades principais interconectadas, garantindo integridade referencial e evitando redundância. Principais entidades: OrdemDeCarregamento (núcleo do sistema, 60+ campos), NotaFiscal (importação XML NF-e), Volume (WMS unitização), Motorista/Veículo (cadastro recursos), Ocorrencia (gestão qualidade), Etapa/OrdemEtapa (workflow BPMN), GamificacaoUsuario (pontos e rankings).
            </p>
            <div className="bg-gray-50 p-3 rounded border border-gray-400">
              <p className="text-xs font-bold text-gray-900 mb-2">Exemplo: Relacionamentos-chave da entidade OrdemDeCarregamento</p>
              <ul className="text-xs text-gray-800 space-y-1">
                <li>• <strong>1:N com NotaFiscal:</strong> Uma ordem pode conter múltiplas NFs (vinculação via notas_fiscais_ids array)</li>
                <li>• <strong>1:N com Volume:</strong> NFs desdobram-se em volumes para WMS (referência bidirecional)</li>
                <li>• <strong>N:1 com Motorista:</strong> Motorista principal + reserva (foreign keys motorista_id, motorista_reserva_id)</li>
                <li>• <strong>N:1 com Veículo:</strong> Cavalo + até 3 implementos (implemento1_id, implemento2_id, implemento3_id)</li>
                <li>• <strong>1:N com Ocorrencia:</strong> Histórico completo problemas (categoria: tracking/fluxo/diaria)</li>
                <li>• <strong>1:N com OrdemEtapa:</strong> Vínculo com workflow configurado (status, prazos, responsáveis)</li>
              </ul>
            </div>
          </div>

          {/* Padrões UI/UX */}
          <div className="mb-4">
            <p className="text-sm font-bold text-gray-900 mb-2">3.2.4 Padrões de Interface e Experiência do Usuário</p>
            <p className="text-sm text-gray-800 leading-relaxed text-justify mb-3">
              Design system baseado em Atomic Design (átomos → moléculas → organismos → templates → páginas), garantindo consistência visual e reutilização de componentes. Todos os componentes seguem princípios WCAG 2.1 Level AA (acessibilidade): contraste mínimo 4.5:1 textos, navegação via teclado, labels ARIA, responsividade 320px-2560px.
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-blue-50 p-3 rounded border border-blue-200">
                <p className="text-xs font-bold text-blue-900 mb-2">Componentes Reutilizáveis Criados:</p>
                <ul className="text-xs text-gray-800 space-y-1">
                  <li>• <strong>OrdemDetails:</strong> Modal unificado detalhes ordem (7 tabs: geral, tracking, fluxo, ocorrências, filhas, risco, timeline)</li>
                  <li>• <strong>TrackingTable:</strong> Tabela sortável drag-scroll horizontal, cálculo distância assíncrono</li>
                  <li>• <strong>PlanilhaView:</strong> Edição inline estilo Excel, salvamento otimista, configuração colunas drag-drop</li>
                  <li>• <strong>OcorrenciaModal:</strong> Formulário dinâmico campos customizados, upload evidências</li>
                  <li>• <strong>FiltrosPredefinidos:</strong> Salvamento filtros favoritos localStorage</li>
                </ul>
              </div>
              <div className="bg-green-50 p-3 rounded border border-green-200">
                <p className="text-xs font-bold text-green-900 mb-2">Padrões UX Aplicados:</p>
                <ul className="text-xs text-gray-800 space-y-1">
                  <li>• <strong>Progressive Disclosure:</strong> Informações complexas reveladas gradualmente (ex: campos opcionais ocultos)</li>
                  <li>• <strong>Feedback Imediato:</strong> Toasts (Sonner lib), skeleton loaders, estados loading/error/success</li>
                  <li>• <strong>Ações Destrutivas Protegidas:</strong> Confirmação dupla exclusões, estados disable durante processamento</li>
                  <li>• <strong>Mobile-First:</strong> Design responsivo iniciando 320px, touch targets mínimo 44x44px</li>
                  <li>• <strong>Dark Mode:</strong> Suporte tema escuro completo (localStorage persistente, detecção preferência sistema)</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Rotas do Sistema */}
          <div className="mb-4">
            <p className="text-sm font-bold text-gray-900 mb-2">3.2.5 Mapeamento Completo de Rotas e Funcionalidades</p>
            <p className="text-sm text-gray-800 leading-relaxed text-justify mb-3">
              O sistema contempla 27 rotas principais organizadas hierarquicamente por módulo funcional, com controle de acesso baseado em perfis de usuário (admin, operador, motorista, fornecedor, cliente) e permissões granulares. Todas as rotas são protegidas por autenticação JWT, com redirecionamento automático para login quando não autenticado.
            </p>
            <div className="overflow-x-auto">
              <p className="text-xs text-center font-bold text-gray-900 mb-2">Tabela 18 - Inventário Completo de Rotas do Sistema</p>
              <table className="w-full text-xs border-collapse border border-gray-400">
                <thead className="bg-gray-200">
                  <tr>
                    <th className="border border-gray-400 p-2 text-left" style={{width: '20%'}}>Rota/URL</th>
                    <th className="border border-gray-400 p-2 text-left" style={{width: '15%'}}>Módulo</th>
                    <th className="border border-gray-400 p-2 text-left" style={{width: '40%'}}>Funcionalidades Principais</th>
                    <th className="border border-gray-400 p-2 text-left" style={{width: '25%'}}>Perfis de Acesso</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-gray-400 p-2 font-bold">/Inicio</td>
                    <td className="border border-gray-400 p-2">Dashboard</td>
                    <td className="border border-gray-400 p-2">Página inicial personalizada por perfil, cards resumo, atalhos rápidos módulos principais</td>
                    <td className="border border-gray-400 p-2">Todos autenticados</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="border border-gray-400 p-2 font-bold">/Dashboard</td>
                    <td className="border border-gray-400 p-2">Analytics</td>
                    <td className="border border-gray-400 p-2">Métricas consolidadas (ordens ativas, em trânsito, SLA%), gráficos Recharts (pizza, barras, linhas), filtros período/operação, exportação Excel/PDF, modo TV (fullscreen auto-refresh)</td>
                    <td className="border border-gray-400 p-2">Admin, Operador</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-400 p-2 font-bold">/DashboardTV</td>
                    <td className="border border-gray-400 p-2">Analytics</td>
                    <td className="border border-gray-400 p-2">Dashboard otimizado exibição TV/monitor parede, auto-refresh 30s, gráficos grandes, sem interação usuário</td>
                    <td className="border border-gray-400 p-2">Admin, Operador</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="border border-gray-400 p-2 font-bold">/OrdensCarregamento</td>
                    <td className="border border-gray-400 p-2">Ordens</td>
                    <td className="border border-gray-400 p-2">CRUD completo ordens, 5 modalidades criação (completa, oferta, lote Excel, OCR PDF, ordem filha), autocomplete CNPJ Parceiros, validação ANTT veículos, impressão PDF customizada, filtros avançados 15 critérios, busca textual full-text, ações massa (cancelar, exportar), histórico alterações</td>
                    <td className="border border-gray-400 p-2">Admin, Operador, Fornecedor (próprias), Cliente (próprias)</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-400 p-2 font-bold">/Tracking</td>
                    <td className="border border-gray-400 p-2">Rastreamento</td>
                    <td className="border border-gray-400 p-2">Visualização 10 estágios logísticos, atualização timestamps manual/automática, cálculo distância Google Distance Matrix, upload documentos (CT-e, canhoto, fotos), SLA entregas com alertas visuais atraso, chat bidirecional motorista-central, histórico completo movimentações, expurgo SLA autorizado</td>
                    <td className="border border-gray-400 p-2">Admin, Operador</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="border border-gray-400 p-2 font-bold">/TrackingTV</td>
                    <td className="border border-gray-400 p-2">Rastreamento</td>
                    <td className="border border-gray-400 p-2">Tracking otimizado TV/monitor, auto-refresh 30s, mapa viagens em andamento, alertas visuais atrasos</td>
                    <td className="border border-gray-400 p-2">Admin, Operador</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-400 p-2 font-bold">/Fluxo</td>
                    <td className="border border-gray-400 p-2">Workflow BPMN</td>
                    <td className="border border-gray-400 p-2">Kanban customizado etapas processuais, drag-drop ordens entre etapas, prazos SLA granulares (dias/horas/minutos), 3 modos contagem prazo (início etapa, criação ordem, conclusão anterior), campos obrigatórios configuráveis por etapa, atribuição responsável/departamento, timeline visual progresso, ações rápidas (iniciar/concluir/bloquear), filtros por responsável/departamento</td>
                    <td className="border border-gray-400 p-2">Admin, Operador</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="border border-gray-400 p-2 font-bold">/FluxoTV</td>
                    <td className="border border-gray-400 p-2">Workflow BPMN</td>
                    <td className="border border-gray-400 p-2">Fluxo Kanban otimizado TV, auto-refresh, contadores etapas, indicadores SLA visuais</td>
                    <td className="border border-gray-400 p-2">Admin, Operador</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-400 p-2 font-bold">/ConfiguracaoEtapas</td>
                    <td className="border border-gray-400 p-2">Workflow BPMN</td>
                    <td className="border border-gray-400 p-2">Configuração etapas workflow (nome, cor, ordem sequencial, tipo status, prazos SLA), campos customizados por etapa (texto, checklist, anexo, monetário, booleano, data_tracking), ativar/desativar etapas, duplicar etapas existentes</td>
                    <td className="border border-gray-400 p-2">Admin</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="border border-gray-400 p-2 font-bold">/OcorrenciasGestao</td>
                    <td className="border border-gray-400 p-2">Qualidade</td>
                    <td className="border border-gray-400 p-2">Gestão tipos ocorrências customizados (4 categorias: tracking/fluxo/tarefa/diária), campos específicos configuráveis, 4 níveis gravidade (baixa/média/alta/crítica), prazos SLA por tipo, responsável padrão, Kanban workflow tratamento (aberta→andamento→resolvida), registro ocorrências avulsas, vinculação ordem/etapa, gestão diárias (carregamento/descarga) com autorização cliente, número ticket automático formato AAMMDDHHNN</td>
                    <td className="border border-gray-400 p-2">Admin, Operador</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-400 p-2 font-bold">/Gamificacao</td>
                    <td className="border border-gray-400 p-2">Engajamento</td>
                    <td className="border border-gray-400 p-2">Sistema pontuação SLA (fórmula: 60% qualidade + 40% produtividade), 5 níveis progressão (Iniciante 0-500 pts, Explorador 501-2000, Especialista 2001-5000, Mestre 5001-10000, Comandante 10000+), 3 rankings (geral todos tempos, mensal, por categoria nível), histórico métricas mensais gráficos linhas, conquistas desbloqueáveis (Primeira Ordem, 100 Ordens, SLA Perfeito Mensal), detalhamento cálculo SLA individual</td>
                    <td className="border border-gray-400 p-2">Admin, Operador</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="border border-gray-400 p-2 font-bold">/Coletas</td>
                    <td className="border border-gray-400 p-2">Portal B2B</td>
                    <td className="border border-gray-400 p-2">Dashboard coletas (solicitadas, aprovadas, reprovadas, aguardando), métricas tempo médio aprovação, filtros status/cliente/fornecedor, visualização detalhada solicitação</td>
                    <td className="border border-gray-400 p-2">Admin, Operador, Fornecedor, Cliente</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-400 p-2 font-bold">/SolicitacaoColeta</td>
                    <td className="border border-gray-400 p-2">Portal B2B</td>
                    <td className="border border-gray-400 p-2">Formulário solicitação coleta fornecedor, upload XMLs notas fiscais (importação automática dados NF-e), seleção cliente destinatário, informações adicionais carga, envio aprovação cliente, tracking status solicitação, onboarding wizard primeira solicitação</td>
                    <td className="border border-gray-400 p-2">Admin, Operador, Fornecedor</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="border border-gray-400 p-2 font-bold">/AprovacaoColeta</td>
                    <td className="border border-gray-400 p-2">Portal B2B</td>
                    <td className="border border-gray-400 p-2">Listagem solicitações coleta pendentes aprovação, visualização detalhes fornecedor/carga/NFs, aprovação com conversão automática ordem carregamento, reprovação com justificativa obrigatória, notificação automática fornecedor decisão, filtros por fornecedor/período</td>
                    <td className="border border-gray-400 p-2">Admin, Operador, Cliente</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-400 p-2 font-bold">/Recebimento</td>
                    <td className="border border-gray-400 p-2">WMS Armazém</td>
                    <td className="border border-gray-400 p-2">Criação ordens recebimento, importação XMLs NF-e (parseamento automático emitente/destinatário/valores), cadastro volumes individuais (dimensões, peso, identificador único), geração etiquetas QR Code volumes (impressão térmica), conferência física vs. XML, atualização status NF (recebida→aguardando expedição), endereçamento físico armazém (área, rua, posição)</td>
                    <td className="border border-gray-400 p-2">Admin, Operador</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="border border-gray-400 p-2 font-bold">/GestaoDeNotasFiscais</td>
                    <td className="border border-gray-400 p-2">WMS Armazém</td>
                    <td className="border border-gray-400 p-2">Listagem consolidada todas NFs sistema, filtros avançados (status, chave NF, emitente, destinatário, período emissão), busca por número/chave NF, visualização detalhes NF (dados emitente/destinatário extraídos XML, produtos, valores), gestão volumes vinculados, rastreamento localização volumes armazém, sincronização status NF↔Ordem, alertas vencimento NF (20 dias), download DANFE PDF, vinculação/desvinculação ordens carregamento</td>
                    <td className="border border-gray-400 p-2">Admin, Operador</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-400 p-2 font-bold">/EtiquetasMae</td>
                    <td className="border border-gray-400 p-2">WMS Armazém</td>
                    <td className="border border-gray-400 p-2">Criação etiquetas-mãe agrupando múltiplos volumes diferentes NFs, scanner QR Code câmera mobile, adição/remoção volumes etiqueta, impressão etiqueta-mãe consolidada, histórico alterações etiqueta, rastreamento movimentação consolidada, gestão conferência expedição</td>
                    <td className="border border-gray-400 p-2">Admin, Operador</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="border border-gray-400 p-2 font-bold">/Carregamento</td>
                    <td className="border border-gray-400 p-2">WMS Armazém</td>
                    <td className="border border-gray-400 p-2">Conferência volumes pré-carregamento (scanner QR Code), vinculação volumes→veículo, endereçamento físico veículo (posição carga), validação todas NFs presentes, checklist pré-viagem (bafômetro, documentos, rastreador), liberação viagem com registro timestamps, impressão romaneio carga</td>
                    <td className="border border-gray-400 p-2">Admin, Operador</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-400 p-2 font-bold">/OrdemDeEntrega</td>
                    <td className="border border-gray-400 p-2">WMS Armazém</td>
                    <td className="border border-gray-400 p-2">Criação ordens entrega last-mile (separação destinos finais múltiplos), seleção NFs/volumes destino, otimização sequência entregas, impressão manifesto entrega, registro comprovantes entrega por destinatário, controle devoluções, atualização status NF entregue</td>
                    <td className="border border-gray-400 p-2">Admin, Operador</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="border border-gray-400 p-2 font-bold">/Unitizacao</td>
                    <td className="border border-gray-400 p-2">WMS Armazém</td>
                    <td className="border border-gray-400 p-2">Gestão unitização cargas (pallets, caixas, containers), cálculo cubagem otimizada, distribuição peso por eixo veículo, simulação acomodação 3D, validação limites capacidade veículo</td>
                    <td className="border border-gray-400 p-2">Admin, Operador</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-400 p-2 font-bold">/AppMotorista</td>
                    <td className="border border-gray-400 p-2">Mobile</td>
                    <td className="border border-gray-400 p-2">Autenticação SMS TokenAcesso 24h (sem senha), listagem viagens ativas motorista logado, detalhes viagem (origem, destino, produto, prazo), atualização status viagem (10 estágios: aguardando carregamento→finalizado), upload documentos câmera com geolocalização automática, chat tempo real central operacional, visualização dados financeiros (adiantamento, saldo), histórico viagens anteriores, agente IA cadastro motorista (atualização CNH, dados bancários via chat WhatsApp)</td>
                    <td className="border border-gray-400 p-2">Motorista (autenticado SMS)</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="border border-gray-400 p-2 font-bold">/SAC</td>
                    <td className="border border-gray-400 p-2">Comunicação</td>
                    <td className="border border-gray-400 p-2">Chat conversacional agente IA SAC, base conhecimento FAQ sistema, histórico conversações persistente, encaminhamento humano casos complexos, avaliação satisfação pós-atendimento (NPS modal), integração WhatsApp opcional</td>
                    <td className="border border-gray-400 p-2">Todos autenticados</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-400 p-2 font-bold">/ChamadosAdmin</td>
                    <td className="border border-gray-400 p-2">Comunicação</td>
                    <td className="border border-gray-400 p-2">Gestão centralizada chamados suporte usuários, categorização (bug, dúvida, sugestão, outro), priorização (baixa/média/alta/urgente), atribuição responsável, workflow tratamento (aberto→andamento→resolvido→fechado), histórico interações, tempo médio resolução, métricas satisfação</td>
                    <td className="border border-gray-400 p-2">Admin</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="border border-gray-400 p-2 font-bold">/Motoristas</td>
                    <td className="border border-gray-400 p-2">Cadastros</td>
                    <td className="border border-gray-400 p-2">CRUD motoristas, 40+ campos (dados pessoais: nome, CPF, RG, CNH categoria/validade/documento, data nascimento, filiação, estado civil; contatos: telefone, celular, email, endereço completo CEP; documentos: foto, CNH PDF, comprovante endereço; dados bancários: banco, agência, conta, PIX; referências: pessoal, 3 comerciais, emergência; cartões: REPOM, PAMCARD, NDDCargo, Ticket), vinculação veículos (cavalo + implementos), histórico viagens motorista, consulta ANTT RNTRC, status ativo/inativo/suspenso</td>
                    <td className="border border-gray-400 p-2">Admin, Operador</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-400 p-2 font-bold">/Veiculos</td>
                    <td className="border border-gray-400 p-2">Cadastros</td>
                    <td className="border border-gray-400 p-2">CRUD veículos (cavalo, carreta, truck, van, semi-reboque), dados técnicos (placa, marca, modelo, ano fabricação/modelo, cor, RENAVAM, chassi, capacidade carga, CMT, PBT, eixos, potência, combustível), categoria/espécie/carroceria, proprietário (nome, CPF/CNPJ), documentação (CRLV PDF, licenciamento vencimento), consulta ANTT validação registro (número ANTT, validade, RNTRC, situação, apto transporte, tipo veículo), status disponível/em uso/manutenção/inativo</td>
                    <td className="border border-gray-400 p-2">Admin, Operador</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="border border-gray-400 p-2 font-bold">/Parceiros</td>
                    <td className="border border-gray-400 p-2">Cadastros</td>
                    <td className="border border-gray-400 p-2">Cadastro centralizado parceiros (clientes, fornecedores, ambos), dados cadastrais (CNPJ, razão social, nome fantasia, IE), endereço completo (rua, número, complemento, bairro, cidade, UF, CEP), contatos (telefone, email, contato principal nome/cargo/telefone/email), sincronização automática remetentes/destinatários NFe importadas, vinculação usuários sistema (fornecedor/cliente B2B), observações gerais, status ativo/inativo</td>
                    <td className="border border-gray-400 p-2">Admin, Operador</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-400 p-2 font-bold">/Operacoes</td>
                    <td className="border border-gray-400 p-2">Cadastros</td>
                    <td className="border border-gray-400 p-2">Configuração operações logísticas (nome, código, modalidade normal/expresso, prioridade baixa/média/alta/urgente), descrição detalhada, tolerância horas diárias, prazo entrega dias, flag usa agenda descarga (booleano: prazo = agenda descarga OU carregamento + dias), flag dias úteis (pular sábados/domingos), status ativo/inativo, vinculação automática ordens</td>
                    <td className="border border-gray-400 p-2">Admin, Operador</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="border border-gray-400 p-2 font-bold">/Usuarios</td>
                    <td className="border border-gray-400 p-2">Admin</td>
                    <td className="border border-gray-400 p-2">Gestão usuários sistema, aprovação cadastros pendentes (fornecedor/cliente B2B), rejeição com justificativa, edição perfis usuário (tipo: admin/operador/motorista/fornecedor/cliente, empresa vinculada, departamento, cargo, foto perfil), desativação usuários, convite novos usuários email, controle permissões granulares, filtros status cadastro (aprovado/pendente/rejeitado), contador aprovações pendentes (badge menu)</td>
                    <td className="border border-gray-400 p-2">Admin</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-400 p-2 font-bold">/Configuracoes</td>
                    <td className="border border-gray-400 p-2">Admin</td>
                    <td className="border border-gray-400 p-2">Configuração empresa (CNPJ, razão social, nome fantasia, endereço completo, telefone, email, IE, timezone), upload logo empresa (exibição layout sistema), documentação técnica produto completa (5 fases FIAP: LAND, DISCOVER, BUILD, GROWTH, LEARN), exportação documentação PDF, gestão departamentos (criação, vinculação usuários, responsável, cor identificação)</td>
                    <td className="border border-gray-400 p-2">Admin</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="border border-gray-400 p-2 font-bold">/LandingPage</td>
                    <td className="border border-gray-400 p-2">Público</td>
                    <td className="border border-gray-400 p-2">Página inicial pública marketing (hero section, features principais, depoimentos clientes, preços planos, CTA cadastro gratuito), SEO otimizado (meta tags, schema.org), responsividade completa mobile/desktop, formulário contato, links cadastro fornecedor/cliente</td>
                    <td className="border border-gray-400 p-2">Público (não autenticado)</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-400 p-2 font-bold">/PortalTransul</td>
                    <td className="border border-gray-400 p-2">Público</td>
                    <td className="border border-gray-400 p-2">Portal institucional Transul Transportes, histórico empresa, serviços oferecidos, contatos, formulário orçamento, rastreamento público carga (consulta sem login), mapa unidades, certificações</td>
                    <td className="border border-gray-400 p-2">Público (não autenticado)</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="border border-gray-400 p-2 font-bold">/OfertasPublicas</td>
                    <td className="border border-gray-400 p-2">Público</td>
                    <td className="border border-gray-400 p-2">Vitrine ofertas cargas públicas (origem, destino, tipo carga, prazo, valor), filtros geográficos, busca textual, detalhes oferta, formulário interesse (coleta dados potencial parceiro), integração automática sistema interno</td>
                    <td className="border border-gray-400 p-2">Público (não autenticado)</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-400 p-2 font-bold">/CadastroFornecedor</td>
                    <td className="border border-gray-400 p-2">Onboarding</td>
                    <td className="border border-gray-400 p-2">Formulário cadastro público fornecedor (dados empresa CNPJ/razão social, responsável nome/cargo/email/telefone), upload documentos (contrato social, comprovante endereço), aceite termos uso, criação usuário automática status pendente_aprovacao, email confirmação cadastro, aguardar aprovação admin</td>
                    <td className="border border-gray-400 p-2">Público (não autenticado)</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="border border-gray-400 p-2 font-bold">/CadastroCliente</td>
                    <td className="border border-gray-400 p-2">Onboarding</td>
                    <td className="border border-gray-400 p-2">Formulário cadastro público cliente B2B (dados empresa CNPJ/razão social, responsável nome/cargo/email/telefone), upload documentos validação, aceite termos, criação usuário status pendente_aprovacao, email confirmação, aguardar aprovação admin</td>
                    <td className="border border-gray-400 p-2">Público (não autenticado)</td>
                  </tr>
                </tbody>
              </table>
              <p className="text-xs text-gray-600 italic mt-2">Fonte: Inventário de rotas sistema (dezembro 2024)</p>
            </div>
          </div>

          {/* Modelo de Dados Completo */}
          <div>
            <p className="text-sm font-bold text-gray-900 mb-2">3.2.6 Modelo de Dados Completo e Relacionamentos</p>
            <p className="text-sm text-gray-800 leading-relaxed text-justify mb-3">
              O banco de dados PostgreSQL contempla 25 entidades normalizadas (3FN - Terceira Forma Normal), totalizando aproximadamente 450 campos (colunas) distribuídos, com integridade referencial garantida por foreign keys e índices otimizados para consultas frequentes. Todas as entidades possuem campos automáticos de auditoria: id (UUID), created_date, updated_date, created_by (email usuário criador).
            </p>
            <div className="overflow-x-auto mb-4">
              <p className="text-xs text-center font-bold text-gray-900 mb-2">Tabela 19 - Entidades do Banco de Dados e Campos Principais</p>
              <table className="w-full text-xs border-collapse border border-gray-400">
                <thead className="bg-gray-200">
                  <tr>
                    <th className="border border-gray-400 p-2 text-left" style={{width: '18%'}}>Entidade (Tabela)</th>
                    <th className="border border-gray-400 p-2 text-left" style={{width: '12%'}}>Categoria</th>
                    <th className="border border-gray-400 p-2 text-center" style={{width: '8%'}}>Campos</th>
                    <th className="border border-gray-400 p-2 text-left" style={{width: '42%'}}>Campos Principais (seleção representativa)</th>
                    <th className="border border-gray-400 p-2 text-left" style={{width: '20%'}}>Campos Obrigatórios</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-gray-400 p-2 font-bold">User</td>
                    <td className="border border-gray-400 p-2">Sistema</td>
                    <td className="border border-gray-400 p-2 text-center">15</td>
                    <td className="border border-gray-400 p-2">full_name, email, role (admin/user), tipo_perfil (operador/motorista/fornecedor/cliente), empresa_id, departamento_id, cargo, foto_url, telefone, cnpj_associado, status_cadastro (aprovado/pendente/rejeitado)</td>
                    <td className="border border-gray-400 p-2">email, full_name</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="border border-gray-400 p-2 font-bold">Empresa</td>
                    <td className="border border-gray-400 p-2">Cadastros</td>
                    <td className="border border-gray-400 p-2 text-center">14</td>
                    <td className="border border-gray-400 p-2">cnpj, razao_social, nome_fantasia, endereco, cidade, estado, cep, telefone, email, logo_url, inscricao_estadual, timezone, status (ativa/inativa/suspensa)</td>
                    <td className="border border-gray-400 p-2">cnpj, razao_social</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-400 p-2 font-bold">Departamento</td>
                    <td className="border border-gray-400 p-2">Cadastros</td>
                    <td className="border border-gray-400 p-2 text-center">7</td>
                    <td className="border border-gray-400 p-2">nome, descricao, empresa_id, cor, usuarios_ids (array), responsavel_id, ativo</td>
                    <td className="border border-gray-400 p-2">nome, empresa_id</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="border border-gray-400 p-2 font-bold">Motorista</td>
                    <td className="border border-gray-400 p-2">Cadastros</td>
                    <td className="border border-gray-400 p-2 text-center">42</td>
                    <td className="border border-gray-400 p-2">nome, cpf, rg (numero/orgao/uf), data_nascimento, nome_pai, nome_mae, estado_civil, cnh (numero/prontuario/categoria/emissao/vencimento/uf/documento_url), telefone, celular, email, endereco_completo (endereco/complemento/cep/bairro/cidade/uf), comprovante_endereco_url, rntrc, pis_pasep, cartoes (repom/pamcard/nddcargo/ticket_frete), foto_url, dados_bancarios (banco/agencia/conta/tipo_conta/pix), referencias (pessoal_nome/tel, comercial1-3_nome/tel/empresa, emergencia_nome/tel/parentesco), status (ativo/inativo/suspenso), observacoes, veiculos_vinculados (cavalo_id, implemento1-3_id)</td>
                    <td className="border border-gray-400 p-2">nome, cpf, cnh, categoria_cnh, celular</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-400 p-2 font-bold">Veiculo</td>
                    <td className="border border-gray-400 p-2">Cadastros</td>
                    <td className="border border-gray-400 p-2 text-center">35</td>
                    <td className="border border-gray-400 p-2">placa, tipo (cavalo/carreta/truck/van/semi-reboque), marca, modelo, ano_fabricacao, ano_modelo, cor, renavam, chassi, capacidade_carga, cmt, peso_bruto_total, eixos, potencia, combustivel, categoria, especie_tipo, carroceria, status (disponivel/em_uso/manutencao/inativo), proprietario (nome/documento), vencimento_licenciamento, crlv_documento_url, observacoes, antt (numero/validade/rntrc/situacao/apto_transporte/cadastrado_frota/tipo_veiculo/municipio/uf/abertura/validade/mensagem/ultima_consulta)</td>
                    <td className="border border-gray-400 p-2">placa, tipo, marca, modelo</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="border border-gray-400 p-2 font-bold">Parceiro</td>
                    <td className="border border-gray-400 p-2">Cadastros</td>
                    <td className="border border-gray-400 p-2 text-center">18</td>
                    <td className="border border-gray-400 p-2">cnpj (chave unica), razao_social, nome_fantasia, tipo (cliente/fornecedor/ambos), telefone, email, endereco_completo (endereco/numero/complemento/bairro/cidade/uf/cep), inscricao_estadual, contato (nome/cargo/telefone/email), observacoes, ativo</td>
                    <td className="border border-gray-400 p-2">cnpj, razao_social</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-400 p-2 font-bold">Operacao</td>
                    <td className="border border-gray-400 p-2">Cadastros</td>
                    <td className="border border-gray-400 p-2 text-center">9</td>
                    <td className="border border-gray-400 p-2">nome, codigo, modalidade (normal/expresso), prioridade (baixa/media/alta/urgente), descricao, tolerancia_horas, prazo_entrega_dias, prazo_entrega_usa_agenda_descarga, prazo_entrega_dias_uteis, ativo</td>
                    <td className="border border-gray-400 p-2">nome, modalidade, prioridade</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="border border-gray-400 p-2 font-bold">OrdemDeCarregamento</td>
                    <td className="border border-gray-400 p-2">Core</td>
                    <td className="border border-gray-400 p-2 text-center">88</td>
                    <td className="border border-gray-400 p-2">empresa_id, numero_carga, numero_coleta, tipo_ordem (carregamento/entrega/coleta/recebimento/ordem_filha), ordem_mae_id, tipo_negociacao (oferta/negociando/alocado), status_aprovacao (solicitado/aprovado/reprovado), status (12 opções: novo→finalizado), operacao_id, modalidade_carga, tipo_veiculo, tipo_carroceria, meio_solicitacao, datas (solicitacao/carregamento/agendamento_carga/prazo_entrega), expurgo_carregamento/entrega (flag/motivo/evidencia_url), motorista (id/nome_temp/reserva_id/mostrar_reserva), veiculos (cavalo_id/placa_temp, implemento1-3_id/placa_temp), asn, numero_cte, descarga (programacao/agendamento/senha/checklist/realizada), infolog, localizacao_atual, km_faltam, tracking_status (10 estagios), tempo_total_dias, valor_diaria, duv, numero_oc, remetente (parceiro_id/cliente/cnpj/cliente_final_nome/cnpj), origem (local/endereco/cep/bairro/cidade/uf), destinatario (parceiro_id/nome/cnpj), destino (local/endereco/cep/bairro/cidade/uf), produto, peso (total/consolidado), valor_tonelada, frete_viagem, valor_total_frete, volumes (quantidade/total_consolidado), embalagem, conteudo, qtd_entregas, tipo_operacao (FOB/CIF), viagem_pedido, notas_fiscais (texto_legado/ids_array), valores_consolidados (peso/valor/volumes NFe), observacao_carga, observacoes_internas, ocorrencias, comprovante_entrega_url, finalizacao_processo, liberacao_pamcary, vencimento_pamcary, teste_bafometro (pendente/aprovado/reprovado), checklist (pendente/conforme/nao_conforme), espelhamento, teste_rastreador, entrada/saida_galpao, mdfe (url/baixado), ciot, financeiro (adiantamento/saldo/saldo_pago/comprovante_url), comprovante_entrega_recebido, timestamps_tracking (inicio/fim_carregamento, saida_unidade, chegada_destino, inicio/fim_descarregamento), frota (propria/terceirizada/agregado/acionista), solicitado_por, fornecedor_id, aprovador_id, conferente_id</td>
                    <td className="border border-gray-400 p-2">cliente, origem, destino, produto, peso</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-400 p-2 font-bold">NotaFiscal</td>
                    <td className="border border-gray-400 p-2">Core</td>
                    <td className="border border-gray-400 p-2 text-center">45</td>
                    <td className="border border-gray-400 p-2">ordem_id, chave_nota_fiscal (44 digitos), numero_nota, serie_nota, data_hora_emissao, data_vencimento, natureza_operacao, emitente (parceiro_id/cnpj/razao_social/telefone/uf/cidade/bairro/endereco/numero/cep), destinatario (parceiro_id/cnpj/razao_social/telefone/uf/cidade/bairro/endereco/numero/cep), valor_nota_fiscal, informacoes_complementares, numero_pedido, operacao, cliente_retira, tipo_frete (CIF/FOB), custo_extra, xml_content (completo), danfe_nfe_url, volumes_ids (array), peso_total_nf (calculado soma volumes), peso_original_xml, quantidade_total_volumes_nf (calculado), volumes_original_xml, status_nf (recebida/aguardando_expedicao/em_rota_entrega/entregue/cancelada), localizacao_atual, timestamps (data_coleta_solicitada/coletado/chegada_filial/saida_para_viagem/chegada_destino_final/saida_para_entrega/entregue), numero_area (endereçamento)</td>
                    <td className="border border-gray-400 p-2">numero_nota</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="border border-gray-400 p-2 font-bold">Volume</td>
                    <td className="border border-gray-400 p-2">WMS</td>
                    <td className="border border-gray-400 p-2 text-center">19</td>
                    <td className="border border-gray-400 p-2">nota_fiscal_id, ordem_id, identificador_unico (codigo barras/QR), dimensoes (altura/largura/comprimento), m3 (calculado), peso_volume, quantidade, numero_sequencial, etiqueta_url, etiquetas_impressas, data_impressao_etiquetas, status_volume (criado/etiquetado/separado/carregado/em_transito/entregue), localizacao_atual, etiqueta_mae_id, data_vinculo_etiqueta_mae</td>
                    <td className="border border-gray-400 p-2">nota_fiscal_id, identificador_unico</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-400 p-2 font-bold">EtiquetaMae</td>
                    <td className="border border-gray-400 p-2">WMS</td>
                    <td className="border border-gray-400 p-2 text-center">14</td>
                    <td className="border border-gray-400 p-2">identificador_unico, volumes_ids (array), ordem_destino_id, tipo_agrupamento (consolidacao/transbordo/picking), status (criada/em_conferencia/carregada/entregue), peso_total_consolidado, quantidade_volumes_total, etiqueta_url, criada_por, conferida_por, data_conferencia, observacoes, localizacao_atual</td>
                    <td className="border border-gray-400 p-2">identificador_unico</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="border border-gray-400 p-2 font-bold">HistoricoEtiquetaMae</td>
                    <td className="border border-gray-400 p-2">WMS</td>
                    <td className="border border-gray-400 p-2 text-center">9</td>
                    <td className="border border-gray-400 p-2">etiqueta_mae_id, tipo_acao (criacao/adicao_volume/remocao_volume/edicao), volume_id, volume_identificador, dados_anteriores (JSON), dados_novos (JSON), observacao, usuario_id, usuario_nome</td>
                    <td className="border border-gray-400 p-2">etiqueta_mae_id, tipo_acao, usuario_id, usuario_nome</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-400 p-2 font-bold">EnderecamentoVolume</td>
                    <td className="border border-gray-400 p-2">WMS</td>
                    <td className="border border-gray-400 p-2 text-center">10</td>
                    <td className="border border-gray-400 p-2">volume_id, tipo_enderecamento (armazem/veiculo), numero_area, rua, posicao, veiculo_id, placa_veiculo, posicao_veiculo, data_enderecamento, enderecado_por</td>
                    <td className="border border-gray-400 p-2">volume_id, tipo_enderecamento</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="border border-gray-400 p-2 font-bold">Etapa</td>
                    <td className="border border-gray-400 p-2">Workflow</td>
                    <td className="border border-gray-400 p-2 text-center">17</td>
                    <td className="border border-gray-400 p-2">nome, descricao, cor, ordem (sequencial), tipo (pendente/em_andamento/concluida/bloqueada), requer_aprovacao, prazo (dias/horas/minutos), tipo_contagem_prazo (inicio_etapa/criacao_ordem/conclusao_etapa_anterior), prazo_durante_expediente, expediente (inicio/fim HH:mm), responsavel_id, departamento_responsavel_id, ativo</td>
                    <td className="border border-gray-400 p-2">nome, cor, ordem</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-400 p-2 font-bold">EtapaCampo</td>
                    <td className="border border-gray-400 p-2">Workflow</td>
                    <td className="border border-gray-400 p-2 text-center">9</td>
                    <td className="border border-gray-400 p-2">etapa_id, nome, tipo (texto/checklist/anexo/monetario/booleano/data_tracking), obrigatorio, opcoes (JSON checklist), campo_tracking (enum campos ordem), ordem, descricao, ativo</td>
                    <td className="border border-gray-400 p-2">etapa_id, nome, tipo</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="border border-gray-400 p-2 font-bold">OrdemEtapa</td>
                    <td className="border border-gray-400 p-2">Workflow</td>
                    <td className="border border-gray-400 p-2 text-center">11</td>
                    <td className="border border-gray-400 p-2">ordem_id, etapa_id, status (pendente/em_andamento/concluida/bloqueada/cancelada), data_inicio, data_conclusao, responsavel_id, departamento_responsavel_id, observacoes, prazo_previsto (calculado), aprovado_por, data_aprovacao</td>
                    <td className="border border-gray-400 p-2">ordem_id, etapa_id</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-400 p-2 font-bold">OrdemEtapaCampo</td>
                    <td className="border border-gray-400 p-2">Workflow</td>
                    <td className="border border-gray-400 p-2 text-center">6</td>
                    <td className="border border-gray-400 p-2">ordem_etapa_id, campo_id, valor (string JSON tipos complexos), nao_aplicavel, data_preenchimento, preenchido_por</td>
                    <td className="border border-gray-400 p-2">ordem_etapa_id, campo_id</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="border border-gray-400 p-2 font-bold">TipoOcorrencia</td>
                    <td className="border border-gray-400 p-2">Qualidade</td>
                    <td className="border border-gray-400 p-2 text-center">13</td>
                    <td className="border border-gray-400 p-2">nome, codigo, categoria (tracking/fluxo/tarefa/diaria), descricao, cor, icone (Lucide React), gravidade_padrao (baixa/media/alta/critica), prazo_sla_horas (DEPRECADO), prazo_sla_minutos, responsavel_padrao_id, departamento_responsavel_id, ativo, requer_imagem</td>
                    <td className="border border-gray-400 p-2">nome, categoria</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-400 p-2 font-bold">TipoOcorrenciaCampo</td>
                    <td className="border border-gray-400 p-2">Qualidade</td>
                    <td className="border border-gray-400 p-2 text-center">9</td>
                    <td className="border border-gray-400 p-2">tipo_ocorrencia_id, nome, tipo (texto/checklist/anexo/monetario/booleano/data), obrigatorio, opcoes (JSON), ordem, descricao, ativo</td>
                    <td className="border border-gray-400 p-2">tipo_ocorrencia_id, nome, tipo</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="border border-gray-400 p-2 font-bold">Ocorrencia</td>
                    <td className="border border-gray-400 p-2">Qualidade</td>
                    <td className="border border-gray-400 p-2 text-center">28</td>
                    <td className="border border-gray-400 p-2">numero_ticket (AAMMDDHHNN auto), ordem_id, ordem_etapa_id, categoria (tracking/fluxo/tarefa/diaria), tipo, tipo_ocorrencia_id, descricao_tipo, data_inicio, data_fim, observacoes, status (aberta/em_andamento/resolvida/cancelada), localizacao, gravidade, registrado_por, responsavel_id, departamento_responsavel_id, resolvido_por, imagem_url, tipo_diaria (carregamento/descarga), dias_diaria, valor_diaria (sugerido/autorizado), numero_autorizacao_cliente, status_cobranca (pendente_valor/pendente_autorizacao/autorizado_faturamento/abonado/faturado), motivo_abono, data_autorizacao, autorizado_por</td>
                    <td className="border border-gray-400 p-2">tipo, data_inicio, observacoes, categoria</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-400 p-2 font-bold">OcorrenciaCampo</td>
                    <td className="border border-gray-400 p-2">Qualidade</td>
                    <td className="border border-gray-400 p-2 text-center">6</td>
                    <td className="border border-gray-400 p-2">ocorrencia_id, campo_id, valor (string JSON), nao_aplicavel, data_preenchimento, preenchido_por</td>
                    <td className="border border-gray-400 p-2">ocorrencia_id, campo_id</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="border border-gray-400 p-2 font-bold">GamificacaoUsuario</td>
                    <td className="border border-gray-400 p-2">Gamificação</td>
                    <td className="border border-gray-400 p-2 text-center">11</td>
                    <td className="border border-gray-400 p-2">usuario_id, pontos_totais, nivel_atual (Iniciante/Explorador/Especialista/Mestre/Comandante), ranking_posicao, ordens_criadas_total, etapas_concluidas_prazo_total, ocorrencias_resolvidas_total, sla_medio_pessoal, melhor_mes, pior_mes, ultima_atualizacao</td>
                    <td className="border border-gray-400 p-2">usuario_id</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-400 p-2 font-bold">ConquistaUsuario</td>
                    <td className="border border-gray-400 p-2">Gamificação</td>
                    <td className="border border-gray-400 p-2 text-center">7</td>
                    <td className="border border-gray-400 p-2">usuario_id, conquista_codigo (identificador unico), conquista_nome, conquista_descricao, data_desbloqueio, pontos_ganhos, icone</td>
                    <td className="border border-gray-400 p-2">usuario_id, conquista_codigo</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="border border-gray-400 p-2 font-bold">AcaoPontuada</td>
                    <td className="border border-gray-400 p-2">Gamificação</td>
                    <td className="border border-gray-400 p-2 text-center">8</td>
                    <td className="border border-gray-400 p-2">usuario_id, tipo_acao (ordem_criada/etapa_concluida/ocorrencia_resolvida/sla_mantido/periodo_perfeito), referencia_id (ordem/etapa/ocorrencia), pontos_ganhos, multiplicador, data_acao, mes_referencia</td>
                    <td className="border border-gray-400 p-2">usuario_id, tipo_acao, pontos_ganhos</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-400 p-2 font-bold">MetricaMensal</td>
                    <td className="border border-gray-400 p-2">Gamificação</td>
                    <td className="border border-gray-400 p-2 text-center">12</td>
                    <td className="border border-gray-400 p-2">usuario_id, mes_referencia (AAAA-MM), pontos_mes, ordens_criadas_mes, etapas_concluidas_prazo_mes, ocorrencias_resolvidas_mes, sla_medio_mes, ranking_posicao_mes, nivel_inicio_mes, nivel_fim_mes, melhor_dia, pior_dia</td>
                    <td className="border border-gray-400 p-2">usuario_id, mes_referencia</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="border border-gray-400 p-2 font-bold">Mensagem</td>
                    <td className="border border-gray-400 p-2">Comunicação</td>
                    <td className="border border-gray-400 p-2 text-center">10</td>
                    <td className="border border-gray-400 p-2">ordem_id, remetente_id, remetente_nome, remetente_tipo (motorista/central/admin), conteudo, anexo_url, tipo_anexo (foto/documento/audio), lida, data_leitura</td>
                    <td className="border border-gray-400 p-2">ordem_id, remetente_id, remetente_nome, remetente_tipo, conteudo</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-400 p-2 font-bold">TokenAcesso</td>
                    <td className="border border-gray-400 p-2">Segurança</td>
                    <td className="border border-gray-400 p-2 text-center">7</td>
                    <td className="border border-gray-400 p-2">token (UUID unico), motorista_id, telefone, expiracao (24h), usado, data_uso</td>
                    <td className="border border-gray-400 p-2">token, motorista_id, telefone, expiracao</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="border border-gray-400 p-2 font-bold">Chamado</td>
                    <td className="border border-gray-400 p-2">Suporte</td>
                    <td className="border border-gray-400 p-2 text-center">14</td>
                    <td className="border border-gray-400 p-2">numero_chamado, usuario_id, usuario_nome, usuario_email, assunto, descricao, categoria (bug/duvida/sugestao/outro), prioridade (baixa/media/alta/urgente), status (aberto/em_andamento/resolvido/fechado), pagina_origem, anexo_url, responsavel_id, data_resolucao, resolucao</td>
                    <td className="border border-gray-400 p-2">usuario_id, assunto, descricao, categoria</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-400 p-2 font-bold">DocumentoViagem</td>
                    <td className="border border-gray-400 p-2">Documentação</td>
                    <td className="border border-gray-400 p-2 text-center">8</td>
                    <td className="border border-gray-400 p-2">ordem_id, tipo_documento (cte/mdfe/canhoto/foto_carga/outro), arquivo_url, descricao, data_upload, uploaded_by, geolocation (lat/lng JSON)</td>
                    <td className="border border-gray-400 p-2">ordem_id, tipo_documento, arquivo_url</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="border border-gray-400 p-2 font-bold">PontoRastreamento</td>
                    <td className="border border-gray-400 p-2">Tracking</td>
                    <td className="border border-gray-400 p-2 text-center">9</td>
                    <td className="border border-gray-400 p-2">ordem_id, latitude, longitude, endereco, velocidade, data_hora_registro, bateria, tipo_registro (automatico/manual), observacao</td>
                    <td className="border border-gray-400 p-2">ordem_id, latitude, longitude, data_hora_registro</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-400 p-2 font-bold">ConfiguracaoSLA</td>
                    <td className="border border-gray-400 p-2">Configuração</td>
                    <td className="border border-gray-400 p-2 text-center">12</td>
                    <td className="border border-gray-400 p-2">empresa_id, peso_qualidade (padrão 0.6), peso_produtividade (padrão 0.4), pontos_ordem_criada, pontos_etapa_concluida_prazo, penalidade_etapa_atrasada, pontos_ocorrencia_resolvida, penalidade_sla_perdido, meta_sla_minimo, meta_ordens_mes, ultima_atualizacao</td>
                    <td className="border border-gray-400 p-2">empresa_id</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="border border-gray-400 p-2 font-bold">RegistroSLAExpurgado</td>
                    <td className="border border-gray-400 p-2">Auditoria</td>
                    <td className="border border-gray-400 p-2 text-center">9</td>
                    <td className="border border-gray-400 p-2">ordem_id, tipo_expurgo (carregamento/entrega), motivo, evidencia_url, expurgado_por, expurgado_em, aprovado_por, data_aprovacao, observacoes</td>
                    <td className="border border-gray-400 p-2">ordem_id, tipo_expurgo, motivo, expurgado_por</td>
                  </tr>
                </tbody>
              </table>
              <p className="text-xs text-gray-600 italic mt-2">Fonte: Schema banco de dados PostgreSQL (dezembro 2024)</p>
            </div>

            <div className="bg-gray-50 p-4 rounded border border-gray-400">
              <p className="text-xs font-bold text-gray-900 mb-3">Relacionamentos Críticos Entre Entidades (Integridade Referencial)</p>
              <div className="grid grid-cols-2 gap-3 text-xs text-gray-800">
                <div>
                  <p className="font-bold text-gray-900 mb-1">OrdemDeCarregamento (núcleo):</p>
                  <ul className="space-y-0.5">
                    <li>• N:1 com Empresa (empresa_id FK)</li>
                    <li>• N:1 com Operacao (operacao_id FK)</li>
                    <li>• N:1 com Motorista principal (motorista_id FK)</li>
                    <li>• N:1 com Motorista reserva (motorista_reserva_id FK)</li>
                    <li>• N:1 com Veiculo cavalo (cavalo_id FK)</li>
                    <li>• N:1 com Veiculo implemento 1-3 (implemento1-3_id FK)</li>
                    <li>• N:1 com Parceiro remetente (remetente_parceiro_id FK)</li>
                    <li>• N:1 com Parceiro destinatário (destinatario_parceiro_id FK)</li>
                    <li>• 1:N com NotaFiscal (ordem_id, vinculação array notas_fiscais_ids)</li>
                    <li>• 1:N com Volume (ordem_id em Volume)</li>
                    <li>• 1:N com Ocorrencia (ordem_id em Ocorrencia)</li>
                    <li>• 1:N com OrdemEtapa (ordem_id em OrdemEtapa)</li>
                    <li>• 1:N com Mensagem (ordem_id em Mensagem)</li>
                    <li>• 1:N com DocumentoViagem (ordem_id em DocumentoViagem)</li>
                    <li>• 1:N com PontoRastreamento (ordem_id em PontoRastreamento)</li>
                    <li>• 1:1 recursivo Ordem Mãe (ordem_mae_id, tipo_ordem=ordem_filha)</li>
                  </ul>
                </div>
                <div>
                  <p className="font-bold text-gray-900 mb-1">NotaFiscal:</p>
                  <ul className="space-y-0.5">
                    <li>• N:1 com OrdemDeCarregamento (ordem_id FK)</li>
                    <li>• N:1 com Parceiro emitente (emitente_parceiro_id FK)</li>
                    <li>• N:1 com Parceiro destinatário (destinatario_parceiro_id FK)</li>
                    <li>• 1:N com Volume (nota_fiscal_id, vinculação array volumes_ids)</li>
                  </ul>
                  <p className="font-bold text-gray-900 mb-1 mt-2">Volume (WMS):</p>
                  <ul className="space-y-0.5">
                    <li>• N:1 com NotaFiscal (nota_fiscal_id FK)</li>
                    <li>• N:1 com OrdemDeCarregamento (ordem_id FK)</li>
                    <li>• N:1 com EtiquetaMae (etiqueta_mae_id FK)</li>
                    <li>• 1:1 com EnderecamentoVolume (volume_id FK)</li>
                  </ul>
                  <p className="font-bold text-gray-900 mb-1 mt-2">Etapa (Workflow):</p>
                  <ul className="space-y-0.5">
                    <li>• N:1 com User responsável (responsavel_id FK)</li>
                    <li>• N:1 com Departamento (departamento_responsavel_id FK)</li>
                    <li>• 1:N com EtapaCampo (etapa_id em EtapaCampo)</li>
                    <li>• 1:N com OrdemEtapa (etapa_id em OrdemEtapa)</li>
                  </ul>
                  <p className="font-bold text-gray-900 mb-1 mt-2">OrdemEtapa (vínculo):</p>
                  <ul className="space-y-0.5">
                    <li>• N:1 com OrdemDeCarregamento (ordem_id FK)</li>
                    <li>• N:1 com Etapa (etapa_id FK)</li>
                    <li>• N:1 com User responsável (responsavel_id FK)</li>
                    <li>• N:1 com Departamento (departamento_responsavel_id FK)</li>
                    <li>• 1:N com OrdemEtapaCampo (ordem_etapa_id)</li>
                    <li>• 1:N com Ocorrencia (ordem_etapa_id)</li>
                  </ul>
                  <p className="font-bold text-gray-900 mb-1 mt-2">TipoOcorrencia:</p>
                  <ul className="space-y-0.5">
                    <li>• N:1 com User (responsavel_padrao_id FK)</li>
                    <li>• N:1 com Departamento (departamento_responsavel_id FK)</li>
                    <li>• 1:N com TipoOcorrenciaCampo (tipo_ocorrencia_id)</li>
                    <li>• 1:N com Ocorrencia (tipo_ocorrencia_id)</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Diagrama Visual de Relacionamentos */}
            <div className="bg-white p-4 rounded border border-gray-400 mt-6 page-break-before">
              <p className="text-xs text-center font-bold text-gray-900 mb-3">Figura 15 - Diagrama de Relacionamentos do Banco de Dados (Modelo Entidade-Relacionamento)</p>
              
              <div className="bg-gray-50 p-4 rounded border border-gray-300">
                <div className="max-w-full">
                  
                  {/* Camada 1 - Entidades Base (topo) */}
                  <div className="mb-4">
                    <p className="text-[10px] font-bold text-gray-700 mb-2 text-center uppercase">CAMADA 1 - CADASTROS BASE</p>
                    <div className="flex items-start justify-center gap-3 flex-wrap">
                      <div className="bg-blue-100 border-2 border-blue-600 rounded p-2 text-center" style={{width: '110px'}}>
                        <p className="text-[10px] font-bold text-blue-900">Empresa</p>
                        <p className="text-[9px] text-gray-700 mt-0.5">cnpj, razao_social</p>
                      </div>
                      
                      <div className="bg-green-100 border-2 border-green-600 rounded p-2 text-center" style={{width: '110px'}}>
                        <p className="text-[10px] font-bold text-green-900">User</p>
                        <p className="text-[9px] text-gray-700 mt-0.5">email, tipo_perfil</p>
                      </div>
                      
                      <div className="bg-purple-100 border-2 border-purple-600 rounded p-2 text-center" style={{width: '110px'}}>
                        <p className="text-[10px] font-bold text-purple-900">Departamento</p>
                        <p className="text-[9px] text-gray-700 mt-0.5">nome, empresa_id</p>
                      </div>
                      
                      <div className="bg-orange-100 border-2 border-orange-600 rounded p-2 text-center" style={{width: '110px'}}>
                        <p className="text-[10px] font-bold text-orange-900">Parceiro</p>
                        <p className="text-[9px] text-gray-700 mt-0.5">cnpj, tipo</p>
                      </div>
                      
                      <div className="bg-teal-100 border-2 border-teal-600 rounded p-2 text-center" style={{width: '110px'}}>
                        <p className="text-[10px] font-bold text-teal-900">Operacao</p>
                        <p className="text-[9px] text-gray-700 mt-0.5">nome, prazo_dias</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Linhas de conexão */}
                  <div className="mb-1 text-center">
                    <span className="text-gray-400 text-xs">↓ ↓ ↓ ↓ ↓</span>
                  </div>
                  
                  {/* Camada 2 - Recursos */}
                  <div className="mb-4">
                    <p className="text-[10px] font-bold text-gray-700 mb-2 text-center uppercase">CAMADA 2 - RECURSOS OPERACIONAIS</p>
                    <div className="flex items-start justify-center gap-6">
                      <div className="bg-indigo-100 border-2 border-indigo-600 rounded p-2 text-center" style={{width: '120px'}}>
                        <p className="text-[10px] font-bold text-indigo-900">Motorista</p>
                        <p className="text-[9px] text-gray-700 mt-0.5">cpf, cnh, celular</p>
                      </div>
                      
                      <div className="bg-cyan-100 border-2 border-cyan-600 rounded p-2 text-center" style={{width: '120px'}}>
                        <p className="text-[10px] font-bold text-cyan-900">Veiculo</p>
                        <p className="text-[9px] text-gray-700 mt-0.5">placa, tipo, antt</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Linhas de conexão */}
                  <div className="mb-1 text-center">
                    <span className="text-gray-400 text-xs">↓ ↓</span>
                  </div>
                  
                  {/* Camada 3 - Núcleo (OrdemDeCarregamento) */}
                  <div className="mb-4">
                    <p className="text-[10px] font-bold text-gray-700 mb-2 text-center uppercase">CAMADA 3 - NÚCLEO DO SISTEMA</p>
                    <div className="flex justify-center">
                      <div className="bg-red-100 border-4 border-red-600 rounded-lg p-3 text-center shadow-md" style={{width: '240px'}}>
                        <p className="text-xs font-bold text-red-900">OrdemDeCarregamento</p>
                        <p className="text-[9px] text-gray-700 mt-0.5">numero_carga, status, tracking_status</p>
                        <p className="text-[9px] text-gray-700">origem, destino, produto, peso</p>
                        <p className="text-[9px] text-red-700 font-bold mt-0.5">88 campos | Entidade Central</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Linhas de conexão para baixo */}
                  <div className="mb-1 text-center">
                    <span className="text-gray-400 text-xs">↓ ↓ ↓ ↓ ↓</span>
                  </div>
                  
                  {/* Camada 4 - Entidades Dependentes */}
                  <div className="mb-4">
                    <p className="text-[10px] font-bold text-gray-700 mb-2 text-center uppercase">CAMADA 4 - DADOS OPERACIONAIS (1:N com Ordem)</p>
                    <div className="flex items-start justify-center gap-3 flex-wrap">
                      <div className="bg-yellow-100 border-2 border-yellow-600 rounded p-2 text-center" style={{width: '100px'}}>
                        <p className="text-[10px] font-bold text-yellow-900">NotaFiscal</p>
                        <p className="text-[9px] text-gray-700 mt-0.5">chave_nfe</p>
                        <p className="text-[9px] text-gray-700">45 campos</p>
                      </div>
                      
                      <div className="bg-pink-100 border-2 border-pink-600 rounded p-2 text-center" style={{width: '100px'}}>
                        <p className="text-[10px] font-bold text-pink-900">Ocorrencia</p>
                        <p className="text-[9px] text-gray-700 mt-0.5">ticket, tipo</p>
                        <p className="text-[9px] text-gray-700">28 campos</p>
                      </div>
                      
                      <div className="bg-violet-100 border-2 border-violet-600 rounded p-2 text-center" style={{width: '100px'}}>
                        <p className="text-[10px] font-bold text-violet-900">OrdemEtapa</p>
                        <p className="text-[9px] text-gray-700 mt-0.5">etapa_id</p>
                        <p className="text-[9px] text-gray-700">11 campos</p>
                      </div>
                      
                      <div className="bg-amber-100 border-2 border-amber-600 rounded p-2 text-center" style={{width: '100px'}}>
                        <p className="text-[10px] font-bold text-amber-900">Mensagem</p>
                        <p className="text-[9px] text-gray-700 mt-0.5">chat</p>
                        <p className="text-[9px] text-gray-700">10 campos</p>
                      </div>
                      
                      <div className="bg-lime-100 border-2 border-lime-600 rounded p-2 text-center" style={{width: '100px'}}>
                        <p className="text-[10px] font-bold text-lime-900">DocumentoViagem</p>
                        <p className="text-[9px] text-gray-700 mt-0.5">cte, canhoto</p>
                        <p className="text-[9px] text-gray-700">8 campos</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Camada 5 - WMS e Workflow (mais compacto) */}
                  <div className="mb-3">
                    <p className="text-[10px] font-bold text-gray-700 mb-2 text-center uppercase">CAMADA 5 - WMS E WORKFLOW</p>
                    <div className="grid grid-cols-2 gap-4">
                      {/* Bloco WMS */}
                      <div className="bg-white p-2 rounded border-2 border-orange-500">
                        <p className="text-[10px] font-bold text-orange-900 mb-2 text-center">SUBMÓDULO WMS</p>
                        <div className="flex flex-col items-center gap-2">
                          <div className="bg-orange-50 border border-orange-400 rounded p-1.5 text-center w-28">
                            <p className="text-[9px] font-bold text-orange-900">Volume</p>
                            <p className="text-[8px] text-gray-700">19 campos</p>
                          </div>
                          <span className="text-gray-400 text-[10px]">↓</span>
                          <div className="bg-orange-50 border border-orange-400 rounded p-1.5 text-center w-28">
                            <p className="text-[9px] font-bold text-orange-900">EtiquetaMae</p>
                            <p className="text-[8px] text-gray-700">14 campos</p>
                          </div>
                          <span className="text-gray-400 text-[10px]">↓</span>
                          <div className="bg-orange-50 border border-orange-400 rounded p-1.5 text-center w-28">
                            <p className="text-[9px] font-bold text-orange-900">Enderecamento</p>
                            <p className="text-[8px] text-gray-700">10 campos</p>
                          </div>
                        </div>
                      </div>
                      
                      {/* Bloco Workflow */}
                      <div className="bg-white p-2 rounded border-2 border-violet-500">
                        <p className="text-[10px] font-bold text-violet-900 mb-2 text-center">SUBMÓDULO WORKFLOW</p>
                        <div className="flex flex-col items-center gap-2">
                          <div className="bg-violet-50 border border-violet-400 rounded p-1.5 text-center w-28">
                            <p className="text-[9px] font-bold text-violet-900">Etapa</p>
                            <p className="text-[8px] text-gray-700">17 campos</p>
                          </div>
                          <span className="text-gray-400 text-[10px]">↓</span>
                          <div className="bg-violet-50 border border-violet-400 rounded p-1.5 text-center w-28">
                            <p className="text-[9px] font-bold text-violet-900">OrdemEtapa</p>
                            <p className="text-[8px] text-gray-700">11 campos</p>
                          </div>
                          <span className="text-gray-400 text-[10px]">↓</span>
                          <div className="bg-violet-50 border border-violet-400 rounded p-1.5 text-center w-28">
                            <p className="text-[9px] font-bold text-violet-900">OrdemEtapaCampo</p>
                            <p className="text-[8px] text-gray-700">6 campos</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Camada 6 - Qualidade e Gamificação (mais compacto) */}
                  <div className="mb-3">
                    <p className="text-[10px] font-bold text-gray-700 mb-2 text-center uppercase">CAMADA 6 - QUALIDADE E GAMIFICAÇÃO</p>
                    <div className="grid grid-cols-2 gap-4">
                      {/* Bloco Qualidade */}
                      <div className="bg-white p-2 rounded border-2 border-red-500">
                        <p className="text-[10px] font-bold text-red-900 mb-2 text-center">QUALIDADE</p>
                        <div className="flex items-center justify-center gap-2">
                          <div className="bg-red-50 border border-red-400 rounded p-1.5 text-center w-24">
                            <p className="text-[9px] font-bold text-red-900">TipoOcorrencia</p>
                            <p className="text-[8px] text-gray-700">13 cps</p>
                          </div>
                          <span className="text-gray-400 text-xs">→</span>
                          <div className="bg-red-50 border border-red-400 rounded p-1.5 text-center w-24">
                            <p className="text-[9px] font-bold text-red-900">Ocorrencia</p>
                            <p className="text-[8px] text-gray-700">28 cps</p>
                          </div>
                        </div>
                      </div>
                      
                      {/* Bloco Gamificação */}
                      <div className="bg-white p-2 rounded border-2 border-indigo-500">
                        <p className="text-[10px] font-bold text-indigo-900 mb-2 text-center">GAMIFICAÇÃO</p>
                        <div className="flex flex-col items-center gap-1.5">
                          <div className="bg-indigo-50 border border-indigo-400 rounded p-1.5 text-center w-32">
                            <p className="text-[9px] font-bold text-indigo-900">GamificacaoUsuario</p>
                            <p className="text-[8px] text-gray-700">pontos, nivel, ranking</p>
                          </div>
                          <div className="flex gap-2">
                            <div className="bg-indigo-50 border border-indigo-400 rounded p-1.5 text-center w-24">
                              <p className="text-[8px] font-bold text-indigo-900">MetricaMensal</p>
                            </div>
                            <div className="bg-indigo-50 border border-indigo-400 rounded p-1.5 text-center w-24">
                              <p className="text-[8px] font-bold text-indigo-900">AcaoPontuada</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Legenda e Relacionamentos em colunas */}
                  <div className="mt-3 pt-3 border-t border-gray-300">
                    <div className="grid grid-cols-3 gap-3">
                      {/* Legenda */}
                      <div>
                        <p className="text-[9px] font-bold text-gray-900 mb-1">LEGENDA DE RELACIONAMENTOS:</p>
                        <ul className="text-[8px] text-gray-800 space-y-0.5">
                          <li className="flex items-center gap-1">
                            <div className="w-6 h-0.5 bg-gray-600"></div>
                            <span>1:N (Um para Muitos)</span>
                          </li>
                          <li className="flex items-center gap-1">
                            <div className="w-6 h-0.5 bg-blue-600"></div>
                            <span>N:N (Muitos para Muitos)</span>
                          </li>
                          <li className="flex items-center gap-1">
                            <div className="w-6 h-0.5 bg-green-600 border border-green-600"></div>
                            <span>1:1 (Um para Um)</span>
                          </li>
                        </ul>
                      </div>
                      
                      {/* Relacionamentos Principais */}
                      <div>
                        <p className="text-[9px] font-bold text-green-900 mb-1">RELS PRINCIPAIS (N:1):</p>
                        <ul className="text-[8px] text-gray-800 space-y-0.5">
                          <li>• Ordem → Empresa</li>
                          <li>• Ordem → Operacao</li>
                          <li>• Ordem → Motorista</li>
                          <li>• Ordem → Veiculo</li>
                          <li>• NotaFiscal → Ordem</li>
                          <li>• Volume → NotaFiscal</li>
                          <li>• Ocorrencia → Ordem</li>
                        </ul>
                      </div>
                      
                      {/* Relacionamentos Associativos */}
                      <div>
                        <p className="text-[9px] font-bold text-purple-900 mb-1">RELS ASSOCIATIVOS:</p>
                        <ul className="text-[8px] text-gray-800 space-y-0.5">
                          <li>• OrdemEtapa (ponte)</li>
                          <li>• OrdemEtapaCampo</li>
                          <li>• OcorrenciaCampo</li>
                          <li>• EnderecamentoVol (1:1)</li>
                          <li>• EtiquetaMae (1:N)</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  
                  {/* Fluxo de Dados */}
                  <div className="mt-3 bg-blue-50 p-2 rounded border border-blue-300">
                    <p className="text-[9px] font-bold text-blue-900 mb-1">FLUXO PRINCIPAL DE DADOS:</p>
                    <div className="grid grid-cols-2 gap-2">
                      <ol className="text-[8px] text-gray-800 space-y-0.5 ml-3">
                        <li><strong>1.</strong> Empresa e User são base (multi-tenancy)</li>
                        <li><strong>2.</strong> Motorista e Veiculo vinculam-se a Ordens</li>
                        <li><strong>3.</strong> OrdemDeCarregamento é núcleo (88 campos, 15+ FKs)</li>
                        <li><strong>4.</strong> NotaFiscal vincula-se a Ordem e desdobra em Volumes</li>
                      </ol>
                      <ol className="text-[8px] text-gray-800 space-y-0.5 ml-3" start="5">
                        <li><strong>5.</strong> OrdemEtapa conecta Ordem ao Workflow (N:N)</li>
                        <li><strong>6.</strong> Ocorrencia registra problemas (Ordem ou OrdemEtapa)</li>
                        <li><strong>7.</strong> GamificacaoUsuario agrega métricas calculadas</li>
                      </ol>
                    </div>
                  </div>
                  
                </div>
              </div>
              
              <p className="text-[9px] text-gray-600 italic mt-2 text-center">Fonte: Diagrama elaborado pelo autor baseado no schema PostgreSQL (2024)</p>
              
              <div className="mt-2 bg-yellow-50 p-2 rounded border border-yellow-300">
                <p className="text-[9px] font-bold text-yellow-900 mb-0.5">NOTA TÉCNICA:</p>
                <p className="text-[8px] text-gray-800 leading-relaxed text-justify">
                  Sistema completo contempla 25 entidades (~450 campos totais). Todas FKs possuem índices para otimização. Campos auditoria (id, created_date, updated_date, created_by) adicionados automaticamente pela Base44. Relacionamentos N:N implementados via tabelas associativas seguindo normalização 3FN.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Testes e Validação */}
        <div className="bg-white p-5 rounded border border-gray-400">
          <h3 className="text-base font-bold text-gray-900 mb-3">3.3 Testes Abrangentes e Validação Técnica</h3>
          
          {/* Tipos de Testes */}
          <div className="mb-4">
            <p className="text-sm font-bold text-gray-900 mb-2">3.3.1 Estratégia de Testes Implementada</p>
            <p className="text-sm text-gray-800 leading-relaxed text-justify mb-3">
              Processo de Quality Assurance (QA) estruturado em quatro camadas complementares, executado continuamente durante todas as sprints. Objetivo: garantir confiabilidade técnica (0 bugs críticos em produção), usabilidade validada (SUS maior ou igual a 75) e performance adequada (LCP menor ou igual a 2,5s).
            </p>
            <div className="overflow-x-auto">
              <p className="text-xs text-center font-bold text-gray-900 mb-2">Tabela 11 - Resultados dos Testes de Qualidade</p>
              <table className="w-full text-xs border-collapse border border-gray-400">
                <thead className="bg-gray-200">
                  <tr>
                    <th className="border border-gray-400 p-2 text-left">Tipo de Teste</th>
                    <th className="border border-gray-400 p-2 text-left">Metodologia</th>
                    <th className="border border-gray-400 p-2 text-center">Meta</th>
                    <th className="border border-gray-400 p-2 text-center">Resultado</th>
                    <th className="border border-gray-400 p-2 text-left">Ferramentas</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-gray-400 p-2 font-bold">Testes de Usabilidade</td>
                    <td className="border border-gray-400 p-2">18 usuários reais, 12 tarefas críticas, protocolo think-aloud</td>
                    <td className="border border-gray-400 p-2 text-center">SUS maior ou igual a 75</td>
                    <td className="border border-gray-400 p-2 text-center font-bold text-green-700">84,2 ✓</td>
                    <td className="border border-gray-400 p-2">Maze, UserTesting, SUS survey</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="border border-gray-400 p-2 font-bold">Testes Funcionais</td>
                    <td className="border border-gray-400 p-2">187 casos de teste manuais (happy path + edge cases), 3 QA testers</td>
                    <td className="border border-gray-400 p-2 text-center">0 bugs críticos</td>
                    <td className="border border-gray-400 p-2 text-center font-bold text-green-700">0 críticos ✓</td>
                    <td className="border border-gray-400 p-2">Planilhas Google Sheets, Jira bug tracking</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-400 p-2 font-bold">Testes de Performance</td>
                    <td className="border border-gray-400 p-2">Core Web Vitals (LCP, FID, CLS), testes carga concurrent users</td>
                    <td className="border border-gray-400 p-2 text-center">LCP menor ou igual a 2,5s</td>
                    <td className="border border-gray-400 p-2 text-center font-bold text-green-700">1,8s ✓</td>
                    <td className="border border-gray-400 p-2">Lighthouse, WebPageTest</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="border border-gray-400 p-2 font-bold">Testes de Segurança</td>
                    <td className="border border-gray-400 p-2">OWASP Top 10, penetration testing básico, validação permissões RBAC</td>
                    <td className="border border-gray-400 p-2 text-center">0 vulnerabilidades alta</td>
                    <td className="border border-gray-400 p-2 text-center font-bold text-green-700">0 alta ✓</td>
                    <td className="border border-gray-400 p-2">OWASP ZAP, validação manual</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-400 p-2 font-bold">Testes de Compatibilidade</td>
                    <td className="border border-gray-400 p-2">5 navegadores (Chrome, Firefox, Safari, Edge, Samsung Internet), 8 dispositivos mobile</td>
                    <td className="border border-gray-400 p-2 text-center">100% funcional</td>
                    <td className="border border-gray-400 p-2 text-center font-bold text-green-700">100% ✓</td>
                    <td className="border border-gray-400 p-2">BrowserStack, testes reais iOS/Android</td>
                  </tr>
                </tbody>
              </table>
              <p className="text-xs text-gray-600 italic mt-2">Fonte: Relatórios de QA dezembro 2024</p>
            </div>
          </div>

          {/* Bugs Identificados */}
          <div className="mb-4">
            <p className="text-sm font-bold text-gray-900 mb-2">3.3.2 Bugs Identificados e Corrigidos</p>
            <div className="overflow-x-auto">
              <p className="text-xs text-center font-bold text-gray-900 mb-2">Tabela 12 - Distribuição de Bugs por Severidade e Resolução</p>
              <table className="w-full text-xs border-collapse border border-gray-400">
                <thead className="bg-gray-200">
                  <tr>
                    <th className="border border-gray-400 p-2 text-left">Severidade</th>
                    <th className="border border-gray-400 p-2 text-center">Quantidade Identificada</th>
                    <th className="border border-gray-400 p-2 text-center">Corrigidos Pré-Lançamento</th>
                    <th className="border border-gray-400 p-2 text-left">Exemplos</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-gray-400 p-2 font-bold text-red-700">Crítico (Blocker)</td>
                    <td className="border border-gray-400 p-2 text-center">3</td>
                    <td className="border border-gray-400 p-2 text-center font-bold text-green-700">3 (100%)</td>
                    <td className="border border-gray-400 p-2">Falha autenticação Safari iOS 14, crash upload arquivo maior que 10MB, cálculo SLA incorreto timezone</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="border border-gray-400 p-2 font-bold text-orange-700">Alto (Major)</td>
                    <td className="border border-gray-400 p-2 text-center">12</td>
                    <td className="border border-gray-400 p-2 text-center font-bold text-green-700">12 (100%)</td>
                    <td className="border border-gray-400 p-2">Filtros não persistindo após reload, duplicação mensagens chat, gráfico vazio sem dados</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-400 p-2 font-bold text-yellow-700">Médio (Normal)</td>
                    <td className="border border-gray-400 p-2 text-center">28</td>
                    <td className="border border-gray-400 p-2 text-center font-bold text-green-700">26 (93%)</td>
                    <td className="border border-gray-400 p-2">Alinhamento mobile, tooltips cortados, máscaras input inconsistentes</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="border border-gray-400 p-2 font-bold text-blue-700">Baixo (Minor)</td>
                    <td className="border border-gray-400 p-2 text-center">41</td>
                    <td className="border border-gray-400 p-2 text-center text-orange-700">18 (44%)</td>
                    <td className="border border-gray-400 p-2">Espaçamentos inconsistentes, textos não traduzidos, animações lentas</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-400 p-2 font-bold" colSpan="1">TOTAL</td>
                    <td className="border border-gray-400 p-2 text-center font-bold">84</td>
                    <td className="border border-gray-400 p-2 text-center font-bold text-green-700">59 (70%)</td>
                    <td className="border border-gray-400 p-2 italic">Bugs baixos não-bloqueadores postergados para versões futuras</td>
                  </tr>
                </tbody>
              </table>
              <p className="text-xs text-gray-600 italic mt-2">Fonte: Jira Bug Tracking (dezembro 2024)</p>
            </div>
          </div>

          {/* Performance */}
          <div>
            <p className="text-sm font-bold text-gray-900 mb-2">3.3.3 Métricas de Performance (Core Web Vitals)</p>
            <div className="overflow-x-auto">
              <p className="text-xs text-center font-bold text-gray-900 mb-2">Tabela 13 - Resultados Core Web Vitals (Lighthouse)</p>
              <table className="w-full text-xs border-collapse border border-gray-400">
                <thead className="bg-gray-200">
                  <tr>
                    <th className="border border-gray-400 p-2 text-left">Métrica</th>
                    <th className="border border-gray-400 p-2 text-left">Descrição</th>
                    <th className="border border-gray-400 p-2 text-center">Limite Aceitável (Google)</th>
                    <th className="border border-gray-400 p-2 text-center">Resultado Obtido</th>
                    <th className="border border-gray-400 p-2 text-center">Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-gray-400 p-2 font-bold">LCP (Largest Contentful Paint)</td>
                    <td className="border border-gray-400 p-2">Tempo carregamento conteúdo principal visível</td>
                    <td className="border border-gray-400 p-2 text-center">menor ou igual a 2,5s</td>
                    <td className="border border-gray-400 p-2 text-center font-bold text-green-700">1,8s</td>
                    <td className="border border-gray-400 p-2 text-center">✓ Bom</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="border border-gray-400 p-2 font-bold">FID (First Input Delay)</td>
                    <td className="border border-gray-400 p-2">Tempo resposta primeira interação usuário</td>
                    <td className="border border-gray-400 p-2 text-center">menor ou igual a 100ms</td>
                    <td className="border border-gray-400 p-2 text-center font-bold text-green-700">42ms</td>
                    <td className="border border-gray-400 p-2 text-center">✓ Bom</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-400 p-2 font-bold">CLS (Cumulative Layout Shift)</td>
                    <td className="border border-gray-400 p-2">Estabilidade layout (evita elementos "pulando")</td>
                    <td className="border border-gray-400 p-2 text-center">menor ou igual a 0,1</td>
                    <td className="border border-gray-400 p-2 text-center font-bold text-green-700">0,03</td>
                    <td className="border border-gray-400 p-2 text-center">✓ Bom</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="border border-gray-400 p-2 font-bold">TTI (Time to Interactive)</td>
                    <td className="border border-gray-400 p-2">Tempo até interface totalmente interativa</td>
                    <td className="border border-gray-400 p-2 text-center">menor ou igual a 3,8s</td>
                    <td className="border border-gray-400 p-2 text-center font-bold text-green-700">2,9s</td>
                    <td className="border border-gray-400 p-2 text-center">✓ Bom</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-400 p-2 font-bold">Lighthouse Score (Overall)</td>
                    <td className="border border-gray-400 p-2">Pontuação geral performance/acessibilidade/SEO</td>
                    <td className="border border-gray-400 p-2 text-center">maior ou igual a 80/100</td>
                    <td className="border border-gray-400 p-2 text-center font-bold text-green-700">91/100</td>
                    <td className="border border-gray-400 p-2 text-center">✓ Excelente</td>
                  </tr>
                </tbody>
              </table>
              <p className="text-xs text-gray-600 italic mt-2">Fonte: Lighthouse CI (dezembro 2024). Testes realizados em conexão 4G simulada (400kbps)</p>
            </div>
            <p className="text-sm text-gray-800 leading-relaxed text-justify mt-3">
              <strong>Otimizações implementadas:</strong> (i) Lazy loading de componentes pesados (React.lazy), reduzindo bundle inicial de 2,8MB → 890KB (-68%), (ii) Imagens otimizadas WebP com fallback (economia 40% bandwidth), (iii) Code splitting por rota (cada página carrega apenas JS necessário), (iv) React Query com staleTime configurado (reduz requisições redundantes), (v) Debounce em inputs de busca (300ms), (vi) Skeleton loaders evitando CLS durante carregamentos assíncronos.
            </p>
          </div>

          {/* Testes de Carga */}
          <div className="mb-4">
            <p className="text-sm font-bold text-gray-900 mb-2">3.3.4 Testes de Carga e Escalabilidade</p>
            <p className="text-sm text-gray-800 leading-relaxed text-justify mb-3">
              Simulação de cenários de uso real com crescimento gradual de usuários simultâneos, validando capacidade do backend (Base44 serverless) escalar automaticamente sem degradação.
            </p>
            <div className="overflow-x-auto">
              <p className="text-xs text-center font-bold text-gray-900 mb-2">Tabela 14 - Resultados Testes de Carga</p>
              <table className="w-full text-xs border-collapse border border-gray-400">
                <thead className="bg-gray-200">
                  <tr>
                    <th className="border border-gray-400 p-2 text-left">Cenário</th>
                    <th className="border border-gray-400 p-2 text-center">Usuários Simultâneos</th>
                    <th className="border border-gray-400 p-2 text-center">Requisições/min</th>
                    <th className="border border-gray-400 p-2 text-center">Tempo Resposta Médio</th>
                    <th className="border border-gray-400 p-2 text-center">Taxa Erro</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-gray-400 p-2">Uso Normal (95% tempo)</td>
                    <td className="border border-gray-400 p-2 text-center">10-15</td>
                    <td className="border border-gray-400 p-2 text-center">180-240</td>
                    <td className="border border-gray-400 p-2 text-center font-bold text-green-700">320ms</td>
                    <td className="border border-gray-400 p-2 text-center font-bold text-green-700">0,1%</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="border border-gray-400 p-2">Pico Manhã (8h-10h)</td>
                    <td className="border border-gray-400 p-2 text-center">25-35</td>
                    <td className="border border-gray-400 p-2 text-center">420-580</td>
                    <td className="border border-gray-400 p-2 text-center font-bold text-green-700">580ms</td>
                    <td className="border border-gray-400 p-2 text-center font-bold text-green-700">0,3%</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-400 p-2">Stress Test (2x capacidade)</td>
                    <td className="border border-gray-400 p-2 text-center">70</td>
                    <td className="border border-gray-400 p-2 text-center">1.200</td>
                    <td className="border border-gray-400 p-2 text-center font-bold text-green-700">1.240ms</td>
                    <td className="border border-gray-400 p-2 text-center font-bold text-green-700">1,2%</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="border border-gray-400 p-2">Spike Test (crescimento abrupto)</td>
                    <td className="border border-gray-400 p-2 text-center">0→100 em 30s</td>
                    <td className="border border-gray-400 p-2 text-center">1.800</td>
                    <td className="border border-gray-400 p-2 text-center font-bold text-green-700">1.890ms</td>
                    <td className="border border-gray-400 p-2 text-center font-bold text-green-700">2,1%</td>
                  </tr>
                </tbody>
              </table>
              <p className="text-xs text-gray-600 italic mt-2">Fonte: Testes de carga com k6 (dezembro 2024). Duração: 30 min por cenário</p>
            </div>
            <p className="text-sm text-gray-800 leading-relaxed text-justify mt-3">
              <strong>Conclusão dos testes:</strong> Sistema demonstrou capacidade de escalar horizontalmente sem intervenção manual, mantendo tempos de resposta aceitáveis (menor que 2s) mesmo em cenários de stress com 2x a capacidade planejada. Arquitetura serverless (Base44) provou-se adequada para padrão de uso esperado (10-35 usuários simultâneos), com margem de segurança para crescimento futuro.
            </p>
          </div>
        </div>

        {/* Preparação Lançamento */}
        <div className="bg-white p-5 rounded border border-gray-400">
          <h3 className="text-base font-bold text-gray-900 mb-3">3.4 Preparação Final para Lançamento (Go-Live)</h3>
          
          <div className="mb-4">
            <p className="text-sm font-bold text-gray-900 mb-2">3.4.1 Checklist de Pré-Lançamento</p>
            <div className="overflow-x-auto">
              <p className="text-xs text-center font-bold text-gray-900 mb-2">Tabela 15 - Checklist de Validação Pré-Lançamento</p>
              <table className="w-full text-xs border-collapse border border-gray-400">
                <thead className="bg-gray-200">
                  <tr>
                    <th className="border border-gray-400 p-2 text-left">Categoria</th>
                    <th className="border border-gray-400 p-2 text-left">Item Verificado</th>
                    <th className="border border-gray-400 p-2 text-center">Status</th>
                    <th className="border border-gray-400 p-2 text-left">Data Conclusão</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-gray-400 p-2 font-bold" rowSpan="4">Técnico</td>
                    <td className="border border-gray-400 p-2">Todos os 7 módulos MVP funcionais e testados</td>
                    <td className="border border-gray-400 p-2 text-center font-bold text-green-700">✓ Completo</td>
                    <td className="border border-gray-400 p-2">15/12/2024</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="border border-gray-400 p-2">0 bugs críticos/altos em produção</td>
                    <td className="border border-gray-400 p-2 text-center font-bold text-green-700">✓ Completo</td>
                    <td className="border border-gray-400 p-2">15/12/2024</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-400 p-2">Performance Lighthouse maior ou igual a 80/100</td>
                    <td className="border border-gray-400 p-2 text-center font-bold text-green-700">✓ Completo (91)</td>
                    <td className="border border-gray-400 p-2">18/12/2024</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="border border-gray-400 p-2">Compatibilidade 5 navegadores principais</td>
                    <td className="border border-gray-400 p-2 text-center font-bold text-green-700">✓ Completo</td>
                    <td className="border border-gray-400 p-2">20/12/2024</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-400 p-2 font-bold" rowSpan="3">Conteúdo</td>
                    <td className="border border-gray-400 p-2">Dados de exemplo (seed data) 3 empresas piloto</td>
                    <td className="border border-gray-400 p-2 text-center font-bold text-green-700">✓ Completo</td>
                    <td className="border border-gray-400 p-2">22/12/2024</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="border border-gray-400 p-2">Documentação usuário (help tooltips inline)</td>
                    <td className="border border-gray-400 p-2 text-center font-bold text-green-700">✓ Completo</td>
                    <td className="border border-gray-400 p-2">28/12/2024</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-400 p-2">Vídeos tutoriais 5 módulos principais (YouTube)</td>
                    <td className="border border-gray-400 p-2 text-center text-orange-700">⟳ Em progresso</td>
                    <td className="border border-gray-400 p-2">Prev: 10/01/2025</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="border border-gray-400 p-2 font-bold" rowSpan="2">Segurança</td>
                    <td className="border border-gray-400 p-2">Validação OWASP Top 10 (0 vulnerabilidades críticas)</td>
                    <td className="border border-gray-400 p-2 text-center font-bold text-green-700">✓ Completo</td>
                    <td className="border border-gray-400 p-2">26/12/2024</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-400 p-2">Política de privacidade LGPD + termos de uso</td>
                    <td className="border border-gray-400 p-2 text-center font-bold text-green-700">✓ Completo</td>
                    <td className="border border-gray-400 p-2">30/12/2024</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="border border-gray-400 p-2 font-bold" rowSpan="2">Negócio</td>
                    <td className="border border-gray-400 p-2">Onboarding interativo novos usuários (wizard)</td>
                    <td className="border border-gray-400 p-2 text-center font-bold text-green-700">✓ Completo</td>
                    <td className="border border-gray-400 p-2">02/01/2025</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-400 p-2">Plano de suporte pós-lançamento (chat, email, WhatsApp)</td>
                    <td className="border border-gray-400 p-2 text-center font-bold text-green-700">✓ Completo</td>
                    <td className="border border-gray-400 p-2">05/01/2025</td>
                  </tr>
                </tbody>
              </table>
              <p className="text-xs text-gray-600 italic mt-2">Fonte: Checklist de lançamento (janeiro 2025)</p>
            </div>
          </div>

          {/* Estratégia de Lançamento */}
          <div>
            <p className="text-sm font-bold text-gray-900 mb-2">3.4.2 Estratégia de Lançamento Soft Launch</p>
            <p className="text-sm text-gray-800 leading-relaxed text-justify mb-3">
              Optou-se por estratégia de <em>soft launch</em> (lançamento controlado) ao invés de <em>hard launch</em> (lançamento massivo), minimizando riscos e permitindo ajustes baseados em feedback real. Três ondas progressivas de acesso:
            </p>
            <div className="space-y-2">
              <div className="bg-green-50 p-3 rounded border border-green-200">
                <p className="text-xs font-bold text-green-900">ONDA 1 (06-15 Janeiro/2025): Piloto Interno - 3 empresas beta testers</p>
                <p className="text-xs text-gray-800 mt-1">• Transportadora Transul (empresa-mãe do projeto, 12 operadores, 25 motoristas ativos)</p>
                <p className="text-xs text-gray-800">• Logs Transportes (parceiro comercial, 8 operadores, 18 motoristas)</p>
                <p className="text-xs text-gray-800">• Via Rápida Logística (cliente indicado, 5 operadores, 12 motoristas)</p>
                <p className="text-xs text-gray-800 mt-1"><strong>Objetivo:</strong> Coletar feedback crítico ambiente produção real, validar fluxos completos ponta-a-ponta, identificar bugs edge cases não detectados em testes.</p>
              </div>
              <div className="bg-blue-50 p-3 rounded border border-blue-200">
                <p className="text-xs font-bold text-blue-900">ONDA 2 (16-31 Janeiro/2025): Expansão Controlada - 10 empresas adicionais</p>
                <p className="text-xs text-gray-800 mt-1">Critérios seleção: empresas médio porte (15-50 operações/mês), perfil tecnológico médio (já usam WhatsApp/Excel), dispostas fornecer feedback estruturado.</p>
                <p className="text-xs text-gray-800 mt-1"><strong>Objetivo:</strong> Validar escalabilidade (50+ usuários simultâneos), ajustar onboarding baseado em dúvidas recorrentes, medir métricas iniciais adoção (DAU/MAU).</p>
              </div>
              <div className="bg-purple-50 p-3 rounded border border-purple-200">
                <p className="text-xs font-bold text-purple-900">ONDA 3 (Fevereiro/2025): Lançamento Público - Abertura geral</p>
                <p className="text-xs text-gray-800 mt-1">Landing page pública (SEO otimizado), trial gratuito 30 dias (freemium), estratégia marketing digital (Google Ads, LinkedIn, grupos Facebook transportadoras).</p>
                <p className="text-xs text-gray-800 mt-1"><strong>Meta:</strong> 50 empresas ativas (500+ usuários) até março/2025, taxa conversão trial→pago maior ou igual a 35%, NPS maior ou igual a 8,0 mantido.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Lições Aprendidas */}
        <div className="bg-white p-5 rounded border border-gray-400">
          <h3 className="text-base font-bold text-gray-900 mb-3">3.5 Lições Aprendidas e Melhorias Contínuas</h3>
          <div className="overflow-x-auto">
            <p className="text-xs text-center font-bold text-gray-900 mb-2">Tabela 16 - Principais Lições Aprendidas (Retrospectivas)</p>
            <table className="w-full text-xs border-collapse border border-gray-400">
              <thead className="bg-gray-200">
                <tr>
                  <th className="border border-gray-400 p-2 text-left" style={{width: '25%'}}>O que Funcionou Bem (Keep)</th>
                  <th className="border border-gray-400 p-2 text-left" style={{width: '25%'}}>O que Não Funcionou (Problem)</th>
                  <th className="border border-gray-400 p-2 text-left" style={{width: '25%'}}>Tentativas Realizadas (Try)</th>
                  <th className="border border-gray-400 p-2 text-left" style={{width: '25%'}}>Ações Futuras (Action)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-gray-400 p-2">Testes de usabilidade semanais com usuários reais evitaram retrabalho massivo</td>
                  <td className="border border-gray-400 p-2">Subestimação complexidade integração ANTT (3 sprints vs. 1 planejado)</td>
                  <td className="border border-gray-400 p-2">Implementação cache agressivo ANTT (7 dias) reduziu API calls 90%</td>
                  <td className="border border-gray-400 p-2">Manter testes usabilidade contínuos pós-lançamento (mensais)</td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="border border-gray-400 p-2">Plataforma Base44 acelerou 60% desenvolvimento backend</td>
                  <td className="border border-gray-400 p-2">Gamificação inicialmente complexa demais, usuários confusos</td>
                  <td className="border border-gray-400 p-2">Simplificação fórmula SLA, remoção níveis intermediários (de 10 para 5)</td>
                  <td className="border border-gray-400 p-2">Gamificação progressiva: liberar features avançadas após 30 dias uso</td>
                </tr>
                <tr>
                  <td className="border border-gray-400 p-2">Componentização granular facilitou manutenção e testes isolados</td>
                  <td className="border border-gray-400 p-2">Falta documentação técnica código causou dúvidas onboarding devs</td>
                  <td className="border border-gray-400 p-2">Criação README.md por módulo + JSDoc inline principais funções</td>
                  <td className="border border-gray-400 p-2">Implementar Storybook (documentação viva componentes)</td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="border border-gray-400 p-2">Soft launch permitiu ajustes críticos antes exposição massiva</td>
                  <td className="border border-gray-400 p-2">Período 6 meses apertado para 7 módulos, sprint final apressado</td>
                  <td className="border border-gray-400 p-2">Extensão 2 semanas polimento (Dez 16-31), postergando lançamento</td>
                  <td className="border border-gray-400 p-2">Próximos MVPs: estimar +20% buffer cronograma</td>
                </tr>
              </tbody>
            </table>
            <p className="text-xs text-gray-600 italic mt-2">Fonte: Retrospectivas mensais Scrum (2024)</p>
          </div>
        </div>

        {/* Resultados Iniciais */}
        <div className="bg-white p-5 rounded border border-gray-400">
          <h3 className="text-base font-bold text-gray-900 mb-3">3.6 Resultados Iniciais Pós-Lançamento (30 dias)</h3>
          <p className="text-sm text-gray-800 leading-relaxed text-justify mb-3">
            Os primeiros 30 dias de operação (06 janeiro - 05 fevereiro/2025) com as três empresas piloto demonstraram validação técnica e de mercado, conforme já apresentado na Tabela 7 (Fase DISCOVER). Adicionalmente, métricas técnicas complementares foram monitoradas:
          </p>
          <div className="overflow-x-auto">
            <p className="text-xs text-center font-bold text-gray-900 mb-2">Tabela 17 - Métricas Técnicas Complementares (30 dias)</p>
            <table className="w-full text-xs border-collapse border border-gray-400">
              <thead className="bg-gray-200">
                <tr>
                  <th className="border border-gray-400 p-2 text-left">Métrica</th>
                  <th className="border border-gray-400 p-2 text-center">Resultado</th>
                  <th className="border border-gray-400 p-2 text-left">Observação</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-gray-400 p-2">Uptime sistema</td>
                  <td className="border border-gray-400 p-2 text-center font-bold text-green-700">99,7%</td>
                  <td className="border border-gray-400 p-2">1 downtime de 2h14min (manutenção Base44 programada)</td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="border border-gray-400 p-2">Tempo médio resposta backend</td>
                  <td className="border border-gray-400 p-2 text-center font-bold text-green-700">280ms</td>
                  <td className="border border-gray-400 p-2">P95: 620ms. P99: 1.180ms</td>
                </tr>
                <tr>
                  <td className="border border-gray-400 p-2">Taxa erro requisições API</td>
                  <td className="border border-gray-400 p-2 text-center font-bold text-green-700">0,4%</td>
                  <td className="border border-gray-400 p-2">Maioria: timeouts ANTT API externa (fora controle)</td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="border border-gray-400 p-2">Crash rate (erros JavaScript não tratados)</td>
                  <td className="border border-gray-400 p-2 text-center font-bold text-green-700">0,08%</td>
                  <td className="border border-gray-400 p-2">6 crashes únicos (correção hotfix 24h)</td>
                </tr>
                <tr>
                  <td className="border border-gray-400 p-2">Tickets suporte registrados</td>
                  <td className="border border-gray-400 p-2 text-center">47 tickets</td>
                  <td className="border border-gray-400 p-2">68% dúvidas funcionalidade (não bugs), 32% bugs menores</td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="border border-gray-400 p-2">Tempo médio resolução ticket</td>
                  <td className="border border-gray-400 p-2 text-center font-bold text-green-700">4,2 horas</td>
                  <td className="border border-gray-400 p-2">Meta: menor que 8h. Bugs críticos: menor que 2h (0 ocorrências)</td>
                </tr>
              </tbody>
            </table>
            <p className="text-xs text-gray-600 italic mt-2">Fonte: Monitoramento Base44 Analytics + Zendesk (janeiro-fevereiro 2025)</p>
          </div>
          <p className="text-sm text-gray-800 leading-relaxed text-justify mt-3">
            <strong>Síntese da Fase BUILD:</strong> A combinação de prototipagem iterativa (3 ciclos validação, SUS 84,2/100), desenvolvimento ágil com stack low-code moderna (Base44 + React, 342 story points entregues) e testes abrangentes multi-camada (84 bugs identificados, 100% críticos corrigidos) resultou em solução funcional validada técnica e comercialmente. Resultados preliminares 30 dias (NPS 8,3, SLA 88%, redução 77% tempo cadastro) confirmam product-market fit e sustentam evolução para Fase SHIP (expansão comercial e roadmap features avançadas).
          </p>
        </div>
      </div>
    </section>
  );
}