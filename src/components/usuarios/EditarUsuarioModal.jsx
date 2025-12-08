import React, { useState } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";

export default function EditarUsuarioModal({ open, onClose, usuario, onSuccess, currentUser, empresas, departamentos }) {
  const [formData, setFormData] = useState({
    tipo_perfil: usuario?.tipo_perfil || "",
    cargo: usuario?.cargo || "",
    departamento_id: usuario?.departamento_id || "",
    empresa_id: usuario?.empresa_id || "",
    cnpj_associado: usuario?.cnpj_associado || "",
    telefone: usuario?.telefone || "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const isAdmin = currentUser?.role === "admin";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const updateData = {
        cargo: formData.cargo,
        departamento_id: formData.departamento_id,
        telefone: formData.telefone,
      };

      // Admin pode alterar perfil, empresa e CNPJ
      if (isAdmin) {
        if (formData.tipo_perfil) {
          updateData.tipo_perfil = formData.tipo_perfil;
        }
        
        if (formData.tipo_perfil === "operador") {
          updateData.empresa_id = formData.empresa_id;
          updateData.cnpj_associado = null;
        } else if (formData.tipo_perfil === "fornecedor" || formData.tipo_perfil === "cliente") {
          updateData.cnpj_associado = formData.cnpj_associado;
          updateData.empresa_id = null;
        }
      }

      await base44.entities.User.update(usuario.id, updateData);
      
      toast.success("Usuário atualizado com sucesso!");
      onClose();
      onSuccess();
    } catch (err) {
      console.error("Erro ao atualizar usuário:", err);
      setError("Erro ao atualizar usuário. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Editar Usuário</DialogTitle>
        </DialogHeader>

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
              <Input value={usuario?.full_name || ""} disabled className="bg-gray-50" />
              <p className="text-xs text-gray-500 mt-1">Nome não pode ser editado</p>
            </div>

            <div className="col-span-2">
              <Label>Email</Label>
              <Input value={usuario?.email || ""} disabled className="bg-gray-50" />
              <p className="text-xs text-gray-500 mt-1">Email não pode ser editado</p>
            </div>

            {isAdmin && (
              <div className="col-span-2">
                <Label>Tipo de Perfil</Label>
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
                    <SelectItem value="motorista">Motorista</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {isAdmin && formData.tipo_perfil === "operador" && (
              <div className="col-span-2">
                <Label>Empresa Operadora</Label>
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

            {isAdmin && (formData.tipo_perfil === "fornecedor" || formData.tipo_perfil === "cliente") && (
              <div className="col-span-2">
                <Label>CNPJ Associado</Label>
                <Input
                  value={formData.cnpj_associado}
                  onChange={(e) => setFormData({ ...formData, cnpj_associado: e.target.value })}
                  placeholder="00.000.000/0000-00"
                />
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
              <Select
                value={formData.departamento_id}
                onValueChange={(value) => setFormData({ ...formData, departamento_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o departamento" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={null}>Nenhum departamento</SelectItem>
                  {departamentos?.filter(d => d.ativo).map((departamento) => (
                    <SelectItem key={departamento.id} value={departamento.id}>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: departamento.cor }}
                        />
                        {departamento.nome}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700">
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                "Salvar Alterações"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}