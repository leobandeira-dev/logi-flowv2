import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Save, X, Search, Plus } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

export default function NotaFiscalForm({ open, onClose, nota, onSave, isDark, showCubagem = false }) {
  const [formData, setFormData] = useState(nota || {
    chave_nota_fiscal: "",
    numero_nota: "",
    serie_nota: "",
    data_hora_emissao: "",
    natureza_operacao: "",
    emitente_cnpj: "",
    emitente_razao_social: "",
    emitente_telefone: "",
    emitente_uf: "",
    emitente_cidade: "",
    emitente_bairro: "",
    emitente_endereco: "",
    emitente_numero: "",
    emitente_cep: "",
    destinatario_cnpj: "",
    destinatario_razao_social: "",
    destinatario_telefone: "",
    destinatario_uf: "",
    destinatario_cidade: "",
    destinatario_bairro: "",
    destinatario_endereco: "",
    destinatario_numero: "",
    destinatario_cep: "",
    quantidade_total_volumes_nf: 0,
    valor_nota_fiscal: 0,
    peso_total_nf: 0,
    informacoes_complementares: "",
    numero_pedido: "",
    volumes: []
  });

  const [autoAdicionar, setAutoAdicionar] = useState(false);
  const [volumeTemp, setVolumeTemp] = useState({
    altura: "",
    largura: "",
    comprimento: "",
    peso_volume: "",
    quantidade: 1
  });

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const calcularM3 = (altura, largura, comprimento) => {
    const alt = parseFloat(altura) || 0;
    const larg = parseFloat(largura) || 0;
    const comp = parseFloat(comprimento) || 0;
    return (alt * larg * comp) / 1000000; // convertendo cm³ para m³
  };

  const handleAdicionarVolume = () => {
    if (!volumeTemp.altura || !volumeTemp.largura || !volumeTemp.comprimento) {
      alert("Preencha todas as dimensões do volume");
      return;
    }

    const m3 = calcularM3(volumeTemp.altura, volumeTemp.largura, volumeTemp.comprimento);
    const novoVolume = {
      ...volumeTemp,
      m3,
      altura: parseFloat(volumeTemp.altura),
      largura: parseFloat(volumeTemp.largura),
      comprimento: parseFloat(volumeTemp.comprimento),
      peso_volume: parseFloat(volumeTemp.peso_volume) || 0,
      quantidade: parseInt(volumeTemp.quantidade) || 1
    };

    setFormData(prev => ({
      ...prev,
      volumes: [...(prev.volumes || []), novoVolume],
      quantidade_total_volumes_nf: (prev.volumes?.length || 0) + 1,
      peso_total_nf: (prev.peso_total_nf || 0) + novoVolume.peso_volume
    }));

    setVolumeTemp({
      altura: "",
      largura: "",
      comprimento: "",
      peso_volume: "",
      quantidade: 1
    });
  };

  const handleRemoverVolume = (index) => {
    const volumes = formData.volumes || [];
    const volumeRemovido = volumes[index];
    
    setFormData(prev => ({
      ...prev,
      volumes: volumes.filter((_, i) => i !== index),
      quantidade_total_volumes_nf: prev.quantidade_total_volumes_nf - 1,
      peso_total_nf: (prev.peso_total_nf || 0) - (volumeRemovido.peso_volume || 0)
    }));
  };

  const calcularTotalM3 = () => {
    const total = (formData.volumes || []).reduce((total, vol) => total + (parseFloat(vol.m3) || 0), 0);
    return isNaN(total) ? 0 : total;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
    if (!autoAdicionar) {
      onClose();
    } else {
      setFormData({
        chave_nota_fiscal: "",
        numero_nota: "",
        serie_nota: "",
        data_hora_emissao: "",
        natureza_operacao: "",
        emitente_cnpj: "",
        emitente_razao_social: "",
        emitente_telefone: "",
        emitente_uf: "",
        emitente_cidade: "",
        emitente_bairro: "",
        emitente_endereco: "",
        emitente_numero: "",
        emitente_cep: "",
        destinatario_cnpj: "",
        destinatario_razao_social: "",
        destinatario_telefone: "",
        destinatario_uf: "",
        destinatario_cidade: "",
        destinatario_bairro: "",
        destinatario_endereco: "",
        destinatario_numero: "",
        destinatario_cep: "",
        quantidade_total_volumes_nf: 0,
        valor_nota_fiscal: 0,
        peso_total_nf: 0,
        informacoes_complementares: "",
        numero_pedido: ""
      });
    }
  };

  const handleLimpar = () => {
    setFormData({
      chave_nota_fiscal: "",
      numero_nota: "",
      serie_nota: "",
      data_hora_emissao: "",
      natureza_operacao: "",
      emitente_cnpj: "",
      emitente_razao_social: "",
      emitente_telefone: "",
      emitente_uf: "",
      emitente_cidade: "",
      emitente_bairro: "",
      emitente_endereco: "",
      emitente_numero: "",
      emitente_cep: "",
      destinatario_cnpj: "",
      destinatario_razao_social: "",
      destinatario_telefone: "",
      destinatario_uf: "",
      destinatario_cidade: "",
      destinatario_bairro: "",
      destinatario_endereco: "",
      destinatario_numero: "",
      destinatario_cep: "",
      quantidade_total_volumes_nf: 0,
      valor_nota_fiscal: 0,
      peso_total_nf: 0,
      informacoes_complementares: "",
      numero_pedido: ""
    });
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
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto" style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}>
        <DialogHeader>
          <DialogTitle style={{ color: theme.text }}>
            {nota?.id ? "Editar Nota Fiscal" : "Nova Nota Fiscal"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Chave da Nota Fiscal */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold" style={{ color: theme.text }}>Chave da Nota Fiscal</Label>
            <div className="flex gap-2">
              <Input
                value={formData.chave_nota_fiscal}
                onChange={(e) => handleChange("chave_nota_fiscal", e.target.value)}
                placeholder="Insira a chave completa (44 dígitos) e clique em 'Importar NFe' para buscar e processar o XML automaticamente"
                maxLength={44}
                className="flex-1"
                style={{ backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.text }}
              />
              <div className="flex items-center gap-2">
                <Checkbox
                  id="auto-adicionar"
                  checked={autoAdicionar}
                  onCheckedChange={setAutoAdicionar}
                />
                <Label htmlFor="auto-adicionar" className="text-xs cursor-pointer" style={{ color: theme.textMuted }}>
                  Auto adicionar ao lote
                </Label>
              </div>
              <Button type="button" variant="outline" style={{ borderColor: theme.inputBorder, color: theme.text }}>
                Buscar Meu Danfe
              </Button>
            </div>
          </div>

          {/* Dados da Nota Fiscal */}
          <div className="border rounded-lg p-4 space-y-4" style={{ borderColor: theme.cardBorder }}>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-4 h-4 bg-blue-600 rounded" />
              <Label className="text-sm font-semibold" style={{ color: theme.text }}>Dados da Nota Fiscal</Label>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label className="text-xs" style={{ color: theme.textMuted }}>Número da Nota</Label>
                <Input
                  value={formData.numero_nota}
                  onChange={(e) => handleChange("numero_nota", e.target.value)}
                  style={{ backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.text }}
                />
              </div>
              <div>
                <Label className="text-xs" style={{ color: theme.textMuted }}>Série da Nota</Label>
                <Input
                  value={formData.serie_nota}
                  onChange={(e) => handleChange("serie_nota", e.target.value)}
                  style={{ backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.text }}
                />
              </div>
              <div>
                <Label className="text-xs" style={{ color: theme.textMuted }}>Data de Emissão</Label>
                <Input
                  type="datetime-local"
                  value={formData.data_hora_emissao}
                  onChange={(e) => handleChange("data_hora_emissao", e.target.value)}
                  style={{ backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.text }}
                />
              </div>
            </div>
            
            <div>
              <Label className="text-xs" style={{ color: theme.textMuted }}>Natureza Operação</Label>
              <Input
                value={formData.natureza_operacao}
                onChange={(e) => handleChange("natureza_operacao", e.target.value)}
                style={{ backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.text }}
              />
            </div>
          </div>

          {/* Dados do Emitente */}
          <div className="border rounded-lg p-4 space-y-4" style={{ borderColor: theme.cardBorder }}>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-4 h-4 bg-blue-600 rounded" />
              <Label className="text-sm font-semibold" style={{ color: theme.text }}>Dados do Emitente</Label>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="relative">
                <Label className="text-xs" style={{ color: theme.textMuted }}>CNPJ</Label>
                <div className="relative">
                  <Input
                    value={formData.emitente_cnpj}
                    onChange={(e) => handleChange("emitente_cnpj", e.target.value)}
                    style={{ backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.text }}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
                  >
                    <Search className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <div>
                <Label className="text-xs" style={{ color: theme.textMuted }}>Razão Social</Label>
                <Input
                  value={formData.emitente_razao_social}
                  onChange={(e) => handleChange("emitente_razao_social", e.target.value)}
                  style={{ backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.text }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs" style={{ color: theme.textMuted }}>Telefone</Label>
                <Input
                  value={formData.emitente_telefone}
                  onChange={(e) => handleChange("emitente_telefone", e.target.value)}
                  style={{ backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.text }}
                />
              </div>
              <div>
                <Label className="text-xs" style={{ color: theme.textMuted }}>UF</Label>
                <Input
                  value={formData.emitente_uf}
                  onChange={(e) => handleChange("emitente_uf", e.target.value)}
                  maxLength={2}
                  style={{ backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.text }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs" style={{ color: theme.textMuted }}>Cidade</Label>
                <Input
                  value={formData.emitente_cidade}
                  onChange={(e) => handleChange("emitente_cidade", e.target.value)}
                  style={{ backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.text }}
                />
              </div>
              <div>
                <Label className="text-xs" style={{ color: theme.textMuted }}>Bairro</Label>
                <Input
                  value={formData.emitente_bairro}
                  onChange={(e) => handleChange("emitente_bairro", e.target.value)}
                  style={{ backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.text }}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2">
                <Label className="text-xs" style={{ color: theme.textMuted }}>Endereço</Label>
                <Input
                  value={formData.emitente_endereco}
                  onChange={(e) => handleChange("emitente_endereco", e.target.value)}
                  style={{ backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.text }}
                />
              </div>
              <div>
                <Label className="text-xs" style={{ color: theme.textMuted }}>Número</Label>
                <Input
                  value={formData.emitente_numero}
                  onChange={(e) => handleChange("emitente_numero", e.target.value)}
                  style={{ backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.text }}
                />
              </div>
            </div>

            <div>
              <Label className="text-xs" style={{ color: theme.textMuted }}>CEP</Label>
              <Input
                value={formData.emitente_cep}
                onChange={(e) => handleChange("emitente_cep", e.target.value)}
                style={{ backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.text }}
              />
            </div>
          </div>

          {/* Dados do Destinatário */}
          <div className="border rounded-lg p-4 space-y-4" style={{ borderColor: theme.cardBorder }}>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-4 h-4 bg-blue-600 rounded" />
              <Label className="text-sm font-semibold" style={{ color: theme.text }}>Dados do Destinatário</Label>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="relative">
                <Label className="text-xs" style={{ color: theme.textMuted }}>CNPJ</Label>
                <div className="relative">
                  <Input
                    value={formData.destinatario_cnpj}
                    onChange={(e) => handleChange("destinatario_cnpj", e.target.value)}
                    style={{ backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.text }}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
                  >
                    <Search className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <div>
                <Label className="text-xs" style={{ color: theme.textMuted }}>Razão Social</Label>
                <Input
                  value={formData.destinatario_razao_social}
                  onChange={(e) => handleChange("destinatario_razao_social", e.target.value)}
                  style={{ backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.text }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs" style={{ color: theme.textMuted }}>Telefone</Label>
                <Input
                  value={formData.destinatario_telefone}
                  onChange={(e) => handleChange("destinatario_telefone", e.target.value)}
                  style={{ backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.text }}
                />
              </div>
              <div>
                <Label className="text-xs" style={{ color: theme.textMuted }}>UF</Label>
                <Input
                  value={formData.destinatario_uf}
                  onChange={(e) => handleChange("destinatario_uf", e.target.value)}
                  maxLength={2}
                  style={{ backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.text }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs" style={{ color: theme.textMuted }}>Cidade</Label>
                <Input
                  value={formData.destinatario_cidade}
                  onChange={(e) => handleChange("destinatario_cidade", e.target.value)}
                  style={{ backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.text }}
                />
              </div>
              <div>
                <Label className="text-xs" style={{ color: theme.textMuted }}>Bairro</Label>
                <Input
                  value={formData.destinatario_bairro}
                  onChange={(e) => handleChange("destinatario_bairro", e.target.value)}
                  style={{ backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.text }}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2">
                <Label className="text-xs" style={{ color: theme.textMuted }}>Endereço</Label>
                <Input
                  value={formData.destinatario_endereco}
                  onChange={(e) => handleChange("destinatario_endereco", e.target.value)}
                  style={{ backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.text }}
                />
              </div>
              <div>
                <Label className="text-xs" style={{ color: theme.textMuted }}>Número</Label>
                <Input
                  value={formData.destinatario_numero}
                  onChange={(e) => handleChange("destinatario_numero", e.target.value)}
                  style={{ backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.text }}
                />
              </div>
            </div>

            <div>
              <Label className="text-xs" style={{ color: theme.textMuted }}>CEP</Label>
              <Input
                value={formData.destinatario_cep}
                onChange={(e) => handleChange("destinatario_cep", e.target.value)}
                style={{ backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.text }}
              />
            </div>
          </div>

          {/* Extrato de Volumes */}
          <div className="border rounded-lg p-4 space-y-4" style={{ borderColor: theme.cardBorder }}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-blue-600 rounded" />
                <Label className="text-sm font-semibold" style={{ color: theme.text }}>Extrato de Volumes</Label>
              </div>
              <Button
                type="button"
                onClick={handleAdicionarVolume}
                className="bg-blue-600 hover:bg-blue-700 text-xs"
              >
                <Plus className="w-3 h-3 mr-1" />
                Adicionar Volume
              </Button>
            </div>

            {/* Form de adicionar volume */}
            <div className="grid grid-cols-6 gap-3 p-3 rounded-lg" style={{ backgroundColor: isDark ? '#0f172a' : '#f8fafc', borderColor: theme.cardBorder }}>
              <div>
                <Label className="text-xs" style={{ color: theme.textMuted }}>Altura (cm)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={volumeTemp.altura}
                  onChange={(e) => setVolumeTemp(prev => ({ ...prev, altura: e.target.value }))}
                  placeholder="0"
                  className="text-xs"
                  style={{ backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.text }}
                />
              </div>
              <div>
                <Label className="text-xs" style={{ color: theme.textMuted }}>Largura (cm)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={volumeTemp.largura}
                  onChange={(e) => setVolumeTemp(prev => ({ ...prev, largura: e.target.value }))}
                  placeholder="0"
                  className="text-xs"
                  style={{ backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.text }}
                />
              </div>
              <div>
                <Label className="text-xs" style={{ color: theme.textMuted }}>Comprim. (cm)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={volumeTemp.comprimento}
                  onChange={(e) => setVolumeTemp(prev => ({ ...prev, comprimento: e.target.value }))}
                  placeholder="0"
                  className="text-xs"
                  style={{ backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.text }}
                />
              </div>
              <div>
                <Label className="text-xs" style={{ color: theme.textMuted }}>Peso (kg)</Label>
                <Input
                  type="number"
                  step="0.001"
                  value={volumeTemp.peso_volume}
                  onChange={(e) => setVolumeTemp(prev => ({ ...prev, peso_volume: e.target.value }))}
                  placeholder="0"
                  className="text-xs"
                  style={{ backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.text }}
                />
              </div>
              <div>
                <Label className="text-xs" style={{ color: theme.textMuted }}>Qtd</Label>
                <Input
                  type="number"
                  value={volumeTemp.quantidade}
                  onChange={(e) => setVolumeTemp(prev => ({ ...prev, quantidade: e.target.value }))}
                  placeholder="1"
                  className="text-xs"
                  style={{ backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.text }}
                />
              </div>
              <div>
                <Label className="text-xs" style={{ color: theme.textMuted }}>M³</Label>
                <Input
                  type="text"
                  value={volumeTemp.altura && volumeTemp.largura && volumeTemp.comprimento ? 
                    calcularM3(volumeTemp.altura, volumeTemp.largura, volumeTemp.comprimento).toFixed(4) : "0.0000"}
                  disabled
                  className="text-xs"
                  style={{ backgroundColor: isDark ? '#1e293b' : '#f1f5f9', borderColor: theme.inputBorder, color: theme.textMuted }}
                />
              </div>
            </div>

            {/* Tabela de volumes */}
            {formData.volumes && formData.volumes.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b" style={{ borderColor: theme.cardBorder }}>
                      <th className="text-left p-2" style={{ color: theme.textMuted }}>Alt.(cm)</th>
                      <th className="text-left p-2" style={{ color: theme.textMuted }}>Larg.(cm)</th>
                      <th className="text-left p-2" style={{ color: theme.textMuted }}>Comp.(cm)</th>
                      <th className="text-left p-2" style={{ color: theme.textMuted }}>Peso(kg)</th>
                      <th className="text-left p-2" style={{ color: theme.textMuted }}>Qtd</th>
                      <th className="text-left p-2" style={{ color: theme.textMuted }}>M³</th>
                      <th className="text-left p-2" style={{ color: theme.textMuted }}>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {formData.volumes.map((vol, index) => (
                      <tr key={index} className="border-b" style={{ borderColor: theme.cardBorder }}>
                        <td className="p-2" style={{ color: theme.text }}>{vol.altura}</td>
                        <td className="p-2" style={{ color: theme.text }}>{vol.largura}</td>
                        <td className="p-2" style={{ color: theme.text }}>{vol.comprimento}</td>
                        <td className="p-2" style={{ color: theme.text }}>{vol.peso_volume}</td>
                        <td className="p-2" style={{ color: theme.text }}>{vol.quantidade}</td>
                        <td className="p-2 font-semibold" style={{ color: theme.text }}>{vol.m3?.toFixed(4)}</td>
                        <td className="p-2">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoverVolume(index)}
                            className="h-6 w-6 p-0"
                            style={{ color: 'rgb(239, 68, 68)' }}
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                    <tr className="font-semibold" style={{ backgroundColor: isDark ? '#1e293b' : '#f8fafc' }}>
                      <td colSpan="3" className="p-2" style={{ color: theme.text }}>Total de Volumes: {formData.volumes.length}</td>
                      <td className="p-2" style={{ color: theme.text }}>
                        {(formData.volumes.reduce((sum, v) => sum + (parseFloat(v.peso_volume) || 0), 0) || 0).toFixed(3)} kg
                      </td>
                      <td className="p-2" style={{ color: theme.text }}>
                        {formData.volumes.reduce((sum, v) => sum + (parseInt(v.quantidade) || 0), 0)}
                      </td>
                      <td className="p-2 text-blue-600 dark:text-blue-400">
                        {calcularTotalM3().toFixed(2)} m³
                      </td>
                      <td></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Informações Adicionais */}
          <div className="border rounded-lg p-4 space-y-4" style={{ borderColor: theme.cardBorder }}>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-4 h-4 bg-blue-600 rounded" />
              <Label className="text-sm font-semibold" style={{ color: theme.text }}>Informações Adicionais</Label>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs" style={{ color: theme.textMuted }}>Valor da Nota Fiscal</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.valor_nota_fiscal}
                  onChange={(e) => handleChange("valor_nota_fiscal", parseFloat(e.target.value) || 0)}
                  style={{ backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.text }}
                />
              </div>
              <div>
                <Label className="text-xs" style={{ color: theme.textMuted }}>Número do Pedido</Label>
                <Input
                  value={formData.numero_pedido}
                  onChange={(e) => handleChange("numero_pedido", e.target.value)}
                  style={{ backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.text }}
                />
              </div>
            </div>

            <div>
              <Label className="text-xs" style={{ color: theme.textMuted }}>Informações Complementares</Label>
              <Textarea
                value={formData.informacoes_complementares}
                onChange={(e) => handleChange("informacoes_complementares", e.target.value)}
                rows={3}
                style={{ backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.text }}
              />
            </div>
          </div>

          {/* Botões de Ação */}
          <div className="flex gap-3 pt-4">
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
              <Save className="w-4 h-4 mr-2" />
              Salvar {nota?.id ? "Alterações" : "Individual"}
            </Button>
            <Button type="button" variant="outline" onClick={handleLimpar} style={{ borderColor: theme.inputBorder, color: theme.text }}>
              <X className="w-4 h-4 mr-2" />
              Limpar
            </Button>
            {showCubagem && (
              <Button type="button" className="bg-cyan-600 hover:bg-cyan-700">
                Informar Cubagem
              </Button>
            )}
            <Button type="button" variant="outline" onClick={onClose} style={{ borderColor: theme.inputBorder, color: theme.text }}>
              Fechar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}