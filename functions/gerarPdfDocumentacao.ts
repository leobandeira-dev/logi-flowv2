import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';
import { jsPDF } from 'npm:jspdf@2.5.2';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const normalizeText = (text) => {
      const accentsMap = {
        'á': 'a', 'à': 'a', 'ã': 'a', 'â': 'a', 'ä': 'a',
        'é': 'e', 'è': 'e', 'ê': 'e', 'ë': 'e',
        'í': 'i', 'ì': 'i', 'î': 'i', 'ï': 'i',
        'ó': 'o', 'ò': 'o', 'õ': 'o', 'ô': 'o', 'ö': 'o',
        'ú': 'u', 'ù': 'u', 'û': 'u', 'ü': 'u',
        'ç': 'c', 'ñ': 'n',
        'Á': 'A', 'À': 'A', 'Ã': 'A', 'Â': 'A', 'Ä': 'A',
        'É': 'E', 'È': 'E', 'Ê': 'E', 'Ë': 'E',
        'Í': 'I', 'Ì': 'I', 'Î': 'I', 'Ï': 'I',
        'Ó': 'O', 'Ò': 'O', 'Õ': 'O', 'Ô': 'O', 'Ö': 'O',
        'Ú': 'U', 'Ù': 'U', 'Û': 'U', 'Ü': 'U',
        'Ç': 'C', 'Ñ': 'N'
      };
      
      return text.split('').map(char => accentsMap[char] || char).join('');
    };

    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    let y = 20;
    let currentOrientation = 'portrait';
    const portraitHeight = 297;
    const landscapeHeight = 210;
    let pageHeight = portraitHeight;
    const marginBottom = 20;
    const lineHeight = 5;
    const marginLeft = 20;
    const marginRight = 20;
    let pageWidth = 210;

    const switchToLandscape = () => {
      doc.addPage('a4', 'landscape');
      currentOrientation = 'landscape';
      pageHeight = landscapeHeight;
      pageWidth = 297;
      y = 20;
    };

    const switchToPortrait = () => {
      doc.addPage('a4', 'portrait');
      currentOrientation = 'portrait';
      pageHeight = portraitHeight;
      pageWidth = 210;
      y = 20;
    };

    const checkPageBreak = (additionalSpace = 0) => {
      if (y + additionalSpace > pageHeight - marginBottom) {
        if (currentOrientation === 'landscape') {
          doc.addPage('a4', 'landscape');
        } else {
          doc.addPage('a4', 'portrait');
        }
        y = 20;
        return true;
      }
      return false;
    };

    const addText = (text, size = 10, isBold = false, align = 'left', maxWidth = null) => {
      const normalizedText = normalizeText(text);
      checkPageBreak();
      
      doc.setFontSize(size);
      doc.setFont('helvetica', isBold ? 'bold' : 'normal');
      
      if (align === 'center') {
        doc.text(normalizedText, pageWidth / 2, y, { align: 'center' });
        y += lineHeight;
      } else {
        const effectiveMaxWidth = maxWidth || (pageWidth - marginLeft - marginRight);
        const lines = doc.splitTextToSize(normalizedText, effectiveMaxWidth);
        lines.forEach((line) => {
          checkPageBreak();
          doc.text(line, marginLeft, y);
          y += lineHeight;
        });
      }
    };

    const addSpace = (amount = 5) => {
      y += amount;
      checkPageBreak();
    };

    const addTable = (headers, rows, cellWidths, fontSize = 7) => {
      const cellHeight = 6;
      const padding = 1.5;
      
      checkPageBreak(cellHeight * (rows.length + 1));
      
      // Headers
      doc.setFillColor(220, 220, 220);
      let xPos = marginLeft;
      headers.forEach((header, i) => {
        doc.rect(xPos, y, cellWidths[i], cellHeight, 'FD');
        xPos += cellWidths[i];
      });
      
      doc.setFontSize(fontSize);
      doc.setFont('helvetica', 'bold');
      xPos = marginLeft;
      headers.forEach((header, i) => {
        const text = normalizeText(header);
        doc.text(text, xPos + padding, y + 4);
        xPos += cellWidths[i];
      });
      
      y += cellHeight;
      doc.setFont('helvetica', 'normal');
      
      // Rows
      rows.forEach((row) => {
        if (y > pageHeight - marginBottom - cellHeight) {
          if (currentOrientation === 'landscape') {
            doc.addPage('a4', 'landscape');
          } else {
            doc.addPage('a4', 'portrait');
          }
          y = 20;
        }
        
        xPos = marginLeft;
        row.forEach((cell, i) => {
          doc.rect(xPos, y, cellWidths[i], cellHeight);
          xPos += cellWidths[i];
        });
        
        xPos = marginLeft;
        row.forEach((cell, i) => {
          const cellText = normalizeText(String(cell || ''));
          const maxCellWidth = cellWidths[i] - (padding * 2);
          const lines = doc.splitTextToSize(cellText, maxCellWidth);
          doc.text(lines[0] || '', xPos + padding, y + 4);
          xPos += cellWidths[i];
        });
        
        y += cellHeight;
      });
    };

    // ========== CAPA ==========
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    const title1 = normalizeText('DOCUMENTACAO TECNICA DO SISTEMA DE');
    const title2 = normalizeText('GESTAO LOGISTICA INTEGRADA');
    doc.text(title1, 105, 80, { align: 'center' });
    doc.text(title2, 105, 88, { align: 'center' });
    
    doc.setFontSize(13);
    doc.setFont('helvetica', 'normal');
    doc.text(normalizeText('Framework de Gerenciamento de Produto em Cinco Fases'), 105, 110, { align: 'center' });
    
    doc.setFontSize(10);
    doc.text(normalizeText('Area: Gestao de Produtos e Tecnologia da Informacao'), 105, 140, { align: 'center' });
    doc.text(normalizeText('Data de Elaboracao: Dezembro de 2025'), 105, 147, { align: 'center' });
    
    y = 200;
    
    // ========== NOVA PÁGINA - RESUMO EXECUTIVO ==========
    switchToPortrait();
    
    addText('RESUMO EXECUTIVO', 14, true);
    addSpace(3);
    addText('Este documento apresenta a documentacao tecnica completa de um sistema de gestao logistica integrada, desenvolvido segundo o framework de Product Management da FIAP. O sistema foi concebido para atender as demandas do setor de transporte rodoviario de cargas, incorporando praticas de BPMN (Business Process Model and Notation), PDCA (Plan-Do-Check-Act) e metodologia 5S para garantir eficiencia operacional e melhoria continua.', 10);
    addSpace(5);
    addText('A plataforma contempla doze modulos integrados, abrangendo desde a gestao de ordens de carregamento ate sistemas de gamificacao e metricas de SLA (Service Level Agreement), visando promover uma cultura de excelencia operacional atraves de processos mensuraveis e rastreaveis.', 10);
    
    // ========== FASE 1: LAND ==========
    switchToPortrait();
    doc.setFillColor(60, 60, 60);
    doc.rect(marginLeft, y, pageWidth - marginLeft - marginRight, 12, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text(normalizeText('1. FASE LAND - IDENTIFICACAO DO PROBLEMA E ANALISE DE OPORTUNIDADE'), marginLeft + 3, y + 8);
    doc.setTextColor(0, 0, 0);
    y += 16;
    
    addText('1.1 Problema Identificado', 11, true);
    addSpace(3);
    addText('Contexto: Empresas de transporte rodoviario de cargas enfrentam desafios criticos de gestao operacional decorrentes da ausencia de sistemas integrados, resultando em processos fragmentados, baixa visibilidade e impossibilidade de mensuracao objetiva de performance, conforme detalhado a seguir:', 9);
    addSpace(4);
    
    // Manifestações detalhadas do problema
    addText('Processos manuais sem indicadores mensuraveis: Gestao operacional conduzida mediante planilhas Excel descentralizadas, comunicacao via WhatsApp pessoal dos operadores, ligacoes telefonicas nao registradas e anotacoes em cadernos fisicos. Inexistencia de metricas objetivas de performance impossibilita identificacao de gargalos operacionais, mensuracao de produtividade individual, estabelecimento de metas baseadas em dados historicos e implementacao de ciclos PDCA (Plan-Do-Check-Act).', 8);
    addSpace(3);
    
    addText('Multiplas rotas nao padronizadas para execucao de mesma tarefa: Ausencia de workflow estruturado resulta em que cada operador desenvolva procedimentos proprios para cadastro de ordens, atualizacao de status e resolucao de problemas. Impossibilidade de auditoria: nao ha registro de quem executou determinada acao, em qual momento foi realizada ou qual foi a sequencia de modificacoes em determinado registro.', 8);
    addSpace(3);
    
    addText('Ausencia de rastreabilidade de entregas e materiais armazenados: Inexistencia de controle individualizado de volumes impede localizacao fisica de mercadorias no armazem, gestao de inventario em tempo real e identificacao de extravios. Clientes frequentemente demandam informacoes sobre localizacao de cargas sem que a transportadora possua dados atualizados para fornecimento de resposta.', 8);
    addSpace(3);
    
    addText('Falta de visibilidade do avanco de processos internos: Gestores nao possuem conhecimento em tempo real sobre status de etapas administrativas (cadastro, emissao de documentos, aprovacoes financeiras, liberacao de cargas). Gargalos processuais sao identificados apenas quando ja geraram atraso critico.', 8);
    addSpace(3);
    
    addText('Gestao reativa de problemas sem analise de causa raiz: Ocorrencias (acidentes, atrasos, avarias, problemas mecanicos) nao sao registradas sistematicamente. Informacoes sobre problemas permanecem em conversas de WhatsApp sem categorizacao, impossibilitando analise de recorrencia.', 8);
    addSpace(3);
    
    addText('Falta de metricas objetivas e impossibilidade de melhoria continua: SLA de entregas nao e mensurado de forma automatizada. Performance individual de operadores e motoristas nao e avaliada mediante criterios objetivos, impedindo reconhecimento meritocratico.', 8);
    addSpace(3);
    
    addText('Comunicacao fragmentada sem historico centralizado: Motoristas utilizam canais pessoais (WhatsApp particular, telefone celular proprio) para comunicacao com central operacional. Inexistencia de historico estruturado de comunicacoes impede auditoria em caso de contestacoes.', 8);
    addSpace(8);

    addText('1.2 Contexto Empresarial e Posicionamento de Mercado', 11, true);
    addSpace(3);
    addText('A LAF LOGISTICA (CNPJ 34.579.341/0001-85), fundada por Leonardo Silva Bandeira (CPF 042.332.453-52), atua desde 2018 no segmento de consultoria e desenvolvimento de solucoes tecnologicas para o setor de transporte rodoviario de cargas, com sede em Sao Paulo e atuacao regional nas regioes Sul e Sudeste do Brasil. A empresa especializa-se em mapeamento de processos logisticos manuais e sua transformacao em sistemas digitais integrados com indicadores de performance mensuraveis, atendendo principalmente transportadoras de medio porte que buscam modernizacao operacional e ganhos de eficiencia.', 9);
    addSpace(3);
    addText('Modelo de negocio: A LAF oferece servicos consultoria especializada combinando (i) mapeamento e documentacao processos operacionais mediante tecnicas BPM (Business Process Management), (ii) identificacao gargalos e oportunidades automacao atraves analise fluxo valor, (iii) desenvolvimento software sob medida digitalizando processos mapeados, implementando controles, validacoes e metricas SLA automatizadas, (iv) treinamento equipes operacionais adocao novas ferramentas e (v) suporte continuo com ciclos melhoria baseados dados coletados pelo sistema.', 9);
    addSpace(3);
    addText('Posicionamento em termos de inovacao: A LAF LOGISTICA posiciona-se como parceira estrategica transformacao digital transportadoras, diferenciando-se consultorias tradicionais (apenas mapeiam processos sem implementar solucoes) e fornecedores software generico (produtos padronizados sem personalizacao). Diferencial competitivo fundamenta-se na combinacao unica expertise logistica com capacidade desenvolvimento agil software, permitindo criacao solucoes que refletem fielmente processos reais operacoes transporte. Iniciativa sistema proprio representa evolucao natural core business: transformar conhecimento tacito processos manuais em plataformas tecnologicas escalaveis promovem visibilidade, padronizacao e cultura excelencia atraves metricas objetivas.', 9);
    addSpace(8);

    addText('1.3 Segmentacao de Mercado e Inteligencia Competitiva', 11, true);
    addSpace(3);
    addText('A analise de mercado foi conduzida utilizando dados da Agencia Nacional de Transportes Terrestres (ANTT), relatorios setoriais da Confederacao Nacional do Transporte (CNT) e pesquisas primarias, revelando oportunidade significativa no segmento de software para gestao logistica.', 9);
    addSpace(3);
    addText('TAM (Total Addressable Market): Aproximadamente 150.000 empresas de transporte rodoviario de cargas cadastradas na ANTT em territorio nacional, representando o mercado total enderecavel. Faturamento anual estimado do setor: R$ 180 bilhoes (CNT, 2024);', 8);
    addSpace(2);
    addText('SAM (Serviceable Available Market): Cerca de 25.000 empresas de medio e grande porte (faturamento anual superior a R$ 2 milhoes), constituindo o mercado atendivel pelo produto. Estas empresas possuem maturidade operacional suficiente para adocao de TMS e representam 85% do faturamento total do setor;', 8);
    addSpace(2);
    addText('SOM (Serviceable Obtainable Market): Estimativa de 500 empresas com foco regional nas regioes Sul e Sudeste (SP, MG, PR, SC, RS), representando o mercado obtivel a curto prazo (12 meses). Criterios de segmentacao: frota minima de 20 veiculos, atuacao regional, receptividade a solucoes SaaS;', 8);
    addSpace(3);
    addText('Inteligencia de Mercado - Concorrencia: Analise competitiva identificou tres categorias de competidores: (a) TMS tradicionais de mercado (Onedoc, Fretebras TMS, TEL) - solucoes maduras, precos elevados (R$ 299-R$ 450/mes), curva de aprendizado complexa; (b) Planilhas e ferramentas genericas (Excel, Google Sheets, Trello) - baixo custo, flexibilidade limitada, ausencia de features especializadas; (c) Plataformas de frete spot (Frete Rapido, CargoX, TruckPad) - focadas em cotacao e matching, gestao operacional limitada. Lacuna identificada: ausencia de solucao acessivel (sub R$ 200/mes) com gamificacao integrada e workflow customizavel.', 8);
    
    // Análise PESTEL - PAISAGEM
    switchToLandscape();
    addText('1.4 Analise PESTEL do Ambiente Macro', 11, true);
    addSpace(3);
    addText('Tabela 1 - Analise PESTEL do Setor de Transporte Rodoviario de Cargas', 9, false, 'center');
    addSpace(3);
    
    addTable(
      ['Dimensao', 'Fatores Identificados', 'Impacto no Produto - Funcionalidades Implementadas'],
      [
        ['Politico', 'Regulamentacao setor ANTT (Res 5.849/2019), obrigatoriedade doc eletronica (CT-e, MDF-e NT 2020.003)', 'Modulo Veiculos integra consulta ANTT validacao automatica. Campo numero_cte em OrdemDeCarregamento. Campo mdfe_url armazenamento MDF-e. Funcao consultaBuonny analise risco'],
        ['Economico', 'Taxa crescimento PIB 2.9% 2024, alta custos operacionais combustivel +12%, necessidade otimizacao recursos', 'Modelo precificacao freemium (gratuito 50 ordens/mes, Starter R$ 199). Calculo automatico diarias carregamento/descarga. Gestao adiantamentos/saldo controle fluxo caixa'],
        ['Social', 'Escassez motoristas profissionais (deficit 200 mil CNT), envelhecimento categoria (media 48 anos), isolamento ocupacional', 'App Motorista interface simplificada auth SMS (Token 24h) reduz barreira tecnologica. Chat bidirecional combate isolamento. Sistema gamificacao rankings/conquistas reconhecimento'],
        ['Tecnologico', 'Adocao crescente cloud computing (SaaS crescimento 32% a.a.), IoT rastreamento GPS, IA generativa OCR/LLM, APIs publicas ANTT/SEFAZ', 'Arquitetura SaaS multi-tenant (Base44) PostgreSQL. Funcao buscarNotaFiscalMeuDanfe API MeuDanfe. Import PDF OCR via Core.ExtractData. Agente SAC LLM Core.InvokeLLM. Funcao calcularDistancia Google Distance Matrix'],
        ['Ambiental', 'Pressao sustentabilidade (Acordo Paris), exigencias embarcadores relatorios emissoes Escopo 3, otimizacao rotas reducao combustivel', 'Funcionalidade Ordens Filhas consolidacao cargas multiplos destinos reduz viagens vazias. Campo km_faltam prepara calculo pegada carbono (CO2 = km x fator x peso). Roadmap Q3/25 relatorios sustentabilidade'],
        ['Legal', 'LGPD Lei 13.709/2018 (multas ate 2% faturamento), regulamentacao ANTT Res 5.849, exigencias doc eletronica, responsabilidade civil extravio CC Art 750', 'Conformidade LGPD: campos created_by rastreabilidade acoes, exclusao logica preserva dados auditoria. TokenAcesso expiracao 24h. Uploads storage privado assinatura temporaria CreateFileSignedUrl. Auditoria updated_date/created_date todos registros']
      ],
      [25, 115, 117]
    );
    addSpace(3);
    addText('Fonte: Analise PESTEL elaborada pelo autor (2025)', 7, false, 'center');
    addSpace(10);

    // Análise SWOT - PAISAGEM
    addText('1.5 Analise SWOT', 11, true);
    addSpace(3);
    addText('Tabela 2 - Matriz SWOT', 9, false, 'center');
    addSpace(3);
    
    addTable(
      ['Fatores Internos', 'Fatores Externos'],
      [
        ['FORCAS (Strengths)', 'OPORTUNIDADES (Opportunities)'],
        ['Conhecimento profundo dominio logistico (desenvolvedor setor 5+ anos)', 'Mercado fragmentado baixa penetracao TMS (15% empresas usam especializados)'],
        ['Produto desenvolvido resolver dor real validada operacao', 'Crescimento e-commerce demandando rastreabilidade'],
        ['Arquitetura modular evolucao incremental', 'Pressao grandes embarcadores visibilidade B2B'],
        ['Sistema gamificacao unico mercado TMS', 'Tendencia adocao SaaS PMEs (reducao CAPEX)'],
        ['Workflow totalmente customizavel diferencial competitivo', 'Expansao geografica regioes Norte e Nordeste'],
        ['Custo desenvolvimento reduzido (Base44)', 'Verticalizacao nichos (frigorificadas, perigosas)'],
        ['Interface moderna vs concorrentes legados', 'Integracoes ERPs populares (SAP, TOTVS, Bling)'],
        ['Time-to-market acelerado (6 meses conceito MVP)', 'Marketplace fretes conectar embarcadores transportadoras']
      ],
      [128, 129]
    );
    addSpace(5);
    
    addTable(
      ['Fatores Internos', 'Fatores Externos'],
      [
        ['FRAQUEZAS (Weaknesses)', 'AMEACAS (Threats)'],
        ['Marca desconhecida mercado (empresa nova software)', 'Concorrentes estabelecidos recursos significativos'],
        ['Equipe reduzida (unico desenvolvedor)', 'Resistencia mudanca setor conservador'],
        ['Ausencia cases sucesso publicos', 'Ciclo vendas B2B longo (3-6 meses fechamento)'],
        ['Budget limitado marketing vendas', 'Dependencia terceiros (Base44, APIs externas)'],
        ['Falta integracoes nativas ERPs estabelecidos', 'Volatilidade economica afetando investimentos tecnologia'],
        ['Rastreamento GPS ainda nao implementado', 'Evolucao rapida tecnologias (risco obsolescencia)'],
        ['Documentacao tecnica tutoriais em desenvolvimento', 'Entrada players internacionais mercado brasileiro'],
        ['Ausencia certificacoes seguranca (ISO 27001, SOC 2)', 'Alteracoes regulatorias (ANTT, LGPD) demandando adaptacoes']
      ],
      [128, 129]
    );
    addSpace(3);
    addText('Fonte: Analise SWOT elaborada pelo autor (2025)', 7, false, 'center');
    addSpace(10);

    // Estratégia de Inovação
    switchToPortrait();
    addText('1.6 Estrategia de Inovacao Tecnologica para Diferenciacao Competitiva', 11, true);
    addSpace(3);
    addText('A estrategia de inovacao foi estruturada em tres pilares distintivos para diferenciacao em mercado competitivo dominado por solucoes legadas:', 9);
    addSpace(3);
    addText('Pilar 1 - Gamificacao Aplicada a Operacoes Logisticas: Implementacao pioneira de sistema de pontuacao, niveis de progressao e rankings para incentivo de boas praticas operacionais. Diferencial competitivo: nenhum TMS nacional incorpora gamificacao como feature nativa. Objetivo: transformar metricas de SLA de "obrigacao administrativa" em "engajamento motivacional". Impacto esperado: aumento de 25% na taxa de cumprimento de prazos, reducao de 40% no tempo de resolucao de ocorrencias e aumento de 35% no engajamento organizacional.', 8);
    addSpace(3);
    addText('Pilar 2 - Workflow Customizavel (BPMN): Flexibilidade total para configuracao de processos internos especificos de cada empresa, contrastando com concorrentes que oferecem workflows rigidos e pre-definidos. Permite parametrizacao de etapas, prazos SLA granulares (dias/horas/minutos), campos de dados obrigatorios especificos por etapa e tres modalidades de contagem de prazo. Objetivo: adaptacao do sistema a processos existentes da empresa ao inves de forcar reengenharia completa de processos. Reduz resistencia a adocao e tempo de implantacao (de 3 meses para 2 semanas).', 8);
    addSpace(3);
    addText('Pilar 3 - Simplicidade e Experiencia do Usuario (UX): Interface moderna desenvolvida com componentes acessiveis (WCAG 2.1), navegacao intuitiva sem necessidade de treinamento extensivo, atalhos de teclado para power users (tecla "H" para data/hora atual), modo escuro nativo, design mobile-first e onboarding guiado com tooltips contextuais. Objetivo: reduzir curva de aprendizado de 40 horas (media dos concorrentes) para 4 horas. Estrategia validada atraves de testes de usabilidade com cinco participantes, resultando em System Usability Scale (SUS) de 82/100 (classificacao "Excelente").', 8);
    addSpace(8);

    addText('1.7 Proposta de Valor', 11, true);
    addSpace(3);
    addText('A proposta de valor do sistema fundamenta-se na transformacao digital de operacoes logisticas atraves da implementacao de processos visuais, mensuraveis e gamificados. Os pilares estrategicos incluem:', 9);
    addSpace(3);
    addText('Transparencia operacional: Implementacao de dez estagios de rastreamento integrados a workflows customizaveis, proporcionando visibilidade total das operacoes. Clientes acessam portal com localizacao em tempo real, elimina necessidade de ligacoes telefonicas para consulta de status e reduz ansiedade mediante informacao proativa;', 8);
    addSpace(2);
    addText('Automacao de processos e eliminacao de retrabalho: Calculos automaticos de indicadores de SLA, gestao de diarias e controle de prazos, reduzindo intervencao manual e minimizando erros operacionais. Importacao de PDFs via OCR elimina digitacao de 60+ campos, sincronizacao automatica de parceiros via CNPJ e validacao integrada com ANTT reduzem tempo de cadastro em 70%;', 8);
    addSpace(2);
    addText('Padronizacao e rastreabilidade completa: Workflow BPMN garante que todos os operadores sigam mesma sequencia de etapas, auditoria completa registra quem executou cada acao e quando, historico imutavel permite resolucao de contestacoes e conformidade com requisitos de qualidade (ISO 9001);', 8);
    addSpace(2);
    addText('Engajamento organizacional: Sistema de gamificacao baseado em metricas objetivas, promovendo cultura de excelencia e reconhecimento meritocratico. Rankings mensais incentivam competicao saudavel, feedback constante substitui avaliacoes anuais subjetivas e progressao por niveis proporciona senso de desenvolvimento profissional.', 8);
    addSpace(8);

    addText('1.8 Definicao de Personas', 11, true);
    addSpace(3);
    addText('Foram identificadas quatro personas principais atraves de entrevistas estruturadas e observacao participante, conforme apresentado na Tabela 3.', 9);
    addSpace(3);
    addText('Tabela 3 - Caracterizacao de Personas e Solucoes Propostas', 9, false, 'center');
    addSpace(3);
    
    addTable(
      ['Persona', 'Problematica Relatada', 'Solucao Tecnologica'],
      [
        ['Gestor de Operacoes', 'Falta de visao consolidada das operacoes em andamento', 'Dashboard analitico com alertas automatizados'],
        ['Operador Logistico', 'Tempo excessivo dedicado a busca de informacoes', 'Sistema de busca avancada com filtros predefinidos'],
        ['Motorista', 'Necessidade de multiplas comunicacoes telefonicas', 'Aplicativo movel com atualizacao simplificada'],
        ['Cliente/Fornecedor', 'Ausencia de rastreabilidade de cargas', 'Portal web com notificacoes em tempo real']
      ],
      [45, 60, 65]
    );
    addSpace(3);
    addText('Fonte: Pesquisa de campo realizada pelo autor (2024)', 7, false, 'center');

    // ========== FASE 2: DISCOVER ==========
    switchToPortrait();
    doc.setFillColor(60, 60, 60);
    doc.rect(marginLeft, y, pageWidth - marginLeft - marginRight, 12, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text(normalizeText('2. FASE DISCOVER - IDENTIFICACAO DE PROBLEMAS, PESQUISA DE USUARIOS E ESCOPO MVP'), marginLeft + 3, y + 8);
    doc.setTextColor(0, 0, 0);
    y += 16;

    addText('2.1 Mapeamento Detalhado de Personas', 11, true);
    addSpace(3);
    addText('Com base nos problemas identificados na Fase LAND, foram definidas quatro personas principais atraves de pesquisa primaria com 29 participantes, observacao participante em operacoes reais (96 horas acumuladas) e workshops de Design Thinking. A caracterizacao detalhada contempla perfil demografico, objetivos, frustracoes e necessidades tecnologicas, conforme Quadro 1 e Tabela 4.', 9);
    addSpace(3);
    
    addText('Quadro 1 - Composicao da Amostra de Pesquisa', 9, false, 'center');
    addSpace(3);
    
    addTable(
      ['Perfil', 'Quantidade', 'Metodo de Pesquisa', 'Duracao Total'],
      [
        ['Gestores de operacoes', '5', 'Entrevista semiestruturada', '45 min cada (total: 225 min)'],
        ['Operadores logisticos', '12', 'Entrevista + observacao participante (shadowing)', '30 min + 8h observacao cada'],
        ['Motoristas', '8', '2 grupos focais', '90 min cada grupo (total: 180 min)'],
        ['Clientes B2B', '4', 'Entrevista em profundidade', '60 min cada (total: 240 min)']
      ],
      [45, 20, 60, 45]
    );
    addSpace(3);
    addText('Fonte: Pesquisa primaria agosto-novembro 2024', 7, false, 'center');
    addSpace(8);

    // Tabela Personas - PAISAGEM
    switchToLandscape();
    addText('Tabela 4 - Caracterizacao Detalhada de Personas', 10, true, 'center');
    addSpace(3);
    
    addTable(
      ['Persona', 'Perfil Demografico', 'Objetivos Principais', 'Frustracoes e Dores', 'Necessidades Tecnologicas'],
      [
        ['Gestor Operacoes', '35-50a. Admin/Logistica. 10+ anos', 'Garantir SLA 95%+, reduzir custos, gerenciar 10-15 operadores, reportar KPIs', 'Falta visibilidade consolidada, dependencia ligacoes status, sem metricas objetivas', 'Dashboard executivo tempo real, alertas automaticos desvios, relatorios exportaveis'],
        ['Operador Logistico', '22-40a. Medio a superior incompl. 1-5 anos', 'Cadastrar ordens rapidamente, atualizar status, comunicar motoristas, resolver ocorrencias', 'Tempo excessivo planilhas, retrabalho digitando, multiplas ferramentas, sem reconhecimento', 'Cadastro rapido autocomplete, importacao PDFs/XMLs, chat integrado, gamificacao'],
        ['Motorista', '28-55a. Fundamental a medio. 5-20 anos dirigindo', 'Receber informacoes claras, atualizar status facilmente, comunicar problemas, receber pagamentos', 'Comunicacao fragmentada, multiplas ligacoes, baixa familiaridade tecnologia, isolamento', 'App simples (sem senha), acesso SMS, botoes grandes, chat direto, upload camera'],
        ['Cliente/Fornecedor B2B', '30-55a. Superior. Gerente Compras/Logistica', 'Rastrear entregas tempo real, solicitar coletas self-service, notificacoes proativas', 'Dependencia telefone consultas, processo coleta burocratico, falta transparencia', 'Portal auto-atendimento, solicitacao coletas online, tracking mapa, notificacoes automaticas']
      ],
      [32, 50, 52, 52, 61]
    );
    addSpace(3);
    addText('Fonte: Pesquisa primaria com 29 participantes (2024)', 7, false, 'center');
    addSpace(10);

    // Mapas de Empatia - RETRATO (Resumido)
    switchToPortrait();
    addText('2.2 Mapas de Empatia das Personas Principais (Sintese)', 11, true);
    addSpace(3);
    
    addText('OPERADOR LOGISTICO:', 9, true);
    addText('Pensamentos: Necessidade agilidade, preocupacao esquecimento, ausencia reconhecimento, receio erros criticos', 8);
    addText('Acoes: 5-10 ligacoes/dia motorista, redigitacao dados, alternancia ferramentas, reconstrucao info perdidas', 8);
    addText('Dor: Tempo perdido busca informacoes fragmentadas, sem reconhecimento objetivo desempenho', 8);
    addText('Ganho: Sistema unificado, feedback constante performance, reconhecimento meritocratico', 8);
    addSpace(4);
    
    addText('MOTORISTA:', 9, true);
    addText('Pensamentos: Resistencia tecnologia complexa, isolamento profissional, desvalorizacao trabalho', 8);
    addText('Acoes: Contato telefonico frequente, evidencias canais informais, solicitacoes repetitivas, arquivamento fisico', 8);
    addText('Dor: Isolamento operacional, comunicacao fragmentada, ferramentas complexas, falta reconhecimento', 8);
    addText('Ganho: App extremamente simples sem senha, acesso facil SMS, comunicacao direta, reconhecimento bom desempenho', 8);
    addSpace(4);
    
    addText('FORNECEDOR B2B:', 9, true);
    addText('Pensamentos: Necessidade agilizacao entregas, excesso burocracia, falta visibilidade status', 8);
    addText('Acoes: Consultas telefonicas repetitivas, transmissao XMLs email, formularios redundantes, espera prolongada', 8);
    addText('Dor: Processo burocratico solicitacao, falta transparencia, dependencia ligacoes, tempo excessivo aprovacao', 8);
    addText('Ganho: Portal self-service solicitar coletas, rastreamento tempo real, aprovacao rapida, notificacoes automaticas', 8);
    addSpace(4);
    
    addText('CLIENTE B2B:', 9, true);
    addText('Pensamentos: Necessidade rastreabilidade cargas, limitacao disponibilidade consultas, urgencia aprovacoes', 8);
    addText('Acoes: Consultas telefonicas transportadora, aprovacao/reprovacao email, verificacao manual planilhas', 8);
    addText('Dor: Falta rastreabilidade tempo real, processo manual aprovacao, dependencia comunicacao telefonica', 8);
    addText('Ganho: Portal aprovacoes online, tracking automatico, notificacoes proativas, dashboard consolidado entregas', 8);
    addSpace(8);

    // Benchmarking Competitivo - PAISAGEM
    switchToLandscape();
    addText('2.5 Benchmarking Competitivo', 11, true);
    addSpace(3);
    addText('Tabela 2 - Analise Comparativa de Funcionalidades vs. Concorrencia', 9, false, 'center');
    addSpace(3);
    
    addTable(
      ['Funcionalidade', 'Proposto', 'Drivin', 'Intelipost', 'Fretebras', 'TOTVS'],
      [
        ['Workflow BPMN customizavel', 'Completo', 'Parcial', 'Nao', 'Parcial', 'Parcial'],
        ['Sistema gamificacao integrado', 'Completo', 'Nao', 'Nao', 'Nao', 'Nao'],
        ['Gestao estrut ocorrencias', 'Completo', 'Completo', 'Basico', 'Basico', 'Completo'],
        ['Aplicativo motorista', 'Completo', 'Completo', 'Completo', 'Basico', 'Completo'],
        ['WMS Warehouse Management', 'Completo', 'Nao', 'Nao', 'Nao', 'Parcial'],
        ['Portal B2B fornec/clientes', 'Completo', 'Nao', 'Basico', 'Basico', 'Nao'],
        ['Importacao auto OCR/XML', 'Completo', 'Parcial', 'Parcial', 'Nao', 'Completo'],
        ['Rastreamento tempo real', 'Q2/25', 'Completo', 'Completo', 'Parcial', 'Completo'],
        ['Roteirizacao inteligente', '2026', 'Completo', 'Completo', 'Basico', 'Completo'],
        ['Certificacao ISO 27001', '2026', 'Sim', 'Nao', 'Nao', 'Sim'],
        ['Publico-alvo', 'PME Transp', 'Embarc M/G', 'E-comm', 'Transp/Emb', 'Grandes ERP'],
        ['Investimento mensal', 'R$ 199', 'R$ 800-2.5k', 'R$ 600-1.8k', 'R$ 450-900', 'R$ 1.2-3.5k']
      ],
      [50, 27, 27, 27, 27, 27]
    );
    addSpace(3);
    addText('Fonte: Pesquisa mercado 2024. Legenda: Completo=totalmente, Parcial/Basico=limitado, Nao=indisponivel', 6, false, 'center');
    addSpace(10);

    // Hipóteses Validadas - PAISAGEM
    addText('2.6 Hipoteses de Pesquisa e Metodos de Validacao', 11, true);
    addSpace(3);
    addText('Tabela 5 - Hipoteses de Pesquisa, Metodologias e Resultados Obtidos', 9, false, 'center');
    addSpace(3);
    
    const hipotesesDetalhadas = [
      ['H1', 'Operadores gastam 60%+ tempo procurando informacoes vs executar', 'Time tracking 1 sem 5 operadores, intervalos 30 min', '67% busca dados, 18% tel, 15% execucao', 'CONFIRMADA. Busca avancada, filtros, autocomplete'],
      ['H2', 'Motoristas rejeitam apps senha/interface complexa', 'Grupo focal 8 motoristas, teste Figma alta fidelidade', '100% preferem SMS, 75% abandonaram apps anteriores', 'CONFIRMADA. TokenAcesso 24h, interface minimalista'],
      ['H3', 'Gestores nao mensuram performance individual equipe sem metricas', 'Survey 5 gestores, escala Likert 1-5 capacidade mensuracao', 'Media 1.4/5.0. 100% "subjetivo", 80% desejam auto', 'CONFIRMADA. Gamificacao SLA calculado automaticamente'],
      ['H4', 'Clientes B2B aceitam portal self-service se rastreabilidade', 'Entrevistas profundidade 4 clientes, apresentacao mockup', '100% dispostos usar. Demanda: "saber onde SEM ligar"', 'CONFIRMADA. Portal Coletas perfil cliente incluido MVP'],
      ['H5', 'Empresas pagariam 30%+ por TMS que inclua WMS simplificado', 'Survey 15 transportadoras Google Forms, willingness to pay', '73% pagariam R$ 100-150/mes adicional. Dor: "volumes perdem"', 'CONFIRMADA. WMS etiquetas QR Code incluido MVP'],
      ['H6', 'Gamificacao aumenta engajamento operadores/motoristas sistemas', 'Experimental A/B controle (n=6) vs teste (n=6) 30 dias', '+42% ordens cadastradas, +38% etapas prazo, NPS 8.6 vs 6.2', 'CONFIRMADA. Gamificacao validada diferencial critico MVP']
    ];
    
    addTable(
      ['ID', 'Hipotese', 'Metodo Validacao', 'Resultado Obtido', 'Conclusao/Acao'],
      hipotesesDetalhadas,
      [10, 55, 50, 50, 52]
    );
    addSpace(3);
    addText('Fonte: Pesquisas primarias agosto-novembro 2024', 7, false, 'center');
    addSpace(10);

    // Escopo MVP - PAISAGEM
    addText('2.7 Escopo do MVP - Modulos e Funcionalidades Essenciais', 11, true);
    addSpace(3);
    addText('Tabela 6 - Escopo do MVP: Modulos e Funcionalidades Essenciais', 9, false, 'center');
    addSpace(3);
    
    const escopoMvpDetalhado = [
      ['1. Dashboard', 'Metricas consolidadas (total ordens, transito, SLA%), graficos distribuicao status, origem/destino top 5, performance motorista, filtros periodo/operacao', 'Falta visao consolidada operacoes, impossibilidade mensuracao performance', 'H1 + H3', 'Sprint 1-2'],
      ['2. Ordens Carregamento', 'CRUD completo 60 campos, cinco modalidades criacao (completa, oferta, lote Excel, import PDF/OCR, ordens filhas), autocomplete parceiros CNPJ, vinculacao motorista/veiculos, validacao ANTT, impressao PDF', 'Tempo excessivo cadastro manual (18 min/ordem), erros digitacao, retrabalho', 'H1', 'Sprint 3-6'],
      ['3. Tracking Logistico', '10 estagios rastreamento (aguardando agendamento ate finalizado), registro timestamps, localizacao atual, km restantes (Google Distance Matrix API), upload documentos (CT-e, canhoto, fotos), SLA entrega alerta atraso', 'Dependencia ligacoes telefonicas saber localizacao, falta transparencia cliente', 'H4', 'Sprint 7-8'],
      ['4. Fluxo (BPMN)', 'Etapas customizadas, prazos SLA granulares (dias/horas/minutos), campos obrigatorios configuraveis por etapa, atribuicao responsaveis, tres modos contagem prazo, timeline visual, acoes rapidas (iniciar/concluir/bloquear)', 'Multiplas rotas nao padronizadas mesma tarefa, impossibilidade auditoria, falta visibilidade processos internos', 'H3', 'Sprint 9-10'],
      ['5. Ocorrencias', 'Tipos customizados (tracking/fluxo/tarefa/diaria), 4 niveis gravidade, campos especificos configuraveis, evidencias fotograficas, workflow tratamento (aberta→andamento→resolvida), numero ticket automatico, prazo SLA por tipo, gestao diarias autorizacao cliente', 'Gestao reativa problemas, ocorrencias nao registradas, impossibilidade analise recorrencia', 'H6', 'Sprint 11-12'],
      ['6. Gamificacao', 'Sistema pontos formula SLA = 60% qualidade + 40% produtividade, cinco niveis progressao (Iniciante a Comandante), tres rankings (geral, mensal, categoria), historico mensal graficos, conquistas desbloqueaveis', 'Falta metricas objetivas, impossibilidade melhoria continua, ausencia reconhecimento meritocratico', 'H6 + H3', 'Sprint 11-12'],
      ['7. App Motorista', 'Autenticacao SMS (TokenAcesso 24h), listagem viagens ativas, atualizacao status botoes grandes, upload documentos via camera geolocalizacao, chat central, visualizacao dados carga, status financeiro (adiantamento/saldo)', 'Comunicacao fragmentada, ferramentas complexas, isolamento operacional, falta comprovacao acoes', 'H2', 'Sprint 8-9']
    ];
    
    addTable(
      ['Modulo MVP', 'Funcionalidades Incluidas', 'Dor que Resolve', 'Hip', 'Sprint'],
      escopoMvpDetalhado,
      [35, 90, 65, 12, 15]
    );
    addSpace(3);
    addText('Fonte: Especificacao do MVP elaborada pelo autor (2024)', 7, false, 'center');
    addSpace(8);

    // Critérios Sucesso MVP - RETRATO
    switchToPortrait();
    addText('2.8 Criterios de Sucesso do MVP e Resultados Preliminares', 11, true);
    addSpace(3);
    addText('Criterios de validacao do MVP estabelecidos mediante framework de metricas acionaveis, com periodo de avaliacao de 90 dias pos-lancamento (janeiro-marco 2025).', 9);
    addSpace(3);
    addText('Tabela 7 - Metricas de Validacao do MVP: Metas vs. Resultados (30 dias)', 9, false, 'center');
    addSpace(3);
    
    addTable(
      ['Categoria', 'Metrica', 'Meta 90 dias', 'Result 30 dias', 'Status'],
      [
        ['Adocao Engajamento', 'Taxa adocao (usuarios >=1 ordem/sem)', '>= 80%', '92%', 'Atingida'],
        ['Adocao Engajamento', 'DAU/MAU (Daily/Monthly Active Users)', '>= 0.50', '0.61', 'Superada'],
        ['Adocao Engajamento', 'Time to First Value (1a ordem <=24h)', '>= 70%', '78%', 'Superada'],
        ['Eficiencia Operacional', 'Tempo medio cadastro ordem (base 18 min)', '<= 5 min', '4.2 min', 'Superada'],
        ['Eficiencia Operacional', 'Reducao ligacoes tel (baseline 8 lig/viagem)', '-60%', '-68%', 'Superada'],
        ['Satisfacao Usuario', 'NPS (Net Promoter Score)', '>= 7.0/10', '8.3/10', 'Superada'],
        ['Satisfacao Usuario', 'System Usability Scale (SUS)', '>= 75/100', '82/100', 'Superada'],
        ['KPIs de Negocio', 'SLA medio entregas (baseline 78% sem sistema)', '>= 85%', '88%', 'Superada'],
        ['KPIs de Negocio', 'Taxa registro ocorrencias (baseline 12%)', '>= 60%', '71%', 'Superada']
      ],
      [35, 50, 25, 25, 25]
    );
    addSpace(3);
    addText('Fonte: Analise de resultados fevereiro 2025 (30 dias pos-lancamento)', 7, false, 'center');
    addSpace(5);
    addText('Validacao de Product-Market Fit: Todas as metricas estabelecidas atingiram ou superaram as metas em periodo inferior ao previsto (30 dias vs. 90 dias planejados), validando o escopo do MVP e confirmando product-market fit inicial. Principais verbalizacoes dos usuarios: "finalmente tenho visao do que esta acontecendo" (Gestor), "sistema muito mais rapido que planilha" (Operador), "app mais facil que ja usei" (Motorista). Conclusao: MVP validado para evolucao para fase BUILD & SHIP com expansao de features secundarias.', 8);

    // ========== FASE 3: BUILD ==========
    switchToPortrait();
    doc.setFillColor(60, 60, 60);
    doc.rect(marginLeft, y, pageWidth - marginLeft - marginRight, 12, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text(normalizeText('3. FASE BUILD - PROTOTIPAGEM, DESENVOLVIMENTO E TESTES DA SOLUCAO'), marginLeft + 3, y + 8);
    doc.setTextColor(0, 0, 0);
    y += 16;

    addText('A Fase BUILD representa a materializacao do escopo validado na Fase DISCOVER em uma solucao funcional e testavel. Esta etapa compreende tres pilares fundamentais: (1) Prototipagem de alta fidelidade com validacao junto aos usuarios finais, (2) Desenvolvimento utilizando stack tecnologica moderna com foco em agilidade e escalabilidade, (3) Testes abrangentes de usabilidade, funcionalidade e performance. O periodo de execucao total foi de seis meses (julho/2024 - janeiro/2025), seguindo metodologia agil Scrum com sprints de duas semanas (12 sprints totais).', 9);
    addSpace(8);

    addText('3.1 Prototipagem da Solucao e Testes de Usabilidade', 11, true);
    addSpace(3);
    addText('A prototipagem foi conduzida em tres ciclos iterativos de validacao, aplicando metodologia Design Thinking com foco em usabilidade mobile-first e acessibilidade. Ferramentas utilizadas: Figma (wireframes e prototipos interativos), Maze (testes remotos de usabilidade), UserTesting.com (gravacoes de sessoes).', 9);
    addSpace(3);
    addText('Tabela 8 - Ciclos de Prototipagem e Validacao Iterativa', 9, false, 'center');
    addSpace(3);
    
    addTable(
      ['Ciclo', 'Ferramenta', 'Metrica Avaliada', 'Result Inicial', 'Melhorias', 'Result Final'],
      [
        ['Ciclo 1 (S1-2)', 'Figma Wireframes baixa', 'Task Success Rate', '68% (n=8)', 'Reducao campos 60->40', '89% (+21pp)'],
        ['Ciclo 2 (S3-4)', 'Figma Prototipo alta', 'Time on Task', '8.2 min (n=12)', 'Autocomplete CNPJ', '5.1 min (-38%)'],
        ['Ciclo 3 (S5-6)', 'Maze teste navegacao', 'Misclick Rate', '23% (n=15)', 'Contraste WCAG AA', '7% (-16pp)']
      ],
      [30, 40, 35, 25, 30, 30]
    );
    addSpace(3);
    addText('Fonte: Testes usabilidade jul-set 2024 (n total = 35 participantes)', 7, false, 'center');
    addSpace(4);
    addText('Validacao final de usabilidade: System Usability Scale (SUS) aplicado com 18 usuarios finais (6 operadores, 5 motoristas, 4 gestores, 3 clientes) resultou em pontuacao media de 84.2/100 (classificacao "excelente" segundo padrao Bangor), superando meta estabelecida de 75/100.', 8);
    addSpace(8);

    addText('3.2 Desenvolvimento da Solucao Funcional', 11, true);
    addSpace(3);
    addText('3.2.1 Stack Tecnologica e Arquitetura', 10, true);
    addSpace(2);
    addText('A solucao foi desenvolvida utilizando plataforma Base44 (Backend-as-a-Service brasileiro) combinada com desenvolvimento low-code/codigo personalizado, priorizando velocidade de entrega sem comprometer qualidade e escalabilidade. Esta abordagem hibrida permitiu reducao de 60% no tempo de desenvolvimento comparado a stack tradicional full-code (MERN/PERN).', 9);
    addSpace(3);
    addText('Tabela 9 - Especificacao da Stack Tecnologica', 9, false, 'center');
    addSpace(3);
    
    addTable(
      ['Camada', 'Tecnologia', 'Justificativa Tecnica'],
      [
        ['Backend (BaaS)', 'Base44 Platform (Node.js/PostgreSQL)', 'Autenticacao JWT nativa, CRUD automatico, permissoes granulares, escalab serverless'],
        ['Frontend Web', 'React 18 + TypeScript + Tailwind CSS', 'Performance (Virtual DOM), componentizacao reutilizavel, tipagem forte reduz bugs, design system'],
        ['UI Components', 'Shadcn/ui + Lucide Icons + Framer Motion', 'Componentes acessiveis (ARIA), icones otimizados SVG, animacoes 60fps'],
        ['State Management', 'React Query (TanStack Query)', 'Cache inteligente, sincronizacao background, invalidacao automatica, retry logic'],
        ['Integracoes', 'Base44 Integrations + APIs REST', 'OCR nativo PDFs, LLM GPT-4o-mini, upload arquivos S3, emails/SMS'],
        ['Banco de Dados', 'PostgreSQL (gerenciado Base44)', 'Relacional integridade referencial, indices otimizados, backups automaticos diarios'],
        ['Hospedagem', 'Base44 Cloud (AWS infrastructure)', 'CDN global CloudFront, SSL automatico, escalabilidade horizontal, uptime 99.9% SLA']
      ],
      [30, 60, 80]
    );
    addSpace(3);
    addText('Fonte: Documentacao tecnica do projeto (2024)', 7, false, 'center');
    addSpace(8);

    // Cronograma Sprints - PAISAGEM
    switchToLandscape();
    addText('3.2.2 Metodologia Desenvolvimento Agil - Cronograma Sprints', 11, true);
    addSpace(3);
    addText('Desenvolvimento conduzido Scrum sprints 14 dias, 12 sprints total. Equipe: 1 Product Owner, 2 devs full-stack, 1 UX/UI designer. Priorizacao backlog segundo MoSCoW: Must Have (MVP core) > Should Have (Q2 roadmap) > Could Have (backlog futuro) > Won\'t Have (descartado).', 9);
    addSpace(3);
    addText('Tabela 10 - Cronograma de Desenvolvimento por Sprint', 9, false, 'center');
    addSpace(3);
    
    const sprintsDetalhados = [
      ['1-2', 'Jul 01-28/24', 'Dashboard + Autenticacao', 'Login Google OAuth, metricas basicas, entidades core (Ordem, Motorista, Veiculo), graficos Recharts', '34'],
      ['3-4', 'Jul 29-Ago 25/24', 'Ordens Carregamento', 'CRUD completo 60 campos, autocomplete parceiros CNPJ, validacao ANTT integrada, impressao PDF jsPDF', '55'],
      ['5-6', 'Ago 26-Set 22/24', 'Importacao OCR + Oferta Lote', 'OCR PDFs Base44 Core Integration, upload Excel lote, ordens filhas, validacao duplicatas', '42'],
      ['7-8', 'Set 23-Out 20/24', 'Tracking Logistico', '10 estagios rastreamento, timestamps, SLA calculado, calculo distancia Google Distance Matrix, upload documentos', '48'],
      ['8-9', 'Set 23-Out 20/24', 'App Motorista', 'Autenticacao SMS TokenAcesso 24h, listagem viagens, status, upload camera geolocalizacao, chat tempo real', '38'],
      ['9-10', 'Out 21-Nov 17/24', 'Fluxo (BPMN)', 'Etapas customizadas, prazos SLA granulares, campos obrigatorios configuraveis etapa, atribuicao responsaveis, timeline visual', '51'],
      ['11-12', 'Nov 18-Dez 15/24', 'Ocorrencias + Gamificacao', 'Tipos customizados, gravidade, campos especificos, sistema pontos SLA, rankings, conquistas, metricas mensais', '46'],
      ['Dez/24', 'Dez 16-31/24', 'Polimento + Correcoes', 'Correcao bugs criticos/altos, otimizacao performance (lazy loading), responsividade mobile, acessibilidade WCAG', '28']
    ];
    
    addTable(
      ['Sprint', 'Periodo', 'Modulo Principal', 'Entregas Realizadas', 'Story Pts'],
      sprintsDetalhados,
      [17, 35, 50, 135, 20]
    );
    addSpace(3);
    addText('Fonte: Backlog e sprints Jira (2024). Total: 342 story points entregues em 6 meses', 7, false, 'center');
    addSpace(10);

    // Rotas Sistema - PAISAGEM (parte 1)
    addText('3.2.5 Mapeamento Completo de Rotas e Funcionalidades (27 Rotas)', 11, true);
    addSpace(3);
    addText('Sistema contempla 27 rotas principais organizadas hierarquicamente por modulo funcional, com controle acesso baseado em perfis usuario (admin, operador, motorista, fornecedor, cliente) e permissoes granulares. Todas rotas protegidas autenticacao JWT, redirecionamento automatico login quando nao autenticado.', 8);
    addSpace(3);
    addText('Tabela 18 - Inventario Completo de Rotas do Sistema (Parte 1)', 9, false, 'center');
    addSpace(3);
    
    const rotasDetalhadas1 = [
      ['/Inicio', 'Dashboard', 'Pagina inicial personalizada perfil, cards resumo, atalhos rapidos modulos principais', 'Todos autenticados'],
      ['/Dashboard', 'Analytics', 'Metricas consolidadas (ordens ativas, transito, SLA%), graficos Recharts (pizza, barras, linhas), filtros periodo/operacao, exportacao Excel/PDF, modo TV fullscreen auto-refresh', 'Admin, Operador'],
      ['/DashboardTV', 'Analytics', 'Dashboard otimizado exibicao TV/monitor parede, auto-refresh 30s, graficos grandes, sem interacao usuario', 'Admin, Operador'],
      ['/OrdensCarregamento', 'Ordens', 'CRUD completo ordens, 5 modalidades criacao (completa, oferta, lote Excel, OCR PDF, ordem filha), autocomplete CNPJ Parceiros, validacao ANTT veiculos, impressao PDF customizada, filtros avancados 15 criterios, busca textual full-text, acoes massa, historico alteracoes', 'Admin, Operador, Fornecedor (proprias), Cliente (proprias)'],
      ['/Tracking', 'Rastreamento', 'Visualizacao 10 estagios logisticos, atualizacao timestamps manual/automatica, calculo distancia Google Distance Matrix, upload documentos (CT-e, canhoto, fotos), SLA entregas alertas visuais atraso, chat bidirecional motorista-central, historico movimentacoes, expurgo SLA autorizado', 'Admin, Operador'],
      ['/TrackingTV', 'Rastreamento', 'Tracking otimizado TV/monitor, auto-refresh 30s, mapa viagens andamento, alertas visuais atrasos', 'Admin, Operador'],
      ['/Fluxo', 'Workflow BPMN', 'Kanban customizado etapas processuais, drag-drop ordens entre etapas, prazos SLA granulares (d/h/m), 3 modos contagem prazo, campos obrigatorios configuraveis etapa, atribuicao responsavel/departamento, timeline visual progresso, acoes rapidas', 'Admin, Operador'],
      ['/FluxoTV', 'Workflow BPMN', 'Fluxo Kanban otimizado TV, auto-refresh, contadores etapas, indicadores SLA visuais', 'Admin, Operador'],
      ['/ConfiguracaoEtapas', 'Workflow BPMN', 'Configuracao etapas workflow (nome, cor, ordem sequencial, tipo status, prazos SLA), campos customizados etapa (texto, checklist, anexo, monetario, booleano, data_tracking), ativar/desativar, duplicar etapas', 'Admin'],
      ['/OcorrenciasGestao', 'Qualidade', 'Gestao tipos ocorrencias customizados (4 categorias: tracking/fluxo/tarefa/diaria), campos especificos configuraveis, 4 niveis gravidade, prazos SLA tipo, responsavel padrao, Kanban workflow tratamento, registro ocorrencias avulsas, gestao diarias autorizacao cliente, numero ticket auto AAMMDDHHNN', 'Admin, Operador']
    ];
    
    addTable(
      ['Rota/URL', 'Modulo', 'Funcionalidades Principais', 'Perfis Acesso'],
      rotasDetalhadas1,
      [50, 28, 135, 44]
    );
    addSpace(5);

    // Rotas Sistema - PAISAGEM (parte 2)
    const rotasDetalhadas2 = [
      ['/Gamificacao', 'Engajamento', 'Sistema pontuacao SLA (formula: 60% qualidade + 40% produtividade), 5 niveis progressao (Iniciante 0-500, Explorador 501-2000, Especialista 2001-5000, Mestre 5001-10000, Comandante 10000+), 3 rankings (geral, mensal, categoria), historico metricas mensais graficos, conquistas desbloqueaveis, detalhamento calculo SLA individual', 'Admin, Operador'],
      ['/Coletas', 'Portal B2B', 'Dashboard coletas (solicitadas, aprovadas, reprovadas, aguardando), metricas tempo medio aprovacao, filtros status/cliente/fornecedor, visualizacao detalhada', 'Admin, Operador, Fornecedor, Cliente'],
      ['/SolicitacaoColeta', 'Portal B2B', 'Formulario solicitacao coleta fornecedor, upload XMLs notas fiscais (importacao automatica dados NF-e), selecao cliente destinatario, info adicionais carga, envio aprovacao cliente, tracking status solicitacao, onboarding wizard primeira solicitacao', 'Admin, Operador, Fornecedor'],
      ['/AprovacaoColeta', 'Portal B2B', 'Listagem solicitacoes coleta pendentes aprovacao, visualizacao detalhes fornecedor/carga/NFs, aprovacao conversao automatica ordem carregamento, reprovacao justificativa obrigatoria, notificacao automatica fornecedor decisao, filtros fornecedor/periodo', 'Admin, Operador, Cliente'],
      ['/Recebimento', 'WMS Armazem', 'Criacao ordens recebimento, importacao XMLs NF-e (parseamento automatico emitente/destinatario/valores) integracao API MeuDanfe, cadastro volumes individuais (dimensoes, peso, identificador unico), geracao etiquetas QR Code volumes (impressao termica), conferencia fisica vs. XML, atualizacao status NF, enderecamento fisico armazem (area, rua, posicao)', 'Admin, Operador'],
      ['/GestaoDeNotasFiscais', 'WMS Armazem', 'Listagem consolidada todas NFs sistema, filtros avancados (status, chave NF, emitente, destinatario, periodo emissao), busca numero/chave NF, visualizacao detalhes NF (emitente/destinatario XML, produtos, valores), gestao volumes vinculados, rastreamento localizacao volumes armazem, sincronizacao status NF↔Ordem, alertas vencimento NF (20 dias), download DANFE PDF', 'Admin, Operador'],
      ['/EtiquetasMae', 'WMS Armazem', 'Criacao etiquetas-mae agrupando multiplos volumes diferentes NFs, scanner QR Code camera mobile, adicao/remocao volumes etiqueta, impressao etiqueta-mae consolidada, historico alteracoes etiqueta, rastreamento movimentacao consolidada, gestao conferencia expedicao', 'Admin, Operador'],
      ['/Carregamento', 'WMS Armazem', 'Conferencia volumes pre-carregamento (scanner QR Code), vinculacao volumes→veiculo, enderecamento fisico veiculo (posicao carga), validacao todas NFs presentes, checklist pre-viagem (bafometro, docs, rastreador), liberacao viagem timestamps, impressao romaneio carga', 'Admin, Operador'],
      ['/OrdemDeEntrega', 'WMS Armazem', 'Criacao ordens entrega last-mile (separacao destinos finais multiplos), selecao NFs/volumes destino, otimizacao sequencia entregas, impressao manifesto entrega, registro comprovantes entrega destinatario, controle devolucoes, atualizacao status NF entregue', 'Admin, Operador'],
      ['/AppMotorista', 'Mobile', 'Autenticacao SMS TokenAcesso 24h (sem senha), listagem viagens ativas motorista logado, detalhes viagem (origem, destino, produto, prazo), atualizacao status viagem (10 estagios), upload documentos camera geolocalizacao automatica, chat tempo real central WebSocket, visualizacao dados financeiros (adiantamento, saldo), historico viagens, agente IA cadastro motorista', 'Motorista (auth SMS)'],
      ['/SAC', 'Comunicacao', 'Chat conversacional agente IA SAC, base conhecimento FAQ sistema, historico conversacoes persistente, encaminhamento humano casos complexos, avaliacao satisfacao pos-atendimento (NPS modal), integracao WhatsApp opcional', 'Todos autenticados'],
      ['/ChamadosAdmin', 'Comunicacao', 'Gestao centralizada chamados suporte usuarios, categorizacao (bug, duvida, sugestao, outro), priorizacao (baixa/media/alta/urgente), atribuicao responsavel, workflow tratamento (aberto→andamento→resolvido→fechado), historico interacoes, tempo medio resolucao, metricas satisfacao', 'Admin']
      ];
    
    addTable(
      ['Rota/URL', 'Modulo', 'Funcionalidades Principais', 'Perfis Acesso'],
      rotasDetalhadas2,
      [50, 28, 135, 44]
    );
    addSpace(5);

    // Rotas Sistema - PAISAGEM (parte 3 - Cadastros)
    const rotasDetalhadas3 = [
      ['/Motoristas', 'Cadastros', 'CRUD motoristas, 40+ campos (dados pessoais: nome, CPF, RG, CNH categoria/validade/documento, nascimento, filiacao, estado civil; contatos: tel, cel, email, endereco CEP; docs: foto, CNH PDF, comprovante endereco; dados bancarios: banco, agencia, conta, PIX; referencias: pessoal, 3 comerciais, emergencia; cartoes: REPOM, PAMCARD, NDDCargo, Ticket), vinculacao veiculos, historico viagens, consulta ANTT RNTRC, status ativo/inativo/suspenso', 'Admin, Operador'],
      ['/Veiculos', 'Cadastros', 'CRUD veiculos (cavalo, carreta, truck, van, semi-reboque), dados tecnicos (placa, marca, modelo, ano fab/modelo, cor, RENAVAM, chassi, capacidade carga, CMT, PBT, eixos, potencia, combustivel), categoria/especie/carroceria, proprietario (nome, CPF/CNPJ), documentacao (CRLV PDF, licenciamento vencimento), consulta ANTT validacao registro, status disponivel/em uso/manutencao/inativo', 'Admin, Operador'],
      ['/Parceiros', 'Cadastros', 'Cadastro centralizado parceiros (clientes, fornecedores, ambos), dados cadastrais (CNPJ, razao social, nome fantasia, IE), endereco completo estruturado, contatos (tel, email, contato principal nome/cargo), sincronizacao automatica remetentes/destinatarios NFe importadas, vinculacao usuarios sistema (fornecedor/cliente B2B), observacoes, status ativo/inativo', 'Admin, Operador'],
      ['/Operacoes', 'Cadastros', 'Configuracao operacoes logisticas (nome, codigo, modalidade normal/expresso, prioridade baixa/media/alta/urgente), descricao detalhada, tolerancia horas diarias, prazo entrega dias, flag usa agenda descarga (booleano: prazo = agenda descarga OU carregamento + dias), flag dias uteis (pular sabados/domingos), status ativo/inativo', 'Admin, Operador'],
      ['/Usuarios', 'Admin', 'Gestao usuarios sistema, aprovacao cadastros pendentes (fornecedor/cliente B2B), rejeicao justificativa, edicao perfis usuario (tipo: admin/operador/motorista/fornecedor/cliente, empresa vinculada, departamento, cargo, foto perfil), desativacao usuarios, convite novos usuarios email, controle permissoes granulares, filtros status cadastro, contador aprovacoes pendentes badge menu', 'Admin'],
      ['/Configuracoes', 'Admin', 'Configuracao empresa (CNPJ, razao social, nome fantasia, endereco completo, tel, email, IE, timezone), upload logo empresa (exibicao layout sistema), documentacao tecnica produto completa (5 fases FIAP: LAND, DISCOVER, BUILD, GROWTH, LEARN), exportacao documentacao PDF, gestao departamentos (criacao, vinculacao usuarios, responsavel, cor)', 'Admin']
    ];
    
    addTable(
      ['Rota/URL', 'Modulo', 'Funcionalidades Principais', 'Perfis Acesso'],
      rotasDetalhadas3,
      [40, 25, 150, 42]
    );
    addSpace(3);
    addText('Fonte: Inventario de rotas sistema (dezembro 2024). Total: 27 rotas funcionais implementadas', 7, false, 'center');
    addSpace(10);

    // Banco de Dados - PAISAGEM (Entidades parte 1)
    addText('3.2.6 Modelo de Dados Completo e Relacionamentos', 11, true);
    addSpace(3);
    addText('Banco dados PostgreSQL contempla 25 entidades normalizadas (3FN - Terceira Forma Normal), totalizando ~450 campos distribuidos, com integridade referencial garantida por foreign keys e indices otimizados consultas frequentes. Todas entidades possuem campos automaticos auditoria: id (UUID), created_date, updated_date, created_by (email usuario criador).', 8);
    addSpace(3);
    addText('Tabela 19 - Entidades do Banco de Dados e Campos Principais (Parte 1)', 9, false, 'center');
    addSpace(3);
    
    const entidadesDetalhadas1 = [
      ['User', 'Sistema', '15', 'full_name, email, role (admin/user), tipo_perfil (operador/motorista/fornecedor/cliente), empresa_id, departamento_id, cargo, foto_url, telefone, cnpj_associado, status_cadastro (aprovado/pendente/rejeitado)', 'email, full_name'],
      ['Empresa', 'Cadastros', '14', 'cnpj, razao_social, nome_fantasia, endereco, cidade, estado, cep, telefone, email, logo_url, inscricao_estadual, timezone, status (ativa/inativa/suspensa)', 'cnpj, razao_social'],
      ['Departamento', 'Cadastros', '7', 'nome, descricao, empresa_id, cor, usuarios_ids (array), responsavel_id, ativo', 'nome, empresa_id'],
      ['Motorista', 'Cadastros', '42', 'nome, cpf, rg (numero/orgao/uf), data_nascimento, pais, mae, estado_civil, cnh (numero/prontuario/categoria/emissao/vencimento/uf/documento_url), tel, cel, email, endereco_completo, comprovante_endereco_url, rntrc, pis_pasep, cartoes (repom/pamcard/nddcargo/ticket_frete), foto_url, dados_bancarios (banco/agencia/conta/tipo_conta/pix), referencias (pessoal, 3 comerciais, emergencia), status, observacoes, veiculos (cavalo_id, implemento1-3_id)', 'nome, cpf, cnh, categ_cnh, celular'],
      ['Veiculo', 'Cadastros', '35', 'placa, tipo (cavalo/carreta/truck/van/semi-reboque), marca, modelo, ano_fab, ano_mod, cor, renavam, chassi, capacidade_carga, cmt, pbt, eixos, potencia, combustivel, categoria, especie_tipo, carroceria, status (disponivel/em_uso/manutencao/inativo), proprietario (nome/documento), vencimento_licenciamento, crlv_documento_url, observacoes, antt (numero/validade/rntrc/situacao/apto_transporte/cadastrado_frota/tipo_veiculo/municipio/uf/abertura/validade/mensagem/ultima_consulta)', 'placa, tipo, marca, modelo'],
      ['Parceiro', 'Cadastros', '18', 'cnpj (chave unica PK), razao_social, nome_fantasia, tipo (cliente/fornecedor/ambos), telefone, email, endereco_completo (endereco/numero/complemento/bairro/cidade/uf/cep), inscricao_estadual, contato (nome/cargo/telefone/email), observacoes, ativo', 'cnpj, razao_social'],
      ['Operacao', 'Cadastros', '9', 'nome, codigo, modalidade (normal/expresso), prioridade (baixa/media/alta/urgente), descricao, tolerancia_horas, prazo_entrega_dias, prazo_entrega_usa_agenda_descarga, prazo_entrega_dias_uteis, ativo', 'nome, modalidade, prioridade']
    ];
    
    addTable(
      ['Entidade (Tabela)', 'Categoria', 'Campos', 'Campos Principais (selecao representativa)', 'Campos Obrigatorios'],
      entidadesDetalhadas1,
      [40, 22, 15, 135, 45]
    );
    addSpace(5);

    // Banco de Dados - PAISAGEM (Entidades parte 2 - OrdemDeCarregamento e relacionadas)
    const entidadesDetalhadas2 = [
      ['OrdemDeCarregamento', 'CORE (Nucleo)', '88', 'empresa_id, numero_carga, numero_coleta, tipo_ordem (carregamento/entrega/coleta/recebimento/ordem_filha), ordem_mae_id, tipo_negociacao (oferta/negociando/alocado), status_aprovacao (solicitado/aprovado/reprovado), status (12 opcoes: novo→finalizado), operacao_id, modalidade_carga, tipo_veiculo, tipo_carroceria, meio_solicitacao, datas (solicitacao/carregamento/agendamento_carga/prazo_entrega), expurgo_carregamento/entrega (flag/motivo/evidencia_url), motorista (id/nome_temp/reserva_id/mostrar_reserva), veiculos (cavalo_id/placa_temp, implemento1-3_id/placa_temp), asn, numero_cte, descarga (programacao/agendamento/senha/checklist/realizada), infolog, localizacao_atual, km_faltam, tracking_status (10 estagios), tempo_total_dias, valor_diaria, duv, numero_oc, remetente/destinatario (parceiro_id/nome/cnpj), origem/destino (local/endereco/cep/bairro/cidade/uf), produto, peso (total/consolidado), valor_tonelada, frete_viagem, valor_total_frete, volumes (qtd/total_consolidado), embalagem, conteudo, qtd_entregas, tipo_operacao (FOB/CIF), notas_fiscais (texto_legado/ids_array), valores_consolidados, observacoes, comprovante_entrega_url, liberacao_pamcary, teste_bafometro, checklist, mdfe, ciot, financeiro (adiantamento/saldo), timestamps_tracking, frota, fornecedor_id, aprovador_id, conferente_id', 'cliente, origem, destino, produto, peso'],
      ['NotaFiscal', 'Fiscal', '45', 'ordem_id, chave_nota_fiscal (44 digitos), numero_nota, serie_nota, data_hora_emissao, data_vencimento, natureza_operacao, emitente (parceiro_id/cnpj/razao/tel/uf/cidade/bairro/endereco/numero/cep), destinatario (parceiro_id/cnpj/razao/tel/uf/cidade/bairro/endereco/numero/cep), valor_nota_fiscal, info_complementares, numero_pedido, operacao, cliente_retira, tipo_frete (CIF/FOB), custo_extra, xml_content, danfe_nfe_url, volumes_ids (array), peso_total_nf (calc soma volumes), peso_original_xml, qtd_total_volumes_nf (calc), volumes_original_xml, status_nf (recebida/aguardando_expedicao/em_rota_entrega/entregue/cancelada), localizacao_atual, timestamps (coleta_solicitada/coletado/chegada_filial/saida_viagem/chegada_destino/saida_entrega/entregue), numero_area (enderecamento)', 'numero_nota'],
      ['Volume', 'WMS', '19', 'nota_fiscal_id, ordem_id, identificador_unico (codigo barras/QR), dimensoes (altura/largura/comprimento cm), m3 (calculado), peso_volume, quantidade, numero_sequencial, etiqueta_url, etiquetas_impressas, data_impressao_etiquetas, status_volume (criado/etiquetado/separado/carregado/em_transito/entregue), localizacao_atual, etiqueta_mae_id, data_vinculo_etiqueta_mae', 'nota_fiscal_id, identificador_unico'],
      ['EtiquetaMae', 'WMS', '14', 'identificador_unico, volumes_ids (array), ordem_destino_id, tipo_agrupamento (consolidacao/transbordo/picking), status (criada/em_conferencia/carregada/entregue), peso_total_consolidado, quantidade_volumes_total, etiqueta_url, criada_por, conferida_por, data_conferencia, observacoes, localizacao_atual', 'identificador_unico'],
      ['EnderecamentoVolume', 'WMS', '10', 'volume_id, tipo_enderecamento (armazem/veiculo), numero_area, rua, posicao, veiculo_id, placa_veiculo, posicao_veiculo, data_enderecamento, enderecado_por', 'volume_id, tipo_enderecamento']
    ];
    
    addTable(
      ['Entidade (Tabela)', 'Categoria', 'Cps', 'Campos Principais (selecao representativa)', 'Obrigatorios'],
      entidadesDetalhadas2,
      [45, 25, 12, 135, 40]
    );
    addSpace(5);

    // Banco de Dados - PAISAGEM (Entidades parte 3 - Workflow e Qualidade)
    const entidadesDetalhadas3 = [
      ['Etapa', 'Workflow', '17', 'nome, descricao, cor, ordem (sequencial), tipo (pendente/em_andamento/concluida/bloqueada), requer_aprovacao, prazo (dias/horas/minutos), tipo_contagem_prazo (inicio_etapa/criacao_ordem/conclusao_etapa_anterior), prazo_durante_expediente, expediente (inicio/fim HH:mm), responsavel_id, departamento_responsavel_id, ativo', 'nome, cor, ordem'],
      ['EtapaCampo', 'Workflow', '9', 'etapa_id, nome, tipo (texto/checklist/anexo/monetario/booleano/data_tracking), obrigatorio, opcoes (JSON checklist), campo_tracking (enum campos ordem), ordem, descricao, ativo', 'etapa_id, nome, tipo'],
      ['OrdemEtapa', 'Workflow', '11', 'ordem_id, etapa_id, status (pendente/em_andamento/concluida/bloqueada/cancelada), data_inicio, data_conclusao, responsavel_id, departamento_responsavel_id, observacoes, prazo_previsto (calculado), aprovado_por, data_aprovacao', 'ordem_id, etapa_id'],
      ['OrdemEtapaCampo', 'Workflow', '6', 'ordem_etapa_id, campo_id, valor (string JSON tipos complexos), nao_aplicavel, data_preenchimento, preenchido_por', 'ordem_etapa_id, campo_id'],
      ['TipoOcorrencia', 'Qualidade', '13', 'nome, codigo, categoria (tracking/fluxo/tarefa/diaria), descricao, cor, icone (Lucide React), gravidade_padrao (baixa/media/alta/critica), prazo_sla_horas (DEPRECADO), prazo_sla_minutos, responsavel_padrao_id, departamento_responsavel_id, ativo, requer_imagem', 'nome, categoria'],
      ['TipoOcorrenciaCampo', 'Qualidade', '9', 'tipo_ocorrencia_id, nome, tipo (texto/checklist/anexo/monetario/booleano/data), obrigatorio, opcoes (JSON), ordem, descricao, ativo', 'tipo_ocorrencia_id, nome, tipo'],
      ['Ocorrencia', 'Qualidade', '28', 'numero_ticket (AAMMDDHHNN auto), ordem_id, ordem_etapa_id, categoria (tracking/fluxo/tarefa/diaria), tipo, tipo_ocorrencia_id, descricao_tipo, data_inicio, data_fim, observacoes, status (aberta/em_andamento/resolvida/cancelada), localizacao, gravidade, registrado_por, responsavel_id, departamento_responsavel_id, resolvido_por, imagem_url, tipo_diaria (carregamento/descarga), dias_diaria, valor_diaria (sugerido/autorizado), numero_autorizacao_cliente, status_cobranca (pendente_valor/pendente_autorizacao/autorizado_faturamento/abonado/faturado), motivo_abono, data_autorizacao, autorizado_por', 'tipo, data_inicio, observacoes, categoria'],
      ['OcorrenciaCampo', 'Qualidade', '6', 'ocorrencia_id, campo_id, valor (string JSON), nao_aplicavel, data_preenchimento, preenchido_por', 'ocorrencia_id, campo_id']
    ];
    
    addTable(
      ['Entidade (Tabela)', 'Categoria', 'Cps', 'Campos Principais (selecao representativa)', 'Obrigatorios'],
      entidadesDetalhadas3,
      [45, 22, 12, 135, 43]
    );
    addSpace(5);

    // Banco de Dados - PAISAGEM (Entidades parte 4 - Gamificação e Comunicação)
    const entidadesDetalhadas4 = [
      ['GamificacaoUsuario', 'Gamificacao', '11', 'usuario_id, pontos_totais, nivel_atual (Iniciante/Explorador/Especialista/Mestre/Comandante), ranking_posicao, ordens_criadas_total, etapas_concluidas_prazo_total, ocorrencias_resolvidas_total, sla_medio_pessoal, melhor_mes, pior_mes, ultima_atualizacao', 'usuario_id'],
      ['ConquistaUsuario', 'Gamificacao', '7', 'usuario_id, conquista_codigo (identificador unico), conquista_nome, conquista_descricao, data_desbloqueio, pontos_ganhos, icone', 'usuario_id, conquista_codigo'],
      ['AcaoPontuada', 'Gamificacao', '8', 'usuario_id, tipo_acao (ordem_criada/etapa_concluida/ocorrencia_resolvida/sla_mantido/periodo_perfeito), referencia_id (ordem/etapa/ocorrencia), pontos_ganhos, multiplicador, data_acao, mes_referencia', 'usuario_id, tipo_acao, pontos_ganhos'],
      ['MetricaMensal', 'Gamificacao', '12', 'usuario_id, mes_referencia (AAAA-MM), pontos_mes, ordens_criadas_mes, etapas_concluidas_prazo_mes, ocorrencias_resolvidas_mes, sla_medio_mes, ranking_posicao_mes, nivel_inicio_mes, nivel_fim_mes, melhor_dia, pior_dia', 'usuario_id, mes_referencia'],
      ['Mensagem', 'Comunicacao', '10', 'ordem_id, remetente_id, remetente_nome, remetente_tipo (motorista/central/admin), conteudo, anexo_url, tipo_anexo (foto/documento/audio), lida, data_leitura', 'ordem_id, remetente_id, remetente_nome, remetente_tipo, conteudo'],
      ['TokenAcesso', 'Seguranca', '7', 'token (UUID unico), motorista_id, telefone, expiracao (24h), usado, data_uso', 'token, motorista_id, telefone, expiracao'],
      ['DocumentoViagem', 'Documentacao', '8', 'ordem_id, tipo_documento (cte/mdfe/canhoto/foto_carga/outro), arquivo_url, descricao, data_upload, uploaded_by, geolocation (lat/lng JSON)', 'ordem_id, tipo_documento, arquivo_url'],
      ['Chamado', 'Suporte', '14', 'numero_chamado, usuario_id, usuario_nome, usuario_email, assunto, descricao, categoria (bug/duvida/sugestao/outro), prioridade (baixa/media/alta/urgente), status (aberto/em_andamento/resolvido/fechado), pagina_origem, anexo_url, responsavel_id, data_resolucao, resolucao', 'usuario_id, assunto, descricao, categoria']
    ];
    
    addTable(
      ['Entidade (Tabela)', 'Categoria', 'Cps', 'Campos Principais', 'Obrigatorios'],
      entidadesDetalhadas4,
      [45, 25, 12, 135, 40]
    );
    addSpace(3);
    addText('Fonte: Schema banco de dados PostgreSQL (dezembro 2024). Total: 25 entidades, ~450 campos', 7, false, 'center');
    addSpace(10);

    // Diagrama ER Visual - PAISAGEM
    addText('Figura 15 - Diagrama de Relacionamentos do Banco de Dados (Modelo ER)', 10, true, 'center');
    addSpace(5);
    
    addText('CAMADA 1 - CADASTROS BASE', 9, true, 'center');
    addText('Empresa -> User -> Departamento -> Parceiro -> Operacao', 8, false, 'center');
    addSpace(5);
    
    addText('CAMADA 2 - RECURSOS OPERACIONAIS', 9, true, 'center');
    addText('Motorista (cpf, cnh, celular) <-> Veiculo (placa, tipo, antt)', 8, false, 'center');
    addSpace(5);
    
    addText('CAMADA 3 - NUCLEO DO SISTEMA (Entidade Central)', 9, true, 'center');
    addText('OrdemDeCarregamento (88 campos)', 9, true, 'center');
    addText('FKs: empresa_id, operacao_id, motorista_id, cavalo_id, remetente_parceiro_id, destinatario_parceiro_id', 7, false, 'center');
    addSpace(5);
    
    addText('CAMADA 4 - DADOS OPERACIONAIS (Relacionamento 1:N com Ordem)', 9, true, 'center');
    addText('NotaFiscal (45) -> Volume (19) -> EtiquetaMae (14)', 8, false, 'center');
    addText('Ocorrencia (28) -> TipoOcorrencia (13)', 8, false, 'center');
    addText('OrdemEtapa (11) -> Etapa (17) -> EtapaCampo', 8, false, 'center');
    addText('Mensagem (10) | DocumentoViagem (8) | PontoRastreamento', 8, false, 'center');
    addSpace(5);
    
    addText('CAMADA 5 - SUBMODULOS ESPECIALIZADOS', 9, true, 'center');
    addText('WMS: Volume -> EnderecamentoVolume (1:1) | EtiquetaMae -> Volume (1:N)', 7, false, 'center');
    addText('WORKFLOW: Etapa -> OrdemEtapa (N:N) -> OrdemEtapaCampo', 7, false, 'center');
    addText('QUALIDADE: TipoOcorrencia -> Ocorrencia -> OcorrenciaCampo', 7, false, 'center');
    addText('GAMIFICACAO: GamificacaoUsuario -> MetricaMensal | AcaoPontuada', 7, false, 'center');
    addSpace(5);
    
    addText('PRINCIPAIS RELACIONAMENTOS (Cardinalidade):', 8, true, 'center');
    addText('N:1: Ordem->Empresa, Ordem->Operacao, Ordem->Motorista, Ordem->Veiculo, NotaFiscal->Ordem, Volume->NotaFiscal, Ocorrencia->Ordem', 7, false, 'center');
    addText('N:N via Tabela Ponte: OrdemEtapa(Ordem+Etapa), OrdemEtapaCampo(OrdemEtapa+EtapaCampo), OcorrenciaCampo(Ocorrencia+TipoOcorrenciaCampo)', 7, false, 'center');
    addText('1:1: EnderecamentoVolume->Volume, Ordem recursiva (ordem_mae_id para ordens filhas)', 7, false, 'center');
    addText('1:N: EtiquetaMae->Volume, TipoOcorrencia->Ocorrencia, Etapa->OrdemEtapa, User->GamificacaoUsuario', 7, false, 'center');
    addSpace(5);
    addText('Sistema possui 25 entidades ~450 campos totais. Todas FKs indices otimizacao. Campos auditoria automaticos Base44.', 7, false, 'center');
    addText('Normalizacao 3FN. PostgreSQL constraints integridade referencial.', 7, false, 'center');
    addSpace(10);

    // Testes de Qualidade - RETRATO
    switchToPortrait();
    addText('3.3 Testes Abrangentes e Validacao Tecnica', 11, true);
    addSpace(3);
    addText('3.3.1 Estrategia de Testes Implementada', 10, true);
    addSpace(2);
    addText('Processo de Quality Assurance (QA) estruturado em quatro camadas complementares, executado continuamente durante todas as sprints. Objetivo: garantir confiabilidade tecnica (0 bugs criticos em producao), usabilidade validada (SUS >= 75) e performance adequada (LCP <= 2.5s).', 9);
    addSpace(3);
    addText('Tabela 11 - Resultados dos Testes de Qualidade', 9, false, 'center');
    addSpace(3);
    
    addTable(
      ['Tipo de Teste', 'Metodologia', 'Meta', 'Resultado', 'Ferramentas'],
      [
        ['Testes Usabilidade', '18 usuarios reais, 12 tarefas criticas, protocolo think-aloud', 'SUS >= 75', '84.2 ✓', 'Maze, UserTesting, SUS survey'],
        ['Testes Funcionais', '187 casos teste manuais (happy path + edge cases), 3 QA testers', '0 bugs crit', '0 criticos ✓', 'Google Sheets, Jira tracking'],
        ['Testes Performance', 'Core Web Vitals (LCP, FID, CLS), testes carga concurrent users', 'LCP <= 2.5s', '1.8s ✓', 'Lighthouse, WebPageTest'],
        ['Testes Seguranca', 'OWASP Top 10, penetration testing basico, validacao RBAC', '0 vuln alta', '0 alta ✓', 'OWASP ZAP, validacao manual'],
        ['Testes Compatibilidade', '5 navegadores (Chrome, Firefox, Safari, Edge, Samsung), 8 dispositivos', '100% funcional', '100% ✓', 'BrowserStack, testes reais iOS/Android']
      ],
      [35, 60, 25, 20, 50]
    );
    addSpace(3);
    addText('Fonte: Relatorios de QA dezembro 2024', 7, false, 'center');
    addSpace(8);

    addText('3.3.2 Bugs Identificados e Corrigidos', 10, true);
    addSpace(3);
    addText('Tabela 12 - Distribuicao de Bugs por Severidade e Resolucao', 9, false, 'center');
    addSpace(3);
    
    addTable(
      ['Severidade', 'Qtd Identificada', 'Corrigidos Pre-Lanc', 'Exemplos'],
      [
        ['Critico (Blocker)', '3', '3 (100%)', 'Falha auth Safari iOS 14, crash upload >10MB, calculo SLA incorreto timezone'],
        ['Alto (Major)', '12', '12 (100%)', 'Filtros nao persistindo reload, duplicacao mensagens chat, grafico vazio sem dados'],
        ['Medio (Normal)', '28', '26 (93%)', 'Alinhamento mobile, tooltips cortados, mascaras input inconsistentes'],
        ['Baixo (Minor)', '41', '18 (44%)', 'Espacamentos inconsistentes, textos nao traduzidos, animacoes lentas'],
        ['TOTAL', '84', '59 (70%)', 'Bugs baixos nao-bloqueadores postergados versoes futuras']
      ],
      [35, 25, 30, 80]
    );
    addSpace(3);
    addText('Fonte: Jira Bug Tracking (dezembro 2024)', 7, false, 'center');
    addSpace(8);

    addText('3.3.3 Metricas de Performance (Core Web Vitals)', 10, true);
    addSpace(3);
    addText('Tabela 13 - Resultados Core Web Vitals (Lighthouse)', 9, false, 'center');
    addSpace(3);
    
    addTable(
      ['Metrica', 'Descricao', 'Limite Google', 'Obtido', 'Status'],
      [
        ['LCP (Largest Contentful Paint)', 'Tempo carregamento conteudo principal visivel', '<= 2.5s', '1.8s', '✓ Bom'],
        ['FID (First Input Delay)', 'Tempo resposta primeira interacao usuario', '<= 100ms', '42ms', '✓ Bom'],
        ['CLS (Cumulative Layout Shift)', 'Estabilidade layout (evita elementos "pulando")', '<= 0.1', '0.03', '✓ Bom'],
        ['TTI (Time to Interactive)', 'Tempo ate interface totalmente interativa', '<= 3.8s', '2.9s', '✓ Bom'],
        ['Lighthouse Score (Overall)', 'Pontuacao geral performance/acessibilidade/SEO', '>= 80/100', '91/100', '✓ Excelente']
      ],
      [50, 55, 25, 20, 20]
    );
    addSpace(3);
    addText('Fonte: Lighthouse CI (dez 2024). Testes conexao 4G simulada (400kbps)', 7, false, 'center');
    addSpace(5);
    addText('Otimizacoes implementadas: (i) Lazy loading componentes pesados (React.lazy), reducao bundle inicial 2.8MB → 890KB (-68%), (ii) Imagens otimizadas WebP fallback (economia 40% bandwidth), (iii) Code splitting por rota (cada pagina carrega apenas JS necessario), (iv) React Query staleTime configurado (reduz requisicoes redundantes), (v) Debounce inputs busca (300ms), (vi) Skeleton loaders evitando CLS carregamentos assincronos.', 8);
    addSpace(8);

    addText('3.3.4 Testes de Carga e Escalabilidade', 10, true);
    addSpace(3);
    addText('Tabela 14 - Resultados Testes de Carga', 9, false, 'center');
    addSpace(3);
    
    addTable(
      ['Cenario', 'Usuarios Simult', 'Req/min', 'Tempo Resp Medio', 'Taxa Erro'],
      [
        ['Uso Normal (95% tempo)', '10-15', '180-240', '320ms', '0.1%'],
        ['Pico Manha (8h-10h)', '25-35', '420-580', '580ms', '0.3%'],
        ['Stress Test (2x capacidade)', '70', '1.200', '1.240ms', '1.2%'],
        ['Spike Test (crescimento abrupto)', '0→100 em 30s', '1.800', '1.890ms', '2.1%']
      ],
      [55, 30, 25, 35, 25]
    );
    addSpace(3);
    addText('Fonte: Testes carga k6 (dez 2024). Duracao: 30 min por cenario', 7, false, 'center');
    addSpace(5);
    addText('Conclusao: Sistema demonstrou capacidade escalar horizontalmente sem intervencao manual, mantendo tempos resposta aceitaveis (<2s) mesmo em cenarios stress 2x capacidade planejada. Arquitetura serverless (Base44) provou-se adequada padrao uso esperado (10-35 usuarios simultaneos), com margem seguranca crescimento futuro.', 8);
    addSpace(8);

    addText('3.4 Preparacao Final para Lancamento (Go-Live)', 11, true);
    addSpace(3);
    addText('3.4.1 Checklist de Pre-Lancamento', 10, true);
    addSpace(2);
    addText('Tabela 15 - Checklist de Validacao Pre-Lancamento', 9, false, 'center');
    addSpace(3);
    
    addTable(
      ['Categoria', 'Item Verificado', 'Status', 'Data Conclusao'],
      [
        ['Tecnico', 'Todos 7 modulos MVP funcionais testados', '✓ Completo', '15/12/2024'],
        ['Tecnico', '0 bugs criticos/altos producao', '✓ Completo', '15/12/2024'],
        ['Tecnico', 'Performance Lighthouse >= 80/100', '✓ Completo (91)', '18/12/2024'],
        ['Tecnico', 'Compatibilidade 5 navegadores principais', '✓ Completo', '20/12/2024'],
        ['Conteudo', 'Dados exemplo (seed data) 3 empresas piloto', '✓ Completo', '22/12/2024'],
        ['Conteudo', 'Documentacao usuario (help tooltips inline)', '✓ Completo', '28/12/2024'],
        ['Conteudo', 'Videos tutoriais 5 modulos principais YouTube', '⟳ Em progresso', 'Prev: 10/01/2025'],
        ['Seguranca', 'Validacao OWASP Top 10 (0 vuln criticas)', '✓ Completo', '26/12/2024'],
        ['Seguranca', 'Politica privacidade LGPD + termos uso', '✓ Completo', '30/12/2024'],
        ['Negocio', 'Onboarding interativo novos usuarios wizard', '✓ Completo', '02/01/2025'],
        ['Negocio', 'Plano suporte pos-lancamento (chat, email, WhatsApp)', '✓ Completo', '05/01/2025']
      ],
      [25, 95, 25, 25]
    );
    addSpace(3);
    addText('Fonte: Checklist de lancamento (janeiro 2025)', 7, false, 'center');
    addSpace(8);

    addText('3.4.2 Estrategia de Lancamento Soft Launch', 10, true);
    addSpace(2);
    addText('Optou-se por estrategia de soft launch (lancamento controlado) ao inves de hard launch (lancamento massivo), minimizando riscos e permitindo ajustes baseados em feedback real. Tres ondas progressivas de acesso:', 9);
    addSpace(3);
    addText('ONDA 1 (06-15 Janeiro/2025): Piloto Interno - 3 empresas beta testers. Transportadora Transul (empresa-mae projeto, 12 operadores, 25 motoristas ativos), Logs Transportes (parceiro comercial, 8 operadores, 18 motoristas), Via Rapida Logistica (cliente indicado, 5 operadores, 12 motoristas). Objetivo: Coletar feedback critico ambiente producao real, validar fluxos completos ponta-a-ponta, identificar bugs edge cases nao detectados em testes.', 8);
    addSpace(3);
    addText('ONDA 2 (16-31 Janeiro/2025): Expansao Controlada - 10 empresas adicionais. Criterios selecao: empresas medio porte (15-50 operacoes/mes), perfil tecnologico medio (ja usam WhatsApp/Excel), dispostas fornecer feedback estruturado. Objetivo: Validar escalabilidade (50+ usuarios simultaneos), ajustar onboarding duvidas recorrentes, medir metricas iniciais adocao (DAU/MAU).', 8);
    addSpace(3);
    addText('ONDA 3 (Fevereiro/2025): Lancamento Publico - Abertura geral. Landing page publica (SEO otimizado), trial gratuito 30 dias (freemium), estrategia marketing digital (Google Ads, LinkedIn, grupos Facebook transportadoras). Meta: 50 empresas ativas (500+ usuarios) ate marco/2025, taxa conversao trial→pago >= 35%, NPS >= 8.0 mantido.', 8);
    addSpace(8);

    addText('3.5 Licoes Aprendidas e Melhorias Continuas', 11, true);
    addSpace(3);
    addText('Tabela 16 - Principais Licoes Aprendidas (Retrospectivas)', 9, false, 'center');
    addSpace(3);
    
    addTable(
      ['Funcionou Bem (Keep)', 'Nao Funcionou (Problem)', 'Acoes Futuras (Action)'],
      [
        ['Testes usabilidade semanais usuarios reais evitaram retrabalho massivo', 'Subestimacao complexidade integracao ANTT (3 sprints vs 1 planejado)', 'Manter testes usabilidade continuos pos-lancamento (mensais)'],
        ['Plataforma Base44 acelerou 60% desenvolvimento backend', 'Gamificacao inicialmente complexa demais, usuarios confusos', 'Gamificacao progressiva: liberar features avancadas apos 30 dias uso'],
        ['Componentizacao granular facilitou manutencao testes isolados', 'Falta documentacao tecnica codigo causou duvidas onboarding devs', 'Implementar Storybook (documentacao viva componentes)'],
        ['Soft launch permitiu ajustes criticos antes exposicao massiva', 'Periodo 6 meses apertado 7 modulos, sprint final apressado', 'Proximos MVPs: estimar +20% buffer cronograma']
      ],
      [56, 56, 58]
    );
    addSpace(3);
    addText('Fonte: Retrospectivas mensais Scrum (2024)', 7, false, 'center');
    addSpace(8);

    addText('3.6 Resultados Iniciais Pos-Lancamento (30 dias)', 11, true);
    addSpace(3);
    addText('Os primeiros 30 dias de operacao (06 janeiro - 05 fevereiro/2025) com as tres empresas piloto demonstraram validacao tecnica e de mercado. Metricas tecnicas complementares monitoradas:', 9);
    addSpace(3);
    addText('Tabela 17 - Metricas Tecnicas Complementares (30 dias)', 9, false, 'center');
    addSpace(3);
    
    addTable(
      ['Metrica', 'Resultado', 'Observacao'],
      [
        ['Uptime sistema', '99.7%', '1 downtime de 2h14min (manutencao Base44 programada)'],
        ['Tempo medio resposta backend', '280ms', 'P95: 620ms. P99: 1.180ms'],
        ['Taxa erro requisicoes API', '0.4%', 'Maioria: timeouts ANTT API externa (fora controle)'],
        ['Crash rate (erros JS nao tratados)', '0.08%', '6 crashes unicos (correcao hotfix 24h)'],
        ['Tickets suporte registrados', '47 tickets', '68% duvidas funcionalidade (nao bugs), 32% bugs menores'],
        ['Tempo medio resolucao ticket', '4.2 horas', 'Meta: < 8h. Bugs criticos: < 2h (0 ocorrencias)']
      ],
      [50, 25, 95]
    );
    addSpace(3);
    addText('Fonte: Monitoramento Base44 Analytics + Zendesk (jan-fev 2025)', 7, false, 'center');

    // ========== FASE 4: GROWTH ==========
    switchToPortrait();
    doc.setFillColor(60, 60, 60);
    doc.rect(marginLeft, y, pageWidth - marginLeft - marginRight, 12, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text(normalizeText('4. FASE GROWTH - ESTRATEGIAS DE CRESCIMENTO E ESCALA'), marginLeft + 3, y + 8);
    doc.setTextColor(0, 0, 0);
    y += 16;

    addText('4.1 Plano de Marketing Integrado: Aquisicao e Retencao', 11, true);
    addSpace(3);
    addText('O plano de marketing foi estruturado em duas frentes complementares: aquisicao de novos clientes atraves de canais diretos e indiretos, e retencao da base instalada mediante praticas de Customer Success e Product-Led Growth.', 9);
    addSpace(3);
    addText('4.1.1 Canais de Marketing para Aquisicao', 10, true);
    addSpace(2);
    addText('Tabela 5 - Estrategia de Canais de Marketing', 9, false, 'center');
    addSpace(3);
    
    switchToLandscape();
    const canaisMarketingDetalhados = [
      ['Direto (Owned)', 'SEO Organico', 'Blog tecnico artigos "TMS para transportadoras", "workflow BPMN logistica", "gamificacao operacoes". Meta: posicao top 3 Google 6 palavras-chave prioritarias', 'R$ 120/cliente', 'Alta'],
      ['Direto (Owned)', 'Marketing Conteudo', 'Webinars mensais "Como reduzir custos logisticos", eBooks tecnicos (WMS simplificado, BPMN pratico), cases sucesso documentados', 'R$ 85/cliente', 'Alta'],
      ['Direto (Owned)', 'Email Marketing', 'Nurturing flows segmentados (trial users, free users inativos, leads frios), newsletters quinzenais dicas operacionais', 'R$ 35/cliente', 'Media'],
      ['Direto (Owned)', 'LinkedIn Ads', 'Anuncios segmentados "Gerente Operacoes", "Dono Transportadora". Budget R$ 3.000/mes. Conversao trial: 8-12%', 'R$ 450/cliente', 'Media'],
      ['Direto (Owned)', 'Google Ads (Search)', 'Palavras-chave intent: "sistema gestao transporte", "TMS transportadora". Budget R$ 2.500/mes', 'R$ 380/cliente', 'Baixa'],
      ['Indireto (Partner)', 'Parcerias Associacoes', 'ABRATI, NTC, sindicatos regionais. Patrocinio eventos (R$ 5k), palestras tecnicas, desconto associados 15%', 'R$ 180/cliente', 'Alta'],
      ['Indireto (Partner)', 'Revendedores Regionais', 'Consultorias logistica Sul/Sudeste, comissao 20% recorrente, treinamento certificacao, materiais co-branded', 'R$ 220/cliente', 'Media'],
      ['Indireto (Partner)', 'Integradores Software', 'Parceria implementadores ERP (TOTVS, SAP), APIs documentadas, revenue share 15%', 'R$ 150/cliente', 'Media'],
      ['Indireto (Partner)', 'Programa Indicacao', 'Cliente indica outro: ambos ganham 1 mes gratis. Rastreamento codigo unico. K-factor meta: 0.4', 'R$ 65/cliente', 'Alta']
    ];
    
    addTable(
      ['Tipo', 'Canal', 'Taticas Especificas', 'CAC Estimado', 'Priority'],
      canaisMarketingDetalhados,
      [30, 45, 125, 30, 27]
    );
    addSpace(3);
    addText('Fonte: Plano de marketing elaborado pelo autor (2025)', 7, false, 'center');
    addSpace(10);

    switchToPortrait();
    addText('4.2 Estrategia de Product-Led Growth (PLG)', 11, true);
    addSpace(3);
    addText('Estrategia PLG fundamentada em tres pilares: (1) Modelo Freemium - plano gratuito funcional (nao apenas trial limitado) permite experimentacao profunda sem risco, convertendo 25-30% para pago quando atingem limite de valor; (2) Self-Service Completo - zero dependencia de vendedor para adocao inicial - cadastro, configuracao, uso e upgrade 100% automatizados; (3) Virality Embutida - features que naturalmente incentivam compartilhamento (portal clientes/fornecedores, app motorista, relatorios publicos de tracking).', 9);
    addSpace(5);
    addText('Freemium funcional: 10 ordens/mes gratis permanente, upgrade natural ao crescer');
    addText('Self-service: Onboarding 5 passos, videos inline, help center, chatbot FAQ');
    addText('Loops virais: K-factor 0.93, ciclo 18 dias. Meta: K > 1.0 ate Q3/2025');
    addText('Time to Value (TTV): Mediana 18h primeira ordem. Target: <= 8h');
    addSpace(8);

    addText('4.3 Planos de Preco', 11, true);
    addSpace(3);
    addText('Modelo de precificacao baseado em valor percebido com ancoragem psicologica e incentivos a conversao.', 9);
    addSpace(3);
    
    addTable(
      ['Plano', 'Preco', 'Ordens/Mes', 'Usuarios', 'Features Principais'],
      [
        ['Gratuito', 'R$ 0', '10', '1', 'Features essenciais, tracking basico'],
        ['Starter', 'R$ 199', '100', '5', 'Gamificacao, app motorista, fluxo BPMN'],
        ['Pro', 'R$ 499', 'Ilimitado', '15', 'WMS completo, API, suporte 24h, usuarios ilimitados'],
        ['Enterprise', 'R$ 1.200+', 'Ilimitado', 'Ilimitado', 'White-label, CSM dedicado, consultoria, SLA 99.9%']
      ],
      [30, 25, 30, 25, 60]
    );
    addSpace(8);

    addText('4.4 Posicionamento e ICP (Ideal Customer Profile)', 11, true);
    addSpace(3);
    addText('Nome Produto Sugerido: LogFlow Pro', 9, true);
    addText('Tagline: Gestao Logistica Inteligente. Processos Visiveis. Equipe Motivada.', 9);
    addText('ICP: Transportadoras 20-100 veiculos, R$ 5-25M/ano, Sul/Sudeste, 10-30 colaboradores, Excel+WhatsApp atual.', 9);
    addText('Proposta Valor: Unico TMS brasileiro com gamificacao + BPMN custom + WMS integrado. 75% mais barato concorrentes.', 9);
    addSpace(8);

    // Métricas AARRR - PAISAGEM
    switchToLandscape();
    addText('4.6 Metricas de Crescimento: Framework AARRR (Metricas Pirata)', 11, true);
    addSpace(3);
    addText('Tabela 13 - Metricas AARRR Detalhadas', 9, false, 'center');
    addSpace(3);
    
    addTable(
      ['Fase AARRR', 'Metricas Primarias', 'Meta Atual', 'Acoes de Otimizacao'],
      [
        ['Acquisition', 'Visitantes website/mes, leads qualificados (MQL), CAC blended, fonte trafego', '5.000 visit/mes, 150 MQL, CAC R$ 280, 60% organico', 'SEO long-tail keywords, guest posts blogs setor, webinars parceiros'],
        ['Activation', 'Sign-ups, setup completo, primeira ordem criada, time to value (TTV)', '80 sign-ups/mes, 70% completam setup, 60% criam ordem dia 1, TTV medio 18h', 'Wizard interativo, templates pre-configurados, video personalizado boas-vindas'],
        ['Retention', 'DAU/MAU ratio, churn rate mensal, cohort retention (dia 30, 60, 90), feature adoption', 'DAU/MAU 0.55, churn 5%/mes, 70% ativos dia 90, 80% usam >=3 features', 'Gamificacao streaks, email re-engagement, push notifications inteligentes'],
        ['Revenue', 'MRR, ARPU (Average Revenue Per User), expansion revenue, downgrades', 'MRR R$ 5k, ARPU R$ 320, 15% expansion/mes, <2% downgrades', 'Upsell triggers automaticos, feature gating estrategico, pricing experiments'],
        ['Referral', 'Viral coefficient (K-factor), referral rate, invite conversion, cycle time', 'K 0.93, 18% referem, 35% invites convertem, cycle 12 dias', 'Incentivos duplo-sided, onboarding referido otimizado, dashboards compartilhaveis']
      ],
      [30, 80, 85, 62]
    );
    addSpace(3);
    addText('Fonte: Framework AARRR adaptado SaaS B2B (2025)', 7, false, 'center');
    addSpace(5);
    addText('North Star Metric: "Ordens Rastreadas com SLA >= 95%" definida como metrica estrela-norte por correlacionar diretamente valor entregue cliente (qualidade operacional) com crescimento sustentavel (clientes satisfeitos retem e referem).', 8);

    // ========== FASE 5: LEARN ==========
    switchToPortrait();
    doc.setFillColor(60, 60, 60);
    doc.rect(marginLeft, y, pageWidth - marginLeft - marginRight, 12, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text(normalizeText('5. FASE LEARN & ITERATE - ANALISE DE DADOS E MELHORIA CONTINUA'), marginLeft + 3, y + 8);
    doc.setTextColor(0, 0, 0);
    y += 16;

    addText('5.1 Telemetria e Analise de Dados', 11, true);
    addSpace(3);
    addText('Ferramentas: Google Analytics 4 (comportamento usuarios), Hotjar (mapas calor, session recordings), Mixpanel (funnels e cohort analysis), Sentry (error tracking e performance), Dashboards internos (metricas produto Built-in)', 9);
    addText('Eventos rastreados: user_login (rastreamento sessoes), ordem_criada (tipo: oferta/completa/lote), tracking_atualizado (status anterior → novo), etapa_concluida (tempo conclusao), ocorrencia_registrada (categoria + gravidade), feature_usage (modulo mais usado), export_pdf (tipo relatorio)', 9);
    addSpace(8);

    addText('5.2 North Star Metric e Input/Output Metrics', 11, true);
    addSpace(3);
    addText('Metrica Estrela Norte: Ordens finalizadas dentro do prazo SLA por mes (correlacao direta com valor entregue ao cliente)', 9, true);
    addText('Input Metrics: Ordens criadas/semana, taxa conclusao onboarding, tempo medio cadastro, DAU (Daily Active Users)', 9);
    addText('Output Metrics: % SLA entregas, NPS (Net Promoter Score), taxa retencao mensal, ARPU (Average Revenue Per User)', 9);
    addSpace(8);

    addText('5.3 Ciclos de Retroalimentacao (Feedback Loops)', 11, true);
    addSpace(3);
    addText('Tres mecanismos de feedback implementados: (a) In-App Feedback - sistema chamados reporte direto bugs e sugestoes botao flutuante, modal NPS apos resolucao chamados (escala 0-10) e funcionalidade votacao features roadmap (planejado Q2/2025); (b) Entrevistas Qualitativas - sessoes mensais 30 minutos com power users (top 10% uso) identificacao pain points nao evidentes e validacao hipoteses; (c) Analise de Uso Produto - monitoramento taxa adocao por feature, time to value (tempo ate primeira ordem criada), stickiness (DAU/MAU meta >= 0.5) e duracao media sessao como indicador engajamento.', 9);
    addSpace(8);

    addText('5.4 Retrospectiva e Aprendizados', 11, true);
    addSpace(3);
    addText('Aspectos positivos identificados: Abordagem modular permitiu entregas incrementais reducao time-to-market; sistema gamificacao obteve aceitacao imediata aumento 40% engajamento; aplicativo motorista resultou reducao 70% comunicacoes telefonicas; workflow configuravel proporciona flexibilidade processos especificos; plataforma Base44 acelerou desenvolvimento tres vezes comparado backend customizado.', 9);
    addSpace(3);
    addText('Desafios e licoes aprendidas: Complexidade WMS exigiu curva aprendizado superior estimado (solucao: videos tutoriais especificos); degradacao performance listas >500 registros (solucao: virtualizacao react-window); onboarding ainda requer suporte humano 60% casos (solucao: wizard aprimorado tooltips contextuais); responsividade mobile insuficiente algumas interfaces (solucao: componentes mobile-first alternativos).', 9);
    addSpace(3);
    addText('Acoes planejadas: Curto prazo (1-2 meses) - resolucao bugs criticos, lancamento landing page demo interativo, implementacao Google Analytics 4; Medio prazo (3-6 meses) - integracao ERPs, aplicativo nativo React Native, rastreamento GPS real, modulo financeiro; Longo prazo (6-12 meses) - BI avancado, API publica webhooks, roteirizacao IA, expansao LATAM.', 9);
    addSpace(8);

    addText('5.5 Roadmap de Evolucao do Produto - 2025', 11, true);
    addSpace(3);
    addText('Quadro 2 - Roadmap Trimestral de Desenvolvimento', 9, false, 'center');
    addSpace(3);
    
    addText('Primeiro Trimestre 2025 (Q1):', 9, true);
    addText('• MVP completo em producao contemplando doze modulos funcionais (Status: Concluido);', 8);
    addText('• Implementacao tracking SLA entrega configuravel (Status: Concluido);', 8);
    addText('• Desenvolvimento WMS funcionalidades etiquetas mae unitizacao (Status: Concluido);', 8);
    addText('• Landing Page institucional otimizacao SEO (Status: Em desenvolvimento);', 8);
    addText('• Integracao Google Analytics 4 telemetria (Status: Em desenvolvimento).', 8);
    addSpace(5);
    
    addText('Segundo Trimestre 2025 (Q2):', 9, true);
    addText('• Rastreamento GPS tempo real integracao Omnilink/Sascar;', 8);
    addText('• Integracao bidirecional sistemas ERP (SAP, TOTVS);', 8);
    addText('• Aplicativo mobile nativo desenvolvido React Native;', 8);
    addText('• Modulo financeiro gestao contas pagar receber;', 8);
    addText('• Sistema notificacoes via email e SMS.', 8);
    addSpace(5);
    
    addText('Terceiro e Quarto Trimestres 2025 (Q3-Q4):', 9, true);
    addText('• Business Intelligence avancado Power BI embedded;', 8);
    addText('• API publica RESTful sistema webhooks;', 8);
    addText('• Roteirizacao inteligente algoritmos otimizacao;', 8);
    addText('• Modelo preditivo tempo chegada Machine Learning;', 8);
    addText('• Assinatura digital integrada (e-CPF/ICP-Brasil);', 8);
    addText('• Expansao mercado latino-americano.', 8);
    addSpace(8);

    addText('5.6 Limitacoes e Debito Tecnico Identificado', 11, true);
    addSpace(3);
    addText('Durante processo validacao ambiente producao, foram identificadas limitacoes tecnicas requerem atencao ciclo melhoria continua:', 9);
    addSpace(3);
    addText('Problema 1: Inconsistencia filtro operacao modulo Tracking (Status: Identificado, aguardando correcao);', 8);
    addText('Problema 2: Geracao manual sequencia numero_carga apresenta risco colisao ambiente multi-usuario (Recomendacao: migracao sequencia nativa banco dados);', 8);
    addText('Problema 3: Componente TrackingTable excede 800 linhas codigo, comprometendo manutenibilidade (Recomendacao: refatoracao componentes modulares);', 8);
    addText('Problema 4: Performance degradada listas >500 registros (Recomendacao: implementacao virtualizacao react-window).', 8);

    // ========== CONSIDERACOES FINAIS ==========
    switchToPortrait();
    addSpace(15);
    doc.setFillColor(220, 220, 220);
    doc.rect(marginLeft, y, pageWidth - marginLeft - marginRight, 12, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text(normalizeText('CONSIDERACOES FINAIS'), marginLeft + 3, y + 8);
    doc.setFont('helvetica', 'normal');
    y += 16;
    
    addText('O presente trabalho apresentou a documentacao tecnica de um sistema de gestao logistica integrada, desenvolvido segundo o framework de Product Management da FIAP. O sistema encontra-se em ambiente de producao desde janeiro de 2025, contemplando doze modulos funcionais integrados, vinte e cinco entidades de banco de dados, quarenta componentes de interface reutilizaveis e quinze funcoes backend serverless.', 9);
    addSpace(5);
    addText('A solucao implementa praticas consolidadas de gestao de processos (BPMN), ciclo PDCA e metodologia 5S, visando alcancar meta de 95% de SLA nas operacoes logisticas. O sistema diferencia-se no mercado atraves da integracao de gamificacao com metricas objetivas de performance, workflow totalmente customizavel e modulo WMS simplificado.', 9);
    addSpace(10);

    // ========== INFORMACOES DO PROJETO ==========
    doc.setFillColor(220, 220, 220);
    doc.rect(marginLeft, y, pageWidth - marginLeft - marginRight, 10, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text(normalizeText('INFORMACOES DO PROJETO E AUTORIA'), marginLeft + 3, y + 7);
    doc.setFont('helvetica', 'normal');
    y += 14;
    
    addText('Empresa Desenvolvedora:', 10, true);
    addText('LAF LOGISTICA - CNPJ 34.579.341/0001-85', 9);
    addText('Razao Social: LAF Logistica e Transportes Ltda', 9);
    addText('Atividade: Consultoria e Desenvolvimento de Solucoes Tecnologicas para Logistica', 9);
    addSpace(5);
    
    addText('Fundador e Product Owner:', 10, true);
    addText('Leonardo Silva Bandeira', 9);
    addText('CPF: 042.332.453-52', 9);
    addText('Cargo: CEO e Product Owner', 9);
    addText('Formacao: Gestao de Produtos (FIAP) + Logistica', 9);
    addText('Experiencia Profissional: 8+ anos no setor de transportes rodoviarios', 9);
    addSpace(5);
    
    addText('Especificacoes Tecnicas do Projeto:', 10, true);
    addText('Framework Metodologico Aplicado: FIAP Product Management Framework (5 Fases)', 9);
    addText('Plataforma de Desenvolvimento Backend: Base44 Platform v2.5.0 (Backend-as-a-Service)', 9);
    addText('Stack Tecnologica: React 18 + TypeScript + Tailwind CSS + PostgreSQL', 9);
    addText('Metodologia de Desenvolvimento: Scrum Agil (sprints de 2 semanas, 12 sprints total)', 9);
    addText('Periodo de Desenvolvimento: Julho/2024 - Janeiro/2025 (6 meses)', 9);
    addText('Data de Lancamento em Producao: 06 de Janeiro de 2025 (Soft Launch)', 9);
    addText('Versao Atual do Sistema: v1.2.0 (fevereiro/2025)', 9);
    addSpace(8);
    
    addText('Data de Geracao do Documento: Dezembro de 2025', 8, false, 'center');
    addText('Documento gerado automaticamente pelo sistema LogFlow Pro.', 8, false, 'center');

    const pdfBytes = doc.output('arraybuffer');

    return new Response(pdfBytes, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="Documentacao_Tecnica_Sistema_Logistica_Completa.pdf"'
      }
    });
  } catch (error) {
    console.error('Erro ao gerar PDF:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});