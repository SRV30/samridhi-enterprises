import axios from "axios";
import config from "./index.js";

const sendEmail = async ({ sendTo, subject, html }) => {
  try {
    if (config.brevo.apiKey === "dummy" || process.env.BREVO_API_KEY === "dummy") {
      console.log("⚠️ Bypassing email send because BREVO_API_KEY is 'dummy'.");
      return true;
    }

    const response = await axios.post(
      "https://api.brevo.com/v3/smtp/email",
      {
        sender: {
          email: config.brevo.senderEmail,
          name: config.brevo.senderName,
        },
        to: [{ email: sendTo }],
        subject: subject,
        htmlContent: html,
      },
      {
        headers: {
          "api-key": config.brevo.apiKey || process.env.BREVO_API_KEY,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("✅ Email sent successfully:", response.data);
    return true;
  } catch (error) {
    console.error(
      "❌ Error sending email:",
      error.response?.data || error.message
    );

    return false;
  }
};

export default sendEmail;
