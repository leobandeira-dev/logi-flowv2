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
        console.log('Empresa nao encontrada, continuando sem logo');
      }
    }

    // Criar PDF em modo paisagem
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });

    const w = 297;
    const h = 210;

    // ========== SLIDE 0 - CAPA ==========
    doc.setFillColor(240, 249, 255);
    doc.rect(0, 0, w, h, 'F');
    
    // LogiFlow
    doc.setTextColor(8, 145, 178);
    doc.setFontSize(56);
    doc.text('LogiFlow', w/2, 60, { align: 'center' });
    
    // Linha
    doc.setFillColor(6, 182, 212);
    doc.rect(w/2 - 24, 65, 48, 1.5, 'F');
    
    // Subtitulos
    doc.setTextColor(31, 41, 55);
    doc.setFontSize(28);
    doc.text('Sistema de Gestao Logistica Integrada', w/2, 85, { align: 'center' });
    
    doc.setFontSize(16);
    doc.setTextColor(107, 114, 128);
    doc.text('Consultoria - Tecnologia - Transformacao Digital', w/2, 95, { align: 'center' });
    
    doc.setFontSize(14);
    doc.setTextColor(6, 182, 212);
    doc.text('Processos Visuais - Metricas Objetivas - Melhoria Continua', w/2, 105, { align: 'center' });
    
    // Cards
    const stats = [
      { label: '20+ Modulos', value: '20+' },
      { label: '4 Perfis', value: '4' },
      { label: '100% Gamificado', value: '100%' },
      { label: 'Meta SLA 95%+', value: '95%+' }
    ];
    
    let x = 35;
    stats.forEach((stat, i) => {
      const colors = [[6, 182, 212], [37, 99, 235], [29, 78, 216], [30, 64, 175]];
      doc.setFillColor(255, 255, 255);
      doc.setDrawColor(...colors[i]);
      doc.rect(x, 120, 55, 28, 'FD');
      
      doc.setTextColor(...colors[i]);
      doc.setFontSize(20);
      doc.text(stat.value, x + 27.5, 135, { align: 'center' });
      
      doc.setFontSize(9);
      doc.setTextColor(75, 85, 99);
      doc.text(stat.label, x + 27.5, 142, { align: 'center' });
      
      x += 60;
    });
    
    // Rodape
    doc.setFillColor(30, 41, 59);
    doc.rect(20, 160, 257, 35, 'F');
    
    doc.setTextColor(148, 163, 184);
    doc.setFontSize(8);
    doc.text('EMPRESA', 30, 168);
    doc.text('PRODUCT OWNER', 155, 168);
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.text('LAF Logistica', 30, 176);
    doc.text('Leonardo Silva Bandeira', 155, 176);
    
    doc.setFontSize(10);
    doc.setTextColor(203, 213, 225);
    doc.text('CNPJ 34.579.341/0001-85', 30, 183);
    doc.text('CPF 042.332.453-52', 155, 183);
    
    doc.setFillColor(71, 85, 105);
    doc.rect(20, 188, 257, 0.5, 'F');
    
    doc.setTextColor(148, 163, 184);
    doc.setFontSize(8);
    doc.text('STACK TECNOLOGICA', w/2, 193, { align: 'center' });
    doc.setFontSize(9);
    doc.setTextColor(203, 213, 225);
    doc.text('React - TypeScript - PostgreSQL - Deno Deploy', w/2, 199, { align: 'center' });

    // ========== SLIDE 1 - VISAO GERAL ==========
    doc.addPage();
    doc.setFillColor(240, 249, 255);
    doc.rect(0, 0, w, h, 'F');
    
    doc.setTextColor(8, 145, 178);
    doc.setFontSize(32);
    doc.text('Gestao Logistica Completa', w/2, 25, { align: 'center' });
    
    doc.setFontSize(14);
    doc.setTextColor(75, 85, 99);
    doc.text('20 Modulos Integrados - Processos visuais - Metricas objetivas', w/2, 35, { align: 'center' });
    
    // Gestao de Operacoes
    doc.setFontSize(12);
    doc.setTextColor(6, 182, 212);
    doc.text('Gestao de Operacoes', 25, 50);
    
    x = 25;
    ['Dashboard', 'Tracking', 'Fluxo BPMN', 'Ordens'].forEach((nome, i) => {
      const colors = [[6, 182, 212], [8, 145, 178], [37, 99, 235], [29, 78, 216]];
      doc.setFillColor(...colors[i]);
      doc.rect(x, 55, 60, 22, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(10);
      doc.text(nome, x + 30, 66, { align: 'center' });
      
      x += 63;
    });
    
    // Coletas
    doc.setFontSize(12);
    doc.setTextColor(6, 182, 212);
    doc.text('Gestao de Coletas', 25, 90);
    
    x = 25;
    ['Dashboard Coletas', 'Solicitar Coleta', 'Aprovar Coletas'].forEach((nome, i) => {
      const colors = [[6, 182, 212], [8, 145, 178], [37, 99, 235]];
      doc.setFillColor(...colors[i]);
      doc.rect(x, 95, 60, 22, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(9);
      doc.text(nome, x + 30, 106, { align: 'center' });
      
      x += 63;
    });

    // ========== SLIDE 2 - GESTAO DE ORDENS ==========
    doc.addPage();
    doc.setFillColor(240, 249, 255);
    doc.rect(0, 0, w, h, 'F');
    
    doc.setTextColor(8, 145, 178);
    doc.setFontSize(32);
    doc.text('Gestao Completa de Ordens', w/2, 30, { align: 'center' });
    
    doc.setFontSize(18);
    doc.setTextColor(75, 85, 99);
    doc.text('5 Modalidades de Criacao - Do Simples ao Avancado', w/2, 45, { align: 'center' });
    
    const modalidades = [
      { num: '01', title: 'Ordem Completa', desc: '60+ campos' },
      { num: '02', title: 'Oferta de Carga', desc: 'Cadastro rapido' },
      { num: '03', title: 'Lote Excel', desc: 'Importacao massa' },
      { num: '04', title: 'OCR de PDF', desc: 'Extracao via IA' },
      { num: '05', title: 'Ordens Filhas', desc: 'Multiplos destinos' }
    ];
    
    x = 15;
    modalidades.forEach((mod, i) => {
      const colors = [[6, 182, 212], [8, 145, 178], [37, 99, 235], [29, 78, 216], [30, 64, 175]];
      
      doc.setFillColor(...colors[i]);
      doc.rect(x, 60, 50, 70, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(24);
      doc.text(mod.num, x + 25, 85, { align: 'center' });
      
      doc.setFontSize(14);
      doc.text(mod.title, x + 25, 100, { align: 'center' });
      
      doc.setFontSize(10);
      doc.text(mod.desc, x + 25, 110, { align: 'center' });
      
      x += 55;
    });
    
    doc.setFillColor(6, 182, 212);
    doc.rect(20, 145, 257, 30, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.text('Reducao de 75% no tempo de cadastro', w/2, 162, { align: 'center' });
    doc.setFontSize(14);
    doc.text('De 18 minutos para apenas 4 minutos por ordem', w/2, 172, { align: 'center' });

    // ========== SLIDE 3 - TRACKING ==========
    doc.addPage();
    doc.setFillColor(240, 249, 255);
    doc.rect(0, 0, w, h, 'F');
    
    doc.setTextColor(8, 145, 178);
    doc.setFontSize(32);
    doc.text('Tracking Logistico', w/2, 30, { align: 'center' });
    
    doc.setFontSize(18);
    doc.setTextColor(75, 85, 99);
    doc.text('10 Estagios Completos - Visibilidade Total', w/2, 45, { align: 'center' });
    
    const estagios = ['Agend.', 'Agendado', 'Carreg.', 'Carregado', 'Viagem', 'Chegou', 'Desc.Ag', 'Descar.', 'Desc.OK', 'Final'];
    
    x = 20;
    estagios.forEach((est, i) => {
      const progress = i / 9;
      const r = Math.round(6 + progress * 23);
      const g = Math.round(182 - progress * 104);
      const b = Math.round(212);
      
      doc.setFillColor(r, g, b);
      doc.rect(x, 65, 26, 30, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(8);
      doc.text(est, x + 13, 83, { align: 'center' });
      
      x += 27;
    });
    
    doc.setTextColor(17, 24, 39);
    doc.setFontSize(16);
    doc.text('Recursos Principais:', 30, 115);
    
    doc.setFontSize(12);
    const recursos = [
      'Localizacao via Google Distance Matrix',
      'SLA com alertas visuais e expurgo',
      'Chat central tempo real',
      'Multiplas visualizacoes (Tabela/Planilha/TV)'
    ];
    
    let y = 130;
    recursos.forEach(rec => {
      doc.text('- ' + rec, 30, y);
      y += 12;
    });
    
    doc.setFillColor(6, 182, 212);
    doc.rect(20, 175, 257, 20, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.text('Reducao de 70% em ligacoes telefonicas', w/2, 188, { align: 'center' });

    // ========== SLIDE 4 - PORTAL B2B ==========
    doc.addPage();
    doc.setFillColor(240, 249, 255);
    doc.rect(0, 0, w, h, 'F');
    
    doc.setTextColor(8, 145, 178);
    doc.setFontSize(32);
    doc.text('Portal B2B - Coletas', w/2, 30, { align: 'center' });
    
    doc.setFontSize(18);
    doc.setTextColor(75, 85, 99);
    doc.text('Self-Service para Fornecedores e Clientes', w/2, 45, { align: 'center' });
    
    const fluxoB2B = [
      { num: '1', title: 'Fornecedor Solicita', desc: 'Upload XMLs, dados carga' },
      { num: '2', title: 'Cliente Aprova', desc: 'Portal aprovacoes online' },
      { num: '3', title: 'Conversao Auto', desc: 'Vira ordem carregamento' }
    ];
    
    x = 30;
    fluxoB2B.forEach((etapa, i) => {
      const colors = [[6, 182, 212], [37, 99, 235], [29, 78, 216]];
      
      doc.setFillColor(...colors[i]);
      doc.rect(x, 70, 75, 50, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(28);
      doc.text(etapa.num, x + 37.5, 90, { align: 'center' });
      
      doc.setFontSize(14);
      doc.text(etapa.title, x + 37.5, 103, { align: 'center' });
      
      doc.setFontSize(10);
      doc.text(etapa.desc, x + 37.5, 113, { align: 'center' });
      
      x += 85;
    });
    
    doc.setFillColor(6, 182, 212);
    doc.rect(20, 140, 257, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.text('Processo de coleta totalmente digital', w/2, 160, { align: 'center' });
    doc.setFontSize(16);
    doc.text('De dias para minutos - Sem ligacoes - Rastreavel', w/2, 172, { align: 'center' });

    // ========== SLIDE 5 - WORKFLOW ==========
    doc.addPage();
    doc.setFillColor(6, 182, 212);
    doc.rect(0, 0, w, h, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(36);
    doc.text('Workflow BPMN', w/2, 40, { align: 'center' });
    
    doc.setFontSize(20);
    doc.text('Etapas Configuraveis com SLA Granular', w/2, 55, { align: 'center' });
    
    const etapas = ['Cadastro', 'Rastreamento', 'Expedicao', 'Financeiro', 'Finalizacao'];
    x = 25;
    etapas.forEach((etapa, i) => {
      doc.setFillColor(255, 255, 255);
      doc.circle(x + 25, 100, 15, 'F');
      
      doc.setTextColor(6, 182, 212);
      doc.setFontSize(20);
      doc.text((i + 1).toString(), x + 25, 105, { align: 'center' });
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(12);
      doc.text(etapa, x + 25, 125, { align: 'center' });
      
      x += 53;
    });
    
    doc.setFontSize(20);
    doc.text('Recursos:', 30, 150);
    
    doc.setFontSize(14);
    const recursos2 = [
      'Prazos em dias/horas/minutos',
      '3 modos de contagem de prazo',
      'Campos customizados por etapa',
      'Atribuicao por usuario ou departamento'
    ];
    
    y = 165;
    recursos2.forEach(rec => {
      doc.text('- ' + rec, 30, y);
      y += 12;
    });

    // ========== SLIDE 6 - GAMIFICACAO ==========
    doc.addPage();
    doc.setFillColor(240, 249, 255);
    doc.rect(0, 0, w, h, 'F');
    
    doc.setTextColor(8, 145, 178);
    doc.setFontSize(32);
    doc.text('Gamificacao e SLA', w/2, 30, { align: 'center' });
    
    doc.setFontSize(18);
    doc.setTextColor(75, 85, 99);
    doc.text('Metricas de Performance e Reconhecimento', w/2, 45, { align: 'center' });
    
    const niveis = [
      { num: '1', nome: 'Iniciante', pts: '0-100' },
      { num: '2', nome: 'Cadete', pts: '101-300' },
      { num: '3', nome: 'Operacional', pts: '301-600' },
      { num: '4', nome: 'Mestre', pts: '601-1000' },
      { num: '5', nome: 'Comandante', pts: '1000+' }
    ];
    
    x = 20;
    niveis.forEach((nivel, i) => {
      const colors = [[6, 182, 212], [8, 145, 178], [37, 99, 235], [29, 78, 216], [30, 64, 175]];
      
      doc.setFillColor(...colors[i]);
      doc.rect(x, 65, 52, 50, 'F');
      
      doc.setFillColor(255, 255, 255);
      doc.circle(x + 26, 82, 8, 'F');
      
      doc.setTextColor(...colors[i]);
      doc.setFontSize(16);
      doc.text(nivel.num, x + 26, 86, { align: 'center' });
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(12);
      doc.text(nivel.nome, x + 26, 100, { align: 'center' });
      
      doc.setFontSize(10);
      doc.text(nivel.pts, x + 26, 110, { align: 'center' });
      
      x += 54;
    });
    
    doc.setFillColor(37, 99, 235);
    doc.rect(20, 130, 120, 55, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.text('Calculo do SLA', 30, 145);
    doc.setFontSize(12);
    doc.text('60% Qualidade', 30, 158);
    doc.text('(Ocorrencias)', 30, 166);
    doc.text('40% Produtividade', 30, 176);
    doc.text('(Ordens + Etapas)', 30, 184);
    
    doc.setFillColor(6, 182, 212);
    doc.rect(155, 130, 122, 55, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.text('Rankings', 165, 145);
    doc.setFontSize(12);
    doc.text('- Ranking geral acumulado', 165, 158);
    doc.text('- Ranking mensal', 165, 168);
    doc.text('- Por categoria de usuario', 165, 178);

    // ========== SLIDE 7 - RESULTADOS ==========
    doc.addPage();
    doc.setFillColor(240, 249, 255);
    doc.rect(0, 0, w, h, 'F');
    
    doc.setTextColor(8, 145, 178);
    doc.setFontSize(32);
    doc.text('Resultados Comprovados', w/2, 30, { align: 'center' });
    
    doc.setFontSize(18);
    doc.setTextColor(75, 85, 99);
    doc.text('Metricas Reais de 30 Dias de Operacao', w/2, 45, { align: 'center' });
    
    const resultados = [
      { valor: '+10pp', titulo: 'SLA Entregas', desc: 'De 78% para 88%', color: [6, 182, 212] },
      { valor: '-75%', titulo: 'Tempo Cadastro', desc: 'De 18min para 4min', color: [8, 145, 178] },
      { valor: '-70%', titulo: 'Ligacoes Tel', desc: 'Reducao comunicacao', color: [37, 99, 235] }
    ];
    
    x = 25;
    resultados.forEach((res) => {
      doc.setFillColor(...res.color);
      doc.rect(x, 70, 80, 60, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(32);
      doc.text(res.valor, x + 40, 95, { align: 'center' });
      
      doc.setFontSize(14);
      doc.text(res.titulo, x + 40, 108, { align: 'center' });
      
      doc.setFontSize(11);
      doc.text(res.desc, x + 40, 120, { align: 'center' });
      
      x += 88;
    });
    
    doc.setFillColor(6, 182, 212);
    doc.rect(20, 150, 257, 30, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.text('Product-Market Fit Validado', w/2, 166, { align: 'center' });
    doc.setFontSize(14);
    doc.text('Todas metricas superaram metas em 30 dias', w/2, 174, { align: 'center' });

    // Gerar e retornar PDF
    const pdfBytes = doc.output('arraybuffer');

    return new Response(pdfBytes, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="Apresentacao_LogiFlow.pdf"'
      }
    });
  } catch (error) {
    console.error('Erro ao gerar PDF:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});