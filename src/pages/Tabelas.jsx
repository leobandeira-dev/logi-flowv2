import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  FileText,
  Calendar,
  Building2,
  ToggleLeft,
  ToggleRight
} from "lucide-react";
import TabelaPrecoForm from "../components/tabelas/TabelaPrecoForm";
import { toast } from "sonner";

export default function Tabelas() {
  const [isDark, setIsDark] = useState(false);
  const [tabelas, setTabelas] = useState([]);
  const [parceiros, setParceiros] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingTabela, setEditingTabela] = useState(null);

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
    loadTabelas();
    loadParceiros();
  }, []);

  const loadTabelas = async () => {
    setLoading(true);
    try {
      const user = await base44.auth.me();
      const data = await base44.entities.TabelaPreco.filter(
        { empresa_id: user.empresa_id },
        "-created_date",
        100
      );
      setTabelas(data);
    } catch (error) {
      console.error("Erro ao carregar tabelas:", error);
      toast.error("Erro ao carregar tabelas");
    } finally {
      setLoading(false);
    }
  };

  const loadParceiros = async () => {
    try {
      const data = await base44.entities.Parceiro.list("razao_social", 500);
      setParceiros(data);
    } catch (error) {
      console.error("Erro ao carregar parceiros:", error);
    }
  };

  const handleEdit = (tabela) => {
    setEditingTabela(tabela);
    setShowForm(true);
  };

  const handleDelete = async (tabela) => {
    if (!window.confirm(`Deseja realmente excluir a tabela "${tabela.nome}"?`)) return;

    try {
      await base44.entities.TabelaPreco.delete(tabela.id);
      toast.success("Tabela excluída com sucesso!");
      loadTabelas();
    } catch (error) {
      console.error("Erro ao excluir tabela:", error);
      toast.error("Erro ao excluir tabela");
    }
  };

  const handleToggleAtivo = async (tabela) => {
    try {
      await base44.entities.TabelaPreco.update(tabela.id, {
        ativo: !tabela.ativo
      });
      toast.success(`Tabela ${!tabela.ativo ? 'ativada' : 'desativada'} com sucesso!`);
      loadTabelas();
    } catch (error) {
      console.error("Erro ao atualizar tabela:", error);
      toast.error("Erro ao atualizar tabela");
    }
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingTabela(null);
    loadTabelas();
  };

  const getTipoTabelaLabel = (tipo) => {
    const tipos = {
      peso_km: "Peso x KM",
      peso: "Por Peso",
      cubagem: "Peso x Cubagem",
      percentual_nf: "% Nota Fiscal",
      km: "Por KM",
      valor_fixo: "Valor Fixo"
    };
    return tipos[tipo] || tipo;
  };

  const getParceiroNome = (parceiroId) => {
    const parceiro = parceiros.find(p => p.id === parceiroId);
    return parceiro?.razao_social || "N/A";
  };

  const filteredTabelas = tabelas.filter(t => 
    t.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.descricao?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    getParceiroNome(t.cliente_parceiro_id).toLowerCase().includes(searchTerm.toLowerCase())
  );

  const theme = {
    bg: isDark ? '#0f172a' : '#f9fafb',
    cardBg: isDark ? '#1e293b' : '#ffffff',
    cardBorder: isDark ? '#334155' : '#e5e7eb',
    text: isDark ? '#f1f5f9' : '#111827',
    textMuted: isDark ? '#94a3b8' : '#6b7280',
  };

  if (showForm) {
    return (
      <TabelaPrecoForm
        tabela={editingTabela}
        onClose={() => {
          setShowForm(false);
          setEditingTabela(null);
        }}
        onSuccess={handleFormSuccess}
        parceiros={parceiros}
      />
    );
  }

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: theme.bg }}>
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold" style={{ color: theme.text }}>
              Tabelas de Preços
            </h1>
            <p className="mt-1" style={{ color: theme.textMuted }}>
              Gerencie tabelas de precificação por cliente
            </p>
          </div>
          <Button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nova Tabela
          </Button>
        </div>

        <Card style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}>
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: theme.textMuted }} />
                <Input
                  placeholder="Buscar por nome, descrição ou cliente..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                  style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder, color: theme.text }}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8" style={{ color: theme.textMuted }}>
                Carregando...
              </div>
            ) : filteredTabelas.length === 0 ? (
              <div className="text-center py-8" style={{ color: theme.textMuted }}>
                Nenhuma tabela encontrada
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow style={{ borderColor: theme.cardBorder }}>
                    <TableHead style={{ color: theme.text }}>Nome</TableHead>
                    <TableHead style={{ color: theme.text }}>Tipo</TableHead>
                    <TableHead style={{ color: theme.text }}>Cliente</TableHead>
                    <TableHead style={{ color: theme.text }}>Aplicação</TableHead>
                    <TableHead style={{ color: theme.text }}>Vigência</TableHead>
                    <TableHead style={{ color: theme.text }}>Status</TableHead>
                    <TableHead style={{ color: theme.text }}>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTabelas.map((tabela) => (
                    <TableRow key={tabela.id} style={{ borderColor: theme.cardBorder }}>
                      <TableCell>
                        <div>
                          <p className="font-medium" style={{ color: theme.text }}>
                            {tabela.nome}
                          </p>
                          {tabela.descricao && (
                            <p className="text-xs" style={{ color: theme.textMuted }}>
                              {tabela.descricao}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {getTipoTabelaLabel(tabela.tipo_tabela)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4" style={{ color: theme.textMuted }} />
                          <span className="text-sm" style={{ color: theme.text }}>
                            {getParceiroNome(tabela.cliente_parceiro_id)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className="bg-purple-600 text-white">
                          {tabela.tipo_aplicacao}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-xs" style={{ color: theme.textMuted }}>
                          <Calendar className="w-3 h-3" />
                          {tabela.vigencia_inicio && new Date(tabela.vigencia_inicio).toLocaleDateString('pt-BR')}
                          {tabela.vigencia_fim && ` - ${new Date(tabela.vigencia_fim).toLocaleDateString('pt-BR')}`}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleAtivo(tabela)}
                          className="h-8"
                        >
                          {tabela.ativo ? (
                            <>
                              <ToggleRight className="w-4 h-4 mr-1 text-green-600" />
                              <span className="text-xs text-green-600">Ativa</span>
                            </>
                          ) : (
                            <>
                              <ToggleLeft className="w-4 h-4 mr-1 text-gray-400" />
                              <span className="text-xs text-gray-400">Inativa</span>
                            </>
                          )}
                        </Button>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(tabela)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(tabela)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}