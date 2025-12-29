import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function FiltroPeriodo({ 
  periodoFiltro,
  onPeriodoChange,
  anoSelecionado,
  onAnoChange,
  mesSelecionado,
  onMesChange,
  dataInicioPersonalizada,
  onDataInicioPersonalizadaChange,
  dataFimPersonalizada,
  onDataFimPersonalizadaChange,
  isDark 
}) {
  const theme = {
    inputBg: isDark ? '#1e293b' : '#ffffff',
    inputBorder: isDark ? '#334155' : '#d1d5db',
    text: isDark ? '#f1f5f9' : '#111827',
    textMuted: isDark ? '#94a3b8' : '#6b7280'
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <select
        value={periodoFiltro}
        onChange={(e) => onPeriodoChange(e.target.value)}
        className="px-3 py-1.5 rounded-lg border text-sm font-medium"
        style={{ 
          backgroundColor: theme.inputBg, 
          borderColor: theme.inputBorder, 
          color: theme.text 
        }}
      >
        <option value="mes_atual">Mês Atual</option>
        <option value="ano_atual">Ano Atual</option>
        <option value="mes_especifico">Mês Específico</option>
        <option value="personalizado">Personalizado</option>
      </select>
      
      {periodoFiltro === "ano_atual" && (
        <select
          value={anoSelecionado}
          onChange={(e) => onAnoChange(parseInt(e.target.value))}
          className="px-3 py-1.5 rounded-lg border text-sm font-medium"
          style={{ backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.text }}
        >
          {[2025, 2024, 2023, 2022, 2021].map(ano => (
            <option key={ano} value={ano}>{ano}</option>
          ))}
        </select>
      )}
      
      {periodoFiltro === "mes_especifico" && (
        <>
          <select
            value={mesSelecionado}
            onChange={(e) => onMesChange(parseInt(e.target.value))}
            className="px-3 py-1.5 rounded-lg border text-sm font-medium"
            style={{ backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.text }}
          >
            {[
              { v: 1, n: 'Jan' }, { v: 2, n: 'Fev' }, { v: 3, n: 'Mar' },
              { v: 4, n: 'Abr' }, { v: 5, n: 'Mai' }, { v: 6, n: 'Jun' },
              { v: 7, n: 'Jul' }, { v: 8, n: 'Ago' }, { v: 9, n: 'Set' },
              { v: 10, n: 'Out' }, { v: 11, n: 'Nov' }, { v: 12, n: 'Dez' }
            ].map(mes => (
              <option key={mes.v} value={mes.v}>{mes.n}</option>
            ))}
          </select>
          <select
            value={anoSelecionado}
            onChange={(e) => onAnoChange(parseInt(e.target.value))}
            className="px-3 py-1.5 rounded-lg border text-sm font-medium"
            style={{ backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.text }}
          >
            {[2025, 2024, 2023, 2022, 2021].map(ano => (
              <option key={ano} value={ano}>{ano}</option>
            ))}
          </select>
        </>
      )}
      
      {periodoFiltro === "personalizado" && (
        <>
          <Input
            type="date"
            value={dataInicioPersonalizada}
            onChange={(e) => onDataInicioPersonalizadaChange(e.target.value)}
            className="w-36 text-sm h-8"
            style={{ backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.text }}
          />
          <span className="text-sm" style={{ color: theme.textMuted }}>até</span>
          <Input
            type="date"
            value={dataFimPersonalizada}
            onChange={(e) => onDataFimPersonalizadaChange(e.target.value)}
            className="w-36 text-sm h-8"
            style={{ backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.text }}
          />
        </>
      )}
    </div>
  );
}