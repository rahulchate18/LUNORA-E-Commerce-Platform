import { wrapEmailLayout } from "./layout.js";

export function getContactFormTemplate(name: string, email: string, subject: string, message: string): string {
  const content = `
    <h1>New Customer Inquiry</h1>
    <p>A new customer inquiry has been submitted via the LUNORA contact form.</p>
    
    <div style="margin: 25px 0; background-color: #FAFAF9; border-radius: 8px; padding: 20px; border: 1px solid #E5E5E5; font-size: 13px;">
      <h3 style="margin-top: 0; font-size: 13px; text-transform: uppercase; letter-spacing: 1px; color: #1A1A1A; margin-bottom: 12px;">Inquiry Metadata</h3>
      <table style="font-size: 12px; color: #777777;">
        <tr>
          <td style="padding-bottom: 6px; font-weight: bold; color: #1A1A1A; width: 120px;">Customer Name:</td>
          <td style="padding-bottom: 6px;">${name}</td>
        </tr>
        <tr>
          <td style="padding-bottom: 6px; font-weight: bold; color: #1A1A1A;">Email Address:</td>
          <td style="padding-bottom: 6px;"><a href="mailto:${email}" style="color: #D4A373;">${email}</a></td>
        </tr>
        <tr>
          <td style="padding-bottom: 6px; font-weight: bold; color: #1A1A1A;">Subject:</td>
          <td style="padding-bottom: 6px;">${subject}</td>
        </tr>
      </table>
      
      <div style="margin-top: 15px; border-top: 1px solid #E5E5E5; padding-top: 15px;">
        <strong style="color: #1A1A1A;">Message Content:</strong>
        <p style="margin-top: 8px; white-space: pre-wrap; font-style: italic; color: #444444;">"${message}"</p>
      </div>
    </div>

    <div class="divider"></div>
    <p>To respond, simply click on the customer's email link above to initiate a direct reply thread.</p>
    <p>Thank you,<br><strong>LUNORA System Router</strong></p>
  `;
  return wrapEmailLayout("New Contact Form Inquiry", content);
}
