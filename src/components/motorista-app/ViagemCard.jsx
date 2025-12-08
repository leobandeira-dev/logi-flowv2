
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  MapPin,
  Calendar,
  Package,
  ChevronRight,
  Edit,
  AlertTriangle,
  ArrowRight,
  Loader2,
  MessageCircle
} from "lucide-react";
import { format, differenceInDays, isValid } from "date-fns";
import { ptBR } from "date-fns/locale";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";

const statusTrackingConfig = {
  aguardando_agendamento: {
    label: "Aguardando",
    color: "bg-gray-500 text-white",
    proximaEtapa: "carregamento_agendado",
    proximaLabel: "Agendar Carregamento",
    field: "carregamento_agendamento_data"
  },
  carregamento_agendado: {
    label: "Agendado",
    color: "bg-blue-500 text-white",
    proximaEtapa: "em_carregamento",
    proximaLabel: "Iniciar Carregamento",
    field: "inicio_carregamento"
  },
  em_carregamento: {
    label: "Carregando",
    color: "bg-yellow-500 text-white",
    proximaEtapa: "carregado",
    proximaLabel: "Finalizar Carregamento",
    field: "fim_carregamento"
  },
  carregado: {
    label: "Carregado",
    color: "bg-green-500 text-white",
    proximaEtapa: "em_viagem",
    proximaLabel: "Iniciar Viagem",
    field: "saida_unidade"
  },
  em_viagem: {
    label: "Em Viagem",
    color: "bg-purple-500 text-white",
    proximaEtapa: "chegada_destino",
    proximaLabel: "Registrar Chegada",
    field: "chegada_destino"
  },
  chegada_destino: {
    label: "No Destino",
    color: "bg-indigo-500 text-white",
    proximaEtapa: "descarga_agendada",
    proximaLabel: "Agendar Descarga",
    field: "descarga_agendamento_data"
  },
  descarga_agendada: {
    label: "Descarga Agendada",
    color: "bg-blue-600 text-white",
    proximaEtapa: "em_descarga",
    proximaLabel: "Iniciar Descarga",
    field: "inicio_descarregamento"
  },
  em_descarga: {
    label: "Descarregando",
    color: "bg-orange-500 text-white",
    proximaEtapa: "descarga_realizada",
    proximaLabel: "Finalizar Descarga",
    field: "fim_descarregamento"
  },
  descarga_realizada: {
    label: "Descarregado",
    color: "bg-green-600 text-white",
    proximaEtapa: "finalizado",
    proximaLabel: "Finalizar Viagem",
    field: "descarga_realizada_data"
  },
  finalizado: {
    label: "Finalizado",
    color: "bg-gray-600 text-white",
    proximaEtapa: null,
    proximaLabel: null,
    field: null
  }
};

