import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';
import { jsPDF } from 'npm:jspdf@2.5.2';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
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

    // Slide 1 - Capa
    doc.setFillColor(8, 145, 178); // cyan-600
    doc.rect(0, 0, pageWidth, pageHeight, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(48);
    doc.setFont(undefined, 'bold');
    doc.text('Sistema de Gestão', pageWidth / 2, 60, { align: 'center' });
    doc.text('Logística Integrada', pageWidth / 2, 85, { align: 'center' });
    
    doc.setFontSize(24);
    doc.setFont(undefined, 'normal');
    doc.text('Transforme sua operação com', pageWidth / 2, 110, { align: 'center' });
    doc.text('tecnologia e inteligência', pageWidth / 2, 125, { align: 'center' });
    
    doc.setFontSize(18);
    doc.text('20 Módulos Integrados • Processos Visuais • Métricas Objetivas', pageWidth / 2, 150, { align: 'center' });

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
    doc.roundedRect(20, 150, 257, 35, 3, 3, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(28);
    doc.setFont(undefined, 'bold');
    doc.text('Product-Market Fit Validado', pageWidth / 2, 170, { align: 'center' });
    doc.setFontSize(16);
    doc.setFont(undefined, 'normal');
    doc.text('Todas métricas superaram metas em 30 dias', pageWidth / 2, 181, { align: 'center' });

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