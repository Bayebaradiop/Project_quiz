import { createTransporter, emailConfig } from '../config/email.config';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export class EmailService {
  private transporter;

  constructor() {
    this.transporter = createTransporter();
  }

  async sendEmail(options: EmailOptions): Promise<boolean> {
    try {
      await this.transporter.sendMail({
        from: `"${emailConfig.from.name}" <${emailConfig.from.email}>`,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text || options.html.replace(/<[^>]*>/g, ''), // Fallback text
      });
      return true;
    } catch (error) {
      console.error('Erreur lors de l\'envoi de l\'email:', error);
      return false;
    }
  }

  async sendInvitationEmail(
    email: string,
    codeAcces: string,
    quizTitle: string,
    invitedBy: string
  ): Promise<boolean> {
    const subject = `Invitation à participer au quiz: ${quizTitle}`;
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #4CAF50; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f9f9f9; }
          .code { background-color: #fff; border: 2px dashed #4CAF50; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 3px; margin: 20px 0; }
          .button { display: inline-block; background-color: #4CAF50; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; color: #777; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎯 Invitation à un Quiz</h1>
          </div>
          <div class="content">
            <p>Bonjour,</p>
            <p><strong>${invitedBy}</strong> vous invite à participer au quiz :</p>
            <h2 style="color: #4CAF50;">${quizTitle}</h2>
            
            <p>Utilisez le code d'accès suivant pour rejoindre le quiz :</p>
            <div class="code">${codeAcces}</div>
            
            <p style="text-align: center;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/quiz/join?code=${codeAcces}" class="button">
                Rejoindre le Quiz
              </a>
            </p>
            
            <p><strong>Note :</strong> Ce code d'accès est unique et peut être utilisé une seule fois.</p>
          </div>
          <div class="footer">
            <p>© 2024 QuizLab - Plateforme de Quiz Interactifs</p>
            <p>Cet email a été envoyé automatiquement, merci de ne pas y répondre.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail({ to: email, subject, html });
  }

  async sendReminderEmail(
    email: string,
    codeAcces: string,
    quizTitle: string
  ): Promise<boolean> {
    const subject = `Rappel: Invitation au quiz ${quizTitle}`;
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #FF9800; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f9f9f9; }
          .code { background-color: #fff; border: 2px dashed #FF9800; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 3px; margin: 20px 0; }
          .button { display: inline-block; background-color: #FF9800; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; color: #777; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>⏰ Rappel - Invitation à un Quiz</h1>
          </div>
          <div class="content">
            <p>Bonjour,</p>
            <p>Nous vous rappelons que vous avez été invité à participer au quiz :</p>
            <h2 style="color: #FF9800;">${quizTitle}</h2>
            
            <p>Votre code d'accès :</p>
            <div class="code">${codeAcces}</div>
            
            <p style="text-align: center;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/quiz/join?code=${codeAcces}" class="button">
                Rejoindre le Quiz Maintenant
              </a>
            </p>
            
            <p><strong>N'oubliez pas :</strong> Votre invitation vous attend !</p>
          </div>
          <div class="footer">
            <p>© 2024 QuizLab - Plateforme de Quiz Interactifs</p>
            <p>Cet email a été envoyé automatiquement, merci de ne pas y répondre.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail({ to: email, subject, html });
  }
}
