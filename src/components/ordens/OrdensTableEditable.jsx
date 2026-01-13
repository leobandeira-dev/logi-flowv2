import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Edit, Trash2, Eye, Package, User, Truck, FileText, Printer, Check, X, Scan, Grid3x3, GitBranch, Zap } from "lucide-react";
import { format, isValid } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator 
} from "@/components/ui/dropdown-menu";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import ImpressaoOrdem from "./ImpressaoOrdem";
import ExportarOfertaIndividual from "./ExportarOfertaIndividual";

const getPrefixoTipo = (tipo_registro) => {
  switch(tipo_registro) {
    // Ordens de Coleta
    case "coleta_solicitada":
    case "coleta_aprovada":
    case "coleta_reprovada": 
      return "COL";
    
    // Ordens de Recebimento
    case "recebimento": 
      return "REC";
    
    // Ordens de Entrega
    case "ordem_entrega": 
      return "ENT";
    
    // Ordens de Carregamento (inclui oferta, negociando, alocado, ordem_completa)
    case "ordem_completa":
    case "oferta":
    case "negociando":
    case "alocado":
    default: 
      return "ORD";
  }
};

const statusTrackingConfig = {
  aguardando_agendamento: { label: ["Aguard.", "Agend."], color: "bg-slate-500 text-white" },
  carregamento_agendado: { label: ["Carreg.", "Agendado"], color: "bg-blue-500 text-white" },
  em_carregamento: { label: ["Em", "Carreg."], color: "bg-indigo-500 text-white" },
  carregado: { label: ["Carregado"], color: "bg-purple-500 text-white" },
  em_viagem: { label: ["Em", "Viagem"], color: "bg-cyan-500 text-white" },
  chegada_destino: { label: ["Chegou", "Destino"], color: "bg-teal-500 text-white" },
  descarga_agendada: { label: ["Descarga", "Agendada"], color: "bg-amber-500 text-white" },
  em_descarga: { label: ["Em", "Descarga"], color: "bg-orange-500 text-white" },
  descarga_realizada: { label: ["Descarga", "Realizada"], color: "bg-green-500 text-white" },
  finalizado: { label: ["Finalizado"], color: "bg-gray-600 text-white" }
};

const tipoVeiculoOptions = [
  "RODOTREM", "TRUCK", "CARRETA 5EIXOS", "CARRETA 6EIXOS",
  "CARRETA 7EIXOS", "BITREM", "CARRETA LOC", "PRANCHA", "BI-TRUCK", "FIORINO"
];

