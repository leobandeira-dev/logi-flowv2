import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Package,
  Users,
  FileText,
  CheckCircle2,
  Calculator,
  TrendingUp,
  Building2,
  AlertCircle,
  ArrowRight,
  Workflow,
  MessageCircle,
  Edit2,
  Save,
  X,
  Clock
} from "lucide-react";
import { toast } from "sonner";
import { createPageUrl } from "@/utils";
import { Label } from "@/components/ui/label";

const PACOTE_BASE = {
  nome: "Pacote Base",
  preco: 299,
  descricao: "Núcleo essencial do sistema",
  obrigatorio: true,
  modulos: [
    "Dashboard Executivo",
    "Ordens de Carregamento",
    "Tracking Logístico",
    "Gestão de Usuários",
    "Motoristas e Veículos",
    "Operações (Config SLA)",
    "Parceiros"
  ]
};

const ADDONS = [
  {
    id: "workflow_qualidade",
    nome: "Workflow & Qualidade",
    descricao: "Processos customizáveis com métricas de performance",
    preco: 149,
    icon: Workflow,
    modulos: [
      "Fluxo BPMN Customizável",
      "Gestão de Ocorrências",
      "Sistema de Gamificação"
    ]
  },
  {
    id: "wms_completo",
    nome: "WMS Completo",
    descricao: "Gestão completa de armazém e expedição",
    preco: 199,
    icon: Package,
    modulos: [
      "Recebimento de NF-e",
      "Gestão de Notas Fiscais",
      "Etiquetas Mãe (Unitização)",
      "Carregamento e Expedição",
      "Ordem de Entrega"
    ]
  },
  {
    id: "portal_b2b",
    nome: "Portal B2B",
    descricao: "Self-service para clientes e fornecedores",
    preco: 149,
    icon: Users,
    modulos: [
      "Dashboard Coletas",
      "Solicitar Coleta (Fornecedor)",
      "Aprovar Coletas (Cliente)"
    ]
  },
  {
    id: "comunicacao",
    nome: "Comunicação Avançada",
    descricao: "App móvel e atendimento com IA",
    preco: 99,
    icon: MessageCircle,
    modulos: [
      "App Motorista (SMS)",
      "SAC com Chatbot IA"
    ]
  }
];

const FAIXAS_PROCESSAMENTO = [
  { volume: 1000, preco: 450, nome: "Inicial" },
  { volume: 2500, preco: 950, nome: "Crescimento" },
  { volume: 5000, preco: 1450, nome: "Consolidado" },
  { volume: 10000, preco: 1950, nome: "Expansão" },
  { volume: 15000, preco: 2700, nome: "Enterprise" }
];

