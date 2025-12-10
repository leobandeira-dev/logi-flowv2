import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';
import { jsPDF } from 'npm:jspdf@2.5.1';
import 'npm:jspdf-autotable@3.5.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Buscar dados da empresa
    let empresaNome = "";
    try {
      if (user.empresa_id) {
        const empresa = await base44.entities.Empresa.get(user.empresa_id);
        empresaNome = empresa?.nome_fantasia || empresa?.razao_social || "";
      }
    } catch (error) {
      console.log("Erro ao buscar empresa:", error);
    }

    const { ordens, tipoVisao, colunasConfig } = await req.json();

    if (!ordens || !Array.isArray(ordens)) {
      return Response.json({ error: 'Dados invalidos' }, { status: 400 });
    }

    const tipo = tipoVisao || 'table';
    
    // Função auxiliar para obter cores da modalidade
    const getModalidadeColor = (modalidade) => {
      const cores = {
        normal: [59, 130, 246],      // Azul
        prioridade: [245, 158, 11],  // Laranja/Amarelo
        expressa: [239, 68, 68]      // Vermelho
      };
      return cores[modalidade] || [107, 114, 128]; // Cinza padrão
    };

    // Criar documento PDF em paisagem
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });

    // Normalizar texto
    const normalizeText = (text) => {
      if (!text) return "";
      const str = String(text);
      const accentMap = {
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
      
      let result = '';
      for (let i = 0; i < str.length; i++) {
        const char = str[i];
        result += accentMap[char] || char;
      }
      
      return result;
    };

    const formatarDataHora = (data) => {
      if (!data) return "";
      try {
        const d = new Date(data);
        return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')} ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
      } catch {
        return "";
      }
    };

    const getDataAtualSP = () => {
      return new Date(new Date().toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' }));
    };

    const formatarData = (data) => {
      if (!data) return "";
      try {
        const d = new Date(data);
        return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}`;
      } catch {
        return "";
      }
    };

    const now = new Date();
    const dia = now.getDate().toString().padStart(2, '0');
    const mes = (now.getMonth() + 1).toString().padStart(2, '0');
    const ano = now.getFullYear();
    const hora = now.getHours().toString().padStart(2, '0');
    const min = now.getMinutes().toString().padStart(2, '0');
    const dataHora = `${dia}/${mes}/${ano} ${hora}:${min}`;

    // Função para abreviar endereços
    const abreviarEndereco = (texto, maxLength = 25) => {
      if (!texto) return "";
      const textoNorm = normalizeText(texto);
      
      // Abreviações comuns
      const abrev = textoNorm
        .replace(/Rodovia/gi, 'Rod.')
        .replace(/Avenida/gi, 'Av.')
        .replace(/Rua/gi, 'R.')
        .replace(/Estrada/gi, 'Estr.')
        .replace(/Numero/gi, 'N.')
        .replace(/Quilometro/gi, 'KM')
        .replace(/kilometro/gi, 'KM')
        .replace(/Travessa/gi, 'Tv.')
        .replace(/Alameda/gi, 'Al.');
      
      // Se ainda estiver muito grande, truncar
      if (abrev.length > maxLength) {
        return abrev.substring(0, maxLength - 3) + '...';
      }
      
      return abrev;
    };

    // Função para abreviar remetente/destinatário
    const abreviarNome = (texto, maxLength = 25) => {
      if (!texto) return "";
      const textoNorm = normalizeText(texto);
      
      // Remover sufixos comuns de empresa
      const semSufixo = textoNorm
        .replace(/\s+S\/A$/i, '')
        .replace(/\s+LTDA\.?$/i, '')
        .replace(/\s+LTDA\.?\s+-\s+EPP$/i, '')
        .replace(/\s+EIRELI$/i, '')
        .replace(/\s+ME$/i, '');
      
      // Se ainda estiver muito grande, pegar apenas primeiras palavras importantes
      if (semSufixo.length > maxLength) {
        const palavras = semSufixo.split(' ');
        let resultado = '';
        for (const palavra of palavras) {
          if (resultado.length + palavra.length + 1 <= maxLength) {
            resultado += (resultado ? ' ' : '') + palavra;
          } else {
            break;
          }
        }
        return resultado || semSufixo.substring(0, maxLength);
      }
      
      return semSufixo;
    };

    // Função para extrair valor da coluna
    const getValorColuna = (ordem, colunaId) => {
      if (colunaId === "numero_carga") {
        return normalizeText(ordem.numero_carga || `#${ordem.id?.slice(-6) || ''}`);
      } else if (colunaId === "viagem_pedido") {
        return normalizeText(ordem.viagem_pedido) || "";
      } else if (colunaId === "cliente") {
        return abreviarNome(ordem.cliente, 30);
      } else if (colunaId === "origem_destino") {
        const origem = normalizeText(ordem.origem_cidade || ordem.origem).substring(0, 18);
        const destino = normalizeText(ordem.destino_cidade || ordem.destino).substring(0, 18);
        return `${origem} -> ${destino}`;
      } else if (colunaId === "destinatario") {
        return abreviarNome(ordem.destinatario || ordem.destino, 25);
      } else if (colunaId === "motorista") {
        return normalizeText(ordem.motorista_nome) || "";
      } else if (colunaId === "cavalo") {
        return normalizeText(ordem.cavalo_placa) || "";
      } else if (colunaId === "carreta") {
        return normalizeText(ordem.implemento1_placa) || "";
      } else if (colunaId === "carreta2") {
        return normalizeText(ordem.implemento2_placa) || "";
      } else if (colunaId === "tipo_veiculo") {
        return normalizeText(ordem.tipo_veiculo) || "";
      } else if (colunaId === "tipo_carroceria") {
        return normalizeText(ordem.tipo_carroceria) || "";
      } else if (colunaId === "produto") {
        return normalizeText(ordem.produto) || "";
      } else if (colunaId === "carregamento_agendamento_data") {
        return formatarDataHora(ordem.carregamento_agendamento_data);
      } else if (colunaId === "entrada_galpao") {
        return formatarDataHora(ordem.entrada_galpao);
      } else if (colunaId === "inicio_carregamento") {
        // Se vazio e tem agendamento, usar data atual em roxo
        if (!ordem.inicio_carregamento && ordem.carregamento_agendamento_data) {
          const dataAtualFormatada = formatarDataHora(getDataAtualSP());
          return { content: dataAtualFormatada, styles: { textColor: [147, 51, 234], fontStyle: 'bold' } }; // Roxo
        }
        return formatarDataHora(ordem.inicio_carregamento);
      } else if (colunaId === "fim_carregamento") {
        // Se vazio e tem agendamento, usar data atual em roxo
        if (!ordem.fim_carregamento && ordem.carregamento_agendamento_data) {
          const dataAtualFormatada = formatarDataHora(getDataAtualSP());
          return { content: dataAtualFormatada, styles: { textColor: [147, 51, 234], fontStyle: 'bold' } }; // Roxo
        }
        return formatarDataHora(ordem.fim_carregamento);
      } else if (colunaId === "saida_unidade") {
        return formatarDataHora(ordem.saida_unidade);
      } else if (colunaId === "chegada_destino") {
        // Se vazio e tem prazo de entrega, usar data atual em roxo
        if (!ordem.chegada_destino && ordem.prazo_entrega) {
          const dataAtualFormatada = formatarDataHora(getDataAtualSP());
          return { content: dataAtualFormatada, styles: { textColor: [147, 51, 234], fontStyle: 'bold' } }; // Roxo
        }
        return formatarDataHora(ordem.chegada_destino);
      } else if (colunaId === "descarga_agendamento_data") {
        return formatarDataHora(ordem.descarga_agendamento_data);
      } else if (colunaId === "agendamento_checklist_data") {
        return formatarDataHora(ordem.agendamento_checklist_data);
      } else if (colunaId === "descarga_realizada_data") {
        // Se vazio e tem prazo de entrega, usar data atual em roxo
        if (!ordem.descarga_realizada_data && ordem.prazo_entrega) {
          const dataAtualFormatada = formatarDataHora(getDataAtualSP());
          return { content: dataAtualFormatada, styles: { textColor: [147, 51, 234], fontStyle: 'bold' } }; // Roxo
        }
        return formatarDataHora(ordem.descarga_realizada_data);
      } else if (colunaId === "prazo_entrega") {
        return formatarDataHora(ordem.prazo_entrega);
      } else if (colunaId === "data_programacao_descarga") {
        return formatarData(ordem.data_programacao_descarga);
      } else if (colunaId === "localizacao_atual") {
        return abreviarEndereco(ordem.localizacao_atual, 30);
      } else if (colunaId === "km_faltam") {
        return ordem.km_faltam || "";
      } else if (colunaId === "senha_agendamento") {
        return normalizeText(ordem.senha_agendamento) || "";
      } else if (colunaId === "notas_fiscais") {
        return normalizeText(ordem.notas_fiscais) || "";
      } else if (colunaId === "peso") {
        return ordem.peso ? `${(ordem.peso / 1000).toFixed(2)}t` : "";
      } else if (colunaId === "numero_cte") {
        return normalizeText(ordem.numero_cte) || "";
      } else if (colunaId === "mdfe_url") {
        return ordem.mdfe_url ? "Sim" : "";
      } else if (colunaId === "mdfe_baixado") {
        return ordem.mdfe_baixado ? "X" : "";
      } else if (colunaId === "saldo_pago") {
        return ordem.saldo_pago ? "X" : "";
      } else if (colunaId === "comprovante_entrega_recebido") {
        return ordem.comprovante_entrega_recebido ? "X" : "";
      } else if (colunaId === "observacao_carga") {
        return abreviarEndereco(ordem.observacao_carga, 40);
      } else if (colunaId === "observacoes_internas") {
        return abreviarEndereco(ordem.observacoes_internas, 40);
      } else if (colunaId === "status_tracking") {
        const statusMap = {
          "finalizado": "FINALIZADO",
          "em_viagem": "EM VIAGEM",
          "carregado": "CARREGADO",
          "em_carregamento": "CARREGANDO",
          "descarga_realizada": "DESCARREGADO",
          "em_descarga": "DESCARREGANDO",
          "chegada_destino": "NO DESTINO",
          "aguardando_agendamento": "AGUARDANDO",
          "carregamento_agendado": "AGENDADO"
        };
        return statusMap[ordem.status_tracking] || "PENDENTE";
      }
      return "";
    };

    if (tipo === 'planilha') {
      // ============ LAYOUT PLANILHA - ULTRA COMPACTADO ============
      
      const colunasParaPdf = colunasConfig && colunasConfig.length > 0 
        ? colunasConfig 
        : [
            { id: "numero_carga", label: "Ordem" },
            { id: "viagem_pedido", label: "Pedido" },
            { id: "cliente", label: "Remetente" },
            { id: "origem_destino", label: "Origem - Destino" },
            { id: "destinatario", label: "Destinatario" },
            { id: "motorista", label: "Motorista" },
            { id: "cavalo", label: "Cavalo" },
            { id: "carreta", label: "Carreta" },
            { id: "carreta2", label: "Carr.2" },
            { id: "tipo_veiculo", label: "Tipo Veic." },
            { id: "tipo_carroceria", label: "Tipo Carr." },
            { id: "produto", label: "Produto" },
            { id: "carregamento_agendamento_data", label: "Ag.Carga" },
            { id: "inicio_carregamento", label: "In.Carga" },
            { id: "fim_carregamento", label: "Fim Carga" },
            { id: "saida_unidade", label: "Saida" },
            { id: "chegada_destino", label: "Chegada" },
            { id: "descarga_agendamento_data", label: "Ag.Desc" },
            { id: "descarga_realizada_data", label: "Real.Desc" },
            { id: "data_programacao_descarga", label: "Prev.Desc" },
            { id: "localizacao_atual", label: "Localizacao" },
            { id: "km_faltam", label: "KM" },
            { id: "senha_agendamento", label: "Senha" },
            { id: "notas_fiscais", label: "NF" },
            { id: "peso", label: "Peso" },
            { id: "numero_cte", label: "CT-e" },
            { id: "mdfe_url", label: "MDF-e" },
            { id: "mdfe_baixado", label: "MDF-Bx" },
            { id: "saldo_pago", label: "Saldo" },
            { id: "comprovante_entrega_recebido", label: "Comprv" },
            { id: "observacao_carga", label: "Observacoes" },
            { id: "observacoes_internas", label: "OBS Int." },
            { id: "status_tracking", label: "Status" }
          ];

      // Normalizar títulos das colunas
      const columnsNormalizadas = colunasParaPdf.map(col => normalizeText(col.label));

      // Cabeçalho compacto
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('PLANILHA DE TRACKING COMPLETA', 148, 7, { align: 'center' });
      
      doc.setFontSize(6);
      doc.setFont('helvetica', 'normal');
      doc.text(`Gerado: ${dataHora} | ${ordens.length} ordens | ${colunasParaPdf.length} colunas`, 148, 10, { align: 'center' });

      // Preparar dados
      const tableData = ordens.map(ordem => 
        colunasParaPdf.map(col => getValorColuna(ordem, col.id))
      );

      // Calcular larguras ultra otimizadas
      const totalWidth = 291;
      const numColunas = colunasParaPdf.length;
      const larguraBase = totalWidth / numColunas;

      const columnStyles = {};
      colunasParaPdf.forEach((col, idx) => {
        const style = {
          cellWidth: larguraBase,
          fontSize: numColunas > 25 ? 4 : numColunas > 20 ? 4.5 : numColunas > 15 ? 5 : 5.5,
          overflow: 'linebreak',
          cellPadding: 0.4
        };

        // Otimizações específicas
        if (col.id === "numero_carga") {
          style.fontStyle = 'bold';
          style.cellWidth = Math.max(8, larguraBase * 0.7);
        } else if (col.id === "cavalo" || col.id === "carreta") {
          style.fontStyle = 'bold';
          style.cellWidth = Math.max(8, larguraBase * 0.6);
          style.fontSize = numColunas > 25 ? 4.5 : 5;
        } else if (col.id === "mdfe_baixado" || col.id === "saldo_pago" || col.id === "comprovante_entrega_recebido") {
          style.halign = 'center';
          style.cellWidth = Math.max(5, larguraBase * 0.4);
          style.fontStyle = 'bold';
          style.fontSize = 5;
        } else if (col.id === "km_faltam") {
          style.halign = 'center';
          style.cellWidth = Math.max(6, larguraBase * 0.5);
          style.fontSize = 5;
        } else if (col.id === "viagem_pedido" || col.id === "senha_agendamento") {
          style.cellWidth = Math.max(7, larguraBase * 0.6);
          style.fontSize = numColunas > 25 ? 4 : 4.5;
        } else if (col.id.includes("data") || col.id.includes("carregamento") || col.id.includes("descarga") || col.id.includes("saida") || col.id.includes("chegada")) {
          style.fontSize = numColunas > 25 ? 4 : numColunas > 20 ? 4.5 : 5;
          style.cellWidth = Math.max(10, larguraBase * 0.8);
        } else if (col.id === "observacao_carga" || col.id === "observacoes_internas") {
          style.cellWidth = Math.min(30, larguraBase * 1.3);
          style.fontSize = numColunas > 25 ? 4 : 4.5;
        } else if (col.id === "localizacao_atual") {
          style.cellWidth = Math.min(25, larguraBase * 1.2);
          style.fontSize = numColunas > 25 ? 4 : 4.5;
        } else if (col.id === "status_tracking") {
          style.cellWidth = Math.max(9, larguraBase * 0.7);
          style.fontSize = numColunas > 25 ? 4.5 : 5;
          style.fontStyle = 'bold';
        } else if (col.id === "cliente" || col.id === "destinatario" || col.id === "motorista") {
          style.cellWidth = Math.max(10, larguraBase * 0.8);
        } else if (col.id === "origem_destino") {
          style.cellWidth = Math.min(28, larguraBase * 1.2);
        } else if (col.id === "produto" || col.id === "tipo_veiculo" || col.id === "tipo_carroceria") {
          style.cellWidth = Math.max(9, larguraBase * 0.7);
          style.fontSize = numColunas > 25 ? 4 : 4.5;
        } else if (col.id === "notas_fiscais" || col.id === "numero_cte" || col.id === "mdfe_url" || col.id === "peso") {
          style.cellWidth = Math.max(7, larguraBase * 0.6);
          style.fontSize = numColunas > 25 ? 4 : 4.5;
        }

        columnStyles[idx] = style;
      });

      // Fonte ultra compactada
      const baseFontSize = numColunas > 25 ? 4 : numColunas > 20 ? 4.5 : numColunas > 15 ? 5 : 5.5;
      const headerFontSize = numColunas > 25 ? 4.5 : numColunas > 20 ? 5 : numColunas > 15 ? 5.5 : 6;

      doc.autoTable({
        startY: 12,
        head: [columnsNormalizadas],
        body: tableData,
        styles: {
          fontSize: baseFontSize,
          cellPadding: 0.4,
          overflow: 'linebreak',
          halign: 'left',
          valign: 'middle',
          font: 'helvetica',
          textColor: [0, 0, 0],
          lineColor: [180, 180, 180],
          lineWidth: 0.03,
          minCellHeight: 3.5
        },
        headStyles: {
          fillColor: [0, 0, 0],
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          halign: 'center',
          fontSize: headerFontSize,
          cellPadding: 0.5,
          minCellHeight: 4
        },
        alternateRowStyles: {
          fillColor: [248, 248, 248]
        },
        rowStyles: {
          fillColor: [255, 255, 255],
          minCellHeight: 3.5
        },
        columnStyles: columnStyles,
        margin: { top: 12, left: 2, right: 2, bottom: 8 },
        didDrawPage: (data) => {
          const pageCount = doc.internal.getNumberOfPages();
          const pageSize = doc.internal.pageSize;
          const pageHeight = pageSize.height ? pageSize.height : pageSize.getHeight();
          const pageWidth = pageSize.width ? pageSize.width : pageSize.getWidth();
          
          // Linha separadora ultra fina
          doc.setDrawColor(0, 0, 0);
          doc.setLineWidth(0.15);
          doc.line(2, pageHeight - 7, pageWidth - 2, pageHeight - 7);
          
          // Rodapé compacto
          doc.setFontSize(5);
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(0, 0, 0);
          
          doc.text(`Pg.${data.pageNumber}/${pageCount}`, 4, pageHeight - 4);
          doc.text(`Planilha Tracking Completa - ${ordens.length} ordens - ${colunasParaPdf.length} colunas`, pageWidth / 2, pageHeight - 4, { align: 'center' });
          doc.text(dataHora, pageWidth - 4, pageHeight - 4, { align: 'right' });
        }
      });

    } else if (tipo === 'agrupado_carregamento') {
      // ============ LAYOUT AGRUPADO POR DATA DE CARREGAMENTO ============

      // Título
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('TRACKING - AGRUPADO POR DATA DE CARREGAMENTO', 148, 10, { align: 'center' });

      doc.setFontSize(7);
      doc.setFont('helvetica', 'normal');
      doc.text(`Gerado em: ${dataHora} | Total: ${ordens.length} ordens`, 148, 14, { align: 'center' });

      // Dados da empresa e usuário
      const usuarioNome = user?.full_name || "";
      if (empresaNome || usuarioNome) {
        doc.setFontSize(6);
        doc.setTextColor(100, 100, 100);
        const infoText = empresaNome && usuarioNome 
          ? `${normalizeText(empresaNome)} | Usuario: ${normalizeText(usuarioNome)}`
          : normalizeText(empresaNome) || `Usuario: ${normalizeText(usuarioNome)}`;
        doc.text(infoText, 148, 17.5, { align: 'center' });
        doc.setTextColor(0, 0, 0);
      }

      // Usar colunas configuradas (filtrar apenas as habilitadas)
      let colunasParaPdf = colunasConfig && colunasConfig.length > 0 
        ? colunasConfig.filter(col => col.enabled !== false)
        : [
            { id: "numero_carga", label: "Ordem" },
            { id: "viagem_pedido", label: "Pedido" },
            { id: "cliente", label: "Remetente" },
            { id: "origem_destino", label: "Origem -> Destino" },
            { id: "destinatario", label: "Destinatario" },
            { id: "motorista", label: "Motorista" },
            { id: "cavalo", label: "Cavalo" },
            { id: "carreta", label: "Carreta" },
            { id: "tipo_veiculo", label: "Tipo Veic." },
            { id: "tipo_carroceria", label: "Tipo Carr." },
            { id: "produto", label: "Produto" },
            { id: "modalidade_carga", label: "Mod." },
            { id: "saida_unidade", label: "Saida Viagem" },
            { id: "chegada_destino", label: "Chegada Viagem" },
            { id: "descarga_agendamento_data", label: "Agend. Desc." },
            { id: "descarga_realizada_data", label: "Real. Descarga" },
            { id: "localizacao_atual", label: "Localizacao" },
            { id: "km_faltam", label: "KM" },
            { id: "observacao_carga", label: "Observacoes" }
          ];

      // OTIMIZAÇÃO: Mesclar colunas relacionadas para economizar espaço
      const colunasMescladas = [];
      let i = 0;
      while (i < colunasParaPdf.length) {
        const col = colunasParaPdf[i];

        // Mesclar Cavalo + Carreta + Carreta2
        if (col.id === "cavalo") {
          const temCarreta = colunasParaPdf.some(c => c.id === "carreta");
          const temCarreta2 = colunasParaPdf.some(c => c.id === "carreta2");

          if (temCarreta || temCarreta2) {
            colunasMescladas.push({ id: "placas_mescladas", label: "Placas", mesclada: true });
            // Pular carreta e carreta2 se existirem
            i++;
            while (i < colunasParaPdf.length && (colunasParaPdf[i].id === "carreta" || colunasParaPdf[i].id === "carreta2")) {
              i++;
            }
            continue;
          }
        }

        // Mesclar Tipo de Veículo + Tipo de Carroceria
        if (col.id === "tipo_veiculo") {
          const temCarroceria = colunasParaPdf.some(c => c.id === "tipo_carroceria");

          if (temCarroceria) {
            colunasMescladas.push({ id: "tipo_veiculo_carroceria_mesclado", label: "Veic./Carr.", mesclada: true });
            // Pular tipo_carroceria se existir
            i++;
            while (i < colunasParaPdf.length && colunasParaPdf[i].id === "tipo_carroceria") {
              i++;
            }
            continue;
          }
        }

        // Não adicionar carreta ou carreta2 ou tipo_carroceria se já foram processadas
        if (col.id === "carreta" || col.id === "carreta2" || col.id === "tipo_carroceria") {
          // Verificar se já mesclamos anteriormente
          const jaMesclado = col.id === "carreta" || col.id === "carreta2" 
            ? colunasMescladas.some(c => c.id === "placas_mescladas")
            : colunasMescladas.some(c => c.id === "tipo_veiculo_carroceria_mesclado");

          if (!jaMesclado) {
            colunasMescladas.push(col);
          }
          i++;
          continue;
        }

        colunasMescladas.push(col);
        i++;
      }

      colunasParaPdf = colunasMescladas;

      // Agrupar por data de carregamento (usar data_carregamento como referência principal)
      const ordemsPorData = {};
      ordens.forEach(ordem => {
        const dataCarg = ordem.data_carregamento || ordem.carregamento_agendamento_data
          ? formatarData(ordem.data_carregamento || ordem.carregamento_agendamento_data)
          : "Sem agendamento";

        if (!ordemsPorData[dataCarg]) {
          ordemsPorData[dataCarg] = [];
        }
        ordemsPorData[dataCarg].push(ordem);
      });

      // Ordenar datas
      const datasOrdenadas = Object.keys(ordemsPorData).sort((a, b) => {
        if (a === "Sem agendamento") return 1;
        if (b === "Sem agendamento") return -1;
        return a.localeCompare(b);
      });

      let currentY = 22;

      // Para cada data
      datasOrdenadas.forEach(dataCarg => {
        const ordensData = ordemsPorData[dataCarg];

        // Agrupar por remetente dentro da data
        const porRemetente = {};
        ordensData.forEach(ordem => {
          const remetente = normalizeText(ordem.cliente) || "Sem remetente";
          if (!porRemetente[remetente]) {
            porRemetente[remetente] = [];
          }
          porRemetente[remetente].push(ordem);
        });

        // Ordenar remetentes alfabeticamente
        const remetentesOrdenados = Object.keys(porRemetente).sort();

        // Calcular quantitativo por remetente para o cabeçalho
        const quantitativosRemetente = remetentesOrdenados.map(rem => 
          `${rem}: ${porRemetente[rem].length}`
        ).join(' | ');

        // Nova página se necessário
        if (currentY > 175) {
          doc.addPage();
          currentY = 15;
        }

        // Cabeçalho da data com quantitativos (largura igual à tabela)
        const pageWidth = doc.internal.pageSize.getWidth();
        const margemLateral = 5;
        const tableWidth = pageWidth - (margemLateral * 2);

        doc.setFontSize(7.5);
        doc.setFont('helvetica', 'bold');
        doc.setFillColor(37, 99, 235);
        doc.rect(margemLateral, currentY - 2, tableWidth, 5.5, 'F');
        doc.setTextColor(255, 255, 255);
        doc.text(`DATA: ${dataCarg} | Total: ${ordensData.length} ordens`, margemLateral + 2, currentY + 1.8);
        currentY += 7;

        // Linha com quantitativos por remetente (mesma largura)
        doc.setFontSize(6.5);
        doc.setFont('helvetica', 'normal');
        doc.setFillColor(209, 213, 219);
        doc.rect(margemLateral, currentY - 2, tableWidth, 4.5, 'F');
        doc.setTextColor(55, 65, 81);
        doc.text(quantitativosRemetente, margemLateral + 2, currentY + 1);
        currentY += 6;
        doc.setTextColor(0, 0, 0);

        // Tabela de ordens (todas juntas, ordenadas por remetente)
        const tableData = [];
        remetentesOrdenados.forEach(remetente => {
          porRemetente[remetente].forEach(ordem => {
            const row = colunasParaPdf.map(col => {
              // Tratamento especial para colunas mescladas
              if (col.id === 'placas_mescladas') {
                const cavalo = normalizeText(ordem.cavalo_placa) || "";
                const carr1 = normalizeText(ordem.implemento1_placa) || "";
                const carr2 = normalizeText(ordem.implemento2_placa) || "";
                const placas = [cavalo, carr1, carr2].filter(p => p && p !== "-").join("/");
                return placas || "-";
              }

              if (col.id === 'tipo_veiculo_carroceria_mesclado') {
                const veiculo = normalizeText(ordem.tipo_veiculo)?.substring(0, 8) || "";
                const carroceria = normalizeText(ordem.tipo_carroceria)?.substring(0, 8) || "";
                if (!veiculo && !carroceria) return "-";
                if (!veiculo) return carroceria;
                if (!carroceria) return veiculo;
                return `${veiculo}/${carroceria}`;
              }

              const valor = getValorColuna(ordem, col.id);

              // Tratamento especial para modalidade
              if (col.id === 'modalidade_carga') {
                const modalidadeColor = getModalidadeColor(ordem.modalidade_carga);
                const modalidadeLabel = ordem.modalidade_carga === 'expressa' ? 'EXPRESS' 
                  : ordem.modalidade_carga === 'prioridade' ? 'PRIOR.' 
                  : 'NORMAL';
                return { content: modalidadeLabel, styles: { fillColor: modalidadeColor, textColor: [255, 255, 255], fontStyle: 'bold', halign: 'center' } };
              }

              // Tratamento especial para observações (vermelho se preenchido)
              if ((col.id === 'observacao_carga' || col.id === 'observacoes_internas') && ordem[col.id]) {
                return { content: valor, styles: { textColor: [220, 38, 38], fontStyle: 'bold' } };
              }

              return valor;
            });
            tableData.push(row);
          });
        });

        // Cabeçalhos normalizados
        const headers = colunasParaPdf.map(col => normalizeText(col.label));

        const columnStyles = {};
        const baseFontSize = 4.2;
        const basePadding = 0.25;
        const larguraUtilTabela = tableWidth;

        colunasParaPdf.forEach((col, idx) => {
          const style = {
            fontSize: baseFontSize,
            overflow: 'linebreak',
            cellPadding: basePadding,
            halign: 'left',
            valign: 'middle'
          };

          // Larguras otimizadas para caber na área de impressão
          if (col.id === "placas_mescladas") {
            style.fontStyle = 'bold';
            style.cellWidth = 14;
          } else if (col.id === "tipo_veiculo_carroceria_mesclado") {
            style.cellWidth = 10;
          } else if (col.id === "cliente" || col.id === "remetente") {
            style.cellWidth = 20;
          } else if (col.id === "numero_carga") {
            style.fontStyle = 'bold';
            style.cellWidth = 9;
          } else if (col.id === "viagem_pedido") {
            style.cellWidth = 8;
          } else if (col.id === "modalidade_carga") {
            style.halign = 'center';
            style.cellWidth = 8;
          } else if (col.id === "observacao_carga" || col.id === "observacoes_internas") {
            style.cellWidth = 24;
          } else if (col.id === "origem_destino") {
            style.cellWidth = 24;
          } else if (col.id === "destinatario") {
            style.cellWidth = 18;
          } else if (col.id.includes("agendamento") || col.id.includes("carregamento") || col.id.includes("descarga") || col.id.includes("saida") || col.id.includes("chegada")) {
            style.cellWidth = 11;
            style.halign = 'center';
          } else if (col.id === "motorista") {
            style.cellWidth = 14;
          } else if (col.id === "produto") {
            style.cellWidth = 12;
          } else if (col.id === "localizacao_atual") {
            style.cellWidth = 18;
          } else if (col.id === "km_faltam" || col.id === "senha_agendamento") {
            style.halign = 'center';
            style.cellWidth = 5;
          } else if (col.id === "peso") {
            style.halign = 'center';
            style.cellWidth = 7;
          } else if (col.id === "mdfe_baixado" || col.id === "saldo_pago" || col.id === "comprovante_entrega_recebido") {
            style.halign = 'center';
            style.cellWidth = 5;
            style.fontStyle = 'bold';
          } else if (col.id === "tolerancia" || col.id === "diaria_carregamento" || col.id === "diaria_descarga") {
            style.halign = 'center';
            style.cellWidth = 7;
          } else if (col.id === "notas_fiscais" || col.id === "numero_cte" || col.id === "mdfe_url") {
            style.cellWidth = 10;
          } else if (col.id === "status_tracking") {
            style.halign = 'center';
            style.cellWidth = 8;
          }

          columnStyles[idx] = style;
        });

        doc.autoTable({
          startY: currentY,
          head: [headers],
          body: tableData,
          styles: {
            fontSize: 4.2,
            cellPadding: 0.25,
            overflow: 'linebreak',
            halign: 'left',
            valign: 'middle',
            lineWidth: 0.08,
            lineColor: [200, 200, 200]
          },
          headStyles: {
            fillColor: [100, 116, 139],
            textColor: [255, 255, 255],
            fontStyle: 'bold',
            fontSize: 4.2,
            halign: 'center',
            valign: 'middle',
            cellPadding: 0.3,
            minCellHeight: 3.5
          },
          columnStyles: columnStyles,
          margin: { left: margemLateral, right: margemLateral },
          tableWidth: tableWidth,
          theme: 'grid',
          didDrawPage: (data) => {
            const pageSize = doc.internal.pageSize;
            const pageHeight = pageSize.height ? pageSize.height : pageSize.getHeight();
            const pageWidth = pageSize.width ? pageSize.width : pageSize.getWidth();

            doc.setFontSize(5.5);
            doc.setFont('helvetica', 'italic');
            doc.setTextColor(150, 150, 150);
            doc.text('Powered by LogiFlow - logiflow.com.br', pageWidth / 2, pageHeight - 3, { align: 'center' });
            doc.setTextColor(0, 0, 0);
          }
        });

        currentY = doc.lastAutoTable.finalY + 8;
      });

      // GRÁFICO DE BARRAS
      if (currentY > 130) {
        doc.addPage();
        currentY = 15;
      }

      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('GRAFICO: CARGAS POR DATA DE CARREGAMENTO', 10, currentY);
      currentY += 8;

      // Calcular totais por data
      const totalPorData = {};
      datasOrdenadas.forEach(data => {
        totalPorData[data] = ordemsPorData[data].length;
      });

      const maxOrdens = Math.max(...Object.values(totalPorData));
      const barWidth = 15;
      const barSpacing = 3;
      const chartHeight = 60;
      const chartY = currentY;
      let chartX = 15;

      const datasParaGrafico = datasOrdenadas.slice(0, 15);

      datasParaGrafico.forEach(data => {
        const total = totalPorData[data];
        const barHeight = (total / maxOrdens) * chartHeight;

        doc.setFillColor(59, 130, 246);
        doc.rect(chartX, chartY + chartHeight - barHeight, barWidth, barHeight, 'F');

        doc.setFontSize(6);
        doc.setFont('helvetica', 'bold');
        doc.text(total.toString(), chartX + barWidth / 2, chartY + chartHeight - barHeight - 2, { align: 'center' });

        doc.setFontSize(5);
        doc.setFont('helvetica', 'normal');
        const dataAbrev = data.replace('Sem agendamento', 'S/Agend');
        doc.text(dataAbrev, chartX + barWidth / 2, chartY + chartHeight + 2, { align: 'center' });

        chartX += barWidth + barSpacing;
      });

      doc.setDrawColor(0, 0, 0);
      doc.setLineWidth(0.3);
      doc.line(12, chartY + chartHeight, chartX - barSpacing + 2, chartY + chartHeight);

    } else if (tipo === 'agrupado_descarga') {
      // ============ LAYOUT AGRUPADO POR DATA DE DESCARGA ============
      
      // Título
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('TRACKING - AGRUPADO POR DATA DE DESCARGA', 148, 10, { align: 'center' });
      
      doc.setFontSize(7);
      doc.setFont('helvetica', 'normal');
      doc.text(`Gerado em: ${dataHora} | Total: ${ordens.length} ordens`, 148, 14, { align: 'center' });
      
      // Dados da empresa e usuário
      const usuarioNome = user?.full_name || "";
      if (empresaNome || usuarioNome) {
        doc.setFontSize(6);
        doc.setTextColor(100, 100, 100);
        const infoText = empresaNome && usuarioNome 
          ? `${normalizeText(empresaNome)} | Usuario: ${normalizeText(usuarioNome)}`
          : normalizeText(empresaNome) || `Usuario: ${normalizeText(usuarioNome)}`;
        doc.text(infoText, 148, 17.5, { align: 'center' });
        doc.setTextColor(0, 0, 0);
      }

      // Usar colunas configuradas (filtrar apenas as habilitadas)
      let colunasParaPdf = colunasConfig && colunasConfig.length > 0 
        ? colunasConfig.filter(col => col.enabled !== false)
        : [
            { id: "numero_carga", label: "Ordem" },
            { id: "cliente", label: "Remetente" },
            { id: "produto", label: "Produto" },
            { id: "origem_destino", label: "Origem -> Destino" },
            { id: "motorista", label: "Motorista" },
            { id: "cavalo", label: "Cavalo" },
            { id: "carreta", label: "Carreta" },
            { id: "modalidade_carga", label: "Mod." },
            { id: "observacao_carga", label: "Observacoes" }
          ];

      // OTIMIZAÇÃO: Mesclar colunas relacionadas para economizar espaço
      const colunasMescladas = [];
      let i = 0;
      while (i < colunasParaPdf.length) {
        const col = colunasParaPdf[i];
        
        // Mesclar Cavalo + Carreta + Carreta2
        if (col.id === "cavalo") {
          const temCarreta = colunasParaPdf.some(c => c.id === "carreta");
          const temCarreta2 = colunasParaPdf.some(c => c.id === "carreta2");
          
          if (temCarreta || temCarreta2) {
            colunasMescladas.push({ id: "placas_mescladas", label: "Placas", mesclada: true });
            // Pular carreta e carreta2 se existirem
            i++;
            while (i < colunasParaPdf.length && (colunasParaPdf[i].id === "carreta" || colunasParaPdf[i].id === "carreta2")) {
              i++;
            }
            continue;
          }
        }
        
        // Mesclar Tipo de Veículo + Tipo de Carroceria
        if (col.id === "tipo_veiculo") {
          const temCarroceria = colunasParaPdf.some(c => c.id === "tipo_carroceria");
          
          if (temCarroceria) {
            colunasMescladas.push({ id: "tipo_veiculo_carroceria_mesclado", label: "Veic./Carr.", mesclada: true });
            // Pular tipo_carroceria se existir
            i++;
            while (i < colunasParaPdf.length && colunasParaPdf[i].id === "tipo_carroceria") {
              i++;
            }
            continue;
          }
        }
        
        // Não adicionar carreta ou carreta2 ou tipo_carroceria se já foram processadas
        if (col.id === "carreta" || col.id === "carreta2" || col.id === "tipo_carroceria") {
          // Verificar se já mesclamos anteriormente
          const jaMesclado = col.id === "carreta" || col.id === "carreta2" 
            ? colunasMescladas.some(c => c.id === "placas_mescladas")
            : colunasMescladas.some(c => c.id === "tipo_veiculo_carroceria_mesclado");
          
          if (!jaMesclado) {
            colunasMescladas.push(col);
          }
          i++;
          continue;
        }
        
        colunasMescladas.push(col);
        i++;
      }
      
      colunasParaPdf = colunasMescladas;

      // Agrupar por data de descarga
      const ordemsPorData = {};
      ordens.forEach(ordem => {
        const dataDesc = ordem.descarga_agendamento_data 
          ? formatarData(ordem.descarga_agendamento_data)
          : "Sem agendamento";
        
        if (!ordemsPorData[dataDesc]) {
          ordemsPorData[dataDesc] = [];
        }
        ordemsPorData[dataDesc].push(ordem);
      });

      // Ordenar datas
      const datasOrdenadas = Object.keys(ordemsPorData).sort((a, b) => {
        if (a === "Sem agendamento") return 1;
        if (b === "Sem agendamento") return -1;
        return a.localeCompare(b);
      });

      let currentY = 22;

      // Para cada data
      datasOrdenadas.forEach(dataDesc => {
        const ordensData = ordemsPorData[dataDesc];
        
        // Agrupar por remetente dentro da data
        const porRemetente = {};
        ordensData.forEach(ordem => {
          const remetente = normalizeText(ordem.cliente) || "Sem remetente";
          if (!porRemetente[remetente]) {
            porRemetente[remetente] = [];
          }
          porRemetente[remetente].push(ordem);
        });

        // Ordenar remetentes alfabeticamente
        const remetentesOrdenados = Object.keys(porRemetente).sort();

        // Calcular quantitativo por remetente para o cabeçalho
        const quantitativosRemetente = remetentesOrdenados.map(rem => 
          `${rem}: ${porRemetente[rem].length}`
        ).join(' | ');

        // Nova página se necessário
        if (currentY > 175) {
          doc.addPage();
          currentY = 15;
        }

        // Cabeçalho da data com quantitativos (largura igual à tabela)
        const pageWidth = doc.internal.pageSize.getWidth();
        const margemLateral = 5;
        const tableWidth = pageWidth - (margemLateral * 2); // margens de 5mm de cada lado

        doc.setFontSize(7.5);
        doc.setFont('helvetica', 'bold');
        doc.setFillColor(37, 99, 235);
        doc.rect(margemLateral, currentY - 2, tableWidth, 5.5, 'F');
        doc.setTextColor(255, 255, 255);
        doc.text(`DATA: ${dataDesc} | Total: ${ordensData.length} ordens`, margemLateral + 2, currentY + 1.8);
        currentY += 7;

        // Linha com quantitativos por remetente (mesma largura)
        doc.setFontSize(6.5);
        doc.setFont('helvetica', 'normal');
        doc.setFillColor(209, 213, 219);
        doc.rect(margemLateral, currentY - 2, tableWidth, 4.5, 'F');
        doc.setTextColor(55, 65, 81);
        doc.text(quantitativosRemetente, margemLateral + 2, currentY + 1);
        currentY += 6;
        doc.setTextColor(0, 0, 0);

        // Tabela de ordens (todas juntas, ordenadas por remetente)
        const tableData = [];
        remetentesOrdenados.forEach(remetente => {
          porRemetente[remetente].forEach(ordem => {
            const row = colunasParaPdf.map(col => {
              // Tratamento especial para colunas mescladas
              if (col.id === 'placas_mescladas') {
                const cavalo = normalizeText(ordem.cavalo_placa) || "";
                const carr1 = normalizeText(ordem.implemento1_placa) || "";
                const carr2 = normalizeText(ordem.implemento2_placa) || "";
                const placas = [cavalo, carr1, carr2].filter(p => p && p !== "-").join("/");
                return placas || "-";
              }
              
              if (col.id === 'tipo_veiculo_carroceria_mesclado') {
                const veiculo = normalizeText(ordem.tipo_veiculo)?.substring(0, 8) || "";
                const carroceria = normalizeText(ordem.tipo_carroceria)?.substring(0, 8) || "";
                if (!veiculo && !carroceria) return "-";
                if (!veiculo) return carroceria;
                if (!carroceria) return veiculo;
                return `${veiculo}/${carroceria}`;
              }
              
              const valor = getValorColuna(ordem, col.id);
              
              // Tratamento especial para modalidade
              if (col.id === 'modalidade_carga') {
                const modalidadeColor = getModalidadeColor(ordem.modalidade_carga);
                const modalidadeLabel = ordem.modalidade_carga === 'expressa' ? 'EXPRESS' 
                  : ordem.modalidade_carga === 'prioridade' ? 'PRIOR.' 
                  : 'NORMAL';
                return { content: modalidadeLabel, styles: { fillColor: modalidadeColor, textColor: [255, 255, 255], fontStyle: 'bold', halign: 'center' } };
              }
              
              // Tratamento especial para observações (vermelho se preenchido)
              if ((col.id === 'observacao_carga' || col.id === 'observacoes_internas') && ordem[col.id]) {
                return { content: valor, styles: { textColor: [220, 38, 38], fontStyle: 'bold' } };
              }
              
              return valor;
            });
            tableData.push(row);
          });
        });

        // Cabeçalhos normalizados
        const headers = colunasParaPdf.map(col => normalizeText(col.label));

        // A4 paisagem: 297mm x 210mm -> área útil após margens
        const columnStyles = {};
        const baseFontSize = 4.2;
        const basePadding = 0.25;
        const larguraUtilTabela = tableWidth; // Usar a mesma largura dos cabeçalhos

        colunasParaPdf.forEach((col, idx) => {
          const style = {
            fontSize: baseFontSize,
            overflow: 'linebreak',
            cellPadding: basePadding,
            halign: 'left',
            valign: 'middle'
          };

          // Larguras uniformizadas para harmonia visual
          if (col.id === "placas_mescladas") {
            style.fontStyle = 'bold';
            style.cellWidth = 13;
          } else if (col.id === "tipo_veiculo_carroceria_mesclado") {
            style.cellWidth = 10;
          } else if (col.id === "cliente" || col.id === "remetente") {
            style.cellWidth = 20;
          } else if (col.id === "numero_carga") {
            style.fontStyle = 'bold';
            style.cellWidth = 9;
          } else if (col.id === "viagem_pedido") {
            style.cellWidth = 8;
          } else if (col.id === "modalidade_carga") {
            style.halign = 'center';
            style.cellWidth = 8;
          } else if (col.id === "observacao_carga" || col.id === "observacoes_internas") {
            style.cellWidth = 24;
          } else if (col.id === "origem_destino") {
            style.cellWidth = 24;
          } else if (col.id === "destinatario") {
            style.cellWidth = 18;
          } else if (col.id.includes("agendamento") || col.id.includes("carregamento") || col.id.includes("descarga") || col.id.includes("saida") || col.id.includes("chegada")) {
            style.cellWidth = 11;
            style.halign = 'center';
          } else if (col.id === "motorista") {
            style.cellWidth = 14;
          } else if (col.id === "produto") {
            style.cellWidth = 12;
          } else if (col.id === "localizacao_atual") {
            style.cellWidth = 18;
          } else if (col.id === "km_faltam" || col.id === "senha_agendamento") {
            style.halign = 'center';
            style.cellWidth = 5;
          } else if (col.id === "peso") {
            style.halign = 'center';
            style.cellWidth = 7;
          } else if (col.id === "mdfe_baixado" || col.id === "saldo_pago" || col.id === "comprovante_entrega_recebido") {
            style.halign = 'center';
            style.cellWidth = 5;
            style.fontStyle = 'bold';
          } else if (col.id === "tolerancia" || col.id === "diaria_carregamento" || col.id === "diaria_descarga") {
            style.halign = 'center';
            style.cellWidth = 7;
          } else if (col.id === "notas_fiscais" || col.id === "numero_cte" || col.id === "mdfe_url") {
            style.cellWidth = 10;
          } else if (col.id === "status_tracking") {
            style.halign = 'center';
            style.cellWidth = 8;
          }

          columnStyles[idx] = style;
        });

        doc.autoTable({
          startY: currentY,
          head: [headers],
          body: tableData,
          styles: {
            fontSize: 4.2,
            cellPadding: 0.25,
            overflow: 'linebreak',
            halign: 'left',
            valign: 'middle',
            lineWidth: 0.08,
            lineColor: [200, 200, 200]
          },
          headStyles: {
            fillColor: [100, 116, 139],
            textColor: [255, 255, 255],
            fontStyle: 'bold',
            fontSize: 4.2,
            halign: 'center',
            valign: 'middle',
            cellPadding: 0.3,
            minCellHeight: 3.5
          },
          columnStyles: columnStyles,
          margin: { left: margemLateral, right: margemLateral },
          tableWidth: tableWidth,
          theme: 'grid',
          didDrawPage: (data) => {
            const pageSize = doc.internal.pageSize;
            const pageHeight = pageSize.height ? pageSize.height : pageSize.getHeight();
            const pageWidth = pageSize.width ? pageSize.width : pageSize.getWidth();
            
            // Marca d'água no rodapé
            doc.setFontSize(5.5);
            doc.setFont('helvetica', 'italic');
            doc.setTextColor(150, 150, 150);
            doc.text('Powered by LogiFlow - logiflow.com.br', pageWidth / 2, pageHeight - 3, { align: 'center' });
            doc.setTextColor(0, 0, 0);
          }
        });

        currentY = doc.lastAutoTable.finalY + 8;
      });

      // GRÁFICO DE BARRAS
      if (currentY > 130) {
        doc.addPage();
        currentY = 15;
      }

      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('GRAFICO: CARGAS POR DATA DE DESCARGA', 10, currentY);
      currentY += 8;

      // Calcular totais por data
      const totalPorData = {};
      datasOrdenadas.forEach(data => {
        totalPorData[data] = ordemsPorData[data].length;
      });

      const maxOrdens = Math.max(...Object.values(totalPorData));
      const barWidth = 15;
      const barSpacing = 3;
      const chartHeight = 60;
      const chartY = currentY;
      let chartX = 15;

      const datasParaGrafico = datasOrdenadas.slice(0, 15);

      datasParaGrafico.forEach(data => {
        const total = totalPorData[data];
        const barHeight = (total / maxOrdens) * chartHeight;
        
        doc.setFillColor(59, 130, 246);
        doc.rect(chartX, chartY + chartHeight - barHeight, barWidth, barHeight, 'F');
        
        doc.setFontSize(6);
        doc.setFont('helvetica', 'bold');
        doc.text(total.toString(), chartX + barWidth / 2, chartY + chartHeight - barHeight - 2, { align: 'center' });
        
        doc.setFontSize(5);
        doc.setFont('helvetica', 'normal');
        const dataAbrev = data.replace('Sem agendamento', 'S/Agend');
        doc.text(dataAbrev, chartX + barWidth / 2, chartY + chartHeight + 2, { align: 'center' });
        
        chartX += barWidth + barSpacing;
      });

      // Linha base do gráfico
      doc.setDrawColor(0, 0, 0);
      doc.setLineWidth(0.3);
      doc.line(12, chartY + chartHeight, chartX - barSpacing + 2, chartY + chartHeight);

    } else {
      // ============ LAYOUT TABELA - COLUNAS FIXAS OTIMIZADAS ============
      
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('TRACKING LOGISTICO - VISAO TABELA', 148, 8, { align: 'center' });
      
      doc.setFontSize(7);
      doc.setFont('helvetica', 'normal');
      doc.text(`Gerado em: ${dataHora} | Total: ${ordens.length} ordens`, 148, 12, { align: 'center' });

      const getStatusTabela = (ordem) => {
        const statusMap = {
          "finalizado": "FIN",
          "em_viagem": "VGM",
          "carregado": "CRG",
          "em_carregamento": "CGD",
          "descarga_realizada": "DSC",
          "em_descarga": "DSD",
          "chegada_destino": "CHG",
          "aguardando_agendamento": "AGD",
          "carregamento_agendado": "AGC"
        };
        return statusMap[ordem.status_tracking] || "PND";
      };

      const getTipoOrdem = (ordem) => {
        const temMotorista = !!ordem.motorista_nome;
        const temVeiculo = !!ordem.cavalo_placa;
        return (temMotorista && temVeiculo) ? "A" : "O";
      };

      const tableData = ordens.map(ordem => [
        getTipoOrdem(ordem),
        normalizeText(ordem.numero_carga) || "-",
        normalizeText(ordem.asn) || "-",
        formatarData(ordem.data_solicitacao),
        normalizeText(ordem.cliente).substring(0, 22) || "-",
        `${normalizeText(ordem.origem_cidade || ordem.origem).substring(0, 16)} -> ${normalizeText(ordem.destino_cidade || ordem.destino).substring(0, 16)}`,
        normalizeText(ordem.produto).substring(0, 18) || "-",
        normalizeText(ordem.motorista_nome ? ordem.motorista_nome.split(' ')[0] : "-"),
        normalizeText(ordem.cavalo_placa) || "-",
        normalizeText(ordem.implemento1_placa) || "-",
        formatarData(ordem.data_carregamento),
        formatarData(ordem.data_programacao_descarga),
        getStatusTabela(ordem),
        ordem.km_faltam || "-"
      ]);

      const columns = [
        'T',
        'Ordem',
        'ASN',
        'Dt.Sol',
        'Cliente',
        'Origem -> Destino',
        'Produto',
        'Motorista',
        'Cavalo',
        'Carr.',
        'Carga',
        'Desc.',
        'St',
        'KM'
      ];

      doc.autoTable({
        startY: 15,
        head: [columns],
        body: tableData,
        styles: {
          fontSize: 6,
          cellPadding: 0.7,
          overflow: 'linebreak',
          halign: 'left',
          valign: 'middle',
          font: 'helvetica',
          textColor: [0, 0, 0],
          lineColor: [100, 100, 100],
          lineWidth: 0.05
        },
        headStyles: {
          fillColor: [0, 0, 0],
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          halign: 'center',
          fontSize: 6,
          cellPadding: 1
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245]
        },
        rowStyles: {
          fillColor: [255, 255, 255],
          minCellHeight: 4.5
        },
        columnStyles: {
          0: { cellWidth: 6, halign: 'center', fontStyle: 'bold' },
          1: { cellWidth: 16, fontStyle: 'bold' },
          2: { cellWidth: 12 },
          3: { cellWidth: 13, fontSize: 5.5 },
          4: { cellWidth: 25 },
          5: { cellWidth: 48 },
          6: { cellWidth: 22 },
          7: { cellWidth: 20 },
          8: { cellWidth: 13, fontStyle: 'bold' },
          9: { cellWidth: 12, fontSize: 5.5 },
          10: { cellWidth: 12, fontSize: 5.5 },
          11: { cellWidth: 12, fontSize: 5.5 },
          12: { cellWidth: 10, halign: 'center', fontStyle: 'bold' },
          13: { cellWidth: 8, halign: 'center' }
        },
        margin: { top: 15, left: 3, right: 3, bottom: 10 },
        didDrawPage: (data) => {
          const pageCount = doc.internal.getNumberOfPages();
          const pageSize = doc.internal.pageSize;
          const pageHeight = pageSize.height ? pageSize.height : pageSize.getHeight();
          const pageWidth = pageSize.width ? pageSize.width : pageSize.getWidth();
          
          // Linha separadora
          doc.setDrawColor(0, 0, 0);
          doc.setLineWidth(0.2);
          doc.line(3, pageHeight - 8, pageWidth - 3, pageHeight - 8);
          
          // Rodapé
          doc.setFontSize(5.5);
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(0, 0, 0);
          
          doc.text(`Pag. ${data.pageNumber}/${pageCount}`, 5, pageHeight - 5);
          doc.text(`Tracking Tabela - ${ordens.length} ordens | T: A=Alocado O=Oferta | St: VGM=Viagem CRG=Carregado FIN=Finalizado`, pageWidth / 2, pageHeight - 5, { align: 'center' });
          doc.text(dataHora, pageWidth - 5, pageHeight - 5, { align: 'right' });
        }
      });
    }

    // Gerar PDF
    const pdfBuffer = doc.output('arraybuffer');

    return new Response(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename=tracking_${tipo}_${Date.now()}.pdf`,
        'Content-Length': pdfBuffer.byteLength.toString()
      }
    });
    
  } catch (error) {
    console.error("Erro ao gerar PDF:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});