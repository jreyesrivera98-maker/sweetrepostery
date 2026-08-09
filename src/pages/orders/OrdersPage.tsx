import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, List, LayoutGrid, Search, Trash2 } from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import type { DropResult } from '@hello-pangea/dnd';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import type { Order, OrderStatus } from '../../types';
import { supabase } from '../../lib/supabase';
import { useToast } from '../../components/ui/ToastContext';
import { AlertDialog } from '../../components/ui/AlertDialog';
import { X } from 'lucide-react';
import { useDataStore } from '../../store/useDataStore';

const OrderFormModal: React.FC<{ isOpen: boolean; onClose: () => void; onSave: (order: Order) => void }> = ({ isOpen, onClose, onSave }) => {
  const recipes = useDataStore(s => s.recipes);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [channel, setChannel] = useState<'manual' | 'whatsapp' | 'catalog' | 'instagram'>('manual');
  const [recipeId, setRecipeId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [price, setPrice] = useState(0);
  const [advance, setAdvance] = useState(0);

  if (!isOpen) return null;

  const handleRecipeChange = (id: string) => {
    setRecipeId(id);
    const r = recipes.find(rec => rec.id === id);
    if (r) {
      setPrice(r.sale_price * quantity);
      setAdvance((r.sale_price * quantity) / 2); // Default 50%
    }
  };

  const handleQuantityChange = (q: number) => {
    setQuantity(q);
    const r = recipes.find(rec => rec.id === recipeId);
    if (r) {
      setPrice(r.sale_price * q);
      setAdvance((r.sale_price * q) / 2);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !recipeId || price <= 0) return;
    
    const recipe = recipes.find(r => r.id === recipeId)!;
    const newOrder: Order = {
      id: Math.random().toString(36).substr(2, 9),
      folio: `MD-${Math.floor(Math.random() * 90000) + 10000}`,
      customer_name: customerName,
      customer_phone: customerPhone,
      delivery_date: deliveryDate ? new Date(deliveryDate).toISOString() : undefined,
      status: 'pending',
      channel,
      total: price,
      advance_paid: advance,
      balance_due: price - advance,
      qc_checklist: {},
      items: [{ recipe_id: recipe.id, recipe_name: recipe.name, quantity, unit_price: price/quantity, total: price }],
      created_at: new Date().toISOString()
    };
    onSave(newOrder);
    setCustomerName(''); setCustomerPhone(''); setDeliveryDate(''); setRecipeId(''); setQuantity(1); setPrice(0); setAdvance(0);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '600px' }}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-poppins font-bold text-gray-900">Nuevo Pedido Manual</h2>
          <button onClick={onClose} className="p-2 bg-gray-100 rounded-full text-gray-500 hover:bg-gray-200"><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cliente *</label>
              <input required className="input-marea" value={customerName} onChange={e => setCustomerName(e.target.value)} placeholder="Nombre del cliente" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
              <input className="input-marea" value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} placeholder="Ej. 5551234567" />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Entrega</label>
              <input type="date" className="input-marea" value={deliveryDate} onChange={e => setDeliveryDate(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Canal de Venta</label>
              <select className="input-marea" value={channel} onChange={e => setChannel(e.target.value as any)}>
                <option value="manual">Mostrador / Manual</option>
                <option value="whatsapp">WhatsApp</option>
                <option value="instagram">Instagram</option>
                <option value="catalog">Catálogo</option>
              </select>
            </div>
          </div>

          <div className="border-t border-gray-100 pt-4 mt-2">
            <h3 className="font-poppins font-semibold text-sm mb-3">Detalle del Producto</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Receta *</label>
                <select required className="input-marea" value={recipeId} onChange={e => handleRecipeChange(e.target.value)}>
                  <option value="">— Seleccionar —</option>
                  {recipes.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cantidad</label>
                <input type="number" min="1" required className="input-marea" value={quantity} onChange={e => handleQuantityChange(Number(e.target.value))} />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Precio Total (MXN)</label>
              <input type="number" required className="input-marea font-bold text-primary" value={price} onChange={e => setPrice(Number(e.target.value))} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Anticipo Recibido (MXN)</label>
              <input type="number" required className="input-marea text-green-600" value={advance} onChange={e => setAdvance(Number(e.target.value))} />
            </div>
          </div>

          <div className="pt-4 flex gap-3">
            <button type="button" onClick={onClose} className="btn-ghost flex-1 justify-center">Cancelar</button>
            <button type="submit" className="btn-primary flex-1 justify-center">Crear Pedido</button>
          </div>
        </form>
      </div>
    </div>
  );
};

const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'Pendiente',
  production: 'En Producción',
  ready: 'Listo',
  delivered: 'Entregado',
  cancelled: 'Cancelado',
};

