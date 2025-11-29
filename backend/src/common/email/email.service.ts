// src/common/email/email.service.ts
import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_SENDER,
        pass: process.env.EMAIL_SENDER_PASSWORD,
      },
    });
  }

  async sendPasswordResetEmail(to: string, resetLink: string) {
    if (!process.env.EMAIL_SENDER) {
      this.logger.warn(
        'EMAIL_SENDER não configurado. E-mail de recuperação não será enviado.',
      );
      return;
    }

    try {
      await this.transporter.sendMail({
        from: `"OrgKPI" <${process.env.EMAIL_SENDER}>`,
        to,
        subject: 'Recuperação de senha - OrgKPI',
        html: `
          <p>Olá,</p>
          <p>Recebemos uma solicitação para redefinir sua senha no OrgKPI.</p>
          <p>Para continuar, clique no link abaixo:</p>
          <p><a href="${resetLink}" target="_blank" rel="noopener noreferrer">
            Redefinir minha senha
          </a></p>
          <p>Se você não solicitou esta recuperação, pode ignorar este e-mail.</p>
          <p>Atenciosamente,<br/>Equipe OrgKPI</p>
        `,
      });
    } catch (error) {
      this.logger.error('Erro ao enviar e-mail de recuperação', error);
      // NÃO propagamos erro, para não revelar nada ao cliente
    }
  }
}