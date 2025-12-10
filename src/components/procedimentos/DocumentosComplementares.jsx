
import React from "react";
import { Card, CardContent } from "@/components/ui/card";

export { ManualSistemaCompleto } from "./ManualSistemaABNT";
export { InstrucaoOcorrenciasDetalhada } from "./OcorrenciasABNT";

export function InstrucaoOcorrenciasDetalhada({ theme, isDark }) {
  return (
    <Card style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}>
      <CardContent className="p-8 space-y-6">
        <div className="border-b pb-6" style={{ borderColor: theme.cardBorder }}>
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h1 className="text-2xl font-bold mb-2" style={{ color: theme.text }}>
                INSTRUÇÃO DE TRABALHO
              </h1>
              <h2 className="text-xl font-semibold mb-1" style={{ color: theme.text }}>
                Gestão de Ocorrências e Não Conformidades
              </h2>
            </div>
            <div className="text-right text-sm" style={{ color: theme.textMuted }}>
              <p className="font-bold">Código: IT-LOG-003</p>
              <p>Revisão: 01</p>
              <p>Data: 09/12/2024</p>
              <p>Páginas: 1/3</p>
            </div>
          </div>
          
          <div className="grid grid-cols-4 gap-3 text-sm mb-4">
            <div>
              <p className="font-semibold" style={{ color: theme.text }}>Elaborado:</p>
              <p style={{ color: theme.textMuted }}>Qualidade</p>
            </div>
            <div>
              <p className="font-semibold" style={{ color: theme.text }}>Aprovado:</p>
              <p style={{ color: theme.textMuted }}>Dir. Qualidade</p>
            </div>
            <div>
              <p className="font-semibold" style={{ color: theme.text }}>Processo:</p>
              <p style={{ color: theme.textMuted }}>PO-LOG-001</p>
            </div>
            <div>
              <p className="font-semibold" style={{ color: theme.text }}>Próxima Revisão:</p>
              <p style={{ color: theme.textMuted }}>09/12/2025</p>
            </div>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded p-2 text-xs">
            <p style={{ color: theme.textMuted }}>
              <strong>Referência:</strong> ISO 9001:2015 (10.2, 10.3) | ISO 31000:2018 | SASSMAQ v.7 (4.2, 4.3)
            </p>
          </div>
        </div>

        <section>
          <h3 className="text-lg font-bold mb-3" style={{ color: theme.text }}>1. OBJETIVO</h3>
          <p className="text-sm" style={{ color: theme.textMuted }}>
            Estabelecer metodologia padronizada para identificação, registro, classificação, tratamento, análise 
            e prevenção de ocorrências operacionais, garantindo melhoria contínua e conformidade com 
            NBR ISO 9001:2015 (Não conformidade e ação corretiva).
          </p>
        </section>

        <section>
          <h3 className="text-lg font-bold mb-3" style={{ color: theme.text }}>2. CATEGORIAS E RESPONSABILIDADES</h3>
          <p className="text-sm mb-3" style={{ color: theme.textMuted }>
            O sistema possui 4 categorias de ocorrências: Tracking, Fluxo, Tarefa e Diária. 
            Todos os usuários são responsáveis por identificar e registrar ocorrências.
          </p>
        </section>

        <div className="border-t pt-4 mt-8 text-xs text-center space-y-1" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>
          <p className="font-semibold">Documento controlado eletronicamente</p>
          <p>Versão impressa é cópia não controlada</p>
        </div>
      </CardContent>
    </Card>
  );
}
