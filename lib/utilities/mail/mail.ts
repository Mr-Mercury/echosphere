import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendVerificationEmail = async (email: string, token: string) => {
    const confirmationLink = `http://localhost:3000/new-verification?token=${token}`;

    await resend.emails.send({
        from: 'onboarding@resend.dev',
        to: email,
        subject: 'Confirm your Echosphere account email',
        html: `<p>Click <a href='${confirmationLink}>here </a> to confirm your email!</p>`
    });
};