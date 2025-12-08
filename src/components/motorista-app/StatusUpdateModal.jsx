
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Calendar,
  Package,
  CheckCircle2,
  Truck,
  MapPin,
  AlertTriangle,
  Loader2,
  Lock,
  X
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";

const acoesRapidas = [
  {
    id: "agendar_carregamento",
    label: "Agendar Carregamento",
    icon: Calendar,
    status: "carregamento_agendado",
    field: "carregamento_agendamento_data",
    color: "bg-blue-500 hover:bg-blue-600",
    checkField: "carregamento_agendamento_data"
  },
  {
    id: "agendar_descarga",
    label: "Agendar Descarga",
    icon: Calendar,
    status: "descarga_agendada",
    field: "descarga_agendamento_data",
    color: "bg-indigo-500 hover:bg-indigo-600",
    checkField: "descarga_agendamento_data"
  },
  {
    id: "iniciar_carregamento",
    label: "Iniciar Carregamento",
    icon: Package,
    status: "em_carregamento",
    field: "inicio_carregamento",
    color: "bg-yellow-500 hover:bg-yellow-600",
    checkField: "inicio_carregamento"
  },
  {
    id: "finalizar_carregamento",
    label: "Finalizar Carregamento",
    icon: CheckCircle2,
    status: "carregado",
    field: "fim_carregamento",
    color: "bg-green-500 hover:bg-green-600",
    checkField: "fim_carregamento"
  },
  {
    id: "iniciar_viagem",
    label: "Iniciar Viagem",
    icon: Truck,
    status: "em_viagem",
    field: "saida_unidade",
    color: "bg-purple-500 hover:bg-purple-600",
    checkField: "saida_unidade"
  },
  {
    id: "chegou_destino",
    label: "Chegou no Destino",
    icon: MapPin,
    status: "chegada_destino",
    field: "chegada_destino",
    color: "bg-indigo-500 hover:bg-indigo-600",
    checkField: "chegada_destino"
  },
  {
    id: "finalizar",
    label: "Finalizar",
    icon: CheckCircle2,
    status: "finalizado",
    field: "descarga_realizada_data",
    color: "bg-gray-600 hover:bg-gray-700",
    checkField: "descarga_realizada_data"
  }
];

