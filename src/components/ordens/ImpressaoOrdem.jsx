
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function ImpressaoOrdem({ open, onClose, ordem, motorista, veiculo, user, empresa }) {
  const handlePrint = () => {
    window.print();
  };

  const formatCNPJ = (cnpj) => {
    if (!cnpj) return "";
    // Remove non-numeric characters first
    const cleanedCnpj = cnpj.replace(/\D/g, '');
    if (cleanedCnpj.length !== 14) return cnpj; // Return original if not 14 digits
    return cleanedCnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, "$1.$2.$3/$4-$5");
  };

  const formatCPF = (cpf) => {
    if (!cpf) return "";
    // Remove non-numeric characters first
    const cleanedCpf = cpf.replace(/\D/g, '');
    if (cleanedCpf.length !== 11) return cpf; // Return original if not 11 digits
    return cleanedCpf.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, "$1.$2.$3-$4");
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto print:hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Visualização de Impressão</span>
              <div className="flex gap-2">
                <Button onClick={handlePrint} className="bg-blue-600 hover:bg-blue-700">
                  <Printer className="w-4 h-4 mr-2" />
                  Imprimir
                </Button>
                <Button variant="outline" onClick={onClose}>
                  Fechar
                </Button>
              </div>
            </DialogTitle>
          </DialogHeader>

          <div className="print:block">
            <OrdemImpressaoContent 
              ordem={ordem} 
              motorista={motorista} 
              veiculo={veiculo} 
              user={user}
              empresa={empresa}
              formatCNPJ={formatCNPJ}
              formatCPF={formatCPF}
            />
          </div>
        </DialogContent>
      </Dialog>

      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print-content, .print-content * {
            visibility: visible;
          }
          .print-content {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          @page {
            size: A4;
            margin: 1cm;
          }
        }
      `}</style>
    </>
  );
}

function OrdemImpressaoContent({ ordem, motorista, veiculo, user, empresa, formatCNPJ, formatCPF }) {
  const dataAtual = new Date();
  
  return (
    <div className="print-content bg-white p-8 text-sm">
      {/* Header */}
      <div className="border-2 border-black p-4 mb-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-start gap-4">
            {empresa?.logo_url && (
              <div className="w-16 h-16 flex items-center justify-center border rounded">
                <img src={empresa.logo_url} alt="Logo" className="max-w-full max-h-full object-contain" />
              </div>
            )}
            <div className="flex-1">
              <h1 className="text-xl font-bold uppercase">{empresa?.razao_social || "EMPRESA TRANSPORTADORA LTDA"}</h1>
              <p className="text-xs mt-1">{empresa?.endereco || "RUA EXEMPLO, 123"}</p>
              <p className="text-xs">{empresa?.cidade && empresa?.estado ? `${empresa.cidade} - ${empresa.estado}` : "BAIRRO / CIDADE"}</p>
              <p className="text-xs">CNPJ: {empresa?.cnpj ? formatCNPJ(empresa.cnpj) : "00.000.000/0000-00"}</p>
            </div>
          </div>
          <div className="text-right text-xs">
            <p>Fone: {empresa?.telefone || "(00) 0000-0000"}</p>
            <p>IE: {empresa?.inscricao_estadual || "000000000000"}</p>
            <p className="mt-2">Modelo: 2 Cód: {ordem.id.slice(-4)}</p>
            <p>Data/Hora: {format(dataAtual, "dd/MM/yyyy 'às' HH:mm:ss", { locale: ptBR })}</p>
            <p>Usuário: {user?.full_name || user?.email || "Sistema"}</p>
          </div>
        </div>
      </div>

      {/* Título */}
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold">ORDEM DE COLETA/OS Nº : {ordem.numero_carga || ordem.id.slice(-6)} / {new Date().getFullYear()}</h2>
        <h3 className="text-lg font-semibold mt-2">1ª-VIA</h3>
      </div>

      {/* Dados da Coleta */}
      <div className="mb-6">
        <h3 className="font-bold bg-gray-200 p-2 mb-3">Dados da Coleta</h3>
        
        <div className="grid grid-cols-2 gap-x-6 gap-y-2">
          <div className="flex">
            <span className="font-semibold w-32">Data carregamento:</span>
            <span>{ordem.data_carregamento ? format(new Date(ordem.data_carregamento), "dd/MM/yyyy", { locale: ptBR }) : "-"}</span>
          </div>
          <div className="flex">
            <span className="font-semibold w-32">Solicitada Em:</span>
            <span>{ordem.data_solicitacao ? format(new Date(ordem.data_solicitacao), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR }) : "-"}</span>
          </div>
        </div>

        <div className="mt-3">
          <p><span className="font-semibold">Cliente/Remetente:</span> {ordem.cliente_cnpj ? `${formatCNPJ(ordem.cliente_cnpj)} - ` : ""}{ordem.cliente}</p>
          <p className="mt-1">
            <span className="font-semibold">Local da coleta:</span> {ordem.origem_endereco || ordem.origem} 
            {ordem.origem_cep && ` . CEP: ${ordem.origem_cep}`}
            {ordem.origem_cidade && ordem.origem_uf && ` - ${ordem.origem_cidade}-${ordem.origem_uf}`}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-x-6 gap-y-2 mt-3">
          {ordem.origem_bairro && (
            <div className="flex">
              <span className="font-semibold w-24">Bairro:</span>
              <span>{ordem.origem_bairro}</span>
            </div>
          )}
          <div className="flex">
            <span className="font-semibold w-24">Cidade/UF:</span>
            <span>{ordem.origem_cidade || ordem.origem} - {ordem.origem_uf || "-"}</span>
          </div>
        </div>

        <div className="mt-3">
          <p><span className="font-semibold">Cliente/Destinatário:</span> {ordem.destinatario_cnpj ? `${formatCNPJ(ordem.destinatario_cnpj)} - ` : ""}{ordem.destinatario || ordem.destino}</p>
          <p className="mt-1">
            <span className="font-semibold">Local entrega:</span> {ordem.destino_endereco || ordem.destino}
            {ordem.destino_cep && ` . CEP: ${ordem.destino_cep}`}
            {ordem.destino_cidade && ordem.destino_uf && ` - ${ordem.destino_cidade}-${ordem.destino_uf}`}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-x-6 gap-y-2 mt-3">
          {ordem.destino_bairro && (
            <div className="flex">
              <span className="font-semibold w-24">Bairro:</span>
              <span>{ordem.destino_bairro}</span>
            </div>
          )}
          <div className="flex">
            <span className="font-semibold w-24">Destino:</span>
            <span>{ordem.destino_cidade || ordem.destino} - {ordem.destino_uf || "PA"}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-x-6 gap-y-2 mt-3">
          <div className="flex">
            <span className="font-semibold w-32">Viagem/Pedido nº:</span>
            <span>{ordem.viagem_pedido || "-"}</span>
          </div>
          <div className="flex">
            <span className="font-semibold w-24">Tipo:</span>
            <span>{ordem.tipo_operacao || "FOB"}</span>
          </div>
        </div>
      </div>

      {/* Dados do Carregamento */}
      <div className="mb-6">
        <h3 className="font-bold bg-gray-200 p-2 mb-3">Dados do carregamento</h3>
        
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-x-6">
            <p><span className="font-semibold">Placa veículo:</span> {veiculo?.placa || "-"}</p>
            <p><span className="font-semibold">Placa carreta:</span> -</p>
          </div>
          <div className="grid grid-cols-2 gap-x-6">
            <p><span className="font-semibold">Placa bi-trem:</span> -</p>
            <p><span className="font-semibold">Placa 3º veículo:</span> -</p>
          </div>
          <div className="grid grid-cols-2 gap-x-6 mt-3">
            <p><span className="font-semibold">Motorista:</span> {motorista?.nome || "-"}</p>
            <p><span className="font-semibold">CPF:</span> {motorista?.cpf ? formatCPF(motorista.cpf) : "-"}</p>
          </div>
          <div className="grid grid-cols-2 gap-x-6">
            <p><span className="font-semibold">RG:</span> {motorista?.rg || "-"}</p>
            <p><span className="font-semibold">Fone:</span> {motorista?.telefone || "-"}</p>
          </div>
          <div className="grid grid-cols-2 gap-x-6 mt-3">
            <p><span className="font-semibold">Proprietário:</span> {veiculo?.proprietario || empresa?.razao_social || "EMPRESA TRANSPORTADORA"}</p>
            <p><span className="font-semibold">CPF:</span> {veiculo?.proprietario_documento ? (veiculo.proprietario_documento.length === 11 ? formatCPF(veiculo.proprietario_documento) : formatCNPJ(veiculo.proprietario_documento)) : (empresa?.cnpj ? formatCNPJ(empresa.cnpj) : "00.000.000/0000-00")}</p>
          </div>
        </div>

        <div className="mt-4">
          <p><span className="font-semibold">Notas fiscais:</span> {ordem.notas_fiscais || "-"}</p>
        </div>

        <div className="grid grid-cols-3 gap-x-6 mt-3">
          <div className="flex">
            <span className="font-semibold w-24">Volumes:</span>
            <span>{ordem.volumes || 0}</span>
          </div>
          <div className="flex">
            <span className="font-semibold w-24">Peso:</span>
            <span>{ordem.peso ? `${(ordem.peso / 1000).toFixed(3).replace('.', ',')}` : "0,000"}</span>
          </div>
          <div className="flex">
            <span className="font-semibold w-32">Total mercadorias:</span>
            <span>{ordem.valor_total_frete ? `R$ ${ordem.valor_total_frete.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : "-"}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-x-6 mt-3">
          <div className="flex">
            <span className="font-semibold w-24">Embalagem:</span>
            <span>{ordem.embalagem || "-"}</span>
          </div>
          <div className="flex">
            <span className="font-semibold w-24">Conteúdo:</span>
            <span>{ordem.conteudo || ordem.produto}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-x-6 mt-3">
          <div className="flex">
            <span className="font-semibold w-32">QTD entregas:</span>
            <span>{ordem.qtd_entregas || 1}</span>
          </div>
        </div>

        {ordem.observacao_carga && (
          <div className="mt-3">
            <p className="font-semibold">Observações:</p>
            <p className="mt-1 whitespace-pre-wrap">{ordem.observacao_carga}</p>
          </div>
        )}
      </div>

      {/* Rodapé */}
      <div className="mt-8 text-center">
        <p className="font-semibold text-xs">
          {ordem.origem_cidade || "CIDADE"}, {format(dataAtual, "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
        </p>
      </div>

      <div className="mt-8 border-t-2 border-black pt-2">
        <p className="text-xs text-center font-bold uppercase">{empresa?.razao_social || "EMPRESA TRANSPORTADORA"}</p>
      </div>

      {/* Campo de assinatura */}
      <div className="mt-12 grid grid-cols-2 gap-8">
        <div className="border-t border-black pt-2 text-center">
          <p><span className="font-semibold">Chegada:</span> ___/___/______ às ___:___</p>
        </div>
        <div className="border-t border-black pt-2 text-center">
          <p><span className="font-semibold">Saída:</span> ___/___/______ às ___:___</p>
        </div>
      </div>

      <div className="mt-8 text-xs text-right text-gray-600">
        <p>Impresso por: {user?.full_name || user?.email || "Sistema"}, em: {format(dataAtual, "dd/MM/yyyy, 'às' HH:mm", { locale: ptBR })}</p>
      </div>
    </div>
  );
}
