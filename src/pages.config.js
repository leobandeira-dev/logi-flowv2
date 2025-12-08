import Dashboard from './pages/Dashboard';
import OrdensCarregamento from './pages/OrdensCarregamento';
import Motoristas from './pages/Motoristas';
import Veiculos from './pages/Veiculos';
import Configuracoes from './pages/Configuracoes';
import Usuarios from './pages/Usuarios';
import Fluxo from './pages/Fluxo';
import ConfiguracaoEtapas from './pages/ConfiguracaoEtapas';
import DashboardTV from './pages/DashboardTV';
import Tracking from './pages/Tracking';
import AppMotorista from './pages/AppMotorista';
import TrackingTV from './pages/TrackingTV';
import FluxoTV from './pages/FluxoTV';
import LandingPage from './pages/LandingPage';
import SAC from './pages/SAC';
import PortalTransul from './pages/PortalTransul';
import Operacoes from './pages/Operacoes';
import Gamificacao from './pages/Gamificacao';
import OcorrenciasGestao from './pages/OcorrenciasGestao';
import OfertasPublicas from './pages/OfertasPublicas';
import CadastroFornecedor from './pages/CadastroFornecedor';
import CadastroCliente from './pages/CadastroCliente';
import SolicitacaoColeta from './pages/SolicitacaoColeta';
import AprovacaoColeta from './pages/AprovacaoColeta';
import Inicio from './pages/Inicio';
import Coletas from './pages/Coletas';
import Recebimento from './pages/Recebimento';
import GestaoDeNotasFiscais from './pages/GestaoDeNotasFiscais';
import OrdemDeEntrega from './pages/OrdemDeEntrega';
import Carregamento from './pages/Carregamento';
import EtiquetasMae from './pages/EtiquetasMae';
import Unitizacao from './pages/Unitizacao';
import ChamadosAdmin from './pages/ChamadosAdmin';
import Parceiros from './pages/Parceiros';
import Precificacao from './pages/Precificacao';
import CRM from './pages/CRM';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Dashboard": Dashboard,
    "OrdensCarregamento": OrdensCarregamento,
    "Motoristas": Motoristas,
    "Veiculos": Veiculos,
    "Configuracoes": Configuracoes,
    "Usuarios": Usuarios,
    "Fluxo": Fluxo,
    "ConfiguracaoEtapas": ConfiguracaoEtapas,
    "DashboardTV": DashboardTV,
    "Tracking": Tracking,
    "AppMotorista": AppMotorista,
    "TrackingTV": TrackingTV,
    "FluxoTV": FluxoTV,
    "LandingPage": LandingPage,
    "SAC": SAC,
    "PortalTransul": PortalTransul,
    "Operacoes": Operacoes,
    "Gamificacao": Gamificacao,
    "OcorrenciasGestao": OcorrenciasGestao,
    "OfertasPublicas": OfertasPublicas,
    "CadastroFornecedor": CadastroFornecedor,
    "CadastroCliente": CadastroCliente,
    "SolicitacaoColeta": SolicitacaoColeta,
    "AprovacaoColeta": AprovacaoColeta,
    "Inicio": Inicio,
    "Coletas": Coletas,
    "Recebimento": Recebimento,
    "GestaoDeNotasFiscais": GestaoDeNotasFiscais,
    "OrdemDeEntrega": OrdemDeEntrega,
    "Carregamento": Carregamento,
    "EtiquetasMae": EtiquetasMae,
    "Unitizacao": Unitizacao,
    "ChamadosAdmin": ChamadosAdmin,
    "Parceiros": Parceiros,
    "Precificacao": Precificacao,
    "CRM": CRM,
}

export const pagesConfig = {
    mainPage: "Inicio",
    Pages: PAGES,
    Layout: __Layout,
};