import React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { AlertTriangle, XCircle, FileText } from "lucide-react";

export default function AlertaVolumeModal({ open, onClose, alerta, isDark }) {
  if (!alerta) return null;

  const theme = {
    bg: isDark ? '#1e293b' : '#ffffff',
    text: isDark ? '#f1f5f9' : '#111827',
    textMuted: isDark ? '#94a3b8' : '#6b7280',
  };

  const tipoConfig = {
    duplicado: {
      icon: XCircle,
      color: '#ef4444',
      bgColor: isDark ? '#7f1d1d' : '#fee2e2',
      titulo: 'Volume Já Embarcado',
    },
    divergencia: {
      icon: AlertTriangle,
      color: '#f59e0b',
      bgColor: isDark ? '#78350f' : '#fef3c7',
      titulo: 'Divergência Detectada',
    }
  };

  const config = tipoConfig[alerta.tipo] || tipoConfig.divergencia;
  const Icon = config.icon;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent 
        className="max-w-md"
        style={{ backgroundColor: theme.bg }}
      >
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div 
              className="w-12 h-12 rounded-full flex items-center justify-center"
              style={{ backgroundColor: config.bgColor }}
            >
              <Icon className="w-6 h-6" style={{ color: config.color }} />
            </div>
            <DialogTitle style={{ color: theme.text }}>
              {config.titulo}
            </DialogTitle>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div 
            className="p-4 rounded-lg border-2"
            style={{ 
              backgroundColor: config.bgColor,
              borderColor: config.color 
            }}
          >
            <p className="font-semibold text-sm mb-2" style={{ color: config.color }}>
              {alerta.mensagem}
            </p>
            
            {alerta.detalhes && (
              <div className="space-y-2 mt-3">
                {alerta.detalhes.volumeCodigo && (
                  <div className="text-xs">
                    <span style={{ color: theme.textMuted }}>Código: </span>
                    <span className="font-mono font-bold" style={{ color: theme.text }}>
                      {alerta.detalhes.volumeCodigo}
                    </span>
                  </div>
                )}
                
                {alerta.detalhes.notaOriginal && (
                  <div className="flex items-center gap-2 p-2 rounded border" 
                    style={{ 
                      backgroundColor: isDark ? '#0f172a' : '#ffffff',
                      borderColor: isDark ? '#334155' : '#e5e7eb'
                    }}
                  >
                    <FileText className="w-4 h-4 flex-shrink-0" style={{ color: config.color }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold" style={{ color: theme.text }}>
                        NF {alerta.detalhes.notaOriginal.numero_nota}
                      </p>
                      <p className="text-[10px] truncate" style={{ color: theme.textMuted }}>
                        {alerta.detalhes.notaOriginal.emitente_razao_social}
                      </p>
                    </div>
                  </div>
                )}

                {alerta.detalhes.notaEsperada && (
                  <div className="text-xs">
                    <span style={{ color: theme.textMuted }}>Esperado na: </span>
                    <span className="font-semibold" style={{ color: theme.text }}>
                      NF {alerta.detalhes.notaEsperada.numero_nota}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          {alerta.sugestao && (
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded">
              <p className="text-xs" style={{ color: isDark ? '#93c5fd' : '#1e40af' }}>
                💡 {alerta.sugestao}
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            onClick={onClose}
            className="w-full h-11 text-base font-semibold"
            style={{ backgroundColor: config.color }}
          >
            Entendi
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}