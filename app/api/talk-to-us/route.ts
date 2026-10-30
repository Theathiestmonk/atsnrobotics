import { NextResponse } from "next/server";
import { isValidPhoneNumber, parsePhoneNumber } from "libphonenumber-js";
import { createSmtpTransport, getEmailDeliveryFailure } from "@/app/lib/email";
import { isRobotModel } from "@/app/lib/models";

export async function POST(req: Request) {
  try {
    const { model, name, businessName, email, phone, phoneCountry, address, city, state, country } =
      await req.json();

    if (!isRobotModel(model)) {
      return NextResponse.json({ error: "Please select a valid robot model." }, { status: 400 });
    }

    // Validate phone number on backend
    if (!phone || typeof phone !== "string" || !phone.startsWith("+")) {
      return NextResponse.json(
        { error: "Invalid phone number format" },
        { status: 400 }
      );
    }

    // Verify it's a valid E.164 format and matches expected country code
    let phoneCountryCode = phoneCountry;
    try {
      const parsed = parsePhoneNumber(phone);
      if (!parsed || !isValidPhoneNumber(phone)) {
        return NextResponse.json(
          { error: "Invalid phone number" },
          { status: 400 }
        );
      }
      phoneCountryCode = parsed.country || phoneCountry;
    } catch {
      return NextResponse.json(
        { error: "Invalid phone number" },
        { status: 400 }
      );
    }

    const mailer = createSmtpTransport();

    if ("error" in mailer) {
      return NextResponse.json({ error: mailer.error }, { status: 503 });
    }

    const mailOptions = {
      from: `"${name}" <${process.env.SMTP_USER}>`,
      to: process.env.CONTACT_FORM_TO || "services@atsnai.com",
      replyTo: email,
      subject: `New Order Inquiry: ${name} from ${businessName} (${model})`,
      text: `New order inquiry from ATSN Robotics\n\nModel: ${model}\nName: ${name}\nBusiness: ${businessName}\nEmail: ${email}\nPhone: ${phone}\nAddress: ${address}, ${city}, ${state}, ${country}`,
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

                <h2 class="section-title">New Order Inquiry</h2>

                <div class="field">
                  <div class="label">Model</div>
                  <div class="value">${model}</div>
                </div>

                <div class="field">
                  <div class="label">Name</div>
                  <div class="value">${name}</div>
                </div>

                <div class="field">
                  <div class="label">Business name</div>
                  <div class="value">${businessName}</div>
                </div>

                <div class="field">
                  <div class="label">Email</div>
                  <div class="value"><a href="mailto:${email}" style="color: #c9a962; text-decoration: none;">${email}</a></div>
                </div>

                <div class="field">
                  <div class="label">Contact number</div>
                  <div class="value">${phone} <span style="color: rgba(245, 245, 245, 0.5); font-size: 14px;">(${phoneCountryCode})</span></div>
                </div>

                <div class="field">
                  <div class="label">Address</div>
                  <div class="value">${address}, ${city}, ${state}, ${country}</div>
                </div>
              </div>

              <div class="footer">
                &copy; ${new Date().getFullYear()} ATSN Robotics Inc. &bull; Order Inquiry System
              </div>
            </div>
          </body>
        </html>
      `,
    };

    await mailer.transporter.sendMail(mailOptions);

    return NextResponse.json({ message: "Email sent successfully" }, { status: 200 });
  } catch (error) {
    const failure = getEmailDeliveryFailure(error);
    console.error("Talk-to-us email delivery failed:", {
      code: failure.code,
      responseCode: failure.responseCode,
    });
    return NextResponse.json(
      { error: failure.message },
      { status: failure.status },
    );
  }
}
