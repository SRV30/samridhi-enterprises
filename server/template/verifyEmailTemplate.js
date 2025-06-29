const verifyEmailTemplate = ({ name, otp }) => {
  return `
    <div style="font-family: 'Helvetica Neue', Arial, sans-serif; color: #1e3a8a; max-width: 640px; margin: 0 auto; padding: 24px; border-radius: 12px; background: linear-gradient(145deg, #ffffff, #eff6ff); border: 1px solid #bfdbfe; box-shadow: 0 8px 24px rgba(29, 78, 216, 0.1);">
      <p style="font-size: 24px; font-weight: 700; margin: 0 0 16px;">Hello ${name},</p>
      <p style="font-size: 16px; line-height: 1.7; margin: 0 0 24px;">
        Welcome to <strong>Samridhi Enterprises</strong>! 🚗 We're thrilled to have you on board.
        To complete your registration, please use the OTP below to verify your email address.
      </p>
      <div style="text-align: center; margin: 32px 0;">
        <p style="font-size: 28px; font-weight: 700; color: #3b82f6;">
          Your OTP: <span style="color: #1e3a8a;">${otp}</span>
        </p>
      </div>
      <p style="font-size: 14px; color: #64748b; text-align: center; margin: 0 0 24px;">
        This OTP is valid for <strong>15 minutes</strong>. Please use it promptly.
      </p>
      <p style="font-size: 14px; color: #64748b; line-height: 1.6;">
        If you didn't sign up for Samridhi Enterprises, please ignore this email.
        Your OTP is part of the verification process for your registration.
      </p>
      <p style="font-size: 16px; font-weight: 600; margin: 24px 0 8px;">Best Regards,</p>
      <p style="font-size: 18px; font-weight: 700; color: #3b82f6;">Samridhi Enterprises</p>
      <hr style="border: none; border-top: 1px solid #bfdbfe; margin: 24px 0;">
      <p style="font-size: 12px; text-align: center; color: #64748b;">
        Need help? Contact us at 
        <a href="mailto:support@samridhienterprises.com" style="color: #3b82f6; text-decoration: none; font-weight: 500;">support@samridhienterprises.com</a>
      </p>
      <style>
        @media (max-width: 640px) {
          div { padding: 16px; }
          p:first-child { font-size: 20px; }
          div p[style*="font-size: 28px"] { font-size: 24px; }
          p[style*="font-size: 16px"] { font-size: 14px; }
        }
      </style>
    </div>
  `;
};

export default verifyEmailTemplate;