import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { ordemMaeId } = await req.json();

    if (!ordemMaeId) {
      return Response.json({ error: 'ID da ordem mãe é obrigatório' }, { status: 400 });
    }

    // Buscar ordem mãe
    const ordemMae = await base44.asServiceRole.entities.OrdemDeCarregamento.get(ordemMaeId);

    if (!ordemMae) {
      return Response.json({ error: 'Ordem mãe não encontrada' }, { status: 404 });
    }

    // Buscar todas as ordens filhas
    const todasOrdens = await base44.asServiceRole.entities.OrdemDeCarregamento.list();
    const ordensFilhas = todasOrdens.filter(o => o.ordem_mae_id === ordemMaeId);

    if (ordensFilhas.length === 0) {
      return Response.json({ 
        message: 'Nenhuma ordem filha encontrada',
        sincronizadas: 0 
      });
    }

    // Campos de tracking que serão sincronizados
    const camposTracking = {
      status_tracking: ordemMae.status_tracking,
      carregamento_agendamento_data: ordemMae.carregamento_agendamento_data,
      inicio_carregamento: ordemMae.inicio_carregamento,
      fim_carregamento: ordemMae.fim_carregamento,
      saida_unidade: ordemMae.saida_unidade,
      chegada_destino: ordemMae.chegada_destino,
      descarga_agendamento_data: ordemMae.descarga_agendamento_data,
      agendamento_checklist_data: ordemMae.agendamento_checklist_data,
      descarga_realizada_data: ordemMae.descarga_realizada_data,
      inicio_descarregamento: ordemMae.inicio_descarregamento,
      fim_descarregamento: ordemMae.fim_descarregamento,
      data_carregamento: ordemMae.data_carregamento,
      data_programacao_descarga: ordemMae.data_programacao_descarga,
      localizacao_atual: ordemMae.localizacao_atual,
      km_faltam: ordemMae.km_faltam
    };

    // Buscar etapas da ordem mãe
    const todasEtapas = await base44.asServiceRole.entities.OrdemEtapa.list();
    const etapasMae = todasEtapas.filter(e => e.ordem_id === ordemMaeId);

    // Buscar ocorrências da ordem mãe
    const todasOcorrencias = await base44.asServiceRole.entities.Ocorrencia.list();
    const ocorrenciasMae = todasOcorrencias.filter(o => o.ordem_id === ordemMaeId);

    const resultados = [];

    // Sincronizar cada ordem filha
    for (const filha of ordensFilhas) {
      try {
        // Atualizar campos de tracking e notas fiscais
        await base44.asServiceRole.entities.OrdemDeCarregamento.update(filha.id, {
          ...camposTracking,
          notas_fiscais_ids: ordemMae.notas_fiscais_ids || [],
          peso_total_consolidado: ordemMae.peso_total_consolidado,
          valor_total_consolidado: ordemMae.valor_total_consolidado,
          volumes_total_consolidado: ordemMae.volumes_total_consolidado
        });

        // Sincronizar etapas do fluxo
        const etapasFilha = todasEtapas.filter(e => e.ordem_id === filha.id);
        
        for (const etapaMae of etapasMae) {
          // Verificar se etapa já existe na filha
          const etapaExistente = etapasFilha.find(ef => ef.etapa_id === etapaMae.etapa_id);

          if (etapaExistente) {
            // Atualizar etapa existente
            await base44.asServiceRole.entities.OrdemEtapa.update(etapaExistente.id, {
              status: etapaMae.status,
              data_inicio: etapaMae.data_inicio,
              data_conclusao: etapaMae.data_conclusao,
              prazo_previsto: etapaMae.prazo_previsto,
              observacoes: etapaMae.observacoes
            });
          } else {
            // Criar nova etapa na filha
            await base44.asServiceRole.entities.OrdemEtapa.create({
              ordem_id: filha.id,
              etapa_id: etapaMae.etapa_id,
              status: etapaMae.status,
              data_inicio: etapaMae.data_inicio,
              data_conclusao: etapaMae.data_conclusao,
              responsavel_id: etapaMae.responsavel_id,
              departamento_responsavel_id: etapaMae.departamento_responsavel_id,
              prazo_previsto: etapaMae.prazo_previsto,
              observacoes: etapaMae.observacoes
            });
          }
        }

        // Sincronizar ocorrências
        const ocorrenciasFilha = todasOcorrencias.filter(o => o.ordem_id === filha.id);

        for (const ocorrenciaMae of ocorrenciasMae) {
          // Verificar se ocorrência já foi replicada (por número de ticket)
          const ocorrenciaExistente = ocorrenciasFilha.find(
            of => of.numero_ticket === ocorrenciaMae.numero_ticket
          );

          if (!ocorrenciaExistente) {
            // Criar nova ocorrência na filha
            await base44.asServiceRole.entities.Ocorrencia.create({
              ordem_id: filha.id,
              tipo: ocorrenciaMae.tipo,
              tipo_ocorrencia_id: ocorrenciaMae.tipo_ocorrencia_id,
              descricao_tipo: ocorrenciaMae.descricao_tipo,
              categoria: ocorrenciaMae.categoria,
              data_inicio: ocorrenciaMae.data_inicio,
              data_fim: ocorrenciaMae.data_fim,
              observacoes: `[Replicado da ordem mãe] ${ocorrenciaMae.observacoes || ''}`,
              status: ocorrenciaMae.status,
              gravidade: ocorrenciaMae.gravidade,
              registrado_por: ocorrenciaMae.registrado_por,
              responsavel_id: ocorrenciaMae.responsavel_id,
              departamento_responsavel_id: ocorrenciaMae.departamento_responsavel_id,
              localizacao: ocorrenciaMae.localizacao,
              imagem_url: ocorrenciaMae.imagem_url
            });
          }
        }

        resultados.push({
          ordem_filha_id: filha.id,
          numero_carga: filha.numero_carga,
          status: 'sincronizado'
        });

      } catch (error) {
        console.error(`Erro ao sincronizar ordem filha ${filha.id}:`, error);
        resultados.push({
          ordem_filha_id: filha.id,
          numero_carga: filha.numero_carga,
          status: 'erro',
          erro: error.message
        });
      }
    }

    return Response.json({
      message: 'Sincronização concluída',
      ordem_mae: ordemMae.numero_carga,
      total_filhas: ordensFilhas.length,
      sincronizadas: resultados.filter(r => r.status === 'sincronizado').length,
      erros: resultados.filter(r => r.status === 'erro').length,
      detalhes: resultados
    });

  } catch (error) {
    console.error('Erro na sincronização:', error);
    return Response.json({ 
      error: error.message 
    }, { status: 500 });
  }
});