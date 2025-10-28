import { useEffect, useState } from 'react';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../../amplify/data/resource';
import { Card } from '../../components/Card';
import { Calendar, Ticket, Users, DollarSign, TrendingUp } from 'lucide-react';
import { formatCurrency } from '../../utils/helpers';

const client = generateClient<Schema>();

export function Dashboard() {
  const [stats, setStats] = useState({
    totalEvents: 0,
    activeEvents: 0,
    totalBookings: 0,
    totalRevenue: 0,
    totalTicketsSold: 0,
  });
  const [recentBookings, setRecentBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch events
      const { data: events } = await client.models.Event.list();
      const activeEvents = (events || []).filter(
        event => new Date(event.date) > new Date()
      );

      // Fetch bookings
      const { data: bookings } = await client.models.Booking.list();
      const confirmedBookings = (bookings || []).filter(b => b.status === 'confirmed');
      
      const totalRevenue = confirmedBookings.reduce((sum, b) => sum + (b.totalPrice || 0), 0);
      const totalTicketsSold = confirmedBookings.reduce((sum, b) => sum + (b.quantity || 0), 0);

      setStats({
        totalEvents: events?.length || 0,
        activeEvents: activeEvents.length,
        totalBookings: confirmedBookings.length,
        totalRevenue,
        totalTicketsSold,
      });

      // Get recent bookings
      const sortedBookings = confirmedBookings
        .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
        .slice(0, 5);
      setRecentBookings(sortedBookings);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Modern Hero Section */}
      <div className="relative bg-gradient-to-r from-primary-600 via-primary-700 to-primary-800 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative container-custom py-16">
          <div className="max-w-4xl">
            <h1 className="text-4xl lg:text-5xl font-bold mb-4 bg-gradient-to-r from-white to-primary-100 bg-clip-text text-transparent">
              Admin Dashboard
            </h1>
            <p className="text-primary-100 text-lg mb-2">
              Monitor and manage your event platform performance
            </p>
            <p className="text-primary-200 text-sm">
              Real-time analytics and insights
            </p>
          </div>
        </div>
      </div>

      <div className="container-custom py-12">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <Card className="hover:shadow-xl transition-all duration-300 border-l-4 border-l-blue-500">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                  <Calendar className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <TrendingUp className="w-5 h-5 text-green-500" />
              </div>
              <h3 className="text-muted text-sm font-medium mb-1">Total Events</h3>
              <p className="text-4xl font-bold text-foreground">{stats.totalEvents}</p>
              <p className="text-sm text-muted mt-2">
                <span className="text-green-600 font-medium">{stats.activeEvents}</span> active
              </p>
            </div>
          </Card>

          <Card className="hover:shadow-xl transition-all duration-300 border-l-4 border-l-green-500">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl">
                  <Ticket className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <TrendingUp className="w-5 h-5 text-green-500" />
              </div>
              <h3 className="text-muted text-sm font-medium mb-1">Tickets Sold</h3>
              <p className="text-4xl font-bold text-foreground">{stats.totalTicketsSold}</p>
              <p className="text-sm text-muted mt-2">across all events</p>
            </div>
          </Card>

          <Card className="hover:shadow-xl transition-all duration-300 border-l-4 border-l-purple-500">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
                  <Users className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <TrendingUp className="w-5 h-5 text-green-500" />
              </div>
              <h3 className="text-muted text-sm font-medium mb-1">Total Bookings</h3>
              <p className="text-4xl font-bold text-foreground">{stats.totalBookings}</p>
              <p className="text-sm text-muted mt-2">confirmed bookings</p>
            </div>
          </Card>

          <Card className="hover:shadow-xl transition-all duration-300 border-l-4 border-l-yellow-500">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-xl">
                  <DollarSign className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                </div>
                <TrendingUp className="w-5 h-5 text-green-500" />
              </div>
              <h3 className="text-muted text-sm font-medium mb-1">Total Revenue</h3>
              <p className="text-4xl font-bold text-foreground">
                {formatCurrency(stats.totalRevenue)}
              </p>
              <p className="text-sm text-muted mt-2">from all bookings</p>
            </div>
          </Card>
        </div>

        {/* Recent Bookings */}
        <Card className="shadow-lg">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-foreground">Recent Bookings</h2>
              <span className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-medium">
                Latest 5
              </span>
            </div>
            
            {recentBookings.length === 0 ? (
              <div className="text-center py-12">
                <Ticket className="w-16 h-16 mx-auto text-muted mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">No bookings yet</h3>
                <p className="text-muted">
                  Bookings will appear here once users start purchasing tickets
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 font-semibold text-foreground">Customer</th>
                      <th className="text-left py-3 px-4 font-semibold text-foreground">Event</th>
                      <th className="text-left py-3 px-4 font-semibold text-foreground">Tickets</th>
                      <th className="text-left py-3 px-4 font-semibold text-foreground">Amount</th>
                      <th className="text-left py-3 px-4 font-semibold text-foreground">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentBookings.map(booking => (
                      <tr key={booking.id} className="border-b border-border hover:bg-surface-hover transition-colors">
                        <td className="py-4 px-4">
                          <div>
                            <p className="font-medium text-foreground">{booking.userName}</p>
                            <p className="text-sm text-muted">{booking.userEmail}</p>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-foreground">{booking.eventTitle}</td>
                        <td className="py-4 px-4">
                          <span className="inline-flex items-center px-3 py-1 bg-muted rounded-full text-foreground font-medium">
                            {booking.quantity}
                          </span>
                        </td>
                        <td className="py-4 px-4 font-bold text-primary">
                          {formatCurrency(booking.totalPrice)}
                        </td>
                        <td className="py-4 px-4">
                          <span className="px-3 py-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-full text-sm font-medium">
                            {booking.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

