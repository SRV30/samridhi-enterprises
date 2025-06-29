const generateReceiptHTML = (order) => {
  const { user, products, orderStatus, _id, createdAt } = order;

  const formattedDate = new Date(createdAt).toLocaleString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const productList = products
    .map((item) => {
      const productImage =
        item.product.images && item.product.images.length > 0
          ? item.product.images[0].url
          : "https://via.placeholder.com/50";

      return `
      <tr>
        <td class="product-image">
          <img src="${productImage}" alt="${item.product.name}" width="60" height="60" />
        </td>
        <td class="product-name">${item.product.name}</td>
        <td class="product-quantity">${item.quantity}</td>
      </tr>
    `;
    })
    .join("");

  const totalItems = products.reduce((sum, item) => sum + item.quantity, 0);

  return `
    <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Samridhi Enterprises - Order Confirmation</title>
        <style>
          :root {
            --primary-color: #b8860b;
            --primary-color-dark: #a67c00;
            --primary-color-light: #d9b253;
            --background-light: linear-gradient(135deg, #fff7e6 0%, #fffbf2 50%, #fff7e6 100%);
            --background-dark: linear-gradient(135deg, #1a1a1a 0%, #2a2516 50%, #1a1a1a 100%);
            --text-light: #6b4e0b;
            --text-dark: #e6c378;
            --border-light: #e6d2a3;
            --border-dark: #4d3b09;
            --shadow-light: 0 8px 30px rgba(184, 134, 11, 0.1);
            --shadow-dark: 0 8px 30px rgba(0, 0, 0, 0.5);
          }
          
          @media (prefers-color-scheme: dark) {
            body {
              background: var(--background-dark);
              color: var(--text-dark);
            }
            .container {
              background: #121212;
              box-shadow: var(--shadow-dark);
              border: 1px solid var(--border-dark);
            }
            h2, h3 {
              color: var(--primary-color-light);
            }
            table th {
              background-color: #2a2516;
              color: var(--text-dark);
              border-bottom: 1px solid var(--border-dark);
            }
            table td {
              border-bottom: 1px solid var(--border-dark);
            }
            .order-status {
              color: var(--primary-color-light);
            }
            tr:nth-child(even) {
              background-color: #1e1e1e;
            }
            .footer, .contact {
              color: #a6a6a6;
            }
            .btn {
              background-color: var(--primary-color);
              color: #fff;
            }
            .btn:hover {
              background-color: var(--primary-color-dark);
            }
            a {
              color: var(--primary-color-light);
            }
            .divider {
              background: linear-gradient(90deg, transparent, var(--primary-color-light), transparent);
            }
            .product-image img {
              border: 1px solid var(--border-dark);
            }
          }
          
          @media (prefers-color-scheme: light) {
            body {
              background: var(--background-light);
              color: var(--text-light);
            }
            .container {
              background: #ffffff;
              box-shadow: var(--shadow-light);
              border: 1px solid var(--border-light);
            }
            h2, h3 {
              color: var(--primary-color);
            }
            table th {
              background-color: #f7f2e6;
              color: var(--text-light);
              border-bottom: 1px solid var(--border-light);
            }
            table td {
              border-bottom: 1px solid var(--border-light);
            }
            .order-status {
              color: var(--primary-color);
            }
            tr:nth-child(even) {
              background-color: #fcfaf5;
            }
            .footer, .contact {
              color: #666;
            }
            .btn {
              background-color: var(--primary-color);
              color: #fff;
            }
            .btn:hover {
              background-color: var(--primary-color-dark);
            }
            a {
              color: var(--primary-color);
            }
            .divider {
              background: linear-gradient(90deg, transparent, var(--primary-color), transparent);
            }
            .product-image img {
              border: 1px solid var(--border-light);
            }
          }
          
          body {
            font-family: 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;
            margin: 0;
            padding: 20px;
            line-height: 1.6;
          }
          
          .container {
            max-width: 700px;
            margin: 20px auto;
            padding: 40px;
            border-radius: 12px;
          }
          
          .header {
            text-align: center;
            margin-bottom: 30px;
          }
          
          .logo {
            font-size: 28px;
            font-weight: bold;
            letter-spacing: 1px;
            margin-bottom: 5px;
          }
          
          h2 {
            font-size: 24px;
            font-weight: 600;
            text-align: center;
            margin-bottom: 20px;
            letter-spacing: 0.5px;
          }
          
          h3 {
            font-size: 18px;
            font-weight: 600;
            margin-top: 30px;
            margin-bottom: 15px;
            letter-spacing: 0.5px;
          }
          
          p {
            font-size: 16px;
            line-height: 1.6;
            margin-bottom: 15px;
          }
          
          table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
            border-radius: 8px;
            overflow: hidden;
          }
          
          th, td {
            padding: 15px;
            text-align: left;
          }
          
          th {
            font-weight: 600;
          }
          
          .order-status {
            font-size: 16px;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          
          .footer {
            margin-top: 40px;
            text-align: center;
            font-size: 15px;
          }
          
          .btn {
            display: inline-block;
            padding: 12px 28px;
            text-decoration: none;
            border-radius: 50px;
            font-size: 16px;
            font-weight: 600;
            margin-top: 20px;
            transition: all 0.3s ease;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          
          .contact {
            margin-top: 30px;
            text-align: center;
            font-size: 15px;
          }
          
          .contact a {
            text-decoration: none;
            font-weight: 600;
          }
          
          .divider {
            height: 1px;
            width: 80%;
            margin: 30px auto;
          }
          
          .product-image {
            width: 70px;
            text-align: center;
            padding: 10px;
          }
          
          .product-image img {
            border-radius: 8px;
            object-fit: cover;
          }
          
          .product-name {
            font-weight: 500;
          }
          
          .product-quantity {
            text-align: center;
            font-weight: 600;
          }
          
          .order-summary {
            background-color: rgba(184, 134, 11, 0.05);
            border-radius: 8px;
            padding: 20px;
            margin: 30px 0;
          }
          
          .order-summary p {
            display: flex;
            justify-content: space-between;
            margin: 10px 0;
          }
          
          .social-icons {
            display: flex;
            justify-content: center;
            gap: 15px;
            margin-top: 20px;
          }
          
          .social-icons a {
            text-decoration: none;
          }
          
          @media (max-width: 600px) {
            .container {
              padding: 20px;
            }
            
            table th, table td {
              padding: 10px;
            }
            
            .product-image {
              width: 50px;
            }
            
            .product-image img {
              width: 50px;
              height: 50px;
            }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">Samridhi Enterprises</div>
            <p>Timeless Elegance, Crafted with Passion</p>
          </div>
          
          <h2>Booking Confirmation</h2>
          
          <p>Dear <strong>${user.name}</strong>,</p>
          <p>Thank you for choosing Samridhi Enterprises. We're delighted to confirm that your order has been successfully booked. Here are your order details:</p>

          <div class="order-summary">
            <h3>Order Summary</h3>
            <p><span>Order ID:</span> <strong>#${_id}</strong></p>
            <p><span>Order Date:</span> <strong>${formattedDate}</strong></p>
            <p><span>Status:</span> <strong class="order-status">${orderStatus}</strong></p>
            <p><span>Total Items:</span> <strong>${totalItems}</strong></p>
          </div>

          <h3>Products Booked</h3>
          <table>
            <thead>
              <tr>
                <th style="text-align: center;">Image</th>
                <th>Product</th>
                <th style="text-align: center;">Quantity</th>
              </tr>
            </thead>
            <tbody>
              ${productList}
            </tbody>
          </table>

          <div class="divider"></div>

          <div class="footer">
            <p>Please visit our
                    showrooms within 7 days of booking for final fitting and
                    collection of your selected pieces.</p>
            <p>Thank you for trusting <strong>Samridhi Enterprises</strong> with your jewelry needs!</p>
          </div>

          <div class="contact">
            <p><strong>Questions?</strong> Contact our support team at <a href="mailto:support@nandanijewellers.com">support@nandanijewellers.com</a></p>
            <p>Visit our <a href="https://www.nandanijewellers.com">website</a> to explore our complete collection.</p>
            
            <div class="social-icons">
              <a href="https://www.facebook.com/nandanijewellers">Facebook</a> |
              <a href="https://www.instagram.com/nandaninj">Instagram</a> |
            </div>
          </div>
        </div>
      </body>
    </html>
  `;
};

export default generateReceiptHTML;
