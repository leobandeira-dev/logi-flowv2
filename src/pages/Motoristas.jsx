
import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, RefreshCw } from "lucide-react";

import MotoristasTable from "../components/motoristas/MotoristasTable";
import MotoristaForm from "../components/motoristas/MotoristaForm";

export default function Motoristas() {
  const [motoristas, setMotoristas] = useState([]);
  const [veiculos, setVeiculos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingMotorista, setEditingMotorista] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDark, setIsDark] = useState(false);

  // Detect dark mode
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
      const [motoristasData, veiculosData] = await Promise.all([
        base44.entities.Motorista.list("-created_date"),
        base44.entities.Veiculo.list()
      ]);
      setMotoristas(motoristasData);
      setVeiculos(veiculosData);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (data) => {
    try {
      if (editingMotorista) {
        await base44.entities.Motorista.update(editingMotorista.id, data);
      } else {
        await base44.entities.Motorista.create({
          ...data,
          data_cadastro: new Date().toISOString().split('T')[0]
        });
      }
      
      setShowForm(false);
      setEditingMotorista(null);
      loadData();
    } catch (error) {
      console.error("Erro ao salvar motorista:", error);
    }
  };

  const handleEdit = (motorista) => {
    setEditingMotorista(motorista);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingMotorista(null);
  };

  const filteredMotoristas = motoristas.filter(motorista => {
    if (!searchTerm) return true;
    
    const term = searchTerm.toLowerCase();
    return (
      motorista.nome?.toLowerCase().includes(term) ||
      motorista.cpf?.toLowerCase().includes(term) ||
      motorista.cnh?.toLowerCase().includes(term) ||
      motorista.telefone?.toLowerCase().includes(term)
    );
  });

  const theme = {
    bg: isDark ? '#0f172a' : '#f9fafb',
    text: isDark ? '#ffffff' : '#111827',
    textMuted: isDark ? '#9ca3af' : '#6b7280',
    inputBg: isDark ? '#1e293b' : '#ffffff',
    inputBorder: isDark ? '#334155' : '#d1d5db',
  };

  return (
    <div className="p-6 min-h-screen transition-colors" style={{ backgroundColor: theme.bg }}>
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
          <div>
            <h1 className="text-2xl font-bold mb-1" style={{ color: theme.text }}>Motoristas</h1>
            <p className="text-sm" style={{ color: theme.textMuted }}>Gerencie os motoristas cadastrados</p>
          </div>

          <div className="flex gap-2 w-full lg:w-auto">
            <div className="relative flex-1 lg:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: theme.textMuted }} />
              <Input
                placeholder="Buscar motoristas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-9"
                style={{ backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.text }}
              />
            </div>
            <Button variant="outline" size="icon" onClick={loadData}
              style={{ borderColor: theme.inputBorder, backgroundColor: 'transparent', color: theme.text }}>
              <RefreshCw className="w-4 h-4" />
            </Button>
            <Button onClick={() => setShowForm(true)} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Novo Motorista
            </Button>
          </div>
        </div>

        <MotoristasTable
          motoristas={filteredMotoristas}
          veiculos={veiculos}
          loading={loading}
          onEdit={handleEdit}
        />
      </div>

      {showForm && (
        <MotoristaForm
          open={showForm}
          onClose={handleFormClose}
          onSubmit={handleSubmit}
          editingMotorista={editingMotorista}
          veiculos={veiculos}
        />
      )}
    </div>
  );
}
