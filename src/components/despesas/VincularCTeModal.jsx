import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, FileText, Truck } from "lucide-react";
import { toast } from "sonner";

export default function VincularCTeModal({ open, onClose, notaFiscal, onSuccess }) {
  const [isDark, setIsDark] = useState(false);
  const [ctes, setCtes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCte, setSelectedCte] = useState(null);

  useEffect(() => {
    const checkDarkMode = () => setIsDark(document.documentElement.classList.contains('dark'));
    checkDarkMode();
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (open) {
      loadCTes();
    }
  }, [open]);

  const loadCTes = async () => {
    setLoading(true);
    try {
      const data = await base44.entities.CTe.list("-created_date", 100);
      setCtes(data);
    } catch (error) {
      console.error("Erro ao carregar CT-es:", error);
      toast.error("Erro ao carregar CT-es");
    } finally {
      setLoading(false);
    }
  };

  const handleVincular = async () => {
    if (!selectedCte) {
      toast.error("Selecione um CT-e");
      return;
    }

    try {
      await base44.entities.NotaFiscal.update(notaFiscal.id, {
        cte_id: selectedCte.id
      });
      toast.success("CT-e vinculado com sucesso!");
      onSuccess();
    } catch (error) {
      console.error("Erro ao vincular CT-e:", error);
      toast.error("Erro ao vincular CT-e");
    }
  };

  const ctesFiltrados = ctes.filter(cte => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      cte.numero_cte?.toLowerCase().includes(search) ||
      cte.chave_acesso?.toLowerCase().includes(search) ||
      cte.remetente_razao_social?.toLowerCase().includes(search)
    );
  });

  const theme = {
    bg: isDark ? '#0f172a' : '#ffffff',
    cardBg: isDark ? '#1e293b' : '#f9fafb',
    border: isDark ? '#334155' : '#e5e7eb',
    text: isDark ? '#f1f5f9' : '#111827',
    textMuted: isDark ? '#94a3b8' : '#6b7280'
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl" style={{ backgroundColor: theme.bg }}>
        <DialogHeader>
          <DialogTitle style={{ color: theme.text }}>
            Vincular CT-e à Nota Fiscal
          </DialogTitle>
          <p className="text-sm mt-2" style={{ color: theme.textMuted }}>
            Para faturar esta despesa, é necessário vincular um CT-e à Nota Fiscal {notaFiscal?.numero_nota}
          </p>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: theme.textMuted }} />
            <Input
              placeholder="Buscar por número, chave de acesso ou remetente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-6 h-6 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {ctesFiltrados.map((cte) => (
                <div
                  key={cte.id}
                  onClick={() => setSelectedCte(cte)}
                  className="p-3 border rounded-lg cursor-pointer transition-all"
                  style={{
                    borderColor: selectedCte?.id === cte.id ? '#3b82f6' : theme.border,
                    backgroundColor: selectedCte?.id === cte.id ? (isDark ? '#1e3a8a' : '#dbeafe') : theme.cardBg
                  }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Truck className="w-4 h-4" style={{ color: theme.textMuted }} />
                        <span className="font-mono font-bold text-sm" style={{ color: theme.text }}>
                          CT-e {cte.numero_cte}
                        </span>
                        {cte.modelo && (
                          <Badge variant="outline" className="text-xs">
                            Modelo {cte.modelo}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm mb-1" style={{ color: theme.text }}>
                        {cte.remetente_razao_social}
                      </p>
                      {cte.chave_acesso && (
                        <p className="text-xs font-mono" style={{ color: theme.textMuted }}>
                          {cte.chave_acesso}
                        </p>
                      )}
                      {cte.valor_total && (
                        <p className="text-sm font-bold mt-1" style={{ color: theme.text }}>
                          R$ {cte.valor_total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {ctesFiltrados.length === 0 && (
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 mx-auto mb-3 opacity-20" style={{ color: theme.textMuted }} />
                  <p className="text-sm" style={{ color: theme.textMuted }}>
                    {searchTerm ? "Nenhum CT-e encontrado" : "Nenhum CT-e cadastrado"}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            onClick={handleVincular}
            disabled={!selectedCte}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Vincular e Faturar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}