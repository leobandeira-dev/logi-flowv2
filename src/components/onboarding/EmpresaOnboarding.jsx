import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Building2, 
  Loader2, 
  CheckCircle,
  AlertCircle,
  Search,
  Shield,
  User,
  Truck,
  UserCheck,
  Package,
  ClipboardCheck
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function EmpresaOnboarding({ open, user, onComplete }) {
  // Detectar automaticamente o step inicial baseado no perfil do usuário
  const getInitialStep = () => {
    if (!user?.tipo_perfil) return "perfil";
    
    if (user.tipo_perfil === "operador" && !user.empresa_id) {
      return "operador";
    }
    
    if (user.tipo_perfil === "fornecedor" && !user.cnpj_associado) {
      return "fornecedor";
    }
    
    if (user.tipo_perfil === "cliente" && !user.cnpj_associado) {
      return "cliente";
    }
    
    return "perfil";
  };

  const [step, setStep] = useState(getInitialStep()); 
  const [perfilSelecionado, setPerfilSelecionado] = useState(user?.tipo_perfil || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Admin states
  const [cnpjAdmin, setCnpjAdmin] = useState("");
  const [empresaExistente, setEmpresaExistente] = useState(null);
  const [novaEmpresaForm, setNovaEmpresaForm] = useState({
    cnpj: "",
    razao_social: "",
    nome_fantasia: "",
    cidade: "",
    estado: "",
    telefone: "",
    email: ""
  });

  // Usuario/Operador/Fornecedor/Cliente states
  const [cnpjUsuario, setCnpjUsuario] = useState(user?.cnpj_associado || "");
  const [empresaEncontrada, setEmpresaEncontrada] = useState(null);

  // Auto-buscar empresa se já tiver CNPJ no perfil
  useEffect(() => {
    if (user?.cnpj_associado && !empresaEncontrada && (step === "fornecedor" || step === "cliente")) {
      handleBuscarEmpresaUsuario();
    }
  }, [step]);

  // Motorista states
  const [cpfMotorista, setCpfMotorista] = useState("");
  const [motoristaEncontrado, setMotoristaEncontrado] = useState(null);
  const [novoMotoristaForm, setNovoMotoristaForm] = useState({
    cpf: "",
    nome: "",
    celular: "",
    cnh: "",
    categoria_cnh: "D"
  });

  const formatCNPJ = (value) => {
    const cnpj = value.replace(/\D/g, "");
    if (cnpj.length <= 14) {
      return cnpj
        .replace(/^(\d{2})(\d)/, "$1.$2")
        .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
        .replace(/\.(\d{3})(\d)/, ".$1/$2")
        .replace(/(\d{4})(\d)/, "$1-$2");
    }
    return cnpj;
  };

  const formatCPF = (value) => {
    const cpf = value.replace(/\D/g, "");
    if (cpf.length <= 11) {
      return cpf
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
    }
    return cpf;
  };

  // ==================== ADMINISTRADOR ====================
  const handleBuscarEmpresaCNPJ = async () => {
    setLoading(true);
    setError(null);
    setEmpresaExistente(null);

    try {
      const cnpjLimpo = cnpjAdmin.replace(/\D/g, "");
      
      if (cnpjLimpo.length !== 14) {
        setError("CNPJ deve ter 14 dígitos");
        return;
      }

      // Buscar empresa pelo CNPJ
      const empresas = await base44.entities.Empresa.list();
      const empresa = empresas.find(e => e.cnpj?.replace(/\D/g, "") === cnpjLimpo);

      if (empresa) {
        setError("Já existe uma empresa cadastrada com este CNPJ. Como administrador, você só pode cadastrar uma nova empresa.");
        setEmpresaExistente(empresa);
      } else {
        // Empresa não existe, preparar para cadastro
        setNovaEmpresaForm(prev => ({ ...prev, cnpj: cnpjAdmin }));
        setStep("admin_cadastrar");
      }
    } catch (err) {
      console.error("Erro ao buscar empresa:", err);
      setError("Erro ao buscar empresa. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleCriarEmpresaAdmin = async () => {
    setLoading(true);
    setError(null);

    try {
      // Validações
      if (!novaEmpresaForm.razao_social || !novaEmpresaForm.cnpj) {
        setError("CNPJ e Razão Social são obrigatórios");
        return;
      }

      // Criar nova empresa
      const novaEmpresa = await base44.entities.Empresa.create(novaEmpresaForm);

      // Atualizar usuário como admin e vincular à empresa
      await base44.auth.updateMe({ 
        empresa_id: novaEmpresa.id,
        tipo_perfil: "administrador"
      });

      onComplete();
    } catch (err) {
      console.error("Erro ao criar empresa:", err);
      setError("Erro ao criar empresa. Verifique os dados e tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  // ==================== USUÁRIO ====================
  const handleBuscarEmpresaUsuario = async () => {
    setLoading(true);
    setError(null);
    setEmpresaEncontrada(null);

    try {
      const cnpjLimpo = cnpjUsuario.replace(/\D/g, "");
      
      if (cnpjLimpo.length !== 14) {
        setError("CNPJ deve ter 14 dígitos");
        return;
      }

      // Buscar empresa pelo CNPJ
      const empresas = await base44.entities.Empresa.list();
      const empresa = empresas.find(e => e.cnpj?.replace(/\D/g, "") === cnpjLimpo);

      if (empresa) {
        // Empresa encontrada
        setEmpresaEncontrada(empresa);
        
        // Se for operador, verificar se já existe admin para esta empresa
        if (step === "operador") {
          try {
            const usuarios = await base44.entities.User.list();
            const adminExistente = usuarios.find(u => 
              u.empresa_id === empresa.id && u.admin_operador === true
            );
            
            if (adminExistente) {
              // Já existe admin, vincular como operador comum
              setStep("usuario_confirmar");
            } else {
              // Será o primeiro admin - solicitar aprovação
              setStep("solicitar_primeiro_admin");
            }
          } catch (error) {
            console.log("Erro ao verificar admins (continuando como operador comum):", error);
            setStep("usuario_confirmar");
          }
        } else {
          // Fornecedor ou cliente - confirmar vínculo direto
          setStep("usuario_confirmar");
        }
      } else {
        // Empresa não encontrada
        if (step === "operador") {
          // Operador pode criar nova empresa (será primeiro admin)
          setNovaEmpresaForm(prev => ({ ...prev, cnpj: cnpjUsuario }));
          setStep("solicitar_primeiro_admin");
        } else {
          setError("Empresa não encontrada. Verifique o CNPJ ou entre em contato com o administrador.");
        }
      }
    } catch (err) {
      console.error("Erro ao buscar empresa:", err);
      setError("Erro ao buscar empresa. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleVincularEmpresaUsuario = async () => {
    setLoading(true);
    setError(null);

    try {
      const updateData = {};
      
      // Se é operador, vincula empresa_id (sempre pendente aprovação)
      if (user.tipo_perfil === "operador") {
        updateData.empresa_id = empresaEncontrada.id;
        updateData.admin_operador = false;
        updateData.status_cadastro = "pendente_aprovacao";
      }
      // Se é fornecedor, aprovação automática
      else if (user.tipo_perfil === "fornecedor") {
        updateData.cnpj_associado = empresaEncontrada.cnpj || cnpjUsuario;
        updateData.status_cadastro = "aprovado";
      }
      // Se é cliente, pendente aprovação do operador
      else if (user.tipo_perfil === "cliente") {
        updateData.cnpj_associado = empresaEncontrada.cnpj || cnpjUsuario;
        updateData.status_cadastro = "pendente_aprovacao";
      }
      // Fallback
      else {
        updateData.empresa_id = empresaEncontrada.id;
        updateData.tipo_perfil = "usuario";
        updateData.status_cadastro = "pendente_aprovacao";
      }

      await base44.auth.updateMe(updateData);

      onComplete();
    } catch (err) {
      console.error("Erro ao vincular:", err);
      setError("Erro ao vincular. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  // ==================== MOTORISTA ====================
  const handleBuscarMotoristaCPF = async () => {
    setLoading(true);
    setError(null);
    setMotoristaEncontrado(null);

    try {
      const cpfLimpo = cpfMotorista.replace(/\D/g, "");
      
      if (cpfLimpo.length !== 11) {
        setError("CPF deve ter 11 dígitos");
        return;
      }

      // Buscar motorista pelo CPF
      const motoristas = await base44.entities.Motorista.list();
      const motorista = motoristas.find(m => m.cpf?.replace(/\D/g, "") === cpfLimpo);

      if (motorista) {
        setMotoristaEncontrado(motorista);
        setStep("motorista_confirmar");
      } else {
        // Motorista não existe, preparar para cadastro
        setNovoMotoristaForm(prev => ({ ...prev, cpf: cpfMotorista }));
        setStep("motorista_cadastrar");
      }
    } catch (err) {
      console.error("Erro ao buscar motorista:", err);
      setError("Erro ao buscar motorista. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleCriarMotorista = async () => {
    setLoading(true);
    setError(null);

    try {
      // Validações
      if (!novoMotoristaForm.nome || !novoMotoristaForm.cpf || !novoMotoristaForm.celular || !novoMotoristaForm.cnh) {
        setError("Nome, CPF, Celular e CNH são obrigatórios");
        return;
      }

      // Criar novo motorista
      const novoMotorista = await base44.entities.Motorista.create({
        ...novoMotoristaForm,
        data_cadastro: new Date().toISOString().split('T')[0],
        status: "ativo"
      });

      // Atualizar usuário vinculando ao motorista (pendente aprovação)
      await base44.auth.updateMe({ 
        tipo_perfil: "motorista",
        motorista_id: novoMotorista.id,
        cpf: novoMotoristaForm.cpf,
        status_cadastro: "pendente_aprovacao"
      });

      onComplete();
    } catch (err) {
      console.error("Erro ao criar motorista:", err);
      setError("Erro ao criar motorista. Verifique os dados e tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleVincularMotorista = async () => {
    setLoading(true);
    setError(null);

    try {
      // Vincular usuário ao motorista existente (pendente aprovação)
      await base44.auth.updateMe({ 
        tipo_perfil: "motorista",
        motorista_id: motoristaEncontrado.id,
        cpf: cpfMotorista,
        status_cadastro: "pendente_aprovacao"
      });

      onComplete();
    } catch (err) {
      console.error("Erro ao vincular motorista:", err);
      setError("Erro ao vincular motorista. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    if (field === "cnpj") {
      setNovaEmpresaForm(prev => ({ ...prev, [field]: formatCNPJ(value) }));
    } else if (field === "estado") {
      setNovaEmpresaForm(prev => ({ ...prev, [field]: value.toUpperCase().slice(0, 2) }));
    } else {
      setNovaEmpresaForm(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleMotoristaInputChange = (field, value) => {
    if (field === "cpf") {
      setNovoMotoristaForm(prev => ({ ...prev, [field]: formatCPF(value) }));
    } else {
      setNovoMotoristaForm(prev => ({ ...prev, [field]: value }));
    }
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto" hideClose>
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <UserCheck className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <DialogTitle className="text-2xl">Bem-vindo(a), {user?.full_name}!</DialogTitle>
              <DialogDescription>
                Complete seu cadastro para começar
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="w-4 h-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* ==================== SELEÇÃO DE PERFIL ==================== */}
        {step === "perfil" && (
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-900">
                <strong>Primeiro passo:</strong> Selecione seu perfil de acesso ao sistema.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card 
                className="cursor-pointer hover:shadow-lg transition-all hover:border-purple-300 border-2"
                onClick={() => {
                  setPerfilSelecionado("administrador");
                  setStep("admin");
                  setError(null);
                }}
              >
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Shield className="w-8 h-8 text-purple-600" />
                  </div>
                  <h3 className="font-bold text-lg mb-2">Administrador</h3>
                  <p className="text-sm text-gray-600">
                    Cadastre uma nova empresa e tenha controle total
                  </p>
                </CardContent>
              </Card>

              <Card 
                className="cursor-pointer hover:shadow-lg transition-all hover:border-blue-300 border-2"
                onClick={() => {
                  setPerfilSelecionado("usuario");
                  setStep("usuario");
                  setError(null);
                }}
              >
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <User className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="font-bold text-lg mb-2">Usuário</h3>
                  <p className="text-sm text-gray-600">
                    Entre em uma empresa já cadastrada
                  </p>
                </CardContent>
              </Card>

              <Card 
                className="cursor-pointer hover:shadow-lg transition-all hover:border-green-300 border-2"
                onClick={() => {
                  setPerfilSelecionado("motorista");
                  setStep("motorista");
                  setError(null);
                }}
              >
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Truck className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="font-bold text-lg mb-2">Motorista</h3>
                  <p className="text-sm text-gray-600">
                    Acesse suas viagens e atenda múltiplos clientes
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* ==================== FLUXO ADMINISTRADOR ==================== */}
        {step === "admin" && (
          <div className="space-y-4">
            <Alert className="bg-purple-50 border-purple-200">
              <Shield className="w-4 h-4 text-purple-600" />
              <AlertDescription className="text-purple-800">
                <strong>Perfil: Administrador</strong><br />
                Como administrador, você pode cadastrar uma nova empresa. Cada CNPJ só pode ter uma empresa.
              </AlertDescription>
            </Alert>

            <div>
              <Label htmlFor="cnpj_admin">CNPJ da Nova Empresa *</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  id="cnpj_admin"
                  value={cnpjAdmin}
                  onChange={(e) => setCnpjAdmin(formatCNPJ(e.target.value))}
                  placeholder="00.000.000/0000-00"
                  maxLength={18}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      handleBuscarEmpresaCNPJ();
                    }
                  }}
                />
                <Button
                  onClick={handleBuscarEmpresaCNPJ}
                  disabled={loading || cnpjAdmin.length < 14}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Search className="w-4 h-4" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Verifique se o CNPJ já está cadastrado
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setStep("perfil");
                  setCnpjAdmin("");
                  setError(null);
                }}
                className="flex-1"
              >
                Voltar
              </Button>
            </div>
          </div>
        )}

        {step === "admin_cadastrar" && (
          <div className="space-y-4">
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <AlertDescription className="text-green-800">
                <strong>CNPJ disponível!</strong> Preencha os dados da empresa para continuar.
              </AlertDescription>
            </Alert>

            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
              <div>
                <Label htmlFor="cnpj">CNPJ *</Label>
                <Input
                  id="cnpj"
                  value={novaEmpresaForm.cnpj}
                  disabled
                />
              </div>

              <div>
                <Label htmlFor="razao_social">Razão Social *</Label>
                <Input
                  id="razao_social"
                  value={novaEmpresaForm.razao_social}
                  onChange={(e) => handleInputChange("razao_social", e.target.value)}
                  placeholder="Empresa Transportes LTDA"
                  required
                />
              </div>

              <div>
                <Label htmlFor="nome_fantasia">Nome Fantasia</Label>
                <Input
                  id="nome_fantasia"
                  value={novaEmpresaForm.nome_fantasia}
                  onChange={(e) => handleInputChange("nome_fantasia", e.target.value)}
                  placeholder="Transportes"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="cidade">Cidade</Label>
                  <Input
                    id="cidade"
                    value={novaEmpresaForm.cidade}
                    onChange={(e) => handleInputChange("cidade", e.target.value)}
                    placeholder="São Paulo"
                  />
                </div>
                <div>
                  <Label htmlFor="estado">Estado (UF)</Label>
                  <Input
                    id="estado"
                    value={novaEmpresaForm.estado}
                    onChange={(e) => handleInputChange("estado", e.target.value)}
                    placeholder="SP"
                    maxLength={2}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="telefone">Telefone</Label>
                <Input
                  id="telefone"
                  value={novaEmpresaForm.telefone}
                  onChange={(e) => handleInputChange("telefone", e.target.value)}
                  placeholder="(11) 0000-0000"
                />
              </div>

              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={novaEmpresaForm.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  placeholder="contato@empresa.com.br"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setStep("admin");
                  setCnpjAdmin("");
                  setError(null);
                }}
                className="flex-1"
              >
                Voltar
              </Button>
              <Button
                onClick={handleCriarEmpresaAdmin}
                disabled={loading || !novaEmpresaForm.razao_social}
                className="flex-1 bg-purple-600 hover:bg-purple-700"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Cadastrando...
                  </>
                ) : (
                  <>
                    <Building2 className="w-4 h-4 mr-2" />
                    Cadastrar Empresa
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {/* ==================== FLUXO OPERADOR ==================== */}
        {step === "operador" && (
          <div className="space-y-4">
            <Alert className="bg-blue-50 border-blue-200">
              <User className="w-4 h-4 text-blue-600" />
              <AlertDescription className="text-blue-800">
                <strong>Perfil: Operador</strong><br />
                Digite o CNPJ da empresa operadora logística para vincular sua conta.
              </AlertDescription>
            </Alert>

            <div>
              <Label htmlFor="cnpj_operador">CNPJ da Empresa Operadora *</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  id="cnpj_operador"
                  value={cnpjUsuario}
                  onChange={(e) => setCnpjUsuario(formatCNPJ(e.target.value))}
                  placeholder="00.000.000/0000-00"
                  maxLength={18}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      handleBuscarEmpresaUsuario();
                    }
                  }}
                />
                <Button
                  onClick={handleBuscarEmpresaUsuario}
                  disabled={loading || cnpjUsuario.length < 14}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Search className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* ==================== FLUXO FORNECEDOR ==================== */}
        {step === "fornecedor" && (
          <div className="space-y-4">
            <Alert className="bg-orange-50 border-orange-200">
              <Package className="w-4 h-4 text-orange-600" />
              <AlertDescription className="text-orange-800">
                <strong>Perfil: Fornecedor</strong><br />
                Digite o CNPJ da sua empresa fornecedora para vincular sua conta.
              </AlertDescription>
            </Alert>

            <div>
              <Label htmlFor="cnpj_fornecedor">CNPJ da sua Empresa *</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  id="cnpj_fornecedor"
                  value={cnpjUsuario}
                  onChange={(e) => setCnpjUsuario(formatCNPJ(e.target.value))}
                  placeholder="00.000.000/0000-00"
                  maxLength={18}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      handleBuscarEmpresaUsuario();
                    }
                  }}
                />
                <Button
                  onClick={handleBuscarEmpresaUsuario}
                  disabled={loading || cnpjUsuario.length < 14}
                  className="bg-orange-600 hover:bg-orange-700"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Search className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* ==================== FLUXO CLIENTE ==================== */}
        {step === "cliente" && (
          <div className="space-y-4">
            <Alert className="bg-green-50 border-green-200">
              <ClipboardCheck className="w-4 h-4 text-green-600" />
              <AlertDescription className="text-green-800">
                <strong>Perfil: Cliente</strong><br />
                Digite o CNPJ da sua empresa para vincular sua conta.
              </AlertDescription>
            </Alert>

            <div>
              <Label htmlFor="cnpj_cliente">CNPJ da sua Empresa *</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  id="cnpj_cliente"
                  value={cnpjUsuario}
                  onChange={(e) => setCnpjUsuario(formatCNPJ(e.target.value))}
                  placeholder="00.000.000/0000-00"
                  maxLength={18}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      handleBuscarEmpresaUsuario();
                    }
                  }}
                />
                <Button
                  onClick={handleBuscarEmpresaUsuario}
                  disabled={loading || cnpjUsuario.length < 14}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Search className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* ==================== FLUXO USUÁRIO GENÉRICO ==================== */}
        {step === "usuario" && (
          <div className="space-y-4">
            <Alert className="bg-blue-50 border-blue-200">
              <User className="w-4 h-4 text-blue-600" />
              <AlertDescription className="text-blue-800">
                <strong>Perfil: Usuário</strong><br />
                Digite o CNPJ da empresa à qual você pertence para se vincular.
              </AlertDescription>
            </Alert>

            <div>
              <Label htmlFor="cnpj_usuario">CNPJ da Empresa *</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  id="cnpj_usuario"
                  value={cnpjUsuario}
                  onChange={(e) => setCnpjUsuario(formatCNPJ(e.target.value))}
                  placeholder="00.000.000/0000-00"
                  maxLength={18}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      handleBuscarEmpresaUsuario();
                    }
                  }}
                />
                <Button
                  onClick={handleBuscarEmpresaUsuario}
                  disabled={loading || cnpjUsuario.length < 14}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Search className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setStep("perfil");
                  setCnpjUsuario("");
                  setError(null);
                }}
                className="flex-1"
              >
                Voltar
              </Button>
            </div>
          </div>
        )}

        {step === "usuario_confirmar" && empresaEncontrada && (
          <div className="space-y-4">
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <AlertDescription className="text-green-800">
                <strong>Empresa encontrada!</strong> Confirme os dados abaixo.
              </AlertDescription>
            </Alert>

            <div className="border rounded-lg p-4 space-y-3 bg-gray-50">
              <div>
                <p className="text-xs text-gray-600">CNPJ</p>
                <p className="font-semibold text-gray-900">{empresaEncontrada.cnpj}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600">Razão Social</p>
                <p className="font-semibold text-gray-900">{empresaEncontrada.razao_social}</p>
              </div>
              {empresaEncontrada.nome_fantasia && (
                <div>
                  <p className="text-xs text-gray-600">Nome Fantasia</p>
                  <p className="font-medium text-gray-900">{empresaEncontrada.nome_fantasia}</p>
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setStep("usuario");
                  setEmpresaEncontrada(null);
                  setError(null);
                }}
                className="flex-1"
              >
                Voltar
              </Button>
              <Button
                onClick={handleVincularEmpresaUsuario}
                disabled={loading}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Vinculando...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Confirmar Vínculo
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {/* ==================== FLUXO MOTORISTA ==================== */}
        {step === "motorista" && (
          <div className="space-y-4">
            <Alert className="bg-green-50 border-green-200">
              <Truck className="w-4 h-4 text-green-600" />
              <AlertDescription className="text-green-800">
                <strong>Perfil: Motorista</strong><br />
                Como motorista, você poderá atender cargas de diversos clientes. Digite seu CPF para continuar.
              </AlertDescription>
            </Alert>

            <div>
              <Label htmlFor="cpf_motorista">CPF do Motorista *</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  id="cpf_motorista"
                  value={cpfMotorista}
                  onChange={(e) => setCpfMotorista(formatCPF(e.target.value))}
                  placeholder="000.000.000-00"
                  maxLength={14}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      handleBuscarMotoristaCPF();
                    }
                  }}
                />
                <Button
                  onClick={handleBuscarMotoristaCPF}
                  disabled={loading || cpfMotorista.length < 11}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Search className="w-4 h-4" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Verifique se você já está cadastrado ou cadastre-se
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setStep("perfil");
                  setCpfMotorista("");
                  setError(null);
                }}
                className="flex-1"
              >
                Voltar
              </Button>
            </div>
          </div>
        )}

        {step === "motorista_confirmar" && motoristaEncontrado && (
          <div className="space-y-4">
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <AlertDescription className="text-green-800">
                <strong>Motorista encontrado!</strong> Confirme seus dados abaixo.
              </AlertDescription>
            </Alert>

            <div className="border rounded-lg p-4 space-y-3 bg-gray-50">
              <div>
                <p className="text-xs text-gray-600">Nome</p>
                <p className="font-semibold text-gray-900">{motoristaEncontrado.nome}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600">CPF</p>
                <p className="font-semibold text-gray-900">{motoristaEncontrado.cpf}</p>
              </div>
              {motoristaEncontrado.cnh && (
                <div>
                  <p className="text-xs text-gray-600">CNH</p>
                  <p className="font-medium text-gray-900">{motoristaEncontrado.cnh}</p>
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setStep("motorista");
                  setMotoristaEncontrado(null);
                  setError(null);
                }}
                className="flex-1"
              >
                Voltar
              </Button>
              <Button
                onClick={handleVincularMotorista}
                disabled={loading}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Vinculando...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Confirmar e Continuar
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {step === "solicitar_primeiro_admin" && (
          <div className="space-y-4">
            <Alert className="bg-blue-50 border-blue-200">
              <AlertCircle className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800">
                <strong>Primeira Conta de Operador Logístico</strong>
                <br />
                {empresaEncontrada ? (
                  <>A empresa <strong>{empresaEncontrada.nome_fantasia || empresaEncontrada.razao_social}</strong> ainda não possui um administrador.</>
                ) : (
                  <>O CNPJ <strong>{cnpjUsuario}</strong> ainda não está cadastrado no sistema.</>
                )}
                <br /><br />
                Para ser o administrador deste operador logístico, {!empresaEncontrada && "você precisa criar a empresa e"} aguarde aprovação do administrador do sistema.
              </AlertDescription>
            </Alert>

            {!empresaEncontrada && (
              <div className="space-y-3">
                <div>
                  <Label>CNPJ *</Label>
                  <Input value={cnpjUsuario} disabled className="bg-gray-50" />
                </div>

                <div>
                  <Label>Razão Social *</Label>
                  <Input
                    value={novaEmpresaForm.razao_social}
                    onChange={(e) => setNovaEmpresaForm({ ...novaEmpresaForm, razao_social: e.target.value })}
                    placeholder="Razão Social da empresa"
                  />
                </div>

                <div>
                  <Label>Nome Fantasia *</Label>
                  <Input
                    value={novaEmpresaForm.nome_fantasia}
                    onChange={(e) => setNovaEmpresaForm({ ...novaEmpresaForm, nome_fantasia: e.target.value })}
                    placeholder="Nome Fantasia"
                  />
                </div>

                <div>
                  <Label>Telefone</Label>
                  <Input
                    value={novaEmpresaForm.telefone}
                    onChange={(e) => setNovaEmpresaForm({ ...novaEmpresaForm, telefone: e.target.value })}
                    placeholder="(11) 1234-5678"
                  />
                </div>

                <div>
                  <Label>Email</Label>
                  <Input
                    value={novaEmpresaForm.email}
                    onChange={(e) => setNovaEmpresaForm({ ...novaEmpresaForm, email: e.target.value })}
                    placeholder="contato@empresa.com"
                  />
                </div>
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setStep("operador")}
                className="flex-1"
              >
                Voltar
              </Button>
              <Button
                onClick={async () => {
                  setLoading(true);
                  setError(null);
                  try {
                    let empresaId = empresaEncontrada?.id;
                    
                    // Se não há empresa, criar nova
                    if (!empresaEncontrada) {
                      if (!novaEmpresaForm.razao_social || !novaEmpresaForm.nome_fantasia) {
                        setError("Preencha todos os campos obrigatórios");
                        return;
                      }
                      
                      const novaEmpresa = await base44.entities.Empresa.create({
                        cnpj: cnpjUsuario,
                        razao_social: novaEmpresaForm.razao_social,
                        nome_fantasia: novaEmpresaForm.nome_fantasia,
                        telefone: novaEmpresaForm.telefone,
                        email: novaEmpresaForm.email
                      });
                      empresaId = novaEmpresa.id;
                    }
                    
                    // Atualizar usuário como primeiro admin (pendente aprovação)
                    await base44.auth.updateMe({
                      empresa_id: empresaId,
                      tipo_perfil: "operador",
                      admin_operador: true,
                      status_cadastro: "pendente_aprovacao"
                    });

                    setStep("aguardando_aprovacao");
                  } catch (error) {
                    console.error("Erro:", error);
                    setError("Erro ao processar solicitação. Tente novamente.");
                  } finally {
                    setLoading(false);
                  }
                }}
                disabled={loading || (!empresaEncontrada && (!novaEmpresaForm.razao_social || !novaEmpresaForm.nome_fantasia))}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  "Solicitar Aprovação"
                )}
              </Button>
            </div>
          </div>
        )}

        {step === "aguardando_aprovacao" && (
          <div className="space-y-4 text-center py-8">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="w-8 h-8 text-yellow-600" />
            </div>
            <h3 className="text-lg font-semibold">Cadastro Enviado para Aprovação</h3>
            <p className="text-sm text-gray-600">
              Sua solicitação para ser administrador do operador logístico foi enviada para o administrador do sistema.
            </p>
            <p className="text-sm text-gray-600">
              Você receberá uma notificação quando seu cadastro for aprovado.
            </p>
            <Alert className="bg-blue-50 border-blue-200 text-left">
              <AlertCircle className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800">
                Enquanto aguarda a aprovação, você pode fazer logout e voltar mais tarde.
              </AlertDescription>
            </Alert>
            <Button
              onClick={() => base44.auth.logout()}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Fazer Logout
            </Button>
          </div>
        )}

        {step === "motorista_cadastrar" && (
          <div className="space-y-4">
            <Alert className="bg-yellow-50 border-yellow-200">
              <AlertCircle className="w-4 h-4 text-yellow-600" />
              <AlertDescription className="text-yellow-800">
                <strong>CPF não encontrado.</strong> Cadastre-se como motorista preenchendo os dados abaixo.
              </AlertDescription>
            </Alert>

            <div className="space-y-3">
              <div>
                <Label htmlFor="cpf_novo">CPF *</Label>
                <Input
                  id="cpf_novo"
                  value={novoMotoristaForm.cpf}
                  disabled
                />
              </div>

              <div>
                <Label htmlFor="nome_motorista">Nome Completo *</Label>
                <Input
                  id="nome_motorista"
                  value={novoMotoristaForm.nome}
                  onChange={(e) => handleMotoristaInputChange("nome", e.target.value)}
                  placeholder="João da Silva"
                  required
                />
              </div>

              <div>
                <Label htmlFor="celular_motorista">Celular *</Label>
                <Input
                  id="celular_motorista"
                  value={novoMotoristaForm.celular}
                  onChange={(e) => handleMotoristaInputChange("celular", e.target.value)}
                  placeholder="(11) 98765-4321"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="cnh_motorista">CNH *</Label>
                  <Input
                    id="cnh_motorista"
                    value={novoMotoristaForm.cnh}
                    onChange={(e) => handleMotoristaInputChange("cnh", e.target.value)}
                    placeholder="00000000000"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="categoria_cnh">Categoria CNH *</Label>
                  <select
                    id="categoria_cnh"
                    value={novoMotoristaForm.categoria_cnh}
                    onChange={(e) => handleMotoristaInputChange("categoria_cnh", e.target.value)}
                    className="w-full p-2 border rounded-lg"
                  >
                    <option value="A">A</option>
                    <option value="B">B</option>
                    <option value="C">C</option>
                    <option value="D">D</option>
                    <option value="E">E</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setStep("motorista");
                  setCpfMotorista("");
                  setError(null);
                }}
                className="flex-1"
              >
                Voltar
              </Button>
              <Button
                onClick={handleCriarMotorista}
                disabled={loading || !novoMotoristaForm.nome || !novoMotoristaForm.celular || !novoMotoristaForm.cnh}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Cadastrando...
                  </>
                ) : (
                  <>
                    <Truck className="w-4 h-4 mr-2" />
                    Cadastrar Motorista
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