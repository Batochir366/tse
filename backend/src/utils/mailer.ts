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

export const sendCourseAccessExpiringReminderEmail = async (
  to: string,
  displayName: string,
  courseLines: string[],
): Promise<void> => {
  const list = courseLines
    .map(
      (line) =>
        `<li style="margin:10px 0;color:#333;font-size:15px;">${line}</li>`,
    )
    .join("");
  await transporter.sendMail({
    from: `"TSE Academy" <${process.env.SMTP_USER}>`,
    to,
    subject: "Курсын эрх дуусахад 7 хоног үлдлээ",
    html: `
      <div style="font-family: sans-serif; max-width: 520px; margin: 0 auto; padding: 32px;">
        <h2 style="color: #1a1a2e; margin-bottom: 12px;">Сайн байна уу, ${displayName}</h2>
        <p style="color: #555; font-size: 15px; line-height: 1.5;">
          Дараах курсын эрхийн хугацаа <strong>7 хоногийн дотор</strong> дуусна. Шаардлагатай бол курсаа үргэлжлүүлэн үзээрэй.
        </p>
        <ul style="list-style: none; padding: 0; margin: 24px 0;">
          ${list}
        </ul>
        <p style="color: #888; font-size: 13px;">Асуулттай бол бидэнтэй холбогдоно уу.</p>
      </div>
    `,
  });
};

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
