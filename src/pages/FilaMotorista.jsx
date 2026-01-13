import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Truck, CheckCircle, Clock, Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import AdicionarFilaCarousel from "../components/fila/AdicionarFilaCarousel";

export default function FilaMotorista() {
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [tiposFila, setTiposFila] = useState([]);
  const [minhaFila, setMinhaFila] = useState(null);
  const [totalNaFila, setTotalNaFila] = useState(0);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [etapa, setEtapa] = useState("telefone"); // "telefone" ou "formulario"
  const [telefoneBusca, setTelefoneBusca] = useState("");
  const [buscandoMotorista, setBuscandoMotorista] = useState(false);
  const [feedbackTelefone, setFeedbackTelefone] = useState(null);
  const [motoristaEncontrado, setMotoristaEncontrado] = useState(false);
  const [preenchidoAutomatico, setPreenchidoAutomatico] = useState(false);
  const [motoristas, setMotoristas] = useState([]);
  const [veiculos, setVeiculos] = useState([]);
  
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
      // Pegar código de acesso da URL (prioritário) ou empresa_id (compatibilidade)
      const urlParams = new URLSearchParams(window.location.search);
      const codigoAcesso = urlParams.get('codigo');
      const empresaIdUrl = urlParams.get('empresa_id');

      let empresaId = null;

      // Prioridade 1: Buscar por código de acesso (mais seguro)
      if (codigoAcesso) {
        const empresas = await base44.entities.Empresa.filter({ 
          codigo_acesso_fila: codigoAcesso.toUpperCase(),
          status: "ativa" 
        }, null, 1);
        empresaId = empresas[0]?.id;
        
        if (!empresaId) {
          toast.error("Código de acesso inválido");
          setLoading(false);
          return;
        }
      } 
      // Prioridade 2: empresa_id direto (manter compatibilidade)
      else if (empresaIdUrl) {
        empresaId = empresaIdUrl;
      }
      // Prioridade 3: buscar primeira empresa ativa
      else {
        const empresas = await base44.entities.Empresa.filter({ status: "ativa" }, null, 1);
        empresaId = empresas[0]?.id;
      }

      if (!empresaId) {
        toast.error("Nenhuma empresa encontrada");
        setLoading(false);
        return;
      }

      // Salvar empresa_id no estado e localStorage
      setFormData(prev => ({ ...prev, empresa_id: empresaId }));
      localStorage.setItem('fila_empresa_id', empresaId);

      // Buscar tipos de fila, motoristas e veículos APENAS desta empresa
      const [tiposData, motoristasData, veiculosData] = await Promise.all([
        base44.entities.TipoFilaVeiculo.filter({ empresa_id: empresaId, ativo: true }, "ordem"),
        base44.entities.Motorista.filter({ status: "ativo" }),
        base44.entities.Veiculo.filter({ status: "disponível" })
      ]);

      setTiposFila(tiposData);
      setMotoristas(motoristasData);
      setVeiculos(veiculosData);

      // Verificar se já existe cadastro com este telefone no localStorage
      const telefoneSalvo = localStorage.getItem('fila_motorista_telefone');
      const empresaSalva = localStorage.getItem('fila_empresa_id');
      
      if (telefoneSalvo && empresaSalva === empresaId) {
        const resultado = await verificarCadastro(telefoneSalvo, empresaId);
        if (resultado) {
          // Pular direto para tela de sucesso
          setSubmitted(true);
        }
      }
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      toast.error("Erro ao carregar dados");
    } finally {
      setLoading(false);
    }
  };

  const verificarCadastro = async (telefone, empresaId = null) => {
    try {
      const telefoneLimpo = telefone.replace(/\D/g, '');
      const empresa = empresaId || formData.empresa_id;

      // Filtrar por telefone E empresa_id E SEM data_saida_fila (somente ativos na fila)
      const todasFilas = await base44.entities.FilaVeiculo.filter({ 
        motorista_telefone: telefoneLimpo,
        empresa_id: empresa 
      }, "-data_entrada_fila");

      // Filtrar apenas marcações SEM data de saída (ainda na fila)
      const filasAtivas = todasFilas.filter(f => !f.data_saida_fila);

      if (filasAtivas.length > 0) {
        setMinhaFila(filasAtivas[0]);

        // Contar quantos veículos estão NA FRENTE (apenas ativos na fila, com posição menor)
        const todasFilasEmpresa = await base44.entities.FilaVeiculo.filter({ 
          empresa_id: empresa 
        });

        // Filtrar apenas veículos ATIVOS (sem data_saida_fila) na frente
        const naFrente = todasFilasEmpresa.filter(f => 
          !f.data_saida_fila &&
          f.posicao_fila && filasAtivas[0].posicao_fila && 
          f.posicao_fila < filasAtivas[0].posicao_fila &&
          f.status === 'aguardando'
        ).length;

        setTotalNaFila(naFrente);
        
        // Buscar ordem vinculada se houver senha
        if (filasAtivas[0].senha_fila) {
          const ordens = await base44.entities.OrdemDeCarregamento.filter({ senha_fila: filasAtivas[0].senha_fila }, null, 1);
          if (ordens.length > 0) {
            localStorage.setItem('fila_ordem_vinculada', JSON.stringify(ordens[0]));
          }
        }
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error("Erro ao verificar cadastro:", error);
      return false;
    }
  };

  // Buscar motorista automaticamente ao completar telefone
  useEffect(() => {
    const verificarMotorista = async () => {
      const telefoneLimpo = telefoneBusca.replace(/\D/g, '');
      
      if (telefoneLimpo.length !== 11) {
        setFeedbackTelefone(null);
        return;
      }

      setBuscandoMotorista(true);
      try {
        const motoristasEncontrados = motoristas.filter(m => 
          m.celular?.replace(/\D/g, '') === telefoneLimpo
        );

        if (motoristasEncontrados.length > 0) {
          const motorista = motoristasEncontrados[0];
          const cavalo = veiculos.find(v => v.id === motorista.cavalo_id);
          
          setFormData(prev => ({
            ...prev,
            motorista_id: motorista.id,
            motorista_nome: motorista.nome,
            motorista_telefone: telefoneLimpo,
            cavalo_id: motorista.cavalo_id || "",
            cavalo_placa: cavalo?.placa || "",
            tipo_veiculo: cavalo?.tipo || "",
            tipo_carroceria: cavalo?.carroceria || ""
          }));

          setMotoristaEncontrado(true);
          setPreenchidoAutomatico(true);
          setFeedbackTelefone('encontrado');
        } else {
          setFormData(prev => ({
            ...prev,
            motorista_telefone: telefoneLimpo
          }));
          setMotoristaEncontrado(false);
          setPreenchidoAutomatico(false);
          setFeedbackTelefone('novo');
        }
      } catch (error) {
        console.error("Erro ao buscar motorista:", error);
      } finally {
        setBuscandoMotorista(false);
      }
    };

    verificarMotorista();
  }, [telefoneBusca, motoristas, veiculos]);

  const handleObterLocalizacao = () => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        toast.error("Geolocalização não suportada");
        resolve(false);
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
            const cidade = data.address?.city || data.address?.town || data.address?.municipality || "";
            const estado = data.address?.state || "";
            const cidadeUF = cidade && estado ? `${cidade}, ${estado}` : "";
            
            setFormData(prev => ({ 
              ...prev, 
              localizacao_atual: endereco,
              cidade_uf: cidadeUF
            }));
            toast.success("Localização obtida!");
            setLoadingLocation(false);
            resolve(true);
          } catch (error) {
            setFormData(prev => ({ 
              ...prev, 
              localizacao_atual: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}` 
            }));
            toast.success("Coordenadas obtidas!");
            setLoadingLocation(false);
            resolve(true);
          }
        },
        (error) => {
          console.error("Erro ao obter localização:", error);
          toast.error("Erro ao obter localização");
          setLoadingLocation(false);
          resolve(false);
        }
      );
    });
  };

  const handleSubmit = async () => {
    if (!formData.motorista_nome || !formData.cavalo_placa || !formData.tipo_fila_id || !formData.motorista_telefone) {
      toast.error("Preencha nome, telefone, placa e tipo do motorista");
      return;
    }

    const telefoneLimpo = formData.motorista_telefone.replace(/\D/g, '');
    if (telefoneLimpo.length !== 11) {
      toast.error("Digite um telefone válido com DDD (11 dígitos)");
      return;
    }

    // Confirmar que o veículo está vazio
    const confirmacao = window.confirm(
      "⚠️ CONFIRMAÇÃO IMPORTANTE\n\n" +
      "Você confirma que seu veículo está VAZIO (sem carga)?\n\n" +
      "• Veículos CARREGADOS não devem marcar placa na fila\n" +
      "• Marcar placa com veículo carregado pode resultar em BLOQUEIO\n\n" +
      "Clique em OK apenas se o veículo estiver vazio."
    );

    if (!confirmacao) {
      return;
    }

    try {
      // Verificar se já existe cadastro ATIVO (sem data_saida_fila) com este telefone NESTA empresa
      const existentes = await base44.entities.FilaVeiculo.filter({ 
        motorista_telefone: telefoneLimpo,
        empresa_id: formData.empresa_id 
      });
      const existenteAtivo = existentes.filter(e => !e.data_saida_fila);
      
      if (existenteAtivo.length > 0) {
        toast.error("Este telefone já está cadastrado na fila!");
        setMinhaFila(existenteAtivo[0]);
        setSubmitted(true);
        localStorage.setItem('fila_motorista_telefone', telefoneLimpo);
        return;
      }

      const tipoSelecionado = tiposFila.find(t => t.id === formData.tipo_fila_id);
      
      // Buscar todas as filas DESTA EMPRESA para calcular próxima posição
      const todasFilas = await base44.entities.FilaVeiculo.filter({ empresa_id: formData.empresa_id });
      const proximaPosicao = todasFilas.length + 1;

      // Gerar senha única alfanumérica de 4 dígitos
      const gerarSenhaFila = async () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let senha = '';
        let tentativas = 0;
        const maxTentativas = 50;
        
        while (tentativas < maxTentativas) {
          senha = '';
          for (let i = 0; i < 4; i++) {
            senha += chars.charAt(Math.floor(Math.random() * chars.length));
          }
          
          // Verificar se senha já existe nesta empresa
          const senhaExistente = await base44.entities.FilaVeiculo.filter({ 
            senha_fila: senha,
            empresa_id: formData.empresa_id 
          });
          
          if (senhaExistente.length === 0) {
            return senha;
          }
          
          tentativas++;
        }
        
        // Fallback: usar timestamp se não conseguir gerar senha única
        return Date.now().toString().slice(-4);
      };

      const senhaFila = await gerarSenhaFila();

      await base44.entities.FilaVeiculo.create({
        ...formData,
        motorista_telefone: telefoneLimpo,
        senha_fila: senhaFila,
        tipo_fila_nome: tipoSelecionado?.nome,
        status: "aguardando",
        posicao_fila: 0, // Será recalculado
        data_entrada_fila: new Date().toISOString()
      });

      // Recalcular todas as posições FIFO (importar função ou recriar)
      const todasMarcacoes = await base44.entities.FilaVeiculo.filter({ empresa_id: formData.empresa_id });
      const ordenadas = todasMarcacoes.sort((a, b) => {
        const dataA = new Date(a.data_entrada_fila || 0);
        const dataB = new Date(b.data_entrada_fila || 0);
        return dataA - dataB;
      });
      
      for (let i = 0; i < ordenadas.length; i++) {
        const novaPosicao = i + 1;
        if (ordenadas[i].posicao_fila !== novaPosicao) {
          await base44.entities.FilaVeiculo.update(ordenadas[i].id, { posicao_fila: novaPosicao });
        }
      }

      // Buscar o registro atualizado
      const filasAtualizadas = await base44.entities.FilaVeiculo.filter({ 
        motorista_telefone: telefoneLimpo,
        empresa_id: formData.empresa_id 
      }, "-data_entrada_fila", 1);
      
      if (filasAtualizadas.length > 0) {
        setMinhaFila(filasAtualizadas[0]);
        
        // Contar quantos veículos aguardando estão NA FRENTE
        const aguardando = await base44.entities.FilaVeiculo.filter({ 
          status: "aguardando",
          empresa_id: formData.empresa_id 
        });
        
        const naFrente = aguardando.filter(f => 
          f.posicao_fila < filasAtualizadas[0].posicao_fila
        ).length;
        
        setTotalNaFila(naFrente);
      }

      setSubmitted(true);
      localStorage.setItem('fila_motorista_telefone', telefoneLimpo);
      localStorage.setItem('fila_empresa_id', formData.empresa_id);
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
                <p className="text-sm text-gray-600">{totalNaFila} {totalNaFila === 1 ? 'veículo' : 'veículos'} na sua frente</p>
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

              <div className="flex gap-3 mt-6">
                <Button
                  onClick={handleAtualizar}
                  disabled={refreshing}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
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
                <Button
                  onClick={async () => {
                    if (!window.confirm(
                      "⚠️ CONFIRMAR SAÍDA DA FILA\n\n" +
                      "Você tem certeza que deseja sair da fila?\n\n" +
                      "Clique em OK para confirmar."
                    )) return;

                    try {
                      // Buscar o status configurado para "sair da fila"
                      const statusData = await base44.entities.StatusFilaVeiculo.filter({ 
                        empresa_id: minhaFila.empresa_id,
                        aplicar_ao_sair_fila: true,
                        ativo: true
                      }, null, 1);

                      if (statusData.length === 0) {
                        toast.error("Status de saída não configurado. Entre em contato com a central.");
                        return;
                      }

                      const statusSaida = statusData[0];
                      const statusNormalizado = statusSaida.nome
                        .toLowerCase()
                        .replace(/[àáäâã]/g, 'a')
                        .replace(/[èéëê]/g, 'e')
                        .replace(/[ìíïî]/g, 'i')
                        .replace(/[òóöô]/g, 'o')
                        .replace(/[ùúüû]/g, 'u')
                        .replace(/ç/g, 'c')
                        .replace(/ /g, '_');

                      await base44.entities.FilaVeiculo.update(minhaFila.id, {
                        status: statusNormalizado,
                        data_saida_fila: new Date().toISOString()
                      });

                      toast.success("Você saiu da fila com sucesso!");
                      
                      // Limpar localStorage e voltar para tela inicial
                      localStorage.removeItem('fila_motorista_telefone');
                      localStorage.removeItem('fila_ordem_vinculada');
                      window.location.reload();
                    } catch (error) {
                      console.error("Erro ao sair da fila:", error);
                      toast.error("Erro ao sair da fila. Tente novamente.");
                    }
                  }}
                  variant="outline"
                  className="flex-1 border-red-300 text-red-600 hover:bg-red-50"
                >
                  Sair da Fila
                </Button>
              </div>
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

          {/* Informações Importantes */}
          <Card className="shadow-xl bg-amber-50 border-2 border-amber-200">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-amber-900 mb-2">Quando há carga disponível</h3>
                  <p className="text-sm text-amber-800">
                    Quando houver carga disponível um de nossos operadores irá entrar em contato com você.
                  </p>
                </div>
                <div className="border-t border-amber-200 pt-4">
                  <h3 className="font-semibold text-amber-900 mb-2">Sobre sua posição</h3>
                  <p className="text-sm text-amber-800">
                    Sua posição é uma estimativa. A sequencia de carregamento pode ser alterada de acordo com: Tipo de veiculo, carga, restrições da carga e logística interna da empresa.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const theme = {
    bg: '#f9fafb',
    cardBg: '#ffffff',
    cardBorder: '#e5e7eb',
    text: '#111827',
    textMuted: '#6b7280'
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 p-4">
      <div className="max-w-md mx-auto py-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Truck className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Check-in na Fila</h1>
          <p className="text-gray-600">Entre na fila de veículos</p>
        </div>

        <Card className="shadow-xl">
          <CardContent className="p-6">
            {etapa === "telefone" ? (
              <div className="space-y-6">
                <div className="text-center mb-4">
                  <p className="text-sm text-gray-600">
                    Digite seu celular para continuar
                  </p>
                </div>

                {/* Aviso Importante */}
                <div className="bg-red-50 border-2 border-red-300 rounded-lg p-4 mb-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0">
                      <svg className="w-6 h-6 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-sm font-bold text-red-800 mb-2">
                        ⚠️ ATENÇÃO - LEIA ANTES DE CONTINUAR
                      </h3>
                      <ul className="text-xs text-red-700 space-y-1.5 list-disc list-inside">
                        <li className="font-semibold">Só marque placa se o veículo estiver VAZIO</li>
                        <li>Veículos CARREGADOS que marcarem placa podem ser BLOQUEADOS</li>
                        <li>Certifique-se de que seu caminhão está sem carga antes de continuar</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Telefone Celular</label>
                  <input
                    type="tel"
                    inputMode="numeric"
                    value={telefoneBusca}
                    onChange={(e) => {
                      const valor = e.target.value.replace(/\D/g, '');
                      if (valor.length <= 11) {
                        const formatado = valor.replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3');
                        setTelefoneBusca(valor.length === 11 ? formatado : valor);
                      }
                    }}
                    placeholder="(00) 00000-0000"
                    maxLength={15}
                    className="w-full text-lg h-14 text-center font-bold rounded-lg border border-gray-300 px-4"
                    autoFocus
                  />
                  
                  {buscandoMotorista && (
                    <div className="mt-3 p-3 rounded-lg bg-gray-50 flex items-center justify-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                      <p className="text-sm text-gray-600">Verificando cadastro...</p>
                    </div>
                  )}
                  
                  {!buscandoMotorista && feedbackTelefone === 'encontrado' && (
                    <div className="mt-3 p-3 rounded-lg bg-green-50 border border-green-200">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                          <CheckCircle className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-green-700">Cadastro encontrado!</p>
                          <p className="text-xs text-green-600">Seus dados foram carregados</p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {!buscandoMotorista && feedbackTelefone === 'novo' && (
                    <div className="mt-3 p-3 rounded-lg bg-blue-50 border border-blue-200">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-blue-700">Novo cadastro</p>
                          <p className="text-xs text-blue-600">Preencha os dados para continuar</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <Button
                  type="button"
                  onClick={() => setEtapa("formulario")}
                  disabled={buscandoMotorista || telefoneBusca.replace(/\D/g, '').length !== 11}
                  className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-lg font-bold"
                >
                  Continuar
                </Button>
              </div>
            ) : (
              <AdicionarFilaCarousel
                formData={formData}
                setFormData={setFormData}
                tiposFila={tiposFila}
                theme={theme}
                loadingLocation={loadingLocation}
                onObterLocalizacao={handleObterLocalizacao}
                preenchidoAutomatico={preenchidoAutomatico}
                motoristaEncontrado={motoristaEncontrado}
                onSubmit={handleSubmit}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}