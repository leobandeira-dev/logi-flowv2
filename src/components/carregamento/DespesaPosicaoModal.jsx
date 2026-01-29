import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";

export default function DespesaPosicaoModal({ open, onClose, notaFiscal, linha, coluna, onSuccess }) {
  const [formData, setFormData] = useState({
    tipo_despesa_id: "",
    tipo_despesa_nome: "",
    quantidade: 1,
    valor_unitario: 0,
    valor_total: 0,
    unidade_cobranca: "unidade",
    descricao: `Despesa posição ${linha}-${coluna}`,
    observacoes: ""
  });
  const [tiposDespesa, setTiposDespesa] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadTiposDespesa();
  }, []);

  const loadTiposDespesa = async () => {
    try {
      const tipos = await base44.entities.TipoDespesaExtra.filter({ ativo: true });
      setTiposDespesa(tipos);
    } catch (error) {
      console.error("Erro ao carregar tipos:", error);
    }
  };

  const handleTipoChange = (tipoId) => {
    const tipo = tiposDespesa.find(t => t.id === tipoId);
    if (tipo) {
      setFormData({
        ...formData,
        tipo_despesa_id: tipoId,
        tipo_despesa_nome: tipo.nome,
        valor_unitario: tipo.valor_padrao || 0,
        unidade_cobranca: tipo.unidade_cobranca || "unidade",
        valor_total: (tipo.valor_padrao || 0) * formData.quantidade
      });
    }
  };

  useEffect(() => {
    const total = formData.quantidade * formData.valor_unitario;
    setFormData(prev => ({ ...prev, valor_total: total }));
  }, [formData.quantidade, formData.valor_unitario]);

  const handleSubmit = async () => {
    if (!formData.tipo_despesa_nome) {
      toast.error("Selecione o tipo de despesa");
      return;
    }

    if (formData.valor_total <= 0) {
      toast.error("Valor deve ser maior que zero");
      return;
    }

    setLoading(true);
    try {
      const user = await base44.auth.me();
      
      // Gerar número único da despesa
      const agora = new Date();
      const ano = agora.getFullYear().toString().slice(-2);
      const mes = String(agora.getMonth() + 1).padStart(2, '0');
      
      const despesasMes = await base44.entities.DespesaExtra.filter({
        numero_despesa: { $regex: `^${ano}${mes}` }
      }, "-numero_despesa", 1);
      
      let sequencial = 1;
      if (despesasMes.length > 0) {
        const ultimoNum = despesasMes[0].numero_despesa;
        const ultimoSeq = parseInt(ultimoNum.split('-')[1]);
        sequencial = ultimoSeq + 1;
      }
      
      const numeroDespesa = `${ano}${mes}-${String(sequencial).padStart(4, '0')}`;

      // Buscar status padrão
      const statusList = await base44.entities.StatusDespesaExtra.filter({ padrao: true }, "ordem", 1);
      let statusPadrao = "pendente"; // fallback
      if (statusList.length > 0) {
        statusPadrao = statusList[0].codigo;
      }

      await base44.entities.DespesaExtra.create({
        numero_despesa: numeroDespesa,
        nota_fiscal_id: notaFiscal.id,
        tipo_despesa_id: formData.tipo_despesa_id,
        tipo_despesa_nome: formData.tipo_despesa_nome,
        descricao: formData.descricao,
        quantidade: formData.quantidade,
        valor_unitario: formData.valor_unitario,
        valor_total: formData.valor_total,
        unidade_cobranca: formData.unidade_cobranca,
        data_despesa: new Date().toISOString(),
        observacoes: `${formData.observacoes ? formData.observacoes + ' | ' : ''}Posição: ${linha}-${coluna}`,
        status: statusPadrao,
        registrado_por: user.id
      });

      toast.success(`Despesa ${numeroDespesa} criada!`);
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Erro ao criar despesa:", error);
      toast.error("Erro ao criar despesa");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Nova Despesa Extra - Posição {linha}-{coluna}</DialogTitle>
          <p className="text-sm text-muted-foreground mt-1">
            NF {notaFiscal?.numero_nota} - {notaFiscal?.emitente_razao_social}
          </p>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div>
            <Label>Tipo de Despesa *</Label>
            <Select
              value={formData.tipo_despesa_id}
              onValueChange={handleTipoChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo..." />
              </SelectTrigger>
              <SelectContent>
                {tiposDespesa.map(tipo => (
                  <SelectItem key={tipo.id} value={tipo.id}>
                    {tipo.nome} {tipo.valor_padrao > 0 && `(R$ ${tipo.valor_padrao.toLocaleString()})`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Descrição</Label>
            <Textarea
              value={formData.descricao}
              onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
              placeholder="Detalhe a despesa..."
              rows={2}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label>Quantidade *</Label>
              <Input
                type="number"
                step="0.01"
                value={formData.quantidade}
                onChange={(e) => setFormData({ ...formData, quantidade: parseFloat(e.target.value) || 1 })}
              />
            </div>
            <div>
              <Label>Valor Unitário (R$) *</Label>
              <Input
                type="number"
                step="0.01"
                value={formData.valor_unitario}
                onChange={(e) => setFormData({ ...formData, valor_unitario: parseFloat(e.target.value) || 0 })}
              />
            </div>
            <div>
              <Label>Valor Total (R$)</Label>
              <Input
                type="number"
                value={formData.valor_total.toFixed(2)}
                disabled
                className="bg-gray-100 dark:bg-gray-800 font-bold"
              />
            </div>
          </div>

          <div>
            <Label>Observações</Label>
            <Textarea
              value={formData.observacoes}
              onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
              placeholder="Informações adicionais..."
              rows={2}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={loading} className="bg-blue-600 hover:bg-blue-700">
            {loading ? "Criando..." : "Criar Despesa"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}