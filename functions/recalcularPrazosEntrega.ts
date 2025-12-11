import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Função para adicionar dias úteis (pula sábado e domingo)
    const adicionarDiasUteis = (dataInicial, numeroDias) => {
      let resultado = new Date(dataInicial);
      let diasAdicionados = 0;
      
      while (diasAdicionados < numeroDias) {
        resultado.setDate(resultado.getDate() + 1);
        const diaSemana = resultado.getDay();
        if (diaSemana !== 0 && diaSemana !== 6) {
          diasAdicionados++;
        }
      }
      
      return resultado;
    };

    // Buscar operações
    const operacoes = await base44.asServiceRole.entities.Operacao.list();
    const operacoesMap = new Map();
    
    for (const op of operacoes) {
      operacoesMap.set(op.id, op);
    }

    console.log(`📋 ${operacoes.length} operações carregadas`);

    // Buscar ordens - usando limit muito alto para pegar todas
    const todasOrdens = await base44.asServiceRole.entities.OrdemDeCarregamento.list('-created_date', 1000);
    
    console.log(`📦 ${todasOrdens.length} ordens carregadas`);

    // Filtrar ordens que têm operação e data de carregamento
    const ordensPrecisam = [];
    for (const ordem of todasOrdens) {
      if (ordem.operacao_id && ordem.carregamento_agendamento_data) {
        ordensPrecisam.push(ordem);
      }
    }

    console.log(`🎯 ${ordensPrecisam.length} ordens com operação e data de carregamento`);

    const atualizadas = [];
    const erros = [];
    const semAlteracao = [];
    const jaCorretos = [];

    for (const ordem of ordensPrecisam) {
      try {
        const operacao = operacoesMap.get(ordem.operacao_id);
        
        if (!operacao) {
          erros.push({
            ordem: ordem.numero_carga || ordem.id.slice(-6),
            motivo: 'Operação não encontrada'
          });
          continue;
        }

        let prazoCalculado = null;

        // REGRA 1: Se usa agenda de descarga como prazo
        if (operacao.prazo_entrega_usa_agenda_descarga === true) {
          if (ordem.descarga_agendamento_data) {
            prazoCalculado = new Date(ordem.descarga_agendamento_data);
          } else {
            semAlteracao.push({
              ordem: ordem.numero_carga || ordem.id.slice(-6),
              motivo: 'Aguardando agenda de descarga'
            });
            continue;
          }
        } 
        // REGRA 2: Calcular baseado em dias a partir do carregamento
        else if (operacao.prazo_entrega_dias) {
          const dataCarregamento = new Date(ordem.carregamento_agendamento_data);
          
          if (operacao.prazo_entrega_dias_uteis === true) {
            prazoCalculado = adicionarDiasUteis(dataCarregamento, operacao.prazo_entrega_dias);
          } else {
            prazoCalculado = new Date(dataCarregamento);
            prazoCalculado.setDate(prazoCalculado.getDate() + operacao.prazo_entrega_dias);
          }
        } else {
          semAlteracao.push({
            ordem: ordem.numero_carga || ordem.id.slice(-6),
            motivo: 'Operação sem regra de prazo configurada'
          });
          continue;
        }

        // Verificar se precisa atualizar
        const prazoCalculadoISO = prazoCalculado.toISOString();
        const prazoAtual = ordem.prazo_entrega;

        if (prazoCalculadoISO !== prazoAtual) {
          await base44.asServiceRole.entities.OrdemDeCarregamento.update(ordem.id, {
            prazo_entrega: prazoCalculadoISO
          });

          atualizadas.push({
            ordem: ordem.numero_carga || ordem.id.slice(-6),
            operacao: operacao.nome,
            carregamento: ordem.carregamento_agendamento_data,
            prazo_anterior: prazoAtual || 'VAZIO',
            prazo_calculado: prazoCalculadoISO,
            regra: operacao.prazo_entrega_usa_agenda_descarga 
              ? 'Usa agenda de descarga' 
              : `${operacao.prazo_entrega_dias} dias ${operacao.prazo_entrega_dias_uteis ? 'úteis' : 'corridos'}`
          });
        } else {
          jaCorretos.push({
            ordem: ordem.numero_carga || ordem.id.slice(-6),
            prazo: prazoAtual
          });
        }

      } catch (error) {
        erros.push({
          ordem: ordem.numero_carga || ordem.id.slice(-6),
          motivo: error.message
        });
      }
    }

    console.log(`✅ Processamento concluído: ${atualizadas.length} atualizadas, ${jaCorretos.length} já corretos`);

    return Response.json({
      success: true,
      resumo: {
        total_verificadas: ordensPrecisam.length,
        atualizadas: atualizadas.length,
        ja_corretos: jaCorretos.length,
        aguardando_dados: semAlteracao.length,
        erros: erros.length
      },
      detalhes: {
        atualizadas,
        ja_corretos: jaCorretos.slice(0, 10),
        aguardando_dados: semAlteracao,
        erros
      }
    });

  } catch (error) {
    console.error('❌ Erro:', error);
    return Response.json({ 
      success: false,
      error: error.message 
    }, { status: 500 });
  }
});