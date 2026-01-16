import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { origem, destino, tabelaPrecoId } = await req.json();
    
    if (!origem || !destino) {
      return Response.json({ 
        error: 'Origem e destino são obrigatórios' 
      }, { status: 400 });
    }

    // Se tabelaPrecoId foi fornecido, buscar a configuração de tipo_distancia
    let origemParaCalculo = origem;
    let destinoParaCalculo = destino;
    let tipoDistanciaUsado = 'emitente_destinatario';
    
    if (tabelaPrecoId) {
      try {
        const tabelasPreco = await base44.asServiceRole.entities.TabelaPreco.filter({ id: tabelaPrecoId });
        
        if (tabelasPreco.length > 0) {
          const tabela = tabelasPreco[0];
          const tipoDistancia = tabela.tipo_distancia || 'emitente_destinatario';
          tipoDistanciaUsado = tipoDistancia;
          
          // Se a configuração requer operador logístico, buscar dados da empresa
          if (tipoDistancia === 'emitente_operador' || tipoDistancia === 'operador_destinatario') {
            const empresa = await base44.asServiceRole.entities.Empresa.get(user.empresa_id);
            
            const enderecoOperador = [
              empresa.endereco,
              empresa.cidade,
              empresa.estado,
              'Brazil'
            ].filter(Boolean).join(', ');
            
            if (tipoDistancia === 'emitente_operador') {
              // Origem: Emitente, Destino: Operador Logístico
              origemParaCalculo = origem;
              destinoParaCalculo = enderecoOperador;
            } else if (tipoDistancia === 'operador_destinatario') {
              // Origem: Operador Logístico, Destino: Destinatário
              origemParaCalculo = enderecoOperador;
              destinoParaCalculo = destino;
            }
          }
          // Se tipo_distancia é 'emitente_destinatario', mantém origem e destino originais
        }
      } catch (error) {
        console.error("Erro ao buscar configuração da tabela:", error);
        // Em caso de erro, continua com origem e destino originais
      }
    }

    const apiKey = Deno.env.get("GOOGLE");
    
    if (!apiKey) {
      return Response.json({ 
        error: 'Chave da API do Google não configurada' 
      }, { status: 500 });
    }

    // Chamar Google Distance Matrix API
    const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${encodeURIComponent(origemParaCalculo)}&destinations=${encodeURIComponent(destinoParaCalculo)}&key=${apiKey}`;
    
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
      destino_endereco: data.destination_addresses[0],
      tipo_distancia_usado: tipoDistanciaUsado
    });
    
  } catch (error) {
    console.error("Erro ao calcular distância:", error);
    return Response.json({ 
      error: error.message 
    }, { status: 500 });
  }
});