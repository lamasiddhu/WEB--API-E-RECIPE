import nodemailer from "nodemailer";
import { EMAIL_USER, EMAIL_APP_PASSWORD } from "../configs/constant";

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: EMAIL_USER,
        pass: EMAIL_APP_PASSWORD,
    },
});

export async function sendPasswordResetCodeEmail(to: string, code: string): Promise<void> {
    await transporter.sendMail({
        from: `"E-Recipe" <${EMAIL_USER}>`,
        to,
        subject: "Your E-Recipe password reset code",
        text: `Your E-Recipe password reset code is ${code}. It expires in 10 minutes. If you didn't request this, you can ignore this email.`,
        html: `
            <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
                <h2 style="color:#B34B20;">E-Recipe Password Reset</h2>
                <p>Use the code below to reset your password. It expires in 10 minutes.</p>
                <p style="font-size: 32px; font-weight: bold; letter-spacing: 8px; text-align: center;">${code}</p>
                <p style="color:#666; font-size: 13px;">If you didn't request this, you can safely ignore this email.</p>
            </div>
        `,
    });
}
