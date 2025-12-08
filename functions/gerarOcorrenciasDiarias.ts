import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Buscar todas as ordens que não estão finalizadas nem canceladas
    const ordens = await base44.asServiceRole.entities.OrdemDeCarregamento.filter({
      status: { $nin: ["finalizado", "cancelado"] }
    }, null, 500);

    const ocorrenciasCriadas = [];
    const agora = new Date();

    for (const ordem of ordens) {
      // Buscar operação para tolerância
      let toleranciaHoras = 2; // Padrão de 2 horas
      if (ordem.operacao_id) {
        try {
          const operacao = await base44.asServiceRole.entities.Operacao.get(ordem.operacao_id);
          if (operacao.tolerancia_horas) {
            toleranciaHoras = operacao.tolerancia_horas;
          }
        } catch (error) {
          console.log(`Operação não encontrada, usando tolerância padrão`);
        }
      }

      // Verificar diária de CARREGAMENTO
      if (ordem.inicio_carregamento && ordem.fim_carregamento) {
        const inicio = new Date(ordem.inicio_carregamento);
        const fim = new Date(ordem.fim_carregamento);
        const horasDecorridas = (fim.getTime() - inicio.getTime()) / (1000 * 60 * 60);
        
        if (horasDecorridas > toleranciaHoras) {
          // Calcular dias de diária (arredondar para cima)
          const diasDiaria = Math.ceil((horasDecorridas - toleranciaHoras) / 24);
          
          // Verificar se já existe ocorrência de diária de carregamento para esta ordem
          const ocorrenciasExistentes = await base44.asServiceRole.entities.Ocorrencia.filter({
            ordem_id: ordem.id,
            categoria: "diaria",
            tipo_diaria: "carregamento"
          });

          if (ocorrenciasExistentes.length === 0) {
            // Gerar número de ticket
            const ticketNumber = `${agora.getFullYear().toString().slice(-2)}${String(agora.getMonth() + 1).padStart(2, '0')}${String(agora.getDate()).padStart(2, '0')}${String(agora.getHours()).padStart(2, '0')}${String(agora.getMinutes()).padStart(2, '0')}${String(agora.getSeconds()).padStart(2, '0')}`;

            const ocorrencia = await base44.asServiceRole.entities.Ocorrencia.create({
              numero_ticket: ticketNumber,
              ordem_id: ordem.id,
              categoria: "diaria",
              tipo: "diaria_carregamento",
              tipo_diaria: "carregamento",
              data_inicio: ordem.inicio_carregamento,
              data_fim: ordem.fim_carregamento,
              observacoes: `Diária de carregamento gerada automaticamente. Tempo total: ${horasDecorridas.toFixed(1)}h (tolerância: ${toleranciaHoras}h). Dias de diária: ${diasDiaria}.`,
              status: "aberta",
              gravidade: "media",
              status_cobranca: "pendente_valor",
              dias_diaria: diasDiaria,
              registrado_por: "sistema"
            });

            ocorrenciasCriadas.push({
              tipo: "carregamento",
              ordem: ordem.numero_carga,
              dias: diasDiaria
            });
          }
        }
      }

      // Verificar diária de DESCARGA
      if (ordem.chegada_destino && ordem.descarga_realizada_data) {
        const inicio = new Date(ordem.chegada_destino);
        const fim = new Date(ordem.descarga_realizada_data);
        const horasDecorridas = (fim.getTime() - inicio.getTime()) / (1000 * 60 * 60);
        
        if (horasDecorridas > toleranciaHoras) {
          // Calcular dias de diária (arredondar para cima)
          const diasDiaria = Math.ceil((horasDecorridas - toleranciaHoras) / 24);
          
          // Verificar se já existe ocorrência de diária de descarga para esta ordem
          const ocorrenciasExistentes = await base44.asServiceRole.entities.Ocorrencia.filter({
            ordem_id: ordem.id,
            categoria: "diaria",
            tipo_diaria: "descarga"
          });

          if (ocorrenciasExistentes.length === 0) {
            // Gerar número de ticket
            const ticketNumber = `${agora.getFullYear().toString().slice(-2)}${String(agora.getMonth() + 1).padStart(2, '0')}${String(agora.getDate()).padStart(2, '0')}${String(agora.getHours()).padStart(2, '0')}${String(agora.getMinutes()).padStart(2, '0')}${String(agora.getSeconds()).padStart(2, '0')}`;

            const ocorrencia = await base44.asServiceRole.entities.Ocorrencia.create({
              numero_ticket: ticketNumber,
              ordem_id: ordem.id,
              categoria: "diaria",
              tipo: "diaria_descarga",
              tipo_diaria: "descarga",
              data_inicio: ordem.chegada_destino,
              data_fim: ordem.descarga_realizada_data,
              observacoes: `Diária de descarga gerada automaticamente. Tempo total: ${horasDecorridas.toFixed(1)}h (tolerância: ${toleranciaHoras}h). Dias de diária: ${diasDiaria}.`,
              status: "aberta",
              gravidade: "media",
              status_cobranca: "pendente_valor",
              dias_diaria: diasDiaria,
              registrado_por: "sistema"
            });

            ocorrenciasCriadas.push({
              tipo: "descarga",
              ordem: ordem.numero_carga,
              dias: diasDiaria
            });
          }
        }
      }
    }

    return Response.json({
      message: 'Verificação de diárias concluída',
      ocorrencias_criadas: ocorrenciasCriadas.length,
      detalhes: ocorrenciasCriadas
    });

  } catch (error) {
    console.error('Erro ao gerar ocorrências de diária:', error);
    return Response.json({ 
      error: error.message 
    }, { status: 500 });
  }
});