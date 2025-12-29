import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Loader2, Calendar } from "lucide-react";
import { toast } from "sonner";

export default function ProcessarEtapasNovembro() {
  const [processando, setProcessando] = useState(false);
  const [resultado, setResultado] = useState(null);

  const processar = async () => {
    setProcessando(true);
    setResultado(null);

    try {
      console.log('🔄 Carregando dados...');
      
      // Buscar todas as ordens e etapas
      const [todasOrdens, todasEtapas] = await Promise.all([
        base44.entities.OrdemDeCarregamento.list(),
        base44.entities.OrdemEtapa.list()
      ]);

      console.log(`📊 ${todasOrdens.length} ordens e ${todasEtapas.length} etapas`);

      // Filtrar ordens de novembro/2025
      const ordensPeriodo = todasOrdens.filter(ordem => {
        if (!ordem.created_date) return false;
        const data = new Date(ordem.created_date);
        const mes = data.getMonth() + 1;
        const ano = data.getFullYear();
        return mes === 11 && ano === 2025;
      });

      console.log(`✅ ${ordensPeriodo.length} ordens de novembro`);
      toast.info(`Encontradas ${ordensPeriodo.length} ordens de novembro`);

      // Filtrar etapas não concluídas dessas ordens
      const ordensIds = new Set(ordensPeriodo.map(o => o.id));
      const etapasParaConcluir = todasEtapas.filter(oe => 
        ordensIds.has(oe.ordem_id) && 
        oe.status !== "concluida" && 
        oe.status !== "cancelada"
      );

      console.log(`📋 ${etapasParaConcluir.length} etapas para concluir`);
      toast.info(`${etapasParaConcluir.length} etapas para concluir`);

      // Atualizar todas as etapas
      const dataAtual = new Date().toISOString();
      let atualizadas = 0;

      for (const etapa of etapasParaConcluir) {
        await base44.entities.OrdemEtapa.update(etapa.id, {
          status: "concluida",
          data_conclusao: dataAtual,
          data_inicio: etapa.data_inicio || dataAtual
        });
        atualizadas++;

        if (atualizadas % 50 === 0) {
          toast.loading(`Processando: ${atualizadas}/${etapasParaConcluir.length}`);
        }
      }

      console.log(`✅ ${atualizadas} etapas concluídas`);

      setResultado({
        ordensNoPeriodo: ordensPeriodo.length,
        etapasAtualizadas: atualizadas
      });

      toast.success(`✅ ${atualizadas} etapas de novembro concluídas!`);

    } catch (error) {
      console.error('❌ Erro:', error);
      toast.error(`Erro: ${error.message}`);
    } finally {
      setProcessando(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 p-6">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              Processar Etapas de Novembro/2025
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Esta ação irá marcar como <strong>concluídas</strong> todas as etapas não concluídas 
              das ordens criadas em novembro de 2025.
            </p>

            <Button
              onClick={processar}
              disabled={processando}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              {processando ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processando...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Concluir Etapas de Novembro
                </>
              )}
            </Button>

            {resultado && (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <h3 className="font-bold text-green-800 dark:text-green-400 mb-2">
                  ✅ Processamento Concluído
                </h3>
                <div className="text-sm text-green-700 dark:text-green-300 space-y-1">
                  <p>• {resultado.ordensNoPeriodo} ordens de novembro/2025</p>
                  <p>• {resultado.etapasAtualizadas} etapas marcadas como concluídas</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}