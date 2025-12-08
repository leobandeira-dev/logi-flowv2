import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { 
      cpf_motorista, 
      placa_veiculo, 
      tipo_carga, 
      valor_carga,
      origem_uf,
      origem_cidade,
      destino_uf,
      destino_cidade,
      produto,
      is_carreteiro
    } = await req.json();
    
    if (!cpf_motorista || !placa_veiculo) {
      return Response.json({ 
        error: 'CPF do motorista e placa do veículo são obrigatórios' 
      }, { status: 400 });
    }

    const buonnyToken = Deno.env.get("BUONNY_TOKEN");
    const buonnyCnpj = Deno.env.get("BUONNY_CNPJ");
    
    if (!buonnyToken || !buonnyCnpj) {
      return Response.json({ 
        error: 'Credenciais Buonny não configuradas (BUONNY_TOKEN e BUONNY_CNPJ)' 
      }, { status: 500 });
    }

    // Limpar e formatar valores
    const cpfLimpo = cpf_motorista.replace(/\D/g, '');
    const placaFormatada = placa_veiculo.replace(/[^A-Z0-9]/gi, '').toUpperCase();
    const valorFormatado = parseFloat(valor_carga || 0).toFixed(2);

    // Construir XML SOAP conforme especificação do WSDL
    const soapEnvelope = `<?xml version="1.0" encoding="UTF-8"?>
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:tns="https://tstportal.buonny.com.br/portal/wsdl/consulta_profissional">
  <soapenv:Header/>
  <soapenv:Body>
    <tns:consulta>
      <tns:cnpj_cliente>${buonnyCnpj}</tns:cnpj_cliente>
      <tns:autenticacao>
        <tns:token>${buonnyToken}</tns:token>
      </tns:autenticacao>
      <tns:produto>${produto || '1'}</tns:produto>
      <tns:profissional>
        <tns:documento>${cpfLimpo}</tns:documento>
        <tns:carreteiro>${is_carreteiro ? 'S' : 'N'}</tns:carreteiro>
      </tns:profissional>
      <tns:veiculos>
        <tns:placa>${placaFormatada}</tns:placa>
      </tns:veiculos>
      <tns:carga_tipo>${tipo_carga || '1'}</tns:carga_tipo>
      <tns:carga_valor>${valorFormatado}</tns:carga_valor>
      <tns:pais_origem>0</tns:pais_origem>
      <tns:uf_origem>${origem_uf || 'SP'}</tns:uf_origem>
      <tns:cidade_origem>${origem_cidade || 'SAO PAULO'}</tns:cidade_origem>
      <tns:pais_destino>0</tns:pais_destino>
      <tns:uf_destino>${destino_uf || 'SP'}</tns:uf_destino>
      <tns:cidade_destino>${destino_cidade || 'SAO PAULO'}</tns:cidade_destino>
    </tns:consulta>
  </soapenv:Body>
</soapenv:Envelope>`;

    console.log('Enviando requisição SOAP para Buonny...');

    // Chamar endpoint SOAP correto (ambiente de homologação)
    const response = await fetch('https://tstportal.buonny.com.br/portal/soap/consulta_profissional_soap', {
      method: 'POST',
      headers: {
        'Content-Type': 'text/xml; charset=utf-8',
        'SOAPAction': ''
      },
      body: soapEnvelope
    });
    
    const responseText = await response.text();
    console.log('Resposta Buonny:', responseText);
    
    if (!response.ok) {
      return Response.json({ 
        error: `Erro na API Buonny: ${response.status}`,
        details: responseText
      }, { status: 400 });
    }

    // Parse XML response
    const consultaMatch = responseText.match(/<consulta>(.*?)<\/consulta>/s);
    const statusMatch = responseText.match(/<status>(.*?)<\/status>/s);
    const mensagemMatch = responseText.match(/<mensagem>(.*?)<\/mensagem>/s);
    const validadeMatch = responseText.match(/<validade>(.*?)<\/validade>/s);
    const consultasAdequadasMatch = responseText.match(/<consultas_adequadas_ultimos_12_meses>(.*?)<\/consultas_adequadas_ultimos_12_meses>/s);

    return Response.json({
      success: true,
      numero_liberacao: consultaMatch ? consultaMatch[1].trim() : null,
      status: statusMatch ? statusMatch[1].trim() : 'ERRO AO PROCESSAR',
      mensagem: mensagemMatch ? mensagemMatch[1].trim() : '',
      validade: validadeMatch ? validadeMatch[1].trim() : '',
      consultas_adequadas_12_meses: consultasAdequadasMatch ? consultasAdequadasMatch[1].trim() : null,
      xml_completo: responseText
    });
    
  } catch (error) {
    console.error("Erro ao consultar Buonny:", error);
    return Response.json({ 
      error: error.message 
    }, { status: 500 });
  }
});