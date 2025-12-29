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
    const { mes = 11, ano = 2025 } = await req.json().catch(() => ({ mes: 11, ano: 2025 }));

    console.log(`📅 Buscando ordens de ${mes}/${ano}`);

    // Buscar todas as ordens
    const todasOrdens = await base44.asServiceRole.entities.OrdemDeCarregamento.list();
    
    console.log(`📊 Total de ordens carregadas: ${todasOrdens.length}`);
    
    const ordensPeriodo = todasOrdens.filter(ordem => {
      if (!ordem.created_date) return false;
      const data = new Date(ordem.created_date);
      const mesOrdem = data.getMonth() + 1; // 1-12
      const anoOrdem = data.getFullYear();
      
      return mesOrdem === mes && anoOrdem === ano;
    });

    console.log(`📅 Encontradas ${ordensPeriodo.length} ordens de ${mes}/${ano}`);

    // Buscar todas as OrdemEtapa
    const todasOrdemEtapas = await base44.asServiceRole.entities.OrdemEtapa.list();
    
    const ordensIds = ordensPeriodo.map(o => o.id);
    const etapasParaConcluir = todasOrdemEtapas.filter(oe => 
      ordensIds.includes(oe.ordem_id) && 
      oe.status !== "concluida" && 
      oe.status !== "cancelada"
    );

    console.log(`📋 Encontradas ${etapasParaConcluir.length} etapas NÃO concluídas para processar`);
    console.log(`📊 Status das etapas: ${JSON.stringify(etapasParaConcluir.reduce((acc, e) => {
      acc[e.status] = (acc[e.status] || 0) + 1;
      return acc;
    }, {}))}`);

    // Atualizar todas as etapas para concluída
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

    return Response.json({
      sucesso: true,
      ordensPeriodo: ordensPeriodo.length,
      etapasAtualizadas: atualizadas,
      mensagem: `✅ ${atualizadas} etapas não concluídas de ${ordensPeriodo.length} ordens de ${mes}/${ano} foram marcadas como concluídas`
    });

  } catch (error) {
    console.error('❌ Erro ao concluir etapas:', error);
    return Response.json({ 
      error: error.message,
      stack: error.stack 
    }, { status: 500 });
  }
});