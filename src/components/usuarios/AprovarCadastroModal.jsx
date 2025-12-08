import React, { useState } from "react";
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
import { CheckCircle, XCircle, AlertCircle, Loader2, Building2, User } from "lucide-react";
import { toast } from "sonner";

export default function AprovarCadastroModal({ open, onClose, usuario, empresa, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    tipo_perfil: usuario?.tipo_perfil || "operador",
    admin_operador: usuario?.admin_operador || false,
    cargo: usuario?.cargo || "",
  });

  const handleAprovar = async () => {
    setLoading(true);
    try {
      await base44.entities.User.update(usuario.id, {
        status_cadastro: "aprovado",
        aprovado_por: (await base44.auth.me()).email,
        data_aprovacao: new Date().toISOString(),
        tipo_perfil: formData.tipo_perfil,
        admin_operador: formData.admin_operador,
        cargo: formData.cargo
      });

      toast.success("Cadastro aprovado com sucesso!");
      onClose();
      onSuccess();
    } catch (error) {
      console.error("Erro ao aprovar cadastro:", error);
      toast.error("Erro ao aprovar cadastro");
    } finally {
      setLoading(false);
    }
  };

  const handleRejeitar = async () => {
    if (!confirm("Tem certeza que deseja rejeitar este cadastro? O usuário não poderá acessar o sistema.")) {
      return;
    }

    setLoading(true);
    try {
      await base44.entities.User.update(usuario.id, {
        status_cadastro: "rejeitado",
        aprovado_por: (await base44.auth.me()).email,
        data_aprovacao: new Date().toISOString()
      });

      toast.success("Cadastro rejeitado");
      onClose();
      onSuccess();
    } catch (error) {
      console.error("Erro ao rejeitar cadastro:", error);
      toast.error("Erro ao rejeitar cadastro");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Aprovar Cadastro de Administrador</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Alert className="bg-yellow-50 border-yellow-200">
            <AlertCircle className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-800">
              <strong>Atenção:</strong> Este usuário está solicitando ser o primeiro administrador do operador logístico.
              Somente um administrador é permitido por operador.
            </AlertDescription>
          </Alert>

          <div className="space-y-3 border rounded-lg p-4 bg-gray-50">
            <div className="flex items-center gap-2 mb-2">
              <User className="w-5 h-5 text-gray-600" />
              <h3 className="font-semibold">Dados do Usuário</h3>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs text-gray-500">Nome</Label>
                <p className="font-medium text-sm">{usuario.full_name}</p>
              </div>
              <div>
                <Label className="text-xs text-gray-500">Email</Label>
                <p className="font-medium text-sm">{usuario.email}</p>
              </div>
              <div className="col-span-2">
                <Label>Tipo de Perfil</Label>
                <Select
                  value={formData.tipo_perfil}
                  onValueChange={(value) => setFormData({ ...formData, tipo_perfil: value })}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="operador">Operador Logístico</SelectItem>
                    <SelectItem value="fornecedor">Fornecedor</SelectItem>
                    <SelectItem value="cliente">Cliente</SelectItem>
                    <SelectItem value="motorista">Motorista</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {formData.tipo_perfil === "operador" && (
                <div className="col-span-2">
                  <Label>Tipo de Acesso</Label>
                  <Select
                    value={formData.admin_operador ? "admin" : "operador"}
                    onValueChange={(value) => setFormData({ ...formData, admin_operador: value === "admin" })}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Administrador</SelectItem>
                      <SelectItem value="operador">Operador</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div className="col-span-2">
                <Label>Cargo</Label>
                <Input
                  value={formData.cargo}
                  onChange={(e) => setFormData({ ...formData, cargo: e.target.value })}
                  placeholder="Ex: Gerente de Operações"
                  className="mt-1"
                />
              </div>
            </div>
          </div>

          {empresa && (
            <div className="space-y-3 border rounded-lg p-4 bg-gray-50">
              <div className="flex items-center gap-2 mb-2">
                <Building2 className="w-5 h-5 text-gray-600" />
                <h3 className="font-semibold">Dados da Empresa</h3>
              </div>
              
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <Label className="text-xs text-gray-500">CNPJ</Label>
                  <p className="font-medium">{empresa.cnpj}</p>
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Razão Social</Label>
                  <p className="font-medium">{empresa.razao_social}</p>
                </div>
                <div className="col-span-2">
                  <Label className="text-xs text-gray-500">Nome Fantasia</Label>
                  <p className="font-medium">{empresa.nome_fantasia}</p>
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={loading}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleRejeitar}
              disabled={loading}
              className="flex-1"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Rejeitando...
                </>
              ) : (
                <>
                  <XCircle className="w-4 h-4 mr-2" />
                  Rejeitar
                </>
              )}
            </Button>
            <Button
              onClick={handleAprovar}
              disabled={loading}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Aprovando...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Aprovar
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}