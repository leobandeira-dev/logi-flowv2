import React from "react";
import { Truck, User, CheckCircle } from "lucide-react";

export function InstrucaoFilaX({ theme, isDark }) {
  return (
    <div className="space-y-0">
      {/* Cabeçalho Padrão TranSul */}
      <div className="border-2 border-black">
        <table className="w-full">
          <tbody>
            <tr>
              <td className="border-r-2 border-black p-4 w-32 align-middle">
                <div className="flex items-center justify-center">
                  <Truck className="w-16 h-16 text-blue-700" />
                </div>
              </td>
              <td className="border-r-2 border-black p-2 text-center align-middle">
                <p className="font-bold text-sm">PROCEDIMENTO OPERACIONAL PADRÃO</p>
              </td>
              <td className="p-2 text-center align-middle w-40">
                <p className="font-bold text-sm">N° IT-LOG-004</p>
              </td>
            </tr>
            <tr>
              <td colSpan="3" className="border-t-2 border-black p-3 text-center">
                <h2 className="text-lg font-bold">GESTÃO DA FILA X DE VEÍCULOS</h2>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Tabela de Revisões */}
      <div className="border-2 border-t-0 border-black">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-gray-100">
              <th colSpan="4" className="border-b border-black p-2 text-center font-bold">
                ÍNDICE DE REVISÕES
              </th>
            </tr>
            <tr className="bg-white">
              <th className="border-r border-b border-black p-2 w-16 text-center font-bold">REV.</th>
              <th className="border-r border-b border-black p-2 text-left font-bold">DESCRIÇÃO E/OU FOLHAS ATINGIDAS</th>
              <th className="border-r border-b border-black p-2 w-32 text-center font-bold">REVISANDO POR:</th>
              <th className="border-b border-black p-2 w-24 text-center font-bold">DATA</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border-r border-b border-black p-2 text-center font-bold">00</td>
              <td className="border-r border-b border-black p-2">Emissão Inicial</td>
              <td className="border-r border-b border-black p-2 text-center">Gestão Qualidade</td>
              <td className="border-b border-black p-2 text-center">14/01/2026</td>
            </tr>
            <tr>
              <td className="border-r border-black p-2 text-center font-bold">01</td>
              <td className="border-r border-black p-2"></td>
              <td className="border-r border-black p-2 text-center"></td>
              <td className="border-black p-2 text-center"></td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Aprovações */}
      <div className="border-2 border-t-0 border-black">
        <table className="w-full text-xs">
          <tbody>
            <tr>
              <td className="border-r border-black p-3 w-1/3 text-center align-top">
                <p className="font-bold mb-1">ELABORADO</p>
                <p className="font-semibold mb-1">GESTÃO DE QUALIDADE</p>
                <p className="mb-8">Coord. de Qualidade</p>
                <p className="font-semibold">DATA: 14/01/2026</p>
              </td>
              <td className="border-r border-black p-3 w-1/3 text-center align-top">
                <p className="font-bold mb-1">VERIFICADO</p>
                <p className="font-semibold mb-1">COORDENAÇÃO OPERACIONAL</p>
                <p className="mb-8">Coord. de Operações</p>
                <p className="font-semibold">DATA: 14/01/2026</p>
              </td>
              <td className="p-3 w-1/3 text-center align-top">
                <p className="font-bold mb-1">APROVADO</p>
                <p className="font-semibold mb-1">DIRETOR DE OPERAÇÕES</p>
                <p className="mb-8">Supervisor Logística</p>
                <p className="font-semibold">DATA: 14/01/2026</p>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Rodapé da primeira página */}
      <div className="border-2 border-t-0 border-black p-2 text-right">
        <p className="text-xs font-semibold">Rev. 00</p>
        <p className="text-xs font-semibold">Folha 1 de 15</p>
      </div>

      {/* Quebra de página */}
      <div className="print-page-break mt-8"></div>

      {/* Cabeçalho páginas seguintes */}
      <div className="border-2 border-black mb-4">
        <table className="w-full">
          <tbody>
            <tr>
              <td className="border-r-2 border-black p-2 w-32 align-middle text-center">
                <Truck className="w-12 h-12 text-blue-700 mx-auto" />
              </td>
              <td className="border-r-2 border-black p-2 text-center align-middle">
                <p className="font-bold text-sm">PROCEDIMENTO OPERACIONAL PADRÃO</p>
              </td>
              <td className="p-2 text-center align-middle w-40">
                <p className="font-bold text-sm">N° IT-LOG-004</p>
              </td>
            </tr>
            <tr>
              <td colSpan="2" className="border-t-2 border-r-2 border-black p-2 text-center">
                <h2 className="text-base font-bold">GESTÃO DA FILA X DE VEÍCULOS</h2>
              </td>
              <td className="border-t-2 border-black p-2 text-center">
                <p className="text-xs font-semibold">Rev. 00</p>
                <p className="text-xs font-semibold">Folha 2 de 15</p>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Sumário */}
      <div className="mb-6 px-8">
        <h3 className="text-center text-lg font-bold mb-4">Sumário</h3>
        <div className="space-y-1 text-sm">
          <p>1. OBJETIVO ............................................................................................................................................................ 3</p>
          <p>2. APLICAÇÃO.......................................................................................................................................................... 3</p>
          <p>3. DEFINIÇÕES......................................................................................................................................................... 3</p>
          <p>4. ATRIBUIÇÕES E RESPONSABILIDADES.......................................................................................................... 4</p>
          <p>5. PROCEDIMENTO - CHECK-IN NA FILA (Motorista)......................................................................................... 4</p>
          <p>6. PROCEDIMENTO - GESTÃO DA FILA (Operador/Coordenador)..................................................................... 6</p>
          <p>7. REGRAS DE NEGÓCIO E VALIDAÇÕES.......................................................................................................... 7</p>
          <p>8. CONFIGURAÇÕES.............................................................................................................................................. 8</p>
          <p>9. BOAS PRÁTICAS................................................................................................................................................ 9</p>
          <p>10. INDICADORES DE DESEMPENHO................................................................................................................ 10</p>
          <p>11. FLUXOGRAMA DO PROCESSO..................................................................................................................... 11</p>
          <p>12. SISTEMA DE AJUDA INTEGRADO................................................................................................................ 11</p>
          <p>13. DOCUMENTOS RELACIONADOS................................................................................................................... 12</p>
          <p>14. ANEXOS........................................................................................................................................................... 12</p>
        </div>
      </div>

      {/* Quebra de página */}
      <div className="print-page-break"></div>

      {/* Cabeçalho página 3 */}
      <div className="border-2 border-black mb-4">
        <table className="w-full">
          <tbody>
            <tr>
              <td className="border-r-2 border-black p-2 w-32 align-middle text-center">
                <Truck className="w-12 h-12 text-blue-700 mx-auto" />
              </td>
              <td className="border-r-2 border-black p-2 text-center align-middle">
                <p className="font-bold text-sm">PROCEDIMENTO OPERACIONAL PADRÃO</p>
              </td>
              <td className="p-2 text-center align-middle w-40">
                <p className="font-bold text-sm">N° IT-LOG-004</p>
              </td>
            </tr>
            <tr>
              <td colSpan="2" className="border-t-2 border-r-2 border-black p-2 text-center">
                <h2 className="text-base font-bold">GESTÃO DA FILA X DE VEÍCULOS</h2>
              </td>
              <td className="border-t-2 border-black p-2 text-center">
                <p className="text-xs font-semibold">Rev. 00</p>
                <p className="text-xs font-semibold">Folha 3 de 15</p>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Conteúdo */}
      <div className="px-8 space-y-6">

        {/* 1. Objetivo */}
        <section>
          <h3 className="text-base font-bold mb-3">1. OBJETIVO</h3>
          <p className="text-sm leading-relaxed text-justify">
            Estabelecer os critérios e procedimentos para gestão da fila de veículos disponíveis para carregamento, 
            garantindo organização, priorização adequada, rastreabilidade das marcações e eficiência na alocação 
            de recursos conforme disponibilidade e tipo de carga.
          </p>
        </section>

        {/* 2. Aplicação */}
        <section>
          <h3 className="text-base font-bold mb-3">2. APLICAÇÃO</h3>
          <p className="text-sm leading-relaxed text-justify mb-2">
            Esta instrução de trabalho aplica-se a:
          </p>
          <ul className="text-sm space-y-1 ml-6">
            <li>• Coordenadores de expedição responsáveis pela gestão da fila</li>
            <li>• Operadores logísticos que fazem alocação de veículos</li>
            <li>• Motoristas que utilizam o app externo para check-in na fila</li>
            <li>• Gestores que monitoram a disponibilidade de recursos</li>
          </ul>
        </section>

        {/* 3. Definições */}
        <section>
          <h3 className="text-base font-bold mb-3">3. DEFINIÇÕES</h3>
          <div className="space-y-3 text-sm">
            <div>
              <p className="font-bold">3.1 Fila X:</p>
              <p className="text-justify">
                Sistema de gerenciamento de veículos disponíveis aguardando alocação para cargas. 
                Organiza motoristas por ordem de chegada (FIFO - First In, First Out) e tipo de veículo.
              </p>
            </div>
            <div>
              <p className="font-bold">3.2 Marcação de Placa:</p>
              <p className="text-justify">
                Registro de entrada de veículo na fila, contendo dados do motorista, veículo, 
                tipo de operação e localização atual.
              </p>
            </div>
            <div>
              <p className="font-bold">3.3 Senha de Fila:</p>
              <p className="text-justify">
                Código alfanumérico único de 4 caracteres gerado automaticamente pelo sistema 
                para identificação do veículo na fila e vinculação posterior com ordem de carregamento.
              </p>
            </div>
            <div>
              <p className="font-bold">3.4 Status da Fila:</p>
              <p className="text-justify">
                Estados configuráveis que identificam a situação atual do veículo 
                (ex: Aguardando, Em Operação, Indisponível). Status podem ser customizados por empresa.
              </p>
            </div>
            <div>
              <p className="font-bold">3.5 Posição FIFO:</p>
              <p className="text-justify">
                Ordem sequencial calculada automaticamente baseada na data/hora de entrada na fila. 
                Veículos que entraram primeiro têm prioridade na alocação.
              </p>
            </div>
          </div>
        </section>

        {/* 4. Responsabilidades */}
        <section>
          <h3 className="text-base font-bold mb-3">4. ATRIBUIÇÕES E RESPONSABILIDADES</h3>
          <div className="space-y-3 text-sm">
            <div>
              <p className="font-bold">4.1 Motorista</p>
              <p className="text-justify">
                Realizar check-in na fila através do app externo quando veículo estiver vazio, 
                manter dados cadastrais atualizados e aguardar contato para alocação.
              </p>
            </div>
            <div>
              <p className="font-bold">4.2 Coordenador de Expedição</p>
              <p className="text-justify">
                Monitorar a fila em tempo real, alocar veículos conforme disponibilidade e necessidade, 
                gerenciar status e prioridades.
              </p>
            </div>
            <div>
              <p className="font-bold">4.3 Operador Logístico</p>
              <p className="text-justify">
                Vincular senha da fila à ordem de carregamento, atualizar status do veículo 
                conforme avanço da operação.
              </p>
            </div>
            <div>
              <p className="font-bold">4.4 Gestor de Operações</p>
              <p className="text-justify">
                Monitorar tempo médio de espera, taxa de utilização da fila e garantir 
                equilíbrio entre oferta e demanda de veículos.
              </p>
            </div>
          </div>
        </section>

        {/* 5. Procedimento - Check-in do Motorista */}
        <section>
          <h3 className="text-base font-bold mb-3">5. DESCRIÇÃO TÉCNICA</h3>
          <h4 className="text-sm font-bold mb-3">5.1 Procedimento de Check-in na Fila (Motorista)</h4>

          <div className="space-y-3">
            <div>
              <p className="font-bold text-sm mb-1">Passo 1 - Acessar Link da Fila</p>
              <p className="text-sm text-justify">
                Acesse o link fornecido pela transportadora (ex: logiflow.com.br/FilaMotorista?codigo=XXXX). 
                O link contém código de acesso único da empresa para segurança.
              </p>
            </div>

            <div>
              <p className="font-bold text-sm mb-1">Passo 2 - Informar Telefone Celular</p>
              <p className="text-sm text-justify mb-2">
                Digite seu número de celular com DDD (11 dígitos). O sistema verifica automaticamente 
                se você já possui cadastro e preenche dados automaticamente.
              </p>
              <div className="bg-gray-100 border border-gray-300 rounded p-2">
                <p className="text-xs">
                  <strong>Nota:</strong> Se cadastrado, dados serão carregados automaticamente (nome, placa, tipo de veículo)
                </p>
              </div>
            </div>

            <div>
              <p className="font-bold text-sm mb-1">Passo 3 - Preencher Dados Obrigatórios</p>
              <p className="text-sm text-justify mb-2">
                Sistema apresenta wizard em 4 etapas:
              </p>
              <ul className="text-sm space-y-1 ml-6">
                <li>• <strong>Etapa 1:</strong> Nome completo do motorista</li>
                <li>• <strong>Etapa 2:</strong> Placa do cavalo (7 caracteres alfanuméricos)</li>
                <li>• <strong>Etapa 3:</strong> Tipo do motorista (Frota/Acionista/Terceiro), Tipo de veículo e Tipo de carroceria</li>
                <li>• <strong>Etapa 4:</strong> Upload de comprovante de descarga (foto validada por IA)</li>
                <li>• <strong>Etapa 5:</strong> Localização atual (obtida via GPS do celular)</li>
              </ul>
            </div>

            <div>
              <p className="font-bold text-sm mb-1">Passo 4 - Validação de Comprovante por IA</p>
              <p className="text-sm text-justify mb-2">
                O sistema utiliza inteligência artificial para validar o comprovante de descarga:
              </p>
              <ul className="text-sm space-y-1 ml-6">
                <li>• Verifica se a imagem está legível</li>
                <li>• Identifica se contém uma data visível</li>
                <li>• Confirma se é um comprovante de descarga válido</li>
                <li>• Se inválido, solicita nova foto</li>
              </ul>
            </div>

            <div>
              <p className="font-bold text-sm mb-1">Passo 5 - Confirmação de Check-in</p>
              <p className="text-sm text-justify mb-2">
                Sistema gera automaticamente:
              </p>
              <ul className="text-sm space-y-1 ml-6">
                <li>• <strong>Senha única</strong> de 4 caracteres alfanuméricos</li>
                <li>• <strong>Posição na fila</strong> calculada automaticamente (FIFO)</li>
                <li>• <strong>Timestamp</strong> de entrada</li>
                <li>• <strong>Status inicial:</strong> "Aguardando"</li>
              </ul>
              <div className="bg-gray-100 border border-gray-300 rounded p-2 mt-2">
                <p className="text-xs">
                  <strong>Nota:</strong> O motorista visualiza sua posição, senha e tempo de espera em tempo real.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 6. Procedimento - Gestão da Fila (Operador) */}
        <section>
          <h4 className="text-sm font-bold mb-3">5.2 Procedimento de Gestão da Fila (Operador/Coordenador)</h4>

          <div className="space-y-3">
            <div>
              <p className="font-bold text-sm mb-1">Etapa 1 - Acessar Módulo Fila X</p>
              <p className="text-sm text-justify">
                Navegue até: <strong>Operações → Fila X</strong>
              </p>
            </div>

            <div>
              <p className="font-bold text-sm mb-1">Etapa 2 - Visualizações Disponíveis</p>
              <div className="text-sm space-y-1 ml-4">
                <p>• <strong>Tabela:</strong> Lista completa com filtros por status, tipo de fila, período</p>
                <p>• <strong>Kanban:</strong> Cards organizados por status (Aguardando, Em Operação, Indisponível) com drag-and-drop</p>
              </div>
            </div>

            <div>
              <p className="font-bold text-sm mb-1">Etapa 3 - Alocar Veículo a uma Ordem</p>
              <p className="text-sm text-justify mb-2">
                Para vincular um veículo da fila a uma ordem de carregamento:
              </p>
              <ol className="text-sm space-y-1 ml-6">
                <li>1. Identifique o veículo disponível compatível com a carga (tipo de veículo, carroceria)</li>
                <li>2. Copie a <strong>senha da fila</strong> (4 caracteres exibidos no card)</li>
                <li>3. Acesse a ordem de carregamento que receberá o veículo</li>
                <li>4. Cole a senha no campo "Senha Fila"</li>
                <li>5. Sistema vincula automaticamente motorista e veículo à ordem</li>
                <li>6. Status do veículo na fila é atualizado conforme configuração</li>
              </ol>
            </div>

            <div>
              <p className="font-bold text-sm mb-1">Etapa 4 - Gerenciar Status dos Veículos</p>
              <p className="text-sm text-justify mb-1">
                <strong>Via Drag-and-Drop (Kanban):</strong> Arraste o card do veículo para a coluna do novo status.
              </p>
              <p className="text-sm text-justify mb-2">
                <strong>Via Menu de Ações:</strong> Clique nos 3 pontos e selecione o novo status.
              </p>
              <div className="bg-gray-100 border border-gray-300 rounded p-2">
                <p className="text-xs">
                  <strong>Importante:</strong> Status que têm a flag "remove_da_fila = true" marcam data de saída automaticamente 
                  e removem o veículo da contagem ativa.
                </p>
              </div>
            </div>

            <div>
              <p className="font-bold text-sm mb-1">Etapa 5 - Recálculo Automático de Posições</p>
              <p className="text-sm text-justify mb-2">
                O sistema recalcula automaticamente as posições FIFO sempre que:
              </p>
              <ul className="text-sm space-y-1 ml-6">
                <li>• Um novo veículo entra na fila (check-in)</li>
                <li>• Um veículo sai da fila (alocação ou remoção)</li>
                <li>• Status de um veículo é alterado</li>
              </ul>
              <p className="text-sm mt-2 text-justify">
                Apenas veículos ATIVOS (sem data_saida_fila) são considerados no cálculo.
              </p>
            </div>
          </div>
        </section>

        {/* 7. Regras de Negócio */}
        <section>
          <h3 className="text-base font-bold mb-3">6. REGRAS DE NEGÓCIO E VALIDAÇÕES</h3>
          <div className="space-y-3 text-sm">
            <div>
              <p className="font-bold mb-1">6.1 Validações no Check-in:</p>
              <ul className="ml-6 space-y-1">
                <li>• Telefone deve ter 11 dígitos (DDD + número)</li>
                <li>• Placa deve ter 7 caracteres alfanuméricos</li>
                <li>• Veículo deve estar VAZIO (confirmação obrigatória)</li>
                <li>• Comprovante de descarga é obrigatório e validado por IA</li>
                <li>• Localização GPS deve ser obtida para registro de cidade/UF</li>
                <li>• Não permitir duplicação de telefone ativo na mesma empresa</li>
              </ul>
            </div>
            
            <div>
              <p className="font-bold mb-1">6.2 Geração de Senha:</p>
              <ul className="ml-6 space-y-1">
                <li>• Sistema gera código alfanumérico único de 4 caracteres</li>
                <li>• Verifica unicidade dentro da empresa (máximo 50 tentativas)</li>
                <li>• Fallback: usa timestamp se não conseguir gerar senha única</li>
              </ul>
            </div>

            <div>
              <p className="font-bold mb-1">6.3 Cálculo de Posição FIFO:</p>
              <ul className="ml-6 space-y-1">
                <li>• Posição = (quantidade de veículos ativos na frente) + 1</li>
                <li>• Considera apenas veículos sem data_saida_fila</li>
                <li>• Ordenação por data_entrada_fila (mais antigo primeiro)</li>
                <li>• Recálculo automático após qualquer alteração</li>
              </ul>
            </div>

            <div>
              <p className="font-bold mb-1">6.4 Bloqueio de Veículos Carregados:</p>
              <div className="bg-gray-100 border border-gray-400 rounded p-3 mt-2">
                <p className="text-xs font-bold">
                  ⚠️ REGRA CRÍTICA: Apenas veículos VAZIOS podem fazer check-in na fila.
                </p>
                <p className="text-xs mt-1">
                  Veículos carregados que marcarem placa podem ser bloqueados pelo sistema. 
                  O motorista deve confirmar explicitamente que o veículo está vazio antes de continuar.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 8. Tipos e Status */}
        <section>
          <h3 className="text-base font-bold mb-3">7. CONFIGURAÇÕES</h3>
          
          <div className="mb-4">
            <p className="font-bold text-sm mb-2">7.1 Tipos de Fila Configuráveis</p>
            <p className="text-sm text-justify mb-2">
              Cada empresa pode configurar seus próprios tipos de fila (ex: Frota, Acionista, Agregado, Terceiro).
            </p>
            <div className="bg-gray-50 border border-gray-300 rounded p-3">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="font-bold mb-1">Campos do Tipo:</p>
                  <ul className="ml-4">
                    <li>• Nome (ex: "Frota")</li>
                    <li>• Cor para identificação visual</li>
                    <li>• Ordem de exibição</li>
                    <li>• Status ativo/inativo</li>
                  </ul>
                </div>
                <div>
                  <p className="font-bold mb-1">Configuração:</p>
                  <p>
                    Acesse: <strong>Fila X → Gerenciar Tipos</strong> para criar, editar ou desativar tipos.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mb-4">
            <p className="font-bold text-sm mb-2">7.2 Status da Fila Configuráveis</p>
            <p className="text-sm text-justify mb-2">
              Status personalizados para gerenciar o ciclo de vida do veículo na fila.
            </p>
            <div className="bg-gray-50 border border-gray-300 rounded p-3">
              <div className="text-sm space-y-2">
                <div>
                  <p className="font-bold mb-1">Campos do Status:</p>
                  <ul className="ml-4 space-y-1">
                    <li>• <strong>Nome:</strong> Ex: "Aguardando", "Em Operação", "Indisponível"</li>
                    <li>• <strong>Cor:</strong> Identificação visual em hexadecimal</li>
                    <li>• <strong>Ícone:</strong> Emoji para representação</li>
                    <li>• <strong>Remove da fila:</strong> Se true, marca data de saída automaticamente</li>
                    <li>• <strong>Mover quando vinculado:</strong> Se true, aplica este status ao vincular senha a uma ordem</li>
                    <li>• <strong>Aplicar ao sair:</strong> Se true, status usado quando motorista clica "Sair da Fila" no app</li>
                    <li>• <strong>Ordem de exibição</strong></li>
                  </ul>
                </div>
                <div className="bg-gray-100 border border-gray-400 rounded p-2">
                  <p className="text-xs">
                    <strong>Nota:</strong> Acesse <strong>Fila X → Gerenciar Status</strong> para personalizar.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 9. Boas Práticas */}
        <section>
          <h3 className="text-base font-bold mb-3">8. BOAS PRÁTICAS</h3>
          <div className="space-y-3 text-sm">
            <div>
              <p className="font-bold mb-1">8.1 Para Motoristas:</p>
              <ul className="ml-6 space-y-1">
                <li>• Faça check-in apenas quando o veículo estiver completamente vazio</li>
                <li>• Mantenha seus dados cadastrais atualizados para agilizar futuras marcações</li>
                <li>• Tire foto clara do comprovante de descarga (legível, com data visível)</li>
                <li>• Aguarde contato da central - não ligue perguntando posição</li>
                <li>• Clique "Atualizar" para ver sua posição em tempo real</li>
                <li>• Use o botão "Ajuda" em cada campo se tiver dúvidas</li>
              </ul>
            </div>

            <div>
              <p className="font-bold mb-1">8.2 Para Operadores:</p>
              <ul className="ml-6 space-y-1">
                <li>• Priorize veículos por posição FIFO quando houver múltiplas opções compatíveis</li>
                <li>• Vincule senha da fila à ordem ANTES de comunicar motorista (evita confusão)</li>
                <li>• Atualize status do veículo conforme progresso da operação</li>
                <li>• Use filtros para encontrar rapidamente veículos específicos (tipo, localização)</li>
                <li>• Monitore tempo de espera médio para evitar acúmulo excessivo na fila</li>
                <li>• Archive veículos inativos regularmente para manter fila organizada</li>
              </ul>
            </div>

            <div>
              <p className="font-bold mb-1">8.3 Para Gestores:</p>
              <ul className="ml-6 space-y-1">
                <li>• Configure tipos de fila conforme sua operação (Frota, Acionista, etc.)</li>
                <li>• Personalize status para refletir seu workflow real</li>
                <li>• Monitore tempo médio de permanência na fila (meta: ≤ 4 horas)</li>
                <li>• Analise taxa de utilização (veículos alocados vs total na fila)</li>
                <li>• Compartilhe link de check-in via WhatsApp, SMS ou impresso</li>
                <li>• Configure número de celular de suporte nas Configurações para ajuda aos motoristas</li>
              </ul>
            </div>
          </div>
        </section>

        {/* 10. Indicadores */}
        <section>
          <h3 className="text-base font-bold mb-3">9. INDICADORES DE DESEMPENHO</h3>
          <table className="w-full text-xs border-2 border-black">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-black p-2 text-left font-bold">Indicador</th>
                <th className="border border-black p-2 text-left font-bold">Fórmula/Descrição</th>
                <th className="border border-black p-2 text-center font-bold w-20">Meta</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-black p-2 font-bold">Tempo Médio de Espera</td>
                <td className="border border-black p-2">Média de tempo entre entrada e alocação</td>
                <td className="border border-black p-2 text-center font-bold">≤ 4h</td>
              </tr>
              <tr className="bg-gray-50">
                <td className="border border-black p-2 font-bold">Taxa de Utilização</td>
                <td className="border border-black p-2">(Veículos Alocados / Total na Fila) × 100</td>
                <td className="border border-black p-2 text-center font-bold">≥ 85%</td>
              </tr>
              <tr>
                <td className="border border-black p-2 font-bold">Check-ins Válidos</td>
                <td className="border border-black p-2">% de check-ins aprovados sem bloqueio</td>
                <td className="border border-black p-2 text-center font-bold">≥ 98%</td>
              </tr>
            </tbody>
          </table>
        </section>

        {/* 11. Fluxograma */}
        <section>
          <h3 className="text-base font-bold mb-3">10. FLUXOGRAMA DO PROCESSO</h3>
          <div className="border rounded p-4" style={{ borderColor: theme.cardBorder, backgroundColor: isDark ? '#0f172a' : '#f9fafb' }}>
            <div className="flex items-center justify-center gap-2 text-xs flex-wrap">
              <div className="bg-green-600 text-white px-3 py-2 rounded font-bold">
                Motorista Check-in
              </div>
              <span>→</span>
              <div className="bg-blue-600 text-white px-3 py-2 rounded font-bold">
                Validação IA
              </div>
              <span>→</span>
              <div className="bg-purple-600 text-white px-3 py-2 rounded font-bold">
                Geração Senha
              </div>
              <span>→</span>
              <div className="bg-cyan-600 text-white px-3 py-2 rounded font-bold">
                Fila FIFO
              </div>
              <span>→</span>
              <div className="bg-yellow-600 text-white px-3 py-2 rounded font-bold">
                Operador Aloca
              </div>
              <span>→</span>
              <div className="bg-orange-600 text-white px-3 py-2 rounded font-bold">
                Vincula Ordem
              </div>
              <span>→</span>
              <div className="bg-green-700 text-white px-3 py-2 rounded font-bold">
                Status Atualizado
              </div>
            </div>
          </div>
        </section>

        {/* 12. Suporte ao Motorista */}
        <section>
          <h3 className="text-base font-bold mb-3">11. SISTEMA DE AJUDA INTEGRADO</h3>
          <p className="text-sm mb-3 text-justify">
            O app de marcação possui botões de ajuda em cada campo que permitem comunicação direta com a central via WhatsApp.
          </p>
          <div className="space-y-2 text-sm">
            <div>
              <p className="font-bold mb-1">11.1 Configuração:</p>
              <p className="ml-4 text-justify">
                Acesse <strong>Configurações → Dados da Empresa</strong> e informe o "Celular de Suporte (WhatsApp)". 
                Este número será usado nos botões de ajuda do app externo.
              </p>
            </div>
            <div>
              <p className="font-bold mb-1">11.2 Funcionamento:</p>
              <p className="ml-4 mb-2 text-justify">
                Quando o motorista clica no botão "Ajuda", o sistema:
              </p>
              <ul className="ml-8 space-y-1">
                <li>• Abre conversa no WhatsApp com o número configurado</li>
                <li>• Preenche mensagem automática informando a tela onde está tendo dificuldade</li>
                <li>• Permite que operador preste suporte em tempo real</li>
              </ul>
            </div>
          </div>
        </section>

        {/* 13. Documentos Relacionados */}
        <section>
          <h3 className="text-base font-bold mb-3">12. DOCUMENTOS DE REFERÊNCIA</h3>
          <ul className="text-sm space-y-1 ml-6">
            <li>• PO-LOG-001 - Procedimento Operacional de Gestão de Transportes</li>
            <li>• IT-LOG-001 - Instrução de Trabalho para Gestão de Ordens de Carregamento</li>
            <li>• IT-LOG-002 - Instrução de Trabalho para Tracking e Rastreamento</li>
            <li>• MAN-LOG-001 - Manual do Sistema Log Flow</li>
          </ul>
        </section>

        {/* 14. Anexos */}
        <section>
          <h3 className="text-base font-bold mb-3">13. ANEXOS</h3>

          {/* Anexo A - Fluxograma */}
          <div className="mb-6 print-page-break">
            <h4 className="font-bold text-sm mb-4 bg-gray-100 border-2 border-black px-3 py-2">
              ANEXO A - Fluxograma Detalhado do Processo de Check-in
            </h4>
            
            <div className="border rounded p-6 space-y-4" style={{ borderColor: theme.cardBorder, backgroundColor: isDark ? '#0f172a' : '#ffffff' }}>
              {/* Etapa 1 */}
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center text-white font-bold">
                    1
                  </div>
                </div>
                <div className="flex-1">
                  <div className="border-2 border-green-600 rounded-lg p-3">
                    <p className="font-bold text-sm mb-1" style={{ color: theme.text }}>INÍCIO - Motorista Acessa Link</p>
                    <p className="text-xs" style={{ color: theme.textMuted }}>
                      Motorista clica no link compartilhado pela transportadora<br/>
                      <strong>URL:</strong> logiflow.com.br/FilaMotorista?codigo=XXXX<br/>
                      <strong>Validação:</strong> Sistema verifica código de acesso da empresa
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-center">
                <div className="w-0.5 h-8 bg-gray-400"></div>
              </div>

              {/* Etapa 2 */}
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                    2
                  </div>
                </div>
                <div className="flex-1">
                  <div className="border-2 border-blue-600 rounded-lg p-3">
                    <p className="font-bold text-sm mb-1" style={{ color: theme.text }}>Input Telefone</p>
                    <p className="text-xs" style={{ color: theme.textMuted }}>
                      Motorista informa celular com DDD (11 dígitos)<br/>
                      <strong>Sistema verifica:</strong> Telefone já cadastrado?
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-center">
                <div className="w-0.5 h-8 bg-gray-400"></div>
              </div>

              {/* Decisão - Cadastrado? */}
              <div className="flex items-center gap-4">
                <div className="flex-shrink-0 w-12"></div>
                <div className="flex-1">
                  <div className="bg-yellow-100 dark:bg-yellow-900/30 border-2 border-yellow-600 rounded-lg p-3">
                    <p className="font-bold text-sm text-center" style={{ color: theme.text }}>Motorista Cadastrado?</p>
                    <div className="grid grid-cols-2 gap-3 mt-2 text-xs">
                      <div className="bg-green-50 dark:bg-green-900/20 border border-green-500 rounded p-2">
                        <p className="font-semibold text-green-700 dark:text-green-400">✓ SIM</p>
                        <p className="text-green-600 dark:text-green-500">Preenche dados automaticamente</p>
                      </div>
                      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-500 rounded p-2">
                        <p className="font-semibold text-blue-700 dark:text-blue-400">✗ NÃO</p>
                        <p className="text-blue-600 dark:text-blue-500">Segue para wizard completo</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-center">
                <div className="w-0.5 h-8 bg-gray-400"></div>
              </div>

              {/* Etapa 3-6 - Wizard */}
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    3-6
                  </div>
                </div>
                <div className="flex-1">
                  <div className="border-2 border-purple-600 rounded-lg p-3">
                    <p className="font-bold text-sm mb-2" style={{ color: theme.text }}>Wizard de Dados (4 Passos)</p>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="bg-purple-50 dark:bg-purple-900/20 rounded p-2">
                        <p className="font-semibold">Passo 1: Nome Motorista</p>
                      </div>
                      <div className="bg-purple-50 dark:bg-purple-900/20 rounded p-2">
                        <p className="font-semibold">Passo 2: Placa Cavalo</p>
                      </div>
                      <div className="bg-purple-50 dark:bg-purple-900/20 rounded p-2">
                        <p className="font-semibold">Passo 3: Tipo Motorista/Veículo/Carroceria</p>
                      </div>
                      <div className="bg-purple-50 dark:bg-purple-900/20 rounded p-2">
                        <p className="font-semibold">Passo 4: Comprovante Descarga</p>
                      </div>
                    </div>
                    <p className="text-xs mt-2" style={{ color: theme.textMuted }}>
                      Botões de "Ajuda" disponíveis em cada passo (WhatsApp com suporte)
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-center">
                <div className="w-0.5 h-8 bg-gray-400"></div>
              </div>

              {/* Etapa 7 - Validação IA */}
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold">
                    7
                  </div>
                </div>
                <div className="flex-1">
                  <div className="border-2 border-indigo-600 rounded-lg p-3">
                    <p className="font-bold text-sm mb-1" style={{ color: theme.text }}>Validação IA do Comprovante</p>
                    <p className="text-xs mb-2" style={{ color: theme.textMuted }}>
                      IA analisa imagem do comprovante:
                    </p>
                    <ul className="text-xs space-y-1 ml-4 list-disc" style={{ color: theme.textMuted }}>
                      <li>Qualidade e legibilidade da imagem</li>
                      <li>Presença de data visível</li>
                      <li>Verificação se é comprovante de descarga válido</li>
                      <li>Extração automática da data de descarga</li>
                    </ul>
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-400 rounded p-2 mt-2">
                      <p className="text-xs text-red-700 dark:text-red-400">
                        ❌ Se inválido: Solicita nova foto e bloqueia continuação
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-center">
                <div className="w-0.5 h-8 bg-gray-400"></div>
              </div>

              {/* Etapa 8 - Localização */}
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-cyan-600 rounded-full flex items-center justify-center text-white font-bold">
                    8
                  </div>
                </div>
                <div className="flex-1">
                  <div className="border-2 border-cyan-600 rounded-lg p-3">
                    <p className="font-bold text-sm mb-1" style={{ color: theme.text }}>Obter Localização GPS</p>
                    <p className="text-xs" style={{ color: theme.textMuted }}>
                      Sistema solicita permissão de geolocalização<br/>
                      <strong>Dados obtidos:</strong> Latitude, longitude, cidade, UF<br/>
                      <strong>API:</strong> OpenStreetMap (Nominatim) para geocodificação reversa
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-center">
                <div className="w-0.5 h-8 bg-gray-400"></div>
              </div>

              {/* Etapa 9 - Confirmação */}
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-orange-600 rounded-full flex items-center justify-center text-white font-bold">
                    9
                  </div>
                </div>
                <div className="flex-1">
                  <div className="border-2 border-orange-600 rounded-lg p-3">
                    <p className="font-bold text-sm mb-1" style={{ color: theme.text }}>Confirmação Final</p>
                    <p className="text-xs mb-2 font-semibold text-red-600">
                      ⚠️ "Você confirma que seu veículo está VAZIO?"
                    </p>
                    <p className="text-xs" style={{ color: theme.textMuted }}>
                      Motorista deve confirmar explicitamente<br/>
                      Se cancelar, processo é interrompido
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-center">
                <div className="w-0.5 h-8 bg-gray-400"></div>
              </div>

              {/* Etapa 10 - Processamento */}
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-purple-700 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    10
                  </div>
                </div>
                <div className="flex-1">
                  <div className="border-2 border-purple-700 rounded-lg p-3">
                    <p className="font-bold text-sm mb-1" style={{ color: theme.text }}>Processamento Backend</p>
                    <p className="text-xs mb-2" style={{ color: theme.textMuted }}>Sistema executa:</p>
                    <ol className="text-xs space-y-1 ml-4 list-decimal" style={{ color: theme.textMuted }}>
                      <li>Verifica duplicação de telefone ativo na empresa</li>
                      <li>Gera senha única de 4 caracteres (max 50 tentativas)</li>
                      <li>Calcula posição FIFO (marcações ativas + 1)</li>
                      <li>Cria registro FilaVeiculo com todos os dados</li>
                      <li>Executa função recalcularPosicoesFilaFIFO</li>
                      <li>Atualiza posições de todos veículos ativos</li>
                    </ol>
                  </div>
                </div>
              </div>

              <div className="flex justify-center">
                <div className="w-0.5 h-8 bg-gray-400"></div>
              </div>

              {/* Etapa 11 - Sucesso */}
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-7 h-7 text-white" />
                  </div>
                </div>
                <div className="flex-1">
                  <div className="border-2 border-green-600 rounded-lg p-3 bg-green-50 dark:bg-green-900/20">
                    <p className="font-bold text-sm mb-1 text-green-700 dark:text-green-400">✓ FIM - Check-in Realizado</p>
                    <p className="text-xs mb-2" style={{ color: theme.textMuted }}>
                      Motorista visualiza:
                    </p>
                    <ul className="text-xs space-y-1 ml-4 list-disc" style={{ color: theme.textMuted }}>
                      <li><strong>Senha da fila</strong> (4 caracteres)</li>
                      <li><strong>Posição atual</strong> na fila</li>
                      <li><strong>Veículos na frente</strong></li>
                      <li><strong>Tempo de espera</strong> desde entrada</li>
                      <li><strong>Ordem vinculada</strong> (se já alocado)</li>
                      <li><strong>Botões:</strong> Atualizar posição | Sair da fila</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Anexo B - Tabela de Veículos */}
          <div className="mb-6 print-page-break">
            <h4 className="font-bold text-sm mb-4 bg-gray-100 border-2 border-black px-3 py-2">
              ANEXO B - Tabela de Tipos de Veículo e Carroceria Padronizados
            </h4>
            
            <div className="space-y-4">
              {/* Tipos de Veículo */}
              <div>
                <p className="text-sm font-bold mb-2">B.1 Tipos de Veículo (Enum Padrão)</p>
                <table className="w-full text-xs border-2 border-black">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="border border-black p-2 text-left w-12 font-bold">#</th>
                      <th className="border border-black p-2 text-left font-bold">Tipo de Veículo</th>
                      <th className="border border-black p-2 text-left font-bold">Capacidade Típica</th>
                      <th className="border border-black p-2 text-left font-bold">Eixos</th>
                      <th className="border border-black p-2 text-left font-bold">Aplicação Comum</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-black p-2 text-center font-bold">1</td>
                      <td className="border border-black p-2 font-bold">RODOTREM</td>
                      <td className="border border-black p-2">45-57 toneladas</td>
                      <td className="border border-black p-2">9 eixos</td>
                      <td className="border border-black p-2">Longas distâncias, cargas pesadas</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="border border-black p-2 text-center font-bold">2</td>
                      <td className="border border-black p-2 font-bold">TRUCK</td>
                      <td className="border border-black p-2">10-14 toneladas</td>
                      <td className="border border-black p-2">2-3 eixos</td>
                      <td className="border border-black p-2">Entregas urbanas, fracionadas</td>
                    </tr>
                    <tr>
                      <td className="border border-black p-2 text-center font-bold">3</td>
                      <td className="border border-black p-2 font-bold">CARRETA 5 EIXOS</td>
                      <td className="border border-black p-2">25-27 toneladas</td>
                      <td className="border border-black p-2">5 eixos</td>
                      <td className="border border-black p-2">Cargas médias, regionais</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="border border-black p-2 text-center font-bold">4</td>
                      <td className="border border-black p-2 font-bold">CARRETA 6 EIXOS</td>
                      <td className="border border-black p-2">30-33 toneladas</td>
                      <td className="border border-black p-2">6 eixos</td>
                      <td className="border border-black p-2">Cargas pesadas, longas distâncias</td>
                    </tr>
                    <tr>
                      <td className="border border-black p-2 text-center font-bold">5</td>
                      <td className="border border-black p-2 font-bold">CARRETA 7 EIXOS</td>
                      <td className="border border-black p-2">35-40 toneladas</td>
                      <td className="border border-black p-2">7 eixos</td>
                      <td className="border border-black p-2">Cargas muito pesadas</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="border border-black p-2 text-center font-bold">6</td>
                      <td className="border border-black p-2 font-bold">BITREM</td>
                      <td className="border border-black p-2">45-50 toneladas</td>
                      <td className="border border-black p-2">7-9 eixos</td>
                      <td className="border border-black p-2">Granéis, alta capacidade</td>
                    </tr>
                    <tr>
                      <td className="border border-black p-2 text-center font-bold">7</td>
                      <td className="border border-black p-2 font-bold">BI-TRUCK</td>
                      <td className="border border-black p-2">16-23 toneladas</td>
                      <td className="border border-black p-2">4 eixos</td>
                      <td className="border border-black p-2">Entregas regionais, carga média</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Tipos de Carroceria */}
              <div>
                <p className="text-sm font-bold mb-2">B.2 Tipos de Carroceria (Enum Padrão)</p>
                <table className="w-full text-xs border-2 border-black">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="border border-black p-2 text-left w-12 font-bold">#</th>
                      <th className="border border-black p-2 text-left font-bold">Tipo de Carroceria</th>
                      <th className="border border-black p-2 text-left font-bold">Características</th>
                      <th className="border border-black p-2 text-left font-bold">Cargas Típicas</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-black p-2 text-center font-bold">1</td>
                      <td className="border border-black p-2 font-bold">SIDER</td>
                      <td className="border border-black p-2">Cortina lateral retrátil</td>
                      <td className="border border-black p-2">Pallets, cargas gerais</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="border border-black p-2 text-center font-bold">2</td>
                      <td className="border border-black p-2 font-bold">PRANCHA</td>
                      <td className="border border-black p-2">Plataforma aberta, sem laterais</td>
                      <td className="border border-black p-2">Máquinas, estruturas metálicas</td>
                    </tr>
                    <tr>
                      <td className="border border-black p-2 text-center font-bold">3</td>
                      <td className="border border-black p-2 font-bold">GRADE BAIXA</td>
                      <td className="border border-black p-2">Laterais baixas (aprox. 60cm)</td>
                      <td className="border border-black p-2">Sacaria, caixas, materiais leves</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="border border-black p-2 text-center font-bold">4</td>
                      <td className="border border-black p-2 font-bold">GRADE ALTA</td>
                      <td className="border border-black p-2">Laterais altas (aprox. 2m)</td>
                      <td className="border border-black p-2">Volumosos, materiais a granel</td>
                    </tr>
                    <tr>
                      <td className="border border-black p-2 text-center font-bold">5</td>
                      <td className="border border-black p-2 font-bold">BAU</td>
                      <td className="border border-black p-2">Carroceria fechada metálica</td>
                      <td className="border border-black p-2">Cargas frágeis, eletrônicos</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Anexo C - Exemplos de Status */}
          <div className="mb-6 print-page-break">
            <h4 className="font-bold text-sm mb-4 bg-gray-100 border-2 border-black px-3 py-2">
              ANEXO C - Exemplos de Configuração de Status Customizados
            </h4>
            
            <p className="text-sm mb-3 text-justify">
              A seguir, apresentam-se três cenários de configuração de status para diferentes modelos operacionais:
            </p>

            <div className="space-y-4">
              {/* Exemplo 1 - Básico */}
              <div>
                <p className="text-sm font-bold mb-2">Exemplo 1: Configuração Básica (3 Status)</p>
                <table className="w-full text-xs border-2 border-black">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="border border-black p-2 text-left font-bold">Nome</th>
                      <th className="border border-black p-2 text-left w-16 font-bold">Cor</th>
                      <th className="border border-black p-2 text-left w-12 font-bold">Ícone</th>
                      <th className="border border-black p-2 text-center w-20 font-bold">Remove Fila</th>
                      <th className="border border-black p-2 text-center w-24 font-bold">Mover ao Vincular</th>
                      <th className="border border-black p-2 text-left font-bold">Uso</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-black p-2 font-bold">Aguardando</td>
                      <td className="border border-black p-2"><div className="w-4 h-4 bg-green-500 rounded"></div></td>
                      <td className="border border-black p-2 text-center">⏳</td>
                      <td className="border border-black p-2 text-center">Não</td>
                      <td className="border border-black p-2 text-center">Não</td>
                      <td className="border border-black p-2">Status inicial ao entrar na fila</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="border border-black p-2 font-bold">Em Operação</td>
                      <td className="border border-black p-2"><div className="w-4 h-4 bg-blue-500 rounded"></div></td>
                      <td className="border border-black p-2 text-center">🚛</td>
                      <td className="border border-black p-2 text-center">Não</td>
                      <td className="border border-black p-2 text-center font-bold">Sim</td>
                      <td className="border border-black p-2">Aplicado ao vincular senha a ordem</td>
                    </tr>
                    <tr>
                      <td className="border border-black p-2 font-bold">Indisponível</td>
                      <td className="border border-black p-2"><div className="w-4 h-4 bg-red-500 rounded"></div></td>
                      <td className="border border-black p-2 text-center">❌</td>
                      <td className="border border-black p-2 text-center font-bold">Sim</td>
                      <td className="border border-black p-2 text-center">Não</td>
                      <td className="border border-black p-2">Remove da fila (manutenção, problemas)</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Exemplo 2 - Avançado */}
              <div>
                <p className="text-sm font-bold mb-2 text-purple-600">Exemplo 2: Configuração Avançada (6 Status)</p>
                <table className="w-full text-xs border" style={{ borderColor: theme.cardBorder }}>
                  <thead style={{ backgroundColor: isDark ? '#0f172a' : '#f3f4f6' }}>
                    <tr>
                      <th className="border p-2 text-left" style={{ borderColor: theme.cardBorder, color: theme.text }}>Nome</th>
                      <th className="border p-2 text-left w-16" style={{ borderColor: theme.cardBorder, color: theme.text }}>Cor</th>
                      <th className="border p-2 text-left" style={{ borderColor: theme.cardBorder, color: theme.text }}>Descrição</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border p-2 font-semibold" style={{ borderColor: theme.cardBorder, color: theme.text }}>Aguardando Carga</td>
                      <td className="border p-2"><div className="w-4 h-4 bg-green-500 rounded"></div></td>
                      <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>Veículo disponível, aguardando alocação</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="border p-2 font-semibold" style={{ borderColor: theme.cardBorder, color: theme.text }}>Pré-Alocado</td>
                      <td className="border p-2"><div className="w-4 h-4 bg-yellow-500 rounded"></div></td>
                      <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>Reservado para carga específica (não confirmado)</td>
                    </tr>
                    <tr>
                      <td className="border p-2 font-semibold" style={{ borderColor: theme.cardBorder, color: theme.text }}>Confirmado</td>
                      <td className="border p-2"><div className="w-4 h-4 bg-blue-500 rounded"></div></td>
                      <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>Senha vinculada à ordem (mover_quando_vinculado: true)</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="border p-2 font-semibold" style={{ borderColor: theme.cardBorder, color: theme.text }}>Em Vistoria</td>
                      <td className="border p-2"><div className="w-4 h-4 bg-purple-500 rounded"></div></td>
                      <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>Checklist pré-viagem em andamento</td>
                    </tr>
                    <tr>
                      <td className="border p-2 font-semibold" style={{ borderColor: theme.cardBorder, color: theme.text }}>Operando</td>
                      <td className="border p-2"><div className="w-4 h-4 bg-cyan-600 rounded"></div></td>
                      <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>Em carregamento ou já carregado (remove_da_fila: true)</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="border p-2 font-semibold" style={{ borderColor: theme.cardBorder, color: theme.text }}>Cancelado</td>
                      <td className="border p-2"><div className="w-4 h-4 bg-red-500 rounded"></div></td>
                      <td className="border p-2" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>Motorista desistiu ou foi desqualificado (remove_da_fila: true, aplicar_ao_sair_fila: true)</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Exemplo 3 - Workflow Complexo */}
              <div>
                <p className="text-sm font-bold mb-2 text-orange-600">Exemplo 3: Workflow com Priorização (8 Status)</p>
                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-400 rounded p-3 text-xs">
                  <p className="font-semibold mb-1" style={{ color: theme.text }}>Cenário: Empresa com múltiplos terminais e priorização por tipo de carga</p>
                  <ul className="list-disc ml-4 space-y-1" style={{ color: theme.textMuted }}>
                    <li><strong>Disponível Normal:</strong> Fila padrão FIFO</li>
                    <li><strong>Disponível Prioridade:</strong> Cargas prioritárias (expressa)</li>
                    <li><strong>Terminal A:</strong> Veículo direcionado ao terminal específico</li>
                    <li><strong>Terminal B:</strong> Veículo direcionado ao terminal específico</li>
                    <li><strong>Aguardando Checklist:</strong> Pendente vistoria técnica</li>
                    <li><strong>Aprovado p/ Carga:</strong> Pronto para alocar</li>
                    <li><strong>Alocado:</strong> Vinculado a ordem (remove_da_fila: true)</li>
                    <li><strong>Bloqueado:</strong> Problema documental ou técnico</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Anexo D - Tutorial Visual */}
          <div className="mb-6 print-page-break">
            <h4 className="font-bold text-sm mb-4 bg-gray-100 border-2 border-black px-3 py-2">
              ANEXO D - Tutorial Visual do App de Marcação (Motorista)
            </h4>
            
            <div className="space-y-4">
              {/* Tela 1 - Telefone */}
              <div className="border rounded-lg p-4" style={{ borderColor: theme.cardBorder }}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                    1
                  </div>
                  <p className="font-bold text-sm" style={{ color: theme.text }}>TELA 1: Entrada de Telefone</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 border-2 border-gray-300" style={{ borderColor: theme.cardBorder }}>
                    <p className="text-xs font-semibold mb-2 text-center" style={{ color: theme.text }}>Check-in na Fila</p>
                    <p className="text-[10px] text-center mb-3" style={{ color: theme.textMuted }}>Digite seu celular para continuar</p>
                    
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-400 rounded p-2 mb-3">
                      <p className="text-[9px] text-red-700 dark:text-red-400 font-semibold">⚠️ ATENÇÃO</p>
                      <p className="text-[8px] text-red-600 dark:text-red-500">Só marque placa se veículo VAZIO</p>
                    </div>
                    
                    <div className="border rounded p-2 mb-2 text-center bg-white dark:bg-gray-800" style={{ borderColor: theme.cardBorder }}>
                      <p className="text-xs font-mono">(00) 00000-0000</p>
                    </div>
                    
                    <div className="bg-blue-600 text-white rounded p-2 text-center">
                      <p className="text-xs font-bold">Continuar</p>
                    </div>
                  </div>
                  <div className="space-y-2 text-xs" style={{ color: theme.textMuted }}>
                    <p className="font-semibold" style={{ color: theme.text }}>Instruções:</p>
                    <ul className="list-disc ml-4 space-y-1">
                      <li>Digite telefone com DDD (11 dígitos)</li>
                      <li>Formato: (XX) XXXXX-XXXX</li>
                      <li>Sistema busca cadastro automaticamente</li>
                      <li>Se encontrado: dados preenchidos</li>
                      <li>Se não encontrado: wizard completo</li>
                    </ul>
                    <div className="bg-green-50 dark:bg-green-900/20 border border-green-400 rounded p-2 mt-2">
                      <p className="text-[10px] text-green-700 dark:text-green-400">
                        ✓ Cadastro encontrado = Processo mais rápido
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tela 2-5 - Wizard */}
              <div className="border rounded-lg p-4" style={{ borderColor: theme.cardBorder }}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold">
                    2-5
                  </div>
                  <p className="font-bold text-sm" style={{ color: theme.text }}>TELAS 2-5: Wizard de Dados (4 Passos)</p>
                </div>
                
                <div className="grid grid-cols-4 gap-2 mb-3">
                  <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-300 rounded p-2 text-center">
                    <p className="text-[10px] font-bold mb-1" style={{ color: theme.text }}>Passo 1/4</p>
                    <User className="w-6 h-6 mx-auto mb-1 text-purple-600" />
                    <p className="text-[9px]" style={{ color: theme.textMuted }}>Nome Motorista</p>
                  </div>
                  <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-300 rounded p-2 text-center">
                    <p className="text-[10px] font-bold mb-1" style={{ color: theme.text }}>Passo 2/4</p>
                    <Truck className="w-6 h-6 mx-auto mb-1 text-purple-600" />
                    <p className="text-[9px]" style={{ color: theme.textMuted }}>Placa Cavalo</p>
                  </div>
                  <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-300 rounded p-2 text-center">
                    <p className="text-[10px] font-bold mb-1" style={{ color: theme.text }}>Passo 3/4</p>
                    <p className="text-lg mb-1">🚛</p>
                    <p className="text-[9px]" style={{ color: theme.textMuted }}>Tipos</p>
                  </div>
                  <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-300 rounded p-2 text-center">
                    <p className="text-[10px] font-bold mb-1" style={{ color: theme.text }}>Passo 4/4</p>
                    <p className="text-lg mb-1">📸</p>
                    <p className="text-[9px]" style={{ color: theme.textMuted }}>Comprovante</p>
                  </div>
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-400 rounded p-3">
                  <p className="text-xs font-semibold mb-2" style={{ color: theme.text }}>Funcionalidades do Wizard:</p>
                  <ul className="text-[10px] space-y-1 ml-3 list-disc" style={{ color: theme.textMuted }}>
                    <li><strong>Barra de Progresso:</strong> Mostra passo atual (ex: 2/4)</li>
                    <li><strong>Validação em Tempo Real:</strong> Campos marcados em vermelho se inválidos</li>
                    <li><strong>Botões de Navegação:</strong> Anterior / Próximo</li>
                    <li><strong>Botão Ajuda:</strong> Em cada passo, abre WhatsApp com mensagem pré-formatada</li>
                    <li><strong>Auto-save:</strong> Dados preservados se motorista sair e voltar</li>
                  </ul>
                </div>
              </div>

              {/* Tela 6 - Comprovante */}
              <div className="border rounded-lg p-4" style={{ borderColor: theme.cardBorder }}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold">
                    6
                  </div>
                  <p className="font-bold text-sm" style={{ color: theme.text }}>TELA 6: Upload e Validação de Comprovante</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-semibold mb-2" style={{ color: theme.text }}>Fluxo do Upload:</p>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-[10px] font-bold">1</div>
                        <p className="text-[10px]" style={{ color: theme.textMuted }}>Motorista tira foto do comprovante</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-[10px] font-bold">2</div>
                        <p className="text-[10px]" style={{ color: theme.textMuted }}>Upload automático para servidor</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-indigo-600 text-white rounded-full flex items-center justify-center text-[10px] font-bold">3</div>
                        <p className="text-[10px]" style={{ color: theme.textMuted }}>IA valida documento (5-10 seg)</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-[10px] font-bold">4</div>
                        <p className="text-[10px]" style={{ color: theme.textMuted }}>Resultado: ✓ Válido ou ❌ Inválido</p>
                      </div>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-semibold mb-2" style={{ color: theme.text }}>Critérios de Validação IA:</p>
                    <div className="space-y-2 text-[10px]">
                      <div className="flex items-start gap-2">
                        <CheckCircle className="w-3 h-3 text-green-600 flex-shrink-0 mt-0.5" />
                        <p style={{ color: theme.textMuted }}>Imagem legível e bem focada</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle className="w-3 h-3 text-green-600 flex-shrink-0 mt-0.5" />
                        <p style={{ color: theme.textMuted }}>Data visível no documento</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle className="w-3 h-3 text-green-600 flex-shrink-0 mt-0.5" />
                        <p style={{ color: theme.textMuted }}>Documento de descarga/entrega válido</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle className="w-3 h-3 text-green-600 flex-shrink-0 mt-0.5" />
                        <p style={{ color: theme.textMuted }}>Extração da data de descarga</p>
                      </div>
                    </div>
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-400 rounded p-2 mt-3">
                      <p className="text-[10px] text-red-700 dark:text-red-400 font-semibold">
                        Se inválido: Motorista deve tirar nova foto para continuar
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tela 7 - Localização */}
              <div className="border rounded-lg p-4" style={{ borderColor: theme.cardBorder }}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 bg-cyan-600 text-white rounded-full flex items-center justify-center font-bold">
                    7
                  </div>
                  <p className="font-bold text-sm" style={{ color: theme.text }}>TELA 7: Obtenção de Localização GPS</p>
                </div>
                
                <div className="bg-cyan-50 dark:bg-cyan-900/20 border border-cyan-400 rounded p-3">
                  <p className="text-xs font-semibold mb-2" style={{ color: theme.text }}>Funcionamento:</p>
                  <ol className="text-[10px] space-y-1 ml-4 list-decimal" style={{ color: theme.textMuted }}>
                    <li>Sistema solicita permissão de localização ao navegador</li>
                    <li>Motorista autoriza compartilhamento de GPS</li>
                    <li>Sistema captura coordenadas (latitude, longitude)</li>
                    <li>Geocodificação reversa via OpenStreetMap (Nominatim)</li>
                    <li>Extração de: Cidade, Estado (UF), Endereço completo</li>
                    <li>Campo "Cidade e UF" preenchido automaticamente</li>
                    <li>Botão "Fazer Check-in" habilitado</li>
                  </ol>
                  <div className="bg-green-100 dark:bg-green-900/30 border border-green-500 rounded p-2 mt-2">
                    <p className="text-[10px] text-green-700 dark:text-green-400 font-semibold">
                      ✓ Ao clicar "Fazer Check-in": Submissão final e entrada na fila
                    </p>
                  </div>
                </div>
              </div>

              {/* Tela 8 - Confirmação */}
              <div className="border rounded-lg p-4" style={{ borderColor: theme.cardBorder }}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center">
                    <CheckCircle className="w-5 h-5" />
                  </div>
                  <p className="font-bold text-sm" style={{ color: theme.text }}>TELA 8: Confirmação de Check-in</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 border-2 border-green-500">
                    <div className="text-center mb-3">
                      <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-2">
                        <CheckCircle className="w-6 h-6 text-white" />
                      </div>
                      <p className="text-xs font-bold">Cadastro Realizado!</p>
                      <p className="text-[10px]" style={{ color: theme.textMuted }}>Sua posição na fila</p>
                    </div>

                    <div className="bg-blue-600 text-white rounded-lg p-3 mb-2">
                      <p className="text-center text-[10px]">Senha: <span className="text-lg font-mono ml-1">AB3X</span></p>
                    </div>

                    <div className="text-center mb-2">
                      <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full">
                        <span className="text-xl font-bold text-blue-600">7</span>
                      </div>
                      <p className="text-[9px] mt-1" style={{ color: theme.textMuted }}>6 veículos na frente</p>
                    </div>

                    <div className="space-y-1 text-[9px] border-t pt-2" style={{ borderColor: theme.cardBorder }}>
                      <div className="flex justify-between">
                        <span style={{ color: theme.textMuted }}>Motorista:</span>
                        <span className="font-semibold">João Silva</span>
                      </div>
                      <div className="flex justify-between">
                        <span style={{ color: theme.textMuted }}>Placa:</span>
                        <span className="font-mono font-bold">ABC1234</span>
                      </div>
                      <div className="flex justify-between">
                        <span style={{ color: theme.textMuted }}>Tipo:</span>
                        <span>Frota</span>
                      </div>
                      <div className="flex justify-between">
                        <span style={{ color: theme.textMuted }}>Tempo:</span>
                        <span className="text-orange-600 font-semibold">45min</span>
                      </div>
                    </div>

                    <div className="flex gap-2 mt-3">
                      <div className="flex-1 bg-blue-600 text-white rounded p-1 text-center">
                        <p className="text-[9px] font-bold">🔄 Atualizar</p>
                      </div>
                      <div className="flex-1 bg-white border border-red-300 text-red-600 rounded p-1 text-center">
                        <p className="text-[9px] font-bold">Sair</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2 text-xs" style={{ color: theme.textMuted }}>
                    <p className="font-semibold" style={{ color: theme.text }}>Informações Exibidas:</p>
                    <ul className="list-disc ml-4 space-y-1">
                      <li><strong>Senha da fila:</strong> 4 caracteres únicos</li>
                      <li><strong>Posição atual:</strong> Número grande destacado</li>
                      <li><strong>Veículos na frente:</strong> Contagem atualizada</li>
                      <li><strong>Dados do veículo:</strong> Nome, placa, tipo</li>
                      <li><strong>Tempo de espera:</strong> Calculado em tempo real</li>
                      <li><strong>Ordem vinculada:</strong> Se já alocado, mostra detalhes</li>
                    </ul>
                    
                    <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-400 rounded p-2 mt-3">
                      <p className="text-[10px] font-semibold text-amber-800 dark:text-amber-400">Importante:</p>
                      <p className="text-[10px] text-amber-700 dark:text-amber-500">
                        • Aguarde contato da central<br/>
                        • Não ligue perguntando posição<br/>
                        • Clique "Atualizar" para refresh<br/>
                        • Posição é estimativa (pode variar)
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Dicas Visuais */}
              <div className="border rounded-lg p-4 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950" style={{ borderColor: theme.cardBorder }}>
                <p className="font-bold text-sm mb-3" style={{ color: theme.text }}>💡 Dicas para Motoristas:</p>
                <div className="grid grid-cols-2 gap-3 text-[10px]">
                  <div className="flex items-start gap-2">
                    <span className="text-green-600 font-bold">✓</span>
                    <p style={{ color: theme.textMuted }}>Mantenha dados cadastrais atualizados para check-in rápido</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-green-600 font-bold">✓</span>
                    <p style={{ color: theme.textMuted }}>Tire foto clara do comprovante (bem iluminada, sem borrão)</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-green-600 font-bold">✓</span>
                    <p style={{ color: theme.textMuted }}>Autorize GPS para localização precisa</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-green-600 font-bold">✓</span>
                    <p style={{ color: theme.textMuted }}>Use botão "Ajuda" se tiver dúvidas em qualquer passo</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-red-600 font-bold">✗</span>
                    <p style={{ color: theme.textMuted }}>Não faça check-in com veículo carregado</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-red-600 font-bold">✗</span>
                    <p style={{ color: theme.textMuted }}>Não ligue para perguntar posição (use botão Atualizar)</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Rodapé */}
        <div className="border-t-2 border-black pt-3 mt-8 text-xs text-center">
          <p className="font-semibold">Este documento é propriedade da empresa e não deve ser reproduzido sem autorização.</p>
          <p className="mt-1">Controlado eletronicamente - A versão impressa é considerada cópia não controlada.</p>
        </div>
      </div>
    </div>
  );
}