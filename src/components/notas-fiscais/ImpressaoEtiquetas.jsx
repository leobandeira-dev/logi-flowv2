import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tag } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";

export default function ImpressaoEtiquetas({ open, onClose, nota, volumes, empresa }) {
  const [formatoImpressao, setFormatoImpressao] = useState("etiqueta"); // etiqueta ou a4
  const [marcandoImpresso, setMarcandoImpresso] = useState(false);
  const [tipoEtiqueta, setTipoEtiqueta] = useState("individual"); // individual ou mae
  const [qtdEtiquetasMae, setQtdEtiquetasMae] = useState(1);
  const [volumesPorEtiquetaMae, setVolumesPorEtiquetaMae] = useState([nota?.quantidade_total_volumes_nf || volumes.length]);

  const getQRCodeUrl = (data) => {
    return `https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${encodeURIComponent(data)}`;
  };

  const totalVolumes = nota?.quantidade_total_volumes_nf || volumes.length;

  const validarEtiquetasMae = () => {
    const total = volumesPorEtiquetaMae.reduce((acc, vol) => acc + (parseInt(vol) || 0), 0);
    return total === totalVolumes;
  };

  const handleQtdEtiquetasChange = (novaQtd) => {
    const qtd = parseInt(novaQtd) || 1;
    setQtdEtiquetasMae(qtd);
    
    // Ajustar array de volumes
    if (qtd > volumesPorEtiquetaMae.length) {
      // Adicionar novas etiquetas com volume restante distribuído
      const volumesRestantes = totalVolumes - volumesPorEtiquetaMae.reduce((acc, v) => acc + (parseInt(v) || 0), 0);
      const novasEtiquetas = Array(qtd - volumesPorEtiquetaMae.length).fill(Math.max(1, Math.floor(volumesRestantes / (qtd - volumesPorEtiquetaMae.length))));
      setVolumesPorEtiquetaMae([...volumesPorEtiquetaMae, ...novasEtiquetas]);
    } else {
      // Reduzir array
      setVolumesPorEtiquetaMae(volumesPorEtiquetaMae.slice(0, qtd));
    }
  };

  const handleVolumeEtiquetaChange = (index, valor) => {
    const novoArray = [...volumesPorEtiquetaMae];
    novoArray[index] = parseInt(valor) || 0;
    setVolumesPorEtiquetaMae(novoArray);
  };

  const marcarVolumesComoImpressos = async () => {
    setMarcandoImpresso(true);
    try {
      const promises = volumes.map(volume => 
        base44.entities.Volume.update(volume.id, {
          etiquetas_impressas: true,
          data_impressao_etiquetas: new Date().toISOString()
        })
      );
      await Promise.all(promises);
      toast.success("Etiquetas marcadas como impressas!");
    } catch (error) {
      console.error("Erro ao marcar volumes como impressos:", error);
      toast.error("Erro ao atualizar status de impressão");
    } finally {
      setMarcandoImpresso(false);
    }
  };

  const handlePrint = async () => {
    if (tipoEtiqueta === "mae" && !validarEtiquetasMae()) {
      const totalAtual = volumesPorEtiquetaMae.reduce((acc, vol) => acc + (parseInt(vol) || 0), 0);
      toast.error(`Total de volumes por etiqueta mãe (${totalAtual}) deve ser igual ao total de volumes da NF (${totalVolumes})`);
      return;
    }

    // Criar etiquetas mãe no banco de dados antes de imprimir
    if (tipoEtiqueta === "mae") {
      try {
        toast.info("Criando etiquetas mãe...");
        const user = await base44.auth.me();

        for (let indexMae = 0; indexMae < qtdEtiquetasMae; indexMae++) {
          // Calcular volumes para esta etiqueta
          const volumeInicio = volumesPorEtiquetaMae.slice(0, indexMae).reduce((acc, v) => acc + (parseInt(v) || 0), 0) + 1;
          const volumeFim = volumeInicio + (parseInt(volumesPorEtiquetaMae[indexMae]) || 0) - 1;
          const qtdVolumesEtiqueta = parseInt(volumesPorEtiquetaMae[indexMae]) || 0;

          // Filtrar volumes para esta etiqueta mãe
          const volumesParaVincular = volumes.filter(v => 
            v.numero_sequencial >= volumeInicio && v.numero_sequencial <= volumeFim
          );

          // Calcular peso e m3 total dos volumes vinculados
          const pesoTotalCalculado = volumesParaVincular.reduce((sum, v) => sum + (v.peso_volume || 0), 0);
          const m3TotalCalculado = volumesParaVincular.reduce((sum, v) => sum + (v.m3 || 0), 0);
          const volumesIds = volumesParaVincular.map(v => v.id);

          // Gerar código único para etiqueta mãe (compatível com scanner)
          const agora = new Date();
          const dia = String(agora.getDate()).padStart(2, '0');
          const mes = String(agora.getMonth() + 1).padStart(2, '0');
          const ano = String(agora.getFullYear()).slice(-2);
          const hh = String(agora.getHours()).padStart(2, '0');
          const mm = String(agora.getMinutes()).padStart(2, '0');
          const ss = String(agora.getSeconds()).padStart(2, '0');
          const timestamp = `${dia}${mes}${ano}${hh}${mm}${ss}`;
          const codigoEtiqueta = `ETQMAE-${nota.numero_nota}-${indexMae + 1}-${timestamp}`;

          // Criar etiqueta mãe com estrutura completa
          const etiquetaMae = await base44.entities.EtiquetaMae.create({
            codigo: codigoEtiqueta,
            descricao: `Etiqueta Mãe - NF ${nota.numero_nota} (${volumeInicio} a ${volumeFim})`,
            status: 'finalizada',
            volumes_ids: volumesIds,
            quantidade_volumes: qtdVolumesEtiqueta,
            peso_total: pesoTotalCalculado,
            m3_total: m3TotalCalculado,
            notas_fiscais_ids: [nota.id],
            data_criacao: new Date().toISOString(),
            data_finalizada: new Date().toISOString(),
            criado_por: user.id,
            finalizado_por: user.id,
            observacoes: `Criada automaticamente no recebimento`
          });

          // Vincular volumes à etiqueta mãe
          for (const volume of volumesParaVincular) {
            await base44.entities.Volume.update(volume.id, {
              etiqueta_mae_id: etiquetaMae.id,
              data_vinculo_etiqueta_mae: new Date().toISOString()
            });
          }
        }

        toast.success("Etiquetas mãe criadas e volumes vinculados!");
      } catch (error) {
        console.error("Erro ao criar etiquetas mãe:", error);
        toast.error("Erro ao criar etiquetas mãe no sistema");
        return;
      }
    }

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Por favor, permita pop-ups para imprimir');
      return;
    }

    const printContent = document.getElementById('print-area').innerHTML;
    
    printWindow.document.write(`<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>Etiquetas - NF ${nota.numero_nota}</title>
<style>
@page {
  size: ${formatoImpressao === "etiqueta" ? "10cm 15cm" : "A4 portrait"};
  margin: 0;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  -webkit-print-color-adjust: exact !important;
  print-color-adjust: exact !important;
  color-adjust: exact !important;
}

html, body {
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
  background: white;
  font-family: Arial, sans-serif;
}

.etiqueta {
  width: ${formatoImpressao === "etiqueta" ? "10cm" : "21cm"};
  height: ${formatoImpressao === "etiqueta" ? "15cm" : "29.7cm"};
  padding: ${formatoImpressao === "etiqueta" ? "0.5cm" : "2cm"};
  margin: 0;
  background: white;
  page-break-after: always;
  page-break-inside: avoid;
  position: relative;
  box-sizing: border-box;
  overflow: hidden;
  display: block;
}

.etiqueta:last-child {
  page-break-after: auto;
}

@media print {
  @page {
    size: ${formatoImpressao === "etiqueta" ? "10cm 15cm" : "A4 portrait"};
    margin: 0;
  }
  
  html, body {
    width: 100%;
    height: 100%;
    margin: 0;
    padding: 0;
  }
  
  .etiqueta {
    width: ${formatoImpressao === "etiqueta" ? "10cm" : "21cm"};
    height: ${formatoImpressao === "etiqueta" ? "15cm" : "29.7cm"};
    padding: ${formatoImpressao === "etiqueta" ? "0.5cm" : "2cm"};
    margin: 0;
    page-break-after: always;
    page-break-inside: avoid;
  }
}
</style>
</head>
<body>
${printContent}
</body>
</html>`);
    
    printWindow.document.close();
    
    // Aguardar carregar imagens antes de imprimir
    printWindow.onload = function() {
      setTimeout(() => {
        printWindow.focus();
        printWindow.print();
        
        // Marcar volumes como impressos após a impressão
        marcarVolumesComoImpressos();
      }, 500);
    };
  };



  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="no-print">
          <DialogTitle>Impressão de Etiquetas - NF {nota?.numero_nota}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 no-print">
          <div>
            <Label className="text-sm font-semibold mb-2 block">Tipo de Etiqueta</Label>
            <RadioGroup value={tipoEtiqueta} onValueChange={(val) => {
              setTipoEtiqueta(val);
              if (val === "mae") {
                setQtdEtiquetasMae(1);
                setVolumesPorEtiquetaMae([totalVolumes]);
              }
            }}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="individual" id="individual" />
                <Label htmlFor="individual" className="cursor-pointer">Etiquetas Individuais (1 por volume)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="mae" id="mae" />
                <Label htmlFor="mae" className="cursor-pointer">Etiquetas Mãe (volumes agrupados)</Label>
              </div>
            </RadioGroup>
          </div>

          {tipoEtiqueta === "mae" && (
            <div className="bg-white dark:bg-slate-50 p-4 rounded-lg border border-slate-200 dark:border-slate-300 space-y-3">
              <div>
                <Label className="text-sm font-semibold mb-2 block text-slate-900 dark:text-slate-900">Quantidade de Etiquetas Mãe</Label>
                <input
                  type="number"
                  min="1"
                  max={totalVolumes}
                  value={qtdEtiquetasMae}
                  onChange={(e) => handleQtdEtiquetasChange(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-400 rounded-lg bg-white dark:bg-white text-slate-900 dark:text-slate-900"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-semibold block text-gray-900 dark:text-gray-900">Volumes por Etiqueta Mãe</Label>
                <div className="grid grid-cols-2 gap-2">
                  {volumesPorEtiquetaMae.map((vol, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <span className="text-xs font-medium whitespace-nowrap text-gray-900 dark:text-gray-900">Etiqueta {index + 1}:</span>
                      <input
                        type="number"
                        min="1"
                        value={vol}
                        onChange={(e) => handleVolumeEtiquetaChange(index, e.target.value)}
                        className="flex-1 px-2 py-1 text-sm border border-slate-300 dark:border-slate-400 rounded bg-white dark:bg-white text-slate-900 dark:text-slate-900"
                      />
                      <span className="text-xs text-gray-600 dark:text-gray-600">vol.</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className={`text-sm p-2 rounded ${validarEtiquetasMae() ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'}`}>
                {validarEtiquetasMae() ? (
                  <span>✓ Total correto: {volumesPorEtiquetaMae.map((v, i) => `Etiq${i+1}(${v})`).join(' + ')} = {volumesPorEtiquetaMae.reduce((acc, v) => acc + (parseInt(v) || 0), 0)} volumes</span>
                ) : (
                  <span>⚠️ Total incorreto: {volumesPorEtiquetaMae.reduce((acc, v) => acc + (parseInt(v) || 0), 0)} ≠ {totalVolumes} volumes da NF</span>
                )}
              </div>
            </div>
          )}

          <div>
            <Label className="text-sm font-semibold mb-2 block">Formato de Impressão</Label>
            <RadioGroup value={formatoImpressao} onValueChange={setFormatoImpressao}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="etiqueta" id="etiqueta" />
                <Label htmlFor="etiqueta" className="cursor-pointer">Etiqueta (10cm x 15cm)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="a4" id="a4" />
                <Label htmlFor="a4" className="cursor-pointer">A4 Retrato</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="flex gap-2">
            <Button onClick={handlePrint} className="bg-blue-600 hover:bg-blue-700">
              <Tag className="w-4 h-4 mr-2" />
              Imprimir {tipoEtiqueta === "mae" ? qtdEtiquetasMae : volumes.length} Etiqueta{(tipoEtiqueta === "mae" ? qtdEtiquetasMae : volumes.length) > 1 ? 's' : ''}
            </Button>
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
          </div>
        </div>

        <div id="print-area">
          {tipoEtiqueta === "individual" ? (
            volumes.map((volume, index) => (
              <div 
                key={volume.id} 
                className="etiqueta bg-white border border-gray-300"
                style={{
                  width: formatoImpressao === "etiqueta" ? "10cm" : "100%",
                  height: formatoImpressao === "etiqueta" ? "15cm" : "100vh",
                  fontFamily: "Arial, sans-serif",
                  position: "relative",
                  padding: formatoImpressao === "etiqueta" ? "0.5cm" : "2cm",
                  pageBreakAfter: "always",
                }}
              >
              {/* Cabeçalho */}
              <div style={{ textAlign: "center", marginBottom: formatoImpressao === "a4" ? "20px" : "4px" }}>
                <h1 style={{ fontSize: formatoImpressao === "a4" ? "48px" : "20px", fontWeight: "bold", margin: 0, lineHeight: "1.1" }}>
                  {empresa?.nome_fantasia?.toUpperCase() || "TRANSUL TRANSPORTE"}
                </h1>
              </div>

              {/* ID, Entrada, Volume, Peso e QR Code */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: formatoImpressao === "a4" ? "12px" : "3px" }}>
                <div style={{ flex: 1, paddingRight: "6px", display: "flex", flexDirection: "column", justifyContent: "flex-start" }}>
                  <div style={{ marginBottom: formatoImpressao === "a4" ? "12px" : "6px" }}>
                    <p style={{ fontSize: formatoImpressao === "a4" ? "16px" : "7px", margin: 0, marginBottom: formatoImpressao === "a4" ? "6px" : "1px" }}>
                      ID: {volume.identificador_unico}
                    </p>
                    <p style={{ fontSize: formatoImpressao === "a4" ? "36px" : "14px", fontWeight: "bold", margin: 0, lineHeight: "1.1" }}>
                      <strong>Entrada:</strong><br />
                      {volume.created_date ? (() => {
                        const dateUTC = new Date(volume.created_date.includes('Z') ? volume.created_date : volume.created_date + 'Z');
                        return dateUTC.toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' }) + ', ' + 
                               dateUTC.toLocaleTimeString('pt-BR', { timeZone: 'America/Sao_Paulo' });
                      })() : new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })}
                    </p>
                  </div>
                  <div style={{ backgroundColor: "black", color: "white", padding: formatoImpressao === "a4" ? "16px 24px" : "8px 10px", textAlign: "center", marginBottom: formatoImpressao === "a4" ? "8px" : "4px" }}>
                    <p style={{ fontSize: formatoImpressao === "a4" ? "18px" : "9px", fontWeight: "bold", margin: 0, marginBottom: formatoImpressao === "a4" ? "4px" : "2px" }}>
                      Volume:
                    </p>
                    <p style={{ fontSize: formatoImpressao === "a4" ? "64px" : "28px", fontWeight: "bold", margin: 0, lineHeight: "1" }}>
                      {volume.numero_sequencial}/{nota.quantidade_total_volumes_nf}
                    </p>
                  </div>
                  <div style={{ backgroundColor: "black", color: "white", padding: formatoImpressao === "a4" ? "16px 24px" : "8px 10px", textAlign: "center" }}>
                    <p style={{ fontSize: formatoImpressao === "a4" ? "18px" : "9px", fontWeight: "bold", margin: 0, marginBottom: formatoImpressao === "a4" ? "4px" : "2px" }}>
                      Peso:
                    </p>
                    <p style={{ fontSize: formatoImpressao === "a4" ? "48px" : "22px", fontWeight: "bold", margin: 0, lineHeight: "1" }}>
                      {nota.peso_total_nf?.toLocaleString('pt-BR', { minimumFractionDigits: 0 }) || "0"} kg
                    </p>
                  </div>
                </div>
                <img 
                  src={getQRCodeUrl(volume.identificador_unico)} 
                  alt="QR Code" 
                  style={{ width: formatoImpressao === "a4" ? "288px" : "144px", height: formatoImpressao === "a4" ? "288px" : "144px", marginLeft: "6px", border: "2px solid #000" }}
                />
              </div>

              {/* NF e Pedido */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: formatoImpressao === "a4" ? "8px" : "3px", marginBottom: formatoImpressao === "a4" ? "8px" : "4px" }}>
                <div style={{ backgroundColor: "black", color: "white", padding: formatoImpressao === "a4" ? "10px 12px" : "8px 10px" }}>
                  <p style={{ fontSize: formatoImpressao === "a4" ? "32px" : "18px", fontWeight: "bold", margin: 0 }}>
                    NF: {nota.numero_nota}
                  </p>
                </div>
                <div style={{ backgroundColor: "black", color: "white", padding: formatoImpressao === "a4" ? "10px 12px" : "8px 10px" }}>
                  <p style={{ fontSize: formatoImpressao === "a4" ? "24px" : "13px", fontWeight: "bold", margin: 0 }}>
                    Pedido: {nota.numero_pedido || "N/A"}
                  </p>
                </div>
              </div>

              {/* Remetente */}
              <div style={{ marginBottom: formatoImpressao === "a4" ? "8px" : "6px", fontSize: formatoImpressao === "a4" ? "18px" : "11px", lineHeight: "1.4", padding: formatoImpressao === "a4" ? "0" : "4px 0" }}>
                <p style={{ margin: 0 }}>
                  <strong>Remetente:</strong> {nota.emitente_razao_social}
                </p>
              </div>

              {/* Destinatário */}
              <div style={{ backgroundColor: "black", color: "white", padding: formatoImpressao === "a4" ? "10px 12px" : "8px 10px", marginBottom: formatoImpressao === "a4" ? "8px" : "6px" }}>
                <p style={{ fontSize: formatoImpressao === "a4" ? "24px" : "13px", fontWeight: "bold", margin: 0, lineHeight: "1.2", marginBottom: formatoImpressao === "a4" ? "6px" : "3px" }}>
                  Destinatário: {nota.destinatario_razao_social}
                </p>
                <p style={{ fontSize: formatoImpressao === "a4" ? "16px" : "9px", margin: 0, marginBottom: "3px", lineHeight: "1.3" }}>
                  <strong>Endereço:</strong> {nota.destinatario_endereco}, {nota.destinatario_numero} - {nota.destinatario_bairro}
                </p>
                <p style={{ fontSize: formatoImpressao === "a4" ? "16px" : "9px", margin: 0, lineHeight: "1.3" }}>
                  <strong>CEP:</strong> {nota.destinatario_cep}
                </p>
              </div>

              {/* Cidade/UF */}
              <div style={{ backgroundColor: "black", color: "white", padding: formatoImpressao === "a4" ? "10px 12px" : "8px 10px", marginBottom: formatoImpressao === "a4" ? "8px" : "6px" }}>
                <p style={{ fontSize: formatoImpressao === "a4" ? "24px" : "14px", fontWeight: "bold", margin: 0 }}>
                  Cidade/UF: {nota.destinatario_cidade} {nota.destinatario_uf}
                </p>
              </div>

              {/* Transportadora */}
              <p style={{ fontSize: formatoImpressao === "a4" ? "18px" : "11px", margin: 0, marginBottom: formatoImpressao === "a4" ? "10px" : "6px", lineHeight: "1.3", padding: formatoImpressao === "a4" ? "0" : "2px 0" }}>
                Transportadora: {empresa?.nome_fantasia?.toUpperCase() || "TRANSUL TRANSPORTE"}
              </p>

              {/* Rodapé */}
              <div style={{ position: "absolute", bottom: formatoImpressao === "a4" ? "2.5cm" : "0.3cm", left: formatoImpressao === "a4" ? "2cm" : "0.5cm", right: formatoImpressao === "a4" ? "2cm" : "0.5cm", display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                <p style={{ fontSize: formatoImpressao === "a4" ? "28px" : "16px", color: "#666", margin: 0 }}>logiflow.com.br</p>
                <div style={{ backgroundColor: "black", color: "white", padding: formatoImpressao === "a4" ? "18px 28px" : "10px 14px", textAlign: "center", minWidth: formatoImpressao === "a4" ? "200px" : "100px" }}>
                  <p style={{ fontSize: formatoImpressao === "a4" ? "24px" : "12px", fontWeight: "bold", margin: 0, marginBottom: formatoImpressao === "a4" ? "8px" : "4px" }}>ÁREA</p>
                  <p style={{ fontSize: formatoImpressao === "a4" ? "72px" : "40px", fontWeight: "bold", margin: 0, lineHeight: "1" }}>
                    {nota.numero_area || volume.numero_sequencial.toString().padStart(2, '0')}
                  </p>
                </div>
              </div>
            </div>
          ))
          ) : (
            // Etiquetas Mãe
            Array.from({ length: qtdEtiquetasMae }).map((_, indexMae) => {
              // Calcular início e fim dos volumes para esta etiqueta
              const volumeInicio = volumesPorEtiquetaMae.slice(0, indexMae).reduce((acc, v) => acc + (parseInt(v) || 0), 0) + 1;
              const volumeFim = volumeInicio + (parseInt(volumesPorEtiquetaMae[indexMae]) || 0) - 1;
              const qtdVolumesEtiqueta = parseInt(volumesPorEtiquetaMae[indexMae]) || 0;
              const qrCodeData = `NF-${nota.numero_nota}-ETQMAE-${indexMae + 1}-VOL${volumeInicio}-${volumeFim}`;
              
              return (
                <div 
                  key={`mae-${indexMae}`}
                  className="etiqueta bg-white border border-gray-300"
                  style={{
                    width: formatoImpressao === "etiqueta" ? "10cm" : "100%",
                    height: formatoImpressao === "etiqueta" ? "15cm" : "100vh",
                    fontFamily: "Arial, sans-serif",
                    position: "relative",
                    padding: formatoImpressao === "etiqueta" ? "0.5cm" : "2cm",
                    pageBreakAfter: "always",
                  }}
                >
                  {/* Cabeçalho */}
                  <div style={{ textAlign: "center", marginBottom: formatoImpressao === "a4" ? "20px" : "4px" }}>
                    <h1 style={{ fontSize: formatoImpressao === "a4" ? "48px" : "20px", fontWeight: "bold", margin: 0, lineHeight: "1.1" }}>
                      {empresa?.nome_fantasia?.toUpperCase() || "TRANSUL TRANSPORTE"}
                    </h1>
                  </div>

                  {/* ETIQUETA MÃE Badge */}
                  <div style={{ display: "flex", justifyContent: "center", marginBottom: formatoImpressao === "a4" ? "12px" : "6px" }}>
                    <div style={{ backgroundColor: "#dc2626", color: "white", padding: formatoImpressao === "a4" ? "12px 24px" : "6px 12px", borderRadius: "8px", fontWeight: "bold", fontSize: formatoImpressao === "a4" ? "24px" : "14px" }}>
                      ETIQUETA MÃE
                    </div>
                  </div>

                  {/* ID, Entrada, Volumes e QR Code */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: formatoImpressao === "a4" ? "12px" : "3px" }}>
                    <div style={{ flex: 1, paddingRight: "6px", display: "flex", flexDirection: "column", justifyContent: "flex-start" }}>
                      <div style={{ marginBottom: formatoImpressao === "a4" ? "12px" : "6px" }}>
                        <p style={{ fontSize: formatoImpressao === "a4" ? "16px" : "7px", margin: 0, marginBottom: formatoImpressao === "a4" ? "6px" : "1px" }}>
                          ID: ETQ-MAE-{indexMae + 1}
                        </p>
                        <p style={{ fontSize: formatoImpressao === "a4" ? "36px" : "14px", fontWeight: "bold", margin: 0, lineHeight: "1.1" }}>
                          <strong>Entrada:</strong><br />
                          {new Date().toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' }) + ', ' + 
                           new Date().toLocaleTimeString('pt-BR', { timeZone: 'America/Sao_Paulo' })}
                        </p>
                      </div>
                      <div style={{ backgroundColor: "black", color: "white", padding: formatoImpressao === "a4" ? "16px 24px" : "8px 10px", textAlign: "center", marginBottom: formatoImpressao === "a4" ? "8px" : "4px" }}>
                        <p style={{ fontSize: formatoImpressao === "a4" ? "18px" : "9px", fontWeight: "bold", margin: 0, marginBottom: formatoImpressao === "a4" ? "4px" : "2px" }}>
                          Etiqueta Mãe:
                        </p>
                        <p style={{ fontSize: formatoImpressao === "a4" ? "64px" : "28px", fontWeight: "bold", margin: 0, lineHeight: "1" }}>
                          {indexMae + 1}/{qtdEtiquetasMae}
                        </p>
                      </div>
                      <div style={{ backgroundColor: "#dc2626", color: "white", padding: formatoImpressao === "a4" ? "16px 24px" : "8px 10px", textAlign: "center", marginBottom: formatoImpressao === "a4" ? "8px" : "4px" }}>
                        <p style={{ fontSize: formatoImpressao === "a4" ? "18px" : "9px", fontWeight: "bold", margin: 0, marginBottom: formatoImpressao === "a4" ? "4px" : "2px" }}>
                          Volumes:
                        </p>
                        <p style={{ fontSize: formatoImpressao === "a4" ? "64px" : "28px", fontWeight: "bold", margin: 0, lineHeight: "1" }}>
                          {qtdVolumesEtiqueta === 1 ? volumeInicio : `${volumeInicio} - ${volumeFim}`}
                        </p>
                      </div>
                      <div style={{ backgroundColor: "black", color: "white", padding: formatoImpressao === "a4" ? "16px 24px" : "8px 10px", textAlign: "center" }}>
                        <p style={{ fontSize: formatoImpressao === "a4" ? "18px" : "9px", fontWeight: "bold", margin: 0, marginBottom: formatoImpressao === "a4" ? "4px" : "2px" }}>
                          Peso Total:
                        </p>
                        <p style={{ fontSize: formatoImpressao === "a4" ? "48px" : "22px", fontWeight: "bold", margin: 0, lineHeight: "1" }}>
                          {nota.peso_total_nf?.toLocaleString('pt-BR', { minimumFractionDigits: 0 }) || "0"} kg
                        </p>
                      </div>
                    </div>
                    <img 
                      src={getQRCodeUrl(qrCodeData)} 
                      alt="QR Code" 
                      style={{ width: formatoImpressao === "a4" ? "288px" : "144px", height: formatoImpressao === "a4" ? "288px" : "144px", marginLeft: "6px", border: "2px solid #000" }}
                    />
                  </div>

                  {/* NF e Pedido */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: formatoImpressao === "a4" ? "8px" : "3px", marginBottom: formatoImpressao === "a4" ? "8px" : "4px" }}>
                    <div style={{ backgroundColor: "black", color: "white", padding: formatoImpressao === "a4" ? "10px 12px" : "8px 10px" }}>
                      <p style={{ fontSize: formatoImpressao === "a4" ? "32px" : "18px", fontWeight: "bold", margin: 0 }}>
                        NF: {nota.numero_nota}
                      </p>
                    </div>
                    <div style={{ backgroundColor: "black", color: "white", padding: formatoImpressao === "a4" ? "10px 12px" : "8px 10px" }}>
                      <p style={{ fontSize: formatoImpressao === "a4" ? "24px" : "13px", fontWeight: "bold", margin: 0 }}>
                        Pedido: {nota.numero_pedido || "N/A"}
                      </p>
                    </div>
                  </div>

                  {/* Remetente */}
                  <div style={{ marginBottom: formatoImpressao === "a4" ? "8px" : "6px", fontSize: formatoImpressao === "a4" ? "18px" : "11px", lineHeight: "1.4", padding: formatoImpressao === "a4" ? "0" : "4px 0" }}>
                    <p style={{ margin: 0 }}>
                      <strong>Remetente:</strong> {nota.emitente_razao_social}
                    </p>
                  </div>

                  {/* Destinatário */}
                  <div style={{ backgroundColor: "black", color: "white", padding: formatoImpressao === "a4" ? "10px 12px" : "8px 10px", marginBottom: formatoImpressao === "a4" ? "8px" : "6px" }}>
                    <p style={{ fontSize: formatoImpressao === "a4" ? "24px" : "13px", fontWeight: "bold", margin: 0, lineHeight: "1.2", marginBottom: formatoImpressao === "a4" ? "6px" : "3px" }}>
                      Destinatário: {nota.destinatario_razao_social}
                    </p>
                    <p style={{ fontSize: formatoImpressao === "a4" ? "16px" : "9px", margin: 0, marginBottom: "3px", lineHeight: "1.3" }}>
                      <strong>Endereço:</strong> {nota.destinatario_endereco}, {nota.destinatario_numero} - {nota.destinatario_bairro}
                    </p>
                    <p style={{ fontSize: formatoImpressao === "a4" ? "16px" : "9px", margin: 0, lineHeight: "1.3" }}>
                      <strong>CEP:</strong> {nota.destinatario_cep}
                    </p>
                  </div>

                  {/* Cidade/UF */}
                  <div style={{ backgroundColor: "black", color: "white", padding: formatoImpressao === "a4" ? "10px 12px" : "8px 10px", marginBottom: formatoImpressao === "a4" ? "8px" : "6px" }}>
                    <p style={{ fontSize: formatoImpressao === "a4" ? "24px" : "14px", fontWeight: "bold", margin: 0 }}>
                      Cidade/UF: {nota.destinatario_cidade} {nota.destinatario_uf}
                    </p>
                  </div>

                  {/* Transportadora */}
                  <p style={{ fontSize: formatoImpressao === "a4" ? "18px" : "11px", margin: 0, marginBottom: formatoImpressao === "a4" ? "10px" : "6px", lineHeight: "1.3", padding: formatoImpressao === "a4" ? "0" : "2px 0" }}>
                    Transportadora: {empresa?.nome_fantasia?.toUpperCase() || "TRANSUL TRANSPORTE"}
                  </p>

                  {/* Rodapé */}
                  <div style={{ position: "absolute", bottom: formatoImpressao === "a4" ? "2.5cm" : "0.3cm", left: formatoImpressao === "a4" ? "2cm" : "0.5cm", right: formatoImpressao === "a4" ? "2cm" : "0.5cm", display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                    <p style={{ fontSize: formatoImpressao === "a4" ? "28px" : "16px", color: "#666", margin: 0 }}>logiflow.com.br</p>
                    <div style={{ backgroundColor: "black", color: "white", padding: formatoImpressao === "a4" ? "18px 28px" : "10px 14px", textAlign: "center", minWidth: formatoImpressao === "a4" ? "200px" : "100px" }}>
                      <p style={{ fontSize: formatoImpressao === "a4" ? "24px" : "12px", fontWeight: "bold", margin: 0, marginBottom: formatoImpressao === "a4" ? "8px" : "4px" }}>ÁREA</p>
                      <p style={{ fontSize: formatoImpressao === "a4" ? "72px" : "40px", fontWeight: "bold", margin: 0, lineHeight: "1" }}>
                        {nota.numero_area || (indexMae + 1).toString().padStart(2, '0')}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}