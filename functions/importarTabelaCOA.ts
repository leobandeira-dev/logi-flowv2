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
      tipo_aplicacao: "coleta",
      unidade_cobranca: "viagem",
      frete_minimo: 0,
      observacoes: "CROSSDOCKING - Nestes valores já estão inclusos os custos de recebimento, armazenagem temporária, movimentação e carregamento. Reajustes: 12% em 30/04/2021, Diesel 12,95% em 06/12/2021, Diesel 8,56% em 01/04/2022, 10,26% em 01/06/2022, Diesel 3,38% em 15/07/2022, Pedágio em 22/11/2022, Diesel -4,84% em 20/02/2023, Pedágio em 21/10/2023, -8% em 12/12/2023, Ad valorem e GRIS em 01/07/2024",
      ativo: true
    });

    // Dados das faixas conforme o PDF
    const faixas = [
      { desc: "0 a 50 kg", peso_min: 0, peso_max: 50, a: 256.27, b: 407.72, c: 582.45, d: 921.03, e: 1153.17, f: 1371.01, g: 1629.80, unidade: "viagem" },
      { desc: "50,01 a 100 kg", peso_min: 50.01, peso_max: 100, a: 256.27, b: 407.72, c: 582.45, d: 1026.29, e: 1153.17, f: 1371.01, g: 1629.80, unidade: "viagem" },
      { desc: "100,01 a 200 kg", peso_min: 100.01, peso_max: 200, a: 276.76, b: 419.37, c: 605.75, d: 1118.39, e: 1258.10, f: 1491.08, g: 1724.06, unidade: "viagem" },
      { desc: "200,01 a 400 kg", peso_min: 200.01, peso_max: 400, a: 276.76, b: 419.37, c: 617.40, d: 1144.71, e: 1281.39, f: 1526.02, g: 1759.00, unidade: "viagem" },
      { desc: "400,01 a 600 kg", peso_min: 400.01, peso_max: 600, a: 407.72, b: 582.45, c: 931.92, d: 1280.96, e: 1486.51, f: 1607.57, g: 1968.69, unidade: "viagem" },
      { desc: "600,01 a 800 kg", peso_min: 600.01, peso_max: 800, a: 407.72, b: 582.45, c: 955.27, d: 1280.96, e: 1486.51, f: 1619.22, g: 1991.98, unidade: "viagem" },
      { desc: "800,01 a 1.000 kg", peso_min: 800.01, peso_max: 1000, a: 582.45, b: 757.19, c: 966.87, d: 1280.96, e: 1486.51, f: 1642.51, g: 2038.58, unidade: "viagem" },
      { desc: "1.000,01 a 3.000 kg", peso_min: 1000.01, peso_max: 3000, a: 943.57, b: 1048.41, c: 1572.62, d: 2118.37, e: 2574.44, f: 3156.89, g: 3366.57, unidade: "viagem" },
      { desc: "3.000,01 a 6.000 kg", peso_min: 3000.01, peso_max: 6000, a: 966.87, b: 1071.71, c: 1572.62, d: 2144.69, e: 2621.03, f: 3203.48, g: 3436.46, unidade: "viagem" },
      { desc: "acima de 6.000 kg", peso_min: 6000.01, peso_max: 999999, a: 147.09, b: 173.94, c: 194.66, d: 264.49, e: 408.11, f: 428.82, g: 602.76, unidade: "tonelada" }
    ];

    // Criar itens da tabela
    let ordem = 1;
    for (const faixa of faixas) {
      await base44.asServiceRole.entities.TabelaPrecoItem.create({
        tabela_preco_id: tabela.id,
        descricao_faixa: faixa.desc,
        faixa_peso_min: faixa.peso_min,
        faixa_peso_max: faixa.peso_max,
        faixa_km_min: 0,
        faixa_km_max: 1200,
        col_a: faixa.a,  // até 100 km
        col_b: faixa.b,  // 100-200 km
        col_c: faixa.c,  // 200-400 km
        col_d: faixa.d,  // 400-600 km
        col_e: faixa.e,  // 600-800 km
        col_f: faixa.f,  // 800-1000 km
        col_g: faixa.g,  // 1000-1200 km
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