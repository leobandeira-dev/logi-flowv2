import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Save, Plus, Trash2, X, Search, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { calcularDistancia } from "@/functions/calcularDistancia";

export default function TabelaPrecoForm({ tabela, onClose, onSuccess, parceiros }) {
  const [isDark, setIsDark] = useState(false);
  const [saving, setSaving] = useState(false);
  const [searchCliente, setSearchCliente] = useState("");
  const [filteredParceiros, setFilteredParceiros] = useState(parceiros);
  const [calculandoDistancia, setCalculandoDistancia] = useState(false);
  const [distanciaCalculada, setDistanciaCalculada] = useState(null);
  const [enderecoOrigem, setEnderecoOrigem] = useState("");
  const [enderecoDestino, setEnderecoDestino] = useState("");
  const [formData, setFormData] = useState({
    nome: "",
    codigo: "",
    descricao: "",
    tipo_tabela: "peso_km",
    tipo_distancia: "emitente_destinatario",
    clientes_parceiros_ids: [],
    vigencia_inicio: "",
    vigencia_fim: "",
    tipos_aplicacao: [],
    unidade_cobranca: "viagem",
    colunas_km: [
      { letra: "A", km_min: 0, km_max: 100 },
      { letra: "B", km_min: 100, km_max: 200 },
      { letra: "C", km_min: 200, km_max: 400 },
      { letra: "D", km_min: 400, km_max: 600 },
      { letra: "E", km_min: 600, km_max: 800 },
      { letra: "F", km_min: 800, km_max: 1000 },
      { letra: "G", km_min: 1000, km_max: 1200 }
    ],
    frete_minimo: 0,
    pedagio: 0,
    tipo_pedagio: "fixo",
    icms: 0,
    adicionar_icms: false,
    pis_cofins: 0,
    incluir_pis_cofins: false,
    desconsiderar_impostos_frete_minimo: false,
    desconsiderar_no_frete_minimo: [],
    ad_valorem: 0,
    gris: 0,
    taxa_redespacho: 0,
    seguro: 0,
    tde: 0,
    taxa_coleta: 0,
    taxa_entrega: 0,
    generalidades: 0,
    desconto: 0,
    reembarque: 0,
    devolucao: 0,
    prazo_entrega_dias: 0,
    tipo_prazo: "corridos",
    observacoes: "",
    ativo: true
  });
  const [itens, setItens] = useState([]);

  useEffect(() => {
    const checkDarkMode = () => {
      setIsDark(document.documentElement.classList.contains('dark'));
    };
    checkDarkMode();
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    setFilteredParceiros(parceiros);
  }, [parceiros]);

  useEffect(() => {
    if (tabela) {
      setFormData({
        nome: tabela.nome || "",
        codigo: tabela.codigo || "",
        descricao: tabela.descricao || "",
        tipo_tabela: tabela.tipo_tabela || "peso_km",
        tipo_distancia: tabela.tipo_distancia || "emitente_destinatario",
        clientes_parceiros_ids: tabela.clientes_parceiros_ids || [],
        vigencia_inicio: tabela.vigencia_inicio ? new Date(tabela.vigencia_inicio).toISOString().slice(0, 10) : "",
        vigencia_fim: tabela.vigencia_fim ? new Date(tabela.vigencia_fim).toISOString().slice(0, 10) : "",
        tipos_aplicacao: tabela.tipos_aplicacao || [],
        unidade_cobranca: tabela.unidade_cobranca || "viagem",
        colunas_km: tabela.colunas_km || [
          { letra: "A", km_min: 0, km_max: 100 },
          { letra: "B", km_min: 100, km_max: 200 },
          { letra: "C", km_min: 200, km_max: 400 },
          { letra: "D", km_min: 400, km_max: 600 },
          { letra: "E", km_min: 600, km_max: 800 },
          { letra: "F", km_min: 800, km_max: 1000 },
          { letra: "G", km_min: 1000, km_max: 1200 }
        ],
        frete_minimo: tabela.frete_minimo || 0,
        pedagio: tabela.pedagio || 0,
        tipo_pedagio: tabela.tipo_pedagio || "fixo",
        icms: tabela.icms || 0,
        adicionar_icms: tabela.adicionar_icms || false,
        pis_cofins: tabela.pis_cofins || 0,
        incluir_pis_cofins: tabela.incluir_pis_cofins || false,
        desconsiderar_impostos_frete_minimo: tabela.desconsiderar_impostos_frete_minimo || false,
        desconsiderar_no_frete_minimo: tabela.desconsiderar_no_frete_minimo || [],
        ad_valorem: tabela.ad_valorem || 0,
        gris: tabela.gris || 0,
        taxa_redespacho: tabela.taxa_redespacho || 0,
        seguro: tabela.seguro || 0,
        tde: tabela.tde || 0,
        taxa_coleta: tabela.taxa_coleta || 0,
        taxa_entrega: tabela.taxa_entrega || 0,
        generalidades: tabela.generalidades || 0,
        desconto: tabela.desconto || 0,
        reembarque: tabela.reembarque || 0,
        devolucao: tabela.devolucao || 0,
        prazo_entrega_dias: tabela.prazo_entrega_dias || 0,
        tipo_prazo: tabela.tipo_prazo || "corridos",
        observacoes: tabela.observacoes || "",
        ativo: tabela.ativo !== false
      });
      loadItens(tabela.id);
    }
  }, [tabela]);

  const loadItens = async (tabelaId) => {
    try {
      const data = await base44.entities.TabelaPrecoItem.filter(
        { tabela_preco_id: tabelaId },
        "ordem",
        100
      );
      // Extrair apenas os dados necessários de cada item
      const itensData = data.map(item => ({
        faixa_peso_min: item.faixa_peso_min ?? null,
        faixa_peso_max: item.faixa_peso_max ?? null,
        valores_colunas: item.valores_colunas || {},
        unidade: item.unidade,
        ordem: item.ordem
      }));
      setItens(itensData);
    } catch (error) {
      console.error("Erro ao carregar itens:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.nome || !formData.tipo_tabela) {
      toast.error("Preencha os campos obrigatórios");
      return;
    }

    setSaving(true);
    try {
      const user = await base44.auth.me();
      const dataToSave = {
        ...formData,
        empresa_id: user.empresa_id
      };

      let tabelaId;
      if (tabela) {
        await base44.entities.TabelaPreco.update(tabela.id, dataToSave);
        tabelaId = tabela.id;
        toast.success("Tabela atualizada com sucesso!");
      } else {
        const newTabela = await base44.entities.TabelaPreco.create(dataToSave);
        tabelaId = newTabela.id;
        toast.success("Tabela criada com sucesso!");
      }

      // Salvar itens
      if (itens.length > 0) {
        // Deletar itens antigos se estiver editando
        if (tabela) {
          const itensAntigos = await base44.entities.TabelaPrecoItem.filter(
            { tabela_preco_id: tabelaId }
          );
          for (const item of itensAntigos) {
            await base44.entities.TabelaPrecoItem.delete(item.id);
          }
        }

        // Criar novos itens
        for (const item of itens) {
          await base44.entities.TabelaPrecoItem.create({
            ...item,
            tabela_preco_id: tabelaId
          });
        }
      }

      onSuccess();
    } catch (error) {
      console.error("Erro ao salvar tabela:", error);
      toast.error("Erro ao salvar tabela");
    } finally {
      setSaving(false);
    }
  };

  const addItem = () => {
    const valores_colunas = {};
    formData.colunas_km.forEach(col => {
      valores_colunas[col.letra] = null;
    });
    
    setItens([...itens, {
      faixa_peso_min: null,
      faixa_peso_max: null,
      valores_colunas: valores_colunas,
      unidade: formData.unidade_cobranca,
      ordem: itens.length + 1
    }]);
  };

  const removeItem = (index) => {
    setItens(itens.filter((_, i) => i !== index));
  };

  const updateItem = (index, field, value) => {
    const newItens = [...itens];
    const parsedValue = value === "" ? null : parseFloat(value);
    
    if (field.startsWith('col_')) {
      const letra = field.replace('col_', '').toUpperCase();
      newItens[index] = {
        ...newItens[index],
        valores_colunas: {
          ...newItens[index].valores_colunas,
          [letra]: parsedValue
        }
      };
    } else {
      newItens[index] = { ...newItens[index], [field]: parsedValue };
    }
    setItens(newItens);
  };

  const addColuna = () => {
    const letras = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const proximaLetra = letras[formData.colunas_km.length];
    const ultimaColuna = formData.colunas_km[formData.colunas_km.length - 1];
    
    setFormData({
      ...formData,
      colunas_km: [
        ...formData.colunas_km,
        {
          letra: proximaLetra,
          km_min: ultimaColuna ? ultimaColuna.km_max : 0,
          km_max: ultimaColuna ? ultimaColuna.km_max + 200 : 200
        }
      ]
    });

    // Adicionar a nova coluna a todos os itens existentes
    const newItens = itens.map(item => ({
      ...item,
      valores_colunas: {
        ...item.valores_colunas,
        [proximaLetra]: 0
      }
    }));
    setItens(newItens);
  };

  const removeColuna = (letra) => {
    if (formData.colunas_km.length <= 1) {
      toast.error("Deve haver pelo menos uma coluna");
      return;
    }

    setFormData({
      ...formData,
      colunas_km: formData.colunas_km.filter(c => c.letra !== letra)
    });

    // Remover a coluna de todos os itens
    const newItens = itens.map(item => {
      const newValores = { ...item.valores_colunas };
      delete newValores[letra];
      return {
        ...item,
        valores_colunas: newValores
      };
    });
    setItens(newItens);
  };

  const updateColuna = (letra, field, value) => {
    setFormData({
      ...formData,
      colunas_km: formData.colunas_km.map(c => 
        c.letra === letra ? { ...c, [field]: parseFloat(value) || 0 } : c
      )
    });
  };

  const handleSearchCliente = (e) => {
    e.preventDefault();
    if (!searchCliente.trim()) {
      setFilteredParceiros(parceiros);
      return;
    }

    const termo = searchCliente.toLowerCase();
    const resultados = parceiros.filter(p => 
      p.razao_social?.toLowerCase().includes(termo) ||
      p.cnpj?.includes(termo)
    );
    
    setFilteredParceiros(resultados);
    
    if (resultados.length === 0) {
      toast.info("Nenhum cliente encontrado");
    }
  };

  const handleSearchKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearchCliente(e);
    }
  };

  const handleCalcularDistancia = async () => {
    if (!enderecoOrigem || !enderecoDestino) {
      toast.error("Preencha origem e destino");
      return;
    }

    setCalculandoDistancia(true);
    try {
      const response = await calcularDistancia({
        origem: enderecoOrigem,
        destino: enderecoDestino,
        tabelaPrecoId: tabela?.id // Passa o ID da tabela para usar a configuração tipo_distancia
      });

      setDistanciaCalculada(response.data);
      toast.success(`Distância calculada: ${response.data.distancia_km} km`);
    } catch (error) {
      console.error("Erro ao calcular distância:", error);
      toast.error("Erro ao calcular distância");
    } finally {
      setCalculandoDistancia(false);
    }
  };

  const theme = {
    bg: isDark ? '#0f172a' : '#f9fafb',
    cardBg: isDark ? '#1e293b' : '#ffffff',
    cardBorder: isDark ? '#334155' : '#e5e7eb',
    text: isDark ? '#f1f5f9' : '#111827',
    textMuted: isDark ? '#94a3b8' : '#6b7280',
  };

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: theme.bg }}>
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={onClose}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          <h1 className="text-3xl font-bold" style={{ color: theme.text }}>
            {tabela ? "Editar Tabela" : "Nova Tabela de Preços"}
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}>
            <CardHeader>
              <CardTitle style={{ color: theme.text }}>Informações Gerais</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label style={{ color: theme.text }}>Código</Label>
                  <Input
                    value={formData.codigo}
                    onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
                    placeholder="Ex: TAB001"
                    style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder, color: theme.text }}
                  />
                </div>
                <div>
                  <Label style={{ color: theme.text }}>Nome da Tabela *</Label>
                  <Input
                    value={formData.nome}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                    placeholder="Ex: Tabela São Luis - COA"
                    required
                    style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder, color: theme.text }}
                  />
                </div>
                <div>
                  <Label style={{ color: theme.text }}>Tipo de Tabela *</Label>
                  <Select
                    value={formData.tipo_tabela}
                    onValueChange={(value) => setFormData({ ...formData, tipo_tabela: value })}
                  >
                    <SelectTrigger style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder, color: theme.text }}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="peso_km">Peso x KM</SelectItem>
                      <SelectItem value="peso">Por Peso</SelectItem>
                      <SelectItem value="cubagem">Peso x Cubagem</SelectItem>
                      <SelectItem value="percentual_nf">% Nota Fiscal</SelectItem>
                      <SelectItem value="km">Por KM</SelectItem>
                      <SelectItem value="valor_fixo">Valor Fixo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {formData.tipo_tabela === "peso_km" && (
                <div>
                  <Label style={{ color: theme.text }}>Base de Cálculo de Distância</Label>
                  <Select
                    value={formData.tipo_distancia}
                    onValueChange={(value) => setFormData({ ...formData, tipo_distancia: value })}
                  >
                    <SelectTrigger style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder, color: theme.text }}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="emitente_destinatario">Emitente x Destinatário</SelectItem>
                      <SelectItem value="emitente_operador">Emitente x Operador Logístico</SelectItem>
                      <SelectItem value="operador_destinatario">Operador Logístico x Destinatário</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs mt-1" style={{ color: theme.textMuted }}>
                    Define qual distância será usada para determinar a faixa de KM no cálculo do frete
                  </p>
                </div>
              )}

              {tabela && formData.tipo_tabela === "peso_km" && (
                <Card className="bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm" style={{ color: theme.text }}>
                      📍 Distâncias Calculadas via Google Maps
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs" style={{ color: theme.text }}>Origem</Label>
                        <Input
                          value={enderecoOrigem}
                          onChange={(e) => setEnderecoOrigem(e.target.value)}
                          placeholder="Ex: Cubatão, State of São Paulo, Brazil"
                          className="text-xs"
                          style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder, color: theme.text }}
                        />
                      </div>
                      <div>
                        <Label className="text-xs" style={{ color: theme.text }}>Destino</Label>
                        <Input
                          value={enderecoDestino}
                          onChange={(e) => setEnderecoDestino(e.target.value)}
                          placeholder="Ex: Imperatriz - Camaçari, State of Maranhão, Brazil"
                          className="text-xs"
                          style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder, color: theme.text }}
                        />
                      </div>
                    </div>

                    <Button
                      type="button"
                      onClick={handleCalcularDistancia}
                      disabled={calculandoDistancia}
                      size="sm"
                      className="w-full bg-purple-600 hover:bg-purple-700"
                    >
                      {calculandoDistancia ? (
                        <>
                          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                          Calculando...
                        </>
                      ) : (
                        "Recalcular"
                      )}
                    </Button>

                    {distanciaCalculada && (
                      <div className="bg-white dark:bg-slate-800 p-3 rounded-lg border" style={{ borderColor: theme.cardBorder }}>
                        <div className="text-sm space-y-1">
                          <p style={{ color: theme.text }}>
                            <span className="font-semibold" style={{ color: theme.textMuted }}>
                              {formData.tipo_distancia === 'emitente_operador' 
                                ? 'Emitente → Destinatário' 
                                : formData.tipo_distancia === 'emitente_operador' 
                                  ? 'Emitente → Operador Logístico'
                                  : 'Operador Logístico → Destinatário'}:
                            </span>{" "}
                            <span className="font-bold text-purple-600">{distanciaCalculada.distancia_km} km</span>
                          </p>
                          <p className="text-xs" style={{ color: theme.textMuted }}>
                            Origem: {distanciaCalculada.origem_endereco}
                          </p>
                          <p className="text-xs" style={{ color: theme.textMuted }}>
                            Destino: {distanciaCalculada.destino_endereco}
                          </p>
                        </div>
                      </div>
                    )}

                    <p className="text-xs" style={{ color: theme.textMuted }}>
                      Se preenchido, este valor será usado no lugar do cálculo automático
                    </p>
                  </CardContent>
                </Card>
              )}

              <div>
                <Label style={{ color: theme.text }}>Descrição</Label>
                <Textarea
                  value={formData.descricao}
                  onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                  placeholder="Descrição da tabela..."
                  rows={2}
                  style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder, color: theme.text }}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label style={{ color: theme.text }}>Clientes (múltipla seleção)</Label>
                  <div className="mb-2 flex gap-2">
                    <div className="relative flex-1">
                      <Input
                        value={searchCliente}
                        onChange={(e) => setSearchCliente(e.target.value)}
                        onKeyPress={handleSearchKeyPress}
                        placeholder="Pesquisar cliente por nome ou CNPJ..."
                        className="pr-10"
                        style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder, color: theme.text }}
                      />
                    </div>
                    <Button
                      type="button"
                      onClick={handleSearchCliente}
                      size="sm"
                      variant="outline"
                      className="px-3"
                    >
                      <Search className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="border rounded-lg p-2 max-h-40 overflow-y-auto" style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}>
                    {filteredParceiros.length === 0 ? (
                      <p className="text-xs text-center py-4" style={{ color: theme.textMuted }}>
                        Nenhum cliente encontrado
                      </p>
                    ) : (
                      filteredParceiros.map((p) => (
                        <label key={p.id} className="flex items-center gap-2 p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.clientes_parceiros_ids.includes(p.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setFormData({ ...formData, clientes_parceiros_ids: [...formData.clientes_parceiros_ids, p.id] });
                              } else {
                                setFormData({ ...formData, clientes_parceiros_ids: formData.clientes_parceiros_ids.filter(id => id !== p.id) });
                              }
                            }}
                            className="rounded"
                          />
                          <span className="text-sm" style={{ color: theme.text }}>{p.razao_social}</span>
                        </label>
                      ))
                    )}
                  </div>
                  {formData.clientes_parceiros_ids.length > 0 && (
                    <p className="text-xs mt-1" style={{ color: theme.textMuted }}>
                      {formData.clientes_parceiros_ids.length} cliente(s) selecionado(s)
                    </p>
                  )}
                </div>
                <div>
                  <Label style={{ color: theme.text }}>Aplicação (múltipla seleção)</Label>
                  <div className="border rounded-lg p-2 space-y-1" style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}>
                    {["todos", "coleta", "carregamento", "entrega"].map((tipo) => (
                      <label key={tipo} className="flex items-center gap-2 p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.tipos_aplicacao.includes(tipo)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormData({ ...formData, tipos_aplicacao: [...formData.tipos_aplicacao, tipo] });
                            } else {
                              setFormData({ ...formData, tipos_aplicacao: formData.tipos_aplicacao.filter(t => t !== tipo) });
                            }
                          }}
                          className="rounded"
                        />
                        <span className="text-sm capitalize" style={{ color: theme.text }}>{tipo}</span>
                      </label>
                    ))}
                  </div>
                  {formData.tipos_aplicacao.length > 0 && (
                    <p className="text-xs mt-1" style={{ color: theme.textMuted }}>
                      {formData.tipos_aplicacao.length} tipo(s) selecionado(s)
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label style={{ color: theme.text }}>Unidade de Cobrança</Label>
                  <Select
                    value={formData.unidade_cobranca}
                    onValueChange={(value) => setFormData({ ...formData, unidade_cobranca: value })}
                  >
                    <SelectTrigger style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder, color: theme.text }}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="viagem">Viagem</SelectItem>
                      <SelectItem value="tonelada">Tonelada</SelectItem>
                      <SelectItem value="kg">KG</SelectItem>
                      <SelectItem value="percentual">Percentual</SelectItem>
                      <SelectItem value="fixo">Fixo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label style={{ color: theme.text }}>Vigência Início</Label>
                  <Input
                    type="date"
                    value={formData.vigencia_inicio}
                    onChange={(e) => setFormData({ ...formData, vigencia_inicio: e.target.value })}
                    style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder, color: theme.text }}
                  />
                </div>
                <div>
                  <Label style={{ color: theme.text }}>Vigência Fim</Label>
                  <Input
                    type="date"
                    value={formData.vigencia_fim}
                    onChange={(e) => setFormData({ ...formData, vigencia_fim: e.target.value })}
                    style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder, color: theme.text }}
                  />
                </div>
              </div>

              <div>
                <Label style={{ color: theme.text }}>Observações</Label>
                <Textarea
                  value={formData.observacoes}
                  onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                  placeholder="Observações adicionais..."
                  rows={2}
                  style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder, color: theme.text }}
                />
              </div>
            </CardContent>
          </Card>

          <Card style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}>
            <CardHeader>
              <CardTitle style={{ color: theme.text }}>Configurações de Taxas e Impostos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-4 gap-4">
                <div>
                  <Label style={{ color: theme.text }}>Frete Mínimo (R$)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.frete_minimo}
                    onChange={(e) => setFormData({ ...formData, frete_minimo: parseFloat(e.target.value) || 0 })}
                    style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder, color: theme.text }}
                  />
                </div>
                <div>
                  <Label style={{ color: theme.text }}>Pedágio</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.pedagio}
                    onChange={(e) => setFormData({ ...formData, pedagio: parseFloat(e.target.value) || 0 })}
                    style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder, color: theme.text }}
                  />
                </div>
                <div>
                  <Label style={{ color: theme.text }}>Tipo Pedágio</Label>
                  <Select
                    value={formData.tipo_pedagio}
                    onValueChange={(value) => setFormData({ ...formData, tipo_pedagio: value })}
                  >
                    <SelectTrigger style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder, color: theme.text }}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fixo">Fixo</SelectItem>
                      <SelectItem value="percentual">Percentual</SelectItem>
                      <SelectItem value="por_eixo">Por Eixo</SelectItem>
                      <SelectItem value="kg_por_veiculo">KG por Veículo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label style={{ color: theme.text }}>ICMS (%)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.icms}
                    onChange={(e) => setFormData({ ...formData, icms: parseFloat(e.target.value) || 0 })}
                    style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder, color: theme.text }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-4 gap-4">
                <div>
                  <Label style={{ color: theme.text }}>PIS/COFINS (%)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.pis_cofins}
                    onChange={(e) => setFormData({ ...formData, pis_cofins: parseFloat(e.target.value) || 0 })}
                    style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder, color: theme.text }}
                  />
                </div>
                <div>
                  <Label style={{ color: theme.text }}>Ad Valorem (%)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.ad_valorem}
                    onChange={(e) => setFormData({ ...formData, ad_valorem: parseFloat(e.target.value) || 0 })}
                    style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder, color: theme.text }}
                  />
                </div>
                <div>
                  <Label style={{ color: theme.text }}>GRIS (%)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.gris}
                    onChange={(e) => setFormData({ ...formData, gris: parseFloat(e.target.value) || 0 })}
                    style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder, color: theme.text }}
                  />
                </div>
                <div>
                  <Label style={{ color: theme.text }}>Seguro (%)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.seguro}
                    onChange={(e) => setFormData({ ...formData, seguro: parseFloat(e.target.value) || 0 })}
                    style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder, color: theme.text }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-4 gap-4">
                <div>
                  <Label style={{ color: theme.text }}>TDE (R$)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.tde}
                    onChange={(e) => setFormData({ ...formData, tde: parseFloat(e.target.value) || 0 })}
                    style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder, color: theme.text }}
                  />
                </div>
                <div>
                  <Label style={{ color: theme.text }}>Taxa Coleta (R$)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.taxa_coleta}
                    onChange={(e) => setFormData({ ...formData, taxa_coleta: parseFloat(e.target.value) || 0 })}
                    style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder, color: theme.text }}
                  />
                </div>
                <div>
                  <Label style={{ color: theme.text }}>Taxa Entrega (R$)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.taxa_entrega}
                    onChange={(e) => setFormData({ ...formData, taxa_entrega: parseFloat(e.target.value) || 0 })}
                    style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder, color: theme.text }}
                  />
                </div>
                <div>
                  <Label style={{ color: theme.text }}>Redespacho (R$)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.taxa_redespacho}
                    onChange={(e) => setFormData({ ...formData, taxa_redespacho: parseFloat(e.target.value) || 0 })}
                    style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder, color: theme.text }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-4 gap-4">
                <div>
                  <Label style={{ color: theme.text }}>Generalidades (%)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.generalidades}
                    onChange={(e) => setFormData({ ...formData, generalidades: parseFloat(e.target.value) || 0 })}
                    style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder, color: theme.text }}
                  />
                </div>
                <div>
                  <Label style={{ color: theme.text }}>Desconto (%)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.desconto}
                    onChange={(e) => setFormData({ ...formData, desconto: parseFloat(e.target.value) || 0 })}
                    style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder, color: theme.text }}
                  />
                </div>
                <div>
                  <Label style={{ color: theme.text }}>Reembarque (%)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.reembarque}
                    onChange={(e) => setFormData({ ...formData, reembarque: parseFloat(e.target.value) || 0 })}
                    style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder, color: theme.text }}
                  />
                </div>
                <div>
                  <Label style={{ color: theme.text }}>Devolução (%)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.devolucao}
                    onChange={(e) => setFormData({ ...formData, devolucao: parseFloat(e.target.value) || 0 })}
                    style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder, color: theme.text }}
                  />
                </div>
              </div>

              <div className="pt-4 border-t" style={{ borderColor: isDark ? '#334155' : '#e5e7eb' }}>
                <p className="text-sm font-semibold mb-3" style={{ color: theme.text }}>
                  Flags de Cálculo:
                </p>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="w-4 h-4 rounded border-gray-300"
                      checked={formData.adicionar_icms}
                      onChange={(e) => setFormData({ ...formData, adicionar_icms: e.target.checked })}
                    />
                    <span className="text-sm" style={{ color: theme.textMuted }}>
                      Incluir ICMS no cálculo do frete
                    </span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="w-4 h-4 rounded border-gray-300"
                      checked={formData.incluir_pis_cofins}
                      onChange={(e) => setFormData({ ...formData, incluir_pis_cofins: e.target.checked })}
                    />
                    <span className="text-sm" style={{ color: theme.textMuted }}>
                      Incluir PIS/COFINS no cálculo do frete
                    </span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="w-4 h-4 rounded border-gray-300"
                      checked={formData.desconsiderar_impostos_frete_minimo}
                      onChange={(e) => setFormData({ ...formData, desconsiderar_impostos_frete_minimo: e.target.checked })}
                    />
                    <span className="text-sm" style={{ color: theme.textMuted }}>
                      Desconsiderar recálculo de ICMS e PIS/COFINS sobre o total em caso de frete mínimo
                    </span>
                  </label>
                </div>
              </div>

              <div className="pt-4 border-t" style={{ borderColor: isDark ? '#334155' : '#e5e7eb' }}>
                <p className="text-sm font-semibold mb-3" style={{ color: theme.text }}>
                  Desconsiderar no Frete Mínimo:
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {['gris', 'pedagio', 'seguro', 'redespacho', 'tde'].map((item) => (
                    <label key={item} className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="w-4 h-4 rounded border-gray-300"
                        checked={formData.desconsiderar_no_frete_minimo.includes(item)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData({ 
                              ...formData, 
                              desconsiderar_no_frete_minimo: [...formData.desconsiderar_no_frete_minimo, item] 
                            });
                          } else {
                            setFormData({ 
                              ...formData, 
                              desconsiderar_no_frete_minimo: formData.desconsiderar_no_frete_minimo.filter(i => i !== item) 
                            });
                          }
                        }}
                      />
                      <span className="text-sm capitalize" style={{ color: theme.textMuted }}>
                        {item === 'gris' ? 'GRIS' : item === 'tde' ? 'TDE' : item.charAt(0).toUpperCase() + item.slice(1)}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t" style={{ borderColor: isDark ? '#334155' : '#e5e7eb' }}>
                <p className="text-sm font-semibold mb-3" style={{ color: theme.text }}>
                  Prazo de Entrega:
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs" style={{ color: theme.text }}>Prazo (dias)</Label>
                    <Input
                      type="number"
                      value={formData.prazo_entrega_dias}
                      onChange={(e) => setFormData({ ...formData, prazo_entrega_dias: parseInt(e.target.value) || 0 })}
                      min="0"
                      style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder, color: theme.text }}
                    />
                  </div>
                  <div>
                    <Label className="text-xs" style={{ color: theme.text }}>Tipo de Prazo</Label>
                    <Select
                      value={formData.tipo_prazo}
                      onValueChange={(value) => setFormData({ ...formData, tipo_prazo: value })}
                    >
                      <SelectTrigger style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder, color: theme.text }}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="corridos">Dias Corridos</SelectItem>
                        <SelectItem value="uteis">Dias Úteis</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {formData.tipo_tabela === "peso_km" && (
            <Card style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle style={{ color: theme.text }}>Faixas de Peso x KM</CardTitle>
                  <div className="flex gap-2">
                    <Button type="button" onClick={addColuna} size="sm" variant="outline">
                      <Plus className="w-4 h-4 mr-2" />
                      Adicionar Coluna KM
                    </Button>
                    <Button type="button" onClick={addItem} size="sm">
                      <Plus className="w-4 h-4 mr-2" />
                      Adicionar Faixa Peso
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse" style={{ borderColor: theme.cardBorder }}>
                    <thead>
                      <tr style={{ backgroundColor: isDark ? '#334155' : '#f1f5f9' }}>
                        <th className="border p-2 text-xs font-semibold" style={{ borderColor: theme.cardBorder, color: theme.text, minWidth: '100px' }}>
                          Peso Min (kg)
                        </th>
                        <th className="border p-2 text-xs font-semibold" style={{ borderColor: theme.cardBorder, color: theme.text, minWidth: '100px' }}>
                          Peso Max (kg)
                        </th>
                        {formData.colunas_km.map((col) => (
                          <th key={col.letra} className="border p-1 text-xs font-semibold" style={{ borderColor: theme.cardBorder, color: theme.text, minWidth: '140px' }}>
                            <div className="flex flex-col gap-1">
                              <div className="flex items-center justify-between gap-1">
                                <span>Faixa {col.letra}</span>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeColuna(col.letra)}
                                  className="h-4 w-4 p-0 text-red-600 hover:text-red-700"
                                >
                                  <X className="w-3 h-3" />
                                </Button>
                              </div>
                              <div className="flex gap-1 items-center">
                                <Input
                                  type="number"
                                  value={col.km_min}
                                  onChange={(e) => updateColuna(col.letra, 'km_min', e.target.value)}
                                  placeholder="Min"
                                  className="h-6 text-xs w-16"
                                  style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder, color: theme.text }}
                                />
                                <span className="text-xs">a</span>
                                <Input
                                  type="number"
                                  value={col.km_max}
                                  onChange={(e) => updateColuna(col.letra, 'km_max', e.target.value)}
                                  placeholder="Max"
                                  className="h-6 text-xs w-16"
                                  style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder, color: theme.text }}
                                />
                              </div>
                            </div>
                          </th>
                        ))}
                        <th className="border p-2 text-xs font-semibold" style={{ borderColor: theme.cardBorder, color: theme.text, minWidth: '60px' }}>Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {itens.map((item, index) => (
                        <tr key={index}>
                          <td className="border p-1" style={{ borderColor: theme.cardBorder }}>
                            <Input
                              type="number"
                              step="0.01"
                              value={item.faixa_peso_min ?? ""}
                              onChange={(e) => updateItem(index, 'faixa_peso_min', e.target.value)}
                              placeholder="Min"
                              className="text-xs h-8 w-full"
                              style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder, color: theme.text }}
                            />
                          </td>
                          <td className="border p-1" style={{ borderColor: theme.cardBorder }}>
                            <Input
                              type="number"
                              step="0.01"
                              value={item.faixa_peso_max ?? ""}
                              onChange={(e) => updateItem(index, 'faixa_peso_max', e.target.value)}
                              placeholder="Max"
                              className="text-xs h-8 w-full"
                              style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder, color: theme.text }}
                            />
                          </td>
                          {formData.colunas_km.map((col) => (
                            <td key={col.letra} className="border p-1" style={{ borderColor: theme.cardBorder }}>
                              <div className="relative">
                                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs" style={{ color: theme.textMuted }}>R$</span>
                                <Input
                                  type="number"
                                  step="0.01"
                                  value={item.valores_colunas?.[col.letra] ?? ""}
                                  onChange={(e) => updateItem(index, `col_${col.letra.toLowerCase()}`, e.target.value)}
                                  placeholder=""
                                  className="text-xs h-8 pl-8 w-full"
                                  style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder, color: theme.text }}
                                />
                              </div>
                            </td>
                          ))}
                          <td className="border p-1 text-center" style={{ borderColor: theme.cardBorder }}>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeItem(index)}
                              className="text-red-600 hover:text-red-700 h-7"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={saving} className="bg-blue-600 hover:bg-blue-700">
              <Save className="w-4 h-4 mr-2" />
              {saving ? "Salvando..." : "Salvar Tabela"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}