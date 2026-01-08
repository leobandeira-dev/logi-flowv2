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
import { ArrowLeft, Save, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

export default function TabelaPrecoForm({ tabela, onClose, onSuccess, parceiros }) {
  const [isDark, setIsDark] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    nome: "",
    codigo: "",
    descricao: "",
    tipo_tabela: "peso_km",
    cliente_parceiro_id: "",
    vigencia_inicio: "",
    vigencia_fim: "",
    tipo_aplicacao: "todos",
    unidade_cobranca: "viagem",
    frete_minimo: 0,
    pedagio: 0,
    tipo_pedagio: "fixo",
    icms: 0,
    pis_cofins: 0,
    ad_valorem: 0,
    gris: 0,
    taxa_redespacho: 0,
    seguro: 0,
    tde: 0,
    taxa_coleta: 0,
    taxa_entrega: 0,
    generalidades: 0,
    desconto: 0,
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
    if (tabela) {
      setFormData({
        nome: tabela.nome || "",
        codigo: tabela.codigo || "",
        descricao: tabela.descricao || "",
        tipo_tabela: tabela.tipo_tabela || "peso_km",
        cliente_parceiro_id: tabela.cliente_parceiro_id || "",
        vigencia_inicio: tabela.vigencia_inicio ? new Date(tabela.vigencia_inicio).toISOString().slice(0, 10) : "",
        vigencia_fim: tabela.vigencia_fim ? new Date(tabela.vigencia_fim).toISOString().slice(0, 10) : "",
        tipo_aplicacao: tabela.tipo_aplicacao || "todos",
        unidade_cobranca: tabela.unidade_cobranca || "viagem",
        frete_minimo: tabela.frete_minimo || 0,
        pedagio: tabela.pedagio || 0,
        tipo_pedagio: tabela.tipo_pedagio || "fixo",
        icms: tabela.icms || 0,
        pis_cofins: tabela.pis_cofins || 0,
        ad_valorem: tabela.ad_valorem || 0,
        gris: tabela.gris || 0,
        taxa_redespacho: tabela.taxa_redespacho || 0,
        seguro: tabela.seguro || 0,
        tde: tabela.tde || 0,
        taxa_coleta: tabela.taxa_coleta || 0,
        taxa_entrega: tabela.taxa_entrega || 0,
        generalidades: tabela.generalidades || 0,
        desconto: tabela.desconto || 0,
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
      setItens(data);
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
    setItens([...itens, {
      descricao_faixa: "",
      faixa_peso_min: 0,
      faixa_peso_max: 0,
      faixa_km_min: 0,
      faixa_km_max: 0,
      col_a: 0,
      col_b: 0,
      col_c: 0,
      col_d: 0,
      col_e: 0,
      col_f: 0,
      col_g: 0,
      valor: 0,
      unidade: formData.unidade_cobranca,
      ordem: itens.length + 1
    }]);
  };

  const removeItem = (index) => {
    setItens(itens.filter((_, i) => i !== index));
  };

  const updateItem = (index, field, value) => {
    const newItens = [...itens];
    newItens[index] = { ...newItens[index], [field]: parseFloat(value) || 0 };
    setItens(newItens);
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
                  <Label style={{ color: theme.text }}>Cliente</Label>
                  <Select
                    value={formData.cliente_parceiro_id}
                    onValueChange={(value) => setFormData({ ...formData, cliente_parceiro_id: value })}
                  >
                    <SelectTrigger style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder, color: theme.text }}>
                      <SelectValue placeholder="Selecione o cliente" />
                    </SelectTrigger>
                    <SelectContent>
                      {parceiros.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.razao_social}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label style={{ color: theme.text }}>Aplicação</Label>
                  <Select
                    value={formData.tipo_aplicacao}
                    onValueChange={(value) => setFormData({ ...formData, tipo_aplicacao: value })}
                  >
                    <SelectTrigger style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder, color: theme.text }}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos</SelectItem>
                      <SelectItem value="coleta">Coleta</SelectItem>
                      <SelectItem value="carregamento">Carregamento</SelectItem>
                      <SelectItem value="entrega">Entrega</SelectItem>
                    </SelectContent>
                  </Select>
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

              <div className="grid grid-cols-2 gap-4">
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
              </div>
            </CardContent>
          </Card>

          {formData.tipo_tabela === "peso_km" && (
            <Card style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle style={{ color: theme.text }}>Faixas de Peso x KM</CardTitle>
                  <Button type="button" onClick={addItem} size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar Faixa
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse" style={{ borderColor: theme.cardBorder }}>
                    <thead>
                      <tr style={{ backgroundColor: isDark ? '#334155' : '#f1f5f9' }}>
                        <th className="border p-2 text-xs font-semibold" style={{ borderColor: theme.cardBorder, color: theme.text }}>Peso (kg)</th>
                        <th className="border p-2 text-xs font-semibold" style={{ borderColor: theme.cardBorder, color: theme.text }}>até 100km (A)</th>
                        <th className="border p-2 text-xs font-semibold" style={{ borderColor: theme.cardBorder, color: theme.text }}>100-200km (B)</th>
                        <th className="border p-2 text-xs font-semibold" style={{ borderColor: theme.cardBorder, color: theme.text }}>200-400km (C)</th>
                        <th className="border p-2 text-xs font-semibold" style={{ borderColor: theme.cardBorder, color: theme.text }}>400-600km (D)</th>
                        <th className="border p-2 text-xs font-semibold" style={{ borderColor: theme.cardBorder, color: theme.text }}>600-800km (E)</th>
                        <th className="border p-2 text-xs font-semibold" style={{ borderColor: theme.cardBorder, color: theme.text }}>800-1000km (F)</th>
                        <th className="border p-2 text-xs font-semibold" style={{ borderColor: theme.cardBorder, color: theme.text }}>1000-1200km (G)</th>
                        <th className="border p-2 text-xs font-semibold" style={{ borderColor: theme.cardBorder, color: theme.text }}>Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {itens.map((item, index) => (
                        <tr key={index}>
                          <td className="border p-1" style={{ borderColor: theme.cardBorder }}>
                            <Input
                              value={item.descricao_faixa || `${item.faixa_peso_min} a ${item.faixa_peso_max}`}
                              onChange={(e) => {
                                const newItens = [...itens];
                                newItens[index] = { ...newItens[index], descricao_faixa: e.target.value };
                                setItens(newItens);
                              }}
                              placeholder="0 a 50 kg"
                              className="text-xs h-8"
                              style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder, color: theme.text }}
                            />
                          </td>
                          <td className="border p-1" style={{ borderColor: theme.cardBorder }}>
                            <Input
                              type="number"
                              step="0.01"
                              value={item.col_a || 0}
                              onChange={(e) => updateItem(index, 'col_a', e.target.value)}
                              className="text-xs h-8"
                              style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder, color: theme.text }}
                            />
                          </td>
                          <td className="border p-1" style={{ borderColor: theme.cardBorder }}>
                            <Input
                              type="number"
                              step="0.01"
                              value={item.col_b || 0}
                              onChange={(e) => updateItem(index, 'col_b', e.target.value)}
                              className="text-xs h-8"
                              style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder, color: theme.text }}
                            />
                          </td>
                          <td className="border p-1" style={{ borderColor: theme.cardBorder }}>
                            <Input
                              type="number"
                              step="0.01"
                              value={item.col_c || 0}
                              onChange={(e) => updateItem(index, 'col_c', e.target.value)}
                              className="text-xs h-8"
                              style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder, color: theme.text }}
                            />
                          </td>
                          <td className="border p-1" style={{ borderColor: theme.cardBorder }}>
                            <Input
                              type="number"
                              step="0.01"
                              value={item.col_d || 0}
                              onChange={(e) => updateItem(index, 'col_d', e.target.value)}
                              className="text-xs h-8"
                              style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder, color: theme.text }}
                            />
                          </td>
                          <td className="border p-1" style={{ borderColor: theme.cardBorder }}>
                            <Input
                              type="number"
                              step="0.01"
                              value={item.col_e || 0}
                              onChange={(e) => updateItem(index, 'col_e', e.target.value)}
                              className="text-xs h-8"
                              style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder, color: theme.text }}
                            />
                          </td>
                          <td className="border p-1" style={{ borderColor: theme.cardBorder }}>
                            <Input
                              type="number"
                              step="0.01"
                              value={item.col_f || 0}
                              onChange={(e) => updateItem(index, 'col_f', e.target.value)}
                              className="text-xs h-8"
                              style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder, color: theme.text }}
                            />
                          </td>
                          <td className="border p-1" style={{ borderColor: theme.cardBorder }}>
                            <Input
                              type="number"
                              step="0.01"
                              value={item.col_g || 0}
                              onChange={(e) => updateItem(index, 'col_g', e.target.value)}
                              className="text-xs h-8"
                              style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder, color: theme.text }}
                            />
                          </td>
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