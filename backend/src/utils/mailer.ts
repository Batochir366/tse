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

export const sendOtpEmail = async (to: string, otp: string) => {
  await transporter.sendMail({
    from: `"TSE Academy" <${process.env.SMTP_USER}>`,
    to,
    subject: "Нууц үг сэргээх код",
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 32px;">
        <h2 style="color: #1a1a2e; margin-bottom: 16px;">Нууц үг сэргээх</h2>
        <p style="color: #555; font-size: 15px;">Таны баталгаажуулах код:</p>
        <div style="background: #f4f4f8; border-radius: 12px; padding: 24px; text-align: center; margin: 24px 0;">
          <span style="font-size: 32px; font-weight: 700; letter-spacing: 10px; color: #4F46E5;">${otp}</span>
        </div>
        <p style="color: #888; font-size: 13px;">Энэ код 5 минутын дотор хүчинтэй.</p>
      </div>
    `,
  });
};
