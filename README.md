# 🎫 Eventora - Event Booking Platform

A modern, full-stack event booking platform built with **AWS Amplify**, **React**, **TypeScript**, and **Tailwind CSS**.

## 🌟 Features

### For Users
- 🔍 **Browse Events** - Discover upcoming events with beautiful card layouts
- 🎟️ **Book Tickets** - Easy ticket booking with quantity selection
- 📋 **My Bookings** - View and manage your bookings
- ❌ **Cancel Bookings** - Cancel bookings and get automatic refunds
- 👤 **User Profile** - Manage your account information

### For Admins
- 📊 **Dashboard** - Real-time analytics and overview
- ➕ **Create Events** - Add new events with all details
- ✏️ **Edit Events** - Update event information
- 🗑️ **Delete Events** - Remove events
- 📈 **Analytics** - View total revenue, tickets sold, and bookings

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Backend**: AWS Amplify Gen 2
- **Database**: DynamoDB (via Amplify Data)
- **Authentication**: AWS Cognito (via Amplify Auth)
- **Icons**: Lucide React
- **Routing**: React Router v6
- **Date Handling**: date-fns

## 📦 Data Models

### User
```typescript
{
  id: string
  email: string
  name: string
  role: "user" | "admin"
  phone?: string
  createdAt: datetime
}
```

### Event
```typescript
{
  id: string
  title: string
  description: string
  date: datetime
  location: string
  totalTickets: number
  ticketsAvailable: number
  price: number
  category: string
  imageUrl?: string
  createdBy: string
  createdAt: datetime
}
```

### Booking
```typescript
{
  id: string
  eventId: string
  userId: string
  userName: string
  userEmail: string
  eventTitle: string
  quantity: number
  totalPrice: number
  status: "confirmed" | "cancelled"
  createdAt: datetime
}
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- AWS Account
- AWS Amplify CLI

### Installation

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd amplify_first
```

2. **Install dependencies**
```bash
npm install
```

3. **Start the Amplify sandbox**
```bash
npx ampx sandbox
```

This will:
- Deploy your backend to AWS
- Set up authentication
- Create database tables
- Generate the `amplify_outputs.json` file

4. **Start the development server**
```bash
npm run dev
```

5. **Open your browser**
Navigate to `http://localhost:5173`

## 👥 User Roles

### Creating an Admin User

By default, all new users are created with the "user" role. To create an admin:

1. Sign up as a normal user
2. Go to AWS Console → DynamoDB
3. Find the `User` table
4. Locate your user record
5. Change the `role` field from "user" to "admin"
6. Sign out and sign in again

Alternatively, you can modify the `AuthContext.tsx` to check for specific email addresses and automatically assign admin role.

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Button.tsx
│   ├── Card.tsx
│   ├── Input.tsx
│   ├── Modal.tsx
│   └── Navbar.tsx
├── context/            # React Context providers
│   └── AuthContext.tsx
├── pages/
│   ├── user/          # User-facing pages
│   │   ├── Home.tsx
│   │   ├── EventDetails.tsx
│   │   ├── MyBookings.tsx
│   │   └── Profile.tsx
│   └── admin/         # Admin-only pages
│       ├── Dashboard.tsx
│       └── ManageEvents.tsx
├── utils/             # Helper functions
│   └── helpers.ts
├── App.tsx            # Main app with routing
└── main.tsx          # Entry point

amplify/
├── auth/
│   └── resource.ts   # Authentication configuration
├── data/
│   └── resource.ts   # Database schema
└── backend.ts        # Backend configuration
```

## 🎨 Key Features Explained

### Role-Based Access Control
- Users can browse events, book tickets, and manage their bookings
- Admins have additional access to dashboard and event management
- Protected routes ensure proper authorization

### Real-time Updates
- Event ticket availability updates automatically
- Booking confirmations are instant
- Dashboard shows real-time statistics

### Responsive Design
- Mobile-first approach
- Beautiful UI with Tailwind CSS
- Smooth animations with Framer Motion principles

### Category Filtering
- Filter events by category (Conference, Workshop, Meetup, etc.)
- Easy navigation and discovery

## 🔒 Security

- Authentication required for all booking operations
- Owner-based authorization for user data
- Role-based access for admin features
- Secure API with AWS Amplify

## 🌐 Deployment

### Deploy to AWS Amplify Hosting

1. **Push to GitHub**
```bash
git add .
git commit -m "Initial commit"
git push origin main
```

2. **Connect to Amplify Console**
- Go to AWS Amplify Console
- Choose "Host web app"
- Connect your GitHub repository
- Amplify will auto-detect build settings

3. **Deploy**
- Amplify will build and deploy automatically
- Your app will be live with a URL like: `https://main.xxxxx.amplifyapp.com`

## 📝 Environment Variables

No environment variables needed! Amplify generates `amplify_outputs.json` automatically.

## 🧪 Testing the Application

### As a User:
1. Sign up with your email
2. Browse events on the home page
3. Click on an event to view details
4. Book tickets
5. View your bookings in "My Bookings"
6. Manage your profile

### As an Admin:
1. Create an admin account (see User Roles section)
2. Access the Admin Dashboard
3. Create new events
4. Edit existing events
5. View analytics and bookings

## 🎯 Future Enhancements

- [ ] Payment integration (Stripe/Razorpay)
- [ ] QR code generation for tickets
- [ ] Email notifications
- [ ] Event reviews and ratings
- [ ] Advanced search and filters
- [ ] Multi-image upload for events
- [ ] Calendar integration
- [ ] Social sharing

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- AWS Amplify Team
- React Community
- Tailwind CSS
- Lucide Icons

---

Built with ❤️ using AWS Amplify Gen 2
