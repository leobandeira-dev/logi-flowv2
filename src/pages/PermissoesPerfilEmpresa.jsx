import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Plus, Edit, Trash2, Shield, Check, X, Building2, Loader2 } from "lucide-react";
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
  { id: "GestaoDeCTe", nome: "Gestão de CT-e", categoria: "Armazém" },
  { id: "EtiquetasMae", nome: "Etiquetas Mãe", categoria: "Armazém" },
  { id: "Carregamento", nome: "Carregamento", categoria: "Armazém" },
  { id: "OrdemDeEntrega", nome: "Ordem de Entrega", categoria: "Armazém" },
  { id: "Motoristas", nome: "Motoristas", categoria: "Recursos" },
  { id: "Veiculos", nome: "Veículos", categoria: "Recursos" },
  { id: "Parceiros", nome: "Parceiros", categoria: "Recursos" },
  { id: "Operacoes", nome: "Operações", categoria: "Recursos" },
  { id: "Tabelas", nome: "Tabelas de Preços", categoria: "Recursos" },
  { id: "Usuarios", nome: "Gestão de Usuários", categoria: "Recursos" },
  { id: "OcorrenciasGestao", nome: "Ocorrências", categoria: "Qualidade" },
  { id: "Gamificacao", nome: "Gamificação", categoria: "Qualidade" },
  { id: "AppMotorista", nome: "App Motorista", categoria: "Comunicação" },
  { id: "SAC", nome: "SAC", categoria: "Comunicação" }
];

const FUNCIONALIDADES_DISPONIVEIS = [
  { id: "importar_pdf", nome: "Importar PDF de Ordens" },
  { id: "exportar_relatorios", nome: "Exportar Relatórios" },
  { id: "gerenciar_ocorrencias", nome: "Gerenciar Ocorrências" },
  { id: "aprovar_diarias", nome: "Aprovar Diárias" },
  { id: "expurgar_sla", nome: "Expurgar SLA" },
  { id: "editar_tracking", nome: "Editar Tracking Manual" },
  { id: "configurar_etapas", nome: "Configurar Etapas" },
  { id: "convidar_usuarios", nome: "Convidar Usuários" }
];

