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
    motorista_telefone: "",
    cavalo_placa: "",
    tipo_fila_id: "",
    tipo_veiculo: "",
    tipo_carroceria: "",
    localizacao_atual: "",
    observacoes: ""
  });
  const [consultaTelefone, setConsultaTelefone] = useState("");
  const [consultando, setConsultando] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Pegar empresa_id da URL
      const urlParams = new URLSearchParams(window.location.search);
      const empresaIdUrl = urlParams.get('empresa_id');
      
      let empresaId = empresaIdUrl;
      
      // Se não veio pela URL, buscar primeira empresa ativa
      if (!empresaId) {
        const empresas = await base44.entities.Empresa.filter({ status: "ativa" }, null, 1);
        empresaId = empresas[0]?.id;
      }
      
      if (!empresaId) {
        toast.error("Nenhuma empresa encontrada");
        setLoading(false);
        return;
      }

      // Salvar empresa_id no estado
      setFormData(prev => ({ ...prev, empresa_id: empresaId }));
      
      // Buscar tipos de fila APENAS desta empresa
      const tiposData = await base44.entities.TipoFilaVeiculo.filter({ empresa_id: empresaId, ativo: true }, "ordem");
      setTiposFila(tiposData);

      // Verificar se já existe cadastro com este telefone no localStorage
      const telefoneSalvo = localStorage.getItem('fila_motorista_telefone');
      if (telefoneSalvo) {
        await verificarCadastro(telefoneSalvo);
      }
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      toast.error("Erro ao carregar dados");
    } finally {
      setLoading(false);
    }
  };

  const verificarCadastro = async (telefone) => {
    try {
      const telefoneLimpo = telefone.replace(/\D/g, '');
      
      // Filtrar por telefone E empresa_id para garantir fila exclusiva por empresa
      const filas = await base44.entities.FilaVeiculo.filter({ 
        motorista_telefone: telefoneLimpo,
        empresa_id: formData.empresa_id 
      }, "-data_entrada_fila", 1);
      
      if (filas.length > 0) {
        setMinhaFila(filas[0]);
        setSubmitted(true);
        
        // Contar total de veículos APENAS desta empresa com mesmo status
        const todasFilas = await base44.entities.FilaVeiculo.filter({ 
          status: filas[0].status,
          empresa_id: formData.empresa_id 
        });
        setTotalNaFila(todasFilas.length);
        
        // Buscar ordem vinculada se houver senha
        if (filas[0].senha_fila) {
          const ordens = await base44.entities.OrdemDeCarregamento.filter({ senha_fila: filas[0].senha_fila }, null, 1);
          if (ordens.length > 0) {
            localStorage.setItem('fila_ordem_vinculada', JSON.stringify(ordens[0]));
          }
        }
      }
    } catch (error) {
      console.error("Erro ao verificar cadastro:", error);
    }
  };

  const handleConsultarTelefone = async (e) => {
    e.preventDefault();
    const telefoneLimpo = consultaTelefone.replace(/\D/g, '');
    
    if (telefoneLimpo.length !== 11) {
      toast.error("Digite um telefone válido com DDD");
      return;
    }

    setConsultando(true);
    try {
      await verificarCadastro(telefoneLimpo);
      if (!submitted) {
        toast.error("Nenhum cadastro encontrado com este telefone");
      }
    } catch (error) {
      toast.error("Erro ao consultar");
    } finally {
      setConsultando(false);
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

    if (!formData.motorista_nome || !formData.cavalo_placa || !formData.tipo_fila_id || !formData.motorista_telefone) {
      toast.error("Preencha nome, telefone, placa e tipo do motorista");
      return;
    }

    const telefoneLimpo = formData.motorista_telefone.replace(/\D/g, '');
    if (telefoneLimpo.length !== 11) {
      toast.error("Digite um telefone válido com DDD (11 dígitos)");
      return;
    }

    try {
      // Verificar se já existe cadastro com este telefone NESTA empresa
      const existente = await base44.entities.FilaVeiculo.filter({ 
        motorista_telefone: telefoneLimpo,
        empresa_id: formData.empresa_id 
      });
      if (existente.length > 0) {
        toast.error("Este telefone já está cadastrado na fila!");
        setMinhaFila(existente[0]);
        setSubmitted(true);
        localStorage.setItem('fila_motorista_telefone', telefoneLimpo);
        return;
      }

      const tipoSelecionado = tiposFila.find(t => t.id === formData.tipo_fila_id);
      
      // Buscar todas as filas DESTA EMPRESA para calcular próxima posição
      const todasFilas = await base44.entities.FilaVeiculo.filter({ empresa_id: formData.empresa_id });
      const proximaPosicao = todasFilas.length + 1;

      // Gerar senha única alfanumérica de 4 dígitos
      const gerarSenhaFila = () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let senha = '';
        for (let i = 0; i < 4; i++) {
          senha += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return senha;
      };

      const senhaFila = gerarSenhaFila();

      const novoRegistro = await base44.entities.FilaVeiculo.create({
        ...formData,
        motorista_telefone: telefoneLimpo,
        senha_fila: senhaFila,
        tipo_fila_nome: tipoSelecionado?.nome,
        status: "aguardando",
        posicao_fila: proximaPosicao,
        data_entrada_fila: new Date().toISOString()
      });

      setMinhaFila(novoRegistro);
      setSubmitted(true);
      localStorage.setItem('fila_motorista_telefone', telefoneLimpo);
      toast.success(`Cadastro realizado! Senha: ${senhaFila}`);
      
      // Contar total APENAS desta empresa
      const todasFilasAtual = await base44.entities.FilaVeiculo.filter({ 
        status: "aguardando",
        empresa_id: formData.empresa_id 
      });
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
      await verificarCadastro(minhaFila.motorista_telefone);
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
    const ordemVinculada = minhaFila.senha_fila ? 
      JSON.parse(localStorage.getItem('fila_ordem_vinculada') || 'null') : null;

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

          {/* Senha da Fila */}
          <Card className="shadow-xl border-2 border-blue-500">
            <CardHeader className="bg-blue-600 text-white rounded-t-lg">
              <CardTitle className="text-center">Sua Senha da Fila</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="text-center mb-4">
                <p className="text-6xl font-bold text-blue-600 font-mono">{minhaFila.senha_fila}</p>
                <p className="text-sm text-gray-600 mt-2">Informe esta senha ao criar a ordem de carga</p>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-xl">
            <CardHeader className="bg-gray-700 text-white rounded-t-lg">
              <CardTitle className="text-center">Sua Posição</CardTitle>
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
            </CardContent>
          </Card>

          {/* Ordem Vinculada */}
          {ordemVinculada && (
            <Card className="shadow-xl border-2 border-green-500">
              <CardHeader className="bg-green-600 text-white rounded-t-lg">
                <CardTitle className="text-center">Ordem Vinculada</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Nº Carga:</span>
                    <span className="text-sm font-mono font-bold text-gray-900">{ordemVinculada.numero_carga}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Cliente:</span>
                    <span className="text-sm font-semibold text-gray-900">{ordemVinculada.cliente}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Origem:</span>
                    <span className="text-sm text-gray-900">{ordemVinculada.origem}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Destino:</span>
                    <span className="text-sm text-gray-900">{ordemVinculada.destino}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Produto:</span>
                    <span className="text-sm text-gray-900">{ordemVinculada.produto}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
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
          <p className="text-gray-600">Cadastre-se ou consulte sua posição</p>
        </div>

        {/* Consultar por Telefone */}
        <Card className="shadow-xl mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Consultar Cadastro</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleConsultarTelefone} className="flex gap-3">
              <div className="flex-1">
                <Input
                  type="tel"
                  inputMode="numeric"
                  value={consultaTelefone}
                  onChange={(e) => {
                    const valor = e.target.value.replace(/\D/g, '');
                    if (valor.length <= 11) {
                      const formatado = valor.replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3');
                      setConsultaTelefone(valor.length === 11 ? formatado : valor);
                    }
                  }}
                  placeholder="(00) 00000-0000"
                  maxLength={15}
                  className="text-lg"
                />
              </div>
              <Button type="submit" disabled={consultando} className="bg-green-600 hover:bg-green-700">
                {consultando ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Consultar"
                )}
              </Button>
            </form>
            <p className="text-xs text-gray-500 mt-2">Digite seu celular para verificar sua posição na fila</p>
          </CardContent>
        </Card>

        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="text-lg">Novo Cadastro</CardTitle>
          </CardHeader>
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

              <div>
                <Label className="text-gray-900">Telefone Celular *</Label>
                <Input
                  type="tel"
                  inputMode="numeric"
                  value={formData.motorista_telefone}
                  onChange={(e) => {
                    const valor = e.target.value.replace(/\D/g, '');
                    if (valor.length <= 11) {
                      const formatado = valor.replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3');
                      setFormData(prev => ({ ...prev, motorista_telefone: valor.length === 11 ? formatado : valor }));
                    }
                  }}
                  placeholder="(00) 00000-0000"
                  maxLength={15}
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Use este número para consultar sua posição depois</p>
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



              {/* Tipo do Motorista */}
              <div>
                <Label className="text-gray-900">Tipo do Motorista *</Label>
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
      </div>
    </div>
  );
}