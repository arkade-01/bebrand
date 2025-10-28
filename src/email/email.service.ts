/* eslint-disable */
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

interface OrderItem {
  productName: string;
  quantity: number;
  price: number;
  subtotal: number;
}

interface ShippingAddress {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

interface OrderDetails {
  orderId: string;
  items: OrderItem[];
  totalAmount: number;
  shippingAddress?: ShippingAddress;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private apiInstance: any;
  private senderEmail: string;
  private senderName: string;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('BREVO_API_KEY');
    this.senderEmail =
      this.configService.get<string>('BREVO_SENDER_EMAIL') ||
      'noreply@bebrand.com';
    this.senderName =
      this.configService.get<string>('BREVO_SENDER_NAME') || 'BeBrand';

    if (!apiKey) {
      this.logger.warn(
        'BREVO_API_KEY not found in environment variables. Email service will not work.',
      );
      return;
    }

    this.apiInstance = apiKey;
  }

  async sendWelcomeEmail(
    email: string,
    firstName: string,
    lastName: string,
  ): Promise<void> {
    if (!this.apiInstance) {
      this.logger.warn('Email service not configured. Skipping welcome email.');
      return;
    }

    const htmlContent = this.getWelcomeEmailTemplate(firstName);

    try {
      await axios.post(
        'https://api.brevo.com/v3/smtp/email',
        {
          sender: {
            name: this.senderName,
            email: this.senderEmail,
          },
          to: [{ email, name: `${firstName} ${lastName}` }],
          subject: 'Welcome to BeBrand!',
          htmlContent,
        },
        {
          headers: {
            'api-key': this.apiInstance,
            'Content-Type': 'application/json',
          },
        },
      );
      this.logger.log(`Welcome email sent to ${email}`);
    } catch (error) {
      this.logger.error(`Failed to send welcome email to ${email}:`, error);
    }
  }

  async sendOrderConfirmationEmail(
    email: string,
    firstName: string,
    orderDetails: OrderDetails,
  ): Promise<void> {
    if (!this.apiInstance) {
      this.logger.warn(
        'Email service not configured. Skipping order confirmation email.',
      );
      return;
    }

    const htmlContent = this.getOrderConfirmationTemplate(
      firstName,
      orderDetails,
    );

    try {
      await axios.post(
        'https://api.brevo.com/v3/smtp/email',
        {
          sender: {
            name: this.senderName,
            email: this.senderEmail,
          },
          to: [{ email, name: firstName }],
          subject: `Order Confirmation - Order #${orderDetails.orderId}`,
          htmlContent,
        },
        {
          headers: {
            'api-key': this.apiInstance,
            'Content-Type': 'application/json',
          },
        },
      );
      this.logger.log(`Order confirmation email sent to ${email}`);
    } catch (error) {
      this.logger.error(
        `Failed to send order confirmation email to ${email}:`,
        error,
      );
    }
  }

  private getWelcomeEmailTemplate(firstName: string): string {
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to BeBrand</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #ffffff;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #ffffff;">
          <tr>
            <td align="center" style="padding: 40px 20px;">
              <table width="600" cellpadding="0" cellspacing="0" style="background-color: #000000; border: 2px solid #000000;">
                <!-- Header -->
                <tr>
                  <td align="center" style="padding: 40px 20px; background-color: #000000;">
                    <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: bold; letter-spacing: 2px;">BEBRAND</h1>
                  </td>
                </tr>
                
                <!-- Content -->
                <tr>
                  <td style="padding: 40px 30px; background-color: #ffffff;">
                    <h2 style="margin: 0 0 20px 0; color: #000000; font-size: 24px; font-weight: bold;">Welcome, ${firstName}!</h2>
                    <p style="margin: 0 0 15px 0; color: #000000; font-size: 16px; line-height: 1.6;">
                      Thank you for joining BeBrand. We're excited to have you as part of our community.
                    </p>
                    <p style="margin: 0 0 15px 0; color: #000000; font-size: 16px; line-height: 1.6;">
                      Your account has been successfully created. You can now start exploring our premium products and exclusive brands.
                    </p>
                    <p style="margin: 0 0 30px 0; color: #000000; font-size: 16px; line-height: 1.6;">
                      Discover quality products tailored just for you.
                    </p>
                    
                    <!-- CTA Button -->
                    <table cellpadding="0" cellspacing="0" style="margin: 0 auto;">
                      <tr>
                        <td align="center" style="background-color: #000000; padding: 15px 40px; border: 2px solid #000000;">
                          <a href="${this.configService.get<string>('FRONTEND_URL') || '#'}" style="color: #ffffff; text-decoration: none; font-size: 16px; font-weight: bold; letter-spacing: 1px;">SHOP NOW</a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                
                <!-- Footer -->
                <tr>
                  <td align="center" style="padding: 30px 20px; background-color: #000000; border-top: 2px solid #ffffff;">
                    <p style="margin: 0 0 10px 0; color: #ffffff; font-size: 14px;">
                      Need help? Contact us at <a href="mailto:support@bebrand.com" style="color: #ffffff; text-decoration: underline;">support@bebrand.com</a>
                    </p>
                    <p style="margin: 0; color: #cccccc; font-size: 12px;">
                      © 2025 BeBrand. All rights reserved.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;
  }

