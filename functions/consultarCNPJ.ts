import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { cnpj } = await req.json();

    if (!cnpj) {
      return Response.json({ error: 'CNPJ não fornecido' }, { status: 400 });
    }

    // Limpar CNPJ (remover caracteres especiais)
    const cnpjLimpo = cnpj.replace(/\D/g, '');

    if (cnpjLimpo.length !== 14) {
      return Response.json({ error: 'CNPJ inválido' }, { status: 400 });
    }

    // Consultar API Brasil
    const response = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cnpjLimpo}`);

    if (!response.ok) {
      if (response.status === 404) {
        return Response.json({ error: 'CNPJ não encontrado' }, { status: 404 });
      }
      return Response.json({ error: 'Erro ao consultar CNPJ' }, { status: response.status });
    }

    const data = await response.json();

    // Formatar dados para retornar
    const resultado = {
      cnpj: data.cnpj,
      razao_social: data.razao_social || data.nome_fantasia,
      nome_fantasia: data.nome_fantasia,
      telefone: data.ddd_telefone_1 ? `(${data.ddd_telefone_1}) ${data.telefone_1}` : null,
      email: data.email || null,
      endereco_completo: `${data.logradouro}, ${data.numero}${data.complemento ? ' - ' + data.complemento : ''}`,
      logradouro: data.logradouro,
      numero: data.numero,
      complemento: data.complemento,
      bairro: data.bairro,
      cidade: data.municipio,
      uf: data.uf,
      cep: data.cep,
      situacao: data.descricao_situacao_cadastral,
      data_situacao: data.data_situacao_cadastral,
      atividade_principal: data.cnae_fiscal_descricao
    };

    return Response.json(resultado);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});