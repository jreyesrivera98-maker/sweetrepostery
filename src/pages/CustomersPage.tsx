import React, { useState } from 'react';
import { Plus, Search, Star, AlertTriangle, Phone, Mail, MapPin, Gift, Heart, Trash2, Edit } from 'lucide-react';
import { format, differenceInDays, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import type { Customer } from '../types';

import { useDataStore } from '../store/useDataStore';
import { useCustomerIntelligence } from '../hooks/useCustomerIntelligence';
import { useToast } from '../components/ui/ToastContext';
import { AlertDialog } from '../components/ui/AlertDialog';
import { PageHeader } from '../components/ui/PageHeader';
import { Drawer } from '../components/ui/Drawer';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Textarea } from '../components/ui/Textarea';
import { Badge } from '../components/ui/Badge';

const CustomerFormDrawer: React.FC<{ isOpen: boolean; onClose: () => void; onSave: (customer: Customer) => void }> = ({ isOpen, onClose, onSave }) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [allergies, setAllergies] = useState('');
  const [notes, setNotes] = useState('');

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
    <Drawer isOpen={isOpen} onClose={onClose} title="Nuevo Cliente" width="md">
      <form onSubmit={handleSubmit} className="flex flex-col h-full">
        <div className="space-y-4 flex-1">
          <Input label="Nombre completo *" required value={name} onChange={e => setName(e.target.value)} placeholder="Ej. Ana Pérez" />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Teléfono" value={phone} onChange={e => setPhone(e.target.value)} placeholder="10 dígitos" />
            <Input type="email" label="Email" value={email} onChange={e => setEmail(e.target.value)} placeholder="correo@ejemplo.com" />
          </div>
          <Textarea label="Dirección / Notas de envío" rows={2} value={address} onChange={e => setAddress(e.target.value)} placeholder="Calle, Colonia, Código Postal..." />
          <div className="bg-warning/10 p-4 rounded-xl border border-warning/20">
            <Input 
              label={
                <span className="flex items-center gap-1 text-warning-dark font-semibold">
                  <AlertTriangle size={14} /> Alergias (Importante)
                </span>
              } 
              value={allergies} 
              onChange={e => setAllergies(e.target.value)} 
              placeholder="Ej. Nuez, Gluten, Lácteos..." 
              className="border-warning/30 focus:border-warning"
            />
          </div>
          <Textarea label="Notas generales" rows={3} value={notes} onChange={e => setNotes(e.target.value)} placeholder="Preferencias, historial de trato, etc." />
        </div>
        <div className="pt-6 border-t border-border mt-6 flex gap-3 sticky bottom-0 bg-white">
          <Button type="button" variant="ghost" onClick={onClose} fullWidth>Cancelar</Button>
          <Button type="submit" variant="primary" fullWidth>Guardar Cliente</Button>
        </div>
      </form>
    </Drawer>
  );
};

