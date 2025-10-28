import { type ClientSchema, a, defineData } from "@aws-amplify/backend";

/*== EVENTORA - Event Booking Platform Schema ============================
This schema defines the data models for the event booking platform:
- User: Extended user profile with role (user/admin)
- Event: Events created by admins
- Booking: User bookings for events
=========================================================================*/

const schema = a.schema({
  User: a
    .model({
      email: a.string().required(),
      name: a.string().required(),
      role: a.string().required().default("user"), // "user" or "admin"
      phone: a.string(),
      createdAt: a.datetime(),
    })
    .authorization((allow) => [
      allow.owner(),
      allow.authenticated().to(["read"]),
    ]),

  Event: a
    .model({
      title: a.string().required(),
      description: a.string().required(),
      date: a.datetime().required(),
      location: a.string().required(),
      totalTickets: a.integer().required(),
      ticketsAvailable: a.integer().required(),
      price: a.float().required(),
      category: a.string().required(),
      imageUrl: a.string(),
      createdBy: a.string().required(), // userId of admin who created it
      createdAt: a.datetime(),
    })
    .authorization((allow) => [
      allow.authenticated().to(["read", "create", "update", "delete"]), // Temporary: allow all authenticated users
      allow.group("Admin").to(["create", "update", "delete"]),
      allow.owner().to(["read", "update", "delete"]), // Owner can also update/delete
    ]),

  Booking: a
    .model({
      eventId: a.string().required(),
      userId: a.string().required(),
      userName: a.string().required(),
      userEmail: a.string().required(),
      eventTitle: a.string().required(),
      quantity: a.integer().required(),
      totalPrice: a.float().required(),
      status: a.string().required().default("confirmed"), // "confirmed", "cancelled", or "used"
      qrCode: a.string(), // Unique QR code for ticket validation
      usedAt: a.datetime(), // Timestamp when ticket was scanned/used
      createdAt: a.datetime(),
    })
    .authorization((allow) => [
      allow.owner(),
      allow.group("Admin").to(["read", "update"]),
      allow.authenticated().to(["read"]),
    ])
    .secondaryIndexes((index) => [
      index("qrCode"), // Add GSI for QR code validation
    ]),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: "userPool",
    // API Key is used for a.allow.public() rules
    apiKeyAuthorizationMode: {
      expiresInDays: 30,
    },
  },
});
