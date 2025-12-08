
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Save, X, Upload, FileText, Loader2, Search, CheckCircle, AlertCircle, Info } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toUpperNoAccent, formatPlaca } from "@/components/utils/textUtils";

const tipoOptions = [
  { value: "cavalo", label: "Cavalo" },
  { value: "carreta", label: "Carreta" },
  { value: "semi-reboque", label: "Semi-Reboque" },
  { value: "truck", label: "Truck" },
  { value: "van", label: "Van" }
];

const statusOptions = [
  { value: "disponível", label: "Disponível" },
  { value: "em_uso", label: "Em Uso" },
  { value: "manutenção", label: "Manutenção" },
  { value: "inativo", label: "Inativo" }
];

const combustivelOptions = [
  { value: "diesel", label: "Diesel" },
  { value: "gasolina", label: "Gasolina" },
  { value: "flex", label: "Flex" },
  { value: "eletrico", label: "Elétrico" },
  { value: "gnv", label: "GNV" }
];

export default function VeiculoForm({ open, onClose, onSubmit, editingVeiculo, placaInicial, tipoInicial }) {
  const [formData, setFormData] = useState({
    placa: "",
    tipo: "",
    marca: "",
    modelo: "",
    ano_fabricacao: "",
    ano_modelo: "",
    cor: "",
    renavam: "",
    chassi: "",
    capacidade_carga: "",
    cmt: "",
    peso_bruto_total: "",
    eixos: "",
    potencia: "",
    combustivel: "",
    categoria: "",
    especie_tipo: "",
    carroceria: "",
    status: "disponível",
    proprietario: "",
    proprietario_documento: "",
    vencimento_licenciamento: "",
    observacoes: "",
    crlv_documento_url: "",
    antt_rntrc: "",
    antt_situacao: "",
    antt_transportador: "",
    antt_apto_transporte: false,
    antt_cadastrado_frota: false,
    antt_tipo_veiculo: "",
    antt_municipio: "",
    antt_uf: "",
    antt_abertura_data: "",
    antt_validade_data: "",
    antt_mensagem: "",
    antt_ultima_consulta: ""
  });

  const [uploading, setUploading] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [consultingANTT, setConsultingANTT] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = React.useRef(null);
  const [activeTab, setActiveTab] = useState("dados_gerais");

  useEffect(() => {
    if (editingVeiculo) {
      setFormData({
        placa: editingVeiculo.placa || "",
        tipo: editingVeiculo.tipo || "",
        marca: editingVeiculo.marca || "",
        modelo: editingVeiculo.modelo || "",
        ano_fabricacao: editingVeiculo.ano_fabricacao || "",
        ano_modelo: editingVeiculo.ano_modelo || "",
        cor: editingVeiculo.cor || "",
        renavam: editingVeiculo.renavam || "",
        chassi: editingVeiculo.chassi || "",
        capacidade_carga: editingVeiculo.capacidade_carga || "",
        cmt: editingVeiculo.cmt || "",
        peso_bruto_total: editingVeiculo.peso_bruto_total || "",
        eixos: editingVeiculo.eixos || "",
        potencia: editingVeiculo.potencia || "",
        combustivel: editingVeiculo.combustivel || "",
        categoria: editingVeiculo.categoria || "",
        especie_tipo: editingVeiculo.especie_tipo || "",
        carroceria: editingVeiculo.carroceria || "",
        status: editingVeiculo.status || "disponível",
        proprietario: editingVeiculo.proprietario || "",
        proprietario_documento: editingVeiculo.proprietario_documento || "",
        vencimento_licenciamento: editingVeiculo.vencimento_licenciamento || "",
        observacoes: editingVeiculo.observacoes || "",
        crlv_documento_url: editingVeiculo.crlv_documento_url || "",
        antt_rntrc: editingVeiculo.antt_rntrc || "",
        antt_situacao: editingVeiculo.antt_situacao || "",
        antt_transportador: editingVeiculo.antt_transportador || "",
        antt_apto_transporte: editingVeiculo.antt_apto_transporte || false,
        antt_cadastrado_frota: editingVeiculo.antt_cadastrado_frota || false,
        antt_tipo_veiculo: editingVeiculo.antt_tipo_veiculo || "",
        antt_municipio: editingVeiculo.antt_municipio || "",
        antt_uf: editingVeiculo.antt_uf || "",
        antt_abertura_data: editingVeiculo.antt_abertura_data || "",
        antt_validade_data: editingVeiculo.antt_validade_data || "",
        antt_mensagem: editingVeiculo.antt_mensagem || "",
        antt_ultima_consulta: editingVeiculo.antt_ultima_consulta || ""
      });
    } else if (placaInicial || tipoInicial) {
      setFormData(prev => ({
        ...prev,
        placa: placaInicial || "",
        tipo: tipoInicial || ""
      }));
    }
  }, [editingVeiculo, placaInicial, tipoInicial]);

  const handleInputChange = (field, value) => {
    // Campos que devem ser transformados para maiúsculas sem acento
    const upperFields = [
      'marca', 'modelo', 'cor', 'chassi', 'categoria',
      'especie_tipo', 'carroceria', 'proprietario', 'observacoes'
    ];

    if (field === 'placa') {
      value = formatPlaca(value);
    } else if (upperFields.includes(field)) {
      value = toUpperNoAccent(value);
    }

    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleConsultarANTT = async () => {
    if (!formData.placa) {
      setError("É necessário informar a placa do veículo para consultar a ANTT");
      return;
    }

    if (!formData.proprietario_documento) {
      setError("É necessário informar o CPF/CNPJ do proprietário para consultar a ANTT");
      return;
    }

    setConsultingANTT(true);
    setError(null);

    try {
      // Limpar placa e documento
      const placaLimpa = formData.placa.replace(/[^A-Z0-9]/g, '');
      const documentoLimpo = formData.proprietario_documento.replace(/\D/g, '');

      // Determinar se é CPF ou CNPJ
      const isCNPJ = documentoLimpo.length === 14;

      // IMPORTANTE: Esta consulta precisa ser feita através de uma Backend Function
      // pois não podemos expor o token da API no frontend

      // Por enquanto, vou simular a consulta usando InvokeLLM para estruturar os dados
      // Em produção, você precisará criar uma Backend Function específica

      const prompt = `Consulte as informações da ANTT para o veículo de placa ${placaLimpa} e ${isCNPJ ? 'CNPJ' : 'CPF'} ${documentoLimpo}.

      Use a API: https://api.infosimples.com/api/v2/consultas/antt/veiculo
      Parâmetros: placa=${placaLimpa}&${isCNPJ ? 'cnpj' : 'cpf'}=${documentoLimpo}

      IMPORTANTE: Esta é uma simulação. Em produção, você precisa criar uma Backend Function para fazer esta chamada de forma segura.`;

      // Alertar o usuário que precisa de Backend Functions
      setError("⚠️ ATENÇÃO: Para usar esta funcionalidade, é necessário habilitar Backend Functions no seu app. Entre em contato com a equipe do Base44 através do botão de feedback para solicitar a habilitação. Por enquanto, preencha os dados manualmente.");

      // Em produção, a chamada seria algo como:
      // const response = await base44.functions.consultarANTT({ placa: placaLimpa, documento: documentoLimpo });

    } catch (err) {
      console.error("Erro ao consultar ANTT:", err);
      setError("Erro ao consultar a ANTT. Por favor, tente novamente ou preencha os dados manualmente.");
    } finally {
      setConsultingANTT(false);
    }
  };

  const handleCRLVUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setExtracting(true);
    setError(null);

    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });

      const crlvSchema = {
        type: "object",
        properties: {
          placa: {
            type: "string",
            description: "Placa do veículo"
          },
          marca_modelo: {
            type: "string",
            description: "Marca, modelo e versão do veículo"
          },
          especie_tipo: {
            type: "string",
            description: "Espécie e tipo do veículo (ex: TRACAO CAMINHAO TRATOR, CARGA SEMI-REBOQUE)"
          },
          chassi: {
            type: "string",
            description: "Número do chassi"
          },
          cor: {
            type: "string",
            description: "Cor predominante do veículo"
          },
          ano_fabricacao: {
            type: "string",
            description: "Ano de fabricação"
          },
          ano_modelo: {
            type: "string",
            description: "Ano do modelo"
          },
          renavam: {
            type: "string",
            description: "Código RENAVAM"
          },
          combustivel: {
            type: "string",
            description: "Tipo de combustível"
          },
          categoria: {
            type: "string",
            description: "Categoria do veículo"
          },
          capacidade: {
            type: "string",
            description: "Capacidade do veículo em toneladas"
          },
          peso_bruto_total: {
            type: "string",
            description: "Peso bruto total"
          },
          cmt: {
            type: "string",
            description: "CMT - Capacidade Máxima de Tração"
          },
          eixos: {
            type: "string",
            description: "Número de eixos"
          },
          potencia: {
            type: "string",
            description: "Potência do motor"
          },
          carroceria: {
            type: "string",
            description: "Tipo de carroceria"
          },
          proprietario_nome: {
            type: "string",
            description: "Nome do proprietário"
          },
          proprietario_documento: {
            type: "string",
            description: "CPF ou CNPJ do proprietário"
          }
        }
      };

      const result = await base44.integrations.Core.ExtractDataFromUploadedFile({
        file_url,
        json_schema: crlvSchema
      });

      if (result.status === "success" && result.output) {
        const extractedData = result.output;

        let tipoVeiculo = "";
        if (extractedData.especie_tipo) {
          const especieLower = extractedData.especie_tipo.toLowerCase();
          if (especieLower.includes("trator") || especieLower.includes("caminhao trator")) {
            tipoVeiculo = "cavalo";
          } else if (especieLower.includes("semi-reboque") || especieLower.includes("reboque")) {
            tipoVeiculo = "semi-reboque";
          } else if (especieLower.includes("truck")) {
            tipoVeiculo = "truck";
          } else if (especieLower.includes("van")) {
            tipoVeiculo = "van";
          } else if (especieLower.includes("carreta")) {
            tipoVeiculo = "carreta";
          }
        }

        let marca = "";
        let modelo = "";
        if (extractedData.marca_modelo) {
          const partes = extractedData.marca_modelo.split(/[\/\s]/);
          marca = partes[0] || "";
          modelo = partes.slice(1).join(" ") || "";
        }

        let combustivel = "";
        if (extractedData.combustivel) {
          const combLower = extractedData.combustivel.toLowerCase();
          if (combLower.includes("diesel")) combustivel = "diesel";
          else if (combLower.includes("gasolina")) combustivel = "gasolina";
          else if (combLower.includes("flex")) combustivel = "flex";
          else if (combLower.includes("eletrico")) combustivel = "eletrico";
          else if (combLower.includes("gnv")) combustivel = "gnv";
        }

        setFormData(prev => ({
          ...prev,
          placa: extractedData.placa ? formatPlaca(extractedData.placa) : prev.placa,
          tipo: tipoVeiculo || prev.tipo,
          marca: extractedData.marca_modelo ? toUpperNoAccent(marca) : prev.marca,
          modelo: extractedData.marca_modelo ? toUpperNoAccent(modelo) : prev.modelo,
          ano_fabricacao: extractedData.ano_fabricacao || prev.ano_fabricacao,
          ano_modelo: extractedData.ano_modelo || prev.ano_modelo,
          cor: extractedData.cor ? toUpperNoAccent(extractedData.cor) : prev.cor,
          renavam: extractedData.renavam || prev.renavam,
          chassi: extractedData.chassi ? toUpperNoAccent(extractedData.chassi) : prev.chassi,
          capacidade_carga: extractedData.capacidade ? parseFloat(extractedData.capacidade) * 1000 : prev.capacidade_carga,
          cmt: extractedData.cmt || prev.cmt,
          peso_bruto_total: extractedData.peso_bruto_total || prev.peso_bruto_total,
          eixos: extractedData.eixos || prev.eixos,
          potencia: extractedData.potencia || prev.potencia,
          combustivel: combustivel || prev.combustivel,
          categoria: extractedData.categoria ? toUpperNoAccent(extractedData.categoria) : prev.categoria,
          especie_tipo: extractedData.especie_tipo ? toUpperNoAccent(extractedData.especie_tipo) : prev.especie_tipo,
          carroceria: extractedData.carroceria ? toUpperNoAccent(extractedData.carroceria) : prev.carroceria,
          proprietario: extractedData.proprietario_nome ? toUpperNoAccent(extractedData.proprietario_nome) : prev.proprietario,
          proprietario_documento: extractedData.proprietario_documento || prev.proprietario_documento,
          crlv_documento_url: file_url
        }));
      } else {
        setFormData(prev => ({ ...prev, crlv_documento_url: file_url }));
        setError("Não foi possível extrair os dados do CRLV. Por favor, preencha manualmente.");
      }
    } catch (err) {
      console.error("Erro ao processar CRLV:", err);
      setError("Erro ao processar o arquivo do CRLV. Por favor, tente novamente ou preencha manualmente.");
    } finally {
      setUploading(false);
      setExtracting(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const dataToSubmit = {
      ...formData,
      ano_fabricacao: formData.ano_fabricacao ? parseInt(formData.ano_fabricacao) : null,
      ano_modelo: formData.ano_modelo ? parseInt(formData.ano_modelo) : null,
      capacidade_carga: formData.capacidade_carga ? parseFloat(formData.capacidade_carga) : null,
      cmt: formData.cmt ? parseFloat(formData.cmt) : null,
      peso_bruto_total: formData.peso_bruto_total ? parseFloat(formData.peso_bruto_total) : null,
      eixos: formData.eixos ? parseInt(formData.eixos) : null
    };

    onSubmit(dataToSubmit);
  };

  const isFormValid = () => {
    return formData.placa && formData.tipo && formData.marca && formData.modelo;
  };

  const getStatusColor = () => {
    if (!formData.antt_situacao) return "gray";
    return formData.antt_situacao.toUpperCase() === "ATIVO" ? "green" : "red";
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>
              {editingVeiculo ? "Editar Veículo" : "Novo Veículo"}
            </span>
            {formData.crlv_documento_url && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => window.open(formData.crlv_documento_url, '_blank')}
                className="flex items-center gap-2"
              >
                <FileText className="w-4 h-4" />
                Baixar CRLV
              </Button>
            )}
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="dados_gerais">Dados Gerais</TabsTrigger>
            <TabsTrigger value="antt">Informações ANTT</TabsTrigger>
          </TabsList>

          <TabsContent value="dados_gerais" className="space-y-4">
            {!editingVeiculo && (
              <div className="mb-6">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 bg-gray-50 hover:bg-gray-100 transition-colors">
                  <div className="text-center">
                    <FileText className="w-12 h-12 mx-auto mb-3 text-blue-600" />
                    <h3 className="text-lg font-semibold mb-2">Extrair Dados do CRLV Digital</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Faça o upload do PDF do CRLV Digital para preencher automaticamente os dados
                    </p>

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,image/*"
                      onChange={handleCRLVUpload}
                      className="hidden"
                      disabled={uploading}
                    />

                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                      className="flex items-center gap-2 mx-auto"
                    >
                      {uploading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Processando CRLV...
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4" />
                          {formData.crlv_documento_url ? "Atualizar CRLV" : "Selecionar CRLV Digital"}
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                {error && (
                  <Alert variant="destructive" className="mt-4">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {extracting && (
                  <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                      <div>
                        <p className="font-medium text-blue-900">Extraindo dados do CRLV...</p>
                        <p className="text-sm text-blue-700">Isso pode levar alguns segundos</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="placa">Placa *</Label>
                  <Input
                    id="placa"
                    value={formData.placa}
                    onChange={(e) => handleInputChange("placa", e.target.value)}
                    placeholder="ABC-1234"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="tipo">Tipo *</Label>
                  <Select value={formData.tipo} onValueChange={(value) => handleInputChange("tipo", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      {tipoOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select value={formData.status} onValueChange={(value) => handleInputChange("status", value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="marca">Marca *</Label>
                  <Input
                    id="marca"
                    value={formData.marca}
                    onChange={(e) => handleInputChange("marca", e.target.value)}
                    placeholder="Volkswagen, Mercedes, etc."
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="modelo">Modelo *</Label>
                  <Input
                    id="modelo"
                    value={formData.modelo}
                    onChange={(e) => handleInputChange("modelo", e.target.value)}
                    placeholder="Modelo do veículo"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="ano_fabricacao">Ano Fabr.</Label>
                  <Input
                    id="ano_fabricacao"
                    type="number"
                    value={formData.ano_fabricacao}
                    onChange={(e) => handleInputChange("ano_fabricacao", e.target.value)}
                    placeholder="2020"
                  />
                </div>
                <div>
                  <Label htmlFor="ano_modelo">Ano Modelo</Label>
                  <Input
                    id="ano_modelo"
                    type="number"
                    value={formData.ano_modelo}
                    onChange={(e) => handleInputChange("ano_modelo", e.target.value)}
                    placeholder="2021"
                  />
                </div>
                <div>
                  <Label htmlFor="cor">Cor</Label>
                  <Input
                    id="cor"
                    value={formData.cor}
                    onChange={(e) => handleInputChange("cor", e.target.value)}
                    placeholder="Cor do veículo"
                  />
                </div>
                <div>
                  <Label htmlFor="combustivel">Combustível</Label>
                  <Select value={formData.combustivel} onValueChange={(value) => handleInputChange("combustivel", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      {combustivelOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="renavam">RENAVAM</Label>
                  <Input
                    id="renavam"
                    value={formData.renavam}
                    onChange={(e) => handleInputChange("renavam", e.target.value)}
                    placeholder="Código RENAVAM"
                  />
                </div>
                <div>
                  <Label htmlFor="chassi">Chassi</Label>
                  <Input
                    id="chassi"
                    value={formData.chassi}
                    onChange={(e) => handleInputChange("chassi", e.target.value)}
                    placeholder="Número do chassi"
                  />
                </div>
              </div>

              <div className="grid grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="capacidade_carga">Capacidade (kg)</Label>
                  <Input
                    id="capacidade_carga"
                    type="number"
                    value={formData.capacidade_carga}
                    onChange={(e) => handleInputChange("capacidade_carga", e.target.value)}
                    placeholder="kg"
                  />
                </div>
                <div>
                  <Label htmlFor="cmt">CMT</Label>
                  <Input
                    id="cmt"
                    type="number"
                    step="0.01"
                    value={formData.cmt}
                    onChange={(e) => handleInputChange("cmt", e.target.value)}
                    placeholder="CMT"
                  />
                </div>
                <div>
                  <Label htmlFor="peso_bruto_total">PBT (ton)</Label>
                  <Input
                    id="peso_bruto_total"
                    type="number"
                    step="0.01"
                    value={formData.peso_bruto_total}
                    onChange={(e) => handleInputChange("peso_bruto_total", e.target.value)}
                    placeholder="Toneladas"
                  />
                </div>
                <div>
                  <Label htmlFor="eixos">Eixos</Label>
                  <Input
                    id="eixos"
                    type="number"
                    value={formData.eixos}
                    onChange={(e) => handleInputChange("eixos", e.target.value)}
                    placeholder="Nº"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="potencia">Potência</Label>
                  <Input
                    id="potencia"
                    value={formData.potencia}
                    onChange={(e) => handleInputChange("potencia", e.target.value)}
                    placeholder="Ex: 530CV"
                  />
                </div>
                <div>
                  <Label htmlFor="carroceria">Carroceria</Label>
                  <Input
                    id="carroceria"
                    value={formData.carroceria}
                    onChange={(e) => handleInputChange("carroceria", e.target.value)}
                    placeholder="Tipo de carroceria"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="proprietario">Proprietário</Label>
                  <Input
                    id="proprietario"
                    value={formData.proprietario}
                    onChange={(e) => handleInputChange("proprietario", e.target.value)}
                    placeholder="Nome do proprietário"
                  />
                </div>
                <div>
                  <Label htmlFor="proprietario_documento">CPF/CNPJ Proprietário</Label>
                  <Input
                    id="proprietario_documento"
                    value={formData.proprietario_documento}
                    onChange={(e) => handleInputChange("proprietario_documento", e.target.value)}
                    placeholder="Documento do proprietário"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="vencimento_licenciamento">Vencimento do Licenciamento</Label>
                <Input
                  id="vencimento_licenciamento"
                  type="date"
                  value={formData.vencimento_licenciamento}
                  onChange={(e) => handleInputChange("vencimento_licenciamento", e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="observacoes">Observações</Label>
                <Textarea
                  id="observacoes"
                  value={formData.observacoes}
                  onChange={(e) => handleInputChange("observacoes", e.target.value)}
                  placeholder="Observações sobre o veículo"
                  rows={3}
                />
              </div>
            </form>
          </TabsContent>

          <TabsContent value="antt" className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <Info className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="font-medium text-blue-900">Consulta ANTT</p>
                    <p className="text-sm text-blue-700">Verifique a situação do veículo no sistema da ANTT</p>
                  </div>
                </div>
                <Button
                  type="button"
                  onClick={handleConsultarANTT}
                  disabled={consultingANTT || !formData.placa || !formData.proprietario_documento}
                  className={`${
                    formData.antt_situacao === "ATIVO" ? "bg-green-600 hover:bg-green-700" :
                    formData.antt_situacao ? "bg-red-600 hover:bg-red-700" :
                    "bg-blue-600 hover:bg-blue-700"
                  }`}
                >
                  {consultingANTT ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Consultando...
                    </>
                  ) : (
                    <>
                      <Search className="w-4 h-4 mr-2" />
                      Consultar ANTT
                    </>
                  )}
                </Button>
              </div>

              {error && (
                <Alert className="border-yellow-200 bg-yellow-50">
                  <AlertCircle className="h-4 w-4 text-yellow-600" />
                  <AlertDescription className="text-yellow-800">{error}</AlertDescription>
                </Alert>
              )}

              {formData.antt_situacao && (
                <>
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span>Status ANTT</span>
                        <Badge className={`${
                          formData.antt_situacao === "ATIVO" ? "bg-green-500" : "bg-red-500"
                        } text-white`}>
                          {formData.antt_situacao}
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-sm text-gray-600">RNTRC</Label>
                          <p className="font-medium">{formData.antt_rntrc || "-"}</p>
                        </div>
                        <div>
                          <Label className="text-sm text-gray-600">Tipo de Veículo</Label>
                          <p className="font-medium">{formData.antt_tipo_veiculo || "-"}</p>
                        </div>
                      </div>

                      <div>
                        <Label className="text-sm text-gray-600">Transportador</Label>
                        <p className="font-medium">{formData.antt_transportador || "-"}</p>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-sm text-gray-600">Município/UF</Label>
                          <p className="font-medium">
                            {formData.antt_municipio && formData.antt_uf
                              ? `${formData.antt_municipio}/${formData.antt_uf}`
                              : "-"}
                          </p>
                        </div>
                        <div>
                          <Label className="text-sm text-gray-600">Data de Abertura</Label>
                          <p className="font-medium">{formData.antt_abertura_data || "-"}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center gap-2">
                          {formData.antt_apto_transporte ? (
                            <CheckCircle className="w-5 h-5 text-green-500" />
                          ) : (
                            <AlertCircle className="w-5 h-5 text-red-500" />
                          )}
                          <span className="text-sm">
                            {formData.antt_apto_transporte
                              ? "Apto para transporte remunerado"
                              : "Não apto para transporte remunerado"}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          {formData.antt_cadastrado_frota ? (
                            <CheckCircle className="w-5 h-5 text-green-500" />
                          ) : (
                            <AlertCircle className="w-5 h-5 text-red-500" />
                          )}
                          <span className="text-sm">
                            {formData.antt_cadastrado_frota
                              ? "Cadastrado na frota"
                              : "Não cadastrado na frota"}
                          </span>
                        </div>
                      </div>

                      {formData.antt_mensagem && (
                        <div>
                          <Label className="text-sm text-gray-600">Mensagem ANTT</Label>
                          <div className="mt-2 p-3 bg-gray-50 rounded border border-gray-200">
                            <p className="text-sm text-gray-700">{formData.antt_mensagem}</p>
                          </div>
                        </div>
                      )}

                      {formData.antt_ultima_consulta && (
                        <div className="text-xs text-gray-500 text-right">
                          Última consulta: {new Date(formData.antt_ultima_consulta).toLocaleString('pt-BR')}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </>
              )}

              {!formData.antt_situacao && !error && (
                <div className="text-center py-12 text-gray-500">
                  <Search className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>Nenhuma consulta realizada ainda</p>
                  <p className="text-sm mt-1">Clique em "Consultar ANTT" para verificar a situação do veículo</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            <X className="w-4 h-4 mr-2" />
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!isFormValid()}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Save className="w-4 h-4 mr-2" />
            {editingVeiculo ? "Atualizar" : "Cadastrar"} Veículo
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
