import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { FileText, Download, User, Truck, AlertCircle, MapPin } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { base44 } from '@/api/base44Client';

export default function DownloadDocumentosOrdem({ open, onClose, ordem }) {
  const [motorista, setMotorista] = useState(null);
  const [veiculos, setVeiculos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (open && ordem) {
      loadDocumentos();
    }
  }, [open, ordem]);

  const loadDocumentos = async () => {
    setLoading(true);
    try {
      const promises = [];

      if (ordem.motorista_id) {
        promises.push(
          base44.entities.Motorista.filter({ id: ordem.motorista_id }, null, 1)
            .then(data => data[0])
        );
      } else {
        promises.push(Promise.resolve(null));
      }

      const veiculoIds = [
        ordem.cavalo_id,
        ordem.implemento1_id,
        ordem.implemento2_id,
        ordem.implemento3_id
      ].filter(Boolean);

      if (veiculoIds.length > 0) {
        promises.push(
          base44.entities.Veiculo.list().then(allVeiculos => 
            allVeiculos.filter(v => veiculoIds.includes(v.id))
          )
        );
      } else {
        promises.push(Promise.resolve([]));
      }

      const [motoristaData, veiculosData] = await Promise.all(promises);
      
      setMotorista(motoristaData);
      setVeiculos(veiculosData);
    } catch (error) {
      console.error('Erro ao carregar documentos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (url, filename) => {
    if (!url) return;
    window.open(url, '_blank');
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            Documentos da Ordem {ordem?.numero_carga}
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="py-12 text-center">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm text-gray-600">Carregando documentos...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {motorista && (
              <Card className="border-2 border-blue-200">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-bold text-sm">{motorista.nome}</h3>
                        <p className="text-xs text-gray-600">CPF: {motorista.cpf}</p>
                      </div>
                    </div>
                    <Badge className="bg-blue-600 text-white">Motorista</Badge>
                  </div>

                  <div className="space-y-2">
                    {motorista.cnh_documento_url ? (
                      <Button
                        onClick={() => handleDownload(motorista.cnh_documento_url, `CNH_${motorista.nome}.pdf`)}
                        className="w-full bg-blue-600 hover:bg-blue-700"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Baixar CNH
                      </Button>
                    ) : (
                      <div className="flex items-center justify-center gap-2 py-3 px-4 bg-yellow-50 border border-yellow-200 rounded">
                        <AlertCircle className="w-4 h-4 text-yellow-600" />
                        <p className="text-xs text-yellow-800">CNH não disponível</p>
                      </div>
                    )}

                    {motorista.comprovante_endereco_url ? (
                      <Button
                        onClick={() => handleDownload(motorista.comprovante_endereco_url, `Comprovante_${motorista.nome}.pdf`)}
                        variant="outline"
                        className="w-full border-green-600 text-green-700 hover:bg-green-50"
                      >
                        <MapPin className="w-4 h-4 mr-2" />
                        Baixar Comprovante de Endereço
                      </Button>
                    ) : (
                      <div className="flex items-center justify-center gap-2 py-3 px-4 bg-yellow-50 border border-yellow-200 rounded">
                        <AlertCircle className="w-4 h-4 text-yellow-600" />
                        <p className="text-xs text-yellow-800">Comprovante de endereço não disponível</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {veiculos.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-semibold text-sm text-gray-700">Veículos</h4>
                {veiculos.map((veiculo, idx) => (
                  <Card key={veiculo.id} className="border-2 border-green-200">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                            <Truck className="w-4 h-4 text-green-600" />
                          </div>
                          <div>
                            <h3 className="font-bold text-sm font-mono">{veiculo.placa}</h3>
                            <p className="text-xs text-gray-600">{veiculo.marca} {veiculo.modelo}</p>
                          </div>
                        </div>
                        <Badge className="bg-green-600 text-white text-xs">
                          {idx === 0 ? 'Cavalo' : `Implemento ${idx}`}
                        </Badge>
                      </div>

                      {veiculo.crlv_documento_url ? (
                        <Button
                          onClick={() => handleDownload(veiculo.crlv_documento_url, `CRLV_${veiculo.placa}.pdf`)}
                          variant="outline"
                          className="w-full border-green-600 text-green-700 hover:bg-green-50"
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Baixar CRLV
                        </Button>
                      ) : (
                        <div className="flex items-center justify-center gap-2 py-3 px-4 bg-yellow-50 border border-yellow-200 rounded">
                          <AlertCircle className="w-4 h-4 text-yellow-600" />
                          <p className="text-xs text-yellow-800">CRLV não disponível</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {!motorista && veiculos.length === 0 && (
              <div className="py-12 text-center">
                <AlertCircle className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                <p className="text-sm text-gray-600">Nenhum documento disponível</p>
                <p className="text-xs text-gray-500 mt-1">
                  Vincule motorista e veículos para acessar documentos
                </p>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}