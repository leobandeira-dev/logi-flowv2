import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, AlertCircle, CheckCircle } from "lucide-react";
import { toast } from "sonner";

export default function MeuPerfilModal({ open, onClose, user, onSuccess }) {
  const [formData, setFormData] = useState({
    tipo_perfil: user?.tipo_perfil || "",
    cargo: user?.cargo || "",
    departamento: user?.departamento || "",
    telefone: user?.telefone || "",
    empresa_id: user?.empresa_id || "",
    cnpj_associado: user?.cnpj_associado || "",
  });
  const [loading, setLoading] = useState(false);
  const [empresas, setEmpresas] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (open) {
      loadEmpresas();
    }
  }, [open]);

  const loadEmpresas = async () => {
    try {
      const empresasData = await base44.entities.Empresa.list();
      setEmpresas(empresasData);
    } catch (error) {
      console.error("Erro ao carregar empresas:", error);
    }
  };

  const formatCNPJ = (value) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 14) {
      return numbers
        .replace(/(\d{2})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1/$2')
        .replace(/(\d{4})(\d)/, '$1-$2');
    }
    return value;
  };

  const getDadosFaltantes = () => {
    const faltantes = [];
    
    if (!formData.tipo_perfil) {
      faltantes.push("Tipo de Perfil");
    }
    
    if (formData.tipo_perfil === "operador" && !formData.empresa_id) {
      faltantes.push("Empresa Operadora");
    }
    
    if ((formData.tipo_perfil === "fornecedor" || formData.tipo_perfil === "cliente") && !formData.cnpj_associado) {
      faltantes.push("CNPJ da Empresa");
    }
    
    return faltantes;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const updateData = {
        tipo_perfil: formData.tipo_perfil,
        cargo: formData.cargo,
        departamento: formData.departamento,
        telefone: formData.telefone,
      };

      if (formData.tipo_perfil === "operador") {
        updateData.empresa_id = formData.empresa_id;
        updateData.cnpj_associado = null;
      } else if (formData.tipo_perfil === "fornecedor" || formData.tipo_perfil === "cliente") {
        updateData.cnpj_associado = formData.cnpj_associado;
        updateData.empresa_id = null;
      }

      await base44.auth.updateMe(updateData);
      
      toast.success("Perfil atualizado com sucesso!");
      onSuccess();
      onClose();
    } catch (err) {
      console.error("Erro ao atualizar perfil:", err);
      setError("Erro ao atualizar perfil. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const dadosFaltantes = getDadosFaltantes();

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Meu Perfil</DialogTitle>
        </DialogHeader>

        {dadosFaltantes.length > 0 && (
          <Alert className="bg-orange-50 border-orange-200">
            <AlertCircle className="w-4 h-4 text-orange-600" />
            <AlertDescription className="text-orange-800">
              <strong>Atenção:</strong> Complete os seguintes dados obrigatórios: {dadosFaltantes.join(", ")}
            </AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="w-4 h-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label>Nome Completo</Label>
              <Input value={user?.full_name || ""} disabled className="bg-gray-50" />
              <p className="text-xs text-gray-500 mt-1">Nome não pode ser editado</p>
            </div>

            <div className="col-span-2">
              <Label>Email</Label>
              <Input value={user?.email || ""} disabled className="bg-gray-50" />
              <p className="text-xs text-gray-500 mt-1">Email não pode ser editado</p>
            </div>

            <div className="col-span-2">
              <Label>Tipo de Perfil *</Label>
              <Select
                value={formData.tipo_perfil}
                onValueChange={(value) => setFormData({ ...formData, tipo_perfil: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o perfil" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="operador">Operador Logístico</SelectItem>
                  <SelectItem value="fornecedor">Fornecedor</SelectItem>
                  <SelectItem value="cliente">Cliente</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.tipo_perfil === "operador" && (
              <div className="col-span-2">
                <Label>Empresa Operadora *</Label>
                <Select
                  value={formData.empresa_id}
                  onValueChange={(value) => setFormData({ ...formData, empresa_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a empresa" />
                  </SelectTrigger>
                  <SelectContent>
                    {empresas?.map((emp) => (
                      <SelectItem key={emp.id} value={emp.id}>
                        {emp.nome_fantasia || emp.razao_social}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {(formData.tipo_perfil === "fornecedor" || formData.tipo_perfil === "cliente") && (
              <div className="col-span-2">
                <Label>CNPJ da sua Empresa *</Label>
                <Input
                  value={formData.cnpj_associado}
                  onChange={(e) => setFormData({ ...formData, cnpj_associado: formatCNPJ(e.target.value) })}
                  placeholder="00.000.000/0000-00"
                  maxLength={18}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {formData.tipo_perfil === "fornecedor" ? "CNPJ da sua empresa fornecedora" : "CNPJ da sua empresa cliente"}
                </p>
              </div>
            )}

            <div>
              <Label>Cargo</Label>
              <Input
                value={formData.cargo}
                onChange={(e) => setFormData({ ...formData, cargo: e.target.value })}
                placeholder="Ex: Gerente de Operações"
              />
            </div>

            <div>
              <Label>Departamento</Label>
              <Input
                value={formData.departamento}
                onChange={(e) => setFormData({ ...formData, departamento: e.target.value })}
                placeholder="Ex: Logística"
              />
            </div>

            <div className="col-span-2">
              <Label>Telefone</Label>
              <Input
                value={formData.telefone}
                onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                placeholder="(11) 98765-4321"
              />
            </div>
          </div>

          {dadosFaltantes.length === 0 && (
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <AlertDescription className="text-green-800">
                Seu cadastro está completo! Você pode atualizar seus dados a qualquer momento.
              </AlertDescription>
            </Alert>
          )}

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={loading || dadosFaltantes.length > 0} 
              className="bg-blue-600 hover:bg-blue-700"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                "Salvar Perfil"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}