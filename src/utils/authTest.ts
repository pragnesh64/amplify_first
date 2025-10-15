import { fetchUserAttributes } from 'aws-amplify/auth';

export async function checkUserGroups() {
  try {
    const userAttributes = await fetchUserAttributes();
    console.log('User attributes:', userAttributes);
    
    // Check if user has admin groups
    const attributesRecord = userAttributes as Record<string, string | undefined>;
    const rawGroups =
      attributesRecord['cognito:groups'] ??
      attributesRecord['custom:groups'];
    const groups = rawGroups
      ? rawGroups.split(',').map(group => group.trim()).filter(Boolean)
      : [];
    console.log('User groups:', groups);
    
    return {
      isAdmin: groups.includes('Admin'),
      groups: groups,
      userId: userAttributes.sub,
      email: userAttributes.email
    };
  } catch (error) {
    console.error('Error checking user groups:', error);
    return {
      isAdmin: false,
      groups: [],
      userId: null,
      email: null
    };
  }
}
