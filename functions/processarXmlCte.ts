import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { xmlContent, origem = 'upload_manual' } = await req.json();

    if (!xmlContent) {
      return Response.json({ error: 'XML não fornecido' }, { status: 400 });
    }

    // Helper para extrair texto de tags XML
    const getTagValue = (xml, tagName) => {
      const regex = new RegExp(`<${tagName}[^>]*>([^<]*)</${tagName}>`, 'i');
      const match = xml.match(regex);
      return match ? match[1].trim() : '';
    };

    const getAllTagValues = (xml, tagName) => {
      const regex = new RegExp(`<${tagName}[^>]*>([^<]*)</${tagName}>`, 'gi');
      const matches = [...xml.matchAll(regex)];
      return matches.map(m => m[1].trim());
    };

    // Extrair dados principais do CT-e
    const chavMatch = xmlContent.match(/Id="CTe([^"]+)"/i);
    const chave = chavMatch ? chavMatch[1] : '';
    
    const numeroCte = getTagValue(xmlContent, 'nCT');
    const serieCte = getTagValue(xmlContent, 'serie');
    const dataEmissao = getTagValue(xmlContent, 'dhEmi');

    // Emitente
    const emitSection = xmlContent.match(/<emit>(.*?)<\/emit>/s);
    const emitenteCnpj = emitSection ? getTagValue(emitSection[0], 'CNPJ') : '';
    const emitenteNome = emitSection ? getTagValue(emitSection[0], 'xNome') : '';

    // Remetente
    const remSection = xmlContent.match(/<rem>(.*?)<\/rem>/s);
    const remetenteCnpj = remSection ? getTagValue(remSection[0], 'CNPJ') : '';
    const remetenteNome = remSection ? getTagValue(remSection[0], 'xNome') : '';

    // Destinatário
    const destSection = xmlContent.match(/<dest>(.*?)<\/dest>/s);
    const destinatarioCnpj = destSection ? getTagValue(destSection[0], 'CNPJ') : '';
    const destinatarioNome = destSection ? getTagValue(destSection[0], 'xNome') : '';

    // Localidades
    const municipioOrigem = getTagValue(xmlContent, 'xMunIni');
    const ufOrigem = getTagValue(xmlContent, 'UFIni');
    const municipioDestino = getTagValue(xmlContent, 'xMunFim');
    const ufDestino = getTagValue(xmlContent, 'UFFim');

    // Valores
    const valorTotal = parseFloat(getTagValue(xmlContent, 'vTPrest') || '0');
    const valorReceber = parseFloat(getTagValue(xmlContent, 'vRec') || '0');

    // Carga
    const infQs = xmlContent.match(/<infQ>(.*?)<\/infQ>/gs) || [];
    let pesoTotal = 0;
    let quantidadeVolumes = 0;

    for (const infQ of infQs) {
      const tpMed = getTagValue(infQ, 'tpMed');
      const qCarga = parseFloat(getTagValue(infQ, 'qCarga') || '0');
      
      if (tpMed.includes('PESO') || tpMed.includes('BRUTO')) {
        pesoTotal = qCarga;
      } else if (tpMed.includes('UNIDADE')) {
        quantidadeVolumes = qCarga;
      }
    }

    // Chaves de NF-e vinculadas
    const chavesNfe = getAllTagValues(xmlContent, 'chave');

    // Protocolo
    const protocoloAutorizacao = getTagValue(xmlContent, 'nProt');
    const statusSefaz = getTagValue(xmlContent, 'cStat');

    // Outras informações
    const cfop = getTagValue(xmlContent, 'CFOP');
    const naturezaOperacao = getTagValue(xmlContent, 'natOp');
    const modal = getTagValue(xmlContent, 'modal');
    const tipoServico = getTagValue(xmlContent, 'tpServ');

    // Verificar se o CT-e já existe
    const ctesExistentes = await base44.asServiceRole.entities.CTe.filter(
      { chave_cte: chave },
      null,
      1
    );

    if (ctesExistentes.length > 0) {
      return Response.json({ 
        error: 'CT-e já importado anteriormente',
        cte_existente: ctesExistentes[0]
      }, { status: 409 });
    }

    // Buscar notas fiscais no sistema pelas chaves
    const notasFiscaisIds = [];
    if (chavesNfe.length > 0) {
      const todasNotas = await base44.asServiceRole.entities.NotaFiscal.list();
      
      for (const chavaNfe of chavesNfe) {
        const notaEncontrada = todasNotas.find(
          nf => nf.chave_nota_fiscal === chavaNfe
        );
        if (notaEncontrada) {
          notasFiscaisIds.push(notaEncontrada.id);
        }
      }
    }

    // Upload do XML
    const xmlBlob = new Blob([xmlContent], { type: 'application/xml' });
    const xmlFile = new File([xmlBlob], `cte_${numeroCte}_${Date.now()}.xml`);
    const { file_url: xmlUrl } = await base44.asServiceRole.integrations.Core.UploadFile({ file: xmlFile });

    // Criar registro do CT-e
    const cteData = {
      chave_cte: chave,
      numero_cte: numeroCte,
      serie_cte: serieCte,
      data_emissao: dataEmissao,
      emitente_cnpj: emitenteCnpj,
      emitente_nome: emitenteNome,
      remetente_cnpj: remetenteCnpj,
      remetente_nome: remetenteNome,
      destinatario_cnpj: destinatarioCnpj,
      destinatario_nome: destinatarioNome,
      municipio_origem: municipioOrigem,
      uf_origem: ufOrigem,
      municipio_destino: municipioDestino,
      uf_destino: ufDestino,
      valor_total: valorTotal,
      valor_receber: valorReceber,
      peso_total: pesoTotal,
      quantidade_volumes: quantidadeVolumes,
      chaves_nfe_vinculadas: chavesNfe,
      notas_fiscais_ids: notasFiscaisIds,
      xml_content: xmlContent,
      xml_url: xmlUrl,
      protocolo_autorizacao: protocoloAutorizacao,
      status_sefaz: statusSefaz,
      cfop: cfop,
      natureza_operacao: naturezaOperacao,
      modal: modal,
      tipo_servico: tipoServico,
      origem_importacao: origem,
      data_importacao: new Date().toISOString()
    };

    const cte = await base44.asServiceRole.entities.CTe.create(cteData);

    return Response.json({
      success: true,
      cte,
      notas_vinculadas: notasFiscaisIds.length,
      mensagem: `CT-e ${numeroCte} importado com sucesso${notasFiscaisIds.length > 0 ? ` e vinculado a ${notasFiscaisIds.length} nota(s) fiscal(is)` : ''}`
    });

  } catch (error) {
    console.error('Erro ao processar XML do CT-e:', error);
    return Response.json({ 
      error: 'Erro ao processar XML',
      detalhes: error.message 
    }, { status: 500 });
  }
});