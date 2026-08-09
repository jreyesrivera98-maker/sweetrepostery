import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, List, LayoutGrid, Search, Trash2, Calendar, Phone, CreditCard } from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import type { DropResult } from '@hello-pangea/dnd';
import { format, isToday, isBefore, startOfDay } from 'date-fns';
import { es } from 'date-fns/locale';
import type { Order, OrderStatus } from '../../types';
import { useToast } from '../../components/ui/ToastContext';
import { AlertDialog } from '../../components/ui/AlertDialog';
import { useDataStore } from '../../store/useDataStore';
import { useOperationalIntelligence } from '../../hooks/useOperationalIntelligence';
import { PageHeader } from '../../components/ui/PageHeader';
import { Button } from '../../components/ui/Button';
import { Drawer } from '../../components/ui/Drawer';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Badge } from '../../components/ui/Badge';
import { Card } from '../../components/ui/Card';

const OrderFormDrawer: React.FC<{ isOpen: boolean; onClose: () => void; onSave: (order: Order) => void }> = ({ isOpen, onClose, onSave }) => {
  const recipes = useDataStore(s => s.recipes);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [channel, setChannel] = useState<'manual' | 'whatsapp' | 'catalog' | 'instagram'>('manual');
  const [recipeId, setRecipeId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [price, setPrice] = useState(0);
  const [advance, setAdvance] = useState(0);

  const handleRecipeChange = (id: string) => {
    setRecipeId(id);
    const r = recipes.find(rec => rec.id === id);
    if (r) {
      setPrice(r.sale_price * quantity);
      setAdvance((r.sale_price * quantity) / 2);
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
    <Drawer isOpen={isOpen} onClose={onClose} title="Nuevo Pedido" width="lg">
      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="p-4 bg-gray-50/50">
          <h3 className="font-poppins font-bold text-sm mb-4 text-text">Información del Cliente</h3>
          <div className="space-y-4">
            <Input label="Nombre del cliente *" required value={customerName} onChange={e => setCustomerName(e.target.value)} placeholder="Ej. Juan Pérez" />
            <div className="grid grid-cols-2 gap-4">
              <Input label="Teléfono" value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} placeholder="10 dígitos" />
              <Select 
                label="Canal de Venta" 
                value={channel} 
                onChange={e => setChannel(e.target.value as any)}
                options={[
                  { label: 'Mostrador / Manual', value: 'manual' },
                  { label: 'WhatsApp', value: 'whatsapp' },
                  { label: 'Instagram', value: 'instagram' },
                  { label: 'Catálogo', value: 'catalog' }
                ]}
              />
            </div>
            <Input type="date" label="Fecha de Entrega" value={deliveryDate} onChange={e => setDeliveryDate(e.target.value)} />
          </div>
        </Card>
        
        <Card className="p-4 bg-gray-50/50">
          <h3 className="font-poppins font-bold text-sm mb-4 text-text">Detalle del Producto</h3>
          <div className="space-y-4">
            <Select 
              label="Receta *" 
              required 
              value={recipeId} 
              onChange={e => handleRecipeChange(e.target.value)}
              options={[{ label: '— Seleccionar —', value: '' }, ...recipes.map(r => ({ label: r.name, value: r.id }))]}
            />
            <Input type="number" label="Cantidad" min="1" required value={quantity} onChange={e => handleQuantityChange(Number(e.target.value))} />
          </div>
        </Card>

        <Card className="p-4 bg-primary/5 border-primary/20">
          <h3 className="font-poppins font-bold text-sm mb-4 text-primary-dark">Resumen de Pago</h3>
          <div className="grid grid-cols-2 gap-4">
            <Input type="number" label="Precio Total (MXN)" required value={price} onChange={e => setPrice(Number(e.target.value))} className="font-bold" />
            <Input type="number" label="Anticipo Recibido (MXN)" required value={advance} onChange={e => setAdvance(Number(e.target.value))} />
          </div>
        </Card>

        <div className="flex gap-3 pt-4 border-t border-border mt-auto sticky bottom-0 bg-white pb-4">
          <Button type="button" variant="ghost" onClick={onClose} fullWidth>Cancelar</Button>
          <Button type="submit" variant="primary" fullWidth>Confirmar Pedido</Button>
        </div>
      </form>
    </Drawer>
  );
};

const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'Pendiente', production: 'En Producción',
  ready: 'Listo', delivered: 'Entregado', cancelled: 'Cancelado',
};

