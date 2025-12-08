
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileDown, Loader2, Plus, X, Image as ImageIcon, Link as LinkIcon, Copy } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";
import { base44 } from "@/api/base44Client";

export default function ExportarOfertasPDF({ ordens }) {
  const [open, setOpen] = useState(false);
  const [gerando, setGerando] = useState(false);
  const [empresa, setEmpresa] = useState(null);
  const [numerosWhatsApp, setNumerosWhatsApp] = useState([""]);
  const [formatoExportacao, setFormatoExportacao] = useState("pdf");
  const [ordensSelecionadas, setOrdensSelecionadas] = useState([]);
  const [linkPublico, setLinkPublico] = useState("");

  useEffect(() => {
    if (open) {
      loadEmpresa();
      // Selecionar todas por padrão
      const ofertas = ordens.filter(o => 
        o.tipo_registro === "oferta" || 
        (!o.motorista_id && !o.cavalo_id && !o.motorista_nome_temp && !o.cavalo_placa_temp)
      );
      setOrdensSelecionadas(ofertas.map(o => o.id));
    }
  }, [open, ordens]);

  const loadEmpresa = async () => {
    try {
      const user = await base44.auth.me();
      if (user.empresa_id) {
        const empresaData = await base44.entities.Empresa.get(user.empresa_id);
        setEmpresa(empresaData);
      }
    } catch (error) {
      console.error("Erro ao carregar empresa:", error);
    }
  };

  const adicionarNumeroWhatsApp = () => {
    setNumerosWhatsApp([...numerosWhatsApp, ""]);
  };

  const removerNumeroWhatsApp = (index) => {
    if (numerosWhatsApp.length > 1) {
      setNumerosWhatsApp(numerosWhatsApp.filter((_, i) => i !== index));
    }
  };

  const atualizarNumeroWhatsApp = (index, valor) => {
    const novosNumeros = [...numerosWhatsApp];
    novosNumeros[index] = valor;
    setNumerosWhatsApp(novosNumeros);
  };

  const toggleOrdem = (ordemId) => {
    setOrdensSelecionadas(prev => 
      prev.includes(ordemId) 
        ? prev.filter(id => id !== ordemId)
        : [...prev, ordemId]
    );
  };

  const toggleTodas = () => {
    const ofertas = ordens.filter(o => 
      o.tipo_registro === "oferta" || 
      (!o.motorista_id && !o.cavalo_id && !o.motorista_nome_temp && !o.cavalo_placa_temp)
    );
    
    if (ordensSelecionadas.length === ofertas.length) {
      setOrdensSelecionadas([]);
    } else {
      setOrdensSelecionadas(ofertas.map(o => o.id));
    }
  };

  const gerarLinkPublico = () => {
    const numerosValidos = numerosWhatsApp.filter(n => n.trim() !== "");
    
    if (numerosValidos.length === 0) {
      toast.error("Informe pelo menos um número de WhatsApp");
      return;
    }

    if (ordensSelecionadas.length === 0) {
      toast.error("Selecione pelo menos uma oferta");
      return;
    }

    const baseUrl = "https://logiflow.com.br";
    const params = new URLSearchParams({
      ordens: ordensSelecionadas.join(','),
      empresa: empresa?.id || '',
      whatsapp: numerosValidos.join(',')
    });

    const link = `${baseUrl}/#/OfertasPublicas?${params.toString()}`;
    setLinkPublico(link);
    setFormatoExportacao("link");
    
    navigator.clipboard.writeText(link);
    toast.success("Link público copiado para a área de transferência!");
  };

  const gerarConteudo = async () => {
    const numerosValidos = numerosWhatsApp.filter(n => n.trim() !== "");
    
    if (numerosValidos.length === 0) {
      toast.error("Informe pelo menos um número de WhatsApp");
      return;
    }

    if (ordensSelecionadas.length === 0) {
      toast.error("Selecione pelo menos uma oferta");
      return;
    }

    setGerando(true);
    try {
      const ofertas = ordens.filter(o => ordensSelecionadas.includes(o.id));

      const dataAtual = format(new Date(), "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
      const horaAtual = format(new Date(), "HH:mm", { locale: ptBR });

      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <style>
            @page { 
              size: A4 landscape; 
              margin: 15mm; 
            }
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              font-size: 9pt;
              color: #1f2937;
              line-height: 1.4;
              background: white;
            }
            .empresa-header {
              background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
              color: white;
              padding: 20px;
              border-radius: 8px;
              margin-bottom: 20px;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }
            .empresa-header h2 {
              font-size: 20pt;
              margin-bottom: 8px;
              font-weight: 700;
            }
            .empresa-info {
              display: grid;
              grid-template-columns: repeat(2, 1fr);
              gap: 8px;
              font-size: 9pt;
              margin-top: 12px;
            }
            .empresa-info-item {
              display: flex;
              align-items: center;
              gap: 6px;
            }
            .empresa-info-item strong {
              font-weight: 600;
            }
            .header {
              text-align: center;
              margin-bottom: 15px;
              padding-bottom: 10px;
              border-bottom: 3px solid #2563eb;
            }
            .header h1 {
              font-size: 22pt;
              color: #1e40af;
              margin-bottom: 8px;
              font-weight: 700;
            }
            .header p {
              font-size: 10pt;
              color: #6b7280;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 10px;
              background: white;
            }
            th {
              background: linear-gradient(to bottom, #3b82f6, #2563eb);
              color: white;
              padding: 8px 6px;
              text-align: left;
              font-size: 8pt;
              font-weight: 600;
              border: 1px solid #2563eb;
              text-transform: uppercase;
              letter-spacing: 0.3px;
            }
            td {
              padding: 7px 6px;
              border: 1px solid #e5e7eb;
              font-size: 8.5pt;
              vertical-align: top;
            }
            tr:nth-child(even) {
              background-color: #f9fafb;
            }
            tr:hover {
              background-color: #eff6ff;
            }
            .numero {
              font-weight: 700;
              color: #1e40af;
              font-size: 9pt;
            }
            .rota {
              font-weight: 600;
              color: #374151;
            }
            .modalidade {
              display: inline-block;
              padding: 2px 6px;
              border-radius: 3px;
              font-size: 7.5pt;
              font-weight: 600;
              text-transform: uppercase;
            }
            .modalidade-normal {
              background-color: #dbeafe;
              color: #1e40af;
              border: 1px solid #93c5fd;
            }
            .modalidade-prioridade {
              background-color: #fef3c7;
              color: #92400e;
              border: 1px solid #fbbf24;
            }
            .modalidade-expressa {
              background-color: #fee2e2;
              color: #991b1b;
              border: 1px solid #f87171;
            }
            .peso {
              font-weight: 600;
              color: #059669;
            }
            .frete {
              font-weight: 700;
              color: #16a34a;
              font-size: 9pt;
            }
            .footer {
              margin-top: 20px;
              text-align: center;
              font-size: 7.5pt;
              color: #9ca3af;
              border-top: 1px solid #e5e7eb;
              padding-top: 10px;
            }
            .data-agendamento {
              font-size: 8pt;
              color: #4b5563;
            }
            .observacoes {
              font-size: 7.5pt;
              color: #6b7280;
              font-style: italic;
              max-width: 150px;
              word-wrap: break-word;
            }
            .whatsapp-btn {
              background: #25D366;
              color: white;
              padding: 4px 8px;
              border-radius: 4px;
              text-decoration: none;
              font-size: 8pt;
              font-weight: 600;
              display: inline-flex;
              align-items: center;
              gap: 4px;
              transition: background 0.2s;
            }
            .whatsapp-btn:hover {
              background: #128C7E;
            }
            .whatsapp-icon {
              width: 12px;
              height: 12px;
            }
            @media print {
              .whatsapp-btn {
                background: #25D366 !important;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
            }
          </style>
        </head>
        <body>
          ${empresa ? `
            <div class="empresa-header">
              <h2>${empresa.nome_fantasia || empresa.razao_social}</h2>
              <div class="empresa-info">
                ${empresa.razao_social && empresa.razao_social !== empresa.nome_fantasia ? `
                  <div class="empresa-info-item">
                    <strong>Razão Social:</strong> ${empresa.razao_social}
                  </div>
                ` : ''}
                ${empresa.endereco ? `
                  <div class="empresa-info-item">
                    <strong>Endereço:</strong> ${empresa.endereco}
                  </div>
                ` : ''}
                ${empresa.cidade || empresa.estado ? `
                  <div class="empresa-info-item">
                    <strong>Cidade/UF:</strong> ${empresa.cidade || ''} - ${empresa.estado || ''}
                  </div>
                ` : ''}
                ${empresa.telefone ? `
                  <div class="empresa-info-item">
                    <strong>Telefone:</strong> ${empresa.telefone}
                  </div>
                ` : ''}
                ${empresa.email ? `
                  <div class="empresa-info-item">
                    <strong>Email:</strong> ${empresa.email}
                  </div>
                ` : ''}
              </div>
            </div>
          ` : ''}
          
          <div class="header">
            <h1>🚚 OFERTAS DE CARGA DISPONÍVEIS<br>${dataAtual}</h1>
            <p>Gerado às ${horaAtual}</p>
          </div>
          
          <table>
            <thead>
              <tr>
                <th style="width: 60px;">Nº</th>
                <th style="width: 130px;">Rota</th>
                <th style="width: 70px;">Modalidade</th>
                <th style="width: 90px;">Tipo Veíc.</th>
                <th style="width: 50px;">Peso</th>
                <th style="width: 75px;">Frete</th>
                <th style="width: 100px;">Agend. Carreg.</th>
                <th style="width: 140px;">Observações</th>
                <th style="width: 100px;">Negociar</th>
              </tr>
            </thead>
            <tbody>
              ${ofertas.map((oferta) => {
                const modalidadeClass = 
                  oferta.modalidade_carga === 'expressa' ? 'modalidade-expressa' :
                  oferta.modalidade_carga === 'prioridade' ? 'modalidade-prioridade' :
                  'modalidade-normal';
                
                const modalidadeLabel = 
                  oferta.modalidade_carga === 'expressa' ? 'Expressa' :
                  oferta.modalidade_carga === 'prioridade' ? 'Prioridade' :
                  'Normal';

                const peso = oferta.peso ? `${(oferta.peso / 1000).toFixed(2)}t` : '-';
                const frete = oferta.frete_viagem || oferta.valor_total_frete;
                const freteFormatado = frete ? 
                  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(frete) : 
                  '-';

                const dataCarregamento = oferta.carregamento_agendamento_data ? 
                  format(new Date(oferta.carregamento_agendamento_data), "dd/MM/yyyy HH:mm", { locale: ptBR }) : 
                  '-';

                const observacoes = oferta.observacao_carga || '-';

                const mensagemWhatsApp = encodeURIComponent(
                  `🚚 *Interesse em Carga Disponível*\n\n` +
                  `*Ordem:* ${oferta.numero_carga || '#' + oferta.id.slice(-6)}\n` +
                  `*Rota:* ${oferta.origem_cidade || oferta.origem || '-'} → ${oferta.destino_cidade || oferta.destino || '-'}\n` +
                  `*Tipo Veículo:* ${oferta.tipo_veiculo || '-'}\n` +
                  `*Peso:* ${peso}\n` +
                  `*Frete:* ${freteFormatado}\n` +
                  `*Carregamento:* ${dataCarregamento}\n\n` +
                  `Gostaria de mais informações sobre esta carga.`
                );

                const linksWhatsApp = numerosValidos.map((numero, idx) => {
                  const numeroLimpo = numero.replace(/\D/g, '');
                  return `
                    <a href="https://wa.me/55${numeroLimpo}?text=${mensagemWhatsApp}" 
                       class="whatsapp-btn" 
                       target="_blank"
                       title="Negociar via WhatsApp ${numero}">
                      <svg class="whatsapp-icon" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                      </svg>
                      ${numero}
                    </a>
                  `;
                }).join('<br style="margin: 2px 0;">');

                return `
                  <tr>
                    <td class="numero">${oferta.numero_carga || '#' + oferta.id.slice(-6)}</td>
                    <td class="rota">${oferta.origem_cidade || oferta.origem || '-'} → ${oferta.destino_cidade || oferta.destino || '-'}</td>
                    <td><span class="modalidade ${modalidadeClass}">${modalidadeLabel}</span></td>
                    <td>${oferta.tipo_veiculo || '-'}</td>
                    <td class="peso">${peso}</td>
                    <td class="frete">${freteFormatado}</td>
                    <td class="data-agendamento">${dataCarregamento}</td>
                    <td class="observacoes">${observacoes}</td>
                    <td>${linksWhatsApp}</td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
          
          <div class="footer">
            Total de ofertas disponíveis: <strong>${ofertas.length}</strong>
          </div>
        </body>
        </html>
      `;

      if (formatoExportacao === "imagem") {
        const blob = new Blob([htmlContent], { type: 'text/html' });
        const url = window.URL.createObjectURL(blob);
        
        const printWindow = window.open(url, '_blank');
        
        if (printWindow) {
          printWindow.onload = () => {
            setTimeout(() => {
              toast.success(`${ofertas.length} ofertas prontas. Use "Salvar como PDF" e depois converta para imagem.`);
              printWindow.print();
              window.URL.revokeObjectURL(url);
            }, 250);
          };
          
          setOpen(false);
        } else {
          toast.error("Não foi possível abrir a janela. Verifique o bloqueador de pop-ups.");
        }
      } else {
        const blob = new Blob([htmlContent], { type: 'text/html' });
        const url = window.URL.createObjectURL(blob);
        
        const printWindow = window.open(url, '_blank');
        
        if (printWindow) {
          printWindow.onload = () => {
            setTimeout(() => {
              printWindow.print();
              window.URL.revokeObjectURL(url);
            }, 250);
          };
          
          toast.success(`${ofertas.length} ofertas exportadas para PDF`);
          setOpen(false);
        } else {
          toast.error("Não foi possível abrir a janela de impressão. Verifique o bloqueador de pop-ups.");
        }
      }
    } catch (error) {
      console.error("Erro ao gerar conteúdo:", error);
      toast.error("Erro ao gerar arquivo");
    } finally {
      setGerando(false);
    }
  };

  const ofertas = ordens.filter(o => 
    o.tipo_registro === "oferta" || 
    (!o.motorista_id && !o.cavalo_id && !o.motorista_nome_temp && !o.cavalo_placa_temp)
  );

  const todasSelecionadas = ordensSelecionadas.length === ofertas.length && ofertas.length > 0;

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
        className="h-9 text-sm"
        disabled={ofertas.length === 0}
        title={ofertas.length === 0 ? "Nenhuma oferta disponível" : `Exportar ${ofertas.length} ofertas`}
      >
        <FileDown className="w-4 h-4 mr-2" />
        Exportar Ofertas
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Exportar Ofertas de Carga</DialogTitle>
          </DialogHeader>
          
          <div className="py-4">
            <div className="mb-4">
              <Label className="text-sm font-semibold mb-2 block">Selecione as Ofertas para Exportar</Label>
              <div className="flex items-center gap-2 mb-3 pb-3 border-b">
                <Checkbox 
                  checked={todasSelecionadas}
                  onCheckedChange={toggleTodas}
                  id="todas"
                />
                <Label htmlFor="todas" className="font-medium cursor-pointer">
                  Selecionar todas ({ofertas.length})
                </Label>
              </div>
              
              <div className="max-h-60 overflow-y-auto border rounded-lg p-3 space-y-2">
                {ofertas.map((ordem) => (
                  <div key={ordem.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded">
                    <Checkbox 
                      checked={ordensSelecionadas.includes(ordem.id)}
                      onCheckedChange={() => toggleOrdem(ordem.id)}
                      id={`ordem-${ordem.id}`}
                    />
                    <Label htmlFor={`ordem-${ordem.id}`} className="flex-1 cursor-pointer text-sm">
                      <span className="font-semibold text-blue-600">{ordem.numero_carga || '#' + ordem.id.slice(-6)}</span>
                      {' - '}
                      <span className="font-medium">{ordem.origem_cidade || ordem.origem} → {ordem.destino_cidade || ordem.destino}</span>
                      {' - '}
                      <span className="text-gray-600">{ordem.peso ? `${(ordem.peso/1000).toFixed(2)}t` : ''}</span>
                    </Label>
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {ordensSelecionadas.length} de {ofertas.length} ofertas selecionadas
              </p>
            </div>

            <div className="space-y-3 mb-4">
              <div>
                <Label className="text-sm font-semibold mb-2">Formato de Exportação</Label>
                <Select value={formatoExportacao} onValueChange={setFormatoExportacao}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pdf">
                      <div className="flex items-center gap-2">
                        <FileDown className="w-4 h-4" />
                        PDF (Imprimir)
                      </div>
                    </SelectItem>
                    <SelectItem value="imagem">
                      <div className="flex items-center gap-2">
                        <ImageIcon className="w-4 h-4" />
                        Imagem (Alta Qualidade)
                      </div>
                    </SelectItem>
                    <SelectItem value="link">
                      <div className="flex items-center gap-2">
                        <LinkIcon className="w-4 h-4" />
                        Link Público (Compartilhar)
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Label className="text-sm font-semibold">Número(s) de WhatsApp para Contato *</Label>
              <p className="text-xs text-gray-500">Adicione os números que aparecerão para negociação</p>
              
              {numerosWhatsApp.map((numero, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    type="tel"
                    placeholder="(00) 00000-0000"
                    value={numero}
                    onChange={(e) => atualizarNumeroWhatsApp(index, e.target.value)}
                    className="flex-1"
                  />
                  {numerosWhatsApp.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removerNumeroWhatsApp(index)}
                      className="h-10 w-10"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
              
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={adicionarNumeroWhatsApp}
                className="w-full"
              >
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Número
              </Button>
            </div>

            {linkPublico && formatoExportacao === "link" && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <Label className="text-sm font-semibold text-green-800 mb-2 block">Link Público Gerado:</Label>
                <div className="flex gap-2">
                  <Input 
                    value={linkPublico} 
                    readOnly 
                    className="flex-1 text-xs bg-white"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      navigator.clipboard.writeText(linkPublico);
                      toast.success("Link copiado!");
                    }}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-xs text-green-700 mt-2">
                  Compartilhe este link para divulgar as ofertas selecionadas publicamente.
                </p>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)} disabled={gerando}>
              Cancelar
            </Button>
            {formatoExportacao === "link" ? (
              <Button onClick={gerarLinkPublico} disabled={gerando || ordensSelecionadas.length === 0} className="bg-green-600 hover:bg-green-700">
                <LinkIcon className="w-4 h-4 mr-2" />
                Gerar Link Público
              </Button>
            ) : (
              <Button onClick={gerarConteudo} disabled={gerando || ordensSelecionadas.length === 0} className="bg-blue-600 hover:bg-blue-700">
                {gerando ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Gerando...
                  </>
                ) : (
                  <>
                    {formatoExportacao === "imagem" ? <ImageIcon className="w-4 h-4 mr-2" /> : <FileDown className="w-4 h-4 mr-2" />}
                    Gerar {formatoExportacao === "imagem" ? "Imagem" : "PDF"}
                  </>
                )}
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