const CHANNEL_COLORS: Record<string, { bg: string; color: string }> = {
  whatsapp: { bg: '#E8FFF4', color: '#0A6640' },
  instagram: { bg: '#FFF0F6', color: '#9B1D6A' },
  catalog: { bg: '#EDE9FF', color: '#4834D4' },
  manual: { bg: '#F4F3FF', color: '#636E72' },
};

const KANBAN_COLUMNS: { id: OrderStatus; label: string; color: string }[] = [
  { id: 'pending', label: 'Pendiente', color: '#FFC107' },
  { id: 'production', label: 'En Producción', color: '#17A2B8' },
  { id: 'ready', label: 'Listo', color: '#28A745' },
  { id: 'delivered', label: 'Entregado', color: '#6C5CE7' },
];

export const OrdersPage: React.FC = () => {
  const navigate = useNavigate();
  const orders = useDataStore(s => s.orders);
  const recipes = useDataStore(s => s.recipes);
  const ingredients = useDataStore(s => s.ingredients);
  const updateStoreOrder = useDataStore(s => s.updateOrder);
  const deleteStoreOrder = useDataStore(s => s.deleteOrder);
  const updateStoreIngredient = useDataStore(s => s.updateIngredient);
  const addStoreOrder = useDataStore(s => s.addOrder);
  
  const [view, setView] = useState<'list' | 'kanban'>('list');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const { toast } = useToast();

  const filtered = orders.filter(o => {
    const matchSearch = o.customer_name.toLowerCase().includes(search.toLowerCase()) || o.folio.includes(search);
    const matchStatus = statusFilter === 'all' || o.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleInventoryDeduction = async (orderId: string) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    let hasDeducted = false;
    for (const item of order.items) {
      const recipe = recipes.find(r => r.id === item.recipe_id);
      if (!recipe) continue;
      
      for (const rItem of recipe.items) {
        const ingredient = ingredients.find(i => i.id === rItem.ingredient_id);
        if (!ingredient) continue;
        
        const totalToDeduct = rItem.quantity * item.quantity;
        const newStock = Math.max(0, ingredient.stock - totalToDeduct);
        
        try {
          // Attempt real DB update if present, otherwise just update store
          await supabase.from('ingredients').update({ stock: newStock }).eq('id', ingredient.id);
          updateStoreIngredient(ingredient.id, { stock: newStock });
          hasDeducted = true;
        } catch (e) {
          console.error('Failed to deduct stock for', ingredient.name);
          updateStoreIngredient(ingredient.id, { stock: newStock });
          hasDeducted = true;
        }
      }
    }
    if (hasDeducted) {
      toast.info('Inventario actualizado automáticamente');
    }
  };

  const onDragEnd = async (result: DropResult) => {
    if (!result.destination) return;
    const newStatus = result.destination.droppableId as OrderStatus;
    const id = result.draggableId;
    const oldStatus = orders.find(o => o.id === id)?.status;
    
    // Optimistic UI update
    updateStoreOrder(id, { status: newStatus });
    
    if (oldStatus === 'pending' && (newStatus === 'production' || newStatus === 'delivered')) {
      handleInventoryDeduction(id);
    }
    
    try {
      const { error } = await supabase.from('orders').update({ status: newStatus }).eq('id', id);
      if (error) throw error;
      toast.success('Estado del pedido actualizado');
    } catch (err: any) {
      console.error(err);
      toast.info('Actualizado localmente (modo mock)');
    }
  };

  const updateStatus = async (id: string, status: OrderStatus) => {
    const oldStatus = orders.find(o => o.id === id)?.status;
    // Optimistic UI update
    updateStoreOrder(id, { status });
    
    if (oldStatus === 'pending' && (status === 'production' || status === 'delivered')) {
      handleInventoryDeduction(id);
    }
    
    try {
      const { error } = await supabase.from('orders').update({ status }).eq('id', id);
      if (error) throw error;
      toast.success('Estado del pedido actualizado');
    } catch (err: any) {
      console.error(err);
      toast.info('Actualizado localmente (modo mock)');
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
    } catch (err: any) {
      console.error(err);
      deleteStoreOrder(deleteId);
      toast.info('Eliminado localmente');
    } finally {
      setIsDeleting(false);
      setDeleteId(null);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Pedidos</h1>
          <p className="page-subtitle">{orders.length} pedidos registrados</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          {/* View toggle */}
          <div style={{ display: 'flex', background: '#F4F3FF', borderRadius: '0.625rem', padding: '3px', border: '1px solid #E8E3FF' }}>
            <button onClick={() => setView('list')} style={{ padding: '0.375rem 0.625rem', borderRadius: '0.5rem', border: 'none', cursor: 'pointer', background: view === 'list' ? '#6C5CE7' : 'transparent', color: view === 'list' ? 'white' : '#636E72', transition: 'all 0.2s' }}>
              <List size={16} />
            </button>
            <button onClick={() => setView('kanban')} style={{ padding: '0.375rem 0.625rem', borderRadius: '0.5rem', border: 'none', cursor: 'pointer', background: view === 'kanban' ? '#6C5CE7' : 'transparent', color: view === 'kanban' ? 'white' : '#636E72', transition: 'all 0.2s' }}>
              <LayoutGrid size={16} />
            </button>
          </div>
          <button onClick={() => navigate('/pedidos/bitacora')} className="btn-ghost">Bitácora</button>
          <button onClick={() => setIsNewModalOpen(true)} className="btn-primary"><Plus size={16} /> Nuevo Pedido</button>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
          <Search size={15} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#B2BEC3' }} />
          <input className="input-marea" style={{ paddingLeft: '2.25rem' }} placeholder="Buscar por cliente o folio..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="input-marea" style={{ width: 'auto' }} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="all">Todos los estados</option>
          {Object.entries(STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
      </div>

      {/* LIST VIEW */}
      {view === 'list' && (
        <div className="glass-card" style={{ overflow: 'hidden' }}>
          <table className="marea-table">
            <thead>
              <tr>
                <th>Folio</th><th>Cliente</th><th>Entrega</th><th>Estado</th><th>Canal</th><th>Total</th><th>Anticipo</th><th>Saldo</th><th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(order => {
                const ch = CHANNEL_COLORS[order.channel] || CHANNEL_COLORS.manual;
                return (
                  <tr key={order.id}>
                    <td><span style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '0.8rem', color: '#6C5CE7' }}>{order.folio}</span></td>
                    <td><span style={{ fontWeight: 500 }}>{order.customer_name}</span><br /><span style={{ fontSize: '0.75rem', color: '#636E72' }}>{order.customer_phone}</span></td>
                    <td style={{ fontSize: '0.8rem' }}>{order.delivery_date ? format(new Date(order.delivery_date), 'dd MMM yyyy', { locale: es }) : '—'}</td>
                    <td><span className={`status-pill status-${order.status}`}>{STATUS_LABELS[order.status]}</span></td>
                    <td><span className="badge" style={{ background: ch.bg, color: ch.color }}>{order.channel}</span></td>
                    <td style={{ fontWeight: 600 }}>${order.total.toLocaleString('es-MX')}</td>
                    <td style={{ color: '#28A745' }}>${order.advance_paid.toLocaleString('es-MX')}</td>
                    <td style={{ color: order.balance_due > 0 ? '#E74C3C' : '#28A745' }}>${order.balance_due.toLocaleString('es-MX')}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <select className="input-marea" style={{ width: 'auto', padding: '0.25rem 0.5rem', fontSize: '0.75rem' }} value={order.status} onChange={e => updateStatus(order.id, e.target.value as OrderStatus)}>
                          {Object.entries(STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                        </select>
                        <button 
                          onClick={() => setDeleteId(order.id)}
                          style={{ padding: '0.375rem', borderRadius: '0.375rem', background: '#FFF5F5', border: 'none', cursor: 'pointer', color: '#E74C3C' }}
                          title="Eliminar pedido"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#636E72', fontFamily: 'Inter, sans-serif' }}>
              No se encontraron pedidos con ese criterio.
            </div>
          )}
        </div>
      )}

      {/* KANBAN VIEW */}
      {view === 'kanban' && (
        <DragDropContext onDragEnd={onDragEnd}>
          <div style={{ display: 'flex', gap: '1rem', overflowX: 'auto', paddingBottom: '1rem' }}>
            {KANBAN_COLUMNS.map(col => {
              const colOrders = filtered.filter(o => o.status === col.id);
              return (
                <div key={col.id} style={{ minWidth: '270px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', padding: '0 0.25rem' }}>
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: col.color }} />
                    <span style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '0.875rem', color: '#2D3436' }}>{col.label}</span>
                    <span className="badge badge-primary" style={{ marginLeft: 'auto' }}>{colOrders.length}</span>
                  </div>
                  <Droppable droppableId={col.id}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className="kanban-column"
                        style={{ background: snapshot.isDraggingOver ? '#EDE9FF' : undefined, transition: 'background 0.2s' }}
                      >
                        {colOrders.map((order, index) => (
                          <Draggable key={order.id} draggableId={order.id} index={index}>
                            {(drag, snap) => (
                              <div
                                ref={drag.innerRef}
                                {...drag.draggableProps}
                                {...drag.dragHandleProps}
                                className="kanban-card"
                                style={{ ...drag.draggableProps.style, opacity: snap.isDragging ? 0.85 : 1, transform: snap.isDragging ? `${drag.draggableProps.style?.transform} rotate(2deg)` : drag.draggableProps.style?.transform }}
                              >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                                  <span style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '0.75rem', color: '#6C5CE7' }}>{order.folio}</span>
                                  <span className={`status-pill status-${order.status}`} style={{ fontSize: '0.65rem' }}>{STATUS_LABELS[order.status]}</span>
                                </div>
                                <div style={{ fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.25rem' }}>{order.customer_name}</div>
                                <div style={{ fontSize: '0.75rem', color: '#636E72', marginBottom: '0.5rem' }}>
                                  {order.delivery_date ? format(new Date(order.delivery_date), 'dd MMM', { locale: es }) : '—'}
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                  <span style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '0.9rem', color: '#2D3436' }}>
                                    ${order.total.toLocaleString('es-MX')}
                                  </span>
                                  {order.balance_due > 0 && (
                                    <span className="badge badge-warning" style={{ fontSize: '0.65rem' }}>Saldo ${order.balance_due.toLocaleString('es-MX')}</span>
                                  )}
                                </div>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                        {colOrders.length === 0 && (
                          <div style={{ textAlign: 'center', padding: '1.5rem 0', color: '#B2BEC3', fontSize: '0.8rem', fontFamily: 'Inter, sans-serif' }}>
                            Arrastra pedidos aquí
                          </div>
                        )}
                      </div>
                    )}
                  </Droppable>
                </div>
              );
            })}
          </div>
        </DragDropContext>
      )}

      <AlertDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        isLoading={isDeleting}
        title="Eliminar pedido"
        description="¿Estás seguro de eliminar este pedido? Esta acción no se puede deshacer y borrará el historial del mismo."
      />

      <OrderFormModal 
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        onSave={(o) => {
          addStoreOrder(o);
          setIsNewModalOpen(false);
          toast.success('Pedido creado exitosamente');
        }}
      />
    </div>
  );
};
