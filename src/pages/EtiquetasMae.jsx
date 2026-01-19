import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { cache, STORES } from "../components/utils/localCache";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { 
  Plus, 
  Search, 
  RefreshCw, 
  Package, 
  Eye, 
  Layers,
  CheckCircle2,
  Box,
  Scan,
  Trash2,
  FileText,
  X,
  Printer,
  Camera,
  Edit,
  History,
  UserPlus,
  UserMinus
} from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User } from "lucide-react";
import ImpressaoEtiquetaMae from "../components/etiquetas-mae/ImpressaoEtiquetaMae";
import CameraScanner from "../components/etiquetas-mae/CameraScanner";
import { playSuccessBeep, playErrorBeep } from "../components/utils/audioFeedback";

export default function EtiquetasMae() {
  const [etiquetas, setEtiquetas] = useState([]);
  const [volumes, setVolumes] = useState([]);
  const [notas, setNotas] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [empresa, setEmpresa] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDark, setIsDark] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showUnitizacaoModal, setShowUnitizacaoModal] = useState(false);
  const [showImpressaoModal, setShowImpressaoModal] = useState(false);
  const [etiquetaSelecionada, setEtiquetaSelecionada] = useState(null);
  const [criandoEtiqueta, setCriandoEtiqueta] = useState(false);
  const [codigoScanner, setCodigoScanner] = useState("");
  const [processando, setProcessando] = useState(false);
  const [volumesVinculados, setVolumesVinculados] = useState([]);
  const [showCameraScanner, setShowCameraScanner] = useState(false);
  const [showVolumeCameraScanner, setShowVolumeCameraScanner] = useState(false);
  const [origensVolumes, setOrigensVolumes] = useState({});
  const [historico, setHistorico] = useState([]);
  const [cameraScanFeedback, setCameraScanFeedback] = useState(null);
  
  const [novaEtiqueta, setNovaEtiqueta] = useState({
    codigo: "",
    cliente: "",
    cidade_destino: "",
    uf_destino: "",
    observacoes: ""
  });

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

      if (user.tipo_perfil !== "operador" && user.role !== "admin") {
        toast.error("Acesso negado. Esta página é apenas para operadores.");
        return;
      }

      // Tentar cache primeiro para dados menos críticos
      const cachedEtiquetas = await cache.get(STORES.ETIQUETAS_MAE, 'all');
      const cachedVolumes = await cache.get(STORES.VOLUMES, 'all');
      const cachedNotas = await cache.get(STORES.NOTAS_FISCAIS, 'all');
      
      if (cachedEtiquetas && cachedVolumes && cachedNotas) {
        // Carregar do cache primeiro para resposta instantânea
        setEtiquetas(cachedEtiquetas);
        setVolumes(cachedVolumes);
        setNotas(cachedNotas);
        setLoading(false);
        
        // Atualizar em background
        loadDataFromServer(user, true);
        return;
      }

      // Se não tem cache, carregar do servidor
      await loadDataFromServer(user, false);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      toast.error("Erro ao carregar dados");
      setLoading(false);
    }
  };

  const loadDataFromServer = async (user, isBackground = false) => {
    try {
      if (!isBackground) setLoading(true);

      // Carregar empresa se necessário
      if (user.empresa_id && !empresa) {
        const empresaData = await base44.entities.Empresa.get(user.empresa_id);
        setEmpresa(empresaData);
      }

      // Carregar apenas etiquetas recentes (último mês) e dados essenciais
      const etiquetasData = await base44.entities.EtiquetaMae.filter(
        {},
        "-created_date",
        100
      );

      // Coletar IDs únicos de volumes e notas das etiquetas
      const volumeIdsNecessarios = new Set();
      const notaIdsNecessarias = new Set();

      etiquetasData.forEach(etq => {
        etq.volumes_ids?.forEach(id => volumeIdsNecessarios.add(id));
        etq.notas_fiscais_ids?.forEach(id => notaIdsNecessarias.add(id));
      });

      // Carregar apenas volumes e notas necessários
      const [volumesData, notasData, usuariosData] = await Promise.all([
        volumeIdsNecessarios.size > 0 
          ? base44.entities.Volume.list()
          : Promise.resolve([]),
        notaIdsNecessarias.size > 0
          ? base44.entities.NotaFiscal.list()
          : Promise.resolve([]),
        (await cache.get(STORES.USUARIOS, 'all')) || base44.entities.User.list().catch(() => [])
      ]);

      // Salvar em cache (TTL: 2 minutos para dados do armazém)
      await Promise.all([
        cache.set(STORES.ETIQUETAS_MAE, 'all', etiquetasData, 2 * 60 * 1000),
        cache.set(STORES.VOLUMES, 'all', volumesData, 2 * 60 * 1000),
        cache.set(STORES.NOTAS_FISCAIS, 'all', notasData, 2 * 60 * 1000),
      ]);

      setEtiquetas(etiquetasData || []);
      setVolumes(volumesData || []);
      setNotas(notasData || []);
      setUsuarios(usuariosData || []);

      console.log('✅ Dados carregados e em cache');
    } catch (error) {
      console.error("Erro ao carregar do servidor:", error);
      if (!isBackground) {
        toast.error("Erro ao carregar dados");
      }
    } finally {
      if (!isBackground) setLoading(false);
    }
  };

  const generateCodigoEtiqueta = () => {
    const now = new Date();
    const ano = now.getFullYear();
    const mes = String(now.getMonth() + 1).padStart(2, '0');
    const dia = String(now.getDate()).padStart(2, '0');
    const hh = String(now.getHours()).padStart(2, '0');
    const mm = String(now.getMinutes()).padStart(2, '0');
    return `${ano}${mes}${dia}${hh}${mm}`;
  };

  const handleCriarEtiqueta = async () => {
    if (!novaEtiqueta.cliente.trim()) {
      toast.error("Informe o cliente");
      return;
    }

    if (!novaEtiqueta.cidade_destino.trim() || !novaEtiqueta.uf_destino.trim()) {
      toast.error("Informe a cidade e UF de destino");
      return;
    }

    setCriandoEtiqueta(true);
    try {
      const user = await base44.auth.me();
      const codigoGerado = generateCodigoEtiqueta();
      
      const novaEtiquetaData = await base44.entities.EtiquetaMae.create({
        codigo: codigoGerado,
        descricao: `${novaEtiqueta.cliente} - ${novaEtiqueta.cidade_destino}/${novaEtiqueta.uf_destino}`,
        observacoes: novaEtiqueta.observacoes,
        status: "criada",
        volumes_ids: [],
        quantidade_volumes: 0,
        peso_total: 0,
        m3_total: 0,
        notas_fiscais_ids: [],
        data_criacao: new Date().toISOString(),
        criado_por: user.id
      });

      // Registrar histórico de criação
      await base44.entities.HistoricoEtiquetaMae.create({
        etiqueta_mae_id: novaEtiquetaData.id,
        tipo_acao: "criacao",
        observacao: `Etiqueta mãe criada`,
        usuario_id: user.id,
        usuario_nome: user.full_name
      });

      toast.success("Etiqueta mãe criada com sucesso!");
      
      const etiquetaCriada = await base44.entities.EtiquetaMae.filter({ codigo: codigoGerado });
      
      setShowCreateModal(false);
      setNovaEtiqueta({ codigo: "", cliente: "", cidade_destino: "", uf_destino: "", observacoes: "" });
      
      await loadData();
      
      // Perguntar se deseja imprimir
      const desejaImprimir = confirm("Etiqueta criada com sucesso! Deseja imprimir agora?");
      if (desejaImprimir && etiquetaCriada.length > 0) {
        setEtiquetaSelecionada(etiquetaCriada[0]);
        setShowImpressaoModal(true);
      }
    } catch (error) {
      console.error("Erro ao criar etiqueta:", error);
      toast.error("Erro ao criar etiqueta mãe");
    } finally {
      setCriandoEtiqueta(false);
    }
  };

  const handleVerDetalhes = (etiqueta) => {
    setEtiquetaSelecionada(etiqueta);
    setShowDetailsModal(true);
  };

  const handleIniciarUnitizacao = async (etiqueta) => {
    setEtiquetaSelecionada(etiqueta);
    
    if (etiqueta.volumes_ids && etiqueta.volumes_ids.length > 0) {
      // Carregar volumes vinculados do cache ou servidor
      let vinculados = volumes.filter(v => etiqueta.volumes_ids.includes(v.id));
      
      // Se não encontrou todos os volumes, buscar do servidor
      if (vinculados.length < etiqueta.volumes_ids.length) {
        try {
          const volumesCompletos = await base44.entities.Volume.list();
          vinculados = volumesCompletos.filter(v => etiqueta.volumes_ids.includes(v.id));
          setVolumes(volumesCompletos);
          await cache.set(STORES.VOLUMES, 'all', volumesCompletos, 2 * 60 * 1000);
        } catch (error) {
          console.error("Erro ao carregar volumes:", error);
        }
      }
      
      setVolumesVinculados(vinculados);
      
      // Carregar histórico sob demanda
      try {
        const historicoEtiqueta = await base44.entities.HistoricoEtiquetaMae.filter(
          { etiqueta_mae_id: etiqueta.id },
          "-created_date"
        );
        setHistorico(prev => {
          const outros = prev.filter(h => h.etiqueta_mae_id !== etiqueta.id);
          return [...outros, ...historicoEtiqueta];
        });
      } catch (error) {
        console.error("Erro ao carregar histórico:", error);
      }
    } else {
      setVolumesVinculados([]);
    }
    
    setCodigoScanner("");
    setShowUnitizacaoModal(true);
  };

  const handleCameraScan = async (codigo) => {
    if (!codigo || !codigo.trim()) return;

    setProcessando(true);
    try {
      const etiquetaEncontrada = etiquetas.find(e => e.codigo === codigo.trim());
      
      if (!etiquetaEncontrada) {
        toast.error("Etiqueta mãe não encontrada");
        setShowCameraScanner(false);
        setProcessando(false);
        return;
      }

      toast.success("Etiqueta encontrada! Abrindo unitização...");
      setShowCameraScanner(false);
      
      setTimeout(() => {
        handleIniciarUnitizacao(etiquetaEncontrada);
        setProcessando(false);
      }, 300);
    } catch (error) {
      console.error("Erro ao processar código:", error);
      toast.error("Erro ao processar código");
      setProcessando(false);
    }
  };

  const handleVolumeCameraScan = async (codigo) => {
    return await handleScanComFeedback(codigo.trim());
  };

  const handleScanComFeedback = async (codigo) => {
    if (!codigo || !codigo.trim() || !etiquetaSelecionada) return 'error';

    setProcessando(true);
    try {
      const codigoLimpo = codigo.trim();
      
      // Se for chave NF-e (44 dígitos), processar nota fiscal
      if (codigoLimpo.length === 44 && /^\d+$/.test(codigoLimpo)) {
        await handleScanChaveNFe(codigoLimpo);
        setCodigoScanner("");
        setProcessando(false);
        setCameraScanFeedback('success');
        setTimeout(() => setCameraScanFeedback(null), 800);
        return 'success';
      }

      const volumeEncontrado = volumes.find(v => v.identificador_unico === codigoLimpo);

      if (!volumeEncontrado) {
        playErrorBeep();
        toast.error("Volume não encontrado");
        setCodigoScanner("");
        setProcessando(false);
        setCameraScanFeedback('error');
        setTimeout(() => setCameraScanFeedback(null), 800);
        return 'error';
      }

      if (volumeEncontrado.etiqueta_mae_id && volumeEncontrado.etiqueta_mae_id !== etiquetaSelecionada.id) {
        const etiquetaAnterior = await base44.entities.EtiquetaMae.get(volumeEncontrado.etiqueta_mae_id);
        
        if (etiquetaAnterior.status !== "cancelada") {
          playErrorBeep();
          toast.error(`Volume já vinculado à etiqueta ${etiquetaAnterior.codigo}`);
          setCodigoScanner("");
          setProcessando(false);
          setCameraScanFeedback('error');
          setTimeout(() => setCameraScanFeedback(null), 800);
          return 'error';
        }
      }

      if (volumesVinculados.some(v => v.id === volumeEncontrado.id)) {
        playErrorBeep();
        toast.warning("⚠️ Volume já bipado nesta etiqueta");
        setCodigoScanner("");
        setProcessando(false);
        setCameraScanFeedback('duplicate');
        setTimeout(() => setCameraScanFeedback(null), 800);
        return 'duplicate';
      }

      // Marcar origem do volume se ainda não existir
      if (!origensVolumes[volumeEncontrado.id]) {
        setOrigensVolumes(prev => ({ ...prev, [volumeEncontrado.id]: "Base" }));
      }

      const volumeAtualizado = {
        ...volumeEncontrado,
        etiqueta_mae_id: etiquetaSelecionada.id,
        data_vinculo_etiqueta_mae: new Date().toISOString()
      };

      const user = await base44.auth.me();

      await base44.entities.Volume.update(volumeEncontrado.id, {
        etiqueta_mae_id: etiquetaSelecionada.id,
        data_vinculo_etiqueta_mae: new Date().toISOString()
      });

      await base44.entities.HistoricoEtiquetaMae.create({
        etiqueta_mae_id: etiquetaSelecionada.id,
        tipo_acao: "adicao_volume",
        volume_id: volumeEncontrado.id,
        volume_identificador: volumeEncontrado.identificador_unico,
        observacao: `Volume ${volumeEncontrado.identificador_unico} adicionado`,
        usuario_id: user.id,
        usuario_nome: user.full_name
      });

      const novosVolumesIds = [...(etiquetaSelecionada.volumes_ids || []), volumeEncontrado.id];
      const volumesAtualizados = [...volumesVinculados, volumeAtualizado];

      const pesoTotal = volumesAtualizados.reduce((sum, v) => sum + (v.peso_volume || 0), 0);
      const m3Total = volumesAtualizados.reduce((sum, v) => sum + (v.m3 || 0), 0);
      const notasIds = [...new Set(volumesAtualizados.map(v => v.nota_fiscal_id).filter(Boolean))];

      await base44.entities.EtiquetaMae.update(etiquetaSelecionada.id, {
        volumes_ids: novosVolumesIds,
        quantidade_volumes: novosVolumesIds.length,
        peso_total: pesoTotal,
        m3_total: m3Total,
        notas_fiscais_ids: notasIds,
        status: "em_unitizacao"
      });

      const etiquetaAtualizada = {
        ...etiquetaSelecionada,
        volumes_ids: novosVolumesIds,
        quantidade_volumes: novosVolumesIds.length,
        peso_total: pesoTotal,
        m3_total: m3Total,
        notas_fiscais_ids: notasIds,
        status: "em_unitizacao"
      };

      setEtiquetaSelecionada(etiquetaAtualizada);
      setVolumesVinculados(volumesAtualizados);
      setVolumes(volumes.map(v => v.id === volumeEncontrado.id ? volumeAtualizado : v));
      setEtiquetas(etiquetas.map(e => e.id === etiquetaSelecionada.id ? etiquetaAtualizada : e));

      const nota = notas.find(n => n.id === volumeEncontrado.nota_fiscal_id);
      const volumesNotaAtualizados = volumesAtualizados.filter(v => v.nota_fiscal_id === volumeEncontrado.nota_fiscal_id);
      const todosVolumesNota = volumes.filter(v => v.nota_fiscal_id === volumeEncontrado.nota_fiscal_id);
      const faltamNota = todosVolumesNota.length - volumesNotaAtualizados.length;
      
      playSuccessBeep();
      
      const feedbackMsg = `✅ Volume ${volumesNotaAtualizados.length}/${todosVolumesNota.length} adicionado\n` +
        `📋 NF ${nota?.numero_nota || '-'}\n` +
        (faltamNota > 0 ? `⏳ Faltam ${faltamNota} volume(s)\n` : `✓ NF COMPLETA!\n`) +
        `📦 Total: ${volumesAtualizados.length} vol. na etiqueta`;
      
      toast.success(feedbackMsg, { 
        duration: faltamNota === 0 ? 4000 : 3000,
        style: { 
          whiteSpace: 'pre-line', 
          fontSize: '12px', 
          lineHeight: '1.4',
          fontWeight: faltamNota === 0 ? 'bold' : 'normal',
          background: faltamNota === 0 ? '#10b981' : undefined,
          color: faltamNota === 0 ? 'white' : undefined
        }
      });
      
      setCodigoScanner("");
      setProcessando(false);
      setCameraScanFeedback('success');
      setTimeout(() => setCameraScanFeedback(null), 800);
      
      return 'success';
    } catch (error) {
      console.error("Erro ao processar código:", error);
      toast.error("Erro ao processar");
      playErrorBeep();
      setCodigoScanner("");
      setProcessando(false);
      setCameraScanFeedback('error');
      setTimeout(() => setCameraScanFeedback(null), 800);
      return 'error';
    }
  };

  const handleScan = async (codigo) => {
    if (!codigo || !codigo.trim() || !etiquetaSelecionada) return;

    setProcessando(true);
    try {
      const codigoLimpo = codigo.trim();
      
      // Se for chave NF-e (44 dígitos), processar nota fiscal
      if (codigoLimpo.length === 44 && /^\d+$/.test(codigoLimpo)) {
        await handleScanChaveNFe(codigoLimpo);
        setCodigoScanner("");
        setProcessando(false);
        return;
      }

      const volumeEncontrado = volumes.find(v => v.identificador_unico === codigoLimpo);

      if (!volumeEncontrado) {
        playErrorBeep();
        toast.error("Volume não encontrado");
        setCodigoScanner("");
        setProcessando(false);
        return;
      }

      if (volumeEncontrado.etiqueta_mae_id && volumeEncontrado.etiqueta_mae_id !== etiquetaSelecionada.id) {
        const etiquetaAnterior = await base44.entities.EtiquetaMae.get(volumeEncontrado.etiqueta_mae_id);
        
        // Se a etiqueta anterior está cancelada, permitir o vínculo com a nova
        if (etiquetaAnterior.status === "cancelada") {
          console.log(`Volume estava vinculado à etiqueta cancelada ${etiquetaAnterior.codigo}, permitindo novo vínculo`);
          toast.info(`Volume estava em etiqueta cancelada, vinculando aqui...`);
          // Continuar o processo normalmente - não retornar
        } else {
          playErrorBeep();
          toast.error(`Volume já vinculado à etiqueta ${etiquetaAnterior.codigo} (status: ${etiquetaAnterior.status})`);
          setCodigoScanner("");
          setProcessando(false);
          return;
        }
      }

      if (volumesVinculados.some(v => v.id === volumeEncontrado.id)) {
        playErrorBeep();
        toast.warning("⚠️ Volume já bipado nesta etiqueta");
        setCodigoScanner("");
        setProcessando(false);
        return;
      }

      // Marcar origem do volume se ainda não existir
      if (!origensVolumes[volumeEncontrado.id]) {
        setOrigensVolumes(prev => ({ ...prev, [volumeEncontrado.id]: "Base" }));
      }

      // Atualizar volume localmente
      const volumeAtualizado = {
        ...volumeEncontrado,
        etiqueta_mae_id: etiquetaSelecionada.id,
        data_vinculo_etiqueta_mae: new Date().toISOString()
      };

      const user = await base44.auth.me();

      await base44.entities.Volume.update(volumeEncontrado.id, {
        etiqueta_mae_id: etiquetaSelecionada.id,
        data_vinculo_etiqueta_mae: new Date().toISOString()
      });

      // Registrar histórico de adição
      await base44.entities.HistoricoEtiquetaMae.create({
        etiqueta_mae_id: etiquetaSelecionada.id,
        tipo_acao: "adicao_volume",
        volume_id: volumeEncontrado.id,
        volume_identificador: volumeEncontrado.identificador_unico,
        observacao: `Volume ${volumeEncontrado.identificador_unico} adicionado`,
        usuario_id: user.id,
        usuario_nome: user.full_name
      });

      const novosVolumesIds = [...(etiquetaSelecionada.volumes_ids || []), volumeEncontrado.id];
      const volumesAtualizados = [...volumesVinculados, volumeAtualizado];

      const pesoTotal = volumesAtualizados.reduce((sum, v) => sum + (v.peso_volume || 0), 0);
      const m3Total = volumesAtualizados.reduce((sum, v) => sum + (v.m3 || 0), 0);
      const notasIds = [...new Set(volumesAtualizados.map(v => v.nota_fiscal_id).filter(Boolean))];

      await base44.entities.EtiquetaMae.update(etiquetaSelecionada.id, {
        volumes_ids: novosVolumesIds,
        quantidade_volumes: novosVolumesIds.length,
        peso_total: pesoTotal,
        m3_total: m3Total,
        notas_fiscais_ids: notasIds,
        status: "em_unitizacao"
      });

      // Atualizar estados localmente sem recarregar
      const etiquetaAtualizada = {
        ...etiquetaSelecionada,
        volumes_ids: novosVolumesIds,
        quantidade_volumes: novosVolumesIds.length,
        peso_total: pesoTotal,
        m3_total: m3Total,
        notas_fiscais_ids: notasIds,
        status: "em_unitizacao"
      };

      setEtiquetaSelecionada(etiquetaAtualizada);
      setVolumesVinculados(volumesAtualizados);

      // Atualizar arrays locais
      setVolumes(volumes.map(v => v.id === volumeEncontrado.id ? volumeAtualizado : v));
      setEtiquetas(etiquetas.map(e => e.id === etiquetaSelecionada.id ? etiquetaAtualizada : e));

      // Feedback com informações do volume e progresso da nota
      const nota = notas.find(n => n.id === volumeEncontrado.nota_fiscal_id);
      const volumesNotaAtualizados = volumesAtualizados.filter(v => v.nota_fiscal_id === volumeEncontrado.nota_fiscal_id);
      const todosVolumesNota = volumes.filter(v => v.nota_fiscal_id === volumeEncontrado.nota_fiscal_id);
      const faltamNota = todosVolumesNota.length - volumesNotaAtualizados.length;
      
      playSuccessBeep();
      
      const feedbackMsg = `✅ Volume ${volumesNotaAtualizados.length}/${todosVolumesNota.length} adicionado\n` +
        `📋 NF ${nota?.numero_nota || '-'}\n` +
        (faltamNota > 0 ? `⏳ Faltam ${faltamNota} volume(s)\n` : `✓ NF COMPLETA!\n`) +
        `📦 Total: ${volumesAtualizados.length} vol. na etiqueta`;
      
      toast.success(feedbackMsg, { 
        duration: faltamNota === 0 ? 4000 : 3000,
        style: { 
          whiteSpace: 'pre-line', 
          fontSize: '12px', 
          lineHeight: '1.4',
          fontWeight: faltamNota === 0 ? 'bold' : 'normal',
          background: faltamNota === 0 ? '#10b981' : undefined,
          color: faltamNota === 0 ? 'white' : undefined
        }
      });
      
      setCodigoScanner("");
      
      // Manter foco no campo para próxima leitura
      setTimeout(() => {
        const input = document.querySelector('input[placeholder*="Bipe volume ou chave NF-e"]');
        if (input) {
          input.focus();
          input.select();
        }
      }, 100);
    } catch (error) {
      console.error("Erro ao processar código:", error);
      toast.error("Erro ao processar");
      
      // Manter foco mesmo em caso de erro
      setCodigoScanner("");
      setTimeout(() => {
        const input = document.querySelector('input[placeholder*="Bipe volume ou chave NF-e"]');
        if (input) {
          input.focus();
          input.select();
        }
      }, 100);
    } finally {
      setProcessando(false);
    }
  };

  const handleDesvincularVolume = async (volume) => {
    if (!etiquetaSelecionada) return;

    try {
      const user = await base44.auth.me();

      await base44.entities.Volume.update(volume.id, {
        etiqueta_mae_id: null,
        data_vinculo_etiqueta_mae: null
      });

      // Registrar histórico de remoção
      await base44.entities.HistoricoEtiquetaMae.create({
        etiqueta_mae_id: etiquetaSelecionada.id,
        tipo_acao: "remocao_volume",
        volume_id: volume.id,
        volume_identificador: volume.identificador_unico,
        observacao: `Volume ${volume.identificador_unico} removido`,
        usuario_id: user.id,
        usuario_nome: user.full_name
      });

      const novosVolumesIds = (etiquetaSelecionada.volumes_ids || []).filter(id => id !== volume.id);
      const volumesAtualizadosList = volumesVinculados.filter(v => v.id !== volume.id);

      const pesoTotal = volumesAtualizadosList.reduce((sum, v) => sum + (v.peso_volume || 0), 0);
      const m3Total = volumesAtualizadosList.reduce((sum, v) => sum + (v.m3 || 0), 0);
      const notasIds = [...new Set(volumesAtualizadosList.map(v => v.nota_fiscal_id).filter(Boolean))];

      await base44.entities.EtiquetaMae.update(etiquetaSelecionada.id, {
        volumes_ids: novosVolumesIds,
        quantidade_volumes: novosVolumesIds.length,
        peso_total: pesoTotal,
        m3_total: m3Total,
        notas_fiscais_ids: notasIds,
        status: novosVolumesIds.length === 0 ? "criada" : "em_unitizacao"
      });

      // Atualizar estados localmente sem recarregar
      const etiquetaAtualizada = {
        ...etiquetaSelecionada,
        volumes_ids: novosVolumesIds,
        quantidade_volumes: novosVolumesIds.length,
        peso_total: pesoTotal,
        m3_total: m3Total,
        notas_fiscais_ids: notasIds,
        status: novosVolumesIds.length === 0 ? "criada" : "em_unitizacao"
      };

      setEtiquetaSelecionada(etiquetaAtualizada);
      setVolumesVinculados(volumesAtualizadosList);

      // Atualizar arrays locais
      const volumeAtualizado = { ...volume, etiqueta_mae_id: null, data_vinculo_etiqueta_mae: null };
      setVolumes(volumes.map(v => v.id === volume.id ? volumeAtualizado : v));
      setEtiquetas(etiquetas.map(e => e.id === etiquetaSelecionada.id ? etiquetaAtualizada : e));

      toast.success("Volume desvinculado");
    } catch (error) {
      console.error("Erro ao desvincular:", error);
      toast.error("Erro ao desvincular");
    }
  };

  const handleFinalizar = async () => {
    if (!etiquetaSelecionada) return;

    if (volumesVinculados.length === 0) {
      toast.error("Vincule ao menos um volume");
      return;
    }

    try {
      const user = await base44.auth.me();

      await base44.entities.EtiquetaMae.update(etiquetaSelecionada.id, {
        status: "finalizada",
        data_finalizada: new Date().toISOString(),
        finalizado_por: user.id
      });

      toast.success("Unitização finalizada!");

      // Atualizar localmente
      const etiquetaAtualizada = {
        ...etiquetaSelecionada,
        status: "finalizada",
        data_finalizada: new Date().toISOString(),
        finalizado_por: user.id
      };

      setEtiquetaSelecionada(etiquetaAtualizada);
      setEtiquetas(etiquetas.map(e => e.id === etiquetaSelecionada.id ? etiquetaAtualizada : e));
      setShowUnitizacaoModal(false);
    } catch (error) {
      console.error("Erro ao finalizar:", error);
      toast.error("Erro ao finalizar");
    }
  };

  const handleScanChaveNFe = async (chave) => {
    try {
      toast.info("Processando chave NF-e...");
      
      // Buscar nota existente
      const notasExistentes = await base44.entities.NotaFiscal.filter({ chave_nota_fiscal: chave });
      
      let notaFiscal;
      let volumesDaNota = [];
      let volumesCriados = false;
      
      if (notasExistentes.length > 0) {
        // Nota existe na base
        notaFiscal = notasExistentes[0];
        
        console.log(`📝 Nota encontrada: ${notaFiscal.numero_nota} (ID: ${notaFiscal.id})`);
        
        // SEMPRE buscar volumes frescos do banco para garantir dados atualizados
        toast.info(`Buscando volumes da NF ${notaFiscal.numero_nota}...`);
        volumesDaNota = await base44.entities.Volume.filter({ nota_fiscal_id: notaFiscal.id });
        
        console.log(`🔍 Busca retornou ${volumesDaNota.length} volumes para nota_fiscal_id: ${notaFiscal.id}`);
        
        if (volumesDaNota.length === 0) {
          // Tentar buscar usando list() e filtrar manualmente como fallback
          console.log(`⚠️ Tentando busca alternativa de volumes...`);
          const todosVolumes = await base44.entities.Volume.list();
          volumesDaNota = todosVolumes.filter(v => v.nota_fiscal_id === notaFiscal.id);
          console.log(`🔍 Busca alternativa encontrou ${volumesDaNota.length} volumes`);
        }
        
        if (volumesDaNota.length === 0) {
          toast.error(`❌ Nota fiscal ${notaFiscal.numero_nota} sem volumes cadastrados`);
          console.error(`❌ Nenhum volume encontrado para nota_fiscal_id: ${notaFiscal.id}`);
          return;
        }
        
        console.log(`✅ ${volumesDaNota.length} volumes encontrados:`, volumesDaNota.map(v => v.identificador_unico));
        toast.success(`✓ NF ${notaFiscal.numero_nota} encontrada! ${volumesDaNota.length} volumes`);
      } else {
        // Nota não existe - importar via API
        toast.info("Importando nota fiscal...");
        
        const response = await base44.functions.invoke('buscarNotaFiscalMeuDanfe', {
          chaveAcesso: chave
        });

        if (response.data.error) {
          toast.error("Erro ao importar: " + response.data.error);
          return;
        }

        if (!response.data.xml) {
          toast.error("XML não retornado pela API");
          return;
        }

        // Parse do XML
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(response.data.xml, "text/xml");
        
        const getNFeValue = (tag) => {
          const element = xmlDoc.getElementsByTagName(tag)[0];
          return element ? element.textContent : null;
        };
        
        const numeroNota = getNFeValue('nNF') || '';
        
        // Extrair dados do emit
        const emitElements = xmlDoc.getElementsByTagName('emit')[0];
        const emitCNPJ = emitElements?.getElementsByTagName('CNPJ')[0]?.textContent || '';
        const emitNome = emitElements?.getElementsByTagName('xNome')[0]?.textContent || '';
        const emitFone = emitElements?.getElementsByTagName('fone')[0]?.textContent || '';
        const emitEnder = emitElements?.getElementsByTagName('enderEmit')[0];
        
        // Extrair dados do dest
        const destElements = xmlDoc.getElementsByTagName('dest')[0];
        const destCNPJ = destElements?.getElementsByTagName('CNPJ')[0]?.textContent || '';
        const destNome = destElements?.getElementsByTagName('xNome')[0]?.textContent || '';
        const destFone = destElements?.getElementsByTagName('fone')[0]?.textContent || '';
        const destEnder = destElements?.getElementsByTagName('enderDest')[0];

        // Extrair informações de volume
        const volElements = xmlDoc.getElementsByTagName('vol')[0];
        const quantidadeVolumes = parseInt(volElements?.getElementsByTagName('qVol')[0]?.textContent || '1');
        const pesoLiquido = parseFloat(volElements?.getElementsByTagName('pesoL')[0]?.textContent || '0');
        const pesoBruto = parseFloat(volElements?.getElementsByTagName('pesoB')[0]?.textContent || '0');
        
        const valorNF = parseFloat(getNFeValue('vNF') || '0');

        // Criar nota fiscal
        notaFiscal = await base44.entities.NotaFiscal.create({
          chave_nota_fiscal: chave,
          numero_nota: numeroNota,
          serie_nota: getNFeValue('serie') || '',
          data_hora_emissao: getNFeValue('dhEmi') || new Date().toISOString(),
          natureza_operacao: getNFeValue('natOp') || '',
          emitente_cnpj: emitCNPJ,
          emitente_razao_social: emitNome,
          emitente_telefone: emitFone,
          emitente_uf: emitEnder?.getElementsByTagName('UF')[0]?.textContent || '',
          emitente_cidade: emitEnder?.getElementsByTagName('xMun')[0]?.textContent || '',
          emitente_bairro: emitEnder?.getElementsByTagName('xBairro')[0]?.textContent || '',
          emitente_endereco: emitEnder?.getElementsByTagName('xLgr')[0]?.textContent || '',
          emitente_numero: emitEnder?.getElementsByTagName('nro')[0]?.textContent || '',
          emitente_cep: emitEnder?.getElementsByTagName('CEP')[0]?.textContent || '',
          destinatario_cnpj: destCNPJ,
          destinatario_razao_social: destNome,
          destinatario_telefone: destFone,
          destinatario_uf: destEnder?.getElementsByTagName('UF')[0]?.textContent || '',
          destinatario_cidade: destEnder?.getElementsByTagName('xMun')[0]?.textContent || '',
          destinatario_bairro: destEnder?.getElementsByTagName('xBairro')[0]?.textContent || '',
          destinatario_endereco: destEnder?.getElementsByTagName('xLgr')[0]?.textContent || '',
          destinatario_numero: destEnder?.getElementsByTagName('nro')[0]?.textContent || '',
          destinatario_cep: destEnder?.getElementsByTagName('CEP')[0]?.textContent || '',
          valor_nota_fiscal: valorNF,
          xml_content: response.data.xml,
          status_nf: "recebida",
          peso_total_nf: pesoBruto > 0 ? pesoBruto : pesoLiquido,
          quantidade_total_volumes_nf: quantidadeVolumes
        });

        // Criar volumes
        const pesoMedioPorVolume = (pesoBruto > 0 ? pesoBruto : pesoLiquido) / quantidadeVolumes;
        
        for (let i = 1; i <= quantidadeVolumes; i++) {
          const identificadorVolume = `${numeroNota}-${String(i).padStart(2, '0')}`;
          
          const novoVolume = await base44.entities.Volume.create({
            nota_fiscal_id: notaFiscal.id,
            identificador_unico: identificadorVolume,
            numero_sequencial: i,
            peso_volume: pesoMedioPorVolume,
            quantidade: 1,
            status_volume: "criado"
          });
          
          volumesDaNota.push(novoVolume);
        }

        volumesCriados = true;
        toast.success(`NF ${numeroNota} importada! ${quantidadeVolumes} volumes criados`);
      }

      // Atualizar arrays locais
      if (volumesCriados) {
        setVolumes([...volumes, ...volumesDaNota]);
        setNotas([...notas, notaFiscal]);
      }

      // Vincular volumes em lote - OTIMIZADO
      const user = await base44.auth.me();
      const volumesParaVincular = [];
      const historicosParaCriar = [];
      const novasOrigensVolumes = {};
      
      // FASE 1: Preparar dados e validar volumes
      for (const volume of volumesDaNota) {
        try {
          // Verificar se já está vinculado
          if (volume.etiqueta_mae_id && volume.etiqueta_mae_id !== etiquetaSelecionada.id) {
            const etiquetaAnterior = await base44.entities.EtiquetaMae.get(volume.etiqueta_mae_id);
            
            if (etiquetaAnterior.status !== "cancelada") {
              toast.warning(`Volume ${volume.identificador_unico} já vinculado`);
              continue;
            }
          }

          if (volumesVinculados.some(v => v.id === volume.id)) {
            continue;
          }

          novasOrigensVolumes[volume.id] = volumesCriados ? "Importado" : "Base";
          
          volumesParaVincular.push({
            id: volume.id,
            data: {
              etiqueta_mae_id: etiquetaSelecionada.id,
              data_vinculo_etiqueta_mae: new Date().toISOString()
            },
            volume: volume
          });

          historicosParaCriar.push({
            etiqueta_mae_id: etiquetaSelecionada.id,
            tipo_acao: "adicao_volume",
            volume_id: volume.id,
            volume_identificador: volume.identificador_unico,
            observacao: `Volume ${volume.identificador_unico} adicionado via NF-e`,
            usuario_id: user.id,
            usuario_nome: user.full_name
          });
        } catch (error) {
          console.error(`Erro ao validar volume ${volume.identificador_unico}:`, error);
        }
      }

      if (volumesParaVincular.length === 0) {
        toast.warning("Nenhum volume novo foi vinculado");
        return;
      }

      // FASE 2: Atualizar volumes em paralelo
      toast.info(`Vinculando ${volumesParaVincular.length} volumes...`);
      
      await Promise.all(
        volumesParaVincular.map(v => 
          base44.entities.Volume.update(v.id, v.data)
        )
      );

      // FASE 3: Criar históricos em paralelo
      await Promise.all(
        historicosParaCriar.map(h => 
          base44.entities.HistoricoEtiquetaMae.create(h)
        )
      );

      // FASE 4: Atualizar estado local
      setOrigensVolumes(prev => ({ ...prev, ...novasOrigensVolumes }));
      
      const volumesVinculadosNovos = volumesParaVincular.map(v => ({
        ...v.volume,
        etiqueta_mae_id: etiquetaSelecionada.id,
        data_vinculo_etiqueta_mae: v.data.data_vinculo_etiqueta_mae
      }));

      const volumesAtualizadosProgresso = [...volumesVinculados, ...volumesVinculadosNovos];
      const novosVolumesIds = volumesAtualizadosProgresso.map(v => v.id);
      const pesoTotal = volumesAtualizadosProgresso.reduce((sum, v) => sum + (v.peso_volume || 0), 0);
      const m3Total = volumesAtualizadosProgresso.reduce((sum, v) => sum + (v.m3 || 0), 0);
      const notasIds = [...new Set(volumesAtualizadosProgresso.map(v => v.nota_fiscal_id).filter(Boolean))];

      // FASE 5: Atualizar etiqueta mãe UMA VEZ apenas
      await base44.entities.EtiquetaMae.update(etiquetaSelecionada.id, {
        volumes_ids: novosVolumesIds,
        quantidade_volumes: novosVolumesIds.length,
        peso_total: pesoTotal,
        m3_total: m3Total,
        notas_fiscais_ids: notasIds,
        status: "em_unitizacao"
      });

      // FASE 6: Atualizar estados locais
      const etiquetaAtualizada = {
        ...etiquetaSelecionada,
        volumes_ids: novosVolumesIds,
        quantidade_volumes: novosVolumesIds.length,
        peso_total: pesoTotal,
        m3_total: m3Total,
        notas_fiscais_ids: notasIds,
        status: "em_unitizacao"
      };

      setEtiquetaSelecionada(etiquetaAtualizada);
      setVolumesVinculados(volumesAtualizadosProgresso);
      setEtiquetas(etiquetas.map(e => e.id === etiquetaSelecionada.id ? etiquetaAtualizada : e));
      
      // CRÍTICO: Atualizar array global de volumes com os volumes modificados
      setVolumes(prevVolumes => {
        const volumesMap = new Map(prevVolumes.map(v => [v.id, v]));
        
        // Atualizar volumes vinculados
        volumesVinculadosNovos.forEach(volume => {
          volumesMap.set(volume.id, volume);
        });
        
        // Adicionar volumes criados se houver
        if (volumesCriados) {
          volumesDaNota.forEach(volume => {
            if (!volumesMap.has(volume.id)) {
              volumesMap.set(volume.id, volume);
            }
          });
        }
        
        return Array.from(volumesMap.values());
      });
      
      // Atualizar notas se criadas
      if (volumesCriados) {
        setNotas(prevNotas => {
          const notasMap = new Map(prevNotas.map(n => [n.id, n]));
          notasMap.set(notaFiscal.id, notaFiscal);
          return Array.from(notasMap.values());
        });
      }

      // Feedback detalhado com progresso da nota
      const notasAfetadas = [...new Set(volumesVinculadosNovos.map(v => v.nota_fiscal_id))];
      
      playSuccessBeep();
      
      if (notasAfetadas.length === 1) {
        const notaId = notasAfetadas[0];
        const todosVolumesNota = volumes.filter(v => v.nota_fiscal_id === notaId);
        const volumesVinculadosNota = volumesAtualizadosProgresso.filter(v => v.nota_fiscal_id === notaId);
        const faltam = todosVolumesNota.length - volumesVinculadosNota.length;
        const notaCompleta = faltam === 0 && todosVolumesNota.length > 0;
        
        const nota = notas.find(n => n.id === notaId) || notaFiscal;
        
        const feedbackMsg = notaCompleta
          ? `✅ NF ${nota?.numero_nota} COMPLETA!\n📦 ${todosVolumesNota.length}/${todosVolumesNota.length} volumes\n✓ ${volumesParaVincular.length} volumes adicionados`
          : `✅ ${volumesParaVincular.length} volumes adicionados\n📋 NF ${nota?.numero_nota}\n⏳ Faltam ${faltam} volume(s)\n📦 Continue escaneando...`;
        
        toast.success(feedbackMsg, { 
          duration: notaCompleta ? 4000 : 3000,
          style: { 
            whiteSpace: 'pre-line', 
            fontSize: '12px', 
            lineHeight: '1.4',
            fontWeight: notaCompleta ? 'bold' : 'normal',
            background: notaCompleta ? '#10b981' : undefined,
            color: notaCompleta ? 'white' : undefined
          }
        });
      } else {
        toast.success(`✓ ${volumesParaVincular.length} volumes de ${notasAfetadas.length} notas vinculados!`);
      }
      
      // Manter foco no campo para próxima leitura
      setCodigoScanner("");
      setTimeout(() => {
        const input = document.querySelector('input[placeholder*="Bipe volume ou chave NF-e"]');
        if (input) {
          input.focus();
          input.select();
        }
      }, 100);
    } catch (error) {
      console.error("Erro ao processar chave NF-e:", error);
      toast.error("Erro ao processar chave NF-e: " + error.message);
      
      // Manter foco mesmo em caso de erro
      setCodigoScanner("");
      setTimeout(() => {
        const input = document.querySelector('input[placeholder*="Bipe volume ou chave NF-e"]');
        if (input) {
          input.focus();
          input.select();
        }
      }, 100);
    }
  };

  const handleReabrir = async (etiqueta) => {
    if (!confirm("Deseja reabrir esta etiqueta mãe para edição?")) {
      return;
    }

    try {
      const user = await base44.auth.me();

      await base44.entities.EtiquetaMae.update(etiqueta.id, {
        status: "em_unitizacao"
      });

      // Registrar histórico de reabertura
      await base44.entities.HistoricoEtiquetaMae.create({
        etiqueta_mae_id: etiqueta.id,
        tipo_acao: "edicao",
        observacao: `Etiqueta reaberta para edição`,
        usuario_id: user.id,
        usuario_nome: user.full_name
      });

      toast.success("Etiqueta reaberta para edição!");
      await loadData();
    } catch (error) {
      console.error("Erro ao reabrir:", error);
      toast.error("Erro ao reabrir etiqueta");
    }
  };

  const handleCancelar = async (etiqueta) => {
    if (!confirm("Deseja realmente cancelar esta etiqueta mãe? O histórico será mantido.")) {
      return;
    }

    try {
      const user = await base44.auth.me();

      await base44.entities.EtiquetaMae.update(etiqueta.id, {
        status: "cancelada",
        data_cancelada: new Date().toISOString(),
        cancelado_por: user.id
      });

      // Registrar histórico de cancelamento
      await base44.entities.HistoricoEtiquetaMae.create({
        etiqueta_mae_id: etiqueta.id,
        tipo_acao: "edicao",
        observacao: `Etiqueta cancelada`,
        usuario_id: user.id,
        usuario_nome: user.full_name
      });

      toast.success("Etiqueta cancelada com sucesso!");
      await loadData();
    } catch (error) {
      console.error("Erro ao cancelar:", error);
      toast.error("Erro ao cancelar etiqueta");
    }
  };

  const statusConfig = {
    criada: { label: "Criada", color: "bg-gray-500" },
    em_unitizacao: { label: "Em Unitização", color: "bg-blue-500" },
    finalizada: { label: "Finalizada", color: "bg-green-500" },
    carregada: { label: "Carregada", color: "bg-purple-500" },
    entregue: { label: "Entregue", color: "bg-emerald-600" },
    cancelada: { label: "Cancelada", color: "bg-red-500" }
  };

  const filteredEtiquetas = etiquetas.filter(etq => 
    !searchTerm ||
    etq.codigo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    etq.descricao?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const theme = {
    bg: isDark ? '#0f172a' : '#f9fafb',
    cardBg: isDark ? '#1e293b' : '#ffffff',
    cardBorder: isDark ? '#334155' : '#e5e7eb',
    text: isDark ? '#f1f5f9' : '#111827',
    textMuted: isDark ? '#94a3b8' : '#6b7280',
    inputBg: isDark ? '#1e293b' : '#ffffff',
    inputBorder: isDark ? '#334155' : '#d1d5db',
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: theme.bg }}>
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p style={{ color: theme.textMuted }}>Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-6 min-h-screen" style={{ backgroundColor: theme.bg }}>
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col gap-3 mb-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold mb-1" style={{ color: theme.text }}>Etiquetas Mãe</h1>
            <p className="text-xs sm:text-sm" style={{ color: theme.textMuted }}>
              Gerencie etiquetas mãe para unitização de volumes
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: theme.textMuted }} />
              <Input
                placeholder="Buscar etiquetas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-10 h-9 text-sm w-full"
                style={{ backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.text }}
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowCameraScanner(true)}
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0"
                title="Escanear com câmera"
              >
                <Camera className="w-4 h-4 text-blue-600" />
              </Button>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={loadData}
                className="h-9 flex-1 sm:flex-initial"
                style={{ borderColor: theme.inputBorder, color: theme.text }}
              >
                <RefreshCw className="w-4 h-4" />
              </Button>
              <Button
                onClick={() => setShowCreateModal(true)}
                className="bg-blue-600 hover:bg-blue-700 h-9 flex-1 sm:flex-initial"
                size="sm"
              >
                <Plus className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Nova Etiqueta</span>
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-4">
          <Card style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}>
            <CardHeader className="pb-2 px-3 pt-3">
              <CardTitle className="text-[10px] sm:text-sm flex items-center gap-1 sm:gap-2">
                <Layers className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600" />
                <span className="hidden sm:inline">Total de Etiquetas</span>
                <span className="sm:hidden">Total</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="px-3 pb-3">
              <p className="text-xl sm:text-2xl font-bold text-blue-600">{etiquetas.length}</p>
            </CardContent>
          </Card>

          <Card style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}>
            <CardHeader className="pb-2 px-3 pt-3">
              <CardTitle className="text-[10px] sm:text-sm flex items-center gap-1 sm:gap-2">
                <Box className="w-3 h-3 sm:w-4 sm:h-4 text-green-600" />
                <span className="hidden sm:inline">Volumes Unitizados</span>
                <span className="sm:hidden">Volumes</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="px-3 pb-3">
              <p className="text-xl sm:text-2xl font-bold text-green-600">
                {etiquetas.reduce((sum, e) => sum + (e.quantidade_volumes || 0), 0)}
              </p>
            </CardContent>
          </Card>

          <Card style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}>
            <CardHeader className="pb-2 px-3 pt-3">
              <CardTitle className="text-[10px] sm:text-sm flex items-center gap-1 sm:gap-2">
                <CheckCircle2 className="w-3 h-3 sm:w-4 sm:h-4 text-purple-600" />
                <span className="hidden sm:inline">Finalizadas</span>
                <span className="sm:hidden">Finalizadas</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="px-3 pb-3">
              <p className="text-xl sm:text-2xl font-bold text-purple-600">
                {etiquetas.filter(e => e.status === "finalizada").length}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Visualização Mobile Cards */}
        <div className="block sm:hidden space-y-3 mb-4">
          {filteredEtiquetas.map((etiqueta) => {
            const statusInfo = statusConfig[etiqueta.status] || statusConfig.criada;
            const criador = usuarios?.find(u => u.id === etiqueta.criado_por);
            
            return (
              <Card key={etiqueta.id} style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}>
                <CardContent className="p-3">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <p className="text-sm font-mono font-semibold text-blue-600 mb-1">
                        {etiqueta.codigo}
                      </p>
                      <p className="text-xs" style={{ color: theme.text }}>
                        {etiqueta.descricao || "-"}
                      </p>
                    </div>
                    <Badge className={`${statusInfo.color} text-white text-[10px] ml-2`}>
                      {statusInfo.label}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2 py-2 border-t border-b my-2" style={{ borderColor: theme.cardBorder }}>
                    <div className="text-center">
                      <p className="text-[10px]" style={{ color: theme.textMuted }}>Volumes</p>
                      <p className="text-sm font-bold" style={{ color: theme.text }}>
                        {etiqueta.quantidade_volumes || 0}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-[10px]" style={{ color: theme.textMuted }}>Peso</p>
                      <p className="text-sm font-bold" style={{ color: theme.text }}>
                        {etiqueta.peso_total?.toLocaleString('pt-BR', { minimumFractionDigits: 0 }) || '0'} kg
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-[10px]" style={{ color: theme.textMuted }}>M³</p>
                      <p className="text-sm font-bold" style={{ color: theme.text }}>
                        {etiqueta.m3_total?.toFixed(2) || '0.00'}
                      </p>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-center gap-2 mb-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEtiquetaSelecionada(etiqueta);
                          setShowImpressaoModal(true);
                        }}
                        style={{ borderColor: theme.inputBorder, color: theme.text }}
                        title="Imprimir"
                        className="h-11 flex-1 p-0"
                      >
                        <Printer className="w-5 h-5" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleIniciarUnitizacao(etiqueta)}
                        style={{ 
                          borderColor: etiqueta.status === "finalizada" || etiqueta.status === "cancelada" ? '#10b981' : '#3b82f6',
                          color: etiqueta.status === "finalizada" || etiqueta.status === "cancelada" ? '#10b981' : '#3b82f6'
                        }}
                        title={etiqueta.status === "finalizada" || etiqueta.status === "cancelada" ? "Ver" : "Unitizar"}
                        className="h-11 px-4 text-base font-medium flex-1"
                        disabled={etiqueta.status === "cancelada"}
                      >
                        <Layers className="w-5 h-5 mr-1.5" />
                        {etiqueta.status === "finalizada" || etiqueta.status === "cancelada" ? "Ver" : "Unitizar"}
                      </Button>
                      {etiqueta.status === "finalizada" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleReabrir(etiqueta)}
                          style={{ borderColor: '#f59e0b', color: '#f59e0b' }}
                          title="Reabrir para edição"
                          className="h-11 w-11 p-0"
                        >
                          <Edit className="w-5 h-5" />
                        </Button>
                      )}
                      {etiqueta.status !== "cancelada" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCancelar(etiqueta)}
                          style={{ borderColor: '#ef4444', color: '#ef4444' }}
                          title="Cancelar unitização"
                          className="h-11 w-11 p-0"
                        >
                          <Trash2 className="w-5 h-5" />
                        </Button>
                      )}
                    </div>
                    <div className="text-[10px] text-center" style={{ color: theme.textMuted }}>
                      {etiqueta.created_date ? new Date(etiqueta.created_date).toLocaleDateString('pt-BR') : '-'}
                      {' • '}
                      {criador?.full_name?.split(' ')[0] || '-'}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
          {filteredEtiquetas.length === 0 && (
            <div className="text-center py-12" style={{ color: theme.textMuted }}>
              <Package className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p>Nenhuma etiqueta mãe encontrada</p>
              <p className="text-xs mt-2">Clique em "+" para começar</p>
            </div>
          )}
        </div>

        {/* Visualização Desktop Tabela */}
        <Card className="hidden sm:block" style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b" style={{ borderColor: theme.cardBorder }}>
                    <th className="text-left px-3 py-2 text-xs font-semibold" style={{ color: theme.textMuted }}>Código</th>
                    <th className="text-left px-3 py-2 text-xs font-semibold" style={{ color: theme.textMuted }}>Descrição</th>
                    <th className="text-left px-3 py-2 text-xs font-semibold" style={{ color: theme.textMuted }}>Status</th>
                    <th className="text-left px-3 py-2 text-xs font-semibold" style={{ color: theme.textMuted }}>Volumes</th>
                    <th className="text-left px-3 py-2 text-xs font-semibold" style={{ color: theme.textMuted }}>Peso</th>
                    <th className="text-left px-3 py-2 text-xs font-semibold" style={{ color: theme.textMuted }}>M³</th>
                    <th className="text-left px-3 py-2 text-xs font-semibold" style={{ color: theme.textMuted }}>Criado</th>
                    <th className="text-left px-3 py-2 text-xs font-semibold" style={{ color: theme.textMuted }}>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEtiquetas.map((etiqueta) => {
                    const statusInfo = statusConfig[etiqueta.status] || statusConfig.criada;
                    const criador = usuarios?.find(u => u.id === etiqueta.criado_por);
                    return (
                      <tr key={etiqueta.id} className="border-b hover:bg-opacity-50" style={{ borderColor: theme.cardBorder }}>
                        <td className="px-3 py-2">
                          <span className="text-sm font-mono font-semibold text-blue-600">
                            {etiqueta.codigo}
                          </span>
                        </td>
                        <td className="px-3 py-2">
                          <span className="text-sm" style={{ color: theme.text }}>
                            {etiqueta.descricao || "-"}
                          </span>
                        </td>
                        <td className="px-3 py-2">
                          <Badge className={`${statusInfo.color} text-white text-xs`}>
                            {statusInfo.label}
                          </Badge>
                        </td>
                        <td className="px-3 py-2">
                          <span className="text-sm font-semibold" style={{ color: theme.text }}>
                            {etiqueta.quantidade_volumes || 0}
                          </span>
                        </td>
                        <td className="px-3 py-2">
                          <span className="text-sm" style={{ color: theme.text }}>
                            {etiqueta.peso_total?.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00'} kg
                          </span>
                        </td>
                        <td className="px-3 py-2">
                          <span className="text-sm" style={{ color: theme.text }}>
                            {etiqueta.m3_total?.toFixed(3) || '0,000'} m³
                          </span>
                        </td>
                        <td className="px-3 py-2">
                          <div className="text-xs" style={{ color: theme.text }}>
                            {etiqueta.created_date ? new Date(etiqueta.created_date).toLocaleDateString('pt-BR') : '-'}
                            <p className="text-xs mt-0.5" style={{ color: theme.textMuted }}>
                              {(usuarios && criador?.full_name?.split(' ')[0]) || '-'}
                            </p>
                          </div>
                        </td>
                        <td className="px-3 py-2">
                          <div className="flex gap-1">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleVerDetalhes(etiqueta)}
                              style={{ borderColor: theme.inputBorder, color: theme.text }}
                              title="Ver detalhes"
                              className="h-7 w-7 p-0"
                            >
                              <Eye className="w-3 h-3" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setEtiquetaSelecionada(etiqueta);
                                setShowImpressaoModal(true);
                              }}
                              style={{ borderColor: theme.inputBorder, color: theme.text }}
                              title="Imprimir etiqueta"
                              className="h-7 w-7 p-0"
                            >
                              <Printer className="w-3 h-3" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleIniciarUnitizacao(etiqueta)}
                              style={{ 
                                borderColor: etiqueta.status === "finalizada" || etiqueta.status === "cancelada" ? '#10b981' : '#3b82f6',
                                color: etiqueta.status === "finalizada" || etiqueta.status === "cancelada" ? '#10b981' : '#3b82f6'
                              }}
                              title={etiqueta.status === "finalizada" || etiqueta.status === "cancelada" ? "Ver unitização" : "Unitizar volumes"}
                              className="h-7 px-2"
                              disabled={etiqueta.status === "cancelada"}
                            >
                              <Layers className="w-3 h-3 mr-1" />
                              {etiqueta.status === "finalizada" || etiqueta.status === "cancelada" ? "Ver" : "Unitizar"}
                            </Button>
                            {etiqueta.status === "finalizada" && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleReabrir(etiqueta)}
                                style={{ borderColor: '#f59e0b', color: '#f59e0b' }}
                                title="Reabrir para edição"
                                className="h-7 w-7 p-0"
                              >
                                <Edit className="w-3 h-3" />
                              </Button>
                            )}
                            {etiqueta.status !== "cancelada" && etiqueta.status !== "finalizada" && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleCancelar(etiqueta)}
                                style={{ borderColor: '#ef4444', color: '#ef4444' }}
                                title="Cancelar unitização"
                                className="h-7 w-7 p-0"
                              >
                                <X className="w-3 h-3" />
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {filteredEtiquetas.length === 0 && (
                <div className="text-center py-12" style={{ color: theme.textMuted }}>
                  <Package className="w-12 h-12 mx-auto mb-3 opacity-20" />
                  <p>Nenhuma etiqueta mãe encontrada</p>
                  <p className="text-xs mt-2">Clique em "Nova Etiqueta" para começar</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Modal de Criação */}
        <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
          <DialogContent style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}>
            <DialogHeader>
              <DialogTitle style={{ color: theme.text }}>Nova Etiqueta Mãe</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div>
                <Label style={{ color: theme.text }}>
                  Cliente *
                </Label>
                <Input
                  value={novaEtiqueta.cliente}
                  onChange={(e) => setNovaEtiqueta({ ...novaEtiqueta, cliente: e.target.value.toUpperCase() })}
                  placeholder="NOME DO CLIENTE"
                  className="mt-1"
                  style={{ backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.text }}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label style={{ color: theme.text }}>Cidade de Destino *</Label>
                  <Input
                    value={novaEtiqueta.cidade_destino}
                    onChange={(e) => setNovaEtiqueta({ ...novaEtiqueta, cidade_destino: e.target.value.toUpperCase() })}
                    placeholder="CIDADE"
                    className="mt-1"
                    style={{ backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.text }}
                  />
                </div>
                <div>
                  <Label style={{ color: theme.text }}>UF *</Label>
                  <Input
                    value={novaEtiqueta.uf_destino}
                    onChange={(e) => setNovaEtiqueta({ ...novaEtiqueta, uf_destino: e.target.value.toUpperCase().slice(0, 2) })}
                    placeholder="UF"
                    maxLength={2}
                    className="mt-1"
                    style={{ backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.text }}
                  />
                </div>
              </div>

              <div>
                <Label style={{ color: theme.text }}>Observações</Label>
                <Textarea
                  value={novaEtiqueta.observacoes}
                  onChange={(e) => setNovaEtiqueta({ ...novaEtiqueta, observacoes: e.target.value.toUpperCase() })}
                  placeholder="INFORMAÇÕES ADICIONAIS..."
                  rows={3}
                  className="mt-1"
                  style={{ backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.text }}
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setShowCreateModal(false);
                  setNovaEtiqueta({ codigo: "", cliente: "", cidade_destino: "", uf_destino: "", observacoes: "" });
                }}
                style={{ borderColor: theme.cardBorder, color: theme.text }}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleCriarEtiqueta}
                disabled={criandoEtiqueta || !novaEtiqueta.cliente.trim() || !novaEtiqueta.cidade_destino.trim() || !novaEtiqueta.uf_destino.trim()}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {criandoEtiqueta ? "Criando..." : "Criar Etiqueta"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Modal de Detalhes */}
        {showDetailsModal && etiquetaSelecionada && (
          <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto" style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}>
              <DialogHeader>
                <DialogTitle style={{ color: theme.text }}>
                  Detalhes da Etiqueta Mãe {etiquetaSelecionada.codigo}
                </DialogTitle>
              </DialogHeader>

              <Tabs defaultValue="detalhes" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="detalhes">Detalhes</TabsTrigger>
                  <TabsTrigger value="historico">
                    <History className="w-3 h-3 mr-1" />
                    Histórico
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="detalhes" className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs font-semibold" style={{ color: theme.textMuted }}>Status</Label>
                    <Badge className={`${statusConfig[etiquetaSelecionada.status]?.color} text-white mt-1`}>
                      {statusConfig[etiquetaSelecionada.status]?.label}
                    </Badge>
                  </div>
                  <div>
                    <Label className="text-xs font-semibold" style={{ color: theme.textMuted }}>Criado Por</Label>
                    <p className="text-sm mt-1" style={{ color: theme.text }}>
                      {usuarios.find(u => u.id === etiquetaSelecionada.criado_por)?.full_name || '-'}
                    </p>
                  </div>
                </div>

                {etiquetaSelecionada.descricao && (
                  <div>
                    <Label className="text-xs font-semibold" style={{ color: theme.textMuted }}>Descrição</Label>
                    <p className="text-sm mt-1" style={{ color: theme.text }}>{etiquetaSelecionada.descricao}</p>
                  </div>
                )}

                <div className="grid grid-cols-3 gap-4">
                  <Card style={{ backgroundColor: isDark ? '#0f172a' : '#f8fafc', borderColor: theme.cardBorder }}>
                    <CardContent className="p-3">
                      <p className="text-xs" style={{ color: theme.textMuted }}>Volumes</p>
                      <p className="text-lg font-bold" style={{ color: theme.text }}>
                        {etiquetaSelecionada.quantidade_volumes || 0}
                      </p>
                    </CardContent>
                  </Card>
                  <Card style={{ backgroundColor: isDark ? '#0f172a' : '#f8fafc', borderColor: theme.cardBorder }}>
                    <CardContent className="p-3">
                      <p className="text-xs" style={{ color: theme.textMuted }}>Peso Total</p>
                      <p className="text-lg font-bold" style={{ color: theme.text }}>
                        {etiquetaSelecionada.peso_total?.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00'} kg
                      </p>
                    </CardContent>
                  </Card>
                  <Card style={{ backgroundColor: isDark ? '#0f172a' : '#f8fafc', borderColor: theme.cardBorder }}>
                    <CardContent className="p-3">
                      <p className="text-xs" style={{ color: theme.textMuted }}>M³ Total</p>
                      <p className="text-lg font-bold" style={{ color: theme.text }}>
                        {etiquetaSelecionada.m3_total?.toFixed(3) || '0,000'}
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {etiquetaSelecionada.volumes_ids && etiquetaSelecionada.volumes_ids.length > 0 && (
                  <div>
                    <Label className="text-sm font-semibold mb-2 block" style={{ color: theme.text }}>
                      Volumes Vinculados ({etiquetaSelecionada.volumes_ids.length})
                    </Label>
                    <div className="border rounded-lg p-3 max-h-60 overflow-y-auto space-y-2" style={{ borderColor: theme.cardBorder }}>
                      {etiquetaSelecionada.volumes_ids.map((volumeId) => {
                        const volume = volumes.find(v => v.id === volumeId);
                        const nota = notas.find(n => n.id === volume?.nota_fiscal_id);
                        
                        if (!volume) return null;
                        
                        return (
                          <div key={volume.id} className="flex justify-between items-center p-2 border rounded" style={{ borderColor: theme.cardBorder }}>
                            <div className="flex-1">
                              <p className="text-xs font-mono font-semibold" style={{ color: theme.text }}>
                                {volume.identificador_unico}
                              </p>
                              <p className="text-xs" style={{ color: theme.textMuted }}>
                                NF: {nota?.numero_nota || '-'} | {volume.peso_volume?.toLocaleString()} kg
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {etiquetaSelecionada.observacoes && (
                  <div>
                    <Label className="text-xs font-semibold" style={{ color: theme.textMuted }}>Observações</Label>
                    <p className="text-sm mt-1 whitespace-pre-wrap" style={{ color: theme.text }}>
                      {etiquetaSelecionada.observacoes}
                    </p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="historico" className="py-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 mb-4">
                    <History className="w-4 h-4 text-blue-600" />
                    <Label className="text-sm font-semibold" style={{ color: theme.text }}>
                      Histórico de Alterações
                    </Label>
                  </div>

                  {historico.filter(h => h.etiqueta_mae_id === etiquetaSelecionada.id).length === 0 ? (
                    <div className="text-center py-8" style={{ color: theme.textMuted }}>
                      <History className="w-12 h-12 mx-auto mb-3 opacity-20" />
                      <p className="text-sm">Nenhuma alteração registrada</p>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {historico
                        .filter(h => h.etiqueta_mae_id === etiquetaSelecionada.id)
                        .map((registro, index) => {
                          const tipoIcons = {
                            criacao: CheckCircle2,
                            adicao_volume: UserPlus,
                            remocao_volume: UserMinus,
                            edicao: Edit
                          };
                          const tipoColors = {
                            criacao: 'text-blue-600',
                            adicao_volume: 'text-green-600',
                            remocao_volume: 'text-red-600',
                            edicao: 'text-orange-600'
                          };
                          const tipoLabels = {
                            criacao: 'Criação',
                            adicao_volume: 'Volume Adicionado',
                            remocao_volume: 'Volume Removido',
                            edicao: 'Edição'
                          };

                          const Icon = tipoIcons[registro.tipo_acao] || History;

                          return (
                            <div 
                              key={registro.id}
                              className="border rounded-lg p-3"
                              style={{ borderColor: theme.cardBorder }}
                            >
                              <div className="flex items-start gap-3">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                                  isDark ? 'bg-slate-800' : 'bg-slate-100'
                                }`}>
                                  <Icon className={`w-4 h-4 ${tipoColors[registro.tipo_acao]}`} />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-start justify-between gap-2 mb-1">
                                    <p className="text-sm font-semibold" style={{ color: theme.text }}>
                                      {tipoLabels[registro.tipo_acao]}
                                    </p>
                                    <p className="text-xs whitespace-nowrap" style={{ color: theme.textMuted }}>
                                      {registro.created_date ? new Date(registro.created_date).toLocaleString('pt-BR') : '-'}
                                    </p>
                                  </div>
                                  
                                  {registro.volume_identificador && (
                                    <p className="text-xs font-mono mb-1" style={{ color: theme.text }}>
                                      {registro.volume_identificador}
                                    </p>
                                  )}
                                  
                                  {registro.observacao && (
                                    <p className="text-xs" style={{ color: theme.textMuted }}>
                                      {registro.observacao}
                                    </p>
                                  )}
                                  
                                  <p className="text-xs mt-1.5 flex items-center gap-1" style={{ color: theme.textMuted }}>
                                    <User className="w-3 h-3" />
                                    {registro.usuario_nome}
                                  </p>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>

              <DialogFooter>
                {etiquetaSelecionada.status === "finalizada" && (
                  <Button 
                    onClick={() => {
                      setShowDetailsModal(false);
                      handleReabrir(etiquetaSelecionada);
                    }}
                    className="bg-orange-600 hover:bg-orange-700"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Reabrir para Edição
                  </Button>
                )}
                <Button 
                  onClick={() => {
                    setShowDetailsModal(false);
                    handleIniciarUnitizacao(etiquetaSelecionada);
                  }}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Layers className="w-4 h-4 mr-2" />
                  {etiquetaSelecionada.status === "finalizada" ? "Ver Unitização" : "Unitizar Volumes"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowDetailsModal(false)}
                  style={{ borderColor: theme.cardBorder, color: theme.text }}
                >
                  Fechar
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}

        {/* Modal de Unitização */}
        {showUnitizacaoModal && etiquetaSelecionada && (
          <Dialog open={showUnitizacaoModal} onOpenChange={setShowUnitizacaoModal}>
            <DialogContent 
              className="max-w-full w-full h-full max-h-full overflow-y-auto p-0 m-0 sm:max-w-md sm:w-[95vw] sm:max-h-[90vh] sm:p-4 sm:m-auto" 
              style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}
            >
              <DialogHeader className="pb-2 px-4 pt-4 sm:px-0 sm:pt-0 sticky top-0 z-10" style={{ backgroundColor: theme.cardBg }}>
                <DialogTitle className="text-base sm:text-lg" style={{ color: theme.text }}>
                  {etiquetaSelecionada.codigo}
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-3 py-2 px-4 sm:px-0">
                {/* Resumo Compacto */}
                <div className="grid grid-cols-4 gap-2 p-3 rounded-lg border-2" style={{ backgroundColor: isDark ? '#0f172a' : '#f8fafc', borderColor: '#3b82f6' }}>
                  <div className="text-center">
                    <p className="text-[10px] mb-0.5" style={{ color: theme.textMuted }}>Volumes</p>
                    <p className="text-2xl font-bold text-blue-600">{volumesVinculados.length}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] mb-0.5" style={{ color: theme.textMuted }}>Peso Total</p>
                    <p className="text-lg font-bold text-green-600">
                      {volumesVinculados.reduce((sum, v) => sum + (v.peso_volume || 0), 0).toLocaleString('pt-BR', { minimumFractionDigits: 0 })}
                    </p>
                    <p className="text-[10px] text-green-600">kg</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] mb-0.5" style={{ color: theme.textMuted }}>M³</p>
                    <p className="text-lg font-bold text-purple-600">
                      {volumesVinculados.reduce((sum, v) => sum + (v.m3 || 0), 0).toFixed(3)}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] mb-0.5" style={{ color: theme.textMuted }}>Notas</p>
                    <p className="text-2xl font-bold text-orange-600">
                      {[...new Set(volumesVinculados.map(v => v.nota_fiscal_id))].length}
                    </p>
                  </div>
                </div>

                {etiquetaSelecionada.status !== "finalizada" && (
                  <div className="sticky top-14 sm:relative sm:top-0 z-10 -mx-4 px-4 py-2 sm:mx-0 sm:px-0 sm:py-0" style={{ backgroundColor: theme.bg }}>
                    <Button
                      onClick={() => setShowVolumeCameraScanner(true)}
                      className="bg-green-600 hover:bg-green-700 w-full h-14 text-base font-bold shadow-lg"
                      disabled={processando}
                    >
                      <Camera className="w-6 h-6 mr-2" />
                      ESCANEAR VOLUMES
                    </Button>
                  </div>
                )}

                {volumesVinculados.length > 0 && (
                  <Card style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}>
                    <CardHeader className="pb-2 pt-3 px-3">
                      <CardTitle className="text-sm flex items-center gap-2" style={{ color: theme.text }}>
                        <Package className="w-4 h-4 text-purple-600" />
                        Volumes Vinculados ({volumesVinculados.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-3 pt-0">
                      {/* Resumo por Nota Fiscal - Apontamento de Faltantes */}
                      <div className="mb-3 space-y-2">
                        {(() => {
                          const notasOrdenadas = [];
                          const notasProcessadas = new Set();
                          
                          volumesVinculados.forEach(volume => {
                            const notaId = volume.nota_fiscal_id;
                            if (notaId && !notasProcessadas.has(notaId)) {
                              notasProcessadas.add(notaId);
                              notasOrdenadas.push(notaId);
                            }
                          });
                          
                          return notasOrdenadas.map(notaId => {
                            const nota = notas.find(n => n.id === notaId);
                            const todosVolumesNota = volumes.filter(v => v.nota_fiscal_id === notaId);
                            const volumesVinculadosNota = volumesVinculados.filter(v => v.nota_fiscal_id === notaId);
                            const faltantes = todosVolumesNota.length - volumesVinculadosNota.length;
                            const completa = faltantes === 0 && todosVolumesNota.length > 0;

                            return (
                              <div 
                                key={notaId} 
                                className="p-2 border rounded-lg"
                                style={{ 
                                  borderColor: completa ? '#10b981' : (faltantes > 0 ? '#f59e0b' : theme.cardBorder),
                                  backgroundColor: completa ? (isDark ? '#06402933' : '#d1fae533') : (isDark ? '#0f172a' : '#f8fafc'),
                                  borderWidth: completa || faltantes > 0 ? '2px' : '1px'
                                }}
                              >
                                <div className="flex items-center justify-between gap-2">
                                  <div className="flex items-center gap-2 flex-1 min-w-0">
                                    <FileText className={`w-3 h-3 flex-shrink-0 ${completa ? 'text-green-600' : 'text-blue-600'}`} />
                                    <div className="flex-1 min-w-0">
                                      <p className="text-xs font-semibold truncate" style={{ color: theme.text }}>
                                        NF {nota?.numero_nota || '-'}
                                      </p>
                                      <p className="text-[10px] truncate" style={{ color: theme.textMuted }}>
                                        {nota?.emitente_razao_social || '-'}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Badge 
                                      className={`text-[10px] px-2 py-0.5 font-bold ${
                                        completa 
                                          ? 'bg-green-600 text-white' 
                                          : (faltantes > 0 ? 'bg-orange-500 text-white' : 'bg-blue-600 text-white')
                                      }`}
                                    >
                                      {volumesVinculadosNota.length}/{todosVolumesNota.length}
                                    </Badge>
                                    {faltantes > 0 && (
                                      <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-200 text-[10px] px-2 py-0.5 font-bold">
                                        {faltantes} faltando
                                      </Badge>
                                    )}
                                    {completa && (
                                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          });
                        })()}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Lista de Volumes - Compacta para Mobile */}
                {volumesVinculados.length > 0 && (
                  <Card style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}>
                    <CardHeader className="pb-2 pt-3 px-3">
                      <CardTitle className="text-sm flex items-center gap-2" style={{ color: theme.text }}>
                        <Package className="w-4 h-4 text-purple-600" />
                        Todos os Volumes ({volumesVinculados.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-3 pt-0">
                      <div className="space-y-2 max-h-60 overflow-y-auto">
                        {volumesVinculados.slice().reverse().map((volume, index) => {
                          const nota = notas.find(n => n.id === volume.nota_fiscal_id);
                          const isRecent = index < 3;

                          return (
                            <div 
                              key={volume.id} 
                              className={`flex items-center gap-2 p-2 border rounded-lg transition-all ${isRecent ? 'animate-in slide-in-from-top-2' : ''}`}
                              style={{ 
                                borderColor: isRecent ? '#10b981' : theme.cardBorder,
                                backgroundColor: isRecent ? (isDark ? '#064e3b33' : '#d1fae533') : 'transparent'
                              }}
                            >
                              <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-mono font-bold truncate" style={{ color: theme.text }}>
                                  {volume.identificador_unico}
                                </p>
                                <p className="text-xs" style={{ color: theme.textMuted }}>
                                  NF {nota?.numero_nota || '-'} • {volume.peso_volume?.toLocaleString('pt-BR')} kg
                                </p>
                              </div>
                              {etiquetaSelecionada.status !== "finalizada" && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDesvincularVolume(volume)}
                                  className="h-8 w-8 p-0 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex-shrink-0"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              <DialogFooter className="flex-col gap-2 pt-4 px-4 pb-4 sm:px-0 sm:pb-0 sticky bottom-0" style={{ backgroundColor: theme.cardBg }}>
                {etiquetaSelecionada.status !== "finalizada" && (
                  <Button
                    onClick={handleFinalizar}
                    disabled={volumesVinculados.length === 0}
                    className="bg-green-600 hover:bg-green-700 w-full h-12 text-base font-bold shadow-lg"
                  >
                    <CheckCircle2 className="w-5 h-5 mr-2" />
                    FINALIZAR ({volumesVinculados.length})
                  </Button>
                )}
                {etiquetaSelecionada.status === "finalizada" && (
                  <Button
                    onClick={() => {
                      setShowUnitizacaoModal(false);
                      handleReabrir(etiquetaSelecionada);
                    }}
                    className="bg-orange-600 hover:bg-orange-700 w-full h-12 text-base font-bold"
                  >
                    <Edit className="w-5 h-5 mr-2" />
                    REABRIR
                  </Button>
                )}
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowUnitizacaoModal(false);
                    setEtiquetaSelecionada(null);
                    setVolumesVinculados([]);
                    setCodigoScanner("");
                    loadData();
                  }}
                  className="w-full h-10"
                  style={{ borderColor: theme.cardBorder, color: theme.text }}
                >
                  Fechar
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}

        {/* Modal de Impressão */}
        {showImpressaoModal && etiquetaSelecionada && (
          <ImpressaoEtiquetaMae
            open={showImpressaoModal}
            onClose={() => {
              setShowImpressaoModal(false);
              setEtiquetaSelecionada(null);
            }}
            etiqueta={etiquetaSelecionada}
            empresa={empresa}
            notas={notas}
            volumes={volumes}
          />
        )}

        {/* Scanner de Câmera - Etiqueta Mãe */}
        {showCameraScanner && (
          <CameraScanner
            open={showCameraScanner}
            onClose={() => setShowCameraScanner(false)}
            onScan={handleCameraScan}
            isDark={isDark}
          />
        )}

        {/* Scanner de Câmera - Volume */}
        {showVolumeCameraScanner && (
          <CameraScanner
            open={showVolumeCameraScanner}
            onClose={() => setShowVolumeCameraScanner(false)}
            onScan={handleVolumeCameraScan}
            isDark={isDark}
            externalFeedback={cameraScanFeedback}
          />
        )}
      </div>
    </div>
  );
}