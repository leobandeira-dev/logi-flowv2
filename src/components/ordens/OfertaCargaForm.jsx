
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Save, X, AlertCircle, Package } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { toUpperNoAccent } from "@/components/utils/textUtils";

const tipoVeiculoOptions = [
  { value: "RODOTREM", label: "RODOTREM" },
  { value: "TRUCK", label: "TRUCK" },
  { value: "CARRETA 5EIXOS", label: "CARRETA 5EIXOS" },
  { value: "CARRETA 6EIXOS", label: "CARRETA 6EIXOS" },
  { value: "CARRETA 7EIXOS", label: "CARRETA 7EIXOS" },
  { value: "BITREM", label: "BITREM" },
  { value: "CARRETA LOC", label: "CARRETA LOC" },
  { value: "PRANCHA", label: "PRANCHA" },
  { value: "BI-TRUCK", label: "BI-TRUCK" },
  { value: "FIORINO", label: "FIORINO" }
];

const tipoCarroceriaOptions = [
  { value: "SIDER", label: "SIDER" },
  { value: "PRANCHA", label: "PRANCHA" },
  { value: "GRADE BAIXA", label: "GRADE BAIXA" },
  { value: "GRADE ALTA", label: "GRADE ALTA" },
  { value: "BAU", label: "BAU" },
  { value: "EXTENSIVA", label: "EXTENSIVA" },
  { value: "CARRETA LOC", label: "CARRETA LOC" }
];

const meioSolicitacaoOptions = [
  { value: "email", label: "E-mail" },
  { value: "telefone", label: "Telefone" },
  { value: "whatsapp", label: "WhatsApp" },
  { value: "sistema", label: "Sistema" },
  { value: "presencial", label: "Presencial" }
];

const modalidadeCargaOptions = [
  { value: "normal", label: "Normal" },
  { value: "prioridade", label: "Prioridade" },
  { value: "expressa", label: "Expressa" }
];

const tipoOperacaoOptions = [
  { value: "FOB", label: "FOB" },
  { value: "CIF", label: "CIF" }
];

