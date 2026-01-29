import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { base44 } from "@/api/base44Client";
import { Upload, X, Check, ChevronsUpDown } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function DespesaExtraForm({ open, onClose, despesa, notaFiscal, ordem, onSuccess }) {
  const [formData, setFormData] = useState({
    tipo_despesa_id: "",
    tipo_despesa_nome: "",
    numero_movimento_erp: "",
    descricao: "",
    quantidade: 1,
    valor_unitario: 0,
    valor_total: 0,
    unidade_cobranca: "unidade",
    data_despesa: new Date().toISOString().slice(0, 16),
    observacoes: "",
    comprovante_url: "",
    nota_fiscal_id: ""
  });
  const [tiposDespesa, setTiposDespesa] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [notasFiscais, setNotasFiscais] = useState([]);
  const [openNotaCombobox, setOpenNotaCombobox] = useState(false);

  useEffect(() => {
    loadTiposDespesa();
    if (!notaFiscal) {
      loadNotasFiscais();
    }
    if (despesa) {
      setFormData({
        tipo_despesa_id: despesa.tipo_despesa_id || "",
        tipo_despesa_nome: despesa.tipo_despesa_nome || "",
        numero_movimento_erp: despesa.numero_movimento_erp || "",
        descricao: despesa.descricao || "",
        quantidade: despesa.quantidade || 1,
        valor_unitario: despesa.valor_unitario || 0,
        valor_total: despesa.valor_total || 0,
        unidade_cobranca: despesa.unidade_cobranca || "unidade",
        data_despesa: despesa.data_despesa ? new Date(despesa.data_despesa).toISOString().slice(0, 16) : new Date().toISOString().slice(0, 16),
        observacoes: despesa.observacoes || "",
        comprovante_url: despesa.comprovante_url || "",
        nota_fiscal_id: despesa.nota_fiscal_id || ""
      });
    }
  }, [despesa]);

  const loadTiposDespesa = async () => {
    try {
      const tipos = await base44.entities.TipoDespesaExtra.filter({ ativo: true });
      setTiposDespesa(tipos);
    } catch (error) {
      console.error("Erro ao carregar tipos:", error);
    }
  };

  const loadNotasFiscais = async () => {
    try {
      const notas = await base44.entities.NotaFiscal.list("-created_date", 200);
      setNotasFiscais(notas);
    } catch (error) {
      console.error("Erro ao carregar notas fiscais:", error);
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

  const handleUploadComprovante = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setFormData({ ...formData, comprovante_url: file_url });
      toast.success("Comprovante anexado!");
    } catch (error) {
      console.error("Erro ao fazer upload:", error);
      toast.error("Erro ao anexar comprovante");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.tipo_despesa_nome) {
      toast.error("Selecione o tipo de despesa");
      return;
    }

    if (formData.valor_total <= 0) {
      toast.error("Valor deve ser maior que zero");
      return;
    }

    try {
      const user = await base44.auth.me();
      
      let numeroDespesa = despesa?.numero_despesa;
      
      // Gerar número único apenas para novas despesas
      if (!numeroDespesa) {
        const agora = new Date();
        const ano = agora.getFullYear().toString().slice(-2);
        const mes = String(agora.getMonth() + 1).padStart(2, '0');
        
        // Buscar última despesa do mês para sequencial
        const despesasMes = await base44.entities.DespesaExtra.filter({
          numero_despesa: { $regex: `^${ano}${mes}` }
        }, "-numero_despesa", 1);
        
        let sequencial = 1;
        if (despesasMes.length > 0) {
          const ultimoNum = despesasMes[0].numero_despesa;
          const ultimoSeq = parseInt(ultimoNum.split('-')[1]);
          sequencial = ultimoSeq + 1;
        }
        
        numeroDespesa = `${ano}${mes}-${String(sequencial).padStart(4, '0')}`;
      }

      const despesaData = {
        ...formData,
        numero_despesa: numeroDespesa,
        ordem_id: ordem?.id || null,
        nota_fiscal_id: formData.nota_fiscal_id || notaFiscal?.id || null,
        registrado_por: user.id,
        data_despesa: new Date(formData.data_despesa).toISOString()
      };

      if (despesa) {
        await base44.entities.DespesaExtra.update(despesa.id, despesaData);
        toast.success("Despesa atualizada!");
      } else {
        await base44.entities.DespesaExtra.create(despesaData);
        toast.success(`Despesa ${numeroDespesa} criada!`);
      }

      onSuccess();
    } catch (error) {
      console.error("Erro ao salvar despesa:", error);
      toast.error("Erro ao salvar despesa");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{despesa ? "Editar" : "Nova"} Despesa Extra</DialogTitle>
          {notaFiscal && (
            <p className="text-sm text-muted-foreground">
              NF {notaFiscal.numero_nota} - {notaFiscal.emitente_razao_social}
            </p>
          )}
        </DialogHeader>
        <div className="space-y-4 py-4">
          {!notaFiscal && (
            <div>
              <Label>Nota Fiscal (opcional)</Label>
              <Popover open={openNotaCombobox} onOpenChange={setOpenNotaCombobox}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={openNotaCombobox}
                    className="w-full justify-between"
                  >
                    {formData.nota_fiscal_id
                      ? (() => {
                          const nf = notasFiscais.find(n => n.id === formData.nota_fiscal_id);
                          return nf ? `NF ${nf.numero_nota} - ${nf.emitente_razao_social}` : "Sem nota fiscal";
                        })()
                      : "Selecione a nota fiscal..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[500px] p-0">
                  <Command>
                    <CommandInput placeholder="Buscar por número, emitente, destinatário ou chave..." />
                    <CommandList>
                      <CommandEmpty>Nenhuma nota fiscal encontrada.</CommandEmpty>
                      <CommandGroup>
                        <CommandItem
                          value="sem-nota"
                          onSelect={() => {
                            setFormData({ ...formData, nota_fiscal_id: "" });
                            setOpenNotaCombobox(false);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              !formData.nota_fiscal_id ? "opacity-100" : "opacity-0"
                            )}
                          />
                          Sem nota fiscal
                        </CommandItem>
                        {notasFiscais.map((nf) => (
                          <CommandItem
                            key={nf.id}
                            value={`${nf.numero_nota} ${nf.emitente_razao_social} ${nf.destinatario_razao_social || ""} ${nf.chave_acesso || ""}`}
                            onSelect={() => {
                              setFormData({ ...formData, nota_fiscal_id: nf.id });
                              setOpenNotaCombobox(false);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                formData.nota_fiscal_id === nf.id ? "opacity-100" : "opacity-0"
                              )}
                            />
                            NF {nf.numero_nota} - {nf.emitente_razao_social}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
          )}
          
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
            <Label>Número Movimento ERP</Label>
            <Input
              value={formData.numero_movimento_erp}
              onChange={(e) => setFormData({ ...formData, numero_movimento_erp: e.target.value })}
              placeholder="Número do movimento no ERP..."
            />
          </div>

          <div>
            <Label>Descrição</Label>
            <Textarea
              value={formData.descricao}
              onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
              placeholder="Detalhe a despesa..."
              rows={3}
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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Unidade de Cobrança</Label>
              <Select
                value={formData.unidade_cobranca}
                onValueChange={(value) => setFormData({ ...formData, unidade_cobranca: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unidade">Unidade</SelectItem>
                  <SelectItem value="tonelada">Tonelada</SelectItem>
                  <SelectItem value="m3">m³</SelectItem>
                  <SelectItem value="hora">Hora</SelectItem>
                  <SelectItem value="viagem">Viagem</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Data/Hora</Label>
              <Input
                type="datetime-local"
                value={formData.data_despesa}
                onChange={(e) => setFormData({ ...formData, data_despesa: e.target.value })}
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

          <div>
            <Label>Comprovante</Label>
            <div className="flex items-center gap-2 mt-1">
              <Input
                type="file"
                onChange={handleUploadComprovante}
                disabled={uploading}
                className="flex-1"
              />
              {formData.comprovante_url && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setFormData({ ...formData, comprovante_url: "" })}
                  className="h-9"
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
            {formData.comprovante_url && (
              <a
                href={formData.comprovante_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:underline mt-1 block"
              >
                Ver comprovante anexado
              </a>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleSubmit} className="bg-blue-600 hover:bg-blue-700">
            {despesa ? "Atualizar" : "Registrar"} Despesa
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}