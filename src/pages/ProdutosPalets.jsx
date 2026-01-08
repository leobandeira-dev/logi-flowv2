import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Search, Edit, Trash2, Package, Box } from "lucide-react";
import { toast } from "sonner";

export default function ProdutosPalets() {
  const [isDark, setIsDark] = useState(false);
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingProduto, setEditingProduto] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    codigo: "",
    descricao: "",
    tipo: "palet",
    peso: 0,
    valor_unitario: 0,
    altura: 0,
    largura: 0,
    comprimento: 0,
    ativo: true
  });

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
    loadProdutos();
  }, []);

  const loadProdutos = async () => {
    setLoading(true);
    try {
      const data = await base44.entities.ProdutoPalet.list("codigo", 200);
      setProdutos(data);
    } catch (error) {
      console.error("Erro ao carregar produtos:", error);
      toast.error("Erro ao carregar produtos");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (produto) => {
    setEditingProduto(produto);
    setFormData({
      codigo: produto.codigo || "",
      descricao: produto.descricao || "",
      tipo: produto.tipo || "palet",
      peso: produto.peso || 0,
      valor_unitario: produto.valor_unitario || 0,
      altura: produto.altura || 0,
      largura: produto.largura || 0,
      comprimento: produto.comprimento || 0,
      ativo: produto.ativo !== false
    });
    setShowForm(true);
  };

  const handleDelete = async (produto) => {
    if (!window.confirm(`Deseja realmente excluir "${produto.descricao}"?`)) return;

    try {
      await base44.entities.ProdutoPalet.delete(produto.id);
      toast.success("Produto excluído com sucesso!");
      loadProdutos();
    } catch (error) {
      console.error("Erro ao excluir produto:", error);
      toast.error("Erro ao excluir produto");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.codigo || !formData.descricao) {
      toast.error("Preencha os campos obrigatórios");
      return;
    }

    setSaving(true);
    try {
      const user = await base44.auth.me();
      const cubagem = (formData.altura * formData.largura * formData.comprimento) / 1000000; // m³
      
      const dataToSave = {
        ...formData,
        cubagem,
        empresa_id: user.empresa_id
      };

      if (editingProduto) {
        await base44.entities.ProdutoPalet.update(editingProduto.id, dataToSave);
        toast.success("Produto atualizado com sucesso!");
      } else {
        await base44.entities.ProdutoPalet.create(dataToSave);
        toast.success("Produto criado com sucesso!");
      }

      setShowForm(false);
      setEditingProduto(null);
      setFormData({
        codigo: "",
        descricao: "",
        tipo: "palet",
        peso: 0,
        valor_unitario: 0,
        altura: 0,
        largura: 0,
        comprimento: 0,
        ativo: true
      });
      loadProdutos();
    } catch (error) {
      console.error("Erro ao salvar produto:", error);
      toast.error("Erro ao salvar produto");
    } finally {
      setSaving(false);
    }
  };

  const filteredProdutos = produtos.filter(p => 
    p.codigo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.descricao?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const theme = {
    bg: isDark ? '#0f172a' : '#f9fafb',
    cardBg: isDark ? '#1e293b' : '#ffffff',
    cardBorder: isDark ? '#334155' : '#e5e7eb',
    text: isDark ? '#f1f5f9' : '#111827',
    textMuted: isDark ? '#94a3b8' : '#6b7280',
  };

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: theme.bg }}>
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold" style={{ color: theme.text }}>
              Produtos e Palets
            </h1>
            <p className="mt-1" style={{ color: theme.textMuted }}>
              Cadastro de produtos, palets e embalagens
            </p>
          </div>
          <Button
            onClick={() => {
              setEditingProduto(null);
              setFormData({
                codigo: "",
                descricao: "",
                tipo: "palet",
                peso: 0,
                valor_unitario: 0,
                altura: 0,
                largura: 0,
                comprimento: 0,
                ativo: true
              });
              setShowForm(true);
            }}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Novo Produto
          </Button>
        </div>

        <Card style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}>
          <CardHeader>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: theme.textMuted }} />
              <Input
                placeholder="Buscar por código ou descrição..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder, color: theme.text }}
              />
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8" style={{ color: theme.textMuted }}>
                Carregando...
              </div>
            ) : filteredProdutos.length === 0 ? (
              <div className="text-center py-8" style={{ color: theme.textMuted }}>
                Nenhum produto encontrado
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow style={{ borderColor: theme.cardBorder }}>
                    <TableHead style={{ color: theme.text }}>Código</TableHead>
                    <TableHead style={{ color: theme.text }}>Descrição</TableHead>
                    <TableHead style={{ color: theme.text }}>Tipo</TableHead>
                    <TableHead style={{ color: theme.text }}>Peso (kg)</TableHead>
                    <TableHead style={{ color: theme.text }}>Dimensões (cm)</TableHead>
                    <TableHead style={{ color: theme.text }}>Cubagem (m³)</TableHead>
                    <TableHead style={{ color: theme.text }}>Valor Unit.</TableHead>
                    <TableHead style={{ color: theme.text }}>Status</TableHead>
                    <TableHead style={{ color: theme.text }}>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProdutos.map((produto) => (
                    <TableRow key={produto.id} style={{ borderColor: theme.cardBorder }}>
                      <TableCell>
                        <span className="font-mono font-medium" style={{ color: theme.text }}>
                          {produto.codigo}
                        </span>
                      </TableCell>
                      <TableCell style={{ color: theme.text }}>{produto.descricao}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {produto.tipo === 'palet' ? 'Palet' : produto.tipo === 'produto' ? 'Produto' : 'Embalagem'}
                        </Badge>
                      </TableCell>
                      <TableCell style={{ color: theme.text }}>{produto.peso?.toFixed(2)}</TableCell>
                      <TableCell className="text-xs" style={{ color: theme.textMuted }}>
                        {produto.altura} x {produto.largura} x {produto.comprimento}
                      </TableCell>
                      <TableCell style={{ color: theme.text }}>{produto.cubagem?.toFixed(4)}</TableCell>
                      <TableCell style={{ color: theme.text }}>
                        R$ {produto.valor_unitario?.toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <Badge className={produto.ativo ? "bg-green-600" : "bg-gray-400"}>
                          {produto.ativo ? "Ativo" : "Inativo"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(produto)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(produto)}
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

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-2xl" style={{ backgroundColor: theme.cardBg }}>
          <DialogHeader>
            <DialogTitle style={{ color: theme.text }}>
              {editingProduto ? "Editar Produto" : "Novo Produto"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label style={{ color: theme.text }}>Código *</Label>
                  <Input
                    value={formData.codigo}
                    onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
                    placeholder="Ex: PAL001"
                    required
                    style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder, color: theme.text }}
                  />
                </div>
                <div className="col-span-2">
                  <Label style={{ color: theme.text }}>Descrição *</Label>
                  <Input
                    value={formData.descricao}
                    onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                    placeholder="Ex: Palet PBR 1000x1200"
                    required
                    style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder, color: theme.text }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label style={{ color: theme.text }}>Tipo</Label>
                  <Select
                    value={formData.tipo}
                    onValueChange={(value) => setFormData({ ...formData, tipo: value })}
                  >
                    <SelectTrigger style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder, color: theme.text }}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="palet">Palet</SelectItem>
                      <SelectItem value="produto">Produto</SelectItem>
                      <SelectItem value="embalagem">Embalagem</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label style={{ color: theme.text }}>Peso (kg)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.peso}
                    onChange={(e) => setFormData({ ...formData, peso: parseFloat(e.target.value) || 0 })}
                    style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder, color: theme.text }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label style={{ color: theme.text }}>Altura (cm)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.altura}
                    onChange={(e) => setFormData({ ...formData, altura: parseFloat(e.target.value) || 0 })}
                    style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder, color: theme.text }}
                  />
                </div>
                <div>
                  <Label style={{ color: theme.text }}>Largura (cm)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.largura}
                    onChange={(e) => setFormData({ ...formData, largura: parseFloat(e.target.value) || 0 })}
                    style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder, color: theme.text }}
                  />
                </div>
                <div>
                  <Label style={{ color: theme.text }}>Comprimento (cm)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.comprimento}
                    onChange={(e) => setFormData({ ...formData, comprimento: parseFloat(e.target.value) || 0 })}
                    style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder, color: theme.text }}
                  />
                </div>
              </div>

              <div>
                <Label style={{ color: theme.text }}>Valor Unitário (R$)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.valor_unitario}
                  onChange={(e) => setFormData({ ...formData, valor_unitario: parseFloat(e.target.value) || 0 })}
                  style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder, color: theme.text }}
                />
              </div>

              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded">
                <p className="text-xs" style={{ color: theme.text }}>
                  Cubagem calculada: {((formData.altura * formData.largura * formData.comprimento) / 1000000).toFixed(4)} m³
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowForm(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={saving} className="bg-blue-600 hover:bg-blue-700">
                {saving ? "Salvando..." : "Salvar"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}