
import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, RefreshCw } from "lucide-react";

import VeiculosTable from "../components/veiculos/VeiculosTable";
import VeiculoForm from "../components/veiculos/VeiculoForm";

export default function Veiculos() {
  const [veiculos, setVeiculos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingVeiculo, setEditingVeiculo] = useState(null);
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
    loadVeiculos();
  }, []);

  const loadVeiculos = async () => {
    setLoading(true);
    try {
      const data = await base44.entities.Veiculo.list("-created_date");
      setVeiculos(data);
    } catch (error) {
      console.error("Erro ao carregar veículos:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (data) => {
    try {
      if (editingVeiculo) {
        await base44.entities.Veiculo.update(editingVeiculo.id, data);
      } else {
        await base44.entities.Veiculo.create(data);
      }
      
      setShowForm(false);
      setEditingVeiculo(null);
      loadVeiculos();
    } catch (error) {
      console.error("Erro ao salvar veículo:", error);
    }
  };

  const handleEdit = (veiculo) => {
    setEditingVeiculo(veiculo);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingVeiculo(null);
  };

  const filteredVeiculos = veiculos.filter(veiculo => {
    if (!searchTerm) return true;
    
    const term = searchTerm.toLowerCase();
    return (
      veiculo.placa?.toLowerCase().includes(term) ||
      veiculo.marca?.toLowerCase().includes(term) ||
      veiculo.modelo?.toLowerCase().includes(term) ||
      veiculo.proprietario?.toLowerCase().includes(term)
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
            <h1 className="text-2xl font-bold mb-1" style={{ color: theme.text }}>Veículos</h1>
            <p className="text-sm" style={{ color: theme.textMuted }}>Gerencie os veículos cadastrados</p>
          </div>

          <div className="flex gap-2 w-full lg:w-auto">
            <div className="relative flex-1 lg:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: theme.textMuted }} />
              <Input
                placeholder="Buscar veículos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-9"
                style={{ backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.text }}
              />
            </div>
            <Button variant="outline" size="icon" onClick={loadVeiculos}
              style={{ borderColor: theme.inputBorder, backgroundColor: 'transparent', color: theme.text }}>
              <RefreshCw className="w-4 h-4" />
            </Button>
            <Button onClick={() => setShowForm(true)} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Novo Veículo
            </Button>
          </div>
        </div>

        <VeiculosTable
          veiculos={filteredVeiculos}
          loading={loading}
          onEdit={handleEdit}
        />
      </div>

      {showForm && (
        <VeiculoForm
          open={showForm}
          onClose={handleFormClose}
          onSubmit={handleSubmit}
          editingVeiculo={editingVeiculo}
        />
      )}
    </div>
  );
}
