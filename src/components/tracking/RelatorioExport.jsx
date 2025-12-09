import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Download, FileText, Loader2, FileSpreadsheet, BarChart3 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';

export default function RelatorioExport({ ordens, motoristas, veiculos, operacoes }) {
  const [filtros, setFiltros] = useState({
    dataInicio: "",
    dataFim: ""
  });
  const [exportando, setExportando] = useState(false);
  const [tipoExportacao, setTipoExportacao] = useState(null);
  const [atualizandoClientes, setAtualizandoClientes] = useState(false);
  const [showRelatorioSLA, setShowRelatorioSLA] = useState(false);
  const [tipoRelatorioSLA, setTipoRelatorioSLA] = useState(null);

  // Função para preencher data/hora atual ao pressionar "H"
  const handleKeyDownDataInicio = (e) => {
    if (e.key === 'h' || e.key === 'H') {
      e.preventDefault();
      const hoje = new Date();
      const ano = hoje.getFullYear();
      const mes = String(hoje.getMonth() + 1).padStart(2, '0');
      const dia = String(hoje.getDate()).padStart(2, '0');
      setFiltros({ ...filtros, dataInicio: `${ano}-${mes}-${dia}` });
    }
  };

  const handleKeyDownDataFim = (e) => {
    if (e.key === 'h' || e.key === 'H') {
      e.preventDefault();
      const hoje = new Date();
      const ano = hoje.getFullYear();
      const mes = String(hoje.getMonth() + 1).padStart(2, '0');
      const dia = String(hoje.getDate()).padStart(2, '0');
      setFiltros({ ...filtros, dataFim: `${ano}-${mes}-${dia}` });
    }
  };

  // Nova função para atualizar cliente_final em todas as ordens
  const atualizarClientesFinal = async () => {
    setAtualizandoClientes(true);
    try {
      const todasOrdens = await base44.entities.OrdemDeCarregamento.list();
      let atualizadas = 0;

      for (const ordem of todasOrdens) {
        // Pular se já tem cliente_final_cnpj
        if (ordem.cliente_final_cnpj) continue;

        let clienteFinalNome = "";
        let clienteFinalCnpj = "";

        if (ordem.tipo_operacao === "CIF") {
          // CIF: cliente é o remetente
          clienteFinalNome = ordem.cliente;
          clienteFinalCnpj = ordem.cliente_cnpj;
        } else if (ordem.tipo_operacao === "FOB") {
          // FOB: cliente é o destinatário
          clienteFinalNome = ordem.destinatario || ordem.destino;
          clienteFinalCnpj = ordem.destinatario_cnpj;
        } else {
          // Se não tem tipo_operacao, assume FOB como padrão
          clienteFinalNome = ordem.destinatario || ordem.destino;
          clienteFinalCnpj = ordem.destinatario_cnpj;
        }

        if (clienteFinalNome || clienteFinalCnpj) {
          await base44.entities.OrdemDeCarregamento.update(ordem.id, {
            cliente_final_nome: clienteFinalNome,
            cliente_final_cnpj: clienteFinalCnpj
          });
          atualizadas++;
        }
      }

      toast.success(`${atualizadas} ordens atualizadas com cliente final!`);
    } catch (error) {
      console.error("Erro ao atualizar clientes:", error);
      toast.error("Erro ao atualizar clientes finais");
    } finally {
      setAtualizandoClientes(false);
    }
  };

  const getMotorista = (motoristaId) => {
    return motoristas.find(m => m.id === motoristaId);
  };

  const getVeiculo = (veiculoId) => {
    return veiculos.find(v => v.id === veiculoId);
  };

  const filtrarOrdens = () => {
    let ordensFiltradas = [...ordens];

    if (filtros.dataInicio) {
      ordensFiltradas = ordensFiltradas.filter(o => 
        o.data_solicitacao && new Date(o.data_solicitacao) >= new Date(filtros.dataInicio)
      );
    }

    if (filtros.dataFim) {
      const dataFim = new Date(filtros.dataFim);
      dataFim.setHours(23, 59, 59);
      ordensFiltradas = ordensFiltradas.filter(o => 
        o.data_solicitacao && new Date(o.data_solicitacao) <= dataFim
      );
    }

    return ordensFiltradas;
  };

  const prepararDadosOrdens = () => {
    const ordensFiltradas = filtrarOrdens();

    return ordensFiltradas.map(ordem => {
      const motorista = getMotorista(ordem.motorista_id);
      const cavalo = getVeiculo(ordem.cavalo_id);
      const implemento1 = getVeiculo(ordem.implemento1_id);

      return {
        ...ordem,
        motorista_nome: motorista?.nome || "",
        cavalo_placa: cavalo?.placa || "",
        implemento1_placa: implemento1?.placa || ""
      };
    });
  };

  const exportarPDF = async () => {
    setExportando(true);
    setTipoExportacao('pdf');
    try {
      const ordensParaPdf = prepararDadosOrdens();

      const response = await base44.functions.invoke('gerarPdfTracking', {
        ordens: ordensParaPdf
      });

      // Criar blob e fazer download
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `tracking_${new Date().getTime()}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();

      toast.success("PDF gerado com sucesso!");
      
    } catch (error) {
      console.error("Erro ao exportar PDF:", error);
      toast.error("Erro ao exportar relatório PDF");
    } finally {
      setExportando(false);
      setTipoExportacao(null);
    }
  };

  const exportarExcel = async () => {
    setExportando(true);
    setTipoExportacao('excel');
    try {
      const ordensParaExcel = prepararDadosOrdens();

      if (ordensParaExcel.length === 0) {
        toast.error("Não há ordens para exportar");
        setExportando(false);
        setTipoExportacao(null);
        return;
      }

      const response = await base44.functions.invoke('gerarExcelTracking', {
        ordens: ordensParaExcel
      });

      // Verificar se a resposta é válida
      if (!response.data) {
        throw new Error("Resposta inválida do servidor");
      }

      // Criar blob a partir dos dados binários (CSV)
      const blob = new Blob([response.data], { 
        type: 'text/csv; charset=utf-8' 
      });

      // Verificar se o blob foi criado corretamente
      if (blob.size === 0) {
        throw new Error("Arquivo vazio");
      }

      // Criar URL e fazer download
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `tracking_${new Date().getTime()}.csv`;
      document.body.appendChild(a);
      a.click();
      
      // Limpar
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
        a.remove();
      }, 100);

      toast.success("Planilha gerada com sucesso! Abra no Excel.");
      
    } catch (error) {
      console.error("Erro ao exportar Excel:", error);
      toast.error(`Erro ao exportar planilha: ${error.message}`);
    } finally {
      setExportando(false);
      setTipoExportacao(null);
    }
  };

  const prepararDadosSLA = (tipo) => {
    const ordensFiltradas = filtrarOrdens();
    
    if (tipo === 'geral') {
      // Dados agregados de carga e entrega
      let carregamentosNoPrazo = 0;
      let carregamentosForaPrazo = 0;
      let carregamentosExpurgados = 0;
      let descargasNoPrazo = 0;
      let descargasForaPrazo = 0;
      let descargasExpurgadas = 0;
      
      const expurgos = [];

      ordensFiltradas.forEach(ordem => {
        // Processar carregamento
        if (ordem.fim_carregamento && ordem.carregamento_agendamento_data) {
          if (ordem.carregamento_expurgado) {
            carregamentosExpurgados++;
            expurgos.push({
              tipo: 'Carregamento',
              ordem: ordem.numero_carga || `#${ordem.id.slice(-6)}`,
              motivo: ordem.carregamento_expurgo_motivo || 'Não informado'
            });
          } else {
            const agendado = new Date(ordem.carregamento_agendamento_data);
            const realizado = new Date(ordem.fim_carregamento);
            if (realizado <= agendado) {
              carregamentosNoPrazo++;
            } else {
              carregamentosForaPrazo++;
            }
          }
        }

        // Processar descarga
        if (ordem.chegada_destino && ordem.prazo_entrega) {
          if (ordem.entrega_expurgada) {
            descargasExpurgadas++;
            expurgos.push({
              tipo: 'Entrega',
              ordem: ordem.numero_carga || `#${ordem.id.slice(-6)}`,
              motivo: ordem.entrega_expurgo_motivo || 'Não informado'
            });
          } else {
            const prazo = new Date(ordem.prazo_entrega);
            const realizado = new Date(ordem.chegada_destino);
            if (realizado <= prazo) {
              descargasNoPrazo++;
            } else {
              descargasForaPrazo++;
            }
          }
        }
      });

      return {
        grafico: [
          { nome: 'No Prazo', Carregamento: carregamentosNoPrazo, Entrega: descargasNoPrazo },
          { nome: 'Fora do Prazo', Carregamento: carregamentosForaPrazo, Entrega: descargasForaPrazo },
          { nome: 'Expurgado', Carregamento: carregamentosExpurgados, Entrega: descargasExpurgadas }
        ],
        expurgos
      };
    } else if (tipo === 'carga') {
      // Dados específicos de carregamento agrupados por data
      const dadosPorData = {};
      const expurgos = [];

      ordensFiltradas.forEach(ordem => {
        if (ordem.fim_carregamento && ordem.carregamento_agendamento_data) {
          const data = new Date(ordem.carregamento_agendamento_data).toLocaleDateString('pt-BR');
          
          if (!dadosPorData[data]) {
            dadosPorData[data] = { noPrazo: 0, foraPrazo: 0, expurgado: 0 };
          }

          if (ordem.carregamento_expurgado) {
            dadosPorData[data].expurgado++;
            expurgos.push({
              data,
              ordem: ordem.numero_carga || `#${ordem.id.slice(-6)}`,
              motivo: ordem.carregamento_expurgo_motivo || 'Não informado'
            });
          } else {
            const agendado = new Date(ordem.carregamento_agendamento_data);
            const realizado = new Date(ordem.fim_carregamento);
            if (realizado <= agendado) {
              dadosPorData[data].noPrazo++;
            } else {
              dadosPorData[data].foraPrazo++;
            }
          }
        }
      });

      const grafico = Object.entries(dadosPorData).map(([data, valores]) => ({
        data,
        'No Prazo': valores.noPrazo,
        'Fora do Prazo': valores.foraPrazo,
        'Expurgado': valores.expurgado
      }));

      return { grafico, expurgos };
    } else if (tipo === 'entrega') {
      // Dados específicos de entrega agrupados por data
      const dadosPorData = {};
      const expurgos = [];

      ordensFiltradas.forEach(ordem => {
        if (ordem.chegada_destino && ordem.prazo_entrega) {
          const data = new Date(ordem.prazo_entrega).toLocaleDateString('pt-BR');
          
          if (!dadosPorData[data]) {
            dadosPorData[data] = { noPrazo: 0, foraPrazo: 0, expurgado: 0 };
          }

          if (ordem.entrega_expurgada) {
            dadosPorData[data].expurgado++;
            expurgos.push({
              data,
              ordem: ordem.numero_carga || `#${ordem.id.slice(-6)}`,
              motivo: ordem.entrega_expurgo_motivo || 'Não informado'
            });
          } else {
            const prazo = new Date(ordem.prazo_entrega);
            const realizado = new Date(ordem.chegada_destino);
            if (realizado <= prazo) {
              dadosPorData[data].noPrazo++;
            } else {
              dadosPorData[data].foraPrazo++;
            }
          }
        }
      });

      const grafico = Object.entries(dadosPorData).map(([data, valores]) => ({
        data,
        'No Prazo': valores.noPrazo,
        'Fora do Prazo': valores.foraPrazo,
        'Expurgado': valores.expurgado
      }));

      return { grafico, expurgos };
    }
  };

  const RelatorioSLAModal = ({ tipo, onClose }) => {
    const dados = prepararDadosSLA(tipo);
    const titulo = tipo === 'geral' ? 'Relatório de SLA Geral' : tipo === 'carga' ? 'Relatório de SLA - Carregamento' : 'Relatório de SLA - Entrega';

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <Card className="w-full max-w-6xl max-h-[90vh] overflow-auto dark:bg-slate-900 dark:border-slate-800">
          <CardHeader className="border-b dark:border-slate-800">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg dark:text-white">{titulo}</CardTitle>
              <Button variant="ghost" size="sm" onClick={onClose}>✕</Button>
            </div>
          </CardHeader>
          <CardContent className="p-4 space-y-4">
            {/* Gráfico */}
            <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border dark:border-slate-700">
              <h3 className="text-sm font-semibold mb-4 dark:text-white">
                {tipo === 'geral' ? 'Desempenho de SLA' : `Desempenho por ${tipo === 'carga' ? 'Data de Carregamento' : 'Data de Entrega'}`}
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={dados.grafico}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey={tipo === 'geral' ? 'nome' : 'data'} tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Legend />
                  {tipo === 'geral' ? (
                    <>
                      <Bar dataKey="Carregamento" fill="#3b82f6" />
                      <Bar dataKey="Entrega" fill="#8b5cf6" />
                    </>
                  ) : (
                    <>
                      <Bar dataKey="No Prazo" fill="#22c55e" />
                      <Bar dataKey="Fora do Prazo" fill="#ef4444" />
                      <Bar dataKey="Expurgado" fill="#64748b" />
                    </>
                  )}
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Tabela de Expurgos */}
            {dados.expurgos.length > 0 && (
              <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border dark:border-slate-700">
                <h3 className="text-sm font-semibold mb-3 dark:text-white">Expurgos Registrados</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b dark:border-slate-700">
                        {tipo === 'geral' && <th className="text-left p-2 dark:text-gray-300">Tipo</th>}
                        {tipo !== 'geral' && <th className="text-left p-2 dark:text-gray-300">Data</th>}
                        <th className="text-left p-2 dark:text-gray-300">Ordem</th>
                        <th className="text-left p-2 dark:text-gray-300">Motivo</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dados.expurgos.map((exp, idx) => (
                        <tr key={idx} className="border-b dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700">
                          {tipo === 'geral' && <td className="p-2 dark:text-gray-300">{exp.tipo}</td>}
                          {tipo !== 'geral' && <td className="p-2 dark:text-gray-300">{exp.data}</td>}
                          <td className="p-2 font-mono dark:text-gray-300">{exp.ordem}</td>
                          <td className="p-2 dark:text-gray-300">{exp.motivo}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <>
      <Card className="shadow border border-gray-200 dark:bg-slate-900 dark:border-slate-800">
        <CardHeader className="pb-1.5 pt-2 px-3 bg-gradient-to-r from-gray-50 to-blue-50 dark:from-slate-900 dark:to-slate-900 border-b dark:border-slate-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-blue-600 dark:bg-blue-500 rounded flex items-center justify-center">
                <Download className="w-4 h-4 text-white" />
              </div>
              <CardTitle className="text-sm font-semibold dark:text-white">Exportar Relatório de Tracking</CardTitle>
            </div>
            <Button
              onClick={atualizarClientesFinal}
              disabled={atualizandoClientes}
              variant="outline"
              size="sm"
              className="h-7 text-[10px] dark:border-slate-700 dark:hover:bg-slate-800 dark:text-gray-300"
            >
              {atualizandoClientes ? (
                <>
                  <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                  Atualizando...
                </>
              ) : (
                "🔄 Atualizar Cliente Final"
              )}
            </Button>
          </div>
        </CardHeader>
      <CardContent className="p-3 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-xs dark:text-gray-300">
              Data Início 
              <span className="text-[10px] text-blue-600 dark:text-blue-400 ml-1">(Digite H para hoje)</span>
            </Label>
            <Input
              type="date"
              value={filtros.dataInicio}
              onChange={(e) => setFiltros({ ...filtros, dataInicio: e.target.value })}
              onKeyDown={handleKeyDownDataInicio}
              placeholder="dd/mm/aaaa"
              title="Digite H para hoje"
              className="h-8 text-sm dark:bg-slate-800 dark:border-slate-700 dark:text-white"
            />
          </div>
          <div>
            <Label className="text-xs dark:text-gray-300">
              Data Fim
              <span className="text-[10px] text-blue-600 dark:text-blue-400 ml-1">(Digite H para hoje)</span>
            </Label>
            <Input
              type="date"
              value={filtros.dataFim}
              onChange={(e) => setFiltros({ ...filtros, dataFim: e.target.value })}
              onKeyDown={handleKeyDownDataFim}
              placeholder="dd/mm/aaaa"
              title="Digite H para hoje"
              className="h-8 text-sm dark:bg-slate-800 dark:border-slate-700 dark:text-white"
            />
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-3">
          {/* Card PDF */}
          <Card className="border-2 border-red-200 dark:border-red-900/40 hover:border-red-400 dark:hover:border-red-700 transition-colors dark:bg-slate-800">
            <CardHeader className="pb-2 pt-2.5 px-3">
              <CardTitle className="text-sm flex items-center gap-1.5 dark:text-white">
                <FileText className="w-4 h-4 text-red-600 dark:text-red-400" />
                Exportar PDF
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 space-y-2">
              <p className="text-xs text-gray-700 dark:text-gray-300">
                Relatório completo em PDF profissional. Ideal para impressão e compartilhamento.
              </p>
              <ul className="text-[10px] text-gray-600 dark:text-gray-400 space-y-0.5">
                <li>✓ Layout formatado e visual</li>
                <li>✓ Todas as colunas organizadas</li>
                <li>✓ Múltiplas páginas automáticas</li>
                <li>✓ Cabeçalho em cada página</li>
              </ul>
              <Button
                onClick={exportarPDF}
                disabled={exportando || filtrarOrdens().length === 0}
                className="w-full bg-red-600 hover:bg-red-700 h-8 text-xs"
              >
                {exportando && tipoExportacao === 'pdf' ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                    Gerando PDF...
                  </>
                ) : (
                  <>
                    <FileText className="w-3.5 h-3.5 mr-1.5" />
                    Exportar PDF
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Card Excel/CSV */}
          <Card className="border-2 border-green-200 dark:border-green-900/40 hover:border-green-400 dark:hover:border-green-700 transition-colors dark:bg-slate-800">
            <CardHeader className="pb-2 pt-2.5 px-3">
              <CardTitle className="text-sm flex items-center gap-1.5 dark:text-white">
                <FileSpreadsheet className="w-4 h-4 text-green-600 dark:text-green-400" />
                Exportar Excel (CSV)
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 space-y-2">
              <p className="text-xs text-gray-700 dark:text-gray-300">
                Planilha CSV compatível com Excel. Ideal para análise de dados.
              </p>
              <ul className="text-[10px] text-gray-600 dark:text-gray-400 space-y-0.5">
                <li>✓ Formato CSV compatível</li>
                <li>✓ Abre direto no Excel</li>
                <li>✓ Todas as colunas incluídas</li>
                <li>✓ Acentuação corrigida</li>
              </ul>
              <Button
                onClick={exportarExcel}
                disabled={exportando || filtrarOrdens().length === 0}
                className="w-full bg-green-600 hover:bg-green-700 h-8 text-xs"
              >
                {exportando && tipoExportacao === 'excel' ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                    Gerando CSV...
                  </>
                ) : (
                  <>
                    <FileSpreadsheet className="w-3.5 h-3.5 mr-1.5" />
                    Exportar CSV
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Card Relatórios de SLA */}
          <Card className="border-2 border-purple-200 dark:border-purple-900/40 hover:border-purple-400 dark:hover:border-purple-700 transition-colors dark:bg-slate-800">
            <CardHeader className="pb-2 pt-2.5 px-3">
              <CardTitle className="text-sm flex items-center gap-1.5 dark:text-white">
                <BarChart3 className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                Relatórios de SLA
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 space-y-2">
              <p className="text-xs text-gray-700 dark:text-gray-300">
                Relatórios visuais com gráficos e análise de SLA.
              </p>
              <ul className="text-[10px] text-gray-600 dark:text-gray-400 space-y-0.5">
                <li>✓ Gráficos de barras</li>
                <li>✓ Análise de expurgos</li>
                <li>✓ Dados agrupados</li>
                <li>✓ Comparativo visual</li>
              </ul>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button className="w-full bg-purple-600 hover:bg-purple-700 h-8 text-xs">
                    <BarChart3 className="w-3.5 h-3.5 mr-1.5" />
                    Gerar Relatório SLA
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="dark:bg-slate-800 dark:border-slate-700">
                  <DropdownMenuItem 
                    onClick={() => {
                      setTipoRelatorioSLA('geral');
                      setShowRelatorioSLA(true);
                    }}
                    className="dark:text-gray-300 dark:hover:bg-slate-700"
                  >
                    📊 SLA Geral
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => {
                      setTipoRelatorioSLA('carga');
                      setShowRelatorioSLA(true);
                    }}
                    className="dark:text-gray-300 dark:hover:bg-slate-700"
                  >
                    📦 Agrupado por Data de Carregamento
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => {
                      setTipoRelatorioSLA('entrega');
                      setShowRelatorioSLA(true);
                    }}
                    className="dark:text-gray-300 dark:hover:bg-slate-700"
                  >
                    🚚 Agrupado por Data de Descarga
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-between items-center pt-3 border-t dark:border-slate-800">
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 bg-blue-600 dark:bg-blue-400 rounded-full animate-pulse"></div>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              {filtrarOrdens().length} {filtrarOrdens().length === 1 ? "ordem" : "ordens"} para exportar
            </p>
          </div>
          {filtrarOrdens().length === 0 && (
            <p className="text-[10px] text-orange-600 dark:text-orange-400">
              ⚠️ Nenhuma ordem disponível
            </p>
          )}
        </div>
      </CardContent>
    </Card>

    {showRelatorioSLA && tipoRelatorioSLA && (
      <RelatorioSLAModal 
        tipo={tipoRelatorioSLA} 
        onClose={() => {
          setShowRelatorioSLA(false);
          setTipoRelatorioSLA(null);
        }} 
      />
    )}
    </>
  );
}