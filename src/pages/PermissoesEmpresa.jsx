import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Edit, Shield, Check, X, Building2, Loader2, Search } from "lucide-react";
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
  { id: "importar_pdf", nome: "Importar PDF" },
  { id: "exportar_relatorios", nome: "Exportar Relatórios" },
  { id: "gerenciar_ocorrencias", nome: "Gerenciar Ocorrências" },
  { id: "aprovar_diarias", nome: "Aprovar Diárias" },
  { id: "expurgar_sla", nome: "Expurgar SLA" },
  { id: "editar_tracking", nome: "Editar Tracking" }
];

export default function PermissoesEmpresa() {
  const [empresas, setEmpresas] = useState([]);
  const [perfis, setPerfis] = useState([]);
  const [permissoes, setPermissoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [empresaSelecionada, setEmpresaSelecionada] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    empresa_id: "",
    permissoes_customizadas: {
      paginas_adicionais: [],
      paginas_removidas: [],
      funcionalidades_adicionais: [],
      funcionalidades_removidas: []
    },
    observacoes: ""
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [empresasData, perfisData, permissoesData] = await Promise.all([
        base44.entities.Empresa.list(),
        base44.entities.PerfilEmpresa.list(),
        base44.entities.PermissaoEmpresaCustom.list()
      ]);
      setEmpresas(empresasData);
      setPerfis(perfisData);
      setPermissoes(permissoesData);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      toast.error("Erro ao carregar dados");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenForm = (empresa) => {
    const permissaoExistente = permissoes.find(p => p.empresa_id === empresa.id);
    
    setEmpresaSelecionada(empresa);
    if (permissaoExistente) {
      setFormData({
        empresa_id: empresa.id,
        permissoes_customizadas: permissaoExistente.permissoes_customizadas || {
          paginas_adicionais: [],
          paginas_removidas: [],
          funcionalidades_adicionais: [],
          funcionalidades_removidas: []
        },
        observacoes: permissaoExistente.observacoes || ""
      });
    } else {
      setFormData({
        empresa_id: empresa.id,
        permissoes_customizadas: {
          paginas_adicionais: [],
          paginas_removidas: [],
          funcionalidades_adicionais: [],
          funcionalidades_removidas: []
        },
        observacoes: ""
      });
    }
    setShowForm(true);
  };

  const handleSubmit = async () => {
    try {
      const permissaoExistente = permissoes.find(p => p.empresa_id === formData.empresa_id);
      
      if (permissaoExistente) {
        await base44.entities.PermissaoEmpresaCustom.update(permissaoExistente.id, formData);
        toast.success("Permissões atualizadas!");
      } else {
        await base44.entities.PermissaoEmpresaCustom.create(formData);
        toast.success("Permissões criadas!");
      }
      loadData();
      setShowForm(false);
    } catch (error) {
      console.error("Erro ao salvar:", error);
      toast.error("Erro ao salvar permissões");
    }
  };

  const toggleArrayItem = (array, item, field) => {
    setFormData(prev => {
      const currentArray = prev.permissoes_customizadas[field] || [];
      const newArray = currentArray.includes(item)
        ? currentArray.filter(i => i !== item)
        : [...currentArray, item];
      return {
        ...prev,
        permissoes_customizadas: {
          ...prev.permissoes_customizadas,
          [field]: newArray
        }
      };
    });
  };

  const getPerfilEmpresa = (empresa) => {
    return perfis.find(p => p.id === empresa.perfil_empresa_id);
  };

  const getPermissoesCustom = (empresa) => {
    return permissoes.find(p => p.empresa_id === empresa.id);
  };

  const filteredEmpresas = empresas.filter(emp =>
    emp.nome_fantasia?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.razao_social?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.cnpj?.includes(searchTerm)
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Building2 className="w-8 h-8 text-blue-600" />
          Permissões por Empresa
        </h1>
        <p className="text-sm text-gray-600 mt-1">
          Customize permissões específicas para cada empresa (Admin apenas)
        </p>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Buscar empresa por nome ou CNPJ..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {filteredEmpresas.map(empresa => {
          const perfil = getPerfilEmpresa(empresa);
          const permCustom = getPermissoesCustom(empresa);
          const temCustomizacao = !!permCustom;

          return (
            <Card key={empresa.id} className={temCustomizacao ? 'border-orange-500 border-2' : ''}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{empresa.nome_fantasia || empresa.razao_social}</CardTitle>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="outline" className="text-xs">{empresa.cnpj}</Badge>
                      {perfil && (
                        <Badge className="bg-blue-100 text-blue-700 text-xs">
                          Perfil: {perfil.nome}
                        </Badge>
                      )}
                      {temCustomizacao && (
                        <Badge className="bg-orange-100 text-orange-700 text-xs">
                          ⚙️ Customizada
                        </Badge>
                      )}
                    </div>
                  </div>
                  <Button onClick={() => handleOpenForm(empresa)} size="sm" className="bg-blue-600">
                    <Edit className="w-4 h-4 mr-2" />
                    {temCustomizacao ? "Editar" : "Configurar"}
                  </Button>
                </div>
              </CardHeader>
              {permCustom && (
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="font-semibold text-green-600">
                        +{permCustom.permissoes_customizadas?.paginas_adicionais?.length || 0} páginas extras
                      </p>
                      <p className="font-semibold text-red-600">
                        -{permCustom.permissoes_customizadas?.paginas_removidas?.length || 0} páginas bloqueadas
                      </p>
                    </div>
                    <div>
                      <p className="font-semibold text-green-600">
                        +{permCustom.permissoes_customizadas?.funcionalidades_adicionais?.length || 0} funcionalidades extras
                      </p>
                      <p className="font-semibold text-red-600">
                        -{permCustom.permissoes_customizadas?.funcionalidades_removidas?.length || 0} funcionalidades bloqueadas
                      </p>
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>

      {/* Form Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Customizar Permissões - {empresaSelecionada?.nome_fantasia}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>Perfil Base:</strong> {getPerfilEmpresa(empresaSelecionada)?.nome || "Não definido"}
              </p>
              <p className="text-xs text-blue-700 mt-1">
                As customizações abaixo irão adicionar ou remover permissões do perfil base da empresa.
              </p>
            </div>

            {/* Páginas Adicionais */}
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold mb-3 text-green-700 flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Páginas Adicionais (além do perfil)
              </h3>
              <div className="grid grid-cols-3 gap-2">
                {PAGINAS_DISPONIVEIS.map(pagina => {
                  const isSelected = formData.permissoes_customizadas.paginas_adicionais?.includes(pagina.id);
                  return (
                    <button
                      key={pagina.id}
                      type="button"
                      onClick={() => toggleArrayItem(pagina, pagina.id, 'paginas_adicionais')}
                      className={`p-2 rounded-lg border text-left text-xs transition-all ${
                        isSelected ? 'bg-green-50 border-green-500' : 'bg-white border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded border ${isSelected ? 'bg-green-600 border-green-600' : 'border-gray-300'}`}>
                          {isSelected && <Check className="w-2 h-2 text-white" />}
                        </div>
                        <span>{pagina.nome}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Páginas Removidas */}
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold mb-3 text-red-700 flex items-center gap-2">
                <X className="w-4 h-4" />
                Páginas Bloqueadas (remover do perfil)
              </h3>
              <div className="grid grid-cols-3 gap-2">
                {PAGINAS_DISPONIVEIS.map(pagina => {
                  const isSelected = formData.permissoes_customizadas.paginas_removidas?.includes(pagina.id);
                  return (
                    <button
                      key={pagina.id}
                      type="button"
                      onClick={() => toggleArrayItem(pagina, pagina.id, 'paginas_removidas')}
                      className={`p-2 rounded-lg border text-left text-xs transition-all ${
                        isSelected ? 'bg-red-50 border-red-500' : 'bg-white border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded border ${isSelected ? 'bg-red-600 border-red-600' : 'border-gray-300'}`}>
                          {isSelected && <X className="w-2 h-2 text-white" />}
                        </div>
                        <span>{pagina.nome}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Funcionalidades */}
            <div className="grid grid-cols-2 gap-4">
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold mb-3 text-green-700 text-sm">
                  Funcionalidades Extras
                </h3>
                <div className="space-y-2">
                  {FUNCIONALIDADES_DISPONIVEIS.map(func => {
                    const isSelected = formData.permissoes_customizadas.funcionalidades_adicionais?.includes(func.id);
                    return (
                      <button
                        key={func.id}
                        type="button"
                        onClick={() => toggleArrayItem(func, func.id, 'funcionalidades_adicionais')}
                        className={`w-full p-2 rounded border text-left text-xs ${
                          isSelected ? 'bg-green-50 border-green-500' : 'bg-white border-gray-200'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded ${isSelected ? 'bg-green-600' : 'border border-gray-300'}`}>
                            {isSelected && <Check className="w-2 h-2 text-white" />}
                          </div>
                          {func.nome}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="border rounded-lg p-4">
                <h3 className="font-semibold mb-3 text-red-700 text-sm">
                  Funcionalidades Bloqueadas
                </h3>
                <div className="space-y-2">
                  {FUNCIONALIDADES_DISPONIVEIS.map(func => {
                    const isSelected = formData.permissoes_customizadas.funcionalidades_removidas?.includes(func.id);
                    return (
                      <button
                        key={func.id}
                        type="button"
                        onClick={() => toggleArrayItem(func, func.id, 'funcionalidades_removidas')}
                        className={`w-full p-2 rounded border text-left text-xs ${
                          isSelected ? 'bg-red-50 border-red-500' : 'bg-white border-gray-200'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded ${isSelected ? 'bg-red-600' : 'border border-gray-300'}`}>
                            {isSelected && <X className="w-2 h-2 text-white" />}
                          </div>
                          {func.nome}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div>
              <Label>Observações</Label>
              <Textarea
                value={formData.observacoes}
                onChange={(e) => setFormData(prev => ({ ...prev, observacoes: e.target.value }))}
                placeholder="Motivo das customizações..."
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowForm(false)}>
              <X className="w-4 h-4 mr-2" />
              Cancelar
            </Button>
            <Button onClick={handleSubmit} className="bg-blue-600">
              <Shield className="w-4 h-4 mr-2" />
              Salvar Permissões
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}