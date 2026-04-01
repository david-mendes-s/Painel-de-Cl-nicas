import { useEffect, useState } from "react";
import { EmailDialog } from "@/components/email-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StatusBadge } from "@/components/status-badge";
import {
  Building2,
  Mail,
  Phone,
  MapPin,
  User,
  Save,
  Send,
  Loader2,
  Calendar,
  FileText,
} from "lucide-react";
import type { Clinica } from "@/lib/api";
import { updateClinica, STATUS_OPTIONS } from "@/lib/api";

interface ClinicaDialogProps {
  clinica: Clinica | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdated: () => void;
}

export function ClinicaDialog({
  clinica,
  open,
  onOpenChange,
  onUpdated,
}: ClinicaDialogProps) {
  const [status, setStatus] = useState("");
  const [canal, setCanal] = useState("");
  const [anotacoes, setAnotacoes] = useState("");
  const [responsavel, setResponsavel] = useState("");
  const [saving, setSaving] = useState(false);
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);

  // Sync form state when a new clinica is selected or dialog opens
  useEffect(() => {
    if (open && clinica) {
      setStatus(clinica.status_prospeccao || "novo");
      setCanal(clinica.canal_contato || "");
      setAnotacoes(clinica.anotacoes || "");
      setResponsavel(clinica.responsavel || "");
    }
  }, [open, clinica]);

  if (!clinica) return null;

  const handleSave = async () => {
    if (!clinica) return;
    setSaving(true);
    try {
      await updateClinica(clinica.id, {
        status_prospeccao: status,
        canal_contato: canal || undefined,
        anotacoes: anotacoes || undefined,
        responsavel: responsavel || undefined,
        data_ultimo_contato: new Date().toISOString(),
      });
      onUpdated();
      onOpenChange(false);
    } catch (err) {
      console.error("Erro ao salvar:", err);
    } finally {
      setSaving(false);
    }
  };

  const endereco = [
    clinica.tipo_logradouro,
    clinica.logradouro,
    clinica.numero ? `Nº ${clinica.numero}` : null,
    clinica.complemento,
    clinica.bairro,
    clinica.cep ? `CEP ${clinica.cep}` : null,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl w-[95vw] md:w-[80vw] max-h-[90vh] overflow-y-auto overflow-x-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-lg">
            <Building2 className="h-5 w-5 text-primary" />
            {clinica.nome_fantasia || clinica.razao_social || "Clínica"}
          </DialogTitle>
          <DialogDescription className="flex items-center gap-2 flex-wrap">
            <span className="font-mono text-xs">
              CNPJ: {clinica.cnpj_formatado || clinica.cnpj}
            </span>
            {clinica.municipio && (
              <>
                <span>•</span>
                <span className="flex items-center gap-1 text-xs">
                  <MapPin className="h-3 w-3" />
                  {clinica.municipio}{clinica.uf ? ` - ${clinica.uf}` : ""}
                </span>
              </>
            )}
            <span>•</span>
            <StatusBadge status={clinica.status_prospeccao} />
          </DialogDescription>
        </DialogHeader>

        {/* Info da Clínica */}
        <div className="space-y-4 pt-2">
          {/* Contato */}
          <div>
            <h4 className="text-sm font-semibold mb-2 text-muted-foreground">
              Informações de Contato
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {clinica.email && (
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-blue-500" />
                  <a
                    href={`mailto:${clinica.email}`}
                    className="underline underline-offset-2 hover:text-primary truncate"
                  >
                    {clinica.email}
                  </a>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 text-xs text-blue-500 hover:text-blue-600 gap-1"
                    onClick={() => setEmailDialogOpen(true)}
                  >
                    <Send className="h-3 w-3" />
                    Enviar
                  </Button>
                </div>
              )}
              {clinica.telefone1 && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-emerald-500" />
                  <a
                    href={`tel:${clinica.telefone1}`}
                    className="underline underline-offset-2 hover:text-primary"
                  >
                    {clinica.telefone1}
                  </a>
                </div>
              )}
              {clinica.telefone2 && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-emerald-500/60" />
                  <span>{clinica.telefone2}</span>
                </div>
              )}
              {clinica.socio_nome && (
                <div className="flex items-center gap-2 text-sm">
                  <User className="h-4 w-4 text-amber-500" />
                  <span>
                    {clinica.socio_nome}
                    {clinica.socio_qualificacao &&
                      ` (${clinica.socio_qualificacao})`}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Endereço */}
          {endereco && (
            <div>
              <h4 className="text-sm font-semibold mb-2 text-muted-foreground">
                Endereço
              </h4>
              <div className="flex items-start gap-2 text-sm">
                <MapPin className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(endereco)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline hover:text-blue-500 transition-colors"
                  title="Abrir no Google Maps"
                >
                  {endereco}
                </a>
              </div>
            </div>
          )}

          {/* Info da empresa */}
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-muted-foreground">
            {clinica.porte && (
              <div>
                <span className="font-medium">Porte:</span> {clinica.porte}
              </div>
            )}
            {clinica.situacao_cadastral && (
              <div>
                <span className="font-medium">Situação:</span>{" "}
                {clinica.situacao_cadastral}
              </div>
            )}
            {clinica.data_abertura && (
              <div>
                <span className="font-medium">Abertura:</span>{" "}
                {new Date(clinica.data_abertura).toLocaleDateString("pt-BR")}
              </div>
            )}
            {clinica.natureza_juridica && (
              <div>
                <span className="font-medium">Natureza:</span>{" "}
                {clinica.natureza_juridica}
              </div>
            )}
          </div>

          <Separator />

          {/* Prospecção — campos editáveis */}
          <div>
            <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" />
              Prospecção
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Status */}
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">
                  Status
                </label>
                <Select value={status} onValueChange={(v) => setStatus(v ?? "novo")}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map((s) => (
                      <SelectItem key={s.value} value={s.value}>
                        {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Canal de contato */}
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">
                  Canal de Contato
                </label>
                <Select value={canal || "none"} onValueChange={(v) => setCanal(!v || v === "none" ? "" : v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Nenhum</SelectItem>
                    <SelectItem value="telefone">Telefone</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="whatsapp">WhatsApp</SelectItem>
                    <SelectItem value="presencial">Presencial</SelectItem>
                    <SelectItem value="outro">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Responsável */}
              <div className="sm:col-span-2">
                <label className="text-xs text-muted-foreground mb-1 block">
                  Responsável
                </label>
                <Input
                  placeholder="Nome do vendedor..."
                  value={responsavel}
                  onChange={(e) => setResponsavel(e.target.value)}
                />
              </div>

              {/* Anotações */}
              <div className="sm:col-span-2">
                <label className="text-xs text-muted-foreground mb-1 block">
                  Anotações
                </label>
                <Textarea
                  placeholder="Observações sobre esta clínica..."
                  value={anotacoes}
                  onChange={(e) => setAnotacoes(e.target.value)}
                  rows={3}
                />
              </div>

              {/* Último contato */}
              {clinica.data_ultimo_contato && (
                <div className="sm:col-span-2 text-xs text-muted-foreground flex items-center gap-1.5">
                  <Calendar className="h-3 w-3" />
                  Último contato:{" "}
                  {new Date(clinica.data_ultimo_contato).toLocaleString("pt-BR")}
                </div>
              )}
            </div>
          </div>

          {/* Botão salvar */}
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={saving} className="gap-2">
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Salvar
            </Button>
          </div>
        </div>
      </DialogContent>

      {/* Email Dialog */}
      {clinica.email && (
        <EmailDialog
          open={emailDialogOpen}
          onOpenChange={setEmailDialogOpen}
          toEmail={clinica.email}
          clinicaNome={clinica.nome_fantasia || clinica.razao_social || "Clínica"}
          clinicaCidade={clinica.municipio || "sua região"}
        />
      )}
    </Dialog>
  );
}
