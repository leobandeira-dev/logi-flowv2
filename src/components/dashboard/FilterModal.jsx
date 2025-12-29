import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X } from "lucide-react";
import FiltroDataOcorrencias from "../filtros/FiltroDataOcorrencias";

export default function FilterModal({ open, onClose, filters, onFiltersChange, motoristas, etapas, operacoes, periodoSelecionado, onPeriodoChange, isDark }) {
  const handleFilterChange = (field, value) => {
    onFiltersChange({ ...filters, [field]: value });
  };

  const handleClearFilters = () => {
    onFiltersChange({
      dataInicio: "", dataFim: "", origem: "", destino: "", motorista: "", motoristaId: "",
      tipoOrdem: "", etapaId: "", status: "", frota: "", operacoesIds: [], modalidadeCarga: "", tipoRegistro: ""
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Filtros Avançados</span>
            <Button variant="ghost" size="sm" onClick={handleClearFilters}>
              <X className="w-4 h-4 mr-2" />
              Limpar Filtros
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4 py-4">
          <div className="col-span-2">
            <Label className="text-sm font-semibold mb-2 block">Período de Filtro</Label>
            <FiltroDataOcorrencias
              periodoSelecionado={periodoSelecionado}
              onPeriodoChange={onPeriodoChange}
              dataInicio={filters.dataInicio}
              dataFim={filters.dataFim}
              onDataInicioChange={(val) => handleFilterChange("dataInicio", val)}
              onDataFimChange={(val) => handleFilterChange("dataFim", val)}
              isDark={isDark}
            />
          </div>

          <div className="col-span-2">
            <Label className="text-sm font-semibold mb-2 block">Tipo de Ordem (múltiplos)</Label>
            <div className="flex flex-wrap gap-2">
              {[
                { value: "oferta", label: "Oferta", color: "green" },
                { value: "negociando", label: "Negociando", color: "yellow" },
                { value: "alocado", label: "Alocado", color: "blue" }
              ].map((tipo) => (
                <Badge
                  key={tipo.value}
                  variant={filters.tiposOrdem?.includes(tipo.value) ? "default" : "outline"}
                  className="cursor-pointer hover:opacity-80 transition-opacity"
                  style={filters.tiposOrdem?.includes(tipo.value) ? {
                    backgroundColor: tipo.color === "green" ? "#16a34a" : tipo.color === "yellow" ? "#ca8a04" : "#3b82f6",
                    color: "white"
                  } : {}}
                  onClick={() => {
                    const tiposOrdem = filters.tiposOrdem?.includes(tipo.value)
                      ? filters.tiposOrdem.filter(t => t !== tipo.value)
                      : [...(filters.tiposOrdem || []), tipo.value];
                    handleFilterChange("tiposOrdem", tiposOrdem);
                  }}
                >
                  {tipo.label}
                </Badge>
              ))}
            </div>
          </div>

          <div className="col-span-2">
            <Label className="text-sm font-semibold mb-2 block">Operações (múltiplas)</Label>
            <div className="flex flex-wrap gap-2">
              {operacoes?.map((op) => (
                <Badge
                  key={op.id}
                  variant={filters.operacoesIds?.includes(op.id) ? "default" : "outline"}
                  className="cursor-pointer hover:opacity-80 transition-opacity"
                  style={filters.operacoesIds?.includes(op.id) ? {
                    backgroundColor: '#3b82f6',
                    color: 'white'
                  } : {}}
                  onClick={() => {
                    const operacoesIds = filters.operacoesIds?.includes(op.id)
                      ? filters.operacoesIds.filter(id => id !== op.id)
                      : [...(filters.operacoesIds || []), op.id];
                    handleFilterChange("operacoesIds", operacoesIds);
                  }}
                >
                  {op.nome}
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <Label className="text-sm font-semibold">Motorista</Label>
            <Select value={filters.motoristaId} onValueChange={(value) => handleFilterChange("motoristaId", value)}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={null}>Todos</SelectItem>
                {motoristas.map((m) => (
                  <SelectItem key={m.id} value={m.id}>{m.nome}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-sm font-semibold">Origem</Label>
            <Input
              value={filters.origem}
              onChange={(e) => handleFilterChange("origem", e.target.value)}
              placeholder="Filtrar por origem"
              className="mt-1"
            />
          </div>

          <div>
            <Label className="text-sm font-semibold">Destino</Label>
            <Input
              value={filters.destino}
              onChange={(e) => handleFilterChange("destino", e.target.value)}
              placeholder="Filtrar por destino"
              className="mt-1"
            />
          </div>

          <div>
            <Label className="text-sm font-semibold">Etapa do Fluxo</Label>
            <Select value={filters.etapaId} onValueChange={(value) => handleFilterChange("etapaId", value)}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Todas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={null}>Todas</SelectItem>
                {etapas.map((e) => (
                  <SelectItem key={e.id} value={e.id}>{e.nome}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-sm font-semibold">Status da Etapa</Label>
            <Select value={filters.status} onValueChange={(value) => handleFilterChange("status", value)}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={null}>Todos</SelectItem>
                <SelectItem value="pendente">Pendente</SelectItem>
                <SelectItem value="em_andamento">Em Andamento</SelectItem>
                <SelectItem value="concluida">Concluída</SelectItem>
                <SelectItem value="bloqueada">Bloqueada</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-sm font-semibold">Tipo de Frota</Label>
            <Select value={filters.frota} onValueChange={(value) => handleFilterChange("frota", value)}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Todas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={null}>Todas</SelectItem>
                <SelectItem value="própria">Própria</SelectItem>
                <SelectItem value="terceirizada">Terceirizada</SelectItem>
                <SelectItem value="agregado">Agregado</SelectItem>
                <SelectItem value="acionista">Acionista</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-sm font-semibold">Modalidade</Label>
            <Select value={filters.modalidadeCarga} onValueChange={(value) => handleFilterChange("modalidadeCarga", value)}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Todas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={null}>Todas</SelectItem>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="prioridade">Prioridade</SelectItem>
                <SelectItem value="expressa">Expressa</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-sm font-semibold">Tipo de Registro</Label>
            <Select value={filters.tipoRegistro} onValueChange={(value) => handleFilterChange("tipoRegistro", value)}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={null}>Todos</SelectItem>
                <SelectItem value="coleta">Coleta</SelectItem>
                <SelectItem value="ordem">Ordem de Carga</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}