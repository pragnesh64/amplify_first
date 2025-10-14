import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../../amplify/data/resource';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { Calendar, MapPin, Ticket, Users } from 'lucide-react';
import { formatDate, formatCurrency, getImagePlaceholder } from '../../utils/helpers';

const client = generateClient<Schema>();

export function Home() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const navigate = useNavigate();

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

  const filteredEvents = filter === 'all' 
    ? events 
    : events.filter(event => event.category === filter);

  const upcomingEvents = filteredEvents.filter(
    event => new Date(event.date) > new Date()
  );

  const categories = ['All', 'Conference', 'Workshop', 'Meetup', 'Concert', 'Sports', 'Other'];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 text-white py-20">
        <div className="container-custom">
          <h1 className="text-5xl font-bold mb-4 animate-fade-in">
            Discover Amazing Events
          </h1>
          <p className="text-xl text-primary-100 max-w-2xl animate-slide-up">
            Book tickets to the best events happening around you. From conferences to concerts, find your next experience.
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white shadow-sm sticky top-16 z-30">
        <div className="container-custom py-4">
          <div className="flex gap-3 overflow-x-auto">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setFilter(category.toLowerCase())}
                className={`px-4 py-2 rounded-full font-medium transition-all whitespace-nowrap ${
                  filter === category.toLowerCase()
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Events Grid */}
      <div className="container-custom py-12">
        {upcomingEvents.length === 0 ? (
          <div className="text-center py-20">
            <Calendar className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-2xl font-semibold text-gray-600 mb-2">No Events Found</h3>
            <p className="text-gray-500">Check back later for upcoming events!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {upcomingEvents.map(event => (
              <Card key={event.id}>
                {/* Event Image */}
                <div className={`h-48 bg-gradient-to-br ${getImagePlaceholder(event.title)} flex items-center justify-center`}>
                  {event.imageUrl ? (
                    <img 
                      src={event.imageUrl} 
                      alt={event.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Calendar className="w-16 h-16 text-white opacity-50" />
                  )}
                </div>

                {/* Event Details */}
                <div className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-medium">
                      {event.category}
                    </span>
                    <span className="text-2xl font-bold text-primary-600">
                      {formatCurrency(event.price)}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">
                    {event.title}
                  </h3>

                  <p className="text-gray-600 mb-4 line-clamp-2">
                    {event.description}
                  </p>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-gray-600 text-sm">
                      <Calendar className="w-4 h-4 mr-2" />
                      {formatDate(event.date)}
                    </div>
                    <div className="flex items-center text-gray-600 text-sm">
                      <MapPin className="w-4 h-4 mr-2" />
                      {event.location}
                    </div>
                    <div className="flex items-center text-gray-600 text-sm">
                      <Ticket className="w-4 h-4 mr-2" />
                      {event.ticketsAvailable} / {event.totalTickets} tickets left
                    </div>
                  </div>

                  <Button
                    fullWidth
                    onClick={() => navigate(`/event/${event.id}`)}
                    disabled={event.ticketsAvailable === 0}
                  >
                    {event.ticketsAvailable === 0 ? 'Sold Out' : 'Book Now'}
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

