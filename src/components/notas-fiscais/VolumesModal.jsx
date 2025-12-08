import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, X, Package, Upload, AlertCircle, CheckCircle2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";

export default function VolumesModal({ open, onClose, nota, onSave, isDark, modoManual = false }) {
  const [volumes, setVolumes] = useState([]);
  const [volumeTemp, setVolumeTemp] = useState({
    altura: "",
    largura: "",
    comprimento: "",
    peso_volume: "",
    quantidade: 1
  });
  const [pesoTotal, setPesoTotal] = useState("");
  const [cartaCorrecao, setCartaCorrecao] = useState(null);
  const [uploadandoCartaCorrecao, setUploadandoCartaCorrecao] = useState(false);
  const [showAlertaCorrecao, setShowAlertaCorrecao] = useState(false);
  const [tipoCorrecao, setTipoCorrecao] = useState("");
  const [dadosNota, setDadosNota] = useState({
    numero_nota: "",
    peso_nf: "",
    valor_nf: "",
    qtd_volumes: ""
  });

  useEffect(() => {
    if (open && nota) {
      // Inicializar dados da nota primeiro
      setDadosNota({
        numero_nota: nota.numero_nota || "",
        peso_nf: nota.peso_nf || nota.peso_total_nf || "",
        valor_nf: nota.valor_nf || nota.valor_nota_fiscal || "",
        qtd_volumes: nota.volumes?.length || nota.volumes_nf || nota.quantidade_total_volumes_nf || ""
      });
      
      // Se já tem volumes, usar eles
      if (nota.volumes && nota.volumes.length > 0) {
        setVolumes(nota.volumes);
      } else if (!modoManual && (nota.volumes_nf || nota.quantidade_total_volumes_nf)) {
        // Veio do XML mas não tem volumes criados - criar volumes vazios baseado na quantidade
        const qtd = nota.volumes_nf || nota.quantidade_total_volumes_nf || 0;
        const volumesVazios = [];
        for (let i = 0; i < qtd; i++) {
          volumesVazios.push({
            altura: 0,
            largura: 0,
            comprimento: 0,
            peso_volume: 0,
            quantidade: 1,
            m3: 0,
            numero_sequencial: i + 1
          });
        }
        setVolumes(volumesVazios);
      } else {
        // Modo manual ou sem quantidade definida
        setVolumes([]);
      }
    }
  }, [open, nota, modoManual]);

  const calcularM3 = (altura, largura, comprimento) => {
    const alt = parseFloat(altura) || 0;
    const larg = parseFloat(largura) || 0;
    const comp = parseFloat(comprimento) || 0;
    return alt * larg * comp;
  };

  const handleAdicionarVolume = () => {
    if (!volumeTemp.altura || !volumeTemp.largura || !volumeTemp.comprimento) {
      return;
    }

    const m3 = calcularM3(volumeTemp.altura, volumeTemp.largura, volumeTemp.comprimento);
    const quantidade = parseInt(volumeTemp.quantidade) || 1;
    
    // Criar múltiplos volumes baseado na quantidade
    const novosVolumes = [];
    for (let i = 0; i < quantidade; i++) {
      novosVolumes.push({
        altura: parseFloat(volumeTemp.altura),
        largura: parseFloat(volumeTemp.largura),
        comprimento: parseFloat(volumeTemp.comprimento),
        peso_volume: parseFloat(volumeTemp.peso_volume) || 0,
        quantidade: 1, // Cada volume individual tem quantidade 1
        m3,
        numero_sequencial: volumes.length + novosVolumes.length + 1
      });
    }

    setVolumes(prev => [...prev, ...novosVolumes]);
    setVolumeTemp({
      altura: "",
      largura: "",
      comprimento: "",
      peso_volume: "",
      quantidade: 1
    });
  };

  const handleRemoverVolume = (index) => {
    setVolumes(prev => prev.filter((_, i) => i !== index).map((v, i) => ({
      ...v,
      numero_sequencial: i + 1
    })));
  };

  const handleAtualizarVolume = (index, field, value) => {
    setVolumes(prev => prev.map((vol, i) => {
      if (i !== index) return vol;
      
      // Converter o valor para número para os campos de dimensões
      const numericValue = (field === 'altura' || field === 'largura' || field === 'comprimento' || field === 'peso_volume') 
        ? (value === '' ? 0 : parseFloat(value) || 0)
        : value;
      
      const updated = { ...vol, [field]: numericValue };
      
      // Sempre recalcular m3
      const alt = parseFloat(updated.altura) || 0;
      const larg = parseFloat(updated.largura) || 0;
      const comp = parseFloat(updated.comprimento) || 0;
      updated.m3 = alt * larg * comp;
      
      return updated;
    }));
  };

  const handleReplicarVolume = (index) => {
    const volumeOrigem = volumes[index];
    
    if (!volumeOrigem.altura || !volumeOrigem.largura || !volumeOrigem.comprimento) {
      toast.error("Preencha todas as dimensões antes de replicar");
      return;
    }

    setVolumes(prev => prev.map((vol, i) => {
      // Não replicar para o próprio volume ou volumes já preenchidos
      if (i === index || (vol.altura && vol.largura && vol.comprimento)) return vol;
      
      return {
        ...vol,
        altura: volumeOrigem.altura,
        largura: volumeOrigem.largura,
        comprimento: volumeOrigem.comprimento,
        peso_volume: volumeOrigem.peso_volume,
        m3: volumeOrigem.m3
      };
    }));
    
    toast.success("Dimensões replicadas para volumes vazios!");
  };

  const handleAlterarQuantidadeVolumes = (novaQtd) => {
    const qtd = parseInt(novaQtd) || 0;
    setDadosNota(prev => ({ ...prev, qtd_volumes: novaQtd }));
    
    if (qtd === 0) {
      setVolumes([]);
      return;
    }
    
    // Se aumentar quantidade, adicionar novos volumes vazios
    if (qtd > volumes.length) {
      const volumesAdicionais = [];
      for (let i = volumes.length; i < qtd; i++) {
        volumesAdicionais.push({
          altura: 0,
          largura: 0,
          comprimento: 0,
          peso_volume: 0,
          quantidade: 1,
          m3: 0,
          numero_sequencial: i + 1
        });
      }
      setVolumes(prev => [...prev, ...volumesAdicionais]);
    } 
    // Se diminuir quantidade, remover últimos volumes
    else if (qtd < volumes.length) {
      setVolumes(prev => prev.slice(0, qtd).map((v, i) => ({
        ...v,
        numero_sequencial: i + 1
      })));
    }
  };

  const handleSalvar = () => {
    // Validação para modo manual
    if (modoManual) {
      if (!dadosNota.numero_nota || !dadosNota.numero_nota.trim()) {
        toast.error("Número da nota fiscal é obrigatório");
        return;
      }
      if (!dadosNota.peso_nf || parseFloat(dadosNota.peso_nf) <= 0) {
        toast.error("Peso total da nota fiscal é obrigatório");
        return;
      }
      if (!dadosNota.valor_nf || parseFloat(dadosNota.valor_nf) <= 0) {
        toast.error("Valor da nota fiscal é obrigatório");
        return;
      }
      if (!dadosNota.qtd_volumes || parseInt(dadosNota.qtd_volumes) <= 0) {
        toast.error("Quantidade de volumes é obrigatória");
        return;
      }
    }
    
    // Validar se todos os volumes têm dimensões preenchidas
    const volumesSemDimensoes = volumes.filter(vol => 
      !vol.altura || !vol.largura || !vol.comprimento || 
      vol.altura === 0 || vol.largura === 0 || vol.comprimento === 0
    );
    
    if (volumesSemDimensoes.length > 0) {
      toast.error(`${volumesSemDimensoes.length} volume(s) sem dimensões preenchidas. Preencha todas as dimensões antes de salvar.`);
      return;
    }
    
    // Verificar se houve mudança de peso ou volume
    const pesoCalculado = volumes.reduce((sum, v) => sum + (parseFloat(v.peso_volume) || 0), 0);
    const volumeCalculado = volumes.reduce((sum, v) => sum + (v.quantidade || 1), 0);
    
    const pesoOriginal = nota.peso_nf || 0;
    const volumeOriginal = nota.volumes_nf || 0;
    
    // Só verificar carta de correção se já havia peso/volume salvos anteriormente (peso_total_nf ou quantidade_total_volumes_nf)
    const jaTinhaPesoSalvo = nota.peso_total_nf && nota.peso_total_nf > 0;
    const jaTinhaVolumeSalvo = nota.quantidade_total_volumes_nf && nota.quantidade_total_volumes_nf > 0;
    
    const mudouPeso = jaTinhaPesoSalvo && Math.abs(pesoCalculado - nota.peso_total_nf) > 0.001;
    const mudouVolume = jaTinhaVolumeSalvo && volumeCalculado !== nota.quantidade_total_volumes_nf;
    
    if ((mudouPeso || mudouVolume) && !cartaCorrecao) {
      setShowAlertaCorrecao(true);
      if (mudouPeso && mudouVolume) {
        setTipoCorrecao("peso e volume");
      } else if (mudouPeso) {
        setTipoCorrecao("peso");
      } else {
        setTipoCorrecao("volume");
      }
      return;
    }
    
    // Salvar todos os volumes, mesmo os que não têm dimensões completas
    onSave({
      ...nota,
      ...(modoManual ? {
        numero_nota: dadosNota.numero_nota,
        peso_nf: parseFloat(dadosNota.peso_nf),
        valor_nf: parseFloat(dadosNota.valor_nf)
      } : {}),
      volumes: volumes,
      quantidade_total_volumes_nf: volumeCalculado,
      peso_total_nf: pesoCalculado,
      carta_correcao_url: cartaCorrecao,
      tem_carta_correcao: !!cartaCorrecao
    });
    
    onClose();
  };

  const calcularTotalM3 = () => {
    return volumes.reduce((total, vol) => total + (vol.m3 || 0), 0);
  };

  const calcularTotalVolumes = () => {
    return volumes.reduce((total, vol) => total + (vol.quantidade || 1), 0);
  };

  const calcularTotalPeso = () => {
    return volumes.reduce((total, vol) => total + (parseFloat(vol.peso_volume) || 0), 0);
  };

  const handleUploadCartaCorrecao = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['application/pdf', 'text/xml', 'application/xml'];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Apenas arquivos PDF ou XML são permitidos");
      return;
    }

    setUploadandoCartaCorrecao(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setCartaCorrecao(file_url);
      toast.success("Carta de correção carregada com sucesso!");
      setShowAlertaCorrecao(false);
    } catch (error) {
      console.error("Erro ao fazer upload:", error);
      toast.error("Erro ao fazer upload da carta de correção");
    } finally {
      setUploadandoCartaCorrecao(false);
    }
  };

  const handleRatearPeso = () => {
    if (!pesoTotal || parseFloat(pesoTotal) <= 0 || volumes.length === 0) {
      return;
    }

    const pesoTotalNum = parseFloat(pesoTotal);
    const pesoPorVolume = pesoTotalNum / volumes.length;

    setVolumes(prev => prev.map(vol => ({
      ...vol,
      peso_volume: pesoPorVolume
    })));

    setPesoTotal("");
  };

  const theme = {
    cardBg: isDark ? '#1e293b' : '#ffffff',
    cardBorder: isDark ? '#334155' : '#e5e7eb',
    text: isDark ? '#f1f5f9' : '#111827',
    textMuted: isDark ? '#94a3b8' : '#6b7280',
    inputBg: isDark ? '#0f172a' : '#ffffff',
    inputBorder: isDark ? '#334155' : '#d1d5db',
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl h-[90vh] flex flex-col" style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}>
        <DialogHeader className="flex-shrink-0 pb-4 border-b" style={{ borderColor: theme.cardBorder }}>
          <DialogTitle className="text-xl font-bold" style={{ color: theme.text }}>
            <div className="flex items-center gap-2">
              <Package className="w-6 h-6" />
              <span>Volumes - NF {nota?.numero_nota}</span>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-4 py-4 pr-2"
          style={{
            scrollbarWidth: 'thin',
            scrollbarColor: `${isDark ? '#475569' : '#cbd5e1'} transparent`
          }}
        >
          {/* Dados da Nota - Modo Manual */}
          {modoManual && (
            <div className="border-2 rounded-lg p-4" style={{ borderColor: '#dc2626', backgroundColor: isDark ? '#7f1d1d15' : '#fee2e2' }}>
              <Label className="text-base font-bold mb-3 block" style={{ color: '#dc2626' }}>
                Dados da Nota Fiscal (Obrigatório)
              </Label>
              <div className="grid grid-cols-4 gap-3">
                <div>
                  <Label className="text-sm font-semibold mb-1 flex items-center gap-1" style={{ color: theme.text }}>
                    Número da Nota <span className="text-red-600">*</span>
                  </Label>
                  <Input
                    type="text"
                    value={dadosNota.numero_nota}
                    onChange={(e) => setDadosNota(prev => ({ ...prev, numero_nota: e.target.value }))}
                    placeholder="Ex: 123456"
                    className="text-sm h-9 border-2 font-semibold"
                    style={{ backgroundColor: theme.inputBg, borderColor: '#dc2626', color: theme.text }}
                  />
                </div>
                <div>
                  <Label className="text-sm font-semibold mb-1 flex items-center gap-1" style={{ color: theme.text }}>
                    Qtd Volumes <span className="text-red-600">*</span>
                  </Label>
                  <Input
                    type="number"
                    value={dadosNota.qtd_volumes}
                    onChange={(e) => handleAlterarQuantidadeVolumes(e.target.value)}
                    placeholder="0"
                    className="text-sm h-9 border-2 font-semibold"
                    style={{ backgroundColor: theme.inputBg, borderColor: '#dc2626', color: theme.text }}
                  />
                </div>
                <div>
                  <Label className="text-sm font-semibold mb-1 flex items-center gap-1" style={{ color: theme.text }}>
                    Peso Total NF (kg) <span className="text-red-600">*</span>
                  </Label>
                  <Input
                    type="number"
                    step="0.001"
                    value={dadosNota.peso_nf}
                    onChange={(e) => setDadosNota(prev => ({ ...prev, peso_nf: e.target.value }))}
                    placeholder="0.000"
                    className="text-sm h-9 border-2 font-semibold"
                    style={{ backgroundColor: theme.inputBg, borderColor: '#dc2626', color: theme.text }}
                  />
                </div>
                <div>
                  <Label className="text-sm font-semibold mb-1 flex items-center gap-1" style={{ color: theme.text }}>
                    Valor NF (R$) <span className="text-red-600">*</span>
                  </Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={dadosNota.valor_nf}
                    onChange={(e) => setDadosNota(prev => ({ ...prev, valor_nf: e.target.value }))}
                    placeholder="0.00"
                    className="text-sm h-9 border-2 font-semibold"
                    style={{ backgroundColor: theme.inputBg, borderColor: '#dc2626', color: theme.text }}
                  />
                </div>
              </div>
            </div>
          )}
          
          {/* Alerta de Carta de Correção */}
          {showAlertaCorrecao && (
            <div className="border-2 border-orange-500 rounded-lg p-4" style={{ backgroundColor: isDark ? '#431407' : '#fff7ed' }}>
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-semibold text-sm mb-2" style={{ color: isDark ? '#fed7aa' : '#9a3412' }}>
                    Alteração de {tipoCorrecao} detectada
                  </h3>
                  <p className="text-xs mb-3" style={{ color: isDark ? '#fed7aa' : '#9a3412' }}>
                    Os valores de {tipoCorrecao} foram alterados em relação ao XML original da nota fiscal. 
                    É necessário fazer upload da carta de correção (CC-e) para prosseguir.
                  </p>

                  <div className="space-y-2">
                    <Label className="text-xs font-semibold" style={{ color: isDark ? '#fed7aa' : '#9a3412' }}>
                      Carta de Correção (PDF ou XML) *
                    </Label>
                    <div className="flex gap-2">
                      <label className="flex-1">
                        <div
                          className="border-2 border-dashed rounded-lg p-3 text-center cursor-pointer hover:bg-opacity-50 transition-all"
                          style={{ 
                            borderColor: '#ea580c',
                            backgroundColor: isDark ? '#1e293b' : '#ffffff'
                          }}
                        >
                          {uploadandoCartaCorrecao ? (
                            <div className="flex items-center justify-center gap-2">
                              <div className="w-4 h-4 border-2 border-orange-600 border-t-transparent rounded-full animate-spin" />
                              <span className="text-xs" style={{ color: theme.text }}>Enviando...</span>
                            </div>
                          ) : cartaCorrecao ? (
                            <div className="flex items-center justify-center gap-2">
                              <CheckCircle2 className="w-4 h-4 text-green-600" />
                              <span className="text-xs text-green-600">Carta enviada com sucesso</span>
                            </div>
                          ) : (
                            <div className="flex items-center justify-center gap-2">
                              <Upload className="w-4 h-4" style={{ color: '#ea580c' }} />
                              <span className="text-xs" style={{ color: theme.text }}>
                                Clique para fazer upload
                              </span>
                            </div>
                          )}
                        </div>
                        <Input
                          type="file"
                          accept=".pdf,.xml"
                          onChange={handleUploadCartaCorrecao}
                          disabled={uploadandoCartaCorrecao}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>

                  {cartaCorrecao && (
                    <Button
                      type="button"
                      onClick={() => setShowAlertaCorrecao(false)}
                      className="mt-3 w-full bg-green-600 hover:bg-green-700 text-white"
                      size="sm"
                    >
                      Continuar com Carta de Correção
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Ratear Peso Total */}
          {volumes.length > 0 && (
            <div className="border-2 rounded-lg p-4" style={{ borderColor: theme.cardBorder, backgroundColor: isDark ? '#0f172a' : '#f8fafc' }}>
              <Label className="text-base font-bold mb-3 block" style={{ color: theme.text }}>Ratear Peso Total</Label>
              <div className="flex gap-3 items-end">
                <div className="flex-1">
                  <Label className="text-sm font-semibold" style={{ color: theme.text }}>Peso Total (kg)</Label>
                  <Input
                    type="number"
                    step="0.001"
                    value={pesoTotal}
                    onChange={(e) => setPesoTotal(e.target.value)}
                    placeholder="Informar peso total para ratear"
                    style={{ backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.text }}
                  />
                </div>
                <Button
                  type="button"
                  onClick={handleRatearPeso}
                  disabled={!pesoTotal || parseFloat(pesoTotal) <= 0}
                  className="bg-green-600 hover:bg-green-700"
                >
                  Ratear entre {volumes.length} volumes
                </Button>
              </div>
            </div>
          )}

          {/* Adicionar Novo Volume */}
          <div className="border-2 rounded-lg p-4" style={{ borderColor: theme.cardBorder, backgroundColor: isDark ? '#0f172a' : '#f8fafc' }}>
            <Label className="text-base font-bold mb-3 block" style={{ color: theme.text }}>Adicionar Volume</Label>
            <div className="grid grid-cols-6 gap-3">
              <div>
                <Label className="text-sm font-semibold" style={{ color: theme.text }}>Altura (m)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={volumeTemp.altura}
                  onChange={(e) => setVolumeTemp(prev => ({ ...prev, altura: e.target.value }))}
                  placeholder="0.00"
                  tabIndex={1}
                  style={{ backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.text }}
                />
              </div>
              <div>
                <Label className="text-sm font-semibold" style={{ color: theme.text }}>Largura (m)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={volumeTemp.largura}
                  onChange={(e) => setVolumeTemp(prev => ({ ...prev, largura: e.target.value }))}
                  placeholder="0.00"
                  tabIndex={2}
                  style={{ backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.text }}
                />
              </div>
              <div>
                <Label className="text-sm font-semibold" style={{ color: theme.text }}>Comprim. (m)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={volumeTemp.comprimento}
                  onChange={(e) => setVolumeTemp(prev => ({ ...prev, comprimento: e.target.value }))}
                  placeholder="0.00"
                  tabIndex={3}
                  style={{ backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.text }}
                />
              </div>
              <div>
                <Label className="text-sm font-semibold" style={{ color: theme.text }}>Qtd</Label>
                <Input
                  type="number"
                  value={volumeTemp.quantidade}
                  onChange={(e) => setVolumeTemp(prev => ({ ...prev, quantidade: e.target.value }))}
                  placeholder="1"
                  tabIndex={4}
                  style={{ backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.text }}
                />
              </div>
              <div>
                <Label className="text-sm font-semibold" style={{ color: theme.text }}>Peso (kg)</Label>
                <Input
                  type="number"
                  step="0.001"
                  value={volumeTemp.peso_volume}
                  onChange={(e) => setVolumeTemp(prev => ({ ...prev, peso_volume: e.target.value }))}
                  placeholder="0"
                  tabIndex={-1}
                  style={{ backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.text }}
                />
              </div>
              <div className="flex items-end">
                <Button
                  type="button"
                  onClick={handleAdicionarVolume}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  disabled={!volumeTemp.altura || !volumeTemp.largura || !volumeTemp.comprimento}
                  tabIndex={5}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Lista de Volumes */}
          {volumes.length > 0 && (
            <div className="border-2 rounded-lg p-4" style={{ borderColor: '#3b82f6', backgroundColor: isDark ? '#1e3a8a15' : '#eff6ff' }}>
              <Label className="text-lg font-bold mb-4 block" style={{ color: '#3b82f6' }}>
                Volumes Cadastrados ({volumes.length})
              </Label>
              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2"
                style={{
                  scrollbarWidth: 'thin',
                  scrollbarColor: `${isDark ? '#3b82f6' : '#60a5fa'} transparent`
                }}
              >
                {volumes.map((vol, index) => {
                  const dimensoesPendentes = !vol.altura || !vol.largura || !vol.comprimento || vol.altura === 0 || vol.largura === 0 || vol.comprimento === 0;
                  const borderColor = dimensoesPendentes ? '#f97316' : theme.cardBorder;
                  const bgColor = dimensoesPendentes ? (isDark ? '#431407' : '#fff7ed') : (isDark ? '#0f172a' : '#ffffff');
                  
                  const baseTabIndex = (index * 100) + 100;
                  
                  return (
                  <div key={index} className="grid grid-cols-7 gap-2 items-center p-3 rounded-lg border-2" style={{ borderColor: borderColor, backgroundColor: bgColor }}>
                    <div className="flex items-center justify-center">
                      <Label className="text-base font-bold" style={{ color: theme.text }}>
                        Vol. {vol.numero_sequencial}
                        {dimensoesPendentes && <span className="text-orange-600 text-lg ml-1">⚠</span>}
                      </Label>
                    </div>
                    <div>
                      <Label className="text-sm font-semibold mb-1" style={{ color: theme.text }}>Altura (m)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={vol.altura === 0 ? '' : vol.altura}
                        onChange={(e) => handleAtualizarVolume(index, 'altura', e.target.value)}
                        placeholder="0.00"
                        className="text-xs h-8"
                        tabIndex={baseTabIndex + 1}
                        style={{ 
                          backgroundColor: theme.inputBg, 
                          borderColor: (!vol.altura || vol.altura === 0) ? '#f97316' : theme.inputBorder, 
                          color: theme.text 
                        }}
                      />
                    </div>
                    <div>
                      <Label className="text-sm font-semibold mb-1" style={{ color: theme.text }}>Largura (m)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={vol.largura === 0 ? '' : vol.largura}
                        onChange={(e) => handleAtualizarVolume(index, 'largura', e.target.value)}
                        placeholder="0.00"
                        className="text-xs h-8"
                        tabIndex={baseTabIndex + 2}
                        style={{ 
                          backgroundColor: theme.inputBg, 
                          borderColor: (!vol.largura || vol.largura === 0) ? '#f97316' : theme.inputBorder, 
                          color: theme.text 
                        }}
                      />
                    </div>
                    <div>
                      <Label className="text-sm font-semibold mb-1" style={{ color: theme.text }}>Comprimento (m)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={vol.comprimento === 0 ? '' : vol.comprimento}
                        onChange={(e) => handleAtualizarVolume(index, 'comprimento', e.target.value)}
                        placeholder="0.00"
                        className="text-xs h-8"
                        tabIndex={baseTabIndex + 3}
                        style={{ 
                          backgroundColor: theme.inputBg, 
                          borderColor: (!vol.comprimento || vol.comprimento === 0) ? '#f97316' : theme.inputBorder, 
                          color: theme.text 
                        }}
                      />
                    </div>
                    <div>
                      <Label className="text-sm font-semibold mb-1" style={{ color: theme.text }}>M³</Label>
                      <div className="text-sm font-bold p-2 rounded text-center" style={{ backgroundColor: isDark ? '#1e293b' : '#f1f5f9', color: '#8b5cf6' }}>
                        {vol.m3?.toFixed(2) || "0.00"}
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-semibold mb-1" style={{ color: theme.text }}>Peso (kg)</Label>
                      <Input
                        type="number"
                        step="0.001"
                        value={vol.peso_volume === 0 ? '' : vol.peso_volume}
                        onChange={(e) => handleAtualizarVolume(index, 'peso_volume', e.target.value)}
                        placeholder="0"
                        className="text-xs h-8"
                        tabIndex={-1}
                        style={{ backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.text }}
                      />
                    </div>
                    <div className="flex items-end gap-1 justify-end">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleReplicarVolume(index)}
                        className="h-9 text-sm px-3 whitespace-nowrap font-bold"
                        title="Repetir dimensões para volumes vazios"
                        style={{ 
                          borderColor: '#3b82f6', 
                          borderWidth: '2px',
                          color: '#3b82f6',
                          backgroundColor: isDark ? '#1e3a8a15' : '#eff6ff'
                        }}
                        disabled={!vol.altura || !vol.largura || !vol.comprimento}
                      >
                        Repetir
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoverVolume(index)}
                        className="h-9 w-9 p-0"
                        style={{ color: 'rgb(239, 68, 68)' }}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Totalizadores */}
          <div className="grid grid-cols-3 gap-4">
            <div className="border-2 rounded-lg p-5 text-center" style={{ borderColor: '#2563eb', backgroundColor: isDark ? '#1e3a8a' : '#dbeafe' }}>
              <Label className="text-sm font-bold mb-2 block" style={{ color: isDark ? '#bfdbfe' : '#1e3a8a' }}>Total de Volumes</Label>
              <p className="text-4xl font-bold" style={{ color: isDark ? '#ffffff' : '#1e40af' }}>{calcularTotalVolumes()}</p>
            </div>
            <div className="border-2 rounded-lg p-5 text-center" style={{ borderColor: '#059669', backgroundColor: isDark ? '#065f46' : '#a7f3d0' }}>
              <Label className="text-sm font-bold mb-2 block" style={{ color: isDark ? '#d1fae5' : '#065f46' }}>Peso Total (kg)</Label>
              <p className="text-4xl font-bold" style={{ color: isDark ? '#ffffff' : '#047857' }}>{calcularTotalPeso().toFixed(3)}</p>
            </div>
            <div className="border-2 rounded-lg p-5 text-center" style={{ borderColor: '#7c3aed', backgroundColor: isDark ? '#5b21b6' : '#e9d5ff' }}>
              <Label className="text-sm font-bold mb-2 block" style={{ color: isDark ? '#e9d5ff' : '#5b21b6' }}>M³ Total</Label>
              <p className="text-4xl font-bold" style={{ color: isDark ? '#ffffff' : '#6b21a8' }}>{calcularTotalM3().toFixed(2)}</p>
            </div>
          </div>

        </div>
        
        {/* Botões de Ação - Fixos no rodapé */}
        <div className="flex-shrink-0 flex gap-3 pt-4 border-t" style={{ borderColor: theme.cardBorder }}>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="text-base h-11"
            style={{ borderColor: theme.cardBorder, color: theme.text }}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={handleSalvar}
            className="bg-blue-600 hover:bg-blue-700 text-base h-11 flex-1 font-semibold"
          >
            Salvar Volumes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}