
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Clock, 
  AlertTriangle, 
  User, 
  MapPin,
  Package,
  Scale,
  ExternalLink
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

const statusConfig = {
  novo: { label: "Novo", color: "bg-gray-500", textColor: "text-white" },
  pendente_cadastro: { label: "Pendente Cadastro", color: "bg-yellow-500", textColor: "text-white" },
  pendente_rastreamento: { label: "Pendente Rastreamento", color: "bg-orange-500", textColor: "text-white" },
  pendente_expedicao: { label: "Pendente Expedição", color: "bg-blue-500", textColor: "text-white" },
  pendente_financeiro: { label: "Pendente Financeiro", color: "bg-purple-500", textColor: "text-white" },
  aguardando_carregamento: { label: "Aguardando Carregamento", color: "bg-indigo-500", textColor: "text-white" },
  em_transito: { label: "Em Trânsito", color: "bg-green-500", textColor: "text-white" },
  entregue: { label: "Entregue", color: "bg-emerald-500", textColor: "text-white" },
  finalizado: { label: "Finalizado", color: "bg-gray-400", textColor: "text-white" },
  cancelado: { label: "Cancelado", color: "bg-red-500", textColor: "text-white" }
};

export default function KanbanBoard({ ordens, loading, onUpdate, motoristas, veiculos }) {
  const getStatusColumns = () => {
    const activeStatuses = [
      "novo",
      "pendente_cadastro", 
      "pendente_rastreamento",
      "pendente_expedicao",
      "pendente_financeiro",
      "aguardando_carregamento",
      "em_transito"
    ];
    
    return activeStatuses.map(status => ({
      status,
      ...statusConfig[status],
      ordens: ordens.filter(ordem => ordem.status === status)
    }));
  };

  const getMotorista = (motoristaId) => {
    return motoristas.find(m => m.id === motoristaId);
  };

  const getVeiculo = (veiculoId) => {
    return veiculos.find(v => v.id === veiculoId);
  };

  const isVencimentoProximo = (vencimento) => {
    if (!vencimento) return false;
    const hoje = new Date();
    const dataVencimento = new Date(vencimento);
    const diasRestantes = Math.ceil((dataVencimento - hoje) / (1000 * 60 * 60 * 24));
    return diasRestantes <= 3 && diasRestantes >= 0;
  };

  const isVencido = (vencimento) => {
    if (!vencimento) return false;
    const hoje = new Date();
    const dataVencimento = new Date(vencimento);
    return dataVencimento < hoje;
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6">
        {Array(4).fill(0).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-16" />
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Array(3).fill(0).map((_, j) => (
                  <div key={j} className="p-3 border rounded-lg">
                    <Skeleton className="h-5 w-24 mb-2" />
                    <Skeleton className="h-4 w-full mb-1" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const columns = getStatusColumns();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6">
      {columns.map((column) => (
        <Card key={column.status} className="h-fit">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-700">
                {column.label}
              </CardTitle>
              <Badge variant="secondary" className="ml-2">
                {column.ordens.length}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {column.ordens.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Package className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p className="text-sm">Nenhuma ordem</p>
              </div>
            ) : (
              column.ordens.map((ordem) => {
                const motorista = getMotorista(ordem.motorista_id);
                const veiculo = getVeiculo(ordem.veiculo_id);
                const vencimentoProximo = isVencimentoProximo(ordem.vencimento_pamcary);
                const vencido = isVencido(ordem.vencimento_pamcary);
                
                return (
                  <div
                    key={ordem.id}
                    className="p-3 border rounded-lg hover:shadow-md transition-shadow duration-200 bg-white"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-gray-900 text-sm">
                          {ordem.numero_carga || `#${ordem.id.slice(-6)}`}
                        </h4>
                        {(vencido || vencimentoProximo) && (
                          <div className="flex items-center gap-1">
                            {vencido ? (
                              <AlertTriangle className="w-3 h-3 text-red-500" />
                            ) : (
                              <Clock className="w-3 h-3 text-yellow-500" />
                            )}
                          </div>
                        )}
                      </div>
                      <Link to={createPageUrl(`OrdensCarregamento?id=${ordem.id}`)}>
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                          <ExternalLink className="w-3 h-3" />
                        </Button>
                      </Link>
                    </div>
                    
                    <div className="space-y-1 text-xs text-gray-600">
                      <div className="flex items-center gap-1">
                        <Package className="w-3 h-3" />
                        <span className="font-medium">{ordem.cliente}</span>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        <span>{ordem.origem} → {ordem.destino}</span>
                      </div>
                      
                      {ordem.peso && (
                        <div className="flex items-center gap-1">
                          <Scale className="w-3 h-3" />
                          <span>{ordem.peso.toLocaleString()} kg</span>
                        </div>
                      )}
                      
                      {motorista && (
                        <div className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          <span>{motorista.nome}</span>
                        </div>
                      )}
                      
                      {veiculo && (
                        <div className="flex items-center gap-1">
                          <span className="text-gray-500">Placa:</span>
                          <span className="font-mono">{veiculo.placa}</span>
                        </div>
                      )}
                      
                      {ordem.data_solicitacao && (
                        <div className="flex items-center gap-1 pt-1">
                          <Clock className="w-3 h-3" />
                          <span className="text-gray-500">
                            {format(new Date(ordem.data_solicitacao), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    {ordem.frota && (
                      <div className="mt-2">
                        <Badge
                          variant={ordem.frota === "própria" ? "default" : "secondary"}
                          className="text-xs"
                        >
                          {ordem.frota === "própria" ? "Própria" : "Terceirizada"}
                        </Badge>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
