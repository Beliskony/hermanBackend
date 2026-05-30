"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const nodemailer_1 = __importDefault(require("nodemailer"));
// ─── Config ──────────────────────────────────────────────────────────────────
const mailConfig = {
    host: process.env.MAIL_HOST || 'smtp.gmail.com',
    port: Number(process.env.MAIL_PORT) || 465,
    secure: true,
    user: process.env.MAIL_USER || '',
    password: process.env.MAIL_PASSWORD || '',
    from: `"Assistance Conseils Environnement" <${process.env.MAIL_USER}>`,
    adminTo: process.env.MAIL_ADMIN || process.env.MAIL_USER || '',
};
// ─── Couleurs urgence ─────────────────────────────────────────────────────────
const urgencyStyle = {
    urgent: { color: '#8B0000', bg: '#FCE4EC', label: 'Urgent' },
    élevé: { color: '#C0392B', bg: '#FFEBEE', label: 'Court terme' },
    moyen: { color: '#C07000', bg: '#FFF8E1', label: 'Moyen terme' },
    faible: { color: '#1A7A4A', bg: '#E8F5E9', label: 'Long terme' },
};
const DEFAULT_URGENCY = urgencyStyle['moyen'];
// ─── Service ─────────────────────────────────────────────────────────────────
class MailService {
    constructor() {
        this.transporter = nodemailer_1.default.createTransport({
            host: mailConfig.host,
            port: mailConfig.port,
            secure: mailConfig.secure,
            auth: { user: mailConfig.user, pass: mailConfig.password },
            tls: { rejectUnauthorized: false },
        });
    }
    verifyConnection() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.transporter.verify();
                console.log('[MailService] Connexion SMTP OK');
                return true;
            }
            catch (error) {
                console.error('[MailService] Erreur SMTP:', error);
                return false;
            }
        });
    }
    send(params) {
        return __awaiter(this, void 0, void 0, function* () {
            const options = Object.assign({ from: mailConfig.from, to: Array.isArray(params.to) ? params.to.join(', ') : params.to, subject: params.subject, html: params.html, text: params.text || this.htmlToText(params.html) }, (params.replyTo && { replyTo: params.replyTo }));
            try {
                const info = yield this.transporter.sendMail(options);
                console.log(`[MailService] Envoyé → ${params.to} | ID: ${info.messageId}`);
            }
            catch (error) {
                console.error('[MailService] Erreur envoi:', error);
                throw new Error(`Impossible d'envoyer l'email : ${error.message}`);
            }
        });
    }
    generateOTP() {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }
    // ─── 1. Confirmation client ───────────────────────────────────────────────
    sendContactConfirmation(form) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const urgency = urgencyStyle[(_a = form.urgency) === null || _a === void 0 ? void 0 : _a.toLowerCase()] || DEFAULT_URGENCY;
            yield this.send({
                to: form.email,
                replyTo: mailConfig.adminTo,
                subject: 'ACENVIRO - Nous avons bien reçu votre demande',
                html: this.wrapTemplate({
                    title: 'Demande reçue',
                    color: '#1A7A4A',
                    content: `
          <p style="font-size:15px;color:#333;">Bonjour <strong>${form.name}</strong>,</p>
          <p style="color:#555;line-height:1.7;">
            Merci pour votre message. Nous avons bien reçu votre demande
            et nous vous répondrons dans les meilleurs délais.
          </p>
          <div style="background:#F8F9FA;border-radius:8px;padding:20px 24px;margin:24px 0;">
            <p style="margin:0 0 14px;font-weight:bold;color:#1B3A5C;font-size:14px;text-transform:uppercase;letter-spacing:0.5px;">
              Récapitulatif de votre demande
            </p>
            <table style="width:100%;border-collapse:collapse;">
              ${this.infoRow('Service demandé', form.service)}
              ${this.infoRow('Entreprise', form.company || '—')}
              ${this.infoRow('Téléphone', form.phone || '—')}
            </table>
            <div style="margin-top:16px;padding:12px 16px;background:#fff;border-radius:6px;border:1px solid #E9ECEF;">
              <p style="margin:0 0 6px;font-weight:bold;color:#1B3A5C;font-size:13px;">Votre message :</p>
              <p style="margin:0;color:#555;font-size:13px;line-height:1.6;font-style:italic;">"${form.message}"</p>
            </div>
            <div style="margin-top:12px;display:inline-block;background:${urgency.bg};color:${urgency.color};padding:6px 14px;border-radius:20px;font-size:13px;font-weight:bold;">
              Niveau d'urgence : ${urgency.label}
            </div>
          </div>
          <div style="background:#E8F5E9;border-left:4px solid #1A7A4A;padding:12px 16px;border-radius:0 4px 4px 0;">
            <p style="margin:0;color:#1A7A4A;font-size:13px;line-height:1.6;">
              Un membre de notre équipe vous contactera prochainement
              à l'adresse <strong>${form.email}</strong> ou au <strong>${form.phone || 'numéro renseigné'}</strong>.
            </p>
          </div>
        `,
                    footer: 'Cet email est une confirmation automatique de réception. Ne pas répondre directement.',
                }),
            });
        });
    }
    // ─── 2. Notification admin ────────────────────────────────────────────────
    sendContactNotificationToAdmin(form) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const urgency = urgencyStyle[(_a = form.urgency) === null || _a === void 0 ? void 0 : _a.toLowerCase()] || DEFAULT_URGENCY;
            const receivedAt = new Date().toLocaleDateString('fr-FR', {
                day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit',
            });
            yield this.send({
                to: mailConfig.adminTo,
                replyTo: form.email,
                subject: `[Nouveau contact] ${form.name} — ${form.service} (${urgency.label})`,
                html: this.wrapTemplate({
                    title: 'Nouvelle demande de contact',
                    color: '#1B3A5C',
                    content: `
          <p style="font-size:15px;color:#333;">Une nouvelle demande de contact a été soumise sur le site.</p>
          <div style="text-align:center;margin:16px 0;">
            <span style="display:inline-block;background:${urgency.bg};color:${urgency.color};padding:8px 24px;border-radius:20px;font-size:15px;font-weight:bold;border:2px solid ${urgency.color};">
              Urgence : ${urgency.label}
            </span>
          </div>
          <table style="width:100%;border-collapse:collapse;margin:20px 0;">
            ${this.infoRow('Nom', form.name)}
            ${this.infoRow('Email', form.email)}
            ${this.infoRow('Téléphone', form.phone || '—')}
            ${this.infoRow('Entreprise', form.company || '—')}
            ${this.infoRow('Service', form.service)}
            ${this.infoRow('Reçu le', receivedAt)}
          </table>
          <div style="background:#F0F6FB;border-radius:8px;padding:16px 20px;margin:20px 0;">
            <p style="margin:0 0 8px;font-weight:bold;color:#1B3A5C;font-size:13px;">Message du client :</p>
            <p style="margin:0;color:#333;font-size:14px;line-height:1.7;white-space:pre-line;">${form.message}</p>
          </div>
          <div style="text-align:center;margin:28px 0;">
            <a href="mailto:${form.email}?subject=Re: Votre demande — ${form.service}"
               style="background:#2E75B6;color:#fff;padding:12px 30px;border-radius:6px;text-decoration:none;font-weight:bold;font-size:14px;">
              Répondre à ${form.name}
            </a>
          </div>
        `,
                    footer: 'Ce message a été transmis automatiquement depuis le formulaire de contact du site.',
                }),
            });
        });
    }
    // ─── 3. OTP ───────────────────────────────────────────────────────────────
    sendPasswordResetOTP(params) {
        return __awaiter(this, void 0, void 0, function* () {
            const { to, userName, otpCode, expiresIn } = params;
            const digits = otpCode.split('').map(d => `
      <td style="padding:0 4px;">
        <div style="width:48px;height:60px;line-height:60px;text-align:center;font-size:26px;font-weight:500;color:#1B3A5C;background:#EEF4FB;border:1.5px solid #2E75B6;border-radius:10px;">
          ${d}
        </div>
      </td>
    `).join('');
            yield this.send({
                to,
                subject: 'ACENVIRO - Votre code de réinitialisation',
                html: this.wrapTemplate({
                    title: 'Réinitialisation du mot de passe',
                    color: '#1B3A5C',
                    content: `
          <p style="font-size:15px;color:#333;margin:0 0 10px;">Bonjour <strong>${userName}</strong>,</p>
          <p style="font-size:14px;color:#555;line-height:1.6;margin:0 0 28px;">
            Vous avez demandé la réinitialisation de votre mot de passe.<br/>
            Saisissez le code ci-dessous dans l'application :
          </p>

          <table cellpadding="0" cellspacing="0" style="margin:0 auto 24px;">
            <tr>${digits}</tr>
          </table>

          <div style="display:table;margin:0 auto 24px;background:#F4F6F9;border:0.5px solid #DEE2E6;border-radius:20px;padding:8px 20px;">
            <p style="margin:0;font-size:13px;color:#555;">
              Ce code expire dans <strong style="color:#333;">${expiresIn}</strong>
            </p>
          </div>

          <div style="background:#FFF0F0;border-left:3px solid #C0392B;padding:12px 16px;border-radius:0 6px 6px 0;">
            <p style="margin:0;font-size:13px;color:#C0392B;line-height:1.5;">
              Si vous n'avez pas demandé cette réinitialisation, ignorez cet email. Ne partagez jamais ce code.
            </p>
          </div>
        `,
                    footer: 'Ne partagez jamais ce code avec quiconque. Notre équipe ne vous le demandera jamais.',
                }),
            });
        });
    }
    // ─── Helpers ─────────────────────────────────────────────────────────────
    infoRow(label, value) {
        return `
      <tr>
        <td style="padding:10px 16px;background:#1B3A5C;color:#fff;font-weight:bold;width:35%;font-size:13px;border-bottom:2px solid #fff;">${label}</td>
        <td style="padding:10px 16px;background:#F0F6FB;color:#1A1A2E;font-size:13px;border-bottom:2px solid #fff;">${value}</td>
      </tr>
    `;
    }
    wrapTemplate(p) {
        return `
      <!DOCTYPE html><html lang="fr">
      <head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/><title>${p.title}</title></head>
      <body style="margin:0;padding:0;background:#F4F6F9;font-family:Arial,sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#F4F6F9;padding:40px 0;">
          <tr><td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:10px;overflow:hidden;box-shadow:0 4px 16px rgba(0,0,0,0.08);">
              <tr><td style="background:${p.color};padding:28px 32px;">
                <h1 style="margin:0;color:#fff;font-size:20px;font-weight:500;">${p.title}</h1>
                <p style="margin:6px 0 0;color:rgba(255,255,255,0.6);font-size:14px;">ACENVIRO — Assistance Conseils Environnement</p>
              </td></tr>
              <tr><td style="background:#00B0A0;height:3px;"></td></tr>
              <tr><td style="padding:32px 36px;">${p.content}</td></tr>
              <tr><td style="background:#F8F9FA;padding:20px 36px;border-top:1px solid #E9ECEF;">
                <p style="margin:0;color:#6C757D;font-size:12px;text-align:center;">${p.footer}</p>
                <p style="margin:8px 0 0;color:#ADB5BD;font-size:11px;text-align:center;">© ${new Date().getFullYear()} ACENVIRO — Tous droits réservés</p>
              </td></tr>
            </table>
          </td></tr>
        </table>
      </body></html>
    `;
    }
    htmlToText(html) {
        return html
            .replace(/<br\s*\/?>/gi, '\n').replace(/<\/p>/gi, '\n\n').replace(/<[^>]+>/g, '')
            .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&nbsp;/g, ' ')
            .trim();
    }
}
exports.default = new MailService();
//# sourceMappingURL=sendmail.service.js.map