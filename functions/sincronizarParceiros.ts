import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== "admin") {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Buscar todas as ordens e notas fiscais
    const ordens = await base44.asServiceRole.entities.OrdemDeCarregamento.list();
    const notasFiscais = await base44.asServiceRole.entities.NotaFiscal.list();
    
    // Extrair CNPJs únicos com suas classificações
    const cnpjMap = new Map();
    
    ordens.forEach(ordem => {
      const tipo_operacao = ordem.tipo_operacao || 'FOB';
      const tipo_ordem = ordem.tipo_ordem || 'carregamento';
      
      // Remetente/Cliente (quem envia a carga)
      if (ordem.cliente_cnpj) {
        const cnpj = ordem.cliente_cnpj.replace(/\D/g, '');
        if (cnpj.length === 14) {
          let tipo = 'fornecedor'; // padrão
          
          // Lógica por tipo de ordem
          if (tipo_ordem === 'coleta') {
            tipo = 'fornecedor'; // quem solicita coleta é fornecedor
          } else if (tipo_ordem === 'recebimento') {
            tipo = 'fornecedor'; // quem está enviando para nosso recebimento
          } else {
            // carregamento/entrega: usa tipo_operacao
            tipo = tipo_operacao === 'CIF' ? 'cliente' : 'fornecedor';
          }
          
          if (!cnpjMap.has(cnpj)) {
            cnpjMap.set(cnpj, { 
              cnpj, 
              tipos: new Set([tipo]),
              nomes: new Set([ordem.cliente])
            });
          } else {
            cnpjMap.get(cnpj).tipos.add(tipo);
            if (ordem.cliente) cnpjMap.get(cnpj).nomes.add(ordem.cliente);
          }
        }
      }
      
      // Destinatário (quem recebe a carga)
      if (ordem.destinatario_cnpj) {
        const cnpj = ordem.destinatario_cnpj.replace(/\D/g, '');
        if (cnpj.length === 14) {
          let tipo = 'cliente'; // padrão
          
          // Lógica por tipo de ordem
          if (tipo_ordem === 'coleta') {
            tipo = 'cliente'; // empresa destino da coleta (nós mesmos normalmente)
          } else if (tipo_ordem === 'recebimento') {
            tipo = 'cliente'; // nós que estamos recebendo
          } else if (tipo_ordem === 'entrega') {
            tipo = 'cliente'; // quem recebe a entrega é cliente
          } else {
            // carregamento: usa tipo_operacao
            tipo = tipo_operacao === 'FOB' ? 'cliente' : 'fornecedor';
          }
          
          if (!cnpjMap.has(cnpj)) {
            cnpjMap.set(cnpj, { 
              cnpj, 
              tipos: new Set([tipo]),
              nomes: new Set([ordem.destinatario])
            });
          } else {
            cnpjMap.get(cnpj).tipos.add(tipo);
            if (ordem.destinatario) cnpjMap.get(cnpj).nomes.add(ordem.destinatario);
          }
        }
      }
      
      // Cliente Final (quando especificado)
      if (ordem.cliente_final_cnpj) {
        const cnpj = ordem.cliente_final_cnpj.replace(/\D/g, '');
        if (cnpj.length === 14) {
          if (!cnpjMap.has(cnpj)) {
            cnpjMap.set(cnpj, { 
              cnpj, 
              tipos: new Set(['cliente']),
              nomes: new Set([ordem.cliente_final_nome])
            });
          } else {
            cnpjMap.get(cnpj).tipos.add('cliente');
            if (ordem.cliente_final_nome) cnpjMap.get(cnpj).nomes.add(ordem.cliente_final_nome);
          }
        }
      }
    });

    // Processar CNPJs das notas fiscais
    notasFiscais.forEach(nota => {
      // Emitente (fornecedor/remetente)
      if (nota.emitente_cnpj) {
        const cnpj = nota.emitente_cnpj.replace(/\D/g, '');
        if (cnpj.length === 14) {
          if (!cnpjMap.has(cnpj)) {
            cnpjMap.set(cnpj, { 
              cnpj, 
              tipos: new Set(['fornecedor']),
              nomes: new Set([nota.emitente_razao_social])
            });
          } else {
            cnpjMap.get(cnpj).tipos.add('fornecedor');
            if (nota.emitente_razao_social) cnpjMap.get(cnpj).nomes.add(nota.emitente_razao_social);
          }
        }
      }
      
      // Destinatário (cliente)
      if (nota.destinatario_cnpj) {
        const cnpj = nota.destinatario_cnpj.replace(/\D/g, '');
        if (cnpj.length === 14) {
          if (!cnpjMap.has(cnpj)) {
            cnpjMap.set(cnpj, { 
              cnpj, 
              tipos: new Set(['cliente']),
              nomes: new Set([nota.destinatario_razao_social])
            });
          } else {
            cnpjMap.get(cnpj).tipos.add('cliente');
            if (nota.destinatario_razao_social) cnpjMap.get(cnpj).nomes.add(nota.destinatario_razao_social);
          }
        }
      }
    });

    const resultados = {
      total_cnpjs: cnpjMap.size,
      criados: 0,
      atualizados: 0,
      erros: 0,
      detalhes: []
    };

    // Processar cada CNPJ
    for (const [cnpj, info] of cnpjMap) {
      try {
        // Verificar se já existe
        const parceirosExistentes = await base44.asServiceRole.entities.Parceiro.filter({ cnpj });
        
        // Buscar dados na API Brasil com retry
        let dados = null;
        let tentativas = 0;
        const maxTentativas = 3;
        
        while (tentativas < maxTentativas && !dados) {
          try {
            const apiBrasilUrl = `https://brasilapi.com.br/api/cnpj/v1/${cnpj}`;
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout
            
            const response = await fetch(apiBrasilUrl, { signal: controller.signal });
            clearTimeout(timeoutId);
            
            if (response.ok) {
              dados = await response.json();
            } else if (response.status === 503) {
              tentativas++;
              if (tentativas < maxTentativas) {
                await new Promise(resolve => setTimeout(resolve, 2000 * tentativas)); // backoff exponencial
              }
            } else {
              break; // Erro diferente de 503, não tentar novamente
            }
          } catch (fetchError) {
            tentativas++;
            if (tentativas < maxTentativas) {
              await new Promise(resolve => setTimeout(resolve, 2000 * tentativas));
            }
          }
        }
        
        if (!dados) {
          resultados.erros++;
          resultados.detalhes.push({ cnpj, status: 'erro_api', message: 'API indisponível após tentativas' });
          continue;
        }
        
        // Determinar tipo final
        const tipos = Array.from(info.tipos);
        const tipo = tipos.length > 1 ? 'ambos' : tipos[0];
        
        // Montar dados do parceiro
        const dadosParceiro = {
          cnpj: cnpj,
          razao_social: dados.razao_social || '',
          nome_fantasia: dados.nome_fantasia || Array.from(info.nomes)[0] || '',
          tipo: tipo,
          telefone: dados.ddd_telefone_1 || '',
          email: dados.email || '',
          endereco: dados.logradouro || '',
          numero: dados.numero || '',
          complemento: dados.complemento || '',
          bairro: dados.bairro || '',
          cidade: dados.municipio || '',
          uf: dados.uf || '',
          cep: dados.cep || '',
          inscricao_estadual: '',
          ativo: true
        };
        
        if (parceirosExistentes.length > 0) {
          // Atualizar
          await base44.asServiceRole.entities.Parceiro.update(
            parceirosExistentes[0].id, 
            dadosParceiro
          );
          resultados.atualizados++;
          resultados.detalhes.push({ cnpj, status: 'atualizado', nome: dados.razao_social });
        } else {
          // Criar
          await base44.asServiceRole.entities.Parceiro.create(dadosParceiro);
          resultados.criados++;
          resultados.detalhes.push({ cnpj, status: 'criado', nome: dados.razao_social });
        }
        
        // Aguardar para não sobrecarregar a API
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error) {
        resultados.erros++;
        resultados.detalhes.push({ cnpj, status: 'erro', message: error.message });
      }
    }

    return Response.json({
      success: true,
      resultados
    });
    
  } catch (error) {
    console.error("Erro ao sincronizar parceiros:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});