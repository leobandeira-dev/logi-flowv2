import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";

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

export default function OcorrenciaNotaFiscalModal({ open, onClose, nota, onSuccess, isDark = false }) {
  const [loading, setLoading] = useState(false);
  const [tiposOcorrencia, setTiposOcorrencia] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [tipoSelecionado, setTipoSelecionado] = useState("");
  const [responsavelSelecionado, setResponsavelSelecionado] = useState("");
  const [gravidade, setGravidade] = useState("media");
  const [observacoes, setObservacoes] = useState("");

  useEffect(() => {
    if (open) {
      loadData();
    }
  }, [open]);

  const loadData = async () => {
    try {
      const [tiposData, usuariosData] = await Promise.all([
        base44.entities.TipoOcorrencia.filter({ categoria: "fluxo", ativo: true }),
        base44.functions.invoke('listarUsuariosEmpresa', {}).then(r => r.data || [])
      ]);
      
      setTiposOcorrencia(tiposData);
      setUsuarios(usuariosData);

      // Pré-selecionar tipo "Nota Fiscal" se existir
      const tipoNotaFiscal = tiposData.find(t => t.nome === "Nota Fiscal" || t.codigo === "NF-PROB");
      if (tipoNotaFiscal) {
        setTipoSelecionado(tipoNotaFiscal.id);
        setGravidade(tipoNotaFiscal.gravidade_padrao || "media");
      }
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    }
  };

  const handleSubmit = async () => {
    if (!observacoes.trim()) {
      toast.error("Descreva o problema com a nota fiscal");
      return;
    }

    setLoading(true);
    try {
      const currentUser = await base44.auth.me();
      const ticketNumber = generateTicketNumber();
      const tipoOcorrencia = tiposOcorrencia.find(t => t.id === tipoSelecionado);
      const responsavel = usuarios.find(u => u.id === responsavelSelecionado);

      const ocorrenciaData = {
        numero_ticket: ticketNumber,
        tipo_ocorrencia_id: tipoSelecionado || null,
        tipo: tipoOcorrencia?.nome || "Nota Fiscal",
        descricao_tipo: tipoOcorrencia?.descricao || null,
        categoria: "fluxo",
        observacoes: observacoes.trim(),
        gravidade: gravidade,
        status: "aberta",
        data_inicio: new Date().toISOString(),
        registrado_por: currentUser.id,
        responsavel_id: responsavelSelecionado || null
      };

      const novaOcorrencia = await base44.entities.Ocorrencia.create(ocorrenciaData);

      // Atualizar nota fiscal com ID e número da ocorrência
      await base44.entities.NotaFiscal.update(nota.id, {
        ocorrencia_id: novaOcorrencia.id,
        ocorrencia_numero_ticket: ticketNumber
      });

      // Enviar email ao responsável
      if (responsavel?.email) {
        try {
          const appUrl = window.location.origin;
          const linkOcorrencia = `${appUrl}/#/OcorrenciasGestao`;
          const dataPrazo = calcularPrazo(tipoOcorrencia);
          const prazoTexto = dataPrazo ? formatarDataHoraBR(dataPrazo) : 'Não definido';

          await base44.integrations.Core.SendEmail({
            to: responsavel.email,
            subject: `🔔 Nova Ocorrência #${ticketNumber} - Nota Fiscal ${nota.numero_nota}`,
            body: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .ticket-number { font-size: 32px; font-weight: bold; font-family: monospace; letter-spacing: 2px; margin-top: 10px; }
    .content { background: #ffffff; padding: 30px; border: 2px solid #e5e7eb; border-top: none; }
    .info-box { background: #f9fafb; padding: 15px; margin: 15px 0; border-left: 4px solid #8b5cf6; border-radius: 4px; }
    .info-label { font-weight: bold; color: #6b7280; font-size: 12px; text-transform: uppercase; margin-bottom: 5px; }
    .info-value { font-size: 16px; color: #111827; font-weight: 600; }
    .btn { display: inline-block; padding: 15px 30px; background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); color: white; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin: 0;">🔔 Nova Ocorrência - Nota Fiscal</h1>
      <div class="ticket-number">#${ticketNumber}</div>
    </div>
    
    <div class="content">
      <p style="font-size: 16px; margin-bottom: 20px;">
        Olá <strong>${responsavel.full_name}</strong>,
      </p>
      
      <p style="font-size: 16px;">
        Uma ocorrência foi aberta para a nota fiscal <strong>${nota.numero_nota}</strong>.
      </p>

      <div class="info-box">
        <div class="info-label">Nota Fiscal</div>
        <div class="info-value">Nº ${nota.numero_nota}${nota.serie_nota ? ` - Série ${nota.serie_nota}` : ''}</div>
      </div>

      <div class="info-box">
        <div class="info-label">Emitente</div>
        <div class="info-value">${nota.emitente_razao_social || '-'}</div>
      </div>

      <div class="info-box">
        <div class="info-label">Problema Relatado</div>
        <div style="margin-top: 8px; color: #374151; font-size: 15px; line-height: 1.6;">
          ${observacoes}
        </div>
      </div>

      ${dataPrazo ? `
      <div style="background: #fef3c7; border: 2px solid #fbbf24; padding: 20px; margin: 20px 0; border-radius: 8px; text-align: center;">
        <div class="info-label">⏰ PRAZO PARA RESOLUÇÃO</div>
        <div style="font-size: 24px; font-weight: bold; color: #92400e; margin: 10px 0;">${prazoTexto}</div>
      </div>
      ` : ''}

      <div style="text-align: center; margin: 30px 0;">
        <a href="${linkOcorrencia}" class="btn">
          📋 ACESSAR SISTEMA E TRATAR OCORRÊNCIA
        </a>
      </div>
    </div>
  </div>
</body>
</html>
            `
          });
        } catch (emailError) {
          console.error("Erro ao enviar email:", emailError);
        }
      }

      toast.success("Ocorrência registrada com sucesso!");
      onClose();
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Erro ao criar ocorrência:", error);
      toast.error("Erro ao registrar ocorrência");
    } finally {
      setLoading(false);
    }
  };

  const theme = {
    cardBg: isDark ? '#1e293b' : '#ffffff',
    cardBorder: isDark ? '#334155' : '#e5e7eb',
    text: isDark ? '#f1f5f9' : '#111827',
    textMuted: isDark ? '#94a3b8' : '#6b7280',
    inputBg: isDark ? '#1e293b' : '#ffffff',
    inputBorder: isDark ? '#334155' : '#d1d5db',
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl" style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}>
        <DialogHeader>
          <DialogTitle style={{ color: theme.text }}>
            Registrar Ocorrência - NF {nota?.numero_nota}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="p-3 rounded border" style={{ backgroundColor: isDark ? '#0f172a' : '#f9fafb', borderColor: theme.cardBorder }}>
            <p className="text-xs font-semibold mb-1" style={{ color: theme.textMuted }}>Nota Fiscal</p>
            <p className="text-sm font-bold" style={{ color: theme.text }}>
              {nota?.numero_nota} {nota?.serie_nota && `- Série ${nota.serie_nota}`}
            </p>
            <p className="text-xs mt-1" style={{ color: theme.textMuted }}>
              Emitente: {nota?.emitente_razao_social}
            </p>
          </div>

          <div>
            <Label className="text-sm mb-2" style={{ color: theme.text }}>Tipo de Problema</Label>
            <Select value={tipoSelecionado} onValueChange={setTipoSelecionado}>
              <SelectTrigger style={{ backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.text }}>
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}>
                {tiposOcorrencia.map(tipo => (
                  <SelectItem key={tipo.id} value={tipo.id} style={{ color: theme.text }}>
                    {tipo.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-sm mb-2" style={{ color: theme.text }}>Gravidade *</Label>
            <Select value={gravidade} onValueChange={setGravidade}>
              <SelectTrigger style={{ backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.text }}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}>
                <SelectItem value="baixa" style={{ color: theme.text }}>Baixa</SelectItem>
                <SelectItem value="media" style={{ color: theme.text }}>Média</SelectItem>
                <SelectItem value="alta" style={{ color: theme.text }}>Alta</SelectItem>
                <SelectItem value="critica" style={{ color: theme.text }}>Crítica</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-sm mb-2" style={{ color: theme.text }}>Responsável</Label>
            <Select value={responsavelSelecionado} onValueChange={setResponsavelSelecionado}>
              <SelectTrigger style={{ backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.text }}>
                <SelectValue placeholder="Atribuir a alguém (opcional)" />
              </SelectTrigger>
              <SelectContent style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}>
                <SelectItem value={null} style={{ color: theme.text }}>Nenhum</SelectItem>
                {usuarios.filter(u => u.tipo_perfil === "operador" || u.role === "admin").map(u => (
                  <SelectItem key={u.id} value={u.id} style={{ color: theme.text }}>
                    {u.full_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-sm mb-2" style={{ color: theme.text }}>Descrição do Problema *</Label>
            <Textarea
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              placeholder="Descreva detalhadamente o problema com esta nota fiscal..."
              className="min-h-[120px]"
              style={{ backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.text }}
            />
          </div>

          <div className="p-3 rounded border flex items-start gap-2" style={{ backgroundColor: isDark ? '#1e3a8a33' : '#dbeafe', borderColor: '#3b82f6' }}>
            <AlertCircle className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
            <p className="text-xs" style={{ color: isDark ? '#93c5fd' : '#1e40af' }}>
              Esta ocorrência será vinculada à nota fiscal e ficará visível nas listagens até ser resolvida.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={loading}
            style={{ borderColor: theme.cardBorder, color: theme.text }}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading || !observacoes.trim()}
            className="bg-purple-600 hover:bg-purple-700"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Registrando...
              </>
            ) : (
              "Registrar Ocorrência"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}