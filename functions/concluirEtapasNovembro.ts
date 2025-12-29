import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const mes = body.mes || 11;
    const ano = body.ano || 2025;

    console.log(`📅 Processando etapas de ${mes}/${ano}`);

    // Calcular intervalo do mês
    const dataInicio = new Date(Date.UTC(ano, mes - 1, 1, 0, 0, 0));
    const dataFim = new Date(Date.UTC(ano, mes, 0, 23, 59, 59));
    
    console.log(`📆 De ${dataInicio.toISOString()} até ${dataFim.toISOString()}`);

    // Buscar todas as ordens e etapas
    const [todasOrdens, todasEtapas] = await Promise.all([
      base44.asServiceRole.entities.OrdemDeCarregamento.list(),
      base44.asServiceRole.entities.OrdemEtapa.list()
    ]);

    console.log(`📊 ${todasOrdens.length} ordens e ${todasEtapas.length} etapas carregadas`);

    // Filtrar ordens do período
    const ordensPeriodo = todasOrdens.filter(ordem => {
      if (!ordem.created_date) return false;
      const dataOrdem = new Date(ordem.created_date);
      return dataOrdem >= dataInicio && dataOrdem <= dataFim;
    });

    console.log(`✅ ${ordensPeriodo.length} ordens em ${mes}/${ano}`);

    // IDs das ordens do período
    const ordensIds = new Set(ordensPeriodo.map(o => o.id));

    // Filtrar apenas etapas NÃO concluídas dessas ordens
    const etapasParaConcluir = todasEtapas.filter(oe => 
      ordensIds.has(oe.ordem_id) && 
      oe.status !== "concluida" && 
      oe.status !== "cancelada"
    );

    console.log(`📋 ${etapasParaConcluir.length} etapas não concluídas para processar`);

    // Atualizar em lote
    const dataAtual = new Date().toISOString();
    let atualizadas = 0;
    let erros = 0;
    
    for (const etapa of etapasParaConcluir) {
      try {
        await base44.asServiceRole.entities.OrdemEtapa.update(etapa.id, {
          status: "concluida",
          data_conclusao: dataAtual,
          data_inicio: etapa.data_inicio || dataAtual
        });
        atualizadas++;
        
        if (atualizadas % 100 === 0) {
          console.log(`⏳ ${atualizadas}/${etapasParaConcluir.length}`);
        }
      } catch (error) {
        erros++;
      }
    }

    console.log(`✅ ${atualizadas} etapas concluídas (${erros} erros)`);

    return Response.json({
      sucesso: true,
      mes,
      ano,
      ordensNoPeriodo: ordensPeriodo.length,
      etapasAtualizadas: atualizadas,
      etapasComErro: erros,
      mensagem: `✅ ${atualizadas} etapas de ${ordensPeriodo.length} ordens de ${mes}/${ano} concluídas`
    });

  } catch (error) {
    console.error('❌ Erro:', error);
    return Response.json({ 
      error: error.message 
    }, { status: 500 });
  }
});