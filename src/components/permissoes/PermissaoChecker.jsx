import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";

/**
 * Hook para verificar permissões do usuário
 * @param {string} tipo - 'pagina' | 'funcionalidade' | 'acao'
 * @param {string} recurso - ID do recurso a verificar
 * @returns {object} { permitido: boolean, loading: boolean }
 */
export function usePermissao(tipo, recurso) {
  const [permitido, setPermitido] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verificar = async () => {
      try {
        const user = await base44.auth.me();
        
        // Admin sempre tem acesso
        if (user.role === 'admin') {
          setPermitido(true);
          setLoading(false);
          return;
        }

        // Verificar via função backend
        const resultado = await base44.functions.invoke('verificarPermissao', {
          tipo_verificacao: tipo,
          recurso: recurso
        });

        setPermitido(resultado.data?.permitido || false);
      } catch (error) {
        console.error("Erro ao verificar permissão:", error);
        setPermitido(false);
      } finally {
        setLoading(false);
      }
    };

    if (tipo && recurso) {
      verificar();
    }
  }, [tipo, recurso]);

  return { permitido, loading };
}

/**
 * Componente que renderiza children apenas se usuário tiver permissão
 */
export function PermissaoGuard({ tipo, recurso, children, fallback = null }) {
  const { permitido, loading } = usePermissao(tipo, recurso);

  if (loading) return null;
  if (!permitido) return fallback;
  
  return <>{children}</>;
}

/**
 * HOC para proteger páginas inteiras
 */
export function comPermissao(Component, paginaId) {
  return function ComponenteProtegido(props) {
    const { permitido, loading } = usePermissao('pagina', paginaId);
    const [user, setUser] = useState(null);

    useEffect(() => {
      base44.auth.me().then(setUser);
    }, []);

    if (loading) {
      return (
        <div className="flex items-center justify-center h-screen">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      );
    }

    if (!permitido && user?.role !== 'admin') {
      return (
        <div className="flex items-center justify-center h-screen p-6">
          <div className="max-w-md text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Acesso Negado</h2>
            <p className="text-gray-600 mb-6">
              Você não tem permissão para acessar esta página. Entre em contato com o administrador.
            </p>
          </div>
        </div>
      );
    }

    return <Component {...props} />;
  };
}