import React, { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  MessageCircle,
  Send,
  X,
  Loader2,
  Paperclip,
  Check,
  CheckCheck
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import { format, isValid } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function ChatCentral({ open, onClose, viagem }) {
  const [mensagens, setMensagens] = useState([]);
  const [novaMensagem, setNovaMensagem] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [carregando, setCarregando] = useState(true);
  const [uploadando, setUploadando] = useState(false);
  const [user, setUser] = useState(null);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (open && viagem) {
      loadUser();
      loadMensagens();
      
      // Polling para novas mensagens
      const interval = setInterval(loadMensagens, 5000);
      return () => clearInterval(interval);
    }
  }, [open, viagem?.id]);

  useEffect(() => {
    scrollToBottom();
  }, [mensagens]);

  const loadUser = async () => {
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
    } catch (error) {
      console.error("Erro ao carregar usuário:", error);
    }
  };

  const loadMensagens = async () => {
    try {
      const mensagensData = await base44.entities.Mensagem.filter(
        { ordem_id: viagem.id },
        "created_date"
      );
      setMensagens(mensagensData);
      
      // Marcar mensagens como lidas (que não são do motorista atual)
      const naoLidas = mensagensData.filter(
        m => !m.lida && m.remetente_id !== user?.id
      );
      
      for (const msg of naoLidas) {
        await base44.entities.Mensagem.update(msg.id, {
          lida: true,
          data_leitura: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error("Erro ao carregar mensagens:", error);
    } finally {
      setCarregando(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleEnviarMensagem = async () => {
    if (!novaMensagem.trim() || !user) return;

    setEnviando(true);
    try {
      await base44.entities.Mensagem.create({
        ordem_id: viagem.id,
        remetente_id: user.id,
        remetente_nome: user.full_name,
        remetente_tipo: user.role === "admin" ? "admin" : "motorista",
        conteudo: novaMensagem.trim()
      });

      setNovaMensagem("");
      await loadMensagens();
    } catch (error) {
      console.error("Erro ao enviar mensagem:", error);
      toast.error("Erro ao enviar mensagem");
    } finally {
      setEnviando(false);
    }
  };

  const handleUploadAnexo = async (event) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    setUploadando(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });

      const tipoAnexo = file.type.startsWith("image/") ? "foto" : "documento";

      await base44.entities.Mensagem.create({
        ordem_id: viagem.id,
        remetente_id: user.id,
        remetente_nome: user.full_name,
        remetente_tipo: user.role === "admin" ? "admin" : "motorista",
        conteudo: tipoAnexo === "foto" ? "📷 Foto enviada" : "📎 Documento enviado",
        anexo_url: file_url,
        tipo_anexo: tipoAnexo
      });

      await loadMensagens();
      toast.success("Arquivo enviado com sucesso!");
    } catch (error) {
      console.error("Erro ao enviar arquivo:", error);
      toast.error("Erro ao enviar arquivo");
    } finally {
      setUploadando(false);
    }
  };

  const formatTime = (dateString) => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      if (!isValid(date)) return "";
      return format(date, "HH:mm", { locale: ptBR });
    } catch {
      return "";
    }
  };

  const isMinhaMsg = (msg) => msg.remetente_id === user?.id;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl h-[600px] flex flex-col p-0">
        <DialogHeader className="p-4 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                <MessageCircle className="w-5 h-5 text-white" />
              </div>
              <div>
                <DialogTitle>Chat com a Central</DialogTitle>
                <p className="text-sm text-gray-500">
                  {viagem.numero_carga || `#${viagem.id.slice(-6)}`}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8 rounded-full"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </DialogHeader>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
          {carregando ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
            </div>
          ) : mensagens.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <MessageCircle className="w-12 h-12 mb-2" />
              <p>Nenhuma mensagem ainda</p>
              <p className="text-sm">Envie a primeira mensagem!</p>
            </div>
          ) : (
            <>
              {mensagens.map((msg) => {
                const minhaMensagem = isMinhaMsg(msg);
                return (
                  <div
                    key={msg.id}
                    className={`flex ${minhaMensagem ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                        minhaMensagem
                          ? "bg-blue-600 text-white"
                          : "bg-white text-gray-900 border"
                      }`}
                    >
                      {!minhaMensagem && (
                        <div className="flex items-center gap-2 mb-1">
                          <Badge
                            variant="outline"
                            className={`text-xs ${
                              msg.remetente_tipo === "admin"
                                ? "border-purple-300 text-purple-700 bg-purple-50"
                                : "border-blue-300 text-blue-700 bg-blue-50"
                            }`}
                          >
                            {msg.remetente_tipo === "admin" ? "Central" : "Motorista"}
                          </Badge>
                          <span className="text-xs font-medium">{msg.remetente_nome}</span>
                        </div>
                      )}
                      
                      {msg.anexo_url ? (
                        <div className="space-y-2">
                          {msg.tipo_anexo === "foto" ? (
                            <a
                              href={msg.anexo_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block"
                            >
                              <img
                                src={msg.anexo_url}
                                alt="Anexo"
                                className="max-w-full rounded-lg max-h-60 object-contain"
                              />
                            </a>
                          ) : (
                            <a
                              href={msg.anexo_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={`flex items-center gap-2 p-2 rounded ${
                                minhaMensagem ? "bg-blue-700" : "bg-gray-100"
                              }`}
                            >
                              <Paperclip className="w-4 h-4" />
                              <span className="text-sm">Ver documento</span>
                            </a>
                          )}
                          <p className="text-sm">{msg.conteudo}</p>
                        </div>
                      ) : (
                        <p className="text-sm whitespace-pre-wrap">{msg.conteudo}</p>
                      )}
                      
                      <div
                        className={`flex items-center gap-1 mt-1 ${
                          minhaMensagem ? "justify-end" : "justify-start"
                        }`}
                      >
                        <span
                          className={`text-xs ${
                            minhaMensagem ? "text-blue-100" : "text-gray-500"
                          }`}
                        >
                          {formatTime(msg.created_date)}
                        </span>
                        {minhaMensagem && (
                          msg.lida ? (
                            <CheckCheck className="w-3 h-3 text-blue-100" />
                          ) : (
                            <Check className="w-3 h-3 text-blue-100" />
                          )
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Input Area */}
        <div className="p-4 border-t bg-white">
          <div className="flex gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,application/pdf"
              onChange={handleUploadAnexo}
              className="hidden"
            />
            
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadando}
              className="flex-shrink-0"
            >
              {uploadando ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Paperclip className="w-4 h-4" />
              )}
            </Button>

            <Input
              value={novaMensagem}
              onChange={(e) => setNovaMensagem(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && !e.shiftKey && handleEnviarMensagem()}
              placeholder="Digite sua mensagem..."
              disabled={enviando}
              className="flex-1"
            />

            <Button
              onClick={handleEnviarMensagem}
              disabled={enviando || !novaMensagem.trim()}
              className="bg-blue-600 hover:bg-blue-700 flex-shrink-0"
            >
              {enviando ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}