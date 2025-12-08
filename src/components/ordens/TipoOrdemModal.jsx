import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { 
  FileText, 
  Package, 
  FileSpreadsheet,
  ArrowRight,
  Zap
} from "lucide-react";

export default function TipoOrdemModal({ open, onClose, onSelectTipo }) {
  const opcoes = [
    {
      tipo: "ordem_completa",
      titulo: "Ordem Completa",
      descricao: "Cadastro completo com motorista, veículo e todos os dados",
      icon: FileText,
      cor: "blue",
      badge: "Completo"
    },
    {
      tipo: "oferta_individual",
      titulo: "Oferta de Carga",
      descricao: "Cadastro rápido sem motorista - Complete os dados depois",
      icon: Package,
      cor: "green",
      badge: "Rápido"
    },
    {
      tipo: "oferta_lote",
      titulo: "Lançamento em Lote",
      descricao: "Cadastre múltiplas ofertas simultaneamente (estilo planilha)",
      icon: FileSpreadsheet,
      cor: "purple",
      badge: "Múltiplo"
    }
  ];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl">Escolha o Tipo de Cadastro</DialogTitle>
          <p className="text-sm text-gray-500">
            Selecione como deseja criar a(s) ordem(ns) de carregamento
          </p>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {opcoes.map((opcao) => {
            const Icon = opcao.icon;
            const cores = {
              blue: "border-blue-500 hover:bg-blue-50 hover:border-blue-600",
              green: "border-green-500 hover:bg-green-50 hover:border-green-600",
              purple: "border-purple-500 hover:bg-purple-50 hover:border-purple-600"
            };
            const coresBadge = {
              blue: "bg-blue-100 text-blue-700",
              green: "bg-green-100 text-green-700",
              purple: "bg-purple-100 text-purple-700"
            };
            
            return (
              <Card
                key={opcao.tipo}
                className={`cursor-pointer transition-all duration-200 border-2 ${cores[opcao.cor]}`}
                onClick={() => {
                  onSelectTipo(opcao.tipo);
                  onClose();
                }}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-lg bg-${opcao.cor}-100 flex items-center justify-center flex-shrink-0`}>
                      <Icon className={`w-6 h-6 text-${opcao.cor}-600`} />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900">{opcao.titulo}</h3>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${coresBadge[opcao.cor]}`}>
                          {opcao.badge}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">{opcao.descricao}</p>
                    </div>
                    
                    <ArrowRight className="w-5 h-5 text-gray-400 flex-shrink-0 mt-2" />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <div className="flex items-start gap-3">
            <Zap className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-blue-900">💡 Dica</p>
              <p className="text-xs text-blue-700 mt-1">
                Use <strong>Oferta de Carga</strong> para registrar demandas rapidamente. 
                Depois, faça upload do PDF da ordem para completar os dados automaticamente.
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}