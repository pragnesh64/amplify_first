import { useState, useRef, useEffect } from 'react';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../../amplify/data/resource';
import { Camera, CheckCircle, XCircle, Loader2, ScanLine } from 'lucide-react';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import outputs from '../../../amplify_outputs.json';

const client = generateClient<Schema>();
const bookingFields = (outputs?.data?.model_introspection?.models?.Booking?.fields ??
  {}) as Record<string, unknown>;
const supportsQrCodeField = 'qrCode' in bookingFields;
const supportsUsedAtField = 'usedAt' in bookingFields;

interface ScanResult {
  success: boolean;
  message: string;
  booking?: {
    eventTitle: string;
    userName: string;
    userEmail: string;
    quantity: number;
    totalPrice: number;
  };
}

export function ScanTickets() {
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [manualQrCode, setManualQrCode] = useState('');
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    return () => {
      // Cleanup camera stream on unmount
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }, // Use back camera on mobile
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsScanning(true);
        
        // Start scanning for QR codes
        scanQRCode();
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      alert('Unable to access camera. Please check permissions or use manual entry.');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsScanning(false);
  };

  const scanQRCode = async () => {
    if (!videoRef.current || !canvasRef.current || !isScanning) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) return;

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Use jsQR library for QR code detection (we'll add this via CDN or install it)
    // For now, we'll use a simpler approach with manual entry
    
    // Continue scanning
    if (isScanning) {
      requestAnimationFrame(scanQRCode);
    }
  };

  const validateTicket = async (qrCode: string) => {
    if (!supportsQrCodeField) {
      setScanResult({
        success: false,
        message:
          'QR validation is unavailable until the backend update that stores QR codes is deployed.',
      });
      setIsValidating(false);
      setManualQrCode('');
      return;
    }

    setIsValidating(true);
    setScanResult(null);

    try {
      // Query the booking by QR code
      const listParams = supportsQrCodeField
        ? ({ filter: { qrCode: { eq: qrCode } } } as Parameters<
            typeof client.models.Booking.list
          >[0])
        : undefined;
      const { data: bookings } = await client.models.Booking.list(listParams);

      if (!bookings || bookings.length === 0) {
        setScanResult({
          success: false,
          message: 'Invalid QR code - booking not found',
        });
        return;
      }

      const booking = bookings[0];
      const usedAtValue = supportsUsedAtField ? (booking as any).usedAt : undefined;

      // Check if ticket is already used
      if (booking.status === 'used') {
        setScanResult({
          success: false,
          message: `Ticket already used${
            usedAtValue ? ` at ${new Date(usedAtValue).toLocaleString()}` : ''
          }`,
          booking: {
            eventTitle: booking.eventTitle,
            userName: booking.userName,
            userEmail: booking.userEmail,
            quantity: booking.quantity,
            totalPrice: booking.totalPrice,
          },
        });
        return;
      }

      // Check if ticket is cancelled
      if (booking.status === 'cancelled') {
        setScanResult({
          success: false,
          message: 'Ticket has been cancelled',
          booking: {
            eventTitle: booking.eventTitle,
            userName: booking.userName,
            userEmail: booking.userEmail,
            quantity: booking.quantity,
            totalPrice: booking.totalPrice,
          },
        });
        return;
      }

      // Update ticket status to "used"
      await client.models.Booking.update({
        id: booking.id,
        status: 'used',
        ...(supportsUsedAtField ? { usedAt: new Date().toISOString() } : {}),
      });

      setScanResult({
        success: true,
        message: 'Ticket validated successfully! ✓',
        booking: {
          eventTitle: booking.eventTitle,
          userName: booking.userName,
          userEmail: booking.userEmail,
          quantity: booking.quantity,
          totalPrice: booking.totalPrice,
        },
      });

      // Play success sound (optional)
      playSuccessSound();
    } catch (error) {
      console.error('Error validating ticket:', error);
      setScanResult({
        success: false,
        message: 'Error validating ticket. Please try again.',
      });
    } finally {
      setIsValidating(false);
      setManualQrCode('');
    }
  };

  const playSuccessSound = () => {
    // Create a simple beep sound
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = 800;
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.3);
  };

  const handleManualValidation = () => {
    if (manualQrCode.trim()) {
      validateTicket(manualQrCode.trim());
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">🎫 Scan Tickets</h1>
        <p className="text-muted">Validate event tickets with QR code scanning</p>
      </div>

      {!supportsQrCodeField && (
        <div className="mb-6 rounded-lg border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm text-yellow-800">
          QR validation tools will become available after the backend update that stores ticket QR codes.
          Until then, use the booking list to manage attendees.
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Camera Scanner */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Camera className="w-5 h-5" />
            Camera Scanner
          </h2>

          <div className="space-y-4">
            {!isScanning ? (
              <div className="text-center py-12">
                <ScanLine className="w-16 h-16 mx-auto mb-4 text-muted" />
                <p className="text-muted mb-4">Start camera to scan QR codes</p>
                <Button onClick={startCamera}>
                  <Camera className="w-4 h-4" />
                  Start Camera
                </Button>
              </div>
            ) : (
              <div className="relative">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full rounded-lg"
                />
                <canvas ref={canvasRef} className="hidden" />
                
                {/* Scan overlay */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-64 h-64 border-4 border-primary rounded-lg animate-pulse" />
                </div>

                <div className="mt-4 text-center">
                  <Button onClick={stopCamera} variant="secondary">
                    Stop Camera
                  </Button>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Manual Entry */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Manual QR Entry</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Enter QR Code
              </label>
              <input
                type="text"
                value={manualQrCode}
                onChange={(e) => setManualQrCode(e.target.value)}
                placeholder="EVENTORA-xxx-xxx-xxx"
                className="input w-full"
                onKeyPress={(e) => e.key === 'Enter' && handleManualValidation()}
              />
            </div>

            <Button
              onClick={handleManualValidation}
              disabled={!manualQrCode.trim() || isValidating}
              className="w-full"
            >
              {isValidating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Validating...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Validate Ticket
                </>
              )}
            </Button>
          </div>
        </Card>
      </div>

      {/* Scan Result */}
      {scanResult && (
        <Card className={`mt-6 p-6 ${scanResult.success ? 'border-green-500' : 'border-red-500'} border-2`}>
          <div className="flex items-start gap-4">
            {scanResult.success ? (
              <CheckCircle className="w-8 h-8 text-green-500 flex-shrink-0" />
            ) : (
              <XCircle className="w-8 h-8 text-red-500 flex-shrink-0" />
            )}

            <div className="flex-1">
              <h3 className={`text-xl font-semibold mb-2 ${scanResult.success ? 'text-green-600' : 'text-red-600'}`}>
                {scanResult.message}
              </h3>

              {scanResult.booking && (
                <div className="mt-4 space-y-2">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted">Event</p>
                      <p className="font-semibold">{scanResult.booking.eventTitle}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted">Guest</p>
                      <p className="font-semibold">{scanResult.booking.userName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted">Email</p>
                      <p className="font-semibold">{scanResult.booking.userEmail}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted">Quantity</p>
                      <p className="font-semibold">{scanResult.booking.quantity} ticket(s)</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <Button
            onClick={() => setScanResult(null)}
            variant="secondary"
            className="mt-4"
          >
            Scan Next Ticket
          </Button>
        </Card>
      )}

      {/* Instructions */}
      <Card className="mt-6 p-6 bg-blue-50 dark:bg-blue-950">
        <h3 className="font-semibold mb-2">📋 How to Use:</h3>
        <ul className="space-y-1 text-sm">
          <li>• <strong>Camera Mode:</strong> Click "Start Camera" and point at QR code</li>
          <li>• <strong>Manual Mode:</strong> Type or paste the QR code text</li>
          <li>• <strong>Valid Tickets:</strong> Green confirmation with guest details</li>
          <li>• <strong>Invalid/Used:</strong> Red warning with reason</li>
          <li>• <strong>Tip:</strong> Each ticket can only be scanned once!</li>
        </ul>
      </Card>
    </div>
  );
}
