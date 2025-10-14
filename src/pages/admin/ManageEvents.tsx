import { useEffect, useState } from 'react';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../../amplify/data/resource';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { Modal } from '../../components/Modal';
import { Plus, Edit, Trash2, Calendar, MapPin, Ticket } from 'lucide-react';
import { formatDate, formatCurrency } from '../../utils/helpers';
import { useAuth } from '../../context/AuthContext';

const client = generateClient<Schema>();

interface EventForm {
  title: string;
  description: string;
  date: string;
  location: string;
  totalTickets: number;
  price: number;
  category: string;
  imageUrl: string;
}

const emptyForm: EventForm = {
  title: '',
  description: '',
  date: '',
  location: '',
  totalTickets: 0,
  price: 0,
  category: 'Conference',
  imageUrl: '',
};

export function ManageEvents() {
  const { user } = useAuth();
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<any>(null);
  const [formData, setFormData] = useState<EventForm>(emptyForm);
  const [saving, setSaving] = useState(false);

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

  const handleOpenModal = (event?: any) => {
    if (event) {
      setEditingEvent(event);
      setFormData({
        title: event.title,
        description: event.description,
        date: event.date.split('T')[0] + 'T' + event.date.split('T')[1].substring(0, 5),
        location: event.location,
        totalTickets: event.totalTickets,
        price: event.price,
        category: event.category,
        imageUrl: event.imageUrl || '',
      });
    } else {
      setEditingEvent(null);
      setFormData(emptyForm);
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingEvent(null);
    setFormData(emptyForm);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSaving(true);
    try {
      if (editingEvent) {
        // Update existing event
        await client.models.Event.update({
          id: editingEvent.id,
          ...formData,
          date: new Date(formData.date).toISOString(),
        });
      } else {
        // Create new event
        await client.models.Event.create({
          ...formData,
          date: new Date(formData.date).toISOString(),
          ticketsAvailable: formData.totalTickets,
          createdBy: user.id,
          createdAt: new Date().toISOString(),
        });
      }

      await fetchEvents();
      handleCloseModal();
    } catch (error) {
      console.error('Error saving event:', error);
      alert('Failed to save event. Please try again.');
    } finally {
      setSaving(false);
    }
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
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 text-white py-12">
        <div className="container-custom">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">Manage Events</h1>
              <p className="text-primary-100">Create, edit, and manage your events</p>
            </div>
            <Button
              onClick={() => handleOpenModal()}
              size="lg"
              variant="secondary"
            >
              <Plus className="w-5 h-5 mr-2" />
              Create Event
            </Button>
          </div>
        </div>
      </div>

      <div className="container-custom py-12">
        {events.length === 0 ? (
          <Card>
            <div className="p-12 text-center">
              <Calendar className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No Events Yet</h3>
              <p className="text-gray-500 mb-6">Create your first event to get started!</p>
              <Button onClick={() => handleOpenModal()}>
                <Plus className="w-5 h-5 mr-2" />
                Create Event
              </Button>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map(event => (
              <Card key={event.id}>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-medium">
                      {event.category}
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleOpenModal(event)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Edit Event"
                      >
                        <Edit className="w-4 h-4 text-gray-600" />
                      </button>
                      <button
                        onClick={() => handleDelete(event.id)}
                        className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete Event"
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </button>
                    </div>
                  </div>

                  <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">
                    {event.title}
                  </h3>

                  <p className="text-gray-600 mb-4 line-clamp-2 text-sm">
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
                      {event.ticketsAvailable} / {event.totalTickets} available
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Price</span>
                      <span className="text-2xl font-bold text-primary-600">
                        {formatCurrency(event.price)}
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={handleCloseModal}
        title={editingEvent ? 'Edit Event' : 'Create New Event'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Event Title"
            required
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="e.g., AWS Amplify Workshop"
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              className="input-field resize-none"
              placeholder="Describe your event..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Date & Time"
              type="datetime-local"
              required
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="input-field"
              >
                <option value="Conference">Conference</option>
                <option value="Workshop">Workshop</option>
                <option value="Meetup">Meetup</option>
                <option value="Concert">Concert</option>
                <option value="Sports">Sports</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <Input
            label="Location"
            required
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            placeholder="e.g., Ahmedabad Innovation Hub"
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Total Tickets"
              type="number"
              required
              min="1"
              value={formData.totalTickets || ''}
              onChange={(e) => setFormData({ ...formData, totalTickets: parseInt(e.target.value) || 0 })}
              placeholder="100"
            />

            <Input
              label="Price per Ticket ($)"
              type="number"
              required
              min="0"
              step="0.01"
              value={formData.price || ''}
              onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
              placeholder="20.00"
            />
          </div>

          <Input
            label="Image URL (Optional)"
            type="url"
            value={formData.imageUrl}
            onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
            placeholder="https://example.com/image.jpg"
          />

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              fullWidth
              onClick={handleCloseModal}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              fullWidth
              disabled={saving}
            >
              {saving ? 'Saving...' : (editingEvent ? 'Update Event' : 'Create Event')}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