export default function OrdensTableEditable({ ordens, motoristas, veiculos, operacoes, loading, onEdit, onViewDetails, onDelete, onUpdate, onConferencia, onEnderecamento, onCriarOrdemFilha }) {
  const [isDark, setIsDark] = useState(false);
  const [showImpressao, setShowImpressao] = useState(false);
  const [selectedOrdem, setSelectedOrdem] = useState(null);
  const [editingField, setEditingField] = useState(null);
  const [editValues, setEditValues] = useState({});
  const [saving, setSaving] = useState(false);
  const [ordensLocal, setOrdensLocal] = useState([]);

  useEffect(() => {
    setOrdensLocal(ordens);
  }, [ordens]);

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

  const getOperacao = (operacaoId) => {
    return operacoes?.find(op => op.id === operacaoId);
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

  const formatDateTime = (dateString) => {
    if (!dateString) return "-";
    try {
      const date = new Date(dateString);
      if (!isValid(date)) return "-";
      return format(date, "dd/MM/yyyy HH:mm", { locale: ptBR });
    } catch {
      return "-";
    }
  };

  const formatCurrency = (value) => {
    if (!value) return "R$ 0,00";
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  const formatPeso = (peso) => {
    if (!peso) return "-";
    const toneladas = peso / 1000;
    return `${toneladas.toFixed(2)}t`;
  };

  const getModalidadeLabel = (modalidade) => {
    const labels = {
      normal: "Normal",
      prioridade: "Prioridade",
      expressa: "Expressa"
    };
    return labels[modalidade] || modalidade || "-";
  };

  const formatarNomeMotorista = (nomeCompleto) => {
    if (!nomeCompleto) return "";
    const partes = nomeCompleto.split(' ').filter(p => p.length > 0);
    if (partes.length === 1) return partes[0];

    const primeiroNome = partes[0];
    const iniciais = partes.slice(1).map(p => p[0] + '.').join(' ');
    return `${primeiroNome} ${iniciais}`;
  };

  const getTipoRegistro = (ordem) => {
    if (ordem.tipo_registro) return ordem.tipo_registro;

    const temMotorista = !!ordem.motorista_id || !!ordem.motorista_nome_temp;
    const temVeiculo = !!ordem.cavalo_id; // Apenas ID, não placa temporária

    if (!temMotorista && !temVeiculo) return "oferta";
    if (temMotorista && !temVeiculo) return "negociando";
    if (temMotorista && temVeiculo) return "ordem_completa";
    return "oferta";
  };

  const getTipoBadgeConfig = (tipo) => {
    switch (tipo) {
      case "negociando":
        return { label: "Negociando", color: "bg-yellow-600 text-white border-yellow-700" };
      case "ordem_completa":
        return { label: "Alocado", color: "bg-blue-600 text-white border-blue-700" };
      default:
        return { label: "Oferta", color: "bg-green-600 text-white border-green-700" };
    }
  };

  const handleStartEdit = (ordemId, field, currentValue) => {
    setEditingField(`${ordemId}-${field}`);
    setEditValues({ [field]: currentValue || "" });
  };

  const handleFieldChange = (field, value) => {
    // Transformar para maiúsculo exceto observações
    if (field === 'motorista_nome_temp' && value) {
      value = value.toUpperCase();
    }
    setEditValues({ ...editValues, [field]: value });
  };

  const handleSaveField = async (ordem, field) => {
    if (saving) return;
    
    const newValue = editValues[field];
    const currentValue = ordem[field];
    
    if (newValue === currentValue || (!newValue && !currentValue)) {
      setEditingField(null);
      setEditValues({});
      return;
    }

    setSaving(true);
    try {
      let processedValue = newValue?.trim() || null;
      
      if (field.includes('placa_temp')) {
        processedValue = processedValue?.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 7) || null;
      }

      if (field === 'frete_viagem') {
        processedValue = processedValue ? parseFloat(processedValue) : null;
      }

      const updateData = { [field]: processedValue };

      if (field === 'frete_viagem') {
        updateData.valor_total_frete = processedValue;
      }

      const dadosAtualizados = { ...ordem, ...updateData };

      // Atualizar tipo_negociacao para TODAS as ordens (incluindo coletas)
      const temMotorista = dadosAtualizados.motorista_nome_temp || dadosAtualizados.motorista_id;
      const temVeiculo = dadosAtualizados.cavalo_id; // Apenas ID, não placa temporária

      if (temMotorista && !temVeiculo) {
        updateData.tipo_negociacao = "negociando";
        // Para não-coletas, atualizar tipo_registro também
        if (dadosAtualizados.tipo_ordem !== "coleta") {
          updateData.tipo_registro = "negociando";
        }
      } else if (temMotorista && temVeiculo) {
        updateData.tipo_negociacao = "alocado";
        if (dadosAtualizados.tipo_ordem !== "coleta") {
          updateData.tipo_registro = "ordem_completa";
        }
      } else {
        updateData.tipo_negociacao = "oferta";
        if (dadosAtualizados.tipo_ordem !== "coleta") {
          updateData.tipo_registro = "oferta";
        }
      }

      await base44.entities.OrdemDeCarregamento.update(ordem.id, updateData);
      toast.success("Campo atualizado com sucesso!");
      
      setOrdensLocal(prevOrdens => prevOrdens.map(o => 
        o.id === ordem.id ? { ...o, ...updateData } : o
      ));
      
      setEditingField(null);
      setEditValues({});
    } catch (error) {
      console.error("Erro ao salvar:", error);
      toast.error("Erro ao salvar dados");
    } finally {
      setSaving(false);
    }
  };

  const handleBlur = (ordem, field) => {
    setTimeout(() => handleSaveField(ordem, field), 150);
  };

  const handleKeyDown = (e, ordem, field) => {
    if (e.key === 'h' || e.key === 'H') {
      if (field.includes('agendamento_data')) {
        e.preventDefault();
        e.stopPropagation();
        const agora = new Date();
        const offset = agora.getTimezoneOffset();
        const localDate = new Date(agora.getTime() - (offset * 60 * 1000));
        const localISOString = localDate.toISOString().slice(0, 16);
        
        setEditValues({ ...editValues, [field]: localISOString });
        
        setTimeout(async () => {
          const isoForDB = new Date(localISOString).toISOString();
          setSaving(true);
          try {
            const updateData = { [field]: isoForDB };
            await base44.entities.OrdemDeCarregamento.update(ordem.id, updateData);
            toast.success("Data/hora atualizada!");
            setOrdensLocal(prevOrdens => prevOrdens.map(o => 
              o.id === ordem.id ? { ...o, ...updateData } : o
            ));
            setEditingField(null);
            setEditValues({});
          } catch (error) {
            console.error("Erro ao salvar:", error);
            toast.error("Erro ao salvar data");
          } finally {
            setSaving(false);
          }
        }, 100);
        return;
      }
    }

    if (e.key === 'Enter') {
      e.preventDefault();
      handleSaveField(ordem, field);
    } else if (e.key === 'Escape') {
      setEditingField(null);
      setEditValues({});
    }
  };

  const isFieldEditing = (ordemId, field) => {
    return editingField === `${ordemId}-${field}`;
  };

  const canEditInline = (ordem) => {
    return true;
  };

  const getDateTimeLocalValue = (isoString) => {
    if (!isoString) return "";
    try {
      const date = new Date(isoString);
      const offset = date.getTimezoneOffset();
      const localDate = new Date(date.getTime() - (offset * 60 * 1000));
      return localDate.toISOString().slice(0, 16);
    } catch {
      return "";
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
    inputBg: isDark ? '#1e293b' : '#ffffff',
    inputBorder: isDark ? '#334155' : '#e5e7eb',
    cellEditHover: isDark ? '#1e3a8a' : '#dbeafe',
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
            Ordens de Carregamento ({ordensLocal.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent" style={{ borderBottomColor: theme.border }}>
                  <TableHead className="h-8 text-[10px] font-bold uppercase min-w-[100px] px-2" style={{ color: theme.textMuted }}>Nº</TableHead>
                  <TableHead className="h-8 text-[10px] font-bold uppercase min-w-[90px] px-2" style={{ color: theme.textMuted }}>Tipo</TableHead>
                  <TableHead className="h-8 text-[10px] font-bold uppercase min-w-[110px] px-2" style={{ color: theme.textMuted }}>Status</TableHead>
                  <TableHead className="h-8 text-[10px] font-bold uppercase min-w-[100px] px-2" style={{ color: theme.textMuted }}>Status Aprov.</TableHead>
                  <TableHead className="h-8 text-[10px] font-bold uppercase min-w-[60px] px-2" style={{ color: theme.textMuted }}>Senha</TableHead>
                  <TableHead className="h-8 text-[10px] font-bold uppercase min-w-[100px] px-2" style={{ color: theme.textMuted }}>Operação</TableHead>
                  <TableHead className="h-8 text-[10px] font-bold uppercase min-w-[130px] px-2" style={{ color: theme.textMuted }}>Cliente</TableHead>
                  <TableHead className="h-8 text-[10px] font-bold uppercase min-w-[150px] px-2" style={{ color: theme.textMuted }}>Rota</TableHead>
                  <TableHead className="h-8 text-[10px] font-bold uppercase min-w-[90px] px-2" style={{ color: theme.textMuted }}>Modal.</TableHead>
                  <TableHead className="h-8 text-[10px] font-bold uppercase min-w-[110px] px-2" style={{ color: theme.textMuted }}>Tipo Veíc.</TableHead>
                  <TableHead className="h-8 text-[10px] font-bold uppercase min-w-[70px] px-2" style={{ color: theme.textMuted }}>Peso</TableHead>
                  <TableHead className="h-8 text-[10px] font-bold uppercase min-w-[110px] px-2" style={{ color: theme.textMuted }}>Motorista</TableHead>
                  <TableHead className="h-8 text-[10px] font-bold uppercase min-w-[170px] px-2" style={{ color: theme.textMuted }}>Placas</TableHead>
                  <TableHead className="h-8 text-[10px] font-bold uppercase min-w-[100px] px-2" style={{ color: theme.textMuted }}>Frete</TableHead>
                  <TableHead className="h-8 text-[10px] font-bold uppercase min-w-[120px] px-2" style={{ color: theme.textMuted }}>Agend. Carreg.</TableHead>
                  <TableHead className="h-8 text-[10px] font-bold uppercase min-w-[120px] px-2" style={{ color: theme.textMuted }}>Agend. Desc.</TableHead>
                  <TableHead className="h-8 text-[10px] font-bold uppercase min-w-[160px] px-2" style={{ color: theme.textMuted }}>Observações</TableHead>
                  <TableHead className="h-8 text-[10px] font-bold uppercase text-right min-w-[140px] sticky right-0 px-2" style={{ color: theme.textMuted, backgroundColor: theme.headerBg, borderLeft: `1px solid ${theme.border}` }}>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ordensLocal.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={18} className="text-center py-12 text-xs" style={{ color: theme.textMuted }}>
                      Nenhuma ordem encontrada
                    </TableCell>
                  </TableRow>
                ) : (
                  ordensLocal.map((ordem, idx) => {
                    const statusInfo = statusTrackingConfig[ordem.status_tracking] || { label: "-", color: "bg-gray-400 text-white" };
                    const motorista = getMotorista(ordem.motorista_id);
                    const cavalo = getVeiculo(ordem.cavalo_id);
                    const implemento1 = getVeiculo(ordem.implemento1_id);
                    const implemento2 = getVeiculo(ordem.implemento2_id);
                    const implemento3 = getVeiculo(ordem.implemento3_id);
                    const operacao = getOperacao(ordem.operacao_id);

                    const placas = [
                      cavalo?.placa || ordem.cavalo_placa_temp,
                      implemento1?.placa || ordem.implemento1_placa_temp,
                      implemento2?.placa || ordem.implemento2_placa_temp,
                      implemento3?.placa || ordem.implemento3_placa_temp
                    ].filter(Boolean);

                    const tipoRegistro = getTipoRegistro(ordem);
                    const tipoBadgeConfig = getTipoBadgeConfig(tipoRegistro);
                    const allowInlineEdit = canEditInline(ordem);

                    return (
                      <TableRow
                        key={ordem.id}
                        className="transition-colors"
                        style={{
                          backgroundColor: idx % 2 === 0 ? theme.rowBg : theme.rowBgAlt,
                          borderBottomColor: theme.border,
                          height: '36px'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = theme.rowHover}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = idx % 2 === 0 ? theme.rowBg : theme.rowBgAlt}
                      >
                        <TableCell className="py-1 px-2 align-middle">
                          <span className="font-mono font-bold text-[10px] whitespace-nowrap" style={{ color: isDark ? '#60a5fa' : '#1d4ed8' }}>
                            {ordem.numero_coleta || ordem.numero_carga || `${getPrefixoTipo(ordem.tipo_registro)}-#${ordem.id.slice(-6)}`}
                          </span>
                        </TableCell>
                        <TableCell className="py-1 px-2 align-middle">
                          <Badge className={`text-[9px] h-4 px-1.5 font-bold border-2 ${tipoBadgeConfig.color}`}>
                            {tipoBadgeConfig.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="py-1 px-2 align-middle">
                          <Badge className={`text-[9px] h-auto min-h-6 px-1.5 font-bold ${statusInfo.color} flex flex-col items-center justify-center leading-[1.1] py-0.5`}>
                            {Array.isArray(statusInfo.label) ? (
                              statusInfo.label.map((linha, i) => (
                                <span key={i} className="whitespace-nowrap">{linha}</span>
                              ))
                            ) : (
                              <span className="whitespace-nowrap">{statusInfo.label}</span>
                            )}
                          </Badge>
                        </TableCell>
                        <TableCell className="py-1 px-2 align-middle">
                          {ordem.tipo_registro === "coleta_solicitada" && (
                            <Badge className="text-[9px] h-4 px-1.5 font-medium bg-yellow-100 text-yellow-800 border border-yellow-300">
                              Solicitada
                            </Badge>
                          )}
                          {ordem.tipo_registro === "coleta_aprovada" && (
                            <Badge className="text-[9px] h-4 px-1.5 font-medium bg-green-100 text-green-800 border border-green-300">
                              Aprovada
                            </Badge>
                          )}
                          {ordem.tipo_registro === "coleta_reprovada" && (
                            <Badge className="text-[9px] h-4 px-1.5 font-medium bg-red-100 text-red-800 border border-red-300">
                              Reprovada
                            </Badge>
                          )}
                          {!["coleta_solicitada", "coleta_aprovada", "coleta_reprovada"].includes(ordem.tipo_registro) && (
                            <span className="text-[9px]" style={{ color: theme.textMuted }}>-</span>
                          )}
                        </TableCell>
                        <TableCell className="py-1 px-2 align-middle">
                          {ordem.senha_fila ? (
                            <span className="font-mono font-bold text-xs px-2 py-0.5 rounded whitespace-nowrap" style={{ 
                              backgroundColor: isDark ? '#1e3a8a' : '#dbeafe',
                              color: isDark ? '#60a5fa' : '#1e40af'
                            }}>
                              {ordem.senha_fila}
                            </span>
                          ) : (
                            <span className="text-[9px]" style={{ color: theme.textMuted }}>-</span>
                          )}
                        </TableCell>
                        <TableCell className="py-1 px-2 align-middle max-w-[90px]">
                          {operacao ? (
                            <span className="text-[9px] font-medium block truncate" style={{ color: theme.text }} title={operacao.nome}>
                              {operacao.nome}
                            </span>
                          ) : (
                            <span className="text-[9px]" style={{ color: theme.textMuted }}>-</span>
                          )}
                        </TableCell>
                        <TableCell className="py-1 px-2 align-middle text-[10px] max-w-[120px]" style={{ color: theme.text }}>
                          <span className="block truncate" title={ordem.cliente}>
                            {ordem.cliente}
                          </span>
                        </TableCell>
                        <TableCell className="py-1 px-2 align-middle max-w-[150px]">
                          <span className="text-[9px] font-medium block truncate" style={{ color: theme.text }} title={`${ordem.origem_cidade || ordem.origem} → ${ordem.destino_cidade || ordem.destino}`}>
                            {ordem.origem_cidade || ordem.origem} → {ordem.destino_cidade || ordem.destino}
                          </span>
                        </TableCell>
                        <TableCell 
                          onClick={() => allowInlineEdit && !isFieldEditing(ordem.id, 'modalidade_carga') && handleStartEdit(ordem.id, 'modalidade_carga', ordem.modalidade_carga)}
                          className={`py-1 px-2 align-middle ${allowInlineEdit ? 'cursor-pointer' : ''}`}
                          style={allowInlineEdit ? {
                            transition: 'background-color 0.2s'
                          } : {}}
                          onMouseEnter={(e) => allowInlineEdit && (e.currentTarget.style.backgroundColor = theme.cellEditHover)}
                          onMouseLeave={(e) => allowInlineEdit && (e.currentTarget.style.backgroundColor = 'transparent')}
                          title={allowInlineEdit ? "Clique para editar" : ""}
                        >
                          {isFieldEditing(ordem.id, 'modalidade_carga') ? (
                            <Select
                              value={editValues.modalidade_carga || "normal"}
                              onValueChange={(value) => {
                                handleFieldChange('modalidade_carga', value);
                                setTimeout(() => handleSaveField(ordem, 'modalidade_carga'), 100);
                              }}
                            >
                              <SelectTrigger className="h-6 text-[9px] w-24 border" style={{ backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.text }}>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent style={{ backgroundColor: theme.cardBg, borderColor: theme.border }}>
                                <SelectItem value="normal" className="text-xs" style={{ color: theme.text }}>Normal</SelectItem>
                                <SelectItem value="prioridade" className="text-xs" style={{ color: theme.text }}>Prioridade</SelectItem>
                                <SelectItem value="expressa" className="text-xs" style={{ color: theme.text }}>Expressa</SelectItem>
                              </SelectContent>
                            </Select>
                          ) : (
                            <Badge 
                              variant="outline" 
                              className="text-[9px] h-4 px-1.5 font-medium"
                              style={{ 
                                backgroundColor: ordem.modalidade_carga === 'expressa' ? (isDark ? '#7c2d12' : '#fed7aa') : 
                                                ordem.modalidade_carga === 'prioridade' ? (isDark ? '#713f12' : '#fef3c7') : 
                                                (isDark ? '#1e293b' : '#f1f5f9'),
                                borderColor: ordem.modalidade_carga === 'expressa' ? '#ea580c' : 
                                            ordem.modalidade_carga === 'prioridade' ? '#f59e0b' : theme.border,
                                color: ordem.modalidade_carga === 'expressa' ? '#ea580c' : 
                                      ordem.modalidade_carga === 'prioridade' ? '#f59e0b' : theme.text
                              }}
                            >
                              {getModalidadeLabel(ordem.modalidade_carga)}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell 
                          onClick={() => allowInlineEdit && !isFieldEditing(ordem.id, 'tipo_veiculo') && handleStartEdit(ordem.id, 'tipo_veiculo', ordem.tipo_veiculo)}
                          className={`py-1 px-2 align-middle ${allowInlineEdit ? 'cursor-pointer' : ''}`}
                          style={allowInlineEdit ? {
                            transition: 'background-color 0.2s'
                          } : {}}
                          onMouseEnter={(e) => allowInlineEdit && (e.currentTarget.style.backgroundColor = theme.cellEditHover)}
                          onMouseLeave={(e) => allowInlineEdit && (e.currentTarget.style.backgroundColor = 'transparent')}
                          title={allowInlineEdit ? "Clique para editar" : ""}
                        >
                          {isFieldEditing(ordem.id, 'tipo_veiculo') ? (
                            <Select
                              value={editValues.tipo_veiculo || ""}
                              onValueChange={(value) => {
                                handleFieldChange('tipo_veiculo', value);
                                setTimeout(() => handleSaveField(ordem, 'tipo_veiculo'), 100);
                              }}
                            >
                              <SelectTrigger className="h-6 text-[9px] w-32 border" style={{ backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.text }}>
                                <SelectValue placeholder="Selecione..." />
                              </SelectTrigger>
                              <SelectContent style={{ backgroundColor: theme.cardBg, borderColor: theme.border }}>
                                {tipoVeiculoOptions.map((tipo) => (
                                  <SelectItem key={tipo} value={tipo} className="text-xs" style={{ color: theme.text }}>
                                    {tipo}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          ) : (
                            <span className="text-[9px] font-medium whitespace-nowrap" style={{ color: theme.text }}>
                              {ordem.tipo_veiculo || "-"}
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="py-1 px-2 align-middle text-[10px] font-semibold" style={{ color: theme.text }}>
                          {formatPeso(ordem.peso)}
                        </TableCell>
                        
                        <TableCell 
                          onClick={() => allowInlineEdit && !isFieldEditing(ordem.id, 'motorista_nome_temp') && handleStartEdit(ordem.id, 'motorista_nome_temp', ordem.motorista_nome_temp)}
                          className={`py-1 px-2 align-middle ${allowInlineEdit ? 'cursor-pointer' : ''}`}
                          style={allowInlineEdit ? {
                            transition: 'background-color 0.2s'
                          } : {}}
                          onMouseEnter={(e) => allowInlineEdit && (e.currentTarget.style.backgroundColor = theme.cellEditHover)}
                          onMouseLeave={(e) => allowInlineEdit && (e.currentTarget.style.backgroundColor = 'transparent')}
                          title={allowInlineEdit ? "Clique para editar" : ""}
                        >
                          {isFieldEditing(ordem.id, 'motorista_nome_temp') ? (
                            <Input
                              value={editValues.motorista_nome_temp}
                              onChange={(e) => handleFieldChange('motorista_nome_temp', e.target.value)}
                              onBlur={() => handleBlur(ordem, 'motorista_nome_temp')}
                              onKeyDown={(e) => handleKeyDown(e, ordem, 'motorista_nome_temp')}
                              placeholder="NOME MOTORISTA"
                              className="h-6 text-[10px] w-32 border uppercase"
                              style={{ 
                                backgroundColor: theme.inputBg + ' !important', 
                                borderColor: theme.inputBorder + ' !important', 
                                color: theme.text + ' !important'
                              }}
                              autoFocus
                              disabled={saving}
                            />
                          ) : (
                            motorista || ordem.motorista_nome_temp ? (
                              <div className="flex items-center gap-1">
                                <User className="w-3 h-3 flex-shrink-0" style={{ color: theme.textMuted }} />
                                <span className="text-[10px] font-medium truncate uppercase" style={{ color: theme.text }}>
                                  {motorista ? formatarNomeMotorista(motorista.nome) : ordem.motorista_nome_temp}
                                </span>
                              </div>
                            ) : (
                              <Badge 
                                variant="outline" 
                                className="text-[9px] h-4 px-2 cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900 font-semibold"
                                style={{ 
                                  borderColor: isDark ? '#3b82f6' : '#60a5fa',
                                  color: isDark ? '#60a5fa' : '#2563eb',
                                  minWidth: '52px'
                                }}
                              >
                                Alocar
                              </Badge>
                            )
                          )}
                        </TableCell>
                        
                        <TableCell className="py-1 px-2 align-middle">
                          <div className="flex gap-1 items-center flex-nowrap">
                            <div
                              onClick={() => allowInlineEdit && !isFieldEditing(ordem.id, 'cavalo_placa_temp') && handleStartEdit(ordem.id, 'cavalo_placa_temp', ordem.cavalo_placa_temp)}
                              className={`inline-block ${allowInlineEdit ? 'cursor-pointer rounded px-0.5' : ''}`}
                              style={allowInlineEdit ? {
                                transition: 'background-color 0.2s'
                              } : {}}
                              onMouseEnter={(e) => allowInlineEdit && (e.currentTarget.style.backgroundColor = theme.cellEditHover)}
                              onMouseLeave={(e) => allowInlineEdit && (e.currentTarget.style.backgroundColor = 'transparent')}
                              title={allowInlineEdit ? "Clique para editar cavalo" : ""}
                            >
                              {isFieldEditing(ordem.id, 'cavalo_placa_temp') ? (
                                <Input
                                  value={editValues.cavalo_placa_temp}
                                  onChange={(e) => handleFieldChange('cavalo_placa_temp', e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 7))}
                                  onBlur={() => handleBlur(ordem, 'cavalo_placa_temp')}
                                  onKeyDown={(e) => handleKeyDown(e, ordem, 'cavalo_placa_temp')}
                                  placeholder="Cavalo"
                                  className="h-5 text-[8px] w-16 font-mono border"
                                  style={{ 
                                    backgroundColor: theme.inputBg + ' !important', 
                                    borderColor: theme.inputBorder + ' !important', 
                                    color: theme.text + ' !important'
                                  }}
                                  maxLength={7}
                                  autoFocus
                                  disabled={saving}
                                />
                              ) : (
                                cavalo?.placa || ordem.cavalo_placa_temp ? (
                                  <Badge 
                                    variant="outline" 
                                    className="text-[8px] h-4 px-1.5 font-mono font-bold whitespace-nowrap"
                                    style={{ 
                                      backgroundColor: theme.cardBg, 
                                      borderColor: theme.border,
                                      color: theme.text
                                    }}
                                  >
                                    {cavalo?.placa || ordem.cavalo_placa_temp}
                                  </Badge>
                                ) : (
                                  <Badge 
                                    variant="outline" 
                                    className="text-[8px] h-4 px-1.5 cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900 font-semibold whitespace-nowrap"
                                    style={{ 
                                      borderColor: isDark ? '#3b82f6' : '#60a5fa',
                                      color: isDark ? '#60a5fa' : '#2563eb',
                                      minWidth: '46px'
                                    }}
                                  >
                                    +Cavalo
                                  </Badge>
                                )
                              )}
                            </div>
                            
                            <div
                              onClick={() => allowInlineEdit && !isFieldEditing(ordem.id, 'implemento1_placa_temp') && handleStartEdit(ordem.id, 'implemento1_placa_temp', ordem.implemento1_placa_temp)}
                              className={`inline-block ${allowInlineEdit ? 'cursor-pointer rounded px-0.5' : ''}`}
                              style={allowInlineEdit ? {
                                transition: 'background-color 0.2s'
                              } : {}}
                              onMouseEnter={(e) => allowInlineEdit && (e.currentTarget.style.backgroundColor = theme.cellEditHover)}
                              onMouseLeave={(e) => allowInlineEdit && (e.currentTarget.style.backgroundColor = 'transparent')}
                              title={allowInlineEdit ? "Clique para editar implemento 1" : ""}
                            >
                              {isFieldEditing(ordem.id, 'implemento1_placa_temp') ? (
                                <Input
                                  value={editValues.implemento1_placa_temp}
                                  onChange={(e) => handleFieldChange('implemento1_placa_temp', e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 7))}
                                  onBlur={() => handleBlur(ordem, 'implemento1_placa_temp')}
                                  onKeyDown={(e) => handleKeyDown(e, ordem, 'implemento1_placa_temp')}
                                  placeholder="Impl 1"
                                  className="h-5 text-[8px] w-16 font-mono border"
                                  style={{ 
                                    backgroundColor: theme.inputBg + ' !important', 
                                    borderColor: theme.inputBorder + ' !important', 
                                    color: theme.text + ' !important'
                                  }}
                                  maxLength={7}
                                  autoFocus
                                  disabled={saving}
                                />
                              ) : (
                                implemento1?.placa || ordem.implemento1_placa_temp ? (
                                  <Badge 
                                    variant="outline" 
                                    className="text-[8px] h-4 px-1.5 font-mono font-bold whitespace-nowrap"
                                    style={{ 
                                      backgroundColor: theme.cardBg, 
                                      borderColor: theme.border,
                                      color: theme.text
                                    }}
                                  >
                                    {implemento1?.placa || ordem.implemento1_placa_temp}
                                  </Badge>
                                ) : (
                                  <Badge 
                                    variant="outline" 
                                    className="text-[8px] h-4 px-1.5 cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900 font-semibold whitespace-nowrap"
                                    style={{ 
                                      borderColor: isDark ? '#3b82f6' : '#60a5fa',
                                      color: isDark ? '#60a5fa' : '#2563eb',
                                      minWidth: '42px'
                                    }}
                                  >
                                    +Impl1
                                  </Badge>
                                )
                              )}
                            </div>
                            
                            <div
                              onClick={() => allowInlineEdit && !isFieldEditing(ordem.id, 'implemento2_placa_temp') && handleStartEdit(ordem.id, 'implemento2_placa_temp', ordem.implemento2_placa_temp)}
                              className={`inline-block ${allowInlineEdit ? 'cursor-pointer rounded px-0.5' : ''}`}
                              style={allowInlineEdit ? {
                                transition: 'background-color 0.2s'
                              } : {}}
                              onMouseEnter={(e) => allowInlineEdit && (e.currentTarget.style.backgroundColor = theme.cellEditHover)}
                              onMouseLeave={(e) => allowInlineEdit && (e.currentTarget.style.backgroundColor = 'transparent')}
                              title={allowInlineEdit ? "Clique para editar implemento 2" : ""}
                            >
                              {isFieldEditing(ordem.id, 'implemento2_placa_temp') ? (
                                <Input
                                  value={editValues.implemento2_placa_temp}
                                  onChange={(e) => handleFieldChange('implemento2_placa_temp', e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 7))}
                                  onBlur={() => handleBlur(ordem, 'implemento2_placa_temp')}
                                  onKeyDown={(e) => handleKeyDown(e, ordem, 'implemento2_placa_temp')}
                                  placeholder="Impl 2"
                                  className="h-5 text-[8px] w-16 font-mono border"
                                  style={{ 
                                    backgroundColor: theme.inputBg + ' !important', 
                                    borderColor: theme.inputBorder + ' !important', 
                                    color: theme.text + ' !important'
                                  }}
                                  maxLength={7}
                                  autoFocus
                                  disabled={saving}
                                />
                              ) : (
                                implemento2?.placa || ordem.implemento2_placa_temp ? (
                                  <Badge 
                                    variant="outline" 
                                    className="text-[8px] h-4 px-1.5 font-mono font-bold whitespace-nowrap"
                                    style={{ 
                                      backgroundColor: theme.cardBg, 
                                      borderColor: theme.border,
                                      color: theme.text
                                    }}
                                  >
                                    {implemento2?.placa || ordem.implemento2_placa_temp}
                                  </Badge>
                                ) : (
                                  <Badge 
                                    variant="outline" 
                                    className="text-[8px] h-4 px-1.5 cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900 font-semibold whitespace-nowrap"
                                    style={{ 
                                      borderColor: isDark ? '#3b82f6' : '#60a5fa',
                                      color: isDark ? '#60a5fa' : '#2563eb',
                                      minWidth: '42px'
                                    }}
                                  >
                                    +Impl2
                                  </Badge>
                                )
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell 
                          onClick={() => allowInlineEdit && !isFieldEditing(ordem.id, 'frete_viagem') && handleStartEdit(ordem.id, 'frete_viagem', ordem.frete_viagem)}
                          className={`py-1 px-2 align-middle ${allowInlineEdit ? 'cursor-pointer' : ''}`}
                          style={allowInlineEdit ? {
                            transition: 'background-color 0.2s'
                          } : {}}
                          onMouseEnter={(e) => allowInlineEdit && (e.currentTarget.style.backgroundColor = theme.cellEditHover)}
                          onMouseLeave={(e) => allowInlineEdit && (e.currentTarget.style.backgroundColor = 'transparent')}
                          title={allowInlineEdit ? "Clique para editar frete" : ""}
                        >
                          {isFieldEditing(ordem.id, 'frete_viagem') ? (
                            <Input
                              type="number"
                              step="0.01"
                              value={editValues.frete_viagem || ""}
                              onChange={(e) => handleFieldChange('frete_viagem', e.target.value)}
                              onBlur={() => handleBlur(ordem, 'frete_viagem')}
                              onKeyDown={(e) => handleKeyDown(e, ordem, 'frete_viagem')}
                              placeholder="0,00"
                              className="h-6 text-[10px] w-24 border"
                              style={{ 
                                backgroundColor: theme.inputBg + ' !important', 
                                borderColor: theme.inputBorder + ' !important', 
                                color: theme.text + ' !important'
                              }}
                              autoFocus
                              disabled={saving}
                            />
                          ) : (
                            <span className="text-[10px] font-semibold whitespace-nowrap" style={{ color: isDark ? '#4ade80' : '#16a34a' }}>
                              {formatCurrency(ordem.frete_viagem || ordem.valor_total_frete)}
                            </span>
                          )}
                        </TableCell>
                        <TableCell 
                          onClick={() => allowInlineEdit && !isFieldEditing(ordem.id, 'carregamento_agendamento_data') && handleStartEdit(ordem.id, 'carregamento_agendamento_data', ordem.carregamento_agendamento_data)}
                          className={`py-1 px-2 align-middle ${allowInlineEdit ? 'cursor-pointer' : ''}`}
                          style={allowInlineEdit ? {
                            transition: 'background-color 0.2s'
                          } : {}}
                          onMouseEnter={(e) => allowInlineEdit && (e.currentTarget.style.backgroundColor = theme.cellEditHover)}
                          onMouseLeave={(e) => allowInlineEdit && (e.currentTarget.style.backgroundColor = 'transparent')}
                          title={allowInlineEdit ? "Clique para editar ou pressione 'H' para data/hora atual" : ""}
                        >
                          {isFieldEditing(ordem.id, 'carregamento_agendamento_data') ? (
                            <Input
                              type="datetime-local"
                              value={editValues.carregamento_agendamento_data || getDateTimeLocalValue(ordem.carregamento_agendamento_data)}
                              onChange={(e) => handleFieldChange('carregamento_agendamento_data', e.target.value)}
                              onBlur={() => handleBlur(ordem, 'carregamento_agendamento_data')}
                              onKeyDown={(e) => handleKeyDown(e, ordem, 'carregamento_agendamento_data')}
                              className="h-6 text-[9px] w-32 border"
                              style={{ 
                                backgroundColor: theme.inputBg + ' !important', 
                                borderColor: theme.inputBorder + ' !important', 
                                color: theme.text + ' !important'
                              }}
                              autoFocus
                              disabled={saving}
                            />
                          ) : (
                            <span className="text-[9px] whitespace-nowrap" style={{ color: theme.text }}>
                              {formatDateTime(ordem.carregamento_agendamento_data)}
                            </span>
                          )}
                        </TableCell>
                        <TableCell 
                          onClick={() => allowInlineEdit && !isFieldEditing(ordem.id, 'descarga_agendamento_data') && handleStartEdit(ordem.id, 'descarga_agendamento_data', ordem.descarga_agendamento_data)}
                          className={`py-1 px-2 align-middle ${allowInlineEdit ? 'cursor-pointer' : ''}`}
                          style={allowInlineEdit ? {
                            transition: 'background-color 0.2s'
                          } : {}}
                          onMouseEnter={(e) => allowInlineEdit && (e.currentTarget.style.backgroundColor = theme.cellEditHover)}
                          onMouseLeave={(e) => allowInlineEdit && (e.currentTarget.style.backgroundColor = 'transparent')}
                          title={allowInlineEdit ? "Clique para editar ou pressione 'H' para data/hora atual" : ""}
                        >
                          {isFieldEditing(ordem.id, 'descarga_agendamento_data') ? (
                            <Input
                              type="datetime-local"
                              value={editValues.descarga_agendamento_data || getDateTimeLocalValue(ordem.descarga_agendamento_data)}
                              onChange={(e) => handleFieldChange('descarga_agendamento_data', e.target.value)}
                              onBlur={() => handleBlur(ordem, 'descarga_agendamento_data')}
                              onKeyDown={(e) => handleKeyDown(e, ordem, 'descarga_agendamento_data')}
                              className="h-6 text-[9px] w-32 border"
                              style={{ 
                                backgroundColor: theme.inputBg + ' !important', 
                                borderColor: theme.inputBorder + ' !important', 
                                color: theme.text + ' !important'
                              }}
                              autoFocus
                              disabled={saving}
                            />
                          ) : (
                            <span className="text-[9px] whitespace-nowrap" style={{ color: theme.text }}>
                              {formatDateTime(ordem.descarga_agendamento_data)}
                            </span>
                          )}
                        </TableCell>
                        
                        <TableCell 
                          onClick={() => allowInlineEdit && !isFieldEditing(ordem.id, 'observacao_carga') && handleStartEdit(ordem.id, 'observacao_carga', ordem.observacao_carga)}
                          className={`py-1 px-2 align-middle ${allowInlineEdit ? 'cursor-pointer' : ''}`}
                          style={allowInlineEdit ? {
                            transition: 'background-color 0.2s'
                          } : {}}
                          onMouseEnter={(e) => allowInlineEdit && (e.currentTarget.style.backgroundColor = theme.cellEditHover)}
                          onMouseLeave={(e) => allowInlineEdit && (e.currentTarget.style.backgroundColor = 'transparent')}
                          title={allowInlineEdit ? "Clique para editar observações" : ""}
                        >
                          {isFieldEditing(ordem.id, 'observacao_carga') ? (
                            <Input
                              value={editValues.observacao_carga || ""}
                              onChange={(e) => handleFieldChange('observacao_carga', e.target.value)}
                              onBlur={() => handleBlur(ordem, 'observacao_carga')}
                              onKeyDown={(e) => handleKeyDown(e, ordem, 'observacao_carga')}
                              placeholder="Observações..."
                              className="h-6 text-[9px] w-48 border"
                              style={{ 
                                backgroundColor: theme.inputBg + ' !important', 
                                borderColor: theme.inputBorder + ' !important', 
                                color: theme.text + ' !important'
                              }}
                              autoFocus
                              disabled={saving}
                            />
                          ) : (
                            <span className="text-[9px] truncate block max-w-[180px]" style={{ color: theme.text }} title={ordem.observacao_carga || ""}>
                              {ordem.observacao_carga || "-"}
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="py-1 px-2 align-middle text-right sticky right-0" style={{ backgroundColor: idx % 2 === 0 ? theme.rowBg : theme.rowBgAlt, borderLeft: `1px solid ${theme.border}` }}>
                          <div className="flex items-center justify-end gap-0.5">
                            {/* Desktop: Mostrar todos os botões */}
                            <div className="hidden lg:flex items-center gap-0.5">
                              {tipoRegistro === "oferta" && (
                                <ExportarOfertaIndividual ordem={ordem} />
                              )}
                              {onConferencia && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => onConferencia(ordem)}
                                  className="h-6 w-6 p-0"
                                  style={{ color: '#3b82f6' }}
                                  title="Conferência de Volumes"
                                >
                                  <Scan className="w-3.5 h-3.5" />
                                </Button>
                              )}
                              {onEnderecamento && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => onEnderecamento(ordem)}
                                  className="h-6 w-6 p-0"
                                  style={{ color: '#9333ea' }}
                                  title="Endereçamento de Veículo"
                                >
                                  <Grid3x3 className="w-3.5 h-3.5" />
                                </Button>
                              )}
                              {onCriarOrdemFilha && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => onCriarOrdemFilha(ordem)}
                                  className="h-6 w-6 p-0"
                                  style={{ color: '#10b981' }}
                                  title="Criar Ordem Filha"
                                >
                                  <GitBranch className="w-3.5 h-3.5" />
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setSelectedOrdem(ordem);
                                  setShowImpressao(true);
                                }}
                                className="h-6 w-6 p-0"
                                style={{ color: theme.textMuted }}
                                title="Imprimir Ordem"
                              >
                                <Printer className="w-3.5 h-3.5" />
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
                                title="Editar Completo"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onDelete(ordem)}
                                className="h-6 w-6 p-0 hover:bg-red-50 dark:hover:bg-red-950"
                                style={{ color: theme.textMuted }}
                                title="Excluir Ordem"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            </div>

                            {/* Mobile/Tablet: Botão de ações + botões fixos */}
                            <div className="flex lg:hidden items-center justify-end gap-1">
                              {/* Ícone de oferta - à esquerda para não desalinhar os botões fixos */}
                              {tipoRegistro === "oferta" && (
                                <div className="mr-auto">
                                  <ExportarOfertaIndividual ordem={ordem} />
                                </div>
                              )}

                              {/* Dropdown com ações principais */}
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-7 w-7 p-0 rounded-lg"
                                    style={{ borderColor: '#3b82f6', backgroundColor: 'transparent' }}
                                    title="Ações"
                                  >
                                    <Zap className="w-4 h-4" style={{ color: '#3b82f6' }} />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" style={{ backgroundColor: theme.cardBg, borderColor: theme.border }}>
                                  {onCriarOrdemFilha && (
                                    <DropdownMenuItem onClick={() => onCriarOrdemFilha(ordem)} style={{ color: theme.text }}>
                                      <GitBranch className="w-4 h-4 mr-2 text-green-600" />
                                      Ordem Filha
                                    </DropdownMenuItem>
                                  )}
                                  {onConferencia && (
                                    <DropdownMenuItem onClick={() => onConferencia(ordem)} style={{ color: theme.text }}>
                                      <Scan className="w-4 h-4 mr-2 text-blue-600" />
                                      Conferência
                                    </DropdownMenuItem>
                                  )}
                                  {onEnderecamento && (
                                    <DropdownMenuItem onClick={() => onEnderecamento(ordem)} style={{ color: theme.text }}>
                                      <Grid3x3 className="w-4 h-4 mr-2 text-purple-600" />
                                      Endereçamento
                                    </DropdownMenuItem>
                                  )}
                                </DropdownMenuContent>
                              </DropdownMenu>

                              {/* Botões fixos sempre visíveis - alinhados à direita */}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setSelectedOrdem(ordem);
                                  setShowImpressao(true);
                                }}
                                className="h-7 w-7 p-0 flex items-center justify-center"
                                style={{ color: theme.textMuted }}
                                title="Imprimir"
                              >
                                <Printer className="w-3.5 h-3.5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onViewDetails(ordem)}
                                className="h-7 w-7 p-0 flex items-center justify-center"
                                style={{ color: theme.textMuted }}
                                title="Detalhes"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onEdit(ordem)}
                                className="h-7 w-7 p-0 flex items-center justify-center"
                                style={{ color: theme.textMuted }}
                                title="Editar"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onDelete(ordem)}
                                className="h-7 w-7 p-0 flex items-center justify-center hover:bg-red-50 dark:hover:bg-red-950"
                                style={{ color: theme.textMuted }}
                                title="Excluir"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            </div>
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

      {showImpressao && selectedOrdem && (
        <ImpressaoOrdem
          open={showImpressao}
          onClose={() => {
            setShowImpressao(false);
            setSelectedOrdem(null);
          }}
          ordem={selectedOrdem}
          motoristas={motoristas}
          veiculos={veiculos}
        />
      )}
    </>
  );
}