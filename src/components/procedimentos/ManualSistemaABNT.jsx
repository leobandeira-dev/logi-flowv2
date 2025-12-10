import React from "react";
import { Card, CardContent } from "@/components/ui/card";

export function ManualSistemaCompleto({ theme, isDark }) {
  return (
    <Card style={{ backgroundColor: '#ffffff', borderColor: '#000000', border: '2px solid #000000' }}>
      <CardContent className="p-8 space-y-6">
        <div className="border-b-2 pb-6" style={{ borderColor: '#000000' }}>
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h1 className="text-2xl font-bold mb-2 text-black">
                MANUAL DO USUÁRIO
              </h1>
              <h2 className="text-xl font-semibold mb-1 text-black">
                Sistema Log Flow - Gestão Logística Integrada
              </h2>
              <p className="text-sm mt-2 text-black">
                Guia Completo de Utilização de Todos os Módulos
              </p>
            </div>
            <div className="text-right text-sm text-black">
              <p className="font-bold">Código: MAN-LOG-001</p>
              <p>Versão: 1.0</p>
              <p>Data: 09/12/2024</p>
              <p>Páginas: 1/8</p>
            </div>
          </div>

          <div className="bg-white border-2 border-black rounded p-3 text-xs">
            <p className="font-semibold mb-1 text-black">Conformidade Normativa:</p>
            <p className="text-black">
              Este manual referencia todos os procedimentos operacionais (PO) e instruções de trabalho (IT) 
              do Sistema de Gestão da Qualidade conforme ISO 9001:2015.
            </p>
          </div>
        </div>

        <section>
          <h3 className="text-lg font-bold mb-3 text-black">SUMÁRIO</h3>
          <div className="grid grid-cols-2 gap-4 text-sm text-black">
            <div>
              <p className="font-bold mb-2">PARTE I - FUNDAMENTOS</p>
              <ol className="ml-4 space-y-1">
                <li>1. Introdução ao Sistema</li>
                <li>2. Arquitetura e Módulos</li>
                <li>3. Perfis de Usuário</li>
                <li>4. Primeiro Acesso</li>
              </ol>
            </div>
            <div>
              <p className="font-bold mb-2">PARTE II - MÓDULOS OPERACIONAIS</p>
              <ol className="ml-4 space-y-1" start="5">
                <li>5. Dashboard Executivo</li>
                <li>6. Ordens de Carregamento</li>
                <li>7. Tracking Logístico</li>
                <li>8. Fluxo Operacional</li>
              </ol>
            </div>
            <div>
              <p className="font-bold mb-2">PARTE III - GESTÃO DE QUALIDADE</p>
              <ol className="ml-4 space-y-1" start="9">
                <li>9. Ocorrências</li>
                <li>10. Gamificação</li>
              </ol>
            </div>
            <div>
              <p className="font-bold mb-2">PARTE IV - MÓDULOS WMS</p>
              <ol className="ml-4 space-y-1" start="11">
                <li>11. Recebimento</li>
                <li>12. Gestão de Notas Fiscais</li>
                <li>13. Etiquetas Mãe</li>
                <li>14. Carregamento WMS</li>
                <li>15. Ordem de Entrega</li>
              </ol>
            </div>
            <div>
              <p className="font-bold mb-2">PARTE V - PORTAL B2B</p>
              <ol className="ml-4 space-y-1" start="16">
                <li>16. Solicitar Coleta</li>
                <li>17. Aprovar Coletas</li>
              </ol>
            </div>
            <div>
              <p className="font-bold mb-2">PARTE VI - RECURSOS E CADASTROS</p>
              <ol className="ml-4 space-y-1" start="18">
                <li>18. Motoristas</li>
                <li>19. Veículos</li>
                <li>20. Parceiros</li>
                <li>21. Operações (SLA)</li>
              </ol>
            </div>
            <div>
              <p className="font-bold mb-2">PARTE VII - COMUNICAÇÃO</p>
              <ol className="ml-4 space-y-1" start="22">
                <li>22. App Motorista</li>
                <li>23. SAC</li>
              </ol>
            </div>
            <div>
              <p className="font-bold mb-2">PARTE VIII - ADMINISTRAÇÃO</p>
              <ol className="ml-4 space-y-1" start="24">
                <li>24. Configurações</li>
                <li>25. Usuários</li>
                <li>26. Boas Práticas</li>
                <li>27. Suporte</li>
              </ol>
            </div>
          </div>
        </section>

        <section className="print-page-break">
          <div className="border-b-2 px-4 py-3 mb-4 border-black">
            <h2 className="text-xl font-bold text-black">PARTE I - FUNDAMENTOS DO SISTEMA</h2>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-bold mb-3 text-black">1. INTRODUÇÃO AO LOG FLOW</h3>
              <div className="text-sm space-y-3 text-black">
                <p>
                  O <strong>Log Flow</strong> é uma plataforma web integrada de gestão logística, desenvolvida 
                  especificamente para empresas de transporte rodoviário de cargas. O sistema abrange todo o 
                  ciclo operacional, desde o planejamento até o faturamento, com foco em:
                </p>
                <ul className="ml-6 list-disc space-y-1">
                  <li><strong>Eficiência:</strong> Automatização de processos repetitivos</li>
                  <li><strong>Rastreabilidade:</strong> Registro completo de todas as operações</li>
                  <li><strong>Qualidade:</strong> Conformidade com ISO 9001 e SASSMAQ</li>
                  <li><strong>Visibilidade:</strong> Informação em tempo real para todos stakeholders</li>
                  <li><strong>Escalabilidade:</strong> Suporta de 100 a 50.000+ documentos/mês</li>
                </ul>

                <div className="bg-white border-2 border-black rounded p-3 mt-3">
                  <p className="font-semibold text-xs text-black">DIFERENCIAIS COMPETITIVOS:</p>
                  <ul className="text-xs space-y-1 ml-4 list-disc text-black">
                    <li>Interface intuitiva (não requer treinamento extenso)</li>
                    <li>Workflow 100% customizável</li>
                    <li>Edição inline (agiliza 80% das operações)</li>
                    <li>Integração nativa com ANTT, SEFAZ, APIs</li>
                    <li>App móvel para motoristas (sem custo adicional)</li>
                    <li>Modo escuro/claro (conforto visual)</li>
                  </ul>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-bold mb-3 text-black">2. ARQUITETURA MODULAR</h3>
              <p className="text-sm mb-3 text-black">
                O sistema é estruturado em módulos independentes mas integrados:
              </p>

              <div className="space-y-3">
                <Card style={{ backgroundColor: '#ffffff', borderColor: '#000000', border: '1px solid #000000' }}>
                  <CardContent className="p-4">
                    <h4 className="font-bold text-sm mb-2 text-black">PACOTE BASE (Obrigatório)</h4>
                    <div className="grid grid-cols-2 gap-2 text-xs text-black">
                      <div>• Dashboard Executivo</div>
                      <div>• Ordens de Carregamento</div>
                      <div>• Tracking Logístico</div>
                      <div>• Gestão de Usuários</div>
                      <div>• Motoristas</div>
                      <div>• Veículos</div>
                      <div>• Parceiros</div>
                      <div>• Operações (Config SLA)</div>
                    </div>
                    <p className="text-xs mt-3 italic text-black">
                      <strong>Referências:</strong> IT-LOG-001 (Ordens), IT-LOG-002 (Tracking)
                    </p>
                  </CardContent>
                </Card>

                <Card style={{ backgroundColor: '#ffffff', borderColor: '#000000', border: '1px solid #000000' }}>
                  <CardContent className="p-4">
                    <h4 className="font-bold text-sm mb-2 text-black">ADD-ON: Workflow & Qualidade</h4>
                    <div className="text-xs space-y-1 text-black">
                      <p>• <strong>Fluxo BPMN:</strong> Etapas customizáveis por empresa</p>
                      <p>• <strong>Ocorrências:</strong> Tracking, Fluxo, Tarefa, Diária</p>
                      <p>• <strong>Gamificação:</strong> Pontuação, conquistas, ranking</p>
                    </div>
                    <p className="text-xs mt-3 italic text-black">
                      <strong>Referências:</strong> IT-LOG-003 (Ocorrências)
                    </p>
                  </CardContent>
                </Card>

                <Card style={{ backgroundColor: '#ffffff', borderColor: '#000000', border: '1px solid #000000' }}>
                  <CardContent className="p-4">
                    <h4 className="font-bold text-sm mb-2 text-black">ADD-ON: WMS Completo</h4>
                    <div className="text-xs space-y-1 text-black">
                      <p>• <strong>Recebimento:</strong> Importação NF-e (XML, chave, scanner)</p>
                      <p>• <strong>Gestão de NFs:</strong> Controle completo de fiscais</p>
                      <p>• <strong>Volumes:</strong> Etiquetagem individual</p>
                      <p>• <strong>Etiquetas Mãe:</strong> Unitização de cargas</p>
                      <p>• <strong>Carregamento:</strong> Conferência e expedição</p>
                      <p>• <strong>Entrega:</strong> Last mile delivery</p>
                    </div>
                  </CardContent>
                </Card>

                <Card style={{ backgroundColor: '#ffffff', borderColor: '#000000', border: '1px solid #000000' }}>
                  <CardContent className="p-4">
                    <h4 className="font-bold text-sm mb-2 text-black">ADD-ON: Portal B2B</h4>
                    <div className="text-xs space-y-1 text-black">
                      <p>• <strong>Fornecedor:</strong> Solicita coletas self-service</p>
                      <p>• <strong>Cliente:</strong> Aprova/reprova coletas</p>
                      <p>• <strong>Dashboard:</strong> Visibilidade de coletas em tempo real</p>
                    </div>
                  </CardContent>
                </Card>

                <Card style={{ backgroundColor: '#ffffff', borderColor: '#000000', border: '1px solid #000000' }}>
                  <CardContent className="p-4">
                    <h4 className="font-bold text-sm mb-2 text-black">ADD-ON: Comunicação Avançada</h4>
                    <div className="text-xs space-y-1 text-black">
                      <p>• <strong>App Motorista:</strong> SMS + atualização de status mobile</p>
                      <p>• <strong>SAC Inteligente:</strong> Chatbot com IA para atendimento 24/7</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-bold mb-3 text-black">3. PERFIS DE USUÁRIO E PERMISSÕES</h3>
              <table className="w-full text-xs border-2 border-black">
                <thead style={{ backgroundColor: '#ffffff' }}>
                  <tr>
                    <th className="border border-black p-2 text-left w-24 text-black">Perfil</th>
                    <th className="border border-black p-2 text-left text-black">Descrição</th>
                    <th className="border border-black p-2 text-left text-black">Módulos Disponíveis</th>
                    <th className="border border-black p-2 text-left w-20 text-black">Acesso</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-black p-2 font-bold text-black">Admin</td>
                    <td className="border border-black p-2 text-black">Administrador do sistema</td>
                    <td className="border border-black p-2 text-black">TODOS (configurações, usuários, procedimentos, CRM)</td>
                    <td className="border border-black p-2 text-center font-bold text-black">Total</td>
                  </tr>
                  <tr>
                    <td className="border border-black p-2 font-bold text-black">Operador</td>
                    <td className="border border-black p-2 text-black">Equipe operacional da transportadora</td>
                    <td className="border border-black p-2 text-black">Dashboard, Tracking, Fluxo, Ordens, WMS, Qualidade, Comunicação</td>
                    <td className="border border-black p-2 text-center font-bold text-black">Amplo</td>
                  </tr>
                  <tr>
                    <td className="border border-black p-2 font-bold text-black">Fornecedor</td>
                    <td className="border border-black p-2 text-black">Empresa que solicita coletas (B2B)</td>
                    <td className="border border-black p-2 text-black">Dashboard Coletas, Solicitar Coleta, Minhas Ordens</td>
                    <td className="border border-black p-2 text-center font-bold text-black">Limitado</td>
                  </tr>
                  <tr>
                    <td className="border border-black p-2 font-bold text-black">Cliente</td>
                    <td className="border border-black p-2 text-black">Empresa que recebe/aprova coletas (B2B)</td>
                    <td className="border border-black p-2 text-black">Dashboard Coletas, Aprovar Coletas, Minhas Ordens</td>
                    <td className="border border-black p-2 text-center font-bold text-black">Limitado</td>
                  </tr>
                  <tr>
                    <td className="border border-black p-2 font-bold text-black">Motorista</td>
                    <td className="border border-black p-2 text-black">Motorista em viagem</td>
                    <td className="border border-black p-2 text-black">App Motorista (versão mobile via SMS)</td>
                    <td className="border border-black p-2 text-center font-bold text-black">Mobile</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div>
              <h3 className="text-lg font-bold mb-3 text-black">4. PRIMEIRO ACESSO</h3>
              <ol className="text-sm space-y-2 ml-6 list-decimal text-black">
                <li><strong>Convite por Email:</strong> Você receberá email com link de acesso</li>
                <li><strong>Criar Senha:</strong> Clique no link e defina sua senha (mín 8 caracteres)</li>
                <li>
                  <strong>Completar Perfil:</strong> Sistema solicita dados obrigatórios:
                  <ul className="ml-6 list-disc mt-1 text-xs">
                    <li>Tipo de Perfil (Operador/Fornecedor/Cliente)</li>
                    <li>Empresa vinculada (CNPJ)</li>
                    <li>Cargo e Departamento</li>
                    <li>Foto (opcional mas recomendado)</li>
                  </ul>
                </li>
                <li><strong>Aguardar Aprovação:</strong> Admin aprova seu cadastro (notificação por email)</li>
                <li><strong>Acessar Sistema:</strong> Após aprovação, faça login e acesse módulos do seu perfil</li>
              </ol>
            </div>
          </div>
        </section>

        <section className="print-page-break">
          <div className="border-b-2 px-4 py-3 mb-4 border-black">
            <h2 className="text-xl font-bold text-black">PARTE II - MÓDULOS OPERACIONAIS</h2>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-bold mb-3 text-black">6. ORDENS DE CARREGAMENTO</h3>
              <p className="text-sm mb-2 text-black">
                <strong>Caminho:</strong> Menu → Operações → Ordens | <strong>Referência:</strong> IT-LOG-001
              </p>
              <p className="text-sm text-black">Módulo para criação e gestão de ordens de transporte.</p>
            </div>

            <div>
              <h3 className="text-lg font-bold mb-3 text-black">7. TRACKING LOGÍSTICO</h3>
              <p className="text-sm mb-2 text-black">
                <strong>Caminho:</strong> Menu → Operações → Tracking | <strong>Referência:</strong> IT-LOG-002
              </p>
              <p className="text-sm text-black">Monitoramento de cargas em tempo real com controle de SLA.</p>
            </div>
          </div>
        </section>

        <section className="print-page-break">
          <div className="border-b-2 px-4 py-3 mb-4 border-black">
            <h2 className="text-xl font-bold text-black">PARTE III - GESTÃO DE QUALIDADE</h2>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-bold mb-3 text-black">9. OCORRÊNCIAS</h3>
              <p className="text-sm mb-2 text-black">
                <strong>Caminho:</strong> Menu → Qualidade → Ocorrências | <strong>Referência:</strong> IT-LOG-003
              </p>
              <p className="text-sm text-black">Sistema de gestão de não conformidades e desvios operacionais.</p>
            </div>

            <div>
              <h3 className="text-lg font-bold mb-3 text-black">10. GAMIFICAÇÃO</h3>
              <p className="text-sm text-black">Sistema de reconhecimento e engajamento através de pontuação e conquistas.</p>
            </div>
          </div>
        </section>

        <section className="print-page-break">
          <div className="border-b-2 px-4 py-3 mb-4 border-black">
            <h2 className="text-xl font-bold text-black">PARTE VIII - BOAS PRÁTICAS</h2>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-bold mb-3 text-black">26. BOAS PRÁTICAS OPERACIONAIS</h3>
              
              <div className="space-y-4">
                <Card style={{ backgroundColor: '#ffffff', borderColor: '#000000', border: '1px solid #000000' }}>
                  <CardContent className="p-4">
                    <h4 className="font-bold text-sm mb-2 text-black">Ordens de Carregamento</h4>
                    <ul className="text-xs space-y-1 list-disc ml-4 text-black">
                      <li>Sempre vincule uma Operação (garante SLA correto)</li>
                      <li>Use edição inline para agilizar (80% mais rápido que formulário)</li>
                      <li>Preencha observações para facilitar passagem de turno</li>
                      <li>Use ofertas de carga para negociar com parceiros externos</li>
                      <li>Revise tipo de operação (CIF/FOB) antes de salvar</li>
                      <li>Vincule NFs logo na criação (evita retrabalho)</li>
                    </ul>
                  </CardContent>
                </Card>

                <Card style={{ backgroundColor: '#ffffff', borderColor: '#000000', border: '1px solid #000000' }}>
                  <CardContent className="p-4">
                    <h4 className="font-bold text-sm mb-2 text-black">Tracking</h4>
                    <ul className="text-xs space-y-1 list-disc ml-4 text-black">
                      <li>Atualize status assim que eventos ocorrem (não deixe acumular)</li>
                      <li>Use atalho H em datas para preencher hora atual instantaneamente</li>
                      <li>Registre ocorrências imediatamente ao identificar problemas</li>
                      <li>Mantenha comunicação ativa com motorista via chat</li>
                      <li>Anexe comprovantes assim que disponíveis</li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        <section>
          <h3 className="text-lg font-bold mb-3 text-black">27. SUPORTE TÉCNICO</h3>
          <div className="text-sm text-black">
            <p className="mb-2">Utilize o sistema de chamados integrado disponível em todas as telas do sistema.</p>
            <ul className="ml-6 list-disc text-xs">
              <li>Email: suporte@logflow.com.br</li>
              <li>Horário: Segunda a Sexta, 8h às 18h</li>
            </ul>
          </div>
        </section>

        <div className="border-t-2 border-black pt-4 mt-8 text-xs text-center space-y-1 text-black">
          <p className="font-bold">Log Flow © 2024 - Gestão Logística Inteligente</p>
          <p>Versão 1.0 - Dezembro 2024</p>
        </div>
      </CardContent>
    </Card>
  );
}