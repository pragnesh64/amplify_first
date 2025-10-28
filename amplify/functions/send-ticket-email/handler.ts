import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand } from "@aws-sdk/lib-dynamodb";

const ses = new SESClient({ region: process.env.AWS_REGION });
const dynamoClient = new DynamoDBClient({ region: process.env.AWS_REGION });
const docClient = DynamoDBDocumentClient.from(dynamoClient);

export const handler = async (event: any) => {
  console.log("Received event:", JSON.stringify(event, null, 2));

  try {
    const { bookingId, userEmail, userName, eventTitle, quantity, totalPrice, qrCode } = event.arguments;

    // Email HTML template with QR code
    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body {
              font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
              background-color: #f9fafb;
              margin: 0;
              padding: 0;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              background-color: #ffffff;
              border-radius: 16px;
              overflow: hidden;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }
            .header {
              background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
              color: white;
              padding: 40px 30px;
              text-align: center;
            }
            .header h1 {
              margin: 0;
              font-size: 28px;
              font-weight: 700;
            }
            .content {
              padding: 40px 30px;
            }
            .ticket-info {
              background-color: #f3f4f6;
              border-radius: 12px;
              padding: 24px;
              margin: 24px 0;
            }
            .ticket-info h2 {
              margin: 0 0 16px 0;
              color: #1f2937;
              font-size: 20px;
            }
            .info-row {
              display: flex;
              justify-content: space-between;
              padding: 12px 0;
              border-bottom: 1px solid #e5e7eb;
            }
            .info-row:last-child {
              border-bottom: none;
            }
            .info-label {
              color: #6b7280;
              font-weight: 500;
            }
            .info-value {
              color: #1f2937;
              font-weight: 600;
            }
            .qr-section {
              text-align: center;
              margin: 32px 0;
              padding: 24px;
              background-color: #f9fafb;
              border-radius: 12px;
            }
            .qr-code {
              background: white;
              padding: 20px;
              border-radius: 8px;
              display: inline-block;
              margin: 16px 0;
            }
            .footer {
              background-color: #f3f4f6;
              padding: 24px 30px;
              text-align: center;
              color: #6b7280;
              font-size: 14px;
            }
            .button {
              display: inline-block;
              background: #3b82f6;
              color: white;
              padding: 12px 32px;
              border-radius: 8px;
              text-decoration: none;
              font-weight: 600;
              margin: 16px 0;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Booking Confirmed!</h1>
              <p style="margin: 8px 0 0 0; opacity: 0.95;">Your ticket for ${eventTitle}</p>
            </div>
            
            <div class="content">
              <p style="color: #1f2937; font-size: 16px;">Hi ${userName},</p>
              <p style="color: #4b5563; line-height: 1.6;">
                Great news! Your booking has been confirmed. Below are your ticket details and QR code.
                Please show this QR code at the event entrance.
              </p>

              <div class="ticket-info">
                <h2>📋 Booking Details</h2>
                <div class="info-row">
                  <span class="info-label">Event</span>
                  <span class="info-value">${eventTitle}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Quantity</span>
                  <span class="info-value">${quantity} ticket(s)</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Total Price</span>
                  <span class="info-value">$${totalPrice.toFixed(2)}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Booking ID</span>
                  <span class="info-value">${bookingId}</span>
                </div>
              </div>

              <div class="qr-section">
                <h3 style="color: #1f2937; margin: 0 0 8px 0;">🎫 Your Ticket QR Code</h3>
                <p style="color: #6b7280; font-size: 14px; margin: 0 0 16px 0;">
                  Show this at the event entrance
                </p>
                <div class="qr-code">
                  <img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrCode)}" alt="Ticket QR Code" width="200" height="200" />
                </div>
                <p style="color: #6b7280; font-size: 12px; margin: 16px 0 0 0;">
                  QR Code: ${qrCode}
                </p>
              </div>

              <div style="text-align: center; margin: 24px 0;">
                <p style="color: #6b7280; font-size: 14px;">
                  💡 <strong>Pro tip:</strong> Download this QR code to your phone for offline access
                </p>
              </div>
            </div>

            <div class="footer">
              <p style="margin: 0 0 8px 0;">
                <strong>Eventora</strong> - Your Premium Event Booking Platform
              </p>
              <p style="margin: 0; font-size: 12px;">
                Need help? Contact us at support@eventora.com
              </p>
            </div>
          </div>
        </body>
      </html>
    `;

    const params = {
      Source: process.env.SES_FROM_EMAIL || "no-reply@eventora.com",
      Destination: {
        ToAddresses: [userEmail],
      },
      Message: {
        Subject: {
          Data: `🎟️ Your Ticket for ${eventTitle} - Booking Confirmed!`,
          Charset: "UTF-8",
        },
        Body: {
          Html: {
            Data: emailHtml,
            Charset: "UTF-8",
          },
          Text: {
            Data: `Hi ${userName},\n\nYour booking for "${eventTitle}" has been confirmed!\n\nBooking Details:\n- Event: ${eventTitle}\n- Quantity: ${quantity} ticket(s)\n- Total Price: $${totalPrice.toFixed(2)}\n- Booking ID: ${bookingId}\n\nYour QR Code: ${qrCode}\n\nPlease show this QR code at the event entrance.\n\nThank you for using Eventora!`,
            Charset: "UTF-8",
          },
        },
      },
    };

    const command = new SendEmailCommand(params);
    const result = await ses.send(command);

    console.log("Email sent successfully:", result.MessageId);

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Ticket email sent successfully",
        messageId: result.MessageId,
      }),
    };
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
};

