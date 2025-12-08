import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, Eye, Package, User, Download } from "lucide-react";
import { format, isValid } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Skeleton } from "@/components/ui/skeleton";
import DownloadDocumentosOrdem from "./DownloadDocumentosOrdem";

const statusConfig = {
  novo: { label: "Novo", color: "bg-blue-500 text-white" },
  pendente_cadastro: { label: "Pend. Cadastro", color: "bg-yellow-500 text-white" },
  pendente_rastreamento: { label: "Pend. Rastreamento", color: "bg-orange-500 text-white" },
  pendente_expedicao: { label: "Pend. Expedição", color: "bg-purple-500 text-white" },
  pendente_financeiro: { label: "Pend. Financeiro", color: "bg-red-500 text-white" },
  aguardando_carregamento: { label: "Aguard. Carregamento", color: "bg-indigo-500 text-white" },
  em_transito: { label: "Em Trânsito", color: "bg-green-500 text-white" },
  entregue: { label: "Entregue", color: "bg-teal-500 text-white" },
  finalizado: { label: "Finalizado", color: "bg-gray-600 text-white" },
  cancelado: { label: "Cancelado", color: "bg-gray-400 text-white" }
};

export default function OrdensTable({ ordens, motoristas, veiculos, loading, onEdit, onViewDetails, onDelete, onUpdate }) {
  const [isDark, setIsDark] = useState(false);
  const [showDownloadDocs, setShowDownloadDocs] = useState(false);
  const [selectedOrdem, setSelectedOrdem] = useState(null);

  useEffect(() => {
    const checkDarkMode = () => {
      setIsDark(document.documentElement.classList.contains('dark'));
    };
    checkDarkMode();
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  const getMotorista = (motoristaId) => {
    return motoristas.find(m => m.id === motoristaId);
  };

  const getVeiculo = (veiculoId) => {
    return veiculos.find(v => v.id === veiculoId);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    try {
      const date = new Date(dateString);
      if (!isValid(date)) return "-";
      return format(date, "dd/MM/yyyy", { locale: ptBR });
    } catch {
      return "-";
    }
  };

  const formatarNomeMotorista = (nomeCompleto) => {
    if (!nomeCompleto) return "";
    const partes = nomeCompleto.split(' ').filter(p => p.length > 0);
    if (partes.length === 1) return partes[0];

    const primeiroNome = partes[0];
    const iniciais = partes.slice(1).map(p => p[0] + '.').join(' ');
    return `${primeiroNome} ${iniciais}`;
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
    <>
      <Card className="shadow" style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}>
        <CardHeader className="pb-1.5 pt-1.5 px-3 border-b" style={{ backgroundColor: theme.headerBg, borderBottomColor: theme.border }}>
          <CardTitle className="flex items-center gap-2 text-sm font-semibold" style={{ color: theme.text }}>
            <Package className="w-4 h-4" />
            Ordens de Carregamento ({ordens.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent" style={{ borderBottomColor: theme.border }}>
                  <TableHead className="h-8 text-[10px] font-bold uppercase" style={{ color: theme.textMuted }}>Nº Carga</TableHead>
                  <TableHead className="h-8 text-[10px] font-bold uppercase" style={{ color: theme.textMuted }}>Tipo</TableHead>
                  <TableHead className="h-8 text-[10px] font-bold uppercase" style={{ color: theme.textMuted }}>Cliente</TableHead>
                  <TableHead className="h-8 text-[10px] font-bold uppercase" style={{ color: theme.textMuted }}>Rota</TableHead>
                  <TableHead className="h-8 text-[10px] font-bold uppercase" style={{ color: theme.textMuted }}>Motorista</TableHead>
                  <TableHead className="h-8 text-[10px] font-bold uppercase" style={{ color: theme.textMuted }}>Placa</TableHead>
                  <TableHead className="h-8 text-[10px] font-bold uppercase" style={{ color: theme.textMuted }}>Status</TableHead>
                  <TableHead className="h-8 text-[10px] font-bold uppercase text-right" style={{ color: theme.textMuted }}>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ordens.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-12 text-xs" style={{ color: theme.textMuted }}>
                      Nenhuma ordem encontrada
                    </TableCell>
                  </TableRow>
                ) : (
                  ordens.map((ordem, idx) => {
                    const statusInfo = statusConfig[ordem.status] || statusConfig.novo;
                    const motorista = getMotorista(ordem.motorista_id);
                    const cavalo = getVeiculo(ordem.cavalo_id);
                    const implemento1 = getVeiculo(ordem.implemento1_id);
                    const implemento2 = getVeiculo(ordem.implemento2_id);
                    const implemento3 = getVeiculo(ordem.implemento3_id);

                    const placas = [cavalo?.placa, implemento1?.placa, implemento2?.placa, implemento3?.placa].filter(Boolean);

                    const temMotorista = !!ordem.motorista_id;
                    const temVeiculo = !!ordem.cavalo_id;
                    const isOferta = !temMotorista || !temVeiculo;

                    return (
                      <TableRow
                        key={ordem.id}
                        className="transition-colors"
                        style={{
                          backgroundColor: idx % 2 === 0 ? theme.rowBg : theme.rowBgAlt,
                          borderBottomColor: theme.border
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = theme.rowHover}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = idx % 2 === 0 ? theme.rowBg : theme.rowBgAlt}
                      >
                        <TableCell className="py-1 px-2">
                          <span className="font-mono font-bold text-xs" style={{ color: isDark ? '#60a5fa' : '#1d4ed8' }}>
                            {ordem.numero_carga || `#${ordem.id.slice(-6)}`}
                          </span>
                        </TableCell>
                        <TableCell className="py-1 px-2">
                          <Badge className={`text-[9px] h-4 px-1.5 font-bold border-2 ${
                            isOferta
                              ? "bg-green-600 text-white border-green-700"
                              : "bg-blue-600 text-white border-blue-700"
                          }`}>
                            {isOferta ? "Oferta" : "Alocado"}
                          </Badge>
                        </TableCell>
                        <TableCell className="py-1 px-2 text-[10px]" style={{ color: theme.text }}>
                          {ordem.cliente}
                        </TableCell>
                        <TableCell className="py-1 px-2 text-[10px]" style={{ color: theme.text }}>
                          {ordem.origem} → {ordem.destino}
                        </TableCell>
                        <TableCell className="py-1 px-2">
                          {motorista ? (
                            <div className="flex items-center gap-1">
                              <User className="w-3 h-3" style={{ color: theme.textMuted }} />
                              <span className="text-[10px] font-medium" style={{ color: theme.text }}>
                                {formatarNomeMotorista(motorista.nome)}
                              </span>
                            </div>
                          ) : (
                            <span className="text-[9px]" style={{ color: theme.textMuted }}>-</span>
                          )}
                        </TableCell>
                        <TableCell className="py-1 px-2">
                          {placas.length > 0 ? (
                            <div className="flex flex-wrap gap-0.5">
                              {placas.map((placa, i) => (
                                <Badge 
                                  key={i} 
                                  variant="outline" 
                                  className="text-[9px] h-4 px-1 font-mono font-bold"
                                  style={{ 
                                    backgroundColor: theme.cardBg, 
                                    borderColor: theme.border,
                                    color: theme.text
                                  }}
                                >
                                  {placa}
                                </Badge>
                              ))}
                            </div>
                          ) : (
                            <span className="text-[9px]" style={{ color: theme.textMuted }}>-</span>
                          )}
                        </TableCell>
                        <TableCell className="py-1 px-2">
                          <Badge className={`${statusInfo.color} text-[9px] h-4 px-1.5 font-medium`}>
                            {statusInfo.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="py-1 px-2 text-right">
                          <div className="flex items-center justify-end gap-0.5">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedOrdem(ordem);
                                setShowDownloadDocs(true);
                              }}
                              className="h-6 w-6 p-0"
                              style={{ color: theme.textMuted }}
                              title="Baixar Documentos"
                            >
                              <Download className="w-3.5 h-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onViewDetails(ordem)}
                              className="h-6 w-6 p-0"
                              style={{ color: theme.textMuted }}
                              title="Ver Detalhes"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onEdit(ordem)}
                              className="h-6 w-6 p-0"
                              style={{ color: theme.textMuted }}
                              title="Editar"
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

      {showDownloadDocs && selectedOrdem && (
        <DownloadDocumentosOrdem
          open={showDownloadDocs}
          onClose={() => {
            setShowDownloadDocs(false);
            setSelectedOrdem(null);
          }}
          ordem={selectedOrdem}
        />
      )}
    </>
  );
}