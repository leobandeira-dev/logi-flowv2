import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Edit, Trash2, Zap, Clock, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import OperacaoForm from "../components/operacoes/OperacaoForm";

const getPrioridadeBadge = (prioridade) => {
  const colors = {
    baixa: "bg-gray-600 text-white dark:bg-gray-700 dark:text-white border-2 border-gray-700 dark:border-gray-600 font-bold",
    media: "bg-blue-600 text-white dark:bg-blue-700 dark:text-white border-2 border-blue-700 dark:border-blue-600 font-bold",
    alta: "bg-orange-600 text-white dark:bg-orange-700 dark:text-white border-2 border-orange-700 dark:border-orange-600 font-bold",
    urgente: "bg-red-600 text-white dark:bg-red-700 dark:text-white border-2 border-red-700 dark:border-red-600 font-bold"
  };
  return colors[prioridade] || colors.media;
};

const getModalidadeBadge = (modalidade) => {
  const colors = {
    normal: "bg-green-600 text-white dark:bg-green-700 dark:text-white border-2 border-green-700 dark:border-green-600 font-bold",
    expresso: "bg-purple-600 text-white dark:bg-purple-700 dark:text-white border-2 border-purple-700 dark:border-purple-600 font-bold"
  };
  return colors[modalidade] || colors.normal;
};

