import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const {
      tabela_id,
      peso_kg,
      distancia_km,
      valor_nf,
      tipo_ordem,
      origem,
      destino,
      eixos_veiculo
    } = await req.json();

    if (!tabela_id) {
      return Response.json({ error: 'ID da tabela é obrigatório' }, { status: 400 });
    }

    // Buscar tabela
    const tabelasResult = await base44.entities.TabelaPreco.filter({ id: tabela_id });
    if (!tabelasResult || tabelasResult.length === 0) {
      return Response.json({ error: 'Tabela não encontrada' }, { status: 404 });
    }
    const tabela = tabelasResult[0];

    // Verificar se tabela está ativa
    if (!tabela.ativo) {
      return Response.json({ error: 'Tabela inativa' }, { status: 400 });
    }

    // Verificar aplicação
    if (tabela.tipos_aplicacao && tabela.tipos_aplicacao.length > 0) {
      if (!tabela.tipos_aplicacao.includes('todos') && !tabela.tipos_aplicacao.includes(tipo_ordem)) {
        return Response.json({ error: `Tabela não se aplica ao tipo ${tipo_ordem}` }, { status: 400 });
      }
    }

    let valorFreteBase = 0;
    let detalhesCalculo = {};

    // CÁLCULO DO FRETE BASE conforme tipo da tabela
    if (tabela.tipo_tabela === 'peso_km') {
      // Buscar item da tabela baseado em peso e distância
      const itens = await base44.entities.TabelaPrecoItem.filter(
        { tabela_preco_id: tabela_id }
      );

      // Encontrar faixa de peso
      const itemPeso = itens.find(item => {
        const minOk = item.faixa_peso_min === null || peso_kg >= item.faixa_peso_min;
        const maxOk = item.faixa_peso_max === null || peso_kg <= item.faixa_peso_max;
        return minOk && maxOk;
      });

      if (!itemPeso) {
        return Response.json({ 
          error: 'Peso fora das faixas configuradas na tabela',
          peso_kg,
          faixas_disponiveis: itens.map(i => ({ min: i.faixa_peso_min, max: i.faixa_peso_max }))
        }, { status: 400 });
      }

      // Encontrar coluna de KM
      const colunaKm = tabela.colunas_km?.find(col => {
        return distancia_km >= col.km_min && distancia_km < col.km_max;
      });

      if (!colunaKm) {
        return Response.json({ 
          error: 'Distância fora das faixas configuradas',
          distancia_km,
          colunas_disponiveis: tabela.colunas_km
        }, { status: 400 });
      }

      // Obter valor da célula
      const valorCelula = itemPeso.valores_colunas?.[colunaKm.letra];
      
      if (valorCelula === null || valorCelula === undefined) {
        return Response.json({ 
          error: `Valor não configurado para Peso ${peso_kg}kg e Faixa ${colunaKm.letra}`,
          faixa_peso: { min: itemPeso.faixa_peso_min, max: itemPeso.faixa_peso_max },
          faixa_km: colunaKm
        }, { status: 400 });
      }

      valorFreteBase = valorCelula;
      detalhesCalculo = {
        tipo_calculo: 'peso_km',
        faixa_peso: { min: itemPeso.faixa_peso_min, max: itemPeso.faixa_peso_max },
        faixa_km: colunaKm,
        valor_tabela: valorCelula
      };

    } else if (tabela.tipo_tabela === 'peso') {
      // Por peso apenas
      const itens = await base44.entities.TabelaPrecoItem.filter({ tabela_preco_id: tabela_id });
      const item = itens.find(i => {
        const minOk = i.faixa_peso_min === null || peso_kg >= i.faixa_peso_min;
        const maxOk = i.faixa_peso_max === null || peso_kg <= i.faixa_peso_max;
        return minOk && maxOk;
      });

      if (!item || !item.valores_colunas?.A) {
        return Response.json({ error: 'Peso fora das faixas ou valor não configurado' }, { status: 400 });
      }

      valorFreteBase = item.valores_colunas.A;
      detalhesCalculo = {
        tipo_calculo: 'peso',
        faixa_peso: { min: item.faixa_peso_min, max: item.faixa_peso_max },
        valor_tabela: item.valores_colunas.A
      };

    } else if (tabela.tipo_tabela === 'percentual_nf') {
      // Percentual sobre nota fiscal
      if (!valor_nf) {
        return Response.json({ error: 'Valor da NF é obrigatório para tipo percentual_nf' }, { status: 400 });
      }
      const itens = await base44.entities.TabelaPrecoItem.filter({ tabela_preco_id: tabela_id });
      if (!itens[0]?.valores_colunas?.A) {
        return Response.json({ error: 'Percentual não configurado na tabela' }, { status: 400 });
      }

      const percentual = itens[0].valores_colunas.A;
      valorFreteBase = (valor_nf * percentual) / 100;
      detalhesCalculo = {
        tipo_calculo: 'percentual_nf',
        percentual,
        valor_nf,
        valor_calculado: valorFreteBase
      };

    } else if (tabela.tipo_tabela === 'valor_fixo') {
      // Valor fixo
      const itens = await base44.entities.TabelaPrecoItem.filter({ tabela_preco_id: tabela_id });
      if (!itens[0]?.valores_colunas?.A) {
        return Response.json({ error: 'Valor fixo não configurado' }, { status: 400 });
      }
      
      valorFreteBase = itens[0].valores_colunas.A;
      detalhesCalculo = {
        tipo_calculo: 'valor_fixo',
        valor_tabela: valorFreteBase
      };
    }

    // INÍCIO DO CÁLCULO COMPLETO COM TAXAS E IMPOSTOS
    let breakdown = {
      frete_base: valorFreteBase
    };

    let subtotal = valorFreteBase;

    // 1. TAXAS FIXAS (somadas ao frete base)
    const taxasFixas = {};

    if (tabela.tde && tabela.tde > 0) {
      taxasFixas.tde = tabela.tde;
      subtotal += tabela.tde;
    }

    if (tabela.taxa_coleta && tabela.taxa_coleta > 0 && tipo_ordem === 'coleta') {
      taxasFixas.taxa_coleta = tabela.taxa_coleta;
      subtotal += tabela.taxa_coleta;
    }

    if (tabela.taxa_entrega && tabela.taxa_entrega > 0 && tipo_ordem === 'entrega') {
      taxasFixas.taxa_entrega = tabela.taxa_entrega;
      subtotal += tabela.taxa_entrega;
    }

    if (tabela.taxa_redespacho && tabela.taxa_redespacho > 0) {
      taxasFixas.redespacho = tabela.taxa_redespacho;
      subtotal += tabela.taxa_redespacho;
    }

    breakdown.taxas_fixas = taxasFixas;
    breakdown.subtotal_apos_taxas_fixas = subtotal;

    // 2. PEDÁGIO (pode ser fixo, percentual, por eixo ou kg por veículo)
    let pedagio = 0;
    if (tabela.pedagio && tabela.pedagio > 0) {
      if (tabela.tipo_pedagio === 'fixo') {
        pedagio = tabela.pedagio;
      } else if (tabela.tipo_pedagio === 'percentual') {
        pedagio = (subtotal * tabela.pedagio) / 100;
      } else if (tabela.tipo_pedagio === 'por_eixo') {
        pedagio = (eixos_veiculo || 5) * tabela.pedagio;
      } else if (tabela.tipo_pedagio === 'kg_por_veiculo') {
        pedagio = (peso_kg || 0) * tabela.pedagio;
      }
      
      breakdown.pedagio = {
        tipo: tabela.tipo_pedagio,
        valor_configurado: tabela.pedagio,
        valor_calculado: pedagio
      };
      subtotal += pedagio;
    }

    breakdown.subtotal_apos_pedagio = subtotal;

    // 3. TAXAS PERCENTUAIS (calculadas sobre subtotal)
    const taxasPercentuais = {};

    if (tabela.gris && tabela.gris > 0 && valor_nf) {
      const gris = (valor_nf * tabela.gris) / 100;
      taxasPercentuais.gris = gris;
      subtotal += gris;
    }

    if (tabela.ad_valorem && tabela.ad_valorem > 0 && valor_nf) {
      const adValorem = (valor_nf * tabela.ad_valorem) / 100;
      taxasPercentuais.ad_valorem = adValorem;
      subtotal += adValorem;
    }

    if (tabela.seguro && tabela.seguro > 0 && valor_nf) {
      const seguro = (valor_nf * tabela.seguro) / 100;
      taxasPercentuais.seguro = seguro;
      subtotal += seguro;
    }

    if (tabela.generalidades && tabela.generalidades > 0) {
      const generalidades = (subtotal * tabela.generalidades) / 100;
      taxasPercentuais.generalidades = generalidades;
      subtotal += generalidades;
    }

    if (tabela.reembarque && tabela.reembarque > 0) {
      const reembarque = (subtotal * tabela.reembarque) / 100;
      taxasPercentuais.reembarque = reembarque;
      subtotal += reembarque;
    }

    if (tabela.devolucao && tabela.devolucao > 0) {
      const devolucao = (subtotal * tabela.devolucao) / 100;
      taxasPercentuais.devolucao = devolucao;
      subtotal += devolucao;
    }

    breakdown.taxas_percentuais = taxasPercentuais;
    breakdown.subtotal_apos_taxas_percentuais = subtotal;

    // 4. DESCONTO
    let desconto = 0;
    if (tabela.desconto && tabela.desconto > 0) {
      desconto = (subtotal * tabela.desconto) / 100;
      breakdown.desconto = desconto;
      subtotal -= desconto;
    }

    breakdown.subtotal_apos_desconto = subtotal;

    // 5. ICMS e PIS/COFINS (lógica de inclusão)
    let icms = 0;
    let pisCofins = 0;

    // ICMS: Se adicionar_icms = true, calcula frete / (1 - icms%)
    if (tabela.icms && tabela.icms > 0) {
      if (tabela.adicionar_icms) {
        // Incluir ICMS: recalcular base para que o ICMS seja adicional
        const percentualIcms = tabela.icms / 100;
        const novoSubtotal = subtotal / (1 - percentualIcms);
        icms = novoSubtotal - subtotal;
        subtotal = novoSubtotal;
      } else {
        // Apenas destacar ICMS do valor total (não altera subtotal)
        icms = (subtotal * tabela.icms) / 100;
      }
    }

    // PIS/COFINS: Se incluir_pis_cofins = true, adiciona ao frete
    if (tabela.pis_cofins && tabela.pis_cofins > 0) {
      if (tabela.incluir_pis_cofins) {
        const percentualPis = tabela.pis_cofins / 100;
        const novoSubtotal = subtotal / (1 - percentualPis);
        pisCofins = novoSubtotal - subtotal;
        subtotal = novoSubtotal;
      } else {
        // Apenas destacar
        pisCofins = (subtotal * tabela.pis_cofins) / 100;
      }
    }

    breakdown.icms = {
      percentual: tabela.icms || 0,
      adicionar: tabela.adicionar_icms || false,
      valor_calculado: icms
    };

    breakdown.pis_cofins = {
      percentual: tabela.pis_cofins || 0,
      incluir: tabela.incluir_pis_cofins || false,
      valor_calculado: pisCofins
    };

    breakdown.subtotal_com_impostos = subtotal;

    // 6. FRETE MÍNIMO (com regras de desconsideração)
    let valorFinal = subtotal;
    let aplicouFreteMinimo = false;

    if (tabela.frete_minimo && tabela.frete_minimo > 0) {
      if (subtotal < tabela.frete_minimo) {
        aplicouFreteMinimo = true;

        // Se desconsiderar_impostos_frete_minimo = true, não recalcular ICMS/PIS
        if (tabela.desconsiderar_impostos_frete_minimo) {
          // Apenas usar o frete mínimo direto
          valorFinal = tabela.frete_minimo;
          
          breakdown.frete_minimo_aplicado = {
            aplicado: true,
            valor_minimo: tabela.frete_minimo,
            desconsiderou_impostos: true,
            icms_recalculado: 0,
            pis_cofins_recalculado: 0
          };
        } else {
          // Recalcular impostos sobre o frete mínimo
          let valorMinimo = tabela.frete_minimo;
          let icmsRecalc = 0;
          let pisRecalc = 0;

          if (tabela.icms && tabela.icms > 0 && tabela.adicionar_icms) {
            const percentualIcms = tabela.icms / 100;
            const novoValor = valorMinimo / (1 - percentualIcms);
            icmsRecalc = novoValor - valorMinimo;
            valorMinimo = novoValor;
          }

          if (tabela.pis_cofins && tabela.pis_cofins > 0 && tabela.incluir_pis_cofins) {
            const percentualPis = tabela.pis_cofins / 100;
            const novoValor = valorMinimo / (1 - percentualPis);
            pisRecalc = novoValor - valorMinimo;
            valorMinimo = novoValor;
          }

          valorFinal = valorMinimo;
          
          breakdown.frete_minimo_aplicado = {
            aplicado: true,
            valor_minimo: tabela.frete_minimo,
            desconsiderou_impostos: false,
            icms_recalculado: icmsRecalc,
            pis_cofins_recalculado: pisRecalc,
            valor_final_com_impostos: valorMinimo
          };
        }

        // DESCONSIDERAR ITENS NO FRETE MÍNIMO
        if (tabela.desconsiderar_no_frete_minimo && tabela.desconsiderar_no_frete_minimo.length > 0) {
          let valorDescontar = 0;
          const itensDesconsiderados = {};

          tabela.desconsiderar_no_frete_minimo.forEach(item => {
            if (item === 'gris' && taxasPercentuais.gris) {
              valorDescontar += taxasPercentuais.gris;
              itensDesconsiderados.gris = taxasPercentuais.gris;
            }
            if (item === 'pedagio' && breakdown.pedagio?.valor_calculado) {
              valorDescontar += breakdown.pedagio.valor_calculado;
              itensDesconsiderados.pedagio = breakdown.pedagio.valor_calculado;
            }
            if (item === 'seguro' && taxasPercentuais.seguro) {
              valorDescontar += taxasPercentuais.seguro;
              itensDesconsiderados.seguro = taxasPercentuais.seguro;
            }
            if (item === 'redespacho' && taxasFixas.redespacho) {
              valorDescontar += taxasFixas.redespacho;
              itensDesconsiderados.redespacho = taxasFixas.redespacho;
            }
            if (item === 'tde' && taxasFixas.tde) {
              valorDescontar += taxasFixas.tde;
              itensDesconsiderados.tde = taxasFixas.tde;
            }
          });

          valorFinal += valorDescontar;
          breakdown.frete_minimo_aplicado.itens_desconsiderados = itensDesconsiderados;
          breakdown.frete_minimo_aplicado.valor_readicionado = valorDescontar;
        }
      }
    }

    breakdown.valor_final = valorFinal;

    // CÁLCULO DO PRAZO DE ENTREGA
    let prazoEntrega = null;
    if (tabela.prazo_entrega_dias && tabela.prazo_entrega_dias > 0) {
      const dataBase = new Date();
      let diasAdicionados = 0;
      let dataFinal = new Date(dataBase);

      if (tabela.tipo_prazo === 'uteis') {
        // Adicionar apenas dias úteis (seg-sex)
        while (diasAdicionados < tabela.prazo_entrega_dias) {
          dataFinal.setDate(dataFinal.getDate() + 1);
          const diaSemana = dataFinal.getDay();
          // 0 = domingo, 6 = sábado
          if (diaSemana !== 0 && diaSemana !== 6) {
            diasAdicionados++;
          }
        }
      } else {
        // Dias corridos
        dataFinal.setDate(dataFinal.getDate() + tabela.prazo_entrega_dias);
      }

      prazoEntrega = {
        dias: tabela.prazo_entrega_dias,
        tipo: tabela.tipo_prazo,
        data_prevista: dataFinal.toISOString()
      };
    }

    return Response.json({
      sucesso: true,
      tabela: {
        id: tabela.id,
        nome: tabela.nome,
        tipo: tabela.tipo_tabela
      },
      valores: {
        frete_base: valorFreteBase,
        taxas_aplicadas: {
          ...taxasFixas,
          ...taxasPercentuais,
          pedagio: breakdown.pedagio?.valor_calculado || 0,
          desconto: desconto
        },
        icms: {
          percentual: tabela.icms || 0,
          foi_adicionado: tabela.adicionar_icms || false,
          valor: icms
        },
        pis_cofins: {
          percentual: tabela.pis_cofins || 0,
          foi_incluido: tabela.incluir_pis_cofins || false,
          valor: pisCofins
        },
        frete_minimo_aplicado: aplicouFreteMinimo,
        valor_final: valorFinal
      },
      prazo_entrega: prazoEntrega,
      breakdown_completo: breakdown
    });

  } catch (error) {
    console.error("Erro ao calcular frete:", error);
    return Response.json({ 
      error: error.message,
      stack: error.stack 
    }, { status: 500 });
  }
});