import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { base44 } from "@/api/base44Client";
import { Shield, Loader2, CheckCircle2, AlertTriangle, XCircle, Clock, Search } from "lucide-react";
import { toast } from "sonner";

const statusConfig = {
  "PERFIL ADEQUADO AO RISCO": {
    icon: CheckCircle2,
    color: "bg-green-100 text-green-800 border-green-300",
    iconColor: "text-green-600"
  },
  "PERFIL COM INSUFICIÊNCIA DE DADOS": {
    icon: AlertTriangle,
    color: "bg-yellow-100 text-yellow-800 border-yellow-300",
    iconColor: "text-yellow-600"
  },
  "PERFIL DIVERGENTE": {
    icon: XCircle,
    color: "bg-red-100 text-red-800 border-red-300",
    iconColor: "text-red-600"
  },
  "PERFIL EXPIRADO": {
    icon: Clock,
    color: "bg-orange-100 text-orange-800 border-orange-300",
    iconColor: "text-orange-600"
  },
  "EM ANÁLISE": {
    icon: Clock,
    color: "bg-blue-100 text-blue-800 border-blue-300",
    iconColor: "text-blue-600"
  }
};

const tiposCarga = [
  { value: "1", label: "Tipo de Carga 1" },
  { value: "2", label: "Tipo de Carga 2" },
  { value: "3", label: "Diversos" },
  { value: "4", label: "Alumínio" },
  { value: "5", label: "Bebidas" },
  { value: "6", label: "Eletro/Eletrônicos" },
  { value: "7", label: "Cobre" },
  { value: "8", label: "Arroz" },
  { value: "9", label: "Soja" },
  { value: "10", label: "Papel" },
  { value: "11", label: "Bobinas de Aço" },
  { value: "12", label: "Cigarros" },
  { value: "13", label: "Medicamentos" },
  { value: "14", label: "Café" },
  { value: "15", label: "Produtos Alimentícios" },
  { value: "16", label: "Produtos Frigoríficos" },
  { value: "17", label: "Produtos Químicos" },
  { value: "18", label: "Açúcar" },
  { value: "19", label: "Bobinas" },
  { value: "20", label: "Algodão em Pluma" },
  { value: "21", label: "Leite" },
  { value: "22", label: "Chapas de Aço" },
  { value: "23", label: "Produtos Siderúrgicos" },
  { value: "24", label: "Óleo de Soja" },
  { value: "25", label: "Sementes" },
  { value: "26", label: "Polietileno" },
  { value: "27", label: "Vergalhão" },
  { value: "28", label: "Máquinas em Geral" },
  { value: "29", label: "Bicarbonato de Sódio" },
  { value: "30", label: "Trigo" },
  { value: "31", label: "Produtos Agrícolas" },
  { value: "32", label: "Aço" },
  { value: "33", label: "Ferro" },
  { value: "34", label: "Produtos de Higiene e Limpeza" },
  { value: "35", label: "Tecidos" },
  { value: "36", label: "Vidro" },
  { value: "37", label: "Chapas de MDF" },
  { value: "38", label: "Laminados" },
  { value: "39", label: "Cimento" },
  { value: "40", label: "Tintas" },
  { value: "41", label: "Carga Fracionada" },
  { value: "42", label: "Outros" },
  { value: "43", label: "Couro" },
  { value: "44", label: "Algodão" }
];