export default function Precificacao() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isDark, setIsDark] = useState(false);
  const [addonsSelecionados, setAddonsSelecionados] = useState([]);
  const [volumeColetas, setVolumeColetas] = useState(0);
  const [volumeCarregamentos, setVolumeCarregamentos] = useState(0);
  const [volumeEntregas, setVolumeEntregas] = useState(0);
  const [volumeNotasFiscais, setVolumeNotasFiscais] = useState(0);
  const [editandoPrecos, setEditandoPrecos] = useState(false);
  const [precosCustomizados, setPrecosCustomizados] = useState(null);
  const [cnpj, setCnpj] = useState("");
  const [dadosCNPJ, setDadosCNPJ] = useState(null);
  const [carregandoCNPJ, setCarregandoCNPJ] = useState(false);
  const [leadSelecionado, setLeadSelecionado] = useState(null);

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
    loadUser();
    carregarPrecosCustomizados();
    carregarLeadDaURL();
  }, []);

  const carregarLeadDaURL = async () => {
    const params = new URLSearchParams(window.location.search);
    const leadId = params.get('lead_id');
    
    if (leadId) {
      try {
        const leads = await base44.entities.Lead.filter({ id: leadId });
        if (leads.length > 0) {
          const lead = leads[0];
          setLeadSelecionado(lead);
          
          if (lead.cnpj) {
            setCnpj(lead.cnpj);
            setDadosCNPJ({
              cnpj: lead.cnpj,
              razao_social: lead.razao_social,
              nome_fantasia: lead.nome_fantasia,
              telefone: lead.telefone,
              email: lead.email,
              endereco_completo: lead.endereco_completo,
              cidade: lead.cidade,
              uf: lead.uf,
              cep: lead.cep
            });
          }
          
          if (lead.addons_selecionados) {
            const addons = JSON.parse(lead.addons_selecionados);
            setAddonsSelecionados(addons.map(a => a.id));
          }
          
          setVolumeColetas(lead.volume_coletas || 0);
          setVolumeCarregamentos(lead.volume_carregamentos || 0);
          setVolumeEntregas(lead.volume_entregas || 0);
          setVolumeNotasFiscais(lead.volume_notas_fiscais || 0);
          
          toast.success("Lead carregado com sucesso!");
        }
      } catch (error) {
        console.error("Erro ao carregar lead:", error);
      }
    }
  };

  const carregarPrecosCustomizados = () => {
    const saved = localStorage.getItem('precos_customizados');
    if (saved) {
      setPrecosCustomizados(JSON.parse(saved));
    }
  };

  const salvarPrecosCustomizados = (novosPrecos) => {
    localStorage.setItem('precos_customizados', JSON.stringify(novosPrecos));
    setPrecosCustomizados(novosPrecos);
    setEditandoPrecos(false);
  };

  const resetarPrecos = () => {
    localStorage.removeItem('precos_customizados');
    setPrecosCustomizados(null);
    setEditandoPrecos(false);
  };

  const obterPacoteBase = () => {
    if (precosCustomizados?.pacoteBase) {
      return { ...PACOTE_BASE, preco: precosCustomizados.pacoteBase };
    }
    return PACOTE_BASE;
  };

  const obterAddons = () => {
    if (!precosCustomizados?.addons) return ADDONS;
    return ADDONS.map(addon => ({
      ...addon,
      preco: precosCustomizados.addons[addon.id] || addon.preco
    }));
  };

  const loadUser = async () => {
    setLoading(true);
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
    } catch (error) {
      console.error("Erro ao carregar usuário:", error);
    } finally {
      setLoading(false);
    }
  };

  const consultarCNPJ = async () => {
    if (!cnpj) {
      toast.error("Digite um CNPJ");
      return;
    }

    setCarregandoCNPJ(true);
    try {
      const { consultarCNPJ: consultarCNPJFunc } = await import("@/functions/consultarCNPJ");
      const response = await consultarCNPJFunc({ cnpj });
      const dados = response.data;
      
      setDadosCNPJ(dados);
      toast.success("Dados do CNPJ carregados com sucesso!");
    } catch (error) {
      console.error("Erro ao consultar CNPJ:", error);
      toast.error("Erro ao consultar CNPJ. Verifique o número e tente novamente.");
    } finally {
      setCarregandoCNPJ(false);
    }
  };

  const salvarProposta = async () => {
    if (!dadosCNPJ) {
      toast.error("Consulte um CNPJ primeiro");
      return;
    }

    try {
      const totais = calcularTotais();
      
      const leadData = {
        cnpj: dadosCNPJ.cnpj,
        razao_social: dadosCNPJ.razao_social,
        nome_fantasia: dadosCNPJ.nome_fantasia,
        telefone: dadosCNPJ.telefone,
        email: dadosCNPJ.email,
        endereco_completo: dadosCNPJ.endereco_completo,
        cidade: dadosCNPJ.cidade,
        uf: dadosCNPJ.uf,
        cep: dadosCNPJ.cep,
        status_funil: leadSelecionado ? leadSelecionado.status_funil : "proposta_enviada",
        pacote_base_preco: totais.pacoteBase,
        addons_selecionados: JSON.stringify(totais.addons.map(a => ({ id: a.id, nome: a.nome, preco: a.preco }))),
        volume_coletas: volumeColetas,
        volume_carregamentos: volumeCarregamentos,
        volume_entregas: volumeEntregas,
        volume_notas_fiscais: volumeNotasFiscais,
        valor_total_proposta: totais.totalMensal,
        data_proposta: new Date().toISOString(),
        origem: leadSelecionado ? leadSelecionado.origem : "manual",
        vendedor_id: user.id
      };

      if (leadSelecionado) {
        await base44.entities.Lead.update(leadSelecionado.id, leadData);
        toast.success("Proposta atualizada com sucesso!");
      } else {
        await base44.entities.Lead.create(leadData);
        toast.success("Proposta criada com sucesso!");
      }

      // Limpar formulário
      setCnpj("");
      setDadosCNPJ(null);
      setLeadSelecionado(null);
      setAddonsSelecionados([]);
      setVolumeColetas(0);
      setVolumeCarregamentos(0);
      setVolumeEntregas(0);
      setVolumeNotasFiscais(0);
    } catch (error) {
      console.error("Erro ao salvar proposta:", error);
      toast.error("Erro ao salvar proposta");
    }
  };

  const toggleAddon = (addonId) => {
    setAddonsSelecionados(prev => {
      if (prev.includes(addonId)) {
        return prev.filter(id => id !== addonId);
      } else {
        return [...prev, addonId];
      }
    });
  };

  const calcularVolumeDocumentos = () => {
    const totalOrdens = volumeColetas + volumeCarregamentos + volumeEntregas;
    return totalOrdens + volumeNotasFiscais;
  };

  const obterFaixaProcessamento = (totalDocs) => {
    for (let i = 0; i < FAIXAS_PROCESSAMENTO.length; i++) {
      if (totalDocs <= FAIXAS_PROCESSAMENTO[i].volume) {
        return FAIXAS_PROCESSAMENTO[i];
      }
    }
    return FAIXAS_PROCESSAMENTO[FAIXAS_PROCESSAMENTO.length - 1];
  };

  const calcularCustoProcessamento = () => {
    const totalDocs = calcularVolumeDocumentos();
    const faixa = obterFaixaProcessamento(totalDocs);
    let custoBase = faixa.preco;
    let custoExtra = 0;
    let docsExcedentes = 0;

    if (totalDocs > 15000) {
      docsExcedentes = totalDocs - 15000;
      custoExtra = docsExcedentes * 0.18;
    }

    return {
      faixa,
      custoBase,
      custoExtra,
      docsExcedentes,
      total: custoBase + custoExtra
    };
  };

  const calcularTotais = () => {
    const processamento = calcularCustoProcessamento();
    const totalDocs = calcularVolumeDocumentos();
    const pacoteBase = obterPacoteBase();
    const addons = obterAddons();
    
    const totalAddons = addons
      .filter(a => addonsSelecionados.includes(a.id))
      .reduce((sum, a) => sum + a.preco, 0);
    
    return {
      pacoteBase: pacoteBase.preco,
      planoBase: pacoteBase.preco,
      addons: addons.filter(a => addonsSelecionados.includes(a.id)),
      totalAddons,
      processamento,
      totalDocumentos: totalDocs,
      totalMensal: pacoteBase.preco + totalAddons + processamento.total
    };
  };

  const theme = {
    bg: isDark ? '#0f172a' : '#f9fafb',
    cardBg: isDark ? '#1e293b' : '#ffffff',
    cardBorder: isDark ? '#334155' : '#e5e7eb',
    text: isDark ? '#f1f5f9' : '#111827',
    textMuted: isDark ? '#94a3b8' : '#6b7280',
  };

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

  if (!user || user.role !== "admin") {
    return (
      <div className="p-6 min-h-screen" style={{ backgroundColor: theme.bg }}>
        <div className="max-w-3xl mx-auto">
          <Alert variant="destructive">
            <AlertCircle className="w-4 h-4" />
            <AlertDescription>
              Acesso restrito a administradores.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  const totais = calcularTotais();
  const pacoteBase = obterPacoteBase();
  const addons = obterAddons();

  return (
    <div className="p-6 min-h-screen" style={{ backgroundColor: theme.bg }}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Calculator className="w-8 h-8 text-blue-600" />
                <h1 className="text-3xl font-bold" style={{ color: theme.text }}>
                  Montar Plano
                </h1>
              </div>
              <p style={{ color: theme.textMuted }}>
                Monte sua configuração customizada com pacote base e add-ons
              </p>
            </div>
            <Button
              onClick={() => window.location.href = createPageUrl("CRM")}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Users className="w-4 h-4" />
              Ver CRM
            </Button>
          </div>
        </div>

        {/* Busca CNPJ */}
        <Card style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }} className="mb-8">
          <CardContent className="p-6">
            <div className="flex gap-3 items-end">
              <div className="flex-1">
                <Label style={{ color: theme.text }}>CNPJ do Cliente</Label>
                <Input
                  value={cnpj}
                  onChange={(e) => setCnpj(e.target.value)}
                  placeholder="00.000.000/0000-00"
                  className="mt-1"
                  style={{ backgroundColor: isDark ? '#0f172a' : '#ffffff', borderColor: theme.cardBorder, color: theme.text }}
                />
              </div>
              <Button
                onClick={consultarCNPJ}
                disabled={carregandoCNPJ}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {carregandoCNPJ ? (
                  <>
                    <Clock className="w-4 h-4 mr-2 animate-spin" />
                    Consultando...
                  </>
                ) : (
                  "Buscar Dados"
                )}
              </Button>
            </div>

            {dadosCNPJ && (
              <div className="mt-4 p-4 rounded-lg border" style={{ 
                backgroundColor: isDark ? 'rgba(34, 197, 94, 0.1)' : '#dcfce7',
                borderColor: isDark ? '#22c55e' : '#86efac'
              }}>
                <p className="font-bold mb-2" style={{ color: theme.text }}>
                  {dadosCNPJ.razao_social}
                </p>
                <div className="grid grid-cols-2 gap-2 text-sm" style={{ color: theme.textMuted }}>
                  <p>CNPJ: {dadosCNPJ.cnpj}</p>
                  <p>Cidade: {dadosCNPJ.cidade}/{dadosCNPJ.uf}</p>
                  {dadosCNPJ.telefone && <p>Telefone: {dadosCNPJ.telefone}</p>}
                  {dadosCNPJ.email && <p>Email: {dadosCNPJ.email}</p>}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Botão Editar Preços */}
        <div className="flex justify-end mb-8">
          <Button
            onClick={() => setEditandoPrecos(true)}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Edit2 className="w-4 h-4" />
            Editar Preços
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Coluna Esquerda */}
          <div className="lg:col-span-2">
            <div className="space-y-6">
              {/* Pacote Base */}
              <Card style={{ backgroundColor: theme.cardBg, borderColor: '#3b82f6' }} className="border-2">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="w-14 h-14 rounded-lg bg-blue-600 flex items-center justify-center flex-shrink-0">
                        <Building2 className="w-7 h-7 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold text-xl" style={{ color: theme.text }}>
                            {pacoteBase.nome}
                          </h3>
                          <Badge className="bg-blue-600 text-white">Obrigatório</Badge>
                        </div>
                        <p className="text-sm mb-3" style={{ color: theme.textMuted }}>
                          {pacoteBase.descricao}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {pacoteBase.modulos.map((mod, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs" style={{ 
                              borderColor: isDark ? '#475569' : '#cbd5e1',
                              color: theme.textMuted 
                            }}>
                              {mod}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-3xl font-bold text-blue-600 whitespace-nowrap">R$ {pacoteBase.preco}</p>
                      <p className="text-xs whitespace-nowrap" style={{ color: theme.textMuted }}>por mês</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Add-ons */}
              <div>
                <h3 className="text-lg font-bold mb-4" style={{ color: theme.text }}>
                  Add-ons Opcionais
                </h3>
                <div className="space-y-3">
                  {addons.map((addon) => {
                    const Icon = addon.icon;
                    const selecionado = addonsSelecionados.includes(addon.id);
                    
                    return (
                      <Card
                        key={addon.id}
                        onClick={() => toggleAddon(addon.id)}
                        className="cursor-pointer transition-all hover:shadow-lg"
                        style={{
                          backgroundColor: selecionado 
                            ? (isDark ? '#1e3a8a' : '#dbeafe')
                            : theme.cardBg,
                          borderColor: selecionado ? '#3b82f6' : theme.cardBorder,
                          borderWidth: '2px'
                        }}
                      >
                        <CardContent className="p-5">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                                selecionado ? 'bg-blue-600' : (isDark ? 'bg-slate-700' : 'bg-gray-200')
                              }`}>
                                <Icon className={`w-6 h-6 ${selecionado ? 'text-white' : (isDark ? 'text-slate-300' : 'text-gray-600')}`} />
                              </div>
                              <div>
                                <h4 className="font-bold text-lg" style={{ color: theme.text }}>
                                  {addon.nome}
                                </h4>
                                <p className="text-xs" style={{ color: theme.textMuted }}>
                                  {addon.descricao}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-2xl font-bold text-blue-600">
                                +R$ {addon.preco}
                              </p>
                              <p className="text-xs" style={{ color: theme.textMuted }}>por mês</p>
                            </div>
                          </div>
                          
                          <div className="space-y-1">
                            {addon.modulos.map((mod, idx) => (
                              <div key={idx} className="flex items-center gap-2 text-xs" style={{ color: theme.textMuted }}>
                                <CheckCircle2 className={`w-3 h-3 ${selecionado ? 'text-green-600' : 'text-gray-400'}`} />
                                {mod}
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>

              {/* Volume de Documentos */}
              <Card style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}>
                <CardHeader>
                  <CardTitle className="text-lg" style={{ color: theme.text }}>
                    Volume de Documentos/Mês
                  </CardTitle>
                  <CardDescription style={{ color: theme.textMuted }}>
                    Informe a quantidade mensal de cada tipo de documento
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold mb-1 block" style={{ color: theme.text }}>
                        Coletas
                      </label>
                      <Input
                        type="number"
                        value={volumeColetas}
                        onChange={(e) => setVolumeColetas(parseInt(e.target.value) || 0)}
                        min="0"
                        className="text-center"
                        style={{ backgroundColor: isDark ? '#0f172a' : '#ffffff', borderColor: theme.cardBorder, color: theme.text }}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold mb-1 block" style={{ color: theme.text }}>
                        Carregamentos
                      </label>
                      <Input
                        type="number"
                        value={volumeCarregamentos}
                        onChange={(e) => setVolumeCarregamentos(parseInt(e.target.value) || 0)}
                        min="0"
                        className="text-center"
                        style={{ backgroundColor: isDark ? '#0f172a' : '#ffffff', borderColor: theme.cardBorder, color: theme.text }}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold mb-1 block" style={{ color: theme.text }}>
                        Entregas
                      </label>
                      <Input
                        type="number"
                        value={volumeEntregas}
                        onChange={(e) => setVolumeEntregas(parseInt(e.target.value) || 0)}
                        min="0"
                        className="text-center"
                        style={{ backgroundColor: isDark ? '#0f172a' : '#ffffff', borderColor: theme.cardBorder, color: theme.text }}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold mb-1 block" style={{ color: theme.text }}>
                        Notas Fiscais
                      </label>
                      <Input
                        type="number"
                        value={volumeNotasFiscais}
                        onChange={(e) => setVolumeNotasFiscais(parseInt(e.target.value) || 0)}
                        min="0"
                        className="text-center"
                        style={{ backgroundColor: isDark ? '#0f172a' : '#ffffff', borderColor: theme.cardBorder, color: theme.text }}
                      />
                    </div>
                  </div>

                  <div 
                    className="rounded-lg p-4"
                    style={{
                      backgroundColor: isDark ? 'rgba(59, 130, 246, 0.15)' : '#eff6ff',
                      borderWidth: '1px',
                      borderColor: isDark ? '#3b82f6' : '#93c5fd'
                    }}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-sm font-semibold" style={{ color: isDark ? '#bfdbfe' : '#1e40af' }}>
                        Total de Documentos:
                      </p>
                      <p className="text-2xl font-bold text-blue-600">
                        {calcularVolumeDocumentos()}
                      </p>
                    </div>
                    <div className="space-y-1">
                      {FAIXAS_PROCESSAMENTO.map((faixa, idx) => {
                        const totalDocs = calcularVolumeDocumentos();
                        const isAtiva = totalDocs > 0 && totalDocs <= faixa.volume && (idx === 0 || totalDocs > FAIXAS_PROCESSAMENTO[idx - 1].volume);
                        
                        return (
                          <div 
                            key={faixa.volume} 
                            className="flex items-center justify-between py-1 px-2 rounded"
                            style={{
                              backgroundColor: isAtiva ? (isDark ? 'rgba(34, 197, 94, 0.2)' : '#dcfce7') : 'transparent',
                              borderLeft: isAtiva ? '3px solid #22c55e' : '3px solid transparent'
                            }}
                          >
                            <p className={`text-xs ${isAtiva ? 'font-semibold' : ''}`} style={{ 
                              color: isAtiva ? (isDark ? '#86efac' : '#166534') : (isDark ? '#93c5fd' : '#60a5fa')
                            }}>
                              {faixa.nome} (até {faixa.volume.toLocaleString('pt-BR')})
                            </p>
                            <p className={`text-xs ${isAtiva ? 'font-bold' : ''}`} style={{ 
                              color: isAtiva ? (isDark ? '#86efac' : '#166534') : (isDark ? '#93c5fd' : '#60a5fa')
                            }}>
                              R$ {faixa.preco.toFixed(2)}
                            </p>
                          </div>
                        );
                      })}
                      {calcularVolumeDocumentos() > 15000 && (
                        <div className="pt-2 mt-2 border-t" style={{ borderColor: isDark ? '#3b82f6' : '#93c5fd' }}>
                          <p className="text-xs font-semibold" style={{ color: isDark ? '#fbbf24' : '#b45309' }}>
                            + R$ 0,18 por documento excedente
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Coluna Direita - Resumo */}
          <div>
            <Card style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }} className="sticky top-6">
              <CardHeader>
                <CardTitle style={{ color: theme.text }}>Resumo do Investimento</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="pb-4 border-b" style={{ borderColor: isDark ? '#334155' : '#e5e7eb' }}>
                    <p className="text-sm font-semibold mb-3" style={{ color: theme.text }}>
                      Módulos:
                    </p>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="text-sm" style={{ color: theme.textMuted }}>Pacote Base</p>
                        <p className="font-semibold" style={{ color: theme.text }}>
                          R$ {pacoteBase.preco}
                        </p>
                      </div>
                      {totais.addons.map(addon => (
                        <div key={addon.id} className="flex items-center justify-between">
                          <p className="text-sm" style={{ color: theme.textMuted }}>{addon.nome}</p>
                          <p className="font-semibold" style={{ color: theme.text }}>
                            R$ {addon.preco}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {totais.totalDocumentos > 0 && (
                    <div className="pb-4 border-b" style={{ borderColor: isDark ? '#334155' : '#e5e7eb' }}>
                      <p className="text-sm font-semibold mb-2" style={{ color: theme.text }}>
                        Processamento:
                      </p>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <p className="text-xs" style={{ color: theme.textMuted }}>
                            {totais.processamento.faixa.nome} (até {totais.processamento.faixa.volume.toLocaleString('pt-BR')} docs)
                          </p>
                          <p className="font-semibold" style={{ color: theme.text }}>
                            R$ {totais.processamento.custoBase.toFixed(2)}
                          </p>
                        </div>
                        {totais.processamento.docsExcedentes > 0 && (
                          <div className="flex items-center justify-between">
                            <p className="text-xs" style={{ color: theme.textMuted }}>
                              {totais.processamento.docsExcedentes} docs extras × R$ 0,18
                            </p>
                            <p className="font-semibold" style={{ color: theme.text }}>
                              R$ {totais.processamento.custoExtra.toFixed(2)}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="pt-2">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-lg font-bold" style={{ color: theme.text }}>Total Mensal:</p>
                    </div>
                    <p className="text-4xl font-bold text-blue-600 text-right">
                      R$ {totais.totalMensal.toFixed(2)}
                    </p>
                    <p className="text-xs text-right" style={{ color: theme.textMuted }}>por mês</p>
                  </div>
                </div>

                <Button 
                  onClick={salvarProposta}
                  disabled={!dadosCNPJ}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {leadSelecionado ? "Atualizar Proposta" : "Salvar Proposta"}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>

                <div 
                  className="rounded-lg p-3 text-center"
                  style={{
                    backgroundColor: isDark ? 'rgba(16, 185, 129, 0.15)' : '#d1fae5',
                    borderWidth: '1px',
                    borderColor: isDark ? '#10b981' : '#059669'
                  }}
                >
                  <p className="text-xs font-semibold" style={{ color: isDark ? '#6ee7b7' : '#065f46' }}>
                    💰 Economia de até 60% vs. concorrentes
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Como Funciona */}
        <div className="mt-12">
          <Card style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}>
            <CardHeader>
              <CardTitle style={{ color: theme.text }}>Como Funciona</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-lg bg-blue-600 flex items-center justify-center flex-shrink-0">
                      <Building2 className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h4 className="font-bold mb-2" style={{ color: theme.text }}>
                       Pacote Base + Add-ons
                      </h4>
                      <p className="text-sm" style={{ color: theme.textMuted }}>
                       Comece com o Pacote Base (R$ {pacoteBase.preco}) que inclui todos os módulos essenciais.
                       Adicione add-ons conforme sua operação cresce.
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-lg bg-green-600 flex items-center justify-center flex-shrink-0">
                      <TrendingUp className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h4 className="font-bold mb-2" style={{ color: theme.text }}>
                        Processamento por Volume
                      </h4>
                      <p className="text-sm" style={{ color: theme.textMuted }}>
                        Além do plano/add-ons, há cobrança de processamento baseada no volume total de documentos
                        (ordens + notas fiscais). Acima de 15.000 docs: R$ 0,18/doc extra.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Custos Adicionais */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-6" style={{ color: theme.text }}>
            Custos Adicionais
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}>
              <CardContent className="p-6">
                <h4 className="font-bold mb-3" style={{ color: theme.text }}>
                  Armazenamento em Nuvem
                </h4>
                <div className="space-y-2 text-sm" style={{ color: theme.textMuted }}>
                  <div className="flex justify-between">
                    <span>10 GB inclusos</span>
                    <span className="font-semibold text-green-600">Grátis</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Armazenamento adicional</span>
                    <span className="font-semibold">US$ 6,00/GB/mês</span>
                  </div>
                  <p className="text-xs mt-2">
                    Backup automático, redundância e acesso 24/7
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}>
              <CardContent className="p-6">
                <h4 className="font-bold mb-3" style={{ color: theme.text }}>
                  Documentos Excedentes
                </h4>
                <div className="space-y-2 text-sm" style={{ color: theme.textMuted }}>
                  <div className="flex justify-between">
                    <span>Planos até 15.000 docs</span>
                    <span className="font-semibold text-green-600">Sem cobrança</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Acima de 15.000 docs</span>
                    <span className="font-semibold">R$ 0,18/doc extra</span>
                  </div>
                  <p className="text-xs mt-2">
                    Flexibilidade para picos sazonais
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Modal de Edição de Preços */}
        {editandoPrecos && (
          <ModalEdicaoPrecos
            open={editandoPrecos}
            onClose={() => setEditandoPrecos(false)}
            onSave={salvarPrecosCustomizados}
            onReset={resetarPrecos}
            precosAtuais={precosCustomizados}
            isDark={isDark}
            theme={theme}
          />
        )}
      </div>
    </div>
  );
}

function ModalEdicaoPrecos({ open, onClose, onSave, onReset, precosAtuais, isDark, theme }) {
  const [precos, setPrecos] = useState({
    pacoteBase: precosAtuais?.pacoteBase || PACOTE_BASE.preco,
    addons: {
      workflow_qualidade: precosAtuais?.addons?.workflow_qualidade || 149,
      wms_completo: precosAtuais?.addons?.wms_completo || 199,
      portal_b2b: precosAtuais?.addons?.portal_b2b || 149,
      comunicacao: precosAtuais?.addons?.comunicacao || 99
    }
  });

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div 
        className="w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-lg shadow-xl"
        style={{ backgroundColor: theme.cardBg }}
      >
        <div className="sticky top-0 z-10 p-6 border-b flex items-center justify-between" 
          style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}>
          <h2 className="text-2xl font-bold" style={{ color: theme.text }}>
            Editar Preços dos Módulos
          </h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="p-6 space-y-6">
          {/* Pacote Base */}
          <div>
            <h3 className="text-lg font-bold mb-3" style={{ color: theme.text }}>Pacote Base</h3>
            <div className="flex items-center gap-4">
              <label className="text-sm flex-1" style={{ color: theme.textMuted }}>
                Valor mensal (R$)
              </label>
              <Input
                type="number"
                value={precos.pacoteBase}
                onChange={(e) => setPrecos({...precos, pacoteBase: parseFloat(e.target.value) || 0})}
                className="w-32 text-right"
                style={{ backgroundColor: isDark ? '#0f172a' : '#ffffff', borderColor: theme.cardBorder, color: theme.text }}
              />
            </div>
          </div>

          {/* Add-ons */}
          <div>
            <h3 className="text-lg font-bold mb-3" style={{ color: theme.text }}>Add-ons Opcionais</h3>
            <div className="space-y-3">
              {ADDONS.map((addon) => (
                <div key={addon.id} className="flex items-center gap-4">
                  <label className="text-sm flex-1" style={{ color: theme.textMuted }}>
                    {addon.nome}
                  </label>
                  <Input
                    type="number"
                    value={precos.addons[addon.id]}
                    onChange={(e) => setPrecos({
                      ...precos,
                      addons: { ...precos.addons, [addon.id]: parseFloat(e.target.value) || 0 }
                    })}
                    className="w-32 text-right"
                    style={{ backgroundColor: isDark ? '#0f172a' : '#ffffff', borderColor: theme.cardBorder, color: theme.text }}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 p-6 border-t flex items-center justify-between gap-3"
          style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}>
          <Button
            variant="outline"
            onClick={onReset}
            className="text-red-600 border-red-600 hover:bg-red-50"
          >
            Resetar para Padrão
          </Button>
          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button 
              onClick={() => onSave(precos)}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Save className="w-4 h-4 mr-2" />
              Salvar Alterações
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}