import { QRCodeSVG } from 'qrcode.react';
import { Download } from 'lucide-react';
import { Button } from './Button';

interface QRCodeGeneratorProps {
  value: string;
  eventTitle: string;
  size?: number;
  showDownload?: boolean;
}

export function QRCodeGenerator({ value, eventTitle, size = 200, showDownload = true }: QRCodeGeneratorProps) {
  const handleDownload = () => {
    const svg = document.getElementById(`qr-${value}`);
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    canvas.width = size;
    canvas.height = size;

    img.onload = () => {
      ctx?.drawImage(img, 0, 0);
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `${eventTitle.replace(/\s+/g, '-')}-ticket.png`;
          link.click();
          URL.revokeObjectURL(url);
        }
      });
    };

    img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
  };

  return (
    <div className="qr-card">
      <div className="mb-4">
        <QRCodeSVG
          id={`qr-${value}`}
          value={value}
          size={size}
          level="H"
          includeMargin={true}
        />
      </div>
      
      {showDownload && (
        <Button onClick={handleDownload} variant="secondary" size="sm">
          <Download className="w-4 h-4" />
          Download QR Code
        </Button>
      )}
    </div>
  );
}

