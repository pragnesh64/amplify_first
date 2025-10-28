# 🛡️ Admin Account Setup Guide

This guide walks through every supported way to create or promote an administrator in the Eventora platform. Use the option that best matches your access level and deployment stage.

---

## 📋 Before You Start

| Item | Details |
| --- | --- |
| AppSync API Region | `ap-south-1` |
| Cognito User Pool ID | `ap-south-1_ZgQvCae8v` |
| Cognito App Client ID | `6g8rg43pe41ie7vtjvmm74jsmr` |
| Identity Pool ID | `ap-south-1:1c56a1cf-bfaa-4c9f-9874-0fc594bea61f` |
| Default Admin Emails | `pragnesh@yopmail.com`, `admin@example.com` *(see `src/context/AuthContext.tsx`)* |

> ⚠️ **Security Reminder**: Treat admin access as highly privileged. Restrict accounts, rotate credentials, and enforce MFA where possible.

---

## Option 1 — 🤖 Auto-Promote by Email (Preferred during onboarding)

1. Open `src/context/AuthContext.tsx`.
2. Locate the `adminEmails` array.
   ```ts
   const adminEmails = ['pragnesh@yopmail.com', 'admin@example.com'];
   ```
3. Add the verified email addresses that should auto-promote to admin on first login.
4. Redeploy the frontend. Any user who signs up with an email in that list will receive the `admin` role when they first authenticate.

**Pros**: Quick, no backend changes, ideal for known collaborators.  
**Cons**: Requires code change + redeploy to add or remove admins.

---

## Option 2 — 🗄️ Promote via DynamoDB Console (Post-signup manual change)

Once a user has created an account:

1. Sign in to the AWS Console → **DynamoDB** → Tables.
2. Open the table that stores the `User` model (look for a table ending with `User-<environment>`).
3. Use the **Items** tab search/filter for the user’s `email`.
4. Edit the item and update the `role` attribute to `admin` (string).
5. Save, then have the user sign out/in to refresh their session.

**Pros**: No code changes, works immediately.  
**Cons**: Requires console access and manual edits.

---

## Option 3 — 🧪 Use Amplify Admin UI

1. Visit [https://admin.amplify.aws/](https://admin.amplify.aws/) and open your app.
2. Enable Admin UI access for the environment if not already done.
3. Navigate to **Data** → `User` model.
4. Add a new user or edit an existing record, setting `role = "admin"`.
5. Ask the user to refresh their session.

**Pros**: Friendly GUI, keeps all data updates under Amplify governance.  
**Cons**: Requires Admin UI access permissions.

---

## Option 4 — 🛠️ CLI / Scripted Promotion

Run the following Node script locally with Amplify credentials configured (`amplify pull` or `aws configure`):

```bash
node scripts/promote-admin.mjs user@example.com
```

Where `scripts/promote-admin.mjs` contains:

```ts
#!/usr/bin/env node
import { Amplify } from 'aws-amplify';
import outputs from '../amplify_outputs.json' assert { type: 'json' };
import { generateClient } from 'aws-amplify/data';

Amplify.configure(outputs);

const email = process.argv[2];
if (!email) {
  console.error('Usage: promote-admin.mjs <email>');
  process.exit(1);
}

const client = generateClient();
const { data: users } = await client.models.User.list({
  filter: { email: { eq: email } },
});

if (!users?.length) {
  console.error('User not found for email:', email);
  process.exit(1);
}

const [user] = users;
await client.models.User.update({
  id: user.id,
  role: 'admin',
});

console.log(`Promoted ${email} to admin.`);
```

**Pros**: Scriptable, auditable, no console clicks.  
**Cons**: Requires local environment set up with Amplify credentials.

---

## Option 5 — 🔐 Assign to Cognito Group (Optional Enhancement)

If you prefer using Cognito user groups instead of the `role` column:

1. In the AWS Console → **Cognito** → User Pools → `ap-south-1_ZgQvCae8v` → **Groups**.
2. Create a group named `Admin` if it does not exist.
3. Add the user to the `Admin` group.
4. Update `AuthContext.tsx` to read `cognito:groups` and set `role = 'admin'` based on membership.

**Pros**: Native Cognito permissioning, easier to integrate with other services.  
**Cons**: Requires code adjustment to honor groups, extra Cognito setup.

---

## 🚪 Creating the First Admin

1. Deploy backend + frontend (`npm run build && npm run deploy` or Amplify console pipeline).
2. Sign up using one of the pre-authorized admin emails. 
3. Confirm the email via Cognito verification.
4. Log in → the `My Bookings` screen should load, and the **Admin** menu items will appear.
5. Visit `/admin` to verify access to the dashboard.

If you forgot to preconfigure the email, use Option 2 or 3 to promote it afterward.

---

## 🧹 Cleaning Up Admin Access

- Remove the email from `adminEmails` (Option 1) or set the DynamoDB `role` back to `user`.
- In Cognito, remove the account from the `Admin` group (if using Option 5).
- Have the user sign out/in to refresh privileges.

---

## 📚 Quick Reference

| Action | Recommended Method |
| --- | --- |
| First admin during dev | Auto email list (Option 1) |
| Promote existing user | DynamoDB Console (Option 2) |
| Non-technical operator | Amplify Admin UI (Option 3) |
| Automated provisioning | Script / CLI (Option 4) |
| Enterprise governance | Cognito Groups (Option 5) |

---

Need more help? Ping the dev team or raise a ticket with the AWS environment owner.
