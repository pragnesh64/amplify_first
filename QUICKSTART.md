# 🚀 Quick Start Guide - Eventora

Get Eventora up and running in 5 minutes!

## 📋 Prerequisites

- Node.js 18+ installed
- AWS Account (free tier works!)
- Git installed

## ⚡ Quick Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Amplify Sandbox
Open a new terminal and run:
```bash
npx ampx sandbox
```

Wait for the message: **"Sandbox environment successfully deployed!"**

This creates your backend in AWS with:
- ✅ Authentication (AWS Cognito)
- ✅ Database (DynamoDB)
- ✅ GraphQL API
- ✅ Security rules

### 3. Start Development Server
In another terminal, run:
```bash
npm run dev
```

### 4. Open Your Browser
Navigate to: **http://localhost:5173**

## 👤 First Steps

### Sign Up as a User
1. Click "Sign Up" on the authentication screen
2. Enter your email and create a password
3. Verify your email
4. You're logged in as a regular user!

### Test User Features
- ✅ Browse events on the home page
- ✅ View event details
- ✅ Book tickets (you can create sample events as admin first)
- ✅ View your bookings
- ✅ Update your profile

### Become an Admin

**Option 1: Via AWS Console (Recommended)**
1. Go to AWS Console → DynamoDB
2. Find the table named like `User-xxxxx-SANDBOX`
3. Click "Explore items"
4. Find your user record (search by email)
5. Click "Edit"
6. Change `role` from `"user"` to `"admin"`
7. Save
8. Sign out and sign in again in your app

**Option 2: Via Code (Development)**
Edit `src/context/AuthContext.tsx` around line 35:

```typescript
// Create new user in database
const newUser = await client.models.User.create({
  email: attributes.email || '',
  name: attributes.name || attributes.email?.split('@')[0] || 'User',
  role: attributes.email === 'your-email@example.com' ? 'admin' : 'user', // Auto-assign admin
  createdAt: new Date().toISOString(),
});
```

### Test Admin Features
Once you're an admin:
- ✅ Access Admin Dashboard from navbar
- ✅ Create new events
- ✅ Edit events
- ✅ Delete events
- ✅ View analytics (revenue, tickets sold, etc.)

## 📊 Sample Events

Create your first event with these details:

**Event 1: Tech Workshop**
- Title: AWS Amplify Workshop
- Description: Learn to build full-stack apps with AWS Amplify
- Date: Pick a future date
- Location: Virtual / Online
- Total Tickets: 100
- Price: 25.00
- Category: Workshop

**Event 2: Meetup**
- Title: React Developers Meetup
- Description: Monthly gathering for React enthusiasts
- Date: Pick a future date
- Location: Tech Hub, Downtown
- Total Tickets: 50
- Price: 10.00
- Category: Meetup

**Event 3: Conference**
- Title: Cloud Computing Summit 2025
- Description: Industry leaders discuss cloud innovations
- Date: Pick a future date
- Location: Convention Center
- Total Tickets: 500
- Price: 99.00
- Category: Conference

## 🎯 Testing Complete Flow

1. **As Admin**: Create 2-3 events
2. **Sign Out**: Log out from admin account
3. **Create New Account**: Sign up as a new user
4. **As User**: Browse events and book tickets
5. **Switch Back to Admin**: View bookings in dashboard
6. **As User**: Cancel a booking
7. **As Admin**: See updated analytics

## 🛠️ Development Tips

### Hot Reload
Both frontend and backend support hot reload:
- **Frontend**: Edit any `.tsx` file, changes appear instantly
- **Backend**: Edit `amplify/data/resource.ts`, Amplify redeploys automatically

### Debugging
- **Check browser console** for frontend errors
- **Check terminal** where `npx ampx sandbox` is running for backend logs
- **AWS Console** → CloudWatch for detailed backend logs

### Reset Database
To start fresh:
```bash
# Stop sandbox (Ctrl+C in sandbox terminal)
# Delete all data
npx ampx sandbox delete
# Start fresh sandbox
npx ampx sandbox
```

## 🌐 Deployment to Production

### Deploy Backend
```bash
npx ampx sandbox deploy
```

### Deploy Frontend
Option 1: **AWS Amplify Hosting**
1. Push code to GitHub
2. Go to AWS Amplify Console
3. Connect repository
4. Auto-deploy enabled!

Option 2: **Vercel**
```bash
npm install -g vercel
vercel
```

Option 3: **Netlify**
```bash
npm run build
# Upload dist/ folder to Netlify
```

## 🐛 Troubleshooting

### "Failed to fetch user"
- Make sure sandbox is running
- Check `amplify_outputs.json` exists
- Refresh the page

### "Access Denied" on Event Creation
- Make sure you're logged in as admin
- Check your role in DynamoDB

### Events Not Showing
- Create events as admin first
- Check browser console for errors
- Verify sandbox is running

### Booking Failed
- Ensure event has available tickets
- Check you're logged in
- Verify `ticketsAvailable > 0`

## 📚 Next Steps

- Read the full [README.md](./README.md) for architecture details
- Explore the codebase structure
- Customize the theme in `tailwind.config.js`
- Add new features!

## 🆘 Need Help?

- Check AWS Amplify Docs: https://docs.amplify.aws/
- DynamoDB Console for data inspection
- Browser DevTools → Network tab for API calls

---

**Happy Building! 🎉**

