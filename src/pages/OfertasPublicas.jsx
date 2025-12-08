import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Truck, AlertCircle, Loader2 } from "lucide-react";

export default function OfertasPublicas() {
  const [ordens, setOrdens] = useState([]);
  const [empresa, setEmpresa] = useState(null);
  const [numerosWhatsApp, setNumerosWhatsApp] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadOfertas();
  }, []);

  const loadOfertas = async () => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const ordensIds = urlParams.get('ordens')?.split(',') || [];
      const empresaId = urlParams.get('empresa');
      const whatsapp = urlParams.get('whatsapp')?.split(',') || [];

      if (ordensIds.length === 0) {
        setError("Nenhuma oferta selecionada");
        setLoading(false);
        return;
      }

      setNumerosWhatsApp(whatsapp);

      const todasOrdens = await base44.asServiceRole.entities.OrdemDeCarregamento.list();
      const ordensFiltradas = todasOrdens.filter(o => ordensIds.includes(o.id));

      setOrdens(ordensFiltradas);

      if (empresaId) {
        const empresaData = await base44.asServiceRole.entities.Empresa.get(empresaId);
        setEmpresa(empresaData);
      }

      setLoading(false);
    } catch (error) {
      console.error("Erro ao carregar ofertas:", error);
      setError("Erro ao carregar ofertas");
      setLoading(false);
    }
  };

  const dataAtual = format(new Date(), "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
  const horaAtual = format(new Date(), "HH:mm", { locale: ptBR });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Carregando ofertas...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-6">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Erro</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {empresa && (
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl shadow-lg p-8 mb-8">
            <h2 className="text-3xl font-bold mb-4">{empresa.nome_fantasia || empresa.razao_social}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              {empresa.razao_social && empresa.razao_social !== empresa.nome_fantasia && (
                <div><strong>Razão Social:</strong> {empresa.razao_social}</div>
              )}
              {empresa.endereco && (
                <div><strong>Endereço:</strong> {empresa.endereco}</div>
              )}
              {(empresa.cidade || empresa.estado) && (
                <div><strong>Cidade/UF:</strong> {empresa.cidade || ''} - {empresa.estado || ''}</div>
              )}
              {empresa.telefone && (
                <div><strong>Telefone:</strong> {empresa.telefone}</div>
              )}
              {empresa.email && (
                <div><strong>Email:</strong> {empresa.email}</div>
              )}
            </div>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <div className="text-center border-b pb-6 mb-6">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Truck className="w-12 h-12 text-blue-600" />
              <h1 className="text-4xl font-bold text-blue-900">
                OFERTAS DE CARGA DISPONÍVEIS
              </h1>
            </div>
            <p className="text-2xl font-semibold text-blue-700 mb-2">{dataAtual}</p>
            <p className="text-gray-600">Gerado às {horaAtual}</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
                  <th className="p-3 text-left text-sm font-semibold border border-blue-500">Nº</th>
                  <th className="p-3 text-left text-sm font-semibold border border-blue-500">Rota</th>
                  <th className="p-3 text-left text-sm font-semibold border border-blue-500">Modalidade</th>
                  <th className="p-3 text-left text-sm font-semibold border border-blue-500">Tipo Veíc.</th>
                  <th className="p-3 text-left text-sm font-semibold border border-blue-500">Peso</th>
                  <th className="p-3 text-left text-sm font-semibold border border-blue-500">Frete</th>
                  <th className="p-3 text-left text-sm font-semibold border border-blue-500">Agend. Carreg.</th>
                  <th className="p-3 text-left text-sm font-semibold border border-blue-500">Observações</th>
                  <th className="p-3 text-left text-sm font-semibold border border-blue-500">Negociar</th>
                </tr>
              </thead>
              <tbody>
                {ordens.map((ordem, idx) => {
                  const modalidadeClass = 
                    ordem.modalidade_carga === 'expressa' ? 'bg-red-100 text-red-800 border-red-300' :
                    ordem.modalidade_carga === 'prioridade' ? 'bg-yellow-100 text-yellow-800 border-yellow-300' :
                    'bg-blue-100 text-blue-800 border-blue-300';
                  
                  const modalidadeLabel = 
                    ordem.modalidade_carga === 'expressa' ? 'Expressa' :
                    ordem.modalidade_carga === 'prioridade' ? 'Prioridade' :
                    'Normal';

                  const peso = ordem.peso ? `${(ordem.peso / 1000).toFixed(2)}t` : '-';
                  const frete = ordem.frete_viagem || ordem.valor_total_frete;
                  const freteFormatado = frete ? 
                    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(frete) : 
                    '-';

                  const dataCarregamento = ordem.carregamento_agendamento_data ? 
                    format(new Date(ordem.carregamento_agendamento_data), "dd/MM/yyyy HH:mm", { locale: ptBR }) : 
                    '-';

                  const mensagemWhatsApp = encodeURIComponent(
                    `🚚 *Interesse em Carga Disponível*\n\n` +
                    `*Ordem:* ${ordem.numero_carga || '#' + ordem.id.slice(-6)}\n` +
                    `*Rota:* ${ordem.origem_cidade || ordem.origem || '-'} → ${ordem.destino_cidade || ordem.destino || '-'}\n` +
                    `*Tipo Veículo:* ${ordem.tipo_veiculo || '-'}\n` +
                    `*Peso:* ${peso}\n` +
                    `*Frete:* ${freteFormatado}\n` +
                    `*Carregamento:* ${dataCarregamento}\n\n` +
                    `Gostaria de mais informações sobre esta carga.`
                  );

                  return (
                    <tr key={ordem.id} className={idx % 2 === 0 ? 'bg-white hover:bg-blue-50' : 'bg-gray-50 hover:bg-blue-50'}>
                      <td className="p-3 border border-gray-200 font-bold text-blue-700">
                        {ordem.numero_carga || '#' + ordem.id.slice(-6)}
                      </td>
                      <td className="p-3 border border-gray-200 font-semibold">
                        {ordem.origem_cidade || ordem.origem || '-'} → {ordem.destino_cidade || ordem.destino || '-'}
                      </td>
                      <td className="p-3 border border-gray-200">
                        <span className={`inline-block px-2 py-1 rounded text-xs font-semibold border ${modalidadeClass}`}>
                          {modalidadeLabel}
                        </span>
                      </td>
                      <td className="p-3 border border-gray-200">{ordem.tipo_veiculo || '-'}</td>
                      <td className="p-3 border border-gray-200 font-semibold text-green-700">{peso}</td>
                      <td className="p-3 border border-gray-200 font-bold text-green-700 text-lg">{freteFormatado}</td>
                      <td className="p-3 border border-gray-200 text-sm">{dataCarregamento}</td>
                      <td className="p-3 border border-gray-200 text-sm text-gray-600 italic max-w-xs">
                        {ordem.observacao_carga || '-'}
                      </td>
                      <td className="p-3 border border-gray-200">
                        <div className="flex flex-col gap-2">
                          {numerosWhatsApp.map((numero, idx) => {
                            const numeroLimpo = numero.replace(/\D/g, '');
                            return (
                              <a
                                key={idx}
                                href={`https://wa.me/55${numeroLimpo}?text=${mensagemWhatsApp}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded-lg text-sm font-semibold transition-all shadow-md hover:shadow-lg"
                              >
                                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                                </svg>
                                {numero}
                              </a>
                            );
                          })}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="mt-6 pt-6 border-t text-center text-gray-600">
            <p className="font-semibold">Total de ofertas disponíveis: <span className="text-blue-700 text-lg">{ordens.length}</span></p>
          </div>
        </div>
      </div>
    </div>
  );
}