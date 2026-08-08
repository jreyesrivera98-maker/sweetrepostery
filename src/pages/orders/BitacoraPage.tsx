import React, { useState } from 'react';
import { Download, Filter, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { mockOrders } from '../../lib/mockData';
import type { Order, OrderStatus } from '../../types';

const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'Pendiente', production: 'En Producción', ready: 'Listo', delivered: 'Entregado', cancelled: 'Cancelado',
};

function getPaymentStatus(order: Order) {
  if (order.balance_due === 0) return { label: 'Pagado', style: 'badge badge-success' };
  if (order.advance_paid > 0) return { label: 'Anticipo', style: 'badge badge-warning' };
  return { label: 'Sin pago', style: 'badge badge-danger' };
}

export const BitacoraPage: React.FC = () => {
  const [orders] = useState<Order[]>(mockOrders);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [channelFilter, setChannelFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [page, setPage] = useState(1);
  const PER_PAGE = 10;

  const filtered = orders.filter(o => {
    const oDate = new Date(o.created_at);
    const matchFrom = !dateFrom || oDate >= new Date(dateFrom);
    const matchTo = !dateTo || oDate <= new Date(dateTo);
    const matchChannel = channelFilter === 'all' || o.channel === channelFilter;
    const matchPayment =
      paymentFilter === 'all' ||
      (paymentFilter === 'paid' && o.balance_due === 0) ||
      (paymentFilter === 'advance' && o.advance_paid > 0 && o.balance_due > 0) ||
      (paymentFilter === 'unpaid' && o.advance_paid === 0);
    return matchFrom && matchTo && matchChannel && matchPayment;
  });

  const totalRevenue = filtered.reduce((s, o) => s + o.total, 0);
  const totalCollected = filtered.reduce((s, o) => s + o.advance_paid, 0);
  const totalPending = filtered.reduce((s, o) => s + o.balance_due, 0);

  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const totalPages = Math.ceil(filtered.length / PER_PAGE);

  const exportCSV = () => {
    const headers = ['Folio', 'Fecha', 'Cliente', 'Canal', 'Total', 'Anticipo', 'Saldo', 'Estado'];
    const rows = filtered.map(o => [o.folio, format(new Date(o.created_at), 'dd/MM/yyyy'), o.customer_name, o.channel, o.total, o.advance_paid, o.balance_due, STATUS_LABELS[o.status]]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `bitacora-marea-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Bitácora de Pedidos</h1>
          <p className="page-subtitle">Historial completo y auditable de todas las ventas</p>
        </div>
        <button onClick={exportCSV} className="btn-primary"><Download size={16} /> Exportar CSV</button>
      </div>

      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
        {[
          { label: 'Total Pedidos', value: filtered.length.toString(), color: '#6C5CE7' },
          { label: 'Total Facturado', value: `$${totalRevenue.toLocaleString('es-MX')}`, color: '#2D3436' },
          { label: 'Total Cobrado', value: `$${totalCollected.toLocaleString('es-MX')}`, color: '#28A745' },
          { label: 'Pendiente Cobro', value: `$${totalPending.toLocaleString('es-MX')}`, color: '#E74C3C' },
        ].map(card => (
          <div key={card.label} className="glass-card" style={{ padding: '1.25rem' }}>
            <div style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.75rem', color: '#636E72', marginBottom: '0.375rem' }}>{card.label}</div>
            <div style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '1.375rem', color: card.color }}>{card.value}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Filter size={14} style={{ color: '#636E72' }} />
          <span style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '0.8rem', color: '#636E72' }}>Filtros:</span>
        </div>
        <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="input-marea" style={{ width: 'auto' }} />
        <span style={{ alignSelf: 'center', color: '#636E72' }}>—</span>
        <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="input-marea" style={{ width: 'auto' }} />
        <select value={channelFilter} onChange={e => setChannelFilter(e.target.value)} className="input-marea" style={{ width: 'auto' }}>
          <option value="all">Todos los canales</option>
          <option value="manual">Manual</option>
          <option value="whatsapp">WhatsApp</option>
          <option value="catalog">Catálogo</option>
          <option value="instagram">Instagram</option>
        </select>
        <select value={paymentFilter} onChange={e => setPaymentFilter(e.target.value)} className="input-marea" style={{ width: 'auto' }}>
          <option value="all">Todos los pagos</option>
          <option value="paid">Pagado total</option>
          <option value="advance">Anticipo recibido</option>
          <option value="unpaid">Sin pago</option>
        </select>
      </div>

      {/* Table */}
      <div className="glass-card" style={{ overflow: 'hidden' }}>
        <table className="marea-table">
          <thead>
            <tr>
              <th>Folio</th><th>Fecha</th><th>Cliente</th><th>Canal</th><th>Items</th>
              <th>Total</th><th>Anticipo</th><th>Saldo</th><th>Pago</th><th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {paginated.map(order => {
              const payment = getPaymentStatus(order);
              return (
                <tr key={order.id}>
                  <td><span style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '0.8rem', color: '#6C5CE7' }}>{order.folio}</span></td>
                  <td style={{ fontSize: '0.8rem' }}>{format(new Date(order.created_at), 'dd MMM yyyy', { locale: es })}</td>
                  <td style={{ fontWeight: 500 }}>{order.customer_name}</td>
                  <td><span className="badge badge-primary">{order.channel}</span></td>
                  <td style={{ fontSize: '0.8rem', color: '#636E72' }}>{order.items.length} ítem(s)</td>
                  <td style={{ fontWeight: 600 }}>${order.total.toLocaleString('es-MX')}</td>
                  <td style={{ color: '#28A745' }}>${order.advance_paid.toLocaleString('es-MX')}</td>
                  <td style={{ color: order.balance_due > 0 ? '#E74C3C' : '#28A745' }}>${order.balance_due.toLocaleString('es-MX')}</td>
                  <td><span className={payment.style}>{payment.label}</span></td>
                  <td><span className={`status-pill status-${order.status}`}>{STATUS_LABELS[order.status]}</span></td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#636E72' }}>
            <FileText size={40} style={{ marginBottom: '1rem', opacity: 0.4 }} />
            <p>No hay pedidos con esos filtros.</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '1rem' }}>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
            <button key={p} onClick={() => setPage(p)} style={{ padding: '0.375rem 0.75rem', borderRadius: '0.5rem', border: '1.5px solid', borderColor: p === page ? '#6C5CE7' : '#E8E3FF', background: p === page ? '#6C5CE7' : 'white', color: p === page ? 'white' : '#2D3436', cursor: 'pointer', fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '0.8rem' }}>
              {p}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
