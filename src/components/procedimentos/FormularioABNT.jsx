import React from "react";
import { Card, CardContent } from "@/components/ui/card";

export function FormularioOrdemCarregamento({ theme, isDark }) {
  return (
    <Card style={{ backgroundColor: '#ffffff', borderColor: '#000000', border: '2px solid #000000' }}>
      <CardContent className="p-8 space-y-6">
        <div className="border-b-2 pb-6 border-black">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h1 className="text-2xl font-bold mb-2 text-black">
                FORMULÁRIO
              </h1>
              <h2 className="text-xl font-semibold mb-1 text-black">
                Ordem de Carregamento
              </h2>
            </div>
            <div className="text-right text-sm text-black">
              <p className="font-bold">Código: FR-LOG-001</p>
              <p>Revisão: 01</p>
              <p>Data: 09/12/2024</p>
            </div>
          </div>
        </div>

        <section className="border-2 rounded-lg p-4 border-black">
          <h3 className="font-bold text-base mb-4 bg-black text-white px-3 py-2 -mx-4 -mt-4 rounded-t-lg">
            1. IDENTIFICAÇÃO
          </h3>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <p className="font-semibold mb-1 text-black">Número Carga:</p>
              <div className="border-2 border-black rounded px-3 py-2 bg-white">
                <span className="text-gray-400 text-xs">Automático</span>
              </div>
            </div>
            <div>
              <p className="font-semibold mb-1 text-black">Data:</p>
              <div className="border-2 border-black rounded px-3 py-2"></div>
            </div>
            <div>
              <p className="font-semibold mb-1 text-black">Tipo:</p>
              <div className="flex gap-2 text-xs">
                <label><input type="checkbox" /> Oferta</label>
                <label><input type="checkbox" /> Alocado</label>
              </div>
            </div>
          </div>
        </section>

        <section className="border-2 rounded-lg p-4 border-black">
          <h3 className="font-bold text-base mb-4 bg-black text-white px-3 py-2 -mx-4 -mt-4 rounded-t-lg">
            2. DADOS DO CLIENTE
          </h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="font-semibold mb-1 text-black">Razão Social:</p>
              <div className="border-2 border-black rounded px-3 py-2"></div>
            </div>
            <div>
              <p className="font-semibold mb-1 text-black">CNPJ:</p>
              <div className="border-2 border-black rounded px-3 py-2"></div>
            </div>
            <div className="col-span-2">
              <p className="font-semibold mb-1 text-black">Tipo Operação:</p>
              <div className="flex gap-4 text-xs">
                <label><input type="radio" name="tipo" /> CIF (Cliente Remetente)</label>
                <label><input type="radio" name="tipo" /> FOB (Cliente Destinatário)</label>
              </div>
            </div>
          </div>
        </section>

        <section className="border-2 rounded-lg p-4 border-black">
          <h3 className="font-bold text-base mb-4 bg-black text-white px-3 py-2 -mx-4 -mt-4 rounded-t-lg">
            3. DADOS DA CARGA
          </h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="font-semibold mb-1 text-black">Origem:</p>
              <div className="border-2 border-black rounded px-3 py-2"></div>
            </div>
            <div>
              <p className="font-semibold mb-1 text-black">Destino:</p>
              <div className="border-2 border-black rounded px-3 py-2"></div>
            </div>
            <div>
              <p className="font-semibold mb-1 text-black">Produto:</p>
              <div className="border-2 border-black rounded px-3 py-2"></div>
            </div>
            <div>
              <p className="font-semibold mb-1 text-black">Peso (kg):</p>
              <div className="border-2 border-black rounded px-3 py-2"></div>
            </div>
          </div>
        </section>

        <section className="border-2 rounded-lg p-4 border-black">
          <h3 className="font-bold text-base mb-4 bg-black text-white px-3 py-2 -mx-4 -mt-4 rounded-t-lg">
            4. RECURSOS
          </h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="font-semibold mb-1 text-black">Motorista:</p>
              <div className="border-2 border-black rounded px-3 py-2"></div>
            </div>
            <div>
              <p className="font-semibold mb-1 text-black">Placa Cavalo:</p>
              <div className="border-2 border-black rounded px-3 py-2"></div>
            </div>
          </div>
        </section>

        <section className="border-2 rounded-lg p-4 border-black">
          <h3 className="font-bold text-base mb-4 bg-black text-white px-3 py-2 -mx-4 -mt-4 rounded-t-lg">
            5. VALORES
          </h3>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <p className="font-semibold mb-1 text-black">Frete:</p>
              <div className="border-2 border-black rounded px-3 py-2 text-black">R$ _______</div>
            </div>
            <div>
              <p className="font-semibold mb-1 text-black">Adiantamento:</p>
              <div className="border-2 border-black rounded px-3 py-2 text-black">R$ _______</div>
            </div>
            <div>
              <p className="font-semibold mb-1 text-black">Saldo:</p>
              <div className="border-2 border-black rounded px-3 py-2 text-black">R$ _______</div>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-3 gap-6 mt-12">
          <div className="text-center">
            <div className="border-t-2 border-black pt-2 mt-8">
              <p className="text-xs font-semibold text-black">Solicitado por</p>
            </div>
          </div>
          <div className="text-center">
            <div className="border-t-2 border-black pt-2 mt-8">
              <p className="text-xs font-semibold text-black">Aprovado por</p>
            </div>
          </div>
          <div className="text-center">
            <div className="border-t-2 border-black pt-2 mt-8">
              <p className="text-xs font-semibold text-black">Data</p>
            </div>
          </div>
        </section>

        <div className="border-t-2 pt-4 mt-8 text-xs text-center border-black text-black">
          <p className="font-semibold">* Campos obrigatórios</p>
        </div>
      </CardContent>
    </Card>
  );
}