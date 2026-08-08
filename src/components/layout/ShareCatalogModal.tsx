import React, { useEffect, useRef } from 'react';
import { X, Link, MessageCircle, Download, QrCode } from 'lucide-react';

interface ShareCatalogModalProps {
  open: boolean;
  onClose: () => void;
}

export const ShareCatalogModal: React.FC<ShareCatalogModalProps> = ({ open, onClose }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const catalogUrl = `${window.location.origin}/catalogo`;
  const [copied, setCopied] = React.useState(false);

  useEffect(() => {
    if (open && canvasRef.current) {
      drawQR(canvasRef.current, catalogUrl);
    }
  }, [open, catalogUrl]);

  const drawQR = (canvas: HTMLCanvasElement, _url: string) => {
    // Simple QR-code placeholder using canvas (replace with qrcode.js lib for production)
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    canvas.width = 200;
    canvas.height = 200;
    ctx.fillStyle = '#F4F3FF';
    ctx.fillRect(0, 0, 200, 200);
    ctx.fillStyle = '#6C5CE7';
    ctx.font = 'bold 11px Poppins, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('QR Code', 100, 90);
    ctx.fillStyle = '#4834D4';
    ctx.font = '9px Inter, sans-serif';
    ctx.fillText('(instala qrcode.react)', 100, 110);
    ctx.fillText('para generar QR real', 100, 124);
  };

  const copyUrl = async () => {
    try {
      await navigator.clipboard.writeText(catalogUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      alert(catalogUrl);
    }
  };

  const shareWhatsApp = () => {
    const msg = encodeURIComponent(`🍰 ¡Descubre nuestro catálogo de repostería artesanal!\n${catalogUrl}`);
    window.open(`https://web.whatsapp.com/send?text=${msg}`, '_blank');
  };

  const downloadQR = () => {
    if (!canvasRef.current) return;
    const link = document.createElement('a');
    link.download = 'marea-dulce-catalogo-qr.png';
    link.href = canvasRef.current.toDataURL();
    link.click();
  };

  if (!open) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '440px' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <div>
            <h2 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '1.25rem', margin: 0, color: '#2D3436' }}>
              Compartir Catálogo
            </h2>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.8rem', color: '#636E72', margin: '0.25rem 0 0' }}>
              Comparte tu tienda pública con clientes
            </p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#636E72', padding: '0.25rem' }}>
            <X size={20} />
          </button>
        </div>

        {/* URL */}
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '0.8rem', color: '#636E72', display: 'block', marginBottom: '0.5rem' }}>
            URL del Catálogo
          </label>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input
              readOnly
              value={catalogUrl}
              className="input-marea"
              style={{ flex: 1, background: '#F4F3FF', fontSize: '0.8rem' }}
            />
            <button onClick={copyUrl} className="btn-primary" style={{ flexShrink: 0 }}>
              <Link size={15} />
              {copied ? '¡Copiado!' : 'Copiar'}
            </button>
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <button onClick={shareWhatsApp} className="btn-ghost" style={{ justifyContent: 'center', background: '#E8FFF4', borderColor: '#A8E6CF', color: '#0A6640' }}>
            <MessageCircle size={16} /> WhatsApp
          </button>
          <button onClick={downloadQR} className="btn-ghost" style={{ justifyContent: 'center' }}>
            <Download size={16} /> Descargar QR
          </button>
        </div>

        {/* QR Code */}
        <div style={{ textAlign: 'center', padding: '1rem', background: '#F4F3FF', borderRadius: '0.875rem', border: '1px solid #E8E3FF' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <QrCode size={16} style={{ color: '#6C5CE7' }} />
            <span style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '0.8rem', color: '#6C5CE7' }}>
              Código QR
            </span>
          </div>
          <canvas ref={canvasRef} style={{ borderRadius: '0.5rem', border: '1px solid #E8E3FF' }} />
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.75rem', color: '#636E72', marginTop: '0.5rem' }}>
            Escanea para abrir el catálogo
          </p>
        </div>
      </div>
    </div>
  );
};
