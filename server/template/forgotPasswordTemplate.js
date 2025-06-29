const forgotPasswordTemplate = ({ name, otp }) => {
  return `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>Password Reset Request</title>
          <style>
            body {
              font-family: 'Inter', 'Helvetica Neue', sans-serif;
              margin: 0;
              padding: 0;
              background: linear-gradient(135deg, #e0f2fe, #f9fafb, #e0f2fe);
              color: #1e40af;
            }
            .container {
              width: 100%;
              max-width: 640px;
              margin: 32px auto;
              padding: 24px;
              background: #ffffff;
              border-radius: 16px;
              box-shadow: 0 8px 32px rgba(29, 78, 216, 0.1);
              text-align: center;
              position: relative;
              overflow: hidden;
            }
            .container::before {
              content: '';
              position: absolute;
              top: -64px;
              right: -64px;
              width: 128px;
              height: 128px;
              background: rgba(59, 130, 246, 0.2);
              border-radius: 50%;
              filter: blur(64px);
            }
            .header h1 {
              font-size: 28px;
              color: #3b82f6;
              font-weight: 700;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              margin-bottom: 8px;
            }
            .body {
              font-size: 16px;
              line-height: 1.7;
              color: #1e40af;
              text-align: center;
            }
            .body p {
              margin: 12px 0;
            }
            .otp-container {
              background: linear-gradient(to right, #3b82f6, #2563eb);
              color: #ffffff;
              font-size: 32px;
              padding: 16px 24px;
              text-align: center;
              font-weight: 700;
              border-radius: 12px;
              margin: 24px auto;
              display: inline-block;
              width: 80%;
              box-shadow: 0 4px 16px rgba(29, 78, 216, 0.3);
            }
            .footer {
              margin-top: 24px;
              font-size: 14px;
              color: #64748b;
            }
            .footer a {
              color: #3b82f6;
              text-decoration: none;
              font-weight: 600;
            }
            .button-container {
              margin: 24px 0;
            }
            .button {
              background: linear-gradient(to right, #3b82f6, #2563eb);
              color: #ffffff;
              padding: 12px 32px;
              border-radius: 8px;
              text-decoration: none;
              font-weight: 600;
              font-size: 16px;
              text-transform: uppercase;
              transition: all 0.3s ease;
              box-shadow: 0 4px 12px rgba(29, 78, 216, 0.2);
              display: inline-block;
            }
            .button:hover {
              background: linear-gradient(to right, #2563eb, #3b82f6);
              transform: translateY(-2px);
              box-shadow: 0 6px 16px rgba(29, 78, 216, 0.3);
            }
            @media (max-width: 640px) {
              .container {
                padding: 16px;
                margin: 16px;
              }
              .header h1 {
                font-size: 24px;
              }
              .otp-container {
                font-size: 28px;
                width: 90%;
              }
              .body {
                font-size: 14px;
              }
              .button {
                padding: 10px 24px;
                font-size: 14px;
              }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Password Reset Request</h1>
            </div>
            <div class="body">
              <p>Hello <strong>${name}</strong>,</p>
              <p>We received a request to reset the password for your <strong>Samridhi Enterprises</strong> account.</p>
              <p>If you didn't request a password reset, please ignore this email.</p>
              <p>To reset your password, use the following OTP:</p>
              <div class="otp-container">
                ${otp}
              </div>
              <p>This OTP is valid for only <strong>10 minutes</strong>. Enter it on the Samridhi Enterprises website to proceed.</p>
            </div>
            <div class="button-container">
              <a href="https://samridhienterprises.com/verify-otp" class="button">Reset Password</a>
            </div>
            <div class="footer">
              <p>Samridhi Enterprises | <a href="https://www.samridhienterprises.com" target="_blank">www.samridhienterprises.com</a></p>
              <p>For assistance, contact <a href="mailto:support@samridhienterprises.com">support@samridhienterprises.com</a></p>
            </div>
          </div>
        </body>
      </html>
    `;
};

export default forgotPasswordTemplate;
