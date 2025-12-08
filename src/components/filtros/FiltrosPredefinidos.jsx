import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Star, Plus, Trash2, ChevronDown } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";

export default function FiltrosPredefinidos({ rota, filtrosAtuais, onAplicarFiltro }) {
  const [filtrosSalvos, setFiltrosSalvos] = useState([]);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [nomeFiltro, setNomeFiltro] = useState("");
  const [saving, setSaving] = useState(false);
  const [isDark, setIsDark] = useState(false);

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
    if (rota) {
      carregarFiltros();
    }
  }, [rota]);

  const carregarFiltros = async () => {
    try {
      const user = await base44.auth.me();
      const chave = `filtros_${rota}`;
      const filtros = user[chave] ? JSON.parse(user[chave]) : [];
      setFiltrosSalvos(filtros);
    } catch (error) {
      console.log("Não foi possível carregar filtros salvos (ignorando):", error?.message);
      setFiltrosSalvos([]);
    }
  };

  const handleSalvarFiltro = async () => {
    if (!nomeFiltro.trim()) {
      toast.error("Digite um nome para o filtro");
      return;
    }

    setSaving(true);
    try {
      const user = await base44.auth.me();
      const chave = `filtros_${rota}`;
      
      const novoFiltro = {
        id: Date.now().toString(),
        nome: nomeFiltro.trim(),
        filtros: filtrosAtuais,
        criado_em: new Date().toISOString()
      };

      const filtrosAtualizados = [...filtrosSalvos, novoFiltro];
      
      await base44.auth.updateMe({
        [chave]: JSON.stringify(filtrosAtualizados)
      });

      setFiltrosSalvos(filtrosAtualizados);
      setShowSaveDialog(false);
      setNomeFiltro("");
      toast.success("Filtro salvo com sucesso!");
    } catch (error) {
      console.error("Erro ao salvar filtro:", error);
      toast.error("Erro ao salvar filtro");
    } finally {
      setSaving(false);
    }
  };

  const handleExcluirFiltro = async (filtroId) => {
    try {
      const user = await base44.auth.me();
      const chave = `filtros_${rota}`;
      
      const filtrosAtualizados = filtrosSalvos.filter(f => f.id !== filtroId);
      
      await base44.auth.updateMe({
        [chave]: JSON.stringify(filtrosAtualizados)
      });

      setFiltrosSalvos(filtrosAtualizados);
      toast.success("Filtro excluído!");
    } catch (error) {
      console.error("Erro ao excluir filtro:", error);
      toast.error("Erro ao excluir filtro");
    }
  };

  const theme = {
    cardBg: isDark ? '#1e293b' : '#ffffff',
    border: isDark ? '#334155' : '#e5e7eb',
    text: isDark ? '#f1f5f9' : '#111827',
    textMuted: isDark ? '#94a3b8' : '#6b7280',
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="h-8 gap-2"
            style={{
              backgroundColor: 'transparent',
              borderColor: theme.border,
              color: theme.text
            }}
          >
            <Star className="w-3.5 h-3.5" />
            Filtros
            <ChevronDown className="w-3 h-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="w-56"
          style={{ backgroundColor: theme.cardBg, borderColor: theme.border }}
        >
          {filtrosSalvos.length === 0 ? (
            <div className="p-4 text-center">
              <p className="text-xs" style={{ color: theme.textMuted }}>
                Nenhum filtro salvo
              </p>
            </div>
          ) : (
            filtrosSalvos.map((filtro) => (
              <DropdownMenuItem
                key={filtro.id}
                className="flex items-center justify-between gap-2 cursor-pointer"
                style={{ color: theme.text }}
                onClick={() => onAplicarFiltro(filtro.filtros)}
              >
                <div className="flex items-center gap-2">
                  <Star className="w-3 h-3 text-yellow-500" />
                  <span className="text-sm">{filtro.nome}</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-5 w-5 p-0 hover:bg-red-50 dark:hover:bg-red-950"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleExcluirFiltro(filtro.id);
                  }}
                >
                  <Trash2 className="w-3 h-3 text-red-500" />
                </Button>
              </DropdownMenuItem>
            ))
          )}
          <DropdownMenuItem
            onClick={() => setShowSaveDialog(true)}
            style={{ color: theme.text, borderTop: `1px solid ${theme.border}` }}
            className="cursor-pointer mt-1"
          >
            <Plus className="w-3 h-3 mr-2" />
            Salvar Filtro Atual
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogContent style={{ backgroundColor: theme.cardBg, borderColor: theme.border }}>
          <DialogHeader>
            <DialogTitle style={{ color: theme.text }}>Salvar Filtro Predefinido</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Input
              placeholder="Nome do filtro (ex: Minhas ordens em SP)"
              value={nomeFiltro}
              onChange={(e) => setNomeFiltro(e.target.value)}
              className="w-full"
              style={{ backgroundColor: theme.cardBg, borderColor: theme.border, color: theme.text }}
              autoFocus
            />
            <p className="text-xs mt-2" style={{ color: theme.textMuted }}>
              Este filtro salvará todas as seleções atuais
            </p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowSaveDialog(false);
                setNomeFiltro("");
              }}
              style={{ borderColor: theme.border, color: theme.text }}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSalvarFiltro}
              disabled={saving}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {saving ? "Salvando..." : "Salvar Filtro"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}