import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Package, FileText, Tag, Truck, CheckCircle, Ruler, AlertCircle } from "lucide-react";

// IT-ARM-001: Recebimento de Mercadorias
export function InstrucaoRecebimento({ theme, isDark }) {
  return (
    <Card style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}>
      <CardContent className="p-8 space-y-6">
        {/* Cabeçalho */}
        <div className="border-b pb-6" style={{ borderColor: theme.cardBorder }}>
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h1 className="text-2xl font-bold mb-2" style={{ color: theme.text }}>
                INSTRUÇÃO DE TRABALHO
              </h1>
              <h2 className="text-xl font-semibold mb-1" style={{ color: theme.text }}>
                Recebimento de Mercadorias
              </h2>
            </div>
            <div className="text-right text-sm" style={{ color: theme.textMuted }}>
              <p className="font-bold">Código: IT-ARM-001</p>
              <p>Revisão: 01</p>
              <p>Data: 27/01/2026</p>
              <p>Páginas: 1/2</p>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <p className="font-semibold" style={{ color: theme.text }}>Elaborado por:</p>
              <p style={{ color: theme.textMuted }}>Coord. Armazém</p>
            </div>
            <div>
              <p className="font-semibold" style={{ color: theme.text }}>Aprovado por:</p>
              <p style={{ color: theme.textMuted }}>Diretor de Operações</p>
            </div>
            <div>
              <p className="font-semibold" style={{ color: theme.text }}>Ref. Procedimento:</p>
              <p style={{ color: theme.textMuted }}>PO-LOG-002</p>
            </div>
          </div>
        </div>

        {/* 1. Objetivo */}
        <section>
          <h3 className="text-lg font-bold mb-3" style={{ color: theme.text }}>1. OBJETIVO</h3>
          <p className="text-sm" style={{ color: theme.textMuted }}>
            Padronizar o processo de recebimento de mercadorias, garantindo conformidade fiscal, 
            acuracidade de inventário e rastreabilidade de volumes.
          </p>
        </section>

        {/* 2. Acesso ao Sistema */}
        <section>
          <h3 className="text-lg font-bold mb-3" style={{ color: theme.text }}>2. ACESSO</h3>
          <p className="text-sm font-semibold" style={{ color: theme.text }}>
            Menu: <span className="text-blue-600">Armazém → Recebimento</span>
          </p>
        </section>

        {/* 3. Procedimento Passo a Passo */}
        <section>
          <h3 className="text-lg font-bold mb-3" style={{ color: theme.text }}>3. PROCEDIMENTO</h3>
          
          <div className="space-y-4">
            <div className="flex gap-3">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">1</div>
              <div className="flex-1">
                <p className="font-semibold text-sm mb-1" style={{ color: theme.text }}>Importar NF-e</p>
                <p className="text-xs mb-2" style={{ color: theme.textMuted }}>
                  <strong>Métodos disponíveis:</strong>
                </p>
                <ul className="text-xs space-y-1 ml-4 list-disc" style={{ color: theme.textMuted }}>
                  <li><strong>Scanner de Câmera:</strong> Clique em "📷 Escanear QR Code" e aponte para o código de barras da NF-e</li>
                  <li><strong>Scanner Manual:</strong> Bipe a chave de 44 dígitos no campo de busca</li>
                  <li><strong>Upload de XML:</strong> Clique em "Upload XML" e selecione o arquivo</li>
                  <li><strong>Digitação:</strong> Cole ou digite a chave de 44 dígitos</li>
                </ul>
                <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded text-xs">
                  <p className="font-bold text-blue-600">✓ Sistema importa automaticamente:</p>
                  <p style={{ color: theme.textMuted }}>
                    Remetente, destinatário, peso, volumes, valor da nota. Cria volumes automaticamente 
                    no formato: NUMERO_NF-SEQ (ex: 12345-01, 12345-02, ...)
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">2</div>
              <div className="flex-1">
                <p className="font-semibold text-sm mb-1" style={{ color: theme.text }}>Conferir Dados Importados</p>
                <p className="text-xs mb-2" style={{ color: theme.textMuted }}>Validar as informações:</p>
                <ul className="text-xs space-y-1 ml-4 list-disc" style={{ color: theme.textMuted }}>
                  <li>Remetente e destinatário corretos</li>
                  <li>Quantidade de volumes declarada × recebida</li>
                  <li>Peso total declarado × conferido</li>
                  <li>Produto/mercadoria descrita</li>
                </ul>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">3</div>
              <div className="flex-1">
                <p className="font-semibold text-sm mb-1" style={{ color: theme.text }}>Registrar Divergências (se houver)</p>
                <p className="text-xs mb-2" style={{ color: theme.textMuted }}>
                  Caso identifique diferenças:
                </p>
                <ul className="text-xs space-y-1 ml-4 list-disc" style={{ color: theme.textMuted }}>
                  <li><strong>Falta de volume:</strong> Anotar nas observações, registrar ocorrência</li>
                  <li><strong>Sobra de volume:</strong> Adicionar volume extra manualmente</li>
                  <li><strong>Diferença de peso:</strong> Anexar Carta de Correção ou autorização</li>
                  <li><strong>Avaria:</strong> Fotografar, registrar ocorrência, notificar remetente</li>
                </ul>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">4</div>
              <div className="flex-1">
                <p className="font-semibold text-sm mb-1" style={{ color: theme.text }}>Definir Área de Armazenagem</p>
                <p className="text-xs" style={{ color: theme.textMuted }}>
                  Preencha o campo <strong>"Número da Área"</strong> com a localização física no armazém 
                  (ex: A1, B2, Doca 3). Este número é <strong>fixo por nota</strong>, facilitando localização futura.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">5</div>
              <div className="flex-1">
                <p className="font-semibold text-sm mb-1" style={{ color: theme.text }}>Imprimir Etiquetas (Opcional)</p>
                <p className="text-xs mb-2" style={{ color: theme.textMuted }}>
                  Clique em <strong>"Imprimir Etiquetas"</strong> na linha da nota fiscal:
                </p>
                <ul className="text-xs space-y-1 ml-4 list-disc" style={{ color: theme.textMuted }}>
                  <li><strong>Etiquetas Individuais:</strong> Uma etiqueta por volume (10x15cm ou A4)</li>
                  <li><strong>Etiqueta Mãe:</strong> Uma etiqueta consolidada para todos os volumes</li>
                </ul>
                <p className="text-xs mt-2" style={{ color: theme.textMuted }}>
                  As etiquetas contêm: QR Code, número da NF, sequencial, remetente, destinatário.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">✓</div>
              <div className="flex-1">
                <p className="font-semibold text-sm mb-1 text-green-600">Concluir Recebimento</p>
                <p className="text-xs" style={{ color: theme.textMuted }}>
                  Após validar tudo, clique em <strong>"Salvar"</strong>. A nota fica com status "Recebida" 
                  e os volumes ficam disponíveis para unitização/expedição.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 4. Observações Importantes */}
        <section>
          <h3 className="text-lg font-bold mb-3" style={{ color: theme.text }}>4. OBSERVAÇÕES IMPORTANTES</h3>
          <div className="space-y-2 text-xs" style={{ color: theme.textMuted }}>
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
              <p>
                <strong>Vencimento de NF-e:</strong> O sistema calcula automaticamente 20 dias após emissão. 
                Notas próximas ao vencimento aparecem em destaque.
              </p>
            </div>
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
              <p>
                <strong>Peso Original vs Editado:</strong> O sistema mantém registro do peso original do XML. 
                Se houver alteração, é obrigatório anexar Carta de Correção.
              </p>
            </div>
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
              <p>
                <strong>Volumes Extras:</strong> Se receber mais volumes que o declarado, adicione manualmente 
                pelo botão "Editar Volumes" e informe o motivo nas observações.
              </p>
            </div>
          </div>
        </section>

        {/* 5. Indicadores */}
        <section>
          <h3 className="text-lg font-bold mb-3" style={{ color: theme.text }}>5. INDICADORES</h3>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-2 border rounded" style={{ borderColor: theme.cardBorder }}>
              <p className="font-bold" style={{ color: theme.text }}>Acuracidade:</p>
              <p style={{ color: theme.textMuted }}>(Volumes OK / Total recebido) × 100</p>
              <p className="font-bold text-green-600 mt-1">Meta: ≥ 98%</p>
            </div>
            <div className="p-2 border rounded" style={{ borderColor: theme.cardBorder }}>
              <p className="font-bold" style={{ color: theme.text }}>Tempo Médio:</p>
              <p style={{ color: theme.textMuted }}>Tempo de recebimento por NF</p>
              <p className="font-bold text-green-600 mt-1">Meta: ≤ 15 min</p>
            </div>
          </div>
        </section>

        {/* Rodapé */}
        <div className="border-t pt-4 mt-8 text-xs text-center" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>
          <p>Documento controlado eletronicamente - Versão impressa é cópia não controlada</p>
        </div>
      </CardContent>
    </Card>
  );
}

