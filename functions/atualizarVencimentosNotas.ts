import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user || (user.role !== 'admin' && user.tipo_perfil !== 'operador')) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json().catch(() => ({}));
        const forcarAtualizacao = body.forcar || false;

        // Buscar todas as notas fiscais
        const todasNotas = await base44.asServiceRole.entities.NotaFiscal.filter({}, null, 10000);
        
        let atualizadas = 0;
        let erros = 0;
        let jaTemVencimento = 0;
        const detalhes = [];

        for (const nota of todasNotas) {
            try {
                // Pular se já tem vencimento e não estamos forçando
                if (!forcarAtualizacao && nota.data_vencimento) {
                    jaTemVencimento++;
                    continue;
                }

                // Priorizar data_hora_emissao, depois created_date
                const dataBase = nota.data_hora_emissao || nota.created_date;
                
                if (!dataBase) {
                    detalhes.push(`Nota ${nota.numero_nota}: SEM DATA`);
                    erros++;
                    continue;
                }

                const dataEmissao = new Date(dataBase);
                const dataVencimento = new Date(dataEmissao);
                dataVencimento.setDate(dataVencimento.getDate() + 20);
                
                const dataVencimentoISO = dataVencimento.toISOString().split('T')[0];

                // Atualizar a nota
                await base44.asServiceRole.entities.NotaFiscal.update(nota.id, {
                    data_vencimento: dataVencimentoISO
                });

                detalhes.push(`✓ NF ${nota.numero_nota}: ${dataVencimentoISO}`);
                atualizadas++;
            } catch (error) {
                detalhes.push(`✗ NF ${nota.numero_nota}: ${error.message}`);
                erros++;
            }
        }

        return Response.json({ 
            success: true,
            total_notas: todasNotas.length,
            atualizadas,
            ja_tem_vencimento: jaTemVencimento,
            erros,
            detalhes: detalhes.slice(0, 50),
            mensagem: atualizadas > 0 
                ? `✓ ${atualizadas} notas atualizadas com sucesso!`
                : `Nenhuma nota foi atualizada. ${jaTemVencimento} já possuem vencimento.`
        });

    } catch (error) {
        console.error('Erro ao atualizar vencimentos:', error);
        return Response.json({ 
            error: error.message,
            success: false 
        }, { status: 500 });
    }
});