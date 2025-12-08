import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { query } = await req.json();
    
    if (!query || query.trim() === "") {
      return Response.json({ 
        error: 'Query é obrigatória' 
      }, { status: 400 });
    }

    const apiKey = Deno.env.get("GOOGLE");
    
    if (!apiKey) {
      return Response.json({ 
        error: 'Chave da API do Google não configurada' 
      }, { status: 500 });
    }

    // Chamar Google Places Autocomplete API
    const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(query)}&components=country:br&key=${apiKey}`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
      return Response.json({ 
        error: `Erro na API do Google: ${data.status}`,
        details: data.error_message
      }, { status: 400 });
    }

    return Response.json({
      predictions: data.predictions || [],
      status: data.status
    });
    
  } catch (error) {
    console.error("Erro ao buscar localizações:", error);
    return Response.json({ 
      error: error.message 
    }, { status: 500 });
  }
});