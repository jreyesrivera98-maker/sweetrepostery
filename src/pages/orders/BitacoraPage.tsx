import React, { useState } from 'react';
import { Download, Filter, FileText, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import type { Order, OrderStatus } from '../../types';
import { supabase } from '../../lib/supabase';
import { useDataStore } from '../../store/useDataStore';
import { useToast } from '../../components/ui/ToastContext';
import { AlertDialog } from '../../components/ui/AlertDialog';

const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'Pendiente', production: 'En Producción', ready: 'Listo', delivered: 'Entregado', cancelled: 'Cancelado',
};

function getPaymentStatus(order: Order) {
  if (order.balance_due === 0) return { label: 'Pagado', style: 'badge badge-success' };
  if (order.advance_paid > 0) return { label: 'Anticipo', style: 'badge badge-warning' };
  return { label: 'Sin pago', style: 'badge badge-danger' };
}

export const BitacoraPage: React.FC = () => {
  const orders = useDataStore(s => s.orders);
  const updateStoreOrder = useDataStore(s => s.updateOrder);
  const deleteStoreOrder = useDataStore(s => s.deleteOrder);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [channelFilter, setChannelFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();
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

  const handleUpdateStatus = async (id: string, status: OrderStatus) => {
    updateStoreOrder(id, { status });
    try {
      const { error } = await supabase.from('orders').update({ status }).eq('id', id);
      if (error) throw error;
      toast.success('Estado actualizado');
    } catch {
      toast.info('Actualizado localmente');
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      const { error } = await supabase.from('orders').delete().eq('id', deleteId);
      if (error) throw error;
      deleteStoreOrder(deleteId);
      toast.success('Pedido eliminado correctamente');
    } catch {
      deleteStoreOrder(deleteId);
      toast.info('Eliminado localmente');
    } finally {
      setIsDeleting(false);
      setDeleteId(null);
    }
  };

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
              <th>Total</th><th>Anticipo</th><th>Saldo</th><th>Pago</th><th>Estado</th><th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {paginated.map(order => {
              const payment = getPaymentStatus(order);
              return (
                <tr key={order.id}>
                  <td data-label="Folio"><span style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '0.8rem', color: '#6C5CE7' }}>{order.folio}</span></td>
                  <td data-label="Fecha" style={{ fontSize: '0.8rem' }}>{format(new Date(order.created_at), 'dd MMM yyyy', { locale: es })}</td>
                  <td data-label="Cliente" style={{ fontWeight: 500 }}>{order.customer_name}</td>
                  <td data-label="Canal"><span className="badge badge-primary">{order.channel}</span></td>
                  <td data-label="Items" style={{ fontSize: '0.8rem', color: '#636E72' }}>{order.items.length} ítem(s)</td>
                  <td data-label="Total" style={{ fontWeight: 600 }}>${order.total.toLocaleString('es-MX')}</td>
                  <td data-label="Anticipo" style={{ color: '#28A745' }}>${order.advance_paid.toLocaleString('es-MX')}</td>
                  <td data-label="Saldo" style={{ color: order.balance_due > 0 ? '#E74C3C' : '#28A745' }}>${order.balance_due.toLocaleString('es-MX')}</td>
                  <td data-label="Pago"><span className={payment.style}>{payment.label}</span></td>
                  <td data-label="Estado">
                    <select
                      className="input-marea min-h-[44px]"
                      style={{ width: '100%', maxWidth: '140px', padding: '0.2rem 0.4rem', fontSize: '0.72rem' }}
                      value={order.status}
                      onChange={e => handleUpdateStatus(order.id, e.target.value as OrderStatus)}
                    >
                      {Object.entries(STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                    </select>
                  </td>
                  <td className="actions-cell">
                    <button
                      onClick={() => setDeleteId(order.id)}
                      style={{ padding: '0.3rem', borderRadius: '0.375rem', background: '#FFF5F5', border: 'none', cursor: 'pointer', color: '#E74C3C', minHeight: '44px', minWidth: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      title="Eliminar pedido"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
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

      <AlertDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        isLoading={isDeleting}
        title="Eliminar pedido"
        description="¿Estás seguro de eliminar este pedido de la bitácora? Esta acción no se puede deshacer."
      />
    </div>
  );
};