export default function Operacoes() {
  const [operacoes, setOperacoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingOperacao, setEditingOperacao] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDark, setIsDark] = useState(false);

  // Detect dark mode
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
    loadOperacoes();
  }, []);

  const loadOperacoes = async () => {
    setLoading(true);
    try {
      const operacoesData = await base44.entities.Operacao.list();
      setOperacoes(operacoesData);
    } catch (error) {
      console.error("Erro ao carregar operações:", error);
      toast.error("Erro ao carregar operações");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (data) => {
    try {
      if (editingOperacao) {
        await base44.entities.Operacao.update(editingOperacao.id, data);
        toast.success("Operação atualizada com sucesso!");
      } else {
        await base44.entities.Operacao.create(data);
        toast.success("Operação criada com sucesso!");
      }
      
      setShowForm(false);
      setEditingOperacao(null);
      loadOperacoes();
    } catch (error) {
      console.error("Erro ao salvar operação:", error);
      toast.error("Erro ao salvar operação");
    }
  };

  const handleEdit = (operacao) => {
    setEditingOperacao(operacao);
    setShowForm(true);
  };

  const handleDelete = async (operacao) => {
    if (!confirm(`Tem certeza que deseja excluir a operação "${operacao.nome}"?`)) {
      return;
    }

    try {
      await base44.entities.Operacao.delete(operacao.id);
      toast.success("Operação excluída com sucesso!");
      loadOperacoes();
    } catch (error) {
      console.error("Erro ao excluir operação:", error);
      toast.error("Erro ao excluir operação");
    }
  };

  const toggleAtivo = async (operacao) => {
    try {
      await base44.entities.Operacao.update(operacao.id, {
        ativo: !operacao.ativo
      });
      toast.success(`Operação ${!operacao.ativo ? 'ativada' : 'desativada'} com sucesso!`);
      loadOperacoes();
    } catch (error) {
      console.error("Erro ao alterar status:", error);
      toast.error("Erro ao alterar status da operação");
    }
  };

  const filteredOperacoes = operacoes.filter(op => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      op.nome?.toLowerCase().includes(term) ||
      op.codigo?.toLowerCase().includes(term) ||
      op.descricao?.toLowerCase().includes(term)
    );
  });

  const operacoesAtivas = filteredOperacoes.filter(op => op.ativo);
  const operacoesInativas = filteredOperacoes.filter(op => !op.ativo);

  const theme = {
    bg: isDark ? '#0f172a' : '#f9fafb',
    cardBg: isDark ? '#1e293b' : '#ffffff',
    cardBorder: isDark ? '#334155' : '#e5e7eb',
    text: isDark ? '#f1f5f9' : '#111827',
    textMuted: isDark ? '#94a3b8' : '#4b5563',
    inputBg: isDark ? '#1e293b' : '#ffffff',
    inputBorder: isDark ? '#334155' : '#d1d5db',
    inactiveCardBg: isDark ? '#1e293b' : '#ffffff',
    inactiveCardBorder: isDark ? '#334155' : '#e5e7eb',
    inactiveText: isDark ? '#cbd5e1' : '#374151',
    inactiveTextMuted: isDark ? '#64748b' : '#6b7280',
    codigoText: isDark ? '#9ca3af' : '#374151',
    toleranciaText: isDark ? '#cbd5e1' : '#111827',
  };

  if (loading) {
    return (
      <div className="p-6 min-h-screen flex items-center justify-center transition-colors duration-200" style={{ backgroundColor: theme.bg }}>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm" style={{ color: theme.textMuted }}>Carregando operações...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 min-h-screen transition-colors duration-200" style={{ backgroundColor: theme.bg }}>
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
          <div>
            <h1 className="text-2xl font-bold mb-1" style={{ color: theme.text }}>Operações</h1>
            <p className="text-sm" style={{ color: theme.textMuted }}>Gerencie os tipos de operação e suas tolerâncias</p>
          </div>
          
          <div className="flex gap-2 w-full lg:w-auto">
            <div className="relative flex-1 lg:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: theme.textMuted }} />
              <Input
                placeholder="Buscar operações..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-9 text-sm"
                style={{ backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.text }}
              />
            </div>
            <Button 
              variant="outline" 
              size="icon" 
              onClick={loadOperacoes}
              className="h-9 w-9"
              style={{ borderColor: theme.inputBorder, backgroundColor: 'transparent', color: theme.textMuted }}
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
            <Button 
              onClick={() => {
                setEditingOperacao(null);
                setShowForm(true);
              }}
              className="bg-blue-600 hover:bg-blue-700 h-9 text-sm"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nova Operação
            </Button>
          </div>
        </div>

        <div className="space-y-6">
          {/* Operações Ativas */}
          <div>
            <h2 className="text-lg font-semibold mb-3 flex items-center gap-2" style={{ color: theme.text }}>
              Operações Ativas
              <Badge variant="outline" className="dark:bg-slate-800 dark:border-slate-700 dark:text-gray-300">
                {operacoesAtivas.length}
              </Badge>
            </h2>
            
            {operacoesAtivas.length === 0 ? (
              <Card style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}>
                <CardContent className="py-12 text-center" style={{ color: theme.textMuted }}>
                  <p>Nenhuma operação ativa cadastrada</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {operacoesAtivas.map((operacao) => (
                  <Card key={operacao.id} className="hover:shadow-lg transition-shadow"
                    style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}>
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-base mb-2" style={{ color: theme.text }}>{operacao.nome}</CardTitle>
                          {operacao.codigo && (
                            <p className="text-xs font-mono font-bold" style={{ color: theme.codigoText }}>
                              {operacao.codigo}
                            </p>
                          )}
                        </div>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(operacao)}
                            className="h-8 w-8 p-0"
                            style={{ color: theme.textMuted }}
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(operacao)}
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex flex-wrap gap-2">
                        <Badge className={`text-xs ${getModalidadeBadge(operacao.modalidade)}`}>
                          {operacao.modalidade === 'expresso' ? (
                            <>
                              <Zap className="w-3 h-3 mr-1" />
                              Expresso
                            </>
                          ) : (
                            'Normal'
                          )}
                        </Badge>
                        <Badge className={`text-xs ${getPrioridadeBadge(operacao.prioridade)}`}>
                          Prioridade: {operacao.prioridade}
                        </Badge>
                        {operacao.tolerancia_horas !== null && operacao.tolerancia_horas !== undefined && (
                          <Badge variant="outline" className="text-xs font-bold"
                            style={{
                              backgroundColor: isDark ? '#1e293b' : '#ffffff',
                              borderWidth: '2px',
                              borderColor: isDark ? '#475569' : '#374151',
                              color: isDark ? '#cbd5e1' : '#111827'
                            }}>
                            Tolerância: {operacao.tolerancia_horas}h
                          </Badge>
                        )}
                      </div>

                      {operacao.descricao && (
                        <p className="text-xs line-clamp-2" style={{ color: theme.textMuted }}>
                          {operacao.descricao}
                        </p>
                      )}

                      <div className="pt-2 border-t" style={{ borderColor: theme.inputBorder }}>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleAtivo(operacao)}
                          className="w-full text-xs font-semibold"
                          style={{
                            borderColor: theme.inputBorder,
                            backgroundColor: 'transparent',
                            color: isDark ? '#9ca3af' : '#374151'
                          }}
                        >
                          Desativar
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Operações Inativas */}
          {operacoesInativas.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold mb-3 flex items-center gap-2" style={{ color: theme.inactiveText }}>
                Operações Inativas
                <Badge variant="outline" className="dark:bg-slate-800 dark:border-slate-700 dark:text-gray-400">
                  {operacoesInativas.length}
                </Badge>
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {operacoesInativas.map((operacao) => (
                  <Card key={operacao.id} className="opacity-60"
                    style={{ backgroundColor: theme.inactiveCardBg, borderColor: theme.inactiveCardBorder }}>
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-base mb-2" style={{ color: theme.inactiveText }}>{operacao.nome}</CardTitle>
                          {operacao.codigo && (
                            <p className="text-xs font-mono font-bold" style={{ color: theme.inactiveTextMuted }}>
                              {operacao.codigo}
                            </p>
                          )}
                        </div>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(operacao)}
                            className="h-8 w-8 p-0"
                            style={{ color: theme.inactiveTextMuted }}
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(operacao)}
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex flex-wrap gap-2">
                        <Badge className={`text-xs ${getModalidadeBadge(operacao.modalidade)}`}>
                          {operacao.modalidade === 'expresso' ? (
                            <>
                              <Zap className="w-3 h-3 mr-1" />
                              Expresso
                            </>
                          ) : (
                            'Normal'
                          )}
                        </Badge>
                        <Badge className={`text-xs ${getPrioridadeBadge(operacao.prioridade)}`}>
                          Prioridade: {operacao.prioridade}
                        </Badge>
                      </div>

                      {operacao.tolerancia_horas !== null && operacao.tolerancia_horas !== undefined && (
                        <div className="flex items-center gap-2 p-2 rounded border"
                          style={{
                            backgroundColor: isDark ? '#1e293b' : '#f3f4f6',
                            borderColor: isDark ? '#475569' : '#d1d5db'
                          }}>
                          <Clock className="w-4 h-4" style={{ color: isDark ? '#9ca3af' : '#6b7280' }} />
                          <div>
                            <p className="text-xs font-medium" style={{ color: isDark ? '#cbd5e1' : '#374151' }}>Tolerância</p>
                            <p className="text-sm font-bold" style={{ color: isDark ? '#e2e8f0' : '#111827' }}>
                              {operacao.tolerancia_horas} {operacao.tolerancia_horas === 1 ? 'hora' : 'horas'}
                            </p>
                          </div>
                        </div>
                      )}

                      <div className="pt-2 border-t" style={{ borderColor: theme.inputBorder }}>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleAtivo(operacao)}
                          className="w-full text-xs bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-800 text-green-700 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/30 font-semibold"
                        >
                          Reativar
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {showForm && (
        <OperacaoForm
          open={showForm}
          onClose={() => {
            setShowForm(false);
            setEditingOperacao(null);
          }}
          onSubmit={handleSubmit}
          editingOperacao={editingOperacao}
        />
      )}
    </div>
  );
}