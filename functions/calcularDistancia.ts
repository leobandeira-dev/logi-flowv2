import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { origem, destino } = await req.json();
    
    if (!origem || !destino) {
      return Response.json({ 
        error: 'Origem e destino são obrigatórios' 
      }, { status: 400 });
    }

    const apiKey = Deno.env.get("GOOGLE");
    
    if (!apiKey) {
      return Response.json({ 
        error: 'Chave da API do Google não configurada' 
      }, { status: 500 });
    }

    // Chamar Google Distance Matrix API
    const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${encodeURIComponent(origem)}&destinations=${encodeURIComponent(destino)}&key=${apiKey}`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.status !== 'OK') {
      return Response.json({ 
        error: `Erro na API do Google: ${data.status}`,
        details: data.error_message
      }, { status: 400 });
    }

    const element = data.rows[0]?.elements[0];
    
    if (!element || element.status !== 'OK') {
      return Response.json({ 
        error: 'Não foi possível calcular a distância',
        status: element?.status
      }, { status: 400 });
    }

    return Response.json({
      distancia_texto: element.distance.text,
      distancia_metros: element.distance.value,
      distancia_km: (element.distance.value / 1000).toFixed(1),
      duracao_texto: element.duration.text,
      duracao_segundos: element.duration.value,
      origem_endereco: data.origin_addresses[0],
      destino_endereco: data.destination_addresses[0]
    });
    
  } catch (error) {
    console.error("Erro ao calcular distância:", error);
    return Response.json({ 
      error: error.message 
    }, { status: 500 });
  }
});