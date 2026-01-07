import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import { Users, Save, Loader2 } from "lucide-react";

export default function MotoristaReservaModal({ open, onClose, ordem, motoristas, onSuccess }) {
  const [selectedMotoristaId, setSelectedMotoristaId] = useState(ordem?.motorista_reserva_id || "nenhum");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const valorParaSalvar = selectedMotoristaId === "nenhum" ? null : selectedMotoristaId;
      
      await base44.entities.OrdemDeCarregamento.update(ordem.id, {
        motorista_reserva_id: valorParaSalvar
      });

      toast.success("Motorista reserva atualizado com sucesso!");
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Erro ao salvar motorista reserva:", error);
      toast.error("Erro ao salvar motorista reserva");
    } finally {
      setSaving(false);
    }
  };

  const motoristasDisponiveis = motoristas.filter(m => m.status === "ativo");

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-purple-600" />
            Motorista Reserva
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Selecione o Motorista Reserva</Label>
            <Select 
              value={selectedMotoristaId || "nenhum"} 
              onValueChange={setSelectedMotoristaId}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione um motorista..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="nenhum">-- Nenhum --</SelectItem>
                {motoristasDisponiveis.map((motorista) => (
                  <SelectItem key={motorista.id} value={motorista.id}>
                    {motorista.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Este motorista poderá visualizar a ordem no aplicativo se o motorista principal não estiver disponível.
            </p>
          </div>
        </div>

        <DialogFooter className="flex gap-2 sm:justify-end">
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={saving} className="bg-purple-600 hover:bg-purple-700">
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Salvar
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}