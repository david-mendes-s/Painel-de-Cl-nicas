import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Send,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Mail,
  Sparkles,
  Code,
  Type,
} from "lucide-react";
import { sendEmail } from "@/lib/api";

interface EmailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  toEmail: string;
  clinicaNome: string;
  clinicaCidade?: string;
}

const getEmailTemplates = (clinicaNome: string, clinicaCidade: string) => {
  const cidadeDisplay = clinicaCidade || "sua região";
  
  return [
    {
      label: "Apresentação Comercial",
      subject: `Tentei encontrar a ${clinicaNome} e não apareceu`,
      body: `Olá, ${clinicaNome}, tudo bem?

Estou entrando em contato porque o setor odontológico é hoje um dos mais pesquisados em todo o Ceará, com milhares de pessoas buscando tratamentos agora mesmo. No entanto, percebi algo crítico: apesar dessa alta demanda, o setor em ${cidadeDisplay} está extremamente concorrido e a ${clinicaNome} pode não estar sendo encontrada por quem mais precisa de vocês.

O motivo é simples, essa massa de pacientes não está mais apenas esperando indicações; eles estão indo direto para o Google. É por isso que ele se tornou o canal de aquisição mais qualificado que existe. Diferente das redes sociais, onde a pessoa está apenas passando o tempo, no Google o paciente está buscando ativamente quem pode resolver o seu problema. Ele busca a solução imediata.

O ponto crítico é que, sem uma estrutura profissional aparecendo no topo das buscas, a sua clínica se torna invisível para esse paciente. Na prática, ele acaba agendando com o concorrente que aparece primeiro.

Ter uma presença digital sólida e otimizada é o que garante uma demanda constante de novos agendamentos, sem que você precise depender exclusivamente de indicações ou de sorte.

Se você sente que a clínica poderia estar recebendo um volume maior de pacientes qualificados através da internet, gostaria de te mostrar como inverter esse jogo.
Não quero te tomar tempo com apresentações longas por aqui. Se fizer sentido para o momento da sua clínica, me dê um "Oi" no WhatsApp clicando no botão abaixo. Podemos conversar rapidamente sobre como colocar sua estrutura no topo das buscas:

<a href="https://api.whatsapp.com/send/?phone=558591641374&text&type=phone_number&app_absent=0">Fale conosco pelo WhatsApp</a>

Aguardo seu retorno,
Atenciosamente, [SEU NOME] | DevBoost`,
    },
  {
    label: "Follow-up",
    subject: "Ainda podemos ajudar sua clínica",
    body: `Olá,

Entrei em contato recentemente sobre nossas soluções para clínicas odontológicas e gostaria de saber se teve a oportunidade de avaliar nossa proposta.

Temos ajudado diversas clínicas na região a melhorar seus processos e aumentar o faturamento.

Fico à disposição para tirar qualquer dúvida ou agendar uma demonstração gratuita.

Atenciosamente,`,
  },
  {
    label: "Promoção",
    subject: "Condição especial para sua clínica",
    body: `Olá,

Tenho uma condição especial para novos clientes que gostaria de compartilhar com você.

Neste mês, estamos oferecendo:

✅ Implantação gratuita
✅ 30 dias para testar sem compromisso
✅ Suporte prioritário nos primeiros 3 meses

Essa é uma oportunidade por tempo limitado. Posso te enviar mais detalhes?

Abraços,`,
  },
  ];
};

