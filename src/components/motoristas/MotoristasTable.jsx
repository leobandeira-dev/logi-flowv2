
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, Users, User, Eye, FileText, Download } from "lucide-react"; // Added Download import
import { format, isValid } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Skeleton } from "@/components/ui/skeleton";
import FichaMotorista from "./FichaMotorista";

const statusConfig = {
  ativo: { label: "Ativo", color: "bg-green-500" },
  inativo: { label: "Inativo", color: "bg-gray-500" },
  suspenso: { label: "Suspenso", color: "bg-red-500" }
};

export default function MotoristasTable({ motoristas, veiculos, loading, onEdit }) {
  const [selectedMotorista, setSelectedMotorista] = useState(null);
  const [showFicha, setShowFicha] = useState(false);
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

  const getVeiculosVinculados = (motorista) => {
    const veiculosIds = [
      motorista.cavalo_id,
      motorista.implemento1_id,
      motorista.implemento2_id,
      motorista.implemento3_id
    ].filter(Boolean);
    
    return veiculos.filter(v => veiculosIds.includes(v.id));
  };

  const isVencimentoProximo = (vencimento) => {
    if (!vencimento) return false;
    try {
      const dataVencimento = new Date(vencimento);
      if (!isValid(dataVencimento)) return false;
      
      const hoje = new Date();
      const diasRestantes = Math.ceil((dataVencimento - hoje) / (1000 * 60 * 60 * 24));
      return diasRestantes <= 30 && diasRestantes >= 0;
    } catch {
      return false;
    }
  };

  const isVencido = (vencimento) => {
    if (!vencimento) return false;
    try {
      const dataVencimento = new Date(vencimento);
      if (!isValid(dataVencimento)) return false;
      
      const hoje = new Date();
      return dataVencimento < hoje;
    } catch {
      return false;
    }
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
            <Users className="w-4 h-4" />
            Motoristas Cadastrados ({motoristas.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent" style={{ borderBottomColor: theme.border }}>
                  <TableHead className="h-8 text-[10px] font-bold uppercase" style={{ color: theme.textMuted }}>Nome</TableHead>
                  <TableHead className="h-8 text-[10px] font-bold uppercase" style={{ color: theme.textMuted }}>CPF</TableHead>
                  <TableHead className="h-8 text-[10px] font-bold uppercase" style={{ color: theme.textMuted }}>CNH</TableHead>
                  <TableHead className="h-8 text-[10px] font-bold uppercase" style={{ color: theme.textMuted }}>Vencimento</TableHead>
                  <TableHead className="h-8 text-[10px] font-bold uppercase" style={{ color: theme.textMuted }}>Telefone</TableHead>
                  <TableHead className="h-8 text-[10px] font-bold uppercase" style={{ color: theme.textMuted }}>Veículos</TableHead>
                  <TableHead className="h-8 text-[10px] font-bold uppercase" style={{ color: theme.textMuted }}>Status</TableHead>
                  <TableHead className="h-8 text-[10px] font-bold uppercase text-right" style={{ color: theme.textMuted }}>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {motoristas.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-12 text-xs" style={{ color: theme.textMuted }}>
                      Nenhum motorista encontrado
                    </TableCell>
                  </TableRow>
                ) : (
                  motoristas.map((motorista, idx) => {
                    const statusInfo = statusConfig[motorista.status] || statusConfig.ativo;
                    const vencido = isVencido(motorista.vencimento_cnh);
                    const expiringSoon = isVencimentoProximo(motorista.vencimento_cnh);
                    const isCriticalVencimento = vencido || expiringSoon;
                    const veiculosMotorista = getVeiculosVinculados(motorista);

                    return (
                      <TableRow
                        key={motorista.id}
                        className="transition-colors"
                        style={{
                          backgroundColor: idx % 2 === 0 ? theme.rowBg : theme.rowBgAlt,
                          borderBottomColor: theme.border
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = theme.rowHover}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = idx % 2 === 0 ? theme.rowBg : theme.rowBgAlt}
                      >
                        <TableCell className="py-1 px-2">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 bg-blue-100 dark:bg-blue-900/40 rounded-full flex items-center justify-center flex-shrink-0">
                              <User className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <span className="font-semibold text-xs" style={{ color: theme.text }}>{motorista.nome}</span>
                          </div>
                        </TableCell>
                        <TableCell className="py-1 px-2 text-[10px] font-mono" style={{ color: theme.text }}>
                          {motorista.cpf}
                        </TableCell>
                        <TableCell className="py-1 px-2 text-[10px] font-mono" style={{ color: theme.text }}>
                          {motorista.cnh}
                        </TableCell>
                        <TableCell className="py-1 px-2">
                          {motorista.vencimento_cnh ? (
                            <div className={`text-[10px] ${isCriticalVencimento ? 'text-red-600 dark:text-red-400 font-bold' : ''}`}
                              style={!isCriticalVencimento ? { color: theme.text } : {}}>
                              {formatDate(motorista.vencimento_cnh)}
                            </div>
                          ) : (
                            <span className="text-[9px]" style={{ color: theme.textMuted }}>-</span>
                          )}
                        </TableCell>
                        <TableCell className="py-1 px-2 text-[10px]" style={{ color: theme.text }}>
                          {motorista.celular || "-"}
                        </TableCell>
                        <TableCell className="py-1 px-2">
                          {veiculosMotorista.length > 0 ? (
                            <div className="flex flex-wrap gap-0.5">
                              {veiculosMotorista.map((v) => (
                                <Badge 
                                  key={v.id} 
                                  variant="outline" 
                                  className="text-[9px] h-4 px-1 font-mono font-bold"
                                  style={{ 
                                    backgroundColor: theme.cardBg, 
                                    borderColor: theme.border,
                                    color: theme.text
                                  }}
                                >
                                  {v.placa}
                                </Badge>
                              ))}
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
                            {motorista.cnh_documento_url && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => window.open(motorista.cnh_documento_url, '_blank')}
                                className="h-6 w-6 p-0"
                                style={{ color: theme.textMuted }}
                                title="Baixar CNH"
                              >
                                <FileText className="w-3.5 h-3.5" />
                              </Button>
                            )}
                            {motorista.comprovante_endereco_url && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => window.open(motorista.comprovante_endereco_url, '_blank')}
                                className="h-6 w-6 p-0"
                                style={{ color: theme.textMuted }}
                                title="Baixar Comprovante de Endereço"
                              >
                                <Download className="w-3.5 h-3.5" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedMotorista(motorista);
                                setShowFicha(true);
                              }}
                              className="h-6 w-6 p-0"
                              style={{ color: theme.textMuted }}
                              title="Ver Ficha"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onEdit(motorista)}
                              className="h-6 w-6 p-0"
                              style={{ color: theme.textMuted }}
                              title="Editar Motorista"
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

      {showFicha && selectedMotorista && (
        <FichaMotorista
          open={showFicha}
          onClose={() => {
            setShowFicha(false);
            setSelectedMotorista(null);
          }}
          motorista={selectedMotorista}
          veiculos={veiculos}
        />
      )}
    </>
  );
}
