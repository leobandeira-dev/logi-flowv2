import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Search, Building2, Edit, Trash2, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import ParceiroForm from "../components/parceiros/ParceiroForm";

export default function ParceirosPage() {
  const [parceiros, setParceiros] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingParceiro, setEditingParceiro] = useState(null);
  const [isDark, setIsDark] = useState(false);
  const [sincronizando, setSincronizando] = useState(false);

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
    carregarParceiros();
  }, []);

  const carregarParceiros = async () => {
    setLoading(true);
    try {
      const data = await base44.entities.Parceiro.list();
      setParceiros(data);
    } catch (error) {
      console.error("Erro ao carregar parceiros:", error);
      toast.error("Erro ao carregar parceiros");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (parceiro) => {
    if (!confirm(`Deseja realmente excluir ${parceiro.razao_social}?`)) return;

    try {
      await base44.entities.Parceiro.delete(parceiro.id);
      toast.success("Parceiro excluído!");
      carregarParceiros();
    } catch (error) {
      console.error("Erro ao excluir:", error);
      toast.error("Erro ao excluir parceiro");
    }
  };

  const handleEdit = (parceiro) => {
    setEditingParceiro(parceiro);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingParceiro(null);
    carregarParceiros();
  };

  const handleSincronizar = async () => {
    if (!confirm("Isso irá buscar todos os CNPJs das ordens e atualizar/criar parceiros. Continuar?")) return;

    setSincronizando(true);
    try {
      const response = await base44.functions.invoke('sincronizarParceiros');
      const { resultados } = response.data;

      toast.success(
        `Sincronização concluída! ${resultados.criados} criados, ${resultados.atualizados} atualizados, ${resultados.erros} erros`
      );
      
      carregarParceiros();
    } catch (error) {
      console.error("Erro ao sincronizar:", error);
      toast.error("Erro ao sincronizar parceiros");
    } finally {
      setSincronizando(false);
    }
  };

  const parceirosFiltrados = parceiros.filter(p => {
    const term = searchTerm.toLowerCase();
    return (
      p.razao_social?.toLowerCase().includes(term) ||
      p.nome_fantasia?.toLowerCase().includes(term) ||
      p.cnpj?.includes(term) ||
      p.cidade?.toLowerCase().includes(term)
    );
  });

  const theme = {
    cardBg: isDark ? '#1e293b' : '#ffffff',
    border: isDark ? '#334155' : '#e5e7eb',
    text: isDark ? '#f1f5f9' : '#111827',
    textMuted: isDark ? '#94a3b8' : '#6b7280',
  };

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: isDark ? '#0f172a' : '#f9fafb' }}>
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold" style={{ color: theme.text }}>
                Gestão de Parceiros
              </h1>
              <p className="text-sm" style={{ color: theme.textMuted }}>
                Cadastro de clientes e fornecedores
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handleSincronizar}
              disabled={sincronizando}
              variant="outline"
              style={{ borderColor: theme.border, color: theme.text }}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${sincronizando ? 'animate-spin' : ''}`} />
              {sincronizando ? "Sincronizando..." : "Sincronizar CNPJs"}
            </Button>
            <Button
              onClick={() => setShowForm(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Novo Parceiro
            </Button>
          </div>
        </div>

        <Card style={{ backgroundColor: theme.cardBg, borderColor: theme.border }}>
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: theme.textMuted }} />
                <Input
                  placeholder="Buscar por razão social, CNPJ, cidade..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                  style={{ backgroundColor: theme.cardBg, borderColor: theme.border, color: theme.text }}
                />
              </div>
              <Badge variant="outline" style={{ borderColor: theme.border, color: theme.text }}>
                {parceirosFiltrados.length} parceiros
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow style={{ borderBottomColor: theme.border }}>
                    <TableHead style={{ color: theme.textMuted }}>CNPJ</TableHead>
                    <TableHead style={{ color: theme.textMuted }}>Razão Social</TableHead>
                    <TableHead style={{ color: theme.textMuted }}>Nome Fantasia</TableHead>
                    <TableHead style={{ color: theme.textMuted }}>Tipo</TableHead>
                    <TableHead style={{ color: theme.textMuted }}>Cidade/UF</TableHead>
                    <TableHead style={{ color: theme.textMuted }}>Telefone</TableHead>
                    <TableHead style={{ color: theme.textMuted }}>Status</TableHead>
                    <TableHead className="text-right" style={{ color: theme.textMuted }}>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8" style={{ color: theme.textMuted }}>
                        Carregando...
                      </TableCell>
                    </TableRow>
                  ) : parceirosFiltrados.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8" style={{ color: theme.textMuted }}>
                        {searchTerm ? "Nenhum parceiro encontrado" : "Nenhum parceiro cadastrado"}
                      </TableCell>
                    </TableRow>
                  ) : (
                    parceirosFiltrados.map((parceiro) => (
                      <TableRow key={parceiro.id} style={{ borderBottomColor: theme.border }}>
                        <TableCell className="font-mono text-sm" style={{ color: theme.text }}>
                          {parceiro.cnpj}
                        </TableCell>
                        <TableCell className="font-medium" style={{ color: theme.text }}>
                          {parceiro.razao_social}
                        </TableCell>
                        <TableCell style={{ color: theme.text }}>
                          {parceiro.nome_fantasia || "-"}
                        </TableCell>
                        <TableCell>
                          <Badge
                            className="text-xs"
                            style={{
                              backgroundColor: parceiro.tipo === 'cliente' ? '#dbeafe' : parceiro.tipo === 'fornecedor' ? '#fef3c7' : '#e0e7ff',
                              color: parceiro.tipo === 'cliente' ? '#1e40af' : parceiro.tipo === 'fornecedor' ? '#92400e' : '#4338ca'
                            }}
                          >
                            {parceiro.tipo}
                          </Badge>
                        </TableCell>
                        <TableCell style={{ color: theme.text }}>
                          {parceiro.cidade ? `${parceiro.cidade}/${parceiro.uf}` : "-"}
                        </TableCell>
                        <TableCell style={{ color: theme.text }}>
                          {parceiro.telefone || "-"}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={parceiro.ativo ? "default" : "outline"}
                            className="text-xs"
                            style={{
                              backgroundColor: parceiro.ativo ? '#dcfce7' : 'transparent',
                              color: parceiro.ativo ? '#166534' : theme.textMuted,
                              borderColor: parceiro.ativo ? '#86efac' : theme.border
                            }}
                          >
                            {parceiro.ativo ? "Ativo" : "Inativo"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(parceiro)}
                              className="h-8 w-8 p-0"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(parceiro)}
                              className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {showForm && (
        <ParceiroForm
          open={showForm}
          onClose={handleFormClose}
          parceiro={editingParceiro}
        />
      )}
    </div>
  );
}