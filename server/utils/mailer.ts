import { Resend } from 'resend';

// Initialize Resend with your API Key
const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Send an email using Resend API
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
        const { data, error } = await resend.emails.send({
            from: `GrowFrika <${process.env.EMAIL_USER || 'onboarding@resend.dev'}>`,
            to: [to],
            subject,
            html,
            text: text || ""
        });

        if (error) {
            console.error('Resend error:', error);
            throw error;
        }

        console.log('Email sent successfully:', data?.id);
        return { success: true, messageId: data?.id };
    } catch (error) {
        console.error('Error in sendEmail:', error);
        throw error;
    }
};

/**
 * Send bulk email using Resend's Batch API
 * Resend supports up to 100 emails in a single batch call.
 */
export const sendBulkEmail = async (
    recipients: string[],
    subject: string,
    html: string,
    text?: string
) => {
    try {
        // Create an array of email objects for the batch
        const batchData = recipients.map(to => ({
            from: `GrowFrika <${process.env.EMAIL_USER || 'onboarding@resend.dev'}>`,
            to: [to],
            subject,
            html,
            text: text || ""
        }));

        const { data, error } = await resend.batch.send(batchData);

        if (error) {
            console.error('Resend batch error:', error);
            throw error;
        }

        console.log('Bulk emails sent successfully');
        return { success: true, results: data };
    } catch (error) {
        console.error('Error in sendBulkEmail:', error);
        throw error;
    }
};

/**
 * Verify Mailer - In Resend, we just check if the API key is present.
 * Real verification happens via your dashboard domain settings.
 */
export const verifyMailer = async () => {
    if (!process.env.RESEND_API_KEY) {
        console.error('RESEND_API_KEY is missing');
        throw new Error('Mailer configuration failed: Missing API Key');
    }
    console.log('Resend Mailer is configured');
    return { success: true };
};

export default {
    sendEmail,
    sendBulkEmail,
    verifyMailer,
};