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

    // Buscar TODAS as OrdemEtapa com status não concluído
    const etapasResponse = await base44.asServiceRole.entities.OrdemEtapa.filter({
      status: { $in: ["pendente", "em_andamento", "bloqueada"] }
    }, null, 10000);

    const todasEtapas = Array.isArray(etapasResponse) ? etapasResponse : [];
    console.log(`📋 ${todasEtapas.length} etapas não concluídas no sistema`);

    // Buscar as ordens relacionadas apenas às etapas não concluídas
    const ordensIdsUnicos = [...new Set(todasEtapas.map(e => e.ordem_id))];
    console.log(`🔍 ${ordensIdsUnicos.length} ordens únicas para verificar`);

    // Buscar todas as ordens de uma vez
    const ordensResponse = await base44.asServiceRole.entities.OrdemDeCarregamento.list();
    const todasOrdens = Array.isArray(ordensResponse) ? ordensResponse : [];
    console.log(`📦 ${todasOrdens.length} ordens carregadas`);

    // Criar mapa de ordens por ID
    const ordensMap = {};
    todasOrdens.forEach(o => {
      ordensMap[o.id] = o;
    });

    // Filtrar etapas de ordens do período solicitado
    const etapasParaConcluir = todasEtapas.filter(etapa => {
      const ordem = ordensMap[etapa.ordem_id];
      if (!ordem || !ordem.created_date) return false;
      
      const data = new Date(ordem.created_date);
      const mesOrdem = data.getMonth() + 1; // 1-12
      const anoOrdem = data.getFullYear();
      
      return mesOrdem === mes && anoOrdem === ano;
    });

    console.log(`✅ ${etapasParaConcluir.length} etapas de ${mes}/${ano} para concluir`);

    // Contar ordens únicas
    const ordensAfetadas = [...new Set(etapasParaConcluir.map(e => e.ordem_id))];
    console.log(`📦 Afetando ${ordensAfetadas.length} ordens`);

    // Atualizar etapas
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
        
        if (atualizadas % 100 === 0) {
          console.log(`⏳ ${atualizadas}/${etapasParaConcluir.length} concluídas...`);
        }
      } catch (error) {
        console.error(`❌ Erro: ${error.message}`);
      }
    }

    console.log(`✅ ${atualizadas} etapas concluídas com sucesso`);

    return Response.json({
      sucesso: true,
      mes,
      ano,
      ordensAfetadas: ordensAfetadas.length,
      etapasEncontradas: etapasParaConcluir.length,
      etapasAtualizadas: atualizadas,
      mensagem: `✅ ${atualizadas} etapas de ${ordensAfetadas.length} ordens de ${mes}/${ano} foram concluídas`
    });

  } catch (error) {
    console.error('❌ Erro crítico:', error);
    return Response.json({ 
      error: error.message,
      stack: error.stack 
    }, { status: 500 });
  }
});