import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";
import ChamadoModal from "./ChamadoModal";

export default function ChamadoButton({ currentPage }) {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <Button
        onClick={() => setShowModal(true)}
        className="fixed bottom-20 right-4 sm:bottom-6 sm:right-6 z-50 rounded-full w-12 h-12 sm:w-14 sm:h-14 shadow-lg bg-blue-600 hover:bg-blue-700 transition-all hover:scale-110"
        title="Sugestões e Melhorias"
      >
        <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
      </Button>

      {showModal && (
        <ChamadoModal
          open={showModal}
          onClose={() => setShowModal(false)}
          currentPage={currentPage}
        />
      )}
    </>
  );
}