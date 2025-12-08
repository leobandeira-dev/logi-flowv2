import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  MapPin,
  Package,
  Calendar,
  FileText,
  Edit
} from "lucide-react";
import { format, isValid } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function ViagemDetalhes({ open, onClose, viagem, onAtualizarStatus }) {
  const formatDateTime = (dateString) => {
    if (!dateString) return "-";
    try {
      const date = new Date(dateString);
      if (!isValid(date)) return "-";
      return format(date, "dd/MM/yyyy HH:mm", { locale: ptBR });
    } catch {
      return "-";
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    try {
      const date = new Date(dateString);
      if (!isValid(date)) return "-";
      return format(date, "dd/MM/yyyy", { locale: ptBR });
    } catch {
      return "-";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <DialogTitle className="flex items-center gap-2">
              <Package className="w-5 h-5 text-blue-600" />
              Detalhes da Viagem
            </DialogTitle>
            {onAtualizarStatus && (
              <Button
                onClick={onAtualizarStatus}
                size="sm"
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Edit className="w-4 h-4 mr-2" />
                Atualizar Status
              </Button>
            )}
          </div>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Cabeçalho */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-bold text-lg">{viagem.numero_carga || `#${viagem.id.slice(-6)}`}</h3>
                  <p className="text-sm text-gray-600">{viagem.cliente}</p>
                </div>
                <Badge className="bg-blue-600 text-white">
                  {viagem.status_tracking?.replace(/_/g, ' ').toUpperCase()}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Rota */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <MapPin className="w-5 h-5 text-gray-600" />
                <h4 className="font-semibold">Rota</h4>
              </div>
              <div className="space-y-2">
                <div>
                  <p className="text-sm text-gray-600">Origem</p>
                  <p className="font-medium">{viagem.origem}</p>
                  {viagem.origem_endereco && (
                    <p className="text-sm text-gray-500">{viagem.origem_endereco}</p>
                  )}
                </div>
                <div className="border-l-2 border-gray-300 h-6 ml-2"></div>
                <div>
                  <p className="text-sm text-gray-600">Destino</p>
                  <p className="font-medium">{viagem.destino}</p>
                  {viagem.destino_endereco && (
                    <p className="text-sm text-gray-500">{viagem.destino_endereco}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Carga */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <Package className="w-5 h-5 text-gray-600" />
                <h4 className="font-semibold">Informações da Carga</h4>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-sm text-gray-600">Produto</p>
                  <p className="font-medium">{viagem.produto}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Peso</p>
                  <p className="font-medium">{viagem.peso?.toLocaleString()} kg</p>
                </div>
                {viagem.volumes && (
                  <div>
                    <p className="text-sm text-gray-600">Volumes</p>
                    <p className="font-medium">{viagem.volumes}</p>
                  </div>
                )}
                {viagem.asn && (
                  <div>
                    <p className="text-sm text-gray-600">ASN</p>
                    <p className="font-medium">{viagem.asn}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Datas */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <Calendar className="w-5 h-5 text-gray-600" />
                <h4 className="font-semibold">Datas Importantes</h4>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Carregamento Previsto</span>
                  <span className="font-medium">{formatDate(viagem.data_carregamento)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Entrega Prevista</span>
                  <span className="font-medium">{formatDate(viagem.data_programacao_descarga)}</span>
                </div>
                {viagem.inicio_carregamento && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Início do Carregamento</span>
                    <span className="font-medium">{formatDateTime(viagem.inicio_carregamento)}</span>
                  </div>
                )}
                {viagem.saida_unidade && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Saída da Unidade</span>
                    <span className="font-medium">{formatDateTime(viagem.saida_unidade)}</span>
                  </div>
                )}
                {viagem.chegada_destino && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Chegada no Destino</span>
                    <span className="font-medium">{formatDateTime(viagem.chegada_destino)}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Localização */}
          {viagem.localizacao_atual && (
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <MapPin className="w-5 h-5 text-blue-600" />
                  <h4 className="font-semibold">Localização Atual</h4>
                </div>
                <p className="text-gray-700">{viagem.localizacao_atual}</p>
                {viagem.km_faltam && (
                  <p className="text-sm text-gray-600 mt-2">
                    Faltam aproximadamente {viagem.km_faltam} km para o destino
                  </p>
                )}
              </CardContent>
            </Card>
          )}

          {/* Observações */}
          {viagem.observacao_carga && (
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <FileText className="w-5 h-5 text-gray-600" />
                  <h4 className="font-semibold">Observações</h4>
                </div>
                <p className="text-gray-700 whitespace-pre-wrap">{viagem.observacao_carga}</p>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="flex gap-2">
          <Button onClick={onClose} variant="outline" className="flex-1">
            Fechar
          </Button>
          {onAtualizarStatus && (
            <Button
              onClick={onAtualizarStatus}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              <Edit className="w-4 h-4 mr-2" />
              Atualizar Status
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}