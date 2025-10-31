import { Resend } from 'resend';

// Initialize Resend with your API key
const resend = new Resend(process.env.RESEND_API_KEY!);

// Email configuration
const EMAIL_CONFIG = {
    from: 'GrowFrika <onboarding@resend.dev>', // Resend's default sender
    replyTo: process.env.EMAIL_USER, // Your Outlook email for replies
};

/**
 * Send an email using Resend
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
        const data = await resend.emails.send({
            from: EMAIL_CONFIG.from,
            replyTo: EMAIL_CONFIG.replyTo,
            to,
            subject,
            html,
            text, // Optional plain text fallback
        });

        console.log('Email sent successfully:', data);
        return { success: true, data };
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
        const data = await resend.emails.send({
            from: EMAIL_CONFIG.from,
            replyTo: EMAIL_CONFIG.replyTo,
            to,
            subject,
            html,
            text,
        });

        console.log('Bulk email sent successfully:', data);
        return { success: true, data };
    } catch (error) {
        console.error('Error sending bulk email:', error);
        throw error;
    }
};

/**
 * Verify Resend configuration
 */
export const verifyMailer = async () => {
    try {
        if (!process.env.RESEND_API_KEY) {
            throw new Error('RESEND_API_KEY is not configured in environment variables');
        }

        console.log('Mailer is configured correctly with Resend');
        console.log('Sending from:', EMAIL_CONFIG.from);
        console.log('Replies will go to:', EMAIL_CONFIG.replyTo);
        
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