// IT-ARM-002: Gestão de Notas Fiscais
export function InstrucaoGestaoNotasFiscais({ theme, isDark }) {
  return (
    <Card style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}>
      <CardContent className="p-8 space-y-6">
        {/* Cabeçalho */}
        <div className="border-b pb-6" style={{ borderColor: theme.cardBorder }}>
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h1 className="text-2xl font-bold mb-2" style={{ color: theme.text }}>
                INSTRUÇÃO DE TRABALHO
              </h1>
              <h2 className="text-xl font-semibold mb-1" style={{ color: theme.text }}>
                Gestão de Notas Fiscais
              </h2>
            </div>
            <div className="text-right text-sm" style={{ color: theme.textMuted }}>
              <p className="font-bold">Código: IT-ARM-002</p>
              <p>Revisão: 01</p>
              <p>Data: 27/01/2026</p>
              <p>Páginas: 1/2</p>
            </div>
          </div>
        </div>

        {/* 1. Objetivo */}
        <section>
          <h3 className="text-lg font-bold mb-3" style={{ color: theme.text }}>1. OBJETIVO</h3>
          <p className="text-sm" style={{ color: theme.textMuted }}>
            Estabelecer critérios para controle, rastreamento e gestão do ciclo de vida de notas fiscais 
            eletrônicas (NF-e), desde o recebimento até a entrega final.
          </p>
        </section>

        {/* 2. Acesso */}
        <section>
          <h3 className="text-lg font-bold mb-3" style={{ color: theme.text }}>2. ACESSO</h3>
          <p className="text-sm font-semibold" style={{ color: theme.text }}>
            Menu: <span className="text-blue-600">Armazém → Gestão de Notas Fiscais</span>
          </p>
        </section>

        {/* 3. Funcionalidades Principais */}
        <section>
          <h3 className="text-lg font-bold mb-3" style={{ color: theme.text }}>3. FUNCIONALIDADES</h3>
          
          <div className="space-y-4">
            <div>
              <h4 className="font-bold text-sm mb-2" style={{ color: theme.text }}>3.1 Visualização e Filtros</h4>
              <ul className="text-xs space-y-1 ml-4 list-disc" style={{ color: theme.textMuted }}>
                <li>Buscar por número da nota, chave, remetente ou destinatário</li>
                <li>Filtrar por status (recebida, aguardando expedição, em rota, entregue, cancelada)</li>
                <li>Filtrar por período de emissão ou vencimento</li>
                <li>Ordenar por data, número, peso, valor</li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-sm mb-2" style={{ color: theme.text }}>3.2 Ações Disponíveis por Nota</h4>
              <table className="w-full text-xs border mt-2" style={{ borderColor: theme.cardBorder }}>
                <thead style={{ backgroundColor: isDark ? '#0f172a' : '#f9fafb' }}>
                  <tr>
                    <th className="border p-2 text-left w-32" style={{ borderColor: theme.cardBorder, color: theme.text }}>Ação</th>
                    <th className="border p-2 text-left" style={{ borderColor: theme.cardBorder, color: theme.text }}>Descrição</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border p-2 font-semibold" style={{ borderColor: theme.cardBorder, color: theme.text }}>Ver Detalhes</td>
                    <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>
                      Visualizar timeline completa: recebimento → expedição → entrega
                    </td>
                  </tr>
                  <tr>
                    <td className="border p-2 font-semibold" style={{ borderColor: theme.cardBorder, color: theme.text }}>Editar Nota</td>
                    <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>
                      Alterar dados complementares (área, observações)
                    </td>
                  </tr>
                  <tr>
                    <td className="border p-2 font-semibold" style={{ borderColor: theme.cardBorder, color: theme.text }}>Editar Volumes</td>
                    <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>
                      Adicionar/remover volumes, alterar peso individual, anexar carta de correção
                    </td>
                  </tr>
                  <tr>
                    <td className="border p-2 font-semibold" style={{ borderColor: theme.cardBorder, color: theme.text }}>Baixar XML</td>
                    <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>
                      Download do arquivo XML original da NF-e
                    </td>
                  </tr>
                  <tr>
                    <td className="border p-2 font-semibold" style={{ borderColor: theme.cardBorder, color: theme.text }}>Imprimir DANFE</td>
                    <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>
                      Gerar PDF do DANFE (Documento Auxiliar da NF-e)
                    </td>
                  </tr>
                  <tr>
                    <td className="border p-2 font-semibold" style={{ borderColor: theme.cardBorder, color: theme.text }}>Imprimir Etiquetas</td>
                    <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>
                      Etiquetas individuais ou etiqueta mãe consolidada
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div>
              <h4 className="font-bold text-sm mb-2" style={{ color: theme.text }}>3.3 Controle de Vencimentos</h4>
              <p className="text-xs mb-2" style={{ color: theme.textMuted }}>
                O sistema alerta automaticamente:
              </p>
              <ul className="text-xs space-y-1 ml-4 list-disc" style={{ color: theme.textMuted }}>
                <li><span className="text-red-600 font-bold">VERMELHO:</span> NF-e vencida (mais de 20 dias)</li>
                <li><span className="text-yellow-600 font-bold">AMARELO:</span> Vence em 5 dias ou menos</li>
                <li><span className="text-green-600 font-bold">VERDE:</span> Dentro do prazo</li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-sm mb-2" style={{ color: theme.text }}>3.4 Status do Ciclo de Vida</h4>
              <div className="space-y-1 text-xs" style={{ color: theme.textMuted }}>
                <p>1️⃣ <strong>Recebida:</strong> Mercadoria entrada no armazém</p>
                <p>2️⃣ <strong>Aguardando Expedição:</strong> Vinculada a uma ordem de carregamento</p>
                <p>3️⃣ <strong>Em Rota Entrega:</strong> Veículo em trânsito com a mercadoria</p>
                <p>4️⃣ <strong>Entregue:</strong> Comprovante de entrega registrado</p>
                <p>5️⃣ <strong>Cancelada:</strong> NF-e cancelada pelo emitente</p>
              </div>
            </div>
          </div>
        </section>

        {/* 4. Exportação e Relatórios */}
        <section>
          <h3 className="text-lg font-bold mb-3" style={{ color: theme.text }}>4. EXPORTAÇÃO E RELATÓRIOS</h3>
          <ul className="text-sm space-y-1 ml-4 list-disc" style={{ color: theme.textMuted }}>
            <li><strong>Gráfico Temporal:</strong> Visualizar evolução de recebimentos ou entregas</li>
            <li><strong>Exportar para Excel:</strong> Dados completos das notas filtradas</li>
            <li><strong>Imprimir Relatório:</strong> Lista consolidada em PDF</li>
          </ul>
        </section>

        {/* Rodapé */}
        <div className="border-t pt-4 mt-8 text-xs text-center" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>
          <p>Documento controlado eletronicamente - Versão impressa é cópia não controlada</p>
        </div>
      </CardContent>
    </Card>
  );
}

