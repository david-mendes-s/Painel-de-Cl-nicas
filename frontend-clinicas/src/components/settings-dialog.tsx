import { useState } from "react";
import { Download, Loader2, CheckCircle, XCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const AVAILABLE_FIELDS = [
  { id: "id", label: "ID" },
  { id: "cnpj", label: "CNPJ" },
  { id: "razao_social", label: "Razão Social" },
  { id: "nome_fantasia", label: "Nome Fantasia" },
  { id: "email", label: "Email" },
  { id: "telefone1", label: "Telefone 1" },
  { id: "telefone2", label: "Telefone 2" },
  { id: "socio_nome", label: "Nome do Sócio" },
  { id: "municipio", label: "Município" },
  { id: "uf", label: "UF" },
  { id: "bairro", label: "Bairro" },
  { id: "status_prospeccao", label: "Status" },
  { id: "data_abertura", label: "Data de Abertura" },
  { id: "natureza_juridica", label: "Natureza Jurídica" },
  { id: "cnae_principal", label: "CNAE Principal" },
  { id: "responsavel", label: "Responsável" },
  { id: "canal_contato", label: "Canal de Contato" },
] as const;

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filters: {
    search: string;
    statusFilter: string;
    municipioFilter: string;
    idadeCnpjFilter: string;
    comEmail: boolean;
  };
}

export function SettingsDialog({ open, onOpenChange, filters }: SettingsDialogProps) {
  // Por padrao, marcar algumas essenciais ou todas
  const [selectedFields, setSelectedFields] = useState<string[]>(
    AVAILABLE_FIELDS.map((f) => f.id)
  );
  
  const [isExporting, setIsExporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const toggleField = (id: string) => {
    setSelectedFields((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
    );
  };

  const selectAll = () => setSelectedFields(AVAILABLE_FIELDS.map((f) => f.id));
  const deselectAll = () => setSelectedFields([]);

  const handleExport = async () => {
    if (selectedFields.length === 0) {
      setMessage({ type: "error", text: "Selecione ao menos um campo para exportar." });
      return;
    }

    setIsExporting(true);
    setProgress(10);
    setMessage(null);

    try {
      const API_BASE = import.meta.env.VITE_API_URL || "";
      const payload = {
        fields: selectedFields,
        filters: {
          search: filters.search !== "all" ? filters.search : "",
          municipio: filters.municipioFilter !== "all" ? filters.municipioFilter : "",
          status: filters.statusFilter !== "all" ? filters.statusFilter : "",
          idadeCnpj: filters.idadeCnpjFilter !== "all" ? filters.idadeCnpjFilter : "",
          comEmail: filters.comEmail,
        },
      };

      // Falso progresso para dar feedback visual rapido
      const progressInterval = setInterval(() => {
        setProgress((p) => (p < 85 ? p + 15 : p));
      }, 500);

      const res = await fetch(`${API_BASE}/clinicas/export`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      clearInterval(progressInterval);
      setProgress(95);

      if (!res.ok) {
        throw new Error("Erro ocorreu na exportação de dados pelo servidor.");
      }

      // Download the blob
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `clinicas_export_${new Date().getTime()}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      setProgress(100);
      setMessage({ type: "success", text: "Download concluído com sucesso!" });

      // Fechar e limpar automaticamente apos algum tempo
      setTimeout(() => {
        setIsExporting(false);
        setProgress(0);
        setMessage(null);
        // Opcional: fechar o modal. Mas vamos dxar o usuario fechar ou ver a msg 
      }, 3000);

    } catch (error) {
      setIsExporting(false);
      setProgress(0);
      setMessage({
        type: "error",
        text: "Houve um erro ao tentar exportar o CSV. Tente novamente.",
      });
      console.error(error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] flex flex-col gap-0 p-0 overflow-hidden">
        <div className="p-6 pb-2">
          <DialogHeader>
            <DialogTitle>Configurações de Exportação</DialogTitle>
            <DialogDescription>
              Selecione as colunas desejadas para baixar como CSV. 
              Os filtros aplicados atualmente na tabela principal também serão considerados.
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="px-6 py-4 flex-1 overflow-y-auto max-h-[50vh]">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-semibold text-muted-foreground">
              Campos Selecionados ({selectedFields.length})
            </span>
            <div className="space-x-2">
              <Button variant="ghost" size="sm" onClick={selectAll} className="h-8 text-xs">
                Marcar Todos
              </Button>
              <Button variant="ghost" size="sm" onClick={deselectAll} className="h-8 text-xs">
                Desmarcar Todos
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {AVAILABLE_FIELDS.map((field) => (
              <label
                key={field.id}
                className="flex items-center gap-2 text-sm font-medium leading-none cursor-pointer p-2 rounded-md hover:bg-muted/50 border border-transparent has-checked:border-primary/20 has-checked:bg-primary/5 transition-colors"
              >
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-input text-primary focus:ring-primary accent-primary"
                  checked={selectedFields.includes(field.id)}
                  onChange={() => toggleField(field.id)}
                  disabled={isExporting}
                />
                <span className="truncate">{field.label}</span>
              </label>
            ))}
          </div>

          {/* Avisos */}
          {message && (
            <div
              className={`mt-6 flex items-center gap-2 p-3 rounded-lg text-sm font-medium animate-in fade-in slide-in-from-bottom-2 ${
                message.type === "success"
                  ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400"
                  : "bg-red-500/15 text-red-700 dark:text-red-400"
              }`}
            >
              {message.type === "success" ? (
                <CheckCircle className="w-5 h-5" />
              ) : (
                <XCircle className="w-5 h-5" />
              )}
              {message.text}
            </div>
          )}
        </div>

        <div className="p-6 pt-4 bg-muted/30 border-t border-border flex flex-col gap-3">
          {/* Progress Bar */}
          {isExporting && (
            <div className="w-full space-y-1">
              <div className="flex justify-between text-xs text-muted-foreground font-medium">
                <span>Gerando CSV...</span>
                <span>{progress}%</span>
              </div>
              <div className="h-2 w-full bg-border rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-300 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 w-full">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isExporting}
            >
              Fechar
            </Button>
            <Button
              onClick={handleExport}
              disabled={isExporting || selectedFields.length === 0}
              className="gap-2"
            >
              {isExporting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Exportando...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  Baixar CSV
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
