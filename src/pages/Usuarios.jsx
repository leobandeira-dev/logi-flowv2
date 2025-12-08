import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Users, 
  Plus, 
  Search, 
  Shield, 
  User,
  AlertCircle,
  Edit,
  UserX,
  Building2,
  Trash2
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import EditarUsuarioModal from "../components/usuarios/EditarUsuarioModal";
import AprovarCadastroModal from "../components/usuarios/AprovarCadastroModal";
import DepartamentoForm from "../components/usuarios/DepartamentoForm";
import { toast } from "sonner";

export default function Usuarios() {
  const [currentUser, setCurrentUser] = useState(null);
  const [usuarios, setUsuarios] = useState([]);
  const [empresas, setEmpresas] = useState([]);
  const [empresa, setEmpresa] = useState(null);
  const [departamentos, setDepartamentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingUser, setEditingUser] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [approvingUser, setApprovingUser] = useState(null);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [editingDepartamento, setEditingDepartamento] = useState(null);
  const [showDepartamentoForm, setShowDepartamentoForm] = useState(false);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const checkDarkMode = () => {
      setIsDark(document.documentElement.classList.contains('dark'));
    };
    checkDarkMode();
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const user = await base44.auth.me();
      setCurrentUser(user);

      // Carregar empresas (para o dropdown de edição)
      const todasEmpresas = await base44.entities.Empresa.list();
      setEmpresas(todasEmpresas);

      // Carregar empresa do usuário atual
      if (user.empresa_id) {
        const empresaData = await base44.entities.Empresa.get(user.empresa_id);
        setEmpresa(empresaData);
      }

      // Carregar usuários (apenas admin)
      if (user.role === "admin") {
        const allUsers = await base44.entities.User.list();
        setUsuarios(allUsers);
      }

      // Carregar departamentos
      const allDepartamentos = await base44.entities.Departamento.list();
      setDepartamentos(allDepartamentos);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadDepartamentos = async () => {
    try {
      const allDepartamentos = await base44.entities.Departamento.list();
      setDepartamentos(allDepartamentos);
    } catch (error) {
      console.error("Erro ao carregar departamentos:", error);
    }
  };

  const handleEditUser = (usuario) => {
    setEditingUser(usuario);
    setShowEditModal(true);
  };

  const handleApproveUser = (usuario) => {
    setApprovingUser(usuario);
    setShowApproveModal(true);
  };

  const handleDeleteDepartamento = async (departamentoId) => {
    if (!confirm("Tem certeza que deseja excluir este departamento?")) {
      return;
    }

    try {
      await base44.entities.Departamento.delete(departamentoId);
      toast.success("Departamento excluído com sucesso!");
      await loadData();
    } catch (error) {
      console.error("Erro ao excluir departamento:", error);
      toast.error("Erro ao excluir departamento");
    }
  };

  const handleToggleDepartamento = async (departamento) => {
    try {
      await base44.entities.Departamento.update(departamento.id, {
        ativo: !departamento.ativo
      });
      toast.success(`Departamento ${departamento.ativo ? "desativado" : "ativado"} com sucesso!`);
      await loadData();
    } catch (error) {
      console.error("Erro ao atualizar departamento:", error);
      toast.error("Erro ao atualizar departamento");
    }
  };

  const isAdmin = currentUser?.role === "admin";

  const theme = {
    bg: isDark ? '#0f172a' : '#f9fafb',
    cardBg: isDark ? '#1e293b' : '#ffffff',
    cardBorder: isDark ? '#334155' : '#e5e7eb',
    text: isDark ? '#f1f5f9' : '#111827',
    textMuted: isDark ? '#94a3b8' : '#6b7280',
  };

  const filteredUsuarios = usuarios.filter(usuario => {
    if (!searchTerm) return true;
    
    const term = searchTerm.toLowerCase();
    return (
      usuario.full_name?.toLowerCase().includes(term) ||
      usuario.email?.toLowerCase().includes(term) ||
      usuario.cargo?.toLowerCase().includes(term)
    );
  });

  if (loading) {
    return (
      <div className="p-6 min-h-screen" style={{ backgroundColor: theme.bg }}>
        <div className="max-w-[1800px] mx-auto">
          <Skeleton className="h-10 w-64 mb-8" />
          <Card style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Array(5).fill(0).map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="p-6 min-h-screen" style={{ backgroundColor: theme.bg }}>
        <div className="max-w-3xl mx-auto">
          <Alert variant="destructive">
            <AlertCircle className="w-4 h-4" />
            <AlertDescription>
              Você não tem permissão para acessar esta página. Apenas administradores podem gerenciar usuários.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 min-h-screen" style={{ backgroundColor: theme.bg }}>
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2 flex items-center gap-2" style={{ color: theme.text }}>
              <Users className="w-8 h-8" />
              Gerenciar Usuários
            </h1>
            <p style={{ color: theme.textMuted }}>
              {empresa ? `Usuários da ${empresa.nome_fantasia || empresa.razao_social}` : "Gerencie os usuários do sistema"}
            </p>
          </div>
          
          <div className="flex gap-3 w-full lg:w-auto">
            <div className="relative flex-1 lg:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: theme.textMuted }} />
              <Input
                placeholder="Buscar usuários..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder, color: theme.text }}
              />
            </div>
          </div>
        </div>

        {usuarios.filter(u => u.status_cadastro === "pendente_aprovacao").length > 0 && (
          <Alert className="mb-6" style={{ backgroundColor: isDark ? '#ea580c20' : '#fed7aa', borderColor: isDark ? '#ea580c' : '#f97316' }}>
            <AlertCircle className="w-4 h-4 text-orange-600" />
            <AlertDescription style={{ color: isDark ? '#fed7aa' : '#9a3412' }}>
              <strong>Atenção:</strong> Há {usuarios.filter(u => u.status_cadastro === "pendente_aprovacao").length} cadastro(s) aguardando aprovação.
            </AlertDescription>
          </Alert>
        )}

        <Alert className="mb-6" style={{ backgroundColor: isDark ? '#1e3a8a20' : '#dbeafe', borderColor: isDark ? '#1e3a8a' : '#3b82f6' }}>
          <AlertCircle className="w-4 h-4 text-blue-600" />
          <AlertDescription style={{ color: isDark ? '#93c5fd' : '#1e40af' }}>
            <strong>Nota:</strong> Para adicionar novos usuários, convide-os para se registrarem no sistema. 
            Após o registro, você pode editar e atribuir empresa e permissões.
          </AlertDescription>
        </Alert>

        <Tabs defaultValue="usuarios" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="usuarios" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Usuários
            </TabsTrigger>
            <TabsTrigger value="departamentos" className="flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              Departamentos
            </TabsTrigger>
          </TabsList>

          <TabsContent value="usuarios">
            <Card style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2" style={{ color: theme.text }}>
                  <Users className="w-5 h-5" />
                  Usuários Cadastrados ({filteredUsuarios.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow style={{ borderColor: theme.cardBorder }}>
                        <TableHead className="w-[140px]" style={{ color: theme.textMuted }}>Nome</TableHead>
                        <TableHead className="w-[180px]" style={{ color: theme.textMuted }}>Email</TableHead>
                        <TableHead className="w-[80px]" style={{ color: theme.textMuted }}>Perfil</TableHead>
                        <TableHead className="w-[140px]" style={{ color: theme.textMuted }}>Cargo</TableHead>
                        <TableHead className="w-[120px]" style={{ color: theme.textMuted }}>Departamento</TableHead>
                        <TableHead className="w-[140px]" style={{ color: theme.textMuted }}>Empresa</TableHead>
                        <TableHead className="w-[80px]" style={{ color: theme.textMuted }}>Status</TableHead>
                        <TableHead className="w-[80px]" style={{ color: theme.textMuted }}>Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUsuarios.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center py-8" style={{ color: theme.textMuted }}>
                            Nenhum usuário encontrado
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredUsuarios.map((usuario) => {
                          const empresaUsuario = empresas.find(e => e.id === usuario.empresa_id);
                          const departamentoUsuario = departamentos.find(d => d.id === usuario.departamento_id);
                          
                          return (
                            <TableRow key={usuario.id} style={{ borderColor: theme.cardBorder }}>
                              <TableCell className="py-2">
                                <div className="flex items-center gap-2">
                                  <div className="w-6 h-6 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0" style={{ backgroundColor: isDark ? '#1e3a8a' : '#dbeafe' }}>
                                    {usuario.foto_url ? (
                                      <img src={usuario.foto_url} alt={usuario.full_name} className="w-full h-full object-cover" />
                                    ) : (
                                      <User className="w-3 h-3" style={{ color: isDark ? '#60a5fa' : '#1d4ed8' }} />
                                    )}
                                  </div>
                                  <span className="font-medium text-xs leading-tight break-words" style={{ color: theme.text }}>
                                    {usuario.full_name}
                                  </span>
                                </div>
                              </TableCell>
                              <TableCell className="py-2">
                                <span className="text-xs leading-tight break-words block" style={{ color: theme.text }}>
                                  {usuario.email}
                                </span>
                              </TableCell>
                              <TableCell className="py-2">
                                {usuario.role === "admin" ? (
                                  <Badge className="bg-purple-100 text-purple-800 text-[10px] px-1.5 py-0.5">
                                    Admin
                                  </Badge>
                                ) : usuario.tipo_perfil ? (
                                  <Badge variant="outline" className="text-[10px] px-1.5 py-0.5" style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder, color: theme.text }}>
                                    {usuario.tipo_perfil === "operador" ? "Operador" : 
                                     usuario.tipo_perfil === "fornecedor" ? "Fornec." : 
                                     usuario.tipo_perfil === "cliente" ? "Cliente" : 
                                     usuario.tipo_perfil === "motorista" ? "Motorista" : "-"}
                                  </Badge>
                                ) : (
                                  <Badge variant="outline" className="bg-orange-50 border-orange-300 text-orange-700 text-[10px] px-1.5 py-0.5">
                                    Sem perfil
                                  </Badge>
                                )}
                              </TableCell>
                              <TableCell className="py-2">
                                <span className="text-xs leading-tight break-words block" style={{ color: theme.text }}>
                                  {usuario.cargo || "-"}
                                </span>
                              </TableCell>
                              <TableCell className="py-2">
                                {departamentoUsuario ? (
                                  <div className="flex items-center gap-1.5">
                                    <div
                                      className="w-2 h-2 rounded-full flex-shrink-0"
                                      style={{ backgroundColor: departamentoUsuario.cor }}
                                    />
                                    <span className="text-xs font-medium leading-tight break-words" style={{ color: theme.text }}>
                                      {departamentoUsuario.nome}
                                    </span>
                                  </div>
                                ) : (
                                  <span className="text-xs" style={{ color: theme.textMuted }}>-</span>
                                )}
                              </TableCell>
                              <TableCell className="py-2">
                                <span className="text-xs leading-tight break-words block" style={{ color: theme.text }}>
                                  {empresaUsuario ? empresaUsuario.nome_fantasia || empresaUsuario.razao_social : 
                                   usuario.cnpj_associado ? usuario.cnpj_associado : "-"}
                                </span>
                              </TableCell>
                              <TableCell>
                                {usuario.status_cadastro === "aprovado" ? (
                                  <Badge className="bg-green-600 text-white">
                                    Aprovado
                                  </Badge>
                                ) : usuario.status_cadastro === "rejeitado" ? (
                                  <Badge className="bg-red-600 text-white">
                                    Rejeitado
                                  </Badge>
                                ) : (
                                  <Badge className="bg-yellow-500 text-white">
                                    Pendente
                                  </Badge>
                                )}
                              </TableCell>
                              <TableCell>
                                <span className="text-sm" style={{ color: theme.textMuted }}>
                                  {usuario.created_date 
                                    ? new Date(usuario.created_date).toLocaleDateString('pt-BR') 
                                    : "-"}
                                </span>
                              </TableCell>
                              <TableCell>
                                <div className="flex gap-1">
                                  {usuario.status_cadastro !== "aprovado" && usuario.status_cadastro !== "rejeitado" ? (
                                    <Button
                                      variant="default"
                                      size="sm"
                                      onClick={() => handleApproveUser(usuario)}
                                      className="bg-green-600 hover:bg-green-700 text-white text-xs h-7 px-2"
                                    >
                                      Aprovar
                                    </Button>
                                  ) : (
                                    <>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleEditUser(usuario)}
                                        className="hover:bg-blue-50 h-7 w-7 p-0"
                                        title="Editar usuário"
                                      >
                                        <Edit className="w-3 h-3" />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={async () => {
                                          if (confirm(`Deseja ${usuario.status_cadastro === "rejeitado" ? "ativar" : "desativar"} este usuário?`)) {
                                            try {
                                              await base44.entities.User.update(usuario.id, {
                                                status_cadastro: usuario.status_cadastro === "rejeitado" ? "aprovado" : "rejeitado"
                                              });
                                              await loadData();
                                            } catch (error) {
                                              console.error("Erro:", error);
                                            }
                                          }
                                        }}
                                        className={`h-7 w-7 p-0 ${usuario.status_cadastro === "rejeitado" ? "hover:bg-green-50 text-green-600" : "hover:bg-red-50 text-red-600"}`}
                                        title={usuario.status_cadastro === "rejeitado" ? "Ativar usuário" : "Desativar usuário"}
                                      >
                                        <UserX className="w-3 h-3" />
                                      </Button>
                                    </>
                                  )}
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        })
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>

            {/* Card informativo sobre perfis */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Shield className="w-5 h-5 text-purple-600" />
                    Perfil Administrador
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm" style={{ color: theme.textMuted }}>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-purple-600 rounded-full mt-1.5" />
                      <span>Acesso completo ao sistema</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-purple-600 rounded-full mt-1.5" />
                      <span>Gerenciamento de configurações da empresa</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-purple-600 rounded-full mt-1.5" />
                      <span>Cadastro e gestão de usuários</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-purple-600 rounded-full mt-1.5" />
                      <span>Visualização de todos os dados</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <User className="w-5 h-5 text-blue-600" />
                    Perfil Operador
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm" style={{ color: theme.textMuted }}>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-1.5" />
                      <span>Acesso às funcionalidades operacionais</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-1.5" />
                      <span>Visualização de dados da própria empresa</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-1.5" />
                      <span>Cadastro e gestão de ordens, motoristas e veículos</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-1.5" />
                      <span>Sem acesso às configurações da empresa</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="departamentos">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-xl font-bold" style={{ color: theme.text }}>Departamentos</h2>
                <p className="text-sm" style={{ color: theme.textMuted }}>
                  Organize usuários em departamentos para atribuir responsabilidades
                </p>
              </div>
              <Button 
                onClick={() => {
                  setEditingDepartamento(null);
                  setShowDepartamentoForm(true);
                }}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Novo Departamento
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {departamentos
                .filter(d => d.empresa_id === empresa?.id)
                .map((departamento) => {
                  const membros = usuarios.filter(u => 
                    departamento.usuarios_ids?.includes(u.id)
                  );
                  const lider = usuarios.find(u => u.id === departamento.responsavel_id);

                  return (
                    <Card 
                      key={departamento.id} 
                      style={{ 
                        backgroundColor: theme.cardBg, 
                        borderColor: theme.cardBorder,
                        opacity: departamento.ativo ? 1 : 0.6
                      }}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div
                              className="w-3 h-12 rounded"
                              style={{ backgroundColor: departamento.cor }}
                            />
                            <div>
                              <CardTitle className="text-base" style={{ color: theme.text }}>
                                {departamento.nome}
                                {!departamento.ativo && (
                                  <Badge variant="outline" className="ml-2 text-xs">
                                    Inativo
                                  </Badge>
                                )}
                              </CardTitle>
                              {departamento.descricao && (
                                <p className="text-xs mt-1" style={{ color: theme.textMuted }}>
                                  {departamento.descricao}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {lider && (
                            <div>
                              <p className="text-xs font-medium mb-1" style={{ color: theme.textMuted }}>
                                Líder:
                              </p>
                              <Badge className="bg-purple-100 text-purple-800">
                                {lider.full_name}
                              </Badge>
                            </div>
                          )}

                          <div>
                            <p className="text-xs font-medium mb-2" style={{ color: theme.textMuted }}>
                              Membros ({membros.length}):
                            </p>
                            <div className="flex flex-wrap gap-1">
                              {membros.slice(0, 3).map((membro) => (
                                <Badge 
                                  key={membro.id} 
                                  variant="outline"
                                  style={{ backgroundColor: theme.cardBg }}
                                >
                                  {membro.full_name.split(' ')[0]}
                                </Badge>
                              ))}
                              {membros.length > 3 && (
                                <Badge variant="outline" style={{ backgroundColor: theme.cardBg }}>
                                  +{membros.length - 3}
                                </Badge>
                              )}
                            </div>
                          </div>

                          <div className="flex gap-2 pt-2 border-t" style={{ borderColor: theme.cardBorder }}>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setEditingDepartamento(departamento);
                                setShowDepartamentoForm(true);
                              }}
                              className="flex-1"
                            >
                              <Edit className="w-3 h-3 mr-1" />
                              Editar
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleToggleDepartamento(departamento)}
                              className="flex-1"
                            >
                              <UserX className="w-3 h-3 mr-1" />
                              {departamento.ativo ? "Desativar" : "Ativar"}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteDepartamento(departamento.id)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}

              {departamentos.filter(d => d.empresa_id === empresa?.id).length === 0 && (
                <Card className="col-span-full" style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}>
                  <CardContent className="py-12 text-center">
                    <Building2 className="w-12 h-12 mx-auto mb-3" style={{ color: theme.textMuted }} />
                    <p className="text-sm font-medium mb-1" style={{ color: theme.text }}>
                      Nenhum departamento cadastrado
                    </p>
                    <p className="text-xs mb-4" style={{ color: theme.textMuted }}>
                      Crie departamentos para organizar sua equipe
                    </p>
                    <Button 
                      onClick={() => {
                        setEditingDepartamento(null);
                        setShowDepartamentoForm(true);
                      }}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Criar Primeiro Departamento
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>

        {showEditModal && editingUser && (
          <EditarUsuarioModal
            open={showEditModal}
            onClose={() => {
              setShowEditModal(false);
              setEditingUser(null);
            }}
            usuario={editingUser}
            onSuccess={loadData}
            currentUser={currentUser}
            empresas={empresas}
            departamentos={departamentos}
          />
        )}

        {showApproveModal && approvingUser && (
          <AprovarCadastroModal
            open={showApproveModal}
            onClose={() => {
              setShowApproveModal(false);
              setApprovingUser(null);
            }}
            usuario={approvingUser}
            empresa={empresas.find(e => e.id === approvingUser.empresa_id)}
            onSuccess={loadData}
          />
        )}

        {showDepartamentoForm && (
          <DepartamentoForm
            open={showDepartamentoForm}
            onClose={() => {
              setShowDepartamentoForm(false);
              setEditingDepartamento(null);
            }}
            departamento={editingDepartamento}
            usuarios={usuarios}
            empresa={empresa}
            onSuccess={loadDepartamentos}
          />
        )}
      </div>
    </div>
  );
}