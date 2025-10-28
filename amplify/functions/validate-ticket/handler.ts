import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, QueryCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";

const dynamoClient = new DynamoDBClient({ region: process.env.AWS_REGION });
const docClient = DynamoDBDocumentClient.from(dynamoClient);

export const handler = async (event: any) => {
  console.log("Validating ticket:", JSON.stringify(event, null, 2));

  try {
    const { qrCode } = event.arguments;

    if (!qrCode) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          valid: false,
          message: "QR code is required",
        }),
      };
    }

    // Query DynamoDB to find the booking with this QR code
    // Note: You'll need to add a GSI (Global Secondary Index) on qrCode field
    const queryParams = {
      TableName: process.env.BOOKING_TABLE_NAME,
      IndexName: "byQRCode",
      KeyConditionExpression: "qrCode = :qrCode",
      ExpressionAttributeValues: {
        ":qrCode": qrCode,
      },
    };

    const result = await docClient.send(new QueryCommand(queryParams));

    if (!result.Items || result.Items.length === 0) {
      return {
        statusCode: 404,
        body: JSON.stringify({
          valid: false,
          message: "Invalid QR code - booking not found",
        }),
      };
    }

    const booking = result.Items[0];

    // Check if ticket is already used
    if (booking.status === "used") {
      return {
        statusCode: 400,
        body: JSON.stringify({
          valid: false,
          message: "Ticket already used",
          booking: {
            eventTitle: booking.eventTitle,
            userName: booking.userName,
            usedAt: booking.usedAt,
          },
        }),
      };
    }

    // Check if ticket is cancelled
    if (booking.status === "cancelled") {
      return {
        statusCode: 400,
        body: JSON.stringify({
          valid: false,
          message: "Ticket has been cancelled",
          booking: {
            eventTitle: booking.eventTitle,
            userName: booking.userName,
          },
        }),
      };
    }

    // Update ticket status to "used"
    const updateParams = {
      TableName: process.env.BOOKING_TABLE_NAME,
      Key: {
        id: booking.id,
      },
      UpdateExpression: "SET #status = :status, usedAt = :usedAt",
      ExpressionAttributeNames: {
        "#status": "status",
      },
      ExpressionAttributeValues: {
        ":status": "used",
        ":usedAt": new Date().toISOString(),
      },
      ReturnValues: "ALL_NEW",
    };

    const updateResult = await docClient.send(new UpdateCommand(updateParams));

    return {
      statusCode: 200,
      body: JSON.stringify({
        valid: true,
        message: "Ticket validated successfully",
        booking: {
          id: booking.id,
          eventTitle: booking.eventTitle,
          userName: booking.userName,
          userEmail: booking.userEmail,
          quantity: booking.quantity,
          totalPrice: booking.totalPrice,
          validatedAt: updateResult.Attributes?.usedAt,
        },
      }),
    };
  } catch (error) {
    console.error("Error validating ticket:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        valid: false,
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      }),
    };
  }
};