export const CustomersPage: React.FC = () => {
  const customers = useDataStore(s => s.customers);
  const orders = useDataStore(s => s.orders);
  const addStoreCustomer = useDataStore(s => s.addCustomer);
  const deleteStoreCustomer = useDataStore(s => s.deleteCustomer);
  const updateStoreCustomer = useDataStore(s => s.updateCustomer);

  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Customer | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isNewDrawerOpen, setIsNewDrawerOpen] = useState(false);
  const { toast } = useToast();
  
  const customerIntelligence = useCustomerIntelligence();

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

  const customerOrders = selected ? orders.filter(o => o.customer_name === selected.name) : [];

  const redeemPoints = async (id: string, points: number) => {
    if (points < 100) { toast.error('Mínimo 100 puntos para canjear.'); return; }
    updateStoreCustomer(id, { loyalty_points: points - 100 });
    if (selected && selected.id === id) {
      setSelected({ ...selected, loyalty_points: selected.loyalty_points - 100 });
    }
    toast.success('100 puntos canjeados por 5% de descuento.');
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    deleteStoreCustomer(deleteId);
    if (selected?.id === deleteId) setSelected(null);
    toast.success('Cliente eliminado correctamente');
    setIsDeleting(false);
    setDeleteId(null);
  };

  return (
    <div className="max-w-7xl mx-auto pb-12">
      <PageHeader
        title="Directorio de Clientes"
        description={`Gestiona y analiza el comportamiento de tus ${customers.length} clientes`}
        primaryAction={<Button onClick={() => setIsNewDrawerOpen(true)} leftIcon={<Plus size={18} />}>Nuevo Cliente</Button>}
      />

      <Card className="mb-6 p-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted w-4 h-4" />
          <input 
            className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-border rounded-lg text-sm outline-none focus:border-primary transition-colors min-h-[44px]"
            placeholder="Buscar por nombre, email o teléfono..." 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
          />
        </div>
      </Card>

      <div className={`grid gap-6 ${selected ? 'grid-cols-1 lg:grid-cols-12' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}`}>
        {/* Lista de Clientes */}
        <div className={`space-y-4 ${selected ? 'lg:col-span-5' : 'md:col-span-2 lg:col-span-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 space-y-0'}`}>
          {filtered.map(customer => {
            const upcoming = customer.important_dates.some(d => isUpcoming(d.date));
            const isSelected = selected?.id === customer.id;
            
            return (
              <Card
                key={customer.id}
                onClick={() => setSelected(isSelected ? null : customer)}
                className={`p-4 cursor-pointer transition-all ${isSelected ? 'border-primary shadow-md ring-1 ring-primary' : 'hover:border-secondary hover:shadow-md'}`}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-poppins font-bold text-lg shrink-0">
                    {customer.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-poppins font-bold text-text truncate">{customer.name}</span>
                      {upcoming && <Gift size={14} className="text-pink-500 shrink-0" />}
                      {customer.allergies && <AlertTriangle size={14} className="text-warning-dark shrink-0" />}
                      <Badge variant={customerIntelligence[customer.id]?.segment === 'Frecuente' ? 'success' : customerIntelligence[customer.id]?.segment === 'En Riesgo' ? 'warning' : 'default'} className="ml-1 text-[10px] py-0 px-1.5 h-4">
                        {customerIntelligence[customer.id]?.segment || 'Nuevo'}
                      </Badge>
                    </div>
                    <div className="flex gap-3 flex-wrap">
                      {customer.phone && <span className="text-xs text-muted flex items-center gap-1"><Phone size={11} />{customer.phone}</span>}
                      <span className="text-xs font-bold text-primary-dark">LTV: ${(customerIntelligence[customer.id]?.ltv || 0).toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center justify-end gap-1 mb-1">
                      <Star size={12} className="text-yellow-500 fill-yellow-500" />
                      <span className="font-poppins font-bold text-sm text-primary">{customer.loyalty_points}</span>
                    </div>
                    <span className="text-[10px] text-muted uppercase tracking-wider">puntos</span>
                  </div>
                </div>
              </Card>
            );
          })}
          {filtered.length === 0 && (
            <div className={`text-center p-12 text-muted border border-dashed rounded-xl border-border bg-surface/50 ${selected ? '' : 'col-span-full'}`}>
              No se encontraron clientes.
            </div>
          )}
        </div>

        {/* Panel de Detalles */}
        {selected && (
          <div className="lg:col-span-7">
            <Card className="p-6 sticky top-24">
              <div className="flex flex-col md:flex-row gap-6 mb-6 pb-6 border-b border-border">
                <div className="flex-1 flex gap-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-poppins font-bold text-2xl shrink-0">
                    {selected.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-poppins font-bold text-xl text-text mb-2">{selected.name}</h3>
                    <div className="flex flex-col gap-1.5">
                      {selected.phone && <div className="text-sm text-muted flex items-center gap-2"><Phone size={14} className="text-primary"/> {selected.phone}</div>}
                      {selected.email && <div className="text-sm text-muted flex items-center gap-2"><Mail size={14} className="text-primary"/> {selected.email}</div>}
                      {selected.address && <div className="text-sm text-muted flex items-center gap-2"><MapPin size={14} className="text-primary"/> {selected.address}</div>}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 h-fit">
                  <Button variant="outline" size="sm" onClick={() => toast.info('Edición en desarrollo')}><Edit size={14} /></Button>
                  <Button variant="danger" size="sm" onClick={() => setDeleteId(selected.id)}><Trash2 size={14} /></Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  {/* Customer Intelligence Widget */}
                  <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 mb-4 grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-muted font-bold uppercase tracking-wider mb-1">Lifetime Value (LTV)</p>
                      <p className="text-xl font-poppins font-bold text-primary-dark">${(customerIntelligence[selected.id]?.ltv || 0).toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted font-bold uppercase tracking-wider mb-1">Ticket Promedio</p>
                      <p className="text-xl font-poppins font-bold text-text">${(customerIntelligence[selected.id]?.averageTicket || 0).toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted font-bold uppercase tracking-wider mb-1">Frecuencia</p>
                      <p className="text-sm font-bold text-text">{customerIntelligence[selected.id]?.frequency || 0} pedidos</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted font-bold uppercase tracking-wider mb-1">Segmento</p>
                      <Badge variant={customerIntelligence[selected.id]?.segment === 'Frecuente' ? 'success' : 'default'}>{customerIntelligence[selected.id]?.segment || 'Nuevo'}</Badge>
                    </div>
                  </div>

                  {selected.allergies && (
                    <div className="bg-warning/10 border border-warning/20 rounded-xl p-4 mb-4 flex items-start gap-2">
                      <AlertTriangle size={16} className="text-warning-dark shrink-0 mt-0.5" />
                      <div>
                        <span className="block font-bold text-sm text-warning-dark mb-1">Alergias</span>
                        <span className="text-sm text-text">{selected.allergies}</span>
                      </div>
                    </div>
                  )}

                  {selected.important_dates.length > 0 && (
                    <div className="mb-6">
                      <h4 className="text-xs font-bold text-muted uppercase tracking-wider mb-3">Fechas Especiales</h4>
                      <div className="space-y-2">
                        {selected.important_dates.map((d, i) => {
                          const upc = isUpcoming(d.date);
                          return (
                            <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-bg">
                              <div className="flex items-center gap-2 text-sm">
                                <Heart size={14} className="text-pink-500" />
                                <span className="font-medium">{d.label}</span>
                              </div>
                              <div className="flex items-center gap-2 text-sm">
                                <span className="text-muted">{format(parseISO(d.date), 'dd MMM', { locale: es })}</span>
                                {upc && <Badge variant="danger">¡Pronto!</Badge>}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {selected.notes && (
                    <div className="bg-bg rounded-xl p-4 text-sm text-muted italic">
                      "{selected.notes}"
                    </div>
                  )}
                </div>

                <div>
                  <div className="bg-gradient-to-br from-bg to-secondary-light/30 border border-secondary/30 rounded-xl p-4 mb-6">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2 text-primary font-poppins font-bold text-2xl">
                        <Star size={20} className="text-yellow-500 fill-yellow-500" />
                        {selected.loyalty_points}
                      </div>
                      <Button variant="primary" size="sm" onClick={() => redeemPoints(selected.id, selected.loyalty_points)}>
                        Canjear
                      </Button>
                    </div>
                    <p className="text-xs text-muted">100 puntos equivalen a un 5% de descuento en el próximo pedido.</p>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-muted uppercase tracking-wider mb-3 flex items-center justify-between">
                      Historial Reciente
                      <Badge variant="default">{customerOrders.length} pedidos</Badge>
                    </h4>
                    {customerOrders.length === 0 ? (
                      <p className="text-sm text-muted text-center py-4 bg-bg rounded-xl">Sin pedidos previos.</p>
                    ) : (
                      <div className="space-y-2">
                        {customerOrders.slice(0, 5).map(order => (
                          <div key={order.id} className="flex justify-between items-center p-3 rounded-lg border border-border hover:border-secondary transition-colors text-sm">
                            <div>
                              <span className="font-bold text-primary block">{order.folio}</span>
                              <span className="text-xs text-muted">{format(new Date(order.created_at), 'dd MMM yyyy', { locale: es })}</span>
                            </div>
                            <span className="font-bold text-text">${order.total.toLocaleString()}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>

      <AlertDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        isLoading={isDeleting}
        title="Eliminar cliente"
        description="Esta acción no se puede deshacer. Se perderán sus puntos y notas asociadas."
      />

      <CustomerFormDrawer 
        isOpen={isNewDrawerOpen} 
        onClose={() => setIsNewDrawerOpen(false)} 
        onSave={(c) => {
          addStoreCustomer(c);
          setIsNewDrawerOpen(false);
          toast.success('Cliente creado');
        }} 
      />
    </div>
  );
};
