
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, Truck, FileText } from "lucide-react"; // Added FileText import
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Skeleton } from "@/components/ui/skeleton";

const statusConfig = {
  disponível: { label: "Disponível", color: "bg-green-500" },
  em_uso: { label: "Em Uso", color: "bg-blue-500" },
  manutenção: { label: "Manutenção", color: "bg-yellow-500" },
  inativo: { label: "Inativo", color: "bg-gray-500" }
};

const tipoConfig = {
  cavalo: { label: "Cavalo", color: "bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-400" },
  carreta: { label: "Carreta", color: "bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-400" },
  truck: { label: "Truck", color: "bg-purple-100 dark:bg-purple-900/40 text-purple-800 dark:text-purple-400" },
  van: { label: "Van", color: "bg-orange-100 dark:bg-orange-900/40 text-orange-800 dark:text-orange-400" },
  "semi-reboque": { label: "Semi-reboque", color: "bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-400" }
};

export default function VeiculosTable({ veiculos, loading, onEdit }) {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const checkDarkMode = () => {
      setIsDark(document.documentElement.classList.contains('dark'));
    };
    checkDarkMode();
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  const isVencimentoProximo = (vencimento) => {
    if (!vencimento) return false;
    const hoje = new Date();
    const dataVencimento = new Date(vencimento);
    const diasRestantes = Math.ceil((dataVencimento - hoje) / (1000 * 60 * 60 * 24));
    return diasRestantes <= 30 && diasRestantes >= 0;
  };

  const isVencido = (vencimento) => {
    if (!vencimento) return false;
    const hoje = new Date();
    const dataVencimento = new Date(vencimento);
    return dataVencimento < hoje;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return format(new Date(dateString), "dd/MM/yyyy", { locale: ptBR });
  };

  const theme = {
    cardBg: isDark ? '#1e293b' : '#ffffff',
    cardBorder: isDark ? '#334155' : '#e5e7eb',
    text: isDark ? '#f1f5f9' : '#111827',
    textMuted: isDark ? '#94a3b8' : '#6b7280',
    headerBg: isDark ? '#0f172a' : '#f9fafb',
    rowBg: isDark ? '#1e293b' : '#ffffff',
    rowBgAlt: isDark ? '#0f172a' : '#f9fafb',
    rowHover: isDark ? '#334155' : '#eff6ff',
    border: isDark ? '#334155' : '#e5e7eb',
  };

  if (loading) {
    return (
      <Card className="shadow" style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}>
        <CardContent className="p-6">
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-10 w-full" style={{ backgroundColor: isDark ? '#334155' : '#e5e7eb' }} />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow" style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}>
      <CardHeader className="pb-1.5 pt-1.5 px-3 border-b" style={{ backgroundColor: theme.headerBg, borderBottomColor: theme.border }}>
        <CardTitle className="flex items-center gap-2 text-sm font-semibold" style={{ color: theme.text }}>
          <Truck className="w-4 h-4" />
          Veículos Cadastrados ({veiculos.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent" style={{ borderBottomColor: theme.border }}>
                <TableHead className="h-8 text-[10px] font-bold uppercase" style={{ color: theme.textMuted }}>Placa</TableHead>
                <TableHead className="h-8 text-[10px] font-bold uppercase" style={{ color: theme.textMuted }}>Tipo</TableHead>
                <TableHead className="h-8 text-[10px] font-bold uppercase" style={{ color: theme.textMuted }}>Marca/Modelo</TableHead>
                <TableHead className="h-8 text-[10px] font-bold uppercase" style={{ color: theme.textMuted }}>Ano</TableHead>
                <TableHead className="h-8 text-[10px] font-bold uppercase" style={{ color: theme.textMuted }}>Capacidade</TableHead>
                <TableHead className="h-8 text-[10px] font-bold uppercase" style={{ color: theme.textMuted }}>Proprietário</TableHead>
                <TableHead className="h-8 text-[10px] font-bold uppercase" style={{ color: theme.textMuted }}>Licenciamento</TableHead>
                <TableHead className="h-8 text-[10px] font-bold uppercase" style={{ color: theme.textMuted }}>Status</TableHead>
                <TableHead className="h-8 text-[10px] font-bold uppercase text-right" style={{ color: theme.textMuted }}>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {veiculos.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-12 text-xs" style={{ color: theme.textMuted }}>
                    Nenhum veículo encontrado
                  </TableCell>
                </TableRow>
              ) : (
                veiculos.map((veiculo, idx) => {
                  const statusInfo = statusConfig[veiculo.status] || statusConfig.disponível;
                  const tipoInfo = tipoConfig[veiculo.tipo] || { label: veiculo.tipo, color: "bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300" };
                  const shouldHighlightLicenciamento = isVencido(veiculo.vencimento_licenciamento) || isVencimentoProximo(veiculo.vencimento_licenciamento);

                  return (
                    <TableRow
                      key={veiculo.id}
                      className="transition-colors"
                      style={{
                        backgroundColor: idx % 2 === 0 ? theme.rowBg : theme.rowBgAlt,
                        borderBottomColor: theme.border
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = theme.rowHover}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = idx % 2 === 0 ? theme.rowBg : theme.rowBgAlt}
                    >
                      <TableCell className="py-1 px-2">
                        <div className="flex items-center gap-1.5">
                          <Truck className="w-3.5 h-3.5" style={{ color: theme.textMuted }} />
                          <span className="font-mono font-bold text-xs" style={{ color: theme.text }}>{veiculo.placa}</span>
                        </div>
                      </TableCell>
                      <TableCell className="py-1 px-2">
                        <Badge className={`${tipoInfo.color} text-[9px] h-4 px-1.5 font-medium`}>
                          {tipoInfo.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-1 px-2 text-[10px]" style={{ color: theme.text }}>
                        {veiculo.marca} {veiculo.modelo}
                      </TableCell>
                      <TableCell className="py-1 px-2 text-[10px]" style={{ color: theme.text }}>
                        {veiculo.ano_modelo || "-"}
                      </TableCell>
                      <TableCell className="py-1 px-2 text-[10px]" style={{ color: theme.text }}>
                        {veiculo.capacidade_carga ? `${veiculo.capacidade_carga.toLocaleString()} kg` : "-"}
                      </TableCell>
                      <TableCell className="py-1 px-2 text-[10px]" style={{ color: theme.text }}>
                        {veiculo.proprietario || "-"}
                      </TableCell>
                      <TableCell className="py-1 px-2">
                        {veiculo.vencimento_licenciamento ? (
                          <div className={`text-[10px] ${shouldHighlightLicenciamento ? 'text-red-600 dark:text-red-400 font-bold' : ''}`}
                            style={!shouldHighlightLicenciamento ? { color: theme.text } : {}}>
                            {formatDate(veiculo.vencimento_licenciamento)}
                          </div>
                        ) : (
                          <span className="text-[9px]" style={{ color: theme.textMuted }}>-</span>
                        )}
                      </TableCell>
                      <TableCell className="py-1 px-2">
                        <Badge className={`${statusInfo.color} text-white text-[9px] h-4 px-1.5 font-medium`}>
                          {statusInfo.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-1 px-2 text-right">
                        <div className="flex items-center justify-end gap-0.5">
                          {veiculo.crlv_documento_url && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => window.open(veiculo.crlv_documento_url, '_blank')}
                              className="h-6 w-6 p-0"
                              style={{ color: theme.textMuted }}
                              title="Baixar CRLV"
                            >
                              <FileText className="w-3.5 h-3.5" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onEdit(veiculo)}
                            className="h-6 w-6 p-0"
                            style={{ color: theme.textMuted }}
                            title="Editar Veículo"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
