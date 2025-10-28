import { CognitoIdentityProviderClient, AdminAddUserToGroupCommand } from "@aws-sdk/client-cognito-identity-provider";

const cognitoClient = new CognitoIdentityProviderClient({ region: process.env.AWS_REGION });

// Admin emails list - these users will be added to Admin group
const ADMIN_EMAILS = [
  'pragnesh@yopmail.com',
  'admin@eventora.com',
  // Add more admin emails here
];

export const handler = async (event: any) => {
  console.log('Post-confirmation trigger:', JSON.stringify(event, null, 2));

  const { userPoolId, userName } = event;
  const userEmail = event.request.userAttributes.email?.toLowerCase();

  try {
    // Determine which group to assign
    const groupName = ADMIN_EMAILS.includes(userEmail) ? 'Admin' : 'User';

    // Add user to the appropriate group
    const command = new AdminAddUserToGroupCommand({
      GroupName: groupName,
      Username: userName,
      UserPoolId: userPoolId,
    });

    await cognitoClient.send(command);
    
    console.log(`User ${userName} (${userEmail}) added to ${groupName} group`);

    return event;
  } catch (error) {
    console.error('Error adding user to group:', error);
    // Don't throw error - allow user to be created even if group assignment fails
    return event;
  }
};

