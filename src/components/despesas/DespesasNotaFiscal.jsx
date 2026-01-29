import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, XCircle, CheckCircle, DollarSign, FileText } from "lucide-react";
import DespesaExtraForm from "./DespesaExtraForm";
import { toast } from "sonner";

export default function DespesasNotaFiscal({ notaFiscal, ordem }) {
  const [despesas, setDespesas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [despesaEdit, setDespesaEdit] = useState(null);

  useEffect(() => {
    loadDespesas();
  }, [notaFiscal.id]);

  const loadDespesas = async () => {
    setLoading(true);
    try {
      const despesasData = await base44.entities.DespesaExtra.filter(
        { nota_fiscal_id: notaFiscal.id },
        "-created_date"
      );
      setDespesas(despesasData);
    } catch (error) {
      console.error("Erro ao carregar despesas:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAprovar = async (despesa) => {
    try {
      const user = await base44.auth.me();
      await base44.entities.DespesaExtra.update(despesa.id, {
        status: "aprovada",
        aprovado_por: user.id,
        data_aprovacao: new Date().toISOString()
      });
      toast.success("Despesa aprovada!");
      loadDespesas();
    } catch (error) {
      console.error("Erro ao aprovar:", error);
      toast.error("Erro ao aprovar despesa");
    }
  };

  const handleCancelar = async (despesa) => {
    if (!confirm("Cancelar esta despesa?")) return;
    try {
      await base44.entities.DespesaExtra.update(despesa.id, { status: "cancelada" });
      toast.success("Despesa cancelada");
      loadDespesas();
    } catch (error) {
      console.error("Erro ao cancelar:", error);
      toast.error("Erro ao cancelar despesa");
    }
  };

  const statusColors = {
    pendente: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
    aprovada: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
    faturada: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
    cancelada: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
  };

  const valorTotal = despesas.reduce((sum, d) => sum + (d.valor_total || 0), 0);

  if (loading) {
    return (
      <div className="text-center py-4">
        <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <DollarSign className="w-4 h-4" />
          <h3 className="font-semibold text-sm">Despesas Extras</h3>
          {despesas.length > 0 && (
            <Badge className="bg-blue-600 text-white">
              {despesas.length}
            </Badge>
          )}
        </div>
        <Button
          onClick={() => {
            setDespesaEdit(null);
            setShowForm(true);
          }}
          size="sm"
          className="bg-blue-600 hover:bg-blue-700 h-7 text-xs"
        >
          <Plus className="w-3 h-3 mr-1" />
          Nova Despesa
        </Button>
      </div>

      {despesas.length > 0 ? (
        <>
          <div className="space-y-2">
            {despesas.map((despesa) => (
              <div
                key={despesa.id}
                className="p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-xs font-bold">
                        {despesa.numero_despesa}
                      </span>
                      <Badge className={statusColors[despesa.status]}>
                        {despesa.status}
                      </Badge>
                    </div>
                    <p className="text-sm font-semibold">{despesa.tipo_despesa_nome}</p>
                    {despesa.descricao && (
                      <p className="text-xs text-muted-foreground mt-1">{despesa.descricao}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-blue-600">
                      R$ {(despesa.valor_total || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {despesa.quantidade} {despesa.unidade_cobranca}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1 justify-end">
                  {despesa.status === "pendente" && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleAprovar(despesa)}
                      className="h-7 text-xs"
                    >
                      <CheckCircle className="w-3 h-3 mr-1 text-green-600" />
                      Aprovar
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setDespesaEdit(despesa);
                      setShowForm(true);
                    }}
                    className="h-7 text-xs"
                  >
                    <Edit className="w-3 h-3 mr-1 text-blue-600" />
                    Editar
                  </Button>
                  {despesa.status === "pendente" && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCancelar(despesa)}
                      className="h-7 text-xs"
                    >
                      <XCircle className="w-3 h-3 mr-1 text-red-600" />
                      Cancelar
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold">Total de Despesas</span>
              <span className="text-xl font-bold text-blue-600">
                R$ {valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </>
      ) : (
        <div className="text-center py-8 border border-dashed rounded-lg">
          <DollarSign className="w-12 h-12 mx-auto mb-2 opacity-20" />
          <p className="text-sm text-muted-foreground">
            Nenhuma despesa registrada
          </p>
        </div>
      )}

      {showForm && (
        <DespesaExtraForm
          open={showForm}
          onClose={() => {
            setShowForm(false);
            setDespesaEdit(null);
          }}
          despesa={despesaEdit}
          notaFiscal={notaFiscal}
          ordem={ordem}
          onSuccess={() => {
            setShowForm(false);
            setDespesaEdit(null);
            loadDespesas();
          }}
        />
      )}
    </div>
  );
}