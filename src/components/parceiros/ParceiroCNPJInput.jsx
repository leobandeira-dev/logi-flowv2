import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Check, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import {
  Alert,
  AlertDescription,
} from "@/components/ui/alert";

export default function ParceiroCNPJInput({
  label = "CNPJ",
  cnpj,
  onCNPJChange,
  onDadosCarregados,
  tipoParceiro = "remetente", // remetente ou destinatario
  dadosAtuais = {},
  isDark = false
}) {
  const [parceiro, setParceiro] = useState(null);
  const [buscando, setBuscando] = useState(false);
  const [dadosDiferentes, setDadosDiferentes] = useState(false);

  useEffect(() => {
    if (cnpj && cnpj.length >= 14) {
      buscarParceiro(cnpj);
    } else {
      setParceiro(null);
      setDadosDiferentes(false);
    }
  }, [cnpj]);

  useEffect(() => {
    if (parceiro && dadosAtuais) {
      verificarDiferencas();
    }
  }, [parceiro, dadosAtuais]);

  const buscarParceiro = async (cnpjBusca) => {
    setBuscando(true);
    try {
      const parceiros = await base44.entities.Parceiro.filter({ cnpj: cnpjBusca.replace(/\D/g, '') });
      
      if (parceiros.length > 0) {
        const p = parceiros[0];
        setParceiro(p);
        
        if (onDadosCarregados) {
          onDadosCarregados(p);
        }
      } else {
        setParceiro(null);
        setDadosDiferentes(false);
      }
    } catch (error) {
      console.error("Erro ao buscar parceiro:", error);
    } finally {
      setBuscando(false);
    }
  };

  const verificarDiferencas = () => {
    if (!parceiro) return;

    const campos = tipoParceiro === "remetente" 
      ? ["cliente", "cliente_cnpj", "emitente_razao_social", "emitente_telefone", "emitente_endereco", "emitente_cidade", "emitente_uf"]
      : ["destinatario", "destinatario_cnpj", "destinatario_razao_social", "destinatario_telefone", "destinatario_endereco", "destinatario_cidade", "destinatario_uf"];

    const mapeamento = tipoParceiro === "remetente" ? {
      "cliente": "nome_fantasia",
      "cliente_cnpj": "cnpj",
      "emitente_razao_social": "razao_social",
      "emitente_telefone": "telefone",
      "emitente_endereco": "endereco",
      "emitente_cidade": "cidade",
      "emitente_uf": "uf"
    } : {
      "destinatario": "nome_fantasia",
      "destinatario_cnpj": "cnpj",
      "destinatario_razao_social": "razao_social",
      "destinatario_telefone": "telefone",
      "destinatario_endereco": "endereco",
      "destinatario_cidade": "cidade",
      "destinatario_uf": "uf"
    };

    let diferente = false;
    for (const campo of campos) {
      const campoAtual = dadosAtuais[campo];
      const campoParceiro = parceiro[mapeamento[campo]];
      
      if (campoAtual && campoParceiro && campoAtual !== campoParceiro) {
        diferente = true;
        break;
      }
    }

    setDadosDiferentes(diferente);
  };

  const handleAtualizarCadastro = async () => {
    if (!parceiro || !dadosAtuais) return;

    const dadosAtualizados = {};
    
    if (tipoParceiro === "remetente") {
      if (dadosAtuais.cliente) dadosAtualizados.nome_fantasia = dadosAtuais.cliente;
      if (dadosAtuais.emitente_razao_social) dadosAtualizados.razao_social = dadosAtuais.emitente_razao_social;
      if (dadosAtuais.emitente_telefone) dadosAtualizados.telefone = dadosAtuais.emitente_telefone;
      if (dadosAtuais.emitente_endereco) dadosAtualizados.endereco = dadosAtuais.emitente_endereco;
      if (dadosAtuais.emitente_cidade) dadosAtualizados.cidade = dadosAtuais.emitente_cidade;
      if (dadosAtuais.emitente_uf) dadosAtualizados.uf = dadosAtuais.emitente_uf;
      if (dadosAtuais.emitente_bairro) dadosAtualizados.bairro = dadosAtuais.emitente_bairro;
      if (dadosAtuais.emitente_cep) dadosAtualizados.cep = dadosAtuais.emitente_cep;
    } else {
      if (dadosAtuais.destinatario) dadosAtualizados.nome_fantasia = dadosAtuais.destinatario;
      if (dadosAtuais.destinatario_razao_social) dadosAtualizados.razao_social = dadosAtuais.destinatario_razao_social;
      if (dadosAtuais.destinatario_telefone) dadosAtualizados.telefone = dadosAtuais.destinatario_telefone;
      if (dadosAtuais.destinatario_endereco) dadosAtualizados.endereco = dadosAtuais.destinatario_endereco;
      if (dadosAtuais.destinatario_cidade) dadosAtualizados.cidade = dadosAtuais.destinatario_cidade;
      if (dadosAtuais.destinatario_uf) dadosAtualizados.uf = dadosAtuais.destinatario_uf;
      if (dadosAtuais.destinatario_bairro) dadosAtualizados.bairro = dadosAtuais.destinatario_bairro;
      if (dadosAtuais.destinatario_cep) dadosAtualizados.cep = dadosAtuais.destinatario_cep;
    }

    try {
      await base44.entities.Parceiro.update(parceiro.id, dadosAtualizados);
      toast.success("Cadastro do parceiro atualizado!");
      setDadosDiferentes(false);
      buscarParceiro(cnpj);
    } catch (error) {
      console.error("Erro ao atualizar cadastro:", error);
      toast.error("Erro ao atualizar cadastro");
    }
  };

  const theme = {
    cardBg: isDark ? '#1e293b' : '#ffffff',
    border: isDark ? '#334155' : '#e5e7eb',
    text: isDark ? '#f1f5f9' : '#111827',
    textMuted: isDark ? '#94a3b8' : '#6b7280',
  };

  return (
    <div className="space-y-2">
      <Label style={{ color: theme.text }}>{label}</Label>
      <div className="relative">
        <Input
          value={cnpj}
          onChange={(e) => onCNPJChange(e.target.value)}
          placeholder="00.000.000/0000-00"
          style={{ backgroundColor: theme.cardBg, borderColor: theme.border, color: theme.text }}
        />
        {buscando && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>

      {parceiro && (
        <div className="mt-2 p-3 rounded-lg border" style={{ backgroundColor: isDark ? '#0f172a' : '#f0f9ff', borderColor: isDark ? '#1e3a8a' : '#bfdbfe' }}>
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Check className="w-4 h-4 text-green-600" />
                <span className="text-sm font-semibold" style={{ color: theme.text }}>
                  {parceiro.razao_social}
                </span>
                <Badge className="text-xs" style={{ backgroundColor: isDark ? '#1e3a8a' : '#dbeafe', color: isDark ? '#93c5fd' : '#1e40af' }}>
                  {parceiro.tipo}
                </Badge>
              </div>
              <div className="text-xs space-y-0.5" style={{ color: theme.textMuted }}>
                {parceiro.nome_fantasia && <div>Nome: {parceiro.nome_fantasia}</div>}
                {parceiro.cidade && <div>Local: {parceiro.cidade}/{parceiro.uf}</div>}
                {parceiro.telefone && <div>Tel: {parceiro.telefone}</div>}
              </div>
            </div>
          </div>
        </div>
      )}

      {dadosDiferentes && (
        <Alert style={{ backgroundColor: isDark ? '#422006' : '#fef3c7', borderColor: isDark ? '#92400e' : '#fbbf24' }}>
          <AlertCircle className="h-4 w-4" style={{ color: isDark ? '#fbbf24' : '#92400e' }} />
          <AlertDescription className="flex items-center justify-between">
            <span className="text-xs" style={{ color: isDark ? '#fde68a' : '#92400e' }}>
              Os dados informados diferem do cadastro
            </span>
            <Button
              size="sm"
              variant="outline"
              onClick={handleAtualizarCadastro}
              className="h-7 text-xs"
              style={{ borderColor: isDark ? '#92400e' : '#fbbf24', color: isDark ? '#fde68a' : '#92400e' }}
            >
              <RefreshCw className="w-3 h-3 mr-1" />
              Atualizar Cadastro
            </Button>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}