export default function ConsultaBuonny({ ordem, motorista, veiculo }) {
  const [consultando, setConsultando] = useState(false);
  const [resultado, setResultado] = useState(null);
  const [formData, setFormData] = useState({
    tipo_carga: "1",
    is_carreteiro: true,
    produto: "1"
  });

  const handleConsultar = async () => {
    if (!motorista?.cpf) {
      toast.error("CPF do motorista não encontrado");
      return;
    }

    if (!veiculo?.placa && !ordem.cavalo_placa_temp) {
      toast.error("Placa do veículo não encontrada");
      return;
    }

    setConsultando(true);
    setResultado(null);

    try {
      const response = await base44.functions.invoke('consultaBuonny', {
        cpf_motorista: motorista.cpf,
        placa_veiculo: veiculo?.placa || ordem.cavalo_placa_temp,
        tipo_carga: formData.tipo_carga,
        valor_carga: ordem.valor_total_frete || 0,
        origem_uf: ordem.origem_uf,
        origem_cidade: ordem.origem_cidade,
        destino_uf: ordem.destino_uf,
        destino_cidade: ordem.destino_cidade,
        produto: formData.produto,
        is_carreteiro: formData.is_carreteiro
      });

      if (response.data.success) {
        setResultado(response.data);
        toast.success("Consulta realizada com sucesso!");
      } else {
        toast.error(response.data.error || "Erro ao consultar");
        setResultado({ error: response.data.error });
      }
    } catch (error) {
      console.error("Erro ao consultar Buonny:", error);
      toast.error("Erro ao realizar consulta");
      setResultado({ error: error.message });
    } finally {
      setConsultando(false);
    }
  };

  const getStatusInfo = () => {
    if (!resultado?.status) return null;
    
    for (const [key, config] of Object.entries(statusConfig)) {
      if (resultado.status.includes(key)) {
        return { key, ...config };
      }
    }
    
    return {
      key: resultado.status,
      icon: Shield,
      color: "bg-gray-100 text-gray-800 border-gray-300",
      iconColor: "text-gray-600"
    };
  };

  const statusInfo = getStatusInfo();

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Shield className="w-5 h-5 text-blue-600" />
            Consulta de Risco - Buonny
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertDescription className="text-sm">
              Sistema integrado com a Buonny para verificação de perfil de risco de motoristas e veículos.
            </AlertDescription>
          </Alert>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-xs font-medium text-gray-600">Motorista</Label>
              <p className="text-sm font-medium">{motorista?.nome || ordem.motorista_nome_temp || "Não definido"}</p>
              <p className="text-xs text-gray-500">{motorista?.cpf || "CPF não informado"}</p>
            </div>

            <div>
              <Label className="text-xs font-medium text-gray-600">Veículo</Label>
              <p className="text-sm font-medium">{veiculo?.placa || ordem.cavalo_placa_temp || "Não definido"}</p>
              <p className="text-xs text-gray-500">{veiculo?.marca} {veiculo?.modelo}</p>
            </div>

            <div>
              <Label className="text-xs font-medium text-gray-600">Origem</Label>
              <p className="text-sm">{ordem.origem_cidade || ordem.origem}, {ordem.origem_uf}</p>
            </div>

            <div>
              <Label className="text-xs font-medium text-gray-600">Destino</Label>
              <p className="text-sm">{ordem.destino_cidade || ordem.destino}, {ordem.destino_uf}</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="produto">Produto Buonny</Label>
              <select
                id="produto"
                value={formData.produto}
                onChange={(e) => setFormData({ ...formData, produto: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg text-sm"
              >
                <option value="1">1 - STANDARD</option>
                <option value="2">2 - PLUS</option>
              </select>
            </div>

            <div>
              <Label htmlFor="tipo_carga">Tipo de Carga</Label>
              <select
                id="tipo_carga"
                value={formData.tipo_carga}
                onChange={(e) => setFormData({ ...formData, tipo_carga: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg text-sm"
              >
                {tiposCarga.map(tipo => (
                  <option key={tipo.value} value={tipo.value}>{tipo.label}</option>
                ))}
              </select>
            </div>

            <div>
              <Label htmlFor="is_carreteiro">Tipo de Motorista</Label>
              <select
                id="is_carreteiro"
                value={formData.is_carreteiro ? "S" : "N"}
                onChange={(e) => setFormData({ ...formData, is_carreteiro: e.target.value === "S" })}
                className="w-full px-3 py-2 border rounded-lg text-sm"
              >
                <option value="S">Carreteiro</option>
                <option value="N">Não Carreteiro</option>
              </select>
            </div>
          </div>

          <Button
            onClick={handleConsultar}
            disabled={consultando || !motorista?.cpf}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            {consultando ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Consultando...
              </>
            ) : (
              <>
                <Search className="w-4 h-4 mr-2" />
                Consultar Perfil
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {resultado && (
        <Card className={resultado.error ? "border-red-300" : "border-green-300"}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              {statusInfo && React.createElement(statusInfo.icon, { className: `w-5 h-5 ${statusInfo.iconColor}` })}
              Resultado da Consulta
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {resultado.error ? (
              <Alert className="border-red-300 bg-red-50">
                <AlertDescription className="text-red-800">
                  {resultado.error}
                </AlertDescription>
              </Alert>
            ) : (
              <>
                {statusInfo && (
                  <div>
                    <Label className="text-xs font-medium text-gray-600">Status do Perfil</Label>
                    <Badge className={`${statusInfo.color} text-sm px-3 py-1 mt-1`}>
                      {resultado.status}
                    </Badge>
                  </div>
                )}

                {resultado.numero_liberacao && (
                  <div>
                    <Label className="text-xs font-medium text-gray-600">Número de Liberação</Label>
                    <p className="text-lg font-bold text-green-700">{resultado.numero_liberacao}</p>
                  </div>
                )}

                {resultado.consultas_adequadas_12_meses && (
                  <div>
                    <Label className="text-xs font-medium text-gray-600">Consultas Adequadas (12 meses)</Label>
                    <p className="text-base font-semibold text-blue-700">{resultado.consultas_adequadas_12_meses}</p>
                  </div>
                )}

                {resultado.mensagem && (
                  <Alert className="border-blue-300 bg-blue-50">
                    <AlertDescription className="text-sm text-blue-900">
                      <strong>Observações:</strong> {resultado.mensagem}
                    </AlertDescription>
                  </Alert>
                )}

                {resultado.validade && (
                  <Alert className="border-orange-300 bg-orange-50">
                    <AlertDescription className="text-sm text-orange-900">
                      <strong>Importante:</strong> {resultado.validade}
                    </AlertDescription>
                  </Alert>
                )}

                {resultado.status?.includes("ADEQUADO") && (
                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center gap-2 text-green-800">
                      <CheckCircle2 className="w-5 h-5" />
                      <p className="font-semibold">✅ Perfil aprovado para transporte</p>
                    </div>
                  </div>
                )}

                {resultado.status?.includes("DIVERGENTE") && (
                  <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                    <div className="flex items-center gap-2 text-red-800">
                      <XCircle className="w-5 h-5" />
                      <p className="font-semibold">⚠️ Perfil divergente - Orientar profissional a contatar a Buonny</p>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}