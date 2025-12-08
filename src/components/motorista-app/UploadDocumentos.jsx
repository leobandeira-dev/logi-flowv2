import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Camera,
  Upload,
  X,
  Loader2,
  FileText,
  Image as ImageIcon,
  CheckCircle,
  Trash2
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const tiposDocumento = [
  { value: "canhoto", label: "Canhoto", icon: FileText },
  { value: "cte", label: "CT-e", icon: FileText },
  { value: "nota_fiscal", label: "Nota Fiscal", icon: FileText },
  { value: "comprovante_entrega", label: "Comprovante de Entrega", icon: FileText },
  { value: "foto_carga", label: "Foto da Carga", icon: ImageIcon },
  { value: "dano", label: "Foto de Dano", icon: ImageIcon },
  { value: "outro", label: "Outro", icon: FileText }
];

export default function UploadDocumentos({ open, onClose, viagem }) {
  const [documentos, setDocumentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [tipoSelecionado, setTipoSelecionado] = useState("");
  const [descricao, setDescricao] = useState("");
  const fileInputRef = React.useRef(null);
  const cameraInputRef = React.useRef(null);

  useEffect(() => {
    if (open && viagem) {
      loadDocumentos();
    }
  }, [open, viagem?.id]);

  const loadDocumentos = async () => {
    setLoading(true);
    try {
      const docs = await base44.entities.DocumentoViagem.filter(
        { ordem_id: viagem.id },
        "-created_date"
      );
      setDocumentos(docs);
    } catch (error) {
      console.error("Erro ao carregar documentos:", error);
    } finally {
      setLoading(false);
    }
  };

  const getLocation = () => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve({ latitude: null, longitude: null });
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        },
        () => {
          resolve({ latitude: null, longitude: null });
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      );
    });
  };

  const handleUpload = async (file) => {
    if (!file || !tipoSelecionado) {
      toast.error("Selecione o tipo do documento");
      return;
    }

    setUploading(true);
    try {
      const user = await base44.auth.me();
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      const location = await getLocation();

      await base44.entities.DocumentoViagem.create({
        ordem_id: viagem.id,
        tipo: tipoSelecionado,
        arquivo_url: file_url,
        descricao: descricao || undefined,
        enviado_por: user.id,
        latitude: location.latitude,
        longitude: location.longitude
      });

      toast.success("Documento enviado com sucesso!");
      setTipoSelecionado("");
      setDescricao("");
      await loadDocumentos();
    } catch (error) {
      console.error("Erro ao fazer upload:", error);
      toast.error("Erro ao enviar documento");
    } finally {
      setUploading(false);
    }
  };

  const handleFileSelect = (event) => {
    const file = event.target.files?.[0];
    if (file) handleUpload(file);
  };

  const handleDeleteDocumento = async (docId) => {
    if (!confirm("Deseja realmente excluir este documento?")) return;

    try {
      await base44.entities.DocumentoViagem.delete(docId);
      toast.success("Documento excluído");
      await loadDocumentos();
    } catch (error) {
      console.error("Erro ao excluir documento:", error);
      toast.error("Erro ao excluir documento");
    }
  };

  const getTipoLabel = (tipo) => {
    return tiposDocumento.find(t => t.value === tipo)?.label || tipo;
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5 text-blue-600" />
              Documentos da Viagem
            </DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8 rounded-full"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
          <p className="text-sm text-gray-500">
            {viagem.numero_carga || `#${viagem.id.slice(-6)}`} - {viagem.cliente}
          </p>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Upload Section */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 bg-gray-50">
            <div className="space-y-4">
              <div>
                <Label>Tipo de Documento *</Label>
                <Select value={tipoSelecionado} onValueChange={setTipoSelecionado}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {tiposDocumento.map((tipo) => (
                      <SelectItem key={tipo.value} value={tipo.value}>
                        <div className="flex items-center gap-2">
                          <tipo.icon className="w-4 h-4" />
                          {tipo.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Descrição (opcional)</Label>
                <Textarea
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                  placeholder="Adicione observações sobre o documento..."
                  rows={2}
                />
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,application/pdf"
                onChange={handleFileSelect}
                className="hidden"
              />
              
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFileSelect}
                className="hidden"
              />

              <div className="flex gap-2">
                <Button
                  onClick={() => cameraInputRef.current?.click()}
                  disabled={uploading || !tipoSelecionado}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Camera className="w-4 h-4 mr-2" />
                      Tirar Foto
                    </>
                  )}
                </Button>
                
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading || !tipoSelecionado}
                  variant="outline"
                  className="flex-1"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Galeria
                </Button>
              </div>
            </div>
          </div>

          {/* Documents List */}
          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Documentos Enviados ({documentos.length})
            </h3>
            
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
              </div>
            ) : documentos.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <FileText className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p>Nenhum documento enviado ainda</p>
              </div>
            ) : (
              <div className="space-y-2">
                {documentos.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between p-3 bg-white border rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="w-12 h-12 bg-blue-100 rounded flex items-center justify-center flex-shrink-0">
                        {doc.tipo === "foto_carga" || doc.tipo === "dano" ? (
                          <ImageIcon className="w-6 h-6 text-blue-600" />
                        ) : (
                          <FileText className="w-6 h-6 text-blue-600" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-sm truncate">{getTipoLabel(doc.tipo)}</p>
                          <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                        </div>
                        {doc.descricao && (
                          <p className="text-xs text-gray-500 truncate">{doc.descricao}</p>
                        )}
                        <p className="text-xs text-gray-400">
                          {format(new Date(doc.created_date), "dd/MM/yy HH:mm", { locale: ptBR })}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.open(doc.arquivo_url, "_blank")}
                      >
                        <ImageIcon className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteDocumento(doc.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t">
          <Button onClick={onClose} variant="outline">
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}