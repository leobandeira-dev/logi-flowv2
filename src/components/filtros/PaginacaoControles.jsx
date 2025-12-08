import React from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function PaginacaoControles({ 
  paginaAtual, 
  totalRegistros, 
  limite, 
  onPaginaAnterior, 
  onProximaPagina,
  isDark 
}) {
  const totalPaginas = Math.ceil(totalRegistros / limite);
  const inicio = (paginaAtual - 1) * limite + 1;
  const fim = Math.min(paginaAtual * limite, totalRegistros);
  
  const temPaginaAnterior = paginaAtual > 1;
  const temProximaPagina = paginaAtual < totalPaginas;

  const theme = {
    text: isDark ? '#f1f5f9' : '#111827',
    textMuted: isDark ? '#94a3b8' : '#6b7280',
    border: isDark ? '#334155' : '#e5e7eb',
  };

  if (totalRegistros === 0) return null;

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={onPaginaAnterior}
        disabled={!temPaginaAnterior}
        className="h-8 w-8 p-0"
        style={{
          backgroundColor: 'transparent',
          borderColor: theme.border,
          color: theme.text,
          opacity: temPaginaAnterior ? 1 : 0.5
        }}
      >
        <ChevronLeft className="w-4 h-4" />
      </Button>
      
      <div className="flex items-center gap-1.5">
        <span className="text-xs font-medium" style={{ color: theme.text }}>
          {inicio}-{fim}
        </span>
        <span className="text-xs" style={{ color: theme.textMuted }}>
          de {totalRegistros}
        </span>
      </div>
      
      <Button
        variant="outline"
        size="sm"
        onClick={onProximaPagina}
        disabled={!temProximaPagina}
        className="h-8 w-8 p-0"
        style={{
          backgroundColor: 'transparent',
          borderColor: theme.border,
          color: theme.text,
          opacity: temProximaPagina ? 1 : 0.5
        }}
      >
        <ChevronRight className="w-4 h-4" />
      </Button>
    </div>
  );
}