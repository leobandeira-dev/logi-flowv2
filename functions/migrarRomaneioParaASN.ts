import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Buscar todos os campos customizados que sejam "ROMANEIO"
    const todosCampos = await base44.asServiceRole.entities.EtapaCampo.list();
    const camposRomaneio = todosCampos.filter(c => 
      c.nome.toLowerCase().includes('romaneio') || c.nome.toLowerCase().includes('asn')
    );

    if (camposRomaneio.length === 0) {
      return Response.json({ 
        success: true, 
        message: 'Nenhum campo ROMANEIO encontrado',
        migrados: 0 
      });
    }

    // Buscar todos os valores preenchidos desses campos
    const todosValores = await base44.asServiceRole.entities.OrdemEtapaCampo.list();
    const valoresRomaneio = todosValores.filter(v => 
      camposRomaneio.some(c => c.id === v.campo_id) && v.valor
    );

    let migrados = 0;
    const erros = [];

    // Buscar todas as OrdemEtapa de uma vez para otimizar
    const todasOrdemEtapas = await base44.asServiceRole.entities.OrdemEtapa.list();
    const ordemEtapaMap = {};
    todasOrdemEtapas.forEach(oe => {
      ordemEtapaMap[oe.id] = oe.ordem_id;
    });

    // Agrupar por ordem_id para fazer updates em batch
    const updatesPorOrdem = {};
    
    for (const valorCampo of valoresRomaneio) {
      const ordemId = ordemEtapaMap[valorCampo.ordem_etapa_id];
      if (ordemId && valorCampo.valor) {
        updatesPorOrdem[ordemId] = valorCampo.valor;
      }
    }

    // Fazer updates com delay para evitar rate limit
    const ordemIds = Object.keys(updatesPorOrdem);
    
    for (let i = 0; i < ordemIds.length; i++) {
      try {
        const ordemId = ordemIds[i];
        await base44.asServiceRole.entities.OrdemDeCarregamento.update(ordemId, {
          asn: updatesPorOrdem[ordemId]
        });
        
        migrados++;
        
        // Delay a cada 10 requisições para evitar rate limit
        if ((i + 1) % 10 === 0) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      } catch (error) {
        erros.push({
          ordem_id: ordemIds[i],
          erro: error.message
        });
      }
    }

    return Response.json({
      success: true,
      message: `Migração concluída`,
      migrados: migrados,
      total_valores: valoresRomaneio.length,
      campos_encontrados: camposRomaneio.length,
      erros: erros.length > 0 ? erros : undefined
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});