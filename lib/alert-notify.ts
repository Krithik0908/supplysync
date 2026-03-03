import type { Db } from "mongodb";
import nodemailer from "nodemailer";

interface MailConfigDoc {
  email: string;
  appPassword: string;
  smtpHost: string;
  smtpPort: number;
  secureSmtp: boolean;
}

export async function sendAlertNotification(db: Db, supplierKey: string, subject: string, message: string) {
  try {
    const configCollection = db.collection("mailConfigs");
    const config = await configCollection.findOne<MailConfigDoc>({ supplierKey });

    if (!config) {
      return;
    }

    const transporter = nodemailer.createTransport({
      host: config.smtpHost,
      port: config.smtpPort,
      secure: config.secureSmtp,
      auth: {
        user: config.email,
        pass: config.appPassword,
      },
    });

    await transporter.sendMail({
      from: config.email,
      to: config.email,
      subject,
      text: message,
    });
  } catch (error) {
    console.error("Alert notification email failed:", error);
  }
}
