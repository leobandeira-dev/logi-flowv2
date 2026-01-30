import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
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
  const [showDebug, setShowDebug] = useState(false);
  const volumesVinculadosIdsRef = React.useRef(new Set());
  const [vinculandoEmLote, setVinculandoEmLote] = useState(false);
  const [progressoVinculacao, setProgressoVinculacao] = useState({ atual: 0, total: 0 });
  const [notaAtualScanner, setNotaAtualScanner] = useState(null);
  const [progressoNotaScanner, setProgressoNotaScanner] = useState(null);
  
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

  // Auto-focar campo scanner quando modal abre
  React.useEffect(() => {
    if (showUnitizacaoModal && etiquetaSelecionada?.status !== "finalizada") {
      const timer = setTimeout(() => {
        const input = document.querySelector('input[placeholder*="Bipe volume"]');
        if (input) {
          input.focus();
        }
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [showUnitizacaoModal, etiquetaSelecionada?.status]);

  const loadData = async () => {
    setLoading(true);
    try {
      const user = await base44.auth.me();

      if (user.tipo_perfil !== "operador" && user.role !== "admin") {
        toast.error("Acesso negado. Esta página é apenas para operadores.");
        return;
      }

      // Carregar empresa
      if (user.empresa_id) {
        try {
          const empresaData = await base44.entities.Empresa.get(user.empresa_id);
          setEmpresa(empresaData);
        } catch (error) {
          console.error("Erro ao carregar empresa:", error);
        }
      }

      const [etiquetasData, volumesData, notasData, usuariosData, historicoData] = await Promise.all([
        base44.entities.EtiquetaMae.list("-created_date", 500),
        base44.entities.Volume.list(null, 2000),
        base44.entities.NotaFiscal.list(null, 500),
        base44.entities.User.list().catch(() => []),
        base44.entities.HistoricoEtiquetaMae.list("-created_date", 500).catch(() => [])
      ]);

      setEtiquetas(etiquetasData);
      setVolumes(volumesData);
      setNotas(notasData);
      setUsuarios(usuariosData);
      setHistorico(historicoData);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      toast.error("Erro ao carregar dados");
    } finally {
      setLoading(false);
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
    try {
      // Usar dados já em memória - muito mais rápido
      setEtiquetaSelecionada(etiqueta);

      // Filtrar volumes vinculados dos dados já carregados
      const vinculados = volumes.filter(v => v.etiqueta_mae_id === etiqueta.id);

      setVolumesVinculados(vinculados);
      volumesVinculadosIdsRef.current = new Set(vinculados.map(v => v.id));

      setCodigoScanner("");
      setShowUnitizacaoModal(true);
    } catch (error) {
      console.error("Erro ao abrir unitização:", error);
      toast.error("Erro ao abrir unitização");
    }
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
    if (!codigo || !codigo.trim()) return;
    
    console.log("🎥 CAMERA SCAN:");
    console.log(`  • Código recebido: "${codigo}"`);
    console.log(`  • Tamanho: ${codigo.length}`);
    
    const codigoLimpo = codigo.trim();
    console.log(`  • Código após trim: "${codigoLimpo}"`);
    console.log(`  • Tamanho após trim: ${codigoLimpo.length}`);
    
    setCodigoScanner(codigoLimpo);
    
    // Processar o scan e retornar resultado para feedback visual
    const resultado = await handleScanComFeedback(codigoLimpo);
    return resultado;
  };

  const handleScanComFeedback = async (codigo) => {
    // VALIDAÇÃO INICIAL
    if (!codigo || !codigo.trim() || !etiquetaSelecionada) {
      console.warn("⚠️ Scan cancelado: dados inválidos");
      return 'error';
    }

    // PREVENIR SCANS DUPLICADOS
    if (processando) {
      console.warn("⚠️ Scan em andamento, ignorando nova requisição");
      return 'processing';
    }

    setProcessando(true);
    setCameraScanFeedback('processing');
    
    try {
      const codigoLimpo = codigo.trim();
      console.log("🔍 Iniciando processamento:", codigoLimpo);
      
      // CHAVE NF-e (44 dígitos)
      if (codigoLimpo.length === 44 && /^\d+$/.test(codigoLimpo)) {
        console.log("📄 Detectada chave NF-e");
        await handleScanChaveNFe(codigoLimpo);
        setCodigoScanner("");
        setProcessando(false);
        setCameraScanFeedback('success');
        setTimeout(() => setCameraScanFeedback(null), 800);
        return 'success';
      }

      // VERIFICAR SE É UMA ETIQUETA MÃE (Vinculação em lote)
      console.log("🏷️ Verificando se é etiqueta mãe...");
      console.log(`  • Código: "${codigoLimpo}"`);
      console.log(`  • Total etiquetas: ${etiquetas.length}`);
      const etiquetaMaeEncontrada = etiquetas.find(e => e.codigo === codigoLimpo);
      console.log(`  • Etiqueta mãe encontrada: ${etiquetaMaeEncontrada ? 'SIM' : 'NÃO'}`);
      
      if (etiquetaMaeEncontrada && etiquetaMaeEncontrada.id !== etiquetaSelecionada.id) {
        console.log(`✅ Etiqueta mãe encontrada: ${etiquetaMaeEncontrada.codigo}`);
        console.log(`  • ID: ${etiquetaMaeEncontrada.id}`);
        console.log(`  • Volumes: ${etiquetaMaeEncontrada.quantidade_volumes || 0}`);
        
        if (!etiquetaMaeEncontrada.volumes_ids || etiquetaMaeEncontrada.volumes_ids.length === 0) {
          console.warn("⚠️ Etiqueta mãe sem volumes");
          playErrorBeep();
          toast.error("❌ Etiqueta mãe sem volumes", { duration: 3000 });
          setCodigoScanner("");
          setProcessando(false);
          setCameraScanFeedback('error');
          setTimeout(() => setCameraScanFeedback(null), 1500);
          return 'error';
        }

        // VINCULAR TODOS OS VOLUMES DA ETIQUETA MÃE
        toast.info(`🔗 Vinculando ${etiquetaMaeEncontrada.volumes_ids.length} volumes...`, { duration: 3000 });
        
        const user = await base44.auth.me();
        const volumesParaVincular = [];
        const historicosParaCriar = [];
        
        // Buscar volumes da etiqueta mãe escaneada
        const volumesDaEtiquetaMae = volumes.filter(v => 
          etiquetaMaeEncontrada.volumes_ids.includes(v.id)
        );
        
        console.log(`  • ${volumesDaEtiquetaMae.length} volumes encontrados na etiqueta mãe`);
        
        for (const volume of volumesDaEtiquetaMae) {
          // Verificar se já está vinculado
          if (volumesVinculados.some(v => v.id === volume.id)) {
            console.log(`  ⚠️ ${volume.identificador_unico} já vinculado, pulando`);
            continue;
          }
          
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
            observacao: `Volume ${volume.identificador_unico} via etiqueta mãe ${etiquetaMaeEncontrada.codigo}`,
            usuario_id: user.id,
            usuario_nome: user.full_name
          });
        }
        
        if (volumesParaVincular.length === 0) {
          console.warn("⚠️ Todos volumes já vinculados");
          playErrorBeep();
          toast.warning("⚠️ Todos volumes já estão vinculados", { duration: 3000 });
          setCodigoScanner("");
          setProcessando(false);
          setCameraScanFeedback('duplicate');
          setTimeout(() => setCameraScanFeedback(null), 1500);
          return 'duplicate';
        }
        
        // Vincular em lote
        setVinculandoEmLote(true);
        setProgressoVinculacao({ atual: 0, total: volumesParaVincular.length });
        
        const TAMANHO_LOTE = 20;
        const totalLotes = Math.ceil(volumesParaVincular.length / TAMANHO_LOTE);
        
        for (let i = 0; i < totalLotes; i++) {
          const inicio = i * TAMANHO_LOTE;
          const fim = Math.min((i + 1) * TAMANHO_LOTE, volumesParaVincular.length);
          const lote = volumesParaVincular.slice(inicio, fim);
          const historicoLote = historicosParaCriar.slice(inicio, fim);
          
          await Promise.all([
            ...lote.map(v => base44.entities.Volume.update(v.id, v.data)),
            ...historicoLote.map(h => base44.entities.HistoricoEtiquetaMae.create(h))
          ]);
          
          setProgressoVinculacao({ atual: fim, total: volumesParaVincular.length });
          
          if (i < totalLotes - 1) {
            await new Promise(resolve => setTimeout(resolve, 150));
          }
        }
        
        setVinculandoEmLote(false);
        
        // Recarregar dados
        const [volumesAtualizados, notasAtualizadas] = await Promise.all([
          base44.entities.Volume.list(),
          base44.entities.NotaFiscal.list()
        ]);
        
        const volumesVinculadosAtualizados = volumesAtualizados.filter(v => 
          v.etiqueta_mae_id === etiquetaSelecionada.id
        );
        
        const novosVolumesIds = volumesVinculadosAtualizados.map(v => v.id);
        const pesoTotal = volumesVinculadosAtualizados.reduce((sum, v) => sum + (v.peso_volume || 0), 0);
        const m3Total = volumesVinculadosAtualizados.reduce((sum, v) => sum + (v.m3 || 0), 0);
        const notasIds = [...new Set(volumesVinculadosAtualizados.map(v => v.nota_fiscal_id).filter(Boolean))];
        
        await base44.entities.EtiquetaMae.update(etiquetaSelecionada.id, {
          volumes_ids: novosVolumesIds,
          quantidade_volumes: novosVolumesIds.length,
          peso_total: pesoTotal,
          m3_total: m3Total,
          notas_fiscais_ids: notasIds,
          status: "em_unitizacao"
        });
        
        const etiquetaFinal = await base44.entities.EtiquetaMae.get(etiquetaSelecionada.id);
        
        setEtiquetaSelecionada(etiquetaFinal);
        setVolumesVinculados(volumesVinculadosAtualizados);
        setVolumes(volumesAtualizados);
        setNotas(notasAtualizadas);
        volumesVinculadosIdsRef.current = new Set(novosVolumesIds);
        
        setEtiquetas(prev => prev.map(e => 
          e.id === etiquetaSelecionada.id ? etiquetaFinal : e
        ));
        
        playSuccessBeep();
        toast.success(`✅ ${volumesParaVincular.length} volumes vinculados\n🏷️ Etiqueta ${etiquetaMaeEncontrada.codigo}\n📦 Total: ${volumesVinculadosAtualizados.length}`, {
          duration: 4000,
          style: { 
            whiteSpace: 'pre-line', 
            fontSize: '14px',
            fontWeight: '600',
            padding: '16px',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
          }
        });
        
        setCodigoScanner("");
        setProcessando(false);
        setCameraScanFeedback('success');
        setTimeout(() => setCameraScanFeedback(null), 1000);
        return 'success';
      }

      // BUSCAR VOLUME NO BANCO
      console.log("📦 Buscando volume...");
      console.log(`  • Código escaneado RAW: "${codigo}"`);
      console.log(`  • Código após trim: "${codigoLimpo}"`);
      console.log(`  • Tamanho: ${codigoLimpo.length} caracteres`);
      console.log(`  • Bytes: ${[...codigoLimpo].map(c => c.charCodeAt(0)).join(',')}`);
      
      const volumesBanco = await base44.entities.Volume.list();
      console.log(`  • ${volumesBanco.length} volumes disponíveis no banco`);
      
      // BUSCA EXATA pelo identificador_unico
      let volumeEncontrado = volumesBanco.find(v => v.identificador_unico === codigoLimpo);
      
      if (volumeEncontrado) {
        console.log(`✅ Volume encontrado: ${volumeEncontrado.identificador_unico}`);
      } else {
        console.log(`❌ Volume NÃO encontrado - Código buscado: "${codigoLimpo}"`);
        console.log(`  • Testando busca nos primeiros 20 volumes:`);
        volumesBanco.slice(0, 20).forEach((v, idx) => {
          const match = v.identificador_unico === codigoLimpo;
          console.log(`    ${idx + 1}. "${v.identificador_unico}" -> Match: ${match}`);
          if (v.identificador_unico && v.identificador_unico.includes(codigoLimpo.substring(0, 10))) {
            console.log(`       ⚠️ MATCH PARCIAL encontrado!`);
          }
        });
      }
      
      // BUSCA ALTERNATIVA (se não encontrou exato)
      if (!volumeEncontrado) {
        console.log("⚠️ Busca exata falhou, tentando buscas alternativas...");
        console.log(`  • Exemplos no banco: ${volumesBanco.slice(0, 5).map(v => v.identificador_unico).join(', ')}`);
        
        const codigoUpper = codigoLimpo.toUpperCase();
        const codigoLower = codigoLimpo.toLowerCase();
        const partesCodigoEscaneado = codigoLimpo.split('-');
        
        console.log(`  • Partes do código: [${partesCodigoEscaneado.join(', ')}]`);
        
        volumeEncontrado = volumesBanco.find(v => {
          if (!v.identificador_unico) return false;
          
          const idVolume = v.identificador_unico;
          const idVolumeUpper = idVolume.toUpperCase();
          const idVolumeLower = idVolume.toLowerCase();
          
          // 1. Match exato (case-insensitive)
          if (idVolumeUpper === codigoUpper) {
            console.log(`  ✓ Match case-insensitive: ${idVolume}`);
            return true;
          }
          
          // 2. Match parcial (um contém o outro)
          if (idVolumeUpper.includes(codigoUpper) || codigoUpper.includes(idVolumeUpper)) {
            console.log(`  ✓ Match parcial: ${idVolume}`);
            return true;
          }
          
          // 3. Remover espaços e tentar novamente
          const idVolumeSemEspaco = idVolume.replace(/\s/g, '').toUpperCase();
          const codigoSemEspaco = codigoLimpo.replace(/\s/g, '').toUpperCase();
          if (idVolumeSemEspaco === codigoSemEspaco) {
            console.log(`  ✓ Match sem espaços: ${idVolume}`);
            return true;
          }
          
          // 4. Remover prefixo VOL- e comparar
          const volumeSemPrefixo = idVolumeUpper.replace(/^VOL-/i, '');
          const codigoSemPrefixo = codigoUpper.replace(/^VOL-/i, '');
          
          if (volumeSemPrefixo === codigoSemPrefixo) {
            console.log(`  ✓ Match sem prefixo VOL-: ${idVolume}`);
            return true;
          }
          
          // 5. Match parcial sem prefixo
          if (volumeSemPrefixo.includes(codigoSemPrefixo) || codigoSemPrefixo.includes(volumeSemPrefixo)) {
            console.log(`  ✓ Match parcial sem prefixo: ${idVolume}`);
            return true;
          }
          
          // 6. Match por componentes (nota-sequencial) - IGNORAR timestamp
          // Formatos possíveis: VOL-NOTA-SEQ-TIMESTAMP, NOTA-SEQ-TIMESTAMP, NOTA-SEQ, etc.
          if (partesCodigoEscaneado.length >= 2) {
            const partesVolume = idVolume.split('-');
            
            // Tentar diferentes combinações de partes
            if (partesVolume.length >= 2) {
              // Pegar últimas N partes significativas (ignorando timestamp)
              for (let i = 1; i < Math.min(partesCodigoEscaneado.length, partesVolume.length); i++) {
                const notaSeqCodigo = partesCodigoEscaneado.slice(0, i + 1).join('-').toUpperCase();
                const notaSeqVolume = partesVolume.slice(0, i + 1).join('-').toUpperCase();
                
                if (notaSeqCodigo === notaSeqVolume) {
                  console.log(`  ✓ Match por componentes [0-${i}]: ${notaSeqCodigo}`);
                  return true;
                }
              }
              
              // Match específico: partes[1]-partes[2] (nota-sequencial)
              if (partesCodigoEscaneado.length >= 3 && partesVolume.length >= 3) {
                const notaSeqCodigo = `${partesCodigoEscaneado[1]}-${partesCodigoEscaneado[2]}`.toUpperCase();
                const notaSeqVolume = `${partesVolume[1]}-${partesVolume[2]}`.toUpperCase();
                
                if (notaSeqCodigo === notaSeqVolume) {
                  console.log(`  ✓ Match nota-sequencial [1-2]: ${notaSeqCodigo}`);
                  return true;
                }
              }
            }
          }
          
          return false;
        });
        
        if (volumeEncontrado) {
          console.log(`✅ Volume encontrado com busca alternativa!`);
          console.log(`  • Código escaneado: ${codigoLimpo}`);
          console.log(`  • Volume no banco: ${volumeEncontrado.identificador_unico}`);
          toast.info(`📦 ${volumeEncontrado.identificador_unico}`, { duration: 2000 });
        } else {
          console.log("❌ Volume NÃO encontrado mesmo após busca alternativa");
          console.log(`  • Código buscado: "${codigoLimpo}"`);
          console.log(`  • Primeiros 10 volumes no banco:`);
          volumesBanco.slice(0, 10).forEach((v, i) => {
            console.log(`    ${i + 1}. "${v.identificador_unico}"`);
          });
        }
      } else {
        console.log(`✅ Volume encontrado com busca exata: ${volumeEncontrado.identificador_unico}`);
      }

      // VOLUME NÃO ENCONTRADO
      if (!volumeEncontrado) {
        console.error("❌ Volume não encontrado");
        console.log(`  • Código escaneado: ${codigoLimpo}`);
        console.log(`  • Exemplos no banco:`, volumesBanco.slice(0, 3).map(v => v.identificador_unico));
        
        playErrorBeep();
        toast.error(`❌ Volume não encontrado\n\nCódigo: ${codigoLimpo.length > 30 ? codigoLimpo.substring(0, 30) + '...' : codigoLimpo}`, {
          duration: 4000,
          style: { 
            whiteSpace: 'pre-line',
            fontSize: '14px',
            fontWeight: '600',
            padding: '16px',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
          }
        });
        
        setCodigoScanner("");
        setProcessando(false);
        setCameraScanFeedback('not_found');
        setTimeout(() => setCameraScanFeedback(null), 1500);
        return 'not_found';
      }

      console.log(`✅ Volume encontrado: ${volumeEncontrado.identificador_unico} (ID: ${volumeEncontrado.id})`);

      // RECARREGAR ETIQUETA DO BANCO
      console.log("🔄 Recarregando etiqueta do banco...");
      const etiquetaBanco = await base44.entities.EtiquetaMae.get(etiquetaSelecionada.id);

      // VERIFICAR SE JÁ ESTÁ NA MESMA ETIQUETA
      if (volumeEncontrado.etiqueta_mae_id === etiquetaBanco.id) {
        console.warn("⚠️ Volume já vinculado à esta etiqueta");
        playErrorBeep();
        toast.warning("⚠️ Volume já adicionado", { 
          duration: 3000,
          style: {
            fontSize: '14px',
            fontWeight: '600',
            padding: '16px',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
          }
        });
        
        setCodigoScanner("");
        setProcessando(false);
        setCameraScanFeedback('duplicate');
        setTimeout(() => setCameraScanFeedback(null), 1500);
        return 'duplicate';
      }

      // VERIFICAR SE ESTÁ EM OUTRA ETIQUETA
      if (volumeEncontrado.etiqueta_mae_id && volumeEncontrado.etiqueta_mae_id !== etiquetaBanco.id) {
        console.log(`⚠️ Volume vinculado à outra etiqueta: ${volumeEncontrado.etiqueta_mae_id}`);
        
        try {
          const etiquetaAnterior = await base44.entities.EtiquetaMae.get(volumeEncontrado.etiqueta_mae_id);
          
          if (etiquetaAnterior.status !== "cancelada") {
            console.error(`❌ Etiqueta anterior está ${etiquetaAnterior.status}`);
            playErrorBeep();
            toast.error(`❌ Volume em outra etiqueta\n\n${etiquetaAnterior.codigo} (${etiquetaAnterior.status})`, {
              duration: 4000,
              style: { 
                whiteSpace: 'pre-line',
                fontSize: '14px',
                fontWeight: '600',
                padding: '16px',
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
              }
            });
            
            setCodigoScanner("");
            setProcessando(false);
            setCameraScanFeedback('error');
            setTimeout(() => setCameraScanFeedback(null), 1500);
            return 'error';
          }
          
          console.log("✓ Etiqueta anterior cancelada, permitindo vínculo");
        } catch (error) {
          console.error("❌ Erro ao verificar etiqueta anterior:", error);
          // Se falhou ao buscar etiqueta anterior, bloquear por segurança
          playErrorBeep();
          toast.error("❌ Erro ao validar volume");
          setCodigoScanner("");
          setProcessando(false);
          setCameraScanFeedback('error');
          setTimeout(() => setCameraScanFeedback(null), 1500);
          return 'error';
        }
      }

      // VINCULAR VOLUME
      console.log("✅ Iniciando vínculo do volume...");
      const user = await base44.auth.me();

      // FASE 1: Atualizar volume
      await base44.entities.Volume.update(volumeEncontrado.id, {
        etiqueta_mae_id: etiquetaBanco.id,
        data_vinculo_etiqueta_mae: new Date().toISOString()
      });

      // FASE 2: Registrar histórico
      await base44.entities.HistoricoEtiquetaMae.create({
        etiqueta_mae_id: etiquetaBanco.id,
        tipo_acao: "adicao_volume",
        volume_id: volumeEncontrado.id,
        volume_identificador: volumeEncontrado.identificador_unico,
        observacao: `Volume ${volumeEncontrado.identificador_unico} adicionado`,
        usuario_id: user.id,
        usuario_nome: user.full_name
      });

      // FASE 3: Recarregar dados consolidados
      console.log("🔄 Recarregando dados consolidados...");
      const [volumesAtualizadosBanco, notasAtualizadas] = await Promise.all([
        base44.entities.Volume.list(),
        base44.entities.NotaFiscal.list()
      ]);

      const volumesVinculadosAtualizados = volumesAtualizadosBanco.filter(v => 
        v.etiqueta_mae_id === etiquetaBanco.id
      );

      const novosVolumesIds = volumesVinculadosAtualizados.map(v => v.id);
      const pesoTotal = volumesVinculadosAtualizados.reduce((sum, v) => sum + (v.peso_volume || 0), 0);
      const m3Total = volumesVinculadosAtualizados.reduce((sum, v) => sum + (v.m3 || 0), 0);
      const notasIds = [...new Set(volumesVinculadosAtualizados.map(v => v.nota_fiscal_id).filter(Boolean))];

      // FASE 4: Atualizar etiqueta
      await base44.entities.EtiquetaMae.update(etiquetaBanco.id, {
        volumes_ids: novosVolumesIds,
        quantidade_volumes: novosVolumesIds.length,
        peso_total: pesoTotal,
        m3_total: m3Total,
        notas_fiscais_ids: notasIds,
        status: "em_unitizacao"
      });

      // FASE 5: Recarregar etiqueta final
      const etiquetaFinal = await base44.entities.EtiquetaMae.get(etiquetaBanco.id);

      // FASE 6: Atualizar estados
      setEtiquetaSelecionada(etiquetaFinal);
      setVolumesVinculados(volumesVinculadosAtualizados);
      setVolumes(volumesAtualizadosBanco);
      setNotas(notasAtualizadas);
      volumesVinculadosIdsRef.current = new Set(novosVolumesIds);

      // FASE 7: Atualizar lista local de etiquetas (sem recarregar)
      setEtiquetas(prev => prev.map(e => 
        e.id === etiquetaBanco.id ? etiquetaFinal : e
      ));

      // FEEDBACK DETALHADO
      const nota = notasAtualizadas.find(n => n.id === volumeEncontrado.nota_fiscal_id);
      const volumesNotaAtualizados = volumesVinculadosAtualizados.filter(v => v.nota_fiscal_id === volumeEncontrado.nota_fiscal_id);
      const todosVolumesNota = volumesAtualizadosBanco.filter(v => v.nota_fiscal_id === volumeEncontrado.nota_fiscal_id);
      const faltamNota = todosVolumesNota.length - volumesNotaAtualizados.length;
      
      // ATUALIZAR PROGRESSO DA NOTA NO SCANNER
      setNotaAtualScanner(nota);
      setProgressoNotaScanner({
        embarcados: volumesNotaAtualizados.length,
        total: todosVolumesNota.length,
        faltam: faltamNota
      });
      
      playSuccessBeep();

      // Manter foco no campo
      setTimeout(() => {
        const input = document.querySelector('input[placeholder*="Bipe volume ou chave NF-e"]');
        if (input) {
          input.focus();
          input.select();
        }
      }, 100);

      const feedbackMsg = `✅ ${volumesNotaAtualizados.length}/${todosVolumesNota.length} volumes\n` +
        `📋 NF ${nota?.numero_nota || '-'}\n` +
        (faltamNota > 0 ? `⏳ Faltam ${faltamNota}\n` : `✓ NF COMPLETA!\n`) +
        `📦 Total: ${volumesVinculadosAtualizados.length}`;

      toast.success(feedbackMsg, { 
        duration: faltamNota === 0 ? 5000 : 3500,
        style: { 
          whiteSpace: 'pre-line', 
          fontSize: '14px', 
          lineHeight: '1.5',
          fontWeight: faltamNota === 0 ? 'bold' : '600',
          background: faltamNota === 0 ? '#10b981' : undefined,
          color: faltamNota === 0 ? 'white' : undefined,
          padding: '16px',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
        }
      });
      
      console.log("✅ Processamento concluído com sucesso");
      
      setCodigoScanner("");
      setProcessando(false);
      setCameraScanFeedback('success');
      setTimeout(() => setCameraScanFeedback(null), 1000);
      
      // Manter foco no campo
      setTimeout(() => {
        const input = document.querySelector('input[placeholder*="Bipe volume ou chave NF-e"]');
        if (input) {
          input.focus();
          input.select();
        }
      }, 100);
      
      return 'success';
      
    } catch (error) {
      console.error("❌ ERRO CRÍTICO:", error);
      console.error("  • Stack:", error.stack);
      
      playErrorBeep();
      toast.error(`❌ Erro ao processar\n\n${error.message}`, {
        duration: 4000,
        style: { whiteSpace: 'pre-line', fontSize: '12px' }
      });
      
      setCodigoScanner("");
      setProcessando(false);
      setCameraScanFeedback('error');
      setTimeout(() => setCameraScanFeedback(null), 1500);
      
      return 'error';
    }
  };

  const handleScan = async (codigo) => {
    // VALIDAÇÃO INICIAL
    if (!codigo || !codigo.trim() || !etiquetaSelecionada) {
      console.warn("⚠️ handleScan: dados inválidos");
      return;
    }

    // PREVENIR DUPLICAÇÃO
    if (processando) {
      console.warn("⚠️ Processamento já em andamento");
      return;
    }

    setProcessando(true);
    
    try {
      const codigoLimpo = codigo.trim();
      console.log("🔍 [SCAN MANUAL] Código:", codigoLimpo);
      
      // CHAVE NF-e
      if (codigoLimpo.length === 44 && /^\d+$/.test(codigoLimpo)) {
        console.log("📄 Chave NF-e detectada");
        await handleScanChaveNFe(codigoLimpo);
        setCodigoScanner("");
        return;
      }

      // BUSCAR VOLUME NO BANCO (SEMPRE FRESCO)
      console.log("📦 Buscando volume no banco...");
      const volumesBanco = await base44.entities.Volume.list();
      const volumeEncontrado = volumesBanco.find(v => v.identificador_unico === codigoLimpo);

      if (!volumeEncontrado) {
        console.error("❌ Volume não encontrado:", codigoLimpo);
        playErrorBeep();
        toast.error(`❌ Volume não encontrado\n\nCódigo: ${codigoLimpo.substring(0, 30)}${codigoLimpo.length > 30 ? '...' : ''}`, {
          duration: 4000,
          style: {
            whiteSpace: 'pre-line',
            fontSize: '14px',
            fontWeight: '600',
            padding: '16px',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
          }
        });
        setCodigoScanner("");
        return;
      }

      console.log(`✅ Volume: ${volumeEncontrado.identificador_unico}`);

      // VERIFICAR VÍNCULO COM OUTRA ETIQUETA
      if (volumeEncontrado.etiqueta_mae_id && volumeEncontrado.etiqueta_mae_id !== etiquetaSelecionada.id) {
        try {
          const etiquetaAnterior = await base44.entities.EtiquetaMae.get(volumeEncontrado.etiqueta_mae_id);
          
          if (etiquetaAnterior.status !== "cancelada") {
            console.error(`❌ Volume já em etiqueta ${etiquetaAnterior.codigo}`);
            playErrorBeep();
            toast.error(`❌ Volume na etiqueta ${etiquetaAnterior.codigo}`);
            setCodigoScanner("");
            return;
          }
          
          console.log("✓ Etiqueta anterior cancelada, permitindo vínculo");
        } catch (error) {
          console.error("❌ Erro ao verificar etiqueta anterior:", error);
          playErrorBeep();
          toast.error("❌ Erro ao validar volume");
          setCodigoScanner("");
          return;
        }
      }

      // VERIFICAR SE JÁ ESTÁ NA MESMA ETIQUETA
      if (volumeEncontrado.etiqueta_mae_id === etiquetaSelecionada.id) {
        console.warn("⚠️ Volume já vinculado");
        playErrorBeep();
        toast.warning("⚠️ Volume já está nesta etiqueta", {
          duration: 3000,
          style: {
            fontSize: '14px',
            fontWeight: '600',
            padding: '16px',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
          }
        });
        setCodigoScanner("");
        return;
      }

      // VINCULAR VOLUME
      console.log("✅ Vinculando volume...");
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

      // RECARREGAR DADOS CONSOLIDADOS
      console.log("🔄 Recarregando dados...");
      const [volumesAtualizados, notasAtualizadas] = await Promise.all([
        base44.entities.Volume.list(null, 2000),
        base44.entities.NotaFiscal.list(null, 500)
      ]);

      const volumesVinculadosAtualizados = volumesAtualizados.filter(v => 
        v.etiqueta_mae_id === etiquetaSelecionada.id
      );

      const novosVolumesIds = volumesVinculadosAtualizados.map(v => v.id);
      const pesoTotal = volumesVinculadosAtualizados.reduce((sum, v) => sum + (v.peso_volume || 0), 0);
      const m3Total = volumesVinculadosAtualizados.reduce((sum, v) => sum + (v.m3 || 0), 0);
      const notasIds = [...new Set(volumesVinculadosAtualizados.map(v => v.nota_fiscal_id).filter(Boolean))];

      await base44.entities.EtiquetaMae.update(etiquetaSelecionada.id, {
        volumes_ids: novosVolumesIds,
        quantidade_volumes: novosVolumesIds.length,
        peso_total: pesoTotal,
        m3_total: m3Total,
        notas_fiscais_ids: notasIds,
        status: "em_unitizacao"
      });

      const etiquetaFinal = await base44.entities.EtiquetaMae.get(etiquetaSelecionada.id);

      // ATUALIZAR ESTADOS
      setEtiquetaSelecionada(etiquetaFinal);
      setVolumesVinculados(volumesVinculadosAtualizados);
      setVolumes(volumesAtualizados);
      setNotas(notasAtualizadas);
      volumesVinculadosIdsRef.current = new Set(novosVolumesIds);

      const etiquetasAtualizadas = await base44.entities.EtiquetaMae.list("-created_date");
      setEtiquetas(etiquetasAtualizadas);

      // FEEDBACK
      const nota = notasAtualizadas.find(n => n.id === volumeEncontrado.nota_fiscal_id);
      const volumesNotaVinculados = volumesVinculadosAtualizados.filter(v => v.nota_fiscal_id === volumeEncontrado.nota_fiscal_id);
      const todosVolumesNota = volumesAtualizados.filter(v => v.nota_fiscal_id === volumeEncontrado.nota_fiscal_id);
      const faltam = todosVolumesNota.length - volumesNotaVinculados.length;
      
      playSuccessBeep();
      
      // ATUALIZAR PROGRESSO DA NOTA NO SCANNER (também para scan manual)
      setNotaAtualScanner(nota);
      setProgressoNotaScanner({
        embarcados: volumesNotaVinculados.length,
        total: todosVolumesNota.length,
        faltam
      });

      const feedbackMsg = `✅ ${volumesNotaVinculados.length}/${todosVolumesNota.length} volumes\n` +
        `📋 NF ${nota?.numero_nota || '-'}\n` +
        (faltam > 0 ? `⏳ Faltam ${faltam}\n` : `✓ NF COMPLETA!\n`) +
        `📦 Total: ${volumesVinculadosAtualizados.length}`;

      toast.success(feedbackMsg, { 
        duration: faltam === 0 ? 5000 : 3500,
        style: { 
          whiteSpace: 'pre-line', 
          fontSize: '14px', 
          lineHeight: '1.5',
          fontWeight: faltam === 0 ? 'bold' : '600',
          background: faltam === 0 ? '#10b981' : undefined,
          color: faltam === 0 ? 'white' : undefined,
          padding: '16px',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
        }
      });
      
      setCodigoScanner("");
      console.log("✅ Scan manual concluído");
      
      setTimeout(() => {
        const input = document.querySelector('input[placeholder*="Bipe volume ou chave NF-e"]');
        if (input) {
          input.focus();
          input.select();
        }
      }, 100);
      
    } catch (error) {
      console.error("❌ ERRO [SCAN MANUAL]:", error);
      playErrorBeep();
      toast.error(`❌ Erro: ${error.message}`);
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
    // VALIDAÇÃO
    if (!etiquetaSelecionada || !volume) {
      console.warn("⚠️ Desvinculação cancelada: dados inválidos");
      return;
    }

    console.log(`🔓 Desvinculando volume: ${volume.identificador_unico}`);

    try {
      const user = await base44.auth.me();

      // FASE 1: Desvincular volume no banco
      await base44.entities.Volume.update(volume.id, {
        etiqueta_mae_id: null,
        data_vinculo_etiqueta_mae: null
      });
      console.log("  ✓ Volume desvinculado no banco");

      // FASE 2: Registrar histórico
      await base44.entities.HistoricoEtiquetaMae.create({
        etiqueta_mae_id: etiquetaSelecionada.id,
        tipo_acao: "remocao_volume",
        volume_id: volume.id,
        volume_identificador: volume.identificador_unico,
        observacao: `Volume ${volume.identificador_unico} removido`,
        usuario_id: user.id,
        usuario_nome: user.full_name
      });
      console.log("  ✓ Histórico registrado");

      // FASE 3: Recarregar dados consolidados
      console.log("🔄 Recarregando dados...");
      const volumesAtualizados = await base44.entities.Volume.list();
      const volumesVinculadosAtualizados = volumesAtualizados.filter(v => 
        v.etiqueta_mae_id === etiquetaSelecionada.id
      );

      const novosVolumesIds = volumesVinculadosAtualizados.map(v => v.id);
      const pesoTotal = volumesVinculadosAtualizados.reduce((sum, v) => sum + (v.peso_volume || 0), 0);
      const m3Total = volumesVinculadosAtualizados.reduce((sum, v) => sum + (v.m3 || 0), 0);
      const notasIds = [...new Set(volumesVinculadosAtualizados.map(v => v.nota_fiscal_id).filter(Boolean))];

      // FASE 4: Atualizar etiqueta no banco
      await base44.entities.EtiquetaMae.update(etiquetaSelecionada.id, {
        volumes_ids: novosVolumesIds,
        quantidade_volumes: novosVolumesIds.length,
        peso_total: pesoTotal,
        m3_total: m3Total,
        notas_fiscais_ids: notasIds,
        status: novosVolumesIds.length === 0 ? "criada" : "em_unitizacao"
      });
      console.log("  ✓ Etiqueta atualizada");

      // FASE 5: Recarregar etiqueta final
      const etiquetaFinal = await base44.entities.EtiquetaMae.get(etiquetaSelecionada.id);

      // FASE 6: Atualizar estados
      setEtiquetaSelecionada(etiquetaFinal);
      setVolumesVinculados(volumesVinculadosAtualizados);
      setVolumes(volumesAtualizados);
      volumesVinculadosIdsRef.current = new Set(novosVolumesIds);

      const etiquetasAtualizadas = await base44.entities.EtiquetaMae.list("-created_date");
      setEtiquetas(etiquetasAtualizadas);

      playSuccessBeep();
      toast.success(`✅ Volume removido\n📦 Restam ${novosVolumesIds.length} volumes`, {
        duration: 3000,
        style: { 
          whiteSpace: 'pre-line', 
          fontSize: '14px',
          fontWeight: '600',
          padding: '16px',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
        }
      });
      
      console.log("✅ Desvinculação concluída");
      
    } catch (error) {
      console.error("❌ ERRO ao desvincular:", error);
      playErrorBeep();
      toast.error(`❌ Erro ao desvincular\n${error.message}`, {
        duration: 3000,
        style: { whiteSpace: 'pre-line', fontSize: '12px' }
      });
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
    // VALIDAÇÃO
    if (!chave || !etiquetaSelecionada) {
      console.warn("⚠️ Scan NF-e cancelado: dados inválidos");
      return;
    }

    console.log("📄 [NF-e] Processando chave:", chave.substring(0, 10) + "...");
    
    try {
      toast.info("📄 Processando NF-e...", { duration: 2000 });
      
      // BUSCAR NOTA NO BANCO
      const notasExistentes = await base44.entities.NotaFiscal.filter({ chave_nota_fiscal: chave }, null, 100);

      let notaFiscal;
      let volumesDaNota = [];

      if (notasExistentes.length > 0) {
        // NOTA JÁ EXISTE
        notaFiscal = notasExistentes[0];
        console.log(`  ✓ Nota encontrada: ${notaFiscal.numero_nota} (ID: ${notaFiscal.id})`);

        toast.info(`🔍 Carregando NF ${notaFiscal.numero_nota}...`, { duration: 2000 });

        // BUSCAR VOLUMES DA NOTA - SEMPRE DO BANCO (não do cache local)
        console.log(`  📦 Buscando volumes da nota ${notaFiscal.id}...`);
        volumesDaNota = await base44.entities.Volume.filter({ nota_fiscal_id: notaFiscal.id }, null, 500);
        console.log(`  • ${volumesDaNota.length} volumes retornados do banco`);

        // FALLBACK: busca alternativa com lista completa
        if (volumesDaNota.length === 0) {
          console.log("  ⚠️ Filter retornou vazio, tentando list completo...");
          const todosVolumes = await base44.entities.Volume.list(null, 2000);
          volumesDaNota = todosVolumes.filter(v => v.nota_fiscal_id === notaFiscal.id);
          console.log(`  • Busca alternativa: ${volumesDaNota.length} volumes encontrados`);
        }

        if (volumesDaNota.length === 0) {
          console.error("  ❌ NF sem volumes cadastrados no banco");
          playErrorBeep();
          toast.error(`❌ NF-e ${notaFiscal.numero_nota} sem volumes\n\n📦 Cadastre os volumes no módulo de Recebimento antes de criar etiquetas mãe`, {
            duration: 6000,
            style: { 
              whiteSpace: 'pre-line',
              background: '#ef4444',
              color: '#fff',
              fontSize: '14px',
              fontWeight: '600'
            }
          });
          return;
        }

        console.log(`  ✅ Total de volumes a vincular: ${volumesDaNota.length}`);
        toast.success(`✓ NF ${notaFiscal.numero_nota} (${volumesDaNota.length} vol.)`, { duration: 2000 });

      } else {
        // NOTA NÃO EXISTE - NÃO IMPORTAR, APENAS AVISAR
        console.error("  ❌ Nota não encontrada no sistema");
        playErrorBeep();
        toast.error(`❌ NF-e não cadastrada no sistema\n\nImporte a nota no módulo de Recebimento primeiro`, {
          duration: 5000,
          style: { whiteSpace: 'pre-line' }
        });
        return;
      }

      // PREPARAR VINCULAÇÃO EM LOTE
      console.log("🔗 Preparando vinculação em lote...");
      const user = await base44.auth.me();
      const volumesParaVincular = [];
      const historicosParaCriar = [];

      for (const volume of volumesDaNota) {
        try {
          // Verificar vinculação prévia
          if (volume.etiqueta_mae_id && volume.etiqueta_mae_id !== etiquetaSelecionada.id) {
            const etiquetaAnterior = await base44.entities.EtiquetaMae.get(volume.etiqueta_mae_id);

            if (etiquetaAnterior.status !== "cancelada") {
              console.warn(`  ⚠️ ${volume.identificador_unico} já vinculado`);
              continue;
            }
          }

          // Verificar se já está na lista local
          if (volumesVinculados.some(v => v.id === volume.id)) {
            console.warn(`  ⚠️ ${volume.identificador_unico} já na lista`);
            continue;
          }

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
            observacao: `Volume ${volume.identificador_unico} via NF-e`,
            usuario_id: user.id,
            usuario_nome: user.full_name
          });
        } catch (error) {
          console.error(`  ❌ Erro validando ${volume.identificador_unico}:`, error);
        }
      }

      if (volumesParaVincular.length === 0) {
        console.warn("⚠️ Nenhum volume novo para vincular");
        toast.warning("⚠️ Todos volumes desta NF já estão vinculados");
        return;
      }

      // VINCULAR EM LOTES COM PROGRESSO VISUAL E TIMEOUT
      console.log(`🔗 Vinculando ${volumesParaVincular.length} volumes...`);
      setVinculandoEmLote(true);
      setProgressoVinculacao({ atual: 0, total: volumesParaVincular.length });

      const TAMANHO_LOTE = 20; // Processar 20 volumes por vez
      const totalLotes = Math.ceil(volumesParaVincular.length / TAMANHO_LOTE);
      const TIMEOUT_POR_LOTE = 30000; // 30 segundos por lote

      try {
        for (let i = 0; i < totalLotes; i++) {
          const inicio = i * TAMANHO_LOTE;
          const fim = Math.min((i + 1) * TAMANHO_LOTE, volumesParaVincular.length);
          const lote = volumesParaVincular.slice(inicio, fim);
          const historicoLote = historicosParaCriar.slice(inicio, fim);

          console.log(`  📦 Lote ${i + 1}/${totalLotes}: vinculando ${lote.length} volumes...`);

          // Vincular lote em paralelo com timeout
          const lotePromise = Promise.all([
            ...lote.map(v => base44.entities.Volume.update(v.id, v.data)),
            ...historicoLote.map(h => base44.entities.HistoricoEtiquetaMae.create(h))
          ]);

          const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error(`Timeout no lote ${i + 1}`)), TIMEOUT_POR_LOTE)
          );

          await Promise.race([lotePromise, timeoutPromise]);

          // Atualizar progresso
          setProgressoVinculacao({ atual: fim, total: volumesParaVincular.length });
          console.log(`  ✅ Lote ${i + 1}/${totalLotes} concluído`);

          // Pequeno delay entre lotes para suavizar
          if (i < totalLotes - 1) {
            await new Promise(resolve => setTimeout(resolve, 150));
          }
        }

        console.log("  ✓ Vinculação completa");
      } catch (error) {
        console.error("❌ Erro durante vinculação em lote:", error);
        setVinculandoEmLote(false);
        playErrorBeep();
        toast.error(`❌ Erro ao vincular volumes\n\n${error.message}`, {
          duration: 5000,
          style: { whiteSpace: 'pre-line' }
        });
        throw error; // Re-throw para ser capturado pelo catch externo
      } finally {
        setVinculandoEmLote(false);
      }

      // RECARREGAR DADOS CONSOLIDADOS DO BANCO
      console.log("🔄 Recarregando do banco para garantir consistência...");

      // Buscar apenas volumes da etiqueta atual (mais eficiente)
      const volumesVinculadosAtualizados = await base44.entities.Volume.filter(
        { etiqueta_mae_id: etiquetaSelecionada.id }, 
        null, 
        1000
      );

      console.log(`  ✅ ${volumesVinculadosAtualizados.length} volumes vinculados confirmados no banco`);

      // Recarregar volumes e notas para estado global
      const volumesConsolidados = await base44.entities.Volume.list(null, 2000);
      const notasConsolidadas = await base44.entities.NotaFiscal.list(null, 500);

      const novosVolumesIds = volumesVinculadosAtualizados.map(v => v.id);
      const pesoTotal = volumesVinculadosAtualizados.reduce((sum, v) => sum + (v.peso_volume || 0), 0);
      const m3Total = volumesVinculadosAtualizados.reduce((sum, v) => sum + (v.m3 || 0), 0);
      const notasIds = [...new Set(volumesVinculadosAtualizados.map(v => v.nota_fiscal_id).filter(Boolean))];

      // ATUALIZAR ETIQUETA
      await base44.entities.EtiquetaMae.update(etiquetaSelecionada.id, {
        volumes_ids: novosVolumesIds,
        quantidade_volumes: novosVolumesIds.length,
        peso_total: pesoTotal,
        m3_total: m3Total,
        notas_fiscais_ids: notasIds,
        status: "em_unitizacao"
      });

      const etiquetaFinal = await base44.entities.EtiquetaMae.get(etiquetaSelecionada.id);

      // ATUALIZAR ESTADOS
      setEtiquetaSelecionada(etiquetaFinal);
      setVolumesVinculados(volumesVinculadosAtualizados);
      setVolumes(volumesConsolidados);
      setNotas(notasConsolidadas);
      volumesVinculadosIdsRef.current = new Set(novosVolumesIds);

      // Atualizar lista local de etiquetas (sem recarregar)
      setEtiquetas(prev => prev.map(e => 
        e.id === etiquetaSelecionada.id ? etiquetaFinal : e
      ));

      // FEEDBACK DETALHADO
      const todosVolumesNota = volumesConsolidados.filter(v => v.nota_fiscal_id === notaFiscal.id);
      const volumesVinculadosNota = volumesVinculadosAtualizados.filter(v => v.nota_fiscal_id === notaFiscal.id);
      const faltam = todosVolumesNota.length - volumesVinculadosNota.length;
      const notaCompleta = faltam === 0;
      
      playSuccessBeep();
      
      // ATUALIZAR PROGRESSO DA NOTA NO SCANNER (scan NF-e)
      setNotaAtualScanner(notaFiscal);
      setProgressoNotaScanner({
        embarcados: volumesVinculadosNota.length,
        total: todosVolumesNota.length,
        faltam
      });

      const feedbackMsg = notaCompleta
        ? `✅ NF ${notaFiscal.numero_nota} COMPLETA!\n📦 ${todosVolumesNota.length}/${todosVolumesNota.length} volumes\n✓ Total: ${volumesVinculadosAtualizados.length}`
        : `✅ ${volumesParaVincular.length} volumes adicionados\n📋 NF ${notaFiscal.numero_nota}\n⏳ Faltam ${faltam} volume(s)\n📦 Total: ${volumesVinculadosAtualizados.length}`;

      toast.success(feedbackMsg, { 
        duration: notaCompleta ? 5000 : 4000,
        style: { 
          whiteSpace: 'pre-line', 
          fontSize: '14px', 
          lineHeight: '1.5',
          fontWeight: notaCompleta ? 'bold' : '600',
          background: notaCompleta ? '#10b981' : undefined,
          color: notaCompleta ? 'white' : undefined,
          padding: '16px',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
        }
      });
      
      console.log("✅ Processamento NF-e concluído");
      
      setCodigoScanner("");
      setTimeout(() => {
        const input = document.querySelector('input[placeholder*="Bipe volume ou chave NF-e"]');
        if (input) {
          input.focus();
          input.select();
        }
      }, 100);
      
    } catch (error) {
      console.error("❌ ERRO [NF-e]:", error);
      playErrorBeep();
      toast.error(`❌ Erro ao processar NF-e\n${error.message}`, {
        duration: 3000,
        style: { whiteSpace: 'pre-line', fontSize: '12px' }
      });
      
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
            const criador = usuarios.find(u => u.id === etiqueta.criado_por);
            
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
                  
                  <div className="grid grid-cols-4 gap-2 py-2 border-t border-b my-2" style={{ borderColor: theme.cardBorder }}>
                    <div className="text-center">
                      <p className="text-[10px] mb-0.5" style={{ color: theme.textMuted }}>Volumes</p>
                      <p className="text-sm font-bold" style={{ color: theme.text }}>
                        {etiqueta.quantidade_volumes || 0}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-[10px] mb-0.5" style={{ color: theme.textMuted }}>Notas</p>
                      <p className="text-sm font-bold text-orange-600">
                        {(etiqueta.notas_fiscais_ids?.length || 0)}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-[10px] mb-0.5" style={{ color: theme.textMuted }}>Peso</p>
                      <p className="text-sm font-bold text-green-600">
                        {etiqueta.peso_total?.toLocaleString('pt-BR', { minimumFractionDigits: 0 }) || '0'} kg
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-[10px] mb-0.5" style={{ color: theme.textMuted }}>M³</p>
                      <p className="text-sm font-bold text-purple-600">
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
                    <th className="text-left px-3 py-2 text-xs font-semibold" style={{ color: theme.textMuted }}>Notas</th>
                    <th className="text-left px-3 py-2 text-xs font-semibold" style={{ color: theme.textMuted }}>Peso</th>
                    <th className="text-left px-3 py-2 text-xs font-semibold" style={{ color: theme.textMuted }}>M³</th>
                    <th className="text-left px-3 py-2 text-xs font-semibold" style={{ color: theme.textMuted }}>Criado</th>
                    <th className="text-left px-3 py-2 text-xs font-semibold" style={{ color: theme.textMuted }}>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEtiquetas.map((etiqueta) => {
                    const statusInfo = statusConfig[etiqueta.status] || statusConfig.criada;
                    const criador = usuarios.find(u => u.id === etiqueta.criado_por);
                    
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
                          <span className="text-sm font-semibold text-orange-600">
                            {(etiqueta.notas_fiscais_ids?.length || 0)}
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
                              {criador?.full_name?.split(' ')[0] || '-'}
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
              className="max-w-full w-full h-[100dvh] max-h-[100dvh] overflow-y-auto p-0 m-0 sm:max-w-md sm:w-[95vw] sm:h-auto sm:max-h-[90vh] sm:p-4 sm:m-auto sm:rounded-lg" 
              style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}
            >
              <DialogHeader className="pb-2 px-4 pt-3 sm:px-0 sm:pt-0 sticky top-0 z-10 border-b" style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}>
                <DialogTitle className="text-lg sm:text-lg font-bold text-center" style={{ color: theme.text }}>
                  {etiquetaSelecionada.codigo}
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-3 py-3 px-4 sm:px-0 pb-32 sm:pb-4">
                {/* Resumo Compacto */}
                <div className="grid grid-cols-4 gap-1.5 p-2.5 rounded-lg border-2" style={{ backgroundColor: isDark ? '#0f172a' : '#f8fafc', borderColor: '#3b82f6' }}>
                  <div className="text-center">
                    <p className="text-[9px] mb-0.5 uppercase font-semibold" style={{ color: theme.textMuted }}>Volumes</p>
                    <p className="text-xl font-bold text-blue-600">{volumesVinculados.length}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[9px] mb-0.5 uppercase font-semibold" style={{ color: theme.textMuted }}>Peso</p>
                    <p className="text-sm font-bold text-green-600 leading-tight">
                      {(volumesVinculados.reduce((sum, v) => sum + (v.peso_volume || 0), 0) / 1000).toFixed(1)}
                    </p>
                    <p className="text-[9px] text-green-600">ton</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[9px] mb-0.5 uppercase font-semibold" style={{ color: theme.textMuted }}>M³</p>
                    <p className="text-sm font-bold text-purple-600 leading-tight">
                      {volumesVinculados.reduce((sum, v) => sum + (v.m3 || 0), 0).toFixed(2)}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-[9px] mb-0.5 uppercase font-semibold" style={{ color: theme.textMuted }}>Notas</p>
                    <p className="text-xl font-bold text-orange-600">
                      {[...new Set(volumesVinculados.map(v => v.nota_fiscal_id).filter(Boolean))].length}
                    </p>
                  </div>
                </div>

                {etiquetaSelecionada.status !== "finalizada" && (
                  <div className="space-y-2">
                    {/* Progresso da Nota Atual */}
                    {notaAtualScanner && progressoNotaScanner && (
                      <div className="p-2.5 rounded-lg border-2" style={{ 
                        backgroundColor: progressoNotaScanner.faltam === 0 ? (isDark ? '#064e3b' : '#d1fae5') : (isDark ? '#1e293b' : '#f0f9ff'),
                        borderColor: progressoNotaScanner.faltam === 0 ? '#10b981' : '#3b82f6'
                      }}>
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <FileText className={`w-3.5 h-3.5 ${progressoNotaScanner.faltam === 0 ? 'text-green-600' : 'text-blue-600'}`} />
                            <span className="text-sm font-bold" style={{ color: theme.text }}>
                              NF {notaAtualScanner.numero_nota}
                            </span>
                          </div>
                          <Badge className={`${progressoNotaScanner.faltam === 0 ? 'bg-green-600' : 'bg-orange-500'} text-white text-sm px-2.5 py-1 font-bold`}>
                            {progressoNotaScanner.embarcados}/{progressoNotaScanner.total}
                          </Badge>
                        </div>
                        {progressoNotaScanner.faltam > 0 && (
                          <p className="text-xs font-bold text-orange-600 flex items-center gap-1">
                            <span className="text-base">⏳</span> Faltam {progressoNotaScanner.faltam} volume(s)
                          </p>
                        )}
                        {progressoNotaScanner.faltam === 0 && (
                          <p className="text-xs font-bold text-green-600 flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> NOTA COMPLETA!
                          </p>
                        )}
                      </div>
                    )}

                    {/* Barra de Progresso de Vinculação em Lote */}
                    {vinculandoEmLote && (
                      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 max-w-sm w-full shadow-2xl">
                          <div className="flex items-center justify-center mb-4">
                            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                              <Package className="w-6 h-6 text-green-600 animate-pulse" />
                            </div>
                          </div>
                          <h3 className="text-lg font-bold text-center mb-2" style={{ color: theme.text }}>
                            Vinculando Volumes
                          </h3>
                          <p className="text-center text-sm mb-4" style={{ color: theme.textMuted }}>
                            Aguarde enquanto os volumes são vinculados...
                          </p>
                          <div className="space-y-3">
                            <div className="flex items-center justify-between text-sm">
                              <span style={{ color: theme.textMuted }}>Progresso</span>
                              <span className="font-bold text-green-600">
                                {progressoVinculacao.atual}/{progressoVinculacao.total}
                              </span>
                            </div>
                            <div className="relative">
                              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 overflow-hidden">
                                <div 
                                  className="h-full bg-gradient-to-r from-green-500 to-green-600 transition-all duration-300 ease-out"
                                  style={{ width: `${(progressoVinculacao.atual / progressoVinculacao.total) * 100}%` }}
                                />
                              </div>
                              <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-xs font-bold text-white drop-shadow-lg">
                                  {Math.round((progressoVinculacao.atual / progressoVinculacao.total) * 100)}%
                                </span>
                              </div>
                            </div>
                            <p className="text-xs text-center" style={{ color: theme.textMuted }}>
                              Este processo pode levar alguns segundos
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    <input
                      ref={(el) => {
                        if (el && showUnitizacaoModal && etiquetaSelecionada.status !== "finalizada" && !processando && !vinculandoEmLote) {
                          setTimeout(() => el.focus(), 100);
                        }
                      }}
                      type="text"
                      value={codigoScanner}
                      onChange={(e) => {
                        setCodigoScanner(e.target.value);
                        // Auto-processar códigos completos
                        const valor = e.target.value.trim();
                        // Chave NF-e (44 dígitos)
                        const digitos = valor.replace(/\D/g, '');
                        if (digitos.length === 44 && !processando) {
                          handleScan(digitos);
                          return;
                        }
                        // Código de volume (VOL-...)
                        if (valor.startsWith('VOL-') && valor.length > 15 && !processando) {
                          handleScan(valor);
                        }
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && codigoScanner.trim() && !processando) {
                          e.preventDefault();
                          handleScan(codigoScanner);
                        }
                      }}
                      onBlur={(e) => {
                        // Recuperar foco automaticamente após perda
                        if (!vinculandoEmLote && !processando && etiquetaSelecionada.status !== "finalizada") {
                          setTimeout(() => e.target.focus(), 50);
                        }
                      }}
                      placeholder="Bipe volume ou chave NF-e..."
                      className="w-full h-12 px-3 pr-10 text-sm font-mono rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                      style={{ 
                        backgroundColor: theme.inputBg, 
                        borderColor: theme.inputBorder, 
                        color: theme.text
                      }}
                      inputMode="none"
                      autoComplete="off"
                      autoCorrect="off"
                      autoCapitalize="off"
                      spellCheck="false"
                      readOnly={false}
                      disabled={processando || vinculandoEmLote}
                      autoFocus
                    />
                    <Button
                      onClick={() => setShowVolumeCameraScanner(true)}
                      className="bg-green-600 hover:bg-green-700 w-full h-14 text-lg font-bold"
                      disabled={processando || vinculandoEmLote}
                    >
                      <Camera className="w-6 h-6 mr-2" />
                      CÂMERA
                    </Button>
                    </div>
                    )}

                {volumesVinculados.length > 0 && (
                  <Card style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}>
                    <CardHeader className="pb-2 pt-2.5 px-2.5">
                      <CardTitle className="text-sm flex items-center gap-2" style={{ color: theme.text }}>
                        <Package className="w-4 h-4 text-purple-600" />
                        Volumes Vinculados ({volumesVinculados.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-3 pt-0">
                      {/* Botão para mostrar/ocultar Debug */}
                      <button
                        onClick={() => setShowDebug(!showDebug)}
                        className="mb-2 text-xs text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 flex items-center gap-1"
                      >
                        {showDebug ? '▼' : '▶'} Debug
                      </button>
                      
                      {/* DEBUG INFO */}
                      {showDebug && (
                        <div className="mb-2 p-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded text-xs">
                          <p><strong>DEBUG:</strong></p>
                          <p>• volumesVinculados: {volumesVinculados.length}</p>
                          <p>• volumes totais: {volumes.length}</p>
                          <p>• notas totais: {notas.length}</p>
                          <p>• etiqueta.volumes_ids: {etiquetaSelecionada.volumes_ids?.length || 0}</p>
                          <p>• etiqueta.notas_fiscais_ids: {etiquetaSelecionada.notas_fiscais_ids?.length || 0}</p>
                          {volumesVinculados.length > 0 && (
                            <>
                              <p className="mt-1"><strong>Primeiro volume:</strong></p>
                              <p>• ID: {volumesVinculados[0].id}</p>
                              <p>• identificador: {volumesVinculados[0].identificador_unico}</p>
                              <p>• nota_fiscal_id: {volumesVinculados[0].nota_fiscal_id}</p>
                              <p>• etiqueta_mae_id: {volumesVinculados[0].etiqueta_mae_id}</p>
                            </>
                          )}
                        </div>
                      )}
                      {/* Resumo por Nota Fiscal - Apontamento de Faltantes */}
                      <div className="mb-3 space-y-2">
                        {(() => {
                          const notasOrdenadas = [];
                          const notasProcessadas = new Set();
                          
                          console.log("🔍 DEBUG - volumesVinculados:", volumesVinculados);
                          console.log("🔍 DEBUG - notas disponíveis:", notas.length);
                          
                          volumesVinculados.forEach(volume => {
                            const notaId = volume.nota_fiscal_id;
                            console.log(`  • Volume ${volume.identificador_unico} -> nota_fiscal_id: ${notaId}`);
                            
                            if (notaId && !notasProcessadas.has(notaId)) {
                              notasProcessadas.add(notaId);
                              notasOrdenadas.push(notaId);
                            }
                          });
                          
                          console.log("📋 Notas únicas encontradas:", notasOrdenadas);
                          
                          return notasOrdenadas.map(notaId => {
                            const nota = notas.find(n => n.id === notaId);
                            console.log(`  • Buscando nota ${notaId}:`, nota ? `Encontrada (${nota.numero_nota})` : "NÃO ENCONTRADA");
                            
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
                                      className={`text-xs px-2 py-0.5 font-bold ${
                                        completa 
                                          ? 'bg-green-600 text-white' 
                                          : (faltantes > 0 ? 'bg-orange-500 text-white' : 'bg-blue-600 text-white')
                                      }`}
                                    >
                                      {volumesVinculadosNota.length}/{todosVolumesNota.length}
                                    </Badge>
                                    {faltantes > 0 ? (
                                      <Badge className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200 text-xs px-2 py-1 font-bold animate-pulse">
                                        ⚠️ FALTAM {faltantes}
                                      </Badge>
                                    ) : (
                                      <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200 text-xs px-2 py-1 font-bold">
                                        ✓ COMPLETA
                                      </Badge>
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

              <DialogFooter className="flex-col gap-2 pt-3 px-4 pb-4 sm:px-0 sm:pb-0 fixed bottom-0 left-0 right-0 sm:relative border-t shadow-2xl z-20" style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}>
                {etiquetaSelecionada.status !== "finalizada" && (
                  <Button
                    onClick={handleFinalizar}
                    disabled={volumesVinculados.length === 0}
                    className="bg-green-600 hover:bg-green-700 w-full h-14 text-lg font-bold shadow-lg"
                  >
                    <CheckCircle2 className="w-6 h-6 mr-2" />
                    FINALIZAR ({volumesVinculados.length})
                  </Button>
                )}
                {etiquetaSelecionada.status === "finalizada" && (
                  <Button
                    onClick={() => {
                      setShowUnitizacaoModal(false);
                      handleReabrir(etiquetaSelecionada);
                    }}
                    className="bg-orange-600 hover:bg-orange-700 w-full h-14 text-lg font-bold"
                  >
                    <Edit className="w-6 h-6 mr-2" />
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
                    setNotaAtualScanner(null);
                    setProgressoNotaScanner(null);
                    loadData();
                  }}
                  className="w-full h-12"
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
            onClose={() => {
              setShowVolumeCameraScanner(false);
              setNotaAtualScanner(null);
              setProgressoNotaScanner(null);
            }}
            onScan={handleVolumeCameraScan}
            isDark={isDark}
            externalFeedback={cameraScanFeedback}
            notaAtual={notaAtualScanner}
            progressoAtual={progressoNotaScanner}
          />
        )}
      </div>
    </div>
  );
}