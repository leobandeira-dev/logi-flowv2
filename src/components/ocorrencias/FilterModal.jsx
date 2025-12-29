import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { X } from "lucide-react";
import FiltroDataOcorrencias from "../filtros/FiltroDataOcorrencias";

export default function FilterModal({ 
  open, 
  onClose, 
  filters, 
  setFilters,
  usuarios,
  tiposOcorrencia
}) {
  const [periodo, setPeriodo] = React.useState("personalizado");
  const [isDark, setIsDark] = React.useState(document.documentElement.classList.contains('dark'));

  React.useEffect(() => {
    const checkDarkMode = () => {
      setIsDark(document.documentElement.classList.contains('dark'));
    };
    checkDarkMode();
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  const handleClearFilters = () => {
    setFilters({
      status: "",
      gravidade: "",
      categoria: "",
      responsavel_id: "",
      tipo_ocorrencia_id: "",
      dataInicio: "",
      dataFim: ""
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Filtros de Ocorrências</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4 py-4">
          <div>
            <Label>Status</Label>
            <Select
              value={filters.status}
              onValueChange={(value) => setFilters({ ...filters, status: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Todos os status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={null}>Todos os status</SelectItem>
                <SelectItem value="aberta">Aberta</SelectItem>
                <SelectItem value="resolvida">Resolvida</SelectItem>
                <SelectItem value="cancelada">Cancelada</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Gravidade</Label>
            <Select
              value={filters.gravidade}
              onValueChange={(value) => setFilters({ ...filters, gravidade: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Todas as gravidades" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={null}>Todas as gravidades</SelectItem>
                <SelectItem value="baixa">Baixa</SelectItem>
                <SelectItem value="media">Média</SelectItem>
                <SelectItem value="alta">Alta</SelectItem>
                <SelectItem value="critica">Crítica</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Categoria</Label>
            <Select
              value={filters.categoria}
              onValueChange={(value) => setFilters({ ...filters, categoria: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Todas as categorias" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={null}>Todas as categorias</SelectItem>
                <SelectItem value="tracking">Tracking</SelectItem>
                <SelectItem value="fluxo">Fluxo</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Responsável</Label>
            <Select
              value={filters.responsavel_id}
              onValueChange={(value) => setFilters({ ...filters, responsavel_id: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Todos os responsáveis" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={null}>Todos os responsáveis</SelectItem>
                {usuarios.map((usuario) => (
                  <SelectItem key={usuario.id} value={usuario.id}>
                    {usuario.full_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Tipo de Ocorrência</Label>
            <Select
              value={filters.tipo_ocorrencia_id}
              onValueChange={(value) => setFilters({ ...filters, tipo_ocorrencia_id: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Todos os tipos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={null}>Todos os tipos</SelectItem>
                {tiposOcorrencia.filter(t => t.ativo).map((tipo) => (
                  <SelectItem key={tipo.id} value={tipo.id}>
                    {tipo.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="col-span-2">
            <Label className="mb-2 block">Filtro de Data</Label>
            <FiltroDataOcorrencias
              periodoSelecionado={periodo}
              onPeriodoChange={setPeriodo}
              dataInicio={filters.dataInicio || ""}
              dataFim={filters.dataFim || ""}
              onDataInicioChange={(valor) => setFilters({ ...filters, dataInicio: valor })}
              onDataFimChange={(valor) => setFilters({ ...filters, dataFim: valor })}
              isDark={isDark}
            />
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={handleClearFilters}
            className="flex items-center gap-2"
          >
            <X className="w-4 h-4" />
            Limpar Filtros
          </Button>
          <Button onClick={onClose}>
            Aplicar Filtros
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}