export default function ViagemCard({ viagem, onAtualizarStatus, onVerDetalhes, isHistorico = false, onUpdate, onAbrirChat, onAbrirUpload }) {
  const [executingAction, setExecutingAction] = React.useState(false);
  const [isDark, setIsDark] = React.useState(false);
  const statusConfig = statusTrackingConfig[viagem.status_tracking] || statusTrackingConfig.aguardando_agendamento;

  // Detect dark mode
  React.useEffect(() => {
    const checkDarkMode = () => {
      setIsDark(document.documentElement.classList.contains('dark'));
    };
    checkDarkMode();
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

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
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`
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

  const handleExecutarProximaEtapa = async () => {
    if (!statusConfig.proximaEtapa || !statusConfig.field) return;

    setExecutingAction(true);
    try {
      // Tentar obter localização
      let endereco = null;

      try {
        const loc = await getLocation();
        endereco = await getAddressFromCoordinates(loc.latitude, loc.longitude);
      } catch (error) {
        console.warn("Não foi possível obter localização:", error);
      }

      const now = new Date().toISOString();
      const dataToSave = {
        status_tracking: statusConfig.proximaEtapa,
        [statusConfig.field]: now
      };

      // Se temos localização, salvar o endereço
      if (endereco) {
        dataToSave.localizacao_atual = endereco;
      }

      await base44.entities.OrdemDeCarregamento.update(viagem.id, dataToSave);

      toast.success(`${statusConfig.proximaLabel} registrado com sucesso!`);

      // Chamar onUpdate se disponível
      if (onUpdate) {
        onUpdate();
      }
    } catch (error) {
      console.error("Erro ao atualizar status:", error);
      toast.error("Erro ao atualizar status");
    } finally {
      setExecutingAction(false);
    }
  };

  const calcularTempoRestante = (dataAgendamento) => {
    if (!dataAgendamento) return null;

    try {
      const agora = new Date();
      const dataAgendada = new Date(dataAgendamento);

      if (!isValid(dataAgendada)) return null;

      const diffMs = dataAgendada - agora;
      const atrasado = diffMs < 0;

      const diffAbsMs = Math.abs(diffMs);
      const dias = Math.floor(diffAbsMs / (1000 * 60 * 60 * 24));
      const horas = Math.floor((diffAbsMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutos = Math.floor((diffAbsMs % (1000 * 60 * 60)) / (1000 * 60));

      let texto = "";
      if (dias > 0) {
        texto = `${dias}d ${horas}h`;
      } else if (horas > 0) {
        texto = `${horas}h ${minutos}m`;
      } else {
        texto = `${minutos}m`;
      }

      return {
        atrasado,
        texto: atrasado ? `Atrasado ${texto}` : `Falta ${texto}`,
        critico: atrasado || (dias === 0 && horas < 2)
      };
    } catch {
      return null;
    }
  };

  const isAtrasada = () => {
    if (viagem.status_tracking === "finalizado" || !viagem.data_programacao_descarga) return false;

    try {
      const hoje = new Date();
      const dataProgramada = new Date(viagem.data_programacao_descarga);

      if (!isValid(dataProgramada)) return false;

      return hoje > dataProgramada;
    } catch {
      return false;
    }
  };

  const calcularDiasRestantes = () => {
    if (!viagem.data_programacao_descarga) return null;

    try {
      const hoje = new Date();
      const dataProgramada = new Date(viagem.data_programacao_descarga);

      if (!isValid(dataProgramada)) return null;

      const dias = differenceInDays(dataProgramada, hoje);
      return dias;
    } catch {
      return null;
    }
  };

  const diasRestantes = calcularDiasRestantes();
  const atrasada = isAtrasada();

  const tempoCarregamento = calcularTempoRestante(viagem.carregamento_agendamento_data);
  const tempoDescarga = calcularTempoRestante(viagem.descarga_agendamento_data);

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

  const formatDateTime = (dateString) => {
    if (!dateString) return "-";
    try {
      const date = new Date(dateString);
      if (!isValid(date)) return "-";
      return format(date, "dd/MM HH:mm", { locale: ptBR });
    } catch {
      return "-";
    }
  };

  const formatEnderecoCurto = (endereco) => {
    if (!endereco) return null;
    
    // Se for apenas coordenadas GPS, retornar como está
    if (endereco.startsWith("GPS:")) {
      return endereco;
    }
    
    // Lista de estados brasileiros válidos
    const estadosBrasileiros = [
      'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 
      'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 
      'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
    ];
    
    // Lista de cidades conhecidas (capitais e principais cidades)
    const cidadesConhecidas = [
      'São Paulo', 'Rio de Janeiro', 'Belo Horizonte', 'Brasília', 'Salvador',
      'Fortaleza', 'Curitiba', 'Recife', 'Porto Alegre', 'Manaus', 'Belém',
      'Goiânia', 'Guarulhos', 'Campinas', 'São Luís', 'São Gonçalo', 'Maceió',
      'Duque de Caxias', 'Natal', 'Teresina', 'Campo Grande', 'Nova Iguaçu',
      'São Bernardo do Campo', 'João Pessoa', 'Santo André', 'Osasco', 'Jaboatão',
      'São José dos Campos', 'Ribeirão Preto', 'Uberlândia', 'Sorocaba', 'Contagem',
      'Aracaju', 'Feira de Santana', 'Cuiabá', 'Joinville', 'Juiz de Fora',
      'Londrina', 'Aparecida de Goiânia', 'Niterói', 'Ananindeua', 'Belford Roxo',
      'Caxias do Sul', 'Porto Velho', 'Macapá', 'Mauá', 'Carapicuíba', 'Vitória',
      'Santos', 'Guarujá', 'Cubatão'
    ];
    
    // Dividir por vírgulas e limpar
    const parts = endereco.split(',').map(p => p.trim()).filter(p => p);
    
    if (parts.length === 0) return endereco;
    
    // Estratégia 1: Procurar por UF explícita (2 letras maiúsculas isoladas)
    let ufEncontrada = null;
    let ufIndex = -1;
    
    for (let i = 0; i < parts.length; i++) {
      const parte = parts[i];
      // Procurar UF exata (2 letras maiúsculas, pode ter espaços/pontuação)
      const ufMatch = parte.match(/\b([A-Z]{2})\b/);
      if (ufMatch && estadosBrasileiros.includes(ufMatch[1])) {
        ufEncontrada = ufMatch[1];
        ufIndex = i;
        break;
      }
    }
    
    // Se encontrou UF, pegar a cidade que está antes
    if (ufEncontrada && ufIndex > 0) {
      let cidade = parts[ufIndex - 1];
      
      // Limpar cidade de CEPs, números e lixo
      cidade = cidade
        .replace(/\d{5}-?\d{3}/g, '') // Remove CEP
        .replace(/^\d+\s*-?\s*/g, '') // Remove números no início
        .replace(/[^\w\sÀ-ÿ]/g, ' ') // Remove pontuação especial
        .trim();
      
      if (cidade && cidade.length > 2 && !cidade.match(/^\d+$/)) {
        return `${cidade}, ${ufEncontrada}`;
      }
    }
    
    // Estratégia 2: Procurar por cidades conhecidas no texto
    for (const cidadeConhecida of cidadesConhecidas) {
      for (let i = 0; i < parts.length; i++) {
        const parte = parts[i];
        if (parte.includes(cidadeConhecida) || cidadeConhecida.includes(parte)) {
          // Encontrou cidade conhecida, tentar encontrar UF próxima
          let ufProxima = null;
          
          // Procurar UF nas próximas 2 partes
          for (let j = i + 1; j < Math.min(i + 3, parts.length); j++) {
            const match = parts[j].match(/\b([A-Z]{2})\b/);
            if (match && estadosBrasileiros.includes(match[1])) {
              ufProxima = match[1];
              break;
            }
          }
          
          if (ufProxima) {
            return `${cidadeConhecida}, ${ufProxima}`;
          } else {
            // Se não achou UF mas achou cidade conhecida, retornar só a cidade
            return cidadeConhecida;
          }
        }
      }
    }
    
    // Estratégia 3: Tentar identificar padrões como "Cidade - UF" ou "Cidade, UF"
    const dashPattern = /([^,\-]+)\s*[-–]\s*([A-Z]{2})\b/;
    const dashMatch = endereco.match(dashPattern);
    if (dashMatch && estadosBrasileiros.includes(dashMatch[2])) {
      let cidade = dashMatch[1].trim()
        .replace(/\d{5}-?\d{3}/g, '')
        .replace(/^\d+\s*-?\s*/g, '')
        .trim();
      
      if (cidade && cidade.length > 2) {
        return `${cidade}, ${dashMatch[2]}`;
      }
    }
    
    // Estratégia 4: Filtrar "Região" e nomes genéricos, pegar partes relevantes
    const partesRelevantes = parts.filter(p => {
      const lower = p.toLowerCase();
      return (
        !p.match(/^\d{5}-?\d{3}$/) && // Não é CEP
        !p.match(/^\d+$/) && // Não é só números
        !lower.includes('brasil') && // Não é "Brasil"
        !lower.includes('região') && // Não é "Região X"
        !lower.match(/^(norte|sul|leste|oeste|nordeste|sudeste|centro)/i) && // Não é direção
        p.length > 2 && // Tem tamanho razoável
        !p.match(/^\d/) // Não começa com número
      );
    });
    
    // Se temos partes relevantes, tentar montar cidade + estado
    if (partesRelevantes.length >= 2) {
      // Procurar por um estado válido nas últimas partes
      for (let i = partesRelevantes.length - 1; i >= 0; i--) {
        const match = partesRelevantes[i].match(/\b([A-Z]{2})\b/);
        if (match && estadosBrasileiros.includes(match[1])) {
          // Encontrou estado, pegar parte anterior como cidade
          if (i > 0) {
            let cidade = partesRelevantes[i - 1]
              .replace(/\d{5}-?\d{3}/g, '')
              .replace(/^\d+\s*-?\s*/g, '')
              .trim();
            
            if (cidade && cidade.length > 2) {
              return `${cidade}, ${match[1]}`;
            }
          }
        }
      }
      
      // Se não encontrou estado mas tem pelo menos 2 partes relevantes, mostrar as 2 últimas
      const ultimas = partesRelevantes.slice(-2);
      const resultado = ultimas.join(', ');
      return resultado.length > 50 ? resultado.substring(0, 50) + '...' : resultado;
    }
    
    // Estratégia 5: Pegar as primeiras partes não-genéricas
    if (partesRelevantes.length === 1) {
      return partesRelevantes[0].length > 50 
        ? partesRelevantes[0].substring(0, 50) + '...' 
        : partesRelevantes[0];
    }
    
    // Fallback final: truncar o endereço original
    return endereco.length > 50 ? endereco.substring(0, 50) + '...' : endereco;
  };

  const theme = {
    cardBg: isDark ? '#1e293b' : '#ffffff',
    cardBorder: isDark ? '#334155' : '#e5e7eb',
    text: isDark ? '#f1f5f9' : '#111827',
    textMuted: isDark ? '#94a3b8' : '#6b7280',
  };

  return (
    <Card 
      className={`overflow-hidden transition-all hover:shadow-md border ${
        atrasada ? 'border-l-4 border-red-500' : 'border-l-4 border-blue-500'
      }`}
      style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}
    >
      <CardContent className="p-0">
        {/* Header com Status */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-2.5 text-white">
          <div className="flex items-start justify-between mb-1">
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-sm truncate leading-tight">{viagem.numero_carga || `#${viagem.id.slice(-6)}`}</h3>
              <p className="text-[10px] opacity-90 truncate leading-tight">{viagem.cliente}</p>
            </div>
            <Badge className={`${statusConfig.color} text-[9px] px-2 py-0.5 font-semibold shadow ml-2 whitespace-nowrap h-5`}>
              {statusConfig.label}
            </Badge>
          </div>

          {atrasada && (
            <div className="flex items-center gap-1.5 bg-red-500 bg-opacity-30 rounded px-2 py-1 mt-1.5 border border-red-300">
              <AlertTriangle className="w-3 h-3 flex-shrink-0" />
              <span className="text-[10px] font-bold">VIAGEM ATRASADA</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-2.5 space-y-2">
          {/* Agendamentos */}
          {(tempoCarregamento || tempoDescarga) && (
            <div className="space-y-1.5">
              {tempoCarregamento && viagem.carregamento_agendamento_data && (
                <div className={`p-1.5 rounded border ${
                  tempoCarregamento.atrasado
                    ? (isDark ? 'bg-red-900/20 border-red-800' : 'bg-red-50 border-red-300')
                    : tempoCarregamento.critico
                    ? (isDark ? 'bg-yellow-900/20 border-yellow-800' : 'bg-yellow-50 border-yellow-300')
                    : (isDark ? 'bg-blue-900/20 border-blue-800' : 'bg-blue-50 border-blue-300')
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 flex-1 min-w-0">
                      <Calendar className={`w-3 h-3 flex-shrink-0 ${tempoCarregamento.atrasado ? (isDark ? 'text-red-400' : 'text-red-600') : (isDark ? 'text-blue-400' : 'text-blue-600')}`} />
                      <span className="text-[10px] font-medium truncate" style={{ color: theme.textMuted }}>Carregamento</span>
                    </div>
                    <Badge className={`${
                      tempoCarregamento.atrasado ? 'bg-red-600' : tempoCarregamento.critico ? 'bg-yellow-600' : 'bg-blue-600'
                    } text-white text-[9px] font-bold px-1.5 py-0.5 ml-1.5 whitespace-nowrap h-4`}>
                      {tempoCarregamento.texto}
                    </Badge>
                  </div>
                  <p className="text-xs font-semibold mt-0.5" style={{ color: theme.text }}>
                    {formatDateTime(viagem.carregamento_agendamento_data)}
                  </p>
                </div>
              )}

              {tempoDescarga && viagem.descarga_agendamento_data && (
                <div className={`p-1.5 rounded border ${
                  tempoDescarga.atrasado
                    ? (isDark ? 'bg-red-900/20 border-red-800' : 'bg-red-50 border-red-300')
                    : tempoDescarga.critico
                    ? (isDark ? 'bg-yellow-900/20 border-yellow-800' : 'bg-yellow-50 border-yellow-300')
                    : (isDark ? 'bg-indigo-900/20 border-indigo-800' : 'bg-indigo-50 border-indigo-300')
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 flex-1 min-w-0">
                      <Calendar className={`w-3 h-3 flex-shrink-0 ${tempoDescarga.atrasado ? (isDark ? 'text-red-400' : 'text-red-600') : (isDark ? 'text-indigo-400' : 'text-indigo-600')}`} />
                      <span className="text-[10px] font-medium truncate" style={{ color: theme.textMuted }}>Descarga</span>
                    </div>
                    <Badge className={`${
                      tempoDescarga.atrasado ? 'bg-red-600' : tempoDescarga.critico ? 'bg-yellow-600' : 'bg-indigo-600'
                    } text-white text-[9px] font-bold px-1.5 py-0.5 ml-1.5 whitespace-nowrap h-4`}>
                      {tempoDescarga.texto}
                    </Badge>
                  </div>
                  <p className="text-xs font-semibold mt-0.5" style={{ color: theme.text }}>
                    {formatDateTime(viagem.descarga_agendamento_data)}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Rota */}
          <div className="flex items-start gap-1.5">
            <MapPin className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" style={{ color: theme.textMuted, opacity: 0.7 }} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1">
                <span className="font-semibold text-xs truncate" style={{ color: theme.text }}>{viagem.origem}</span>
                <span className="flex-shrink-0 text-xs" style={{ color: theme.textMuted }}>→</span>
                <span className="font-semibold text-xs truncate" style={{ color: theme.text }}>{viagem.destino}</span>
              </div>
            </div>
          </div>

          {/* Produto */}
          <div className="flex items-start gap-1.5">
            <Package className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" style={{ color: theme.textMuted, opacity: 0.7 }} />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium truncate" style={{ color: theme.text }}>{viagem.produto}</p>
              <p className="text-[10px]" style={{ color: theme.textMuted }}>{viagem.peso?.toLocaleString()} kg</p>
            </div>
          </div>

          {/* Localização Atual */}
          {viagem.localizacao_atual && (
            <div 
              className="rounded border p-2"
              style={{
                backgroundColor: isDark ? '#1e293b' : '#eff6ff',
                borderColor: isDark ? '#334155' : '#bfdbfe'
              }}
            >
              <div className="flex items-center gap-1.5 mb-0.5">
                <MapPin className={`w-3 h-3 flex-shrink-0 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
                <span className={`text-[10px] font-medium ${isDark ? 'text-blue-300' : 'text-blue-900'}`}>Última localização</span>
              </div>
              <p className={`text-xs font-semibold truncate ${isDark ? 'text-blue-300' : 'text-blue-800'}`}>
                {formatEnderecoCurto(viagem.localizacao_atual) || viagem.localizacao_atual}
              </p>
              {viagem.km_faltam && (
                <p className={`text-[10px] mt-0.5 ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                  Faltam {viagem.km_faltam} km
                </p>
              )}
            </div>
          )}
        </div>

        {/* Actions */}
        <div 
          className="border-t p-2 space-y-1.5"
          style={{
            borderTopColor: isDark ? '#334155' : '#e5e7eb',
            backgroundColor: isDark ? '#0f172a' : '#f9fafb'
          }}
        >
          {!isHistorico && onAtualizarStatus && (
            <>
              {statusConfig.proximaEtapa && statusConfig.proximaLabel && (
                <Button
                  onClick={handleExecutarProximaEtapa}
                  disabled={executingAction}
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white h-9 text-xs font-semibold shadow hover:shadow-lg transition-all flex items-center justify-center gap-1.5"
                >
                  {executingAction ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Registrando...
                    </>
                  ) : (
                    <>
                      <ArrowRight className="w-3.5 h-3.5" />
                      {statusConfig.proximaLabel}
                    </>
                  )}
                </Button>
              )}

              <div className="grid grid-cols-2 gap-1.5">
                <Button
                  onClick={onAtualizarStatus}
                  variant="outline"
                  disabled={executingAction}
                  className={`h-8 font-semibold text-[10px] flex items-center justify-center gap-1 ${
                    isDark 
                      ? 'border-blue-500 text-blue-400 hover:bg-slate-800 bg-slate-900' 
                      : 'border-blue-600 text-blue-700 hover:bg-blue-50 bg-white'
                  }`}
                >
                  <Edit className="w-3 h-3" />
                  Status
                </Button>

                {onAbrirChat && (
                  <Button
                    onClick={() => onAbrirChat(viagem)}
                    variant="outline"
                    disabled={executingAction}
                    className={`h-8 font-semibold text-[10px] flex items-center justify-center gap-1 ${
                      isDark 
                        ? 'border-purple-500 text-purple-400 hover:bg-slate-800 bg-slate-900' 
                        : 'border-purple-600 text-purple-700 hover:bg-purple-50 bg-white'
                    }`}
                  >
                    <MessageCircle className="w-3 h-3" />
                    Chat
                  </Button>
                )}
              </div>
            </>
          )}

          <Button
            onClick={onVerDetalhes}
            variant="outline"
            disabled={executingAction}
            className={`w-full h-8 text-xs font-medium flex items-center justify-center gap-1.5 ${
              isDark 
                ? 'border-slate-700 bg-slate-900 hover:bg-slate-800 text-gray-300' 
                : 'border-gray-300 bg-white hover:bg-gray-100 text-gray-700'
            }`}
          >
            <ChevronRight className="w-3.5 h-3.5" />
            Ver Detalhes
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
