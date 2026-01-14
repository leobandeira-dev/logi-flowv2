import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Edit, Shield, Check, X, Users, Loader2 } from "lucide-react";
import { toast } from "sonner";

const PAGINAS_DISPONIVEIS = [
  { id: "Dashboard", nome: "Dashboard", categoria: "Operações" },
  { id: "Tracking", nome: "Tracking", categoria: "Operações" },
  { id: "Fluxo", nome: "Fluxo de Processos", categoria: "Operações" },
  { id: "OrdensCarregamento", nome: "Ordens de Carregamento", categoria: "Operações" },
  { id: "FilaX", nome: "Fila X", categoria: "Operações" },
  { id: "Coletas", nome: "Dashboard Coletas", categoria: "Coletas" },
  { id: "SolicitacaoColeta", nome: "Solicitar Coleta", categoria: "Coletas" },
  { id: "AprovacaoColeta", nome: "Aprovar Coletas", categoria: "Coletas" },
  { id: "Recebimento", nome: "Recebimento", categoria: "Armazém" },
  { id: "GestaoDeNotasFiscais", nome: "Gestão de Notas Fiscais", categoria: "Armazém" },
  { id: "Carregamento", nome: "Carregamento", categoria: "Armazém" },
  { id: "Motoristas", nome: "Motoristas", categoria: "Recursos" },
  { id: "Veiculos", nome: "Veículos", categoria: "Recursos" },
  { id: "Parceiros", nome: "Parceiros", categoria: "Recursos" },
  { id: "OcorrenciasGestao", nome: "Ocorrências", categoria: "Qualidade" },
  { id: "AppMotorista", nome: "App Motorista", categoria: "Comunicação" }
];

const ACOES_DISPONIVEIS = [
  { id: "criar_ordens", nome: "Criar Ordens" },
  { id: "editar_ordens", nome: "Editar Ordens" },
  { id: "deletar_ordens", nome: "Deletar Ordens" },
  { id: "aprovar_coletas", nome: "Aprovar Coletas" },
  { id: "gerenciar_fluxo", nome: "Gerenciar Fluxo" },
  { id: "ver_tracking", nome: "Ver Tracking" },
  { id: "exportar_relatorios", nome: "Exportar Relatórios" },
  { id: "gerenciar_usuarios", nome: "Gerenciar Usuários" }
];

