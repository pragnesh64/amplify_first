import { defineFunction } from '@aws-amplify/backend';

export const sendTicketEmail = defineFunction({
  name: 'send-ticket-email',
  entry: './handler.ts',
  environment: {
    SES_FROM_EMAIL: 'no-reply@eventora.com', // Update with your verified SES email
  },
  timeoutSeconds: 30,
});

