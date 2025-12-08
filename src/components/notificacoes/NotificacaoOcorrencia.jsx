import React, { useState, useEffect, useRef } from "react";
import { X, AlertCircle, Clock, User } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function NotificacaoOcorrencia({ 
  ocorrencia, 
  ordem, 
  registrador,
  onClose,
  onTratar,
  isDark 
}) {
  const [visible, setVisible] = useState(true);
  const [exiting, setExiting] = useState(false);
  const timerRef = useRef(null);

  // Auto-fechar após 10 segundos
  useEffect(() => {
    timerRef.current = setTimeout(() => {
      handleClose();
    }, 10000);

    // Limpar timer ao desmontar ou se fechar manualmente
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  const handleClose = () => {
    // Cancelar auto-close se existir
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    
    // Marcar como vista no localStorage para não reaparecer
    const vistas = JSON.parse(localStorage.getItem('ocorrencias_vistas') || '[]');
    if (!vistas.includes(ocorrencia.id)) {
      vistas.push(ocorrencia.id);
      localStorage.setItem('ocorrencias_vistas', JSON.stringify(vistas));
    }
    
    setExiting(true);
    setTimeout(() => {
      setVisible(false);
      onClose();
    }, 300);
  };

  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Cancelar auto-close
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    
    // Fechar notificação e abrir modal de tratamento
    setExiting(true);
    setTimeout(() => {
      setVisible(false);
      onTratar(ocorrencia, ordem);
      onClose();
    }, 300);
  };

  if (!visible) return null;

  const gravidadeColors = {
    baixa: { 
      bg: isDark ? "bg-blue-600/20" : "bg-blue-50", 
      border: isDark ? "border-blue-500" : "border-blue-300", 
      text: isDark ? "text-blue-300" : "text-blue-900",
      label: isDark ? "text-blue-200" : "text-blue-800",
      badge: isDark ? "bg-blue-600 text-white" : "bg-blue-600 text-white"
    },
    media: { 
      bg: isDark ? "bg-yellow-600/20" : "bg-yellow-50", 
      border: isDark ? "border-yellow-500" : "border-yellow-300", 
      text: isDark ? "text-yellow-300" : "text-yellow-900",
      label: isDark ? "text-yellow-200" : "text-yellow-800",
      badge: isDark ? "bg-yellow-600 text-white" : "bg-yellow-600 text-white"
    },
    alta: { 
      bg: isDark ? "bg-orange-600/20" : "bg-orange-50", 
      border: isDark ? "border-orange-500" : "border-orange-300", 
      text: isDark ? "text-orange-300" : "text-orange-900",
      label: isDark ? "text-orange-200" : "text-orange-800",
      badge: isDark ? "bg-orange-600 text-white" : "bg-orange-600 text-white"
    },
    critica: { 
      bg: isDark ? "bg-red-600/20" : "bg-red-50", 
      border: isDark ? "border-red-500" : "border-red-300", 
      text: isDark ? "text-red-300" : "text-red-900",
      label: isDark ? "text-red-200" : "text-red-800",
      badge: isDark ? "bg-red-600 text-white" : "bg-red-600 text-white"
    }
  };

  const colors = gravidadeColors[ocorrencia.gravidade] || gravidadeColors.media;

  return (
    <div
      className={`w-80 rounded-xl shadow-2xl border-2 overflow-hidden transition-all duration-300 ${
        exiting ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'
      } ${colors.border}`}
      style={{
        backgroundColor: isDark ? '#1e293b' : '#ffffff',
        boxShadow: isDark 
          ? '0 10px 40px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.1)' 
          : '0 10px 40px rgba(0, 0, 0, 0.25)'
      }}
    >
      {/* Header */}
      <div 
        className={`flex items-center justify-between p-4 border-b-2 ${colors.bg}`}
        style={{ 
          borderBottomColor: isDark ? '#334155' : '#e5e7eb'
        }}
      >
        <div className="flex items-center gap-2">
          <AlertCircle className={`w-5 h-5 ${isDark ? 'text-orange-400' : 'text-orange-600'}`} />
          <span className={`font-bold text-base ${isDark ? 'text-white' : 'text-gray-900'}`}>
            🔔 Nova Ocorrência
          </span>
        </div>
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleClose();
          }}
          className={`p-1.5 rounded-full transition-colors ${
            isDark 
              ? 'hover:bg-gray-700/50 text-gray-400 hover:text-white' 
              : 'hover:bg-gray-200 text-gray-600 hover:text-gray-900'
          }`}
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Body - Clicável */}
      <div 
        onClick={handleClick}
        className={`p-4 cursor-pointer transition-colors ${
          isDark ? 'hover:bg-gray-800/50' : 'hover:bg-gray-50'
        }`}
      >
        {/* Ticket e Gravidade */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className={`text-xs font-mono font-bold px-2.5 py-1 rounded-md border-2 shadow-sm ${
              isDark 
                ? 'text-orange-300 bg-orange-600/30 border-orange-500' 
                : 'text-orange-700 bg-orange-100 border-orange-400'
            }`}>
              #{ocorrencia.numero_ticket}
            </span>
            <span className={`text-xs font-bold px-2.5 py-1 rounded-md border-2 ${colors.badge} shadow-sm`}>
              {ocorrencia.gravidade.toUpperCase()}
            </span>
          </div>
          <div className={`flex items-center gap-1 text-xs font-bold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            <Clock className="w-3.5 h-3.5" />
            {format(new Date(ocorrencia.data_inicio), "HH:mm", { locale: ptBR })}
          </div>
        </div>

        {/* Tipo da Ocorrência */}
        <h3 className={`font-bold text-lg mb-3 leading-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>
          {ocorrencia.tipo || "Ocorrência"}
        </h3>

        {/* Ordem */}
        {ordem && (
          <div className={`mb-3 p-3 rounded-lg border-2 ${
            isDark 
              ? 'bg-blue-600/10 border-blue-500/30' 
              : 'bg-blue-50 border-blue-200'
          }`}>
            <p className={`text-sm font-bold mb-1 ${isDark ? 'text-blue-300' : 'text-blue-700'}`}>
              📦 {ordem.numero_carga || `#${ordem.id?.slice(-6)}`}
            </p>
            <p className={`text-sm font-semibold truncate ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              {ordem.cliente}
            </p>
          </div>
        )}

        {/* Observações (preview) */}
        <p className={`text-sm mb-3 line-clamp-2 font-medium leading-relaxed ${
          isDark ? 'text-gray-300' : 'text-gray-700'
        }`}>
          {ocorrencia.observacoes}
        </p>

        {/* Registrador */}
        {registrador && (
          <div className={`flex items-center gap-2.5 pt-3 border-t-2 ${
            isDark ? 'border-gray-700' : 'border-gray-200'
          }`}>
            <div 
              className="w-8 h-8 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0 border-2"
              style={{
                backgroundColor: registrador.foto_url ? 'transparent' : (isDark ? '#1e3a8a' : '#dbeafe'),
                borderColor: isDark ? '#3b82f6' : '#93c5fd'
              }}
            >
              {registrador.foto_url ? (
                <img 
                  src={registrador.foto_url} 
                  alt={registrador.full_name} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-4 h-4" style={{ color: isDark ? '#60a5fa' : '#1d4ed8' }} />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-bold leading-tight truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {registrador.full_name}
              </p>
              <p className={`text-xs leading-tight font-semibold ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                registrou esta ocorrência
              </p>
            </div>
          </div>
        )}

        {/* Call to Action */}
        <div className={`mt-4 pt-3 border-t-2 ${
          isDark ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <p className={`text-sm text-center font-bold ${isDark ? 'text-blue-400' : 'text-blue-700'}`}>
            👆 Clique para tratar esta ocorrência
          </p>
        </div>
      </div>

      {/* Progress bar */}
      <div 
        className={`h-1.5 transition-all ease-linear ${
          isDark 
            ? 'bg-gradient-to-r from-blue-500 to-purple-500' 
            : 'bg-gradient-to-r from-blue-600 to-purple-600'
        }`}
        style={{ 
          width: exiting ? '0%' : '100%',
          transitionDuration: exiting ? '300ms' : '10000ms'
        }}
      />
    </div>
  );
}