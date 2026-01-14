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
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text('Dashboard - Torre de Controle', leftMargin, yPos);
      yPos += 8;
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100);
      doc.text(`Gerado em: ${format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}`, leftMargin, yPos);
      yPos += 6;
      
      if (empresa?.razao_social) {
        doc.text(`Empresa: ${empresa.razao_social}`, leftMargin, yPos);
        yPos += 8;
      }

      // Período do filtro
      doc.setTextColor(0);
      doc.setFont('helvetica', 'bold');
      doc.text('Período:', leftMargin, yPos);
      doc.setFont('helvetica', 'normal');
      
      let periodTexto = '';
      if (periodoFiltro === 'mes_atual') {
        periodTexto = 'Mês Atual';
      } else if (periodoFiltro === 'ano_atual') {
        periodTexto = `Ano ${anoSelecionado}`;
      } else if (periodoFiltro === 'mes_especifico') {
        const meses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 
                       'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
        periodTexto = `${meses[mesSelecionado - 1]} ${anoSelecionado}`;
      } else if (periodoFiltro === 'personalizado' && dataInicioPersonalizada && dataFimPersonalizada) {
        periodTexto = `${format(new Date(dataInicioPersonalizada), 'dd/MM/yyyy')} até ${format(new Date(dataFimPersonalizada), 'dd/MM/yyyy')}`;
      }
      
      doc.text(periodTexto, leftMargin + 20, yPos);
      yPos += 10;

      // Filtros aplicados
      if (filters.tiposOrdemFiltro && filters.tiposOrdemFiltro.length > 0) {
        checkNewPage(10);
        doc.setFont('helvetica', 'bold');
        doc.text('Tipos de Ordem:', leftMargin, yPos);
        doc.setFont('helvetica', 'normal');
        doc.text(filters.tiposOrdemFiltro.join(', '), leftMargin + 35, yPos);
        yPos += 8;
      }

      // Linha separadora
      doc.setDrawColor(200);
      doc.line(leftMargin, yPos, rightMargin, yPos);
      yPos += 10;

      // Seção: Métricas Principais
      checkNewPage(40);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0);
      doc.text('Métricas Principais', leftMargin, yPos);
      yPos += 8;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      
      const metricas = [
        { label: 'Total de Ordens', valor: metrics.totalOrdens, percentual: '100%' },
        { label: 'Ofertas', valor: metrics.ofertas, percentual: `${metrics.totalOrdens > 0 ? ((metrics.ofertas / metrics.totalOrdens) * 100).toFixed(1) : 0}%` },
        { label: 'Negociando', valor: metrics.negociando, percentual: `${metrics.totalOrdens > 0 ? ((metrics.negociando / metrics.totalOrdens) * 100).toFixed(1) : 0}%` },
        { label: 'Alocadas', valor: metrics.ordensCompletas, percentual: `${metrics.totalOrdens > 0 ? ((metrics.ordensCompletas / metrics.totalOrdens) * 100).toFixed(1) : 0}%` },
        { label: 'Em Viagem', valor: metrics.emViagem, percentual: `${metrics.totalOrdens > 0 ? ((metrics.emViagem / metrics.totalOrdens) * 100).toFixed(1) : 0}%` },
        { label: 'Aguardando', valor: metrics.aguardando, percentual: `${metrics.totalOrdens > 0 ? ((metrics.aguardando / metrics.totalOrdens) * 100).toFixed(1) : 0}%` },
        { label: 'Atrasadas', valor: metrics.atrasadas, percentual: `${metrics.totalOrdens > 0 ? ((metrics.atrasadas / metrics.totalOrdens) * 100).toFixed(1) : 0}%` },
        { label: 'Atraso Carregamento', valor: metrics.atrasadasCarregamento, percentual: `${metrics.totalOrdens > 0 ? ((metrics.atrasadasCarregamento / metrics.totalOrdens) * 100).toFixed(1) : 0}%` },
        { label: 'Atraso Descarga', valor: metrics.atrasadasDescarga, percentual: `${metrics.totalOrdens > 0 ? ((metrics.atrasadasDescarga / metrics.totalOrdens) * 100).toFixed(1) : 0}%` },
      ];

      metricas.forEach((metrica, idx) => {
        if (idx > 0 && idx % 3 === 0) {
          yPos += 8;
          checkNewPage(15);
        }
        
        const colIndex = idx % 3;
        const xPos = leftMargin + (colIndex * 60);
        
        doc.setFont('helvetica', 'bold');
        doc.text(metrica.label, xPos, yPos);
        doc.setFont('helvetica', 'normal');
        doc.text(`${metrica.valor} (${metrica.percentual})`, xPos, yPos + 5);
      });
      
      yPos += 15;

      // Status por Operação
      if (ordensDetalhadas.porOperacao && Object.keys(ordensDetalhadas.porOperacao).length > 0) {
        checkNewPage(40);
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Status por Operação', leftMargin, yPos);
        yPos += 8;

        Object.entries(ordensDetalhadas.porOperacao).forEach(([operacao, stats]) => {
          checkNewPage(25);
          doc.setFontSize(11);
          doc.setFont('helvetica', 'bold');
          doc.text(operacao, leftMargin, yPos);
          yPos += 6;

          doc.setFontSize(9);
          doc.setFont('helvetica', 'normal');
          
          const statsTexto = [
            `Total: ${stats.total}`,
            `Ofertas: ${stats.ofertas}`,
            `Negociando: ${stats.negociando}`,
            `Alocadas: ${stats.alocadas}`,
            `Em Viagem: ${stats.emViagem}`,
            `Aguardando: ${stats.aguardando}`,
            `Finalizadas: ${stats.finalizadas}`,
            `Atrasadas: ${stats.atrasadas}`,
            `Taxa Finalização: ${stats.total > 0 ? Math.round((stats.finalizadas / stats.total) * 100) : 0}%`
          ];

          statsTexto.forEach((texto, idx) => {
            const colIdx = idx % 3;
            const xPos = leftMargin + 5 + (colIdx * 60);
            if (idx > 0 && idx % 3 === 0) yPos += 5;
            doc.text(texto, xPos, yPos);
          });
          
          yPos += 10;
        });
      }

      // Top Rotas
      if (ordensDetalhadas.topOrigens.length > 0 || ordensDetalhadas.topDestinos.length > 0) {
        checkNewPage(50);
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Top Rotas', leftMargin, yPos);
        yPos += 8;

        if (ordensDetalhadas.topOrigens.length > 0) {
          doc.setFontSize(11);
          doc.setFont('helvetica', 'bold');
          doc.text('Top 5 Origens', leftMargin, yPos);
          yPos += 6;

          doc.setFontSize(9);
          doc.setFont('helvetica', 'normal');
          ordensDetalhadas.topOrigens.forEach(([origem, count], idx) => {
            checkNewPage(8);
            doc.text(`${idx + 1}. ${origem}: ${count} ordens`, leftMargin + 5, yPos);
            yPos += 5;
          });
          yPos += 5;
        }

        if (ordensDetalhadas.topDestinos.length > 0) {
          checkNewPage(30);
          doc.setFontSize(11);
          doc.setFont('helvetica', 'bold');
          doc.text('Top 5 Destinos', leftMargin, yPos);
          yPos += 6;

          doc.setFontSize(9);
          doc.setFont('helvetica', 'normal');
          ordensDetalhadas.topDestinos.forEach(([destino, count], idx) => {
            checkNewPage(8);
            doc.text(`${idx + 1}. ${destino}: ${count} ordens`, leftMargin + 5, yPos);
            yPos += 5;
          });
          yPos += 5;
        }
      }

      // Distribuição por Frota e Modalidade
      checkNewPage(40);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Distribuição de Ordens', leftMargin, yPos);
      yPos += 8;

      doc.setFontSize(11);
      doc.text('Por Tipo de Frota', leftMargin, yPos);
      yPos += 6;

      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      Object.entries(ordensDetalhadas.porFrota).forEach(([frota, count]) => {
        checkNewPage(8);
        doc.text(`${frota.charAt(0).toUpperCase() + frota.slice(1)}: ${count}`, leftMargin + 5, yPos);
        yPos += 5;
      });
      yPos += 5;

      checkNewPage(25);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text('Por Modalidade', leftMargin, yPos);
      yPos += 6;

      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      Object.entries(ordensDetalhadas.porModalidade).forEach(([modalidade, count]) => {
        checkNewPage(8);
        const modalidadeNome = modalidade === 'normal' ? 'Normal' : 
                               modalidade === 'prioridade' ? 'Prioridade' : 'Expressa';
        doc.text(`${modalidadeNome}: ${count}`, leftMargin + 5, yPos);
        yPos += 5;
      });
      yPos += 5;

      // Status de Tracking
      if (insights.statusTracking && Object.keys(insights.statusTracking).length > 0) {
        checkNewPage(40);
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Status de Tracking', leftMargin, yPos);
        yPos += 8;

        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        Object.entries(insights.statusTracking).forEach(([status, count]) => {
          checkNewPage(8);
          const statusFormatado = status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
          doc.text(`${statusFormatado}: ${count}`, leftMargin + 5, yPos);
          yPos += 5;
        });
        yPos += 5;
      }

      // Fluxo de Processos
      checkNewPage(30);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Fluxo de Processos', leftMargin, yPos);
      yPos += 8;

      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text(`Em Andamento: ${metrics.etapasEmAndamento}`, leftMargin + 5, yPos);
      yPos += 5;
      doc.text(`Concluídas: ${metrics.etapasConcluidas}`, leftMargin + 5, yPos);
      yPos += 5;
      doc.text(`Bloqueadas: ${metrics.etapasBloqueadas}`, leftMargin + 5, yPos);
      yPos += 10;

      // Ocorrências
      checkNewPage(25);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Ocorrências', leftMargin, yPos);
      yPos += 8;

      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text(`Total Abertas: ${metrics.ocorrenciasAbertas}`, leftMargin + 5, yPos);
      yPos += 5;
      doc.text(`Críticas: ${metrics.ocorrenciasCriticas}`, leftMargin + 5, yPos);
      yPos += 10;

      // Volume Mensal
      if (volumeMensal && volumeMensal.length > 0) {
        checkNewPage(40);
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Volume Mensal - Últimos 6 Meses', leftMargin, yPos);
        yPos += 8;

        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        volumeMensal.forEach((item) => {
          checkNewPage(8);
          doc.text(`${item.mes}: ${item.ordens} ordens, ${item.processos} processos, ${item.ocorrencias} ocorrências`, 
                   leftMargin + 5, yPos);
          yPos += 5;
        });
      }

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