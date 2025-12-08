import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Package,
  Workflow,
  AlertTriangle,
  Trash2,
  Loader2,
  XCircle,
  TrendingDown,
  TrendingUp,
  CheckCircle,
  Clock
} from "lucide-react";
import { format, differenceInHours } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";

export default function DetalhesMetricaSLA({ open, onClose, metrica, onUpdate, isDark }) {
  const [loading, setLoading] = useState(true);
  const [ordens, setOrdens] = useState([]);
  const [etapas, setEtapas] = useState([]);
  const [ocorrencias, setOcorrencias] = useState([]);
  const [registrosExpurgados, setRegistrosExpurgados] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [showExpurgeDialog, setShowExpurgeDialog] = useState(false);
  const [registroToExpurge, setRegistroToExpurge] = useState(null);
  const [justificativa, setJustificativa] = useState("");
  const [expurging, setExpurging] = useState(false);

  useEffect(() => {
    if (open && metrica) {
      loadDetalhes();
    }
  }, [open, metrica]);

  const loadDetalhes = async () => {
    setLoading(true);
    try {
      const mesAtual = metrica.mes_referencia;
      const [inicioMes, fimMes] = [
        new Date(`${mesAtual}-01`),
        new Date(new Date(`${mesAtual}-01`).getFullYear(), new Date(`${mesAtual}-01`).getMonth() + 1, 0)
      ];

      const [
        todasOrdens,
        todasEtapas,
        todasOcorrencias,
        todosUsuarios,
        allEtapasConfig,
        tiposOcorrencia,
        expurgados
      ] = await Promise.all([
        base44.entities.OrdemDeCarregamento.list(),
        base44.entities.OrdemEtapa.list(),
        base44.entities.Ocorrencia.list(),
        base44.entities.User.list(),
        base44.entities.Etapa.list(),
        base44.entities.TipoOcorrencia.list(),
        base44.entities.RegistroSLAExpurgado.filter({ metrica_mensal_id: metrica.id })
      ]);

      setUsuarios(todosUsuarios);
      setRegistrosExpurgados(expurgados);

      const usuario = todosUsuarios.find(u => u.id === metrica.user_id);

      // Filtrar ordens criadas pelo usuário no mês
      const ordensUsuario = todasOrdens.filter(o => {
        const dataSolicitacao = o.data_solicitacao ? new Date(o.data_solicitacao) : null;
        return o.created_by === usuario?.email && dataSolicitacao &&
               dataSolicitacao >= inicioMes && dataSolicitacao <= fimMes;
      });

      // Filtrar etapas concluídas pelo usuário no mês
      const etapasUsuario = todasEtapas.filter(oe => {
        const dataConclusao = oe.data_conclusao ? new Date(oe.data_conclusao) : null;
        return oe.responsavel_id === metrica.user_id && dataConclusao &&
               dataConclusao >= inicioMes && dataConclusao <= fimMes;
      });

      // Filtrar ocorrências do usuário no mês
      const ocorrenciasUsuario = todasOcorrencias.filter(o => {
        const dataOcorrencia = new Date(o.data_inicio);
        return (o.responsavel_id === metrica.user_id || o.registrado_por === metrica.user_id) &&
               dataOcorrencia >= inicioMes && dataOcorrencia <= fimMes;
      });

      // Enriquecer dados com informações de impacto
      const ordensComImpacto = ordensUsuario.map(ordem => ({
        ...ordem,
        tipo: 'ordem',
        impacto: 10, // pontos por ordem
        categoria: 'produtividade'
      }));

      const etapasComImpacto = etapasUsuario.map(oe => {
        const etapaConfig = allEtapasConfig.find(e => e.id === oe.etapa_id);
        let impacto = 5; // pontos base por etapa

        if (oe.data_inicio && oe.data_conclusao && etapaConfig) {
          const prazoTotal = (etapaConfig.prazo_dias || 0) * 24 + (etapaConfig.prazo_horas || 0) + ((etapaConfig.prazo_minutos || 0) / 60);
          if (prazoTotal > 0) {
            const horasUsadas = differenceInHours(new Date(oe.data_conclusao), new Date(oe.data_inicio));
            if (horasUsadas <= prazoTotal) {
              impacto += 3; // bônus por estar no prazo
            }
          }
        }

        return {
          ...oe,
          tipo: 'etapa',
          etapaConfig,
          impacto,
          categoria: 'produtividade'
        };
      });

      const ocorrenciasComImpacto = ocorrenciasUsuario.map(ocorrencia => {
        let impacto = 0;
        
        // Impacto negativo baseado na gravidade
        const impactosGravidade = {
          baixa: -5,
          media: -10,
          alta: -20,
          critica: -40
        };
        impacto = impactosGravidade[ocorrencia.gravidade] || -10;

        // Penalidade adicional por atraso
        if (ocorrencia.status === 'resolvida' && ocorrencia.data_fim) {
          const tipo = tiposOcorrencia.find(t => t.id === ocorrencia.tipo_ocorrencia_id);
          if (tipo?.prazo_sla_horas) {
            const horasResolucao = differenceInHours(new Date(ocorrencia.data_fim), new Date(ocorrencia.data_inicio));
            if (horasResolucao > tipo.prazo_sla_horas) {
              impacto -= 15; // penalidade por atraso
            }
          }
        }

        return {
          ...ocorrencia,
          tipo: 'ocorrencia',
          impacto,
          categoria: 'qualidade'
        };
      });

      setOrdens(ordensComImpacto);
      setEtapas(etapasComImpacto);
      setOcorrencias(ocorrenciasComImpacto);

    } catch (error) {
      console.error("Erro ao carregar detalhes:", error);
      toast.error("Erro ao carregar detalhes da métrica");
    } finally {
      setLoading(false);
    }
  };

  const handleExpurgeRegistro = (registro) => {
    setRegistroToExpurge(registro);
    setJustificativa("");
    setShowExpurgeDialog(true);
  };

  const confirmExpurge = async () => {
    if (!justificativa.trim() || justificativa.trim().length < 10) {
      toast.error("Justificativa deve ter no mínimo 10 caracteres");
      return;
    }

    setExpurging(true);
    try {
      const currentUser = await base44.auth.me();
      const responsavel = usuarios.find(u => u.id === metrica.user_id);

      let descricao = "";
      if (registroToExpurge.tipo === 'ordem') {
        descricao = `Ordem ${registroToExpurge.numero_carga || registroToExpurge.id.slice(-6)} - ${registroToExpurge.cliente}`;
      } else if (registroToExpurge.tipo === 'etapa') {
        descricao = `Etapa ${registroToExpurge.etapaConfig?.nome || 'N/A'}`;
      } else if (registroToExpurge.tipo === 'ocorrencia') {
        descricao = `Ocorrência ${registroToExpurge.tipo} - Gravidade ${registroToExpurge.gravidade}`;
      }

      await base44.entities.RegistroSLAExpurgado.create({
        metrica_mensal_id: metrica.id,
        user_id: metrica.user_id,
        tipo_registro: registroToExpurge.tipo,
        registro_id: registroToExpurge.id,
        responsavel_nome: responsavel?.full_name || 'N/A',
        descricao,
        impacto_pontos: registroToExpurge.impacto,
        categoria_impacto: registroToExpurge.categoria,
        justificativa,
        data_expurgo: new Date().toISOString(),
        expurgado_por: currentUser.id,
        dados_originais: JSON.stringify(registroToExpurge)
      });

      toast.success("Registro expurgado com sucesso! O SLA será recalculado.");
      
      setShowExpurgeDialog(false);
      setRegistroToExpurge(null);
      setJustificativa("");
      
      await loadDetalhes();
      onUpdate();

    } catch (error) {
      console.error("Erro ao expurgar registro:", error);
      toast.error("Erro ao expurgar registro");
    } finally {
      setExpurging(false);
    }
  };

  const isExpurgado = (registroId) => {
    return registrosExpurgados.some(r => r.registro_id === registroId);
  };

  const theme = {
    bg: isDark ? '#0f172a' : '#f9fafb',
    cardBg: isDark ? '#1e293b' : '#ffffff',
    cardBorder: isDark ? '#334155' : '#e5e7eb',
    text: isDark ? '#f1f5f9' : '#111827',
    textMuted: isDark ? '#94a3b8' : '#6b7280',
  };

  if (!metrica) return null;

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto" style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}>
          <DialogHeader>
            <DialogTitle style={{ color: theme.text }}>
              Detalhamento do SLA - {format(new Date(`${metrica.mes_referencia}-01`), "MMMM yyyy", { locale: ptBR })}
            </DialogTitle>
            <DialogDescription style={{ color: theme.textMuted }}>
              Todos os registros que impactaram o SLA deste período
            </DialogDescription>
          </DialogHeader>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <Card style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}>
                  <CardContent className="p-4">
                    <div className="text-center">
                      <p className="text-3xl font-bold" style={{ color: theme.text }}>
                        {metrica.sla_final?.toFixed(1)}%
                      </p>
                      <p className="text-xs mt-1" style={{ color: theme.textMuted }}>SLA Final</p>
                    </div>
                  </CardContent>
                </Card>

                <Card style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}>
                  <CardContent className="p-4">
                    <div className="text-center">
                      <p className="text-3xl font-bold text-green-600">
                        {metrica.pontos_qualidade?.toFixed(1)}
                      </p>
                      <p className="text-xs mt-1" style={{ color: theme.textMuted }}>Pontos Qualidade</p>
                    </div>
                  </CardContent>
                </Card>

                <Card style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}>
                  <CardContent className="p-4">
                    <div className="text-center">
                      <p className="text-3xl font-bold text-blue-600">
                        {metrica.pontos_produtividade?.toFixed(1)}
                      </p>
                      <p className="text-xs mt-1" style={{ color: theme.textMuted }}>Pontos Produtividade</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Tabs defaultValue="ordens" className="w-full">
                <TabsList style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}>
                  <TabsTrigger value="ordens">
                    <Package className="w-4 h-4 mr-2" />
                    Ordens ({ordens.length})
                  </TabsTrigger>
                  <TabsTrigger value="etapas">
                    <Workflow className="w-4 h-4 mr-2" />
                    Etapas ({etapas.length})
                  </TabsTrigger>
                  <TabsTrigger value="ocorrencias">
                    <AlertTriangle className="w-4 h-4 mr-2" />
                    Ocorrências ({ocorrencias.length})
                  </TabsTrigger>
                  <TabsTrigger value="expurgados">
                    <XCircle className="w-4 h-4 mr-2" />
                    Expurgados ({registrosExpurgados.length})
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="ordens" className="mt-4">
                  <div className="rounded-lg border" style={{ borderColor: theme.cardBorder }}>
                    <Table>
                      <TableHeader>
                        <TableRow style={{ borderBottomColor: theme.cardBorder }}>
                          <TableHead style={{ color: theme.textMuted }}>Status</TableHead>
                          <TableHead style={{ color: theme.textMuted }}>Número</TableHead>
                          <TableHead style={{ color: theme.textMuted }}>Cliente</TableHead>
                          <TableHead style={{ color: theme.textMuted }}>Origem → Destino</TableHead>
                          <TableHead style={{ color: theme.textMuted }}>Data</TableHead>
                          <TableHead style={{ color: theme.textMuted }}>Impacto</TableHead>
                          <TableHead style={{ color: theme.textMuted }} className="text-right">Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {ordens.map((ordem) => {
                          const expurgado = isExpurgado(ordem.id);
                          return (
                            <TableRow 
                              key={ordem.id} 
                              style={{ 
                                borderBottomColor: theme.cardBorder,
                                backgroundColor: expurgado ? (isDark ? 'rgba(239, 68, 68, 0.1)' : 'rgba(254, 226, 226, 1)') : 'transparent'
                              }}
                            >
                              <TableCell>
                                {expurgado ? (
                                  <Badge className="bg-red-600 text-white text-xs">
                                    <XCircle className="w-3 h-3 mr-1" />
                                    Expurgado
                                  </Badge>
                                ) : (
                                  <Badge className="bg-green-600 text-white text-xs">
                                    <CheckCircle className="w-3 h-3 mr-1" />
                                    Válido
                                  </Badge>
                                )}
                              </TableCell>
                              <TableCell style={{ color: theme.text }} className="font-medium">
                                {ordem.numero_carga || `#${ordem.id.slice(-6)}`}
                              </TableCell>
                              <TableCell style={{ color: theme.text }}>{ordem.cliente}</TableCell>
                              <TableCell style={{ color: theme.textMuted }} className="text-xs">
                                {ordem.origem} → {ordem.destino}
                              </TableCell>
                              <TableCell style={{ color: theme.text }}>
                                {format(new Date(ordem.data_solicitacao), "dd/MM/yyyy", { locale: ptBR })}
                              </TableCell>
                              <TableCell>
                                <Badge className="bg-blue-600 text-white">
                                  <TrendingUp className="w-3 h-3 mr-1" />
                                  +{ordem.impacto} pts
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right">
                                {!expurgado && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleExpurgeRegistro(ordem)}
                                    className="text-red-600 hover:text-red-700"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                )}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                </TabsContent>

                <TabsContent value="etapas" className="mt-4">
                  <div className="rounded-lg border" style={{ borderColor: theme.cardBorder }}>
                    <Table>
                      <TableHeader>
                        <TableRow style={{ borderBottomColor: theme.cardBorder }}>
                          <TableHead style={{ color: theme.textMuted }}>Status</TableHead>
                          <TableHead style={{ color: theme.textMuted }}>Etapa</TableHead>
                          <TableHead style={{ color: theme.textMuted }}>Data Início</TableHead>
                          <TableHead style={{ color: theme.textMuted }}>Data Conclusão</TableHead>
                          <TableHead style={{ color: theme.textMuted }}>Prazo</TableHead>
                          <TableHead style={{ color: theme.textMuted }}>Impacto</TableHead>
                          <TableHead style={{ color: theme.textMuted }} className="text-right">Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {etapas.map((etapa) => {
                          const expurgado = isExpurgado(etapa.id);
                          const noPrazo = etapa.impacto > 5;
                          
                          return (
                            <TableRow 
                              key={etapa.id}
                              style={{ 
                                borderBottomColor: theme.cardBorder,
                                backgroundColor: expurgado ? (isDark ? 'rgba(239, 68, 68, 0.1)' : 'rgba(254, 226, 226, 1)') : 'transparent'
                              }}
                            >
                              <TableCell>
                                {expurgado ? (
                                  <Badge className="bg-red-600 text-white text-xs">
                                    <XCircle className="w-3 h-3 mr-1" />
                                    Expurgado
                                  </Badge>
                                ) : (
                                  <Badge className="bg-green-600 text-white text-xs">
                                    <CheckCircle className="w-3 h-3 mr-1" />
                                    Válido
                                  </Badge>
                                )}
                              </TableCell>
                              <TableCell style={{ color: theme.text }} className="font-medium">
                                {etapa.etapaConfig?.nome || 'N/A'}
                              </TableCell>
                              <TableCell style={{ color: theme.text }}>
                                {etapa.data_inicio ? format(new Date(etapa.data_inicio), "dd/MM/yyyy HH:mm", { locale: ptBR }) : '-'}
                              </TableCell>
                              <TableCell style={{ color: theme.text }}>
                                {etapa.data_conclusao ? format(new Date(etapa.data_conclusao), "dd/MM/yyyy HH:mm", { locale: ptBR }) : '-'}
                              </TableCell>
                              <TableCell>
                                {noPrazo ? (
                                  <Badge className="bg-green-600 text-white text-xs">
                                    <Clock className="w-3 h-3 mr-1" />
                                    No prazo
                                  </Badge>
                                ) : (
                                  <Badge className="bg-orange-600 text-white text-xs">
                                    <AlertTriangle className="w-3 h-3 mr-1" />
                                    Atrasada
                                  </Badge>
                                )}
                              </TableCell>
                              <TableCell>
                                <Badge className="bg-blue-600 text-white">
                                  <TrendingUp className="w-3 h-3 mr-1" />
                                  +{etapa.impacto} pts
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right">
                                {!expurgado && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleExpurgeRegistro(etapa)}
                                    className="text-red-600 hover:text-red-700"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                )}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                </TabsContent>

                <TabsContent value="ocorrencias" className="mt-4">
                  <div className="rounded-lg border" style={{ borderColor: theme.cardBorder }}>
                    <Table>
                      <TableHeader>
                        <TableRow style={{ borderBottomColor: theme.cardBorder }}>
                          <TableHead style={{ color: theme.textMuted }}>Status</TableHead>
                          <TableHead style={{ color: theme.textMuted }}>Tipo</TableHead>
                          <TableHead style={{ color: theme.textMuted }}>Gravidade</TableHead>
                          <TableHead style={{ color: theme.textMuted }}>Data Início</TableHead>
                          <TableHead style={{ color: theme.textMuted }}>Status Atual</TableHead>
                          <TableHead style={{ color: theme.textMuted }}>Impacto</TableHead>
                          <TableHead style={{ color: theme.textMuted }} className="text-right">Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {ocorrencias.map((ocorrencia) => {
                          const expurgado = isExpurgado(ocorrencia.id);
                          
                          return (
                            <TableRow 
                              key={ocorrencia.id}
                              style={{ 
                                borderBottomColor: theme.cardBorder,
                                backgroundColor: expurgado ? (isDark ? 'rgba(239, 68, 68, 0.1)' : 'rgba(254, 226, 226, 1)') : 'transparent'
                              }}
                            >
                              <TableCell>
                                {expurgado ? (
                                  <Badge className="bg-red-600 text-white text-xs">
                                    <XCircle className="w-3 h-3 mr-1" />
                                    Expurgado
                                  </Badge>
                                ) : (
                                  <Badge className="bg-green-600 text-white text-xs">
                                    <CheckCircle className="w-3 h-3 mr-1" />
                                    Válido
                                  </Badge>
                                )}
                              </TableCell>
                              <TableCell style={{ color: theme.text }} className="font-medium">
                                {ocorrencia.tipo}
                              </TableCell>
                              <TableCell>
                                <Badge className={
                                  ocorrencia.gravidade === 'critica' ? 'bg-red-600 text-white' :
                                  ocorrencia.gravidade === 'alta' ? 'bg-orange-600 text-white' :
                                  ocorrencia.gravidade === 'media' ? 'bg-yellow-600 text-white' :
                                  'bg-blue-600 text-white'
                                }>
                                  {ocorrencia.gravidade}
                                </Badge>
                              </TableCell>
                              <TableCell style={{ color: theme.text }}>
                                {format(new Date(ocorrencia.data_inicio), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline">
                                  {ocorrencia.status}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Badge className="bg-red-600 text-white">
                                  <TrendingDown className="w-3 h-3 mr-1" />
                                  {ocorrencia.impacto} pts
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right">
                                {!expurgado && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleExpurgeRegistro(ocorrencia)}
                                    className="text-red-600 hover:text-red-700"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                )}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                </TabsContent>

                <TabsContent value="expurgados" className="mt-4">
                  <div className="rounded-lg border" style={{ borderColor: theme.cardBorder }}>
                    <Table>
                      <TableHeader>
                        <TableRow style={{ borderBottomColor: theme.cardBorder }}>
                          <TableHead style={{ color: theme.textMuted }}>Tipo</TableHead>
                          <TableHead style={{ color: theme.textMuted }}>Descrição</TableHead>
                          <TableHead style={{ color: theme.textMuted }}>Impacto</TableHead>
                          <TableHead style={{ color: theme.textMuted }}>Justificativa</TableHead>
                          <TableHead style={{ color: theme.textMuted }}>Data Expurgo</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {registrosExpurgados.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={5} className="text-center py-8" style={{ color: theme.textMuted }}>
                              Nenhum registro expurgado
                            </TableCell>
                          </TableRow>
                        ) : (
                          registrosExpurgados.map((registro) => (
                            <TableRow key={registro.id} style={{ borderBottomColor: theme.cardBorder }}>
                              <TableCell>
                                <Badge variant="outline">
                                  {registro.tipo_registro}
                                </Badge>
                              </TableCell>
                              <TableCell style={{ color: theme.text }}>
                                {registro.descricao}
                              </TableCell>
                              <TableCell>
                                <Badge className={registro.impacto_pontos > 0 ? "bg-blue-600 text-white" : "bg-red-600 text-white"}>
                                  {registro.impacto_pontos > 0 ? '+' : ''}{registro.impacto_pontos} pts
                                </Badge>
                              </TableCell>
                              <TableCell style={{ color: theme.textMuted }} className="text-xs max-w-xs truncate">
                                {registro.justificativa}
                              </TableCell>
                              <TableCell style={{ color: theme.text }}>
                                {format(new Date(registro.data_expurgo), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog de confirmação de expurgo */}
      <Dialog open={showExpurgeDialog} onOpenChange={setShowExpurgeDialog}>
        <DialogContent style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}>
          <DialogHeader>
            <DialogTitle style={{ color: theme.text }}>
              Expurgar Registro do SLA
            </DialogTitle>
            <DialogDescription style={{ color: theme.textMuted }}>
              Este registro não será mais considerado no cálculo do SLA
            </DialogDescription>
          </DialogHeader>

          {registroToExpurge && (
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800">
                <p className="text-sm font-semibold mb-2" style={{ color: theme.text }}>
                  Tipo: {registroToExpurge.tipo}
                </p>
                <p className="text-sm" style={{ color: theme.textMuted }}>
                  Impacto: <span className="font-bold">{registroToExpurge.impacto > 0 ? '+' : ''}{registroToExpurge.impacto} pontos</span>
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="justificativa-registro" style={{ color: theme.text }}>
                  Justificativa * <span className="text-red-600">(mínimo 10 caracteres)</span>
                </Label>
                <Textarea
                  id="justificativa-registro"
                  value={justificativa}
                  onChange={(e) => setJustificativa(e.target.value)}
                  placeholder="Informe o motivo para expurgar este registro..."
                  rows={4}
                  style={{ backgroundColor: theme.bg, borderColor: theme.cardBorder, color: theme.text }}
                />
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setShowExpurgeDialog(false);
                setRegistroToExpurge(null);
                setJustificativa("");
              }}
              disabled={expurging}
            >
              Cancelar
            </Button>
            <Button
              onClick={confirmExpurge}
              disabled={expurging || justificativa.trim().length < 10}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {expurging ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Expurgando...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Confirmar Expurgo
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}