const STATUS_BADGE: Record<OrderStatus, string> = {
  pending: 'warning', production: 'info',
  ready: 'primary', delivered: 'success', cancelled: 'danger',
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
  const updateStoreOrder = useDataStore(s => s.updateOrder);
  const deleteStoreOrder = useDataStore(s => s.deleteOrder);
  const addStoreOrder = useDataStore(s => s.addOrder);
  
  const [view, setView] = useState<'list' | 'kanban'>('list');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [savedView, setSavedView] = useState<'all' | 'today' | 'pending' | 'production' | 'late'>('all');
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isNewDrawerOpen, setIsNewDrawerOpen] = useState(false);
  const { toast } = useToast();
  
  const { productionInsight } = useOperationalIntelligence();

  const filtered = orders.filter(o => {
    const matchSearch = o.customer_name.toLowerCase().includes(search.toLowerCase()) || o.folio.toLowerCase().includes(search.toLowerCase());
    
    // View logic
    let matchView = true;
    if (savedView === 'today') {
      matchView = o.delivery_date ? isToday(new Date(o.delivery_date)) : false;
    } else if (savedView === 'pending') {
      matchView = o.status === 'pending';
    } else if (savedView === 'production') {
      matchView = o.status === 'production';
    } else if (savedView === 'late') {
      matchView = o.delivery_date ? isBefore(new Date(o.delivery_date), startOfDay(new Date())) && !['ready', 'delivered', 'cancelled'].includes(o.status) : false;
    }

    const matchStatus = statusFilter === 'all' || o.status === statusFilter;
    return matchSearch && matchStatus && matchView;
  });

  const toggleSelection = (id: string) => {
    setSelectedOrders(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const toggleAll = () => {
    if (selectedOrders.length === filtered.length) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(filtered.map(o => o.id));
    }
  };

  const handleBulkStatus = (status: OrderStatus) => {
    if (!status) return;
    selectedOrders.forEach(id => updateStoreOrder(id, { status }));
    setSelectedOrders([]);
    toast.success(`${selectedOrders.length} pedidos actualizados a ${STATUS_LABELS[status]}`);
  };

  const handleBulkDelete = () => {
    if (window.confirm(`¿Estás seguro de eliminar ${selectedOrders.length} pedidos?`)) {
      selectedOrders.forEach(id => deleteStoreOrder(id));
      setSelectedOrders([]);
      toast.success('Pedidos eliminados');
    }
  };

  const onDragEnd = async (result: DropResult) => {
    if (!result.destination) return;
    const newStatus = result.destination.droppableId as OrderStatus;
    const id = result.draggableId;
    updateStoreOrder(id, { status: newStatus });
  };

  const updateStatus = async (id: string, status: OrderStatus) => {
    updateStoreOrder(id, { status });
    toast.success('Estado actualizado');
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    deleteStoreOrder(deleteId);
    setIsDeleting(false);
    setDeleteId(null);
    toast.success('Pedido eliminado');
  };

  return (
    <div className="max-w-7xl mx-auto pb-12">
      <PageHeader
        title="Pedidos"
        description={`Gestiona ${orders.length} pedidos registrados`}
        primaryAction={<Button onClick={() => setIsNewDrawerOpen(true)} leftIcon={<Plus size={18} />}>Nuevo Pedido</Button>}
        secondaryAction={<Button variant="outline" onClick={() => navigate('/pedidos/bitacora')} leftIcon={<List size={18} />}>Bitácora</Button>}
      />

      {productionInsight.risk === 'Alto' && (
        <div className="mb-6 bg-danger/10 border border-danger/30 rounded-xl p-4 flex items-start gap-3">
          <div className="mt-0.5"><div className="w-2 h-2 rounded-full bg-danger animate-pulse" /></div>
          <div>
            <h4 className="text-danger-dark font-bold text-sm">Alerta de Capacidad de Producción</h4>
            <p className="text-sm text-danger-dark/80 mt-1">
              Tienes <strong>{productionInsight.tomorrowLoad}</strong> pedidos programados para entregar mañana, superando tu promedio histórico de <strong>{productionInsight.historicalCapacity}</strong>. Considera asignar turnos extra o rechazar nuevos pedidos urgentes.
            </p>
          </div>
        </div>
      )}

      <Card className="mb-6 p-4">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex w-full md:w-auto gap-4 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted w-4 h-4" />
              <input 
                className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-border rounded-lg text-sm outline-none focus:border-primary transition-colors"
                placeholder="Buscar por cliente o folio..." 
                value={search} 
                onChange={e => setSearch(e.target.value)} 
              />
            </div>
            <select 
              className="bg-gray-50 border border-border rounded-lg px-4 py-2 text-sm outline-none focus:border-primary cursor-pointer hidden md:block"
              value={statusFilter} 
              onChange={e => setStatusFilter(e.target.value)}
            >
              <option value="all">Todos los estados</option>
              {Object.entries(STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>
          
          <div className="bg-bg p-1 rounded-lg border border-border hidden md:flex">
            <button onClick={() => setView('list')} className={`p-2 rounded-md transition-colors ${view === 'list' ? 'bg-primary text-white shadow' : 'text-muted hover:text-text'}`}><List size={18} /></button>
            <button onClick={() => setView('kanban')} className={`p-2 rounded-md transition-colors ${view === 'kanban' ? 'bg-primary text-white shadow' : 'text-muted hover:text-text'}`}><LayoutGrid size={18} /></button>
          </div>
        </div>

        {/* Saved Views Chips */}
        <div className="flex gap-2 mt-4 overflow-x-auto pb-2 custom-scrollbar">
          {[
            { id: 'all', label: 'Todos' },
            { id: 'today', label: 'Entregas Hoy' },
            { id: 'pending', label: 'Pendientes' },
            { id: 'production', label: 'En Producción' },
            { id: 'late', label: 'Atrasados' },
          ].map(v => (
            <button
              key={v.id}
              onClick={() => setSavedView(v.id as any)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors border ${
                savedView === v.id 
                  ? 'bg-primary text-white border-primary' 
                  : 'bg-white text-muted border-border hover:bg-bg hover:text-text'
              }`}
            >
              {v.label}
            </button>
          ))}
        </div>
      </Card>

      {/* LIST VIEW (Responsive: Table on Desktop, Cards on Mobile) */}
      {view === 'list' && (
        <div className="grid gap-4 md:block">
          {filtered.length === 0 ? (
            <div className="text-center p-12 text-muted border border-dashed rounded-xl border-border bg-surface/50">
              No se encontraron pedidos.
            </div>
          ) : (
            <>
              {/* Mobile view */}
              <div className="md:hidden space-y-4">
                {filtered.map(order => (
                  <Card key={order.id} className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <span className="text-primary font-bold text-sm">{order.folio}</span>
                        <h3 className="font-bold text-text mt-1">{order.customer_name}</h3>
                      </div>
                      <Badge variant={STATUS_BADGE[order.status] as any}>{STATUS_LABELS[order.status]}</Badge>
                    </div>
                    <div className="space-y-2 text-sm mb-4">
                      <div className="flex items-center gap-2 text-muted"><Calendar size={14} /> {order.delivery_date ? format(new Date(order.delivery_date), 'dd MMM yyyy', { locale: es }) : 'Sin fecha'}</div>
                      <div className="flex items-center gap-2 text-muted"><Phone size={14} /> {order.customer_phone || 'Sin teléfono'}</div>
                      <div className="flex items-center gap-2 font-medium text-text"><CreditCard size={14} className="text-muted"/> Total: ${order.total.toLocaleString()}</div>
                    </div>
                    <div className="flex gap-2">
                      <select className="flex-1 bg-gray-50 border border-border rounded-lg px-2 text-sm min-h-[44px]" value={order.status} onChange={e => updateStatus(order.id, e.target.value as OrderStatus)}>
                        {Object.entries(STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                      </select>
                      <Button variant="danger" size="sm" onClick={() => setDeleteId(order.id)} className="min-h-[44px] min-w-[44px] p-0 flex items-center justify-center"><Trash2 size={18} /></Button>
                    </div>
                  </Card>
                ))}
              </div>
              
              {/* Desktop view */}
              <div className="hidden md:block bg-surface border border-border rounded-xl overflow-hidden">
                <table className="w-full text-left text-sm">
                  <thead className="bg-bg border-b border-border text-muted">
                    <tr>
                      <th className="p-4 w-12">
                        <input 
                          type="checkbox" 
                          className="rounded border-gray-300 text-primary focus:ring-primary cursor-pointer w-4 h-4"
                          checked={filtered.length > 0 && selectedOrders.length === filtered.length}
                          onChange={toggleAll}
                        />
                      </th>
                      <th className="p-4 font-semibold">Folio</th>
                      <th className="p-4 font-semibold">Cliente</th>
                      <th className="p-4 font-semibold">Entrega</th>
                      <th className="p-4 font-semibold">Estado</th>
                      <th className="p-4 font-semibold">Total</th>
                      <th className="p-4 font-semibold">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filtered.map(order => (
                      <tr key={order.id} className={`transition-colors ${selectedOrders.includes(order.id) ? 'bg-primary/5' : 'hover:bg-bg/50'}`}>
                        <td className="p-4">
                          <input 
                            type="checkbox" 
                            className="rounded border-gray-300 text-primary focus:ring-primary cursor-pointer w-4 h-4"
                            checked={selectedOrders.includes(order.id)}
                            onChange={() => toggleSelection(order.id)}
                          />
                        </td>
                        <td className="p-4 font-bold text-primary">{order.folio}</td>
                        <td className="p-4">
                          <div className="font-medium text-text">{order.customer_name}</div>
                          <div className="text-xs text-muted mt-0.5">{order.customer_phone}</div>
                        </td>
                        <td className="p-4 text-muted">{order.delivery_date ? format(new Date(order.delivery_date), 'dd MMM yyyy', { locale: es }) : '—'}</td>
                        <td className="p-4"><Badge variant={STATUS_BADGE[order.status] as any}>{STATUS_LABELS[order.status]}</Badge></td>
                        <td className="p-4 font-semibold">${order.total.toLocaleString('es-MX')}</td>
                        <td className="p-4">
                          <div className="flex gap-2">
                            <select className="bg-gray-50 border border-border rounded-lg px-2 text-sm outline-none" value={order.status} onChange={e => updateStatus(order.id, e.target.value as OrderStatus)}>
                              {Object.entries(STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                            </select>
                            <button onClick={() => setDeleteId(order.id)} className="p-2 text-danger hover:bg-danger/10 rounded-lg transition-colors"><Trash2 size={16} /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      )}

      {/* KANBAN VIEW */}
      {view === 'kanban' && (
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar">
            {KANBAN_COLUMNS.map(col => {
              const colOrders = filtered.filter(o => o.status === col.id);
              return (
                <div key={col.id} className="min-w-[300px] w-[300px] flex-shrink-0">
                  <div className="flex items-center justify-between mb-3 px-1">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: col.color }} />
                      <h3 className="font-poppins font-bold text-text">{col.label}</h3>
                    </div>
                    <Badge variant="default">{colOrders.length}</Badge>
                  </div>
                  <Droppable droppableId={col.id}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`min-h-[400px] p-3 rounded-xl border transition-colors ${snapshot.isDraggingOver ? 'bg-secondary-light/50 border-secondary' : 'bg-gray-50 border-dashed border-border'}`}
                      >
                        {colOrders.map((order, index) => (
                          <Draggable key={order.id} draggableId={order.id} index={index}>
                            {(drag, snap) => (
                              <div
                                ref={drag.innerRef}
                                {...drag.draggableProps}
                                {...drag.dragHandleProps}
                                className={`bg-white p-4 rounded-xl border border-border shadow-sm mb-3 group cursor-grab active:cursor-grabbing transition-transform ${snap.isDragging ? 'rotate-2 shadow-xl border-primary' : 'hover:border-secondary'}`}
                              >
                                <div className="flex justify-between items-start mb-2">
                                  <span className="text-xs font-bold text-primary">{order.folio}</span>
                                  <Badge variant={STATUS_BADGE[order.status] as any}>{STATUS_LABELS[order.status]}</Badge>
                                </div>
                                <h4 className="font-bold text-text text-sm mb-2">{order.customer_name}</h4>
                                <div className="flex justify-between items-center mt-4">
                                  <span className="text-xs text-muted flex items-center gap-1"><Calendar size={12}/> {order.delivery_date ? format(new Date(order.delivery_date), 'dd MMM') : '—'}</span>
                                  <span className="font-bold text-sm text-text">${order.total.toLocaleString()}</span>
                                </div>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                        {colOrders.length === 0 && (
                          <div className="text-center py-8 text-sm text-muted font-inter">Arrastra aquí</div>
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

      {/* FLOATING ACTION BAR FOR BULK ACTIONS */}
      {selectedOrders.length > 0 && view === 'list' && (
        <div className="fixed bottom-20 md:bottom-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-4 z-50 animate-[slideUp_0.2s_ease]">
          <span className="font-bold text-sm whitespace-nowrap">{selectedOrders.length} seleccionados</span>
          <div className="w-px h-4 bg-gray-700" />
          <select 
            className="bg-gray-800 border-none outline-none text-sm text-white cursor-pointer px-2 py-1 rounded" 
            onChange={(e) => handleBulkStatus(e.target.value as OrderStatus)}
            value=""
          >
            <option value="" disabled>Cambiar estado a...</option>
            {Object.entries(STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
          <div className="w-px h-4 bg-gray-700" />
          <button onClick={handleBulkDelete} className="text-red-400 hover:text-red-300 transition-colors flex items-center gap-1 text-sm font-medium">
            <Trash2 size={16} /> Eliminar
          </button>
        </div>
      )}

      <AlertDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        isLoading={isDeleting}
        title="Eliminar pedido"
        description="Esta acción no se puede deshacer. ¿Deseas continuar?"
      />

      <OrderFormDrawer 
        isOpen={isNewDrawerOpen}
        onClose={() => setIsNewDrawerOpen(false)}
        onSave={(o) => {
          addStoreOrder(o);
          setIsNewDrawerOpen(false);
          toast.success('Pedido creado');
        }}
      />
    </div>
  );
};
