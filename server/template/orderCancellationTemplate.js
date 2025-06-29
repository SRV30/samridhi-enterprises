const generateOrderCancellationEmail = (order) => {
    return `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="utf-8">
          <title>Order Cancellation Confirmation</title>
        </head>
        <body style="font-family: Arial, sans-serif; background-color: #f9f9f9; color: #333;">
          <div style="background-color: #fff; padding: 20px; max-width: 600px; margin: 0 auto; border-radius: 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
            <h2 style="color: #e91e63; text-align: center;">Order Cancellation Confirmation</h2>
            <p style="font-size: 16px;">Dear ${order.user.name},</p>
            <p style="font-size: 16px;">We are writing to confirm that your order <strong>#${order._id}</strong> has been successfully cancelled.</p>
            <p style="font-size: 16px;">Here are the details of your order:</p>
            <ul style="font-size: 16px;">
              ${order.products
                .map(
                  (item) =>
                    `<li><strong>Product:</strong> ${item.product.name} | <strong>Quantity:</strong> ${item.quantity}</li>`
                )
                .join("")}
            </ul>
            <p style="font-size: 16px;"><strong>Order Created:</strong> ${order.createdAt}</p>
            <p style="font-size: 16px;">If you have any concerns or questions, feel free to contact our support team at <strong>support@nandanijewellers.com</strong>.</p>
            <p style="font-size: 16px; text-align: center;">
              <a href="https://www.nandanijewellers.com" style="color: #fff; background-color: #e91e63; padding: 10px 20px; text-decoration: none; border-radius: 4px;">Visit Samridhi Enterprises</a>
            </p>
            <p style="font-size: 16px; text-align: center;">Best regards,<br>Samridhi Enterprises</p>
          </div>
        </body>
      </html>
    `;
  };
  
  export default generateOrderCancellationEmail;
  