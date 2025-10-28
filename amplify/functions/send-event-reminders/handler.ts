import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, ScanCommand } from "@aws-sdk/lib-dynamodb";

const ses = new SESClient({ region: process.env.AWS_REGION });
const dynamoClient = new DynamoDBClient({ region: process.env.AWS_REGION });
const docClient = DynamoDBDocumentClient.from(dynamoClient);

export const handler = async () => {
  console.log("Running event reminder check...");

  try {
    // Get all events happening in the next 24-48 hours
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const dayAfterTomorrow = new Date(now.getTime() + 48 * 60 * 60 * 1000);

    // Scan events table for upcoming events
    const eventsParams = {
      TableName: process.env.EVENT_TABLE_NAME,
      FilterExpression: "#date BETWEEN :tomorrow AND :dayAfter",
      ExpressionAttributeNames: {
        "#date": "date",
      },
      ExpressionAttributeValues: {
        ":tomorrow": tomorrow.toISOString(),
        ":dayAfter": dayAfterTomorrow.toISOString(),
      },
    };

    const eventsResult = await docClient.send(new ScanCommand(eventsParams));
    
    if (!eventsResult.Items || eventsResult.Items.length === 0) {
      console.log("No upcoming events found");
      return {
        statusCode: 200,
        body: JSON.stringify({ message: "No reminders to send" }),
      };
    }

    console.log(`Found ${eventsResult.Items.length} upcoming events`);

    // For each event, get all confirmed bookings
    for (const event of eventsResult.Items) {
      const bookingsParams = {
        TableName: process.env.BOOKING_TABLE_NAME,
        FilterExpression: "eventId = :eventId AND #status = :status",
        ExpressionAttributeNames: {
          "#status": "status",
        },
        ExpressionAttributeValues: {
          ":eventId": event.id,
          ":status": "confirmed",
        },
      };

      const bookingsResult = await docClient.send(new ScanCommand(bookingsParams));

      if (!bookingsResult.Items || bookingsResult.Items.length === 0) {
        continue;
      }

      // Send reminder email to each booking
      for (const booking of bookingsResult.Items) {
        await sendReminderEmail(booking, event);
      }
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Reminders sent successfully" }),
    };
  } catch (error) {
    console.error("Error sending reminders:", error);
    throw error;
  }
};

async function sendReminderEmail(booking: any, event: any) {
  const eventDate = new Date(event.date);
  const formattedDate = eventDate.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

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
            background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
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
          .event-card {
            background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
            border-radius: 12px;
            padding: 24px;
            color: white;
            margin: 24px 0;
          }
          .event-card h2 {
            margin: 0 0 16px 0;
            font-size: 24px;
          }
          .event-info {
            display: flex;
            align-items: center;
            margin: 12px 0;
            opacity: 0.95;
          }
          .qr-section {
            text-align: center;
            margin: 32px 0;
            padding: 24px;
            background-color: #f9fafb;
            border-radius: 12px;
          }
          .footer {
            background-color: #f3f4f6;
            padding: 24px 30px;
            text-align: center;
            color: #6b7280;
            font-size: 14px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>⏰ Event Reminder!</h1>
            <p style="margin: 8px 0 0 0; opacity: 0.95;">Your event is coming up soon</p>
          </div>
          
          <div class="content">
            <p style="color: #1f2937; font-size: 16px;">Hi ${booking.userName},</p>
            <p style="color: #4b5563; line-height: 1.6;">
              This is a friendly reminder that your event is happening soon! Don't forget to bring your ticket QR code.
            </p>

            <div class="event-card">
              <h2>${event.title}</h2>
              <div class="event-info">
                📅 ${formattedDate}
              </div>
              <div class="event-info">
                📍 ${event.location}
              </div>
              <div class="event-info">
                🎫 ${booking.quantity} ticket(s)
              </div>
            </div>

            <div class="qr-section">
              <h3 style="color: #1f2937; margin: 0 0 16px 0;">🎫 Your Ticket QR Code</h3>
              <div style="background: white; padding: 20px; border-radius: 8px; display: inline-block;">
                <img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(booking.qrCode)}" alt="Ticket QR Code" width="200" height="200" />
              </div>
              <p style="color: #6b7280; font-size: 14px; margin: 16px 0 0 0;">
                Show this QR code at the event entrance
              </p>
            </div>

            <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; border-radius: 8px; margin: 24px 0;">
              <p style="margin: 0; color: #92400e;">
                <strong>💡 Pro Tips:</strong><br/>
                • Arrive 15 minutes early for smooth entry<br/>
                • Save this QR code offline on your phone<br/>
                • Check event updates on our platform
              </p>
            </div>
          </div>

          <div class="footer">
            <p style="margin: 0 0 8px 0;">
              <strong>Eventora</strong> - Your Premium Event Booking Platform
            </p>
            <p style="margin: 0; font-size: 12px;">
              See you at the event! 🎉
            </p>
          </div>
        </div>
      </body>
    </html>
  `;

  const params = {
    Source: process.env.SES_FROM_EMAIL || "no-reply@eventora.com",
    Destination: {
      ToAddresses: [booking.userEmail],
    },
    Message: {
      Subject: {
        Data: `⏰ Reminder: ${event.title} is Tomorrow!`,
        Charset: "UTF-8",
      },
      Body: {
        Html: {
          Data: emailHtml,
          Charset: "UTF-8",
        },
        Text: {
          Data: `Hi ${booking.userName},\n\nThis is a reminder that "${event.title}" is happening soon!\n\nDate: ${formattedDate}\nLocation: ${event.location}\nTickets: ${booking.quantity}\n\nYour QR Code: ${booking.qrCode}\n\nSee you there!\n\nEventora Team`,
          Charset: "UTF-8",
        },
      },
    },
  };

  const command = new SendEmailCommand(params);
  await ses.send(command);
  console.log(`Reminder sent to ${booking.userEmail}`);
}

