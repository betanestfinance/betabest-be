import nodemailer from "nodemailer";

    console.log("USER:", process.env.GMAIL_USER);
    console.log("PASS:", process.env.GMAIL_PASS ? "loaded ✅" : "missing ❌");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
});

export const sendMail = async (to, subject, html) => {
  try {
    const info = await transporter.sendMail({
      from: `"Betanest App" <${process.env.GMAIL_USER}>`,
      to,
      subject,
      html,
    });
    console.log("✅ Email sent:", info.messageId);
    return info;
  } catch (error) {
    console.error("❌ Error sending email:", error);
    throw error;
  }
};
