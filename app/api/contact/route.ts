import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(req: Request) {
  try {
    const { name, email, company, message } = await req.json();

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const mailOptions = {
      from: `"${name}" <${process.env.SMTP_USER}>`,
      to: process.env.CONTACT_FORM_TO || "services@atsnai.com",
      replyTo: email,
      subject: `New Inquiry: ${name} from ${company}`,
      text: `New contact form submission from ATSN Robotics\n\nName: ${name}\nCompany: ${company}\nEmail: ${email}\n\nMessage:\n${message}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              .container { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0a0a0b; color: #f5f5f5; padding: 40px 20px; text-align: left; }
              .card { background-color: #0c0c0e; border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 16px; max-width: 600px; margin: 0 auto; padding: 40px; }
              .header { border-bottom: 2px solid #c9a962; padding-bottom: 20px; margin-bottom: 30px; }
              .logo { font-size: 24px; font-weight: 700; letter-spacing: 0.1em; color: #f5f5f5; text-transform: uppercase; margin: 0; }
              .tagline { font-size: 12px; color: #c9a962; letter-spacing: 0.2em; text-transform: uppercase; margin-top: 4px; }
              .section-title { font-size: 18px; font-weight: 600; color: #f5f5f5; margin: 0 0 20px 0; }
              .field { margin-bottom: 24px; }
              .label { font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; color: rgba(245, 245, 245, 0.4); margin-bottom: 6px; }
              .value { font-size: 16px; color: #f5f5f5; font-weight: 500; }
              .message-box { background-color: #121214; border-radius: 12px; padding: 24px; border-left: 3px solid #c9a962; margin-top: 10px; }
              .message-text { font-size: 15px; line-height: 1.6; color: rgba(245, 245, 245, 0.85); white-space: pre-wrap; margin: 0; }
              .footer { text-align: center; margin-top: 30px; font-size: 12px; color: rgba(245, 245, 245, 0.3); }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="card" style="box-shadow: 0 20px 40px rgba(0,0,0,0.4);">
                <div class="header">
                  <h1 class="logo">ATSN <span style="font-weight: 300;">ROBOTICS</span></h1>
                  <div class="tagline">Intelligence in Motion</div>
                </div>

                <h2 class="section-title">New Contact Inquiry</h2>
                
                <div class="field">
                  <div class="label">From</div>
                  <div class="value">${name}</div>
                </div>

                <div class="field">
                  <div class="label">Company</div>
                  <div class="value">${company}</div>
                </div>

                <div class="field">
                  <div class="label">Email</div>
                  <div class="value"><a href="mailto:${email}" style="color: #c9a962; text-decoration: none;">${email}</a></div>
                </div>

                <div class="field">
                  <div class="label">Message</div>
                  <div class="message-box">
                    <p class="message-text">${message}</p>
                  </div>
                </div>
              </div>
              
              <div class="footer">
                &copy; ${new Date().getFullYear()} ATSN Robotics Inc. &bull; Contact Form System
              </div>
            </div>
          </body>
        </html>
      `,
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json({ message: "Email sent successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error sending email:", error);
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
  }
}
