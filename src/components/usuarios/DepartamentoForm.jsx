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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, AlertCircle, X, UserPlus, User } from "lucide-react";
import { toast } from "sonner";

const CORES_DEPARTAMENTO = [
  { value: "#3b82f6", label: "Azul" },
  { value: "#10b981", label: "Verde" },
  { value: "#f59e0b", label: "Laranja" },
  { value: "#ef4444", label: "Vermelho" },
  { value: "#8b5cf6", label: "Roxo" },
  { value: "#ec4899", label: "Rosa" },
  { value: "#06b6d4", label: "Ciano" },
  { value: "#64748b", label: "Cinza" },
];

export default function DepartamentoForm({ open, onClose, departamento, usuarios, empresa, onSuccess }) {
  const [formData, setFormData] = useState({
    nome: departamento?.nome || "",
    descricao: departamento?.descricao || "",
    cor: departamento?.cor || "#3b82f6",
    usuarios_ids: departamento?.usuarios_ids || [],
    responsavel_id: departamento?.responsavel_id || "",
    empresa_id: empresa?.id || "",
    ativo: departamento?.ativo !== false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchUsuario, setSearchUsuario] = useState("");
  const [searchLider, setSearchLider] = useState("");
  const [showLiderDropdown, setShowLiderDropdown] = useState(false);

  // Inicializar nome do líder ao abrir o modal para edição
  React.useEffect(() => {
    if (departamento?.responsavel_id) {
      const lider = usuarios.find(u => u.id === departamento.responsavel_id);
      if (lider) {
        setSearchLider(lider.full_name);
      }
    }
  }, [departamento, usuarios]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (!formData.nome.trim()) {
        setError("Nome do departamento é obrigatório");
        setLoading(false);
        return;
      }

      if (departamento) {
        await base44.entities.Departamento.update(departamento.id, formData);
        toast.success("Departamento atualizado com sucesso!");
      } else {
        await base44.entities.Departamento.create(formData);
        toast.success("Departamento criado com sucesso!");
      }

      onClose();
      onSuccess();
    } catch (err) {
      console.error("Erro ao salvar departamento:", err);
      setError("Erro ao salvar departamento. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const toggleUsuario = (userId) => {
    setFormData(prev => ({
      ...prev,
      usuarios_ids: prev.usuarios_ids.includes(userId)
        ? prev.usuarios_ids.filter(id => id !== userId)
        : [...prev.usuarios_ids, userId]
    }));
  };

  const usuariosDisponiveis = usuarios.filter(u => 
    u.empresa_id === empresa?.id && u.status_cadastro === "aprovado"
  );

  return (
    <Dialog 
      open={open} 
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          setShowLiderDropdown(false);
        }
        onClose();
      }}
    >
      <DialogContent 
        className="sm:max-w-2xl max-h-[90vh] overflow-y-auto"
        onInteractOutside={(e) => {
          if (showLiderDropdown) {
            e.preventDefault();
            setShowLiderDropdown(false);
          }
        }}
      >
        <DialogHeader>
          <DialogTitle>
            {departamento ? "Editar Departamento" : "Novo Departamento"}
          </DialogTitle>
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
              <Label>Nome do Departamento *</Label>
              <Input
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                placeholder="Ex: Operações, Comercial, TI..."
                required
              />
            </div>

            <div className="col-span-2">
              <Label>Descrição</Label>
              <Textarea
                value={formData.descricao}
                onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                placeholder="Descrição das responsabilidades do departamento"
                rows={2}
              />
            </div>

            <div>
              <Label>Cor de Identificação</Label>
              <Select
                value={formData.cor}
                onValueChange={(value) => setFormData({ ...formData, cor: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CORES_DEPARTAMENTO.map((cor) => (
                    <SelectItem key={cor.value} value={cor.value}>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-4 h-4 rounded"
                          style={{ backgroundColor: cor.value }}
                        />
                        <span>{cor.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="relative">
              <Label>Líder do Departamento</Label>
              <div className="relative">
                <Input
                  placeholder="Pesquisar líder..."
                  value={searchLider}
                  onChange={(e) => {
                    setSearchLider(e.target.value);
                    setShowLiderDropdown(true);
                  }}
                  onFocus={() => setShowLiderDropdown(true)}
                  className="pr-8"
                />
                {formData.responsavel_id && (
                  <button
                    type="button"
                    onClick={() => {
                      setFormData({ ...formData, responsavel_id: "" });
                      setSearchLider("");
                    }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {formData.responsavel_id && (
                <div className="mt-2">
                  <Badge className="bg-purple-100 text-purple-800">
                    {usuariosDisponiveis.find(u => u.id === formData.responsavel_id)?.full_name}
                  </Badge>
                </div>
              )}

              {showLiderDropdown && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  <div className="p-2">
                    <button
                      type="button"
                      onClick={() => {
                        setFormData({ ...formData, responsavel_id: "" });
                        setSearchLider("");
                        setShowLiderDropdown(false);
                      }}
                      className="w-full text-left px-3 py-2 rounded hover:bg-gray-100 text-sm text-gray-600"
                    >
                      Nenhum líder
                    </button>
                    {usuariosDisponiveis
                      .filter(u => 
                        !searchLider || 
                        u.full_name.toLowerCase().includes(searchLider.toLowerCase()) ||
                        u.email.toLowerCase().includes(searchLider.toLowerCase()) ||
                        u.cargo?.toLowerCase().includes(searchLider.toLowerCase())
                      )
                      .map((usuario) => (
                        <button
                          key={usuario.id}
                          type="button"
                          onClick={() => {
                            setFormData({ ...formData, responsavel_id: usuario.id });
                            setSearchLider(usuario.full_name);
                            setShowLiderDropdown(false);
                          }}
                          className="w-full text-left px-3 py-2 rounded hover:bg-blue-50 transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0 bg-blue-100">
                              {usuario.foto_url ? (
                                <img
                                  src={usuario.foto_url}
                                  alt={usuario.full_name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <User className="w-4 h-4 text-blue-600" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {usuario.full_name}
                              </p>
                              <p className="text-xs text-gray-500 truncate">
                                {usuario.cargo || usuario.email}
                              </p>
                            </div>
                          </div>
                        </button>
                      ))}
                    {usuariosDisponiveis.filter(u => 
                      !searchLider || 
                      u.full_name.toLowerCase().includes(searchLider.toLowerCase()) ||
                      u.email.toLowerCase().includes(searchLider.toLowerCase()) ||
                      u.cargo?.toLowerCase().includes(searchLider.toLowerCase())
                    ).length === 0 && searchLider && (
                      <p className="px-3 py-2 text-sm text-gray-500 text-center">
                        Nenhum usuário encontrado
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="col-span-2">
              <Label className="mb-2 block">
                Membros do Departamento ({formData.usuarios_ids.length})
              </Label>
              <Input
                placeholder="Buscar usuário por nome..."
                value={searchUsuario}
                onChange={(e) => setSearchUsuario(e.target.value)}
                className="mb-3"
              />
              <div className="border rounded-lg p-3 max-h-60 overflow-y-auto bg-gray-50">
                {usuariosDisponiveis.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4">
                    Nenhum usuário disponível
                  </p>
                ) : (
                  <div className="space-y-2">
                    {usuariosDisponiveis
                      .filter(u => 
                        !searchUsuario || 
                        u.full_name.toLowerCase().includes(searchUsuario.toLowerCase()) ||
                        u.email.toLowerCase().includes(searchUsuario.toLowerCase()) ||
                        u.cargo?.toLowerCase().includes(searchUsuario.toLowerCase())
                      )
                      .map((usuario) => {
                      const isSelecionado = formData.usuarios_ids.includes(usuario.id);
                      return (
                        <div
                          key={usuario.id}
                          onClick={() => toggleUsuario(usuario.id)}
                          className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors ${
                            isSelecionado
                              ? "bg-blue-100 border-2 border-blue-500"
                              : "bg-white border border-gray-200 hover:bg-gray-100"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={isSelecionado}
                              onChange={() => {}}
                              className="w-4 h-4 text-blue-600"
                            />
                            <div>
                              <p className="text-sm font-medium">{usuario.full_name}</p>
                              <p className="text-xs text-gray-500">{usuario.cargo || usuario.email}</p>
                            </div>
                          </div>
                          {usuario.id === formData.responsavel_id && (
                            <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-300">
                              Líder
                            </Badge>
                          )}
                        </div>
                      );
                    })}
                    {usuariosDisponiveis.filter(u => 
                      !searchUsuario || 
                      u.full_name.toLowerCase().includes(searchUsuario.toLowerCase()) ||
                      u.email.toLowerCase().includes(searchUsuario.toLowerCase()) ||
                      u.cargo?.toLowerCase().includes(searchUsuario.toLowerCase())
                    ).length === 0 && searchUsuario && (
                      <p className="text-sm text-gray-500 text-center py-4">
                        Nenhum usuário encontrado com "{searchUsuario}"
                      </p>
                    )}
                    </div>
                    )}
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                    Clique nos usuários para adicioná-los ao departamento
                    </p>
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
                <>
                  <UserPlus className="w-4 h-4 mr-2" />
                  {departamento ? "Atualizar" : "Criar"} Departamento
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}