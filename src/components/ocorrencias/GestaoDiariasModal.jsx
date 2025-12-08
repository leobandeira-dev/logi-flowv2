import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { DollarSign, CheckCircle, XCircle, Truck, Package, Calendar, Search, Zap, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function GestaoDiariasModal({ open, onClose, onUpdate }) {
  const [isDark, setIsDark] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [diarias, setDiarias] = useState([]);
  const [ordens, setOrdens] = useState([]);
  const [selectedDiarias, setSelectedDiarias] = useState([]);
  const [abaAtiva, setAbaAtiva] = useState("pendentes_valor");
  const [showAutorizacaoModal, setShowAutorizacaoModal] = useState(false);
  const [showAbonoModal, setShowAbonoModal] = useState(false);
  const [autorizacaoData, setAutorizacaoData] = useState({
    numero_autorizacao: "",
    valor_total: 0
  });
  const [abonoData, setAbonoData] = useState({
    motivo: ""
  });
  const [operacoes, setOperacoes] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filtroOperacao, setFiltroOperacao] = useState("todos");
  const [filtroTipoDiaria, setFiltroTipoDiaria] = useState("todos");
  const [showDefinirValorModal, setShowDefinirValorModal] = useState(false);
  const [valorEmLoteData, setValorEmLoteData] = useState({
    tipo_calculo: "por_dia",
    valor: 0
  });
  const [ordensPendentesGeracao, setOrdensPendentesGeracao] = useState([]);
  const [ordensParaGerar, setOrdensParaGerar] = useState([]);
  const [loadingPendentes, setLoadingPendentes] = useState(false);
  const [gerandoOcorrencias, setGerandoOcorrencias] = useState(false);
  const [ocorrenciasComCampos, setOcorrenciasComCampos] = useState([]);
  const [camposTipos, setCamposTipos] = useState([]);
  const [camposPreenchidos, setCamposPreenchidos] = useState([]);

  useEffect(() => {
    const checkDarkMode = () => {
      setIsDark(document.documentElement.classList.contains('dark'));
    };
    checkDarkMode();
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (open) {
      loadDiarias();
      if (abaAtiva === "gerar") {
        loadOrdensPendentes();
      }
    }
  }, [open]);

  useEffect(() => {
    if (abaAtiva === "gerar" && open) {
      loadOrdensPendentes();
    } else if (abaAtiva === "evidencias" && open) {
      loadEvidenciasPendentes();
    }
  }, [abaAtiva]);

  const loadDiarias = async () => {
    setLoading(true);
    try {
      // Buscar todas as ocorrências de diária
      const ocorrenciasData = await base44.entities.Ocorrencia.filter(
        { categoria: "diaria" },
        "-data_inicio"
      );
      
      // Buscar ordens relacionadas (usando filter com $in para evitar rate limit)
      const ordensIds = [...new Set(ocorrenciasData.map(d => d.ordem_id).filter(Boolean))];
      const ordensData = ordensIds.length > 0 
        ? await base44.entities.OrdemDeCarregamento.filter({ id: { $in: ordensIds } })
        : [];
      
      // Buscar operações
      const operacoesData = await base44.entities.Operacao.list();
      
      setDiarias(ocorrenciasData);
      setOrdens(ordensData);
      setOperacoes(operacoesData);
    } catch (error) {
      console.error("Erro ao carregar diárias:", error);
      toast.error("Erro ao carregar diárias");
    } finally {
      setLoading(false);
    }
  };

  const handleDefinirValor = async (diariaId, valor) => {
    try {
      await base44.entities.Ocorrencia.update(diariaId, {
        valor_diaria_sugerido: parseFloat(valor),
        status_cobranca: "pendente_autorizacao"
      });
      
      // Atualizar localmente sem recarregar
      setDiarias(prev => prev.map(d => 
        d.id === diariaId 
          ? { ...d, valor_diaria_sugerido: parseFloat(valor), status_cobranca: "pendente_autorizacao" }
          : d
      ));
      
      toast.success("Valor definido!");
    } catch (error) {
      console.error("Erro ao definir valor:", error);
      toast.error("Erro ao definir valor");
    }
  };

  const handleAutorizar = async () => {
    if (selectedDiarias.length === 0) {
      toast.error("Selecione ao menos uma diária");
      return;
    }

    if (!autorizacaoData.numero_autorizacao.trim()) {
      toast.error("Informe o número da autorização");
      return;
    }

    const valorTotal = selectedDiarias.reduce((sum, id) => {
      const diaria = diarias.find(d => d.id === id);
      return sum + (diaria?.valor_diaria_sugerido || 0);
    }, 0);

    if (autorizacaoData.valor_total <= 0) {
      toast.error("Informe um valor válido");
      return;
    }

    setSaving(true);
    try {
      const user = await base44.auth.me();
      const valorPorDiaria = autorizacaoData.valor_total / selectedDiarias.length;

      for (const diariaId of selectedDiarias) {
        await base44.entities.Ocorrencia.update(diariaId, {
          numero_autorizacao_cliente: autorizacaoData.numero_autorizacao,
          valor_diaria_autorizado: valorPorDiaria,
          status_cobranca: "autorizado_faturamento",
          data_autorizacao: new Date().toISOString(),
          autorizado_por: user.id,
          status: "resolvida",
          data_fim: new Date().toISOString()
        });
      }

      // Atualizar localmente sem recarregar
      setDiarias(prev => prev.map(d => 
        selectedDiarias.includes(d.id)
          ? {
              ...d,
              numero_autorizacao_cliente: autorizacaoData.numero_autorizacao,
              valor_diaria_autorizado: valorPorDiaria,
              status_cobranca: "autorizado_faturamento",
              data_autorizacao: new Date().toISOString(),
              autorizado_por: user.id,
              status: "resolvida",
              data_fim: new Date().toISOString()
            }
          : d
      ));
      
      toast.success(`${selectedDiarias.length} diária(s) autorizada(s)!`);
      setShowAutorizacaoModal(false);
      setSelectedDiarias([]);
      setAutorizacaoData({ numero_autorizacao: "", valor_total: 0 });
      onUpdate();
    } catch (error) {
      console.error("Erro ao autorizar diárias:", error);
      toast.error("Erro ao autorizar diárias");
    } finally {
      setSaving(false);
    }
  };

  const handleAbonar = async () => {
    if (selectedDiarias.length === 0) {
      toast.error("Selecione ao menos uma diária");
      return;
    }

    if (!abonoData.motivo.trim()) {
      toast.error("Informe o motivo do abono");
      return;
    }

    setSaving(true);
    try {
      const user = await base44.auth.me();

      for (const diariaId of selectedDiarias) {
        const diaria = diarias.find(d => d.id === diariaId);
        await base44.entities.Ocorrencia.update(diariaId, {
          status_cobranca: "abonado",
          motivo_abono: abonoData.motivo,
          status: "resolvida",
          data_fim: new Date().toISOString(),
          resolvido_por: user.id,
          observacoes: `${diaria?.observacoes}\n\n--- ABONADA ---\n${abonoData.motivo}`
        });
      }

      // Atualizar localmente sem recarregar
      setDiarias(prev => prev.map(d => 
        selectedDiarias.includes(d.id)
          ? {
              ...d,
              status_cobranca: "abonado",
              motivo_abono: abonoData.motivo,
              status: "resolvida",
              data_fim: new Date().toISOString(),
              resolvido_por: user.id,
              observacoes: `${d.observacoes}\n\n--- ABONADA ---\n${abonoData.motivo}`
            }
          : d
      ));
      
      toast.success(`${selectedDiarias.length} diária(s) abonada(s)!`);
      setShowAbonoModal(false);
      setSelectedDiarias([]);
      setAbonoData({ motivo: "" });
      onUpdate();
    } catch (error) {
      console.error("Erro ao abonar diárias:", error);
      toast.error("Erro ao abonar diárias");
    } finally {
      setSaving(false);
    }
  };

  const toggleDiaria = (diariaId) => {
    setSelectedDiarias(prev => 
      prev.includes(diariaId) 
        ? prev.filter(id => id !== diariaId)
        : [...prev, diariaId]
    );
  };

  const loadOrdensPendentes = async () => {
    setLoadingPendentes(true);
    try {
      // Buscar todas as ordens não finalizadas
      const todasOrdens = await base44.entities.OrdemDeCarregamento.filter({
        status: { $nin: ["finalizado", "cancelado"] }
      }, "-data_solicitacao", 500);

      // Buscar operações para pegar tolerância
      const operacoesData = await base44.entities.Operacao.list();
      
      // Buscar ocorrências de diárias existentes
      const ocorrenciasDiarias = await base44.entities.Ocorrencia.filter({ categoria: "diaria" });

      const ordensPendentes = [];

      for (const ordem of todasOrdens) {
        let toleranciaHoras = 2; // Padrão
        if (ordem.operacao_id) {
          const operacao = operacoesData.find(op => op.id === ordem.operacao_id);
          if (operacao?.tolerancia_horas) {
            toleranciaHoras = operacao.tolerancia_horas;
          }
        }

        const pendencias = [];

        // Verificar diária de CARREGAMENTO
        if (ordem.inicio_carregamento && ordem.fim_carregamento) {
          const inicio = new Date(ordem.inicio_carregamento);
          const fim = new Date(ordem.fim_carregamento);
          const horasDecorridas = (fim.getTime() - inicio.getTime()) / (1000 * 60 * 60);
          
          if (horasDecorridas > toleranciaHoras) {
            const diasDiaria = Math.ceil((horasDecorridas - toleranciaHoras) / 24);
            
            // Verificar se já existe ocorrência
            const jaExiste = ocorrenciasDiarias.some(o => 
              o.ordem_id === ordem.id && o.tipo_diaria === "carregamento"
            );

            if (!jaExiste) {
              pendencias.push({
                tipo: "carregamento",
                horas: horasDecorridas,
                dias: diasDiaria,
                tolerancia: toleranciaHoras,
                inicio: ordem.inicio_carregamento,
                fim: ordem.fim_carregamento
              });
            }
          }
        }

        // Verificar diária de DESCARGA
        if (ordem.chegada_destino && ordem.descarga_realizada_data) {
          const inicio = new Date(ordem.chegada_destino);
          const fim = new Date(ordem.descarga_realizada_data);
          const horasDecorridas = (fim.getTime() - inicio.getTime()) / (1000 * 60 * 60);
          
          if (horasDecorridas > toleranciaHoras) {
            const diasDiaria = Math.ceil((horasDecorridas - toleranciaHoras) / 24);
            
            // Verificar se já existe ocorrência
            const jaExiste = ocorrenciasDiarias.some(o => 
              o.ordem_id === ordem.id && o.tipo_diaria === "descarga"
            );

            if (!jaExiste) {
              pendencias.push({
                tipo: "descarga",
                horas: horasDecorridas,
                dias: diasDiaria,
                tolerancia: toleranciaHoras,
                inicio: ordem.chegada_destino,
                fim: ordem.descarga_realizada_data
              });
            }
          }
        }

        if (pendencias.length > 0) {
          ordensPendentes.push({
            ordem,
            pendencias
          });
        }
      }

      setOrdensPendentesGeracao(ordensPendentes);
      setOperacoes(operacoesData);
    } catch (error) {
      console.error("Erro ao carregar ordens pendentes:", error);
      toast.error("Erro ao carregar ordens pendentes");
    } finally {
      setLoadingPendentes(false);
    }
  };

  const handleGerarDiariasSelecionadas = async () => {
    if (ordensParaGerar.length === 0) {
      toast.error("Selecione ao menos uma ordem");
      return;
    }

    setGerandoOcorrencias(true);
    try {
      let totalGeradas = 0;

      for (const ordemIdCompleto of ordensParaGerar) {
        const [ordemId, tipoDiaria] = ordemIdCompleto.split('|');
        const item = ordensPendentesGeracao.find(op => op.ordem.id === ordemId);
        if (!item) continue;

        const pendencia = item.pendencias.find(p => p.tipo === tipoDiaria);
        if (!pendencia) continue;

        const ticketNumber = generateTicketNumber();

        await base44.entities.Ocorrencia.create({
          numero_ticket: ticketNumber,
          ordem_id: ordemId,
          categoria: "diaria",
          tipo: `diaria_${tipoDiaria}`,
          tipo_diaria: tipoDiaria,
          data_inicio: pendencia.inicio,
          data_fim: pendencia.fim,
          observacoes: `Diária de ${tipoDiaria} gerada manualmente. Tempo total: ${pendencia.horas.toFixed(1)}h (tolerância: ${pendencia.tolerancia}h). Dias de diária: ${pendencia.dias}.`,
          status: "aberta",
          gravidade: "media",
          status_cobranca: "pendente_valor",
          dias_diaria: pendencia.dias,
          registrado_por: (await base44.auth.me()).id
        });

        totalGeradas++;
      }

      // Adicionar novas diárias localmente
      const novasDiarias = [];
      for (const ordemIdCompleto of ordensParaGerar) {
        const [ordemId, tipoDiaria] = ordemIdCompleto.split('|');
        const item = ordensPendentesGeracao.find(op => op.ordem.id === ordemId);
        if (!item) continue;

        const pendencia = item.pendencias.find(p => p.tipo === tipoDiaria);
        if (!pendencia) continue;

        const ticketNumber = generateTicketNumber();
        
        // Simular a diária criada
        novasDiarias.push({
          id: `temp_${Date.now()}_${Math.random()}`,
          numero_ticket: ticketNumber,
          ordem_id: ordemId,
          categoria: "diaria",
          tipo: `diaria_${tipoDiaria}`,
          tipo_diaria: tipoDiaria,
          data_inicio: pendencia.inicio,
          data_fim: pendencia.fim,
          observacoes: `Diária de ${tipoDiaria} gerada manualmente. Tempo total: ${pendencia.horas.toFixed(1)}h (tolerância: ${pendencia.tolerancia}h). Dias de diária: ${pendencia.dias}.`,
          status: "aberta",
          gravidade: "media",
          status_cobranca: "pendente_valor",
          dias_diaria: pendencia.dias,
          created_date: new Date().toISOString()
        });
      }

      setDiarias(prev => [...novasDiarias, ...prev]);
      
      toast.success(`${totalGeradas} ocorrência(s) de diária gerada(s)!`);
      setOrdensParaGerar([]);
      setAbaAtiva("pendentes_valor");
      await loadOrdensPendentes();
      onUpdate();
    } catch (error) {
      console.error("Erro ao gerar diárias:", error);
      toast.error("Erro ao gerar diárias");
    } finally {
      setGerandoOcorrencias(false);
    }
  };

  const generateTicketNumber = () => {
    const now = new Date();
    const year = now.getFullYear().toString().slice(-2);
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');
    const hour = now.getHours().toString().padStart(2, '0');
    const minute = now.getMinutes().toString().padStart(2, '0');
    const second = now.getSeconds().toString().padStart(2, '0');
    
    return `${year}${month}${day}${hour}${minute}${second}`;
  };

  const toggleOrdemParaGerar = (ordemId, tipoDiaria) => {
    const key = `${ordemId}|${tipoDiaria}`;
    setOrdensParaGerar(prev => 
      prev.includes(key) 
        ? prev.filter(k => k !== key)
        : [...prev, key]
    );
  };

  const handleDefinirValorEmLote = async () => {
    if (selectedDiarias.length === 0) {
      toast.error("Selecione ao menos uma diária");
      return;
    }

    if (valorEmLoteData.valor <= 0) {
      toast.error("Informe um valor válido");
      return;
    }

    setSaving(true);
    try {
      for (const diariaId of selectedDiarias) {
        const diaria = diarias.find(d => d.id === diariaId);
        let valorFinal = 0;

        if (valorEmLoteData.tipo_calculo === "por_dia") {
          valorFinal = valorEmLoteData.valor * (diaria.dias_diaria || 1);
        } else {
          // Por hora: calcular horas totais
          const inicio = new Date(diaria.data_inicio);
          const fim = new Date(diaria.data_fim);
          const horasTotal = (fim.getTime() - inicio.getTime()) / (1000 * 60 * 60);
          valorFinal = valorEmLoteData.valor * horasTotal;
        }

        await base44.entities.Ocorrencia.update(diariaId, {
          valor_diaria_sugerido: valorFinal,
          status_cobranca: "pendente_autorizacao"
        });
      }

      // Atualizar localmente sem recarregar
      const diariasAtualizadas = {};
      for (const diariaId of selectedDiarias) {
        const diaria = diarias.find(d => d.id === diariaId);
        let valorFinal = 0;

        if (valorEmLoteData.tipo_calculo === "por_dia") {
          valorFinal = valorEmLoteData.valor * (diaria.dias_diaria || 1);
        } else {
          const inicio = new Date(diaria.data_inicio);
          const fim = new Date(diaria.data_fim);
          const horasTotal = (fim.getTime() - inicio.getTime()) / (1000 * 60 * 60);
          valorFinal = valorEmLoteData.valor * horasTotal;
        }
        
        diariasAtualizadas[diariaId] = valorFinal;
      }

      setDiarias(prev => prev.map(d => 
        selectedDiarias.includes(d.id)
          ? {
              ...d,
              valor_diaria_sugerido: diariasAtualizadas[d.id],
              status_cobranca: "pendente_autorizacao"
            }
          : d
      ));
      
      toast.success(`${selectedDiarias.length} diária(s) com valor definido!`);
      setShowDefinirValorModal(false);
      setSelectedDiarias([]);
      setValorEmLoteData({ tipo_calculo: "por_dia", valor: 0 });
    } catch (error) {
      console.error("Erro ao definir valores:", error);
      toast.error("Erro ao definir valores");
    } finally {
      setSaving(false);
    }
  };

  const loadEvidenciasPendentes = async () => {
    setLoading(true);
    try {
      // Buscar todas as ocorrências de diária
      const ocorrencias = await base44.entities.Ocorrencia.filter(
        { categoria: "diaria" },
        "-data_inicio"
      );

      // Buscar todos os tipos de ocorrência que tenham campos customizados
      const tiposOcorrencia = await base44.entities.TipoOcorrencia.list();
      const tiposComCampos = [];

      for (const tipo of tiposOcorrencia) {
        const campos = await base44.entities.TipoOcorrenciaCampo.filter({ tipo_ocorrencia_id: tipo.id });
        if (campos.length > 0) {
          tiposComCampos.push({ ...tipo, campos });
        }
      }

      // Buscar todos os campos já preenchidos
      const camposPreenchidos = await base44.entities.OcorrenciaCampo.list();

      // Filtrar ocorrências que têm tipo com campos customizados
      const ocorrenciasComCamposPendentes = [];

      for (const ocorrencia of ocorrencias) {
        if (!ocorrencia.tipo_ocorrencia_id) continue;

        const tipoComCampos = tiposComCampos.find(t => t.id === ocorrencia.tipo_ocorrencia_id);
        if (!tipoComCampos) continue;

        // Verificar se há campos pendentes
        const camposPendentes = tipoComCampos.campos.filter(campo => {
          const preenchido = camposPreenchidos.find(
            cp => cp.ocorrencia_id === ocorrencia.id && cp.campo_id === campo.id
          );
          return !preenchido;
        });

        if (camposPendentes.length > 0) {
          ocorrenciasComCamposPendentes.push({
            ...ocorrencia,
            tipo_info: tipoComCampos,
            campos_pendentes: camposPendentes,
            total_campos: tipoComCampos.campos.length
          });
        }
      }

      setOcorrenciasComCampos(ocorrenciasComCamposPendentes);
      setCamposTipos(tiposComCampos);
      setCamposPreenchidos(camposPreenchidos);
    } catch (error) {
      console.error("Erro ao carregar evidências pendentes:", error);
      toast.error("Erro ao carregar evidências pendentes");
    } finally {
      setLoading(false);
    }
  };

  const getDiariasFiltradas = () => {
    return diarias.filter(d => {
      // Filtro por aba
      if (abaAtiva === "pendentes_valor") {
        if (d.status_cobranca !== "pendente_valor") return false;
      } else if (abaAtiva === "pendentes_autorizacao") {
        if (d.status_cobranca !== "pendente_autorizacao") return false;
      } else if (abaAtiva === "autorizadas") {
        if (d.status_cobranca !== "autorizado_faturamento") return false;
      } else if (abaAtiva === "abonadas") {
        if (d.status_cobranca !== "abonado") return false;
      }

      // Filtro de busca
      if (searchTerm) {
        const ordem = ordens.find(o => o.id === d.ordem_id);
        const searchLower = searchTerm.toLowerCase();
        const match = 
          ordem?.numero_carga?.toLowerCase().includes(searchLower) ||
          ordem?.cliente?.toLowerCase().includes(searchLower) ||
          ordem?.viagem_pedido?.toLowerCase().includes(searchLower) ||
          d.numero_ticket?.toLowerCase().includes(searchLower);
        
        if (!match) return false;
      }

      // Filtro por operação
      if (filtroOperacao !== "todos") {
        const ordem = ordens.find(o => o.id === d.ordem_id);
        if (ordem?.operacao_id !== filtroOperacao) return false;
      }

      // Filtro por tipo de diária
      if (filtroTipoDiaria !== "todos") {
        if (d.tipo_diaria !== filtroTipoDiaria) return false;
      }

      return true;
    });
  };

  const theme = {
    cardBg: isDark ? '#1e293b' : '#ffffff',
    cardBorder: isDark ? '#334155' : '#e5e7eb',
    text: isDark ? '#f1f5f9' : '#111827',
    textMuted: isDark ? '#94a3b8' : '#6b7280',
    inputBg: isDark ? '#1e293b' : '#ffffff',
    inputBorder: isDark ? '#334155' : '#d1d5db',
  };

  const diariasFiltradas = getDiariasFiltradas();
  const valorTotalSelecionadas = selectedDiarias.reduce((sum, id) => {
    const diaria = diarias.find(d => d.id === id);
    return sum + (diaria?.valor_diaria_sugerido || 0);
  }, 0);

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto" style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2" style={{ color: theme.text }}>
              <DollarSign className="w-5 h-5 text-green-600" />
              Gestão de Diárias
            </DialogTitle>
          </DialogHeader>

          {/* Abas */}
          <div className="flex gap-2 mb-4 flex-wrap">
            <Button
              variant={abaAtiva === "gerar" ? "default" : "outline"}
              size="sm"
              onClick={() => {
                setAbaAtiva("gerar");
                setSelectedDiarias([]);
                setOrdensParaGerar([]);
              }}
              className={abaAtiva === "gerar" ? "bg-purple-600" : ""}
            >
              <Zap className="w-4 h-4 mr-1" />
              Gerar Diárias ({ordensPendentesGeracao.reduce((sum, op) => sum + op.pendencias.length, 0)})
            </Button>
            <Button
              variant={abaAtiva === "pendentes_valor" ? "default" : "outline"}
              size="sm"
              onClick={() => {
                setAbaAtiva("pendentes_valor");
                setSelectedDiarias([]);
              }}
              className={abaAtiva === "pendentes_valor" ? "bg-orange-600" : ""}
            >
              Pendentes de Valor ({diarias.filter(d => d.status_cobranca === "pendente_valor").length})
            </Button>
            <Button
              variant={abaAtiva === "pendentes_autorizacao" ? "default" : "outline"}
              size="sm"
              onClick={() => {
                setAbaAtiva("pendentes_autorizacao");
                setSelectedDiarias([]);
              }}
              className={abaAtiva === "pendentes_autorizacao" ? "bg-yellow-600" : ""}
            >
              Pendentes de Autorização ({diarias.filter(d => d.status_cobranca === "pendente_autorizacao").length})
            </Button>
            <Button
              variant={abaAtiva === "autorizadas" ? "default" : "outline"}
              size="sm"
              onClick={() => {
                setAbaAtiva("autorizadas");
                setSelectedDiarias([]);
              }}
              className={abaAtiva === "autorizadas" ? "bg-green-600" : ""}
            >
              Autorizadas ({diarias.filter(d => d.status_cobranca === "autorizado_faturamento").length})
            </Button>
            <Button
              variant={abaAtiva === "abonadas" ? "default" : "outline"}
              size="sm"
              onClick={() => {
                setAbaAtiva("abonadas");
                setSelectedDiarias([]);
              }}
              className={abaAtiva === "abonadas" ? "bg-gray-600" : ""}
            >
              Abonadas ({diarias.filter(d => d.status_cobranca === "abonado").length})
            </Button>
            <Button
              variant={abaAtiva === "evidencias" ? "default" : "outline"}
              size="sm"
              onClick={() => {
                setAbaAtiva("evidencias");
                setSelectedDiarias([]);
              }}
              className={abaAtiva === "evidencias" ? "bg-red-600" : ""}
            >
              <AlertCircle className="w-4 h-4 mr-1" />
              Evidências ({ocorrenciasComCampos.length})
            </Button>
          </div>

          {/* Barra de Filtros */}
          {abaAtiva === "pendentes_valor" && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: theme.textMuted }} />
                <Input
                  placeholder="Buscar ordem, cliente, pedido..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-9"
                  style={{ backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.text }}
                />
              </div>
              <select
                value={filtroOperacao}
                onChange={(e) => setFiltroOperacao(e.target.value)}
                className="h-9 px-3 rounded-md border text-sm"
                style={{ backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.text }}
              >
                <option value="todos">Todas as Operações</option>
                {operacoes.map(op => (
                  <option key={op.id} value={op.id}>{op.nome}</option>
                ))}
              </select>
              <select
                value={filtroTipoDiaria}
                onChange={(e) => setFiltroTipoDiaria(e.target.value)}
                className="h-9 px-3 rounded-md border text-sm"
                style={{ backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.text }}
              >
                <option value="todos">Todos os Tipos</option>
                <option value="carregamento">Carregamento</option>
                <option value="descarga">Descarga</option>
              </select>
            </div>
          )}

          {/* Ações em Massa - Pendentes de Valor */}
          {selectedDiarias.length > 0 && abaAtiva === "pendentes_valor" && (
            <div className="flex items-center gap-3 p-4 rounded-lg border-2 mb-4" 
                 style={{ 
                   backgroundColor: isDark ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.05)',
                   borderColor: isDark ? 'rgba(59, 130, 246, 0.3)' : 'rgba(59, 130, 246, 0.2)'
                 }}>
              <Badge className="bg-blue-600 text-white font-semibold">
                {selectedDiarias.length} selecionada(s)
              </Badge>
              <div className="flex gap-2 ml-auto">
                <Button
                  onClick={() => setShowDefinirValorModal(true)}
                  className="bg-blue-600 hover:bg-blue-700"
                  size="sm"
                >
                  <DollarSign className="w-4 h-4 mr-2" />
                  Definir Valor em Lote
                </Button>
                <Button
                  onClick={() => setSelectedDiarias([])}
                  variant="outline"
                  size="sm"
                  style={{ borderColor: theme.inputBorder, color: theme.text }}
                >
                  Limpar Seleção
                </Button>
              </div>
            </div>
          )}

          {/* Ações em Massa - Pendentes de Autorização */}
          {selectedDiarias.length > 0 && abaAtiva === "pendentes_autorizacao" && (
            <div className="flex items-center gap-3 p-4 rounded-lg border-2 mb-4"
                 style={{ 
                   backgroundColor: isDark ? 'rgba(34, 197, 94, 0.1)' : 'rgba(34, 197, 94, 0.05)',
                   borderColor: isDark ? 'rgba(34, 197, 94, 0.3)' : 'rgba(34, 197, 94, 0.2)'
                 }}>
              <Badge className="bg-green-600 text-white font-semibold">
                {selectedDiarias.length} selecionada(s)
              </Badge>
              <span className="text-sm font-semibold" style={{ color: theme.text }}>
                Total: R$ {valorTotalSelecionadas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
              <div className="flex gap-2 ml-auto">
                <Button
                  onClick={() => {
                    setAutorizacaoData({ 
                      numero_autorizacao: "", 
                      valor_total: valorTotalSelecionadas 
                    });
                    setShowAutorizacaoModal(true);
                  }}
                  className="bg-green-600 hover:bg-green-700"
                  size="sm"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Autorizar Selecionadas
                </Button>
                <Button
                  onClick={() => setShowAbonoModal(true)}
                  className="bg-orange-600 hover:bg-orange-700"
                  size="sm"
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Abonar Selecionadas
                </Button>
              </div>
            </div>
          )}

          {/* Aba Gerar Diárias */}
          {abaAtiva === "gerar" && (
            <>
              {ordensParaGerar.length > 0 && (
                <div className="flex items-center gap-3 p-4 rounded-lg border-2 mb-4"
                     style={{ 
                       backgroundColor: isDark ? 'rgba(168, 85, 247, 0.1)' : 'rgba(168, 85, 247, 0.05)',
                       borderColor: isDark ? 'rgba(168, 85, 247, 0.3)' : 'rgba(168, 85, 247, 0.2)'
                     }}>
                  <Badge className="bg-purple-600 text-white font-semibold">
                    {ordensParaGerar.length} diária(s) para gerar
                  </Badge>
                  <div className="flex gap-2 ml-auto">
                    <Button
                      onClick={handleGerarDiariasSelecionadas}
                      disabled={gerandoOcorrencias}
                      className="bg-purple-600 hover:bg-purple-700"
                      size="sm"
                    >
                      {gerandoOcorrencias ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                          Gerando...
                        </>
                      ) : (
                        <>
                          <Zap className="w-4 h-4 mr-2" />
                          Gerar Ocorrências
                        </>
                      )}
                    </Button>
                    <Button
                      onClick={() => setOrdensParaGerar([])}
                      variant="outline"
                      size="sm"
                      style={{ borderColor: theme.inputBorder, color: theme.text }}
                    >
                      Limpar Seleção
                    </Button>
                  </div>
                </div>
              )}

              {loadingPendentes ? (
                <div className="text-center py-12">
                  <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                  <p className="text-sm" style={{ color: theme.textMuted }}>Analisando ordens...</p>
                </div>
              ) : ordensPendentesGeracao.length === 0 ? (
                <div className="text-center py-12" style={{ color: theme.textMuted }}>
                  <CheckCircle className="w-12 h-12 mx-auto mb-3 opacity-20" />
                  <p>Nenhuma ordem com diária pendente de geração</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[500px] overflow-y-auto">
                  {ordensPendentesGeracao.map(item => {
                    const operacao = operacoes.find(op => op.id === item.ordem.operacao_id);
                    
                    return (
                      <Card key={item.ordem.id} style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}>
                        <CardContent className="p-4">
                          {/* Header da Ordem */}
                          <div className="mb-3 pb-3 border-b" style={{ borderColor: theme.cardBorder }}>
                            <div className="flex items-start justify-between">
                              <div>
                                <p className="font-bold text-sm mb-1" style={{ color: theme.text }}>
                                  {item.ordem.numero_carga}
                                </p>
                                <p className="text-xs mb-1" style={{ color: theme.textMuted }}>
                                  Cliente: {item.ordem.cliente}
                                </p>
                                <p className="text-xs" style={{ color: theme.textMuted }}>
                                  Pedido: {item.ordem.viagem_pedido || "-"} | {item.ordem.origem} → {item.ordem.destino}
                                </p>
                                {operacao && (
                                  <Badge variant="outline" className="mt-2 text-xs">
                                    {operacao.nome}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Datas de Tracking */}
                          <div className="mb-3 p-3 rounded" style={{ backgroundColor: isDark ? '#1e293b' : '#f9fafb' }}>
                            <p className="text-xs font-semibold mb-2" style={{ color: theme.text }}>📅 Timeline de Tracking</p>
                            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs" style={{ color: theme.textMuted }}>
                              {item.ordem.carregamento_agendamento_data && (
                                <div>Carreg. Agendado: {format(new Date(item.ordem.carregamento_agendamento_data), "dd/MM/yy HH:mm")}</div>
                              )}
                              {item.ordem.inicio_carregamento && (
                                <div>Início Carreg.: {format(new Date(item.ordem.inicio_carregamento), "dd/MM/yy HH:mm")}</div>
                              )}
                              {item.ordem.fim_carregamento && (
                                <div>Fim Carreg.: {format(new Date(item.ordem.fim_carregamento), "dd/MM/yy HH:mm")}</div>
                              )}
                              {item.ordem.saida_unidade && (
                                <div>Saída Unidade: {format(new Date(item.ordem.saida_unidade), "dd/MM/yy HH:mm")}</div>
                              )}
                              {item.ordem.chegada_destino && (
                                <div>Chegada Destino: {format(new Date(item.ordem.chegada_destino), "dd/MM/yy HH:mm")}</div>
                              )}
                              {item.ordem.descarga_agendamento_data && (
                                <div>Descarga Agend.: {format(new Date(item.ordem.descarga_agendamento_data), "dd/MM/yy HH:mm")}</div>
                              )}
                              {item.ordem.inicio_descarregamento && (
                                <div>Início Descarga: {format(new Date(item.ordem.inicio_descarregamento), "dd/MM/yy HH:mm")}</div>
                              )}
                              {item.ordem.descarga_realizada_data && (
                                <div>Fim Descarga: {format(new Date(item.ordem.descarga_realizada_data), "dd/MM/yy HH:mm")}</div>
                              )}
                            </div>
                          </div>

                          {/* Diárias Pendentes */}
                          <div className="space-y-2">
                            {item.pendencias.map((pendencia, idx) => {
                              const key = `${item.ordem.id}|${pendencia.tipo}`;
                              const isSelected = ordensParaGerar.includes(key);
                              
                              return (
                                <div 
                                  key={idx}
                                  className="p-3 border-2 rounded-lg cursor-pointer transition-all"
                                  style={{
                                    backgroundColor: isSelected 
                                      ? (isDark ? 'rgba(168, 85, 247, 0.15)' : 'rgba(168, 85, 247, 0.08)')
                                      : 'transparent',
                                    borderColor: isSelected 
                                      ? (isDark ? 'rgba(168, 85, 247, 0.5)' : 'rgba(168, 85, 247, 0.3)')
                                      : theme.cardBorder
                                  }}
                                  onClick={() => toggleOrdemParaGerar(item.ordem.id, pendencia.tipo)}
                                >
                                  <div className="flex items-start gap-3">
                                    <Checkbox
                                      checked={isSelected}
                                      onCheckedChange={() => toggleOrdemParaGerar(item.ordem.id, pendencia.tipo)}
                                      onClick={(e) => e.stopPropagation()}
                                      className="mt-1"
                                    />
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2 mb-2">
                                        {pendencia.tipo === "carregamento" ? (
                                          <Package className="w-4 h-4 text-blue-600" />
                                        ) : (
                                          <Truck className="w-4 h-4 text-purple-600" />
                                        )}
                                        <p className="font-semibold text-sm" style={{ color: theme.text }}>
                                          Diária de {pendencia.tipo === "carregamento" ? "Carregamento" : "Descarga"}
                                        </p>
                                        <Badge className={pendencia.tipo === "carregamento" ? "bg-blue-600 text-white" : "bg-purple-600 text-white"}>
                                          {pendencia.dias} dia(s)
                                        </Badge>
                                      </div>
                                      <div className="grid grid-cols-2 gap-2 text-xs" style={{ color: theme.textMuted }}>
                                        <div>
                                          <span className="font-medium">Início:</span> {format(new Date(pendencia.inicio), "dd/MM/yy HH:mm")}
                                        </div>
                                        <div>
                                          <span className="font-medium">Fim:</span> {format(new Date(pendencia.fim), "dd/MM/yy HH:mm")}
                                        </div>
                                        <div>
                                          <span className="font-medium">Total:</span> {pendencia.horas.toFixed(1)} horas
                                        </div>
                                        <div>
                                          <span className="font-medium">Tolerância:</span> {pendencia.tolerancia}h
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </>
          )}

          {/* Aba Evidências */}
          {abaAtiva === "evidencias" && (
            <>
              {loading ? (
                <div className="text-center py-12">
                  <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                  <p className="text-sm" style={{ color: theme.textMuted }}>Carregando evidências...</p>
                </div>
              ) : ocorrenciasComCampos.length === 0 ? (
                <div className="text-center py-12" style={{ color: theme.textMuted }}>
                  <CheckCircle className="w-12 h-12 mx-auto mb-3 opacity-20" />
                  <p>Todas as evidências foram preenchidas</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[500px] overflow-y-auto">
                  {ocorrenciasComCampos.map(ocorrencia => {
                    const ordem = ordens.find(o => o.id === ocorrencia.ordem_id);
                    const progressoPreenchimento = ((ocorrencia.total_campos - ocorrencia.campos_pendentes.length) / ocorrencia.total_campos) * 100;

                    return (
                      <Card 
                        key={ocorrencia.id}
                        className="border-l-4"
                        style={{ 
                          backgroundColor: theme.cardBg, 
                          borderColor: theme.cardBorder,
                          borderLeftColor: '#ef4444'
                        }}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <AlertCircle className="w-5 h-5 text-red-600" />
                                <div>
                                  <p className="font-semibold text-sm" style={{ color: theme.text }}>
                                    {ocorrencia.tipo_info.nome}
                                  </p>
                                  <p className="text-xs" style={{ color: theme.textMuted }}>
                                    Ticket: {ocorrencia.numero_ticket}
                                  </p>
                                </div>
                              </div>

                              {ordem && (
                                <div className="text-xs mb-2 space-y-1" style={{ color: theme.textMuted }}>
                                  <p>Ordem: {ordem.numero_carga}</p>
                                  <p>Cliente: {ordem.cliente}</p>
                                  <p>Pedido: {ordem.viagem_pedido || "-"}</p>
                                </div>
                              )}

                              <div className="flex items-center gap-2 text-xs mb-2" style={{ color: theme.textMuted }}>
                                <Calendar className="w-3 h-3" />
                                <span>
                                  {format(new Date(ocorrencia.data_inicio), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                                </span>
                              </div>

                              {/* Barra de Progresso */}
                              <div className="space-y-1">
                                <div className="flex items-center justify-between text-xs">
                                  <span style={{ color: theme.textMuted }}>
                                    Preenchimento dos campos
                                  </span>
                                  <span className="font-semibold" style={{ color: theme.text }}>
                                    {ocorrencia.total_campos - ocorrencia.campos_pendentes.length} / {ocorrencia.total_campos}
                                  </span>
                                </div>
                                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                  <div 
                                    className="bg-red-600 h-2 rounded-full transition-all"
                                    style={{ width: `${progressoPreenchimento}%` }}
                                  />
                                </div>
                              </div>

                              {/* Campos Pendentes */}
                              <div className="mt-3 p-3 rounded border" 
                                   style={{
                                     backgroundColor: isDark ? 'rgba(239, 68, 68, 0.1)' : 'rgba(239, 68, 68, 0.05)',
                                     borderColor: isDark ? 'rgba(239, 68, 68, 0.3)' : 'rgba(239, 68, 68, 0.2)'
                                   }}>
                                <p className="text-xs font-semibold mb-2" style={{ color: theme.text }}>
                                  Campos Pendentes ({ocorrencia.campos_pendentes.length}):
                                </p>
                                <ul className="space-y-1">
                                  {ocorrencia.campos_pendentes.slice(0, 5).map(campo => (
                                    <li key={campo.id} className="flex items-center gap-2 text-xs" style={{ color: theme.textMuted }}>
                                      <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                                      <span>{campo.nome}</span>
                                      {campo.obrigatorio && (
                                        <Badge className="bg-red-600 text-white text-[10px] h-4 px-1">
                                          Obrigatório
                                        </Badge>
                                      )}
                                    </li>
                                  ))}
                                  {ocorrencia.campos_pendentes.length > 5 && (
                                    <li className="text-xs italic" style={{ color: theme.textMuted }}>
                                      + {ocorrencia.campos_pendentes.length - 5} campos pendentes
                                    </li>
                                  )}
                                </ul>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </>
          )}

          {/* Lista de Diárias */}
          {abaAtiva !== "gerar" && abaAtiva !== "evidencias" && loading ? (
            <div className="text-center py-12">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-sm" style={{ color: theme.textMuted }}>Carregando diárias...</p>
            </div>
          ) : abaAtiva !== "gerar" && abaAtiva !== "evidencias" && diariasFiltradas.length === 0 ? (
            <div className="text-center py-12" style={{ color: theme.textMuted }}>
              <DollarSign className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p>Nenhuma diária nesta categoria</p>
            </div>
          ) : abaAtiva !== "gerar" && abaAtiva !== "evidencias" ? (
            <div className="space-y-3 max-h-[500px] overflow-y-auto">
              {diariasFiltradas.map(diaria => {
                const ordem = ordens.find(o => o.id === diaria.ordem_id);
                const isSelected = selectedDiarias.includes(diaria.id);
                const tipoDiariaIcon = diaria.tipo_diaria === "carregamento" ? Package : Truck;

                return (
                  <Card 
                    key={diaria.id} 
                    className="border-l-4"
                    style={{ 
                      backgroundColor: theme.cardBg, 
                      borderColor: theme.cardBorder,
                      borderLeftColor: diaria.tipo_diaria === "carregamento" ? '#3b82f6' : '#8b5cf6'
                    }}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        {(abaAtiva === "pendentes_autorizacao" || abaAtiva === "pendentes_valor") && (
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={() => toggleDiaria(diaria.id)}
                            className="mt-1"
                          />
                        )}
                        <div className="flex-1">
                          {/* Header */}
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                              {React.createElement(tipoDiariaIcon, { 
                                className: `w-5 h-5 ${diaria.tipo_diaria === "carregamento" ? "text-blue-600" : "text-purple-600"}` 
                              })}
                              <div>
                                <p className="font-semibold text-sm" style={{ color: theme.text }}>
                                  Diária de {diaria.tipo_diaria === "carregamento" ? "Carregamento" : "Descarga"}
                                </p>
                                <p className="text-xs" style={{ color: theme.textMuted }}>
                                  Ordem: {ordem?.numero_carga || `#${diaria.ordem_id?.slice(-6)}`}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <Badge className="bg-blue-600 text-white">
                                {diaria.dias_diaria || 0} dia(s)
                              </Badge>
                            </div>
                          </div>

                          {/* Info da Ordem */}
                          {ordem && (
                            <div className="text-xs mb-2 space-y-1" style={{ color: theme.textMuted }}>
                              <p>Cliente: {ordem.cliente}</p>
                              <p>Pedido: {ordem.viagem_pedido || "-"} | {ordem.origem} → {ordem.destino}</p>
                            </div>
                          )}

                          {/* Período */}
                          <div className="flex items-center gap-2 text-xs mb-3" style={{ color: theme.textMuted }}>
                            <Calendar className="w-3 h-3" />
                            <span>
                              {format(new Date(diaria.data_inicio), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                              {" → "}
                              {diaria.data_fim && format(new Date(diaria.data_fim), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                            </span>
                          </div>

                          {/* Valor */}
                          {abaAtiva === "pendentes_valor" ? (
                            <div className="flex items-center gap-2">
                              <Input
                                type="number"
                                placeholder="Valor da diária"
                                defaultValue={diaria.valor_diaria_sugerido || ""}
                                onBlur={(e) => {
                                  const valor = parseFloat(e.target.value);
                                  if (valor > 0) {
                                    handleDefinirValor(diaria.id, valor);
                                  }
                                }}
                                className="w-32 h-8 text-sm"
                                style={{ backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.text }}
                              />
                              <span className="text-xs" style={{ color: theme.textMuted }}>R$ por diária</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-4">
                              <div>
                                <Label className="text-xs" style={{ color: theme.textMuted }}>Valor Sugerido</Label>
                                <p className="text-lg font-bold text-blue-600">
                                  R$ {(diaria.valor_diaria_sugerido || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                </p>
                              </div>
                              {diaria.valor_diaria_autorizado > 0 && (
                                <div>
                                  <Label className="text-xs" style={{ color: theme.textMuted }}>Valor Autorizado</Label>
                                  <p className="text-lg font-bold text-green-600">
                                    R$ {diaria.valor_diaria_autorizado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                  </p>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Autorização / Abono */}
                          {diaria.numero_autorizacao_cliente && (
                            <div className="mt-2 p-2 bg-green-50 dark:bg-green-950 rounded border border-green-200 dark:border-green-800">
                              <p className="text-xs font-semibold text-green-700 dark:text-green-400">
                                Autorização: {diaria.numero_autorizacao_cliente}
                              </p>
                              {diaria.data_autorizacao && (
                                <p className="text-xs text-green-600 dark:text-green-500">
                                  {format(new Date(diaria.data_autorizacao), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                                </p>
                              )}
                            </div>
                          )}

                          {diaria.motivo_abono && (
                            <div className="mt-2 p-3 rounded border" 
                                 style={{
                                   backgroundColor: isDark ? 'rgba(148, 163, 184, 0.1)' : 'rgba(148, 163, 184, 0.08)',
                                   borderColor: isDark ? 'rgba(148, 163, 184, 0.25)' : 'rgba(148, 163, 184, 0.2)'
                                 }}>
                              <p className="text-xs font-semibold mb-1" style={{ color: theme.text }}>Motivo do Abono:</p>
                              <p className="text-xs leading-relaxed" style={{ color: theme.textMuted }}>{diaria.motivo_abono}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : null}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={onClose}
              style={{ borderColor: theme.cardBorder, color: theme.text }}
            >
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Autorização */}
      <Dialog open={showAutorizacaoModal} onOpenChange={setShowAutorizacaoModal}>
        <DialogContent style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}>
          <DialogHeader>
            <DialogTitle style={{ color: theme.text }}>Autorizar Diárias para Faturamento</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="p-3 rounded border" 
                 style={{
                   backgroundColor: isDark ? 'rgba(34, 197, 94, 0.12)' : 'rgba(34, 197, 94, 0.08)',
                   borderColor: isDark ? 'rgba(34, 197, 94, 0.3)' : 'rgba(34, 197, 94, 0.25)'
                 }}>
              <p className="text-sm font-semibold" style={{ color: isDark ? '#4ade80' : '#16a34a' }}>
                {selectedDiarias.length} diária(s) selecionada(s)
              </p>
              <p className="text-xs mt-1" style={{ color: isDark ? '#86efac' : '#22c55e' }}>
                Valor total sugerido: R$ {valorTotalSelecionadas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>

            <div>
              <Label style={{ color: theme.text }}>Número da Autorização do Cliente *</Label>
              <Input
                placeholder="Ex: AUT-2025-001, #12345, etc."
                value={autorizacaoData.numero_autorizacao}
                onChange={(e) => setAutorizacaoData({ ...autorizacaoData, numero_autorizacao: e.target.value })}
                className="mt-1"
                style={{ backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.text }}
              />
            </div>

            <div>
              <Label style={{ color: theme.text }}>Valor Total Autorizado *</Label>
              <Input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={autorizacaoData.valor_total || ""}
                onChange={(e) => setAutorizacaoData({ ...autorizacaoData, valor_total: parseFloat(e.target.value) || 0 })}
                className="mt-1"
                style={{ backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.text }}
              />
              <p className="text-xs mt-1" style={{ color: theme.textMuted }}>
                Este valor será dividido igualmente entre as {selectedDiarias.length} diária(s) selecionada(s)
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowAutorizacaoModal(false)}
              style={{ borderColor: theme.cardBorder, color: theme.text }}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleAutorizar}
              disabled={saving}
              className="bg-green-600 hover:bg-green-700"
            >
              {saving ? "Autorizando..." : "Confirmar Autorização"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Definir Valor em Lote */}
      <Dialog open={showDefinirValorModal} onOpenChange={setShowDefinirValorModal}>
        <DialogContent style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}>
          <DialogHeader>
            <DialogTitle style={{ color: theme.text }}>Definir Valor em Lote</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="p-3 rounded border-2" 
                 style={{ 
                   backgroundColor: isDark ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.05)',
                   borderColor: isDark ? 'rgba(59, 130, 246, 0.3)' : 'rgba(59, 130, 246, 0.2)'
                 }}>
              <p className="text-sm font-semibold" style={{ color: theme.text }}>
                {selectedDiarias.length} diária(s) selecionada(s)
              </p>
            </div>

            <div>
              <Label style={{ color: theme.text }}>Tipo de Cálculo *</Label>
              <select
                value={valorEmLoteData.tipo_calculo}
                onChange={(e) => setValorEmLoteData({ ...valorEmLoteData, tipo_calculo: e.target.value })}
                className="w-full mt-1 px-3 py-2 rounded-md border"
                style={{ backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.text }}
              >
                <option value="por_dia">Por Dia (R$ x dias de diária)</option>
                <option value="por_hora">Por Hora (R$ x horas totais)</option>
              </select>
            </div>

            <div>
              <Label style={{ color: theme.text }}>
                Valor {valorEmLoteData.tipo_calculo === "por_dia" ? "por Dia" : "por Hora"} *
              </Label>
              <Input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={valorEmLoteData.valor || ""}
                onChange={(e) => setValorEmLoteData({ ...valorEmLoteData, valor: parseFloat(e.target.value) || 0 })}
                className="mt-1"
                style={{ backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.text }}
              />
              <p className="text-xs mt-2" style={{ color: theme.textMuted }}>
                {valorEmLoteData.tipo_calculo === "por_dia" 
                  ? "O valor será multiplicado pelos dias de diária de cada ocorrência"
                  : "O valor será multiplicado pelas horas totais de cada ocorrência"
                }
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDefinirValorModal(false)}
              style={{ borderColor: theme.cardBorder, color: theme.text }}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleDefinirValorEmLote}
              disabled={saving}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {saving ? "Definindo..." : "Confirmar Valores"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Abono */}
      <Dialog open={showAbonoModal} onOpenChange={setShowAbonoModal}>
        <DialogContent style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}>
          <DialogHeader>
            <DialogTitle style={{ color: theme.text }}>Abonar Diárias</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="p-3 rounded border" 
                 style={{
                   backgroundColor: isDark ? 'rgba(251, 146, 60, 0.15)' : 'rgba(251, 146, 60, 0.1)',
                   borderColor: isDark ? 'rgba(251, 146, 60, 0.3)' : 'rgba(251, 146, 60, 0.25)'
                 }}>
              <p className="text-sm font-semibold" style={{ color: isDark ? '#fb923c' : '#ea580c' }}>
                {selectedDiarias.length} diária(s) selecionada(s) serão abonadas
              </p>
              <p className="text-xs mt-1" style={{ color: isDark ? '#fdba74' : '#f97316' }}>
                Valor total dispensado: R$ {valorTotalSelecionadas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>

            <div>
              <Label style={{ color: theme.text }}>Motivo do Abono *</Label>
              <Textarea
                placeholder="Descreva o motivo pelo qual a diária será abonada..."
                value={abonoData.motivo}
                onChange={(e) => setAbonoData({ ...abonoData, motivo: e.target.value })}
                rows={4}
                className="mt-1"
                style={{ backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.text }}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowAbonoModal(false)}
              style={{ borderColor: theme.cardBorder, color: theme.text }}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleAbonar}
              disabled={saving}
              className="bg-orange-600 hover:bg-orange-700"
            >
              {saving ? "Abonando..." : "Confirmar Abono"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}