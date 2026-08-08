import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, List, LayoutGrid, Search, Trash2 } from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import type { DropResult } from '@hello-pangea/dnd';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { mockOrders, mockRecipes, mockIngredients } from '../../lib/mockData';
import type { Order, OrderStatus } from '../../types';
import { supabase } from '../../lib/supabase';
import { useToast } from '../../components/ui/ToastContext';
import { AlertDialog } from '../../components/ui/AlertDialog';

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
  const [orders, setOrders] = useState<Order[]>(mockOrders);
  const [view, setView] = useState<'list' | 'kanban'>('list');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
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
      const recipe = mockRecipes.find(r => r.id === item.recipe_id);
      if (!recipe) continue;
      
      for (const rItem of recipe.items) {
        const ingredient = mockIngredients.find(i => i.id === rItem.ingredient_id);
        if (!ingredient) continue;
        
        const totalToDeduct = rItem.quantity * item.quantity;
        const newStock = Math.max(0, ingredient.stock - totalToDeduct);
        
        try {
          await supabase.from('ingredients').update({ stock: newStock }).eq('id', ingredient.id);
          hasDeducted = true;
        } catch (e) {
          console.error('Failed to deduct stock for', ingredient.name);
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
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status: newStatus } : o));
    
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
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
    
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
      setOrders(prev => prev.filter(o => o.id !== deleteId));
      toast.success('Pedido eliminado correctamente');
    } catch (err: any) {
      console.error(err);
      setOrders(prev => prev.filter(o => o.id !== deleteId));
      toast.info('Eliminado localmente (modo mock)');
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
          <button className="btn-primary"><Plus size={16} /> Nuevo Pedido</button>
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
    </div>
  );
};
