import { Resend } from 'resend';
import { NextResponse } from 'next/server';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  const { name, email, inquiry_type, message } = await req.json();

  const { error } = await resend.emails.send({
    from: 'Portfolio Contact <noreply@mic7aelr.com>',
    to: 'mic7aelro@gmail.com',
    replyTo: email,
    subject: `[Portfolio] ${inquiry_type} — ${name}`,
    text: `Name: ${name}\nEmail: ${email}\nInquiry: ${inquiry_type}\n\n${message}`,
  });

  if (error) {
    return NextResponse.json({ error }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
