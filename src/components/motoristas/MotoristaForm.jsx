
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
import { Save, X, Upload, FileText, Loader2, Plus, CheckCircle, ChevronsUpDown, Check, Download } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { Alert, AlertDescription } from "@/components/ui/alert";
import VeiculoForm from "../veiculos/VeiculoForm";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { toUpperNoAccent } from "@/components/utils/textUtils";

const categoriaOptions = [
  { value: "A", label: "A" },
  { value: "B", label: "B" },
  { value: "C", label: "C" },
  { value: "D", label: "D" },
  { value: "E", label: "E" }
];

const statusOptions = [
  { value: "ativo", label: "Ativo" },
  { value: "inativo", label: "Inativo" },
  { value: "suspenso", label: "Suspenso" }
];

export default function MotoristaForm({ open, onClose, onSubmit, editingMotorista, veiculos: initialVeiculos }) {
  const [formData, setFormData] = useState({
    nome: "",
    cpf: "",
    rg: "",
    rg_orgao_emissor: "",
    rg_uf: "",
    data_nascimento: "",
    nome_pai: "",
    nome_mae: "",
    estado_civil: "",
    cnh: "",
    cnh_prontuario: "",
    categoria_cnh: "",
    cnh_emissao: "",
    vencimento_cnh: "",
    cnh_uf: "",
    cnh_documento_url: "",
    comprovante_endereco_url: "",
    telefone: "",
    celular: "",
    email: "",
    endereco: "",
    complemento: "",
    cep: "",
    bairro: "",
    cidade: "",
    uf: "",
    rntrc: "",
    pis_pasep: "",
    cartao_repom: "",
    cartao_pamcard: "",
    cartao_nddcargo: "",
    cartao_ticket_frete: "",
    referencia_pessoal_nome: "",
    referencia_pessoal_telefone: "",
    referencia_comercial_nome: "",
    referencia_comercial_telefone: "",
    status: "ativo",
    observacoes: "",
    cavalo_id: "",
    implemento1_id: "",
    implemento2_id: "",
    implemento3_id: ""
  });

  const [veiculos, setVeiculos] = useState(initialVeiculos || []);
  const [uploading, setUploading] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = React.useRef(null);

  const [openVeiculoCombo, setOpenVeiculoCombo] = useState({
    cavalo: false,
    implemento1: false,
    implemento2: false,
    implemento3: false
  });

  const [veiculoSearchTerm, setVeiculoSearchTerm] = useState({
    cavalo: "",
    implemento1: "",
    implemento2: "",
    implemento3: ""
  });

  const [placasEncontradas, setPlacasEncontradas] = useState({
    cavalo: null,
    implemento1: null,
    implemento2: null,
    implemento3: null
  });

  const [showVeiculoForm, setShowVeiculoForm] = useState(false);
  const [tipoVeiculoCadastro, setTipoVeiculoCadastro] = useState(null);
  const [placaParaCadastro, setPlacaParaCadastro] = useState("");

  useEffect(() => {
    if (editingMotorista) {
      setFormData({
        nome: editingMotorista.nome || "",
        cpf: editingMotorista.cpf || "",
        rg: editingMotorista.rg || "",
        rg_orgao_emissor: editingMotorista.rg_orgao_emissor || "",
        rg_uf: editingMotorista.rg_uf || "",
        data_nascimento: editingMotorista.data_nascimento || "",
        nome_pai: editingMotorista.nome_pai || "",
        nome_mae: editingMotorista.nome_mae || "",
        estado_civil: editingMotorista.estado_civil || "",
        cnh: editingMotorista.cnh || "",
        cnh_prontuario: editingMotorista.cnh_prontuario || "",
        categoria_cnh: editingMotorista.categoria_cnh || "",
        cnh_emissao: editingMotorista.cnh_emissao || "",
        vencimento_cnh: editingMotorista.vencimento_cnh || "",
        cnh_uf: editingMotorista.cnh_uf || "",
        cnh_documento_url: editingMotorista.cnh_documento_url || "",
        comprovante_endereco_url: editingMotorista.comprovante_endereco_url || "",
        telefone: editingMotorista.telefone || "",
        celular: editingMotorista.celular || "",
        email: editingMotorista.email || "",
        endereco: editingMotorista.endereco || "",
        complemento: editingMotorista.complemento || "",
        cep: editingMotorista.cep || "",
        bairro: editingMotorista.bairro || "",
        cidade: editingMotorista.cidade || "",
        uf: editingMotorista.uf || "",
        rntrc: editingMotorista.rntrc || "",
        pis_pasep: editingMotorista.pis_pasep || "",
        cartao_repom: editingMotorista.cartao_repom || "",
        cartao_pamcard: editingMotorista.cartao_pamcard || "",
        cartao_nddcargo: editingMotorista.cartao_nddcargo || "",
        cartao_ticket_frete: editingMotorista.cartao_ticket_frete || "",
        referencia_pessoal_nome: editingMotorista.referencia_pessoal_nome || "",
        referencia_pessoal_telefone: editingMotorista.referencia_pessoal_telefone || "",
        referencia_comercial_nome: editingMotorista.referencia_comercial_nome || "",
        referencia_comercial_telefone: editingMotorista.referencia_comercial_telefone || "",
        status: editingMotorista.status || "ativo",
        observacoes: editingMotorista.observacoes || "",
        cavalo_id: editingMotorista.cavalo_id || "",
        implemento1_id: editingMotorista.implemento1_id || "",
        implemento2_id: editingMotorista.implemento2_id || "",
        implemento3_id: editingMotorista.implemento3_id || ""
      });

      const cavalo = veiculos.find(v => v.id === editingMotorista.cavalo_id);
      const impl1 = veiculos.find(v => v.id === editingMotorista.implemento1_id);
      const impl2 = veiculos.find(v => v.id === editingMotorista.implemento2_id);
      const impl3 = veiculos.find(v => v.id === editingMotorista.implemento3_id);

      setVeiculoSearchTerm({
        cavalo: cavalo?.placa || "",
        implemento1: impl1?.placa || "",
        implemento2: impl2?.placa || "",
        implemento3: impl3?.placa || ""
      });

      setPlacasEncontradas({
        cavalo: cavalo || null,
        implemento1: impl1 || null,
        implemento2: impl2 || null,
        implemento3: impl3 || null
      });
    }
  }, [editingMotorista, veiculos]);

  const handleInputChange = (field, value) => {
    // Campos que devem ser transformados para maiúsculas sem acento
    const upperFields = [
      'nome', 'nome_pai', 'nome_mae', 'rg_orgao_emissor', 
      'endereco', 'complemento', 'bairro', 'cidade',
      'referencia_pessoal_nome', 'referencia_comercial_nome', 'observacoes'
    ];
    
    // Campos de UF sempre maiúsculos
    const ufFields = ['rg_uf', 'cnh_uf', 'uf'];
    
    if (upperFields.includes(field)) {
      value = toUpperNoAccent(value);
    } else if (ufFields.includes(field)) {
      value = value?.toUpperCase() || '';
    }
    
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const getFilteredVeiculos = (tipo) => {
    const searchTerm = veiculoSearchTerm[tipo];
    if (!searchTerm || searchTerm.length < 2) return [];

    const searchNormalized = searchTerm.toUpperCase().replace(/[^A-Z0-9]/g, '');
    
    let veiculosFiltrados = veiculos;
    if (tipo === 'cavalo') {
      veiculosFiltrados = veiculos.filter(v => v.tipo === "cavalo");
    } else {
      veiculosFiltrados = veiculos.filter(v => v.tipo === "semi-reboque" || v.tipo === "carreta");
    }

    return veiculosFiltrados.filter(v =>
      v.placa?.toUpperCase().replace(/[^A-Z0-9]/g, '').includes(searchNormalized)
    );
  };

  const handleVeiculoSelect = (tipo, veiculoId) => {
    const veiculo = veiculos.find(v => v.id === veiculoId);

    if (veiculo) {
      handleInputChange(`${tipo}_id`, veiculo.id);
      setVeiculoSearchTerm(prev => ({ ...prev, [tipo]: veiculo.placa }));
      setPlacasEncontradas(prev => ({ ...prev, [tipo]: veiculo }));
      setOpenVeiculoCombo(prev => ({ ...prev, [tipo]: false }));
    }
  };

  const handleVeiculoClear = (tipo) => {
    handleInputChange(`${tipo}_id`, "");
    setVeiculoSearchTerm(prev => ({ ...prev, [tipo]: "" }));
    setPlacasEncontradas(prev => ({ ...prev, [tipo]: null }));
  };

  const abrirCadastroVeiculo = (tipo, placa) => {
    setTipoVeiculoCadastro(tipo);
    setPlacaParaCadastro(placa);
    setShowVeiculoForm(true);
  };

  const handleVeiculoCadastrado = async (novoVeiculo) => {
    try {
      const veiculosAtualizados = await base44.entities.Veiculo.list();
      setVeiculos(veiculosAtualizados);
      
      const veiculoCriado = veiculosAtualizados.find(v => v.placa === novoVeiculo.placa);
      
      if (veiculoCriado) {
        setPlacasEncontradas(prev => ({ 
          ...prev, 
          [tipoVeiculoCadastro]: veiculoCriado 
        }));
        handleInputChange(
          `${tipoVeiculoCadastro}_id`, 
          veiculoCriado.id
        );
      }
      
      setShowVeiculoForm(false);
      setTipoVeiculoCadastro(null);
      setPlacaParaCadastro("");
    } catch (error) {
      console.error("Erro ao atualizar veículos:", error);
    }
  };

  const handleCNHUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setExtracting(true);
    setError(null);

    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      
      setFormData(prev => ({ ...prev, cnh_documento_url: file_url }));

      const cnhSchema = {
        type: "object",
        properties: {
          nome: { type: "string", description: "Nome completo do motorista" },
          cpf: { type: "string", description: "CPF do motorista no formato 000.000.000-00" },
          rg: { type: "string", description: "RG do motorista" },
          data_nascimento: { type: "string", description: "Data de nascimento no formato YYYY-MM-DD" },
          nome_pai: { type: "string", description: "Nome do pai" },
          nome_mae: { type: "string", description: "Nome da mãe" },
          cnh: { type: "string", description: "Número da CNH (Nº Registro)" },
          categoria_cnh: { type: "string", description: "Categoria da CNH (A, B, C, D, E ou combinações)" },
          vencimento_cnh: { type: "string", description: "Data de validade da CNH no formato YYYY-MM-DD" },
          endereco: { type: "string", description: "Endereço completo do motorista" },
          cep: { type: "string", description: "CEP" },
          cidade: { type: "string", description: "Cidade" },
          uf: { type: "string", description: "UF" }
        }
      };

      const result = await base44.integrations.Core.ExtractDataFromUploadedFile({
        file_url,
        json_schema: cnhSchema
      });

      if (result.status === "success" && result.output) {
        const extractedData = result.output;
        
        setFormData(prev => ({
          ...prev,
          nome: extractedData.nome || prev.nome,
          cpf: extractedData.cpf || prev.cpf,
          rg: extractedData.rg || prev.rg,
          data_nascimento: extractedData.data_nascimento || prev.data_nascimento,
          nome_pai: extractedData.nome_pai || prev.nome_pai,
          nome_mae: extractedData.nome_mae || prev.nome_mae,
          cnh: extractedData.cnh || prev.cnh,
          categoria_cnh: extractedData.categoria_cnh?.charAt(0) || prev.categoria_cnh,
          vencimento_cnh: extractedData.vencimento_cnh || prev.vencimento_cnh,
          endereco: extractedData.endereco || prev.endereco,
          cep: extractedData.cep || prev.cep,
          cidade: extractedData.cidade || prev.cidade,
          uf: extractedData.uf || prev.uf
        }));
      } else {
        setError("Não foi possível extrair os dados da CNH. Por favor, preencha manualmente.");
      }
    } catch (err) {
      console.error("Erro ao processar CNH:", err);
      setError("Erro ao processar o arquivo da CNH. Por favor, tente novamente ou preencha manualmente.");
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
    onSubmit(formData);
  };

  const isFormValid = () => {
    return formData.nome && formData.cpf && formData.cnh && 
           formData.categoria_cnh && formData.celular;
  };

  const renderPlacaInput = (tipo, label) => {
    const veiculoEncontrado = placasEncontradas[tipo];

    return (
      <div>
        <Label htmlFor={tipo}>{label}</Label>
        <Popover 
          open={openVeiculoCombo[tipo]} 
          onOpenChange={(open) => setOpenVeiculoCombo(prev => ({ ...prev, [tipo]: open }))}
        >
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={openVeiculoCombo[tipo]}
              className={cn(
                "w-full justify-between",
                veiculoEncontrado ? "border-green-500 bg-green-50" : ""
              )}
            >
              {veiculoEncontrado ? (
                <span className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  {veiculoEncontrado.placa}
                </span>
              ) : (
                <span className="text-gray-500">Busque ou digite a placa...</span>
              )}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
            <Command shouldFilter={false}>
              <CommandInput
                placeholder="Digite a placa (ex: ABC1234)..."
                value={veiculoSearchTerm[tipo]}
                onValueChange={(value) => setVeiculoSearchTerm(prev => ({ ...prev, [tipo]: value.toUpperCase() }))}
              />
              <CommandList>
                <CommandEmpty>
                  {veiculoSearchTerm[tipo].length < 2 ? (
                    "Digite pelo menos 2 caracteres para buscar"
                  ) : (
                    <div className="p-4 text-center">
                      <p className="text-sm text-gray-600 mb-3">Nenhum veículo encontrado</p>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setOpenVeiculoCombo(prev => ({ ...prev, [tipo]: false }));
                          abrirCadastroVeiculo(tipo, veiculoSearchTerm[tipo]);
                        }}
                        className="w-full bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Cadastrar {label}
                      </Button>
                    </div>
                  )}
                </CommandEmpty>
                <CommandGroup>
                  {getFilteredVeiculos(tipo).slice(0, 10).map((veiculo) => (
                    <CommandItem
                      key={veiculo.id}
                      value={veiculo.id}
                      onSelect={() => handleVeiculoSelect(tipo, veiculo.id)}
                      className="cursor-pointer"
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          formData[`${tipo}_id`] === veiculo.id ? "opacity-100" : "opacity-0"
                        )}
                      />
                      <div className="flex flex-col">
                        <span className="font-medium">{veiculo.placa}</span>
                        <span className="text-xs text-gray-500">
                          {veiculo.marca} {veiculo.modelo}
                        </span>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>

        {veiculoEncontrado && (
          <div className="flex items-center justify-between mt-2">
            <p className="text-sm text-green-600 font-medium flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              {veiculoEncontrado.marca} {veiculoEncontrado.modelo}
            </p>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => handleVeiculoClear(tipo)}
              className="h-7 text-xs text-gray-500 hover:text-red-600"
            >
              <X className="w-3 h-3 mr-1" />
              Limpar
            </Button>
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between w-full">
              <span>
                {editingMotorista ? "Editar Motorista" : "Novo Motorista"}
              </span>
              <div className="flex items-center gap-2">
                {formData.cnh_documento_url && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(formData.cnh_documento_url, '_blank')}
                    className="flex items-center gap-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-blue-200"
                  >
                    <Download className="w-4 h-4" />
                    CNH
                  </Button>
                )}
                {formData.comprovante_endereco_url && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(formData.comprovante_endereco_url, '_blank')}
                    className="flex items-center gap-2 text-green-600 hover:text-green-700 hover:bg-green-50 border-green-200"
                  >
                    <Download className="w-4 h-4" />
                    Comprovante
                  </Button>
                )}
              </div>
            </DialogTitle>
          </DialogHeader>

          <div className="mb-6">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 bg-gray-50 hover:bg-gray-100 transition-colors">
              <div className="text-center">
                <FileText className="w-12 h-12 mx-auto mb-3 text-blue-600" />
                <h3 className="text-lg font-semibold mb-2">Extrair Dados da CNH Digital</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Faça o upload do PDF ou imagem da CNH Digital para preencher automaticamente os dados
                </p>
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,image/*"
                  onChange={handleCNHUpload}
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
                      Processando CNH...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      {formData.cnh_documento_url ? "Atualizar CNH" : "Selecionar CNH Digital"}
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
                    <p className="font-medium text-blue-900">Extraindo dados da CNH...</p>
                    <p className="text-sm text-blue-700">Isso pode levar alguns segundos</p>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="border-t pt-4">
              <h3 className="text-lg font-semibold mb-4 text-gray-700">Dados Pessoais</h3>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="nome">Nome Completo *</Label>
                    <Input
                      id="nome"
                      value={formData.nome}
                      onChange={(e) => handleInputChange("nome", e.target.value)}
                      placeholder="Nome completo do motorista"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="data_nascimento">Data de Nascimento</Label>
                    <Input
                      id="data_nascimento"
                      type="date"
                      value={formData.data_nascimento}
                      onChange={(e) => handleInputChange("data_nascimento", e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="nome_pai">Nome do Pai</Label>
                    <Input
                      id="nome_pai"
                      value={formData.nome_pai}
                      onChange={(e) => handleInputChange("nome_pai", e.target.value)}
                      placeholder="Nome completo do pai"
                    />
                  </div>
                  <div>
                    <Label htmlFor="nome_mae">Nome da Mãe</Label>
                    <Input
                      id="nome_mae"
                      value={formData.nome_mae}
                      onChange={(e) => handleInputChange("nome_mae", e.target.value)}
                      placeholder="Nome completo da mãe"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="estado_civil">Estado Civil</Label>
                    <Select value={formData.estado_civil} onValueChange={(value) => handleInputChange("estado_civil", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="solteiro">Solteiro</SelectItem>
                        <SelectItem value="casado">Casado</SelectItem>
                        <SelectItem value="divorciado">Divorciado</SelectItem>
                        <SelectItem value="viúvo">Viúvo</SelectItem>
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
              </div>
            </div>

            <div className="border-t pt-4">
              <h3 className="text-lg font-semibold mb-4 text-gray-700">Documentação</h3>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="cpf">CPF *</Label>
                    <Input
                      id="cpf"
                      value={formData.cpf}
                      onChange={(e) => handleInputChange("cpf", e.target.value)}
                      placeholder="000.000.000-00"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="rg">RG</Label>
                    <Input
                      id="rg"
                      value={formData.rg}
                      onChange={(e) => handleInputChange("rg", e.target.value)}
                      placeholder="Número do RG"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="rg_orgao_emissor">Órgão Emissor RG</Label>
                    <Input
                      id="rg_orgao_emissor"
                      value={formData.rg_orgao_emissor}
                      onChange={(e) => handleInputChange("rg_orgao_emissor", e.target.value)}
                      placeholder="SSP, DETRAN, etc"
                    />
                  </div>
                  <div>
                    <Label htmlFor="rg_uf">UF RG</Label>
                    <Input
                      id="rg_uf"
                      value={formData.rg_uf}
                      onChange={(e) => handleInputChange("rg_uf", e.target.value)} // Transformation handled in handleInputChange
                      placeholder="SP"
                      maxLength={2}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-4">
                  <div>
                    <Label htmlFor="cnh">CNH *</Label>
                    <Input
                      id="cnh"
                      value={formData.cnh}
                      onChange={(e) => handleInputChange("cnh", e.target.value)}
                      placeholder="Número da CNH"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="cnh_prontuario">Prontuário</Label>
                    <Input
                      id="cnh_prontuario"
                      value={formData.cnh_prontuario}
                      onChange={(e) => handleInputChange("cnh_prontuario", e.target.value)}
                      placeholder="Prontuário"
                    />
                  </div>
                  <div>
                    <Label htmlFor="categoria_cnh">Categoria *</Label>
                    <Select value={formData.categoria_cnh} onValueChange={(value) => handleInputChange("categoria_cnh", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        {categoriaOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="cnh_uf">UF CNH</Label>
                    <Input
                      id="cnh_uf"
                      value={formData.cnh_uf}
                      onChange={(e) => handleInputChange("cnh_uf", e.target.value)} // Transformation handled in handleInputChange
                      placeholder="SP"
                      maxLength={2}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="cnh_emissao">Emissão CNH</Label>
                    <Input
                      id="cnh_emissao"
                      type="date"
                      value={formData.cnh_emissao}
                      onChange={(e) => handleInputChange("cnh_emissao", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="vencimento_cnh">Vencimento CNH</Label>
                    <Input
                      id="vencimento_cnh"
                      type="date"
                      value={formData.vencimento_cnh}
                      onChange={(e) => handleInputChange("vencimento_cnh", e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t pt-4">
              <h3 className="text-lg font-semibold mb-4 text-gray-700">Contato</h3>
              
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="telefone">Telefone</Label>
                    <Input
                      id="telefone"
                      value={formData.telefone}
                      onChange={(e) => handleInputChange("telefone", e.target.value)}
                      placeholder="(11) 3333-3333"
                    />
                  </div>
                  <div>
                    <Label htmlFor="celular">Celular *</Label>
                    <Input
                      id="celular"
                      value={formData.celular}
                      onChange={(e) => handleInputChange("celular", e.target.value)}
                      placeholder="(11) 99999-9999"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      placeholder="email@exemplo.com"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t pt-4">
              <h3 className="text-lg font-semibold mb-4 text-gray-700">Endereço</h3>
              
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-2">
                    <Label htmlFor="endereco">Endereço</Label>
                    <Input
                      id="endereco"
                      value={formData.endereco}
                      onChange={(e) => handleInputChange("endereco", e.target.value)}
                      placeholder="Rua, número"
                    />
                  </div>
                  <div>
                    <Label htmlFor="complemento">Complemento</Label>
                    <Input
                      id="complemento"
                      value={formData.complemento}
                      onChange={(e) => handleInputChange("complemento", e.target.value)}
                      placeholder="Apto, bloco..."
                    />
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-4">
                  <div>
                    <Label htmlFor="cep">CEP</Label>
                    <Input
                      id="cep"
                      value={formData.cep}
                      onChange={(e) => handleInputChange("cep", e.target.value)}
                      placeholder="00000-000"
                    />
                  </div>
                  <div>
                    <Label htmlFor="bairro">Bairro</Label>
                    <Input
                      id="bairro"
                      value={formData.bairro}
                      onChange={(e) => handleInputChange("bairro", e.target.value)}
                      placeholder="Bairro"
                    />
                  </div>
                  <div>
                    <Label htmlFor="cidade">Cidade</Label>
                    <Input
                      id="cidade"
                      value={formData.cidade}
                      onChange={(e) => handleInputChange("cidade", e.target.value)}
                      placeholder="Cidade"
                    />
                  </div>
                  <div>
                    <Label htmlFor="uf">UF</Label>
                    <Input
                      id="uf"
                      value={formData.uf}
                      onChange={(e) => handleInputChange("uf", e.target.value)} // Transformation handled in handleInputChange
                      placeholder="SP"
                      maxLength={2}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t pt-4">
              <h3 className="text-lg font-semibold mb-4 text-gray-700">Informações Profissionais</h3>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="rntrc">RNTRC</Label>
                    <Input
                      id="rntrc"
                      value={formData.rntrc}
                      onChange={(e) => handleInputChange("rntrc", e.target.value)}
                      placeholder="Número RNTRC"
                    />
                  </div>
                  <div>
                    <Label htmlFor="pis_pasep">PIS/PASEP</Label>
                    <Input
                      id="pis_pasep"
                      value={formData.pis_pasep}
                      onChange={(e) => handleInputChange("pis_pasep", e.target.value)}
                      placeholder="Número PIS/PASEP"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="cartao_repom">Cartão REPOM</Label>
                    <Input
                      id="cartao_repom"
                      value={formData.cartao_repom}
                      onChange={(e) => handleInputChange("cartao_repom", e.target.value)}
                      placeholder="Número do cartão"
                    />
                  </div>
                  <div>
                    <Label htmlFor="cartao_pamcard">Cartão PAMCARD</Label>
                    <Input
                      id="cartao_pamcard"
                      value={formData.cartao_pamcard}
                      onChange={(e) => handleInputChange("cartao_pamcard", e.target.value)}
                      placeholder="Número do cartão"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="cartao_nddcargo">Cartão NDDCargo</Label>
                    <Input
                      id="cartao_nddcargo"
                      value={formData.cartao_nddcargo}
                      onChange={(e) => handleInputChange("cartao_nddcargo", e.target.value)}
                      placeholder="Número do cartão"
                    />
                  </div>
                  <div>
                    <Label htmlFor="cartao_ticket_frete">Cartão Ticket Frete</Label>
                    <Input
                      id="cartao_ticket_frete"
                      value={formData.cartao_ticket_frete}
                      onChange={(e) => handleInputChange("cartao_ticket_frete", e.target.value)}
                      placeholder="Número do cartão"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t pt-4">
              <h3 className="text-lg font-semibold mb-4 text-gray-700">Referências</h3>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="referencia_pessoal_nome">Nome Referência Pessoal</Label>
                    <Input
                      id="referencia_pessoal_nome"
                      value={formData.referencia_pessoal_nome}
                      onChange={(e) => handleInputChange("referencia_pessoal_nome", e.target.value)}
                      placeholder="Nome"
                    />
                  </div>
                  <div>
                    <Label htmlFor="referencia_pessoal_telefone">Telefone Referência Pessoal</Label>
                    <Input
                      id="referencia_pessoal_telefone"
                      value={formData.referencia_pessoal_telefone}
                      onChange={(e) => handleInputChange("referencia_pessoal_telefone", e.target.value)}
                      placeholder="Telefone"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="referencia_comercial_nome">Nome Referência Comercial</Label>
                    <Input
                      id="referencia_comercial_nome"
                      value={formData.referencia_comercial_nome}
                      onChange={(e) => handleInputChange("referencia_comercial_nome", e.target.value)}
                      placeholder="Nome"
                    />
                  </div>
                  <div>
                    <Label htmlFor="referencia_comercial_telefone">Telefone Referência Comercial</Label>
                    <Input
                      id="referencia_comercial_telefone"
                      value={formData.referencia_comercial_telefone}
                      onChange={(e) => handleInputChange("referencia_comercial_telefone", e.target.value)}
                      placeholder="Telefone"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t pt-4">
              <h3 className="text-lg font-semibold mb-4 text-gray-700">Veículos Vinculados</h3>
              
              <div className="space-y-4">
                {renderPlacaInput("cavalo", "Cavalo")}

                <div className="grid grid-cols-3 gap-4">
                  {renderPlacaInput("implemento1", "Implemento 1")}
                  {renderPlacaInput("implemento2", "Implemento 2")}
                  {renderPlacaInput("implemento3", "Implemento 3")}
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="observacoes">Observações</Label>
              <Textarea
                id="observacoes"
                value={formData.observacoes}
                onChange={(e) => handleInputChange("observacoes", e.target.value)}
                placeholder="Observações sobre o motorista"
                rows={3}
              />
            </div>
          </form>

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
              {editingMotorista ? "Atualizar" : "Cadastrar"} Motorista
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {showVeiculoForm && (
        <VeiculoForm
          open={showVeiculoForm}
          onClose={() => {
            setShowVeiculoForm(false);
            setTipoVeiculoCadastro(null);
            setPlacaParaCadastro("");
          }}
          onSubmit={async (veiculoData) => {
            try {
              const novoVeiculo = await base44.entities.Veiculo.create({
                ...veiculoData,
                placa: placaParaCadastro || veiculoData.placa
              });
              handleVeiculoCadastrado(novoVeiculo);
            } catch (error) {
              console.error("Erro ao cadastrar veículo:", error);
            }
          }}
          editingVeiculo={null}
          placaInicial={placaParaCadastro}
          tipoInicial={tipoVeiculoCadastro === 'cavalo' ? 'cavalo' : 'semi-reboque'}
        />
      )}
    </>
  );
}
