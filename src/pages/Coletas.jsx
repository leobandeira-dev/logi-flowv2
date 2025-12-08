import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, ChevronDown, RefreshCw } from "lucide-react";
import { toast } from 'react-hot-toast';
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import OrdensTableEditable from "../components/ordens/OrdensTableEditable";
import OrdemDetails from "../components/ordens/OrdemDetails";
import FiltrosPredefinidos from "../components/filtros/FiltrosPredefinidos";
import PaginacaoControles from "../components/filtros/PaginacaoControles";
import OrdemFormCompleto from "../components/ordens/OrdemFormCompleto";

export default function Coletas() {
  const [ordens, setOrdens] = useState([]);
  const [motoristas, setMotoristas] = useState([]);
  const [veiculos, setVeiculos] = useState([]);
  const [operacoes, setOperacoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrdem, setSelectedOrdem] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const [isDark, setIsDark] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    operacoesIds: [],
    status: "",
    statusColeta: [],
    tiposNegociacao: [], // Filtro de tipos de negociação
    origem: "",
    destino: "",
    dataInicio: "",
    dataFim: ""
  });
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [limite, setLimite] = useState(50);
  const [showOrdemForm, setShowOrdemForm] = useState(false);
  const [editingOrdem, setEditingOrdem] = useState(null);

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
    loadCurrentUser();
    loadData();
  }, []);

  const loadCurrentUser = async () => {
    try {
      const user = await base44.auth.me();
      setCurrentUser(user);
      return user;
    } catch (error) {
      console.error("Erro ao carregar usuário:", error);
      toast.error("Erro ao carregar dados do usuário");
      return null;
    }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const user = currentUser || await base44.auth.me();
      if (!user) {
        toast.error("Usuário não autenticado");
        setLoading(false);
        return;
      }

      const [ordensData, motoristasData, veiculosData, operacoesData] = await Promise.all([
        base44.entities.OrdemDeCarregamento.list("-data_solicitacao"),
        base44.entities.Motorista.list(),
        base44.entities.Veiculo.list(),
        base44.entities.Operacao.list()
      ]);

      // Filtrar APENAS coletas (tipo_ordem = coleta OU numero_coleta preenchido OU tipo_registro de coleta legado)
      let coletasFiltradas = ordensData.filter(o => {
        // Se tem tipo_ordem = coleta, incluir
        if (o.tipo_ordem === "coleta") return true;

        // Se tem numero_coleta preenchido (formato COL-YYYY-NNNNN), incluir
        if (o.numero_coleta && o.numero_coleta.startsWith("COL-")) return true;

        // Se tem tipo_registro de coleta legado, incluir
        const tiposPermitidos = ["coleta_solicitada", "coleta_aprovada", "coleta_reprovada"];
        return tiposPermitidos.includes(o.tipo_registro);
      });

      // Filtrar baseado no tipo de perfil do usuário
      if (user.role === "admin") {
        // Admin vê todas as ordens sem restrição
        // coletasFiltradas já contém todas as coletas
      } else if (user.tipo_perfil === "operador") {
        // Operador vê todas ordens de seus clientes e fornecedores de seus clientes
        coletasFiltradas = user.empresa_id
          ? coletasFiltradas.filter(o => o.empresa_id === user.empresa_id || !o.empresa_id)
          : coletasFiltradas;
      } else if (user.tipo_perfil === "cliente") {
        // Cliente vê ordens onde seu CNPJ está como remetente ou destinatário
        coletasFiltradas = coletasFiltradas.filter(o => 
          o.cliente_cnpj === user.cnpj_associado || 
          o.destinatario_cnpj === user.cnpj_associado
        );
      } else if (user.tipo_perfil === "fornecedor") {
        // Fornecedor vê ordens onde seu CNPJ está como remetente ou destinatário
        coletasFiltradas = coletasFiltradas.filter(o => 
          o.cliente_cnpj === user.cnpj_associado || 
          o.destinatario_cnpj === user.cnpj_associado
        );
      }
      
      setOrdens(coletasFiltradas);
      setMotoristas(motoristasData);
      setVeiculos(veiculosData);
      setOperacoes(operacoesData.filter(op => op.ativo));
    } catch (error) {
    console.error("Erro ao carregar dados:", error);
    toast.error("Erro ao carregar dados. Tente novamente.");
    } finally {
    setLoading(false);
    }
    };

  const loadOrdemDetails = async (id) => {
    try {
      const ordemData = await base44.entities.OrdemDeCarregamento.list();
      const ordem = ordemData.find(o => o.id === id);
      if (ordem) {
        setSelectedOrdem(ordem);
      }
    } catch (error) {
      console.error("Erro ao carregar ordem:", error);
    }
  };

  const handleEdit = (ordem) => {
    setEditingOrdem(ordem);
    setShowOrdemForm(true);
  };

  const handleViewDetails = (ordem) => {
    setSelectedOrdem(ordem);
  };

  const handleDelete = async (ordem) => {
    if (!confirm(`Tem certeza que deseja excluir a coleta ${ordem.numero_coleta || ordem.numero_carga}?`)) {
      return;
    }

    try {
      await base44.entities.OrdemDeCarregamento.delete(ordem.id);
      toast.success("Coleta excluída com sucesso!");
      loadData();
    } catch (error) {
      console.error("Erro ao excluir coleta:", error);
      toast.error("Erro ao excluir coleta");
    }
  };

  const handleOrdemFormClose = () => {
    setShowOrdemForm(false);
    setEditingOrdem(null);
  };

  const handleOrdemFormSuccess = () => {
    setShowOrdemForm(false);
    setEditingOrdem(null);
    loadData();
  };

  const toggleOperacao = (operacaoId) => {
    setFilters(prev => {
      const operacoesIds = prev.operacoesIds.includes(operacaoId)
        ? prev.operacoesIds.filter(id => id !== operacaoId)
        : [...prev.operacoesIds, operacaoId];
      return { ...prev, operacoesIds };
    });
  };

  const toggleStatusColeta = (statusColeta) => {
    setFilters(prev => {
      const statusColetaIds = prev.statusColeta.includes(statusColeta)
        ? prev.statusColeta.filter(s => s !== statusColeta)
        : [...prev.statusColeta, statusColeta];
      return { ...prev, statusColeta: statusColetaIds };
    });
  };

  const toggleTipoNegociacao = (tipoNegociacao) => {
    setFilters(prev => {
      const tiposNegociacao = prev.tiposNegociacao.includes(tipoNegociacao)
        ? prev.tiposNegociacao.filter(t => t !== tipoNegociacao)
        : [...prev.tiposNegociacao, tipoNegociacao];
      return { ...prev, tiposNegociacao };
    });
  };

  const filteredOrdens = ordens.filter(ordem => {
    // Garantir que apenas coletas sejam exibidas
    // Se tipo_ordem é coleta, sempre incluir. Caso contrário, verificar tipo_registro legado
    if (ordem.tipo_ordem !== "coleta") {
      const tiposPermitidos = ["coleta_solicitada", "coleta_aprovada", "coleta_reprovada"];
      if (!tiposPermitidos.includes(ordem.tipo_registro)) return false;
    }
    // Se chegou aqui, é uma coleta válida (tipo_ordem=coleta OU tipo_registro de coleta)

    if (filters.operacoesIds.length > 0 && !filters.operacoesIds.includes(ordem.operacao_id)) return false;
    if (filters.status && ordem.status !== filters.status) return false;

    // Filtro de status de coleta (múltipla seleção)
    if (filters.statusColeta.length > 0 && !filters.statusColeta.includes(ordem.tipo_registro)) {
      return false;
    }

    // Filtro de tipo de negociação (múltipla seleção)
    if (filters.tiposNegociacao.length > 0) {
      // Calcular tipo_negociacao dinamicamente
      let tipoNegociacao = ordem.tipo_negociacao;
      if (!tipoNegociacao) {
        const temMotorista = ordem.motorista_id || ordem.motorista_nome_temp;
        const temVeiculo = ordem.cavalo_id;
        if (temMotorista && temVeiculo) {
          tipoNegociacao = "alocado";
        } else if (temMotorista) {
          tipoNegociacao = "negociando";
        } else {
          tipoNegociacao = "oferta";
        }
      }
      if (!filters.tiposNegociacao.includes(tipoNegociacao)) {
        return false;
      }
    }
    
    if (filters.origem && !ordem.origem?.toLowerCase().includes(filters.origem.toLowerCase())) return false;
    if (filters.destino && !ordem.destino?.toLowerCase().includes(filters.destino.toLowerCase())) return false;
    
    if (filters.dataInicio && ordem.data_solicitacao) {
      if (new Date(ordem.data_solicitacao) < new Date(filters.dataInicio)) return false;
    }
    
    if (filters.dataFim && ordem.data_solicitacao) {
      const dataFim = new Date(filters.dataFim);
      dataFim.setHours(23, 59, 59, 999);
      if (new Date(ordem.data_solicitacao) > dataFim) return false;
    }

    if (!searchTerm) return true;
    
    const term = searchTerm.toLowerCase();
    return (
      ordem.numero_carga?.toLowerCase().includes(term) ||
      ordem.numero_coleta?.toLowerCase().includes(term) ||
      ordem.cliente?.toLowerCase().includes(term) ||
      ordem.origem?.toLowerCase().includes(term) ||
      ordem.destino?.toLowerCase().includes(term) ||
      ordem.produto?.toLowerCase().includes(term)
    );
  });

  const inicio = (paginaAtual - 1) * limite;
  const fim = inicio + limite;
  const ordensExibidas = filteredOrdens.slice(inicio, fim);

  const theme = {
    bg: isDark ? '#0f172a' : '#f9fafb',
    text: isDark ? '#ffffff' : '#111827',
    textMuted: isDark ? '#9ca3af' : '#6b7280',
    inputBg: isDark ? '#1e293b' : '#ffffff',
    inputBorder: isDark ? '#334155' : '#d1d5db',
    cardBg: isDark ? '#1e293b' : '#ffffff',
    cardBorder: isDark ? '#334155' : '#e5e7eb',
  };

  return (
    <div className="p-6 min-h-screen transition-colors" style={{ backgroundColor: theme.bg }}>
      <div className="w-full mx-auto">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
          <div>
            <h1 className="text-2xl font-bold mb-1" style={{ color: theme.text }}>Gestão de Coletas</h1>
            <p className="text-sm" style={{ color: theme.textMuted }}>Visualize e acompanhe todas as coletas aprovadas</p>
          </div>
          
          <div className="flex gap-2 w-full lg:w-auto">
            <div className="relative flex-1 lg:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: theme.textMuted }} />
              <Input
                placeholder="Buscar coletas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-9 text-sm"
                style={{ backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.text }}
              />
            </div>

            <FiltrosPredefinidos
              rota="coletas"
              filtrosAtuais={filters}
              onAplicarFiltro={(novosFiltros) => {
                setFilters(novosFiltros);
                setPaginaAtual(1);
              }}
            />
            <PaginacaoControles
              paginaAtual={paginaAtual}
              totalRegistros={filteredOrdens.length}
              limite={limite}
              onPaginaAnterior={() => setPaginaAtual(prev => Math.max(1, prev - 1))}
              onProximaPagina={() => setPaginaAtual(prev => prev + 1)}
              isDark={isDark}
            />
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
              <Filter className="w-4 h-4" />
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={loadData}
              className="h-9"
              style={{
                backgroundColor: 'transparent',
                borderColor: theme.inputBorder,
                color: theme.text
              }}
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {showFilters && (
          <Card className="mb-4" style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}>
            <CardContent className="pt-4 pb-4">
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-3">
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

                <div className="md:col-span-2">
                  <Label className="text-xs mb-2 block" style={{ color: theme.textMuted }}>Status de Coleta (múltiplos)</Label>
                  <div className="flex flex-wrap gap-2">
                    <Badge
                      variant={filters.statusColeta.includes("coleta_solicitada") ? "default" : "outline"}
                      className="cursor-pointer hover:opacity-80 transition-opacity"
                      style={filters.statusColeta.includes("coleta_solicitada") ? {
                        backgroundColor: '#f59e0b',
                        color: 'white'
                      } : {
                        backgroundColor: 'transparent',
                        borderColor: theme.inputBorder,
                        color: theme.text
                      }}
                      onClick={() => toggleStatusColeta("coleta_solicitada")}
                    >
                      Solicitada
                    </Badge>
                    <Badge
                      variant={filters.statusColeta.includes("coleta_aprovada") ? "default" : "outline"}
                      className="cursor-pointer hover:opacity-80 transition-opacity"
                      style={filters.statusColeta.includes("coleta_aprovada") ? {
                        backgroundColor: '#10b981',
                        color: 'white'
                      } : {
                        backgroundColor: 'transparent',
                        borderColor: theme.inputBorder,
                        color: theme.text
                      }}
                      onClick={() => toggleStatusColeta("coleta_aprovada")}
                    >
                      Aprovada
                    </Badge>
                    <Badge
                      variant={filters.statusColeta.includes("coleta_reprovada") ? "default" : "outline"}
                      className="cursor-pointer hover:opacity-80 transition-opacity"
                      style={filters.statusColeta.includes("coleta_reprovada") ? {
                        backgroundColor: '#ef4444',
                        color: 'white'
                      } : {
                        backgroundColor: 'transparent',
                        borderColor: theme.inputBorder,
                        color: theme.text
                      }}
                      onClick={() => toggleStatusColeta("coleta_reprovada")}
                    >
                      Reprovada
                    </Badge>
                  </div>
                </div>

                <div className="md:col-span-2">
                  <Label className="text-xs mb-2 block" style={{ color: theme.textMuted }}>Tipo de Negociação (múltiplos)</Label>
                  <div className="flex flex-wrap gap-2">
                    <Badge
                      variant={filters.tiposNegociacao.includes("oferta") ? "default" : "outline"}
                      className="cursor-pointer hover:opacity-80 transition-opacity"
                      style={filters.tiposNegociacao.includes("oferta") ? {
                        backgroundColor: '#10b981',
                        color: 'white'
                      } : {
                        backgroundColor: 'transparent',
                        borderColor: theme.inputBorder,
                        color: theme.text
                      }}
                      onClick={() => toggleTipoNegociacao("oferta")}
                    >
                      Oferta
                    </Badge>
                    <Badge
                      variant={filters.tiposNegociacao.includes("negociando") ? "default" : "outline"}
                      className="cursor-pointer hover:opacity-80 transition-opacity"
                      style={filters.tiposNegociacao.includes("negociando") ? {
                        backgroundColor: '#f59e0b',
                        color: 'white'
                      } : {
                        backgroundColor: 'transparent',
                        borderColor: theme.inputBorder,
                        color: theme.text
                      }}
                      onClick={() => toggleTipoNegociacao("negociando")}
                    >
                      Negociando
                    </Badge>
                    <Badge
                      variant={filters.tiposNegociacao.includes("alocado") ? "default" : "outline"}
                      className="cursor-pointer hover:opacity-80 transition-opacity"
                      style={filters.tiposNegociacao.includes("alocado") ? {
                        backgroundColor: '#3b82f6',
                        color: 'white'
                      } : {
                        backgroundColor: 'transparent',
                        borderColor: theme.inputBorder,
                        color: theme.text
                      }}
                      onClick={() => toggleTipoNegociacao("alocado")}
                    >
                      Alocado
                    </Badge>
                  </div>
                </div>

                <div>
                  <Label className="text-xs mb-1" style={{ color: theme.textMuted }}>Status</Label>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="w-full h-8 justify-between text-sm" style={{ backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.text }}>
                        {filters.status || 'Todos'}
                        <ChevronDown className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}>
                      <DropdownMenuItem onClick={() => setFilters({...filters, status: ""})} style={{ color: theme.text }}>Todos</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setFilters({...filters, status: "novo"})} style={{ color: theme.text }}>Novo</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setFilters({...filters, status: "pendente_cadastro"})} style={{ color: theme.text }}>Pendente Cadastro</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setFilters({...filters, status: "aguardando_carregamento"})} style={{ color: theme.text }}>Aguardando Carregamento</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setFilters({...filters, status: "em_transito"})} style={{ color: theme.text }}>Em Trânsito</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setFilters({...filters, status: "entregue"})} style={{ color: theme.text }}>Entregue</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setFilters({...filters, status: "finalizado"})} style={{ color: theme.text }}>Finalizado</DropdownMenuItem>
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
              <div className="flex justify-end mt-3 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setFilters({
                    operacoesIds: [], status: "", statusColeta: [],
                    tiposNegociacao: [], origem: "", destino: "", dataInicio: "", dataFim: ""
                  })}
                  className="h-7 text-xs"
                  style={{
                    backgroundColor: 'transparent',
                    borderColor: theme.inputBorder,
                    color: theme.text
                  }}
                >
                  Limpar Filtros
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <OrdensTableEditable
          ordens={ordensExibidas}
          motoristas={motoristas}
          veiculos={veiculos}
          operacoes={operacoes}
          loading={loading}
          onEdit={handleEdit}
          onViewDetails={handleViewDetails}
          onDelete={handleDelete}
          onUpdate={loadData}
        />
      </div>

      {selectedOrdem && (
        <OrdemDetails
          open={!!selectedOrdem}
          onClose={() => setSelectedOrdem(null)}
          ordem={selectedOrdem}
          motoristas={motoristas}
          veiculos={veiculos}
          onUpdate={loadData}
        />
      )}

      {showOrdemForm && (
        <OrdemFormCompleto
          open={showOrdemForm}
          onClose={handleOrdemFormClose}
          ordem={editingOrdem}
          motoristas={motoristas}
          veiculos={veiculos}
          operacoes={operacoes}
          onSuccess={handleOrdemFormSuccess}
        />
      )}
    </div>
  );
}