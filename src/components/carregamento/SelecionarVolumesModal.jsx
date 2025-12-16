import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Package } from "lucide-react";

export default function SelecionarVolumesModal({ 
  open, 
  onClose, 
  nota, 
  volumesDisponiveis, 
  volumesJaEnderecados,
  onConfirmar,
  isDark 
}) {
  const volumeInicial = nota?.volumeInicial;
  const [modoSelecao, setModoSelecao] = useState("quantidade"); // quantidade ou individual
  const [quantidade, setQuantidade] = useState(volumesDisponiveis.length);
  const [volumesSelecionados, setVolumesSelecionados] = useState(
    volumeInicial 
      ? [volumeInicial]
      : volumesDisponiveis.slice(0, quantidade).map(v => v.id)
  );

  const theme = {
    bg: isDark ? '#1e293b' : '#ffffff',
    text: isDark ? '#f1f5f9' : '#111827',
    textMuted: isDark ? '#94a3b8' : '#6b7280',
    border: isDark ? '#334155' : '#e5e7eb',
    inputBg: isDark ? '#0f172a' : '#ffffff',
    inputBorder: isDark ? '#334155' : '#d1d5db',
  };

  const handleQuantidadeChange = (valor) => {
    const qtd = Math.max(1, Math.min(volumesDisponiveis.length, parseInt(valor) || 1));
    setQuantidade(qtd);
    
    // Se tiver volume inicial, manter ele e adicionar mais
    if (volumeInicial) {
      const volumesOrdenados = [
        volumesDisponiveis.find(v => v.id === volumeInicial),
        ...volumesDisponiveis.filter(v => v.id !== volumeInicial)
      ].filter(Boolean);
      setVolumesSelecionados(volumesOrdenados.slice(0, qtd).map(v => v.id));
    } else {
      setVolumesSelecionados(volumesDisponiveis.slice(0, qtd).map(v => v.id));
    }
  };

  // Atualizar seleção inicial quando nota mudar
  React.useEffect(() => {
    if (volumeInicial) {
      setVolumesSelecionados([volumeInicial]);
      setQuantidade(1);
    } else {
      setQuantidade(volumesDisponiveis.length);
      setVolumesSelecionados(volumesDisponiveis.map(v => v.id));
    }
  }, [nota?.id, volumeInicial]);

  const handleToggleVolume = (volumeId) => {
    setVolumesSelecionados(prev =>
      prev.includes(volumeId)
        ? prev.filter(id => id !== volumeId)
        : [...prev, volumeId]
    );
  };

  const handleConfirmar = () => {
    if (volumesSelecionados.length === 0) {
      return;
    }
    onConfirmar(volumesSelecionados);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent 
        className="max-w-lg max-h-[90vh] overflow-y-auto"
        style={{ backgroundColor: theme.bg, borderColor: theme.border }}
      >
        <DialogHeader>
          <DialogTitle style={{ color: theme.text }}>
            Selecionar Volumes da NF {nota?.numero_nota}
          </DialogTitle>
          <div className="mt-2 text-sm" style={{ color: theme.textMuted }}>
            <p>{nota?.emitente_razao_social}</p>
            <div className="flex items-center gap-3 mt-1">
              <Badge className="bg-blue-600 text-white">
                {volumesDisponiveis.length} disponíveis
              </Badge>
              {volumesJaEnderecados.length > 0 && (
                <Badge className="bg-green-600 text-white">
                  {volumesJaEnderecados.length} já endereçados
                </Badge>
              )}
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Modo de Seleção */}
          <div className="flex gap-2">
            <Button
              variant={modoSelecao === "quantidade" ? "default" : "outline"}
              onClick={() => setModoSelecao("quantidade")}
              className="flex-1"
              size="sm"
              style={modoSelecao === "quantidade" ? {} : { borderColor: theme.border, color: theme.text }}
            >
              Por Quantidade
            </Button>
            <Button
              variant={modoSelecao === "individual" ? "default" : "outline"}
              onClick={() => setModoSelecao("individual")}
              className="flex-1"
              size="sm"
              style={modoSelecao === "individual" ? {} : { borderColor: theme.border, color: theme.text }}
            >
              Selecionar Individual
            </Button>
          </div>

          {/* Seleção por Quantidade */}
          {modoSelecao === "quantidade" ? (
            <div>
              <Label className="mb-2 block" style={{ color: theme.text }}>
                Quantos volumes deseja mover?
              </Label>
              <Input
                type="number"
                value={quantidade}
                onChange={(e) => handleQuantidadeChange(e.target.value)}
                min={1}
                max={volumesDisponiveis.length}
                className="text-center text-lg font-bold"
                style={{ backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.text }}
              />
              <p className="text-xs mt-2 text-center" style={{ color: theme.textMuted }}>
                Serão selecionados os primeiros {quantidade} volume(s) disponível(is)
              </p>
            </div>
          ) : (
            /* Seleção Individual */
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label style={{ color: theme.text }}>
                  Selecione os volumes ({volumesSelecionados.length}/{volumesDisponiveis.length})
                </Label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    if (volumesSelecionados.length === volumesDisponiveis.length) {
                      setVolumesSelecionados([]);
                    } else {
                      setVolumesSelecionados(volumesDisponiveis.map(v => v.id));
                    }
                  }}
                  className="h-7 text-xs"
                  style={{ color: theme.text }}
                >
                  {volumesSelecionados.length === volumesDisponiveis.length ? "Desmarcar" : "Marcar"} Todos
                </Button>
              </div>
              
              <div className="space-y-1 max-h-[300px] overflow-y-auto border rounded p-2" style={{ borderColor: theme.border }}>
                {volumesDisponiveis.map((volume) => {
                  const isSelected = volumesSelecionados.includes(volume.id);
                  
                  return (
                    <div
                      key={volume.id}
                      onClick={() => handleToggleVolume(volume.id)}
                      className="flex items-center gap-2 p-2 rounded cursor-pointer hover:bg-opacity-50 transition-all"
                      style={{
                        backgroundColor: isSelected ? (isDark ? '#1e3a8a44' : '#dbeafe44') : 'transparent',
                        borderColor: isSelected ? '#3b82f6' : 'transparent',
                        border: isSelected ? '1px solid' : '1px solid transparent'
                      }}
                    >
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => handleToggleVolume(volume.id)}
                        onClick={(e) => e.stopPropagation()}
                      />
                      <Package className="w-4 h-4" style={{ color: theme.textMuted }} />
                      <div className="flex-1">
                        <p className="font-mono text-xs font-bold" style={{ color: theme.text }}>
                          {volume.identificador_unico}
                        </p>
                        <p className="text-xs" style={{ color: theme.textMuted }}>
                          {volume.peso_volume} kg
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            style={{ borderColor: theme.border, color: theme.text }}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleConfirmar}
            disabled={volumesSelecionados.length === 0}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Alocar {volumesSelecionados.length} Volume(s)
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}