
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  FileText,
  TrendingUp,
  Truck,
  Users,
  AlertTriangle,
  Calendar,
  MessageCircle // Added MessageCircle icon
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button"; // Added Button component

export default function MetricsCards({ metrics, loading }) {
  const cards = [
    {
      title: "Total de Ordens",
      value: metrics.totalOrdens,
      icon: FileText,
      color: "bg-blue-500",
      subtext: `${metrics.ordensHoje} hoje`
    },
    {
      title: "Em Trânsito",
      value: metrics.ordensEmTransito,
      icon: TrendingUp,
      color: "bg-green-500",
      subtext: "Cargas em movimento"
    },
    {
      title: "Atrasadas",
      value: metrics.ordensAtrasadas,
      icon: AlertTriangle,
      color: "bg-red-500",
      subtext: "Requer atenção"
    },
    {
      title: "Este Mês",
      value: metrics.ordensEsteMes,
      icon: Calendar,
      color: "bg-purple-500",
      subtext: "Novas ordens"
    },
    {
      title: "Motoristas",
      value: metrics.totalMotoristas,
      icon: Users,
      color: "bg-indigo-500",
      subtext: "Cadastrados"
    },
    {
      title: "Veículos",
      value: metrics.totalVeiculos,
      icon: Truck,
      color: "bg-orange-500",
      subtext: `${metrics.veiculosDisponiveis} disponíveis`
    }
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
        {Array(6).fill(0).map((_, i) => (
          <Card key={i}>
            <CardHeader className="p-4">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-8 w-12" />
                </div>
                <Skeleton className="h-10 w-10 rounded-lg" />
              </div>
              <Skeleton className="h-3 w-16" />
            </CardHeader>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
        {cards.map((card, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow duration-200">
            <CardHeader className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-medium text-gray-600 mb-1">
                    {card.title}
                  </CardTitle>
                  <div className="text-2xl font-bold text-gray-900">
                    {card.value.toLocaleString()}
                  </div>
                </div>
                <div className={`p-2 rounded-lg ${card.color} bg-opacity-10`}>
                  <card.icon className={`w-6 h-6 ${card.color.replace('bg-', 'text-')}`} />
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-1">{card.subtext}</p>
            </CardHeader>
          </Card>
        ))}
      </div>

      {/* Banner SAC WhatsApp */}
      <Card className="mb-8 bg-gradient-to-r from-green-500 to-emerald-600 border-none shadow-lg">
        <CardContent className="p-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                <MessageCircle className="w-6 h-6 text-green-600" />
              </div>
              <div className="text-white">
                <h3 className="text-xl font-bold mb-1">Precisa de ajuda com suas cargas?</h3>
                <p className="text-green-100">
                  Fale com nosso assistente virtual no WhatsApp - Atendimento 24/7
                </p>
              </div>
            </div>
            <Button
              onClick={() => {
                // Assuming `base44` is globally available or imported elsewhere if needed
                // For a functional example, you might need to mock or define `base44`
                const whatsappURL = window.base44?.agents?.getWhatsAppConnectURL('sac');
                if (whatsappURL) {
                  window.open(whatsappURL, '_blank');
                } else {
                  console.warn("base44.agents.getWhatsAppConnectURL is not defined.");
                  // Fallback or error handling
                  window.open('https://wa.me/YOUR_PHONE_NUMBER?text=Olá,%20preciso%20de%20ajuda%20com%20minhas%20cargas.', '_blank');
                }
              }}
              size="lg"
              className="bg-white text-green-600 hover:bg-green-50 font-bold shadow-lg"
            >
              <MessageCircle className="w-5 h-5 mr-2" />
              Abrir WhatsApp
            </Button>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
