import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function FiltroDataOcorrencias({ 
  periodoSelecionado, 
  onPeriodoChange,
  dataInicio,
  dataFim,
  onDataInicioChange,
  onDataFimChange,
  isDark
}) {
  const handlePeriodoChange = (valor) => {
    onPeriodoChange(valor);
    
    if (valor !== "personalizado") {
      const periodo = getPeriodoParaValor(valor);
      onDataInicioChange(periodo.inicio);
      onDataFimChange(periodo.fim);
    }
  };

  const getPeriodoParaValor = (valor) => {
    const hoje = new Date();
    const primeiroDiaMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
    const ultimoDiaMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);
    const primeiroDiaAno = new Date(hoje.getFullYear(), 0, 1);
    const ultimoDiaAno = new Date(hoje.getFullYear(), 11, 31);

    switch (valor) {
      case "mes_atual":
        return {
          inicio: primeiroDiaMes.toISOString().split('T')[0],
          fim: ultimoDiaMes.toISOString().split('T')[0]
        };
      case "ano_atual":
        return {
          inicio: primeiroDiaAno.toISOString().split('T')[0],
          fim: ultimoDiaAno.toISOString().split('T')[0]
        };
      default:
        return { inicio: "", fim: "" };
    }
  };

  const theme = {
    inputBg: isDark ? '#1e293b' : '#ffffff',
    inputBorder: isDark ? '#334155' : '#d1d5db',
    text: isDark ? '#f1f5f9' : '#111827',
    textMuted: isDark ? '#94a3b8' : '#6b7280'
  };

  return (
    <div className="flex items-end gap-2">
      <div className="w-36">
        <Label className="text-xs mb-1 block" style={{ color: theme.textMuted }}>Período</Label>
        <Select value={periodoSelecionado} onValueChange={handlePeriodoChange}>
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
            <SelectItem value="personalizado" style={{ color: theme.text }}>Personalizado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {periodoSelecionado === "personalizado" && (
        <>
          <div className="w-36">
            <Label className="text-xs mb-1 block" style={{ color: theme.textMuted }}>Data Início</Label>
            <Input
              type="date"
              value={dataInicio}
              onChange={(e) => onDataInicioChange(e.target.value)}
              className="h-8 text-sm"
              style={{ backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.text }}
            />
          </div>
          <div className="w-36">
            <Label className="text-xs mb-1 block" style={{ color: theme.textMuted }}>Data Fim</Label>
            <Input
              type="date"
              value={dataFim}
              onChange={(e) => onDataFimChange(e.target.value)}
              className="h-8 text-sm"
              style={{ backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.text }}
            />
          </div>
        </>
      )}

      {periodoSelecionado === "mes_especifico" && (
        <div className="w-40">
          <Label className="text-xs mb-1 block" style={{ color: theme.textMuted }}>Selecione o Mês</Label>
          <Input
            type="month"
            value={dataInicio ? dataInicio.slice(0, 7) : ""}
            onChange={(e) => {
              const anoMes = e.target.value;
              if (anoMes) {
                const [ano, mes] = anoMes.split('-');
                const primeiro = new Date(parseInt(ano), parseInt(mes) - 1, 1);
                const ultimo = new Date(parseInt(ano), parseInt(mes), 0);
                onDataInicioChange(primeiro.toISOString().split('T')[0]);
                onDataFimChange(ultimo.toISOString().split('T')[0]);
              }
            }}
            className="h-8 text-sm"
            style={{ backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.text }}
          />
        </div>
      )}
    </div>
  );
}