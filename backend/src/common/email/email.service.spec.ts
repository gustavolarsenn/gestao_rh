// src/common/email/email.service.spec.ts
import { Logger } from '@nestjs/common';

// Isso é hoisted, mas aqui não tem factory usando variável externa
jest.mock('nodemailer');

import * as nodemailer from 'nodemailer';
import { EmailService } from './email.service';

describe('EmailService', () => {
  let emailService: EmailService;
  let loggerWarnSpy: jest.SpyInstance;
  let loggerErrorSpy: jest.SpyInstance;

  const OLD_ENV = process.env;
  const sendMailMock = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...OLD_ENV };

    // configura o createTransport para devolver um objeto com sendMail mockado
    (nodemailer.createTransport as unknown as jest.Mock).mockReturnValue({
      sendMail: sendMailMock,
    });

    loggerWarnSpy = jest.spyOn(Logger.prototype, 'warn').mockImplementation();
    loggerErrorSpy = jest.spyOn(Logger.prototype, 'error').mockImplementation();
  });

  afterAll(() => {
    process.env = OLD_ENV;
  });

  it('deve criar o transporter com service "gmail" e auth baseado nas env vars', () => {
    process.env.EMAIL_SENDER = 'test@gmail.com';
    process.env.EMAIL_SENDER_PASSWORD = 'super-secret';

    emailService = new EmailService();

    expect(nodemailer.createTransport).toHaveBeenCalledTimes(1);
    expect(nodemailer.createTransport).toHaveBeenCalledWith({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_SENDER,
        pass: process.env.EMAIL_SENDER_PASSWORD,
      },
    });
  });

  it('não deve enviar e-mail se EMAIL_SENDER não estiver configurado e deve logar um warn', async () => {
    delete process.env.EMAIL_SENDER;

    emailService = new EmailService();

    await emailService.sendPasswordResetEmail(
      'user@test.com',
      'https://example.com/reset',
    );

    expect(loggerWarnSpy).toHaveBeenCalledWith(
      'EMAIL_SENDER não configurado. E-mail de recuperação não será enviado.',
    );
    expect(sendMailMock).not.toHaveBeenCalled();
  });

  it('deve chamar sendMail com os dados corretos quando EMAIL_SENDER estiver configurado', async () => {
    process.env.EMAIL_SENDER = 'no-reply@orgkpi.com';
    process.env.EMAIL_SENDER_PASSWORD = 'pwd';

    emailService = new EmailService();

    const to = 'user@test.com';
    const resetLink = 'https://app.orgkpi.com/reset?token=abc123';

    await emailService.sendPasswordResetEmail(to, resetLink);

    expect(sendMailMock).toHaveBeenCalledTimes(1);
    const mailOptions = sendMailMock.mock.calls[0][0];

    expect(mailOptions.from).toBe(`"OrgKPI" <${process.env.EMAIL_SENDER}>`);
    expect(mailOptions.to).toBe(to);
    expect(mailOptions.subject).toBe('Recuperação de senha - OrgKPI');
    expect(mailOptions.html).toContain(resetLink);
    expect(mailOptions.html).toContain(
      'Recebemos uma solicitação para redefinir sua senha no OrgKPI.',
    );
  });

  it('deve logar erro quando sendMail lançar exceção, sem propagar o erro', async () => {
    process.env.EMAIL_SENDER = 'no-reply@orgkpi.com';
    process.env.EMAIL_SENDER_PASSWORD = 'pwd';

    emailService = new EmailService();

    sendMailMock.mockRejectedValueOnce(new Error('SMTP error'));

    await expect(
      emailService.sendPasswordResetEmail(
        'user@test.com',
        'https://example.com/reset',
      ),
    ).resolves.toBeUndefined();

    expect(loggerErrorSpy).toHaveBeenCalledTimes(1);
    expect(loggerErrorSpy.mock.calls[0][0]).toBe(
      'Erro ao enviar e-mail de recuperação',
    );
    expect(loggerErrorSpy.mock.calls[0][1]).toBeInstanceOf(Error);
  });
});
