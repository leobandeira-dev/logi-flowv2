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

    // Para cada valor, atualizar a ordem correspondente
    for (const valorCampo of valoresRomaneio) {
      try {
        const ordemId = ordemEtapaMap[valorCampo.ordem_etapa_id];
        
        if (ordemId) {
          // Atualizar a ordem com o valor no campo ASN
          await base44.asServiceRole.entities.OrdemDeCarregamento.update(ordemId, {
            asn: valorCampo.valor
          });
          
          migrados++;
        }
      } catch (error) {
        erros.push({
          ordem_etapa_id: valorCampo.ordem_etapa_id,
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