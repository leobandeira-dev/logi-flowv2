
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Save,
  X,
  Plus,
  Trash2,
  Download,
  FileSpreadsheet,
  Copy
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { toUpperNoAccent } from "@/components/utils/textUtils";

const tipoVeiculoOptions = [
  "RODOTREM", "TRUCK", "CARRETA 5EIXOS", "CARRETA 6EIXOS",
  "CARRETA 7EIXOS", "BITREM", "CARRETA LOC", "PRANCHA", "BI-TRUCK", "FIORINO"
];

const tipoCarroceriaOptions = [
  "SIDER", "PRANCHA", "GRADE BAIXA", "GRADE ALTA", "BAU", "EXTENSIVA", "CARRETA LOC"
];

export default function OfertaCargaLote({ open, onClose, onSubmit }) {
  const [operacoes, setOperacoes] = useState([]);
  const [linhas, setLinhas] = useState([
    {
      id: 1,
      operacao_id: "",
      modalidade_carga: "normal",
      tipo_operacao: "FOB",
      cliente: "",
      origem_cidade: "",
      origem_uf: "",
      destinatario: "",
      destino_cidade: "",
      destino_uf: "",
      produto: "",
      tipo_veiculo: "",
      tipo_carroceria: "",
      peso: "",
      frete_viagem: "",
      observacao_carga: "",
      carregamento_agendamento_data: "",
      descarga_agendamento_data: "",
      viagem_pedido: ""
    }
  ]);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    if (open) {
      loadOperacoes();
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

  const adicionarLinha = () => {
    const novaLinha = {
      id: linhas.length + 1,
      operacao_id: "",
      modalidade_carga: "normal",
      tipo_operacao: "FOB",
      cliente: "",
      origem_cidade: "",
      origem_uf: "",
      destinatario: "",
      destino_cidade: "",
      destino_uf: "",
      produto: "",
      tipo_veiculo: "",
      tipo_carroceria: "",
      peso: "",
      frete_viagem: "",
      observacao_carga: "",
      carregamento_agendamento_data: "",
      descarga_agendamento_data: "",
      viagem_pedido: ""
    };
    setLinhas([...linhas, novaLinha]);
  };

  const duplicarLinha = (linhaId) => {
    const linhaOriginal = linhas.find(l => l.id === linhaId);
    if (!linhaOriginal) return;

    const novaLinha = {
      ...linhaOriginal,
      id: Math.max(...linhas.map(l => l.id)) + 1
    };

    setLinhas([...linhas, novaLinha]);
    toast.success("Linha duplicada com sucesso!");
  };

  const removerLinha = (id) => {
    if (linhas.length === 1) {
      toast.error("Precisa ter pelo menos uma linha");
      return;
    }
    setLinhas(linhas.filter(l => l.id !== id));
  };

  const atualizarLinha = (id, campo, valor) => {
    // Campos que devem ser transformados para maiúsculas sem acento
    const upperFields = ['cliente', 'origem_cidade', 'destinatario', 'destino_cidade', 'produto', 'observacao_carga', 'viagem_pedido'];
    
    // Campos de UF sempre maiúsculos
    const ufFields = ['origem_uf', 'destino_uf'];
    
    if (upperFields.includes(campo)) {
      valor = toUpperNoAccent(valor);
    } else if (ufFields.includes(campo)) {
      valor = valor?.toUpperCase() || '';
    }
    
    setLinhas(linhas.map(linha =>
      linha.id === id ? { ...linha, [campo]: valor } : linha
    ));
  };

  const validarLinha = (linha) => {
    const erros = [];

    if (!linha.operacao_id) erros.push("Operação");
    if (!linha.cliente) erros.push("Cliente/Remetente");
    if (!linha.origem_cidade) erros.push("Cidade Origem");
    if (!linha.destino_cidade) erros.push("Cidade Destino");
    if (!linha.produto) erros.push("Produto");
    if (!linha.peso || parseFloat(linha.peso) <= 0) erros.push("Peso");
    if (!linha.frete_viagem || parseFloat(linha.frete_viagem) <= 0) erros.push("Frete Viagem");

    return erros;
  };

  const handleSalvarLote = async () => {
    // Validar todas as linhas
    const linhasComErro = [];

    linhas.forEach((linha, index) => {
      const erros = validarLinha(linha);
      if (erros.length > 0) {
        linhasComErro.push({ numero: index + 1, erros });
      }
    });

    if (linhasComErro.length > 0) {
      const mensagem = linhasComErro.map(l =>
        `Linha ${l.numero}: ${l.erros.join(", ")}`
      ).join("\n");
      toast.error(`Erros encontrados:\n${mensagem}`);
      return;
    }

    setSalvando(true);
    try {
      // Formatar dados e calcular cliente_final para cada oferta
      const ofertasFormatadas = linhas.map(linha => {
        let clienteFinalNome = "";
        let clienteFinalCnpj = "";
        
        // Apply the outline's logic for cliente_final based on tipo_operacao
        if (linha.tipo_operacao === "CIF") {
          // CIF: cliente final é o remetente (quem envia)
          clienteFinalNome = linha.cliente;
          clienteFinalCnpj = linha.cliente_cnpj;
        } else if (linha.tipo_operacao === "FOB") {
          // FOB: cliente final é o destinatário (quem recebe)
          clienteFinalNome = linha.destinatario || linha.destino_cidade;
          clienteFinalCnpj = linha.destinatario_cnpj;
        }

        return {
          tipo_registro: "oferta",
          operacao_id: linha.operacao_id || null,
          modalidade_carga: linha.modalidade_carga,
          tipo_operacao: linha.tipo_operacao,
          cliente: linha.cliente,
          origem: linha.origem_cidade,
          origem_cidade: linha.origem_cidade,
          origem_uf: linha.origem_uf,
          destinatario: linha.destinatario,
          destino: linha.destino_cidade,
          destino_cidade: linha.destino_cidade,
          destino_uf: linha.destino_uf,
          produto: linha.produto,
          tipo_veiculo: linha.tipo_veiculo,
          tipo_carroceria: linha.tipo_carroceria,
          peso: parseFloat(linha.peso),
          // Add valor_tonelada if it exists on the line, otherwise null
          valor_tonelada: linha.valor_tonelada ? parseFloat(linha.valor_tonelada) : null,
          frete_viagem: parseFloat(linha.frete_viagem),
          valor_total_frete: parseFloat(linha.frete_viagem),
          observacao_carga: linha.observacao_carga,
          carregamento_agendamento_data: linha.carregamento_agendamento_data ? new Date(linha.carregamento_agendamento_data).toISOString() : null,
          descarga_agendamento_data: linha.descarga_agendamento_data ? new Date(linha.descarga_agendamento_data).toISOString() : null,
          status_tracking: linha.carregamento_agendamento_data ? "carregamento_agendado" : "aguardando_agendamento",
          viagem_pedido: linha.viagem_pedido || null,
          cliente_final_nome: clienteFinalNome,
          cliente_final_cnpj: clienteFinalCnpj
        };
      });

      await onSubmit(ofertasFormatadas);

      toast.success(`${ofertasFormatadas.length} ofertas de carga criadas com sucesso!`);
      onClose();

      // Reset
      setLinhas([{
        id: 1,
        operacao_id: "",
        modalidade_carga: "normal",
        tipo_operacao: "FOB",
        cliente: "",
        origem_cidade: "",
        origem_uf: "",
        destinatario: "",
        destino_cidade: "",
        destino_uf: "",
        produto: "",
        tipo_veiculo: "",
        tipo_carroceria: "",
        peso: "",
        frete_viagem: "",
        observacao_carga: "",
        carregamento_agendamento_data: "",
        descarga_agendamento_data: "",
        viagem_pedido: ""
      }]);
    } catch (error) {
      console.error("Erro ao salvar ofertas:", error);
      toast.error("Erro ao salvar ofertas em lote");
    } finally {
      setSalvando(false);
    }
  };

  const exportarModelo = () => {
    const headers = [
      "Operação*", "Cliente/Remetente*", "Cidade Origem*", "UF Origem",
      "Destinatário", "Cidade Destino*", "UF Destino",
      "Produto*", "Tipo Veículo", "Tipo Carroceria",
      "Peso (kg)*", "Frete Viagem*", "Observações",
      "Viagem/Pedido",
      "Carregamento Agendamento Data (YYYY-MM-DDTHH:MM)",
      "Descarga Agendamento Data (YYYY-MM-DDTHH:MM)",
      "Tipo Operação (FOB/CIF)",
      "Valor por Tonelada",
      "CNPJ Cliente",
      "CNPJ Destinatário"
    ];

    const csvContent = headers.join(",") + "\n" +
      '"ID_OPERACAO_EXEMPLO_1","Exemplo Cliente","São Paulo","SP","Exemplo Dest","Rio de Janeiro","RJ","Minério de Ferro","RODOTREM","SIDER","48000","5000.00","Carga urgente","123456","2023-10-27T08:00","2023-10-28T17:00","FOB","104.17","11.222.333/0001-44","55.666.777/0001-88"';

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "modelo_ofertas_carga.csv");
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success("Modelo baixado! Preencha e importe de volta.");
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[98vw] max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="w-6 h-6 mr-2 text-green-600" />
              <DialogTitle>Lançamento em Lote - Ofertas de Carga</DialogTitle>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={exportarModelo}
              className="text-green-600 border-green-600 hover:bg-green-50"
            >
              <Download className="w-4 h-4 mr-2" />
              Baixar Modelo CSV
            </Button>
          </div>
          <p className="text-sm text-gray-500">
            Adicione múltiplas ofertas de uma vez - Campos obrigatórios marcados com *
          </p>
        </DialogHeader>

        <div className="flex-1 overflow-auto border rounded-lg">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 sticky top-0 z-10">
              <tr className="border-b">
                <th className="p-2 text-left font-semibold w-8">#</th>
                <th className="p-2 text-left font-semibold min-w-[150px]">Operação* 🏢</th>
                <th className="p-2 text-left font-semibold min-w-[150px]">Cliente* 📦</th>
                <th className="p-2 text-left font-semibold min-w-[120px]">Origem* 📍</th>
                <th className="p-2 text-left font-semibold w-20">UF</th>
                <th className="p-2 text-left font-semibold min-w-[150px]">Destinatário</th>
                <th className="p-2 text-left font-semibold min-w-[120px]">Destino* 🎯</th>
                <th className="p-2 text-left font-semibold w-20">UF</th>
                <th className="p-2 text-left font-semibold min-w-[150px]">Produto* 📦</th>
                <th className="p-2 text-left font-semibold min-w-[100px]">Peso (kg)*</th>
                <th className="p-2 text-left font-semibold min-w-[120px]">Frete* 💰</th>
                <th className="p-2 text-left font-semibold min-w-[120px]">Viagem/Pedido</th>
                <th className="p-2 text-left font-semibold min-w-[140px]">Carregamento 📅</th>
                <th className="p-2 text-left font-semibold min-w-[140px]">Descarga 📅</th>
                <th className="p-2 text-left font-semibold w-20">Ações</th>
              </tr>
            </thead>
            <tbody>
              {linhas.map((linha, index) => {
                const erros = validarLinha(linha);
                const temErro = erros.length > 0;

                return (
                  <tr key={linha.id} className={`border-b hover:bg-gray-50 ${temErro ? 'bg-red-50' : ''}`}>
                    <td className="p-2 text-center text-gray-500 font-medium">{index + 1}</td>

                    <td className="p-2">
                      <Select 
                        value={linha.operacao_id} 
                        onValueChange={(value) => atualizarLinha(linha.id, "operacao_id", value)}
                      >
                        <SelectTrigger className={`h-8 text-xs ${!linha.operacao_id && temErro ? 'border-red-500' : ''}`}>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          {operacoes.map((op) => (
                            <SelectItem key={op.id} value={op.id}>{op.nome}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </td>

                    <td className="p-2">
                      <Input
                        value={linha.cliente}
                        onChange={(e) => atualizarLinha(linha.id, "cliente", e.target.value)}
                        placeholder="Nome do cliente"
                        className={`h-8 text-xs ${!linha.cliente && temErro ? 'border-red-500' : ''}`}
                      />
                    </td>

                    <td className="p-2">
                      <Input
                        value={linha.origem_cidade}
                        onChange={(e) => atualizarLinha(linha.id, "origem_cidade", e.target.value)}
                        placeholder="Cidade"
                        className={`h-8 text-xs ${!linha.origem_cidade && temErro ? 'border-red-500' : ''}`}
                      />
                    </td>

                    <td className="p-2">
                      <Input
                        value={linha.origem_uf}
                        onChange={(e) => atualizarLinha(linha.id, "origem_uf", e.target.value)}
                        placeholder="SP"
                        maxLength={2}
                        className="h-8 text-xs text-center font-bold w-full min-w-[50px]"
                      />
                    </td>

                    <td className="p-2">
                      <Input
                        value={linha.destinatario}
                        onChange={(e) => atualizarLinha(linha.id, "destinatario", e.target.value)}
                        placeholder="Nome destinatário"
                        className="h-8 text-xs"
                      />
                    </td>

                    <td className="p-2">
                      <Input
                        value={linha.destino_cidade}
                        onChange={(e) => atualizarLinha(linha.id, "destino_cidade", e.target.value)}
                        placeholder="Cidade"
                        className={`h-8 text-xs ${!linha.destino_cidade && temErro ? 'border-red-500' : ''}`}
                      />
                    </td>

                    <td className="p-2">
                      <Input
                        value={linha.destino_uf}
                        onChange={(e) => atualizarLinha(linha.id, "destino_uf", e.target.value)}
                        placeholder="RJ"
                        maxLength={2}
                        className="h-8 text-xs text-center font-bold w-full min-w-[50px]"
                      />
                    </td>

                    <td className="p-2">
                      <Input
                        value={linha.produto}
                        onChange={(e) => atualizarLinha(linha.id, "produto", e.target.value)}
                        placeholder="Ex: Minério"
                        className={`h-8 text-xs ${!linha.produto && temErro ? 'border-red-500' : ''}`}
                      />
                    </td>

                    <td className="p-2">
                      <Input
                        type="number"
                        value={linha.peso}
                        onChange={(e) => atualizarLinha(linha.id, "peso", e.target.value)}
                        placeholder="0"
                        className={`h-8 text-xs ${(!linha.peso || parseFloat(linha.peso) <= 0) && temErro ? 'border-red-500' : ''}`}
                      />
                    </td>

                    <td className="p-2">
                      <Input
                        type="number"
                        step="0.01"
                        value={linha.frete_viagem}
                        onChange={(e) => atualizarLinha(linha.id, "frete_viagem", e.target.value)}
                        placeholder="0.00"
                        className={`h-8 text-xs ${(!linha.frete_viagem || parseFloat(linha.frete_viagem) <= 0) && temErro ? 'border-red-500' : ''}`}
                      />
                    </td>

                    <td className="p-2">
                      <Input
                        value={linha.viagem_pedido}
                        onChange={(e) => atualizarLinha(linha.id, "viagem_pedido", e.target.value)}
                        placeholder="Nº"
                        className="h-8 text-xs"
                      />
                    </td>

                    <td className="p-2">
                      <Input
                        type="datetime-local"
                        value={linha.carregamento_agendamento_data}
                        onChange={(e) => atualizarLinha(linha.id, "carregamento_agendamento_data", e.target.value)}
                        className="h-8 text-xs"
                      />
                    </td>

                    <td className="p-2">
                      <Input
                        type="datetime-local"
                        value={linha.descarga_agendamento_data}
                        onChange={(e) => atualizarLinha(linha.id, "descarga_agendamento_data", e.target.value)}
                        className="h-8 text-xs"
                      />
                    </td>

                    <td className="p-2">
                      <div className="flex gap-1 justify-center">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => duplicarLinha(linha.id)}
                          className="h-7 w-7 p-0 hover:bg-blue-50 hover:text-blue-600"
                          title="Duplicar linha"
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removerLinha(linha.id)}
                          className="h-7 w-7 p-0 hover:bg-red-50 hover:text-red-600"
                          title="Remover linha"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between pt-4 border-t">
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={adicionarLinha}
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Adicionar Linha
            </Button>

            <Badge variant="outline" className="text-gray-600">
              {linhas.length} {linhas.length === 1 ? 'oferta' : 'ofertas'}
            </Badge>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose} type="button">
              <X className="w-4 h-4 mr-2" />
              Cancelar
            </Button>
            <Button
              onClick={handleSalvarLote}
              disabled={salvando}
              className="bg-green-600 hover:bg-green-700"
            >
              {salvando ? (
                <>Salvando...</>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Salvar {linhas.length} {linhas.length === 1 ? 'Oferta' : 'Ofertas'}
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
