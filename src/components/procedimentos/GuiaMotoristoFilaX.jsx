import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Truck, CheckCircle } from "lucide-react";

export function GuiaMotoristoFilaX({ theme, isDark }) {
  return (
    <Card style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}>
      <CardContent className="p-8">
        <div className="border-4 border-blue-600 rounded-lg p-6" style={{ backgroundColor: isDark ? '#1e293b' : '#ffffff' }}>
          {/* Header */}
          <div className="text-center mb-6 pb-4 border-b-2 border-blue-200">
            <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
              <Truck className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-xl font-bold mb-1" style={{ color: theme.text }}>
              COMO ENTRAR NA FILA X
            </h3>
            <p className="text-sm" style={{ color: theme.textMuted }}>
              Guia simples e rápido para motoristas
            </p>
          </div>

          {/* Pré-requisitos */}
          <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-500 rounded-lg p-4 mb-6">
            <p className="font-bold text-base mb-2 text-red-700 dark:text-red-400">⚠️ ANTES DE COMEÇAR - IMPORTANTE!</p>
            <div className="space-y-2 text-sm">
              <div className="flex items-start gap-2">
                <span className="text-red-600 font-bold text-lg">•</span>
                <p className="text-red-700 dark:text-red-400">
                  <strong>Seu veículo PRECISA estar VAZIO</strong> (sem carga)
                </p>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-red-600 font-bold text-lg">•</span>
                <p className="text-red-700 dark:text-red-400">
                  Tenha em mãos: <strong>Celular, Comprovante de descarga</strong> (foto da última entrega)
                </p>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-red-600 font-bold text-lg">•</span>
                <p className="text-red-700 dark:text-red-400">
                  Autorize <strong>localização GPS</strong> quando o celular pedir
                </p>
              </div>
            </div>
          </div>

          {/* Passo a Passo */}
          <div className="space-y-4 mb-6">
            <p className="font-bold text-base mb-3" style={{ color: theme.text }}>📋 PASSO A PASSO:</p>
            
            {/* Passo 1 */}
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                1
              </div>
              <div className="flex-1">
                <p className="font-bold text-sm mb-1" style={{ color: theme.text }}>Clique no link da empresa</p>
                <p className="text-xs" style={{ color: theme.textMuted }}>
                  Use o link que a transportadora enviou para você (WhatsApp, SMS ou papel)
                </p>
              </div>
            </div>

            {/* Passo 2 */}
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                2
              </div>
              <div className="flex-1">
                <p className="font-bold text-sm mb-1" style={{ color: theme.text }}>Digite seu telefone celular</p>
                <p className="text-xs mb-1" style={{ color: theme.textMuted }}>
                  Coloque com DDD: (11) 99999-9999
                </p>
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-400 rounded p-2 text-[10px] text-green-700 dark:text-green-400">
                  💡 Se você já fez cadastro antes, seus dados vão aparecer automaticamente!
                </div>
              </div>
            </div>

            {/* Passo 3 */}
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                3
              </div>
              <div className="flex-1">
                <p className="font-bold text-sm mb-1" style={{ color: theme.text }}>Preencha os dados pedidos</p>
                <div className="text-xs space-y-1" style={{ color: theme.textMuted }}>
                  <p>• <strong>Seu nome completo</strong></p>
                  <p>• <strong>Placa do cavalo</strong> (7 letras/números)</p>
                  <p>• <strong>Tipo do motorista:</strong> Frota, Acionista ou Terceiro</p>
                  <p>• <strong>Tipo do veículo:</strong> Carreta, Truck, etc.</p>
                  <p>• <strong>Tipo da carroceria:</strong> Sider, Baú, Prancha, etc.</p>
                </div>
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-400 rounded p-2 mt-2 text-[10px] text-blue-700 dark:text-blue-400">
                  🆘 Viu o botão "Ajuda" em cada campo? Clica lá se tiver dúvida! Vai abrir WhatsApp direto com o suporte.
                </div>
              </div>
            </div>

            {/* Passo 4 */}
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                4
              </div>
              <div className="flex-1">
                <p className="font-bold text-sm mb-1" style={{ color: theme.text }}>Tire foto do comprovante de descarga</p>
                <p className="text-xs mb-2" style={{ color: theme.textMuted }}>
                  Foto do canhoto, documento de entrega ou comprovante da última descarga
                </p>
                <div className="grid grid-cols-2 gap-2 text-[10px]">
                  <div className="bg-green-50 dark:bg-green-900/20 border border-green-400 rounded p-2">
                    <p className="font-bold text-green-700 dark:text-green-400 mb-1">✓ FOTO BOA:</p>
                    <p className="text-green-600 dark:text-green-500">• Bem iluminada</p>
                    <p className="text-green-600 dark:text-green-500">• Data aparecendo</p>
                    <p className="text-green-600 dark:text-green-500">• Sem borrão</p>
                  </div>
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-400 rounded p-2">
                    <p className="font-bold text-red-700 dark:text-red-400 mb-1">✗ FOTO RUIM:</p>
                    <p className="text-red-600 dark:text-red-500">• Escura demais</p>
                    <p className="text-red-600 dark:text-red-500">• Data cortada</p>
                    <p className="text-red-600 dark:text-red-500">• Tremida/borrada</p>
                  </div>
                </div>
                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-400 rounded p-2 mt-2 text-[10px] text-amber-700 dark:text-amber-400">
                  ⏳ O sistema vai analisar a foto automaticamente. Se estiver ruim, vai pedir para tirar outra.
                </div>
              </div>
            </div>

            {/* Passo 5 */}
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                5
              </div>
              <div className="flex-1">
                <p className="font-bold text-sm mb-1" style={{ color: theme.text }}>Autorize a localização do celular</p>
                <p className="text-xs mb-2" style={{ color: theme.textMuted }}>
                  O celular vai pedir permissão para usar o GPS. Clique em <strong>"Permitir"</strong>
                </p>
                <p className="text-xs" style={{ color: theme.textMuted }}>
                  Isso é só para a gente saber em que cidade você está.
                </p>
              </div>
            </div>

            {/* Passo 6 */}
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                6
              </div>
              <div className="flex-1">
                <p className="font-bold text-sm mb-1" style={{ color: theme.text }}>Clique em "Fazer Check-in"</p>
                <p className="text-xs mb-2" style={{ color: theme.textMuted }}>
                  O sistema vai perguntar: <strong>"Confirma que seu veículo está VAZIO?"</strong>
                </p>
                <p className="text-xs font-bold text-red-600">
                  ⚠️ SÓ CONFIRME SE REALMENTE ESTIVER VAZIO!
                </p>
              </div>
            </div>
          </div>

          {/* Após o Check-in */}
          <div className="bg-green-50 dark:bg-green-900/20 border-2 border-green-500 rounded-lg p-5 mb-6">
            <p className="font-bold text-base mb-3 text-green-700 dark:text-green-400 flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              PRONTO! VOCÊ ESTÁ NA FILA
            </p>
            <div className="space-y-2 text-sm text-green-800 dark:text-green-300">
              <p>✓ Você vai ver na tela:</p>
              <ul className="list-disc ml-6 space-y-1 text-xs">
                <li><strong>Sua SENHA</strong> (4 letras/números) - Guarde ela!</li>
                <li><strong>Sua POSIÇÃO</strong> na fila (ex: você é o 7º)</li>
                <li><strong>Quantos veículos</strong> estão na sua frente</li>
                <li><strong>Há quanto tempo</strong> você está esperando</li>
              </ul>
            </div>
          </div>

          {/* O que fazer agora */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-500 rounded-lg p-5 mb-6">
            <p className="font-bold text-base mb-3 text-blue-700 dark:text-blue-400">
              🤔 E AGORA? O QUE EU FAÇO?
            </p>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-2">
                <span className="text-2xl">1️⃣</span>
                <div>
                  <p className="font-bold" style={{ color: theme.text }}>AGUARDE o contato da central</p>
                  <p className="text-xs" style={{ color: theme.textMuted }}>
                    A central vai te ligar ou mandar mensagem quando for sua vez de carregar
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-2xl">2️⃣</span>
                <div>
                  <p className="font-bold" style={{ color: theme.text }}>NÃO ligue perguntando posição</p>
                  <p className="text-xs" style={{ color: theme.textMuted }}>
                    Se quiser saber sua posição atualizada, clique no botão <strong>"🔄 Atualizar"</strong> na tela
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-2xl">3️⃣</span>
                <div>
                  <p className="font-bold" style={{ color: theme.text }}>Fique atento ao celular</p>
                  <p className="text-xs" style={{ color: theme.textMuted }}>
                    Quando for sua vez, a central vai te chamar. Responda rápido para não perder a vez!
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Perguntas Frequentes */}
          <div className="mb-6">
            <p className="font-bold text-base mb-3" style={{ color: theme.text }}>❓ PERGUNTAS FREQUENTES</p>
            <div className="space-y-3 text-xs">
              <div className="bg-white dark:bg-gray-800 border rounded p-3" style={{ borderColor: theme.cardBorder }}>
                <p className="font-bold mb-1" style={{ color: theme.text }}>P: Quanto tempo vou esperar?</p>
                <p style={{ color: theme.textMuted }}>
                  <strong>R:</strong> Depende de quantos veículos estão na sua frente e da disponibilidade de cargas. 
                  A média é de 2 a 4 horas, mas pode variar. Fique atento ao celular!
                </p>
              </div>

              <div className="bg-white dark:bg-gray-800 border rounded p-3" style={{ borderColor: theme.cardBorder }}>
                <p className="font-bold mb-1" style={{ color: theme.text }}>P: Minha posição pode mudar?</p>
                <p style={{ color: theme.textMuted }}>
                  <strong>R:</strong> Sim! Se alguém sair da fila, você sobe de posição. Se entrar alguém na frente 
                  (veículos prioritários ou cargas dedicadas), você pode descer. Clique "Atualizar" para ver.
                </p>
              </div>

              <div className="bg-white dark:bg-gray-800 border rounded p-3" style={{ borderColor: theme.cardBorder }}>
                <p className="font-bold mb-1" style={{ color: theme.text }}>P: E se eu precisar sair da fila?</p>
                <p style={{ color: theme.textMuted }}>
                  <strong>R:</strong> Clique no botão <strong>"Sair da Fila"</strong> na tela. 
                  Isso vai liberar sua posição para outros motoristas. Se voltar depois, terá que fazer novo check-in.
                </p>
              </div>

              <div className="bg-white dark:bg-gray-800 border rounded p-3" style={{ borderColor: theme.cardBorder }}>
                <p className="font-bold mb-1" style={{ color: theme.text }}>P: A foto do comprovante não foi aceita. Por quê?</p>
                <p style={{ color: theme.textMuted }}>
                  <strong>R:</strong> A foto pode estar escura, borrada ou sem a data visível. 
                  Tente tirar novamente com boa iluminação, mostrando a data do documento claramente.
                </p>
              </div>

              <div className="bg-white dark:bg-gray-800 border rounded p-3" style={{ borderColor: theme.cardBorder }}>
                <p className="font-bold mb-1" style={{ color: theme.text }}>P: Não consigo tirar a localização. E agora?</p>
                <p style={{ color: theme.textMuted }}>
                  <strong>R:</strong> Verifique se você autorizou o navegador a usar sua localização. 
                  No celular, vai aparecer uma mensagem pedindo permissão - clique em "Permitir". 
                  Se ainda não funcionar, use o botão "Ajuda" para falar com a central.
                </p>
              </div>

              <div className="bg-white dark:bg-gray-800 border rounded p-3" style={{ borderColor: theme.cardBorder }}>
                <p className="font-bold mb-1" style={{ color: theme.text }}>P: Já fiz check-in. Posso sair da tela?</p>
                <p style={{ color: theme.textMuted }}>
                  <strong>R:</strong> Sim! Você pode fechar a tela. Para ver sua posição novamente, 
                  basta abrir o link de novo e digitar seu telefone. Seus dados vão aparecer.
                </p>
              </div>

              <div className="bg-white dark:bg-gray-800 border rounded p-3" style={{ borderColor: theme.cardBorder }}>
                <p className="font-bold mb-1" style={{ color: theme.text }}>P: O que é essa "senha" que aparece?</p>
                <p style={{ color: theme.textMuted }}>
                  <strong>R:</strong> É um código único da sua marcação (ex: AB3X). 
                  A central usa essa senha para te encontrar no sistema. Você não precisa fazer nada com ela.
                </p>
              </div>
            </div>
          </div>

          {/* Dicas Importantes */}
          <div className="bg-amber-50 dark:bg-amber-900/20 border-2 border-amber-500 rounded-lg p-4 mb-6">
            <p className="font-bold text-base mb-3 text-amber-800 dark:text-amber-400">💡 DICAS IMPORTANTES:</p>
            <div className="space-y-2 text-xs text-amber-700 dark:text-amber-300">
              <div className="flex items-start gap-2">
                <span>✓</span>
                <p>Mantenha seu cadastro sempre atualizado (celular, placa). Isso acelera o check-in.</p>
              </div>
              <div className="flex items-start gap-2">
                <span>✓</span>
                <p>Se mudar de veículo, faça novo check-in com a nova placa.</p>
              </div>
              <div className="flex items-start gap-2">
                <span>✓</span>
                <p>Não faça check-in se ainda tiver carga no veículo. Espere descarregar primeiro!</p>
              </div>
              <div className="flex items-start gap-2">
                <span>✓</span>
                <p>Fique em local com sinal de celular para receber o contato da central.</p>
              </div>
              <div className="flex items-start gap-2">
                <span>✓</span>
                <p>Se tiver problemas, use o botão "Ajuda" - ele abre WhatsApp direto com a central.</p>
              </div>
            </div>
          </div>

          {/* Suporte */}
          <div className="border-t-2 pt-4" style={{ borderColor: theme.cardBorder }}>
            <div className="text-center">
              <p className="font-bold text-sm mb-2" style={{ color: theme.text }}>🆘 PRECISA DE AJUDA?</p>
              <div className="bg-green-600 text-white rounded-lg p-3 inline-block">
                <p className="text-xs mb-1">Use o botão "Ajuda" em qualquer tela</p>
                <p className="font-bold text-sm">ou</p>
                <p className="text-xs mt-1">Entre em contato com a central da transportadora</p>
              </div>
            </div>
          </div>

          {/* Rodapé do Guia */}
          <div className="border-t-2 mt-6 pt-4 text-center" style={{ borderColor: theme.cardBorder }}>
            <p className="text-xs font-bold mb-1" style={{ color: theme.text }}>
              Guarde este guia ou tire uma foto dele!
            </p>
            <p className="text-[10px]" style={{ color: theme.textMuted }}>
              Você pode precisar consultar de novo. Boa viagem e boas entregas! 🚛💨
            </p>
          </div>
        </div>

        {/* Rodapé Técnico */}
        <div className="border-t pt-4 mt-8 text-xs text-center" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>
          <p className="font-semibold">Código: GU-LOG-001 | Versão: 01 | Data: 14/01/2026</p>
          <p className="mt-1">Guia do Motorista - Fila X | Distribuição: Livre</p>
        </div>
      </CardContent>
    </Card>
  );
}