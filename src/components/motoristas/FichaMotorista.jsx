import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Printer, X } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { base44 } from "@/api/base44Client";

export default function FichaMotorista({ open, onClose, motorista, veiculos }) {
  const [user, setUser] = React.useState(null);
  const [empresa, setEmpresa] = React.useState(null);

  React.useEffect(() => {
    const loadUserAndCompany = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
        
        if (currentUser.empresa_id) {
          const empresaData = await base44.entities.Empresa.get(currentUser.empresa_id);
          setEmpresa(empresaData);
        }
      } catch (error) {
        console.error("Erro ao carregar usuário e empresa:", error);
      }
    };
    loadUserAndCompany();
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const getCavalo = () => {
    if (!motorista.cavalo_id) return null;
    return veiculos.find(v => v.id === motorista.cavalo_id);
  };

  const getImplemento = (implementoId) => {
    if (!implementoId) return null;
    return veiculos.find(v => v.id === implementoId);
  };

  const cavalo = getCavalo();
  const implemento1 = getImplemento(motorista.implemento1_id);
  const implemento2 = getImplemento(motorista.implemento2_id);
  const implemento3 = getImplemento(motorista.implemento3_id);

  const formatCPF = (cpf) => {
    if (!cpf) return "";
    const cleaned = cpf.replace(/\D/g, '');
    if (cleaned.length !== 11) return cpf;
    return cleaned.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, "$1.$2.$3-$4");
  };

  const formatCNPJ = (cnpj) => {
    if (!cnpj) return "";
    const cleaned = cnpj.replace(/\D/g, '');
    if (cleaned.length !== 14) return cnpj;
    return cleaned.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, "$1.$2.$3/$4-$5");
  };

  const dataAtual = new Date();

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-5xl max-h-[90vh] overflow-y-auto print:hidden">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle>Ficha do Motorista</DialogTitle>
              <div className="flex gap-2">
                <Button onClick={handlePrint} className="bg-blue-600 hover:bg-blue-700">
                  <Printer className="w-4 h-4 mr-2" />
                  Imprimir
                </Button>
                <Button variant="outline" onClick={onClose}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </DialogHeader>

          <FichaContent 
            motorista={motorista}
            cavalo={cavalo}
            implemento1={implemento1}
            implemento2={implemento2}
            implemento3={implemento3}
            user={user}
            empresa={empresa}
            dataAtual={dataAtual}
            formatCPF={formatCPF}
            formatCNPJ={formatCNPJ}
          />
        </DialogContent>
      </Dialog>

      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body * {
            visibility: hidden;
          }
          .print-ficha, .print-ficha * {
            visibility: visible;
          }
          .print-ficha {
            position: fixed;
            left: 0;
            top: 0;
            width: 100%;
            padding: 1cm;
          }
          @page {
            size: A4;
            margin: 1cm;
          }
        }
      `}} />
    </>
  );
}

function FichaContent({ motorista, cavalo, implemento1, implemento2, implemento3, user, empresa, dataAtual, formatCPF, formatCNPJ }) {
  const estadoCivilMap = {
    solteiro: "SOLTEIRO",
    casado: "CASADO",
    divorciado: "DIVORCIADO",
    viúvo: "VIÚVO"
  };

  return (
    <div className="print-ficha bg-white text-xs p-4" style={{ fontSize: '9pt' }}>
      {/* Cabeçalho */}
      <div className="flex justify-between items-start border-2 border-black p-2 mb-2">
        <div className="flex items-start gap-3">
          {empresa?.logo_url && (
            <div className="w-16 h-16 flex items-center justify-center">
              <img src={empresa.logo_url} alt="Logo" className="max-w-full max-h-full object-contain" />
            </div>
          )}
          <div>
            <h1 className="text-2xl font-bold">Ficha do motorista</h1>
          </div>
        </div>
        <div className="text-right text-xs">
          <p>Modelo: 2</p>
          <p>Data/Hora: {format(dataAtual, "dd/MM/yyyy 'às' HH:mm:ss", { locale: ptBR })}</p>
          <p>Usuário: {user?.full_name || "Sistema"}</p>
          <p>Cód: {motorista.id.slice(-4)}</p>
          <p>Página: 1 de 1</p>
        </div>
      </div>

      {/* DADOS PESSOAIS */}
      <div className="border-2 border-black mb-2">
        <div className="bg-gray-200 font-bold p-1 border-b-2 border-black">
          DADOS PESSOAIS
        </div>
        <div className="p-2 flex border-b-2 border-black">
          <div className="flex-1">
            <div className="mb-2">
              <span className="font-bold">Nome:</span> {motorista.nome}
            </div>
            
            <div className="grid grid-cols-2 gap-x-4 gap-y-1">
              <div>
                <span className="font-bold">Nascimento:</span> {motorista.data_nascimento ? format(new Date(motorista.data_nascimento), "dd/MM/yyyy") : "-"}
              </div>
              <div>
                <span className="font-bold">Celular:</span> {motorista.celular || motorista.telefone || "-"}
              </div>
              
              <div className="col-span-2">
                <span className="font-bold">Endereço:</span> {motorista.endereco || "-"}
              </div>
              
              <div>
                <span className="font-bold">Complemento:</span> {motorista.complemento || "-"}
              </div>
              <div>
                <span className="font-bold">CEP:</span> {motorista.cep || "-"}
              </div>
              
              <div>
                <span className="font-bold">Bairro:</span> {motorista.bairro || "-"}
              </div>
              <div>
                <span className="font-bold">Cidade:</span> {motorista.cidade && motorista.uf ? `${motorista.cidade} - ${motorista.uf}` : "-"}
              </div>
              
              <div>
                <span className="font-bold">Telefone:</span> {motorista.telefone || "-"}
              </div>
              <div>
                <span className="font-bold">Est. civil:</span> {motorista.estado_civil ? estadoCivilMap[motorista.estado_civil] : "-"}
              </div>
              
              <div className="col-span-2">
                <span className="font-bold">Nome do pai:</span> {motorista.nome_pai || "-"}
              </div>
              
              <div className="col-span-2">
                <span className="font-bold">Nome da mãe:</span> {motorista.nome_mae || "-"}
              </div>
            </div>
          </div>
          <div className="w-24 h-32 border-2 border-gray-300 ml-4 flex items-center justify-center bg-gray-50">
            {motorista.foto_url ? (
              <img src={motorista.foto_url} alt="Foto" className="w-full h-full object-cover" />
            ) : (
              <span className="text-xs text-gray-400">Foto</span>
            )}
          </div>
        </div>
      </div>

      {/* REFERÊNCIAS */}
      <div className="border-2 border-black mb-2">
        <div className="bg-gray-200 font-bold p-1 border-b-2 border-black text-center">
          REFERÊNCIAS
        </div>
        <div className="grid grid-cols-2 border-b-2 border-black">
          <div className="p-2 border-r-2 border-black">
            <div className="font-bold text-center mb-1">PESSOAIS</div>
            <div className="flex justify-between border-b border-gray-300 mb-1">
              <span className="font-bold">Nome</span>
              <span className="font-bold">Telefone</span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs">{motorista.referencia_pessoal_nome || "-"}</span>
              <span className="text-xs">{motorista.referencia_pessoal_telefone || "-"}</span>
            </div>
          </div>
          <div className="p-2">
            <div className="font-bold text-center mb-1">COMERCIAIS</div>
            <div className="flex justify-between border-b border-gray-300 mb-1">
              <span className="font-bold">Nome</span>
              <span className="font-bold">Telefone</span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs">{motorista.referencia_comercial_nome || "-"}</span>
              <span className="text-xs">{motorista.referencia_comercial_telefone || "-"}</span>
            </div>
          </div>
        </div>
      </div>

      {/* DOCUMENTAÇÃO */}
      <div className="border-2 border-black mb-2">
        <div className="bg-gray-200 font-bold p-1 border-b-2 border-black">
          DOCUMENTAÇÃO
        </div>
        <div className="p-2 border-b-2 border-black">
          <div className="grid grid-cols-3 gap-x-4 gap-y-1">
            <div>
              <span className="font-bold">CPF:</span> {formatCPF(motorista.cpf)}
            </div>
            <div>
              <span className="font-bold">RG:</span> {motorista.rg || "-"}
            </div>
            <div>
              <span className="font-bold">Órg. emissor:</span> {motorista.rg_orgao_emissor || "-"} {motorista.rg_uf ? `- ${motorista.rg_uf}` : ""}
            </div>
            
            <div>
              <span className="font-bold">CNH:</span> {motorista.cnh}
            </div>
            <div>
              <span className="font-bold">Prontuário:</span> {motorista.cnh_prontuario || "-"}
            </div>
            <div>
              <span className="font-bold">Emissão:</span> {motorista.cnh_emissao ? format(new Date(motorista.cnh_emissao), "dd/MM/yyyy") : "-"}
            </div>
            
            <div>
              <span className="font-bold">Categoria:</span> {motorista.categoria_cnh}
            </div>
            <div>
              <span className="font-bold">Validade:</span> {motorista.vencimento_cnh ? format(new Date(motorista.vencimento_cnh), "dd/MM/yyyy") : "-"}
            </div>
            <div>
              <span className="font-bold">Local:</span> {motorista.cnh_uf || "-"}
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-x-4 mt-2">
            <div>
              <span className="font-bold">Cartão REPOM:</span> {motorista.cartao_repom || "-"}
            </div>
            <div>
              <span className="font-bold">RNTRC:</span> {motorista.rntrc || "-"}
            </div>
            <div>
              <span className="font-bold">Cartão PAMCARD:</span> {motorista.cartao_pamcard || "-"}
            </div>
            <div>
              <span className="font-bold">PIS/PASEP:</span> {motorista.pis_pasep || "-"}
            </div>
            <div>
              <span className="font-bold">Cartão NDDCargo:</span> {motorista.cartao_nddcargo || "-"}
            </div>
            <div>
              <span className="font-bold">Liberação:</span> -
            </div>
            <div>
              <span className="font-bold">Cartão Ticket Frete:</span> {motorista.cartao_ticket_frete || "-"}
            </div>
            <div>
              <span className="font-bold">Validade:</span> -
            </div>
          </div>
        </div>
      </div>

      {/* INFORMAÇÕES OPERACIONAIS */}
      <div className="border-2 border-black mb-2">
        <div className="bg-gray-200 font-bold p-1 border-b-2 border-black">
          INFORMAÇÕES OPERACIONAIS
        </div>
        <div className="p-2 border-b-2 border-black">
          <div className="grid grid-cols-3 gap-x-4 gap-y-1 mb-2">
            <div>
              <span className="font-bold">Tipo:</span> {cavalo ? 'CARRETEIRO' : '-'}
            </div>
            <div>
              <span className="font-bold">Liberação:</span> -
            </div>
            <div>
              <span className="font-bold">Validade:</span> -
            </div>
            <div>
              <span className="font-bold">Bloqueado:</span> Não
            </div>
            <div className="col-span-2">
              <span className="font-bold">Motivo do bloqueio:</span> -
            </div>
          </div>

          {/* Veículo (Cavalo) */}
          {cavalo && (
            <div className="border-t-2 border-gray-300 pt-2 mt-2">
              <div className="grid grid-cols-3 gap-x-4 gap-y-1">
                <div>
                  <span className="font-bold">Veículo:</span> {cavalo.placa}
                </div>
                <div>
                  <span className="font-bold">Marca:</span> {cavalo.marca}
                </div>
                <div>
                  <span className="font-bold">Renavan:</span> {cavalo.renavam || "-"}
                </div>
                
                <div className="col-span-3">
                  <span className="font-bold">Proprietário:</span> {cavalo.proprietario || empresa?.razao_social || "-"}
                </div>
                
                <div className="col-span-2">
                  <span className="font-bold">Endereço:</span> {cavalo.proprietario_endereco || empresa?.endereco || "-"}
                </div>
                <div>
                  <span className="font-bold">Bairro:</span> {empresa?.cidade ? empresa.cidade.split('-')[0] : "-"}
                </div>
                
                <div>
                  <span className="font-bold">Cidade:</span> {empresa?.cidade || "-"}
                </div>
                <div>
                  <span className="font-bold">CPF/CNPJ:</span> {cavalo.proprietario_documento ? (cavalo.proprietario_documento.length === 11 ? formatCPF(cavalo.proprietario_documento) : formatCNPJ(cavalo.proprietario_documento)) : (empresa?.cnpj ? formatCNPJ(empresa.cnpj) : "-")}
                </div>
                <div>
                  <span className="font-bold">RNTRC:</span> {cavalo.antt_rntrc || "-"}
                </div>
                
                <div>
                  <span className="font-bold">Fones:</span> {empresa?.telefone || "-"}
                </div>
                <div className="col-span-2">
                  <span className="font-bold">PIS/PASEP:</span> -
                </div>
              </div>
            </div>
          )}

          {/* Carreta (Implemento 1) */}
          {implemento1 && (
            <div className="border-t-2 border-gray-300 pt-2 mt-2">
              <div className="font-bold mb-1">Carreta:</div>
              <div className="grid grid-cols-3 gap-x-4 gap-y-1">
                <div>
                  <span className="font-bold">Placa:</span> {implemento1.placa}
                </div>
                <div>
                  <span className="font-bold">Marca:</span> {implemento1.marca}
                </div>
                <div>
                  <span className="font-bold">Renavan:</span> {implemento1.renavam || "-"}
                </div>
                
                <div className="col-span-3">
                  <span className="font-bold">Proprietário:</span> {implemento1.proprietario || empresa?.razao_social || "-"}
                </div>
                
                <div className="col-span-2">
                  <span className="font-bold">Endereço:</span> {implemento1.proprietario_endereco || empresa?.endereco || "-"}
                </div>
                <div>
                  <span className="font-bold">Bairro:</span> {empresa?.cidade ? empresa.cidade.split('-')[0] : "-"}
                </div>
                
                <div>
                  <span className="font-bold">Cidade:</span> {empresa?.cidade || "-"}
                </div>
                <div>
                  <span className="font-bold">CPF/CNPJ:</span> {implemento1.proprietario_documento ? (implemento1.proprietario_documento.length === 11 ? formatCPF(implemento1.proprietario_documento) : formatCNPJ(implemento1.proprietario_documento)) : (empresa?.cnpj ? formatCNPJ(empresa.cnpj) : "-")}
                </div>
                <div>
                  <span className="font-bold">RNTRC:</span> {implemento1.antt_rntrc || "-"}
                </div>
                
                <div>
                  <span className="font-bold">Fones:</span> {empresa?.telefone || "-"}
                </div>
                <div className="col-span-2">
                  <span className="font-bold">PIS/PASEP:</span> -
                </div>
              </div>
            </div>
          )}

          {/* Bi-Trem (Implemento 2) */}
          {implemento2 && (
            <div className="border-t-2 border-gray-300 pt-2 mt-2">
              <div className="font-bold mb-1">Bi-Trem:</div>
              <div className="grid grid-cols-3 gap-x-4 gap-y-1">
                <div>
                  <span className="font-bold">Placa:</span> {implemento2.placa}
                </div>
                <div>
                  <span className="font-bold">Marca:</span> {implemento2.marca}
                </div>
                <div>
                  <span className="font-bold">Renavan:</span> {implemento2.renavam || "-"}
                </div>
                
                <div className="col-span-3">
                  <span className="font-bold">Proprietário:</span> {implemento2.proprietario || empresa?.razao_social || "-"}
                </div>
                
                <div className="col-span-2">
                  <span className="font-bold">Endereço:</span> {implemento2.proprietario_endereco || empresa?.endereco || "-"}
                </div>
                <div>
                  <span className="font-bold">Bairro:</span> {empresa?.cidade ? empresa.cidade.split('-')[0] : "-"}
                </div>
                
                <div>
                  <span className="font-bold">Cidade:</span> {empresa?.cidade || "-"}
                </div>
                <div>
                  <span className="font-bold">CPF/CNPJ:</span> {implemento2.proprietario_documento ? (implemento2.proprietario_documento.length === 11 ? formatCPF(implemento2.proprietario_documento) : formatCNPJ(implemento2.proprietario_documento)) : (empresa?.cnpj ? formatCNPJ(empresa.cnpj) : "-")}
                </div>
                <div>
                  <span className="font-bold">RNTRC:</span> {implemento2.antt_rntrc || "-"}
                </div>
                
                <div>
                  <span className="font-bold">Fones:</span> {empresa?.telefone || "-"}
                </div>
                <div className="col-span-2">
                  <span className="font-bold">PIS/PASEP:</span> -
                </div>
              </div>
            </div>
          )}

          {/* 3º Reboque (Implemento 3) */}
          {implemento3 && (
            <div className="border-t-2 border-gray-300 pt-2 mt-2">
              <div className="font-bold mb-1">3º Reboque:</div>
              <div className="grid grid-cols-3 gap-x-4 gap-y-1">
                <div>
                  <span className="font-bold">Placa:</span> {implemento3.placa}
                </div>
                <div>
                  <span className="font-bold">Marca:</span> {implemento3.marca}
                </div>
                <div>
                  <span className="font-bold">Renavan:</span> {implemento3.renavam || "-"}
                </div>
                
                <div className="col-span-3">
                  <span className="font-bold">Proprietário:</span> {implemento3.proprietario || empresa?.razao_social || "-"}
                </div>
                
                <div className="col-span-2">
                  <span className="font-bold">Endereço:</span> {implemento3.proprietario_endereco || empresa?.endereco || "-"}
                </div>
                <div>
                  <span className="font-bold">Bairro:</span> {empresa?.cidade ? empresa.cidade.split('-')[0] : "-"}
                </div>
                
                <div>
                  <span className="font-bold">Cidade:</span> {empresa?.cidade || "-"}
                </div>
                <div>
                  <span className="font-bold">CPF/CNPJ:</span> {implemento3.proprietario_documento ? (implemento3.proprietario_documento.length === 11 ? formatCPF(implemento3.proprietario_documento) : formatCNPJ(implemento3.proprietario_documento)) : (empresa?.cnpj ? formatCNPJ(empresa.cnpj) : "-")}
                </div>
                <div>
                  <span className="font-bold">RNTRC:</span> {implemento3.antt_rntrc || "-"}
                </div>
                
                <div>
                  <span className="font-bold">Fones:</span> {empresa?.telefone || "-"}
                </div>
                <div className="col-span-2">
                  <span className="font-bold">PIS/PASEP:</span> -
                </div>
              </div>
            </div>
          )}

          {/* Observação */}
          <div className="border-t-2 border-gray-300 pt-2 mt-2">
            <div>
              <span className="font-bold">Observação:</span>
              <div className="mt-1 whitespace-pre-wrap">{motorista.observacoes || "-"}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Rodapé */}
      <div className="border-t-2 border-black pt-2 mt-2">
        <div className="text-center mb-2">
          <p className="font-bold">SR. MOTORISTA, POR GENTILEZA CONFERIR: DADOS PESSOAIS, DO VEICULO, DA CARRETA E DO PROPRIETARIO</p>
        </div>
        
        <div className="border-t-2 border-black pt-2 mt-2">
          <p>De acordo: {motorista.nome}</p>
        </div>

        <div className="text-xs text-gray-600 mt-4">
          <p>Filtros utilizados: Todos os motoristas</p>
          <p className="mt-1">Licença liberada para {empresa?.razao_social || "Sistema"}</p>
        </div>
      </div>
    </div>
  );
}