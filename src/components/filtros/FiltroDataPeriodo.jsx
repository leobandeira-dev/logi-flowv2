import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function FiltroDataPeriodo({ 
  periodoSelecionado, 
  onPeriodoChange,
  dataInicio,
  dataFim,
  onDataInicioChange,
  onDataFimChange,
  isDark,
  tipoCampoData,
  onTipoCampoDataChange
}) {
  const getPeriodo = () => {
    const hoje = new Date();
    const primeiroDiaMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
    const ultimoDiaMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);
    const primeiroDiaAno = new Date(hoje.getFullYear(), 0, 1);
    const ultimoDiaAno = new Date(hoje.getFullYear(), 11, 31);

    switch (periodoSelecionado) {
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
      case "personalizado":
        return { inicio: dataInicio, fim: dataFim };
      default:
        return { inicio: "", fim: "" };
    }
  };

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
        <>
          <div className="w-32">
            <Label className="text-xs mb-1 block" style={{ color: theme.textMuted }}>Mês</Label>
            <Select
              value={dataInicio ? new Date(dataInicio).getMonth().toString() : ""}
              onValueChange={(mes) => {
                const ano = dataInicio ? new Date(dataInicio).getFullYear() : new Date().getFullYear();
                const primeiro = new Date(ano, parseInt(mes), 1);
                const ultimo = new Date(ano, parseInt(mes) + 1, 0);
                onDataInicioChange(primeiro.toISOString().split('T')[0]);
                onDataFimChange(ultimo.toISOString().split('T')[0]);
              }}
              className="h-8 text-sm"
            >
              <SelectTrigger 
                className="h-8 text-sm"
                style={{ 
                  backgroundColor: theme.inputBg, 
                  borderColor: theme.inputBorder, 
                  color: theme.text 
                }}
              >
                <SelectValue placeholder="Selecione o mês" />
              </SelectTrigger>
              <SelectContent style={{ backgroundColor: theme.inputBg, borderColor: theme.inputBorder }}>
                <SelectItem value="0" style={{ color: theme.text }}>Janeiro</SelectItem>
                <SelectItem value="1" style={{ color: theme.text }}>Fevereiro</SelectItem>
                <SelectItem value="2" style={{ color: theme.text }}>Março</SelectItem>
                <SelectItem value="3" style={{ color: theme.text }}>Abril</SelectItem>
                <SelectItem value="4" style={{ color: theme.text }}>Maio</SelectItem>
                <SelectItem value="5" style={{ color: theme.text }}>Junho</SelectItem>
                <SelectItem value="6" style={{ color: theme.text }}>Julho</SelectItem>
                <SelectItem value="7" style={{ color: theme.text }}>Agosto</SelectItem>
                <SelectItem value="8" style={{ color: theme.text }}>Setembro</SelectItem>
                <SelectItem value="9" style={{ color: theme.text }}>Outubro</SelectItem>
                <SelectItem value="10" style={{ color: theme.text }}>Novembro</SelectItem>
                <SelectItem value="11" style={{ color: theme.text }}>Dezembro</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="w-24">
            <Label className="text-xs mb-1 block" style={{ color: theme.textMuted }}>Ano</Label>
            <Select
              value={dataInicio ? new Date(dataInicio).getFullYear().toString() : new Date().getFullYear().toString()}
              onValueChange={(ano) => {
                const mes = dataInicio ? new Date(dataInicio).getMonth() : new Date().getMonth();
                const primeiro = new Date(parseInt(ano), mes, 1);
                const ultimo = new Date(parseInt(ano), mes + 1, 0);
                onDataInicioChange(primeiro.toISOString().split('T')[0]);
                onDataFimChange(ultimo.toISOString().split('T')[0]);
              }}
            >
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
                {[2025, 2024, 2023, 2022, 2021].map((ano) => (
                  <SelectItem key={ano} value={ano.toString()} style={{ color: theme.text }}>
                    {ano}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </>
      )}
    </div>
  );
}