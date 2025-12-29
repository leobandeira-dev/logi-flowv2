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

    console.log(`📅 Iniciando conclusão de etapas de ${mes}/${ano}`);

    // Calcular intervalo de datas para novembro/2025
    const dataInicio = new Date(ano, mes - 1, 1); // Primeiro dia do mês
    const dataFim = new Date(ano, mes, 0, 23, 59, 59); // Último dia do mês
    
    console.log(`📆 Período: ${dataInicio.toISOString()} até ${dataFim.toISOString()}`);

    // Buscar TODAS as OrdemEtapa
    const todasEtapas = await base44.asServiceRole.entities.OrdemEtapa.list();
    console.log(`📋 Total de ${todasEtapas.length} OrdemEtapa no sistema`);

    // Buscar TODAS as ordens
    const todasOrdens = await base44.asServiceRole.entities.OrdemDeCarregamento.list();
    console.log(`📦 Total de ${todasOrdens.length} ordens no sistema`);

    // Filtrar ordens de novembro
    const ordensPeriodo = todasOrdens.filter(ordem => {
      if (!ordem.created_date) return false;
      const data = new Date(ordem.created_date);
      return data >= dataInicio && data <= dataFim;
    });

    console.log(`✅ Encontradas ${ordensPeriodo.length} ordens de ${mes}/${ano}`);

    // Filtrar etapas NÃO concluídas dessas ordens
    const ordensIdsPeriodo = ordensPeriodo.map(o => o.id);
    const etapasParaConcluir = todasEtapas.filter(oe => 
      ordensIdsPeriodo.includes(oe.ordem_id) && 
      oe.status !== "concluida" && 
      oe.status !== "cancelada"
    );

    console.log(`📋 ${etapasParaConcluir.length} etapas não concluídas encontradas`);
    console.log(`📊 Status: ${JSON.stringify(etapasParaConcluir.reduce((acc, e) => {
      acc[e.status] = (acc[e.status] || 0) + 1;
      return acc;
    }, {}))}`);

    // Atualizar todas as etapas
    const dataAtual = new Date().toISOString();
    let atualizadas = 0;
    const erros = [];
    
    for (const etapa of etapasParaConcluir) {
      try {
        await base44.asServiceRole.entities.OrdemEtapa.update(etapa.id, {
          status: "concluida",
          data_conclusao: dataAtual,
          data_inicio: etapa.data_inicio || dataAtual
        });
        atualizadas++;
        
        if (atualizadas % 100 === 0) {
          console.log(`⏳ ${atualizadas}/${etapasParaConcluir.length} etapas processadas...`);
        }
      } catch (error) {
        erros.push({ etapaId: etapa.id, erro: error.message });
        console.error(`❌ Erro na etapa ${etapa.id}: ${error.message}`);
      }
    }

    console.log(`✅ Concluído! ${atualizadas} etapas atualizadas de ${etapasParaConcluir.length}`);

    return Response.json({
      sucesso: true,
      mes,
      ano,
      ordensNoPeriodo: ordensPeriodo.length,
      etapasEncontradas: etapasParaConcluir.length,
      etapasAtualizadas: atualizadas,
      erros: erros.length,
      mensagem: `✅ ${atualizadas} etapas de ${ordensPeriodo.length} ordens de ${mes}/${ano} foram concluídas${erros.length > 0 ? ` (${erros.length} erros)` : ''}`
    });

  } catch (error) {
    console.error('❌ Erro crítico:', error);
    return Response.json({ 
      error: error.message,
      stack: error.stack 
    }, { status: 500 });
  }
});