export default function PermissoesPerfilUsuario() {
  const [permissoes, setPermissoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingPermissao, setEditingPermissao] = useState(null);
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    tipo_perfil: "operador",
    nome_customizado: "",
    permissoes: {
      paginas: [],
      funcionalidades: [],
      acoes: {}
    }
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);

      if (!currentUser.empresa_id) {
        toast.error("Usuário sem empresa vinculada");
        setLoading(false);
        return;
      }

      const permissoesData = await base44.entities.PermissaoPerfilUsuario.filter({
        empresa_id: currentUser.empresa_id
      });
      setPermissoes(permissoesData);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      toast.error("Erro ao carregar permissões");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenForm = (permissao = null) => {
    if (permissao) {
      setEditingPermissao(permissao);
      setFormData({
        tipo_perfil: permissao.tipo_perfil,
        nome_customizado: permissao.nome_customizado || "",
        permissoes: permissao.permissoes || { paginas: [], funcionalidades: [], acoes: {} }
      });
    } else {
      setEditingPermissao(null);
      setFormData({
        tipo_perfil: "operador",
        nome_customizado: "",
        permissoes: { paginas: [], funcionalidades: [], acoes: {} }
      });
    }
    setShowForm(true);
  };

  const handleSubmit = async () => {
    if (!formData.tipo_perfil) {
      toast.error("Selecione o tipo de perfil");
      return;
    }

    try {
      const dataToSave = {
        ...formData,
        empresa_id: user.empresa_id
      };

      if (editingPermissao) {
        await base44.entities.PermissaoPerfilUsuario.update(editingPermissao.id, dataToSave);
        toast.success("Permissões atualizadas!");
      } else {
        await base44.entities.PermissaoPerfilUsuario.create(dataToSave);
        toast.success("Permissões criadas!");
      }
      loadData();
      setShowForm(false);
    } catch (error) {
      console.error("Erro ao salvar:", error);
      toast.error("Erro ao salvar permissões");
    }
  };

  const togglePagina = (paginaId) => {
    setFormData(prev => {
      const paginas = prev.permissoes.paginas || [];
      const newPaginas = paginas.includes(paginaId)
        ? paginas.filter(p => p !== paginaId)
        : [...paginas, paginaId];
      return {
        ...prev,
        permissoes: { ...prev.permissoes, paginas: newPaginas }
      };
    });
  };

  const toggleAcao = (acaoId) => {
    setFormData(prev => {
      const acoes = prev.permissoes.acoes || {};
      return {
        ...prev,
        permissoes: {
          ...prev.permissoes,
          acoes: { ...acoes, [acaoId]: !acoes[acaoId] }
        }
      };
    });
  };

  const getTipoPerfilLabel = (tipo) => {
    const labels = {
      operador: "Operador Logístico",
      fornecedor: "Fornecedor",
      cliente: "Cliente",
      motorista: "Motorista"
    };
    return labels[tipo] || tipo;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Users className="w-8 h-8 text-blue-600" />
            Permissões por Perfil de Usuário
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Configure o que cada tipo de usuário pode fazer na sua empresa
          </p>
        </div>
        <Button onClick={() => handleOpenForm()} className="bg-blue-600">
          <Plus className="w-4 h-4 mr-2" />
          Nova Configuração
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {permissoes.map(permissao => (
          <Card key={permissao.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">
                    {permissao.nome_customizado || getTipoPerfilLabel(permissao.tipo_perfil)}
                  </CardTitle>
                  <Badge className="mt-2">{getTipoPerfilLabel(permissao.tipo_perfil)}</Badge>
                </div>
                <Button variant="ghost" size="sm" onClick={() => handleOpenForm(permissao)}>
                  <Edit className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div>
                  <p className="font-semibold text-gray-700">Páginas:</p>
                  <p className="text-gray-600">{permissao.permissoes?.paginas?.length || 0} permitidas</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-700">Ações:</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {Object.entries(permissao.permissoes?.acoes || {})
                      .filter(([_, value]) => value)
                      .map(([key, _]) => (
                        <Badge key={key} variant="outline" className="text-xs">
                          {ACOES_DISPONIVEIS.find(a => a.id === key)?.nome || key}
                        </Badge>
                      ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {permissoes.length === 0 && (
          <div className="col-span-2 text-center py-12 border-2 border-dashed rounded-lg">
            <Users className="w-12 h-12 mx-auto mb-3 text-gray-400" />
            <p className="text-gray-600">Nenhuma configuração de permissão criada ainda</p>
            <Button onClick={() => handleOpenForm()} className="mt-4 bg-blue-600">
              <Plus className="w-4 h-4 mr-2" />
              Criar Primeira Configuração
            </Button>
          </div>
        )}
      </div>

      {/* Form Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingPermissao ? "Editar Permissões" : "Nova Configuração de Permissões"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Tipo de Perfil *</Label>
                <Select
                  value={formData.tipo_perfil}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, tipo_perfil: value }))}
                  disabled={!!editingPermissao}
                >
                  <SelectTrigger>
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
              <div>
                <Label>Nome Customizado (Opcional)</Label>
                <Input
                  value={formData.nome_customizado}
                  onChange={(e) => setFormData(prev => ({ ...prev, nome_customizado: e.target.value }))}
                  placeholder="Ex: Coordenador de Frota"
                />
              </div>
            </div>

            {/* Páginas */}
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold mb-4">Páginas Permitidas</h3>
              <div className="space-y-4">
                {[...new Set(PAGINAS_DISPONIVEIS.map(p => p.categoria))].map(categoria => (
                  <div key={categoria}>
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">{categoria}</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {PAGINAS_DISPONIVEIS.filter(p => p.categoria === categoria).map(pagina => {
                        const isSelected = formData.permissoes.paginas?.includes(pagina.id);
                        return (
                          <button
                            key={pagina.id}
                            type="button"
                            onClick={() => togglePagina(pagina.id)}
                            className={`p-2 rounded-lg border text-left text-sm transition-all ${
                              isSelected
                                ? 'bg-blue-50 border-blue-500 text-blue-900'
                                : 'bg-white border-gray-200 hover:bg-gray-50'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <div className={`w-4 h-4 rounded border ${
                                isSelected ? 'bg-blue-600 border-blue-600' : 'border-gray-300'
                              }`}>
                                {isSelected && <Check className="w-3 h-3 text-white" />}
                              </div>
                              <span className="text-xs">{pagina.nome}</span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Ações */}
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold mb-4">Ações Permitidas</h3>
              <div className="grid grid-cols-2 gap-3">
                {ACOES_DISPONIVEIS.map(acao => {
                  const isSelected = formData.permissoes.acoes?.[acao.id];
                  return (
                    <button
                      key={acao.id}
                      type="button"
                      onClick={() => toggleAcao(acao.id)}
                      className={`p-3 rounded-lg border text-left transition-all ${
                        isSelected
                          ? 'bg-green-50 border-green-500 text-green-900'
                          : 'bg-white border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div className={`w-4 h-4 rounded border ${
                          isSelected ? 'bg-green-600 border-green-600' : 'border-gray-300'
                        }`}>
                          {isSelected && <Check className="w-3 h-3 text-white" />}
                        </div>
                        <span className="text-sm">{acao.nome}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowForm(false)}>
              <X className="w-4 h-4 mr-2" />
              Cancelar
            </Button>
            <Button onClick={handleSubmit} className="bg-blue-600">
              <Shield className="w-4 h-4 mr-2" />
              {editingPermissao ? "Atualizar" : "Criar"} Configuração
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}