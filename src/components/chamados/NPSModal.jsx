import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function NPSModal({ open, onClose, chamado }) {
  const [score, setScore] = useState(null);
  const [comentario, setComentario] = useState("");
  const [sending, setSending] = useState(false);
  const [isDark, setIsDark] = useState(false);

  React.useEffect(() => {
    const checkDarkMode = () => {
      setIsDark(document.documentElement.classList.contains('dark'));
    };
    checkDarkMode();
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  const handleSubmit = async () => {
    if (score === null) {
      toast.error("Por favor, selecione uma nota");
      return;
    }

    setSending(true);
    try {
      await base44.entities.Chamado.update(chamado.id, {
        nps_score: score,
        nps_comentario: comentario.trim() || null,
        data_nps: new Date().toISOString()
      });

      toast.success("Obrigado pela avaliação!");
      onClose();
    } catch (error) {
      console.error("Erro ao enviar NPS:", error);
      toast.error("Erro ao enviar avaliação");
    } finally {
      setSending(false);
    }
  };

  const theme = {
    bg: isDark ? '#1e293b' : '#ffffff',
    text: isDark ? '#f1f5f9' : '#111827',
    textMuted: isDark ? '#94a3b8' : '#6b7280',
    border: isDark ? '#334155' : '#e5e7eb',
    inputBg: isDark ? '#0f172a' : '#ffffff',
  };

  const getScoreColor = (scoreValue) => {
    if (scoreValue <= 6) return "text-red-500";
    if (scoreValue <= 8) return "text-yellow-500";
    return "text-green-500";
  };

  const getScoreLabel = () => {
    if (score === null) return "";
    if (score <= 6) return "😞 Podemos melhorar";
    if (score <= 8) return "😊 Bom";
    return "🎉 Excelente!";
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md" style={{ backgroundColor: theme.bg, borderColor: theme.border }}>
        <DialogHeader>
          <DialogTitle style={{ color: theme.text }}>
            ⭐ Avalie a Resolução
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <p className="text-sm font-medium mb-1" style={{ color: theme.text }}>
              Seu chamado foi resolvido!
            </p>
            <p className="text-xs" style={{ color: theme.textMuted }}>
              "{chamado.titulo}"
            </p>
          </div>

          <div>
            <Label className="mb-3 block text-center" style={{ color: theme.text }}>
              De 0 a 10, o quanto você está satisfeito com a resolução?
            </Label>
            <div className="flex justify-center gap-2 flex-wrap">
              {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                <Button
                  key={num}
                  variant={score === num ? "default" : "outline"}
                  size="sm"
                  onClick={() => setScore(num)}
                  className={`w-10 h-10 ${score === num ? 'bg-blue-600 hover:bg-blue-700' : ''}`}
                  style={score !== num ? { borderColor: theme.border, color: theme.text } : {}}
                >
                  {num}
                </Button>
              ))}
            </div>
            {score !== null && (
              <p className={`text-center mt-3 font-semibold ${getScoreColor(score)}`}>
                {getScoreLabel()}
              </p>
            )}
          </div>

          <div>
            <Label style={{ color: theme.text }}>Comentário (opcional)</Label>
            <Textarea
              placeholder="Deixe um comentário sobre a resolução..."
              value={comentario}
              onChange={(e) => setComentario(e.target.value)}
              rows={3}
              className="mt-1"
              style={{ backgroundColor: theme.inputBg, borderColor: theme.border, color: theme.text }}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={onClose} style={{ borderColor: theme.border, color: theme.text }}>
              Pular
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={score === null || sending}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {sending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Enviando...
                </>
              ) : (
                "Enviar Avaliação"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}