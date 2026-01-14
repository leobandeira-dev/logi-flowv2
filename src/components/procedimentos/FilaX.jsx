import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Truck, User, CheckCircle } from "lucide-react";

export function InstrucaoFilaX({ theme, isDark }) {
  return (
    <Card style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}>
      <CardContent className="p-8 space-y-6">
        {/* Cabeçalho do Documento */}
        <div className="border-b pb-6" style={{ borderColor: theme.cardBorder }}>
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h1 className="text-2xl font-bold mb-2" style={{ color: theme.text }}>
                INSTRUÇÃO DE TRABALHO
              </h1>
              <h2 className="text-xl font-semibold mb-1" style={{ color: theme.text }}>
                Gestão da Fila X de Veículos
              </h2>
            </div>
            <div className="text-right text-sm" style={{ color: theme.textMuted }}>
              <p className="font-bold">Código: IT-LOG-004</p>
              <p>Revisão: 01</p>
              <p>Data: 14/01/2026</p>
              <p>Páginas: 1/1</p>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <p className="font-semibold" style={{ color: theme.text }}>Elaborado por:</p>
              <p style={{ color: theme.textMuted }}>Gestão de Qualidade</p>
            </div>
            <div>
              <p className="font-semibold" style={{ color: theme.text }}>Aprovado por:</p>
              <p style={{ color: theme.textMuted }}>Diretor de Operações</p>
            </div>
            <div>
              <p className="font-semibold" style={{ color: theme.text }}>Área:</p>
              <p style={{ color: theme.textMuted }}>Operações Logísticas</p>
            </div>
          </div>
        </div>

        {/* 1. Objetivo */}
        <section>
          <h3 className="text-lg font-bold mb-3 flex items-center gap-2" style={{ color: theme.text }}>
            <span className="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">1</span>
            OBJETIVO
          </h3>
          <p className="text-sm leading-relaxed" style={{ color: theme.textMuted }}>
            Estabelecer os critérios e procedimentos para gestão da fila de veículos disponíveis para carregamento, 
            garantindo organização, priorização adequada, rastreabilidade das marcações e eficiência na alocação 
            de recursos conforme disponibilidade e tipo de carga.
          </p>
        </section>

        {/* 2. Aplicação */}
        <section>
          <h3 className="text-lg font-bold mb-3 flex items-center gap-2" style={{ color: theme.text }}>
            <span className="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">2</span>
            APLICAÇÃO
          </h3>
          <p className="text-sm leading-relaxed mb-2" style={{ color: theme.textMuted }}>
            Esta instrução de trabalho aplica-se a:
          </p>
          <ul className="list-disc list-inside text-sm space-y-1 ml-4" style={{ color: theme.textMuted }}>
            <li>Coordenadores de expedição responsáveis pela gestão da fila</li>
            <li>Operadores logísticos que fazem alocação de veículos</li>
            <li>Motoristas que utilizam o app externo para check-in na fila</li>
            <li>Gestores que monitoram a disponibilidade de recursos</li>
          </ul>
        </section>

        {/* 3. Definições */}
        <section>
          <h3 className="text-lg font-bold mb-3 flex items-center gap-2" style={{ color: theme.text }}>
            <span className="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">3</span>
            DEFINIÇÕES
          </h3>
          <div className="space-y-3 text-sm">
            <div>
              <p className="font-semibold" style={{ color: theme.text }}>3.1 Fila X:</p>
              <p style={{ color: theme.textMuted }}>
                Sistema de gerenciamento de veículos disponíveis aguardando alocação para cargas. 
                Organiza motoristas por ordem de chegada (FIFO - First In, First Out) e tipo de veículo.
              </p>
            </div>
            <div>
              <p className="font-semibold" style={{ color: theme.text }}>3.2 Marcação de Placa:</p>
              <p style={{ color: theme.textMuted }}>
                Registro de entrada de veículo na fila, contendo dados do motorista, veículo, 
                tipo de operação e localização atual.
              </p>
            </div>
            <div>
              <p className="font-semibold" style={{ color: theme.text }}>3.3 Senha de Fila:</p>
              <p style={{ color: theme.textMuted }}>
                Código alfanumérico único de 4 caracteres gerado automaticamente pelo sistema 
                para identificação do veículo na fila e vinculação posterior com ordem de carregamento.
              </p>
            </div>
            <div>
              <p className="font-semibold" style={{ color: theme.text }}>3.4 Status da Fila:</p>
              <p style={{ color: theme.textMuted }}>
                Estados configuráveis que identificam a situação atual do veículo 
                (ex: Aguardando, Em Operação, Indisponível). Status podem ser customizados por empresa.
              </p>
            </div>
            <div>
              <p className="font-semibold" style={{ color: theme.text }}>3.5 Posição FIFO:</p>
              <p style={{ color: theme.textMuted }}>
                Ordem sequencial calculada automaticamente baseada na data/hora de entrada na fila. 
                Veículos que entraram primeiro têm prioridade na alocação.
              </p>
            </div>
          </div>
        </section>

        {/* 4. Responsabilidades */}
        <section>
          <h3 className="text-lg font-bold mb-3 flex items-center gap-2" style={{ color: theme.text }}>
            <span className="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">4</span>
            RESPONSABILIDADES
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex gap-3">
              <p className="font-semibold w-48" style={{ color: theme.text }}>Motorista:</p>
              <p style={{ color: theme.textMuted }}>
                Realizar check-in na fila através do app externo quando veículo estiver vazio, 
                manter dados cadastrais atualizados e aguardar contato para alocação.
              </p>
            </div>
            <div className="flex gap-3">
              <p className="font-semibold w-48" style={{ color: theme.text }}>Coordenador de Expedição:</p>
              <p style={{ color: theme.textMuted }}>
                Monitorar a fila em tempo real, alocar veículos conforme disponibilidade e necessidade, 
                gerenciar status e prioridades.
              </p>
            </div>
            <div className="flex gap-3">
              <p className="font-semibold w-48" style={{ color: theme.text }}>Operador Logístico:</p>
              <p style={{ color: theme.textMuted }}>
                Vincular senha da fila à ordem de carregamento, atualizar status do veículo 
                conforme avanço da operação.
              </p>
            </div>
            <div className="flex gap-3">
              <p className="font-semibold w-48" style={{ color: theme.text }}>Gestor de Operações:</p>
              <p style={{ color: theme.textMuted }}>
                Monitorar tempo médio de espera, taxa de utilização da fila e garantir 
                equilíbrio entre oferta e demanda de veículos.
              </p>
            </div>
          </div>
        </section>

        {/* 5. Procedimento - Check-in do Motorista */}
        <section>
          <h3 className="text-lg font-bold mb-3 flex items-center gap-2" style={{ color: theme.text }}>
            <span className="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">5</span>
            PROCEDIMENTO - CHECK-IN NA FILA (Motorista)
          </h3>

          <div className="space-y-3">
            <div className="flex gap-3">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                1
              </div>
              <div className="flex-1">
                <p className="font-semibold text-sm mb-1" style={{ color: theme.text }}>Acessar Link da Fila</p>
                <p className="text-xs" style={{ color: theme.textMuted }}>
                  Acesse o link fornecido pela transportadora (ex: logiflow.com.br/FilaMotorista?codigo=XXXX). 
                  O link contém código de acesso único da empresa para segurança.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                2
              </div>
              <div className="flex-1">
                <p className="font-semibold text-sm mb-1" style={{ color: theme.text }}>Informar Telefone Celular</p>
                <p className="text-xs mb-2" style={{ color: theme.textMuted }}>
                  Digite seu número de celular com DDD (11 dígitos). O sistema verifica automaticamente 
                  se você já possui cadastro e preenche dados automaticamente.
                </p>
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-300 dark:border-green-700 rounded p-2">
                  <p className="text-xs text-green-800 dark:text-green-300">
                    ✓ Se cadastrado: Dados carregados automaticamente (nome, placa, tipo de veículo)
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                3
              </div>
              <div className="flex-1">
                <p className="font-semibold text-sm mb-1" style={{ color: theme.text }}>Preencher Dados Obrigatórios</p>
                <p className="text-xs mb-2" style={{ color: theme.textMuted }}>
                  Sistema apresenta wizard em 4 etapas:
                </p>
                <ul className="text-xs space-y-1 ml-4 list-disc" style={{ color: theme.textMuted }}>
                  <li><strong>Passo 1:</strong> Nome completo do motorista</li>
                  <li><strong>Passo 2:</strong> Placa do cavalo (7 caracteres alfanuméricos)</li>
                  <li><strong>Passo 3:</strong> Tipo do motorista (Frota/Acionista/Terceiro), Tipo de veículo e Tipo de carroceria</li>
                  <li><strong>Passo 4:</strong> Upload de comprovante de descarga (foto validada por IA)</li>
                  <li><strong>Passo 5:</strong> Localização atual (obtida via GPS do celular)</li>
                </ul>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                4
              </div>
              <div className="flex-1">
                <p className="font-semibold text-sm mb-1" style={{ color: theme.text }}>Validação de Comprovante</p>
                <p className="text-xs mb-2" style={{ color: theme.textMuted }}>
                  O sistema utiliza IA para validar o comprovante de descarga:
                </p>
                <ul className="text-xs space-y-1 ml-4 list-disc" style={{ color: theme.textMuted }}>
                  <li>Verifica se a imagem está legível</li>
                  <li>Identifica se contém uma data visível</li>
                  <li>Confirma se é um comprovante de descarga válido</li>
                  <li>Se inválido, solicita nova foto</li>
                </ul>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                5
              </div>
              <div className="flex-1">
                <p className="font-semibold text-sm mb-1" style={{ color: theme.text }}>Confirmação de Check-in</p>
                <p className="text-xs mb-2" style={{ color: theme.textMuted }}>
                  Sistema gera automaticamente:
                </p>
                <ul className="text-xs space-y-1 ml-4 list-disc" style={{ color: theme.textMuted }}>
                  <li><strong>Senha única</strong> de 4 caracteres alfanuméricos</li>
                  <li><strong>Posição na fila</strong> calculada automaticamente (FIFO)</li>
                  <li><strong>Timestamp</strong> de entrada</li>
                  <li><strong>Status inicial:</strong> "Aguardando"</li>
                </ul>
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-300 dark:border-blue-700 rounded p-2 mt-2">
                  <p className="text-xs text-blue-800 dark:text-blue-300">
                    💡 O motorista visualiza sua posição, senha e tempo de espera em tempo real.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 6. Procedimento - Gestão da Fila (Operador) */}
        <section>
          <h3 className="text-lg font-bold mb-3 flex items-center gap-2" style={{ color: theme.text }}>
            <span className="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">6</span>
            PROCEDIMENTO - GESTÃO DA FILA (Operador/Coordenador)
          </h3>

          <div className="space-y-3">
            <div className="flex gap-3">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                1
              </div>
              <div className="flex-1">
                <p className="font-semibold text-sm mb-1" style={{ color: theme.text }}>Acessar Módulo Fila X</p>
                <p className="text-xs" style={{ color: theme.textMuted }}>
                  Navegue até: <strong>Operações → Fila X</strong>
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                2
              </div>
              <div className="flex-1">
                <p className="font-semibold text-sm mb-1" style={{ color: theme.text }}>Visualizações Disponíveis</p>
                <div className="text-xs space-y-2" style={{ color: theme.textMuted }}>
                  <div className="flex gap-2">
                    <p className="font-semibold">• Tabela:</p>
                    <p>Lista completa com filtros por status, tipo de fila, período</p>
                  </div>
                  <div className="flex gap-2">
                    <p className="font-semibold">• Kanban:</p>
                    <p>Cards organizados por status (Aguardando, Em Operação, Indisponível) com drag-and-drop</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                3
              </div>
              <div className="flex-1">
                <p className="font-semibold text-sm mb-1" style={{ color: theme.text }}>Alocar Veículo a uma Ordem</p>
                <p className="text-xs mb-2" style={{ color: theme.textMuted }}>
                  Para vincular um veículo da fila a uma ordem de carregamento:
                </p>
                <ol className="text-xs space-y-1 ml-4 list-decimal" style={{ color: theme.textMuted }}>
                  <li>Identifique o veículo disponível compatível com a carga (tipo de veículo, carroceria)</li>
                  <li>Copie a <strong>senha da fila</strong> (4 caracteres exibidos no card)</li>
                  <li>Acesse a ordem de carregamento que receberá o veículo</li>
                  <li>Cole a senha no campo "Senha Fila"</li>
                  <li>Sistema vincula automaticamente motorista e veículo à ordem</li>
                  <li>Status do veículo na fila é atualizado conforme configuração</li>
                </ol>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                4
              </div>
              <div className="flex-1">
                <p className="font-semibold text-sm mb-1" style={{ color: theme.text }}>Gerenciar Status dos Veículos</p>
                <p className="text-xs mb-2" style={{ color: theme.textMuted }}>
                  <strong>Via Drag-and-Drop (Kanban):</strong> Arraste o card do veículo para a coluna do novo status.
                </p>
                <p className="text-xs mb-2" style={{ color: theme.textMuted }}>
                  <strong>Via Menu de Ações:</strong> Clique nos 3 pontos e selecione o novo status.
                </p>
                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-300 dark:border-amber-700 rounded p-2 mt-2">
                  <p className="text-xs text-amber-800 dark:text-amber-300">
                    ⚠️ Status que têm a flag "remove_da_fila = true" marcam data de saída automaticamente 
                    e removem o veículo da contagem ativa.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                5
              </div>
              <div className="flex-1">
                <p className="font-semibold text-sm mb-1" style={{ color: theme.text }}>Recálculo Automático de Posições</p>
                <p className="text-xs" style={{ color: theme.textMuted }}>
                  O sistema recalcula automaticamente as posições FIFO sempre que:
                </p>
                <ul className="text-xs space-y-1 ml-4 list-disc" style={{ color: theme.textMuted }}>
                  <li>Um novo veículo entra na fila (check-in)</li>
                  <li>Um veículo sai da fila (alocação ou remoção)</li>
                  <li>Status de um veículo é alterado</li>
                </ul>
                <p className="text-xs mt-2" style={{ color: theme.textMuted }}>
                  Apenas veículos ATIVOS (sem data_saida_fila) são considerados no cálculo.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 7. Regras de Negócio */}
        <section>
          <h3 className="text-lg font-bold mb-3 flex items-center gap-2" style={{ color: theme.text }}>
            <span className="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">7</span>
            REGRAS DE NEGÓCIO E VALIDAÇÕES
          </h3>
          <div className="space-y-2 text-sm">
            <div>
              <p className="font-semibold" style={{ color: theme.text }}>7.1 Validações no Check-in:</p>
              <ul className="list-disc list-inside ml-4 space-y-1 text-xs" style={{ color: theme.textMuted }}>
                <li>Telefone deve ter 11 dígitos (DDD + número)</li>
                <li>Placa deve ter 7 caracteres alfanuméricos</li>
                <li>Veículo deve estar VAZIO (confirmação obrigatória)</li>
                <li>Comprovante de descarga é obrigatório e validado por IA</li>
                <li>Localização GPS deve ser obtida para registro de cidade/UF</li>
                <li>Não permitir duplicação de telefone ativo na mesma empresa</li>
              </ul>
            </div>
            
            <div>
              <p className="font-semibold" style={{ color: theme.text }}>7.2 Geração de Senha:</p>
              <ul className="list-disc list-inside ml-4 space-y-1 text-xs" style={{ color: theme.textMuted }}>
                <li>Sistema gera código alfanumérico único de 4 caracteres</li>
                <li>Verifica unicidade dentro da empresa (máximo 50 tentativas)</li>
                <li>Fallback: usa timestamp se não conseguir gerar senha única</li>
              </ul>
            </div>

            <div>
              <p className="font-semibold" style={{ color: theme.text }}>7.3 Cálculo de Posição FIFO:</p>
              <ul className="list-disc list-inside ml-4 space-y-1 text-xs" style={{ color: theme.textMuted }}>
                <li>Posição = (quantidade de veículos ativos na frente) + 1</li>
                <li>Considera apenas veículos sem data_saida_fila</li>
                <li>Ordenação por data_entrada_fila (mais antigo primeiro)</li>
                <li>Recálculo automático após qualquer alteração</li>
              </ul>
            </div>

            <div>
              <p className="font-semibold" style={{ color: theme.text }}>7.4 Bloqueio de Veículos Carregados:</p>
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-300 dark:border-red-700 rounded p-3 mt-2">
                <p className="text-xs text-red-800 dark:text-red-300 font-semibold">
                  ⚠️ REGRA CRÍTICA: Apenas veículos VAZIOS podem fazer check-in na fila.
                </p>
                <p className="text-xs text-red-700 dark:text-red-400 mt-1">
                  Veículos carregados que marcarem placa podem ser bloqueados pelo sistema. 
                  O motorista deve confirmar explicitamente que o veículo está vazio antes de continuar.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 8. Tipos e Status */}
        <section>
          <h3 className="text-lg font-bold mb-3 flex items-center gap-2" style={{ color: theme.text }}>
            <span className="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">8</span>
            CONFIGURAÇÕES
          </h3>
          
          <div className="mb-4">
            <h4 className="font-bold text-base mb-3" style={{ color: theme.text }}>
              8.1 Tipos de Fila Configuráveis
            </h4>
            <p className="text-xs mb-2" style={{ color: theme.textMuted }}>
              Cada empresa pode configurar seus próprios tipos de fila (ex: Frota, Acionista, Agregado, Terceiro).
            </p>
            <Card style={{ backgroundColor: isDark ? '#0f172a' : '#f9fafb', borderColor: theme.cardBorder }}>
              <CardContent className="p-3">
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <p className="font-semibold mb-1" style={{ color: theme.text }}>Campos do Tipo:</p>
                    <ul className="list-disc ml-4" style={{ color: theme.textMuted }}>
                      <li>Nome (ex: "Frota")</li>
                      <li>Cor para identificação visual</li>
                      <li>Ordem de exibição</li>
                      <li>Status ativo/inativo</li>
                    </ul>
                  </div>
                  <div>
                    <p className="font-semibold mb-1" style={{ color: theme.text }}>Configuração:</p>
                    <p style={{ color: theme.textMuted }}>
                      Acesse: <strong>Fila X → Gerenciar Tipos</strong> para criar, editar ou desativar tipos.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="mb-4">
            <h4 className="font-bold text-base mb-3" style={{ color: theme.text }}>
              8.2 Status da Fila Configuráveis
            </h4>
            <p className="text-xs mb-2" style={{ color: theme.textMuted }}>
              Status personalizados para gerenciar o ciclo de vida do veículo na fila.
            </p>
            <Card style={{ backgroundColor: isDark ? '#0f172a' : '#f9fafb', borderColor: theme.cardBorder }}>
              <CardContent className="p-3">
                <div className="text-xs space-y-2">
                  <div>
                    <p className="font-semibold mb-1" style={{ color: theme.text }}>Campos do Status:</p>
                    <ul className="list-disc ml-4 space-y-1" style={{ color: theme.textMuted }}>
                      <li><strong>Nome:</strong> Ex: "Aguardando", "Em Operação", "Indisponível"</li>
                      <li><strong>Cor:</strong> Identificação visual em hexadecimal</li>
                      <li><strong>Ícone:</strong> Emoji para representação</li>
                      <li><strong>Remove da fila:</strong> Se true, marca data de saída automaticamente</li>
                      <li><strong>Mover quando vinculado:</strong> Se true, aplica este status ao vincular senha a uma ordem</li>
                      <li><strong>Aplicar ao sair:</strong> Se true, status usado quando motorista clica "Sair da Fila" no app</li>
                      <li><strong>Ordem de exibição</strong></li>
                    </ul>
                  </div>
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-300 dark:border-blue-700 rounded p-2">
                    <p className="text-xs text-blue-800 dark:text-blue-300">
                      💡 <strong>Configuração:</strong> Acesse <strong>Fila X → Gerenciar Status</strong> para personalizar.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* 9. Boas Práticas */}
        <section>
          <h3 className="text-lg font-bold mb-3 flex items-center gap-2" style={{ color: theme.text }}>
            <span className="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">9</span>
            BOAS PRÁTICAS
          </h3>
          <div className="space-y-3 text-sm" style={{ color: theme.textMuted }}>
            <div>
              <p className="font-semibold mb-1" style={{ color: theme.text }}>✅ Para Motoristas:</p>
              <ul className="list-disc ml-6 space-y-1 text-xs">
                <li>Faça check-in apenas quando o veículo estiver completamente vazio</li>
                <li>Mantenha seus dados cadastrais atualizados para agilizar futuras marcações</li>
                <li>Tire foto clara do comprovante de descarga (legível, com data visível)</li>
                <li>Aguarde contato da central - não ligue perguntando posição</li>
                <li>Clique "Atualizar" para ver sua posição em tempo real</li>
                <li>Use o botão "Ajuda" em cada campo se tiver dúvidas</li>
              </ul>
            </div>

            <div>
              <p className="font-semibold mb-1" style={{ color: theme.text }}>✅ Para Operadores:</p>
              <ul className="list-disc ml-6 space-y-1 text-xs">
                <li>Priorize veículos por posição FIFO quando houver múltiplas opções compatíveis</li>
                <li>Vincule senha da fila à ordem ANTES de comunicar motorista (evita confusão)</li>
                <li>Atualize status do veículo conforme progresso da operação</li>
                <li>Use filtros para encontrar rapidamente veículos específicos (tipo, localização)</li>
                <li>Monitore tempo de espera médio para evitar acúmulo excessivo na fila</li>
                <li>Archive veículos inativos regularmente para manter fila organizada</li>
              </ul>
            </div>

            <div>
              <p className="font-semibold mb-1" style={{ color: theme.text }}>✅ Para Gestores:</p>
              <ul className="list-disc ml-6 space-y-1 text-xs">
                <li>Configure tipos de fila conforme sua operação (Frota, Acionista, etc.)</li>
                <li>Personalize status para refletir seu workflow real</li>
                <li>Monitore tempo médio de permanência na fila (meta: ≤ 4 horas)</li>
                <li>Analise taxa de utilização (veículos alocados vs total na fila)</li>
                <li>Compartilhe link de check-in via WhatsApp, SMS ou impresso</li>
                <li>Configure número de celular de suporte nas Configurações para ajuda aos motoristas</li>
              </ul>
            </div>
          </div>
        </section>

        {/* 10. Indicadores */}
        <section>
          <h3 className="text-lg font-bold mb-3 flex items-center gap-2" style={{ color: theme.text }}>
            <span className="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">10</span>
            INDICADORES DE DESEMPENHO
          </h3>
          <div className="grid grid-cols-3 gap-3">
            <Card style={{ backgroundColor: isDark ? '#0f172a' : '#f9fafb', borderColor: theme.cardBorder }}>
              <CardContent className="p-3 text-center">
                <p className="text-xs font-semibold mb-1" style={{ color: theme.text }}>Tempo Médio de Espera</p>
                <p className="text-xs" style={{ color: theme.textMuted }}>
                  Média de tempo entre entrada e alocação
                </p>
                <p className="text-xs font-bold text-green-600 mt-1">Meta: ≤ 4h</p>
              </CardContent>
            </Card>
            <Card style={{ backgroundColor: isDark ? '#0f172a' : '#f9fafb', borderColor: theme.cardBorder }}>
              <CardContent className="p-3 text-center">
                <p className="text-xs font-semibold mb-1" style={{ color: theme.text }}>Taxa de Utilização</p>
                <p className="text-xs" style={{ color: theme.textMuted }}>
                  (Veículos Alocados / Total na Fila) × 100
                </p>
                <p className="text-xs font-bold text-green-600 mt-1">Meta: ≥ 85%</p>
              </CardContent>
            </Card>
            <Card style={{ backgroundColor: isDark ? '#0f172a' : '#f9fafb', borderColor: theme.cardBorder }}>
              <CardContent className="p-3 text-center">
                <p className="text-xs font-semibold mb-1" style={{ color: theme.text }}>Check-ins Válidos</p>
                <p className="text-xs" style={{ color: theme.textMuted }}>
                  % de check-ins aprovados sem bloqueio
                </p>
                <p className="text-xs font-bold text-green-600 mt-1">Meta: ≥ 98%</p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* 11. Fluxograma */}
        <section>
          <h3 className="text-lg font-bold mb-3 flex items-center gap-2" style={{ color: theme.text }}>
            <span className="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">11</span>
            FLUXOGRAMA DO PROCESSO
          </h3>
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
          <h3 className="text-lg font-bold mb-3 flex items-center gap-2" style={{ color: theme.text }}>
            <span className="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">12</span>
            SISTEMA DE AJUDA INTEGRADO
          </h3>
          <p className="text-sm mb-3" style={{ color: theme.textMuted }}>
            O app de marcação possui botões de ajuda em cada campo que permitem comunicação direta com a central via WhatsApp.
          </p>
          <div className="space-y-2 text-sm">
            <div>
              <p className="font-semibold" style={{ color: theme.text }}>12.1 Configuração:</p>
              <p className="text-xs ml-4" style={{ color: theme.textMuted }}>
                Acesse <strong>Configurações → Dados da Empresa</strong> e informe o "Celular de Suporte (WhatsApp)". 
                Este número será usado nos botões de ajuda do app externo.
              </p>
            </div>
            <div>
              <p className="font-semibold" style={{ color: theme.text }}>12.2 Funcionamento:</p>
              <p className="text-xs ml-4 mb-2" style={{ color: theme.textMuted }}>
                Quando o motorista clica no botão "Ajuda", o sistema:
              </p>
              <ul className="list-disc list-inside ml-8 text-xs space-y-1" style={{ color: theme.textMuted }}>
                <li>Abre conversa no WhatsApp com o número configurado</li>
                <li>Preenche mensagem automática informando a tela onde está tendo dificuldade</li>
                <li>Permite que operador preste suporte em tempo real</li>
              </ul>
            </div>
          </div>
        </section>

        {/* 13. Documentos Relacionados */}
        <section>
          <h3 className="text-lg font-bold mb-3 flex items-center gap-2" style={{ color: theme.text }}>
            <span className="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">13</span>
            DOCUMENTOS RELACIONADOS
          </h3>
          <ul className="list-disc list-inside text-sm space-y-1 ml-4" style={{ color: theme.textMuted }}>
            <li>PO-LOG-001 - Procedimento Operacional de Gestão de Transportes</li>
            <li>IT-LOG-001 - Instrução de Trabalho para Gestão de Ordens de Carregamento</li>
            <li>IT-LOG-002 - Instrução de Trabalho para Tracking e Rastreamento</li>
            <li>Manual do Sistema Log Flow (MAN-LOG-001)</li>
          </ul>
        </section>

        {/* 14. Anexos */}
        <section>
          <h3 className="text-lg font-bold mb-3 flex items-center gap-2" style={{ color: theme.text }}>
            <span className="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">14</span>
            ANEXOS
          </h3>
          <p className="text-sm" style={{ color: theme.textMuted }}>
            Anexo A - Fluxograma Detalhado do Processo de Check-in<br/>
            Anexo B - Tabela de Tipos de Veículo e Carroceria Padronizados<br/>
            Anexo C - Exemplos de Configuração de Status Customizados<br/>
            Anexo D - Tutorial Visual do App de Marcação (Motorista)
          </p>
        </section>

        {/* Rodapé */}
        <div className="border-t pt-4 mt-8 text-xs text-center" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>
          <p>Este documento é propriedade da empresa e não deve ser reproduzido sem autorização.</p>
          <p className="mt-1">Controlado eletronicamente - A versão impressa é considerada cópia não controlada.</p>
        </div>
      </CardContent>
    </Card>
  );
}