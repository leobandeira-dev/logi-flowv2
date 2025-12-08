
import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Send, Loader2, Clock, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";

export default function SAC() {
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [loading, setLoading] = useState(true); // Changed initial state to true
  const [sending, setSending] = useState(false);
  const [isDark, setIsDark] = useState(false); // New state for dark mode
  const messagesEndRef = React.useRef(null); // Explicitly using React.useRef

  // Detect dark mode
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
    initializeConversation();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (conversation?.id) {
      // Subscrever para atualizações da conversa
      const unsubscribe = base44.agents.subscribeToConversation(conversation.id, (data) => {
        setMessages(data.messages || []);
      });

      return () => unsubscribe();
    }
  }, [conversation?.id]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const initializeConversation = async () => {
    setLoading(true);
    try {
      // Criar nova conversa com o agente SAC
      const newConversation = await base44.agents.createConversation({
        agent_name: "sac",
        metadata: {
          name: "Atendimento SAC",
          description: "Conversa com assistente virtual"
        }
      });

      setConversation(newConversation);
      setMessages(newConversation.messages || []);
    } catch (error) {
      console.error("Erro ao inicializar conversa:", error);
      toast.error("Erro ao conectar com o assistente");
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (messageContent) => { // Updated to accept messageContent
    const messageToSend = messageContent ? messageContent.trim() : inputMessage.trim();
    if (!messageToSend || !conversation) return;

    setInputMessage(""); // Clear input regardless if it was from input or suggestion
    setSending(true);

    try {
      await base44.agents.addMessage(conversation, {
        role: "user",
        content: messageToSend
      });
    } catch (error) {
      console.error("Erro ao enviar mensagem:", error);
      toast.error("Erro ao enviar mensagem");
    } finally {
      setSending(false);
    }
  };

  const suggestedQuestions = [
    "Qual o status da minha carga?",
    "Onde está meu pedido?",
    "Quando minha carga será entregue?",
    "Quais são minhas ordens em andamento?"
  ];

  // Removed handleSuggestedQuestion as it's now integrated into handleSendMessage

  const theme = {
    bg: isDark ? '#0f172a' : '#f9fafb',
    cardBg: isDark ? '#1e293b' : '#ffffff',
    cardBorder: isDark ? '#334155' : '#e5e7eb',
    text: isDark ? '#f1f5f9' : '#111827',
    textMuted: isDark ? '#94a3b8' : '#6b7280',
    messageBg: isDark ? '#334155' : '#f3f4f6',
    userMessageBg: isDark ? '#1e40af' : '#2563eb',
    inputBg: isDark ? '#1e293b' : '#ffffff',
    inputBorder: isDark ? '#334155' : '#d1d5db',
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: theme.bg }}>
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p style={{ color: theme.textMuted }}>Iniciando conversa...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen transition-colors" style={{ backgroundColor: theme.bg }}>
      <div className="max-w-4xl mx-auto p-4">
        <Card className="mb-4" style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <MessageCircle className="w-6 h-6 text-white" />
                </div>
                <div>
                  <CardTitle style={{ color: theme.text }}>Assistente Virtual - SAC</CardTitle>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge className="bg-green-500 text-white text-xs">
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      Online
                    </Badge>
                    <span className="text-xs" style={{ color: theme.textMuted }}>
                      Responde em alguns segundos
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        <Card className="mb-4 h-[600px] flex flex-col" style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <MessageCircle className="w-16 h-16 mb-4" style={{ color: theme.textMuted }} />
                <h3 className="text-lg font-semibold mb-2" style={{ color: theme.text }}>
                  Como posso ajudar?
                </h3>
                <p className="mb-4" style={{ color: theme.textMuted }}>
                  Estou aqui para responder suas dúvidas sobre cargas, entregas e rastreamento.
                </p>
                <div className="space-y-2 max-w-md">
                  {suggestedQuestions.map((q, i) => (
                    <Button
                      key={i}
                      variant="outline"
                      onClick={() => handleSendMessage(q)}
                      className="w-full justify-start text-left"
                      style={{ borderColor: theme.cardBorder, color: theme.text }}
                    >
                      {q}
                    </Button>
                  ))}
                </div>
              </div>
            ) : (
              <>
                {messages.map((msg, idx) => (
                  <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`max-w-[80%] rounded-lg p-3 ${
                        msg.role === 'user'
                          ? 'text-white'
                          : ''
                      }`}
                      style={{
                        backgroundColor: msg.role === 'user' ? theme.userMessageBg : theme.messageBg,
                        color: msg.role === 'user' ? '#ffffff' : theme.text
                      }}
                    >
                      {msg.role === 'assistant' ? (
                        <ReactMarkdown className="prose prose-sm max-w-none">
                          {msg.content}
                        </ReactMarkdown>
                      ) : (
                        <p>{msg.content}</p>
                      )}
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          <div className="p-4 border-t" style={{ borderColor: theme.cardBorder }}>
            <div className="flex gap-2">
              <Input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && !sending && handleSendMessage()}
                placeholder="Digite sua mensagem..."
                disabled={sending}
                style={{ backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.text }}
              />
              <Button
                onClick={() => handleSendMessage()}
                disabled={sending || !inputMessage.trim()}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {sending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}>
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-blue-500 mt-0.5" />
                <div>
                  <h4 className="font-semibold mb-1" style={{ color: theme.text }}>
                    Atendimento 24/7
                  </h4>
                  <p className="text-sm" style={{ color: theme.textMuted }}>
                    Estou disponível a qualquer hora para ajudar com suas dúvidas sobre logística e rastreamento.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}>
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5" />
                <div>
                  <h4 className="font-semibold mb-1" style={{ color: theme.text }}>
                    Respostas Rápidas
                  </h4>
                  <p className="text-sm" style={{ color: theme.textMuted }}>
                    Obtenha informações sobre suas cargas, status de entregas e muito mais em segundos.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
