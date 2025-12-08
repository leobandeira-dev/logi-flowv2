import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        
        // Verificar autenticação
        const user = await base44.auth.me();
        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Usar service role para listar todos os usuários
        const todosUsuarios = await base44.asServiceRole.entities.User.list();
        
        // Filtrar apenas usuários da mesma empresa (se usuário tiver empresa_id)
        let usuariosFiltrados = todosUsuarios;
        if (user.empresa_id) {
            usuariosFiltrados = todosUsuarios.filter(u => u.empresa_id === user.empresa_id);
        }
        
        // Retornar apenas campos necessários
        const usuariosSimplificados = usuariosFiltrados.map(u => ({
            id: u.id,
            full_name: u.full_name,
            email: u.email,
            foto_url: u.foto_url,
            cargo: u.cargo,
            role: u.role
        }));

        return Response.json(usuariosSimplificados);
    } catch (error) {
        console.error("Erro ao listar usuários:", error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});