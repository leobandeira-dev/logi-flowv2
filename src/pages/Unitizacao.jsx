import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Layers, 
  Scan, 
  Package, 
  CheckCircle2,
  RefreshCw,
  FileText,
  Trash2
} from "lucide-react";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function Unitizacao() {
  const [etiquetaMae, setEtiquetaMae] = useState(null);
  const [volumes, setVolumes] = useState([]);
  const [notas, setNotas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDark, setIsDark] = useState(false);
  const [codigoScanner, setCodigoScanner] = useState("");
  const [processando, setProcessando] = useState(false);
  const [volumesVinculados, setVolumesVinculados] = useState([]);

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
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const etiquetaId = urlParams.get('etiqueta_id');

      const [volumesData, notasData] = await Promise.all([
        base44.entities.Volume.list(),
        base44.entities.NotaFiscal.list()
      ]);

      setVolumes(volumesData);
      setNotas(notasData);

      if (etiquetaId) {
        const etiqueta = await base44.entities.EtiquetaMae.get(etiquetaId);
        setEtiquetaMae(etiqueta);
        
        if (etiqueta.volumes_ids && etiqueta.volumes_ids.length > 0) {
          const vinculados = volumesData.filter(v => etiqueta.volumes_ids.includes(v.id));
          setVolumesVinculados(vinculados);
        }
      }
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      toast.error("Erro ao carregar dados");
    } finally {
      setLoading(false);
    }
  };

  const handleScan = async (codigo) => {
    if (!codigo || !codigo.trim()) return;

    setProcessando(true);
    try {
      const etiquetasEncontradas = await base44.entities.EtiquetaMae.filter({ codigo: codigo.trim() });
      
      if (etiquetasEncontradas.length > 0) {
        const etiqueta = etiquetasEncontradas[0];
        setEtiquetaMae(etiqueta);
        
        if (etiqueta.volumes_ids && etiqueta.volumes_ids.length > 0) {
          const vinculados = volumes.filter(v => etiqueta.volumes_ids.includes(v.id));
          setVolumesVinculados(vinculados);
        } else {
          setVolumesVinculados([]);
        }
        
        toast.success("Etiqueta mãe carregada");
        setCodigoScanner("");
        setProcessando(false);
        return;
      }

      if (!etiquetaMae) {
        toast.error("Bipe primeiro a etiqueta mãe!");
        setCodigoScanner("");
        setProcessando(false);
        return;
      }

      const volumeEncontrado = volumes.find(v => v.identificador_unico === codigo.trim());
      
      if (!volumeEncontrado) {
        toast.error("Volume não encontrado");
        setCodigoScanner("");
        setProcessando(false);
        return;
      }

      if (volumeEncontrado.etiqueta_mae_id && volumeEncontrado.etiqueta_mae_id !== etiquetaMae.id) {
        const etiquetaAnterior = await base44.entities.EtiquetaMae.get(volumeEncontrado.etiqueta_mae_id);
        toast.error("Volume já vinculado à etiqueta " + etiquetaAnterior.codigo);
        setCodigoScanner("");
        setProcessando(false);
        return;
      }

      if (volumesVinculados.some(v => v.id === volumeEncontrado.id)) {
        toast.warning("Volume já vinculado");
        setCodigoScanner("");
        setProcessando(false);
        return;
      }

      await base44.entities.Volume.update(volumeEncontrado.id, {
        etiqueta_mae_id: etiquetaMae.id,
        data_vinculo_etiqueta_mae: new Date().toISOString()
      });

      const novosVolumesIds = [...(etiquetaMae.volumes_ids || []), volumeEncontrado.id];
      const volumesAtualizados = volumes.filter(v => novosVolumesIds.includes(v.id) || v.id === volumeEncontrado.id);
      
      const pesoTotal = volumesAtualizados.reduce((sum, v) => sum + (v.peso_volume || 0), 0);
      const m3Total = volumesAtualizados.reduce((sum, v) => sum + (v.m3 || 0), 0);
      const notasIds = [...new Set(volumesAtualizados.map(v => v.nota_fiscal_id).filter(Boolean))];

      await base44.entities.EtiquetaMae.update(etiquetaMae.id, {
        volumes_ids: novosVolumesIds,
        quantidade_volumes: novosVolumesIds.length,
        peso_total: pesoTotal,
        m3_total: m3Total,
        notas_fiscais_ids: notasIds,
        status: "em_unitizacao"
      });

      const etiquetaAtualizada = await base44.entities.EtiquetaMae.get(etiquetaMae.id);
      setEtiquetaMae(etiquetaAtualizada);
      setVolumesVinculados([...volumesVinculados, volumeEncontrado]);
      
      toast.success("Volume vinculado!");
      setCodigoScanner("");
    } catch (error) {
      console.error("Erro ao processar código:", error);
      toast.error("Erro ao processar");
    } finally {
      setProcessando(false);
    }
  };

  const handleDesvincularVolume = async (volume) => {
    if (!etiquetaMae) return;

    try {
      await base44.entities.Volume.update(volume.id, {
        etiqueta_mae_id: null,
        data_vinculo_etiqueta_mae: null
      });

      const novosVolumesIds = (etiquetaMae.volumes_ids || []).filter(id => id !== volume.id);
      const volumesAtualizados = volumes.filter(v => novosVolumesIds.includes(v.id));
      
      const pesoTotal = volumesAtualizados.reduce((sum, v) => sum + (v.peso_volume || 0), 0);
      const m3Total = volumesAtualizados.reduce((sum, v) => sum + (v.m3 || 0), 0);
      const notasIds = [...new Set(volumesAtualizados.map(v => v.nota_fiscal_id).filter(Boolean))];

      await base44.entities.EtiquetaMae.update(etiquetaMae.id, {
        volumes_ids: novosVolumesIds,
        quantidade_volumes: novosVolumesIds.length,
        peso_total: pesoTotal,
        m3_total: m3Total,
        notas_fiscais_ids: notasIds,
        status: novosVolumesIds.length === 0 ? "criada" : "em_unitizacao"
      });

      const etiquetaAtualizada = await base44.entities.EtiquetaMae.get(etiquetaMae.id);
      setEtiquetaMae(etiquetaAtualizada);
      setVolumesVinculados(volumesVinculados.filter(v => v.id !== volume.id));
      
      toast.success("Volume desvinculado");
    } catch (error) {
      console.error("Erro ao desvincular:", error);
      toast.error("Erro ao desvincular");
    }
  };

  const handleFinalizar = async () => {
    if (!etiquetaMae) return;

    if (volumesVinculados.length === 0) {
      toast.error("Vincule ao menos um volume");
      return;
    }

    try {
      const user = await base44.auth.me();
      
      await base44.entities.EtiquetaMae.update(etiquetaMae.id, {
        status: "finalizada",
        data_finalizada: new Date().toISOString(),
        finalizado_por: user.id
      });

      toast.success("Unitização finalizada!");
      
      const etiquetaAtualizada = await base44.entities.EtiquetaMae.get(etiquetaMae.id);
      setEtiquetaMae(etiquetaAtualizada);
    } catch (error) {
      console.error("Erro ao finalizar:", error);
      toast.error("Erro ao finalizar");
    }
  };

  const theme = {
    bg: isDark ? '#0f172a' : '#f9fafb',
    cardBg: isDark ? '#1e293b' : '#ffffff',
    cardBorder: isDark ? '#334155' : '#e5e7eb',
    text: isDark ? '#f1f5f9' : '#111827',
    textMuted: isDark ? '#94a3b8' : '#6b7280',
    inputBg: isDark ? '#1e293b' : '#ffffff',
    inputBorder: isDark ? '#334155' : '#d1d5db',
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
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold mb-1" style={{ color: theme.text }}>Unitização de Volumes</h1>
            <p className="text-sm" style={{ color: theme.textMuted }}>
              Vincule volumes a etiquetas mãe
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={loadData}
              style={{ borderColor: theme.inputBorder, color: theme.text }}
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
            <Link to={createPageUrl("EtiquetasMae")}>
              <Button
                variant="outline"
                size="sm"
                style={{ borderColor: theme.inputBorder, color: theme.text }}
              >
                Gerenciar Etiquetas
              </Button>
            </Link>
          </div>
        </div>

        {!etiquetaMae ? (
          <Card style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2" style={{ color: theme.text }}>
                <Scan className="w-5 h-5 text-blue-600" />
                Bipe a Etiqueta Mãe
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <p className="text-sm" style={{ color: isDark ? '#93c5fd' : '#1e40af' }}>
                    💡 Bipe ou digite o código da etiqueta mãe para iniciar
                  </p>
                </div>

                <Input
                  placeholder="Bipe ou digite o código..."
                  value={codigoScanner}
                  onChange={(e) => setCodigoScanner(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleScan(codigoScanner);
                    }
                  }}
                  autoFocus
                  className="text-lg h-12 font-mono"
                  style={{ backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.text }}
                  disabled={processando}
                />

                {processando && (
                  <div className="flex items-center justify-center gap-2 text-blue-600">
                    <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    Processando...
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            <Card style={{ backgroundColor: theme.cardBg, borderColor: '#3b82f6', borderWidth: '2px' }}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                      <Layers className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <CardTitle className="text-xl" style={{ color: theme.text }}>
                        {etiquetaMae.codigo}
                      </CardTitle>
                      <p className="text-sm" style={{ color: theme.textMuted }}>
                        {etiquetaMae.descricao || "Sem descrição"}
                      </p>
                    </div>
                  </div>
                  <Badge className={(etiquetaMae.status === "finalizada" ? "bg-green-500" : etiquetaMae.status === "em_unitizacao" ? "bg-blue-500" : "bg-gray-500") + " text-white text-sm px-3 py-1"}>
                    {etiquetaMae.status === "finalizada" ? "Finalizada" : etiquetaMae.status === "em_unitizacao" ? "Em Unitização" : "Criada"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 gap-4">
                  <div className="text-center p-3 rounded-lg" style={{ backgroundColor: isDark ? '#0f172a' : '#f0f9ff' }}>
                    <p className="text-xs" style={{ color: theme.textMuted }}>Volumes</p>
                    <p className="text-2xl font-bold text-blue-600">{volumesVinculados.length}</p>
                  </div>
                  <div className="text-center p-3 rounded-lg" style={{ backgroundColor: isDark ? '#0f172a' : '#f0fdf4' }}>
                    <p className="text-xs" style={{ color: theme.textMuted }}>Peso Total</p>
                    <p className="text-2xl font-bold text-green-600">
                      {volumesVinculados.reduce((sum, v) => sum + (v.peso_volume || 0), 0).toLocaleString('pt-BR', { minimumFractionDigits: 0 })} kg
                    </p>
                  </div>
                  <div className="text-center p-3 rounded-lg" style={{ backgroundColor: isDark ? '#0f172a' : '#faf5ff' }}>
                    <p className="text-xs" style={{ color: theme.textMuted }}>M³ Total</p>
                    <p className="text-2xl font-bold text-purple-600">
                      {volumesVinculados.reduce((sum, v) => sum + (v.m3 || 0), 0).toFixed(3)}
                    </p>
                  </div>
                  <div className="text-center p-3 rounded-lg" style={{ backgroundColor: isDark ? '#0f172a' : '#fef3c7' }}>
                    <p className="text-xs" style={{ color: theme.textMuted }}>Notas Fiscais</p>
                    <p className="text-2xl font-bold text-yellow-600">
                      {[...new Set(volumesVinculados.map(v => v.nota_fiscal_id))].length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {etiquetaMae.status !== "finalizada" && (
              <Card style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2" style={{ color: theme.text }}>
                    <Scan className="w-5 h-5 text-green-600" />
                    Bipe os Volumes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
                      <p className="text-sm" style={{ color: isDark ? '#86efac' : '#15803d' }}>
                        ✓ Etiqueta mãe carregada! Bipe os volumes
                      </p>
                    </div>

                    <Input
                      placeholder="Bipe o volume..."
                      value={codigoScanner}
                      onChange={(e) => setCodigoScanner(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleScan(codigoScanner);
                        }
                      }}
                      autoFocus
                      className="text-lg h-12 font-mono"
                      style={{ backgroundColor: theme.inputBg, borderColor: '#10b981', color: theme.text }}
                      disabled={processando}
                    />

                    {processando && (
                      <div className="flex items-center justify-center gap-2 text-green-600">
                        <div className="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
                        Vinculando...
                      </div>
                    )}

                    <div className="flex gap-2 pt-2">
                      <Button
                        onClick={handleFinalizar}
                        disabled={volumesVinculados.length === 0}
                        className="bg-green-600 hover:bg-green-700 flex-1"
                      >
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        Finalizar ({volumesVinculados.length} volumes)
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setEtiquetaMae(null);
                          setVolumesVinculados([]);
                          setCodigoScanner("");
                        }}
                        style={{ borderColor: theme.cardBorder, color: theme.text }}
                      >
                        Cancelar
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {volumesVinculados.length > 0 && (
              <Card style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2" style={{ color: theme.text }}>
                    <Package className="w-5 h-5 text-purple-600" />
                    Volumes Vinculados ({volumesVinculados.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {volumesVinculados.map((volume) => {
                      const nota = notas.find(n => n.id === volume.nota_fiscal_id);
                      
                      return (
                        <div 
                          key={volume.id} 
                          className="flex items-center justify-between p-3 border rounded-lg"
                          style={{ borderColor: theme.cardBorder }}
                        >
                          <div className="flex items-center gap-3 flex-1">
                            <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0">
                              <CheckCircle2 className="w-5 h-5 text-green-600" />
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-mono font-semibold" style={{ color: theme.text }}>
                                {volume.identificador_unico}
                              </p>
                              <div className="flex items-center gap-3 mt-1">
                                <p className="text-xs" style={{ color: theme.textMuted }}>
                                  NF: {nota?.numero_nota || '-'}
                                </p>
                                <p className="text-xs" style={{ color: theme.textMuted }}>
                                  {volume.peso_volume?.toLocaleString('pt-BR')} kg
                                </p>
                                {volume.m3 > 0 && (
                                  <p className="text-xs" style={{ color: theme.textMuted }}>
                                    {volume.m3?.toFixed(3)} m³
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                          {etiquetaMae.status !== "finalizada" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDesvincularVolume(volume)}
                              className="h-8 w-8 p-0 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {volumesVinculados.length > 0 && (
                    <div className="mt-4 pt-4 border-t" style={{ borderColor: theme.cardBorder }}>
                      <p className="text-sm font-semibold mb-2" style={{ color: theme.text }}>
                        Resumo por Nota Fiscal
                      </p>
                      <div className="space-y-2">
                        {[...new Set(volumesVinculados.map(v => v.nota_fiscal_id))].map(notaId => {
                          const nota = notas.find(n => n.id === notaId);
                          const volumesDaNota = volumesVinculados.filter(v => v.nota_fiscal_id === notaId);
                          
                          return (
                            <div 
                              key={notaId} 
                              className="flex items-center justify-between p-2 border rounded"
                              style={{ borderColor: theme.cardBorder, backgroundColor: isDark ? '#0f172a' : '#f8fafc' }}
                            >
                              <div className="flex items-center gap-2">
                                <FileText className="w-4 h-4 text-blue-600" />
                                <div>
                                  <p className="text-sm font-semibold" style={{ color: theme.text }}>
                                    NF {nota?.numero_nota || '-'}
                                  </p>
                                  <p className="text-xs" style={{ color: theme.textMuted }}>
                                    {nota?.emitente_razao_social || '-'}
                                  </p>
                                </div>
                              </div>
                              <Badge variant="outline" className="text-xs">
                                {volumesDaNota.length} volume(s)
                              </Badge>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
}