import React from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { ShoppingBag, DollarSign, BookOpen, AlertTriangle, Calendar, ChevronRight, Activity, Zap, Clock } from 'lucide-react';
import { KPICard } from '../components/dashboard/KPICard';
import { RevenueChart } from '../components/dashboard/RevenueChart';
import { useDataStore } from '../store/useDataStore';
import { useOperationalIntelligence } from '../hooks/useOperationalIntelligence';
import { PageHeader } from '../components/ui/PageHeader';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const orders = useDataStore(s => s.orders);
  const recipes = useDataStore(s => s.recipes);
  const ingredients = useDataStore(s => s.ingredients);
  const { recommendations } = useOperationalIntelligence();

  const currentDate = format(new Date(), "EEEE, d 'de' MMMM, yyyy", { locale: es });

  const activeOrdersCount = orders.filter(o => o.status === 'pending' || o.status === 'ready' || o.status === 'production').length;
  const delayedOrders = orders.filter(o => o.status === 'pending' && new Date(o.delivery_date!) < new Date());
  const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
  const lowStockCount = ingredients.filter(i => i.stock <= i.min_stock).length;

  const mockRevenueData = Array.from({ length: 30 }, (_, i) => {
    const d = new Date(Date.now() - (29 - i) * 86400000);
    const dateStr = d.toLocaleDateString('es-MX', { day: '2-digit', month: 'short' });
    const dayOrders = orders.filter(o => new Date(o.created_at).toDateString() === d.toDateString());
    return {
      date: dateStr,
      revenue: dayOrders.reduce((sum, o) => sum + o.total, 0),
      orders: dayOrders.length,
    };
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(value);
  };

  const upcomingDeliveries = [...orders]
    .filter(o => o.status !== 'delivered' && o.status !== 'cancelled')
    .sort((a, b) => new Date(a.delivery_date ?? '').getTime() - new Date(b.delivery_date ?? '').getTime())
    .slice(0, 4);

  const recentActivity = [
    { id: 1, text: 'Nuevo pedido MD-10294 de Ana L.', time: 'Hace 10 min' },
    { id: 2, text: 'Stock bajo: Harina de Trigo (5kg)', time: 'Hace 1 hora', type: 'alert' },
    { id: 3, text: 'Pedido MD-10290 marcado como Listo', time: 'Hace 2 horas' },
  ];

  const getStatusBadgeVariant = (status: string) => {
    switch(status) {
      case 'pending': return 'warning';
      case 'production': return 'info';
      case 'ready': return 'primary';
      case 'delivered': return 'success';
      case 'cancelled': return 'danger';
      default: return 'default';
    }
  };

  const translateStatus = (status: string) => {
    const map: Record<string, string> = {
      'pending': 'Pendiente', 'production': 'En Producción',
      'ready': 'Listo', 'delivered': 'Entregado', 'cancelled': 'Cancelado',
    };
    return map[status] || status;
  };

  return (
    <div className="max-w-7xl mx-auto min-h-screen pb-12">
      <PageHeader 
        title="Centro de Operaciones" 
        description={currentDate.charAt(0).toUpperCase() + currentDate.slice(1)}
        primaryAction={<Button onClick={() => navigate('/pedidos')} leftIcon={<ShoppingBag size={18} />}>Ver Pedidos</Button>}
        secondaryAction={<Button variant="outline" onClick={() => navigate('/cotizador')} leftIcon={<Zap size={18} />}>Cotizar Rápido</Button>}
      />

      {/* Resumen */}
      <section className="mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <KPICard title="Pedidos Activos" value={activeOrdersCount} icon={ShoppingBag} trend={12.5} trendLabel="vs mes anterior" onClick={() => navigate('/pedidos')} color="var(--color-primary)" />
          <KPICard title="Facturado este mes" value={formatCurrency(totalRevenue)} icon={DollarSign} trend={8.2} trendLabel="vs mes anterior" onClick={() => navigate('/pedidos/bitacora')} color="var(--color-primary-dark)" />
          <KPICard title="Recetas" value={recipes.length} icon={BookOpen} trend={3.1} trendLabel="nuevas este mes" onClick={() => navigate('/recetas')} color="var(--color-secondary)" />
          <KPICard title="Stock Crítico" value={lowStockCount} icon={AlertTriangle} trend={-5.0} trendLabel="items bajos" onClick={() => navigate('/inventario?filter=low_stock')} color="#EF4444" />
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Gráfico */}
        <div className="lg:col-span-2">
          <Card variant="glass" className="p-6 h-full flex flex-col">
            <h2 className="text-xl font-bold text-text font-poppins mb-6">Ingresos y Volumen</h2>
            <div className="flex-1 min-h-[300px]">
              <RevenueChart data={mockRevenueData} />
            </div>
          </Card>
        </div>

        {/* Atención Requerida */}
        <div className="space-y-6">
          <Card variant="solid" className="p-6 border-l-4 border-l-danger">
            <h2 className="text-lg font-bold text-text font-poppins mb-4 flex items-center gap-2">
              <AlertTriangle className="text-danger" size={20} /> Atención Requerida
            </h2>
            <div className="space-y-3">
              {delayedOrders.length > 0 && (
                <div className="flex justify-between items-center bg-danger/5 p-3 rounded-xl border border-danger/20">
                  <span className="text-sm font-medium text-danger-dark">{delayedOrders.length} pedidos atrasados</span>
                  <Button variant="ghost" size="sm" onClick={() => navigate('/pedidos')}>Revisar</Button>
                </div>
              )}
              {lowStockCount > 0 && (
                <div className="flex justify-between items-center bg-warning/10 p-3 rounded-xl border border-warning/20">
                  <span className="text-sm font-medium text-warning-dark">{lowStockCount} insumos críticos</span>
                  <Button variant="ghost" size="sm" onClick={() => navigate('/inventario')}>Comprar</Button>
                </div>
              )}
              {delayedOrders.length === 0 && lowStockCount === 0 && (
                <p className="text-sm text-muted">Todo está en orden.</p>
              )}
            </div>
          </Card>

          <Card variant="glass" className="p-6">
            <h2 className="text-lg font-bold text-text font-poppins mb-4 flex items-center gap-2">
              <Activity className="text-primary" size={20} /> Actividad Reciente
            </h2>
            <div className="space-y-4">
              {recentActivity.map(act => (
                <div key={act.id} className="flex gap-3">
                  <div className="mt-0.5">
                    {act.type === 'alert' ? <AlertTriangle size={16} className="text-warning" /> : <Clock size={16} className="text-muted" />}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-text">{act.text}</p>
                    <p className="text-xs text-muted mt-0.5">{act.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Próximas Entregas */}
        <Card variant="solid" className="overflow-hidden flex flex-col">
          <div className="p-6 border-b border-border flex justify-between items-center">
            <h2 className="text-xl font-bold text-text font-poppins flex items-center gap-2">
              <Calendar className="text-secondary" size={20} /> Próximas Entregas
            </h2>
            <Button variant="ghost" size="sm" onClick={() => navigate('/pedidos')} rightIcon={<ChevronRight size={16} />}>
              Ver agenda
            </Button>
          </div>
          <div className="p-2 flex-1">
            {upcomingDeliveries.map((order) => (
              <div key={order.id} className="flex items-center justify-between p-4 rounded-xl hover:bg-bg transition-colors cursor-pointer group">
                <div>
                  <h4 className="font-semibold text-text font-inter">{order.customer_name}</h4>
                  <p className="text-sm text-muted font-inter mt-1">{order.delivery_date ? format(new Date(order.delivery_date), "EEEE d 'a las' h:mm a", { locale: es }) : '—'}</p>
                </div>
                <Badge variant={getStatusBadgeVariant(order.status) as any}>{translateStatus(order.status)}</Badge>
              </div>
            ))}
          </div>
        </Card>

        {/* Recomendaciones (IA Ready) */}
        <Card variant="glass" className="p-6 bg-gradient-to-br from-bg to-secondary-light/30 border-secondary/30 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <h2 className="text-xl font-bold text-text font-poppins mb-2 flex items-center gap-2">
            <Zap className="text-primary" size={20} /> Sugerencias Inteligentes
          </h2>
          <p className="text-sm text-muted mb-6">Marea procesa tus datos operativos para darte recomendaciones.</p>
          
          <div className="space-y-3">
            {recommendations.length > 0 ? (
              recommendations.map(rec => (
                <div key={rec.id} className="bg-white/80 p-4 rounded-xl border border-white/50 shadow-sm relative overflow-hidden">
                  <div className={`absolute left-0 top-0 bottom-0 w-1 ${rec.type === 'production' ? 'bg-danger' : rec.type === 'inventory' ? 'bg-warning' : 'bg-success'}`} />
                  <p className="text-sm font-bold text-text flex items-center gap-2">{rec.title}</p>
                  <p className="text-xs font-medium text-text mt-2">{rec.evidence}</p>
                  <p className="text-xs text-muted mt-2"><strong className="text-text">Acción sugerida:</strong> {rec.action}</p>
                  <p className="text-xs text-primary-dark mt-1 font-medium">{rec.impact}</p>
                </div>
              ))
            ) : (
              <div className="bg-white/60 p-4 rounded-xl border border-white text-center">
                <p className="text-sm text-muted">Todo opera con normalidad. Sigue así.</p>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};
