import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Truck, CheckCircle, Smartphone, Camera, MapPin, Clock } from "lucide-react";

export function GuiaMotoristoFilaX({ theme, isDark }) {
  return (
    <Card style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}>
      <CardContent className="p-8">
        <div className="border-4 border-blue-600 rounded-lg p-6" style={{ backgroundColor: isDark ? '#1e293b' : '#ffffff' }}>
          {/* Header Amigável */}
          <div className="text-center mb-6 pb-4 border-b-4 border-blue-400">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
              <Truck className="w-12 h-12 text-white" />
            </div>
            <h3 className="text-2xl font-bold mb-2" style={{ color: theme.text }}>
              🚛 FILA X - GUIA DO MOTORISTA
            </h3>
            <p className="text-base font-semibold text-blue-600">
              Aprenda a marcar sua placa em 6 passos simples!
            </p>
            <p className="text-sm mt-2" style={{ color: theme.textMuted }}>
              Leia tudo com atenção antes de começar
            </p>
          </div>

          {/* Checklist Pré-requisitos */}
          <div className="bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-950 dark:to-orange-950 border-4 border-red-500 rounded-xl p-5 mb-6 shadow-lg">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center">
                <span className="text-2xl">⚠️</span>
              </div>
              <p className="font-bold text-xl text-red-700 dark:text-red-400">ATENÇÃO! LEIA ANTES DE COMEÇAR</p>
            </div>
            
            <div className="space-y-3 text-base">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border-2 border-red-400">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
                    1
                  </div>
                  <div>
                    <p className="font-bold text-red-700 dark:text-red-400 text-lg">
                      Seu caminhão TEM QUE estar VAZIO!
                    </p>
                    <p className="text-sm text-red-600 dark:text-red-500">
                      Sem nenhuma carga dentro. Completamente descarregado.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border-2 border-orange-400">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-600 rounded-full flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
                    2
                  </div>
                  <div>
                    <p className="font-bold text-orange-700 dark:text-orange-400 text-lg">
                      Separe o comprovante da última entrega
                    </p>
                    <p className="text-sm text-orange-600 dark:text-orange-500">
                      Pode ser o canhoto, nota de entrega ou qualquer papel que prove que você descarregou.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border-2 border-blue-400">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
                    3
                  </div>
                  <div>
                    <p className="font-bold text-blue-700 dark:text-blue-400 text-lg">
                      Deixe a localização do celular ligada
                    </p>
                    <p className="text-sm text-blue-600 dark:text-blue-500">
                      O sistema vai pedir para usar o GPS. É só para saber em que cidade você está.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Passo a Passo Visual */}
          <div className="space-y-5 mb-8">
            <div className="text-center mb-4">
              <p className="font-bold text-xl mb-2" style={{ color: theme.text }}>
                📱 COMO FAZER - PASSO A PASSO
              </p>
              <p className="text-sm" style={{ color: theme.textMuted }}>
                Siga na ordem. É fácil e rápido!
              </p>
            </div>
            
            {/* Passo 1 - Visual */}
            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950 border-3 border-blue-500 rounded-xl p-5 shadow-md">
              <div className="flex items-center gap-4 mb-3">
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-2xl shadow-lg flex-shrink-0">
                  1
                </div>
                <div>
                  <p className="font-bold text-lg" style={{ color: theme.text }}>Abra o link no celular</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Smartphone className="w-4 h-4 text-blue-600" />
                    <p className="text-sm text-blue-600">Use o link que você recebeu</p>
                  </div>
                </div>
              </div>
              <p className="text-sm ml-20" style={{ color: theme.textMuted }}>
                A empresa mandou um link para você (WhatsApp, SMS ou papel). Clique nele para começar.
              </p>
            </div>

            {/* Passo 2 - Visual */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 border-3 border-green-500 rounded-xl p-5 shadow-md">
              <div className="flex items-center gap-4 mb-3">
                <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center text-white font-bold text-2xl shadow-lg flex-shrink-0">
                  2
                </div>
                <div>
                  <p className="font-bold text-lg" style={{ color: theme.text }}>Coloque seu telefone</p>
                  <p className="text-sm text-green-600 font-mono">(11) 99999-9999</p>
                </div>
              </div>
              <div className="ml-20 space-y-2">
                <p className="text-sm" style={{ color: theme.textMuted }}>
                  Digite com o DDD na frente (os 2 números da sua região).
                </p>
                <div className="bg-green-100 dark:bg-green-900/30 border border-green-500 rounded-lg p-3">
                  <p className="text-sm font-bold text-green-800 dark:text-green-300">
                    💡 Já usou o sistema antes?
                  </p>
                  <p className="text-xs text-green-700 dark:text-green-400">
                    Seus dados vão aparecer sozinhos! Nome, placa, tudo já vai estar preenchido.
                  </p>
                </div>
              </div>
            </div>

            {/* Passo 3 - Visual */}
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950 border-3 border-purple-500 rounded-xl p-5 shadow-md">
              <div className="flex items-center gap-4 mb-3">
                <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold text-2xl shadow-lg flex-shrink-0">
                  3
                </div>
                <div>
                  <p className="font-bold text-lg" style={{ color: theme.text }}>Complete os dados</p>
                  <p className="text-sm text-purple-600">São só 3 telas rápidas</p>
                </div>
              </div>
              <div className="ml-20 space-y-2 text-sm">
                <p style={{ color: theme.textMuted }}>O sistema vai pedir:</p>
                <div className="grid grid-cols-1 gap-2">
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-2 border border-purple-300">
                    <p className="font-bold">📝 Tela 1: Seu nome completo</p>
                  </div>
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-2 border border-purple-300">
                    <p className="font-bold">🚗 Tela 2: Placa do cavalo (ABC1234)</p>
                  </div>
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-2 border border-purple-300">
                    <p className="font-bold">🚛 Tela 3: Tipo do caminhão e carroceria</p>
                  </div>
                </div>
                <div className="bg-purple-100 dark:bg-purple-900/30 border border-purple-500 rounded-lg p-2 mt-2">
                  <p className="text-xs text-purple-800 dark:text-purple-300">
                    🆘 Não sabe o que escolher? Tem botão "Ajuda" em todas as telas!
                  </p>
                </div>
              </div>
            </div>

            {/* Passo 4 - Visual com exemplos */}
            <div className="bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-950 dark:to-amber-950 border-3 border-orange-500 rounded-xl p-5 shadow-md">
              <div className="flex items-center gap-4 mb-3">
                <div className="w-16 h-16 bg-orange-600 rounded-full flex items-center justify-center text-white shadow-lg flex-shrink-0">
                  <Camera className="w-9 h-9" />
                </div>
                <div>
                  <p className="font-bold text-lg" style={{ color: theme.text }}>Tire foto do comprovante</p>
                  <p className="text-sm text-orange-600">MUITO IMPORTANTE!</p>
                </div>
              </div>
              <div className="ml-20 space-y-3">
                <p className="text-sm font-bold" style={{ color: theme.text }}>
                  📸 Que foto eu preciso tirar?
                </p>
                <p className="text-sm" style={{ color: theme.textMuted }}>
                  Foto do documento que prova que você DESCARREGOU no último destino. 
                  Pode ser: canhoto assinado, nota de entrega, protocolo de descarga.
                </p>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-green-100 dark:bg-green-900/30 border-2 border-green-500 rounded-lg p-3">
                    <p className="font-bold text-sm text-green-800 dark:text-green-300 mb-2 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      FOTO APROVADA
                    </p>
                    <div className="space-y-1 text-xs text-green-700 dark:text-green-400">
                      <p>✓ Bem iluminada (tire de dia ou com luz)</p>
                      <p>✓ A DATA está aparecendo bem</p>
                      <p>✓ Dá pra ler as letras</p>
                      <p>✓ Foto sem tremida</p>
                    </div>
                  </div>
                  <div className="bg-red-100 dark:bg-red-900/30 border-2 border-red-500 rounded-lg p-3">
                    <p className="font-bold text-sm text-red-800 dark:text-red-300 mb-2">
                      ✗ FOTO REPROVADA
                    </p>
                    <div className="space-y-1 text-xs text-red-700 dark:text-red-400">
                      <p>✗ Muito escura (não dá pra ver nada)</p>
                      <p>✗ Data cortada ou não aparece</p>
                      <p>✗ Letras borradas</p>
                      <p>✗ Foto tremida</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-amber-100 dark:bg-amber-900/30 border-2 border-amber-500 rounded-lg p-3">
                  <p className="text-sm font-bold text-amber-800 dark:text-amber-300">
                    ⚡ O sistema analisa sua foto em 5 segundos
                  </p>
                  <p className="text-xs text-amber-700 dark:text-amber-400 mt-1">
                    Se ele não aceitar, vai pedir pra você tirar de novo. Não desanime! Tente com mais luz.
                  </p>
                </div>
              </div>
            </div>

            {/* Passo 5 - Visual */}
            <div className="bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-cyan-950 dark:to-blue-950 border-3 border-cyan-500 rounded-xl p-5 shadow-md">
              <div className="flex items-center gap-4 mb-3">
                <div className="w-16 h-16 bg-cyan-600 rounded-full flex items-center justify-center text-white shadow-lg flex-shrink-0">
                  <MapPin className="w-9 h-9" />
                </div>
                <div>
                  <p className="font-bold text-lg" style={{ color: theme.text }}>Autorize a localização</p>
                  <p className="text-sm text-cyan-600">O celular vai pedir permissão</p>
                </div>
              </div>
              <div className="ml-20 space-y-2">
                <p className="text-sm" style={{ color: theme.textMuted }}>
                  Vai aparecer uma mensagem perguntando se você deixa o site usar sua localização.
                </p>
                <div className="bg-cyan-100 dark:bg-cyan-900/30 border-2 border-cyan-500 rounded-lg p-3">
                  <p className="font-bold text-sm text-cyan-800 dark:text-cyan-300 mb-1">
                    Clique em "PERMITIR" ou "AUTORIZAR"
                  </p>
                  <p className="text-xs text-cyan-700 dark:text-cyan-400">
                    Não se preocupe! Usamos só pra saber em que cidade você tá. Nada mais.
                  </p>
                </div>
              </div>
            </div>

            {/* Passo 6 - Confirmação Final */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 border-3 border-green-500 rounded-xl p-5 shadow-md">
              <div className="flex items-center gap-4 mb-3">
                <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center shadow-lg flex-shrink-0">
                  <CheckCircle className="w-10 h-10 text-white" />
                </div>
                <div>
                  <p className="font-bold text-lg" style={{ color: theme.text }}>Confirme e pronto!</p>
                  <p className="text-sm text-green-600">Última pergunta importante</p>
                </div>
              </div>
              <div className="ml-20 space-y-2">
                <div className="bg-red-100 dark:bg-red-900/30 border-3 border-red-600 rounded-lg p-4">
                  <p className="text-base font-bold text-red-800 dark:text-red-300 mb-2">
                    ⚠️ "Seu caminhão está VAZIO?"
                  </p>
                  <p className="text-sm text-red-700 dark:text-red-400">
                    O sistema vai fazer essa pergunta. Se tiver carga ainda, clica NÃO!
                  </p>
                  <p className="text-xs text-red-600 dark:text-red-500 mt-2">
                    Só clique SIM se descarregou tudo mesmo. Senão você pode ser bloqueado!
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Sucesso! */}
          <div className="bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-950 dark:to-emerald-950 border-4 border-green-500 rounded-xl p-6 mb-6 shadow-xl">
            <div className="text-center mb-4">
              <div className="w-20 h-20 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-3 animate-pulse">
                <CheckCircle className="w-12 h-12 text-white" />
              </div>
              <p className="font-bold text-2xl mb-2 text-green-700 dark:text-green-400">
                🎉 PRONTO! VOCÊ CONSEGUIU!
              </p>
              <p className="text-base text-green-600 dark:text-green-500">
                Agora você está na fila esperando carga
              </p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border-2 border-green-400">
              <p className="font-bold text-base mb-3" style={{ color: theme.text }}>
                📱 O que você vai ver na tela:
              </p>
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg p-3">
                  <span className="text-3xl">🔑</span>
                  <div>
                    <p className="font-bold" style={{ color: theme.text }}>Sua SENHA</p>
                    <p className="text-xs" style={{ color: theme.textMuted }}>
                      4 letras/números (ex: <span className="font-mono font-bold">AB3X</span>). Não precisa decorar.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 bg-purple-50 dark:bg-purple-900/30 rounded-lg p-3">
                  <span className="text-3xl">📍</span>
                  <div>
                    <p className="font-bold" style={{ color: theme.text }}>Sua POSIÇÃO na fila</p>
                    <p className="text-xs" style={{ color: theme.textMuted }}>
                      Exemplo: "Você é o 7º" (tem 6 caminhões na frente)
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 bg-orange-50 dark:bg-orange-900/30 rounded-lg p-3">
                  <Clock className="w-8 h-8 text-orange-600" />
                  <div>
                    <p className="font-bold" style={{ color: theme.text }}>Tempo de espera</p>
                    <p className="text-xs" style={{ color: theme.textMuted }}>
                      Mostra há quanto tempo você está aguardando
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* E agora? */}
          <div className="bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-950 dark:to-indigo-950 border-4 border-blue-600 rounded-xl p-6 mb-6 shadow-lg">
            <p className="font-bold text-2xl mb-4 text-blue-700 dark:text-blue-400 text-center">
              🤔 E AGORA? O QUE VOCÊ PRECISA FAZER?
            </p>
            
            <div className="space-y-4">
              <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border-2 border-blue-400 shadow-md">
                <div className="flex items-start gap-3">
                  <div className="w-14 h-14 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-2xl flex-shrink-0">
                    1
                  </div>
                  <div>
                    <p className="font-bold text-lg mb-1" style={{ color: theme.text }}>
                      FICA QUIETO E AGUARDA 😊
                    </p>
                    <p className="text-sm" style={{ color: theme.textMuted }}>
                      A central vai te ligar ou mandar mensagem no WhatsApp quando tiver carga pra você.
                    </p>
                    <p className="text-xs mt-2 text-green-600 font-semibold">
                      ✓ Pode ir tomar um café, descansar. A gente te chama!
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border-2 border-red-400 shadow-md">
                <div className="flex items-start gap-3">
                  <div className="w-14 h-14 bg-red-600 rounded-full flex items-center justify-center text-white font-bold text-2xl flex-shrink-0">
                    ✗
                  </div>
                  <div>
                    <p className="font-bold text-lg mb-1 text-red-700 dark:text-red-400">
                      NÃO LIGUE pra perguntar posição!
                    </p>
                    <p className="text-sm" style={{ color: theme.textMuted }}>
                      Quer saber se já tá perto? Abre o link de novo e clica no botão <strong>"🔄 Atualizar"</strong>
                    </p>
                    <p className="text-xs mt-2 text-red-600">
                      Se ligar toda hora, atrapalha o pessoal que tá trabalhando!
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border-2 border-green-400 shadow-md">
                <div className="flex items-start gap-3">
                  <div className="w-14 h-14 bg-green-600 rounded-full flex items-center justify-center text-white font-bold text-2xl flex-shrink-0">
                    3
                  </div>
                  <div>
                    <p className="font-bold text-lg mb-1" style={{ color: theme.text }}>
                      RESPONDE RÁPIDO quando te chamarem
                    </p>
                    <p className="text-sm" style={{ color: theme.textMuted }}>
                      Quando a central ligar, atende logo! Se demorar muito, pode perder a vez.
                    </p>
                    <p className="text-xs mt-2 text-green-600 font-semibold">
                      💡 Deixa o celular no volume alto e por perto!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Dúvidas Comuns */}
          <div className="mb-6">
            <div className="text-center mb-4">
              <p className="font-bold text-xl" style={{ color: theme.text }}>
                ❓ DÚVIDAS? A GENTE RESPONDE!
              </p>
              <p className="text-sm" style={{ color: theme.textMuted }}>
                Perguntas que todo motorista faz
              </p>
            </div>
            
            <div className="space-y-3">
              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950 border-2 border-blue-400 rounded-lg p-4 shadow">
                <p className="font-bold text-base mb-2 text-blue-700 dark:text-blue-400">
                  ⏰ Quanto tempo eu vou esperar?
                </p>
                <p className="text-sm" style={{ color: theme.textMuted }}>
                  Normalmente entre 2 a 4 horas. Mas depende de quanta gente tá na frente e se tem carga disponível. 
                  Às vezes é mais rápido, às vezes demora um pouco mais. Por isso: fique de olho no celular!
                </p>
              </div>

              <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950 border-2 border-purple-400 rounded-lg p-4 shadow">
                <p className="font-bold text-base mb-2 text-purple-700 dark:text-purple-400">
                  📊 Minha posição pode mudar?
                </p>
                <p className="text-sm" style={{ color: theme.textMuted }}>
                  Sim! Você pode subir (se alguém desistir ou sair) ou descer um pouquinho 
                  (se entrar caminhão prioritário). É normal! Pra ver atualizado, clica no botão "🔄 Atualizar".
                </p>
              </div>

              <div className="bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-950 dark:to-orange-950 border-2 border-red-400 rounded-lg p-4 shadow">
                <p className="font-bold text-base mb-2 text-red-700 dark:text-red-400">
                  🚪 E se eu precisar sair? (ir no banheiro, comer...)
                </p>
                <p className="text-sm mb-2" style={{ color: theme.textMuted }}>
                  Pode sair tranquilo! Só deixa o celular com alguém ou no volume alto. 
                  Se precisar sair de vez (desistir da carga), clica em <strong>"Sair da Fila"</strong> lá na tela.
                </p>
                <p className="text-xs text-red-600 font-semibold">
                  ⚠️ Se você sair da fila e quiser voltar depois, tem que marcar tudo de novo!
                </p>
              </div>

              <div className="bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-950 dark:to-yellow-950 border-2 border-amber-400 rounded-lg p-4 shadow">
                <p className="font-bold text-base mb-2 text-amber-700 dark:text-amber-400">
                  📸 A foto não foi aceita. Por quê?
                </p>
                <p className="text-sm mb-2" style={{ color: theme.textMuted }}>
                  Foto tá muito escura, tremida ou a data não aparece direito. Tenta de novo:
                </p>
                <ul className="text-sm space-y-1 ml-4">
                  <li>• Vá pra um lugar com luz</li>
                  <li>• Deixa a data aparecer bem na foto</li>
                  <li>• Segura firme pra não tremer</li>
                  <li>• Tira de novo e manda</li>
                </ul>
              </div>

              <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 border-2 border-green-400 rounded-lg p-4 shadow">
                <p className="font-bold text-base mb-2 text-green-700 dark:text-green-400">
                  📱 Posso fechar a tela depois que marquei?
                </p>
                <p className="text-sm" style={{ color: theme.textMuted }}>
                  Pode sim! Fecha tranquilo. Quando quiser ver de novo, é só abrir o link e digitar 
                  seu telefone. Tudo vai aparecer de novo: sua senha, posição, tudo!
                </p>
              </div>

              <div className="bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-950 dark:to-blue-950 border-2 border-indigo-400 rounded-lg p-4 shadow">
                <p className="font-bold text-base mb-2 text-indigo-700 dark:text-indigo-400">
                  🔑 O que é essa "senha" que aparece?
                </p>
                <p className="text-sm" style={{ color: theme.textMuted }}>
                  É tipo um ticket seu (exemplo: <span className="font-mono font-bold">AB3X</span>). 
                  O pessoal da central usa isso pra te achar no computador deles. 
                  Você não precisa fazer nada com ela, mas se quiser anotar, pode.
                </p>
              </div>
            </div>
          </div>

          {/* Dicas - Mais visual */}
          <div className="bg-gradient-to-br from-amber-100 to-yellow-100 dark:from-amber-950 dark:to-yellow-950 border-4 border-amber-500 rounded-xl p-6 mb-6 shadow-lg">
            <p className="font-bold text-2xl mb-4 text-amber-800 dark:text-amber-400 text-center">
              💡 DICAS PRA VOCÊ NÃO ERRAR!
            </p>
            
            <div className="grid grid-cols-1 gap-3">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border-2 border-green-400 shadow">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">✓</span>
                  <p className="text-base font-bold text-green-700 dark:text-green-400">
                    Caminhão tem que tá vazio mesmo!
                  </p>
                </div>
                <p className="text-sm ml-12 mt-1" style={{ color: theme.textMuted }}>
                  Acabou de descarregar? Ótimo! Agora pode marcar. Ainda tem carga? Espera descarregar primeiro!
                </p>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border-2 border-blue-400 shadow">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">✓</span>
                  <p className="text-base font-bold text-blue-700 dark:text-blue-400">
                    Foto do comprovante tem que tá boa
                  </p>
                </div>
                <p className="text-sm ml-12 mt-1" style={{ color: theme.textMuted }}>
                  Clarinha, com a data aparecendo. Se sair escura ou tremida, o sistema não aceita.
                </p>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border-2 border-purple-400 shadow">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">✓</span>
                  <p className="text-base font-bold text-purple-700 dark:text-purple-400">
                    Mudou de caminhão? Marca de novo!
                  </p>
                </div>
                <p className="text-sm ml-12 mt-1" style={{ color: theme.textMuted }}>
                  Cada placa é uma marcação diferente. Trocou de cavalo? Faz novo check-in com a nova placa.
                </p>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border-2 border-orange-400 shadow">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">✓</span>
                  <p className="text-base font-bold text-orange-700 dark:text-orange-400">
                    Fica num lugar com sinal no celular
                  </p>
                </div>
                <p className="text-sm ml-12 mt-1" style={{ color: theme.textMuted }}>
                  Senão a central não consegue te ligar quando tiver carga. Fique por perto de área com cobertura!
                </p>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border-2 border-cyan-400 shadow">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">🆘</span>
                  <p className="text-base font-bold text-cyan-700 dark:text-cyan-400">
                    Botão "Ajuda" tá em tudo quanto é tela!
                  </p>
                </div>
                <p className="text-sm ml-12 mt-1" style={{ color: theme.textMuted }}>
                  Tá com dúvida? Clica no "Ajuda" que abre WhatsApp direto com o suporte. Eles te ajudam na hora!
                </p>
              </div>
            </div>
          </div>

          {/* Resumão Final */}
          <div className="bg-gradient-to-br from-green-100 to-blue-100 dark:from-green-950 dark:to-blue-950 border-4 border-green-500 rounded-xl p-6 mb-6 shadow-xl">
            <div className="text-center mb-4">
              <p className="font-bold text-2xl text-green-700 dark:text-green-400">
                ✅ RESUMINDO TUDO EM 3 REGRAS:
              </p>
            </div>
            
            <div className="space-y-3">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border-l-4 border-red-600">
                <p className="font-bold text-xl text-red-600 mb-1">1. Caminhão VAZIO</p>
                <p className="text-base" style={{ color: theme.textMuted }}>
                  Só marca se descarregou tudo. Carregado não pode!
                </p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border-l-4 border-blue-600">
                <p className="font-bold text-xl text-blue-600 mb-1">2. AGUARDA e não liga</p>
                <p className="text-base" style={{ color: theme.textMuted }}>
                  A gente te chama. Não fica ligando pra perguntar!
                </p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border-l-4 border-green-600">
                <p className="font-bold text-xl text-green-600 mb-1">3. RESPONDE rápido</p>
                <p className="text-base" style={{ color: theme.textMuted }}>
                  Quando a central te chamar, atende logo senão perde a vez!
                </p>
              </div>
            </div>
          </div>

          {/* Suporte Gigante */}
          <div className="border-t-4 border-blue-400 pt-6" style={{ borderColor: theme.cardBorder }}>
            <div className="text-center">
              <p className="font-bold text-2xl mb-4" style={{ color: theme.text }}>
                🆘 TÁ COM PROBLEMA?
              </p>
              <div className="bg-gradient-to-br from-green-600 to-green-700 text-white rounded-2xl p-6 inline-block shadow-2xl max-w-md">
                <p className="text-xl font-bold mb-3">FALA COM A GENTE!</p>
                <div className="space-y-2 text-base">
                  <p>👉 Botão "Ajuda" em todas as telas</p>
                  <p className="text-lg font-bold my-3">OU</p>
                  <p>📞 Liga pra central da transportadora</p>
                </div>
                <div className="bg-white/20 rounded-lg p-3 mt-4">
                  <p className="text-sm">Estamos aqui pra te ajudar!</p>
                </div>
              </div>
            </div>
          </div>

          {/* Rodapé Amigável */}
          <div className="border-t-4 border-blue-400 mt-8 pt-6 text-center">
            <div className="bg-blue-50 dark:bg-blue-900/30 rounded-xl p-4 inline-block">
              <p className="text-base font-bold mb-2" style={{ color: theme.text }}>
                📄 GUARDE ESTE PAPEL!
              </p>
              <p className="text-sm" style={{ color: theme.textMuted }}>
                Tire uma foto ou salve. Da próxima vez que precisar, você já sabe como fazer!
              </p>
              <p className="text-lg font-bold mt-3 text-green-600">
                🚛 Boa sorte e boa viagem! 💨
              </p>
            </div>
          </div>
        </div>

        {/* Rodapé Técnico Simplificado */}
        <div className="border-t-2 pt-4 mt-6 text-center" style={{ borderColor: theme.cardBorder }}>
          <p className="text-xs" style={{ color: theme.textMuted }}>
            Guia do Motorista - Fila X | Versão 1.0 - Janeiro/2026
          </p>
        </div>
      </CardContent>
    </Card>
  );
}