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
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 text-white py-12">
        <div className="container-custom">
          <h1 className="text-4xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-primary-100">Overview of your event platform</p>
        </div>
      </div>

      <div className="container-custom py-12">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Calendar className="w-6 h-6 text-blue-600" />
                </div>
                <TrendingUp className="w-5 h-5 text-green-500" />
              </div>
              <h3 className="text-gray-600 text-sm font-medium mb-1">Total Events</h3>
              <p className="text-3xl font-bold text-gray-900">{stats.totalEvents}</p>
              <p className="text-sm text-gray-500 mt-1">{stats.activeEvents} active</p>
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <Ticket className="w-6 h-6 text-green-600" />
                </div>
                <TrendingUp className="w-5 h-5 text-green-500" />
              </div>
              <h3 className="text-gray-600 text-sm font-medium mb-1">Tickets Sold</h3>
              <p className="text-3xl font-bold text-gray-900">{stats.totalTicketsSold}</p>
              <p className="text-sm text-gray-500 mt-1">across all events</p>
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Users className="w-6 h-6 text-purple-600" />
                </div>
                <TrendingUp className="w-5 h-5 text-green-500" />
              </div>
              <h3 className="text-gray-600 text-sm font-medium mb-1">Total Bookings</h3>
              <p className="text-3xl font-bold text-gray-900">{stats.totalBookings}</p>
              <p className="text-sm text-gray-500 mt-1">confirmed bookings</p>
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-yellow-100 rounded-lg">
                  <DollarSign className="w-6 h-6 text-yellow-600" />
                </div>
                <TrendingUp className="w-5 h-5 text-green-500" />
              </div>
              <h3 className="text-gray-600 text-sm font-medium mb-1">Total Revenue</h3>
              <p className="text-3xl font-bold text-gray-900">
                {formatCurrency(stats.totalRevenue)}
              </p>
              <p className="text-sm text-gray-500 mt-1">from all bookings</p>
            </div>
          </Card>
        </div>

        {/* Recent Bookings */}
        <Card>
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Recent Bookings</h2>
            
            {recentBookings.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No bookings yet
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Customer</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Event</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Tickets</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Amount</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentBookings.map(booking => (
                      <tr key={booking.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div>
                            <p className="font-medium text-gray-900">{booking.userName}</p>
                            <p className="text-sm text-gray-500">{booking.userEmail}</p>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-gray-700">{booking.eventTitle}</td>
                        <td className="py-3 px-4 text-gray-700">{booking.quantity}</td>
                        <td className="py-3 px-4 font-semibold text-gray-900">
                          {formatCurrency(booking.totalPrice)}
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
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

