import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Criar tabela base
    const tabela = await base44.asServiceRole.entities.TabelaPreco.create({
      empresa_id: user.empresa_id,
      nome: "Tabela São Luis - COA",
      codigo: "COA-SL-2022",
      descricao: "TABELA DE PREÇOS - RODOVIÁRIO SÃO LUIS - TRANSUL (Coletas Planta de São Luis)",
      tipo_tabela: "peso_km",
      vigencia_inicio: "2022-06-01",
      vigencia_fim: "2024-05-31",
      tipos_aplicacao: ["coleta"],
      unidade_cobranca: "viagem",
      colunas_km: [
        { letra: "A", km_min: 0, km_max: 100 },
        { letra: "B", km_min: 100.01, km_max: 200 },
        { letra: "C", km_min: 200.01, km_max: 400 },
        { letra: "D", km_min: 400.01, km_max: 600 },
        { letra: "E", km_min: 600.01, km_max: 800 },
        { letra: "F", km_min: 800.01, km_max: 1000 },
        { letra: "G", km_min: 1000.01, km_max: 1200 }
      ],
      frete_minimo: 0,
      observacoes: "CROSSDOCKING - Nestes valores já estão inclusos os custos de recebimento, armazenagem temporária, movimentação e carregamento. Reajustes: 12% em 30/04/2021, Diesel 12,95% em 06/12/2021, Diesel 8,56% em 01/04/2022, 10,26% em 01/06/2022, Diesel 3,38% em 15/07/2022, Pedágio em 22/11/2022, Diesel -4,84% em 20/02/2023, Pedágio em 21/10/2023, -8% em 12/12/2023, Ad valorem e GRIS em 01/07/2024",
      ativo: true
    });

    // Dados das faixas conforme o PDF (página 2)
    const faixas = [
      { peso_min: 0, peso_max: 50, A: 256.27, B: 407.72, C: 582.45, D: 921.03, E: 1153.17, F: 1371.01, G: 1629.80, unidade: "viagem" },
      { peso_min: 50.01, peso_max: 100, A: 256.27, B: 407.72, C: 582.45, D: 1026.29, E: 1153.17, F: 1371.01, G: 1629.80, unidade: "viagem" },
      { peso_min: 100.01, peso_max: 200, A: 276.76, B: 419.37, C: 605.75, D: 1118.39, E: 1258.10, F: 1491.08, G: 1724.06, unidade: "viagem" },
      { peso_min: 200.01, peso_max: 400, A: 276.76, B: 419.37, C: 617.40, D: 1144.71, E: 1281.39, F: 1526.02, G: 1759.00, unidade: "viagem" },
      { peso_min: 400.01, peso_max: 600, A: 407.72, B: 582.45, C: 931.92, D: 1280.96, E: 1486.51, F: 1607.57, G: 1968.69, unidade: "viagem" },
      { peso_min: 600.01, peso_max: 800, A: 407.72, B: 582.45, C: 955.27, D: 1280.96, E: 1486.51, F: 1619.22, G: 1991.98, unidade: "viagem" },
      { peso_min: 800.01, peso_max: 1000, A: 582.45, B: 757.19, C: 966.87, D: 1280.96, E: 1486.51, F: 1642.51, G: 2038.58, unidade: "viagem" },
      { peso_min: 1000.01, peso_max: 3000, A: 943.57, B: 1048.41, C: 1572.62, D: 2118.37, E: 2574.44, F: 3156.89, G: 3366.57, unidade: "viagem" },
      { peso_min: 3000.01, peso_max: 6000, A: 966.87, B: 1071.71, C: 1572.62, D: 2144.69, E: 2621.03, F: 3203.48, G: 3436.46, unidade: "viagem" },
      { peso_min: 6000.01, peso_max: 999999, A: 147.09, B: 173.94, C: 194.66, D: 264.49, E: 408.11, F: 428.82, G: 602.76, unidade: "tonelada" }
    ];

    // Criar itens da tabela
    let ordem = 1;
    for (const faixa of faixas) {
      await base44.asServiceRole.entities.TabelaPrecoItem.create({
        tabela_preco_id: tabela.id,
        faixa_peso_min: faixa.peso_min,
        faixa_peso_max: faixa.peso_max,
        valores_colunas: {
          A: faixa.A,
          B: faixa.B,
          C: faixa.C,
          D: faixa.D,
          E: faixa.E,
          F: faixa.F,
          G: faixa.G
        },
        unidade: faixa.unidade,
        ordem: ordem++
      });
    }

    return Response.json({
      success: true,
      message: "Tabela COA São Luis importada com sucesso!",
      tabela_id: tabela.id,
      total_faixas: faixas.length
    });

  } catch (error) {
    console.error("Erro ao importar tabela:", error);
    return Response.json({ 
      error: error.message,
      details: error.toString()
    }, { status: 500 });
  }
});