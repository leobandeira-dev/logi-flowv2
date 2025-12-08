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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { base44 } from "@/api/base44Client";
import { AlertCircle, Loader2, Upload, X, Ticket, User, Mail, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

// Função para gerar número de ticket - ATUALIZADA COM SEGUNDOS
const generateTicketNumber = () => {
  const now = new Date();
  const year = now.getFullYear().toString().slice(-2);
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  const day = now.getDate().toString().padStart(2, '0');
  const hour = now.getHours().toString().padStart(2, '0');
  const minute = now.getMinutes().toString().padStart(2, '0');
  const second = now.getSeconds().toString().padStart(2, '0');
  
  return `${year}${month}${day}${hour}${minute}${second}`;
};

// Função para calcular data de prazo
const calcularPrazo = (tipoOcorrencia) => {
  if (!tipoOcorrencia) return null;
  
  let prazoMinutos = null;
  if (tipoOcorrencia.prazo_sla_minutos !== undefined && tipoOcorrencia.prazo_sla_minutos !== null) {
    prazoMinutos = tipoOcorrencia.prazo_sla_minutos;
  } else if (tipoOcorrencia.prazo_sla_horas !== undefined && tipoOcorrencia.prazo_sla_horas !== null) {
    prazoMinutos = tipoOcorrencia.prazo_sla_horas * 60;
  }

  if (prazoMinutos === null || prazoMinutos === 0) return null;

  const dataInicio = new Date();
  const dataPrazo = new Date(dataInicio.getTime() + prazoMinutos * 60000);
  
  return dataPrazo;
};

// Função para formatar data e hora brasileira
const formatarDataHoraBR = (data) => {
  if (!data) return '';
  const opcoes = {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'America/Sao_Paulo'
  };
  return new Intl.DateTimeFormat('pt-BR', opcoes).format(data);
};

export default function OcorrenciaFluxoModal({ 
  open, 
  onClose, 
  ordem, 
  etapa, 
  ordemEtapa,
  onSuccess 
}) {
  const [formData, setFormData] = useState({
    tipo_ocorrencia_id: "",
    observacoes: "",
    gravidade: "media",
    responsavel_id: "",
    imagem_url: ""
  });

  const [tiposOcorrencia, setTiposOcorrencia] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [imagemPreview, setImagemPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [isDark, setIsDark] = useState(false);
  const [ticketNumber, setTicketNumber] = useState("");
  const [tipoSelecionado, setTipoSelecionado] = useState(null);
  const [emailEnviado, setEmailEnviado] = useState(false);
  const [erroEmail, setErroEmail] = useState(null);

  // Detectar dark mode
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
    if (open) {
      loadData();
      // Gerar número do ticket ao abrir o modal
      const ticket = generateTicketNumber();
      setTicketNumber(ticket);
      // Resetar estados
      setTipoSelecionado(null); 
      setEmailEnviado(false);
      setErroEmail(null);
      setFormData({
        tipo_ocorrencia_id: "",
        observacoes: "",
        gravidade: "media",
        responsavel_id: "",
        imagem_url: ""
      });
    }
  }, [open]);

  const loadData = async () => {
    try {
      const [tiposData, userData] = await Promise.all([
        base44.entities.TipoOcorrencia.list(),
        base44.auth.me()
      ]);

      // Carregar usuários via função backend
      let usuariosData = [];
      try {
        const response = await base44.functions.invoke('listarUsuariosEmpresa', {});
        usuariosData = response.data || [];
      } catch (error) {
        console.log("Não foi possível carregar lista de usuários:", error);
      }

      setTiposOcorrencia(tiposData.filter(t => t.ativo && t.categoria === "fluxo"));
      setUsuarios(usuariosData);
      setCurrentUser(userData);

      // Definir o usuário atual como responsável padrão
      setFormData(prev => ({
        ...prev,
        responsavel_id: userData.id
      }));
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    }
  };

  const handleImagemChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagemPreview(reader.result);
    };
    reader.readAsDataURL(file);

    // Upload
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setFormData(prev => ({ ...prev, imagem_url: file_url }));
    } catch (error) {
      console.error("Erro ao fazer upload:", error);
      alert("Erro ao carregar imagem");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.tipo_ocorrencia_id) {
      alert("Selecione o tipo de ocorrência");
      return;
    }

    if (!formData.observacoes) {
      alert("Descreva o problema");
      return;
    }

    if (!formData.responsavel_id) {
      alert("Selecione o responsável");
      return;
    }

    setSaving(true);
    setEmailEnviado(false);
    setErroEmail(null);

    try {
      const tipoOcorrencia = tiposOcorrencia.find(t => t.id === formData.tipo_ocorrencia_id);
      const responsavel = usuarios.find(u => u.id === formData.responsavel_id);
      const dataPrazo = calcularPrazo(tipoOcorrencia);

      console.log("🔔 CRIANDO OCORRÊNCIA NO FLUXO");
      console.log("Ticket:", ticketNumber);
      console.log("Tipo:", tipoOcorrencia?.nome);
      console.log("Responsável:", responsavel?.full_name, responsavel?.email);
      console.log("Ordem:", ordem.numero_carga, ordem.cliente);
      console.log("Etapa:", etapa.nome);

      // Criar a ocorrência com o número do ticket
      const novaOcorrencia = await base44.entities.Ocorrencia.create({
        numero_ticket: ticketNumber,
        ordem_id: ordem.id,
        ordem_etapa_id: ordemEtapa?.id,
        categoria: "fluxo",
        tipo: tipoOcorrencia?.nome || "Problema no fluxo",
        tipo_ocorrencia_id: formData.tipo_ocorrencia_id,
        observacoes: formData.observacoes,
        gravidade: formData.gravidade,
        responsavel_id: formData.responsavel_id,
        registrado_por: currentUser?.id,
        data_inicio: new Date().toISOString(),
        status: "aberta",
        imagem_url: formData.imagem_url || null
      });

      console.log("✅ Ocorrência criada com sucesso:", novaOcorrencia.id);

      // Bloquear a etapa
      if (ordemEtapa) {
        await base44.entities.OrdemEtapa.update(ordemEtapa.id, {
          status: "bloqueada"
        });
        console.log("🔒 Etapa bloqueada:", ordemEtapa.id);
      }

      // ENVIAR EMAIL PARA O RESPONSÁVEL
      if (responsavel && responsavel.email) {
        console.log("📧 Iniciando envio de email para:", responsavel.email);
        
        try {
          // Gerar link da ocorrência
          const appUrl = window.location.origin;
          const linkOcorrencia = `${appUrl}/#/OcorrenciasGestao`;

          // Montar corpo do email
          const prazoTexto = dataPrazo 
            ? formatarDataHoraBR(dataPrazo)
            : 'Não definido';

          const assuntoEmail = `🔔 Ocorrência #${ticketNumber} - ${tipoOcorrencia?.nome || 'Problema no Fluxo'} - Ordem ${ordem.numero_carga || '#' + ordem.id.slice(-6)}`;

          const corpoEmail = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .ticket-number { font-size: 32px; font-weight: bold; font-family: monospace; letter-spacing: 2px; margin-top: 10px; }
    .fluxo-badge { background: #a855f7; color: white; padding: 8px 16px; border-radius: 20px; font-weight: bold; font-size: 14px; display: inline-block; margin-top: 10px; }
    .content { background: #ffffff; padding: 30px; border: 2px solid #e5e7eb; border-top: none; }
    .info-box { background: #f9fafb; padding: 15px; margin: 15px 0; border-left: 4px solid #f59e0b; border-radius: 4px; }
    .info-label { font-weight: bold; color: #6b7280; font-size: 12px; text-transform: uppercase; margin-bottom: 5px; }
    .info-value { font-size: 16px; color: #111827; font-weight: 600; }
    .gravidade { display: inline-block; padding: 8px 16px; border-radius: 6px; font-weight: bold; font-size: 14px; text-transform: uppercase; }
    .gravidade-baixa { background: #dbeafe; color: #1e40af; }
    .gravidade-media { background: #fef3c7; color: #92400e; }
    .gravidade-alta { background: #fed7aa; color: #9a3412; }
    .gravidade-critica { background: #fee2e2; color: #991b1b; }
    .prazo-box { background: #fef3c7; border: 2px solid #fbbf24; padding: 20px; margin: 20px 0; border-radius: 8px; text-align: center; }
    .prazo-value { font-size: 24px; font-weight: bold; color: #92400e; margin: 10px 0; }
    .btn { display: inline-block; padding: 15px 30px; background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
    .btn:hover { background: linear-gradient(135deg, #d97706 0%, #b45309 100%); }
    .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 12px; border-top: 2px solid #e5e7eb; margin-top: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin: 0;">🔔 Nova Ocorrência Atribuída</h1>
      <div class="ticket-number">#${ticketNumber}</div>
      <div class="fluxo-badge">⚙️ FLUXO OPERACIONAL</div>
    </div>
    
    <div class="content">
      <p style="font-size: 16px; margin-bottom: 20px;">
        Olá <strong>${responsavel.full_name}</strong>,
      </p>
      
      <p style="font-size: 16px;">
        Você foi designado como responsável pela resolução de uma ocorrência no fluxo operacional.
      </p>

      <div class="info-box">
        <div class="info-label">Tipo de Ocorrência</div>
        <div class="info-value">${tipoOcorrencia?.nome || 'Problema no fluxo'}</div>
      </div>

      <div class="info-box">
        <div class="info-label">Ordem</div>
        <div class="info-value">${ordem.numero_carga || `#${ordem.id.slice(-6)}`}</div>
        <p style="margin: 5px 0 0 0; color: #6b7280; font-size: 14px;">${ordem.cliente || ''}</p>
      </div>

      <div class="info-box">
        <div class="info-label">Etapa do Fluxo</div>
        <div class="info-value">${etapa.nome}</div>
      </div>

      <div class="info-box">
        <div class="info-label">Descrição do Problema</div>
        <div style="margin-top: 8px; color: #374151; font-size: 15px; line-height: 1.6;">
          ${formData.observacoes}
        </div>
      </div>

      <div class="info-box">
        <div class="info-label">Gravidade</div>
        <div style="margin-top: 8px;">
          <span class="gravidade gravidade-${formData.gravidade}">
            ${formData.gravidade.charAt(0).toUpperCase() + formData.gravidade.slice(1)}
          </span>
        </div>
      </div>

      ${dataPrazo ? `
      <div class="prazo-box">
        <div class="info-label">⏰ PRAZO PARA RESOLUÇÃO</div>
        <div class="prazo-value">${prazoTexto}</div>
        <p style="margin: 5px 0 0 0; color: #92400e; font-size: 14px;">
          ${tipoOcorrencia?.prazo_sla_minutos 
            ? `SLA: ${tipoOcorrencia.prazo_sla_minutos} minutos (${(tipoOcorrencia.prazo_sla_minutos / 60).toFixed(1)}h)`
            : tipoOcorrencia?.prazo_sla_horas 
              ? `SLA: ${tipoOcorrencia.prazo_sla_horas} horas`
              : ''
          }
        </p>
      </div>
      ` : ''}

      <div style="text-align: center; margin: 30px 0;">
        <a href="${linkOcorrencia}" class="btn">
          📋 ACESSAR SISTEMA E TRATAR OCORRÊNCIA
        </a>
      </div>

      <div style="background: #eff6ff; padding: 15px; border-radius: 8px; margin-top: 20px; border: 2px solid #3b82f6;">
        <p style="margin: 0; font-size: 14px; color: #1e40af;">
          <strong>⚠️ Atenção:</strong> A etapa "${etapa.nome}" foi bloqueada e permanecerá assim até a resolução desta ocorrência.
        </p>
      </div>
    </div>

    <div class="footer">
      <p style="margin: 5px 0;">
        <strong>Sistema de Gestão Logística</strong>
      </p>
      <p style="margin: 5px 0;">
        Este é um e-mail automático. Por favor, não responda.
      </p>
      <p style="margin: 5px 0;">
        Ticket: <strong>#${ticketNumber}</strong> | Origem: <strong>Fluxo Operacional</strong>
      </p>
    </div>
  </div>
</body>
</html>
          `;

          console.log("📤 Enviando email...");
          console.log("Para:", responsavel.email);
          console.log("Assunto:", assuntoEmail);

          const resultadoEmail = await base44.integrations.Core.SendEmail({
            to: responsavel.email,
            subject: assuntoEmail,
            body: corpoEmail
          });

          console.log("✅ EMAIL ENVIADO COM SUCESSO para", responsavel.email);
          console.log("Resultado do envio:", resultadoEmail);
          setEmailEnviado(true);
          
        } catch (emailError) {
          console.error("❌ ERRO AO ENVIAR EMAIL:", emailError);
          console.error("Detalhes do erro:", emailError.message);
          console.error("Stack:", emailError.stack);
          setErroEmail(`Erro ao enviar email: ${emailError.message}`);
          
          // Mostrar alerta mas não bloquear o fluxo
          alert(`⚠️ Ocorrência criada, mas houve erro ao enviar email:\n${emailError.message}\n\nVerifique o console para mais detalhes.`);
        }
      } else {
        console.log("⚠️ Responsável sem email cadastrado");
        setErroEmail("Responsável não possui email cadastrado");
      }

      onSuccess();
      
      // Aguardar 2 segundos para mostrar status do email antes de fechar
      setTimeout(() => {
        onClose();
      }, 2000);

    } catch (error) {
      console.error("❌ ERRO AO REGISTRAR OCORRÊNCIA:", error);
      console.error("Detalhes:", error.message);
      console.error("Stack:", error.stack);
      alert(`Erro ao registrar ocorrência: ${error.message}\n\nTente novamente.`);
    } finally {
      setSaving(false);
    }
  };

  const getUsuario = (userId) => {
    return usuarios.find(u => u.id === userId);
  };

  const responsavel = getUsuario(formData.responsavel_id);
  const registrador = getUsuario(currentUser?.id);

  const theme = {
    bg: isDark ? '#1e293b' : '#ffffff',
    border: isDark ? '#334155' : '#e5e7eb',
    text: isDark ? '#f1f5f9' : '#111827',
    textMuted: isDark ? '#94a3b8' : '#6b7280',
  };

  // Função para obter cor da gravidade
  const getGravidadeBadgeColor = (gravidade) => {
    const colors = {
      baixa: 'bg-blue-100 text-blue-800 border-blue-300',
      media: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      alta: 'bg-orange-100 text-orange-800 border-orange-300',
      critica: 'bg-red-100 text-red-800 border-red-300'
    };
    return colors[gravidade] || colors.media;
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto" style={{ backgroundColor: theme.bg, borderColor: theme.border }}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2" style={{ color: theme.text }}>
            <AlertCircle className="w-5 h-5 text-orange-600" />
            Registrar Ocorrência no Fluxo
          </DialogTitle>
        </DialogHeader>

        {/* Status de Salvamento e Email */}
        {saving && (
          <div className="p-4 rounded-lg border-2 mb-4" style={{ 
            borderColor: isDark ? '#3b82f6' : '#60a5fa',
            backgroundColor: isDark ? '#1e3a8a' : '#dbeafe'
          }}>
            <div className="flex items-center gap-3">
              <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
              <div>
                <p className="font-bold text-sm text-blue-900 dark:text-blue-100">
                  Processando...
                </p>
                <p className="text-xs text-blue-700 dark:text-blue-300">
                  Criando ocorrência e enviando notificação por email
                </p>
              </div>
            </div>
          </div>
        )}

        {emailEnviado && (
          <div className="p-4 rounded-lg border-2 mb-4" style={{ 
            borderColor: isDark ? '#10b981' : '#34d399',
            backgroundColor: isDark ? '#064e3b' : '#d1fae5'
          }}>
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              <div>
                <p className="font-bold text-sm text-green-900 dark:text-green-100">
                  ✅ Email enviado com sucesso!
                </p>
                <p className="text-xs text-green-700 dark:text-green-300">
                  Notificação enviada para {responsavel?.email}
                </p>
              </div>
            </div>
          </div>
        )}

        {erroEmail && (
          <div className="p-4 rounded-lg border-2 mb-4" style={{ 
            borderColor: isDark ? '#ef4444' : '#f87171',
            backgroundColor: isDark ? '#7f1d1d' : '#fee2e2'
          }}>
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <div>
                <p className="font-bold text-sm text-red-900 dark:text-red-100">
                  ⚠️ Problema no envio do email
                </p>
                <p className="text-xs text-red-700 dark:text-red-300">
                  {erroEmail}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Informações do Ticket e Usuários */}
        <div className="grid grid-cols-2 gap-4 p-4 rounded-lg border-2 mb-4" style={{ borderColor: theme.border, backgroundColor: isDark ? '#0f172a' : '#f9fafb' }}>
          <div>
            <Label className="text-xs font-semibold mb-2 block" style={{ color: theme.textMuted }}>Número do Ticket</Label>
            <div className="flex items-center gap-2">
              <Ticket className="w-5 h-5 text-orange-600" />
              <span className="text-lg font-mono font-bold text-orange-600">
                {ticketNumber}
              </span>
            </div>
          </div>

          <div>
            <Label className="text-xs font-semibold mb-2 block" style={{ color: theme.textMuted }}>Registrado por</Label>
            {registrador && (
              <div className="flex items-center gap-2">
                <div 
                  className="w-8 h-8 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0 border-2"
                  style={{
                    backgroundColor: registrador.foto_url ? 'transparent' : (isDark ? '#1e3a8a' : '#dbeafe'),
                    borderColor: isDark ? '#3b82f6' : '#93c5fd'
                  }}
                >
                  {registrador.foto_url ? (
                    <img 
                      src={registrador.foto_url} 
                      alt={registrador.full_name} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-4 h-4" style={{ color: isDark ? '#60a5fa' : '#1d4ed8' }} />
                  )}
                </div>
                <span className="font-semibold" style={{ color: theme.text }}>
                  {registrador.full_name}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="p-3 rounded-lg border" style={{ borderColor: theme.border, backgroundColor: isDark ? '#0f172a' : '#f9fafb' }}>
            <p className="text-sm font-semibold mb-1" style={{ color: theme.text }}>
              Ordem: {ordem.numero_carga || `#${ordem.id.slice(-6)}`}
            </p>
            <p className="text-sm" style={{ color: theme.textMuted }}>
              Etapa: {etapa.nome}
            </p>
          </div>

          <div>
            <Label className="font-bold" style={{ color: theme.text }}>Tipo de Ocorrência *</Label>
            <Select
              value={formData.tipo_ocorrencia_id}
              onValueChange={(value) => {
                const tipo = tiposOcorrencia.find(t => t.id === value);
                setTipoSelecionado(tipo);
                setFormData({
                  ...formData,
                  tipo_ocorrencia_id: value,
                  gravidade: tipo?.gravidade_padrao || "media"
                });
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo de ocorrência" />
              </SelectTrigger>
              <SelectContent>
                {tiposOcorrencia.map((tipo) => (
                  <SelectItem key={tipo.id} value={tipo.id}>
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: tipo.cor }}
                      />
                      {tipo.nome}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Informações do tipo selecionado */}
            {tipoSelecionado && (
              <div className="mt-2 p-3 rounded-lg border-2" style={{ 
                borderColor: tipoSelecionado.cor || theme.border,
                backgroundColor: isDark ? '#0f172a' : '#f9fafb'
              }}>
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline" className={`text-xs border ${getGravidadeBadgeColor(tipoSelecionado.gravidade_padrao)}`}>
                    Gravidade: {tipoSelecionado.gravidade_padrao.charAt(0).toUpperCase() + tipoSelecionado.gravidade_padrao.slice(1)}
                  </Badge>
                  {(tipoSelecionado.prazo_sla_minutos || tipoSelecionado.prazo_sla_horas) && (
                    <Badge variant="outline" className="text-xs">
                      SLA: {tipoSelecionado.prazo_sla_minutos ? `${tipoSelecionado.prazo_sla_minutos}min` : `${tipoSelecionado.prazo_sla_horas}h`}
                    </Badge>
                  )}
                </div>
                {tipoSelecionado.descricao && (
                  <p className="text-xs" style={{ color: theme.textMuted }}>
                    {tipoSelecionado.descricao}
                  </p>
                )}
              </div>
            )}
          </div>

          <div>
            <Label className="font-bold" style={{ color: theme.text }}>Descrição do Problema *</Label>
            <Textarea
              value={formData.observacoes}
              onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
              placeholder="Descreva detalhadamente o que ocorreu..."
              rows={4}
              className="border-2"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="font-bold mb-2 flex items-center gap-2" style={{ color: theme.text }}>
                Gravidade
                <Badge variant="outline" className="text-[10px]" style={{ color: theme.textMuted }}>
                  Definida automaticamente
                </Badge>
              </Label>
              <div className="p-3 rounded-lg border-2" style={{ 
                borderColor: theme.border,
                backgroundColor: isDark ? '#0f172a' : '#f3f4f6'
              }}>
                <Badge className={`text-sm font-bold ${getGravidadeBadgeColor(formData.gravidade)}`}>
                  {formData.gravidade.charAt(0).toUpperCase() + formData.gravidade.slice(1)}
                </Badge>
                <p className="text-xs mt-2" style={{ color: theme.textMuted }}>
                  Baseada no tipo de ocorrência selecionado
                </p>
              </div>
            </div>

            <div>
              <Label className="font-bold flex items-center gap-2" style={{ color: theme.text }}>
                Responsável pela Resolução *
                <Mail className="w-4 h-4 text-blue-600" title="Receberá notificação por email" />
              </Label>
              <Select
                value={formData.responsavel_id}
                onValueChange={(value) => setFormData({ ...formData, responsavel_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o responsável" />
                </SelectTrigger>
                <SelectContent>
                  {usuarios.map((usuario) => (
                    <SelectItem key={usuario.id} value={usuario.id}>
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-6 h-6 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0 border"
                          style={{
                            backgroundColor: usuario.foto_url ? 'transparent' : (isDark ? '#1e3a8a' : '#dbeafe'),
                            borderColor: isDark ? '#3b82f6' : '#93c5fd'
                          }}
                        >
                          {usuario.foto_url ? (
                            <img 
                              src={usuario.foto_url} 
                              alt={usuario.full_name} 
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <User className="w-3 h-3" style={{ color: isDark ? '#60a5fa' : '#1d4ed8' }} />
                          )}
                        </div>
                        {usuario.full_name}
                        {usuario.email && (
                          <Mail className="w-3 h-3 text-gray-400 ml-auto" />
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {responsavel && (
                <div className="flex items-center gap-2 mt-2 p-2 rounded border" style={{ borderColor: theme.border }}>
                  <div 
                    className="w-8 h-8 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0 border-2"
                    style={{
                      backgroundColor: responsavel.foto_url ? 'transparent' : (isDark ? '#1e3a8a' : '#dbeafe'),
                      borderColor: isDark ? '#3b82f6' : '#93c5fd'
                    }}
                  >
                    {responsavel.foto_url ? (
                      <img 
                        src={responsavel.foto_url} 
                        alt={responsavel.full_name} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-4 h-4" style={{ color: isDark ? '#60a5fa' : '#1d4ed8' }} />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold" style={{ color: theme.text }}>
                      {responsavel.full_name}
                    </p>
                    {responsavel.email ? (
                      <p className="text-xs flex items-center gap-1" style={{ color: theme.textMuted }}>
                        <Mail className="w-3 h-3" />
                        {responsavel.email}
                      </p>
                    ) : (
                      <p className="text-xs text-red-600">
                        ⚠️ Sem email cadastrado
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div>
            <Label className="font-bold mb-2 block" style={{ color: theme.text }}>Anexar Imagem (opcional)</Label>
            {imagemPreview ? (
              <div className="relative">
                <img 
                  src={imagemPreview} 
                  alt="Preview" 
                  className="w-full h-48 object-cover rounded-lg border-2"
                  style={{ borderColor: theme.border }}
                />
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2"
                  onClick={() => {
                    setImagemPreview(null);
                    setFormData({ ...formData, imagem_url: "" });
                  }}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition-colors"
                style={{ 
                  borderColor: theme.border,
                  backgroundColor: isDark ? '#0f172a' : '#f9fafb'
                }}
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  {uploading ? (
                    <Loader2 className="w-8 h-8 animate-spin" style={{ color: theme.textMuted }} />
                  ) : (
                    <>
                      <Upload className="w-8 h-8 mb-2" style={{ color: theme.textMuted }} />
                      <p className="text-sm" style={{ color: theme.textMuted }}>
                        Clique para selecionar uma imagem
                      </p>
                    </>
                  )}
                </div>
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleImagemChange}
                  disabled={uploading}
                />
              </label>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={saving}
            className="border-2"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={saving || uploading}
            className="bg-orange-600 hover:bg-orange-700 font-bold"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Registrando...
              </>
            ) : (
              <>
                <AlertCircle className="w-4 h-4 mr-2" />
                Registrar e Bloquear Etapa
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}