export default function OfertaCargaForm({ open, onClose, onSubmit }) {
  const [operacoes, setOperacoes] = useState([]);
  const [formData, setFormData] = useState({
    operacao_id: "",
    modalidade_carga: "normal",
    tipo_operacao: "FOB",
    solicitado_por: "",
    meio_solicitacao: "",
    cliente: "",
    cliente_cnpj: "",
    origem_cidade: "",
    origem_uf: "",
    destinatario: "",
    destinatario_cnpj: "",
    destino_cidade: "",
    destino_uf: "",
    produto: "",
    tipo_veiculo: "",
    tipo_carroceria: "",
    peso: "",
    valor_tonelada: "",
    frete_viagem: "",
    observacao_carga: ""
  });
  const [showValidation, setShowValidation] = useState(false);

  useEffect(() => {
    if (open) {
      loadOperacoes();
      resetForm();
    }
  }, [open]);

  const loadOperacoes = async () => {
    try {
      const operacoesData = await base44.entities.Operacao.list();
      setOperacoes(operacoesData.filter(op => op.ativo));
    } catch (error) {
      console.error("Erro ao carregar operações:", error);
    }
  };

  const resetForm = () => {
    setFormData({
      operacao_id: "",
      modalidade_carga: "normal",
      tipo_operacao: "FOB",
      solicitado_por: "",
      meio_solicitacao: "",
      cliente: "",
      cliente_cnpj: "",
      origem_cidade: "",
      origem_uf: "",
      destinatario: "",
      destinatario_cnpj: "",
      destino_cidade: "",
      destino_uf: "",
      produto: "",
      tipo_veiculo: "",
      tipo_carroceria: "",
      peso: "",
      valor_tonelada: "",
      frete_viagem: "",
      observacao_carga: ""
    });
    setShowValidation(false);
  };

  const handleInputChange = (field, value) => {
    // Campos que devem ser transformados para maiúsculas sem acento
    const upperFields = ['cliente', 'origem_cidade', 'destinatario', 'destino_cidade', 'produto', 'solicitado_por', 'observacao_carga'];
    
    // Campos de UF sempre maiúsculos
    const ufFields = ['origem_uf', 'destino_uf'];
    
    if (upperFields.includes(field)) {
      value = toUpperNoAccent(value);
    } else if (ufFields.includes(field)) {
      value = value?.toUpperCase() || '';
    }
    
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const isFormValid = () => {
    const hasPriceMethod = (!!formData.valor_tonelada && parseFloat(formData.valor_tonelada) > 0) ||
                          (!!formData.frete_viagem && parseFloat(formData.frete_viagem) > 0);
    
    return formData.operacao_id &&
           formData.cliente && 
           formData.origem_cidade && 
           formData.destino_cidade && 
           formData.produto && 
           parseFloat(formData.peso) > 0 &&
           hasPriceMethod;
  };

  const getFieldError = (fieldName) => {
    if (!showValidation) return null;

    switch(fieldName) {
      case 'operacao_id': return !formData.operacao_id ? 'Operação é obrigatória' : null;
      case 'cliente': return !formData.cliente ? 'Cliente é obrigatório' : null;
      case 'origem_cidade': return !formData.origem_cidade ? 'Cidade de origem é obrigatória' : null;
      case 'destino_cidade': return !formData.destino_cidade ? 'Cidade de destino é obrigatória' : null;
      case 'produto': return !formData.produto ? 'Produto é obrigatório' : null;
      case 'peso': return !formData.peso || parseFloat(formData.peso) <= 0 ? 'Peso é obrigatório e deve ser maior que zero' : null;
      case 'preco':
        const hasPriceMethod = (!!formData.valor_tonelada && parseFloat(formData.valor_tonelada) > 0) ||
                              (!!formData.frete_viagem && parseFloat(formData.frete_viagem) > 0);
        return !hasPriceMethod ? 'Informe Valor/Tonelada OU Frete Viagem' : null;
      default: return null;
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setShowValidation(true);

    if (!isFormValid()) {
      return;
    }

    // Calcular cliente_final baseado em tipo_operacao
    let clienteFinalNome = "";
    let clienteFinalCnpj = "";
    
    if (formData.tipo_operacao === "CIF") {
      // CIF: cliente é o remetente (quem envia)
      clienteFinalNome = formData.cliente;
      clienteFinalCnpj = formData.cliente_cnpj;
    } else if (formData.tipo_operacao === "FOB") {
      // FOB: cliente é o destinatário (quem recebe)
      clienteFinalNome = formData.destinatario || formData.destino_cidade;
      clienteFinalCnpj = formData.destinatario_cnpj;
    }

    const dataToSubmit = {
      ...formData,
      origem: formData.origem_cidade,
      destino: formData.destino_cidade,
      peso: parseFloat(formData.peso),
      valor_tonelada: formData.valor_tonelada ? parseFloat(formData.valor_tonelada) : null,
      frete_viagem: formData.frete_viagem ? parseFloat(formData.frete_viagem) : null,
      tipo_registro: "oferta",
      cliente_final_nome: clienteFinalNome,
      cliente_final_cnpj: clienteFinalCnpj
    };

    onSubmit(dataToSubmit);
    resetForm();
  };

  const valorTotal = (() => {
    const peso = parseFloat(formData.peso);
    const valorTonelada = parseFloat(formData.valor_tonelada);
    const freteViagem = parseFloat(formData.frete_viagem);

    if (freteViagem > 0) {
      return freteViagem;
    } else if (peso > 0 && valorTonelada > 0) {
      return (peso / 1000) * valorTonelada;
    }
    return 0;
  })();

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Package className="w-6 h-6 text-blue-600" />
            <DialogTitle>Nova Oferta de Carga</DialogTitle>
          </div>
          <p className="text-sm text-gray-500">
            Cadastro simplificado - Complete os dados quando definir motorista e veículo
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Dados Gerais */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900 border-b pb-2">Dados Gerais</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="operacao_id" className={getFieldError('operacao_id') ? 'text-red-600 font-semibold' : ''}>
                  Operação *
                  {getFieldError('operacao_id') && <span className="ml-2 text-xs">⚠️</span>}
                </Label>
                <Select value={formData.operacao_id} onValueChange={(value) => handleInputChange("operacao_id", value)}>
                  <SelectTrigger className={getFieldError('operacao_id') ? 'border-red-500 border-2 bg-red-50' : ''}>
                    <SelectValue placeholder="Selecione a operação" />
                  </SelectTrigger>
                  <SelectContent>
                    {operacoes.map((op) => (
                      <SelectItem key={op.id} value={op.id}>{op.nome}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {getFieldError('operacao_id') && <p className="text-xs text-red-600 mt-1 font-medium">{getFieldError('operacao_id')}</p>}
              </div>

              <div>
                <Label htmlFor="modalidade_carga">Modalidade da Carga</Label>
                <Select value={formData.modalidade_carga} onValueChange={(value) => handleInputChange("modalidade_carga", value)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {modalidadeCargaOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="tipo_operacao">Tipo Operação</Label>
                <Select value={formData.tipo_operacao} onValueChange={(value) => handleInputChange("tipo_operacao", value)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {tipoOperacaoOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="solicitado_por">Solicitado Por</Label>
                <Input 
                  id="solicitado_por" 
                  value={formData.solicitado_por} 
                  onChange={(e) => handleInputChange("solicitado_por", e.target.value)} 
                  placeholder="Nome"
                />
              </div>

              <div>
                <Label htmlFor="meio_solicitacao">Meio de Solicitação</Label>
                <Select value={formData.meio_solicitacao} onValueChange={(value) => handleInputChange("meio_solicitacao", value)}>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    {meioSolicitacaoOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Origem */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900 border-b pb-2">Origem (Remetente)</h3>
            
            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-3">
                <Label htmlFor="cliente" className={getFieldError('cliente') ? 'text-red-600 font-semibold' : ''}>
                  Cliente/Remetente *
                  {getFieldError('cliente') && <span className="ml-2 text-xs">⚠️</span>}
                </Label>
                <Input 
                  id="cliente" 
                  value={formData.cliente} 
                  onChange={(e) => handleInputChange("cliente", e.target.value)}
                  placeholder="Nome do cliente/remetente"
                  className={getFieldError('cliente') ? 'border-red-500 border-2 bg-red-50' : ''}
                />
                {getFieldError('cliente') && <p className="text-xs text-red-600 mt-1 font-medium">{getFieldError('cliente')}</p>}
              </div>

              <div className="col-span-3"> {/* New CNPJ field for Remetente */}
                <Label htmlFor="cliente_cnpj">CNPJ do Remetente</Label>
                <Input 
                  id="cliente_cnpj" 
                  value={formData.cliente_cnpj} 
                  onChange={(e) => handleInputChange("cliente_cnpj", e.target.value)}
                  placeholder="00.000.000/0000-00"
                />
              </div>

              <div className="col-span-2">
                <Label htmlFor="origem_cidade" className={getFieldError('origem_cidade') ? 'text-red-600 font-semibold' : ''}>
                  Cidade *
                  {getFieldError('origem_cidade') && <span className="ml-2 text-xs">⚠️</span>}
                </Label>
                <Input 
                  id="origem_cidade" 
                  value={formData.origem_cidade} 
                  onChange={(e) => handleInputChange("origem_cidade", e.target.value)}
                  placeholder="Cidade de origem"
                  className={getFieldError('origem_cidade') ? 'border-red-500 border-2 bg-red-50' : ''}
                />
                {getFieldError('origem_cidade') && <p className="text-xs text-red-600 mt-1 font-medium">{getFieldError('origem_cidade')}</p>}
              </div>

              <div>
                <Label htmlFor="origem_uf">UF</Label>
                <Input 
                  id="origem_uf" 
                  value={formData.origem_uf} 
                  onChange={(e) => handleInputChange("origem_uf", e.target.value)}
                  placeholder="SP"
                  maxLength={2}
                />
              </div>
            </div>
          </div>

          {/* Destino */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900 border-b pb-2">Destino (Destinatário)</h3>
            
            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-3">
                <Label htmlFor="destinatario">Cliente/Destinatário</Label>
                <Input 
                  id="destinatario" 
                  value={formData.destinatario} 
                  onChange={(e) => handleInputChange("destinatario", e.target.value)}
                  placeholder="Nome do destinatário"
                />
              </div>

              <div className="col-span-3"> {/* New CNPJ field for Destinatário */}
                <Label htmlFor="destinatario_cnpj">CNPJ do Destinatário</Label>
                <Input 
                  id="destinatario_cnpj" 
                  value={formData.destinatario_cnpj} 
                  onChange={(e) => handleInputChange("destinatario_cnpj", e.target.value)}
                  placeholder="00.000.000/0000-00"
                />
              </div>

              <div className="col-span-2">
                <Label htmlFor="destino_cidade" className={getFieldError('destino_cidade') ? 'text-red-600 font-semibold' : ''}>
                  Cidade *
                  {getFieldError('destino_cidade') && <span className="ml-2 text-xs">⚠️</span>}
                </Label>
                <Input 
                  id="destino_cidade" 
                  value={formData.destino_cidade} 
                  onChange={(e) => handleInputChange("destino_cidade", e.target.value)}
                  placeholder="Cidade de destino"
                  className={getFieldError('destino_cidade') ? 'border-red-500 border-2 bg-red-50' : ''}
                />
                {getFieldError('destino_cidade') && <p className="text-xs text-red-600 mt-1 font-medium">{getFieldError('destino_cidade')}</p>}
              </div>

              <div>
                <Label htmlFor="destino_uf">UF</Label>
                <Input 
                  id="destino_uf" 
                  value={formData.destino_uf} 
                  onChange={(e) => handleInputChange("destino_uf", e.target.value)}
                  placeholder="RJ"
                  maxLength={2}
                />
              </div>
            </div>
          </div>

          {/* Dados da Carga */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900 border-b pb-2">Dados da Carga</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label htmlFor="produto" className={getFieldError('produto') ? 'text-red-600 font-semibold' : ''}>
                  Produto *
                  {getFieldError('produto') && <span className="ml-2 text-xs">⚠️</span>}
                </Label>
                <Input 
                  id="produto" 
                  value={formData.produto} 
                  onChange={(e) => handleInputChange("produto", e.target.value)}
                  placeholder="Descrição do produto"
                  className={getFieldError('produto') ? 'border-red-500 border-2 bg-red-50' : ''}
                />
                {getFieldError('produto') && <p className="text-xs text-red-600 mt-1 font-medium">{getFieldError('produto')}</p>}
              </div>

              <div>
                <Label htmlFor="tipo_veiculo">Tipo de Veículo</Label>
                <Select value={formData.tipo_veiculo} onValueChange={(value) => handleInputChange("tipo_veiculo", value)}>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    {tipoVeiculoOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="tipo_carroceria">Tipo de Carroceria</Label>
                <Select value={formData.tipo_carroceria} onValueChange={(value) => handleInputChange("tipo_carroceria", value)}>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    {tipoCarroceriaOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {getFieldError('preco') && (
              <div className="p-3 bg-red-50 border-2 border-red-500 rounded-lg">
                <p className="text-sm text-red-700 font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />{getFieldError('preco')}
                </p>
              </div>
            )}

            <div className="grid grid-cols-4 gap-4">
              <div>
                <Label htmlFor="peso" className={getFieldError('peso') ? 'text-red-600 font-semibold' : ''}>
                  Peso (kg) *
                  {getFieldError('peso') && <span className="ml-2 text-xs">⚠️</span>}
                </Label>
                <Input 
                  id="peso" 
                  type="number" 
                  value={formData.peso} 
                  onChange={(e) => handleInputChange("peso", e.target.value)}
                  placeholder="0"
                  className={getFieldError('peso') ? 'border-red-500 border-2 bg-red-50' : ''}
                />
                {getFieldError('peso') && <p className="text-xs text-red-600 mt-1 font-medium">{getFieldError('peso')}</p>}
              </div>

              <div>
                <Label htmlFor="valor_tonelada" className={getFieldError('preco') ? 'text-orange-600 font-medium' : ''}>
                  Valor/Tonelada {getFieldError('preco') && <span className="ml-2 text-xs">⚠️</span>}
                </Label>
                <Input 
                  id="valor_tonelada" 
                  type="number" 
                  step="0.01" 
                  value={formData.valor_tonelada}
                  onChange={(e) => handleInputChange("valor_tonelada", e.target.value)}
                  placeholder="0.00"
                  disabled={!!formData.frete_viagem && parseFloat(formData.frete_viagem) > 0}
                  className={getFieldError('preco') ? 'border-orange-400 border-2 bg-orange-50' : ''}
                />
              </div>

              <div>
                <Label htmlFor="frete_viagem" className={getFieldError('preco') ? 'text-orange-600 font-medium' : ''}>
                  Frete Viagem {getFieldError('preco') && <span className="ml-2 text-xs">⚠️</span>}
                </Label>
                <Input 
                  id="frete_viagem" 
                  type="number" 
                  step="0.01" 
                  value={formData.frete_viagem}
                  onChange={(e) => handleInputChange("frete_viagem", e.target.value)}
                  placeholder="0.00"
                  disabled={!!formData.valor_tonelada && parseFloat(formData.valor_tonelada) > 0}
                  className={getFieldError('preco') ? 'border-orange-400 border-2 bg-orange-50' : ''}
                />
              </div>

              <div>
                <Label>Valor Total</Label>
                <div className="p-2 bg-green-50 border border-green-200 rounded text-sm font-bold text-green-700">
                  R$ {valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="observacao_carga">Observações</Label>
              <Textarea 
                id="observacao_carga" 
                value={formData.observacao_carga} 
                onChange={(e) => handleInputChange("observacao_carga", e.target.value)}
                placeholder="Informações adicionais sobre a carga"
                rows={3}
              />
            </div>
          </div>
        </form>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} type="button">
            <X className="w-4 h-4 mr-2" />
            Cancelar
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={showValidation && !isFormValid()}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Save className="w-4 h-4 mr-2" />
            Criar Oferta
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
