import { Link, useNavigate } from 'react-router-dom';
import { Calendar, User, LogOut, LayoutDashboard, Ticket, ScanLine } from 'lucide-react';
import { signOut } from 'aws-amplify/auth';
import { useAuth } from '../context/AuthContext';
import { ThemeToggle } from './ThemeToggle';

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
    <nav className="navbar">
      <div className="container-custom">
        <div className="navbar-container">
          {/* Logo */}
          <Link to="/" className="navbar-logo">
            <Calendar className="w-8 h-8" />
            <span>Eventora</span>
          </Link>

          {/* Navigation */}
          <div className="navbar-menu">
            {user && (
              <>
                <Link to="/" className="navbar-link">
                  <Calendar className="w-5 h-5" />
                  <span>Events</span>
                </Link>

                {!isAdmin && (
                  <Link to="/bookings" className="navbar-link">
                    <Ticket className="w-5 h-5" />
                    <span>My Bookings</span>
                  </Link>
                )}

                {isAdmin && (
                  <>
                    <Link to="/admin" className="navbar-link">
                      <LayoutDashboard className="w-5 h-5" />
                      <span>Dashboard</span>
                    </Link>
                    <Link to="/admin/scan" className="navbar-link">
                      <ScanLine className="w-5 h-5" />
                      <span>Scan Tickets</span>
                    </Link>
                  </>
                )}

                <Link to="/profile" className="navbar-link">
                  <User className="w-5 h-5" />
                  <span>{user.name}</span>
                </Link>

                <ThemeToggle />

                <button 
                  onClick={handleSignOut} 
                  className="navbar-link-signout"
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

