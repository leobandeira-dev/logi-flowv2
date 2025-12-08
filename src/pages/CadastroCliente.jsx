import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Users, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

export default function CadastroCliente() {
  const [formData, setFormData] = useState({
    cnpj: "",
    telefone: "",
    full_name: "",
    razao_social: "",
    email: "",
    password: "",
    endereco: "",
    numero: "",
    bairro: "",
    cidade: "",
    uf: "",
    cep: "",
    operador_logistico_cnpj: ""
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.cnpj || !formData.telefone || !formData.full_name || 
        !formData.email || !formData.password || !formData.operador_logistico_cnpj) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    setLoading(true);
    try {
      // Criar usuário via auth.signup (assumption: base44 has a signup method)
      // Since we cannot directly create User entities, we'll need to use updateMe after signup
      // For now, let's assume we create a user account and then update their profile
      
      toast.error("Funcionalidade de criação de conta precisa ser implementada pelo administrador do sistema. Entre em contato com o operador logístico.");
      
      // Expected flow:
      // 1. User signs up (via invite or public signup)
      // 2. After signup, they can update their profile with:
      // await base44.auth.updateMe({
      //   tipo_perfil: "cliente",
      //   cnpj_associado: formData.cnpj,
      //   operador_logistico_cnpj: formData.operador_logistico_cnpj,
      //   cargo: "Cliente Aprovador",
      //   // ... other fields
      // });
      
    } catch (error) {
      console.error("Erro ao criar cadastro:", error);
      toast.error("Erro ao criar cadastro");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 p-6 flex items-center justify-center">
      <Card className="w-full max-w-2xl shadow-xl border-green-200">
        <CardHeader className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-t-lg">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <CardTitle className="text-2xl">Cadastro - Cliente</CardTitle>
              <p className="text-sm text-green-100 mt-1">Preencha os dados para solicitar acesso</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="cnpj" className="flex items-center gap-1">
                CNPJ <span className="text-red-500">*</span>
              </Label>
              <Input
                id="cnpj"
                placeholder="Digite apenas números"
                value={formData.cnpj}
                onChange={(e) => handleChange("cnpj", e.target.value)}
                required
              />
            </div>

            <div>
              <Label htmlFor="telefone">Telefone</Label>
              <Input
                id="telefone"
                placeholder="(11) 99999-9999"
                value={formData.telefone}
                onChange={(e) => handleChange("telefone", e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="full_name" className="flex items-center gap-1">
                Nome Completo <span className="text-red-500">*</span>
              </Label>
              <Input
                id="full_name"
                placeholder="Seu nome completo"
                value={formData.full_name}
                onChange={(e) => handleChange("full_name", e.target.value)}
                required
              />
            </div>

            <div>
              <Label htmlFor="razao_social">Razão Social</Label>
              <Input
                id="razao_social"
                placeholder="Razão social da empresa"
                value={formData.razao_social}
                onChange={(e) => handleChange("razao_social", e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="email" className="flex items-center gap-1">
                E-mail <span className="text-red-500">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                required
              />
            </div>

            <div>
              <Label htmlFor="password" className="flex items-center gap-1">
                Senha <span className="text-red-500">*</span>
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Digite uma senha segura"
                value={formData.password}
                onChange={(e) => handleChange("password", e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2">
                <Label htmlFor="endereco">Endereço</Label>
                <Input
                  id="endereco"
                  placeholder="Rua, avenida..."
                  value={formData.endereco}
                  onChange={(e) => handleChange("endereco", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="numero">Número</Label>
                <Input
                  id="numero"
                  placeholder="123"
                  value={formData.numero}
                  onChange={(e) => handleChange("numero", e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="bairro">Bairro</Label>
                <Input
                  id="bairro"
                  placeholder="Centro"
                  value={formData.bairro}
                  onChange={(e) => handleChange("bairro", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="cidade">Cidade</Label>
                <Input
                  id="cidade"
                  placeholder="São Paulo"
                  value={formData.cidade}
                  onChange={(e) => handleChange("cidade", e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="uf">UF</Label>
                <Input
                  id="uf"
                  placeholder="SP"
                  maxLength={2}
                  value={formData.uf}
                  onChange={(e) => handleChange("uf", e.target.value.toUpperCase())}
                />
              </div>
              <div>
                <Label htmlFor="cep">CEP</Label>
                <Input
                  id="cep"
                  placeholder="01234-567"
                  value={formData.cep}
                  onChange={(e) => handleChange("cep", e.target.value)}
                />
              </div>
            </div>

            <div className="pt-4 border-t">
              <Label htmlFor="operador_logistico_cnpj" className="flex items-center gap-1">
                CNPJ do Operador Logístico <span className="text-red-500">*</span>
              </Label>
              <Input
                id="operador_logistico_cnpj"
                placeholder="CNPJ do operador responsável"
                value={formData.operador_logistico_cnpj}
                onChange={(e) => handleChange("operador_logistico_cnpj", e.target.value)}
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Informe o CNPJ do operador logístico que irá gerenciar sua conta
              </p>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => window.history.back()}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar às opções
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                {loading ? "Solicitando..." : "Solicitar Cadastro"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}