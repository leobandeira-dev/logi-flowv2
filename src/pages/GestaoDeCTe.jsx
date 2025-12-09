import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  FileText,
  Upload,
  Search,
  Download,
  Eye,
  Mail,
  Settings,
  RefreshCw,
  Truck,
  MapPin,
  Calendar,
  DollarSign,
  Package,
  Filter,
  X,
  AlertCircle
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

export default function GestaoDeCTe() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isDark, setIsDark] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [uploading, setUploading] = useState(false);
  const [showConfigEmail, setShowConfigEmail] = useState(false);
  const [cteDetalhes, setCteDetalhes] = useState(null);
  const [filtroModal, setFiltroModal] = useState("");
  const [filtroOrigem, setFiltroOrigem] = useState("");
  const [showFiltros, setShowFiltros] = useState(false);
  const queryClient = useQueryClient();

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
  }, []);

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

  const { data: ctes = [], isLoading: loadingCtes } = useQuery({
    queryKey: ['ctes'],
    queryFn: () => base44.entities.CTe.list("-data_importacao"),
    initialData: [],
  });

  const { data: configEmail } = useQuery({
    queryKey: ['config-email-cte'],
    queryFn: async () => {
      const configs = await base44.entities.ConfiguracaoEmailCTe.list();
      return configs[0] || null;
    },
    initialData: null,
  });

  const handleUploadXml = async (event) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    setUploading(true);
    let sucessos = 0;
    let erros = 0;

    for (const file of files) {
      try {
        const xmlContent = await file.text();
        const response = await base44.functions.invoke('processarXmlCte', {
          xmlContent,
          origem: 'upload_manual'
        });

        if (response.data.success) {
          sucessos++;
        } else {
          erros++;
          toast.error(response.data.error || 'Erro ao processar CT-e');
        }
      } catch (error) {
        erros++;
        console.error("Erro:", error);
        toast.error(`Erro ao processar ${file.name}`);
      }
    }

    setUploading(false);
    queryClient.invalidateQueries({ queryKey: ['ctes'] });

    if (sucessos > 0) {
      toast.success(`${sucessos} CT-e(s) importado(s) com sucesso!`);
    }
    if (erros > 0) {
      toast.error(`${erros} CT-e(s) com erro`);
    }

    event.target.value = '';
  };

  const ctesFiltrados = ctes.filter(cte => {
    const matchSearch = !searchTerm ||
      cte.numero_cte?.includes(searchTerm) ||
      cte.chave_cte?.includes(searchTerm) ||
      cte.remetente_nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cte.destinatario_nome?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchModal = !filtroModal || cte.modal === filtroModal;
    const matchOrigem = !filtroOrigem || cte.origem_importacao === filtroOrigem;

    return matchSearch && matchModal && matchOrigem;
  });

  const calcularMetricas = () => {
    const total = ctes.length;
    const valorTotal = ctes.reduce((sum, cte) => sum + (cte.valor_total || 0), 0);
    const pesoTotal = ctes.reduce((sum, cte) => sum + (cte.peso_total || 0), 0);
    const comVinculo = ctes.filter(cte => cte.notas_fiscais_ids?.length > 0).length;

    return { total, valorTotal, pesoTotal, comVinculo };
  };

  const metricas = calcularMetricas();

  const theme = {
    bg: isDark ? '#1e1e1e' : '#ffffff',
    cardBg: isDark ? '#2d2d2d' : '#ffffff',
    cardBorder: isDark ? '#404040' : '#d1d5db',
    text: isDark ? '#e5e5e5' : '#1f2937',
    textMuted: isDark ? '#a3a3a3' : '#4b5563',
    headerBg: isDark ? '#1a1a1a' : '#f3f4f6',
    accentBlue: '#1e40af',
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

  return (
    <div className="p-6 min-h-screen" style={{ backgroundColor: theme.bg }}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <FileText className="w-8 h-8 text-blue-600" />
                <h1 className="text-3xl font-bold" style={{ color: theme.text }}>
                  Gestão de CT-e
                </h1>
              </div>
              <p style={{ color: theme.textMuted }}>
                Visualize e gerencie todos os conhecimentos de transporte eletrônico
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => setShowConfigEmail(true)}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Mail className="w-4 h-4" />
                Config. E-mail
              </Button>
              <label>
                <input
                  type="file"
                  accept=".xml"
                  multiple
                  onChange={handleUploadXml}
                  className="hidden"
                  disabled={uploading}
                />
                <Button
                  as="span"
                  disabled={uploading}
                  className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2 cursor-pointer"
                >
                  <Upload className="w-4 h-4" />
                  {uploading ? 'Processando...' : 'Upload XML'}
                </Button>
              </label>
            </div>
          </div>

          {/* Métricas */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <Card style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}>
              <CardContent className="p-4 text-center">
                <p className="text-3xl font-bold text-blue-600">{metricas.total}</p>
                <p className="text-xs mt-1" style={{ color: theme.textMuted }}>Total CT-es</p>
              </CardContent>
            </Card>
            <Card style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-green-600">
                  R$ {metricas.valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
                <p className="text-xs mt-1" style={{ color: theme.textMuted }}>Valor Total</p>
              </CardContent>
            </Card>
            <Card style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-purple-600">
                  {metricas.pesoTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} kg
                </p>
                <p className="text-xs mt-1" style={{ color: theme.textMuted }}>Peso Total</p>
              </CardContent>
            </Card>
            <Card style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}>
              <CardContent className="p-4 text-center">
                <p className="text-3xl font-bold text-orange-600">{metricas.comVinculo}</p>
                <p className="text-xs mt-1" style={{ color: theme.textMuted }}>Com NF-e Vinculada</p>
              </CardContent>
            </Card>
          </div>

          {/* Filtros e Busca */}
          <div className="flex gap-3 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: theme.textMuted }} />
              <Input
                placeholder="Buscar por número, chave, remetente, destinatário..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder, color: theme.text }}
              />
            </div>
            <Button
              variant="outline"
              onClick={() => setShowFiltros(!showFiltros)}
              className="flex items-center gap-2"
            >
              <Filter className="w-4 h-4" />
              Filtros
            </Button>
            <Button
              variant="outline"
              onClick={() => queryClient.invalidateQueries({ queryKey: ['ctes'] })}
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>

          {showFiltros && (
            <Card style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }} className="mb-6">
              <CardContent className="p-4">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs font-semibold mb-2 block" style={{ color: theme.text }}>
                      Modal
                    </label>
                    <select
                      value={filtroModal}
                      onChange={(e) => setFiltroModal(e.target.value)}
                      className="w-full px-3 py-2 rounded border text-sm"
                      style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder, color: theme.text }}
                    >
                      <option value="">Todos</option>
                      <option value="01">Rodoviário</option>
                      <option value="02">Aéreo</option>
                      <option value="03">Aquaviário</option>
                      <option value="04">Ferroviário</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold mb-2 block" style={{ color: theme.text }}>
                      Origem
                    </label>
                    <select
                      value={filtroOrigem}
                      onChange={(e) => setFiltroOrigem(e.target.value)}
                      className="w-full px-3 py-2 rounded border text-sm"
                      style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder, color: theme.text }}
                    >
                      <option value="">Todas</option>
                      <option value="upload_manual">Upload Manual</option>
                      <option value="email_automatico">E-mail Automático</option>
                    </select>
                  </div>
                  <div className="flex items-end">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setFiltroModal('');
                        setFiltroOrigem('');
                      }}
                      className="w-full"
                    >
                      Limpar Filtros
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Lista de CT-es */}
        {loadingCtes ? (
          <div className="text-center py-12">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="mt-3" style={{ color: theme.textMuted }}>Carregando CT-es...</p>
          </div>
        ) : ctesFiltrados.length === 0 ? (
          <Card style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}>
            <CardContent className="p-12 text-center">
              <FileText className="w-12 h-12 mx-auto mb-3" style={{ color: theme.textMuted }} />
              <p style={{ color: theme.textMuted }}>
                {searchTerm ? 'Nenhum CT-e encontrado com os filtros aplicados' : 'Nenhum CT-e importado ainda'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {ctesFiltrados.map((cte) => (
              <CTeCard
                key={cte.id}
                cte={cte}
                theme={theme}
                isDark={isDark}
                onVerDetalhes={setCteDetalhes}
              />
            ))}
          </div>
        )}

        {/* Modal Config E-mail */}
        {showConfigEmail && (
          <ConfigEmailModal
            open={showConfigEmail}
            onClose={() => setShowConfigEmail(false)}
            configEmail={configEmail}
            theme={theme}
            isDark={isDark}
          />
        )}

        {/* Modal Detalhes CT-e */}
        {cteDetalhes && (
          <CTeDetalhesModal
            open={!!cteDetalhes}
            onClose={() => setCteDetalhes(null)}
            cte={cteDetalhes}
            theme={theme}
            isDark={isDark}
          />
        )}
      </div>
    </div>
  );
}

