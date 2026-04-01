import { Router } from "express";
import { Resend } from "resend";

const router = Router();

const resend = new Resend(process.env.RESEND_API_KEY);
const EMAIL_FROM = process.env.EMAIL_FROM || "comercial@devboost.com.br";

/**
 * Gera o template HTML do email de prospecção.
 */
function buildEmailHtml(options: {
  subject: string;
  body: string;
  clinicaNome: string;
  senderName?: string;
  isHtml?: boolean;
}): string {
  const { body, isHtml } = options;

  // Se isHtml, injeta direto; senão, escapa, linkifica URLs e converte quebras de linha
  let bodyHtml = isHtml
    ? body
    : body.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  if (!isHtml) {
    // 1. Transforma botões MarkDown [BOTÃO: texto](url) e links [texto](url)
    bodyHtml = bodyHtml.replace(
      /\[([^\]]+)\]\((https?:\/\/[^\s]+)\)/g,
      (match, text, url) => {
        if (text.startsWith("BOTÃO:")) {
          const btnText = text.replace("BOTÃO:", "").trim();
          return `<div style="margin: 30px 0;"><a href="${url}" target="_blank" style="background-color: #25D366; color: #ffffff !important; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; font-size: 16px;">${btnText}</a></div>`;
        }
        return `<a href="${url}" target="_blank" style="color: #007bff; text-decoration: underline; font-weight: 500;">${text}</a>`;
      },
    );

    // 2. Transforma URLs brutas perdidas (que não viraram tag <a> acima) em links
    bodyHtml = bodyHtml.replace(
      /(^|[^="'>])(https?:\/\/[^\s<]+)/g,
      '$1<a href="$2" target="_blank" style="color: #007bff; text-decoration: underline;">$2</a>',
    );

    // 3. Converte quebras de linha em BR
    bodyHtml = bodyHtml.replace(/\n/g, "<br>");
  }

  return `<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body { margin: 0; padding: 0; background-color: #f8f9fa; font-family: 'Segoe UI', Arial, sans-serif; }
        .container { width: 100%; max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; margin-top: 20px; }
        .header { background-color: #3c3c3c; padding: 30px; text-align: center; }
        .content { padding: 40px; color: #333333; line-height: 1.6; }
        .footer { background-color: #f1f1f1; padding: 20px; text-align: center; font-size: 12px; color: #777777; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <img src="https://devboost.com.br/assets/email/logo-email.png" alt="DevBoost" width="200" style="display: block; margin: 0 auto; max-width: 100%; border: 0;" />
        </div>

        <div class="content">
            ${bodyHtml}
        </div>

        <div class="footer">
            <p>Este e-mail foi enviado por ${EMAIL_FROM}<br>
            &copy; 2026 DevBoost - Tecnologia e Performance</p>
        </div>
    </div>
</body>
</html>`;
}

/**
 * POST /email/send
 * Envia um email para uma clínica
 *
 * Body:
 *   to        - email do destinatário
 *   subject   - assunto do email
 *   body      - corpo do email (texto simples, será convertido para HTML)
 *   clinicaNome - nome da clínica (para personalização)
 *   senderName  - nome do remetente (opcional)
 */
router.post("/send", async (req, res) => {
  try {
    const { to, subject, body, clinicaNome, senderName, isHtml } = req.body;

    if (!to || !subject || !body) {
      return res.status(400).json({
        error: "Campos obrigatórios: to, subject, body",
      });
    }

    // Validação simples de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(to)) {
      return res.status(400).json({ error: "Email de destino inválido" });
    }

    const html = buildEmailHtml({
      subject,
      body,
      clinicaNome: clinicaNome || "Prezado(a)",
      senderName,
      isHtml: !!isHtml,
    });

    const { data, error } = await resend.emails.send({
      from: `DevBoost <${EMAIL_FROM}>`,
      to: [to],
      subject,
      html,
    });

    if (error) {
      console.error("Erro Resend:", error);
      return res.status(500).json({
        error: "Falha ao enviar email",
        details: error.message,
      });
    }

    console.log(`✉️  Email enviado para ${to} (ID: ${data?.id})`);

    return res.json({
      success: true,
      messageId: data?.id,
      message: `Email enviado com sucesso para ${to}`,
    });
  } catch (error) {
    console.error("Erro ao enviar email:", error);
    return res.status(500).json({
      error: "Erro interno ao enviar email",
      message: error instanceof Error ? error.message : "unknown",
    });
  }
});

export default router;
