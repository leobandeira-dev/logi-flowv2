import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { origem, destino, titulo, distanciaKm } = await req.json();

    if (!origem || !destino) {
      return Response.json({ error: 'Origem e destino são obrigatórios' }, { status: 400 });
    }

    const GOOGLE_API_KEY = Deno.env.get("MAPS_STATIC_API_GERAR_IMAGEM_MAPA") || Deno.env.get("GOOGLE");

    // 1. Buscar rota usando Directions API
    const directionsUrl = `https://maps.googleapis.com/maps/api/directions/json?origin=${encodeURIComponent(origem)}&destination=${encodeURIComponent(destino)}&mode=driving&language=pt-BR&key=${GOOGLE_API_KEY}`;
    
    const directionsResponse = await fetch(directionsUrl);
    const directionsData = await directionsResponse.json();

    if (directionsData.status !== 'OK' || !directionsData.routes || directionsData.routes.length === 0) {
      return Response.json({ error: 'Não foi possível obter a rota' }, { status: 400 });
    }

    // 2. Extrair polyline da rota
    const route = directionsData.routes[0];
    const polyline = route.overview_polyline.points;

    // 3. Gerar URL do mapa estático com a rota real
    const staticMapUrl = `https://maps.googleapis.com/maps/api/staticmap?` +
      `size=1200x800&` +
      `scale=2&` +
      `maptype=roadmap&` +
      `markers=color:green|label:A|${encodeURIComponent(origem)}&` +
      `markers=color:red|label:B|${encodeURIComponent(destino)}&` +
      `path=color:0x3b82f6|weight:5|enc:${polyline}&` +
      `key=${GOOGLE_API_KEY}`;

    // 4. Fazer fetch da imagem do mapa
    const mapResponse = await fetch(staticMapUrl);
    
    if (!mapResponse.ok) {
      console.error("Erro ao buscar mapa:", await mapResponse.text());
      return Response.json({ error: 'Erro ao gerar mapa' }, { status: 500 });
    }
    
    const mapBuffer = await mapResponse.arrayBuffer();
    
    // 5. Converter para base64 para enviar via JSON
    const base64Image = btoa(
      new Uint8Array(mapBuffer).reduce((data, byte) => data + String.fromCharCode(byte), '')
    );

    // 6. Retornar como JSON com a imagem em base64
    return Response.json({
      imageBase64: base64Image,
      filename: `mapa-rota-${distanciaKm || 0}km.png`
    });

  } catch (error) {
    console.error("Erro ao gerar mapa:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});