import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Verificar autenticação
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Buscar todas as ordens criadas em novembro (2024 ou 2025)
    const todasOrdens = await base44.asServiceRole.entities.OrdemDeCarregamento.list();
    
    const ordensNovembro = todasOrdens.filter(ordem => {
      if (!ordem.created_date) return false;
      const data = new Date(ordem.created_date);
      const mes = data.getMonth(); // 0-11
      const ano = data.getFullYear();
      
      // Novembro = mês 10 (0-indexed)
      return mes === 10 && (ano === 2024 || ano === 2025);
    });

    console.log(`📅 Encontradas ${ordensNovembro.length} ordens de novembro`);

    // Buscar todas as OrdemEtapa relacionadas a essas ordens
    const todasOrdemEtapas = await base44.asServiceRole.entities.OrdemEtapa.list();
    
    const ordensIds = ordensNovembro.map(o => o.id);
    const etapasParaConcluir = todasOrdemEtapas.filter(oe => 
      ordensIds.includes(oe.ordem_id) && oe.status !== "concluida"
    );

    console.log(`📋 Encontradas ${etapasParaConcluir.length} etapas para concluir`);

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
    }

    return Response.json({
      sucesso: true,
      ordensNovembro: ordensNovembro.length,
      etapasAtualizadas: atualizadas,
      mensagem: `✅ ${atualizadas} etapas de ${ordensNovembro.length} ordens de novembro foram marcadas como concluídas`
    });

  } catch (error) {
    console.error('❌ Erro ao concluir etapas:', error);
    return Response.json({ 
      error: error.message,
      stack: error.stack 
    }, { status: 500 });
  }
});