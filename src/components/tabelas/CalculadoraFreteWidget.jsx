import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calculator, RefreshCw, ChevronDown, ChevronUp, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { calcularFrete } from "@/functions/calcularFrete";

export default function CalculadoraFreteWidget({ 
  onValorCalculado,
  dadosIniciais = {},
  isDark = false 
}) {
  const [tabelas, setTabelas] = useState([]);
  const [tabelaSelecionada, setTabelaSelecionada] = useState(null);
  const [calculando, setCalculando] = useState(false);
  const [resultado, setResultado] = useState(null);
  const [expandido, setExpandido] = useState(true);
  
  const [params, setParams] = useState({
    peso_kg: dadosIniciais.peso || 0,
    distancia_km: dadosIniciais.distancia_km || 0,
    valor_nf: dadosIniciais.valor_nf || 0,
    tipo_ordem: dadosIniciais.tipo_ordem || 'carregamento',
    eixos_veiculo: dadosIniciais.eixos_veiculo || 5
  });

  useEffect(() => {
    loadTabelas();
  }, []);

  useEffect(() => {
    // Atualizar params quando dadosIniciais mudar
    setParams(prev => ({
      ...prev,
      peso_kg: dadosIniciais.peso || prev.peso_kg,
      distancia_km: dadosIniciais.distancia_km || prev.distancia_km,
      valor_nf: dadosIniciais.valor_nf || prev.valor_nf,
      tipo_ordem: dadosIniciais.tipo_ordem || prev.tipo_ordem
    }));
  }, [dadosIniciais]);

  const loadTabelas = async () => {
    try {
      const user = await base44.auth.me();
      const data = await base44.entities.TabelaPreco.filter(
        { empresa_id: user.empresa_id, ativo: true },
        "nome",
        100
      );
      setTabelas(data);
    } catch (error) {
      console.error("Erro ao carregar tabelas:", error);
    }
  };

  const handleCalcular = async () => {
    if (!tabelaSelecionada) {
      toast.error("Selecione uma tabela de preços");
      return;
    }

    setCalculando(true);
    try {
      const response = await calcularFrete({
        tabela_id: tabelaSelecionada,
        peso_kg: params.peso_kg,
        distancia_km: params.distancia_km,
        valor_nf: params.valor_nf,
        tipo_ordem: params.tipo_ordem,
        eixos_veiculo: params.eixos_veiculo
      });

      setResultado(response.data);
      
      // Callback para formulário pai
      if (onValorCalculado) {
        onValorCalculado({
          valor_total_frete: response.data.valores.valor_final,
          prazo_entrega: response.data.prazo_entrega?.data_prevista,
          breakdown: response.data.breakdown_completo,
          tabela_usada: response.data.tabela
        });
      }

      toast.success("Frete calculado com sucesso!");
    } catch (error) {
      console.error("Erro ao calcular frete:", error);
      const errorMsg = error.response?.data?.error || error.message;
      toast.error(errorMsg);
      setResultado(null);
    } finally {
      setCalculando(false);
    }
  };

  const theme = {
    cardBg: isDark ? '#1e293b' : '#ffffff',
    cardBorder: isDark ? '#334155' : '#e5e7eb',
    text: isDark ? '#f1f5f9' : '#111827',
    textMuted: isDark ? '#94a3b8' : '#6b7280',
  };

  return (
    <Card style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}>
      <CardHeader className="cursor-pointer" onClick={() => setExpandido(!expandido)}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calculator className="w-5 h-5 text-blue-600" />
            <CardTitle className="text-lg" style={{ color: theme.text }}>
              Calculadora de Frete
            </CardTitle>
          </div>
          {expandido ? (
            <ChevronUp className="w-5 h-5" style={{ color: theme.textMuted }} />
          ) : (
            <ChevronDown className="w-5 h-5" style={{ color: theme.textMuted }} />
          )}
        </div>
      </CardHeader>
      
      {expandido && (
        <CardContent className="space-y-4">
          {/* Seleção de Tabela */}
          <div>
            <Label style={{ color: theme.text }}>Tabela de Preços *</Label>
            <Select value={tabelaSelecionada} onValueChange={setTabelaSelecionada}>
              <SelectTrigger style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder, color: theme.text }}>
                <SelectValue placeholder="Selecione uma tabela..." />
              </SelectTrigger>
              <SelectContent>
                {tabelas.map(t => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.nome} ({t.tipo_tabela})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Parâmetros */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs" style={{ color: theme.text }}>Peso (kg)</Label>
              <Input
                type="number"
                value={params.peso_kg}
                onChange={(e) => setParams({ ...params, peso_kg: parseFloat(e.target.value) || 0 })}
                style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder, color: theme.text }}
              />
            </div>
            <div>
              <Label className="text-xs" style={{ color: theme.text }}>Distância (km)</Label>
              <Input
                type="number"
                value={params.distancia_km}
                onChange={(e) => setParams({ ...params, distancia_km: parseFloat(e.target.value) || 0 })}
                style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder, color: theme.text }}
              />
            </div>
            <div>
              <Label className="text-xs" style={{ color: theme.text }}>Valor NF (R$)</Label>
              <Input
                type="number"
                value={params.valor_nf}
                onChange={(e) => setParams({ ...params, valor_nf: parseFloat(e.target.value) || 0 })}
                style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder, color: theme.text }}
              />
            </div>
            <div>
              <Label className="text-xs" style={{ color: theme.text }}>Eixos Veículo</Label>
              <Input
                type="number"
                value={params.eixos_veiculo}
                onChange={(e) => setParams({ ...params, eixos_veiculo: parseInt(e.target.value) || 5 })}
                style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder, color: theme.text }}
              />
            </div>
          </div>

          <Button
            onClick={handleCalcular}
            disabled={calculando || !tabelaSelecionada}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            {calculando ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Calculando...
              </>
            ) : (
              <>
                <Calculator className="w-4 h-4 mr-2" />
                Calcular Frete
              </>
            )}
          </Button>

          {/* Resultado */}
          {resultado && (
            <div className="space-y-3 pt-4 border-t" style={{ borderColor: theme.cardBorder }}>
              <div className="flex items-center justify-between">
                <p className="font-semibold" style={{ color: theme.text }}>Valor Total:</p>
                <p className="text-2xl font-bold text-blue-600">
                  R$ {resultado.valores.valor_final.toFixed(2)}
                </p>
              </div>

              {resultado.valores.frete_minimo_aplicado && (
                <div className="bg-yellow-50 dark:bg-yellow-900/20 p-2 rounded border border-yellow-200 dark:border-yellow-800">
                  <p className="text-xs font-semibold text-yellow-800 dark:text-yellow-300 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    Frete mínimo aplicado
                  </p>
                </div>
              )}

              {/* Breakdown detalhado */}
              <details className="text-xs">
                <summary className="cursor-pointer font-semibold" style={{ color: theme.text }}>
                  Ver detalhamento
                </summary>
                <div className="mt-2 space-y-1 pl-3 border-l-2 border-blue-600">
                  <div className="flex justify-between">
                    <span style={{ color: theme.textMuted }}>Frete Base:</span>
                    <span style={{ color: theme.text }}>R$ {resultado.valores.frete_base.toFixed(2)}</span>
                  </div>
                  
                  {Object.entries(resultado.valores.taxas_aplicadas).map(([key, value]) => {
                    if (value > 0) {
                      const labels = {
                        tde: 'TDE',
                        taxa_coleta: 'Taxa Coleta',
                        taxa_entrega: 'Taxa Entrega',
                        redespacho: 'Redespacho',
                        pedagio: 'Pedágio',
                        gris: 'GRIS',
                        ad_valorem: 'Ad Valorem',
                        seguro: 'Seguro',
                        generalidades: 'Generalidades',
                        reembarque: 'Reembarque',
                        devolucao: 'Devolução',
                        desconto: 'Desconto'
                      };
                      
                      return (
                        <div key={key} className="flex justify-between">
                          <span style={{ color: theme.textMuted }}>{labels[key] || key}:</span>
                          <span style={{ color: theme.text }}>
                            {key === 'desconto' ? '-' : '+'}R$ {value.toFixed(2)}
                          </span>
                        </div>
                      );
                    }
                    return null;
                  })}

                  {resultado.valores.icms.valor > 0 && (
                    <div className="flex justify-between">
                      <span style={{ color: theme.textMuted }}>
                        ICMS ({resultado.valores.icms.percentual}%) {resultado.valores.icms.foi_adicionado ? '(incluído)' : '(destacado)'}:
                      </span>
                      <span style={{ color: theme.text }}>
                        {resultado.valores.icms.foi_adicionado ? '+' : ''}R$ {resultado.valores.icms.valor.toFixed(2)}
                      </span>
                    </div>
                  )}

                  {resultado.valores.pis_cofins.valor > 0 && (
                    <div className="flex justify-between">
                      <span style={{ color: theme.textMuted }}>
                        PIS/COFINS ({resultado.valores.pis_cofins.percentual}%) {resultado.valores.pis_cofins.foi_incluido ? '(incluído)' : '(destacado)'}:
                      </span>
                      <span style={{ color: theme.text }}>
                        {resultado.valores.pis_cofins.foi_incluido ? '+' : ''}R$ {resultado.valores.pis_cofins.valor.toFixed(2)}
                      </span>
                    </div>
                  )}
                </div>
              </details>

              {/* Prazo de Entrega */}
              {resultado.prazo_entrega && (
                <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded border border-green-200 dark:border-green-800">
                  <p className="text-xs font-semibold" style={{ color: isDark ? '#86efac' : '#166534' }}>
                    📅 Prazo de Entrega: {resultado.prazo_entrega.dias} {resultado.prazo_entrega.tipo === 'uteis' ? 'dias úteis' : 'dias corridos'}
                  </p>
                  <p className="text-xs mt-1" style={{ color: theme.textMuted }}>
                    Previsão: {new Date(resultado.prazo_entrega.data_prevista).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
  );
}