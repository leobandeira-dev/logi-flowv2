/**
 * pages.config.js - Page routing configuration
 * 
 * This file is AUTO-GENERATED. Do not add imports or modify PAGES manually.
 * Pages are auto-registered when you create files in the ./pages/ folder.
 * 
 * THE ONLY EDITABLE VALUE: mainPage
 * This controls which page is the landing page (shown when users visit the app).
 * 
 * Example file structure:
 * 
 *   import HomePage from './pages/HomePage';
 *   import Dashboard from './pages/Dashboard';
 *   import Settings from './pages/Settings';
 *   
 *   export const PAGES = {
 *       "HomePage": HomePage,
 *       "Dashboard": Dashboard,
 *       "Settings": Settings,
 *   }
 *   
 *   export const pagesConfig = {
 *       mainPage: "HomePage",
 *       Pages: PAGES,
 *   };
 * 
 * Example with Layout (wraps all pages):
 *
 *   import Home from './pages/Home';
 *   import Settings from './pages/Settings';
 *   import __Layout from './Layout.jsx';
 *
 *   export const PAGES = {
 *       "Home": Home,
 *       "Settings": Settings,
 *   }
 *
 *   export const pagesConfig = {
 *       mainPage: "Home",
 *       Pages: PAGES,
 *       Layout: __Layout,
 *   };
 *
 * To change the main page from HomePage to Dashboard, use find_replace:
 *   Old: mainPage: "HomePage",
 *   New: mainPage: "Dashboard",
 *
 * The mainPage value must match a key in the PAGES object exactly.
 */
import AppMotorista from './pages/AppMotorista';
import Apresentacao from './pages/Apresentacao';
import AprovacaoColeta from './pages/AprovacaoColeta';
import CRM from './pages/CRM';
import CadastroCliente from './pages/CadastroCliente';
import CadastroFornecedor from './pages/CadastroFornecedor';
import Carregamento from './pages/Carregamento';
import ChamadosAdmin from './pages/ChamadosAdmin';
import Coletas from './pages/Coletas';
import ConfiguracaoEtapas from './pages/ConfiguracaoEtapas';
import Configuracoes from './pages/Configuracoes';
import Cubagem from './pages/Cubagem';
import Dashboard from './pages/Dashboard';
import DashboardTV from './pages/DashboardTV';
import EtiquetasMae from './pages/EtiquetasMae';
import FilaMotorista from './pages/FilaMotorista';
import FilaX from './pages/FilaX';
import Fluxo from './pages/Fluxo';
import FluxoTV from './pages/FluxoTV';
import Gamificacao from './pages/Gamificacao';
import GestaoDeCTe from './pages/GestaoDeCTe';
import GestaoDeNotasFiscais from './pages/GestaoDeNotasFiscais';
import Home from './pages/Home';
import Inicio from './pages/Inicio';
import LandingPage from './pages/LandingPage';
import Motoristas from './pages/Motoristas';
import OcorrenciasGestao from './pages/OcorrenciasGestao';
import OfertasPublicas from './pages/OfertasPublicas';
import Operacoes from './pages/Operacoes';
import OrdemDeEntrega from './pages/OrdemDeEntrega';
import OrdensCarregamento from './pages/OrdensCarregamento';
import Parceiros from './pages/Parceiros';
import PermissoesEmpresa from './pages/PermissoesEmpresa';
import PermissoesPerfilEmpresa from './pages/PermissoesPerfilEmpresa';
import PermissoesPerfilUsuario from './pages/PermissoesPerfilUsuario';
import PitchDeckInvestidores from './pages/PitchDeckInvestidores';
import PortalTransul from './pages/PortalTransul';
import Precificacao from './pages/Precificacao';
import Procedimentos from './pages/Procedimentos';
import ProcessarEtapasNovembro from './pages/ProcessarEtapasNovembro';
import ProdutosPalets from './pages/ProdutosPalets';
import Recebimento from './pages/Recebimento';
import SAC from './pages/SAC';
import SolicitacaoColeta from './pages/SolicitacaoColeta';
import Tabelas from './pages/Tabelas';
import Tracking from './pages/Tracking';
import TrackingTV from './pages/TrackingTV';
import Unitizacao from './pages/Unitizacao';
import Usuarios from './pages/Usuarios';
import Veiculos from './pages/Veiculos';
import __Layout from './Layout.jsx';


export const PAGES = {
    "AppMotorista": AppMotorista,
    "Apresentacao": Apresentacao,
    "AprovacaoColeta": AprovacaoColeta,
    "CRM": CRM,
    "CadastroCliente": CadastroCliente,
    "CadastroFornecedor": CadastroFornecedor,
    "Carregamento": Carregamento,
    "ChamadosAdmin": ChamadosAdmin,
    "Coletas": Coletas,
    "ConfiguracaoEtapas": ConfiguracaoEtapas,
    "Configuracoes": Configuracoes,
    "Cubagem": Cubagem,
    "Dashboard": Dashboard,
    "DashboardTV": DashboardTV,
    "EtiquetasMae": EtiquetasMae,
    "FilaMotorista": FilaMotorista,
    "FilaX": FilaX,
    "Fluxo": Fluxo,
    "FluxoTV": FluxoTV,
    "Gamificacao": Gamificacao,
    "GestaoDeCTe": GestaoDeCTe,
    "GestaoDeNotasFiscais": GestaoDeNotasFiscais,
    "Home": Home,
    "Inicio": Inicio,
    "LandingPage": LandingPage,
    "Motoristas": Motoristas,
    "OcorrenciasGestao": OcorrenciasGestao,
    "OfertasPublicas": OfertasPublicas,
    "Operacoes": Operacoes,
    "OrdemDeEntrega": OrdemDeEntrega,
    "OrdensCarregamento": OrdensCarregamento,
    "Parceiros": Parceiros,
    "PermissoesEmpresa": PermissoesEmpresa,
    "PermissoesPerfilEmpresa": PermissoesPerfilEmpresa,
    "PermissoesPerfilUsuario": PermissoesPerfilUsuario,
    "PitchDeckInvestidores": PitchDeckInvestidores,
    "PortalTransul": PortalTransul,
    "Precificacao": Precificacao,
    "Procedimentos": Procedimentos,
    "ProcessarEtapasNovembro": ProcessarEtapasNovembro,
    "ProdutosPalets": ProdutosPalets,
    "Recebimento": Recebimento,
    "SAC": SAC,
    "SolicitacaoColeta": SolicitacaoColeta,
    "Tabelas": Tabelas,
    "Tracking": Tracking,
    "TrackingTV": TrackingTV,
    "Unitizacao": Unitizacao,
    "Usuarios": Usuarios,
    "Veiculos": Veiculos,
}

export const pagesConfig = {
    mainPage: "LandingPage",
    Pages: PAGES,
    Layout: __Layout,
};