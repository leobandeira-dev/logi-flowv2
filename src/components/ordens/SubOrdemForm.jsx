import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import OrdemUnificadaForm from "./OrdemUnificadaForm";
import { toast } from "sonner";

export default function OrdemFilhaForm({ 
  open, 
  onClose, 
  ordemMae, 
  onSuccess,
  motoristas,
  veiculos 
}) {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const checkDarkMode = () => {
      setIsDark(document.documentElement.classList.contains('dark'));
    };
    checkDarkMode();
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  if (!ordemMae) return null;

  const handleSubmitOrdemFilha = async (dadosOrdem, notasFiscais) => {
    try {
      // Criar a ordem filha
      const novaOrdem = await base44.entities.OrdemDeCarregamento.create({
        ...dadosOrdem,
        tipo_ordem: "ordem_filha",
        ordem_mae_id: ordemMae.id,
        empresa_id: ordemMae.empresa_id
      });
      
      toast.success("Ordem filha criada com sucesso!");
      onSuccess(novaOrdem);
    } catch (error) {
      console.error("Erro ao criar ordem filha:", error);
      toast.error("Erro ao criar ordem filha: " + error.message);
    }
  };

  // Preparar dados da ordem mãe para pré-preenchimento
  const dadosPreFilled = {
    ...ordemMae,
    id: undefined,
    numero_carga: undefined,
    created_date: undefined,
    updated_date: undefined,
    notas_fiscais_ids: [],
    notas_fiscais: "",
    peso_total_consolidado: null,
    valor_total_consolidado: null,
    volumes_total_consolidado: null
  };

  return (
    <OrdemUnificadaForm
      tipo_ordem="carregamento"
      open={open}
      onClose={onClose}
      editingOrdem={dadosPreFilled}
      motoristas={motoristas}
      veiculos={veiculos}
      onSubmit={handleSubmitOrdemFilha}
      isDark={isDark}
    />
  );
}