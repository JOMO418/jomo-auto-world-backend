// utils/email.js
const nodemailer = require('nodemailer');

// Create email transporter
const createTransporter = () => {
  return nodemailer.createTransporter({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: process.env.EMAIL_PORT || 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};

// Send email function
const sendEmail = async (options) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: `Jomo Auto World <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Email error:', error);
    throw new Error('Email could not be sent');
  }
};

// Welcome email template
const sendWelcomeEmail = async (user, verificationUrl) => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #DC2626; color: white; padding: 20px; text-align: center; }
        .content { padding: 30px; background: #f9f9f9; }
        .button { 
          display: inline-block; 
          padding: 12px 30px; 
          background: #DC2626; 
          color: white; 
          text-decoration: none; 
          border-radius: 5px;
          margin: 20px 0;
        }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🚗 Welcome to Jomo Auto World!</h1>
        </div>
        <div class="content">
          <h2>Hello ${user.name}! 👋</h2>
          <p>Thank you for registering with Jomo Auto World - Your trusted partner for premium auto parts in Nairobi.</p>
          <p>To complete your registration, please verify your email address by clicking the button below:</p>
          <div style="text-align: center;">
            <a href="${verificationUrl}" class="button">Verify Email Address</a>
          </div>
          <p><small>Or copy this link: ${verificationUrl}</small></p>
          <p>If you didn't create this account, please ignore this email.</p>
          <p><strong>What's next?</strong></p>
          <ul>
            <li>Browse our 5000+ premium auto parts</li>
            <li>Get same-day delivery across Nairobi</li>
            <li>Enjoy expert installation services</li>
            <li>Access exclusive deals and discounts</li>
          </ul>
        </div>
        <div class="footer">
          <p>Need help? Contact us at info@jomoauto.co.ke or call +254 712 345 678</p>
          <p>&copy; 2024 Jomo Auto World. All rights reserved.</p>
          <p>Powered by Brandy Software Solutions</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return await sendEmail({
    to: user.email,
    subject: 'Welcome to Jomo Auto World - Verify Your Email',
    html
  });
};

// Order confirmation email
const sendOrderConfirmationEmail = async (user, order) => {
  const itemsHtml = order.items.map(item => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.name}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">KES ${item.price.toLocaleString()}</td>
    </tr>
  `).join('');

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #DC2626; color: white; padding: 20px; text-align: center; }
        .content { padding: 30px; background: #f9f9f9; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        .total { font-size: 18px; font-weight: bold; color: #DC2626; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>✅ Order Confirmed!</h1>
        </div>
        <div class="content">
          <h2>Thank you for your order, ${user.name}!</h2>
          <p>Your order has been received and is being processed.</p>
          
          <p><strong>Order Number:</strong> ${order.orderNumber}</p>
          <p><strong>Order Date:</strong> ${new Date(order.createdAt).toLocaleDateString()}</p>
          
          <h3>Order Details:</h3>
          <table>
            <thead>
              <tr style="background: #f5f5f5;">
                <th style="padding: 10px; text-align: left;">Item</th>
                <th style="padding: 10px; text-align: center;">Qty</th>
                <th style="padding: 10px; text-align: right;">Price</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>
          
          <table style="margin-top: 20px;">
            <tr>
              <td style="text-align: right; padding: 5px;"><strong>Subtotal:</strong></td>
              <td style="text-align: right; padding: 5px;">KES ${order.subtotal.toLocaleString()}</td>
            </tr>
            <tr>
              <td style="text-align: right; padding: 5px;"><strong>Shipping:</strong></td>
              <td style="text-align: right; padding: 5px;">KES ${order.shippingCost.toLocaleString()}</td>
            </tr>
            <tr>
              <td style="text-align: right; padding: 10px;" class="total">Total:</td>
              <td style="text-align: right; padding: 10px;" class="total">KES ${order.totalAmount.toLocaleString()}</td>
            </tr>
          </table>
          
          <h3>Shipping Address:</h3>
          <p>
            ${order.shippingAddress.name}<br>
            ${order.shippingAddress.street}<br>
            ${order.shippingAddress.city}, ${order.shippingAddress.county}<br>
            Phone: ${order.shippingAddress.phone}
          </p>
          
          <p><strong>Payment Method:</strong> ${order.paymentMethod}</p>
          <p><strong>Estimated Delivery:</strong> ${order.estimatedDeliveryDate ? new Date(order.estimatedDeliveryDate).toLocaleDateString() : 'Same day'}</p>
          
          <p>We'll notify you when your order ships. Track your order anytime at our website.</p>
        </div>
        <div class="footer">
          <p>Questions? Contact us at info@jomoauto.co.ke or +254 712 345 678</p>
          <p>&copy; 2024 Jomo Auto World. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return await sendEmail({
    to: user.email,
    subject: `Order Confirmation - ${order.orderNumber}`,
    html
  });
};

// Password reset email
const sendPasswordResetEmail = async (user, resetUrl) => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #DC2626; color: white; padding: 20px; text-align: center; }
        .content { padding: 30px; background: #f9f9f9; }
        .button { 
          display: inline-block; 
          padding: 12px 30px; 
          background: #DC2626; 
          color: white; 
          text-decoration: none; 
          border-radius: 5px;
          margin: 20px 0;
        }
        .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🔒 Password Reset Request</h1>
        </div>
        <div class="content">
          <h2>Hello ${user.name},</h2>
          <p>You requested a password reset for your Jomo Auto World account.</p>
          <p>Click the button below to reset your password:</p>
          <div style="text-align: center;">
            <a href="${resetUrl}" class="button">Reset Password</a>
          </div>
          <p><small>Or copy this link: ${resetUrl}</small></p>
          <div class="warning">
            <strong>⚠️ Important:</strong>
            <ul>
              <li>This link expires in 30 minutes</li>
              <li>If you didn't request this, please ignore this email</li>
              <li>Your password will remain unchanged</li>
            </ul>
          </div>
        </div>
        <div class="footer">
          <p>Need help? Contact us at info@jomoauto.co.ke</p>
          <p>&copy; 2024 Jomo Auto World. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return await sendEmail({
    to: user.email,
    subject: 'Password Reset Request - Jomo Auto World',
    html
  });
};

module.exports = {
  sendEmail,
  sendWelcomeEmail,
  sendOrderConfirmationEmail,
  sendPasswordResetEmail
};