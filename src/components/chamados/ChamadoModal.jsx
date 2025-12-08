import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Lightbulb, Bug, HelpCircle, Upload, X, Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

export default function ChamadoModal({ open, onClose, currentPage }) {
  const [tipo, setTipo] = useState("sugestao");
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [screenshot, setScreenshot] = useState(null);
  const [uploading, setUploading] = useState(false);
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

  const handleFileUpload = async (file) => {
    if (!file) return;

    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setScreenshot(file_url);
      toast.success("Imagem anexada!");
    } catch (error) {
      console.error("Erro ao fazer upload:", error);
      toast.error("Erro ao anexar imagem");
    } finally {
      setUploading(false);
    }
  };

  const handlePaste = async (e) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        e.preventDefault();
        const file = items[i].getAsFile();
        if (file) {
          await handleFileUpload(file);
          toast.success("Print colado com sucesso!");
        }
        break;
      }
    }
  };

  const handleSubmit = async () => {
    if (!titulo.trim() || !descricao.trim()) {
      toast.error("Preencha título e descrição");
      return;
    }

    setSending(true);
    try {
      const user = await base44.auth.me();

      await base44.entities.Chamado.create({
        tipo,
        titulo: titulo.trim(),
        descricao: descricao.trim(),
        pagina: currentPage || "Desconhecida",
        prioridade: tipo === "bug" ? "alta" : "media",
        status: "aberto",
        user_id: user.id,
        user_nome: user.full_name,
        user_email: user.email,
        screenshot_url: screenshot
      });

      toast.success("Chamado enviado com sucesso! Obrigado pelo feedback.");
      onClose();
    } catch (error) {
      console.error("Erro ao enviar chamado:", error);
      toast.error("Erro ao enviar chamado");
    } finally {
      setSending(false);
    }
  };

  const tiposConfig = {
    sugestao: { 
      icon: Lightbulb, 
      label: "Sugestão de Melhoria", 
      color: "text-amber-700 dark:text-amber-400", 
      bg: "bg-amber-100 dark:bg-amber-900/30", 
      border: "border-amber-400 dark:border-amber-600",
      iconColor: "text-amber-600 dark:text-amber-400"
    },
    bug: { 
      icon: Bug, 
      label: "Reportar Bug", 
      color: "text-red-700 dark:text-red-400", 
      bg: "bg-red-100 dark:bg-red-900/30", 
      border: "border-red-400 dark:border-red-600",
      iconColor: "text-red-600 dark:text-red-400"
    },
    duvida: { 
      icon: HelpCircle, 
      label: "Dúvida", 
      color: "text-blue-700 dark:text-blue-400", 
      bg: "bg-blue-100 dark:bg-blue-900/30", 
      border: "border-blue-400 dark:border-blue-600",
      iconColor: "text-blue-600 dark:text-blue-400"
    }
  };

  const theme = {
    bg: isDark ? '#1e293b' : '#ffffff',
    text: isDark ? '#f1f5f9' : '#111827',
    textMuted: isDark ? '#94a3b8' : '#6b7280',
    border: isDark ? '#334155' : '#e5e7eb',
    inputBg: isDark ? '#0f172a' : '#ffffff',
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[85vh] sm:max-h-[90vh] overflow-y-auto p-4 sm:p-6" style={{ backgroundColor: theme.bg, borderColor: theme.border }}>
        <DialogHeader className="pb-3">
          <DialogTitle className="text-base sm:text-lg" style={{ color: theme.text }}>
            💬 Feedback e Sugestões
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3 sm:space-y-4">
          <div>
            <Label className="mb-2 block text-sm" style={{ color: theme.text }}>Tipo de Feedback</Label>
            <RadioGroup value={tipo} onValueChange={setTipo}>
              {Object.entries(tiposConfig).map(([key, config]) => {
                const Icon = config.icon;
                return (
                  <div key={key} className={`flex items-center space-x-2 sm:space-x-3 p-2 sm:p-3 rounded-lg border-2 ${config.bg} ${config.border} cursor-pointer transition-all hover:shadow-md ${tipo === key ? 'ring-2 ring-offset-2 ring-blue-500' : ''}`}
                    onClick={() => setTipo(key)}>
                    <RadioGroupItem value={key} id={key} />
                    <Label htmlFor={key} className="flex items-center gap-2 cursor-pointer flex-1">
                      <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${config.iconColor}`} />
                      <span className={`font-semibold text-sm sm:text-base ${config.color}`}>{config.label}</span>
                    </Label>
                  </div>
                );
              })}
            </RadioGroup>
          </div>

          <div>
            <Label className="text-sm" style={{ color: theme.text }}>Título *</Label>
            <Input
              placeholder="Resumo do problema ou sugestão"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              className="mt-1 text-sm"
              style={{ backgroundColor: theme.inputBg, borderColor: theme.border, color: theme.text }}
              maxLength={100}
            />
          </div>

          <div>
            <Label className="text-sm" style={{ color: theme.text }}>Descrição *</Label>
            <Textarea
              placeholder="Descreva detalhadamente... (Cole Ctrl+V para anexar print)"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              onPaste={handlePaste}
              rows={4}
              className="mt-1 text-sm"
              style={{ backgroundColor: theme.inputBg, borderColor: theme.border, color: theme.text }}
            />
            <p className="text-[10px] sm:text-xs mt-1" style={{ color: theme.textMuted }}>
              💡 Dica: Cole (Ctrl+V) uma imagem diretamente aqui
            </p>
          </div>

          <div>
            <Label className="mb-2 block text-sm" style={{ color: theme.text }}>Anexar Imagem (opcional)</Label>
            <div className="border-2 border-dashed rounded-lg p-3 sm:p-4 text-center" style={{ borderColor: theme.border }}>
              {screenshot ? (
                <div className="relative">
                  <img src={screenshot} alt="Screenshot" className="max-h-32 sm:max-h-40 mx-auto rounded" />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setScreenshot(null)}
                    className="absolute top-0 right-0 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 p-0"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              ) : (
                <label className="cursor-pointer">
                  <Upload className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-2" style={{ color: theme.textMuted }} />
                  <p className="text-xs sm:text-sm" style={{ color: theme.textMuted }}>
                    Clique para anexar uma captura de tela
                  </p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUpload(file);
                    }}
                    className="hidden"
                    disabled={uploading}
                  />
                  {uploading && (
                    <div className="flex items-center justify-center gap-2 mt-2">
                      <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                      <span className="text-xs text-blue-600">Enviando...</span>
                    </div>
                  )}
                </label>
              )}
            </div>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-2 sm:p-3">
            <p className="text-[10px] sm:text-xs" style={{ color: isDark ? '#93c5fd' : '#1e40af' }}>
              📍 Enviando de: <strong>{currentPage || "Sistema"}</strong>
            </p>
          </div>

          <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 pt-3 sm:pt-4">
            <Button 
              variant="outline" 
              onClick={onClose} 
              style={{ borderColor: theme.border, color: theme.text }}
              className="w-full sm:w-auto h-9 text-sm"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!titulo.trim() || !descricao.trim() || sending}
              className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto h-9 text-sm"
            >
              {sending ? (
                <>
                  <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 mr-2 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                  Enviar Feedback
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}