export default function StatusUpdateModal({ open, onClose, viagem, onUpdate }) {
  const [saving, setSaving] = useState(false);
  const [location, setLocation] = useState(null);
  const [showOcorrencia, setShowOcorrencia] = useState(false);
  const [ocorrenciaData, setOcorrenciaData] = useState({
    tipo: "",
    descricao: "",
    foto: null
  });

  const getLocation = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocalização não suportada"));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        },
        (error) => {
          reject(error);
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0
        }
      );
    });
  };

  const getAddressFromCoordinates = async (lat, lon) => {
    try {
      // Usar API de geocoding reverso do OpenStreetMap via proxy
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'LogFlow-App/1.0'
          }
        }
      );
      const data = await response.json();
      
      if (data && data.display_name) {
        return data.display_name;
      }
      return `GPS: ${lat.toFixed(6)}, ${lon.toFixed(6)}`;
    } catch (error) {
      console.warn("Erro ao buscar endereço:", error);
      return `GPS: ${lat.toFixed(6)}, ${lon.toFixed(6)}`;
    }
  };

  // Função para calcular distância entre dois pontos (Haversine)
  const calcularDistancia = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Raio da Terra em km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distancia = R * c;
    return Math.round(distancia);
  };

  // Função para obter coordenadas de um endereço
  const obterCoordenadasDestino = async () => {
    try {
      const enderecoDestino = viagem.destino_endereco || 
                             `${viagem.destino_cidade || viagem.destino}, ${viagem.destino_uf || ''}`;
      
      if (!enderecoDestino || enderecoDestino.trim() === "," || enderecoDestino.trim() === "") {
        return null;
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
      
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(enderecoDestino)}&limit=1`,
        {
          signal: controller.signal,
          headers: {
            'User-Agent': 'LogFlow-App/1.0'
          }
        }
      );
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data && data.length > 0) {
        return {
          latitude: parseFloat(data[0].lat),
          longitude: parseFloat(data[0].lon)
        };
      }
      return null;
    } catch (error) {
      if (error.name === 'AbortError') {
        console.warn("Timeout ao buscar coordenadas do destino");
      } else {
        console.warn("Erro ao obter coordenadas do destino:", error);
      }
      return null;
    }
  };

  const handleAcaoRapida = async (acao) => {
    setSaving(true);
    try {
      // Tentar obter localização
      let loc = null;
      let endereco = null;
      let kmRestantes = null;
      
      try {
        loc = await getLocation();
        setLocation(loc);
        
        // Buscar endereço das coordenadas
        endereco = await getAddressFromCoordinates(loc.latitude, loc.longitude);
        
        // Calcular distância até o destino (não crítico, pode falhar)
        try {
          const coordsDestino = await obterCoordenadasDestino();
          if (coordsDestino) {
            kmRestantes = calcularDistancia(
              loc.latitude,
              loc.longitude,
              coordsDestino.latitude,
              coordsDestino.longitude
            );
          }
        } catch (distError) {
          console.warn("Não foi possível calcular distância:", distError);
          // Continue mesmo sem distância
        }
      } catch (error) {
        console.warn("Não foi possível obter localização:", error);
        // Continue sem localização
      }

      const now = new Date().toISOString();
      const dataToSave = {
        status_tracking: acao.status,
        [acao.field]: now
      };

      // Se temos localização, salvar o endereço e distância
      if (endereco) {
        dataToSave.localizacao_atual = endereco;
      }
      
      if (kmRestantes !== null) {
        dataToSave.km_faltam = kmRestantes;
      }

      await base44.entities.OrdemDeCarregamento.update(viagem.id, dataToSave);

      if (kmRestantes !== null) {
        toast.success(`${acao.label} registrado! Faltam ${kmRestantes} km até o destino.`);
      } else {
        toast.success(`${acao.label} registrado com sucesso!`);
      }
      
      onUpdate();
    } catch (error) {
      console.error("Erro ao atualizar status:", error);
      toast.error("Erro ao atualizar status");
    } finally {
      setSaving(false);
    }
  };

  const handleRegistrarOcorrencia = async () => {
    if (!ocorrenciaData.tipo || !ocorrenciaData.descricao) {
      toast.error("Preencha o tipo e a descrição da ocorrência");
      return;
    }

    setSaving(true);
    try {
      const user = await base44.auth.me();
      
      // Tentar obter localização
      let loc = null;
      let endereco = null;
      
      try {
        loc = await getLocation();
        endereco = await getAddressFromCoordinates(loc.latitude, loc.longitude);
      } catch (error) {
        console.warn("Não foi possível obter localização:", error);
      }

      await base44.entities.Ocorrencia.create({
        ordem_id: viagem.id,
        tipo: ocorrenciaData.tipo,
        descricao_tipo: ocorrenciaData.tipo,
        data_inicio: new Date().toISOString(),
        observacoes: ocorrenciaData.descricao,
        status: "aberta",
        localizacao: endereco || "",
        gravidade: "media",
        registrado_por: user.id
      });

      toast.success("Ocorrência registrada com sucesso!");
      setShowOcorrencia(false);
      setOcorrenciaData({ tipo: "", descricao: "", foto: null });
      onUpdate();
    } catch (error) {
      console.error("Erro ao registrar ocorrência:", error);
      toast.error("Erro ao registrar ocorrência");
    } finally {
      setSaving(false);
    }
  };

  const isViagemFinalizada = () => {
    return viagem.status_tracking === "finalizado";
  };

  const isAcaoDesabilitada = (acao) => {
    // Se a viagem está finalizada, bloquear todas as ações
    if (isViagemFinalizada()) {
      return true;
    }

    // Verificar se a ação tem um campo a ser checado e se já foi preenchido
    if (acao.checkField && viagem[acao.checkField]) {
      return true; // Já foi preenchido, desabilitar
    }
    
    return false;
  };

  const getMensagemBloqueio = (acao) => {
    if (isViagemFinalizada()) {
      return "Viagem finalizada";
    }
    
    if (acao.checkField && viagem[acao.checkField]) {
      return "Já registrado";
    }
    
    return "";
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <Truck className="w-5 h-5 text-blue-600" />
              Atualizar Status - {viagem.numero_carga || `#${viagem.id.slice(-6)}`}
            </DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8 rounded-full hover:bg-gray-100"
            >
              <X className="w-5 h-5 text-gray-500" />
            </Button>
          </div>
        </DialogHeader>

        {!showOcorrencia ? (
          <>
            <div className="space-y-3 py-4">
              {isViagemFinalizada() && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-4">
                  <div className="flex items-center gap-2">
                    <Lock className="w-4 h-4 text-gray-600" />
                    <p className="text-sm text-gray-700 font-medium">
                      Viagem finalizada - não é possível registrar novas ações
                    </p>
                  </div>
                </div>
              )}

              <p className="text-sm text-gray-600 mb-4">
                Selecione uma ação para atualizar o status da viagem. A data, hora e localização serão registradas automaticamente.
              </p>

              {acoesRapidas.map((acao) => {
                const desabilitado = isAcaoDesabilitada(acao);
                const mensagem = getMensagemBloqueio(acao);
                
                return (
                  <Button
                    key={acao.id}
                    onClick={() => handleAcaoRapida(acao)}
                    disabled={saving || desabilitado}
                    className={`w-full justify-start h-14 text-left ${
                      desabilitado 
                        ? 'bg-gray-300 hover:bg-gray-300 cursor-not-allowed opacity-60' 
                        : acao.color
                    } text-white relative`}
                  >
                    <acao.icon className="w-5 h-5 mr-3 flex-shrink-0" />
                    <span className="text-base font-medium">{acao.label}</span>
                    {desabilitado && (
                      <div className="ml-auto flex items-center gap-1">
                        <Lock className="w-4 h-4" />
                        <span className="text-xs">{mensagem}</span>
                      </div>
                    )}
                    {saving && !desabilitado && <Loader2 className="w-4 h-4 ml-auto animate-spin" />}
                  </Button>
                );
              })}

              <Button
                onClick={() => setShowOcorrencia(true)}
                variant="outline"
                disabled={isViagemFinalizada()}
                className="w-full justify-start h-14 text-left border-2 border-orange-300 hover:bg-orange-50 text-orange-700"
              >
                <AlertTriangle className="w-5 h-5 mr-3 flex-shrink-0" />
                <span className="text-base font-medium">Registrar Ocorrência</span>
                {isViagemFinalizada() && (
                  <div className="ml-auto flex items-center gap-1">
                    <Lock className="w-4 h-4" />
                    <span className="text-xs">Viagem finalizada</span>
                  </div>
                )}
              </Button>
            </div>

            {location && (
              <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium text-green-900">
                    Localização capturada com sucesso
                  </span>
                </div>
                <p className="text-xs text-green-700 mt-1">
                  {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
                </p>
              </div>
            )}

            <div className="flex justify-end pt-4 border-t">
              <Button
                onClick={onClose}
                variant="outline"
                className="w-full"
              >
                Fechar
              </Button>
            </div>
          </>
        ) : (
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="ocorrencia-tipo">Tipo de Ocorrência *</Label>
              <select
                id="ocorrencia-tipo"
                value={ocorrenciaData.tipo}
                onChange={(e) => setOcorrenciaData({ ...ocorrenciaData, tipo: e.target.value })}
                className="w-full p-2 border rounded-lg mt-1"
              >
                <option value="">Selecione...</option>
                <option value="pneu_furado">Pneu Furado</option>
                <option value="problema_mecanico">Problema Mecânico</option>
                <option value="acidente">Acidente</option>
                <option value="atraso_origem">Atraso na Origem</option>
                <option value="atraso_destino">Atraso no Destino</option>
                <option value="avaria_carga">Avaria na Carga</option>
                <option value="fiscalizacao">Fiscalização</option>
                <option value="condicoes_climaticas">Condições Climáticas</option>
                <option value="outro">Outro</option>
              </select>
            </div>

            <div>
              <Label htmlFor="ocorrencia-descricao">Descrição *</Label>
              <Textarea
                id="ocorrencia-descricao"
                value={ocorrenciaData.descricao}
                onChange={(e) => setOcorrenciaData({ ...ocorrenciaData, descricao: e.target.value })}
                placeholder="Descreva o que aconteceu..."
                rows={4}
                className="mt-1"
              />
            </div>

            <div className="flex gap-2">
              <Button
                onClick={() => setShowOcorrencia(false)}
                variant="outline"
                className="flex-1"
                disabled={saving}
              >
                Voltar
              </Button>
              <Button
                onClick={handleRegistrarOcorrencia}
                className="flex-1 bg-orange-600 hover:bg-orange-700"
                disabled={saving}
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Registrando...
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-4 h-4 mr-2" />
                    Registrar
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
