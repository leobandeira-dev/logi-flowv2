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
    descricao: "",
    tipo_tabela: "peso_km",
    cliente_parceiro_id: "",
    vigencia_inicio: "",
    vigencia_fim: "",
    tipo_aplicacao: "todos",
    unidade_cobranca: "viagem",
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
        descricao: tabela.descricao || "",
        tipo_tabela: tabela.tipo_tabela || "peso_km",
        cliente_parceiro_id: tabela.cliente_parceiro_id || "",
        vigencia_inicio: tabela.vigencia_inicio ? new Date(tabela.vigencia_inicio).toISOString().slice(0, 10) : "",
        vigencia_fim: tabela.vigencia_fim ? new Date(tabela.vigencia_fim).toISOString().slice(0, 10) : "",
        tipo_aplicacao: tabela.tipo_aplicacao || "todos",
        unidade_cobranca: tabela.unidade_cobranca || "viagem",
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
      faixa_peso_min: 0,
      faixa_peso_max: 0,
      faixa_km_min: 0,
      faixa_km_max: 0,
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
              <div className="grid grid-cols-2 gap-4">
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
                <div className="space-y-3">
                  {itens.map((item, index) => (
                    <div key={index} className="grid grid-cols-6 gap-3 p-3 border rounded" style={{ borderColor: theme.cardBorder }}>
                      <div>
                        <Label className="text-xs" style={{ color: theme.textMuted }}>Peso Min (kg)</Label>
                        <Input
                          type="number"
                          value={item.faixa_peso_min}
                          onChange={(e) => updateItem(index, 'faixa_peso_min', e.target.value)}
                          placeholder="0"
                          style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder, color: theme.text }}
                        />
                      </div>
                      <div>
                        <Label className="text-xs" style={{ color: theme.textMuted }}>Peso Max (kg)</Label>
                        <Input
                          type="number"
                          value={item.faixa_peso_max}
                          onChange={(e) => updateItem(index, 'faixa_peso_max', e.target.value)}
                          placeholder="100"
                          style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder, color: theme.text }}
                        />
                      </div>
                      <div>
                        <Label className="text-xs" style={{ color: theme.textMuted }}>KM Min</Label>
                        <Input
                          type="number"
                          value={item.faixa_km_min}
                          onChange={(e) => updateItem(index, 'faixa_km_min', e.target.value)}
                          placeholder="0"
                          style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder, color: theme.text }}
                        />
                      </div>
                      <div>
                        <Label className="text-xs" style={{ color: theme.textMuted }}>KM Max</Label>
                        <Input
                          type="number"
                          value={item.faixa_km_max}
                          onChange={(e) => updateItem(index, 'faixa_km_max', e.target.value)}
                          placeholder="100"
                          style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder, color: theme.text }}
                        />
                      </div>
                      <div>
                        <Label className="text-xs" style={{ color: theme.textMuted }}>Valor (R$)</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={item.valor}
                          onChange={(e) => updateItem(index, 'valor', e.target.value)}
                          placeholder="0.00"
                          style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder, color: theme.text }}
                        />
                      </div>
                      <div className="flex items-end">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeItem(index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
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