export default function PermissoesPerfilEmpresa() {
  const [perfis, setPerfis] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingPerfil, setEditingPerfil] = useState(null);
  const [formData, setFormData] = useState({
    nome: "",
    codigo: "",
    descricao: "",
    permissoes: {
      paginas: [],
      funcionalidades: []
    }
  });

  useEffect(() => {
    loadPerfis();
  }, []);

  const loadPerfis = async () => {
    try {
      const data = await base44.entities.PerfilEmpresa.list();
      setPerfis(data);
    } catch (error) {
      console.error("Erro ao carregar perfis:", error);
      toast.error("Erro ao carregar perfis");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenForm = (perfil = null) => {
    if (perfil) {
      setEditingPerfil(perfil);
      setFormData({
        nome: perfil.nome,
        codigo: perfil.codigo,
        descricao: perfil.descricao || "",
        permissoes: perfil.permissoes || { paginas: [], funcionalidades: [] }
      });
    } else {
      setEditingPerfil(null);
      setFormData({
        nome: "",
        codigo: "",
        descricao: "",
        permissoes: { paginas: [], funcionalidades: [] }
      });
    }
    setShowForm(true);
  };

  const handleSubmit = async () => {
    if (!formData.nome || !formData.codigo) {
      toast.error("Preencha nome e código");
      return;
    }

    try {
      if (editingPerfil) {
        await base44.entities.PerfilEmpresa.update(editingPerfil.id, formData);
        toast.success("Perfil atualizado!");
      } else {
        await base44.entities.PerfilEmpresa.create(formData);
        toast.success("Perfil criado!");
      }
      loadPerfis();
      setShowForm(false);
    } catch (error) {
      console.error("Erro ao salvar:", error);
      toast.error("Erro ao salvar perfil");
    }
  };

  const handleDelete = async (perfilId) => {
    if (!confirm("Deseja realmente excluir este perfil?")) return;

    try {
      await base44.entities.PerfilEmpresa.delete(perfilId);
      toast.success("Perfil excluído!");
      loadPerfis();
    } catch (error) {
      console.error("Erro ao excluir:", error);
      toast.error("Erro ao excluir perfil");
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

  const toggleFuncionalidade = (funcId) => {
    setFormData(prev => {
      const funcs = prev.permissoes.funcionalidades || [];
      const newFuncs = funcs.includes(funcId)
        ? funcs.filter(f => f !== funcId)
        : [...funcs, funcId];
      return {
        ...prev,
        permissoes: { ...prev.permissoes, funcionalidades: newFuncs }
      };
    });
  };

  const categoriasPaginas = [...new Set(PAGINAS_DISPONIVEIS.map(p => p.categoria))];

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
            <Shield className="w-8 h-8 text-blue-600" />
            Permissões por Perfil de Empresa
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Configure quais recursos cada tipo de empresa pode acessar (Admin apenas)
          </p>
        </div>
        <Button onClick={() => handleOpenForm()} className="bg-blue-600">
          <Plus className="w-4 h-4 mr-2" />
          Novo Perfil
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {perfis.map(perfil => (
          <Card key={perfil.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-blue-600" />
                    {perfil.nome}
                  </CardTitle>
                  <Badge className="mt-2 font-mono text-xs">{perfil.codigo}</Badge>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm" onClick={() => handleOpenForm(perfil)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(perfil.id)}>
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {perfil.descricao && (
                <p className="text-sm text-gray-600 mb-3">{perfil.descricao}</p>
              )}
              <div className="space-y-2 text-sm">
                <div>
                  <p className="font-semibold text-gray-700">Páginas:</p>
                  <p className="text-gray-600">{perfil.permissoes?.paginas?.length || 0} permitidas</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-700">Funcionalidades:</p>
                  <p className="text-gray-600">{perfil.permissoes?.funcionalidades?.length || 0} habilitadas</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Form Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingPerfil ? "Editar Perfil de Empresa" : "Novo Perfil de Empresa"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Nome do Perfil *</Label>
                <Input
                  value={formData.nome}
                  onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
                  placeholder="Ex: Transportadora Full"
                />
              </div>
              <div>
                <Label>Código *</Label>
                <Input
                  value={formData.codigo}
                  onChange={(e) => setFormData(prev => ({ ...prev, codigo: e.target.value.toUpperCase() }))}
                  placeholder="Ex: TRANSP_FULL"
                  className="font-mono"
                />
              </div>
            </div>

            <div>
              <Label>Descrição</Label>
              <Textarea
                value={formData.descricao}
                onChange={(e) => setFormData(prev => ({ ...prev, descricao: e.target.value }))}
                placeholder="Descreva as características deste perfil"
                rows={3}
              />
            </div>

            {/* Páginas */}
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5 text-blue-600" />
                Páginas Permitidas
              </h3>
              <div className="space-y-4">
                {categoriasPaginas.map(categoria => {
                  const paginasCategoria = PAGINAS_DISPONIVEIS.filter(p => p.categoria === categoria);
                  const todasSelecionadas = paginasCategoria.every(p => formData.permissoes.paginas?.includes(p.id));
                  
                  return (
                    <div key={categoria}>
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-semibold text-gray-700">{categoria}</h4>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            if (todasSelecionadas) {
                              setFormData(prev => ({
                                ...prev,
                                permissoes: {
                                  ...prev.permissoes,
                                  paginas: prev.permissoes.paginas.filter(p => !paginasCategoria.map(pc => pc.id).includes(p))
                                }
                              }));
                            } else {
                              setFormData(prev => ({
                                ...prev,
                                permissoes: {
                                  ...prev.permissoes,
                                  paginas: [...new Set([...prev.permissoes.paginas, ...paginasCategoria.map(p => p.id)])]
                                }
                              }));
                            }
                          }}
                          className="text-xs"
                        >
                          {todasSelecionadas ? "Desmarcar Todos" : "Marcar Todos"}
                        </Button>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {paginasCategoria.map(pagina => {
                          const isSelected = formData.permissoes.paginas?.includes(pagina.id);
                          return (
                            <button
                              key={pagina.id}
                              type="button"
                              onClick={() => togglePagina(pagina.id)}
                              className={`p-2 rounded-lg border text-left text-sm transition-all ${
                                isSelected
                                  ? 'bg-blue-50 border-blue-500 text-blue-900'
                                  : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <div className={`w-4 h-4 rounded border flex items-center justify-center ${
                                  isSelected ? 'bg-blue-600 border-blue-600' : 'border-gray-300'
                                }`}>
                                  {isSelected && <Check className="w-3 h-3 text-white" />}
                                </div>
                                <span>{pagina.nome}</span>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Funcionalidades */}
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold mb-4">Funcionalidades Especiais</h3>
              <div className="grid grid-cols-2 gap-2">
                {FUNCIONALIDADES_DISPONIVEIS.map(func => {
                  const isSelected = formData.permissoes.funcionalidades?.includes(func.id);
                  return (
                    <button
                      key={func.id}
                      type="button"
                      onClick={() => toggleFuncionalidade(func.id)}
                      className={`p-3 rounded-lg border text-left text-sm transition-all ${
                        isSelected
                          ? 'bg-green-50 border-green-500 text-green-900'
                          : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div className={`w-4 h-4 rounded border flex items-center justify-center ${
                          isSelected ? 'bg-green-600 border-green-600' : 'border-gray-300'
                        }`}>
                          {isSelected && <Check className="w-3 h-3 text-white" />}
                        </div>
                        <span>{func.nome}</span>
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
              {editingPerfil ? "Atualizar" : "Criar"} Perfil
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}