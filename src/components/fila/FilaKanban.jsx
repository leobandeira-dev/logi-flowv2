import React from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, Clock } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function FilaKanban({ 
  statusFila, 
  fila, 
  tiposFila, 
  onDragEnd, 
  onRemove, 
  calcularTempoNaFila, 
  formatarTelefone, 
  abrirWhatsApp,
  theme 
}) {
  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {statusFila.map(statusObj => {
          const veiculosDoStatus = fila.filter(v => v.status === statusObj.nome.toLowerCase().replace(/ /g, '_'));
          
          return (
            <div key={statusObj.id}>
              <div 
                className="rounded-t-lg p-4 mb-2"
                style={{ backgroundColor: statusObj.cor }}
              >
                <div className="flex items-center gap-2 text-white">
                  <span style={{ fontSize: '1.5rem' }}>{statusObj.icone}</span>
                  <h3 className="font-bold text-lg">{statusObj.nome}</h3>
                  <span className="ml-auto bg-white/20 px-2 py-0.5 rounded-full text-sm">
                    {veiculosDoStatus.length}
                  </span>
                </div>
              </div>

              <Droppable droppableId={statusObj.id}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className="space-y-3 min-h-[400px] p-3 rounded-b-lg border-2 border-t-0"
                    style={{
                      backgroundColor: snapshot.isDraggingOver 
                        ? (theme.cardBg === '#1e293b' ? '#334155' : '#f1f5f9')
                        : theme.bg,
                      borderColor: snapshot.isDraggingOver ? statusObj.cor : theme.cardBorder,
                      transition: 'all 0.2s'
                    }}
                  >
                    {veiculosDoStatus.map((item, index) => {
                      const tipo = tiposFila.find(t => t.id === item.tipo_fila_id);
                      
                      return (
                        <Draggable key={item.id} draggableId={item.id} index={index}>
                          {(provided, snapshot) => (
                            <Card
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              style={{
                                ...provided.draggableProps.style,
                                backgroundColor: snapshot.isDragging 
                                  ? (theme.cardBg === '#1e293b' ? '#1e293b' : '#ffffff')
                                  : theme.cardBg,
                                borderColor: snapshot.isDragging ? '#3b82f6' : theme.cardBorder,
                                opacity: snapshot.isDragging ? 0.9 : 1,
                                cursor: 'grab'
                              }}
                              className="shadow-md hover:shadow-lg transition-shadow"
                              >
                              <CardContent className="p-2.5">
                                {/* Header com posição, tipo e ações */}
                                <div className="flex items-center justify-between mb-2">
                                  <div className="flex items-center gap-1.5">
                                    <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                                      <span className="font-bold text-xs text-blue-700 dark:text-blue-300">
                                        {item.posicao_fila || index + 1}
                                      </span>
                                    </div>
                                    {tipo && (
                                      <span
                                        className="px-1.5 py-0.5 rounded text-[10px] font-semibold text-white"
                                        style={{ backgroundColor: tipo.cor }}
                                      >
                                        {tipo.nome}
                                      </span>
                                    )}
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => onRemove(item.id)}
                                    className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </Button>
                                </div>

                                {/* Nome do Motorista */}
                                <div className="mb-2">
                                  <p className="font-bold text-sm leading-tight" style={{ color: theme.text }}>{item.motorista_nome}</p>
                                </div>

                                {/* Layout em duas colunas */}
                                <div className="grid grid-cols-2 gap-2 text-[11px]">
                                  {/* Coluna Esquerda */}
                                  <div className="space-y-1 overflow-hidden min-w-0">
                                    <div className="overflow-hidden">
                                      <p className="text-[10px] mb-0.5" style={{ color: theme.textMuted }}>CPF</p>
                                      <p className="font-mono text-[9px] leading-tight break-all" style={{ color: theme.text }}>{item.motorista_cpf}</p>
                                    </div>

                                    <div className="overflow-hidden">
                                      <p className="text-[10px] mb-0.5" style={{ color: theme.textMuted }}>Cavalo</p>
                                      <p className="font-mono font-bold text-[11px]" style={{ color: theme.text }}>{item.cavalo_placa}</p>
                                      <p className="text-[9px] text-blue-600 dark:text-blue-400 font-mono font-bold">Senha: {item.senha_fila}</p>
                                    </div>

                                    {item.tipo_veiculo && (
                                      <div className="overflow-hidden">
                                        <p className="text-[9px] leading-tight break-words" style={{ color: theme.text }}>
                                          {item.tipo_veiculo}
                                          {item.tipo_carroceria && ` / ${item.tipo_carroceria}`}
                                        </p>
                                      </div>
                                    )}
                                  </div>

                                  {/* Coluna Direita */}
                                  <div className="space-y-1 overflow-hidden">
                                    <div>
                                      <p className="text-[10px] mb-0.5" style={{ color: theme.textMuted }}>Tel</p>
                                      <div className="flex items-center gap-0.5 min-w-0">
                                        <p className="text-[9px] break-all leading-tight" style={{ color: theme.text }}>{formatarTelefone(item.motorista_telefone)}</p>
                                        {item.motorista_telefone && (
                                          <button
                                            onClick={() => abrirWhatsApp(item.motorista_telefone)}
                                            className="text-green-600 hover:text-green-700 flex-shrink-0"
                                            title="WhatsApp"
                                          >
                                            <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 24 24">
                                              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                                            </svg>
                                          </button>
                                        )}
                                      </div>
                                    </div>

                                    {item.senha_fila && (
                                      <div>
                                        <p className="text-[10px] mb-0.5" style={{ color: theme.textMuted }}>Senha</p>
                                        <p className="font-mono text-[10px] font-bold text-blue-600 dark:text-blue-400">{item.senha_fila}</p>
                                      </div>
                                    )}

                                    {(item.implemento1_placa || item.implemento2_placa) && (
                                      <div>
                                        <p className="text-[10px] mb-0.5" style={{ color: theme.textMuted }}>Impl</p>
                                        <p className="font-mono text-[9px] break-all leading-tight" style={{ color: theme.text }}>
                                          {[item.implemento1_placa, item.implemento2_placa].filter(Boolean).join(' / ')}
                                        </p>
                                      </div>
                                    )}

                                    {item.localizacao_atual && (
                                      <div>
                                        <p className="text-[10px] mb-0.5" style={{ color: theme.textMuted }}>Local</p>
                                        <p className="text-[9px] leading-tight break-words" style={{ color: theme.text }}>{item.localizacao_atual}</p>
                                      </div>
                                    )}
                                  </div>
                                </div>

                                {/* Footer com data e tempo */}
                                <div className="flex items-center justify-between pt-1.5 mt-1.5 border-t" style={{ borderColor: theme.cardBorder }}>
                                  <div className="text-[10px]" style={{ color: theme.textMuted }}>
                                    {item.data_entrada_fila ? format(new Date(item.data_entrada_fila), "dd/MM/yy HH:mm", { locale: ptBR }) : "-"}
                                  </div>
                                  <div className="flex items-center gap-0.5">
                                    <Clock className="w-2.5 h-2.5 text-orange-600" />
                                    <span className="text-[10px] font-semibold text-orange-600">
                                      {calcularTempoNaFila(item.data_entrada_fila)}
                                    </span>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          )}
                        </Draggable>
                      );
                    })}
                    {provided.placeholder}
                    
                    {veiculosDoStatus.length === 0 && (
                      <div className="text-center py-8 opacity-50">
                        <p className="text-sm" style={{ color: theme.textMuted }}>
                          Nenhum veículo
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </Droppable>
            </div>
          );
        })}
      </div>
    </DragDropContext>
  );
}