import nodemailer from 'nodemailer';

export const emailConfig = {
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true', // false for TLS
  auth: {
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASSWORD || '',
  },
  from: {
    email: process.env.SMTP_FROM_EMAIL || '',
    name: process.env.SMTP_FROM_NAME || 'QuizLab',
  },
};

// Créer le transporteur nodemailer
export const createTransporter = () => {
  return nodemailer.createTransport({
    host: emailConfig.host,
    port: emailConfig.port,
    secure: emailConfig.secure,
    auth: emailConfig.auth,
  });
};
