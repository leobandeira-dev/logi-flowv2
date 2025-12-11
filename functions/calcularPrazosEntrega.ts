import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Buscar todas as ordens sem prazo_entrega
    const todasOrdens = await base44.asServiceRole.entities.OrdemDeCarregamento.list();
    const ordensSemPrazo = todasOrdens.filter(ordem => !ordem.prazo_entrega && ordem.operacao_id && ordem.carregamento_agendamento_data);

    console.log(`📊 Total de ordens: ${todasOrdens.length}`);
    console.log(`⚠️ Ordens sem prazo_entrega: ${ordensSemPrazo.length}`);

    // Buscar todas as operações de uma vez
    const operacoes = await base44.asServiceRole.entities.Operacao.list();
    const operacoesMap = {};
    operacoes.forEach(op => {
      operacoesMap[op.id] = op;
    });

    const ordensAtualizadas = [];
    const erros = [];

    // Função para adicionar dias úteis
    const adicionarDiasUteis = (data, dias) => {
      let resultado = new Date(data);
      let diasAdicionados = 0;
      
      while (diasAdicionados < dias) {
        resultado.setDate(resultado.getDate() + 1);
        const diaSemana = resultado.getDay();
        // 0 = domingo, 6 = sábado
        if (diaSemana !== 0 && diaSemana !== 6) {
          diasAdicionados++;
        }
      }
      
      return resultado;
    };

    // Processar cada ordem
    for (const ordem of ordensSemPrazo) {
      try {
        const operacao = operacoesMap[ordem.operacao_id];
        
        if (!operacao) {
          erros.push({
            ordem_id: ordem.id,
            numero_carga: ordem.numero_carga,
            motivo: 'Operação não encontrada'
          });
          continue;
        }

        let prazoCalculado = null;

        // Regra 1: Se usa agenda de descarga
        if (operacao.prazo_entrega_usa_agenda_descarga) {
          if (ordem.descarga_agendamento_data) {
            prazoCalculado = new Date(ordem.descarga_agendamento_data).toISOString();
          } else {
            erros.push({
              ordem_id: ordem.id,
              numero_carga: ordem.numero_carga,
              motivo: 'Operação requer agenda de descarga, mas não está preenchida'
            });
            continue;
          }
        } 
        // Regra 2: Calcular com base em dias a partir do agendamento de carregamento
        else if (operacao.prazo_entrega_dias) {
          const dataCarregamento = new Date(ordem.carregamento_agendamento_data);
          
          if (operacao.prazo_entrega_dias_uteis) {
            // Adicionar dias úteis
            prazoCalculado = adicionarDiasUteis(dataCarregamento, operacao.prazo_entrega_dias).toISOString();
          } else {
            // Adicionar dias corridos
            const prazo = new Date(dataCarregamento);
            prazo.setDate(prazo.getDate() + operacao.prazo_entrega_dias);
            prazoCalculado = prazo.toISOString();
          }
        } else {
          erros.push({
            ordem_id: ordem.id,
            numero_carga: ordem.numero_carga,
            motivo: 'Operação sem regra de prazo configurada'
          });
          continue;
        }

        // Atualizar a ordem
        if (prazoCalculado) {
          await base44.asServiceRole.entities.OrdemDeCarregamento.update(ordem.id, {
            prazo_entrega: prazoCalculado
          });

          ordensAtualizadas.push({
            ordem_id: ordem.id,
            numero_carga: ordem.numero_carga,
            operacao_nome: operacao.nome,
            carregamento_agendamento: ordem.carregamento_agendamento_data,
            prazo_calculado: prazoCalculado,
            regra_usada: operacao.prazo_entrega_usa_agenda_descarga 
              ? 'agenda_descarga' 
              : `${operacao.prazo_entrega_dias} dias ${operacao.prazo_entrega_dias_uteis ? 'úteis' : 'corridos'}`
          });
        }
      } catch (error) {
        erros.push({
          ordem_id: ordem.id,
          numero_carga: ordem.numero_carga,
          motivo: error.message
        });
      }
    }

    return Response.json({
      status: 'success',
      total_processadas: ordensSemPrazo.length,
      total_atualizadas: ordensAtualizadas.length,
      total_erros: erros.length,
      ordens_atualizadas: ordensAtualizadas,
      erros: erros
    });

  } catch (error) {
    console.error('Erro:', error);
    return Response.json({ 
      status: 'error',
      error: error.message 
    }, { status: 500 });
  }
});