import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Image as ImageIcon, Loader2, Plus, X } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";
import { base44 } from "@/api/base44Client";

export default function ExportarOfertaIndividual({ ordem }) {
  const [open, setOpen] = useState(false);
  const [gerando, setGerando] = useState(false);
  const [empresa, setEmpresa] = useState(null);
  const [numerosWhatsApp, setNumerosWhatsApp] = useState([""]);

  useEffect(() => {
    if (open) {
      loadEmpresa();
    }
  }, [open]);

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

  const gerarImagem = async () => {
    const numerosValidos = numerosWhatsApp.filter(n => n.trim() !== "");
    
    if (numerosValidos.length === 0) {
      toast.error("Informe pelo menos um número de WhatsApp");
      return;
    }

    setGerando(true);
    try {
      const dataAtual = format(new Date(), "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
      const horaAtual = format(new Date(), "HH:mm", { locale: ptBR });

      const modalidadeLabel = 
        ordem.modalidade_carga === 'expressa' ? 'Expressa' :
        ordem.modalidade_carga === 'prioridade' ? 'Prioridade' :
        'Normal';

      const peso = ordem.peso ? `${(ordem.peso / 1000).toFixed(2)}t` : '-';
      const frete = ordem.frete_viagem || ordem.valor_total_frete;
      const freteFormatado = frete ? 
        new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(frete) : 
        '-';

      const dataCarregamento = ordem.carregamento_agendamento_data ? 
        format(new Date(ordem.carregamento_agendamento_data), "dd/MM/yyyy HH:mm", { locale: ptBR }) : 
        '-';

      const mensagemWhatsApp = encodeURIComponent(
        `🚚 *Interesse em Carga Disponível*\n\n` +
        `*Ordem:* ${ordem.numero_carga || '#' + ordem.id.slice(-6)}\n` +
        `*Rota:* ${ordem.origem_cidade || ordem.origem || '-'} → ${ordem.destino_cidade || ordem.destino || '-'}\n` +
        `*Tipo Veículo:* ${ordem.tipo_veiculo || '-'}\n` +
        `*Peso:* ${peso}\n` +
        `*Frete:* ${freteFormatado}\n` +
        `*Carregamento:* ${dataCarregamento}\n\n` +
        `Gostaria de mais informações sobre esta carga.`
      );

      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              padding: 40px;
              min-height: 100vh;
              display: flex;
              align-items: center;
              justify-content: center;
            }
            .card {
              background: white;
              border-radius: 20px;
              box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
              max-width: 800px;
              width: 100%;
              overflow: hidden;
            }
            .header {
              background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
              color: white;
              padding: 40px;
              text-align: center;
            }
            .header h1 {
              font-size: 32pt;
              margin-bottom: 10px;
              font-weight: 700;
              text-shadow: 0 2px 4px rgba(0,0,0,0.2);
            }
            .header .date {
              font-size: 16pt;
              font-weight: 600;
              opacity: 0.95;
            }
            ${empresa ? `
              .empresa-info {
                background: rgba(255,255,255,0.1);
                padding: 20px;
                margin-top: 20px;
                border-radius: 10px;
                backdrop-filter: blur(10px);
              }
              .empresa-info h2 {
                font-size: 20pt;
                margin-bottom: 10px;
              }
              .empresa-details {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 10px;
                font-size: 10pt;
              }
            ` : ''}
            .content {
              padding: 40px;
            }
            .oferta-numero {
              background: linear-gradient(135deg, #3b82f6, #2563eb);
              color: white;
              padding: 20px;
              border-radius: 15px;
              text-align: center;
              margin-bottom: 30px;
              font-size: 28pt;
              font-weight: 700;
              box-shadow: 0 4px 15px rgba(59, 130, 246, 0.4);
            }
            .info-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 20px;
              margin-bottom: 30px;
            }
            .info-item {
              background: linear-gradient(135deg, #f9fafb, #f3f4f6);
              padding: 20px;
              border-radius: 12px;
              border-left: 4px solid #3b82f6;
            }
            .info-label {
              font-size: 11pt;
              color: #6b7280;
              margin-bottom: 8px;
              font-weight: 600;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            .info-value {
              font-size: 16pt;
              color: #1f2937;
              font-weight: 700;
            }
            .rota-destaque {
              background: linear-gradient(135deg, #dbeafe, #bfdbfe);
              padding: 25px;
              border-radius: 15px;
              text-align: center;
              margin-bottom: 25px;
              border: 2px solid #3b82f6;
            }
            .rota-destaque .label {
              font-size: 12pt;
              color: #1e40af;
              margin-bottom: 10px;
              font-weight: 600;
            }
            .rota-destaque .value {
              font-size: 22pt;
              color: #1e3a8a;
              font-weight: 700;
            }
            .frete-destaque {
              background: linear-gradient(135deg, #d1fae5, #a7f3d0);
              padding: 25px;
              border-radius: 15px;
              text-align: center;
              margin: 25px 0;
              border: 2px solid #10b981;
            }
            .frete-destaque .label {
              font-size: 12pt;
              color: #065f46;
              margin-bottom: 10px;
              font-weight: 600;
            }
            .frete-destaque .value {
              font-size: 28pt;
              color: #047857;
              font-weight: 700;
            }
            .observacoes {
              background: #fef3c7;
              padding: 20px;
              border-radius: 12px;
              border-left: 4px solid #f59e0b;
              margin-bottom: 25px;
            }
            .observacoes .label {
              font-size: 11pt;
              color: #92400e;
              margin-bottom: 10px;
              font-weight: 600;
            }
            .observacoes .value {
              font-size: 12pt;
              color: #78350f;
              font-style: italic;
            }
            .whatsapp-section {
              background: linear-gradient(135deg, #dcfce7, #bbf7d0);
              padding: 30px;
              border-radius: 15px;
              text-align: center;
              margin-top: 30px;
            }
            .whatsapp-section h3 {
              font-size: 18pt;
              color: #166534;
              margin-bottom: 20px;
              font-weight: 700;
            }
            .whatsapp-buttons {
              display: flex;
              flex-direction: column;
              gap: 15px;
              align-items: center;
            }
            .whatsapp-btn {
              background: #25D366;
              color: white;
              padding: 15px 30px;
              border-radius: 50px;
              text-decoration: none;
              font-size: 14pt;
              font-weight: 700;
              display: inline-flex;
              align-items: center;
              gap: 12px;
              transition: all 0.3s;
              box-shadow: 0 4px 15px rgba(37, 211, 102, 0.4);
              min-width: 250px;
              justify-content: center;
            }
            .whatsapp-btn:hover {
              background: #128C7E;
              transform: translateY(-2px);
              box-shadow: 0 6px 20px rgba(37, 211, 102, 0.6);
            }
            .whatsapp-icon {
              width: 24px;
              height: 24px;
            }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="header">
              <h1>🚚 OFERTA DE CARGA</h1>
              <div class="date">${dataAtual}</div>
              ${empresa ? `
                <div class="empresa-info">
                  <h2>${empresa.nome_fantasia || empresa.razao_social}</h2>
                  <div class="empresa-details">
                    ${empresa.telefone ? `<div>📞 ${empresa.telefone}</div>` : ''}
                    ${empresa.email ? `<div>📧 ${empresa.email}</div>` : ''}
                    ${empresa.cidade ? `<div>📍 ${empresa.cidade} - ${empresa.estado || ''}</div>` : ''}
                  </div>
                </div>
              ` : ''}
            </div>
            
            <div class="content">
              <div class="oferta-numero">
                Ordem ${ordem.numero_carga || '#' + ordem.id.slice(-6)}
              </div>

              <div class="rota-destaque">
                <div class="label">ROTA</div>
                <div class="value">${ordem.origem_cidade || ordem.origem || '-'} → ${ordem.destino_cidade || ordem.destino || '-'}</div>
              </div>

              <div class="info-grid">
                <div class="info-item">
                  <div class="info-label">Modalidade</div>
                  <div class="info-value">${modalidadeLabel}</div>
                </div>
                <div class="info-item">
                  <div class="info-label">Tipo de Veículo</div>
                  <div class="info-value">${ordem.tipo_veiculo || '-'}</div>
                </div>
                <div class="info-item">
                  <div class="info-label">Peso Total</div>
                  <div class="info-value">${peso}</div>
                </div>
                <div class="info-item">
                  <div class="info-label">Data Carregamento</div>
                  <div class="info-value" style="font-size: 13pt;">${dataCarregamento}</div>
                </div>
              </div>

              <div class="frete-destaque">
                <div class="label">VALOR DO FRETE</div>
                <div class="value">${freteFormatado}</div>
              </div>

              ${ordem.observacao_carga ? `
                <div class="observacoes">
                  <div class="label">OBSERVAÇÕES</div>
                  <div class="value">${ordem.observacao_carga}</div>
                </div>
              ` : ''}

              <div class="whatsapp-section">
                <h3>💬 INTERESSADO? ENTRE EM CONTATO!</h3>
                <div class="whatsapp-buttons">
                  ${numerosValidos.map(numero => {
                    const numeroLimpo = numero.replace(/\D/g, '');
                    return `
                      <a href="https://wa.me/55${numeroLimpo}?text=${mensagemWhatsApp}" 
                         class="whatsapp-btn" 
                         target="_blank">
                        <svg class="whatsapp-icon" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                        </svg>
                        WhatsApp ${numero}
                      </a>
                    `;
                  }).join('')}
                </div>
              </div>
            </div>
          </div>
        </body>
        </html>
      `;

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
        
        toast.success("Oferta individual gerada! Use 'Salvar como PDF' para criar imagem.");
        setOpen(false);
      } else {
        toast.error("Não foi possível abrir a janela. Verifique o bloqueador de pop-ups.");
      }
    } catch (error) {
      console.error("Erro ao gerar imagem:", error);
      toast.error("Erro ao gerar oferta");
    } finally {
      setGerando(false);
    }
  };

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setOpen(true)}
        className="h-6 w-6 p-0 hover:bg-purple-50 dark:hover:bg-purple-950"
        title="Gerar Oferta Individual"
      >
        <ImageIcon className="w-3.5 h-3.5 text-purple-600" />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Gerar Oferta Individual</DialogTitle>
          </DialogHeader>
          
          <div className="py-4">
            <p className="text-sm text-gray-600 mb-4">
              Gere uma imagem bonita e atrativa da oferta <strong>{ordem.numero_carga || '#' + ordem.id.slice(-6)}</strong> para divulgação.
            </p>

            <div className="space-y-3">
              <Label className="text-sm font-semibold">Número(s) de WhatsApp para Contato *</Label>
              
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
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)} disabled={gerando}>
              Cancelar
            </Button>
            <Button onClick={gerarImagem} disabled={gerando} className="bg-purple-600 hover:bg-purple-700">
              {gerando ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Gerando...
                </>
              ) : (
                <>
                  <ImageIcon className="w-4 h-4 mr-2" />
                  Gerar Oferta
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}