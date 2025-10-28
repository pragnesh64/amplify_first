import { defineFunction } from '@aws-amplify/backend';

export const sendEventReminders = defineFunction({
  name: 'send-event-reminders',
  entry: './handler.ts',
  environment: {
    SES_FROM_EMAIL: 'no-reply@eventora.com', // Update with your verified SES email
  },
  timeoutSeconds: 300, // 5 minutes for batch processing
  schedule: 'cron(0 10 * * ? *)', // Run daily at 10 AM UTC
});

