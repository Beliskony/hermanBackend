import { Router, Request, Response } from 'express';
import MailService from '../services/sendmail.service';
import { ContactFormData } from '../services/sendmail.service';

const SendContactMailrouter = Router();

SendContactMailrouter.post('/contactMail', async (req: Request, res: Response) => {
  const form: ContactFormData = req.body;

  // Validation basique
  if (!form.name || !form.email || !form.message) {
    return res.status(400).json({
      success: false,
      message: 'Champs requis manquants : name, email, message',
    });
  }

  try {
    await Promise.all([
      MailService.sendContactConfirmation(form),
      MailService.sendContactNotificationToAdmin(form),
    ]);

    return res.status(200).json({
      success: true,
      message: 'Email envoyé avec succès',
    });

  } catch (error) {
    console.error('[POST /api/contact]', error);
    return res.status(500).json({
      success: false,
      message: "Erreur serveur lors de l'envoi de l'email",
    });
  }
});

export default SendContactMailrouter;