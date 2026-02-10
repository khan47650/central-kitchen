const SibApiV3Sdk = require("@getbrevo/brevo");

const client = new SibApiV3Sdk.TransactionalEmailsApi();
client.authentications["apiKey"].apiKey = process.env.BREVO_API_KEY;

async function sendEmail(to, subject, html, attachments = []) {
  try {
    const emailData = {
      sender: { email: "right2abdullah@gmail.com", name: "Central Kitchen" },
      to: [{ email: to }],
      subject: subject,
      htmlContent: html,
    };

    if (attachments.length > 0) {
      emailData.attachment = attachments.map(file => ({
        name: file.filename,
        content: file.content.toString("base64"),
      }));
    }

    const response = await client.sendTransacEmail(emailData);
    console.log("Brevo email sent:", response.messageId);

    return true;
  } catch (err) {
    console.error("Brevo email send error:", err.message);
    return false;
  }
}

module.exports = sendEmail;
