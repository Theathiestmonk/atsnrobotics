import nodemailer from "nodemailer";

export function getEmailDeliveryFailure(error: unknown) {
  const code =
    typeof error === "object" && error !== null && "code" in error && typeof error.code === "string"
      ? error.code
      : undefined;
  const responseCode =
    typeof error === "object" &&
    error !== null &&
    "responseCode" in error &&
    typeof error.responseCode === "number"
      ? error.responseCode
      : undefined;

  if (code === "EAUTH" || responseCode === 535) {
    return {
      status: 502,
      code,
      responseCode,
      message:
        "Gmail rejected the SMTP login. Check that SMTP_USER is the Gmail account for the app password, set SMTP_PASS to a current Google app password (not your Gmail password), then restart the server.",
    };
  }

  return {
    status: 500,
    code,
    responseCode,
    message: "Email delivery failed. Check the SMTP settings and server logs, then try again.",
  };
}

export function createSmtpTransport() {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
  const port = Number(SMTP_PORT);

  if (!SMTP_HOST || !Number.isInteger(port) || port <= 0 || !SMTP_USER || !SMTP_PASS) {
    return {
      error:
        "Email delivery is not configured. Add SMTP settings to the repository-root .env.local file and restart the server.",
    } as const;
  }

  return {
    transporter: nodemailer.createTransport({
      host: SMTP_HOST,
      port,
      secure: process.env.SMTP_SECURE === "true",
      auth: { user: SMTP_USER, pass: SMTP_PASS },
    }),
  } as const;
}
