import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FileText, Save, User, Building2, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const gravidadeColors = {
  baixa: "bg-blue-100 text-blue-800 border-blue-300",
  media: "bg-yellow-100 text-yellow-800 border-yellow-300",
  alta: "bg-orange-100 text-orange-800 border-orange-300",
  critica: "bg-red-100 text-red-800 border-red-300"
};

export default function FormularioOcorrencia({ 
  open, 
  onClose, 
  onSubmit,
  tiposOcorrencia = [],
  usuarios = [],
  departamentos = [],
  titulo = "Registrar Ocorrência",
  categoriaFixa = null, // Se definido, não permite mudar categoria
  contexto = null, // "nota_fiscal", "ordem", "avulsa", etc.
  contextoDescricao = null // Descrição do contexto (ex: "NF 123456")
}) {
  const [formData, setFormData] = useState({
    tipo_ocorrencia_id: "",
    categoria: categoriaFixa || "tarefa",
    gravidade: "media",
    observacoes: "",
    responsavel_id: "",
    departamento_responsavel_id: "",
    tipoResponsavel: "usuario",
    status: "aberta"
  });

  const [saving, setSaving] = useState(false);
  const [usuarioBusca, setUsuarioBusca] = useState("");
  const [departamentoBusca, setDepartamentoBusca] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.observacoes || !formData.observacoes.trim()) {
      alert("Por favor, preencha as observações");
      return;
    }

    setSaving(true);
    try {
      const dataToSubmit = {
        tipo: formData.tipo_ocorrencia_id || "avulsa",
        tipo_ocorrencia_id: formData.tipo_ocorrencia_id || undefined,
        categoria: formData.categoria,
        gravidade: formData.gravidade,
        observacoes: formData.observacoes,
        responsavel_id: formData.tipoResponsavel === "usuario" ? formData.responsavel_id || undefined : undefined,
        departamento_responsavel_id: formData.tipoResponsavel === "departamento" ? formData.departamento_responsavel_id || undefined : undefined,
        status: formData.status,
        data_inicio: new Date().toISOString()
      };

      await onSubmit(dataToSubmit);
      
      // Reset form
      setFormData({
        tipo_ocorrencia_id: "",
        categoria: categoriaFixa || "tarefa",
        gravidade: "media",
        observacoes: "",
        responsavel_id: "",
        departamento_responsavel_id: "",
        tipoResponsavel: "usuario",
        status: "aberta"
      });
      setUsuarioBusca("");
      setDepartamentoBusca("");
    } catch (error) {
      console.error("Erro ao salvar:", error);
    } finally {
      setSaving(false);
    }
  };

  const tipoSelecionado = tiposOcorrencia.find(t => t.id === formData.tipo_ocorrencia_id);
  
  const getPrazoEmHoras = (tipo) => {
    if (!tipo) return null;
    const minutos = tipo.prazo_sla_minutos || (tipo.prazo_sla_horas ? tipo.prazo_sla_horas * 60 : null);
    if (minutos === null) return null;
    return (minutos / 60).toFixed(1);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {contexto === "nota_fiscal" ? (
              <AlertTriangle className="w-5 h-5 text-orange-600" />
            ) : (
              <FileText className="w-5 h-5 text-green-600" />
            )}
            {titulo}
          </DialogTitle>
          {contextoDescricao && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              {contextoDescricao}
            </p>
          )}
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          {/* Categoria - apenas se não for fixa */}
          {!categoriaFixa && (
            <div>
              <Label htmlFor="categoria" className="font-bold">
                Categoria *
              </Label>
              <Select 
                value={formData.categoria}
                onValueChange={(value) => setFormData({ ...formData, categoria: value })}
                required
              >
                <SelectTrigger id="categoria">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tracking">🚚 Tracking (Viagem)</SelectItem>
                  <SelectItem value="fluxo">⚙️ Fluxo (Processos)</SelectItem>
                  <SelectItem value="tarefa">✅ Tarefa (Não impacta SLA)</SelectItem>
                  <SelectItem value="nota_fiscal">📄 Nota Fiscal</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {formData.categoria === "tarefa" && "⚠️ Tarefas não impactam o cálculo de SLA"}
                {formData.categoria === "tracking" && "ℹ️ Relacionado a problemas durante viagens"}
                {formData.categoria === "fluxo" && "ℹ️ Relacionado a processos internos"}
                {formData.categoria === "nota_fiscal" && "ℹ️ Relacionado a problemas com notas fiscais"}
              </p>
            </div>
          )}

          {/* Tipo de Ocorrência */}
          <div>
            <Label htmlFor="tipo_ocorrencia_id" className="font-bold">
              Tipo de Ocorrência
            </Label>
            <Select 
              value={formData.tipo_ocorrencia_id}
              onValueChange={(value) => {
                const tipo = tiposOcorrencia.find(t => t.id === value);
                setFormData({ 
                  ...formData, 
                  tipo_ocorrencia_id: value,
                  gravidade: tipo?.gravidade_padrao || formData.gravidade
                });
              }}
            >
              <SelectTrigger id="tipo_ocorrencia_id">
                <SelectValue placeholder="Selecione um tipo (opcional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={null}>Nenhum tipo específico</SelectItem>
                {tiposOcorrencia
                  .filter(t => t.ativo && t.categoria === formData.categoria)
                  .map((tipo) => (
                    <SelectItem key={tipo.id} value={tipo.id}>
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: tipo.cor }}
                        />
                        {tipo.nome}
                      </div>
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            
            {tipoSelecionado && (
              <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border-2 border-blue-200 dark:border-blue-800">
                <p className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-2">
                  {tipoSelecionado.nome}
                </p>
                {tipoSelecionado.descricao && (
                  <p className="text-xs text-blue-700 dark:text-blue-400 mb-2">
                    {tipoSelecionado.descricao}
                  </p>
                )}
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="outline" className={`text-xs border ${gravidadeColors[tipoSelecionado.gravidade_padrao]}`}>
                    Gravidade Padrão: {tipoSelecionado.gravidade_padrao}
                  </Badge>
                  {(tipoSelecionado.prazo_sla_minutos !== null && tipoSelecionado.prazo_sla_minutos !== undefined) || 
                   (tipoSelecionado.prazo_sla_horas !== null && tipoSelecionado.prazo_sla_horas !== undefined) ? (
                    <Badge variant="outline" className="text-xs">
                      SLA: {getPrazoEmHoras(tipoSelecionado)}h
                    </Badge>
                  ) : null}
                </div>
              </div>
            )}
          </div>

          {/* Gravidade - somente exibição */}
          {tipoSelecionado && (
            <div>
              <Label className="font-bold">
                Gravidade
              </Label>
              <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg border-2 border-gray-200 dark:border-gray-700">
                <Badge variant="outline" className={`text-sm border ${gravidadeColors[formData.gravidade]}`}>
                  {formData.gravidade.charAt(0).toUpperCase() + formData.gravidade.slice(1)}
                </Badge>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  Gravidade definida automaticamente pelo tipo de ocorrência selecionado
                </p>
              </div>
            </div>
          )}

          {/* Responsável */}
          <div>
            <Label className="font-bold mb-2 block">
              Atribuir Responsabilidade
            </Label>
            
            <Tabs 
              value={formData.tipoResponsavel} 
              onValueChange={(value) => {
                setFormData({ 
                  ...formData, 
                  tipoResponsavel: value,
                  responsavel_id: "",
                  departamento_responsavel_id: ""
                });
                setUsuarioBusca("");
                setDepartamentoBusca("");
              }}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-2 mb-3">
                <TabsTrigger value="usuario" className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Usuário
                </TabsTrigger>
                <TabsTrigger value="departamento" className="flex items-center gap-2">
                  <Building2 className="w-4 h-4" />
                  Departamento
                </TabsTrigger>
              </TabsList>

              <TabsContent value="usuario" className="mt-0">
                <div className="relative">
                  <Input
                    value={(() => {
                      if (formData.responsavel_id) {
                        const usr = usuarios.find(u => u.id === formData.responsavel_id);
                        return usr ? usr.full_name : '';
                      }
                      return usuarioBusca;
                    })()}
                    onChange={(e) => {
                      setUsuarioBusca(e.target.value);
                      setFormData({ ...formData, responsavel_id: "" });
                    }}
                    placeholder="Digite o nome do usuário..."
                    className="w-full"
                  />
                  {usuarioBusca && !formData.responsavel_id && (
                    <div className="absolute z-50 w-full mt-1 bg-white dark:bg-slate-800 border dark:border-slate-700 rounded-lg shadow-lg max-h-60 overflow-auto">
                      {usuarios.filter(u => u.full_name.toLowerCase().includes(usuarioBusca.toLowerCase())).length === 0 ? (
                        <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                          Nenhum usuário encontrado
                        </div>
                      ) : (
                        <>
                          <div
                            className="px-4 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-700 border-b dark:border-slate-700"
                            onClick={() => {
                              setFormData({ ...formData, responsavel_id: "" });
                              setUsuarioBusca("");
                            }}
                          >
                            <p className="text-sm text-gray-500 dark:text-gray-400">Nenhum usuário</p>
                          </div>
                          {usuarios
                            .filter(u => u.full_name.toLowerCase().includes(usuarioBusca.toLowerCase()))
                            .slice(0, 10)
                            .map((usuario) => (
                              <div
                                key={usuario.id}
                                className="px-4 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
                                onClick={() => {
                                  setFormData({ ...formData, responsavel_id: usuario.id });
                                  setUsuarioBusca("");
                                }}
                              >
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center overflow-hidden">
                                    {usuario.foto_url ? (
                                      <img src={usuario.foto_url} alt={usuario.full_name} className="w-full h-full object-cover" />
                                    ) : (
                                      <User className="w-4 h-4 text-blue-600" />
                                    )}
                                  </div>
                                  <div className="flex-1">
                                    <p className="font-medium text-sm">{usuario.full_name}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                      {usuario.cargo || usuario.email}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            ))}
                        </>
                      )}
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="departamento" className="mt-0">
                <div className="relative">
                  <Input
                    value={(() => {
                      if (formData.departamento_responsavel_id) {
                        const dept = departamentos.find(d => d.id === formData.departamento_responsavel_id);
                        return dept ? dept.nome : '';
                      }
                      return departamentoBusca;
                    })()}
                    onChange={(e) => {
                      setDepartamentoBusca(e.target.value);
                      setFormData({ ...formData, departamento_responsavel_id: "" });
                    }}
                    placeholder="Digite o nome do departamento..."
                    className="w-full"
                  />
                  {departamentoBusca && !formData.departamento_responsavel_id && (
                    <div className="absolute z-50 w-full mt-1 bg-white dark:bg-slate-800 border dark:border-slate-700 rounded-lg shadow-lg max-h-60 overflow-auto">
                      {departamentos
                        .filter(d => d.ativo && d.nome.toLowerCase().includes(departamentoBusca.toLowerCase()))
                        .length === 0 ? (
                        <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                          Nenhum departamento encontrado
                        </div>
                      ) : (
                        <>
                          <div
                            className="px-4 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-700 border-b dark:border-slate-700"
                            onClick={() => {
                              setFormData({ ...formData, departamento_responsavel_id: "" });
                              setDepartamentoBusca("");
                            }}
                          >
                            <p className="text-sm text-gray-500 dark:text-gray-400">Nenhum departamento</p>
                          </div>
                          {departamentos
                            .filter(d => d.ativo && d.nome.toLowerCase().includes(departamentoBusca.toLowerCase()))
                            .slice(0, 10)
                            .map((departamento) => (
                              <div
                                key={departamento.id}
                                className="px-4 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
                                onClick={() => {
                                  setFormData({ ...formData, departamento_responsavel_id: departamento.id });
                                  setDepartamentoBusca("");
                                }}
                              >
                                <div className="flex items-center gap-3">
                                  <div
                                    className="w-3 h-12 rounded flex-shrink-0"
                                    style={{ backgroundColor: departamento.cor }}
                                  />
                                  <div className="flex-1">
                                    <p className="font-medium text-sm">{departamento.nome}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                      {departamento.usuarios_ids?.length || 0} membros
                                    </p>
                                  </div>
                                </div>
                              </div>
                            ))}
                        </>
                      )}
                    </div>
                  )}
                </div>
                {formData.departamento_responsavel_id && departamentos.find(d => d.id === formData.departamento_responsavel_id) && (
                  <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-200 dark:border-blue-800">
                    <p className="text-xs text-blue-700 dark:text-blue-300">
                      <strong>Membros:</strong> {departamentos.find(d => d.id === formData.departamento_responsavel_id)?.usuarios_ids?.length || 0} usuários serão notificados
                    </p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>

          {/* Observações */}
          <div>
            <Label htmlFor="observacoes" className="font-bold">
              Observações / Descrição *
            </Label>
            <Textarea
              id="observacoes"
              value={formData.observacoes}
              onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
              placeholder="Descreva o problema, observação ou tarefa..."
              rows={5}
              required
              className="border-2 bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500"
              style={{ borderColor: '#d1d5db' }}
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Descreva detalhadamente o problema, observação ou tarefa
            </p>
          </div>

          {/* Alert de contexto */}
          {contexto && (
            <div className={`p-4 rounded-lg border-2 ${
              contexto === "nota_fiscal" 
                ? "bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800"
                : "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
            }`}>
              <div className="flex items-start gap-3">
                {contexto === "nota_fiscal" ? (
                  <AlertTriangle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                ) : (
                  <FileText className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                )}
                <div>
                  <p className={`font-semibold mb-1 ${
                    contexto === "nota_fiscal" 
                      ? "text-orange-900 dark:text-orange-300"
                      : "text-green-900 dark:text-green-300"
                  }`}>
                    {contexto === "nota_fiscal" ? "Ocorrência de Nota Fiscal" : "Ocorrência Avulsa"}
                  </p>
                  <p className={`text-sm ${
                    contexto === "nota_fiscal"
                      ? "text-orange-700 dark:text-orange-400"
                      : "text-green-700 dark:text-green-400"
                  }`}>
                    {contexto === "nota_fiscal" 
                      ? `Esta ocorrência será vinculada à nota fiscal ${contextoDescricao}. Um número de ticket será gerado automaticamente.`
                      : "Esta ocorrência será registrada como AVULSA, sem vínculo com nenhuma ordem de carregamento ou etapa específica. Um número de ticket será gerado automaticamente."
                    }
                  </p>
                </div>
              </div>
            </div>
          )}
        </form>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={saving}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={saving || !formData.observacoes.trim()}
            className={contexto === "nota_fiscal" ? "bg-orange-600 hover:bg-orange-700" : "bg-green-600 hover:bg-green-700"}
          >
            {saving ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Salvando...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Registrar Ocorrência
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}