import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Package, Upload, Plus, RefreshCw, X, Edit, Search } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import NotaFiscalForm from "../components/notas-fiscais/NotaFiscalForm";
import VolumesModal from "../components/notas-fiscais/VolumesModal";
import OnboardingSolicitacaoColeta from "../components/onboarding/OnboardingSolicitacaoColeta";

export default function SolicitacaoColeta() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [coletas, setColetas] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [chaveAcesso, setChaveAcesso] = useState("");
  const [buscandoNF, setBuscandoNF] = useState(false);
  const [notasFiscais, setNotasFiscais] = useState([]);
  const [operadorLogistico, setOperadorLogistico] = useState(null);
  const [showNotaForm, setShowNotaForm] = useState(false);
  const [notaParaEditar, setNotaParaEditar] = useState(null);
  const [showVolumesModal, setShowVolumesModal] = useState(false);
  const [notaParaVolumes, setNotaParaVolumes] = useState(null);
  const [showScanner, setShowScanner] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const videoRef = React.useRef(null);
  const [metodoEntradaSelecionado, setMetodoEntradaSelecionado] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [tabelas, setTabelas] = useState([]);
  const [tabelaSelecionada, setTabelaSelecionada] = useState(null);
  const [showTabelaManual, setShowTabelaManual] = useState(false);
  const [searchTabela, setSearchTabela] = useState("");
  const [tipoFrete, setTipoFrete] = useState(null); // 'CIF' ou 'FOB'
  const [showTipoFreteModal, setShowTipoFreteModal] = useState(false);
  const [precificacaoCalculada, setPrecificacaoCalculada] = useState(null);
  
  const [formData, setFormData] = useState({
    // Remetente
    remetente_razao_social: "",
    remetente_cnpj: "",
    remetente_telefone: "",
    remetente_uf: "",
    remetente_cidade: "",
    remetente_bairro: "",
    remetente_endereco: "",
    remetente_numero: "",
    remetente_cep: "",
    // Destinatário
    destinatario: "",
    destinatario_cnpj: "",
    destinatario_telefone: "",
    destino_cidade: "",
    destino_uf: "",
    destino_bairro: "",
    destino_numero: "",
    destino_endereco: "",
    destino_cep: "",
    produto: "",
    data_carregamento: "",
    observacao_carga: "",
    tipo_embalagem: ""
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
    loadUserAndColetas();
    
    // Verificar se já viu o onboarding
    const onboardingCompleted = localStorage.getItem('onboarding_solicitacao_coleta_completed');
    if (!onboardingCompleted) {
      // Delay para mostrar depois que a página carregar
      setTimeout(() => setShowOnboarding(true), 1000);
    }
  }, []);

  // Efeito para iniciar a câmera quando o scanner é aberto
  React.useEffect(() => {
    let timeoutId;
    
    if (showScanner && videoRef.current) {
      // Timeout de 10 segundos para detectar falha
      timeoutId = setTimeout(() => {
        if (!cameraReady) {
          console.error("Timeout ao ativar câmera");
          toast.error("Tempo esgotado ao ativar câmera. Tente novamente.");
          setShowScanner(false);
        }
      }, 10000);
      
      const startCamera = async () => {
        try {
          // Para iOS Safari, usar configurações mais simples
          const constraints = {
            video: { 
              facingMode: { ideal: 'environment' },
              width: { ideal: 1280 },
              height: { ideal: 720 }
            },
            audio: false
          };
          
          const stream = await navigator.mediaDevices.getUserMedia(constraints);
          
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            // Forçar play para iOS
            videoRef.current.play().catch(e => {
              console.warn("Aviso ao dar play:", e);
            });
          }
        } catch (err) {
          console.error("Erro ao acessar câmera:", err);
          let errorMsg = "Não foi possível acessar a câmera.";
          
          if (err.name === 'NotAllowedError') {
            errorMsg = "Permissão de câmera negada. Ative nas configurações.";
          } else if (err.name === 'NotFoundError') {
            errorMsg = "Nenhuma câmera encontrada no dispositivo.";
          } else if (err.name === 'NotReadableError') {
            errorMsg = "Câmera está em uso por outro aplicativo.";
          }
          
          toast.error(errorMsg);
          setShowScanner(false);
        }
      };
      
      startCamera();
    }
    
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      // Limpar stream ao desmontar
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = videoRef.current.srcObject.getTracks();
        tracks.forEach(track => track.stop());
        videoRef.current.srcObject = null;
      }
      setCameraReady(false);
    };
  }, [showScanner]);

  const [motoristas, setMotoristas] = useState([]);

  const loadUserAndColetas = async () => {
    setLoading(true);
    try {
      const currentUser = await base44.auth.me();
      
      if (currentUser.tipo_perfil !== "fornecedor" && currentUser.role !== "admin") {
        toast.error("Acesso negado. Esta página é apenas para fornecedores.");
        return;
      }
      
      setUser(currentUser);
      
      // Carregar operador logístico vinculado
      if (currentUser.operador_logistico_cnpj) {
        try {
          const empresas = await base44.entities.Empresa.list();
          const operador = empresas.find(e => e.cnpj === currentUser.operador_logistico_cnpj);
          console.log("Operador logístico encontrado:", operador);
          setOperadorLogistico(operador);
        } catch (error) {
          console.error("Erro ao carregar operador logístico:", error);
        }
      } else {
        console.log("Usuário não tem operador_logistico_cnpj definido");
      }
      
      // Carregar coletas solicitadas por este fornecedor e motoristas
      const [ordensData, motoristasData, tabelasData] = await Promise.all([
        base44.entities.OrdemDeCarregamento.list("-data_solicitacao"),
        base44.entities.Motorista.list(),
        base44.entities.TabelaPreco.filter({ ativo: true })
      ]);
      
      const minhasColetas = ordensData.filter(o => o.fornecedor_id === currentUser.id);
      setColetas(minhasColetas);
      setMotoristas(motoristasData);
      setTabelas(tabelasData);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const buscarDadosCNPJ = async (cnpj, tipo) => {
    // Limpar CNPJ - remover formatação
    const cnpjLimpo = cnpj.replace(/\D/g, '');
    
    // Validar se tem 14 dígitos
    if (cnpjLimpo.length !== 14) {
      return;
    }

    try {
      const response = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cnpjLimpo}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          toast.error("CNPJ não encontrado");
        } else if (response.status === 400) {
          toast.error("CNPJ inválido");
        } else {
          toast.error("Erro ao buscar dados do CNPJ");
        }
        return;
      }

      const data = await response.json();
      
      // Formatar telefone
      const telefone = data.ddd_telefone_1 ? `(${data.ddd_telefone_1.slice(0, 2)}) ${data.ddd_telefone_1.slice(2)}` : "";
      
      if (tipo === "remetente") {
        setFormData(prev => ({
          ...prev,
          remetente_razao_social: data.razao_social || "",
          remetente_telefone: telefone,
          remetente_uf: data.uf || "",
          remetente_cidade: data.municipio || "",
          remetente_bairro: data.bairro || "",
          remetente_endereco: `${data.descricao_tipo_de_logradouro || ""} ${data.logradouro || ""}`.trim(),
          remetente_numero: data.numero || "",
          remetente_cep: data.cep || ""
        }));
        toast.success("Dados do emitente preenchidos automaticamente!");
      } else if (tipo === "destinatario") {
        setFormData(prev => ({
          ...prev,
          destinatario: data.razao_social || "",
          destinatario_telefone: telefone,
          destino_uf: data.uf || "",
          destino_cidade: data.municipio || "",
          destino_bairro: data.bairro || "",
          destino_endereco: `${data.descricao_tipo_de_logradouro || ""} ${data.logradouro || ""}`.trim(),
          destino_numero: data.numero || "",
          destino_cep: data.cep || ""
        }));
        toast.success("Dados do destinatário preenchidos automaticamente!");
      }
    } catch (error) {
      console.error("Erro ao buscar CNPJ:", error);
      toast.error("Erro ao buscar dados do CNPJ");
    }
  };

  const handleUsarOperadorLogistico = () => {
    if (!operadorLogistico) {
      toast.error("Operador logístico não encontrado");
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      destinatario: operadorLogistico.razao_social || operadorLogistico.nome_fantasia,
      destinatario_cnpj: operadorLogistico.cnpj,
      destino_cidade: operadorLogistico.cidade,
      destino_uf: operadorLogistico.estado,
      destino_endereco: operadorLogistico.endereco,
      destino_cep: operadorLogistico.cep
    }));
    
    toast.success("Dados do operador logístico preenchidos!");
  };

  const handleUsarEmpresaAtual = () => {
    if (!user) {
      toast.error("Dados do usuário não encontrados");
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      remetente_razao_social: user.full_name || "",
      remetente_cnpj: user.cnpj_associado || "",
      remetente_telefone: user.telefone || "",
      remetente_uf: user.uf || "",
      remetente_cidade: user.cidade || "",
      remetente_bairro: user.bairro || "",
      remetente_endereco: user.endereco || "",
      remetente_numero: user.numero || "SN",
      remetente_cep: user.cep || ""
    }));
    
    toast.success("Dados da empresa atual preenchidos!");
  };

  const parseXmlValue = (xmlDoc, path) => {
    try {
      const parts = path.split('/');
      let element = xmlDoc;
      
      for (const part of parts) {
        if (!element) return null;
        const elements = element.getElementsByTagName(part);
        if (elements.length === 0) return null;
        element = elements[0];
      }
      
      return element ? element.textContent : null;
    } catch (e) {
      return null;
    }
  };

  const extrairDadosXML = (xmlDoc, xmlString = "") => {
    const numeroNota = parseXmlValue(xmlDoc, "nNF");
    const serieNota = parseXmlValue(xmlDoc, "serie");
    const dhEmi = parseXmlValue(xmlDoc, "dhEmi");
    const dataEmissao = dhEmi ? dhEmi.split('T')[0] : "";
    const natOp = parseXmlValue(xmlDoc, "natOp");

    // Dados do Remetente (emit)
    const emitNome = parseXmlValue(xmlDoc, "emit/xNome") || parseXmlValue(xmlDoc, "xNome");
    const emitCnpj = parseXmlValue(xmlDoc, "emit/CNPJ") || parseXmlValue(xmlDoc, "CNPJ");
    const emitFone = parseXmlValue(xmlDoc, "emit/enderEmit/fone") || parseXmlValue(xmlDoc, "fone");
    const emitUf = parseXmlValue(xmlDoc, "emit/enderEmit/UF") || parseXmlValue(xmlDoc, "enderEmit/UF");
    const emitCidade = parseXmlValue(xmlDoc, "emit/enderEmit/xMun") || parseXmlValue(xmlDoc, "enderEmit/xMun");
    const emitBairro = parseXmlValue(xmlDoc, "emit/enderEmit/xBairro") || parseXmlValue(xmlDoc, "enderEmit/xBairro");
    const emitLogr = parseXmlValue(xmlDoc, "emit/enderEmit/xLgr") || parseXmlValue(xmlDoc, "enderEmit/xLgr");
    const emitNro = parseXmlValue(xmlDoc, "emit/enderEmit/nro") || parseXmlValue(xmlDoc, "enderEmit/nro");
    const emitCep = parseXmlValue(xmlDoc, "emit/enderEmit/CEP") || parseXmlValue(xmlDoc, "enderEmit/CEP");

    // Dados do Destinatário (dest)
    const destNome = parseXmlValue(xmlDoc, "dest/xNome") || parseXmlValue(xmlDoc, "xNome");
    const destCnpj = parseXmlValue(xmlDoc, "dest/CNPJ") || parseXmlValue(xmlDoc, "CNPJ");
    const destFone = parseXmlValue(xmlDoc, "dest/enderDest/fone") || parseXmlValue(xmlDoc, "fone");
    const destCidade = parseXmlValue(xmlDoc, "dest/enderDest/xMun") || parseXmlValue(xmlDoc, "xMun");
    const destUf = parseXmlValue(xmlDoc, "dest/enderDest/UF") || parseXmlValue(xmlDoc, "UF");
    const destLogr = parseXmlValue(xmlDoc, "dest/enderDest/xLgr") || parseXmlValue(xmlDoc, "xLgr");
    const destNro = parseXmlValue(xmlDoc, "dest/enderDest/nro") || parseXmlValue(xmlDoc, "nro");
    const destBairro = parseXmlValue(xmlDoc, "dest/enderDest/xBairro") || parseXmlValue(xmlDoc, "xBairro");
    const destCep = parseXmlValue(xmlDoc, "dest/enderDest/CEP") || parseXmlValue(xmlDoc, "CEP");

    let enderecoEmit = "";
    if (emitLogr) enderecoEmit = emitLogr;

    let enderecoDest = "";
    if (destLogr) enderecoDest = destLogr;

    const prodNome = parseXmlValue(xmlDoc, "xProd");
    const pesoBruto = parseXmlValue(xmlDoc, "pesoB");
    const valorNF = parseXmlValue(xmlDoc, "vNF");
    const qtdVol = parseXmlValue(xmlDoc, "qVol");
    const especie = parseXmlValue(xmlDoc, "esp");
    const xPed = parseXmlValue(xmlDoc, "xPed");

    return {
      numero_nota: numeroNota || "",
      serie_nota: serieNota || "",
      data_emissao_nf: dataEmissao || "",
      natureza_operacao: natOp || "",
      // Remetente
      emitente_razao_social: emitNome || "",
      emitente_cnpj: emitCnpj || "",
      emitente_telefone: emitFone || "",
      emitente_uf: emitUf || "",
      emitente_cidade: emitCidade || "",
      emitente_bairro: emitBairro || "",
      emitente_endereco: enderecoEmit || "",
      emitente_numero: emitNro || "",
      emitente_cep: emitCep || "",
      // Destinatário
      destinatario: destNome || "",
      destinatario_cnpj: destCnpj || "",
      destinatario_telefone: destFone || "",
      destino_cidade: destCidade || "",
      destino_uf: destUf || "",
      destino_endereco: enderecoDest || "",
      destino_numero: destNro || "",
      destino_bairro: destBairro || "",
      destino_cep: destCep || "",
      produto: prodNome || "",
      peso_nf: pesoBruto ? parseFloat(pesoBruto) : null,
      valor_nf: valorNF ? parseFloat(valorNF) : null,
      volumes_nf: qtdVol ? parseInt(qtdVol) : null,
      tipo_embalagem: especie || "",
      viagem_pedido: xPed || "",
      data_carregamento: dataEmissao || "",
      xml_content: xmlString
    };
    };

  const handleBuscarPorChave = async (chave = chaveAcesso) => {
    if (!chave || chave.length !== 44) {
      return;
    }

    setBuscandoNF(true);
    try {
      const response = await base44.functions.invoke('buscarNotaFiscalMeuDanfe', {
        chaveAcesso: chave
      });

      if (response.data?.error) {
        toast.error(response.data.error);
        setChaveAcesso("");
        return;
      }

      if (response.data?.xml) {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(response.data.xml, "text/xml");

        const parseError = xmlDoc.querySelector("parsererror");
        if (parseError) {
          toast.error("Erro ao processar o XML retornado.");
          setChaveAcesso("");
          return;
        }

        const dadosNF = extrairDadosXML(xmlDoc, response.data.xml);

        // Atualizar form com dados do remetente e destinatário se for a primeira nota
        if (notasFiscais.length === 0) {
          setFormData(prev => ({
            ...prev,
            // Remetente
            remetente_razao_social: dadosNF.emitente_razao_social,
            remetente_cnpj: dadosNF.emitente_cnpj,
            remetente_telefone: dadosNF.emitente_telefone,
            remetente_uf: dadosNF.emitente_uf,
            remetente_cidade: dadosNF.emitente_cidade,
            remetente_bairro: dadosNF.emitente_bairro,
            remetente_endereco: dadosNF.emitente_endereco,
            remetente_numero: dadosNF.emitente_numero,
            remetente_cep: dadosNF.emitente_cep,
            // Destinatário
            destinatario: dadosNF.destinatario,
            destinatario_cnpj: dadosNF.destinatario_cnpj,
            destino_cidade: dadosNF.destino_cidade,
            destino_uf: dadosNF.destino_uf,
            destino_endereco: dadosNF.destino_endereco,
            destino_cep: dadosNF.destino_cep,
            data_carregamento: dadosNF.data_carregamento
          }));
        }
        
        setNotasFiscais(prev => [...prev, dadosNF]);
        setChaveAcesso(""); // Limpar campo para próxima bipagem
        toast.success(`NF-e ${dadosNF.numero_nota} adicionada!`);
      } else {
        toast.error("Resposta inválida da API");
        setChaveAcesso("");
      }
    } catch (error) {
      console.error("Erro completo:", error);
      const errorMsg = error?.response?.data?.error || error?.message || "Erro ao buscar nota fiscal";
      toast.error(errorMsg);
      setChaveAcesso("");
    } finally {
      setBuscandoNF(false);
    }
  };

  const handleFileUpload = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setSaving(true);
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        if (file.type === "text/xml" || file.name.endsWith(".xml")) {
          const reader = new FileReader();
          reader.onload = async (event) => {
            try {
              const parser = new DOMParser();
              const xmlDoc = parser.parseFromString(event.target.result, "text/xml");

              const parseError = xmlDoc.querySelector("parsererror");
              if (parseError) {
                toast.error(`Erro ao processar ${file.name}`);
                return;
              }

              const dadosNF = extrairDadosXML(xmlDoc, event.target.result);

              // Atualizar form com dados do remetente e destinatário se for a primeira nota
              if (notasFiscais.length === 0) {
                setFormData(prev => ({
                  ...prev,
                  // Remetente
                  remetente_razao_social: dadosNF.emitente_razao_social,
                  remetente_cnpj: dadosNF.emitente_cnpj,
                  remetente_telefone: dadosNF.emitente_telefone,
                  remetente_uf: dadosNF.emitente_uf,
                  remetente_cidade: dadosNF.emitente_cidade,
                  remetente_bairro: dadosNF.emitente_bairro,
                  remetente_endereco: dadosNF.emitente_endereco,
                  remetente_numero: dadosNF.emitente_numero,
                  remetente_cep: dadosNF.emitente_cep,
                  // Destinatário
                  destinatario: dadosNF.destinatario,
                  destinatario_cnpj: dadosNF.destinatario_cnpj,
                  destino_cidade: dadosNF.destino_cidade,
                  destino_uf: dadosNF.destino_uf,
                  destino_endereco: dadosNF.destino_endereco,
                  destino_cep: dadosNF.destino_cep,
                  data_carregamento: dadosNF.data_carregamento
                }));
              }
              
              setNotasFiscais(prev => [...prev, dadosNF]);
              toast.success(`NF-e ${dadosNF.numero_nota} adicionada!`);
            } catch (xmlError) {
              console.error("Erro ao processar XML:", xmlError);
              toast.error(`Erro ao processar ${file.name}`);
            }
          };
          reader.readAsText(file);
        }
      }
    } catch (error) {
      console.error("Erro ao processar arquivos:", error);
      toast.error("Erro ao processar arquivos");
    } finally {
      setSaving(false);
      e.target.value = '';
    }
  };

  const generateNumeroColeta = () => {
    const year = new Date().getFullYear();
    const sequence = (coletas.length + 1).toString().padStart(5, '0');
    return `COL-${year}-${sequence}`;
  };

  const handleRemoverNota = (index) => {
    setNotasFiscais(prev => prev.filter((_, i) => i !== index));
    toast.success("Nota fiscal removida");
  };

  const handleEditarNota = (index) => {
    setNotaParaEditar({ ...notasFiscais[index], index });
    setShowNotaForm(true);
  };

  const handleInformarVolumes = (index) => {
    setNotaParaVolumes({ ...notasFiscais[index], index });
    setShowVolumesModal(true);
  };

  const calcularPrecificacao = () => {
    if (!tabelaSelecionada) return null;

    const pesoTotal = notasFiscais.reduce((sum, nf) => sum + (nf.peso_nf || 0), 0);
    const valorTotal = notasFiscais.reduce((sum, nf) => sum + (nf.valor_nf || 0), 0);
    
    // Calcular cubagem total
    const todosVolumes = notasFiscais.flatMap(nf => nf.volumes || []);
    const cubagemTotal = todosVolumes.reduce((sum, v) => sum + (v.m3 || 0), 0);

    // Encontrar faixa de peso aplicável
    const itens = tabelaSelecionada.itens || [];
    const itemAplicavel = itens.find(item => 
      pesoTotal >= item.faixa_peso_min && pesoTotal <= item.faixa_peso_max
    );

    if (!itemAplicavel) {
      return { 
        erro: "Peso fora das faixas da tabela",
        peso: pesoTotal,
        cubagem: cubagemTotal,
        valor: valorTotal
      };
    }

    // TODO: Calcular KM (por enquanto assumir faixa A)
    const kmFaixa = "A";
    const valorFaixa = itemAplicavel.valores_colunas?.[kmFaixa] || 0;

    let valorBase = 0;

    // Calcular baseado no tipo de tabela
    switch (tabelaSelecionada.tipo_tabela) {
      case "peso_km":
        if (itemAplicavel.unidade === "viagem") {
          valorBase = valorFaixa;
        } else if (itemAplicavel.unidade === "tonelada") {
          valorBase = valorFaixa * (pesoTotal / 1000);
        } else if (itemAplicavel.unidade === "kg") {
          valorBase = valorFaixa * pesoTotal;
        }
        break;
      case "percentual_nf":
        valorBase = valorTotal * (valorFaixa / 100);
        break;
      case "valor_fixo":
        valorBase = valorFaixa;
        break;
      default:
        valorBase = valorFaixa;
    }

    // Aplicar adicionais e taxas
    let valorFinal = valorBase;
    
    if (tabelaSelecionada.frete_minimo && valorFinal < tabelaSelecionada.frete_minimo) {
      valorFinal = tabelaSelecionada.frete_minimo;
    }

    // Ad Valorem
    if (tabelaSelecionada.ad_valorem) {
      valorFinal += valorTotal * (tabelaSelecionada.ad_valorem / 100);
    }

    // GRIS
    if (tabelaSelecionada.gris) {
      valorFinal += valorTotal * (tabelaSelecionada.gris / 100);
    }

    // Pedagio
    if (tabelaSelecionada.pedagio) {
      if (tabelaSelecionada.tipo_pedagio === "fixo") {
        valorFinal += tabelaSelecionada.pedagio;
      } else if (tabelaSelecionada.tipo_pedagio === "percentual") {
        valorFinal += valorBase * (tabelaSelecionada.pedagio / 100);
      }
    }

    // Taxas fixas
    valorFinal += (tabelaSelecionada.taxa_coleta || 0);
    valorFinal += (tabelaSelecionada.taxa_entrega || 0);
    valorFinal += (tabelaSelecionada.taxa_redespacho || 0);
    valorFinal += (tabelaSelecionada.tde || 0);

    return {
      tabela: tabelaSelecionada.nome,
      faixaPeso: `${itemAplicavel.faixa_peso_min} - ${itemAplicavel.faixa_peso_max} kg`,
      faixaKm: kmFaixa,
      valorBase,
      valorFinal,
      peso: pesoTotal,
      cubagem: cubagemTotal,
      valor: valorTotal,
      unidade: itemAplicavel.unidade
    };
  };

  useEffect(() => {
    if (tabelaSelecionada && notasFiscais.length > 0) {
      const resultado = calcularPrecificacao();
      setPrecificacaoCalculada(resultado);
    } else {
      setPrecificacaoCalculada(null);
    }
  }, [tabelaSelecionada, notasFiscais]);

  const handleSalvarVolumes = (notaData) => {
    // Calcular valores dos volumes
    const volumesArray = notaData.volumes || [];
    const pesoTotal = volumesArray.reduce((sum, v) => sum + (parseFloat(v.peso_volume) || 0), 0);
    const qtdTotal = volumesArray.length;
    
    // Mapear campos para compatibilidade
    const notaAtualizada = {
      ...notaData,
      volumes_nf: qtdTotal,
      peso_nf: pesoTotal,
      // Manter campos do VolumesModal também
      quantidade_total_volumes_nf: qtdTotal,
      peso_total_nf: pesoTotal
    };
    
    if (notaParaVolumes?.index !== undefined) {
      setNotasFiscais(prev => prev.map((nf, i) => i === notaParaVolumes.index ? notaAtualizada : nf));
      
      // Se tem carta de correção, adicionar observação
      if (notaData.tem_carta_correcao) {
        const pesoOriginal = notaParaVolumes.peso_nf || 0;
        const volumeOriginal = notaParaVolumes.volumes_nf || 0;
        
        let textoCorrecao = "";
        
        if (Math.abs(pesoTotal - pesoOriginal) > 0.001 && qtdTotal !== volumeOriginal) {
          textoCorrecao = `[CARTA DE CORREÇÃO] NF ${notaData.numero_nota}: Alteração de peso (de ${pesoOriginal}kg para ${pesoTotal.toFixed(3)}kg) e volume (de ${volumeOriginal} para ${qtdTotal} volumes). Carta de correção anexada.`;
        } else if (Math.abs(pesoTotal - pesoOriginal) > 0.001) {
          textoCorrecao = `[CARTA DE CORREÇÃO] NF ${notaData.numero_nota}: Alteração de peso (de ${pesoOriginal}kg para ${pesoTotal.toFixed(3)}kg). Carta de correção anexada.`;
        } else if (qtdTotal !== volumeOriginal) {
          textoCorrecao = `[CARTA DE CORREÇÃO] NF ${notaData.numero_nota}: Alteração de volume (de ${volumeOriginal} para ${qtdTotal} volumes). Carta de correção anexada.`;
        }
        
        if (textoCorrecao) {
          setFormData(prev => ({
            ...prev,
            observacao_carga: prev.observacao_carga 
              ? `${prev.observacao_carga}\n\n${textoCorrecao}` 
              : textoCorrecao
          }));
        }
      }
      
      toast.success("Volumes atualizados com sucesso!");
    } else {
      // Nova nota criada manualmente
      setNotasFiscais(prev => [...prev, notaAtualizada]);
      toast.success("Nota fiscal manual adicionada com sucesso!");
    }
  };

  const handleSalvarNota = (notaData) => {
    if (notaParaEditar?.index !== undefined) {
      // Editar nota existente
      setNotasFiscais(prev => prev.map((nf, i) => i === notaParaEditar.index ? notaData : nf));
      toast.success("Nota fiscal atualizada");
    } else {
      // Adicionar nova nota
      setNotasFiscais(prev => [...prev, notaData]);
      toast.success("Nota fiscal adicionada");
    }
  };

  const handleNovaNotaManual = () => {
    // Criar nota vazia sem volumes - usuário deve adicionar manualmente
    const notaVazia = {
      numero_nota: "",
      serie_nota: "",
      data_emissao_nf: new Date().toISOString().split('T')[0],
      volumes_nf: 0,
      peso_nf: 0,
      valor_nf: 0,
      volumes: []
    };
    setNotaParaVolumes(notaVazia);
    setShowVolumesModal(true);
    setMetodoEntradaSelecionado(true);
  };

  const buscarTabelaParceiro = async (cnpj) => {
    if (!cnpj) return null;

    const parceiros = await base44.entities.Parceiro.list();
    const parceiro = parceiros.find(p => p.cnpj === cnpj.replace(/\D/g, ''));
    
    if (!parceiro) return null;

    const tabelasParceiro = tabelas.filter(t => 
      t.clientes_parceiros_ids?.includes(parceiro.id) &&
      t.tipos_aplicacao?.includes("coleta")
    );

    if (tabelasParceiro.length > 0) {
      // Retornar a primeira tabela ativa e dentro da vigência
      const hoje = new Date();
      const tabelaValida = tabelasParceiro.find(t => {
        const inicio = t.vigencia_inicio ? new Date(t.vigencia_inicio) : null;
        const fim = t.vigencia_fim ? new Date(t.vigencia_fim) : null;
        
        if (inicio && hoje < inicio) return false;
        if (fim && hoje > fim) return false;
        
        return true;
      });

      return tabelaValida || tabelasParceiro[0];
    }

    return null;
  };

  useEffect(() => {
    const verificarTabela = async () => {
      if (!formData.remetente_cnpj && !formData.destinatario_cnpj) {
        setTabelaSelecionada(null);
        setTipoFrete(null);
        return;
      }

      const tabelaRemetente = await buscarTabelaParceiro(formData.remetente_cnpj);
      const tabelaDestinatario = await buscarTabelaParceiro(formData.destinatario_cnpj);

      // Se ambos têm tabela, perguntar CIF ou FOB
      if (tabelaRemetente && tabelaDestinatario && !tipoFrete) {
        setShowTipoFreteModal(true);
        return;
      }

      // Se apenas um tem tabela, usar essa
      if (tabelaRemetente && !tabelaDestinatario) {
        const tabelaComItens = await carregarItensDaTabela(tabelaRemetente);
        setTabelaSelecionada(tabelaComItens);
        setShowTabelaManual(false);
      } else if (tabelaDestinatario && !tabelaRemetente) {
        const tabelaComItens = await carregarItensDaTabela(tabelaDestinatario);
        setTabelaSelecionada(tabelaComItens);
        setShowTabelaManual(false);
      } else if (tipoFrete) {
        // Aplicar baseado no tipo de frete
        const tabelaEscolhida = tipoFrete === "CIF" ? tabelaRemetente : tabelaDestinatario;
        if (tabelaEscolhida) {
          const tabelaComItens = await carregarItensDaTabela(tabelaEscolhida);
          setTabelaSelecionada(tabelaComItens);
          setShowTabelaManual(false);
        }
      } else {
        // Nenhum tem tabela
        setTabelaSelecionada(null);
        setShowTabelaManual(true);
      }
    };

    if (metodoEntradaSelecionado) {
      verificarTabela();
    }
  }, [formData.remetente_cnpj, formData.destinatario_cnpj, tipoFrete, metodoEntradaSelecionado, tabelas]);

  const carregarItensDaTabela = async (tabela) => {
    try {
      const itens = await base44.entities.TabelaPrecoItem.filter(
        { tabela_preco_id: tabela.id },
        "ordem",
        100
      );
      return { ...tabela, itens };
    } catch (error) {
      console.error("Erro ao carregar itens da tabela:", error);
      return { ...tabela, itens: [] };
    }
  };

  const handleSelecionarTabelaManual = async (tabelaId) => {
    const tabela = tabelas.find(t => t.id === tabelaId);
    if (tabela) {
      const tabelaComItens = await carregarItensDaTabela(tabela);
      setTabelaSelecionada(tabelaComItens);
      setShowTabelaManual(false);
      setSearchTabela("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.destinatario || !formData.destinatario_cnpj || notasFiscais.length === 0) {
      toast.error("Preencha os dados do destinatário e adicione ao menos uma nota fiscal");
      return;
    }

    // Validar se todas as notas têm volumes com dimensões preenchidas
    const notasSemDimensoes = notasFiscais.filter(nf => {
      const volumes = nf.volumes || [];
      if (volumes.length === 0) return true;
      return volumes.some(v => 
        !v.altura || !v.largura || !v.comprimento || 
        v.altura === 0 || v.largura === 0 || v.comprimento === 0
      );
    });

    if (notasSemDimensoes.length > 0) {
      toast.error(`${notasSemDimensoes.length} nota(s) fiscal(is) sem dimensões preenchidas. Informe as dimensões de todos os volumes antes de enviar.`);
      return;
    }

    setSaving(true);
    try {
      // Calcular totais
      const pesoTotal = notasFiscais.reduce((sum, nf) => sum + (nf.peso_nf || 0), 0);
      const valorTotal = notasFiscais.reduce((sum, nf) => sum + (nf.valor_nf || 0), 0);
      const volumesTotal = notasFiscais.reduce((sum, nf) => sum + (nf.volumes_nf || 0), 0);
      const numerosNotas = notasFiscais.map(nf => nf.numero_nota).join(", ");
      const produtos = [...new Set(notasFiscais.map(nf => nf.produto))].join(", ");
      
      // Upload dos XMLs
      const xmlUrls = [];
      for (const nf of notasFiscais) {
        if (nf.xml_content) {
          const blob = new Blob([nf.xml_content], { type: 'text/xml' });
          const file = new File([blob], `NFe_${nf.numero_nota}.xml`, { type: 'text/xml' });
          const { file_url } = await base44.integrations.Core.UploadFile({ file });
          xmlUrls.push(file_url);
        }
      }

      // Buscar o operador logístico
      const empresas = await base44.entities.Empresa.list();
      const operadorLogistico = empresas.find(e => e.cnpj === user.operador_logistico_cnpj);
      
      const coletaData = {
        tipo_ordem: "coleta",
        tipo_registro: "coleta_solicitada",
        status: "pendente_aprovacao",
        numero_coleta: generateNumeroColeta(),
        fornecedor_id: user.id,
        empresa_id: operadorLogistico?.id || null,
        
        // Remetente = Fornecedor
        cliente: user.full_name,
        cliente_cnpj: user.cnpj_associado,
        origem: user.cidade || "A definir",
        origem_cidade: user.cidade,
        origem_uf: user.uf,
        
        // Destinatário informado pelo fornecedor
        destinatario: formData.destinatario,
        destinatario_cnpj: formData.destinatario_cnpj,
        destino: formData.destino_cidade || formData.destinatario,
        destino_cidade: formData.destino_cidade,
        destino_uf: formData.destino_uf,
        destino_endereco: formData.destino_endereco,
        destino_cep: formData.destino_cep,
        
        // Dados consolidados da carga
        produto: produtos,
        peso: pesoTotal,
        peso_nf: pesoTotal,
        valor_nf: valorTotal,
        volumes_nf: volumesTotal,
        volumes: volumesTotal,
        tipo_embalagem: formData.tipo_embalagem,
        notas_fiscais: numerosNotas,
        data_carregamento: formData.data_carregamento,
        observacao_carga: formData.observacao_carga,
        danfe_nfe_url: xmlUrls.join(","),
        
        data_solicitacao: new Date().toISOString(),
        meio_solicitacao: "sistema"
      };

      await base44.entities.OrdemDeCarregamento.create(coletaData);
      
      toast.success("Solicitação de coleta enviada com sucesso!");
      setShowForm(false);
      setNotasFiscais([]);
      setMetodoEntradaSelecionado(false);
      setFormData({
        remetente_razao_social: "", remetente_cnpj: "", remetente_telefone: "",
        remetente_uf: "", remetente_cidade: "", remetente_bairro: "",
        remetente_endereco: "", remetente_numero: "", remetente_cep: "",
        destinatario: "", destinatario_cnpj: "", destinatario_telefone: "",
        destino_cidade: "", destino_uf: "", destino_bairro: "", destino_numero: "",
        destino_endereco: "", destino_cep: "", produto: "", data_carregamento: "",
        observacao_carga: "", tipo_embalagem: ""
      });
      loadUserAndColetas();
    } catch (error) {
      console.error("Erro ao criar solicitação:", error);
      toast.error("Erro ao criar solicitação de coleta");
    } finally {
      setSaving(false);
    }
  };

  const theme = {
    bg: isDark ? '#0f172a' : '#f9fafb',
    cardBg: isDark ? '#1e293b' : '#ffffff',
    cardBorder: isDark ? '#334155' : '#e5e7eb',
    text: isDark ? '#f1f5f9' : '#111827',
    textMuted: isDark ? '#94a3b8' : '#6b7280',
  };

  const statusConfig = {
    pendente_aprovacao: { label: "Pendente", color: "bg-yellow-500" },
    aprovada_coleta: { label: "Aprovada", color: "bg-green-500" },
    reprovada_coleta: { label: "Reprovada", color: "bg-red-500" }
  };

  const statusTrackingConfig = {
    aguardando_agendamento: { label: "Aguardando", color: "bg-gray-500" },
    carregamento_agendado: { label: "Agendado", color: "bg-blue-500" },
    em_carregamento: { label: "Carregando", color: "bg-indigo-500" },
    carregado: { label: "Carregado", color: "bg-purple-500" },
    em_viagem: { label: "Em Viagem", color: "bg-cyan-500" },
    chegada_destino: { label: "No Armazém", color: "bg-green-600" },
    finalizado: { label: "Finalizado", color: "bg-emerald-600" }
  };

  const getMotorista = (motoristaId) => {
    if (!motoristaId) return null;
    return motoristas.find(m => m.id === motoristaId);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: theme.bg }}>
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 border-4 border-orange-600 border-t-transparent rounded-full animate-spin" />
          <p style={{ color: theme.textMuted }}>Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user || (user.tipo_perfil !== "fornecedor" && user.role !== "admin")) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: theme.bg }}>
        <Card style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}>
          <CardContent className="p-8 text-center">
            <p style={{ color: theme.text }}>Acesso negado. Esta página é apenas para fornecedores.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-6 min-h-screen" style={{ backgroundColor: theme.bg }}>
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold mb-1" style={{ color: theme.text }}>Solicitação de Coleta</h1>
            <p className="text-xs sm:text-sm" style={{ color: theme.textMuted }}>Solicite coletas para o operador logístico</p>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={loadUserAndColetas}
              style={{ borderColor: theme.cardBorder, color: theme.text }}
              className="flex-shrink-0"
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowOnboarding(true)}
              style={{ borderColor: theme.cardBorder, color: theme.text }}
              className="flex-shrink-0"
              title="Ver tutorial"
            >
              ❓
            </Button>
            <Button
              onClick={() => setShowForm(true)}
              className="bg-orange-600 hover:bg-orange-700 flex-1 sm:flex-none"
            >
              <Plus className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Nova Solicitação</span>
              <span className="sm:hidden">Nova</span>
            </Button>
          </div>
        </div>

        {showForm && (
          <Card className="mb-4 sm:mb-6" style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}>
            <CardHeader className="px-3 sm:px-6 pt-3 sm:pt-6 pb-3 sm:pb-4">
              <CardTitle className="text-base sm:text-lg" style={{ color: theme.text }}>Nova Solicitação de Coleta</CardTitle>
            </CardHeader>
            <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
              <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">

                {/* Métodos de Entrada de Notas Fiscais */}
                <div className="border rounded-lg p-4 space-y-4" style={{ borderColor: theme.cardBorder }}>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-blue-600 rounded" />
                    <Label className="text-base font-semibold" style={{ color: theme.text }}>Métodos de Entrada</Label>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {/* Manual */}
                    <button
                      type="button"
                      onClick={handleNovaNotaManual}
                      className="border rounded-lg p-3 hover:shadow-md transition-all flex items-center gap-3"
                      style={{ 
                        borderColor: theme.cardBorder,
                        backgroundColor: isDark ? '#0f172a' : '#f8fafc'
                      }}
                    >
                      <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#3b82f6' }}>
                        <Edit className="w-4 h-4 text-white" />
                      </div>
                      <div className="text-left">
                        <h3 className="font-semibold text-sm" style={{ color: theme.text }}>Manual</h3>
                        <p className="text-xs" style={{ color: theme.textMuted }}>Criar ordem manualmente</p>
                      </div>
                    </button>

                    {/* Upload XML */}
                    <label
                      className="border rounded-lg p-3 hover:shadow-md transition-all cursor-pointer flex items-center gap-3"
                      style={{ 
                        borderColor: theme.cardBorder,
                        backgroundColor: isDark ? '#0f172a' : '#f8fafc'
                      }}
                      onClick={() => setMetodoEntradaSelecionado(true)}
                    >
                      <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#10b981' }}>
                        <Upload className="w-4 h-4 text-white" />
                      </div>
                      <div className="text-left">
                        <h3 className="font-semibold text-sm" style={{ color: theme.text }}>Upload XML</h3>
                        <p className="text-xs" style={{ color: theme.textMuted }}>Arrastar arquivos XML</p>
                      </div>
                      <Input
                        type="file"
                        accept=".xml"
                        multiple
                        onChange={(e) => {
                          handleFileUpload(e);
                          setMetodoEntradaSelecionado(true);
                        }}
                        disabled={saving}
                        className="hidden"
                      />
                    </label>

                    {/* Importação por Chave */}
                    <div
                      className="border rounded-lg p-3"
                      style={{ 
                        borderColor: theme.cardBorder,
                        backgroundColor: isDark ? '#0f172a' : '#f8fafc'
                      }}
                      onClick={() => !buscandoNF && setMetodoEntradaSelecionado(true)}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#8b5cf6' }}>
                          <Search className="w-4 h-4 text-white" />
                        </div>
                        <div className="text-left flex-1">
                          <h3 className="font-semibold text-sm" style={{ color: theme.text }}>Importação Avançada</h3>
                          <p className="text-xs" style={{ color: theme.textMuted }}>XML via chave</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Input
                          placeholder="Cole ou escaneie"
                          value={chaveAcesso}
                          onChange={(e) => {
                            const cleaned = e.target.value.replace(/\D/g, '').slice(0, 44);
                            setChaveAcesso(cleaned);

                            // Buscar automaticamente quando atingir 44 caracteres
                            if (cleaned.length === 44 && !buscandoNF) {
                              handleBuscarPorChave(cleaned);
                            }
                          }}
                          maxLength={44}
                          className="text-xs font-mono flex-1 h-9"
                          style={{
                            backgroundColor: theme.cardBg,
                            borderColor: buscandoNF ? '#8b5cf6' : theme.cardBorder,
                            color: theme.text
                          }}
                          disabled={buscandoNF}
                          autoComplete="off"
                        />
                        <Button
                          type="button"
                          onClick={() => setShowScanner(true)}
                          disabled={buscandoNF}
                          variant="outline"
                          className="h-9 w-9 p-0 flex-shrink-0"
                          style={{ borderColor: theme.cardBorder, color: theme.text }}
                          title="Escanear código de barras"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        </Button>
                      </div>
                      {buscandoNF && (
                        <div className="flex items-center gap-2 mt-2 text-xs" style={{ color: theme.textMuted }}>
                          <div className="w-3 h-3 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
                          Importando NF...
                        </div>
                      )}
                      <p className="text-xs mt-1" style={{ color: theme.textMuted }}>
                        💡 Busca automática ao colar 44 dígitos
                      </p>
                    </div>
                  </div>
                </div>

                    {/* Extrato de Volumes */}
                    {metodoEntradaSelecionado && notasFiscais.length > 0 && (
                      <div className="border rounded-lg p-4 space-y-3" style={{ borderColor: theme.cardBorder }}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Package className="w-5 h-5 text-blue-600" />
                            <Label className="text-base font-semibold" style={{ color: theme.text }}>
                              4. Extrato de Volumes ({notasFiscais.length} notas)
                            </Label>
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setNotasFiscais([])}
                            style={{ borderColor: theme.cardBorder, color: 'rgb(239, 68, 68)' }}
                          >
                            <X className="w-3 h-3 mr-1" />
                            Limpar Todos
                          </Button>
                        </div>

                        <div className="overflow-x-auto">
                          <table className="w-full text-xs">
                            <thead>
                              <tr className="border-b" style={{ borderColor: theme.cardBorder, backgroundColor: isDark ? '#1e293b' : '#f8fafc' }}>
                                <th className="text-left p-2 font-semibold" style={{ color: theme.textMuted }}>Nota</th>
                                <th className="text-left p-2 font-semibold" style={{ color: theme.textMuted }}>Remetente</th>
                                <th className="text-left p-2 font-semibold" style={{ color: theme.textMuted }}>Destinatário</th>
                                <th className="text-left p-2 font-semibold" style={{ color: theme.textMuted }}>Vols</th>
                                <th className="text-left p-2 font-semibold" style={{ color: theme.textMuted }}>Peso (kg)</th>
                                <th className="text-left p-2 font-semibold" style={{ color: theme.textMuted }}>Valor (R$)</th>
                                <th className="text-left p-2 font-semibold" style={{ color: theme.textMuted }}>Dimensões</th>
                                <th className="text-left p-2 font-semibold" style={{ color: theme.textMuted }}>Ações</th>
                              </tr>
                            </thead>
                            <tbody>
                              {notasFiscais.map((nf, index) => {
                                const volumes = nf.volumes || [];
                                const temDimensoes = volumes.length > 0 && volumes.every(v => 
                                  v.altura && v.largura && v.comprimento && 
                                  v.altura > 0 && v.largura > 0 && v.comprimento > 0
                                );
                                const dimensoesPendentes = !temDimensoes;
                                const borderColor = dimensoesPendentes ? '#f97316' : theme.cardBorder;
                                const bgColor = dimensoesPendentes ? (isDark ? '#431407' : '#fff7ed') : 'transparent';

                                return (
                                  <tr key={index} className="border-b hover:bg-opacity-50" style={{ borderColor: borderColor, backgroundColor: bgColor }}>
                                    <td className="p-2">
                                      <div>
                                        <p className="font-semibold" style={{ color: theme.text }}>{nf.numero_nota}</p>
                                        {nf.serie_nota && (
                                          <p className="text-xs" style={{ color: theme.textMuted }}>Série {nf.serie_nota}</p>
                                        )}
                                      </div>
                                    </td>
                                    <td className="p-2">
                                      <p className="truncate max-w-[150px]" style={{ color: theme.text }} title={nf.emitente_razao_social || user?.full_name}>
                                        {nf.emitente_razao_social || user?.full_name}
                                      </p>
                                    </td>
                                    <td className="p-2">
                                      <p className="truncate max-w-[150px]" style={{ color: theme.text }} title={nf.destinatario_razao_social || formData.destinatario}>
                                        {nf.destinatario_razao_social || formData.destinatario}
                                      </p>
                                    </td>
                                    <td className="p-2 text-center" style={{ color: theme.text }}>
                                      {nf.volumes_nf || 0}
                                    </td>
                                    <td className="p-2" style={{ color: theme.text }}>
                                      {nf.peso_nf?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                    </td>
                                    <td className="p-2" style={{ color: theme.text }}>
                                      {nf.valor_nf?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                    </td>
                                    <td className="p-2">
                                      <Button
                                        type="button"
                                        size="sm"
                                        variant="outline"
                                        onClick={() => handleInformarVolumes(index)}
                                        className="text-xs"
                                        style={{ 
                                          borderColor: temDimensoes ? '#16a34a' : '#f97316',
                                          color: temDimensoes ? '#16a34a' : '#f97316'
                                        }}
                                      >
                                        {temDimensoes ? '✓ Dimensões OK' : '⚠ Informar Dimensões'}
                                      </Button>
                                      {temDimensoes && (
                                        <p className="text-xs mt-1" style={{ color: '#16a34a' }}>
                                          Máx: {(() => {
                                            const volumes = nf.volumes || [];
                                            if (volumes.length === 0) return "N/A";
                                            const maxA = Math.max(...volumes.map(v => v.altura || 0));
                                            const maxL = Math.max(...volumes.map(v => v.largura || 0));
                                            const maxC = Math.max(...volumes.map(v => v.comprimento || 0));
                                            return `${maxA}x${maxL}x${maxC}m`;
                                          })()}
                                        </p>
                                      )}
                                    </td>
                                    <td className="p-2">
                                      <div className="flex gap-1">
                                        <Button
                                          type="button"
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => handleEditarNota(index)}
                                          className="h-6 w-6 p-0"
                                          title="Editar"
                                        >
                                          <Edit className="w-3 h-3" />
                                        </Button>
                                        <Button
                                          type="button"
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => handleRemoverNota(index)}
                                          className="h-6 w-6 p-0"
                                          style={{ color: 'rgb(239, 68, 68)' }}
                                          title="Remover"
                                        >
                                          <X className="w-3 h-3" />
                                        </Button>
                                      </div>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                            <tfoot>
                              <tr style={{ backgroundColor: isDark ? '#1e293b' : '#f0fdf4', borderTop: '2px solid', borderColor: theme.cardBorder }}>
                                <td colSpan="3" className="p-3 font-semibold" style={{ color: theme.text }}>
                                  <div className="text-sm">Total de Volumes</div>
                                  <div className="text-lg text-blue-600 dark:text-blue-400">{notasFiscais.reduce((sum, nf) => sum + (nf.volumes_nf || 0), 0)}</div>
                                </td>
                                <td className="p-3">
                                  <div className="text-xs" style={{ color: theme.textMuted }}>Peso Total (kg)</div>
                                  <div className="text-sm font-bold" style={{ color: theme.text }}>
                                    {notasFiscais.reduce((sum, nf) => sum + (nf.peso_nf || 0), 0).toLocaleString('pt-BR', { minimumFractionDigits: 3 })}
                                  </div>
                                </td>
                                <td colSpan="2" className="p-3">
                                  <div className="text-xs" style={{ color: theme.textMuted }}>Valor Total (R$)</div>
                                  <div className="text-sm font-bold text-green-600 dark:text-green-400">
                                    R$ {notasFiscais.reduce((sum, nf) => sum + (nf.valor_nf || 0), 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                  </div>
                                </td>
                                <td colSpan="2" className="p-3">
                                  {(() => {
                                    const todosVolumes = notasFiscais.flatMap(nf => nf.volumes || []);
                                    const totalM3 = todosVolumes.reduce((sum, v) => sum + (v.m3 || 0), 0);
                                    const temDimensoes = todosVolumes.length > 0;

                                    if (!temDimensoes) {
                                      return (
                                        <div className="text-xs text-orange-600 dark:text-orange-400">
                                          ⚠ Dimensões não informadas
                                        </div>
                                      );
                                    }

                                    const maxAltura = Math.max(...todosVolumes.map(v => v.altura || 0));
                                    const maxLargura = Math.max(...todosVolumes.map(v => v.largura || 0));
                                    const maxComprimento = Math.max(...todosVolumes.map(v => v.comprimento || 0));

                                    return (
                                      <div>
                                        <div className="text-xs" style={{ color: theme.textMuted }}>M³ Total</div>
                                        <div className="text-sm font-bold text-blue-600 dark:text-blue-400">
                                          {totalM3.toFixed(2)} m³
                                        </div>
                                        <div className="text-xs mt-1 text-green-600 dark:text-green-400">
                                          Maiores Dimensões: {maxAltura}x{maxLargura}x{maxComprimento}m
                                        </div>
                                      </div>
                                    );
                                    })()}
                                    </td>
                              </tr>
                            </tfoot>
                          </table>
                        </div>
                      </div>
                    )}

                {metodoEntradaSelecionado && (
                  <>
                {/* Dados do Remetente e Destinatário - Lado a Lado */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Dados do Remetente */}
                  <div className="border rounded-lg p-3 space-y-2" style={{ borderColor: theme.cardBorder }}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-blue-600 rounded" />
                        <Label className="text-sm font-semibold" style={{ color: theme.text }}>Dados do Emitente</Label>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          type="button"
                          size="sm"
                          onClick={handleUsarEmpresaAtual}
                          variant="outline"
                          className="text-xs h-6 px-2"
                          style={{ borderColor: theme.cardBorder, color: theme.text }}
                        >
                          📍 Empresa
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          onClick={() => setFormData(prev => ({
                            ...prev,
                            remetente_razao_social: "",
                            remetente_cnpj: "",
                            remetente_telefone: "",
                            remetente_uf: "",
                            remetente_cidade: "",
                            remetente_bairro: "",
                            remetente_endereco: "",
                            remetente_numero: "",
                            remetente_cep: ""
                          }))}
                          variant="outline"
                          className="text-xs h-6 px-2"
                          style={{ borderColor: theme.cardBorder, color: '#ef4444' }}
                        >
                          Limpar
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label className="text-xs mb-0.5 font-semibold flex items-center gap-1" style={{ color: formData.remetente_cnpj ? theme.textMuted : '#dc2626' }}>
                          CNPJ {!formData.remetente_cnpj && '💡'}
                        </Label>
                        <Input
                          value={formData.remetente_cnpj}
                          onChange={(e) => handleChange("remetente_cnpj", e.target.value)}
                          onBlur={(e) => buscarDadosCNPJ(e.target.value, "remetente")}
                          placeholder="00.000.000/0000-00"
                          className="text-sm h-8 border-2 font-semibold"
                          style={{ 
                            backgroundColor: formData.remetente_cnpj ? theme.cardBg : (isDark ? '#7f1d1d15' : '#fee2e2'), 
                            borderColor: formData.remetente_cnpj ? theme.cardBorder : '#dc2626', 
                            color: theme.text 
                          }}
                        />
                      </div>
                      <div>
                        <Label className="text-xs mb-0.5" style={{ color: theme.textMuted }}>Razão Social</Label>
                        <Input
                          value={formData.remetente_razao_social}
                          onChange={(e) => handleChange("remetente_razao_social", e.target.value)}
                          placeholder="Nome da empresa"
                          className="text-sm h-8"
                          style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder, color: theme.text }}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label className="text-xs mb-0.5" style={{ color: theme.textMuted }}>Telefone</Label>
                        <Input
                          value={formData.remetente_telefone}
                          onChange={(e) => handleChange("remetente_telefone", e.target.value)}
                          placeholder="(00) 00000-0000"
                          className="text-sm h-8"
                          style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder, color: theme.text }}
                        />
                      </div>
                      <div>
                        <Label className="text-xs mb-0.5" style={{ color: theme.textMuted }}>UF</Label>
                        <Input
                          value={formData.remetente_uf}
                          onChange={(e) => handleChange("remetente_uf", e.target.value.toUpperCase())}
                          maxLength={2}
                          placeholder="SP"
                          className="text-sm h-8"
                          style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder, color: theme.text }}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label className="text-xs mb-0.5" style={{ color: theme.textMuted }}>Cidade</Label>
                        <Input
                          value={formData.remetente_cidade}
                          onChange={(e) => handleChange("remetente_cidade", e.target.value)}
                          placeholder="Cidade"
                          className="text-sm h-8"
                          style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder, color: theme.text }}
                        />
                      </div>
                      <div>
                        <Label className="text-xs mb-0.5" style={{ color: theme.textMuted }}>Bairro</Label>
                        <Input
                          value={formData.remetente_bairro}
                          onChange={(e) => handleChange("remetente_bairro", e.target.value)}
                          placeholder="Bairro"
                          className="text-sm h-8"
                          style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder, color: theme.text }}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <div className="col-span-2">
                        <Label className="text-xs mb-0.5" style={{ color: theme.textMuted }}>Endereço</Label>
                        <Input
                          value={formData.remetente_endereco}
                          onChange={(e) => handleChange("remetente_endereco", e.target.value)}
                          placeholder="Rua/Avenida"
                          className="text-sm h-8"
                          style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder, color: theme.text }}
                        />
                      </div>
                      <div>
                        <Label className="text-xs mb-0.5" style={{ color: theme.textMuted }}>Número</Label>
                        <Input
                          value={formData.remetente_numero}
                          onChange={(e) => handleChange("remetente_numero", e.target.value)}
                          placeholder="SN"
                          className="text-sm h-8"
                          style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder, color: theme.text }}
                        />
                      </div>
                    </div>

                    <div>
                      <Label className="text-xs mb-0.5" style={{ color: theme.textMuted }}>CEP</Label>
                      <Input
                        value={formData.remetente_cep}
                        onChange={(e) => handleChange("remetente_cep", e.target.value)}
                        placeholder="00000-000"
                        className="text-sm h-8"
                        style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder, color: theme.text }}
                      />
                    </div>
                  </div>

                  {/* Dados do Destinatário */}
                  <div className="border rounded-lg p-3 space-y-2" style={{ borderColor: theme.cardBorder }}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-green-600 rounded" />
                        <Label className="text-sm font-semibold" style={{ color: theme.text }}>Dados do Destinatário</Label>
                      </div>
                      <div className="flex gap-1">
                        {operadorLogistico && (
                          <Button
                            type="button"
                            size="sm"
                            onClick={handleUsarOperadorLogistico}
                            className="bg-blue-600 hover:bg-blue-700 text-white text-xs h-6 px-2"
                          >
                            📍 Operador
                          </Button>
                        )}
                        <Button
                          type="button"
                          size="sm"
                          onClick={() => setFormData(prev => ({
                            ...prev,
                            destinatario: "",
                            destinatario_cnpj: "",
                            destinatario_telefone: "",
                            destino_cidade: "",
                            destino_uf: "",
                            destino_bairro: "",
                            destino_numero: "",
                            destino_endereco: "",
                            destino_cep: ""
                          }))}
                          variant="outline"
                          className="text-xs h-6 px-2"
                          style={{ borderColor: theme.cardBorder, color: '#ef4444' }}
                        >
                          Limpar
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label className="text-xs flex items-center gap-1 mb-0.5 font-semibold" style={{ color: formData.destinatario_cnpj ? theme.textMuted : '#dc2626' }}>
                          CNPJ {!formData.destinatario_cnpj && '💡'} <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          placeholder="00.000.000/0000-00"
                          value={formData.destinatario_cnpj}
                          onChange={(e) => handleChange("destinatario_cnpj", e.target.value)}
                          onBlur={(e) => buscarDadosCNPJ(e.target.value, "destinatario")}
                          required
                          className="text-sm h-8 border-2 font-semibold"
                          style={{ 
                            backgroundColor: formData.destinatario_cnpj ? theme.cardBg : (isDark ? '#7f1d1d15' : '#fee2e2'), 
                            borderColor: formData.destinatario_cnpj ? theme.cardBorder : '#dc2626', 
                            color: theme.text 
                          }}
                        />
                      </div>
                      <div>
                        <Label className="text-xs flex items-center gap-1 mb-0.5" style={{ color: theme.textMuted }}>
                          Razão Social <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          placeholder="Nome do destinatário"
                          value={formData.destinatario}
                          onChange={(e) => handleChange("destinatario", e.target.value)}
                          required
                          className="text-sm h-8"
                          style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder, color: theme.text }}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label className="text-xs mb-0.5" style={{ color: theme.textMuted }}>Telefone</Label>
                        <Input
                          placeholder="(00) 00000-0000"
                          value={formData.destinatario_telefone || ""}
                          onChange={(e) => handleChange("destinatario_telefone", e.target.value)}
                          className="text-sm h-8"
                          style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder, color: theme.text }}
                        />
                      </div>
                      <div>
                        <Label className="text-xs mb-0.5" style={{ color: theme.textMuted }}>UF</Label>
                        <Input
                          placeholder="SP"
                          maxLength={2}
                          value={formData.destino_uf}
                          onChange={(e) => handleChange("destino_uf", e.target.value.toUpperCase())}
                          className="text-sm h-8"
                          style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder, color: theme.text }}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label className="text-xs mb-0.5" style={{ color: theme.textMuted }}>Cidade</Label>
                        <Input
                          placeholder="Cidade"
                          value={formData.destino_cidade}
                          onChange={(e) => handleChange("destino_cidade", e.target.value)}
                          className="text-sm h-8"
                          style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder, color: theme.text }}
                        />
                      </div>
                      <div>
                        <Label className="text-xs mb-0.5" style={{ color: theme.textMuted }}>Bairro</Label>
                        <Input
                          placeholder="Bairro"
                          value={formData.destino_bairro || ""}
                          onChange={(e) => handleChange("destino_bairro", e.target.value)}
                          className="text-sm h-8"
                          style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder, color: theme.text }}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <div className="col-span-2">
                        <Label className="text-xs mb-0.5" style={{ color: theme.textMuted }}>Endereço</Label>
                        <Input
                          placeholder="Rua/Avenida"
                          value={formData.destino_endereco}
                          onChange={(e) => handleChange("destino_endereco", e.target.value)}
                          className="text-sm h-8"
                          style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder, color: theme.text }}
                        />
                      </div>
                      <div>
                        <Label className="text-xs mb-0.5" style={{ color: theme.textMuted }}>Número</Label>
                        <Input
                          placeholder="SN"
                          value={formData.destino_numero || ""}
                          onChange={(e) => handleChange("destino_numero", e.target.value)}
                          className="text-sm h-8"
                          style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder, color: theme.text }}
                        />
                      </div>
                    </div>

                    <div>
                      <Label className="text-xs mb-0.5" style={{ color: theme.textMuted }}>CEP</Label>
                      <Input
                        placeholder="00000-000"
                        value={formData.destino_cep}
                        onChange={(e) => handleChange("destino_cep", e.target.value)}
                        className="text-sm h-8"
                        style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder, color: theme.text }}
                      />
                    </div>
                  </div>
                </div>

                {/* Precificação */}
                {notasFiscais.length > 0 && (
                  <div className="border rounded-lg p-4 space-y-3" style={{ borderColor: theme.cardBorder }}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-green-600 rounded" />
                        <Label className="text-base font-semibold" style={{ color: theme.text }}>Precificação</Label>
                      </div>
                      {tabelaSelecionada && (
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setTabelaSelecionada(null);
                            setShowTabelaManual(true);
                            setTipoFrete(null);
                          }}
                          className="text-xs"
                        >
                          Trocar Tabela
                        </Button>
                      )}
                    </div>

                    {tabelaSelecionada ? (
                      <div className="space-y-3">
                        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                          <p className="text-sm font-semibold text-blue-900 dark:text-blue-200">
                            📋 Tabela Aplicada: {tabelaSelecionada.nome}
                          </p>
                          {tabelaSelecionada.codigo && (
                            <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                              Código: {tabelaSelecionada.codigo}
                            </p>
                          )}
                        </div>

                        {precificacaoCalculada && (
                          <div className="grid grid-cols-2 gap-3">
                            <div className="border rounded-lg p-3" style={{ borderColor: theme.cardBorder }}>
                              <p className="text-xs mb-1" style={{ color: theme.textMuted }}>Faixa de Peso</p>
                              <p className="text-sm font-bold" style={{ color: theme.text }}>
                                {precificacaoCalculada.faixaPeso}
                              </p>
                            </div>
                            <div className="border rounded-lg p-3" style={{ borderColor: theme.cardBorder }}>
                              <p className="text-xs mb-1" style={{ color: theme.textMuted }}>Faixa KM</p>
                              <p className="text-sm font-bold" style={{ color: theme.text }}>
                                Faixa {precificacaoCalculada.faixaKm}
                              </p>
                            </div>
                            <div className="border rounded-lg p-3" style={{ borderColor: theme.cardBorder }}>
                              <p className="text-xs mb-1" style={{ color: theme.textMuted }}>Valor Base</p>
                              <p className="text-sm font-bold text-blue-600">
                                R$ {precificacaoCalculada.valorBase.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                              </p>
                              <p className="text-xs" style={{ color: theme.textMuted }}>
                                ({precificacaoCalculada.unidade})
                              </p>
                            </div>
                            <div className="border rounded-lg p-3 bg-green-50 dark:bg-green-900/20" style={{ borderColor: '#16a34a' }}>
                              <p className="text-xs mb-1 text-green-700 dark:text-green-300">Valor Total Estimado</p>
                              <p className="text-lg font-bold text-green-700 dark:text-green-300">
                                R$ {precificacaoCalculada.valorFinal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : showTabelaManual ? (
                      <div className="space-y-3">
                        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
                          <p className="text-sm text-yellow-800 dark:text-yellow-200">
                            ⚠ Nenhuma tabela encontrada automaticamente. Pesquise e selecione uma tabela manualmente.
                          </p>
                        </div>

                        <div className="flex gap-2">
                          <Input
                            value={searchTabela}
                            onChange={(e) => setSearchTabela(e.target.value)}
                            placeholder="Pesquisar tabela por nome ou código..."
                            className="flex-1"
                            style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder, color: theme.text }}
                          />
                          <Button
                            type="button"
                            onClick={() => {}}
                            variant="outline"
                            size="sm"
                          >
                            <Search className="w-4 h-4" />
                          </Button>
                        </div>

                        <div className="max-h-48 overflow-y-auto border rounded-lg" style={{ borderColor: theme.cardBorder }}>
                          {tabelas
                            .filter(t => 
                              t.nome?.toLowerCase().includes(searchTabela.toLowerCase()) ||
                              t.codigo?.toLowerCase().includes(searchTabela.toLowerCase())
                            )
                            .map(t => (
                              <button
                                key={t.id}
                                type="button"
                                onClick={() => handleSelecionarTabelaManual(t.id)}
                                className="w-full text-left p-3 hover:bg-gray-100 dark:hover:bg-gray-800 border-b"
                                style={{ borderColor: theme.cardBorder }}
                              >
                                <p className="text-sm font-semibold" style={{ color: theme.text }}>
                                  {t.nome}
                                </p>
                                {t.codigo && (
                                  <p className="text-xs" style={{ color: theme.textMuted }}>
                                    Código: {t.codigo}
                                  </p>
                                )}
                              </button>
                            ))}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-4" style={{ color: theme.textMuted }}>
                        <p className="text-sm">Carregando tabela de preços...</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Observações */}
                <div className="border rounded-lg p-4 space-y-3" style={{ borderColor: theme.cardBorder }}>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-blue-600 rounded" />
                    <Label className="text-base font-semibold" style={{ color: theme.text }}>5. Observações</Label>
                  </div>
                  <Textarea
                    placeholder="Informações adicionais sobre a coleta"
                    value={formData.observacao_carga}
                    onChange={(e) => handleChange("observacao_carga", e.target.value)}
                    rows={3}
                    style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder, color: theme.text }}
                  />
                </div>
                  </>
                )}





                {metodoEntradaSelecionado && (
                  <div className="flex gap-3 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setShowForm(false);
                        setMetodoEntradaSelecionado(false);
                      }}
                      style={{ borderColor: theme.cardBorder, color: theme.text }}
                    >
                      Cancelar
                    </Button>
                    <Button
                      type="submit"
                      disabled={saving}
                      className="bg-orange-600 hover:bg-orange-700"
                    >
                      {saving ? "Enviando..." : "Enviar Solicitação"}
                    </Button>
                  </div>
                )}
              </form>
            </CardContent>
          </Card>
        )}

        <Card style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}>
          <CardHeader>
            <CardTitle style={{ color: theme.text }}>Minhas Solicitações</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto w-full">
              <table className="w-full">
                <thead>
                  <tr className="border-b" style={{ borderColor: theme.cardBorder }}>
                    <th className="text-left px-2 py-1.5 text-xs font-semibold whitespace-nowrap" style={{ color: theme.textMuted }}>Nº Coleta</th>
                    <th className="text-left px-2 py-1.5 text-xs font-semibold whitespace-nowrap" style={{ color: theme.textMuted }}>Status</th>
                    <th className="text-left px-2 py-1.5 text-xs font-semibold whitespace-nowrap" style={{ color: theme.textMuted }}>Status Logístico</th>
                    <th className="text-left px-2 py-1.5 text-xs font-semibold whitespace-nowrap" style={{ color: theme.textMuted }}>Destinatário</th>
                    <th className="text-left px-2 py-1.5 text-xs font-semibold whitespace-nowrap" style={{ color: theme.textMuted }}>Motorista</th>
                    <th className="text-left px-2 py-1.5 text-xs font-semibold whitespace-nowrap" style={{ color: theme.textMuted }}>Placa</th>
                    <th className="text-left px-2 py-1.5 text-xs font-semibold whitespace-nowrap" style={{ color: theme.textMuted }}>Peso (kg)</th>
                    <th className="text-left px-2 py-1.5 text-xs font-semibold whitespace-nowrap" style={{ color: theme.textMuted }}>Valor NF</th>
                    <th className="text-left px-2 py-1.5 text-xs font-semibold whitespace-nowrap" style={{ color: theme.textMuted }}>Solicitação</th>
                    <th className="text-left px-2 py-1.5 text-xs font-semibold whitespace-nowrap" style={{ color: theme.textMuted }}>Aprovação</th>
                    <th className="text-left px-2 py-1.5 text-xs font-semibold whitespace-nowrap" style={{ color: theme.textMuted }}>Agend. Coleta</th>
                    <th className="text-left px-2 py-1.5 text-xs font-semibold whitespace-nowrap" style={{ color: theme.textMuted }}>Data Coleta</th>
                  </tr>
                </thead>
                <tbody>
                  {coletas.map((coleta) => {
                    const statusInfo = statusConfig[coleta.status] || statusConfig.pendente_aprovacao;
                    const statusTrackingInfo = statusTrackingConfig[coleta.status_tracking] || { label: "-", color: "bg-gray-400" };
                    const motorista = getMotorista(coleta.motorista_id);
                    
                    return (
                      <tr key={coleta.id} className="border-b" style={{ borderColor: theme.cardBorder }}>
                        <td className="px-2 py-1.5 whitespace-nowrap">
                          <span className="text-xs font-mono font-semibold text-orange-600">
                            {coleta.numero_coleta}
                          </span>
                        </td>
                        <td className="px-2 py-1.5 whitespace-nowrap">
                          <span className={`text-[10px] px-1.5 py-0.5 rounded text-white ${statusInfo.color}`}>
                            {statusInfo.label}
                          </span>
                        </td>
                        <td className="px-2 py-1.5 whitespace-nowrap">
                          <span className={`text-[10px] px-1.5 py-0.5 rounded text-white ${statusTrackingInfo.color}`}>
                            {statusTrackingInfo.label}
                          </span>
                        </td>
                        <td className="px-2 py-1.5">
                          <span className="text-xs truncate block max-w-[120px]" style={{ color: theme.text }} title={coleta.destinatario}>
                            {coleta.destinatario}
                          </span>
                        </td>
                        <td className="px-2 py-1.5">
                          <span className="text-xs truncate block max-w-[100px]" style={{ color: theme.text }} title={motorista?.nome || coleta.motorista_nome_temp}>
                            {motorista?.nome || coleta.motorista_nome_temp || "-"}
                          </span>
                        </td>
                        <td className="px-2 py-1.5 whitespace-nowrap">
                          <span className="text-xs font-mono" style={{ color: theme.text }}>
                            {coleta.cavalo_placa_temp || "-"}
                          </span>
                        </td>
                        <td className="px-2 py-1.5 whitespace-nowrap">
                          <span className="text-xs" style={{ color: theme.text }}>{coleta.peso_nf?.toLocaleString()}</span>
                        </td>
                        <td className="px-2 py-1.5 whitespace-nowrap">
                          <span className="text-xs" style={{ color: theme.text }}>
                            {coleta.valor_nf ? `R$ ${coleta.valor_nf.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : "-"}
                          </span>
                        </td>
                        <td className="px-2 py-1.5 whitespace-nowrap">
                          <span className="text-xs" style={{ color: theme.textMuted }}>
                            {coleta.data_solicitacao ? new Date(coleta.data_solicitacao).toLocaleDateString('pt-BR') : "-"}
                          </span>
                        </td>
                        <td className="px-2 py-1.5 whitespace-nowrap">
                          <span className="text-xs" style={{ color: theme.textMuted }}>
                            {coleta.status === "aprovada_coleta" && coleta.updated_date ? new Date(coleta.updated_date).toLocaleDateString('pt-BR') : "-"}
                          </span>
                        </td>
                        <td className="px-2 py-1.5 whitespace-nowrap">
                          <span className="text-xs" style={{ color: theme.textMuted }}>
                            {coleta.carregamento_agendamento_data ? new Date(coleta.carregamento_agendamento_data).toLocaleDateString('pt-BR') : "-"}
                          </span>
                        </td>
                        <td className="px-2 py-1.5 whitespace-nowrap">
                          <span className="text-xs" style={{ color: theme.textMuted }}>
                            {coleta.inicio_carregamento ? new Date(coleta.inicio_carregamento).toLocaleDateString('pt-BR') : "-"}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {coletas.length === 0 && (
                <div className="text-center py-12" style={{ color: theme.textMuted }}>
                  <Package className="w-12 h-12 mx-auto mb-3 opacity-20" />
                  <p>Nenhuma solicitação de coleta ainda</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {showNotaForm && (
          <NotaFiscalForm
            open={showNotaForm}
            onClose={() => {
              setShowNotaForm(false);
              setNotaParaEditar(null);
            }}
            nota={notaParaEditar}
            onSave={handleSalvarNota}
            isDark={isDark}
            showCubagem={false}
          />
        )}

        {showVolumesModal && (
          <VolumesModal
            open={showVolumesModal}
            onClose={() => {
              setShowVolumesModal(false);
              setNotaParaVolumes(null);
            }}
            nota={notaParaVolumes}
            onSave={handleSalvarVolumes}
            isDark={isDark}
            modoManual={notaParaVolumes && !notaParaVolumes.index && notaParaVolumes.numero_nota === ""}
          />
        )}

        {/* Modal Tipo de Frete CIF/FOB */}
        {showTipoFreteModal && (
          <Dialog open={showTipoFreteModal} onOpenChange={setShowTipoFreteModal}>
            <DialogContent style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}>
              <DialogHeader>
                <DialogTitle style={{ color: theme.text }}>Tipo de Frete</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <p className="text-sm" style={{ color: theme.textMuted }}>
                  Tanto o remetente quanto o destinatário possuem tabelas de preço. Qual é o tipo de frete?
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setTipoFrete("CIF");
                      setShowTipoFreteModal(false);
                    }}
                    className="border-2 rounded-lg p-4 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                    style={{ borderColor: theme.cardBorder }}
                  >
                    <p className="font-bold text-lg mb-1" style={{ color: theme.text }}>CIF</p>
                    <p className="text-xs" style={{ color: theme.textMuted }}>
                      Frete pago pelo remetente
                    </p>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setTipoFrete("FOB");
                      setShowTipoFreteModal(false);
                    }}
                    className="border-2 rounded-lg p-4 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                    style={{ borderColor: theme.cardBorder }}
                  >
                    <p className="font-bold text-lg mb-1" style={{ color: theme.text }}>FOB</p>
                    <p className="text-xs" style={{ color: theme.textMuted }}>
                      Frete pago pelo destinatário
                    </p>
                  </button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}

        {/* Onboarding */}
        <OnboardingSolicitacaoColeta
          open={showOnboarding}
          onClose={() => setShowOnboarding(false)}
        />

        {/* Modal Scanner de Câmera */}
        {showScanner && (
          <Dialog open={showScanner} onOpenChange={(open) => {
            if (!open) {
              // Parar a câmera ao fechar
              if (videoRef.current && videoRef.current.srcObject) {
                videoRef.current.srcObject.getTracks().forEach(track => track.stop());
              }
              setCameraReady(false);
            }
            setShowScanner(open);
          }}>
            <DialogContent className="max-w-md" style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}>
              <DialogHeader>
                <DialogTitle style={{ color: theme.text }}>Scanner de Código de Barras</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="bg-gray-900 rounded-lg aspect-video flex items-center justify-center relative overflow-hidden">
                  {!cameraReady && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 z-10">
                      <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
                      <p className="text-white text-sm">Ativando câmera...</p>
                    </div>
                  )}
                  <video 
                    ref={videoRef}
                    autoPlay 
                    playsInline
                    className="w-full h-full object-cover"
                    onLoadedMetadata={() => {
                      setCameraReady(true);
                    }}
                    style={{ display: cameraReady ? 'block' : 'none' }}
                  />
                  {cameraReady && (
                    <div className="absolute inset-0 border-2 border-purple-500 m-8 rounded-lg pointer-events-none"></div>
                  )}
                </div>
                <div className="text-center">
                  <p className="text-sm mb-4" style={{ color: theme.textMuted }}>
                    Posicione o código de barras da NF-e dentro da área marcada
                  </p>
                  <Input
                    placeholder="Ou cole a chave aqui"
                    value={chaveAcesso}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '').slice(0, 44);
                      setChaveAcesso(value);
                      if (value.length === 44) {
                        handleBuscarPorChave(value);
                        if (videoRef.current && videoRef.current.srcObject) {
                          videoRef.current.srcObject.getTracks().forEach(track => track.stop());
                        }
                        setCameraReady(false);
                        setShowScanner(false);
                      }
                    }}
                    className="font-mono"
                    autoFocus
                    style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder, color: theme.text }}
                  />
                </div>
                <Button
                  onClick={() => {
                    if (videoRef.current && videoRef.current.srcObject) {
                      videoRef.current.srcObject.getTracks().forEach(track => track.stop());
                    }
                    setCameraReady(false);
                    setShowScanner(false);
                  }}
                  variant="outline"
                  className="w-full"
                  style={{ borderColor: theme.cardBorder, color: theme.text }}
                >
                  Cancelar
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
}