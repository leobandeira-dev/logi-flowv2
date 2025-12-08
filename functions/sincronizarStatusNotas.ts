import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

// Mapeamento de status_tracking para status_nf
const statusTrackingParaNF = {
  aguardando_agendamento: "recebida",
  carregamento_agendado: "recebida",
  em_carregamento: "aguardando_expedicao",
  carregado: "aguardando_expedicao",
  em_viagem: "em_rota_entrega",
  chegada_destino: "na_filial_destino",
  descarga_agendada: "na_filial_destino",
  em_descarga: "na_filial_destino",
  descarga_realizada: "entregue",
  finalizado: "entregue"
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { ordemId } = await req.json();

    if (!ordemId) {
      return Response.json({ error: 'ID da ordem é obrigatório' }, { status: 400 });
    }

    // Buscar ordem
    const ordem = await base44.asServiceRole.entities.OrdemDeCarregamento.get(ordemId);

    if (!ordem) {
      return Response.json({ error: 'Ordem não encontrada' }, { status: 404 });
    }

    // Se não tiver notas fiscais vinculadas, não há nada a fazer
    if (!ordem.notas_fiscais_ids || ordem.notas_fiscais_ids.length === 0) {
      return Response.json({ 
        message: 'Nenhuma nota fiscal vinculada',
        sincronizadas: 0 
      });
    }

    // Determinar status da nota fiscal baseado no tracking
    const statusNF = statusTrackingParaNF[ordem.status_tracking] || "recebida";

    // Atualizar status de todas as notas fiscais vinculadas
    let sincronizadas = 0;
    const erros = [];

    for (const notaId of ordem.notas_fiscais_ids) {
      try {
        await base44.asServiceRole.entities.NotaFiscal.update(notaId, {
          status_nf: statusNF
        });
        sincronizadas++;
      } catch (error) {
        console.error(`Erro ao sincronizar nota ${notaId}:`, error);
        erros.push({
          nota_id: notaId,
          erro: error.message
        });
      }
    }

    return Response.json({
      message: 'Sincronização de status concluída',
      ordem_id: ordem.id,
      status_tracking: ordem.status_tracking,
      status_nf_aplicado: statusNF,
      total_notas: ordem.notas_fiscais_ids.length,
      sincronizadas,
      erros: erros.length > 0 ? erros : undefined
    });

  } catch (error) {
    console.error('Erro na sincronização:', error);
    return Response.json({ 
      error: error.message 
    }, { status: 500 });
  }
});