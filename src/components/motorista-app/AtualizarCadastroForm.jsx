
import React, { useState, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Upload,
  Loader2,
  CheckCircle2,
  AlertCircle,
  FileText,
  User,
  CreditCard,
  MapPin,
  Truck,
  Camera,
  Save,
  ChevronLeft,
  ChevronRight,
  X
} from 'lucide-react';
import { toast } from 'sonner';

const ETAPAS = [
  { id: 'cnh', titulo: 'CNH', icone: CreditCard, cor: 'blue' },
  { id: 'endereco', titulo: 'Endereço', icone: MapPin, cor: 'green' },
  { id: 'bancario', titulo: 'Dados Bancários', icone: CreditCard, cor: 'purple' },
  { id: 'referencias', titulo: 'Referências', icone: User, cor: 'orange' },
  { id: 'emergencia', titulo: 'Emergência', icone: AlertCircle, cor: 'red' },
  { id: 'veiculos', titulo: 'Veículos', icone: Truck, cor: 'indigo' },
  { id: 'confirmacao', titulo: 'Confirmar', icone: CheckCircle2, cor: 'green' }
];

export default function AtualizarCadastroForm({ open, onClose, motorista, onSuccess }) {
  const [etapaIndex, setEtapaIndex] = useState(0);
  const [extracting, setExtracting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [dadosExtraidos, setDadosExtraidos] = useState(false);
  
  const [dadosCNH, setDadosCNH] = useState({
    nome: motorista?.nome || '',
    cpf: motorista?.cpf || '',
    rg: motorista?.rg || '',
    rg_orgao_emissor: motorista?.rg_orgao_emissor || '',
    rg_uf: motorista?.rg_uf || '',
    data_nascimento: motorista?.data_nascimento || '',
    cnh: motorista?.cnh || '',
    categoria_cnh: motorista?.categoria_cnh || '',
    vencimento_cnh: motorista?.vencimento_cnh || '',
    cnh_uf: motorista?.cnh_uf || '',
    nome_mae: motorista?.nome_mae || '',
    celular: motorista?.celular || '',
    email: motorista?.email || '',
    cnh_documento_url: motorista?.cnh_documento_url || ''
  });

  const [dadosEndereco, setDadosEndereco] = useState({
    endereco: motorista?.endereco || '',
    complemento: motorista?.complemento || '',
    bairro: motorista?.bairro || '',
    cidade: motorista?.cidade || '',
    uf: motorista?.uf || '',
    cep: motorista?.cep || '',
    comprovante_endereco_url: motorista?.comprovante_endereco_url || ''
  });

  const [dadosBancarios, setDadosBancarios] = useState({
    banco: motorista?.banco || '',
    agencia: motorista?.agencia || '',
    conta: motorista?.conta || '',
    tipo_conta: motorista?.tipo_conta || 'corrente',
    pix: motorista?.pix || ''
  });

  const [referencias, setReferencias] = useState([
    {
      nome: motorista?.referencia_comercial_1_nome || '',
      telefone: motorista?.referencia_comercial_1_telefone || '',
      empresa: motorista?.referencia_comercial_1_empresa || ''
    },
    {
      nome: motorista?.referencia_comercial_2_nome || '',
      telefone: motorista?.referencia_comercial_2_telefone || '',
      empresa: motorista?.referencia_comercial_2_empresa || ''
    },
    {
      nome: motorista?.referencia_comercial_3_nome || '',
      telefone: motorista?.referencia_comercial_3_telefone || '',
      empresa: motorista?.referencia_comercial_3_empresa || ''
    }
  ]);

  const [emergencia, setEmergencia] = useState({
    nome: motorista?.contato_emergencia_nome || '',
    telefone: motorista?.contato_emergencia_telefone || '',
    parentesco: motorista?.contato_emergencia_parentesco || ''
  });

  const [veiculos, setVeiculos] = useState([]);
  const [veiculoAtual, setVeiculoAtual] = useState(null);

  const cnhInputRef = useRef(null);
  const comprovanteInputRef = useRef(null);
  const crlvInputRef = useRef(null);

  const etapaAtual = ETAPAS[etapaIndex];

  const converterData = (dataStr) => {
    if (!dataStr) return '';
    if (dataStr.includes('-')) return dataStr;
    
    const partes = dataStr.split('/');
    if (partes.length === 3) {
      const [dia, mes, ano] = partes;
      return `${ano}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}`;
    }
    return '';
  };

  const handleUploadCNH = async (file) => {
    if (!file) return;
    
    setExtracting(true);
    
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      
      const extractResult = await base44.integrations.Core.ExtractDataFromUploadedFile({
        file_url,
        json_schema: {
          type: "object",
          properties: {
            nome: { type: "string" },
            cpf: { type: "string" },
            rg: { type: "string" },
            rg_orgao_emissor: { type: "string" },
            rg_uf: { type: "string" },
            data_nascimento: { type: "string" },
            cnh: { type: "string" },
            categoria_cnh: { type: "string" },
            vencimento_cnh: { type: "string" },
            cnh_uf: { type: "string" },
            nome_mae: { type: "string" }
          }
        }
      });

      if (extractResult.status === 'success' && extractResult.output) {
        const dados = extractResult.output;
        
        setDadosCNH({
          ...dadosCNH,
          nome: dados.nome || dadosCNH.nome,
          cpf: dados.cpf?.replace(/\D/g, '') || dadosCNH.cpf,
          rg: dados.rg || dadosCNH.rg,
          rg_orgao_emissor: dados.rg_orgao_emissor || dadosCNH.rg_orgao_emissor,
          rg_uf: dados.rg_uf?.toUpperCase() || dadosCNH.rg_uf,
          data_nascimento: converterData(dados.data_nascimento) || dadosCNH.data_nascimento,
          cnh: dados.cnh?.replace(/\D/g, '') || dadosCNH.cnh,
          categoria_cnh: dados.categoria_cnh || dadosCNH.categoria_cnh,
          vencimento_cnh: converterData(dados.vencimento_cnh) || dadosCNH.vencimento_cnh,
          cnh_uf: dados.cnh_uf?.toUpperCase() || dadosCNH.cnh_uf,
          nome_mae: dados.nome_mae || dadosCNH.nome_mae,
          cnh_documento_url: file_url
        });
        
        setDadosExtraidos(true);
        toast.success('✅ Dados da CNH extraídos! Confirme ou edite abaixo.');
      } else {
        setDadosCNH({ ...dadosCNH, cnh_documento_url: file_url });
        setDadosExtraidos(true);
        toast.error('Não foi possível extrair dados. Preencha manualmente.');
      }
    } catch (error) {
      console.error('Erro ao processar CNH:', error);
      toast.error('Erro ao processar CNH.');
      setDadosExtraidos(true);
    } finally {
      setExtracting(false);
    }
  };

  const handleUploadComprovante = async (file) => {
    if (!file) return;
    
    setExtracting(true);
    
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      
      const extractResult = await base44.integrations.Core.ExtractDataFromUploadedFile({
        file_url,
        json_schema: {
          type: "object",
          properties: {
            endereco: { type: "string" },
            bairro: { type: "string" },
            cidade: { type: "string" },
            uf: { type: "string" },
            cep: { type: "string" }
          }
        }
      });

      if (extractResult.status === 'success' && extractResult.output) {
        const dados = extractResult.output;
        
        setDadosEndereco({
          ...dadosEndereco,
          endereco: dados.endereco || dadosEndereco.endereco,
          bairro: dados.bairro || dadosEndereco.bairro,
          cidade: dados.cidade || dadosEndereco.cidade,
          uf: dados.uf?.toUpperCase() || dadosEndereco.uf,
          cep: dados.cep?.replace(/\D/g, '') || dadosEndereco.cep,
          comprovante_endereco_url: file_url
        });
        
        setDadosExtraidos(true);
        toast.success('✅ Dados do endereço extraídos! Confirme ou edite abaixo.');
      } else {
        setDadosEndereco({ ...dadosEndereco, comprovante_endereco_url: file_url });
        setDadosExtraidos(true);
        toast.warning('Preencha os dados manualmente.');
      }
    } catch (error) {
      console.error('Erro ao processar comprovante:', error);
      toast.error('Erro ao processar comprovante.');
      setDadosExtraidos(true);
    } finally {
      setExtracting(false);
    }
  };

  const handleUploadCRLV = async (file) => {
    if (!file) return;
    
    setExtracting(true);
    
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      
      const extractResult = await base44.integrations.Core.ExtractDataFromUploadedFile({
        file_url,
        json_schema: {
          type: "object",
          properties: {
            placa: { type: "string" },
            marca: { type: "string" },
            modelo: { type: "string" },
            ano_fabricacao: { type: "number" },
            ano_modelo: { type: "number" },
            renavam: { type: "string" },
            chassi: { type: "string" },
            cor: { type: "string" },
            combustivel: { type: "string" },
            proprietario: { type: "string" },
            proprietario_documento: { type: "string" }
          }
        }
      });

      if (extractResult.status === 'success' && extractResult.output) {
        const dados = extractResult.output;
        
        setVeiculoAtual({
          placa: dados.placa?.toUpperCase().replace(/[^A-Z0-9]/g, '') || '',
          marca: dados.marca || '',
          modelo: dados.modelo || '',
          ano_fabricacao: dados.ano_fabricacao || null,
          ano_modelo: dados.ano_modelo || null,
          renavam: dados.renavam || '',
          chassi: dados.chassi || '',
          cor: dados.cor || '',
          combustivel: dados.combustivel?.toLowerCase() || '',
          proprietario: dados.proprietario || '',
          proprietario_documento: dados.proprietario_documento?.replace(/\D/g, '') || '',
          tipo: veiculos.length === 0 ? 'cavalo' : 'carreta',
          antt_numero: '',
          antt_validade: '',
          crlv_documento_url: file_url
        });
        
        setDadosExtraidos(true);
        toast.success('✅ Dados do veículo extraídos! Confirme ou edite abaixo.');
      } else {
        setVeiculoAtual({
          placa: '',
          marca: '',
          modelo: '',
          tipo: veiculos.length === 0 ? 'cavalo' : 'carreta',
          crlv_documento_url: file_url
        });
        setDadosExtraidos(true);
        toast.error('Não foi possível extrair dados. Preencha manualmente.');
      }
    } catch (error) {
      console.error('Erro ao processar CRLV:', error);
      toast.error('Erro ao processar CRLV.');
      setDadosExtraidos(true);
    } finally {
      setExtracting(false);
    }
  };

  const validarEtapa = () => {
    if (etapaAtual.id === 'cnh') {
      if (!dadosCNH.nome || !dadosCNH.cpf || !dadosCNH.cnh || !dadosCNH.categoria_cnh || !dadosCNH.celular) {
        toast.error('⚠️ Preencha todos os campos obrigatórios (*)');
        return false;
      }
    } else if (etapaAtual.id === 'endereco') {
      if (!dadosEndereco.endereco || !dadosEndereco.cidade || !dadosEndereco.uf || !dadosEndereco.cep) {
        toast.error('⚠️ Preencha todos os campos obrigatórios (*)');
        return false;
      }
    }
    return true;
  };

  const handleProximo = async () => {
    if (etapaAtual.id === 'veiculos' && veiculoAtual) {
      if (!veiculoAtual.placa || !veiculoAtual.marca || !veiculoAtual.modelo) {
        toast.error('⚠️ Preencha placa, marca e modelo antes de adicionar');
        return;
      }
      
      await handleAdicionarVeiculo();
      return;
    }

    if (!validarEtapa()) return;

    setDadosExtraidos(false);
    setVeiculoAtual(null); // Reset veiculoAtual on step change
    setEtapaIndex(prev => Math.min(prev + 1, ETAPAS.length - 1));
  };

  const handleVoltar = () => {
    setDadosExtraidos(false);
    setVeiculoAtual(null);
    setEtapaIndex(prev => Math.max(prev - 1, 0));
  };

  const handleAdicionarVeiculo = async () => {
    if (!veiculoAtual.placa || !veiculoAtual.marca || !veiculoAtual.modelo) {
      toast.error('⚠️ Preencha placa, marca e modelo');
      return;
    }

    try {
      const veiculoExistente = await base44.entities.Veiculo.filter({ placa: veiculoAtual.placa }, null, 1);
      
      let veiculoId;
      if (veiculoExistente.length > 0) {
        await base44.entities.Veiculo.update(veiculoExistente[0].id, veiculoAtual);
        veiculoId = veiculoExistente[0].id;
        toast.success('✅ Veículo atualizado!');
      } else {
        const novoVeiculo = await base44.entities.Veiculo.create(veiculoAtual);
        veiculoId = novoVeiculo.id;
        toast.success('✅ Veículo cadastrado!');
      }
      
      setVeiculos([...veiculos, { ...veiculoAtual, id: veiculoId }]);
      setVeiculoAtual(null);
      setDadosExtraidos(false);
    } catch (error) {
      console.error('Erro ao salvar veículo:', error);
      toast.error('Erro ao salvar veículo');
    }
  };

  const handleSalvarTudo = async () => {
    setSaving(true);
    try {
      const dadosCompletos = {
        ...dadosCNH,
        ...dadosEndereco,
        ...dadosBancarios,
        referencia_comercial_1_nome: referencias[0].nome,
        referencia_comercial_1_telefone: referencias[0].telefone,
        referencia_comercial_1_empresa: referencias[0].empresa,
        referencia_comercial_2_nome: referencias[1].nome,
        referencia_comercial_2_telefone: referencias[1].telefone,
        referencia_comercial_2_empresa: referencias[1].empresa,
        referencia_comercial_3_nome: referencias[2].nome,
        referencia_comercial_3_telefone: referencias[2].telefone,
        referencia_comercial_3_empresa: referencias[2].empresa,
        contato_emergencia_nome: emergencia.nome,
        contato_emergencia_telefone: emergencia.telefone,
        contato_emergencia_parentesco: emergencia.parentesco,
        cavalo_id: veiculos[0]?.id || null,
        implemento1_id: veiculos[1]?.id || null,
        implemento2_id: veiculos[2]?.id || null,
        implemento3_id: veiculos[3]?.id || null
      };

      if (motorista?.id) {
        await base44.entities.Motorista.update(motorista.id, dadosCompletos);
        toast.success('✅ Cadastro atualizado com sucesso!');
      } else {
        await base44.entities.Motorista.create(dadosCompletos);
        toast.success('✅ Cadastro criado com sucesso!');
      }

      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      console.error('Erro ao salvar cadastro:', error);
      toast.error('Erro ao salvar cadastro.');
    } finally {
      setSaving(false);
    }
  };

  const renderUploadArea = (titulo, descricao, inputRef, onUpload, icon = Camera) => {
    const Icon = icon;
    return (
      <div className="border-3 border-dashed border-blue-300 rounded-2xl p-12 bg-gradient-to-br from-blue-50 to-white hover:from-blue-100 hover:to-blue-50 transition-all">
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-blue-100 flex items-center justify-center">
            <Icon className="w-10 h-10 text-blue-600" />
          </div>
          <h3 className="font-bold text-xl mb-2 text-gray-900">{titulo}</h3>
          <p className="text-sm text-slate-600 mb-6">{descricao}</p>
          
          <input
            ref={inputRef}
            type="file"
            accept="image/*,.pdf"
            onChange={(e) => onUpload(e.target.files[0])}
            className="hidden"
          />
          
          <Button
            onClick={() => inputRef.current?.click()}
            disabled={extracting}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 text-base"
          >
            {extracting ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Processando documento...
              </>
            ) : (
              <>
                <Upload className="w-5 h-5 mr-2" />
                Selecionar Arquivo
              </>
            )}
          </Button>
        </div>
      </div>
    );
  };

  const renderEtapaCNH = () => {
    if (!dadosExtraidos) {
      return renderUploadArea(
        'Envie sua CNH',
        'Foto ou PDF - Extração automática de dados',
        cnhInputRef,
        handleUploadCNH,
        CreditCard
      );
    }

    return (
      <div className="space-y-4">
        <Alert className="bg-blue-50 border-blue-300">
          <CheckCircle2 className="h-5 w-5 text-blue-600" />
          <AlertDescription className="text-blue-900">
            <strong>Dados extraídos!</strong> Confirme ou edite as informações abaixo
          </AlertDescription>
        </Alert>

        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <Label className="flex items-center gap-1 text-sm font-semibold">
              Nome Completo <span className="text-red-600">*</span>
            </Label>
            <Input
              value={dadosCNH.nome}
              onChange={(e) => setDadosCNH({...dadosCNH, nome: e.target.value})}
              className={`mt-1 ${!dadosCNH.nome ? 'border-red-400 bg-red-50' : ''}`}
            />
          </div>

          <div>
            <Label className="flex items-center gap-1 text-sm font-semibold">
              CPF <span className="text-red-600">*</span>
            </Label>
            <Input
              value={dadosCNH.cpf}
              onChange={(e) => setDadosCNH({...dadosCNH, cpf: e.target.value.replace(/\D/g, '')})}
              maxLength={11}
              className={`mt-1 ${!dadosCNH.cpf ? 'border-red-400 bg-red-50' : ''}`}
            />
          </div>

          <div>
            <Label className="text-sm font-semibold">Data de Nascimento</Label>
            <Input
              type="date"
              value={dadosCNH.data_nascimento}
              onChange={(e) => setDadosCNH({...dadosCNH, data_nascimento: e.target.value})}
              className="mt-1"
            />
          </div>

          <div>
            <Label className="flex items-center gap-1 text-sm font-semibold">
              Número CNH <span className="text-red-600">*</span>
            </Label>
            <Input
              value={dadosCNH.cnh}
              onChange={(e) => setDadosCNH({...dadosCNH, cnh: e.target.value.replace(/\D/g, '')})}
              className={`mt-1 ${!dadosCNH.cnh ? 'border-red-400 bg-red-50' : ''}`}
            />
          </div>

          <div>
            <Label className="flex items-center gap-1 text-sm font-semibold">
              Categoria <span className="text-red-600">*</span>
            </Label>
            <Select value={dadosCNH.categoria_cnh} onValueChange={(value) => setDadosCNH({...dadosCNH, categoria_cnh: value})}>
              <SelectTrigger className={`mt-1 ${!dadosCNH.categoria_cnh ? 'border-red-400 bg-red-50' : ''}`}>
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                {['A', 'B', 'C', 'D', 'E'].map(cat => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-sm font-semibold">Vencimento CNH</Label>
            <Input
              type="date"
              value={dadosCNH.vencimento_cnh}
              onChange={(e) => setDadosCNH({...dadosCNH, vencimento_cnh: e.target.value})}
              className="mt-1"
            />
          </div>

          <div>
            <Label className="flex items-center gap-1 text-sm font-semibold">
              Celular <span className="text-red-600">*</span>
            </Label>
            <Input
              value={dadosCNH.celular}
              onChange={(e) => setDadosCNH({...dadosCNH, celular: e.target.value})}
              placeholder="(00) 00000-0000"
              className={`mt-1 ${!dadosCNH.celular ? 'border-red-400 bg-red-50' : ''}`}
            />
          </div>

          <div>
            <Label className="text-sm font-semibold">Email</Label>
            <Input
              type="email"
              value={dadosCNH.email}
              onChange={(e) => setDadosCNH({...dadosCNH, email: e.target.value})}
              className="mt-1"
            />
          </div>

          <div className="col-span-2">
            <Label className="text-sm font-semibold">Nome da Mãe</Label>
            <Input
              value={dadosCNH.nome_mae}
              onChange={(e) => setDadosCNH({...dadosCNH, nome_mae: e.target.value})}
              className="mt-1"
            />
          </div>
        </div>

        <Button
          onClick={() => {
            setDadosExtraidos(false);
            cnhInputRef.current?.click();
          }}
          variant="outline"
          className="w-full"
        >
          <Upload className="w-4 h-4 mr-2" />
          Enviar outra CNH
        </Button>
      </div>
    );
  };

  const renderEtapaEndereco = () => {
    if (!dadosExtraidos) {
      return renderUploadArea(
        'Envie o Comprovante de Endereço',
        'Conta de luz, água ou telefone (PDF ou foto)',
        comprovanteInputRef,
        handleUploadComprovante,
        FileText
      );
    }

    return (
      <div className="space-y-4">
        <Alert className="bg-green-50 border-green-300">
          <CheckCircle2 className="h-5 w-5 text-green-600" />
          <AlertDescription className="text-green-900">
            <strong>Dados extraídos!</strong> Confirme ou edite as informações abaixo
          </AlertDescription>
        </Alert>

        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <Label className="flex items-center gap-1 text-sm font-semibold">
              Endereço <span className="text-red-600">*</span>
            </Label>
            <Input
              value={dadosEndereco.endereco}
              onChange={(e) => setDadosEndereco({...dadosEndereco, endereco: e.target.value})}
              placeholder="Rua, número"
              className={`mt-1 ${!dadosEndereco.endereco ? 'border-red-400 bg-red-50' : ''}`}
            />
          </div>

          <div>
            <Label className="text-sm font-semibold">Complemento</Label>
            <Input
              value={dadosEndereco.complemento}
              onChange={(e) => setDadosEndereco({...dadosEndereco, complemento: e.target.value})}
              placeholder="Apto, bloco"
              className="mt-1"
            />
          </div>

          <div>
            <Label className="text-sm font-semibold">Bairro</Label>
            <Input
              value={dadosEndereco.bairro}
              onChange={(e) => setDadosEndereco({...dadosEndereco, bairro: e.target.value})}
              className="mt-1"
            />
          </div>

          <div>
            <Label className="flex items-center gap-1 text-sm font-semibold">
              Cidade <span className="text-red-600">*</span>
            </Label>
            <Input
              value={dadosEndereco.cidade}
              onChange={(e) => setDadosEndereco({...dadosEndereco, cidade: e.target.value})}
              className={`mt-1 ${!dadosEndereco.cidade ? 'border-red-400 bg-red-50' : ''}`}
            />
          </div>

          <div>
            <Label className="flex items-center gap-1 text-sm font-semibold">
              UF <span className="text-red-600">*</span>
            </Label>
            <Input
              value={dadosEndereco.uf}
              onChange={(e) => setDadosEndereco({...dadosEndereco, uf: e.target.value.toUpperCase()})}
              maxLength={2}
              className={`mt-1 ${!dadosEndereco.uf ? 'border-red-400 bg-red-50' : ''}`}
            />
          </div>

          <div className="col-span-2">
            <Label className="flex items-center gap-1 text-sm font-semibold">
              CEP <span className="text-red-600">*</span>
            </Label>
            <Input
              value={dadosEndereco.cep}
              onChange={(e) => setDadosEndereco({...dadosEndereco, cep: e.target.value.replace(/\D/g, '')})}
              maxLength={8}
              className={`mt-1 ${!dadosEndereco.cep ? 'border-red-400 bg-red-50' : ''}`}
            />
          </div>
        </div>

        <Button
          onClick={() => {
            setDadosExtraidos(false);
            comprovanteInputRef.current?.click();
          }}
          variant="outline"
          className="w-full"
        >
          <Upload className="w-4 h-4 mr-2" />
          Enviar outro comprovante
        </Button>
      </div>
    );
  };

  const renderEtapaBancario = () => (
    <div className="space-y-4">
      <Alert className="bg-purple-50 border-purple-300">
        <CreditCard className="h-5 w-5 text-purple-600" />
        <AlertDescription className="text-purple-900">
          Dados bancários para recebimento de pagamentos (opcional)
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-sm font-semibold">Banco</Label>
          <Input
            value={dadosBancarios.banco}
            onChange={(e) => setDadosBancarios({...dadosBancarios, banco: e.target.value})}
            placeholder="Nome ou código"
            className="mt-1"
          />
        </div>

        <div>
          <Label className="text-sm font-semibold">Agência</Label>
          <Input
            value={dadosBancarios.agencia}
            onChange={(e) => setDadosBancarios({...dadosBancarios, agencia: e.target.value})}
            placeholder="0000"
            className="mt-1"
          />
        </div>

        <div>
          <Label className="text-sm font-semibold">Conta</Label>
          <Input
            value={dadosBancarios.conta}
            onChange={(e) => setDadosBancarios({...dadosBancarios, conta: e.target.value})}
            placeholder="00000-0"
            className="mt-1"
          />
        </div>

        <div>
          <Label className="text-sm font-semibold">Tipo</Label>
          <Select value={dadosBancarios.tipo_conta} onValueChange={(value) => setDadosBancarios({...dadosBancarios, tipo_conta: value})}>
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="corrente">Corrente</SelectItem>
              <SelectItem value="poupanca">Poupança</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="col-span-2">
          <Label className="text-sm font-semibold">Chave PIX</Label>
          <Input
            value={dadosBancarios.pix}
            onChange={(e) => setDadosBancarios({...dadosBancarios, pix: e.target.value})}
            placeholder="CPF, celular, email ou chave"
            className="mt-1"
          />
        </div>
      </div>
    </div>
  );

  const renderEtapaReferencias = () => (
    <div className="space-y-4">
      <Alert className="bg-orange-50 border-orange-300">
        <User className="h-5 w-5 text-orange-600" />
        <AlertDescription className="text-orange-900">
          Contatos profissionais (opcional - pode pular)
        </AlertDescription>
      </Alert>

      {referencias.map((ref, idx) => (
        <Card key={idx} className="border-2">
          <CardContent className="p-4">
            <h4 className="font-bold text-sm mb-3">Referência {idx + 1}</h4>
            <div className="grid grid-cols-3 gap-3">
              <Input
                value={ref.nome}
                onChange={(e) => {
                  const newRefs = [...referencias];
                  newRefs[idx].nome = e.target.value;
                  setReferencias(newRefs);
                }}
                placeholder="Nome"
              />
              <Input
                value={ref.telefone}
                onChange={(e) => {
                  const newRefs = [...referencias];
                  newRefs[idx].telefone = e.target.value;
                  setReferencias(newRefs);
                }}
                placeholder="Telefone"
              />
              <Input
                value={ref.empresa}
                onChange={(e) => {
                  const newRefs = [...referencias];
                  newRefs[idx].empresa = e.target.value;
                  setReferencias(newRefs);
                }}
                placeholder="Empresa"
              />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const renderEtapaEmergencia = () => (
    <div className="space-y-4">
      <Alert className="bg-red-50 border-red-300">
        <AlertCircle className="h-5 w-5 text-red-600" />
        <AlertDescription className="text-red-900">
          Contato para emergências (opcional)
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <Label className="text-sm font-semibold">Nome do Contato</Label>
          <Input
            value={emergencia.nome}
            onChange={(e) => setEmergencia({...emergencia, nome: e.target.value})}
            placeholder="Nome completo"
            className="mt-1"
          />
        </div>

        <div>
          <Label className="text-sm font-semibold">Telefone</Label>
          <Input
            value={emergencia.telefone}
            onChange={(e) => setEmergencia({...emergencia, telefone: e.target.value})}
            placeholder="(00) 00000-0000"
            className="mt-1"
          />
        </div>

        <div>
          <Label className="text-sm font-semibold">Parentesco</Label>
          <Input
            value={emergencia.parentesco}
            onChange={(e) => setEmergencia({...emergencia, parentesco: e.target.value})}
            placeholder="Pai, mãe, cônjuge"
            className="mt-1"
          />
        </div>
      </div>
    </div>
  );

  const renderEtapaVeiculos = () => {
    if (veiculoAtual === null && !dadosExtraidos) {
      return (
        <div className="space-y-6">
          {veiculos.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-bold text-sm">Veículos já cadastrados:</h4>
              {veiculos.map((v, idx) => (
                <Card key={idx} className="border-2 border-indigo-300">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Truck className="h-5 w-5 text-indigo-600" />
                      <div>
                        <p className="font-bold">{v.placa}</p>
                        <p className="text-xs text-slate-600">{v.marca} {v.modelo} - {v.tipo}</p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setVeiculos(veiculos.filter((_, i) => i !== idx))}
                    >
                      <X className="h-4 w-4 text-red-500" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {veiculos.length < 4 ? (
            renderUploadArea(
              veiculos.length === 0 ? 'Cadastre o Cavalo (Veículo Principal)' : 'Adicionar Implemento',
              'Envie o CRLV para extração automática',
              crlvInputRef,
              handleUploadCRLV,
              Truck
            )
          ) : (
            <Alert>
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <AlertDescription>
                Limite de 4 veículos atingido (1 cavalo + 3 implementos)
              </AlertDescription>
            </Alert>
          )}

          {veiculos.length > 0 && (
            <Button onClick={handleProximo} className="w-full bg-indigo-600 hover:bg-indigo-700">
              Continuar sem adicionar mais veículos →
            </Button>
          )}
        </div>
      );
    }

    if (veiculoAtual && dadosExtraidos) {
      return (
        <div className="space-y-4">
          <Alert className="bg-indigo-50 border-indigo-300">
            <CheckCircle2 className="h-5 w-5 text-indigo-600" />
            <AlertDescription className="text-indigo-900">
              <strong>Dados extraídos!</strong> Confirme ou edite e clique em "Adicionar Veículo"
            </AlertDescription>
          </Alert>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="flex items-center gap-1 text-sm font-semibold">
                Placa <span className="text-red-600">*</span>
              </Label>
              <Input
                value={veiculoAtual.placa}
                onChange={(e) => setVeiculoAtual({...veiculoAtual, placa: e.target.value.toUpperCase()})}
                className={`mt-1 ${!veiculoAtual.placa ? 'border-red-400 bg-red-50' : ''}`}
              />
            </div>

            <div>
              <Label className="text-sm font-semibold">Tipo</Label>
              <Select value={veiculoAtual.tipo} onValueChange={(value) => setVeiculoAtual({...veiculoAtual, tipo: value})}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cavalo">Cavalo</SelectItem>
                  <SelectItem value="carreta">Carreta</SelectItem>
                  <SelectItem value="truck">Truck</SelectItem>
                  <SelectItem value="semi-reboque">Semi-reboque</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="flex items-center gap-1 text-sm font-semibold">
                Marca <span className="text-red-600">*</span>
              </Label>
              <Input
                value={veiculoAtual.marca}
                onChange={(e) => setVeiculoAtual({...veiculoAtual, marca: e.target.value})}
                className={`mt-1 ${!veiculoAtual.marca ? 'border-red-400 bg-red-50' : ''}`}
              />
            </div>

            <div>
              <Label className="flex items-center gap-1 text-sm font-semibold">
                Modelo <span className="text-red-600">*</span>
              </Label>
              <Input
                value={veiculoAtual.modelo}
                onChange={(e) => setVeiculoAtual({...veiculoAtual, modelo: e.target.value})}
                className={`mt-1 ${!veiculoAtual.modelo ? 'border-red-400 bg-red-50' : ''}`}
              />
            </div>

            <div>
              <Label className="text-sm font-semibold">Proprietário</Label>
              <Input
                value={veiculoAtual.proprietario}
                onChange={(e) => setVeiculoAtual({...veiculoAtual, proprietario: e.target.value})}
                placeholder="Nome do dono"
                className="mt-1"
              />
            </div>

            <div>
              <Label className="text-sm font-semibold">CPF/CNPJ Proprietário</Label>
              <Input
                value={veiculoAtual.proprietario_documento}
                onChange={(e) => setVeiculoAtual({...veiculoAtual, proprietario_documento: e.target.value.replace(/\D/g, '')})}
                placeholder="Apenas números"
                className="mt-1"
              />
            </div>

            <div>
              <Label className="text-sm font-semibold">ANTT</Label>
              <Input
                value={veiculoAtual.antt_numero}
                onChange={(e) => setVeiculoAtual({...veiculoAtual, antt_numero: e.target.value})}
                placeholder="Número ANTT"
                className="mt-1"
              />
            </div>

            <div>
              <Label className="text-sm font-semibold">Validade ANTT</Label>
              <Input
                type="date"
                value={veiculoAtual.antt_validade}
                onChange={(e) => setVeiculoAtual({...veiculoAtual, antt_validade: e.target.value})}
                className="mt-1"
              />
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={() => {
                setVeiculoAtual(null);
                setDadosExtraidos(false);
              }}
              variant="outline"
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleAdicionarVeiculo}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700"
            >
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Adicionar Veículo
            </Button>
          </div>
        </div>
      );
    }

    return null;
  };

  const renderConfirmacao = () => (
    <div className="space-y-4">
      <Alert className="bg-green-50 border-green-300">
        <CheckCircle2 className="h-5 w-5 text-green-600" />
        <AlertDescription className="text-green-900">
          <strong>Revise todos os dados antes de salvar</strong>
        </AlertDescription>
      </Alert>

      <div className="space-y-3 max-h-96 overflow-y-auto">
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <h4 className="font-bold text-sm mb-2 text-blue-900 flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              CNH e Dados Pessoais
            </h4>
            <div className="text-xs space-y-1 text-slate-700">
              <p><strong>Nome:</strong> {dadosCNH.nome}</p>
              <p><strong>CPF:</strong> {dadosCNH.cpf}</p>
              <p><strong>CNH:</strong> {dadosCNH.cnh} - Categoria {dadosCNH.categoria_cnh}</p>
              <p><strong>Celular:</strong> {dadosCNH.celular}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-4">
            <h4 className="font-bold text-sm mb-2 text-green-900 flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Endereço
            </h4>
            <div className="text-xs space-y-1 text-slate-700">
              <p>{dadosEndereco.endereco}{dadosEndereco.complemento ? `, ${dadosEndereco.complemento}` : ''}</p>
              <p>{dadosEndereco.bairro ? `${dadosEndereco.bairro} - ` : ''}{dadosEndereco.cidade}/{dadosEndereco.uf}</p>
              <p><strong>CEP:</strong> {dadosEndereco.cep}</p>
            </div>
          </CardContent>
        </Card>

        {dadosBancarios.banco && (
          <Card className="bg-purple-50 border-purple-200">
            <CardContent className="p-4">
              <h4 className="font-bold text-sm mb-2 text-purple-900 flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                Dados Bancários
              </h4>
              <div className="text-xs space-y-1 text-slate-700">
                <p><strong>Banco:</strong> {dadosBancarios.banco} - Ag: {dadosBancarios.agencia}</p>
                <p><strong>Conta:</strong> {dadosBancarios.conta} ({dadosBancarios.tipo_conta})</p>
                {dadosBancarios.pix && <p><strong>PIX:</strong> {dadosBancarios.pix}</p>}
              </div>
            </CardContent>
          </Card>
        )}

        {referencias.some(ref => ref.nome) && (
          <Card className="bg-orange-50 border-orange-200">
            <CardContent className="p-4">
              <h4 className="font-bold text-sm mb-2 text-orange-900 flex items-center gap-2">
                <User className="h-4 w-4" />
                Referências
              </h4>
              <div className="text-xs space-y-1 text-slate-700">
                {referencias.map((ref, idx) => ref.nome && (
                  <p key={idx}>
                    <strong>{ref.nome}</strong>{ref.empresa && ` (${ref.empresa})`}{ref.telefone && ` - ${ref.telefone}`}
                  </p>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {emergencia.nome && (
          <Card className="bg-red-50 border-red-200">
            <CardContent className="p-4">
              <h4 className="font-bold text-sm mb-2 text-red-900 flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                Contato de Emergência
              </h4>
              <div className="text-xs space-y-1 text-slate-700">
                <p><strong>Nome:</strong> {emergencia.nome}</p>
                <p><strong>Telefone:</strong> {emergencia.telefone}</p>
                <p><strong>Parentesco:</strong> {emergencia.parentesco}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {veiculos.length > 0 && (
          <Card className="bg-indigo-50 border-indigo-200">
            <CardContent className="p-4">
              <h4 className="font-bold text-sm mb-2 text-indigo-900 flex items-center gap-2">
                <Truck className="h-4 w-4" />
                Veículos ({veiculos.length})
              </h4>
              <div className="text-xs space-y-1 text-slate-700">
                {veiculos.map((v, idx) => (
                  <p key={idx}>
                    <strong>{v.placa}</strong> - {v.marca} {v.modelo} ({v.tipo})
                  </p>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <Button
        onClick={handleSalvarTudo}
        disabled={saving}
        className="w-full bg-green-600 hover:bg-green-700 h-14 text-lg font-bold"
      >
        {saving ? (
          <>
            <Loader2 className="w-6 h-6 mr-2 animate-spin" />
            Salvando cadastro...
          </>
        ) : (
          <>
            <Save className="w-6 h-6 mr-2" />
            Confirmar e Salvar Cadastro
          </>
        )}
      </Button>
    </div>
  );

  const renderConteudoEtapa = () => {
    switch (etapaAtual.id) {
      case 'cnh':
        return renderEtapaCNH();
      case 'endereco':
        return renderEtapaEndereco();
      case 'bancario':
        return renderEtapaBancario();
      case 'referencias':
        return renderEtapaReferencias();
      case 'emergencia':
        return renderEtapaEmergencia();
      case 'veiculos':
        return renderEtapaVeiculos();
      case 'confirmacao':
        return renderConfirmacao();
      default:
        return null;
    }
  };

  const getCorEtapa = (cor) => {
    const cores = {
      blue: 'bg-blue-600',
      green: 'bg-green-600',
      purple: 'bg-purple-600',
      orange: 'bg-orange-600',
      red: 'bg-red-600',
      indigo: 'bg-indigo-600'
    };
    return cores[cor] || 'bg-gray-600';
  };

  const IconeEtapa = etapaAtual.icone;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] flex flex-col p-0">
        {/* Header com progresso */}
        <DialogHeader className="px-6 pt-6 pb-4 border-b bg-slate-50">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={`h-12 w-12 rounded-xl ${getCorEtapa(etapaAtual.cor).replace('bg-', 'bg-').replace('600', '100')} flex items-center justify-center`}>
                <IconeEtapa className={`h-6 w-6 text-${etapaAtual.cor}-600`} />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold">
                  {etapaAtual.titulo}
                </DialogTitle>
                <p className="text-xs text-slate-600 font-normal mt-0.5">
                  Etapa {etapaIndex + 1} de {ETAPAS.length}
                </p>
              </div>
            </div>
            <Badge className={`${getCorEtapa(etapaAtual.cor)} text-white px-3 py-1`}>
              {Math.round(((etapaIndex + 1) / ETAPAS.length) * 100)}%
            </Badge>
          </div>

          {/* Barra de progresso */}
          <div className="flex gap-1">
            {ETAPAS.map((etapa, idx) => (
              <div
                key={etapa.id}
                className={`h-2 flex-1 rounded-full transition-all ${
                  idx < etapaIndex 
                    ? 'bg-green-500' 
                    : idx === etapaIndex 
                    ? getCorEtapa(etapa.cor)
                    : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
        </DialogHeader>

        {/* Conteúdo da etapa */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          {renderConteudoEtapa()}
        </div>

        {/* Footer com navegação */}
        {etapaAtual.id !== 'confirmacao' && (
          <div className="border-t bg-slate-50 px-6 py-4 flex gap-3">
            <Button
              onClick={handleVoltar}
              disabled={etapaIndex === 0}
              variant="outline"
              className="flex-1"
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
            <Button
              onClick={handleProximo}
              disabled={etapaAtual.id === 'cnh' && !dadosExtraidos || etapaAtual.id === 'endereco' && !dadosExtraidos}
              className={`flex-1 ${getCorEtapa(etapaAtual.cor)} hover:opacity-90`}
            >
              {etapaIndex === ETAPAS.length - 2 ? 'Revisar Dados' : 'Próximo'}
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
