import React, { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X, ChevronRight, ChevronLeft, CheckCircle } from "lucide-react";

export default function OnboardingSolicitacaoColeta({ open, onClose }) {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      title: "Bem-vindo à Solicitação de Coleta! 🚚",
      content: (
        <div className="space-y-4">
          <p className="text-base">
            Aqui você pode solicitar coletas ao operador logístico de forma rápida e prática.
          </p>
          <div className="bg-blue-600 dark:bg-blue-700 p-4 rounded-lg border border-blue-500 dark:border-blue-600">
            <p className="text-sm font-semibold mb-2 text-white">Para começar:</p>
            <p className="text-sm text-white">
              Clique no botão <span className="font-bold text-orange-300">"Nova Solicitação"</span> no canto superior direito da tela.
            </p>
          </div>
          <div className="flex justify-center py-4">
            <div className="bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold shadow-lg">
              + Nova Solicitação
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Métodos de Entrada de Notas Fiscais 📋",
      content: (
        <div className="space-y-4">
          <p className="text-base mb-4">Você tem <strong>3 opções</strong> para adicionar notas fiscais:</p>
          
          <div className="space-y-3">
            <div className="border-2 border-blue-300 rounded-lg p-4 bg-white dark:bg-gray-50 shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">1</div>
                <h4 className="font-semibold text-base text-gray-900">Manual</h4>
              </div>
              <p className="text-sm text-gray-700 ml-11">
                Crie a ordem digitando os dados manualmente
              </p>
            </div>

            <div className="border-2 border-blue-300 rounded-lg p-4 bg-white dark:bg-gray-50 shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">2</div>
                <h4 className="font-semibold text-base text-gray-900">Upload XML</h4>
              </div>
              <p className="text-sm text-gray-700 ml-11">
                Arraste ou selecione arquivos XML das notas fiscais
              </p>
            </div>

            <div className="border-2 border-blue-300 rounded-lg p-4 bg-white dark:bg-gray-50 shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">3</div>
                <h4 className="font-semibold text-base text-gray-900">Importação Avançada</h4>
              </div>
              <p className="text-sm text-gray-700 ml-11">
                Cole ou escaneie a chave de acesso da NF-e (44 dígitos)
              </p>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Entrada Manual Completa 📝",
      content: (
        <div className="space-y-4">
          <p className="text-base">
            No modo <strong>manual</strong>, você pode criar uma solicitação do zero:
          </p>
          
          <div className="space-y-3">
            <div className="bg-white dark:bg-gray-50 p-4 rounded-lg border-2 border-orange-400 shadow-sm">
              <p className="text-sm font-semibold mb-3 text-orange-900">✏️ Você deve informar:</p>
              <ul className="text-sm space-y-2 ml-5 list-disc text-gray-900">
                <li>Número da nota fiscal, peso e valor</li>
                <li>Quantidade de volumes</li>
                <li>Dimensões de cada volume (altura, largura, comprimento)</li>
                <li>CNPJ do emitente (remetente)</li>
                <li>CNPJ do destinatário</li>
              </ul>
            </div>

            <div className="bg-blue-50 dark:bg-blue-50 p-3 rounded-lg border-2 border-blue-400">
              <p className="text-sm text-blue-900">
                💡 <strong>Dica:</strong> Ao digitar o CNPJ, o sistema preenche automaticamente a razão social e endereço!
              </p>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Dimensões: Por que são importantes? 📏",
      content: (
        <div className="space-y-4">
          <div className="bg-orange-50 dark:bg-orange-100 p-4 rounded-lg border-2 border-orange-400">
            <p className="text-base font-bold text-orange-900 mb-2">
              ⚠️ Informação Crítica
            </p>
            <p className="text-sm text-gray-900">
              As dimensões (altura, largura e comprimento) de cada volume são <strong>obrigatórias</strong> e essenciais para:
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-start gap-3 p-3 bg-white dark:bg-gray-50 rounded-lg border-2 border-blue-200">
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">1</div>
              <div>
                <p className="text-sm font-semibold text-gray-900">Envio do veículo adequado</p>
                <p className="text-xs text-gray-700">Garantir que o caminhão tenha capacidade suficiente</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-white dark:bg-gray-50 rounded-lg border-2 border-blue-200">
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">2</div>
              <div>
                <p className="text-sm font-semibold text-gray-900">Planejamento logístico</p>
                <p className="text-xs text-gray-700">Otimizar rotas e consolidação de cargas</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-white dark:bg-gray-50 rounded-lg border-2 border-blue-200">
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">3</div>
              <div>
                <p className="text-sm font-semibold text-gray-900">Evitar retrabalho</p>
                <p className="text-xs text-gray-700">Prevenir problemas no dia da coleta</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-50 p-3 rounded-lg border-2 border-blue-400">
            <p className="text-sm text-blue-900">
              💡 <strong>Dica:</strong> Use o botão "Repetir" para replicar dimensões iguais em vários volumes!
            </p>
          </div>
        </div>
      )
    },
    {
      title: "Campo de Observações 📝",
      content: (
        <div className="space-y-4">
          <p className="text-base">
            O campo de <strong>observações</strong> é muito importante para comunicar detalhes específicos da coleta:
          </p>

          <div className="bg-white dark:bg-gray-50 p-4 rounded-lg border-2 border-orange-400">
          <p className="text-sm font-semibold mb-3 text-orange-900">📌 Informe sempre que houver:</p>

          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-3 bg-gray-50 dark:bg-white p-2 rounded">
              <span className="text-base">🕐</span>
              <div>
                <p className="font-semibold text-gray-900">Horário de funcionamento</p>
                <p className="text-xs text-gray-700">Ex: "Coleta entre 8h-12h e 14h-18h"</p>
              </div>
            </div>

            <div className="flex items-start gap-3 bg-gray-50 dark:bg-white p-2 rounded">
              <span className="text-base">🚪</span>
              <div>
                <p className="font-semibold text-gray-900">Regras de acesso</p>
                <p className="text-xs text-gray-700">Ex: "Necessário agendamento prévio no portão"</p>
              </div>
            </div>

            <div className="flex items-start gap-3 bg-gray-50 dark:bg-white p-2 rounded">
              <span className="text-base">⚠️</span>
              <div>
                <p className="font-semibold text-gray-900">Restrições</p>
                <p className="text-xs text-gray-700">Ex: "Proibido caminhões acima de 14m", "Não recebe finais de semana"</p>
              </div>
            </div>

            <div className="flex items-start gap-3 bg-gray-50 dark:bg-white p-2 rounded">
              <span className="text-base">📞</span>
              <div>
                <p className="font-semibold text-gray-900">Contato no local</p>
                <p className="text-xs text-gray-700">Ex: "Contato responsável: João (11) 99999-9999"</p>
              </div>
            </div>
          </div>
          </div>

          <div className="bg-blue-50 dark:bg-blue-50 p-3 rounded-lg border-2 border-blue-400">
          <p className="text-sm text-blue-900">
            💡 Quanto mais detalhes você fornecer, mais eficiente será a coleta!
          </p>
          </div>
        </div>
      )
    },
    {
      title: "Acompanhamento e Aprovação 📊",
      content: (
        <div className="space-y-4">
          <p className="text-base mb-4">
            Após enviar sua solicitação, você pode <strong>acompanhar o status</strong>:
          </p>

          <div className="bg-gray-50 dark:bg-gray-50 p-4 rounded-lg border-2 border-gray-300 shadow-sm">
            <p className="text-sm font-semibold mb-3 text-gray-900">📋 Tabela "Minhas Solicitações"</p>
            <p className="text-sm text-gray-700 mb-3">
              Localizada abaixo do formulário, mostra todas as suas coletas com informações detalhadas
            </p>
            
            <div className="bg-white p-2 rounded text-xs font-mono border border-gray-300 text-gray-900">
              Nº Coleta | Status | Destinatário | Motorista | ...
            </div>
          </div>

          <div className="space-y-3">
            <div className="bg-orange-50 dark:bg-orange-50 p-3 rounded-lg border-2 border-orange-300">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 rounded bg-orange-600 flex items-center justify-center">
                  <span className="text-white text-xs font-bold">1</span>
                </div>
                <p className="text-sm font-semibold text-gray-900">Pendente</p>
              </div>
              <p className="text-sm text-gray-800">
                Sua solicitação foi enviada e está <strong>aguardando aprovação</strong> do operador logístico
              </p>
            </div>

            <div className="bg-green-50 dark:bg-green-50 p-3 rounded-lg border-2 border-green-400">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 rounded bg-green-600 flex items-center justify-center">
                  <span className="text-white text-xs font-bold">2</span>
                </div>
                <p className="text-sm font-semibold text-gray-900">Aprovada</p>
              </div>
              <p className="text-sm text-gray-800">
                Coleta aprovada! O operador entrará em contato para <strong>agendar a data</strong> da coleta
              </p>
            </div>

            <div className="bg-blue-50 dark:bg-blue-50 p-3 rounded-lg border-2 border-blue-400">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 rounded bg-blue-600 flex items-center justify-center">
                  <span className="text-white text-xs font-bold">3</span>
                </div>
                <p className="text-sm font-semibold text-gray-900">Agendado</p>
              </div>
              <p className="text-sm text-gray-800">
                Você verá a <strong>data agendada</strong> e o <strong>motorista/veículo</strong> designado na tabela
              </p>
            </div>
          </div>

          <div className="bg-orange-50 dark:bg-orange-50 p-3 rounded-lg border-2 border-orange-400">
            <p className="text-sm text-orange-900">
              📧 <strong>Importante:</strong> Você também receberá notificações por email sobre mudanças de status!
            </p>
          </div>
        </div>
      )
    },
    {
      title: "Pronto para começar! 🎉",
      content: (
        <div className="space-y-4 text-center">
          <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-12 h-12 text-white" />
          </div>
          
          <p className="text-lg font-semibold">
            Você está pronto para solicitar coletas!
          </p>
          
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Agora você sabe como:
          </p>

          <div className="bg-gray-50 dark:bg-gray-50 p-4 rounded-lg border-2 border-gray-300 space-y-2 text-left">
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
              <span className="text-gray-900">Criar uma nova solicitação de coleta</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
              <span className="text-gray-900">Usar os 3 métodos de entrada de notas</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
              <span className="text-gray-900">Informar dimensões corretamente</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
              <span className="text-gray-900">Adicionar observações importantes</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
              <span className="text-gray-900">Acompanhar suas solicitações</span>
            </div>
          </div>

          <div className="bg-blue-50 dark:bg-blue-50 p-4 rounded-lg border-2 border-blue-400">
            <p className="text-sm text-blue-900">
              💡 Você pode rever este tutorial a qualquer momento clicando no botão "❓ Ajuda" na tela
            </p>
          </div>
        </div>
      )
    }
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleClose = () => {
    localStorage.setItem('onboarding_solicitacao_coleta_completed', 'true');
    onClose();
  };

  const handleSkip = () => {
    localStorage.setItem('onboarding_solicitacao_coleta_completed', 'true');
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="relative">
          <button
            onClick={handleSkip}
            className="absolute top-0 right-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-2">{steps[currentStep].title}</h2>
            <div className="flex gap-1">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={`h-1 flex-1 rounded-full transition-all ${
                    index <= currentStep ? 'bg-orange-600' : 'bg-gray-200 dark:bg-gray-700'
                  }`}
                />
              ))}
            </div>
          </div>

          <div className="mb-6">
            {steps[currentStep].content}
          </div>

          <div className="flex justify-between items-center">
            <Button
              variant="outline"
              onClick={handlePrev}
              disabled={currentStep === 0}
              className="gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              Anterior
            </Button>

            <span className="text-sm text-gray-500">
              {currentStep + 1} de {steps.length}
            </span>

            {currentStep === steps.length - 1 ? (
              <Button
                onClick={handleClose}
                className="bg-orange-600 hover:bg-orange-700 gap-2"
              >
                Começar
                <CheckCircle className="w-4 h-4" />
              </Button>
            ) : (
              <Button
                onClick={handleNext}
                className="bg-orange-600 hover:bg-orange-700 gap-2"
              >
                Próximo
                <ChevronRight className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}