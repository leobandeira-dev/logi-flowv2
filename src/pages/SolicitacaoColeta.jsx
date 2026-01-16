import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Package, Upload, Plus, RefreshCw, X, Edit, Search, MapPin, Loader2, AlertTriangle, Download } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import NotaFiscalForm from "../components/notas-fiscais/NotaFiscalForm";
import VolumesModal from "../components/notas-fiscais/VolumesModal";
import OnboardingSolicitacaoColeta from "../components/onboarding/OnboardingSolicitacaoColeta";
import { calcularDistancia } from "@/functions/calcularDistancia";

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
  const [calculandoDistancia, setCalculandoDistancia] = useState(false);
  const [distanciaEmitenteDest, setDistanciaEmitenteDest] = useState(null);
  const [distanciaEmitenteOp, setDistanciaEmitenteOp] = useState(null);
  const [distanciaOpDest, setDistanciaOpDest] = useState(null);
  const [erroCalculoDistancia, setErroCalculoDistancia] = useState(false);
  const [kmManual, setKmManual] = useState(null);
  const [aliquotaIcmsManual, setAliquotaIcmsManual] = useState(null);
  
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

  const calcularDistancias = async () => {
    if (!formData.remetente_cidade || !formData.remetente_uf) {
      return;
    }

    setCalculandoDistancia(true);
    setErroCalculoDistancia(false);
    try {
      const origemEmitente = `${formData.remetente_cidade}, ${formData.remetente_uf}, Brasil`;
      
      const promises = [];

      // Calcular distância Emitente -> Destinatário
      if (formData.destino_cidade && formData.destino_uf) {
        const destinoFinal = `${formData.destino_cidade}, ${formData.destino_uf}, Brasil`;
        promises.push(
          calcularDistancia({ 
            origem: origemEmitente, 
            destino: destinoFinal,
            tabelaPrecoId: tabelaSelecionada?.id 
          })
            .then(res => ({ tipo: 'emitente_dest', data: res.data }))
            .catch(err => ({ tipo: 'emitente_dest', error: true, message: err.message }))
        );
      }

      // Calcular distância Emitente -> Operador Logístico
      if (operadorLogistico?.cidade && operadorLogistico?.estado) {
        const destinoOperador = `${operadorLogistico.cidade}, ${operadorLogistico.estado}, Brasil`;
        promises.push(
          calcularDistancia({ 
            origem: origemEmitente, 
            destino: destinoOperador,
            tabelaPrecoId: tabelaSelecionada?.id 
          })
            .then(res => ({ tipo: 'emitente_op', data: res.data }))
            .catch(err => ({ tipo: 'emitente_op', error: true, message: err.message }))
        );

        // Calcular distância Operador Logístico -> Destinatário
        if (formData.destino_cidade && formData.destino_uf) {
          const destinoFinal = `${formData.destino_cidade}, ${formData.destino_uf}, Brasil`;
          promises.push(
            calcularDistancia({ 
              origem: destinoOperador, 
              destino: destinoFinal,
              tabelaPrecoId: tabelaSelecionada?.id 
            })
              .then(res => ({ tipo: 'op_dest', data: res.data }))
              .catch(err => ({ tipo: 'op_dest', error: true, message: err.message }))
          );
        }
      }

      const resultados = await Promise.all(promises);
      let houveErro = false;

      resultados.forEach(resultado => {
        if (resultado.error || resultado.data?.error) {
          houveErro = true;
        } else {
          if (resultado.tipo === 'emitente_dest') {
            setDistanciaEmitenteDest({
              km: parseFloat(resultado.data.distancia_km),
              texto: resultado.data.distancia_texto,
              origem: resultado.data.origem_endereco,
              destino: resultado.data.destino_endereco
            });
          } else if (resultado.tipo === 'emitente_op') {
            setDistanciaEmitenteOp({
              km: parseFloat(resultado.data.distancia_km),
              texto: resultado.data.distancia_texto,
              origem: resultado.data.origem_endereco,
              destino: resultado.data.destino_endereco
            });
          } else if (resultado.tipo === 'op_dest') {
            setDistanciaOpDest({
              km: parseFloat(resultado.data.distancia_km),
              texto: resultado.data.distancia_texto,
              origem: resultado.data.origem_endereco,
              destino: resultado.data.destino_endereco
            });
          }
        }
      });

      if (houveErro) {
        setErroCalculoDistancia(true);
        toast.error("API do Google Maps não disponível. Insira o KM manualmente.");
      }
    } catch (error) {
      console.error("Erro ao calcular distâncias:", error);
      setErroCalculoDistancia(true);
      toast.error("Erro ao calcular distâncias via API");
    } finally {
      setCalculandoDistancia(false);
    }
  };

  const handleDownloadMapa = async () => {
    if (!distanciaEmitenteDest && !distanciaEmitenteOp && !distanciaOpDest) {
      toast.error("Nenhuma distância calculada");
      return;
    }

    try {
      toast.info("Gerando mapa...");
      
      let origem = "";
      let destino = "";
      let distanciaKm = 0;
      
      if (tabelaSelecionada?.tipo_distancia === "emitente_operador" && distanciaEmitenteOp) {
        origem = distanciaEmitenteOp.origem;
        destino = distanciaEmitenteOp.destino;
        distanciaKm = distanciaEmitenteOp.km;
      } else if (tabelaSelecionada?.tipo_distancia === "operador_destinatario" && distanciaOpDest) {
        origem = distanciaOpDest.origem;
        destino = distanciaOpDest.destino;
        distanciaKm = distanciaOpDest.km;
      } else if (distanciaEmitenteDest) {
        origem = distanciaEmitenteDest.origem;
        destino = distanciaEmitenteDest.destino;
        distanciaKm = distanciaEmitenteDest.km;
      }

      if (!origem || !destino) {
        toast.error("Endereços não encontrados");
        return;
      }

      const API_KEY = "AIzaSyA8JkFiGGCOzYn0OqoJZdWKbaBJVYWRGyw";

      // Buscar rota e polyline
      const directionsUrl = `https://maps.googleapis.com/maps/api/directions/json?origin=${encodeURIComponent(origem)}&destination=${encodeURIComponent(destino)}&mode=driving&key=${API_KEY}`;
      const directionsRes = await fetch(directionsUrl);
      const directionsData = await directionsRes.json();

      if (directionsData.status !== 'OK' || !directionsData.routes?.[0]) {
        toast.error("Não foi possível obter a rota");
        return;
      }

      const polyline = directionsData.routes[0].overview_polyline.points;

      // Gerar mapa com rota
      const mapUrl = `https://maps.googleapis.com/maps/api/staticmap?size=1200x800&scale=2&maptype=roadmap&markers=color:green|label:A|${encodeURIComponent(origem)}&markers=color:red|label:B|${encodeURIComponent(destino)}&path=color:0x3b82f6|weight:5|enc:${polyline}&key=${API_KEY}`;

      const mapRes = await fetch(mapUrl);
      const blob = await mapRes.blob();
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `mapa-rota-${distanciaKm.toFixed(0)}km.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success("Mapa baixado!");
    } catch (error) {
      console.error("Erro:", error);
      toast.error("Erro ao gerar mapa");
    }
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

    // Determinar KM baseado na configuração da tabela ou manual
    let kmReferencia = 0;
    let distanciaUsada = "";
    let baseConfigurada = "";
    let origemCalculo = "";
    let destinoCalculo = "";
    
    // Identificar a base configurada na tabela
    switch (tabelaSelecionada.tipo_distancia) {
      case "emitente_destinatario":
        baseConfigurada = "Emitente → Destinatário";
        break;
      case "emitente_operador":
        baseConfigurada = "Emitente → Operador";
        break;
      case "operador_destinatario":
        baseConfigurada = "Operador → Destinatário";
        break;
      default:
        baseConfigurada = "Emitente → Destinatário";
    }
    
    // Priorizar KM manual se informado
    if (kmManual && kmManual > 0) {
      kmReferencia = kmManual;
      distanciaUsada = "KM Manual";
    } else {
      switch (tabelaSelecionada.tipo_distancia) {
        case "emitente_destinatario":
          kmReferencia = distanciaEmitenteDest?.km || 0;
          distanciaUsada = "Emitente → Destinatário (Auto)";
          origemCalculo = distanciaEmitenteDest?.origem || "";
          destinoCalculo = distanciaEmitenteDest?.destino || "";
          break;
        case "emitente_operador":
          kmReferencia = distanciaEmitenteOp?.km || 0;
          distanciaUsada = "Emitente → Operador (Auto)";
          origemCalculo = distanciaEmitenteOp?.origem || "";
          destinoCalculo = distanciaEmitenteOp?.destino || "";
          break;
        case "operador_destinatario":
          kmReferencia = distanciaOpDest?.km || 0;
          distanciaUsada = "Operador → Destinatário (Auto)";
          origemCalculo = distanciaOpDest?.origem || "";
          destinoCalculo = distanciaOpDest?.destino || "";
          break;
        default:
          kmReferencia = distanciaEmitenteDest?.km || 0;
          distanciaUsada = "Emitente → Destinatário (Auto)";
          origemCalculo = distanciaEmitenteDest?.origem || "";
          destinoCalculo = distanciaEmitenteDest?.destino || "";
      }
    }
    
    // Encontrar a faixa de KM correta
    const colunas = tabelaSelecionada.colunas_km || [];
    let kmFaixa = "A"; // Default
    let kmFaixaMin = 0;
    let kmFaixaMax = 0;
    
    for (const col of colunas) {
      if (kmReferencia >= col.km_min && kmReferencia <= col.km_max) {
        kmFaixa = col.letra;
        kmFaixaMin = col.km_min;
        kmFaixaMax = col.km_max;
        break;
      }
    }

    const valorFaixa = itemAplicavel.valores_colunas?.[kmFaixa] || 0;

    let freteValor = 0;

    // Calcular baseado no tipo de tabela
    switch (tabelaSelecionada.tipo_tabela) {
      case "peso_km":
        if (itemAplicavel.unidade === "viagem") {
          freteValor = valorFaixa;
        } else if (itemAplicavel.unidade === "tonelada") {
          freteValor = valorFaixa * (pesoTotal / 1000);
        } else if (itemAplicavel.unidade === "kg") {
          freteValor = valorFaixa * pesoTotal;
        }
        break;
      case "percentual_nf":
        freteValor = valorTotal * (valorFaixa / 100);
        break;
      case "valor_fixo":
        freteValor = valorFaixa;
        break;
      default:
        freteValor = valorFaixa;
    }

    // Aplicar frete mínimo se necessário
    if (tabelaSelecionada.frete_minimo && freteValor < tabelaSelecionada.frete_minimo) {
      freteValor = tabelaSelecionada.frete_minimo;
    }

    // Calcular componentes individuais
    const componentes = {
      freteValor,
      pedagio: 0,
      adValorem: 0,
      gris: 0,
      seguro: 0,
      taxaColeta: tabelaSelecionada.taxa_coleta || 0,
      taxaEntrega: tabelaSelecionada.taxa_entrega || 0,
      taxaRedespacho: tabelaSelecionada.taxa_redespacho || 0,
      tde: tabelaSelecionada.tde || 0,
      generalidades: 0,
      desconto: 0
    };

    // Pedagio
    if (tabelaSelecionada.pedagio) {
      if (tabelaSelecionada.tipo_pedagio === "fixo") {
        componentes.pedagio = tabelaSelecionada.pedagio;
      } else if (tabelaSelecionada.tipo_pedagio === "percentual") {
        componentes.pedagio = freteValor * (tabelaSelecionada.pedagio / 100);
      }
    }

    // Ad Valorem (% sobre valor da NF)
    if (tabelaSelecionada.ad_valorem) {
      componentes.adValorem = valorTotal * (tabelaSelecionada.ad_valorem / 100);
    }

    // GRIS (% sobre valor da NF)
    if (tabelaSelecionada.gris) {
      componentes.gris = valorTotal * (tabelaSelecionada.gris / 100);
    }

    // Seguro (% sobre valor da NF)
    if (tabelaSelecionada.seguro) {
      componentes.seguro = valorTotal * (tabelaSelecionada.seguro / 100);
    }

    // Generalidades (% sobre frete base)
    if (tabelaSelecionada.generalidades) {
      componentes.generalidades = freteValor * (tabelaSelecionada.generalidades / 100);
    }

    // Soma de todos os custos antes de ICMS
    const somaCustos = Object.values(componentes).reduce((sum, val) => sum + val, 0);

    // Calcular desconto se houver
    if (tabelaSelecionada.desconto) {
      componentes.desconto = somaCustos * (tabelaSelecionada.desconto / 100);
    }

    const valorAntesICMS = somaCustos - componentes.desconto;

    // Calcular ICMS
    const aliquotaIcms = aliquotaIcmsManual || tabelaSelecionada.icms || 0;
    const adicionarIcms = tabelaSelecionada.adicionar_icms || false;
    
    let valorFinal = 0;
    let valorIcms = 0;
    let baseCalculoIcms = 0;

    if (aliquotaIcms > 0) {
      if (adicionarIcms) {
        // Adicionar ICMS: valor / (1 - icms)
        valorFinal = valorAntesICMS / (1 - (aliquotaIcms / 100));
        valorIcms = valorFinal - valorAntesICMS;
        baseCalculoIcms = valorFinal;
      } else {
        // Destacar ICMS: valor * icms
        valorFinal = valorAntesICMS;
        valorIcms = valorAntesICMS * (aliquotaIcms / 100);
        baseCalculoIcms = valorAntesICMS;
      }
    } else {
      valorFinal = valorAntesICMS;
    }

    return {
      tabela: tabelaSelecionada.nome,
      faixaPeso: `${itemAplicavel.faixa_peso_min} - ${itemAplicavel.faixa_peso_max} kg`,
      faixaKm: kmFaixa,
      kmFaixaMin,
      kmFaixaMax,
      kmCalculado: kmReferencia,
      distanciaUsada,
      baseConfigurada,
      origemCalculo,
      destinoCalculo,
      componentes,
      somaCustos,
      valorAntesICMS,
      aliquotaIcms,
      adicionarIcms,
      baseCalculoIcms,
      valorIcms,
      valorFinal,
      peso: pesoTotal,
      cubagem: cubagemTotal,
      valor: valorTotal,
      unidade: itemAplicavel.unidade,
      distanciaEmitenteDest: distanciaEmitenteDest?.texto,
      distanciaEmitenteOp: distanciaEmitenteOp?.texto,
      distanciaOpDest: distanciaOpDest?.texto
    };
  };

  // Recalcular distâncias quando endereços mudarem
  useEffect(() => {
    if (metodoEntradaSelecionado && tabelaSelecionada && notasFiscais.length > 0) {
      calcularDistancias();
    }
  }, [formData.remetente_cidade, formData.remetente_uf, formData.destino_cidade, formData.destino_uf, tabelaSelecionada]);

  useEffect(() => {
    if (tabelaSelecionada && notasFiscais.length > 0) {
      const resultado = calcularPrecificacao();
      setPrecificacaoCalculada(resultado);
    } else {
      setPrecificacaoCalculada(null);
    }
  }, [tabelaSelecionada, notasFiscais, kmManual, aliquotaIcmsManual, distanciaEmitenteDest, distanciaEmitenteOp, distanciaOpDest]);

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

                        {/* Distâncias Calculadas ou Erro */}
                        {calculandoDistancia ? (
                          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
                            <div className="flex items-center gap-2">
                              <Loader2 className="w-4 h-4 animate-spin text-yellow-700 dark:text-yellow-300" />
                              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                                Calculando distâncias via Google Maps...
                              </p>
                            </div>
                          </div>
                        ) : erroCalculoDistancia ? (
                          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                            <div className="flex items-center gap-2 mb-2">
                              <AlertTriangle className="w-4 h-4 text-red-700 dark:text-red-300" />
                              <p className="text-sm font-semibold text-red-900 dark:text-red-200">
                                API Google Maps não disponível
                              </p>
                            </div>
                            <p className="text-xs text-red-700 dark:text-red-300 mb-3">
                              Não foi possível calcular as distâncias automaticamente. Insira o KM manualmente abaixo.
                            </p>
                            <div>
                              <Label className="text-xs text-red-700 dark:text-red-300">KM Manual</Label>
                              <div className="flex gap-2 mt-1">
                                <Input
                                  type="number"
                                  step="0.1"
                                  value={kmManual || ""}
                                  onChange={(e) => setKmManual(parseFloat(e.target.value) || null)}
                                  placeholder="Ex: 450"
                                  className="flex-1 bg-white dark:bg-gray-800"
                                />
                                <Button
                                  type="button"
                                  onClick={() => {
                                    const resultado = calcularPrecificacao();
                                    setPrecificacaoCalculada(resultado);
                                    toast.success("Precificação calculada!");
                                  }}
                                  className="bg-red-600 hover:bg-red-700 text-white px-4"
                                >
                                  Calcular
                                </Button>
                              </div>
                              <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                                Digite a distância em KM e clique em Calcular
                              </p>
                            </div>
                          </div>
                        ) : (distanciaEmitenteDest || distanciaEmitenteOp || distanciaOpDest) && (
                          <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-3">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-purple-700 dark:text-purple-300" />
                                <p className="text-sm font-semibold text-purple-900 dark:text-purple-200">
                                  Distâncias Calculadas via Google Maps
                                </p>
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={handleDownloadMapa}
                                  className="h-7 text-xs"
                                >
                                  <Download className="w-3 h-3 mr-1" />
                                  Mapa
                                </Button>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setKmManual(null);
                                    calcularDistancias();
                                  }}
                                  className="h-7 text-xs"
                                >
                                  Recalcular
                                </Button>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-1 gap-3 mb-3">
                              {distanciaEmitenteDest && (
                                <div className="border rounded-lg p-3 bg-white dark:bg-gray-800" style={{ borderColor: '#c084fc' }}>
                                  <div className="flex items-center justify-between mb-2">
                                    <p className="text-xs font-semibold text-purple-700 dark:text-purple-300">Emitente → Destinatário</p>
                                    <p className="text-lg font-bold text-purple-900 dark:text-purple-100">{distanciaEmitenteDest.texto}</p>
                                  </div>
                                  <div className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
                                    <p><span className="font-medium">Origem:</span> {distanciaEmitenteDest.origem}</p>
                                    <p><span className="font-medium">Destino:</span> {distanciaEmitenteDest.destino}</p>
                                  </div>
                                </div>
                              )}
                              {distanciaEmitenteOp && (
                                <div className="border rounded-lg p-3 bg-white dark:bg-gray-800" style={{ borderColor: '#c084fc' }}>
                                  <div className="flex items-center justify-between mb-2">
                                    <p className="text-xs font-semibold text-purple-700 dark:text-purple-300">Emitente → Operador</p>
                                    <p className="text-lg font-bold text-purple-900 dark:text-purple-100">{distanciaEmitenteOp.texto}</p>
                                  </div>
                                  <div className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
                                    <p><span className="font-medium">Origem:</span> {distanciaEmitenteOp.origem}</p>
                                    <p><span className="font-medium">Destino:</span> {distanciaEmitenteOp.destino}</p>
                                  </div>
                                </div>
                              )}
                              {distanciaOpDest && (
                                <div className="border rounded-lg p-3 bg-white dark:bg-gray-800" style={{ borderColor: '#c084fc' }}>
                                  <div className="flex items-center justify-between mb-2">
                                    <p className="text-xs font-semibold text-purple-700 dark:text-purple-300">Operador → Destinatário</p>
                                    <p className="text-lg font-bold text-purple-900 dark:text-purple-100">{distanciaOpDest.texto}</p>
                                  </div>
                                  <div className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
                                    <p><span className="font-medium">Origem:</span> {distanciaOpDest.origem}</p>
                                    <p><span className="font-medium">Destino:</span> {distanciaOpDest.destino}</p>
                                  </div>
                                </div>
                              )}
                            </div>
                            
                            <div className="border-t pt-3" style={{ borderColor: '#c084fc' }}>
                              <Label className="text-xs text-purple-700 dark:text-purple-300">KM Manual (Opcional)</Label>
                              <div className="flex gap-2 mt-1">
                                <Input
                                  type="number"
                                  step="0.1"
                                  value={kmManual || ""}
                                  onChange={(e) => setKmManual(parseFloat(e.target.value) || null)}
                                  placeholder="Ex: 1000"
                                  className="flex-1 bg-white dark:bg-gray-800"
                                />
                                <Button
                                  type="button"
                                  onClick={() => {
                                    const resultado = calcularPrecificacao();
                                    setPrecificacaoCalculada(resultado);
                                    toast.success("Precificação recalculada!");
                                  }}
                                  className="bg-purple-600 hover:bg-purple-700 text-white px-4"
                                >
                                  Calcular
                                </Button>
                              </div>
                              <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">
                                Se preenchido, este valor será usado no lugar do cálculo automático
                              </p>
                            </div>
                          </div>
                        )}

                        {precificacaoCalculada && (
                          <div className="space-y-4">
                            {/* Resumo da Faixa */}
                            <div className="grid grid-cols-2 gap-3">
                              <div className="border rounded-lg p-3" style={{ borderColor: theme.cardBorder }}>
                                <p className="text-xs mb-1" style={{ color: theme.textMuted }}>Faixa de Peso</p>
                                <p className="text-sm font-bold" style={{ color: theme.text }}>
                                  {precificacaoCalculada.faixaPeso}
                                </p>
                              </div>
                              <div className="border rounded-lg p-3 bg-purple-50 dark:bg-purple-900/20" style={{ borderColor: '#a855f7' }}>
                                <p className="text-xs mb-1 text-purple-700 dark:text-purple-300">Faixa KM</p>
                                <p className="text-lg font-bold text-purple-900 dark:text-purple-100">
                                  Faixa {precificacaoCalculada.faixaKm}
                                </p>
                                <p className="text-sm text-purple-700 dark:text-purple-300 mt-1">
                                  {precificacaoCalculada.kmFaixaMin} - {precificacaoCalculada.kmFaixaMax} km
                                </p>
                                {precificacaoCalculada.kmCalculado > 0 && (
                                  <>
                                    <div className="mt-2 pt-2 border-t" style={{ borderColor: '#c084fc' }}>
                                      <p className="text-xs text-purple-600 dark:text-purple-400 mb-1">
                                        Base de Cálculo: <span className="font-bold">{precificacaoCalculada.baseConfigurada}</span>
                                      </p>
                                      <p className="text-xl font-bold text-purple-700 dark:text-purple-300">
                                        {precificacaoCalculada.kmCalculado.toFixed(1)} km
                                      </p>
                                      <p className="text-xs mt-1 text-purple-600 dark:text-purple-400 font-medium">
                                        {precificacaoCalculada.distanciaUsada}
                                      </p>
                                    </div>
                                    {precificacaoCalculada.origemCalculo && precificacaoCalculada.destinoCalculo && (
                                      <div className="mt-2 pt-2 border-t space-y-1" style={{ borderColor: '#c084fc' }}>
                                        <p className="text-xs text-purple-600 dark:text-purple-400">
                                          <span className="font-medium">De:</span> {precificacaoCalculada.origemCalculo}
                                        </p>
                                        <p className="text-xs text-purple-600 dark:text-purple-400">
                                          <span className="font-medium">Para:</span> {precificacaoCalculada.destinoCalculo}
                                        </p>
                                      </div>
                                    )}
                                  </>
                                )}
                              </div>
                            </div>

                            {/* Campo ICMS Manual */}
                            <div className="border rounded-lg p-3 bg-blue-50 dark:bg-blue-900/20" style={{ borderColor: '#3b82f6' }}>
                              <Label className="text-xs text-blue-700 dark:text-blue-300 mb-1 block">Alíquota ICMS (%) - Opcional</Label>
                              <Input
                                type="number"
                                step="0.01"
                                value={aliquotaIcmsManual ?? ""}
                                onChange={(e) => setAliquotaIcmsManual(e.target.value ? parseFloat(e.target.value) : null)}
                                placeholder={tabelaSelecionada.icms ? `Padrão: ${tabelaSelecionada.icms}%` : "Ex: 12"}
                                className="bg-white dark:bg-gray-800"
                              />
                              <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                                {tabelaSelecionada.adicionar_icms 
                                  ? "⚠ Tabela configurada para ADICIONAR ICMS ao valor" 
                                  : "ℹ Tabela configurada para DESTACAR ICMS do valor"}
                              </p>
                            </div>

                            {/* Breakdown Detalhado - Estilo CT-e */}
                            <div className="border-2 rounded-lg p-4 bg-white dark:bg-gray-800" style={{ borderColor: '#3b82f6' }}>
                              <h3 className="font-bold text-sm mb-3 text-blue-700 dark:text-blue-300">
                                📊 Composição do Frete (Base para CT-e)
                              </h3>
                              
                              <div className="space-y-2 text-sm">
                                {/* Componentes de Prestação de Serviço */}
                                <div className="flex justify-between py-1 border-b" style={{ borderColor: theme.cardBorder }}>
                                  <span style={{ color: theme.textMuted }}>Frete-Valor ({precificacaoCalculada.unidade})</span>
                                  <span className="font-semibold" style={{ color: theme.text }}>
                                    R$ {precificacaoCalculada.componentes.freteValor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                  </span>
                                </div>
                                
                                {precificacaoCalculada.componentes.pedagio > 0 && (
                                  <div className="flex justify-between py-1 border-b" style={{ borderColor: theme.cardBorder }}>
                                    <span style={{ color: theme.textMuted }}>Pedágio</span>
                                    <span className="font-semibold" style={{ color: theme.text }}>
                                      R$ {precificacaoCalculada.componentes.pedagio.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                    </span>
                                  </div>
                                )}

                                {precificacaoCalculada.componentes.adValorem > 0 && (
                                  <div className="flex justify-between py-1 border-b" style={{ borderColor: theme.cardBorder }}>
                                    <span style={{ color: theme.textMuted }}>Ad Valorem ({tabelaSelecionada.ad_valorem}%)</span>
                                    <span className="font-semibold" style={{ color: theme.text }}>
                                      R$ {precificacaoCalculada.componentes.adValorem.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                    </span>
                                  </div>
                                )}

                                {precificacaoCalculada.componentes.gris > 0 && (
                                  <div className="flex justify-between py-1 border-b" style={{ borderColor: theme.cardBorder }}>
                                    <span style={{ color: theme.textMuted }}>GRIS ({tabelaSelecionada.gris}%)</span>
                                    <span className="font-semibold" style={{ color: theme.text }}>
                                      R$ {precificacaoCalculada.componentes.gris.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                    </span>
                                  </div>
                                )}

                                {precificacaoCalculada.componentes.seguro > 0 && (
                                  <div className="flex justify-between py-1 border-b" style={{ borderColor: theme.cardBorder }}>
                                    <span style={{ color: theme.textMuted }}>Seguro ({tabelaSelecionada.seguro}%)</span>
                                    <span className="font-semibold" style={{ color: theme.text }}>
                                      R$ {precificacaoCalculada.componentes.seguro.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                    </span>
                                  </div>
                                )}

                                {precificacaoCalculada.componentes.taxaColeta > 0 && (
                                  <div className="flex justify-between py-1 border-b" style={{ borderColor: theme.cardBorder }}>
                                    <span style={{ color: theme.textMuted }}>Taxa de Coleta</span>
                                    <span className="font-semibold" style={{ color: theme.text }}>
                                      R$ {precificacaoCalculada.componentes.taxaColeta.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                    </span>
                                  </div>
                                )}

                                {precificacaoCalculada.componentes.taxaEntrega > 0 && (
                                  <div className="flex justify-between py-1 border-b" style={{ borderColor: theme.cardBorder }}>
                                    <span style={{ color: theme.textMuted }}>Taxa de Entrega</span>
                                    <span className="font-semibold" style={{ color: theme.text }}>
                                      R$ {precificacaoCalculada.componentes.taxaEntrega.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                    </span>
                                  </div>
                                )}

                                {precificacaoCalculada.componentes.taxaRedespacho > 0 && (
                                  <div className="flex justify-between py-1 border-b" style={{ borderColor: theme.cardBorder }}>
                                    <span style={{ color: theme.textMuted }}>Taxa Redespacho</span>
                                    <span className="font-semibold" style={{ color: theme.text }}>
                                      R$ {precificacaoCalculada.componentes.taxaRedespacho.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                    </span>
                                  </div>
                                )}

                                {precificacaoCalculada.componentes.tde > 0 && (
                                  <div className="flex justify-between py-1 border-b" style={{ borderColor: theme.cardBorder }}>
                                    <span style={{ color: theme.textMuted }}>TDE</span>
                                    <span className="font-semibold" style={{ color: theme.text }}>
                                      R$ {precificacaoCalculada.componentes.tde.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                    </span>
                                  </div>
                                )}

                                {precificacaoCalculada.componentes.generalidades > 0 && (
                                  <div className="flex justify-between py-1 border-b" style={{ borderColor: theme.cardBorder }}>
                                    <span style={{ color: theme.textMuted }}>Generalidades ({tabelaSelecionada.generalidades}%)</span>
                                    <span className="font-semibold" style={{ color: theme.text }}>
                                      R$ {precificacaoCalculada.componentes.generalidades.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                    </span>
                                  </div>
                                )}

                                {precificacaoCalculada.componentes.desconto > 0 && (
                                  <div className="flex justify-between py-1 border-b" style={{ borderColor: theme.cardBorder }}>
                                    <span style={{ color: theme.textMuted }}>Desconto ({tabelaSelecionada.desconto}%)</span>
                                    <span className="font-semibold text-red-600">
                                      - R$ {precificacaoCalculada.componentes.desconto.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                    </span>
                                  </div>
                                )}

                                {/* Subtotal antes de ICMS */}
                                <div className="flex justify-between py-2 border-t-2 border-b-2 bg-gray-50 dark:bg-gray-900/50 px-2 -mx-2" style={{ borderColor: theme.cardBorder }}>
                                  <span className="font-bold" style={{ color: theme.text }}>Valor antes de ICMS</span>
                                  <span className="font-bold text-blue-600">
                                    R$ {precificacaoCalculada.valorAntesICMS.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                  </span>
                                </div>

                                {/* ICMS */}
                                {precificacaoCalculada.aliquotaIcms > 0 && (
                                  <>
                                    <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-3 space-y-2">
                                      <div className="flex justify-between items-center">
                                        <span className="text-xs font-semibold text-orange-700 dark:text-orange-300">
                                          ICMS ({precificacaoCalculada.aliquotaIcms}%)
                                        </span>
                                        <span className="text-xs px-2 py-0.5 rounded bg-orange-200 dark:bg-orange-800 text-orange-900 dark:text-orange-100">
                                          {precificacaoCalculada.adicionarIcms ? "ADICIONAR" : "DESTACAR"}
                                        </span>
                                      </div>
                                      
                                      <div className="flex justify-between text-xs">
                                        <span style={{ color: theme.textMuted }}>Base de Cálculo</span>
                                        <span className="font-semibold" style={{ color: theme.text }}>
                                          R$ {precificacaoCalculada.baseCalculoIcms.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                        </span>
                                      </div>
                                      
                                      <div className="flex justify-between text-xs">
                                        <span style={{ color: theme.textMuted }}>Alíquota</span>
                                        <span className="font-semibold" style={{ color: theme.text }}>
                                          {precificacaoCalculada.aliquotaIcms}%
                                        </span>
                                      </div>
                                      
                                      <div className="flex justify-between pt-2 border-t" style={{ borderColor: '#fb923c' }}>
                                        <span className="font-bold text-orange-700 dark:text-orange-300">Valor ICMS</span>
                                        <span className="font-bold text-orange-700 dark:text-orange-300">
                                          R$ {precificacaoCalculada.valorIcms.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                        </span>
                                      </div>
                                    </div>
                                  </>
                                )}

                                {/* Valor Total Final */}
                                <div className="flex justify-between py-3 bg-green-50 dark:bg-green-900/20 px-3 -mx-2 rounded-lg border-2" style={{ borderColor: '#16a34a' }}>
                                  <span className="font-bold text-lg text-green-700 dark:text-green-300">VALOR TOTAL</span>
                                  <span className="font-bold text-xl text-green-700 dark:text-green-300">
                                    R$ {precificacaoCalculada.valorFinal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                  </span>
                                </div>
                              </div>
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