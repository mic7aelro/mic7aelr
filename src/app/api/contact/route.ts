import { Resend } from 'resend';
import { NextResponse } from 'next/server';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  const { name, email, inquiry_type, message } = await req.json();

  const firstName = name.split(' ')[0];
  const notifyHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>New Inquiry</title>
  <style>
    body { background: #000; color: #fff; font-family: 'DM Sans', ui-sans-serif, system-ui, -apple-system, sans-serif; margin: 0; padding: 0; }
    .wrap { max-width: 560px; margin: 0 auto; padding: 48px 32px; }
    h1 { font-size: 22px; font-weight: 300; letter-spacing: 0.08em; text-transform: uppercase; margin: 0 0 32px; font-family: 'Cormorant Garamond', 'Cormorant', Georgia, serif; }
    p { font-size: 14px; line-height: 1.8; opacity: 0.8; margin: 0 0 20px; }
    .label { font-size: 10px; letter-spacing: 0.3em; text-transform: uppercase; opacity: 0.4; margin-bottom: 4px; margin-top: 32px; }
    .value { font-size: 14px; }
    .footer { margin-top: 48px; font-size: 10px; letter-spacing: 0.2em; text-transform: uppercase; opacity: 0.3; }
    a { color: #fff; text-decoration: none; }
    a:hover { text-decoration: underline; }
  </style>
</head>
<body>
  <div class="wrap">
    <h1>New Inquiry</h1>
    <div class="label">From</div>
    <div class="value">${name}</div>
    <div class="label">Email</div>
    <div class="value"><a href="mailto:${email}">${email}</a></div>
    <div class="label">Inquiry</div>
    <div class="value">${inquiry_type}</div>
    <div class="label">Message</div>
    <p class="value">${message}</p>
    <div class="footer">Michael Rodriguez &mdash; Software Engineer</div>
  </div>
</body>
</html>`;

  const { error } = await resend.emails.send({
    from: 'Portfolio Contact <donotreply@mic7aelr.com>',
    to: 'mic7aelro@gmail.com',
    replyTo: email,
    subject: `[Portfolio] ${inquiry_type} — ${name}`,
    html: notifyHtml,
    text: `Name: ${name}\nEmail: ${email}\nInquiry: ${inquiry_type}\n\n${message}`,
  });

  if (error) {
    return NextResponse.json({ error }, { status: 500 });
  }
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Message Received</title>
  <style>
    body { background: #000; color: #fff; font-family: 'DM Sans', ui-sans-serif, system-ui, -apple-system, sans-serif; margin: 0; padding: 0; }
    .wrap { max-width: 560px; margin: 0 auto; padding: 48px 32px; }
    h1 { font-size: 22px; font-weight: 300; letter-spacing: 0.08em; text-transform: uppercase; margin: 0 0 32px; font-family: 'Cormorant Garamond', 'Cormorant', Georgia, serif; }
    p { font-size: 14px; line-height: 1.8; opacity: 0.8; margin: 0 0 20px; }
    .label { font-size: 10px; letter-spacing: 0.3em; text-transform: uppercase; opacity: 0.4; margin-bottom: 4px; margin-top: 32px; }
    .value { font-size: 14px; }
    .footer { margin-top: 48px; font-size: 10px; letter-spacing: 0.2em; text-transform: uppercase; opacity: 0.3; }
    a { color: #fff; text-decoration: none; }
    a:hover { text-decoration: underline; }
  </style>
</head>
<body>
  <div class="wrap">
    <h1>Got it.</h1>
    <p>Your message came through, ${firstName}. I care deeply about the craft, and that includes responding to the people who take the time to reach out. I'll be in touch.</p>
    <div class="label">Inquiry</div>
    <div class="value">${inquiry_type}</div>
    <div class="label">Your Message</div>
    <p class="value">${message}</p>
    <div class="footer">Michael Rodriguez &mdash; Software Engineer</div>
  </div>
</body>
</html>`;

  await resend.emails.send({
    from: 'Michael Rodriguez <donotreply@mic7aelr.com>',
    to: email,
    subject: `Got your message, ${firstName}.`,
    html,
    text: `Got it.\n\nYour message came through, ${firstName}. I care deeply about the craft, and that includes responding to the people who take the time to reach out. I'll be in touch.\n\nInquiry: ${inquiry_type}\n\nYour Message:\n${message}\n\nMichael Rodriguez — Software Engineer`,
  });

  return NextResponse.json({ success: true });
}
