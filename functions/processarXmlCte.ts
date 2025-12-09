import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';
import { DOMParser } from 'npm:xmldom@0.6.0';

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

    // Parse do XML
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlContent, 'text/xml');

    // Extrair dados principais do CT-e
    const chave = xmlDoc.querySelector('infCte')?.getAttribute('Id')?.replace('CTe', '') || '';
    const numeroCte = xmlDoc.querySelector('nCT')?.textContent || '';
    const serieCte = xmlDoc.querySelector('serie')?.textContent || '';
    const dataEmissao = xmlDoc.querySelector('dhEmi')?.textContent || '';

    // Emitente
    const emitenteCnpj = xmlDoc.querySelector('emit CNPJ')?.textContent || '';
    const emitenteNome = xmlDoc.querySelector('emit xNome')?.textContent || '';

    // Remetente
    const remetenteCnpj = xmlDoc.querySelector('rem CNPJ')?.textContent || '';
    const remetenteNome = xmlDoc.querySelector('rem xNome')?.textContent || '';

    // Destinatário
    const destinatarioCnpj = xmlDoc.querySelector('dest CNPJ')?.textContent || '';
    const destinatarioNome = xmlDoc.querySelector('dest xNome')?.textContent || '';

    // Localidades
    const municipioOrigem = xmlDoc.querySelector('xMunIni')?.textContent || '';
    const ufOrigem = xmlDoc.querySelector('UFIni')?.textContent || '';
    const municipioDestino = xmlDoc.querySelector('xMunFim')?.textContent || '';
    const ufDestino = xmlDoc.querySelector('UFFim')?.textContent || '';

    // Valores
    const valorTotal = parseFloat(xmlDoc.querySelector('vTPrest')?.textContent || '0');
    const valorReceber = parseFloat(xmlDoc.querySelector('vRec')?.textContent || '0');

    // Carga
    const pesoTotal = parseFloat(xmlDoc.querySelector('infQ qCarga')?.textContent || '0');
    const quantidadeVolumes = parseFloat(
      Array.from(xmlDoc.querySelectorAll('infQ'))
        .find(el => el.querySelector('tpMed')?.textContent === 'UNIDADE')
        ?.querySelector('qCarga')?.textContent || '0'
    );

    // Chaves de NF-e vinculadas
    const chavesNfe = Array.from(xmlDoc.querySelectorAll('infNFe chave'))
      .map(el => el.textContent?.trim())
      .filter(Boolean);

    // Protocolo
    const protocoloAutorizacao = xmlDoc.querySelector('protCTe nProt')?.textContent || '';
    const statusSefaz = xmlDoc.querySelector('protCTe cStat')?.textContent || '';

    // Outras informações
    const cfop = xmlDoc.querySelector('CFOP')?.textContent || '';
    const naturezaOperacao = xmlDoc.querySelector('natOp')?.textContent || '';
    const modal = xmlDoc.querySelector('modal')?.textContent || '';
    const tipoServico = xmlDoc.querySelector('tpServ')?.textContent || '';

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