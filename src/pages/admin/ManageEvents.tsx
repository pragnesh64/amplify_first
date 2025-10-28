import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../../amplify/data/resource';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Calendar, 
  MapPin, 
  Ticket, 
  Search, 
  Filter,
  Users,
  DollarSign
} from 'lucide-react';
import { formatDate, formatCurrency } from '../../utils/helpers';

const client = generateClient<Schema>();


export function ManageEvents() {
  const navigate = useNavigate();
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const { data } = await client.models.Event.list();
      const sortedEvents = (data || []).sort((a, b) => 
        new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
      );
      setEvents(sortedEvents);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter and search events
  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || event.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  // Calculate statistics
  const stats = {
    totalEvents: events.length,
    totalTickets: events.reduce((sum, event) => sum + event.totalTickets, 0),
    ticketsSold: events.reduce((sum, event) => sum + (event.totalTickets - event.ticketsAvailable), 0),
    totalRevenue: events.reduce((sum, event) => sum + ((event.totalTickets - event.ticketsAvailable) * event.price), 0),
  };

  const handleCreateEvent = () => {
    navigate('/admin/events/create');
  };

  const handleEditEvent = (event: any) => {
    navigate(`/admin/events/edit/${event.id}`);
  };


  const handleDelete = async (eventId: string) => {
    if (!confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
      return;
    }

    try {
      await client.models.Event.delete({ id: eventId });
      await fetchEvents();
    } catch (error) {
      console.error('Error deleting event:', error);
      alert('Failed to delete event. Please try again.');
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
        <div className="relative container-custom py-12">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="flex-1">
              <h1 className="text-4xl lg:text-5xl font-bold mb-3 bg-gradient-to-r from-white to-primary-100 bg-clip-text text-transparent">
                Manage Events
              </h1>
              <p className="text-primary-100 text-lg mb-6 max-w-2xl">
                Create, edit, and manage your events with powerful tools and analytics
              </p>
              
              {/* Quick Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/20 rounded-lg">
                      <Calendar className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{stats.totalEvents}</p>
                      <p className="text-primary-100 text-sm">Total Events</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/20 rounded-lg">
                      <Users className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{stats.ticketsSold}</p>
                      <p className="text-primary-100 text-sm">Tickets Sold</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/20 rounded-lg">
                      <Ticket className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{stats.totalTickets}</p>
                      <p className="text-primary-100 text-sm">Total Tickets</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/20 rounded-lg">
                      <DollarSign className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</p>
                      <p className="text-primary-100 text-sm">Revenue</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex-shrink-0">
              <Button
                onClick={handleCreateEvent}
                size="lg"
                className="bg-white text-primary-700 hover:bg-primary-50 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300"
              >
                <Plus className="w-5 h-5 mr-2" />
                Create Event
              </Button>
            </div>
          </div>
        </div>
      </div>
  
      {/* Search and Filter Section */}
      <div className="container-custom py-8">
        <div className="bg-card rounded-2xl shadow-sm border border-border p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              {/* Search Input */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search events..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input-field pl-10 w-full"
                />
              </div>
              
              {/* Category Filter */}
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted w-5 h-5" />
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="input-field pl-10 pr-8 min-w-[150px]"
                >
                  <option value="all">All Categories</option>
                  <option value="Conference">Conference</option>
                  <option value="Workshop">Workshop</option>
                  <option value="Meetup">Meetup</option>
                  <option value="Concert">Concert</option>
                  <option value="Sports">Sports</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
            
            {/* View Toggle */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted">View:</span>
              <div className="flex bg-muted rounded-lg p-1">
                <button
                  onClick={() => setViewMode('table')}
                  className={`px-3 py-1 rounded-md text-sm transition-colors ${
                    viewMode === 'table' 
                      ? 'bg-background text-foreground shadow-sm' 
                      : 'text-muted hover:text-foreground'
                  }`}
                >
                  Table
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-3 py-1 rounded-md text-sm transition-colors ${
                    viewMode === 'grid' 
                      ? 'bg-background text-foreground shadow-sm' 
                      : 'text-muted hover:text-foreground'
                  }`}
                >
                  Grid
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Events Content */}
        {filteredEvents.length === 0 ? (
          <Card>
            <div className="p-12 text-center">
              <Calendar className="w-16 h-16 mx-auto text-muted mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">
                {searchTerm || filterCategory !== 'all' ? 'No Events Found' : 'No Events Yet'}
              </h3>
              <p className="text-muted mb-6">
                {searchTerm || filterCategory !== 'all' 
                  ? 'Try adjusting your search or filter criteria'
                  : 'Create your first event to get started!'
                }
              </p>
              <Button onClick={handleCreateEvent}>
                <Plus className="w-5 h-5 mr-2" />
                Create Event
              </Button>
            </div>
          </Card>
        ) : viewMode === 'table' ? (
          /* Data Table View */
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left p-4 font-semibold text-foreground">Event</th>
                    <th className="text-left p-4 font-semibold text-foreground">Date & Location</th>
                    <th className="text-left p-4 font-semibold text-foreground">Tickets</th>
                    <th className="text-left p-4 font-semibold text-foreground">Price</th>
                    <th className="text-left p-4 font-semibold text-foreground">Status</th>
                    <th className="text-right p-4 font-semibold text-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEvents.map((event) => (
                    <tr key={event.id} className="border-b border-border hover:bg-surface-hover transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          {event.imageUrl && (
                            <img
                              src={event.imageUrl}
                              alt={event.title}
                              className="w-12 h-12 rounded-lg object-cover"
                            />
                          )}
                          <div>
                            <h3 className="font-semibold text-foreground">{event.title}</h3>
                            <p className="text-sm text-muted line-clamp-1">{event.description}</p>
                            <span className="inline-block mt-1 px-2 py-1 bg-primary-100 text-primary-700 text-xs rounded-full">
                              {event.category}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="space-y-1">
                          <div className="flex items-center text-sm text-foreground">
                            <Calendar className="w-4 h-4 mr-2 text-muted" />
                            {formatDate(event.date)}
                          </div>
                          <div className="flex items-center text-sm text-muted">
                            <MapPin className="w-4 h-4 mr-2" />
                            {event.location}
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="text-sm">
                          <div className="text-foreground font-medium">
                            {event.ticketsAvailable} / {event.totalTickets}
                          </div>
                          <div className="text-muted">available</div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="text-lg font-bold text-primary">
                          {formatCurrency(event.price)}
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                          event.ticketsAvailable > 10 
                            ? 'bg-green-100 text-green-700' 
                            : event.ticketsAvailable > 0 
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {event.ticketsAvailable > 10 ? 'Available' : 
                           event.ticketsAvailable > 0 ? 'Limited' : 'Sold Out'}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleEditEvent(event)}
                            className="p-2 hover:bg-surface-hover rounded-lg transition-colors"
                            title="Edit Event"
                          >
                            <Edit className="w-4 h-4 text-muted" />
                          </button>
                          <button
                            onClick={() => handleDelete(event.id)}
                            className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete Event"
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        ) : (
          /* Grid View */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((event) => (
              <Card key={event.id} className="hover:shadow-lg transition-all duration-300 group">
                <div className="overflow-hidden">
                  {event.imageUrl && (
                    <img
                      src={event.imageUrl}
                      alt={event.title}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  )}
                </div>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-xs font-medium">
                      {event.category}
                    </span>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleEditEvent(event)}
                        className="p-2 bg-surface-hover rounded-lg transition-colors"
                        title="Edit Event"
                      >
                        <Edit className="w-4 h-4 text-muted" />
                      </button>
                      <button
                        onClick={() => handleDelete(event.id)}
                        className="p-2 bg-red-50 rounded-lg transition-colors"
                        title="Delete Event"
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </button>
                    </div>
                  </div>

                  <h3 className="text-xl font-bold text-foreground mb-2 line-clamp-2">
                    {event.title}
                  </h3>

                  <p className="text-muted mb-4 line-clamp-2">
                    {event.description}
                  </p>

                  <div className="space-y-2 mb-4 text-sm">
                    <div className="flex items-center text-muted">
                      <Calendar className="w-4 h-4 mr-2" />
                      {formatDate(event.date)}
                    </div>
                    <div className="flex items-center text-muted">
                      <MapPin className="w-4 h-4 mr-2" />
                      {event.location}
                    </div>
                    <div className="flex items-center text-muted">
                      <Ticket className="w-4 h-4 mr-2" />
                      {event.ticketsAvailable} / {event.totalTickets} available
                    </div>
                  </div>

                  <div className="flex justify-between items-center border-t pt-4">
                    <span className="text-muted text-sm">Price</span>
                    <span className="text-2xl font-bold text-primary">
                      {formatCurrency(event.price)}
                    </span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
  
    </div>
  );
  
}

