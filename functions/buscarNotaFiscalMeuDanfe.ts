const API_BASE_URL = 'https://api.meudanfe.com.br/v2';
const API_KEY = Deno.env.get("CHAVE_MEU_DANFE");

Deno.serve(async (req) => {
    try {
        const body = await req.json();
        const { chaveAcesso } = body;
        
        if (!chaveAcesso || chaveAcesso.length !== 44) {
            return new Response(JSON.stringify({ error: 'Chave de acesso inválida. Deve conter 44 dígitos.' }), { 
                status: 200,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Etapa 1: Adicionar/buscar nota fiscal
        const addResponse = await fetch(`${API_BASE_URL}/fd/add/${chaveAcesso}`, {
            method: 'PUT',
            headers: { 'Api-Key': API_KEY }
        });

        if (!addResponse.ok) {
            const errorText = await addResponse.text();
            return new Response(JSON.stringify({ 
                error: `Erro na API MeuDanfe (${addResponse.status}): ${errorText}` 
            }), { 
                status: 200,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const addData = await addResponse.json();
        
        // Verificar status - pode ser "ok", "OK", "ERROR", etc
        let currentStatus = addData.status?.toLowerCase();
        let attempts = 0;
        const maxAttempts = 30;
        
        // Aguardar até status "ok" (máximo 30 segundos, 1 segundo entre tentativas)
        while (currentStatus !== 'ok' && currentStatus !== 'error' && attempts < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, 1000));
            attempts++;
            
            const statusResponse = await fetch(`${API_BASE_URL}/fd/add/${chaveAcesso}`, {
                method: 'PUT',
                headers: { 'Api-Key': API_KEY }
            });
            
            if (statusResponse.ok) {
                const statusData = await statusResponse.json();
                currentStatus = statusData.status?.toLowerCase();
            }
        }

        if (currentStatus !== 'ok') {
            return new Response(JSON.stringify({ 
                error: `Nota fiscal não encontrada. Status: ${addData.status}` 
            }), { 
                status: 200,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Etapa 2: Baixar o XML
        const xmlResponse = await fetch(`${API_BASE_URL}/fd/get/xml/${chaveAcesso}`, {
            method: 'GET',
            headers: { 'Api-Key': API_KEY }
        });

        if (!xmlResponse.ok) {
            const errorText = await xmlResponse.text();
            return new Response(JSON.stringify({ 
                error: `Erro ao baixar XML: ${errorText}` 
            }), { 
                status: 200,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const xmlData = await xmlResponse.json();

        if (!xmlData.data) {
            return new Response(JSON.stringify({ 
                error: 'XML não encontrado na resposta' 
            }), { 
                status: 200,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Etapa 3: Buscar URL do DANFE
        let danfeUrl = null;
        try {
            const danfeResponse = await fetch(`${API_BASE_URL}/fd/get/pdf/${chaveAcesso}`, {
                method: 'GET',
                headers: { 'Api-Key': API_KEY }
            });

            if (danfeResponse.ok) {
                const danfeData = await danfeResponse.json();
                danfeUrl = danfeData.url || danfeData.data || null;
            }
        } catch (error) {
            console.log("Erro ao buscar DANFE URL (continuando sem ele):", error);
        }

        // O XML já vem como texto no campo "data"
        return new Response(JSON.stringify({ 
            success: true,
            xml: xmlData.data,
            danfe_url: danfeUrl,
            type: xmlData.type || 'NFE',
            name: xmlData.name || ''
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        return new Response(JSON.stringify({ 
            error: error.message || 'Erro interno do servidor'
        }), { 
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    }
});