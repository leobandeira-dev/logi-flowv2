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
  const [mesSelecionado, setMesSelecionado] = React.useState("");
  const [anoSelecionado, setAnoSelecionado] = React.useState("");

  // Sincronizar com dataInicio quando o período muda
  React.useEffect(() => {
    if (periodoSelecionado === "mes_especifico" && dataInicio) {
      const data = new Date(dataInicio);
      setMesSelecionado(data.getMonth().toString());
      setAnoSelecionado(data.getFullYear().toString());
    }
  }, [periodoSelecionado, dataInicio]);

  const handlePeriodoChange = (valor) => {
    console.log('📅 FiltroDataOcorrencias - Período alterado:', valor);
    onPeriodoChange(valor);
    
    if (valor === "mes_atual" || valor === "ano_atual") {
      const periodo = getPeriodoParaValor(valor);
      console.log('📅 Aplicando período:', periodo);
      onDataInicioChange(periodo.inicio);
      onDataFimChange(periodo.fim);
    } else if (valor === "mes_especifico") {
      // Inicializar com mês atual
      const hoje = new Date();
      const mes = hoje.getMonth();
      const ano = hoje.getFullYear();
      const primeiro = new Date(ano, mes, 1);
      const ultimo = new Date(ano, mes + 1, 0);
      
      console.log('📅 Inicializando mês específico:', { mes, ano, inicio: primeiro.toISOString().split('T')[0], fim: ultimo.toISOString().split('T')[0] });
      
      setMesSelecionado(mes.toString());
      setAnoSelecionado(ano.toString());
      onDataInicioChange(primeiro.toISOString().split('T')[0]);
      onDataFimChange(ultimo.toISOString().split('T')[0]);
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
        <>
          <div className="w-32">
            <Label className="text-xs mb-1 block" style={{ color: theme.textMuted }}>Mês</Label>
            <Select
              value={mesSelecionado}
              onValueChange={(mes) => {
                console.log('📅 Mês selecionado (raw):', mes);
                setMesSelecionado(mes);
                const ano = anoSelecionado || new Date().getFullYear().toString();
                const mesInt = parseInt(mes);
                console.log('📅 Calculando datas para:', { mesInt, ano });
                const primeiro = new Date(parseInt(ano), mesInt, 1);
                const ultimo = new Date(parseInt(ano), mesInt + 1, 0);
                console.log('📅 Objetos Date criados:', { 
                  primeiro: primeiro.toISOString(), 
                  ultimo: ultimo.toISOString() 
                });
                const inicio = primeiro.toISOString().split('T')[0];
                const fim = ultimo.toISOString().split('T')[0];
                console.log('📅 Datas calculadas finais:', { inicio, fim, mes, ano });
                onDataInicioChange(inicio);
                onDataFimChange(fim);
              }}
            >
              <SelectTrigger className="h-8 text-sm" style={{ backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.text }}>
                <SelectValue placeholder="Mês" />
              </SelectTrigger>
              <SelectContent style={{ backgroundColor: theme.inputBg, borderColor: theme.inputBorder }}>
                <SelectItem value="0" style={{ color: theme.text }}>Jan</SelectItem>
                <SelectItem value="1" style={{ color: theme.text }}>Fev</SelectItem>
                <SelectItem value="2" style={{ color: theme.text }}>Mar</SelectItem>
                <SelectItem value="3" style={{ color: theme.text }}>Abr</SelectItem>
                <SelectItem value="4" style={{ color: theme.text }}>Mai</SelectItem>
                <SelectItem value="5" style={{ color: theme.text }}>Jun</SelectItem>
                <SelectItem value="6" style={{ color: theme.text }}>Jul</SelectItem>
                <SelectItem value="7" style={{ color: theme.text }}>Ago</SelectItem>
                <SelectItem value="8" style={{ color: theme.text }}>Set</SelectItem>
                <SelectItem value="9" style={{ color: theme.text }}>Out</SelectItem>
                <SelectItem value="10" style={{ color: theme.text }}>Nov</SelectItem>
                <SelectItem value="11" style={{ color: theme.text }}>Dez</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="w-28">
            <Label className="text-xs mb-1 block" style={{ color: theme.textMuted }}>Ano</Label>
            <Select
              value={anoSelecionado}
              onValueChange={(ano) => {
                console.log('📅 Ano selecionado (raw):', ano);
                setAnoSelecionado(ano);
                const mes = mesSelecionado || new Date().getMonth().toString();
                const mesInt = parseInt(mes);
                console.log('📅 Calculando datas para:', { mesInt, ano });
                const primeiro = new Date(parseInt(ano), mesInt, 1);
                const ultimo = new Date(parseInt(ano), mesInt + 1, 0);
                console.log('📅 Objetos Date criados:', { 
                  primeiro: primeiro.toISOString(), 
                  ultimo: ultimo.toISOString() 
                });
                const inicio = primeiro.toISOString().split('T')[0];
                const fim = ultimo.toISOString().split('T')[0];
                console.log('📅 Datas calculadas finais:', { inicio, fim, mes, ano });
                onDataInicioChange(inicio);
                onDataFimChange(fim);
              }}
            >
              <SelectTrigger className="h-8 text-sm" style={{ backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.text }}>
                <SelectValue placeholder="Ano" />
              </SelectTrigger>
              <SelectContent style={{ backgroundColor: theme.inputBg, borderColor: theme.inputBorder }}>
                {[2024, 2025, 2026, 2027].map(ano => (
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