// IT-ARM-003: Gestão de CT-e
export function InstrucaoGestaoCTe({ theme, isDark }) {
  return (
    <Card style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}>
      <CardContent className="p-8 space-y-6">
        {/* Cabeçalho */}
        <div className="border-b pb-6" style={{ borderColor: theme.cardBorder }}>
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h1 className="text-2xl font-bold mb-2" style={{ color: theme.text }}>
                INSTRUÇÃO DE TRABALHO
              </h1>
              <h2 className="text-xl font-semibold mb-1" style={{ color: theme.text }}>
                Gestão de Conhecimentos de Transporte Eletrônicos (CT-e)
              </h2>
            </div>
            <div className="text-right text-sm" style={{ color: theme.textMuted }}>
              <p className="font-bold">Código: IT-ARM-003</p>
              <p>Revisão: 01</p>
              <p>Data: 27/01/2026</p>
              <p>Páginas: 1/1</p>
            </div>
          </div>
        </div>

        {/* 1. Objetivo */}
        <section>
          <h3 className="text-lg font-bold mb-3" style={{ color: theme.text }}>1. OBJETIVO</h3>
          <p className="text-sm" style={{ color: theme.textMuted }}>
            Padronizar o processamento, armazenamento e controle de CT-e (Conhecimento de Transporte Eletrônico), 
            garantindo conformidade fiscal e rastreabilidade documental.
          </p>
        </section>

        {/* 2. Acesso */}
        <section>
          <h3 className="text-lg font-bold mb-3" style={{ color: theme.text }}>2. ACESSO</h3>
          <p className="text-sm font-semibold" style={{ color: theme.text }}>
            Menu: <span className="text-blue-600">Armazém → Gestão de CT-e</span>
          </p>
        </section>

        {/* 3. Procedimento */}
        <section>
          <h3 className="text-lg font-bold mb-3" style={{ color: theme.text }}>3. PROCEDIMENTO</h3>
          
          <div className="space-y-4">
            <div className="flex gap-3">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">1</div>
              <div className="flex-1">
                <p className="font-semibold text-sm mb-1" style={{ color: theme.text }}>Importar CT-e</p>
                <p className="text-xs mb-2" style={{ color: theme.textMuted }}>
                  <strong>Métodos:</strong>
                </p>
                <ul className="text-xs space-y-1 ml-4 list-disc" style={{ color: theme.textMuted }}>
                  <li><strong>Upload de XML:</strong> Fazer upload do arquivo XML do CT-e</li>
                  <li><strong>Chave de Acesso:</strong> Digitar ou bipar chave de 44 dígitos</li>
                  <li><strong>Email Automático:</strong> Sistema pode receber XMLs via email configurado (IT-ARM-003-A)</li>
                </ul>
                <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded text-xs">
                  <p className="font-bold text-blue-600">✓ Sistema extrai automaticamente:</p>
                  <p style={{ color: theme.textMuted }}>
                    Número CT-e, tomador, remetente, destinatário, valor, peso, NF-e vinculadas, dados do veículo
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">2</div>
              <div className="flex-1">
                <p className="font-semibold text-sm mb-1" style={{ color: theme.text }}>Vincular à Ordem de Carregamento (Opcional)</p>
                <p className="text-xs" style={{ color: theme.textMuted }}>
                  Na tela de detalhes do CT-e, selecione a <strong>Ordem de Carregamento</strong> correspondente. 
                  O sistema automaticamente preenche o campo <strong>numero_cte</strong> na ordem.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">3</div>
              <div className="flex-1">
                <p className="font-semibold text-sm mb-1" style={{ color: theme.text }}>Acompanhar Status</p>
                <div className="text-xs space-y-1 mt-2" style={{ color: theme.textMuted }}>
                  <p>📋 <strong>Emitido:</strong> CT-e recebido e processado</p>
                  <p>🚚 <strong>Em Trânsito:</strong> Mercadoria em transporte</p>
                  <p>✅ <strong>Entregue:</strong> Destinatário recebeu a mercadoria</p>
                  <p>❌ <strong>Cancelado:</strong> CT-e cancelado pelo emitente</p>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">4</div>
              <div className="flex-1">
                <p className="font-semibold text-sm mb-1" style={{ color: theme.text }}>Download e Impressão</p>
                <ul className="text-xs space-y-1 ml-4 list-disc" style={{ color: theme.textMuted }}>
                  <li><strong>Baixar XML Original:</strong> Guardar para validação fiscal</li>
                  <li><strong>Imprimir DACTE:</strong> Documento Auxiliar do CT-e (obrigatório acompanhar carga)</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* 4. Configuração de Email Automático */}
        <section>
          <h3 className="text-lg font-bold mb-3" style={{ color: theme.text }}>4. CONFIGURAÇÃO DE RECEBIMENTO AUTOMÁTICO (IT-ARM-003-A)</h3>
          <div className="text-xs space-y-2" style={{ color: theme.textMuted }}>
            <p><strong>Para receber CT-e automaticamente via email:</strong></p>
            <ol className="list-decimal ml-6 space-y-1">
              <li>Solicitar ao administrador configurar email dedicado (ex: cte@suaempresa.com)</li>
              <li>Configurar transportadoras para enviar CT-e para este email</li>
              <li>Sistema processa XMLs anexados automaticamente</li>
              <li>Notificação no sistema quando novo CT-e for importado</li>
            </ol>
            <div className="mt-2 p-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded">
              <p className="font-bold text-green-600">Benefício:</p>
              <p>Elimina necessidade de importação manual, reduzindo erros e tempo de operação.</p>
            </div>
          </div>
        </section>

        {/* 5. Validações Fiscais */}
        <section>
          <h3 className="text-lg font-bold mb-3" style={{ color: theme.text }}>5. VALIDAÇÕES FISCAIS</h3>
          <ul className="text-sm space-y-1 ml-4 list-disc" style={{ color: theme.textMuted }}>
            <li>Chave de acesso válida (44 dígitos)</li>
            <li>CT-e autorizado pela SEFAZ (consulta automática)</li>
            <li>CNPJ do tomador corresponde ao cadastrado no sistema</li>
            <li>Valor do frete conforme acordado (alerta se divergência)</li>
          </ul>
        </section>

        {/* Rodapé */}
        <div className="border-t pt-4 mt-8 text-xs text-center" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>
          <p>Documento controlado eletronicamente - Versão impressa é cópia não controlada</p>
        </div>
      </CardContent>
    </Card>
  );
}