  private getOrderConfirmationTemplate(
    firstName: string,
    orderDetails: OrderDetails,
  ): string {
    const itemsHtml = orderDetails.items
      .map(
        (item: OrderItem) => `
        <tr>
          <td style="padding: 15px 0; border-bottom: 1px solid #e0e0e0;">
            <p style="margin: 0 0 5px 0; color: #000000; font-size: 16px; font-weight: bold;">${item.productName}</p>
            <p style="margin: 0; color: #666666; font-size: 14px;">Quantity: ${item.quantity} × $${item.price.toFixed(2)}</p>
          </td>
          <td align="right" style="padding: 15px 0; border-bottom: 1px solid #e0e0e0;">
            <p style="margin: 0; color: #000000; font-size: 16px; font-weight: bold;">$${item.subtotal.toFixed(2)}</p>
          </td>
        </tr>
      `,
      )
      .join('');

    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Order Confirmation</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #ffffff;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #ffffff;">
          <tr>
            <td align="center" style="padding: 40px 20px;">
              <table width="600" cellpadding="0" cellspacing="0" style="background-color: #000000; border: 2px solid #000000;">
                <!-- Header -->
                <tr>
                  <td align="center" style="padding: 40px 20px; background-color: #000000;">
                    <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: bold; letter-spacing: 2px;">BEBRAND</h1>
                  </td>
                </tr>
                
                <!-- Content -->
                <tr>
                  <td style="padding: 40px 30px; background-color: #ffffff;">
                    <h2 style="margin: 0 0 10px 0; color: #000000; font-size: 24px; font-weight: bold;">Thank You, ${firstName}!</h2>
                    <p style="margin: 0 0 30px 0; color: #666666; font-size: 14px;">Order #${orderDetails.orderId}</p>
                    
                    <p style="margin: 0 0 30px 0; color: #000000; font-size: 16px; line-height: 1.6;">
                      Your order has been confirmed and is being processed. We'll notify you when it ships.
                    </p>
                    
                    <!-- Order Details -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 30px;">
                      <tr>
                        <td colspan="2" style="padding-bottom: 20px;">
                          <h3 style="margin: 0; color: #000000; font-size: 18px; font-weight: bold; border-bottom: 2px solid #000000; padding-bottom: 10px;">ORDER DETAILS</h3>
                        </td>
                      </tr>
                      ${itemsHtml}
                      <tr>
                        <td style="padding: 20px 0 0 0;">
                          <p style="margin: 0; color: #000000; font-size: 18px; font-weight: bold;">Total</p>
                        </td>
                        <td align="right" style="padding: 20px 0 0 0;">
                          <p style="margin: 0; color: #000000; font-size: 18px; font-weight: bold;">$${orderDetails.totalAmount.toFixed(2)}</p>
                        </td>
                      </tr>
                    </table>
                    
                    <!-- Shipping Address -->
                    ${
                      orderDetails.shippingAddress
                        ? `
                    <div style="margin-bottom: 30px;">
                      <h3 style="margin: 0 0 15px 0; color: #000000; font-size: 18px; font-weight: bold; border-bottom: 2px solid #000000; padding-bottom: 10px;">SHIPPING ADDRESS</h3>
                      <p style="margin: 0; color: #000000; font-size: 14px; line-height: 1.6;">
                        ${orderDetails.shippingAddress.street}<br>
                        ${orderDetails.shippingAddress.city}, ${orderDetails.shippingAddress.state} ${orderDetails.shippingAddress.zipCode}<br>
                        ${orderDetails.shippingAddress.country}
                      </p>
                    </div>
                    `
                        : ''
                    }
                    
                    <!-- CTA Button -->
                    <table cellpadding="0" cellspacing="0" style="margin: 0 auto;">
                      <tr>
                        <td align="center" style="background-color: #000000; padding: 15px 40px; border: 2px solid #000000;">
                          <a href="${this.configService.get<string>('FRONTEND_URL') || '#'}/orders" style="color: #ffffff; text-decoration: none; font-size: 16px; font-weight: bold; letter-spacing: 1px;">VIEW ORDER STATUS</a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                
                <!-- Footer -->
                <tr>
                  <td align="center" style="padding: 30px 20px; background-color: #000000; border-top: 2px solid #ffffff;">
                    <p style="margin: 0 0 10px 0; color: #ffffff; font-size: 14px;">
                      Questions about your order? Contact us at <a href="mailto:support@bebrand.com" style="color: #ffffff; text-decoration: underline;">support@bebrand.com</a>
                    </p>
                    <p style="margin: 0; color: #cccccc; font-size: 12px;">
                      © 2025 BeBrand. All rights reserved.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;
  }
}
