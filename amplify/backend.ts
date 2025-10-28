import { defineBackend } from '@aws-amplify/backend';
import { PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { auth } from './auth/resource';
import { data } from './data/resource';
import { sendTicketEmail } from './functions/send-ticket-email/resource';
import { validateTicket } from './functions/validate-ticket/resource';
import { sendEventReminders } from './functions/send-event-reminders/resource';
// import { postConfirmation } from './functions/post-confirmation/resource';

const backend = defineBackend({
  auth,
  data,
  sendTicketEmail,
  validateTicket,
  sendEventReminders,
  // postConfirmation,
});

// NOTE: Cognito triggers are temporarily disabled due to TypeScript errors
// TODO: Re-enable post-confirmation trigger after updating to newer Amplify version
// backend.auth.resources.userPool.addTrigger(
//   backend.auth.resources.userPool.UserPoolOperation.POST_CONFIRMATION,
//   backend.postConfirmation.resources.lambda
// );

// Grant Cognito permissions to post-confirmation function
// backend.postConfirmation.resources.lambda.addToRolePolicy(
//   new PolicyStatement({
//     actions: ['cognito-idp:AdminAddUserToGroup'],
//     resources: [backend.auth.resources.userPool.userPoolArn],
//   })
// );

// Grant SES permissions to email functions
const sesPolicy = new PolicyStatement({
  actions: ['ses:SendEmail', 'ses:SendRawEmail'],
  resources: ['*'],
});

backend.sendTicketEmail.resources.lambda.addToRolePolicy(sesPolicy);
backend.sendEventReminders.resources.lambda.addToRolePolicy(sesPolicy);

// Grant DynamoDB access to functions
backend.sendTicketEmail.resources.lambda.addToRolePolicy(
  new PolicyStatement({
    actions: ['dynamodb:GetItem', 'dynamodb:Query'],
    resources: [
      backend.data.resources.tables['Event'].tableArn,
      backend.data.resources.tables['Booking'].tableArn,
    ],
  })
);

backend.validateTicket.resources.lambda.addToRolePolicy(
  new PolicyStatement({
    actions: ['dynamodb:GetItem', 'dynamodb:Query', 'dynamodb:UpdateItem'],
    resources: [
      backend.data.resources.tables['Booking'].tableArn,
      `${backend.data.resources.tables['Booking'].tableArn}/index/*`,
    ],
  })
);

backend.sendEventReminders.resources.lambda.addToRolePolicy(
  new PolicyStatement({
    actions: ['dynamodb:Scan', 'dynamodb:Query'],
    resources: [
      backend.data.resources.tables['Event'].tableArn,
      backend.data.resources.tables['Booking'].tableArn,
    ],
  })
);

// Add environment variables for table names
backend.validateTicket.addEnvironment('BOOKING_TABLE_NAME', backend.data.resources.tables['Booking'].tableName);
backend.sendEventReminders.addEnvironment('EVENT_TABLE_NAME', backend.data.resources.tables['Event'].tableName);
backend.sendEventReminders.addEnvironment('BOOKING_TABLE_NAME', backend.data.resources.tables['Booking'].tableName);
