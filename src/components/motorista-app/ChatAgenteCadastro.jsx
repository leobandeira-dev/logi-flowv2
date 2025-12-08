
import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import ReactMarkdown from 'react-markdown';
import {
  Send,
  Paperclip,
  X,
  Loader2,
  User,
  Bot,
  FileText,
  CheckCircle2,
  AlertCircle,
  Clock,
  ChevronRight
} from 'lucide-react';
import { toast } from 'sonner';

const FunctionDisplay = ({ toolCall }) => {
  const [expanded, setExpanded] = useState(false);
  const name = toolCall?.name || 'Function';
  const status = toolCall?.status || 'pending';
  const results = toolCall?.results;
  
  const parsedResults = (() => {
    if (!results) return null;
    try {
      return typeof results === 'string' ? JSON.parse(results) : results;
    } catch {
      return results;
    }
  })();
  
  const isError = results && (
    (typeof results === 'string' && /error|failed/i.test(results)) ||
    (parsedResults?.success === false)
  );
  
  const statusConfig = {
    pending: { icon: Clock, color: 'text-slate-400', text: 'Pendente' },
    running: { icon: Loader2, color: 'text-slate-500', text: 'Executando...', spin: true },
    in_progress: { icon: Loader2, color: 'text-slate-500', text: 'Executando...', spin: true },
    completed: isError ? 
      { icon: AlertCircle, color: 'text-red-500', text: 'Falhou' } : 
      { icon: CheckCircle2, color: 'text-green-600', text: 'Sucesso' },
    success: { icon: CheckCircle2, color: 'text-green-600', text: 'Sucesso' },
    failed: { icon: AlertCircle, color: 'text-red-500', text: 'Falhou' },
    error: { icon: AlertCircle, color: 'text-red-500', text: 'Falhou' }
  }[status] || { icon: Clock, color: 'text-slate-500', text: '' };
  
  const Icon = statusConfig.icon;
  const formattedName = name.split('.').reverse().join(' ').toLowerCase();
  
  return (
    <div className="mt-2 text-xs">
      <button
        onClick={() => setExpanded(!expanded)}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all hover:bg-slate-50 ${
          expanded ? "bg-slate-50 border-slate-300" : "bg-white border-slate-200"
        }`}
      >
        <Icon className={`h-3 w-3 ${statusConfig.color} ${statusConfig.spin ? 'animate-spin' : ''}`} />
        <span className="text-slate-700">{formattedName}</span>
        {statusConfig.text && (
          <span className={`text-slate-500 ${isError ? 'text-red-600' : ''}`}>
            • {statusConfig.text}
          </span>
        )}
        {!statusConfig.spin && (toolCall.arguments_string || results) && (
          <ChevronRight className={`h-3 w-3 text-slate-400 transition-transform ml-auto ${
            expanded ? 'rotate-90' : ''
          }`} />
        )}
      </button>
      
      {expanded && !statusConfig.spin && (
        <div className="mt-1.5 ml-3 pl-3 border-l-2 border-slate-200 space-y-2">
          {toolCall.arguments_string && (
            <div>
              <div className="text-xs text-slate-500 mb-1">Parâmetros:</div>
              <pre className="bg-slate-50 rounded-md p-2 text-xs text-slate-600 whitespace-pre-wrap">
                {(() => {
                  try {
                    return JSON.stringify(JSON.parse(toolCall.arguments_string), null, 2);
                  } catch {
                    return toolCall.arguments_string;
                  }
                })()}
              </pre>
            </div>
          )}
          {parsedResults && (
            <div>
              <div className="text-xs text-slate-500 mb-1">Resultado:</div>
              <pre className="bg-slate-50 rounded-md p-2 text-xs text-slate-600 whitespace-pre-wrap max-h-48 overflow-auto">
                {typeof parsedResults === 'object' ? 
                  JSON.stringify(parsedResults, null, 2) : parsedResults}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const MessageBubble = ({ message }) => {
  const isUser = message.role === 'user';
  
  return (
    <div className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <div className="h-8 w-8 rounded-lg bg-blue-100 flex items-center justify-center mt-0.5 flex-shrink-0">
          <Bot className="h-4 w-4 text-blue-600" />
        </div>
      )}
      <div className={`max-w-[85%] ${isUser ? 'flex flex-col items-end' : ''}`}>
        {message.content && (
          <div className={`rounded-2xl px-4 py-2.5 ${
            isUser 
              ? 'bg-blue-600 text-white' 
              : 'bg-white border border-slate-200'
          }`}>
            {isUser ? (
              <p className="text-sm leading-relaxed">{message.content}</p>
            ) : (
              <ReactMarkdown 
                className="text-sm prose prose-sm prose-slate max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0"
                components={{
                  p: ({ children }) => <p className="my-1 leading-relaxed">{children}</p>,
                  ul: ({ children }) => <ul className="my-1 ml-4 list-disc">{children}</ul>,
                  ol: ({ children }) => <ol className="my-1 ml-4 list-decimal">{children}</ol>,
                  li: ({ children }) => <li className="my-0.5">{children}</li>,
                  strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                }}
              >
                {message.content}
              </ReactMarkdown>
            )}
          </div>
        )}
        
        {message.tool_calls?.length > 0 && (
          <div className="space-y-1 mt-1">
            {message.tool_calls.map((toolCall, idx) => (
              <FunctionDisplay key={idx} toolCall={toolCall} />
            ))}
          </div>
        )}

        {message.file_urls && message.file_urls.length > 0 && (
          <div className="flex gap-2 mt-2 flex-wrap">
            {message.file_urls.map((url, idx) => {
              const isImage = url.match(/\.(jpg|jpeg|png|gif|webp)$/i);
              return (
                <div key={idx} className="relative group">
                  {isImage ? (
                    <img 
                      src={url} 
                      alt={`Anexo ${idx + 1}`}
                      className="h-32 w-32 object-cover rounded-lg border-2 border-slate-200 cursor-pointer hover:border-blue-400"
                      onClick={() => window.open(url, '_blank')}
                    />
                  ) : (
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-3 py-2 bg-slate-100 rounded-lg border border-slate-200 hover:border-blue-400 text-sm"
                    >
                      <FileText className="h-4 w-4 text-slate-600" />
                      <span className="text-slate-700">Documento {idx + 1}</span>
                    </a>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
      {isUser && (
        <div className="h-8 w-8 rounded-lg bg-slate-200 flex items-center justify-center mt-0.5 flex-shrink-0">
          <User className="h-4 w-4 text-slate-600" />
        </div>
      )}
    </div>
  );
};

export default function ChatAgenteCadastro({ open, onClose, motorista }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const [attachments, setAttachments] = useState([]);
  const [uploading, setUploading] = useState(false);
  const scrollAreaRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (open) {
      initConversation();
    }
  }, [open]);

  useEffect(() => {
    if (conversationId) {
      const unsubscribe = base44.agents.subscribeToConversation(conversationId, (data) => {
        setMessages(data.messages || []);
        scrollToBottom();
      });

      return () => unsubscribe();
    }
  }, [conversationId]);

  const initConversation = async () => {
    try {
      const conversation = await base44.agents.createConversation({
        agent_name: 'motorista_cadastro',
        metadata: {
          name: 'Atualização de Cadastro',
          motorista_id: motorista?.id,
          motorista_cpf: motorista?.cpf
        }
      });
      
      setConversationId(conversation.id);
      
      // Se já existe motorista, enviar CPF automaticamente
      if (motorista?.cpf) {
        setTimeout(() => {
          handleSendMessage(motorista.cpf, []);
        }, 500);
      }
    } catch (error) {
      console.error('Erro ao criar conversa:', error);
      toast.error('Erro ao iniciar conversa');
    }
  };

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  };

  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setUploading(true);
    const uploadedUrls = [];

    try {
      for (const file of files) {
        const { file_url } = await base44.integrations.Core.UploadFile({ file });
        uploadedUrls.push(file_url);
      }
      
      setAttachments([...attachments, ...uploadedUrls]);
      toast.success(`${files.length} arquivo(s) anexado(s)`);
    } catch (error) {
      console.error('Erro ao fazer upload:', error);
      toast.error('Erro ao anexar arquivo(s)');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveAttachment = (index) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  const handleSendMessage = async (customMessage = null, customAttachments = null) => {
    const messageText = customMessage || input.trim();
    const fileUrls = customAttachments !== null ? customAttachments : attachments;
    
    if (!messageText && fileUrls.length === 0) return;
    if (!conversationId) return;

    setSending(true);
    try {
      const conversation = await base44.agents.getConversation(conversationId);
      
      await base44.agents.addMessage(conversation, {
        role: 'user',
        content: messageText || '📎 Documento enviado',
        file_urls: fileUrls.length > 0 ? fileUrls : undefined
      });

      if (!customMessage) {
        setInput('');
      }
      setAttachments([]);
      scrollToBottom();
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      toast.error('Erro ao enviar mensagem');
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl h-[85vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <DialogTitle className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <Bot className="h-6 w-6 text-blue-600" />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-bold">Atualizar Meu Cadastro</h2>
              <p className="text-xs text-slate-600 font-normal mt-0.5">
                Assistente de cadastro e documentação
              </p>
            </div>
            <Badge className="bg-green-100 text-green-700 border-green-300">
              <div className="w-2 h-2 rounded-full bg-green-500 mr-1.5 animate-pulse" />
              Online
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <ScrollArea ref={scrollAreaRef} className="flex-1 px-6">
          <div className="space-y-4 py-4">
            {messages.length === 0 && (
              <div className="text-center py-6">
                <Bot className="h-12 w-12 mx-auto mb-4 text-blue-500" />
                <p className="text-base font-semibold text-slate-800 mb-2">
                  {motorista 
                    ? 'Como posso ajudar você hoje?'
                    : 'Olá! Vamos atualizar seu cadastro?'}
                </p>
                <p className="text-sm text-slate-600 mb-6">
                  Escolha uma opção ou envie sua dúvida
                </p>
                
                <div className="grid grid-cols-1 gap-2 max-w-md mx-auto">
                  <button
                    onClick={() => handleSendMessage('Quero atualizar minha CNH', [])}
                    disabled={sending}
                    className="flex items-center gap-3 p-3 bg-white hover:bg-blue-50 border-2 border-slate-200 hover:border-blue-300 rounded-xl text-left transition-all group"
                  >
                    <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-200">
                      <span className="text-lg">📄</span>
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-sm text-slate-800">Atualizar CNH</p>
                      <p className="text-xs text-slate-600">Envie foto ou PDF da sua CNH</p>
                    </div>
                  </button>

                  <button
                    onClick={() => handleSendMessage('Quero cadastrar ou atualizar meus veículos', [])}
                    disabled={sending}
                    className="flex items-center gap-3 p-3 bg-white hover:bg-blue-50 border-2 border-slate-200 hover:border-blue-300 rounded-xl text-left transition-all group"
                  >
                    <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0 group-hover:bg-green-200">
                      <span className="text-lg">🚛</span>
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-sm text-slate-800">Atualizar Veículos</p>
                      <p className="text-xs text-slate-600">CRLV e dados do cavalo/carreta</p>
                    </div>
                  </button>

                  <button
                    onClick={() => handleSendMessage('Preciso atualizar meu endereço', [])}
                    disabled={sending}
                    className="flex items-center gap-3 p-3 bg-white hover:bg-blue-50 border-2 border-slate-200 hover:border-blue-300 rounded-xl text-left transition-all group"
                  >
                    <div className="h-10 w-10 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0 group-hover:bg-purple-200">
                      <span className="text-lg">📍</span>
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-sm text-slate-800">Atualizar Endereço</p>
                      <p className="text-xs text-slate-600">Comprovante de residência</p>
                    </div>
                  </button>

                  <button
                    onClick={() => handleSendMessage('Quero atualizar meus dados bancários', [])}
                    disabled={sending}
                    className="flex items-center gap-3 p-3 bg-white hover:bg-blue-50 border-2 border-slate-200 hover:border-blue-300 rounded-xl text-left transition-all group"
                  >
                    <div className="h-10 w-10 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0 group-hover:bg-amber-200">
                      <span className="text-lg">💰</span>
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-sm text-slate-800">Dados Bancários</p>
                      <p className="text-xs text-slate-600">Conta, agência e PIX</p>
                    </div>
                  </button>

                  <button
                    onClick={() => handleSendMessage('Quero atualizar tudo de uma vez', [])}
                    disabled={sending}
                    className="flex items-center gap-3 p-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 border-2 border-blue-600 rounded-xl text-left transition-all shadow-sm"
                  >
                    <div className="h-10 w-10 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0">
                      <span className="text-lg">✨</span>
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-sm text-white">Atualização Completa</p>
                      <p className="text-xs text-blue-100">Todas as informações e documentos</p>
                    </div>
                  </button>
                </div>
              </div>
            )}
            
            {messages.map((message, index) => (
              <MessageBubble key={index} message={message} />
            ))}

            {sending && (
              <div className="flex gap-3 justify-start">
                <div className="h-8 w-8 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <Bot className="h-4 w-4 text-blue-600" />
                </div>
                <div className="bg-white border border-slate-200 rounded-2xl px-4 py-2.5">
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                    <span className="text-sm text-slate-600">Processando...</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="border-t bg-slate-50 px-6 py-4">
          {attachments.length > 0 && (
            <div className="flex gap-2 mb-3 flex-wrap">
              {attachments.map((url, index) => {
                const isImage = url.match(/\.(jpg|jpeg|png|gif|webp)$/i);
                return (
                  <div key={index} className="relative group">
                    {isImage ? (
                      <>
                        <img 
                          src={url} 
                          alt={`Anexo ${index + 1}`}
                          className="h-16 w-16 object-cover rounded-lg border-2 border-slate-300"
                        />
                        <button
                          onClick={() => handleRemoveAttachment(index)}
                          className="absolute -top-2 -right-2 h-5 w-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </>
                    ) : (
                      <div className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg border border-slate-300 group-hover:border-red-400">
                        <FileText className="h-4 w-4 text-slate-600" />
                        <span className="text-xs text-slate-700">Doc {index + 1}</span>
                        <button
                          onClick={() => handleRemoveAttachment(index)}
                          className="ml-2 text-red-500 hover:text-red-700"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          <div className="flex gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,.pdf"
              multiple
              onChange={handleFileSelect}
              className="hidden"
            />
            
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading || sending}
              className="flex-shrink-0"
            >
              {uploading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Paperclip className="h-4 w-4" />
              )}
            </Button>

            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Digite sua mensagem ou anexe documentos..."
              disabled={sending}
              className="flex-1"
            />

            <Button
              onClick={() => handleSendMessage()}
              disabled={sending || (!input.trim() && attachments.length === 0)}
              className="bg-blue-600 hover:bg-blue-700 flex-shrink-0"
            >
              {sending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>

          <p className="text-xs text-slate-500 mt-2 text-center">
            💡 Envie CNH, CRLV ou comprovantes para atualização automática
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
