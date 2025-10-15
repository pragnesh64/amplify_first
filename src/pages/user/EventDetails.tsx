import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../../amplify/data/resource';
import { Button } from '../../components/Button';
import { Modal } from '../../components/Modal';
import { Calendar, MapPin, Ticket, ArrowLeft, Check } from 'lucide-react';
import { formatDateTime, formatCurrency, getImagePlaceholder } from '../../utils/helpers';
import { useAuth } from '../../context/AuthContext';
import outputs from '../../../amplify_outputs.json';

const client = generateClient<Schema>();
const bookingModelFields = (outputs?.data?.model_introspection?.models?.Booking?.fields ??
  {}) as Record<string, unknown>;
const supportsQrCodeField = 'qrCode' in bookingModelFields;

export function EventDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [bookingModal, setBookingModal] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [booking, setBooking] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (id) {
      fetchEvent();
    }
  }, [id]);

  const fetchEvent = async () => {
    try {
      const { data } = await client.models.Event.get({ id: id! });
      setEvent(data);
    } catch (error) {
      console.error('Error fetching event:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBooking = async () => {
    if (!user || !event) return;

    setBooking(true);
    try {
      // Generate unique QR code data
      const qrData = `EVENTORA-${event.id}-${user.id}-${Date.now()}`;
      
      // Create booking
      const bookingResult = await client.models.Booking.create({
        eventId: event.id,
        userId: user.id,
        userName: user.name,
        userEmail: user.email,
        eventTitle: event.title,
        quantity,
        totalPrice: event.price * quantity,
        status: 'confirmed',
        createdAt: new Date().toISOString(),
        ...(supportsQrCodeField ? { qrCode: qrData } : {}),
      });

      console.log('Booking created:', bookingResult);

      // Update event tickets
      await client.models.Event.update({
        id: event.id,
        ticketsAvailable: event.ticketsAvailable - quantity,
      });

      // Trigger email Lambda function
      try {
        console.log('📧 Triggering email notification...');
        
        // For now, we'll simulate the email trigger
        // In production, this would be automatically triggered via DynamoDB stream
        const emailData = {
          bookingId: bookingResult.data?.id,
          userEmail: user.email,
          userName: user.name,
          eventTitle: event.title,
          quantity,
          totalPrice: event.price * quantity,
          qrCode: qrData,
        };
        
        console.log('Email data:', emailData);
        console.log('✅ Email notification triggered (simulated)');
        
        // TODO: Implement actual Lambda trigger
        // This could be done via:
        // 1. DynamoDB stream trigger (automatic)
        // 2. EventBridge rule (scheduled)
        // 3. Direct Lambda invocation (manual)
        
      } catch (emailError) {
        console.error('Failed to send email:', emailError);
        // Don't fail the booking if email fails
      }

      setBookingModal(false);
      setShowSuccess(true);
      
      // Refresh event data
      await fetchEvent();
      
      setTimeout(() => {
        setShowSuccess(false);
      }, 3000);
    } catch (error) {
      console.error('Error creating booking:', error);
      alert('Failed to book ticket. Please try again.');
    } finally {
      setBooking(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Event Not Found</h2>
          <Button onClick={() => navigate('/')}>Back to Events</Button>
        </div>
      </div>
    );
  }

  const totalPrice = event.price * quantity;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Success Message */}
      {showSuccess && (
        <div className="fixed top-20 right-4 bg-green-500 text-white px-6 py-4 rounded-lg shadow-lg flex items-center space-x-2 z-50 animate-slide-up">
          <Check className="w-5 h-5" />
          <span className="font-semibold">Booking Successful!</span>
        </div>
      )}

      {/* Back Button */}
      <div className="bg-white border-b">
        <div className="container-custom py-4">
          <button
            onClick={() => navigate('/')}
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Events
          </button>
        </div>
      </div>

      <div className="container-custom py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Hero Image */}
            <div className={`h-96 rounded-xl overflow-hidden bg-gradient-to-br ${getImagePlaceholder(event.title)} flex items-center justify-center mb-8`}>
              {event.imageUrl ? (
                <img 
                  src={event.imageUrl} 
                  alt={event.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Calendar className="w-24 h-24 text-white opacity-50" />
              )}
            </div>

            {/* Event Info */}
            <div className="bg-white rounded-xl p-8 shadow-md">
              <div className="flex items-center justify-between mb-4">
                <span className="px-4 py-2 bg-primary-100 text-primary-700 rounded-full text-sm font-medium">
                  {event.category}
                </span>
              </div>

              <h1 className="text-4xl font-bold text-gray-900 mb-6">
                {event.title}
              </h1>

              <div className="space-y-4 mb-8">
                <div className="flex items-start">
                  <Calendar className="w-6 h-6 text-primary-600 mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-900">Date & Time</p>
                    <p className="text-gray-600">{formatDateTime(event.date)}</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <MapPin className="w-6 h-6 text-primary-600 mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-900">Location</p>
                    <p className="text-gray-600">{event.location}</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <Ticket className="w-6 h-6 text-primary-600 mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-900">Tickets Available</p>
                    <p className="text-gray-600">
                      {event.ticketsAvailable} out of {event.totalTickets} tickets remaining
                    </p>
                  </div>
                </div>
              </div>

              <div className="border-t pt-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">About This Event</h2>
                <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                  {event.description}
                </p>
              </div>
            </div>
          </div>

          {/* Booking Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl p-6 shadow-md sticky top-24">
              <div className="text-center mb-6">
                <p className="text-gray-600 mb-2">Price per ticket</p>
                <p className="text-4xl font-bold text-primary-600">
                  {formatCurrency(event.price)}
                </p>
              </div>

              {event.ticketsAvailable > 0 ? (
                <Button
                  fullWidth
                  size="lg"
                  onClick={() => setBookingModal(true)}
                >
                  Book Tickets
                </Button>
              ) : (
                <Button fullWidth size="lg" disabled>
                  Sold Out
                </Button>
              )}

              <div className="mt-6 pt-6 border-t">
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span>Service Fee</span>
                  <span>Included</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      <Modal
        isOpen={bookingModal}
        onClose={() => setBookingModal(false)}
        title="Book Tickets"
        size="md"
      >
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-2">{event.title}</h3>
            <p className="text-gray-600">{formatDateTime(event.date)}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Number of Tickets
            </label>
            <input
              type="number"
              min="1"
              max={Math.min(event.ticketsAvailable, 10)}
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
              className="input-field"
            />
            <p className="text-sm text-gray-500 mt-1">
              Maximum 10 tickets per booking
            </p>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">Price per ticket</span>
              <span className="font-semibold">{formatCurrency(event.price)}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">Quantity</span>
              <span className="font-semibold">{quantity}</span>
            </div>
            <div className="border-t pt-2 mt-2 flex justify-between">
              <span className="text-lg font-bold">Total</span>
              <span className="text-lg font-bold text-primary-600">
                {formatCurrency(totalPrice)}
              </span>
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              variant="secondary"
              fullWidth
              onClick={() => setBookingModal(false)}
            >
              Cancel
            </Button>
            <Button
              fullWidth
              onClick={handleBooking}
              disabled={booking}
            >
              {booking ? 'Processing...' : 'Confirm Booking'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
