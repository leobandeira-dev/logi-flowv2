import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Truck, MapPin, RefreshCw, CheckCircle, Clock, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export default function FilaMotorista() {
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [tiposFila, setTiposFila] = useState([]);
  const [minhaFila, setMinhaFila] = useState(null);
  const [totalNaFila, setTotalNaFila] = useState(0);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  
  const [formData, setFormData] = useState({
    empresa_id: "",
    motorista_nome: "",
    motorista_cpf: "",
    motorista_telefone: "",
    cavalo_placa: "",
    implemento1_placa: "",
    implemento2_placa: "",
    tipo_fila_id: "",
    tipo_veiculo: "",
    tipo_carroceria: "",
    localizacao_atual: "",
    observacoes: ""
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Buscar primeira empresa disponível (ou todas)
      const empresas = await base44.entities.Empresa.filter({ status: "ativa" }, null, 1);
      const empresaId = empresas[0]?.id;
      
      if (!empresaId) {
        toast.error("Nenhuma empresa encontrada");
        setLoading(false);
        return;
      }

      // Salvar empresa_id no estado
      setFormData(prev => ({ ...prev, empresa_id: empresaId }));
      
      // Buscar tipos de fila desta empresa
      const tiposData = await base44.entities.TipoFilaVeiculo.filter({ empresa_id: empresaId, ativo: true }, "ordem");
      setTiposFila(tiposData);

      // Verificar se já existe cadastro com este CPF/Telefone no localStorage
      const cpfSalvo = localStorage.getItem('fila_motorista_cpf');
      if (cpfSalvo) {
        await verificarCadastro(cpfSalvo);
      }
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      toast.error("Erro ao carregar dados");
    } finally {
      setLoading(false);
    }
  };

  const verificarCadastro = async (cpf) => {
    try {
      const filas = await base44.entities.FilaVeiculo.filter({ motorista_cpf: cpf }, "-data_entrada_fila", 1);
      if (filas.length > 0) {
        setMinhaFila(filas[0]);
        setSubmitted(true);
        
        // Contar total de veículos na fila com mesmo status
        const todasFilas = await base44.entities.FilaVeiculo.filter({ status: filas[0].status });
        setTotalNaFila(todasFilas.length);
      }
    } catch (error) {
      console.error("Erro ao verificar cadastro:", error);
    }
  };

  const handleObterLocalizacao = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocalização não suportada");
      return;
    }

    setLoadingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`
          );
          const data = await response.json();
          
          const endereco = data.display_name || `${latitude}, ${longitude}`;
          setFormData(prev => ({ ...prev, localizacao_atual: endereco }));
          toast.success("Localização obtida!");
        } catch (error) {
          setFormData(prev => ({ 
            ...prev, 
            localizacao_atual: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}` 
          }));
          toast.success("Coordenadas obtidas!");
        } finally {
          setLoadingLocation(false);
        }
      },
      (error) => {
        console.error("Erro ao obter localização:", error);
        toast.error("Erro ao obter localização");
        setLoadingLocation(false);
      }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.motorista_nome || !formData.cavalo_placa || !formData.tipo_fila_id || !formData.motorista_cpf) {
      toast.error("Preencha nome, CPF, placa e tipo de fila");
      return;
    }

    try {
      // Verificar se já existe cadastro com este CPF
      const existente = await base44.entities.FilaVeiculo.filter({ motorista_cpf: formData.motorista_cpf });
      if (existente.length > 0) {
        toast.error("Você já está cadastrado na fila!");
        setMinhaFila(existente[0]);
        setSubmitted(true);
        localStorage.setItem('fila_motorista_cpf', formData.motorista_cpf);
        return;
      }

      const tipoSelecionado = tiposFila.find(t => t.id === formData.tipo_fila_id);
      
      // Buscar todas as filas para calcular próxima posição
      const todasFilas = await base44.entities.FilaVeiculo.list();
      const proximaPosicao = todasFilas.length + 1;

      const novoRegistro = await base44.entities.FilaVeiculo.create({
        ...formData,
        tipo_fila_nome: tipoSelecionado?.nome,
        status: "aguardando",
        posicao_fila: proximaPosicao,
        data_entrada_fila: new Date().toISOString()
      });

      setMinhaFila(novoRegistro);
      setSubmitted(true);
      localStorage.setItem('fila_motorista_cpf', formData.motorista_cpf);
      toast.success("Cadastro realizado com sucesso!");
      
      // Contar total
      const todasFilasAtual = await base44.entities.FilaVeiculo.filter({ status: "aguardando" });
      setTotalNaFila(todasFilasAtual.length);
    } catch (error) {
      console.error("Erro ao cadastrar:", error);
      toast.error("Erro ao realizar cadastro");
    }
  };

  const handleAtualizar = async () => {
    if (!minhaFila) return;
    
    setRefreshing(true);
    try {
      await verificarCadastro(minhaFila.motorista_cpf);
      toast.success("Posição atualizada!");
    } catch (error) {
      toast.error("Erro ao atualizar");
    } finally {
      setRefreshing(false);
    }
  };

  const calcularTempoNaFila = (dataEntrada) => {
    if (!dataEntrada) return "-";
    const agora = new Date();
    const entrada = new Date(dataEntrada);
    const diffMs = agora - entrada;
    const diffHoras = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutos = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    if (diffHoras > 0) {
      return `${diffHoras}h ${diffMinutos}min`;
    }
    return `${diffMinutos}min`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex items-center gap-3">
          <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  if (submitted && minhaFila) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 p-4 flex items-center justify-center">
        <div className="max-w-md w-full space-y-6">
          <div className="text-center mb-6">
            <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Cadastro Realizado!</h1>
            <p className="text-gray-600 mt-2">Você está na fila de veículos</p>
          </div>

          <Card className="shadow-xl">
            <CardHeader className="bg-blue-600 text-white rounded-t-lg">
              <CardTitle className="text-center">Sua Posição na Fila</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-24 h-24 bg-blue-100 rounded-full mb-3">
                  <span className="text-4xl font-bold text-blue-600">{minhaFila.posicao_fila || 1}</span>
                </div>
                <p className="text-sm text-gray-600">de {totalNaFila} veículos</p>
              </div>

              <div className="space-y-3 border-t pt-4">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Motorista:</span>
                  <span className="text-sm font-semibold text-gray-900">{minhaFila.motorista_nome}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Placa:</span>
                  <span className="text-sm font-mono font-bold text-gray-900">{minhaFila.cavalo_placa}</span>
                </div>
                {minhaFila.tipo_fila_nome && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Tipo:</span>
                    <span className="text-sm font-semibold text-gray-900">{minhaFila.tipo_fila_nome}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Entrada:</span>
                  <span className="text-sm text-gray-900">
                    {minhaFila.data_entrada_fila ? format(new Date(minhaFila.data_entrada_fila), "dd/MM/yyyy HH:mm", { locale: ptBR }) : "-"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Tempo na fila:</span>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4 text-orange-600" />
                    <span className="text-sm font-semibold text-orange-600">
                      {calcularTempoNaFila(minhaFila.data_entrada_fila)}
                    </span>
                  </div>
                </div>
              </div>

              <Button
                onClick={handleAtualizar}
                disabled={refreshing}
                className="w-full mt-6 bg-blue-600 hover:bg-blue-700"
              >
                {refreshing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Atualizando...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Atualizar Posição
                  </>
                )}
              </Button>

              <p className="text-xs text-center text-gray-500 mt-4">
                Sua posição será atualizada automaticamente conforme a fila avança
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 p-4">
      <div className="max-w-2xl mx-auto py-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Truck className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Fila de Veículos</h1>
          <p className="text-gray-600">Cadastre-se na fila de espera</p>
        </div>

        <Card className="shadow-xl">
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Dados do Motorista */}
              <div>
                <Label className="text-gray-900">Nome Completo *</Label>
                <Input
                  value={formData.motorista_nome}
                  onChange={(e) => setFormData(prev => ({ ...prev, motorista_nome: e.target.value }))}
                  placeholder="Seu nome completo"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-900">CPF *</Label>
                  <Input
                    value={formData.motorista_cpf}
                    onChange={(e) => setFormData(prev => ({ ...prev, motorista_cpf: e.target.value }))}
                    placeholder="000.000.000-00"
                    required
                  />
                </div>
                <div>
                  <Label className="text-gray-900">Telefone *</Label>
                  <Input
                    value={formData.motorista_telefone}
                    onChange={(e) => setFormData(prev => ({ ...prev, motorista_telefone: e.target.value }))}
                    placeholder="(00) 00000-0000"
                    required
                  />
                </div>
              </div>

              {/* Dados do Veículo */}
              <div>
                <Label className="text-gray-900">Placa do Cavalo *</Label>
                <Input
                  value={formData.cavalo_placa}
                  onChange={(e) => setFormData(prev => ({ ...prev, cavalo_placa: e.target.value.toUpperCase() }))}
                  placeholder="ABC1234"
                  required
                  className="font-mono"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-900">Placa Implemento 1</Label>
                  <Input
                    value={formData.implemento1_placa}
                    onChange={(e) => setFormData(prev => ({ ...prev, implemento1_placa: e.target.value.toUpperCase() }))}
                    placeholder="DEF5678"
                    className="font-mono"
                  />
                </div>
                <div>
                  <Label className="text-gray-900">Placa Implemento 2</Label>
                  <Input
                    value={formData.implemento2_placa}
                    onChange={(e) => setFormData(prev => ({ ...prev, implemento2_placa: e.target.value.toUpperCase() }))}
                    placeholder="GHI9012"
                    className="font-mono"
                  />
                </div>
              </div>

              {/* Tipo de Fila */}
              <div>
                <Label className="text-gray-900">Tipo de Veículo *</Label>
                <Select
                  value={formData.tipo_fila_id}
                  onValueChange={(value) => {
                    const tipo = tiposFila.find(t => t.id === value);
                    setFormData(prev => ({ ...prev, tipo_fila_id: value }));
                  }}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo..." />
                  </SelectTrigger>
                  <SelectContent>
                    {tiposFila.map(tipo => (
                      <SelectItem key={tipo.id} value={tipo.id}>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: tipo.cor }} />
                          {tipo.nome}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-900">Tipo de Veículo</Label>
                  <Select
                    value={formData.tipo_veiculo}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, tipo_veiculo: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="RODOTREM">RODOTREM</SelectItem>
                      <SelectItem value="TRUCK">TRUCK</SelectItem>
                      <SelectItem value="CARRETA 5EIXOS">CARRETA 5EIXOS</SelectItem>
                      <SelectItem value="CARRETA 6EIXOS">CARRETA 6EIXOS</SelectItem>
                      <SelectItem value="CARRETA 7EIXOS">CARRETA 7EIXOS</SelectItem>
                      <SelectItem value="BITREM">BITREM</SelectItem>
                      <SelectItem value="BI-TRUCK">BI-TRUCK</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-gray-900">Tipo de Carroceria</Label>
                  <Select
                    value={formData.tipo_carroceria}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, tipo_carroceria: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SIDER">SIDER</SelectItem>
                      <SelectItem value="PRANCHA">PRANCHA</SelectItem>
                      <SelectItem value="GRADE BAIXA">GRADE BAIXA</SelectItem>
                      <SelectItem value="GRADE ALTA">GRADE ALTA</SelectItem>
                      <SelectItem value="BAU">BAU</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Localização */}
              <div>
                <Label className="text-gray-900">Localização Atual</Label>
                <div className="flex gap-2">
                  <Input
                    value={formData.localizacao_atual}
                    onChange={(e) => setFormData(prev => ({ ...prev, localizacao_atual: e.target.value }))}
                    placeholder="Ex: Pátio Central, Filial SP..."
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleObterLocalizacao}
                    disabled={loadingLocation}
                    className="flex-shrink-0"
                  >
                    {loadingLocation ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <MapPin className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Observações */}
              <div>
                <Label className="text-gray-900">Observações</Label>
                <Textarea
                  value={formData.observacoes}
                  onChange={(e) => setFormData(prev => ({ ...prev, observacoes: e.target.value }))}
                  placeholder="Informações adicionais..."
                  rows={3}
                />
              </div>

              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 h-12 text-base">
                Entrar na Fila
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-xs text-center text-gray-500 mt-6">
          Após o cadastro, você poderá acompanhar sua posição na fila
        </p>
      </div>
    </div>
  );
}