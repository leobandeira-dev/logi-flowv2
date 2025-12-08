import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { base44 } from "@/api/base44Client";
import { Upload, Loader2, User, X } from "lucide-react";

export default function PerfilFotoModal({ open, onClose, user, onSuccess }) {
  const [uploading, setUploading] = useState(false);
  const [imagemPreview, setImagemPreview] = useState(user?.foto_url || null);
  const [fotoUrl, setFotoUrl] = useState(user?.foto_url || null);

  const handleImagemChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagemPreview(reader.result);
    };
    reader.readAsDataURL(file);

    // Upload
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setFotoUrl(file_url);
    } catch (error) {
      console.error("Erro ao fazer upload:", error);
      alert("Erro ao carregar imagem");
    } finally {
      setUploading(false);
    }
  };

  const handleSalvar = async () => {
    setUploading(true);
    try {
      await base44.auth.updateMe({ foto_url: fotoUrl });
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Erro ao salvar foto:", error);
      alert("Erro ao salvar foto do perfil");
    } finally {
      setUploading(false);
    }
  };

  const handleRemoverFoto = async () => {
    setUploading(true);
    try {
      await base44.auth.updateMe({ foto_url: null });
      setImagemPreview(null);
      setFotoUrl(null);
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Erro ao remover foto:", error);
      alert("Erro ao remover foto do perfil");
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Foto de Perfil</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="flex flex-col items-center">
            {imagemPreview ? (
              <div className="relative">
                <img 
                  src={imagemPreview} 
                  alt="Preview" 
                  className="w-40 h-40 rounded-full object-cover border-4 border-blue-200 shadow-lg" 
                />
                {fotoUrl && (
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-0 right-0 h-8 w-8 rounded-full shadow-lg"
                    onClick={() => {
                      setImagemPreview(null);
                      setFotoUrl(null);
                    }}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ) : (
              <div className="w-40 h-40 rounded-full bg-gray-100 flex items-center justify-center border-4 border-gray-200">
                <User className="w-20 h-20 text-gray-400" />
              </div>
            )}
          </div>

          <div>
            <Label className="font-bold mb-2 block">Selecionar Foto</Label>
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition-colors border-gray-300 hover:bg-gray-50">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                {uploading ? (
                  <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                ) : (
                  <>
                    <Upload className="w-8 h-8 mb-2 text-gray-400" />
                    <p className="text-sm text-gray-500">
                      Clique para selecionar uma imagem
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Recomendado: foto quadrada, mínimo 200x200px
                    </p>
                  </>
                )}
              </div>
              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleImagemChange}
                disabled={uploading}
              />
            </label>
          </div>

          <div className="flex gap-3">
            {user?.foto_url && (
              <Button
                variant="outline"
                onClick={handleRemoverFoto}
                disabled={uploading}
                className="flex-1 border-2 border-red-200 text-red-600 hover:bg-red-50"
              >
                Remover Foto
              </Button>
            )}
            <Button
              onClick={handleSalvar}
              disabled={!fotoUrl || uploading}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              {uploading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                "Salvar Foto"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}