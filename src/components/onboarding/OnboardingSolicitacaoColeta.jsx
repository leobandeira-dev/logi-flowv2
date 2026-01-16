import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { X, ChevronRight, ArrowRight, CheckCircle } from "lucide-react";

export default function OnboardingSolicitacaoColeta({ open, onClose, currentAction = null }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [position, setPosition] = useState({ top: 0, left: 0 });

  // Define os passos do tour guiado
  const steps = [
    {
      title: "Bem-vindo à Solicitação de Coleta! 🚚",
      content: "Aqui você pode solicitar coletas ao operador logístico de forma rápida e prática. Clique no botão 'Nova Solicitação' no canto superior direito da tela para começar.",
      target: null,
      action: "start"
    },
    {
      title: "Métodos de Entrada de Notas Fiscais 📋",
      content: "Você tem 3 opções para adicionar notas fiscais: Manual (digite os dados), Upload XML (arraste arquivos), ou Importação Avançada (cole a chave de 44 dígitos).",
      target: "metodo-entrada",
      action: "select_method"
    },
    {
      title: "Dados da Nota Fiscal 📝",
      content: "Informe o número da nota fiscal, peso total, valor e quantidade de volumes. Esses dados são essenciais para o cálculo do frete.",
      target: "dados-nota",
      action: "fill_nota"
    },
    {
      title: "Dimensões dos Volumes 📏",
      content: "As dimensões (altura, largura e comprimento) são obrigatórias para: garantir envio do veículo adequado, planejamento logístico e evitar retrabalho. Use o botão 'Repetir' para volumes iguais!",
      target: "dimensoes-volumes",
      action: "fill_dimensions"
    },
    {
      title: "Campo de Observações 📝",
      content: "Informe horário de funcionamento, regras de acesso, restrições e contato no local. Ex: 'Coleta 8h-12h', 'Necessário agendamento', 'Proibido caminhões >14m'. Quanto mais detalhes, mais eficiente!",
      target: "observacoes",
      action: "fill_obs"
    },
    {
      title: "Enviar Solicitação 📤",
      content: "Revise todos os dados e clique em 'Enviar Solicitação'. Sua coleta ficará pendente de aprovação e você poderá acompanhar o status na tabela 'Minhas Solicitações' abaixo.",
      target: "botao-enviar",
      action: "submit"
    },
    {
      title: "Pronto! 🎉",
      content: "Você completou o tour! Agora sabe criar solicitações, informar dimensões e acompanhar o status. Você pode rever este tutorial clicando no botão '❓ Ajuda'.",
      target: null,
      action: "complete"
    }
  ];

  // Atualizar posição do tooltip quando o target muda
  useEffect(() => {
    if (!open) return;
    
    const step = steps[currentStep];
    if (step.target) {
      const element = document.querySelector(`[data-tour="${step.target}"]`);
      if (element) {
        const rect = element.getBoundingClientRect();
        setPosition({
          top: rect.top + window.scrollY - 140,
          left: rect.left + window.scrollX + rect.width / 2
        });
        
        // Destacar elemento
        element.classList.add('tour-highlight');
        
        return () => {
          element.classList.remove('tour-highlight');
        };
      }
    }
  }, [currentStep, open]);

  // Avançar automaticamente quando currentAction corresponde ao step.action
  useEffect(() => {
    if (currentAction && steps[currentStep]?.action === currentAction) {
      handleNext();
    }
  }, [currentAction]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleClose();
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

  if (!open) return null;

  const step = steps[currentStep];
  const isPositioned = step.target && position.top > 0;

  return (
    <>
      {/* Overlay escuro */}
      <div 
        className="fixed inset-0 bg-black/60 z-[100] transition-opacity"
        onClick={handleSkip}
      />

      {/* Tooltip guiado */}
      <div
        className="fixed z-[101] transition-all duration-300"
        style={
          isPositioned
            ? {
                top: `${position.top}px`,
                left: `${position.left}px`,
                transform: 'translateX(-50%)',
              }
            : {
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
              }
        }
      >
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-2xl p-6 max-w-md border-2 border-blue-600">
          <button
            onClick={handleSkip}
            className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="mb-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
              {step.title}
            </h3>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              {step.content}
            </p>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {currentStep + 1} de {steps.length}
            </span>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleSkip}
                size="sm"
                className="text-xs"
              >
                Pular
              </Button>
              
              {currentStep === steps.length - 1 ? (
                <Button
                  onClick={handleClose}
                  size="sm"
                  className="bg-green-600 hover:bg-green-700 text-white gap-2 text-xs"
                >
                  <CheckCircle className="w-4 h-4" />
                  Concluir
                </Button>
              ) : (
                <Button
                  onClick={handleNext}
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700 text-white gap-2 text-xs"
                >
                  Próximo
                  <ArrowRight className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>

          <div className="flex gap-1 mt-4">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`h-1 flex-1 rounded-full transition-all ${
                  index <= currentStep ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Seta apontando para o elemento */}
        {isPositioned && (
          <div className="absolute left-1/2 -translate-x-1/2 -bottom-3 w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-t-[12px] border-t-blue-600" />
        )}
      </div>

      {/* Estilos para highlight */}
      <style jsx global>{`
        .tour-highlight {
          position: relative;
          z-index: 102 !important;
          box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.5), 0 0 0 9999px rgba(0, 0, 0, 0.6) !important;
          border-radius: 8px;
          animation: pulse-highlight 2s infinite;
        }
        
        @keyframes pulse-highlight {
          0%, 100% {
            box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.5), 0 0 0 9999px rgba(0, 0, 0, 0.6);
          }
          50% {
            box-shadow: 0 0 0 8px rgba(59, 130, 246, 0.3), 0 0 0 9999px rgba(0, 0, 0, 0.6);
          }
        }
      `}</style>
    </>
  );
}