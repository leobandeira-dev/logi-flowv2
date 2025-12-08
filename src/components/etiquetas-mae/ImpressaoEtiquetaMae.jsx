import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Printer, X } from "lucide-react";

export default function ImpressaoEtiquetaMae({ open, onClose, etiqueta, empresa, notas = [], volumes = [] }) {
  const [printFormat, setPrintFormat] = useState("10x15");
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const checkDarkMode = () => {
      setIsDark(document.documentElement.classList.contains('dark'));
    };
    checkDarkMode();
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    const printArea = document.getElementById('etiqueta-print-area');
    
    if (!printWindow || !printArea) return;

    const content = printArea.innerHTML;
    
    const pageSize = printFormat === '10x15' ? '10cm 15cm' : 'A4 portrait';
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Impressão de Etiqueta Mãe</title>
          <style>
            * {
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
              color-adjust: exact !important;
            }
            
            @page {
              size: ${pageSize};
              margin: ${printFormat === '10x15' ? '2mm' : '5mm'};
            }
            
            @media print {
              * {
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
                color-adjust: exact !important;
              }
              
              html, body {
                height: auto !important;
                overflow: visible !important;
              }
              
              .etiqueta-container {
                page-break-after: avoid !important;
                page-break-inside: avoid !important;
              }
              
              body {
                margin: 0;
                padding: ${printFormat === '10x15' ? '0' : '0'};
                font-family: Arial, sans-serif;
              }
              
              .no-print {
                display: none !important;
              }
            }
            
            body {
              margin: 0;
              padding: 0;
              font-family: Arial, sans-serif;
            }
            
            .etiqueta-container {
              width: 100%;
              height: auto;
              border: 2px solid #000;
              padding: 8px;
              box-sizing: border-box;
              page-break-inside: avoid;
              page-break-after: always;
            }
            
            .header {
              border-bottom: 2px solid #000;
              padding-bottom: 5px;
              margin-bottom: 8px;
              font-size: 7px;
              text-align: center;
            }
            
            .header-line {
              margin: 1px 0;
            }
            
            .qr-code-container {
              display: flex;
              justify-content: center;
              align-items: center;
              margin: 5px 0;
            }
            
            .campo-destaque {
              background-color: #000;
              color: #fff;
              padding: 4px 8px;
              margin: 2px 0;
              font-weight: bold;
              font-size: 11px;
              text-align: left;
            }
            
            .campo-label {
              font-size: 10px;
              margin-right: 8px;
            }
            
            .codigo-principal {
              font-size: 18px;
              font-weight: bold;
              text-align: center;
              margin: 5px 0;
              padding: 6px;
              background-color: #f0f0f0;
              border: 2px solid #000;
              letter-spacing: 1px;
            }
            
            .info-section {
              margin: 15px 0;
              border: 1px solid #000;
              padding: 10px;
            }
            
            .info-label {
              font-size: 11px;
              font-weight: bold;
              color: #666;
              margin-bottom: 3px;
            }
            
            .info-value {
              font-size: 16px;
              font-weight: bold;
              margin-bottom: 10px;
            }
            
            .observacoes {
              margin-top: 3px;
              font-size: 9px;
              min-height: 20px;
              border: 1px solid #ddd;
              padding: 4px;
              background-color: #fafafa;
            }
            
            .footer-text {
              margin-top: 5px;
              padding-top: 3px;
              border-top: 1px solid #ddd;
              font-size: 6px;
              text-align: center;
              color: #666;
            }
            
            .footer-powered {
              font-size: 6px;
              color: #999;
            }
            
            .relatorio-container {
              width: 100%;
              max-width: 100%;
              padding: 3mm;
              font-family: Arial, sans-serif;
            }
            
            .relatorio-header {
              text-align: center;
              margin-bottom: 15px;
            }
            
            .relatorio-title {
              font-size: 18px;
              font-weight: bold;
              margin-bottom: 5px;
            }
            
            .relatorio-subtitle {
              font-size: 12px;
              color: #666;
              margin-bottom: 10px;
            }
            
            .relatorio-empresa {
              font-size: 14px;
              font-weight: bold;
              margin-bottom: 3px;
            }
            
            .relatorio-info {
              font-size: 11px;
              color: #444;
              margin-bottom: 10px;
            }
            
            .relatorio-table {
              width: 100%;
              border-collapse: collapse;
              margin: 15px 0;
              font-size: 11px;
              border: 1px solid #000;
            }
            
            .relatorio-table th {
              background-color: #f0f0f0;
              border: 1px solid #000;
              padding: 2px 1px;
              text-align: left;
              font-weight: bold;
              font-size: 9px;
              line-height: 1.2;
            }
            
            .relatorio-table td {
              border: 1px solid #000;
              padding: 2px 1px;
              vertical-align: middle;
              font-size: 8px;
              line-height: 1.2;
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
            }
            
            .relatorio-table-compact {
              width: 100%;
              border-collapse: collapse;
              font-size: 5px;
              margin: 1px 0;
            }
            
            .relatorio-table-compact th {
              background-color: #000;
              color: #fff;
              border: 1px solid #000;
              padding: 2px 1.5px;
              text-align: left;
              font-weight: bold;
              font-size: 7px;
              line-height: 1;
            }
            
            .relatorio-table-compact td {
              border: 1px solid #333;
              padding: 2px 1px;
              vertical-align: middle;
              font-size: 6px;
              line-height: 1.2;
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
            }
            
            .page-break {
              page-break-after: always;
            }
            
            .relatorio-totais {
              margin-top: 12px;
              padding: 8px;
              background-color: #f9f9f9;
              border: 1px solid #000;
            }
            
            .relatorio-totais p {
              margin: 2px 0;
              font-size: 11px;
              font-weight: bold;
            }
            
            .relatorio-footer {
              margin-top: 15px;
              text-align: center;
              font-size: 9px;
              color: #666;
            }
          </style>
        </head>
        <body>
          ${content}
        </body>
      </html>
    `);

    printWindow.document.close();
    
    setTimeout(() => {
      printWindow.focus();
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  const theme = {
    bg: isDark ? '#0f172a' : '#ffffff',
    text: isDark ? '#f1f5f9' : '#111827',
    textMuted: isDark ? '#94a3b8' : '#6b7280',
    border: isDark ? '#334155' : '#e5e7eb',
  };

  if (!etiqueta) return null;

  // Extrair dados da descrição
  const descricaoParts = etiqueta.descricao?.split(' - ') || [];
  const cliente = descricaoParts[0] || '';
  const localParts = descricaoParts[1]?.split('/') || [];
  const cidade = localParts[0] || '';
  const uf = localParts[1] || '';
  
  // Preparar dados do relatório
  const notasVinculadas = notas.filter(n => etiqueta.notas_fiscais_ids?.includes(n.id));
  const volumesPorNota = {};
  
  // Agrupar volumes por nota fiscal na ordem de vinculação
  const notasOrdenadas = [];
  const notasProcessadas = new Set();
  
  volumes.filter(v => etiqueta.volumes_ids?.includes(v.id)).forEach(volume => {
    const notaId = volume.nota_fiscal_id;
    if (notaId && !notasProcessadas.has(notaId)) {
      notasProcessadas.add(notaId);
      notasOrdenadas.push(notaId);
    }
    
    if (!volumesPorNota[notaId]) {
      volumesPorNota[notaId] = [];
    }
    volumesPorNota[notaId].push(volume);
  });
  
  const notasComVolumes = notasOrdenadas.map(notaId => {
    const nota = notas.find(n => n.id === notaId);
    const volumesDaNota = volumesPorNota[notaId] || [];
    const pesoNota = volumesDaNota.reduce((sum, v) => sum + (v.peso_volume || 0), 0);
    
    return {
      nota,
      volumes: volumesDaNota,
      quantidade: volumesDaNota.length,
      peso: pesoNota
    };
  }).filter(item => item.nota);
  
  const totalNotas = notasComVolumes.length;
  const totalVolumes = etiqueta.quantidade_volumes || 0;
  const pesoTotal = etiqueta.peso_total || 0;
  
  // Dividir notas em páginas para formato 10x15cm (22 notas por página - otimizado)
  const notasPorPagina = 22;
  const paginasCompactas = [];
  for (let i = 0; i < notasComVolumes.length; i += notasPorPagina) {
    paginasCompactas.push(notasComVolumes.slice(i, i + notasPorPagina));
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl" style={{ backgroundColor: theme.bg, borderColor: theme.border }}>
        <DialogHeader>
          <DialogTitle style={{ color: theme.text }}>
            Impressão de Etiqueta Mãe
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-3">
            <div className="flex gap-3 justify-center">
              <Button
                variant={printFormat === '10x15' ? 'default' : 'outline'}
                onClick={() => setPrintFormat('10x15')}
                className={printFormat === '10x15' ? 'bg-green-600 hover:bg-green-700' : ''}
                style={printFormat !== '10x15' ? { borderColor: theme.border, color: theme.text } : {}}
              >
                Formato 10x15cm
              </Button>
              <Button
                variant={printFormat === 'a4' ? 'default' : 'outline'}
                onClick={() => setPrintFormat('a4')}
                className={printFormat === 'a4' ? 'bg-blue-600 hover:bg-blue-700' : ''}
                style={printFormat !== 'a4' ? { borderColor: theme.border, color: theme.text } : {}}
              >
                Formato A4
              </Button>
            </div>
          </div>

          <div 
            id="etiqueta-print-area"
            style={{ 
              backgroundColor: '#fff',
              padding: printFormat === 'a4' ? '10px' : '20px',
              border: '1px solid #ddd',
              maxHeight: '60vh',
              overflowY: 'auto',
              overflowX: printFormat === 'a4' ? 'auto' : 'visible'
            }}
          >
            <style>
              {`
                .campo-destaque-preview {
                  background-color: #000;
                  color: #fff;
                  padding: 6px 10px;
                  margin: 4px 0;
                  font-weight: bold;
                  font-size: 13px;
                  text-align: left;
                }
                
                .campo-label-preview {
                  font-size: 11px;
                  margin-right: 8px;
                }
              `}
            </style>
            
            {printFormat === '10x15' ? (
              <>
                {/* Primeira página: Etiqueta Mãe */}
                <div className="etiqueta-container">
                  <div className="header">
                    <div className="header-line">
                      <strong>{empresa?.razao_social || empresa?.nome_fantasia || 'EMPRESA'}</strong>
                    </div>
                    {empresa?.cnpj && (
                      <div className="header-line">CNPJ: {empresa.cnpj}</div>
                    )}
                    {empresa?.telefone && (
                      <div className="header-line">Tel: {empresa.telefone}</div>
                    )}
                    <div className="header-line" style={{ marginTop: '5px', fontSize: '10px', fontWeight: 'bold' }}>
                      ETIQUETA MÃE - UNITIZAÇÃO
                    </div>
                  </div>

                  <div className="qr-code-container">
                    <img 
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(etiqueta.codigo)}`}
                      alt="QR Code"
                      style={{ width: '200px', height: '200px', border: '2px solid #000', display: 'block', margin: '0 auto' }}
                    />
                  </div>

                  <div className="codigo-principal">
                    {etiqueta.codigo}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-around', margin: '5px 0', padding: '5px', background: '#f3f4f6', border: '1px solid #000', borderRadius: '3px' }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '8px', color: '#6b7280', fontWeight: '600', marginBottom: '2px' }}>Notas</div>
                      <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#111827' }}>{totalNotas}</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '8px', color: '#6b7280', fontWeight: '600', marginBottom: '2px' }}>Volumes</div>
                      <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#111827' }}>{etiqueta.quantidade_volumes || 0}</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '8px', color: '#6b7280', fontWeight: '600', marginBottom: '2px' }}>Peso</div>
                      <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#111827' }}>{(etiqueta.peso_total || 0).toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} kg</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '8px', color: '#6b7280', fontWeight: '600', marginBottom: '2px' }}>M³</div>
                      <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#111827' }}>{(etiqueta.m3_total || 0).toFixed(2)}</div>
                    </div>
                  </div>

                  <div style={{ margin: '10px 0' }}>
                    <div className="campo-destaque-preview">
                      <span className="campo-label-preview">CLIENTE:</span> {cliente || 'N/A'}
                    </div>

                    <div className="campo-destaque-preview">
                      <span className="campo-label-preview">CIDADE DESTINO:</span> {cidade || 'N/A'}
                    </div>

                    <div className="campo-destaque-preview">
                      <span className="campo-label-preview">UF:</span> {uf || 'N/A'}
                    </div>
                  </div>

                  {etiqueta.observacoes && (
                    <div style={{ margin: '4px 0' }}>
                      <div className="info-label">OBSERVAÇÕES</div>
                      <div className="observacoes">{etiqueta.observacoes}</div>
                    </div>
                  )}

                  <div className="footer-text">
                    Criado em: {etiqueta.created_date ? new Date(etiqueta.created_date).toLocaleString('pt-BR') : '-'}
                    <div className="footer-powered">www.logiflow.com.br</div>
                  </div>
                </div>

                {/* Páginas seguintes: Lista de Notas */}
                {paginasCompactas.map((paginaNotas, pageIndex) => (
                  <div key={pageIndex} className={pageIndex < paginasCompactas.length - 1 ? 'page-break' : ''}>
                    <div style={{ 
                      width: '100%', 
                      padding: '1mm',
                      fontFamily: 'Arial, sans-serif',
                      position: 'relative'
                    }}>
                      {/* Cabeçalho */}
                      <div style={{ textAlign: 'center', marginBottom: '1px', paddingBottom: '1px', borderBottom: '2px solid #000' }}>
                        <div style={{ fontSize: '8px', fontWeight: 'bold', marginBottom: '0.5px', lineHeight: '1.1' }}>
                          {empresa?.razao_social || empresa?.nome_fantasia || 'EMPRESA'}
                        </div>
                        <div style={{ fontSize: '5px', color: '#444', marginBottom: '0.5px', lineHeight: '1.1' }}>
                          CNPJ: {empresa?.cnpj || '-'} | Tel: {empresa?.telefone || '-'}
                        </div>
                        <div style={{ fontSize: '6px', fontWeight: 'bold', marginTop: '1px', lineHeight: '1.1' }}>
                          LISTA DE NOTAS FISCAIS
                        </div>
                        <div style={{ fontSize: '5px', color: '#666', marginTop: '0.5px', lineHeight: '1.1' }}>
                          Etiqueta: {etiqueta.codigo}
                        </div>
                      </div>
                      
                      {/* QR Code */}
                      <div style={{ display: 'flex', justifyContent: 'center', margin: '1px 0' }}>
                        <img 
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(etiqueta.codigo)}`}
                          alt="QR Code"
                          style={{ width: '35px', height: '35px', border: '1px solid #000' }}
                        />
                      </div>
                      
                      {/* Info Cliente/Destino */}
                      <div style={{ fontSize: '5px', textAlign: 'center', marginBottom: '1px', padding: '1px', backgroundColor: '#f0f0f0', border: '1px solid #000', lineHeight: '1.1' }}>
                        <strong>Cliente:</strong> {cliente || '-'} | <strong>Destino:</strong> {cidade || '-'}/{uf || '-'}
                      </div>
                      
                      {/* Tabela de Notas */}
                      <table className="relatorio-table-compact" style={{ width: '96%', tableLayout: 'fixed', marginLeft: 'auto', marginRight: 'auto' }}>
                        <thead>
                          <tr>
                            <th style={{ width: '5%', padding: '2px 1px' }}>Or</th>
                            <th style={{ width: '10%', padding: '2px 1px' }}>NF</th>
                            <th style={{ width: '45%', padding: '2px 1px' }}>Remetente</th>
                            <th style={{ width: '18%', padding: '2px 1px' }}>Cidade Dest</th>
                            <th style={{ width: '6%', padding: '2px 1px' }}>UF</th>
                            <th style={{ width: '7%', padding: '2px 1px' }}>Vol</th>
                            <th style={{ width: '9%', padding: '2px 1px' }}>Peso</th>
                          </tr>
                        </thead>
                        <tbody>
                          {paginaNotas.map((item, localIndex) => {
                            const ordemGlobal = pageIndex * notasPorPagina + localIndex + 1;
                            return (
                              <tr key={item.nota.id}>
                                <td style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '6.5px' }}>{ordemGlobal}</td>
                                <td style={{ fontWeight: 'bold', fontSize: '6.5px' }}>{item.nota.numero_nota}</td>
                                <td style={{ fontSize: '6px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                  {item.nota.emitente_razao_social?.substring(0, 60) || '-'}
                                </td>
                                <td style={{ fontSize: '6px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                  {item.nota.destinatario_cidade?.substring(0, 20) || '-'}
                                </td>
                                <td style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '6.5px' }}>
                                  {item.nota.destinatario_uf || '-'}
                                </td>
                                <td style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '6.5px' }}>
                                  {item.quantidade}
                                </td>
                                <td style={{ textAlign: 'center', fontSize: '6.5px', fontWeight: 'bold' }}>
                                  {item.peso.toFixed(0)}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                      
                      {/* Totais - apenas na última página */}
                      {pageIndex === paginasCompactas.length - 1 && (
                        <div style={{ marginTop: '1px', padding: '1px', backgroundColor: '#f9f9f9', border: '1px solid #000' }}>
                          <div style={{ fontSize: '5px', fontWeight: 'bold', display: 'flex', justifyContent: 'space-around', lineHeight: '1.1' }}>
                            <span>Notas: {totalNotas}</span>
                            <span>Volumes: {totalVolumes}</span>
                            <span>Peso: {pesoTotal.toFixed(0)} kg</span>
                          </div>
                        </div>
                      )}
                      
                      {/* Footer */}
                      <div style={{ marginTop: '1px', textAlign: 'center', fontSize: '3.5px', color: '#666', lineHeight: '1.1' }}>
                        {pageIndex === paginasCompactas.length - 1 && `${new Date().toLocaleDateString('pt-BR')} | `}
                        Pág {pageIndex + 1}/{paginasCompactas.length}
                      </div>
                    </div>
                  </div>
                ))}
              </>
            ) : (
              <div className="relatorio-container">
                  <div className="relatorio-header">
                    <div className="relatorio-title">Lista de Notas Fiscais do Carregamento</div>
                    <div className="relatorio-subtitle">Etiqueta Mãe: {etiqueta.codigo}</div>
                    
                    <div style={{ borderTop: '2px solid #000', borderBottom: '2px solid #000', padding: '10px 0', margin: '12px 0' }}>
                      <div className="relatorio-empresa">
                        {empresa?.razao_social || empresa?.nome_fantasia || 'EMPRESA'}
                      </div>
                      <div className="relatorio-info">
                        CNPJ: {empresa?.cnpj || '-'} | Tel: {empresa?.telefone || '-'}
                      </div>
                    </div>
                    
                    <div className="relatorio-info" style={{ marginTop: '8px' }}>
                      <strong>Cliente:</strong> {cliente || '-'} | <strong>Destino:</strong> {cidade || '-'} / {uf || '-'}
                    </div>
                  </div>
                  
                  <table className="relatorio-table" style={{ tableLayout: 'fixed', width: '96%', marginLeft: 'auto', marginRight: 'auto' }}>
                    <thead>
                      <tr>
                        <th style={{ width: '3%', padding: '2px 1px' }}>Ord</th>
                        <th style={{ width: '7%', padding: '2px 1px' }}>NF</th>
                        <th style={{ width: '7%', padding: '2px 1px' }}>Origem</th>
                        <th style={{ width: '28%', padding: '2px 1px' }}>Remetente</th>
                        <th style={{ width: '27%', padding: '2px 1px' }}>Destinatário</th>
                        <th style={{ width: '12%', padding: '2px 1px' }}>Cidade</th>
                        <th style={{ width: '4%', padding: '2px 1px' }}>UF</th>
                        <th style={{ width: '6%', padding: '2px 1px' }}>Vol</th>
                        <th style={{ width: '6%', padding: '2px 1px' }}>Peso</th>
                      </tr>
                    </thead>
                    <tbody>
                      {notasComVolumes.map((item, index) => (
                        <tr key={item.nota.id}>
                          <td style={{ textAlign: 'center', fontWeight: 'bold', padding: '2px 1px' }}>{index + 1}</td>
                          <td style={{ fontWeight: 'bold', padding: '2px 1px' }}>{item.nota.numero_nota}</td>
                          <td title={item.nota.emitente_cidade} style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', padding: '2px 1px' }}>
                            {(item.nota.emitente_cidade || '-').substring(0, 9)}
                          </td>
                          <td title={`${item.nota.emitente_razao_social} - ${item.nota.emitente_endereco}, ${item.nota.emitente_numero}`} style={{ padding: '2px 1px' }}>
                            <div style={{ fontWeight: 'bold', marginBottom: '1px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {(item.nota.emitente_razao_social || '').substring(0, 40)}
                            </div>
                            <div style={{ fontSize: '7px', color: '#666', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {(item.nota.emitente_endereco || '').substring(0, 35)}, {item.nota.emitente_numero || ''}
                            </div>
                          </td>
                          <td style={{ fontWeight: 'bold', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', padding: '2px 1px' }} title={item.nota.destinatario_razao_social}>
                            {(item.nota.destinatario_razao_social || '').substring(0, 32)}
                          </td>
                          <td title={item.nota.destinatario_cidade} style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', padding: '2px 1px' }}>
                            {(item.nota.destinatario_cidade || '-').substring(0, 13)}
                          </td>
                          <td style={{ textAlign: 'center', fontWeight: 'bold', padding: '2px 1px' }}>
                            {item.nota.destinatario_uf || '-'}
                          </td>
                          <td style={{ textAlign: 'center', fontWeight: 'bold', padding: '2px 1px' }}>
                            {item.quantidade}
                          </td>
                          <td style={{ textAlign: 'center', fontWeight: 'bold', padding: '2px 1px' }}>
                            {item.peso.toFixed(0)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  
                  <div className="relatorio-totais">
                    <p>Total de Notas: {totalNotas}</p>
                    <p>Total de Volumes: {totalVolumes}</p>
                    <p>Peso Total: {pesoTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} kg</p>
                  </div>
                  
                  <div className="relatorio-footer">
                    Relatório gerado por: {empresa?.razao_social || 'Sistema'} | Data: {new Date().toLocaleString('pt-BR')}
                  </div>
                </div>
              )}
          </div>

          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              style={{ borderColor: theme.border, color: theme.text }}
            >
              <X className="w-4 h-4 mr-2" />
              Fechar
            </Button>
            <Button
              onClick={handlePrint}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Printer className="w-4 h-4 mr-2" />
              Imprimir
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}