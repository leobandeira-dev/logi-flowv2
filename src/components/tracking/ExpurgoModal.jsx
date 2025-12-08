import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { FileUp, Loader2, AlertTriangle } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";

export default function ExpurgoModal({ open, onClose, ordem, tipo, onSuccess }) {
  const [isDark, setIsDark] = useState(false);
  const [motivo, setMotivo] = useState("");
  const [evidenciaFile, setEvidenciaFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const checkDarkMode = () => {
      setIsDark(document.documentElement.classList.contains('dark'));
    };
    checkDarkMode();
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setEvidenciaFile(file);
    }
  };

  const handleSubmit = async () => {
    if (!motivo.trim()) {
      toast.error("Informe o motivo do expurgo");
      return;
    }

    if (!evidenciaFile) {
      toast.error("Anexe a evidência de autorização");
      return;
    }

    setSaving(true);
    try {
      // Upload da evidência
      setUploading(true);
      const uploadResponse = await base44.integrations.Core.UploadFile({ file: evidenciaFile });
      const evidenciaUrl = uploadResponse.file_url;
      setUploading(false);

      // Atualizar ordem com dados do expurgo
      const updateData = {};
      
      if (tipo === "carregamento") {
        updateData.carregamento_expurgado = true;
        updateData.carregamento_expurgo_motivo = motivo;
        updateData.carregamento_expurgo_evidencia_url = evidenciaUrl;
      } else if (tipo === "entrega") {
        updateData.entrega_expurgada = true;
        updateData.entrega_expurgo_motivo = motivo;
        updateData.entrega_expurgo_evidencia_url = evidenciaUrl;
      }

      await base44.entities.OrdemDeCarregamento.update(ordem.id, updateData);

      toast.success("Expurgo registrado com sucesso!");
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Erro ao registrar expurgo:", error);
      toast.error("Erro ao registrar expurgo");
    } finally {
      setSaving(false);
      setUploading(false);
    }
  };

  const theme = {
    cardBg: isDark ? '#1e293b' : '#ffffff',
    border: isDark ? '#334155' : '#e5e7eb',
    text: isDark ? '#f1f5f9' : '#111827',
    textMuted: isDark ? '#94a3b8' : '#6b7280',
    inputBg: isDark ? '#0f172a' : '#ffffff',
    inputBorder: isDark ? '#475569' : '#d1d5db',
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent style={{ backgroundColor: theme.cardBg, borderColor: theme.border }}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2" style={{ color: theme.text }}>
            <AlertTriangle className="w-5 h-5 text-orange-600" />
            Expurgo de {tipo === "carregamento" ? "Carregamento" : "Entrega"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div 
            className="p-3 rounded-lg border"
            style={{
              backgroundColor: isDark ? 'rgba(234, 88, 12, 0.1)' : '#fff7ed',
              borderColor: isDark ? 'rgba(234, 88, 12, 0.3)' : '#fed7aa'
            }}
          >
            <p className="text-xs" style={{ color: isDark ? '#fdba74' : '#9a3412' }}>
              <strong>Ordem:</strong> {ordem.numero_carga || `#${ordem.id.slice(-6)}`}
            </p>
            <p className="text-xs mt-1" style={{ color: isDark ? '#fdba74' : '#9a3412' }}>
              Ao expurgar, este {tipo === "carregamento" ? "carregamento" : "entrega"} fora do prazo não será contabilizado nas métricas de SLA.
            </p>
          </div>

          <div>
            <Label style={{ color: theme.text }}>Motivo do Expurgo *</Label>
            <Textarea
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              placeholder="Descreva o motivo da exceção (ex: condições climáticas, greve, problema com cliente...)"
              rows={4}
              className="mt-1"
              style={{ backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.text }}
            />
          </div>

          <div>
            <Label style={{ color: theme.text }}>Evidência de Autorização *</Label>
            <div className="mt-1">
              <Input
                type="file"
                accept="image/*,application/pdf"
                onChange={handleFileChange}
                className="cursor-pointer"
                style={{ backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.text }}
              />
              {evidenciaFile && (
                <p className="text-xs mt-2" style={{ color: theme.textMuted }}>
                  Arquivo selecionado: {evidenciaFile.name}
                </p>
              )}
            </div>
            <p className="text-xs mt-1" style={{ color: theme.textMuted }}>
              Anexe um documento que autorize o expurgo (email, ofício, etc.)
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={saving}
            style={{ borderColor: theme.border, color: theme.text }}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={saving || uploading}
            className="bg-orange-600 hover:bg-orange-700"
          >
            {uploading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Enviando arquivo...
              </>
            ) : saving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <FileUp className="w-4 h-4 mr-2" />
                Confirmar Expurgo
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}