// IT-ARM-004: Etiquetas Mãe
export function InstrucaoEtiquetasMae({ theme, isDark }) {
  return (
    <Card style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}>
      <CardContent className="p-8 space-y-6">
        {/* Cabeçalho */}
        <div className="border-b pb-6" style={{ borderColor: theme.cardBorder }}>
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h1 className="text-2xl font-bold mb-2" style={{ color: theme.text }}>
                INSTRUÇÃO DE TRABALHO
              </h1>
              <h2 className="text-xl font-semibold mb-1" style={{ color: theme.text }}>
                Etiquetas Mãe - Unitização de Volumes
              </h2>
            </div>
            <div className="text-right text-sm" style={{ color: theme.textMuted }}>
              <p className="font-bold">Código: IT-ARM-004</p>
              <p>Revisão: 01</p>
              <p>Data: 27/01/2026</p>
              <p>Páginas: 1/2</p>
            </div>
          </div>
        </div>

        {/* 1. Objetivo */}
        <section>
          <h3 className="text-lg font-bold mb-3" style={{ color: theme.text }}>1. OBJETIVO</h3>
          <p className="text-sm" style={{ color: theme.textMuted }}>
            Estabelecer procedimento para unitização de volumes através de etiquetas mãe, 
            otimizando a expedição e facilitando o carregamento de volumes de mesma rota/cliente.
          </p>
        </section>

        {/* 2. Quando Usar */}
        <section>
          <h3 className="text-lg font-bold mb-3" style={{ color: theme.text }}>2. QUANDO USAR ETIQUETAS MÃE</h3>
          <ul className="text-sm space-y-1 ml-4 list-disc" style={{ color: theme.textMuted }}>
            <li>Múltiplas notas fiscais para mesmo destino</li>
            <li>Volumes pequenos que podem ser paletizados juntos</li>
            <li>Cargas fracionadas com mesma rota</li>
            <li>Consolidação para reduzir manuseio na expedição</li>
          </ul>
        </section>

        {/* 3. Acesso */}
        <section>
          <h3 className="text-lg font-bold mb-3" style={{ color: theme.text }}>3. ACESSO</h3>
          <p className="text-sm font-semibold" style={{ color: theme.text }}>
            Menu: <span className="text-blue-600">Armazém → Etiquetas Mãe</span>
          </p>
        </section>

        {/* 4. Criar Etiqueta Mãe */}
        <section>
          <h3 className="text-lg font-bold mb-3" style={{ color: theme.text }}>4. CRIAR ETIQUETA MÃE</h3>
          
          <div className="space-y-4">
            <div className="flex gap-3">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">1</div>
              <div className="flex-1">
                <p className="font-semibold text-sm mb-1" style={{ color: theme.text }}>Clique em "Nova Etiqueta"</p>
                <p className="text-xs" style={{ color: theme.textMuted }}>
                  Preencha: <strong>Cliente</strong>, <strong>Cidade de Destino</strong>, <strong>UF</strong>, Observações (opcional)
                </p>
                <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded text-xs">
                  <p className="font-bold text-blue-600">✓ Código gerado automaticamente:</p>
                  <p style={{ color: theme.textMuted }}>Formato: AAAAMMDDHHNN (ano, mês, dia, hora, minuto)</p>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">2</div>
              <div className="flex-1">
                <p className="font-semibold text-sm mb-1" style={{ color: theme.text }}>Imprimir Etiqueta (Opcional)</p>
                <p className="text-xs" style={{ color: theme.textMuted }}>
                  Sistema pergunta se deseja imprimir. A etiqueta contém: código, cliente, destino, QR Code.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 5. Unitizar Volumes */}
        <section>
          <h3 className="text-lg font-bold mb-3" style={{ color: theme.text }}>5. UNITIZAR VOLUMES</h3>
          
          <div className="space-y-4">
            <div className="flex gap-3">
              <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">1</div>
              <div className="flex-1">
                <p className="font-semibold text-sm mb-1" style={{ color: theme.text }}>Abrir Unitização</p>
                <p className="text-xs" style={{ color: theme.textMuted }}>
                  Clique em <strong>"Unitizar"</strong> na etiqueta mãe. Ou escaneie o QR Code da etiqueta mãe com a câmera.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">2</div>
              <div className="flex-1">
                <p className="font-semibold text-sm mb-1" style={{ color: theme.text }}>Adicionar Volumes</p>
                <p className="text-xs mb-2" style={{ color: theme.textMuted }}>
                  <strong>Métodos de leitura:</strong>
                </p>
                <ul className="text-xs space-y-1 ml-4 list-disc" style={{ color: theme.textMuted }}>
                  <li><strong>Scanner:</strong> Bipe volume individual no campo de busca (processa automaticamente ao pressionar Enter)</li>
                  <li><strong>Câmera:</strong> Clique em "CÂMERA" e escaneie QR Code do volume</li>
                  <li><strong>Chave NF-e:</strong> Bipe a chave de 44 dígitos para adicionar TODOS os volumes da nota de uma vez</li>
                </ul>
                <div className="mt-2 p-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded text-xs">
                  <p className="font-bold text-green-600">✓ Feedback em tempo real:</p>
                  <p style={{ color: theme.textMuted }}>
                    Sistema mostra: volumes adicionados por NF, total consolidado, peso acumulado, m³ total. 
                    Alerta quando NF está completa com todos volumes bipados.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">3</div>
              <div className="flex-1">
                <p className="font-semibold text-sm mb-1" style={{ color: theme.text }}>Revisar e Ajustar (se necessário)</p>
                <ul className="text-xs space-y-1 ml-4 list-disc" style={{ color: theme.textMuted }}>
                  <li><strong>Desvincular volume:</strong> Clique no ícone de lixeira ao lado do volume</li>
                  <li><strong>Visualizar agrupamento:</strong> Sistema mostra resumo por NF, alertando se há volumes faltantes</li>
                </ul>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">✓</div>
              <div className="flex-1">
                <p className="font-semibold text-sm mb-1 text-green-600">Finalizar Unitização</p>
                <p className="text-xs mb-2" style={{ color: theme.textMuted }}>
                  Clique em <strong>"FINALIZAR"</strong>. O sistema:
                </p>
                <ul className="text-xs space-y-1 ml-4 list-disc" style={{ color: theme.textMuted }}>
                  <li>Altera status da etiqueta para "Finalizada"</li>
                  <li>Registra data/hora e usuário responsável</li>
                  <li>Bloqueia edição (para reabrir, usar botão "Reabrir para Edição")</li>
                  <li>Mantém histórico completo de todas as ações</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* 6. Recursos Avançados */}
        <section>
          <h3 className="text-lg font-bold mb-3" style={{ color: theme.text }}>6. RECURSOS AVANÇADOS</h3>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <Card style={{ backgroundColor: isDark ? '#0f172a' : '#f9fafb', borderColor: theme.cardBorder }}>
              <CardContent className="p-3">
                <p className="font-semibold mb-2" style={{ color: theme.text }}>Scanner de Câmera:</p>
                <ul className="space-y-1 list-disc ml-4" style={{ color: theme.textMuted }}>
                  <li>Escaneia QR Code ou código de barras</li>
                  <li>Feedback visual (verde/vermelho) conforme resultado</li>
                  <li>Previne duplicação com cooldown de 3 segundos</li>
                  <li>Processa automaticamente sem clicar botão</li>
                </ul>
              </CardContent>
            </Card>
            <Card style={{ backgroundColor: isDark ? '#0f172a' : '#f9fafb', borderColor: theme.cardBorder }}>
              <CardContent className="p-3">
                <p className="font-semibold mb-2" style={{ color: theme.text }}>Histórico de Alterações:</p>
                <ul className="space-y-1 list-disc ml-4" style={{ color: theme.textMuted }}>
                  <li>Aba "Histórico" mostra todas as ações</li>
                  <li>Registra: criação, adição/remoção de volumes, edições</li>
                  <li>Exibe usuário e timestamp de cada operação</li>
                  <li>Rastreabilidade total conforme ISO 9001</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* 7. Status e Ações */}
        <section>
          <h3 className="text-lg font-bold mb-3" style={{ color: theme.text }}>7. STATUS DA ETIQUETA MÃE</h3>
          <table className="w-full text-xs border" style={{ borderColor: theme.cardBorder }}>
            <tbody>
              <tr>
                <td className="border p-2 font-bold" style={{ borderColor: theme.cardBorder, color: theme.text }}>Criada</td>
                <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>
                  Etiqueta criada, sem volumes vinculados
                </td>
              </tr>
              <tr>
                <td className="border p-2 font-bold text-blue-600" style={{ borderColor: theme.cardBorder }}>Em Unitização</td>
                <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>
                  Volumes sendo adicionados, pode editar
                </td>
              </tr>
              <tr>
                <td className="border p-2 font-bold text-green-600" style={{ borderColor: theme.cardBorder }}>Finalizada</td>
                <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>
                  Unitização concluída, bloqueada para edição. Pode reabrir se necessário.
                </td>
              </tr>
              <tr>
                <td className="border p-2 font-bold text-purple-600" style={{ borderColor: theme.cardBorder }}>Carregada</td>
                <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>
                  Volumes carregados no veículo e em trânsito
                </td>
              </tr>
              <tr>
                <td className="border p-2 font-bold text-red-600" style={{ borderColor: theme.cardBorder }}>Cancelada</td>
                <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>
                  Etiqueta cancelada (histórico mantido, volumes liberados)
                </td>
              </tr>
            </tbody>
          </table>
        </section>

        {/* Rodapé */}
        <div className="border-t pt-4 mt-8 text-xs text-center" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>
          <p>Documento controlado eletronicamente - Versão impressa é cópia não controlada</p>
        </div>
      </CardContent>
    </Card>
  );
}

