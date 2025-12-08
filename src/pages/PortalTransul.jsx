import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Truck,
  MapPin,
  Shield,
  Clock,
  Award,
  Users,
  Package,
  Phone,
  Mail,
  MessageCircle,
  Search,
  Target,
  BarChart3
} from "lucide-react";
import { createPageUrl } from "@/utils";

export default function PortalTransul() {
  const [trackingCode, setTrackingCode] = useState("");
  const [showSAC, setShowSAC] = useState(false);

  const handleTrackCarga = () => {
    if (trackingCode.trim()) {
      window.location.href = createPageUrl("SAC");
    }
  };

  const handleSAC = () => {
    window.location.href = createPageUrl("SAC");
  };

  const services = [
    {
      icon: Truck,
      title: "Transporte Rodoviário",
      description: "Frota moderna e equipada para transportes de cargas secas e especiais",
      color: "bg-blue-500"
    },
    {
      icon: Package,
      title: "Logística Integrada",
      description: "Soluções completas de armazenagem, cross-docking e distribuição",
      color: "bg-green-500"
    },
    {
      icon: MapPin,
      title: "Rastreamento 24/7",
      description: "Monitoramento em tempo real da sua carga do início ao fim",
      color: "bg-purple-500"
    },
    {
      icon: Shield,
      title: "Segurança Total",
      description: "Tecnologia de ponta e protocolos rigorosos de segurança",
      color: "bg-red-500"
    }
  ];

  const diferenciais = [
    {
      icon: Award,
      title: "20+ Anos de Experiência",
      description: "Experiência consolidada no mercado de transporte"
    },
    {
      icon: Users,
      title: "Equipe Especializada",
      description: "Profissionais qualificados e treinados"
    },
    {
      icon: Target,
      title: "Pontualidade",
      description: "98% de entregas dentro do prazo"
    },
    {
      icon: BarChart3,
      title: "Tecnologia Avançada",
      description: "Sistema de gestão e rastreamento de última geração"
    }
  ];

  const stats = [
    { number: "5.000+", label: "Entregas/Mês", icon: Package },
    { number: "200+", label: "Veículos", icon: Truck },
    { number: "98%", label: "Satisfação", icon: Award },
    { number: "24/7", label: "Suporte", icon: Clock }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header/Navbar */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg flex items-center justify-center">
                <Truck className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Transul</h1>
                <p className="text-xs text-gray-500">Transporte e Logística</p>
              </div>
            </div>

            <nav className="hidden md:flex items-center gap-6">
              <a href="#servicos" className="text-gray-600 hover:text-blue-600 transition-colors">
                Serviços
              </a>
              <a href="#rastreamento" className="text-gray-600 hover:text-blue-600 transition-colors">
                Rastreamento
              </a>
              <a href="#sobre" className="text-gray-600 hover:text-blue-600 transition-colors">
                Sobre Nós
              </a>
              <a href="#contato" className="text-gray-600 hover:text-blue-600 transition-colors">
                Contato
              </a>
              <Button onClick={handleSAC} className="bg-blue-600 hover:bg-blue-700">
                <MessageCircle className="w-4 h-4 mr-2" />
                Fale Conosco
              </Button>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900 text-white py-24">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <Badge className="mb-4 bg-blue-500 text-white border-none">
                Transporte Profissional
              </Badge>
              <h1 className="text-5xl font-bold mb-6 leading-tight">
                Conectando o Brasil com
                <span className="text-yellow-400"> Segurança e Eficiência</span>
              </h1>
              <p className="text-xl mb-8 text-blue-100">
                Soluções completas em transporte rodoviário e logística integrada.
                Sua carga em boas mãos, sempre.
              </p>
              <div className="flex gap-4">
                <Button
                  size="lg"
                  onClick={handleSAC}
                  className="bg-white text-blue-600 hover:bg-blue-50 font-bold"
                >
                  <Phone className="w-5 h-5 mr-2" />
                  Solicitar Orçamento
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white text-white hover:bg-white hover:text-blue-600"
                  onClick={() => document.getElementById('rastreamento').scrollIntoView({ behavior: 'smooth' })}
                >
                  <MapPin className="w-5 h-5 mr-2" />
                  Rastrear Carga
                </Button>
              </div>
            </div>

            <div className="hidden md:block">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 rounded-3xl blur-3xl opacity-30"></div>
                <img
                  src="https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=800"
                  alt="Caminhão Transul"
                  className="relative rounded-3xl shadow-2xl"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="flex justify-center mb-3">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                    <stat.icon className="w-8 h-8 text-blue-600" />
                  </div>
                </div>
                <div className="text-4xl font-bold text-gray-900 mb-2">{stat.number}</div>
                <div className="text-gray-600 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Rastreamento Section */}
      <section id="rastreamento" className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
              <MapPin className="w-8 h-8 text-blue-600" />
            </div>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Rastreie Sua Carga em Tempo Real
            </h2>
            <p className="text-xl text-gray-600">
              Acompanhe o status da sua entrega com nosso sistema de tracking avançado
            </p>
          </div>

          <Card className="shadow-xl border-2 border-blue-100">
            <CardContent className="p-8">
              <div className="flex gap-3">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    placeholder="Digite o número da sua carga ou ASN..."
                    value={trackingCode}
                    onChange={(e) => setTrackingCode(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleTrackCarga()}
                    className="pl-12 h-14 text-lg"
                  />
                </div>
                <Button
                  onClick={handleTrackCarga}
                  size="lg"
                  className="bg-blue-600 hover:bg-blue-700 h-14 px-8"
                >
                  <Search className="w-5 h-5 mr-2" />
                  Rastrear
                </Button>
              </div>

              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <div className="flex items-start gap-3">
                  <MessageCircle className="w-5 h-5 text-blue-600 mt-1" />
                  <div>
                    <p className="text-sm text-blue-900 font-medium mb-1">
                      Precisa de ajuda com o rastreamento?
                    </p>
                    <p className="text-sm text-blue-700">
                      Fale com nosso assistente virtual! Ele pode consultar o status da sua carga instantaneamente.
                    </p>
                    <Button
                      onClick={handleSAC}
                      variant="link"
                      className="text-blue-600 p-0 h-auto mt-2"
                    >
                      Conversar com o assistente →
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Serviços Section */}
      <section id="servicos" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Nossos Serviços
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Soluções completas para atender todas as suas necessidades logísticas
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {services.map((service, index) => (
              <Card key={index} className="hover:shadow-xl transition-all duration-300 border-t-4 border-transparent hover:border-blue-600">
                <CardContent className="p-6">
                  <div className={`w-14 h-14 ${service.color} rounded-lg flex items-center justify-center mb-4`}>
                    <service.icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    {service.title}
                  </h3>
                  <p className="text-gray-600">
                    {service.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Diferenciais Section */}
      <section id="sobre" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Por Que Escolher a Transul?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Comprometimento com qualidade e excelência em cada entrega
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {diferenciais.map((item, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6 flex gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <item.icon className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                      {item.title}
                    </h3>
                    <p className="text-gray-600">
                      {item.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-blue-600 to-blue-800 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <MessageCircle className="w-16 h-16 mx-auto mb-6 text-yellow-400" />
          <h2 className="text-4xl font-bold mb-6">
            Atendimento 24/7 via Assistente Virtual
          </h2>
          <p className="text-xl mb-8 text-blue-100">
            Tire dúvidas, consulte status de cargas e receba informações instantâneas
            através do nosso assistente inteligente
          </p>
          <Button
            onClick={handleSAC}
            size="lg"
            className="bg-white text-blue-600 hover:bg-blue-50 font-bold text-lg px-8 py-6"
          >
            <MessageCircle className="w-6 h-6 mr-2" />
            Iniciar Conversa
          </Button>
        </div>
      </section>

      {/* Contato Section */}
      <section id="contato" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Entre em Contato
              </h2>
              <p className="text-xl text-gray-600 mb-8">
                Nossa equipe está pronta para atender você
              </p>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Phone className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1">Telefone</h3>
                    <p className="text-gray-600">(11) 4002-8922</p>
                    <p className="text-gray-600">(11) 98765-4321</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Mail className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1">Email</h3>
                    <p className="text-gray-600">contato@transul.com.br</p>
                    <p className="text-gray-600">comercial@transul.com.br</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1">Endereço</h3>
                    <p className="text-gray-600">
                      Rodovia dos Bandeirantes, KM 72<br />
                      Guarulhos - SP, 07190-100
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <Card className="shadow-xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">
                  Solicite um Orçamento
                </h3>
                <Button
                  onClick={handleSAC}
                  size="lg"
                  className="w-full bg-blue-600 hover:bg-blue-700 h-14 text-lg"
                >
                  <MessageCircle className="w-5 h-5 mr-2" />
                  Falar com Especialista
                </Button>
                <p className="text-sm text-gray-500 text-center mt-4">
                  Resposta em menos de 1 minuto
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Truck className="w-8 h-8" />
                <span className="text-xl font-bold">Transul</span>
              </div>
              <p className="text-gray-400">
                Transporte e logística com excelência há mais de 20 anos.
              </p>
            </div>

            <div>
              <h3 className="font-bold mb-4">Serviços</h3>
              <ul className="space-y-2 text-gray-400">
                <li>Transporte Rodoviário</li>
                <li>Logística Integrada</li>
                <li>Rastreamento</li>
                <li>Armazenagem</li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold mb-4">Links Úteis</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#servicos" className="hover:text-white">Serviços</a></li>
                <li><a href="#rastreamento" className="hover:text-white">Rastreamento</a></li>
                <li><a href="#sobre" className="hover:text-white">Sobre Nós</a></li>
                <li><a href="#contato" className="hover:text-white">Contato</a></li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold mb-4">Atendimento</h3>
              <ul className="space-y-2 text-gray-400">
                <li>Segunda a Sexta: 8h às 18h</li>
                <li>Sábado: 8h às 12h</li>
                <li>Assistente Virtual: 24/7</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
            <p>&copy; 2025 Transul Transporte e Logística. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>

      {/* Floating SAC Button */}
      <button
        onClick={handleSAC}
        className="fixed bottom-6 right-6 w-16 h-16 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-2xl flex items-center justify-center transition-all hover:scale-110 z-50"
      >
        <MessageCircle className="w-7 h-7" />
      </button>
    </div>
  );
}