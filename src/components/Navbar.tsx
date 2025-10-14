import { Link, useNavigate } from 'react-router-dom';
import { Calendar, User, LogOut, LayoutDashboard, Ticket } from 'lucide-react';
import { signOut } from 'aws-amplify/auth';
import { useAuth } from '../context/AuthContext';

export function Navbar() {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
      window.location.reload();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-40">
      <div className="container-custom">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 text-2xl font-bold text-primary-600">
            <Calendar className="w-8 h-8" />
            <span>Eventora</span>
          </Link>

          {/* Navigation */}
          <div className="flex items-center space-x-6">
            {user && (
              <>
                <Link
                  to="/"
                  className="flex items-center space-x-1 text-gray-700 hover:text-primary-600 transition-colors"
                >
                  <Calendar className="w-5 h-5" />
                  <span>Events</span>
                </Link>

                {!isAdmin && (
                  <Link
                    to="/bookings"
                    className="flex items-center space-x-1 text-gray-700 hover:text-primary-600 transition-colors"
                  >
                    <Ticket className="w-5 h-5" />
                    <span>My Bookings</span>
                  </Link>
                )}

                {isAdmin && (
                  <Link
                    to="/admin"
                    className="flex items-center space-x-1 text-gray-700 hover:text-primary-600 transition-colors"
                  >
                    <LayoutDashboard className="w-5 h-5" />
                    <span>Dashboard</span>
                  </Link>
                )}

                <Link
                  to="/profile"
                  className="flex items-center space-x-1 text-gray-700 hover:text-primary-600 transition-colors"
                >
                  <User className="w-5 h-5" />
                  <span>{user.name}</span>
                </Link>

                <button
                  onClick={handleSignOut}
                  className="flex items-center space-x-1 text-gray-700 hover:text-red-600 transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Sign Out</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