// IT-ARM-005: Carregamento (Conferência e Endereçamento)
export function InstrucaoCarregamento({ theme, isDark }) {
  return (
    <Card style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}>
      <CardContent className="p-8 space-y-6">
        {/* Cabeçalho */}
        <div className="border-b pb-6" style={{ borderColor: theme.cardBorder }}>
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h1 className="text-2xl font-bold mb-2" style={{ color: theme.text }}>
                INSTRUÇÃO DE TRABALHO
              </h1>
              <h2 className="text-xl font-semibold mb-1" style={{ color: theme.text }}>
                Carregamento - Conferência e Endereçamento
              </h2>
            </div>
            <div className="text-right text-sm" style={{ color: theme.textMuted }}>
              <p className="font-bold">Código: IT-ARM-005</p>
              <p>Revisão: 01</p>
              <p>Data: 27/01/2026</p>
              <p>Páginas: 1/3</p>
            </div>
          </div>
        </div>

        {/* 1. Objetivo */}
        <section>
          <h3 className="text-lg font-bold mb-3" style={{ color: theme.text }}>1. OBJETIVO</h3>
          <p className="text-sm" style={{ color: theme.textMuted }}>
            Padronizar o processo de conferência de volumes e endereçamento no veículo, 
            garantindo que a carga correta seja carregada na posição adequada para otimizar 
            a entrega e segurança do transporte.
          </p>
        </section>

        {/* 2. Acesso */}
        <section>
          <h3 className="text-lg font-bold mb-3" style={{ color: theme.text }}>2. ACESSO</h3>
          <p className="text-sm font-semibold" style={{ color: theme.text }}>
            Menu: <span className="text-blue-600">Armazém → Carregamento</span>
          </p>
          <p className="text-xs mt-2" style={{ color: theme.textMuted }}>
            Selecione a <strong>Ordem de Carregamento</strong> e clique em <strong>"Carregar"</strong>
          </p>
        </section>

        {/* 3. FASE A: Conferência de Volumes */}
        <section>
          <h3 className="text-lg font-bold mb-3" style={{ color: theme.text }}>
            3. FASE A: CONFERÊNCIA DE VOLUMES
          </h3>
          
          <div className="space-y-4">
            <div className="flex gap-3">
              <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">1</div>
              <div className="flex-1">
                <p className="font-semibold text-sm mb-1" style={{ color: theme.text }}>Vincular Notas Fiscais</p>
                <p className="text-xs mb-2" style={{ color: theme.textMuted }}>
                  Caso a ordem ainda não tenha notas vinculadas:
                </p>
                <ul className="text-xs space-y-1 ml-4 list-disc" style={{ color: theme.textMuted }}>
                  <li><strong>Buscar na Base:</strong> Marque "Base" e busque por número da NF</li>
                  <li><strong>Importar Nova:</strong> Desmarque "Base" e bipe/cole chave de 44 dígitos</li>
                  <li><strong>Scanner de Câmera:</strong> Escaneie código de barras da NF-e</li>
                </ul>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">2</div>
              <div className="flex-1">
                <p className="font-semibold text-sm mb-1" style={{ color: theme.text }}>Conferir Volumes (Tab "Volumes")</p>
                <p className="text-xs mb-2" style={{ color: theme.textMuted }}>
                  <strong>Campo de Busca:</strong> Digite ou bipe o identificador do volume
                </p>
                <p className="text-xs mb-2" style={{ color: theme.textMuted }}>
                  <strong>Scanner de Câmera:</strong> Clique em "📷 Escanear QR Code" para bipar volumes
                </p>
                <div className="mt-2 p-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded text-xs">
                  <p className="font-bold text-green-600">✓ Sistema valida automaticamente:</p>
                  <p style={{ color: theme.textMuted }}>
                    • Volume existe no banco<br/>
                    • Pertence a uma nota vinculada à ordem<br/>
                    • Não foi bipado anteriormente (previne duplicação)<br/>
                    • Feedback sonoro: bipe de sucesso (✓) ou erro (✗)
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">3</div>
              <div className="flex-1">
                <p className="font-semibold text-sm mb-1" style={{ color: theme.text }}>Acompanhar Progresso</p>
                <p className="text-xs" style={{ color: theme.textMuted }}>
                  A barra de progresso mostra: <strong>X/Y volumes conferidos</strong>. 
                  Continue bipando até atingir 100% de conferência.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">4</div>
              <div className="flex-1">
                <p className="font-semibold text-sm mb-1" style={{ color: theme.text }}>Salvar Progresso</p>
                <p className="text-xs" style={{ color: theme.textMuted }}>
                  Clique em <strong>"Salvar Progresso"</strong> para guardar trabalho. 
                  Você pode fechar e continuar depois (rascunho salvo automaticamente).
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 4. FASE B: Endereçamento no Veículo */}
        <section className="print-page-break">
          <h3 className="text-lg font-bold mb-3" style={{ color: theme.text }}>
            4. FASE B: ENDEREÇAMENTO NO VEÍCULO
          </h3>
          
          <div className="space-y-4">
            <div className="flex gap-3">
              <div className="w-8 h-8 bg-orange-600 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">1</div>
              <div className="flex-1">
                <p className="font-semibold text-sm mb-1" style={{ color: theme.text }}>Configurar Layout do Veículo</p>
                <p className="text-xs mb-2" style={{ color: theme.textMuted }}>
                  Sistema detecta automaticamente o tipo de veículo da ordem. Ajuste se necessário:
                </p>
                <ul className="text-xs space-y-1 ml-4 list-disc" style={{ color: theme.textMuted }}>
                  <li><strong>CARRETA:</strong> 6 linhas × 3 colunas (Esquerda, Centro, Direita)</li>
                  <li><strong>TRUCK:</strong> 4 linhas × 2 colunas</li>
                  <li><strong>BITREM:</strong> 8 linhas × 3 colunas</li>
                  <li><strong>Customizado:</strong> Defina número de linhas manualmente</li>
                </ul>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="w-8 h-8 bg-orange-600 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">2</div>
              <div className="flex-1">
                <p className="font-semibold text-sm mb-1" style={{ color: theme.text }}>Alocar Volumes nas Células</p>
                <p className="text-xs mb-2" style={{ color: theme.textMuted }}>
                  <strong>Métodos de alocação:</strong>
                </p>
                <ul className="text-xs space-y-2 ml-4 list-disc" style={{ color: theme.textMuted }}>
                  <li>
                    <strong>Arrastar e Soltar:</strong> Arraste a nota fiscal da sidebar para a célula desejada (ex: A1)
                  </li>
                  <li>
                    <strong>Selecionar e Clicar:</strong> Marque checkbox dos volumes, clique na célula
                  </li>
                  <li>
                    <strong>Scanner na Célula:</strong> Clique na célula, depois escaneie volumes com câmera ou scanner manual
                  </li>
                </ul>
                <div className="mt-2 p-2 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded text-xs">
                  <p className="font-bold text-orange-600">⚡ Atualização em tempo real:</p>
                  <p style={{ color: theme.textMuted }}>
                    A célula mostra resumo por NF: "NF 12345 FORNECEDOR 3" (3 volumes daquela nota na posição)
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="w-8 h-8 bg-orange-600 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">3</div>
              <div className="flex-1">
                <p className="font-semibold text-sm mb-1" style={{ color: theme.text }}>Reorganizar (se necessário)</p>
                <ul className="text-xs space-y-1 ml-4 list-disc" style={{ color: theme.textMuted }}>
                  <li><strong>Mover nota completa:</strong> Arraste a nota de uma célula para outra</li>
                  <li><strong>Mover volume individual:</strong> Expanda a nota (clique nela), arraste o volume</li>
                  <li><strong>Remover da célula:</strong> Clique no ícone de lixeira ao lado da nota</li>
                </ul>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">✓</div>
              <div className="flex-1">
                <p className="font-semibold text-sm mb-1 text-green-600">Finalizar Carregamento</p>
                <ol className="text-xs space-y-1 ml-4 list-decimal" style={{ color: theme.textMuted }}>
                  <li>Revisar layout completo (Tab "Layout")</li>
                  <li>Clique em <strong>"Finalizar"</strong></li>
                  <li>Preencha <strong>Data/Hora Início</strong> e <strong>Fim</strong> do carregamento</li>
                  <li>Confirme - Sistema atualiza ordem e libera para viagem</li>
                </ol>
              </div>
            </div>
          </div>
        </section>

        {/* 5. Recursos e Impressões */}
        <section>
          <h3 className="text-lg font-bold mb-3" style={{ color: theme.text }}>5. IMPRESSÕES E RELATÓRIOS</h3>
          <table className="w-full text-xs border" style={{ borderColor: theme.cardBorder }}>
            <tbody>
              <tr>
                <td className="border p-2 font-bold w-40" style={{ borderColor: theme.cardBorder, color: theme.text }}>Layout Resumido</td>
                <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>
                  Mapa visual do carregamento, mostra notas por célula (ideal para motorista)
                </td>
              </tr>
              <tr>
                <td className="border p-2 font-bold" style={{ borderColor: theme.cardBorder, color: theme.text }}>Layout Detalhado</td>
                <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>
                  Lista todos os volumes individualmente por célula (para auditoria)
                </td>
              </tr>
              <tr>
                <td className="border p-2 font-bold" style={{ borderColor: theme.cardBorder, color: theme.text }}>Lista de Notas</td>
                <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>
                  Tabela com todas as notas, peso, volumes, valor, chaves
                </td>
              </tr>
              <tr>
                <td className="border p-2 font-bold" style={{ borderColor: theme.cardBorder, color: theme.text }}>Arquivo TXT Chaves</td>
                <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>
                  Arquivo de texto com chaves de 44 dígitos para validação fiscal
                </td>
              </tr>
            </tbody>
          </table>
        </section>

        {/* 6. Boas Práticas */}
        <section>
          <h3 className="text-lg font-bold mb-3" style={{ color: theme.text }}>6. BOAS PRÁTICAS DE CARREGAMENTO</h3>
          <ul className="text-sm space-y-1 ml-4 list-disc" style={{ color: theme.textMuted }}>
            <li>Volumes pesados na base (linhas iniciais)</li>
            <li>Volumes frágeis no topo e carregados por último</li>
            <li>Primeira entrega nas posições de fácil acesso (próximas à porta)</li>
            <li>Distribuir peso uniformemente entre eixos</li>
            <li>Agrupar volumes da mesma NF quando possível</li>
            <li>Utilizar checkbox "Apenas Notas Vinculadas" para evitar carregar volume errado</li>
          </ul>
        </section>

        {/* Rodapé */}
        <div className="border-t pt-4 mt-8 text-xs text-center" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>
          <p>Documento controlado eletronicamente - Versão impressa é cópia não controlada</p>
        </div>
      </CardContent>
    </Card>
  );
}

