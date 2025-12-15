import React, { useState, useEffect, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, RefreshCw, Truck, Package, CheckCircle, X, Plus, Minus, Scan, Grid3x3, Filter, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import ConferenciaVolumes from "../components/carregamento/ConferenciaVolumes";
import EnderecamentoVeiculo from "../components/carregamento/EnderecamentoVeiculo";
import OrdemFilhaForm from "../components/ordens/SubOrdemForm";
import { sincronizarOrdemMaeParaFilhas } from "@/functions/sincronizarOrdemMaeParaFilhas";
import { debounce } from "lodash";

export default function Carregamento() {
  const [isDark, setIsDark] = useState(false);
  const queryClient = useQueryClient();
  const [searchOrdem, setSearchOrdem] = useState("");
  const [searchNota, setSearchNota] = useState("");
  const [debouncedSearchOrdem, setDebouncedSearchOrdem] = useState("");
  const [debouncedSearchNota, setDebouncedSearchNota] = useState("");
  const [filtroStatusTracking, setFiltroStatusTracking] = useState("todos");
  const [filtroOperacao, setFiltroOperacao] = useState("todos");
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    operacoesIds: [],
    statusTracking: "",
    origem: "",
    destino: "",
    dataInicio: "",
    dataFim: ""
  });
  const [ordemSelecionada, setOrdemSelecionada] = useState(null);
  const [notasSelecionadas, setNotasSelecionadas] = useState([]);
  const [showConferencia, setShowConferencia] = useState(false);
  const [showEnderecamento, setShowEnderecamento] = useState(false);
  const [showOrdemFilhaForm, setShowOrdemFilhaForm] = useState(false);
  const [abaAtiva, setAbaAtiva] = useState("carregamento");
  const [processandoVinculo, setProcessandoVinculo] = useState(false);

  useEffect(() => {
    const checkDarkMode = () => {
      setIsDark(document.documentElement.classList.contains('dark'));
    };
    checkDarkMode();
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  // Debounce das buscas
  useEffect(() => {
    const handler = debounce(() => setDebouncedSearchOrdem(searchOrdem), 300);
    handler();
    return () => handler.cancel();
  }, [searchOrdem]);

  useEffect(() => {
    // Se tem 44 caracteres (chave completa), processar automaticamente
    const searchClean = searchNota.trim().replace(/\s+/g, '');
    if (searchClean.length === 44 && /^\d+$/.test(searchClean)) {
      handleProcessarBuscaNota(searchNota);
      return;
    }
    
    // Debounce normal para outros casos
    const handler = debounce(() => setDebouncedSearchNota(searchNota), 300);
    handler();
    return () => handler.cancel();
  }, [searchNota]);

  // Queries com React Query e cache
  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
    staleTime: 5 * 60 * 1000 // Cache por 5 minutos
  });

  const { data: ordens = [], isLoading: loadingOrdens, refetch: refetchOrdens } = useQuery({
    queryKey: ['ordens-carregamento'],
    queryFn: async () => {
      const data = await base44.entities.OrdemDeCarregamento.list("-data_solicitacao", 200);
      return data.filter(o => 
        o.tipo_ordem !== "recebimento" && 
        o.status !== "finalizado" && 
        o.status !== "cancelado"
      );
    },
    staleTime: 30 * 1000, // Cache por 30 segundos
    enabled: !!user
  });

  const { data: notasFiscais = [], isLoading: loadingNotas, refetch: refetchNotas } = useQuery({
    queryKey: ['notas-fiscais-carregamento'],
    queryFn: () => base44.entities.NotaFiscal.list("-created_date"),
    staleTime: 30 * 1000,
    enabled: !!user
  });

  const { data: volumes = [] } = useQuery({
    queryKey: ['volumes-carregamento'],
    queryFn: () => base44.entities.Volume.list(null, 500),
    staleTime: 30 * 1000,
    enabled: !!user
  });

  const { data: enderecamentos = [] } = useQuery({
    queryKey: ['enderecamentos'],
    queryFn: () => base44.entities.EnderecamentoVolume.list(null, 300),
    staleTime: 30 * 1000,
    enabled: !!user
  });

  const { data: motoristas = [] } = useQuery({
    queryKey: ['motoristas'],
    queryFn: () => base44.entities.Motorista.list(null, 200),
    staleTime: 2 * 60 * 1000 // Cache por 2 minutos
  });

  const { data: veiculos = [] } = useQuery({
    queryKey: ['veiculos'],
    queryFn: () => base44.entities.Veiculo.list(null, 300),
    staleTime: 2 * 60 * 1000
  });

  const { data: operacoes = [] } = useQuery({
    queryKey: ['operacoes'],
    queryFn: () => base44.entities.Operacao.list(),
    staleTime: 5 * 60 * 1000 // Cache por 5 minutos
  });

  const loading = loadingOrdens || loadingNotas;

  const refetchAll = async () => {
    // Invalidar apenas as queries necessárias (mais rápido que refetch completo)
    queryClient.invalidateQueries(['ordens-carregamento']);
    queryClient.invalidateQueries(['notas-fiscais-carregamento']);
    queryClient.invalidateQueries(['volumes-carregamento']);
    queryClient.invalidateQueries(['enderecamentos']);
  };

  // Memoizar computações pesadas
  const getNotasDisponiveis = useMemo(() => {
    if (!notasFiscais || !ordens) return [];
    
    // Criar um Set de IDs de notas já vinculadas para busca O(1)
    const notasVinculadasSet = new Set();
    ordens.forEach(o => {
      if ((o.tipo_ordem === "carregamento" || o.tipo_ordem === "entrega" || o.tipo_registro === "ordem_completa") && o.notas_fiscais_ids) {
        o.notas_fiscais_ids.forEach(id => notasVinculadasSet.add(id));
      }
    });
    
    // Filtrar notas recebidas e não vinculadas
    return notasFiscais.filter(nota => 
      nota.status_nf === "recebida" && !notasVinculadasSet.has(nota.id)
    );
  }, [notasFiscais, ordens]);

  const getNotasVinculadas = useMemo(() => {
    if (!ordemSelecionada?.notas_fiscais_ids || !notasFiscais) return [];
    
    // Criar Map para busca O(1)
    const notasMap = new Map(notasFiscais.map(n => [n.id, n]));
    
    return ordemSelecionada.notas_fiscais_ids
      .map(id => notasMap.get(id))
      .filter(Boolean);
  }, [ordemSelecionada?.notas_fiscais_ids, notasFiscais]);

  const handleSelecionarOrdem = (ordem) => {
    setOrdemSelecionada(ordem);
    setNotasSelecionadas([]);
  };

  const handleToggleNota = (notaId) => {
    setNotasSelecionadas(prev => 
      prev.includes(notaId) 
        ? prev.filter(id => id !== notaId)
        : [...prev, notaId]
    );
  };

  const vincularNotasMutation = useMutation({
    mutationFn: async () => {
      const notasParaVincular = notasFiscais.filter(n => notasSelecionadas.includes(n.id));
      const notasVinculadasAtual = notasFiscais.filter(nota => 
        ordemSelecionada.notas_fiscais_ids?.includes(nota.id)
      );
      const todasNotas = [...notasVinculadasAtual, ...notasParaVincular];
      
      const pesoTotal = todasNotas.reduce((sum, nf) => sum + (nf.peso_total_nf || 0), 0);
      const valorTotal = todasNotas.reduce((sum, nf) => sum + (nf.valor_nota_fiscal || 0), 0);
      const volumesTotal = todasNotas.reduce((sum, nf) => sum + (nf.quantidade_total_volumes_nf || 0), 0);
      const notasIds = [...(ordemSelecionada.notas_fiscais_ids || []), ...notasSelecionadas];

      const updateData = {
        notas_fiscais_ids: notasIds,
        peso_total_consolidado: pesoTotal,
        valor_total_consolidado: valorTotal,
        volumes_total_consolidado: volumesTotal,
        peso: pesoTotal,
        volumes: volumesTotal
      };

      if (!ordemSelecionada.notas_fiscais_ids || ordemSelecionada.notas_fiscais_ids.length === 0) {
        updateData.inicio_carregamento = new Date().toISOString();
        updateData.status_tracking = "em_carregamento";
        updateData.status = "aguardando_carregamento";
      }

      await base44.entities.OrdemDeCarregamento.update(ordemSelecionada.id, updateData);

      for (const notaId of notasSelecionadas) {
        await base44.entities.NotaFiscal.update(notaId, {
          ordem_id: ordemSelecionada.id,
          status_nf: "aguardando_expedicao"
        });
      }

      if (ordemSelecionada.tipo_ordem !== "ordem_filha") {
        try {
          await sincronizarOrdemMaeParaFilhas({ ordemMaeId: ordemSelecionada.id });
        } catch (error) {
          console.log("Erro ao sincronizar ordens filhas (ignorando):", error);
        }
      }

      return ordemSelecionada.id;
    },
    onSuccess: async (ordemId) => {
      toast.success(`${notasSelecionadas.length} nota(s) vinculada(s)!`);
      setNotasSelecionadas([]);
      await refetchAll();
      const ordemAtualizada = await base44.entities.OrdemDeCarregamento.get(ordemId);
      setOrdemSelecionada(ordemAtualizada);
    },
    onError: (error) => {
      console.error("Erro ao vincular notas:", error);
      toast.error("Erro ao vincular notas fiscais");
    }
  });

  const handleVincularNotas = () => {
    if (!ordemSelecionada || notasSelecionadas.length === 0) {
      toast.error("Selecione ao menos uma nota fiscal");
      return;
    }
    vincularNotasMutation.mutate();
  };

  const handleProcessarBuscaNota = async (valor) => {
    if (!valor || !valor.trim() || processandoVinculo) {
      return;
    }

    const valorLimpo = valor.trim().replace(/\s+/g, '');

    // Se tem exatamente 44 dígitos, é uma chave de nota fiscal
    if (valorLimpo.length === 44 && /^\d+$/.test(valorLimpo)) {
      // Verificar se tem ordem selecionada para vincular
      if (!ordemSelecionada) {
        toast.warning("Selecione uma ordem primeiro para vincular a nota");
        setDebouncedSearchNota(valor);
        return;
      }

      setProcessandoVinculo(true);

      // Buscar nota pela chave
      const notaEncontrada = notasFiscais.find(n => {
        const chaveNota = n.chave_nota_fiscal?.toString().replace(/\s+/g, '') || "";
        return chaveNota === valorLimpo;
      });

      if (!notaEncontrada) {
        toast.error("Nota fiscal não encontrada no sistema");
        setSearchNota("");
        setProcessandoVinculo(false);
        return;
      }

      // Verificar se já está vinculada
      if (ordemSelecionada.notas_fiscais_ids?.includes(notaEncontrada.id)) {
        toast.warning("Nota fiscal já vinculada a esta ordem");
        setSearchNota("");
        setProcessandoVinculo(false);
        return;
      }

      // Vincular automaticamente
      try {
        const notasVinculadasAtual = notasFiscais.filter(nota => 
          ordemSelecionada.notas_fiscais_ids?.includes(nota.id)
        );
        const todasNotas = [...notasVinculadasAtual, notaEncontrada];
        
        const pesoTotal = todasNotas.reduce((sum, nf) => sum + (nf.peso_total_nf || 0), 0);
        const valorTotal = todasNotas.reduce((sum, nf) => sum + (nf.valor_nota_fiscal || 0), 0);
        const volumesTotal = todasNotas.reduce((sum, nf) => sum + (nf.quantidade_total_volumes_nf || 0), 0);
        const notasIds = [...(ordemSelecionada.notas_fiscais_ids || []), notaEncontrada.id];

        const updateData = {
          notas_fiscais_ids: notasIds,
          peso_total_consolidado: pesoTotal,
          valor_total_consolidado: valorTotal,
          volumes_total_consolidado: volumesTotal,
          peso: pesoTotal,
          volumes: volumesTotal
        };

        if (!ordemSelecionada.notas_fiscais_ids || ordemSelecionada.notas_fiscais_ids.length === 0) {
          updateData.inicio_carregamento = new Date().toISOString();
          updateData.status_tracking = "em_carregamento";
          updateData.status = "aguardando_carregamento";
        }

        await base44.entities.OrdemDeCarregamento.update(ordemSelecionada.id, updateData);

        await base44.entities.NotaFiscal.update(notaEncontrada.id, {
          ordem_id: ordemSelecionada.id,
          status_nf: "aguardando_expedicao"
        });

        // Sincronizar ordens filhas em background (não bloquear UI)
        if (ordemSelecionada.tipo_ordem !== "ordem_filha") {
          sincronizarOrdemMaeParaFilhas({ ordemMaeId: ordemSelecionada.id }).catch(error => {
            console.log("Erro ao sincronizar ordens filhas (ignorando):", error);
          });
        }

        // Atualizar cache local imediatamente (sem refetch)
        queryClient.setQueryData(['notas-fiscais-carregamento'], (old) => {
          return old.map(n => n.id === notaEncontrada.id ? {...n, ordem_id: ordemSelecionada.id, status_nf: "aguardando_expedicao"} : n);
        });

        const ordemAtualizada = {...ordemSelecionada, ...updateData};
        setOrdemSelecionada(ordemAtualizada);

        // Invalidar apenas queries essenciais (não refetch completo)
        queryClient.invalidateQueries(['ordens-carregamento']);

        toast.success(`NF ${notaEncontrada.numero_nota} vinculada!`);
        setSearchNota("");
      } catch (error) {
        console.error("Erro ao vincular nota:", error);
        toast.error("Erro ao vincular nota fiscal");
        setSearchNota("");
      } finally {
        setProcessandoVinculo(false);
      }
    } else {
      // Busca normal por número ou texto
      setDebouncedSearchNota(valor);
    }
  };

  const desvincularNotaMutation = useMutation({
    mutationFn: async (notaId) => {
      const notasIds = (ordemSelecionada.notas_fiscais_ids || []).filter(id => id !== notaId);
      const notasRestantes = notasFiscais.filter(n => notasIds.includes(n.id));
      const pesoTotal = notasRestantes.reduce((sum, nf) => sum + (nf.peso_total_nf || 0), 0);
      const valorTotal = notasRestantes.reduce((sum, nf) => sum + (nf.valor_nota_fiscal || 0), 0);
      const volumesTotal = notasRestantes.reduce((sum, nf) => sum + (nf.quantidade_total_volumes_nf || 0), 0);

      await base44.entities.OrdemDeCarregamento.update(ordemSelecionada.id, {
        notas_fiscais_ids: notasIds,
        peso_total_consolidado: pesoTotal,
        valor_total_consolidado: valorTotal,
        volumes_total_consolidado: volumesTotal,
        peso: pesoTotal,
        volumes: volumesTotal
      });

      await base44.entities.NotaFiscal.update(notaId, {
        status_nf: "recebida"
      });

      if (ordemSelecionada.tipo_ordem !== "ordem_filha") {
        try {
          await sincronizarOrdemMaeParaFilhas({ ordemMaeId: ordemSelecionada.id });
        } catch (error) {
          console.log("Erro ao sincronizar ordens filhas (ignorando):", error);
        }
      }

      return ordemSelecionada.id;
    },
    onSuccess: async (ordemId) => {
      toast.success("Nota fiscal desvinculada!");
      await refetchAll();
      const ordemAtualizada = await base44.entities.OrdemDeCarregamento.get(ordemId);
      setOrdemSelecionada(ordemAtualizada);
    },
    onError: (error) => {
      console.error("Erro ao desvincular nota:", error);
      toast.error("Erro ao desvincular nota fiscal");
    }
  });

  const handleDesvincularNota = (notaId) => {
    if (!ordemSelecionada) return;
    desvincularNotaMutation.mutate(notaId);
  };

  const toggleOperacao = (operacaoId) => {
    setFilters(prev => {
      const operacoesIds = prev.operacoesIds.includes(operacaoId)
        ? prev.operacoesIds.filter(id => id !== operacaoId)
        : [...prev.operacoesIds, operacaoId];
      return { ...prev, operacoesIds };
    });
  };

  const ordensFiltered = useMemo(() => {
    const searchLower = debouncedSearchOrdem.toLowerCase();
    
    return ordens.filter(o => {
      // Filtro de busca otimizado com suporte a ordem mãe
      if (debouncedSearchOrdem) {
        const motorista = motoristas.find(m => m.id === o.motorista_id);
        const nomeMotorista = motorista?.nome || o.motorista_nome_temp || "";
        
        // Buscar ordem mãe se esta for filha
        let ordemMae = null;
        if (o.ordem_mae_id) {
          ordemMae = ordens.find(om => om.id === o.ordem_mae_id);
        }
        
        // Verificar se é uma ordem filha da busca
        const ordensFilhasDaBusca = ordens.filter(of => of.ordem_mae_id === o.id);
        const algumFilhoMatch = ordensFilhasDaBusca.some(filha => 
          filha.numero_carga?.toLowerCase().includes(searchLower)
        );
        
        const matchSearch = 
          o.numero_carga?.toLowerCase().includes(searchLower) ||
          o.cliente?.toLowerCase().includes(searchLower) ||
          o.destino?.toLowerCase().includes(searchLower) ||
          nomeMotorista.toLowerCase().includes(searchLower) ||
          o.cavalo_placa_temp?.toLowerCase().includes(searchLower) ||
          o.implemento1_placa_temp?.toLowerCase().includes(searchLower) ||
          ordemMae?.numero_carga?.toLowerCase().includes(searchLower) ||
          algumFilhoMatch;
        
        if (!matchSearch) return false;
      }

      // Filtros simples
      if (filtroStatusTracking !== "todos" && o.status_tracking !== filtroStatusTracking) return false;
      if (filtroOperacao !== "todos" && o.operacao_id !== filtroOperacao) return false;

      // Filtros avançados
      if (filters.operacoesIds.length > 0 && !filters.operacoesIds.includes(o.operacao_id)) return false;
      if (filters.statusTracking && o.status_tracking !== filters.statusTracking) return false;
      if (filters.origem && !o.origem?.toLowerCase().includes(filters.origem.toLowerCase())) return false;
      if (filters.destino && !o.destino?.toLowerCase().includes(filters.destino.toLowerCase())) return false;

      if (filters.dataInicio && o.data_solicitacao) {
        if (new Date(o.data_solicitacao) < new Date(filters.dataInicio)) return false;
      }

      if (filters.dataFim && o.data_solicitacao) {
        const dataFim = new Date(filters.dataFim);
        dataFim.setHours(23, 59, 59, 999);
        if (new Date(o.data_solicitacao) > dataFim) return false;
      }

      return true;
    });
  }, [ordens, debouncedSearchOrdem, filtroStatusTracking, filtroOperacao, filters, motoristas]);

  const notasDisponiveisFiltered = useMemo(() => {
    // Se houver busca, buscar em TODAS as notas fiscais (sem filtro de status)
    if (debouncedSearchNota) {
      const searchTrimmed = debouncedSearchNota.trim();
      const searchLower = searchTrimmed.toLowerCase();
      const searchClean = searchTrimmed.replace(/\s+/g, '');

      return notasFiscais.filter(nota => {
        // Busca no número da nota (com e sem zeros à esquerda)
        const numeroNota = nota.numero_nota?.toString() || "";
        const numeroNotaLimpo = numeroNota.replace(/^0+/, ''); // Remove zeros à esquerda

        // Busca na chave
        const chaveNota = nota.chave_nota_fiscal?.toString().replace(/\s+/g, '') || "";

        // Busca em razões sociais
        const emitente = nota.emitente_razao_social?.toLowerCase() || "";
        const destinatario = nota.destinatario_razao_social?.toLowerCase() || "";

        return numeroNota.includes(searchClean) ||
               numeroNotaLimpo.includes(searchClean) ||
               chaveNota.includes(searchClean) ||
               chaveNota.toLowerCase().includes(searchLower) ||
               emitente.includes(searchLower) ||
               destinatario.includes(searchLover);
      });
    }

    // Sem busca, aplicar filtros por aba
    let notasBase = abaAtiva === "carregamento" ? getNotasDisponiveis : notasFiscais;

    if (abaAtiva === "conferencia") {
      notasBase = notasBase.filter(nota => {
        const volumesNota = volumes.filter(v => v.nota_fiscal_id === nota.id);
        return volumesNota.some(v => v.status_volume === "carregado" || v.status_volume === "em_transito");
      });
    } else if (abaAtiva === "enderecamento") {
      notasBase = notasBase.filter(nota => {
        return enderecamentos.some(e => e.nota_fiscal_id === nota.id);
      });
    }

    return notasBase;
  }, [debouncedSearchNota, abaAtiva, notasFiscais, getNotasDisponiveis, volumes, enderecamentos]);

  const theme = {
    bg: isDark ? '#0f172a' : '#f9fafb',
    cardBg: isDark ? '#1e293b' : '#ffffff',
    cardBorder: isDark ? '#334155' : '#e5e7eb',
    text: isDark ? '#f1f5f9' : '#111827',
    textMuted: isDark ? '#94a3b8' : '#6b7280',
    inputBg: isDark ? '#1e293b' : '#ffffff',
    inputBorder: isDark ? '#334155' : '#d1d5db',
  };

  // Verificação de acesso
  if (user && user.tipo_perfil !== "operador" && user.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center p-6" style={{ backgroundColor: theme.bg }}>
        <Card style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}>
          <CardContent className="p-6 text-center">
            <p style={{ color: theme.text }}>Acesso negado. Esta página é apenas para operadores.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: theme.bg }}>
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p style={{ color: theme.textMuted }}>Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-3 lg:p-6 pb-40 lg:pb-6" style={{ backgroundColor: theme.bg }}>
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-2xl font-bold mb-1" style={{ color: theme.text }}>Carregamento</h1>
              <p className="text-sm" style={{ color: theme.textMuted }}>Gerencie o carregamento, conferência e endereçamento</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={refetchAll}
              style={{ borderColor: theme.inputBorder, color: theme.text }}
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>

          {/* Barra de Filtros Rápidos e Botão de Filtros Avançados */}
          <div className="flex gap-2 items-end flex-wrap">
            <div className="flex-1 min-w-[200px]">
              <Label className="text-xs mb-1 block" style={{ color: theme.textMuted }}>Status Tracking</Label>
              <select
                value={filtroStatusTracking}
                onChange={(e) => setFiltroStatusTracking(e.target.value)}
                className="w-full h-9 px-3 rounded-md border text-sm"
                style={{ backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.text }}
              >
                <option value="todos">Todos os Status</option>
                <option value="aguardando_agendamento">Ag. Agendamento</option>
                <option value="carregamento_agendado">Carregamento Agendado</option>
                <option value="em_carregamento">Em Carregamento</option>
                <option value="carregado">Carregado</option>
                <option value="em_viagem">Em Viagem</option>
                <option value="chegada_destino">Chegou ao Destino</option>
                <option value="descarga_agendada">Descarga Agendada</option>
                <option value="em_descarga">Em Descarga</option>
                <option value="descarga_realizada">Descarga Realizada</option>
              </select>
            </div>

            <div className="flex-1 min-w-[200px]">
              <Label className="text-xs mb-1 block" style={{ color: theme.textMuted }}>Operação</Label>
              <select
                value={filtroOperacao}
                onChange={(e) => setFiltroOperacao(e.target.value)}
                className="w-full h-9 px-3 rounded-md border text-sm"
                style={{ backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.text }}
              >
                <option value="todos">Todas as Operações</option>
                {operacoes.map(op => (
                  <option key={op.id} value={op.id}>{op.nome}</option>
                ))}
              </select>
            </div>

            <Button
              variant={showFilters ? "default" : "outline"}
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="h-9"
              style={!showFilters ? {
                backgroundColor: 'transparent',
                borderColor: theme.inputBorder,
                color: theme.text
              } : {}}
            >
              <Filter className="w-4 h-4 mr-1" />
              Filtros
            </Button>

            {(filtroStatusTracking !== "todos" || filtroOperacao !== "todos" || filters.operacoesIds.length > 0 || filters.statusTracking || filters.origem || filters.destino || filters.dataInicio || filters.dataFim) && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setFiltroStatusTracking("todos");
                  setFiltroOperacao("todos");
                  setFilters({
                    operacoesIds: [],
                    statusTracking: "",
                    origem: "",
                    destino: "",
                    dataInicio: "",
                    dataFim: ""
                  });
                }}
                className="h-9"
                style={{ borderColor: theme.inputBorder, color: theme.text }}
              >
                <X className="w-4 h-4 mr-1" />
                Limpar Todos
              </Button>
            )}
          </div>

          {/* Painel de Filtros Avançados */}
          {showFilters && (
            <Card className="mt-4" style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}>
              <CardContent className="pt-4 pb-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  <div className="md:col-span-2">
                    <Label className="text-xs mb-2 block" style={{ color: theme.textMuted }}>Operações (múltiplas)</Label>
                    <div className="flex flex-wrap gap-2">
                      {operacoes.map((op) => (
                        <Badge
                          key={op.id}
                          variant={filters.operacoesIds.includes(op.id) ? "default" : "outline"}
                          className="cursor-pointer hover:opacity-80 transition-opacity"
                          style={filters.operacoesIds.includes(op.id) ? {
                            backgroundColor: '#3b82f6',
                            color: 'white'
                          } : {
                            backgroundColor: 'transparent',
                            borderColor: theme.inputBorder,
                            color: theme.text
                          }}
                          onClick={() => toggleOperacao(op.id)}
                        >
                          {op.nome}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label className="text-xs mb-1" style={{ color: theme.textMuted }}>Status Tracking</Label>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="w-full h-8 justify-between text-sm" style={{ backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.text }}>
                          {filters.statusTracking || 'Todos'}
                          <ChevronDown className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}>
                        <DropdownMenuItem onClick={() => setFilters({...filters, statusTracking: ""})} style={{ color: theme.text }}>Todos</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setFilters({...filters, statusTracking: "aguardando_agendamento"})} style={{ color: theme.text }}>Ag. Agendamento</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setFilters({...filters, statusTracking: "carregamento_agendado"})} style={{ color: theme.text }}>Carreg. Agendado</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setFilters({...filters, statusTracking: "em_carregamento"})} style={{ color: theme.text }}>Em Carregamento</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setFilters({...filters, statusTracking: "carregado"})} style={{ color: theme.text }}>Carregado</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setFilters({...filters, statusTracking: "em_viagem"})} style={{ color: theme.text }}>Em Viagem</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setFilters({...filters, statusTracking: "chegada_destino"})} style={{ color: theme.text }}>Chegada Destino</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setFilters({...filters, statusTracking: "descarga_agendada"})} style={{ color: theme.text }}>Descarga Agendada</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setFilters({...filters, statusTracking: "em_descarga"})} style={{ color: theme.text }}>Em Descarga</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setFilters({...filters, statusTracking: "descarga_realizada"})} style={{ color: theme.text }}>Descarga Realizada</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setFilters({...filters, statusTracking: "finalizado"})} style={{ color: theme.text }}>Finalizado</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div>
                    <Label className="text-xs mb-1" style={{ color: theme.textMuted }}>Origem</Label>
                    <Input
                      value={filters.origem}
                      onChange={(e) => setFilters({...filters, origem: e.target.value})}
                      placeholder="Filtrar por origem"
                      className="h-8 text-sm"
                      style={{ backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.text }}
                    />
                  </div>

                  <div>
                    <Label className="text-xs mb-1" style={{ color: theme.textMuted }}>Destino</Label>
                    <Input
                      value={filters.destino}
                      onChange={(e) => setFilters({...filters, destino: e.target.value})}
                      placeholder="Filtrar por destino"
                      className="h-8 text-sm"
                      style={{ backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.text }}
                    />
                  </div>

                  <div>
                    <Label className="text-xs mb-1" style={{ color: theme.textMuted }}>Data Início</Label>
                    <Input
                      type="date"
                      value={filters.dataInicio}
                      onChange={(e) => setFilters({...filters, dataInicio: e.target.value})}
                      className="h-8 text-sm"
                      style={{ backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.text }}
                    />
                  </div>

                  <div>
                    <Label className="text-xs mb-1" style={{ color: theme.textMuted }}>Data Fim</Label>
                    <Input
                      type="date"
                      value={filters.dataFim}
                      onChange={(e) => setFilters({...filters, dataFim: e.target.value})}
                      className="h-8 text-sm"
                      style={{ backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.text }}
                    />
                  </div>
                </div>
                <div className="flex justify-end mt-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setFilters({
                      operacoesIds: [],
                      statusTracking: "",
                      origem: "",
                      destino: "",
                      dataInicio: "",
                      dataFim: ""
                    })}
                    className="h-7 text-xs"
                    style={{
                      backgroundColor: 'transparent',
                      borderColor: theme.inputBorder,
                      color: theme.text
                    }}
                  >
                    Limpar Filtros Avançados
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Tabs */}
        <Tabs value={abaAtiva} onValueChange={setAbaAtiva} className="mb-6">
          <TabsList className="grid w-full grid-cols-3 max-w-md">
            <TabsTrigger value="carregamento" className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Carregamento
            </TabsTrigger>
            <TabsTrigger value="conferencia" className="flex items-center gap-2">
              <Scan className="w-4 h-4" />
              Conferência
            </TabsTrigger>
            <TabsTrigger value="enderecamento" className="flex items-center gap-2">
              <Grid3x3 className="w-4 h-4" />
              Endereçamento
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Coluna 1: Ordens de Carregamento */}
          <Card style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2" style={{ color: theme.text }}>
                <Truck className="w-5 h-5 text-blue-600" />
                {abaAtiva === "carregamento" && "Ordens de Carregamento"}
                {abaAtiva === "conferencia" && "Ordens em Conferência"}
                {abaAtiva === "enderecamento" && "Ordens Endereçadas"}
              </CardTitle>
              <div className="relative mt-3">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: theme.textMuted }} />
                <Input
                  placeholder="Buscar ordem..."
                  value={searchOrdem}
                  onChange={(e) => setSearchOrdem(e.target.value)}
                  className="pl-10 h-9 text-sm"
                  style={{ backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.text }}
                />
              </div>
            </CardHeader>
            <CardContent className="max-h-[600px] overflow-y-auto">
              <div className="space-y-2">
                {ordensFiltered.map(ordem => {
                  const isSelected = ordemSelecionada?.id === ordem.id;
                  const qtdNotas = ordem.notas_fiscais_ids?.length || 0;
                  const motorista = motoristas.find(m => m.id === ordem.motorista_id);
                  const operacao = operacoes.find(op => op.id === ordem.operacao_id);

                  // Verificar se é ordem mãe ou filha
                  const isOrdemMae = ordens.some(o => o.ordem_mae_id === ordem.id);
                  const isOrdemFilha = !!ordem.ordem_mae_id;
                  const ordemMae = isOrdemFilha ? ordens.find(o => o.id === ordem.ordem_mae_id) : null;

                  // Calcular progresso específico da aba
                  let progressoBadge = null;
                  if (abaAtiva === "conferencia") {
                    const volumesOrdem = volumes.filter(v => v.ordem_id === ordem.id);
                    const volumesConferidos = volumesOrdem.filter(v => v.status_volume === "carregado" || v.status_volume === "em_transito");
                    progressoBadge = (
                      <Badge className="bg-blue-600 text-white text-xs">
                        {volumesConferidos.length}/{volumesOrdem.length} conf.
                      </Badge>
                    );
                  } else if (abaAtiva === "enderecamento") {
                    const volumesOrdem = volumes.filter(v => v.ordem_id === ordem.id);
                    const volumesEnderecados = enderecamentos.filter(e => e.ordem_id === ordem.id);
                    progressoBadge = (
                      <Badge className="bg-purple-600 text-white text-xs">
                        {volumesEnderecados.length}/{volumesOrdem.length} end.
                      </Badge>
                    );
                  } else if (qtdNotas > 0) {
                    progressoBadge = (
                      <Badge className="bg-green-600 text-white text-xs">
                        {qtdNotas} NF{qtdNotas > 1 ? 's' : ''}
                      </Badge>
                    );
                  }

                  // Status tracking da ordem
                  const statusConfig = {
                    aguardando_agendamento: { label: "Ag. Agend.", color: "bg-gray-500" },
                    carregamento_agendado: { label: "Carreg. Agend.", color: "bg-blue-500" },
                    em_carregamento: { label: "Em Carreg.", color: "bg-blue-600" },
                    carregado: { label: "Carregado", color: "bg-indigo-600" },
                    em_viagem: { label: "Em Viagem", color: "bg-purple-600" },
                    chegada_destino: { label: "Chegou", color: "bg-yellow-600" },
                    descarga_agendada: { label: "Desc. Agend.", color: "bg-orange-500" },
                    em_descarga: { label: "Em Desc.", color: "bg-orange-600" },
                    descarga_realizada: { label: "Desc. Realiz.", color: "bg-green-600" },
                    finalizado: { label: "Finalizado", color: "bg-green-700" }
                  };
                  const statusInfo = statusConfig[ordem.status_tracking] || { label: "N/A", color: "bg-gray-400" };

                  const nomeMotorista = motorista?.nome || ordem.motorista_nome_temp;

                  return (
                    <div
                      key={ordem.id}
                      onClick={() => handleSelecionarOrdem(ordem)}
                      className="p-2 border rounded-lg cursor-pointer hover:shadow-md transition-all"
                      style={{
                        borderColor: isSelected ? '#3b82f6' : theme.cardBorder,
                        backgroundColor: isSelected ? (isDark ? '#1e3a8a33' : '#dbeafe33') : 'transparent',
                        borderWidth: isSelected ? '2px' : '1px'
                      }}
                    >
                      {/* Linha 1 */}
                      <div className="flex justify-between items-center mb-1">
                        <div className="flex items-center gap-1 flex-1 min-w-0">
                          <p className="font-semibold text-sm truncate" style={{ color: theme.text }}>
                            {ordem.numero_carga}
                          </p>
                          {isOrdemMae && (
                            <Badge className="text-xs bg-amber-500 text-white border-0">
                              🔗 Mãe
                            </Badge>
                          )}
                          {isOrdemFilha && (
                            <Badge className="text-xs bg-cyan-500 text-white border-0">
                              ↪️ Filha
                            </Badge>
                          )}
                          {operacao && (
                            <Badge variant="outline" className="text-xs" style={{ borderColor: theme.cardBorder }}>
                              {operacao.nome}
                            </Badge>
                          )}
                          {ordem.tipo_negociacao && (
                            <Badge className="text-xs bg-blue-500 text-white border-0">
                              {ordem.tipo_negociacao === "oferta" ? "Oferta" : ordem.tipo_negociacao === "negociando" ? "Negoc." : "Alocado"}
                            </Badge>
                          )}
                          {ordem.modalidade_carga && (
                            <Badge className="text-xs bg-purple-500 text-white border-0">
                              {ordem.modalidade_carga === "normal" ? "Normal" : ordem.modalidade_carga === "prioridade" ? "Prior." : "Express"}
                            </Badge>
                          )}
                        </div>
                        <div className="flex gap-1 items-center flex-shrink-0">
                          {progressoBadge}
                          <Badge className={`${statusInfo.color} text-white text-xs whitespace-nowrap`}>
                            {statusInfo.label}
                          </Badge>
                        </div>
                      </div>

                      {/* Linha 2 */}
                      <div className="text-xs mb-1" style={{ color: theme.textMuted }}>
                        <span className="truncate block">{ordem.cliente}</span>
                        {isOrdemFilha && ordemMae && (
                          <span className="text-xs mt-0.5 block" style={{ color: theme.textMuted }}>
                            Vinculada à: <strong style={{ color: theme.text }}>{ordemMae.numero_carga}</strong>
                          </span>
                        )}
                      </div>

                      {/* Linha 3 - Motorista e Placas */}
                      {(nomeMotorista || ordem.cavalo_placa_temp || ordem.implemento1_placa_temp) && (
                        <div className="flex items-center gap-2 flex-wrap text-xs mb-1">
                          {nomeMotorista && (
                            <span className="font-medium" style={{ color: theme.text }}>
                              👤 {nomeMotorista}
                            </span>
                          )}
                          {ordem.cavalo_placa_temp && (
                            <span className="font-medium" style={{ color: theme.text }}>
                              🚛 {ordem.cavalo_placa_temp}
                            </span>
                          )}
                          {ordem.implemento1_placa_temp && (
                            <span className="font-medium" style={{ color: theme.text }}>
                              + {ordem.implemento1_placa_temp}
                            </span>
                          )}
                          {ordem.implemento2_placa_temp && (
                            <span className="font-medium" style={{ color: theme.text }}>
                              + {ordem.implemento2_placa_temp}
                            </span>
                          )}
                          {ordem.implemento3_placa_temp && (
                            <span className="font-medium" style={{ color: theme.text }}>
                              + {ordem.implemento3_placa_temp}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Linha 4 - Volumes e Peso */}
                      <div className="flex items-center justify-end text-xs" style={{ color: theme.textMuted }}>
                        <span>
                          📦 {ordem.volumes_total_consolidado || 0}v | {(ordem.peso_total_consolidado || 0).toLocaleString()}kg
                        </span>
                      </div>
                    </div>
                  );
                })}
                {ordensFiltered.length === 0 && (
                  <div className="text-center py-8" style={{ color: theme.textMuted }}>
                    <Truck className="w-12 h-12 mx-auto mb-3 opacity-20" />
                    <p>Nenhuma ordem encontrada</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Coluna 2: Notas Fiscais Disponíveis */}
          <Card style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2" style={{ color: theme.text }}>
                <Package className="w-5 h-5 text-green-600" />
                {abaAtiva === "carregamento" && "Notas Fiscais Disponíveis"}
                {abaAtiva === "conferencia" && "Notas Fiscais Conferidas"}
                {abaAtiva === "enderecamento" && "Notas Fiscais Endereçadas"}
              </CardTitle>
              <div className="relative mt-3">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: theme.textMuted }} />
                <Input
                  placeholder="Buscar por número ou bipar chave (44 dígitos)..."
                  value={searchNota}
                  onChange={(e) => setSearchNota(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleProcessarBuscaNota(searchNota);
                    }
                  }}
                  className="pl-10 pr-24 h-10 text-sm"
                  style={{ backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.text }}
                />
                <Button
                  onClick={() => handleProcessarBuscaNota(searchNota)}
                  disabled={processandoVinculo}
                  size="sm"
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 bg-blue-600 hover:bg-blue-700"
                >
                  {processandoVinculo ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Search className="w-4 h-4 mr-1" />
                      Buscar
                    </>
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="max-h-[600px] overflow-y-auto">
              {!ordemSelecionada ? (
                <div className="text-center py-12" style={{ color: theme.textMuted }}>
                  <Truck className="w-12 h-12 mx-auto mb-3 opacity-20" />
                  <p>Selecione uma ordem de carregamento</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {notasDisponiveisFiltered.map(nota => {
                      const isSelected = notasSelecionadas.includes(nota.id);
                      const volumesNota = volumes.filter(v => v.nota_fiscal_id === nota.id);

                      // Calcular progresso específico da aba
                      let progressoInfo = null;
                      if (abaAtiva === "conferencia") {
                        const volumesConferidos = volumesNota.filter(v => v.status_volume === "carregado" || v.status_volume === "em_transito");
                        progressoInfo = (
                          <Badge className="bg-blue-500 text-white text-xs">
                            {volumesConferidos.length}/{volumesNota.length} conferidos
                          </Badge>
                        );
                      } else if (abaAtiva === "enderecamento") {
                        const volumesEnderecados = enderecamentos.filter(e => e.nota_fiscal_id === nota.id);
                        progressoInfo = (
                          <Badge className="bg-purple-500 text-white text-xs">
                            {volumesEnderecados.length}/{volumesNota.length} endereçados
                          </Badge>
                        );
                      } else {
                        progressoInfo = (
                          <Badge className="bg-blue-500 text-white text-xs">
                            Área {nota.numero_area || 'N/A'}
                          </Badge>
                        );
                      }

                      return (
                        <div
                          key={nota.id}
                          onClick={() => abaAtiva === "carregamento" && handleToggleNota(nota.id)}
                          className="p-3 border rounded-lg cursor-pointer hover:shadow-md transition-all"
                          style={{
                            borderColor: isSelected ? '#10b981' : theme.cardBorder,
                            backgroundColor: isSelected ? (isDark ? '#064e3b33' : '#d1fae533') : 'transparent',
                            borderWidth: isSelected ? '2px' : '1px',
                            cursor: abaAtiva === "carregamento" ? 'pointer' : 'default'
                          }}
                        >
                          <div className="flex items-start gap-3">
                            {abaAtiva === "carregamento" && (
                              <Checkbox
                                checked={isSelected}
                                onCheckedChange={() => handleToggleNota(nota.id)}
                                onClick={(e) => e.stopPropagation()}
                              />
                            )}
                            <div className="flex-1">
                              <div className="flex justify-between items-start mb-1">
                                <p className="font-semibold text-sm" style={{ color: theme.text }}>
                                  NF {nota.numero_nota}
                                </p>
                                {progressoInfo}
                              </div>
                              <p className="text-xs mb-1" style={{ color: theme.textMuted }}>
                                {nota.emitente_razao_social}
                              </p>
                              <div className="text-xs space-y-0.5" style={{ color: theme.textMuted }}>
                                <p>📦 {nota.quantidade_total_volumes_nf} vol. | {nota.peso_total_nf?.toLocaleString()} kg</p>
                                <p>💰 R$ {nota.valor_nota_fiscal?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  {notasDisponiveisFiltered.length === 0 && (
                    <div className="text-center py-8" style={{ color: theme.textMuted }}>
                      <Package className="w-12 h-12 mx-auto mb-3 opacity-20" />
                      {abaAtiva === "carregamento" && (
                        <>
                          <p>Nenhuma nota fiscal disponível</p>
                          <p className="text-xs mt-2">As notas aparecem aqui após serem recebidas</p>
                        </>
                      )}
                      {abaAtiva === "conferencia" && (
                        <p>Nenhuma nota fiscal conferida</p>
                      )}
                      {abaAtiva === "enderecamento" && (
                        <p>Nenhuma nota fiscal endereçada</p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Área de Ação - Desktop e Tablet */}
        {ordemSelecionada && abaAtiva === "carregamento" && (
          <Card className="mt-6 hidden lg:block" style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}>
            <CardContent className="p-4">
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                <div className="flex-1">
                  <h3 className="font-semibold mb-2" style={{ color: theme.text }}>
                    Ordem Selecionada: {ordemSelecionada.numero_carga}
                  </h3>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <Label className="text-xs" style={{ color: theme.textMuted }}>Notas Vinculadas</Label>
                      <p className="font-semibold" style={{ color: theme.text }}>
                        {ordemSelecionada.notas_fiscais_ids?.length || 0}
                      </p>
                    </div>
                    <div>
                      <Label className="text-xs" style={{ color: theme.textMuted }}>Total Volumes</Label>
                      <p className="font-semibold" style={{ color: theme.text }}>
                        {ordemSelecionada.volumes_total_consolidado || 0}
                      </p>
                    </div>
                    <div>
                      <Label className="text-xs" style={{ color: theme.textMuted }}>Total Peso</Label>
                      <p className="font-semibold" style={{ color: theme.text }}>
                        {ordemSelecionada.peso_total_consolidado?.toLocaleString() || 0} kg
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {ordemSelecionada.tipo_ordem !== "ordem_filha" && (
                    <Button
                      onClick={() => setShowOrdemFilhaForm(true)}
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Criar Ordem Filha
                    </Button>
                  )}
                  {ordemSelecionada.notas_fiscais_ids?.length > 0 && (
                    <>
                      <Button
                        onClick={() => setShowConferencia(true)}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        <Scan className="w-4 h-4 mr-2" />
                        Conferência
                      </Button>
                      <Button
                        onClick={() => setShowEnderecamento(true)}
                        className="bg-purple-600 hover:bg-purple-700"
                      >
                        <Grid3x3 className="w-4 h-4 mr-2" />
                        Endereçamento
                      </Button>
                    </>
                  )}
                  <Button
                    onClick={handleVincularNotas}
                    disabled={vincularNotasMutation.isPending || notasSelecionadas.length === 0}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Vincular {notasSelecionadas.length > 0 && `(${notasSelecionadas.length})`}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setOrdemSelecionada(null);
                      setNotasSelecionadas([]);
                    }}
                    style={{ borderColor: theme.cardBorder, color: theme.text }}
                  >
                    Limpar Seleção
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Barra de Ação Fixa Mobile e Tablet */}
        {ordemSelecionada && abaAtiva === "carregamento" && (
          <div 
            className="lg:hidden fixed bottom-0 left-0 right-0 border-t shadow-2xl"
            style={{ 
              backgroundColor: theme.cardBg, 
              borderColor: theme.cardBorder,
              zIndex: 9999,
              paddingBottom: 'env(safe-area-inset-bottom, 0px)'
            }}
          >
            <div className="p-3 space-y-2">
              <div className="flex items-center justify-between mb-2">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate" style={{ color: theme.text }}>
                    {ordemSelecionada.numero_carga}
                  </p>
                  <p className="text-xs truncate" style={{ color: theme.textMuted }}>
                    {ordemSelecionada.notas_fiscais_ids?.length || 0} NF | {ordemSelecionada.volumes_total_consolidado || 0}v | {ordemSelecionada.peso_total_consolidado?.toLocaleString() || 0}kg
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setOrdemSelecionada(null);
                    setNotasSelecionadas([]);
                  }}
                  className="h-7 w-7 p-0"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  onClick={handleVincularNotas}
                  disabled={vincularNotasMutation.isPending || notasSelecionadas.length === 0}
                  size="sm"
                  className="bg-green-600 hover:bg-green-700 text-xs h-9 col-span-2"
                >
                  <Plus className="w-3 h-3 mr-1" />
                  Vincular {notasSelecionadas.length > 0 && `(${notasSelecionadas.length})`}
                </Button>
                {ordemSelecionada.notas_fiscais_ids?.length > 0 && (
                  <>
                    <Button
                      onClick={() => setShowConferencia(true)}
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-700 text-xs h-9"
                    >
                      <Scan className="w-3 h-3 mr-1" />
                      Conferência
                    </Button>
                    <Button
                      onClick={() => setShowEnderecamento(true)}
                      size="sm"
                      className="bg-purple-600 hover:bg-purple-700 text-xs h-9"
                    >
                      <Grid3x3 className="w-3 h-3 mr-1" />
                      Endereçamento
                    </Button>
                  </>
                )}
                {ordemSelecionada.tipo_ordem !== "ordem_filha" && (
                  <Button
                    onClick={() => setShowOrdemFilhaForm(true)}
                    size="sm"
                    variant="outline"
                    className="text-xs h-9 col-span-2"
                    style={{ borderColor: theme.cardBorder, color: theme.text }}
                  >
                    <Plus className="w-3 h-3 mr-1" />
                    Criar Ordem Filha
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions para Conferência e Endereçamento - Desktop e Tablet */}
        {ordemSelecionada && (abaAtiva === "conferencia" || abaAtiva === "enderecamento") && (
          <Card className="mt-6 hidden lg:block" style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold mb-1" style={{ color: theme.text }}>
                    {ordemSelecionada.numero_carga}
                  </h3>
                  <p className="text-sm" style={{ color: theme.textMuted }}>
                    {ordemSelecionada.cliente} | {ordemSelecionada.destino}
                  </p>
                </div>
                <div className="flex gap-2">
                  {ordemSelecionada.tipo_ordem !== "ordem_filha" && (
                    <Button
                      onClick={() => setShowOrdemFilhaForm(true)}
                      variant="outline"
                      style={{ borderColor: theme.cardBorder, color: theme.text }}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Criar Ordem Filha
                    </Button>
                  )}
                  {abaAtiva === "conferencia" && (
                    <Button
                      onClick={() => setShowConferencia(true)}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Scan className="w-4 h-4 mr-2" />
                      Abrir Conferência
                    </Button>
                  )}
                  {abaAtiva === "enderecamento" && (
                    <Button
                      onClick={() => setShowEnderecamento(true)}
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      <Grid3x3 className="w-4 h-4 mr-2" />
                      Abrir Endereçamento
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Barra de Ação Fixa Mobile e Tablet - Conferência/Endereçamento */}
        {ordemSelecionada && (abaAtiva === "conferencia" || abaAtiva === "enderecamento") && (
          <div 
            className="lg:hidden fixed bottom-0 left-0 right-0 border-t shadow-2xl"
            style={{ 
              backgroundColor: theme.cardBg, 
              borderColor: theme.cardBorder,
              zIndex: 9999,
              paddingBottom: 'env(safe-area-inset-bottom, 0px)'
            }}
          >
            <div className="p-3 space-y-2">
              <div className="flex items-center justify-between mb-2">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate" style={{ color: theme.text }}>
                    {ordemSelecionada.numero_carga}
                  </p>
                  <p className="text-xs truncate" style={{ color: theme.textMuted }}>
                    {ordemSelecionada.cliente}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setOrdemSelecionada(null)}
                  className="h-7 w-7 p-0"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {abaAtiva === "conferencia" && (
                  <Button
                    onClick={() => setShowConferencia(true)}
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700 text-xs h-9 col-span-2"
                  >
                    <Scan className="w-3 h-3 mr-1" />
                    Abrir Conferência
                  </Button>
                )}
                {abaAtiva === "enderecamento" && (
                  <Button
                    onClick={() => setShowEnderecamento(true)}
                    size="sm"
                    className="bg-purple-600 hover:bg-purple-700 text-xs h-9 col-span-2"
                  >
                    <Grid3x3 className="w-3 h-3 mr-1" />
                    Abrir Endereçamento
                  </Button>
                )}
                {ordemSelecionada.tipo_ordem !== "ordem_filha" && (
                  <Button
                    onClick={() => setShowOrdemFilhaForm(true)}
                    size="sm"
                    variant="outline"
                    className="text-xs h-9 col-span-2"
                    style={{ borderColor: theme.cardBorder, color: theme.text }}
                  >
                    <Plus className="w-3 h-3 mr-1" />
                    Criar Ordem Filha
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Notas Vinculadas */}
        {ordemSelecionada && getNotasVinculadas.length > 0 && (
          <Card className="mt-6" style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2" style={{ color: theme.text }}>
                <CheckCircle className="w-5 h-5 text-green-600" />
                Notas Fiscais Vinculadas à Ordem
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {getNotasVinculadas.map(nota => {
                  const volumesNota = volumes.filter(v => v.nota_fiscal_id === nota.id);
                  
                  return (
                    <div
                      key={nota.id}
                      className="p-3 border rounded-lg"
                      style={{ borderColor: theme.cardBorder, backgroundColor: isDark ? '#064e3b22' : '#d1fae522' }}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-semibold text-sm" style={{ color: theme.text }}>
                              NF {nota.numero_nota}
                            </p>
                            <Badge className="bg-green-600 text-white text-xs">
                              Área {nota.numero_area || 'N/A'}
                            </Badge>
                          </div>
                          <p className="text-xs mb-1" style={{ color: theme.textMuted }}>
                            {nota.emitente_razao_social}
                          </p>
                          <div className="text-xs" style={{ color: theme.textMuted }}>
                            📦 {nota.quantidade_total_volumes_nf} vol. | {nota.peso_total_nf?.toLocaleString()} kg | 
                            R$ {nota.valor_nota_fiscal?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDesvincularNota(nota.id)}
                          disabled={desvincularNotaMutation.isPending}
                          style={{ borderColor: '#ef4444', color: '#ef4444' }}
                          className="h-7"
                        >
                          <Minus className="w-3 h-3 mr-1" />
                          Desvincular
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Totais */}
              <div className="mt-4 pt-4 border-t grid grid-cols-3 gap-4" style={{ borderColor: theme.cardBorder }}>
                <div>
                  <Label className="text-xs" style={{ color: theme.textMuted }}>Total Volumes</Label>
                  <p className="text-lg font-bold text-blue-600">
                    {ordemSelecionada.volumes_total_consolidado || 0}
                  </p>
                </div>
                <div>
                  <Label className="text-xs" style={{ color: theme.textMuted }}>Total Peso</Label>
                  <p className="text-lg font-bold text-blue-600">
                    {ordemSelecionada.peso_total_consolidado?.toLocaleString() || 0} kg
                  </p>
                </div>
                <div>
                  <Label className="text-xs" style={{ color: theme.textMuted }}>Total Valor</Label>
                  <p className="text-lg font-bold text-green-600">
                    R$ {ordemSelecionada.valor_total_consolidado?.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Modal de Conferência */}
      {showConferencia && ordemSelecionada && (
        <ConferenciaVolumes
          ordem={ordemSelecionada}
          notasFiscais={notasFiscais.filter(nota => 
            ordemSelecionada.notas_fiscais_ids?.includes(nota.id)
          )}
          volumes={volumes}
          onClose={() => setShowConferencia(false)}
          onComplete={async () => {
            setShowConferencia(false);
            await refetchAll();
            const ordemAtualizada = await base44.entities.OrdemDeCarregamento.get(ordemSelecionada.id);
            setOrdemSelecionada(ordemAtualizada);
          }}
        />
      )}

      {/* Modal de Endereçamento */}
      {showEnderecamento && ordemSelecionada && (
        <EnderecamentoVeiculo
          key={`enderecamento-${ordemSelecionada.id}-${ordemSelecionada.notas_fiscais_ids?.length || 0}`}
          ordem={ordemSelecionada}
          notasFiscais={notasFiscais.filter(nota => 
            ordemSelecionada.notas_fiscais_ids?.includes(nota.id)
          )}
          volumes={volumes.filter(v => 
            ordemSelecionada.notas_fiscais_ids?.includes(v.ordem_id) || 
            ordemSelecionada.notas_fiscais_ids?.some(nfId => {
              const nf = notasFiscais.find(n => n.id === nfId);
              return nf && v.nota_fiscal_id === nf.id;
            })
          )}
          onClose={() => setShowEnderecamento(false)}
          onComplete={async () => {
            setShowEnderecamento(false);
            await refetchAll();
            const ordemAtualizada = await base44.entities.OrdemDeCarregamento.get(ordemSelecionada.id);
            setOrdemSelecionada(ordemAtualizada);
          }}
        />
      )}

      {/* Modal de Ordem Filha */}
      {showOrdemFilhaForm && ordemSelecionada && (
        <OrdemFilhaForm
          open={showOrdemFilhaForm}
          onClose={() => setShowOrdemFilhaForm(false)}
          ordemMae={ordemSelecionada}
          onSuccess={async () => {
            setShowOrdemFilhaForm(false);
            await refetchAll();
          }}
          motoristas={motoristas}
          veiculos={veiculos}
        />
      )}
    </div>
  );
}