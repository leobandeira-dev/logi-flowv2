import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { tipo_verificacao, recurso } = await req.json();
    // tipo_verificacao: 'pagina' ou 'funcionalidade' ou 'acao'
    // recurso: id da página, funcionalidade ou ação

    // Admin tem acesso total
    if (user.role === 'admin') {
      return Response.json({ permitido: true, motivo: 'Admin tem acesso total' });
    }

    // Buscar empresa do usuário
    if (!user.empresa_id) {
      return Response.json({ permitido: false, motivo: 'Usuário sem empresa vinculada' });
    }

    const empresa = await base44.asServiceRole.entities.Empresa.get(user.empresa_id);

    // 1. Verificar permissões customizadas da empresa (mais específico)
    const permissaoEmpresa = await base44.asServiceRole.entities.PermissaoEmpresaCustom.filter({
      empresa_id: user.empresa_id,
      ativo: true
    });

    if (permissaoEmpresa.length > 0) {
      const perm = permissaoEmpresa[0];
      
      if (tipo_verificacao === 'pagina') {
        // Se está na lista de removidas, bloqueia
        if (perm.permissoes_customizadas?.paginas_removidas?.includes(recurso)) {
          return Response.json({ permitido: false, motivo: 'Página bloqueada para esta empresa' });
        }
        // Se está na lista de adicionais, permite
        if (perm.permissoes_customizadas?.paginas_adicionais?.includes(recurso)) {
          return Response.json({ permitido: true, motivo: 'Página extra concedida' });
        }
      }

      if (tipo_verificacao === 'funcionalidade') {
        if (perm.permissoes_customizadas?.funcionalidades_removidas?.includes(recurso)) {
          return Response.json({ permitido: false, motivo: 'Funcionalidade bloqueada' });
        }
        if (perm.permissoes_customizadas?.funcionalidades_adicionais?.includes(recurso)) {
          return Response.json({ permitido: true, motivo: 'Funcionalidade extra concedida' });
        }
      }
    }

    // 2. Verificar perfil base da empresa
    if (empresa.perfil_empresa_id) {
      const perfilEmpresa = await base44.asServiceRole.entities.PerfilEmpresa.get(empresa.perfil_empresa_id);
      
      if (tipo_verificacao === 'pagina') {
        const permitido = perfilEmpresa.permissoes?.paginas?.includes(recurso);
        return Response.json({ 
          permitido, 
          motivo: permitido ? 'Permitido pelo perfil da empresa' : 'Não incluído no perfil da empresa'
        });
      }

      if (tipo_verificacao === 'funcionalidade') {
        const permitido = perfilEmpresa.permissoes?.funcionalidades?.includes(recurso);
        return Response.json({ 
          permitido, 
          motivo: permitido ? 'Permitido pelo perfil da empresa' : 'Não incluído no perfil da empresa'
        });
      }
    }

    // 3. Verificar permissões do perfil de usuário (nível da empresa)
    if (user.tipo_perfil) {
      const permissaoPerfil = await base44.asServiceRole.entities.PermissaoPerfilUsuario.filter({
        empresa_id: user.empresa_id,
        tipo_perfil: user.tipo_perfil,
        ativo: true
      });

      if (permissaoPerfil.length > 0) {
        const perm = permissaoPerfil[0];
        
        if (tipo_verificacao === 'pagina') {
          const permitido = perm.permissoes?.paginas?.includes(recurso);
          return Response.json({ 
            permitido, 
            motivo: permitido ? 'Permitido pelo perfil de usuário' : 'Não incluído no perfil de usuário'
          });
        }

        if (tipo_verificacao === 'acao') {
          const permitido = perm.permissoes?.acoes?.[recurso] === true;
          return Response.json({ 
            permitido, 
            motivo: permitido ? 'Ação permitida' : 'Ação não autorizada para este perfil'
          });
        }
      }
    }

    // Padrão: negar acesso se não encontrou nenhuma permissão
    return Response.json({ 
      permitido: false, 
      motivo: 'Sem permissões configuradas para este recurso'
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});