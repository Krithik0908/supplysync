export type MailProvider = "gmail" | "outlook";

export function getMailProviderDefaults(provider: MailProvider) {
  if (provider === "gmail") {
    return {
      imapHost: "imap.gmail.com",
      imapPort: 993,
      smtpHost: "smtp.gmail.com",
      smtpPort: 587,
      secureSmtp: false,
    };
  }

  return {
    imapHost: "outlook.office365.com",
    imapPort: 993,
    smtpHost: "smtp.office365.com",
    smtpPort: 587,
    secureSmtp: false,
  };
}
