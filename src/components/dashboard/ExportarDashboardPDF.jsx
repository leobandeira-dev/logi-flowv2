import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { FileDown, Loader2 } from "lucide-react";
import jsPDF from "jspdf";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function ExportarDashboardPDF({ 
  metrics, 
  ordensDetalhadas, 
  volumeMensal,
  dadosGrafico,
  insights,
  periodoFiltro,
  anoSelecionado,
  mesSelecionado,
  dataInicioPersonalizada,
  dataFimPersonalizada,
  filters,
  empresa
}) {
  const [loading, setLoading] = useState(false);

  const gerarPDF = async () => {
    setLoading(true);
    try {
      const doc = new jsPDF();
      let yPos = 20;
      const pageHeight = doc.internal.pageSize.height;
      const leftMargin = 15;
      const rightMargin = 195;
      
      // Função para verificar se precisa de nova página
      const checkNewPage = (spaceNeeded = 20) => {
        if (yPos + spaceNeeded > pageHeight - 20) {
          doc.addPage();
          yPos = 20;
        }
      };

      // Cabeçalho
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text('Relatório Executivo - Demanda de Cargas', leftMargin, yPos);
      yPos += 10;
      
      if (empresa?.razao_social) {
        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');
        doc.text(empresa.razao_social, leftMargin, yPos);
        yPos += 8;
      }

      // Período do filtro
      doc.setFontSize(10);
      doc.setTextColor(80);
      doc.setFont('helvetica', 'normal');
      
      let periodTexto = '';
      if (periodoFiltro === 'mes_atual') {
        periodTexto = 'Período: Mês Atual';
      } else if (periodoFiltro === 'ano_atual') {
        periodTexto = `Período: Ano ${anoSelecionado}`;
      } else if (periodoFiltro === 'mes_especifico') {
        const meses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 
                       'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
        periodTexto = `Período: ${meses[mesSelecionado - 1]}/${anoSelecionado}`;
      } else if (periodoFiltro === 'personalizado' && dataInicioPersonalizada && dataFimPersonalizada) {
        periodTexto = `Período: ${format(new Date(dataInicioPersonalizada), 'dd/MM/yyyy')} - ${format(new Date(dataFimPersonalizada), 'dd/MM/yyyy')}`;
      }
      
      doc.text(periodTexto, leftMargin, yPos);
      yPos += 5;
      doc.text(`Data do Relatório: ${format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}`, leftMargin, yPos);
      yPos += 10;

      // Linha separadora
      doc.setDrawColor(0);
      doc.setLineWidth(0.5);
      doc.line(leftMargin, yPos, rightMargin, yPos);
      yPos += 10;

      // Resumo Executivo
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0);
      doc.text('Resumo de Demanda', leftMargin, yPos);
      yPos += 8;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      
      // KPIs principais em destaque
      const kpis = [
        { label: 'Total de Cargas', valor: metrics.totalOrdens },
        { label: 'Taxa de Alocação', valor: `${metrics.totalOrdens > 0 ? ((metrics.ordensCompletas / metrics.totalOrdens) * 100).toFixed(1) : 0}%` },
        { label: 'Ordens Atrasadas', valor: metrics.atrasadas },
      ];

      kpis.forEach((kpi, idx) => {
        const xPos = leftMargin + (idx * 60);
        doc.setFont('helvetica', 'bold');
        doc.text(kpi.label, xPos, yPos);
        doc.setFontSize(16);
        doc.text(String(kpi.valor), xPos, yPos + 7);
        doc.setFontSize(10);
      });
      
      yPos += 18;

      // Performance por Operação
      if (ordensDetalhadas.porOperacao && Object.keys(ordensDetalhadas.porOperacao).length > 0) {
        checkNewPage(40);
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Performance por Operação', leftMargin, yPos);
        yPos += 10;

        // Criar tabela
        const operacoes = Object.entries(ordensDetalhadas.porOperacao);
        
        // Cabeçalho da tabela
        doc.setFillColor(230, 230, 230);
        doc.rect(leftMargin, yPos, 180, 7, 'F');
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.text('Operação', leftMargin + 2, yPos + 5);
        doc.text('Total', leftMargin + 70, yPos + 5);
        doc.text('Alocadas', leftMargin + 95, yPos + 5);
        doc.text('Finalizadas', leftMargin + 125, yPos + 5);
        doc.text('Taxa', leftMargin + 160, yPos + 5);
        yPos += 9;

        doc.setFont('helvetica', 'normal');
        operacoes.forEach(([operacao, stats], idx) => {
          checkNewPage(10);
          
          const taxaFinalizacao = stats.total > 0 ? Math.round((stats.finalizadas / stats.total) * 100) : 0;
          
          // Fundo alternado
          if (idx % 2 === 0) {
            doc.setFillColor(250, 250, 250);
            doc.rect(leftMargin, yPos - 2, 180, 6, 'F');
          }
          
          doc.text(operacao.substring(0, 25), leftMargin + 2, yPos + 3);
          doc.text(String(stats.total), leftMargin + 70, yPos + 3);
          doc.text(String(stats.alocadas), leftMargin + 95, yPos + 3);
          doc.text(String(stats.finalizadas), leftMargin + 125, yPos + 3);
          doc.text(`${taxaFinalizacao}%`, leftMargin + 160, yPos + 3);
          
          yPos += 6;
        });
        
        yPos += 8;
      }

      // Principais Rotas
      if (ordensDetalhadas.topOrigens.length > 0 || ordensDetalhadas.topDestinos.length > 0) {
        checkNewPage(35);
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Principais Rotas', leftMargin, yPos);
        yPos += 8;

        // Tabela lado a lado
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text('Top 5 Origens', leftMargin, yPos);
        doc.text('Top 5 Destinos', leftMargin + 95, yPos);
        yPos += 6;

        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        
        const maxRows = Math.max(ordensDetalhadas.topOrigens.length, ordensDetalhadas.topDestinos.length);
        for (let i = 0; i < maxRows; i++) {
          checkNewPage(8);
          if (ordensDetalhadas.topOrigens[i]) {
            const [origem, count] = ordensDetalhadas.topOrigens[i];
            doc.text(`${i + 1}. ${origem.substring(0, 20)}: ${count}`, leftMargin + 2, yPos);
          }
          if (ordensDetalhadas.topDestinos[i]) {
            const [destino, count] = ordensDetalhadas.topDestinos[i];
            doc.text(`${i + 1}. ${destino.substring(0, 20)}: ${count}`, leftMargin + 97, yPos);
          }
          yPos += 5;
        }
        yPos += 8;
      }

      // Distribuição de Demanda
      checkNewPage(35);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Distribuição de Demanda', leftMargin, yPos);
      yPos += 8;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('Por Tipo de Frota', leftMargin, yPos);
      doc.text('Por Modalidade', leftMargin + 95, yPos);
      yPos += 6;

      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      
      const frotaEntries = Object.entries(ordensDetalhadas.porFrota);
      const modalidadeEntries = Object.entries(ordensDetalhadas.porModalidade);
      const maxRows2 = Math.max(frotaEntries.length, modalidadeEntries.length);
      
      for (let i = 0; i < maxRows2; i++) {
        checkNewPage(8);
        if (frotaEntries[i]) {
          const [frota, count] = frotaEntries[i];
          doc.text(`${frota.charAt(0).toUpperCase() + frota.slice(1)}: ${count}`, leftMargin + 2, yPos);
        }
        if (modalidadeEntries[i]) {
          const [modalidade, count] = modalidadeEntries[i];
          const modalidadeNome = modalidade === 'normal' ? 'Normal' : 
                                 modalidade === 'prioridade' ? 'Prioridade' : 'Expressa';
          doc.text(`${modalidadeNome}: ${count}`, leftMargin + 97, yPos);
        }
        yPos += 5;
      }
      yPos += 8;

      // Rodapé
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text(`Página ${i} de ${pageCount}`, rightMargin - 20, pageHeight - 10);
        doc.text('Gerado pelo Sistema LogiFlow', leftMargin, pageHeight - 10);
      }

      // Salvar PDF
      const nomeArquivo = `Dashboard_${format(new Date(), 'yyyy-MM-dd_HHmm')}.pdf`;
      doc.save(nomeArquivo);
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
      alert("Erro ao gerar o PDF. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={gerarPDF}
      disabled={loading}
      variant="outline"
      className="flex items-center gap-2"
    >
      {loading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          Gerando...
        </>
      ) : (
        <>
          <FileDown className="w-4 h-4" />
          Exportar PDF
        </>
      )}
    </Button>
  );
}