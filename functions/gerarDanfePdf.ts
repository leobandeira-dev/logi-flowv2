import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

const MEU_DANFE_API_KEY = Deno.env.get("CHAVE_MEU_DANFE");
const MEU_DANFE_BASE_URL = "https://api.meudanfe.com.br/v2";

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { chaveAcesso } = body;

        if (!chaveAcesso || chaveAcesso.length !== 44) {
            return Response.json({ error: 'Chave de acesso inválida' }, { status: 400 });
        }

        if (!MEU_DANFE_API_KEY) {
            return Response.json({ error: 'CHAVE_MEU_DANFE não configurada' }, { status: 500 });
        }

        // Buscar DANFE PDF na API MeuDanfe
        const response = await fetch(`${MEU_DANFE_BASE_URL}/fd/get/da/${chaveAcesso}`, {
            method: 'GET',
            headers: {
                'Api-Key': MEU_DANFE_API_KEY
            }
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Erro MeuDanfe:', response.status, errorText);
            
            if (response.status === 404) {
                return Response.json({ 
                    error: 'NF-e não encontrada. Adicione a nota na sua Área do Cliente do MeuDanfe primeiro.',
                    success: false 
                }, { status: 404 });
            }
            
            return Response.json({ 
                error: `Erro ao buscar DANFE: ${response.status}`,
                success: false 
            }, { status: response.status });
        }

        const result = await response.json();

        if (!result.data) {
            return Response.json({ 
                error: 'DANFE não disponível',
                success: false 
            }, { status: 500 });
        }

        // Retornar PDF em base64
        return Response.json({ 
            pdf: result.data,
            name: result.name,
            success: true 
        }, { status: 200 });

    } catch (error) {
        console.error('Erro ao gerar DANFE:', error);
        return Response.json({ 
            error: error.message || 'Erro ao gerar DANFE',
            success: false
        }, { status: 500 });
    }
});