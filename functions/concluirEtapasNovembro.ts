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

    // Buscar todas as ordens e etapas usando asServiceRole
    const todasOrdens = await base44.asServiceRole.entities.OrdemDeCarregamento.filter({}, "-created_date", 10000);
    const todasEtapas = await base44.asServiceRole.entities.OrdemEtapa.filter({
      status: { $nin: ["concluida", "cancelada"] }
    }, null, 10000);

    console.log(`📊 ${todasOrdens.length} ordens, ${todasEtapas.length} etapas não concluídas`);

    // Filtrar ordens do período
    const ordensPeriodo = todasOrdens.filter(ordem => {
      if (!ordem.created_date) return false;
      const data = new Date(ordem.created_date);
      const mesOrdem = data.getMonth() + 1;
      const anoOrdem = data.getFullYear();
      return mesOrdem === mes && anoOrdem === ano;
    });

    console.log(`✅ ${ordensPeriodo.length} ordens em ${mes}/${ano}`);

    // IDs das ordens
    const ordensIds = new Set(ordensPeriodo.map(o => o.id));

    // Filtrar etapas dessas ordens
    const etapasParaConcluir = todasEtapas.filter(oe => ordensIds.has(oe.ordem_id));

    console.log(`📋 ${etapasParaConcluir.length} etapas para concluir`);

    // Atualizar
    const dataAtual = new Date().toISOString();
    let atualizadas = 0;
    
    for (const etapa of etapasParaConcluir) {
      try {
        await base44.asServiceRole.entities.OrdemEtapa.update(etapa.id, {
          status: "concluida",
          data_conclusao: dataAtual,
          data_inicio: etapa.data_inicio || dataAtual
        });
        atualizadas++;
        
        if (atualizadas % 50 === 0) {
          console.log(`⏳ ${atualizadas}/${etapasParaConcluir.length}`);
        }
      } catch (error) {
        console.error(`❌ Erro etapa ${etapa.id}`);
      }
    }

    console.log(`✅ ${atualizadas} etapas concluídas`);

    return Response.json({
      sucesso: true,
      ordensNoPeriodo: ordensPeriodo.length,
      etapasAtualizadas: atualizadas,
      mensagem: `✅ ${atualizadas} etapas concluídas`
    });

  } catch (error) {
    console.error('❌ Erro:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});