import { useEffect, useState } from 'react';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../../amplify/data/resource';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { Modal } from '../../components/Modal';
import { QRCodeGenerator } from '../../components/QRCodeGenerator';
import { Ticket, Calendar, MapPin, X, QrCode } from 'lucide-react';
import { formatDateTime, formatCurrency } from '../../utils/helpers';
import { useAuth } from '../../context/AuthContext';
import outputs from '../../../amplify_outputs.json';

const client = generateClient<Schema>();
const bookingModelFields = (outputs?.data?.model_introspection?.models?.Booking?.fields ??
  {}) as Record<string, unknown>;
const supportsQrCodeField = 'qrCode' in bookingModelFields;

export function MyBookings() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<any[]>([]);
  const [events, setEvents] = useState<Map<string, any>>(new Map());
  const [loading, setLoading] = useState(true);
  const [showQRModal, setShowQRModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<any>(null);

  useEffect(() => {
    fetchBookings();
  }, [user]);

  const fetchBookings = async () => {
    if (!user) return;

    try {
      // Fetch user's bookings
      const { data: bookingsData } = await client.models.Booking.list({
        filter: { userId: { eq: user.id } }
      });

      const sortedBookings = (bookingsData || []).sort((a, b) => 
        new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
      );

      setBookings(sortedBookings);

      // Fetch event details for each booking
      const eventMap = new Map();
      for (const booking of sortedBookings) {
        if (!eventMap.has(booking.eventId)) {
          const { data: eventData } = await client.models.Event.get({ id: booking.eventId });
          if (eventData) {
            eventMap.set(booking.eventId, eventData);
          }
        }
      }
      setEvents(eventMap);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId: string, eventId: string, quantity: number) => {
    if (!confirm('Are you sure you want to cancel this booking?')) return;

    try {
      // Update booking status
      await client.models.Booking.update({
        id: bookingId,
        status: 'cancelled',
      });

      // Return tickets to event
      const event = events.get(eventId);
      if (event) {
        await client.models.Event.update({
          id: eventId,
          ticketsAvailable: event.ticketsAvailable + quantity,
        });
      }

      // Refresh bookings
      await fetchBookings();
    } catch (error) {
      console.error('Error cancelling booking:', error);
      alert('Failed to cancel booking. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const activeBookings = bookings.filter(b => b.status === 'confirmed');
  const cancelledBookings = bookings.filter(b => b.status === 'cancelled');

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 text-white py-12">
        <div className="container-custom">
          <h1 className="text-4xl font-bold mb-2">My Bookings</h1>
          <p className="text-primary-100">Manage your event tickets</p>
        </div>
      </div>

      <div className="container-custom py-12">
        {/* Active Bookings */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Active Bookings</h2>
          {!supportsQrCodeField && (
            <div className="mb-6 rounded-lg border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm text-yellow-800">
              QR codes will be attached to your tickets once the backend upgrade that adds QR support is deployed.
            </div>
          )}
          
          {activeBookings.length === 0 ? (
            <Card>
              <div className="p-12 text-center">
                <Ticket className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">No Active Bookings</h3>
                <p className="text-gray-500 mb-6">You haven't booked any events yet.</p>
                <Button onClick={() => window.location.href = '/'}>
                  Browse Events
                </Button>
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeBookings.map(booking => {
                const event = events.get(booking.eventId);
                const isPast = event && new Date(event.date) < new Date();

                return (
                  <Card key={booking.id}>
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                          Confirmed
                        </span>
                        {!isPast && (
                          <button
                            onClick={() => handleCancelBooking(booking.id, booking.eventId, booking.quantity)}
                            className="text-red-600 hover:text-red-700 transition-colors"
                            title="Cancel Booking"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        )}
                      </div>

                      <h3 className="text-xl font-bold text-gray-900 mb-4">
                        {booking.eventTitle}
                      </h3>

                      {event && (
                        <div className="space-y-2 mb-4">
                          <div className="flex items-center text-gray-600 text-sm">
                            <Calendar className="w-4 h-4 mr-2" />
                            {formatDateTime(event.date)}
                          </div>
                          <div className="flex items-center text-gray-600 text-sm">
                            <MapPin className="w-4 h-4 mr-2" />
                            {event.location}
                          </div>
                        </div>
                      )}

                      <div className="border-t pt-4">
                        <div className="flex justify-between mb-2">
                          <span className="text-muted">Tickets</span>
                          <span className="font-semibold">{booking.quantity}</span>
                        </div>
                        <div className="flex justify-between mb-4">
                          <span className="text-muted">Total Paid</span>
                          <span className="font-bold text-primary">
                            {formatCurrency(booking.totalPrice)}
                          </span>
                        </div>
                        
                        {supportsQrCodeField && booking.qrCode && (
                          <Button
                            fullWidth
                            variant="secondary"
                            size="sm"
                            onClick={() => {
                              setSelectedBooking(booking);
                              setShowQRModal(true);
                            }}
                          >
                            <QrCode className="w-4 h-4" />
                            View QR Ticket
                          </Button>
                        )}
                      </div>

                      {isPast && (
                        <div className="mt-4 p-2 bg-muted rounded text-center text-sm text-muted">
                          Event has ended
                        </div>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Cancelled Bookings */}
        {cancelledBookings.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Cancelled Bookings</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {cancelledBookings.map(booking => (
                <Card key={booking.id} className="opacity-75">
                  <div className="p-6">
                    <span className="px-3 py-1 bg-gray-200 text-gray-700 rounded-full text-sm font-medium mb-4 inline-block">
                      Cancelled
                    </span>

                    <h3 className="text-xl font-bold text-gray-900 mb-4">
                      {booking.eventTitle}
                    </h3>

                    <div className="border-t pt-4">
                      <div className="flex justify-between mb-2">
                        <span className="text-gray-600">Tickets</span>
                        <span className="font-semibold">{booking.quantity}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Amount</span>
                        <span className="font-bold text-gray-600">
                          {formatCurrency(booking.totalPrice)}
                        </span>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* QR Code Modal */}
      {selectedBooking && (
        <Modal
          isOpen={showQRModal}
          onClose={() => {
            setShowQRModal(false);
            setSelectedBooking(null);
          }}
          title="Your Ticket QR Code"
          size="md"
        >
          <div className="text-center space-y-4">
            <div className="p-4 bg-muted rounded-lg">
              <h3 className="text-xl font-bold mb-2">{selectedBooking.eventTitle}</h3>
              <p className="text-sm text-muted">
                Tickets: {selectedBooking.quantity} • {formatCurrency(selectedBooking.totalPrice)}
              </p>
            </div>
            
            <QRCodeGenerator
              value={selectedBooking.qrCode}
              eventTitle={selectedBooking.eventTitle}
              size={250}
            />
            
            <p className="text-sm text-muted">
              Show this QR code at the event entrance for validation
            </p>
          </div>
        </Modal>
      )}
    </div>
  );
}
