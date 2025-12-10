import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';
import { jsPDF } from 'npm:jspdf@2.5.2';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Buscar dados da empresa
    let empresa = null;
    if (user.empresa_id) {
      try {
        empresa = await base44.asServiceRole.entities.Empresa.get(user.empresa_id);
      } catch (error) {
        console.log('Empresa não encontrada, continuando sem logo');
      }
    }

    // Criar PDF em modo paisagem (landscape) com margem zero
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4',
      compress: true
    });

    const pageWidth = 297; // A4 landscape width
    const pageHeight = 210; // A4 landscape height

    // Slide 0 - Capa Institucional
    doc.setFillColor(240, 249, 255);
    doc.rect(0, 0, pageWidth, pageHeight, 'F');
    
    // LogiFlow Title
    doc.setTextColor(8, 145, 178);
    doc.setFontSize(56);
    doc.setFont(undefined, 'bold');
    doc.text('LogiFlow', pageWidth / 2, 60, { align: 'center' });
    
    // Linha decorativa
    doc.setFillColor(6, 182, 212);
    doc.rect(pageWidth / 2 - 24, 65, 48, 1.5, 'F');
    
    // Subtítulos
    doc.setTextColor(31, 41, 55);
    doc.setFontSize(28);
    doc.setFont(undefined, 'bold');
    doc.text('Sistema de Gestão Logística Integrada', pageWidth / 2, 85, { align: 'center' });
    
    doc.setFontSize(16);
    doc.setTextColor(107, 114, 128);
    doc.setFont(undefined, 'normal');
    doc.text('Consultoria • Tecnologia • Transformação Digital', pageWidth / 2, 95, { align: 'center' });
    
    doc.setFontSize(14);
    doc.setTextColor(6, 182, 212);
    doc.setFont(undefined, 'bold');
    doc.text('Processos Visuais • Métricas Objetivas • Melhoria Contínua', pageWidth / 2, 105, { align: 'center' });
    
    // Cards de destaque
    const stats = [
      { label: '20+ Módulos', value: '20+' },
      { label: '4 Perfis', value: '4' },
      { label: '100% Gamificado', value: '100%' },
      { label: 'Meta SLA 95%+', value: '95%+' }
    ];
    
    let statsX = 35;
    stats.forEach((stat, idx) => {
      const colors = [[6, 182, 212], [37, 99, 235], [29, 78, 216], [30, 64, 175]];
      doc.setFillColor(255, 255, 255);
      doc.setDrawColor(...colors[idx]);
      doc.setLineWidth(0.5);
      doc.roundedRect(statsX, 120, 55, 28, 2, 2, 'FD');
      
      doc.setTextColor(...colors[idx]);
      doc.setFontSize(20);
      doc.setFont(undefined, 'bold');
      doc.text(stat.value, statsX + 27.5, 135, { align: 'center' });
      
      doc.setFontSize(9);
      doc.setFont(undefined, 'normal');
      doc.setTextColor(75, 85, 99);
      doc.text(stat.label, statsX + 27.5, 142, { align: 'center' });
      
      statsX += 60;
    });
    
    // Rodapé estruturado
    doc.setFillColor(30, 41, 59);
    doc.roundedRect(20, 160, 257, 35, 2, 2, 'F');
    
    // Grid 2 colunas
    doc.setTextColor(148, 163, 184);
    doc.setFontSize(8);
    doc.setFont(undefined, 'normal');
    doc.text('EMPRESA', 30, 168);
    doc.text('PRODUCT OWNER', 155, 168);
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text('LAF Logística', 30, 176);
    doc.text('Leonardo Silva Bandeira', 155, 176);
    
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(203, 213, 225);
    doc.text('CNPJ 34.579.341/0001-85', 30, 183);
    doc.text('CPF 042.332.453-52', 155, 183);
    
    // Linha separadora
    doc.setFillColor(71, 85, 105);
    doc.rect(20, 188, 257, 0.5, 'F');
    
    // Stack tecnológica
    doc.setTextColor(148, 163, 184);
    doc.setFontSize(8);
    doc.text('STACK TECNOLÓGICA', pageWidth / 2, 193, { align: 'center' });
    doc.setFontSize(9);
    doc.setTextColor(203, 213, 225);
    doc.text('React • TypeScript • PostgreSQL • Deno Deploy', pageWidth / 2, 199, { align: 'center' });

    // Slide 1 - Visão Geral Módulos
    doc.addPage();
    doc.setFillColor(240, 249, 255);
    doc.rect(0, 0, pageWidth, pageHeight, 'F');
    
    doc.setTextColor(8, 145, 178);
    doc.setFontSize(32);
    doc.setFont(undefined, 'bold');
    doc.text('Gestão Logística Completa', pageWidth / 2, 25, { align: 'center' });
    
    doc.setFontSize(14);
    doc.setTextColor(75, 85, 99);
    doc.setFont(undefined, 'normal');
    doc.text('20 Módulos Integrados • Processos visuais • Métricas objetivas', pageWidth / 2, 35, { align: 'center' });
    
    // Gestão de Operações
    doc.setFontSize(12);
    doc.setTextColor(6, 182, 212);
    doc.setFont(undefined, 'bold');
    doc.text('Gestão de Operações', 25, 50);
    
    let xPos = 25;
    const opsModules = [
      { name: 'Dashboard', desc: 'Métricas e KPIs' },
      { name: 'Tracking', desc: 'Rastreamento' },
      { name: 'Fluxo BPMN', desc: 'Workflow' },
      { name: 'Ordens', desc: 'Carregamento' }
    ];
    
    opsModules.forEach((mod, idx) => {
      const colors = [[6, 182, 212], [8, 145, 178], [37, 99, 235], [29, 78, 216]];
      doc.setFillColor(...colors[idx]);
      doc.roundedRect(xPos, 55, 60, 22, 2, 2, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(10);
      doc.setFont(undefined, 'bold');
      doc.text(mod.name, xPos + 30, 64, { align: 'center' });
      
      doc.setFontSize(7);
      doc.setFont(undefined, 'normal');
      doc.text(mod.desc, xPos + 30, 71, { align: 'center' });
      
      xPos += 63;
    });
    
    // Gestão de Coletas
    doc.setFontSize(12);
    doc.setTextColor(6, 182, 212);
    doc.setFont(undefined, 'bold');
    doc.text('Gestão de Coletas', 25, 90);
    
    xPos = 25;
    const coletasModules = [
      { name: 'Dashboard Coletas', desc: 'Visão Geral' },
      { name: 'Solicitar Coleta', desc: 'Portal Fornecedor' },
      { name: 'Aprovar Coletas', desc: 'Portal Cliente' }
    ];
    
    coletasModules.forEach((mod, idx) => {
      const colors = [[6, 182, 212], [8, 145, 178], [37, 99, 235]];
      doc.setFillColor(...colors[idx]);
      doc.roundedRect(xPos, 95, 60, 22, 2, 2, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(9);
      doc.setFont(undefined, 'bold');
      doc.text(mod.name, xPos + 30, 104, { align: 'center' });
      
      doc.setFontSize(7);
      doc.setFont(undefined, 'normal');
      doc.text(mod.desc, xPos + 30, 111, { align: 'center' });
      
      xPos += 63;
    });
    
    // WMS e Recursos - lado a lado
    doc.setFontSize(12);
    doc.setTextColor(6, 182, 212);
    doc.setFont(undefined, 'bold');
    doc.text('Armazém (WMS)', 25, 130);
    
    xPos = 25;
    const wmsModules = [
      { name: 'Recebimento' },
      { name: 'Etiquetas Mãe' },
      { name: 'Carregamento' }
    ];
    
    wmsModules.forEach((mod, idx) => {
      const colors = [[37, 99, 235], [29, 78, 216], [30, 64, 175]];
      doc.setFillColor(...colors[idx]);
      doc.roundedRect(xPos, 135, 40, 18, 2, 2, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(8);
      doc.setFont(undefined, 'bold');
      doc.text(mod.name, xPos + 20, 146, { align: 'center' });
      
      xPos += 42;
    });
    
    // Recursos
    doc.setFontSize(12);
    doc.setTextColor(6, 182, 212);
    doc.setFont(undefined, 'bold');
    doc.text('Recursos', 155, 130);
    
    xPos = 155;
    const recursosModules = [
      { name: 'Motoristas' },
      { name: 'Veículos' },
      { name: 'Operações' }
    ];
    
    recursosModules.forEach((mod, idx) => {
      const colors = [[6, 182, 212], [8, 145, 178], [37, 99, 235]];
      doc.setFillColor(...colors[idx]);
      doc.roundedRect(xPos, 135, 40, 18, 2, 2, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(8);
      doc.setFont(undefined, 'bold');
      doc.text(mod.name, xPos + 20, 146, { align: 'center' });
      
      xPos += 42;
    });
    
    // Qualidade e Comunicação - lado a lado
    doc.setFontSize(12);
    doc.setTextColor(6, 182, 212);
    doc.setFont(undefined, 'bold');
    doc.text('Qualidade', 25, 165);
    
    xPos = 25;
    const qualidadeModules = [
      { name: 'Ocorrências' },
      { name: 'Gamificação' }
    ];
    
    qualidadeModules.forEach((mod, idx) => {
      const colors = [[6, 182, 212], [8, 145, 178]];
      doc.setFillColor(...colors[idx]);
      doc.roundedRect(xPos, 170, 40, 18, 2, 2, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(8);
      doc.setFont(undefined, 'bold');
      doc.text(mod.name, xPos + 20, 181, { align: 'center' });
      
      xPos += 42;
    });
    
    doc.setFontSize(12);
    doc.setTextColor(6, 182, 212);
    doc.setFont(undefined, 'bold');
    doc.text('Comunicação', 155, 165);
    
    xPos = 155;
    const comunicacaoModules = [
      { name: 'App Motorista' },
      { name: 'SAC IA' }
    ];
    
    comunicacaoModules.forEach((mod, idx) => {
      const colors = [[37, 99, 235], [29, 78, 216]];
      doc.setFillColor(...colors[idx]);
      doc.roundedRect(xPos, 170, 40, 18, 2, 2, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(8);
      doc.setFont(undefined, 'bold');
      doc.text(mod.name, xPos + 20, 181, { align: 'center' });
      
      xPos += 42;
    });

    // Slide 2 - Gestão de Ordens
    doc.addPage();
    doc.setFillColor(240, 249, 255);

    // Slide 2 - Gestão de Ordens
    doc.addPage();
    doc.setFillColor(240, 249, 255); // blue-50
    doc.rect(0, 0, pageWidth, pageHeight, 'F');
    
    doc.setTextColor(8, 145, 178); // cyan-600
    doc.setFontSize(32);
    doc.setFont(undefined, 'bold');
    doc.text('Gestão Completa de Ordens', pageWidth / 2, 30, { align: 'center' });
    
    doc.setFontSize(18);
    doc.setTextColor(75, 85, 99);
    doc.text('5 Modalidades de Criação - Do Simples ao Avançado', pageWidth / 2, 45, { align: 'center' });
    
    const modalidades = [
      { num: '01', title: 'Ordem Completa', desc: '60+ campos completos' },
      { num: '02', title: 'Oferta de Carga', desc: 'Cadastro rápido' },
      { num: '03', title: 'Lote Excel', desc: 'Importação em massa' },
      { num: '04', title: 'OCR de PDF', desc: 'Extração via IA' },
      { num: '05', title: 'Ordens Filhas', desc: 'Múltiplos destinos' }
    ];
    
    let xPos = 15;
    modalidades.forEach((mod, idx) => {
      const colors = [
        [6, 182, 212],   // cyan-500
        [8, 145, 178],   // cyan-600
        [37, 99, 235],   // blue-600
        [29, 78, 216],   // blue-700
        [30, 64, 175]    // blue-800
      ];
      
      doc.setFillColor(...colors[idx]);
      doc.roundedRect(xPos, 60, 50, 70, 3, 3, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(24);
      doc.setFont(undefined, 'bold');
      doc.text(mod.num, xPos + 25, 85, { align: 'center' });
      
      doc.setFontSize(14);
      doc.text(mod.title, xPos + 25, 100, { align: 'center' });
      
      doc.setFontSize(10);
      doc.setFont(undefined, 'normal');
      doc.text(mod.desc, xPos + 25, 110, { align: 'center' });
      
      xPos += 55;
    });
    
    doc.setFillColor(6, 182, 212); // cyan-500
    doc.roundedRect(20, 145, 257, 40, 3, 3, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont(undefined, 'bold');
    doc.text('Redução de 77% no tempo de cadastro', pageWidth / 2, 165, { align: 'center' });
    doc.setFontSize(16);
    doc.setFont(undefined, 'normal');
    doc.text('De 18 minutos para apenas 4,2 minutos por ordem', pageWidth / 2, 178, { align: 'center' });

    // Slide 3 - Tracking
    doc.addPage();
    doc.setFillColor(240, 249, 255);
    doc.rect(0, 0, pageWidth, pageHeight, 'F');
    
    doc.setTextColor(8, 145, 178);
    doc.setFontSize(32);
    doc.setFont(undefined, 'bold');
    doc.text('Tracking Logístico', pageWidth / 2, 30, { align: 'center' });
    
    doc.setFontSize(18);
    doc.setTextColor(75, 85, 99);
    doc.text('10 Estágios Completos - Visibilidade Total', pageWidth / 2, 45, { align: 'center' });
    
    const estagios = [
      'Agend.', 'Agendado', 'Carreg.', 'Carregado', 'Viagem',
      'Chegou', 'Desc.Ag', 'Descar.', 'Desc.OK', 'Final'
    ];
    
    xPos = 20;
    estagios.forEach((est, idx) => {
      const progress = idx / (estagios.length - 1);
      const r = Math.round(6 + progress * (29 - 6));
      const g = Math.round(182 - progress * (182 - 78));
      const b = Math.round(212 + progress * (216 - 212));
      
      doc.setFillColor(r, g, b);
      doc.roundedRect(xPos, 65, 26, 30, 2, 2, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(8);
      doc.setFont(undefined, 'bold');
      doc.text(est, xPos + 13, 83, { align: 'center' });
      
      xPos += 27;
    });
    
    doc.setTextColor(17, 24, 39);
    doc.setFontSize(16);
    doc.text('Recursos Principais:', 30, 115);
    
    doc.setFontSize(12);
    doc.setFont(undefined, 'normal');
    const recursos = [
      '✓ Localização via Google Distance Matrix',
      '✓ SLA com alertas visuais e expurgo',
      '✓ Chat central tempo real',
      '✓ Múltiplas visualizações (Tabela/Planilha/TV)'
    ];
    
    let yPos = 130;
    recursos.forEach(rec => {
      doc.text(rec, 30, yPos);
      yPos += 12;
    });
    
    doc.setFillColor(6, 182, 212);
    doc.roundedRect(20, 175, 257, 20, 3, 3, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.setFont(undefined, 'bold');
    doc.text('Redução de 70% em ligações telefônicas', pageWidth / 2, 188, { align: 'center' });

    // Slide 4 - Portal B2B
    doc.addPage();
    doc.setFillColor(240, 249, 255);
    doc.rect(0, 0, pageWidth, pageHeight, 'F');
    
    doc.setTextColor(8, 145, 178);
    doc.setFontSize(32);
    doc.setFont(undefined, 'bold');
    doc.text('Portal B2B - Coletas', pageWidth / 2, 30, { align: 'center' });
    
    doc.setFontSize(18);
    doc.setTextColor(75, 85, 99);
    doc.text('Self-Service para Fornecedores e Clientes', pageWidth / 2, 45, { align: 'center' });
    
    const fluxoB2B = [
      { num: '1', title: 'Fornecedor Solicita', desc: 'Upload XMLs, dados carga' },
      { num: '2', title: 'Cliente Aprova', desc: 'Portal aprovações online' },
      { num: '3', title: 'Conversão Auto', desc: 'Vira ordem carregamento' }
    ];
    
    xPos = 30;
    fluxoB2B.forEach((etapa, idx) => {
      const colors = [[6, 182, 212], [37, 99, 235], [29, 78, 216]];
      
      doc.setFillColor(...colors[idx]);
      doc.roundedRect(xPos, 70, 75, 50, 3, 3, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(28);
      doc.setFont(undefined, 'bold');
      doc.text(etapa.num, xPos + 37.5, 90, { align: 'center' });
      
      doc.setFontSize(14);
      doc.text(etapa.title, xPos + 37.5, 103, { align: 'center' });
      
      doc.setFontSize(10);
      doc.setFont(undefined, 'normal');
      doc.text(etapa.desc, xPos + 37.5, 113, { align: 'center' });
      
      xPos += 85;
    });
    
    doc.setFillColor(6, 182, 212);
    doc.roundedRect(20, 140, 257, 40, 3, 3, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont(undefined, 'bold');
    doc.text('Processo de coleta totalmente digital', pageWidth / 2, 160, { align: 'center' });
    doc.setFontSize(16);
    doc.setFont(undefined, 'normal');
    doc.text('De dias para minutos • Sem ligações • Rastreável', pageWidth / 2, 172, { align: 'center' });

    // Slide 5 - Workflow BPMN
    doc.addPage();
    doc.setFillColor(6, 182, 212);
    doc.rect(0, 0, pageWidth, pageHeight, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(36);
    doc.setFont(undefined, 'bold');
    doc.text('Workflow BPMN', pageWidth / 2, 40, { align: 'center' });
    
    doc.setFontSize(20);
    doc.setFont(undefined, 'normal');
    doc.text('Etapas Configuráveis com SLA Granular', pageWidth / 2, 55, { align: 'center' });
    
    const etapas = ['Cadastro', 'Rastreamento', 'Expedição', 'Financeiro', 'Finalização'];
    xPos = 25;
    etapas.forEach((etapa, idx) => {
      doc.setFillColor(255, 255, 255);
      doc.circle(xPos + 25, 100, 15, 'F');
      
      doc.setTextColor(6, 182, 212);
      doc.setFontSize(20);
      doc.setFont(undefined, 'bold');
      doc.text((idx + 1).toString(), xPos + 25, 105, { align: 'center' });
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(12);
      doc.text(etapa, xPos + 25, 125, { align: 'center' });
      
      xPos += 53;
    });
    
    doc.setFontSize(20);
    doc.setFont(undefined, 'bold');
    doc.text('Recursos:', 30, 150);
    
    doc.setFontSize(14);
    doc.setFont(undefined, 'normal');
    const recursos2 = [
      '• Prazos em dias/horas/minutos',
      '• 3 modos de contagem de prazo',
      '• Campos customizados por etapa',
      '• Atribuição por usuário ou departamento'
    ];
    
    yPos = 165;
    recursos2.forEach(rec => {
      doc.text(rec, 30, yPos);
      yPos += 12;
    });

    // Slide 6 - Gamificação
    doc.addPage();
    doc.setFillColor(240, 249, 255);
    doc.rect(0, 0, pageWidth, pageHeight, 'F');
    
    doc.setTextColor(8, 145, 178);
    doc.setFontSize(32);
    doc.setFont(undefined, 'bold');
    doc.text('Gamificação e SLA', pageWidth / 2, 30, { align: 'center' });
    
    doc.setFontSize(18);
    doc.setTextColor(75, 85, 99);
    doc.text('Métricas de Performance e Reconhecimento', pageWidth / 2, 45, { align: 'center' });
    
    const niveis = [
      { num: '1', nome: 'Iniciante', pts: '0-100' },
      { num: '2', nome: 'Cadete', pts: '101-300' },
      { num: '3', nome: 'Operacional', pts: '301-600' },
      { num: '4', nome: 'Mestre', pts: '601-1000' },
      { num: '5', nome: 'Comandante', pts: '1000+' }
    ];
    
    xPos = 20;
    niveis.forEach((nivel, idx) => {
      const colors = [[6, 182, 212], [8, 145, 178], [37, 99, 235], [29, 78, 216], [30, 64, 175]];
      
      doc.setFillColor(...colors[idx]);
      doc.roundedRect(xPos, 65, 52, 50, 3, 3, 'F');
      
      doc.setFillColor(255, 255, 255);
      doc.setTextColor(colors[idx][0], colors[idx][1], colors[idx][2]);
      doc.circle(xPos + 26, 82, 8, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(16);
      doc.setFont(undefined, 'bold');
      doc.text(nivel.num, xPos + 26, 86, { align: 'center' });
      
      doc.setFontSize(12);
      doc.setFont(undefined, 'bold');
      doc.text(nivel.nome, xPos + 26, 100, { align: 'center' });
      
      doc.setFontSize(10);
      doc.setFont(undefined, 'normal');
      doc.text(nivel.pts, xPos + 26, 110, { align: 'center' });
      
      xPos += 54;
    });
    
    doc.setFillColor(37, 99, 235); // blue-600
    doc.roundedRect(20, 130, 120, 55, 3, 3, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.setFont(undefined, 'bold');
    doc.text('Cálculo do SLA', 30, 145);
    doc.setFontSize(12);
    doc.setFont(undefined, 'normal');
    doc.text('60% Qualidade', 30, 158);
    doc.text('(Ocorrências)', 30, 166);
    doc.text('40% Produtividade', 30, 176);
    doc.text('(Ordens + Etapas)', 30, 184);
    
    doc.setFillColor(6, 182, 212); // cyan-500
    doc.roundedRect(155, 130, 122, 55, 3, 3, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.setFont(undefined, 'bold');
    doc.text('Rankings', 165, 145);
    doc.setFontSize(12);
    doc.setFont(undefined, 'normal');
    doc.text('• Ranking geral acumulado', 165, 158);
    doc.text('• Ranking mensal', 165, 168);
    doc.text('• Por categoria de usuário', 165, 178);

    // Slide 7 - Resultados
    doc.addPage();
    doc.setFillColor(240, 249, 255);
    doc.rect(0, 0, pageWidth, pageHeight, 'F');
    
    doc.setTextColor(8, 145, 178);
    doc.setFontSize(32);
    doc.setFont(undefined, 'bold');
    doc.text('Resultados Comprovados', pageWidth / 2, 30, { align: 'center' });
    
    doc.setFontSize(18);
    doc.setTextColor(75, 85, 99);
    doc.text('Métricas Reais de 30 Dias de Operação', pageWidth / 2, 45, { align: 'center' });
    
    const resultados = [
      { valor: '+10pp', titulo: 'SLA Entregas', desc: 'De 78% para 88%', color: [6, 182, 212] },
      { valor: '-75%', titulo: 'Tempo Cadastro', desc: 'De 18min para 4min', color: [8, 145, 178] },
      { valor: '-70%', titulo: 'Ligações Tel', desc: 'Redução comunicação', color: [37, 99, 235] }
    ];
    
    xPos = 25;
    resultados.forEach((res) => {
      doc.setFillColor(...res.color);
      doc.roundedRect(xPos, 70, 80, 60, 3, 3, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(32);
      doc.setFont(undefined, 'bold');
      doc.text(res.valor, xPos + 40, 95, { align: 'center' });
      
      doc.setFontSize(14);
      doc.text(res.titulo, xPos + 40, 108, { align: 'center' });
      
      doc.setFontSize(11);
      doc.setFont(undefined, 'normal');
      doc.text(res.desc, xPos + 40, 120, { align: 'center' });
      
      xPos += 88;
    });
    
    doc.setFillColor(6, 182, 212);
    doc.roundedRect(20, 150, 257, 30, 3, 3, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont(undefined, 'bold');
    doc.text('Product-Market Fit Validado', pageWidth / 2, 166, { align: 'center' });
    doc.setFontSize(14);
    doc.setFont(undefined, 'normal');
    doc.text('Todas métricas superaram metas em 30 dias', pageWidth / 2, 174, { align: 'center' });

    // Gerar PDF como arraybuffer
    const pdfBytes = doc.output('arraybuffer');

    return new Response(pdfBytes, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="Apresentacao_Sistema_Logistica.pdf"'
      }
    });
  } catch (error) {
    console.error('Erro ao gerar PDF:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});