export function EmailDialog({
  open,
  onOpenChange,
  toEmail,
  clinicaNome,
  clinicaCidade,
}: EmailDialogProps) {
  const [to, setTo] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [senderName, setSenderName] = useState("");
  const [isHtml, setIsHtml] = useState(false);
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // Sync 'to' field and reset form whenever the dialog opens or target changes
  useEffect(() => {
    if (open) {
      setTo(toEmail);
      setResult(null);
      setSubject("");
      setBody("");
    }
  }, [open, toEmail]);

  const templates = getEmailTemplates(clinicaNome, clinicaCidade || "");

  const handleTemplateSelect = (template: { subject: string; body: string }) => {
    setSubject(template.subject);
    setBody(template.body);
  };

  const handleSend = async () => {
    if (!to || !subject || !body) return;

    setSending(true);
    setResult(null);

    try {
      const response = await sendEmail({
        to,
        subject,
        body,
        clinicaNome,
        senderName: senderName || undefined,
        isHtml,
      });

      setResult({
        type: "success",
        message: response.message || "Email enviado com sucesso!",
      });

      // Limpa o formulário após sucesso
      setTimeout(() => {
        setSubject("");
        setBody("");
      }, 2000);
    } catch (err) {
      setResult({
        type: "error",
        message:
          err instanceof Error ? err.message : "Erro ao enviar email",
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl w-[95vw] md:w-[80vw] max-h-[90vh] overflow-y-auto overflow-x-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <Mail className="h-5 w-5 text-blue-500" />
            Enviar Email
          </DialogTitle>
          <DialogDescription>
            Envie um email para{" "}
            <span className="font-semibold text-foreground">
              {clinicaNome}
            </span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {/* Templates rápidos */}
          <div>
            <label className="text-xs text-muted-foreground mb-2 block font-medium">
              <Sparkles className="h-3 w-3 inline mr-1" />
              Templates Rápidos
            </label>
            <div className="flex flex-wrap gap-2">
              {templates.map((t) => (
                <Button
                  key={t.label}
                  variant="outline"
                  size="sm"
                  className="text-xs h-7"
                  onClick={() => handleTemplateSelect(t)}
                >
                  {t.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Destinatário */}
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">
              Para
            </label>
            <Input
              type="email"
              placeholder="email@clinica.com"
              value={to}
              onChange={(e) => setTo(e.target.value)}
            />
          </div>

          {/* Nome do remetente */}
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">
              Seu Nome (aparece na assinatura)
            </label>
            <Input
              placeholder="Ex: João Silva"
              value={senderName}
              onChange={(e) => setSenderName(e.target.value)}
            />
          </div>

          {/* Assunto */}
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">
              Assunto
            </label>
            <Input
              placeholder="Assunto do email..."
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
          </div>

          {/* Corpo */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs text-muted-foreground">
                Mensagem
              </label>
              <div className="flex items-center gap-1 rounded-lg border border-border p-0.5">
                <button
                  type="button"
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                    !isHtml
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                  onClick={() => setIsHtml(false)}
                >
                  <Type className="h-3 w-3" />
                  Texto
                </button>
                <button
                  type="button"
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                    isHtml
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                  onClick={() => setIsHtml(true)}
                >
                  <Code className="h-3 w-3" />
                  HTML
                </button>
              </div>
            </div>
            {isHtml && (
              <p className="text-xs text-amber-500 mb-2 flex items-center gap-1">
                <Code className="h-3 w-3" />
                Modo HTML ativo — o conteúdo será injetado diretamente no template.
              </p>
            )}
            <Textarea
              placeholder={
                isHtml
                  ? '<h2>Olá!</h2>\n<p>Seu conteúdo <b>HTML</b> aqui...</p>'
                  : "Escreva sua mensagem..."
              }
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={10}
              className={`resize-y min-h-[200px] ${
                isHtml ? "font-mono text-xs" : ""
              }`}
            />
          </div>

          {/* Resultado */}
          {result && (
            <div
              className={`flex items-center gap-2 text-sm rounded-lg px-4 py-3 ${
                result.type === "success"
                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                  : "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20"
              }`}
            >
              {result.type === "success" ? (
                <CheckCircle2 className="h-4 w-4 shrink-0" />
              ) : (
                <AlertCircle className="h-4 w-4 shrink-0" />
              )}
              {result.message}
            </div>
          )}

          {/* Ações */}
          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSend}
              disabled={sending || !to || !subject || !body}
              className="gap-2"
            >
              {sending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              {sending ? "Enviando..." : "Enviar Email"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
