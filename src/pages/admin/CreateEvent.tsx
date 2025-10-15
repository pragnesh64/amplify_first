import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../../amplify/data/resource';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { ArrowLeft, Save, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { checkUserGroups } from '../../utils/authTest';

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

export function CreateEvent() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();
  const [formData, setFormData] = useState<EventForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const isEditing = Boolean(id);

  useEffect(() => {
    if (isEditing && id) {
      fetchEvent();
    }
  }, [id, isEditing]);

  const fetchEvent = async () => {
    try {
      setLoading(true);
      const { data } = await client.models.Event.get({ id: id! });
      if (data) {
        const isoDate = data.date
          ? new Date(data.date).toISOString().slice(0, 16)
          : '';
        const nextFormData: EventForm = {
          title: data.title ?? '',
          description: data.description ?? '',
          date: isoDate,
          location: data.location ?? '',
          totalTickets: Number(data.totalTickets ?? 0),
          price: Number(data.price ?? 0),
          category: data.category ?? 'Conference',
          imageUrl: data.imageUrl ?? '',
        };
        setFormData(nextFormData);
      }
    } catch (error) {
      console.error('Error fetching event:', error);
      alert('Failed to load event. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    // Check user groups for debugging
    const userGroups = await checkUserGroups();
    console.log('User groups check:', userGroups);

    setSaving(true);
    try {
      if (isEditing) {
        // Update existing event - don't include createdBy or createdAt
        console.log('Updating event with ID:', id);
        console.log('User ID:', user.id);
        console.log('Form data:', formData);
        
        const result = await client.models.Event.update({
          id: id!,
          title: formData.title,
          description: formData.description,
          date: new Date(formData.date).toISOString(), // Ensure proper date format
          location: formData.location,
          totalTickets: formData.totalTickets,
          price: formData.price,
          category: formData.category,
          imageUrl: formData.imageUrl,
        });
        
        console.log('Update result:', result);
      } else {
        // Create new event
        await client.models.Event.create({
          title: formData.title,
          description: formData.description,
          date: new Date(formData.date).toISOString(), // Ensure proper date format
          location: formData.location,
          totalTickets: formData.totalTickets,
          ticketsAvailable: formData.totalTickets,
          price: formData.price,
          category: formData.category,
          imageUrl: formData.imageUrl,
          createdBy: user.id,
          createdAt: new Date().toISOString(),
        });
      }

      navigate('/admin/events');
    } catch (error) {
      console.error('Error saving event:', error);
      alert('Failed to save event. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate('/admin/events');
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
      {/* Header */}
      <div className="bg-card border-b border-border">
        <div className="container-custom py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={handleCancel}
                className="p-2 hover:bg-surface-hover rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-foreground">
                  {isEditing ? 'Edit Event' : 'Create New Event'}
                </h1>
                <p className="text-muted">
                  {isEditing ? 'Update your event details' : 'Fill in the details to create a new event'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="secondary"
                onClick={handleCancel}
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              <Button
                type="submit"
                form="event-form"
                disabled={saving}
              >
                <Save className="w-4 h-4 mr-2" />
                {saving ? 'Saving...' : (isEditing ? 'Update Event' : 'Create Event')}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="container-custom py-8">
        <div className="max-w-4xl mx-auto">
          <form id="event-form" onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Information */}
            <div className="bg-card rounded-2xl p-8 border border-border">
              <h2 className="text-xl font-semibold text-foreground mb-6">Basic Information</h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="lg:col-span-2">
                  <Input
                    label="Event Title"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g., AWS Amplify Workshop"
                    className="w-full"
                  />
                </div>

                <div className="lg:col-span-2">
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Description
                  </label>
                  <textarea
                    required
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={4}
                    className="input-field resize-none w-full"
                    placeholder="Describe your event in detail..."
                  />
                </div>

                <div>
                  <Input
                    label="Date & Time"
                    type="datetime-local"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="input-field w-full"
                  >
                    <option value="Conference">Conference</option>
                    <option value="Workshop">Workshop</option>
                    <option value="Meetup">Meetup</option>
                    <option value="Concert">Concert</option>
                    <option value="Sports">Sports</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="lg:col-span-2">
                  <Input
                    label="Location"
                    required
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="e.g., Ahmedabad Innovation Hub"
                    className="w-full"
                  />
                </div>
              </div>
            </div>

            {/* Pricing & Tickets */}
            <div className="bg-card rounded-2xl p-8 border border-border">
              <h2 className="text-xl font-semibold text-foreground mb-6">Pricing & Tickets</h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <Input
                    label="Total Tickets"
                    type="number"
                    required
                    min="1"
                    max="10000"
                    value={formData.totalTickets || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      totalTickets: parseInt(e.target.value) || 0,
                    })}
                    placeholder="100"
                    className="w-full"
                  />
                </div>

                <div>
                  <Input
                    label="Price per Ticket ($)"
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={formData.price || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      price: parseFloat(e.target.value) || 0,
                    })}
                    placeholder="20.00"
                    className="w-full"
                  />
                </div>
              </div>
            </div>

            {/* Media */}
            <div className="bg-card rounded-2xl p-8 border border-border">
              <h2 className="text-xl font-semibold text-foreground mb-6">Event Media</h2>
              
              <div>
                <Input
                  label="Image URL (Optional)"
                  type="url"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  placeholder="https://example.com/image.jpg"
                  className="w-full"
                />
                <p className="text-sm text-muted mt-2">
                  Add a high-quality image URL to make your event stand out. Recommended size: 1200x630px
                </p>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