function CTeCard({ cte, theme, isDark, onVerDetalhes }) {
  const modalDescricao = {
    '01': 'Rodoviário',
    '02': 'Aéreo',
    '03': 'Aquaviário',
    '04': 'Ferroviário'
  };

  return (
    <Card
      style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}
      className="hover:shadow-lg transition-all"
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-blue-600 rounded flex items-center justify-center">
                <Truck className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold" style={{ color: theme.text }}>
                    CT-e Nº {cte.numero_cte}
                  </h3>
                  <Badge variant="outline" className="text-xs">
                    Série {cte.serie_cte}
                  </Badge>
                  {cte.notas_fiscais_ids?.length > 0 && (
                    <Badge className="bg-green-600 text-white text-xs">
                      {cte.notas_fiscais_ids.length} NF-e
                    </Badge>
                  )}
                </div>
                <p className="text-xs font-mono" style={{ color: theme.textMuted }}>
                  {cte.chave_cte}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-semibold mb-1" style={{ color: theme.textMuted }}>Emitente</p>
                <p style={{ color: theme.text }}>{cte.emitente_nome}</p>
              </div>
              <div>
                <p className="font-semibold mb-1" style={{ color: theme.textMuted }}>Remetente</p>
                <p style={{ color: theme.text }}>{cte.remetente_nome}</p>
              </div>
              <div>
                <p className="font-semibold mb-1" style={{ color: theme.textMuted }}>Destinatário</p>
                <p style={{ color: theme.text }}>{cte.destinatario_nome}</p>
              </div>
              <div>
                <p className="font-semibold mb-1" style={{ color: theme.textMuted }}>Trajeto</p>
                <p className="text-xs flex items-center gap-1" style={{ color: theme.text }}>
                  <MapPin className="w-3 h-3" />
                  {cte.municipio_origem}/{cte.uf_origem} → {cte.municipio_destino}/{cte.uf_destino}
                </p>
              </div>
            </div>

            <div className="flex gap-4 mt-3 text-xs">
              <div className="flex items-center gap-1">
                <DollarSign className="w-3 h-3" style={{ color: theme.textMuted }} />
                <span style={{ color: theme.text }}>
                  R$ {(cte.valor_total || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Package className="w-3 h-3" style={{ color: theme.textMuted }} />
                <span style={{ color: theme.text }}>
                  {(cte.peso_total || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })} kg
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3" style={{ color: theme.textMuted }} />
                <span style={{ color: theme.text }}>
                  {cte.data_emissao ? format(new Date(cte.data_emissao), "dd/MM/yyyy HH:mm") : '-'}
                </span>
              </div>
              <Badge variant="outline" className="text-xs">
                {modalDescricao[cte.modal] || cte.modal}
              </Badge>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Button
              onClick={() => onVerDetalhes(cte)}
              size="sm"
              variant="outline"
              className="flex items-center gap-1"
            >
              <Eye className="w-3 h-3" />
              Ver
            </Button>
            {cte.xml_url && (
              <Button
                onClick={() => window.open(cte.xml_url, '_blank')}
                size="sm"
                variant="outline"
                className="flex items-center gap-1"
              >
                <Download className="w-3 h-3" />
                XML
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ConfigEmailModal({ open, onClose, configEmail, theme, isDark }) {
  const [email, setEmail] = useState(configEmail?.email_monitorado || '');
  const [salvando, setSalvando] = useState(false);
  const queryClient = useQueryClient();

  const handleSalvar = async () => {
    if (!email) {
      toast.error('Informe o e-mail');
      return;
    }

    setSalvando(true);
    try {
      if (configEmail) {
        await base44.entities.ConfiguracaoEmailCTe.update(configEmail.id, {
          email_monitorado: email,
          ativo: true
        });
      } else {
        await base44.entities.ConfiguracaoEmailCTe.create({
          email_monitorado: email,
          ativo: true
        });
      }

      queryClient.invalidateQueries({ queryKey: ['config-email-cte'] });
      toast.success('Configuração salva com sucesso!');
      onClose();
    } catch (error) {
      console.error("Erro:", error);
      toast.error('Erro ao salvar configuração');
    } finally {
      setSalvando(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div
        className="w-full max-w-md rounded-lg shadow-xl"
        style={{ backgroundColor: theme.cardBg }}
      >
        <div className="p-6 border-b flex items-center justify-between"
          style={{ borderColor: theme.cardBorder }}>
          <h2 className="text-xl font-bold" style={{ color: theme.text }}>
            Configurar E-mail para CT-e
          </h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="p-6 space-y-4">
          <Alert>
            <AlertCircle className="w-4 h-4" />
            <AlertDescription className="text-xs">
              Configure um e-mail para receber automaticamente XMLs de CT-e. O sistema verificará a caixa de entrada diariamente.
            </AlertDescription>
          </Alert>

          <div>
            <label className="text-sm font-semibold mb-2 block" style={{ color: theme.text }}>
              E-mail para Monitoramento
            </label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="cte@empresa.com.br"
              style={{ backgroundColor: isDark ? '#0f172a' : '#ffffff', borderColor: theme.cardBorder, color: theme.text }}
            />
          </div>

          {configEmail && (
            <div className="text-xs space-y-1" style={{ color: theme.textMuted }}>
              <p>Última verificação: {configEmail.ultima_verificacao ? format(new Date(configEmail.ultima_verificacao), "dd/MM/yyyy HH:mm") : 'Nunca'}</p>
              <p>Total importados: {configEmail.total_importados || 0} CT-es</p>
            </div>
          )}
        </div>

        <div className="p-6 border-t flex justify-end gap-3"
          style={{ borderColor: theme.cardBorder }}>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            onClick={handleSalvar}
            disabled={salvando}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {salvando ? 'Salvando...' : 'Salvar'}
          </Button>
        </div>
      </div>
    </div>
  );
}

function CTeDetalhesModal({ open, onClose, cte, theme, isDark }) {
  const { data: notasVinculadas = [] } = useQuery({
    queryKey: ['notas-vinculadas', cte.id],
    queryFn: async () => {
      if (!cte.notas_fiscais_ids || cte.notas_fiscais_ids.length === 0) return [];
      
      const todasNotas = await base44.entities.NotaFiscal.list();
      return todasNotas.filter(nf => cte.notas_fiscais_ids.includes(nf.id));
    },
    enabled: !!cte.notas_fiscais_ids?.length,
    initialData: [],
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
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded flex items-center justify-center">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold" style={{ color: theme.text }}>
                CT-e Nº {cte.numero_cte} - Série {cte.serie_cte}
              </h2>
              <p className="text-xs font-mono" style={{ color: theme.textMuted }}>
                {cte.chave_cte}
              </p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="p-6 space-y-6">
          {/* Informações Principais */}
          <div>
            <h3 className="font-bold text-lg mb-3" style={{ color: theme.text }}>
              Informações do CT-e
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-semibold mb-1" style={{ color: theme.textMuted }}>Emitente</p>
                <p style={{ color: theme.text }}>{cte.emitente_nome}</p>
                <p className="text-xs" style={{ color: theme.textMuted }}>{cte.emitente_cnpj}</p>
              </div>
              <div>
                <p className="font-semibold mb-1" style={{ color: theme.textMuted }}>Data Emissão</p>
                <p style={{ color: theme.text }}>
                  {cte.data_emissao ? format(new Date(cte.data_emissao), "dd/MM/yyyy HH:mm") : '-'}
                </p>
              </div>
              <div>
                <p className="font-semibold mb-1" style={{ color: theme.textMuted }}>Remetente</p>
                <p style={{ color: theme.text }}>{cte.remetente_nome}</p>
                <p className="text-xs" style={{ color: theme.textMuted }}>{cte.remetente_cnpj}</p>
              </div>
              <div>
                <p className="font-semibold mb-1" style={{ color: theme.textMuted }}>Destinatário</p>
                <p style={{ color: theme.text }}>{cte.destinatario_nome}</p>
                <p className="text-xs" style={{ color: theme.textMuted }}>{cte.destinatario_cnpj}</p>
              </div>
              <div>
                <p className="font-semibold mb-1" style={{ color: theme.textMuted }}>Origem</p>
                <p style={{ color: theme.text }}>{cte.municipio_origem}/{cte.uf_origem}</p>
              </div>
              <div>
                <p className="font-semibold mb-1" style={{ color: theme.textMuted }}>Destino</p>
                <p style={{ color: theme.text }}>{cte.municipio_destino}/{cte.uf_destino}</p>
              </div>
              <div>
                <p className="font-semibold mb-1" style={{ color: theme.textMuted }}>Valor Total</p>
                <p className="font-bold text-green-600">
                  R$ {(cte.valor_total || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div>
                <p className="font-semibold mb-1" style={{ color: theme.textMuted }}>Peso Total</p>
                <p style={{ color: theme.text }}>
                  {(cte.peso_total || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })} kg
                </p>
              </div>
              <div>
                <p className="font-semibold mb-1" style={{ color: theme.textMuted }}>CFOP</p>
                <p style={{ color: theme.text }}>{cte.cfop}</p>
              </div>
              <div>
                <p className="font-semibold mb-1" style={{ color: theme.textMuted }}>Natureza da Operação</p>
                <p style={{ color: theme.text }}>{cte.natureza_operacao}</p>
              </div>
            </div>
          </div>

          {/* Notas Fiscais Vinculadas */}
          {notasVinculadas.length > 0 && (
            <div>
              <h3 className="font-bold text-lg mb-3" style={{ color: theme.text }}>
                Notas Fiscais Vinculadas ({notasVinculadas.length})
              </h3>
              <div className="space-y-2">
                {notasVinculadas.map((nota) => (
                  <div
                    key={nota.id}
                    className="border rounded p-3"
                    style={{ borderColor: theme.cardBorder, backgroundColor: theme.headerBg }}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-sm" style={{ color: theme.text }}>
                          NF-e Nº {nota.numero_nota} - Série {nota.serie_nota}
                        </p>
                        <p className="text-xs font-mono" style={{ color: theme.textMuted }}>
                          {nota.chave_nota_fiscal}
                        </p>
                      </div>
                      <p className="font-bold text-sm" style={{ color: theme.text }}>
                        R$ {(nota.valor_nota_fiscal || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Chaves NF-e sem vínculo */}
          {cte.chaves_nfe_vinculadas?.length > notasVinculadas.length && (
            <Alert>
              <AlertCircle className="w-4 h-4" />
              <AlertDescription className="text-xs">
                Este CT-e referencia {cte.chaves_nfe_vinculadas.length - notasVinculadas.length} nota(s) fiscal(is) que não está(ão) cadastrada(s) no sistema.
              </AlertDescription>
            </Alert>
          )}
        </div>

        <div className="sticky bottom-0 p-6 border-t flex justify-end gap-3"
          style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}>
          <Button variant="outline" onClick={onClose}>
            Fechar
          </Button>
          {cte.xml_url && (
            <Button
              onClick={() => window.open(cte.xml_url, '_blank')}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Download className="w-4 h-4 mr-2" />
              Baixar XML
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}