import { defineFunction } from '@aws-amplify/backend';

export const validateTicket = defineFunction({
  name: 'validate-ticket',
  entry: './handler.ts',
  timeoutSeconds: 30,
});

