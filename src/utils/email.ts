import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

export async function sendVerificationEmail(email: string, token: string) {
    const verifyUrl = `${process.env.APP_URL}/api/auth/verify-email?token=${token}`;

    await transporter.sendMail({
        from: `"My App" <${process.env.SMTP_FROM}>`,
        to: email,
        subject: "Please verify your email",
        html: `
      <p>Thank you for signing up! Please <a href="${verifyUrl}">click here to verify your email</a>.</p>
      <p>If that link doesn’t work, copy & paste:</p>
      <pre>${verifyUrl}</pre>
    `,
    });
}
