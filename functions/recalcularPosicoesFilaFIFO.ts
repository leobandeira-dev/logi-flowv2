import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { empresa_id } = await req.json();

    if (!empresa_id) {
      return Response.json({ error: 'empresa_id é obrigatório' }, { status: 400 });
    }

    // Buscar TODOS os veículos da empresa
    const todasMarcacoes = await base44.asServiceRole.entities.FilaVeiculo.filter({ 
      empresa_id: empresa_id 
    });

    // Filtrar apenas veículos ATIVOS (sem data_saida_fila)
    const marcacoesAtivas = todasMarcacoes.filter(m => !m.data_saida_fila);

    // Ordenar por data de entrada (FIFO - First In, First Out)
    const ordenadas = marcacoesAtivas.sort((a, b) => {
      const dataA = new Date(a.data_entrada_fila || 0);
      const dataB = new Date(b.data_entrada_fila || 0);
      return dataA - dataB;
    });

    // Recalcular posições sequencialmente (1, 2, 3, ...)
    const atualizacoes = [];
    for (let i = 0; i < ordenadas.length; i++) {
      const novaPosicao = i + 1;
      
      // Atualizar apenas se a posição mudou
      if (ordenadas[i].posicao_fila !== novaPosicao) {
        atualizacoes.push(
          base44.asServiceRole.entities.FilaVeiculo.update(ordenadas[i].id, { 
            posicao_fila: novaPosicao 
          })
        );
      }
    }

    // Executar todas as atualizações em paralelo
    await Promise.all(atualizacoes);

    return Response.json({ 
      success: true, 
      total_ativos: ordenadas.length,
      atualizados: atualizacoes.length,
      message: `${atualizacoes.length} posições foram recalculadas na fila`
    });
  } catch (error) {
    console.error('Erro ao recalcular posições FIFO:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});