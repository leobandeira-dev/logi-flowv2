import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Verificar autenticação
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Obter parâmetros do request
    const body = await req.json().catch(() => ({}));
    const mes = body.mes || 11;
    const ano = body.ano || 2025;

    console.log(`📅 Buscando ordens de ${mes}/${ano}`);

    // Buscar TODAS as OrdemEtapa primeiro
    const todasEtapas = await base44.asServiceRole.entities.OrdemEtapa.list();
    console.log(`📋 Total de OrdemEtapa carregadas: ${todasEtapas.length}`);

    // Buscar ordens relacionadas às etapas
    const ordensIds = [...new Set(todasEtapas.map(oe => oe.ordem_id))];
    console.log(`📦 Total de ordens únicas nas etapas: ${ordensIds.length}`);

    // Buscar ordens em lotes
    const ordens = [];
    for (let i = 0; i < ordensIds.length; i += 100) {
      const lote = ordensIds.slice(i, i + 100);
      for (const id of lote) {
        try {
          const ordem = await base44.asServiceRole.entities.OrdemDeCarregamento.get(id);
          ordens.push(ordem);
        } catch (error) {
          console.log(`⚠️ Ordem ${id} não encontrada`);
        }
      }
    }

    console.log(`✅ ${ordens.length} ordens carregadas`);

    // Filtrar ordens do período
    const ordensPeriodo = ordens.filter(ordem => {
      if (!ordem.created_date) return false;
      const data = new Date(ordem.created_date);
      const mesOrdem = data.getMonth() + 1; // 1-12
      const anoOrdem = data.getFullYear();
      
      return mesOrdem === mes && anoOrdem === ano;
    });

    console.log(`📅 Encontradas ${ordensPeriodo.length} ordens de ${mes}/${ano}`);

    // Filtrar etapas NÃO concluídas dessas ordens
    const ordensIdsPeriodo = ordensPeriodo.map(o => o.id);
    const etapasParaConcluir = todasEtapas.filter(oe => 
      ordensIdsPeriodo.includes(oe.ordem_id) && 
      oe.status !== "concluida" && 
      oe.status !== "cancelada"
    );

    console.log(`📋 Encontradas ${etapasParaConcluir.length} etapas NÃO concluídas`);
    console.log(`📊 Status: ${JSON.stringify(etapasParaConcluir.reduce((acc, e) => {
      acc[e.status] = (acc[e.status] || 0) + 1;
      return acc;
    }, {}))}`);

    // Atualizar etapas em lotes
    const dataAtual = new Date().toISOString();
    let atualizadas = 0;
    
    for (const etapa of etapasParaConcluir) {
      await base44.asServiceRole.entities.OrdemEtapa.update(etapa.id, {
        status: "concluida",
        data_conclusao: dataAtual,
        data_inicio: etapa.data_inicio || dataAtual
      });
      atualizadas++;
      
      if (atualizadas % 50 === 0) {
        console.log(`⏳ Processadas ${atualizadas}/${etapasParaConcluir.length} etapas...`);
      }
    }

    console.log(`✅ Total de ${atualizadas} etapas atualizadas`);

    return Response.json({
      sucesso: true,
      ordensPeriodo: ordensPeriodo.length,
      etapasAtualizadas: atualizadas,
      detalhamento: {
        mes,
        ano,
        totalOrdens: ordens.length,
        ordensNoPeriodo: ordensPeriodo.length,
        etapasNaoConcluidas: etapasParaConcluir.length
      },
      mensagem: `✅ ${atualizadas} etapas de ${ordensPeriodo.length} ordens de ${mes}/${ano} foram concluídas`
    });

  } catch (error) {
    console.error('❌ Erro:', error);
    return Response.json({ 
      error: error.message,
      stack: error.stack 
    }, { status: 500 });
  }
});