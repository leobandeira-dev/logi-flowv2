import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

export default function FiltroDataSimples({ 
  tipoCampoData,
  onTipoCampoDataChange,
  periodoSelecionado,
  onPeriodoChange,
  anoSelecionado,
  onAnoChange,
  mesSelecionado,
  onMesChange,
  isDark
}) {
  const theme = {
    inputBg: isDark ? '#1e293b' : '#ffffff',
    inputBorder: isDark ? '#334155' : '#d1d5db',
    text: isDark ? '#f1f5f9' : '#111827',
    textMuted: isDark ? '#94a3b8' : '#6b7280'
  };

  return (
    <div className="flex items-end gap-2">
      <div className="w-44">
        <Label className="text-xs mb-1 block" style={{ color: theme.textMuted }}>Tipo de Data</Label>
        <Select value={tipoCampoData || "criacao"} onValueChange={onTipoCampoDataChange}>
          <SelectTrigger 
            className="h-8 text-sm"
            style={{ 
              backgroundColor: theme.inputBg, 
              borderColor: theme.inputBorder, 
              color: theme.text 
            }}
          >
            <SelectValue placeholder="Selecione" />
          </SelectTrigger>
          <SelectContent style={{ backgroundColor: theme.inputBg, borderColor: theme.inputBorder }}>
            <SelectItem value="criacao" style={{ color: theme.text }}>Data de Criação</SelectItem>
            <SelectItem value="agenda_carga" style={{ color: theme.text }}>Agenda Carregamento</SelectItem>
            <SelectItem value="agenda_descarga" style={{ color: theme.text }}>Agenda Descarga</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="w-36">
        <Label className="text-xs mb-1 block" style={{ color: theme.textMuted }}>Período</Label>
        <Select value={periodoSelecionado} onValueChange={onPeriodoChange}>
          <SelectTrigger 
            className="h-8 text-sm"
            style={{ 
              backgroundColor: theme.inputBg, 
              borderColor: theme.inputBorder, 
              color: theme.text 
            }}
          >
            <SelectValue placeholder="Selecione" />
          </SelectTrigger>
          <SelectContent style={{ backgroundColor: theme.inputBg, borderColor: theme.inputBorder }}>
            <SelectItem value="mes_atual" style={{ color: theme.text }}>Mês Atual</SelectItem>
            <SelectItem value="ano_atual" style={{ color: theme.text }}>Ano Atual</SelectItem>
            <SelectItem value="mes_especifico" style={{ color: theme.text }}>Mês Específico</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {periodoSelecionado === "ano_atual" && (
        <div className="w-24">
          <Label className="text-xs mb-1 block" style={{ color: theme.textMuted }}>Ano</Label>
          <Select value={String(anoSelecionado)} onValueChange={(v) => onAnoChange(parseInt(v))}>
            <SelectTrigger 
              className="h-8 text-sm"
              style={{ 
                backgroundColor: theme.inputBg, 
                borderColor: theme.inputBorder, 
                color: theme.text 
              }}
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent style={{ backgroundColor: theme.inputBg, borderColor: theme.inputBorder }}>
              {[2025, 2024, 2023, 2022, 2021].map(ano => (
                <SelectItem key={ano} value={String(ano)} style={{ color: theme.text }}>{ano}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {periodoSelecionado === "mes_especifico" && (
        <>
          <div className="w-24">
            <Label className="text-xs mb-1 block" style={{ color: theme.textMuted }}>Mês</Label>
            <Select value={String(mesSelecionado)} onValueChange={(v) => onMesChange(parseInt(v))}>
              <SelectTrigger 
                className="h-8 text-sm"
                style={{ 
                  backgroundColor: theme.inputBg, 
                  borderColor: theme.inputBorder, 
                  color: theme.text 
                }}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent style={{ backgroundColor: theme.inputBg, borderColor: theme.inputBorder }}>
                {[
                  { v: 1, n: 'Jan' }, { v: 2, n: 'Fev' }, { v: 3, n: 'Mar' },
                  { v: 4, n: 'Abr' }, { v: 5, n: 'Mai' }, { v: 6, n: 'Jun' },
                  { v: 7, n: 'Jul' }, { v: 8, n: 'Ago' }, { v: 9, n: 'Set' },
                  { v: 10, n: 'Out' }, { v: 11, n: 'Nov' }, { v: 12, n: 'Dez' }
                ].map(mes => (
                  <SelectItem key={mes.v} value={String(mes.v)} style={{ color: theme.text }}>
                    {mes.n}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="w-24">
            <Label className="text-xs mb-1 block" style={{ color: theme.textMuted }}>Ano</Label>
            <Select value={String(anoSelecionado)} onValueChange={(v) => onAnoChange(parseInt(v))}>
              <SelectTrigger 
                className="h-8 text-sm"
                style={{ 
                  backgroundColor: theme.inputBg, 
                  borderColor: theme.inputBorder, 
                  color: theme.text 
                }}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent style={{ backgroundColor: theme.inputBg, borderColor: theme.inputBorder }}>
                {[2025, 2024, 2023, 2022, 2021].map(ano => (
                  <SelectItem key={ano} value={String(ano)} style={{ color: theme.text }}>{ano}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </>
      )}
    </div>
  );
}