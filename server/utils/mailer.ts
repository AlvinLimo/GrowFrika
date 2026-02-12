import nodemailer from 'nodemailer';

// Create Gmail transporter
import SMTPTransport from 'nodemailer/lib/smtp-transport';

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  family: 4, // ← ADD THIS to force IPv4
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.GOOGLE_APP_PASSWORD
  }
} as SMTPTransport.Options);

/**
 * Send an email using Gmail
 * @param to - Recipient email address
 * @param subject - Email subject
 * @param html - Email HTML content
 * @param text - Optional plain text version
 */
export const sendEmail = async (
    to: string,
    subject: string,
    html: string,
    text?: string
) => {
    try {
        const info = await transporter.sendMail({
            from: `"GrowFrika" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            html,
            text
        });

        console.log('Email sent successfully:', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('Error sending email:', error);
        throw error;
    }
};

/**
 * Send email to multiple recipients
 */
export const sendBulkEmail = async (
    to: string[],
    subject: string,
    html: string,
    text?: string
) => {
    try {
        const info = await transporter.sendMail({
            from: `"GrowFrika" <${process.env.EMAIL_USER}>`,
            to: to.join(', '),
            subject,
            html,
            text
        });

        console.log('Bulk email sent successfully:', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('Error sending bulk email:', error);
        throw error;
    }
};

/**
 * Verify Gmail configuration
 */
export const verifyMailer = async () => {
    try {
        await transporter.verify();
        console.log('Mailer is configured correctly with Gmail');
        console.log('Sending from:', process.env.EMAIL_USER);
        return { success: true };
    } catch (err) {
        console.error('Error configuring mailer:', err);
        throw err;
    }
};

// Default export for backward compatibility
export default {
    sendEmail,
    sendBulkEmail,
    verifyMailer,
};