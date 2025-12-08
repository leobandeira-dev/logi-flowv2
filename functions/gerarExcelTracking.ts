import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { ordens } = body;

    if (!ordens || !Array.isArray(ordens)) {
      return Response.json({ error: 'Dados invalidos' }, { status: 400 });
    }

    // Função para formatar data
    const formatarData = (data) => {
      if (!data) return "";
      try {
        const d = new Date(data);
        const dia = d.getDate().toString().padStart(2, '0');
        const mes = (d.getMonth() + 1).toString().padStart(2, '0');
        const ano = d.getFullYear();
        const hora = d.getHours().toString().padStart(2, '0');
        const min = d.getMinutes().toString().padStart(2, '0');
        return `${dia}/${mes}/${ano} ${hora}:${min}`;
      } catch {
        return "";
      }
    };

    const formatarDataCurta = (data) => {
      if (!data) return "";
      try {
        const d = new Date(data);
        const dia = d.getDate().toString().padStart(2, '0');
        const mes = (d.getMonth() + 1).toString().padStart(2, '0');
        const ano = d.getFullYear();
        return `${dia}/${mes}/${ano}`;
      } catch {
        return "";
      }
    };

    const getStatus = (ordem) => {
      if (ordem.status_tracking === "finalizado") return "FINALIZADO";
      if (!ordem.motorista_nome && !ordem.cavalo_placa) return "PENDENTE";
      if (ordem.status_tracking === "em_viagem") return "EM TRANSITO";
      return "MATRIZ";
    };

    // Normalizar e escapar para CSV
    const escapeCsv = (text) => {
      if (!text) return "";
      const str = String(text)
        .replace(/á/g, 'a').replace(/Á/g, 'A')
        .replace(/é/g, 'e').replace(/É/g, 'E')
        .replace(/í/g, 'i').replace(/Í/g, 'I')
        .replace(/ó/g, 'o').replace(/Ó/g, 'O')
        .replace(/ú/g, 'u').replace(/Ú/g, 'U')
        .replace(/ã/g, 'a').replace(/Ã/g, 'A')
        .replace(/õ/g, 'o').replace(/Õ/g, 'O')
        .replace(/â/g, 'a').replace(/Â/g, 'A')
        .replace(/ê/g, 'e').replace(/Ê/g, 'E')
        .replace(/ô/g, 'o').replace(/Ô/g, 'O')
        .replace(/ç/g, 'c').replace(/Ç/g, 'C');
      
      // Escapar aspas duplas e envolver em aspas se contém vírgula, quebra de linha ou aspas
      if (str.includes(',') || str.includes('\n') || str.includes('"')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    // Criar CSV com separador de vírgula (padrão Excel)
    const headers = [
      'Romaneio', 'ASN', 'SM / DUV', 'Qtd NF-e', 'Remetente', 'Origem',
      'Destinatario', 'Destino', 'Motorista', 'Cavalo', 'Carreta 1',
      'Data Chegada Carga', 'Data Saida Carga', 'Descarga',
      'Localizacao', 'Km Faltante', 'OBS', 'OBS INTERNA', 'Saldo',
      'MDF', 'Comprovante', 'Previsao Chegada', 'Agendamento',
      'CT-e', 'Senha', 'Status', 'Status Tracking'
    ];

    const csvRows = [];
    csvRows.push(headers.join(','));

    for (const ordem of ordens) {
      const row = [
        escapeCsv(ordem.numero_carga) || "-",
        escapeCsv(ordem.asn) || "-",
        escapeCsv(ordem.duv) || "-",
        ordem.volumes || "-",
        escapeCsv(ordem.cliente) || "-",
        escapeCsv(ordem.origem) || "-",
        escapeCsv(ordem.destinatario || ordem.cliente) || "-",
        escapeCsv(ordem.destino) || "-",
        escapeCsv(ordem.motorista_nome) || "-",
        escapeCsv(ordem.cavalo_placa) || "-",
        escapeCsv(ordem.implemento1_placa) || "-",
        formatarData(ordem.carregamento_agendamento_data),
        formatarData(ordem.saida_unidade),
        formatarDataCurta(ordem.data_programacao_descarga),
        escapeCsv(ordem.localizacao_atual) || "-",
        ordem.km_faltam || "-",
        escapeCsv(ordem.observacao_carga) || "-",
        escapeCsv(ordem.observacoes_internas) || "-",
        ordem.saldo ? `R$ ${ordem.saldo.toFixed(2)}` : "-",
        ordem.mdfe_url ? "SIM" : "NAO",
        ordem.comprovante_entrega_url ? "SIM" : "NAO",
        formatarData(ordem.chegada_destino),
        formatarData(ordem.descarga_agendamento_data),
        escapeCsv(ordem.numero_cte) || "-",
        escapeCsv(ordem.senha_agendamento) || "-",
        getStatus(ordem),
        escapeCsv(ordem.status_tracking) || "-"
      ];
      csvRows.push(row.join(','));
    }

    const csvContent = csvRows.join('\n');
    
    // Adicionar BOM UTF-8 para o Excel reconhecer acentos corretamente
    const BOM = '\uFEFF';
    const csvWithBOM = BOM + csvContent;
    
    const encoder = new TextEncoder();
    const csvBytes = encoder.encode(csvWithBOM);

    return new Response(csvBytes, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="tracking_${Date.now()}.csv"`
      }
    });
    
  } catch (error) {
    console.error("Erro ao gerar Excel:", error);
    return Response.json({ 
      error: 'Erro ao gerar Excel',
      details: error.message,
      stack: error.stack 
    }, { status: 500 });
  }
});