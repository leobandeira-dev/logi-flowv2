import React from "react";
import { Card, CardContent } from "@/components/ui/card";

export function InstrucaoOrdensCarregamentoDetalhada({ theme, isDark }) {
  return (
    <Card style={{ backgroundColor: '#ffffff', borderColor: '#000000', border: '2px solid #000000' }}>
      <CardContent className="p-8 space-y-6">
        <div className="border-b-2 pb-6 border-black">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h1 className="text-2xl font-bold mb-2 text-black">
                INSTRUÇÃO DE TRABALHO
              </h1>
              <h2 className="text-xl font-semibold mb-1 text-black">
                Gestão de Ordens de Carregamento
              </h2>
            </div>
            <div className="text-right text-sm text-black">
              <p className="font-bold">Código: IT-LOG-001</p>
              <p>Revisão: 01</p>
              <p>Data: 09/12/2024</p>
            </div>
          </div>
          
          <div className="bg-white border-2 border-black rounded p-2 text-xs">
            <p className="text-black">
              <strong>Referência:</strong> ISO 9001:2015 | SASSMAQ v.7
            </p>
          </div>
        </div>

        <section>
          <h3 className="text-lg font-bold mb-3 text-black">1. OBJETIVO</h3>
          <p className="text-sm text-black">
            Padronizar a criação e controle de Ordens de Carregamento, assegurando rastreabilidade 
            e conformidade normativa.
          </p>
        </section>

        <section>
          <h3 className="text-lg font-bold mb-3 text-black">2. PROCEDIMENTO</h3>
          <ol className="ml-6 list-decimal text-sm space-y-2 text-black">
            <li>Acessar: Operações → Ordens → Nova Ordem</li>
            <li>Selecionar tipo: Ordem Completa, Oferta ou Lote</li>
            <li>Preencher dados obrigatórios do cliente e carga</li>
            <li>Vincular operação (SLA)</li>
            <li>Alocar recursos (motorista e veículo)</li>
            <li>Vincular notas fiscais (opcional)</li>
            <li>Salvar ordem</li>
          </ol>
        </section>

        <section>
          <h3 className="text-lg font-bold mb-3 text-black">3. CAMPOS OBRIGATÓRIOS</h3>
          <ul className="ml-6 list-disc text-sm space-y-1 text-black">
            <li>Cliente (razão social)</li>
            <li>Tipo de Operação (CIF/FOB)</li>
            <li>Origem e Destino</li>
            <li>Produto</li>
            <li>Peso (kg)</li>
            <li>Operação vinculada</li>
          </ul>
        </section>

        <div className="border-t-2 pt-4 mt-8 text-xs text-center border-black text-black">
          <p className="font-semibold">Documento controlado eletronicamente</p>
        </div>
      </CardContent>
    </Card>
  );
}

export function InstrucaoTrackingDetalhada({ theme, isDark }) {
  return (
    <Card style={{ backgroundColor: '#ffffff', borderColor: '#000000', border: '2px solid #000000' }}>
      <CardContent className="p-8 space-y-6">
        <div className="border-b-2 pb-6 border-black">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h1 className="text-2xl font-bold mb-2 text-black">
                INSTRUÇÃO DE TRABALHO
              </h1>
              <h2 className="text-xl font-semibold mb-1 text-black">
                Tracking e Rastreamento de Cargas
              </h2>
            </div>
            <div className="text-right text-sm text-black">
              <p className="font-bold">Código: IT-LOG-002</p>
              <p>Revisão: 01</p>
              <p>Data: 09/12/2024</p>
            </div>
          </div>
          
          <div className="bg-white border-2 border-black rounded p-2 text-xs">
            <p className="text-black">
              <strong>Referência:</strong> ISO 9001:2015 | SASSMAQ v.7
            </p>
          </div>
        </div>

        <section>
          <h3 className="text-lg font-bold mb-3 text-black">1. OBJETIVO</h3>
          <p className="text-sm text-black">
            Padronizar o monitoramento de cargas em trânsito, garantindo rastreabilidade 
            e controle de SLA.
          </p>
        </section>

        <section>
          <h3 className="text-lg font-bold mb-3 text-black">2. SEQUÊNCIA DE STATUS</h3>
          <ol className="ml-6 list-decimal text-sm space-y-1 text-black">
            <li>Aguardando Agendamento</li>
            <li>Carregamento Agendado</li>
            <li>Em Carregamento</li>
            <li>Carregado</li>
            <li>Em Viagem</li>
            <li>Chegada ao Destino</li>
            <li>Descarga Agendada</li>
            <li>Em Descarga</li>
            <li>Descarga Realizada</li>
            <li>Finalizado</li>
          </ol>
        </section>

        <section>
          <h3 className="text-lg font-bold mb-3 text-black">3. CONTROLE DE SLA</h3>
          <div className="text-sm space-y-2 text-black">
            <p><strong>SLA Carregamento:</strong> Agendamento + Tolerância</p>
            <p><strong>SLA Descarga:</strong> Prazo entrega + Tolerância</p>
            <p><strong>Expurgo:</strong> Atrasos justificados com evidência</p>
          </div>
        </section>

        <div className="border-t-2 pt-4 mt-8 text-xs text-center border-black text-black">
          <p className="font-semibold">Documento controlado eletronicamente</p>
        </div>
      </CardContent>
    </Card>
  );
}