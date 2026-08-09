import React, { useState } from 'react';
import { Plus, Search, Star, AlertTriangle, Phone, Mail, MapPin, Gift, Heart } from 'lucide-react';
import { format, differenceInDays, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { mockCustomers, mockOrders } from '../lib/mockData';
import type { Customer } from '../types';
import { supabase } from '../lib/supabase';
import { useToast } from '../components/ui/ToastContext';
import { AlertDialog } from '../components/ui/AlertDialog';
import { Trash2, Edit, X } from 'lucide-react';

const CustomerFormModal: React.FC<{ isOpen: boolean; onClose: () => void; onSave: (customer: Customer) => void }> = ({ isOpen, onClose, onSave }) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [allergies, setAllergies] = useState('');
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;
    const newCustomer: Customer = {
      id: Math.random().toString(36).substr(2, 9),
      name, phone, email, address, allergies, notes,
      loyalty_points: 0, important_dates: [],
      created_at: new Date().toISOString()
    };
    onSave(newCustomer);
    setName(''); setPhone(''); setEmail(''); setAddress(''); setAllergies(''); setNotes('');
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-poppins font-bold text-gray-900">Nuevo Cliente</h2>
          <button onClick={onClose} className="p-2 bg-gray-100 rounded-full text-gray-500 hover:bg-gray-200"><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
            <input required className="input-marea" value={name} onChange={e => setName(e.target.value)} placeholder="Ej. Ana Pérez" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
              <input className="input-marea" value={phone} onChange={e => setPhone(e.target.value)} placeholder="Ej. 5551234567" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input type="email" className="input-marea" value={email} onChange={e => setEmail(e.target.value)} placeholder="ejemplo@correo.com" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Dirección / Notas de envío</label>
            <input className="input-marea" value={address} onChange={e => setAddress(e.target.value)} placeholder="Ej. Calle 123, Col. Centro" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 text-orange-600 font-semibold">Alergias (Importante)</label>
            <input className="input-marea border-orange-200 focus:border-orange-400" value={allergies} onChange={e => setAllergies(e.target.value)} placeholder="Ej. Nuez, Gluten, Lácteos..." />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notas generales</label>
            <textarea className="input-marea resize-none" rows={3} value={notes} onChange={e => setNotes(e.target.value)} placeholder="Preferencias, historial de trato, etc." />
          </div>
          <div className="pt-4 flex gap-3">
            <button type="button" onClick={onClose} className="btn-ghost flex-1 justify-center">Cancelar</button>
            <button type="submit" className="btn-primary flex-1 justify-center">Guardar Cliente</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export const CustomersPage: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>(mockCustomers);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Customer | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const { toast } = useToast();

  const isUpcoming = (dateStr: string) => {
    try {
      const now = new Date();
      const d = parseISO(dateStr);
      const thisYear = new Date(now.getFullYear(), d.getMonth(), d.getDate());
      const diff = differenceInDays(thisYear, now);
      return diff >= 0 && diff <= 7;
    } catch { return false; }
  };

  const filtered = customers.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    (c.email?.toLowerCase().includes(search.toLowerCase()) ?? false) ||
    (c.phone?.includes(search) ?? false)
  );

  const customerOrders = selected ? mockOrders.filter(o => o.customer_name === selected.name) : [];

  const redeemPoints = async (id: string, points: number) => {
    if (points < 100) { toast.error('Mínimo 100 puntos para canjear.'); return; }
    
    // Optimistic UI update
    setCustomers(prev => prev.map(c => c.id === id ? { ...c, loyalty_points: c.loyalty_points - 100 } : c));
    if (selected && selected.id === id) {
      setSelected({ ...selected, loyalty_points: selected.loyalty_points - 100 });
    }

    try {
      const { error } = await supabase.from('customers').update({ loyalty_points: points - 100 }).eq('id', id);
      if (error) throw error;
      toast.success('100 puntos canjeados por 5% de descuento.');
    } catch (err: any) {
      console.error(err);
      toast.info('Canjeado localmente (modo mock)');
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      const { error } = await supabase.from('customers').delete().eq('id', deleteId);
      if (error) throw error;
      setCustomers(prev => prev.filter(c => c.id !== deleteId));
      if (selected?.id === deleteId) setSelected(null);
      toast.success('Cliente eliminado correctamente');
    } catch (err: any) {
      console.error(err);
      setCustomers(prev => prev.filter(c => c.id !== deleteId));
      if (selected?.id === deleteId) setSelected(null);
      toast.info('Eliminado localmente (modo mock)');
    } finally {
      setIsDeleting(false);
      setDeleteId(null);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Clientes CRM</h1>
          <p className="page-subtitle">{customers.length} clientes registrados</p>
        </div>
        <button onClick={() => setIsNewModalOpen(true)} className="btn-primary"><Plus size={16} /> Nuevo Cliente</button>
      </div>

      {/* Search */}
      <div style={{ position: 'relative', marginBottom: '1.5rem', maxWidth: '400px' }}>
        <Search size={15} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#B2BEC3' }} />
        <input className="input-marea" style={{ paddingLeft: '2.25rem' }} placeholder="Buscar por nombre, email o teléfono..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: selected ? '1fr 1.5fr' : 'repeat(2, 1fr)', gap: '1.25rem' }}>
        {/* Customer Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
          {filtered.map(customer => {
            const upcoming = customer.important_dates.some(d => isUpcoming(d.date));
            return (
              <div
                key={customer.id}
                onClick={() => setSelected(selected?.id === customer.id ? null : customer)}
                className="glass-card"
                style={{ padding: '1.25rem', cursor: 'pointer', border: selected?.id === customer.id ? '2px solid #6C5CE7' : '1px solid #E8E3FF', transition: 'all 0.2s' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  {/* Avatar */}
                  <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'linear-gradient(135deg, #6C5CE7, #A29BFE)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '1.2rem', flexShrink: 0 }}>
                    {customer.name.charAt(0).toUpperCase()}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                      <span style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '0.9rem' }}>{customer.name}</span>
                      {upcoming && <Gift size={14} style={{ color: '#E91E8C' }} />}
                      {customer.allergies && <AlertTriangle size={14} style={{ color: '#E67E22' }} />}
                    </div>
                    <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                      {customer.phone && <span style={{ fontSize: '0.75rem', color: '#636E72', display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Phone size={11} />{customer.phone}</span>}
                      {customer.email && <span style={{ fontSize: '0.75rem', color: '#636E72', display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Mail size={11} />{customer.email}</span>}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', justifyContent: 'flex-end', marginBottom: '0.25rem' }}>
                      <Star size={12} style={{ color: '#F4C430', fill: '#F4C430' }} />
                      <span style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '0.875rem', color: '#6C5CE7' }}>{customer.loyalty_points}</span>
                    </div>
                    <span style={{ fontSize: '0.7rem', color: '#636E72' }}>puntos</span>
                  </div>
                </div>
              </div>
            );
          })}
          {filtered.length === 0 && (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#636E72' }}>No se encontraron clientes.</div>
          )}
        </div>

        {/* Customer Detail Panel */}
        {selected && (
          <div className="glass-card" style={{ padding: '1.5rem', height: 'fit-content', position: 'sticky', top: '80px' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid #E8E3FF' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'linear-gradient(135deg, #6C5CE7, #A29BFE)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '1.4rem' }}>
                {selected.name.charAt(0)}
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, margin: 0 }}>{selected.name}</h3>
                <span className="badge badge-primary">Cliente registrado</span>
              </div>
              <div style={{ display: 'flex', gap: '0.375rem' }}>
                <button style={{ padding: '0.375rem', borderRadius: '0.375rem', background: '#EDE9FF', border: 'none', cursor: 'pointer', color: '#6C5CE7' }} onClick={() => toast.info('Función de edición en desarrollo')}><Edit size={14} /></button>
                <button style={{ padding: '0.375rem', borderRadius: '0.375rem', background: '#FFF5F5', border: 'none', cursor: 'pointer', color: '#E74C3C' }} onClick={() => setDeleteId(selected.id)}><Trash2 size={14} /></button>
              </div>
            </div>

            {/* Contact info */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem', marginBottom: '1.25rem' }}>
              {selected.phone && <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.875rem', alignItems: 'center' }}><Phone size={14} style={{ color: '#6C5CE7' }} />{selected.phone}</div>}
              {selected.email && <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.875rem', alignItems: 'center' }}><Mail size={14} style={{ color: '#6C5CE7' }} />{selected.email}</div>}
              {selected.address && <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.875rem', alignItems: 'center' }}><MapPin size={14} style={{ color: '#6C5CE7' }} />{selected.address}</div>}
            </div>

            {/* Allergies */}
            {selected.allergies && (
              <div style={{ background: '#FFF8F0', border: '1px solid #FED7AA', borderRadius: '0.625rem', padding: '0.75rem', marginBottom: '1rem', display: 'flex', gap: '0.5rem', alignItems: 'center', fontSize: '0.875rem' }}>
                <AlertTriangle size={14} style={{ color: '#E67E22', flexShrink: 0 }} />
                <span><strong>Alergias:</strong> {selected.allergies}</span>
              </div>
            )}

            {/* Important dates */}
            {selected.important_dates.length > 0 && (
              <div style={{ marginBottom: '1.25rem' }}>
                <div style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '0.8rem', color: '#636E72', marginBottom: '0.5rem' }}>FECHAS ESPECIALES</div>
                {selected.important_dates.map((d, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', padding: '0.375rem 0' }}>
                    <Heart size={12} style={{ color: '#E91E8C' }} />
                    <span>{d.label}:</span>
                    <span style={{ color: '#636E72' }}>{format(parseISO(d.date), 'dd MMMM', { locale: es })}</span>
                    {isUpcoming(d.date) && <span className="badge" style={{ background: '#FFF0F6', color: '#9B1D6A', fontSize: '0.65rem' }}>¡En 7 días!</span>}
                  </div>
                ))}
              </div>
            )}

            {/* Loyalty points */}
            <div className="ai-panel" style={{ marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '1.5rem', color: '#6C5CE7' }}>
                    <Star size={16} style={{ color: '#F4C430', fill: '#F4C430', marginRight: '0.25rem' }} />
                    {selected.loyalty_points} pts
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#636E72' }}>100 pts = 5% de descuento</div>
                </div>
                <button onClick={() => redeemPoints(selected.id, selected.loyalty_points)} className="btn-primary" style={{ fontSize: '0.8rem', padding: '0.5rem 0.875rem' }}>
                  Canjear
                </button>
              </div>
            </div>

            {/* Order history */}
            <div>
              <div style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '0.8rem', color: '#636E72', marginBottom: '0.625rem' }}>HISTORIAL DE PEDIDOS</div>
              {customerOrders.length === 0 ? (
                <p style={{ color: '#B2BEC3', fontSize: '0.875rem', fontFamily: 'Inter, sans-serif' }}>Sin pedidos previos.</p>
              ) : (
                customerOrders.map(order => (
                  <div key={order.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.625rem 0', borderBottom: '1px solid #F4F3FF', fontSize: '0.875rem' }}>
                    <div>
                      <span style={{ fontWeight: 600, color: '#6C5CE7' }}>{order.folio}</span>
                      <span style={{ color: '#636E72', marginLeft: '0.5rem' }}>{format(new Date(order.created_at), 'dd MMM yyyy', { locale: es })}</span>
                    </div>
                    <span style={{ fontWeight: 700 }}>${order.total.toLocaleString('es-MX')}</span>
                  </div>
                ))
              )}
            </div>

            {/* Notes */}
            {selected.notes && (
              <div style={{ marginTop: '1rem', padding: '0.75rem', background: '#F4F3FF', borderRadius: '0.625rem', fontSize: '0.8rem', color: '#636E72', fontStyle: 'italic' }}>
                "{selected.notes}"
              </div>
            )}
          </div>
        )}
      </div>

      <AlertDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        isLoading={isDeleting}
        title="Eliminar cliente"
        description="¿Estás seguro de eliminar este cliente? Se perderán sus puntos de lealtad y su historial de pedidos."
      />

      <CustomerFormModal 
        isOpen={isNewModalOpen} 
        onClose={() => setIsNewModalOpen(false)} 
        onSave={(c) => {
          setCustomers([c, ...customers]);
          setIsNewModalOpen(false);
          toast.success('Cliente creado exitosamente (Modo Demo)');
        }} 
      />
    </div>
  );
};
