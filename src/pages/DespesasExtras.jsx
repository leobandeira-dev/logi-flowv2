import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Plus,
  Search,
  FileText,
  DollarSign,
  Settings,
  CheckCircle,
  XCircle,
  Edit,
  Trash2,
  Download
} from "lucide-react";
import DespesaExtraForm from "../components/despesas/DespesaExtraForm";
import TipoDespesaForm from "../components/despesas/TipoDespesaForm";
import { toast } from "sonner";

export default function DespesasExtras() {
  const [isDark, setIsDark] = useState(false);
  const [despesas, setDespesas] = useState([]);
  const [tiposDespesa, setTiposDespesa] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("todos");
  const [showDespesaForm, setShowDespesaForm] = useState(false);
  const [showTipoForm, setShowTipoForm] = useState(false);
  const [despesaEdit, setDespesaEdit] = useState(null);
  const [tipoEdit, setTipoEdit] = useState(null);
  const [abaAtiva, setAbaAtiva] = useState("despesas");

  useEffect(() => {
    const checkDarkMode = () => setIsDark(document.documentElement.classList.contains('dark'));
    checkDarkMode();
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [despesasData, tiposData] = await Promise.all([
        base44.entities.DespesaExtra.list("-created_date", 200),
        base44.entities.TipoDespesaExtra.list()
      ]);
      setDespesas(despesasData);
      setTiposDespesa(tiposData);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      toast.error("Erro ao carregar dados");
    } finally {
      setLoading(false);
    }
  };

  const handleSalvarTipo = async (data) => {
    try {
      if (tipoEdit) {
        await base44.entities.TipoDespesaExtra.update(tipoEdit.id, data);
        toast.success("Tipo atualizado!");
      } else {
        await base44.entities.TipoDespesaExtra.create(data);
        toast.success("Tipo criado!");
      }
      setShowTipoForm(false);
      setTipoEdit(null);
      loadData();
    } catch (error) {
      console.error("Erro ao salvar tipo:", error);
      toast.error("Erro ao salvar tipo de despesa");
    }
  };

  const handleAprovar = async (despesa) => {
    try {
      const user = await base44.auth.me();
      await base44.entities.DespesaExtra.update(despesa.id, {
        status: "aprovada",
        aprovado_por: user.id,
        data_aprovacao: new Date().toISOString()
      });
      toast.success("Despesa aprovada!");
      loadData();
    } catch (error) {
      console.error("Erro ao aprovar:", error);
      toast.error("Erro ao aprovar despesa");
    }
  };

  const handleCancelar = async (despesa) => {
    if (!confirm("Cancelar esta despesa?")) return;
    try {
      await base44.entities.DespesaExtra.update(despesa.id, { status: "cancelada" });
      toast.success("Despesa cancelada");
      loadData();
    } catch (error) {
      console.error("Erro ao cancelar:", error);
      toast.error("Erro ao cancelar despesa");
    }
  };

  const handleExcluirTipo = async (tipo) => {
    if (!confirm(`Desativar tipo "${tipo.nome}"?`)) return;
    try {
      await base44.entities.TipoDespesaExtra.update(tipo.id, { ativo: false });
      toast.success("Tipo desativado");
      loadData();
    } catch (error) {
      console.error("Erro ao desativar:", error);
      toast.error("Erro ao desativar tipo");
    }
  };

  const despesasFiltradas = despesas.filter(d => {
    const matchStatus = filtroStatus === "todos" || d.status === filtroStatus;
    const matchSearch = !searchTerm || 
      d.numero_despesa?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.tipo_despesa_nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.descricao?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchStatus && matchSearch;
  });

  const statusColors = {
    pendente: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
    aprovada: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
    faturada: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
    cancelada: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
  };

  const theme = {
    bg: isDark ? '#0f172a' : '#f9fafb',
    cardBg: isDark ? '#1e293b' : '#ffffff',
    cardBorder: isDark ? '#334155' : '#e5e7eb',
    text: isDark ? '#f1f5f9' : '#111827',
    textMuted: isDark ? '#94a3b8' : '#6b7280'
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: theme.bg }}>
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4" style={{ backgroundColor: theme.bg }}>
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold" style={{ color: theme.text }}>
              Despesas Extras
            </h1>
            <p className="text-sm mt-1" style={{ color: theme.textMuted }}>
              Gestão de despesas apropriadas às notas fiscais
            </p>
          </div>
        </div>

        <Tabs value={abaAtiva} onValueChange={setAbaAtiva}>
          <TabsList className="grid w-full max-w-md grid-cols-2 mb-6">
            <TabsTrigger value="despesas">
              <DollarSign className="w-4 h-4 mr-2" />
              Despesas
            </TabsTrigger>
            <TabsTrigger value="tipos">
              <Settings className="w-4 h-4 mr-2" />
              Tipos de Despesa
            </TabsTrigger>
          </TabsList>

          {/* Aba Despesas */}
          <TabsContent value="despesas">
            <Card style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle style={{ color: theme.text }}>Registro de Despesas</CardTitle>
                  <Button
                    onClick={() => {
                      setDespesaEdit(null);
                      setShowDespesaForm(true);
                    }}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Nova Despesa
                  </Button>
                </div>
                <div className="flex gap-2 mt-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: theme.textMuted }} />
                    <Input
                      placeholder="Buscar por número, tipo ou descrição..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <select
                    value={filtroStatus}
                    onChange={(e) => setFiltroStatus(e.target.value)}
                    className="px-3 py-2 border rounded-lg text-sm"
                    style={{
                      backgroundColor: theme.cardBg,
                      borderColor: theme.cardBorder,
                      color: theme.text
                    }}
                  >
                    <option value="todos">Todos Status</option>
                    <option value="pendente">Pendente</option>
                    <option value="aprovada">Aprovada</option>
                    <option value="faturada">Faturada</option>
                    <option value="cancelada">Cancelada</option>
                  </select>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b" style={{ borderColor: theme.cardBorder }}>
                        <th className="text-left p-2 text-sm font-semibold" style={{ color: theme.text }}>Nº Despesa</th>
                        <th className="text-left p-2 text-sm font-semibold" style={{ color: theme.text }}>Tipo</th>
                        <th className="text-left p-2 text-sm font-semibold" style={{ color: theme.text }}>NF</th>
                        <th className="text-left p-2 text-sm font-semibold" style={{ color: theme.text }}>Descrição</th>
                        <th className="text-right p-2 text-sm font-semibold" style={{ color: theme.text }}>Qtd</th>
                        <th className="text-right p-2 text-sm font-semibold" style={{ color: theme.text }}>Valor</th>
                        <th className="text-center p-2 text-sm font-semibold" style={{ color: theme.text }}>Status</th>
                        <th className="text-right p-2 text-sm font-semibold" style={{ color: theme.text }}>Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {despesasFiltradas.map((despesa) => (
                        <tr key={despesa.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800/50" style={{ borderColor: theme.cardBorder }}>
                          <td className="p-2">
                            <span className="font-mono text-sm font-bold" style={{ color: theme.text }}>
                              {despesa.numero_despesa}
                            </span>
                          </td>
                          <td className="p-2">
                            <span className="text-sm" style={{ color: theme.text }}>
                              {despesa.tipo_despesa_nome}
                            </span>
                          </td>
                          <td className="p-2">
                            <span className="text-sm font-mono" style={{ color: theme.textMuted }}>
                              {despesa.nota_fiscal_id ? 'NF vinculada' : '-'}
                            </span>
                          </td>
                          <td className="p-2">
                            <span className="text-xs truncate max-w-xs block" style={{ color: theme.textMuted }}>
                              {despesa.descricao || '-'}
                            </span>
                          </td>
                          <td className="p-2 text-right">
                            <span className="text-sm" style={{ color: theme.text }}>
                              {despesa.quantidade} {despesa.unidade_cobranca}
                            </span>
                          </td>
                          <td className="p-2 text-right">
                            <span className="font-bold text-sm" style={{ color: theme.text }}>
                              R$ {(despesa.valor_total || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </span>
                          </td>
                          <td className="p-2 text-center">
                            <Badge className={statusColors[despesa.status]}>
                              {despesa.status}
                            </Badge>
                          </td>
                          <td className="p-2">
                            <div className="flex items-center justify-end gap-1">
                              {despesa.status === "pendente" && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleAprovar(despesa)}
                                  className="h-7 w-7 p-0"
                                  title="Aprovar"
                                >
                                  <CheckCircle className="w-4 h-4 text-green-600" />
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setDespesaEdit(despesa);
                                  setShowDespesaForm(true);
                                }}
                                className="h-7 w-7 p-0"
                                title="Editar"
                              >
                                <Edit className="w-4 h-4 text-blue-600" />
                              </Button>
                              {despesa.status === "pendente" && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleCancelar(despesa)}
                                  className="h-7 w-7 p-0"
                                  title="Cancelar"
                                >
                                  <XCircle className="w-4 h-4 text-red-600" />
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {despesasFiltradas.length === 0 && (
                    <div className="text-center py-12">
                      <DollarSign className="w-16 h-16 mx-auto mb-4 opacity-20" style={{ color: theme.textMuted }} />
                      <p className="text-sm" style={{ color: theme.textMuted }}>
                        {searchTerm ? "Nenhuma despesa encontrada" : "Nenhuma despesa registrada"}
                      </p>
                    </div>
                  )}
                </div>

                {/* Resumo */}
                {despesas.length > 0 && (
                  <div className="mt-6 grid grid-cols-4 gap-4">
                    <div className="p-4 border rounded-lg" style={{ borderColor: theme.cardBorder }}>
                      <p className="text-xs mb-1" style={{ color: theme.textMuted }}>Total Despesas</p>
                      <p className="text-2xl font-bold" style={{ color: theme.text }}>
                        {despesas.length}
                      </p>
                    </div>
                    <div className="p-4 border rounded-lg" style={{ borderColor: theme.cardBorder }}>
                      <p className="text-xs mb-1" style={{ color: theme.textMuted }}>Valor Total</p>
                      <p className="text-2xl font-bold text-blue-600">
                        R$ {despesas.reduce((sum, d) => sum + (d.valor_total || 0), 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                    <div className="p-4 border rounded-lg" style={{ borderColor: theme.cardBorder }}>
                      <p className="text-xs mb-1" style={{ color: theme.textMuted }}>Pendentes</p>
                      <p className="text-2xl font-bold text-yellow-600">
                        {despesas.filter(d => d.status === "pendente").length}
                      </p>
                    </div>
                    <div className="p-4 border rounded-lg" style={{ borderColor: theme.cardBorder }}>
                      <p className="text-xs mb-1" style={{ color: theme.textMuted }}>Aprovadas</p>
                      <p className="text-2xl font-bold text-green-600">
                        {despesas.filter(d => d.status === "aprovada").length}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Aba Tipos de Despesa */}
          <TabsContent value="tipos">
            <Card style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle style={{ color: theme.text }}>Tipos de Despesa</CardTitle>
                  <Button
                    onClick={() => {
                      setTipoEdit(null);
                      setShowTipoForm(true);
                    }}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Novo Tipo
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3">
                  {tiposDespesa.map((tipo) => (
                    <div
                      key={tipo.id}
                      className="p-4 border rounded-lg"
                      style={{
                        borderColor: theme.cardBorder,
                        opacity: tipo.ativo ? 1 : 0.5
                      }}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-bold" style={{ color: theme.text }}>
                              {tipo.nome}
                            </h3>
                            {tipo.codigo && (
                              <Badge variant="outline" className="text-xs">
                                {tipo.codigo}
                              </Badge>
                            )}
                            {!tipo.ativo && (
                              <Badge className="bg-gray-500 text-white text-xs">
                                Inativo
                              </Badge>
                            )}
                          </div>
                          {tipo.descricao && (
                            <p className="text-sm mb-2" style={{ color: theme.textMuted }}>
                              {tipo.descricao}
                            </p>
                          )}
                          <div className="flex items-center gap-4 text-xs" style={{ color: theme.textMuted }}>
                            <span>
                              Valor padrão: <strong style={{ color: theme.text }}>R$ {(tipo.valor_padrao || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong>
                            </span>
                            <span>
                              Unidade: <strong style={{ color: theme.text }}>{tipo.unidade_cobranca}</strong>
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setTipoEdit(tipo);
                              setShowTipoForm(true);
                            }}
                            className="h-8 w-8 p-0"
                          >
                            <Edit className="w-4 h-4 text-blue-600" />
                          </Button>
                          {tipo.ativo && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleExcluirTipo(tipo)}
                              className="h-8 w-8 p-0"
                            >
                              <Trash2 className="w-4 h-4 text-red-600" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}

                  {tiposDespesa.length === 0 && (
                    <div className="text-center py-12">
                      <Settings className="w-16 h-16 mx-auto mb-4 opacity-20" style={{ color: theme.textMuted }} />
                      <p className="text-sm" style={{ color: theme.textMuted }}>
                        Nenhum tipo de despesa cadastrado
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {showDespesaForm && (
        <DespesaExtraForm
          open={showDespesaForm}
          onClose={() => {
            setShowDespesaForm(false);
            setDespesaEdit(null);
          }}
          despesa={despesaEdit}
          onSuccess={() => {
            setShowDespesaForm(false);
            setDespesaEdit(null);
            loadData();
          }}
        />
      )}

      {showTipoForm && (
        <TipoDespesaForm
          open={showTipoForm}
          onClose={() => {
            setShowTipoForm(false);
            setTipoEdit(null);
          }}
          tipo={tipoEdit}
          onSuccess={handleSalvarTipo}
        />
      )}
    </div>
  );
}