import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
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
import { toast } from "sonner";

export default function ParceiroForm({ open, onClose, parceiro }) {
  const [formData, setFormData] = useState({
    cnpj: "",
    razao_social: "",
    nome_fantasia: "",
    tipo: "ambos",
    telefone: "",
    email: "",
    endereco: "",
    numero: "",
    complemento: "",
    bairro: "",
    cidade: "",
    uf: "",
    cep: "",
    inscricao_estadual: "",
    contato_nome: "",
    contato_cargo: "",
    contato_telefone: "",
    contato_email: "",
    observacoes: "",
    ativo: true
  });
  const [saving, setSaving] = useState(false);
  const [isDark, setIsDark] = useState(false);

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
    if (parceiro) {
      setFormData({ ...formData, ...parceiro });
    }
  }, [parceiro]);

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.cnpj || !formData.razao_social) {
      toast.error("Preencha CNPJ e Razão Social");
      return;
    }

    setSaving(true);
    try {
      if (parceiro) {
        await base44.entities.Parceiro.update(parceiro.id, formData);
        toast.success("Parceiro atualizado!");
      } else {
        await base44.entities.Parceiro.create(formData);
        toast.success("Parceiro cadastrado!");
      }
      onClose();
    } catch (error) {
      console.error("Erro ao salvar:", error);
      toast.error("Erro ao salvar parceiro");
    } finally {
      setSaving(false);
    }
  };

  const theme = {
    cardBg: isDark ? '#1e293b' : '#ffffff',
    border: isDark ? '#334155' : '#e5e7eb',
    text: isDark ? '#f1f5f9' : '#111827',
    textMuted: isDark ? '#94a3b8' : '#6b7280',
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto" style={{ backgroundColor: theme.cardBg, borderColor: theme.border }}>
        <DialogHeader>
          <DialogTitle style={{ color: theme.text }}>
            {parceiro ? "Editar Parceiro" : "Novo Parceiro"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="text-sm font-semibold" style={{ color: theme.text }}>Dados Principais</div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label style={{ color: theme.text }}>CNPJ *</Label>
                <Input
                  value={formData.cnpj}
                  onChange={(e) => handleChange("cnpj", e.target.value)}
                  placeholder="00.000.000/0000-00"
                  required
                  style={{ backgroundColor: theme.cardBg, borderColor: theme.border, color: theme.text }}
                />
              </div>
              <div>
                <Label style={{ color: theme.text }}>Tipo *</Label>
                <Select value={formData.tipo} onValueChange={(v) => handleChange("tipo", v)}>
                  <SelectTrigger style={{ backgroundColor: theme.cardBg, borderColor: theme.border, color: theme.text }}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent style={{ backgroundColor: theme.cardBg, borderColor: theme.border }}>
                    <SelectItem value="cliente">Cliente</SelectItem>
                    <SelectItem value="fornecedor">Fornecedor</SelectItem>
                    <SelectItem value="ambos">Ambos</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label style={{ color: theme.text }}>Razão Social *</Label>
                <Input
                  value={formData.razao_social}
                  onChange={(e) => handleChange("razao_social", e.target.value)}
                  required
                  style={{ backgroundColor: theme.cardBg, borderColor: theme.border, color: theme.text }}
                />
              </div>
              <div>
                <Label style={{ color: theme.text }}>Nome Fantasia</Label>
                <Input
                  value={formData.nome_fantasia}
                  onChange={(e) => handleChange("nome_fantasia", e.target.value)}
                  style={{ backgroundColor: theme.cardBg, borderColor: theme.border, color: theme.text }}
                />
              </div>
              <div>
                <Label style={{ color: theme.text }}>Inscrição Estadual</Label>
                <Input
                  value={formData.inscricao_estadual}
                  onChange={(e) => handleChange("inscricao_estadual", e.target.value)}
                  style={{ backgroundColor: theme.cardBg, borderColor: theme.border, color: theme.text }}
                />
              </div>
              <div>
                <Label style={{ color: theme.text }}>Telefone</Label>
                <Input
                  value={formData.telefone}
                  onChange={(e) => handleChange("telefone", e.target.value)}
                  style={{ backgroundColor: theme.cardBg, borderColor: theme.border, color: theme.text }}
                />
              </div>
              <div className="col-span-2">
                <Label style={{ color: theme.text }}>Email</Label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  style={{ backgroundColor: theme.cardBg, borderColor: theme.border, color: theme.text }}
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="text-sm font-semibold" style={{ color: theme.text }}>Endereço</div>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label style={{ color: theme.text }}>Endereço</Label>
                <Input
                  value={formData.endereco}
                  onChange={(e) => handleChange("endereco", e.target.value)}
                  style={{ backgroundColor: theme.cardBg, borderColor: theme.border, color: theme.text }}
                />
              </div>
              <div>
                <Label style={{ color: theme.text }}>Número</Label>
                <Input
                  value={formData.numero}
                  onChange={(e) => handleChange("numero", e.target.value)}
                  style={{ backgroundColor: theme.cardBg, borderColor: theme.border, color: theme.text }}
                />
              </div>
              <div>
                <Label style={{ color: theme.text }}>Complemento</Label>
                <Input
                  value={formData.complemento}
                  onChange={(e) => handleChange("complemento", e.target.value)}
                  style={{ backgroundColor: theme.cardBg, borderColor: theme.border, color: theme.text }}
                />
              </div>
              <div>
                <Label style={{ color: theme.text }}>Bairro</Label>
                <Input
                  value={formData.bairro}
                  onChange={(e) => handleChange("bairro", e.target.value)}
                  style={{ backgroundColor: theme.cardBg, borderColor: theme.border, color: theme.text }}
                />
              </div>
              <div>
                <Label style={{ color: theme.text }}>CEP</Label>
                <Input
                  value={formData.cep}
                  onChange={(e) => handleChange("cep", e.target.value)}
                  style={{ backgroundColor: theme.cardBg, borderColor: theme.border, color: theme.text }}
                />
              </div>
              <div>
                <Label style={{ color: theme.text }}>Cidade</Label>
                <Input
                  value={formData.cidade}
                  onChange={(e) => handleChange("cidade", e.target.value)}
                  style={{ backgroundColor: theme.cardBg, borderColor: theme.border, color: theme.text }}
                />
              </div>
              <div>
                <Label style={{ color: theme.text }}>UF</Label>
                <Input
                  value={formData.uf}
                  onChange={(e) => handleChange("uf", e.target.value.toUpperCase())}
                  maxLength={2}
                  style={{ backgroundColor: theme.cardBg, borderColor: theme.border, color: theme.text }}
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="text-sm font-semibold" style={{ color: theme.text }}>Contato</div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label style={{ color: theme.text }}>Nome do Contato</Label>
                <Input
                  value={formData.contato_nome}
                  onChange={(e) => handleChange("contato_nome", e.target.value)}
                  style={{ backgroundColor: theme.cardBg, borderColor: theme.border, color: theme.text }}
                />
              </div>
              <div>
                <Label style={{ color: theme.text }}>Cargo</Label>
                <Input
                  value={formData.contato_cargo}
                  onChange={(e) => handleChange("contato_cargo", e.target.value)}
                  style={{ backgroundColor: theme.cardBg, borderColor: theme.border, color: theme.text }}
                />
              </div>
              <div>
                <Label style={{ color: theme.text }}>Telefone do Contato</Label>
                <Input
                  value={formData.contato_telefone}
                  onChange={(e) => handleChange("contato_telefone", e.target.value)}
                  style={{ backgroundColor: theme.cardBg, borderColor: theme.border, color: theme.text }}
                />
              </div>
              <div>
                <Label style={{ color: theme.text }}>Email do Contato</Label>
                <Input
                  type="email"
                  value={formData.contato_email}
                  onChange={(e) => handleChange("contato_email", e.target.value)}
                  style={{ backgroundColor: theme.cardBg, borderColor: theme.border, color: theme.text }}
                />
              </div>
              <div className="col-span-2">
                <Label style={{ color: theme.text }}>Observações</Label>
                <Textarea
                  value={formData.observacoes}
                  onChange={(e) => handleChange("observacoes", e.target.value)}
                  rows={3}
                  style={{ backgroundColor: theme.cardBg, borderColor: theme.border, color: theme.text }}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} style={{ borderColor: theme.border, color: theme.text }}>
              Cancelar
            </Button>
            <Button type="submit" disabled={saving} className="bg-blue-600 hover:bg-blue-700 text-white">
              {saving ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}