// IT-ARM-006: Ordem de Entrega
export function InstrucaoOrdemEntrega({ theme, isDark }) {
  return (
    <Card style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}>
      <CardContent className="p-8 space-y-6">
        {/* Cabeçalho */}
        <div className="border-b pb-6" style={{ borderColor: theme.cardBorder }}>
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h1 className="text-2xl font-bold mb-2" style={{ color: theme.text }}>
                INSTRUÇÃO DE TRABALHO
              </h1>
              <h2 className="text-xl font-semibold mb-1" style={{ color: theme.text }}>
                Ordem de Entrega (Last Mile)
              </h2>
            </div>
            <div className="text-right text-sm" style={{ color: theme.textMuted }}>
              <p className="font-bold">Código: IT-ARM-006</p>
              <p>Revisão: 01</p>
              <p>Data: 27/01/2026</p>
              <p>Páginas: 1/2</p>
            </div>
          </div>
        </div>

        {/* 1. Objetivo */}
        <section>
          <h3 className="text-lg font-bold mb-3" style={{ color: theme.text }}>1. OBJETIVO</h3>
          <p className="text-sm" style={{ color: theme.textMuted }}>
            Padronizar o processo de criação e gestão de ordens de entrega (last mile), 
            otimizando rotas e garantindo rastreabilidade das entregas fracionadas.
          </p>
        </section>

        {/* 2. Quando Usar */}
        <section>
          <h3 className="text-lg font-bold mb-3" style={{ color: theme.text }}>2. QUANDO USAR</h3>
          <ul className="text-sm space-y-1 ml-4 list-disc" style={{ color: theme.textMuted }}>
            <li>Entregas fracionadas (múltiplos destinatários em uma rota)</li>
            <li>Last mile urbano (distribuição final ao cliente)</li>
            <li>Entregas agendadas com horário específico</li>
            <li>Rotas com múltiplas paradas</li>
          </ul>
        </section>

        {/* 3. Acesso */}
        <section>
          <h3 className="text-lg font-bold mb-3" style={{ color: theme.text }}>3. ACESSO</h3>
          <p className="text-sm font-semibold" style={{ color: theme.text }}>
            Menu: <span className="text-blue-600">Armazém → Ordem de Entrega</span>
          </p>
        </section>

        {/* 4. Criar Ordem de Entrega */}
        <section>
          <h3 className="text-lg font-bold mb-3" style={{ color: theme.text }}>4. CRIAR ORDEM DE ENTREGA</h3>
          
          <div className="space-y-4">
            <div className="flex gap-3">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">1</div>
              <div className="flex-1">
                <p className="font-semibold text-sm mb-1" style={{ color: theme.text }}>Selecionar Notas para Entrega</p>
                <p className="text-xs mb-2" style={{ color: theme.textMuted }}>
                  Marque as <strong>notas fiscais</strong> que serão entregues nesta rota. 
                  Sistema agrupa automaticamente por região/cidade.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">2</div>
              <div className="flex-1">
                <p className="font-semibold text-sm mb-1" style={{ color: theme.text }}>Conferir Volumes</p>
                <p className="text-xs" style={{ color: theme.textMuted }}>
                  Bipe cada volume que será carregado no veículo de entrega. 
                  Sistema valida e marca como "separado para entrega".
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">3</div>
              <div className="flex-1">
                <p className="font-semibold text-sm mb-1" style={{ color: theme.text }}>Definir Sequência de Paradas</p>
                <p className="text-xs" style={{ color: theme.textMuted }}>
                  Arraste as notas para ordenar a sequência de entregas (primeira parada no topo). 
                  Sistema considera: distância, horário agendado, prioridade.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">4</div>
              <div className="flex-1">
                <p className="font-semibold text-sm mb-1" style={{ color: theme.text }}>Alocar Motorista e Veículo</p>
                <p className="text-xs" style={{ color: theme.textMuted }}>
                  Selecione o <strong>motorista</strong> e <strong>veículo</strong> (VAN, FIORINO, etc.) 
                  para esta rota de entrega.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">✓</div>
              <div className="flex-1">
                <p className="font-semibold text-sm mb-1 text-green-600">Gerar Romaneio e Liberar</p>
                <p className="text-xs" style={{ color: theme.textMuted }}>
                  Clique em <strong>"Gerar Romaneio"</strong>. Sistema imprime documento com: 
                  sequência de entregas, endereços completos, volumes por parada, orientações.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 5. Acompanhamento via App */}
        <section>
          <h3 className="text-lg font-bold mb-3" style={{ color: theme.text }}>5. ACOMPANHAMENTO PELO MOTORISTA</h3>
          <div className="text-xs space-y-2" style={{ color: theme.textMuted }}>
            <p><strong>Via App Motorista:</strong></p>
            <ul className="list-disc ml-6 space-y-1">
              <li>Visualiza lista de entregas em sequência</li>
              <li>Navega para cada endereço (botão "Rota")</li>
              <li>Ao chegar, atualiza status "Iniciando Entrega"</li>
              <li>Coleta assinatura ou foto do comprovante</li>
              <li>Marca como "Entregue" com timestamp automático</li>
              <li>Sistema notifica central em tempo real</li>
            </ul>
          </div>
        </section>

        {/* Rodapé */}
        <div className="border-t pt-4 mt-8 text-xs text-center" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>
          <p>Documento controlado eletronicamente - Versão impressa é cópia não controlada</p>
        </div>
      </CardContent>
    </Card>
  );
}